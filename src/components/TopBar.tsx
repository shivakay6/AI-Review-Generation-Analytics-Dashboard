import React, { useState } from 'react';
import {
  Bell,
  MessageCircle,
  ChevronDown,
  LayoutGrid,
  List,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between z-20">
      {/* Left side: Welcome text & mode toggle */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">
          Welcome <strong className="text-slate-900 font-bold">Truhome Finance</strong>
        </span>

        {/* Two small toggle icon buttons (teal active) */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-md">
          <button
            onClick={() => setViewMode('grid')}
            title="Grid view"
            className={`p-1.5 rounded transition-all ${
              viewMode === 'grid'
                ? 'bg-[#14B8C4] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="List view"
            className={`p-1.5 rounded transition-all ${
              viewMode === 'list'
                ? 'bg-[#14B8C4] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right side: Account dropdown, chat with badge 23, bell, avatar */}
      <div className="flex items-center gap-4">
        {/* Account Dropdown */}
        <div className="relative">
          <button
            onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
          >
            <span>Truhome Finance</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {accountDropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 text-xs text-slate-700 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">Truhome Finance</p>
                <p className="text-slate-400 text-[11px]">admin@truhomefinance.com</p>
              </div>
              <button
                onClick={() => setAccountDropdownOpen(false)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50"
              >
                Account Settings
              </button>
              <button
                onClick={() => setAccountDropdownOpen(false)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-red-600"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Chat icon with "23" badge */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-50 transition-colors"
          title="Messages"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 bg-[#EF4565] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
            23
          </span>
        </button>

        {/* Bell notification icon */}
        <button
          className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-50 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-[#14B8C4] flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-xs">
          TF
        </div>
      </div>
    </header>
  );
};
