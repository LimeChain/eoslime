interface TxActionTrace {
    action_ordinal: number;
    creator_action_ordinal: number;
    closest_unnotified_ancestor_action_ordinal: number;
    receipt: TxReceipt;
    receiver: string;
    act: TxAction;
    context_free: boolean;
    elapsed: number;
    console: string;
    trx_id: string;
    block_num: number;
    block_time: string;
    producer_block_id: string;
    account_ram_deltas: Array<any>;
    except: string;
    error_code: string;
    inline_traces: TxActionTrace
}

interface TxReceipt {
    status: string;
    cpu_usage_us: number;
    net_usage_words: number;
}

interface TxAction {
    account: string;
    name: string;
    authorization: [
        {
            actor: string;
            permission: string;
        }
    ];
    data: string;
}

export interface RawTransaction {
    expiration: string;
    ref_block_num: number;
    ref_block_prefix: number;
    max_net_usage_words: number;
    max_cpu_usage_ms: number;
    delay_sec: number;
    context_free_actions: Array<any>;
    actions: Array<TxAction>;
    transaction_extensions: Array<any>;
}

export interface SignedTransaction {
    compression: string;
    transaction: RawTransaction;
    signatures: Array<string>;
}

export interface BroadCastedTransaction {
    transaction_id: string;
    processed:
    {
        id: string;
        block_num: number;
        block_time: string;
        producer_block_id: string;
        receipt: TxReceipt;
        elapsed: number;
        net_usage: number;
        scheduled: boolean;
        action_traces: Array<TxActionTrace>;
        account_ram_delta: string;
        except: string;
        error_code: string;
    }
}

export interface TransactionResult extends BroadCastedTransaction {
    broadcast: boolean;
    transaction: SignedTransaction;
}

interface TxAuthorityKey {
    key: string;
    weight: number;
}

interface AuthAccount {
    permission: {
        actor: string;
        permission: string
    };
    weight: number;
}

export interface AuthorityDetails {
    perm_name: string;
    parent: string;
    required_auth: {
        threshold: number;
        keys: Array<TxAuthorityKey>;
        accounts: Array<AuthAccount>;
        waits: Array<any>;
    }
}
