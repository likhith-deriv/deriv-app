import * as React from 'react';
import classNames from 'classnames';
import { Icon, Popover, StaticUrl } from '@deriv/components';
import { useDevice } from '@deriv-com/ui';
import { routes, platforms } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { Localize } from '@deriv/translations';
import { useAccountSettingsRedirect } from '@deriv/hooks';
import { MenuLinks } from 'App/Components/Layout/Header';
import platform_config from 'App/Constants/platform-config';
import ToggleMenuDrawer from 'App/Components/Layout/Header/toggle-menu-drawer.jsx';
import { BinaryLink } from 'App/Components/Routes';
import DerivBrandShortLogo from 'Assets/SvgComponents/header/deriv-logo-short.svg';
import RealAccountSignup from 'App/Containers/RealAccountSignup';
import SetAccountCurrencyModal from 'App/Containers/SetAccountCurrencyModal';
import CurrencySelectionModal from '../../CurrencySelectionModal';
import DefaultMobileLinks from './default-mobile-links';
import ShowNotifications from './show-notifications';
import TradersHubOnboarding from './traders-hub-onboarding';
import TradersHubHomeButton from './traders-hub-home-button';

type TPlatformConfig = typeof platform_config;
type TPlatforms = typeof platforms;

const TradersHubHeaderWallets = observer(() => {
    const { client, common, traders_hub, ui } = useStore();
    const { is_logged_in, is_mt5_allowed } = client;
    const { platform } = common;
    const { modal_data } = traders_hub;
    const { header_extension, is_app_disabled, is_route_modal_on } = ui;
    const { isDesktop } = useDevice();

    const { redirect_url } = useAccountSettingsRedirect();

    const accountSettings = (
        <a className='traders-hub-header__setting' href={redirect_url}>
            <Icon icon='IcUserOutline' size={20} />
        </a>
    );

    const filterPlatformsForClients = (payload: TPlatformConfig) =>
        payload.filter(config => {
            if (config.link_to === routes.mt5) {
                return !is_logged_in || is_mt5_allowed;
            }
            return true;
        });

    return (
        <header
            className={classNames('traders-hub-header', {
                'traders-hub-header--is-disabled': is_app_disabled || is_route_modal_on,
                'traders-hub-header--is-hidden': platforms[platform as keyof TPlatforms],
            })}
        >
            <div className='traders-hub-header__menu-left'>
                {isDesktop ? (
                    <React.Fragment>
                        <div className='traders-hub-header-wallets__logo'>
                            <StaticUrl href='/'>
                                <DerivBrandShortLogo />
                            </StaticUrl>
                        </div>
                        <div className='traders-hub-header__divider' />
                        <TradersHubHomeButton />
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <ToggleMenuDrawer {...{ platform_config: filterPlatformsForClients(platform_config) }} />
                        {header_extension && is_logged_in && <div>{header_extension}</div>}
                        <div className={'traders-hub-header__logo-wrapper'}>
                            <div className='traders-hub-header-wallets__logo'>
                                <StaticUrl href='/'>
                                    <DerivBrandShortLogo />
                                </StaticUrl>
                            </div>
                        </div>
                    </React.Fragment>
                )}
                <MenuLinks {...{ is_traders_hub_routes: true }} />
            </div>
            {isDesktop ? (
                <React.Fragment>
                    <div className='traders-hub-header__menu-right'>
                        <div className='traders-hub-header__divider' />
                        <div className='traders-hub-header__menu-right--items'>
                            <div className='traders-hub-header__menu-right--items--onboarding'>
                                <TradersHubOnboarding />
                            </div>
                            <div className='traders-hub-header__menu-right--items--notifications'>
                                <ShowNotifications />
                            </div>
                            <Popover
                                classNameBubble='account-settings-toggle__tooltip'
                                alignment='bottom'
                                message={<Localize i18n_default_text='Manage account settings' />}
                                should_disable_pointer_events
                                zIndex='9999'
                            >
                                {accountSettings}
                            </Popover>
                        </div>
                    </div>
                    <RealAccountSignup />
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <div className='traders-hub-header__mobile-parent'>
                        <div className='traders-hub-header__menu-middle'>
                            <DefaultMobileLinks />
                        </div>
                    </div>
                    <RealAccountSignup />
                </React.Fragment>
            )}
            <SetAccountCurrencyModal />
            <CurrencySelectionModal is_visible={modal_data.active_modal === 'currency_selection'} />
        </header>
    );
});

export default TradersHubHeaderWallets;
