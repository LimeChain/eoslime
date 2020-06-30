import { Account } from '../account';
import { SelectQuery } from '../table-reader';

export interface NetworkDetails {
    url?: string;
    chainId?: string;
}

interface NetworkData {
    name: string;
    url: string;
    chainId: string;
}

export class BaseProvider {
    public eos: any;
    public network: NetworkData;
    public defaultAccount: Account;

    constructor (networkConfig: NetworkData);

    public select (table: string): SelectQuery;
    public getABI (contractName: string): Promise<any>;
    public getRawWASM (contractName: string): Promise<string>;
}

declare class ProviderFactory {

    private instance: Provider;
    private __provider: BaseProvider;

    constructor (network: string, config: NetworkDetails);

    public reset (newProvider: BaseProvider): void;
    public availableNetworks (): Array<string>;
}

export interface Provider extends BaseProvider, ProviderFactory {
    new(network?: string, config?: NetworkDetails): BaseProvider;
    new(config?: NetworkDetails): BaseProvider;
}

