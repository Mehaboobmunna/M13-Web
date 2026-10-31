import React, { useState, useEffect } from 'react';
import { getRandomQuote, Quote } from '../../utils/quotes';
import { Quote as QuoteIcon } from 'lucide-react';
import { M13Icon } from './M13Icon';

export const QuoteBanner: React.FC = () => {
  const [quote, setQuote] = useState<Quote>(getRandomQuote());

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 my-8">
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex items-start gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-red-500 via-amber-400 to-sky-400 opacity-80" />
        
        {/* Uploaded M13 Cybernetic Icon */}
        <div className="shrink-0 mt-0.5">
          <M13Icon className="w-10 h-10" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <QuoteIcon className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-red-400/90">Inspiration & Principle</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 italic font-medium leading-relaxed">
            "{quote.text}"
          </p>
          <div className="text-[11px] font-bold text-amber-400 mt-2 flex items-center gap-1">
            <span>&mdash; {quote.author}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

