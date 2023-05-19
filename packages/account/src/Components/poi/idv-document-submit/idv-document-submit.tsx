import React from 'react';
import classNames from 'classnames';
import { Button } from '@deriv/components';
import { Form, Formik, FormikHelpers } from 'formik';
import { localize } from '@deriv/translations';
import {
    WS,
    IDV_NOT_APPLICABLE_OPTION,
    toMoment,
    filterObjProperties,
    isDesktop,
    removeEmptyPropertiesFromObject,
} from '@deriv/shared';
import {
    validate,
    makeSettingsRequest,
    validateName,
    shouldHideHelperImage,
    isDocumentTypeValid,
    isAdditionalDocumentValid,
    isDocumentNumberValid,
} from 'Helpers/utils';
import FormFooter from 'Components/form-footer';
import BackButtonIcon from 'Assets/ic-poi-back-btn.svg';
import IDVForm from 'Components/forms/idv-form';
import PersonalDetailsForm from 'Components/forms/personal-details-form';
import FormSubHeader from 'Components/form-sub-header';
import { GetSettings, ResidenceList, IdentityVerificationAddDocumentResponse } from '@deriv/api-types';
import { TIDVForm, TPersonalDetailsForm } from 'Types';

type TIdvDocumentSubmit = {
    handleBack: () => void;
    handleViewComplete: () => void;
    selected_country: ResidenceList[0];
    account_settings: GetSettings;
    getChangeableFields: () => Array<string>;
};

type TIdvDocumentSubmitForm = TIDVForm & TPersonalDetailsForm;

const IdvDocumentSubmit = ({
    handleBack,
    handleViewComplete,
    selected_country,
    account_settings,
    getChangeableFields,
}: TIdvDocumentSubmit) => {
    const visible_settings = ['first_name', 'last_name', 'date_of_birth'];
    const form_initial_values = filterObjProperties(account_settings, visible_settings) as {
        [Property in keyof TPersonalDetailsForm]: string;
    };

    if (form_initial_values.date_of_birth) {
        form_initial_values.date_of_birth = toMoment(form_initial_values.date_of_birth).format('YYYY-MM-DD');
    }

    const changeable_fields = [...getChangeableFields()];

    const initial_values: TIdvDocumentSubmitForm = {
        document_type: {
            id: '',
            text: '',
            value: '',
            example_format: '',
            sample_image: '',
        },
        document_number: '',
        ...form_initial_values,
    };

    const validateFields = (values: TIdvDocumentSubmitForm) => {
        const errors: Record<string, unknown> = {};
        const { document_type, document_number, document_additional } = values;
        const needs_additional_document = !!document_type.additional;

        errors.document_type = isDocumentTypeValid(document_type);
        if (!shouldHideHelperImage(document_type?.id)) {
            if (needs_additional_document) {
                errors.document_additional = isAdditionalDocumentValid(document_type, document_additional);
            }
            errors.document_number = isDocumentNumberValid(document_number, document_type);
        }
        const required_fields = ['first_name', 'last_name', 'date_of_birth'];
        const validateValues = validate(errors, values);
        validateValues(val => val, required_fields, localize('This field is required'));
        errors.first_name = validateName(values.first_name);
        errors.last_name = validateName(values.last_name);

        return removeEmptyPropertiesFromObject(errors);
    };

    const submitHandler = async (
        values: TIdvDocumentSubmitForm,
        {
            setSubmitting,
            setErrors,
        }: Pick<FormikHelpers<TIdvDocumentSubmitForm>, 'setSubmitting'> & {
            setErrors: (props: Record<string, string>) => void;
        }
    ) => {
        setSubmitting(true);

        const request = makeSettingsRequest(values, changeable_fields);

        const data = await WS.setSettings(request);

        if (data.error) {
            setErrors({ error_message: data.error.message });
            setSubmitting(false);
            return;
        }
        const get_settings = WS.authorized.storage.getSettings();
        if (get_settings.error) {
            setErrors({ error_message: data.error.message });
            setSubmitting(false);
            return;
        }
        const submit_data = {
            identity_verification_document_add: 1,
            document_number: values.document_number,
            document_additional: values.document_additional || '',
            document_type: values.document_type.id,
            issuing_country: selected_country.value,
        };

        if (submit_data.document_type === IDV_NOT_APPLICABLE_OPTION.id) {
            return;
        }
        WS.send(submit_data).then(
            (response: IdentityVerificationAddDocumentResponse & { error: { message: string } }) => {
                setSubmitting(false);
                if (response.error) {
                    setErrors({ error_message: response.error.message });
                    return;
                }
                handleViewComplete();
            }
        );
    };

    return (
        <Formik initialValues={{ ...initial_values }} validate={validateFields} onSubmit={submitHandler}>
            {({ dirty, isSubmitting, isValid, values }) => (
                <Form className='proof-of-identity__container proof-of-identity__container--reset'>
                    <FormSubHeader title={localize('Identity verification')} />
                    <IDVForm hide_hint={false} selected_country={selected_country} class_name='idv-layout' />

                    <FormSubHeader title={localize('Details')} />
                    <div
                        className={classNames({
                            'account-form__poi-confirm-example_container': !shouldHideHelperImage(
                                values?.document_type?.id
                            ),
                        })}
                    >
                        <PersonalDetailsForm
                            is_qualified_for_idv={true}
                            is_appstore
                            should_hide_helper_image={shouldHideHelperImage(values?.document_type?.id)}
                            editable_fields={changeable_fields}
                        />
                    </div>
                    <FormFooter className='proof-of-identity__footer'>
                        {isDesktop() && (
                            <Button className='back-btn' onClick={handleBack} type='button' has_effect large secondary>
                                <BackButtonIcon className='back-btn-icon' /> {localize('Go Back')}
                            </Button>
                        )}
                        <Button
                            className='proof-of-identity__submit-button'
                            type='submit'
                            has_effect
                            is_disabled={!dirty || isSubmitting || !isValid}
                            text={localize('Verify')}
                            large
                            primary
                        />
                    </FormFooter>
                </Form>
            )}
        </Formik>
    );
};

export default IdvDocumentSubmit;
