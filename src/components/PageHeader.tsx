import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Download,
  Search,
  Check,
  Building2,
} from 'lucide-react';
import { BranchInfo, DateRangePreset, ComparisonMode } from '../types';

interface PageHeaderProps {
  totalOutletsCount?: number;
  totalBranchesCount?: number;
  stores?: BranchInfo[];
  branches?: BranchInfo[];
  selectedStores?: string[];
  selectedBranches?: string[];
  onSelectStores?: (stores: string[]) => void;
  onSelectBranches?: (branches: string[]) => void;
  storeScanCounts?: Record<string, number>;
  branchScanCounts?: Record<string, number>;
  datePreset: DateRangePreset;
  onSelectDatePreset: (preset: DateRangePreset) => void;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onCustomDateChange: (start: string, end: string) => void;
  comparisonMode: ComparisonMode;
  onToggleComparisonMode: (mode: ComparisonMode) => void;
  onDownload: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  totalOutletsCount,
  totalBranchesCount,
  stores,
  branches,
  selectedStores,
  selectedBranches,
  onSelectStores,
  onSelectBranches,
  storeScanCounts,
  branchScanCounts,
  datePreset,
  onSelectDatePreset,
  startDate,
  endDate,
  onCustomDateChange,
  comparisonMode,
  onToggleComparisonMode,
  onDownload,
}) => {
  const branchList = branches || stores || [];
  const selectedList = selectedBranches || selectedStores || [];
  const handleSelect = onSelectBranches || onSelectStores || (() => {});
  const scanCounts = branchScanCounts || storeScanCounts || {};
  const totalCount = totalBranchesCount || totalOutletsCount || branchList.length;

  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState('');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  const branchRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (branchRef.current && !branchRef.current.contains(e.target as Node)) {
        setBranchDropdownOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDateDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBranches = branchList.filter(b =>
    b.name.toLowerCase().includes(branchSearch.toLowerCase()) ||
    b.city.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const isAllSelected = selectedList.length === branchList.length;

  const handleToggleBranch = (branchName: string) => {
    if (selectedList.includes(branchName)) {
      if (selectedList.length === 1) return; // keep at least one
      handleSelect(selectedList.filter(s => s !== branchName));
    } else {
      handleSelect([...selectedList, branchName]);
    }
  };

  const handleSelectAll = () => {
    handleSelect(branchList.map(b => b.name));
  };

  const handleClear = () => {
    if (branchList.length > 0) {
      handleSelect([branchList[0].name]);
    }
  };

  const formatDateDisplay = (isoStr: string) => {
    const [y, m, d] = isoStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-black text-[#111827] tracking-tight">
          Review Funnel Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Centralized performance tracking across all {totalCount} branches
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Branch Multi-Select Filter */}
        <div className="relative" ref={branchRef}>
          <button
            onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
            className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-xs text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200/60 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-[#14B8C4]" />
            <span className="max-w-[150px] truncate">
              {isAllSelected
                ? `All Branches (${branchList.length})`
                : selectedList.length === 1
                ? selectedList[0]
                : `${selectedList.length} Branches`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {branchDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50">
              {/* Search input */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search branches or cities..."
                  value={branchSearch}
                  onChange={e => setBranchSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#14B8C4]"
                />
              </div>

              {/* Select all / Clear */}
              <div className="flex items-center justify-between px-2 py-1 text-[11px] border-b border-slate-100 mb-1">
                <button
                  onClick={handleSelectAll}
                  className="text-[#14B8C4] hover:underline font-bold"
                >
                  Select all ({branchList.length})
                </button>
                <button
                  onClick={handleClear}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              </div>

              {/* Branch list with checkboxes and scan counts */}
              <div className="max-h-56 overflow-y-auto space-y-0.5 text-xs">
                {filteredBranches.map(branch => {
                  const isChecked = selectedList.includes(branch.name);
                  const scanCount = scanCounts[branch.name] || 0;
                  return (
                    <label
                      key={branch.name}
                      className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-slate-700"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isChecked
                              ? 'bg-[#14B8C4] border-[#14B8C4] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{branch.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono pl-2 shrink-0">
                        {scanCount} scans
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleBranch(branch.name)}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Date Range Picker */}
        <div className="relative" ref={dateRef}>
          <button
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-xs text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200/60 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {formatDateDisplay(startDate)} – {formatDateDisplay(endDate)}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dateDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-50 text-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Date Range Presets
              </p>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {[
                  { label: 'This month', preset: 'this_month' as DateRangePreset },
                  { label: 'Last month', preset: 'last_month' as DateRangePreset },
                  { label: 'Last 7 days', preset: 'last_7_days' as DateRangePreset },
                  { label: 'Last 30 days', preset: 'last_30_days' as DateRangePreset },
                  { label: 'Last 90 days', preset: 'last_90_days' as DateRangePreset },
                  { label: 'Custom', preset: 'custom' as DateRangePreset },
                ].map(item => (
                  <button
                    key={item.preset}
                    onClick={() => {
                      onSelectDatePreset(item.preset);
                      if (item.preset !== 'custom') {
                        setDateDropdownOpen(false);
                      }
                    }}
                    className={`px-2 py-1.5 rounded text-left font-medium transition-colors ${
                      datePreset === item.preset
                        ? 'bg-[#14B8C4]/15 text-[#0F949F] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Inputs */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={tempStart}
                    onChange={e => setTempStart(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={tempEnd}
                    onChange={e => setTempEnd(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                  />
                </div>
                <button
                  onClick={() => {
                    onCustomDateChange(tempStart, tempEnd);
                    setDateDropdownOpen(false);
                  }}
                  className="w-full mt-1 bg-[#14B8C4] text-white py-1.5 rounded font-bold hover:bg-[#0fa3ae] transition-colors"
                >
                  Apply Dates
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Comparison Toggle (M-o-M / Y-o-Y) */}
        <div className="flex items-center bg-white border border-slate-200/60 rounded-lg p-0.5 shadow-xs">
          <button
            onClick={() => onToggleComparisonMode('MoM')}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-all ${
              comparisonMode === 'MoM'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Month-over-Month comparison"
          >
            M-o-M
          </button>
          <button
            onClick={() => onToggleComparisonMode('YoY')}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-all ${
              comparisonMode === 'YoY'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Year-over-Year comparison"
          >
            Y-o-Y
          </button>
        </div>

        {/* Download Button */}
        <button
          onClick={onDownload}
          className="flex items-center gap-2 bg-[#14B8C4] hover:bg-[#0fa3ae] text-white px-3.5 py-2 rounded-lg shadow-xs text-xs font-bold transition-all"
          title="Download Excel report for current filters"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
