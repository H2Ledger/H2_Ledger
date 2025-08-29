'use client';

import { useState } from 'react';
import { Diamond, ArrowUpRight, RotateCcw, History, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GHCBatch {
  id: string;
  batchId: string;
  quantity: number;
  issuanceDate: string;
  status: 'Active' | 'Partial' | 'Retired';
}

interface Activity {
  id: string;
  activity: string;
  date: string;
  details: string;
}

const mockBatches: GHCBatch[] = [
  {
    id: '1',
    batchId: 'Batch 12345',
    quantity: 100000,
    issuanceDate: '2023-01-15',
    status: 'Active'
  },
  {
    id: '2',
    batchId: 'Batch 67890',
    quantity: 50000,
    issuanceDate: '2023-02-20',
    status: 'Active'
  },
  {
    id: '3',
    batchId: 'Batch 11223',
    quantity: 75000,
    issuanceDate: '2023-03-25',
    status: 'Partial'
  },
  {
    id: '4',
    batchId: 'Batch 44556',
    quantity: 25000,
    issuanceDate: '2023-04-30',
    status: 'Active'
  },
  {
    id: '5',
    batchId: 'Batch 77889',
    quantity: 150000,
    issuanceDate: '2023-05-05',
    status: 'Active'
  }
];

const recentActivity: Activity[] = [
  {
    id: '1',
    activity: 'Credit Transfer',
    date: '2023-06-10',
    details: 'Transferred 50,000 GHC to Recipient X'
  },
  {
    id: '2',
    activity: 'Credit Retirement',
    date: '2023-05-20',
    details: 'Retired 25,000 GHC'
  },
  {
    id: '3',
    activity: 'Credit Issuance',
    date: '2023-05-05',
    details: 'Issued 150,000 GHC'
  },
  {
    id: '4',
    activity: 'Credit Transfer',
    date: '2023-04-15',
    details: 'Transferred 75,000 GHC to Recipient Y'
  },
  {
    id: '5',
    activity: 'Credit Retirement',
    date: '2023-03-20',
    details: 'Retired 10,000 GHC'
  }
];

export default function Dashboard() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <Diamond className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">
              <span className="text-primary">H2</span>
              <span className="text-white">Ledger</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back, Hydrogen Producer</h1>
          <p className="text-muted-foreground">Manage your Green Hydrogen Credit portfolio</p>
        </div>

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
                  1,234,567
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">Batch ID</th>
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">Quantity</th>
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">Issuance Date</th>
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBatches.map((batch, index) => (
                    <tr key={batch.id} className={`hover:bg-muted/20 transition-colors ${index % 2 === 0 ? 'bg-background/30' : ''}`}>
                      <td className="py-4 px-4 font-medium">{batch.batchId}</td>
                      <td className="py-4 px-4 font-mono">{batch.quantity.toLocaleString()} GHC</td>
                      <td className="py-4 px-4 text-muted-foreground">{batch.issuanceDate}</td>
                      <td className="py-4 px-4">
                        <Badge className={`status-chip ${getStatusChipClass(batch.status)}`}>
                          {batch.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">Activity</th>
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity, index) => (
                    <tr key={activity.id} className={`hover:bg-muted/20 transition-colors ${index % 2 === 0 ? 'bg-background/30' : ''}`}>
                      <td className="py-4 px-4 font-medium">{activity.activity}</td>
                      <td className="py-4 px-4 text-muted-foreground">{activity.date}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{activity.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}