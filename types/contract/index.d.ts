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

    /* Own functions */
    public at (contractName: string, contractExecutorAccount?: Account): Promise<Contract>;
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
    public deploy (wasmPath: string, abiPath: string, options?: DeployOptions): Promise<Contract>;
    public deployRaw (wasm: string, abi: any, options?: DeployOptions): Promise<Contract>;
    public deployOnAccount (wasmPath: string, abiPath: string, contractAccount: Account, options?: DeployOptions): Promise<Contract>;
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
    getRawTransaction (params: any[], options?: ContractFunctionOptions): Promise<RawTransaction>;
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

    public makeInline (): Promise<void>;
    public getRawWASM (): Promise<any>;
}
