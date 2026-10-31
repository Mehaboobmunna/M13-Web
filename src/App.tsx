import React from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage';
import { WallpapersPage } from './pages/WallpapersPage';
import { AppsHubPage } from './pages/AppsHubPage';
import { GamesHubPage } from './pages/GamesHubPage';
import { BlogPage } from './pages/BlogPage';
import { PulseApp } from './pages/apps/PulseApp';
import { FileNameGrabberApp } from './pages/apps/FileNameGrabberApp';
import { DrawingSeriesBuilderApp } from './pages/apps/DrawingSeriesBuilderApp';
import { ImperialCalculatorApp } from './pages/apps/ImperialCalculatorApp';
import { KeypadImperialCalculatorApp } from './pages/apps/KeypadImperialCalculatorApp';
import { CalculatorHistoryPage } from './pages/apps/CalculatorHistoryPage';
import { QuartetClashGame } from './pages/games/QuartetClashGame';
import { FindTheThiefGame } from './pages/games/FindTheThiefGame';

const AppContent: React.FC = () => {
  const { currentRoute } = useNavigation();

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage />;
      case 'wallpapers':
        return <WallpapersPage />;
      case 'apps':
        return <AppsHubPage />;
      case 'apps-pulse':
        return <PulseApp />;
      case 'apps-file-name-grabber':
        return <FileNameGrabberApp />;
      case 'apps-drawing-series-builder':
        return <DrawingSeriesBuilderApp />;
      case 'apps-imperial-calculator':
        return <ImperialCalculatorApp />;
      case 'apps-keypad-calculator':
        return <KeypadImperialCalculatorApp />;
      case 'apps-calculator-history':
        return <CalculatorHistoryPage />;
      case 'games':
        return <GamesHubPage />;
      case 'games-quartet-clash':
        return <QuartetClashGame />;
      case 'games-find-the-thief':
        return <FindTheThiefGame />;
      case 'blog':
        return <BlogPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-1 flex flex-col">{renderCurrentPage()}</main>
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p><span className="font-semibold text-slate-300">BuildSmith</span> &bull; Construction Tools, Productivity Apps, Games & Wallpapers</p>
          <a
            href="#/"
            className="hover:text-sky-400 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Back to Top &uarr;
          </a>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </ThemeProvider>
  );
};

export default App;
