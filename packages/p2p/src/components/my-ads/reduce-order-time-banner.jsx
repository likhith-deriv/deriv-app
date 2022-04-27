import { observer } from 'mobx-react-lite';
import plur from 'plur';
import React from 'react';
import { useStores } from 'Stores';
import { HintBox, Text } from '@deriv/components';
import { localize } from 'Components/i18next';
import { minutesToHoursAndDays } from 'Utils/date-time';

const generateBannerInformation = (value, text) => {
    if (value > 0) {
        return { value, text: value > 1 ? plur(text) : text };
    }
    return { value: '', text: '' };
};

const ReduceOrderTimeBanner = () => {
    const { general_store } = useStores();
    const { order_timeout } = general_store;

    const { days, hours, minutes } = minutesToHoursAndDays(order_timeout);

    if (days === 0 && hours === 0 && minutes === 0) {
        return null;
    }

    const time_in_days = generateBannerInformation(days, 'day');
    const time_in_hours = generateBannerInformation(hours, 'hour');
    const time_in_minutes = generateBannerInformation(minutes, 'minute');

    const render_banner_text = localize(
        'New orders are now active for {{days}} {{day_text}} {{hours}} {{hour_text}} {{minutes}} {{minute_text}} only. Complete your order before it expires!',
        {
            days: time_in_days.value,
            day_text: time_in_days.text,
            hours: time_in_hours.value,
            hour_text: time_in_hours.text,
            minutes: time_in_minutes.value,
            minute_text: time_in_minutes.text,
        }
    );

    return (
        <HintBox
            className='p2p-my-ads__warning'
            icon='IcInfo'
            message={
                <Text as='p' size='xxxs' color='prominent' line_height='xs'>
                    {render_banner_text}
                </Text>
            }
            is_info
        />
    );
};

export default observer(ReduceOrderTimeBanner);
