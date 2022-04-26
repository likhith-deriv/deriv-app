import React from 'react';
import PropTypes from 'prop-types';
import { formatMoney } from '@deriv/shared';
import { observer } from 'mobx-react-lite';
import { Text } from '@deriv/components';
import { buy_sell } from 'Constants/buy-sell';
import { Localize } from 'Components/i18next';
import { useStores } from 'Stores';
import { truncateDecimal } from 'Utils/format-value';

const CreateAdSummary = ({ market_feed, offer_amount, price_rate, type }) => {
    const { general_store } = useStores();
    const { currency, local_currency_config } = general_store.client;

    const display_offer_amount = offer_amount ? formatMoney(currency, offer_amount, true) : '';

    let display_price_rate = '';
    let display_total = '';

    if (market_feed && price_rate) {
        display_price_rate = formatMoney(
            local_currency_config.currency,
            truncateDecimal(parseFloat(market_feed * (1 + price_rate / 100)), 2),
            true
        );
    } else if (price_rate) {
        display_price_rate = formatMoney(local_currency_config.currency, price_rate, true);
    }

    if (market_feed && offer_amount && price_rate) {
        display_total = formatMoney(
            local_currency_config.currency,
            offer_amount * truncateDecimal(parseFloat(market_feed * (1 + price_rate / 100)), 2),
            true
        );
    } else if (offer_amount && price_rate) {
        display_total = formatMoney(local_currency_config.currency, offer_amount * price_rate, true);
    }

    if (offer_amount) {
        const components = [
            <Text key={0} weight='bold' size='xs' color='status-info-blue' />,
            <Text key={1} weight='normal' size='xs' color='status-info-blue' />,
        ];
        const values = { target_amount: display_offer_amount, target_currency: currency };

        if (price_rate) {
            Object.assign(values, {
                local_amount: display_total,
                local_currency: local_currency_config.currency,
                price_rate: display_price_rate,
            });

            if (type === buy_sell.BUY) {
                return (
                    <Localize
                        i18n_default_text="You're creating an ad to buy <0>{{ target_amount }} {{ target_currency }}</0> for <0>{{ local_amount }} {{ local_currency }}</0> <1>({{ price_rate }} {{local_currency}}/{{ target_currency }})</1>"
                        components={components}
                        values={values}
                    />
                );
            }

            return (
                <Localize
                    i18n_default_text="You're creating an ad to sell <0>{{ target_amount }} {{ target_currency }}</0> for <0>{{ local_amount }} {{ local_currency }}</0> <1>({{ price_rate }} {{local_currency}}/{{ target_currency }})</1>"
                    components={components}
                    values={values}
                />
            );
        }

        if (type === buy_sell.BUY) {
            return (
                <Localize
                    i18n_default_text="You're creating an ad to buy <0>{{ target_amount }} {{ target_currency }}</0>..."
                    components={components}
                    values={values}
                />
            );
        }

        return (
            <Localize
                i18n_default_text="You're creating an ad to sell <0>{{ target_amount }} {{ target_currency }}</0>..."
                components={components}
                values={values}
            />
        );
    }

    return type === buy_sell.BUY ? (
        <Localize i18n_default_text="You're creating an ad to buy..." />
    ) : (
        <Localize i18n_default_text="You're creating an ad to sell..." />
    );
};

CreateAdSummary.propTypes = {
    offer_amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    price_rate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    market_feed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    type: PropTypes.string,
};

export default observer(CreateAdSummary);
