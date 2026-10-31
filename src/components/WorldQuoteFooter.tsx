import React from 'react';
import { Quote, Globe } from 'lucide-react';
import { getRandomWorldQuote, WorldQuote } from '../utils/worldQuotes';

export const WorldQuoteFooter: React.FC = () => {
  const [currentQuote] = React.useState<WorldQuote>(() => getRandomWorldQuote());

  return (
    <footer className="w-full bg-slate-950/90 border-t border-slate-800/80 py-4 px-4 mt-auto">
      <div className="max-w-4xl mx-auto flex items-center justify-center text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <Quote className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm text-slate-200 italic font-medium leading-relaxed">
              &ldquo;{currentQuote.quote}&rdquo;
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-400 font-mono">
              <span className="font-bold text-amber-300">{currentQuote.author}</span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                <Globe className="w-3 h-3 text-sky-400" /> {currentQuote.origin}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                {currentQuote.category}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
