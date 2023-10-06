import React from 'react';
import classNames from 'classnames';
import { Form, Formik, FormikHelpers, FormikValues } from 'formik';
import {
    GetAccountStatus,
    GetSettings,
    IdentityVerificationAddDocumentResponse,
    ResidenceList,
} from '@deriv/api-types';
import { Button, DesktopWrapper, HintBox, Loading, Text } from '@deriv/components';
import {
    filterObjProperties,
    getIDVNotApplicableOption,
    getPropertyValue,
    idv_error_statuses,
    isEmptyObject,
    isMobile,
    removeEmptyPropertiesFromObject,
    TIDVErrorStatus,
    toMoment,
    WS,
} from '@deriv/shared';
import { Localize, localize } from '@deriv/translations';
import PoiNameExample from '../../../../Assets/ic-poi-name-example.svg';
import PoiDobExample from '../../../../Assets/ic-poi-dob-example.svg';
import PoiNameDobExample from '../../../../Assets/ic-poi-name-dob-example.svg';
import FormBody from '../../../form-body';
import IDVForm from '../../../forms/idv-form';
import FormFooter from '../../../form-footer';
import FormSubHeader from '../../../form-sub-header';
import PersonalDetailsForm from '../../../forms/personal-details-form.jsx';
import {
    getIDVDocumentType,
    isAdditionalDocumentValid,
    isDocumentNumberValid,
    isDocumentTypeValid,
    makeSettingsRequest,
    shouldHideHelperImage,
    validate,
    validateName,
} from '../../../../Helpers/utils';
import { GENERIC_ERROR_MESSAGE, DUPLICATE_ACCOUNT_ERROR_MESSAGE } from '../../../../Configs/poi-error-config';
import { API_ERROR_CODES } from '../../../../Constants/api-error-codes';
import { TIDVFormValues, TPersonalDetailsForm } from '../../../../Types';
import LoadErrorMessage from '../../../load-error-message';

type TRestState = {
    api_error: string;
    errors?: boolean;
    form_initial_values: TIdvFailedForm;
    changeable_fields: string[];
};

type TIdvFailed = {
    account_settings: GetSettings;
    getChangeableFields: () => string[];
    handleSubmit: () => void;
    is_from_external: boolean;
    mismatch_status: TIDVErrorStatus;
    residence_list: ResidenceList;
    latest_status: DeepRequired<GetAccountStatus>['authentication']['attempts']['latest'];
    selected_country?: ResidenceList[0];
};

type TIDVFailureConfig = {
    required_fields: string[];
    side_note_image: JSX.Element;
    failure_message: React.ReactNode;
    inline_note_text: React.ReactNode;
};

type TIdvFailedForm = Partial<TIDVFormValues> & Partial<TPersonalDetailsForm>;

const IdvFailed = ({
    getChangeableFields,
    is_from_external,
    residence_list,
    account_settings,
    handleSubmit,
    mismatch_status = idv_error_statuses.poi_failed,
    latest_status,
    selected_country,
}: TIdvFailed) => {
    const [idv_failure, setIdvFailure] = React.useState<TIDVFailureConfig>({
        required_fields: [],
        side_note_image: <PoiNameDobExample />,
        failure_message: null,
        inline_note_text: null,
    });
    const [is_loading, setIsLoading] = React.useState(true);
    const [rest_state, setRestState] = React.useState<TRestState>({
        api_error: '',
        errors: false,
        form_initial_values: {},
        changeable_fields: [],
    });

    const is_document_upload_required = React.useMemo(
        () => [idv_error_statuses.poi_expired, idv_error_statuses.poi_failed].includes(mismatch_status),
        [mismatch_status]
    );

    /**
     * If user needs to resubmit IDV document, the country should be the new selected country
     * If user needs to update Personal info, the country should be the country of the latest status
     */
    const chosen_country = React.useMemo(
        () =>
            is_document_upload_required && !is_from_external
                ? selected_country ?? {}
                : residence_list.find(residence_data => residence_data.value === latest_status?.country_code) ?? {},
        [selected_country, is_document_upload_required, latest_status?.country_code, residence_list, is_from_external]
    );

    const IDV_NOT_APPLICABLE_OPTION = React.useMemo(() => getIDVNotApplicableOption(), []);

    const generateIDVError = React.useCallback(() => {
        const document_name = is_document_upload_required
            ? getPropertyValue(chosen_country, ['identity', 'services', 'idv', 'documents_supported'])
            : getIDVDocumentType(latest_status, chosen_country);
        switch (mismatch_status) {
            case idv_error_statuses.poi_name_dob_mismatch:
                return {
                    required_fields: ['first_name', 'last_name', 'date_of_birth'],
                    side_note_image: <PoiNameDobExample />,
                    inline_note_text: (
                        <Localize
                            i18n_default_text='To avoid delays, enter your <0>name</0> and <0>date of birth</0> exactly as they appear on your {{document_name}}.'
                            components={[<strong key={0} />]}
                            values={{ document_name }}
                        />
                    ),
                    failure_message: (
                        <Localize
                            i18n_default_text="The <0>name</0> and <0>date of birth</0> on your identity document don't match your profile."
                            components={[<strong key={0} />]}
                        />
                    ),
                };
            case idv_error_statuses.poi_name_mismatch:
                return {
                    required_fields: ['first_name', 'last_name'],
                    side_note_image: <PoiNameExample />,
                    inline_note_text: (
                        <Localize
                            i18n_default_text='To avoid delays, enter your <0>name</0> exactly as it appears on your {{document_name}}.'
                            components={[<strong key={0} />]}
                            values={{ document_name }}
                        />
                    ),
                    failure_message: (
                        <Localize
                            i18n_default_text="The <0>name</0> on your identity document doesn't match your profile."
                            components={[<strong key={0} />]}
                        />
                    ),
                };
            case idv_error_statuses.poi_dob_mismatch:
                return {
                    required_fields: ['date_of_birth'],
                    side_note_image: <PoiDobExample />,
                    inline_note_text: (
                        <Localize
                            i18n_default_text='To avoid delays, enter your <0>date of birth</0> exactly as it appears on your {{document_name}}.'
                            components={[<strong key={0} />]}
                            values={{ document_name }}
                        />
                    ),
                    failure_message: (
                        <Localize
                            i18n_default_text="The <0>date of birth</0> on your identity document doesn't match your profile."
                            components={[<strong key={0} />]}
                        />
                    ),
                };
            default:
                return {
                    required_fields: ['first_name', 'last_name', 'date_of_birth'],
                    side_note_image: <PoiNameDobExample />,
                    inline_note_text: (
                        <Localize
                            i18n_default_text='To avoid delays, enter your <0>name</0> and <0>date of birth</0> exactly as they appear on your {{document_name}}.'
                            components={[<strong key={0} />]}
                            values={{ document_name }}
                        />
                    ),
                    failure_message: (
                        <Localize
                            i18n_default_text='{{ banner_message }}'
                            values={{
                                banner_message:
                                    mismatch_status === 'POI_EXPIRED'
                                        ? 'Your identity document has expired.'
                                        : 'We were unable to verify the identity document with the details provided.',
                            }}
                        />
                    ),
                };
        }
    }, [latest_status, mismatch_status, chosen_country]);

    React.useEffect(() => {
        const initializeFormValues = async (required_fields: string[]) => {
            await WS.wait('get_settings');
            const form_data = filterObjProperties(account_settings, required_fields);
            if (form_data.date_of_birth) {
                form_data.date_of_birth = toMoment(form_data.date_of_birth).format('YYYY-MM-DD');
            }
            let initial_form_values = form_data;
            if (is_document_upload_required) {
                initial_form_values = {
                    document_type: {
                        id: '',
                        text: '',
                        value: '',
                        example_format: '',
                        sample_image: '',
                    },
                    document_number: '',
                    ...initial_form_values,
                };
            }
            setRestState({
                form_initial_values: { ...initial_form_values },
                changeable_fields: [...getChangeableFields()],
                api_error: '',
            });
            setIsLoading(false);
        };

        const error_config = generateIDVError();
        setIdvFailure(error_config);
        initializeFormValues(error_config?.required_fields ?? []).catch(e => {
            setRestState({
                form_initial_values: {},
                changeable_fields: [],
                api_error: e?.error?.message,
            });
        });
    }, [mismatch_status, account_settings, is_document_upload_required, getChangeableFields, generateIDVError]);

    const onSubmit = async (values: TIdvFailedForm, { setStatus, setSubmitting }: FormikHelpers<TIdvFailedForm>) => {
        setSubmitting(true);
        setStatus({ error_msg: null });
        const { document_number, document_type } = values;
        const request = makeSettingsRequest(
            values,
            rest_state?.changeable_fields ? [...rest_state.changeable_fields] : []
        );
        const data = await WS.setSettings(request);

        if (data.error) {
            const response_error =
                data.error?.code === API_ERROR_CODES.DUPLICATE_ACCOUNT
                    ? DUPLICATE_ACCOUNT_ERROR_MESSAGE
                    : GENERIC_ERROR_MESSAGE;
            setStatus({ error_msg: response_error });
            setSubmitting(false);
        } else {
            const response = await WS.authorized.storage.getSettings();
            if (response.error) {
                setRestState(prev_state => ({ ...prev_state, api_error: response.error.message }));
                setSubmitting(false);
                return;
            }
            const submit_data = {
                identity_verification_document_add: 1,
                document_number,
                document_type: document_type?.id,
                issuing_country: chosen_country.value,
            };

            if (!submit_data.document_type || submit_data.document_type === IDV_NOT_APPLICABLE_OPTION.id) {
                setSubmitting(false);
                handleSubmit();
                return;
            }
            WS.send(submit_data).then((resp: IdentityVerificationAddDocumentResponse) => {
                setSubmitting(false);
                if (resp.error) {
                    return;
                }
                handleSubmit();
            });
        }
    };

    const validateFields = (values: TIdvFailedForm) => {
        const errors: Record<string, unknown> = {};
        if (is_document_upload_required) {
            const { document_type, document_number, document_additional } = values;
            const needs_additional_document = !!document_type?.additional;
            errors.document_type = isDocumentTypeValid(document_type as FormikValues);
            if (!shouldHideHelperImage(document_type?.id as string)) {
                if (needs_additional_document) {
                    errors.document_additional = isAdditionalDocumentValid(document_type, document_additional);
                }
                errors.document_number = isDocumentNumberValid(document_number ?? '', document_type as FormikValues);
            }
        }

        const validateValues = validate(errors, values);

        validateValues(val => val, idv_failure?.required_fields ?? [], localize('This field is required'));

        if (values.first_name) {
            errors.first_name = validateName(values.first_name);
        }
        if (values.last_name) {
            errors.last_name = validateName(values.last_name);
        }

        setRestState(prev_state => ({
            ...prev_state,
            errors: !isEmptyObject(removeEmptyPropertiesFromObject(errors)),
        }));
        return removeEmptyPropertiesFromObject(errors);
    };

    if (rest_state?.api_error) return <LoadErrorMessage error_message={rest_state.api_error} />;

    if (is_loading && Object.keys(rest_state?.form_initial_values ?? {}).length === 0) {
        return <Loading is_fullscreen={false} className='account__initial-loader' />;
    }

    return (
        <Formik
            initialValues={rest_state?.form_initial_values ?? {}}
            enableReinitialize
            onSubmit={onSubmit}
            validate={validateFields}
            className='proof-of-identity__container'
        >
            {({ isSubmitting, isValid, dirty, status }) => (
                <Form
                    className={classNames('proof-of-identity__mismatch-container', {
                        'upload-layout': is_document_upload_required,
                    })}
                >
                    <FormBody className='form-body' scroll_offset={isMobile() ? '180px' : '80px'}>
                        <Text size={isMobile() ? 'xs' : 's'} weight='bold' align='center'>
                            <Localize i18n_default_text='Your identity verification failed because:' />
                        </Text>
                        {(status?.error_msg || idv_failure?.failure_message) && (
                            <HintBox
                                className={classNames('proof-of-identity__failed-message', 'hint-box-layout')}
                                icon='IcAlertDanger'
                                message={
                                    <Text as='p' size={isMobile() ? 'xxs' : 'xs'} data-testid={mismatch_status}>
                                        {status?.error_msg ?? idv_failure?.failure_message}
                                    </Text>
                                }
                                is_danger
                            />
                        )}
                        {is_document_upload_required && (
                            <React.Fragment>
                                <Text size='xs' align={isMobile() ? 'left' : 'center'}>
                                    <Localize i18n_default_text='Let’s try again. Choose another document and enter the corresponding details.' />
                                </Text>
                                <FormSubHeader title={localize('Identity verification')} />
                                <IDVForm selected_country={chosen_country} class_name='idv-layout idv-resubmit' />
                                <FormSubHeader title={localize('Details')} />
                            </React.Fragment>
                        )}
                        <PersonalDetailsForm
                            class_name='account-form__poi-confirm-example_container'
                            editable_fields={rest_state?.changeable_fields}
                            is_rendered_for_idv
                            side_note={idv_failure?.side_note_image}
                            inline_note_text={idv_failure?.inline_note_text}
                        />
                        <DesktopWrapper>
                            {!is_from_external && (
                                <Button
                                    className='proof-of-identity__submit-button'
                                    type='submit'
                                    has_effect
                                    is_disabled={!dirty || isSubmitting || !isValid}
                                    text={is_document_upload_required ? localize('Verify') : localize('Update profile')}
                                    large
                                    primary
                                />
                            )}
                        </DesktopWrapper>
                    </FormBody>
                    {(is_from_external || isMobile()) && (
                        <FormFooter>
                            <Button
                                type='submit'
                                has_effect
                                is_disabled={!dirty || isSubmitting || !isValid}
                                text={is_document_upload_required ? localize('Verify') : localize('Update profile')}
                                large
                                primary
                            />
                        </FormFooter>
                    )}
                </Form>
            )}
        </Formik>
    );
};

export default IdvFailed;
