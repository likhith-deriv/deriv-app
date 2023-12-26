import React, { FC, Fragment } from 'react';
import { useActiveTradingAccount, useCtraderServiceToken } from '@deriv/api';
import { Button, Text } from '@deriv/quill-design';
import { getPlatformFromUrl } from '../../../../../helpers/urls';
import { THooks, TPlatforms } from '../../../../../types';
import { AppToContentMapper, PlatformDetails, PlatformToLabelIconMapper, PlatformUrls } from '../../../constants';

type TMT5TradeLinkProps = {
    app?: keyof typeof AppToContentMapper;
    platform?: TPlatforms.All;
    webtraderUrl?: THooks.MT5AccountsList['webtrader_url'];
};

const MT5TradeLink: FC<TMT5TradeLinkProps> = ({ app = 'linux', platform, webtraderUrl = '' }) => {
    const content = AppToContentMapper[app];
    const { data: ctraderToken } = useCtraderServiceToken();

    const { data: activeAccount } = useActiveTradingAccount();

    const isDemo = activeAccount?.is_virtual;

    const mt5Platform = PlatformDetails.mt5.platform;
    const dxtradePlatform = PlatformDetails.dxtrade.platform;
    const ctraderPlatform = PlatformDetails.ctrader.platform;

    const onClickWebTerminal = () => {
        const { isStaging, isTestLink } = getPlatformFromUrl();
        let url;
        const platformType = isDemo ? 'demo' : 'live';
        const ctraderType = isTestLink || isStaging ? 'staging' : 'live';

        if (platform === dxtradePlatform || platform === ctraderPlatform) {
            url = PlatformUrls[platform][platform === ctraderPlatform ? ctraderType : platformType];
            if (platform === ctraderPlatform && ctraderToken) {
                url += `?token=${ctraderToken}`;
            }
        } else return '';

        window.open(url);
    };

    return (
        <div className='flex items-center justify-between border-t border-system-light-secondary-background px-800 py-1200'>
            <div className='flex items-center gap-800'>
                {(platform === mt5Platform || app === ctraderPlatform) && (
                    <Fragment>
                        <div className='w-1600 h-1600'>{content.icon}</div>
                        <Text size='sm'>{content.title}</Text>
                    </Fragment>
                )}
                {platform !== mt5Platform && app !== ctraderPlatform && (
                    <Text size='sm'>Run {PlatformDetails[platform ?? dxtradePlatform].title} on your browser</Text>
                )}
            </div>
            {(platform === mt5Platform || app === ctraderPlatform) && (
                <Button
                    onClick={() => window.open(app === 'web' ? webtraderUrl : content.link)}
                    size='sm'
                    variant='outlined'
                >
                    {content.text}
                </Button>
            )}
            {platform !== mt5Platform && app !== ctraderPlatform && (
                <Button
                    className='flex justify-center items-center border-none rounded-md cursor-pointer bg-system-dark-primary-background p-400 gap-400'
                    colorStyle='black'
                    onClick={onClickWebTerminal}
                    variant='secondary'
                >
                    {PlatformToLabelIconMapper[platform ?? dxtradePlatform]}
                    <Text bold colorStyle='white' size='sm'>
                        Web terminal
                    </Text>
                </Button>
            )}
        </div>
    );
};

export default MT5TradeLink;
