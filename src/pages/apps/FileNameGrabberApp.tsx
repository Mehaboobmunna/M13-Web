import React, { useState, useRef } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { ArrowLeft, UploadCloud, Copy, Check, Trash2, Zap } from 'lucide-react';
import { useActivityMetrics, incrementMetric } from '../../utils/activityMetrics';

export const FileNameGrabberApp: React.FC = () => {
  const { navigate } = useNavigation();
  const { metrics } = useActivityMetrics();
  const [files, setFiles] = useState<File[]>([]);
  const [includeExtension, setIncludeExtension] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const newFiles = Array.from(selectedFiles);
    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      incrementMetric('fileNameGrabberRequests');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process filenames
  const outputResult = React.useMemo(() => {
    if (files.length === 0) return '';

    const processed = files.map((f) => {
      if (includeExtension) {
        return f.name;
      }
      return f.name.replace(/\.[^/.]+$/, '');
    });

    // Natural alphabetical sort
    processed.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    return processed.join(', ');
  }, [files, includeExtension]);

  const copyResult = () => {
    if (!outputResult) return;
    navigator.clipboard.writeText(outputResult).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
      <nav>
        <button
          onClick={() => navigate('apps')}
          className="text-sky-400 hover:underline inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Apps Hub
        </button>
      </nav>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">File Name Grabber</h1>
            <p className="text-slate-400 text-sm mt-1">
              Drop or select files to instantly generate a sorted, comma-separated list of filenames.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Requests Processed: <strong className="text-white font-mono">{metrics.fileNameGrabberRequests}</strong></span>
          </div>
        </div>

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
              : 'border-slate-700 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-950/90'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <UploadCloud className="w-10 h-10 text-blue-400 mx-auto mb-3" />
          <p className="text-sm text-slate-300">
            Drag & drop files here, or <strong className="text-blue-400 underline">browse files</strong>
          </p>
          <p className="text-xs text-slate-500 mt-1">Supports any file type or multiple selections</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
          <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300 select-none">
            <input
              type="checkbox"
              checked={includeExtension}
              onChange={(e) => setIncludeExtension(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
            />
            <span>Include filename extension</span>
          </label>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              {files.length} file{files.length === 1 ? '' : 's'} loaded
            </span>
            {files.length > 0 && (
              <button
                onClick={clearFiles}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Concatenated Result
            </label>
            <button
              onClick={copyResult}
              disabled={!outputResult}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
          <textarea
            readOnly
            rows={6}
            value={outputResult}
            placeholder="Sorted file names will appear here..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm font-mono text-blue-300 focus:outline-none focus:border-blue-500 leading-relaxed resize-y"
          />
        </div>
      </div>
    </div>
  );
};
