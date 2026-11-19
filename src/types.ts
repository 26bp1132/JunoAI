export interface ScriptAnalysisResult {
  scores: {
    confidence: number;
    clarity: number;
    engagement: number;
    vocabulary: number;
    organization: number;
    professionalism: number;
    overall: number;
  };
  readiness: "Needs More Practice" | "Almost Ready" | "Presentation Ready" | "Outstanding";
  difficulty: {
    suitableYears: string[];
    analysis: string;
    suggestions: string;
  };
  scriptAnalysis: {
    grammarSpelling: string;
    clarity: string;
    vocabLevel: string;
    variety: string;
    organization: string;
  };
  introAnalysis: {
    rating: string;
    evaluation: string;
    alternatives: string[];
  };
  conclusionAnalysis: {
    rating: string;
    evaluation: string;
    alternatives: string[];
  };
  attentionSpan: {
    longParagraphs: Array<{ text: string; suggestion: string }>;
    repetitiveExplanations: string[];
    boringSections: string[];
  };
  speakingTips: {
    eyeContact: string;
    voiceProjection: string;
    bodyLanguage: string;
    handGestures: string;
    confidence: string;
    pacing: string;
  };
  visualAids: Array<{
    visual: string;
    whereToInsert: string;
    explanation: string;
  }>;
  fillerWords: {
    detected: string[];
    analysis: string;
    fluencyTips: string;
  };
  persuasiveness: {
    isPersuasive: boolean;
    argumentStrength: string;
    weakEvidence: string;
    suggestions: string;
  };
  confidenceBuilder: {
    positiveTips: string[];
    lastMinuteReminders: string[];
    checklist: string[];
  };
  teacherMode: {
    gradeEstimate: string;
    strengths: string;
    improvements: string;
    nextSteps: string;
  };
  questions: Array<{
    difficulty: "Easy" | "Medium" | "Challenging" | string;
    question: string;
    modelAnswer: string;
  }>;
  flashcards?: Array<{
    front: string;
    back: string;
  }>;
  improvedScript?: string;
}

export interface SlideDeckItem {
  slideNumber: number;
  title: string;
  originalText: string;
  revisedText: string;
  wordCount: number;
  density: "Optimal" | "Moderate" | "Overcrowded";
  designTips: string[];
  grammarNotes: string[];
  slideScore: number;
}

export interface SlideAnalysisResult {
  issues: Array<{
    type: string;
    severity: "High" | "Medium" | "Low";
    description: string;
    recommendation: string;
  }>;
  bulletPointQuality: string;
  readabilityAdvice: string;
  designAdvice?: string;
  grammarAdvice?: string;
  overallScore: number;
  designScore?: number;
  grammarScore?: number;
  revisedSlideText: string;
  totalSlidesDetected?: number;
  slideDeck?: SlideDeckItem[];
  isFallback?: boolean;
  fallbackMessage?: string;
}

export interface QnaQuizOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QnaQuizItem {
  id: number;
  question: string;
  category: "Clarification" | "Challenge" | "Deep Detail" | "Future Impact" | string;
  badgeColor: string;
  icon: string;
  whyAsked: string;
  prepStrategy: string;
  modelAnswer: string;
  options: QnaQuizOption[];
  xpReward: number;
}

export interface PracticeFeedback {
  rating: number;
  feedbackText: string;
  strengths: string;
  improvements: string;
  modelAnswer: string;
}

export interface VideoTelemetryObservation {
  time: string;
  label: string;
  detail: string;
  status: "good" | "improve";
}

export interface VideoTelemetrySummary {
  activeSpeakingSeconds: number;
  silenceSeconds: number;
  speakingRatioPct: number;
  pauseCount: number;
  longestPauseSeconds: number;
  avgVolumePct: number;
  volumeVariationPct: number;
  quietMoments: number;
  gestureActivityPct: number;
  headStabilityPct: number;
  eyeZoneCenteredPct: number;
  lightingQuality: "Dark" | "Balanced" | "Bright";
  avgBrightness: number;
  scriptCoveragePct: number;
  matchedKeywords: string[];
  missedKeywords: string[];
  firstHalfWpm: number;
  secondHalfWpm: number;
  timelineNotes: VideoTelemetryObservation[];
}

export interface SpecificVideoObservation {
  timestamp: string;
  area: "Gestures" | "Posture" | "Eye Contact" | "Pacing" | "Clarity" | "Lighting" | string;
  finding: string;
  fix: string;
  severity: "strength" | "caution" | "critical";
}

export interface RecordingFeedback {
  speakingSpeedStatus: "Too Fast" | "Too Slow" | "Great Pacing" | string;
  wordsPerMinute: number;
  speakingTimeSeconds: number;
  clarity: string;
  confidence: string;
  fillerWordsCount: {
    um: number;
    uh: number;
    like: number;
    so: number;
    other: number;
  };
  fillerWordsAnalysis: string;
  partsToImprove: string[];
  suggestedQuestions: string[];
  overallPacingScore: number;
  generalFeedback: string;
  // Video Recording & Body Language Fields
  recordMode?: "video" | "audio";
  handGesturesFeedback?: string;
  postureFeedback?: string;
  eyeContactFeedback?: string;
  expressionFeedback?: string;
  bodyLanguageScore?: number;
  bodyLanguageActionableTips?: string[];
  telemetry?: VideoTelemetrySummary;
  specificObservations?: SpecificVideoObservation[];
  scriptAdherenceFeedback?: string;
  deliveryConsistencyScore?: number;
}

export interface SavedPresentation {
  id: string;
  title: string;
  targetYear: string;
  script: string;
  timestamp: string;
  analysis: ScriptAnalysisResult;
}

export interface TedAnalysisResult {
  tedScore: number;
  speakerBadge: string;
  ideaWorthSpreading: {
    clarity: string;
    uniquenessScore: number;
    coreIdeaSummary: string;
  };
  narrativeArc: {
    hookRating: string;
    emotionalResonance: string;
    pacingFeedback: string;
    climaxStrength: string;
  };
  rhetoricalPauses: Array<{
    phrase: string;
    suggestedPauseDuration: string;
    why: string;
  }>;
  tedRecommendations: string[];
  improvedTedScript: string;
  isFallback?: boolean;
}
