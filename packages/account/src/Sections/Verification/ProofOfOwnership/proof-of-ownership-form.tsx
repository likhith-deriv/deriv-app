import React from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import DocumentUploader from '@binary-com/binary-document-uploader';
import { Button } from '@deriv/components';
import { readFiles, WS, UPLOAD_FILE_TYPE } from '@deriv/shared';
import { TCoreStores } from '@deriv/stores/types';
import { Localize, localize } from '@deriv/translations';
import FormFooter from '../../../Components/form-footer';
import FormBody from '../../../Components/form-body';
import FormSubHeader from '../../../Components/form-sub-header';
import FormBodySection from '../../../Components/form-body-section';
import Card from '../../../Containers/proof-of-ownership/card';
import { TPaymentMethod, TPaymentMethodInfo, TProofOfOwnershipData, TProofOfOwnershipFormValue } from '../../../Types';
import { isValidPaymentMethodIdentifier, isValidFile } from './validation';

type TProofOfOwnershipFormProps = {
    client_email: TCoreStores['client']['email'];
    grouped_payment_method_data: Partial<Record<TPaymentMethod, TPaymentMethodInfo>>;
    is_mobile: TCoreStores['ui']['is_mobile'];
    refreshNotifications: TCoreStores['notifications']['refreshNotifications'];
    updateAccountStatus: TCoreStores['client']['updateAccountStatus'];
};

type TProofOfOwnershipErrors = Record<
    TPaymentMethod,
    Array<{ payment_method_identifier?: string; files?: Array<string> }>
>;

const ProofOfOwnershipForm = ({
    client_email,
    grouped_payment_method_data,
    is_mobile,
    refreshNotifications,
    updateAccountStatus,
}: TProofOfOwnershipFormProps) => {
    const grouped_payment_method_data_keys = Object.keys(grouped_payment_method_data) as Array<TPaymentMethod>;

    let initial_values: Partial<TProofOfOwnershipFormValue> = {};
    const form_ref = React.useRef(null);

    const getScrollOffset = React.useCallback(
        (items_count = 0) => {
            if (is_mobile) return '20rem';
            if (items_count <= 2) return '0rem';
            return '8rem';
        },
        [is_mobile]
    );

    const fileReadErrorMessage = (filename: string) => {
        return localize('Unable to read file {{name}}', { name: filename });
    };

    if (grouped_payment_method_data_keys) {
        const default_value: TProofOfOwnershipData = {
            documents_required: 0,
            id: 0,
            identifier_type: '',
            is_generic_pm: false,
            payment_method_identifier: '',
            files: [],
        };
        const form_value = grouped_payment_method_data_keys.reduce<Partial<TProofOfOwnershipFormValue>>(
            (acc, payment_method) => {
                const documents_required = grouped_payment_method_data[payment_method]?.documents_required;
                const is_generic_pm = grouped_payment_method_data[payment_method]?.is_generic_pm;
                const items = grouped_payment_method_data[payment_method]?.items;
                acc[payment_method] = [];
                items?.forEach(item => {
                    acc[payment_method]?.push({
                        ...default_value,
                        id: item.id,
                        documents_required: documents_required ?? 0,
                        is_generic_pm: is_generic_pm ?? false,
                    });
                });

                return acc;
            },
            {}
        );

        initial_values = { ...initial_values, ...form_value };
    }

    const validateFields = (values: TProofOfOwnershipFormValue) => {
        let errors = {} as TProofOfOwnershipErrors;

        Object.keys(values).forEach(card_key => {
            const card_data = values[card_key as TPaymentMethod];
            card_data?.forEach((payment_method_data, index) => {
                const is_payment_method_identifier_provided =
                    payment_method_data?.is_generic_pm ||
                    !!payment_method_data?.payment_method_identifier.trim()?.length;
                const are_files_uploaded =
                    payment_method_data?.files?.filter(file => file?.name).length ===
                    payment_method_data?.documents_required;
                if (are_files_uploaded && !is_payment_method_identifier_provided) {
                    errors = {
                        ...errors,
                        [card_key]: [...(errors[card_key as TPaymentMethod] ?? [])],
                    };
                    errors[card_key as TPaymentMethod][index] = {
                        ...(errors[card_key as TPaymentMethod][index] ?? {}),
                        payment_method_identifier: localize('Please complete this field.'),
                    };
                } else {
                    delete errors[card_key as TPaymentMethod]?.[index]?.payment_method_identifier;
                }
                if (is_payment_method_identifier_provided) {
                    const verify_payment_method_identifier = isValidPaymentMethodIdentifier(
                        payment_method_data.payment_method_identifier.trim(),
                        payment_method_data.identifier_type
                    );
                    if (verify_payment_method_identifier) {
                        errors = {
                            ...errors,
                            [card_key]: [...(errors[card_key as TPaymentMethod] ?? [])],
                        };
                        errors[card_key as TPaymentMethod][index] = {
                            ...(errors[card_key as TPaymentMethod][index] ?? {}),
                            payment_method_identifier: verify_payment_method_identifier,
                        };
                    } else {
                        delete errors[card_key as TPaymentMethod]?.[index]?.payment_method_identifier;
                    }
                    if (!are_files_uploaded) {
                        errors = {
                            ...errors,
                            [card_key]: [...(errors[card_key as TPaymentMethod] ?? [])],
                        };
                        errors[card_key as TPaymentMethod][index] = {
                            ...(errors[card_key as TPaymentMethod][index] ?? {}),
                            files: [],
                        };
                    }
                }
                payment_method_data?.files?.forEach((file, i) => {
                    if (!file?.name) {
                        return;
                    }
                    const verify_file = isValidFile(file);
                    if (verify_file) {
                        errors = {
                            ...errors,
                            [card_key]: [...(errors[card_key as TPaymentMethod] ?? [])],
                        };
                        errors[card_key as TPaymentMethod][index] = {
                            ...(errors[card_key as TPaymentMethod][index] ?? {}),
                            files: { ...errors[card_key as TPaymentMethod]?.[index]?.files, [i]: verify_file },
                        };
                    } else {
                        delete errors?.[card_key as TPaymentMethod]?.[index]?.files?.[i];
                    }
                });
            });
            if (!errors[card_key as TPaymentMethod]?.length) {
                delete errors[card_key as TPaymentMethod];
            }
        });
        return errors;
    };

    const handleFormSubmit = async (
        values: Partial<TProofOfOwnershipFormValue>,
        action: FormikHelpers<Partial<TProofOfOwnershipFormValue>>
    ) => {
        const { setFieldError, setStatus, resetForm } = action;
        try {
            setStatus({ is_btn_loading: true });
            const uploader = new DocumentUploader({ connection: WS.getSocket() });
            await Object.keys(values).reduce(async (promise, card_key) => {
                await promise;
                const payment_method_details = values[card_key as TPaymentMethod];
                payment_method_details?.reduce(async (promise, payment_method_detail) => {
                    await promise;
                    if (payment_method_detail?.files?.length) {
                        const processed_files = await readFiles(payment_method_detail.files, fileReadErrorMessage, {
                            document_type: UPLOAD_FILE_TYPE.proof_of_ownership,
                            proof_of_ownership: {
                                details: {
                                    email: client_email,
                                    payment_identifier: payment_method_detail.payment_method_identifier,
                                },
                                id: payment_method_detail.id,
                            },
                        });
                        await processed_files.reduce(async (promise, processed_file, index) => {
                            await promise;
                            const response = await uploader.upload(processed_file);
                            const upload_error: Array<string> = [];
                            if (response?.warning) {
                                if (response?.warning?.trim() === 'DuplicateUpload' && response?.message) {
                                    upload_error[index] = response?.message;
                                    setFieldError(card_key, { files: upload_error });
                                }
                            } else {
                                resetForm();
                                updateAccountStatus();
                                refreshNotifications();
                            }
                        }, Promise.resolve());
                    }
                }, Promise.resolve());
            }, Promise.resolve());
        } catch (err) {
            console.warn(err); // eslint-disable-line no-console
        } finally {
            setStatus({ is_btn_loading: false });
        }
    };

    return (
        <Formik
            initialValues={initial_values}
            initialStatus={{ is_btn_loading: false }}
            validate={validateFields}
            innerRef={form_ref}
            onSubmit={handleFormSubmit}
        >
            {({ isValid, dirty, status, values }) => (
                <Form data-testid='dt_poo_form' className='proof-of-ownership'>
                    <FormBody scroll_offset={getScrollOffset(grouped_payment_method_data_keys.length)}>
                        <FormSubHeader title={localize('Please upload the following document(s).')} />
                        <FormBodySection>
                            <fieldset>
                                {grouped_payment_method_data_keys?.map((grouped_payment_method_data_key, index) => (
                                    <div
                                        className='proof-of-ownership__form-content'
                                        key={grouped_payment_method_data_key}
                                    >
                                        {grouped_payment_method_data_keys.length > 1 && (
                                            <div className='proof-of-ownership__progress'>
                                                <div className='proof-of-ownership__progress-number'>{index + 1}</div>
                                                {index !== grouped_payment_method_data_keys.length - 1 && (
                                                    <div className='proof-of-ownership__progress-bar' />
                                                )}
                                            </div>
                                        )}
                                        <Card
                                            details={
                                                grouped_payment_method_data[
                                                    grouped_payment_method_data_key
                                                ] as TPaymentMethodInfo
                                            }
                                        />
                                    </div>
                                ))}
                            </fieldset>
                        </FormBodySection>
                    </FormBody>
                    <FormFooter>
                        <Button
                            type='submit'
                            className='account-form__footer-btn'
                            is_disabled={!dirty || !isValid}
                            has_effect
                            large
                            primary
                            is_loading={status.is_btn_loading}
                        >
                            <Localize i18n_default_text='Submit' />
                        </Button>
                    </FormFooter>
                </Form>
            )}
        </Formik>
    );
};

export default ProofOfOwnershipForm;
