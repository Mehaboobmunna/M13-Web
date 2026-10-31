import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import {
  Operation,
  CalculationHistoryItem,
  FractionPrecision,
  ResultUnitMode,
} from '../../types/imperialCalc';
import { ArrowLeft, Calculator, Trash2, ArrowLeftRight, Check, Sliders, History, ExternalLink } from 'lucide-react';

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

const PRECISION_OPTIONS: FractionPrecision[] = [16, 32, 64, 128];

const STORAGE_KEY_HISTORY = 'imperial_calc_history_v1';
const STORAGE_KEY_PRECISION = 'imperial_calc_precision_v1';
const STORAGE_KEY_UNIT_MODE = 'imperial_calc_unit_mode_v1';

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

  // Precision and Unit Mode state
  const [precision, setPrecision] = useState<FractionPrecision>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRECISION);
      if (saved) return parseInt(saved, 10) as FractionPrecision;
    } catch {}
    return 16;
  });

  const [unitMode, setUnitMode] = useState<ResultUnitMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_UNIT_MODE);
      if (saved === 'metric' || saved === 'imperial') return saved;
    } catch {}
    return 'imperial';
  });

  // Track the raw numeric result in inches so unit mode and precision changes update instantly
  const [calculatedInches, setCalculatedInches] = useState<number | null>(null);
  const [lastEquation, setLastEquation] = useState<string | null>(null);

  // Helper to format input measurement for equation representation (e.g. 1'-2"1/2)
  const formatInputImperial = (feet: number, inches: number, fraction: number): string => {
    const fracObj = FRACTION_OPTIONS.find((f) => Math.abs(f.value - fraction) < 0.0001);
    const fracStr = fracObj && fracObj.value > 0 ? fracObj.label : '';
    return `${feet}'-${inches}"${fracStr}`;
  };

  const getEquationString = (
    f1: number,
    in1: number,
    fr1: number,
    operation: Operation,
    f2: number,
    in2: number,
    fr2: number,
    scalar: number
  ): string => {
    const left = formatInputImperial(f1, in1, fr1);
    const opSymbol = operation === '*' ? '×' : operation === '/' ? '÷' : operation;
    if (operation === '*' || operation === '/') {
      return `${left} ${opSymbol} ${scalar}`;
    }
    const right = formatInputImperial(f2, in2, fr2);
    return `${left} ${opSymbol} ${right}`;
  };

  const currentLiveEquation = useMemo(() => {
    return getEquationString(feet1, inches1, fraction1, op, feet2, inches2, fraction2, scalar2);
  }, [feet1, inches1, fraction1, op, feet2, inches2, fraction2, scalar2]);

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRECISION, precision.toString());
  }, [precision]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_UNIT_MODE, unitMode);
  }, [unitMode]);

  // Convert measurement to total inches
  const toTotalInches = (feet: number, inches: number, fraction: number): number => {
    return feet * 12 + inches + fraction;
  };

  // Convert decimal inches to clean Imperial representation with selectable precision
  const formatImperialFromInches = (totalInches: number, denominator: FractionPrecision = 16): string => {
    const isNegative = totalInches < 0;
    const absInches = Math.abs(totalInches);

    let feet = Math.floor(absInches / 12);
    let remainingInches = absInches - feet * 12;

    let inchesInt = Math.floor(remainingInches);
    let fracDecimal = remainingInches - inchesInt;

    // Round to specified precision denominator (16, 32, 64, or 128)
    let fractionUnits = Math.round(fracDecimal * denominator);
    if (fractionUnits === denominator) {
      fractionUnits = 0;
      inchesInt += 1;
      if (inchesInt === 12) {
        inchesInt = 0;
        feet += 1;
      }
    }

    let fracStr = '';
    if (fractionUnits > 0) {
      // Simplify fraction
      let num = fractionUnits;
      let den = denominator;
      while (num % 2 === 0 && den % 2 === 0) {
        num /= 2;
        den /= 2;
      }
      fracStr = `${num}/${den}`;
    }

    const sign = isNegative ? '-' : '';
    return `${sign}${feet}'-${inchesInt}"${fracStr}`;
  };

  // Formatted views derived from calculatedInches, precision, and unitMode
  const displayResults = useMemo(() => {
    if (calculatedInches === null) {
      return {
        imperial: '-',
        inches: '-',
        decimal: '-',
        meters: '-',
        centimeters: '-',
        millimeters: '-',
      };
    }

    const imperial = formatImperialFromInches(calculatedInches, precision);
    const inchesDisplay = `${calculatedInches.toFixed(4)} in`;
    const decimalFeet = calculatedInches / 12;
    const meters = calculatedInches * 0.0254;
    const centimeters = calculatedInches * 2.54;
    const millimeters = calculatedInches * 25.4;

    return {
      imperial,
      inches: inchesDisplay,
      decimal: `${decimalFeet.toFixed(4)} ft`,
      meters: `${meters.toFixed(4)} m`,
      centimeters: `${centimeters.toFixed(2)} cm`,
      millimeters: `${millimeters.toFixed(1)} mm`,
    };
  }, [calculatedInches, precision]);

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

    setCalculatedInches(finalInches);

    const equation = getEquationString(feet1, inches1, fraction1, op, feet2, inches2, fraction2, scalar2);
    setLastEquation(equation);

    const imperial = formatImperialFromInches(finalInches, precision);
    const inchesDisplay = `${finalInches.toFixed(3)} in`;
    const decimalFeet = finalInches / 12;
    const meters = finalInches * 0.0254;
    const decimalDisplay = `${decimalFeet.toFixed(4)} ft | ${meters.toFixed(3)} m`;

    const historyItem: CalculationHistoryItem = {
      id: 'calc-' + Date.now(),
      timestamp: Date.now(),
      operation: op,
      valA: { feet: feet1, inches: inches1, fraction: fraction1 },
      valB: { feet: feet2, inches: inches2, fraction: fraction2, scalar: scalar2 },
      resultImperial: imperial,
      resultInches: inchesDisplay,
      resultDecimal: decimalDisplay,
      precision,
      unitMode,
      equation,
    };

    setHistory((prev) => [historyItem, ...prev.slice(0, 49)]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const toggleUnitMode = () => {
    setUnitMode((prev) => (prev === 'imperial' ? 'metric' : 'imperial'));
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
      <nav className="flex items-center justify-between">
        <button
          onClick={() => navigate('apps')}
          className="text-slate-400 hover:text-white inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Apps Hub
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('apps-calculator-history')}
            className="px-3 py-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-600 shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>📜 Full History</span>
          </button>
          <button
            onClick={() => navigate('apps-keypad-calculator')}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>📱 Handheld Keypad Mode</span>
          </button>
        </div>
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
                    {item.equation && (
                      <div className="font-mono text-[11px] text-sky-300 font-semibold truncate">
                        {item.equation}
                      </div>
                    )}
                    <div className="font-bold text-white text-sm">{item.resultImperial}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.resultInches}</div>
                    {item.precision && (
                      <div className="text-[10px] text-sky-400/80 font-mono">
                        Prec: 1/{item.precision}"
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-8">
                  No calculations logged yet.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => navigate('apps-calculator-history')}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Full History Page & Export</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <p className="text-[11px] text-slate-500 text-center">Unique calculations save automatically.</p>
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
              Add, Subtract, Multiply & Divide Feet, Inches & Fractions with Metric Conversion
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

          {/* Results Section with Metric/Imperial quick toggle and precision switcher */}
          <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl space-y-4 shadow-xl">
            {/* Results Header Controls: Unit Toggle & Precision Switch */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span>Calculation Results</span>
                </h2>
                {calculatedInches !== null && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-semibold">
                    {unitMode === 'imperial' ? `1/${precision}" Precision` : 'Metric Mode'}
                  </span>
                )}
              </div>

              {/* Controls Group */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Metric / Imperial Unit Toggle */}
                <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setUnitMode('imperial')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      unitMode === 'imperial'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>📏 Imperial</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitMode('metric')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      unitMode === 'metric'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🌐 Metric</span>
                  </button>
                </div>

                {/* Quick Toggle Flip Button */}
                <button
                  type="button"
                  onClick={toggleUnitMode}
                  title={`Switch to ${unitMode === 'imperial' ? 'Metric' : 'Imperial'}`}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Flip</span>
                </button>
              </div>
            </div>

            {/* Precision Switcher Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-medium">Fraction Precision:</span>
              </div>

              <div className="flex items-center gap-1.5">
                {PRECISION_OPTIONS.map((denom) => {
                  const isActive = precision === denom;
                  return (
                    <button
                      key={denom}
                      type="button"
                      onClick={() => setPrecision(denom)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400/50 shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      1/{denom}"
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full Equation Display */}
            <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Full Equation:
                </span>
                {lastEquation ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-semibold">
                    Calculated
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    Current Preview
                  </span>
                )}
              </div>
              <div className="font-mono text-base sm:text-lg font-bold text-sky-400 tracking-wide sm:text-right select-all">
                {lastEquation || currentLiveEquation}
              </div>
            </div>

            {/* Dynamic Results Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {unitMode === 'imperial' ? (
                <>
                  {/* Primary: Formatted Imperial */}
                  <div className="bg-slate-800/90 p-4 rounded-xl border border-blue-500/40 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Formatted Imperial</span>
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                        1/{precision}"
                      </span>
                    </div>
                    <span className="text-xl font-black text-blue-400 tracking-tight block">
                      {displayResults.imperial}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                      {displayResults.decimal} decimal
                    </span>
                  </div>

                  {/* Secondary: Total Inches */}
                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
                    <span className="block text-xs text-slate-400 mb-1">Total Inches</span>
                    <span className="text-xl font-bold text-slate-100 tracking-tight block">
                      {displayResults.inches}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                      Precise decimal value
                    </span>
                  </div>

                  {/* Tertiary: Metric Equivalent */}
                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Metric Equivalent</span>
                      <span className="text-[10px] font-mono text-emerald-400">SI Units</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-400 tracking-tight block">
                      {displayResults.meters}
                    </span>
                    <span className="text-[11px] text-slate-300 font-mono mt-1 block">
                      {displayResults.centimeters} | {displayResults.millimeters}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Primary: Formatted Metric (Meters & Centimeters) */}
                  <div className="bg-slate-800/90 p-4 rounded-xl border border-emerald-500/50 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Metric Length</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                        Primary
                      </span>
                    </div>
                    <span className="text-xl font-black text-emerald-400 tracking-tight block">
                      {displayResults.meters}
                    </span>
                    <span className="text-[11px] text-slate-300 font-mono mt-1 block">
                      {displayResults.centimeters}
                    </span>
                  </div>

                  {/* Secondary: Millimeters & Centimeters */}
                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
                    <span className="block text-xs text-slate-400 mb-1">Millimeters (mm)</span>
                    <span className="text-xl font-bold text-slate-100 tracking-tight block">
                      {displayResults.millimeters}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                      High-precision fabrication
                    </span>
                  </div>

                  {/* Tertiary: Imperial Equivalent */}
                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Imperial Equivalent</span>
                      <span className="text-[10px] font-mono text-blue-400">
                        1/{precision}"
                      </span>
                    </div>
                    <span className="text-lg font-bold text-blue-400 tracking-tight block">
                      {displayResults.imperial}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                      {displayResults.inches}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
