import React, { useState, useEffect } from 'react';
import { getRandomQuote, Quote } from '../../utils/quotes';
import { Quote as QuoteIcon } from 'lucide-react';

export const RandomQuoteBanner: React.FC = () => {
  const [quote, setQuote] = useState<Quote>(getRandomQuote());

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 my-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500 opacity-60" />
        
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
          <QuoteIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-200 italic">
            "{quote.text}"
          </p>
          <div className="text-[11px] font-bold text-cyan-400 mt-1 flex items-center gap-1.5">
            <span>&mdash; {quote.author}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Daily Wisdom</span>
          </div>
        </div>
      </div>
    </div>
  );
};
