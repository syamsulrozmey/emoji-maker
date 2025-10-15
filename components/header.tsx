'use client';

import { HelpCircle } from 'lucide-react';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { Button } from './ui/button';

interface HeaderProps {
  credits?: number;
  onUpgradeClick?: () => void;
}

export function Header({ credits = 0, onUpgradeClick }: HeaderProps) {
  return (
    <header className="w-full flex items-center justify-between py-4 px-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <HelpCircle className="h-5 w-5 text-gray-600" />
        </Button>
        
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span>{credits} credit{credits !== 1 ? 's' : ''} left</span>
        </div>
        
        <Button 
          onClick={onUpgradeClick}
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-6"
        >
          Upgrade
        </Button>
        
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  );
}

