class Account {

    constructor(name, publicKey, privateKey) {
        this.name = name;
        this.permissions = {
            active: {
                actor: name,
                permission: 'active'
            },
            owner: {
                actor: name,
                permission: 'owner'
            }
        };

        this.publicKey = publicKey;
        this.privateKey = privateKey
    }
}

module.exports = Account;
