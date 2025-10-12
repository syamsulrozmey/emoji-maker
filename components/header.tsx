'use client';

import { HelpCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  credits?: number;
}

export function Header({ credits = 5 }: HeaderProps) {
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
          <span>{credits} credits left</span>
        </div>
        
        <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-6">
          Upgrade
        </Button>
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
      </div>
    </header>
  );
}

