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

    /**
     * @description Table query chain
     *
     * @param {string} table Contract table one wants to read data from
     * @returns {SelectQuery} Select query chain
     */
    public select (table: string): SelectQuery;

    /**
     * @description Retrieve contract ABI from the chain
     *
     * @param {string} contractName Name of the contract
     * @returns {Promise<any>} Contract ABI
     */
    public getABI (contractName: string): Promise<any>;

    /**
     * @description Retrieve contract WASM from the chain. Useful for deploying another contract directly
     *
     * @param {string} contractName Name of the contract
     * @returns {Promise<string>} Contract WASM
     */
    public getRawWASM (contractName: string): Promise<string>;
}

declare class ProviderFactory {

    private instance: Provider;
    private __provider: BaseProvider;

    constructor (network: string, config: NetworkDetails);

    /**
     * @description Reset provider to another one
     *
     * @param {BaseProvider} newProvider New provider the current one will be set to
     */
    public reset (newProvider: BaseProvider): void;

    /**
     * @description List of eoslime supported networks
     *
     * @returns {Array<string>} Supported networks names
     */
    public availableNetworks (): Array<string>;
}

export interface Provider extends BaseProvider, ProviderFactory {
    new(network?: string, config?: NetworkDetails): BaseProvider;
    new(config?: NetworkDetails): BaseProvider;
}

