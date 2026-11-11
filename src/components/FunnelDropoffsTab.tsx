import React, { useMemo } from 'react';
import { Visit, MetricSummary } from '../types';
import { formatNumber, formatPct } from '../metrics';
import { Info, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface FunnelDropoffsTabProps {
  metrics: MetricSummary;
  visits: Visit[];
}

export const FunnelDropoffsTab: React.FC<FunnelDropoffsTabProps> = ({
  metrics,
  visits,
}) => {
  // 1. Drop-off by step calculations
  const dropoffs = useMemo(() => {
    const sMinusSel = Math.max(0, metrics.s - metrics.sel);
    const sMinusSelPct = metrics.s === 0 ? 0 : (sMinusSel / metrics.s) * 100;

    const pMinusG = Math.max(0, metrics.p - metrics.g);
    const pMinusGPct = metrics.p === 0 ? 0 : (pMinusG / metrics.p) * 100;

    const gMinusR = Math.max(0, metrics.g - metrics.r);
    const gMinusRPct = metrics.g === 0 ? 0 : (gMinusR / metrics.g) * 100;

    const ngMinusFb = Math.max(0, metrics.ng - metrics.fb);
    const ngMinusFbPct = metrics.ng === 0 ? 0 : (ngMinusFb / metrics.ng) * 100;

    return [
      {
        id: 'no_sentiment',
        title: 'Scanned but no sentiment chosen',
        subtitle: 'Customer scanned QR poster but closed tab before picking Positive or Negative',
        count: sMinusSel,
        rate: sMinusSelPct,
        baseLabel: 'of total QR scans',
        color: '#6366F1',
      },
      {
        id: 'no_proceed',
        title: "Positive but didn't proceed to Google",
        subtitle: 'Customer selected Positive and saw AI review draft, but didn’t tap Copy & Post',
        count: pMinusG,
        rate: pMinusGPct,
        baseLabel: 'of positive selections',
        color: '#14C4B4',
      },
      {
        id: 'not_posted',
        title: 'Proceeded but post not verified on Google',
        subtitle: 'Tapped Copy & Post to Google, but the review never verified on the Google Maps listing',
        count: gMinusR,
        rate: gMinusRPct,
        baseLabel: 'of proceeded visitors',
        color: '#10B981',
      },
      {
        id: 'no_feedback',
        title: 'Negative but no feedback submitted',
        subtitle: 'Selected Negative sentiment but abandoned the negative feedback form without sending',
        count: ngMinusFb,
        rate: ngMinusFbPct,
        baseLabel: 'of negative selections',
        color: '#EF4565',
      },
    ].sort((a, b) => b.count - a.count);
  }, [metrics]);

  // 2. Funnel by week
  const weeklyData = useMemo(() => {
    const weeksMap = new Map<
      string,
      { week: string; scans: number; selections: number; proceeded: number; posted: number }
    >();

    visits.forEach(v => {
      const d = new Date(v.scannedAt);
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const pastDaysOfYear = (d.getTime() - startOfYear.getTime()) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
      const weekKey = `W${weekNum}`;

      if (!weeksMap.has(weekKey)) {
        weeksMap.set(weekKey, {
          week: weekKey,
          scans: 0,
          selections: 0,
          proceeded: 0,
          posted: 0,
        });
      }
      const entry = weeksMap.get(weekKey)!;
      entry.scans += 1;
      if (v.sentiment !== null) entry.selections += 1;
      if (v.sentiment === 'positive' && v.proceededToGoogle) entry.proceeded += 1;
      if (v.sentiment === 'positive' && v.postedToGoogle) entry.posted += 1;
    });

    return Array.from(weeksMap.values()).slice(-8); // show last 8 weeks
  }, [visits]);

  return (
    <div className="space-y-6 pt-6">
      {/* 1. Drop-off by Step Card */}
      <div className="bg-white rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Drop-off by Funnel Step
            </h3>
            <p className="text-xs text-slate-500">
              Identifying where customers abandon the journey and why
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded">
            Ranked by drop volume
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {dropoffs.map(step => (
            <div key={step.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{step.title}</span>
                    <div className="relative group">
                      <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                      <div className="absolute left-0 bottom-5 hidden group-hover:block w-64 p-2 bg-slate-900 text-white text-[11px] rounded shadow-lg z-30">
                        {step.subtitle}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{step.subtitle}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-extrabold text-slate-900 tabular-nums">
                    {formatNumber(step.count)}
                  </span>
                  <span className="text-xs font-semibold text-rose-600 ml-1.5 tabular-nums">
                    ({formatPct(step.rate)} {step.baseLabel})
                  </span>
                </div>
              </div>

              {/* Visual horizontal bar */}
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(2, step.rate))}%`,
                    backgroundColor: step.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Funnel by Week Card */}
      <div className="bg-white rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#14B8C4]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Funnel Performance by Week
              </h3>
              <p className="text-xs text-slate-500">
                Weekly progression of scans, sentiment selections, and confirmed Google reviews
              </p>
            </div>
          </div>
        </div>

        <div className="h-64 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
              />
              <Bar dataKey="scans" name="QR Scans" fill="#6366F1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="selections" name="Selections" fill="#10B981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="proceeded" name="Proceeded" fill="#14C4B4" radius={[3, 3, 0, 0]} />
              <Bar dataKey="posted" name="Reviews Generated" fill="#0F9F74" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
