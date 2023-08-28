import React from 'react';
import { withRouter } from 'react-router-dom';
import { FadeWrapper, Loading } from '@deriv/components';
import { matchRoute, routes as shared_routes } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { flatten } from '../../Helpers/flatten';
import PageOverlayWrapper from './page-overlay-wrapper';
import 'Styles/account.scss';

// const onClickLogout = (logout, history) => {
//     history.push(shared_routes.index);
//     logout().then(() => (window.location.href = getStaticUrl('/')));
// };

// const PageOverlayWrapper = ({
//     is_from_derivgo,
//     is_appstore,
//     list_groups,
//     logout,
//     onClickClose,
//     selected_route,
//     subroutes,
//     history,
// }) => {
//     const routeToPrevious = () => history.push(shared_routes.traders_hub);

//     if (isMobile() && selected_route) {
//         return (
//             <PageOverlay
//                 header={selected_route.getTitle()}
//                 onClickClose={routeToPrevious}
//                 is_from_app={is_from_derivgo}
//             >
//                 <selected_route.component component_icon={selected_route.icon_component} />
//             </PageOverlay>
//         );
//     }
//     return (
//         <PageOverlay header={localize('Settings')} onClickClose={routeToPrevious} is_from_app={is_from_derivgo}>
//             <VerticalTab
//                 is_floating
//                 current_path={location.pathname}
//                 is_routed
//                 is_full_width
//                 list={subroutes}
//                 list_groups={list_groups}
//                 extra_content={<TradingHubLogout handleOnLogout={onClickLogout} />}
//             />
//         </PageOverlay>
//     );
// };

/**
 * Component that renders the account section
 * @name Account
 * @param history - history object passed from react-router-dom
 * @param location - location object passed from react-router-dom
 * @param routes - routes object passed from react-router-dom
 * @returns React component
 */
const Account = observer(({ history, location, routes }) => {
    const { client, ui } = useStore();
    const {
        is_virtual,
        is_logged_in,
        is_logging_in,
        is_risky_client,
        is_pending_proof_of_ownership,
        landing_company_shortcode,
        should_allow_authentication,
        // logout,
    } = client;
    // const { routeBackInApp } = common;
    const { toggleAccountSettings, is_account_settings_visible } = ui;
    // const { is_appstore } = React.useContext(PlatformContext);
    const subroutes = flatten(routes.map(i => i.subroutes));
    // let list_groups = [...routes];
    // list_groups = list_groups.map(route_group => ({
    //     icon: route_group.icon,
    //     label: route_group.getTitle(),
    //     subitems: route_group.subroutes.map(sub => subroutes.indexOf(sub)),
    // }));
    let selected_content = subroutes.find(r => matchRoute(r, location.pathname));
    // const onClickClose = React.useCallback(() => routeBackInApp(history), [routeBackInApp, history]);

    React.useEffect(() => {
        toggleAccountSettings(true);
    }, [toggleAccountSettings]);

    routes.forEach(menu_item => {
        menu_item.subroutes.forEach(route => {
            if (route.path === shared_routes.financial_assessment) {
                route.is_disabled = is_virtual || (landing_company_shortcode === 'maltainvest' && !is_risky_client);
            }

            if (route.path === shared_routes.trading_assessment) {
                route.is_disabled = is_virtual || landing_company_shortcode !== 'maltainvest';
            }

            if (route.path === shared_routes.proof_of_identity || route.path === shared_routes.proof_of_address) {
                route.is_disabled = !should_allow_authentication;
            }

            if (route.path === shared_routes.proof_of_ownership) {
                route.is_disabled = is_virtual || !is_pending_proof_of_ownership;
            }
        });
    });

    if (!selected_content) {
        // fallback
        selected_content = subroutes[0];
        history.push(shared_routes.personal_details);
    }

    if (!is_logged_in && is_logging_in) {
        return <Loading is_fullscreen className='account__initial-loader' />;
    }

    // const selected_route = getSelectedRoute({ routes: subroutes, pathname: location.pathname });

    return (
        <FadeWrapper
            is_visible={is_account_settings_visible}
            className='account-page-wrapper'
            keyname='account-page-wrapper'
        >
            <div className='account'>
                {/* <PageOverlayWrapper
                    is_from_derivgo={is_from_derivgo}
                    is_appstore={is_appstore}
                    list_groups={list_groups}
                    logout={logout}
                    onClickClose={onClickClose}
                    platform={platform}
                    selected_route={selected_route}
                    subroutes={subroutes}
                    history={history}
                /> */}
                <PageOverlayWrapper routes={routes} subroutes={subroutes} />
            </div>
        </FadeWrapper>
    );
});

Account.displayName = 'Account';

export default withRouter(Account);
