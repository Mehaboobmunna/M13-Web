import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { LayoutGrid, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentRoute, navigate } = useNavigation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Back to Home */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2.5 font-bold text-lg sm:text-xl tracking-tight group text-slate-900 dark:text-white cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span>Project Hub</span>
        </button>

        {/* Central Section Navigation Links */}
        <nav className="flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => navigate('games')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              currentRoute.startsWith('games')
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200/50 dark:border-emerald-800/50'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🎮</span>
            <span className="hidden sm:inline">Games</span>
          </button>
          <button
            onClick={() => navigate('apps')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              currentRoute.startsWith('apps')
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200/50 dark:border-blue-800/50'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>⚡</span>
            <span className="hidden sm:inline">Apps</span>
          </button>
          <button
            onClick={() => navigate('wallpapers')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              currentRoute === 'wallpapers'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200/50 dark:border-indigo-800/50'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🖼️</span>
            <span className="hidden sm:inline">Wallpapers</span>
          </button>
          <button
            onClick={() => navigate('blog')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              currentRoute === 'blog'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-semibold border border-amber-200/50 dark:border-amber-800/50'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>📝</span>
            <span className="hidden sm:inline">Blog</span>
          </button>
        </nav>

        {/* Theme Toggle */}
        <div className="flex items-center gap-2">
          <button
            title="Toggle theme"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            {isDark ? <Moon className="w-5 h-5 text-amber-300" /> : <Sun className="w-5 h-5 text-amber-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
