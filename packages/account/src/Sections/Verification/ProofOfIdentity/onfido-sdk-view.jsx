import * as React from 'react';
import classNames from 'classnames';
import countries from 'i18n-iso-countries';
import * as Cookies from 'js-cookie';
import { init } from 'onfido-sdk-ui';
import { CSSTransition } from 'react-transition-group';
import { HintBox, Loading, Text, ThemedScrollbars } from '@deriv/components';
import { isMobile, WS } from '@deriv/shared';
import { getLanguage, Localize } from '@deriv/translations';
import ErrorMessage from 'Components/error-component';
import getOnfidoPhrases from 'Constants/onfido-phrases';
import MissingPersonalDetails from 'Components/poi/missing-personal-details';
import PoiConfirmWithExample from 'Components/poi/poi-confirm-with-example';

const OnfidoSdkView = ({ country_code, documents_supported, handleViewComplete, height, is_from_external }) => {
    const [api_error, setAPIError] = React.useState();
    const [onfido_service_token, setOnfidoToken] = React.useState();
    const [missing_personal_details, setMissingPersonalDetails] = React.useState(false);
    const [is_status_loading, setStatusLoading] = React.useState(true);
    const [retry_count, setRetryCount] = React.useState(0);
    const [is_onfido_disabled, setIsOnfidoDisabled] = React.useState(true);
    const token_timeout_ref = React.useRef();
    const [are_details_saved, setAreDetailsSaved] = React.useState(false);
    const [is_status_message_visible, setIsStatusMessageVisible] = React.useState(false);

    // IDV country code - Alpha ISO2. Onfido country code - Alpha ISO3
    // Ensures that any form of country code passed here is supported.
    const onfido_country_code =
        country_code.length !== 3 ? countries.alpha2ToAlpha3(country_code.toUpperCase()) : country_code;

    // Service Token country code - Alpha ISO2
    const token_country_code =
        country_code.length !== 2 ? countries.alpha3ToAlpha2(country_code.toUpperCase()) : country_code;

    // Onfido `document_supported` checks are made for an array of string.
    // Ensure that `document_supported` passed respects this no the matter source.
    const onfido_documents = Array.isArray(documents_supported)
        ? documents_supported
        : Object.keys(documents_supported).map(d => documents_supported[d].display_name);

    const onfido_init = React.useRef();

    const onComplete = React.useCallback(
        data => {
            onfido_init?.current?.tearDown();
            const document_ids = Object.keys(data).map(key => data[key].id);

            WS.notificationEvent({
                notification_event: 1,
                category: 'authentication',
                event: 'poi_documents_uploaded',
                args: {
                    documents: document_ids,
                },
            }).then(response => {
                if (response.error) {
                    setAPIError(response.error);
                    return;
                }
                handleViewComplete();
            });
        },
        [setAPIError, handleViewComplete]
    );

    const initOnfido = React.useCallback(async () => {
        try {
            const onfido_ref = await init({
                containerId: 'onfido',
                language: {
                    locale: getLanguage().toLowerCase() || 'en',
                    phrases: getOnfidoPhrases(),
                    mobilePhrases: getOnfidoPhrases(),
                },
                token: onfido_service_token,
                useModal: false,
                useMemoryHistory: true,
                onComplete,
                steps: [
                    {
                        type: 'document',
                        options: {
                            documentTypes: {
                                passport: onfido_documents.some(doc => /Passport/g.test(doc)),
                                driving_licence: onfido_documents.some(doc => /Driving Licence/g.test(doc))
                                    ? {
                                          country: onfido_country_code,
                                      }
                                    : false,
                                national_identity_card: onfido_documents.some(doc =>
                                    /National Identity Card/g.test(doc)
                                )
                                    ? {
                                          country: onfido_country_code,
                                      }
                                    : false,
                            },
                        },
                    },
                    'face',
                ],
            });
            onfido_init.current = onfido_ref;
        } catch (err) {
            setAPIError(err);
        }
    }, [onfido_service_token, onComplete, onfido_documents, onfido_country_code]);

    const getOnfidoServiceToken = React.useCallback(
        () =>
            new Promise(resolve => {
                const onfido_cookie_name = 'onfido_token';
                const onfido_cookie = Cookies.get(onfido_cookie_name);

                if (!onfido_cookie) {
                    WS.serviceToken({
                        service_token: 1,
                        service: 'onfido',
                        country: token_country_code,
                    }).then(response => {
                        if (response.error) {
                            resolve({ error: response.error });
                            return;
                        }
                        const { token } = response.service_token.onfido;
                        const in_90_minutes = 1 / 16;
                        Cookies.set(onfido_cookie_name, token, {
                            expires: in_90_minutes,
                            secure: true,
                            sameSite: 'strict',
                        });
                        resolve(token);
                    });
                } else {
                    resolve(onfido_cookie);
                }
            }),
        [token_country_code]
    );

    const handleError = error => {
        switch (error.code) {
            case 'MissingPersonalDetails':
                setMissingPersonalDetails('all');
                break;
            case 'InvalidPostalCode':
                setMissingPersonalDetails('postal_code');
                break;
            default:
                setAPIError(error);
                break;
        }
    };

    const fetchServiceToken = () => {
        getOnfidoServiceToken().then(response_token => {
            if (response_token.error) {
                handleError(response_token.error);
                setStatusLoading(false);
                setRetryCount(retry_count + 1);
            } else {
                setOnfidoToken(response_token);
                initOnfido().then(() => {
                    setStatusLoading(false);
                });
            }
            if (token_timeout_ref.current) clearTimeout(token_timeout_ref.current);
        });
    };

    const onConfirm = () => {
        setTimeout(() => {
            setIsOnfidoDisabled(false);
            setAreDetailsSaved(true);
            setIsStatusMessageVisible(true);
        }, 800);
        setTimeout(() => {
            setIsStatusMessageVisible(false);
        }, 4650);
    };

    React.useEffect(() => {
        // retry state will re-run the token fetching
        if (retry_count === 0) {
            fetchServiceToken();
        } else if (retry_count !== 0 && retry_count < 3) {
            // Incorporating Exponential_backoff algo to prevent immediate throttling
            token_timeout_ref.current = setTimeout(() => {
                fetchServiceToken();
            }, Math.pow(2, retry_count) + Math.random() * 1000);
        }
    }, [getOnfidoServiceToken, initOnfido, retry_count]);

    let component_to_load;

    if (is_status_loading) {
        component_to_load = <Loading is_fullscreen={false} />;
    } else if (missing_personal_details) {
        component_to_load = (
            <MissingPersonalDetails
                has_invalid_postal_code={missing_personal_details === 'postal_code'}
                from='proof_of_identity'
            />
        );
    } else if (retry_count >= 3 && api_error) {
        // Error message will only display if retry count exceeds 3
        component_to_load = <ErrorMessage error_message={api_error?.message || api_error} />;
    }

    return (
        <ThemedScrollbars is_bypassed={isMobile()} height={height}>
            <div className='onfido-container'>
                {component_to_load ||
                    (!is_from_external && (
                        <CSSTransition
                            appear={!are_details_saved}
                            in={!are_details_saved}
                            timeout={{
                                exit: 350,
                            }}
                            classNames={{
                                exit: 'account-form__poi-confirm-example_container--exit',
                            }}
                            unmountOnExit
                        >
                            <div className='account-form__poi-confirm-example_container'>
                                <PoiConfirmWithExample onFormConfirm={onConfirm} />
                            </div>
                        </CSSTransition>
                    ))}
                <CSSTransition
                    appear={is_status_message_visible}
                    in={is_status_message_visible}
                    timeout={{
                        exit: 350,
                    }}
                    classNames={{
                        exit: 'onfido-container__status-message--exit',
                    }}
                    unmountOnExit
                >
                    <HintBox
                        className='onfido-container__status-message'
                        icon='IcAlertAnnounce'
                        icon_height={16}
                        icon_width={16}
                        message={
                            <Text as='p' size='xs'>
                                <Localize i18n_default_text='Hit the checkbox above to choose your document.' />
                            </Text>
                        }
                        is_info
                    />
                </CSSTransition>
                <div style={{ position: 'relative' }}>
                    {is_onfido_disabled && (
                        <HintBox
                            className='onfido-container__info-message'
                            icon='IcInfoBlue'
                            icon_height={16}
                            icon_width={16}
                            message={
                                <Text as='p' size='xxxs'>
                                    <Localize i18n_default_text='Hit the checkbox above to choose your document.' />
                                </Text>
                            }
                            is_info
                        />
                    )}
                    <div
                        id='onfido'
                        className={classNames({
                            'onfido-container__disabled': is_onfido_disabled,
                            'onfido-container__hidden': component_to_load,
                        })}
                    />
                </div>
            </div>
        </ThemedScrollbars>
    );
};

export default OnfidoSdkView;
