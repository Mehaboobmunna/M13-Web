import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useNavigation } from '../../context/NavigationContext';
import { CourtRole, CourtRoleId, ThiefPlayer, GameLog } from '../../types/findTheThief';
import { sound } from '../../utils/soundEngine';
import { useActivityMetrics, incrementMetric } from '../../utils/activityMetrics';
import {
  Crown,
  Shield,
  Swords,
  Skull,
  Eye,
  RotateCcw,
  BookOpen,
  Trophy,
  AlertCircle,
  CheckCircle2,
  X,
  Footprints,
  Users,
  Copy,
  Check,
  Play,
  Bot,
  ArrowRightLeft,
  HelpCircle,
  LogOut,
  Lock,
  Ban,
  Brain,
  Search,
  Sparkles,
  Flame
} from 'lucide-react';

const EXTRA_MIDDLE_ROLES: CourtRole[] = [
  { id: 'BISHOP', name: 'Bishop', pts: 800, color: 'from-purple-500 to-indigo-700', border: 'border-purple-400', text: 'text-purple-300', badge: 'bg-purple-950/80 text-purple-300 border-purple-500/40', order: 2 },
  { id: 'KNIGHT', name: 'Knight', pts: 700, color: 'from-blue-500 to-blue-700', border: 'border-blue-400', text: 'text-blue-300', badge: 'bg-blue-950/80 text-blue-300 border-blue-500/40', order: 3 },
  { id: 'ROOK', name: 'Rook', pts: 600, color: 'from-cyan-500 to-teal-700', border: 'border-cyan-400', text: 'text-cyan-300', badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40', order: 4 },
  { id: 'DUKE', name: 'Duke', pts: 500, color: 'from-emerald-500 to-green-700', border: 'border-emerald-400', text: 'text-emerald-300', badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40', order: 5 },
  { id: 'BARON', name: 'Baron', pts: 450, color: 'from-lime-500 to-green-800', border: 'border-lime-400', text: 'text-lime-300', badge: 'bg-lime-950/80 text-lime-300 border-lime-500/40', order: 6 },
  { id: 'SQUIRE', name: 'Squire', pts: 400, color: 'from-teal-400 to-emerald-800', border: 'border-teal-400', text: 'text-teal-300', badge: 'bg-teal-950/80 text-teal-300 border-teal-500/40', order: 7 }
];

function getRoleHierarchy(playerCount: number): CourtRole[] {
  const count = Math.max(4, Math.min(10, playerCount));
  const roles: CourtRole[] = [
    { id: 'KING', name: 'King', pts: 1000, color: 'from-amber-400 via-yellow-500 to-amber-600', border: 'border-amber-300', text: 'text-amber-300', badge: 'bg-amber-950/80 text-amber-300 border-amber-500/40', order: 0 },
    { id: 'QUEEN', name: 'Queen', pts: 900, color: 'from-pink-500 via-rose-500 to-pink-700', border: 'border-pink-300', text: 'text-pink-300', badge: 'bg-pink-950/80 text-pink-300 border-pink-500/40', order: 1 }
  ];

  const middleNeeded = count - 4;
  for (let i = 0; i < middleNeeded; i++) {
    roles.push(EXTRA_MIDDLE_ROLES[i]);
  }

  roles.push({ id: 'PAWN', name: 'Pawn', pts: 300, color: 'from-slate-500 to-slate-700', border: 'border-slate-300', text: 'text-slate-200', badge: 'bg-slate-800 text-slate-200 border-slate-500/40', order: roles.length });
  roles.push({ id: 'THIEF', name: 'Thief', pts: 0, color: 'from-red-600 via-rose-800 to-slate-900', border: 'border-red-500', text: 'text-red-400', badge: 'bg-red-950/80 text-red-300 border-red-500/40', order: roles.length });

  return roles.map((r, idx) => ({ ...r, order: idx }));
}

function RoleIcon({ roleId, className = "w-6 h-6" }: { roleId: CourtRoleId; className?: string }) {
  switch (roleId) {
    case 'KING': return <Crown className={className} />;
    case 'QUEEN': return <Sparkles className={className} />;
    case 'BISHOP': return <Shield className={className} />;
    case 'KNIGHT': return <Swords className={className} />;
    case 'ROOK':
    case 'DUKE':
    case 'BARON':
    case 'SQUIRE': return <Footprints className={className} />;
    case 'PAWN': return <Footprints className={className} />;
    case 'THIEF': return <Skull className={className} />;
    default: return <Crown className={className} />;
  }
}

const CULTURAL_BOT_NAMES = [
  "Aria from Kyoto (bot)",
  "Mateo from Madrid (bot)",
  "Mei from Beijing (bot)",
  "Kwame from Accra (bot)",
  "Elena from Sofia (bot)",
  "Santiago from Bogota (bot)",
  "Fatima from Cairo (bot)",
  "Liam from Dublin (bot)",
  "Priya from Mumbai (bot)",
  "Kenji from Tokyo (bot)",
  "Amira from Casablanca (bot)",
  "Dmitri from Moscow (bot)",
  "Zara from Sydney (bot)",
  "Kofi from Nairobi (bot)",
  "Astrid from Stockholm (bot)",
  "Tariq from Dubai (bot)",
  "Siddharth from Delhi (bot)",
  "Hana from Seoul (bot)",
  "Mateus from Rio (bot)",
  "Chiara from Rome (bot)",
  "Youssef from Tunis (bot)",
  "Nadia from Athens (bot)",
  "Bao from Hanoi (bot)",
  "Ingrid from Oslo (bot)",
  "Chinedu from Lagos (bot)",
  "Sora from Osaka (bot)",
  "Valeria from Buenos Aires (bot)",
  "Kaito from Fukuoka (bot)",
  "Esme from Paris (bot)",
  "Tariq from Amman (bot)",
  "Siobhan from Galway (bot)"
];

interface LeaderboardRecord {
  alias: string;
  score: number;
  winStreak: number;
  date: string;
}

const LEADERBOARD_STORAGE_KEY = 'find_the_thief_leaderboard_v1';

export const FindTheThiefGame: React.FC = () => {
  const { navigate } = useNavigation();
  const { metrics } = useActivityMetrics();

  const [mode, setMode] = useState<'SELECT' | 'SOLO' | 'MULTIPLEX'>('SELECT');
  const [aliasInput, setAliasInput] = useState<string>('Commander');
  const [round, setRound] = useState<number>(1);
  const [gamePhase, setGamePhase] = useState<'LOBBY' | 'PLAYING' | 'ROUND_END'>('LOBBY');
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [isDealing, setIsDealing] = useState<boolean>(false);

  const [players, setPlayers] = useState<ThiefPlayer[]>([
    { id: 'user', name: 'Commander', score: 0, roleId: null, isBot: false, avatar: '👑' },
    { id: 'bot-1', name: CULTURAL_BOT_NAMES[0], score: 0, roleId: null, isBot: true, avatar: '🧝‍♀️' },
    { id: 'bot-2', name: CULTURAL_BOT_NAMES[1], score: 0, roleId: null, isBot: true, avatar: '⚔️' },
    { id: 'bot-3', name: CULTURAL_BOT_NAMES[2], score: 0, roleId: null, isBot: true, avatar: '🧙‍♂️' },
  ]);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [lockedPlayerIds, setLockedPlayerIds] = useState<string[]>([]);
  const [stepExcludedIds, setStepExcludedIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<string>('Welcome to Crown & Conclave.');
  const [lastSwap, setLastSwap] = useState<any>(null);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showScoreboard, setShowScoreboard] = useState<boolean>(false);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);
  const [winStreak, setWinStreak] = useState<number>(0);
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(20);
  const [botFailedSwapsMemory, setBotFailedSwapsMemory] = useState<Record<string, string[]>>({});

  // Turn time limit countdown effect
  useEffect(() => {
    if (gamePhase !== 'PLAYING' || isDealing) return;
    setTurnTimeLeft(20);

    const interval = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          if (currentSeekerPlayer) {
            const eligibleTargets = players.filter(
              p => !lockedPlayerIds.includes(p.id) &&
                   p.id !== currentSeekerPlayer.id &&
                   !stepExcludedIds.includes(p.id)
            );
            if (eligibleTargets.length > 0) {
              const randomTarget = eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
              handleGuessPlayer(randomTarget.id, true);
            }
          }
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gamePhase, isDealing, currentStep]);
  const [totalGamesPlayed, setTotalGamesPlayed] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('ftt_total_games') || '0', 10); } catch { return 0; }
  });
  const [totalWins, setTotalWins] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('ftt_total_wins') || '0', 10); } catch { return 0; }
  });
  const [longestWinStreak, setLongestWinStreak] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('ftt_max_streak') || '0', 10); } catch { return 0; }
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const saveToLeaderboard = (alias: string, score: number, won: boolean) => {
    const newGames = totalGamesPlayed + 1;
    setTotalGamesPlayed(newGames);
    try { localStorage.setItem('ftt_total_games', newGames.toString()); } catch {}

    let newWins = totalWins;
    if (won) {
      newWins += 1;
      setTotalWins(newWins);
      try { localStorage.setItem('ftt_total_wins', newWins.toString()); } catch {}
    }

    const currentStreak = won ? winStreak + 1 : 0;
    if (won) setWinStreak(currentStreak);
    else setWinStreak(0);

    const maxStreak = Math.max(longestWinStreak, currentStreak);
    setLongestWinStreak(maxStreak);
    try { localStorage.setItem('ftt_max_streak', maxStreak.toString()); } catch {}

    const newRecord: LeaderboardRecord = {
      alias: alias.trim() || 'Commander',
      score,
      winStreak: currentStreak,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setLeaderboard(prev => {
      const updated = [newRecord, ...prev].sort((a, b) => b.score - a.score).slice(0, 10);
      try {
        localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const hierarchy = getRoleHierarchy(players.length);
  const currentSeekerRole = hierarchy[currentStep];
  const currentTargetRole = hierarchy[currentStep + 1];
  const currentSeekerPlayer = players.find(p => p.roleId === currentSeekerRole?.id);
  const userPlayer = players.find(p => !p.isBot)!;
  const isMyTurnToGuess = gamePhase === 'PLAYING' && !isDealing && currentSeekerPlayer?.id === userPlayer?.id;

  const totalSteps = Math.max(1, hierarchy.length - 1);
  const completedSteps = gamePhase === 'ROUND_END' ? totalSteps : Math.min(currentStep, totalSteps);
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  const suspectsLeftCount = gamePhase === 'PLAYING' ? players.filter(
    p => !lockedPlayerIds.includes(p.id) &&
         p.id !== currentSeekerPlayer?.id &&
         !stepExcludedIds.includes(p.id)
  ).length : 0;

  const roundWinner = gamePhase === 'ROUND_END'
    ? [...players].sort((a, b) => (b.score || 0) - (a.score || 0))[0]
    : null;

  // Bot turn auto-player (Hard difficulty: tracks failed swaps and avoids guessing those players again)
  useEffect(() => {
    if (gamePhase !== 'PLAYING' || isDealing) return;
    if (!currentSeekerPlayer || !currentSeekerPlayer.isBot) return;

    const timer = setTimeout(() => {
      const rememberedFailed = botFailedSwapsMemory[currentSeekerPlayer.id] || [];
      const eligibleTargets = players.filter(
        p => !lockedPlayerIds.includes(p.id) &&
             p.id !== currentSeekerPlayer.id &&
             !stepExcludedIds.includes(p.id) &&
             !rememberedFailed.includes(p.id)
      );
      if (eligibleTargets.length > 0) {
        const randomTarget = eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
        handleGuessPlayer(randomTarget.id, true);
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [gamePhase, isDealing, currentStep, players, lockedPlayerIds, stepExcludedIds, botFailedSwapsMemory]);

  const handleAddBot = () => {
    if (players.length >= 10) return;
    const existingNames = players.map(p => p.name);
    const availableName = CULTURAL_BOT_NAMES.find(n => !existingNames.includes(n)) || `Bot ${players.length} (bot)`;
    const avatars = ['🧝‍♀️', '⚔️', '🧙‍♂️', '🦹‍♀️', '🛡️', '👑', '🦅'];
    const newBot: ThiefPlayer = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: availableName,
      score: 0,
      roleId: null,
      isBot: true,
      avatar: avatars[players.length % avatars.length]
    };
    setPlayers([...players, newBot]);
  };

  const handleRemovePlayer = (id: string) => {
    if (gamePhase !== 'LOBBY' || players.length <= 4) return;
    setPlayers(players.filter(p => p.id !== id));
  };

  const startRoundAnimation = (isNextRound = false) => {
    if (players.length < 4) return;
    const finalAlias = aliasInput.trim() || 'Commander';
    
    let activePlayers = players;
    if (!isNextRound) {
      const shuffledPool = [...CULTURAL_BOT_NAMES].sort(() => Math.random() - 0.5);
      const avatars = ['🧝‍♀️', '⚔️', '🧙‍♂️', '🦹‍♀️', '🛡️', '👑', '🦅'];
      activePlayers = players.map((p, idx) => {
        if (!p.isBot) return { ...p, name: finalAlias, score: 0 };
        const botIdx = idx - 1;
        return {
          ...p,
          name: shuffledPool[botIdx % shuffledPool.length],
          score: 0,
          avatar: avatars[idx % avatars.length]
        };
      });
    } else {
      activePlayers = players.map(p => p.isBot ? p : { ...p, name: finalAlias });
    }

    setIsShuffling(true);
    sound.playStackFan();

    setTimeout(() => {
      setIsShuffling(false);
      setIsDealing(true);
      sound.playCardFly();

      const newHierarchy = getRoleHierarchy(activePlayers.length);
      const shuffledRoles = [...newHierarchy].sort(() => Math.random() - 0.5);

      const dealtPlayers = activePlayers.map((p, idx) => ({
        ...p,
        roleId: shuffledRoles[idx].id
      }));

      const kingPlayer = dealtPlayers.find(p => p.roleId === 'KING');
      const nextRound = isNextRound ? round + 1 : round;

      setPlayers(dealtPlayers);
      setGamePhase('PLAYING');
      setRound(nextRound);
      setCurrentStep(0);
      setLockedPlayerIds([]);
      setStepExcludedIds([]);
      setBotFailedSwapsMemory({});
      setLastSwap(null);
      setShowWinnerModal(false);

      const startMsg = `Round ${nextRound} begun! ${kingPlayer?.name} drew the KING card and must find the QUEEN!`;
      setLastAction(startMsg);
      setLogs([startMsg, ...logs]);

      setTimeout(() => {
        setIsDealing(false);
      }, 1500);
    }, 1500);
  };

  const handleGuessPlayer = (guessedPlayerId: string, isBotMove = false) => {
    if (gamePhase !== 'PLAYING' || isDealing) return;

    const seekerRole = hierarchy[currentStep];
    const targetRole = hierarchy[currentStep + 1];
    if (!seekerRole || !targetRole) return;

    const seekerPlayer = players.find(p => p.roleId === seekerRole.id);
    const guessedPlayer = players.find(p => p.id === guessedPlayerId);
    if (!seekerPlayer || !guessedPlayer) return;

    if (!isBotMove && seekerPlayer.id !== userPlayer.id) return;
    if (lockedPlayerIds.includes(guessedPlayer.id)) return;
    if (stepExcludedIds.includes(guessedPlayer.id)) return;
    if (seekerPlayer.id === guessedPlayer.id) return;

    const newLocked = [...lockedPlayerIds];

    if (guessedPlayer.roleId === targetRole.id) {
      newLocked.push(seekerPlayer.id);
      let updatedPlayers = players.map(p => {
        if (p.id === seekerPlayer.id) {
          return { ...p, score: (p.score || 0) + seekerRole.pts };
        }
        return p;
      });

      let nextStep = currentStep + 1;
      const isSecondToLastStep = nextStep === hierarchy.length - 2;
      const isRoundComplete = nextStep >= hierarchy.length - 1 || isSecondToLastStep;

      let newPhase: 'PLAYING' | 'ROUND_END' = 'PLAYING';
      let actionMsg = `✅ Correct! ${seekerPlayer.name} (${seekerRole.name}) found ${guessedPlayer.name} (${targetRole.name}) and scored +${seekerRole.pts} pts!`;
      let newLogsList = [actionMsg];

      if (isSecondToLastStep) {
        newPhase = 'ROUND_END';
        const pawnRole = hierarchy[nextStep];
        const thiefRole = hierarchy[nextStep + 1];
        const thiefPlayer = updatedPlayers.find(p => !newLocked.includes(p.id) && p.id !== guessedPlayer.id);

        newLocked.push(guessedPlayer.id);
        if (thiefPlayer) newLocked.push(thiefPlayer.id);

        updatedPlayers = updatedPlayers.map(p => {
          if (p.id === guessedPlayer.id) {
            return { ...p, score: (p.score || 0) + pawnRole.pts };
          }
          return p;
        });

        const autoMsg = `🎉 Round ${round} Complete! With 2 players left, ${guessedPlayer.name} is confirmed as ${pawnRole.name} (+${pawnRole.pts} pts) and ${thiefPlayer?.name || 'the last player'} is exposed as the ${thiefRole.name} (0 pts)!`;
        newLogsList.unshift(autoMsg);
        actionMsg = `${actionMsg} ${autoMsg}`;
        nextStep = hierarchy.length - 1;
      } else if (isRoundComplete) {
        newPhase = 'ROUND_END';
        newLocked.push(guessedPlayer.id);
        const endMsg = `🎉 Round ${round} Complete! ${guessedPlayer.name} was caught as the Thief (0 pts)!`;
        newLogsList.unshift(endMsg);
        actionMsg = endMsg;
      } else {
        const nextTargetRole = hierarchy[nextStep + 1];
        newLogsList.unshift(`🔎 Now ${guessedPlayer.name} (${targetRole.name}) must find the ${nextTargetRole.name}!`);
      }

      sound.playQuartetSuccess();
      if (newPhase === 'ROUND_END') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        setShowWinnerModal(true);
        incrementMetric('findTheThiefMatches');

        const userFinalScore = updatedPlayers.find(p => p.id === userPlayer.id)?.score || 0;
        const topWinner = [...updatedPlayers].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
        const userWon = topWinner.id === userPlayer.id;
        saveToLeaderboard(aliasInput, userFinalScore, userWon);
      }

      setPlayers(updatedPlayers);
      setGamePhase(newPhase);
      setCurrentStep(nextStep);
      setLockedPlayerIds(newLocked);
      setStepExcludedIds([]);
      setLastAction(actionMsg);
      setLastSwap({ type: 'SUCCESS', fromName: seekerPlayer.name, toName: guessedPlayer.name, roleName: targetRole.name, pts: seekerRole.pts });
      setLogs(prev => [...newLogsList, ...prev]);
    } else {
      sound.playAlert(false);
      sound.playPassCard();
      const seekerOldRole = seekerPlayer.roleId;
      const guessedOldRole = guessedPlayer.roleId;

      const updatedPlayers = players.map(p => {
        if (p.id === seekerPlayer.id) return { ...p, roleId: guessedOldRole };
        if (p.id === guessedPlayer.id) return { ...p, roleId: seekerOldRole };
        return p;
      });

      const updatedExcludedIds = Array.from(new Set([...stepExcludedIds, seekerPlayer.id]));
      const swapMsg = `🔄 Wrong guess! ${seekerPlayer.name} guessed ${guessedPlayer.name}, who is NOT the ${targetRole.name}. They swapped cards! ${guessedPlayer.name} is now the ${seekerRole.name}.`;

      setPlayers(updatedPlayers);
      setStepExcludedIds(updatedExcludedIds);
      setBotFailedSwapsMemory(prev => ({
        ...prev,
        [seekerPlayer.id]: Array.from(new Set([...(prev[seekerPlayer.id] || []), guessedPlayer.id]))
      }));
      setLastAction(swapMsg);
      setLastSwap({ type: 'SWAP', fromName: seekerPlayer.name, toName: guessedPlayer.name });
      setLogs(prev => [swapMsg, ...prev]);
    }
  };

  const myRole = hierarchy.find(r => r.id === userPlayer?.roleId);

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight flex items-center gap-2">
              <span>🕵️ Find the Thief</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
              Matches: {metrics.findTheThiefMatches}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRules(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Rules
          </button>
          <button
            onClick={() => setShowScoreboard(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5" /> Standings
          </button>
        </div>
      </header>

      {mode === 'SELECT' ? (
        <div className="grid md:grid-cols-12 gap-6 items-start my-auto">
          <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-inner animate-bounce">
              👑
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Crown & Conclave: Find the Thief</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Enter your player alias and choose your gameplay mode.
              </p>
            </div>

            <div className="max-w-xs mx-auto text-left space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Your Alias</label>
              <input
                type="text"
                maxLength={20}
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                placeholder="Enter your alias..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => {
                  const shuffledPool = [...CULTURAL_BOT_NAMES].sort(() => Math.random() - 0.5);
                  const avatars = ['🧝‍♀️', '⚔️', '🧙‍♂️', '🦹‍♀️', '🛡️', '👑', '🦅'];
                  const finalAlias = aliasInput.trim() || 'Commander';
                  setPlayers([
                    { id: 'user', name: finalAlias, score: 0, roleId: null, isBot: false, avatar: '👑' },
                    { id: 'bot-1', name: shuffledPool[0], score: 0, roleId: null, isBot: true, avatar: avatars[0] },
                    { id: 'bot-2', name: shuffledPool[1], score: 0, roleId: null, isBot: true, avatar: avatars[1] },
                    { id: 'bot-3', name: shuffledPool[2], score: 0, roleId: null, isBot: true, avatar: avatars[2] },
                  ]);
                  setRound(1);
                  setGamePhase('LOBBY');
                  setMode('SOLO');
                }}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500 hover:bg-slate-900 transition flex flex-col items-center gap-3 cursor-pointer group shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-white">Solo vs AI Bots</div>
                <div className="text-[11px] text-slate-400">Play locally with international bots.</div>
              </button>

              <button
                onClick={() => {
                  setMode('MULTIPLEX');
                  navigate('games-quartet-clash');
                }}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-pink-500 hover:bg-slate-900 transition flex flex-col items-center gap-3 cursor-pointer group shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition">
                  <Users className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-white">Multiplayer Online</div>
                <div className="text-[11px] text-slate-400">Create or join real-time rooms.</div>
              </button>
            </div>
          </div>

          {/* Local Storage Leaderboard Widget */}
          <div className="md:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Hall of Fame & Streaks
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Local Storage</span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Games</div>
                <div className="text-sm font-black font-mono text-white">{totalGamesPlayed}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Wins</div>
                <div className="text-sm font-black font-mono text-emerald-400">{totalWins}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Max Streak</div>
                <div className="text-sm font-black font-mono text-amber-400">{longestWinStreak}</div>
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No recorded victories yet. Complete a match to set a high score!
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {leaderboard.map((rec, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded flex items-center justify-center font-black ${idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white">{rec.alias}</div>
                        <div className="text-[10px] text-slate-500">{rec.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-extrabold text-amber-300">{rec.score} pts</div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 justify-end">
                        <Flame className="w-3 h-3 text-orange-400" /> <span>Streak: {rec.winStreak}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : gamePhase === 'LOBBY' ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <button onClick={() => setMode('SELECT')} className="text-xs text-amber-400 hover:underline">← Back to Modes</button>
              </div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2 mt-1">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Royal Court Lobby ({players.length}/10)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Playing as: <strong className="text-amber-300">{aliasInput || 'Commander'}</strong></p>
            </div>

            <div className="flex items-center gap-2">
              {players.length < 10 && (
                <button
                  onClick={handleAddBot}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/35 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Bot className="w-4 h-4" /> + Add AI Bot
                </button>
              )}

              <button
                onClick={() => startRoundAnimation(false)}
                disabled={players.length < 4 || isShuffling || isDealing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-current" /> Deal Cards & Start
              </button>
            </div>
          </div>

          {(isShuffling || isDealing) && (
            <div className="p-8 rounded-2xl bg-amber-950/50 border border-amber-500/60 text-center space-y-4 shadow-2xl animate-fade-in">
              <div className="flex justify-center items-center gap-3">
                <div className="w-12 h-16 rounded-lg bg-amber-600 border border-amber-300 shadow-xl animate-bounce flex items-center justify-center text-white font-bold">🎴</div>
                <div className="w-12 h-16 rounded-lg bg-pink-600 border border-pink-300 shadow-xl animate-bounce [animation-delay:200ms] flex items-center justify-center text-white font-bold">🎴</div>
                <div className="w-12 h-16 rounded-lg bg-purple-600 border border-purple-300 shadow-xl animate-bounce [animation-delay:400ms] flex items-center justify-center text-white font-bold">🎴</div>
              </div>
              <div className="text-lg font-black text-amber-300 animate-pulse">
                {isShuffling ? 'Shuffling Royal Deck...' : 'Dealing Secret Court Ranks...'}
              </div>
              <p className="text-xs text-slate-300 font-mono">May fortune favor the court.</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deck Hierarchy for {players.length} Players:</div>
            <div className="flex flex-wrap items-center gap-2">
              {hierarchy.map((role, index) => (
                <React.Fragment key={role.id}>
                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${role.badge}`}>
                    <RoleIcon roleId={role.id} className="w-3.5 h-3.5" />
                    <span>{role.name}</span>
                    <span className="opacity-75">({role.pts} pts)</span>
                  </div>
                  {index < hierarchy.length - 1 && <span className="text-slate-600 text-xs font-bold">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {players.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-amber-400">
                    {p.isBot ? <Bot className="w-4 h-4 text-indigo-400" /> : idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>{!p.isBot ? (aliasInput || 'Commander') : p.name}</span>
                      {!p.isBot && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">You</span>}
                    </div>
                    <div className="text-xs text-slate-500">{p.isBot ? 'International AI Opponent' : 'Human Player'}</div>
                  </div>
                </div>

                {p.isBot && players.length > 4 && (
                  <button onClick={() => handleRemovePlayer(p.id)} className="text-xs text-slate-500 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-slate-900 cursor-pointer">Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase tracking-wider text-slate-200">Royal Deduction Progress</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">{progressPercent}%</span>
              </div>
              <span>Step {Math.min(currentStep + 1, hierarchy.length - 1)} of {hierarchy.length - 1}</span>
            </div>

            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
              <div className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-emerald-400 transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
            </div>

            {lastSwap?.type === 'SWAP' && (
              <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/80 border-2 border-red-500/60 rounded-3xl p-4 shadow-2xl animate-card-swap flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0 animate-bounce">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">🔄 Secret Card Swap Executed!</div>
                    <div className="text-xs text-slate-300 mt-0.5">{lastSwap.fromName} and {lastSwap.toName} swapped their secret court ranks due to a wrong guess!</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-12 rounded-lg bg-amber-600 border border-amber-300 shadow-xl flex items-center justify-center text-white font-bold text-xs animate-pulse">🎴</div>
                  <ArrowRightLeft className="w-4 h-4 text-red-400" />
                  <div className="w-9 h-12 rounded-lg bg-red-700 border border-red-300 shadow-xl flex items-center justify-center text-white font-bold text-xs animate-pulse">🎴</div>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  {gamePhase === 'PLAYING' && currentSeekerRole && currentTargetRole ? (
                    <>
                      <div className="text-sm font-bold text-white">
                        <span className="text-amber-400 animate-pulse">{currentSeekerPlayer?.id === userPlayer?.id ? (aliasInput || 'Commander') : currentSeekerPlayer?.name}</span> ({currentSeekerRole.name}) is searching for the <span className="text-pink-400 underline">{currentTargetRole.name}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {isMyTurnToGuess ? `👉 YOUR TURN! Choose a suspect below.` : `Observing ${currentSeekerPlayer?.id === userPlayer?.id ? (aliasInput || 'Commander') : currentSeekerPlayer?.name}...`}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-bold text-emerald-400">Round {round} Complete!</div>
                      <div className="text-xs text-slate-400">{lastAction}</div>
                    </>
                  )}
                </div>
              </div>

              {gamePhase === 'ROUND_END' && (
                <button onClick={() => startRoundAnimation(true)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer">
                  <RotateCcw className="w-4 h-4" /> Deal Next Round
                </button>
              )}
            </div>
          </div>

          {myRole && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex items-center gap-4">
              <div className={`w-14 h-16 rounded-2xl bg-gradient-to-br ${myRole.color} border-2 ${myRole.border} flex flex-col items-center justify-center text-white shadow-lg`}>
                <RoleIcon roleId={myRole.id} className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase mt-0.5">{myRole.name}</span>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Secret Card ({aliasInput || 'Commander'})</div>
                <div className="text-lg font-black text-white">{myRole.name} (Worth {myRole.pts} pts)</div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {players.map((p) => {
              const pRole = hierarchy.find(r => r.id === p.roleId);
              const isLocked = lockedPlayerIds.includes(p.id);
              const isActiveSeeker = gamePhase === 'PLAYING' && currentSeekerPlayer?.id === p.id;
              const isMe = p.id === userPlayer?.id;
              const isRoleRevealed = isMe || isLocked || isActiveSeeker || gamePhase === 'ROUND_END';
              const isExcludedThisStep = gamePhase === 'PLAYING' && stepExcludedIds.includes(p.id);
              const canBeGuessed = isMyTurnToGuess && !isLocked && !isActiveSeeker && !isExcludedThisStep && !isMe;
              const displayName = isMe ? (aliasInput || 'Commander') : p.name;

              return (
                <div
                  key={p.id}
                  onClick={() => canBeGuessed && handleGuessPlayer(p.id, false)}
                  className={`relative rounded-3xl p-4 border transition-all duration-500 flex flex-col justify-between min-h-[195px] overflow-hidden ${
                    isActiveSeeker ? 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-amber-950/70 border-2 border-amber-400 ring-8 ring-amber-400/30 shadow-2xl shadow-amber-500/40 scale-[1.03] z-10' :
                    isLocked ? 'bg-emerald-950/25 border-emerald-500/50' :
                    canBeGuessed ? 'bg-slate-900 hover:bg-slate-800 border-pink-500/50 cursor-pointer shadow-lg' :
                    'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  {isActiveSeeker && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 animate-pulse" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span className={isActiveSeeker ? 'text-amber-300 font-black' : ''}>{displayName}</span>
                        {isMe && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">You</span>}
                      </div>
                      <div className="text-xs text-slate-400 font-semibold mt-0.5">
                        Score: <span className="text-amber-300 font-mono font-bold">{p.score || 0} pts</span>
                      </div>
                    </div>

                    {isLocked && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">Locked</span>}
                    {isActiveSeeker && (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black uppercase tracking-wider animate-bounce shadow-lg flex items-center gap-1">
                          <Search className="w-3 h-3" /> Active Seeker
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-mono font-black text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-500/40 animate-pulse">
                          <span>⏱️ {turnTimeLeft}s left</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="my-3 flex items-center justify-center">
                    {isRoleRevealed && pRole ? (
                      <div className={`w-full py-3 px-4 rounded-2xl bg-gradient-to-r ${pRole.color} border ${pRole.border} text-white flex items-center justify-between shadow-inner`}>
                        <div className="flex items-center gap-2.5">
                          <RoleIcon roleId={pRole.id} className="w-5 h-5" />
                          <div>
                            <div className="font-black text-sm uppercase">{pRole.name}</div>
                            <div className="text-[11px] opacity-90">{pRole.pts} Pts</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`w-full py-3.5 px-4 rounded-2xl bg-slate-950 border flex items-center justify-between text-slate-400 ${canBeGuessed ? 'border-pink-500/40 bg-pink-950/10' : 'border-slate-800'}`}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-pink-500/15 border border-pink-500/40 text-pink-300 flex items-center justify-center font-bold">?</div>
                          <div className="font-bold text-xs text-slate-200">Unrevealed Suspect</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {canBeGuessed ? (
                      <button className="w-full py-2 px-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow">
                        Guess as {currentTargetRole?.name}
                      </button>
                    ) : (
                      <div className="text-center text-[11px] text-slate-500 py-1">
                        {isLocked ? 'Role Confirmed' : isExcludedThisStep ? 'Ruled Out' : 'Active Court Member'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showWinnerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 via-pink-500 to-emerald-400 animate-pulse" />
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-inner animate-bounce">
                👑
              </div>
              <h3 className="text-2xl font-black text-white">Round {round} Complete!</h3>
              <p className="text-xs text-slate-300">
                The final Pawn has exposed the Thief! Here is the complete royal court summary.
              </p>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {[...players]
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((p, idx) => {
                  const pRole = hierarchy.find(r => r.id === p.roleId);
                  const isTopWinner = idx === 0;
                  return (
                    <div key={p.id} className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs ${isTopWinner ? 'bg-amber-950/40 border-amber-500/60' : 'bg-slate-950 border-slate-800'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black ${isTopWinner ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{p.id === userPlayer?.id ? (aliasInput || 'Commander') : p.name}</span>
                            {isTopWinner && <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">Winner</span>}
                          </div>
                          <div className="text-[10px] text-slate-400">{p.isBot ? 'International AI' : 'Human Player'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {pRole && (
                          <div className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 ${pRole.badge}`}>
                            <RoleIcon roleId={pRole.id} className="w-3.5 h-3.5" />
                            <span>{pRole.name}</span>
                          </div>
                        )}
                        <div className="text-right font-mono font-black text-amber-300 text-sm">
                          {p.score || 0} pts
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowWinnerModal(false);
                  startRoundAnimation(true);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Deal Next Round
              </button>
              <button
                onClick={() => {
                  setShowWinnerModal(false);
                  setGamePhase('LOBBY');
                }}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
              >
                Lobby
              </button>
            </div>
          </div>
        </div>
      )}

      {showRules && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-400">Rules of Find the Thief</h3>
            <p className="text-sm text-slate-300">King hunts Queen, Queen hunts Bishop, down to Pawn and Thief. Wrong guesses cause card swaps!</p>
            <button onClick={() => setShowRules(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer">Close</button>
          </div>
        </div>
      )}

      {showScoreboard && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-400">Standings & Local Leaderboard</h3>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Games</div>
                <div className="text-sm font-black font-mono text-white">{totalGamesPlayed}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Wins</div>
                <div className="text-sm font-black font-mono text-emerald-400">{totalWins}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Max Streak</div>
                <div className="text-sm font-black font-mono text-amber-400">{longestWinStreak}</div>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {leaderboard.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">No high scores recorded yet.</div>
              ) : (
                leaderboard.map((rec, idx) => (
                  <div key={idx} className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <span>#{idx+1} {rec.alias} (Streak: {rec.winStreak})</span>
                    <span className="font-mono font-bold text-amber-300">{rec.score} pts</span>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setShowScoreboard(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
