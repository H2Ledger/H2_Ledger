'use client';

import { useState, useEffect } from 'react';
import {
  Diamond,
  ArrowUpRight,
  RotateCcw,
  History,
  TrendingUp,
  LogOut,
  Shield,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { useWallet } from '@/contexts/WalletContext';
import { ContractService, GHCBatch } from '@/lib/contractService';
import { useRouter } from 'next/navigation';
import RoleManagement from '@/components/RoleManagement';
import GovernanceActions from '@/components/GovernanceActions';
import { getContractAddress } from '@/lib/config';
import { isRateLimitError, waitForCircuitBreakerReset } from '@/lib/rateLimit';

// Get contract address from config
const CONTRACT_ADDRESS = getContractAddress();

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

        // Add delay to prevent rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Load portfolio value and user batches
        const [value, batches] = await Promise.all([
          contractService.getPortfolioValue(account),
          contractService.getUserBatches(account),
        ]);

        setPortfolioValue(value);
        setUserBatches(batches);
      } catch (err: any) {
        console.error('Error loading user data:', err);

        // Check if it's a rate limiting error
        if (isRateLimitError(err)) {
          setError(
            'Rate limit reached. Please wait a moment and refresh the page, or click the "Reset Rate Limit" button below.'
          );
        } else {
          setError('Failed to load portfolio data. Please try again.');
        }
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

         {/* Rate Limit Info */}
         <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
           <div className="flex items-center space-x-2">
             <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
             <p className="text-blue-300 text-sm">
               <strong>Tip:</strong> If you encounter "circuit breaker" errors, use the "Reset Rate Limit" button below or wait 5 seconds before retrying.
             </p>
           </div>
         </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
            {isRateLimitError({ message: error }) && (
              <Button
                onClick={async () => {
                  setError('Resetting rate limit, please wait...');
                  await waitForCircuitBreakerReset();
                  setError(null);
                  // Reload data after reset
                  if (contractService && account) {
                    try {
                      setIsLoading(true);
                      const [value, batches] = await Promise.all([
                        contractService.getPortfolioValue(account),
                        contractService.getUserBatches(account),
                      ]);
                      setPortfolioValue(value);
                      setUserBatches(batches);
                    } catch (err: any) {
                      setError('Failed to reload data after rate limit reset.');
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Reset Rate Limit
              </Button>
            )}
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
                  onClick={() => setSelectedAction('issue')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Issue Credit
                </Button>
                <Button
                  variant="outline"
                  className="border-border/50 hover:bg-muted/20 rounded-xl"
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

        {/* Governance Actions Section - Only visible to Governance users */}
        {contractService && (
          <Card className="glass-card border-border/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <span>Governance Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GovernanceActions contractService={contractService} />
            </CardContent>
          </Card>
        )}

        {/* Role Management Section - Only visible to Governance users */}
        {contractService && (
          <Card className="glass-card border-border/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <span>Role Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RoleManagement contractService={contractService} />
            </CardContent>
          </Card>
        )}

        {/* Action Modals */}
        {selectedAction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-card border-border/50 rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedAction === 'issue' && 'Issue Credits'}
                  {selectedAction === 'transfer' && 'Transfer Credits'}
                  {selectedAction === 'retire' && 'Retire Credits'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAction(null)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>

              {selectedAction === 'issue' && contractService && (
                <GovernanceActions contractService={contractService} />
              )}

              {(selectedAction === 'transfer' ||
                selectedAction === 'retire') && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-6">
                    This feature is coming soon. For now, you can use the
                    Governance Actions above to issue credits.
                  </p>
                  <Button
                    onClick={() => setSelectedAction(null)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
