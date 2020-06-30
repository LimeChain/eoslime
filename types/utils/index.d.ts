interface KeysPair {
    publicKey: string;
    privateKey: string;
}

export interface utils {
    toName (encodedName: string): string;
    randomName (): Promise<string>;
    generateKeys (): Promise<KeysPair>;
    randomPrivateKey (): Promise<string>;
    nameFromPrivateKey (privateKey: string): Promise<string>;
}
