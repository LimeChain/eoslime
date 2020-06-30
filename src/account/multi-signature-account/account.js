const is = require('../../helpers/is')
const BaseAccount = require('../base-account');

class MultiSignatureAccount extends BaseAccount {

    constructor (name, privateKey, provider, authority) {
        super(name, privateKey, provider, authority)

        this.accounts = [this];
        this.proposals = {};
    }

    loadKeys (privateKeys) {
        for (let i = 0; i < privateKeys.length; i++) {
            this.accounts.push(new BaseAccount(this.name, privateKeys[i], this.provider, this.executiveAuthority.permission));
        }
    }

    loadAccounts (accounts) {
        for (let i = 0; i < accounts.length; i++) {
            is(accounts[i]).instanceOf('BaseAccount');
            this.accounts.push(accounts[i]);
        }
    }

    async propose (contractAction, actionData) {
        is(contractAction).instanceOf('ContractFunction');

        const actionTx = await contractAction.sign(this, ...actionData);
        const proposalId = Date.now();

        this.proposals[proposalId] = actionTx;
        return proposalId;
    }

    async approve (publicKey, proposalId) {
        const approver = this.accounts.find((account) => { return account.publicKey == publicKey });
        requireExistingApprover(approver);
        requireExistingProposal(this.proposals, proposalId);

        const proposalTx = this.proposals[proposalId];
        const approverSignedTx = await this.provider.eos.transaction(
            proposalTx.transaction,
            { broadcast: false, sign: true, keyProvider: approver.privateKey }
        );

        proposalTx.signatures.push(approverSignedTx.transaction.signatures[0]);
    }

    async processProposal (proposalId) {
        requireExistingProposal(this.proposals, proposalId);
        await requireEnoughApprovals(this, this.proposals[proposalId]);

        const proposalTx = this.proposals[proposalId];
        delete this.proposals[proposalId];

        return this.provider.eos.pushTransaction(proposalTx);
    }
}

const requireExistingApprover = function (approver) {
    if (!approver) {
        throw new Error('Such approver was not loaded');
    }
}

const requireExistingProposal = function (proposals, proposalId) {
    if (!proposals[proposalId]) {
        throw new Error('Such proposal does not exists');
    }
}

const requireEnoughApprovals = async function (account, proposal) {
    const authorityInfo = await account.getAuthorityInfo();
    if (authorityInfo.required_auth.threshold != proposal.signatures.length) {
        throw new Error(
            `Proposal should be approved ${authorityInfo.required_auth.threshold - 1} times, but it is approved ${proposal.signatures.length - 1} times. Consider updating the account threshold`
        );
    }
}

module.exports = MultiSignatureAccount
