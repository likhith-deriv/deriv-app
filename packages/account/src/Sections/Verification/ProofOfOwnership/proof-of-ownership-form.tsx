import React from 'react';
import classNames from 'classnames';
import { Form, Formik, FormikErrors, FormikHelpers } from 'formik';
import DocumentUploader from '@binary-com/binary-document-uploader';
import { Button } from '@deriv/components';
import { readFiles, WS, DOCUMENT_TYPE } from '@deriv/shared';
import { TCoreStores } from '@deriv/stores/types';
import { Localize, localize } from '@deriv/translations';
import FormFooter from '../../../Components/form-footer';
import FormBody from '../../../Components/form-body';
import FormSubHeader from '../../../Components/form-sub-header';
import FormBodySection from '../../../Components/form-body-section';
import Card from '../../../Containers/proof-of-ownership/card';
import { TPaymentMethod, TPaymentMethodInfo, TProofOfOwnershipFormValue } from '../../../Types';
import { isValidPaymentMethodIdentifier, isValidFile } from './validation';

type TProofOfOwnershipFormProps = {
    client_email: TCoreStores['client']['email'];
    grouped_payment_method_data: Partial<Record<TPaymentMethod, TPaymentMethodInfo>>;
    is_mobile: TCoreStores['ui']['is_mobile'];
    refreshNotifications: TCoreStores['notifications']['refreshNotifications'];
    updateAccountStatus: TCoreStores['client']['updateAccountStatus'];
};

type TProofOfOwnershipErrors = Partial<
    Record<TPaymentMethod, { payment_method_identifier?: string; files?: Array<string> }>
>;

const ProofOfOwnershipForm = ({
    client_email,
    grouped_payment_method_data,
    is_mobile,
    refreshNotifications,
    updateAccountStatus,
}: TProofOfOwnershipFormProps) => {
    const grouped_payment_method_data_keys = Object.keys(grouped_payment_method_data) as Array<TPaymentMethod>;

    let initial_values = {};
    const form_ref = React.useRef(null);

    const getScrollOffset = React.useCallback(
        (items_count = 0) => {
            if (is_mobile) return '200px';
            if (items_count <= 2) return '0px';
            return '80px';
        },
        [is_mobile]
    );

    const fileReadErrorMessage = (filename: string) => {
        return localize('Unable to read file {{name}}', { name: filename });
    };

    if (grouped_payment_method_data_keys) {
        const default_value = {
            documents_required: 0,
            id: 0,
            identifier_type: '',
            is_generic_pm: false,
            payment_method_identifier: '',
            files: [],
        };
        const form_value = grouped_payment_method_data_keys.reduce((acc, payment_method) => {
            const { documents_required, is_generic_pm } = grouped_payment_method_data[payment_method];
            acc[payment_method] = { ...default_value, documents_required, is_generic_pm };
            return acc;
        }, {});

        initial_values = { ...initial_values, ...form_value };
    }

    const validateFields = (values: TProofOfOwnershipFormValue) => {
        let errors: FormikErrors<TProofOfOwnershipErrors> = {};

        Object.keys(values).forEach(card_key => {
            const card_data = values[card_key as TPaymentMethod];
            const is_payment_method_identifier_provided =
                card_data.is_generic_pm || card_data.payment_method_identifier.trim()?.length > 0;
            const are_files_uploaded =
                card_data?.files?.filter(file => file?.name).length === card_data?.documents_required;

            if (are_files_uploaded && !is_payment_method_identifier_provided) {
                errors = {
                    ...errors,
                    [card_key as TPaymentMethod]: {
                        ...(errors[card_key as TPaymentMethod] ?? {}),
                        payment_method_identifier: localize('Please complete this field.'),
                    },
                };
            } else {
                delete errors[card_key]?.payment_method_identifier;
            }

            if (is_payment_method_identifier_provided) {
                console.log('Check is_payment_method_identifier_provided');
                const verify_payment_method_identifier = isValidPaymentMethodIdentifier(
                    card_data.payment_method_identifier.trim(),
                    card_data.identifier_type
                );
                if (verify_payment_method_identifier) {
                    errors = {
                        ...errors,
                        [card_key as TPaymentMethod]: {
                            ...(errors[card_key as TPaymentMethod] ?? {}),
                            payment_method_identifier: verify_payment_method_identifier,
                        },
                    };
                } else {
                    delete errors[card_key]?.payment_method_identifier;
                }
                if (!card_data?.files?.length) {
                    errors = {
                        ...errors,
                        [card_key as TPaymentMethod]: {
                            ...(errors[card_key as TPaymentMethod] ?? {}),
                            files: [],
                        },
                    };
                }
            }

            card_data?.files?.forEach((file, i) => {
                if (!file?.name) {
                    return;
                }
                const verify_file = isValidFile(file);
                if (verify_file) {
                    errors = {
                        ...errors,
                        [card_key as TPaymentMethod]: {
                            ...(errors[card_key as TPaymentMethod] ?? {}),
                            files: { ...errors[card_key as TPaymentMethod]?.files, [i]: verify_file },
                        },
                    };
                } else {
                    delete errors?.[card_key]?.files?.[i];
                }
            });
        });
        return errors;
    };

    const handleFormSubmit = (
        values: TProofOfOwnershipFormValue,
        action: FormikHelpers<TProofOfOwnershipFormValue>
    ) => {
        console.log('Form submission', { values, action });
        const { setFieldError, setStatus } = action;
        try {
            setStatus({ is_btn_loading: true });
            const uploader = new DocumentUploader({ connection: WS.getSocket() });

            Object.keys(values).forEach(async card_key => {
                const payment_method_details = values[card_key];
                if (payment_method_details.files?.length) {
                    const processed_files = await readFiles(payment_method_details.files, fileReadErrorMessage, {
                        documentType: DOCUMENT_TYPE.proof_of_ownership,
                        proof_of_ownership: {
                            details: {
                                email: client_email,
                                payment_identifier: payment_method_details.payment_method_identifier,
                            },
                            id: payment_method_details.id,
                        },
                    });
                    processed_files.forEach(async (processed_file, index) => {
                        const response = await uploader.upload(processed_file);
                        const upload_error = [];
                        if (response.warning) {
                            if (response.warning.trim() === 'DuplicateUpload') {
                                upload_error[index] = response.message;
                                setFieldError(card_key, { files: upload_error });
                            }
                        }
                    });
                }
            });
            setStatus({ is_btn_loading: false });
            console.log('Called update functions');
            updateAccountStatus();
            refreshNotifications();
        } catch (err) {
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
            {({ isValid, dirty, status }) => (
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
                                            index={index}
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
                            className={classNames('account-form__footer-btn')}
                            is_disabled={!dirty || !isValid}
                            data-testid={'submit-button'}
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
