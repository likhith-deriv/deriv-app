import * as Yup from 'yup';
import {
    MANUAL_DOCUMENT_TYPES,
    MANUAL_DOCUMENT_TYPES_DATA,
    TManualDocumentTypes,
} from '../constants/manualFormConstants';

export const getTitleForFormInputs = (selectedDocument: TManualDocumentTypes) =>
    MANUAL_DOCUMENT_TYPES_DATA[selectedDocument].inputSectionHeader;

export const getTitleForDocumentUpload = (selectedDocument: TManualDocumentTypes) =>
    MANUAL_DOCUMENT_TYPES_DATA[selectedDocument].uploadSectionHeader;

export const getFieldsConfig = (selectedDocument: TManualDocumentTypes) =>
    MANUAL_DOCUMENT_TYPES_DATA[selectedDocument].fields;

export const getUploadConfig = (selectedDocument: TManualDocumentTypes) =>
    MANUAL_DOCUMENT_TYPES_DATA[selectedDocument].uploads;

export const getManualFormValidationSchema = (
    selectedDocument: TManualDocumentTypes,
    isExpiryDateRequired: boolean
) => {
    const fieldsConfig = getFieldsConfig(selectedDocument);
    const uploadConfig = getUploadConfig(selectedDocument);
    const uploadFrontSideError = Yup.mixed().required(uploadConfig[0]?.fileUploadError);
    const uploadBackSideError = Yup.mixed().required(uploadConfig[1]?.fileUploadError);

    const documentExpiryValidation = {
        document_expiry: isExpiryDateRequired
            ? Yup.string().required(fieldsConfig.documentExpiry.errorMessage)
            : Yup.string().notRequired(),
    };

    const isDrivingLicenceRequired = selectedDocument === MANUAL_DOCUMENT_TYPES.DRIVING_LICENCE;
    const drivingLicenceValidation = {
        driving_licence_back: isDrivingLicenceRequired ? uploadBackSideError : Yup.mixed().notRequired(),
        driving_licence_front: isDrivingLicenceRequired ? uploadFrontSideError : Yup.mixed().notRequired(),
    };

    const isIdentityCardRequired = selectedDocument === MANUAL_DOCUMENT_TYPES.NATIONAL_IDENTITY_CARD;
    const identityCardValidation = {
        identity_card_back: isIdentityCardRequired ? uploadBackSideError : Yup.mixed().notRequired(),
        identity_card_front: isIdentityCardRequired ? uploadFrontSideError : Yup.mixed().notRequired(),
    };

    const isNimcSlipRequired = selectedDocument === MANUAL_DOCUMENT_TYPES.NIMC_SLIP;
    const nimcSlipValidation = {
        nimc_slip_back: isNimcSlipRequired ? uploadBackSideError : Yup.mixed().notRequired(),
        nimc_slip_front: isNimcSlipRequired ? uploadFrontSideError : Yup.mixed().notRequired(),
    };

    const isPassportRequired = selectedDocument === MANUAL_DOCUMENT_TYPES.PASSPORT;
    const passportValidation = {
        passport_front: isPassportRequired ? uploadFrontSideError : Yup.mixed().notRequired(),
    };

    return Yup.object({
        document_number: Yup.string().required(fieldsConfig.documentNumber.errorMessage),
        ...documentExpiryValidation,
        ...drivingLicenceValidation,
        ...identityCardValidation,
        ...nimcSlipValidation,
        ...passportValidation,
    });
};
