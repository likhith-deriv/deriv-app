import React from 'react';
import classnames from 'classnames';
import { Localize, useTranslations } from '@deriv-com/translations';
import { InlineMessage, Text } from '@deriv-com/ui';
import { usePoa } from '../../hooks';
import { AddressSection } from '../AddressSection';
import { DocumentSubmission } from '../DocumentSubmission';
import './POAMobile.scss';

const ProgressBar = ({ isActive }: { isActive: boolean }) => (
    <div className='wallet-progress-container'>
        <div className={classnames('wallet-progress-bar', { 'wallet-progress-bar--animate': isActive })} />
    </div>
);

type POAMobileProps = {
    countryCode: string;
    step: { id: number; text: string };
};

const POAMobile: React.FC<POAMobileProps> = ({ countryCode, step }) => {
    const { localize } = useTranslations();
    const { errorSettings } = usePoa();

    return (
        <div className='wallets-poa-mobile-layout'>
            <div className='wallets-poa-mobile-layout__header'>
                <Text as='p' className='wallet-timeline' size='2xs'>
                    <Localize
                        components={[<strong key={0} />]}
                        i18n_default_text='<0>Step {{step}}/2:&nbsp;</0> {{title}}'
                        values={{ step: step.id, title: step.text }}
                    />
                </Text>
                <div className='wallet-timeline__item'>
                    <ProgressBar isActive={step.id <= 2} />
                    <ProgressBar isActive={step.id === 2} />
                </div>
            </div>
            <div className='wallets-poa-mobile-layout__container'>
                {errorSettings?.message && (
                    <InlineMessage className='wallets-poa-mobile-layout__error-banner' variant='error'>
                        <Text>{localize(errorSettings.message)}</Text>
                    </InlineMessage>
                )}
                {step.id === 1 && <AddressSection hasError={Boolean(errorSettings?.message)} />}
                {step.id === 2 && <DocumentSubmission countryCode={countryCode as string} />}
            </div>
        </div>
    );
};

export default POAMobile;
