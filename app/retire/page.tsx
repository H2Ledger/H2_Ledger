'use client';

import { useState } from 'react';
import { Diamond, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function RetireCredit() {
  const [amount, setAmount] = useState('');
  const [isRetiring, setIsRetiring] = useState(false);

  const handleRetire = () => {
    setIsRetiring(true);
    // Simulate retirement transaction
    setTimeout(() => {
      setIsRetiring(false);
      alert('Credit retirement confirmed!');
    }, 3000);
  };

  const networkFee = 0.00001;
  const total = amount ? parseFloat(amount) + networkFee : 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Diamond className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">
              <span className="text-primary">H2</span>
              <span className="text-white">Ledger</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-center">
          <Card className="glass-card border-border/50 w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Retire GHC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-muted/30 border-border/50 py-6 text-lg"
                />
              </div>

              {/* Transaction Summary */}
              {amount && (
                <Card className="bg-muted/20 border-border/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Transaction Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-mono">{amount} GHC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network Fee</span>
                      <span className="font-mono">{networkFee} ETH</span>
                    </div>
                    <div className="border-t border-border/30 pt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="font-mono">{total.toFixed(5)} GHC</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Warning */}
              <Alert className="bg-yellow-500/10 border-yellow-500/30">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-200">
                  <strong>Important Notice:</strong> Once you retire GHC, the action is irreversible. 
                  Please ensure you have selected the correct amount and are certain about this action.
                </AlertDescription>
              </Alert>

              {/* Confirm Button */}
              <Button 
                onClick={handleRetire}
                disabled={!amount || isRetiring}
                className="w-full py-6 text-lg bg-primary hover:bg-primary/90 rounded-2xl"
              >
                {isRetiring ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3" />
                    Confirming Retirement...
                  </>
                ) : (
                  'Confirm Retirement'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}