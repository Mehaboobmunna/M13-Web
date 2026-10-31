export type Operation = '+' | '-' | '*' | '/';

export type FractionPrecision = 16 | 32 | 64 | 128;
export type ResultUnitMode = 'imperial' | 'metric';

export interface CalculationHistoryItem {
  id: string;
  timestamp: number;
  operation: Operation;
  valA: {
    feet: number;
    inches: number;
    fraction: number;
  };
  valB: {
    feet: number;
    inches: number;
    fraction: number;
    scalar?: number;
  };
  resultImperial: string;
  resultInches: string;
  resultDecimal: string;
  precision?: FractionPrecision;
  unitMode?: ResultUnitMode;
  equation?: string;
}
