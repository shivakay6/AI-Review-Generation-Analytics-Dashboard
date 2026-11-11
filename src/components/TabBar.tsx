import React from 'react';
import { TabType } from '../types';
import { FileSpreadsheet } from 'lucide-react';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenResponses: () => void;
  totalScans: number;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
  onOpenResponses,
  totalScans,
}) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'dropoffs', label: 'Funnel & Drop-offs' },
    { id: 'positive', label: 'Positive Reviews' },
    { id: 'negative', label: 'Negative Feedback' },
    { id: 'stores', label: 'Branch Performance' },
    { id: 'managers', label: 'Manager Performance' },
  ];

  return (
    <div className="flex items-center justify-between border-b border-slate-200 mt-6 overflow-x-auto">
      {/* 6 Tabs with Teal Underline */}
      <div className="flex items-center space-x-8">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`pb-3 text-sm font-bold tracking-tight whitespace-nowrap transition-colors relative ${
                isActive
                  ? 'text-[#14B8C4]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#14B8C4] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right End: View Responses Button */}
      <div className="pb-2.5">
        <button
          onClick={onOpenResponses}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#14B8C4]" />
          <span>View Responses</span>
          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-600 font-mono">
            {totalScans}
          </span>
        </button>
      </div>
    </div>
  );
};
