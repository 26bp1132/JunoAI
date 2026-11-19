import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Play, RefreshCw, ShieldCheck, Users, ClipboardCheck } from "lucide-react";
import { RecordingFeedback } from "../types";

interface CalibrationScenario {
  id: string;
  testerLabel: string;
  role: string;
  scenarioName: string;
  expectedRule: string;
  payload: {
    topic: string;
    script: string;
    durationSeconds: number;
    spokenTranscript: string;
    recordMode: "video" | "audio";
    telemetry: any;
  };
  validate: (res: RecordingFeedback) => { passed: boolean; detail: string };
}

interface CalibrationResult {
  id: string;
  passed: boolean;
  pacingScore: number;
  bodyScore: number;
  wpm: number;
  status: string;
  detail: string;
  summary: string;
}

interface HumanTesterReview {
  id: string;
  testerName: string;
  testerRole: "Student" | "Teacher" | "Peer Tester";
  verdict: "Accurate" | "Too Generous" | "Too Harsh";
  note: string;
  measuredScore: number;
  measuredWpm: number;
  timestamp: string;
}

interface TesterCalibrationPanelProps {
  currentFeedback: RecordingFeedback | null;
}

const CALIBRATION_SCENARIOS: CalibrationScenario[] = [
  {
    id: "silent_27s",
    testerLabel: "Case 1 · Silent 27s Mic Check",
    role: "Silence Guardrail",
    scenarioName: "27s recording with 0 spoken words",
    expectedRule: "Score ≤ 35, flags silence & 0 WPM",
    payload: {
      topic: "Sleep Science & Adolescent Brains",
      script: "Good morning class! Today I will explain why 8 to 10 hours of sleep improves exam recall and memory consolidation.",
      durationSeconds: 27,
      spokenTranscript: "",
      recordMode: "video",
      telemetry: {
        activeSpeakingSeconds: 0,
        silenceSeconds: 27,
        speakingRatioPct: 0,
        pauseCount: 1,
        longestPauseSeconds: 27,
        avgVolumePct: 4,
        volumeVariationPct: 1,
        quietMoments: 1,
        gestureActivityPct: 12,
        headStabilityPct: 85,
        eyeZoneCenteredPct: 80,
        lightingQuality: "Balanced",
        avgBrightness: 135,
        scriptCoveragePct: 0,
        matchedKeywords: [],
        missedKeywords: ["morning", "explain", "memory", "consolidation"],
        firstHalfWpm: 0,
        secondHalfWpm: 0,
        timelineNotes: []
      }
    },
    validate: (res) => {
      const ok = res.overallPacingScore <= 35 && res.wordsPerMinute <= 10;
      return {
        passed: ok,
        detail: ok
          ? `Blocked false high mark (${res.overallPacingScore}/100, ${res.wordsPerMinute} WPM)`
          : `Expected ≤35 score for silence, got ${res.overallPacingScore}/100`
      };
    }
  },
  {
    id: "fast_fillers",
    testerLabel: "Case 2 · Fast Speaker + Fillers",
    role: "Pacing & Filler Audit",
    scenarioName: "30s at ~180 WPM with 'like', 'um', 'basically'",
    expectedRule: "Status = 'Too Fast', fillers > 0, flags speed",
    payload: {
      topic: "Ocean Plastics",
      script: "Every single minute plastic enters our oceans and turns into microplastics in marine food chains. Switching to reusable steel bottles helps save marine life.",
      durationSeconds: 30,
      spokenTranscript:
        "Um hello everyone so like every single minute an entire garbage truck of plastic is basically dumped into our oceans and like plastic bottles take over four hundred fifty years to break down turning into toxic microplastics that enter marine food chains so like if we switch to reusable stainless steel bottles and support school recycling programs we can save thousands of marine animals every year um thank you for listening to my talk today everyone right now let us protect our oceans together",
      recordMode: "video",
      telemetry: {
        activeSpeakingSeconds: 28,
        silenceSeconds: 2,
        speakingRatioPct: 93,
        pauseCount: 1,
        longestPauseSeconds: 0.8,
        avgVolumePct: 64,
        volumeVariationPct: 24,
        quietMoments: 0,
        gestureActivityPct: 45,
        headStabilityPct: 76,
        eyeZoneCenteredPct: 78,
        lightingQuality: "Balanced",
        avgBrightness: 142,
        scriptCoveragePct: 82,
        matchedKeywords: ["plastic", "oceans", "microplastics", "marine", "reusable", "bottles"],
        missedKeywords: ["chains"],
        firstHalfWpm: 162,
        secondHalfWpm: 198,
        timelineNotes: []
      }
    },
    validate: (res) => {
      const fillersTotal = Object.values(res.fillerWordsCount || {}).reduce((a: number, b: any) => a + Number(b || 0), 0);
      const ok = res.speakingSpeedStatus === "Too Fast" && res.wordsPerMinute > 155 && fillersTotal >= 3;
      return {
        passed: ok,
        detail: ok
          ? `Flagged Too Fast (${res.wordsPerMinute} WPM) + ${fillersTotal} fillers`
          : `Got ${res.speakingSpeedStatus} (${res.wordsPerMinute} WPM), ${fillersTotal} fillers`
      };
    }
  },
  {
    id: "dark_static",
    testerLabel: "Case 3 · Dark Room & Static Hands",
    role: "Visual Framing Audit",
    scenarioName: "45s steady speech (123 WPM), 4% gestures, dark lighting",
    expectedRule: "Body score penalized & mentions low gestures/lighting",
    payload: {
      topic: "AI in Education",
      script: "Artificial intelligence can act as an assistant for feedback while students preserve critical thinking and ethical judgment.",
      durationSeconds: 45,
      spokenTranscript:
        "Good morning everyone. Today I will examine how artificial intelligence works as a personalized study assistant in classrooms. First, instant feedback helps students practice explanations and identify unclear sentences before presentation day. Second, ethical guidelines ensure technology supports critical thinking rather than replacing original student judgment. When schools combine clear rubrics with responsible tools, every learner can gain confidence on stage and communicate complex ideas clearly. Thank you all for listening carefully today.",
      recordMode: "video",
      telemetry: {
        activeSpeakingSeconds: 36,
        silenceSeconds: 9,
        speakingRatioPct: 80,
        pauseCount: 4,
        longestPauseSeconds: 1.8,
        avgVolumePct: 50,
        volumeVariationPct: 18,
        quietMoments: 0,
        gestureActivityPct: 4,
        headStabilityPct: 82,
        eyeZoneCenteredPct: 72,
        lightingQuality: "Dark",
        avgBrightness: 48,
        scriptCoveragePct: 88,
        matchedKeywords: ["artificial", "intelligence", "assistant", "feedback", "critical", "thinking"],
        missedKeywords: ["ethical"],
        firstHalfWpm: 118,
        secondHalfWpm: 122,
        timelineNotes: [
          { time: "0:18", label: "Static Hands", detail: "Minimal hand/arm movement detected for 10+ seconds.", status: "improve" }
        ]
      }
    },
    validate: (res) => {
      const gestureText = `${res.handGesturesFeedback || ""} ${(res.partsToImprove || []).join(" ")} ${(res.bodyLanguageActionableTips || []).join(" ")}`.toLowerCase();
      const mentionsVisualIssue = gestureText.includes("gesture") || gestureText.includes("light") || gestureText.includes("hand");
      const ok = (res.bodyLanguageScore ?? 100) <= 82 && mentionsVisualIssue;
      return {
        passed: ok,
        detail: ok
          ? `Body score ${res.bodyLanguageScore}/100 & flagged static hands/dark frame`
          : `Body score=${res.bodyLanguageScore}, visual mention=${mentionsVisualIssue}`
      };
    }
  },
  {
    id: "ideal_delivery",
    testerLabel: "Case 4 · Balanced Stage Delivery",
    role: "Target Benchmark",
    scenarioName: "45s at ~127 WPM, 36% gestures, 0 fillers, 90% script match",
    expectedRule: "Great Pacing, Pacing ≥ 82 & Body ≥ 82",
    payload: {
      topic: "Mars Exploration",
      script: "Mars is our future home because oxygen generation machines like Moxie and reusable rockets make sustainable settlements possible for our generation.",
      durationSeconds: 45,
      spokenTranscript:
        "Imagine waking up to a bright red sunrise where gravity feels lighter and the entire sky glows copper. Mars is not merely a distant cold planet in our solar system; it represents humanity's next great frontier. First, reusable rockets dramatically lower the launch cost of carrying supplies across space. Second, oxygen machines like Moxie convert carbon dioxide directly into breathable air for astronauts. By investing in science today, our generation can turn red dust into thriving habitats. Thank you.",
      recordMode: "video",
      telemetry: {
        activeSpeakingSeconds: 38,
        silenceSeconds: 7,
        speakingRatioPct: 84,
        pauseCount: 4,
        longestPauseSeconds: 1.6,
        avgVolumePct: 58,
        volumeVariationPct: 26,
        quietMoments: 0,
        gestureActivityPct: 36,
        headStabilityPct: 88,
        eyeZoneCenteredPct: 86,
        lightingQuality: "Balanced",
        avgBrightness: 146,
        scriptCoveragePct: 90,
        matchedKeywords: ["future", "oxygen", "moxie", "reusable", "rockets", "generation"],
        missedKeywords: ["settlements"],
        firstHalfWpm: 124,
        secondHalfWpm: 126,
        timelineNotes: [
          { time: "0:10", label: "Active Gestures", detail: "Natural hand movement aligned with key concepts.", status: "good" }
        ]
      }
    },
    validate: (res) => {
      const ok =
        res.speakingSpeedStatus === "Great Pacing" &&
        res.overallPacingScore >= 82 &&
        (res.bodyLanguageScore ?? 0) >= 82;
      return {
        passed: ok,
        detail: ok
          ? `Confirmed Great Pacing (${res.overallPacingScore}/100, Body ${res.bodyLanguageScore}/100)`
          : `Expected ≥82/82, got Pacing ${res.overallPacingScore} / Body ${res.bodyLanguageScore}`
      };
    }
  },
  {
    id: "brief_5words",
    testerLabel: "Case 5 · Brief 5-Word Fragment",
    role: "Anti-Inflation Guard",
    scenarioName: "22s recording with only 5 spoken words",
    expectedRule: "Score ≤ 35, flags insufficient speech",
    payload: {
      topic: "Climate Solutions",
      script: "Renewable solar energy and grid batteries reduce carbon emissions rapidly.",
      durationSeconds: 22,
      spokenTranscript: "Hello um testing one two",
      recordMode: "video",
      telemetry: {
        activeSpeakingSeconds: 2,
        silenceSeconds: 20,
        speakingRatioPct: 9,
        pauseCount: 2,
        longestPauseSeconds: 14,
        avgVolumePct: 14,
        volumeVariationPct: 5,
        quietMoments: 2,
        gestureActivityPct: 9,
        headStabilityPct: 79,
        eyeZoneCenteredPct: 70,
        lightingQuality: "Balanced",
        avgBrightness: 130,
        scriptCoveragePct: 0,
        matchedKeywords: [],
        missedKeywords: ["renewable", "solar", "energy", "batteries", "carbon"],
        firstHalfWpm: 14,
        secondHalfWpm: 0,
        timelineNotes: []
      }
    },
    validate: (res) => {
      const ok = res.overallPacingScore <= 35;
      return {
        passed: ok,
        detail: ok
          ? `Prevented inflated grade on 5-word fragment (${res.overallPacingScore}/100)`
          : `Expected ≤35, got ${res.overallPacingScore}/100`
      };
    }
  }
];

export const TesterCalibrationPanel: React.FC<TesterCalibrationPanelProps> = ({ currentFeedback }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunningSuite, setIsRunningSuite] = useState(false);
  const [suiteResults, setSuiteResults] = useState<CalibrationResult[]>([]);

  // Human tester review state (persisted in localStorage)
  const [testerReviews, setTesterReviews] = useState<HumanTesterReview[]>(() => {
    try {
      const saved = localStorage.getItem("junoai_tester_reviews");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [testerName, setTesterName] = useState("");
  const [testerRole, setTesterRole] = useState<"Student" | "Teacher" | "Peer Tester">("Peer Tester");
  const [verdict, setVerdict] = useState<"Accurate" | "Too Generous" | "Too Harsh">("Accurate");
  const [testerNote, setTesterNote] = useState("");
  const [reviewSavedToast, setReviewSavedToast] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("junoai_tester_reviews", JSON.stringify(testerReviews));
    } catch {}
  }, [testerReviews]);

  const runCalibrationSuite = async () => {
    setIsRunningSuite(true);
    try {
      const results = await Promise.all(
        CALIBRATION_SCENARIOS.map(async (scenario) => {
          try {
            const response = await fetch("/api/analyze-recording", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(scenario.payload)
            });
            const data: RecordingFeedback = await response.json();
            const check = scenario.validate(data);
            return {
              id: scenario.id,
              passed: check.passed,
              pacingScore: data.overallPacingScore,
              bodyScore: data.bodyLanguageScore ?? 0,
              wpm: data.wordsPerMinute,
              status: data.speakingSpeedStatus,
              detail: check.detail,
              summary: data.generalFeedback
            };
          } catch (err: any) {
            return {
              id: scenario.id,
              passed: false,
              pacingScore: 0,
              bodyScore: 0,
              wpm: 0,
              status: "Error",
              detail: err?.message || "Request failed",
              summary: ""
            };
          }
        })
      );
      setSuiteResults(results);
    } finally {
      setIsRunningSuite(false);
    }
  };

  const handleSubmitTesterReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFeedback) return;
    const entry: HumanTesterReview = {
      id: "rev_" + Date.now(),
      testerName: testerName.trim() || "Anonymous Tester",
      testerRole,
      verdict,
      note: testerNote.trim() || "Verified score against live video/audio performance.",
      measuredScore: currentFeedback.overallPacingScore,
      measuredWpm: currentFeedback.wordsPerMinute,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setTesterReviews((prev) => [entry, ...prev].slice(0, 25));
    setTesterNote("");
    setReviewSavedToast(true);
    setTimeout(() => setReviewSavedToast(false), 2500);
  };

  const passedCount = suiteResults.filter((r) => r.passed).length;
  const accurateReviewsCount = testerReviews.filter((r) => r.verdict === "Accurate").length;

  return (
    <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#000] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#06D6A0] border-2 border-black rounded-xl text-black shadow-[2px_2px_0px_#000]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-black font-heading">
              Accuracy Calibration & Tester Verification
            </h4>
            <p className="text-xs text-slate-600 font-semibold">
              Test the analyzer across 5 benchmark speaker profiles or log human tester accuracy checks.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-[#FFF9F2] hover:bg-[#FFD166] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          {isExpanded ? "Hide Calibration Lab" : "Open Tester Lab"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-5 pt-3 border-t-2 border-black/15">
          {/* Section 1: 5-Scenario Automated Accuracy Check */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-[#FF6B35]" /> Live 5-Tester Calibration Suite
                </p>
                <p className="text-[11px] text-slate-600 font-medium">
                  Sends 5 distinct rehearsal telemetry profiles to <code className="bg-slate-100 px-1 rounded border border-black/20">/api/analyze-recording</code> to verify scoring fairness.
                </p>
              </div>
              <button
                type="button"
                onClick={runCalibrationSuite}
                disabled={isRunningSuite}
                className="px-4 py-2 bg-[#FF6B35] hover:bg-[#e0531e] text-white font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                {isRunningSuite ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running 5 Tests...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" /> Run 5-Tester Check
                  </>
                )}
              </button>
            </div>

            {suiteResults.length > 0 && (
              <div className="p-3 bg-[#FFF9F2] border-2 border-black rounded-xl flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black text-black">
                  Calibration Result:{" "}
                  <span className={passedCount === CALIBRATION_SCENARIOS.length ? "text-emerald-700" : "text-amber-700"}>
                    {passedCount}/{CALIBRATION_SCENARIOS.length} Scenarios Passed ({Math.round((passedCount / CALIBRATION_SCENARIOS.length) * 100)}% Accuracy)
                  </span>
                </span>
                <span className="text-[11px] text-slate-600 font-semibold">
                  Tested against live scoring engine
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CALIBRATION_SCENARIOS.map((sc) => {
                const res = suiteResults.find((r) => r.id === sc.id);
                return (
                  <div
                    key={sc.id}
                    className={`p-3.5 rounded-xl border-2 border-black space-y-1.5 ${
                      res ? (res.passed ? "bg-emerald-50/70" : "bg-rose-50/80") : "bg-[#FFF9F2]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-black">{sc.testerLabel}</span>
                      {res ? (
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black flex items-center gap-1 ${
                            res.passed ? "bg-[#06D6A0] text-black" : "bg-[#EF476F] text-white"
                          }`}
                        >
                          {res.passed ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {res.passed ? "PASS" : "CHECK"}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-600 uppercase">{sc.role}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium">{sc.scenarioName}</p>
                    <p className="text-[11px] text-slate-600 font-semibold">Expected: {sc.expectedRule}</p>
                    {res && (
                      <div className="pt-1 border-t border-black/15 text-[11px] font-bold text-black space-y-0.5">
                        <div className="flex items-center justify-between tabular-nums">
                          <span>Measured: {res.pacingScore}/100 Pacing · {res.bodyScore}/100 Body</span>
                          <span>{res.wpm} WPM</span>
                        </div>
                        <p className={res.passed ? "text-emerald-800" : "text-rose-800"}>{res.detail}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Human Tester Review Logger */}
          <div className="pt-3 border-t-2 border-black/15 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#FF6B35]" /> Human Tester Feedback Log
              </p>
              {testerReviews.length > 0 && (
                <span className="text-xs font-bold text-slate-700 tabular-nums">
                  {accurateReviewsCount}/{testerReviews.length} rated accurate ({Math.round((accurateReviewsCount / testerReviews.length) * 100)}%)
                </span>
              )}
            </div>

            {currentFeedback ? (
              <form onSubmit={handleSubmitTesterReview} className="bg-[#FFF9F2] p-4 rounded-xl border-2 border-black space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Tester Name</label>
                    <input
                      type="text"
                      value={testerName}
                      onChange={(e) => setTesterName(e.target.value)}
                      placeholder="e.g. Alex (Peer)"
                      className="w-full bg-white border-2 border-black rounded-lg px-2.5 py-1.5 text-xs font-semibold text-black focus:outline-none focus:border-[#FF6B35]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Reviewer Role</label>
                    <select
                      value={testerRole}
                      onChange={(e) => setTesterRole(e.target.value as any)}
                      className="w-full bg-white border-2 border-black rounded-lg px-2.5 py-1.5 text-xs font-bold text-black focus:outline-none focus:border-[#FF6B35]"
                    >
                      <option value="Peer Tester">Peer Tester</option>
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">Accuracy Verdict</label>
                    <select
                      value={verdict}
                      onChange={(e) => setVerdict(e.target.value as any)}
                      className="w-full bg-white border-2 border-black rounded-lg px-2.5 py-1.5 text-xs font-bold text-black focus:outline-none focus:border-[#FF6B35]"
                    >
                      <option value="Accurate">Accurate</option>
                      <option value="Too Generous">Too Generous</option>
                      <option value="Too Harsh">Too Harsh</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={testerNote}
                    onChange={(e) => setTesterNote(e.target.value)}
                    placeholder="Specific observation (e.g. 'Caught my 165 WPM rush and missed keywords accurately')"
                    className="flex-1 bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-medium text-black focus:outline-none focus:border-[#FF6B35]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#06D6A0] hover:bg-[#05be8d] text-black font-black text-xs uppercase rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Log Tester Check
                  </button>
                </div>
                {reviewSavedToast && (
                  <p className="text-xs font-bold text-emerald-700">Tester accuracy review saved for this run.</p>
                )}
              </form>
            ) : (
              <p className="text-xs text-slate-600 font-medium bg-[#FFF9F2] p-3 rounded-xl border border-black/20">
                Record and analyze a practice video/audio take above to log a human tester accuracy review for that run.
              </p>
            )}

            {testerReviews.length > 0 && (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {testerReviews.map((rev) => (
                  <div key={rev.id} className="p-2.5 bg-white border-2 border-black rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-black text-black">{rev.testerName}</span>
                      <span className="text-slate-500 font-semibold"> · {rev.testerRole} · {rev.timestamp}</span>
                      <p className="text-slate-700 font-medium mt-0.5">{rev.note}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 tabular-nums">
                      <span className="text-[11px] font-bold text-slate-700">{rev.measuredScore}/100 ({rev.measuredWpm} WPM)</span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black ${
                          rev.verdict === "Accurate"
                            ? "bg-[#06D6A0] text-black"
                            : "bg-[#FFD166] text-black"
                        }`}
                      >
                        {rev.verdict}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
