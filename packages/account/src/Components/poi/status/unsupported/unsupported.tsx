import React from 'react';
import classNames from 'classnames';
import { localize } from '@deriv/translations';
import { Timeline } from '@deriv/components';
import { getPlatformRedirect, isMobile, platforms } from '@deriv/shared';
import {
    getPOIStatusMessages,
    getUploadCompleteStatusMessages,
    identity_status_codes,
} from '../../../../Sections/Verification/ProofOfIdentity/proof-of-identity-utils';
import DetailComponent from './detail-component';
import { Documents } from './documents';
import { DOCUMENT_TYPES, getDocumentIndex } from './constants';
import { FormikValues } from 'formik';
import VerificationStatus from '../../../verification-status/verification-status';
import { TStores } from '@deriv/stores/types';

const checkNimcStep = (documents: FormikValues) => {
    let has_nimc = false;
    documents.forEach((document: FormikValues) => {
        if (document.document_type === DOCUMENT_TYPES.NIMC_SLIP) {
            has_nimc = true;
        }
    });
    return has_nimc;
};

type TUnsupported = {
    country_code: string;
    handlePOIforMT5Complete: () => void;
    manual?: {
        status: typeof identity_status_codes[keyof typeof identity_status_codes];
    };
    redirect_button: React.ReactElement;
    needs_poa: boolean;
    handleRequireSubmission: () => void;
    handleViewComplete: () => void;
    allow_poi_resubmission: boolean;
    onfido?: {
        submissions_left: number;
    };
    app_routing_history: TStores['common']['app_routing_history'];
    routeBackTo: (redirect_route: string) => void;
};

const Unsupported = ({
    country_code,
    handlePOIforMT5Complete,
    manual,
    redirect_button,
    needs_poa,
    handleRequireSubmission,
    allow_poi_resubmission,
    handleViewComplete,
    onfido,
    routeBackTo,
    app_routing_history = [],
    ...props
}: TUnsupported) => {
    const [detail, setDetail] = React.useState<number | null>(null);

    const toggleDetail = (index: number) => setDetail(index);

    const documents = getDocumentIndex({
        country_code,
    });

    const from_platform = getPlatformRedirect(app_routing_history);

    const onClickRedirectButton = () => {
        const platform = platforms[from_platform?.ref as keyof typeof platforms];
        const { is_hard_redirect = false, url = '' } = platform ?? {};
        if (is_hard_redirect) {
            window.location.href = url;
            window.sessionStorage.removeItem('config.platform');
        } else {
            routeBackTo(from_platform.route);
        }
    };

    const status_content = React.useMemo(
        () => getPOIStatusMessages(manual?.status ?? 'none', { needs_poa }, !!redirect_button),
        [manual?.status, needs_poa, redirect_button]
    );

    const upload_complete_status_content = React.useMemo(
        () => getUploadCompleteStatusMessages('pending', { needs_poa, is_manual_upload: true }, !!redirect_button),
        [needs_poa, redirect_button]
    );

    if (manual) {
        let content: typeof status_content | typeof upload_complete_status_content = {
            title: '',
            icon: '',
            description: null,
            action_button: null,
        };
        let onClick;
        if (manual?.status === identity_status_codes.verified || manual?.status === identity_status_codes.pending) {
            onClick = onClickRedirectButton;
        } else if (manual?.status === identity_status_codes.expired) {
            onClick = handleRequireSubmission;
        }

        if (manual?.status === identity_status_codes.pending) {
            content = upload_complete_status_content;
        } else if (
            manual?.status === identity_status_codes.verified ||
            manual?.status === identity_status_codes.expired ||
            ([identity_status_codes.rejected, identity_status_codes.suspected].some(
                status => status === manual.status
            ) &&
                !allow_poi_resubmission)
        ) {
            content = status_content;
        }

        return (
            <VerificationStatus
                status_title={content.title}
                status_description={content.description}
                icon={content.icon}
                action_button={content.action_button?.(onClick, from_platform.name)}
            />
        );
    }

    if (detail !== null) {
        const is_onfido_supported =
            country_code === 'ng' &&
            !checkNimcStep(documents[detail ?? 0].details.documents) &&
            onfido &&
            onfido.submissions_left > 0;
        return (
            <DetailComponent
                is_onfido_supported={is_onfido_supported}
                country_code_key={country_code}
                document={documents[detail]}
                root_class='manual-poi'
                onClickBack={() => setDetail(null)}
                handlePOIforMT5Complete={handlePOIforMT5Complete}
                handleComplete={handleViewComplete}
                {...props}
            />
        );
    }

    return (
        <Timeline
            className={classNames('manual-poi', {
                'manual-poi--mobile': isMobile(),
            })}
            disabled_items={[2]}
        >
            <Timeline.Item item_title={localize('Please upload one of the following documents:')}>
                <Documents documents={documents} toggleDetail={toggleDetail} />
            </Timeline.Item>
            <Timeline.Item item_title={localize('Upload your selfie')}>
                <div />
            </Timeline.Item>
        </Timeline>
    );
};
export default Unsupported;
