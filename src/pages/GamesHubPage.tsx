import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ArrowLeft, Gamepad2, ArrowRight } from 'lucide-react';

export const GamesHubPage: React.FC = () => {
  const { navigate } = useNavigation();
  const [qcCount, setQcCount] = useState<number>(142);
  const [fttCount, setFttCount] = useState<number>(98);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const resQC = await fetch('https://countapi.mileshilliard.com/api/v1/get/project_hub_quartet_clash');
        if (resQC.ok) {
          const dataQC = await resQC.json();
          if (isMounted && typeof dataQC.value !== 'undefined') {
            setQcCount(parseInt(dataQC.value, 10));
          }
        }
      } catch {}

      try {
        const resFTT = await fetch('https://countapi.mileshilliard.com/api/v1/get/project_hub_find_the_thief');
        if (resFTT.ok) {
          const dataFTT = await resFTT.json();
          if (isMounted && typeof dataFTT.value !== 'undefined') {
            setFttCount(parseInt(dataFTT.value, 10));
          }
        }
      } catch {}

      if (isMounted) setLoading(false);
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 flex-1 flex flex-col items-center">
      <header className="w-full text-center mb-8">
        <button
          onClick={() => navigate('home')}
          className="text-slate-400 hover:text-sky-400 transition inline-flex items-center gap-1.5 text-sm mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-sky-400 mb-2">Web Games</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Fast-paced card showdowns, medieval deduction conclaves, and AI-powered table battles.
        </p>
      </header>

      {/* Global & Individual Stats Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-xs text-slate-400 font-mono shadow-sm">
          Total Played:{' '}
          <span className="text-sky-400 font-bold ml-1">
            {loading ? '...' : qcCount + fttCount}
          </span>
        </div>
        <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-xs text-slate-400 font-mono shadow-sm">
          Quartet Clash:{' '}
          <span className="text-sky-400 font-bold ml-1">{loading ? '...' : qcCount}</span>
        </div>
        <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-xs text-slate-400 font-mono shadow-sm">
          Find the Thief:{' '}
          <span className="text-sky-400 font-bold ml-1">{loading ? '...' : fttCount}</span>
        </div>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-4">
        {/* Quartet Clash Card */}
        <div
          onClick={() => navigate('games-quartet-clash')}
          className="bg-slate-800/90 border border-slate-700/80 hover:border-emerald-400 rounded-2xl p-6 cursor-pointer card-hover-lift transition-all flex items-start gap-4 group shadow-xl"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
            <span className="text-2xl">🃏</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                Quartet Clash
              </h2>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              Fast-paced 4-card showdown. Pass cards clockwise in real-time, anticipate opponents' hands, and claim quartet sets!
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 font-semibold">
                Solo vs Smart Bots
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-700 font-semibold">
                16 Themed Decks
              </span>
            </div>
          </div>
        </div>

        {/* Find the Thief Card */}
        <div
          onClick={() => navigate('games-find-the-thief')}
          className="bg-slate-800/90 border border-slate-700/80 hover:border-amber-400 rounded-2xl p-6 cursor-pointer card-hover-lift transition-all flex items-start gap-4 group shadow-xl"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
            <span className="text-2xl">🕵️</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                Find the Thief
              </h2>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              Crown & Conclave social deduction mini-game. Assume noble court roles (King, Queen, Knight, Bishop) to interrogate suspects and unmask the Thief!
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/50 font-semibold">
                Royal Court Roles
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-700 font-semibold">
                Scoring & Deduction
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
