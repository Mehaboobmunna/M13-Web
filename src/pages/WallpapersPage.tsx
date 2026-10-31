import React, { useState, useMemo } from 'react';
import { Wallpaper, DeviceFilter, SortOption } from '../types/wallpapers';
import {
  Sparkles,
  Heart,
  Search,
  Monitor,
  Download,
  Copy,
  RotateCcw,
  X,
  Eye,
  Check,
} from 'lucide-react';

const WALLPAPERS: Wallpaper[] = [
  // 1. Vehicles
  {
    id: 'wp-veh-1',
    title: 'Urban Hypercar Night Rain',
    category: 'Vehicles',
    device: 'desktop',
    resolution: '3840 x 2160',
    aspect: '16:9',
    views: 29400,
    author: 'Adrian N',
    url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=2000&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=85&w=3840&auto=format&fit=crop',
    tags: ['vehicles', 'supercar', 'audi', 'night', 'rain'],
    palette: ['#0f172a', '#e11d48', '#475569', '#f8fafc'],
  },
  {
    id: 'wp-veh-2',
    title: 'Vintage Classic Muscle Coupe',
    category: 'Vehicles',
    device: 'mobile',
    resolution: '1440 x 3200',
    aspect: '9:16',
    views: 21300,
    author: 'Campbell',
    url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=85&w=1440&auto=format&fit=crop',
    tags: ['vehicles', 'vintage', 'muscle', 'classic', 'mobile'],
    palette: ['#18181b', '#3b82f6', '#71717a', '#f4f4f5'],
  },
  // 2. Entertainment
  {
    id: 'wp-ent-1',
    title: 'Neon Stage Concert Crowd',
    category: 'Entertainment',
    device: 'desktop',
    resolution: '3840 x 2160',
    aspect: '16:9',
    views: 34100,
    author: 'Anthony DELANOIX',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2000&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=85&w=3840&auto=format&fit=crop',
    tags: ['entertainment', 'music', 'concert', 'crowd', 'stage', 'lights'],
    palette: ['#030712', '#7c3aed', '#ec4899', '#f59e0b'],
  },
  {
    id: 'wp-ent-2',
    title: 'Retro Film Noir Cinema',
    category: 'Entertainment',
    device: 'mobile',
    resolution: '1440 x 3200',
    aspect: '9:16',
    views: 18500,
    author: 'Kilyan Sockalingum',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=85&w=1440&auto=format&fit=crop',
    tags: ['entertainment', 'cinema', 'theater', 'movies', 'film'],
    palette: ['#0f172a', '#991b1b', '#e2e8f0', '#7f1d1d'],
  },
  // 3. Minimal
  {
    id: 'wp-min-1',
    title: 'Desert Dune Curves & Shadow',
    category: 'Minimal',
    device: 'mobile',
    resolution: '1440 x 3200',
    aspect: '9:16',
    views: 19800,
    author: 'Lars Eberle',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=85&w=1440&auto=format&fit=crop',
    tags: ['minimal', 'sand', 'dune', 'clean', 'shadows'],
    palette: ['#78350f', '#d97706', '#fef3c7', '#451a03'],
  },
  {
    id: 'wp-min-2',
    title: 'Monochrome Facade Lines',
    category: 'Minimal',
    device: 'desktop',
    resolution: '3840 x 2160',
    aspect: '16:9',
    views: 26800,
    author: 'Simone Hutsch',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=85&w=3840&auto=format&fit=crop',
    tags: ['minimal', 'geometry', 'monochrome', 'architecture'],
    palette: ['#0f172a', '#475569', '#94a3b8', '#f8fafc'],
  },
  // 4. Nature
  {
    id: 'wp-nat-1',
    title: 'Alpine Mist & Mountain Ridge',
    category: 'Nature',
    device: 'desktop',
    resolution: '3840 x 2160',
    aspect: '16:9',
    views: 42100,
    author: 'Kalen Emsley',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=85&w=3840&auto=format&fit=crop',
    tags: ['nature', 'mountains', 'fog', 'forest', 'landscape'],
    palette: ['#1e293b', '#64748b', '#cbd5e1', '#064e3b'],
  },
  // 5. Cyberpunk
  {
    id: 'wp-cyb-1',
    title: 'Neon Tokyo Alleyway Reflection',
    category: 'Cyberpunk',
    device: 'desktop',
    resolution: '3840 x 2160',
    aspect: '16:9',
    views: 38200,
    author: 'Sora Shimazaki',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2000&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=85&w=3840&auto=format&fit=crop',
    tags: ['cyberpunk', 'neon', 'tokyo', 'rain', 'synthwave'],
    palette: ['#0f172a', '#ec4899', '#6366f1', '#06b6d4'],
  },
  // 6. Space
  {
    id: 'wp-spc-1',
    title: 'Cosmic Orion Stellar Nursery',
    category: 'Space',
    device: 'desktop',
    resolution: '3840 x 2160',
    aspect: '16:9',
    views: 31200,
    author: 'NASA Hubble',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=85&w=3840&auto=format&fit=crop',
    tags: ['space', 'galaxy', 'nebula', 'stars', 'astronomy'],
    palette: ['#030712', '#1e1b4b', '#701a75', '#38bdf8'],
  },
  // 7. Abstract
  {
    id: 'wp-abs-1',
    title: 'Prismatic Geometric Glass Mesh',
    category: 'Abstract',
    device: 'ultrawide',
    resolution: '5120 x 2160',
    aspect: '21:9',
    views: 26100,
    author: 'Milad Fakurian',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=85&w=5120&auto=format&fit=crop',
    tags: ['abstract', '3d', 'render', 'ultrawide', 'gradient'],
    palette: ['#312e81', '#9333ea', '#ec4899', '#f43f5e'],
  },
  // 8. Anime
  {
    id: 'wp-ani-1',
    title: 'Lo-Fi Japanese Lantern Lane',
    category: 'Anime',
    device: 'mobile',
    resolution: '1440 x 3200',
    aspect: '9:16',
    views: 33900,
    author: 'Tokyo Story Art',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=85&w=1440&auto=format&fit=crop',
    tags: ['anime', 'lofi', 'japan', 'illustration', 'night', 'art'],
    palette: ['#1e1b4b', '#c026d3', '#38bdf8', '#fbbf24'],
  },
  // 9. Architecture
  {
    id: 'wp-arc-1',
    title: 'Spiral Geometric Architecture Atrium',
    category: 'Architecture',
    device: 'desktop',
    resolution: '3840 x 2160',
    aspect: '16:9',
    views: 24700,
    author: 'Joel Filipe',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=85&w=3840&auto=format&fit=crop',
    tags: ['architecture', 'spiral', 'building', 'white', 'geometric'],
    palette: ['#0f172a', '#cbd5e1', '#f8fafc', '#334155'],
  },
  // 10. Dark & OLED
  {
    id: 'wp-oled-1',
    title: 'Pure Black Lunar Eclipse AMOLED',
    category: 'Dark / OLED',
    device: 'mobile',
    resolution: '1440 x 3200',
    aspect: '9:16',
    views: 45200,
    author: 'Alexander Andrews',
    url: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=1200&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=85&w=1440&auto=format&fit=crop',
    tags: ['oled', 'dark', 'black', 'moon', 'amoled', 'space'],
    palette: ['#000000', '#1c1917', '#e2e8f0', '#94a3b8'],
  },
];

const CATEGORIES = [
  'All',
  'Minimal',
  'Nature',
  'Cyberpunk',
  'Space',
  'Abstract',
  'Vehicles',
  'Entertainment',
  'Anime',
  'Architecture',
  'Dark / OLED',
];

export const WallpapersPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDevice, setSelectedDevice] = useState<DeviceFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fav_wallpapers') || '[]');
    } catch {
      return [];
    }
  });
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(false);
  const [activeModalWallpaper, setActiveModalWallpaper] = useState<Wallpaper | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('fav_wallpapers', JSON.stringify(next));
      return next;
    });
  };

  const filteredWallpapers = useMemo(() => {
    let list = [...WALLPAPERS];

    if (filterFavoritesOnly) {
      list = list.filter((wp) => favorites.includes(wp.id));
    }

    if (selectedCategory !== 'All') {
      list = list.filter((wp) => wp.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedDevice !== 'all') {
      list = list.filter((wp) => wp.device === selectedDevice);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (wp) =>
          wp.title.toLowerCase().includes(q) ||
          wp.category.toLowerCase().includes(q) ||
          wp.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'popular') {
      list.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [selectedCategory, selectedDevice, searchQuery, sortBy, favorites, filterFavoritesOnly]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedDevice('all');
    setSearchQuery('');
    setSortBy('newest');
    setFilterFavoritesOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center py-4 sm:py-8 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Curated Gallery
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Wallpapers
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Dynamic live wallpaper previews, scheduling concepts, and background assets across 10 curated categories.
        </p>
      </section>

      {/* Category Pills & Search */}
      <section className="space-y-4">
        {/* Search & Favorites Toggle Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 10 categories, tags, 4K..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
                filterFavoritesOnly
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>Favorites ({favorites.length})</span>
            </button>
          </div>
        </div>

        {/* 10 Category Horizontal Scroll Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Device Orientation & Sort Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Device:</span>
            {(['all', 'desktop', 'mobile', 'ultrawide'] as DeviceFilter[]).map((dev) => (
              <button
                key={dev}
                onClick={() => setSelectedDevice(dev)}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer capitalize ${
                  selectedDevice === dev
                    ? 'bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                }`}
              >
                {dev === 'all'
                  ? 'All'
                  : dev === 'desktop'
                  ? 'Desktop (16:9)'
                  : dev === 'mobile'
                  ? 'Mobile (9:16)'
                  : 'Ultrawide (21:9)'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="newest">Featured & Newest</option>
              <option value="popular">Most Popular</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </section>

      {/* Grid Results Counter */}
      <section>
        <div className="flex items-center justify-between mb-4 text-xs sm:text-sm text-slate-500">
          <span>
            Showing {filteredWallpapers.length} wallpaper{filteredWallpapers.length === 1 ? '' : 's'}
          </span>
          {(selectedCategory !== 'All' || selectedDevice !== 'all' || searchQuery || filterFavoritesOnly) && (
            <button
              onClick={resetFilters}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset filters
            </button>
          )}
        </div>

        {/* Wallpaper Grid */}
        {filteredWallpapers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredWallpapers.map((wp) => {
              const isFav = favorites.includes(wp.id);
              return (
                <div
                  key={wp.id}
                  onClick={() => setActiveModalWallpaper(wp)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 card-hover-lift cursor-pointer flex flex-col shadow-lg"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img
                      src={wp.url}
                      alt={wp.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/70 text-slate-200 backdrop-blur-md">
                        {wp.aspect}
                      </span>
                      <button
                        onClick={(e) => toggleFavorite(wp.id, e)}
                        className={`p-1.5 rounded-full backdrop-blur-md transition ${
                          isFav
                            ? 'bg-rose-500/80 text-white'
                            : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-950/90'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {wp.palette.slice(0, 3).map((col, idx) => (
                        <span
                          key={idx}
                          className="w-3 h-3 rounded-full border border-black/40 shadow-xs"
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        <span className="font-semibold text-indigo-500">{wp.category}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {(wp.views / 1000).toFixed(1)}k
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
                        {wp.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{wp.author}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-2">
                      {wp.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-white">No wallpapers found</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Try selecting another category or resetting your search query.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow"
            >
              Show All Wallpapers
            </button>
          </div>
        )}
      </section>

      {/* Modal Dialog */}
      {activeModalWallpaper && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg truncate text-slate-900 dark:text-white">
                  {activeModalWallpaper.title}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {activeModalWallpaper.aspect}
                </span>
              </div>
              <button
                onClick={() => setActiveModalWallpaper(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
              <div className="w-full relative rounded-xl overflow-hidden shadow-inner bg-slate-950 flex items-center justify-center max-h-[55vh]">
                <img
                  src={activeModalWallpaper.url}
                  alt={activeModalWallpaper.title}
                  className="w-full h-auto max-h-[55vh] object-contain"
                />
                <div className="absolute bottom-3 right-3 bg-slate-900/70 backdrop-blur-sm px-3 py-1 rounded-md text-[11px] text-white flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>{activeModalWallpaper.resolution}</span>
                </div>
              </div>

              <div className="w-full mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">Category & Author</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {activeModalWallpaper.category} &bull; {activeModalWallpaper.author}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Color Palette:</span>
                  <div className="flex items-center gap-1.5">
                    {activeModalWallpaper.palette.map((col, idx) => (
                      <span
                        key={idx}
                        title={col}
                        className="w-5 h-5 rounded-full border border-slate-700 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-w-xs justify-end">
                  {activeModalWallpaper.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={() => toggleFavorite(activeModalWallpaper.id)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
              >
                <Heart
                  className={`w-4 h-4 ${
                    favorites.includes(activeModalWallpaper.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                  }`}
                />
                <span>
                  {favorites.includes(activeModalWallpaper.id) ? 'Favorited' : 'Add to Favorites'}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyUrl(activeModalWallpaper.downloadUrl)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <a
                  href={activeModalWallpaper.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={`${activeModalWallpaper.id}.jpg`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High-Res</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
