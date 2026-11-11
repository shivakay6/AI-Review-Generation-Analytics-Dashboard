import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  changeChip: {
    label: string;
    direction: 'up' | 'down' | 'neutral';
    isAvailable: boolean;
  };
  contextLine: string;
  formulaTooltip: string;
  icon: React.ReactNode;
  iconBgColor?: string; // e.g. 'bg-purple-100 text-purple-600'
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  changeChip,
  contextLine,
  formulaTooltip,
  icon,
  iconBgColor = 'bg-slate-100 text-slate-600',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs relative flex flex-col justify-between transition-all hover:shadow-sm">
      {/* Top row: Icon in soft-tinted circle, Formula info tooltip, Small-caps label */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBgColor}`}
          >
            {icon}
          </div>
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            {label}
          </span>
        </div>

        {/* ⓘ Tooltip */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-slate-300 hover:text-slate-500 p-0.5 rounded transition-colors"
            title="Formula information"
            aria-label={`Info for ${label}`}
          >
            <Info className="w-4 h-4" />
          </button>

          {showTooltip && (
            <div className="absolute right-0 top-6 z-30 w-52 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl leading-snug">
              <p className="font-semibold text-slate-200 mb-0.5">Calculation</p>
              <p className="text-slate-300">{formulaTooltip}</p>
            </div>
          )}
        </div>
      </div>

      {/* Middle row: Big Value + Change Chip */}
      <div className="mt-4 flex items-baseline gap-2.5 flex-wrap">
        <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
          {value}
        </span>

        {/* Change chip */}
        {changeChip.isAvailable ? (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              changeChip.direction === 'up'
                ? 'bg-emerald-50 text-emerald-700'
                : changeChip.direction === 'down'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {changeChip.label}
          </span>
        ) : (
          <span className="inline-flex items-center text-xs font-medium text-slate-400 px-1.5 py-0.5">
            —
          </span>
        )}
      </div>

      {/* Bottom row: Context line */}
      <div className="mt-2 text-xs text-slate-500 truncate">
        {contextLine}
      </div>
    </div>
  );
};
