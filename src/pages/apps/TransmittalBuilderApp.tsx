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
  FileCheck,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  RefreshCw,
  FileUp,
  Building2,
  FileDown,
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
} from 'docx';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

function getFormattedDate(d: Date = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export const TransmittalBuilderApp: React.FC = () => {
  const { navigate } = useNavigation();
  const { metrics } = useActivityMetrics();

  // Uploaded Word Document State
  const [uploadedDocx, setUploadedDocx] = useState<{ name: string; buffer: ArrayBuffer } | null>(null);
  const [dragDocx, setDragDocx] = useState<boolean>(false);

  // Transmittal Number & Core Fields
  const [transmittalNo, setTransmittalNo] = useState<string>('01');
  const [transmittalDate, setTransmittalDate] = useState<string>(() => getFormattedDate());

  // Additional Transmittal Header Details
  const [companyName, setCompanyName] = useState<string>('LIBERTY STEEL FABRICATION, INC.');
  const [companyAddress, setCompanyAddress] = useState<string>('1861 Main Street, Fyffe, AL 35971');
  const [companyPhone, setCompanyPhone] = useState<string>('256-623-3028');
  
  const [projectName, setProjectName] = useState<string>("DAVE & BUSTER's");
  const [projectNumber, setProjectNumber] = useState<string>('4025');
  const [attention, setAttention] = useState<string>('Steven Mitchell');
  const [location, setLocation] = useState<string>('1221 S. Belt Line Road, Suite 500, Coppell, TX 75019');
  const [deliveryMethod, setDeliveryMethod] = useState<string>('email');

  // Submittal Purpose Checkbox
  const [selectedPurpose, setSelectedPurpose] = useState<string>('Approval');
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

  // 3 Drawing File Selections
  // 1st: Assembly Drawings
  const [assemblyFiles, setAssemblyFiles] = useState<File[]>([]);
  // 2nd: E-sheets Plan/Detail
  const [esheetFiles, setEsheetFiles] = useState<File[]>([]);
  // 3rd: Part Drawings Count Only
  const [partFiles, setPartFiles] = useState<File[]>([]);

  // Drag States
  const [dragAssembly, setDragAssembly] = useState<boolean>(false);
  const [dragEsheet, setDragEsheet] = useState<boolean>(false);
  const [dragPart, setDragPart] = useState<boolean>(false);

  const docxInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputAssemblyRef = useRef<HTMLInputElement | null>(null);
  const fileInputEsheetRef = useRef<HTMLInputElement | null>(null);
  const fileInputPartRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'preview' | 'text' | 'csv'>('preview');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [isUpdatingDoc, setIsUpdatingDoc] = useState<boolean>(false);

  // Extract sheet details from uploaded files
  const extractSheetDetails = (files: File[]): string => {
    if (files.length === 0) return 'None Selected';
    return files
      .map((f) => f.name.replace(/\.[^/.]+$/, ''))
      .join(', ');
  };

  const assemblyDetailsStr = useMemo(() => extractSheetDetails(assemblyFiles), [assemblyFiles]);
  const esheetDetailsStr = useMemo(() => extractSheetDetails(esheetFiles), [esheetFiles]);
  const partDetailsStr = useMemo(() => extractSheetDetails(partFiles), [partFiles]);

  const assemblyCountStr = useMemo(() => {
    const cnt = String(assemblyFiles.length).padStart(2, '0');
    return `${cnt}-Assembly Drawing`;
  }, [assemblyFiles]);

  const esheetCountStr = useMemo(() => {
    const cnt = String(esheetFiles.length).padStart(2, '0');
    return `${cnt}- E-sheets Plan/Detail`;
  }, [esheetFiles]);

  const partCountStr = useMemo(() => {
    const cnt = String(partFiles.length).padStart(2, '0');
    return `${cnt}- Part Drawings`;
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
    out += `${deliveryMethod} | ${assemblyFiles.length > 0 ? assemblyDetailsStr : 'None Selected'} | ${assemblyCountStr}\n`;
    out += `${deliveryMethod} | ${esheetFiles.length > 0 ? esheetDetailsStr : 'None Selected'} | ${esheetCountStr}\n`;
    out += `${deliveryMethod} | ${partFiles.length > 0 ? partDetailsStr : 'Part Drawings Submittal'} | ${partCountStr}\n`;
    out += `========================================================\n`;
    out += `PURPOSE: [X] ${selectedPurpose}\n`;
    return out;
  }, [
    transmittalNo,
    companyName,
    companyAddress,
    companyPhone,
    projectName,
    projectNumber,
    attention,
    location,
    transmittalDate,
    deliveryMethod,
    assemblyFiles.length,
    assemblyDetailsStr,
    assemblyCountStr,
    esheetFiles.length,
    esheetDetailsStr,
    esheetCountStr,
    partFiles.length,
    partDetailsStr,
    partCountStr,
    selectedPurpose,
  ]);

  // CSV Summary
  const csvResult = useMemo(() => {
    let out = `Transmittal No,Customer,Project,Project Number,Attention,Location,Date,Category,Delivery Method,Sheet Details,Total Count\n`;
    const cleanStr = (s: string) => `"${s.replace(/"/g, '""')}"`;
    out += `${cleanStr(transmittalNo)},${cleanStr(companyName)},${cleanStr(projectName)},${cleanStr(projectNumber)},${cleanStr(attention)},${cleanStr(location)},${cleanStr(transmittalDate)},"Assembly Drawing",${cleanStr(deliveryMethod)},${cleanStr(assemblyDetailsStr)},${cleanStr(assemblyCountStr)}\n`;
    out += `${cleanStr(transmittalNo)},${cleanStr(companyName)},${cleanStr(projectName)},${cleanStr(projectNumber)},${cleanStr(attention)},${cleanStr(location)},${cleanStr(transmittalDate)},"E-sheets Plan/Detail",${cleanStr(deliveryMethod)},${cleanStr(esheetDetailsStr)},${cleanStr(esheetCountStr)}\n`;
    out += `${cleanStr(transmittalNo)},${cleanStr(companyName)},${cleanStr(projectName)},${cleanStr(projectNumber)},${cleanStr(attention)},${cleanStr(location)},${cleanStr(transmittalDate)},"Part Drawings",${cleanStr(deliveryMethod)},${cleanStr(partDetailsStr)},${cleanStr(partCountStr)}\n`;
    return out;
  }, [
    transmittalNo,
    companyName,
    projectName,
    projectNumber,
    attention,
    location,
    transmittalDate,
    deliveryMethod,
    assemblyDetailsStr,
    assemblyCountStr,
    esheetDetailsStr,
    esheetCountStr,
    partDetailsStr,
    partCountStr,
  ]);

  const handleCopyText = (txt: string) => {
    navigator.clipboard.writeText(txt).then(() => {
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    });
  };

  // Generate Exact Liberty Steel Sample Transmittal Word Document (.docx)
  const handleDownloadSampleTemplate = async () => {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 720, bottom: 720, left: 720, right: 720 },
              },
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'TRANSMITTAL NO: {TRANSMITTAL_NO}',
                    bold: true,
                    size: 24,
                    color: '1E3A8A',
                  }),
                ],
                spacing: { after: 120 },
              }),

              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
                  bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
                  left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
                  right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({ children: [new TextRun({ text: 'Customer:', size: 18, color: '1E3A8A', underline: {} })] }),
                          new Paragraph({ children: [new TextRun({ text: 'LIBERTY STEEL FABRICATION, INC.', bold: true, size: 22, color: '1E293B' })], spacing: { before: 80 } }),
                          new Paragraph({ children: [new TextRun({ text: '1861 Main Street, Fyffe, AL 35971', bold: true, size: 18, color: '0F172A' })], spacing: { before: 60 } }),
                          new Paragraph({ children: [new TextRun({ text: 'Ph: 256-623-3028', bold: true, size: 18, color: '0F172A' })], spacing: { before: 60 } }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: 'Project: ', bold: true, size: 20, color: '1E3A8A' }),
                              new TextRun({ text: '{PROJECT_NAME}', bold: true, size: 20, color: '16A34A' }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),

                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: 'Attention: ', bold: true, size: 20, color: '1E3A8A' }),
                              new TextRun({ text: '{ATTENTION}', bold: true, size: 20, color: '16A34A' }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: 'Project Number: ', bold: true, size: 20, color: '1E3A8A' }),
                              new TextRun({ text: '{PROJECT_NO}', bold: true, size: 20, color: '16A34A' }),
                            ],
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({ text: 'Location: ', bold: true, size: 20, color: '1E3A8A' }),
                              new TextRun({ text: '{LOCATION}', bold: true, size: 20, color: '16A34A' }),
                            ],
                            spacing: { before: 80 },
                          }),
                        ],
                      }),
                    ],
                  }),

                  new TableRow({
                    children: [
                      new TableCell({
                        columnSpan: 2,
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: 'Date:   ', bold: true, size: 20, color: '1E3A8A' }),
                              new TextRun({ text: '{DATE}', bold: true, size: 20, color: '16A34A' }),
                            ],
                            alignment: AlignmentType.RIGHT,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              new Paragraph({ text: '', spacing: { before: 200 } }),

              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
                  bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
                  left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
                  right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                },
                rows: [
                  new TableRow({
                    tableHeader: true,
                    children: [
                      new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'ftp/email', bold: true, size: 20, color: '1E3A8A', underline: {} })] })] }),
                      new TableCell({ width: { size: 60, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Sheet #', bold: true, size: 20, color: '1E3A8A', underline: {} })] })] }),
                      new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Total Count', bold: true, size: 20, color: '1E3A8A', underline: {} })], alignment: AlignmentType.RIGHT })] }),
                    ],
                  }),

                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '{DELIVERY_METHOD}', bold: true, size: 20, color: '1E3A8A' })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '{ASSEMBLY_SHEETS}', bold: true, size: 20, color: '1E293B' })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '{ASSEMBLY_COUNT}', bold: true, size: 20, color: '1E3A8A' })], alignment: AlignmentType.RIGHT })] }),
                    ],
                  }),

                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '{DELIVERY_METHOD}', bold: true, size: 20, color: '1E3A8A' })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '{ESHEET_SHEETS}', bold: true, size: 20, color: '1E293B' })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '{ESHEET_COUNT}', bold: true, size: 20, color: '1E3A8A' })], alignment: AlignmentType.RIGHT })] }),
                    ],
                  }),

                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '{DELIVERY_METHOD}', bold: true, size: 20, color: '1E3A8A' })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '{PART_SHEETS}', bold: true, size: 20, color: '1E293B' })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '{PART_COUNT}', bold: true, size: 20, color: '1E3A8A' })], alignment: AlignmentType.RIGHT })] }),
                    ],
                  }),
                ],
              }),

              new Paragraph({ text: '', spacing: { before: 240 } }),

              new Table({
                width: { size: 45, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                },
                rows: PURPOSE_OPTIONS.map((opt) => {
                  return new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 15, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: opt === 'Approval' ? 'X' : '', bold: true, size: 20, color: '000000' })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 85, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: opt, bold: true, size: 20, color: '1E3A8A' })],
                          }),
                        ],
                      }),
                    ],
                  });
                }),
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Transmittal_Template.docx`;
      link.click();

      // Auto-load as current uploaded doc for immediate testing
      const arrayBuffer = await blob.arrayBuffer();
      setUploadedDocx({
        name: 'Transmittal_Template.docx',
        buffer: arrayBuffer,
      });
    } catch (err) {
      console.error(err);
      alert('Error creating sample template.');
    }
  };

  // Surgical In-Place XML Update Function
  const processInPlaceDocxUpdate = (buffer: ArrayBuffer): Blob => {
    const zip = new PizZip(buffer);

    // 1. First Pass: Docxtemplater for placeholders
    try {
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{', end: '}' },
      });
      doc.setData({
        TRANSMITTAL_NO: transmittalNo,
        transmittal_no: transmittalNo,
        DATE: transmittalDate,
        date: transmittalDate,
        ATTENTION: attention,
        attention: attention,
        PROJECT: projectName,
        project: projectName,
        PROJECT_NAME: projectName,
        project_name: projectName,
        PROJECT_NO: projectNumber,
        project_no: projectNumber,
        LOCATION: location,
        location: location,
        PURPOSE: selectedPurpose,
        purpose: selectedPurpose,
        DELIVERY_METHOD: deliveryMethod,
        delivery_method: deliveryMethod,
        ASSEMBLY_SHEETS: assemblyFiles.length > 0 ? assemblyDetailsStr : 'None',
        assembly_sheets: assemblyFiles.length > 0 ? assemblyDetailsStr : 'None',
        ASSEMBLY_COUNT: assemblyCountStr,
        assembly_count: assemblyCountStr,
        ESHEET_SHEETS: esheetFiles.length > 0 ? esheetDetailsStr : 'None',
        esheet_sheets: esheetFiles.length > 0 ? esheetDetailsStr : 'None',
        ESHEET_COUNT: esheetCountStr,
        esheet_count: esheetCountStr,
        PART_SHEETS: partFiles.length > 0 ? partDetailsStr : 'Part Drawings Submittal',
        part_sheets: partFiles.length > 0 ? partDetailsStr : 'Part Drawings Submittal',
        PART_COUNT: partCountStr,
        part_count: partCountStr,
      });
      doc.render();
    } catch (e) {
      console.warn('Docxtemplater tag rendering notice (proceeding with surgical XML DOM update):', e);
    }

    // 2. Second Pass: Surgical DOM modification directly inside word/document.xml to guarantee 100% exact layout fidelity!
    const docXmlFile = zip.file('word/document.xml');
    if (docXmlFile) {
      let xmlStr = docXmlFile.asText();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');

      const updateCellText = (cell: Element, newText: string) => {
        const tElems = Array.from(cell.getElementsByTagName('w:t'));
        if (tElems.length > 0) {
          tElems[0].textContent = newText;
          for (let i = 1; i < tElems.length; i++) {
            tElems[i].textContent = '';
          }
        } else {
          const pElems = cell.getElementsByTagName('w:p');
          if (pElems.length > 0) {
            const r = xmlDoc.createElement('w:r');
            const t = xmlDoc.createElement('w:t');
            t.textContent = newText;
            r.appendChild(t);
            pElems[0].appendChild(r);
          }
        }
      };

      // Replace TRANSMITTAL NO text node if literal text exists
      const allTextNodes = Array.from(xmlDoc.getElementsByTagName('w:t'));
      allTextNodes.forEach((t) => {
        if (t.textContent && t.textContent.includes('TRANSMITTAL NO:')) {
          t.textContent = `TRANSMITTAL NO: ${transmittalNo}`;
        }
      });

      // Update Tables
      const tables = Array.from(xmlDoc.getElementsByTagName('w:tbl'));
      tables.forEach((tbl) => {
        const tblText = tbl.textContent || '';
        const rows = Array.from(tbl.getElementsByTagName('w:tr'));

        // Drawings Table (contains ftp/email or Sheet # or Assembly)
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

            const cells = Array.from(row.getElementsByTagName('w:tc'));
            if (cells.length >= 3) {
              if (drawingRowIndex === 0) {
                updateCellText(cells[0], deliveryMethod);
                updateCellText(cells[1], assemblyFiles.length > 0 ? assemblyDetailsStr : 'None');
                updateCellText(cells[2], assemblyCountStr);
              } else if (drawingRowIndex === 1) {
                updateCellText(cells[0], deliveryMethod);
                updateCellText(cells[1], esheetFiles.length > 0 ? esheetDetailsStr : 'None');
                updateCellText(cells[2], esheetCountStr);
              } else if (drawingRowIndex === 2) {
                updateCellText(cells[0], deliveryMethod);
                updateCellText(cells[1], partFiles.length > 0 ? partDetailsStr : 'Part Drawings Submittal');
                updateCellText(cells[2], partCountStr);
              }
              drawingRowIndex++;
            }
          });
        }

        // Purpose Checkbox Table
        if (tblText.includes('Approval') || tblText.includes('Field Use') || tblText.includes('Shop Fabrication')) {
          rows.forEach((row) => {
            const cells = Array.from(row.getElementsByTagName('w:tc'));
            if (cells.length >= 2) {
              const purposeLabel = cells[1].textContent?.trim() || '';
              if (purposeLabel) {
                const isChecked =
                  selectedPurpose.toLowerCase() === purposeLabel.toLowerCase() ||
                  selectedPurpose.toLowerCase().replace(/[^a-z]/g, '') === purposeLabel.toLowerCase().replace(/[^a-z]/g, '');
                updateCellText(cells[0], isChecked ? 'X' : '');
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
    setIsUpdatingDoc(true);

    try {
      let bufferToUse = uploadedDocx?.buffer;

      // If no file uploaded yet, generate default template buffer
      if (!bufferToUse) {
        await handleDownloadSampleTemplate();
        return;
      }

      const outBlob = processInPlaceDocxUpdate(bufferToUse);

      // Download updated transmittal
      const link = document.createElement('a');
      link.href = URL.createObjectURL(outBlob);
      const cleanFileName = (uploadedDocx?.name || 'Transmittal').replace(/\.docx$/i, '');
      link.download = `${cleanFileName}_Updated_TR${transmittalNo}.docx`;
      link.click();

      setIsUpdatingDoc(false);
      incrementMetric('transmittalBuilderRequests');
    } catch (err) {
      console.error(err);
      setIsUpdatingDoc(false);
      alert('Error updating the Word document. Please verify it is a valid .docx file.');
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
              <span>100% In-Place Word Transmittal Updater</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Transmittal Builder
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Upload your copy of Transmittal (`.docx`), input the Transmittal Number, select drawing files 3 times, and update the uploaded document with extracted sheet values in-place without altering its original layout or styles.
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 shadow-inner">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Updated: <strong className="text-cyan-300 font-mono text-sm">{metrics.transmittalBuilderRequests}</strong> Documents</span>
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

            <button
              onClick={handleDownloadSampleTemplate}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
              title="Download Liberty Steel Sample Transmittal (.docx)"
            >
              <FileDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Get Sample Transmittal (.docx)</span>
            </button>
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

        {/* STEP 2: INPUT TRANSMITTAL NUMBER & NECESSARY DETAILS */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono">
              2
            </span>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Enter Transmittal Number & Necessary Details Only
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-cyan-300 font-extrabold mb-1 flex items-center gap-1">
                <span>TRANSMITTAL NO.*</span>
              </label>
              <input
                type="text"
                value={transmittalNo}
                onChange={(e) => setTransmittalNo(e.target.value)}
                placeholder="e.g. 01"
                className="w-full bg-slate-900 border-2 border-cyan-400 rounded-xl px-3 py-2 text-white font-mono font-black text-base focus:border-cyan-300 focus:outline-none transition shadow-lg shadow-cyan-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Date</label>
              <input
                type="text"
                value={transmittalDate}
                onChange={(e) => setTransmittalDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:border-cyan-400 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Delivery Method</label>
              <select
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 text-cyan-300 font-mono font-bold rounded-xl px-3 py-2 focus:border-cyan-400 focus:outline-none transition"
              >
                <option value="email">email</option>
                <option value="ftp">ftp</option>
                <option value="ftp/email">ftp/email</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Attention (Recipient)</label>
              <input
                type="text"
                value={attention}
                onChange={(e) => setAttention(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Project Number</label>
              <input
                type="text"
                value={projectNumber}
                onChange={(e) => setProjectNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Submittal Purpose Checkbox Selection */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">Submittal Purpose:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {PURPOSE_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  onClick={() => setSelectedPurpose(opt)}
                  className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition ${
                    selectedPurpose === opt
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center font-mono text-[10px] font-bold border ${
                    selectedPurpose === opt ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'border-slate-700 bg-slate-950'
                  }`}>
                    {selectedPurpose === opt ? 'X' : ''}
                  </span>
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 3: SELECT FILES 3 TIMES */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono">
            3
          </span>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Select Files 3 Times (Assembly Drawings, E-Plan, Part Drawings)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1st Selection: Assembly Drawings */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                  1st File Selection: Assembly Drawings
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[11px] font-bold">
                  {assemblyCountStr}
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
                <p className="text-xs font-semibold text-slate-200">Select 1st Files (Assembly)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Grabs details e.g. 100 - Rev A</p>
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
                  <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">Grabbed Details:</div>
                  <p className="text-sky-300 text-[11px] break-words leading-relaxed">{assemblyDetailsStr}</p>
                </div>
              )}
            </div>

            {assemblyFiles.length > 0 && (
              <button
                onClick={() => handleClearFiles('assembly')}
                className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1 cursor-pointer transition pt-1 border-t border-slate-800/80"
              >
                <Trash2 className="w-3 h-3" /> Clear 1st Files
              </button>
            )}
          </div>

          {/* 2nd Selection: E-sheets Plan/Detail */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  2nd File Selection: E-sheets Plan/Detail
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[11px] font-bold">
                  {esheetCountStr}
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
                <p className="text-xs font-semibold text-slate-200">Select 2nd Files (E-Plan)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Grabs details e.g. AB1 - Rev A</p>
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
                  <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">Grabbed Details:</div>
                  <p className="text-teal-300 text-[11px] break-words leading-relaxed">{esheetDetailsStr}</p>
                </div>
              )}
            </div>

            {esheetFiles.length > 0 && (
              <button
                onClick={() => handleClearFiles('esheet')}
                className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1 cursor-pointer transition pt-1 border-t border-slate-800/80"
              >
                <Trash2 className="w-3 h-3" /> Clear 2nd Files
              </button>
            )}
          </div>

          {/* 3rd Selection: Part Drawings Count Only */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  3rd File Selection: Part Drawings Count
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
                  {partCountStr}
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
                <p className="text-xs font-semibold text-slate-200">Select 3rd Files (Part Drawings)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Calculates part drawing count row</p>
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
                  <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">Calculated Count Row:</div>
                  <p className="text-amber-300 text-[11px] font-bold">{partCountStr}</p>
                </div>
              )}
            </div>

            {partFiles.length > 0 && (
              <button
                onClick={() => handleClearFiles('part')}
                className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1 cursor-pointer transition pt-1 border-t border-slate-800/80"
              >
                <Trash2 className="w-3 h-3" /> Clear 3rd Files
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STEP 4: UPDATE UPLOADED TRANSMITTAL & DOWNLOAD */}
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

        {/* Live Preview */}
        {activeTab === 'preview' && (
          <div className="bg-white text-slate-900 rounded-xl p-6 font-sans text-xs shadow-2xl border border-slate-300 space-y-4">
            {/* TRANSMITTAL NO Header */}
            <div className="font-bold text-blue-900 text-sm tracking-wide">
              TRANSMITTAL NO: <span className="font-mono text-base">{transmittalNo}</span>
            </div>

            {/* Header Box Table */}
            <div className="border border-slate-900 grid grid-cols-2 divide-x divide-slate-900">
              {/* Left Column */}
              <div className="p-3 space-y-3">
                <div>
                  <div className="text-[10px] text-blue-900 underline font-semibold mb-1">Customer:</div>
                  <div className="font-black text-slate-900 text-sm">{companyName}</div>
                  <div className="text-[11px] font-bold text-slate-800">{companyAddress}</div>
                  <div className="text-[11px] font-bold text-slate-800">Ph: {companyPhone}</div>
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
                <div className="pt-2 border-t border-slate-900 text-right">
                  <span className="font-bold text-blue-900">Date: </span>
                  <span className="font-bold text-emerald-700 font-mono">{transmittalDate}</span>
                </div>
              </div>
            </div>

            {/* Drawings Table */}
            <div className="border border-slate-900">
              <div className="grid grid-cols-12 divide-x divide-slate-900 border-b border-slate-900 font-bold text-blue-900 underline bg-slate-50 p-2 text-[11px]">
                <div className="col-span-2">ftp/email</div>
                <div className="col-span-7">Sheet #</div>
                <div className="col-span-3 text-right">Total Count</div>
              </div>

              {/* Row 1: Assembly Drawings */}
              <div className="grid grid-cols-12 divide-x divide-slate-900 border-b border-slate-900 p-2 font-mono text-[11px] items-center">
                <div className="col-span-2 font-bold text-blue-900">{deliveryMethod}</div>
                <div className="col-span-7 font-bold text-slate-800 break-words">{assemblyDetailsStr}</div>
                <div className="col-span-3 text-right font-bold text-blue-900">{assemblyCountStr}</div>
              </div>

              {/* Row 2: E-sheets Plan/Detail */}
              <div className="grid grid-cols-12 divide-x divide-slate-900 border-b border-slate-900 p-2 font-mono text-[11px] items-center">
                <div className="col-span-2 font-bold text-blue-900">{deliveryMethod}</div>
                <div className="col-span-7 font-bold text-slate-800 break-words">{esheetDetailsStr}</div>
                <div className="col-span-3 text-right font-bold text-blue-900">{esheetCountStr}</div>
              </div>

              {/* Row 3: Part Drawings Count */}
              <div className="grid grid-cols-12 divide-x divide-slate-900 p-2 font-mono text-[11px] items-center">
                <div className="col-span-2 font-bold text-blue-900">{deliveryMethod}</div>
                <div className="col-span-7 font-bold text-slate-800 break-words">{partDetailsStr}</div>
                <div className="col-span-3 text-right font-bold text-blue-900">{partCountStr}</div>
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
    </div>
  );
};
