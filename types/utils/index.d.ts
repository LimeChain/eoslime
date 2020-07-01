interface KeysPair {
    publicKey: string;
    privateKey: string;
}

export interface utils {
    /**
     * @description Convert account name from uint64 to string
     *
     * @param {string} encodedName Uint64 format of account name
     * @returns {string} String format of account name
     */
    toName (encodedName: string): string;

    /**
     * @description Generate a random account name
     *
     * @returns {Promise<string>} Account name
     */
    randomName (): Promise<string>;

    /**
     * @description Generate a random public/private keys pair
     *
     * @returns {Promise<KeysPair>} Keys pair
     */
    generateKeys (): Promise<KeysPair>;

    /**
     * @description Generate a random private key
     *
     * @returns {Promise<string>} Random key
     */
    randomPrivateKey (): Promise<string>;

    /**
     * @description Construct an account name from a private key. The name is constructed in a custom way, it is not related to the private key in any manner
     *
     * @param {string} privateKey Private key
     * @returns {Promise<string>} Account name
     */
    nameFromPrivateKey (privateKey: string): Promise<string>;
}
