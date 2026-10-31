import { ParsedItem, SeriesOutputToken } from '../types/drawingSeries';

export function parseDrawingItem(item: string): ParsedItem | null {
  item = (item || '').trim();
  if (!item) return null;

  const originalName = item;
  // Always strip .pdf / file extensions for internal structural parsing
  const baseItem = item.replace(/\.pdf$/i, '').replace(/\.[^/.]+$/, '').trim();

  // 1. Check if it's a pre-built range like HR5000-HR5029_A (second part MUST have prefix letters)
  const rangeMatch = baseItem.match(/^([A-Za-z]+)(\d+)\s*-\s*([A-Za-z]+)(\d+)(.*)$/);
  if (rangeMatch) {
    const prefix1 = rangeMatch[1];
    const num1 = parseInt(rangeMatch[2], 10);
    const num2 = parseInt(rangeMatch[4], 10);
    const remainder = (rangeMatch[5] || '').trim();
    const revMatch = remainder.match(/^_([A-Za-z0-9]+)$/);
    const revision = revMatch ? revMatch[1] : '';

    return {
      original: originalName,
      cleanName: baseItem,
      isPrebuiltRange: true,
      prefix: prefix1,
      num: num1,
      endNum: num2,
      padding: rangeMatch[2].length,
      sheetNum: null,
      revision: revision,
    };
  }

  // 2. Standard filename pattern matching:
  // Part 1: Prefix (Alphabets)
  // Part 2: 4-digit number (or general digits)
  // Part 3: Optional sheet number e.g. " - 1", "-1", " - 2"
  // Part 4: Optional Revision e.g. "_A", "_B", "_0"
  const match = baseItem.match(/^([A-Za-z]+)(\d+)(?:\s*-\s*(\d+))?(?:_([A-Za-z0-9]+))?$/);

  if (match) {
    const prefix = match[1];
    const numStr = match[2];
    const sheetStr = match[3];
    const revision = match[4] || '';

    return {
      original: originalName,
      cleanName: baseItem,
      isPrebuiltRange: false,
      prefix: prefix,
      num: parseInt(numStr, 10),
      padding: numStr.length,
      sheetNum: sheetStr !== undefined ? parseInt(sheetStr, 10) : null,
      revision: revision,
    };
  } else {
    return {
      original: originalName,
      cleanName: baseItem,
      isPrebuiltRange: false,
      prefix: '',
      num: NaN,
      padding: 0,
      sheetNum: null,
      revision: '',
    };
  }
}

function formatSingleItem(item: ParsedItem, stripExt: boolean): string {
  if (isNaN(item.num)) {
    return stripExt ? item.cleanName : item.original;
  }
  const numPart = String(item.num).padStart(item.padding, '0');
  const sheetPart = item.sheetNum !== null && item.sheetNum > 0 ? ` - ${item.sheetNum}` : '';
  const revPart = item.revision ? `_${item.revision}` : '';
  const extPart = !stripExt && item.original.toLowerCase().endsWith('.pdf') ? '.pdf' : '';
  return `${item.prefix}${numPart}${sheetPart}${revPart}${extPart}`;
}

export function buildDrawingSeries(
  filenames: string[],
  options: { sortOutput: boolean; removeDuplicates: boolean; stripExt: boolean }
): { output: string; stats: string } {
  if (filenames.length === 0) {
    return { output: '', stats: 'Ready' };
  }

  const { sortOutput, removeDuplicates, stripExt } = options;

  const rawItems: ParsedItem[] = [];
  for (const name of filenames) {
    const parts = name.split(',').map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      const parsed = parseDrawingItem(part);
      if (parsed) {
        rawItems.push(parsed);
      }
    }
  }

  if (rawItems.length === 0) {
    return { output: '', stats: '0 files processed' };
  }

  // Expand prebuilt ranges
  let expandedItems: ParsedItem[] = [];
  rawItems.forEach((item) => {
    if (item.isPrebuiltRange && typeof item.endNum === 'number') {
      const extSuffix = item.original.toLowerCase().endsWith('.pdf') ? '.pdf' : '';
      for (let n = item.num; n <= item.endNum; n++) {
        const base = item.prefix + String(n).padStart(item.padding, '0') + (item.revision ? '_' + item.revision : '');
        expandedItems.push({
          original: base + extSuffix,
          cleanName: base,
          isPrebuiltRange: false,
          prefix: item.prefix,
          num: n,
          padding: item.padding,
          sheetNum: null,
          revision: item.revision,
        });
      }
    } else {
      expandedItems.push(item);
    }
  });

  // Track sub-sheets
  const subSheetBaseMap: Record<string, boolean> = {};
  expandedItems.forEach((item) => {
    if (!isNaN(item.num) && item.sheetNum !== null && item.sheetNum > 0) {
      const baseKey = `${item.prefix.toUpperCase()}|${item.num}`;
      subSheetBaseMap[baseKey] = true;

      const mainSheetExists = expandedItems.some(
        (ex) =>
          ex.prefix.toUpperCase() === item.prefix.toUpperCase() &&
          ex.num === item.num &&
          ex.sheetNum === null &&
          ex.revision === item.revision
      );
      if (!mainSheetExists) {
        const extSuffix = item.original.toLowerCase().endsWith('.pdf') ? '.pdf' : '';
        const base = item.prefix + String(item.num).padStart(item.padding, '0') + (item.revision ? '_' + item.revision : '');
        expandedItems.push({
          original: base + extSuffix,
          cleanName: base,
          isPrebuiltRange: false,
          prefix: item.prefix,
          num: item.num,
          padding: item.padding,
          sheetNum: null,
          revision: item.revision,
        });
      }
    }
  });

  // Deduplicate
  if (removeDuplicates) {
    const seen = new Set<string>();
    expandedItems = expandedItems.filter((item) => {
      const key = isNaN(item.num)
        ? item.cleanName
        : `${item.prefix.toUpperCase()}|${item.num}|${item.sheetNum === null ? 0 : item.sheetNum}|${item.revision}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const compareFn = (a: ParsedItem, b: ParsedItem) => {
    if (!a || !b) return 0;
    const prefixA = (a.prefix || '').toUpperCase();
    const prefixB = (b.prefix || '').toUpperCase();
    if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);

    const numA = isNaN(a.num) ? 0 : a.num;
    const numB = isNaN(b.num) ? 0 : b.num;
    if (numA !== numB) return numA - numB;

    const sheetA = a.sheetNum !== null ? a.sheetNum : 0;
    const sheetB = b.sheetNum !== null ? b.sheetNum : 0;
    if (sheetA !== sheetB) return sheetA - sheetB;

    const revA = a.revision || '';
    const revB = b.revision || '';
    return revA.localeCompare(revB);
  };

  if (sortOutput) {
    expandedItems.sort(compareFn);
  }

  const outputTokens: SeriesOutputToken[] = [];
  let i = 0;

  const isGroupable = (item: ParsedItem) => {
    if (!item || isNaN(item.num)) return false;
    if (item.sheetNum !== null) return false;
    const baseKey = `${item.prefix.toUpperCase()}|${item.num}`;
    if (subSheetBaseMap[baseKey]) return false;
    return true;
  };

  while (i < expandedItems.length) {
    const current = expandedItems[i];

    if (!isGroupable(current)) {
      outputTokens.push({
        text: formatSingleItem(current, stripExt),
        sortRef: current,
      });
      i++;
    } else {
      let j = i;
      while (j + 1 < expandedItems.length) {
        const nextItem = expandedItems[j + 1];
        const prevItem = expandedItems[j];
        if (
          isGroupable(nextItem) &&
          nextItem.prefix.toUpperCase() === current.prefix.toUpperCase() &&
          nextItem.revision === current.revision &&
          nextItem.padding === current.padding &&
          nextItem.num === prevItem.num + 1
        ) {
          j++;
        } else {
          break;
        }
      }

      const runLength = j - i + 1;
      if (runLength >= 3) {
        const startItem = expandedItems[i];
        const endItem = expandedItems[j];
        const startNumStr = String(startItem.num).padStart(startItem.padding, '0');
        const endNumStr = String(endItem.num).padStart(endItem.padding, '0');
        const revPart = startItem.revision ? `_${startItem.revision}` : '';
        const extPart = !stripExt && startItem.original.toLowerCase().endsWith('.pdf') ? '.pdf' : '';
        outputTokens.push({
          text: `${startItem.prefix}${startNumStr}-${endItem.prefix}${endNumStr}${revPart}${extPart}`,
          sortRef: startItem,
        });
      } else {
        for (let k = i; k <= j; k++) {
          outputTokens.push({
            text: formatSingleItem(expandedItems[k], stripExt),
            sortRef: expandedItems[k],
          });
        }
      }
      i = j + 1;
    }
  }

  const result = outputTokens.map((t) => t.text).join(', ');
  const stats = `${expandedItems.length} drawing(s) processed → ${outputTokens.length} output token(s)`;

  return { output: result, stats };
}
