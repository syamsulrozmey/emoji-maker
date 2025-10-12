'use client';

import { Plus } from 'lucide-react';
import { Button } from './ui/button';

interface FilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs?: string[];
}

export function FilterTabs({ 
  activeTab, 
  onTabChange, 
  tabs = ['All', 'Animals', 'Cars'] 
}: FilterTabsProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <Button
        variant="outline"
        className="flex items-center gap-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white border-0"
      >
        <Plus className="h-4 w-4" />
        Add folder
      </Button>
    </div>
  );
}

