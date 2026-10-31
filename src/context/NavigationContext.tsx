import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppRoute =
  | 'home'
  | 'games'
  | 'games-quartet-clash'
  | 'games-find-the-thief'
  | 'apps'
  | 'apps-pulse'
  | 'apps-file-name-grabber'
  | 'apps-transmittal-builder'
  | 'apps-drawing-series-builder'
  | 'apps-imperial-calculator'
  | 'apps-keypad-calculator'
  | 'apps-calculator-history'
  | 'wallpapers'
  | 'blog';

interface NavigationContextType {
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
  navigatePath: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  currentRoute: 'home',
  navigate: () => {},
  navigatePath: () => {},
});

function pathToRoute(path: string, hash: string): AppRoute {
  const full = (hash.replace(/^#/, '') || path).toLowerCase().replace(/\/+$/, '') || '/';

  if (full.includes('quartet-clash')) return 'games-quartet-clash';
  if (full.includes('find-the-thief')) return 'games-find-the-thief';
  if (full.includes('games')) return 'games';

  if (full.includes('pulse')) return 'apps-pulse';
  if (full.includes('transmittal-builder') || full.includes('transmittal')) return 'apps-transmittal-builder';
  if (full.includes('file-name-grabber')) return 'apps-file-name-grabber';
  if (full.includes('drawing-series-builder')) return 'apps-drawing-series-builder';
  if (full.includes('calculator-history') || full.includes('calc-history')) return 'apps-calculator-history';
  if (full.includes('keypad-calculator') || full.includes('construction-calculator')) return 'apps-keypad-calculator';
  if (full.includes('imperial-calculator')) return 'apps-imperial-calculator';
  if (full.includes('apps')) return 'apps';

  if (full.includes('wallpaper')) return 'wallpapers';
  if (full.includes('blog')) return 'blog';

  return 'home';
}

function routeToHash(route: AppRoute): string {
  switch (route) {
    case 'home':
      return '#/';
    case 'games':
      return '#/games';
    case 'games-quartet-clash':
      return '#/games/quartet-clash';
    case 'games-find-the-thief':
      return '#/games/find-the-thief';
    case 'apps':
      return '#/apps';
    case 'apps-pulse':
      return '#/apps/pulse';
    case 'apps-file-name-grabber':
      return '#/apps/file-name-grabber';
    case 'apps-transmittal-builder':
      return '#/apps/transmittal-builder';
    case 'apps-drawing-series-builder':
      return '#/apps/drawing-series-builder';
    case 'apps-imperial-calculator':
      return '#/apps/imperial-calculator';
    case 'apps-keypad-calculator':
      return '#/apps/keypad-calculator';
    case 'apps-calculator-history':
      return '#/apps/calculator-history';
    case 'wallpapers':
      return '#/wallpapers';
    case 'blog':
      return '#/blog';
  }
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() =>
    pathToRoute(window.location.pathname, window.location.hash)
  );

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentRoute(pathToRoute(window.location.pathname, window.location.hash));
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigate = (route: AppRoute) => {
    setCurrentRoute(route);
    const hash = routeToHash(route);
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigatePath = (path: string) => {
    const route = pathToRoute(path, '');
    navigate(route);
  };

  return (
    <NavigationContext.Provider value={{ currentRoute, navigate, navigatePath }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);
