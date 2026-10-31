import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useNavigation } from '../../context/NavigationContext';
import { Card, GameTheme, Player } from '../../types/quartetClash';
import { sound } from '../../utils/soundEngine';
import {
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Archive,
  Volume2,
  VolumeX,
  Trophy,
  ArrowRight,
  Sparkles,
  X,
  Palette,
} from 'lucide-react';

const DECK_THEMES: GameTheme[] = [
  {
    id: 'animals',
    name: 'Animals',
    items: [
      { id: 'LION', name: 'Lion', icon: '🦁', color: '#f59e0b' },
      { id: 'TIGER', name: 'Tiger', icon: '🐯', color: '#ea580c' },
      { id: 'EAGLE', name: 'Eagle', icon: '🦅', color: '#3b82f6' },
      { id: 'BEAR', name: 'Bear', icon: '🐻', color: '#854d0e' },
      { id: 'WOLF', name: 'Wolf', icon: '🐺', color: '#64748b' },
      { id: 'FOX', name: 'Fox', icon: '🦊', color: '#f97316' },
    ],
  },
  {
    id: 'superheroes',
    name: 'Superheroes',
    items: [
      { id: 'HERO_THUNDER', name: 'Thunder Bolt', icon: '⚡', color: '#eab308' },
      { id: 'HERO_FLAME', name: 'Solar Flame', icon: '🔥', color: '#ef4444' },
      { id: 'HERO_SHIELD', name: 'Titan Shield', icon: '🛡️', color: '#3b82f6' },
      { id: 'HERO_SHADOW', name: 'Shadow Knight', icon: '🌑', color: '#8b5cf6' },
      { id: 'HERO_FROST', name: 'Ice Mystic', icon: '❄️', color: '#06b6d4' },
      { id: 'HERO_GAIA', name: 'Earth Brawn', icon: '🌿', color: '#10b981' },
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean Life',
    items: [
      { id: 'OCTOPUS', name: 'Octopus', icon: '🐙', color: '#ec4899' },
      { id: 'SHARK', name: 'Mako Shark', icon: '🦈', color: '#0ea5e9' },
      { id: 'WHALE', name: 'Blue Whale', icon: '🐋', color: '#2563eb' },
      { id: 'CRAB', name: 'Coral Crab', icon: '🦀', color: '#f43f5e' },
      { id: 'TURTLE', name: 'Sea Turtle', icon: '🐢', color: '#10b981' },
      { id: 'SEAHORSE', name: 'Seahorse', icon: '🐡', color: '#a855f7' },
    ],
  },
  {
    id: 'space',
    name: 'Planets',
    items: [
      { id: 'MARS', name: 'Mars', icon: '🔴', color: '#ef4444' },
      { id: 'JUPITER', name: 'Jupiter', icon: '🪐', color: '#f59e0b' },
      { id: 'EARTH', name: 'Earth', icon: '🌍', color: '#3b82f6' },
      { id: 'NEPTUNE', name: 'Neptune', icon: '🌀', color: '#6366f1' },
      { id: 'VENUS', name: 'Venus', icon: '🟡', color: '#eab308' },
      { id: 'SATURN', name: 'Saturn', icon: '✨', color: '#d97706' },
    ],
  },
  {
    id: 'gaming',
    name: 'Video Games',
    items: [
      { id: 'SWORD', name: 'Master Blade', icon: '⚔️', color: '#3b82f6' },
      { id: 'POTION', name: 'Mana Potion', icon: '🧪', color: '#a855f7' },
      { id: 'CHEST', name: 'Treasure Chest', icon: '🪙', color: '#f59e0b' },
      { id: 'JOYSTICK', name: 'Retro Arcade', icon: '🕹️', color: '#ec4899' },
      { id: 'GEM', name: 'Soul Diamond', icon: '💎', color: '#06b6d4' },
      { id: 'DRAGON', name: 'Final Boss', icon: '🐉', color: '#ef4444' },
    ],
  },
];

export const QuartetClashGame: React.FC = () => {
  const { navigate } = useNavigation();

  // Settings & Modals
  const [currentThemeId, setCurrentThemeId] = useState<string>('animals');
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showVault, setShowVault] = useState<boolean>(false);
  const [showScoreboard, setShowScoreboard] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Match State
  const [round, setRound] = useState<number>(1);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [turnMessage, setTurnMessage] = useState<string>('Select 1 card from your hand to pass clockwise!');
  const [isPassing, setIsPassing] = useState<boolean>(false);
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);

  // Players
  const [players, setPlayers] = useState<Player[]>([]);

  // Build deck for 4 players (4 sets of 4 cards = 16 cards total)
  const generateDeck = (themeId: string): Card[] => {
    const theme = DECK_THEMES.find((t) => t.id === themeId) || DECK_THEMES[0];
    const chosenItems = theme.items.slice(0, 4); // 4 distinct sets

    const deck: Card[] = [];
    chosenItems.forEach((item) => {
      for (let n = 1; n <= 4; n++) {
        deck.push({
          id: `${item.id}-${n}-${Math.random().toString(36).substring(2, 6)}`,
          setId: item.id,
          name: item.name,
          icon: item.icon,
          theme: theme.name,
          numberInSet: n,
          color: item.color,
          bgColor: '#0f172a',
        });
      }
    });

    // Shuffle deck thoroughly
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  };

  // Initialize new game / round
  const startNewMatch = (themeId = currentThemeId) => {
    const deck = generateDeck(themeId);

    const newPlayers: Player[] = [
      {
        id: 'p1',
        name: 'You (P1)',
        isHuman: true,
        hand: deck.slice(0, 4),
        score: players.find((p) => p.id === 'p1')?.score || 0,
        completedQuartets: [],
        avatar: '🤠',
      },
      {
        id: 'p2',
        name: 'Alex (P2)',
        isHuman: false,
        hand: deck.slice(4, 8),
        score: players.find((p) => p.id === 'p2')?.score || 0,
        completedQuartets: [],
        avatar: '🦊',
      },
      {
        id: 'p3',
        name: 'Sarah (P3)',
        isHuman: false,
        hand: deck.slice(8, 12),
        score: players.find((p) => p.id === 'p3')?.score || 0,
        completedQuartets: [],
        avatar: '🦉',
      },
      {
        id: 'p4',
        name: 'David (P4)',
        isHuman: false,
        hand: deck.slice(12, 16),
        score: players.find((p) => p.id === 'p4')?.score || 0,
        completedQuartets: [],
        avatar: '🐻',
      },
    ];

    setPlayers(newPlayers);
    setSelectedCardId(null);
    setTurnMessage('Select 1 card from your hand to pass clockwise!');
    setWinnerMessage(null);
    setIsPassing(false);
  };

  useEffect(() => {
    startNewMatch();
  }, [currentThemeId]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  // Helper: check if a hand has 4 of a kind
  const checkQuartet = (hand: Card[]): string | null => {
    const counts: Record<string, number> = {};
    hand.forEach((c) => {
      counts[c.setId] = (counts[c.setId] || 0) + 1;
    });

    for (const [setId, count] of Object.entries(counts)) {
      if (count === 4) return setId;
    }
    return null;
  };

  // Bot AI logic to select which card to pass
  const pickBotCardToPass = (hand: Card[]): Card => {
    // Count occurrences of each set
    const counts: Record<string, number> = {};
    hand.forEach((c) => {
      counts[c.setId] = (counts[c.setId] || 0) + 1;
    });

    // Find sets with minimum cards (e.g. 1 card of that set)
    let minCount = 5;
    let worstSetId = hand[0].setId;
    Object.entries(counts).forEach(([setId, count]) => {
      if (count < minCount) {
        minCount = count;
        worstSetId = setId;
      }
    });

    const candidates = hand.filter((c) => c.setId === worstSetId);
    return candidates[0] || hand[0];
  };

  // Handle card pass turn
  const handlePassCard = () => {
    if (!selectedCardId || isPassing) return;

    setIsPassing(true);
    sound.playPassCard();

    // Determine the card each player passes
    // P1 (Human) passes selectedCardId to P2
    const human = players[0];
    const humanPassedCard = human.hand.find((c) => c.id === selectedCardId)!;

    // Bots pick their card to pass
    const p2PassedCard = pickBotCardToPass(players[1].hand);
    const p3PassedCard = pickBotCardToPass(players[2].hand);
    const p4PassedCard = pickBotCardToPass(players[3].hand);

    setTimeout(() => {
      // Clockwise passing:
      // P1 passes to P2
      // P2 passes to P3
      // P3 passes to P4
      // P4 passes to P1
      const newP1Hand = [...human.hand.filter((c) => c.id !== humanPassedCard.id), p4PassedCard];
      const newP2Hand = [...players[1].hand.filter((c) => c.id !== p2PassedCard.id), humanPassedCard];
      const newP3Hand = [...players[2].hand.filter((c) => c.id !== p3PassedCard.id), p2PassedCard];
      const newP4Hand = [...players[3].hand.filter((c) => c.id !== p4PassedCard.id), p3PassedCard];

      const updatedPlayers: Player[] = [
        { ...human, hand: newP1Hand },
        { ...players[1], hand: newP2Hand },
        { ...players[2], hand: newP3Hand },
        { ...players[3], hand: newP4Hand },
      ];

      // Check for Quartets
      let roundWinner: Player | null = null;
      let winningSetId = '';

      for (const p of updatedPlayers) {
        const quart = checkQuartet(p.hand);
        if (quart) {
          roundWinner = p;
          winningSetId = quart;
          break;
        }
      }

      if (roundWinner) {
        // We have a winner!
        roundWinner.score += 100;
        roundWinner.completedQuartets.push(winningSetId);

        setPlayers(updatedPlayers);
        setSelectedCardId(null);
        setIsPassing(false);

        const isUserWin = roundWinner.id === 'p1';
        if (isUserWin) {
          sound.playVictoryFanfare();
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          setWinnerMessage(`🎉 QUARTET! You completed the 4-of-a-kind set and won 100 points!`);
        } else {
          sound.playAlert(false);
          setWinnerMessage(`⚡ QUARTET! ${roundWinner.name} collected all 4 cards and won Round ${round}!`);
        }
      } else {
        setPlayers(updatedPlayers);
        setSelectedCardId(null);
        setIsPassing(false);
        setTurnMessage(`Cards passed clockwise! Look at your new card from ${players[3].name}.`);
      }
    }, 400);
  };

  const handleCardClick = (card: Card) => {
    if (winnerMessage || isPassing) return;
    sound.playCardClick();
    setSelectedCardId(card.id === selectedCardId ? null : card.id);
  };

  const startNextRound = () => {
    setRound((prev) => prev + 1);
    startNewMatch();
  };

  const currentTheme = DECK_THEMES.find((t) => t.id === currentThemeId) || DECK_THEMES[0];
  const humanPlayer = players[0] || null;

  return (
    <div className="flex-1 flex flex-col justify-between max-w-6xl mx-auto w-full p-3 sm:p-5 gap-4">
      {/* Header Bar */}
      <header className="bg-slate-900/90 border border-emerald-900/50 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('games')}
            className="text-slate-400 hover:text-white transition flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Hub
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold bg-gradient-to-r from-emerald-300 to-amber-200 bg-clip-text text-transparent">
                  Quartet Clash
                </h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  v3.2
                </span>
              </div>
              <p className="text-[10px] text-emerald-400/80 font-medium tracking-wide uppercase">
                4-of-a-Kind Fast Passing Showdown
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="relative">
            <select
              value={currentThemeId}
              onChange={(e) => setCurrentThemeId(e.target.value)}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
            >
              {DECK_THEMES.map((th) => (
                <option key={th.id} value={th.id}>
                  Theme: {th.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowVault(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
            title="View card deck vault"
          >
            <Archive className="w-4 h-4" />
            <span className="hidden md:inline">Vault</span>
          </button>

          <button
            onClick={() => setShowRules(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            onClick={() => setShowScoreboard(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Scores</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Toggle sound effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => startNewMatch()}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </header>

      {/* Top Status & Round Banner */}
      <div className="bg-slate-900/80 border border-emerald-800/40 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
            Round {round}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-emerald-300 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>{turnMessage}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="text-slate-400">
            Passing: <strong className="text-emerald-400">Clockwise (➔ P2 ➔ P3 ➔ P4 ➔ You)</strong>
          </span>
        </div>
      </div>

      {/* Opponents Area (Top Row) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Opponents at Table
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">3 AI Players</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {players.slice(1).map((bot) => (
            <div
              key={bot.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-between relative shadow-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{bot.avatar}</span>
                <div>
                  <div className="text-xs font-bold text-white">{bot.name}</div>
                  <div className="text-[10px] text-amber-400 font-mono font-bold">
                    {bot.score} pts
                  </div>
                </div>
              </div>

              {/* Bot Card Backs */}
              <div className="flex items-center -space-x-4 py-1">
                {bot.hand.map((_, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-14 rounded-lg bg-gradient-to-br from-emerald-900 to-slate-900 border border-emerald-500/40 shadow-sm flex items-center justify-center text-xs font-bold text-emerald-400/60 transition-transform hover:-translate-y-1"
                  >
                    ⚡
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Table Passing Centerpiece */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900/90 via-emerald-950/40 to-slate-900/90 border border-emerald-900/50 p-4 flex flex-wrap items-center justify-between shadow-inner gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
            🃏
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white">
              {selectedCardId
                ? `Ready to pass selected card to ${players[1]?.name || 'Alex'}`
                : 'Select 1 card from your hand below to pass'}
            </div>
            <div className="text-[11px] text-slate-400">
              Collect all 4 cards of any set to trigger Quartet & win 100 pts!
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={handlePassCard}
            disabled={!selectedCardId || isPassing || !!winnerMessage}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
          >
            <span>Pass Card</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Player's Hand Area */}
      {humanPlayer && (
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{humanPlayer.avatar}</span>
              <span className="text-sm font-bold text-white">{humanPlayer.name} Hand</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                {humanPlayer.score} pts
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Click a card to select / unselect for passing
            </span>
          </div>

          {/* Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {humanPlayer.hand.map((card) => {
              const isSelected = card.id === selectedCardId;
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between h-44 sm:h-48 shadow-lg ${
                    isSelected
                      ? 'border-amber-400 bg-amber-950/40 -translate-y-3 ring-4 ring-amber-400/30'
                      : 'border-slate-700 bg-slate-950/80 hover:-translate-y-1 hover:border-emerald-500/60'
                  }`}
                  style={{
                    boxShadow: isSelected ? `0 10px 25px -5px ${card.color}40` : undefined,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                      #{card.numberInSet}/4
                    </span>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: card.color }}
                    />
                  </div>

                  <div className="text-center space-y-1">
                    <div className="text-4xl sm:text-5xl">{card.icon}</div>
                    <div className="text-sm sm:text-base font-black text-white tracking-wide">
                      {card.name}
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                      Set: {card.setId}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Winner Overlay Modal */}
      {winnerMessage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mx-auto">
              🏆
            </div>
            <h2 className="text-2xl font-black text-white">Round Completed!</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{winnerMessage}</p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={startNextRound}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-lg transition cursor-pointer"
              >
                Proceed to Round {round + 1}
              </button>
              <button
                onClick={() => setShowScoreboard(true)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                View Match Standings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" /> Quartet Clash Rules
              </h3>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong>Objective:</strong> Be the first player to collect all <strong>4 identical cards</strong> of a set.
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-400">
                <li>Each player receives 4 cards from a 16-card themed deck (4 sets &times; 4 cards).</li>
                <li>On each turn, you select 1 card from your hand to pass to the next player.</li>
                <li>All 4 players pass simultaneously in clockwise direction.</li>
                <li>The first player to hold all 4 cards of any set shouts <em>QUARTET</em> and scores 100 points!</li>
              </ol>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRules(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Got It
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
                <Trophy className="w-5 h-5 text-amber-400" /> Match Standings
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

      {/* Card Vault Modal */}
      {showVault && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Archive className="w-5 h-5 text-amber-400" /> Card Vault - {currentTheme.name}
              </h3>
              <button onClick={() => setShowVault(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-3 p-1">
              {currentTheme.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-2"
                >
                  <div className="text-3xl">{item.icon}</div>
                  <div className="text-xs font-bold text-white">{item.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">4 Cards in Deck</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowVault(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
