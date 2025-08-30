'use client';

import { useState } from 'react';
import { Search, Diamond, Bell, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';

interface Transaction {
  id: string;
  eventType: 'Mint' | 'Transfer' | 'Retire';
  tokenId: string;
  from: string;
  to: string | null;
  amount: number;
  timestamp: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    eventType: 'Mint',
    tokenId: 'GHC-12345',
    from: '0xabc123...',
    to: '0xdef456...',
    amount: 1000,
    timestamp: '2024-01-15 10:00 AM',
  },
  {
    id: '2',
    eventType: 'Transfer',
    tokenId: 'GHC-12345',
    from: '0xdef456...',
    to: '0xghi789...',
    amount: 500,
    timestamp: '2024-01-15 11:30 AM',
  },
  {
    id: '3',
    eventType: 'Retire',
    tokenId: 'GHC-12345',
    from: '0xghi789...',
    to: null,
    amount: 200,
    timestamp: '2024-01-15 01:00 PM',
  },
  {
    id: '4',
    eventType: 'Mint',
    tokenId: 'GHC-67890',
    from: '0xuvw012...',
    to: '0xxyz345...',
    amount: 2000,
    timestamp: '2024-01-16 09:00 AM',
  },
  {
    id: '5',
    eventType: 'Transfer',
    tokenId: 'GHC-67890',
    from: '0xxyz345...',
    to: '0xabc123...',
    amount: 1500,
    timestamp: '2024-01-16 10:45 AM',
  },
  {
    id: '6',
    eventType: 'Mint',
    tokenId: 'GHC-11223',
    from: '0xrst678...',
    to: '0xuvw012...',
    amount: 500,
    timestamp: '2024-01-17 12:00 PM',
  },
  {
    id: '7',
    eventType: 'Transfer',
    tokenId: 'GHC-11223',
    from: '0xuvw012...',
    to: '0xdef456...',
    amount: 250,
    timestamp: '2024-01-17 02:15 PM',
  },
  {
    id: '8',
    eventType: 'Retire',
    tokenId: 'GHC-11223',
    from: '0xdef456...',
    to: null,
    amount: 100,
    timestamp: '2024-01-17 04:30 PM',
  },
];

export default function Explorer() {
  const [searchTerm, setSearchTerm] = useState('');

  const getEventChipClass = (eventType: string) => {
    switch (eventType) {
      case 'Mint':
        return 'mint-chip';
      case 'Transfer':
        return 'transfer-chip';
      case 'Retire':
        return 'retire-chip';
      default:
        return 'status-chip';
    }
  };

  const filteredTransactions = mockTransactions.filter(
    (tx) =>
      tx.tokenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.to && tx.to.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Diamond className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">
                <span className="text-primary">H2</span>
                <span className="text-white">Ledger</span>
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by Address, Token ID, Plant ID, or Transaction Hash"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-lg bg-card/50 border-border/50 rounded-2xl"
            />
          </div>
        </div>

        {/* Live Ledger Feed */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Live Ledger Feed</h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400 font-medium">Live</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 sticky top-0">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                    Event Type
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                    Token ID
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                    From
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                    To
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                    Timestamp
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, index) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-muted/20 transition-colors ${
                      index % 2 === 0 ? 'bg-background/30' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <Badge
                        className={`status-chip ${getEventChipClass(
                          tx.eventType
                        )}`}
                      >
                        {tx.eventType}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 font-mono text-sm">
                      {tx.tokenId}
                    </td>
                    <td className="py-4 px-6 font-mono text-sm">{tx.from}</td>
                    <td className="py-4 px-6 font-mono text-sm">
                      {tx.to || 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      {formatNumber(tx.amount)}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {tx.timestamp}
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        variant="link"
                        className="text-primary hover:text-primary/80 p-0 h-auto"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
