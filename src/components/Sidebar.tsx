import React from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  Share2,
  Users,
  MapPin,
  BarChart3,
  Ticket,
  TrendingUp,
  Settings,
  ChevronDown,
} from 'lucide-react';

interface SidebarProps {
  onNavClick?: (item: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  return (
    <aside className="w-[260px] bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 select-none min-h-screen">
      <div>
        {/* Promanage Logo */}
        <div className="h-16 flex items-center px-6 gap-2.5 border-b border-slate-50">
          <div className="w-8 h-8 rounded-lg bg-[#14B8C4] flex items-center justify-center text-white font-black text-xl shadow-sm">
            p
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#111827]">
            promanage
          </span>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {/* Central Dashboard */}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left">
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            <span>Central Dashboard</span>
          </button>

          {/* Unified Reviews - expanded group */}
          <div className="space-y-1 pt-0.5">
            <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold bg-[#14B8C4] text-white shadow-xs">
              <div className="flex items-center gap-3">
                <MessageSquareText className="w-4 h-4 text-white" />
                <span>Unified Reviews</span>
              </div>
              <ChevronDown className="w-4 h-4 text-white/90" />
            </div>

            {/* Sub-item: Funnel Analytics (active) */}
            <div className="pl-4 pr-1 py-1">
              <div className="relative flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold text-[#14B8C4] bg-[#14B8C4]/10">
                <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#14B8C4] rounded-r" />
                <span>Funnel Analytics</span>
              </div>
            </div>
          </div>

          {/* Other nav items */}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left">
            <Share2 className="w-4 h-4 text-slate-400" />
            <span>Social Feed</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left">
            <Users className="w-4 h-4 text-slate-400" />
            <span>Team</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>Location Groups</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <span>Reports</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left">
            <Ticket className="w-4 h-4 text-slate-400" />
            <span>Tickets</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span>Rank Tracker</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left">
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Faint Promanage wordmark lower in the sidebar */}
      <div className="p-6 text-center">
        <span className="text-3xl font-black text-slate-200/60 tracking-wider uppercase select-none pointer-events-none">
          promanage
        </span>
      </div>
    </aside>
  );
};
