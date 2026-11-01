import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { FractionPrecision, ResultUnitMode, CalculationHistoryItem } from '../../types/imperialCalc';
import { sound } from '../../utils/soundEngine';
import {
  ArrowLeft,
  Delete,
  RotateCcw,
  Copy,
  Check,
  History,
  ArrowLeftRight,
  Sliders,
  ExternalLink,
  Volume2,
  VolumeX,
  Sparkles,
  Trash2,
  Clock,
  Calculator,
} from 'lucide-react';

interface TapeItem {
  id: string;
  equation: string;
  resultImperial: string;
  resultMetric: string;
  totalInches: number;
  precision?: number;
  timestamp: number;
}

export const KeypadImperialCalculatorApp: React.FC = () => {
  const { navigate } = useNavigation();

  // Mode & Display
  const [currentBuffer, setCurrentBuffer] = useState<string>('0');
  const [currentFeet, setCurrentFeet] = useState<number | null>(null);
  const [currentInches, setCurrentInches] = useState<number | null>(null);
  const [currentFractionStr, setCurrentFractionStr] = useState<string | null>(null);

  // Stored pending operation
  const [storedInches, setStoredInches] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<'+' | '-' | '*' | '/' | null>(null);
  const [equationSummary, setEquationSummary] = useState<string>('');

  // Settings
  const [precision, setPrecision] = useState<FractionPrecision>(16);
  const [unitMode, setUnitMode] = useState<ResultUnitMode>('imperial');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [historyTab, setHistoryTab] = useState<'tape' | 'all'>('tape');

  // Keypad History Tape
  const [tape, setTape] = useState<TapeItem[]>(() => {
    try {
      const saved = localStorage.getItem('keypad_calc_tape_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Also read Form History so user can toggle or see all in sidebar
  const [formHistory, setFormHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('imperial_calc_history_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('keypad_calc_tape_v1', JSON.stringify(tape));
  }, [tape]);

  // Audio trigger
  const playClick = () => {
    if (soundEnabled) {
      sound.playCardClick();
    }
  };

  // Convert decimal inches to 1'-2"1/2 format
  const formatImperial = (totalInches: number, denom: FractionPrecision = precision): string => {
    const isNeg = totalInches < 0;
    const absVal = Math.abs(totalInches);

    let feet = Math.floor(absVal / 12);
    let remaining = absVal - feet * 12;

    let inchesInt = Math.floor(remaining);
    let fracDec = remaining - inchesInt;

    let fracUnits = Math.round(fracDec * denom);
    if (fracUnits === denom) {
      fracUnits = 0;
      inchesInt += 1;
      if (inchesInt === 12) {
        inchesInt = 0;
        feet += 1;
      }
    }

    let fracStr = '';
    if (fracUnits > 0) {
      let num = fracUnits;
      let d = denom;
      while (num % 2 === 0 && d % 2 === 0) {
        num /= 2;
        d /= 2;
      }
      fracStr = `${num}/${d}`;
    }

    const sign = isNeg ? '-' : '';
    return `${sign}${feet}'-${inchesInt}"${fracStr}`;
  };

  // Metric conversion
  const formatMetric = (totalInches: number) => {
    const meters = totalInches * 0.0254;
    const cm = totalInches * 2.54;
    const mm = totalInches * 25.4;
    return {
      m: `${meters.toFixed(3)} m`,
      cm: `${cm.toFixed(1)} cm`,
      mm: `${mm.toFixed(1)} mm`,
    };
  };

  // Calculate current value in total inches
  const getCurrentValueInches = (): number => {
    let inches = 0;
    if (currentFeet !== null) {
      inches += currentFeet * 12;
    }
    if (currentInches !== null) {
      inches += currentInches;
    }
    if (currentFractionStr !== null && currentFractionStr.includes('/')) {
      const [n, d] = currentFractionStr.split('/').map(Number);
      if (d) inches += n / d;
    }

    // If no dimension was assigned yet, parse current buffer as plain inches or feet
    if (currentFeet === null && currentInches === null && currentFractionStr === null) {
      const parsed = parseFloat(currentBuffer);
      return isNaN(parsed) ? 0 : parsed;
    }

    return inches;
  };

  // Handle number digits
  const handleDigit = (digit: string) => {
    playClick();
    setCurrentBuffer((prev) => {
      if (prev === '0' || prev === 'Error') return digit;
      return prev + digit;
    });
  };

  // Handle dot
  const handleDot = () => {
    playClick();
    setCurrentBuffer((prev) => {
      if (prev.includes('.')) return prev;
      return prev + '.';
    });
  };

  // Handle FEET button
  const handleFeetCommit = () => {
    playClick();
    const val = parseFloat(currentBuffer);
    if (!isNaN(val)) {
      setCurrentFeet(val);
      setCurrentBuffer('0');
    }
  };

  // Handle INCH button
  const handleInchCommit = () => {
    playClick();
    const val = parseFloat(currentBuffer);
    if (!isNaN(val)) {
      setCurrentInches(val);
      setCurrentBuffer('0');
    }
  };

  // Handle Fraction button
  const handleFractionCommit = (fractionNumeratorDenominator?: string) => {
    playClick();
    if (fractionNumeratorDenominator) {
      setCurrentFractionStr(fractionNumeratorDenominator);
      return;
    }

    // If user typed e.g. "3" and pressed "/"
    if (currentBuffer && !currentBuffer.includes('/')) {
      setCurrentBuffer((prev) => (prev === '0' ? '1/' : prev + '/'));
    }
  };

  // Handle Operator (+, -, *, /)
  const handleOperator = (op: '+' | '-' | '*' | '/') => {
    playClick();

    // Check if there is fraction in buffer
    if (currentBuffer.includes('/')) {
      const [n, d] = currentBuffer.split('/').map(Number);
      if (d) {
        setCurrentFractionStr(`${n}/${d}`);
      }
    }

    const currentVal = getCurrentValueInches();
    const displayRepr = buildCurrentFormattedMeasurement();

    if (storedInches !== null && pendingOp) {
      // Chain evaluate
      const evaluated = evaluateOperation(storedInches, currentVal, pendingOp);
      setStoredInches(evaluated);
      setEquationSummary(`${formatImperial(evaluated)} ${op === '*' ? '×' : op === '/' ? '÷' : op} `);
    } else {
      setStoredInches(currentVal);
      setEquationSummary(`${displayRepr} ${op === '*' ? '×' : op === '/' ? '÷' : op} `);
    }

    setPendingOp(op);
    resetCurrentInputs();
  };

  // Evaluate
  const evaluateOperation = (val1: number, val2: number, op: '+' | '-' | '*' | '/'): number => {
    switch (op) {
      case '+':
        return val1 + val2;
      case '-':
        return val1 - val2;
      case '*':
        // If val2 has no imperial unit, it acts as scalar
        return val1 * (currentFeet === null && currentInches === null ? val2 : val2 / 12);
      case '/':
        if (val2 === 0) return 0;
        return val1 / (currentFeet === null && currentInches === null ? val2 : val2);
    }
  };

  // Handle Equals (=)
  const handleEquals = () => {
    playClick();
    if (storedInches === null || !pendingOp) return;

    // Check if buffer contains a fraction
    if (currentBuffer.includes('/')) {
      const [n, d] = currentBuffer.split('/').map(Number);
      if (d) {
        setCurrentFractionStr(`${n}/${d}`);
      }
    }

    const currentVal = getCurrentValueInches();
    const rightRepr = buildCurrentFormattedMeasurement();
    const resultInches = evaluateOperation(storedInches, currentVal, pendingOp);

    const leftRepr = formatImperial(storedInches);
    const opSymbol = pendingOp === '*' ? '×' : pendingOp === '/' ? '÷' : pendingOp;
    const fullEq = `${leftRepr} ${opSymbol} ${rightRepr}`;

    const resultImp = formatImperial(resultInches);
    const metric = formatMetric(resultInches);

    setEquationSummary(`${fullEq} =`);

    // Add to tape
    const newTapeItem: TapeItem = {
      id: 'tape-' + Date.now(),
      equation: fullEq,
      resultImperial: resultImp,
      resultMetric: `${metric.m} (${metric.cm})`,
      totalInches: resultInches,
      precision: precision,
      timestamp: Date.now(),
    };
    setTape((prev) => [newTapeItem, ...prev.slice(0, 49)]);

    // Also sync with form history so all pages stay consistent
    try {
      const savedRaw = localStorage.getItem('imperial_calc_history_v1');
      const parsed: CalculationHistoryItem[] = savedRaw ? JSON.parse(savedRaw) : [];
      const formEntry: CalculationHistoryItem = {
        id: newTapeItem.id,
        timestamp: newTapeItem.timestamp,
        operation: (pendingOp || '+') as any,
        valA: { feet: Math.floor(Math.abs(storedInches) / 12), inches: Math.floor(Math.abs(storedInches) % 12), fraction: 0 },
        valB: { feet: Math.floor(Math.abs(currentVal) / 12), inches: Math.floor(Math.abs(currentVal) % 12), fraction: 0 },
        resultImperial: resultImp,
        resultInches: `${resultInches.toFixed(3)}"`,
        resultDecimal: (resultInches / 12).toFixed(4),
        precision: precision,
        unitMode: unitMode,
        equation: fullEq,
      };
      const updated = [formEntry, ...parsed.slice(0, 49)];
      localStorage.setItem('imperial_calc_history_v1', JSON.stringify(updated));
      setFormHistory(updated);
    } catch {}

    // Display result as current value
    setCurrentFeet(Math.floor(Math.abs(resultInches) / 12));
    setCurrentInches(Math.floor(Math.abs(resultInches) % 12));
    const remainder = Math.abs(resultInches) - Math.floor(Math.abs(resultInches));
    const sixteenths = Math.round(remainder * precision);
    if (sixteenths > 0) {
      let num = sixteenths;
      let d = precision;
      while (num % 2 === 0 && d % 2 === 0) {
        num /= 2;
        d /= 2;
      }
      setCurrentFractionStr(`${num}/${d}`);
    } else {
      setCurrentFractionStr(null);
    }

    setCurrentBuffer('0');
    setStoredInches(null);
    setPendingOp(null);
  };

  // Backspace
  const handleBackspace = () => {
    playClick();
    if (currentFractionStr) {
      setCurrentFractionStr(null);
      return;
    }
    if (currentInches !== null) {
      setCurrentInches(null);
      return;
    }
    if (currentFeet !== null) {
      setCurrentFeet(null);
      return;
    }
    setCurrentBuffer((prev) => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  };

  // Clear / All Clear
  const handleClear = () => {
    playClick();
    resetCurrentInputs();
    setStoredInches(null);
    setPendingOp(null);
    setEquationSummary('');
  };

  const resetCurrentInputs = () => {
    setCurrentBuffer('0');
    setCurrentFeet(null);
    setCurrentInches(null);
    setCurrentFractionStr(null);
  };

  // Cycle precision
  const cyclePrecision = () => {
    playClick();
    setPrecision((prev) => {
      if (prev === 16) return 32;
      if (prev === 32) return 64;
      if (prev === 64) return 128;
      return 16;
    });
  };

  // Toggle unit mode
  const toggleUnit = () => {
    playClick();
    setUnitMode((prev) => (prev === 'imperial' ? 'metric' : 'imperial'));
  };

  // Current display builder
  const buildCurrentFormattedMeasurement = (): string => {
    if (currentFeet === null && currentInches === null && currentFractionStr === null) {
      if (currentBuffer.includes('/')) {
        return `0'-0"${currentBuffer}`;
      }
      return currentBuffer;
    }

    const f = currentFeet !== null ? `${currentFeet}'` : `0'`;
    const i = currentInches !== null ? `-${currentInches}"` : `-0"`;
    const fr = currentFractionStr ? `${currentFractionStr}` : '';
    return `${f}${i}${fr}`;
  };

  // Active Total Inches for LCD info bar
  const currentTotalInches = useMemo(() => {
    return getCurrentValueInches();
  }, [currentFeet, currentInches, currentFractionStr, currentBuffer]);

  const currentMetricInfo = useMemo(() => {
    return formatMetric(currentTotalInches);
  }, [currentTotalInches]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleDot();
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('-');
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperator('*');
      } else if (e.key === '/') {
        e.preventDefault();
        handleFractionCommit();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      } else if (e.key === "'") {
        e.preventDefault();
        handleFeetCommit();
      } else if (e.key === '"') {
        e.preventDefault();
        handleInchCommit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const copyResultToClipboard = () => {
    const textToCopy =
      unitMode === 'imperial'
        ? buildCurrentFormattedMeasurement()
        : `${currentMetricInfo.m} (${currentMetricInfo.cm})`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Recall calculation from sidebar into keypad
  const recallCalculation = (totalInches: number, itemPrecision?: number) => {
    playClick();
    const usePrec = (itemPrecision || precision) as FractionPrecision;
    const absVal = Math.abs(totalInches);
    let feet = Math.floor(absVal / 12);
    let remaining = absVal - feet * 12;
    let inchesInt = Math.floor(remaining);
    let fracDec = remaining - inchesInt;

    let fracUnits = Math.round(fracDec * usePrec);
    if (fracUnits === usePrec) {
      fracUnits = 0;
      inchesInt += 1;
      if (inchesInt === 12) {
        inchesInt = 0;
        feet += 1;
      }
    }

    let fracStr: string | null = null;
    if (fracUnits > 0) {
      let num = fracUnits;
      let d = usePrec;
      while (num % 2 === 0 && d % 2 === 0) {
        num /= 2;
        d /= 2;
      }
      fracStr = `${num}/${d}`;
    }

    setCurrentFeet(feet);
    setCurrentInches(inchesInt);
    setCurrentFractionStr(fracStr);
    setCurrentBuffer('0');
    setStoredInches(null);
    setPendingOp(null);
    setEquationSummary(`Recalled ${formatImperial(totalInches, usePrec)}`);

    const keypadEl = document.getElementById('keypad-calculator');
    if (keypadEl && window.innerWidth < 1024) {
      keypadEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const clearTape = () => {
    if (confirm('Clear calculation history?')) {
      setTape([]);
      localStorage.removeItem('keypad_calc_tape_v1');
    }
  };

  const deleteTapeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTape((prev) => prev.filter((item) => item.id !== id));
  };

  const copyHistoryItem = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Unified or Tape History display list
  const displayHistoryItems = useMemo(() => {
    if (historyTab === 'tape') {
      return tape.map((t) => {
        let op = '+';
        if (t.equation.includes(' - ')) op = '-';
        else if (t.equation.includes(' × ')) op = '×';
        else if (t.equation.includes(' ÷ ')) op = '÷';
        return {
          id: t.id,
          source: 'keypad' as const,
          equation: t.equation,
          operation: op,
          resultImperial: t.resultImperial,
          resultMetric: t.resultMetric,
          totalInches: t.totalInches,
          precision: t.precision,
          timestamp: t.timestamp,
        };
      });
    }

    // All: combine tape and formHistory
    const list: Array<{
      id: string;
      source: 'keypad' | 'form';
      equation: string;
      operation: string;
      resultImperial: string;
      resultMetric: string;
      totalInches: number;
      precision?: number;
      timestamp: number;
    }> = [];

    tape.forEach((t) => {
      let op = '+';
      if (t.equation.includes(' - ')) op = '-';
      else if (t.equation.includes(' × ')) op = '×';
      else if (t.equation.includes(' ÷ ')) op = '÷';
      list.push({
        id: t.id,
        source: 'keypad',
        equation: t.equation,
        operation: op,
        resultImperial: t.resultImperial,
        resultMetric: t.resultMetric,
        totalInches: t.totalInches,
        precision: t.precision,
        timestamp: t.timestamp,
      });
    });

    formHistory.forEach((f) => {
      const inchesNum = parseFloat(f.resultInches) || 0;
      const meters = inchesNum * 0.0254;
      const cm = inchesNum * 2.54;
      list.push({
        id: f.id,
        source: 'form',
        equation: f.equation || `${f.operation} calculation`,
        operation: f.operation,
        resultImperial: f.resultImperial,
        resultMetric: `${meters.toFixed(3)} m (${cm.toFixed(1)} cm)`,
        totalInches: inchesNum,
        precision: f.precision,
        timestamp: f.timestamp,
      });
    });

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [tape, formHistory, historyTab]);

  return (
    <div className="max-w-6xl mx-auto w-full px-3 sm:px-6 py-6 flex-1 flex flex-col gap-5">
      {/* Top Navigation */}
      <nav className="w-full flex items-center justify-end">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('apps-calculator-history')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>📜 Full History</span>
          </button>
          <button
            onClick={() => navigate('apps-imperial-calculator')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Switch to Form View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Main Unified Card: Sidebar on left + Handheld Keypad on right */}
      <div className="w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* History Sidebar */}
        <div
          id="history-sidebar"
          className="lg:col-span-5 bg-slate-900/85 p-5 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-700/80 order-2 lg:order-1"
        >
          <div>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  History Log
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                  {tape.length}
                </span>
              </div>

              {tape.length > 0 && (
                <button
                  onClick={clearTape}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition"
                  title="Clear calculation tape"
                >
                  <Trash2 className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>

            {/* Filter Tabs if Form entries exist */}
            {formHistory.length > 0 && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800 mb-3 text-xs">
                <button
                  onClick={() => setHistoryTab('tape')}
                  className={`flex-1 py-1 px-2 rounded-lg font-semibold transition cursor-pointer text-center text-[11px] ${
                    historyTab === 'tape'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Keypad Tape ({tape.length})
                </button>
                <button
                  onClick={() => setHistoryTab('all')}
                  className={`flex-1 py-1 px-2 rounded-lg font-semibold transition cursor-pointer text-center text-[11px] ${
                    historyTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Logs ({tape.length + formHistory.length})
                </button>
              </div>
            )}

            {/* Scrollable calculation items list */}
            <div className="space-y-2.5 max-h-[520px] lg:max-h-[580px] overflow-y-auto pr-1">
              {displayHistoryItems.length > 0 ? (
                displayHistoryItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => recallCalculation(item.totalInches, item.precision)}
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 hover:border-emerald-500/50 text-xs space-y-1.5 transition group relative cursor-pointer shadow-sm"
                    title="Click to recall this measurement into calculator"
                  >
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                        {item.source === 'form' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-semibold">
                            FORM
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-amber-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono">
                          {item.operation}
                        </span>
                        <button
                          onClick={(e) => copyHistoryItem(item.resultImperial, item.id, e)}
                          className="p-1 text-slate-400 hover:text-white transition"
                          title="Copy result"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => deleteTapeItem(item.id, e)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {item.equation && (
                      <div className="font-mono text-[11px] text-sky-300 font-semibold truncate">
                        {item.equation}
                      </div>
                    )}

                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-white text-base font-mono tracking-tight text-emerald-300">
                        {item.resultImperial}
                      </span>
                      <span className="text-[10px] text-emerald-400/70 font-mono group-hover:text-emerald-300 transition">
                        Tap to Recall ↵
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-0.5 border-t border-slate-700/50">
                      <span>{item.resultMetric}</span>
                      <span className="text-slate-400 font-semibold">
                        {item.totalInches.toFixed(2)}"
                      </span>
                    </div>

                    {item.precision && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        Prec: 1/{item.precision}"
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4 space-y-2 border border-dashed border-slate-800 rounded-2xl">
                  <Calculator className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-semibold">No calculations logged yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Perform calculations using the keypad to log equations and measurements here automatically.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => navigate('apps-calculator-history')}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full History Page & Export</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <p className="text-[11px] text-slate-500 text-center">
              Unique calculations save automatically. Click any entry to recall.
            </p>
          </div>
        </div>

        {/* Calculator Body Column */}
        <div className="lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center order-1 lg:order-2 bg-gradient-to-b from-slate-900/40 to-slate-950/60">
          {/* Main Physical Device Shell */}
          <div id="keypad-calculator" className="w-full max-w-md bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-2 border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl relative select-none">
        {/* Device Brand Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-xs shadow-amber-400/80 animate-pulse" />
            <span className="font-mono text-xs font-black tracking-widest uppercase text-slate-300">
              CONSTRUCTION MASTER PRO
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 text-slate-400 hover:text-white"
              title="Toggle button sound effects"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-slate-400">
              HEAVY-DUTY
            </span>
          </div>
        </div>

        {/* Realistic Digital Glass LCD Screen */}
        <div className="bg-emerald-950/40 border-2 border-emerald-900/60 rounded-2xl p-4 sm:p-5 shadow-inner relative overflow-hidden backdrop-blur-md mb-5">
          {/* Subtle LCD glass shine sheen */}
          <div className="absolute -top-12 -left-12 w-48 h-24 bg-white/5 rotate-12 blur-lg pointer-events-none" />

          {/* Top Line: Mode Badges & Running Equation */}
          <div className="flex items-center justify-between text-xs font-mono mb-2 min-h-[20px]">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase transition ${
                  unitMode === 'imperial'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-emerald-400 text-slate-950'
                }`}
              >
                {unitMode}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900/80 text-emerald-400 border border-emerald-500/30 font-bold">
                1/{precision}"
              </span>
            </div>

            <div className="text-[11px] font-mono text-emerald-300/80 truncate max-w-[180px] text-right">
              {equationSummary || 'READY'}
            </div>
          </div>

          {/* Main Large Display Value */}
          <div className="flex items-baseline justify-between gap-2 my-2">
            <span className="text-xs font-mono font-bold text-emerald-400/60 tracking-wider">
              {unitMode === 'imperial' ? 'DIM' : 'MET'}
            </span>
            <div className="font-mono text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight text-right truncate drop-shadow-md">
              {unitMode === 'imperial'
                ? buildCurrentFormattedMeasurement()
                : `${currentMetricInfo.m}`}
            </div>
          </div>

          {/* LCD Status & Metric Conversion Readout Bar */}
          <div className="pt-2 border-t border-emerald-900/50 flex flex-wrap items-center justify-between text-[11px] font-mono text-emerald-400/80 gap-1">
            <div className="flex items-center gap-2">
              <span>{currentMetricInfo.cm}</span>
              <span>&bull;</span>
              <span>{currentMetricInfo.mm}</span>
            </div>
            <div className="text-slate-400 font-semibold">
              {currentTotalInches.toFixed(3)} in
            </div>
          </div>
        </div>

        {/* Keypad Grid */}
        <div className="space-y-2.5">
          {/* Function Keys Row */}
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={toggleUnit}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-[11px] font-bold text-sky-300 flex flex-col items-center justify-center transition shadow-sm cursor-pointer"
              title="Toggle between Metric and Imperial display"
            >
              <span>M/Imp</span>
            </button>

            <button
              onClick={cyclePrecision}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-[11px] font-mono font-bold text-amber-300 flex flex-col items-center justify-center transition shadow-sm cursor-pointer"
              title="Cycle precision (1/16, 1/32, 1/64, 1/128)"
            >
              <span>1/{precision}</span>
            </button>

            <button
              onClick={() => {
                playClick();
                const el = document.getElementById('history-sidebar');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-[11px] font-bold text-emerald-300 flex flex-col items-center justify-center transition shadow-sm cursor-pointer relative"
              title="Jump to History Sidebar"
            >
              <div className="flex items-center gap-1">
                <History className="w-3.5 h-3.5" />
                <span>Tape</span>
              </div>
              {tape.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-bold flex items-center justify-center">
                  {tape.length > 9 ? '9+' : tape.length}
                </span>
              )}
            </button>

            <button
              onClick={handleBackspace}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition shadow-sm cursor-pointer"
              title="Backspace"
            >
              <Delete className="w-4 h-4" />
            </button>

            <button
              onClick={handleClear}
              className="py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 active:scale-95 border border-rose-800/60 text-xs font-black text-rose-300 flex items-center justify-center transition shadow-sm cursor-pointer"
              title="All Clear"
            >
              AC
            </button>
          </div>

          {/* Dimension Selector Keys Row (FEET, INCH, FRAC) */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handleFeetCommit}
              className="py-3 rounded-xl bg-gradient-to-b from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 active:scale-95 border border-blue-500/50 text-white font-black text-xs sm:text-sm tracking-wider flex items-center justify-center transition shadow-md shadow-blue-500/10 cursor-pointer"
            >
              FEET '
            </button>

            <button
              onClick={handleInchCommit}
              className="py-3 rounded-xl bg-gradient-to-b from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 active:scale-95 border border-blue-500/50 text-white font-black text-xs sm:text-sm tracking-wider flex items-center justify-center transition shadow-md shadow-blue-500/10 cursor-pointer"
            >
              INCH "
            </button>

            <button
              onClick={() => handleFractionCommit()}
              className="py-3 rounded-xl bg-gradient-to-b from-blue-800 to-blue-900 hover:from-blue-700 hover:to-blue-800 active:scale-95 border border-blue-500/40 text-blue-200 font-black text-xs sm:text-sm tracking-wider flex items-center justify-center transition shadow-md cursor-pointer"
            >
              FRAC /
            </button>

            <button
              onClick={() => handleOperator('/')}
              className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-black text-base flex items-center justify-center transition cursor-pointer"
            >
              ÷
            </button>
          </div>

          {/* Quick Fraction Shortcuts (All 16ths: 1/16 to 15/16) */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5 space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 px-1 font-bold">
              <span>Quick 1/16" Fraction Shortcuts</span>
              <span className="text-sky-400">1/16 – 15/16</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                '1/16', '1/8', '3/16', '1/4', '5/16',
                '3/8', '7/16', '1/2', '9/16', '5/8',
                '11/16', '3/4', '13/16', '7/8', '15/16'
              ].map((frac) => (
                <button
                  key={frac}
                  type="button"
                  onClick={() => handleFractionCommit(frac)}
                  className={`py-1.5 px-1 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white border text-[11px] font-mono font-bold transition active:scale-95 cursor-pointer text-center ${
                    currentFractionStr === frac
                      ? 'border-blue-400 bg-blue-600/30 text-blue-300 ring-1 ring-blue-400/50'
                      : 'border-slate-800/80 text-sky-300 hover:border-blue-500'
                  }`}
                  title={`Enter ${frac}"`}
                >
                  {frac}
                </button>
              ))}
            </div>
          </div>

          {/* Main Keypad Row 1: 7, 8, 9, × */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleDigit('7')}
              className="py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-lg shadow-sm transition cursor-pointer"
            >
              7
            </button>
            <button
              onClick={() => handleDigit('8')}
              className="py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-lg shadow-sm transition cursor-pointer"
            >
              8
            </button>
            <button
              onClick={() => handleDigit('9')}
              className="py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-lg shadow-sm transition cursor-pointer"
            >
              9
            </button>
            <button
              onClick={() => handleOperator('*')}
              className="py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-black text-lg transition cursor-pointer"
            >
              ×
            </button>
          </div>

          {/* Main Keypad Row 2: 4, 5, 6, − */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleDigit('4')}
              className="py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-lg shadow-sm transition cursor-pointer"
            >
              4
            </button>
            <button
              onClick={() => handleDigit('5')}
              className="py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-lg shadow-sm transition cursor-pointer"
            >
              5
            </button>
            <button
              onClick={() => handleDigit('6')}
              className="py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-lg shadow-sm transition cursor-pointer"
            >
              6
            </button>
            <button
              onClick={() => handleOperator('-')}
              className="py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-black text-lg transition cursor-pointer"
            >
              −
            </button>
          </div>

          {/* Main Keypad Row 3: 1, 2, 3, + */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleDigit('1')}
              className="py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-lg shadow-sm transition cursor-pointer"
            >
              1
            </button>
            <button
              onClick={() => handleDigit('2')}
              className="py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-lg shadow-sm transition cursor-pointer"
            >
              2
            </button>
            <button
              onClick={() => handleDigit('3')}
              className="py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-lg shadow-sm transition cursor-pointer"
            >
              3
            </button>
            <button
              onClick={() => handleOperator('+')}
              className="py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-black text-lg transition cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Main Keypad Row 4: ±, 0, ., = */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => {
                playClick();
                setCurrentBuffer((prev) => {
                  if (prev.startsWith('-')) return prev.slice(1);
                  return '-' + prev;
                });
              }}
              className="py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-300 font-bold text-sm shadow-sm transition cursor-pointer"
            >
              ±
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-lg shadow-sm transition cursor-pointer"
            >
              0
            </button>
            <button
              onClick={handleDot}
              className="py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-lg shadow-sm transition cursor-pointer"
            >
              .
            </button>
            <button
              onClick={handleEquals}
              className="py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-black text-xl shadow-lg shadow-cyan-500/25 transition cursor-pointer flex items-center justify-center ring-2 ring-cyan-400/30"
            >
              =
            </button>
          </div>
        </div>

        {/* Footer Quick Action Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={copyResultToClipboard}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Result'}</span>
          </button>

          <span className="text-[11px] font-mono text-slate-500">
            Keyboard Shortcuts Active
          </span>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};
