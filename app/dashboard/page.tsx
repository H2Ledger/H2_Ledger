'use client';

import { useState, useEffect } from 'react';
import {
  Diamond,
  ArrowUpRight,
  RotateCcw,
  History,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { useWallet } from '@/contexts/WalletContext';
import { ContractService, GHCBatch } from '@/lib/contractService';
import { useRouter } from 'next/navigation';

// Contract address - this will be updated after deployment
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Default Hardhat address

export default function Dashboard() {
  const { account, isConnected, signer, provider, disconnectWallet } =
    useWallet();
  const router = useRouter();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [contractService, setContractService] =
    useState<ContractService | null>(null);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [userBatches, setUserBatches] = useState<GHCBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract service when wallet is connected
  useEffect(() => {
    if (isConnected && signer && provider) {
      const service = new ContractService(CONTRACT_ADDRESS, provider, signer);
      setContractService(service);
    }
  }, [isConnected, signer, provider]);

  // Load user data when contract service is available
  useEffect(() => {
    const loadUserData = async () => {
      if (!contractService || !account) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load portfolio value and user batches
        const [value, batches] = await Promise.all([
          contractService.getPortfolioValue(account),
          contractService.getUserBatches(account),
        ]);

        setPortfolioValue(value);
        setUserBatches(batches);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load portfolio data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [contractService, account]);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  // Handle disconnect
  const handleDisconnect = () => {
    disconnectWallet();
    router.push('/');
  };

  const getStatusChipClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'active-chip';
      case 'Partial':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'Retired':
        return 'retire-chip';
      default:
        return 'status-chip';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting to wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Diamond className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">
                <span className="text-primary">H2</span>
                <span className="text-white">Ledger</span>
              </span>
            </div>

            {/* Wallet Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Connected</p>
                <p className="font-mono text-sm">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="border-border/50 hover:bg-muted/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome Back, Hydrogen Producer
          </h1>
          <p className="text-muted-foreground">
            Manage your Green Hydrogen Credit portfolio
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Portfolio Card */}
        <Card className="glass-card border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Total GHC Portfolio</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-5xl font-bold text-primary font-mono mb-2">
                  {isLoading ? (
                    <div className="w-32 h-16 bg-muted/30 rounded animate-pulse" />
                  ) : (
                    formatNumber(portfolioValue)
                  )}
                </div>
                <div className="text-xl text-muted-foreground">GHC</div>
              </div>

              <div className="flex space-x-3">
                <Button
                  className="bg-primary hover:bg-primary/90 rounded-xl"
                  onClick={() => setSelectedAction('transfer')}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Transfer
                </Button>
                <Button
                  variant="outline"
                  className="border-border/50 hover:bg-muted/20 rounded-xl"
                  onClick={() => setSelectedAction('retire')}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retire Credit
                </Button>
                <Button
                  variant="outline"
                  className="border-border/50 hover:bg-muted/20 rounded-xl"
                  onClick={() => setSelectedAction('history')}
                >
                  <History className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your GHC Batches */}
        <Card className="glass-card border-border/50 mb-8">
          <CardHeader>
            <CardTitle>Your GHC Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted/30 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : userBatches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No GHC batches found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your batches will appear here once you receive GHC tokens
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left py-4 px-4 font-medium text-muted-foreground">
                        Batch ID
                      </th>
                      <th className="text-left py-4 px-4 font-medium text-muted-foreground">
                        Quantity
                      </th>
                      <th className="text-left py-4 px-4 font-medium text-muted-foreground">
                        Issuance Date
                      </th>
                      <th className="text-left py-4 px-4 font-medium text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userBatches.map((batch, index) => (
                      <tr
                        key={batch.id}
                        className={`hover:bg-muted/20 transition-colors ${
                          index % 2 === 0 ? 'bg-background/30' : ''
                        }`}
                      >
                        <td className="py-4 px-4 font-medium">
                          Batch {batch.batchId}
                        </td>
                        <td className="py-4 px-4 font-mono">
                          {formatNumber(batch.quantity)} GHC
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {formatDate(batch.issuanceDate)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className={`status-chip ${getStatusChipClass(
                              batch.status
                            )}`}
                          >
                            {batch.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Modals Placeholder */}
        {selectedAction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-card border-border/50 rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {selectedAction === 'transfer' && 'Transfer Credits'}
                {selectedAction === 'retire' && 'Retire Credits'}
                {selectedAction === 'history' && 'Transaction History'}
              </h3>
              <p className="text-muted-foreground mb-6">
                This feature is coming soon. For now, you can view your
                portfolio and batch information.
              </p>
              <Button
                onClick={() => setSelectedAction(null)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
