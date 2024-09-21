import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Formik, FormikProps, FormikValues } from 'formik';
import { useTranslations } from '@deriv-com/translations';
import { InlineMessage, Loader, Text, useDevice } from '@deriv-com/ui';
import { ModalStepWrapper } from '../../../../components';
import { THooks } from '../../../../types';
import { Footer } from '../components';
import POAMobile from './components/POAMobile/POAMobile';
import { AddressSection, DocumentSubmission, PoaUploadErrorMessage } from './components';
import { usePoa } from './hooks';
import { TPoaValues } from './types';
import { getPoaValidationSchema } from './utils';
import './Poa.scss';

type TMobileFooterProps = {
    handleClick: VoidFunction;
    isDisabled: boolean;
    nextText?: string;
};

const MobileFooter = ({ handleClick, isDisabled, nextText }: TMobileFooterProps) => (
    <Footer disableNext={isDisabled} nextText={nextText} onClickNext={handleClick} />
);

type TPoaProps = {
    onCompletion?: VoidFunction;
};

const Poa: React.FC<TPoaProps> = ({ onCompletion }) => {
    const { localize } = useTranslations();
    const { isDesktop } = useDevice();
    const {
        countryCode,
        errorSettings,
        initialStatus,
        initialValues,
        isLoading,
        isSuccess: isSubmissionSuccess,
        resetError,
        upload: upload_,
    } = usePoa();
    const [errorDocumentUpload, setErrorDocumentUpload] = useState<THooks.DocumentUpload['error']>();
    const [showLoader, setShowLoader] = useState(true);
    const [step, setStep] = useState<{ id: number; text: string }>({ id: 1, text: localize('Enter your address') });

    const formikRef = useRef<FormikProps<TPoaValues>>(null);

    const shouldAllowDocumentUpload = useMemo(() => {
        if (!formikRef.current) return false;

        const { errors, values } = formikRef.current;

        if (step.id === 2) {
            return false;
        }
        return (
            !values.firstLine &&
            !!errors.firstLine &&
            !!errors.secondLine &&
            !values.townCityLine &&
            !!errors.townCityLine &&
            !!errors.stateProvinceLine &&
            !!errors.zipCodeLine
        );
    }, [formikRef, step.id]);

    useEffect(() => {
        if (isSubmissionSuccess && onCompletion) {
            onCompletion();
        }

        setShowLoader(isLoading);
    }, [isSubmissionSuccess, onCompletion, isLoading]);

    const upload = async (values: FormikValues) => {
        try {
            await upload_(values);
        } catch (error) {
            setErrorDocumentUpload((error as THooks.DocumentUpload).error);
        }
    };

    if (showLoader) return <Loader />;

    const handelClickNext = () => setStep({ id: 2, text: localize('Upload proof of address') });

    return (
        <Formik
            initialStatus={initialStatus}
            initialValues={initialValues}
            innerRef={formikRef}
            onSubmit={upload}
            validationSchema={getPoaValidationSchema(localize)}
        >
            {({ handleSubmit, isValid, resetForm }) => {
                const onErrorRetry = () => {
                    resetForm();
                    resetError();
                };

                if (errorDocumentUpload) {
                    return <PoaUploadErrorMessage errorCode={errorDocumentUpload.code} onRetry={onErrorRetry} />;
                }

                let buttonConfig: TMobileFooterProps;

                if (step.id === 1) {
                    buttonConfig = {
                        handleClick: handelClickNext,
                        isDisabled: shouldAllowDocumentUpload,
                    };
                } else {
                    buttonConfig = {
                        handleClick: handleSubmit,
                        isDisabled: !isValid,
                        nextText: localize('Submit'),
                    };
                }

                return (
                    <ModalStepWrapper
                        renderFooter={() =>
                            isDesktop ? (
                                <Footer disableNext={!isValid} onClickNext={handleSubmit} />
                            ) : (
                                <MobileFooter {...buttonConfig} />
                            )
                        }
                        title={localize('Add a real MT5 account')}
                    >
                        <div className='wallets-poa'>
                            {isDesktop ? (
                                <Fragment>
                                    {errorSettings?.message && (
                                        <InlineMessage variant='error'>
                                            <Text>{localize(errorSettings.message)}</Text>
                                        </InlineMessage>
                                    )}
                                    <AddressSection hasError={Boolean(errorSettings?.message)} />
                                    <DocumentSubmission countryCode={countryCode as string} />
                                </Fragment>
                            ) : (
                                <Fragment>
                                    <POAMobile countryCode={countryCode as string} step={step} />
                                </Fragment>
                            )}
                        </div>
                    </ModalStepWrapper>
                );
            }}
        </Formik>
    );
};

export default Poa;
