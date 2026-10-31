export type Operation = '+' | '-' | '*' | '/';

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
}
