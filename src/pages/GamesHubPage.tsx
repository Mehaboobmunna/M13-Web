import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ArrowRight, Trophy, Flame } from 'lucide-react';
import { useActivityMetrics } from '../utils/activityMetrics';

export const GamesHubPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { metrics } = useActivityMetrics();

  const totalMatches = metrics.quartetClashMatches + metrics.findTheThiefMatches;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 flex-1 flex flex-col items-center">
      <header className="w-full text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-sky-400 mb-2">Web Games</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Fast-paced card showdowns, medieval deduction conclaves, and AI-powered table battles.
        </p>
      </header>

      {/* Global & Individual Matches Completed Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-xs text-slate-300 font-mono shadow-sm flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Total Matches Completed:</span>
          <span className="text-emerald-400 font-bold ml-0.5">{totalMatches}</span>
        </div>
        <div className="bg-slate-800 border border-emerald-500/30 px-4 py-2 rounded-full text-xs text-slate-300 font-mono shadow-sm flex items-center gap-1.5">
          <span className="text-sm">🃏</span>
          <span>Quartet Clash:</span>
          <span className="text-emerald-400 font-bold">{metrics.quartetClashMatches}</span>
        </div>
        <div className="bg-slate-800 border border-amber-500/30 px-4 py-2 rounded-full text-xs text-slate-300 font-mono shadow-sm flex items-center gap-1.5">
          <span className="text-sm">🕵️</span>
          <span>Find the Thief:</span>
          <span className="text-amber-400 font-bold">{metrics.findTheThiefMatches}</span>
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
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold font-mono flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>{metrics.quartetClashMatches} Matches Completed</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 font-semibold">
                Solo & Multiplayer
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
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold font-mono flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>{metrics.findTheThiefMatches} Matches Completed</span>
              </span>
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
