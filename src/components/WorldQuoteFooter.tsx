import React, { useState, useEffect } from 'react';
import {
  Quote,
  Globe,
  RefreshCw,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  Heart,
  Search,
  X,
  Lightbulb,
  Bookmark
} from 'lucide-react';
import {
  WORLD_QUOTES,
  getRandomWorldQuote,
  WorldQuote,
  QuoteCategory
} from '../utils/worldQuotes';

const CATEGORIES: { label: string; value: QuoteCategory | 'All' }[] = [
  { label: '🌟 All Wisdom', value: 'All' },
  { label: '🔥 Mindset & Grit', value: 'Mindset & Grit' },
  { label: '⚙️ Habits & Systems', value: 'Habits & Discipline' },
  { label: '🎯 Focus & Deep Work', value: 'Focus & Deep Work' },
  { label: '🏛️ Stoicism & Peace', value: 'Stoicism & Peace' },
  { label: '🧘 Mindfulness & Purpose', value: 'Mindfulness & Purpose' },
  { label: '⚔️ Mastery & Craft', value: 'Mastery & Craft' },
  { label: '📜 Philosophy', value: 'Philosophy' },
  { label: '🌍 Global Proverbs', value: 'Proverb' },
  { label: '📚 Literature', value: 'Literature' },
  { label: '🔬 Science', value: 'Science' },
  { label: '💡 Life Wisdom', value: 'Wisdom' }
];

export const WorldQuoteFooter: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<WorldQuote>(() => getRandomWorldQuote());
  const [selectedCategory, setSelectedCategory] = useState<QuoteCategory | 'All'>('All');
  const [copied, setCopied] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<QuoteCategory | 'All'>('All');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wisdom_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [quotesExploredCount, setQuotesExploredCount] = useState<number>(() => {
    try {
      const count = localStorage.getItem('wisdom_explored_count');
      return count ? parseInt(count, 10) : 1;
    } catch {
      return 1;
    }
  });
  const [onlyFavoritesFilter, setOnlyFavoritesFilter] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('wisdom_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('wisdom_explored_count', quotesExploredCount.toString());
    } catch (e) {
      console.error(e);
    }
  }, [quotesExploredCount]);

  const handleNextQuote = () => {
    const next = getRandomWorldQuote(selectedCategory === 'All' ? undefined : selectedCategory);
    setCurrentQuote(next);
    setCopied(false);
    setQuotesExploredCount(prev => prev + 1);
  };

  const handleCopyQuote = (q: WorldQuote) => {
    const textToCopy = `"${q.quote}" — ${q.author} (${q.origin})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const filteredVaultQuotes = WORLD_QUOTES.filter(q => {
    if (onlyFavoritesFilter && !favorites.includes(q.id)) return false;
    if (activeCategoryTab !== 'All' && q.category !== activeCategoryTab) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchQuote = q.quote.toLowerCase().includes(query);
      const matchAuthor = q.author.toLowerCase().includes(query);
      const matchOrigin = q.origin.toLowerCase().includes(query);
      const matchLesson = q.lesson ? q.lesson.toLowerCase().includes(query) : false;
      return matchQuote || matchAuthor || matchOrigin || matchLesson;
    }
    return true;
  });

  const isCurrentFav = favorites.includes(currentQuote.id);

  return (
    <footer className="w-full bg-slate-950/95 border-t border-slate-800/90 py-4 px-4 mt-auto relative z-30 transition-colors">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Quote Content Box */}
        <div className="flex items-start gap-3 flex-1 text-left min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Quote className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-slate-100 italic font-medium leading-relaxed drop-shadow-sm">
              &ldquo;{currentQuote.quote}&rdquo;
            </p>

            {currentQuote.lesson && (
              <div className="flex items-center gap-1.5 text-xs text-amber-300/90 font-sans font-medium bg-amber-950/30 border border-amber-500/20 px-2 py-0.5 rounded-md w-fit">
                <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                <span><strong className="text-amber-400 font-semibold">Key Takeaway:</strong> {currentQuote.lesson}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono pt-0.5">
              <span className="font-bold text-amber-300">{currentQuote.author}</span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                <Globe className="w-3 h-3 text-sky-400" /> {currentQuote.origin}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30 font-semibold">
                {currentQuote.category}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-center md:self-auto">
          {/* Category Filter Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              const cat = e.target.value as QuoteCategory | 'All';
              setSelectedCategory(cat);
              const next = getRandomWorldQuote(cat === 'All' ? undefined : cat);
              setCurrentQuote(next);
            }}
            className="bg-slate-900 text-xs text-slate-300 border border-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-amber-400 cursor-pointer shadow-sm"
            title="Filter quotes by self-help chapter"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Shuffle Next Button */}
          <button
            onClick={handleNextQuote}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="Read another quote"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Next Wisdom</span>
          </button>

          {/* Favorite Toggle */}
          <button
            onClick={() => toggleFavorite(currentQuote.id)}
            className={`p-1.5 rounded-lg border transition-all active:scale-95 text-xs ${
              isCurrentFav
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isCurrentFav ? "Saved in Favorites" : "Save to Wisdom Vault"}
          >
            <Heart className={`w-4 h-4 ${isCurrentFav ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Copy Quote Button */}
          <button
            onClick={() => handleCopyQuote(currentQuote)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-all active:scale-95"
            title="Copy quote text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Open Full Wisdom Vault Library */}
          <button
            onClick={() => setIsVaultOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="Open Complete Wisdom Vault Library"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Wisdom Vault</span>
            {favorites.length > 0 && (
              <span className="bg-rose-500 text-white font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {favorites.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* WISDOM VAULT MODAL */}
      {isVaultOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                  <Sparkles className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    📖 Self-Help & World Wisdom Vault
                  </h2>
                  <p className="text-xs text-slate-400">
                    Explore timeless principles for focus, grit, stoicism, habits, and life purpose.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVaultOpen(false)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search quotes, authors, origins, or lessons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Favorites Toggle Filter */}
                <button
                  onClick={() => setOnlyFavoritesFilter(!onlyFavoritesFilter)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
                    onlyFavoritesFilter
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${onlyFavoritesFilter ? 'fill-rose-400 text-rose-400' : ''}`} />
                  <span>Favorites ({favorites.length})</span>
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategoryTab(cat.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                      activeCategoryTab === cat.value
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quotes Grid / List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-950/60 custom-scrollbar">
              {filteredVaultQuotes.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Bookmark className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-sm font-medium">No wisdom quotes match your filter criteria.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategoryTab('All');
                      setOnlyFavoritesFilter(false);
                    }}
                    className="text-xs text-indigo-400 underline hover:text-indigo-300"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredVaultQuotes.map((q) => {
                  const isFav = favorites.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        setCurrentQuote(q);
                        setIsVaultOpen(false);
                      }}
                      className="bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group relative flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-slate-200 italic font-medium leading-relaxed group-hover:text-white transition-colors">
                          &ldquo;{q.quote}&rdquo;
                        </p>
                        <button
                          onClick={(e) => toggleFavorite(q.id, e)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isFav
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                      </div>

                      {q.lesson && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-300/90 bg-amber-950/30 border border-amber-500/20 px-2.5 py-1 rounded-md w-fit">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span><strong>Key Insight:</strong> {q.lesson}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-300">{q.author}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400">{q.origin}</span>
                        </div>
                        <span className="text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30 text-[10px]">
                          {q.category}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary Stats */}
            <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Showing {filteredVaultQuotes.length} of {WORLD_QUOTES.length} Quotes</span>
              <span>Wisdom Journey: <strong>{quotesExploredCount}</strong> Quotes Explored</span>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
