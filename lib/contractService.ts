import { ethers } from 'ethers';
import GHCTokenABI from '../artifacts/contracts/GHCToken.sol/GHCToken.json';

export interface GHCBatch {
  id: string;
  batchId: number;
  quantity: number;
  issuanceDate: number;
  status: string;
  issuer: string;
  exists: boolean;
}

export interface Transaction {
  id: string;
  eventType: 'Mint' | 'Transfer' | 'Retire';
  tokenId: string;
  from: string;
  to: string | null;
  amount: number;
  timestamp: number;
  hash: string;
}

export class ContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor(
    contractAddress: string,
    provider: ethers.BrowserProvider,
    signer: ethers.JsonRpcSigner
  ) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(
      contractAddress,
      GHCTokenABI.abi,
      signer
    );
  }

  // Get contract instance
  getContract() {
    return this.contract;
  }

  // Get user's total portfolio value
  async getPortfolioValue(userAddress: string): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const userBatches = await this.contract.getUserBatches(userAddress);
      let totalValue = 0;

      for (const batchId of userBatches) {
        const balance = await this.contract.balanceOf(userAddress, batchId);
        totalValue += Number(balance);
      }

      return totalValue;
    } catch (error) {
      console.error('Error getting portfolio value:', error);
      // If getUserBatches fails, return 0 instead of throwing
      return 0;
    }
  }

  // Get user's batches
  async getUserBatches(userAddress: string): Promise<GHCBatch[]> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const userBatches = await this.contract.getUserBatches(userAddress);
      const batches: GHCBatch[] = [];

      for (const batchId of userBatches) {
        try {
          const batch = await this.contract.getBatch(batchId);
          const balance = await this.contract.balanceOf(userAddress, batchId);

          if (Number(balance) > 0) {
            const statusString = await this.contract!.getBatchStatusString(
              batchId
            );
            batches.push({
              id: batchId.toString(),
              batchId: Number(batchId),
              quantity: Number(balance),
              issuanceDate: Number(batch.issuanceDate),
              status: statusString,
              issuer: batch.issuer,
              exists: batch.exists,
            });
          }
        } catch (batchError) {
          console.warn(`Error processing batch ${batchId}:`, batchError);
          // Continue with other batches
        }
      }

      return batches;
    } catch (error) {
      console.error('Error getting user batches:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  // Get all batches (for admin/explorer)
  async getAllBatches(): Promise<GHCBatch[]> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const batchCounter = await this.contract.batchCounter();
      const batches: GHCBatch[] = [];

      for (let i = 1; i <= Number(batchCounter); i++) {
        const batch = await this.contract.getBatch(i);
        const statusString = await this.contract!.getBatchStatusString(i);
        batches.push({
          id: i.toString(),
          batchId: i,
          quantity: Number(batch.quantity),
          issuanceDate: Number(batch.issuanceDate),
          status: statusString,
          issuer: batch.issuer,
          exists: batch.exists,
        });
      }

      return batches;
    } catch (error) {
      console.error('Error getting all batches:', error);
      return [];
    }
  }

  // Create a new batch (admin only)
  async createBatch(tokenType: number, quantity: number): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.createBatch(tokenType, quantity);
      const receipt = await tx.wait();

      // Find the BatchCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed?.name === 'BatchCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.contract!.interface.parseLog(event);
        if (parsed && parsed.args) {
          return Number(parsed.args.batchId);
        }
      }

      throw new Error('Failed to get batch ID from transaction');
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  }

  // Mint tokens for a batch (admin only)
  async mintBatch(
    batchId: number,
    to: string,
    quantity: number
  ): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.mintBatch(batchId, to, quantity);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error minting batch:', error);
      throw error;
    }
  }

  // Transfer tokens between addresses
  async transferBatch(
    batchId: number,
    from: string,
    to: string,
    quantity: number
  ): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.transferBatch(batchId, from, to, quantity);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error transferring batch:', error);
      throw error;
    }
  }

  // Retire tokens
  async retireBatch(batchId: number, quantity: number): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.retireBatch(batchId, quantity);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error retiring batch:', error);
      throw error;
    }
  }

  // Get transaction history (this would need to be implemented with events)
  async getTransactionHistory(userAddress: string): Promise<Transaction[]> {
    if (!this.contract || !this.provider)
      throw new Error('Contract or provider not initialized');

    try {
      // Get events from the contract
      const mintFilter = this.contract.filters.TokensMinted(
        null,
        null,
        userAddress
      );
      const transferFilter = this.contract.filters.TokensTransferred(
        null,
        null,
        userAddress,
        null
      );
      const retireFilter = this.contract.filters.TokensRetired(
        null,
        null,
        userAddress
      );

      const [mintEvents, transferEvents, retireEvents] = await Promise.all([
        this.contract.queryFilter(mintFilter),
        this.contract.queryFilter(transferFilter),
        this.contract.queryFilter(retireFilter),
      ]);

      const transactions: Transaction[] = [];

      // Process mint events
      for (const event of mintEvents) {
        try {
          const parsed = this.contract!.interface.parseLog(event);
          if (parsed && parsed.args) {
            const timestamp = event.blockNumber
              ? await this.getBlockTimestamp(event.blockNumber)
              : Date.now();

            transactions.push({
              id: `mint-${event.blockNumber}-${event.transactionIndex}`,
              eventType: 'Mint',
              tokenId: `GHC-${parsed.args.batchId}`,
              from: '0x0000000000000000000000000000000000000000',
              to: parsed.args.to,
              amount: Number(parsed.args.quantity),
              timestamp,
              hash: event.transactionHash,
            });
          }
        } catch (error) {
          console.warn('Failed to parse mint event:', error);
        }
      }

      // Process transfer events
      for (const event of transferEvents) {
        try {
          const parsed = this.contract!.interface.parseLog(event);
          if (parsed && parsed.args) {
            const timestamp = event.blockNumber
              ? await this.getBlockTimestamp(event.blockNumber)
              : Date.now();

            transactions.push({
              id: `transfer-${event.blockNumber}-${event.transactionIndex}`,
              eventType: 'Transfer',
              tokenId: `GHC-${parsed.args.batchId}`,
              from: parsed.args.from,
              to: parsed.args.to,
              amount: Number(parsed.args.quantity),
              timestamp,
              hash: event.transactionHash,
            });
          }
        } catch (error) {
          console.warn('Failed to parse transfer event:', error);
        }
      }

      // Process retire events
      for (const event of retireEvents) {
        try {
          const parsed = this.contract!.interface.parseLog(event);
          if (parsed && parsed.args) {
            const timestamp = event.blockNumber
              ? await this.getBlockTimestamp(event.blockNumber)
              : Date.now();

            transactions.push({
              id: `retire-${event.blockNumber}-${event.transactionIndex}`,
              eventType: 'Retire',
              tokenId: `GHC-${parsed.args.batchId}`,
              from: parsed.args.from,
              to: null,
              amount: Number(parsed.args.quantity),
              timestamp,
              hash: event.transactionHash,
            });
          }
        } catch (error) {
          console.warn('Failed to parse retire event:', error);
        }
      }

      // Sort by timestamp (newest first)
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  // Helper method to get block timestamp
  private async getBlockTimestamp(blockNumber: number): Promise<number> {
    if (!this.provider) return Date.now();

    try {
      const block = await this.provider.getBlock(blockNumber);
      return block?.timestamp || Date.now();
    } catch {
      return Date.now();
    }
  }
}
