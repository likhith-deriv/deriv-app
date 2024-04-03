import { TSocketEndpointNames, TSocketError } from '@deriv/api-v2/types';
import {
    API_ERROR_CODES,
    AUTH_STATUS_CODES,
    IDV_ERROR_CODES,
    ONFIDO_ERROR_CODES,
    POI_SERVICE,
    POI_SUBMISSION_STATUS,
} from '../constants';

type TPOIStatus = typeof AUTH_STATUS_CODES[keyof typeof AUTH_STATUS_CODES];

export type TPOISubmissionStatus = typeof POI_SUBMISSION_STATUS[keyof typeof POI_SUBMISSION_STATUS];

export type TPOIActions =
    | { payload: string; type: 'setSelectedCountry' }
    | { payload: TPOISubmissionStatus; type: 'setSubmissionStatus' };

export const setErrorMessage = <T extends TSocketError<TSocketEndpointNames>['error']>(error: T) => {
    const { code, message } = error ?? { code: null, message: null };
    switch (code) {
        case API_ERROR_CODES.duplicateAccount.code:
            return API_ERROR_CODES.duplicateAccount.message;
        case API_ERROR_CODES.claimedDocument.code:
            return API_ERROR_CODES.claimedDocument.message;
        default:
            return message ?? API_ERROR_CODES.generic.message;
    }
};

export const translateErrorCode = (errorCode: string | null, service: typeof POI_SERVICE[keyof typeof POI_SERVICE]) => {
    if (!errorCode) {
        return '';
    }
    if (service === 'idv') {
        return (
            Object.values(IDV_ERROR_CODES).find(error => error.code === errorCode)?.message ??
            IDV_ERROR_CODES.generic.message
        );
    }
    return (
        Object.values(ONFIDO_ERROR_CODES).find(error => error.code === errorCode)?.message ??
        ONFIDO_ERROR_CODES.generic.message
    );
};

type TIDVErrorStatusConfig = {
    errors?: string[];
    status?: TPOIStatus;
};

export const checkIDVErrorStatus = ({ errors, status }: TIDVErrorStatusConfig) => {
    if (status === AUTH_STATUS_CODES.EXPIRED) {
        return IDV_ERROR_CODES.expired.code;
    }

    if (!errors || !errors?.length) {
        return null;
    }

    if (
        errors.includes(IDV_ERROR_CODES.nameMismatch.code as string) &&
        errors.includes(IDV_ERROR_CODES.dobMismatch.code as string)
    ) {
        return IDV_ERROR_CODES.nameDobMismatch.code;
    }
    return errors[0];
};

export const shouldSkipCountrySelector = (errors?: string[]) => {
    if (!errors || !errors?.length) {
        return false;
    }
    const errorStatus = checkIDVErrorStatus({ errors });
    return [
        IDV_ERROR_CODES.dobMismatch.code,
        IDV_ERROR_CODES.nameMismatch.code,
        IDV_ERROR_CODES.nameDobMismatch.code,
    ].includes(errorStatus);
};
