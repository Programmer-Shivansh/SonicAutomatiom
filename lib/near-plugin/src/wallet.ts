import { keyStores, utils, connect } from "near-api-js";
import { KeyPairString } from "near-api-js/lib/utils/key_pair";

export interface NEARConfig {
  networkId: string;
  nodeUrl: string;
  accountId: string;
  secretKey: string;
}

export class NEARWalletClient {
  private config: NEARConfig;
  private keyStore: keyStores.InMemoryKeyStore;

  constructor(config: NEARConfig) {
    this.config = config;
    this.keyStore = new keyStores.InMemoryKeyStore();
  }

  async initialize(): Promise<void> {
    const keyPair = utils.KeyPair.fromString(this.config.secretKey as KeyPairString);
    await this.keyStore.setKey(this.config.networkId, this.config.accountId, keyPair);
  }

  getAddress(): string {
    return this.config.accountId;
  }

  getChain(): { type: string; id: string } {
    return {
      type: "near",
      id: this.config.networkId
    };
  }

  async getNearConnection() {
    return connect({
      networkId: this.config.networkId,
      keyStore: this.keyStore,
      nodeUrl: this.config.nodeUrl,
    });
  }

  async getAccount() {
    const connection = await this.getNearConnection();
    return connection.account(this.config.accountId);
  }

  getKeyPair() {
    return utils.KeyPair.fromString(this.config.secretKey as KeyPairString);
  }
}