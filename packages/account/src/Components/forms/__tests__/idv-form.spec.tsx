import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import IDVForm from '../idv-form';
import { Formik } from 'formik';
import { isDesktop, isMobile } from '@deriv/shared';

jest.mock('Helpers/utils', () => ({
    ...jest.requireActual('Helpers/utils'),
    getDocumentData: jest.fn((country_code, key) => {
        const data = {
            tc: {
                document_1: {
                    new_display_name: '',
                    example_format: '5436454364243',
                    sample_image: '',
                },
                document_2: {
                    new_display_name: '',
                    example_format: 'A-52431',
                    sample_image: '',
                },
            },
        };
        return data[country_code][key];
    }),
}));

jest.mock('formik', () => ({
    ...jest.requireActual('formik'),
    useFormikContext: jest.fn(() => ({
        values: {
            document_type: {
                // display_name: 'Test document 1 name',
                // format: '5436454364243',
                // id: '1',
                // value: 'Test document 1 name',
            },
            document_number: '',
        },
        errors: {},
        touched: {},
        setFieldValue: jest.fn(),
        setFieldTouched: jest.fn(),
        validateForm: jest.fn(),
        validateField: jest.fn(),
        handleBlur: jest.fn(),
        handleChange: jest.fn(),
    })),
}));

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    isDesktop: jest.fn(() => true),
    isMobile: jest.fn(() => false),
}));

describe('<IDVForm/>', () => {
    const mock_props = {
        selected_country: {
            value: 'tc',
            identity: {
                services: {
                    idv: {
                        documents_supported: {
                            document_1: {
                                display_name: 'Test document 1 name',
                                format: '5436454364243',
                            },
                            document_2: {
                                display_name: 'Test document 2 name',
                                format: 'A54321',
                            },
                        },
                        has_visual_sample: '1',
                    },
                },
            },
        },
    };

    const mock_values = {
        document_type: {
            display_name: 'Test document 1 name',
            format: '5436454364243',
            id: '1',
            value: 'document_1',
        },
        document_number: '5436454364243',
    };

    it('should render IDVForm component', () => {
        render(<IDVForm {...mock_props} />, {
            wrapper: ({ children }) => (
                <Formik initialValues={mock_values} onSubmit={() => undefined}>
                    {() => children}
                </Formik>
            ),
        });

        const document_type_input = screen.getByLabelText('Choose the document type');
        const document_number_input = screen.getByPlaceholderText('Enter your document number');

        expect(document_type_input).toBeInTheDocument();
        expect(document_number_input).toBeInTheDocument();
    });

    it('Should change the document type value when document type is changed', async () => {
        render(<IDVForm {...mock_props} />, {
            wrapper: ({ children }) => (
                <Formik initialValues={mock_values} onSubmit={() => undefined}>
                    {() => children}
                </Formik>
            ),
        });

        const document_type_input = screen.getByLabelText('Choose the document type');

        fireEvent.click(document_type_input);
        expect(await screen.findByText('Test document 1 name')).toBeInTheDocument();
        fireEvent.blur(document_type_input);
        await waitFor(() => {
            expect(screen.queryByText('Test document 1 name')).not.toBeInTheDocument();
        });
    });
});
