const is = require('../helpers/is')
const Account = require('./account');

class MultiSignatureAccount extends Account {

    constructor(name, privateKey, provider, authority) {
        super(name, privateKey, provider, authority)

        this.accounts = [];
        this.proposals = {};
        this.proposalsActions = {};
    }

    async buyRam(bytes, payer = this) {
        this.propose();
    }

    async buyBandwidth(cpu, net, payer = this) {
        this.propose();
    }

    async send(receiver, amount, symbol = 'EOS') {
        this.propose();
    }

    async createAuthority(authorityName, threshold = 1) {
        this.propose();
    }

    async setAuthorityAbilities(abilities) {
        this.propose();
    }

    async setThreshold(threshold) {
        this.propose();
    }

    async addPermission(authorityName, weight = 1) {
        this.propose();
    }

    async addOnBehalfAccount(accountName, authorityName, weight = 1) {
        this.propose();
    }

    async addAuthorityKey(publicKey, weight = 1) {
        this.propose();
    }

    async setWeight() {
        this.propose();
    }

    loadKeys(privateKeys) {
        for (let i = 0; i < privateKeys.length; i++) {
            this.accounts.push(new Account(this.name, privateKeys[i], this.provider, this.executiveAuthority.permission));
        }
    }

    loadAccounts(accounts) {
        for (let i = 0; i < accounts.length; i++) {
            is(accounts[i]).instanceOf(Account);
            this.accounts.push(accounts[i]);
        }
    }

    async propose(contractAction, actionData) {
        const actionTx = await contractAction.sign(this, ...actionData);
        const proposalId = Date.now();

        this.proposals[proposalId] = actionTx;
        this.proposalsActions[proposalId] = { action: contractAction, data: actionData };

        return proposalId;
    }

    async approve(approver, proposalId) {
        is(approver).instanceOf(Account);
        requireExistingProposal(this.proposals, proposalId);

        const proposalAction = this.proposalsActions[proposalId];

        let actionTx;
        if (hasTheProposerName(approver, this)) {
            actionTx = await proposalAction.action.sign(approver, ...proposalAction.data);
        } else {
            actionTx = await proposalAction.action.signOnBehalf(approver, this, ...proposalAction.data);
        }

        this.proposals[proposalId].signatures.push(actionTx.signatures[0]);
    }

    async approveAll(proposalId) {
        for (let i = 0; i < this.accounts.length; i++) {
            await this.approve(this.accounts[i], proposalId);
        }
    }

    async processProposal(proposalId) {
        requireExistingProposal(this.proposals, proposalId);

        const proposalTx = this.proposals[proposalId];
        delete this.proposals[proposalId];
        delete this.proposalsActions[proposalId]

        return this.provider.eos.pushTransaction(proposalTx);
    }

    async disapproveProposal(disapprover, proposalName) {

    }

    async cancelProposal(proposalName, canceler = this) {

    }
}

const requireExistingProposal = function (proposals, proposalId) {
    if (!proposals[proposalId]) {
        throw new Error('Such proposal does not exists');
    }
}

const hasTheProposerName = function (candidate, proposer) {
    return candidate.name == proposer.name
}

module.exports = MultiSignatureAccount
