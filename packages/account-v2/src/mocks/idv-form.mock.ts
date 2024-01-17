import { ResidenceList } from '@deriv/api-types';

export const DOCUMENT_LIST = [
    {
        id: 'aadhaar',
        text: 'Aadhaar Card',
        additional: {
            display_name: 'PAN Card',
            format: '^[a-zA-Z]{5}\\d{4}[a-zA-Z]{1}$',
            example_format: 'ABCDE1234F',
        },
        value: '^[0-9]{12}$',
        example_format: '123456789012',
    },
    {
        id: 'drivers_license',
        text: 'Drivers License',
        value: '^[a-zA-Z0-9]{10,17}$',
        example_format: 'AB1234567890123',
    },
    {
        id: 'epic',
        text: 'Voter ID',
        value: '^[a-zA-Z]{3}[0-9]{7}$',
        example_format: 'ABC1234567',
    },
    {
        id: 'pan',
        text: 'PAN Card',
        value: '^[a-zA-Z]{5}\\d{4}[a-zA-Z]{1}$',
        example_format: 'ABCDE1234F',
    },
    {
        id: 'passport',
        text: 'Passport',
        additional: {
            display_name: 'File Number',
            format: '^.{15}$',
            example_format: 'AB1234567890123',
        },
        value: '^.{8}$',
        example_format: 'A1234567',
    },
];

export const SELECTED_COUNTRY: ResidenceList[0] = {
    identity: {
        services: {
            idv: {
                documents_supported: {
                    aadhaar: {
                        additional: {
                            display_name: 'PAN Card',
                            format: '^[a-zA-Z]{5}\\d{4}[a-zA-Z]{1}$',
                        },
                        display_name: 'Aadhaar Card',
                        format: '^[0-9]{12}$',
                    },
                    drivers_license: {
                        display_name: 'Drivers License',
                        format: '^[a-zA-Z0-9]{10,17}$',
                    },
                    epic: {
                        display_name: 'Voter ID',
                        format: '^[a-zA-Z]{3}[0-9]{7}$',
                    },
                    pan: {
                        display_name: 'PAN Card',
                        format: '^[a-zA-Z]{5}\\d{4}[a-zA-Z]{1}$',
                    },
                    passport: {
                        additional: {
                            display_name: 'File Number',
                            format: '^.{15}$',
                        },
                        display_name: 'Passport',
                        format: '^.{8}$',
                    },
                },
                has_visual_sample: 0,
                is_country_supported: 1,
            },
            onfido: {
                documents_supported: {
                    driving_licence: {
                        display_name: 'Driving Licence',
                    },
                    national_identity_card: {
                        display_name: 'National Identity Card',
                    },
                    passport: {
                        display_name: 'Passport',
                    },
                    visa: {
                        display_name: 'Visa',
                    },
                    voter_id: {
                        display_name: 'Voter Id',
                    },
                },
                is_country_supported: 1,
            },
        },
    },
    phone_idd: '91',
    text: 'India',
    tin_format: ['^[A-Za-z]{3}P[A-Za-z]\\d{4}[A-Za-z]$'],
    value: 'in',
};

export const INITIAL_VALUES = {
    document_type: '',
    document_number: '',
    document_additional: '',
};
