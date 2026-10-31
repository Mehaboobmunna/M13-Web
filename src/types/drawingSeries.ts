export interface ParsedItem {
  original: string;
  cleanName: string;
  isPrebuiltRange: boolean;
  prefix: string;
  num: number;
  padding: number;
  sheetNum: number | null;
  revision: string;
  endNum?: number;
}

export interface SeriesOutputToken {
  text: string;
  sortRef: ParsedItem;
}
