import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { CalculationHistoryItem } from '../../types/imperialCalc';
import {
  ArrowLeft,
  History,
  Trash2,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  Calculator,
  ArrowRight,
  FileSpreadsheet,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

interface TapeItem {
  id: string;
  equation: string;
  resultImperial: string;
  resultMetric: string;
  totalInches: number;
  timestamp: number;
}

interface UnifiedHistoryEntry {
  id: string;
  source: 'keypad' | 'form';
  equation: string;
  operation: string;
  resultImperial: string;
  resultMetric: string;
  totalInches: number;
  decimalFeet: string;
  precision?: number;
  timestamp: number;
}

const STORAGE_KEY_FORM_HISTORY = 'imperial_calc_history_v1';
const STORAGE_KEY_KEYPAD_TAPE = 'keypad_calc_tape_v1';

export const CalculatorHistoryPage: React.FC = () => {
  const { navigate } = useNavigation();

  const [formHistory, setFormHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FORM_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [keypadTape, setKeypadTape] = useState<TapeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_KEYPAD_TAPE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'keypad' | 'form'>('all');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync back if items deleted
  const deleteEntry = (id: string, source: 'keypad' | 'form') => {
    if (source === 'form') {
      const updated = formHistory.filter((i) => i.id !== id);
      setFormHistory(updated);
      localStorage.setItem(STORAGE_KEY_FORM_HISTORY, JSON.stringify(updated));
    } else {
      const updated = keypadTape.filter((i) => i.id !== id);
      setKeypadTape(updated);
      localStorage.setItem(STORAGE_KEY_KEYPAD_TAPE, JSON.stringify(updated));
    }
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all calculation history from both calculators?')) {
      setFormHistory([]);
      setKeypadTape([]);
      localStorage.removeItem(STORAGE_KEY_FORM_HISTORY);
      localStorage.removeItem(STORAGE_KEY_KEYPAD_TAPE);
    }
  };

  // Merge into unified list
  const unifiedEntries: UnifiedHistoryEntry[] = useMemo(() => {
    const list: UnifiedHistoryEntry[] = [];

    // Form entries
    formHistory.forEach((f) => {
      const inchesNum = parseFloat(f.resultInches) || 0;
      const meters = inchesNum * 0.0254;
      const cm = inchesNum * 2.54;
      const mm = inchesNum * 25.4;

      list.push({
        id: f.id,
        source: 'form',
        equation: f.equation || `${f.operation} calculation`,
        operation: f.operation,
        resultImperial: f.resultImperial,
        resultMetric: `${meters.toFixed(3)} m (${cm.toFixed(1)} cm | ${mm.toFixed(0)} mm)`,
        totalInches: inchesNum,
        decimalFeet: (inchesNum / 12).toFixed(4) + ' ft',
        precision: f.precision || 16,
        timestamp: f.timestamp,
      });
    });

    // Keypad entries
    keypadTape.forEach((k) => {
      let op = '+';
      if (k.equation.includes(' - ')) op = '-';
      else if (k.equation.includes(' × ')) op = '*';
      else if (k.equation.includes(' ÷ ')) op = '/';

      const inchesNum = k.totalInches || 0;
      const meters = inchesNum * 0.0254;
      const cm = inchesNum * 2.54;
      const mm = inchesNum * 25.4;

      list.push({
        id: k.id,
        source: 'keypad',
        equation: k.equation,
        operation: op,
        resultImperial: k.resultImperial,
        resultMetric: `${meters.toFixed(3)} m (${cm.toFixed(1)} cm | ${mm.toFixed(0)} mm)`,
        totalInches: inchesNum,
        decimalFeet: (inchesNum / 12).toFixed(4) + ' ft',
        timestamp: k.timestamp,
      });
    });

    // Sort newest first
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list;
  }, [formHistory, keypadTape]);

  // Filtered list
  const filteredEntries = useMemo(() => {
    return unifiedEntries.filter((entry) => {
      if (activeTab === 'keypad' && entry.source !== 'keypad') return false;
      if (activeTab === 'form' && entry.source !== 'form') return false;

      if (operatorFilter !== 'all') {
        if (operatorFilter === '+' && entry.operation !== '+') return false;
        if (operatorFilter === '-' && entry.operation !== '-') return false;
        if (operatorFilter === '*' && entry.operation !== '*') return false;
        if (operatorFilter === '/' && entry.operation !== '/') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesEq = entry.equation.toLowerCase().includes(q);
        const matchesImp = entry.resultImperial.toLowerCase().includes(q);
        const matchesMet = entry.resultMetric.toLowerCase().includes(q);
        if (!matchesEq && !matchesImp && !matchesMet) return false;
      }

      return true;
    });
  }, [unifiedEntries, activeTab, operatorFilter, searchQuery]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  // Export CSV
  const exportCSV = () => {
    if (unifiedEntries.length === 0) return;
    const rows = [
      ['Timestamp', 'Date/Time', 'Calculator Source', 'Equation', 'Imperial Result', 'Total Inches', 'Decimal Feet', 'Metric Result'],
    ];

    unifiedEntries.forEach((item) => {
      rows.push([
        String(item.timestamp),
        new Date(item.timestamp).toLocaleString(),
        item.source === 'keypad' ? 'Construction Keypad' : 'Form Calculator',
        `"${item.equation.replace(/"/g, '""')}"`,
        `"${item.resultImperial.replace(/"/g, '""')}"`,
        item.totalInches.toFixed(4),
        item.decimalFeet,
        `"${item.resultMetric.replace(/"/g, '""')}"`,
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `calculation_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export TXT Roll Tape
  const exportTXT = () => {
    if (unifiedEntries.length === 0) return;
    let txt = `=================================================\n`;
    txt += `       CONSTRUCTION MASTER CALCULATION TAPE      \n`;
    txt += `          Exported: ${new Date().toLocaleString()} \n`;
    txt += `=================================================\n\n`;

    unifiedEntries.forEach((item, idx) => {
      txt += `[#${idx + 1}] ${new Date(item.timestamp).toLocaleTimeString()} (${item.source.toUpperCase()})\n`;
      txt += `  EQ:   ${item.equation}\n`;
      txt += `  IMP:  ${item.resultImperial} (${item.totalInches.toFixed(3)}" | ${item.decimalFeet})\n`;
      txt += `  MET:  ${item.resultMetric}\n`;
      txt += `-------------------------------------------------\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calculation_tape_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
      {/* Top Nav & Breadcrumb */}
      <nav className="flex flex-wrap items-center justify-end gap-3">
        {/* Quick Launch Switchers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('apps-imperial-calculator')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>📏 Form Calculator</span>
          </button>
          <button
            onClick={() => navigate('apps-keypad-calculator')}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>📱 Keypad Calculator</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Calculation History Log
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete audit roll of previous equations, measurements, and conversions
                </p>
              </div>
            </div>
          </div>

          {/* Export & Clear Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={unifiedEntries.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              title="Download CSV spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={exportTXT}
              disabled={unifiedEntries.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              title="Download text roll tape"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Tape.txt</span>
            </button>
            {unifiedEntries.length > 0 && (
              <button
                onClick={clearAll}
                className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equations, values, fractions..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tabs: All, Keypad, Form */}
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({unifiedEntries.length})
              </button>
              <button
                onClick={() => setActiveTab('keypad')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'keypad'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📱 Keypad ({keypadTape.length})
              </button>
              <button
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📏 Form ({formHistory.length})
              </button>
            </div>

            {/* Operator filter */}
            <select
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Operations (+, −, ×, ÷)</option>
              <option value="+">+ Addition</option>
              <option value="-">− Subtraction</option>
              <option value="*">× Multiplication</option>
              <option value="/">÷ Division</option>
            </select>
          </div>
        </div>

        {/* History Cards List */}
        <div className="space-y-3">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left Side: Equation & Measurement */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.source === 'keypad'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {item.source === 'keypad' ? '📱 Keypad Tape' : '📏 Form Calc'}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                    {item.precision && (
                      <span className="text-[10px] text-slate-400">
                        1/{item.precision}" tol
                      </span>
                    )}
                  </div>

                  {/* Large Equation */}
                  <div className="font-mono text-base sm:text-lg font-bold text-sky-400 tracking-wide select-all">
                    {item.equation}
                  </div>

                  {/* Converted Metric & Total Inches Sub-line */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 pt-1">
                    <span className="text-emerald-400 font-semibold">{item.resultMetric}</span>
                    <span>&bull;</span>
                    <span>{item.totalInches.toFixed(3)} in</span>
                    <span>&bull;</span>
                    <span>{item.decimalFeet}</span>
                  </div>
                </div>

                {/* Right Side: Primary Result Display & Quick Copy */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Result
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight select-all">
                      {item.resultImperial}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyToClipboard(item.resultImperial, item.id)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Copy imperial result"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteEntry(item.id, item.source)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/80 hover:text-rose-400 border border-slate-800 text-slate-500 transition cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Calculation History Found</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                {searchQuery || operatorFilter !== 'all' || activeTab !== 'all'
                  ? 'No calculations match your current search query or filter.'
                  : 'Perform calculations using either the Construction Keypad or Form Calculator to start logging history.'}
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => navigate('apps-keypad-calculator')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition shadow-md"
                >
                  Open Keypad Calculator
                </button>
                <button
                  onClick={() => navigate('apps-imperial-calculator')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition"
                >
                  Open Form Calculator
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
