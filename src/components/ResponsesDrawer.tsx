import React, { useState, useMemo } from 'react';
import { Visit } from '../types';
import { formatIST } from '../utils/excelExport';
import {
  X,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';

interface ResponsesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  visits: Visit[];
  storeLabel?: string;
  branchLabel?: string;
  dateRangeLabel: string;
  onDownload: () => void;
}

type ResponseFilter =
  | 'all'
  | 'branch_qr'
  | 'manager_qr'
  | 'positive'
  | 'negative'
  | 'proceeded'
  | 'posted'
  | 'no_action';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const ResponsesDrawer: React.FC<ResponsesDrawerProps> = ({
  isOpen,
  onClose,
  visits,
  storeLabel,
  branchLabel,
  dateRangeLabel,
  onDownload,
}) => {
  if (!isOpen) return null;

  const activeLabel = branchLabel || storeLabel || 'All Branches';

  const [activeFilter, setActiveFilter] = useState<ResponseFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Search
  const filteredVisits = useMemo(() => {
    let list = [...visits];

    // Status filter
    if (activeFilter === 'branch_qr') {
      list = list.filter(v => v.qrSource === 'branch');
    } else if (activeFilter === 'manager_qr') {
      list = list.filter(v => v.qrSource === 'manager');
    } else if (activeFilter === 'positive') {
      list = list.filter(v => v.sentiment === 'positive');
    } else if (activeFilter === 'negative') {
      list = list.filter(v => v.sentiment === 'negative');
    } else if (activeFilter === 'proceeded') {
      list = list.filter(v => v.sentiment === 'positive' && v.proceededToGoogle);
    } else if (activeFilter === 'posted') {
      list = list.filter(v => v.sentiment === 'positive' && v.postedToGoogle);
    } else if (activeFilter === 'no_action') {
      list = list.filter(v => v.sentiment === null);
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        v =>
          (v.branchName || v.storeName).toLowerCase().includes(q) ||
          v.managerName?.toLowerCase().includes(q) ||
          v.positiveReviewText?.toLowerCase().includes(q) ||
          v.negativeFeedback?.toLowerCase().includes(q) ||
          v.contactName?.toLowerCase().includes(q) ||
          v.phoneNumber?.includes(q) ||
          v.keywords.some(k => k.toLowerCase().includes(q))
      );
    }

    // Newest first in Drawer
    return list.sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime());
  }, [visits, activeFilter, searchTerm]);

  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredVisits.length / itemsPerPage));
  const paginated = filteredVisits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-6xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#14B8C4]" />
              <h2 className="text-base font-extrabold text-[#111827]">
                Responses — {activeLabel} · {dateRangeLabel} · {visits.length} scans
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Raw visit-level data records including QR source (Branch vs Manager QR), sentiment, review length, and negative feedback
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#14B8C4] hover:bg-[#0fa3ae] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel (.xlsx)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: `All (${visits.length})` },
              {
                id: 'branch_qr',
                label: `Branch QR (${visits.filter(v => v.qrSource === 'branch').length})`,
              },
              {
                id: 'manager_qr',
                label: `Manager QR (${visits.filter(v => v.qrSource === 'manager').length})`,
              },
              {
                id: 'positive',
                label: `Positive (${visits.filter(v => v.sentiment === 'positive').length})`,
              },
              {
                id: 'negative',
                label: `Negative (${visits.filter(v => v.sentiment === 'negative').length})`,
              },
              {
                id: 'proceeded',
                label: `Proceeded (${
                  visits.filter(v => v.sentiment === 'positive' && v.proceededToGoogle).length
                })`,
              },
              {
                id: 'posted',
                label: `Posted (${
                  visits.filter(v => v.sentiment === 'positive' && v.postedToGoogle).length
                })`,
              },
              {
                id: 'no_action',
                label: `No action (${visits.filter(v => v.sentiment === null).length})`,
              },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFilter(f.id as ResponseFilter);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
                  activeFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200/70'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search raw responses..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#14B8C4]"
            />
          </div>
        </div>

        {/* Raw Data Table with Branch Name and QR Type */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[1440px]">
            <thead className="bg-slate-100 text-slate-600 font-bold tracking-wider text-[11px] uppercase border-b border-slate-200 sticky top-0 z-10 select-none">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Branch Name</th>
                <th className="py-2.5 px-3">QR Source</th>
                <th className="py-2.5 px-3">Scanned (IST)</th>
                <th className="py-2.5 px-2">Month</th>
                <th className="py-2.5 px-2">Day</th>
                <th className="py-2.5 px-3">Action (IST)</th>
                <th className="py-2.5 px-2 text-right">Secs</th>
                <th className="py-2.5 px-3">Sentiment</th>
                <th className="py-2.5 px-2 text-center">Posted</th>
                <th className="py-2.5 px-3 text-right">Review Length</th>
                <th className="py-2.5 px-3">Keywords</th>
                <th className="py-2.5 px-4 min-w-[200px]">Positive Review / Negative Feedback</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {paginated.length > 0 ? (
                paginated.map((v, index) => {
                  const scanDate = new Date(v.scannedAt);
                  const month = MONTH_NAMES[scanDate.getMonth()];
                  const day = scanDate.getDate();
                  const rowNum = (currentPage - 1) * itemsPerPage + index + 1;
                  const reviewCharLength =
                    v.sentiment === 'positive'
                      ? v.positiveReviewText
                        ? v.positiveReviewText.length
                        : 432
                      : null;

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-slate-400">{rowNum}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 truncate max-w-[150px]">
                        {v.branchName || v.storeName}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {v.qrSource === 'manager' ? (
                          <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[10px] border border-teal-100">
                            Manager QR
                          </span>
                        ) : (
                          <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                            Branch QR
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {formatIST(v.scannedAt)}
                      </td>
                      <td className="py-2.5 px-2 text-slate-500 font-sans">{month}</td>
                      <td className="py-2.5 px-2 text-slate-700">{day}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {v.actionAt ? formatIST(v.actionAt) : '—'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-700">
                        {v.secsScanToAction !== null ? `${v.secsScanToAction}s` : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        {v.sentiment === 'positive' ? (
                          <span className="font-sans font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                            POSITIVE
                          </span>
                        ) : v.sentiment === 'negative' ? (
                          <span className="font-sans font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">
                            NEGATIVE
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {v.sentiment !== null ? (
                          v.postedToGoogle ? (
                            <span className="font-bold text-emerald-600">1</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {reviewCharLength !== null ? (
                          <span className="font-bold text-slate-800">
                            {reviewCharLength}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 max-w-[180px] truncate" title={v.keywords.join('; ')}>
                        {v.keywords.length > 0 ? v.keywords.join('; ') : '—'}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-700 max-w-[260px] truncate">
                        {v.sentiment === 'positive'
                          ? v.positiveReviewText || '—'
                          : v.negativeFeedback || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-700 truncate max-w-[110px]">
                        {v.contactName || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {v.phoneNumber || '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400 font-sans font-medium">
                    No visit records found matching criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, filteredVisits.length)} of{' '}
            {filteredVisits.length} raw scans
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
