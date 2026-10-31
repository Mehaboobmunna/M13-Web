import React, { useState, useEffect, useMemo } from 'react';
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
  Layers,
  CloudRain,
  Flame,
  Award,
  Frown,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
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

interface PassTransfer {
  fromName: string;
  toName: string;
  fromAvatar: string;
  toAvatar: string;
  card: Card;
  directionLabel: string;
}

interface ResultModalData {
  isUserWinner: boolean;
  winner: Player;
  winningSetId: string;
  winningItemName: string;
  winningItemIcon: string;
  winningItemColor: string;
}

export const QuartetClashGame: React.FC = () => {
  const { navigate } = useNavigation();

  // Settings & Modals
  const [currentThemeId, setCurrentThemeId] = useState<string>('animals');
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showVault, setShowVault] = useState<boolean>(false);
  const [showScoreboard, setShowScoreboard] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Hand layout mode: 'stacked' (groups duplicate cards) vs 'spread'
  const [handViewMode, setHandViewMode] = useState<'stacked' | 'spread'>('stacked');
  const [expandedStackId, setExpandedStackId] = useState<string | null>(null);

  // Match State
  const [round, setRound] = useState<number>(1);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [turnMessage, setTurnMessage] = useState<string>('Select 1 card from your hand to pass clockwise!');
  const [isPassing, setIsPassing] = useState<boolean>(false);
  const [activeTransfers, setActiveTransfers] = useState<PassTransfer[]>([]);
  const [receivedCardId, setReceivedCardId] = useState<string | null>(null);
  const [resultModal, setResultModal] = useState<ResultModalData | null>(null);

  // Rain particle positions for defeat animation
  const rainDrops = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => ({
      id: i,
      left: `${(i * 3.1 + (i % 5) * 4) % 100}%`,
      delay: `${(i * 0.12) % 1.5}s`,
      duration: `${0.7 + (i % 4) * 0.15}s`,
      opacity: 0.3 + (i % 5) * 0.15,
      height: `${24 + (i % 6) * 10}px`,
    }));
  }, []);

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
    setReceivedCardId(null);
    setTurnMessage('Select 1 card from your hand to pass clockwise!');
    setResultModal(null);
    setIsPassing(false);
    setActiveTransfers([]);
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
    const counts: Record<string, number> = {};
    hand.forEach((c) => {
      counts[c.setId] = (counts[c.setId] || 0) + 1;
    });

    // Pass the card from the set with the fewest cards in hand
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

  // Handle card pass turn with full clockwise card flight animation
  const handlePassCard = () => {
    if (!selectedCardId || isPassing || resultModal) return;

    const human = players[0];
    const humanPassedCard = human.hand.find((c) => c.id === selectedCardId);
    if (!humanPassedCard) return;

    // Bots pick their card to pass
    const p2PassedCard = pickBotCardToPass(players[1].hand);
    const p3PassedCard = pickBotCardToPass(players[2].hand);
    const p4PassedCard = pickBotCardToPass(players[3].hand);

    // Setup active visual card transfers
    const transfers: PassTransfer[] = [
      {
        fromName: human.name,
        toName: players[1].name,
        fromAvatar: human.avatar,
        toAvatar: players[1].avatar,
        card: humanPassedCard,
        directionLabel: 'You ➔ Alex',
      },
      {
        fromName: players[1].name,
        toName: players[2].name,
        fromAvatar: players[1].avatar,
        toAvatar: players[2].avatar,
        card: p2PassedCard,
        directionLabel: 'Alex ➔ Sarah',
      },
      {
        fromName: players[2].name,
        toName: players[3].name,
        fromAvatar: players[2].avatar,
        toAvatar: players[3].avatar,
        card: p3PassedCard,
        directionLabel: 'Sarah ➔ David',
      },
      {
        fromName: players[3].name,
        toName: human.name,
        fromAvatar: players[3].avatar,
        toAvatar: human.avatar,
        card: p4PassedCard,
        directionLabel: 'David ➔ You',
      },
    ];

    setIsPassing(true);
    setActiveTransfers(transfers);
    sound.playCardFly();
    sound.playPassCard();

    // Clockwise passing animation duration: 850ms
    setTimeout(() => {
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

      // Mark newly received card to trigger highlight animation
      setReceivedCardId(p4PassedCard.id);

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

      setPlayers(updatedPlayers);
      setSelectedCardId(null);
      setIsPassing(false);
      setActiveTransfers([]);

      if (roundWinner) {
        // We have a winner!
        roundWinner.score += 100;
        roundWinner.completedQuartets.push(winningSetId);

        const currentTheme = DECK_THEMES.find((t) => t.id === currentThemeId) || DECK_THEMES[0];
        const winningItem = currentTheme.items.find((item) => item.id === winningSetId) || {
          id: winningSetId,
          name: winningSetId,
          icon: '✨',
          color: '#f59e0b',
        };

        const isUserWinner = roundWinner.id === 'p1';

        if (isUserWinner) {
          // USER WON: Trigger celebratory multi-burst confetti & victory fanfare
          sound.playVictoryFanfare();
          sound.playQuartetSuccess();

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });

          setTimeout(() => {
            confetti({
              particleCount: 75,
              angle: 60,
              spread: 80,
              origin: { x: 0.1, y: 0.6 },
              colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff'],
            });
          }, 250);

          setTimeout(() => {
            confetti({
              particleCount: 75,
              angle: 120,
              spread: 80,
              origin: { x: 0.9, y: 0.6 },
              colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff'],
            });
          }, 450);

          setTurnMessage(`🏆 QUARTET! You assembled all 4 ${winningItem.name} cards!`);
        } else {
          // USER LOST: Trigger defeat sound and defeat animation
          sound.playDefeat();
          setTurnMessage(`⚡ Round over! ${roundWinner.name} completed the ${winningItem.name} Quartet!`);
        }

        setResultModal({
          isUserWinner,
          winner: roundWinner,
          winningSetId,
          winningItemName: winningItem.name,
          winningItemIcon: winningItem.icon,
          winningItemColor: winningItem.color,
        });
      } else {
        setTurnMessage(`Cards passed clockwise! Received ${p4PassedCard.icon} ${p4PassedCard.name} from David.`);
      }
    }, 850);
  };

  const handleCardClick = (card: Card) => {
    if (resultModal || isPassing) return;
    sound.playCardClick();
    setSelectedCardId(card.id === selectedCardId ? null : card.id);
  };

  const handleStackClick = (stackCards: Card[]) => {
    if (resultModal || isPassing) return;
    sound.playStackFan();

    // If one of these cards is already selected, cycle to next or unselect
    const currentlySelectedIndex = stackCards.findIndex((c) => c.id === selectedCardId);
    if (currentlySelectedIndex === -1) {
      // Select the first card of this stack
      setSelectedCardId(stackCards[0].id);
    } else if (currentlySelectedIndex < stackCards.length - 1) {
      // Select the next card in this stack
      setSelectedCardId(stackCards[currentlySelectedIndex + 1].id);
    } else {
      // Unselect
      setSelectedCardId(null);
    }
  };

  const startNextRound = () => {
    setRound((prev) => prev + 1);
    startNewMatch();
  };

  const currentTheme = DECK_THEMES.find((t) => t.id === currentThemeId) || DECK_THEMES[0];
  const humanPlayer = players[0] || null;

  // Group human player's hand by setId for Stacked Cards View
  const stackedCards = useMemo(() => {
    if (!humanPlayer) return [];
    const groups: Record<string, Card[]> = {};
    humanPlayer.hand.forEach((card) => {
      if (!groups[card.setId]) groups[card.setId] = [];
      groups[card.setId].push(card);
    });

    return Object.entries(groups).map(([setId, cards]) => {
      const first = cards[0];
      return {
        setId,
        name: first.name,
        icon: first.icon,
        color: first.color,
        cards,
        count: cards.length,
      };
    });
  }, [humanPlayer?.hand]);

  return (
    <div className="flex-1 flex flex-col justify-between max-w-6xl mx-auto w-full p-3 sm:p-5 gap-4 relative">
      {/* Header Bar */}
      <header className="bg-slate-900/90 border border-emerald-900/50 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('games')}
            className="text-slate-400 hover:text-white transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
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
                  v3.3
                </span>
              </div>
              <p className="text-[10px] text-emerald-400/80 font-medium tracking-wide uppercase">
                4-of-a-Kind Fast Passing Showdown
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
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

        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="text-slate-400 flex items-center gap-1">
            Flow: <strong className="text-emerald-400 font-mono">You ➔ Alex ➔ Sarah ➔ David ➔ You</strong>
          </span>
        </div>
      </div>

      {/* Opponents Area (Top Row) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <span>Opponents at Table</span>
            <span className="text-[10px] text-emerald-400 font-mono">(Passing Target: Alex)</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">3 Bot Rivals</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {players.slice(1).map((bot, index) => {
            const isTargetOfUser = index === 0; // Alex receives from user
            const isPassingToUser = index === 2; // David passes to user
            return (
              <div
                key={bot.id}
                className={`bg-slate-900/80 border rounded-xl p-3 flex flex-col items-center justify-between relative shadow-md transition-all ${
                  isPassing && isTargetOfUser
                    ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-950/20'
                    : isPassing && isPassingToUser
                    ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-emerald-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Flow Tag */}
                <div className="absolute -top-2 px-2 py-0.2 rounded-full text-[9px] font-bold tracking-wider uppercase border shadow-sm">
                  {isTargetOfUser && (
                    <span className="bg-amber-500/20 border-amber-500/40 text-amber-300 px-1.5 py-0.5 rounded-full">
                      Receives from You
                    </span>
                  )}
                  {index === 1 && (
                    <span className="bg-slate-800 border-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full">
                      Passes to David
                    </span>
                  )}
                  {isPassingToUser && (
                    <span className="bg-emerald-500/20 border-emerald-500/40 text-emerald-300 px-1.5 py-0.5 rounded-full">
                      Passes to You
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2 mt-1">
                  <span className="text-2xl">{bot.avatar}</span>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      {bot.name}
                    </div>
                    <div className="text-[10px] text-amber-400 font-mono font-bold">
                      {bot.score} pts
                    </div>
                  </div>
                </div>

                {/* Bot Card Backs */}
                <div className="flex items-center -space-x-3.5 py-1">
                  {bot.hand.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-9 h-13 sm:w-10 sm:h-14 rounded-lg bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-sm flex items-center justify-center text-xs font-bold text-emerald-400/70 transition-transform ${
                        isPassing ? 'scale-95' : 'hover:-translate-y-1'
                      }`}
                    >
                      ⚡
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Table Area with Passing Animation & Controls */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900/90 via-emerald-950/40 to-slate-900/90 border border-emerald-900/50 p-4 shadow-inner min-h-[120px] flex flex-col justify-center">
        {/* Live Card Pass Animation Overlay */}
        {isPassing && activeTransfers.length > 0 ? (
          <div className="py-2 space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span className="uppercase tracking-widest text-[11px]">
                Passing Cards Clockwise Around The Table...
              </span>
            </div>

            {/* 4 Cards In Flight Animation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {activeTransfers.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/90 border-2 rounded-xl p-2.5 shadow-xl animate-float-card flex flex-col items-center justify-between relative overflow-hidden transition-all"
                  style={{
                    borderColor: t.card.color,
                    boxShadow: `0 0 15px ${t.card.color}35`,
                  }}
                >
                  {/* Direction tag */}
                  <div className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 mb-1 flex items-center gap-1">
                    <span>{t.directionLabel}</span>
                  </div>

                  {/* Card In Flight Icon */}
                  <div className="text-3xl my-1 animate-pulse">{t.card.icon}</div>
                  <div className="text-xs font-extrabold text-white text-center truncate max-w-full">
                    {t.card.name}
                  </div>

                  {/* Passing trail footer */}
                  <div className="w-full flex items-center justify-between text-[9px] text-slate-400 mt-1 pt-1 border-t border-slate-800 font-mono">
                    <span>{t.fromAvatar} {t.fromName.split(' ')[0]}</span>
                    <span>➔</span>
                    <span className="text-emerald-300">{t.toAvatar} {t.toName.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Normal State: Action Bar */
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl">
                🃏
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>
                    {selectedCardId
                      ? `Ready to pass selected card to Alex (P2)`
                      : 'Choose 1 card from your hand below to pass'}
                  </span>
                  {selectedCardId && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono border border-amber-400/40">
                      Card Picked
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  Passing flows clockwise. Assemble all 4 cards of any set to call Quartet!
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePassCard}
                disabled={!selectedCardId || isPassing || !!resultModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
              >
                <span>Pass Card Clockwise</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Player's Hand Area with Stack Same Cards Support */}
      {humanPlayer && (
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
          {/* Hand Header with Stack Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{humanPlayer.avatar}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{humanPlayer.name} Hand</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    {humanPlayer.score} pts
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {handViewMode === 'stacked'
                    ? 'Same cards are neatly stacked together with count badges'
                    : 'Showing all 4 individual cards in hand'}
                </div>
              </div>
            </div>

            {/* Stacking View Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setHandViewMode('stacked')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  handViewMode === 'stacked'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Stack cards of the same set together"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Stacked Hand</span>
              </button>
              <button
                onClick={() => setHandViewMode('spread')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  handViewMode === 'spread'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Spread cards out individually"
              >
                <span>Spread Hand</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: STACKED SAME CARDS */}
          {handViewMode === 'stacked' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              {stackedCards.map((stack) => {
                const isStackSelected = stack.cards.some((c) => c.id === selectedCardId);
                const hasQuartet = stack.count === 4;
                const isOneAway = stack.count === 3;
                const hasPair = stack.count === 2;

                return (
                  <div
                    key={stack.setId}
                    onClick={() => handleStackClick(stack.cards)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between h-48 sm:h-52 shadow-lg group select-none ${
                      isStackSelected
                        ? 'border-amber-400 bg-amber-950/40 -translate-y-3 ring-4 ring-amber-400/30'
                        : hasQuartet
                        ? 'border-yellow-400 bg-yellow-950/30 ring-2 ring-yellow-400/40 animate-pulse'
                        : 'border-slate-700 bg-slate-950/80 hover:-translate-y-1.5 hover:border-emerald-500/60'
                    }`}
                    style={{
                      boxShadow: isStackSelected
                        ? `0 12px 28px -5px ${stack.color}50`
                        : undefined,
                    }}
                  >
                    {/* Visual 3D Stack Underlayers for duplicate cards */}
                    {stack.count > 1 && (
                      <div
                        className="absolute inset-0 rounded-2xl border border-slate-700 bg-slate-900/90 pointer-events-none -z-10 translate-x-2 -translate-y-2 rotate-2 group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform"
                        style={{ borderColor: `${stack.color}50` }}
                      />
                    )}
                    {stack.count > 2 && (
                      <div
                        className="absolute inset-0 rounded-2xl border border-slate-800 bg-slate-950/90 pointer-events-none -z-20 translate-x-4 -translate-y-4 rotate-4 group-hover:translate-x-5 group-hover:-translate-y-5 transition-transform"
                        style={{ borderColor: `${stack.color}35` }}
                      />
                    )}
                    {stack.count > 3 && (
                      <div
                        className="absolute inset-0 rounded-2xl border border-amber-500/40 bg-amber-950/40 pointer-events-none -z-30 translate-x-6 -translate-y-6 rotate-6 group-hover:translate-x-7 group-hover:-translate-y-7 transition-transform"
                      />
                    )}

                    {/* Top Row: Stack Count Badge & Quartet Status */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-full border shadow-sm flex items-center gap-1 ${
                            hasQuartet
                              ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold'
                              : isOneAway
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                              : hasPair
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-900 text-slate-300 border-slate-700'
                          }`}
                        >
                          {isOneAway && <Flame className="w-3 h-3 text-orange-400" />}
                          {hasQuartet && <Trophy className="w-3 h-3 text-slate-950" />}
                          <span>{stack.count}x Stack</span>
                        </span>
                      </div>

                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: stack.color }}
                      />
                    </div>

                    {/* Center Icon & Name */}
                    <div className="text-center space-y-1 my-auto">
                      <div className="text-4xl sm:text-5xl transition-transform group-hover:scale-105">
                        {stack.icon}
                      </div>
                      <div className="text-sm sm:text-base font-black text-white tracking-wide">
                        {stack.name}
                      </div>

                      {/* Quartet 4-pip Progress Bar */}
                      <div className="flex items-center justify-center gap-1 pt-1">
                        {[1, 2, 3, 4].map((pip) => (
                          <span
                            key={pip}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              pip <= stack.count
                                ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                : 'bg-slate-800 border border-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Stack Bottom Status / Pass Selector */}
                    <div className="text-center pt-2 border-t border-slate-800/80">
                      {isStackSelected ? (
                        <span className="text-[10px] font-bold text-amber-300 font-mono tracking-wider flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready to Pass 1 Card
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                          {hasQuartet
                            ? '🎉 Complete 4-of-4'
                            : isOneAway
                            ? '🔥 1 more to Quartet!'
                            : stack.count === 2
                            ? 'Pair (2 of 4)'
                            : 'Click to select for pass'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW 2: SPREAD VIEW (All individual cards) */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
              {humanPlayer.hand.map((card) => {
                const isSelected = card.id === selectedCardId;
                const isNewlyReceived = card.id === receivedCardId;

                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between h-44 sm:h-48 shadow-lg ${
                      isNewlyReceived ? 'animate-new-card ring-4 ring-emerald-400/50' : ''
                    } ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/40 -translate-y-3 ring-4 ring-amber-400/30'
                        : 'border-slate-700 bg-slate-950/80 hover:-translate-y-1 hover:border-emerald-500/60'
                    }`}
                    style={{
                      boxShadow: isSelected ? `0 10px 25px -5px ${card.color}40` : undefined,
                    }}
                  >
                    {isNewlyReceived && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black tracking-wider uppercase shadow-md flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Received
                      </div>
                    )}

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
          )}
        </div>
      )}

      {/* USER SPECIFIC RESULT ANNOUNCEMENT: WINNER CONFETTI vs LOSER DEFEAT ANIMATION */}
      {resultModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          {resultModal.isUserWinner ? (
            /* ============================================================ */
            /* 1. WINNER CELEBRATION MODAL (User Won: Confetti + Trophies)  */
            /* ============================================================ */
            <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
              {/* Golden victory glow background */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-amber-500/40 animate-bounce">
                🏆
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-black text-amber-300 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40">
                  🎉 VICTORY! YOU WON!
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white pt-2">
                  Quartet Achieved!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-300 font-medium">
                  You collected all 4 cards of the set!
                </p>
              </div>

              {/* Showcase the winning quartet set */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-400/40 flex items-center justify-center gap-3 shadow-inner">
                <span className="text-4xl">{resultModal.winningItemIcon}</span>
                <div className="text-left">
                  <div className="text-base font-black text-white">
                    4x {resultModal.winningItemName}
                  </div>
                  <div className="text-xs text-amber-400 font-mono font-bold">
                    +100 Points Awarded!
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={startNextRound}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/30 transition transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Proceed to Round {round + 1}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowScoreboard(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  View Match Standings
                </button>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* 2. LOSER DEFEAT MODAL (User Lost: Defeat Rain & Gloom Shake) */
            /* ============================================================ */
            <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-rose-950/60 border-2 border-rose-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative overflow-hidden animate-defeat-shake">
              {/* Rain animation overlay within the defeat card */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {rainDrops.map((drop) => (
                  <div
                    key={drop.id}
                    className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-cyan-400 to-blue-300 rounded-full"
                    style={{
                      left: drop.left,
                      height: drop.height,
                      opacity: drop.opacity,
                      animation: `rainFall ${drop.duration} linear infinite`,
                      animationDelay: drop.delay,
                    }}
                  />
                ))}
              </div>

              {/* Somber Rain / Storm Icon */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-4xl mx-auto shadow-inner text-rose-400">
                  🌧️
                </div>
                <div className="absolute bottom-0 right-1/2 translate-x-7 text-2xl animate-pulse">
                  💔
                </div>
              </div>

              <div className="space-y-1 relative z-10">
                <span className="text-xs font-mono font-black text-rose-400 uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40">
                  ROUND LOST - DEFEAT
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white pt-2">
                  {resultModal.winner.name} Claimed Quartet!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  {resultModal.winner.avatar} {resultModal.winner.name} gathered 4 of a kind first and claimed 100 pts.
                </p>
              </div>

              {/* Winning Hand recap */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-center gap-3 relative z-10 shadow-md">
                <span className="text-3xl">{resultModal.winningItemIcon}</span>
                <div className="text-left">
                  <div className="text-xs text-slate-400">Winning 4-of-a-Kind Set:</div>
                  <div className="text-sm font-black text-rose-300">
                    4x {resultModal.winningItemName}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5 relative z-10">
                <button
                  onClick={startNextRound}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-black text-sm tracking-wide shadow-xl shadow-rose-600/30 transition transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Revenge Match - Round {round + 1}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowScoreboard(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  View Match Standings
                </button>
              </div>
            </div>
          )}
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
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white cursor-pointer">
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
                <li>All 4 players pass simultaneously in clockwise direction: You ➔ Alex ➔ Sarah ➔ David ➔ You.</li>
                <li>Cards of the same set are automatically stacked in your hand so you can see your progress.</li>
                <li>The first player to hold all 4 cards of any set shouts <em>QUARTET</em> and scores 100 points!</li>
              </ol>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRules(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
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
                className="text-slate-400 hover:text-white cursor-pointer"
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
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
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
              <button onClick={() => setShowVault(false)} className="text-slate-400 hover:text-white cursor-pointer">
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
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
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
