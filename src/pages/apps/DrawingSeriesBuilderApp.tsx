import React, { useState, useRef, useMemo } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { buildDrawingSeries } from '../../utils/drawingSeriesParser';
import { ArrowLeft, FileText, Upload, Copy, Check, Trash2 } from 'lucide-react';

export const DrawingSeriesBuilderApp: React.FC = () => {
  const { navigate } = useNavigation();

  const [filenames, setFilenames] = useState<string[]>([]);
  const [manualInput, setManualInput] = useState<string>('');
  const [sortOutput, setSortOutput] = useState<boolean>(true);
  const [removeDuplicates, setRemoveDuplicates] = useState<boolean>(true);
  const [stripExt, setStripExt] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const pdfFiles = Array.from(filesList).filter((f) => f.name.toLowerCase().endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      alert('Please select valid PDF files (.pdf)');
      return;
    }

    const newNames = pdfFiles.map((f) => f.name);
    setFilenames((prev) => [...prev, ...newNames]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddManualInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const parts = manualInput.split(',').map((s) => s.trim()).filter(Boolean);
    setFilenames((prev) => [...prev, ...parts]);
    setManualInput('');
  };

  const clearFiles = () => {
    setFilenames([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const seriesResult = useMemo(() => {
    return buildDrawingSeries(filenames, {
      sortOutput,
      removeDuplicates,
      stripExt,
    });
  }, [filenames, sortOutput, removeDuplicates, stripExt]);

  const copyOutput = () => {
    if (!seriesResult.output) return;
    navigator.clipboard.writeText(seriesResult.output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
      <nav>
        <button
          onClick={() => navigate('apps')}
          className="text-slate-400 hover:text-white inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Apps Hub
        </button>
      </nav>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700/80 to-blue-600/60 p-6 text-white border-b border-blue-500/20 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Drawing Series Builder</h1>
            <p className="text-blue-200 text-xs sm:text-sm mt-1">
              Upload PDF drawing files to group sequential numbers into clean ranges.
            </p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md hidden sm:block">
            <FileText className="w-7 h-7 text-blue-200" />
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700/80 hover:border-blue-500 bg-slate-950/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-slate-200">
                Drop PDF drawing files here, or <span className="text-blue-400 underline">browse PDF files</span>
              </div>
              <p className="text-xs text-slate-400">Only .pdf drawing formats or series names will be grouped.</p>
            </div>
          </div>

          {/* Quick Manual Text Entry Alternative */}
          <form onSubmit={handleAddManualInput} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Or paste drawing numbers (e.g. A1001, A1002, A1003)..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer border border-slate-700"
            >
              Add
            </button>
          </form>

          {/* Uploaded Files Summary */}
          {filenames.length > 0 && (
            <div className="flex justify-between items-center bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-xl">
              <div className="flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  Uploaded Drawings: {filenames.length}
                </span>
              </div>
              <button
                onClick={clearFiles}
                className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>
          )}

          {/* Options */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-slate-300 text-xs sm:text-sm">
            <div className="flex items-center space-x-5">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sortOutput}
                  onChange={(e) => setSortOutput(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                />
                <span className="font-medium">Sort numerically</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={removeDuplicates}
                  onChange={(e) => setRemoveDuplicates(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                />
                <span className="font-medium">Remove duplicates</span>
              </label>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={stripExt}
                onChange={(e) => setStripExt(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <span className="font-medium">Strip file extensions (.pdf)</span>
            </label>
          </div>

          {/* Output Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Output Series String
              </label>
              <button
                onClick={copyOutput}
                disabled={!seriesResult.output}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition border border-slate-700 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Result' : 'Copy Result'}</span>
              </button>
            </div>
            <textarea
              rows={7}
              readOnly
              value={seriesResult.output}
              placeholder="Upload PDF drawing files above to generate sequential series range..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm font-mono text-blue-300 shadow-inner leading-relaxed focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-950/60 px-6 py-3 border-t border-slate-800/60 text-xs text-slate-400 flex justify-between items-center">
          <span>Drawing Series Builder v1.16</span>
          <span className="font-mono text-blue-400">{seriesResult.stats}</span>
        </div>
      </div>
    </div>
  );
};
