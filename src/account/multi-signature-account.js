const is = require('../helpers/is')
const Account = require('./account');
const Contract = require('./../contract/contract');

class MultiSignatureAccount extends Account {

    constructor(name, privateKey, provider, authority) {
        super(name, privateKey, provider, authority)

        this.accounts = [];
        this.proposals = {};
        this.proposalsActions = {};
    }

    async buyRam(bytes, payer = this) {
        is(payer).instanceOf(Account);

        if (!hasTheProposerName(payer, this)) {
            return super.buyRam(bytes, payer);
        }

        const systemContract = await retrieveContract.call(this, 'eosio', payer);
        requireContractAction(systemContract.buyrambytes);

        return this.propose(systemContract.buyrambytes, [
            payer.name,
            this.name,
            bytes
        ]);
    }

    async buyBandwidth(cpu, net, payer = this) {
        is(payer).instanceOf(Account);

        if (!hasTheProposerName(payer, this)) {
            return super.buyBandwidth(cpu, net, payer);
        }

        const systemContract = await retrieveContract.call(this, 'eosio', payer);
        requireContractAction(systemContract.delegatebw);

        return this.propose(systemContract.delegatebw, [
            payer.name,
            this.name,
            cpu,
            net,
            0
        ]);
    }

    async send(receiver, amount, symbol = 'EOS') {
        is(receiver).instanceOf(Account);

        const tokenContract = await retrieveContract.call(this, 'eosio.token', this);
        requireContractAction(tokenContract.transfer);

        return this.propose(tokenContract.transfer, [
            this.name,
            receiver.name,
            `${amount} ${symbol}`,
            this.executiveAuthority
        ]);
    }

    // Todo: think of how to implement it
    // async createAuthority(authorityName, threshold = 1) {
    //     const authorization = {
    //         threshold,
    //         keys: [{ key: this.publicKey, weight: threshold }]
    //     }
    //     await setAuthority.call(this, authorityName, this.executiveAuthority.permission, authorization);

    //     return new Account(this.name, this.privateKey, this.provider, authorityName);
    //     this.propose();
    // }

    // async setAuthorityAbilities(abilities) {
    //     is(abilities).instanceOf(Array);

    //     const contractFactory = new ContractFactory(this.provider);
    //     const systemContract = await contractFactory.at('system');

    //     const proposalIds = [];
    //     for (let i = 0; i < abilities.length; i++) {
    //         const ability = abilities[i];
    //         proposalIds.push(
    //             this.propose(systemContract.linkauth, [
    //                 this.name,
    //                 ability.contract,
    //                 ability.action,
    //                 authorityName
    //             ])
    //         );
    //     }

    //     return proposalIds
    // }

    // async setThreshold(threshold) {
    //     this.propose();
    // }

    // async addPermission(authorityName, weight = 1) {
    //     return this.addOnBehalfAccount(this.name, authorityName, weight);
    // }

    // async addOnBehalfAccount(accountName, authorityName, weight = 1) {
    //     const authorityInfo = await this.getAuthorityInfo();
    //     const hasAlreadyAccount = authorityInfo.required_auth.accounts.find((account) => {
    //         return account.permission.actor == accountName;
    //     });

    //     if (!hasAlreadyAccount) {
    //         authorityInfo.required_auth.accounts.push({ permission: { actor: accountName, permission: authority }, weight });
    //         return setAuthority.call(this, authorityInfo.perm_name, authorityInfo.parent, authorityInfo.required_auth);
    //     }
    //     this.propose();
    // }

    // async addAuthorityKey(publicKey, weight = 1) {
    //     if (!eosECC.isValidPublic(publicKey)) {
    //         throw new Error('Provided public key is not a valid one');
    //     }

    //     const authorityInfo = await this.getAuthorityInfo();
    //     const hasAlreadyKey = authorityInfo.required_auth.keys.find((keyData) => {
    //         return keyData.key == publicKey;
    //     });

    //     if (!hasAlreadyKey) {
    //         authorityInfo.required_auth.keys.push({ key: publicKey, weight });
    //         return setAuthority.call(this, authorityInfo.perm_name, authorityInfo.parent, authorityInfo.required_auth);
    //     }
    // }

    // async setWeight() {
    //     this.propose();
    // }

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
        requireEnoughApprovals(this, this.proposals[proposalId]);

        const proposalTx = this.proposals[proposalId];
        delete this.proposals[proposalId];
        delete this.proposalsActions[proposalId]

        return this.provider.eos.pushTransaction(proposalTx);
    }
}

const retrieveContract = async function (contractName, executor) {
    const abiInterface = (await this.provider.eos.getAbi(contractName)).abi;
    return new Contract(this.provider, abiInterface, contractName, executor);
}

const requireContractAction = async function (contractAction) {
    if (!contractAction) {
        throw new Error('Contract does not have such action');
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
        throw new Error(`Proposal should be approved minimum ${authorityInfo.required_auth.threshold - 1} times, but it is approved ${proposal.signatures.length - 1}`);
    }
}

const hasTheProposerName = function (candidate, proposer) {
    return candidate.name == proposer.name
}

module.exports = MultiSignatureAccount
