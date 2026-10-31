import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ArrowLeft, BookOpen, Calendar, Clock, Tag, ChevronRight } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  content: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'quartet-clash-mechanics',
    title: 'Architecting Quartet Clash: Real-Time Card Passing & AI Heuristics',
    category: 'Game Design',
    date: 'October 2026',
    readTime: '4 min read',
    summary: 'A deep dive into simultaneous clockwise card passing algorithms, state reconciliation, and heuristic bot selection.',
    content: [
      'Quartet Clash is inspired by classic fast-passing card games. The fundamental challenge was making AI players act in a way that feels organic and non-deterministic while prioritizing sets they already hold.',
      'Each bot maintains a frequency histogram of its 4 cards. During a pass phase, it identifies sets with the lowest count (singletons) and passes them to the adjacent player.',
      'Clockwise passing is resolved in a single synchronous cycle to ensure no cards are duplicated or lost during transit.',
    ],
  },
  {
    id: 'drawing-series-builder',
    title: 'Collapsing Sequential Sequences: Drawing Series Builder Algorithms',
    category: 'Algorithms',
    date: 'October 2026',
    readTime: '3 min read',
    summary: 'How regex parsing, sub-sheet isolation, and linear run-length grouping transform messy PDF batches into clean ranges.',
    content: [
      'In structural engineering and architecture, drawing registers frequently contain hundreds of sequential sheets like HR5000, HR5001, up to HR5029.',
      'The parser breaks filename tokens into prefixes, numeric components, sub-sheets (e.g. -1, -2), and revisions. If a sheet has sub-sheets, it is excluded from grouping so that structural revisions remain unambiguous.',
      'Consecutive runs of 3 or more sheets are cleanly joined with a hyphen, reducing paperwork clutter by over 80%.',
    ],
  },
  {
    id: 'pulse-timer-architecture',
    title: 'Pulse: Building a Frictionless Minimalist Time Tracker',
    category: 'Productivity',
    date: 'September 2026',
    readTime: '3 min read',
    summary: 'Why keyboard-driven interval logging beats heavy project management software for developer flow states.',
    content: [
      'Time tracking tools often suffer from feature creep. Pulse was designed around the keyboard: pressing Space starts or stops the active interval, while pressing N instantly prepares a new task.',
      'All intervals are timestamped and preserved in clean seconds, enabling quick deductions (e.g., deducting 15 minutes if you left the timer running during lunch) and zero-friction CSV export.',
    ],
  },
];

export const BlogPage: React.FC = () => {
  const { navigate } = useNavigation();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 flex-1 flex flex-col">
      <header className="mb-8">
        <button
          onClick={() => navigate('home')}
          className="text-slate-400 hover:text-sky-400 transition inline-flex items-center gap-1.5 text-xs font-semibold mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-400" />
          <h1 className="text-3xl font-extrabold text-white">Engineering Blog</h1>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Development notes, project architecture breakdowns, and algorithm guides.
        </p>
      </header>

      {selectedArticle ? (
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-sky-400 hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            &larr; Back to all articles
          </button>

          <div>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mb-2">
              <span className="text-amber-400 font-bold">{selectedArticle.category}</span>
              <span>&bull;</span>
              <span>{selectedArticle.date}</span>
              <span>&bull;</span>
              <span>{selectedArticle.readTime}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {selectedArticle.title}
            </h2>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed pt-4 border-t border-slate-800">
            {selectedArticle.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </article>
      ) : (
        <div className="space-y-4">
          {ARTICLES.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 cursor-pointer card-hover-lift transition shadow-lg group"
            >
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-2">
                <span className="text-amber-400 font-semibold">{art.category}</span>
                <span>&bull;</span>
                <span>{art.date}</span>
                <span>&bull;</span>
                <span>{art.readTime}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 group-hover:text-sky-400 transition-colors mb-2">
                {art.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                {art.summary}
              </p>
              <div className="text-xs font-bold text-sky-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>Read Full Article</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
