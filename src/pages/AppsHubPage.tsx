import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ArrowLeft, Clock, FolderOpen, PenTool, Ruler, ArrowRight } from 'lucide-react';

export const AppsHubPage: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 flex-1 flex flex-col items-center">
      <header className="w-full text-center mb-8">
        <button
          onClick={() => navigate('home')}
          className="text-slate-400 hover:text-sky-400 transition inline-flex items-center gap-1.5 text-sm mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-sky-400 mb-2">Web Apps</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Minimalist productivity trackers, drawing organizers, file extractors, and imperial calculators.
        </p>
      </header>

      <div className="w-full max-w-xl flex flex-col gap-4">
        {/* Pulse Tracker Entry */}
        <div
          onClick={() => navigate('apps-pulse')}
          className="bg-slate-800/90 border border-slate-700/80 hover:border-sky-400 rounded-xl p-5 cursor-pointer card-hover-lift transition-all flex items-start gap-4 group shadow-lg"
        >
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                ⏱️ Pulse
              </h2>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              Minimalist multi-project time tracker with start/stop intervals, active timer banner, quick deduction adjustments, and CSV export.
            </p>
          </div>
        </div>

        {/* File Name Grabber Entry */}
        <div
          onClick={() => navigate('apps-file-name-grabber')}
          className="bg-slate-800/90 border border-slate-700/80 hover:border-sky-400 rounded-xl p-5 cursor-pointer card-hover-lift transition-all flex items-start gap-4 group shadow-lg"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                📁 File Name Grabber
              </h2>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              Extract, clean, sort, and format file names from local folders and dragged drops instantly.
            </p>
          </div>
        </div>

        {/* Drawing Series Builder Entry */}
        <div
          onClick={() => navigate('apps-drawing-series-builder')}
          className="bg-slate-800/90 border border-slate-700/80 hover:border-sky-400 rounded-xl p-5 cursor-pointer card-hover-lift transition-all flex items-start gap-4 group shadow-lg"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
            <PenTool className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                📐 Drawing Series Builder
              </h2>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              Generate sequential drawing numbers, sheet lists, and structural logs by automatically collapsing consecutive sets into clean ranges.
            </p>
          </div>
        </div>

        {/* Imperial Calculator Entry */}
        <div
          onClick={() => navigate('apps-imperial-calculator')}
          className="bg-slate-800/90 border border-slate-700/80 hover:border-sky-400 rounded-xl p-5 cursor-pointer card-hover-lift transition-all flex items-start gap-4 group shadow-lg"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
            <Ruler className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                📏 Imperial Calculator
              </h2>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              Add, subtract, multiply, and divide US imperial fractional dimensions and convert between inches, fractional feet, and metric.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
