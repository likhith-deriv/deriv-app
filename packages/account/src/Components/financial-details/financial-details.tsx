import classNames from 'classnames';
import { Formik, FormikValues } from 'formik';
import React from 'react';
import {
    AutoHeightWrapper,
    Div100vhContainer,
    FormSubmitButton,
    Modal,
    Text,
    ThemedScrollbars,
} from '@deriv/components';
import { isDesktop, isMobile } from '@deriv/shared';
import { Localize, localize } from '@deriv/translations';
import FinancialInformation from './financial-details-partials';
import { splitValidationResultTypes } from '../real-account-signup/helpers/utils';

export type TFinancialDetails = {
    goToPreviousStep: () => void;
    goToNextStep: () => void;
    getCurrentStep: () => number;
    onSave: (current_step: number, values: FormikValues) => void;
    onSubmit: (
        current_step: number,
        values: FormikValues,
        actions: (isSubmitting: boolean) => void,
        props: () => void
    ) => void;
    onCancel: (current_step: number, props: () => void) => void;
    validate: (values: FormikValues) => object;
    value: object;
};

const FinancialDetails = (props: TFinancialDetails) => {
    const handleCancel = (values: FormikValues) => {
        const current_step = props.getCurrentStep() - 1;
        props.onSave(current_step, values);
        props.onCancel(current_step, props.goToPreviousStep);
    };

    const handleValidate = (values: FormikValues) => {
        const { errors } = splitValidationResultTypes(props.validate(values));
        return errors;
    };

    return (
        <Formik
            initialValues={{ ...props.value }}
            validate={handleValidate}
            onSubmit={(values, actions) => {
                props.onSubmit(props.getCurrentStep() - 1, values, actions.setSubmitting, props.goToNextStep);
            }}
            validateOnMount
        >
            {({ handleSubmit, isSubmitting, errors, values }) => {
                return (
                    <AutoHeightWrapper default_height={200}>
                        {({
                            setRef,
                            height,
                        }: {
                            setRef: (instance: HTMLFormElement) => void;
                            height?: number | string;
                        }) => (
                            <form ref={setRef} onSubmit={handleSubmit}>
                                <Div100vhContainer
                                    className={classNames('details-form', 'financial-assessment')}
                                    height_offset='110px'
                                    is_disabled={isDesktop()}
                                >
                                    <Text as='p' color='prominent' size='xxs' className='trading-assessment__side-note'>
                                        <Localize i18n_default_text='We collect information about your employment as part of our due diligence obligations, as required by anti-money laundering legislation.' />
                                    </Text>
                                    <ThemedScrollbars
                                        autohide={!(window.innerHeight < 890)}
                                        height={Number(height) - 77}
                                    >
                                        <div
                                            className={classNames(
                                                'details-form__elements',
                                                'financial-assessment__form'
                                            )}
                                        >
                                            <FinancialInformation />
                                        </div>
                                    </ThemedScrollbars>
                                </Div100vhContainer>
                                <Modal.Footer has_separator is_bypassed={isMobile()}>
                                    <FormSubmitButton
                                        is_disabled={isSubmitting || Object.keys(errors).length > 0}
                                        is_absolute={isMobile()}
                                        label={localize('Next')}
                                        has_cancel
                                        cancel_label={localize('Previous')}
                                        onCancel={() => handleCancel(values)}
                                    />
                                </Modal.Footer>
                            </form>
                        )}
                    </AutoHeightWrapper>
                );
            }}
        </Formik>
    );
};

export default FinancialDetails;
