import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { Operation, CalculationHistoryItem } from '../../types/imperialCalc';
import { ArrowLeft, Calculator, Trash2 } from 'lucide-react';

const FRACTION_OPTIONS = [
  { label: '0', value: 0 },
  { label: '1/16', value: 0.0625 },
  { label: '1/8', value: 0.125 },
  { label: '3/16', value: 0.1875 },
  { label: '1/4', value: 0.25 },
  { label: '5/16', value: 0.3125 },
  { label: '3/8', value: 0.375 },
  { label: '7/16', value: 0.4375 },
  { label: '1/2', value: 0.5 },
  { label: '9/16', value: 0.5625 },
  { label: '5/8', value: 0.625 },
  { label: '11/16', value: 0.6875 },
  { label: '3/4', value: 0.75 },
  { label: '13/16', value: 0.8125 },
  { label: '7/8', value: 0.875 },
  { label: '15/16', value: 0.9375 },
];

const STORAGE_KEY_HISTORY = 'imperial_calc_history_v1';

export const ImperialCalculatorApp: React.FC = () => {
  const { navigate } = useNavigation();

  const [op, setOp] = useState<Operation>('+');

  // Value A
  const [feet1, setFeet1] = useState<number>(0);
  const [inches1, setInches1] = useState<number>(0);
  const [fraction1, setFraction1] = useState<number>(0);

  // Value B (Imperial)
  const [feet2, setFeet2] = useState<number>(0);
  const [inches2, setInches2] = useState<number>(0);
  const [fraction2, setFraction2] = useState<number>(0);

  // Value B (Scalar for * and /)
  const [scalar2, setScalar2] = useState<number>(2);

  // Results
  const [resultImperial, setResultImperial] = useState<string>('-');
  const [resultInches, setResultInches] = useState<string>('-');
  const [resultDecimal, setResultDecimal] = useState<string>('-');

  // History
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  // Convert measurement to total inches
  const toTotalInches = (feet: number, inches: number, fraction: number): number => {
    return feet * 12 + inches + fraction;
  };

  // Convert decimal inches to clean Imperial representation
  const formatImperialFromInches = (totalInches: number): string => {
    const isNegative = totalInches < 0;
    const absInches = Math.abs(totalInches);

    let feet = Math.floor(absInches / 12);
    let remainingInches = absInches - feet * 12;

    let inchesInt = Math.floor(remainingInches);
    let fracDecimal = remainingInches - inchesInt;

    // Round to nearest 1/16
    let sixteenths = Math.round(fracDecimal * 16);
    if (sixteenths === 16) {
      sixteenths = 0;
      inchesInt += 1;
      if (inchesInt === 12) {
        inchesInt = 0;
        feet += 1;
      }
    }

    let fracStr = '';
    if (sixteenths > 0) {
      // Simplify fraction
      let num = sixteenths;
      let den = 16;
      while (num % 2 === 0 && den % 2 === 0) {
        num /= 2;
        den /= 2;
      }
      fracStr = ` ${num}/${den}`;
    }

    const sign = isNegative ? '-' : '';
    return `${sign}${feet}' - ${inchesInt}${fracStr}"`;
  };

  const handleCalculate = () => {
    const valAInches = toTotalInches(feet1, inches1, fraction1);
    let finalInches = 0;

    if (op === '+') {
      const valBInches = toTotalInches(feet2, inches2, fraction2);
      finalInches = valAInches + valBInches;
    } else if (op === '-') {
      const valBInches = toTotalInches(feet2, inches2, fraction2);
      finalInches = valAInches - valBInches;
    } else if (op === '*') {
      finalInches = valAInches * scalar2;
    } else if (op === '/') {
      if (scalar2 === 0) {
        alert('Cannot divide by zero!');
        return;
      }
      finalInches = valAInches / scalar2;
    }

    const imperial = formatImperialFromInches(finalInches);
    const inchesDisplay = `${finalInches.toFixed(3)} in`;
    const decimalFeet = finalInches / 12;
    const meters = finalInches * 0.0254;
    const decimalDisplay = `${decimalFeet.toFixed(4)} ft | ${meters.toFixed(3)} m`;

    setResultImperial(imperial);
    setResultInches(inchesDisplay);
    setResultDecimal(decimalDisplay);

    const historyItem: CalculationHistoryItem = {
      id: 'calc-' + Date.now(),
      timestamp: Date.now(),
      operation: op,
      valA: { feet: feet1, inches: inches1, fraction: fraction1 },
      valB: { feet: feet2, inches: inches2, fraction: fraction2, scalar: scalar2 },
      resultImperial: imperial,
      resultInches: inchesDisplay,
      resultDecimal: decimalDisplay,
    };

    setHistory((prev) => [historyItem, ...prev.slice(0, 49)]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
      <nav>
        <button
          onClick={() => navigate('apps')}
          className="text-slate-400 hover:text-white inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Apps Hub
        </button>
      </nav>

      <div className="w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3">
        {/* History Sidebar */}
        <div className="bg-slate-900/70 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700 order-2 md:order-1">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                History Log
              </h2>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {history.length > 0 ? (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs space-y-1"
                  >
                    <div className="flex justify-between text-slate-400 font-mono text-[10px]">
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      <span className="font-bold text-blue-400">{item.operation}</span>
                    </div>
                    <div className="font-bold text-white text-sm">{item.resultImperial}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.resultInches}</div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-8">
                  No calculations logged yet.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500">Unique calculations save automatically.</p>
          </div>
        </div>

        {/* Calculator Body */}
        <div className="md:col-span-2 p-6 space-y-6 order-1 md:order-2">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 -mx-6 -mt-6 mb-6 text-center rounded-t-2xl md:rounded-tr-none text-white">
            <div className="flex justify-center items-center gap-2 mb-1">
              <Calculator className="w-6 h-6 text-blue-200" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Imperial Calculator</h1>
            </div>
            <p className="text-blue-100 text-xs sm:text-sm">
              Add, Subtract, Multiply & Divide Feet, Inches & Fractions
            </p>
          </div>

          {/* Value A */}
          <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              First Measurement (Value A)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Feet (ft)</label>
                <input
                  type="number"
                  min="0"
                  value={feet1}
                  onChange={(e) => setFeet1(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-white text-center focus:outline-none focus:border-blue-500 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Inches (in)</label>
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={inches1}
                  onChange={(e) => setInches1(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-white text-center focus:outline-none focus:border-blue-500 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Fraction</label>
                <select
                  value={fraction1}
                  onChange={(e) => setFraction1(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                >
                  {FRACTION_OPTIONS.map((f) => (
                    <option key={f.label} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Operation Selector */}
          <div className="flex justify-center items-center gap-3">
            {(['+', '-', '*', '/'] as Operation[]).map((opSymbol) => {
              const isActive = op === opSymbol;
              return (
                <button
                  key={opSymbol}
                  type="button"
                  onClick={() => setOp(opSymbol)}
                  className={`w-12 h-12 rounded-xl font-black text-lg transition-all shadow-md cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-blue-600 text-white scale-105 ring-2 ring-blue-400'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  {opSymbol === '*' ? '×' : opSymbol === '/' ? '÷' : opSymbol}
                </button>
              );
            })}
          </div>

          {/* Value B / Scalar */}
          <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              {op === '*' || op === '/' ? 'Multiplier / Divisor Factor' : 'Second Measurement (Value B)'}
            </label>

            {op === '+' || op === '-' ? (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Feet (ft)</label>
                  <input
                    type="number"
                    min="0"
                    value={feet2}
                    onChange={(e) => setFeet2(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-white text-center focus:outline-none focus:border-blue-500 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Inches (in)</label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={inches2}
                    onChange={(e) => setInches2(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-white text-center focus:outline-none focus:border-blue-500 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Fraction</label>
                  <select
                    value={fraction2}
                    onChange={(e) => setFraction2(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                  >
                    {FRACTION_OPTIONS.map((f) => (
                      <option key={f.label} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  step="any"
                  value={scalar2}
                  onChange={(e) => setScalar2(parseFloat(e.target.value) || 0)}
                  className="w-32 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-blue-500 font-bold"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Multiplication and division operate between an imperial measurement and a numerical scalar.
                </p>
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <button
            type="button"
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all cursor-pointer text-sm sm:text-base tracking-wide"
          >
            Calculate
          </button>

          {/* Results Section */}
          <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Calculation Results
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/50">
                <span className="block text-xs text-slate-400">Formatted Imperial</span>
                <span className="text-lg font-bold text-blue-400 mt-0.5 block">{resultImperial}</span>
              </div>
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/50">
                <span className="block text-xs text-slate-400">Total Inches</span>
                <span className="text-lg font-bold text-slate-200 mt-0.5 block">{resultInches}</span>
              </div>
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/50">
                <span className="block text-xs text-slate-400">Decimal Feet / Metric</span>
                <span className="text-sm font-semibold text-slate-200 mt-1 block">
                  {resultDecimal}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
