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

    /**
     *
     * @description Load existing network account
     * @param {string} name Account name
     * @param {string} privateKey Private key of the signer
     * @param {string} [authorityName] Authority account will act from
     * @returns {Account} Loaded account
     */
    public load (name: string, privateKey: string, authorityName?: string): Account;

    /**
     * @description Creates a fresh new account for a given name and private key
     * 
     * @param {string} accountName Desired name of the created account
     * @param {string} privateKey Desired private key of the created account
     * @param {Account} [accountCreator] Another account responsible for paying creation fees
     * @returns {Promise<Account>} Created account
     */
    public create (accountName: string, privateKey: string, accountCreator?: Account): Promise<Account>;

    /**
     * @description Creates a fresh new account for a given name
     *
     * @param {string} accountName Desired name of the created account
     * @param {Account} [accountCreator] Another account responsible for paying creation fees
     * @returns {Promise<Account>} Created account
     */
    public createFromName (accountName: string, accountCreator?: Account): Promise<Account>;

    /**
     * @description Create new random account
     *
     * @param {Account} [accountCreator] Another account responsible for paying creation fees
     * @returns {Promise<Account>} Created account
     */
    public createRandom (accountCreator?: Account): Promise<Account>;

    /**
     * @description Create new random accounts
     *
     * @param {number} accountsCount Number of accounts to be created
     * @param {Account} [accountCreator] Another account responsible for paying creation fees
     * @returns {Promise<Array<Account>>} Array of created account
     */
    public createRandoms (accountsCount: number, accountCreator?: Account): Promise<Array<Account>>

    /**
     * @description Create a new random account and encrypt it.
     *
     * @param {string} password Password the account data will be encrypted with
     * @param {Account} [accountCreator] Another account responsible for paying creation fees
     * @returns {Promise<EncryptedAccount>} Encrypted account data in JSON
     */
    public createEncrypted (password: string, accountCreator?: Account): Promise<EncryptedAccount>;

    /**
     * @description Decrypt an encrypted account
     *
     * @param {EncryptedAccount} encryptedAccount JSON format of the encrypted account
     * @param {string} password Password for decrypting
     * @returns {Account} Decrypted account
     */
    public fromEncrypted (encryptedAccount: EncryptedAccount, password: string): Account;
}

declare class BaseAccount {
    public name: string;
    public publicKey: string;
    public privateKey: string;
    public provider: BaseProvider;
    public authority: ExecutiveAuthority;

    constructor (name: string, privateKey: string, provider: BaseProvider, permission: string);

    /**
     * @description Returns information for loaded authority
     *
     * @returns {Promise<AuthorityDetails>}
     */
    public getAuthorityInfo (): Promise<AuthorityDetails>;
}

interface AuthorityAbilities {
    action: string;
    contract: string;
}

export class Account extends BaseAccount {

    constructor (name: string, privateKey: string, provider: BaseProvider, permission: string);

    /**
     * @description Buy ram for this account
     *
     * @param {number} bytes Number of RAM bytes
     * @param {Account} [payer] Another account responsible for paying
     * @returns {Promise<TransactionResult>} Transaction receipt
     */
    public buyRam (bytes: number, payer?: Account): Promise<TransactionResult>;

    /**
     * @description Buy cpu and network for this account
     *
     * @param {string} cpu Amount of tokens one want to buy cpu for
     * @param {string} net Amount of tokens one want to buy net for
     * @param {Account} [payer] Another account responsible for paying
     * @returns {Promise<TransactionResult>} Transaction receipt
     */
    public buyBandwidth (cpu: string, net: string, payer?: Account): Promise<TransactionResult>;

    /**
     * @description Send tokens to another account
     *
     * @param {Account} receiver Account tokens will be sent to
     * @param {string} amount Tokens amount
     * @param {string} symbol Token symbol
     * @returns {Promise<TransactionResult>} Transaction receipt
     */
    public send (receiver: Account, amount: string, symbol: string): Promise<TransactionResult>;

    /**
     * @description Add sub authority to the current account's one
     *
     * @param {string} authorityName Desired name of the new authority
     * @param {number} [threshold] Desired threshold of the new authority
     * @returns {Promise<TransactionResult>} Transaction receipt
     */
    public addAuthority (authorityName: string, threshold?: number): Promise<TransactionResult>;

    /**
     * @description Define what actions of which contracts the authority has permissions to execute
     *
     * @param {string} authorityName Sub authority one is setting permissions for
     * @param {Array<AuthorityAbilities>} abilities Array of permissions
     * @returns {Promise<TransactionResult>} Transaction receipt
     */
    public setAuthorityAbilities (authorityName: string, abilities: Array<AuthorityAbilities>): Promise<TransactionResult>;

    /**
     * @description Increase authority's threshold
     *
     * @param {number} threshold Number of desired threshold
     * @returns {Promise<TransactionResult>} Transaction receipt
     */
    public increaseThreshold (threshold: number): Promise<TransactionResult>;

    /**
     * @description Add permission to authority such as eosio.code
     *
     * @param {string} authorityName Permissions [eosio.code]
     * @param {number} [weight] Weight of the permission
     * @returns {Promise<TransactionResult>} Transaction receipt
     */
    public addPermission (authorityName: string, weight?: number): Promise<TransactionResult>;

    /**
     * @description Allow another account to act from your account's authority
     *
     * @param {string} accountName Name of another account
     * @param {string} [authority] Authority of another account
     * @param {number} [weight] Weight another account has
     * @returns {Promise<TransactionResult>} Transaction receipt
     */
    public addOnBehalfAccount (accountName: string, authority?: string, weight?: number): Promise<TransactionResult>;

    /**
     * @description Allow more keys to sign transactions from your account
     *
     * @param {string} publicKey Allowed public key
     * @param {number} [weight] Weight the key has
     * @returns {Promise<TransactionResult>} Transaction receipt
     */
    public addOnBehalfKey (publicKey: string, weight?: number): Promise<TransactionResult>;

    /**
     * @description Set weight on account public key.
     *
     * @param {number} weight Number of weight
     * @returns {Promise<TransactionResult>} Transaction receipt
     */
    public setWeight (weight: number): Promise<TransactionResult>;

    /**
     * @description Returns the balance of provided token account has 
     *
     * @param {string} [symbol] Token symbol
     * @param {string} [code] Token contract name
     * @returns {Promise<Array<string>>} Balance
     */
    public getBalance (symbol?: string, code?: string): Promise<Array<string>>;
}

export class MultiSignatureFactory {

    constructor (provider: BaseProvider);

    /**
     * @description Load existing network multisig account
     *
     * @param {string} name Account name 
     * @param {string} privateKey Private key of one of the multisig owners
     * @param {string} [authorityName] Authority the multisig will act from
     * @returns {MultiSignatureAccount} Loaded multisig account
     */
    public load (name: string, privateKey: string, authorityName?: string): MultiSignatureAccount;
}

export class MultiSignatureAccount extends BaseAccount {

    public accounts: Array<BaseAccount>;
    public proposals: Array<number>;

    constructor (name: string, privateKey: string, provider: BaseProvider, authority: string);

    /**
     * @description Load the private keys of the authority public keys in order to approve transactions with them 
     *
     * @param {Array<string>} privateKeys Private keys one will use to approve transactions with
     */
    public loadKeys (privateKeys: Array<string>): void;

    /**
     * @description Load the accounts configured to act on behalf of the multisig authority
     *
     * @param {Array<Account>} accounts Accounts one will use to approve transactions with
     */
    public loadAccounts (accounts: Array<Account>): void;

    /**
     * @description Propose a transaction to be executed
     *
     * @param {ContractFunction} contractAction Action one propose to be broadcasted
     * @param {Array<any>} actionData Action data
     * @returns {Promise<number>} Proposal id
     */
    public propose (contractAction: ContractFunction, actionData: Array<any>): Promise<number>;

    /**
     * @description Sign a proposed transaction
     *
     * @param {string} publicKey Key of the approver
     * @param {number} proposalId ID of proposal
     * @returns {Promise<void>}
     */
    public approve (publicKey: string, proposalId: number): Promise<void>;

    /**
     * @description Broadcast proposal in case of enough approvals
     *
     * @param {number} proposalId ID of proposal
     * @returns {Promise<BroadCastedTransaction>} Transaction receipt
     */
    public processProposal (proposalId: number): Promise<BroadCastedTransaction>;
}
