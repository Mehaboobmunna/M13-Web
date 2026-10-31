import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { DraftingDividerIcon } from '../common/DraftingDividerIcon';

export const Navbar: React.FC = () => {
  const { currentRoute, navigate } = useNavigation();

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand / Back to Home */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-3.5 font-bold tracking-tight group text-white cursor-pointer"
        >
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 via-teal-500/20 to-emerald-500/30 border-2 border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.35)] group-hover:scale-105 group-hover:border-emerald-300 group-hover:shadow-[0_0_28px_rgba(52,211,153,0.5)] transition-all shrink-0">
            <DraftingDividerIcon className="w-8 h-8 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] group-hover:text-emerald-300 transition-colors" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-black tracking-tight bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(34,211,238,0.5)] group-hover:drop-shadow-[0_0_18px_rgba(52,211,153,0.7)] transition-all leading-tight text-2xl sm:text-3xl">
              BuildSmith
            </span>
            <span className="text-[11px] text-emerald-300 font-mono tracking-[0.2em] font-extrabold drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
              PRECISION SUITE
            </span>
          </div>
        </button>

        {/* Central Section Navigation Links */}
        <nav className="flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => navigate('games')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              currentRoute.startsWith('games')
                ? 'bg-emerald-950/60 text-emerald-400 font-semibold border border-emerald-800/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎮</span>
            <span className="hidden sm:inline">Games</span>
          </button>
          <button
            onClick={() => navigate('apps')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              currentRoute.startsWith('apps')
                ? 'bg-blue-950/60 text-blue-400 font-semibold border border-blue-800/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚡</span>
            <span className="hidden sm:inline">Apps</span>
          </button>
          <button
            onClick={() => navigate('wallpapers')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              currentRoute === 'wallpapers'
                ? 'bg-indigo-950/60 text-indigo-400 font-semibold border border-indigo-800/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🖼️</span>
            <span className="hidden sm:inline">Wallpapers</span>
          </button>
          <button
            onClick={() => navigate('blog')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              currentRoute === 'blog'
                ? 'bg-cyan-950/60 text-cyan-400 font-semibold border border-cyan-800/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📝</span>
            <span className="hidden sm:inline">Blog</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
