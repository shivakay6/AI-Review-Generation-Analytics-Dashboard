import React from 'react';
import {
  QrCode,
  MousePointerClick,
  ExternalLink,
  Star,
  Smile,
  Filter,
} from 'lucide-react';
import { Visit, MetricSummary, ComparisonMode } from '../types';
import {
  formatNumber,
  formatPct,
  formatCountChange,
  formatRateChangePts,
} from '../metrics';
import { KpiCard } from './KpiCard';

interface OverviewTabProps {
  currentMetrics: MetricSummary;
  prevMetrics: MetricSummary | null;
  comparisonMode: ComparisonMode;
  activeOutletsCount?: number;
  activeBranchesCount?: number;
  currentVisits: Visit[];
  prevVisits: Visit[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  currentMetrics,
  prevMetrics,
  comparisonMode,
  activeOutletsCount,
  activeBranchesCount,
}) => {
  const periodLabel = comparisonMode === 'MoM' ? 'M-o-M' : 'Y-o-Y';
  const branchCount = activeBranchesCount || activeOutletsCount || 0;

  // Negative width proportion in stage 2 bar
  const negRatio =
    currentMetrics.sel === 0 ? 0 : (currentMetrics.ng / currentMetrics.sel) * 100;
  const clampedNegRatio = Math.max(0, Math.min(60, negRatio));

  return (
    <div className="space-y-6 pt-6">
      {/* 5 KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. TOTAL QR SCANS */}
        <KpiCard
          label="TOTAL QR SCANS"
          value={formatNumber(currentMetrics.s)}
          changeChip={formatCountChange(currentMetrics.s, prevMetrics ? prevMetrics.s : null, periodLabel)}
          contextLine={`Across ${branchCount} active branches`}
          formulaTooltip="Total visits where the review landing page was opened after scanning a branch or manager QR poster."
          icon={<QrCode className="w-4 h-4" />}
          iconBgColor="bg-purple-100 text-purple-600"
        />

        {/* 2. SENTIMENT SELECTIONS */}
        <KpiCard
          label="SENTIMENT SELECTIONS"
          value={formatNumber(currentMetrics.sel)}
          changeChip={formatRateChangePts(
            currentMetrics.selectionRate,
            prevMetrics ? prevMetrics.selectionRate : null,
            periodLabel
          )}
          contextLine={`${formatPct(currentMetrics.selectionRate)} of QR scans`}
          formulaTooltip="Visits where customer chose either Positive or Negative (Sel = P + Ng). Selection Rate = Sel ÷ S."
          icon={<MousePointerClick className="w-4 h-4" />}
          iconBgColor="bg-teal-100 text-[#0F949F]"
        />

        {/* 3. PROCEEDED TO GOOGLE */}
        <KpiCard
          label="PROCEEDED TO GOOGLE"
          value={formatNumber(currentMetrics.g)}
          changeChip={formatRateChangePts(
            currentMetrics.proceedRate,
            prevMetrics ? prevMetrics.proceedRate : null,
            periodLabel
          )}
          contextLine={`${formatPct(currentMetrics.proceedRate)} of positive selections`}
          formulaTooltip="Positive visits where the customer clicked 'Copy & Post to Google'. Proceed Rate = G ÷ P."
          icon={<ExternalLink className="w-4 h-4" />}
          iconBgColor="bg-sky-100 text-sky-600"
        />

        {/* 4. REVIEWS GENERATED */}
        <KpiCard
          label="REVIEWS GENERATED"
          value={formatNumber(currentMetrics.r)}
          changeChip={formatRateChangePts(
            currentMetrics.conversionRate,
            prevMetrics ? prevMetrics.conversionRate : null,
            periodLabel
          )}
          contextLine={`${formatPct(currentMetrics.conversionRate)} Conversion`}
          formulaTooltip="Reviews verified as posted to the branch's Google business listing. Conversion = R ÷ S."
          icon={<Star className="w-4 h-4 fill-emerald-600" />}
          iconBgColor="bg-emerald-100 text-emerald-600"
        />

        {/* 5. POSITIVE SENTIMENT */}
        <KpiCard
          label="POSITIVE SENTIMENT"
          value={formatPct(currentMetrics.positiveSentimentRate)}
          changeChip={formatRateChangePts(
            currentMetrics.positiveSentimentRate,
            prevMetrics ? prevMetrics.positiveSentimentRate : null,
            periodLabel
          )}
          contextLine={`${formatNumber(currentMetrics.p)} positive, ${formatNumber(currentMetrics.ng)} negative`}
          formulaTooltip="Share of customers choosing Positive out of all sentiment selections (P ÷ Sel)."
          icon={<Smile className="w-4 h-4" />}
          iconBgColor="bg-emerald-100 text-emerald-600"
        />
      </div>

      {/* Conversion Funnel Master Card */}
      <div className="bg-white rounded-xl p-6 shadow-xs">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#111827]">
                Conversion Funnel Master
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Visualizing the customer journey from QR scan to Google review
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
            Aggregate View
          </span>
        </div>

        {/* 4-Stage Funnel Visualization */}
        <div className="py-8 max-w-4xl mx-auto flex flex-col items-center">
          {/* Stage 1: QR Scans */}
          <div className="w-full flex items-center justify-between gap-4">
            <div className="w-44 text-right">
              <p className="text-sm font-bold text-slate-900">QR Scans</p>
              <p className="text-xs text-slate-400">Review page opened</p>
            </div>

            {/* Fixed width bar 1: 100% width of funnel center */}
            <div className="flex-1 max-w-[560px]">
              <div className="h-13 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#5B5BE6] flex items-center justify-between px-6 text-white shadow-xs">
                <span className="font-extrabold text-base tracking-tight tabular-nums">
                  {formatNumber(currentMetrics.s)}
                </span>
                <span className="text-[11px] font-black tracking-wider text-white/90">
                  100% VOLUME
                </span>
              </div>
            </div>

            <div className="w-48 text-left text-xs text-slate-500 font-medium">
              Across {branchCount} active branches
            </div>
          </div>

          {/* Pill 1: Selection Rate */}
          <div className="my-2 z-10">
            <div className="bg-white border border-slate-200/80 shadow-xs px-3.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-black text-[#5B5BE6]">
              <span>⚡</span>
              <span>{formatPct(currentMetrics.selectionRate)} Selection Rate</span>
            </div>
          </div>

          {/* Stage 2: Sentiment Selections */}
          <div className="w-full flex items-center justify-between gap-4">
            <div className="w-44 text-right">
              <p className="text-sm font-bold text-slate-900">Sentiment Selections</p>
              <p className="text-xs text-slate-400">Positive or negative chosen</p>
            </div>

            {/* Fixed width bar 2: max-w-[460px] */}
            <div className="flex-1 max-w-[460px]">
              <div className="h-13 rounded-lg overflow-hidden flex shadow-xs">
                {/* Green positive part */}
                <div
                  style={{ width: `${100 - clampedNegRatio}%` }}
                  className="bg-gradient-to-r from-[#10B981] to-[#0E9F6E] flex items-center justify-between px-4 text-white"
                >
                  <span className="font-extrabold text-base tracking-tight tabular-nums truncate">
                    {formatNumber(currentMetrics.p)}
                  </span>
                  <span className="text-[11px] font-black tracking-wider text-white/90 shrink-0">
                    POSITIVE
                  </span>
                </div>

                {/* Red negative segment on right */}
                {currentMetrics.ng > 0 && (
                  <div
                    style={{ width: `${clampedNegRatio}%` }}
                    className="bg-[#EF4565] flex items-center justify-center px-2 text-white font-black text-xs tabular-nums"
                    title={`${formatNumber(currentMetrics.ng)} negative selections`}
                  >
                    <span>{formatNumber(currentMetrics.ng)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="w-48 text-left text-xs text-slate-500 font-medium">
              {formatPct(currentMetrics.positiveSentimentRate)} positive sentiment
            </div>
          </div>

          {/* Pill 2: Proceed Rate */}
          <div className="my-2 z-10">
            <div className="bg-white border border-slate-200/80 shadow-xs px-3.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-black text-[#0D9488]">
              <span>◎</span>
              <span>{formatPct(currentMetrics.proceedRate)} Proceed Rate</span>
            </div>
          </div>

          {/* Stage 3: Proceeded to Google */}
          <div className="w-full flex items-center justify-between gap-4">
            <div className="w-44 text-right">
              <p className="text-sm font-bold text-slate-900">Proceeded to Google</p>
              <p className="text-xs text-slate-400">Copy &amp; Post clicked</p>
            </div>

            {/* Fixed width bar 3: max-w-[360px] */}
            <div className="flex-1 max-w-[360px]">
              <div className="h-13 rounded-lg bg-gradient-to-r from-[#14C4B4] to-[#0D9488] flex items-center justify-between px-5 text-white shadow-xs">
                <span className="font-extrabold text-base tracking-tight tabular-nums">
                  {formatNumber(currentMetrics.g)}
                </span>
                <span className="text-[11px] font-black tracking-wider text-white/90">
                  PROCEEDED
                </span>
              </div>
            </div>

            <div className="w-48 text-left text-xs text-slate-500 font-medium">
              Review copied to clipboard
            </div>
          </div>

          {/* Pill 3: Posting Rate */}
          <div className="my-2 z-10">
            <div className="bg-white border border-slate-200/80 shadow-xs px-3.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-black text-emerald-700">
              <span>✓</span>
              <span>{formatPct(currentMetrics.postingRate)} Posting Rate</span>
            </div>
          </div>

          {/* Stage 4: Reviews Generated */}
          <div className="w-full flex items-center justify-between gap-4">
            <div className="w-44 text-right">
              <p className="text-sm font-bold text-slate-900">Reviews Generated</p>
              <p className="text-xs text-slate-400">Posted on Google</p>
            </div>

            {/* Fixed width bar 4: max-w-[270px] */}
            <div className="flex-1 max-w-[270px]">
              <div className="h-13 rounded-lg bg-gradient-to-r from-[#0F9F74] to-[#0B8A6B] flex items-center justify-between px-5 text-white shadow-xs">
                <span className="font-extrabold text-base tracking-tight tabular-nums">
                  {formatNumber(currentMetrics.r)}
                </span>
                <span className="text-[11px] font-black tracking-wider text-white/90">
                  FINAL RESULT
                </span>
              </div>
            </div>

            <div className="w-48 text-left text-xs text-slate-500 font-medium">
              {formatPct(currentMetrics.conversionRate)} overall conversion
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
