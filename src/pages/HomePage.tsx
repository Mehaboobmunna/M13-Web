import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ArrowRight, Gamepad2, Zap, Image, BookOpen } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full">
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-4">
          <Zap className="w-3.5 h-3.5" /> Project Hub Showcase
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          Project Hub
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
          Multiplayer Games &bull; Web Apps &bull; Technical Blog
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Games Tile */}
        <div
          onClick={() => navigate('games')}
          className="bg-slate-800/90 border border-slate-700/80 hover:border-sky-400 rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 card-hover-lift cursor-pointer group shadow-xl"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-2">
              <span>🎮 Games</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Real-time multiplayer games, fast-paced 4-card showdowns, and royal deduction mini-games.
            </p>
          </div>
          <div className="text-sky-400 font-semibold text-sm flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            <span>Explore Games</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Apps Tile */}
        <div
          onClick={() => navigate('apps')}
          className="bg-slate-800/90 border border-slate-700/80 hover:border-sky-400 rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 card-hover-lift cursor-pointer group shadow-xl"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-2">
              <span>⚡ Apps</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Interactive web tools, minimalist productivity timers, drawing series builders, and dimensional calculators.
            </p>
          </div>
          <div className="text-sky-400 font-semibold text-sm flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            <span>Launch Apps</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Wallpapers Tile */}
        <div
          onClick={() => navigate('wallpapers')}
          className="bg-slate-800/90 border border-slate-700/80 hover:border-sky-400 rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 card-hover-lift cursor-pointer group shadow-xl"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
              <Image className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-2">
              <span>🖼️ Wallpapers</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Curated live wallpaper gallery across 10 distinct categories, 4K resolution specs, color palettes, and device filters.
            </p>
          </div>
          <div className="text-sky-400 font-semibold text-sm flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            <span>Browse Wallpapers</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Blog Tile */}
        <div
          onClick={() => navigate('blog')}
          className="bg-slate-800/90 border border-slate-700/80 hover:border-sky-400 rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 card-hover-lift cursor-pointer group shadow-xl"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-2">
              <span>📝 Blog</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Development notes, project architecture breakdowns, rule mechanics, and engineering design patterns.
            </p>
          </div>
          <div className="text-sky-400 font-semibold text-sm flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            <span>Read Articles</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </main>
    </div>
  );
};
