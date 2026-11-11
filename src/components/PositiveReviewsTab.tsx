import React, { useState, useMemo } from 'react';
import { Visit, MetricSummary, ComparisonMode } from '../types';
import {
  formatNumber,
  formatPct,
  formatCountChange,
  formatRateChangePts,
} from '../metrics';
import { KpiCard } from './KpiCard';
import { POSITIVE_KEYWORDS } from '../mockData';
import {
  Star,
  CheckCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface PositiveReviewsTabProps {
  metrics: MetricSummary;
  prevMetrics: MetricSummary | null;
  comparisonMode: ComparisonMode;
  visits: Visit[];
}

export const PositiveReviewsTab: React.FC<PositiveReviewsTabProps> = ({
  metrics,
  prevMetrics,
  comparisonMode,
  visits,
}) => {
  const periodLabel = comparisonMode === 'MoM' ? 'M-o-M' : 'Y-o-Y';

  const [currentPage, setCurrentPage] = useState(1);

  // 1. Keyword usage and Posting Rate per keyword
  const keywordStats = useMemo(() => {
    const posVisits = visits.filter(v => v.sentiment === 'positive');
    const totalPos = posVisits.length || 1;

    return POSITIVE_KEYWORDS.map(kw => {
      const withKw = posVisits.filter(v => v.keywords.includes(kw));
      const withKwProceeded = withKw.filter(v => v.proceededToGoogle);
      const withKwPosted = withKwProceeded.filter(v => v.postedToGoogle);

      const usageRate = (withKw.length / totalPos) * 100;
      const kwPostingRate =
        withKwProceeded.length === 0 ? 0 : (withKwPosted.length / withKwProceeded.length) * 100;

      return {
        keyword: kw,
        count: withKw.length,
        usageRate: Math.round(usageRate * 10) / 10,
        postingRate: Math.round(kwPostingRate * 10) / 10,
        postedCount: withKwPosted.length,
      };
    }).sort((a, b) => b.usageRate - a.usageRate);
  }, [visits]);

  // 2. Review Length Distribution buckets (0–150, 151–300, 301–450, >450)
  const lengthBuckets = useMemo(() => {
    const buckets = [
      { bucket: '0–150 chars', count: 0 },
      { bucket: '151–300 chars', count: 0 },
      { bucket: '301–450 chars', count: 0 },
      { bucket: '>450 chars', count: 0 },
    ];

    visits
      .filter(v => v.sentiment === 'positive' && v.postedToGoogle && v.positiveReviewText)
      .forEach(v => {
        const len = v.positiveReviewText!.length;
        if (len <= 150) buckets[0].count += 1;
        else if (len <= 300) buckets[1].count += 1;
        else if (len <= 450) buckets[2].count += 1;
        else buckets[3].count += 1;
      });

    return buckets;
  }, [visits]);

  // 3. Recently Received Google Reviews List (Filtered by main filters: Date & Branches)
  const postedReviews = useMemo(() => {
    return visits
      .filter(v => v.sentiment === 'positive' && v.postedToGoogle && v.positiveReviewText)
      .sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime());
  }, [visits]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(postedReviews.length / itemsPerPage));
  const paginatedReviews = postedReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 pt-6">
      {/* 3 KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Reviews Generated (R) */}
        <KpiCard
          label="REVIEWS GENERATED"
          value={formatNumber(metrics.r)}
          changeChip={formatCountChange(
            metrics.r,
            prevMetrics ? prevMetrics.r : null,
            periodLabel
          )}
          contextLine={`${formatPct(metrics.conversionRate)} overall conversion`}
          formulaTooltip="Verified reviews published on the branch's Google Business Profile (R)."
          icon={<Star className="w-4 h-4 fill-emerald-600" />}
          iconBgColor="bg-emerald-100 text-emerald-600"
        />

        {/* 2. Posting Rate */}
        <KpiCard
          label="POSTING RATE"
          value={formatPct(metrics.postingRate)}
          changeChip={formatRateChangePts(
            metrics.postingRate,
            prevMetrics ? prevMetrics.postingRate : null,
            periodLabel
          )}
          contextLine={`${formatNumber(metrics.r)} of ${formatNumber(metrics.g)} proceeded`}
          formulaTooltip="Share of customers who clicked 'Copy & Post' whose review successfully posted on Google (R ÷ G)."
          icon={<CheckCircle className="w-4 h-4" />}
          iconBgColor="bg-teal-100 text-[#0F949F]"
        />

        {/* 3. Avg. Review Length */}
        <KpiCard
          label="AVG. REVIEW LENGTH"
          value={`${metrics.avgPositiveReviewLength} chars`}
          changeChip={formatRateChangePts(
            metrics.avgPositiveReviewLength,
            prevMetrics ? prevMetrics.avgPositiveReviewLength : null,
            periodLabel
          )}
          contextLine="Optimal length for Google Local SEO"
          formulaTooltip="Average character length of AI rich review texts among verified posted reviews."
          icon={<FileText className="w-4 h-4" />}
          iconBgColor="bg-indigo-100 text-indigo-600"
        />
      </div>

      {/* 2-Column: Keyword Usage & Review Length Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keyword Usage Horizontal Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                AI Keyword Usage &amp; Posting Rate
              </h3>
              <p className="text-xs text-slate-500">
                Frequency in positive reviews and the resulting Google posting rate
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3.5">
            {keywordStats.map(kw => (
              <div key={kw.keyword} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{kw.keyword}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-slate-600">{kw.usageRate}% used</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {kw.postingRate}% posted
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#14B8C4] rounded-full transition-all duration-300"
                    style={{ width: `${kw.usageRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Length Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Review Character Length Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Distribution of AI rich review lengths verified on Google
                </p>
              </div>
            </div>

            <div className="h-56 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lengthBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" name="Reviews" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-500 font-medium">
            💡 Google algorithms favor reviews with 350–550 characters featuring contextual keywords.
          </div>
        </div>
      </div>

      {/* 3. Recently Received Google Reviews Section (Clean without redundant secondary filters) */}
      <div className="bg-white rounded-xl p-6 shadow-xs">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-900">
              Recently Received Google Reviews
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {metrics.r} Verified on Google
            </span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="mt-4 divide-y divide-slate-100">
          {paginatedReviews.length > 0 ? (
            paginatedReviews.map(item => {
              const dateStr = new Date(item.scannedAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              const charLength = item.positiveReviewText?.length || 0;

              return (
                <div key={item.id} className="py-4 space-y-2.5">
                  {/* Top Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {item.branchName || item.storeName}
                      </span>
                      <span className="text-[11px] text-slate-400">· {item.city}</span>
                      <span className="text-[11px] text-slate-400">· {dateStr} IST</span>
                      <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                        {item.qrSource === 'manager'
                          ? `Manager QR (${item.managerName})`
                          : 'Branch QR'}
                      </span>
                    </div>

                    {/* Google Verification & Character Pill */}
                    <div className="flex items-center gap-2.5 text-xs">
                      {/* 5 Stars */}
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>

                      <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified on Google
                      </span>

                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {charLength} chars
                      </span>
                    </div>
                  </div>

                  {/* Keywords Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.keywords.map(kw => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200/60"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        {kw}
                      </span>
                    ))}
                  </div>

                  {/* Positive Review Text Card */}
                  <p className="text-xs text-slate-800 leading-relaxed font-normal bg-gradient-to-r from-emerald-50/40 to-teal-50/30 p-3.5 rounded-lg border border-emerald-100/70">
                    &ldquo;{item.positiveReviewText}&rdquo;
                  </p>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              No verified Google reviews found for this period
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, postedReviews.length)} of{' '}
              {postedReviews.length} verified reviews
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 rounded border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1 rounded border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
