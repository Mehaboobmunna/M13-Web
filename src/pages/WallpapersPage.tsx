import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Wallpaper, DeviceFilter, SortOption } from '../types/wallpapers';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';

import {
  Sparkles,
  Heart,
  Search,
  Monitor,
  Download,
  Copy,
  X,
  Eye,
  Check,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Lock,
  Edit3,
  Tag,
  Save,
  CheckCircle,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Dark / OLED',
  'Vehicles',
  'Entertainment',
  'Minimal',
  'Nature',
  'Cyberpunk',
  'Space',
  'Abstract',
  'Anime',
  'Architecture',
];

const WALLPAPERS: Wallpaper[] = [
  // 0. OLED Minimalist Special Edition
  {
    id: 'wp-oled-center-1',
    title: 'True Black Center Celestial Core',
    category: 'Dark / OLED',
    device: 'desktop',
    resolution: '3840 x 2160',
    aspect: '16:9',
    views: 52100,
    author: 'BuildSmith OLED Labs',
    url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=2000&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?q=85&w=3840&auto=format&fit=crop',
    tags: ['oled', 'dark', 'minimal', 'center', 'glowing', 'black'],
    palette: ['#000000', '#06b6d4', '#10b981', '#1e293b'],
  },
  {
    id: 'wp-oled-corner-1',
    title: 'True Black Corner Neon Spark',
    category: 'Dark / OLED',
    device: 'mobile',
    resolution: '1440 x 3200',
    aspect: '9:16',
    views: 48900,
    author: 'BuildSmith OLED Labs',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=85&w=1440&auto=format&fit=crop',
    tags: ['oled', 'dark', 'minimal', 'corner', 'neon', 'black'],
    palette: ['#000000', '#ec4899', '#8b5cf6', '#0f172a'],
  },
  {
    id: 'wp-oled-monolith-1',
    title: 'True Black Void Monolith Center',
    category: 'Dark / OLED',
    device: 'desktop',
    resolution: '3840 x 2160',
    aspect: '16:9',
    views: 51200,
    author: 'BuildSmith OLED Labs',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=85&w=3840&auto=format&fit=crop',
    tags: ['oled', 'dark', 'minimal', 'monolith', 'center', 'black'],
    palette: ['#000000', '#3b82f6', '#6366f1', '#09090b'],
  },
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
  {
    id: 'wp-veh-3',
    title: 'Futuristic Cyber GT Sports Concept',
    category: 'Vehicles',
    device: 'desktop',
    resolution: '3840 x 2160',
    aspect: '16:9',
    views: 31800,
    author: 'Design Works',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=2000&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=85&w=3840&auto=format&fit=crop',
    tags: ['vehicles', 'sports', 'futuristic', 'concept', 'gt'],
    palette: ['#0f172a', '#0284c7', '#38bdf8', '#f8fafc'],
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
  {
    id: 'wp-nat-2',
    title: 'Emerald Forest Canopy Rays',
    category: 'Nature',
    device: 'mobile',
    resolution: '1440 x 3200',
    aspect: '9:16',
    views: 31500,
    author: 'Sebastian Unrau',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=85&w=1440&auto=format&fit=crop',
    tags: ['nature', 'forest', 'trees', 'sunlight', 'green'],
    palette: ['#064e3b', '#047857', '#a7f3d0', '#022c22'],
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
];

export const WallpapersPage: React.FC = () => {
  // Admin custom uploads stored locally
  const [adminWallpapers, setAdminWallpapers] = useState<Wallpaper[]>(() => {
    try {
      const saved = localStorage.getItem('buildsmith_admin_wallpapers_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

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

  // Edit Wallpaper State
  const [isEditingModal, setIsEditingModal] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('Dark / OLED');
  const [editTags, setEditTags] = useState<string>('');
  const [editDevice, setEditDevice] = useState<'desktop' | 'mobile' | 'ultrawide'>('desktop');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync edit form fields when activeModalWallpaper changes
  useEffect(() => {
    if (activeModalWallpaper) {
      setEditTitle(activeModalWallpaper.title);
      setEditCategory(activeModalWallpaper.category);
      setEditTags(activeModalWallpaper.tags ? activeModalWallpaper.tags.join(', ') : '');
      setEditDevice(activeModalWallpaper.device);
      setIsEditingModal(false);
      setSaveSuccess(false);
    }
  }, [activeModalWallpaper]);

  // Secret Admin Importer State
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [adminCategory, setAdminCategory] = useState<string>('Dark / OLED');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [tripleClickCounter, setTripleClickCounter] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync custom wallpapers with Firestore shared_wallpapers collection for real-time global availability
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'shared_wallpapers'),
      (snapshot) => {
        const firestoreWps: Wallpaper[] = [];
        snapshot.forEach((docSnap) => {
          firestoreWps.push(docSnap.data() as Wallpaper);
        });
        if (firestoreWps.length > 0) {
          setAdminWallpapers(firestoreWps);
        }
      },
      (err) => {
        console.warn('Firestore shared_wallpapers subscription error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync admin wallpapers to local storage as fallback
  useEffect(() => {
    try {
      localStorage.setItem('buildsmith_admin_wallpapers_v1', JSON.stringify(adminWallpapers));
    } catch (e) {
      console.warn('Storage quota notice when saving admin wallpapers:', e);
    }
  }, [adminWallpapers]);

  // Listen for secret keyboard shortcut: Ctrl + Shift + U
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Triple-click on hero badge trigger
  const handleBadgeClick = () => {
    setTripleClickCounter((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setIsAdminOpen(true);
        return 0;
      }
      return next;
    });
    setTimeout(() => setTripleClickCounter(0), 1000);
  };

  // Combine static wallpapers with admin uploaded wallpapers
  const allWallpapers = useMemo(() => {
    return [...adminWallpapers, ...WALLPAPERS];
  }, [adminWallpapers]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('fav_wallpapers', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteAdminWallpaper = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAdminWallpapers((prev) => prev.filter((wp) => wp.id !== id));
    if (activeModalWallpaper?.id === id) {
      setActiveModalWallpaper(null);
    }
    try {
      await deleteDoc(doc(db, 'shared_wallpapers', id));
    } catch (err) {
      console.error('Failed to delete wallpaper from Firestore:', err);
    }
  };

  const handleUpdateWallpaper = async (updatedWp: Wallpaper) => {
    // Update local state
    setAdminWallpapers((prev) => {
      const exists = prev.some((wp) => wp.id === updatedWp.id);
      if (exists) {
        return prev.map((wp) => (wp.id === updatedWp.id ? updatedWp : wp));
      }
      return [updatedWp, ...prev];
    });

    if (activeModalWallpaper?.id === updatedWp.id) {
      setActiveModalWallpaper(updatedWp);
    }

    // Persist to Firestore
    try {
      await setDoc(doc(db, 'shared_wallpapers', updatedWp.id), updatedWp);
    } catch (err) {
      console.error('Failed to update wallpaper in Firestore:', err);
    }
  };

  const handleSaveModalEdits = async () => {
    if (!activeModalWallpaper) return;

    const parsedTags = editTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const updatedWp: Wallpaper = {
      ...activeModalWallpaper,
      title: editTitle.trim() || activeModalWallpaper.title,
      category: editCategory,
      tags: parsedTags.length > 0 ? parsedTags : activeModalWallpaper.tags,
      device: editDevice,
    };

    await handleUpdateWallpaper(updatedWp);
    setIsEditingModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleProcessUploadedFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileList.length === 0) return;

    setIsUploading(true);
    setUploadProgressText(`Processing ${fileList.length} image(s)...`);

    const newWallpapers: Wallpaper[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setUploadProgressText(`Processing ${i + 1} of ${fileList.length}: ${file.name}`);

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Determine image dimensions
        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.onerror = () => resolve({ width: 1920, height: 1080 });
          img.src = dataUrl;
        });

        const aspectNum = dimensions.width / dimensions.height;
        let device: 'desktop' | 'mobile' | 'ultrawide' = 'desktop';
        let aspect = '16:9';

        if (aspectNum < 0.8) {
          device = 'mobile';
          aspect = '9:16';
        } else if (aspectNum > 2.0) {
          device = 'ultrawide';
          aspect = '21:9';
        }

        const cleanTitle = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        const wp: Wallpaper = {
          id: `wp-admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: cleanTitle || `Wallpaper ${i + 1}`,
          category: adminCategory,
          device,
          resolution: `${dimensions.width} x ${dimensions.height}`,
          aspect,
          views: 1,
          author: 'BuildSmith Collection',
          url: dataUrl,
          downloadUrl: dataUrl,
          tags: ['curated', adminCategory.toLowerCase()],
          palette: ['#0f172a', '#06b6d4', '#10b981'],
        };

        newWallpapers.push(wp);

        // Save to Firestore
        try {
          await setDoc(doc(db, 'shared_wallpapers', wp.id), wp);
        } catch (err) {
          console.error('Failed to upload wallpaper to Firestore:', err);
        }
      } catch (err) {
        console.error('Error loading image file:', file.name, err);
      }
    }

    if (newWallpapers.length > 0) {
      setAdminWallpapers((prev) => [...newWallpapers, ...prev]);
    }

    setIsUploading(false);
    setUploadProgressText('');
    setIsAdminOpen(false);
  };

  const filteredWallpapers = useMemo(() => {
    let list = [...allWallpapers];

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
  }, [allWallpapers, selectedCategory, selectedDevice, searchQuery, sortBy, favorites, filterFavoritesOnly]);

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
      <section className="text-center py-4 sm:py-8 max-w-3xl mx-auto space-y-3">
        <span
          onClick={handleBadgeClick}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 cursor-pointer select-none"
          title="Curated 4K Gallery"
        >
          <Sparkles className="w-3.5 h-3.5" /> Curated 4K Gallery
        </span>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Wallpapers
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          High-resolution 4K Ultra HD desktop, mobile, and ultrawide background assets across 10 curated categories.
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

      {/* Wallpaper Cards Grid */}
      <section>
        {filteredWallpapers.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No wallpapers found</h3>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search query or device orientation filters.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredWallpapers.map((wp) => {
              const isFav = favorites.includes(wp.id);
              const isAdminItem = wp.id.startsWith('wp-admin-');

              return (
                <div
                  key={wp.id}
                  onClick={() => setActiveModalWallpaper(wp)}
                  className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between"
                >
                  {/* Aspect Ratio Container */}
                  <div
                    className={`relative w-full overflow-hidden bg-slate-950 ${
                      wp.device === 'mobile' ? 'aspect-[9/16]' : wp.device === 'ultrawide' ? 'aspect-[21/9]' : 'aspect-[16/9]'
                    }`}
                  >
                    <img
                      src={wp.url}
                      alt={wp.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900/90 backdrop-blur-md text-slate-200 border border-slate-700/80 shadow-md">
                        {wp.category}
                      </span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(wp.id, e)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-rose-400 transition cursor-pointer shadow-md"
                      title={isFav ? 'Remove Favorite' : 'Add Favorite'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* Delete Admin Uploaded Image Button (Visible in active session or when modal open) */}
                    {isAdminItem && isAdminOpen && (
                      <button
                        onClick={(e) => handleDeleteAdminWallpaper(wp.id, e)}
                        className="absolute bottom-3 right-3 p-2 rounded-full bg-rose-950/80 backdrop-blur-md border border-rose-800 text-rose-300 hover:bg-rose-900 transition cursor-pointer shadow-md opacity-80 group-hover:opacity-100"
                        title="Remove admin image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Card Content Info */}
                  <div className="p-4 space-y-2 bg-slate-900">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white truncate leading-tight group-hover:text-indigo-300 transition-colors">
                        {wp.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{wp.resolution}</span>
                      <span className="capitalize">{wp.device}</span>
                    </div>

                    {/* Color Palette Indicators */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {wp.palette.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-3 h-3 rounded-full border border-slate-700 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      <span className="text-[10px] text-slate-500 ml-auto flex items-center gap-1 font-mono">
                        <Eye className="w-3 h-3" /> {wp.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* HIDDEN SECRET ADMIN BATCH UPLOADER MODAL (Ctrl + Shift + U) */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsAdminOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Wallpaper Importer</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Add Images to Wallpaper Gallery</h2>
              <p className="text-xs text-slate-400">
                Batch select or drop image files (`.jpg`, `.png`, `.webp`, `.avif`). Resolution, device orientation, and aspect ratios are auto-calculated and added directly to the gallery.
              </p>
            </div>

            {/* Category Assign Selector */}
            <div className="space-y-2 text-xs">
              <label className="block text-slate-300 font-bold">Target Gallery Category:</label>
              <select
                value={adminCategory}
                onChange={(e) => setAdminCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 font-medium rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Dark / OLED">Dark / OLED</option>
                <option value="Vehicles">Vehicles</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Minimal">Minimal</option>
                <option value="Nature">Nature</option>
                <option value="Cyberpunk">Cyberpunk</option>
                <option value="Space">Space</option>
                <option value="Abstract">Abstract</option>
                <option value="Anime">Anime</option>
                <option value="Architecture">Architecture</option>
              </select>
            </div>

            {/* Upload Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files) {
                  handleProcessUploadedFiles(e.dataTransfer.files);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-slate-700/80 hover:border-emerald-400 bg-slate-950/60'
              }`}
            >
              <UploadCloud className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-extrabold text-white">Click or Drop Images Here</p>
              <p className="text-xs text-slate-400 mt-1">Select multiple images at once to populate the gallery</p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files) handleProcessUploadedFiles(e.target.files);
                }}
                multiple
                accept="image/*"
                className="hidden"
              />
            </div>

            {isUploading && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>{uploadProgressText}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX PREVIEW MODAL */}
      {activeModalWallpaper && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0 relative">
            <button
              onClick={() => setActiveModalWallpaper(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image View */}
            <div className="w-full bg-slate-950 max-h-[70vh] flex items-center justify-center p-4 overflow-hidden relative">
              <img
                src={activeModalWallpaper.url}
                alt={activeModalWallpaper.title}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Modal Details & Action Bar */}
            <div className="p-6 sm:p-8 bg-slate-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {activeModalWallpaper.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 capitalize bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                      {activeModalWallpaper.device}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {activeModalWallpaper.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Resolution: <strong className="text-slate-200 font-mono">{activeModalWallpaper.resolution}</strong> &bull; Views: <strong className="text-slate-200 font-mono">{activeModalWallpaper.views.toLocaleString()}</strong>
                  </p>

                  {/* Tag Pills */}
                  {activeModalWallpaper.tags && activeModalWallpaper.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      {activeModalWallpaper.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setSearchQuery(tag);
                            setActiveModalWallpaper(null);
                          }}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800/90 hover:bg-indigo-950 hover:text-indigo-300 text-slate-300 border border-slate-700/80 cursor-pointer transition"
                          title={`Search gallery for #${tag}`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsEditingModal(!isEditingModal)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{isEditingModal ? 'Close Editor' : 'Edit Tags & Category'}</span>
                  </button>

                  <button
                    onClick={() => handleCopyUrl(activeModalWallpaper.url)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-2 transition cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={activeModalWallpaper.downloadUrl || activeModalWallpaper.url}
                    download={`${activeModalWallpaper.title.replace(/\s+/g, '_')}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download HD</span>
                  </a>
                </div>
              </div>

              {/* Success Alert */}
              {saveSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Wallpaper tags and category updated successfully and synced for all visitors!</span>
                </div>
              )}

              {/* INLINE EDIT FORM PANEL */}
              {isEditingModal && (
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Wallpaper Metadata
                    </span>
                    <span className="text-[10px] text-slate-400">Updates sync in real-time across all visitors</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">Image Title:</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">Category:</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                      >
                        {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tags */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-slate-300 font-bold">Tags (Comma Separated):</label>
                      <input
                        type="text"
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        placeholder="e.g. oled, dark, minimal, 4k, supercars"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium font-mono text-xs"
                      />
                    </div>

                    {/* Device Orientation */}
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-bold">Device Aspect:</label>
                      <select
                        value={editDevice}
                        onChange={(e) => setEditDevice(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                      >
                        <option value="desktop">Desktop (16:9)</option>
                        <option value="mobile">Mobile (9:16)</option>
                        <option value="ultrawide">Ultrawide (21:9)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setIsEditingModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveModalEdits}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
