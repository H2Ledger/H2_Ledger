'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Diamond } from 'lucide-react';

export default function Home() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = () => {
    setIsConnecting(true);
    // Simulate wallet connection
    setTimeout(() => {
      setIsConnecting(false);
      window.location.href = '/dashboard';
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
      
      {/* Main Content */}
      <div className="flex flex-col items-center space-y-12 z-10">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-glow">
              <Diamond className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-6xl font-bold tracking-tight">
              <span className="text-primary">H2</span>
              <span className="text-white">Ledger</span>
            </h1>
            <p className="text-xl text-muted-foreground mt-4 max-w-md">
              The premier platform for Green Hydrogen Credit management on the blockchain
            </p>
          </div>
        </div>

        {/* CTA */}
        <Button 
          size="lg" 
          onClick={handleConnectWallet}
          disabled={isConnecting}
          className="px-12 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl transition-all duration-300 hover:scale-105"
        >
          {isConnecting ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5 mr-3" />
              Connect Wallet
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground text-center max-w-lg">
          Connect your Web3 wallet to start issuing, transferring, and retiring Green Hydrogen Credits
        </div>
      </div>
    </div>
  );
}