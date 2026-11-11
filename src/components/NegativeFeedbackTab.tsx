import React, { useState, useMemo } from 'react';
import { Visit, MetricSummary, ComparisonMode } from '../types';
import {
  formatNumber,
  formatPct,
  formatCountChange,
} from '../metrics';
import { KpiCard } from './KpiCard';
import { NEGATIVE_KEYWORDS } from '../mockData';
import {
  Frown,
  Inbox,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
} from 'lucide-react';

interface NegativeFeedbackTabProps {
  metrics: MetricSummary;
  prevMetrics: MetricSummary | null;
  comparisonMode: ComparisonMode;
  visits: Visit[];
}

export const NegativeFeedbackTab: React.FC<NegativeFeedbackTabProps> = ({
  metrics,
  prevMetrics,
  comparisonMode,
  visits,
}) => {
  const periodLabel = comparisonMode === 'MoM' ? 'M-o-M' : 'Y-o-Y';

  const [currentPage, setCurrentPage] = useState(1);
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});

  const togglePhoneReveal = (id: string) => {
    setRevealedPhones(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const maskPhone = (phone: string | null) => {
    if (!phone) return '—';
    if (phone.length < 10) return phone;
    return `${phone.slice(0, 2)}XXXXXX${phone.slice(-2)}`;
  };

  // 1. Top Issues Ranked List
  const topIssues = useMemo(() => {
    const negVisits = visits.filter(v => v.sentiment === 'negative');
    const totalNegFeedback = metrics.fb || 1;

    return NEGATIVE_KEYWORDS.map(kw => {
      const count = negVisits.filter(v => v.keywords.includes(kw)).length;
      const pct = Math.round((count / totalNegFeedback) * 1000) / 10;
      return {
        keyword: kw,
        count,
        pct,
      };
    }).sort((a, b) => b.count - a.count);
  }, [visits, metrics.fb]);

  // 2. Issues by Branch (Top 10 Branches with most negative feedback)
  const branchIssuesData = useMemo(() => {
    const branchMap = new Map<string, { branchName: string; totalNeg: number; counts: Record<string, number> }>();

    visits
      .filter(v => v.sentiment === 'negative')
      .forEach(v => {
        const bName = v.branchName || v.storeName;
        if (!branchMap.has(bName)) {
          branchMap.set(bName, {
            branchName: bName,
            totalNeg: 0,
            counts: {
              'Staff Support': 0,
              'Waiting Time': 0,
              'Interest & EMI': 0,
              'Loan Approval': 0,
              'Process / Documentation': 0,
              Others: 0,
            },
          });
        }
        const record = branchMap.get(bName)!;
        record.totalNeg += 1;
        v.keywords.forEach(kw => {
          if (record.counts[kw] !== undefined) {
            record.counts[kw] += 1;
          } else {
            record.counts['Others'] += 1;
          }
        });
      });

    return Array.from(branchMap.values())
      .sort((a, b) => b.totalNeg - a.totalNeg)
      .slice(0, 10);
  }, [visits]);

  // 3. Feedback Inbox List (Filtered by main top filters: Date & Branches)
  const inboxList = useMemo(() => {
    return visits
      .filter(v => v.sentiment === 'negative' && (v.negativeFeedback !== null || v.keywords.length > 0))
      .sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime());
  }, [visits]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(inboxList.length / itemsPerPage));
  const paginatedInbox = inboxList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 pt-6">
      {/* 2 Tiles: Negative Selections & Feedback Received */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Negative Selections (Ng) */}
        <KpiCard
          label="NEGATIVE SELECTIONS"
          value={formatNumber(metrics.ng)}
          changeChip={formatCountChange(
            metrics.ng,
            prevMetrics ? prevMetrics.ng : null,
            periodLabel
          )}
          contextLine={`${formatPct(
            metrics.sel === 0 ? 0 : (metrics.ng / metrics.sel) * 100
          )} of sentiment selections`}
          formulaTooltip="Visits where customer chose Negative sentiment."
          icon={<Frown className="w-4 h-4 text-rose-600" />}
          iconBgColor="bg-rose-100 text-rose-600"
        />

        {/* 2. Feedback Received (Fb) */}
        <KpiCard
          label="FEEDBACK RECEIVED"
          value={formatNumber(metrics.fb)}
          changeChip={formatCountChange(
            metrics.fb,
            prevMetrics ? prevMetrics.fb : null,
            periodLabel
          )}
          contextLine={`Feedback Rate ${formatPct(metrics.feedbackRate)}`}
          formulaTooltip="Negative visits where negative customer feedback form was submitted (Fb ÷ Ng)."
          icon={<Inbox className="w-4 h-4 text-indigo-600" />}
          iconBgColor="bg-indigo-100 text-indigo-600"
        />
      </div>

      {/* 2-Column: Top Issues Ranked & Matrix by Branch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Issues Ranked List */}
        <div className="bg-white rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Top Negative Issues
              </h3>
              <p className="text-xs text-slate-500">
                Ranked breakdown of complaint categories submitted
              </p>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded">
              {metrics.fb} submissions
            </span>
          </div>

          <div className="mt-4 space-y-3.5">
            {topIssues.map(issue => (
              <div key={issue.keyword} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{issue.keyword}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-bold text-slate-900">{issue.count}</span>
                    <span className="text-rose-600 font-semibold">({issue.pct}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(3, issue.pct))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issues by Branch Table (Top 10 Branches) */}
        <div className="bg-white rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Issues by Branch (Top 10 Branches)
                </h3>
                <p className="text-xs text-slate-500">
                  Branches with highest negative feedback volume
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                    <th className="pb-2">Branch</th>
                    <th className="pb-2 text-center">Wait</th>
                    <th className="pb-2 text-center">Staff</th>
                    <th className="pb-2 text-center">Int/EMI</th>
                    <th className="pb-2 text-center">Docs</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {branchIssuesData.map(st => (
                    <tr key={st.branchName} className="hover:bg-slate-50/60">
                      <td className="py-2 font-semibold text-slate-800 max-w-[140px] truncate">
                        {st.branchName}
                      </td>
                      <td className="py-2 text-center font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            st.counts['Waiting Time'] > 2
                              ? 'bg-rose-100 text-rose-800 font-bold'
                              : 'text-slate-600'
                          }`}
                        >
                          {st.counts['Waiting Time']}
                        </span>
                      </td>
                      <td className="py-2 text-center font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            st.counts['Staff Support'] > 2
                              ? 'bg-rose-100 text-rose-800 font-bold'
                              : 'text-slate-600'
                          }`}
                        >
                          {st.counts['Staff Support']}
                        </span>
                      </td>
                      <td className="py-2 text-center font-mono">
                        <span className="text-slate-600">{st.counts['Interest & EMI']}</span>
                      </td>
                      <td className="py-2 text-center font-mono">
                        <span className="text-slate-600">{st.counts['Process / Documentation']}</span>
                      </td>
                      <td className="py-2 text-right font-mono font-bold text-slate-900">
                        {st.totalNeg}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-400 font-medium">
            🔒 All complaints resolved internally before escalating to Google.
          </div>
        </div>
      </div>

      {/* 3. Negative Feedback Inbox List (Clean without redundant secondary filters) */}
      <div className="bg-white rounded-xl p-6 shadow-xs">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Negative Feedback Inbox
            </h3>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
              {metrics.fb} Submissions
            </span>
          </div>
        </div>

        {/* Feedback List Table */}
        <div className="mt-4 divide-y divide-slate-100">
          {paginatedInbox.length > 0 ? (
            paginatedInbox.map(item => {
              const dateStr = new Date(item.scannedAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              const isRevealed = !!revealedPhones[item.id];

              return (
                <div key={item.id} className="py-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {item.branchName || item.storeName}
                      </span>
                      <span className="text-[11px] text-slate-400">· {item.city}</span>
                      <span className="text-[11px] text-slate-400">· {dateStr} IST</span>
                      <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                        {item.qrSource === 'manager' ? 'Manager QR' : 'Branch QR'}
                      </span>
                    </div>

                    {/* Customer contact pill */}
                    <div className="flex items-center gap-3 text-xs">
                      {item.contactName ? (
                        <span className="flex items-center gap-1 text-slate-700 font-semibold">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {item.contactName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Anonymous</span>
                      )}

                      {item.phoneNumber && (
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] text-slate-800">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>
                            {isRevealed ? item.phoneNumber : maskPhone(item.phoneNumber)}
                          </span>
                          <button
                            onClick={() => togglePhoneReveal(item.id)}
                            className="text-slate-400 hover:text-slate-700 transition-colors"
                            title={isRevealed ? 'Hide phone' : 'Reveal phone'}
                          >
                            {isRevealed ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Keywords Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.keywords.map(kw => (
                      <span
                        key={kw}
                        className="text-[11px] font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-100"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  {/* Complaint Text */}
                  <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                    {item.negativeFeedback || 'Customer selected negative rating without additional comment.'}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              No negative feedback found for this period
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, inboxList.length)} of{' '}
              {inboxList.length} submissions
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 rounded border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
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
