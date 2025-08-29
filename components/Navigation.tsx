'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Diamond, LayoutDashboard, CreditCard, Activity, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/issue', icon: CreditCard, label: 'Issue Credits' },
  { href: '/explorer', icon: Activity, label: 'Live Explorer' },
  { href: '/retire', icon: Settings, label: 'Retire Credits' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-card border-border/50 rounded-2xl px-3 py-2">
        <div className="flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center px-4 py-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-primary/20 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}