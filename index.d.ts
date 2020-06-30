// Type definitions for EOSLime
// Project: https://github.com/LimeChain/eoslime
// Definitions by: Lyubomir Kiprov <https://github.com/bakasura980>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

import { utils } from './types/utils';
import { ContractFactory } from './types/contract';
import { Provider, NetworkDetails } from './types/provider';
import { AccountFactory, MultiSignatureFactory } from './types/account';

interface EOSLime {
    utils: utils;
    Provider: Provider;
    Account: AccountFactory;
    Contract: ContractFactory;
    MultiSigAccount: MultiSignatureFactory;
}

export const utils: utils;
export const NETWORKS: Array<string>;

export function init (network?: string, config?: NetworkDetails): EOSLime;
export function init (config?: NetworkDetails): EOSLime;
