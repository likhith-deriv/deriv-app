import React from 'react';
import { useKycAuthStatus } from '@deriv/api-v2';
import { Loader } from '@deriv-com/ui';
import { usePOIInfo } from '../../hooks';
import { IDVService, ManualUpload, OnfidoContainer } from '../../modules';

type TPOIFlowContainerProps = {
    countryCode: string;
};

type TSupportedDocuments = DeepNonNullable<
    ReturnType<typeof useKycAuthStatus>['kyc_auth_status']
>['identity']['supported_documents']['idv'];

export const POIFlowContainer = ({ countryCode }: TPOIFlowContainerProps) => {
    const { isLoading, kycAuthStatus } = usePOIInfo({ country: countryCode });

    if (isLoading || !kycAuthStatus) {
        return <Loader />;
    }

    const {
        identity: { available_services: availableServices, supported_documents: supportedDocuments },
    } = kycAuthStatus;

    switch (availableServices?.[0]) {
        case 'onfido': {
            return <OnfidoContainer countryCode={countryCode} />;
        }
        case 'idv': {
            return (
                <IDVService
                    countryCode={countryCode}
                    supportedDocuments={supportedDocuments?.idv as TSupportedDocuments}
                />
            );
        }
        default: {
            return <ManualUpload countryCode={countryCode} />;
        }
    }
};
