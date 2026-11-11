import React from 'react';
import { Visit, BranchInfo } from '../types';
import { computeMetrics, formatNumber, formatPct } from '../metrics';
import {
  X,
  User,
  Star,
  Clock,
  Sparkles,
  Frown,
  QrCode,
  TrendingUp,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface ManagerDetailDrawerProps {
  branch: BranchInfo | null;
  visits: Visit[];
  onClose: () => void;
}

export const ManagerDetailDrawer: React.FC<ManagerDetailDrawerProps> = ({
  branch,
  visits,
  onClose,
}) => {
  if (!branch) return null;

  // Filter visits: Manager's separate personal QR scans vs the general Branch QR scans
  const managerVisits = visits.filter(
    v => v.branchName === branch.name && v.qrSource === 'manager'
  );
  const branchQRVisits = visits.filter(
    v => v.branchName === branch.name && v.qrSource === 'branch'
  );

  const managerMetrics = computeMetrics(managerVisits);
  const branchMetrics = computeMetrics(branchQRVisits);

  const diffConversionPts =
    Math.round((managerMetrics.conversionRate - branchMetrics.conversionRate) * 10) / 10;

  // Last 5 Google reviews from Manager QR
  const managerReviews = managerVisits
    .filter(v => v.sentiment === 'positive' && v.postedToGoogle && v.positiveReviewText)
    .slice(-5)
    .reverse();

  // Last 5 feedback entries from Manager QR
  const managerFeedback = managerVisits
    .filter(v => v.sentiment === 'negative' && v.negativeFeedback)
    .slice(-5)
    .reverse();

  // Top positive keywords for manager QR
  const posKws = new Map<string, number>();
  managerVisits
    .filter(v => v.sentiment === 'positive')
    .forEach(v => {
      v.keywords.forEach(kw => posKws.set(kw, (posKws.get(kw) || 0) + 1));
    });
  const topPosKeywords = Array.from(posKws.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Top negative issues for manager QR
  const negKws = new Map<string, number>();
  managerVisits
    .filter(v => v.sentiment === 'negative')
    .forEach(v => {
      v.keywords.forEach(kw => negKws.set(kw, (negKws.get(kw) || 0) + 1));
    });
  const topNegIssues = Array.from(negKws.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-xl bg-[#F7F8FC] h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header: Focused on the Branch Manager */}
        <div className="bg-white p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-teal-50 border-2 border-[#14B8C4]/30 flex items-center justify-center text-[#0F949F] shadow-xs">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#111827]">
                  {branch.managerName}
                </h2>
                <span className="text-[10px] font-black bg-teal-100 text-[#0F949F] px-2 py-0.5 rounded uppercase tracking-wider">
                  Branch Manager
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                    managerMetrics.conversionRate >= 60
                      ? 'bg-emerald-100 text-emerald-800'
                      : managerMetrics.conversionRate <= 35
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {managerMetrics.conversionRate >= 60
                    ? 'Top Tier'
                    : managerMetrics.conversionRate <= 35
                    ? 'Needs Focus'
                    : 'Mid Tier'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>
                  Branch: <strong className="text-slate-800 font-bold">{branch.name}</strong> · {branch.city}, {branch.state}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Manager Personal QR Badge & Comparison Note */}
          <div className="bg-gradient-to-r from-teal-500/10 via-teal-50 to-emerald-500/10 border border-teal-200/60 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white rounded-lg shadow-2xs text-[#0F949F]">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Manager Personal QR Code
                </span>
                <span className="text-[11px] text-slate-500">
                  Separate desk QR scanned during one-on-one manager consultations
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                vs Branch QR
              </span>
              <span
                className={`text-xs font-black font-mono ${
                  diffConversionPts >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {diffConversionPts >= 0 ? `+${diffConversionPts}` : diffConversionPts} pts
              </span>
            </div>
          </div>

          {/* Quick Metrics Strip for Manager QR */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white p-3 rounded-lg shadow-2xs text-center border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">MANAGER SCANS</span>
              <span className="text-lg font-black text-slate-900 tabular-nums">
                {managerMetrics.s}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {formatPct(managerMetrics.selectionRate)} select
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-2xs text-center border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">PROCEEDED</span>
              <span className="text-lg font-black text-[#14B8C4] tabular-nums">
                {managerMetrics.g}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {formatPct(managerMetrics.proceedRate)} rate
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-2xs text-center border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">REVIEWS</span>
              <span className="text-lg font-black text-emerald-600 tabular-nums">
                {managerMetrics.r}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {formatPct(managerMetrics.postingRate)} posted
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-2xs text-center border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">CONVERSION</span>
              <span className="text-lg font-black text-slate-900 tabular-nums">
                {formatPct(managerMetrics.conversionRate)}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block font-mono">
                R ÷ S
              </span>
            </div>
          </div>

          {/* Branch Manager 4-Stage Funnel */}
          <div className="bg-white rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                <span>Manager QR Conversion Funnel</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {managerMetrics.s} scans recorded
              </span>
            </div>

            {/* Stage 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>1. Manager QR Scans</span>
                <span className="font-bold text-slate-900">{managerMetrics.s} (100%)</span>
              </div>
              <div className="w-full h-7 rounded bg-gradient-to-r from-[#6366F1] to-[#5B5BE6] text-white flex items-center px-3 text-xs font-bold">
                {managerMetrics.s} scans
              </div>
            </div>

            {/* Stage 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>2. Sentiment ({formatPct(managerMetrics.selectionRate)} selected)</span>
                <span className="font-bold text-slate-900">
                  {managerMetrics.p} pos / {managerMetrics.ng} neg
                </span>
              </div>
              <div className="w-full h-7 rounded overflow-hidden flex bg-slate-100">
                <div
                  style={{
                    width: `${
                      managerMetrics.sel === 0 ? 0 : (managerMetrics.p / managerMetrics.sel) * 100
                    }%`,
                  }}
                  className="bg-[#10B981] text-white flex items-center px-3 text-xs font-bold"
                >
                  {managerMetrics.p} Positive
                </div>
                {managerMetrics.ng > 0 && (
                  <div
                    style={{
                      width: `${
                        managerMetrics.sel === 0 ? 0 : (managerMetrics.ng / managerMetrics.sel) * 100
                      }%`,
                    }}
                    className="bg-[#EF4565] text-white flex items-center justify-center text-xs font-bold"
                  >
                    {managerMetrics.ng}
                  </div>
                )}
              </div>
            </div>

            {/* Stage 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>3. Proceeded to Google ({formatPct(managerMetrics.proceedRate)})</span>
                <span className="font-bold text-slate-900">{managerMetrics.g} proceeded</span>
              </div>
              <div
                style={{
                  width: `${
                    managerMetrics.s === 0 ? 0 : Math.max(20, (managerMetrics.g / managerMetrics.s) * 100)
                  }%`,
                }}
                className="h-7 rounded bg-[#14C4B4] text-white flex items-center px-3 text-xs font-bold"
              >
                {managerMetrics.g} proceeded
              </div>
            </div>

            {/* Stage 4 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>4. Reviews Generated ({formatPct(managerMetrics.postingRate)} posted)</span>
                <span className="font-bold text-slate-900">{managerMetrics.r} verified</span>
              </div>
              <div
                style={{
                  width: `${
                    managerMetrics.s === 0 ? 0 : Math.max(15, (managerMetrics.r / managerMetrics.s) * 100)
                  }%`,
                }}
                className="h-7 rounded bg-[#0F9F74] text-white flex items-center px-3 text-xs font-bold"
              >
                {managerMetrics.r} verified
              </div>
            </div>
          </div>

          {/* Top Positive Consultation Themes & Complaints */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Manager Praise Themes</span>
              </h4>
              <div className="space-y-1.5">
                {topPosKeywords.length > 0 ? (
                  topPosKeywords.map(([kw, cnt]) => (
                    <div
                      key={kw}
                      className="flex items-center justify-between text-[11px] p-1.5 bg-slate-50 rounded"
                    >
                      <span className="font-medium text-slate-700 truncate">{kw}</span>
                      <span className="font-mono font-bold text-teal-700">{cnt}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400">No positive themes recorded yet</p>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
                <Frown className="w-3.5 h-3.5 text-rose-600" />
                <span>Manager Feedback Issues</span>
              </h4>
              <div className="space-y-1.5">
                {topNegIssues.length > 0 ? (
                  topNegIssues.map(([kw, cnt]) => (
                    <div
                      key={kw}
                      className="flex items-center justify-between text-[11px] p-1.5 bg-rose-50/50 rounded"
                    >
                      <span className="font-medium text-slate-700 truncate">{kw}</span>
                      <span className="font-mono font-bold text-rose-700">{cnt}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400">No feedback issues recorded</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Google Reviews from Manager QR */}
          <div className="bg-white rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>Verified Google Reviews (Via Manager Desk QR)</span>
              </h4>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                {managerReviews.length} shown
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {managerReviews.length > 0 ? (
                managerReviews.map(r => (
                  <div key={r.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(r.scannedAt).toLocaleDateString()} IST</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified on Google
                      </span>
                    </div>
                    <p className="text-slate-700 leading-snug line-clamp-3">
                      {r.positiveReviewText}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-3 text-slate-400 text-center">No reviews verified yet for this manager QR</p>
              )}
            </div>
          </div>

          {/* Recent Negative Feedback received through Manager QR */}
          <div className="bg-white rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Negative Feedback Received (Via Manager Desk QR)</span>
            </h4>

            <div className="divide-y divide-slate-100 text-xs">
              {managerFeedback.length > 0 ? (
                managerFeedback.map(fb => (
                  <div key={fb.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(fb.scannedAt).toLocaleDateString()} IST</span>
                      <span className="font-semibold text-slate-700">{fb.contactName || 'Anonymous Customer'}</span>
                    </div>
                    <p className="text-slate-700 leading-snug bg-slate-50 p-2.5 rounded border border-slate-100">
                      {fb.negativeFeedback}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-3 text-slate-400 text-center">No negative feedback recorded for this manager QR</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
