import React from 'react';
import { Visit, BranchInfo, StoreInfo } from '../types';
import { computeMetrics, formatPct } from '../metrics';
import {
  X,
  Building2,
  Star,
  Clock,
  Sparkles,
  Frown,
  QrCode,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface BranchDetailDrawerProps {
  branch?: BranchInfo | null;
  store?: StoreInfo | null;
  visits: Visit[];
  onClose: () => void;
}

export const BranchDetailDrawer: React.FC<BranchDetailDrawerProps> = ({
  branch,
  store,
  visits,
  onClose,
}) => {
  const activeBranch = branch || store;
  if (!activeBranch) return null;

  // Branch QR visits (counter / walk-in standee QR code)
  const branchVisits = visits.filter(
    v => v.branchName === activeBranch.name && v.qrSource === 'branch'
  );
  // All branch visits (including manager QR) for general context
  const totalBranchVisits = visits.filter(
    v => v.branchName === activeBranch.name
  );

  const metrics = computeMetrics(branchVisits);

  const lastReviews = branchVisits
    .filter(v => v.sentiment === 'positive' && v.postedToGoogle && v.positiveReviewText)
    .slice(-5)
    .reverse();

  const lastFeedback = branchVisits
    .filter(v => v.sentiment === 'negative' && v.negativeFeedback)
    .slice(-5)
    .reverse();

  // Top positive keywords for branch
  const posKws = new Map<string, number>();
  branchVisits
    .filter(v => v.sentiment === 'positive')
    .forEach(v => {
      v.keywords.forEach(kw => posKws.set(kw, (posKws.get(kw) || 0) + 1));
    });
  const topPosKeywords = Array.from(posKws.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Top negative issues for branch
  const negKws = new Map<string, number>();
  branchVisits
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
        {/* Header: Focused on the Branch */}
        <div className="bg-white p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-[#14B8C4]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#111827]">
                  {activeBranch.name}
                </h2>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                    activeBranch.tier === 'strong'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeBranch.tier === 'weak'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {activeBranch.tier === 'strong' ? 'Top Tier' : activeBranch.tier === 'weak' ? 'Low Tier' : 'Mid Tier'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Branch Manager: <strong className="text-slate-800 font-bold">{activeBranch.managerName}</strong> · {activeBranch.city}, {activeBranch.state}
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
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Branch Counter QR Info banner */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-slate-600 shadow-2xs">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#14B8C4]" />
              <span>
                <strong>Branch Standee QR:</strong> Showing customer reviews &amp; scans via the main branch counter QR poster.
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400 shrink-0">
              {metrics.s} scans
            </span>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white p-3 rounded-lg shadow-2xs text-center border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">BRANCH SCANS</span>
              <span className="text-lg font-black text-slate-900 tabular-nums">
                {metrics.s}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-2xs text-center border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">PROCEEDED</span>
              <span className="text-lg font-black text-[#14B8C4] tabular-nums">
                {metrics.g}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-2xs text-center border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">REVIEWS</span>
              <span className="text-lg font-black text-emerald-600 tabular-nums">
                {metrics.r}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-2xs text-center border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">CONVERSION</span>
              <span className="text-lg font-black text-slate-900 tabular-nums">
                {formatPct(metrics.conversionRate)}
              </span>
            </div>
          </div>

          {/* Branch 4-Stage Funnel */}
          <div className="bg-white rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Branch Conversion Funnel
            </h3>

            {/* Stage 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>1. Branch QR Scans</span>
                <span className="font-bold text-slate-900">{metrics.s} (100%)</span>
              </div>
              <div className="w-full h-7 rounded bg-gradient-to-r from-[#6366F1] to-[#5B5BE6] text-white flex items-center px-3 text-xs font-bold">
                {metrics.s} scans
              </div>
            </div>

            {/* Stage 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>2. Sentiment ({formatPct(metrics.selectionRate)} selected)</span>
                <span className="font-bold text-slate-900">
                  {metrics.p} pos / {metrics.ng} neg
                </span>
              </div>
              <div className="w-full h-7 rounded overflow-hidden flex bg-slate-100">
                <div
                  style={{
                    width: `${
                      metrics.sel === 0 ? 0 : (metrics.p / metrics.sel) * 100
                    }%`,
                  }}
                  className="bg-[#10B981] text-white flex items-center px-3 text-xs font-bold"
                >
                  {metrics.p} Positive
                </div>
                {metrics.ng > 0 && (
                  <div
                    style={{
                      width: `${
                        metrics.sel === 0 ? 0 : (metrics.ng / metrics.sel) * 100
                      }%`,
                    }}
                    className="bg-[#EF4565] text-white flex items-center justify-center text-xs font-bold"
                  >
                    {metrics.ng}
                  </div>
                )}
              </div>
            </div>

            {/* Stage 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>3. Proceeded to Google ({formatPct(metrics.proceedRate)})</span>
                <span className="font-bold text-slate-900">{metrics.g} proceeded</span>
              </div>
              <div
                style={{
                  width: `${
                    metrics.s === 0 ? 0 : Math.max(20, (metrics.g / metrics.s) * 100)
                  }%`,
                }}
                className="h-7 rounded bg-[#14C4B4] text-white flex items-center px-3 text-xs font-bold"
              >
                {metrics.g} proceeded
              </div>
            </div>

            {/* Stage 4 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>4. Reviews Generated ({formatPct(metrics.postingRate)} posted)</span>
                <span className="font-bold text-slate-900">{metrics.r} verified</span>
              </div>
              <div
                style={{
                  width: `${
                    metrics.s === 0 ? 0 : Math.max(15, (metrics.r / metrics.s) * 100)
                  }%`,
                }}
                className="h-7 rounded bg-[#0F9F74] text-white flex items-center px-3 text-xs font-bold"
              >
                {metrics.r} verified
              </div>
            </div>
          </div>

          {/* Top positive keywords & negative issues */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Top Positive Themes</span>
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
                  <p className="text-[11px] text-slate-400">No positive keywords yet</p>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
                <Frown className="w-3.5 h-3.5 text-rose-600" />
                <span>Top Complaint Issues</span>
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
                  <p className="text-[11px] text-slate-400">No negative feedback recorded</p>
                )}
              </div>
            </div>
          </div>

          {/* Last 5 Google Reviews */}
          <div className="bg-white rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>Recent Google Reviews (Via Branch QR)</span>
              </h4>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {lastReviews.length > 0 ? (
                lastReviews.map(r => (
                  <div key={r.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(r.scannedAt).toLocaleDateString()}</span>
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
                <p className="py-3 text-slate-400 text-center">No reviews verified yet for this branch QR</p>
              )}
            </div>
          </div>

          {/* Last 5 Feedback entries */}
          <div className="bg-white rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Recent Negative Feedback (Via Branch QR)</span>
            </h4>

            <div className="divide-y divide-slate-100 text-xs">
              {lastFeedback.length > 0 ? (
                lastFeedback.map(fb => (
                  <div key={fb.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(fb.scannedAt).toLocaleDateString()}</span>
                      <span>{fb.contactName || 'Anonymous'}</span>
                    </div>
                    <p className="text-slate-700 leading-snug bg-slate-50 p-2 rounded">
                      {fb.negativeFeedback}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-3 text-slate-400 text-center">No negative feedback received</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StoreDetailDrawer = BranchDetailDrawer;
