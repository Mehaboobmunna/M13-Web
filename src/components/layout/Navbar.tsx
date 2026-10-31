import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { DraftingDividerIcon } from '../common/DraftingDividerIcon';

export const Navbar: React.FC = () => {
  const { currentRoute, navigate } = useNavigation();

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Back to Home */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2.5 font-bold text-lg sm:text-xl tracking-tight group text-white cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/10 group-hover:border-cyan-400 group-hover:shadow-cyan-500/20 group-hover:scale-105 transition-all">
            <DraftingDividerIcon className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
          </div>
          <span className="font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors">BuildSmith</span>
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
