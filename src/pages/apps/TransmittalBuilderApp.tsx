import React, { useState, useRef, useMemo } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  Copy,
  Check,
  Trash2,
  Download,
  Zap,
  Calendar,
  Layers,
  Settings2,
  FileCheck,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  RefreshCw,
  FolderOpen,
  FileUp,
} from 'lucide-react';
import { useActivityMetrics, incrementMetric } from '../../utils/activityMetrics';
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
  AlignmentType,
  HeadingLevel,
} from 'docx';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

interface ProcessedFileItem {
  id: string;
  originalName: string;
  displayName: string;
  sizeFormatted: string;
  lastModifiedFormatted: string;
  fileObj: File;
}

function getFormattedDateMMDDYYYY(d: Date = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export const TransmittalBuilderApp: React.FC = () => {
  const { navigate } = useNavigation();
  const { metrics } = useActivityMetrics();

  // Header Details
  const [projectName, setProjectName] = useState<string>('Skyline Tower Commercial Center');
  const [transmittalNo, setTransmittalNo] = useState<string>('TR-2026-084');
  const [sender, setSender] = useState<string>('BuildSmith Construction Corp');
  const [recipient, setRecipient] = useState<string>('Apex Structural & Civil Engineers');
  const [purpose, setPurpose] = useState<string>('For Approval & Review');
  const [transmittalDate, setTransmittalDate] = useState<string>(() => getFormattedDateMMDDYYYY());

  // Section List Titles
  const [list1Title, setList1Title] = useState<string>('Section A: Architectural & Primary Drawings');
  const [list2Title, setList2Title] = useState<string>('Section B: Engineering Specs & Calculations');
  const [list3Title, setList3Title] = useState<string>('Section C: Submittals, Permits & Supporting Docs');

  // 3 PDF File Lists
  const [list1Files, setList1Files] = useState<File[]>([]);
  const [list2Files, setList2Files] = useState<File[]>([]);
  const [list3Files, setList3Files] = useState<File[]>([]);

  // Processing Options
  const [includeExtensions, setIncludeExtensions] = useState<boolean>(false);
  const [stripUnderscoresDashes, setStripUnderscoresDashes] = useState<boolean>(true);
  const [itemPrefix, setItemPrefix] = useState<'numbers' | 'bullet' | 'none'>('numbers');
  const [sortOption, setSortOption] = useState<'natural' | 'alpha' | 'date'>('natural');

  // Custom Word Template
  const [customDocx, setCustomDocx] = useState<{ name: string; buffer: ArrayBuffer } | null>(null);
  const [templateStatus, setTemplateStatus] = useState<string>('');

  // Dropzone drag states
  const [dragActive1, setDragActive1] = useState<boolean>(false);
  const [dragActive2, setDragActive2] = useState<boolean>(false);
  const [dragActive3, setDragActive3] = useState<boolean>(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'docx' | 'text' | 'csv'>('docx');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [isBuildingDoc, setIsBuildingDoc] = useState<boolean>(false);

  const fileInputRef1 = useRef<HTMLInputElement | null>(null);
  const fileInputRef2 = useRef<HTMLInputElement | null>(null);
  const fileInputRef3 = useRef<HTMLInputElement | null>(null);
  const templateInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to process filename list
  const processFiles = (files: File[]): ProcessedFileItem[] => {
    let list = files.map((f) => {
      let name = f.name;
      if (!includeExtensions) {
        name = name.replace(/\.[^/.]+$/, '');
      }
      if (stripUnderscoresDashes) {
        name = name.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
      }

      const modDate = new Date(f.lastModified);
      return {
        id: Math.random().toString(36).substring(2, 9),
        originalName: f.name,
        displayName: name,
        sizeFormatted: formatBytes(f.size),
        lastModifiedFormatted: getFormattedDateMMDDYYYY(modDate),
        fileObj: f,
      };
    });

    if (sortOption === 'natural') {
      list.sort((a, b) =>
        a.displayName.localeCompare(b.displayName, undefined, { numeric: true, sensitivity: 'base' })
      );
    } else if (sortOption === 'alpha') {
      list.sort((a, b) => a.displayName.localeCompare(b.displayName));
    } else if (sortOption === 'date') {
      list.sort((a, b) => b.fileObj.lastModified - a.fileObj.lastModified);
    }

    return list;
  };

  const processedList1 = useMemo(() => processFiles(list1Files), [list1Files, includeExtensions, stripUnderscoresDashes, sortOption]);
  const processedList2 = useMemo(() => processFiles(list2Files), [list2Files, includeExtensions, stripUnderscoresDashes, sortOption]);
  const processedList3 = useMemo(() => processFiles(list3Files), [list3Files, includeExtensions, stripUnderscoresDashes, sortOption]);

  const totalFileCount = processedList1.length + processedList2.length + processedList3.length;

  // File Handlers
  const handleAddFiles = (selectedFiles: FileList | null, targetList: 1 | 2 | 3) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const added = Array.from(selectedFiles);
    if (targetList === 1) setList1Files((prev) => [...prev, ...added]);
    if (targetList === 2) setList2Files((prev) => [...prev, ...added]);
    if (targetList === 3) setList3Files((prev) => [...prev, ...added]);
    incrementMetric('transmittalBuilderRequests', added.length);
  };

  const handleRemoveFile = (index: number, targetList: 1 | 2 | 3) => {
    if (targetList === 1) setList1Files((prev) => prev.filter((_, i) => i !== index));
    if (targetList === 2) setList2Files((prev) => prev.filter((_, i) => i !== index));
    if (targetList === 3) setList3Files((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearList = (targetList: 1 | 2 | 3) => {
    if (targetList === 1) setList1Files([]);
    if (targetList === 2) setList2Files([]);
    if (targetList === 3) setList3Files([]);
  };

  // Custom Template Upload
  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomDocx({
          name: file.name,
          buffer: event.target.result as ArrayBuffer,
        });
        setTemplateStatus(`Custom template "${file.name}" loaded successfully! Placeholders like {{DATE}}, {{PROJECT_NAME}}, {{LIST_1}}, {{LIST_2}}, {{LIST_3}} will be populated.`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Format Plain Text Transmittal Report
  const plainTextResult = useMemo(() => {
    let out = `========================================================\n`;
    out += `         BUILDSMITH DOCUMENT SUBMITTAL TRANSMITTAL\n`;
    out += `========================================================\n`;
    out += `DATE:             ${transmittalDate}\n`;
    out += `PROJECT NAME:     ${projectName}\n`;
    out += `TRANSMITTAL NO:   ${transmittalNo}\n`;
    out += `FROM (SENDER):    ${sender}\n`;
    out += `TO (RECIPIENT):   ${recipient}\n`;
    out += `SUBMITTAL PURPOSE: ${purpose}\n`;
    out += `TOTAL DOCUMENTS:  ${totalFileCount} File(s)\n`;
    out += `========================================================\n\n`;

    const formatSection = (title: string, list: ProcessedFileItem[]) => {
      let sec = `--- ${title.toUpperCase()} (${list.length} File${list.length === 1 ? '' : 's'}) ---\n`;
      if (list.length === 0) {
        sec += `  (No documents attached)\n\n`;
        return sec;
      }
      list.forEach((item, idx) => {
        const prefixStr = itemPrefix === 'numbers' ? `${idx + 1}. ` : itemPrefix === 'bullet' ? `• ` : `  `;
        sec += `  ${prefixStr}${item.displayName}  [Date: ${item.lastModifiedFormatted} | Size: ${item.sizeFormatted}]\n`;
      });
      sec += `\n`;
      return sec;
    };

    out += formatSection(list1Title, processedList1);
    out += formatSection(list2Title, processedList2);
    out += formatSection(list3Title, processedList3);

    out += `========================================================\n`;
    out += `REMARKS: Submitted via BuildSmith Transmittal Builder Engine\n`;
    out += `SIGNATURE: ___________________________ DATE: ${transmittalDate}\n`;
    return out;
  }, [
    transmittalDate,
    projectName,
    transmittalNo,
    sender,
    recipient,
    purpose,
    totalFileCount,
    list1Title,
    list2Title,
    list3Title,
    processedList1,
    processedList2,
    processedList3,
    itemPrefix,
  ]);

  // Format CSV Report
  const csvResult = useMemo(() => {
    let out = `Section,Item No,Document Title,Original Filename,Date Modified,File Size\n`;
    const addListToCsv = (sectionLabel: string, list: ProcessedFileItem[]) => {
      list.forEach((item, idx) => {
        const cleanTitle = `"${item.displayName.replace(/"/g, '""')}"`;
        const cleanOrig = `"${item.originalName.replace(/"/g, '""')}"`;
        out += `"${sectionLabel}",${idx + 1},${cleanTitle},${cleanOrig},${item.lastModifiedFormatted},"${item.sizeFormatted}"\n`;
      });
    };
    addListToCsv(list1Title, processedList1);
    addListToCsv(list2Title, processedList2);
    addListToCsv(list3Title, processedList3);
    return out;
  }, [list1Title, list2Title, list3Title, processedList1, processedList2, processedList3]);

  // Copy to Clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    });
  };

  // Generate & Download Word Document (.docx)
  const handleGenerateWordDoc = async () => {
    setIsBuildingDoc(true);

    try {
      // IF CUSTOM TEMPLATE IS LOADED: use docxtemplater
      if (customDocx) {
        const zip = new PizZip(customDocx.buffer);
        const docTemplater = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });

        // Set Template Data
        docTemplater.setData({
          DATE: transmittalDate,
          date: transmittalDate,
          PROJECT_NAME: projectName,
          project_name: projectName,
          TRANSMITTAL_NO: transmittalNo,
          transmittal_no: transmittalNo,
          SENDER: sender,
          sender: sender,
          RECIPIENT: recipient,
          recipient: recipient,
          PURPOSE: purpose,
          purpose: purpose,
          TOTAL_COUNT: totalFileCount,
          LIST_1_TITLE: list1Title,
          LIST_2_TITLE: list2Title,
          LIST_3_TITLE: list3Title,
          LIST_1: processedList1.map((f, i) => `${i + 1}. ${f.displayName}`).join('\n'),
          LIST_2: processedList2.map((f, i) => `${i + 1}. ${f.displayName}`).join('\n'),
          LIST_3: processedList3.map((f, i) => `${i + 1}. ${f.displayName}`).join('\n'),
          list1_files: processedList1.map((f, i) => ({ num: i + 1, name: f.displayName, size: f.sizeFormatted, date: f.lastModifiedFormatted })),
          list2_files: processedList2.map((f, i) => ({ num: i + 1, name: f.displayName, size: f.sizeFormatted, date: f.lastModifiedFormatted })),
          list3_files: processedList3.map((f, i) => ({ num: i + 1, name: f.displayName, size: f.sizeFormatted, date: f.lastModifiedFormatted })),
        });

        docTemplater.render();
        const outBlob = docTemplater.getZip().generate({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(outBlob);
        link.download = `Transmittal_${transmittalNo.replace(/\s+/g, '_')}_${transmittalDate}.docx`;
        link.click();
        setIsBuildingDoc(false);
        incrementMetric('transmittalBuilderRequests');
        return;
      }

      // ELSE: Build standard professional Word document with docx library
      const buildSectionTable = (title: string, items: ProcessedFileItem[]) => {
        const rows: TableRow[] = [
          // Table Header
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                width: { size: 10, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: '#', bold: true, color: 'FFFFFF', size: 20 })] })],
                shading: { fill: '0F172A' },
              }),
              new TableCell({
                width: { size: 55, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: 'Document / Drawing Title', bold: true, color: 'FFFFFF', size: 20 })] })],
                shading: { fill: '0F172A' },
              }),
              new TableCell({
                width: { size: 18, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: 'Date Modified', bold: true, color: 'FFFFFF', size: 20 })] })],
                shading: { fill: '0F172A' },
              }),
              new TableCell({
                width: { size: 17, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: 'File Size', bold: true, color: 'FFFFFF', size: 20 })] })],
                shading: { fill: '0F172A' },
              }),
            ],
          }),
        ];

        if (items.length === 0) {
          rows.push(
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 4,
                  children: [new Paragraph({ children: [new TextRun({ text: 'No documents attached in this section.', italics: true, color: '64748B', size: 18 })] })],
                }),
              ],
            })
          );
        } else {
          items.forEach((item, index) => {
            rows.push(
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: String(index + 1), size: 18, bold: true })] })],
                    shading: { fill: index % 2 === 0 ? 'F8FAFC' : 'FFFFFF' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: item.displayName, size: 18, bold: true, color: '1E293B' })] })],
                    shading: { fill: index % 2 === 0 ? 'F8FAFC' : 'FFFFFF' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: item.lastModifiedFormatted, size: 18, color: '475569' })] })],
                    shading: { fill: index % 2 === 0 ? 'F8FAFC' : 'FFFFFF' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: item.sizeFormatted, size: 18, color: '475569' })] })],
                    shading: { fill: index % 2 === 0 ? 'F8FAFC' : 'FFFFFF' },
                  }),
                ],
              })
            );
          });
        }

        return [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows,
          }),
        ];
      };

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Header Title Banner
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'DOCUMENT SUBMITTAL TRANSMITTAL',
                    bold: true,
                    size: 32,
                    color: '0284C7',
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              }),

              // Transmittal Metadata Table
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                  left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                  right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: 'DATE:', bold: true, size: 20, color: '0284C7' }), new TextRun({ text: ` ${transmittalDate}`, size: 20 })] })],
                        shading: { fill: 'F1F5F9' },
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: 'TRANSMITTAL #:', bold: true, size: 20, color: '0284C7' }), new TextRun({ text: ` ${transmittalNo}`, size: 20, bold: true })] })],
                        shading: { fill: 'F1F5F9' },
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: 'PROJECT:', bold: true, size: 20 }), new TextRun({ text: ` ${projectName}`, size: 20 })] })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: 'PURPOSE:', bold: true, size: 20 }), new TextRun({ text: ` ${purpose}`, size: 20 })] })],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: 'FROM (SENDER):', bold: true, size: 20 }), new TextRun({ text: ` ${sender}`, size: 20 })] })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: 'TO (RECIPIENT):', bold: true, size: 20 }), new TextRun({ text: ` ${recipient}`, size: 20 })] })],
                      }),
                    ],
                  }),
                ],
              }),

              new Paragraph({ text: '', spacing: { before: 200 } }),

              // Section A Table
              ...buildSectionTable(list1Title, processedList1),

              // Section B Table
              ...buildSectionTable(list2Title, processedList2),

              // Section C Table
              ...buildSectionTable(list3Title, processedList3),

              // Remarks & Sign-off Section
              new Paragraph({
                text: 'REMARKS & SIGN-OFF',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 120 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'The above items are transmitted as indicated. Please acknowledge receipt and advise immediately if any discrepancies exist.',
                    italics: true,
                    size: 18,
                    color: '475569',
                  }),
                ],
                spacing: { after: 240 },
              }),

              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: 'SUBMITTED BY: ___________________________', size: 20 })] })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: `DATE: ${transmittalDate}`, size: 20 })] })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Transmittal_${transmittalNo.replace(/\s+/g, '_')}_${transmittalDate}.docx`;
      link.click();
      setIsBuildingDoc(false);
      incrementMetric('transmittalBuilderRequests');
    } catch (err) {
      console.error(err);
      setIsBuildingDoc(false);
      alert('Error building Word document. Please verify inputs.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-8">
      {/* Navigation */}
      <nav>
        <button
          onClick={() => navigate('apps')}
          className="text-sky-400 hover:underline inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Apps Hub
        </button>
      </nav>

      {/* Hero Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Advanced Document Submittal Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Transmittal Builder
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Populate Word templates (`.docx`) with 3 distinct PDF file dropzones. Automatically attaches current date in <strong className="text-cyan-300 font-mono">MM-DD-YYYY</strong> format and formats submittal tables.
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 shadow-inner">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Processed: <strong className="text-cyan-300 font-mono text-sm">{metrics.transmittalBuilderRequests}</strong> Transmittals</span>
          </div>
        </div>

        {/* Transmittal Header Fields Form */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Transmittal Header Details</span>
            </h2>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 text-xs font-mono font-bold">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Date: {transmittalDate}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Transmittal # / ID</label>
              <input
                type="text"
                value={transmittalNo}
                onChange={(e) => setTransmittalNo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Date (MM-DD-YYYY)</label>
              <input
                type="text"
                value={transmittalDate}
                onChange={(e) => setTransmittalDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">From (Sender)</label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">To (Recipient)</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Submittal Purpose</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Word Template File Option */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <FileUp className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-medium">Custom Word Template (`.docx`):</span>
              <span className="text-slate-500 italic">{customDocx ? customDocx.name : 'Using Built-in Transmittal Template'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => templateInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold cursor-pointer transition flex items-center gap-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                <span>{customDocx ? 'Change Template' : 'Upload Template'}</span>
              </button>
              {customDocx && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomDocx(null);
                    setTemplateStatus('');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 cursor-pointer transition"
                  title="Reset to Built-in Template"
                >
                  Reset
                </button>
              )}
              <input
                type="file"
                ref={templateInputRef}
                onChange={handleTemplateUpload}
                accept=".docx"
                className="hidden"
              />
            </div>
          </div>
          {templateStatus && <p className="text-[11px] text-emerald-400 italic">{templateStatus}</p>}
        </div>
      </div>

      {/* 3 PDF Dropzones */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>3 Section PDF Dropzones ({totalFileCount} Total Files)</span>
          </h2>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Settings2 className="w-4 h-4 text-slate-500" />
            <span>Options:</span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={stripUnderscoresDashes}
                onChange={(e) => setStripUnderscoresDashes(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
              />
              <span>Clean Names</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-300 ml-2">
              <input
                type="checkbox"
                checked={includeExtensions}
                onChange={(e) => setIncludeExtensions(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
              />
              <span>Keep .pdf</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dropzone 1: Section A */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <input
                  type="text"
                  value={list1Title}
                  onChange={(e) => setList1Title(e.target.value)}
                  className="bg-transparent text-xs font-bold text-sky-300 w-full focus:outline-none border-b border-dashed border-slate-700 focus:border-sky-400"
                  title="Click to rename Section 1"
                />
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold shrink-0">
                  {processedList1.length} Files
                </span>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive1(true); }}
                onDragLeave={() => setDragActive1(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive1(false); handleAddFiles(e.dataTransfer.files, 1); }}
                onClick={() => fileInputRef1.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  dragActive1 ? 'border-sky-400 bg-sky-500/10' : 'border-slate-700/80 hover:border-sky-400 bg-slate-950/60'
                }`}
              >
                <UploadCloud className="w-7 h-7 text-sky-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">Drop Section 1 PDFs Here</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Click or drag architectural files</p>
                <input
                  type="file"
                  ref={fileInputRef1}
                  onChange={(e) => handleAddFiles(e.target.files, 1)}
                  multiple
                  accept=".pdf"
                  className="hidden"
                />
              </div>

              {/* List 1 Itemized View */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {processedList1.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-200 group">
                    <span className="truncate flex-1 font-mono text-[11px]">{idx + 1}. {item.displayName}</span>
                    <button
                      onClick={() => handleRemoveFile(idx, 1)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 opacity-60 group-hover:opacity-100 transition cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {list1Files.length > 0 && (
              <button
                onClick={() => handleClearList(1)}
                className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1 cursor-pointer transition pt-1 border-t border-slate-800/80"
              >
                <Trash2 className="w-3 h-3" /> Clear Section 1
              </button>
            )}
          </div>

          {/* Dropzone 2: Section B */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <input
                  type="text"
                  value={list2Title}
                  onChange={(e) => setList2Title(e.target.value)}
                  className="bg-transparent text-xs font-bold text-teal-300 w-full focus:outline-none border-b border-dashed border-slate-700 focus:border-teal-400"
                  title="Click to rename Section 2"
                />
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[10px] font-bold shrink-0">
                  {processedList2.length} Files
                </span>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive2(true); }}
                onDragLeave={() => setDragActive2(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive2(false); handleAddFiles(e.dataTransfer.files, 2); }}
                onClick={() => fileInputRef2.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  dragActive2 ? 'border-teal-400 bg-teal-500/10' : 'border-slate-700/80 hover:border-teal-400 bg-slate-950/60'
                }`}
              >
                <UploadCloud className="w-7 h-7 text-teal-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">Drop Section 2 PDFs Here</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Click or drag engineering specs</p>
                <input
                  type="file"
                  ref={fileInputRef2}
                  onChange={(e) => handleAddFiles(e.target.files, 2)}
                  multiple
                  accept=".pdf"
                  className="hidden"
                />
              </div>

              {/* List 2 Itemized View */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {processedList2.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-200 group">
                    <span className="truncate flex-1 font-mono text-[11px]">{idx + 1}. {item.displayName}</span>
                    <button
                      onClick={() => handleRemoveFile(idx, 2)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 opacity-60 group-hover:opacity-100 transition cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {list2Files.length > 0 && (
              <button
                onClick={() => handleClearList(2)}
                className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1 cursor-pointer transition pt-1 border-t border-slate-800/80"
              >
                <Trash2 className="w-3 h-3" /> Clear Section 2
              </button>
            )}
          </div>

          {/* Dropzone 3: Section C */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <input
                  type="text"
                  value={list3Title}
                  onChange={(e) => setList3Title(e.target.value)}
                  className="bg-transparent text-xs font-bold text-amber-300 w-full focus:outline-none border-b border-dashed border-slate-700 focus:border-amber-400"
                  title="Click to rename Section 3"
                />
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold shrink-0">
                  {processedList3.length} Files
                </span>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive3(true); }}
                onDragLeave={() => setDragActive3(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive3(false); handleAddFiles(e.dataTransfer.files, 3); }}
                onClick={() => fileInputRef3.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  dragActive3 ? 'border-amber-400 bg-amber-500/10' : 'border-slate-700/80 hover:border-amber-400 bg-slate-950/60'
                }`}
              >
                <UploadCloud className="w-7 h-7 text-amber-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">Drop Section 3 PDFs Here</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Click or drag submittals/permits</p>
                <input
                  type="file"
                  ref={fileInputRef3}
                  onChange={(e) => handleAddFiles(e.target.files, 3)}
                  multiple
                  accept=".pdf"
                  className="hidden"
                />
              </div>

              {/* List 3 Itemized View */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {processedList3.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-200 group">
                    <span className="truncate flex-1 font-mono text-[11px]">{idx + 1}. {item.displayName}</span>
                    <button
                      onClick={() => handleRemoveFile(idx, 3)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 opacity-60 group-hover:opacity-100 transition cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {list3Files.length > 0 && (
              <button
                onClick={() => handleClearList(3)}
                className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1 cursor-pointer transition pt-1 border-t border-slate-800/80"
              >
                <Trash2 className="w-3 h-3" /> Clear Section 3
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview & Output Actions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('docx')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'docx'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Word Doc View</span>
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
              <span>Plain Text Report</span>
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

          {/* Primary Action Button */}
          <button
            onClick={handleGenerateWordDoc}
            disabled={isBuildingDoc}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isBuildingDoc ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Build & Download Transmittal (.docx)</span>
          </button>
        </div>

        {/* Tab Content Preview */}
        {activeTab === 'docx' && (
          <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-6 space-y-6 text-xs text-slate-300 shadow-inner">
            <div className="text-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-extrabold text-cyan-300 tracking-tight">DOCUMENT SUBMITTAL TRANSMITTAL</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Automated Word Template Layout Preview</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 font-mono text-[11px]">
              <div><strong className="text-cyan-400">Date:</strong> {transmittalDate}</div>
              <div><strong className="text-cyan-400">Transmittal #:</strong> {transmittalNo}</div>
              <div><strong className="text-cyan-400">Purpose:</strong> {purpose}</div>
              <div><strong className="text-slate-400">Project:</strong> {projectName}</div>
              <div><strong className="text-slate-400">From:</strong> {sender}</div>
              <div><strong className="text-slate-400">To:</strong> {recipient}</div>
            </div>

            {/* List 1 Table Preview */}
            <div className="space-y-2">
              <h4 className="font-bold text-sky-300 text-xs flex items-center justify-between">
                <span>{list1Title}</span>
                <span className="text-[10px] text-slate-500 font-mono">{processedList1.length} Items</span>
              </h4>
              {processedList1.length === 0 ? (
                <p className="text-slate-500 italic p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">No files dropped in Section 1</p>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 font-mono">
                      <tr>
                        <th className="p-2 w-10 text-center">#</th>
                        <th className="p-2">Document / Drawing Title</th>
                        <th className="p-2">Date Modified</th>
                        <th className="p-2 text-right">Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {processedList1.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-900/40">
                          <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                          <td className="p-2 font-semibold text-slate-200">{item.displayName}</td>
                          <td className="p-2 text-slate-400">{item.lastModifiedFormatted}</td>
                          <td className="p-2 text-right text-slate-400">{item.sizeFormatted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* List 2 Table Preview */}
            <div className="space-y-2">
              <h4 className="font-bold text-teal-300 text-xs flex items-center justify-between">
                <span>{list2Title}</span>
                <span className="text-[10px] text-slate-500 font-mono">{processedList2.length} Items</span>
              </h4>
              {processedList2.length === 0 ? (
                <p className="text-slate-500 italic p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">No files dropped in Section 2</p>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 font-mono">
                      <tr>
                        <th className="p-2 w-10 text-center">#</th>
                        <th className="p-2">Document / Drawing Title</th>
                        <th className="p-2">Date Modified</th>
                        <th className="p-2 text-right">Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {processedList2.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-900/40">
                          <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                          <td className="p-2 font-semibold text-slate-200">{item.displayName}</td>
                          <td className="p-2 text-slate-400">{item.lastModifiedFormatted}</td>
                          <td className="p-2 text-right text-slate-400">{item.sizeFormatted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* List 3 Table Preview */}
            <div className="space-y-2">
              <h4 className="font-bold text-amber-300 text-xs flex items-center justify-between">
                <span>{list3Title}</span>
                <span className="text-[10px] text-slate-500 font-mono">{processedList3.length} Items</span>
              </h4>
              {processedList3.length === 0 ? (
                <p className="text-slate-500 italic p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">No files dropped in Section 3</p>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 font-mono">
                      <tr>
                        <th className="p-2 w-10 text-center">#</th>
                        <th className="p-2">Document / Drawing Title</th>
                        <th className="p-2">Date Modified</th>
                        <th className="p-2 text-right">Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {processedList3.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-900/40">
                          <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                          <td className="p-2 font-semibold text-slate-200">{item.displayName}</td>
                          <td className="p-2 text-slate-400">{item.lastModifiedFormatted}</td>
                          <td className="p-2 text-right text-slate-400">{item.sizeFormatted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300">Plain Text Formatted Transmittal</span>
              <button
                onClick={() => handleCopy(plainTextResult)}
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
                onClick={() => handleCopy(csvResult)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              >
                {copiedStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStatus ? 'Copied CSV!' : 'Copy CSV Data'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={csvResult}
              rows={12}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 focus:outline-none leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
};
