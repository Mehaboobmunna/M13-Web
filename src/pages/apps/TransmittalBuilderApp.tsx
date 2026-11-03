import React, { useState, useRef, useMemo } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import {
  UploadCloud,
  Copy,
  Check,
  Trash2,
  Download,
  Zap,
  Layers,
  FileCheck,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  RefreshCw,
  FileUp,
  RotateCcw,
} from 'lucide-react';
import { useActivityMetrics, incrementMetric } from '../../utils/activityMetrics';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  VerticalAlign,
  AlignmentType,
} from 'docx';

function getCurrentDateFormatted(): string {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export const TransmittalBuilderApp: React.FC = () => {
  const { navigate } = useNavigation();
  const { metrics } = useActivityMetrics();

  // Uploaded Word Document State
  const [uploadedDocx, setUploadedDocx] = useState<{ name: string; buffer: ArrayBuffer } | null>(null);
  const [dragDocx, setDragDocx] = useState<boolean>(false);

  // Locked Document Header Template Values with Dynamic Current Date (MM/DD/YYYY)
  const transmittalNo = '01';
  const transmittalDate = useMemo(() => getCurrentDateFormatted(), []);
  const companyName = 'LIBERTY STEEL FABRICATION, INC';
  const companyAddress = '1861 Main Street, Fyffe, AL 35971';
  const companyPhone = '256-623-3028';
  const projectName = 'VILLAGE AT BROOKWOOD';
  const projectNumber = '4250';
  const attention = 'Steven Mitchell';
  const location = '3753 Austell RD SW, bldg. 100, Austell, GA 30106';
  const deliveryMethod = 'email';

  // 3 Drawing File Selections
  // 1st: Assembly Drawings -> {ASSEMBLY_SHEETS}, {ASSEMBLY_COUNT}
  const [assemblyFiles, setAssemblyFiles] = useState<File[]>([]);
  // 2nd: E-sheets Plan/Detail -> {E_SHEETS}, {ESHEET_COUNT}
  const [esheetFiles, setEsheetFiles] = useState<File[]>([]);
  // 3rd: Part Drawings -> {PART_COUNT}
  const [partFiles, setPartFiles] = useState<File[]>([]);

  // Drag States
  const [dragAssembly, setDragAssembly] = useState<boolean>(false);
  const [dragEsheet, setDragEsheet] = useState<boolean>(false);
  const [dragPart, setDragPart] = useState<boolean>(false);

  // Helper to extract Revision from file name (e.g., "REV A" -> "A", "REV 0" -> "0", "REV 1" -> "1")
  const getRevision = (fileName: string): string | null => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '').trim().toUpperCase();
    const match = nameWithoutExt.match(/\bREV[\.\-_\s]*([0-9A-Z]+)$/i) || nameWithoutExt.match(/REV[\.\-_\s]*([0-9A-Z]+)/i);
    if (match) {
      return match[1].toUpperCase();
    }
    return null;
  };

  // Dynamically calculate bottom table submittal purpose based on user rules
  const selectedPurpose = useMemo(() => {
    const allFiles = [...assemblyFiles, ...esheetFiles, ...partFiles];
    if (allFiles.length === 0) return 'Approval';

    // Rule 3: Mark "For Shop Fabrication" - if Assembly drawings end with "Rev 0"
    if (
      assemblyFiles.length > 0 &&
      assemblyFiles.every((f) => getRevision(f.name) === '0')
    ) {
      return 'For Shop Fabrication';
    }

    // Rule 4: Mark "Field Use" - if Erection drawings end with "Rev 0"
    if (
      esheetFiles.length > 0 &&
      esheetFiles.every((f) => getRevision(f.name) === '0')
    ) {
      return 'Field Use';
    }

    // Rule 5: Mark "Rev. for Shop Fabrication" - if Assembly drawings end with "Rev 1" or "Rev 2" or so on
    if (
      assemblyFiles.length > 0 &&
      assemblyFiles.every((f) => {
        const rev = getRevision(f.name);
        return rev !== null && /^[1-9][0-9]*$/.test(rev);
      })
    ) {
      return 'Rev. for Shop Fabrication';
    }

    // Rule 6: Mark "Rev. Field Use" - if Erection drawings end with "Rev 1" or "Rev 2" or so on
    if (
      esheetFiles.length > 0 &&
      esheetFiles.every((f) => {
        const rev = getRevision(f.name);
        return rev !== null && /^[1-9][0-9]*$/.test(rev);
      })
    ) {
      return 'Rev. Field Use';
    }

    // Rule 1: Mark "Approval" - if all the files end with text "Rev A"
    if (allFiles.every((f) => getRevision(f.name) === 'A')) {
      return 'Approval';
    }

    // Rule 2: Mark "Re-Approval" - if all the files end with "Rev B" or "Rev C" or so on
    if (
      allFiles.every((f) => {
        const rev = getRevision(f.name);
        return rev !== null && /^[B-Z]$/.test(rev);
      })
    ) {
      return 'Re- Approval';
    }

    return 'Approval';
  }, [assemblyFiles, esheetFiles, partFiles]);

  const PURPOSE_OPTIONS = [
    'Approval',
    'Re- Approval',
    'Field Use',
    'Rev. Field Use',
    'For Your Files',
    'For Shop Fabrication',
    'Mill Order',
    'Rev. for Shop Fabrication',
  ];

  const docxInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputAssemblyRef = useRef<HTMLInputElement | null>(null);
  const fileInputEsheetRef = useRef<HTMLInputElement | null>(null);
  const fileInputPartRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'preview' | 'text' | 'csv'>('preview');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [isUpdatingDoc, setIsUpdatingDoc] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [transmittalsDownloaded, setTransmittalsDownloaded] = useState<number>(() => {
    const saved = localStorage.getItem('transmittals_downloaded_count');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  // Reset all uploaded files and state
  const handleResetAll = () => {
    setUploadedDocx(null);
    setAssemblyFiles([]);
    setEsheetFiles([]);
    setPartFiles([]);
    setActiveTab('preview');
    setCopiedStatus(false);
    setShowUploadModal(false);
    if (docxInputRef.current) docxInputRef.current.value = '';
    if (fileInputAssemblyRef.current) fileInputAssemblyRef.current.value = '';
    if (fileInputEsheetRef.current) fileInputEsheetRef.current.value = '';
    if (fileInputPartRef.current) fileInputPartRef.current.value = '';
  };

  // Extract sheet details from uploaded files, breaking at ',' with max 78 characters per line
  const extractSheetDetails = (files: File[], maxLineLength = 78): string => {
    if (files.length === 0) return '';
    const names = files
      .map((f) => f.name.replace(/\.[^/.]+$/, '').trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) return '';

    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const isLast = i === names.length - 1;
      const itemWithComma = isLast ? name : `${name}, `;

      if (!currentLine) {
        currentLine = itemWithComma;
      } else if ((currentLine + itemWithComma).length <= maxLineLength) {
        currentLine += itemWithComma;
      } else {
        const trimmedLine = currentLine.trimEnd();
        if (trimmedLine) lines.push(trimmedLine);
        currentLine = itemWithComma;
      }
    }

    if (currentLine) {
      const trimmedLine = currentLine.trimEnd();
      if (trimmedLine) lines.push(trimmedLine);
    }

    return lines.filter((l) => l.trim().length > 0).join('\n');
  };

  const assemblySheetsVal = useMemo(
    () => (assemblyFiles.length > 0 ? extractSheetDetails(assemblyFiles) : '{ASSEMBLY_SHEETS}'),
    [assemblyFiles]
  );
  const esheetSheetsVal = useMemo(
    () => (esheetFiles.length > 0 ? extractSheetDetails(esheetFiles) : '{E_SHEETS}'),
    [esheetFiles]
  );

  const assemblyCountVal = useMemo(() => {
    const cnt = assemblyFiles.length > 0 ? String(assemblyFiles.length).padStart(2, '0') : '{ASSEMBLY_COUNT}';
    return `${cnt} - Assembly Drawings`;
  }, [assemblyFiles]);

  const esheetCountVal = useMemo(() => {
    const cnt = esheetFiles.length > 0 ? String(esheetFiles.length).padStart(2, '0') : '{ESHEET_COUNT}';
    return `${cnt} - E-sheets Plan/Detail`;
  }, [esheetFiles]);

  const partCountVal = useMemo(() => {
    const cnt = partFiles.length > 0 ? String(partFiles.length).padStart(2, '0') : '{PART_COUNT}';
    return `${cnt}\n- Part Drawing`;
  }, [partFiles]);

  // Upload Word Transmittal Document
  const handleDocxUpload = (file: File) => {
    if (!file || !file.name.match(/\.docx$/i)) {
      alert('Please select a valid Word document file (.docx).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadedDocx({
          name: file.name,
          buffer: e.target.result as ArrayBuffer,
        });
        setShowUploadModal(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Add Drawing Files
  const handleAddFiles = (selectedFiles: FileList | null, type: 'assembly' | 'esheet' | 'part') => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const added = Array.from(selectedFiles);
    if (type === 'assembly') setAssemblyFiles((prev) => [...prev, ...added]);
    if (type === 'esheet') setEsheetFiles((prev) => [...prev, ...added]);
    if (type === 'part') setPartFiles((prev) => [...prev, ...added]);
    incrementMetric('transmittalBuilderRequests', added.length);
  };

  const handleClearFiles = (type: 'assembly' | 'esheet' | 'part') => {
    if (type === 'assembly') setAssemblyFiles([]);
    if (type === 'esheet') setEsheetFiles([]);
    if (type === 'part') setPartFiles([]);
  };

  // Plain Text Summary
  const plainTextResult = useMemo(() => {
    let out = `TRANSMITTAL NO: ${transmittalNo}\n`;
    out += `CUSTOMER: ${companyName}\n`;
    out += `ADDRESS: ${companyAddress} | Ph: ${companyPhone}\n`;
    out += `PROJECT: ${projectName} | PROJECT NUMBER: ${projectNumber}\n`;
    out += `ATTENTION: ${attention} | LOCATION: ${location}\n`;
    out += `DATE: ${transmittalDate}\n`;
    out += `========================================================\n`;
    out += `ftp/email | Sheet # | Total Count\n`;
    out += `--------------------------------------------------------\n`;
    out += `${deliveryMethod} | ${assemblySheetsVal} | ${assemblyCountVal}\n`;
    out += `${deliveryMethod} | ${esheetSheetsVal} | ${esheetCountVal}\n`;
    out += `${deliveryMethod} | Single part drawings | ${partCountVal}\n`;
    out += `========================================================\n`;
    out += `PURPOSE: [X] ${selectedPurpose}\n`;
    return out;
  }, [assemblySheetsVal, assemblyCountVal, esheetSheetsVal, esheetCountVal, partCountVal, transmittalDate, selectedPurpose]);

  // CSV Summary
  const csvResult = useMemo(() => {
    let out = `Transmittal No,Customer,Project,Project Number,Attention,Location,Date,Category,Delivery Method,Sheet Details,Total Count\n`;
    const cleanStr = (s: string) => `"${s.replace(/"/g, '""')}"`;
    out += `${cleanStr(transmittalNo)},${cleanStr(companyName)},${cleanStr(projectName)},${cleanStr(projectNumber)},${cleanStr(attention)},${cleanStr(location)},${cleanStr(transmittalDate)},"Assembly Drawing",${cleanStr(deliveryMethod)},${cleanStr(assemblySheetsVal)},${cleanStr(assemblyCountVal)}\n`;
    out += `${cleanStr(transmittalNo)},${cleanStr(companyName)},${cleanStr(projectName)},${cleanStr(projectNumber)},${cleanStr(attention)},${cleanStr(location)},${cleanStr(transmittalDate)},"E-sheets Plan/Detail",${cleanStr(deliveryMethod)},${cleanStr(esheetSheetsVal)},${cleanStr(esheetCountVal)}\n`;
    out += `${cleanStr(transmittalNo)},${cleanStr(companyName)},${cleanStr(projectName)},${cleanStr(projectNumber)},${cleanStr(attention)},${cleanStr(location)},${cleanStr(transmittalDate)},"Part Drawings",${cleanStr(deliveryMethod)},"Single part drawings",${cleanStr(partCountVal)}\n`;
    return out;
  }, [assemblySheetsVal, assemblyCountVal, esheetSheetsVal, esheetCountVal, partCountVal, transmittalDate]);

  const handleCopyText = (txt: string) => {
    navigator.clipboard.writeText(txt).then(() => {
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    });
  };

  // Generate Default Template Word Document Buffer using docx package
  const generateDefaultTemplateBuffer = async (): Promise<ArrayBuffer> => {
    const assemblySheetsText = assemblyFiles.length > 0 ? extractSheetDetails(assemblyFiles) : 'None';
    const esheetSheetsText = esheetFiles.length > 0 ? extractSheetDetails(esheetFiles) : 'None';
    const assemblyCountFormatted =
      assemblyFiles.length > 0 ? `${String(assemblyFiles.length).padStart(2, '0')} - Assembly Drawings` : '00 - Assembly Drawings';
    const esheetCountFormatted =
      esheetFiles.length > 0 ? `${String(esheetFiles.length).padStart(2, '0')} - E-sheets Plan/Detail` : '00 - E-sheets Plan/Detail';
    const partCountFormatted =
      partFiles.length > 0 ? `${String(partFiles.length).padStart(2, '0')}\n- Part Drawing` : '00\n- Part Drawing';

    const tableBorder = {
      top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    };

    const createLinesRuns = (text: string, bold = false, color = '000000') => {
      const lines = text.split('\n').filter((l) => l.length > 0);
      const runs: TextRun[] = [];
      lines.forEach((line, idx) => {
        runs.push(
          new TextRun({
            text: line,
            bold,
            color,
            size: 20,
            break: idx < lines.length - 1 ? 1 : 0,
          })
        );
      });
      return runs.length > 0 ? runs : [new TextRun({ text: '', size: 20 })];
    };

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, bottom: 720, left: 720, right: 720 },
            },
          },
          children: [
            // Transmittal No Header
            new Paragraph({
              children: [
                new TextRun({ text: 'TRANSMITTAL NO: ', bold: true, color: '0000FF', size: 24 }),
                new TextRun({ text: transmittalNo, bold: true, size: 24 }),
              ],
              spacing: { after: 120 },
            }),

            // Header Box Table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: tableBorder,
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'Customer :', bold: true, color: '0000FF', size: 18 })],
                          spacing: { after: 40 },
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: companyName, bold: true, size: 22 })],
                          spacing: { after: 40 },
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: companyAddress, bold: true, size: 18 })],
                          spacing: { after: 20 },
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: `Ph: ${companyPhone}`, bold: true, size: 18 })],
                          spacing: { after: 80 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({ text: 'Attention: ', bold: true, color: '0000FF', size: 18 }),
                            new TextRun({ text: attention, bold: true, color: '047857', size: 18 }),
                          ],
                          spacing: { before: 80 },
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: 'Project: ', bold: true, color: '0000FF', size: 18 }),
                            new TextRun({ text: projectName, bold: true, color: '047857', size: 18 }),
                          ],
                          spacing: { after: 40 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({ text: 'Project Number: ', bold: true, color: '0000FF', size: 18 }),
                            new TextRun({ text: projectNumber, bold: true, color: '047857', size: 18 }),
                          ],
                          spacing: { after: 40 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({ text: 'Location: ', bold: true, color: '0000FF', size: 18 }),
                            new TextRun({ text: location, bold: true, color: '047857', size: 18 }),
                          ],
                          spacing: { after: 80 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({ text: 'Date: ', bold: true, color: '0000FF', size: 18 }),
                            new TextRun({ text: transmittalDate, bold: true, color: '047857', size: 18 }),
                          ],
                          spacing: { before: 80 },
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ spacing: { after: 120 } }),

            // Drawings Table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: tableBorder,
              rows: [
                // Header Row
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 18, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: 'ftp/email', bold: true, color: '0000FF', size: 20 })] })],
                    }),
                    new TableCell({
                      width: { size: 52, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Sheet #', bold: true, color: '0000FF', size: 20 })], alignment: AlignmentType.CENTER })],
                    }),
                    new TableCell({
                      width: { size: 30, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Total Count', bold: true, color: '0000FF', size: 20 })] })],
                    }),
                  ],
                }),
                // Row 1: Assembly Drawings
                new TableRow({
                  children: [
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [new Paragraph({ children: [new TextRun({ text: deliveryMethod, color: '0000FF', size: 20 })] })],
                    }),
                    new TableCell({
                      verticalAlign: VerticalAlign.TOP,
                      children: [new Paragraph({ children: createLinesRuns(assemblySheetsText, false, '0000FF') })],
                    }),
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [new Paragraph({ children: createLinesRuns(assemblyCountFormatted, false, '0000FF') })],
                    }),
                  ],
                }),
                // Row 2: E-sheets Plan/Detail
                new TableRow({
                  children: [
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [new Paragraph({ children: [new TextRun({ text: deliveryMethod, color: '0000FF', size: 20 })] })],
                    }),
                    new TableCell({
                      verticalAlign: VerticalAlign.TOP,
                      children: [new Paragraph({ children: createLinesRuns(esheetSheetsText, false, '0000FF') })],
                    }),
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [new Paragraph({ children: createLinesRuns(esheetCountFormatted, false, '0000FF') })],
                    }),
                  ],
                }),
                // Row 3: Part Drawings
                new TableRow({
                  children: [
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [new Paragraph({ children: [new TextRun({ text: deliveryMethod, color: '0000FF', size: 20 })] })],
                    }),
                    new TableCell({
                      verticalAlign: VerticalAlign.TOP,
                      children: [new Paragraph({ children: [new TextRun({ text: 'Single part drawings', color: '0000FF', size: 20 })] })],
                    }),
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [new Paragraph({ children: createLinesRuns(partCountFormatted, false, '0000FF') })],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ spacing: { after: 160 } }),

            // Purpose Table
            new Table({
              width: { size: 45, type: WidthType.PERCENTAGE },
              borders: tableBorder,
              rows: PURPOSE_OPTIONS.map(
                (opt) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 25, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: selectedPurpose === opt ? 'X' : ' ', bold: true, size: 20 })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 75, type: WidthType.PERCENTAGE },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: opt, bold: true, color: '0000FF', size: 20 })],
                          }),
                        ],
                      }),
                    ],
                  })
              ),
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return await blob.arrayBuffer();
  };

  // Surgical In-Place XML Update Function for the 5 Dynamic Variables & Current Date
  const processInPlaceDocxUpdate = (buffer: ArrayBuffer): Blob => {
    const zip = new PizZip(buffer);

    const assemblyCountFormatted =
      assemblyFiles.length > 0 ? `${String(assemblyFiles.length).padStart(2, '0')} - Assembly Drawings` : '00 - Assembly Drawings';
    const esheetCountFormatted =
      esheetFiles.length > 0 ? `${String(esheetFiles.length).padStart(2, '0')} - E-sheets Plan/Detail` : '00 - E-sheets Plan/Detail';
    const partCountFormatted =
      partFiles.length > 0 ? `${String(partFiles.length).padStart(2, '0')}\n- Part Drawing` : '00\n- Part Drawing';

    const assemblySheetsText = assemblyFiles.length > 0 ? extractSheetDetails(assemblyFiles) : 'None';
    const esheetSheetsText = esheetFiles.length > 0 ? extractSheetDetails(esheetFiles) : 'None';
    const currentDateStr = getCurrentDateFormatted();

    // 1. Docxtemplater Pass
    try {
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{', end: '}' },
      });
      doc.setData({
        DATE: currentDateStr,
        date: currentDateStr,
        Date: currentDateStr,
        ASSEMBLY_SHEETS: assemblySheetsText,
        assembly_sheets: assemblySheetsText,
        E_SHEETS: esheetSheetsText,
        e_sheets: esheetSheetsText,
        ESHEET_SHEETS: esheetSheetsText,
        esheet_sheets: esheetSheetsText,
        ASSEMBLY_COUNT: assemblyCountFormatted,
        assembly_count: assemblyCountFormatted,
        ESHEET_COUNT: esheetCountFormatted,
        esheet_count: esheetCountFormatted,
        PART_COUNT: partCountFormatted,
        part_count: partCountFormatted,
      });
      doc.render();
    } catch (e) {
      console.warn('Docxtemplater tag rendering notice (proceeding with surgical XML DOM update):', e);
    }

    // 2. Surgical XML DOM modification directly inside word/document.xml using strict OpenXML Namespace
    const docXmlFile = zip.file('word/document.xml');
    if (docXmlFile) {
      let xmlStr = docXmlFile.asText();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');

      const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
      const createWElem = (name: string) => xmlDoc.createElementNS(W_NS, `w:${name}`);

      const updateCellText = (
        cell: Element,
        newText: string,
        vAlignVal: 'top' | 'center' = 'top',
        opts: {
          isBold?: boolean;
          isBlue?: boolean;
          isUnderline?: boolean;
        } = {}
      ) => {
        const trimmedText = newText.trim();

        // 1. Ensure Cell Vertical Alignment is set
        let tcPr = cell.getElementsByTagName('w:tcPr')[0];
        if (!tcPr) {
          tcPr = createWElem('tcPr');
          cell.insertBefore(tcPr, cell.firstChild);
        }
        let vAlign = tcPr.getElementsByTagName('w:vAlign')[0];
        if (!vAlign) {
          vAlign = createWElem('vAlign');
          tcPr.appendChild(vAlign);
        }
        vAlign.setAttribute('w:val', vAlignVal);

        // 2. Ensure Paragraph
        let firstP: Element;
        const pElems = Array.from(cell.getElementsByTagName('w:p'));
        if (pElems.length === 0) {
          firstP = createWElem('p');
          cell.appendChild(firstP);
        } else {
          firstP = pElems[0];
          for (let i = 1; i < pElems.length; i++) {
            if (pElems[i].parentNode) {
              pElems[i].parentNode?.removeChild(pElems[i]);
            }
          }
        }

        // 3. Reset Paragraph Spacing (before=0, after=0) & strip paragraph level underlines
        let pPr = firstP.getElementsByTagName('w:pPr')[0];
        if (!pPr) {
          pPr = createWElem('pPr');
          firstP.insertBefore(pPr, firstP.firstChild);
        }
        let spacing = pPr.getElementsByTagName('w:spacing')[0];
        if (!spacing) {
          spacing = createWElem('spacing');
          pPr.appendChild(spacing);
        }
        spacing.setAttribute('w:before', '0');
        spacing.setAttribute('w:after', '0');
        spacing.setAttribute('w:beforeAutospacing', '0');
        spacing.setAttribute('w:afterAutospacing', '0');

        // Clean paragraph level run properties (w:pPr -> w:rPr -> w:u)
        let pPrRPr = pPr.getElementsByTagName('w:rPr')[0];
        if (!pPrRPr) {
          pPrRPr = createWElem('rPr');
          pPr.appendChild(pPrRPr);
        }
        let pU = pPrRPr.getElementsByTagName('w:u')[0];
        if (!pU) {
          pU = createWElem('u');
          pPrRPr.appendChild(pU);
        }
        pU.setAttribute('w:val', 'none');

        // Unwrap and remove any <w:hyperlink> wrappers inside firstP that force underline
        const hyperlinks = Array.from(firstP.getElementsByTagName('w:hyperlink'));
        hyperlinks.forEach((h) => {
          while (h.firstChild) {
            firstP.insertBefore(h.firstChild, h);
          }
          if (h.parentNode) {
            h.parentNode.removeChild(h);
          }
        });

        // Preserve existing run properties <w:rPr> from first run if available to retain original font family & font size
        const existingRuns = Array.from(firstP.getElementsByTagName('w:r'));
        let existingRPr: Element | null = null;
        if (existingRuns.length > 0) {
          const rpr = existingRuns[0].getElementsByTagName('w:rPr')[0];
          if (rpr) {
            existingRPr = rpr.cloneNode(true) as Element;
          }
        }

        // Clear ALL existing runs in firstP to prevent duplicate/stale text or linebreaks
        existingRuns.forEach((r) => {
          if (r.parentNode) r.parentNode.removeChild(r);
        });

        const newR = createWElem('r');
        const rPr = existingRPr ? existingRPr : createWElem('rPr');

        const isBold = opts.isBold ?? false;
        const isBlue = opts.isBlue ?? true;
        const isUnderline = opts.isUnderline ?? false;

        // Apply or strip Bold
        if (isBold) {
          if (!rPr.getElementsByTagName('w:b')[0]) {
            rPr.appendChild(createWElem('b'));
          }
          if (!rPr.getElementsByTagName('w:bCs')[0]) {
            rPr.appendChild(createWElem('bCs'));
          }
        } else {
          Array.from(rPr.getElementsByTagName('w:b')).forEach((b) => b.parentNode?.removeChild(b));
          Array.from(rPr.getElementsByTagName('w:bCs')).forEach((b) => b.parentNode?.removeChild(b));
        }

        // Apply Cobalt Pure Blue Color (0000FF)
        if (isBlue) {
          let color = rPr.getElementsByTagName('w:color')[0];
          if (!color) {
            color = createWElem('color');
            rPr.appendChild(color);
          }
          color.setAttribute('w:val', '0000FF');
        } else if (!existingRPr) {
          let color = rPr.getElementsByTagName('w:color')[0];
          if (!color) {
            color = createWElem('color');
            rPr.appendChild(color);
          }
          color.setAttribute('w:val', '000000');
        }

        // Explicitly set w:u w:val="none" so Word never inherits underlines from paragraph/table styles
        let u = rPr.getElementsByTagName('w:u')[0];
        if (!u) {
          u = createWElem('u');
          rPr.appendChild(u);
        }
        if (isUnderline) {
          u.setAttribute('w:val', 'single');
        } else {
          u.setAttribute('w:val', 'none');
        }

        newR.appendChild(rPr);

        const lines = trimmedText
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length > 0) {
          lines.forEach((lineStr, idx) => {
            const t = createWElem('t');
            t.setAttribute('xml:space', 'preserve');
            t.textContent = lineStr;
            newR.appendChild(t);

            if (idx < lines.length - 1) {
              const br = createWElem('br');
              newR.appendChild(br);
            }
          });
        } else {
          const t = createWElem('t');
          t.setAttribute('xml:space', 'preserve');
          t.textContent = '';
          newR.appendChild(t);
        }

        firstP.appendChild(newR);
      };

      // Search & update Date text nodes to current date
      const allTextNodes = Array.from(xmlDoc.getElementsByTagName('w:t'));
      allTextNodes.forEach((t) => {
        if (t.textContent && (t.textContent.includes('Date:') || t.textContent.includes('DATE:'))) {
          t.textContent = `Date: ${currentDateStr}`;
        }
      });

      // Search and update tables
      const tables = Array.from(xmlDoc.getElementsByTagName('w:tbl'));
      tables.forEach((tbl) => {
        const tblText = tbl.textContent || '';
        const rows = Array.from(tbl.getElementsByTagName('w:tr'));

        // Drawings Table (contains ftp/email or Sheet # or Total Count)
        if (
          tblText.includes('ftp/email') ||
          tblText.includes('Sheet #') ||
          tblText.includes('Assembly') ||
          tblText.includes('E-sheets') ||
          tblText.includes('Total Count')
        ) {
          let drawingRowIndex = 0;
          rows.forEach((row) => {
            const rowText = row.textContent || '';
            if (rowText.includes('ftp/email') || rowText.includes('Sheet #')) return; // skip header row

            // Remove fixed/minimum row height constraint from template row so row shrinks snugly
            const trPr = row.getElementsByTagName('w:trPr')[0];
            if (trPr) {
              const trHeights = Array.from(trPr.getElementsByTagName('w:trHeight'));
              trHeights.forEach((th) => th.parentNode?.removeChild(th));
            }

            const cells = Array.from(row.getElementsByTagName('w:tc'));
            if (cells.length >= 3) {
              if (drawingRowIndex === 0) {
                updateCellText(cells[0], 'email', 'center', { isBold: false, isBlue: true, isUnderline: false });
                updateCellText(cells[1], assemblySheetsText, 'top', { isBold: false, isBlue: true, isUnderline: false });
                updateCellText(cells[2], assemblyCountFormatted, 'center', { isBold: false, isBlue: true, isUnderline: false });
              } else if (drawingRowIndex === 1) {
                updateCellText(cells[0], 'email', 'center', { isBold: false, isBlue: true, isUnderline: false });
                updateCellText(cells[1], esheetSheetsText, 'top', { isBold: false, isBlue: true, isUnderline: false });
                updateCellText(cells[2], esheetCountFormatted, 'center', { isBold: false, isBlue: true, isUnderline: false });
              } else if (drawingRowIndex === 2) {
                updateCellText(cells[0], 'email', 'center', { isBold: false, isBlue: true, isUnderline: false });
                updateCellText(cells[1], 'Single part drawings', 'top', { isBold: false, isBlue: true, isUnderline: false });
                updateCellText(cells[2], partCountFormatted, 'center', { isBold: false, isBlue: true, isUnderline: false });
              }
              drawingRowIndex++;
            }
          });
        }

        // Purpose Checkbox Table
        if (
          tblText.includes('Approval') ||
          tblText.includes('Field Use') ||
          tblText.includes('Shop Fabrication') ||
          tblText.includes('For Your Files')
        ) {
          rows.forEach((row) => {
            const cells = Array.from(row.getElementsByTagName('w:tc'));
            if (cells.length >= 2) {
              const purposeLabel = cells[1].textContent?.trim() || '';
              if (purposeLabel) {
                const normSelected = selectedPurpose.toLowerCase().replace(/[^a-z0-9]/g, '');
                const normLabel = purposeLabel.toLowerCase().replace(/[^a-z0-9]/g, '');
                const isChecked = normSelected === normLabel;
                updateCellText(cells[0], isChecked ? 'X' : ' ', 'center', { isBold: true, isBlue: false, isUnderline: false });
              }
            }
          });
        }
      });

      const serializer = new XMLSerializer();
      const updatedXmlStr = serializer.serializeToString(xmlDoc);
      zip.file('word/document.xml', updatedXmlStr);
    }

    return zip.generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  };

  // Update Uploaded Word Transmittal Document Directly
  const handleUpdateUploadedTransmittal = async () => {
    // Rule: If a transmittal is not uploaded, ask the user to upload
    if (!uploadedDocx?.buffer) {
      setShowUploadModal(true);
      return;
    }

    setIsUpdatingDoc(true);

    try {
      const cleanFileName = uploadedDocx.name.replace(/\.docx$/i, '');
      const filename = `${cleanFileName}_Updated.docx`;

      const outBlob = processInPlaceDocxUpdate(uploadedDocx.buffer);

      // Download updated transmittal
      const link = document.createElement('a');
      link.href = URL.createObjectURL(outBlob);
      link.download = filename;
      link.click();

      setIsUpdatingDoc(false);
      incrementMetric('transmittalBuilderRequests');
      setTransmittalsDownloaded((prev) => {
        const next = prev + 1;
        localStorage.setItem('transmittals_downloaded_count', String(next));
        return next;
      });
    } catch (err) {
      console.error(err);
      setIsUpdatingDoc(false);
      alert('Error updating the Word document. Please verify your selected files.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-8">
      {/* Hero Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>5 Dynamic Variable Transmittal Updater</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Transmittal Builder
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Upload your copy of Transmittal (`.docx`) and select files to dynamically update the 5 variables: <code className="text-cyan-300 font-mono font-bold text-xs">{`{ASSEMBLY_SHEETS}`}</code>, <code className="text-teal-300 font-mono font-bold text-xs">{`{E_SHEETS}`}</code>, <code className="text-sky-300 font-mono font-bold text-xs">{`{ASSEMBLY_COUNT}`}</code>, <code className="text-emerald-300 font-mono font-bold text-xs">{`{ESHEET_COUNT}`}</code>, and <code className="text-amber-300 font-mono font-bold text-xs">{`{PART_COUNT}`}</code>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetAll}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/30 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-2 transition shadow-inner cursor-pointer"
              title="Reset all details, uploaded document, and selected files"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Reset All</span>
            </button>
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 shadow-inner">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Updated : <strong className="text-cyan-300 font-mono text-sm">{transmittalsDownloaded}</strong> Documents</span>
            </div>
          </div>
        </div>

        {/* STEP 1: UPLOAD TRANSMITTAL COPY */}
        <div className="bg-slate-950/90 border-2 border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-xl shadow-cyan-500/10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono">
                1
              </span>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Upload Copy of Transmittal Word File (`.docx`)
              </h2>
            </div>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragDocx(true); }}
            onDragLeave={() => setDragDocx(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragDocx(false);
              if (e.dataTransfer.files?.[0]) {
                handleDocxUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => docxInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              uploadedDocx
                ? 'border-emerald-500/80 bg-emerald-950/20'
                : dragDocx
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-slate-700 hover:border-cyan-400 bg-slate-900/60'
            }`}
          >
            {uploadedDocx ? (
              <div className="space-y-1">
                <FileUp className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-emerald-300">
                  Transmittal Uploaded: <span className="font-mono underline">{uploadedDocx.name}</span>
                </p>
                <p className="text-xs text-slate-400">Click or drop to replace with a different Word file</p>
              </div>
            ) : (
              <div className="space-y-1">
                <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto" />
                <p className="text-sm font-bold text-slate-200">Drop Copy of Transmittal (`.docx`) Here</p>
                <p className="text-xs text-slate-400">Or click to select file from your computer</p>
              </div>
            )}
            <input
              type="file"
              ref={docxInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) handleDocxUpload(e.target.files[0]);
              }}
              accept=".docx"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* STEP 2: SELECT FILES */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono">
            2
          </span>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Select Drawing Files</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Select Assembly Drawings */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                  Select Assembly Drawings
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[11px] font-bold">
                  {assemblyFiles.length} File{assemblyFiles.length === 1 ? '' : 's'}
                </span>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragAssembly(true); }}
                onDragLeave={() => setDragAssembly(false)}
                onDrop={(e) => { e.preventDefault(); setDragAssembly(false); handleAddFiles(e.dataTransfer.files, 'assembly'); }}
                onClick={() => fileInputAssemblyRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  dragAssembly ? 'border-sky-400 bg-sky-500/10' : 'border-slate-700/80 hover:border-sky-400 bg-slate-950/60'
                }`}
              >
                <UploadCloud className="w-7 h-7 text-sky-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">Select Assembly Drawings</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Updates {'{ASSEMBLY_SHEETS}'} & {'{ASSEMBLY_COUNT}'}</p>
                <input
                  type="file"
                  ref={fileInputAssemblyRef}
                  onChange={(e) => handleAddFiles(e.target.files, 'assembly')}
                  multiple
                  accept=".pdf,.dwg,.dxf"
                  className="hidden"
                />
              </div>

              {assemblyFiles.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">Extracted Sheets:</div>
                  <p className="text-sky-300 text-[11px] break-words leading-relaxed">{assemblySheetsVal}</p>
                  <div className="text-[10px] text-slate-400 font-sans uppercase font-bold pt-1 border-t border-slate-900">Assembly Count:</div>
                  <p className="text-cyan-300 text-[11px] font-bold">{assemblyCountVal}</p>
                </div>
              )}
            </div>

            {assemblyFiles.length > 0 && (
              <button
                onClick={() => handleClearFiles('assembly')}
                className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1 cursor-pointer transition pt-1 border-t border-slate-800/80"
              >
                <Trash2 className="w-3 h-3" /> Clear Assembly Drawings
              </button>
            )}
          </div>

          {/* Select Erection Drawings */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Select Erection Drawings
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[11px] font-bold">
                  {esheetFiles.length} File{esheetFiles.length === 1 ? '' : 's'}
                </span>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragEsheet(true); }}
                onDragLeave={() => setDragEsheet(false)}
                onDrop={(e) => { e.preventDefault(); setDragEsheet(false); handleAddFiles(e.dataTransfer.files, 'esheet'); }}
                onClick={() => fileInputEsheetRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  dragEsheet ? 'border-teal-400 bg-teal-500/10' : 'border-slate-700/80 hover:border-teal-400 bg-slate-950/60'
                }`}
              >
                <UploadCloud className="w-7 h-7 text-teal-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">Select Erection Drawings</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Updates {'{E_SHEETS}'} & {'{ESHEET_COUNT}'}</p>
                <input
                  type="file"
                  ref={fileInputEsheetRef}
                  onChange={(e) => handleAddFiles(e.target.files, 'esheet')}
                  multiple
                  accept=".pdf,.dwg,.dxf"
                  className="hidden"
                />
              </div>

              {esheetFiles.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">Extracted E-Sheets:</div>
                  <p className="text-teal-300 text-[11px] break-words leading-relaxed">{esheetSheetsVal}</p>
                  <div className="text-[10px] text-slate-400 font-sans uppercase font-bold pt-1 border-t border-slate-900">E-Sheet Count:</div>
                  <p className="text-emerald-300 text-[11px] font-bold">{esheetCountVal}</p>
                </div>
              )}
            </div>

            {esheetFiles.length > 0 && (
              <button
                onClick={() => handleClearFiles('esheet')}
                className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1 cursor-pointer transition pt-1 border-t border-slate-800/80"
              >
                <Trash2 className="w-3 h-3" /> Clear Erection Drawings
              </button>
            )}
          </div>

          {/* Select Part Drawings */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Select Part Drawings
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
                  {partFiles.length} File{partFiles.length === 1 ? '' : 's'}
                </span>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragPart(true); }}
                onDragLeave={() => setDragPart(false)}
                onDrop={(e) => { e.preventDefault(); setDragPart(false); handleAddFiles(e.dataTransfer.files, 'part'); }}
                onClick={() => fileInputPartRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  dragPart ? 'border-amber-400 bg-amber-500/10' : 'border-slate-700/80 hover:border-amber-400 bg-slate-950/60'
                }`}
              >
                <UploadCloud className="w-7 h-7 text-amber-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">Select Part Drawings</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Updates {'{PART_COUNT}'}</p>
                <input
                  type="file"
                  ref={fileInputPartRef}
                  onChange={(e) => handleAddFiles(e.target.files, 'part')}
                  multiple
                  accept=".pdf,.dwg,.dxf"
                  className="hidden"
                />
              </div>

              {partFiles.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">Part Count Row:</div>
                  <p className="text-amber-300 text-[11px] font-bold">{partCountVal}</p>
                </div>
              )}
            </div>

            {partFiles.length > 0 && (
              <button
                onClick={() => handleClearFiles('part')}
                className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1 cursor-pointer transition pt-1 border-t border-slate-800/80"
              >
                <Trash2 className="w-3 h-3" /> Clear Part Drawings
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STEP 3: UPDATE UPLOADED TRANSMITTAL & DOWNLOAD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Transmittal Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Plain Text Summary</span>
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'csv'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV Data</span>
            </button>
          </div>

          {/* PRIMARY ACTION BUTTON: UPDATE UPLOADED TRANSMITTAL */}
          <button
            onClick={handleUpdateUploadedTransmittal}
            disabled={isUpdatingDoc}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isUpdatingDoc ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Update Uploaded Transmittal & Download (.docx)</span>
          </button>
        </div>

        {/* Live Preview exact to user's uploaded document screenshot */}
        {activeTab === 'preview' && (
          <div className="bg-white text-slate-900 rounded-xl p-6 sm:p-8 font-sans text-xs shadow-2xl border border-slate-300 space-y-4 max-w-3xl mx-auto">
            {/* TRANSMITTAL NO Header */}
            <div className="font-bold text-blue-900 text-sm tracking-wide">
              TRANSMITTAL NO: <span className="font-mono text-base">{transmittalNo}</span>
            </div>

            {/* Header Box Table */}
            <div className="border border-slate-900 grid grid-cols-2 divide-x divide-slate-900">
              {/* Left Column */}
              <div className="p-3 space-y-3">
                <div>
                  <div className="text-[10px] text-blue-900 font-bold mb-1">Customer :</div>
                  <div className="font-black text-slate-900 text-base tracking-tight">{companyName}</div>
                  <div className="text-[11px] font-bold text-slate-900 mt-1">{companyAddress}</div>
                  <div className="text-[11px] font-bold text-slate-900">Ph: {companyPhone}</div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <span className="font-bold text-blue-900">Attention: </span>
                  <span className="font-bold text-emerald-700">{attention}</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="p-3 space-y-2">
                <div>
                  <span className="font-bold text-blue-900">Project: </span>
                  <span className="font-bold text-emerald-700">{projectName}</span>
                </div>
                <div>
                  <span className="font-bold text-blue-900">Project Number: </span>
                  <span className="font-bold text-emerald-700 font-mono">{projectNumber}</span>
                </div>
                <div>
                  <span className="font-bold text-blue-900">Location: </span>
                  <span className="font-bold text-emerald-700">{location}</span>
                </div>
                <div className="pt-2 border-t border-slate-900">
                  <span className="font-bold text-blue-900">Date: </span>
                  <span className="font-bold text-emerald-700 font-mono">{transmittalDate}</span>
                </div>
              </div>
            </div>

            {/* Drawings Table */}
            <div className="border border-slate-900">
              <div className="grid grid-cols-12 divide-x divide-slate-900 border-b border-slate-900 font-bold text-[#0000FF] bg-slate-50 p-2 text-[11px]">
                <div className="col-span-2">ftp/email</div>
                <div className="col-span-6">Sheet #</div>
                <div className="col-span-4">Total Count</div>
              </div>

              {/* Row 1: Assembly Drawings */}
              <div className="grid grid-cols-12 divide-x divide-slate-900 border-b border-slate-900 p-2 font-mono text-[11px] items-center">
                <div className="col-span-2 font-normal text-[#0000FF]">{deliveryMethod}</div>
                <div className="col-span-6 font-normal text-[#0000FF] break-words whitespace-pre-line">{assemblySheetsVal}</div>
                <div className="col-span-4 font-normal text-[#0000FF] whitespace-pre-line">{assemblyCountVal}</div>
              </div>

              {/* Row 2: E-sheets Plan/Detail */}
              <div className="grid grid-cols-12 divide-x divide-slate-900 border-b border-slate-900 p-2 font-mono text-[11px] items-center">
                <div className="col-span-2 font-normal text-[#0000FF]">{deliveryMethod}</div>
                <div className="col-span-6 font-normal text-[#0000FF] break-words whitespace-pre-line">{esheetSheetsVal}</div>
                <div className="col-span-4 font-normal text-[#0000FF] whitespace-pre-line">{esheetCountVal}</div>
              </div>

              {/* Row 3: Part Drawings Count */}
              <div className="grid grid-cols-12 divide-x divide-slate-900 p-2 font-mono text-[11px] items-center">
                <div className="col-span-2 font-normal text-[#0000FF]">{deliveryMethod}</div>
                <div className="col-span-6 font-normal text-[#0000FF]">Single part drawings</div>
                <div className="col-span-4 font-normal text-[#0000FF] whitespace-pre-line">{partCountVal}</div>
              </div>
            </div>

            {/* Purpose Checkbox Table */}
            <div className="pt-2">
              <div className="w-56 border border-slate-900 font-sans text-[11px]">
                {PURPOSE_OPTIONS.map((opt) => (
                  <div key={opt} className="grid grid-cols-12 divide-x divide-slate-900 border-b last:border-b-0 border-slate-900 p-1">
                    <div className="col-span-3 text-center font-bold text-slate-900">
                      {selectedPurpose === opt ? 'X' : ''}
                    </div>
                    <div className="col-span-9 pl-2 font-bold text-blue-900">
                      {opt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300">Plain Text Formatted Transmittal</span>
              <button
                onClick={() => handleCopyText(plainTextResult)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              >
                {copiedStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStatus ? 'Copied Text!' : 'Copy Plain Text'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={plainTextResult}
              rows={14}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 focus:outline-none leading-relaxed"
            />
          </div>
        )}

        {activeTab === 'csv' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300">CSV Document Index Data</span>
              <button
                onClick={() => handleCopyText(csvResult)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              >
                {copiedStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStatus ? 'Copied CSV!' : 'Copy CSV Data'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={csvResult}
              rows={10}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 focus:outline-none leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Upload Prompt Modal if user clicks Update before uploading docx */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-white tracking-tight">Transmittal File Required</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Please upload your copy of the Transmittal Word document (<code className="text-cyan-300 font-mono font-bold">.docx</code>) in Step 1 first.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  docxInputRef.current?.click();
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Transmittal (.docx) Now</span>
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
