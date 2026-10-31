import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Flame,
  CheckCircle2,
  ChevronRight,
  FastForward,
  Gauge,
  Clock,
  HelpCircle,
  Lock,
  MousePointer,
  Eye,
  EyeOff,
  LogOut,
  UserPlus,
  UserMinus,
  Bot,
  Timer,
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
  {
    id: 'mythology',
    name: 'Mythology',
    items: [
      { id: 'ZEUS', name: 'Zeus', icon: '⚡', color: '#eab308' },
      { id: 'POSEIDON', name: 'Poseidon', icon: '🔱', color: '#0ea5e9' },
      { id: 'ANUBIS', name: 'Anubis', icon: '🐺', color: '#a855f7' },
      { id: 'THOR', name: 'Thor', icon: '🔨', color: '#f59e0b' },
      { id: 'MEDUSA', name: 'Medusa', icon: '🐍', color: '#10b981' },
      { id: 'PHOENIX', name: 'Phoenix', icon: '🔥', color: '#ef4444' },
    ],
  },
  {
    id: 'food',
    name: 'Food Festival',
    items: [
      { id: 'PIZZA', name: 'Pizza Slice', icon: '🍕', color: '#f97316' },
      { id: 'SUSHI', name: 'Sushi Roll', icon: '🍣', color: '#ef4444' },
      { id: 'BURGER', name: 'Burger Deluxe', icon: '🍔', color: '#eab308' },
      { id: 'RAMEN', name: 'Ramen Bowl', icon: '🍜', color: '#f59e0b' },
      { id: 'TACO', name: 'Taco Fiesta', icon: '🌮', color: '#10b981' },
      { id: 'ICE_CREAM', name: 'Ice Cream', icon: '🍦', color: '#ec4899' },
    ],
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    items: [
      { id: 'SUPERCAR', name: 'Supercar', icon: '🏎️', color: '#ef4444' },
      { id: 'JET', name: 'Jet Fighter', icon: '✈️', color: '#3b82f6' },
      { id: 'SUBMARINE', name: 'Stealth Sub', icon: '🛥️', color: '#06b6d4' },
      { id: 'ROCKET', name: 'Rocket Ship', icon: '🚀', color: '#f59e0b' },
      { id: 'TRUCK', name: 'Monster Truck', icon: '🛻', color: '#84cc16' },
      { id: 'CHOPPER', name: 'Chopper', icon: '🚁', color: '#8b5cf6' },
    ],
  },
  {
    id: 'fantasy',
    name: 'Fantasy RPG',
    items: [
      { id: 'WIZARD', name: 'Grand Wizard', icon: '🧙', color: '#8b5cf6' },
      { id: 'KNIGHT', name: 'Dragon Knight', icon: '🛡️', color: '#3b82f6' },
      { id: 'ASSASSIN', name: 'Shadow Rogue', icon: '🗡️', color: '#64748b' },
      { id: 'ARCHER', name: 'Elven Ranger', icon: '🏹', color: '#10b981' },
      { id: 'CLERIC', name: 'High Cleric', icon: '✨', color: '#eab308' },
      { id: 'PYRO', name: 'Pyromancer', icon: '🔥', color: '#f97316' },
    ],
  },
  {
    id: 'monsters',
    name: 'Spooky Monsters',
    items: [
      { id: 'VAMPIRE', name: 'Vampire Count', icon: '🧛', color: '#be123c' },
      { id: 'WEREWOLF', name: 'Werewolf', icon: '🐺', color: '#475569' },
      { id: 'GHOST', name: 'Phantom Ghost', icon: '👻', color: '#06b6d4' },
      { id: 'MUMMY', name: 'Ancient Mummy', icon: '🏺', color: '#d97706' },
      { id: 'ZOMBIE', name: 'Forest Zombie', icon: '🧟', color: '#15803d' },
      { id: 'SKELETON', name: 'Skeleton King', icon: '💀', color: '#94a3b8' },
    ],
  },
  {
    id: 'elements',
    name: 'Cosmic Elements',
    items: [
      { id: 'PLASMA', name: 'Solar Plasma', icon: '☀️', color: '#f59e0b' },
      { id: 'CRYO', name: 'Cryo Frost', icon: '❄️', color: '#38bdf8' },
      { id: 'VOID', name: 'Dark Matter', icon: '🌌', color: '#6366f1' },
      { id: 'BOLT', name: 'Cosmic Flare', icon: '⚡', color: '#fbbf24' },
      { id: 'TERRA', name: 'Terra Core', icon: '🌍', color: '#10b981' },
      { id: 'NEBULA', name: 'Astral Nebula', icon: '🔮', color: '#c084fc' },
    ],
  },
  {
    id: 'alphabets',
    name: 'Alphabets',
    items: [
      { id: 'ALPHA_A', name: 'Letter A', icon: '🅰️', color: '#ef4444' },
      { id: 'ALPHA_B', name: 'Letter B', icon: '🅱️', color: '#3b82f6' },
      { id: 'ALPHA_C', name: 'Letter C', icon: '🅲', color: '#10b981' },
      { id: 'ALPHA_D', name: 'Letter D', icon: '🅳', color: '#f59e0b' },
      { id: 'ALPHA_E', name: 'Letter E', icon: '🅴', color: '#8b5cf6' },
      { id: 'ALPHA_F', name: 'Letter F', icon: '🅵', color: '#ec4899' },
    ],
  },
  {
    id: 'numbers',
    name: 'Numbers',
    items: [
      { id: 'NUM_1', name: 'Prime One', icon: '1️⃣', color: '#0ea5e9' },
      { id: 'NUM_2', name: 'Twin Two', icon: '2️⃣', color: '#f43f5e' },
      { id: 'NUM_3', name: 'Trinity Three', icon: '3️⃣', color: '#eab308' },
      { id: 'NUM_4', name: 'Quad Four', icon: '4️⃣', color: '#10b981' },
      { id: 'NUM_5', name: 'Penta Five', icon: '5️⃣', color: '#a855f7' },
      { id: 'NUM_7', name: 'Lucky Seven', icon: '7️⃣', color: '#f97316' },
    ],
  },
  {
    id: 'ai',
    name: 'AI & Robotics',
    items: [
      { id: 'AI_BRAIN', name: 'Neural Net', icon: '🧠', color: '#8b5cf6' },
      { id: 'AI_QUANTUM', name: 'Quantum Core', icon: '⚛️', color: '#06b6d4' },
      { id: 'AI_BOT', name: 'Cyber Automaton', icon: '🤖', color: '#3b82f6' },
      { id: 'AI_AGENT', name: 'LLM Agent', icon: '💬', color: '#10b981' },
      { id: 'AI_CHIP', name: 'Silicon Core', icon: '⚡', color: '#eab308' },
      { id: 'AI_VISION', name: 'Vision Hologram', icon: '👁️', color: '#ec4899' },
    ],
  },
];

// Vibrant bot personality roster for randomized competitor names each tournament
const BOT_ROSTER = [
  { name: 'Alex', avatar: '🦊' },
  { name: 'Sarah', avatar: '🦉' },
  { name: 'David', avatar: '🐻' },
  { name: 'Maya', avatar: '🐆' },
  { name: 'Jasper', avatar: '🐺' },
  { name: 'Chloe', avatar: '🐱' },
  { name: 'Elena', avatar: '🦅' },
  { name: 'Leo', avatar: '🦁' },
  { name: 'Zara', avatar: '🦄' },
  { name: 'Kai', avatar: '🦈' },
  { name: 'Felix', avatar: '🐼' },
  { name: 'Nova', avatar: '🚀' },
  { name: 'Rowan', avatar: '🌲' },
  { name: 'Aria', avatar: '✨' },
  { name: 'Dante', avatar: '🔥' },
  { name: 'Sora', avatar: '🕊️' },
  { name: 'Mira', avatar: '🔮' },
  { name: 'Zane', avatar: '⚡' },
];

type SequentialStep =
  | 'user_turn'
  | 'passing'
  | 'bot_deciding'
  | 'user_passing';

interface SingleTransfer {
  card: Card;
  fromName: string;
  fromAvatar: string;
  toName: string;
  toAvatar: string;
  directionTitle: string;
  stepNum: number;
}

export interface PlayerMatchScore {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  isHuman: boolean;
  hand: Card[];
  maxCount: number; // 4, 3, 2, or 1
  roundPoints: number; // 100, 75, 50, or 0 (No points for singles)
  cumulativeScore: number;
  bestSetName: string;
  bestSetIcon: string;
  bestSetColor: string;
  comboLabel: string;
}

interface ResultModalData {
  isUserWinner: boolean;
  winner: Player;
  winningSetId: string;
  winningItemName: string;
  winningItemIcon: string;
  winningItemColor: string;
  scoresBreakdown: PlayerMatchScore[];
}

const CUMULATIVE_STORAGE_KEY = 'buildsmith_quartet_cumulative_scores_v3';

export const QuartetClashGame: React.FC = () => {
  const { navigate } = useNavigation();

  // Settings & Modals
  const [currentThemeId, setCurrentThemeId] = useState<string>('animals');
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showVault, setShowVault] = useState<boolean>(false);
  const [showScoreboard, setShowScoreboard] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [gameSpeed, setGameSpeed] = useState<'normal' | 'fast'>('normal');

  // Multiplayer & Table configuration (4 to 6 players, 6 is the game-theoretic optimum maximum)
  const [tablePlayerCount, setTablePlayerCount] = useState<number>(4);

  // Theme Locking: Themes can only be changed before first card is passed in the match
  const [hasPassedCardInMatch, setHasPassedCardInMatch] = useState<boolean>(false);

  // Bot Takeover / Autoplay: allows player to be taken over by a bot seamlessly
  const [isBotAutoPlay, setIsBotAutoPlay] = useState<boolean>(false);

  // Auto-pass Countdown Timer (15 seconds)
  const AUTO_PASS_SECONDS = 15;
  const [autoPassSecondsLeft, setAutoPassSecondsLeft] = useState<number>(AUTO_PASS_SECONDS);

  // Hand layout mode: 'stacked' (groups duplicate cards) vs 'spread'
  const [handViewMode, setHandViewMode] = useState<'stacked' | 'spread'>('stacked');

  // Cumulative Scoreboard across rounds
  const [cumulativeScores, setCumulativeScores] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(CUMULATIVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0 };
  });

  // Randomized competitor bot personas for the tournament
  const [botPersonas, setBotPersonas] = useState<{ name: string; avatar: string }[]>(() => {
    return [...BOT_ROSTER].sort(() => Math.random() - 0.5).slice(0, 5);
  });

  // Match State
  const [round, setRound] = useState<number>(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [receivedCardId, setReceivedCardId] = useState<string | null>(null);
  const [resultModal, setResultModal] = useState<ResultModalData | null>(null);

  // Status updates report visibility toggle
  const [showStatusReports, setShowStatusReports] = useState<boolean>(true);

  // Sequential 1-by-1 passing flow state
  const [currentStep, setCurrentStep] = useState<SequentialStep>('user_turn');
  const [activePlayerIdx, setActivePlayerIdx] = useState<number>(0);
  const [activeTransfer, setActiveTransfer] = useState<SingleTransfer | null>(null);
  const [turnMessage, setTurnMessage] = useState<string>(
    'Select 1 card from your hand to pass to Alex.'
  );

  // Active timers ref for clean unmounting/cancelling
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Build deck for 4, 5, or 6 players (N sets of 4 cards = 4 * N cards total)
  const generateDeck = (themeId: string, count = tablePlayerCount): Card[] => {
    const theme = DECK_THEMES.find((t) => t.id === themeId) || DECK_THEMES[0];
    const chosenItems = theme.items.slice(0, count);

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

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
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

  // Intelligent Bot AI logic: Pick 1 card to discard that the bot does not want
  // (Preserves sets with higher counts, discards lonely singletons)
  const pickBotCardToDiscard = (hand: Card[]): Card => {
    const counts: Record<string, number> = {};
    hand.forEach((c) => {
      counts[c.setId] = (counts[c.setId] || 0) + 1;
    });

    let minCount = 99;
    let worstSetId = hand[0]?.setId || '';
    Object.entries(counts).forEach(([setId, count]) => {
      if (count < minCount) {
        minCount = count;
        worstSetId = setId;
      }
    });

    const candidates = hand.filter((c) => c.setId === worstSetId);
    return candidates[0] || hand[0];
  };

  // Helper: compute scoring for a player's final hand
  // Quartet: 100 pts. Triple: 75 pts. Pair: 50 pts (only one pair counted).
  // Singles: 0 pts (No points for singles).
  const computePlayerRoundScore = (
    player: Player,
    theme: GameTheme,
    priorScore: number
  ): PlayerMatchScore => {
    const counts: Record<string, number> = {};
    player.hand.forEach((c) => {
      counts[c.setId] = (counts[c.setId] || 0) + 1;
    });

    let maxCount = 0;
    let bestSetId = player.hand[0]?.setId || '';
    for (const [sId, cnt] of Object.entries(counts)) {
      if (cnt > maxCount) {
        maxCount = cnt;
        bestSetId = sId;
      }
    }

    // Cap maxCount to 4 (e.g. if player temporarily held 5 cards)
    maxCount = Math.min(4, Math.max(1, maxCount));
    // No points for singles!
    const roundPoints = maxCount === 4 ? 100 : maxCount === 3 ? 75 : maxCount === 2 ? 50 : 0;
    const newCumulative = priorScore + roundPoints;

    const matchedItem = theme.items.find((item) => item.id === bestSetId);
    const bestSetName = matchedItem?.name || bestSetId;
    const bestSetIcon = matchedItem?.icon || '🃏';
    const bestSetColor = matchedItem?.color || '#3b82f6';

    let comboLabel = 'Singles (0 pts)';
    if (maxCount === 4) comboLabel = 'Quartet (4-of-a-Kind)';
    else if (maxCount === 3) comboLabel = 'Triple (3-of-a-Kind)';
    else if (maxCount === 2) comboLabel = 'One Pair (2-of-a-Kind)';

    return {
      playerId: player.id,
      playerName: player.name,
      playerAvatar: player.avatar,
      isHuman: player.isHuman,
      hand: player.hand,
      maxCount,
      roundPoints,
      cumulativeScore: newCumulative,
      bestSetName,
      bestSetIcon,
      bestSetColor,
      comboLabel,
    };
  };

  // Trigger win / loss modal with comprehensive scoring breakdown
  const handleGameOver = (
    winner: Player,
    winningSetId: string,
    currentPlayersList?: Player[]
  ) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const currentTheme = DECK_THEMES.find((t) => t.id === currentThemeId) || DECK_THEMES[0];
    const winningItem = currentTheme.items.find((item) => item.id === winningSetId) || {
      id: winningSetId,
      name: winningSetId,
      icon: '✨',
      color: '#f59e0b',
    };

    const isUserWinner = winner.id === 'p1';
    const activeList = currentPlayersList || players;

    // Calculate round points and cumulative score for each player
    const updatedCumulative = { ...cumulativeScores };
    const scoresBreakdown: PlayerMatchScore[] = activeList.map((p) => {
      const priorScore = updatedCumulative[p.id] || 0;
      const scoreData = computePlayerRoundScore(p, currentTheme, priorScore);

      // Enforce winner guarantee of 100 points
      if (p.id === winner.id) {
        scoreData.maxCount = 4;
        scoreData.roundPoints = 100;
        scoreData.comboLabel = 'Quartet (4-of-a-Kind)';
        scoreData.bestSetName = winningItem.name;
        scoreData.bestSetIcon = winningItem.icon;
        scoreData.bestSetColor = winningItem.color;
        scoreData.cumulativeScore = priorScore + 100;
      }
      updatedCumulative[p.id] = scoreData.cumulativeScore;
      return scoreData;
    });

    // Sort by round points descending (top round performer first)
    scoresBreakdown.sort((a, b) => b.roundPoints - a.roundPoints);

    // Save cumulative scores to state & localStorage
    setCumulativeScores(updatedCumulative);
    try {
      localStorage.setItem(CUMULATIVE_STORAGE_KEY, JSON.stringify(updatedCumulative));
    } catch {
      // ignore storage error
    }

    // Reflect cumulative score in players state
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        score: updatedCumulative[p.id] ?? p.score,
      }))
    );

    if (isUserWinner) {
      sound.playVictoryFanfare();
      sound.playQuartetSuccess();

      confetti({
        particleCount: 110,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 85,
          origin: { x: 0.1, y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff'],
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 85,
          origin: { x: 0.9, y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff'],
        });
      }, 450);

      setTurnMessage(`🏆 QUARTET! You assembled all 4 ${winningItem.name} cards! (+100 pts)`);
    } else {
      sound.playDefeat();
      setTurnMessage(
        `⚡ Round over! ${winner.name} assembled the 4x ${winningItem.name} Quartet! (+100 pts)`
      );
    }

    setResultModal({
      isUserWinner,
      winner,
      winningSetId,
      winningItemName: winningItem.name,
      winningItemIcon: winningItem.icon,
      winningItemColor: winningItem.color,
      scoresBreakdown,
    });
  };

  // Step timings depending on gameSpeed
  const flightDelay = gameSpeed === 'fast' ? 380 : 850;
  const decisionDelay = gameSpeed === 'fast' ? 420 : 1100;

  // =========================================================================
  // GENERALIZED CLOCKWISE SEQUENTIAL PASSING ENGINE WITH ROTATING STARTER
  // Supports 4, 5, or 6 players (6 is optimum maximum!)
  // Clockwise order: P(i) -> P(i+1 % N)
  // =========================================================================

  const executeSequentialPass = (
    fromIdx: number,
    cardToPass: Card,
    playersSnapshot: Player[],
    roundNum: number,
    playerCount = tablePlayerCount
  ) => {
    if (resultModal) return;

    // As soon as first pass is made, lock theme selection
    setHasPassedCardInMatch(true);

    const starterIdx = (roundNum - 1) % playerCount;
    const toIdx = (fromIdx + 1) % playerCount;
    const fromPlayer = playersSnapshot[fromIdx];
    const toPlayer = playersSnapshot[toIdx];

    sound.playCardFly();
    if (fromIdx === 0 && !isBotAutoPlay) sound.playPassCard();

    // Remove 1 card from the passing player
    const updatedFromHand = fromPlayer.hand.filter((c) => c.id !== cardToPass.id);
    const updatedPlayers = [...playersSnapshot];
    updatedPlayers[fromIdx] = { ...fromPlayer, hand: updatedFromHand };
    setPlayers(updatedPlayers);

    const stepNum = ((fromIdx - starterIdx + playerCount) % playerCount) + 1;

    // Set secret active transfer in motion
    setActiveTransfer({
      card: cardToPass,
      fromName: fromPlayer.name,
      fromAvatar: fromPlayer.avatar,
      toName: toPlayer.name,
      toAvatar: toPlayer.avatar,
      directionTitle: `Step ${stepNum}/${playerCount}: Passing 1 Secret Card to ${toPlayer.name}`,
      stepNum,
    });
    setCurrentStep('passing');
    setActivePlayerIdx(fromIdx);
    setSelectedCardId(null);
    setTurnMessage(
      fromIdx === 0
        ? `Passing 1 secret card to ${toPlayer.name}... Waiting for clockwise pass to cycle.`
        : `${fromPlayer.avatar} ${fromPlayer.name} passes 1 secret card to ${toPlayer.name}...`
    );

    // Animate flight to receiver
    timerRef.current = setTimeout(() => {
      // Receiver accepts the incoming card
      const updatedToHand = [...toPlayer.hand, cardToPass];
      const afterArrivalList = [...updatedPlayers];
      afterArrivalList[toIdx] = { ...toPlayer, hand: updatedToHand };
      setPlayers(afterArrivalList);
      setActiveTransfer(null);

      // Check if receiver achieved a Quartet immediately!
      const quartetSet = checkQuartet(updatedToHand);
      if (quartetSet) {
        handleGameOver(afterArrivalList[toIdx], quartetSet, afterArrivalList);
        return;
      }

      // Did the card return to the round starter?
      const isCycleComplete = toIdx === starterIdx;

      if (isCycleComplete) {
        // Starter originally started with 4, dropped to 3, and now holds 4 again!
        // The full cycle is complete.
        if (toIdx === 0) {
          const prevPlayer = afterArrivalList[(playerCount - 1) % playerCount];
          sound.playQuartetSuccess();
          setReceivedCardId(cardToPass.id);
          setCurrentStep('user_turn');
          setActivePlayerIdx(0);
          setAutoPassSecondsLeft(AUTO_PASS_SECONDS);
          setTurnMessage(
            `Received card from ${prevPlayer.name}! Hand back at 4 cards. Select 1 to start next pass.`
          );
        } else {
          setCurrentStep('bot_deciding');
          setActivePlayerIdx(toIdx);
          setTurnMessage(
            `${toPlayer.avatar} ${toPlayer.name} received final card of the cycle! Initiating next pass...`
          );
          timerRef.current = setTimeout(() => {
            const botCard = pickBotCardToDiscard(updatedToHand);
            executeSequentialPass(toIdx, botCard, afterArrivalList, roundNum, playerCount);
          }, decisionDelay);
        }
      } else {
        // Receiver is NOT starter, so receiver temporarily holds 5 cards and must choose 1 to pass!
        if (toIdx === 0) {
          const prevPlayer = afterArrivalList[(toIdx - 1 + playerCount) % playerCount];
          const nextPlayer = afterArrivalList[(toIdx + 1) % playerCount];
          sound.playQuartetSuccess();
          setReceivedCardId(cardToPass.id);
          setCurrentStep('user_turn');
          setActivePlayerIdx(0);
          setAutoPassSecondsLeft(AUTO_PASS_SECONDS);
          setTurnMessage(
            `Received 1 card from ${prevPlayer.name}! You hold 5 cards in hand. Select 1 card to pass to ${nextPlayer.name}.`
          );
        } else {
          setCurrentStep('bot_deciding');
          setActivePlayerIdx(toIdx);
          const nextTarget = afterArrivalList[(toIdx + 1) % playerCount];
          setTurnMessage(
            `${toPlayer.avatar} ${toPlayer.name} has 5 cards in hand! Choosing which to pass to ${nextTarget.name}...`
          );
          timerRef.current = setTimeout(() => {
            const botCard = pickBotCardToDiscard(updatedToHand);
            executeSequentialPass(toIdx, botCard, afterArrivalList, roundNum, playerCount);
          }, decisionDelay);
        }
      }
    }, flightDelay);
  };

  // Initialize new game / round - pure player names with randomized bot personalities
  const startNewMatch = (
    themeId = currentThemeId,
    scoreOverrides?: Record<string, number>,
    targetRound?: number,
    targetCount = tablePlayerCount,
    overrideBotPersonas?: { name: string; avatar: string }[]
  ) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const activeRound = targetRound !== undefined ? targetRound : round;
    const starterIdx = (activeRound - 1) % targetCount;
    setHasPassedCardInMatch(false);
    setAutoPassSecondsLeft(AUTO_PASS_SECONDS);

    const deck = generateDeck(themeId, targetCount);
    const scoreMap = scoreOverrides || cumulativeScores;

    const currentRoster = overrideBotPersonas || botPersonas;

    const newPlayers: Player[] = [
      {
        id: 'p1',
        name: 'You',
        isHuman: !isBotAutoPlay,
        hand: deck.slice(0, 4),
        score: scoreMap['p1'] || 0,
        completedQuartets: [],
        avatar: '🤠',
      },
    ];

    for (let i = 1; i < targetCount; i++) {
      const persona = currentRoster[i - 1] || BOT_ROSTER[(i - 1) % BOT_ROSTER.length];
      newPlayers.push({
        id: `p${i + 1}`,
        name: persona.name,
        isHuman: false,
        hand: deck.slice(i * 4, (i + 1) * 4),
        score: scoreMap[`p${i + 1}`] || 0,
        completedQuartets: [],
        avatar: persona.avatar,
      });
    }

    setPlayers(newPlayers);
    setSelectedCardId(null);
    setReceivedCardId(null);
    setResultModal(null);
    setActiveTransfer(null);

    const starterPlayer = newPlayers[starterIdx];
    const nextPlayerName = newPlayers[(starterIdx + 1) % targetCount].name;

    // Initial Starter Flow based on starterIdx
    if (starterIdx === 0) {
      setCurrentStep('user_turn');
      setActivePlayerIdx(0);
      setTurnMessage(
        `Round ${activeRound} started! You have the dealer button. Select 1 card to pass to ${nextPlayerName}.`
      );
    } else {
      setCurrentStep('bot_deciding');
      setActivePlayerIdx(starterIdx);
      setTurnMessage(
        `${starterPlayer.avatar} ${starterPlayer.name} starts Round ${activeRound}! Preparing first clockwise pass...`
      );

      timerRef.current = setTimeout(() => {
        const botCard = pickBotCardToDiscard(starterPlayer.hand);
        executeSequentialPass(starterIdx, botCard, newPlayers, activeRound, targetCount);
      }, decisionDelay);
    }
  };

  const handleResetTournament = () => {
    const freshScores: Record<string, number> = { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0 };
    setCumulativeScores(freshScores);
    try {
      localStorage.setItem(CUMULATIVE_STORAGE_KEY, JSON.stringify(freshScores));
    } catch {
      // ignore
    }
    // Randomize fresh competitor bot names & avatars for each tournament!
    const freshRoster = [...BOT_ROSTER].sort(() => Math.random() - 0.5).slice(0, 5);
    setBotPersonas(freshRoster);
    setRound(1);
    startNewMatch(currentThemeId, freshScores, 1, tablePlayerCount, freshRoster);
  };

  // Add / Remove Bots (4, 5, or 6 players)
  const handleAddBot = () => {
    if (tablePlayerCount >= 6) return;
    const nextCount = tablePlayerCount + 1;
    setTablePlayerCount(nextCount);
    startNewMatch(currentThemeId, cumulativeScores, round, nextCount);
  };

  const handleRemoveBot = () => {
    if (tablePlayerCount <= 4) return;
    const nextCount = tablePlayerCount - 1;
    setTablePlayerCount(nextCount);
    startNewMatch(currentThemeId, cumulativeScores, round, nextCount);
  };

  // Substitute Player with Bot / Autoplay toggle
  const toggleBotAutoPlay = () => {
    const nextVal = !isBotAutoPlay;
    setIsBotAutoPlay(nextVal);
    setPlayers((prev) =>
      prev.map((p) => (p.id === 'p1' ? { ...p, isHuman: !nextVal } : p))
    );
  };

  // Auto-pass countdown timer effect
  useEffect(() => {
    if (currentStep !== 'user_turn' || !!resultModal) return;

    if (isBotAutoPlay) {
      // Bot is currently taking over for human player
      const autoTimer = setTimeout(() => {
        const user = players[0];
        if (user && user.hand.length > 0) {
          const autoDiscard = pickBotCardToDiscard(user.hand);
          handleUserPassCard(autoDiscard);
        }
      }, 550);
      return () => clearTimeout(autoTimer);
    }

    // Normal player timer: countdown from 15 seconds
    setAutoPassSecondsLeft(AUTO_PASS_SECONDS);
    const interval = setInterval(() => {
      setAutoPassSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Time expired! Auto pass card with least count
          const user = players[0];
          if (user && user.hand.length > 0) {
            const autoDiscard = pickBotCardToDiscard(user.hand);
            sound.playPassCard();
            handleUserPassCard(autoDiscard);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStep, resultModal, isBotAutoPlay, players]);

  useEffect(() => {
    startNewMatch(currentThemeId, cumulativeScores, round, tablePlayerCount);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentThemeId]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  // User initiates or forwards a pass (User -> Next Player)
  const handleUserPassCard = (cardToPassOverride?: Card) => {
    if (currentStep !== 'user_turn' || resultModal) return;

    const user = players[0];
    const cardToPass =
      cardToPassOverride || user.hand.find((c) => c.id === selectedCardId);
    if (!cardToPass) return;

    executeSequentialPass(0, cardToPass, players, round, tablePlayerCount);
  };

  // Single click: select / deselect card
  const handleCardClick = (card: Card) => {
    if (resultModal || currentStep !== 'user_turn') return;
    sound.playCardClick();
    setSelectedCardId(card.id === selectedCardId ? null : card.id);
  };

  // Double click: treated as an instant pass
  const handleCardDoubleClick = (card: Card) => {
    if (resultModal || currentStep !== 'user_turn') return;
    setSelectedCardId(card.id);
    handleUserPassCard(card);
  };

  // Single click on stack
  const handleStackClick = (stackCards: Card[]) => {
    if (resultModal || currentStep !== 'user_turn') return;
    sound.playStackFan();

    const currentlySelectedIndex = stackCards.findIndex((c) => c.id === selectedCardId);
    if (currentlySelectedIndex === -1) {
      setSelectedCardId(stackCards[0].id);
    } else if (currentlySelectedIndex < stackCards.length - 1) {
      setSelectedCardId(stackCards[currentlySelectedIndex + 1].id);
    } else {
      setSelectedCardId(null);
    }
  };

  // Double click on stack: treated as an instant pass of top card in stack
  const handleStackDoubleClick = (stackCards: Card[]) => {
    if (resultModal || currentStep !== 'user_turn' || !stackCards.length) return;
    const cardToPass = stackCards[0];
    setSelectedCardId(cardToPass.id);
    handleUserPassCard(cardToPass);
  };

  const startNextRound = () => {
    const nextRound = round + 1;
    setRound(nextRound);
    startNewMatch(currentThemeId, cumulativeScores, nextRound, tablePlayerCount);
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

  // Is someone in the middle of a transfer?
  const isTransferring = currentStep !== 'user_turn';

  return (
    <div className="flex-1 flex flex-col justify-between max-w-6xl mx-auto w-full p-3 sm:p-5 gap-4 relative select-none">
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
                  Sequential 1-by-1
                </span>
              </div>
              <p className="text-[10px] text-emerald-400/80 font-medium tracking-wide uppercase">
                Single Card Clockwise Passing
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Game Speed Toggle */}
          <button
            onClick={() => setGameSpeed((prev) => (prev === 'normal' ? 'fast' : 'normal'))}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 cursor-pointer transition ${
              gameSpeed === 'fast'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle between Normal and Fast animation speed"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Speed: {gameSpeed === 'fast' ? '⚡ Fast' : 'Normal'}</span>
          </button>

          {/* Theme Selector (locked after first pass) */}
          <div className="relative flex items-center">
            <select
              value={currentThemeId}
              disabled={hasPassedCardInMatch}
              onChange={(e) => {
                if (!hasPassedCardInMatch) {
                  setCurrentThemeId(e.target.value);
                }
              }}
              title={
                hasPassedCardInMatch
                  ? 'Theme is locked after the first card is passed in this match'
                  : 'Change card theme before the first pass'
              }
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                hasPassedCardInMatch
                  ? 'bg-slate-900/60 text-slate-500 border-slate-800 cursor-not-allowed opacity-75'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700 cursor-pointer focus:outline-none'
              }`}
            >
              {DECK_THEMES.map((th) => (
                <option key={th.id} value={th.id}>
                  Theme: {th.name}
                </option>
              ))}
            </select>
            {hasPassedCardInMatch && (
              <span
                className="ml-1 text-slate-500 text-xs"
                title="Theme locked during active round"
              >
                <Lock className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Table Player Count / Bot Management */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={handleRemoveBot}
              disabled={tablePlayerCount <= 4 || hasPassedCardInMatch}
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
              title={
                hasPassedCardInMatch
                  ? 'Cannot adjust players mid-match'
                  : 'Remove a bot (min 4 players)'
              }
            >
              <UserMinus className="w-3.5 h-3.5" />
            </button>
            <span
              className="px-2 py-0.5 text-[11px] font-mono font-bold text-emerald-300 cursor-help"
              title="Table size (4 to 6 players). 6 players is the mathematical optimum for deck balance & fast rounds."
            >
              {tablePlayerCount} Players ({tablePlayerCount - 1} Bots)
            </span>
            <button
              onClick={handleAddBot}
              disabled={tablePlayerCount >= 6 || hasPassedCardInMatch}
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
              title={
                hasPassedCardInMatch
                  ? 'Cannot adjust players mid-match'
                  : 'Add a bot (max 6 players - optimum balance)'
              }
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bot Takeover / Substitute Toggle */}
          <button
            onClick={toggleBotAutoPlay}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition ${
              isBotAutoPlay
                ? 'bg-purple-500/25 text-purple-300 border-purple-500/50 shadow-sm animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Let an intelligent bot take over your turns (or toggle auto-substitute)"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Bot Takeover:</span>
            <span>{isBotAutoPlay ? 'AUTO ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowVault(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <span className="hidden md:inline">Vault</span>
          </button>

          {/* Status Display Toggle (Renamed) */}
          <button
            onClick={() => setShowStatusReports((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition ${
              showStatusReports
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle verbose status updates report on/off"
          >
            {showStatusReports ? (
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">Status Display:</span>
            <span>{showStatusReports ? 'ON' : 'OFF'}</span>
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
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => startNewMatch()}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* Top Status & Sequential Progress Bar (Toggled by showStatusReports) */}
      {showStatusReports ? (
        <div className="bg-slate-900/85 border border-emerald-800/40 rounded-2xl p-3 shadow-lg space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 flex-wrap">
              <div className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                Round {round}
              </div>
              <div className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold flex items-center gap-1">
                <span>Starter:</span>
                <span>
                  {players[(round - 1) % tablePlayerCount]?.avatar} {players[(round - 1) % tablePlayerCount]?.name}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-emerald-300 flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isTransferring ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                  }`}
                />
                <span>{turnMessage}</span>
              </div>
              {/* Auto-pass Countdown Timer Pill */}
              {currentStep === 'user_turn' && !isTransferring && (
                <div className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold flex items-center gap-1.5 animate-pulse">
                  <Timer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto-pass in {autoPassSecondsLeft}s</span>
                </div>
              )}
            </div>

            {/* Dynamic Clockwise Sequential Step Badges */}
            <div className="flex items-center gap-1 text-[11px] font-mono flex-wrap">
              {Array.from({ length: tablePlayerCount }).map((_, stepIdx) => {
                const starterIdx = (round - 1) % tablePlayerCount;
                const from = players[(starterIdx + stepIdx) % tablePlayerCount];
                const to = players[(starterIdx + stepIdx + 1) % tablePlayerCount];
                if (!from || !to) return null;

                const currentStepNum = activeTransfer
                  ? activeTransfer.stepNum
                  : ((activePlayerIdx - starterIdx + tablePlayerCount) % tablePlayerCount) + 1;
                const isStepActive = currentStepNum === stepIdx + 1;

                return (
                  <React.Fragment key={stepIdx}>
                    {stepIdx > 0 && <span className="text-slate-600">➔</span>}
                    <span
                      className={`px-2 py-0.5 rounded-full border transition ${
                        isStepActive
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400 font-bold shadow-xs'
                          : 'bg-slate-950 text-slate-500 border-slate-800'
                      }`}
                    >
                      {stepIdx + 1}. {from.name} ➔ {to.name}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Minimal Sleek Status Bar when Reports are turned OFF */
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-amber-300">Round {round}</span>
            <span>•</span>
            <span className="text-indigo-300">
              Starter: {players[(round - 1) % tablePlayerCount]?.name}
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-sans truncate">{turnMessage}</span>
            {currentStep === 'user_turn' && !isTransferring && (
              <>
                <span>•</span>
                <span className="text-amber-400 font-bold animate-pulse">
                  ⏳ {autoPassSecondsLeft}s left
                </span>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-bold ml-2 shrink-0">
            Display OFF
          </span>
        </div>
      )}

      {/* Opponents Area (Top Row) with Live Dynamic Card Counts (4 or 5 cards) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <span>Rival Players at Table ({tablePlayerCount - 1} Competitors)</span>
            <span className="text-[10px] text-emerald-400 font-mono">
              (Sequential 1-Card Pass)
            </span>
          </span>
          <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3" /> Turn rotates clockwise
          </span>
        </div>

        <div
          className={`grid gap-2.5 ${
            tablePlayerCount === 4
              ? 'grid-cols-3'
              : tablePlayerCount === 5
              ? 'grid-cols-2 sm:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-5'
          }`}
        >
          {players.slice(1).map((bot, index) => {
            const botCardCount = bot.hand.length;
            const isHolding5Cards = botCardCount === 5;
            const isTargetOfTransfer = activeTransfer?.toName === bot.name;
            const isSenderOfTransfer = activeTransfer?.fromName === bot.name;

            return (
              <div
                key={bot.id}
                className={`bg-slate-900/90 border rounded-xl p-3 flex flex-col items-center justify-between relative shadow-md transition-all duration-300 min-h-[155px] ${
                  isHolding5Cards
                    ? 'border-amber-400 ring-4 ring-amber-400/40 bg-gradient-to-b from-amber-950/40 to-slate-900 scale-[1.02]'
                    : isTargetOfTransfer
                    ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-emerald-950/20'
                    : isSenderOfTransfer
                    ? 'border-sky-400 ring-2 ring-sky-400/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Live Card Count Pill */}
                <div className="absolute -top-2.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border shadow-md flex items-center gap-1">
                  {isHolding5Cards ? (
                    <span className="bg-amber-500 text-slate-950 border border-amber-300 px-2 py-0.5 rounded-full animate-bounce">
                      ⚡ 5 Cards in Hand (Choosing...)
                    </span>
                  ) : (
                    <span className="bg-slate-800 text-slate-300 border-slate-700 px-2 py-0.5 rounded-full">
                      {botCardCount} Cards
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2 mt-1.5">
                  <span className="text-2xl">{bot.avatar}</span>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1 truncate max-w-[90px]">
                      {bot.name}
                    </div>
                    <div className="text-[10px] text-amber-400 font-mono font-bold">
                      {bot.score} pts total
                    </div>
                  </div>
                </div>

                {/* Bot Card Backs (Shows 4 or 5 cards visually) */}
                <div className="flex items-center -space-x-3.5 py-1">
                  {bot.hand.map((card, idx) => (
                    <div
                      key={card.id || idx}
                      className={`w-9 h-13 sm:w-10 sm:h-14 rounded-lg bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border shadow-sm flex items-center justify-center text-xs font-bold transition-transform ${
                        isHolding5Cards
                          ? 'border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                          : 'border-indigo-500/40 text-indigo-400/70'
                      }`}
                    >
                      {isHolding5Cards && idx === 4 ? '✨' : '🎴'}
                    </div>
                  ))}
                </div>

                {/* Dynamic Sub-status label */}
                <div className="text-[9px] font-mono text-slate-400 mt-1 text-center truncate max-w-full">
                  {index === 0
                    ? `From You ➔ To ${players[2]?.name || 'Next'}`
                    : index === players.length - 2
                    ? `From ${players[index]?.name} ➔ To You`
                    : `From ${players[index]?.name} ➔ To ${players[index + 2]?.name}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Table Area with SECRET SINGLE-CARD In-Flight Passing Animation */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900/95 via-indigo-950/40 to-slate-900/95 border border-indigo-900/50 p-4 shadow-inner min-h-[140px] flex flex-col justify-center">
        {activeTransfer ? (
          /* Live Secret Single Card in Motion */
          <div className="py-2 flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span className="uppercase tracking-widest text-[11px] font-mono">
                {activeTransfer.directionTitle}
              </span>
            </div>

            {/* In-Flight Secret Card Banner (Face-down, identity kept completely secret) */}
            <div className="bg-slate-950 border-2 border-indigo-500/60 rounded-2xl p-3 px-6 shadow-2xl flex items-center gap-4 animate-float-card relative overflow-hidden shadow-[0_0_25px_rgba(99,102,241,0.35)]">
              {/* Sender */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeTransfer.fromAvatar}</span>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">From</div>
                  <div className="text-xs font-bold text-white">{activeTransfer.fromName}</div>
                </div>
              </div>

              {/* The Single Secret Card in Transit (Face-Down Mystery) */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-950/90 via-slate-900/90 to-purple-950/90 border border-indigo-500/50 rounded-xl shadow-inner">
                <div className="w-9 h-12 rounded-lg bg-gradient-to-br from-indigo-600 via-indigo-900 to-slate-950 border border-indigo-400/60 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:4px_4px] opacity-50" />
                  <span className="text-sm">🎴</span>
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold text-indigo-200 flex items-center gap-1.5">
                    <span>Secret Card</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                      Face Down
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Passed secretly • Face hidden in transit
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight className="w-5 h-5 text-indigo-400 animate-pulse" />

              {/* Receiver */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeTransfer.toAvatar}</span>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">To</div>
                  <div className="text-xs font-bold text-emerald-300">{activeTransfer.toName}</div>
                </div>
              </div>
            </div>

            {showStatusReports && (
              <div className="text-[10px] font-mono text-slate-400">
                Cards in flight are kept secret. Receiver inspects all 5 cards and passes the one they do not want.
              </div>
            )}
          </div>
        ) : currentStep === 'user_turn' ? (
          /* Normal State: User Turn Ready to Pass 1 Card */
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl">
                🃏
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                  <span>
                    {selectedCardId
                      ? `Selected card ready to pass to ${players[1]?.name || 'next player'}`
                      : humanPlayer?.hand.length === 5
                      ? `You hold 5 cards! Select 1 unwanted card to pass to ${players[1]?.name || 'next player'}`
                      : `Choose 1 card from your hand to pass to ${players[1]?.name || 'next player'}`}
                  </span>
                  {selectedCardId && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono border border-amber-400/40">
                      Card Picked
                    </span>
                  )}
                  {isBotAutoPlay && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/40 animate-pulse">
                      Bot Autoplay Active
                    </span>
                  )}
                </div>
                {showStatusReports && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                    <span>
                      Clockwise rotation: You ➔ {players.slice(1).map((p) => p.name).join(' ➔ ')} ➔ You. Passing 1 card leaves you with 4 cards.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUserPassCard()}
                disabled={!selectedCardId || !!resultModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
              >
                <span>Pass 1 Card to {players[1]?.name || 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Bot Deciding State */
          <div className="flex flex-col items-center justify-center py-2 space-y-1 text-center">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>
                {players[activePlayerIdx]?.avatar} {players[activePlayerIdx]?.name} is evaluating cards & choosing which to pass clockwise...
              </span>
            </div>
            {showStatusReports && (
              <p className="text-[10px] text-slate-400 font-mono">
                The active player discards the unwanted card secretly to bring their hand back to 4.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Player's Hand Area with Stack Same Cards Support */}
      {humanPlayer && (
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
          {/* Hand Header with Stack Toggle & Live Count */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{humanPlayer.avatar}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Your Hand</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold border ${
                      humanPlayer.hand.length === 3
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {humanPlayer.hand.length === 3
                      ? `3 Cards (1 Passed to ${players[1]?.name || 'Next'})`
                      : `${humanPlayer.hand.length} Cards in Hand`}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono font-bold">
                    {humanPlayer.score} pts total
                  </span>
                  <span className="text-[11px] text-amber-300/80 font-mono flex items-center gap-1 hidden sm:inline-flex">
                    <MousePointer className="w-3 h-3" /> Double-click card to pass
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {humanPlayer.hand.length === 3
                    ? `You started the pass! Waiting for incoming card from ${players[players.length - 1]?.name || 'Player'} to return to 4 cards.`
                    : handViewMode === 'stacked'
                    ? 'Cards of the same set are stacked together with progress dots towards Quartet (4-of-a-kind). Double-click to pass.'
                    : 'Showing individual cards with uniform constant dimensions. Single-click to select, or double-click to pass immediately.'}
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
                title="Stack duplicate cards of the same set together"
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

          {/* VIEW 1: STACKED SAME CARDS (Physical Askew Layering) */}
          {handViewMode === 'stacked' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-3">
              {stackedCards.map((stack) => {
                const isStackSelected = stack.cards.some((c) => c.id === selectedCardId);
                const hasQuartet = stack.count === 4;
                const isOneAway = stack.count === 3;
                const hasPair = stack.count === 2;

                return (
                  <div
                    key={stack.setId}
                    onClick={() => handleStackClick(stack.cards)}
                    onDoubleClick={() => handleStackDoubleClick(stack.cards)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between h-52 sm:h-56 shadow-lg group select-none ${
                      isStackSelected
                        ? 'border-amber-400 bg-amber-950/40 -translate-y-3 ring-4 ring-amber-400/30'
                        : hasQuartet
                        ? 'border-yellow-400 bg-yellow-950/30 ring-2 ring-yellow-400/40 animate-pulse'
                        : 'border-slate-700 bg-slate-950/90 hover:-translate-y-1.5 hover:border-emerald-500/60'
                    }`}
                    style={{
                      zIndex: stack.count,
                      boxShadow: isStackSelected
                        ? `0 12px 28px -5px ${stack.color}50`
                        : undefined,
                    }}
                  >
                    {/* Visual Askew Underlayers: Staggered fanned cards clearly displaying card count */}
                    {stack.cards.slice(0, stack.count - 1).map((underCard, cIdx) => {
                      const total = stack.count;
                      let rot = -5;
                      let transX = -5;
                      const transY = (cIdx + 1) * -6;

                      if (total === 2) {
                        rot = -6;
                        transX = -6;
                      } else if (total === 3) {
                        rot = cIdx === 0 ? -8 : 6;
                        transX = cIdx === 0 ? -7 : 7;
                      } else if (total === 4) {
                        rot = cIdx === 0 ? -10 : cIdx === 1 ? -4 : 6;
                        transX = cIdx === 0 ? -9 : cIdx === 1 ? -4 : 8;
                      } else if (total >= 5) {
                        rot = (cIdx - 2) * 4;
                        transX = (cIdx - 2) * 6;
                      }

                      return (
                        <div
                          key={underCard.id || cIdx}
                          className="absolute inset-0 rounded-2xl border-2 bg-slate-950 shadow-md pointer-events-none transition-all duration-300 group-hover:scale-[1.03]"
                          style={{
                            transform: `translate(${transX}px, ${transY}px) rotate(${rot}deg)`,
                            borderColor: `${stack.color}55`,
                            zIndex: cIdx - 10,
                          }}
                        >
                          {/* Visible top label on askew card */}
                          <div className="flex justify-between items-center p-2 opacity-85">
                            <span className="text-[9px] font-mono font-bold text-slate-300 bg-slate-900/90 px-1.5 py-0.2 rounded border border-slate-700">
                              #{underCard.numberInSet}/4
                            </span>
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: stack.color }}
                            />
                          </div>
                        </div>
                      );
                    })}

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

                      {/* Visible Card Tags showing all cards present in the stack */}
                      <div className="flex items-center justify-center gap-1 pt-1 flex-wrap">
                        {stack.cards.map((c, idx) => (
                          <span
                            key={c.id || idx}
                            className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300"
                            title={`Card #${c.numberInSet}/4 of ${c.name}`}
                          >
                            #{c.numberInSet}
                          </span>
                        ))}
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
                          <CheckCircle2 className="w-3 h-3" /> Selected 1 to Pass
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                          {hasQuartet
                            ? '🎉 Complete 4-of-4 (100 pts)'
                            : isOneAway
                            ? '🔥 1 to Quartet (75 pts)'
                            : stack.count === 2
                            ? 'Pair (50 pts)'
                            : 'Single (0 pts)'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW 2: SPREAD VIEW (Strict Constant Card Sizes at all times during play) */
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 pt-1">
              {humanPlayer.hand.map((card) => {
                const isSelected = card.id === selectedCardId;
                const isNewlyReceived = card.id === receivedCardId;

                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    onDoubleClick={() => handleCardDoubleClick(card)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between w-32 sm:w-36 h-48 sm:h-52 shrink-0 shadow-lg select-none ${
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
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black tracking-wider uppercase shadow-md flex items-center gap-1 whitespace-nowrap">
                        <Sparkles className="w-2.5 h-2.5" /> From {players[players.length - 1]?.name || 'Player'}
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

      {/* USER SPECIFIC RESULT ANNOUNCEMENT: WINNER CONFETTI vs LOSER DEFEAT ANIMATION + MATCH SCORECARD */}
      {resultModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          {resultModal.isUserWinner ? (
            /* ============================================================ */
            /* 1. WINNER CELEBRATION MODAL (User Won: Confetti + Trophies)  */
            /* ============================================================ */
            <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 border-2 border-amber-400/80 rounded-3xl p-5 sm:p-7 max-w-xl w-full text-center space-y-5 shadow-2xl relative overflow-hidden animate-in zoom-in-95 my-auto">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/40 animate-bounce">
                🏆
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-black text-amber-300 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40">
                  🎉 VICTORY! YOU WON ROUND {round}!
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white pt-1">
                  Quartet Achieved!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-300 font-medium">
                  You assembled 4x {resultModal.winningItemName} and earned the top score of 100 points!
                </p>
              </div>

              {/* Showcase the winning quartet set */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-400/40 flex items-center justify-center gap-3 shadow-inner">
                <span className="text-4xl">{resultModal.winningItemIcon}</span>
                <div className="text-left">
                  <div className="text-base font-black text-white">
                    4x {resultModal.winningItemName}
                  </div>
                  <div className="text-xs text-amber-400 font-mono font-bold">
                    +100 Points Scored! (Winner)
                  </div>
                </div>
              </div>

              {/* SCORECARD BREAKDOWN: Points Scored by Each Player at End of Match */}
              <div className="bg-slate-950/85 border border-slate-800 rounded-2xl p-3.5 text-left space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Round {round} Player Scores & Standings</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    25 pts / matching card
                  </span>
                </div>

                <div className="space-y-2">
                  {resultModal.scoresBreakdown.map((item, idx) => (
                    <div
                      key={item.playerId}
                      className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
                        item.isHuman
                          ? 'bg-emerald-950/50 border-emerald-500/60 ring-1 ring-emerald-500/30'
                          : idx === 0
                          ? 'bg-amber-950/30 border-amber-500/40'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      {/* Player info & combo */}
                      <div className="flex items-center gap-2.5 min-w-[140px]">
                        <span className="text-xl">{item.playerAvatar}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{item.playerName}</span>
                            {item.isHuman && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                YOU
                              </span>
                            )}
                            {idx === 0 && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                1ST
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span>{item.bestSetIcon}</span>
                            <span className="font-semibold text-slate-300">{item.comboLabel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Final Hand Cards Revealed */}
                      <div className="flex items-center gap-1">
                        {item.hand.map((card, cIdx) => (
                          <div
                            key={card.id || cIdx}
                            className="w-7 h-9 rounded bg-slate-900 border border-slate-700 flex flex-col items-center justify-center shadow-xs"
                            title={`${card.name} (#${card.numberInSet}/4)`}
                          >
                            <span className="text-xs">{card.icon}</span>
                          </div>
                        ))}
                      </div>

                      {/* Points & Cumulative */}
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 text-right">
                        <div className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-right min-w-[65px]">
                          <div className="text-[8px] text-slate-400 uppercase font-mono">Round</div>
                          <div
                            className={`text-xs font-mono font-black ${
                              item.roundPoints === 100
                                ? 'text-amber-400'
                                : item.roundPoints === 75
                                ? 'text-orange-400'
                                : item.roundPoints === 50
                                ? 'text-emerald-400'
                                : 'text-slate-300'
                            }`}
                          >
                            +{item.roundPoints} pts
                          </div>
                        </div>

                        <div className="px-2 py-0.5 rounded-lg bg-slate-900/90 border border-slate-800 text-right min-w-[70px]">
                          <div className="text-[8px] text-slate-400 uppercase font-mono">Total</div>
                          <div className="text-xs font-mono font-bold text-amber-300">
                            {item.cumulativeScore} pts
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <button
                  onClick={startNextRound}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/30 transition transform hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Proceed to Round {round + 1}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowScoreboard(true)}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Leaderboard</span>
                  </button>
                  <button
                    onClick={() => navigate('games')}
                    className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 hover:text-rose-200 border border-slate-800 text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Quit to Games</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* 2. LOSER DEFEAT MODAL (User Lost: Defeat Rain & Gloom Shake) */
            /* ============================================================ */
            <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-rose-950/60 border-2 border-rose-500/50 rounded-3xl p-5 sm:p-7 max-w-xl w-full text-center space-y-5 shadow-2xl relative overflow-hidden animate-defeat-shake my-auto">
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

              {/* Rain / Storm Icon */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-3xl mx-auto shadow-inner text-rose-400">
                  🌧️
                </div>
                <div className="absolute bottom-0 right-1/2 translate-x-6 text-xl animate-pulse">
                  💔
                </div>
              </div>

              <div className="space-y-1 relative z-10">
                <span className="text-xs font-mono font-black text-rose-400 uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40">
                  ROUND {round} COMPLETED
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white pt-1">
                  {resultModal.winner.name} Claimed Quartet!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  {resultModal.winner.avatar} {resultModal.winner.name} assembled 4x {resultModal.winningItemName} and won 100 pts.
                </p>
              </div>

              {/* Winning Hand recap */}
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-center gap-3 relative z-10 shadow-md">
                <span className="text-3xl">{resultModal.winningItemIcon}</span>
                <div className="text-left">
                  <div className="text-xs text-slate-400">Winning 4-of-a-Kind Set:</div>
                  <div className="text-sm font-black text-rose-300">
                    4x {resultModal.winningItemName} (+100 pts)
                  </div>
                </div>
              </div>

              {/* SCORECARD BREAKDOWN: Points Scored by Each Player at End of Match */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 text-left space-y-2.5 relative z-10">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Round {round} Points Scored by Each Player</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    25 pts / matching card
                  </span>
                </div>

                <div className="space-y-2">
                  {resultModal.scoresBreakdown.map((item, idx) => (
                    <div
                      key={item.playerId}
                      className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
                        item.isHuman
                          ? 'bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/30'
                          : idx === 0
                          ? 'bg-rose-950/30 border-rose-500/40'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      {/* Player info & combo */}
                      <div className="flex items-center gap-2.5 min-w-[140px]">
                        <span className="text-xl">{item.playerAvatar}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{item.playerName}</span>
                            {item.isHuman && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                YOU
                              </span>
                            )}
                            {idx === 0 && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                WINNER
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span>{item.bestSetIcon}</span>
                            <span className="font-semibold text-slate-300">{item.comboLabel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Final Hand Cards Revealed */}
                      <div className="flex items-center gap-1">
                        {item.hand.map((card, cIdx) => (
                          <div
                            key={card.id || cIdx}
                            className="w-7 h-9 rounded bg-slate-900 border border-slate-700 flex flex-col items-center justify-center shadow-xs"
                            title={`${card.name} (#${card.numberInSet}/4)`}
                          >
                            <span className="text-xs">{card.icon}</span>
                          </div>
                        ))}
                      </div>

                      {/* Points & Cumulative */}
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 text-right">
                        <div className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-right min-w-[65px]">
                          <div className="text-[8px] text-slate-400 uppercase font-mono">Round</div>
                          <div
                            className={`text-xs font-mono font-black ${
                              item.roundPoints === 100
                                ? 'text-amber-400'
                                : item.roundPoints === 75
                                ? 'text-orange-400'
                                : item.roundPoints === 50
                                ? 'text-emerald-400'
                                : 'text-slate-300'
                            }`}
                          >
                            +{item.roundPoints} pts
                          </div>
                        </div>

                        <div className="px-2 py-0.5 rounded-lg bg-slate-900/90 border border-slate-800 text-right min-w-[70px]">
                          <div className="text-[8px] text-slate-400 uppercase font-mono">Total</div>
                          <div className="text-xs font-mono font-bold text-amber-300">
                            {item.cumulativeScore} pts
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-1 flex flex-col gap-2 relative z-10">
                <button
                  onClick={startNextRound}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-black text-sm tracking-wide shadow-xl shadow-rose-600/30 transition transform hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Revenge Match - Round {round + 1}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowScoreboard(true)}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Leaderboard</span>
                  </button>
                  <button
                    onClick={() => navigate('games')}
                    className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 hover:text-rose-200 border border-slate-800 text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Quit to Games</span>
                  </button>
                </div>
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
                <BookOpen className="w-5 h-5 text-amber-400" /> Sequential Passing & Scoring Rules
              </h3>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong>Sequential 1-by-1 Flow & Rotating Starter:</strong> Cards are passed one at a time clockwise around the table! Each new match is started by the next player in line ({players.map((p) => p.name).join(' ➔ ')}).
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-400">
                <li>
                  <strong className="text-white">Starting the Match:</strong> The round starter begins with 4 cards, selects 1 card to pass secretly, and drops to 3 cards waiting for the circle to complete.
                </li>
                <li>
                  <strong className="text-white">Receiving & Deciding:</strong> Each clockwise receiver accepts the card, temporarily holding <strong>5 cards</strong> in hand. They inspect their hand and pass the 1 unwanted card forward, returning to 4 cards.
                </li>
                <li>
                  <strong className="text-white">Closing the Cycle:</strong> When the pass reaches the original starter, their hand returns to 4 cards. If no player has a Quartet, the starter initiates the next pass.
                </li>
                <li>
                  <strong className="text-white">Fast Pass & Auto-Pass:</strong> Double-clicking any card or card stack passes it immediately! In multiplayer, a 15-second timer will auto-pass the least matching card if a player is inactive.
                </li>
                <li>
                  <strong className="text-white">Bot Takeover & Table Size:</strong> If a player steps away, toggle "Bot Takeover" to have an AI pilot the hand. The table dynamically supports 4, 5, or 6 players. <em>(6 players is the mathematical optimum: 24 cards ensures high quartet density and prevents hand dilution)</em>.
                </li>
              </ol>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" /> Round End Scoring System
                </div>
                <ul className="text-xs text-slate-300 space-y-1 pl-1">
                  <li>• <strong className="text-amber-400">Quartet (4 same cards):</strong> <strong>100 points</strong> (Winner)</li>
                  <li>• <strong className="text-orange-400">Triple (3 same cards):</strong> <strong>75 points</strong></li>
                  <li>• <strong className="text-emerald-400">One Pair (2 same cards):</strong> <strong>50 points</strong> <em>(Only one pair is counted for score)</em></li>
                  <li>• <strong className="text-slate-400">Singles (no match):</strong> <strong>0 points</strong> <em>(No points awarded for singles)</em></li>
                </ul>
                <p className="text-[11px] text-slate-400 font-mono pt-1">
                  Cumulative scores persist across all rounds. Themes can be changed before the first card is passed!
                </p>
              </div>
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

      {/* Scoreboard Modal (Cumulative Tournament Standings) */}
      {showScoreboard && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" /> Cumulative Tournament Standings
                </h3>
                <p className="text-[11px] text-slate-400">
                  Running points across all rounds (Round {round})
                </p>
              </div>
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
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      p.isHuman
                        ? 'bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/30'
                        : idx === 0
                        ? 'bg-amber-950/30 border-amber-500/40'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-slate-500 font-bold">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <span className="text-2xl">{p.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{p.name}</span>
                          {p.isHuman && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.hand.length} cards currently in hand
                        </div>
                      </div>
                    </div>
                    <span className="text-base font-mono font-black text-amber-400">{p.score} pts</span>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={handleResetTournament}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5"
                title="Reset running points for all players to 0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Tournament</span>
              </button>
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
