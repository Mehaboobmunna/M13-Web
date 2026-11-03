# Implementation Plan - Multiline 66-Character Sheet Number Wrapping

Format extracted sheet number strings so that each line contains a maximum of 66 characters, cleanly breaking at comma `,` boundaries when wrapping to subsequent lines.

## Proposed Changes

### 1. Extracted Sheet Text Formatting Utility (`/src/pages/apps/TransmittalBuilderApp.tsx`)
- Implement a helper function `formatSheetsMultiline(files: File[], maxLineLength = 66): string`:
  - Extracts sheet names without extensions from uploaded files.
  - Accumulates file names into lines, ensuring no line exceeds 66 characters.
  - Breaks strictly at comma boundaries (`, `).
  - Joins line chunks with `\n`.

### 2. Live Preview & Formatted Output Sync
- Update `{ASSEMBLY_SHEETS}` and `{E_SHEETS}` values across the live transmittal preview, plain text summary, and CSV export.
- Display multiline text smoothly inside preview table cells using whitespace preservation (`whitespace-pre-line`).

### 3. Word Document (`.docx`) In-Place Substitution
- Configure `Docxtemplater` with `linebreaks: true` to convert `\n` in multiline sheet strings to Word linebreaks (`<w:br/>`).
- In surgical XML DOM insertion (`word/document.xml`), create separate `<w:p>` or `<w:r><w:t>... </w:t><w:br/></w:r>` elements for each line chunk so Word renders each 66-character line cleanly inside table cells.

## Verification Plan

### Manual Verification
1. Upload multiple drawing files with long sheet names.
2. Verify in live preview that lines break at commas before exceeding 66 characters.
3. Download updated `.docx` transmittal and inspect table cell layout.

### Automated Verification
- Run `compile_applet` and `lint_applet` to ensure zero compilation or syntax errors.
