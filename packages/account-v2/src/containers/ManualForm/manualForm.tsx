import React from 'react';
import { Form, Formik } from 'formik';
import { Button } from '@deriv-com/ui';
import { MANUAL_FORM_INITIAL_VALUES, TManualDocumentTypes } from '../../constants/manualFormConstants';
import { getManualFormValidationSchema } from '../../utils/manualFormUtils';
import { ManualFormDocumentUpload } from './manualFormDocumentUpload';
import { ManualFormFooter } from './manualFormFooter';
import { ManualFormInputs } from './manualFormInputs';

type TManualFormProps = {
    onCancel: () => void;
    onSubmit: (values: typeof MANUAL_FORM_INITIAL_VALUES) => void;
    selectedDocument: TManualDocumentTypes;
};

export const ManualForm = ({ onCancel, onSubmit, selectedDocument }: TManualFormProps) => (
    <Formik
        initialValues={MANUAL_FORM_INITIAL_VALUES}
        onSubmit={onSubmit}
        validationSchema={() => getManualFormValidationSchema(selectedDocument)}
    >
        {({ isValid }) => (
            <Form>
                <div className='flex flex-col min-h-screen w-full'>
                    <div className='flex flex-col gap-1200'>
                        <ManualFormInputs selectedDocument={selectedDocument} />
                        <ManualFormDocumentUpload selectedDocument={selectedDocument} />
                        <ManualFormFooter />
                    </div>
                    <div className='sticky bottom-50 flex justify-end gap-800 bg-vp px-400 py-800 border-t-solid-grey-2 bg-solid-slate-50 border-solid border-t-100'>
                        <Button onClick={onCancel} type='button' variant='outlined'>
                            Back
                        </Button>
                        <Button disabled={!isValid}>Next</Button>
                    </div>
                </div>
            </Form>
        )}
    </Formik>
);
