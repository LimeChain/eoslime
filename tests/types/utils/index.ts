import assert from 'assert';

import { TransactionResult, RawTransaction, SignedTransaction } from '../../../types';

export function assertRawTransaction (rawTransaction: RawTransaction): void {
    assert(rawTransaction.actions !== undefined);
    assert(rawTransaction.delay_sec !== undefined);
    assert(rawTransaction.expiration !== undefined);
    assert(rawTransaction.ref_block_num !== undefined);
    assert(rawTransaction.max_cpu_usage_ms !== undefined);
    assert(rawTransaction.ref_block_prefix !== undefined);
    assert(rawTransaction.max_net_usage_words !== undefined);
    assert(rawTransaction.context_free_actions !== undefined);
}

export function assertSignedAction (signedTx: SignedTransaction): void {
    assert(signedTx.compression !== undefined);
    assert(signedTx.signatures.length > 0);
    assertRawTransaction(signedTx.transaction);
}

export function assertTransactionResult (txResult: TransactionResult): void {
    assert(txResult.broadcast !== undefined);
    assert(txResult.transaction_id !== undefined);
    assert(txResult.processed.id !== undefined);
    assert(txResult.processed.block_num !== undefined);
    assert(txResult.processed.block_time !== undefined);
    assert(txResult.processed.producer_block_id !== undefined);
    assert(txResult.processed.receipt !== undefined);
    assert(txResult.processed.elapsed !== undefined);
    assert(txResult.processed.net_usage !== undefined);
    assert(txResult.processed.scheduled !== undefined);
    assert(txResult.processed.action_traces !== undefined);
    assert(txResult.processed.account_ram_delta !== undefined);
    assert(txResult.processed.except !== undefined);
    assert(txResult.processed.error_code !== undefined);
    assertSignedAction(txResult.transaction);
}