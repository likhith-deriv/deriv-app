import React from 'react';
import { AUTH_STATUS_CODES, isNavigationFromDerivGO, isNavigationFromP2P } from '@deriv/shared';
import { Localize } from '@deriv/translations';
import VerificationStatusActionButton from '../../../Components/verification-status-action-button';

type TAuthStatus = {
    needs_poi?: boolean;
    is_submitted?: boolean;
};

export const getPOAStatusMessages = (
    status: typeof AUTH_STATUS_CODES[keyof typeof AUTH_STATUS_CODES],
    auth_status?: TAuthStatus,
    should_show_redirect_btn?: boolean
) => {
    const is_redirected_from_platform = isNavigationFromP2P() || isNavigationFromDerivGO();

    const pendingButton = (onClick?: () => void, platform_name?: string) => {
        if (!auth_status?.needs_poi) {
            if (should_show_redirect_btn)
                return (
                    <VerificationStatusActionButton
                        button_text={
                            <Localize i18n_default_text='Back to {{platform_name}}' values={{ platform_name }} />
                        }
                        onClick={onClick}
                    />
                );
            if (!is_redirected_from_platform) {
                return (
                    <VerificationStatusActionButton
                        to='/'
                        button_text={<Localize i18n_default_text='Continue trading' />}
                    />
                );
            }
        }
        if (auth_status?.needs_poi) {
            return (
                <VerificationStatusActionButton
                    to='/account/proof-of-identity'
                    button_text={<Localize i18n_default_text='Proof of identity' />}
                />
            );
        }
        return null;
    };

    const resubmitButton = (onClick?: () => void) => (
        <VerificationStatusActionButton button_text={<Localize i18n_default_text={'Resubmit'} />} onClick={onClick} />
    );

    const verifiedButton = (onClick?: () => void, platform_name?: string) => {
        if (auth_status?.needs_poi) {
            return (
                <VerificationStatusActionButton
                    to='/account/proof-of-identity'
                    button_text={<Localize i18n_default_text='Proof of identity' />}
                />
            );
        }
        if (should_show_redirect_btn)
            return (
                <VerificationStatusActionButton
                    button_text={<Localize i18n_default_text='Back to {{platform_name}}' values={{ platform_name }} />}
                    onClick={onClick}
                />
            );
        if (!is_redirected_from_platform) {
            return (
                <VerificationStatusActionButton
                    to='/'
                    button_text={<Localize i18n_default_text='Continue trading' />}
                />
            );
        }
        return null;
    };

    const titles: Record<typeof status, React.ReactElement> = {
        expired: <Localize i18n_default_text={'New proof of address is needed'} />,
        none: <Localize i18n_default_text={'Proof of address verification not required'} />,
        pending: auth_status?.is_submitted ? (
            <Localize i18n_default_text={'Your documents were submitted successfully'} />
        ) : (
            <Localize i18n_default_text={'Your proof of address was submitted successfully'} />
        ),
        rejected: <Localize i18n_default_text={'We could not verify your proof of address'} />,
        suspected: <Localize i18n_default_text={'We could not verify your proof of address'} />,
        verified: <Localize i18n_default_text={'Your proof of address is verified'} />,
    };

    const descriptions: Record<typeof status, React.ReactElement | null> = {
        expired: (
            <Localize i18n_default_text={'Your documents for proof of address is expired. Please submit again.'} />
        ),
        none: (
            <Localize
                i18n_default_text={
                    'Your account does not need address verification at this time. We will inform you if address verification is required in the future.'
                }
            />
        ),
        pending: (
            <div>
                {auth_status?.is_submitted ? (
                    <Localize
                        i18n_default_text={
                            'We’ll review your documents and notify you of its status within 1 to 3 days.'
                        }
                    />
                ) : (
                    <Localize i18n_default_text={'Your document is being reviewed, please check back in 1-3 days.'} />
                )}
                {auth_status?.needs_poi && (
                    <>
                        <br /> <Localize i18n_default_text={'You must also submit a proof of identity.'} />
                    </>
                )}
            </div>
        ),
        rejected: <Localize i18n_default_text={'Please check your email for details.'} />,
        suspected: <Localize i18n_default_text={'Please check your email for details.'} />,
        verified: auth_status?.needs_poi ? (
            <Localize i18n_default_text={'To continue trading, you must also submit a proof of identity.'} />
        ) : null,
    };

    const icons: Record<typeof status, string> = {
        expired: 'IcPoaUpload',
        none: 'IcPoaVerified',
        pending: 'IcPoaVerified',
        rejected: 'IcPoaError',
        suspected: 'IcPoaError',
        verified: 'IcPoaVerified',
    };

    const action_buttons: Record<
        typeof status,
        null | ((onClick?: () => void, platform_name?: string) => JSX.Element | null)
    > = {
        expired: resubmitButton,
        none: null,
        pending: pendingButton,
        rejected: resubmitButton,
        suspected: resubmitButton,
        verified: verifiedButton,
    };

    return {
        title: titles[status],
        description: descriptions[status],
        icon: icons[status],
        action_button: action_buttons[status],
    };
};
