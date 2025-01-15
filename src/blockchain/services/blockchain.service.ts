import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JsonRpcProvider, Wallet, Contract } from 'ethers';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);

  private provider: JsonRpcProvider;
  private contract: Contract;
  private signer: Wallet;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL');
      const privateKey = this.configService.get<string>(
        'BLOCKCHAIN_PRIVATE_KEY',
      );
      if (!privateKey) {
        throw new Error('BLOCKCHAIN_PRIVATE_KEY is not configured');
      }
      const contractAddress =
        this.configService.get<string>('CONTRACT_ADDRESS');
      if (!contractAddress) {
        throw new Error('CONTRACT_ADDRESS is not configured');
      }

      // v6 approach:
      this.provider = new JsonRpcProvider(rpcUrl);
      this.signer = new Wallet(privateKey, this.provider);

      this.contract = new Contract(
        contractAddress,
        this.signer,
      );

      this.logger.log('Blockchain service initialized successfully.');
      this.listenToEvents();
    } catch (error) {
      this.logger.error('Failed to initialize blockchain service', error.stack);
      throw new Error('Blockchain service initialization failed');
    }
  }

  private listenToEvents() {
    // v6 event handling is basically the same as v5
    this.contract.on(
      'DocumentSubmitted',
      (owner: string, docHash: string, event) => {
        this.logger.debug(
          `Document submitted by ${owner} with hash ${docHash}`,
        );
        // Possibly update DB
      },
    );

    this.contract.on(
      'VerificationApproved',
      (verifier: string, docHash: string, event) => {
        this.logger.debug(
          `Verification approved by ${verifier} for docHash ${docHash}`,
        );
      },
    );

    this.contract.on(
      'VerificationRevoked',
      (verifier: string, docHash: string, event) => {
        this.logger.debug(
          `Verification revoked by ${verifier} for docHash ${docHash}`,
        );
      },
    );

    this.logger.log(
      'Event listeners set up for DocumentVerification contract.',
    );
  }

  // -----------
  // Transactions
  // -----------

  async submitDocumentHash(documentHash: string): Promise<void> {
    try {
      const tx = await this.contract.submitDocument(documentHash);
      await tx.wait();
      this.logger.log(`Document hash submitted on-chain: ${documentHash}`);
    } catch (error) {
      this.logger.error(
        `Failed to submit doc hash: ${documentHash}`,
        error.stack,
      );
      throw new Error('Failed to submit document hash');
    }
  }

  async approveVerification(documentHash: string): Promise<void> {
    try {
      const tx = await this.contract.approveVerification(documentHash);
      await tx.wait();
      this.logger.log(`Verification approved for docHash: ${documentHash}`);
    } catch (error) {
      this.logger.error(
        `Failed to approve verification: ${documentHash}`,
        error.stack,
      );
      throw new Error('Failed to approve verification');
    }
  }

  async revokeVerification(documentHash: string): Promise<void> {
    try {
      const tx = await this.contract.revokeVerification(documentHash);
      await tx.wait();
      this.logger.log(`Verification revoked for docHash: ${documentHash}`);
    } catch (error) {
      this.logger.error(
        `Failed to revoke verification: ${documentHash}`,
        error.stack,
      );
      throw new Error('Failed to revoke verification');
    }
  }

  async getVerificationStatus(documentHash: string): Promise<boolean> {
    try {
      const status = await this.contract.getVerificationStatus(documentHash);
      this.logger.debug(
        `Verification status: docHash=${documentHash} => ${status}`,
      );
      return status;
    } catch (error) {
      this.logger.error(
        `Failed to get verification status: ${documentHash}`,
        error.stack,
      );
      throw new Error('Failed to get verification status');
    }
  }
}
