import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useNavigation } from '../../context/NavigationContext';
import { CourtRole, CourtRoleId, ThiefPlayer, GameLog } from '../../types/findTheThief';
import { sound } from '../../utils/soundEngine';
import { useActivityMetrics, incrementMetric } from '../../utils/activityMetrics';
import {
  ArrowLeft,
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
} from 'lucide-react';

const COURT_ROLES: CourtRole[] = [
  {
    id: 'KING',
    name: 'King',
    pts: 1000,
    color: 'from-amber-400 to-amber-600',
    border: 'border-amber-400',
    text: 'text-amber-300',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    order: 0,
  },
  {
    id: 'QUEEN',
    name: 'Queen',
    pts: 900,
    color: 'from-pink-500 to-rose-600',
    border: 'border-pink-400',
    text: 'text-pink-300',
    badge: 'bg-pink-950/80 text-pink-300 border-pink-500/40',
    order: 1,
  },
  {
    id: 'BISHOP',
    name: 'Bishop',
    pts: 800,
    color: 'from-purple-500 to-indigo-700',
    border: 'border-purple-400',
    text: 'text-purple-300',
    badge: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
    order: 2,
  },
  {
    id: 'KNIGHT',
    name: 'Knight',
    pts: 700,
    color: 'from-blue-500 to-blue-700',
    border: 'border-blue-400',
    text: 'text-blue-300',
    badge: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
    order: 3,
  },
  {
    id: 'PAWN',
    name: 'Pawn',
    pts: 300,
    color: 'from-slate-500 to-slate-700',
    border: 'border-slate-300',
    text: 'text-slate-200',
    badge: 'bg-slate-800 text-slate-200 border-slate-500/40',
    order: 4,
  },
  {
    id: 'THIEF',
    name: 'Thief',
    pts: 0,
    color: 'from-red-600 via-rose-800 to-slate-900',
    border: 'border-red-500',
    text: 'text-red-400',
    badge: 'bg-red-950/80 text-red-300 border-red-500/40',
    order: 5,
  },
];

export const FindTheThiefGame: React.FC = () => {
  const { navigate } = useNavigation();
  const { metrics } = useActivityMetrics();

  // Modals & Settings
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showScoreboard, setShowScoreboard] = useState<boolean>(false);

  // Match State
  const [round, setRound] = useState<number>(1);
  const [gamePhase, setGamePhase] = useState<'SEEKING' | 'ROUND_OVER'>('SEEKING');
  const [players, setPlayers] = useState<ThiefPlayer[]>([
    { id: 'user', name: 'You (Lord Commander)', score: 0, roleId: null, isBot: false, avatar: '👑' },
    { id: 'bot-1', name: 'Lord Sarah', score: 0, roleId: null, isBot: true, avatar: '🧝‍♀️' },
    { id: 'bot-2', name: 'Sir Michael', score: 0, roleId: null, isBot: true, avatar: '⚔️' },
    { id: 'bot-3', name: 'Baron Alex', score: 0, roleId: null, isBot: true, avatar: '🧙‍♂️' },
    { id: 'bot-4', name: 'Lady Jessica', score: 0, roleId: null, isBot: true, avatar: '🦹‍♀️' },
    { id: 'bot-5', name: 'Squire David', score: 0, roleId: null, isBot: true, avatar: '🛡️' },
  ]);

  const [logs, setLogs] = useState<GameLog[]>([]);
  const [roundResult, setRoundResult] = useState<{
    success: boolean;
    accusedPlayer: ThiefPlayer;
    actualThief: ThiefPlayer;
    seeker: ThiefPlayer;
  } | null>(null);

  // Setup / Deal Roles for the round
  const startNewRound = () => {
    // 6 roles for 6 players
    const rolesPool = [...COURT_ROLES];
    // Shuffle roles
    for (let i = rolesPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rolesPool[i], rolesPool[j]] = [rolesPool[j], rolesPool[i]];
    }

    const assignedPlayers = players.map((p, idx) => ({
      ...p,
      roleId: rolesPool[idx].id,
    }));

    setPlayers(assignedPlayers);
    setGamePhase('SEEKING');
    setRoundResult(null);

    const kingPlayer = assignedPlayers.find((p) => p.roleId === 'KING')!;
    setLogs([
      {
        id: 'log-' + Date.now(),
        text: `Round ${round} began. ${kingPlayer.name} is crowned the King & Royal Seeker!`,
        type: 'info',
        timestamp: Date.now(),
      },
      {
        id: 'log-' + (Date.now() + 1),
        text: `The Royal Treasury has been infiltrated! The King must investigate and unmask the Thief.`,
        type: 'info',
        timestamp: Date.now(),
      },
    ]);

    // If King is a bot, simulate bot deduction after 2.5s
    if (kingPlayer.isBot) {
      setTimeout(() => {
        handleBotSeekerTurn(kingPlayer, assignedPlayers);
      }, 2500);
    }
  };

  useEffect(() => {
    startNewRound();
  }, [round]);

  const kingPlayer = players.find((p) => p.roleId === 'KING') || players[0];
  const userPlayer = players.find((p) => !p.isBot)!;
  const isUserKing = kingPlayer.id === userPlayer.id;

  // Bot seeker logic
  const handleBotSeekerTurn = (seeker: ThiefPlayer, currentPlayers: ThiefPlayer[]) => {
    const candidates = currentPlayers.filter((p) => p.id !== seeker.id);
    // Bot has a 60% chance to pick based on randomized suspicion
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    resolveAccusation(seeker, target, currentPlayers);
  };

  // Human player accuses
  const handleUserAccusation = (target: ThiefPlayer) => {
    if (gamePhase !== 'SEEKING' || !isUserKing || target.id === userPlayer.id) return;
    resolveAccusation(userPlayer, target, players);
  };

  const resolveAccusation = (
    seeker: ThiefPlayer,
    target: ThiefPlayer,
    currentPlayers: ThiefPlayer[]
  ) => {
    const thief = currentPlayers.find((p) => p.roleId === 'THIEF')!;
    const isSuccess = target.id === thief.id;

    const newLogs: GameLog[] = [
      ...logs,
      {
        id: 'log-' + Date.now(),
        text: `⚖️ ${seeker.name} formally accused ${target.name} of being the Thief!`,
        type: 'accusation',
        timestamp: Date.now(),
      },
    ];

    if (isSuccess) {
      sound.playQuartetSuccess();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      newLogs.push({
        id: 'log-' + (Date.now() + 1),
        text: `🎉 Justice delivered! ${target.name} was indeed the Thief. The Crown secures all honors!`,
        type: 'success',
        timestamp: Date.now(),
      });

      // Award points to court members
      const updated = currentPlayers.map((p) => {
        if (p.roleId === 'THIEF') return p;
        const role = COURT_ROLES.find((r) => r.id === p.roleId);
        return { ...p, score: p.score + (role?.pts || 300) };
      });
      setPlayers(updated);
    } else {
      sound.playAlert(false);
      newLogs.push({
        id: 'log-' + (Date.now() + 1),
        text: `💀 Calamity! ${target.name} was an innocent noble (${target.roleId}). The Thief was actually ${thief.name}, who stole 1000 gold!`,
        type: 'failure',
        timestamp: Date.now(),
      });

      // Thief steals points
      const updated = currentPlayers.map((p) => {
        if (p.id === thief.id) {
          return { ...p, score: p.score + 1000 };
        }
        return p;
      });
      setPlayers(updated);
    }

    setLogs(newLogs);
    setGamePhase('ROUND_OVER');
    setRoundResult({
      success: isSuccess,
      accusedPlayer: target,
      actualThief: thief,
      seeker,
    });
    incrementMetric('findTheThiefMatches');
  };

  const getRoleIcon = (roleId: CourtRoleId | null) => {
    switch (roleId) {
      case 'KING':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'QUEEN':
        return <Crown className="w-5 h-5 text-pink-400" />;
      case 'BISHOP':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'KNIGHT':
        return <Swords className="w-5 h-5 text-blue-400" />;
      case 'PAWN':
        return <Footprints className="w-5 h-5 text-slate-400" />;
      case 'THIEF':
        return <Skull className="w-5 h-5 text-red-500" />;
      default:
        return <Shield className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-6xl mx-auto w-full p-3 sm:p-5 gap-4">
      {/* Top Header */}
      <header className="bg-slate-900/90 border border-amber-900/40 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('games')}
            className="text-slate-400 hover:text-white transition flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Hub
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🕵️</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent">
                  Crown & Conclave: Find the Thief
                </h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  v1.6
                </span>
              </div>
              <p className="text-[10px] text-amber-400/80 font-medium tracking-wide uppercase">
                Medieval Royal Deduction Game
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Matches Completed: <strong className="text-white font-mono">{metrics.findTheThiefMatches}</strong></span>
          </div>

          <button
            onClick={() => setShowRules(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Court Roles</span>
          </button>

          <button
            onClick={() => setShowScoreboard(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Scores</span>
          </button>

          <button
            onClick={() => {
              setRound((prev) => prev + 1);
            }}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md shadow-amber-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Round</span>
          </button>
        </div>
      </header>

      {/* Secret Identity Banner for User */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-2xl">
            {userPlayer.avatar}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Your Secret Identity This Round:
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base sm:text-lg font-black text-white">
                {userPlayer.roleId}
              </span>
              {getRoleIcon(userPlayer.roleId)}
              <span className="text-xs text-slate-400">
                ({COURT_ROLES.find((r) => r.id === userPlayer.roleId)?.pts || 0} pts)
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">The Crown Seeker:</div>
          <div className="text-sm font-bold text-amber-400 flex items-center gap-1 justify-end">
            <Crown className="w-4 h-4" /> {kingPlayer.name}
          </div>
        </div>
      </div>

      {/* Court Suspects Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isUserKing
              ? '👑 You are the King! Click a suspected noble to accuse them of being the Thief:'
              : 'Royal Conclave in session... Awaiting King’s verdict'}
          </span>
          <span className="text-xs text-slate-400 font-mono">Round {round}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {players.map((suspect) => {
            const isUser = suspect.id === userPlayer.id;
            const isSeeker = suspect.id === kingPlayer.id;
            const isRevealed = gamePhase === 'ROUND_OVER';

            return (
              <div
                key={suspect.id}
                onClick={() => isUserKing && !isUser && handleUserAccusation(suspect)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between h-44 shadow-lg relative ${
                  isSeeker
                    ? 'border-amber-400 bg-amber-950/20'
                    : isUserKing && !isUser && gamePhase === 'SEEKING'
                    ? 'border-slate-700 bg-slate-900/80 hover:border-red-400 hover:bg-slate-900 cursor-pointer card-hover-lift'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl">{suspect.avatar}</span>
                  {isSeeker ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Crown
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">
                      Score: {suspect.score}
                    </span>
                  )}
                </div>

                <div className="my-2">
                  <h3 className="font-bold text-white text-sm truncate">{suspect.name}</h3>
                  <div className="text-xs text-slate-400 mt-1">
                    {isRevealed || isUser ? (
                      <span className="font-bold flex items-center gap-1">
                        {getRoleIcon(suspect.roleId)} {suspect.roleId}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Identity Hidden</span>
                    )}
                  </div>
                </div>

                {/* Accuse Action for King */}
                {isUserKing && !isUser && gamePhase === 'SEEKING' && (
                  <button
                    onClick={() => handleUserAccusation(suspect)}
                    className="w-full py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1"
                  >
                    <Skull className="w-3.5 h-3.5" /> Accuse as Thief!
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Round Result & Investigation Logs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Court Inquest Log
          </span>
          {gamePhase === 'ROUND_OVER' && (
            <button
              onClick={() => setRound((prev) => prev + 1)}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              Next Round &rarr;
            </button>
          )}
        </div>

        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded-lg font-medium flex items-center gap-2 ${
                log.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-800/40 text-emerald-300'
                  : log.type === 'failure'
                  ? 'bg-rose-950/60 border border-rose-800/40 text-rose-300'
                  : log.type === 'accusation'
                  ? 'bg-amber-950/60 border border-amber-800/40 text-amber-300'
                  : 'bg-slate-950/60 text-slate-300'
              }`}
            >
              <span>{log.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" /> Crown & Conclave Roles
              </h3>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs sm:text-sm text-slate-300 space-y-2.5 max-h-80 overflow-y-auto pr-1">
              <p>
                The court meets in secret council. A thief is in their midst!
              </p>
              {COURT_ROLES.map((role) => (
                <div
                  key={role.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {getRoleIcon(role.id)}
                    <div>
                      <div className="font-bold text-white text-xs">{role.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {role.id === 'KING'
                          ? 'Royal Seeker: Must identify the Thief'
                          : role.id === 'THIEF'
                          ? 'The Saboteur: Wins 1000 gold if not unmasked'
                          : 'Loyal Courtier: Earns points if Thief is caught'}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {role.pts} pts
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRules(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoreboard Modal */}
      {showScoreboard && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> Conclave Standings
              </h3>
              <button
                onClick={() => setShowScoreboard(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {[...players]
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-slate-500 font-bold">#{idx + 1}</span>
                      <span className="text-xl">{p.avatar}</span>
                      <span className="text-xs font-bold text-white">{p.name}</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-amber-400">{p.score} pts</span>
                  </div>
                ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowScoreboard(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
