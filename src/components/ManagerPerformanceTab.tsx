import React, { useState, useMemo } from 'react';
import { Visit, BranchInfo, ComparisonMode } from '../types';
import {
  computeMetrics,
  formatNumber,
  formatPct,
} from '../metrics';
import { ManagerDetailDrawer } from './ManagerDetailDrawer';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  User,
  QrCode,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ManagerPerformanceTabProps {
  stores?: BranchInfo[];
  branches?: BranchInfo[];
  currentVisits: Visit[];
  prevVisits: Visit[];
  comparisonMode?: ComparisonMode;
}

type SortField =
  | 'managerName'
  | 'name'
  | 's'
  | 'selectionRate'
  | 'positiveSentimentRate'
  | 'g'
  | 'r'
  | 'conversionRate'
  | 'fb'
  | 'avgSecs'
  | 'diffPts';

export const ManagerPerformanceTab: React.FC<ManagerPerformanceTabProps> = ({
  stores,
  branches,
  currentVisits,
  prevVisits,
}) => {
  const branchList = branches || stores || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'top' | 'low'>('all');
  const [sortField, setSortField] = useState<SortField>('conversionRate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState<BranchInfo | null>(null);

  // Compute metrics per branch manager using ONLY the Manager's personal QR code scans (qrSource === 'manager')
  // Store/Branch QR is separate from Branch Manager QR, so numbers are completely distinct!
  const managerRows = useMemo(() => {
    // 1. Group current and previous visits by branch for manager QR scans
    const currMap = new Map<string, Visit[]>();
    const prevMap = new Map<string, Visit[]>();

    branchList.forEach(b => {
      currMap.set(b.name, []);
      prevMap.set(b.name, []);
    });

    currentVisits.forEach(v => {
      if (v.qrSource === 'manager' && currMap.has(v.branchName)) {
        currMap.get(v.branchName)!.push(v);
      }
    });

    prevVisits.forEach(v => {
      if (v.qrSource === 'manager' && prevMap.has(v.branchName)) {
        prevMap.get(v.branchName)!.push(v);
      }
    });

    // 2. Build rows with manager QR metrics
    const rows = branchList.map(branch => {
      const cVis = currMap.get(branch.name) || [];
      const pVis = prevMap.get(branch.name) || [];

      const currM = computeMetrics(cVis);
      const prevM = prevVisits.length > 0 ? computeMetrics(pVis) : null;

      const diffPts =
        prevM !== null
          ? Math.round((currM.conversionRate - prevM.conversionRate) * 10) / 10
          : null;

      const allSecs = cVis
        .map(v => v.secsScanToAction)
        .filter((s): s is number => s !== null && s > 0);
      const avgSecs =
        allSecs.length === 0
          ? 0
          : Math.round(allSecs.reduce((a, b) => a + b, 0) / allSecs.length);

      return {
        branch,
        managerName: branch.managerName,
        name: branch.name,
        city: branch.city,
        state: branch.state,
        s: currM.s,
        sel: currM.sel,
        p: currM.p,
        ng: currM.ng,
        g: currM.g,
        r: currM.r,
        fb: currM.fb,
        selectionRate: currM.selectionRate,
        positiveSentimentRate: currM.positiveSentimentRate,
        proceedRate: currM.proceedRate,
        conversionRate: currM.conversionRate,
        avgSecs,
        diffPts,
      };
    });

    // 3. Determine top 25% and bottom 25% thresholds by manager conversion rate
    const sortedByConv = [...rows].sort((a, b) => b.conversionRate - a.conversionRate);
    const topThresholdIndex = Math.floor(rows.length * 0.25);
    const lowThresholdIndex = Math.floor(rows.length * 0.75);

    const topCutoff = sortedByConv[topThresholdIndex]?.conversionRate ?? 65;
    const lowCutoff = sortedByConv[lowThresholdIndex]?.conversionRate ?? 35;

    return rows.map(r => ({
      ...r,
      badge:
        r.conversionRate >= topCutoff
          ? ('TOP' as const)
          : r.conversionRate <= lowCutoff
          ? ('LOW' as const)
          : null,
    }));
  }, [branchList, currentVisits, prevVisits]);

  // Filtering
  const filteredRows = useMemo(() => {
    let list = managerRows;

    if (tierFilter === 'top') {
      list = list.filter(r => r.badge === 'TOP');
    } else if (tierFilter === 'low') {
      list = list.filter(r => r.badge === 'LOW');
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        r =>
          r.managerName.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q)
      );
    }

    // Sorting
    return [...list].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === null || valA === undefined) valA = -9999;
      if (valB === null || valB === undefined) valB = -9999;

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [managerRows, tierFilter, searchTerm, sortField, sortDirection]);

  // Pagination (15 rows per page)
  const itemsPerPage = 15;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Export Manager Performance Table to Excel
  const handleExportTable = () => {
    const dataToExport = filteredRows.map(row => ({
      'Branch Manager': row.managerName,
      'Branch': row.name,
      'City': row.city,
      'State': row.state,
      'Tier Badge': row.badge || 'MID',
      'Manager QR Scans': row.s,
      'Selection Rate': `${row.selectionRate.toFixed(1)}%`,
      'Positive Sentiment': `${row.positiveSentimentRate.toFixed(1)}%`,
      'Proceeded to Google (G)': row.g,
      'Reviews Generated (R)': row.r,
      'Conversion (R ÷ S)': `${row.conversionRate.toFixed(1)}%`,
      'Negative Feedback': row.fb,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Manager Performance');
    XLSX.writeFile(wb, `promanage_manager_performance_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4 pt-6">
      {/* Subheader callout clarifying separate QR tracking */}
      <div className="bg-teal-50/70 border border-teal-100 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-[#14B8C4] shrink-0" />
          <span>
            <strong>Manager QR Performance:</strong> Metrics below reflect customer interactions with each Branch Manager&apos;s separate personal desk QR code.
          </span>
        </div>
        <span className="text-[11px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded shadow-2xs shrink-0">
          Personal QR Tracking
        </span>
      </div>

      {/* Toolbar: Search box, All/Top Managers/Needs Attention segmented filter, Download */}
      <div className="bg-white rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Search box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search manager, branch, city..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#14B8C4]"
          />
        </div>

        {/* Right: Segmented filter All/Top Managers/Needs Attention + Download button */}
        <div className="flex items-center gap-3">
          {/* Segmented Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-bold text-slate-600">
            <button
              onClick={() => {
                setTierFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                tierFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              All ({managerRows.length})
            </button>
            <button
              onClick={() => {
                setTierFilter('top');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                tierFilter === 'top'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Top Managers
            </button>
            <button
              onClick={() => {
                setTierFilter('low');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                tierFilter === 'low'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Needs Attention
            </button>
          </div>

          {/* Download Button */}
          <button
            onClick={handleExportTable}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            title="Download manager performance table as Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Table</span>
          </button>
        </div>
      </div>

      {/* Full-width Sortable Table with Branch Manager as First Column */}
      <div className="bg-white rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
            <thead className="bg-slate-50 text-slate-500 font-bold tracking-wider text-[11px] uppercase border-b border-slate-200 sticky top-0 z-10 select-none">
              <tr>
                {/* 1. Branch Manager Column */}
                <th
                  onClick={() => handleSort('managerName')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 min-w-[170px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Branch Manager</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 2. Branch Name + City */}
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 min-w-[180px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Branch</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 3. Manager QR Scans */}
                <th
                  onClick={() => handleSort('s')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Manager QR Scans</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 4. Selection Rate */}
                <th
                  onClick={() => handleSort('selectionRate')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Selection</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 5. Positive Sentiment */}
                <th
                  onClick={() => handleSort('positiveSentimentRate')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Positive</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 6. Proceeded to Google (G) */}
                <th
                  onClick={() => handleSort('g')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Proceeded</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 7. Reviews Generated (R) */}
                <th
                  onClick={() => handleSort('r')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Reviews</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 8. Conversion Rate (R ÷ S) */}
                <th
                  onClick={() => handleSort('conversionRate')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 min-w-[150px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Conversion (R ÷ S)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 9. Negative Feedback */}
                <th
                  onClick={() => handleSort('fb')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Negative Feedback</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length > 0 ? (
                paginatedRows.map(row => (
                  <tr
                    key={row.name}
                    onClick={() => setSelectedBranch(row.branch)}
                    className="hover:bg-teal-50/40 cursor-pointer transition-colors"
                  >
                    {/* 1. Branch Manager with TOP/LOW Badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-teal-50 text-[#0F949F] flex items-center justify-center font-bold text-xs shrink-0 border border-teal-100/80">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 truncate">
                              {row.managerName}
                            </span>
                            {row.badge === 'TOP' && (
                              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase shrink-0">
                                TOP
                              </span>
                            )}
                            {row.badge === 'LOW' && (
                              <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded uppercase shrink-0">
                                LOW
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            Branch Manager
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Branch Name + City */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 max-w-[170px] truncate">
                        {row.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {row.city}, {row.state}
                      </div>
                    </td>

                    {/* 3. Manager QR Scans */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                      {formatNumber(row.s)}
                    </td>

                    {/* 4. Selection Rate */}
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatPct(row.selectionRate)}
                    </td>

                    {/* 5. Positive Sentiment */}
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatPct(row.positiveSentimentRate)}
                    </td>

                    {/* 6. Proceeded to Google */}
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatNumber(row.g)}
                    </td>

                    {/* 7. Reviews Generated (R) */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      {formatNumber(row.r)}
                    </td>

                    {/* 8. Conversion with inline mini bar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 w-12 text-right">
                          {formatPct(row.conversionRate)}
                        </span>
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.conversionRate >= 60
                                ? 'bg-emerald-500'
                                : row.conversionRate >= 35
                                ? 'bg-[#14B8C4]'
                                : 'bg-rose-500'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(3, row.conversionRate))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* 9. Negative Feedback */}
                    <td className="py-3 px-3 text-right font-mono text-rose-600 font-semibold">
                      {formatNumber(row.fb)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    No manager records found matching criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, filteredRows.length)} of{' '}
              {filteredRows.length} managers
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Manager Detail Drawer on row click */}
      {selectedBranch && (
        <ManagerDetailDrawer
          branch={selectedBranch}
          visits={currentVisits}
          onClose={() => setSelectedBranch(null)}
        />
      )}
    </div>
  );
};
