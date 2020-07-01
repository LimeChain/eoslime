import { BaseProvider } from '../provider';
import { ContractFunction } from '../contract';
import { TransactionResult, AuthorityDetails, BroadCastedTransaction } from '../miscellaneous';

interface ExecutiveAuthority {
    actor: string,
    permission: string;
}

interface EncryptedAccount {
    name: string;
    network: string;
    authority: ExecutiveAuthority;
    cipherText: string;
}

export class AccountFactory {

    constructor (provider: BaseProvider);

    public load (name: string, privateKey: string, authorityName?: string): Account;
    public create (accountName: string, privateKey: string, accountCreator?: Account): Promise<Account>;
    public createFromName (accountName: string, accountCreator?: Account): Promise<Account>;
    public createRandom (accountCreator?: Account): Promise<Account>;
    public createRandoms (accountsCount: number, accountCreator?: Account): Promise<Array<Account>>
    public createEncrypted (password: string, accountCreator?: Account): Promise<EncryptedAccount>;
    public fromEncrypted (encryptedAccount: EncryptedAccount, password: string): Account;
}

declare class BaseAccount {
    public name: string;
    public publicKey: string;
    public privateKey: string;
    public provider: BaseProvider;
    public authority: ExecutiveAuthority;

    constructor (name: string, privateKey: string, provider: BaseProvider, permission: string);
    public getAuthorityInfo (): Promise<AuthorityDetails>;
}

interface AuthorityAbilities {
    action: string;
    contract: string;
}

export class Account extends BaseAccount {

    constructor (name: string, privateKey: string, provider: BaseProvider, permission: string);

    public buyRam (bytes: number, payer?: Account): Promise<TransactionResult>;
    public buyBandwidth (cpu: string, net: string, payer?: Account): Promise<TransactionResult>;
    public send (receiver: Account, amount: string, symbol: string): Promise<TransactionResult>;
    public addAuthority (authorityName: string, threshold?: number): Promise<TransactionResult>;
    public setAuthorityAbilities (authorityName: string, abilities: Array<AuthorityAbilities>): Promise<TransactionResult>;
    public increaseThreshold (threshold: number): Promise<TransactionResult>;
    public addPermission (authorityName: string, weight?: number): Promise<TransactionResult>;
    public addOnBehalfAccount (accountName: string, authority?: string, weight?: number): Promise<TransactionResult>;
    public addOnBehalfKey (publicKey: string, weight?: number): Promise<TransactionResult>;
    public setWeight (weight: number): Promise<TransactionResult>;
    public getBalance (symbol?: string, code?: string): Promise<Array<string>>;
}

export class MultiSignatureFactory {

    constructor (provider: BaseProvider);
    public load (name: string, privateKey: string, authorityName?: string): MultiSignatureAccount;
}

export class MultiSignatureAccount extends BaseAccount {

    public accounts: Array<BaseAccount>;
    public proposals: Array<number>;

    constructor (name: string, privateKey: string, provider: BaseProvider, authority: string);

    public loadKeys (privateKeys: Array<string>): void;
    public loadAccounts (accounts: Array<Account>): void;
    public propose (contractAction: ContractFunction, actionData: Array<any>): Promise<number>;
    public approve (publicKey: string, proposalId: number): Promise<void>;
    public processProposal (proposalId: number): Promise<BroadCastedTransaction>;
}

