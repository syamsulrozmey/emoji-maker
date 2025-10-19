'use client';

import { HelpCircle } from 'lucide-react';
import { SignedIn, UserButton } from '@clerk/nextjs';

interface HeaderProps {
  credits?: number;
  onUpgradeClick?: () => void;
}

export function Header({ credits = 0, onUpgradeClick }: HeaderProps) {
  return (
    <header className="w-full flex items-center justify-between py-[12px] px-[16px] border-b border-slate-200">
      <div className="flex items-center gap-[32px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center">
            <span className="text-xs font-semibold tracking-tight text-slate-950">EMJ</span>
          </div>
          <span className="text-sm text-slate-600">EmojiMaker</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          aria-label="Help"
          className="h-[36px] w-[36px] flex items-center justify-center rounded-[6px] hover:bg-slate-100 transition-colors"
        >
          <HelpCircle className="h-4 w-4 text-slate-600" />
        </button>
        
        <div className="flex items-center justify-center h-[36px] bg-white border border-slate-200 rounded-[6px] px-[16px]">
          <span className="text-sm font-medium text-slate-950 tracking-[-0.084px] whitespace-nowrap">
            {credits} credit{credits !== 1 ? 's' : ''} left
          </span>
        </div>
        
        <button 
          onClick={onUpgradeClick}
          className="h-[36px] bg-orange-700 hover:bg-orange-600 text-slate-50 rounded-[6px] px-[16px] flex items-center justify-center transition-colors"
        >
          <span className="text-sm font-medium tracking-[-0.084px] whitespace-nowrap">
            Upgrade
          </span>
        </button>
        
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  );
}

