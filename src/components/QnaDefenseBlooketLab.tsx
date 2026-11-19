import React, { useState, useEffect } from "react";
import {
  Shield,
  Zap,
  Sparkles,
  Trophy,
  Flame,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Mic,
  Star,
  RefreshCw,
  Volume2,
  VolumeX,
  Play
} from "lucide-react";
import { PracticeFeedback, QnaQuizItem } from "../types";

interface QnaDefenseBlooketLabProps {
  questions: Array<{ difficulty: string; question: string; modelAnswer: string }>;
  presentationTitle: string;
  scriptText: string;
  quizSource?: "script" | "notes";
  onSwitchSource?: (source: "script" | "notes") => void;
  onOpenSourcePicker?: () => void;
}

// Web Audio sound synth helper for exciting feedback without external audio files
const playChime = (type: "correct" | "wrong" | "click" | "win") => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "correct") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "wrong") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } else if (type === "win") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch {
    // AudioContext not allowed or muted
  }
};

export const QnaDefenseBlooketLab: React.FC<QnaDefenseBlooketLabProps> = ({
  questions,
  presentationTitle,
  scriptText,
  quizSource = "script",
  onSwitchSource,
  onOpenSourcePicker
}) => {
  // Mode: "quiz-study" (Interactive Practice Quiz) or "open-sandbox" (Spoken Practice)
  const [labMode, setLabMode] = useState<"quiz-study" | "open-sandbox">("quiz-study");
  
  // Quiz Game State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [tokens, setTokens] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showPrepHint, setShowPrepHint] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Reset quiz progress when topic or source changes
  useEffect(() => {
    setCurrentQIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerRevealed(false);
    setIsGameOver(false);
    setTokens(0);
    setStreak(0);
    setCorrectAnswersCount(0);
  }, [quizSource, presentationTitle, scriptText]);

  // Open Sandbox State
  const [sandboxQuestionIndex, setSandboxQuestionIndex] = useState(0);
  const [userSpokenAnswer, setUserSpokenAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sandboxFeedback, setSandboxFeedback] = useState<PracticeFeedback | null>(null);

  // Generate dynamic Quiz Items based on current presentation questions or script
  const buildQuizItems = (): QnaQuizItem[] => {
    const categories: Array<"Clarification" | "Challenge" | "Deep Detail" | "Future Impact"> = [
      "Challenge", "Clarification", "Deep Detail", "Future Impact"
    ];
    const icons = ["⚡", "🧐", "🎓", "🚀"];

    const rawList = questions && questions.length > 0 ? questions : [
      {
        difficulty: "Medium",
        question: `How does your presentation on '${presentationTitle || "this topic"}' prove that the core conclusions are reliable?`,
        modelAnswer: "By synthesizing verified studies and comparing contrasting evidence, my research demonstrates that the primary outcomes are consistent and actionable."
      },
      {
        difficulty: "Challenging",
        question: "Many skeptics argue that this approach costs too much time or resources. How do you respond to that?",
        modelAnswer: "While initial investment requires dedication, longitudinal data proves the long-term compound benefits far outweigh short-term resource requirements."
      },
      {
        difficulty: "Easy",
        question: "Can you clarify the single most important takeaway you want the audience to remember from your talk?",
        modelAnswer: "The most crucial takeaway is that small, deliberate structural improvements create compounding positive transformation over time."
      },
      {
        difficulty: "Challenging",
        question: "If a peer challenges your opening statistics during class, how should you defend them without getting defensive?",
        modelAnswer: "Acknowledge their curiosity politely, reference the specific source methodology examined, and offer to share the source link after the presentation."
      }
    ];

    return rawList.map((q, idx) => {
      const cat = categories[idx % categories.length];
      const icon = icons[idx % icons.length];
      const model = q.modelAnswer;

      // Realistic distractors modeled after common student mistakes
      const distractor1 = "Dismiss their objection quickly and tell them they didn't pay attention to the earlier slides.";
      const distractor2 = "Apologize immediately, retract your statement, and concede that their objection is probably right.";
      const distractor3 = "Change the topic to a completely different subject to avoid discussing difficult counter-evidence.";

      // Shuffle options deterministically or uniquely per question
      const correctOption = {
        text: model,
        isCorrect: true,
        explanation: "PREP Method Excellence: Directly addresses the point with poise, cites verifiable reasoning, and reinforces the core message respectfully."
      };
      const badOption1 = {
        text: distractor1,
        isCorrect: false,
        explanation: "Combative deflection: Never criticize an audience question. Acknowledge skepticism with courtesy."
      };
      const badOption2 = {
        text: distractor2,
        isCorrect: false,
        explanation: "Submissive surrender: You researched your topic! Stand firm by your evidence without collapsing under pressure."
      };
      const badOption3 = {
        text: distractor3,
        isCorrect: false,
        explanation: "Topic evasion: Judges and teachers notice when you dodge questions. Address the counter-argument head-on."
      };

      // Ensure correct option is placed at variable positions
      const pos = idx % 4;
      const opts = [badOption1, badOption2, badOption3];
      opts.splice(pos, 0, correctOption);

      return {
        id: idx + 1,
        question: q.question,
        category: cat,
        badgeColor: cat === "Challenge" ? "bg-[#FF6B35]" : cat === "Clarification" ? "bg-[#00F5FF]" : cat === "Deep Detail" ? "bg-[#9B5DE5]" : "bg-[#06D6A0]",
        icon,
        whyAsked: `Tests your poise and defense structure when probed by teachers or skeptical peers on ${presentationTitle || "your talk"}.`,
        prepStrategy: "Point (direct claim) ➔ Reason (why it holds) ➔ Example/Evidence (study or fact) ➔ Point (reinforce conclusion).",
        modelAnswer: model,
        options: opts,
        xpReward: 100 + (idx * 20)
      };
    });
  };

  const quizItems = buildQuizItems();
  const currentQuiz = quizItems[currentQIndex] || quizItems[0];

  const handleSelectOption = (index: number) => {
    if (isAnswerRevealed) return;
    setSelectedOptionIndex(index);
    setIsAnswerRevealed(true);

    const isCorrect = currentQuiz.options[index]?.isCorrect;
    if (isCorrect) {
      if (soundEnabled) playChime("correct");
      const multiplier = 1 + (streak * 0.2);
      const earned = Math.round(currentQuiz.xpReward * multiplier);
      setTokens(prev => prev + earned);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setCorrectAnswersCount(prev => prev + 1);
    } else {
      if (soundEnabled) playChime("wrong");
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOptionIndex(null);
    setIsAnswerRevealed(false);
    setShowPrepHint(false);

    if (currentQIndex + 1 < quizItems.length) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      if (soundEnabled) playChime("win");
      setIsGameOver(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerRevealed(false);
    setTokens(0);
    setStreak(0);
    setCorrectAnswersCount(0);
    setIsGameOver(false);
    setShowPrepHint(false);
  };

  // Sandbox Evaluation Handler
  const handleEvaluateSandbox = async () => {
    if (!userSpokenAnswer.trim()) return;
    setIsEvaluating(true);
    setSandboxFeedback(null);

    const activeScenario = quizItems[sandboxQuestionIndex] || quizItems[0];
    try {
      const res = await fetch("/api/simulate-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: activeScenario.question,
          answer: userSpokenAnswer,
          scriptContext: scriptText
        })
      });
      if (!res.ok) throw new Error("Evaluation error");
      const data = await res.json();
      setSandboxFeedback(data);
    } catch {
      const wordCount = userSpokenAnswer.trim().split(/\s+/).length;
      const rating = Math.min(5, Math.max(3, Math.floor(wordCount / 12) + 2));
      setSandboxFeedback({
        rating,
        feedbackText: wordCount > 25
          ? "Solid defense! You addressed the query directly with constructive clarity."
          : "Direct answer. Enhance with a concrete fact or research reference for maximum persuasive impact.",
        strengths: "Addressed the core point directly without hesitation.",
        improvements: "Use the PREP framework (Point -> Reason -> Example -> Point) for structured confidence.",
        modelAnswer: activeScenario.modelAnswer
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Neo-Brutalist Color Tiles for 4 Choice Buttons
  const choiceThemes = [
    { bg: "bg-[#FF6B35]", text: "text-white", border: "border-black", letterBg: "bg-black text-white" },
    { bg: "bg-[#06D6A0]", text: "text-black", border: "border-black", letterBg: "bg-white text-black" },
    { bg: "bg-[#00F5FF]", text: "text-black", border: "border-black", letterBg: "bg-black text-white" },
    { bg: "bg-[#FFD166]", text: "text-black", border: "border-black", letterBg: "bg-white text-black" }
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="questions-container">
      
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white border-3 border-black rounded-3xl p-5 md:p-6 shadow-[6px_6px_0px_#000] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-[#00F5FF] p-3 rounded-2xl border-2 border-black text-black shadow-[3px_3px_0px_#000]">
              <Shield className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-[#FFD166] text-black px-2 py-0.5 rounded border border-black uppercase tracking-wider">
                  Interactive Practice
                </span>
                <span className="text-[10px] font-black bg-[#06D6A0] text-black px-2 py-0.5 rounded border border-black uppercase tracking-wider">
                  Audience Defense
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-black font-heading mt-0.5">
                Questions
              </h2>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">
                Prepare for tough teacher panel and peer audience questions with structured responses and interactive practice.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {onSwitchSource && (
              <div className="flex items-center gap-1 bg-[#FFF9F2] p-1.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000]">
                <span className="text-[10px] font-black uppercase text-slate-600 px-1.5">Quiz Source:</span>
                <button
                  onClick={() => onSwitchSource("script")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-black flex items-center gap-1 uppercase ${
                    quizSource === "script"
                      ? "bg-[#FF6B35] text-white shadow-[2px_2px_0px_#000]"
                      : "bg-white text-black hover:bg-amber-100"
                  }`}
                  title="Quiz based on your written presentation script"
                >
                  <span>📝 Script</span>
                </button>
                <button
                  onClick={() => onSwitchSource("notes")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-black flex items-center gap-1 uppercase ${
                    quizSource === "notes"
                      ? "bg-[#06D6A0] text-black shadow-[2px_2px_0px_#000]"
                      : "bg-white text-black hover:bg-emerald-100"
                  }`}
                  title="Quiz based on your research notes and facts"
                >
                  <span>📋 Notes</span>
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 bg-[#FFF9F2] p-1.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] w-full md:w-auto justify-center">
              <button
                onClick={() => setLabMode("quiz-study")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-150 cursor-pointer border-2 border-black flex items-center gap-1.5 uppercase active:scale-95 active:translate-y-[2px] active:shadow-none ${
                  labMode === "quiz-study"
                    ? "bg-[#FF6B35] text-white shadow-[2px_2px_0px_#000]"
                    : "bg-white text-black hover:bg-amber-100 shadow-[1px_1px_0px_#000]"
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Practice Quiz</span>
              </button>
              <button
                onClick={() => setLabMode("open-sandbox")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-150 cursor-pointer border-2 border-black flex items-center gap-1.5 uppercase active:scale-95 active:translate-y-[2px] active:shadow-none ${
                  labMode === "open-sandbox"
                    ? "bg-[#06D6A0] text-black shadow-[2px_2px_0px_#000]"
                    : "bg-white text-black hover:bg-amber-100 shadow-[1px_1px_0px_#000]"
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Spoken Practice</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. INTERACTIVE STUDY QUIZ MODE */}
      {/* ========================================================= */}
      {labMode === "quiz-study" && (
        <div className="space-y-6">
          
          {/* Game Stats HUD Bar */}
          <div className="bg-[#FFF9F2] border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Question progress */}
              <div className="bg-white px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] flex items-center gap-1.5 text-black">
                <span>🎯</span>
                <span>Question {isGameOver ? quizItems.length : currentQIndex + 1} / {quizItems.length}</span>
              </div>

              {/* Tokens Earned */}
              <div className="bg-[#FFD166] text-black px-3.5 py-1.5 rounded-xl border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] flex items-center gap-1.5">
                <span>🪙</span>
                <span>{tokens} Tokens</span>
              </div>

              {/* Combo Streak */}
              <div className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-all ${
                streak > 1 ? "bg-[#FF6B35] text-white animate-pulse" : "bg-white text-black"
              }`}>
                <Flame className={`w-3.5 h-3.5 ${streak > 1 ? "fill-white" : "text-amber-500"}`} />
                <span>Streak: {streak} {streak > 1 && `(${ (1 + streak * 0.2).toFixed(1) }x)`}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(prev => !prev)}
                className="p-2 rounded-xl bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000] hover:bg-slate-100 cursor-pointer transition-all"
                title={soundEnabled ? "Mute Game Sound" : "Enable Game Sound"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>

              {/* Restart */}
              <button
                onClick={handleRestartQuiz}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white h-3 rounded-full border-2 border-black overflow-hidden shadow-[2px_2px_0px_#000]">
            <div
              className="bg-[#06D6A0] h-full transition-all duration-300"
              style={{ width: `${((currentQIndex + (isAnswerRevealed ? 1 : 0)) / quizItems.length) * 100}%` }}
            />
          </div>

          {/* GAME NOT OVER: QUESTION VIEW */}
          {!isGameOver ? (
            <div className="space-y-6">
              
              {/* Central Question Stage Card */}
              <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_#000] space-y-5 text-center relative overflow-hidden">
                
                <div className="flex items-center justify-between border-b-2 border-black pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full border-2 border-black text-black shadow-[1px_1px_0px_#000] ${currentQuiz.badgeColor}`}>
                      {currentQuiz.icon} {currentQuiz.category} Inquest
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                      Reward: +{currentQuiz.xpReward} XP
                    </span>
                  </div>

                  <button
                    onClick={() => setShowPrepHint(prev => !prev)}
                    className="text-xs font-black bg-[#FFF9F2] hover:bg-[#FFD166] text-black px-3 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showPrepHint ? "Hide PREP Hint" : "💡 PREP Strategy Clue"}</span>
                  </button>
                </div>

                {/* PREP Clue Dropdown */}
                {showPrepHint && (
                  <div className="p-3.5 bg-[#FFF9F2] border-2 border-black rounded-2xl text-left text-xs font-medium text-slate-800 animate-fade-in shadow-[2px_2px_0px_#000]">
                    <strong className="text-[#FF6B35] font-black uppercase text-[11px] block mb-1">
                      💡 PREP Method Secret:
                    </strong>
                    {currentQuiz.prepStrategy}
                  </div>
                )}

                {/* Question Prompt */}
                <div className="py-2">
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest block mb-2">
                    🎓 Teacher / Audience Panel asks:
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-black leading-snug font-heading max-w-3xl mx-auto">
                    "{currentQuiz.question}"
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold mt-2">
                    Choose the best structured, persuasive defense answer to secure 100% audience confidence:
                  </p>
                </div>
              </div>

              {/* 4 VIBRANT CHOICE TILES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuiz.options.map((opt, oIdx) => {
                  const theme = choiceThemes[oIdx % choiceThemes.length];
                  const isSelected = selectedOptionIndex === oIdx;
                  const showResultState = isAnswerRevealed;
                  
                  let cardBorder = "border-3 border-black";
                  let cardBg = theme.bg;
                  let cardText = theme.text;
                  let cardShadow = "shadow-[5px_5px_0px_#000]";

                  if (showResultState) {
                    if (opt.isCorrect) {
                      cardBg = "bg-[#06D6A0]";
                      cardText = "text-black";
                      cardBorder = "border-4 border-black ring-4 ring-[#06D6A0]/40";
                    } else if (isSelected && !opt.isCorrect) {
                      cardBg = "bg-[#EF476F]";
                      cardText = "text-white";
                      cardBorder = "border-4 border-black ring-4 ring-rose-300";
                    } else {
                      cardBg = "bg-slate-100 opacity-60";
                      cardText = "text-slate-700";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={isAnswerRevealed}
                      className={`p-5 rounded-2xl ${cardBorder} ${cardBg} ${cardText} ${cardShadow} text-left flex items-start gap-4 transition-all duration-150 ${
                        !isAnswerRevealed
                          ? "hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] active:scale-[0.98] active:translate-x-[2px] active:translate-y-[2px] cursor-pointer"
                          : "cursor-default"
                      }`}
                    >
                      {/* Letter Marker */}
                      <span className={`w-8 h-8 rounded-xl border-2 border-black flex items-center justify-center font-black text-sm shrink-0 shadow-[2px_2px_0px_#000] ${theme.letterBg}`}>
                        {["A", "B", "C", "D"][oIdx]}
                      </span>

                      <div className="flex-1 space-y-1">
                        <p className="text-xs md:text-sm font-black leading-relaxed">
                          {opt.text}
                        </p>
                        {showResultState && isSelected && (
                          <div className="mt-2 pt-2 border-t border-black/20 text-[11px] font-bold flex items-center gap-1.5">
                            {opt.isCorrect ? (
                              <span className="flex items-center gap-1 text-black font-black">
                                <CheckCircle2 className="w-4 h-4 fill-black text-white" />
                                CORRECT DEFENSE! +{currentQuiz.xpReward} XP!
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-white font-black">
                                <XCircle className="w-4 h-4 fill-white text-rose-700" />
                                VULNERABLE RESPONSE
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* POST-ANSWER FEEDBACK EXPLANATION & ADVANCE BUTTON */}
              {isAnswerRevealed && (
                <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
                    <div className="flex items-center gap-2">
                      {selectedOptionIndex !== null && currentQuiz.options[selectedOptionIndex]?.isCorrect ? (
                        <div className="bg-[#06D6A0] text-black px-3 py-1 rounded-xl border-2 border-black font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000]">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>EXEMPLARY DEFENSE! 🔥 Streak +1</span>
                        </div>
                      ) : (
                        <div className="bg-[#EF476F] text-white px-3 py-1 rounded-xl border-2 border-black font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000]">
                          <XCircle className="w-4 h-4" />
                          <span>MISSED • STREAK RESET</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 bg-[#FF6B35] hover:bg-[#e0531e] text-white font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:scale-95 active:translate-y-[2px] active:shadow-none transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 font-heading"
                    >
                      <span>{currentQIndex + 1 < quizItems.length ? "Next Defense Question" : "View Final Score"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Why this answer matters */}
                  <div className="p-4 bg-[#FFF9F2] rounded-2xl border-2 border-black text-xs text-slate-800 space-y-1 shadow-[2px_2px_0px_#000]">
                    <p className="font-black text-[#FF6B35] uppercase text-[11px] font-heading">
                      🎓 Masterclass Defense Reasoning:
                    </p>
                    <p className="font-medium leading-relaxed">
                      {selectedOptionIndex !== null && currentQuiz.options[selectedOptionIndex]?.explanation}
                    </p>
                    <p className="font-bold text-black pt-1">
                      <strong>Winning Formula:</strong> "{currentQuiz.modelAnswer}"
                    </p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* ========================================================= */
            /* GAME OVER / ROUND COMPLETE SCREEN */
            /* ========================================================= */
            <div className="bg-white border-4 border-black rounded-3xl p-8 md:p-12 text-center shadow-[10px_10px_0px_#000] space-y-6 max-w-2xl mx-auto animate-fade-in">
              <div className="w-24 h-24 bg-[#FFD166] border-3 border-black rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-[5px_5px_0px_#000] animate-bounce">
                🏆
              </div>

              <div className="space-y-1">
                <span className="text-xs font-black bg-[#06D6A0] text-black px-3 py-1 rounded-full border-2 border-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                  Round Completed!
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-black font-heading mt-2">
                  Defense Stage Mastered!
                </h3>
                <p className="text-xs text-slate-700 font-semibold">
                  You successfully faced the toughest teacher and audience inquiries for "{presentationTitle || "Presentation"}".
                </p>
              </div>

              {/* Stats Score Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-[#FFF9F2] border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000]">
                  <p className="text-[10px] font-black uppercase text-slate-600">Tokens Earned</p>
                  <p className="text-xl sm:text-2xl font-black text-[#FF6B35]">+{tokens} 🪙</p>
                </div>
                <div className="p-4 bg-[#FFF9F2] border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000]">
                  <p className="text-[10px] font-black uppercase text-slate-600">Accuracy</p>
                  <p className="text-xl sm:text-2xl font-black text-black">
                    {Math.round((correctAnswersCount / quizItems.length) * 100)}%
                  </p>
                </div>
                <div className="p-4 bg-[#FFF9F2] border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000]">
                  <p className="text-[10px] font-black uppercase text-slate-600">Max Streak</p>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600">{maxStreak} 🔥</p>
                </div>
              </div>

              {/* Speaker Defense Title Awarded */}
              <div className="p-4 bg-[#00F5FF]/20 border-2 border-black rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
                <span>🛡️ Badge Unlocked:</span>
                <span className="bg-[#FFD166] px-2.5 py-0.5 rounded border border-black font-black">
                  {correctAnswersCount >= quizItems.length - 1 ? "Impervious Shieldmaster 🌟" : "Classroom Panel Debater ⚡"}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestartQuiz}
                  className="px-6 py-3 bg-[#FF6B35] hover:bg-[#e0531e] text-white font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:scale-95 active:translate-y-[2px] active:shadow-none transition-all duration-150 cursor-pointer flex items-center gap-2 font-heading"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Another Round</span>
                </button>
                <button
                  onClick={() => setLabMode("open-sandbox")}
                  className="px-6 py-3 bg-[#06D6A0] hover:bg-[#05be8d] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:scale-95 active:translate-y-[2px] active:shadow-none transition-all duration-150 cursor-pointer flex items-center gap-2 font-heading"
                >
                  <Mic className="w-4 h-4" />
                  <span>Try Spoken Practice</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SPOKEN PRACTICE & FREE TEXT DEFENSE MODE */}
      {/* ========================================================= */}
      {labMode === "open-sandbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Left Column: Select Scenario */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border-3 border-black p-5 rounded-2xl shadow-[6px_6px_0px_#000] space-y-3">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 font-heading">
                  <Shield className="w-4 h-4 text-[#FF6B35]" /> Defense Prompts ({quizItems.length})
                </h3>
                <span className="text-[10px] font-black bg-[#FFD166] text-black border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                  Free Practice
                </span>
              </div>

              <div className="space-y-3">
                {quizItems.map((item, idx) => {
                  const isSelected = sandboxQuestionIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSandboxQuestionIndex(idx);
                        setUserSpokenAnswer("");
                        setSandboxFeedback(null);
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col gap-2 ${
                        isSelected
                          ? "bg-[#FFF9F2] border-black text-black shadow-[4px_4px_0px_#000]"
                          : "bg-white hover:bg-amber-50/50 border-black text-slate-800 shadow-[2px_2px_0px_#000]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white border border-black text-black shadow-[1px_1px_0px_#000]">
                          {item.icon} {item.category}
                        </span>
                        <span className="text-[10px] font-black text-black">Q{idx + 1}</span>
                      </div>
                      <p className="text-xs font-bold leading-snug line-clamp-2 text-black">
                        "{item.question}"
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Rehearsal Workbench */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border-3 border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] space-y-6">
              
              {/* Question Header Card */}
              <div className="p-5 bg-[#FFF9F2] text-black rounded-xl border-2 border-black space-y-3 shadow-[3px_3px_0px_#000]">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded bg-white border border-black text-black shadow-[1px_1px_0px_#000]">
                    {quizItems[sandboxQuestionIndex]?.icon} {quizItems[sandboxQuestionIndex]?.category} Question
                  </span>
                  <span className="text-[10px] font-black text-black bg-[#FFD166] border border-black px-2 py-0.5 rounded uppercase tracking-wider shadow-[1px_1px_0px_#000]">
                    Live Speech Lab
                  </span>
                </div>
                <h3 className="text-base font-black text-black leading-relaxed font-heading">
                  "{quizItems[sandboxQuestionIndex]?.question}"
                </h3>
                <div className="p-3 bg-white rounded-lg border-2 border-black text-xs font-semibold text-slate-800 shadow-[1px_1px_0px_#000]">
                  <strong className="text-[#FF6B35] font-black">Why asked:</strong> {quizItems[sandboxQuestionIndex]?.whyAsked}
                </div>
              </div>

              {/* Student Practice Input */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-black flex items-center justify-between">
                  <span>Type or Speak Your Defense Answer:</span>
                  <span className="text-[10px] text-slate-600 font-bold">{userSpokenAnswer.split(/\s+/).filter(Boolean).length} words</span>
                </label>
                <textarea
                  value={userSpokenAnswer}
                  onChange={(e) => setUserSpokenAnswer(e.target.value)}
                  placeholder="Type how you would answer this question in front of your class... (e.g. 'That is a great question. Research shows that...')"
                  rows={4}
                  className="w-full p-4 rounded-xl border-2 border-black text-xs font-semibold text-black bg-[#FFFDF7] focus:outline-none focus:border-[#FF6B35] resize-y shadow-[2px_2px_0px_#000]"
                />
                <button
                  onClick={handleEvaluateSandbox}
                  disabled={isEvaluating || !userSpokenAnswer.trim()}
                  className={`w-full py-3 bg-[#FF6B35] hover:bg-[#e0531e] text-white font-black text-xs rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider ${
                    (isEvaluating || !userSpokenAnswer.trim()) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Grading Defense Answer...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-white" />
                      <span>Grade My Defense Answer</span>
                    </>
                  )}
                </button>
              </div>

              {/* Feedback Result */}
              {sandboxFeedback && (
                <div className="p-5 bg-white border-2 border-black rounded-xl space-y-4 shadow-[4px_4px_0px_#000]">
                  <div className="flex items-center justify-between border-b-2 border-black pb-2">
                    <span className="text-xs font-black uppercase text-black flex items-center gap-1 font-heading">
                      <CheckCircle2 className="w-4 h-4 text-[#06D6A0]" /> Defense Rating:
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < sandboxFeedback.rating ? "text-[#FFD166] fill-[#FFD166]" : "text-slate-300"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {sandboxFeedback.feedbackText}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-emerald-50 rounded-xl border-2 border-black space-y-1 shadow-[2px_2px_0px_#000]">
                      <p className="font-black text-emerald-900 uppercase text-[10px]">What Was Strong</p>
                      <p className="font-medium text-slate-800">{sandboxFeedback.strengths}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border-2 border-black space-y-1 shadow-[2px_2px_0px_#000]">
                      <p className="font-black text-amber-900 uppercase text-[10px]">How To Upgrade</p>
                      <p className="font-medium text-slate-800">{sandboxFeedback.improvements}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Model Answer */}
              <details className="group border-2 border-black rounded-xl bg-[#FFF9F2] p-4 transition-all shadow-[2px_2px_0px_#000]">
                <summary className="font-black text-xs uppercase tracking-wider text-black cursor-pointer flex items-center justify-between select-none font-heading">
                  <span className="flex items-center gap-2">View Ideal PREP Model Answer</span>
                  <span className="text-xs font-black group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-xs font-medium text-slate-900 leading-relaxed bg-white p-3 rounded-lg border-2 border-black italic shadow-[1px_1px_0px_#000]">
                  "{quizItems[sandboxQuestionIndex]?.modelAnswer}"
                </p>
              </details>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
