import { FromQuery } from '../table-reader';
import { BaseProvider } from '../provider';
import { Account, BaseAccount } from '../account';
import { TransactionResult, RawTransaction, SignedTransaction } from '../miscellaneous';

declare abstract class EventClass {
    public events: Array<string>;
    public eventsHooks: Map<string, (...params: any[]) => void>;

    constructor (events: Array<string>);

    public on (eventName: string, callback: (...params: any[]) => void): void;
    public emit (eventName: string, ...params: any[]): void;
}

declare class ContractInitializator extends EventClass {

    constructor (provider: BaseProvider);

    /**
     * @description Instantiate a contract by retrieving the ABI from the chain
     *
     * @param {string} contractName Contract name of the contract one wants to instantiate
     * @param {Account} [contractExecutorAccount] Account responsible for signing and broadcasting transactions
     * @returns {Promise<Contract>} Instantiated contract
     */
    public at (contractName: string, contractExecutorAccount?: Account): Promise<Contract>;

    /**
     * @description Instantiate a contract by providing the ABI
     *
     * @param {*} abi Contract ABI
     * @param {string} contractName Contract name of the contract one wants to instantiate
     * @param {Account} [contractExecutorAccount] Account responsible for signing and broadcasting transactions
     * @returns {Contract} Instantiated contract
     */
    public fromFile (abi: any, contractName: string, contractExecutorAccount?: Account): Contract
}


interface DeployOptions {
    inline: boolean;
}

export class ContractFactory extends ContractInitializator {

    constructor (provider: BaseProvider);

    /* Overwrite EventClass */
    public on (eventName: 'init', callback: (contract: Contract) => void): void;
    public on (eventName: 'deploy', callback: (contract: Contract, deployTx: [TransactionResult, TransactionResult]) => void): void;

    /* Own functions */

    /**
     * @description Deploy a new contract on a random generated account from ABI and WASM files
     *
     * @param {string} wasmPath Path to the contract WASM file 
     * @param {string} abiPath Path to the contract ABI file
     * @param {DeployOptions} [options] 
     * @returns {Promise<Contract>} Deployed contract
     */
    public deploy (wasmPath: string, abiPath: string, options?: DeployOptions): Promise<Contract>;

    /**
     * @description Deploy a new contract on a random generated account from loaded ABI and WASM 
     *
     * @param {string} wasm Contract WASM
     * @param {*} abi Contract ABI
     * @param {DeployOptions} [options]
     * @returns {Promise<Contract>} Deployed contract
     */
    public deployRaw (wasm: string, abi: any, options?: DeployOptions): Promise<Contract>;

    /**
     * @description Deploy a new contract on the provided account from ABI and WASM files
     *
     * @param {string} wasmPath Path to the contract WASM file 
     * @param {string} abiPath Path to the contract ABI file
     * @param {Account} contractAccount Account the contract will be deployed on
     * @param {DeployOptions} [options]
     * @returns {Promise<Contract>} Deployed contract
     */
    public deployOnAccount (wasmPath: string, abiPath: string, contractAccount: Account, options?: DeployOptions): Promise<Contract>;

    /**
     * @description Deploy a new contract on the provided account from loaded ABI and WASM 
     *
     * @param {string} wasm Contract WASM
     * @param {*} abi Contract ABI
     * @param {Account} contractAccount Account the contract will be deployed on
     * @param {DeployOptions} [options]
     * @returns {Promise<Contract>} Deployed contract
     */
    public deployRawOnAccount (wasm: string, abi: any, contractAccount: Account, options?: DeployOptions): Promise<Contract>;
}

interface ContractFunctionOptions {
    from?: BaseAccount;
    unique?: boolean;
    tokens?: string
}

export interface ContractFunction extends EventClass {

    (params: any[], options?: ContractFunctionOptions): Promise<TransactionResult>;

    /* Overwrite EventClass */
    on (eventName: 'processed', callback: (txResult: TransactionResult, ...fnParams: any[]) => void): void;

    /* Own functions */

    /**
     * @description Construct raw transaction for an action
     *
     * @param {any[]} params Action arguments
     * @param {ContractFunctionOptions} [options]
     * @returns {Promise<RawTransaction>} Raw transaction
     */
    getRawTransaction (params: any[], options?: ContractFunctionOptions): Promise<RawTransaction>;

    /**
     * @description Sign action and return a ready-to-broadcast transaction
     *
     * @param {any[]} params Action arguments
     * @param {ContractFunctionOptions} [options]
     * @returns {Promise<SignedTransaction>} Ready to broadcast transaction
     */
    sign (params: any[], options?: ContractFunctionOptions): Promise<SignedTransaction>;
}

interface ContractFunctions {
    [prop: string]: ContractFunction;
}

interface ContractTables {
    [prop: string]: FromQuery;
}

export class Contract {
    public abi: any;
    public name: string;
    public executor: BaseAccount;
    public provider: BaseProvider;

    public tables: ContractTables;
    public actions: ContractFunctions;

    constructor (provider: BaseProvider, abi: any, contractName: string, contractExecutorAccount: Account);

    /**
     * @description Enable the contract to make inline actions
     *
     * @returns {Promise<void>} void
     */
    public makeInline (): Promise<void>;

    /**
     * @description Retrieve contract raw WASM
     *
     * @returns {Promise<string>} Contract raw WASM
     */
    public getRawWASM (): Promise<string>;
}
