import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Shield, Heart, Coins, Play, RotateCcw, 
  Settings as SettingsIcon, Info, Volume2, VolumeX, X, Zap, Trophy,
  Star, ChevronRight, AlertTriangle, BookOpen, User, Flame
} from "lucide-react";

// --- TYPES & INTERFACES ---
interface ConceptCard {
  front: string;
  back: string;
}

interface TowerDefenseProps {
  deck: ConceptCard[];
  onClose: () => void;
}

interface TowerConfig {
  type: string;
  name: string;
  cost: number;
  range: number;
  damage: number;
  cooldown: number; // frames between shots
  color: string;
  bulletColor: string;
  description: string;
  purchasable?: boolean;
}

interface Tower {
  id: string;
  x: number;
  y: number;
  type: string;
  level: number; // 1, 2, or 3
  range: number;
  damage: number;
  cooldown: number;
  color: string;
  lastShotFrame: number;
  targetMode: "First" | "Last" | "Strongest" | "Weakest" | "Closest";
}

interface Enemy {
  id: string;
  type: "Goblin" | "Orc" | "Skeleton" | "Knight" | "Wolf" | "Giant" | "Flying Dragon" | "Boss";
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  waypointIndex: number;
  size: number;
  color: string;
  isSlowing: number; // slow duration frames
  burnDuration: number; // burn duration frames
  burnDamage: number;
  maxSpeed: number;
  isStunned?: number; // stun duration frames
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  targetEnemyId: string;
  speed: number;
  damage: number;
  color: string;
  type: string; // "arrow", "cannon", "ice", "fire", "lightning", "magic"
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number; // frames remaining
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

interface GameStats {
  highWave: number;
  enemiesDefeated: number;
  bossesDefeated: number;
  towersBuilt: number;
  totalGoldEarned: number;
  totalPlayTime: number; // seconds
}

// --- CONFIGURATIONS ---
const MAPS = [
  { id: "grasslands", name: "Grasslands 🌱", color: "#38b000", pathColor: "#e9c46a" },
  { id: "snowvalley", name: "Snow Valley ❄️", color: "#a8dadc", pathColor: "#f1faee" },
  { id: "desert", name: "Desert Dunes 🏜️", color: "#f4a261", pathColor: "#e76f51" },
  { id: "volcano", name: "Volcano Peak 🌋", color: "#1d1d1d", pathColor: "#e63946" },
  { id: "endless", name: "Endless Space 🌠", color: "#1a1c29", pathColor: "#4361ee" }
];

const TOWERS: Record<string, TowerConfig> = {
  archer: { type: "archer", name: "Archer Tower 🏹", cost: 100, range: 165, damage: 28, cooldown: 25, color: "#4caf50", bulletColor: "#a3b18a", description: "Shoots swift overcharged arrows with high precision." },
  cannon: { type: "cannon", name: "Cannon Tower 💣", cost: 150, range: 125, damage: 95, cooldown: 60, color: "#f44336", bulletColor: "#555555", description: "Fires massive splash damage cannonballs at a slow pace." },
  ice: { type: "ice", name: "Ice Spires ❄️", cost: 125, range: 135, damage: 18, cooldown: 35, color: "#00b4d8", bulletColor: "#caf0f8", description: "Freezing cold shards that slow down target invaders by 50%." },
  fire: { type: "fire", name: "Fire Altar 🔥", cost: 175, range: 145, damage: 24, cooldown: 30, color: "#ff9100", bulletColor: "#ff0000", description: "Blazing firestorms that melt enemies with continuous DOT burn damage." },
  lightning: { type: "lightning", name: "Lightning Coil ⚡", cost: 200, range: 160, damage: 65, cooldown: 45, color: "#9c27b0", bulletColor: "#e0aaff", description: "High voltage lightning that chains across multiple target invaders." },
  magic: { type: "magic", name: "Arcane Obelisk 🔮", cost: 225, range: 185, damage: 125, cooldown: 50, color: "#3f51b5", bulletColor: "#00ffff", description: "Concentrated disintegrating arcane magic blasts." },
  
  // Custom non-purchasable merged new characters
  char1: { type: "char1", name: "Chronos Sentinel ⏳", cost: 400, range: 205, damage: 180, cooldown: 40, color: "#cbd5e1", bulletColor: "#f59e0b", description: "Fires temporal pulse rings that slow targets down by 50% for 2.5 seconds (150 frames). Can only be acquired by merging two Arcane Obelisks.", purchasable: false },
  char2: { type: "char2", name: "Nebula Warden 🌌", cost: 800, range: 220, damage: 290, cooldown: 35, color: "#8b5cf6", bulletColor: "#c084fc", description: "Commands gravity. Fires stellar nebula balls that deal massive splash damage in a 120px radius and pull targets inward. Merge two Chronos Sentinels.", purchasable: false },
  char3: { type: "char3", name: "Solar Deity ☀️", cost: 1600, range: 240, damage: 450, cooldown: 30, color: "#f59e0b", bulletColor: "#f97316", description: "Fires supernova flares that deal high damage, burn targets for 3 seconds, and splash burn adjacent enemies in a 90px zone. Merge two Nebula Wardens.", purchasable: false },
  char4: { type: "char4", name: "Quantum Sage ⚛️", cost: 3200, range: 260, damage: 680, cooldown: 25, color: "#10b981", bulletColor: "#34d399", description: "Fires splitting molecular quantum beams that chain-strike up to 6 targets for full damage. Merge two Solar Deities.", purchasable: false },
  char5: { type: "char5", name: "Aether Lord 🔱", cost: 6400, range: 280, damage: 1050, cooldown: 20, color: "#ec4899", bulletColor: "#f472b6", description: "Conjures super-charged lightning spears that chain-zap up to 5 enemies, cutting armor and slowing them down. Merge two Quantum Sages.", purchasable: false },
  char6: { type: "char6", name: "Void Singularity 🌀", cost: 12800, range: 300, damage: 1650, cooldown: 18, color: "#000000", bulletColor: "#a855f7", description: "Launches black hole voids that ignore all enemy damage resistances and implode on contact, dealing immense raw damage. Merge two Aether Lords.", purchasable: false },
  char7: { type: "char7", name: "Eon Sovereign 👑", cost: 25600, range: 320, damage: 2500, cooldown: 16, color: "#fbbf24", bulletColor: "#ffffff", description: "Releases divine shockwaves that completely freeze and STUN the target and all adjacent invaders within 80px for 1.5 seconds. Merge two Void Singularities.", purchasable: false },
  char8: { type: "char8", name: "Dimension Weaver 🪐", cost: 51200, range: 340, damage: 3800, cooldown: 14, color: "#06b6d4", bulletColor: "#22d3ee", description: "Shatters space-time. Fires a dimensional hyper-laser that disintegrates all units and inflicts continuous rift tear damage. Merge two Eon Sovereigns.", purchasable: false },
  char9: { type: "char9", name: "Omniscient Eye 👁️", cost: 102400, range: 370, damage: 5800, cooldown: 12, color: "#ef4444", bulletColor: "#f87171", description: "A lightning-fast focal point of all absolute knowledge. Fires rapid-fire death rays that melt targets in milliseconds. Merge two Dimension Weavers.", purchasable: false },
  char10: { type: "char10", name: "Infinity Archon ♾️", cost: 204800, range: 400, damage: 9999, cooldown: 10, color: "#ff007f", bulletColor: "#ffddff", description: "The legendary supreme entity of infinite wisdom. Shoots cosmic singularity shockwaves that obliterate ALL enemies within its massive range. The ultimate defense.", purchasable: false }
};

const getNextMergeType = (currentType: string): string | null => {
  const MERGE_CHAIN = [
    "archer", "cannon", "ice", "fire", "lightning", "magic",
    "char1", "char2", "char3", "char4", "char5", "char6", "char7", "char8", "char9", "char10"
  ];
  const idx = MERGE_CHAIN.indexOf(currentType);
  if (idx !== -1 && idx < MERGE_CHAIN.length - 1) {
    return MERGE_CHAIN[idx + 1];
  }
  return null;
};

const HEROES = [
  { id: "scholar", name: "Scholar Mage 🎓", desc: "Gain +30% gold from quiz answers. Starts with +100 gold.", modifier: "gold" },
  { id: "teacher", name: "Battle Teacher 🍎", desc: "All towers deal +15% damage globally.", modifier: "damage" },
  { id: "science", name: "Science Wizard 🧪", desc: "Towers gain +15% range.", modifier: "range" },
  { id: "math", name: "Math Master 📐", desc: "All towers cost 15% less to build.", modifier: "cost" },
  { id: "history", name: "History Guardian ⏳", desc: "Start with 25 Lives (instead of 20) and bosses have 20% less HP.", modifier: "boss" }
];

export function TowerDefenseGame({ deck, onClose }: TowerDefenseProps) {
  // --- STATE ---
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover" | "howtoplay" | "credits" | "stats" | "difficulty">("menu");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "nightmare">("medium");
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState("grasslands");
  const [selectedHero, setSelectedHero] = useState("scholar");
  const [gold, setGold] = useState(300);
  const [lives, setLives] = useState(20);
  const [wave, setWave] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameSpeed, setGameSpeed] = useState<1 | 2 | 4>(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  
  // Quiz states
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<{
    q: string;
    options: string[];
    answer: string;
  } | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<"correct" | "incorrect" | null>(null);
  const [waveBuffActive, setWaveBuffActive] = useState(false); // True if answered wrongly, enemies buffed

  // Selections
  const [selectedTowerType, setSelectedTowerType] = useState<string | null>("archer");
  const [selectedPlacedTower, setSelectedPlacedTower] = useState<Tower | null>(null);
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null);

  // Play Statistics & Saves
  const [stats, setStats] = useState<GameStats>({
    highWave: 0,
    enemiesDefeated: 0,
    bossesDefeated: 0,
    towersBuilt: 0,
    totalGoldEarned: 300,
    totalPlayTime: 0
  });

  // --- REFS ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Game Loop runtime arrays
  const towersRef = useRef<Tower[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const frameCountRef = useRef(0);
  const hoverCoordsRef = useRef<{ x: number; y: number } | null>(null);
  const draggedTowerRef = useRef<Tower | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const currentDragPosRef = useRef<{ x: number; y: number } | null>(null);
  const gameStatsRef = useRef<GameStats>(stats);

  // Sync ref with state
  useEffect(() => {
    gameStatsRef.current = stats;
  }, [stats]);

  // Load stats from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("junoai_td_stats") || localStorage.getItem("presentai_td_stats");
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Timer for total play time
  useEffect(() => {
    let interval: any;
    if (gameState === "playing" && !isPaused && !quizOpen) {
      interval = setInterval(() => {
        setStats(prev => {
          const updated = { ...prev, totalPlayTime: prev.totalPlayTime + 1 };
          localStorage.setItem("junoai_td_stats", JSON.stringify(updated));
          return updated;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, isPaused, quizOpen]);

  // --- MAP PATH GENERATION ---
  const getWaypoints = (mapId: string) => {
    switch (mapId) {
      case "snowvalley":
        return [
          { x: 0, y: 300 },
          { x: 250, y: 300 },
          { x: 250, y: 100 },
          { x: 550, y: 100 },
          { x: 550, y: 400 },
          { x: 800, y: 400 }
        ];
      case "desert":
        return [
          { x: 0, y: 150 },
          { x: 200, y: 150 },
          { x: 400, y: 350 },
          { x: 600, y: 150 },
          { x: 800, y: 350 }
        ];
      case "volcano":
        return [
          { x: 400, y: 0 },
          { x: 400, y: 180 },
          { x: 150, y: 180 },
          { x: 150, y: 380 },
          { x: 650, y: 380 },
          { x: 650, y: 180 },
          { x: 800, y: 180 }
        ];
      case "endless":
        return [
          { x: 0, y: 80 },
          { x: 700, y: 80 },
          { x: 700, y: 420 },
          { x: 100, y: 420 },
          { x: 100, y: 250 },
          { x: 800, y: 250 }
        ];
      case "grasslands":
      default:
        return [
          { x: 0, y: 100 },
          { x: 300, y: 100 },
          { x: 300, y: 380 },
          { x: 550, y: 380 },
          { x: 550, y: 200 },
          { x: 800, y: 200 }
        ];
    }
  };

  // --- TOWER PLACEMENT STUDS (TACTICAL SLOTS) ---
  const getMapStuds = (mapId: string): { x: number; y: number }[] => {
    switch (mapId) {
      case "snowvalley":
        return [
          { x: 120, y: 200 },
          { x: 120, y: 420 },
          { x: 380, y: 240 },
          { x: 480, y: 240 },
          { x: 700, y: 250 },
          { x: 380, y: 40 },
          { x: 700, y: 50 },
          { x: 200, y: 380 },
          { x: 310, y: 160 },
          { x: 480, y: 460 },
          { x: 480, y: 40 },
          { x: 620, y: 320 },
          // New added tactical coordinates (expanded space!)
          { x: 50, y: 50 },
          { x: 50, y: 450 },
          { x: 300, y: 450 },
          { x: 740, y: 150 },
          { x: 740, y: 470 },
          { x: 620, y: 150 }
        ];
      case "desert":
        return [
          { x: 100, y: 300 },
          { x: 280, y: 80 },
          { x: 300, y: 420 },
          { x: 500, y: 420 },
          { x: 520, y: 80 },
          { x: 700, y: 150 },
          { x: 100, y: 80 },
          { x: 200, y: 240 },
          { x: 400, y: 240 },
          { x: 600, y: 240 },
          { x: 700, y: 420 },
          // New added tactical coordinates (expanded space!)
          { x: 50, y: 450 },
          { x: 200, y: 340 },
          { x: 350, y: 140 },
          { x: 450, y: 140 },
          { x: 600, y: 340 },
          { x: 750, y: 50 },
          { x: 750, y: 270 }
        ];
      case "volcano":
        return [
          { x: 280, y: 80 },
          { x: 520, y: 80 },
          { x: 280, y: 280 },
          { x: 520, y: 280 },
          { x: 400, y: 450 },
          { x: 80, y: 280 },
          { x: 720, y: 280 },
          { x: 280, y: 140 },
          { x: 520, y: 140 },
          { x: 220, y: 450 },
          { x: 580, y: 450 },
          // New added tactical coordinates (expanded space!)
          { x: 80, y: 80 },
          { x: 720, y: 80 },
          { x: 400, y: 250 },
          { x: 300, y: 350 },
          { x: 500, y: 350 },
          { x: 100, y: 450 },
          { x: 700, y: 450 }
        ];
      case "endless":
        return [
          { x: 200, y: 160 },
          { x: 400, y: 160 },
          { x: 600, y: 160 },
          { x: 200, y: 340 },
          { x: 400, y: 340 },
          { x: 600, y: 340 },
          { x: 400, y: 480 },
          { x: 80, y: 140 },
          { x: 720, y: 140 },
          { x: 720, y: 340 },
          { x: 300, y: 480 },
          { x: 500, y: 480 },
          // New added tactical coordinates (expanded space!)
          { x: 300, y: 210 },
          { x: 500, y: 210 },
          { x: 300, y: 290 },
          { x: 500, y: 290 },
          { x: 150, y: 480 },
          { x: 650, y: 480 }
        ];
      case "grasslands":
      default:
        return [
          { x: 150, y: 220 },
          { x: 150, y: 440 },
          { x: 420, y: 100 },
          { x: 420, y: 250 },
          { x: 420, y: 460 },
          { x: 680, y: 100 },
          { x: 680, y: 320 },
          { x: 80, y: 180 },
          { x: 220, y: 180 },
          { x: 220, y: 300 },
          { x: 380, y: 300 },
          { x: 480, y: 300 },
          // New added tactical coordinates (expanded space!)
          { x: 80, y: 320 },
          { x: 80, y: 440 },
          { x: 220, y: 440 },
          { x: 310, y: 220 },
          { x: 540, y: 100 },
          { x: 680, y: 460 },
          { x: 750, y: 320 }
        ];
    }
  };

  // --- SYNTHESIZER SOUND ENGINE ---
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playSound = (type: "shoot" | "explosion" | "ice" | "correct" | "wrong" | "baseHit" | "click") => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "shoot") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === "explosion") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === "ice") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(900, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === "correct") {
        // High sparkling chime chord
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.55);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === "wrong") {
        osc.type = "square";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.4);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === "baseHit") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(100, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  // --- UNLIMITED PRESENTATION QUESTIONS SYSTEM (YES/NO BINARY OPTION FORMAT) ---
  const generatePresentationQuestion = () => {
    // Basic concept database of presentation keywords & public speaking tips
    const generalConcepts = [
      { front: "Confidence", back: "Believing in yourself! Speaking with a steady voice and relaxed shoulders." },
      { front: "Pacing", back: "The speed of speaking. Aim for 120-130 words per minute so people can follow." },
      { front: "Audience Connection", back: "Engaging classmates using eye contact, quick smiles, and looking around." },
      { front: "Key Takeaway", back: "The single most important idea you want your classmates to remember when you finish." },
      { front: "Visual Balance", back: "Ensuring presentation slides are simple, clean, and spacious instead of crowded." },
      { front: "Eye Contact", back: "Looking directly at classmates or sections of the room to include them." },
      { front: "Body Language", back: "Using open, relaxed posture and friendly hand gestures to appear confident." },
      { front: "Rhetorical Question", back: "Asking a question you don't expect an answer to, to provoke active thought." },
      { front: "The Hook", back: "An interesting opening sentence (surprising fact or story) that grabs attention." },
      { front: "Transition", back: "Smooth words (like 'consequently' or 'moving on') that link parts of your speech." },
      { front: "Breathing Space", back: "Taking conscious pauses in between paragraphs to breathe comfortably and structure points." },
      { front: "Vocal Variety", back: "Varying the pitch, volume, and speed of your speech to avoid monotone delivery." },
      { front: "Verbal Fillers", back: "Unconscious filler words like 'um', 'uh', 'like' or 'so' that disrupt your speaking flow." }
    ];

    const sillyActions = [
      "Running around the stage screaming at the top of your lungs 🗣️.",
      "Eating a giant bowl of messy spaghetti during your opening slide 🍝.",
      "Lying flat on the floor and taking a comfortable 20-minute nap 😴.",
      "Throwing juice boxes at your classmates to get their attention 🧃.",
      "Doing 50 loud pushups while crying in front of the classroom 😭.",
      "Staring blankly at the ceiling in complete, awkward silence for 5 minutes 😳.",
      "Chanting 'Baby Shark' repeatedly at maximum volume 🦈.",
      "Throwing your presentation slides out of the window and running away 🏃‍♂️.",
      "Screaming 'BOO!' at your teacher and hiding under the table 📦.",
      "Playing Minecraft on your phone and ignoring the audience completely 🎮.",
      "Hiding in a cardboard box and speaking in a high-pitched squeaky voice 🎴.",
      "Doing a goofy Fortnite dance instead of speaking 🕺."
    ];

    // If the user has inserted a script, strictly test their script questions!
    const hasUserScriptDeck = deck && deck.length >= 2;
    const activeDeck = hasUserScriptDeck ? deck : generalConcepts;
    
    // Pick a card from the deck
    const card = activeDeck[Math.floor(Math.random() * activeDeck.length)];

    // 50% chance the question is correct (answer is "Yes")
    // 50% chance the question is incorrect (answer is "No")
    const isYesAnswer = Math.random() > 0.5;

    let q = "";
    let answer = "";

    if (hasUserScriptDeck) {
      if (isYesAnswer) {
        q = `According to your script, is this true for "${card.front}":\n"${card.back}"?`;
        answer = "Yes";
      } else {
        const otherCards = activeDeck.filter(c => c.front.toLowerCase() !== card.front.toLowerCase());
        const decoyText = otherCards.length > 0
          ? otherCards[Math.floor(Math.random() * otherCards.length)].back
          : "An opposing claim not stated in your presentation.";
        q = `According to your script, is this true for "${card.front}":\n"${decoyText}"?`;
        answer = "No";
      }
    } else {
      if (isYesAnswer) {
        q = `Does "${card.front}" mean:\n"${card.back}"?`;
        answer = "Yes";
      } else {
        const otherCards = activeDeck.filter(c => c.front.toLowerCase() !== card.front.toLowerCase());
        const decoyText = otherCards.length > 0
          ? otherCards[Math.floor(Math.random() * otherCards.length)].back
          : sillyActions[0];
        q = `Does "${card.front}" mean:\n"${decoyText}"?`;
        answer = "No";
      }
    }

    // Options are always simple: Yes or No!
    const options = ["Yes", "No"];

    return { q, options, answer };
  };

  // --- START GAME PLAYING ---
  const handleStartGame = () => {
    playSound("click");
    
    // Initial conditions based on Hero selection
    let initialGold = 300;
    let initialLives = 20;

    if (selectedHero === "scholar") {
      initialGold = 400; // start bonus gold
    } else if (selectedHero === "history") {
      initialLives = 25; // start bonus lives
    }

    // Apply Difficulty adjustments
    if (difficulty === "easy") {
      initialGold += 100;
      initialLives += 10;
    } else if (difficulty === "hard") {
      initialGold = Math.max(150, Math.round(initialGold * 0.9));
      initialLives = Math.max(5, initialLives - 5);
    } else if (difficulty === "nightmare") {
      initialGold = Math.max(120, Math.round(initialGold * 0.8));
      initialLives = Math.max(2, initialLives - 10);
    }

    setGold(initialGold);
    setLives(initialLives);
    setWave(0);
    setWaveBuffActive(false);
    setIsPaused(false);
    setGameSpeed(1);
    setQuizOpen(false);
    setMergeSourceId(null);
    setSelectedPlacedTower(null);

    // Reset references
    towersRef.current = [];
    enemiesRef.current = [];
    projectilesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    frameCountRef.current = 0;

    setGameState("playing");
  };

  // --- LAUNCH NEXT WAVE (TRIGGERS QUIZ) ---
  const handleTriggerNextWave = () => {
    playSound("click");
    // Generate a presentation concept question
    const generated = generatePresentationQuestion();
    setCurrentQuestion(generated);
    setSelectedOption(null);
    setQuizResult(null);
    setQuizOpen(true);
  };

  const handleAnswerQuiz = (option: string) => {
    if (!currentQuestion || quizResult !== null) return;
    
    setSelectedOption(option);
    const correct = option === currentQuestion.answer;

    if (correct) {
      playSound("correct");
      setQuizResult("correct");
      
      // Correct rewards (Scholar Mage gets +30% gold reward) scaled by difficulty
      let diffCoinMult = 0.70;
      if (difficulty === "easy") diffCoinMult = 0.85;
      else if (difficulty === "hard") diffCoinMult = 0.55;
      else if (difficulty === "nightmare") diffCoinMult = 0.40;

      let bonusGold = Math.max(10, Math.round(120 * diffCoinMult));
      if (selectedHero === "scholar") {
        bonusGold = Math.round(bonusGold * 1.3);
      }
      setGold(prev => prev + bonusGold);
      
      // Floating text reward indicator
      floatingTextsRef.current.push({
        x: 400,
        y: 200,
        text: `CORRECT! +${bonusGold} Gold & Tower Overcharge Boost!`,
        color: "#4caf50",
        life: 100
      });

      setWaveBuffActive(false);
    } else {
      playSound("wrong");
      setQuizResult("incorrect");

      // Penalty: Wave Buff Active (Enemies will be buffed!)
      setWaveBuffActive(true);

      floatingTextsRef.current.push({
        x: 400,
        y: 200,
        text: `WRONG ANSWER! Enemies are buffed!`,
        color: "#f44336",
        life: 100
      });
    }
  };

  const handleStartWaveAfterQuiz = () => {
    playSound("click");
    setQuizOpen(false);
    
    const nextWave = wave + 1;
    setWave(nextWave);

    // Spawn wave enemies
    spawnWaveEnemies(nextWave);
  };

  // --- SPAWN WAVE ENEMIES ---
  const spawnWaveEnemies = (waveNum: number) => {
    const isBossWave = waveNum % 10 === 0;
    
    // Total spawn size increases
    const totalSpawns = 5 + waveNum * 2;
    const types: Enemy["type"][] = ["Goblin"];

    if (waveNum >= 2) types.push("Wolf");
    if (waveNum >= 4) types.push("Skeleton");
    if (waveNum >= 6) types.push("Orc");
    if (waveNum >= 8) types.push("Knight");
    if (waveNum >= 12) types.push("Giant");
    if (waveNum >= 15) types.push("Flying Dragon");

    const newEnemies: Enemy[] = [];

    let diffHpMult = 1.15;
    let diffSpeedMult = 1.08;
    let diffCoinMult = 0.70;

    if (difficulty === "easy") {
      diffHpMult = 0.85;
      diffSpeedMult = 0.88;
      diffCoinMult = 0.85;
    } else if (difficulty === "hard") {
      diffHpMult = 1.55;
      diffSpeedMult = 1.25;
      diffCoinMult = 0.55;
    } else if (difficulty === "nightmare") {
      diffHpMult = 2.15;
      diffSpeedMult = 1.45;
      diffCoinMult = 0.40;
    }

    // Health scales up with wave number - made a tiny bit harder but still balanced and extremely fun!
    const hpMultiplier = (1 + waveNum * 0.12) * 0.65 * (waveBuffActive ? 1.3 : 1.0) * diffHpMult;
    // Speed increases slightly
    const speedMultiplier = (1 + waveNum * 0.015) * 0.9 * (waveBuffActive ? 1.15 : 1.0) * diffSpeedMult;

    for (let i = 0; i < totalSpawns; i++) {
      let type: Enemy["type"] = types[Math.floor(Math.random() * types.length)];
      
      // Customize enemy stats
      let hp = 30;
      let speed = 1.6;
      let size = 16;
      let color = "#ef476f";
      let reward = 10;

      if (type === "Wolf") {
        hp = 25;
        speed = 2.4;
        size = 14;
        color = "#e76f51";
        reward = 12;
      } else if (type === "Skeleton") {
        hp = 45;
        speed = 1.4;
        size = 17;
        color = "#e5e5e5";
        reward = 15;
      } else if (type === "Orc") {
        hp = 70;
        speed = 1.2;
        size = 20;
        color = "#556b2f";
        reward = 20;
      } else if (type === "Knight") {
        hp = 110;
        speed = 1.0;
        size = 19;
        color = "#3a86c8";
        reward = 25;
      } else if (type === "Giant") {
        hp = 250;
        speed = 0.7;
        size = 26;
        color = "#8b5a2b";
        reward = 40;
      } else if (type === "Flying Dragon") {
        hp = 180;
        speed = 1.8;
        size = 22;
        color = "#9b5de5";
        reward = 50;
      }

      hp = Math.round(hp * hpMultiplier);
      speed = speed * speedMultiplier;
      const finalReward = Math.max(1, Math.round(reward * diffCoinMult));

      newEnemies.push({
        id: `enemy-${waveNum}-${i}`,
        type,
        x: -40 - (i * 35), // Stagger spawns off-screen
        y: getWaypoints(selectedMap)[0].y,
        hp,
        maxHp: hp,
        speed,
        reward: finalReward,
        waypointIndex: 0,
        size,
        color,
        isSlowing: 0,
        burnDuration: 0,
        burnDamage: 0,
        maxSpeed: speed
      });
    }

    // Spawn Boss if Boss wave - made a tiny bit harder but still very exciting!
    if (isBossWave) {
      let bossHp = 220 + waveNum * 60;
      // Scale based on difficulty
      if (difficulty === "easy") {
        bossHp = Math.round(bossHp * 0.85);
      } else if (difficulty === "hard") {
        bossHp = Math.round(bossHp * 1.55);
      } else if (difficulty === "nightmare") {
        bossHp = Math.round(bossHp * 2.15);
      } else {
        bossHp = Math.round(bossHp * 1.15); // Medium buffed too!
      }
      // History Guardian weakens bosses (20% less HP)
      if (selectedHero === "history") {
        bossHp = Math.round(bossHp * 0.8);
      }
      if (waveBuffActive) {
        bossHp = Math.round(bossHp * 1.3); // Buffed x1.3 only!
      }

      newEnemies.push({
        id: `boss-${waveNum}`,
        type: "Boss",
        x: -120 - (totalSpawns * 35),
        y: getWaypoints(selectedMap)[0].y,
        hp: bossHp,
        maxHp: bossHp,
        speed: 0.8 * speedMultiplier,
        reward: Math.max(20, Math.round(150 * diffCoinMult)),
        waypointIndex: 0,
        size: 34,
        color: "#d00000",
        isSlowing: 0,
        burnDuration: 0,
        burnDamage: 0,
        maxSpeed: 0.8 * speedMultiplier
      });
    }

    enemiesRef.current = newEnemies;
  };

  // --- DRAG & DROP TOWER MERGING ---
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 800);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 500);

    const clickedTower = towersRef.current.find(t => Math.hypot(t.x - x, t.y - y) < 35);
    if (clickedTower) {
      draggedTowerRef.current = clickedTower;
      dragStartPosRef.current = { x, y };
      currentDragPosRef.current = { x, y };
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 800);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 500);

    if (draggedTowerRef.current) {
      currentDragPosRef.current = { x, y };
    }

    // Hover snapping
    const studs = getMapStuds(selectedMap);
    let finalX = x;
    let finalY = y;

    if (selectedTowerType && !selectedPlacedTower) {
      let closestStud = null;
      let minDist = Infinity;
      for (const stud of studs) {
        const d = Math.hypot(stud.x - x, stud.y - y);
        if (d < minDist) {
          minDist = d;
          closestStud = stud;
        }
      }
      if (closestStud && minDist < 100) {
        finalX = closestStud.x;
        finalY = closestStud.y;
      }
    }
    hoverCoordsRef.current = { x: finalX, y: finalY };
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 800);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 500);

    if (draggedTowerRef.current && dragStartPosRef.current) {
      const sourceTower = draggedTowerRef.current;
      const distMoved = Math.hypot(x - dragStartPosRef.current.x, y - dragStartPosRef.current.y);

      if (distMoved > 15) {
        // Dragged to a target tower!
        const targetTower = towersRef.current.find(t => t.id !== sourceTower.id && Math.hypot(t.x - x, t.y - y) < 45);

        if (targetTower) {
          const nextType = getNextMergeType(sourceTower.type);
          if (targetTower.type === sourceTower.type && targetTower.level === sourceTower.level && nextType) {
            // MERGE SUCCESS!
            playSound("correct");
            const baseConfig = TOWERS[nextType];
            targetTower.type = nextType;

            let dmg = baseConfig.damage;
            let rng = baseConfig.range;
            let cld = baseConfig.cooldown;

            if (selectedHero === "teacher") dmg = Math.round(dmg * 1.15);
            if (selectedHero === "science") rng = Math.round(rng * 1.15);

            for (let i = 1; i < targetTower.level; i++) {
              dmg = Math.round(dmg * 1.5);
              rng = Math.round(rng * 1.15);
              cld = Math.max(10, Math.round(cld * 0.85));
            }

            targetTower.damage = dmg;
            targetTower.range = rng;
            targetTower.cooldown = cld;
            targetTower.color = baseConfig.color;

            // Remove source tower
            towersRef.current = towersRef.current.filter(t => t.id !== sourceTower.id);

            // Particles & floating text
            for (let i = 0; i < 20; i++) {
              particlesRef.current.push({
                x: targetTower.x,
                y: targetTower.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: baseConfig.bulletColor || "#ffd166",
                life: 35
              });
            }

            floatingTextsRef.current.push({
              x: targetTower.x,
              y: targetTower.y - 35,
              text: `🧬 MERGED: ${baseConfig.name}! ⭐`,
              color: "#06D6A0",
              life: 60
            });

            setSelectedPlacedTower({ ...targetTower });
          } else {
            floatingTextsRef.current.push({
              x: x,
              y: y - 20,
              text: "Must match tower type & tier to drag-merge!",
              color: "#FF3366",
              life: 45
            });
          }
        }
      } else {
        // Simple click -> normal tower placement / selection
        handlePlaceTower(e);
      }

      draggedTowerRef.current = null;
      dragStartPosRef.current = null;
      currentDragPosRef.current = null;
    } else {
      handlePlaceTower(e);
    }
  };

  // --- TOWER MANAGEMENT ---
  const handlePlaceTower = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedTowerType) return;
    playSound("click");

    const rect = canvasRef.current.getBoundingClientRect();
    let x = Math.round(((e.clientX - rect.left) / rect.width) * 800);
    let y = Math.round(((e.clientY - rect.top) / rect.height) * 500);

    // MERGE INTERCEPT
    if (mergeSourceId) {
      const sourceTower = towersRef.current.find(t => t.id === mergeSourceId);
      if (sourceTower) {
        // Did they click an existing tower? (Generous 45px radius)
        const clickedTower = towersRef.current.find(t => Math.hypot(t.x - x, t.y - y) < 45);
        if (clickedTower) {
          if (clickedTower.id === mergeSourceId) {
            // Clicked same tower -> cancel
            floatingTextsRef.current.push({ x: sourceTower.x, y: sourceTower.y - 20, text: "Merge canceled", color: "#64748b", life: 30 });
            setMergeSourceId(null);
            return;
          }
          
          // Verify same type and level and has a next merge type
          const nextType = getNextMergeType(sourceTower.type);
          if (clickedTower.type === sourceTower.type && clickedTower.level === sourceTower.level && nextType) {
            // SUCCESS! Merge the towers
            playSound("correct");
            
            // Advance the type to the next type in the chain
            const baseConfig = TOWERS[nextType];
            sourceTower.type = nextType;
            
            // Calculate upgraded stats for the new tower type based on its level
            let dmg = baseConfig.damage;
            let rng = baseConfig.range;
            let cld = baseConfig.cooldown;
            
            // Hero buffs if applicable
            if (selectedHero === "teacher") {
              dmg = Math.round(dmg * 1.15);
            }
            if (selectedHero === "science") {
              rng = Math.round(rng * 1.15);
            }
            
            // Apply level upgrades
            for (let i = 1; i < sourceTower.level; i++) {
              dmg = Math.round(dmg * 1.5);
              rng = Math.round(rng * 1.15);
              cld = Math.max(10, Math.round(cld * 0.85));
            }
            
            sourceTower.damage = dmg;
            sourceTower.range = rng;
            sourceTower.cooldown = cld;
            sourceTower.color = baseConfig.color;
            
            // Remove the clickedTarget tower
            towersRef.current = towersRef.current.filter(t => t.id !== clickedTower.id);

            // Spawn lovely sparkling particles around merged position!
            for (let i = 0; i < 20; i++) {
              particlesRef.current.push({
                x: sourceTower.x,
                y: sourceTower.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: baseConfig.bulletColor || "#ffd166",
                life: 35
              });
            }

            floatingTextsRef.current.push({
              x: sourceTower.x,
              y: sourceTower.y - 35,
              text: `🧬 EVOLVED: ${baseConfig.name}! ⭐`,
              color: "#ffd166",
              life: 60
            });

            setMergeSourceId(null);
            setSelectedPlacedTower({ ...sourceTower });
            return;
          } else {
            // Clicked different tower - cancel or show error
            floatingTextsRef.current.push({
              x: clickedTower.x,
              y: clickedTower.y - 20,
              text: "Must be same type, tier & evolvable!",
              color: "#f44336",
              life: 50
            });
            setMergeSourceId(null);
            return;
          }
        } else {
          // Clicked empty ground - cancel merge
          floatingTextsRef.current.push({
            x,
            y: y - 20,
            text: "Merge canceled",
            color: "#64748b",
            life: 30
          });
          setMergeSourceId(null);
          return;
        }
      }
    }

    // Grid snap: Find nearest tactical stud coordinate
    const studs = getMapStuds(selectedMap);
    let closestStud = null;
    let minDist = Infinity;
    for (const stud of studs) {
      const d = Math.hypot(stud.x - x, stud.y - y);
      if (d < minDist) {
        minDist = d;
        closestStud = stud;
      }
    }
    // Snap to closest stud if within 100 pixels (very generous, makes clicking super easy!)
    if (closestStud && minDist < 100) {
      x = closestStud.x;
      y = closestStud.y;
    }

    // Check if clicked too close to path
    const pathWaypoints = getWaypoints(selectedMap);
    for (let i = 0; i < pathWaypoints.length - 1; i++) {
      const p1 = pathWaypoints[i];
      const p2 = pathWaypoints[i + 1];

      // Calculate distance from point to line segment
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const t = Math.max(0, Math.min(1, ((x - p1.x) * dx + (y - p1.y) * dy) / (dx * dx + dy * dy)));
      const projectionX = p1.x + t * dx;
      const projectionY = p1.y + t * dy;
      const dist = Math.hypot(x - projectionX, y - projectionY);

      if (dist < 32) {
        floatingTextsRef.current.push({ x, y: y - 20, text: "Cannot build on path!", color: "#f44336", life: 40 });
        return;
      }
    }

    // Check if clicked an active enemy to select and inspect it
    const clickedEnemy = enemiesRef.current.find(enemy => {
      return enemy.x >= 0 && Math.hypot(enemy.x - x, enemy.y - y) < Math.max(30, enemy.size + 15);
    });
    if (clickedEnemy) {
      setSelectedEnemyId(clickedEnemy.id);
      setSelectedPlacedTower(null);
      return;
    }

    // Check if clicked an existing tower to select it (generous 45px radius for easy interaction!)
    const existing = towersRef.current.find(t => Math.hypot(t.x - x, t.y - y) < 45);
    if (existing) {
      setSelectedPlacedTower(existing);
      setSelectedEnemyId(null);
      return;
    }

    // If a tower or enemy was already selected and they clicked empty ground, deselect them first
    if (selectedPlacedTower || selectedEnemyId) {
      setSelectedPlacedTower(null);
      setSelectedEnemyId(null);
      return;
    }

    // Otherwise, build a new tower
    const config = TOWERS[selectedTowerType];
    let actualCost = config.cost;

    // Math Master builds for 15% discount
    if (selectedHero === "math") {
      actualCost = Math.round(actualCost * 0.85);
    }

    if (gold < actualCost) {
      floatingTextsRef.current.push({ x, y: y - 20, text: "Not enough Gold!", color: "#f44336", life: 45 });
      return;
    }

    setGold(prev => prev - actualCost);
    
    // Battle Teacher deals +15% damage globally
    const finalDamage = Math.round(config.damage * (selectedHero === "teacher" ? 1.15 : 1.0));
    // Science Wizard gains +15% range
    const finalRange = Math.round(config.range * (selectedHero === "science" ? 1.15 : 1.0));

    const newTower: Tower = {
      id: `tower-${Date.now()}`,
      x,
      y,
      type: config.type,
      level: 1,
      range: finalRange,
      damage: finalDamage,
      cooldown: config.cooldown,
      color: config.color,
      lastShotFrame: 0,
      targetMode: "First"
    };

    towersRef.current.push(newTower);
    setStats(prev => ({ ...prev, towersBuilt: prev.towersBuilt + 1 }));
    setSelectedPlacedTower(newTower);

    // Create particle ring
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * 1.5,
        vy: Math.sin(angle) * 1.5,
        color: config.color,
        life: 25
      });
    }
  };

  const handleUpgradeTower = () => {
    if (!selectedPlacedTower) return;
    playSound("click");

    const t = selectedPlacedTower;
    if (t.level >= 3) return;

    const baseConfig = TOWERS[t.type];
    const upgradeCost = Math.round(baseConfig.cost * 0.8 * t.level);

    if (gold < upgradeCost) {
      floatingTextsRef.current.push({ x: t.x, y: t.y - 30, text: "Insufficient Gold!", color: "#f44336", life: 40 });
      return;
    }

    setGold(prev => prev - upgradeCost);

    t.level += 1;
    // Boost stats by 50% per level
    t.damage = Math.round(t.damage * 1.5);
    t.range = Math.round(t.range * 1.15);
    t.cooldown = Math.max(10, Math.round(t.cooldown * 0.85));

    floatingTextsRef.current.push({ x: t.x, y: t.y - 30, text: `Upgraded to Tier ${t.level}! 🌟`, color: "#ffd166", life: 55 });
    setSelectedPlacedTower({ ...t }); // force React render refresh
  };

  const handleSellTower = () => {
    if (!selectedPlacedTower) return;
    playSound("click");

    const t = selectedPlacedTower;
    const baseConfig = TOWERS[t.type];
    const sellValue = Math.round((baseConfig.cost * t.level) * 0.5);

    setGold(prev => prev + sellValue);
    towersRef.current = towersRef.current.filter(tower => tower.id !== t.id);

    floatingTextsRef.current.push({ x: t.x, y: t.y - 10, text: `Sold: +$${sellValue}`, color: "#06d6a0", life: 40 });
    setSelectedPlacedTower(null);
  };

  const handleChangeTargetMode = (mode: Tower["targetMode"]) => {
    if (!selectedPlacedTower) return;
    playSound("click");
    selectedPlacedTower.targetMode = mode;
    setSelectedPlacedTower({ ...selectedPlacedTower });
  };

  // --- GAME ANIMATION & PHYSICS ENGINE (CANVAS) ---
  useEffect(() => {
    if (gameState !== "playing" || isPaused || quizOpen) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      // Execute standard frames multiplier for fast forward speeds (1x, 2x, 4x)
      for (let steps = 0; steps < gameSpeed; steps++) {
        frameCountRef.current++;

        // 1. Move and update enemies
        const path = getWaypoints(selectedMap);
        const activeEnemies = enemiesRef.current;

        for (let i = activeEnemies.length - 1; i >= 0; i--) {
          const enemy = activeEnemies[i];

          // Stun and slow duration mechanics
          if (enemy.isStunned && enemy.isStunned > 0) {
            enemy.isStunned--;
            enemy.speed = 0;
          } else if (enemy.isSlowing > 0) {
            enemy.isSlowing--;
            enemy.speed = enemy.maxSpeed * 0.5;
          } else {
            enemy.speed = enemy.maxSpeed;
          }

          // Burn damage mechanics (every 15 frames)
          if (enemy.burnDuration > 0) {
            enemy.burnDuration--;
            if (frameCountRef.current % 15 === 0) {
              enemy.hp -= enemy.burnDamage;
              floatingTextsRef.current.push({
                x: enemy.x,
                y: enemy.y - 12,
                text: `${enemy.burnDamage}`,
                color: "#ff5400",
                life: 20
              });
            }
          }

          // Calculate movement toward next waypoint
          const targetWp = path[enemy.waypointIndex + 1];
          if (!targetWp) {
            // Reached base! Reached the end of the line!
            playSound("baseHit");
            
            // Re-eval penalty based on enemy type
            const damagePenalty = enemy.type === "Boss" ? 5 : 1;
            setLives(prev => {
              const remaining = prev - damagePenalty;
              if (remaining <= 0) {
                // Game Over triggered
                setGameState("gameover");
              }
              return Math.max(0, remaining);
            });

            activeEnemies.splice(i, 1);
            continue;
          }

          const dx = targetWp.x - enemy.x;
          const dy = targetWp.y - enemy.y;
          const distance = Math.hypot(dx, dy);

          if (distance <= enemy.speed) {
            enemy.x = targetWp.x;
            enemy.y = targetWp.y;
            enemy.waypointIndex++;
          } else {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
          }

          // Check if dead
          if (enemy.hp <= 0) {
            playSound("explosion");
            setGold(prev => prev + enemy.reward);
            
            // Track statistics
            setStats(prev => {
              const updated = {
                ...prev,
                enemiesDefeated: prev.enemiesDefeated + 1,
                bossesDefeated: enemy.type === "Boss" ? prev.bossesDefeated + 1 : prev.bossesDefeated,
                totalGoldEarned: prev.totalGoldEarned + enemy.reward,
                highWave: Math.max(prev.highWave, wave)
              };
              localStorage.setItem("junoai_td_stats", JSON.stringify(updated));
              return updated;
            });

            // Create explosion particles
            for (let p = 0; p < 8; p++) {
              particlesRef.current.push({
                x: enemy.x,
                y: enemy.y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                color: enemy.color,
                life: 20
              });
            }

            activeEnemies.splice(i, 1);
          }
        }

        // 2. Tower attacks & shot scheduling
        const towers = towersRef.current;
        for (const t of towers) {
          // Check attack cooldown
          const readyShot = (frameCountRef.current - t.lastShotFrame) >= t.cooldown;
          if (!readyShot) continue;

          // Find enemies in range
          const enemiesInRange = activeEnemies.filter(e => e.x > 0 && Math.hypot(e.x - t.x, e.y - t.y) < t.range);
          if (enemiesInRange.length === 0) continue;

          // Target selection based on targeting mode
          let target: Enemy | null = null;
          if (t.targetMode === "First") {
            // Enemy furthest along path (highest waypoint index, then smallest distance to next waypoint)
            target = enemiesInRange.reduce((prev, curr) => {
              if (curr.waypointIndex > prev.waypointIndex) return curr;
              if (curr.waypointIndex < prev.waypointIndex) return prev;
              const nextWp = path[curr.waypointIndex + 1];
              if (!nextWp) return curr;
              const dCurr = Math.hypot(nextWp.x - curr.x, nextWp.y - curr.y);
              const dPrev = Math.hypot(nextWp.x - prev.x, nextWp.y - prev.y);
              return dCurr < dPrev ? curr : prev;
            }, enemiesInRange[0]);
          } else if (t.targetMode === "Last") {
            target = enemiesInRange.reduce((prev, curr) => {
              if (curr.waypointIndex < prev.waypointIndex) return curr;
              if (curr.waypointIndex > prev.waypointIndex) return prev;
              const nextWp = path[curr.waypointIndex + 1];
              if (!nextWp) return curr;
              const dCurr = Math.hypot(nextWp.x - curr.x, nextWp.y - curr.y);
              const dPrev = Math.hypot(nextWp.x - prev.x, nextWp.y - prev.y);
              return dCurr > dPrev ? curr : prev;
            }, enemiesInRange[0]);
          } else if (t.targetMode === "Strongest") {
            target = enemiesInRange.reduce((prev, curr) => curr.hp > prev.hp ? curr : prev, enemiesInRange[0]);
          } else if (t.targetMode === "Weakest") {
            target = enemiesInRange.reduce((prev, curr) => curr.hp < prev.hp ? curr : prev, enemiesInRange[0]);
          } else if (t.targetMode === "Closest") {
            target = enemiesInRange.reduce((prev, curr) => {
              const dCurr = Math.hypot(curr.x - t.x, curr.y - t.y);
              const dPrev = Math.hypot(prev.x - t.x, prev.y - t.y);
              return dCurr < dPrev ? curr : prev;
            }, enemiesInRange[0]);
          }

          if (target) {
            // Fire projectile
            projectilesRef.current.push({
              id: `projectile-${Date.now()}-${Math.random()}`,
              x: t.x,
              y: t.y,
              targetEnemyId: target.id,
              speed: 6.0,
              damage: t.damage,
              color: TOWERS[t.type].bulletColor,
              type: t.type
            });
            playSound("shoot");
            t.lastShotFrame = frameCountRef.current;
          }
        }

        // 3. Move and update projectiles
        const projectiles = projectilesRef.current;
        for (let i = projectiles.length - 1; i >= 0; i--) {
          const p = projectiles[i];
          const target = activeEnemies.find(e => e.id === p.targetEnemyId);

          if (!target) {
            // Target lost/killed, remove projectile
            projectiles.splice(i, 1);
            continue;
          }

          // Move toward target coordinate
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist <= p.speed) {
            // HIT TARGET!
            projectiles.splice(i, 1);
            
            // Inflict damage
            target.hp -= p.damage;

            // Apply elemental special effects
            if (p.type === "ice") {
              playSound("ice");
              target.isSlowing = 90; // slow for 90 frames (1.5 seconds)
            } else if (p.type === "fire") {
              target.burnDuration = 120; // burn for 2 seconds
              target.burnDamage = Math.max(2, Math.round(p.damage * 0.25));
            } else if (p.type === "cannon") {
              // Splash damage to nearby enemies
              activeEnemies.forEach(other => {
                if (other.id !== target.id && Math.hypot(other.x - target.x, other.y - target.y) < 65) {
                  other.hp -= Math.round(p.damage * 0.5);
                  // Splash mini particle indicators
                  for (let s = 0; s < 3; s++) {
                    particlesRef.current.push({
                      x: other.x,
                      y: other.y,
                      vx: (Math.random() - 0.5) * 2,
                      vy: (Math.random() - 0.5) * 2,
                      color: "#f44336",
                      life: 12
                    });
                  }
                }
              });
            } else if (p.type === "lightning") {
              // Chain lightning to 2 other nearby targets
              const others = activeEnemies
                .filter(other => other.id !== target.id && Math.hypot(other.x - target.x, other.y - target.y) < 100)
                .slice(0, 2);
              
              others.forEach(chainEnemy => {
                chainEnemy.hp -= Math.round(p.damage * 0.6);
                // Draw quick zap line
                ctx.strokeStyle = "#e0aaff";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(target.x, target.y);
                ctx.lineTo(chainEnemy.x, chainEnemy.y);
                ctx.stroke();
              });
            } else if (p.type === "char1") {
              playSound("ice");
              target.isSlowing = 150; // Extra temporal slow!
            } else if (p.type === "char2") {
              playSound("explosion");
              // Gravity pull splash
              activeEnemies.forEach(other => {
                const d = Math.hypot(other.x - target.x, other.y - target.y);
                if (other.id !== target.id && d < 120) {
                  other.hp -= Math.round(p.damage * 0.5);
                  // Pull slightly toward target
                  const angle = Math.atan2(target.y - other.y, target.x - other.x);
                  other.x += Math.cos(angle) * 15;
                  other.y += Math.sin(angle) * 15;
                  // Nebula sparkle particles
                  particlesRef.current.push({
                    x: other.x,
                    y: other.y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    color: "#c084fc",
                    life: 20
                  });
                }
              });
            } else if (p.type === "char3") {
              // Burn target
              target.burnDuration = 180; // 3 seconds
              target.burnDamage = Math.max(10, Math.round(p.damage * 0.3));
              // Splash burn to others
              activeEnemies.forEach(other => {
                const d = Math.hypot(other.x - target.x, other.y - target.y);
                if (other.id !== target.id && d < 90) {
                  other.hp -= Math.round(p.damage * 0.4);
                  other.burnDuration = 120;
                  other.burnDamage = Math.max(5, Math.round(p.damage * 0.2));
                }
              });
            } else if (p.type === "char4") {
              // Quantum splitter chain to up to 5 additional targets
              const others = activeEnemies
                .filter(other => other.id !== target.id && Math.hypot(other.x - target.x, other.y - target.y) < 180)
                .slice(0, 5);
              others.forEach((chainEnemy, chainIdx) => {
                chainEnemy.hp -= p.damage; // full damage!
                // Draw quantum chain lines
                ctx.strokeStyle = "#34d399";
                ctx.lineWidth = 2.0;
                ctx.beginPath();
                ctx.moveTo(target.x, target.y);
                ctx.lineTo(chainEnemy.x, chainEnemy.y);
                ctx.stroke();
              });
            } else if (p.type === "char5") {
              // Aether Lord storm lightning (chains to 4, slows all)
              const others = activeEnemies
                .filter(other => other.id !== target.id && Math.hypot(other.x - target.x, other.y - target.y) < 200)
                .slice(0, 4);
              target.isSlowing = 120;
              others.forEach(chainEnemy => {
                chainEnemy.hp -= Math.round(p.damage * 0.85);
                chainEnemy.isSlowing = 90;
                ctx.strokeStyle = "#f472b6";
                ctx.lineWidth = 3.0;
                ctx.beginPath();
                ctx.moveTo(target.x, target.y);
                ctx.lineTo(chainEnemy.x, chainEnemy.y);
                ctx.stroke();
              });
            } else if (p.type === "char6") {
              // Void Singularity raw armor-piercing damage particle blast
              for (let s = 0; s < 15; s++) {
                particlesRef.current.push({
                  x: target.x,
                  y: target.y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  color: "#a855f7",
                  life: 25
                });
              }
            } else if (p.type === "char7") {
              playSound("ice");
              // Stun target for 1.5 seconds (45 frames)
              target.isStunned = 45;
              // Stun adjacent invaders in 80px radius
              activeEnemies.forEach(other => {
                const d = Math.hypot(other.x - target.x, other.y - target.y);
                if (other.id !== target.id && d < 80) {
                  other.hp -= Math.round(p.damage * 0.5);
                  other.isStunned = 45;
                }
              });
            } else if (p.type === "char8") {
              // Dimension Weaver continuous rift tear
              activeEnemies.forEach(other => {
                const d = Math.hypot(other.x - target.x, other.y - target.y);
                if (d < 100) {
                  other.hp -= Math.round(p.damage * 0.6);
                  other.burnDuration = 180;
                  other.burnDamage = Math.max(25, Math.round(p.damage * 0.25));
                }
              });
            } else if (p.type === "char9") {
              // Disintegration rapid sparks
              for (let s = 0; s < 8; s++) {
                particlesRef.current.push({
                  x: target.x,
                  y: target.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  color: "#ef4444",
                  life: 15
                });
              }
            } else if (p.type === "char10") {
              // Infinity Archon obliterator
              activeEnemies.forEach(other => {
                const d = Math.hypot(other.x - target.x, other.y - target.y);
                if (d < 250) {
                  other.hp -= p.damage; // obliteration!
                  other.isStunned = 60; // 2 seconds absolute lockdown
                  for (let s = 0; s < 5; s++) {
                    particlesRef.current.push({
                      x: other.x,
                      y: other.y,
                      vx: (Math.random() - 0.5) * 4,
                      vy: (Math.random() - 0.5) * 4,
                      color: "#ff007f",
                      life: 20
                    });
                  }
                }
              });
            }

            // Create impact particle sparks
            for (let j = 0; j < 5; j++) {
              particlesRef.current.push({
                x: target.x,
                y: target.y,
                vx: (Math.random() - 0.5) * 2.5,
                vy: (Math.random() - 0.5) * 2.5,
                color: p.color,
                life: 15
              });
            }

            // Damage number floating text in matching theme color
            let ftColor = "#ffffff";
            if (p.type === "ice") ftColor = "#00b4d8";
            else if (p.type === "magic") ftColor = "#e0aaff";
            else if (p.type === "char1") ftColor = "#f59e0b";
            else if (p.type === "char2") ftColor = "#c084fc";
            else if (p.type === "char3") ftColor = "#f97316";
            else if (p.type === "char4") ftColor = "#34d399";
            else if (p.type === "char5") ftColor = "#f472b6";
            else if (p.type === "char6") ftColor = "#a855f7";
            else if (p.type === "char7") ftColor = "#fbbf24";
            else if (p.type === "char8") ftColor = "#22d3ee";
            else if (p.type === "char9") ftColor = "#f87171";
            else if (p.type === "char10") ftColor = "#ffddff";

            floatingTextsRef.current.push({
              x: target.x + (Math.random() - 0.5) * 15,
              y: target.y - 15,
              text: `${p.damage}`,
              color: ftColor,
              life: 25
            });

          } else {
            p.x += (dx / dist) * p.speed;
            p.y += (dy / dist) * p.speed;
          }
        }

        // 4. Update decorative particles
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const pt = particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life--;
          if (pt.life <= 0) {
            particles.splice(i, 1);
          }
        }

        // 5. Update floating texts
        const fTexts = floatingTextsRef.current;
        for (let i = fTexts.length - 1; i >= 0; i--) {
          const ft = fTexts[i];
          ft.y -= 0.5; // FLOAT upwards
          ft.life--;
          if (ft.life <= 0) {
            fTexts.splice(i, 1);
          }
        }
      }

      // --- RENDERING CANVAS VISUALS ---
      const currentMapObj = MAPS.find(m => m.id === selectedMap) || MAPS[0];
      const pathWaypoints = getWaypoints(selectedMap);

      // A. Clear and Draw High-Quality Map Background Textures
      if (selectedMap === "grasslands") {
        // Soft green grass gradient background
        const grd = ctx.createRadialGradient(400, 250, 50, 400, 250, 600);
        grd.addColorStop(0, "#4ade80"); // Vibrant lime-green center
        grd.addColorStop(1, "#22c55e"); // Rich forest grass edges
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 800, 500);

        // Draw soft checkered grid lines
        ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
        ctx.lineWidth = 1;
        for (let x = 40; x < 800; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 500); ctx.stroke();
        }
        for (let y = 40; y < 500; y += 40) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke();
        }

        // Draw beautiful scattered pine trees
        const treePositions = [
          { x: 80, y: 80 }, { x: 260, y: 150 }, { x: 100, y: 350 }, { x: 300, y: 460 },
          { x: 500, y: 110 }, { x: 740, y: 180 }, { x: 620, y: 420 }, { x: 480, y: 340 }
        ];
        treePositions.forEach(p => {
          // Skip if too close to any path waypoints or studs to preserve clickability
          const nearPath = pathWaypoints.some(wp => Math.hypot(wp.x - p.x, wp.y - p.y) < 55);
          if (nearPath) return;

          // Draw trunk
          ctx.fillStyle = "#854d0e";
          ctx.fillRect(p.x - 4, p.y + 4, 8, 12);
          // Draw leaves layers
          ctx.fillStyle = "#166534";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - 18);
          ctx.lineTo(p.x - 14, p.y - 2);
          ctx.lineTo(p.x + 14, p.y - 2);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#15803d";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - 28);
          ctx.lineTo(p.x - 10, p.y - 12);
          ctx.lineTo(p.x + 10, p.y - 12);
          ctx.closePath();
          ctx.fill();
        });

        // Draw lovely colorful flowers
        const flowerPositions = [
          { x: 180, y: 60, col: "#f43f5e" }, { x: 70, y: 220, col: "#eab308" },
          { x: 340, y: 200, col: "#a855f7" }, { x: 580, y: 60, col: "#3b82f6" },
          { x: 720, y: 440, col: "#ec4899" }, { x: 210, y: 420, col: "#3b82f6" }
        ];
        flowerPositions.forEach(f => {
          // Yellow center
          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
          ctx.fill();
          // Petals
          ctx.fillStyle = f.col;
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2.5) {
            ctx.beginPath();
            ctx.arc(f.x + Math.cos(angle) * 5, f.y + Math.sin(angle) * 5, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // 10x Map Visuals: Animated fluttering butterflies
        for (let b = 0; b < 3; b++) {
          const bx = (150 + b * 220 + Math.sin(frameCountRef.current * 0.02 + b) * 50) % 800;
          const by = (80 + b * 130 + Math.cos(frameCountRef.current * 0.03 + b) * 40) % 500;
          ctx.fillStyle = b % 2 === 0 ? "#f43f5e" : "#ec4899";
          ctx.beginPath();
          ctx.ellipse(bx - 3, by, 4, 3, Math.sin(frameCountRef.current * 0.2), 0, Math.PI * 2);
          ctx.ellipse(bx + 3, by, 4, 3, -Math.sin(frameCountRef.current * 0.2), 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#1e293b";
          ctx.beginPath();
          ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (selectedMap === "snowvalley") {
        // Frosted cool white/blue radial gradient
        const grd = ctx.createRadialGradient(400, 250, 100, 400, 250, 600);
        grd.addColorStop(0, "#e2f1f5");
        grd.addColorStop(1, "#9ec1cf");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 800, 500);

        // Falling snowflakes (dynamic using frameCountRef)
        ctx.fillStyle = "#ffffff";
        for (let s = 0; s < 25; s++) {
          const sx = (s * 41 + frameCountRef.current * 0.4) % 800;
          const sy = (s * 29 + frameCountRef.current * 1.2) % 500;
          ctx.beginPath();
          ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // 10x Map Visuals: Soft swirling wind gusts across the snow fields
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 2.5;
        for (let w = 0; w < 2; w++) {
          const wx = (frameCountRef.current * 2.2 + w * 400) % 1100 - 150;
          const wy = 120 + w * 190 + Math.sin(frameCountRef.current * 0.035 + w) * 25;
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          ctx.bezierCurveTo(wx + 60, wy - 15, wx + 110, wy + 15, wx + 170, wy);
          ctx.stroke();
        }

        // Draw snowy rocks / pine trees with snow caps
        const rockPositions = [
          { x: 240, y: 40 }, { x: 60, y: 150 }, { x: 750, y: 320 },
          { x: 350, y: 300 }, { x: 550, y: 440 }, { x: 120, y: 460 }
        ];
        rockPositions.forEach(p => {
          const nearPath = pathWaypoints.some(wp => Math.hypot(wp.x - p.x, wp.y - p.y) < 55);
          if (nearPath) return;

          // Draw icy rock mound
          ctx.fillStyle = "#cbd5e1";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
          ctx.fill();
          // Snow pile cap on top of the rock
          ctx.fillStyle = "#f8fafc";
          ctx.beginPath();
          ctx.arc(p.x, p.y - 4, 11, Math.PI, 0);
          ctx.fill();
        });

        // Draw a tiny snowman decoration
        const snowmanPos = { x: 680, y: 210 };
        const nearPath = pathWaypoints.some(wp => Math.hypot(wp.x - snowmanPos.x, wp.y - snowmanPos.y) < 55);
        if (!nearPath) {
          // Bottom snowball
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(snowmanPos.x, snowmanPos.y + 10, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          // Head
          ctx.beginPath(); ctx.arc(snowmanPos.x, snowmanPos.y - 4, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          // Carrot nose
          ctx.fillStyle = "#f97316";
          ctx.beginPath();
          ctx.moveTo(snowmanPos.x, snowmanPos.y - 4);
          ctx.lineTo(snowmanPos.x + 8, snowmanPos.y - 2);
          ctx.lineTo(snowmanPos.x, snowmanPos.y);
          ctx.fill();
          // Tiny black top hat
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(snowmanPos.x - 10, snowmanPos.y - 12, 20, 3);
          ctx.fillRect(snowmanPos.x - 6, snowmanPos.y - 22, 12, 10);
        }

      } else if (selectedMap === "desert") {
        // Dune ripple sand gradients
        const grd = ctx.createLinearGradient(0, 0, 800, 500);
        grd.addColorStop(0, "#fbcfe8"); // Pinkish warm highlight
        grd.addColorStop(0.4, "#fed7aa"); // Golden orange sand
        grd.addColorStop(1, "#f97316"); // Deep orange shadows
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 800, 500);

        // Dune sand ripple lines
        ctx.strokeStyle = "rgba(194, 65, 12, 0.15)";
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.arc(400, -100 + i * 140, 350, 0, Math.PI);
          ctx.stroke();
        }

        // 10x Map Visuals: Animated rolling tumbleweed
        const tumbleweedX = (frameCountRef.current * 1.6) % 1100 - 150;
        const tumbleweedY = 320 + Math.abs(Math.sin(frameCountRef.current * 0.05)) * -30;
        ctx.save();
        ctx.translate(tumbleweedX, tumbleweedY);
        ctx.rotate(frameCountRef.current * 0.045);
        ctx.strokeStyle = "#a16207";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 7, Math.PI / 4, 0, Math.PI * 2);
        ctx.ellipse(0, 0, 12, 7, -Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Draw beautiful saguaro cacti
        const cactiPositions = [
          { x: 220, y: 220 }, { x: 80, y: 80 }, { x: 180, y: 440 },
          { x: 420, y: 350 }, { x: 740, y: 380 }, { x: 580, y: 220 }
        ];
        cactiPositions.forEach(p => {
          const nearPath = pathWaypoints.some(wp => Math.hypot(wp.x - p.x, wp.y - p.y) < 55);
          if (nearPath) return;

          ctx.strokeStyle = "#15803d";
          ctx.fillStyle = "#166534";
          ctx.lineWidth = 7;
          ctx.lineCap = "round";

          // Main stem
          ctx.beginPath();
          ctx.moveTo(p.x, p.y + 15);
          ctx.lineTo(p.x, p.y - 20);
          ctx.stroke();

          // Left branch
          ctx.beginPath();
          ctx.moveTo(p.x, p.y + 2);
          ctx.lineTo(p.x - 10, p.y + 2);
          ctx.lineTo(p.x - 10, p.y - 12);
          ctx.stroke();

          // Right branch
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - 5);
          ctx.lineTo(p.x + 10, p.y - 5);
          ctx.lineTo(p.x + 10, p.y - 20);
          ctx.stroke();
        });

      } else if (selectedMap === "volcano") {
        // Deep obsidian basalt background
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, 800, 500);

        // Dark tile lines
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1.5;
        for (let x = 80; x < 800; x += 80) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 500); ctx.stroke();
        }
        for (let y = 80; y < 500; y += 80) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke();
        }

        // Glowing red tectonic fault cracks
        ctx.strokeStyle = "#ef4444";
        ctx.shadowColor = "#f97316";
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.5;

        const cracks = [
          { x1: 50, y1: 50, x2: 120, y2: 150 },
          { x1: 120, y1: 150, x2: 60, y2: 240 },
          { x1: 720, y1: 400, x2: 650, y2: 300 },
          { x1: 650, y1: 300, x2: 740, y2: 180 }
        ];
        cracks.forEach(c => {
          ctx.beginPath();
          ctx.moveTo(c.x1, c.y1);
          ctx.lineTo(c.x2, c.y2);
          ctx.stroke();
        });
        ctx.shadowBlur = 0; // reset shadow

        // 10x Map Visuals: Animated magma rising spark embers
        ctx.fillStyle = "#ea580c";
        for (let e = 0; e < 15; e++) {
          const ex = (e * 53) % 800;
          const ey = (500 - (e * 33 + frameCountRef.current * 1.5) % 500);
          ctx.beginPath();
          ctx.arc(ex, ey, 1.5 + (e % 2.5), 0, Math.PI * 2);
          ctx.fill();
        }

        // Bubbling orange volcanic lava pools
        const lavaPools = [
          { x: 340, y: 180, r: 24 }, { x: 620, y: 120, r: 18 }, { x: 140, y: 380, r: 30 }
        ];
        lavaPools.forEach(pool => {
          const nearPath = pathWaypoints.some(wp => Math.hypot(wp.x - pool.x, wp.y - pool.y) < 55);
          if (nearPath) return;

          // Liquid glow
          const radial = ctx.createRadialGradient(pool.x, pool.y, 2, pool.x, pool.y, pool.r);
          radial.addColorStop(0, "#facc15"); // bright core
          radial.addColorStop(0.7, "#ea580c"); // lava main
          radial.addColorStop(1, "#0f172a"); // basalt boundary

          ctx.fillStyle = radial;
          ctx.beginPath();
          ctx.arc(pool.x, pool.y, pool.r, 0, Math.PI * 2);
          ctx.fill();
        });

      } else if (selectedMap === "endless") {
        // Deep space cosmic void gradient
        const grd = ctx.createRadialGradient(400, 250, 50, 400, 250, 600);
        grd.addColorStop(0, "#090d16");
        grd.addColorStop(0.6, "#030712");
        grd.addColorStop(1, "#000000");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 800, 500);

        // Drawing a gorgeous glowing deep space pink/blue nebula in the center
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const nebulaGrd = ctx.createRadialGradient(380, 220, 20, 380, 220, 250);
        nebulaGrd.addColorStop(0, "rgba(236, 72, 153, 0.15)"); // Pink aura
        nebulaGrd.addColorStop(0.5, "rgba(99, 102, 241, 0.08)"); // Indigo veil
        nebulaGrd.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = nebulaGrd;
        ctx.beginPath();
        ctx.arc(380, 220, 250, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Twinkling background stars (deterministic positions using frameCountRef)
        for (let s = 0; s < 40; s++) {
          const starX = (s * 87) % 800;
          const starY = (s * 137) % 500;
          const brightness = 0.3 + 0.7 * Math.abs(Math.sin((frameCountRef.current + s * 10) * 0.04));
          
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
          ctx.beginPath();
          ctx.arc(starX, starY, (s % 3 === 0) ? 2 : 1, 0, Math.PI * 2);
          ctx.fill();
        }

        // 10x Map Visuals: Animated shooting stars streaking occasionally
        if (frameCountRef.current % 150 < 25) {
          const progress = frameCountRef.current % 150;
          const sx = 100 + progress * 10;
          const sy = 40 + progress * 5;
          ctx.save();
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress / 25})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - 40, sy - 20);
          ctx.stroke();
          ctx.restore();
        }

        // Draw tiny orbit planets
        const planetPos = { x: 620, y: 80 };
        ctx.fillStyle = "#818cf8"; // Blueish ring planet
        ctx.beginPath(); ctx.arc(planetPos.x, planetPos.y, 10, 0, Math.PI * 2); ctx.fill();
        // Ring
        ctx.strokeStyle = "#c084fc";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(planetPos.x, planetPos.y, 20, 4, -Math.PI / 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // B. Draw Winding Path Ribbon with Double Outlines and Cobblestone Accents
      // 1. Draw Thicker Path Base/Shadow
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 36;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(pathWaypoints[0].x, pathWaypoints[0].y + 4); // offset downwards for 3D depth
      for (let i = 1; i < pathWaypoints.length; i++) {
        ctx.lineTo(pathWaypoints[i].x, pathWaypoints[i].y + 4);
      }
      ctx.stroke();

      // 2. Draw Road Border Outline
      let pathBorderColor = "#1e293b"; // Charcoal default
      if (selectedMap === "grasslands") pathBorderColor = "#854d0e"; // Muddy dirt bank
      else if (selectedMap === "snowvalley") pathBorderColor = "#457b9d"; // Cool slate blue
      else if (selectedMap === "desert") pathBorderColor = "#9a3412"; // Burnt orange clay
      else if (selectedMap === "volcano") pathBorderColor = "#0f172a"; // Volcanic ash slate
      else if (selectedMap === "endless") pathBorderColor = "#4f46e5"; // Indigo glowing lane

      ctx.strokeStyle = pathBorderColor;
      ctx.lineWidth = 32;
      ctx.beginPath();
      ctx.moveTo(pathWaypoints[0].x, pathWaypoints[0].y);
      for (let i = 1; i < pathWaypoints.length; i++) {
        ctx.lineTo(pathWaypoints[i].x, pathWaypoints[i].y);
      }
      ctx.stroke();

      // 3. Draw Main Inner Path Ribbon
      ctx.strokeStyle = currentMapObj.pathColor;
      ctx.lineWidth = 24;
      ctx.beginPath();
      ctx.moveTo(pathWaypoints[0].x, pathWaypoints[0].y);
      for (let i = 1; i < pathWaypoints.length; i++) {
        ctx.lineTo(pathWaypoints[i].x, pathWaypoints[i].y);
      }
      ctx.stroke();

      // 4. Draw Cute Lane Dots / Cobblestones along the center of the road
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      if (selectedMap === "volcano" || selectedMap === "endless") {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      }
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 12]); // beautiful center dashes
      ctx.beginPath();
      ctx.moveTo(pathWaypoints[0].x, pathWaypoints[0].y);
      for (let i = 1; i < pathWaypoints.length; i++) {
        ctx.lineTo(pathWaypoints[i].x, pathWaypoints[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash config

      // B1. Draw Start Spawn Portal and End Crystal/Nexus Goals
      // Draw Start Spawn Portal
      const startWp = pathWaypoints[0];
      ctx.save();
      // Glowing aura
      const portalGlow = ctx.createRadialGradient(startWp.x, startWp.y, 4, startWp.x, startWp.y, 22);
      portalGlow.addColorStop(0, "#10b981"); // bright neon green
      portalGlow.addColorStop(0.6, "rgba(16, 185, 129, 0.4)");
      portalGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = portalGlow;
      ctx.beginPath();
      ctx.arc(startWp.x, startWp.y, 24, 0, Math.PI * 2);
      ctx.fill();

      // Swirling portal rings (rotates slowly with frameCountRef)
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(startWp.x, startWp.y, 14 + Math.sin(frameCountRef.current * 0.1) * 2, 0, Math.PI * 2);
      ctx.stroke();

      // "S" text or core icon inside the spawn
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("SPAWN", startWp.x, startWp.y);
      ctx.restore();

      // Draw End Castle/Nexus Goal
      const endWp = pathWaypoints[pathWaypoints.length - 1];
      ctx.save();
      // Shield Aura
      const endGlow = ctx.createRadialGradient(endWp.x, endWp.y, 4, endWp.x, endWp.y, 28);
      endGlow.addColorStop(0, "#ef4444"); // bright ruby red
      endGlow.addColorStop(0.6, "rgba(239, 68, 68, 0.35)");
      endGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = endGlow;
      ctx.beginPath();
      ctx.arc(endWp.x, endWp.y, 30, 0, Math.PI * 2);
      ctx.fill();

      // Stone Pedestal Base
      ctx.fillStyle = "#475569";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.fillRect(endWp.x - 14, endWp.y + 6, 28, 10);
      ctx.strokeRect(endWp.x - 14, endWp.y + 6, 28, 10);

      // Heart / Ruby Crystal
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.moveTo(endWp.x, endWp.y - 14);
      ctx.lineTo(endWp.x + 10, endWp.y - 4);
      ctx.lineTo(endWp.x, endWp.y + 6);
      ctx.lineTo(endWp.x - 10, endWp.y - 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Shiny core reflection
      ctx.fillStyle = "#fca5a5";
      ctx.beginPath();
      ctx.moveTo(endWp.x, endWp.y - 10);
      ctx.lineTo(endWp.x + 4, endWp.y - 4);
      ctx.lineTo(endWp.x, endWp.y + 2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // B2. Draw Tower Placement Studs (Tactical building slots)
      const studs = getMapStuds(selectedMap);
      studs.forEach(stud => {
        // Check if there is already a tower on this stud
        const isOccupied = towersRef.current.some(t => Math.hypot(t.x - stud.x, t.y - stud.y) < 20);

        
        ctx.save();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        
        // If hovered and placing a tower, draw a glowing hover state
        const hover = hoverCoordsRef.current;
        const isHovered = hover && Math.hypot(hover.x - stud.x, hover.y - stud.y) < 15;
        
        if (isOccupied) {
          // Draw occupied base slab
          ctx.fillStyle = "#cbd5e1";
          ctx.beginPath();
          ctx.arc(stud.x, stud.y, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          // Draw unoccupied themed tactical slot (10x Better Visuals)
          ctx.save();
          
          if (selectedMap === "grasslands") {
            // Mossy Forest Ruins Stud
            const stoneGrad = ctx.createRadialGradient(stud.x, stud.y, 2, stud.x, stud.y, 17);
            stoneGrad.addColorStop(0, isHovered ? "#86efac" : "#d1fae5");
            stoneGrad.addColorStop(0.7, isHovered ? "#15803d" : "#1e3a1e");
            stoneGrad.addColorStop(1, "#052e16");
            ctx.fillStyle = stoneGrad;
            ctx.strokeStyle = isHovered ? "#22c55e" : "#4d7c0f";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(stud.x, stud.y, 17, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Leafy details around the ring
            ctx.strokeStyle = "rgba(163, 230, 53, 0.4)";
            ctx.lineWidth = 1.5;
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
              const lx = stud.x + Math.cos(angle) * 12;
              const ly = stud.y + Math.sin(angle) * 12;
              ctx.beginPath();
              ctx.arc(lx, ly, 2, 0, Math.PI * 2);
              ctx.stroke();
            }
          } else if (selectedMap === "snowvalley") {
            // Ancient Frost Rune Socket
            const iceGrad = ctx.createRadialGradient(stud.x, stud.y, 2, stud.x, stud.y, 17);
            iceGrad.addColorStop(0, isHovered ? "#e0f2fe" : "#f0f9ff");
            iceGrad.addColorStop(0.6, isHovered ? "#38bdf8" : "#0284c7");
            iceGrad.addColorStop(1, "#0f172a");
            ctx.fillStyle = iceGrad;
            ctx.strokeStyle = isHovered ? "#06b6d4" : "#0284c7";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(stud.x, stud.y, 17, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Runic cross hair spikes
            ctx.strokeStyle = "rgba(224, 242, 254, 0.6)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(stud.x - 13, stud.y); ctx.lineTo(stud.x - 8, stud.y);
            ctx.moveTo(stud.x + 8, stud.y); ctx.lineTo(stud.x + 13, stud.y);
            ctx.moveTo(stud.x, stud.y - 13); ctx.lineTo(stud.x, stud.y - 8);
            ctx.moveTo(stud.x, stud.y + 8); ctx.lineTo(stud.x, stud.y + 13);
            ctx.stroke();
          } else if (selectedMap === "desert") {
            // Sunburst Sandstone Tablet
            const sandGrad = ctx.createRadialGradient(stud.x, stud.y, 2, stud.x, stud.y, 17);
            sandGrad.addColorStop(0, isHovered ? "#fef08a" : "#ffedd5");
            sandGrad.addColorStop(0.7, isHovered ? "#ea580c" : "#b45309");
            sandGrad.addColorStop(1, "#451a03");
            ctx.fillStyle = sandGrad;
            ctx.strokeStyle = isHovered ? "#f97316" : "#7c2d12";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(stud.x, stud.y, 17, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Sand rays
            ctx.strokeStyle = "rgba(251, 146, 60, 0.5)";
            ctx.lineWidth = 1.5;
            for (let r = 0; r < 4; r++) {
              const angle = (frameCountRef.current * 0.02) + (r * Math.PI / 2);
              const rx1 = stud.x + Math.cos(angle) * 7;
              const ry1 = stud.y + Math.sin(angle) * 7;
              const rx2 = stud.x + Math.cos(angle) * 14;
              const ry2 = stud.y + Math.sin(angle) * 14;
              ctx.beginPath();
              ctx.moveTo(rx1, ry1);
              ctx.lineTo(rx2, ry2);
              ctx.stroke();
            }
          } else if (selectedMap === "volcano") {
            // Burning Obsidian Lava Port
            const lavaGrad = ctx.createRadialGradient(stud.x, stud.y, 1, stud.x, stud.y, 17);
            lavaGrad.addColorStop(0, isHovered ? "#fde047" : "#ef4444");
            lavaGrad.addColorStop(0.6, isHovered ? "#ea580c" : "#7f1d1d");
            lavaGrad.addColorStop(1, "#000000");
            ctx.fillStyle = lavaGrad;
            ctx.strokeStyle = isHovered ? "#f97316" : "#ef4444";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(stud.x, stud.y, 17, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Animated bubbling hot spark
            const bubbleSize = 2 + Math.abs(Math.sin(frameCountRef.current * 0.06)) * 4;
            ctx.fillStyle = "rgba(254, 240, 138, 0.75)";
            ctx.beginPath();
            ctx.arc(stud.x + Math.cos(frameCountRef.current * 0.08) * 4, stud.y + Math.sin(frameCountRef.current * 0.1) * 4, bubbleSize, 0, Math.PI * 2);
            ctx.fill();
          } else if (selectedMap === "endless") {
            // Cyber Runic Teleport Matrix
            const cyberGrad = ctx.createRadialGradient(stud.x, stud.y, 2, stud.x, stud.y, 17);
            cyberGrad.addColorStop(0, isHovered ? "#f5f3ff" : "#ddd6fe");
            cyberGrad.addColorStop(0.6, isHovered ? "#8b5cf6" : "#6d28d9");
            cyberGrad.addColorStop(1, "#1e1b4b");
            ctx.fillStyle = cyberGrad;
            ctx.strokeStyle = isHovered ? "#a78bfa" : "#8b5cf6";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(stud.x, stud.y, 17, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Segmented orbiting rings
            ctx.strokeStyle = isHovered ? "#c084fc" : "rgba(139, 92, 246, 0.65)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.arc(stud.x, stud.y, 13, frameCountRef.current * 0.04, frameCountRef.current * 0.04 + Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Outer dashed range/accent ring
          ctx.strokeStyle = isHovered ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0.25)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(stud.x, stud.y, 23, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Glowing crosshair core plus sign
          ctx.strokeStyle = isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.6)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(stud.x - 5, stud.y);
          ctx.lineTo(stud.x + 5, stud.y);
          ctx.moveTo(stud.x, stud.y - 5);
          ctx.lineTo(stud.x, stud.y + 5);
          ctx.stroke();

          ctx.restore();
        }
        ctx.restore();
      });

      // C. Draw Tower Ranges if placing or selected
      if (selectedPlacedTower) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(selectedPlacedTower.x, selectedPlacedTower.y, selectedPlacedTower.range, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw dynamic target indicator pointer on range ring
        ctx.strokeStyle = "#ffd166";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(selectedPlacedTower.x, selectedPlacedTower.y, 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Hover Range & Ghost Tower Preview
      const hoverCoords = hoverCoordsRef.current;
      if (hoverCoords && selectedTowerType && !selectedPlacedTower) {
        const config = TOWERS[selectedTowerType];
        if (config) {
          // Check path collision for color
          let isTooClose = false;
          const pathWaypoints = getWaypoints(selectedMap);
          for (let i = 0; i < pathWaypoints.length - 1; i++) {
            const p1 = pathWaypoints[i];
            const p2 = pathWaypoints[i + 1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const t = Math.max(0, Math.min(1, ((hoverCoords.x - p1.x) * dx + (hoverCoords.y - p1.y) * dy) / (dx * dx + dy * dy)));
            const projX = p1.x + t * dx;
            const projY = p1.y + t * dy;
            const dist = Math.hypot(hoverCoords.x - projX, hoverCoords.y - projY);
            if (dist < 32) {
              isTooClose = true;
              break;
            }
          }

          // Check tower overlap collision
          const overlappingTower = towersRef.current.find(t => Math.hypot(t.x - hoverCoords.x, t.y - hoverCoords.y) < 35);
          if (overlappingTower) {
            isTooClose = true;
          }

          const previewRange = Math.round(config.range * (selectedHero === "science" ? 1.15 : 1.0));

          // Draw range circle
          ctx.strokeStyle = isTooClose ? "rgba(244, 67, 54, 0.4)" : "rgba(6, 214, 160, 0.4)";
          ctx.fillStyle = isTooClose ? "rgba(244, 67, 54, 0.08)" : "rgba(6, 214, 160, 0.08)";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]); // dashed ring
          ctx.beginPath();
          ctx.arc(hoverCoords.x, hoverCoords.y, previewRange, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.setLineDash([]); // reset line dash

          // Draw a semi-transparent themed tower ghost preview (10x Better Visuals)
          ctx.save();
          ctx.globalAlpha = 0.5;

          // 1. Shadow/Base Slabs
          ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
          ctx.beginPath();
          ctx.ellipse(hoverCoords.x, hoverCoords.y + 12, 22, 10, 0, 0, Math.PI * 2);
          ctx.fill();

          // 2. Base Podium
          ctx.fillStyle = isTooClose ? "#fca5a5" : "#64748b";
          ctx.strokeStyle = isTooClose ? "#ef4444" : "#0f172a";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(hoverCoords.x - 16, hoverCoords.y + 12);
          ctx.lineTo(hoverCoords.x - 14, hoverCoords.y - 2);
          ctx.lineTo(hoverCoords.x + 14, hoverCoords.y - 2);
          ctx.lineTo(hoverCoords.x + 16, hoverCoords.y + 12);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 3. Spire head preview
          ctx.fillStyle = isTooClose ? "#ef4444" : config.color;
          ctx.beginPath();
          ctx.arc(hoverCoords.x, hoverCoords.y - 18, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.restore();
        }
      }

      // D. Draw Placed Towers (10x Better Visuals & Styling)
      towersRef.current.forEach(tower => {
        ctx.save();
        
        // 1. Shadow/Base Slabs
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(tower.x, tower.y + 12, 22, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Stone foundation podium with textured brick lines
        ctx.fillStyle = "#475569";
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(tower.x - 16, tower.y + 12);
        ctx.lineTo(tower.x - 14, tower.y - 2);
        ctx.lineTo(tower.x + 14, tower.y - 2);
        ctx.lineTo(tower.x + 16, tower.y + 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Decorative stone line slits
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tower.x - 5, tower.y - 2);
        ctx.lineTo(tower.x - 5, tower.y + 12);
        ctx.moveTo(tower.x + 5, tower.y - 2);
        ctx.lineTo(tower.x + 5, tower.y + 12);
        ctx.stroke();

        // 3. Custom Themed Elements per Tower Type
        if (tower.type === "archer") {
          // FOREST ARCHER WATCHTOWER
          ctx.fillStyle = "#854d0e"; // wooden trunk body
          ctx.strokeStyle = "#3f2305";
          ctx.lineWidth = 2;
          ctx.fillRect(tower.x - 6, tower.y - 22, 12, 20);
          ctx.strokeRect(tower.x - 6, tower.y - 22, 12, 20);

          // Green wooden foliage/thatched canopy roof
          ctx.fillStyle = "#15803d";
          ctx.beginPath();
          ctx.moveTo(tower.x, tower.y - 38);
          ctx.lineTo(tower.x - 15, tower.y - 22);
          ctx.lineTo(tower.x + 15, tower.y - 22);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Cute waving flag
          ctx.fillStyle = "#22c55e";
          ctx.beginPath();
          ctx.moveTo(tower.x, tower.y - 38);
          ctx.lineTo(tower.x + 12, tower.y - 42);
          ctx.lineTo(tower.x, tower.y - 46);
          ctx.closePath();
          ctx.fill();
          
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(tower.x, tower.y - 38);
          ctx.lineTo(tower.x, tower.y - 48);
          ctx.stroke();

        } else if (tower.type === "cannon") {
          // REINFORCED ARMORED BLAST FORTRESS
          ctx.fillStyle = "#1e293b"; // heavy steel iron plates
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2.5;
          ctx.fillRect(tower.x - 12, tower.y - 18, 24, 16);
          ctx.strokeRect(tower.x - 12, tower.y - 18, 24, 16);

          // Iron rivets on plates
          ctx.fillStyle = "#94a3b8";
          ctx.beginPath();
          ctx.arc(tower.x - 9, tower.y - 14, 2, 0, Math.PI * 2);
          ctx.arc(tower.x + 9, tower.y - 14, 2, 0, Math.PI * 2);
          ctx.arc(tower.x - 9, tower.y - 6, 2, 0, Math.PI * 2);
          ctx.arc(tower.x + 9, tower.y - 6, 2, 0, Math.PI * 2);
          ctx.fill();

          // Heavy iron cannon turret cap
          ctx.fillStyle = "#334155";
          ctx.beginPath();
          ctx.arc(tower.x, tower.y - 18, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Rotating barrel that points towards nearest enemy (calculated live)
          let angle = -Math.PI / 2; // default points straight up
          const enemies = enemiesRef.current;
          let closestEnemy = null;
          let minD = Infinity;
          enemies.forEach(e => {
            const d = Math.hypot(e.x - tower.x, e.y - tower.y);
            if (d < minD && d < tower.range) {
              minD = d;
              closestEnemy = e;
            }
          });
          if (closestEnemy) {
            angle = Math.atan2(closestEnemy.y - (tower.y - 18), closestEnemy.x - tower.x);
          }

          // Draw the heavy dark metal barrel
          ctx.save();
          ctx.translate(tower.x, tower.y - 18);
          ctx.rotate(angle);
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(0, -4, 16, 8);
          ctx.strokeRect(0, -4, 16, 8);
          // Red glowing thermal tip
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(13, -3, 3, 6);
          ctx.restore();

        } else if (tower.type === "ice") {
          // CRYOGENIC FROST PYRAMID
          ctx.fillStyle = "#0284c7"; // frozen solid glacial blocks
          ctx.strokeStyle = "#0c4a6e";
          ctx.lineWidth = 2.5;
          ctx.fillRect(tower.x - 10, tower.y - 20, 20, 18);
          ctx.strokeRect(tower.x - 10, tower.y - 20, 20, 18);

          // Glacier spires pointing upwards
          ctx.fillStyle = "#e0f2fe";
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(tower.x - 10, tower.y - 20);
          ctx.lineTo(tower.x - 14, tower.y - 36);
          ctx.lineTo(tower.x - 3, tower.y - 20);
          ctx.moveTo(tower.x + 3, tower.y - 20);
          ctx.lineTo(tower.x + 14, tower.y - 36);
          ctx.lineTo(tower.x + 10, tower.y - 20);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Pulsing central blue crystal
          ctx.save();
          const pulse = 1 + 0.15 * Math.sin(frameCountRef.current * 0.1);
          ctx.translate(tower.x, tower.y - 26);
          ctx.scale(pulse, pulse);
          
          const cryoGrd = ctx.createRadialGradient(0, 0, 1, 0, 0, 7);
          cryoGrd.addColorStop(0, "#ffffff");
          cryoGrd.addColorStop(0.6, "#38bdf8");
          cryoGrd.addColorStop(1, "#0284c7");
          ctx.fillStyle = cryoGrd;
          ctx.beginPath();
          ctx.moveTo(0, -8);
          ctx.lineTo(6, 0);
          ctx.lineTo(0, 8);
          ctx.lineTo(-6, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();

        } else if (tower.type === "fire") {
          // VOLCANIC LAVA BRAZIER
          ctx.fillStyle = "#1e1b4b"; // dark deep obsidian blocks
          ctx.strokeStyle = "#f97316";
          ctx.lineWidth = 2.5;
          ctx.fillRect(tower.x - 12, tower.y - 18, 24, 16);
          ctx.strokeRect(tower.x - 12, tower.y - 18, 24, 16);

          // Flaming magma furnace circle on top
          ctx.fillStyle = "#450a0a";
          ctx.strokeStyle = "#ea580c";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(tower.x, tower.y - 18, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Animated Fire Sparks flickering on top of the furnace
          const fireSeed = (frameCountRef.current % 45);
          ctx.fillStyle = "#facc15"; // yellow sparks
          ctx.beginPath();
          ctx.arc(tower.x - 4 + Math.sin(fireSeed * 0.4) * 3, tower.y - 22 - (fireSeed % 12), 2 + Math.random() * 2, 0, Math.PI * 2);
          ctx.arc(tower.x + 4 + Math.cos(fireSeed * 0.3) * 3, tower.y - 25 - ((fireSeed + 15) % 12), 1 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();

          // Glowing heart-core
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(tower.x, tower.y - 18, 5, 0, Math.PI * 2);
          ctx.fill();

        } else if (tower.type === "lightning") {
          // TESLA RESONATOR COIL
          ctx.fillStyle = "#3b0764"; // purple copper magnetic plating
          ctx.strokeStyle = "#a21caf";
          ctx.lineWidth = 2.5;
          ctx.fillRect(tower.x - 8, tower.y - 20, 16, 18);
          ctx.strokeRect(tower.x - 8, tower.y - 20, 16, 18);

          // Copper capacitor rings stacked
          ctx.fillStyle = "#d97706"; // bronze color
          ctx.strokeStyle = "#451a03";
          ctx.lineWidth = 1.5;
          ctx.fillRect(tower.x - 12, tower.y - 14, 24, 4);
          ctx.strokeRect(tower.x - 12, tower.y - 14, 24, 4);
          ctx.fillRect(tower.x - 10, tower.y - 22, 20, 4);
          ctx.strokeRect(tower.x - 10, tower.y - 22, 20, 4);

          // Metallic magnetic gold orb at the summit
          ctx.fillStyle = "#fcd34d";
          ctx.strokeStyle = "#b45309";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(tower.x, tower.y - 27, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Electrical crackle sparks around the core
          if (frameCountRef.current % 12 < 5) {
            ctx.strokeStyle = "#e0aaff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(tower.x - 8, tower.y - 27);
            ctx.lineTo(tower.x - 15 - Math.random() * 6, tower.y - 25 - Math.random() * 6);
            ctx.moveTo(tower.x + 8, tower.y - 27);
            ctx.lineTo(tower.x + 15 + Math.random() * 6, tower.y - 30 - Math.random() * 6);
            ctx.stroke();
          }

        } else if (tower.type === "magic") {
          // floating violet runic crystal hovering above a golden spire base
          ctx.fillStyle = "#312e81"; // mystical twilight spire body
          ctx.strokeStyle = "#6366f1";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(tower.x - 8, tower.y + 12);
          ctx.lineTo(tower.x - 4, tower.y - 16);
          ctx.lineTo(tower.x + 4, tower.y - 16);
          ctx.lineTo(tower.x + 8, tower.y + 12);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Hovering spinning arcane crystal
          ctx.save();
          const floatOffset = Math.sin(frameCountRef.current * 0.08) * 4;
          const rotateAngle = frameCountRef.current * 0.03;
          ctx.translate(tower.x, tower.y - 28 + floatOffset);
          ctx.rotate(rotateAngle);

          // Glowing purple crystal
          const magicGrd = ctx.createLinearGradient(-6, -11, 6, 11);
          magicGrd.addColorStop(0, "#e0aaff");
          magicGrd.addColorStop(0.5, "#9b5de5");
          magicGrd.addColorStop(1, "#3c096c");
          ctx.fillStyle = magicGrd;
          ctx.strokeStyle = "#d8b4fe";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -11);
          ctx.lineTo(6, 0);
          ctx.lineTo(0, 11);
          ctx.lineTo(-6, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // Arcane ring particles circulating
          ctx.strokeStyle = "rgba(168, 85, 247, 0.45)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(tower.x, tower.y - 28 + floatOffset, 16, 5, -Math.PI/12, 0, Math.PI * 2);
          ctx.stroke();
        } else if (tower.type === "char1") {
          // Chronos Sentinel ⏳
          ctx.fillStyle = "#1e293b";
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 2.5;
          ctx.fillRect(tower.x - 10, tower.y - 18, 20, 16);
          ctx.strokeRect(tower.x - 10, tower.y - 18, 20, 16);
          
          // Draw clock face on top
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(tower.x, tower.y - 25, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Spinning hands
          const angle = (frameCountRef.current * 0.05) % (Math.PI * 2);
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(tower.x, tower.y - 25);
          ctx.lineTo(tower.x + Math.cos(angle) * 6, tower.y - 25 + Math.sin(angle) * 6);
          ctx.stroke();

        } else if (tower.type === "char2") {
          // Nebula Warden 🌌
          ctx.fillStyle = "#3c096c";
          ctx.strokeStyle = "#c084fc";
          ctx.lineWidth = 2.5;
          ctx.fillRect(tower.x - 10, tower.y - 18, 20, 16);
          ctx.strokeRect(tower.x - 10, tower.y - 18, 20, 16);

          // Draw a swirling galaxy core
          const offset = Math.sin(frameCountRef.current * 0.08) * 3;
          ctx.save();
          ctx.translate(tower.x, tower.y - 25 + offset);
          ctx.rotate(frameCountRef.current * 0.04);
          
          ctx.fillStyle = "#8b5cf6";
          ctx.beginPath();
          ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Outer stars
          ctx.fillStyle = "#c084fc";
          ctx.beginPath();
          ctx.arc(8, 0, 2, 0, Math.PI * 2);
          ctx.arc(-8, 0, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else if (tower.type === "char3") {
          // Solar Deity ☀️
          ctx.fillStyle = "#7c2d12";
          ctx.strokeStyle = "#ea580c";
          ctx.lineWidth = 2.5;
          ctx.fillRect(tower.x - 12, tower.y - 18, 24, 16);
          ctx.strokeRect(tower.x - 12, tower.y - 18, 24, 16);

          // Glowing sun
          ctx.fillStyle = "#f59e0b";
          ctx.strokeStyle = "#f97316";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(tower.x, tower.y - 25, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Draw solar rays
          ctx.strokeStyle = "#f97316";
          ctx.lineWidth = 1.5;
          for (let i = 0; i < 8; i++) {
            const rayAngle = (i * Math.PI / 4) + (frameCountRef.current * 0.02);
            ctx.beginPath();
            ctx.moveTo(tower.x + Math.cos(rayAngle) * 9, tower.y - 25 + Math.sin(rayAngle) * 9);
            ctx.lineTo(tower.x + Math.cos(rayAngle) * 14, tower.y - 25 + Math.sin(rayAngle) * 14);
            ctx.stroke();
          }

        } else if (tower.type === "char4") {
          // Quantum Sage ⚛️
          ctx.fillStyle = "#064e3b";
          ctx.strokeStyle = "#10b981";
          ctx.lineWidth = 2.5;
          ctx.fillRect(tower.x - 10, tower.y - 18, 20, 16);
          ctx.strokeRect(tower.x - 10, tower.y - 18, 20, 16);

          // Atomic rings
          ctx.save();
          ctx.translate(tower.x, tower.y - 25);
          ctx.strokeStyle = "#34d399";
          ctx.lineWidth = 1.5;

          // Ring 1
          ctx.beginPath();
          ctx.ellipse(0, 0, 10, 3, Math.PI / 4 + frameCountRef.current * 0.05, 0, Math.PI * 2);
          ctx.stroke();

          // Ring 2
          ctx.beginPath();
          ctx.ellipse(0, 0, 10, 3, -Math.PI / 4 - frameCountRef.current * 0.05, 0, Math.PI * 2);
          ctx.stroke();

          // Central core
          ctx.fillStyle = "#10b981";
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else if (tower.type === "char5") {
          // Aether Lord 🔱
          ctx.fillStyle = "#831843";
          ctx.strokeStyle = "#ec4899";
          ctx.lineWidth = 2.5;
          ctx.fillRect(tower.x - 12, tower.y - 18, 24, 16);
          ctx.strokeRect(tower.x - 12, tower.y - 18, 24, 16);

          // Glowing high trident
          const floatOffset = Math.sin(frameCountRef.current * 0.07) * 4;
          ctx.strokeStyle = "#f472b6";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(tower.x, tower.y - 18 + floatOffset);
          ctx.lineTo(tower.x, tower.y - 36 + floatOffset);
          ctx.stroke();

          // Trident prongs
          ctx.beginPath();
          ctx.moveTo(tower.x - 6, tower.y - 32 + floatOffset);
          ctx.lineTo(tower.x - 6, tower.y - 38 + floatOffset);
          ctx.moveTo(tower.x + 6, tower.y - 32 + floatOffset);
          ctx.lineTo(tower.x + 6, tower.y - 38 + floatOffset);
          ctx.stroke();

        } else if (tower.type === "char6") {
          // Void Singularity 🌀
          ctx.fillStyle = "#030712";
          ctx.strokeStyle = "#6b21a8";
          ctx.lineWidth = 2.5;
          ctx.fillRect(tower.x - 10, tower.y - 18, 20, 16);
          ctx.strokeRect(tower.x - 10, tower.y - 18, 20, 16);

          // Central deep black hole
          const pulse = 1 + 0.12 * Math.sin(frameCountRef.current * 0.1);
          ctx.save();
          ctx.translate(tower.x, tower.y - 25);
          ctx.scale(pulse, pulse);
          
          ctx.fillStyle = "#000000";
          ctx.strokeStyle = "#a855f7";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

        } else if (tower.type === "char7") {
          // Eon Sovereign 👑
          ctx.fillStyle = "#78350f";
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 2.5;
          ctx.fillRect(tower.x - 12, tower.y - 18, 24, 16);
          ctx.strokeRect(tower.x - 12, tower.y - 18, 24, 16);

          // Gold crown
          ctx.fillStyle = "#fbbf24";
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(tower.x - 10, tower.y - 18);
          ctx.lineTo(tower.x - 10, tower.y - 30);
          ctx.lineTo(tower.x - 5, tower.y - 24);
          ctx.lineTo(tower.x, tower.y - 34);
          ctx.lineTo(tower.x + 5, tower.y - 24);
          ctx.lineTo(tower.x + 10, tower.y - 30);
          ctx.lineTo(tower.x + 10, tower.y - 18);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

        } else if (tower.type === "char8") {
          // Dimension Weaver 🪐
          ctx.fillStyle = "#164e63";
          ctx.strokeStyle = "#06b6d4";
          ctx.lineWidth = 2.5;
          ctx.fillRect(tower.x - 10, tower.y - 18, 20, 16);
          ctx.strokeRect(tower.x - 10, tower.y - 18, 20, 16);

          // Revolving ring gyroscope
          ctx.save();
          ctx.translate(tower.x, tower.y - 25);
          ctx.rotate(frameCountRef.current * 0.05);
          ctx.strokeStyle = "#22d3ee";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.fillStyle = "#06b6d4";
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else if (tower.type === "char9") {
          // Omniscient Eye 👁️
          ctx.fillStyle = "#7f1d1d";
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 2.5;
          ctx.fillRect(tower.x - 10, tower.y - 18, 20, 16);
          ctx.strokeRect(tower.x - 10, tower.y - 18, 20, 16);

          // Levitating eye
          const floatOffset = Math.sin(frameCountRef.current * 0.09) * 3;
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#f87171";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(tower.x, tower.y - 26 + floatOffset, 10, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Pupil looking around
          const eyeLook = Math.sin(frameCountRef.current * 0.03) * 3;
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(tower.x + eyeLook, tower.y - 26 + floatOffset, 3.5, 0, Math.PI * 2);
          ctx.fill();

        } else if (tower.type === "char10") {
          // Infinity Archon ♾️
          ctx.fillStyle = "#500724";
          ctx.strokeStyle = "#ff007f";
          ctx.lineWidth = 3;
          ctx.fillRect(tower.x - 14, tower.y - 18, 28, 18);
          ctx.strokeRect(tower.x - 14, tower.y - 18, 28, 18);

          // Ultimate levitating pulsing Infinity symbol
          ctx.save();
          const floatOffset = Math.sin(frameCountRef.current * 0.12) * 5;
          ctx.translate(tower.x, tower.y - 28 + floatOffset);
          
          // Set beautiful neon glow
          ctx.shadowColor = "#ff007f";
          ctx.shadowBlur = 8;
          ctx.strokeStyle = "#ffddff";
          ctx.lineWidth = 2.5;
          
          // Draw infinity loops
          ctx.beginPath();
          for (let i = -Math.PI; i <= Math.PI; i += 0.1) {
            // Lemniscate of Bernoulli equation
            const scale = 14 / (3 - Math.cos(2 * i));
            const x = scale * Math.cos(i);
            const y = scale * Math.sin(2 * i) / 2;
            if (i === -Math.PI) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }

        // 4. Draw upgraded stars
        ctx.fillStyle = "#ffd166";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        for (let s = 0; s < tower.level; s++) {
          const starX = tower.x - 10 + (s * 10);
          const starY = tower.y + 18;
          ctx.beginPath();
          ctx.arc(starX, starY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // 🧬 Visual Merge system overlays:
        if (mergeSourceId) {
          const sourceTower = towersRef.current.find(t => t.id === mergeSourceId);
          if (sourceTower) {
            if (tower.id === mergeSourceId) {
              // Pulse active selection ring
              ctx.strokeStyle = "#3b82f6";
              ctx.lineWidth = 2.5;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.arc(tower.x, tower.y, 25, 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);
              
              // Draw "🧬 SOURCE" badge above tower
              ctx.fillStyle = "#3b82f6";
              ctx.strokeStyle = "#000000";
              ctx.lineWidth = 1.5;
              ctx.fillRect(tower.x - 28, tower.y - 48, 56, 13);
              ctx.strokeRect(tower.x - 28, tower.y - 48, 56, 13);
              
              ctx.fillStyle = "#ffffff";
              ctx.font = "bold 8px monospace";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("🧬 SOURCE", tower.x, tower.y - 415 / 10);
            } else if (tower.type === sourceTower.type && tower.level === sourceTower.level && getNextMergeType(sourceTower.type) !== null) {
              // Eligible merge target! Pulse golden highlight
              const pulse = Math.sin(Date.now() / 150) * 0.4 + 1.2; // pulsing scale
              ctx.strokeStyle = "#fbbf24";
              ctx.lineWidth = 1.5 + pulse;
              ctx.beginPath();
              ctx.arc(tower.x, tower.y, 24 + pulse * 2, 0, Math.PI * 2);
              ctx.stroke();

              // Draw "🧬 MERGE" badge above tower
              ctx.fillStyle = "#fbbf24";
              ctx.strokeStyle = "#000000";
              ctx.lineWidth = 1.5;
              ctx.fillRect(tower.x - 28, tower.y - 48, 56, 13);
              ctx.strokeRect(tower.x - 28, tower.y - 48, 56, 13);
              
              ctx.fillStyle = "#000000";
              ctx.font = "bold 8px monospace";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("🧬 MERGE!", tower.x, tower.y - 415 / 10);
            }
          }
        }
        
        ctx.restore();
      });

      // E. Draw Enemies crawling along the path (10x Better Graphic Models)
      enemiesRef.current.forEach((enemy, idx) => {
        ctx.save();

        // Bobbing & wiggling walker effect
        const bobSeed = frameCountRef.current * 0.14 + idx;
        const bobY = Math.sin(bobSeed) * 2.5;
        const wiggleX = Math.cos(bobSeed) * 1.5;
        const drawX = enemy.x + wiggleX;
        const drawY = enemy.y + bobY;

        // Draw selection highlight ring if selected
        if (selectedEnemyId === enemy.id) {
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(drawX, drawY, enemy.size + 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Glowing crosshair ticks
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(drawX - 1.5, drawY - enemy.size - 15, 3, 5);
          ctx.fillRect(drawX - 1.5, drawY + enemy.size + 10, 3, 5);
          ctx.fillRect(drawX - enemy.size - 15, drawY - 1.5, 5, 3);
          ctx.fillRect(drawX + enemy.size + 10, drawY - 1.5, 5, 3);
        }

        // Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        ctx.beginPath();
        ctx.ellipse(drawX, drawY + enemy.size - 2, enemy.size * 1.1, enemy.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 10x Mob Visuals: Special themed dynamic trails trailing behind enemies!
        const trailSeed = frameCountRef.current + idx * 7;
        if (enemy.type === "Flying Dragon") {
          // Flame Exhaust Particles
          ctx.fillStyle = trailSeed % 2 === 0 ? "#f97316" : "#ef4444";
          ctx.beginPath();
          ctx.arc(drawX - 16, drawY + 4 + Math.sin(trailSeed * 0.1) * 3, 3 + (trailSeed % 3), 0, Math.PI * 2);
          ctx.arc(drawX - 24, drawY + Math.cos(trailSeed * 0.1) * 3, 2 + (trailSeed % 2), 0, Math.PI * 2);
          ctx.fill();
        } else if (enemy.type === "Wolf") {
          // Running Dust Particles
          ctx.fillStyle = "rgba(180, 150, 120, 0.45)";
          ctx.beginPath();
          ctx.arc(drawX - 10 - (trailSeed % 8), drawY + enemy.size - 2, 2 + (trailSeed % 4), 0, Math.PI * 2);
          ctx.fill();
        } else if (enemy.type === "Skeleton") {
          // Spooky bone dust sparkles
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.beginPath();
          ctx.arc(drawX - 5 + Math.sin(trailSeed * 0.1) * 12, drawY - 8 - (trailSeed % 8), 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (enemy.type === "Goblin") {
          // Drops little shining gold specks from coin bags
          if (trailSeed % 5 === 0) {
            ctx.fillStyle = "#eab308";
            ctx.beginPath();
            ctx.arc(drawX - 12, drawY + 8, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (enemy.type === "Boss") {
          // Ominous swirling shadow tendril or flame vortex
          ctx.fillStyle = "rgba(147, 51, 234, 0.6)";
          ctx.beginPath();
          ctx.arc(drawX - 25, drawY - 10 + Math.sin(trailSeed * 0.1) * 8, 4, 0, Math.PI * 2);
          ctx.arc(drawX - 20, drawY + 15 + Math.cos(trailSeed * 0.1) * 8, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Render themed model
        if (enemy.type === "Boss") {
          // PRESENTATION ANXIETY LORD / OVERLORD DEMON ZOMBIE KING
          // Dark magical aura/barrier behind the boss
          ctx.strokeStyle = "rgba(168, 85, 247, 0.5)";
          ctx.lineWidth = 4;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.arc(drawX, drawY, enemy.size + 10 + Math.sin(frameCountRef.current * 0.1) * 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Main crimson red outer head skin
          ctx.fillStyle = "#991b1b";
          ctx.strokeStyle = "#1e293b";
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(drawX, drawY, enemy.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Heavy iron jaw plates
          ctx.fillStyle = "#334155";
          ctx.fillRect(drawX - 12, drawY + 6, 24, 10);
          ctx.strokeRect(drawX - 12, drawY + 6, 24, 10);

          // Giant black demonic curving horns
          ctx.fillStyle = "#0f172a";
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2.5;
          // Left horn
          ctx.beginPath();
          ctx.moveTo(drawX - 14, drawY - 14);
          ctx.bezierCurveTo(drawX - 28, drawY - 32, drawX - 18, drawY - 48, drawX - 28, drawY - 54);
          ctx.bezierCurveTo(drawX - 10, drawY - 40, drawX - 12, drawY - 24, drawX - 4, drawY - 18);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Right horn
          ctx.beginPath();
          ctx.moveTo(drawX + 14, drawY - 14);
          ctx.bezierCurveTo(drawX + 28, drawY - 32, drawX + 18, drawY - 48, drawX + 28, drawY - 54);
          ctx.bezierCurveTo(drawX + 10, drawY - 40, drawX + 12, drawY - 24, drawX + 4, drawY - 18);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Spiked golden crown
          ctx.fillStyle = "#eab308";
          ctx.strokeStyle = "#854d0e";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(drawX - 15, drawY - 15);
          ctx.lineTo(drawX - 12, drawY - 32);
          ctx.lineTo(drawX - 5, drawY - 22);
          ctx.lineTo(drawX, drawY - 38);
          ctx.lineTo(drawX + 5, drawY - 22);
          ctx.lineTo(drawX + 12, drawY - 32);
          ctx.lineTo(drawX + 15, drawY - 15);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Glowing neon yellow slit eyes
          ctx.fillStyle = "#fde047";
          ctx.beginPath();
          ctx.moveTo(drawX - 10, drawY - 4);
          ctx.lineTo(drawX - 2, drawY - 6);
          ctx.lineTo(drawX - 4, drawY - 1);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(drawX + 10, drawY - 4);
          ctx.lineTo(drawX + 2, drawY - 6);
          ctx.lineTo(drawX + 4, drawY - 1);
          ctx.closePath();
          ctx.fill();

          // Mean snarl mouth line
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(drawX - 8, drawY + 8);
          ctx.lineTo(drawX + 8, drawY + 8);
          ctx.stroke();

        } else if (enemy.type === "Goblin") {
          // GREEN GOBLIN
          ctx.fillStyle = "#22c55e"; // bright green
          ctx.strokeStyle = "#14532d";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(drawX, drawY, enemy.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Long pointed ears
          ctx.fillStyle = "#16a34a";
          // Left ear
          ctx.beginPath();
          ctx.moveTo(drawX - 10, drawY - 4);
          ctx.lineTo(drawX - 24, drawY - 10);
          ctx.lineTo(drawX - 12, drawY + 6);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Right ear
          ctx.beginPath();
          ctx.moveTo(drawX + 10, drawY - 4);
          ctx.lineTo(drawX + 24, drawY - 10);
          ctx.lineTo(drawX + 12, drawY + 6);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Beady yellow eyes
          ctx.fillStyle = "#eab308";
          ctx.beginPath();
          ctx.arc(drawX - 4, drawY - 3, 3, 0, Math.PI * 2);
          ctx.arc(drawX + 4, drawY - 3, 3, 0, Math.PI * 2);
          ctx.fill();

          // Tiny sharp teeth smile
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(drawX - 5, drawY + 4);
          ctx.lineTo(drawX + 5, drawY + 4);
          ctx.stroke();

        } else if (enemy.type === "Wolf") {
          // BOUNDING FURRY WOLF
          ctx.fillStyle = "#64748b"; // dark slate grey fur
          ctx.strokeStyle = "#1e293b";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(drawX, drawY, enemy.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Pointy grey wolf ears
          ctx.fillStyle = "#475569";
          ctx.beginPath();
          ctx.moveTo(drawX - 8, drawY - 6);
          ctx.lineTo(drawX - 10, drawY - 18);
          ctx.lineTo(drawX - 2, drawY - 10);
          ctx.moveTo(drawX + 8, drawY - 6);
          ctx.lineTo(drawX + 10, drawY - 18);
          ctx.lineTo(drawX + 2, drawY - 10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Glaring feral orange eyes
          ctx.fillStyle = "#ea580c";
          ctx.beginPath();
          ctx.arc(drawX - 4, drawY - 2, 2.5, 0, Math.PI * 2);
          ctx.arc(drawX + 4, drawY - 2, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // White fangs showing
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.moveTo(drawX - 4, drawY + 3);
          ctx.lineTo(drawX - 2, drawY + 7);
          ctx.lineTo(drawX, drawY + 3);
          ctx.lineTo(drawX + 2, drawY + 7);
          ctx.lineTo(drawX + 4, drawY + 3);
          ctx.stroke();

        } else if (enemy.type === "Skeleton") {
          // BONY SKELETON
          ctx.fillStyle = "#f8fafc"; // bone white
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(drawX, drawY, enemy.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Dark eye sockets with glowing red pupils
          ctx.fillStyle = "#0f172a";
          ctx.beginPath();
          ctx.arc(drawX - 4, drawY - 3, 4, 0, Math.PI * 2);
          ctx.arc(drawX + 4, drawY - 3, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(drawX - 4, drawY - 3, 1.5, 0, Math.PI * 2);
          ctx.arc(drawX + 4, drawY - 3, 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Exposed ribcage-like mouth grids
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(drawX - 5, drawY + 5);
          ctx.lineTo(drawX + 5, drawY + 5);
          ctx.moveTo(drawX - 3, drawY + 3);
          ctx.lineTo(drawX - 3, drawY + 7);
          ctx.moveTo(drawX, drawY + 3);
          ctx.lineTo(drawX, drawY + 7);
          ctx.moveTo(drawX + 3, drawY + 3);
          ctx.lineTo(drawX + 3, drawY + 7);
          ctx.stroke();

        } else if (enemy.type === "Orc") {
          // HEAVY MUSCULAR ORC
          ctx.fillStyle = "#15803d"; // dark deep olive green skin
          ctx.strokeStyle = "#052e16";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(drawX, drawY, enemy.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Orc bone horns / metal forehead band
          ctx.fillStyle = "#94a3b8";
          ctx.fillRect(drawX - 10, drawY - 11, 20, 4);

          // Giant white tusks pointing upwards from lower jaw
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(drawX - 8, drawY + 5);
          ctx.lineTo(drawX - 10, drawY - 2);
          ctx.lineTo(drawX - 4, drawY + 5);
          ctx.moveTo(drawX + 8, drawY + 5);
          ctx.lineTo(drawX + 10, drawY - 2);
          ctx.lineTo(drawX + 4, drawY + 5);
          ctx.fill();
          ctx.stroke();

          // Bloodthirsty red slit eyes
          ctx.fillStyle = "#b91c1c";
          ctx.beginPath();
          ctx.arc(drawX - 5, drawY - 3, 3, 0, Math.PI * 2);
          ctx.arc(drawX + 5, drawY - 3, 3, 0, Math.PI * 2);
          ctx.fill();

        } else if (enemy.type === "Knight") {
          // REINFORCED GREY STEEL KNIGHT
          ctx.fillStyle = "#94a3b8"; // steel plating
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(drawX, drawY, enemy.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Knight T-shaped helmet slit
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(drawX - 9, drawY - 5, 18, 4);
          ctx.fillRect(drawX - 2, drawY - 5, 4, 11);

          // Golden crown wings / crest on helmet
          ctx.fillStyle = "#ca8a04";
          ctx.beginPath();
          ctx.moveTo(drawX - 8, drawY - 13);
          ctx.lineTo(drawX, drawY - 22);
          ctx.lineTo(drawX + 8, drawY - 13);
          ctx.closePath();
          ctx.fill();

          // Red visor glow
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(drawX - 4, drawY - 3, 1.5, 0, Math.PI * 2);
          ctx.arc(drawX + 4, drawY - 3, 1.5, 0, Math.PI * 2);
          ctx.fill();

        } else if (enemy.type === "Giant") {
          // WOODEN CLUB CARRYING BEHEMOTH GIANT
          ctx.fillStyle = "#b45309"; // tan leather brown skin
          ctx.strokeStyle = "#451a03";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(drawX, drawY, enemy.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Heavy ginger hairy beard & hair
          ctx.fillStyle = "#d97706";
          // Hair top
          ctx.beginPath();
          ctx.arc(drawX, drawY - 12, 12, Math.PI, 0);
          ctx.fill();
          // Beard bottom
          ctx.beginPath();
          ctx.arc(drawX, drawY + 8, 14, 0, Math.PI);
          ctx.fill();

          // Bushy eyebrows
          ctx.fillStyle = "#78350f";
          ctx.fillRect(drawX - 9, drawY - 8, 7, 3);
          ctx.fillRect(drawX + 2, drawY - 8, 7, 3);

          // Tired small eyes
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(drawX - 5, drawY - 3, 2, 0, Math.PI * 2);
          ctx.arc(drawX + 5, drawY - 3, 2, 0, Math.PI * 2);
          ctx.fill();

        } else if (enemy.type === "Flying Dragon") {
          // MAJESTIC DRAGON WITH FLAPPING WINGS
          ctx.fillStyle = "#701a75"; // violet scales
          ctx.strokeStyle = "#4a044e";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(drawX, drawY, enemy.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Two large flapping bat wings
          const wingFlap = Math.sin(frameCountRef.current * 0.16) * 16;
          ctx.fillStyle = "#4a044e";
          ctx.strokeStyle = "#701a75";
          ctx.lineWidth = 1.5;
          // Left wing
          ctx.beginPath();
          ctx.moveTo(drawX - 10, drawY);
          ctx.bezierCurveTo(drawX - 28, drawY - 12 + wingFlap, drawX - 32, drawY + 12 + wingFlap, drawX - 14, drawY + 4);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Right wing
          ctx.beginPath();
          ctx.moveTo(drawX + 10, drawY);
          ctx.bezierCurveTo(drawX + 28, drawY - 12 + wingFlap, drawX + 32, drawY + 12 + wingFlap, drawX + 14, drawY + 4);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Reptilian yellow slit eyes
          ctx.fillStyle = "#eab308";
          ctx.beginPath();
          ctx.arc(drawX - 4, drawY - 3, 3, 0, Math.PI * 2);
          ctx.arc(drawX + 4, drawY - 3, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#000000";
          ctx.fillRect(drawX - 5, drawY - 5, 2, 4);
          ctx.fillRect(drawX + 3, drawY - 5, 2, 4);
        }

        // Stunning stars or halos overhead
        if (enemy.isStunned && enemy.isStunned > 0) {
          ctx.strokeStyle = "#eab308";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(drawX, drawY, enemy.size + 6, 0, Math.PI * 2);
          ctx.stroke();

          // Sparkly stars circling
          const stunAngle = (frameCountRef.current * 0.15) % (Math.PI * 2);
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(drawX + Math.cos(stunAngle) * (enemy.size + 6), drawY + Math.sin(stunAngle) * (enemy.size + 6), 3, 0, Math.PI * 2);
          ctx.arc(drawX + Math.cos(stunAngle + Math.PI) * (enemy.size + 6), drawY + Math.sin(stunAngle + Math.PI) * (enemy.size + 6), 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Slowing ice crystals overhead
        if (enemy.isSlowing > 0) {
          ctx.strokeStyle = "#00b4d8";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(drawX, drawY, enemy.size + 4, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = "#e0f2fe";
          ctx.fillRect(drawX - 4, drawY - enemy.size - 14, 8, 4);
        }

        // Burning flame particles
        if (enemy.burnDuration > 0) {
          ctx.fillStyle = "#f97316";
          ctx.beginPath();
          ctx.arc(drawX + (Math.random() - 0.5) * 16, drawY - 8, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(drawX + (Math.random() - 0.5) * 12, drawY - 12, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Health Bar container
        const barWidth = enemy.size * 2;
        const barHeight = 5;
        const barX = drawX - enemy.size;
        const barY = drawY - enemy.size - 10;

        ctx.fillStyle = "#b91c1c";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Green current health bar
        const ratio = Math.max(0, enemy.hp / enemy.maxHp);
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(barX, barY, barWidth * ratio, barHeight);

        // Black outline for health bar
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        ctx.restore();
      });

      // F. Draw Projectiles (10x Better Visuals & Trails)
      projectilesRef.current.forEach(proj => {
        ctx.save();

        // Simple projectile angle calculation based on speed
        ctx.fillStyle = proj.color;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;

        if (proj.type === "archer") {
          // DRAW REAL POINTED WOODEN ARROW
          ctx.strokeStyle = "#78350f";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(proj.x - 6, proj.y);
          ctx.lineTo(proj.x + 6, proj.y);
          ctx.stroke();
          // Arrow tip
          ctx.fillStyle = "#94a3b8";
          ctx.beginPath();
          ctx.moveTo(proj.x + 6, proj.y - 3);
          ctx.lineTo(proj.x + 11, proj.y);
          ctx.lineTo(proj.x + 6, proj.y + 3);
          ctx.closePath();
          ctx.fill();
          // Feather fletching
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(proj.x - 8, proj.y - 2, 3, 4);

        } else if (proj.type === "cannon") {
          // HEAVY IRON CANNONBALL WITH EMBERS
          const grad = ctx.createRadialGradient(proj.x, proj.y, 2, proj.x, proj.y, 10);
          grad.addColorStop(0, "#475569");
          grad.addColorStop(0.7, "#1e293b");
          grad.addColorStop(1, "#000000");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Spark fuse
          ctx.strokeStyle = "#f97316";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(proj.x - 8, proj.y - 8);
          ctx.lineTo(proj.x - 13, proj.y - 12);
          ctx.stroke();
          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.arc(proj.x - 13, proj.y - 12, 2.5, 0, Math.PI * 2);
          ctx.fill();

        } else if (proj.type === "ice") {
          // ICY SPINNING SNOWFLAKE DIAMOND
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.rotate(frameCountRef.current * 0.1);
          ctx.fillStyle = "#e0f2fe";
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -7);
          ctx.lineTo(5, -2);
          ctx.lineTo(2, 0);
          ctx.lineTo(5, 2);
          ctx.lineTo(0, 7);
          ctx.lineTo(-5, 2);
          ctx.lineTo(-2, 0);
          ctx.lineTo(-5, -2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();

        } else if (proj.type === "fire") {
          // SWIRLING GLOWING FIREBALL
          const fireGrad = ctx.createRadialGradient(proj.x, proj.y, 1, proj.x, proj.y, 7);
          fireGrad.addColorStop(0, "#fef08a");
          fireGrad.addColorStop(0.5, "#f97316");
          fireGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
          ctx.fillStyle = fireGrad;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
          ctx.fill();

          // Tail embers
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(proj.x - 6, proj.y + 2, 3, 0, Math.PI * 2);
          ctx.arc(proj.x - 10, proj.y - 1, 2, 0, Math.PI * 2);
          ctx.fill();

        } else if (proj.type.startsWith("char")) {
          // GORGEOUS COSMIC GLOWING BULLETS
          const size = proj.type === "char10" ? 12 : proj.type === "char6" ? 9 : 6.5;
          const orbGrad = ctx.createRadialGradient(proj.x, proj.y, 1, proj.x, proj.y, size);
          orbGrad.addColorStop(0, "#ffffff");
          orbGrad.addColorStop(0.5, proj.color);
          orbGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = orbGrad;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, size + 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // ARCANE RUNIC ORB (for lightning / magic)
          const orbGrad = ctx.createRadialGradient(proj.x, proj.y, 1, proj.x, proj.y, 6);
          orbGrad.addColorStop(0, "#ffffff");
          orbGrad.addColorStop(0.6, "#c084fc");
          orbGrad.addColorStop(1, "#581c87");
          ctx.fillStyle = orbGrad;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      });

      // G. Draw Particles
      particlesRef.current.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(1, pt.life / 5), 0, Math.PI * 2);
        ctx.fill();
      });

      // H. Draw Dragging Line & Merge Indicator
      if (draggedTowerRef.current && currentDragPosRef.current) {
        const dt = draggedTowerRef.current;
        const cp = currentDragPosRef.current;

        ctx.strokeStyle = "#BFF83E";
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(dt.x, dt.y);
        ctx.lineTo(cp.x, cp.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "rgba(191, 248, 62, 0.3)";
        ctx.strokeStyle = "#BFF83E";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const hoverTarget = towersRef.current.find(t => t.id !== dt.id && Math.hypot(t.x - cp.x, t.y - cp.y) < 45);
        if (hoverTarget) {
          const nextType = getNextMergeType(dt.type);
          const canMerge = hoverTarget.type === dt.type && hoverTarget.level === dt.level && nextType;

          ctx.strokeStyle = canMerge ? "#06D6A0" : "#FF3366";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(hoverTarget.x, hoverTarget.y, 28, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = canMerge ? "#06D6A0" : "#FF3366";
          ctx.font = "bold 12px monospace";
          ctx.fillText(canMerge ? "RELEASE TO MERGE!" : "CANNOT MERGE", cp.x - 45, cp.y - 30);
        }
      }

      // I. Draw Floating texts
      floatingTextsRef.current.forEach(ft => {
        ctx.fillStyle = ft.color;
        ctx.font = "bold 13px Courier New, monospace";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
      });

      // Restart Loop if conditions match
      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameState, isPaused, quizOpen, selectedMap, gameSpeed, selectedHero, wave]);

  const togglePause = () => {
    playSound("click");
    setIsPaused(!isPaused);
  };

  const cycleSpeed = () => {
    playSound("click");
    if (gameSpeed === 1) setGameSpeed(2);
    else if (gameSpeed === 2) setGameSpeed(4);
    else setGameSpeed(1);
  };

  // --- RENDERING VIEWS ---
  return (
    <div className="w-full flex flex-col bg-[#F3EFE0] border-4 border-black rounded-3xl overflow-hidden font-sans text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative select-none">
      
      {/* HEADER BAR */}
      <div className="bg-[#1D1D1D] text-[#FFFDF9] border-b-4 border-black p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚔️</span>
          <div>
            <h1 className="text-lg font-black uppercase tracking-wider text-white">Knowledge Defenders</h1>
            <p className="text-[10px] text-[#A8DADC] font-bold uppercase tracking-wider">Tower Defense</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="p-1.5 hover:bg-white/10 rounded-lg text-white"
            title="Toggle Sounds"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>
          <button 
            onClick={onClose}
            className="p-1 px-3 bg-red-500 hover:bg-red-600 border-2 border-black rounded-lg text-white text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 transition-all"
          >
            <X className="w-3.5 h-3.5" /> Back to Script
          </button>
        </div>
      </div>

      {/* MAIN CONTENT PORT */}
      <div className="relative min-h-[500px] flex flex-col">
        
        {/* VIEW 1: MAIN MENU */}
        {gameState === "menu" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-gradient-to-br from-[#E3D5CA] to-[#D5C3B3]">
            <div className="space-y-1">
              <div className="inline-block bg-[#EF476F] border-2 border-black p-1 px-3 rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Present<span className="text-[#BFF83E]">AI</span> Integration
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 leading-none">
                Tower Defense 🏰
              </h2>
              <p className="text-xs md:text-sm font-bold text-slate-700 max-w-md mx-auto leading-relaxed">
                An active recall educational defense game. Answer concept cards between waves to overcharge your towers! Wrong answers spawn buffed enemies!
              </p>
            </div>

            {/* SELECTIONS CARD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full text-left bg-[#FFFDF9] border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {/* Maps Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                  Select Battleground Map:
                </label>
                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {MAPS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMap(m.id)}
                      className={`p-2.5 text-xs font-black border-2 border-black rounded-xl text-left flex justify-between items-center transition-all ${
                        selectedMap === m.id 
                          ? "bg-[#FFD166] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-1px]" 
                          : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <span>{m.name}</span>
                      <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: m.color }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Hero Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                  Appoint Your Hero:
                </label>
                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {HEROES.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHero(h.id)}
                      className={`p-2.5 text-xs font-black border-2 border-black rounded-xl text-left transition-all ${
                        selectedHero === h.id 
                          ? "bg-[#9B5DE5] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-1px]" 
                          : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{h.name}</span>
                        {selectedHero === h.id && <Star className="w-3.5 h-3.5 fill-amber-300 stroke-amber-800" />}
                      </div>
                      <p className={`text-[10px] mt-0.5 font-semibold ${selectedHero === h.id ? "text-purple-100" : "text-gray-500"}`}>
                        {h.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* BUTTONS ROW */}
            <div className="flex flex-wrap justify-center gap-3 w-full max-w-md">
              <button
                onClick={() => {
                  playSound("click");
                  setGameState("difficulty");
                }}
                className="flex-1 min-w-[140px] py-3.5 bg-[#06D6A0] text-black font-black text-sm uppercase rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-1.5"
              >
                Choose Gamemode <ChevronRight className="w-4 h-4 text-black" />
              </button>
              <button
                onClick={() => setGameState("howtoplay")}
                className="py-3.5 px-4 bg-[#FFFDF9] hover:bg-slate-100 text-black font-bold text-xs rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1"
              >
                <Info className="w-4 h-4" /> Rules
              </button>
              <button
                onClick={() => setGameState("stats")}
                className="py-3.5 px-4 bg-[#FF9F1C] text-black font-black text-xs rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1"
              >
                <Trophy className="w-4 h-4" /> Stats
              </button>
            </div>
          </div>
        )}

        {/* VIEW: DIFFICULTY SELECTION */}
        {gameState === "difficulty" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 bg-gradient-to-br from-[#E3D5CA] to-[#D5C3B3]">
            <div className="space-y-1.5">
              <span className="inline-block bg-[#9B5DE5] border-2 border-black p-1 px-3.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Stage 2 of 2
              </span>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">
                Select Battle Difficulty 💀
              </h2>
              <p className="text-xs md:text-sm font-bold text-slate-700 max-w-md mx-auto">
                Ready your strategy! The chosen gamemode alters starter resources and the strength of the incoming ignorance invaders.
              </p>
              
              {/* CURRENT CONFIG CHIPS */}
              <div className="flex justify-center gap-2 pt-1.5">
                <div className="bg-white border-2 border-black p-1 px-2.5 rounded-lg text-[10px] font-black uppercase text-slate-700 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                  <span>🗺️ Map:</span>
                  <span className="text-[#e76f51]">{MAPS.find(m => m.id === selectedMap)?.name || selectedMap}</span>
                </div>
                <div className="bg-white border-2 border-black p-1 px-2.5 rounded-lg text-[10px] font-black uppercase text-slate-700 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                  <span>👑 Hero:</span>
                  <span className="text-[#9B5DE5]">{HEROES.find(h => h.id === selectedHero)?.name || selectedHero}</span>
                </div>
              </div>
            </div>

            {/* DIFFICULTIES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl w-full">
              {/* EASY MODE */}
              <button
                onClick={() => {
                  playSound("click");
                  setDifficulty("easy");
                }}
                className={`p-3.5 text-left border-3 border-black rounded-2xl transition-all relative ${
                  difficulty === "easy"
                    ? "bg-[#D1FAE5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px] border-emerald-600"
                    : "bg-white hover:bg-emerald-50/50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-emerald-800 uppercase tracking-wide">Easy Mode 🍀</span>
                  {difficulty === "easy" && <span className="text-[9px] bg-emerald-600 text-white font-black p-0.5 px-2 rounded-md border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">ACTIVE</span>}
                </div>
                <p className="text-[10px] text-emerald-950 font-bold mt-1.5 leading-tight text-left">
                  <span className="block font-black text-emerald-700 text-xs mb-0.5">"Relaxed Recall"</span>
                  Starts with <strong className="text-emerald-800">+$100 Gold</strong> and <strong className="text-emerald-800">+10 Lives</strong>. Invaders are <strong className="text-emerald-800">15% weaker</strong>. Gold bounty is <strong className="text-emerald-800">0.85x</strong>.
                </p>
              </button>

              {/* MEDIUM MODE */}
              <button
                onClick={() => {
                  playSound("click");
                  setDifficulty("medium");
                }}
                className={`p-3.5 text-left border-3 border-black rounded-2xl transition-all relative ${
                  difficulty === "medium"
                    ? "bg-[#DBEAFE] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px] border-blue-600"
                    : "bg-white hover:bg-blue-50/50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-blue-800 uppercase tracking-wide">Medium Mode 🛡️</span>
                  {difficulty === "medium" && <span className="text-[9px] bg-blue-600 text-white font-black p-0.5 px-2 rounded-md border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">ACTIVE</span>}
                </div>
                <p className="text-[10px] text-blue-950 font-bold mt-1.5 leading-tight text-left">
                  <span className="block font-black text-blue-700 text-xs mb-0.5">"Balanced Wisdom"</span>
                  Invaders have <strong className="text-blue-800">+15% HP & +8% speed</strong>. Gold rewards are limited to <strong className="text-blue-800">0.70x bounty</strong>!
                </p>
              </button>

              {/* HARD MODE */}
              <button
                onClick={() => {
                  playSound("click");
                  setDifficulty("hard");
                }}
                className={`p-3.5 text-left border-3 border-black rounded-2xl transition-all relative ${
                  difficulty === "hard"
                    ? "bg-[#FEE2E2] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px] border-rose-600"
                    : "bg-white hover:bg-rose-50/50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-rose-800 uppercase tracking-wide">Hard Mode 🔥</span>
                  {difficulty === "hard" && <span className="text-[9px] bg-rose-600 text-white font-black p-0.5 px-2 rounded-md border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">ACTIVE</span>}
                </div>
                <p className="text-[10px] text-rose-950 font-bold mt-1.5 leading-tight text-left">
                  <span className="block font-black text-rose-700 text-xs mb-0.5">"Defensive Expert"</span>
                  Starts with <strong className="text-rose-900">-5 Lives</strong> and <strong className="text-rose-900">-10% Starting Gold</strong>. Enemies gain <strong className="text-rose-900">+55% HP</strong> and <strong className="text-rose-900">+25% speed</strong>! Gold bounty is <strong className="text-rose-900">0.55x</strong>.
                </p>
              </button>

              {/* NIGHTMARE MODE */}
              <button
                onClick={() => {
                  playSound("click");
                  setDifficulty("nightmare");
                }}
                className={`p-3.5 text-left border rounded-xl transition-all relative cursor-pointer ${
                  difficulty === "nightmare"
                    ? "bg-[#1F2937] border-[#BFF83E] text-white"
                    : "bg-[#121824] border-[#364153] hover:bg-[#253248] text-slate-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-purple-400 uppercase tracking-wide">Nightmare Mode 🌌</span>
                  {difficulty === "nightmare" && <span className="text-[9px] bg-[#BFF83E] text-black font-extrabold px-2 py-0.5 rounded border border-[#364153]">ACTIVE</span>}
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1.5 leading-tight text-left">
                  <span className="block font-bold text-purple-300 text-xs mb-0.5">"The Speaking Legend"</span>
                  Starts with <strong className="text-white">only 10 Lives</strong> and <strong className="text-white">-20% Gold</strong>. Enemies gain <strong className="text-white">+115% HP</strong> and <strong className="text-white">+45% speed</strong>!
                </p>
              </button>
            </div>

            {/* ACTION FOOTER BUTTONS */}
            <div className="flex gap-3 w-full max-w-md pt-2">
              <button
                onClick={() => {
                  playSound("click");
                  setGameState("menu");
                }}
                className="flex-1 py-3 bg-[#1F2937] hover:bg-[#253248] text-white font-bold text-xs rounded-xl border border-[#364153] transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                ⬅️ Back to Map
              </button>
              <button
                onClick={handleStartGame}
                className="flex-1 py-3 bg-[#BFF83E] hover:bg-[#a8e22c] text-black font-extrabold text-sm uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer tracking-wider"
              >
                <Play className="w-4 h-4 fill-black" /> Launch Battle
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: HOW TO PLAY */}
        {gameState === "howtoplay" && (
          <div className="flex-1 bg-[#121824] p-8 text-left space-y-5 max-w-2xl mx-auto rounded-2xl border border-[#364153]">
            <h3 className="text-xl font-bold uppercase text-white border-b border-[#364153] pb-2">How to Play Defenders</h3>
            <ul className="space-y-3 text-xs font-medium text-slate-300 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-base text-[#BFF83E] font-bold">1.</span>
                <span><strong>Defend the base</strong>: Winding paths host crawling waves. Build towers in the empty space coordinates to attack the invaders before they escape!</span>
              </li>
              <li className="flex gap-2">
                <span className="text-base text-[#BFF83E] font-bold">2.</span>
                <span><strong>The Educational Quiz System</strong>: Before each wave starts, you will receive a multiple-choice question on presentation skills from your study cards.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-base text-[#BFF83E] font-bold">3.</span>
                <span><strong>Overcharge or Overpower</strong>: Answer <strong>CORRECTLY</strong> to earn bonus Gold and boosts. Answer <strong>INCORRECTLY</strong>, and upcoming enemies gain an <i>"Ignorance Buff"</i> making them stronger!</span>
              </li>
              <li className="flex gap-2">
                <span className="text-base text-[#BFF83E] font-bold">4.</span>
                <span><strong>Six Tower Types</strong>: Build Archers, Cannons, Ice, Fire, Lightning, or Magic towers to strategically win!</span>
              </li>
            </ul>
            <button
              onClick={() => setGameState("menu")}
              className="px-5 py-2.5 bg-[#BFF83E] text-black font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider cursor-pointer"
            >
              Back to Menu
            </button>
          </div>
        )}

        {/* VIEW 3: STATS */}
        {gameState === "stats" && (
          <div className="flex-1 bg-[#121824] p-8 text-left space-y-5 max-w-md mx-auto rounded-2xl border border-[#364153]">
            <h3 className="text-xl font-bold uppercase text-white border-b border-[#364153] pb-2 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#BFF83E]" /> Wisdom Statistics
            </h3>
            <div className="grid grid-cols-2 gap-3.5 text-xs font-bold text-slate-300">
              <div className="p-3.5 bg-[#1F2937] border border-[#364153] rounded-xl">
                <p className="text-slate-400 uppercase text-[9px]">Highest Wave Reached</p>
                <p className="text-2xl font-mono text-[#BFF83E]">{stats.highWave}</p>
              </div>
              <div className="p-3.5 bg-[#1F2937] border border-[#364153] rounded-xl">
                <p className="text-slate-400 uppercase text-[9px]">Enemies Defeated</p>
                <p className="text-2xl font-mono text-white">{stats.enemiesDefeated}</p>
              </div>
              <div className="p-3.5 bg-[#1F2937] border border-[#364153] rounded-xl">
                <p className="text-slate-400 uppercase text-[9px]">Bosses Slaughtered</p>
                <p className="text-2xl font-mono text-amber-400">{stats.bossesDefeated}</p>
              </div>
              <div className="p-3.5 bg-[#1F2937] border border-[#364153] rounded-xl">
                <p className="text-slate-400 uppercase text-[9px]">Towers Created</p>
                <p className="text-2xl font-mono text-purple-400">{stats.towersBuilt}</p>
              </div>
              <div className="col-span-2 p-3 bg-[#1F2937] border border-[#364153] rounded-xl">
                <p className="text-slate-400 uppercase text-[9px]">Total Time Defending</p>
                <p className="text-sm font-bold text-white mt-1">
                  {Math.floor(stats.totalPlayTime / 60)} minutes, {stats.totalPlayTime % 60} seconds
                </p>
              </div>
            </div>
            <button
              onClick={() => setGameState("menu")}
              className="px-5 py-2.5 bg-[#BFF83E] text-black font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider cursor-pointer"
            >
              Back to Menu
            </button>
          </div>
        )}

        {/* VIEW 4: MAIN GAMEPLAY CANVAS PORT */}
        {gameState === "playing" && (
          <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
            
            {/* CANVAS INTERACTIVE PLAYBOARD */}
            <div className="flex-1 flex flex-col items-center justify-start space-y-2 relative">
              
              {/* TOP HUD ROW */}
              <div className="w-full flex justify-between items-center bg-[#1F2937] border border-[#364153] p-3 rounded-2xl text-xs font-bold text-white">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-[#BFF83E] bg-[#121824] border border-[#364153] px-2.5 py-1 rounded-lg">
                    <Coins className="w-4 h-4" /> <span>${gold}</span>
                  </div>
                  <div className="flex items-center gap-1 text-rose-400 bg-[#121824] border border-[#364153] px-2.5 py-1 rounded-lg">
                    <Heart className="w-4 h-4 fill-rose-500 stroke-none" /> <span>{lives} Lives</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-black bg-[#BFF83E] border border-[#364153] px-3 py-1 rounded-lg font-extrabold">
                    <Shield className="w-4 h-4 fill-black" /> <span>WAVE {wave}</span>
                  </div>
                  <div className={`hidden sm:flex items-center gap-1 px-2.5 py-1 border border-[#364153] rounded-lg uppercase font-bold text-[9px] ${
                    difficulty === "easy" ? "bg-emerald-950 text-emerald-300" :
                    difficulty === "hard" ? "bg-rose-950 text-rose-300" :
                    difficulty === "nightmare" ? "bg-purple-950 text-purple-300 animate-pulse" :
                    "bg-blue-950 text-blue-300"
                  }`}>
                    {difficulty === "easy" && "🍀 Easy"}
                    {difficulty === "medium" && "🛡️ Medium"}
                    {difficulty === "hard" && "🔥 Hard"}
                    {difficulty === "nightmare" && "💀 Nightmare"}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={cycleSpeed}
                    className="p-1 px-2.5 bg-[#121824] hover:bg-[#253248] border border-[#364153] rounded-lg transition-all text-slate-300 cursor-pointer"
                  >
                    ⏩ {gameSpeed}x
                  </button>
                  <button
                    onClick={togglePause}
                    className="p-1 px-2.5 bg-[#121824] hover:bg-[#253248] border border-[#364153] text-[#BFF83E] font-bold rounded-lg transition-all cursor-pointer"
                  >
                    {isPaused ? "▶ Resume" : "⏸ Pause"}
                  </button>
                  {enemiesRef.current.length === 0 && !quizOpen && (
                    <button
                      onClick={handleTriggerNextWave}
                      className="p-1 px-3 bg-[#BFF83E] text-black font-extrabold border border-[#364153] rounded-lg transition-all animate-bounce cursor-pointer uppercase tracking-wider"
                    >
                      🚀 Start Wave
                    </button>
                  )}
                </div>
              </div>

              {/* BEST EXPERIENCE TIP BOX */}
              <div className="w-full bg-[#1F2937] border border-[#364153] p-2.5 rounded-xl text-[11px] font-bold text-[#BFF83E] flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Play at 2x game speed for optimal rhythm</span>
              </div>

              {/* MERGE ACTIVE BANNER */}
              {mergeSourceId && (
                <div className="w-full bg-[#121824] border border-[#BFF83E] p-2.5 rounded-xl text-[11px] font-bold text-white flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#BFF83E] fill-[#BFF83E] shrink-0 animate-bounce" />
                    <span>🧬 <strong>Merge active!</strong> Click another highlighted <strong>Tier {towersRef.current.find(t => t.id === mergeSourceId)?.level} {towersRef.current.find(t => t.id === mergeSourceId)?.type}</strong> to merge, or cancel.</span>
                  </div>
                  <button 
                    onClick={() => {
                      playSound("click");
                      setMergeSourceId(null);
                    }}
                    className="p-1 px-2 bg-[#1F2937] hover:bg-[#253248] border border-[#364153] rounded text-[10px] font-bold text-white shrink-0 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* WARNING IGNORANCE BUFF BANNER */}
              {waveBuffActive && (
                <div className="w-full bg-rose-950/80 border border-rose-500 p-2 rounded-xl text-[11px] font-bold text-rose-300 flex items-center justify-center gap-1.5 animate-pulse">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>⚠️ Ignorance Buff Active: Upcoming wave has 1.3x HP! Answer questions correctly to avoid this.</span>
                </div>
              )}

              {/* DRAW CANVAS AREA */}
              <div className="w-full bg-black rounded-2xl overflow-hidden border border-[#364153] shadow-2xl relative">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={500}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={() => {
                    hoverCoordsRef.current = null;
                    draggedTowerRef.current = null;
                    dragStartPosRef.current = null;
                    currentDragPosRef.current = null;
                  }}
                  className="w-full h-auto aspect-[16/10] bg-zinc-900 cursor-crosshair block"
                />
              </div>

              {/* BOTTOM CONTROL AND TOWER SELECTION DESK */}
              <div className="w-full bg-[#1F2937] border border-[#364153] p-3 rounded-2xl">
                <p className="text-[10px] font-bold uppercase text-[#9CA3AF] mb-1">
                  1. Select a tower below. 2. Click any coordinate outside the path to construct!
                </p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {Object.values(TOWERS).filter(t => t.purchasable !== false).map((t) => {
                    let cost = t.cost;
                    if (selectedHero === "math") {
                      cost = Math.round(cost * 0.85); // Math discount
                    }
                    const isAffordable = gold >= cost;

                    return (
                      <button
                        key={t.type}
                        onClick={() => setSelectedTowerType(t.type)}
                        className={`p-2 border rounded-xl text-left flex flex-col justify-between transition-all cursor-pointer ${
                          selectedTowerType === t.type 
                            ? "bg-[#121824] border-[#BFF83E]" 
                            : isAffordable 
                              ? "bg-[#121824] border-[#364153] hover:bg-[#253248]" 
                              : "bg-[#121824]/50 border-[#364153]/50 opacity-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-2.5 h-2.5 rounded-full border border-[#364153]" style={{ backgroundColor: t.color }} />
                          <span className="text-[9px] font-bold text-[#BFF83E] uppercase tracking-widest">${cost}</span>
                        </div>
                        <h5 className="text-[11px] font-bold text-white truncate mt-1">{t.name}</h5>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* SIDE PANEL: SELECTED PLACED TOWER CONTROLS */}
            <div className="w-full lg:w-72 bg-[#1F2937] border border-[#364153] p-4 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
              
              {/* UPPER DESCRIPTION */}
              <div className="space-y-3">
                <div className="border-b border-[#364153] pb-2">
                  <h4 className="text-xs font-bold uppercase text-[#9CA3AF]">Selected Tower Console</h4>
                </div>

                {selectedPlacedTower ? (
                  <div className="space-y-4 text-xs font-bold text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border border-[#364153] inline-block animate-pulse" style={{ backgroundColor: selectedPlacedTower.color }} />
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">
                          {TOWERS[selectedPlacedTower.type]?.name || `${selectedPlacedTower.type} Tower`}
                        </p>
                        <p className="text-[10px] text-[#BFF83E] font-bold uppercase">Tier {selectedPlacedTower.level} Defender</p>
                      </div>
                    </div>

                    {/* DESCRIPTION OF WHAT IT DOES */}
                    <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                      <span className="text-[9px] text-amber-800 uppercase font-black block mb-0.5">Ability & Role:</span>
                      <p className="text-[10.5px] leading-relaxed text-slate-800 font-medium">
                        {TOWERS[selectedPlacedTower.type]?.description || "A solid defense sentinel protecting the path."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase font-black block">Damage:</span>
                        <span className="text-xs font-black text-slate-950">{selectedPlacedTower.damage}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase font-black block">Range Radius:</span>
                        <span className="text-xs font-black text-slate-950">{selectedPlacedTower.range}px</span>
                      </div>
                      <div className="col-span-2 mt-1">
                        <span className="text-[9px] text-gray-400 uppercase font-black block">Target Priority:</span>
                        <div className="grid grid-cols-3 gap-1 mt-1 text-[9px] font-black">
                          {(["First", "Last", "Strongest", "Weakest", "Closest"] as Tower["targetMode"][]).map(mode => (
                            <button
                              key={mode}
                              onClick={() => handleChangeTargetMode(mode)}
                              className={`p-1 border border-black rounded truncate ${
                                selectedPlacedTower.targetMode === mode ? "bg-[#FFD166]" : "bg-white"
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* UPGRADE AND SELL CONTROLS */}
                    <div className="space-y-1.5 pt-2">
                      {selectedPlacedTower.type.startsWith("char") ? (
                        <div className="text-center text-[10px] bg-purple-50 text-purple-800 p-2.5 rounded-xl border border-purple-200 font-black uppercase leading-tight">
                          🧬 FUSION CHARACTER<br/>
                          <span className="text-[9px] font-bold text-slate-500 normal-case">Evolve solely by merging two identical Tier {selectedPlacedTower.level} towers on the field.</span>
                        </div>
                      ) : selectedPlacedTower.level < 3 ? (
                        (() => {
                          const baseConfig = TOWERS[selectedPlacedTower.type];
                          const upgradeCost = Math.round(baseConfig.cost * 0.8 * selectedPlacedTower.level);
                          const isAffordable = gold >= upgradeCost;

                          return (
                            <button
                              onClick={handleUpgradeTower}
                              disabled={!isAffordable}
                              className={`w-full py-2 bg-[#9B5DE5] text-white border-2 border-black font-black rounded-xl text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                                !isAffordable ? "opacity-50 cursor-not-allowed" : "hover:translate-x-[0.5px] hover:translate-y-[0.5px]"
                              }`}
                            >
                              🌟 Upgrade to Tier {selectedPlacedTower.level + 1} (${upgradeCost})
                            </button>
                          );
                        })()
                      ) : (
                        <p className="text-center text-[10px] bg-amber-50 text-amber-800 p-2 rounded-xl border border-amber-200 font-black uppercase">
                          👑 Max Tier 3 Achieved!
                        </p>
                      )}

                      {selectedPlacedTower.type !== "char10" && (
                        <button
                          onClick={() => {
                            playSound("click");
                            if (mergeSourceId === selectedPlacedTower.id) {
                              setMergeSourceId(null);
                            } else {
                              setMergeSourceId(selectedPlacedTower.id);
                            }
                          }}
                          className={`w-full py-2 border-2 border-black font-black rounded-xl text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1 ${
                            mergeSourceId === selectedPlacedTower.id
                              ? "bg-amber-400 text-black animate-pulse"
                              : "bg-[#06D6A0] text-black hover:translate-x-[0.5px] hover:translate-y-[0.5px]"
                          }`}
                        >
                          {mergeSourceId === selectedPlacedTower.id ? "🧬 Cancel Merging" : "🧬 Merge (Free Upgrade)"}
                        </button>
                      )}

                      <button
                        onClick={handleSellTower}
                        className="w-full py-2 bg-rose-500 text-white border-2 border-black font-black rounded-xl text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all"
                      >
                        💰 Sell Tower (+${Math.round((TOWERS[selectedPlacedTower.type].cost * selectedPlacedTower.level) * 0.5)})
                      </button>

                      <button
                        onClick={() => setSelectedPlacedTower(null)}
                        className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 border-2 border-black font-black rounded-xl text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all"
                      >
                        ❌ Deselect Tower
                      </button>
                    </div>
                  </div>
                ) : selectedEnemyId && enemiesRef.current.find(e => e.id === selectedEnemyId) ? (
                  (() => {
                    const enemy = enemiesRef.current.find(e => e.id === selectedEnemyId)!;
                    
                    const descriptions: Record<string, string> = {
                      Normal: "A basic manifestation of academic doubt. Moves at average speed and possesses low health.",
                      Wolf: "Sprinting ignorance wolf. Extremely agile and fast, though fragile. Ice spires are perfect to slow them down.",
                      Skeleton: "Hardened skeleton. Moves slightly slower but resists light magical damage with its rigid bone structure.",
                      Orc: "Heavy combat orc. High health points and moderate pace. Cannon towers splash them beautifully.",
                      Knight: "Armored academic knight. High armor reserves make it highly resistant to basic physical projectiles. Lightning or magic towers penetrate their shields easily.",
                      Giant: "Colossal conceptual titan. Immense HP pool and sluggish speed. Demands supreme firepower or heavy burning dot damage to bring down.",
                      "Flying Dragon": "Skyborne horror. Swift and healthy, it flies above the standard waypoints to breach defenses rapidly.",
                      Boss: "The Ultimate Conceptual Boss. A massive manifestation of academic pressure. Possesses an overwhelming amount of health and is immune to generic instant defeats."
                    };

                    const weaknesses: Record<string, string> = {
                      Normal: "Vulnerable to all elemental and physical tower types.",
                      Wolf: "⭐ Countered by Ice Spires (Slowing reduces their speed advantage dramatically).",
                      Skeleton: "⭐ Countered by Physical/Fire arrows (Slow speed makes them easy targets).",
                      Orc: "⭐ Countered by Cannon Towers (High density orcs gather and receive huge splash damage).",
                      Knight: "⭐ Countered by Magic or Lightning Towers (Lightning ignores heavy defense shields).",
                      Giant: "⭐ Countered by Fire Towers (Dot burn damage deals percent-based high damage over time).",
                      "Flying Dragon": "⭐ Countered by Archer or Magic Towers (Fast-firing precise projectiles lock them down).",
                      Boss: "⭐ Requires combined high-tier merged towers and continuous frozen slowdown effects."
                    };

                    const hpPercentage = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));

                    return (
                      <div className="space-y-4 text-xs font-bold text-slate-700 animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full border border-black inline-block animate-pulse shrink-0" style={{ backgroundColor: enemy.color }} />
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{enemy.type} Invader</p>
                            <p className="text-[10px] text-rose-600 font-black uppercase">Active Threat Identified</p>
                          </div>
                        </div>

                        {/* LIVE HP PROGRESS BAR */}
                        <div className="bg-rose-50 p-2 rounded-xl border border-rose-200">
                          <div className="flex justify-between items-center text-[10px] text-rose-800 font-black mb-1">
                            <span>INTEGRITY / HP:</span>
                            <span>{enemy.hp} / {enemy.maxHp} ({hpPercentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-rose-200 h-2 rounded-full overflow-hidden border border-rose-900/10">
                            <div className="bg-rose-600 h-full transition-all duration-150" style={{ width: `${hpPercentage}%` }} />
                          </div>
                        </div>

                        {/* INTRODUCTORY SPECS & DESCRIPTION */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-black block">Threat Description:</span>
                            <p className="text-[10.5px] leading-relaxed text-slate-800 font-medium">{descriptions[enemy.type] || "An active conceptual hazard attempting to breach library defenses."}</p>
                          </div>

                          <div>
                            <span className="text-[9px] text-amber-600 uppercase font-black block">Weakness & Recommendation:</span>
                            <p className="text-[10.5px] leading-relaxed text-slate-800 font-bold">{weaknesses[enemy.type] || "Use concentrated fire to eliminate quickly."}</p>
                          </div>
                        </div>

                        {/* STATS SUMMARY */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-[9px] text-gray-400 uppercase font-black block">Movement Speed:</span>
                            <span className="text-xs font-black text-slate-950">{(enemy.speed).toFixed(1)}x pace</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 uppercase font-black block">Defeat Bounty:</span>
                            <span className="text-xs font-black text-emerald-600">+${enemy.reward} Gold</span>
                          </div>
                          {enemy.isSlowing > 0 && (
                            <div className="col-span-2 text-[10px] text-blue-700 font-bold bg-blue-50 border border-blue-200 p-1 rounded text-center">
                              ❄️ Temporal Slowdown Active ({enemy.isSlowing}f)
                            </div>
                          )}
                          {enemy.isStunned && enemy.isStunned > 0 && (
                            <div className="col-span-2 text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 p-1 rounded text-center animate-pulse">
                              ⚡ Lockdown Stun Active ({enemy.isStunned}f)
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedEnemyId(null)}
                          className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 border-2 border-black font-black rounded-xl text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all"
                        >
                          ❌ Clear Intel View
                        </button>
                      </div>
                    );
                  })()
                ) : selectedTowerType ? (
                  (() => {
                    const t = TOWERS[selectedTowerType];
                    let currentCost = t.cost;
                    if (selectedHero === "math") {
                      currentCost = Math.round(currentCost * 0.85);
                    }

                    // Adjust final damage/range for display based on heroes
                    const finalDamage = Math.round(t.damage * (selectedHero === "teacher" ? 1.15 : 1.0));
                    const finalRange = Math.round(t.range * (selectedHero === "science" ? 1.15 : 1.0));
                    const firesPerSec = (60 / t.cooldown).toFixed(1);

                    return (
                      <div className="space-y-4 text-xs font-bold text-slate-700 animate-fadeIn">
                        <div className="flex items-center gap-2 border-b border-dashed pb-2">
                          <span className="w-3.5 h-3.5 rounded-full border border-black inline-block" style={{ backgroundColor: t.color }} />
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{t.name}</p>
                            <p className="text-[10px] text-emerald-600 font-black uppercase">Ready to Deploy • Cost: ${currentCost}</p>
                          </div>
                        </div>

                        {/* BLUEPRINT DETAILS */}
                        <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                          <span className="text-[9px] text-indigo-800 uppercase font-black block mb-0.5">Role Description:</span>
                          <p className="text-[10.5px] leading-relaxed text-slate-800 font-medium">
                            {t.description || "A solid defense sentinel protecting the path."}
                          </p>
                        </div>

                        {/* BASE SPECS */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-[9px] text-gray-400 uppercase font-black block">Deploy Cost:</span>
                            <span className="text-xs font-black text-[#38b000]">${currentCost} Gold</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 uppercase font-black block">Attack Range:</span>
                            <span className="text-xs font-black text-slate-950">{finalRange}px</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 uppercase font-black block">Power Damage:</span>
                            <span className="text-xs font-black text-slate-950">{finalDamage}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 uppercase font-black block">Firing Speed:</span>
                            <span className="text-xs font-black text-slate-950">{firesPerSec}/sec</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 text-[10px] text-slate-600 font-medium leading-relaxed">
                          <span className="font-extrabold text-amber-800 uppercase text-[9px] block">🔨 Placement Tip:</span>
                          Click anywhere on the grass field grid outside the path to construct this tower! Keep identical towers in close proximity to merge and evolve them freely later.
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                    <p className="text-[11px] font-bold text-slate-500 leading-normal px-4">
                      Click on any constructed tower, active enemy, or choose a blueprint below to view full specifications!
                    </p>
                  </div>
                )}
              </div>

              {/* TOWER SPECS DICTIONARY */}
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 text-[10px] text-indigo-950 font-bold space-y-1 leading-normal">
                <span className="font-extrabold uppercase text-[#9B5DE5] block">💡 Battle Advisor:</span>
                <span>Elemental towers have distinct impact effects: <b>Ice</b> applies slow speed, <b>Fire</b> grants heavy burns, and <b>Lightning</b> chains chain strikes. Mix and match!</span>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 5: ACTIVE QUIZ MODAL OVERLAY */}
        {quizOpen && currentQuestion && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="w-full max-w-xl bg-[#1F2937] border border-[#364153] rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-[#BFF83E]" />
              
              <div className="flex items-center gap-2 border-b border-[#364153] pb-3">
                <Zap className="w-5 h-5 text-[#BFF83E]" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-white">Present<span className="text-[#BFF83E]">AI</span> Challenge Round</h3>
                  <p className="text-[10px] text-[#BFF83E] uppercase font-bold tracking-widest bg-[#121824] px-2 py-0.5 rounded border border-[#364153] inline-block mt-0.5">
                    Wave {wave + 1} Qualification
                  </p>
                </div>
              </div>

              {/* Question Text */}
              <div className="p-5 bg-[#121824] text-white rounded-xl border border-[#364153] text-xs md:text-sm font-bold whitespace-pre-wrap leading-relaxed relative">
                <div className="absolute right-3 top-3 text-[9px] font-bold uppercase tracking-widest bg-[#1F2937] text-[#BFF83E] px-1.5 py-0.5 rounded border border-[#364153]">
                  CONCEPT RECALL
                </div>
                {currentQuestion.q}
              </div>

              {/* Multiple Choice Options */}
              <div className="grid grid-cols-1 gap-2.5">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = option === currentQuestion.answer;
                  const isAnswered = quizResult !== null;

                  let optionStyle = "bg-[#121824] border-[#364153] hover:bg-[#253248] text-slate-200";
                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = "bg-[#121824] border-[#BFF83E] text-white font-bold";
                    } else if (isSelected) {
                      optionStyle = "bg-rose-950/60 border-rose-500 text-rose-200 font-bold";
                    } else {
                      optionStyle = "bg-[#1F2937] border-[#364153] text-slate-500";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleAnswerQuiz(option)}
                      className={`w-full text-left p-3 rounded-xl border font-medium text-xs leading-relaxed transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                    >
                      <span className={`w-5 h-5 rounded-full border border-[#364153] flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isAnswered && isCorrect ? "bg-[#BFF83E] text-black" : isAnswered && isSelected ? "bg-rose-500 text-white" : "bg-[#1F2937] text-slate-300"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quiz Feedback block */}
              {quizResult !== null && (
                <div className="p-4 rounded-xl border border-[#364153] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#121824] animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">
                        {quizResult === "correct" ? "Excellent recall!" : "Answer Incorrect!"}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-normal font-medium">
                        {quizResult === "correct" 
                          ? "Your memory holds! You gained extra Gold and towers are at full readiness." 
                          : "The conceptual breach has buffed the upcoming wave by 1.3x HP!"
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleStartWaveAfterQuiz}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#BFF83E] hover:bg-[#a8e22c] text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 uppercase tracking-wider cursor-pointer"
                  >
                    Release Wave {wave + 1} ⚔️
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* VIEW 6: GAMEOVER SCREEN */}
        {gameState === "gameover" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-[#121824]">
            <div className="text-5xl animate-bounce">💀</div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold uppercase text-white">Base Overrun!</h2>
              <p className="text-xs text-slate-400 font-medium max-w-sm">
                The forces of ignorance have breached your core conceptual libraries.
              </p>
            </div>

            {/* GIANT WAVE REACHED DISPLAY */}
            <div className="bg-[#1F2937] text-white border border-[#364153] p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-auto space-y-2 relative overflow-hidden">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#9CA3AF]">Survival Report</p>
              <h3 className="text-xs uppercase tracking-tight font-bold text-slate-300">You Reached</h3>
              <div className="text-5xl font-mono font-bold text-[#BFF83E] tracking-tight">
                WAVE {wave}
              </div>
              <p className="text-[10px] text-slate-400 font-medium max-w-xs mx-auto italic">
                {wave === 0 ? "No waves cleared. Ready your towers next time!" :
                 wave < 5 ? "A solid attempt! Keep reinforcing your library defenses." :
                 wave < 15 ? "Fantastic! You've proven your academic fortitude." :
                 "Legendary Scholar! Your presentation recall is unmatched!"}
              </p>
            </div>

            <div className="max-w-xs mx-auto p-5 bg-[#1F2937] border border-[#364153] rounded-xl shadow-lg text-left space-y-2 text-xs font-bold text-slate-300">
              <div className="flex justify-between border-b border-[#364153] pb-1">
                <span className="text-slate-400">Waves Cleared:</span>
                <span className="text-white font-bold">{wave}</span>
              </div>
              <div className="flex justify-between border-b border-[#364153] pb-1">
                <span className="text-slate-400">Defeated Enemies:</span>
                <span className="text-white font-bold">{stats.enemiesDefeated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Gold Earned:</span>
                <span className="text-[#BFF83E] font-bold">${gold}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleStartGame}
                className="px-6 py-3 bg-[#BFF83E] hover:bg-[#a8e22c] text-black font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Replay Game
              </button>
              <button
                onClick={() => {
                  playSound("click");
                  setGameState("menu");
                }}
                className="px-6 py-3 bg-[#1F2937] hover:bg-[#253248] text-white border border-[#364153] font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                👈 Return to Menu
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
