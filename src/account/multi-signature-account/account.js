const is = require('../../helpers/is')
const BaseAccount = require('../base-account');

class MultiSignatureAccount extends BaseAccount {

    constructor(name, privateKey, provider, authority) {
        super(name, privateKey, provider, authority)

        this.accounts = [];
        this.proposals = {};
        this.proposalsActions = {};
    }

    loadKeys(privateKeys) {
        for (let i = 0; i < privateKeys.length; i++) {
            this.accounts.push(new BaseAccount(this.name, privateKeys[i], this.provider, this.executiveAuthority.permission));
        }
    }

    loadAccounts(accounts) {
        for (let i = 0; i < accounts.length; i++) {
            is(accounts[i]).instanceOf('BaseAccount');
            this.accounts.push(accounts[i]);
        }
    }

    async propose(contractAction, actionData) {
        is(contractAction).instanceOf('ContractFunction');

        const actionTx = await contractAction.sign(this, ...actionData);
        const proposalId = Date.now();

        this.proposals[proposalId] = actionTx;
        this.proposalsActions[proposalId] = { action: contractAction, data: actionData };

        return proposalId;
    }

    async approve(approver, proposalId) {
        is(approver).instanceOf('BaseAccount');
        requireExistingProposal(this.proposals, proposalId);

        const proposalTx = this.proposals[proposalId];
        const approverSignedTx = await this.provider.eos.transaction(
            proposalTx.transaction,
            { broadcast: false, sign: true, keyProvider: approver.privateKey }
        );

        proposalTx.signatures.push(approverSignedTx.transaction.signatures[0]);
    }

    async approveAll(proposalId) {
        for (let i = 0; i < this.accounts.length; i++) {
            await this.approve(this.accounts[i], proposalId);
        }
    }

    async processProposal(proposalId) {
        requireExistingProposal(this.proposals, proposalId);
        await requireEnoughApprovals(this, this.proposals[proposalId]);

        const proposalTx = this.proposals[proposalId];
        delete this.proposals[proposalId];
        delete this.proposalsActions[proposalId]

        return this.provider.eos.pushTransaction(proposalTx);
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
