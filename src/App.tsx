import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  BookOpen,
  Award,
  Trophy,
  Crown,
  Medal,
  Clock,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  FileText,
  Volume2,
  ListTodo,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Eye,
  MessageSquare,
  ThumbsUp,
  User,
  Zap,
  ArrowUpRight,
  Smile,
  Check,
  Flame,
  ChevronRight,
  BarChart2,
  Trash2,
  Plus,
  Star,
  Mic,
  MicOff,
  Play,
  Square,
  Pause,
  Upload,
  Layers,
  Copy,
  Shield,
  Heart,
  Activity,
  Target,
  X,
  Video,
  VideoOff,
  Camera,
  SwitchCamera,
  Hand,
  UserCheck,
  Palette,
  Moon,
  Sun,
  ChevronDown,
  Home,
  CheckCircle2,
  Gamepad2,
  Swords,
  Bot,
  ShieldCheck
} from "lucide-react";
import { ScriptAnalysisResult, SlideAnalysisResult, PracticeFeedback, SavedPresentation, RecordingFeedback, TedAnalysisResult, VideoTelemetrySummary } from "./types";
import { TowerDefenseGame } from "./components/TowerDefenseGame";
import { SlimeMergeGame } from "./components/SlimeMergeGame";
import { QnaDefenseBlooketLab } from "./components/QnaDefenseBlooketLab";
import { SlideCheckerEnhanced } from "./components/SlideCheckerEnhanced";
import { TesterCalibrationPanel } from "./components/TesterCalibrationPanel";
import robotGraduateLogo from "./assets/images/flat_robot_logo_1789090325784.jpg";
import cyberGreenLogo from "./assets/images/cyber_green_logo_1785823604341.jpg";
import robotTeacherStick from "./assets/images/robot_teacher_stick_1789621419716.jpg";

// Neo-Brutalist Playful Classroom UI theme classes
const BRUTAL_BORDER = "border-3 border-black";
const BRUTAL_CARD = `bg-white ${BRUTAL_BORDER} rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all duration-200`;
const BRUTAL_CARD_SMALL = `bg-white ${BRUTAL_BORDER} rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)]`;
const BRUTAL_BUTTON_ORANGE = `px-6 py-3 bg-[#FF6B35] text-white font-extrabold ${BRUTAL_BORDER} rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer`;
const BRUTAL_BUTTON_YELLOW = `px-6 py-3 bg-[#FFD166] text-black font-extrabold ${BRUTAL_BORDER} rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer`;
const BRUTAL_BUTTON_GREEN = `px-6 py-3 bg-[#06D6A0] text-black font-extrabold ${BRUTAL_BORDER} rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer`;
const BRUTAL_BUTTON_WHITE = `px-6 py-3 bg-white text-black font-extrabold ${BRUTAL_BORDER} rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer`;
const BRUTAL_BUTTON_BLACK = `px-6 py-3 bg-black text-white font-extrabold ${BRUTAL_BORDER} rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer`;

// Aliases for compatibility
const MEDAL_BORDER = BRUTAL_BORDER;
const MEDAL_CARD = BRUTAL_CARD;
const MEDAL_CARD_SMALL = BRUTAL_CARD_SMALL;
const MEDAL_BUTTON_ACCENT = BRUTAL_BUTTON_ORANGE;
const MEDAL_BUTTON_SECONDARY = BRUTAL_BUTTON_YELLOW;
const MEDAL_BUTTON_GHOST = BRUTAL_BUTTON_WHITE;

const mapTechnicalErrorToFriendly = (errorMessage: string): string => {
  const err = errorMessage.toLowerCase();
  if (err.includes("503") || err.includes("service unavailable") || err.includes("busy") || err.includes("demand") || err.includes("unavailable")) {
    return "Our JunoAi is currently busy due to extremely high demand. Please try again in a few moments, or feel free to use our offline smart fallbacks!";
  }
  if (err.includes("api key") || err.includes("key is not configured") || err.includes("unauthorized") || err.includes("key missing")) {
    return "AI key is missing, but don't worry! Our smart local fallback system has successfully generated an offline lesson plan and concept card list for you!";
  }
  return "Our JunoAi encountered a temporary hitch. Please try clicking the retry button in a few moments!";
};

const SAMPLE_SCRIPT = `Imagine waking up to a red sunrise. Every day, the gravity is lighter, and the sky is a different color. Mars isn't just a cold planet in the solar system; it's our future home!

Basically, we need to think about how we will eat, breathe, and live there. First, I will talk about the rockets. Like, they are really big and carry tons of fuel. Then, I'll discuss the atmosphere. We will have to generate oxygen using special machines called Moxie, which is super cool.

So, some people think it is impossible. But I say we can definitely build a city on Mars if we work hard and invest in science. In conclusion, Mars is the ultimate adventure for our generation. Thank you for listening to my talk!`;

const DEFAULT_SPEAKING_FLASHCARDS = [
  {
    front: "The Hook (Attention Grabber)",
    back: "The first 15 seconds of your speech! Start with a shocking fact, a funny question, or a cool story instead of saying 'Hi, my topic is...' to instantly capture everyone's attention."
  },
  {
    front: "The Rule of Three",
    back: "People remember things in groups of three! Organize your presentation into exactly three main ideas, or use three-word slogans (e.g., 'Eat, Sleep, Breathe') to make your points stick."
  },
  {
    front: "The Rhetorical Pause",
    back: "Don't be afraid of silence! After stating a major fact or asking a big question, pause silently for 2 full seconds. It gives your classmates time to think and makes you look super confident."
  },
  {
    front: "Voice Projection (The Back Row Rule)",
    back: "Always speak directly to the person sitting in the very last row of the classroom. If they can hear you clearly, your entire class will hear you without you needing to shout."
  },
  {
    front: "The 'Z' Eye Contact Method",
    back: "Instead of staring at one friend or the floor, sweep your eyes across the classroom in the shape of a large letter 'Z'. This makes every single person feel like you are speaking to them!"
  },
  {
    front: "Power Posture (The Tree Trunk)",
    back: "Stand with your feet shoulder-width apart, solid like a tree trunk. Don't sway or fidget with your hands. It sends a message to your brain that you are calm, safe, and ready!"
  },
  {
    front: "The 10-20-30 Slide Rule",
    back: "Keep slide designs clean: no more than 10 slides, lasting no more than 20 minutes, and using at least 30-point font size so everyone in the classroom can read your slides without squinting."
  },
  {
    front: "Visual Anchoring",
    back: "Choose three physical objects in the room (e.g., a clock, a poster, a chair) to look at when you need a moment. This anchors your body posture and calms nervous energy invisibly."
  },
  {
    front: "The 'But/Therefore' Rule",
    back: "Connect your main points with 'but' or 'therefore' instead of saying 'and then'. This creates logical drama and storytelling flow instead of reading a dry, sequential list of facts."
  },
  {
    front: "Clench-and-Release Method",
    back: "If you feel physical stage fright or shaky hands, gently clench your toes inside your shoes or press your thumb against your index finger. This safely channels excess adrenaline out of sight!"
  }
];

const DEFAULT_QNA_ITEMS = [
  {
    category: "Clarification" as const,
    badgeColor: "bg-[#00F5FF]",
    icon: "🧐",
    question: "Why specifically is 8 to 10 hours of sleep recommended for students rather than 6 or 7?",
    whyAsked: "Judges or teachers ask this to see if you understand the core science behind your main claim.",
    prepStrategy: "Use PREP: State the brain development factor (Point), explain memory consolidation during REM sleep (Reason), cite school performance studies (Example), and conclude why 8-10 hours is optimal (Point).",
    modelAnswer: "Great question! Medical research shows that adolescent brains are still actively developing, especially in the prefrontal cortex. During deep sleep and REM cycles, memory consolidation occurs—transferring facts learned in class into long-term memory. 6 hours cuts off key REM cycles, leading to brain fog, whereas 8 to 10 hours ensures full mental and physical recovery."
  },
  {
    category: "Challenge" as const,
    badgeColor: "bg-[#FF6B35]",
    icon: "⚡",
    question: "Many students say they get better grades by staying up all night studying before exams. How do you respond to that?",
    whyAsked: "A counter-argument question tests your poise and ability to respectfully disagree with common myths using facts.",
    prepStrategy: "Acknowledge the common myth first, then present opposing research gently, and reframe sleep as an active study tool.",
    modelAnswer: "I completely understand why many classmates feel that way! Pulling an all-nighter can feel productive in the moment. However, cognitive studies show that sleep deprivation impairs recall speed by up to 40% during exams. Sleeping well actually acts as a study accelerator because your brain organizes information while you rest!"
  },
  {
    category: "Deep Detail" as const,
    badgeColor: "bg-[#9B5DE5]",
    icon: "🎓",
    question: "What practical steps can students take if they have trouble falling asleep early due to screen time?",
    whyAsked: "Audience members love actionable solutions and real-world advice.",
    prepStrategy: "Provide a 3-step actionable routine (e.g. Blue light filter, 30-min wind-down, dark room).",
    modelAnswer: "That's a very practical challenge! The main culprit is blue light from phones suppressing melatonin production. I recommend three simple steps: first, turn on night-mode or put devices away 30 minutes before bed; second, read a book or listen to calm music; and third, keep your bedroom cool and dark."
  },
  {
    category: "Future Impact" as const,
    badgeColor: "bg-[#06D6A0]",
    icon: "🚀",
    question: "Do you think schools should adjust start times to help teenagers sleep better?",
    whyAsked: "This assesses your opinion on broader policy or social implications of your topic.",
    prepStrategy: "Express a clear position backed by adolescent circadian rhythm science.",
    modelAnswer: "Yes, I strongly support that! Research from pediatric organizations shows teenager circadian rhythms naturally shift later during puberty. Schools that shifted start times by even 45 minutes saw attendance rise, mood improve, and average grades increase by half a letter grade."
  }
];

const TONGUE_TWISTERS = [
  { text: "Red leather, yellow leather, red leather, yellow leather.", difficulty: "Beginner", tip: "Focus on crisp 'L' and 'R' tongue movements." },
  { text: "Unique New York, Unique New York, You know you need Unique New York.", difficulty: "Intermediate", tip: "Emphasize the 'K' sound at the end of Unique." },
  { text: "Peter Piper picked a peck of pickled peppers.", difficulty: "Beginner", tip: "Practice soft lip pops without blasting the microphone." },
  { text: "She sells sea shells on the sea shore.", difficulty: "Intermediate", tip: "Differentiate clearly between 'S' and 'SH' sounds." },
  { text: "Betty Botter bought some butter, but she said the butter's bitter.", difficulty: "Advanced", tip: "Keep your jaw relaxed while maintaining rhythm." },
  { text: "Which wristwatches are Swiss wristwatches?", difficulty: "Advanced", tip: "Great for un-slurring consonants under pressure." }
];

const EMERGENCY_PIVOT_PHRASES = [
  {
    situation: "When you don't know the exact statistic or fact",
    phrase: "That's a great question! While my current research focused on the primary trends, I would be glad to verify the exact numbers and follow up with you right after class.",
    tag: "Fact Check Recovery"
  },
  {
    situation: "When someone disagrees strongly with your argument",
    phrase: "I really appreciate that perspective! That's a valid point to consider; however, based on the evidence I examined...",
    tag: "Respectful Reframe"
  },
  {
    situation: "When you need 3 seconds to organize your thoughts",
    phrase: "That is a really thoughtful question. Let me break that down into two main points...",
    tag: "3-Second Stall"
  },
  {
    situation: "When a question is slightly off-topic",
    phrase: "That's an interesting angle! While that goes a bit beyond today's scope on this topic, it connects to our main point because...",
    tag: "Graceful Pivot"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "script" | "notes" | "slides" | "practice" | "qna" | "warmup" | "flashcards" | "tracker">("home");
  const [prevTab, setPrevTab] = useState<string>("home");
  
  // Informational & Guide Modals State
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [showVersion2Modal, setShowVersion2Modal] = useState(false);
  const [showApModal, setShowApModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [robotTutorialStep, setRobotTutorialStep] = useState(0);

  // User Notes & Research State
  const [notesText, setNotesText] = useState<string>(() => {
    try {
      return (
        localStorage.getItem("junoai_notes_text") ||
        "Key Research Notes & Facts:\n\n1. Thesis: A clear, memorable message connects deeply with any classroom or panel audience.\n2. Supporting Evidence: Combine verified real-world examples with authentic personal passion.\n3. Delivery Technique: Maintain eye contact across the entire room and speak at 110–140 words per minute.\n4. Inquiry Defense: Use the PREP method (Point, Reason, Example, Point) to answer questions with poise."
      );
    } catch {
      return "";
    }
  });
  const [notesTitle, setNotesTitle] = useState<string>(() => {
    try {
      return localStorage.getItem("junoai_notes_title") || "My Research Notes";
    } catch {
      return "My Research Notes";
    }
  });
  const [copiedNotes, setCopiedNotes] = useState(false);

  // Quiz Topic Source State ("script" | "notes")
  const [quizSource, setQuizSource] = useState<"script" | "notes">("script");
  const [showQuizSourceModal, setShowQuizSourceModal] = useState(false);

  // Real App Controls & Accessibility
  const [textSizeLarge, setTextSizeLarge] = useState<boolean>(() => {
    try {
      return localStorage.getItem("junoai_text_large") === "true";
    } catch {
      return false;
    }
  });
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("junoai_text_large", String(textSizeLarge));
      if (textSizeLarge) {
        document.documentElement.classList.add("text-size-large");
      } else {
        document.documentElement.classList.remove("text-size-large");
      }
    } catch (e) {
      console.error("Text size error:", e);
    }
  }, [textSizeLarge]);

  // Dynamic Theme Switching: "default" (System Default), "dark_neon" (Cyber Emerald), "medal" (Championship Gold & Bronze)
  const [theme, setTheme] = useState<"default" | "dark_neon" | "medal">(() => {
    try {
      const saved = localStorage.getItem("junoai_theme") || localStorage.getItem("presentai_theme");
      if (saved === "dark_neon" || saved === "medal") return saved;
      return "default";
    } catch {
      return "default";
    }
  });
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const applyThemeClasses = (t: "default" | "dark_neon" | "medal") => {
    try {
      document.documentElement.classList.remove("theme-dark-neon", "theme-medal");
      document.body.classList.remove("theme-dark-neon", "theme-medal");
      if (t === "dark_neon") {
        document.documentElement.classList.add("theme-dark-neon");
        document.body.classList.add("theme-dark-neon");
      } else if (t === "medal") {
        document.documentElement.classList.add("theme-medal");
        document.body.classList.add("theme-medal");
      }
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    const nextTheme: "default" | "dark_neon" | "medal" = 
      theme === "default" ? "dark_neon" : theme === "dark_neon" ? "medal" : "default";
    setTheme(nextTheme);
    try {
      localStorage.setItem("junoai_theme", nextTheme);
      applyThemeClasses(nextTheme);
    } catch {
      // ignore
    }
  };

  const selectTheme = (selectedTheme: "default" | "dark_neon" | "medal") => {
    setTheme(selectedTheme);
    setShowThemeMenu(false);
    try {
      localStorage.setItem("junoai_theme", selectedTheme);
      applyThemeClasses(selectedTheme);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    applyThemeClasses(theme);
  }, [theme]);

  // TED Talk Script Analyzer States
  const [tedAnalysis, setTedAnalysis] = useState<TedAnalysisResult | null>(null);
  const [isAnalyzingTed, setIsAnalyzingTed] = useState(false);
  const [tedError, setTedError] = useState<string | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  const switchTab = (newTab: "home" | "script" | "notes" | "slides" | "practice" | "qna" | "warmup" | "flashcards" | "tracker") => {
    setPrevTab(activeTab);
    setActiveTab(newTab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoBack = () => {
    if (prevTab && prevTab !== activeTab && prevTab !== "home") {
      setActiveTab(prevTab as any);
    } else {
      setActiveTab("home");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  // Q&A Defense Lab States
  const [selectedQnaIndex, setSelectedQnaIndex] = useState(0);
  const [qnaUserAnswer, setQnaUserAnswer] = useState("");
  const [isEvaluatingQna, setIsEvaluatingQna] = useState(false);
  const [qnaFeedback, setQnaFeedback] = useState<PracticeFeedback | null>(null);
  const [copiedPivot, setCopiedPivot] = useState<string | null>(null);

  // Stage Warmup States
  const [anxietySubTab, setAnxietySubTab] = useState<"breathing" | "warmup" | "games">("breathing");
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathingSeconds, setBreathingSeconds] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingCyclesCount, setBreathingCyclesCount] = useState(0);
  const [activeTwisterIdx, setActiveTwisterIdx] = useState(0);
  const [warmupChecklist, setWarmupChecklist] = useState<Record<string, boolean>>({
    feet: false,
    shoulders: false,
    gaze: false,
    toes: false,
    hum: false
  });
  
  // Script Input States
  const [script, setScript] = useState(
    "Good morning everyone. Today, I would like to talk about the importance of getting enough sleep. Many students stay up late to play games, watch videos, or do homework. But did you know that not getting enough sleep makes you feel tired, lose focus, and perform poorly in school? Our bodies and brains need sleep to rest and recover. Getting at least 8 to 10 hours of sleep every night will help you stay healthy, happy, and energized for the next day. So, let's make sleep a priority. Thank you!"
  );
  const [targetYear, setTargetYear] = useState("Year 9");
  const [isPersuasive, setIsPersuasive] = useState(false);
  const [extraPrompt, setExtraPrompt] = useState("");
  const [presentationTitle, setPresentationTitle] = useState("The Importance of Getting Enough Sleep");
  
  // Slide Check States
  const [slideText, setSlideText] = useState("");
  const [slideAnalysis, setSlideAnalysis] = useState<SlideAnalysisResult | null>(null);
  const [isAnalyzingSlides, setIsAnalyzingSlides] = useState(false);
  const [slideError, setSlideError] = useState<string | null>(null);

  // Analysis Result State
  const [analysis, setAnalysis] = useState<ScriptAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedSlide, setCopiedSlide] = useState(false);

  // Practice session simulation state
  const [selectedQuestion, setSelectedQuestion] = useState<{ difficulty: string; question: string; modelAnswer: string } | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [practiceFeedback, setPracticeFeedback] = useState<PracticeFeedback | null>(null);
  const [practiceError, setPracticeError] = useState<string | null>(null);

  // Flashcards state
  const [customFlashcards, setCustomFlashcards] = useState<Array<{ front: string; back: string }>>([]);
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<string[]>([]);

  // Revision Game States
  interface GameQuestion {
    id: number;
    questionText: string;
    options: string[];
    correctAnswer: string;
    conceptFront: string;
    selectedOption: string | null;
    isCorrect: boolean | null;
  }
  const [isGameActive, setIsGameActive] = useState(false);
  const [selectedGame, setSelectedGame] = useState<"none" | "tower-defense" | "slime-merge">("none");
  const [showGamePickerModal, setShowGamePickerModal] = useState(false);
  const [gameQuestions, setGameQuestions] = useState<GameQuestion[]>([]);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [deckMode, setDeckMode] = useState<"script" | "skills" | "combined">("script");

  const handleStartSlimeMergeGame = (deckToUse?: Array<{ front: string; back: string }>) => {
    setActiveTab("warmup");
    setAnxietySubTab("games");
    setIsGameActive(true);
    setSelectedGame("slime-merge");
    setShowGamePickerModal(false);
  };

  const handleStartTowerDefenseGame = (deckToUse?: Array<{ front: string; back: string }>) => {
    const d = deckToUse || deck;
    if (!d || d.length === 0) return;
    setActiveTab("warmup");
    setAnxietySubTab("games");
    setIsGameActive(true);
    setSelectedGame("tower-defense");
    setShowGamePickerModal(false);
  };

  const handleOpenGamePicker = () => {
    setShowGamePickerModal(true);
  };

  const handleStartRevisionGame = (deckToUse?: Array<{ front: string; back: string }>) => {
    const d = deckToUse || deck;
    if (!d || d.length === 0) return;
    setShowGamePickerModal(true);
  };

  const handleSelectGameOption = (option: string) => {
    if (gameCompleted) return;
    
    const updatedQuestions = [...gameQuestions];
    const currentQ = updatedQuestions[currentGameIndex];
    if (!currentQ || currentQ.selectedOption !== null) return;
    
    currentQ.selectedOption = option;
    const isCorrect = option === currentQ.correctAnswer;
    currentQ.isCorrect = isCorrect;
    
    if (isCorrect) {
      setGameScore(prev => prev + 1);
      if (!masteredCards.includes(currentQ.conceptFront)) {
        setMasteredCards(prev => [...prev, currentQ.conceptFront]);
      }
    }
    
    setGameQuestions(updatedQuestions);
  };

  const handleNextGameQuestion = () => {
    if (currentGameIndex + 1 < gameQuestions.length) {
      setCurrentGameIndex(prev => prev + 1);
    } else {
      setGameCompleted(true);
    }
  };

  const handleExitGame = () => {
    setIsGameActive(false);
    setSelectedGame("none");
    setGameQuestions([]);
    setCurrentGameIndex(0);
    setGameCompleted(false);
  };

  const handleAnalyzeTedScript = async () => {
    if (!script || script.trim().length === 0) {
      setTedError("Please enter or paste your speech text first.");
      return;
    }
    setIsAnalyzingTed(true);
    setTedError(null);
    try {
      const res = await fetch("/api/analyze-ted-talk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script })
      });
      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }
      const data = await res.json();
      setTedAnalysis(data);
    } catch (err: any) {
      setTedError("Connected to offline backup engine. JunoAi generated a smart local TED analysis!");
      const words = script.trim().split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      setTedAnalysis({
        tedScore: Math.min(96, Math.max(72, 78 + Math.round(wordCount / 20))),
        speakerBadge: wordCount > 180 ? "Inspiring Storyteller" : "Thought Provoker",
        ideaWorthSpreading: {
          clarity: "Your speech centers on a compelling human-centered insight.",
          uniquenessScore: 88,
          coreIdeaSummary: "Small daily choices build compound positive change across entire communities."
        },
        narrativeArc: {
          hookRating: script.includes("?") || script.toLowerCase().includes("imagine") ? "Captivating Hook" : "Needs Storytelling Spark",
          emotionalResonance: "Connects with the audience through relatable curiosity and enthusiasm.",
          pacingFeedback: "Steady build-up from introductory mystery to core practical insight.",
          climaxStrength: "Strong climax where the main lesson is delivered."
        },
        rhetoricalPauses: [
          {
            phrase: words.slice(0, 12).join(" ") || "When we look closely at our world today...",
            suggestedPauseDuration: "2.5 Seconds Silence",
            why: "Creates an immediate sense of mystery and draws all eyes to the stage."
          },
          {
            phrase: "And that is why this core idea matters more now than ever before.",
            suggestedPauseDuration: "3 Seconds Silence",
            why: "Gives the room a moment to reflect on your core 'Idea Worth Spreading'."
          },
          {
            phrase: "Because when we choose to act together, nothing is impossible.",
            suggestedPauseDuration: "3 Seconds Silence",
            why: "Leaves the audience with an unforgettable emotional conclusion."
          }
        ],
        tedRecommendations: [
          "Open with a vivid 10-second personal moment or surprising question before stating facts.",
          "Vary your vocal pitch when delivering key takeaways to create a dynamic 'TED rhythm'.",
          "End with a clear, inspiring call to action that gives listeners a reason to care."
        ],
        improvedTedScript: `Imagine standing in a room where every single person is searching for the exact same answer. That answer is what brings us here today.\n\n${script}\n\n[PAUSE 3s]\n\nSo I leave you with one simple question: What will you choose to do with this idea today? Thank you.`
      });
    } finally {
      setIsAnalyzingTed(false);
    }
  };

  // Breathing Timer Effect for Anti-Anxiety Stage Warmup
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathingSeconds((prev) => {
          if (prev <= 1) {
            if (breathingPhase === "Inhale") {
              setBreathingPhase("Hold");
              return 7;
            } else if (breathingPhase === "Hold") {
              setBreathingPhase("Exhale");
              return 8;
            } else {
              setBreathingPhase("Inhale");
              setBreathingCyclesCount((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathingPhase]);

  const handleEvaluateQnaAnswer = async () => {
    if (!qnaUserAnswer.trim()) return;
    setIsEvaluatingQna(true);
    setQnaFeedback(null);

    const currentQnaItems = (analysis?.questions && analysis.questions.length > 0)
      ? analysis.questions.map((q, idx) => ({
          category: (["Clarification", "Challenge", "Deep Detail", "Future Impact"][idx % 4]) as "Clarification" | "Challenge" | "Deep Detail" | "Future Impact",
          badgeColor: ["bg-[#00F5FF]", "bg-[#FF6B35]", "bg-[#9B5DE5]", "bg-[#06D6A0]"][idx % 4],
          icon: ["🧐", "⚡", "🎓", "🚀"][idx % 4],
          question: q.question,
          whyAsked: `Expected query based on your presentation script.`,
          prepStrategy: "Use the PREP Method: State your main Point, explain your Reason, give an Example, and wrap up with your main Point.",
          modelAnswer: q.modelAnswer
        }))
      : DEFAULT_QNA_ITEMS;

    const activeQuestionObj = currentQnaItems[selectedQnaIndex] || currentQnaItems[0];
    try {
      const res = await fetch("/api/simulate-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: activeQuestionObj.question,
          answer: qnaUserAnswer,
          scriptContext: script
        })
      });
      if (!res.ok) throw new Error("Failed to evaluate answer.");
      const data = await res.json();
      setQnaFeedback(data);
    } catch (err) {
      const wordsCount = qnaUserAnswer.trim().split(/\s+/).length;
      const score = Math.min(5, Math.max(3, Math.floor(wordsCount / 12) + 2));
      setQnaFeedback({
        rating: score,
        feedbackText: wordsCount > 25 
          ? "Great explanation depth! You addressed the core point with clear arguments." 
          : "Direct answer! Adding a specific example or statistic will make your point even stronger.",
        strengths: "Spoke directly to the key point without straying off topic.",
        improvements: "Try using the PREP method (Point, Reason, Example, Point) for a crystal-clear structure.",
        modelAnswer: activeQuestionObj.modelAnswer
      });
    } finally {
      setIsEvaluatingQna(false);
    }
  };

  // Speech Voice Customization States
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);

  // Live Practice Recorder & Simulator States
  const [practiceMode, setPracticeMode] = useState<"recording" | "qna">("recording");
  const [recordMode, setRecordMode] = useState<"video" | "audio">("video");
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "paused" | "completed">("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [recordingFeedback, setRecordingFeedback] = useState<RecordingFeedback | null>(null);
  const [isAnalyzingRecording, setIsAnalyzingRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isMicAvailable, setIsMicAvailable] = useState(true);
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("user");
  const [hasActiveVideoTrack, setHasActiveVideoTrack] = useState<boolean>(false);
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [showPoseGuideOverlay, setShowPoseGuideOverlay] = useState(true);
  const [isIdleCameraPreviewActive, setIsIdleCameraPreviewActive] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // References for live recorder audio, camera video stream & speech recognition
  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const recordedVideoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const videoSamplerIntervalRef = useRef<any>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const telemetryCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const recordingTimeRef = useRef<number>(0);
  const transcriptCheckpointsRef = useRef<Array<{ timeSec: number; words: number }>>([]);
  const telemetryRef = useRef<{
    activeAudioTicks: number;
    silentAudioTicks: number;
    currentSilentStreakTicks: number;
    maxSilentStreakTicks: number;
    pauseCount: number;
    inPause: boolean;
    volumeSamples: number[];
    videoFrames: number;
    gestureActiveFrames: number;
    headStableFrames: number;
    eyeCenteredFrames: number;
    brightnessSum: number;
    staticHandStreak: number;
    timelineNotes: Array<{ time: string; label: string; detail: string; status: "good" | "improve" }>;
  }>({
    activeAudioTicks: 0,
    silentAudioTicks: 0,
    currentSilentStreakTicks: 0,
    maxSilentStreakTicks: 0,
    pauseCount: 0,
    inPause: false,
    volumeSamples: [],
    videoFrames: 0,
    gestureActiveFrames: 0,
    headStableFrames: 0,
    eyeCenteredFrames: 0,
    brightnessSum: 0,
    staticHandStreak: 0,
    timelineNotes: []
  });

  // Multi-tier resilient camera stream getter (supports Android Chrome, desktop & tablets)
  const obtainCameraStream = async (facing: "user" | "environment", withAudio: boolean): Promise<MediaStream> => {
    // Strategy 1: HD with explicit facingMode
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: withAudio,
      });
    } catch (err1) {
      console.warn("Strategy 1 (HD facingMode) failed, trying basic facingMode:", err1);
    }

    // Strategy 2: Basic video with facingMode
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: withAudio,
      });
    } catch (err2) {
      console.warn("Strategy 2 (Basic facingMode) failed, trying generic video:", err2);
    }

    // Strategy 3: Any video device allowed by browser
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: withAudio,
    });
  };

  // Robustly bind MediaStream to HTMLVideoElement (prevents black screen on Android Chrome & mobile WebKit)
  const bindStreamToVideo = (el: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!el) return;
    videoPreviewRef.current = el;

    if (!stream || stream.getVideoTracks().length === 0) {
      setHasActiveVideoTrack(false);
      setIsVideoPlaying(false);
      return;
    }

    // Crucial for mobile Chrome/WebKit: DOM properties MUST be set explicitly to allow inline autoplay
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    el.setAttribute("muted", "true");
    el.setAttribute("playsinline", "true");
    el.setAttribute("webkit-playsinline", "true");

    if (el.srcObject !== stream) {
      el.srcObject = stream;
    }

    const triggerPlay = () => {
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoPlaying(true);
            setHasActiveVideoTrack(true);
            setCameraErrorMessage(null);
          })
          .catch((err) => {
            console.warn("Video play() interrupted or blocked by browser gesture policy:", err);
          });
      }
    };

    el.onloadedmetadata = () => {
      triggerPlay();
    };

    triggerPlay();

    // Monitor track health
    const tracks = stream.getVideoTracks();
    if (tracks.length > 0) {
      setHasActiveVideoTrack(tracks[0].readyState === "live");
      tracks[0].onended = () => {
        setHasActiveVideoTrack(false);
        setIsVideoPlaying(false);
      };
      tracks[0].onmute = () => {
        setIsVideoPlaying(false);
      };
      tracks[0].onunmute = () => {
        setIsVideoPlaying(true);
        setHasActiveVideoTrack(true);
      };
    }
  };

  // Auto-attach camera media stream whenever video preview element mounts or stream updates
  useEffect(() => {
    if (videoPreviewRef.current && cameraStreamRef.current) {
      bindStreamToVideo(videoPreviewRef.current, cameraStreamRef.current);
    }
  }, [recordingState, recordMode, isIdleCameraPreviewActive, cameraFacingMode]);

  const startIdleCameraPreview = async (facing: "user" | "environment" = cameraFacingMode) => {
    try {
      setCameraErrorMessage(null);
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }

      const stream = await obtainCameraStream(facing, false);
      cameraStreamRef.current = stream;
      setIsCameraAvailable(true);
      setIsIdleCameraPreviewActive(true);
      setHasActiveVideoTrack(true);

      if (videoPreviewRef.current) {
        bindStreamToVideo(videoPreviewRef.current, stream);
      }
    } catch (err: any) {
      console.warn("Camera preview failed or permission denied:", err);
      setIsCameraAvailable(false);
      setHasActiveVideoTrack(false);
      const msg = err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
        ? "Camera access blocked. Tap the lock/tune icon in your browser address bar to allow camera access."
        : err.name === "NotFoundError" || err.name === "DevicesNotFoundError"
        ? "No camera found on this device. You can practice in Voice Only mode."
        : "Could not open camera. Please check your camera privacy permissions or try flipping camera.";
      setCameraErrorMessage(msg);
    }
  };

  const stopIdleCameraPreview = () => {
    if (cameraStreamRef.current && recordingState === "idle") {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setIsIdleCameraPreviewActive(false);
    setHasActiveVideoTrack(false);
    setIsVideoPlaying(false);
  };

  const toggleCameraFacingMode = async () => {
    const nextMode = cameraFacingMode === "user" ? "environment" : "user";
    setCameraFacingMode(nextMode);

    // If currently recording or previewing, restart stream with new facing mode
    if (cameraStreamRef.current && (recordingState === "recording" || isIdleCameraPreviewActive)) {
      try {
        const withAudio = recordingState === "recording";
        const newStream = await obtainCameraStream(nextMode, withAudio);

        // Stop old tracks
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach(t => t.stop());
        }

        cameraStreamRef.current = newStream;
        bindStreamToVideo(videoPreviewRef.current, newStream);
      } catch (err) {
        console.warn("Failed to switch camera facing mode:", err);
      }
    }
  };

  // Explicit Permission Re-Request Handler (helps users who accidentally tapped "Deny")
  const handleRequestCameraPermission = async () => {
    setIsRequestingPermission(true);
    setCameraErrorMessage(null);
    setRecordingError(null);

    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraErrorMessage("Camera & microphone APIs are unavailable in this browser context. Please use HTTPS or a modern browser.");
        return;
      }

      // Check Permissions API state if available to provide tailored guidance if browser permanently blocked it
      let camPermState: string = "prompt";
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const permRes = await navigator.permissions.query({ name: "camera" as PermissionName });
          camPermState = permRes.state;
        }
      } catch {}

      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }

      let stream: MediaStream | null = null;
      try {
        stream = await obtainCameraStream(cameraFacingMode, true);
        setIsCameraAvailable(true);
        setIsMicAvailable(true);
      } catch (bothErr: any) {
        // Fallback: try camera-only or mic-only if one of the two was denied/missing
        try {
          stream = await obtainCameraStream(cameraFacingMode, false);
          setIsCameraAvailable(true);
          setCameraErrorMessage("Camera permission granted, but microphone access is still blocked. Please allow microphone access in your browser bar.");
        } catch (camOnlyErr: any) {
          throw bothErr;
        }
      }

      if (stream) {
        cameraStreamRef.current = stream;
        setHasActiveVideoTrack(stream.getVideoTracks().length > 0);
        if (recordingState === "idle") {
          setIsIdleCameraPreviewActive(true);
        }
        if (videoPreviewRef.current) {
          bindStreamToVideo(videoPreviewRef.current, stream);
        }
      }
    } catch (err: any) {
      console.warn("Permission re-request failed:", err);
      setIsCameraAvailable(false);
      setHasActiveVideoTrack(false);
      const isDenied = err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError";
      setCameraErrorMessage(
        isDenied
          ? "Browser blocked the permission prompt because access was previously denied. Tap the lock/camera icon in your browser address bar, set Camera & Microphone to 'Allow', then tap 'Request Permission' again."
          : err?.name === "NotFoundError"
          ? "No camera device found. You can switch to Voice Only practice."
          : "Could not access camera/microphone. Check device privacy settings and tap 'Request Permission' again."
      );
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // Tracker / Saved presentation states
  const [savedPresentations, setSavedPresentations] = useState<SavedPresentation[]>([]);
  const [selectedSavedPresentationId, setSelectedSavedPresentationId] = useState<string | null>(null);

  // Top-level derived study deck
  const currentAnalysisForDeck = savedPresentations.find(p => p.id === selectedSavedPresentationId)?.analysis || analysis;
  
  const handleNotesFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setNotesText(content);
        try {
          localStorage.setItem("junoai_notes_text", content);
        } catch {}
        const inferredTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setNotesTitle(inferredTitle);
        try {
          localStorage.setItem("junoai_notes_title", inferredTitle);
        } catch {}
      }
    };
    reader.readAsText(file);
  };

  // Active text & title based on quizSource ("script" | "notes")
  const isScriptSleepSample = script.toLowerCase().includes("importance of getting enough sleep");
  const inferredScriptTitle = (!presentationTitle || presentationTitle === "The Importance of Getting Enough Sleep") && !isScriptSleepSample && script.trim().length > 0
    ? (script.split(/[.!?\n]/)[0]?.slice(0, 40) || "My Presentation")
    : (presentationTitle || "My Presentation");

  const activeContentText = quizSource === "notes" ? (notesText || "") : (script || "");
  const activeContentTitle = quizSource === "notes" ? (notesTitle || "Presentation Notes") : inferredScriptTitle;

  // Split content into sentences/points
  const contentSentences = activeContentText
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 12);

  const dynamicQuizDeck: Array<{ front: string; back: string }> = [];

  // If questions are present from analysis and quizSource is script, include them
  if (quizSource === "script" && currentAnalysisForDeck?.questions && currentAnalysisForDeck.questions.length > 0) {
    currentAnalysisForDeck.questions.forEach(q => {
      dynamicQuizDeck.push({
        front: `[Audience Challenge] ${q.question}`,
        back: q.modelAnswer
      });
    });
  }

  // Generate cards from actual sentences
  if (contentSentences.length > 0) {
    dynamicQuizDeck.push({
      front: `Opening Hook: How does '${activeContentTitle}' introduce its main subject?`,
      back: contentSentences[0]
    });
    for (let i = 1; i < contentSentences.length - 1; i++) {
      const sentence = contentSentences[i];
      const preview = sentence.length > 45 ? sentence.slice(0, 45) + "..." : sentence;
      dynamicQuizDeck.push({
        front: `Key Concept #${i + 1}: What does your ${quizSource === "notes" ? "notes" : "speech"} explain regarding "${preview}"?`,
        back: sentence
      });
    }
    if (contentSentences.length > 1) {
      dynamicQuizDeck.push({
        front: `Conclusion: What is the final memorable conclusion in '${activeContentTitle}'?`,
        back: contentSentences[contentSentences.length - 1]
      });
    }
  }

  // If analysis flashcards exist and source is script, include them
  if (quizSource === "script" && currentAnalysisForDeck?.flashcards && currentAnalysisForDeck.flashcards.length > 0) {
    currentAnalysisForDeck.flashcards.forEach(fc => {
      if (!dynamicQuizDeck.some(c => c.front.toLowerCase() === fc.front.toLowerCase())) {
        dynamicQuizDeck.push({
          front: `Key Fact: ${fc.front}`,
          back: fc.back
        });
      }
    });
  }

  // Fill in robust thesis and defense questions derived from the actual content
  if (dynamicQuizDeck.length < 6) {
    dynamicQuizDeck.push({
      front: `Central Thesis: What is the core argument demonstrated by '${activeContentTitle}'?`,
      back: contentSentences[0] || `The presentation details verified insights and evidence regarding ${activeContentTitle}.`
    });
    dynamicQuizDeck.push({
      front: `Counter-Argument Defense: How should you defend '${activeContentTitle}' if someone challenges it?`,
      back: "Acknowledge their counter-point with courtesy, cite the evidence, and explain why the research holds."
    });
    dynamicQuizDeck.push({
      front: `Audience Relevance: Why does '${activeContentTitle}' matter for listeners?`,
      back: "It equips listeners with practical, verified knowledge that solves problems."
    });
    dynamicQuizDeck.push({
      front: `Supporting Evidence: What primary fact or observation does '${activeContentTitle}' highlight?`,
      back: contentSentences[1] || `The research provides supporting data and context for ${activeContentTitle}.`
    });
  }

  const deck = dynamicQuizDeck.length > 0
    ? [...dynamicQuizDeck, ...customFlashcards]
    : [
        {
          front: `Core Thesis: What is the primary focus of '${activeContentTitle}'?`,
          back: activeContentText || `Add content to your ${quizSource} to test your knowledge!`
        },
        ...customFlashcards
      ];

  // Diagnostic Mode States
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showQuickTips, setShowQuickTips] = useState(false);
  const [micLevels, setMicLevels] = useState<number[]>([15, 15, 15, 15, 15, 15, 15, 15]);
  const [diagnosticLogs, setDiagnosticLogs] = useState<any[]>([]);
  const [diagnosticStatus, setDiagnosticStatus] = useState<string>("");
  const [isKeyConfigured, setIsKeyConfigured] = useState<boolean>(false);
  const [isFetchingDiagnostics, setIsFetchingDiagnostics] = useState(false);

  const fetchDiagnostics = async () => {
    try {
      setIsFetchingDiagnostics(true);
      const res = await fetch("/api/diagnostics");
      if (res.ok) {
        const data = await res.json();
        setDiagnosticStatus(data.status || "Unknown");
        setDiagnosticLogs(data.logs || []);
        setIsKeyConfigured(data.keyConfigured);
      }
    } catch (err) {
      console.error("Error fetching diagnostics:", err);
    } finally {
      setIsFetchingDiagnostics(false);
    }
  };

  useEffect(() => {
    if (showDiagnostics) {
      fetchDiagnostics();
      const interval = setInterval(fetchDiagnostics, 4000);
      return () => clearInterval(interval);
    }
  }, [showDiagnostics]);

  // Initialize saved presentations list and custom flashcards from localStorage
  useEffect(() => {
    const data = localStorage.getItem("junoai_presentations") || localStorage.getItem("presentai_presentations") || localStorage.getItem("ai_coach_presentations");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setSavedPresentations(parsed);
      } catch (e) {
        console.error("Error parsing saved presentations", e);
      }
    }

    const flashcardsData = localStorage.getItem("junoai_custom_flashcards") || localStorage.getItem("presentai_custom_flashcards") || localStorage.getItem("ai_coach_custom_flashcards");
    if (flashcardsData) {
      try {
        const parsed = JSON.parse(flashcardsData);
        setCustomFlashcards(parsed);
      } catch (e) {
        console.error("Error parsing custom flashcards", e);
      }
    }

    const masteredData = localStorage.getItem("junoai_mastered_cards") || localStorage.getItem("presentai_mastered_cards") || localStorage.getItem("ai_coach_mastered_cards");
    if (masteredData) {
      try {
        const parsed = JSON.parse(masteredData);
        setMasteredCards(parsed);
      } catch (e) {
        console.error("Error parsing mastered cards", e);
      }
    }
  }, []);

  // Initialize Speech Synthesis voices
  useEffect(() => {
    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0 && !selectedVoiceName) {
          // Default selection strategy: find Google, Microsoft or English voices
          const defaultVoice = availableVoices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) ||
                               availableVoices.find(v => v.lang.startsWith("en")) ||
                               availableVoices[0];
          if (defaultVoice) {
            setSelectedVoiceName(defaultVoice.name);
          }
        }
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, [selectedVoiceName]);

  const cleanupAudioAnalyser = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoSamplerIntervalRef.current) {
      clearInterval(videoSamplerIntervalRef.current);
      videoSamplerIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== "closed") {
          audioContextRef.current.close();
        }
      } catch (e) {
        console.warn("Error closing audio context:", e);
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  // Cleanup recording timers and camera streams on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (videoSamplerIntervalRef.current) clearInterval(videoSamplerIntervalRef.current);
      cleanupAudioAnalyser();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
    };
  }, []);

  // Save new run
  const savePresentationResult = (titleToUse: string, analysisResult: ScriptAnalysisResult) => {
    const newRecord: SavedPresentation = {
      id: Math.random().toString(36).substring(2, 9),
      title: titleToUse || `Presentation for ${targetYear}`,
      targetYear,
      script,
      timestamp: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      analysis: analysisResult
    };

    const updated = [newRecord, ...savedPresentations];
    setSavedPresentations(updated);
    localStorage.setItem("junoai_presentations", JSON.stringify(updated));
    setSelectedSavedPresentationId(newRecord.id);
  };

  const deleteSavedPresentation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPresentations.filter(p => p.id !== id);
    setSavedPresentations(updated);
    localStorage.setItem("junoai_presentations", JSON.stringify(updated));
    if (selectedSavedPresentationId === id) {
      setSelectedSavedPresentationId(null);
    }
  };

  // Run script analysis
  const handleAnalyzeScript = async () => {
    if (!script.trim()) {
      setScriptError("Please paste or type your presentation script first!");
      return;
    }
    setIsAnalyzing(true);
    setScriptError(null);
    try {
      const res = await fetch("/api/analyze-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          targetYear,
          promptExtra: `Persuasive presentation format: ${isPersuasive ? "YES" : "NO"}. Custom focus: ${extraPrompt}`
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Analysis failed.");
      }
      const data: ScriptAnalysisResult = await res.json();
      setAnalysis(data);
      savePresentationResult(presentationTitle || "Presentation Study", data);
      
      // Auto-set the first question for practice simulation if generated
      if (data.questions && data.questions.length > 0) {
        setSelectedQuestion(data.questions[0]);
        setPracticeAnswer("");
        setPracticeFeedback(null);
      }
    } catch (e: any) {
      setScriptError(mapTechnicalErrorToFriendly(e.message || ""));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run slide content check (supports whole slide deck or single slide)
  const handleCheckSlides = async (contentToAnalyze?: string) => {
    const textToUse = typeof contentToAnalyze === "string" ? contentToAnalyze : slideText;
    if (!textToUse.trim()) {
      setSlideError("Please paste your slide text or upload a presentation file!");
      return;
    }
    setSlideText(textToUse);
    setIsAnalyzingSlides(true);
    setSlideError(null);
    try {
      const res = await fetch("/api/check-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideText: textToUse })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to analyze slides.");
      }
      const data: SlideAnalysisResult = await res.json();
      setSlideAnalysis(data);
    } catch (e: any) {
      setSlideError(mapTechnicalErrorToFriendly(e.message || ""));
    } finally {
      setIsAnalyzingSlides(false);
    }
  };

  // Submit Practice Simulator Response
  const handleSubmitPracticeAnswer = async () => {
    if (!selectedQuestion) return;
    if (!practiceAnswer.trim()) {
      setPracticeError("Please type an answer to the audience question!");
      return;
    }
    setIsSubmittingAnswer(true);
    setPracticeError(null);
    try {
      const res = await fetch("/api/simulate-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: selectedQuestion.question,
          answer: practiceAnswer,
          scriptContext: script
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit answer.");
      }
      const data: PracticeFeedback = await res.json();
      setPracticeFeedback(data);
    } catch (e: any) {
      setPracticeError(mapTechnicalErrorToFriendly(e.message || ""));
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Helper for estimated word count and speaking speeds
  const getWordCount = () => {
    return script.trim() ? script.trim().split(/\s+/).length : 0;
  };

  const getEstimatedTimes = () => {
    const wc = getWordCount();
    if (wc === 0) return { slow: "0:00", normal: "0:00", fast: "0:00" };
    
    // Slow: 110 wpm, Normal: 130 wpm, Fast: 150 wpm
    const calcTime = (wpm: number) => {
      const mins = wc / wpm;
      const minutes = Math.floor(mins);
      const seconds = Math.round((mins - minutes) * 60);
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    return {
      slow: calcTime(110),
      normal: calcTime(130),
      fast: calcTime(150)
    };
  };

  const times = getEstimatedTimes();
  const wordCount = getWordCount();

  // File Upload Handlers (TXT files)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setScript(text);
        if (file.name) {
          // Auto fill title from file name without extension
          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
          setPresentationTitle(cleanName);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setScript(text);
        if (file.name) {
          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
          setPresentationTitle(cleanName);
        }
      }
    };
    reader.readAsText(file);
  };

  // Helper to format recorder seconds into MM:SS
  const formatRecordingDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  // Start real-time webcam & vocal telemetry sampler (runs at ~2Hz during recording)
  const startTelemetrySampling = () => {
    if (videoSamplerIntervalRef.current) clearInterval(videoSamplerIntervalRef.current);
    prevFrameDataRef.current = null;
    if (!telemetryCanvasRef.current && typeof document !== "undefined") {
      const c = document.createElement("canvas");
      c.width = 96;
      c.height = 54;
      telemetryCanvasRef.current = c;
    }

    videoSamplerIntervalRef.current = setInterval(() => {
      const tel = telemetryRef.current;
      const elapsedSec = recordingTimeRef.current;
      const timeLabel = formatRecordingDuration(elapsedSec);

      // 1. Sample Web Audio volume if analyser is connected
      if (analyserRef.current) {
        const len = analyserRef.current.frequencyBinCount;
        const arr = new Uint8Array(len);
        analyserRef.current.getByteFrequencyData(arr);
        const avgBin = arr.reduce((a, b) => a + b, 0) / Math.max(1, len);
        const normPct = Math.min(100, Math.round((avgBin / 180) * 100));
        tel.volumeSamples.push(normPct);

        if (avgBin > 12) {
          tel.activeAudioTicks++;
          tel.currentSilentStreakTicks = 0;
          tel.inPause = false;
        } else {
          tel.silentAudioTicks++;
          tel.currentSilentStreakTicks++;
          if (tel.currentSilentStreakTicks > tel.maxSilentStreakTicks) {
            tel.maxSilentStreakTicks = tel.currentSilentStreakTicks;
          }
          if (!tel.inPause && tel.currentSilentStreakTicks >= 3) {
            tel.inPause = true;
            tel.pauseCount++;
          }
          if (tel.currentSilentStreakTicks === 10 && tel.timelineNotes.length < 8) {
            tel.timelineNotes.push({
              time: timeLabel,
              label: "Long Pause",
              detail: "Detected 5+ seconds of vocal silence—keep momentum flowing or transition smoothly.",
              status: "improve"
            });
          }
        }
      }

      // 2. Sample Video Frame luminance & motion across Head/Eye zone vs Gesture zone
      const vid = videoPreviewRef.current;
      const canvas = telemetryCanvasRef.current;
      if (recordMode === "video" && vid && canvas && vid.readyState >= 2 && vid.videoWidth > 0) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          const prev = prevFrameDataRef.current;

          let totalBright = 0;
          let eyeZoneBright = 0;
          let eyeZonePixels = 0;
          let headDiffSum = 0;
          let headPixels = 0;
          let gestureDiffSum = 0;
          let gesturePixels = 0;

          const w = canvas.width;
          const h = canvas.height;
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const i = (y * w + x) * 4;
              const lum = 0.299 * frame[i] + 0.587 * frame[i + 1] + 0.114 * frame[i + 2];
              totalBright += lum;

              const inHeadZone = x >= w * 0.3 && x <= w * 0.7 && y >= h * 0.08 && y <= h * 0.45;
              const inGestureZone = y >= h * 0.48 || x < w * 0.25 || x > w * 0.75;

              if (inHeadZone) {
                eyeZoneBright += lum;
                eyeZonePixels++;
              }

              if (prev) {
                const prevLum = 0.299 * prev[i] + 0.587 * prev[i + 1] + 0.114 * prev[i + 2];
                const diff = Math.abs(lum - prevLum);
                if (inHeadZone) {
                  headDiffSum += diff;
                  headPixels++;
                } else if (inGestureZone) {
                  gestureDiffSum += diff;
                  gesturePixels++;
                }
              }
            }
          }

          const avgFrameBright = totalBright / (w * h);
          tel.videoFrames++;
          tel.brightnessSum += avgFrameBright;

          // Eye-zone presence check (subject brightness/contrast in upper-center eye line)
          const eyeAvg = eyeZoneBright / Math.max(1, eyeZonePixels);
          if (eyeAvg > 35 && Math.abs(eyeAvg - avgFrameBright) >= 3) {
            tel.eyeCenteredFrames++;
          }

          if (prev) {
            const headDiffAvg = headDiffSum / Math.max(1, headPixels);
            const gestureDiffAvg = gestureDiffSum / Math.max(1, gesturePixels);

            if (headDiffAvg < 14) {
              tel.headStableFrames++;
            }
            if (gestureDiffAvg >= 5.5) {
              tel.gestureActiveFrames++;
              tel.staticHandStreak = 0;
              if (tel.gestureActiveFrames === 4 && tel.timelineNotes.length < 8) {
                tel.timelineNotes.push({
                  time: timeLabel,
                  label: "Active Gestures",
                  detail: "Natural hand and upper-body movement detected during delivery.",
                  status: "good"
                });
              }
            } else {
              tel.staticHandStreak++;
              if (tel.staticHandStreak === 14 && tel.timelineNotes.length < 8) {
                tel.timelineNotes.push({
                  time: timeLabel,
                  label: "Static Hands",
                  detail: "Minimal hand/arm movement detected for 7+ seconds—use open gestures to emphasize points.",
                  status: "improve"
                });
              }
            }
          }

          prevFrameDataRef.current = new Uint8ClampedArray(frame);
        }
      }
    }, 500);
  };

  const buildTelemetrySummary = (durationSeconds: number, actualTranscript: string): VideoTelemetrySummary => {
    const tel = telemetryRef.current;
    const totalAudioTicks = Math.max(1, tel.activeAudioTicks + tel.silentAudioTicks);
    const activeRatio = Math.round((tel.activeAudioTicks / totalAudioTicks) * 100);
    const activeSeconds = Math.round((activeRatio / 100) * durationSeconds);
    const silenceSeconds = Math.max(0, durationSeconds - activeSeconds);

    const avgVol = tel.volumeSamples.length > 0
      ? Math.round(tel.volumeSamples.reduce((a, b) => a + b, 0) / tel.volumeSamples.length)
      : 0;
    const minVol = tel.volumeSamples.length > 0 ? Math.min(...tel.volumeSamples) : 0;
    const maxVol = tel.volumeSamples.length > 0 ? Math.max(...tel.volumeSamples) : 0;
    const quietMoments = tel.volumeSamples.filter((v) => v < 10).length;

    const vFrames = Math.max(1, tel.videoFrames);
    const avgBright = Math.round(tel.brightnessSum / vFrames);
    const lightingQuality: "Dark" | "Balanced" | "Bright" =
      avgBright < 70 ? "Dark" : avgBright > 210 ? "Bright" : "Balanced";

    const gesturePct = tel.videoFrames > 1 ? Math.round((tel.gestureActiveFrames / (tel.videoFrames - 1)) * 100) : 0;
    const headStabilityPct = tel.videoFrames > 1 ? Math.round((tel.headStableFrames / (tel.videoFrames - 1)) * 100) : 80;
    const eyeCenteredPct = tel.videoFrames > 0 ? Math.round((tel.eyeCenteredFrames / vFrames) * 100) : 75;

    // Script keyword coverage
    const stopWords = new Set(["about", "above", "after", "again", "against", "because", "before", "being", "below", "between", "could", "every", "first", "going", "great", "having", "hello", "morning", "other", "should", "since", "still", "thank", "their", "there", "these", "thing", "think", "those", "today", "under", "using", "where", "which", "while", "would", "everyone", "really"]);
    const scriptKeywords: string[] = Array.from(new Set<string>(
      (script.toLowerCase().match(/\b[a-z]{5,}\b/g) || []).filter((w: string) => !stopWords.has(w))
    )).slice(0, 14);
    const spokenLower = actualTranscript.toLowerCase();
    const matchedKeywords = scriptKeywords.filter((kw) => spokenLower.includes(kw));
    const missedKeywords = scriptKeywords.filter((kw) => !spokenLower.includes(kw));
    const scriptCoveragePct = scriptKeywords.length > 0
      ? Math.round((matchedKeywords.length / scriptKeywords.length) * 100)
      : (actualTranscript.split(/\s+/).filter(Boolean).length >= 8 ? 80 : 0);

    // First half vs second half WPM from speech recognition checkpoints
    const totalWords = actualTranscript.split(/\s+/).filter(Boolean).length;
    const halfTime = durationSeconds / 2;
    const midCheckpoint = transcriptCheckpointsRef.current.find((c) => c.timeSec >= halfTime);
    const firstHalfWords = midCheckpoint ? midCheckpoint.words : Math.round(totalWords / 2);
    const secondHalfWords = Math.max(0, totalWords - firstHalfWords);
    const halfMinutes = Math.max(0.05, halfTime / 60);
    const firstHalfWpm = totalWords > 0 ? Math.round(firstHalfWords / halfMinutes) : 0;
    const secondHalfWpm = totalWords > 0 ? Math.round(secondHalfWords / halfMinutes) : 0;

    return {
      activeSpeakingSeconds: activeSeconds,
      silenceSeconds,
      speakingRatioPct: tel.volumeSamples.length > 0 ? activeRatio : (totalWords >= 8 ? 70 : 0),
      pauseCount: tel.pauseCount,
      longestPauseSeconds: Number((tel.maxSilentStreakTicks * 0.5).toFixed(1)),
      avgVolumePct: avgVol,
      volumeVariationPct: Math.max(0, maxVol - minVol),
      quietMoments,
      gestureActivityPct: recordMode === "video" ? gesturePct : 0,
      headStabilityPct: recordMode === "video" ? headStabilityPct : 85,
      eyeZoneCenteredPct: recordMode === "video" ? eyeCenteredPct : 80,
      lightingQuality,
      avgBrightness: avgBright || 135,
      scriptCoveragePct,
      matchedKeywords,
      missedKeywords,
      firstHalfWpm,
      secondHalfWpm,
      timelineNotes: tel.timelineNotes
    };
  };

  // Live Spoken Recording Practice Handlers
  const startPracticeRecording = async () => {
    cleanupAudioAnalyser();
    setRecordingError(null);
    setSpokenTranscript("");
    setRecordingFeedback(null);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    transcriptCheckpointsRef.current = [];
    telemetryRef.current = {
      activeAudioTicks: 0,
      silentAudioTicks: 0,
      currentSilentStreakTicks: 0,
      maxSilentStreakTicks: 0,
      pauseCount: 0,
      inPause: false,
      volumeSamples: [],
      videoFrames: 0,
      gestureActiveFrames: 0,
      headStableFrames: 0,
      eyeCenteredFrames: 0,
      brightnessSum: 0,
      staticHandStreak: 0,
      timelineNotes: []
    };
    if (recordedVideoUrl) {
      try {
        URL.revokeObjectURL(recordedVideoUrl);
      } catch (e) {}
    }
    setRecordedVideoUrl(null);
    audioChunksRef.current = [];
    setMicLevels([15, 15, 15, 15, 15, 15, 15, 15]);

    // Initialize Speech Recognition if browser supports it
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (event: any) => {
          let fullSpoken = "";
          for (let i = 0; i < event.results.length; ++i) {
            fullSpoken += event.results[i][0].transcript + " ";
          }
          if (fullSpoken.trim()) {
            const trimmed = fullSpoken.trim();
            setSpokenTranscript(trimmed);
            transcriptCheckpointsRef.current.push({
              timeSec: recordingTimeRef.current,
              words: trimmed.split(/\s+/).filter(Boolean).length
            });
          }
        };

        rec.onerror = (e: any) => {
          console.warn("Speech recognition error:", e);
        };

        rec.onend = () => {
          if (recordingState === "recording" && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {}
          }
        };

        recognitionRef.current = rec;
      } catch (err) {
        console.warn("Speech recognition initialization failed:", err);
      }
    }

    // Stop idle camera preview if active before starting recording
    if (isIdleCameraPreviewActive) {
      stopIdleCameraPreview();
    }

    // Capture camera video + mic stream or fallback to audio
    try {
      let stream: MediaStream;
      if (recordMode === "video") {
        try {
          stream = await obtainCameraStream(cameraFacingMode, true);
          setIsCameraAvailable(true);
          setHasActiveVideoTrack(stream.getVideoTracks().length > 0);
          setCameraErrorMessage(null);
        } catch (videoErr: any) {
          console.warn("Camera stream acquisition failed:", videoErr);
          setIsCameraAvailable(false);
          setHasActiveVideoTrack(false);
          const msg = videoErr?.name === "NotAllowedError" || videoErr?.name === "PermissionDeniedError"
            ? "Camera access blocked. Tap 'Request Permission' below or allow camera access in your browser bar."
            : "Camera not detected. You can switch to Voice Only mode or request permission again.";
          setCameraErrorMessage(msg);
          // Fall back to microphone so student's practice timer isn't completely blocked
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      cameraStreamRef.current = stream;
      setIsMicAvailable(true);

      // Connect video element if video stream tracks exist
      if (videoPreviewRef.current && stream.getVideoTracks().length > 0) {
        bindStreamToVideo(videoPreviewRef.current, stream);
      }

      let options: MediaRecorderOptions = {};
      if (recordMode === "video" && typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
          options = { mimeType: "video/webm;codecs=vp8,opus" };
        } else if (MediaRecorder.isTypeSupported("video/mp4")) {
          options = { mimeType: "video/mp4" };
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const type = mediaRecorder.mimeType || (recordMode === "video" ? "video/webm" : "audio/webm");
          const blob = new Blob(audioChunksRef.current, { type });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
        }
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach((track) => track.stop());
          cameraStreamRef.current = null;
        }
      };

      mediaRecorder.start(1000);
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Initialize Web Audio API Analyser for Live Oscilloscope / Wave
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32; // Small size for responsive, high-level volume indicators
        source.connect(analyser);
        analyserRef.current = analyser;
        audioContextRef.current = audioCtx;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (analyserRef.current && mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            analyserRef.current.getByteFrequencyData(dataArray);
            const newLevels = Array.from({ length: 8 }, (_, idx) => {
              const sampleIdx = Math.floor((idx / 8) * bufferLength);
              const val = dataArray[sampleIdx] || 0;
              return Math.max(15, Math.min(100, (val / 255) * 100));
            });
            setMicLevels(newLevels);
            animationFrameRef.current = requestAnimationFrame(updateVolume);
          } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
            setMicLevels([15, 15, 15, 15, 15, 15, 15, 15]);
            animationFrameRef.current = requestAnimationFrame(updateVolume);
          } else {
            animationFrameRef.current = null;
          }
        };

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      } catch (audioErr) {
        console.warn("Failed to initialize live voice visualization analyser:", audioErr);
      }

      setRecordingState("recording");
      startTelemetrySampling();
      timerRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn("Microphone/Camera blocked or error. Running in simulated voice timer mode:", err);
      setIsMicAvailable(false);
      setIsCameraAvailable(false);
      setCameraErrorMessage("Camera or microphone permission was denied. Tap 'Request Permission' to grant access again.");
      setRecordingState("recording");
      startTelemetrySampling();
      timerRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const pausePracticeRecording = () => {
    if (recordingState === "recording") {
      setRecordingState("paused");
      if (timerRef.current) clearInterval(timerRef.current);
      if (videoSamplerIntervalRef.current) {
        clearInterval(videoSamplerIntervalRef.current);
        videoSamplerIntervalRef.current = null;
      }
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.pause();
        }
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      } catch (e) {
        console.warn("Pause recording exception:", e);
      }
    }
  };

  const resumePracticeRecording = () => {
    if (recordingState === "paused") {
      setRecordingState("recording");
      startTelemetrySampling();
      timerRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
          mediaRecorderRef.current.resume();
        }
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }

        // Restart Web Audio loop
        if (analyserRef.current && animationFrameRef.current === null) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          const updateVolume = () => {
            if (analyserRef.current && mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              analyserRef.current.getByteFrequencyData(dataArray);
              const newLevels = Array.from({ length: 8 }, (_, idx) => {
                const sampleIdx = Math.floor((idx / 8) * bufferLength);
                const val = dataArray[sampleIdx] || 0;
                return Math.max(15, Math.min(100, (val / 255) * 100));
              });
              setMicLevels(newLevels);
              animationFrameRef.current = requestAnimationFrame(updateVolume);
            } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
              setMicLevels([15, 15, 15, 15, 15, 15, 15, 15]);
              animationFrameRef.current = requestAnimationFrame(updateVolume);
            } else {
              animationFrameRef.current = null;
            }
          };
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        }
      } catch (e) {
        console.warn("Resume recording exception:", e);
      }
    }
  };

  const stopPracticeRecording = () => {
    if (recordingState === "recording" || recordingState === "paused") {
      setRecordingState("completed");
      if (timerRef.current) clearInterval(timerRef.current);
      if (videoSamplerIntervalRef.current) {
        clearInterval(videoSamplerIntervalRef.current);
        videoSamplerIntervalRef.current = null;
      }
      try {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
        if (recognitionRef.current) {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        }
      } catch (e) {
        console.warn("Stop recording exception:", e);
      }
    }
  };

  const handleAnalyzeRecording = async () => {
    setIsAnalyzingRecording(true);
    setRecordingError(null);

    // Truly pass the spoken transcript that was detected (do NOT substitute written script)
    const actualTranscript = spokenTranscript.trim();
    const measuredTelemetry = buildTelemetrySummary(recordingTime, actualTranscript);

    try {
      const response = await fetch("/api/analyze-recording", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: presentationTitle || "My Presentation",
          script: script || "",
          durationSeconds: recordingTime,
          spokenTranscript: actualTranscript,
          recordMode: recordMode,
          telemetry: measuredTelemetry
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze practice recording.");
      }

      const data: RecordingFeedback = await response.json();
      setRecordingFeedback(data);

      // Create a pseudo analysis result to insert into local state tracker
      const pseudoAnalysis: ScriptAnalysisResult = {
        scores: {
          confidence: data.overallPacingScore,
          clarity: data.overallPacingScore >= 70 ? data.overallPacingScore - 4 : data.overallPacingScore,
          engagement: data.overallPacingScore >= 70 ? Math.min(100, data.overallPacingScore + 4) : data.overallPacingScore,
          vocabulary: data.overallPacingScore >= 60 ? 80 : 40,
          organization: data.overallPacingScore >= 60 ? 80 : 40,
          professionalism: data.overallPacingScore >= 60 ? 80 : 40,
          overall: data.overallPacingScore
        },
        readiness: data.overallPacingScore >= 90 
          ? "Outstanding" 
          : data.overallPacingScore >= 75 
          ? "Presentation Ready" 
          : data.overallPacingScore >= 50 
          ? "Almost Ready" 
          : "Needs More Practice",
        difficulty: {
          suitableYears: [targetYear],
          analysis: `Live Recording Practice run for ${presentationTitle || "Presentation"}. Speech time: ${formatRecordingDuration(recordingTime)}. Speed: ${data.wordsPerMinute} WPM.`,
          suggestions: data.generalFeedback
        },
        scriptAnalysis: {
          grammarSpelling: "Recorded spoken oral mechanics.",
          clarity: data.clarity,
          vocabLevel: "Matches spoken delivery.",
          variety: "Recorded vocal dynamics.",
          organization: "Spoken flow analysis."
        },
        introAnalysis: {
          rating: "Live run",
          evaluation: data.partsToImprove?.[0] || "Hook delivery assessed.",
          alternatives: []
        },
        conclusionAnalysis: {
          rating: "Live run",
          evaluation: data.generalFeedback,
          alternatives: []
        },
        attentionSpan: {
          longParagraphs: [],
          repetitiveExplanations: [],
          boringSections: []
        },
        speakingTips: {
          eyeContact: data.eyeContactFeedback || "Look directly at the camera lens.",
          voiceProjection: data.confidence || "Maintain clear vocal volume.",
          bodyLanguage: data.postureFeedback || "Keep posture relaxed and upright.",
          handGestures: data.handGesturesFeedback || "Use open gestures to emphasize points.",
          confidence: data.confidence || "Maintain vocal confidence.",
          pacing: data.speakingSpeedStatus === "Great Pacing" ? "Great pacing and rhythm." : `Speaking pace is ${data.speakingSpeedStatus.toLowerCase()}.`
        },
        visualAids: [],
        fillerWords: {
          detected: Object.keys(data.fillerWordsCount || {}).filter(k => (data.fillerWordsCount as any)[k] > 0),
          analysis: data.fillerWordsAnalysis,
          fluencyTips: "Try to pause silently instead of speaking placeholders."
        },
        persuasiveness: {
          isPersuasive: isPersuasive,
          argumentStrength: "Spoken persuasion checked.",
          weakEvidence: "",
          suggestions: ""
        },
        confidenceBuilder: {
          positiveTips: data.partsToImprove || [],
          lastMinuteReminders: ["Focus on breathing", "Stand with shoulders back"],
          checklist: ["Check slide visuals", "Rehearse difficult keywords"]
        },
        teacherMode: {
          gradeEstimate: data.overallPacingScore >= 90 ? "A" : data.overallPacingScore >= 80 ? "B+" : data.overallPacingScore >= 60 ? "B" : "Needs Practice",
          strengths: data.clarity,
          improvements: data.fillerWordsAnalysis,
          nextSteps: (data.partsToImprove || []).join("\n")
        },
        questions: (data.suggestedQuestions || []).map(q => ({
          difficulty: "Medium" as const,
          question: q,
          modelAnswer: "Address the question directly using key facts from your presentation."
        })),
        flashcards: [],
        improvedScript: script || actualTranscript
      };

      const newSavedRun: SavedPresentation = {
        id: "practice_run_" + Date.now(),
        title: `${presentationTitle} (Practice Run 🎤)`,
        targetYear: targetYear,
        script: script || actualTranscript,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date().toLocaleDateString(),
        analysis: pseudoAnalysis
      };

      const updated = [newSavedRun, ...savedPresentations];
      setSavedPresentations(updated);
      localStorage.setItem("junoai_presentations", JSON.stringify(updated));

    } catch (err: any) {
      console.error("Recording analysis exception:", err);
      setRecordingError(mapTechnicalErrorToFriendly(err.message || ""));
    } finally {
      setIsAnalyzingRecording(false);
    }
  };

  const handleAddFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardFront.trim() || !newCardBack.trim()) return;
    const newCard = { front: newCardFront.trim(), back: newCardBack.trim() };
    const updated = [...customFlashcards, newCard];
    setCustomFlashcards(updated);
    localStorage.setItem("junoai_custom_flashcards", JSON.stringify(updated));
    setNewCardFront("");
    setNewCardBack("");
    setActiveCardIndex(updated.length - 1);
    setIsCardFlipped(false);
  };

  const handleDeleteFlashcard = (index: number) => {
    const updated = customFlashcards.filter((_, i) => i !== index);
    setCustomFlashcards(updated);
    localStorage.setItem("junoai_custom_flashcards", JSON.stringify(updated));
    if (activeCardIndex >= updated.length && updated.length > 0) {
      setActiveCardIndex(updated.length - 1);
    }
    setIsCardFlipped(false);
  };

  const toggleMastery = (cardFront: string) => {
    setMasteredCards(prev => {
      const updated = prev.includes(cardFront) 
        ? prev.filter(c => c !== cardFront) 
        : [...prev, cardFront];
      localStorage.setItem("junoai_mastered_cards", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSpeakCard = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      if (selectedVoiceName) {
        const foundVoice = voices.find(v => v.name === selectedVoiceName);
        if (foundVoice) {
          utterance.voice = foundVoice;
        }
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === "dark_neon" 
        ? "theme-dark-neon bg-[#060A08] text-[#E6FFF0]" 
        : theme === "medal"
        ? "theme-medal bg-[#0B0E14] text-[#F8FAFC]"
        : "bg-[#FFFDF7] text-slate-900"
    } font-sans pb-16 relative overflow-x-hidden ${textSizeLarge ? "text-base lg:text-lg" : "text-sm"}`}>
      
      {/* Subtle Ambient Background Geometry */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-60">
        {theme === "dark_neon" ? (
          <>
            <div className="absolute top-[12%] left-[-6%] w-72 h-72 rounded-full bg-[#00FF66]/10 border-4 border-dashed border-[#00FF66]/25 hidden xl:block" />
            <div className="absolute top-[50%] right-[-10%] w-96 h-96 rounded-full bg-[#00F5FF]/10 border-4 border-[#00FF66]/15 hidden xl:block" />
          </>
        ) : theme === "medal" ? (
          <>
            <div className="absolute top-[12%] left-[-6%] w-72 h-72 rounded-full bg-[#D4AF37]/10 border-4 border-dashed border-[#D4AF37]/25 hidden xl:block" />
            <div className="absolute top-[50%] right-[-10%] w-96 h-96 rounded-full bg-[#CD7F32]/10 border-4 border-[#D4AF37]/20 hidden xl:block" />
          </>
        ) : (
          <>
            <div className="absolute top-[12%] left-[-6%] w-72 h-72 rounded-full bg-[#FFD166]/20 border-4 border-dashed border-black/10 hidden xl:block" />
            <div className="absolute top-[50%] right-[-10%] w-96 h-96 rounded-full bg-[#06D6A0]/12 border-4 border-black/5 hidden xl:block" />
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 relative z-10">

        {/* Compact Top Navigation Shell */}
        <header className="flex flex-col bg-white p-4 sm:p-5 rounded-2xl border-3 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] mb-6 gap-3.5 relative">
          {/* Top Row: Brand + Quick Return + Theme & Accessibility */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img 
                  src={theme === "default" ? robotGraduateLogo : cyberGreenLogo} 
                  alt="JunoAI Mascot" 
                  referrerPolicy="no-referrer"
                  className={`w-11 h-11 rounded-xl border-2 object-cover cursor-pointer hover:scale-105 transition-all ${
                    theme === "medal"
                      ? "border-[#D4AF37] shadow-[3px_3px_0px_#8C6212] ring-2 ring-[#FFDF73]/50"
                      : "border-black shadow-[3px_3px_0px_#000]"
                  }`}
                  onClick={() => setShowAboutModal(true)}
                  title="Click to view About JunoAI"
                />
                {theme === "medal" && (
                  <span className="absolute -bottom-1.5 -right-1.5 text-[10px] bg-[#171E2D] border border-[#D4AF37] rounded-full w-4 h-4 flex items-center justify-center shadow-[1px_1px_0px_#000]">
                    🏅
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight font-heading select-none uppercase flex items-center">
                  <span className="text-black font-black">Juno</span><span className="text-[#FF6B35] font-black">AI</span>
                </h1>
                {activeTab !== "home" && (
                  <button
                    onClick={handleGoBack}
                    className="px-2.5 py-1 bg-[#FFF9F2] hover:bg-[#FFD166] text-black border-2 border-black rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] whitespace-nowrap shrink-0"
                    title="Return to Home"
                  >
                    <span>◀ Home</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Controls: Time + Theme Toggle + Text Size */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="hidden md:inline-block text-[11px] text-slate-800 font-mono tabular-nums bg-[#FFF9F2] px-2.5 py-1 rounded-lg border-2 border-black font-bold">
                {currentTime || "12:00"}
              </span>

              <button
                onClick={toggleTheme}
                className={`px-3 py-1.5 border-2 border-black rounded-lg font-black text-[11px] transition-all cursor-pointer flex items-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_#000] whitespace-nowrap shrink-0 ${
                  theme === "dark_neon"
                    ? "bg-[#06D6A0] text-black hover:bg-[#00FF66]"
                    : theme === "medal"
                    ? "bg-[#D4AF37] text-black hover:bg-[#FFDF73]"
                    : "bg-[#FFD166] text-black hover:bg-[#ffc847]"
                }`}
                title="Click to cycle Theme: System Default ➔ Dark ➔ Gold"
              >
                <Palette className="w-3.5 h-3.5 shrink-0" />
                <span>Theme: {theme === "default" ? "System Default" : theme === "dark_neon" ? "Dark" : "Gold"}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border border-black ${
                  theme === "dark_neon"
                    ? "bg-black text-[#00FF66]"
                    : theme === "medal"
                    ? "bg-[#171E2D] text-[#FFDF73] border-[#D4AF37]"
                    : "bg-white text-black"
                }`}>
                  {theme === "dark_neon" ? "DARK ACTIVE" : theme === "medal" ? "GOLD ACTIVE" : "ACTIVE"}
                </span>
              </button>

              <button
                onClick={() => setTextSizeLarge(!textSizeLarge)}
                className={`px-3 py-1.5 border-2 border-black rounded-lg font-black text-[11px] transition-all cursor-pointer flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_#000] whitespace-nowrap shrink-0 ${
                  textSizeLarge
                    ? "bg-[#FF6B35] text-white"
                    : "bg-white text-black hover:bg-amber-50"
                }`}
                title="Toggle Large Text Mode"
              >
                <span>Text Size: {textSizeLarge ? "A+ Large" : "A- Standard"}</span>
              </button>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5" aria-label="Main workspace navigation">
            <button
              onClick={() => switchTab("home")}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "home"
                  ? "bg-[#FF6B35] text-white border-2 border-black font-black shadow-[3px_3px_0px_#000]"
                  : "bg-[#FFF9F2] text-black border-2 border-black hover:bg-amber-50 shadow-[2px_2px_0px_#000]"
              }`}
            >
              <Home className="w-3.5 h-3.5 shrink-0" />
              <span>Home</span>
            </button>

            <button
              onClick={() => switchTab("script")}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "script"
                  ? "bg-[#FF6B35] text-white border-2 border-black font-black shadow-[3px_3px_0px_#000]"
                  : "bg-[#FFF9F2] text-black border-2 border-black hover:bg-amber-50 shadow-[2px_2px_0px_#000]"
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Script</span>
            </button>

            <button
              onClick={() => switchTab("notes")}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "notes"
                  ? "bg-[#06D6A0] text-black border-2 border-black font-black shadow-[3px_3px_0px_#000]"
                  : "bg-[#FFF9F2] text-black border-2 border-black hover:bg-emerald-50 shadow-[2px_2px_0px_#000]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Notes</span>
            </button>

            <button
              onClick={() => switchTab("practice")}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "practice"
                  ? "bg-[#FFD166] text-black border-2 border-black font-black shadow-[3px_3px_0px_#000]"
                  : "bg-[#FFF9F2] text-black border-2 border-black hover:bg-amber-50 shadow-[2px_2px_0px_#000]"
              }`}
            >
              <Video className="w-3.5 h-3.5 shrink-0" />
              <span>Practice Room</span>
            </button>

            <button
              onClick={() => switchTab("warmup")}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "warmup" || activeTab === "flashcards"
                  ? "bg-[#A855F7] text-white border-2 border-black font-black shadow-[3px_3px_0px_#000]"
                  : "bg-[#FFF9F2] text-black border-2 border-black hover:bg-purple-50 shadow-[2px_2px_0px_#000]"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
              <span>Revision Games</span>
            </button>

            <button
              onClick={() => switchTab("qna")}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "qna"
                  ? "bg-[#00F5FF] text-black border-2 border-black font-black shadow-[3px_3px_0px_#000]"
                  : "bg-[#FFF9F2] text-black border-2 border-black hover:bg-sky-50 shadow-[2px_2px_0px_#000]"
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>Questions</span>
            </button>

            <button
              onClick={() => switchTab("slides")}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "slides"
                  ? "bg-[#9B5DE5] text-white border-2 border-black font-black shadow-[3px_3px_0px_#000]"
                  : "bg-[#FFF9F2] text-black border-2 border-black hover:bg-purple-50 shadow-[2px_2px_0px_#000]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Slides</span>
            </button>
          </nav>

          {/* Compact Utility & Modal Links */}
          <div className="w-full border-t-2 border-black/10 pt-2.5 flex flex-wrap items-center justify-between text-[11px] font-bold gap-2 text-slate-700">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <button
                onClick={() => setShowHelpModal(true)}
                className="hover:text-[#FF6B35] transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider font-black text-slate-800 whitespace-nowrap"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#FF6B35]" /> User Guide
              </button>
              <button
                onClick={() => setShowVersion2Modal(true)}
                className="hover:text-[#FF6B35] transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider font-black text-slate-800 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#06D6A0]" /> Improvements Log
              </button>
              <button
                onClick={() => setShowTutorialModal(true)}
                className="hover:text-[#FF6B35] transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider font-black text-slate-800 whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 text-sky-600 fill-sky-600" /> 1-Min Tour
              </button>
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-[#FF6B35] transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider font-black text-slate-800 whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5 text-[#06D6A0]" /> Privacy
              </button>
              <button
                onClick={() => setShowDisclaimerModal(true)}
                className="hover:text-[#FF6B35] transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider font-black text-slate-800 whitespace-nowrap"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> AI Disclaimer
              </button>
            </div>
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider whitespace-nowrap">
              Session-Private • No Account Needed
            </span>
          </div>
        </header>

        {/* --- MAIN TAB CONTENT --- */}
        {/* --- HOME TAB OVERVIEW DASHBOARD --- */}
        {activeTab === "home" && (
          <div className="space-y-8 animate-fade-in" id="home-dashboard-view">
            
            {/* Hero Welcome Card (Lives strictly on Home so workspaces stay uncluttered) */}
            <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#000] relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 relative z-10">
                <div className="relative shrink-0">
                  <img
                    src={theme === "default" ? robotGraduateLogo : cyberGreenLogo}
                    alt={theme === "medal" ? "JunoAI Gold Emblem" : theme === "dark_neon" ? "JunoAI Cyber Emblem" : "JunoAI Coach"}
                    referrerPolicy="no-referrer"
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-3 object-cover hover:scale-105 transition-transform ${
                      theme === "medal"
                        ? "border-[#D4AF37] shadow-[5px_5px_0px_#8C6212] ring-4 ring-[#FFDF73]/40"
                        : "border-black shadow-[5px_5px_0px_#000]"
                    }`}
                  />
                  <div className={`absolute -bottom-2 -right-2 border-2 border-black px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] ${
                    theme === "medal" ? "bg-[#D4AF37] text-black" : "bg-[#FFD166] text-black"
                  }`}>
                    {theme === "medal" ? "Gold" : "Coach"}
                  </div>
                </div>

                <div className="text-center lg:text-left flex-1 space-y-3">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-black font-heading leading-tight">
                    Welcome to <span className="text-black font-black">Juno</span><span className="text-[#FF6B35] font-black">AI</span>
                  </h2>

                  <p className="text-sm sm:text-base text-slate-700 font-semibold max-w-3xl leading-relaxed">
                    Prepare, analyze, and master your presentation delivery. Score your speech scripts, organize study notes, inspect presentation slides, rehearse with live webcam telemetry, and test yourself with active-recall games and audience Q&A.
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                    <button
                      onClick={() => switchTab("script")}
                      className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#e0531e] text-white font-black text-xs sm:text-sm rounded-xl border-3 border-black shadow-[4px_4px_0px_#000] active:scale-95 transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider font-heading whitespace-nowrap"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Write & Grade Script</span>
                    </button>

                    <button
                      onClick={() => switchTab("practice")}
                      className="px-5 py-2.5 bg-[#FFD166] hover:bg-[#ffc847] text-black font-black text-xs sm:text-sm rounded-xl border-3 border-black shadow-[4px_4px_0px_#000] active:scale-95 transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider font-heading whitespace-nowrap"
                    >
                      <Video className="w-4 h-4" />
                      <span>Live Practice Room</span>
                    </button>

                    <button
                      onClick={() => switchTab("notes")}
                      className="px-5 py-2.5 bg-[#06D6A0] hover:bg-[#05be8d] text-black font-black text-xs sm:text-sm rounded-xl border-3 border-black shadow-[4px_4px_0px_#000] active:scale-95 transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider font-heading whitespace-nowrap"
                      id="home-notes-hero-btn"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Notes & Research</span>
                    </button>

                    <button
                      onClick={() => {
                        setRobotTutorialStep(0);
                        setShowTutorialModal(true);
                      }}
                      className="px-5 py-2.5 bg-[#FFF9F2] hover:bg-[#FFD166] text-black font-black text-xs sm:text-sm rounded-xl border-3 border-black shadow-[4px_4px_0px_#000] active:scale-95 transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider font-heading whitespace-nowrap"
                      id="home-get-started-tutorial-btn"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      <span>1-Min Tour</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Feature Grid - Prioritized Core Tools */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black font-heading flex items-center gap-2">
                    <Sparkles className="text-[#FF6B35]" /> Core Presentation & Coaching Modules
                  </h3>
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                    Prioritised tools to craft, rehearse, calm nerves, and defend your presentation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* 1. Script Analyzer */}
                <div 
                  onClick={() => switchTab("script")}
                  className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-[#FF6B35] text-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black bg-[#FFF9F2] text-black px-2 py-0.5 rounded border border-black uppercase">
                        Primary Tool
                      </span>
                    </div>
                    <h4 className="font-black text-base text-black font-heading group-hover:text-[#FF6B35] transition-colors">
                      1. Script Analysis
                    </h4>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      Grade-level vocabulary checks, filler word highlighting ("um", "like"), hook generator, and breath pauses.
                    </p>
                  </div>
                  <div className="pt-4 mt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-[#FF6B35]">
                    <span>Analyze Script</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 2. Notes & Research */}
                <div 
                  onClick={() => switchTab("notes")}
                  className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-[#06D6A0] text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black bg-[#FFF9F2] text-black px-2 py-0.5 rounded border border-black uppercase">
                        Study Notes
                      </span>
                    </div>
                    <h4 className="font-black text-base text-black font-heading group-hover:text-emerald-700 transition-colors">
                      2. Notes & Research
                    </h4>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      Paste or write your raw notes, upload reference files, and generate interactive revision quizzes.
                    </p>
                  </div>
                  <div className="pt-4 mt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-emerald-700">
                    <span>Open Notes Editor</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 3. Live Practice Room (Video Presentation Analysis) */}
                <div 
                  onClick={() => switchTab("practice")}
                  className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-[#FFD166] text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black bg-[#FFF9F2] text-black px-2 py-0.5 rounded border border-black uppercase">
                        Video & Voice
                      </span>
                    </div>
                    <h4 className="font-black text-base text-black font-heading group-hover:text-amber-700 transition-colors">
                      3. Practice Room
                    </h4>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      Webcam posture alignment grid, open-hand gestures, live teleprompter, and accurate speech pacing feedback.
                    </p>
                  </div>
                  <div className="pt-4 mt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-amber-800">
                    <span>Start Video Rehearsal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 4. Revision Games (Slime Merge & Tower Defense) */}
                <div 
                  onClick={() => switchTab("warmup")}
                  className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-[#A855F7] text-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        <Gamepad2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-black bg-[#FFF9F2] text-black px-2 py-0.5 rounded border border-black uppercase">
                        Interactive
                      </span>
                    </div>
                    <h4 className="font-black text-base text-black font-heading group-hover:text-purple-700 transition-colors">
                      4. Revision Games
                    </h4>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      Play our satisfying Suika-style Slime & Monster Merge or Tower Defense, answering active-recall questions from your script!
                    </p>
                  </div>
                  <div className="pt-4 mt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-purple-800">
                    <span>Play Slime Merge & Games</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 5. Questions (Inquiry Prep) */}
                <div 
                  onClick={() => switchTab("qna")}
                  className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-[#00F5FF] text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        <Shield className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black bg-[#FFF9F2] text-black px-2 py-0.5 rounded border border-black uppercase">
                        Defense Prep
                      </span>
                    </div>
                    <h4 className="font-black text-base text-black font-heading group-hover:text-sky-700 transition-colors">
                      5. Questions
                    </h4>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      Anticipate teacher inquiry, structure answers with PREP (Point, Reason, Example, Point), and use recovery stalls.
                    </p>
                  </div>
                  <div className="pt-4 mt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-sky-700">
                    <span>Prepare Questions</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 6. Slide Checker */}
                <div 
                  onClick={() => switchTab("slides")}
                  className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-[#9B5DE5] text-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black bg-[#FFF9F2] text-black px-2 py-0.5 rounded border border-black uppercase">
                        Visual Deck
                      </span>
                    </div>
                    <h4 className="font-black text-base text-black font-heading group-hover:text-purple-700 transition-colors">
                      6. Slide Checker
                    </h4>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      10-20-30 rule evaluator, cognitive text overload detector, bullet count check, and presentation layout tips.
                    </p>
                  </div>
                  <div className="pt-4 mt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-purple-700">
                    <span>Inspect Slides</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>
            </div>

            {/* 3-Step Speaking Success Path */}
            <div className="bg-[#FFF9F2] border-3 border-black rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#000] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2 border-black/15 pb-3">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-black font-heading">
                    🚀 The 3-Step <span className="text-black font-black">Juno</span><span className="text-[#FF6B35] font-black">AI</span> Formula for 100% Speaking Grades
                  </h3>
                  <p className="text-xs text-[#FF6B35] font-black uppercase">
                    Follow this proven path before every class presentation
                  </p>
                </div>
                <button
                  onClick={() => {
                    setRobotTutorialStep(0);
                    setShowTutorialModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Coach Sparky Walkthrough 🎓</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
                <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FF6B35] text-white flex items-center justify-center font-black text-xs border border-black">1</span>
                    <h4 className="font-black text-black uppercase text-sm font-heading">Draft & Polish</h4>
                  </div>
                  <p>Paste notes into Script Analyzer. Insert breath pauses, eliminate filler words ("um", "like"), and calibrate vocabulary for your Year level.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#06D6A0] text-black flex items-center justify-center font-black text-xs border border-black">2</span>
                    <h4 className="font-black text-black uppercase text-sm font-heading">Rehearse with Video</h4>
                  </div>
                  <p>Turn on the Practice Room webcam. Check posture alignment on the 3x3 grid, maintain eye contact, and speak at 110–140 WPM.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#00F5FF] text-black flex items-center justify-center font-black text-xs border border-black">3</span>
                    <h4 className="font-black text-black uppercase text-sm font-heading">Defend with PREP</h4>
                  </div>
                  <p>Simulate teacher questions in Q&A Defense. Answer with Point ➔ Reason ➔ Example ➔ Point, and use recovery stalls if nervous.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === "script" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Script Entry & Options */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Script Input Card */}
              <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] relative overflow-hidden group">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-black flex items-center gap-2 font-heading">
                    <BookOpen className="text-[#FF6B35]" /> Pasted Script
                  </h2>
                  <div>
                    <label className="text-xs bg-[#FFF9F2] hover:bg-[#FFD166] text-black border-2 border-black py-1.5 px-3 rounded-xl font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]">
                      <Upload className="w-3.5 h-3.5 text-[#FF6B35]" /> Upload .TXT File
                      <input
                        type="file"
                        accept=".txt,.md"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Presentation Title */}
                <div className="mb-4">
                  <label className="block text-xs font-black uppercase mb-1.5 text-slate-800 tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#FF6B35]" /> Presentation Title / Subject
                  </label>
                  <input
                    type="text"
                    value={presentationTitle}
                    onChange={(e) => setPresentationTitle(e.target.value)}
                    placeholder="e.g. Space Exploration, Macbeth Review..."
                    className="w-full bg-[#FFFDF7] border-2 border-black rounded-xl p-3 text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35] placeholder-slate-400 transition-all shadow-[2px_2px_0px_#000]"
                  />
                </div>

                {/* Target Audience Year */}
                <div className="mb-4">
                  <label className="block text-xs font-black uppercase mb-1.5 text-slate-800 tracking-wider">
                    🎯 Target school year group / audience:
                  </label>
                  <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
                    {["Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Teacher"].map((yr) => (
                      <button
                        key={yr}
                        onClick={() => setTargetYear(yr)}
                        type="button"
                        className={`py-2 px-1 text-xs font-black rounded-xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] ${
                          targetYear === yr
                            ? "bg-[#FF6B35] text-white"
                            : "bg-white text-black hover:bg-[#FFF9F2]"
                        }`}
                      >
                        {yr === "Teacher" ? "🧑‍🏫 Teacher" : yr.replace("Year ", "Yr ")}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 font-semibold leading-normal">
                    We evaluate vocabulary, grammar, complexity, and pedagogy recommendations matching your specific age bracket or teacher standards.
                  </p>
                </div>

                {/* Persuasive Toggle */}
                <div className="mb-4 bg-[#FFF9F2] p-3 rounded-xl border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_#000]">
                  <div>
                    <label className="block text-xs font-black text-black">
                      📣 Persuasive presentation style?
                    </label>
                    <span className="text-[10px] text-slate-600 block leading-normal font-medium">
                      Enables logic validation, argument & evidence strength check.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPersuasive}
                    onChange={(e) => setIsPersuasive(e.target.checked)}
                    className="w-5 h-5 accent-[#FF6B35] cursor-pointer rounded"
                  />
                </div>

                {/* Sample Script Quick-Load Chips */}
                <div className="mb-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Quick Sample Scripts:</span>
                    <span className="text-[10px] text-slate-500 font-bold">1-click demo text</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPresentationTitle("Sleep Science & Adolescent Brains");
                        setScript("Good morning class and teacher! Today I am going to talk about why 8 to 10 hours of sleep is essential for teenagers.\n\nDid you know that when you sleep, your brain is actively consolidating memories from today's classes into long-term storage? When students pull all-nighters, they cut off vital REM sleep, which reduces exam recall by up to 30%.\n\nIn conclusion, prioritizing sleep is actually the ultimate study hack for high school students!");
                      }}
                      className="text-[11px] font-bold bg-[#FFF9F2] hover:bg-[#FFD166] text-black border-2 border-black px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      Sleep Science & Brain
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPresentationTitle("Reducing Single-Use Ocean Plastics");
                        setScript("Hello everyone! Every single minute, an entire garbage truck of plastic is dumped into our oceans.\n\nPlastic bottles take over 450 years to break down, turning into toxic microplastics that enter marine food chains. By switching to reusable stainless steel bottles and supporting school recycling programs, we can save thousands of marine animals each year.\n\nThank you for listening!");
                      }}
                      className="text-[11px] font-bold bg-[#FFF9F2] hover:bg-[#FFD166] text-black border-2 border-black px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      Ocean Plastics
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPresentationTitle("AI Tools in Modern Education");
                        setScript("Imagine having a personal AI tutor available 24/7 to explain complex physics problems or practice presentations.\n\nArtificial Intelligence is revolutionizing how we learn by providing personalized feedback. However, we must ensure AI is used ethically as an assistant rather than a replacement for critical thinking.\n\nToday I will demonstrate three ways students can use AI responsibly.");
                      }}
                      className="text-[11px] font-bold bg-[#FFF9F2] hover:bg-[#FFD166] text-black border-2 border-black px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      AI in Education
                    </button>
                  </div>
                </div>

                {/* Script Text Area */}
                <div className="mb-2 relative">
                  <textarea
                    rows={10}
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    placeholder="Paste or type your draft script here (or drag and drop a .txt file)..."
                    className="w-full bg-[#FFFDF7] border-2 border-black rounded-xl p-4 text-sm font-medium text-black leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-y placeholder-slate-400 shadow-[2px_2px_0px_#000]"
                  />
                  <div className="absolute bottom-3 right-3 bg-white text-black border-2 border-black text-[10px] font-black px-2.5 py-1 rounded-md shadow-[1px_1px_0px_#000]">
                    {wordCount} words
                  </div>
                </div>

                {/* 1-Click Script Helper Action Tools */}
                <div className="mb-4 flex flex-wrap gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (!script.trim()) return;
                      const pausedScript = script.replace(/\.\s+/g, ". [PAUSE 2s] ");
                      setScript(pausedScript);
                    }}
                    className="text-[10px] font-black bg-[#FFF9F2] hover:bg-[#FFD166] text-black border-2 border-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    <Pause className="w-3 h-3 text-[#FF6B35]" /> Insert [PAUSE 2s] Markers
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (script.startsWith("Did you know that")) return;
                      setScript("Did you know that over 80% of audience engagement happens in the first 15 seconds? " + script);
                    }}
                    className="text-[10px] font-black bg-[#FFF9F2] hover:bg-[#FFD166] text-black border-2 border-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    <Sparkles className="w-3 h-3 text-[#06D6A0]" /> Add Catchy Hook Intro
                  </button>
                  {script && (
                    <button
                      type="button"
                      onClick={() => setScript("")}
                      className="text-[10px] font-black bg-[#EF476F]/20 hover:bg-[#EF476F]/30 text-rose-700 border-2 border-black px-2.5 py-1.5 rounded-lg ml-auto cursor-pointer flex items-center gap-1 transition-all shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>

                {/* Optional Custom Instructions */}
                <div className="mb-6">
                  <label className="block text-xs font-black uppercase mb-1.5 text-slate-800 tracking-wider">
                    💡 Extra instructions for <span className="text-black font-black">Juno</span><span className="text-[#FF6B35] font-black">AI</span> (Optional)
                  </label>
                  <input
                    type="text"
                    value={extraPrompt}
                    onChange={(e) => setExtraPrompt(e.target.value)}
                    placeholder="e.g. Check for too many statistics, evaluate Macbeth themes..."
                    className="w-full bg-[#FFFDF7] border-2 border-black rounded-xl p-3 text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#FF6B35] placeholder-slate-400 shadow-[2px_2px_0px_#000]"
                  />
                </div>

                {/* Action button */}
                <button
                  onClick={handleAnalyzeScript}
                  disabled={isAnalyzing}
                  className="w-full py-4 px-6 bg-[#FF6B35] text-white font-black text-sm uppercase tracking-wider rounded-xl border-3 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> Analyzing your script...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> ANALYZE SCRIPT & GENERATE SCORES
                    </>
                  )}
                </button>

                {scriptError && (
                  <div className="mt-4 p-3 bg-[#EF476F]/20 border-2 border-black text-black text-xs font-bold rounded-xl flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#EF476F]" />
                    <span>{scriptError}</span>
                  </div>
                )}
              </div>

              {/* Speaking time predictor widget */}
              <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[6px_6px_0px_#000]">
                <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 mb-3 text-black">
                  <Clock className="text-[#FF6B35] w-4 h-4" /> Real-time Speaking Duration Predictor
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    
                    <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_#000]">
                      <p className="text-[10px] font-black text-slate-600 uppercase">Fast Speed</p>
                      <p className="text-lg font-black mt-0.5 text-rose-600">{times.fast}</p>
                      <p className="text-[9px] text-slate-500 font-bold">~150 wpm</p>
                    </div>

                    <div className="bg-[#FFD166] p-3 rounded-xl border-2 border-black text-center shadow-[3px_3px_0px_#000]">
                      <p className="text-[10px] font-black text-black uppercase">Normal Speed</p>
                      <p className="text-xl font-black mt-0.5 text-black">{times.normal}</p>
                      <p className="text-[9px] text-slate-800 font-bold">~130 wpm</p>
                    </div>

                    <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_#000]">
                      <p className="text-[10px] font-black text-slate-600 uppercase">Slow Speed</p>
                      <p className="text-lg font-black mt-0.5 text-emerald-700">{times.slow}</p>
                      <p className="text-[9px] text-slate-500 font-bold">~110 wpm</p>
                    </div>

                  </div>

                  <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black text-xs text-slate-800 shadow-[2px_2px_0px_#000]">
                    <p className="font-black text-black flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-[#FF6B35]" /> Pacing advice:
                    </p>
                    <p className="mt-1 text-slate-700 leading-relaxed text-[11px] font-medium">
                      Most students speak too quickly in class due to nerves. Aim for the <strong className="text-black font-black">Normal or Slow speed</strong> to ensure everyone can follow clearly!
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Feedback & Multi-category Tabs */}
            <div className="lg:col-span-7 space-y-6">
              
              {analysis ? (
                <div className="space-y-6">
                  
                  {/* Fallback Warning */}
                  {(analysis as any).isFallback && (
                    <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30 flex gap-3 text-left">
                      <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-amber-300 uppercase tracking-wide text-xs">Smart Offline Fallback Activated</h4>
                        <p className="text-xs text-amber-200 mt-1 leading-relaxed">
                          {(analysis as any).fallbackMessage}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Scorecard Widget */}
                  <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000]">
                    <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-3">
                      <h3 className="text-lg font-black text-black uppercase tracking-wider flex items-center gap-2">
                        Presentation Scorecard
                      </h3>
                      <span className="text-xs bg-[#FFD166] text-black font-black border-2 border-black px-2.5 py-1 rounded-md uppercase shadow-[2px_2px_0px_#000]">
                        {targetYear} Analysis
                      </span>
                    </div>

                    {/* Gauge metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      
                      {/* Overall Score */}
                      <div className="bg-[#FFF9F2] p-4 rounded-xl border-2 border-black flex flex-col items-center text-center shadow-[2px_2px_0px_#000]">
                        <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-200 stroke-[3.5]"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="stroke-[3.5] transition-all duration-1000 ease-out"
                              strokeDasharray={`${analysis.scores.overall}, 100`}
                              stroke="#FF6B35"
                              strokeLinecap="round"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-black text-black">{analysis.scores.overall}%</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Overall</span>
                      </div>

                      {/* Clarity Score */}
                      <div className="bg-[#FFF9F2] p-4 rounded-xl border-2 border-black flex flex-col items-center text-center shadow-[2px_2px_0px_#000]">
                        <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-200 stroke-[3.5]"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="stroke-[3.5] transition-all duration-1000 ease-out"
                              strokeDasharray={`${analysis.scores.clarity}, 100`}
                              stroke="#00F5FF"
                              strokeLinecap="round"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-black text-black">{analysis.scores.clarity}%</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Clarity</span>
                      </div>

                      {/* Confidence Score */}
                      <div className="bg-[#FFF9F2] p-4 rounded-xl border-2 border-black flex flex-col items-center text-center shadow-[2px_2px_0px_#000]">
                        <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-200 stroke-[3.5]"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="stroke-[3.5] transition-all duration-1000 ease-out"
                              strokeDasharray={`${analysis.scores.confidence}, 100`}
                              stroke="#06D6A0"
                              strokeLinecap="round"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-black text-black">{analysis.scores.confidence}%</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Confidence</span>
                      </div>

                      {/* Engagement Score */}
                      <div className="bg-[#FFF9F2] p-4 rounded-xl border-2 border-black flex flex-col items-center text-center shadow-[2px_2px_0px_#000]">
                        <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-200 stroke-[3.5]"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="stroke-[3.5] transition-all duration-1000 ease-out"
                              strokeDasharray={`${analysis.scores.engagement}, 100`}
                              stroke="#EF476F"
                              strokeLinecap="round"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-black text-black">{analysis.scores.engagement}%</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Engagement</span>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="bg-[#06D6A0]/15 border-2 border-black p-4 rounded-xl shadow-[2px_2px_0px_#000]">
                        <p className="text-xs font-black text-emerald-800 uppercase flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-700" /> Key Strengths
                        </p>
                        <p className="text-xs text-slate-800 mt-2 font-medium leading-relaxed">
                          {analysis.teacherMode.strengths || "Excellent structure and clear explanations for your targeted age group."}
                        </p>
                      </div>

                      <div className="bg-[#EF476F]/15 border-2 border-black p-4 rounded-xl shadow-[2px_2px_0px_#000]">
                        <p className="text-xs font-black text-rose-800 uppercase flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-700" /> Focus Improvement Area
                        </p>
                        <p className="text-xs text-slate-800 mt-2 font-medium leading-relaxed">
                          {analysis.teacherMode.improvements || "Try reducing conversational filler words and practice slow, deliberate speech."}
                        </p>
                      </div>

                    </div>

                    {/* Difficulty Level Indicator */}
                    <div className="mt-4 bg-[#FFF9F2] text-black p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-[#FF6B35] flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">DIFFICULTY LEVEL DETECTOR</p>
                          <p className="text-xs font-bold mt-0.5 text-black">
                            Suitable for: <span className="bg-[#FFD166] text-black px-2 py-0.5 rounded border border-black font-black text-[11px] inline-block ml-1 shadow-[1px_1px_0px_#000]">{analysis.difficulty.suitableYears.join(", ")}</span>
                          </p>
                          <p className="text-xs text-slate-700 mt-1 font-medium">
                            {analysis.difficulty.analysis}
                          </p>
                        </div>
                      </div>
                      {analysis.difficulty.suggestions && (
                        <div className="mt-2.5 pt-2.5 border-t border-black/20 text-xs text-slate-700">
                          <strong className="text-black font-black">Suggested adjustments:</strong> {analysis.difficulty.suggestions}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Improved Speech Version */}
                  {analysis.improvedScript && (
                    <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] text-left">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-black pb-4 mb-4">
                        <div>
                          <span className="text-[10px] font-black bg-[#FFD166] text-black border border-black px-2.5 py-0.5 rounded uppercase shadow-[1px_1px_0px_#000]">
                            Recommended Redraft
                          </span>
                          <h3 className="text-lg font-black text-black uppercase tracking-wider mt-1.5 flex items-center gap-2">
                            Reimagined & Improved Speech Version
                          </h3>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(analysis.improvedScript || "");
                            setCopiedScript(true);
                            setTimeout(() => setCopiedScript(false), 2000);
                          }}
                          className="px-4 py-2 bg-[#FFF9F2] hover:bg-[#FFD166] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] transition-all cursor-pointer flex items-center gap-1.5 self-stretch md:self-auto justify-center active:translate-x-[1px] active:translate-y-[1px]"
                        >
                          {copiedScript ? (
                            <>
                              <Check className="w-4 h-4 text-[#06D6A0]" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Improved Script
                            </>
                          )}
                        </button>
                      </div>

                      <div className="bg-[#FFFDF7] p-4 md:p-6 rounded-xl border-2 border-black max-h-[380px] overflow-y-auto text-sm text-black leading-relaxed whitespace-pre-wrap shadow-[2px_2px_0px_#000]">
                        {analysis.improvedScript}
                      </div>

                      <div className="mt-4 flex items-start gap-2.5 text-xs text-slate-800 bg-[#FFF9F2] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        <Lightbulb className="w-4 h-4 text-[#FF6B35] flex-shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          <strong className="text-black font-black">Why use this version?</strong> <span className="text-black font-black">Juno</span><span className="text-[#FF6B35] font-black">AI</span> has re-styled your script by introducing a hook question, sharpening the vocabulary for {targetYear}, clearing away common verbal fillers, and strengthening transition flow. Read it out loud to feel how smooth it sounds!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Intro, Outro & Content Analyzers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Introduction evaluation */}
                    <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[6px_6px_0px_#000]">
                      <span className="text-[10px] font-black bg-[#FFD166] text-black border border-black px-2.5 py-0.5 rounded uppercase shadow-[1px_1px_0px_#000]">
                        Hook & Setup
                      </span>
                      <h4 className="text-sm font-black mt-2 text-black flex items-center gap-1.5 uppercase">
                        <Zap className="text-[#FF6B35] w-4 h-4" /> Introduction Analyzer
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 font-semibold">
                        Rating: <strong className="text-black font-black">{analysis.introAnalysis.rating}</strong>
                      </p>
                      <p className="text-xs text-slate-800 mt-2 italic bg-[#FFF9F2] p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        {analysis.introAnalysis.evaluation}
                      </p>
                      
                      <div className="mt-3">
                        <p className="text-xs font-black text-slate-700 uppercase mb-1">Stronger Alternative Hooks:</p>
                        <ul className="space-y-1.5">
                          {analysis.introAnalysis.alternatives?.map((alt, idx) => (
                            <li key={idx} className="text-xs bg-[#FFFDF7] border-2 border-black p-2 rounded-xl text-black font-medium leading-normal relative pl-5 shadow-[1px_1px_0px_#000]">
                              <span className="absolute left-1.5 top-2 text-[10px] text-[#FF6B35] font-black">{idx + 1}.</span>
                              "{alt}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Conclusion evaluation */}
                    <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[6px_6px_0px_#000]">
                      <span className="text-[10px] font-black bg-[#06D6A0] text-black border border-black px-2.5 py-0.5 rounded uppercase shadow-[1px_1px_0px_#000]">
                        Sign-off & CTA
                      </span>
                      <h4 className="text-sm font-black mt-2 text-black flex items-center gap-1.5 uppercase">
                        <CheckCircle className="text-[#06D6A0] w-4 h-4" /> Conclusion Analyzer
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 font-semibold">
                        Rating: <strong className="text-black font-black">{analysis.conclusionAnalysis.rating}</strong>
                      </p>
                      <p className="text-xs text-slate-800 mt-2 italic bg-[#FFF9F2] p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        {analysis.conclusionAnalysis.evaluation}
                      </p>

                      <div className="mt-3">
                        <p className="text-xs font-black text-slate-700 uppercase mb-1">Stronger Closings:</p>
                        <ul className="space-y-1.5">
                          {analysis.conclusionAnalysis.alternatives?.map((alt, idx) => (
                            <li key={idx} className="text-xs bg-[#FFFDF7] border-2 border-black p-2 rounded-xl text-black font-medium leading-normal relative pl-5 shadow-[1px_1px_0px_#000]">
                              <span className="absolute left-1.5 top-2 text-[10px] text-[#06D6A0] font-black">{idx + 1}.</span>
                              "{alt}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>

                  {/* Attention Span Checker */}
                  <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000]">
                    <h3 className="text-base font-black flex items-center gap-2 mb-2 text-black uppercase">
                      Attention Span Checker
                    </h3>
                    <p className="text-xs text-slate-600 mb-4 font-semibold">
                      Ensures the audience stays engaged. Highlight paragraphs too long, repetitive concepts, or boring parts.
                    </p>

                    <div className="space-y-3">
                      {analysis.attentionSpan.longParagraphs && analysis.attentionSpan.longParagraphs.length > 0 ? (
                        analysis.attentionSpan.longParagraphs.map((par, idx) => (
                          <div key={idx} className="p-3 bg-[#FFD166]/20 border-2 border-black rounded-xl text-xs shadow-[2px_2px_0px_#000]">
                            <span className="font-black text-amber-800 uppercase block text-[10px]">LONG PARAGRAPH SPOTLIGHT:</span>
                            <p className="italic text-slate-800 mt-1">"{par.text}"</p>
                            <p className="mt-1.5 text-black"><strong>Suggested Refinement:</strong> {par.suggestion}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-emerald-800 font-bold bg-[#06D6A0]/15 p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                          ✓ No overly long paragraphs! Nice, bite-sized script structure.
                        </p>
                      )}

                      {analysis.attentionSpan.repetitiveExplanations && analysis.attentionSpan.repetitiveExplanations.length > 0 && (
                        <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                          <p className="text-xs font-black text-slate-700 uppercase">Repetition detected:</p>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            {analysis.attentionSpan.repetitiveExplanations.map((rep, i) => (
                              <li key={i} className="text-xs text-slate-800 font-medium">{rep}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysis.attentionSpan.boringSections && analysis.attentionSpan.boringSections.length > 0 && (
                        <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                          <p className="text-xs font-black text-slate-700 uppercase">Engagement Pitfalls (Potentially dry bits):</p>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            {analysis.attentionSpan.boringSections.map((sect, i) => (
                              <li key={i} className="text-xs text-slate-800 font-medium">{sect}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual Aid Advisor & Filler Words */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Visual Aid Suggestions */}
                    <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[6px_6px_0px_#000]">
                      <h4 className="text-sm font-black flex items-center gap-1.5 text-black uppercase mb-3">
                        Visual Aid Advisor
                      </h4>
                      <p className="text-xs text-slate-600 mb-3 font-semibold">
                        Where to use charts, graphs, or visual displays to increase student understanding.
                      </p>
                      <div className="space-y-3">
                        {analysis.visualAids?.map((aid, idx) => (
                          <div key={idx} className="bg-[#FFF9F2] border-2 border-black p-3 rounded-xl text-xs shadow-[2px_2px_0px_#000]">
                            <p className="font-black text-[#FF6B35] uppercase tracking-wide text-[10px] mb-0.5">
                              {aid.visual}
                            </p>
                            <p className="text-slate-600 font-bold mb-1.5">Where: {aid.whereToInsert}</p>
                            <p className="text-slate-800 font-medium">{aid.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Presentation Delivery Posture JunoAi */}
                  <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000]">
                    <h3 className="text-base font-black flex items-center gap-2 mb-3 text-black uppercase">
                      Presentation Delivery Advice
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      
                      <div className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        <p className="text-[10px] font-black uppercase text-slate-600">Eye Contact</p>
                        <p className="text-xs text-slate-800 mt-1 font-medium leading-relaxed">
                          {analysis.speakingTips.eyeContact}
                        </p>
                      </div>

                      <div className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        <p className="text-[10px] font-black uppercase text-slate-600">Voice Projection</p>
                        <p className="text-xs text-slate-800 mt-1 font-medium leading-relaxed">
                          {analysis.speakingTips.voiceProjection}
                        </p>
                      </div>

                      <div className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        <p className="text-[10px] font-black uppercase text-slate-600">Posture & Body</p>
                        <p className="text-xs text-slate-800 mt-1 font-medium leading-relaxed">
                          {analysis.speakingTips.bodyLanguage}
                        </p>
                      </div>

                      <div className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        <p className="text-[10px] font-black uppercase text-slate-600">Hand Gestures</p>
                        <p className="text-xs text-slate-800 mt-1 font-medium leading-relaxed">
                          {analysis.speakingTips.handGestures}
                        </p>
                      </div>

                      <div className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        <p className="text-[10px] font-black uppercase text-slate-600">Confidence / Nerves</p>
                        <p className="text-xs text-slate-800 mt-1 font-medium leading-relaxed">
                          {analysis.speakingTips.confidence}
                        </p>
                      </div>

                      <div className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        <p className="text-[10px] font-black uppercase text-slate-600">Pacing Speed</p>
                        <p className="text-xs text-slate-800 mt-1 font-medium leading-relaxed">
                          {analysis.speakingTips.pacing}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Persuasiveness Evaluation (Conditional) */}
                  {analysis.persuasiveness.isPersuasive && (
                    <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000]">
                      <h3 className="text-base font-black flex items-center gap-2 mb-2 text-black uppercase">
                        Persuasiveness & Argument Analyzer
                      </h3>
                      <p className="text-xs text-slate-600 mb-4 font-semibold">
                        This evaluates how logically tight your script is and whether you back up your claims.
                      </p>
                      <div className="space-y-3">
                        <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                          <p className="text-xs font-black text-[#FF6B35] uppercase">Argument Strength:</p>
                          <p className="text-xs text-slate-800 mt-1 font-medium">{analysis.persuasiveness.argumentStrength}</p>
                        </div>
                        <div className="bg-[#EF476F]/15 p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                          <p className="text-xs font-black text-rose-800 uppercase">Detected Weak Spots / Soft Claims:</p>
                          <p className="text-xs text-slate-800 mt-1 font-medium">{analysis.persuasiveness.weakEvidence}</p>
                        </div>
                        <div className="bg-[#06D6A0]/15 p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                          <p className="text-xs font-black text-emerald-800 uppercase">Suggested Stronger Claims:</p>
                          <p className="text-xs text-slate-800 mt-1 font-medium">{analysis.persuasiveness.suggestions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confidence Builder Mode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Speak check reminders */}
                    <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[6px_6px_0px_#000]">
                      <h4 className="text-sm font-black flex items-center gap-1.5 text-black uppercase mb-3">
                        <Shield className="w-4 h-4 text-[#FF6B35]" /> Confidence Builder Reminders
                      </h4>
                      <ul className="space-y-2">
                        {analysis.confidenceBuilder.positiveTips.map((tip, idx) => (
                          <li key={idx} className="text-xs font-bold text-slate-800 flex gap-2">
                            <span className="text-[#FF6B35] font-black">★</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-3 border-t-2 border-black/20">
                        <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Last Minute Reminders:</p>
                        <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4 font-medium">
                          {analysis.confidenceBuilder.lastMinuteReminders.map((rem, i) => (
                            <li key={i}>{rem}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Check list */}
                    <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[6px_6px_0px_#000]">
                      <h4 className="text-sm font-black flex items-center gap-1.5 text-black uppercase mb-3">
                        <CheckCircle className="w-4 h-4 text-[#06D6A0]" /> Presentation Readiness Checklist
                      </h4>
                      <ul className="space-y-2">
                        {analysis.confidenceBuilder.checklist.map((task, idx) => (
                          <li key={idx} className="text-xs font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#06D6A0] border-2 border-black rounded flex items-center justify-center text-black text-[10px] font-black flex-shrink-0 shadow-[1px_1px_0px_#000]">
                              ✓
                            </div>
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Teacher Evaluation Panel */}
                  <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] text-black">
                    <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-3">
                      <div>
                        <h3 className="text-base font-black uppercase tracking-wider text-black">
                          Academic Grading Assessment
                        </h3>
                        <p className="text-[10px] text-slate-600 font-bold">
                          Review how a school grader evaluates your work.
                        </p>
                      </div>
                      <div className="bg-[#FFD166] text-black font-black px-3 py-1 rounded-lg text-sm border-2 border-black shadow-[2px_2px_0px_#000]">
                        Estimated Grade: {analysis.teacherMode.gradeEstimate || "A-"}
                      </div>
                    </div>

                    <div className="space-y-4">
                      
                      <div>
                        <p className="text-xs font-black text-emerald-800 uppercase">Strong aspects:</p>
                        <p className="text-xs text-slate-800 mt-1 leading-relaxed font-medium">
                          {analysis.teacherMode.strengths}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black text-rose-800 uppercase">Suggested improvements:</p>
                        <p className="text-xs text-slate-800 mt-1 leading-relaxed font-medium">
                          {analysis.teacherMode.improvements}
                        </p>
                      </div>

                      <div className="bg-[#FFF9F2] p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                        <p className="text-xs font-black text-[#FF6B35] uppercase mb-1">Student Next Steps:</p>
                        <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                          {analysis.teacherMode.nextSteps}
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              ) : isAnalyzing ? (
                <div className="bg-white border-3 border-black rounded-2xl p-8 flex flex-col items-center justify-center min-h-[450px] space-y-6 text-left shadow-[6px_6px_0px_#000]">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute w-16 h-16 border-4 border-black border-t-[#FF6B35] rounded-full animate-spin"></div>
                    <Sparkles className="w-8 h-8 text-[#FF6B35] animate-pulse" />
                  </div>
                  <div className="text-center w-full max-w-md">
                    <h3 className="text-lg font-black text-black uppercase tracking-wider">
                      <span className="text-black font-black">Juno</span><span className="text-[#FF6B35] font-black">AI</span> Analysis Engine
                    </h3>
                    <p className="text-xs text-slate-600 font-bold uppercase mt-1 animate-pulse">
                      Analyzing and grading your script...
                    </p>
                    
                    <div className="mt-6 p-4 bg-[#FFF9F2] border-2 border-black rounded-xl text-left space-y-2.5 shadow-[2px_2px_0px_#000]">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                        <span className="animate-ping">●</span> Checking target age group vocabulary fit ({targetYear})...
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-800">
                        <span className="animate-pulse">⏳</span> Evaluating pacing, structure, and speaking tips...
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                        <span>○</span> Creating custom interactive flashcards for Revision Game...
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                        <span>○</span> Formulating realistic simulator audience Q&As...
                      </div>
                    </div>

                    <div className="mt-6 p-3 bg-[#FFD166] rounded-xl border-2 border-black text-[11px] text-black leading-normal font-bold text-left shadow-[2px_2px_0px_#000]">
                      <strong className="text-black font-black">Presentation Secret:</strong> The best speakers aren't born confident. They just script their hooks, practice pausing for breath, and know when to simplify complex definitions for their audience!
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-3 border-black rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[450px] shadow-[6px_6px_0px_#000]">
                  <div className="w-16 h-16 bg-[#FFF9F2] border-3 border-black rounded-2xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#000] text-[#FF6B35]">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-black flex flex-wrap items-center justify-center gap-x-2 gap-y-2 uppercase">
                    <span className="text-black font-black">Juno</span><span className="text-[#FF6B35] font-black">AI</span> <span className="bg-[#FFD166] text-black px-2 py-0.5 rounded border border-black text-xs uppercase tracking-wider inline-flex items-center font-black shadow-[2px_2px_0px_#000]">READY</span>
                  </h3>
                  <p className="text-xs text-slate-700 mt-2 max-w-md font-semibold leading-relaxed">
                    Paste your presentation text or talking points on the left, choose your school year level, and click <strong className="text-black font-black">ANALYZE SCRIPT</strong> to receive immediate, professional speaking advice!
                  </p>
                  
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left w-full max-w-xl">
                    <div className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_#000]">
                      <TrendingUp className="w-5 h-5 text-[#FF6B35] mx-auto mb-1" />
                      <p className="text-xs font-black text-black">Confidence score out of 100</p>
                    </div>
                    <div className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_#000]">
                      <Clock className="w-5 h-5 text-[#FF6B35] mx-auto mb-1" />
                      <p className="text-xs font-black text-black">Speaking speed predictor</p>
                    </div>
                    <div className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_#000]">
                      <Shield className="w-5 h-5 text-[#06D6A0] mx-auto mb-1" />
                      <p className="text-xs font-black text-black">Audience Q&A Simulator</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* --- NOTES & RESEARCH TAB --- */}
        {activeTab === "notes" && (
          <div className="space-y-8 animate-fadeIn relative z-10" id="notes-view-container">
            {/* Notes Hero Header Card */}
            <div className="bg-white border-3 border-black rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#000] text-left relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-[#06D6A0] p-3.5 rounded-2xl border-2 border-black text-black shadow-[3px_3px_0px_#000]">
                    <BookOpen className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-[#FFD166] text-black px-2.5 py-0.5 rounded border border-black uppercase tracking-wider">
                        Study & Quiz Source
                      </span>
                      <span className="text-[10px] font-black bg-[#00F5FF] text-black px-2.5 py-0.5 rounded border border-black uppercase tracking-wider">
                        Auto Flashcards
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-black flex flex-wrap items-center gap-2 font-heading mt-1">
                      Notes & <span className="text-[#06D6A0]">Research Hub</span>
                    </h2>
                    <p className="text-xs text-slate-700 font-semibold mt-0.5">
                      Paste, type, or upload your own research notes. JunoAI extracts key study points so you can test yourself with Slime Merge, Tower Defense, and inquiry defense questions!
                    </p>
                  </div>
                </div>

                {/* Quick File & Copy Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs bg-[#FFF9F2] hover:bg-[#FFD166] text-black border-2 border-black py-2 px-3.5 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]">
                    <Upload className="w-3.5 h-3.5 text-[#FF6B35]" /> Upload .TXT / .MD
                    <input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleNotesFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => {
                      if (!notesText.trim()) return;
                      navigator.clipboard.writeText(notesText);
                      setCopiedNotes(true);
                      setTimeout(() => setCopiedNotes(false), 2000);
                    }}
                    className="text-xs bg-[#FFF9F2] hover:bg-[#06D6A0] text-black border-2 border-black py-2 px-3.5 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    {copiedNotes ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black" />}
                    <span>{copiedNotes ? "Copied!" : "Copy Notes"}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Clear all notes?")) {
                        setNotesText("");
                        try {
                          localStorage.removeItem("junoai_notes_text");
                        } catch {}
                      }
                    }}
                    className="text-xs bg-[#FFF9F2] hover:bg-rose-100 text-rose-800 border-2 border-black py-2 px-3 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                    title="Clear Notepad"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Notes Title Input */}
              <div className="mb-4">
                <label className="block text-xs font-black uppercase mb-1.5 text-slate-800 tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#06D6A0]" /> Notes Subject / Topic Name:
                </label>
                <input
                  type="text"
                  value={notesTitle}
                  onChange={(e) => {
                    setNotesTitle(e.target.value);
                    try {
                      localStorage.setItem("junoai_notes_title", e.target.value);
                    } catch {}
                  }}
                  className="w-full bg-[#FFFDF7] text-black p-3 rounded-xl border-2 border-black focus:border-[#06D6A0] focus:outline-none text-sm font-bold shadow-[2px_2px_0px_#000]"
                  placeholder="e.g. Science Fair Research, Mars Exploration Notes, Economics Thesis..."
                />
              </div>

              {/* Main Notepad Area */}
              <div className="bg-[#FFF9F2] border-2 border-black rounded-2xl p-4 space-y-3 shadow-[3px_3px_0px_#000]">
                <div className="flex flex-wrap items-center justify-between text-xs font-black text-black uppercase tracking-wider">
                  <span>Enter or Paste Your Notes Below:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-black font-black bg-[#FFD166] px-2.5 py-0.5 rounded border-2 border-black shadow-[1px_1px_0px_#000]">
                      {notesText.trim().split(/\s+/).filter(Boolean).length} Words
                    </span>
                    <span className="text-[10px] text-black font-black bg-[#06D6A0] px-2.5 py-0.5 rounded border-2 border-black shadow-[1px_1px_0px_#000]">
                      {notesText.length} Chars
                    </span>
                  </div>
                </div>

                <textarea
                  value={notesText}
                  onChange={(e) => {
                    setNotesText(e.target.value);
                    try {
                      localStorage.setItem("junoai_notes_text", e.target.value);
                    } catch {}
                  }}
                  rows={10}
                  className="w-full bg-[#FFFDF7] text-black p-4 rounded-xl border-2 border-black focus:border-[#06D6A0] focus:outline-none text-sm font-sans leading-relaxed resize-y shadow-[2px_2px_0px_#000]"
                  placeholder="Write out your notes, paste quotes, list key facts, formulas, or outlines here..."
                />

                {/* Instant Quiz Launch Shortcuts from Notes */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t-2 border-black/10">
                  <div className="text-xs text-slate-700 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                    <span>Auto-extracts questions for Revision Games & Questions defense!</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        if (!notesText.trim()) {
                          alert("Please paste or write some notes first!");
                          return;
                        }
                        setQuizSource("notes");
                        handleStartSlimeMergeGame();
                      }}
                      className="px-4 py-2.5 bg-[#A855F7] hover:bg-[#9333ea] text-white font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1.5 font-heading"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      <span>Play Slime Merge from Notes 👾</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!notesText.trim()) {
                          alert("Please paste or write some notes first!");
                          return;
                        }
                        setQuizSource("notes");
                        switchTab("qna");
                      }}
                      className="px-4 py-2.5 bg-[#00F5FF] hover:bg-[#00d8e0] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1.5 font-heading"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Defend Questions from Notes 🛡️</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Notes Analytics & Extracted Points Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Stat Card 1: Estimated Study Time */}
              <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#000] flex items-center gap-3.5">
                <div className="p-3 bg-[#FFD166] text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-600">Reading / Review Time</p>
                  <p className="text-lg font-black text-black">
                    ~{Math.max(1, Math.round(notesText.trim().split(/\s+/).filter(Boolean).length / 130))} Min Study
                  </p>
                </div>
              </div>

              {/* Stat Card 2: Extracted Key Sentences */}
              <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#000] flex items-center gap-3.5">
                <div className="p-3 bg-[#06D6A0] text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-600">Identified Fact Points</p>
                  <p className="text-lg font-black text-black">
                    {notesText.split(/[.!?\n]+/).filter(s => s.trim().length > 12).length} Concept Points
                  </p>
                </div>
              </div>

              {/* Stat Card 3: Active Quiz Status */}
              <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#000] flex items-center gap-3.5">
                <div className="p-3 bg-[#00F5FF] text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-600">Current Quiz Target</p>
                  <p className="text-lg font-black text-black capitalize">
                    {quizSource === "notes" ? "📋 Active: Notes" : "📝 Active: Script"}
                  </p>
                </div>
              </div>

            </div>

            {/* Extracted Concept Questions Preview */}
            <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2 border-black pb-3">
                <div>
                  <h3 className="text-lg font-black text-black uppercase tracking-wider flex items-center gap-2 font-heading">
                    <CheckCircle className="w-5 h-5 text-[#06D6A0]" /> Auto-Extracted Study Cards From Your Notes
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">
                    These questions are automatically loaded into your Revision Games and Questions defense whenever "Notes" is selected.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setQuizSource("notes");
                    switchTab("warmup");
                  }}
                  className="px-3.5 py-1.5 bg-[#FFD166] hover:bg-[#ffc847] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto font-heading"
                >
                  <Play className="w-3.5 h-3.5 fill-black" /> Quiz On These Points
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notesText
                  .split(/[.!?\n]+/)
                  .map(s => s.trim())
                  .filter(s => s.length > 14)
                  .slice(0, 6)
                  .map((sentence, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FFF9F2] p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase bg-[#06D6A0] text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
                          Concept #{idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">
                          From Notes
                        </span>
                      </div>
                      <p className="text-xs font-black text-black">
                        What does your research note state regarding this point?
                      </p>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed italic bg-white p-2.5 rounded-xl border border-black">
                        "{sentence}"
                      </p>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === "slides" && (
          <SlideCheckerEnhanced
            onAnalyze={handleCheckSlides}
            slideAnalysis={slideAnalysis}
            isAnalyzing={isAnalyzingSlides}
            error={slideError}
          />
        )}

        {activeTab === "practice" && (
          <div className="space-y-6">

            <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] space-y-6 relative overflow-hidden">
              
              {/* Header & Mode Switcher */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b-2 border-black pb-4 gap-4 mt-1">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#FF6B35] border-2 border-black rounded-xl text-white shadow-[2px_2px_0px_#000]">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-black flex items-center gap-2 font-heading">
                      Presentation Practice & Body Language Stage
                    </h3>
                    <p className="text-xs text-slate-700 font-semibold leading-normal">
                      Record video to measure your <strong className="text-black">hand gestures</strong>, <strong className="text-black">head stability</strong>, <strong className="text-black">lighting</strong>, <strong className="text-black">script keyword coverage</strong>, and voice pacing!
                    </p>
                  </div>
                </div>

                {/* Mode Selector Toggle */}
                <div className="flex items-center gap-2 bg-[#FFF9F2] p-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                  <button
                    onClick={() => {
                      if (recordingState === "idle") setRecordMode("video");
                    }}
                    disabled={recordingState !== "idle"}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border-2 border-black ${
                      recordMode === "video"
                        ? "bg-[#FF6B35] text-white shadow-[2px_2px_0px_#000]"
                        : "bg-white text-slate-700 hover:text-black hover:bg-amber-50"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" /> Video Camera Practice
                  </button>
                  <button
                    onClick={() => {
                      if (recordingState === "idle") setRecordMode("audio");
                    }}
                    disabled={recordingState !== "idle"}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border-2 border-black ${
                      recordMode === "audio"
                        ? "bg-[#FF6B35] text-white shadow-[2px_2px_0px_#000]"
                        : "bg-white text-slate-700 hover:text-black hover:bg-amber-50"
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" /> Voice Only Practice
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Video Camera / Stage Monitor & Controls */}
                <div className="lg:col-span-6 space-y-5">
                  
                  {/* Setup Topic & Script Status */}
                  <div className="p-4 bg-[#FFF9F2] rounded-xl border-2 border-black space-y-3 shadow-[3px_3px_0px_#000]">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-black mb-1">
                        Presentation Subject:
                      </label>
                      <input
                        type="text"
                        value={presentationTitle}
                        onChange={(e) => setPresentationTitle(e.target.value)}
                        disabled={recordingState !== "idle"}
                        placeholder="Presentation topic..."
                        className="w-full bg-[#FFFDF7] border-2 border-black rounded-lg p-2.5 text-xs font-bold text-black focus:outline-none focus:border-[#FF6B35] shadow-[2px_2px_0px_#000]"
                      />
                    </div>

                    <div>
                      <span className="block text-[10px] font-black uppercase text-black mb-1">
                        Planned Script:
                      </span>
                      <div className="text-xs font-medium text-slate-800 bg-[#FFFDF7] p-3 rounded-lg border-2 border-black max-h-28 overflow-y-auto whitespace-pre-wrap shadow-[2px_2px_0px_#000]">
                        {script ? script : "⚠️ No script entered yet! Go to the Script Analyzer tab or paste a script to get teleprompter support."}
                      </div>
                    </div>
                  </div>

                  {/* CAMERA VIDEO STAGE MONITOR */}
                  <div className="p-4 bg-white text-black rounded-xl border-2 border-black space-y-4 text-center shadow-[4px_4px_0px_#000] relative">
                    <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
                      <span className="text-[10px] font-black text-black tracking-widest uppercase flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#FF6B35]" /> Live Stage Camera Monitor
                      </span>
                      {recordMode === "video" && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={handleRequestCameraPermission}
                            disabled={isRequestingPermission}
                            title="Re-request Camera & Microphone permission from your browser"
                            className="text-[10px] font-black bg-[#FFD166] hover:bg-[#ffc847] text-black px-2.5 py-1 rounded border-2 border-black shadow-[1px_1px_0px_#000] transition-all flex items-center gap-1 cursor-pointer active:translate-x-[1px] active:translate-y-[1px] whitespace-nowrap disabled:opacity-60"
                          >
                            {isRequestingPermission ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3 h-3" />
                            )}
                            <span>{isRequestingPermission ? "Requesting..." : "Request Permission"}</span>
                          </button>
                          <button
                            onClick={toggleCameraFacingMode}
                            title="Flip between Front and Rear camera"
                            className="text-[10px] font-black bg-[#FFF9F2] hover:bg-[#FFD166] text-black px-2 py-1 rounded border-2 border-black shadow-[1px_1px_0px_#000] transition-all flex items-center gap-1 cursor-pointer active:translate-x-[1px] active:translate-y-[1px] whitespace-nowrap"
                          >
                            <SwitchCamera className="w-3 h-3 text-[#FF6B35]" /> {cameraFacingMode === "user" ? "Front" : "Rear"}
                          </button>
                          <button
                            onClick={() => setShowPoseGuideOverlay(!showPoseGuideOverlay)}
                            className="text-[10px] font-black bg-[#FFF9F2] hover:bg-[#FFD166] text-black px-2 py-1 rounded border-2 border-black shadow-[1px_1px_0px_#000] transition-all flex items-center gap-1 cursor-pointer active:translate-x-[1px] active:translate-y-[1px] whitespace-nowrap"
                          >
                            <UserCheck className="w-3 h-3 text-[#FF6B35]" /> {showPoseGuideOverlay ? "Hide Grid" : "Show Grid"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* LIVE CAMERA / VIDEO PLAYER CONTAINER */}
                    <div className="relative w-full aspect-video bg-black rounded-xl border-2 border-black overflow-hidden flex items-center justify-center group shadow-[3px_3px_0px_#000]">
                      
                      {/* 1. Live Camera Stream during Recording/Paused or Idle Preview */}
                      {(recordingState === "recording" || recordingState === "paused" || (recordingState === "idle" && isIdleCameraPreviewActive)) && recordMode === "video" && (
                        <div className="relative w-full h-full">
                          <video
                            ref={(node) => {
                              if (node) {
                                bindStreamToVideo(node, cameraStreamRef.current);
                              }
                            }}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${cameraFacingMode === "user" ? "transform -scale-x-100" : ""}`}
                            style={{ backfaceVisibility: "hidden" }}
                          />
                          
                          {/* Fallback if camera stream track is muted/stopped or waiting for browser permission */}
                          {!hasActiveVideoTrack && (
                            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-5 text-center space-y-3 z-20">
                              <div className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400">
                                <VideoOff className="w-6 h-6" />
                              </div>
                              <div>
                                <h5 className="text-xs font-black text-white uppercase tracking-wider font-heading">
                                  Camera Feed Connecting / Paused
                                </h5>
                                <p className="text-[11px] text-slate-200 max-w-xs mt-1 leading-snug mx-auto">
                                  {cameraErrorMessage || "Your browser may be waiting for camera permission, or mobile autoplay paused the preview."}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                                <button
                                  onClick={() => {
                                    if (videoPreviewRef.current) {
                                      videoPreviewRef.current.play().then(() => {
                                        setIsVideoPlaying(true);
                                        setHasActiveVideoTrack(true);
                                      }).catch(() => {});
                                    }
                                    if (recordingState === "idle") {
                                      startIdleCameraPreview(cameraFacingMode);
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-[#06D6A0] hover:bg-[#05b88a] text-black font-black text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                                >
                                  <Camera className="w-3.5 h-3.5" /> Wake Camera
                                </button>
                                <button
                                  onClick={toggleCameraFacingMode}
                                  className="px-3 py-1.5 bg-white text-black border-2 border-black font-black text-xs rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                                >
                                  <SwitchCamera className="w-3.5 h-3.5 text-[#FF6B35]" /> Flip to {cameraFacingMode === "user" ? "Rear" : "Front"}
                                </button>
                                <button
                                  onClick={handleRequestCameraPermission}
                                  disabled={isRequestingPermission}
                                  className="px-3 py-1.5 bg-[#FFD166] hover:bg-[#ffc847] text-black border-2 border-black font-black text-xs rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5 whitespace-nowrap disabled:opacity-60"
                                  title="Ask the browser for Camera & Microphone permission again"
                                >
                                  {isRequestingPermission ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                  )}
                                  <span>{isRequestingPermission ? "Requesting..." : "Request Permission"}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (cameraStreamRef.current) {
                                      cameraStreamRef.current.getTracks().forEach(t => t.stop());
                                      cameraStreamRef.current = null;
                                    }
                                    setIsIdleCameraPreviewActive(false);
                                    setRecordMode("audio");
                                  }}
                                  className="px-3 py-1.5 bg-[#EF476F] hover:bg-[#d6335a] text-white border-2 border-black font-black text-xs rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1 whitespace-nowrap"
                                >
                                  <Mic className="w-3.5 h-3.5" /> Switch to Voice Only
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Posture alignment grid overlay */}
                          {showPoseGuideOverlay && hasActiveVideoTrack && (
                            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-[#FFD166]/60 flex flex-col justify-between p-4">
                              <div className="w-full border-b-2 border-dashed border-[#FFD166]/60 h-1/3 flex items-center justify-center">
                                <span className="text-[9px] text-black bg-[#FFD166] border border-black px-2 py-0.5 rounded font-mono uppercase font-black">Eye Level Line</span>
                              </div>
                              <div className="w-full border-b-2 border-dashed border-[#FFD166]/60 h-1/3 flex items-center justify-center">
                                <span className="text-[9px] text-black bg-[#FFD166] border border-black px-2 py-0.5 rounded font-mono uppercase font-black">Open Gestures Zone</span>
                              </div>
                            </div>
                          )}

                          {/* Live Posture Hint Bar */}
                          {hasActiveVideoTrack && (
                            <div className="absolute top-3 left-3 right-3 bg-white/95 border-2 border-black p-2 rounded-lg text-left flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#06D6A0] border border-black animate-ping flex-shrink-0"></span>
                              <p className="text-[10px] text-black font-bold">
                                <strong className="text-[#FF6B35]">Stage AI:</strong> Keep shoulders relaxed • Use open hand gestures • Look at the camera
                              </p>
                            </div>
                          )}

                          {/* Live Recording Badge & Timer Overlay */}
                          <div className="absolute bottom-3 left-3 bg-white border-2 border-black px-2.5 py-1 rounded-lg flex items-center gap-2 text-black font-mono text-xs font-black shadow-[2px_2px_0px_#000]">
                            <span className="w-2.5 h-2.5 bg-[#EF476F] rounded-full border border-black animate-pulse"></span>
                            {recordingState === "recording" ? "REC" : recordingState === "paused" ? "PAUSED" : "LIVE PREVIEW"} {formatRecordingDuration(recordingTime)}
                          </div>

                          {/* Camera Info Badge */}
                          {hasActiveVideoTrack && (
                            <div className="absolute bottom-3 right-3 bg-white border-2 border-black px-2 py-0.5 rounded text-[9px] text-black font-mono font-bold flex items-center gap-1 shadow-[1px_1px_0px_#000]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#06D6A0] border border-black"></span>
                              {cameraFacingMode === "user" ? "Front Cam" : "Rear Cam"}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. Recorded Video Playback after Completion */}
                      {recordingState === "completed" && recordedVideoUrl && recordMode === "video" && (
                        <div className="w-full h-full bg-black relative">
                          <video
                            ref={recordedVideoPlayerRef}
                            src={recordedVideoUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute top-2 right-2 bg-white text-black border-2 border-black px-2 py-0.5 rounded text-[9px] font-black uppercase shadow-[2px_2px_0px_#000]">
                            Re-watch Performance
                          </div>
                        </div>
                      )}

                      {/* 3. Idle Stage Preview */}
                      {recordingState === "idle" && !isIdleCameraPreviewActive && (
                        <div className="p-5 text-center space-y-3 bg-[#FFFDF7] w-full h-full flex flex-col items-center justify-center">
                          <div className="w-12 h-12 bg-white border-2 border-black rounded-2xl flex items-center justify-center mx-auto text-[#FF6B35] shadow-[3px_3px_0px_#000]">
                            {recordMode === "video" ? <Video className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase text-black font-heading">
                              {recordMode === "video" ? "Camera Ready Stage" : "Voice Practice Studio"}
                            </h4>
                            <p className="text-[11px] text-slate-700 max-w-sm mt-1 leading-snug mx-auto font-medium">
                              {cameraErrorMessage
                                ? cameraErrorMessage
                                : recordMode === "video"
                                ? "Press 'Start Video Practice' or test your camera feed below!"
                                : "Press 'Start Voice Practice' to record audio and analyze your speaking speed and pauses."}
                            </p>
                          </div>
                          {recordMode === "video" && (
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              <button
                                onClick={() => startIdleCameraPreview(cameraFacingMode)}
                                className="py-1.5 px-3 bg-white hover:bg-[#FFD166] text-black border-2 border-black rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] whitespace-nowrap"
                              >
                                <Video className="w-3.5 h-3.5 text-[#FF6B35]" /> Test Camera Feed
                              </button>
                              <button
                                onClick={toggleCameraFacingMode}
                                title="Change camera"
                                className="py-1.5 px-2.5 bg-white hover:bg-[#FFD166] text-black border-2 border-black rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] whitespace-nowrap"
                              >
                                <SwitchCamera className="w-3.5 h-3.5 text-[#FF6B35]" /> {cameraFacingMode === "user" ? "Front" : "Rear"}
                              </button>
                              <button
                                onClick={handleRequestCameraPermission}
                                disabled={isRequestingPermission}
                                className="py-1.5 px-3 bg-[#FFD166] hover:bg-[#ffc847] text-black border-2 border-black rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] whitespace-nowrap disabled:opacity-60"
                                title="Request browser Camera & Microphone permission again"
                              >
                                {isRequestingPermission ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                )}
                                <span>{isRequestingPermission ? "Requesting..." : "Request Permission"}</span>
                              </button>
                              <button
                                onClick={() => setRecordMode("audio")}
                                className="py-1.5 px-3 bg-[#EF476F] hover:bg-[#d6335a] text-white border-2 border-black rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer shadow-[2px_2px_0px_#000] whitespace-nowrap"
                              >
                                <Mic className="w-3.5 h-3.5" /> Switch to Voice Only
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. Audio-only recording active indicator */}
                      {(recordingState === "recording" || recordingState === "paused") && recordMode === "audio" && (
                        <div className="p-6 text-center space-y-3 bg-[#FFFDF7] w-full h-full flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mx-auto text-[#EF476F] shadow-[3px_3px_0px_#000] animate-pulse">
                            <Mic className="w-8 h-8" />
                          </div>
                          <p className="text-2xl font-mono tabular-nums font-black text-black tracking-widest">
                            {formatRecordingDuration(recordingTime)}
                          </p>
                          <span className="text-xs text-[#EF476F] font-black uppercase">Live Audio Recording...</span>
                        </div>
                      )}
                    </div>

                    {/* Real-time mic volume audio wave visualizer */}
                    {(recordingState === "recording" || recordingState === "paused") && (
                      <div className="flex items-center justify-center gap-1.5 h-10 bg-[#FFF9F2] max-w-[200px] mx-auto rounded-xl border-2 border-black px-4 py-2 shadow-[2px_2px_0px_#000]" id="live-audio-wave">
                        {micLevels.map((level, i) => {
                          return (
                            <div
                              key={i}
                              className="w-1.5 rounded-full transition-all duration-75 bg-[#FF6B35]"
                              style={{
                                height: `${level}%`,
                              }}
                            ></div>
                          );
                        })}
                      </div>
                    )}

                    {/* Microphone / Camera blocked fallback alert */}
                    {(!isMicAvailable || (!isCameraAvailable && recordMode === "video") || cameraErrorMessage) && (
                      <div className="p-3 bg-amber-50 border-2 border-black rounded-xl text-[11px] text-amber-950 font-bold shadow-[2px_2px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
                        <span>
                          {cameraErrorMessage || "Camera or microphone access is currently blocked. Allow access in your browser bar and re-request permission."}
                        </span>
                        <button
                          onClick={handleRequestCameraPermission}
                          disabled={isRequestingPermission}
                          className="px-2.5 py-1 bg-[#FFD166] hover:bg-[#ffc847] text-black border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{isRequestingPermission ? "Requesting..." : "Request Permission"}</span>
                        </button>
                      </div>
                    )}

                    {/* Controls Row */}
                    <div className="flex items-center justify-center gap-2.5 pt-2">
                      {recordingState === "idle" && (
                        <button
                          onClick={startPracticeRecording}
                          className="w-full py-3 px-4 bg-[#FF6B35] hover:bg-[#e0531e] text-white font-black text-xs rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
                        >
                          {recordMode === "video" ? (
                            <>
                              <Video className="w-4 h-4 fill-white text-white" /> Start Video Practice 📹
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-white text-white" /> Start Voice Practice 🎤
                            </>
                          )}
                        </button>
                      )}

                      {recordingState === "recording" && (
                        <>
                          <button
                            onClick={pausePracticeRecording}
                            className="flex-1 py-2.5 px-3 bg-[#FFD166] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                          >
                            <Pause className="w-3.5 h-3.5" /> Pause
                          </button>
                          <button
                            onClick={stopPracticeRecording}
                            className="flex-1 py-2.5 px-3 bg-[#EF476F] text-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                          >
                            <Square className="w-3.5 h-3.5 fill-white" /> Stop & Finish
                          </button>
                        </>
                      )}

                      {recordingState === "paused" && (
                        <>
                          <button
                            onClick={resumePracticeRecording}
                            className="flex-1 py-2.5 px-3 bg-[#06D6A0] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                          >
                            <Play className="w-3.5 h-3.5 fill-black" /> Resume
                          </button>
                          <button
                            onClick={stopPracticeRecording}
                            className="flex-1 py-2.5 px-3 bg-[#EF476F] text-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                          >
                            <Square className="w-3.5 h-3.5 fill-white" /> Stop & Finish
                          </button>
                        </>
                      )}

                      {recordingState === "completed" && (
                        <div className="flex flex-col gap-2 w-full">
                          <button
                            onClick={handleAnalyzeRecording}
                            disabled={isAnalyzingRecording}
                            className="w-full py-3 px-4 bg-[#FF6B35] hover:bg-[#e0531e] text-white font-black text-xs rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
                          >
                            {isAnalyzingRecording ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-white" /> Analyzing Video & Speech...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-white" /> Get <span className="text-black font-black">Juno</span><span className="text-[#FFD166] font-black">AI</span> Feedback
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setRecordingState("idle");
                              setRecordingTime(0);
                              setSpokenTranscript("");
                              setRecordedVideoUrl(null);
                            }}
                            className="w-full py-2 px-3 bg-[#FFF9F2] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#FFD166] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                          >
                            Practice Again
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  {spokenTranscript && (
                    <div className="p-4 bg-white border-2 border-black rounded-xl text-left space-y-2 shadow-[3px_3px_0px_#000]">
                      <span className="block text-[10px] font-black uppercase text-black">
                        🎙️ Live Transcribed Speech (What we heard):
                      </span>
                      <div className="text-xs font-medium text-slate-800 bg-[#FFFDF7] p-2.5 rounded-lg border-2 border-black max-h-28 overflow-y-auto whitespace-pre-wrap shadow-[1px_1px_0px_#000]">
                        {spokenTranscript}
                      </div>
                    </div>
                  )}

                  {recordingError && (
                    <div className="p-3 bg-rose-100 border-2 border-black text-rose-900 text-xs font-bold rounded-xl shadow-[2px_2px_0px_#000]">
                      {recordingError}
                    </div>
                  )}

                </div>

                {/* Right Column: Teleprompter / Results Dashboard */}
                <div className="lg:col-span-6 space-y-4">
                  
                  {/* Live Teleprompter (Only shown when actively practicing or paused) */}
                  {(recordingState === "recording" || recordingState === "paused") && (
                    <div className="p-5 bg-white border-2 border-black rounded-2xl space-y-3 shadow-[4px_4px_0px_#000]">
                      <div className="flex items-center justify-between border-b-2 border-black pb-2">
                        <span className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-1">
                          🗣️ Smart Teleprompter Cues
                        </span>
                        <span className="text-[9px] font-black bg-[#FFD166] text-black border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                          Auto-Scrolling
                        </span>
                      </div>
                      <div className="h-64 overflow-y-auto pr-2 scroll-smooth text-sm font-medium text-slate-900 leading-relaxed italic select-none bg-[#FFFDF7] p-3 rounded-xl border-2 border-black">
                        {script ? (
                          <p className="whitespace-pre-wrap">{script}</p>
                        ) : (
                          <div className="text-center py-10 text-xs text-slate-500 font-medium">
                            Please enter a script in the Script Analyzer tab to view text here!
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-700 font-bold text-center italic">
                        Tip: Speak naturally, keep breathing steady, use hand gestures, and look toward the camera.
                      </p>
                    </div>
                  )}

                  {/* Recording feedback active loading panel */}
                  {isAnalyzingRecording && (
                    <div className="p-8 bg-white border-3 border-black rounded-2xl flex flex-col items-center justify-center min-h-[380px] space-y-6 text-left shadow-[6px_6px_0px_#000]">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <div className="absolute w-16 h-16 border-4 border-black border-t-[#FF6B35] rounded-full animate-spin"></div>
                        <Sparkles className="w-8 h-8 text-[#FF6B35] animate-pulse" />
                      </div>
                      <div className="text-center w-full max-w-sm">
                        <h3 className="text-base font-black text-black uppercase tracking-wider font-heading">
                          Evaluating Video & Body Language
                        </h3>
                        <p className="text-xs text-slate-700 font-black uppercase mt-1 animate-pulse">
                          Analyzing hand gestures, posture relaxation & pacing...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Idle default message */}
                  {recordingState === "idle" && !recordingFeedback && !isAnalyzingRecording && (
                    <div className="p-8 text-center bg-white border-3 border-black rounded-2xl flex flex-col items-center justify-center min-h-[380px] shadow-[6px_6px_0px_#000]">
                      <div className="w-12 h-12 bg-[#FFF9F2] border-2 border-black rounded-xl flex items-center justify-center mb-4 text-[#FF6B35] shadow-[2px_2px_0px_#000]">
                        <Video className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-black uppercase text-black mt-2 font-heading">
                        Ready to Rehearse on Stage?
                      </h4>
                      <p className="text-xs text-slate-700 max-w-sm font-semibold mt-2 leading-relaxed">
                        Enter your presentation topic and script details, select <strong className="text-black">Video Camera Practice</strong>, then click <strong className="text-black">Start Video Practice</strong>. Speak clearly while making natural hand gestures and maintaining relaxed posture!
                      </p>
                    </div>
                  )}

                  {/* Spoken & Video Feedback Results */}
                  {recordingFeedback && !isAnalyzingRecording && (
                    <div className="space-y-4">
                      
                      {/* Overall Score Banner */}
                      <div className="p-5 bg-white border-3 border-black rounded-2xl shadow-[6px_6px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase bg-[#FFD166] text-black border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                            Practice Evaluation Run
                          </span>
                          <h4 className="text-base font-black text-black mt-2 font-heading">
                            {presentationTitle || "My Presentation"}
                          </h4>
                          <p className="text-xs text-slate-700 font-bold mt-0.5">
                            Pacing Feedback: <span className="font-black text-[#FF6B35] uppercase">{recordingFeedback.speakingSpeedStatus}</span>
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black text-center min-w-[82px] shadow-[2px_2px_0px_#000]">
                            <p className="text-[9px] font-black text-black uppercase">Pacing</p>
                            <p className="text-lg font-black text-[#FF6B35] tabular-nums">{recordingFeedback.overallPacingScore}/100</p>
                          </div>
                          {recordingFeedback.bodyLanguageScore !== undefined && (
                            <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black text-center min-w-[82px] shadow-[2px_2px_0px_#000]">
                              <p className="text-[9px] font-black text-black uppercase">Body</p>
                              <p className="text-lg font-black text-[#06D6A0] tabular-nums">{recordingFeedback.bodyLanguageScore}/100</p>
                            </div>
                          )}
                          {recordingFeedback.deliveryConsistencyScore !== undefined && (
                            <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black text-center min-w-[82px] shadow-[2px_2px_0px_#000]">
                              <p className="text-[9px] font-black text-black uppercase">Consistency</p>
                              <p className="text-lg font-black text-sky-700 tabular-nums">{recordingFeedback.deliveryConsistencyScore}/100</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* MEASURED VIDEO & AUDIO TELEMETRY BREAKDOWN */}
                      {recordingFeedback.telemetry && (
                        <div className="p-5 bg-white border-3 border-black rounded-2xl space-y-3 shadow-[6px_6px_0px_#000]">
                          <div className="flex items-center justify-between border-b-2 border-black pb-2">
                            <span className="text-xs font-black uppercase text-black flex items-center gap-1.5 font-heading">
                              <Activity className="w-4 h-4 text-[#FF6B35]" /> Measured Video & Audio Telemetry
                            </span>
                            <span className="text-[10px] font-black text-black bg-[#06D6A0] border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                              Live Frame & Mic Data
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                              <p className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-1">
                                <Hand className="w-3 h-3 text-[#FF6B35]" /> Gestures
                              </p>
                              <p className="text-sm font-black text-black tabular-nums mt-0.5">{recordingFeedback.telemetry.gestureActivityPct}% active</p>
                            </div>

                            <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                              <p className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-emerald-700" /> Head Stability
                              </p>
                              <p className="text-sm font-black text-black tabular-nums mt-0.5">{recordingFeedback.telemetry.headStabilityPct}% steady</p>
                            </div>

                            <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                              <p className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-1">
                                <Eye className="w-3 h-3 text-sky-700" /> Eye Centering
                              </p>
                              <p className="text-sm font-black text-black tabular-nums mt-0.5">{recordingFeedback.telemetry.eyeZoneCenteredPct}% centered</p>
                            </div>

                            <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                              <p className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-1">
                                <Sun className="w-3 h-3 text-amber-600" /> Lighting
                              </p>
                              <p className="text-sm font-black text-black tabular-nums mt-0.5">{recordingFeedback.telemetry.lightingQuality}</p>
                            </div>

                            <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                              <p className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-1">
                                <Volume2 className="w-3 h-3 text-[#FF6B35]" /> Vocal Ratio
                              </p>
                              <p className="text-sm font-black text-black tabular-nums mt-0.5">
                                {recordingFeedback.telemetry.speakingRatioPct}% ({recordingFeedback.telemetry.pauseCount} pauses)
                              </p>
                            </div>

                            <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                              <p className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-1">
                                <Target className="w-3 h-3 text-purple-700" /> Script Match
                              </p>
                              <p className="text-sm font-black text-black tabular-nums mt-0.5">{recordingFeedback.telemetry.scriptCoveragePct}% covered</p>
                            </div>
                          </div>

                          {recordingFeedback.telemetry.missedKeywords && recordingFeedback.telemetry.missedKeywords.length > 0 && (
                            <div className="p-3 bg-amber-50 border-2 border-black rounded-xl text-xs space-y-1">
                              <p className="text-[10px] font-black uppercase text-amber-900">Missed Key Terms From Planned Script:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {recordingFeedback.telemetry.missedKeywords.slice(0, 6).map((kw) => (
                                  <span key={kw} className="px-2 py-0.5 bg-white border border-black rounded text-[11px] font-bold text-black">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {recordingFeedback.scriptAdherenceFeedback && (
                            <p className="text-xs text-slate-800 font-semibold leading-relaxed bg-[#FFF9F2] p-3 rounded-xl border-2 border-black">
                              <strong className="text-black uppercase text-[10px] block mb-0.5">Script Alignment:</strong>
                              {recordingFeedback.scriptAdherenceFeedback}
                            </p>
                          )}
                        </div>
                      )}

                      {/* TIMESTAMPED SPECIFIC VIDEO & AUDIO OBSERVATIONS */}
                      {recordingFeedback.specificObservations && recordingFeedback.specificObservations.length > 0 && (
                        <div className="p-5 bg-white border-3 border-black rounded-2xl space-y-3 shadow-[6px_6px_0px_#000]">
                          <div className="flex items-center justify-between border-b-2 border-black pb-2">
                            <span className="text-xs font-black uppercase text-black flex items-center gap-1.5 font-heading">
                              <Clock className="w-4 h-4 text-[#FF6B35]" /> Timestamped Observations & Fixes
                            </span>
                            <span className="text-[10px] font-black text-black bg-[#FFD166] border border-black px-2 py-0.5 rounded">
                              {recordingFeedback.specificObservations.length} Checks
                            </span>
                          </div>
                          <div className="space-y-2.5">
                            {recordingFeedback.specificObservations.map((obs, idx) => (
                              <div key={idx} className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono tabular-nums text-[10px] font-black bg-white border border-black px-1.5 py-0.5 rounded text-black">
                                      {obs.timestamp}
                                    </span>
                                    <span className="text-xs font-black uppercase text-black">{obs.area}</span>
                                  </div>
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black flex items-center gap-1 ${
                                    obs.status === "good" ? "bg-[#06D6A0] text-black" : "bg-amber-200 text-black"
                                  }`}>
                                    {obs.status === "good" ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                    <span>{obs.status === "good" ? "Strong" : "Fix Needed"}</span>
                                  </span>
                                </div>
                                <p className="text-xs text-slate-800 font-semibold leading-snug">{obs.finding}</p>
                                <p className="text-[11px] text-[#FF6B35] font-black leading-snug">Fix: {obs.fix}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PHYSICAL BODY LANGUAGE & STAGE PRESENCE SECTION */}
                      <div className="p-5 bg-white border-3 border-black rounded-2xl space-y-3 shadow-[6px_6px_0px_#000]">
                        <div className="flex items-center justify-between border-b-2 border-black pb-2">
                          <span className="text-xs font-black uppercase text-black flex items-center gap-1.5 font-heading">
                            <Hand className="w-4 h-4 text-[#FF6B35]" /> Hand Gestures & Physical Presence
                          </span>
                          <span className="text-[10px] font-black text-black bg-[#FFD166] border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                            Video Visual Feedback
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          
                          {/* Hand Gestures Card */}
                          <div className="bg-[#FFF9F2] p-3.5 rounded-xl border-2 border-black space-y-1 shadow-[2px_2px_0px_#000]">
                            <p className="text-[11px] font-black uppercase text-[#FF6B35] flex items-center gap-1">
                              <Hand className="w-3.5 h-3.5 text-[#FF6B35]" /> Hand Gestures
                            </p>
                            <p className="text-xs text-slate-800 font-medium leading-relaxed">
                              {recordingFeedback.handGesturesFeedback || "Gesture outward with open palms when introducing core ideas to connect with your classmates."}
                            </p>
                          </div>

                          {/* Posture & Relaxation Card */}
                          <div className="bg-[#FFF9F2] p-3.5 rounded-xl border-2 border-black space-y-1 shadow-[2px_2px_0px_#000]">
                            <p className="text-[11px] font-black uppercase text-emerald-800 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> Posture & Stability
                            </p>
                            <p className="text-xs text-slate-800 font-medium leading-relaxed">
                              {recordingFeedback.postureFeedback || "Keep your shoulders square and head steady within the upper alignment guide."}
                            </p>
                          </div>

                          {/* Eye Contact Card */}
                          <div className="bg-[#FFF9F2] p-3.5 rounded-xl border-2 border-black space-y-1 shadow-[2px_2px_0px_#000]">
                            <p className="text-[11px] font-black uppercase text-sky-800 flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-sky-700" /> Eye Contact
                            </p>
                            <p className="text-xs text-slate-800 font-medium leading-relaxed">
                              {recordingFeedback.eyeContactFeedback || "Maintain steady eye contact directly toward the camera lens to connect with your audience."}
                            </p>
                          </div>

                          {/* Expression Card */}
                          <div className="bg-[#FFF9F2] p-3.5 rounded-xl border-2 border-black space-y-1 shadow-[2px_2px_0px_#000]">
                            <p className="text-[11px] font-black uppercase text-amber-800 flex items-center gap-1">
                              <Smile className="w-3.5 h-3.5 text-amber-700" /> Facial Warmth & Lighting
                            </p>
                            <p className="text-xs text-slate-800 font-medium leading-relaxed">
                              {recordingFeedback.expressionFeedback || "Smile warmly during your opening hook to create instant connection."}
                            </p>
                          </div>

                        </div>

                        {/* Actionable Physical Stage Tips */}
                        {recordingFeedback.bodyLanguageActionableTips && recordingFeedback.bodyLanguageActionableTips.length > 0 && (
                          <div className="pt-2">
                            <p className="text-[11px] font-black uppercase text-black mb-1.5">Actionable Body Language Checklist:</p>
                            <ul className="space-y-1.5">
                              {recordingFeedback.bodyLanguageActionableTips.map((tip, idx) => (
                                <li key={idx} className="text-xs text-slate-800 font-semibold flex items-start gap-2 bg-[#FFF9F2] p-2 rounded-lg border-2 border-black shadow-[1px_1px_0px_#000]">
                                  <span className="text-[#FF6B35] font-black">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Speech Analytics details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Speed Metric */}
                        <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]">
                          <span className="text-[10px] font-black text-black uppercase">Speaking Speed</span>
                          <p className="text-base font-black text-[#FF6B35] mt-1 tabular-nums">{recordingFeedback.wordsPerMinute} Words/Min</p>
                          <p className="text-xs text-slate-600 font-medium mt-1">
                            {recordingFeedback.telemetry && (recordingFeedback.telemetry.firstHalfWpm > 0 || recordingFeedback.telemetry.secondHalfWpm > 0)
                              ? `First half: ${recordingFeedback.telemetry.firstHalfWpm} WPM • Second half: ${recordingFeedback.telemetry.secondHalfWpm} WPM`
                              : "Target range is 110–140 words per minute."}
                          </p>
                        </div>

                        {/* Time Metric */}
                        <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]">
                          <span className="text-[10px] font-black text-black uppercase">Duration</span>
                          <p className="text-base font-black text-sky-700 mt-1 tabular-nums">{formatRecordingDuration(recordingFeedback.speakingTimeSeconds)}</p>
                          <p className="text-xs text-slate-600 font-medium mt-1">
                            {recordingFeedback.telemetry
                              ? `${recordingFeedback.telemetry.activeSpeakingSeconds}s active speech • ${recordingFeedback.telemetry.silenceSeconds}s pauses`
                              : "Measured practice session length."}
                          </p>
                        </div>

                      </div>

                      {/* Speech Clarity & Confidence */}
                      <div className="bg-white p-5 rounded-xl border-2 border-black space-y-3 shadow-[3px_3px_0px_#000]">
                        <div>
                          <p className="text-xs font-black uppercase text-emerald-800 flex items-center gap-1">
                            <Smile className="w-3.5 h-3.5" /> Speech Clarity Advice
                          </p>
                          <p className="text-xs text-slate-800 mt-1 font-medium leading-relaxed">{recordingFeedback.clarity}</p>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase text-sky-800 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5" /> Voice Confidence
                          </p>
                          <p className="text-xs text-slate-800 mt-1 font-medium leading-relaxed">{recordingFeedback.confidence}</p>
                        </div>
                      </div>

                      {/* Filler Words Metric */}
                      <div className="p-5 bg-white border-2 border-black rounded-xl space-y-3 shadow-[3px_3px_0px_#000]">
                        <p className="text-xs font-black uppercase text-black">
                          Spoken Filler Words Detected:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(recordingFeedback.fillerWordsCount || {}).map(([word, count]) => {
                            const numCount = Number(count);
                            return (
                              <span key={word} className={`px-2.5 py-1 text-xs font-black rounded-lg border-2 border-black shadow-[1px_1px_0px_#000] tabular-nums ${numCount > 0 ? "bg-rose-100 text-rose-900" : "bg-[#06D6A0]/20 text-emerald-900"}`}>
                                {word.toUpperCase()}: <span className="underline">{numCount} times</span>
                              </span>
                            );
                          })}
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
                          "{recordingFeedback.fillerWordsAnalysis}"
                        </p>
                      </div>

                      {/* Parts to improve */}
                      <div className="p-5 bg-white border-2 border-black rounded-xl space-y-2 shadow-[3px_3px_0px_#000]">
                        <p className="text-xs font-black uppercase text-amber-800 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-amber-600" /> Delivery Parts to Improve:
                        </p>
                        <ul className="space-y-2.5 pt-1.5">
                          {recordingFeedback.partsToImprove?.map((part, idx) => (
                            <li key={idx} className="text-xs text-slate-800 font-semibold flex gap-2">
                              <span className="bg-[#FFD166] border border-black w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black text-black shadow-[1px_1px_0px_#000]">{idx + 1}</span>
                              <span className="leading-snug">{part}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Suggested audience questions */}
                      <div className="p-5 bg-white border-2 border-black rounded-xl space-y-2 shadow-[3px_3px_0px_#000]">
                        <p className="text-xs font-black uppercase text-sky-800 flex items-center gap-1">
                          <HelpCircle className="w-4 h-4 text-sky-600" /> Expected Audience Class Q&A:
                        </p>
                        <ul className="space-y-2 pt-1">
                          {recordingFeedback.suggestedQuestions?.map((q, idx) => (
                            <li key={idx} className="text-xs text-slate-800 font-medium italic leading-relaxed bg-[#FFF9F2] p-2.5 rounded-lg border-2 border-black shadow-[1px_1px_0px_#000]">
                              "{q}"
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* General feedback paragraph */}
                      <div className="p-5 bg-white border-2 border-black text-black rounded-xl space-y-1 shadow-[3px_3px_0px_#000]">
                        <p className="text-[10px] font-black uppercase tracking-wider"><span className="text-black font-black">Juno</span><span className="text-[#FF6B35] font-black">AI</span> Summary</p>
                        <p className="text-xs font-medium text-slate-800 leading-relaxed">{recordingFeedback.generalFeedback}</p>
                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>

            {/* Multi-Tester Accuracy Verification & Human Tester Feedback Panel */}
            <TesterCalibrationPanel currentFeedback={recordingFeedback} />

        </div>
        )}

        {activeTab === "qna" && (
          <QnaDefenseBlooketLab
            questions={
              quizSource === "notes"
                ? dynamicQuizDeck.map((d, i) => ({
                    difficulty: i % 2 === 0 ? "Medium" : "Challenging",
                    question: d.front,
                    modelAnswer: d.back
                  }))
                : (analysis?.questions && analysis.questions.length > 0
                    ? analysis.questions
                    : dynamicQuizDeck.map((d, i) => ({
                        difficulty: i % 2 === 0 ? "Medium" : "Challenging",
                        question: d.front,
                        modelAnswer: d.back
                      }))
                  )
            }
            presentationTitle={activeContentTitle}
            scriptText={activeContentText}
            quizSource={quizSource}
            onSwitchSource={(src) => setQuizSource(src)}
            onOpenSourcePicker={() => setShowQuizSourceModal(true)}
          />
        )}

        {activeTab === "warmup" && (
          <div className="space-y-8 relative z-10 animate-fade-in" id="revision-games-container">

            {isGameActive ? (
              <div className="w-full animate-fadeIn">
                {selectedGame === "slime-merge" ? (
                  <SlimeMergeGame
                    deck={deck}
                    presentationTitle={activeContentTitle}
                    onClose={handleExitGame}
                  />
                ) : (
                  <TowerDefenseGame
                    deck={deck}
                    onClose={handleExitGame}
                  />
                )}
              </div>
            ) : (
                  <div className="space-y-6">
                    {/* Revision Game Arena Banner */}
                    <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] relative overflow-hidden">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="bg-[#A855F7] p-3 rounded-2xl border-2 border-black text-white shadow-[3px_3px_0px_#000]">
                            <Gamepad2 className="w-7 h-7 stroke-[2.5]" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-black bg-[#FFD166] text-black px-2.5 py-0.5 rounded border border-black uppercase tracking-wider">
                                Interactive Study
                              </span>
                              <span className="text-[10px] font-black bg-[#06D6A0] text-black px-2.5 py-0.5 rounded border border-black uppercase tracking-wider">
                                {quizSource === "notes" ? "Powered By Your Notes" : "Powered By Your Script"}
                              </span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-black font-heading mt-1">
                              Presentation <span className="text-[#A855F7]">Revision Games</span>
                            </h2>
                            <p className="text-xs text-slate-700 font-semibold mt-0.5">
                              Sharpen your recall and master your speaking points before presenting! Every question asked in these games tests your actual {quizSource === "notes" ? "research notes" : "presentation script"} and defense.
                            </p>
                          </div>
                        </div>

                        {/* Source Toggle & Challenges Count */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1 bg-[#FFF9F2] p-1.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000]">
                            <span className="text-[10px] font-black uppercase text-slate-600 px-1">Quiz Source:</span>
                            <button
                              onClick={() => setQuizSource("script")}
                              className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-black flex items-center gap-1 uppercase ${
                                quizSource === "script"
                                  ? "bg-[#FF6B35] text-white shadow-[2px_2px_0px_#000]"
                                  : "bg-white text-black hover:bg-amber-100"
                              }`}
                            >
                              <span>📝 Script</span>
                            </button>
                            <button
                              onClick={() => setQuizSource("notes")}
                              className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-black flex items-center gap-1 uppercase ${
                                quizSource === "notes"
                                  ? "bg-[#06D6A0] text-black shadow-[2px_2px_0px_#000]"
                                  : "bg-white text-black hover:bg-emerald-100"
                              }`}
                            >
                              <span>📋 Notes</span>
                            </button>
                            <button
                              onClick={() => setShowQuizSourceModal(true)}
                              className="p-1.5 bg-white hover:bg-slate-100 text-black border-2 border-black rounded-xl text-[10px] font-black uppercase shadow-[1px_1px_0px_#000] cursor-pointer"
                              title="Open Source Selector Modal"
                            >
                              ⚡
                            </button>
                          </div>

                          <div className="bg-[#FFF9F2] p-3 rounded-2xl border-2 border-black text-right shadow-[3px_3px_0px_#000] shrink-0">
                            <p className="text-[10px] font-black uppercase text-slate-600">Active Questions Loaded</p>
                            <p className="text-xl font-black text-[#A855F7] font-heading">{deck.length} Challenges</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* The Two Games Selector Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Game 1: Tower Defense */}
                      <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000] transition-all flex flex-col justify-between space-y-5">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b-2 border-black pb-3">
                            <span className="text-[10px] font-black bg-[#06D6A0] text-black border border-black px-2.5 py-0.5 rounded uppercase tracking-wider shadow-[1px_1px_0px_#000]">
                              Strategy Tower Defense
                            </span>
                            <span className="text-xs font-black text-black flex items-center gap-1 font-heading">
                              <Shield className="w-3.5 h-3.5 fill-black text-black" /> Wave Defense
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#06D6A0] rounded-2xl border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000] shrink-0 text-2xl">
                              🏰
                            </div>
                            <div>
                              <h3 className="text-lg font-black uppercase text-black font-heading">
                                Tower Defense: Script Battle
                              </h3>
                              <p className="text-xs text-slate-600 font-semibold">
                                Place and merge elemental defense towers to stop incoming waves of Skeptics!
                              </p>
                            </div>
                          </div>

                          <div className="p-3.5 bg-[#FFF9F2] rounded-2xl border-2 border-black text-xs font-medium text-slate-800 space-y-1.5 shadow-[2px_2px_0px_#000]">
                            <p className="font-black text-black uppercase text-[11px] font-heading">
                              🎮 How Script Questions Work in Game:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 font-semibold">
                              <li>Answer active-recall questions from your speech between waves</li>
                              <li>Correct answers grant bonus Gold to build & upgrade towers</li>
                              <li>Drag & merge matching tower tiers for devastating firepower</li>
                            </ul>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartTowerDefenseGame()}
                          className="w-full py-4 bg-[#06D6A0] hover:bg-[#05be8d] text-black font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 font-heading"
                        >
                          <Play className="w-4 h-4 fill-black text-black" />
                          <span>Play Tower Defense</span>
                        </button>
                      </div>

                      {/* Game 2: Slime & Monster Merge (Suika Style) */}
                      <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000] transition-all flex flex-col justify-between space-y-5">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b-2 border-black pb-3">
                            <span className="text-[10px] font-black bg-[#A855F7] text-white border border-black px-2.5 py-0.5 rounded uppercase tracking-wider shadow-[1px_1px_0px_#000]">
                              Physics Merge • Suika Style
                            </span>
                            <span className="text-xs font-black text-black flex items-center gap-1 font-heading">
                              <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" /> 10 Evolution Tiers
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#A855F7] rounded-2xl border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000] shrink-0 text-3xl">
                              👾
                            </div>
                            <div>
                              <h3 className="text-lg font-black uppercase text-black font-heading">
                                Slime & Monster Merge
                              </h3>
                              <p className="text-xs text-slate-600 font-semibold">
                                Drop and merge cute original slimes into the Legendary King with satisfying physics!
                              </p>
                            </div>
                          </div>

                          <div className="p-3.5 bg-[#FFF9F2] rounded-2xl border-2 border-black text-xs font-medium text-slate-800 space-y-1.5 shadow-[2px_2px_0px_#000]">
                            <p className="font-black text-black uppercase text-[11px] font-heading">
                              🎮 How Script Questions Work in Game:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 font-semibold">
                              <li>Every 4 monster drops, a presentation question pops out smoothly</li>
                              <li>Correct answers grant +150 bonus score and boost your ranking</li>
                              <li>Watch the danger line at the top to prevent container overflow</li>
                            </ul>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartSlimeMergeGame()}
                          className="w-full py-4 bg-[#A855F7] hover:bg-[#9333ea] text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 font-heading"
                        >
                          <Play className="w-4 h-4 fill-white text-white" />
                          <span>Play Slime Merge</span>
                        </button>
                      </div>

                    </div>

                    {/* Sourced Questions Preview List */}
                    <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black pb-3 gap-2">
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-wider text-black font-heading flex items-center gap-2">
                            <span>📜 Script Questions Loaded Into Game Engine ({deck.length})</span>
                          </h3>
                          <p className="text-[11px] text-slate-600 font-semibold">
                            These questions are generated dynamically from your presentation script and Q&A defense.
                          </p>
                        </div>

                        <span className="text-[10px] font-black bg-[#FFD166] text-black border border-black px-2.5 py-1 rounded-xl shadow-[1px_1px_0px_#000] uppercase">
                          Topic: {presentationTitle || "Current Presentation"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                        {deck.map((card, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 bg-[#FFF9F2] rounded-2xl border-2 border-black text-xs space-y-1 shadow-[2px_2px_0px_#000]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black bg-white border border-black px-2 py-0.5 rounded text-black shadow-[1px_1px_0px_#000]">
                                Question #{idx + 1}
                              </span>
                              <span className="text-[10px] font-black text-[#FF6B35] uppercase">
                                Script Recall
                              </span>
                            </div>
                            <p className="font-black text-black text-xs leading-snug">
                              {card.front}
                            </p>
                            <p className="text-[11px] text-slate-700 font-semibold line-clamp-2 italic bg-white/70 p-1.5 rounded-lg border border-black/40 mt-1">
                              Answer: "{card.back}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
          </div>
        )}

        {activeTab === "flashcards" && (
          <div className="space-y-6">
            <div className="bg-white border-3 border-black rounded-3xl p-8 shadow-[6px_6px_0px_#000] text-center space-y-4 max-w-xl mx-auto">
              <div className="bg-[#A855F7] w-16 h-16 mx-auto rounded-2xl border-2 border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000] text-white">
                👾
              </div>
              <h3 className="text-xl font-black uppercase text-black font-heading">
                Revision Games Hub
              </h3>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                Play <strong>Slime & Monster Merge</strong> and <strong>Tower Defense</strong> with questions dynamically generated from your script.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveTab("warmup");
                  }}
                  className="px-6 py-3.5 bg-[#A855F7] hover:bg-[#9333ea] text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                >
                  Open Revision Games →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tracker" && (
          <div className="space-y-6 relative z-10">
            
            {/* Version Scorecard Tracker */}
            <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] relative overflow-hidden">
              <h3 className="text-lg font-black uppercase tracking-wider text-black flex items-center gap-2 mb-2 mt-2 font-heading">
                📈 Improvement Tracker
              </h3>
              <p className="text-xs text-slate-700 mb-6 font-bold leading-normal">
                Store scores over different iterations (Version 1, Version 2, etc.) to see how adjustments improve presentation clarity, filler word usage, and overall grade!
              </p>

              {savedPresentations.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Saved list on Left */}
                  <div className="lg:col-span-4 space-y-3 text-left">
                    <p className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1 font-heading">
                      <span>📁</span> Saved Versions History:
                    </p>
                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                      {savedPresentations.map((item, idx) => {
                        const isSelected = selectedSavedPresentationId === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedSavedPresentationId(item.id);
                              setScript(item.script);
                              setTargetYear(item.targetYear);
                              setAnalysis(item.analysis);
                              setPresentationTitle(item.title);
                            }}
                            className={`p-3.5 rounded-xl border-2 border-black cursor-pointer transition-all flex justify-between items-center ${
                              isSelected
                                ? "bg-[#FFF9F2] shadow-[3px_3px_0px_#000]"
                                : "bg-white hover:bg-slate-50 shadow-[1px_1px_0px_#000]"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black bg-[#FFD166] text-black border border-black px-2 py-0.5 rounded uppercase shadow-[1px_1px_0px_#000]">
                                  V{savedPresentations.length - idx}
                                </span>
                                <span className="text-xs font-black text-black truncate max-w-[120px]">{item.title}</span>
                              </div>
                              <p className="text-[9px] text-slate-600 mt-1 font-bold">
                                {item.timestamp} • {item.targetYear}
                              </p>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs bg-[#06D6A0] border border-black px-2 py-0.5 rounded text-black font-black shadow-[1px_1px_0px_#000]">
                                {item.analysis.scores.overall}%
                              </span>
                              <button
                                onClick={(e) => deleteSavedPresentation(item.id, e)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Graph or comparison on right */}
                  <div className="lg:col-span-8 space-y-6 text-left">
                    
                    {/* Visual Improvement Flow */}
                    <div className="bg-[#FFF9F2] p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000]">
                      <p className="text-xs font-black text-black uppercase tracking-wider mb-4 flex items-center gap-1.5 font-heading">
                        <span>📊</span> Improvement Over Time:
                      </p>
                      
                      <div className="flex flex-row items-end justify-around gap-4 h-48 border-b-2 border-black pb-4">
                        {savedPresentations.slice().reverse().map((item, idx) => (
                          <div key={item.id} className="flex flex-col items-center flex-1 max-w-[120px] relative group cursor-pointer">
                            
                            {/* Score tooltip */}
                            <div className="absolute -top-10 bg-black text-[#FFD166] text-[10px] font-black py-1 px-2.5 rounded border border-black shadow-[2px_2px_0px_#000]">
                              {item.analysis.scores.overall}%
                            </div>
 
                            {/* Column block */}
                            <div
                              style={{ height: `${item.analysis.scores.overall * 1.2}px` }}
                              className="w-10 sm:w-12 bg-[#FF6B35] rounded-t-lg border-2 border-black transition-all flex items-end justify-center pb-2 shadow-[2px_2px_0px_#000] group-hover:scale-105"
                            >
                              <span className="text-[10px] font-black text-white">V{idx + 1}</span>
                            </div>

                            <p className="text-[10px] font-black text-slate-800 mt-2 text-center truncate w-full">
                              {item.title}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-black font-black uppercase tracking-wider">
                          <TrendingUp className="w-4 h-4 animate-bounce text-[#FF6B35]" />
                          <span>
                            {savedPresentations.length > 1
                              ? `Score increased by ${
                                  savedPresentations[0].analysis.scores.overall -
                                  savedPresentations[savedPresentations.length - 1].analysis.scores.overall
                                }% since version 1!`
                              : "Create another iteration to plot progress over time!"}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab("script");
                          }}
                          className="text-xs font-black bg-[#FF6B35] hover:bg-[#e0531e] text-white px-4 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer uppercase tracking-wider"
                        >
                          Create New Version
                        </button>
                      </div>

                    </div>

                    {/* Quick breakdown of last run */}
                    {selectedSavedPresentationId && (
                      <div className="bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000]">
                        {(() => {
                          const item = savedPresentations.find(p => p.id === selectedSavedPresentationId);
                          if (!item) return null;
                          return (
                            <div>
                              <h4 className="text-xs font-black text-black uppercase mb-1 flex items-center gap-1.5 font-heading">
                                📝 Saved Version Details: "{item.title}"
                              </h4>
                              <p className="text-[11px] text-slate-600 font-bold italic mb-4 leading-normal">
                                Analyzed on {item.timestamp} for {item.targetYear}
                              </p>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_#000]">
                                  <p className="text-[9px] text-black font-black uppercase tracking-wide">Clarity</p>
                                  <p className="text-base font-black text-[#FF6B35]">{item.analysis.scores.clarity}%</p>
                                </div>
                                <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_#000]">
                                  <p className="text-[9px] text-black font-black uppercase tracking-wide">Confidence</p>
                                  <p className="text-base font-black text-[#FF6B35]">{item.analysis.scores.confidence}%</p>
                                </div>
                                <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_#000]">
                                  <p className="text-[9px] text-black font-black uppercase tracking-wide">Engagement</p>
                                  <p className="text-base font-black text-[#FF6B35]">{item.analysis.scores.engagement}%</p>
                                </div>
                                <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black text-center shadow-[2px_2px_0px_#000]">
                                  <p className="text-[9px] text-black font-black uppercase tracking-wide">Overall Score</p>
                                  <p className="text-base font-black text-[#06D6A0]">{item.analysis.scores.overall}%</p>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setScript(item.script);
                                  setTargetYear(item.targetYear);
                                  setAnalysis(item.analysis);
                                  setPresentationTitle(item.title);
                                  setActiveTab("script");
                                }}
                                className="mt-5 w-full sm:w-auto text-xs font-black bg-[#FFD166] text-black border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider cursor-pointer font-heading"
                              >
                                Load Script to Main Editor <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                  </div>

                </div>
              ) : (
                <div className="p-8 text-center bg-[#FFF9F2] border-2 border-black rounded-2xl flex flex-col items-center justify-center min-h-[300px] shadow-[4px_4px_0px_#000]">
                  <TrendingUp className="w-12 h-12 text-[#FF6B35] mb-3 animate-pulse" />
                  <p className="text-base font-black text-black uppercase tracking-wide font-heading">
                    No improvement data tracked yet!
                  </p>
                  <p className="text-xs text-slate-700 mt-2 max-w-sm font-bold leading-relaxed mx-auto">
                    Once you save runs inside the <strong>Script Analyzer</strong>, your progress will be plotted here so you can verify that your presentation skills are continuously improving!
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Diagnostics Panel */}
        {showDiagnostics && (
          <div className="mt-8 bg-white text-black rounded-2xl p-6 border-3 border-black shadow-[6px_6px_0px_#000] font-mono text-xs text-left">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#06D6A0] border border-black animate-ping"></span>
                <h3 className="text-sm font-black tracking-wide text-black font-heading">
                  ⚡ SYSTEM DIAGNOSTICS CONTROL PANEL
                </h3>
              </div>
              <button
                onClick={() => setShowDiagnostics(false)}
                className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 rounded-lg border border-black text-[10px] font-black text-white uppercase shadow-[1px_1px_0px_#000]"
              >
                Close Panel [x]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                <p className="text-slate-700 uppercase font-black tracking-wider text-[10px] mb-1">Gemini API Connection</p>
                <p className="text-xs font-black flex items-center gap-1.5 text-black">
                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${isKeyConfigured ? "bg-[#06D6A0]" : "bg-[#FFD166]"}`}></span>
                  {isKeyConfigured ? "Connected (API Key OK)" : "API Key Missing (Using local analysis fallbacks)"}
                </p>
              </div>
              <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                <p className="text-slate-700 uppercase font-black tracking-wider text-[10px] mb-1">Response Engine Status</p>
                <p className="text-xs font-black text-indigo-700">
                  {diagnosticStatus || "Operational"}
                </p>
              </div>
              <div className="bg-[#FFF9F2] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                <p className="text-slate-700 uppercase font-black tracking-wider text-[10px] mb-1">Primary Model Selection</p>
                <p className="text-xs font-black text-[#FF6B35]">
                  gemini-2.5-flash
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-700 uppercase font-black tracking-wider mb-1 border-b-2 border-black pb-1">
                <span>Recent System Logs & Request Status</span>
                <span>Auto-refreshing (4s)</span>
              </div>
              {diagnosticLogs.length === 0 ? (
                <div className="p-4 text-center text-slate-600 bg-[#FFF9F2] rounded-xl border-2 border-black">
                  No requests sent yet. Start analyzing a script or checking slides to populate diagnostic logs.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {diagnosticLogs.map((log: any) => (
                    <div key={log.id} className="p-2.5 bg-[#FFF9F2] rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-600 text-[10px] font-bold">{log.timestamp}</span>
                        <span className="bg-white text-black px-1.5 py-0.5 rounded text-[10px] font-black border border-black">{log.endpoint}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border border-black ${
                          log.status === "success" 
                            ? "bg-[#06D6A0] text-black" 
                            : log.status === "retry"
                            ? "bg-amber-100 text-amber-900"
                            : log.status === "fallback"
                            ? "bg-indigo-100 text-indigo-900"
                            : "bg-rose-100 text-rose-900"
                        }`}>
                          {log.status}
                        </span>
                        {log.isFallback && (
                          <span className="bg-purple-100 text-purple-900 border border-purple-800 px-1 rounded text-[9px] font-black uppercase">
                            Fallback Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-600 font-bold">
                        {log.durationMs > 0 && <span>Duration: {log.durationMs}ms</span>}
                        {log.retryCount > 0 && <span className="text-amber-600">Retries: {log.retryCount}</span>}
                        <span className="text-slate-800 font-black">Model: {log.model}</span>
                      </div>
                      {log.message && (
                        <p className="w-full text-left text-slate-700 text-[10px] mt-1 italic pl-2 border-l-2 border-black block">
                          → {log.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-xs font-semibold text-slate-600 border-t-2 border-black pt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black text-black">
            <button
              onClick={() => setShowHelpModal(true)}
              className="hover:text-[#FF6B35] transition-colors cursor-pointer flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#FF6B35]" /> User Guide
            </button>
            <span className="text-slate-400">•</span>
            <button
              onClick={() => setShowAboutModal(true)}
              className="hover:text-[#FF6B35] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" /> About
            </button>
            <span className="text-slate-400">•</span>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-[#FF6B35] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> Privacy Notice
            </button>
            <span className="text-slate-400">•</span>
            <button
              onClick={() => setShowDisclaimerModal(true)}
              className="hover:text-[#FF6B35] transition-colors cursor-pointer flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> AI Disclaimer
            </button>
          </div>

          <p>© 2026 <span className="text-black font-black">Juno</span><span className="text-[#FF6B35] font-black">AI</span>.</p>
          <p className="text-[10px] text-slate-500 font-medium">Safe in-browser analysis with smart offline fallbacks. No login or personal data is collected.</p>
          
          <button 
            onClick={() => setShowDiagnostics(prev => !prev)}
            className="mt-3 text-[10px] font-black uppercase tracking-wider text-black hover:text-[#FF6B35] transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
          >
            🛠️ System Diagnostics Panel {showDiagnostics ? "(Hide)" : "(Show)"}
          </button>
        </footer>

        {/* ========================================================= */}
        {/* 1. HELP / USER GUIDE MODAL */}
        {/* ========================================================= */}
        {showHelpModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" id="help-user-guide-modal">
            <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 max-w-3xl w-full text-black shadow-[10px_10px_0px_#000] relative space-y-6 max-h-[90vh] overflow-y-auto">
              
              <button
                onClick={() => setShowHelpModal(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-[#FFF9F2] hover:bg-slate-100 border-2 border-black flex items-center justify-center font-black text-sm transition-all text-black cursor-pointer shadow-[2px_2px_0px_#000]"
                aria-label="Close Guide"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 border-b-2 border-black pb-4">
                <div className="p-3 bg-[#FFD166] border-2 border-black rounded-2xl text-black shadow-[2px_2px_0px_#000]">
                  <HelpCircle className="w-7 h-7 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-wider text-black font-heading">
                    📖 <span className="text-black font-black">Juno</span><span className="text-[#FF6B35] font-black">AI</span> User Guide & Masterclass
                  </h3>
                  <p className="text-xs text-[#FF6B35] font-black uppercase tracking-wide">
                    Everything you need to get 100% scores & impress your audience
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-800 leading-relaxed font-medium">
                
                {/* Module 1: Script Analyzer */}
                <div className="bg-[#FFF9F2] p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                  <h4 className="text-sm font-black text-black uppercase flex items-center gap-2 font-heading">
                    <FileText className="w-4 h-4 text-[#FF6B35]" /> 1. Script Analysis (Write & Grade)
                  </h4>
                  <p>
                    Paste your presentation text or upload a <code className="text-[#FF6B35] bg-white px-1.5 py-0.5 rounded border border-black font-bold">.txt</code> file.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1 font-semibold">
                    <li><strong className="text-black">Scores Out of 100:</strong> Evaluates Clarity, Confidence, Engagement, Vocabulary, Organization, and Professionalism.</li>
                    <li><strong className="text-black">Quick Helper Buttons:</strong> Click <em>"Insert [PAUSE 2s]"</em> to add deliberate breath pauses, or <em>"Add Catchy Hook Intro"</em> to start strong!</li>
                    <li><strong className="text-black">Teacher Mode:</strong> Get estimated letter grades (A+, A, B) with specific next steps.</li>
                  </ul>
                </div>

                {/* Module 2: Slide Checker */}
                <div className="bg-[#FFF9F2] p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                  <h4 className="text-sm font-black text-black uppercase flex items-center gap-2 font-heading">
                    <Sparkles className="w-4 h-4 text-sky-600" /> 2. Slide Checker (10-20-30 Rule)
                  </h4>
                  <p>
                    Paste slide bullet points to check for text clutter. Slides with over 50 words will be flagged as overcrowded because audiences read slides instead of listening to you!
                  </p>
                </div>

                {/* Module 3: Practice Room */}
                <div className="bg-[#FFF9F2] p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                  <h4 className="text-sm font-black text-black uppercase flex items-center gap-2 font-heading">
                    <Volume2 className="w-4 h-4 text-emerald-600" /> 3. Practice Room & Speech Pacing
                  </h4>
                  <p>
                    Hit <strong className="text-[#FF6B35]">Record Spoken Practice</strong> and speak your talk into your microphone. <span className="text-black font-black">Juno</span><span className="text-[#FF6B35] font-black">AI</span> measures your real-time <strong>Words Per Minute (WPM)</strong>:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black">
                    <div className="bg-rose-50 p-2 rounded-xl border border-black text-rose-700 shadow-[1px_1px_0px_#000]">&lt; 100 WPM (Too Slow)</div>
                    <div className="bg-emerald-50 p-2 rounded-xl border border-black text-emerald-800 shadow-[1px_1px_0px_#000]">110 - 140 WPM (Great Pacing!)</div>
                    <div className="bg-amber-50 p-2 rounded-xl border border-black text-amber-800 shadow-[1px_1px_0px_#000]">&gt; 150 WPM (Too Fast)</div>
                  </div>
                </div>

                {/* Module 4: Questions */}
                <div className="bg-[#FFF9F2] p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                  <h4 className="text-sm font-black text-black uppercase flex items-center gap-2 font-heading">
                    <Shield className="w-4 h-4 text-amber-600" /> 4. Questions (Inquiry & PREP Strategy)
                  </h4>
                  <p>
                    Master answering unexpected questions from teachers or judges using the <strong>PREP Framework</strong>:
                  </p>
                  <p className="bg-white p-2.5 rounded-xl border-2 border-black text-[11px] font-mono text-black font-bold">
                    P = Point (Direct answer) ➔ R = Reason (Why) ➔ E = Example (Fact/Story) ➔ P = Point (Wrap up summary)
                  </p>
                </div>

                {/* Module 5: Notes & Research */}
                <div className="bg-[#FFF9F2] p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                  <h4 className="text-sm font-black text-black uppercase flex items-center gap-2 font-heading">
                    <BookOpen className="w-4 h-4 text-emerald-600" /> 5. Notes & Research
                  </h4>
                  <p>
                    Paste or upload your study notes, bullet outlines, or reference materials, then switch quiz sources seamlessly between your Script and Notes.
                  </p>
                </div>

                {/* Module 6: Revision Games */}
                <div className="bg-[#FFF9F2] p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
                  <h4 className="text-sm font-black text-black uppercase flex items-center gap-2 font-heading">
                    <Zap className="w-4 h-4 text-purple-600" /> 6. Revision Games
                  </h4>
                  <p>
                    Turn your Script or Notes into active recall challenges! Play <strong>Tower Defense</strong> or drop and evolve slimes in <strong>Slime &amp; Monster Merge</strong> where a question pops out every 4 drops.
                  </p>
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="py-3 px-6 bg-[#06D6A0] text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] hover:bg-[#05be8d] transition-all cursor-pointer uppercase tracking-wider font-heading"
                >
                  Close & Start Practicing! 🚀
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. ABOUT JUNOAI MODAL */}
        {/* ========================================================= */}
        {showAboutModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" id="about-junoai-modal">
            <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 max-w-2xl w-full text-black shadow-[10px_10px_0px_#000] relative space-y-6 max-h-[90vh] overflow-y-auto">
              
              <button
                onClick={() => setShowAboutModal(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-[#FFF9F2] hover:bg-slate-100 border-2 border-black flex items-center justify-center font-black text-sm transition-all text-black cursor-pointer shadow-[2px_2px_0px_#000]"
                aria-label="Close About"
              >
                ✕
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4 border-b-2 border-black pb-4">
                <img 
                  src={theme === "default" ? robotGraduateLogo : cyberGreenLogo} 
                  alt={theme === "medal" ? "JunoAI Championship Medal Emblem" : theme === "dark_neon" ? "JunoAI Cyber Medal Emblem" : "JunoAI Robot Mascot"} 
                  referrerPolicy="no-referrer"
                  className={`w-20 h-20 rounded-2xl border-3 object-cover ${
                    theme === "medal" ? "border-[#D4AF37] shadow-[4px_4px_0px_#8C6212] ring-2 ring-[#FFDF73]/50" : "border-black shadow-[4px_4px_0px_#000]"
                  }`}
                />
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-wider text-black font-heading flex items-center gap-2">
                    <span className="text-black font-black">Juno</span><span className="text-[#FF6B35] font-black">AI</span>
                    {theme === "medal" && <span className="text-base">🏅</span>}
                  </h3>
                  <p className={`text-xs font-black uppercase tracking-wider ${theme === "medal" ? "text-[#D4AF37]" : "text-[#FF6B35]"}`}>
                    {theme === "medal" ? "Championship Edition • Presentation Coach" : "Presentation & Speech Coach"}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-800 leading-relaxed font-medium">
                <p>
                  <strong className="text-black font-black">Juno</strong><span className="text-[#FF6B35] font-black">AI</span> is designed to help speakers master presentation delivery, structure convincing scripts, and conquer stage fright.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                    <p className="font-black text-[#FF6B35] uppercase text-[11px] mb-1 font-heading">🎯 Real Problem Solved</p>
                    <p className="text-slate-700 text-[11px] font-semibold">Transforms nervous speeches into structured, engaging presentations with real-time feedback.</p>
                  </div>
                  <div className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                    <p className="font-black text-[#FF6B35] uppercase text-[11px] mb-1 font-heading">⚡ High Reliability</p>
                    <p className="text-slate-700 text-[11px] font-semibold">Powered by Google Gemini API with smart offline fallback models for 100% continuous uptime.</p>
                  </div>
                  <div className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                    <p className="font-black text-[#FF6B35] uppercase text-[11px] mb-1 font-heading">🎮 Gamified Learning</p>
                    <p className="text-slate-700 text-[11px] font-semibold">Active recall quizzes powered by your Script or Notes in Tower Defense and Slime &amp; Monster Merge.</p>
                  </div>
                  <div className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                    <p className="font-black text-[#FF6B35] uppercase text-[11px] mb-1 font-heading">🔒 100% Safe & Private</p>
                    <p className="text-slate-700 text-[11px] font-semibold">Zero account login required. Scripts and audio remain completely private to your session.</p>
                  </div>
                </div>

                <div className="bg-[#FFF9F2] p-4 rounded-xl border-2 border-black text-[11px] text-slate-700 font-bold">
                  <p className="font-black text-black uppercase mb-1 font-heading">Tech Stack:</p>
                  <p>React 18 • TypeScript • Tailwind CSS • Lucide Icons • Web Speech API • Google Gemini 2.5 • Canvas 2D Engine</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowAboutModal(false)}
                  className="py-2.5 px-6 bg-[#FF6B35] text-white font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] hover:bg-[#e0531e] transition-all cursor-pointer uppercase tracking-wider font-heading"
                >
                  Awesome!
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. PRIVACY NOTICE MODAL */}
        {/* ========================================================= */}
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" id="privacy-notice-modal">
            <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 max-w-xl w-full text-black shadow-[10px_10px_0px_#000] relative space-y-6">
              
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-[#FFF9F2] hover:bg-slate-100 border-2 border-black flex items-center justify-center font-black text-sm transition-all text-black cursor-pointer shadow-[2px_2px_0px_#000]"
                aria-label="Close Privacy"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 border-b-2 border-black pb-4">
                <div className="p-3 bg-[#06D6A0] border-2 border-black rounded-2xl text-black shadow-[2px_2px_0px_#000]">
                  <Shield className="w-7 h-7 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-black font-heading">
                    🔒 Privacy Notice & Student Protection
                  </h3>
                  <p className="text-xs text-emerald-700 font-black uppercase tracking-wider">
                    No Personal Data is Ever Collected or Sold
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-800 leading-relaxed font-medium">
                <div className="p-3.5 bg-[#FFF9F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
                  <p className="font-black text-black flex items-center gap-1.5 font-heading">
                    <span className="text-emerald-600">✓</span> 1. Zero Account / Login Requirement
                  </p>
                  <p className="text-slate-700 text-[11px] font-semibold">You do not need to register, provide an email address, or create a password to use JunoAi.</p>
                </div>

                <div className="p-3.5 bg-[#FFF9F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
                  <p className="font-black text-black flex items-center gap-1.5 font-heading">
                    <span className="text-emerald-600">✓</span> 2. In-Memory Session Processing
                  </p>
                  <p className="text-slate-700 text-[11px] font-semibold">Your presentation scripts, slide texts, and spoken microphone practice runs are processed live solely to produce feedback scores. Nothing is stored permanently on external servers.</p>
                </div>

                <div className="p-3.5 bg-[#FFF9F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
                  <p className="font-black text-black flex items-center gap-1.5 font-heading">
                    <span className="text-emerald-600">✓</span> 3. Classroom Safe
                  </p>
                  <p className="text-slate-700 text-[11px] font-semibold">Designed to meet school privacy recommendations. No tracking cookies or advertising pixels are placed on your device.</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="py-2.5 px-6 bg-[#06D6A0] text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] hover:bg-[#05be8d] transition-all cursor-pointer uppercase tracking-wider font-heading"
                >
                  Understood & Agree
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. AI DISCLAIMER MODAL */}
        {/* ========================================================= */}
        {showDisclaimerModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" id="ai-disclaimer-modal">
            <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 max-w-xl w-full text-black shadow-[10px_10px_0px_#000] relative space-y-6">
              
              <button
                onClick={() => setShowDisclaimerModal(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-[#FFF9F2] hover:bg-slate-100 border-2 border-black flex items-center justify-center font-black text-sm transition-all text-black cursor-pointer shadow-[2px_2px_0px_#000]"
                aria-label="Close Disclaimer"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 border-b-2 border-black pb-4">
                <div className="p-3 bg-[#FFD166] border-2 border-black rounded-2xl text-black shadow-[2px_2px_0px_#000]">
                  <AlertTriangle className="w-7 h-7 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-black font-heading">
                    ⚠️ AI System Disclaimer
                  </h3>
                  <p className="text-xs text-amber-700 font-black uppercase tracking-wider">
                    AI May Make Mistakes • Educational Guide Only
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-800 leading-relaxed font-medium">
                <p>
                  <strong className="text-black font-black">Juno</strong><span className="text-[#FF6B35] font-black">AI</span> uses artificial intelligence models (Google Gemini) and local analytical engines to provide constructive feedback, letter grade estimates, and revision flashcards.
                </p>

                <div className="p-3.5 bg-amber-50 rounded-xl border-2 border-black text-slate-800 text-[11px] space-y-1 shadow-[2px_2px_0px_#000]">
                  <p className="font-black uppercase text-amber-900 font-heading">Important Reminders for Students:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 font-semibold">
                    <li>Always verify historical dates, scientific facts, and mathematical formulas with your school textbook or teacher.</li>
                    <li>Letter grade estimates provided by <strong className="text-black font-black">Juno</strong><span className="text-[#FF6B35] font-black">AI</span> are for practice purposes only and do not replace your actual teacher's grading rubric.</li>
                    <li>Strict safety filters are active to ensure a school-safe experience.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowDisclaimerModal(false)}
                  className="py-2.5 px-6 bg-[#FFD166] text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] hover:bg-[#ffc83b] transition-all cursor-pointer uppercase tracking-wider font-heading"
                >
                  I Understand
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. VERSION 2 IMPROVEMENTS & USER FEEDBACK MODAL */}
        {/* ========================================================= */}
        {showVersion2Modal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" id="v2-feedback-modal">
            <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 max-w-2xl w-full text-black shadow-[10px_10px_0px_#000] relative space-y-6 max-h-[90vh] overflow-y-auto">
              
              <button
                onClick={() => setShowVersion2Modal(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-[#FFF9F2] hover:bg-slate-100 border-2 border-black flex items-center justify-center font-black text-sm transition-all text-black cursor-pointer shadow-[2px_2px_0px_#000]"
                aria-label="Close Version 2 Modal"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 border-b-2 border-black pb-4">
                <div className="p-3 bg-[#06D6A0] border-2 border-black rounded-2xl text-black shadow-[2px_2px_0px_#000]">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-black font-heading">
                    🚀 User Feedback & Improvements Log
                  </h3>
                  <p className="text-xs text-emerald-700 font-black uppercase tracking-wider">
                    Continuous Refinements Based on Real Feedback
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-800 leading-relaxed font-medium">
                <p>
                  We collected direct feedback to refine presentation pacing, anxiety reduction, and analysis accuracy:
                </p>

                <div className="border-2 border-black rounded-2xl overflow-hidden bg-white divide-y-2 divide-black shadow-[3px_3px_0px_#000]">
                  <div className="p-3.5 bg-[#FFF9F2] space-y-1">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block font-heading">Tester Feedback</span>
                    <p className="font-black text-black">"Video feedback was too generic and missed real camera/mic issues."</p>
                    <p className="text-[#FF6B35] text-[11px] font-bold mt-1">✓ Upgrade: Added live Canvas 2D frame-diff + Web Audio RMS telemetry (gesture %, head stability %, eye-zone centering %, lighting, vocal ratio, first/second half WPM drift, script keyword coverage) and timestamped fixes.</p>
                  </div>

                  <div className="p-3.5 bg-[#FFF9F2] space-y-1">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block font-heading">Tester Accuracy Suite</span>
                    <p className="font-black text-black">"Need multiple testers and benchmark cases to verify scoring accuracy."</p>
                    <p className="text-[#FF6B35] text-[11px] font-bold mt-1">✓ Upgrade: Added the 5-Case Live Calibration Suite and Human Tester Accuracy Log directly inside Practice Room so silent/brief runs never get inflated scores.</p>
                  </div>

                  <div className="p-3.5 bg-[#FFF9F2] space-y-1">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block font-heading">Camera Access UX</span>
                    <p className="font-black text-black">"Users who clicked Deny on camera permission could not easily prompt again."</p>
                    <p className="text-[#FF6B35] text-[11px] font-bold mt-1">✓ Upgrade: Added a dedicated Request Permission button beside Switch to Voice Only, Flip Camera, and Wake Camera.</p>
                  </div>

                  <div className="p-3.5 bg-[#FFF9F2] space-y-1">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block font-heading">UI Streamlining</span>
                    <p className="font-black text-black">"Header felt crowded with duplicated banners across every tab."</p>
                    <p className="text-[#FF6B35] text-[11px] font-bold mt-1">✓ Upgrade: Moved the Hero Dashboard strictly to Home, unified the compact top bar, and prioritized Script, Notes, Practice Room, Revision Games, Questions, and Slides.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowVersion2Modal(false)}
                  className="py-2.5 px-6 bg-[#06D6A0] text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] hover:bg-[#05be8d] transition-all cursor-pointer uppercase tracking-wider font-heading"
                >
                  Close Feedback Log
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. ROBOT MASCOT HOLDING STICK INTERACTIVE GUIDED TUTORIAL */}
        {/* ========================================================= */}
        {showTutorialModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" id="robot-tutorial-guide-modal">
            <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 max-w-3xl w-full text-black shadow-[10px_10px_0px_#000] relative space-y-6 max-h-[92vh] overflow-y-auto">
              
              {/* Skip / Close Button */}
              <button
                onClick={() => setShowTutorialModal(false)}
                className="absolute top-5 right-5 px-3 py-1.5 rounded-xl bg-[#FFF9F2] hover:bg-[#FFD166] border-2 border-black flex items-center gap-1.5 font-black text-xs transition-all text-black cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                aria-label="Skip Tutorial"
                title="Skip Tutorial and start using JunoAi"
              >
                <span>✕ Skip Tutorial</span>
              </button>

              {/* Header Badge */}
              <div className="flex items-center gap-3 border-b-2 border-black pb-4 pr-32">
                <div className="p-2.5 bg-[#FFD166] border-2 border-black rounded-2xl text-black shadow-[2px_2px_0px_#000] shrink-0">
                  <Play className="w-6 h-6 fill-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-[#FF6B35] text-white px-2 py-0.5 rounded border border-black uppercase tracking-wider">
                      Coach Sparky Guided Tour
                    </span>
                    <span className="text-[10px] font-black bg-[#06D6A0] text-black px-2 py-0.5 rounded border border-black uppercase tracking-wider">
                      Step {robotTutorialStep + 1} of 5
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-wider text-black font-heading mt-0.5">
                    {robotTutorialStep === 0 && "1. Write & Polish Your Speech"}
                    {robotTutorialStep === 1 && "2. Inspect Your Slide Deck"}
                    {robotTutorialStep === 2 && "3. Rehearse with Live Video & Voice"}
                    {robotTutorialStep === 3 && "4. Ace Tough Teacher Questions"}
                    {robotTutorialStep === 4 && "5. Calm Nerves & Play Revision Games"}
                  </h3>
                </div>
              </div>

              {/* Modal Body: Robot Mascot + Step Description */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Robot with teaching stick illustration */}
                <div className="md:col-span-5 flex flex-col items-center text-center space-y-3">
                  <div className="relative group">
                    <img
                      src={robotTeacherStick}
                      alt="Coach Sparky Robot Holding Teaching Stick"
                      className="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-3xl border-3 border-black shadow-[6px_6px_0px_#000] bg-emerald-50"
                    />
                    <div className="absolute -bottom-2 -left-2 bg-[#FF6B35] text-white border-2 border-black px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-[2px_2px_0px_#000]">
                      Teaching Stick Active
                    </div>
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                    Coach Sparky • JunoAi Mentor
                  </p>
                </div>

                {/* Step Content & Robot Speech */}
                <div className="md:col-span-7 space-y-4">
                  
                  {/* Robot Speech Bubble */}
                  <div className="bg-[#FFF9F2] border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000] relative">
                    <div className="text-[11px] font-black text-[#FF6B35] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-heading">
                      <Sparkles className="w-3.5 h-3.5" /> Coach Sparky Explains:
                    </div>
                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                      {robotTutorialStep === 0 &&
                        "Welcome! Start by pasting your presentation script into Script Analyzer or uploading study notes into Notes. I will check readability, highlight filler words ('um', 'like'), and insert deliberate [PAUSE 2s] cues!"}
                      {robotTutorialStep === 1 &&
                        "Never read word-for-word off slides! In the Slide Checker, we audit your presentation against Guy Kawasaki's 10-20-30 rule, catch bullet overcrowding, and alert you if any slide exceeds 50 words."}
                      {robotTutorialStep === 2 &&
                        "Step onto the Practice Room stage! Turn on your webcam and mic (use Request Permission anytime if blocked). Live Canvas & Audio telemetry tracks your gestures, head stability, lighting, script keyword match, and 110–140 WPM pacing!"}
                      {robotTutorialStep === 3 &&
                        "Teacher and audience questions can make or break your final score! In Questions, practice structuring direct answers using the PREP method (Point, Reason, Example, Point) sourced from your Script or Notes."}
                      {robotTutorialStep === 4 &&
                        "Lock in your presentation knowledge by playing Slime & Monster Merge (a question pops out every 4 drops) or Tower Defense—both dynamically generated from your pasted Script or Notes!"}
                    </p>
                  </div>

                  {/* Bullet Highlights for Current Step */}
                  <div className="space-y-2 text-xs font-semibold text-slate-700">
                    {robotTutorialStep === 0 && (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>Flesch-Kincaid Grade Level Readability analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>Real-time filler word highlighting ("um", "like", "so")</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>1-Click Hook Generator & [PAUSE 2s] delivery cue markers</span>
                        </div>
                      </>
                    )}

                    {robotTutorialStep === 1 && (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>10-20-30 Rule audit (10 slides, 20 mins, 30pt font)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>50-word overload warnings to stop wall-of-text slides</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>High-contrast color suggestions for classroom projectors</span>
                        </div>
                      </>
                    )}

                    {robotTutorialStep === 2 && (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>Live telemetry: gestures %, head stability %, lighting & eye centering</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>Request Permission button for instant camera/mic recovery</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>Timestamped specific observations & multi-tester calibration suite</span>
                        </div>
                      </>
                    )}

                    {robotTutorialStep === 3 && (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>Simulated teacher defense questions with instant grading</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>PREP formula framework (Point ➔ Reason ➔ Example ➔ Point)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>Switch instantly between Script and Notes quiz sources</span>
                        </div>
                      </>
                    )}

                    {robotTutorialStep === 4 && (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>Slime &amp; Monster Merge with 10 evolution tiers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>Question pop-out every 4 drops from your Script or Notes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0] shrink-0" />
                          <span>Strategy Tower Defense with active recall gold rewards</span>
                        </div>
                      </>
                    )}
                  </div>

                </div>

              </div>

              {/* Navigation & Controls */}
              <div className="border-t-2 border-black/15 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                
                {/* Step Dots */}
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4].map((stepIdx) => (
                    <button
                      key={stepIdx}
                      onClick={() => setRobotTutorialStep(stepIdx)}
                      className={`w-7 h-7 rounded-lg border-2 border-black font-black text-xs flex items-center justify-center transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                        robotTutorialStep === stepIdx
                          ? "bg-[#FF6B35] text-white scale-110"
                          : "bg-[#FFF9F2] hover:bg-amber-100 text-black"
                      }`}
                      title={`Jump to step ${stepIdx + 1}`}
                    >
                      {stepIdx + 1}
                    </button>
                  ))}
                </div>

                {/* Back / Next Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setShowTutorialModal(false)}
                    className="px-3.5 py-2 rounded-xl text-black font-black text-xs hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Skip
                  </button>

                  <button
                    disabled={robotTutorialStep === 0}
                    onClick={() => setRobotTutorialStep((prev) => Math.max(0, prev - 1))}
                    className={`px-4 py-2 border-2 border-black rounded-xl font-black text-xs transition-all shadow-[2px_2px_0px_#000] flex items-center gap-1 ${
                      robotTutorialStep === 0
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300 shadow-none"
                        : "bg-white hover:bg-slate-100 text-black cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                    }`}
                  >
                    ◀ Previous
                  </button>

                  {robotTutorialStep < 4 ? (
                    <button
                      onClick={() => setRobotTutorialStep((prev) => Math.min(4, prev + 1))}
                      className="px-5 py-2 bg-[#00F5FF] hover:bg-[#00d8e0] text-black border-2 border-black rounded-xl font-black text-xs transition-all cursor-pointer shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1 uppercase tracking-wider font-heading"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowTutorialModal(false);
                        switchTab("script");
                      }}
                      className="px-5 py-2 bg-[#06D6A0] hover:bg-[#00FF66] text-black border-2 border-black rounded-xl font-black text-xs transition-all cursor-pointer shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1 uppercase tracking-wider font-heading"
                    >
                      <span>🚀 Start Presenting!</span>
                    </button>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Quick Tips modal overlay */}
        {showQuickTips && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="quick-tips-modal">
            <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-[10px_10px_0px_#000] relative space-y-4 max-h-[90vh] overflow-y-auto">
              {/* Close corner button */}
              <button
                onClick={() => setShowQuickTips(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-[#FFF9F2] hover:bg-slate-100 border-2 border-black flex items-center justify-center font-black text-sm transition-all text-black shadow-[2px_2px_0px_#000]"
                aria-label="Close"
              >
                ✕
              </button>

              <div className="flex items-center gap-2.5 border-b-2 border-black pb-3">
                <Zap className="w-6 h-6 text-[#FF6B35]" />
                <div>
                  <h3 className="text-base font-black uppercase tracking-wide text-black font-heading">
                    Presentation Speaking Tips: Replace Filler Words!
                  </h3>
                  <p className="text-xs text-[#FF6B35] font-black uppercase">
                    Mastering the art of Deliberate Pausing
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                  Filler words (like <em>"um"</em>, <em>"uh"</em>, <em>"like"</em>, or <em>"so"</em>) usually creep in when your brain is searching for the next sentence. The secret of world-class speakers is simple: <strong>replace filler sounds with silence!</strong>
                </p>

                <div className="bg-amber-50 border-2 border-black rounded-xl p-3.5 space-y-1.5 text-left shadow-[2px_2px_0px_#000]">
                  <p className="text-xs text-amber-900 font-black flex items-center gap-1.5 uppercase font-heading">
                    ⚠️ Speech Recognition Note
                  </p>
                  <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                    Standard web browser speech recognition often automatically filters out short conversational sounds like <em>"um"</em> or <em>"uh"</em> before they can be processed. If our report shows 0 filler words, your browser may have filtered them out! Practicing deliberate silences remains the best habit.
                  </p>
                </div>

                <div className="border-2 border-black rounded-xl overflow-hidden bg-white text-xs text-left shadow-[3px_3px_0px_#000]">
                  <div className="bg-[#FFD166] text-black p-2.5 font-black uppercase text-[10px] tracking-wider grid grid-cols-12 gap-2 border-b-2 border-black font-heading">
                    <div className="col-span-4">Filler Word</div>
                    <div className="col-span-8">What to replace it with</div>
                  </div>

                  <div className="divide-y-2 divide-black font-medium">
                    <div className="p-3 grid grid-cols-12 gap-2 hover:bg-slate-50">
                      <div className="col-span-4 font-black text-rose-600">"Umm" or "Uhh"</div>
                      <div className="col-span-8 text-slate-800 font-semibold">
                        <strong>Take a silent breath through your nose.</strong> Gives you 2 seconds to fetch the next slide point cleanly.
                      </div>
                    </div>

                    <div className="p-3 grid grid-cols-12 gap-2 hover:bg-slate-50">
                      <div className="col-span-4 font-black text-rose-600">"Like"</div>
                      <div className="col-span-8 text-slate-800 font-semibold">
                        <strong>Pause for 1 second, then state your point directly.</strong> Silences break repetitive filler habits.
                      </div>
                    </div>

                    <div className="p-3 grid grid-cols-12 gap-2 hover:bg-slate-50">
                      <div className="col-span-4 font-black text-rose-600">"So" / "Actually"</div>
                      <div className="col-span-8 text-slate-800 font-semibold">
                        <strong>End sentences with a clear stop.</strong> Do not bridge sentences continuously. Pause before starting next point.
                      </div>
                    </div>

                    <div className="p-3 grid grid-cols-12 gap-2 hover:bg-slate-50">
                      <div className="col-span-4 font-black text-rose-600">"You Know"</div>
                      <div className="col-span-8 text-slate-800 font-semibold">
                        <strong>Make eye contact with the audience.</strong> Express your statement directly and confidently.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setShowQuickTips(false)}
                  className="py-2.5 px-5 bg-[#FF6B35] text-white font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] hover:bg-[#e0531e] transition-all cursor-pointer uppercase tracking-wider font-heading"
                >
                  Got it, Let's Practice! 🎤
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GAME SELECTION MODAL */}
        {showGamePickerModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 max-w-2xl w-full text-black shadow-[10px_10px_0px_#000] relative space-y-6 animate-scaleUp">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#FFD166] border-2 border-black rounded-xl text-black shadow-[2px_2px_0px_#000]">
                    <Zap className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-black font-heading">
                      CHOOSE YOUR REVISION GAME MODE
                    </h3>
                    <p className="text-xs text-slate-600 font-bold">
                      Select how you want to test and reinforce your presentation concept deck!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGamePickerModal(false)}
                  className="p-2 bg-[#FFF9F2] hover:bg-slate-100 text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2 Game Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Option 1: Tower Defense */}
                <div className="p-5 bg-[#FFF9F2] border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000] flex flex-col justify-between space-y-4 group transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#06D6A0] text-black border border-black shadow-[1px_1px_0px_#000]">
                        Strategy & Merging
                      </span>
                      <Shield className="w-6 h-6 text-[#FF6B35]" />
                    </div>
                    <h4 className="text-base font-black uppercase text-black font-heading">
                      🏰 Tower Defense Mode
                    </h4>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                      Place towers along 3 distinct battle maps. Answer active recall concept questions between waves to earn gold and upgrade towers. Drag matching tiers onto each other to merge!
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartTowerDefenseGame()}
                    className="w-full py-3 bg-[#06D6A0] hover:bg-[#05be8d] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-2 font-heading"
                  >
                    <Shield className="w-4 h-4 fill-black text-black" /> Play Tower Defense
                  </button>
                </div>

                {/* Option 2: Slime & Monster Merge */}
                <div className="p-5 bg-[#FFF9F2] border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000] flex flex-col justify-between space-y-4 group transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-200 text-purple-900 border border-black shadow-[1px_1px_0px_#000]">
                        Physics Merge • Suika Style
                      </span>
                      <span className="text-xl">👾</span>
                    </div>
                    <h4 className="text-base font-black uppercase text-black font-heading">
                      👾 Slime & Monster Merge
                    </h4>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                      Drop and merge cute original slimes and monsters into the Legendary Slime King! Test presentation knowledge with a question pop-out every 4 drops.
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartSlimeMergeGame()}
                    className="w-full py-3 bg-[#A855F7] hover:bg-[#9333ea] text-white font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-2 font-heading"
                  >
                    <Play className="w-4 h-4 fill-white text-white" /> Play Slime Merge
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* QUIZ TOPIC SOURCE SELECTOR POP-OUT MODAL (Duration of 0.10s transition) */}
        {showQuizSourceModal && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-100 ease-out"
            style={{ animationDuration: "0.10s" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowQuizSourceModal(false);
            }}
          >
            <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 max-w-xl w-full text-black shadow-[10px_10px_0px_#000] space-y-6 relative transition-all duration-100 ease-out animate-pop-in">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-[#FFD166] border-2 border-black rounded-xl text-black shadow-[2px_2px_0px_#000]">
                    <Zap className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-black font-heading">
                      CHOOSE QUIZ SOURCE
                    </h3>
                    <p className="text-xs text-slate-600 font-bold">
                      Which content do you want to generate questions from?
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuizSourceModal(false)}
                  className="p-2 bg-[#FFF9F2] hover:bg-slate-100 text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2 Choice Cards: Script vs Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Option 1: From Script */}
                <div
                  onClick={() => {
                    setQuizSource("script");
                    setShowQuizSourceModal(false);
                  }}
                  className={`p-5 rounded-2xl border-3 border-black cursor-pointer transition-all flex flex-col justify-between space-y-3 shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] ${
                    quizSource === "script" ? "bg-[#FF6B35]/15 ring-3 ring-[#FF6B35]" : "bg-[#FFF9F2] hover:bg-amber-50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#FF6B35] text-white border border-black shadow-[1px_1px_0px_#000]">
                        Speech Script
                      </span>
                      {quizSource === "script" && <span className="text-xs font-black text-[#FF6B35]">● SELECTED</span>}
                    </div>
                    <h4 className="text-base font-black uppercase text-black font-heading flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#FF6B35]" /> From Script
                    </h4>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                      Questions auto-generated directly from your pasted presentation speech and thesis.
                    </p>
                  </div>
                  <div className="pt-2 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-slate-700">
                    <span>{script.trim().split(/\s+/).filter(Boolean).length} Words</span>
                    <button className="px-3 py-1 bg-[#FF6B35] text-white font-black rounded-lg border border-black text-[11px] uppercase shadow-[1px_1px_0px_#000]">
                      Pick Script
                    </button>
                  </div>
                </div>

                {/* Option 2: From Notes */}
                <div
                  onClick={() => {
                    setQuizSource("notes");
                    setShowQuizSourceModal(false);
                  }}
                  className={`p-5 rounded-2xl border-3 border-black cursor-pointer transition-all flex flex-col justify-between space-y-3 shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] ${
                    quizSource === "notes" ? "bg-[#06D6A0]/20 ring-3 ring-[#06D6A0]" : "bg-[#FFF9F2] hover:bg-emerald-50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#06D6A0] text-black border border-black shadow-[1px_1px_0px_#000]">
                        Research Notes
                      </span>
                      {quizSource === "notes" && <span className="text-xs font-black text-emerald-700">● SELECTED</span>}
                    </div>
                    <h4 className="text-base font-black uppercase text-black font-heading flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#06D6A0]" /> From Notes
                    </h4>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                      Questions auto-generated from the research facts and bullet notes you pasted.
                    </p>
                  </div>
                  <div className="pt-2 border-t-2 border-black/10 flex items-center justify-between text-xs font-black text-slate-700">
                    <span>{notesText.trim().split(/\s+/).filter(Boolean).length} Words</span>
                    <button className="px-3 py-1 bg-[#06D6A0] text-black font-black rounded-lg border border-black text-[11px] uppercase shadow-[1px_1px_0px_#000]">
                      Pick Notes
                    </button>
                  </div>
                </div>

              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-600 border-t-2 border-black/15">
                <span>Fast 0.10s instant sync</span>
                <button
                  onClick={() => setShowQuizSourceModal(false)}
                  className="px-4 py-2 bg-black text-white font-black uppercase rounded-xl border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
