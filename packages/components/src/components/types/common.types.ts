import React from 'react';
import { getCardLabels, getContractTypeDisplay, TGetSupportedContracts } from '@deriv/shared';

export type TGenericObjectType = {
    [key: string]: React.ReactNode;
};
export type TGetCardLables = () => ReturnType<typeof getCardLabels>;

export type TGetContractTypeDisplay = (
    type: TGetSupportedContracts,
    is_high_low: boolean
) => ReturnType<typeof getContractTypeDisplay>;

export type TItem = {
    id: string;
    value: Array<TItem> | string;
};

export type TTableRowItem = { component: React.ReactNode };
