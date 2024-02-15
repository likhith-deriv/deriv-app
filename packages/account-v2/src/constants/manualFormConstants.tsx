import React from 'react';
import IdentityCardBack from '../assets/manual-upload/document-back.svg';
import DrivingLicenseCardFront from '../assets/manual-upload/driving-license-front.svg';
import IdentityCardFront from '../assets/manual-upload/identity-card-front.svg';
import NIMCSlipFront from '../assets/manual-upload/nimc-slip-front.svg';
import PassportPlaceholder from '../assets/manual-upload/passport-placeholder.svg';
import ProofOfAgeIcon from '../assets/manual-upload/proof-of-age.svg';

export type TManualDocumentTypes = typeof MANUAL_DOCUMENT_TYPES[keyof typeof MANUAL_DOCUMENT_TYPES];

export const MANUAL_DOCUMENT_TYPES = Object.freeze({
    DRIVING_LICENCE: 'driving_licence',
    NATIONAL_IDENTITY_CARD: 'national_identity_card',
    NIMC_SLIP: 'nimc_slip',
    PASSPORT: 'passport',
});

export const MANUAL_FORM_INITIAL_VALUES = Object.freeze({
    document_number: '',
});

const PAGE_TYPE = Object.freeze({
    BACK: 'back',
    FRONT: 'front',
    PHOTO: 'photo',
});

const documentExpiry = {
    errorMessage: 'Expiry date is required.',
    label: 'Expiry date',
};

export const MANUAL_DOCUMENT_TYPES_DATA = Object.freeze({
    [MANUAL_DOCUMENT_TYPES.DRIVING_LICENCE]: {
        fields: {
            documentExpiry,
            documentNumber: {
                errorMessage: 'Driving licence number is required.',
                label: 'Driving licence number',
            },
        },
        inputSectionHeader: 'First, enter your Driving licence number and the expiry date.',
        uploads: [
            {
                fileUploadError: 'Front side of driving licence is required.',
                fileUploadIcon: <DrivingLicenseCardFront />,
                fileUploadPageType: PAGE_TYPE.FRONT,
                fileUploadText: 'Upload the front of your driving licence.',
            },
            {
                fileUploadError: 'Back side of driving licence is required.',
                fileUploadIcon: <IdentityCardBack />,
                fileUploadPageType: PAGE_TYPE.BACK,
                fileUploadText: 'Upload the back of your driving licence.',
            },
        ],
        uploadSectionHeader: 'Next, upload the front and back of your driving licence.',
    },
    [MANUAL_DOCUMENT_TYPES.NATIONAL_IDENTITY_CARD]: {
        fields: {
            documentExpiry,
            documentNumber: {
                errorMessage: 'Identity card number is required.',
                label: 'Identity card number',
            },
        },
        inputSectionHeader: 'First, enter your Identity card number and the expiry date.',
        uploads: [
            {
                fileUploadError: 'Front side of identity card is required.',
                fileUploadIcon: <IdentityCardFront />,
                fileUploadPageType: PAGE_TYPE.FRONT,
                fileUploadText: 'Upload the front of your identity card.',
            },
            {
                fileUploadError: 'Back side of identity card is required.',
                fileUploadIcon: <IdentityCardBack />,
                fileUploadPageType: PAGE_TYPE.BACK,
                fileUploadText: 'Upload the back of your identity card.',
            },
        ],
        uploadSectionHeader: 'Next, upload the front and back of your identity card.',
    },
    [MANUAL_DOCUMENT_TYPES.NIMC_SLIP]: {
        fields: {
            documentExpiry,
            documentNumber: {
                errorMessage: 'NIMC slip number is required.',
                label: 'NIMC slip number',
            },
        },
        inputSectionHeader: 'First, enter your NIMC slip number and the expiry date.',
        uploads: [
            {
                fileUploadError: 'Front side of NIMC slip is required.',
                fileUploadIcon: <NIMCSlipFront />,
                fileUploadPageType: PAGE_TYPE.FRONT,
                fileUploadText: 'Upload your NIMC slip.',
            },
            {
                fileUploadError: 'Back side of NIMC slip is required.',
                fileUploadIcon: <ProofOfAgeIcon />,
                fileUploadPageType: PAGE_TYPE.BACK,
                fileUploadText: 'Upload your proof of age: birth certificate or age declaration document.',
            },
        ],
        uploadSectionHeader: 'Next, upload the page of your NIMC slip that contains your photo.',
    },
    [MANUAL_DOCUMENT_TYPES.PASSPORT]: {
        fields: {
            documentExpiry,
            documentNumber: {
                errorMessage: 'Passport number is required.',
                label: 'Passport number',
            },
        },
        inputSectionHeader: 'First, enter your Passport number and the expiry date.',
        uploads: [
            {
                fileUploadError: 'Front side of passport is required.',
                fileUploadIcon: <PassportPlaceholder />,
                fileUploadPageType: PAGE_TYPE.FRONT,
                fileUploadText: 'Upload the page of your passport that contains your photo.',
            },
        ],
        uploadSectionHeader: 'Next, upload the page of your passport that contains your photo.',
    },
});
