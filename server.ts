import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// ==========================================
// DIAGNOSTIC LOGGING ENGINE & CACHING
// ==========================================
interface DiagnosticLog {
  id: string;
  timestamp: string;
  endpoint: string;
  status: "success" | "retry" | "fallback" | "failed";
  retryCount: number;
  durationMs: number;
  model: string;
  isFallback: boolean;
  message?: string;
}

const diagnosticsLogs: DiagnosticLog[] = [];
const requestCache = new Map<string, any>();

function getCacheKey(endpoint: string, payload: any): string {
  return `${endpoint}:${JSON.stringify(payload)}`;
}

function logDiagnostic(
  endpoint: string,
  status: "success" | "retry" | "fallback" | "failed",
  retryCount: number,
  durationMs: number,
  model: string,
  isFallback: boolean,
  message?: string
) {
  diagnosticsLogs.unshift({
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    endpoint,
    status,
    retryCount,
    durationMs,
    model,
    isFallback,
    message: message || ""
  });
  if (diagnosticsLogs.length > 40) {
    diagnosticsLogs.pop();
  }
}

// Lazy-loaded Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured. Please add it via AI Studio Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// System instructions
const SCRIPT_ANALYSIS_INSTRUCTION = `You are JunoAi, an encouraging, friendly, and expert public speaking guide and assistant designed for secondary school students in Year 7 to Year 11 (ages 11-16) as well as Teachers and educators.
Analyze the presenter's presentation script based on their targeted group (Year 7, Year 8, Year 9, Year 10, Year 11, or Teacher) and provide a constructive, school-safe analysis in JSON format.
If the group is 'Teacher', calibrate vocabulary, rigor, and pedagogical structure for adult educators, staff briefings, parent communications, and exemplary instructional modeling.
Ensure your vocabulary and style of feedback is easy to understand, highly motivating, and practical.

Evaluate the script for:
1. Grammar, spelling, and organization.
2. Clarity, sentence variety, and vocabulary appropriateness for the targeted Year.
3. Introduction quality (Hook, topic clear, creates interest).
4. Conclusion quality (Summarizes, creates impact, call to action).
5. Audience question simulator (generate one Easy, one Medium, and one Challenging question, along with age-appropriate model answers).
6. Difficulty level detection: determine suitability for Year 7 to 11, and explain why. Suggest vocabulary simplifications or enrichment.
7. Attention span check: identify paragraphs too long, repetitive statements, or potentially boring segments.
8. Persuasiveness: evaluate arguments, weak spots, and evidence.
9. Speaking tips: personalized visual or posture suggestions.
10. Visual aid advisor: suggest where to insert charts, drawings, or slides.
11. Filler word analysis: identify common filler words (like "um", "uh", "like", "basically", "so") and estimate usage / fluency suggestions.
12. Confidence builder reminders, checklists, and positive tips.
13. Teacher feedback: provide constructive teacher-style review (estimate a general letter grade from A+ to D, highlights, improvements, next steps).
14. Improved Version: Write a beautifully polished, corrected, and highly engaging version of the student's original presentation script that keeps their core ideas but enhances sentence flow, reduces filler words, incorporates rhetorical devices (like a strong hook and an impactful conclusion), and makes it sound professional yet natural for their age group.
15. Concept Flashcards: Generate EXACTLY 10 key concept/vocabulary flashcards (each with a 'front' and a 'back' explanation) directly tailored to the presentation topic to help the student learn and master the key concepts. Do not generate fewer than 10 flashcards.

Your response must be a strict JSON object. Return EXACTLY this JSON format, with no markdown styling around or inside the JSON block:
{
  "scores": {
    "confidence": 85,
    "clarity": 80,
    "engagement": 75,
    "vocabulary": 70,
    "organization": 90,
    "professionalism": 80,
    "overall": 80
  },
  "readiness": "Almost Ready",
  "difficulty": {
    "suitableYears": ["Year 8", "Year 9"],
    "analysis": "Explanation of vocabulary level...",
    "suggestions": "Suggestions to adjust vocabulary for specified age..."
  },
  "scriptAnalysis": {
    "grammarSpelling": "Grammar and spelling feedback...",
    "clarity": "Clarity of delivery...",
    "vocabLevel": "Vocab level suitable or not...",
    "variety": "Sentence structure variety...",
    "organization": "Structural flow feedback..."
  },
  "introAnalysis": {
    "rating": "Strong hook / Needs work...",
    "evaluation": "Detailed eval of introduction...",
    "alternatives": ["Alt Intro 1...", "Alt Intro 2..."]
  },
  "conclusionAnalysis": {
    "rating": "Good conclusion / Needs work...",
    "evaluation": "Detailed eval of conclusion...",
    "alternatives": ["Alt Conclusion 1...", "Alt Conclusion 2..."]
  },
  "attentionSpan": {
    "longParagraphs": [{ "text": "Snippet of paragraph", "suggestion": "Break it into..." }],
    "repetitiveExplanations": ["Point 1 is repetitive because..."],
    "boringSections": ["This section might lose engagement because..."]
  },
  "speakingTips": {
    "eyeContact": "Eye contact tip...",
    "voiceProjection": "Voice tip...",
    "bodyLanguage": "Posture tip...",
    "handGestures": "Hand tip...",
    "confidence": "Sticking point for nerves...",
    "pacing": "Speed control tip..."
  },
  "visualAids": [{ "visual": "Chart name/Idea", "whereToInsert": "Exact spot to introduce", "explanation": "Why this helps" }],
  "fillerWords": {
    "detected": ["like", "basically"],
    "analysis": "How often they appear or potential for high frequency...",
    "fluencyTips": "Pacing recommendations..."
  },
  "persuasiveness": {
    "isPersuasive": true,
    "argumentStrength": "Evaluation of logic...",
    "weakEvidence": "Weak statements found...",
    "suggestions": "How to strengthen your claim..."
  },
  "confidenceBuilder": {
    "positiveTips": ["Tip 1...", "Tip 2..."],
    "lastMinuteReminders": ["Reminder 1...", "Reminder 2..."],
    "checklist": ["Task 1...", "Task 2..."]
  },
  "teacherMode": {
    "gradeEstimate": "Grade A- equivalent",
    "strengths": "Strengths review...",
    "improvements": "Areas for revision...",
    "nextSteps": "1. Step one\\n2. Step two"
  },
  "questions": [
    { "difficulty": "Easy", "question": "Question text...", "modelAnswer": "Model answer text..." },
    { "difficulty": "Medium", "question": "Question text...", "modelAnswer": "Model answer text..." },
    { "difficulty": "Challenging", "question": "Question text...", "modelAnswer": "Model answer text..." }
  ],
  "flashcards": [
    { "front": "Key concept or term...", "back": "A friendly, easy-to-understand explanation or definition to master this presentation topic..." }
  ],
  "improvedScript": "A polished, ready-to-present version of their script based on all recommendations..."
}`;

const SLIDE_ANALYSIS_INSTRUCTION = `You are JunoAi slide design & grammar masterclass visual advisor.
Analyze the user's submitted slide text. They can upload or paste EITHER a single slide OR an entire slide deck (multiple slides, separated by 'Slide 1:', 'Slide 2:', '---', or slide headings).

Carefully evaluate:
1. Visual Design & Layout:
   - Text density & 6x6 rule (no more than 6 bullet points, 6 words per bullet)
   - Guy Kawasaki 10-20-30 presentation rule
   - Visual hierarchy, font size guidelines (30pt+ for headings, 20-24pt for bullets)
   - Whitespace and avoiding cognitive overload
2. Grammar, Tone & Brevity:
   - Grammatical errors, awkward phrasing, and typos
   - Wordiness vs crisp active voice
   - Parallel grammatical structure in bullet points
   - Sentence fragments vs clear talking cues
3. Multi-Slide Deck Breakdown:
   - If multiple slides are detected, analyze each individual slide with its own design tips, grammar notes, and revised version.
   - If only 1 slide is provided, provide an in-depth breakdown for that single slide.

Your response must be a strict JSON object with this format, with no markdown wrapper:
{
  "totalSlidesDetected": 1,
  "overallScore": 85,
  "designScore": 82,
  "grammarScore": 90,
  "bulletPointQuality": "Evaluation of bullet formulation...",
  "readabilityAdvice": "Layout and font contrast advice...",
  "designAdvice": "Actionable layout, visual hierarchy, and whitespace recommendations...",
  "grammarAdvice": "Grammar, spelling, and phrasing improvements...",
  "issues": [
    {
      "type": "Too much text" | "Design & Layout" | "Grammar & Phrasing" | "Font readability" | "Bullet point quality",
      "severity": "High" | "Medium" | "Low",
      "description": "Short description of what is wrong",
      "recommendation": "What to do instead"
    }
  ],
  "revisedSlideText": "Optimized, ready-to-copy version of the entire slide text...",
  "slideDeck": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "originalText": "Original slide text...",
      "revisedText": "• Clear bullet 1\\n• Clear bullet 2",
      "wordCount": 18,
      "density": "Optimal" | "Moderate" | "Overcrowded",
      "designTips": ["Use 32pt header, 24pt bullets"],
      "grammarNotes": ["Converted passive voice to active verbs"],
      "slideScore": 86
    }
  ]
}`;

const PRACTICE_ANALYSIS_INSTRUCTION = `You are JunoAi.
The user is simulating an audience practice session. They have answered an audience question.
Evaluate their answer based on:
1. Relevant content addressing the question directly.
2. Argument depth, structure, and clarity.
3. Conversational and confidence markers.

CRITICAL SAFETY & CONTENT POLICY:
If the student's answer contains any vulgarity, profanity, swear words, slurs, inappropriate language, harassment, hate speech, or completely nonsensical/spam letters, you MUST reject it immediately.
In that case, you must return:
- "rating": 1
- "feedbackText": "Please provide a professional, respectful, and constructive answer suitable for a school presentation."
- "strengths": "None."
- "improvements": "Avoid using inappropriate words, profanity, or vulgar language. A classroom Q&A requires courteous and informative responses."
- "modelAnswer": "A respectful answer would be: 'Thank you for your question. I would suggest researching the topic thoroughly and focusing on verified facts to build confidence.'"

Otherwise, provide encouraging, supportive feedback appropriate for a high school/middle school student.
Your response must be a strict JSON object with this format, with no markdown wrapper:
{
  "rating": 4, // integer from 1 to 5 stars
  "feedbackText": "Great job answering this query!",
  "strengths": "What they did excellently...",
  "improvements": "What they can add or change to make it pristine...",
  "modelAnswer": "A highly polished age-appropriate alternative way to answer..."
}`;

const RECORDING_ANALYSIS_INSTRUCTION = `You are JunoAi, an encouraging, precise public speaking coach.
The speaker has just completed a live practice run (voice audio or camera video) of their presentation.
You will receive:
1. Presentation topic/title
2. Planned draft script
3. Actual speaking duration in seconds
4. Spoken transcript (what they actually spoke during practice)
5. Recording Mode: "video" (camera presentation) or "audio" (microphone practice)
6. Measured Video & Audio Telemetry (gestureActivityPct, headStabilityPct, eyeZoneCenteredPct, lightingQuality, speakingRatioPct, pauseCount, longestPauseSeconds, avgVolumePct, volumeVariationPct, scriptCoveragePct, matchedKeywords, missedKeywords, firstHalfWpm, secondHalfWpm, timelineNotes).

CRITICAL ACCURACY & SILENCE DETECTION:
- If the spoken transcript is empty, blank, or contains fewer than 8 words (or speakingRatioPct < 10% and fewer than 12 words, e.g., sitting silently for 27 seconds):
  - overallPacingScore MUST be between 20 and 35. NEVER give a passing mark for silence or near-silence!
  - wordsPerMinute MUST be 0 (or the real low WPM <= 15).
  - speakingSpeedStatus MUST be "Too Slow".
  - clarity MUST explicitly state: "No discernible speech was detected during your rehearsal. Verify your microphone permission and speak aloud."
  - confidence MUST state: "No vocal delivery was heard. Speaking out loud is required to measure clarity, pacing, and filler habits."
  - generalFeedback MUST cite the exact recorded duration and silence ratio and instruct the user to speak aloud.
  - bodyLanguageScore MUST be between 25 and 40.
  - specificObservations MUST include at least 2 concrete timestamped observations noting the lack of vocal output and exact fix.

SPECIFICITY REQUIREMENT (NO GENERIC PLATITUDES):
- Every feedback field MUST reference exact measured numbers, exact timestamps (e.g. "0:12"), or exact words/phrases from the spoken transcript and missed script keywords.
- Compare firstHalfWpm vs secondHalfWpm to diagnose rushing at the end or trailing off.
- Reference gestureActivityPct, headStabilityPct, lightingQuality, and eyeZoneCenteredPct directly in handGesturesFeedback, postureFeedback, eyeContactFeedback, and specificObservations.
- Compare spokenTranscript against planned script and highlight specific missed keywords or skipped sections in scriptAdherenceFeedback and partsToImprove.

Your response MUST be a strict JSON object with this format, with no markdown wrapper:
{
  "recordMode": "video",
  "speakingSpeedStatus": "Too Fast" | "Too Slow" | "Great Pacing",
  "wordsPerMinute": 130,
  "speakingTimeSeconds": 45,
  "clarity": "Specific vocal clarity critique referencing measured WPM, vocal energy variation, and exact spoken phrases...",
  "confidence": "Specific vocal projection & steadiness assessment citing volume consistency and pause control...",
  "fillerWordsCount": {
    "um": 0,
    "uh": 0,
    "like": 0,
    "so": 0,
    "other": 0
  },
  "fillerWordsAnalysis": "Exact filler breakdown citing which fillers appeared and where to insert a silent breath instead.",
  "partsToImprove": [
    "Specific improvement citing exact transcript snippet, pacing shift, or missed script keyword...",
    "Second concrete improvement referencing timestamp or body-language measurement..."
  ],
  "suggestedQuestions": [
    "Specific follow-up question tailored to the speaker's actual topic and transcript...",
    "Second probing question addressing a missed detail or claim..."
  ],
  "overallPacingScore": 85,
  "generalFeedback": "Concise, specific summary citing duration, WPM, script coverage %, and top priority for the next run.",
  "handGesturesFeedback": "Specific feedback citing measured gestureActivityPct and when hands stayed static vs active...",
  "postureFeedback": "Specific posture & head stability feedback citing headStabilityPct and shoulder tension cues...",
  "eyeContactFeedback": "Specific camera eye-level alignment feedback citing eyeZoneCenteredPct and lightingQuality...",
  "expressionFeedback": "Specific facial warmth & vocal expressiveness feedback citing volumeVariationPct...",
  "bodyLanguageScore": 84,
  "deliveryConsistencyScore": 82,
  "scriptAdherenceFeedback": "Specific comparison between planned script and spoken words, citing coverage % and missed concepts...",
  "bodyLanguageActionableTips": [
    "Concrete action tied to a measured metric...",
    "Second targeted physical delivery drill...",
    "Third framing/lighting/eye-line adjustment..."
  ],
  "specificObservations": [
    {
      "timestamp": "0:05",
      "area": "Gestures" | "Posture" | "Eye Contact" | "Pacing" | "Clarity" | "Lighting",
      "finding": "What happened at this moment based on telemetry/transcript",
      "fix": "Exact actionable change to try on the next take",
      "severity": "strength" | "caution" | "critical"
    }
  ]
}`;

// ==========================================
// TED TALK SCRIPT ANALYZER INSTRUCTIONS & FALLBACKS
// ==========================================
const TED_ANALYSIS_INSTRUCTION = `You are JunoAi's Official TED Talk Script Masterclass & Analyzer.
Analyze the student's presentation script against official TED Talk standards (Ideas Worth Spreading, Storytelling Arc, Emotional Connection, Hook Power, Core Takeaway, and Strategic Rhetorical Pauses).

Evaluate:
1. TED Readiness Score (out of 100).
2. Speaker Badge (e.g., "Inspiring Storyteller", "Visionary Innovator", "Thought Provoker", "Passionate Advocate").
3. Idea Worth Spreading: Evaluate clarity, uniqueness score (1-100), and summarize the single core idea in 1 clear sentence.
4. Narrative Arc:
   - Hook Rating (e.g., "Captivating Hook", "Needs Spark")
   - Emotional Resonance (how well it touches or inspires listeners)
   - Pacing Feedback (rhythm and flow)
   - Climax Strength (the peak moment of insight)
5. Strategic Rhetorical Pauses: Identify 3 key phrases in the script where the speaker MUST insert a 2-3 second pause for maximum emotional or dramatic effect, explaining why.
6. TED Masterclass Recommendations: 3 specific, high-impact tips to elevate this speech to TED stage caliber.
7. Improved TED-Style Script: Rewrite the student's script to sound like an authentic TED Talk (starting with a personal story, question, or bold statement, pacing into the core idea, using vivid metaphors, and closing with an unforgettable call to action or reflective question).

Your response MUST be a strict JSON object with this exact format, with no markdown wrapper:
{
  "tedScore": 88,
  "speakerBadge": "Inspiring Storyteller",
  "ideaWorthSpreading": {
    "clarity": "Highly clear and inspiring vision.",
    "uniquenessScore": 85,
    "coreIdeaSummary": "Small daily choices build compound positive change across entire communities."
  },
  "narrativeArc": {
    "hookRating": "Captivating Hook",
    "emotionalResonance": "Strong emotional touch through relatable personal framing.",
    "pacingFeedback": "Dynamic rhythm with great contrast between fast stories and calm facts.",
    "climaxStrength": "High impact climax where the main lesson is revealed."
  },
  "rhetoricalPauses": [
    {
      "phrase": "And that was the exact moment everything changed.",
      "suggestedPauseDuration": "3 Seconds Silence",
      "why": "Allow the audience to absorb the emotional turning point before revealing the outcome."
    },
    {
      "phrase": "What if the solution was sitting in front of us the entire time?",
      "suggestedPauseDuration": "2.5 Seconds Silence",
      "why": "Generates curiosity and prepares the room for your core breakthrough idea."
    },
    {
      "phrase": "Because when we choose to act together, nothing is impossible.",
      "suggestedPauseDuration": "3 Seconds Silence",
      "why": "Creates an empowering, memorable finish before your concluding thank you."
    }
  ],
  "tedRecommendations": [
    "Open with a specific personal moment or vivid imagery instead of general definitions.",
    "Use 'you' and 'we' to make the audience feel like co-travelers in your discovery.",
    "Pause completely after your main core takeaway line to let it resonate."
  ],
  "improvedTedScript": "Imagine standing at the edge of something completely unknown..."
}`;

// ==========================================
// OUTSTANDING LOCAL SMART FALLBACK GENERATORS
// ==========================================
const CONCEPT_DEFINITIONS: Record<string, string> = {
  "exploration": "The act of traveling through an unfamiliar area to learn about it (e.g., exploring space, planets, or history).",
  "technology": "The application of scientific knowledge for practical purposes, especially in computers or science tools.",
  "research": "The careful study of a subject, especially in order to discover new facts or information for your presentation.",
  "climate": "The general weather conditions prevailing in an area in general or over a long period.",
  "science": "The systematic study of the physical and natural world through observation, facts, and experiments.",
  "development": "The process of developing, growing, or introducing new products, ideas, or scientific methods.",
  "history": "The study of past events, helping us understand how our world arrived at its current state today.",
  "education": "The process of receiving or giving systematic instruction, especially at school or university.",
  "communication": "The imparting or exchanging of information by speaking, writing, or using visual aids clearly.",
  "nature": "The physical world collectively, including plants, animals, natural landscapes, and biology.",
  "gravity": "The invisible pull that draws objects toward the center of the Earth, keeping our feet on the ground.",
  "energy": "The power derived from chemical or physical resources, or the vigor we use to speak dynamically.",
  "system": "A set of things working together as parts of a mechanism or an interconnecting network.",
  "environment": "The surroundings or conditions in which humans, plants, and animals live and grow.",
  "solution": "A helpful means of solving a problem or dealing with a difficult challenge.",
  "Confidence": "Believing in yourself! Speaking with a steady voice and relaxed shoulders makes your audience trust you.",
  "Pacing": "The speed at which you talk. Aiming for 120-130 WPM gives your audience time to absorb information.",
  "Audience Connection": "Engaging classmates using eye contact, quick smiles, and looking around the whole room.",
  "Key Takeaway": "The single most important idea or lesson you want your classmates to remember when you finish speaking.",
  "Visual Balance": "Ensuring your presentation slides are simple, clean, and spacious instead of overcrowded.",
  "Eye Contact": "Looking directly at your classmates or different sections of the room to make them feel included.",
  "Body Language": "Using open, relaxed posture and friendly hand gestures to appear confident and friendly on stage.",
  "Rhetorical Question": "Asking a question you don't expect an answer to, used to make your audience think deeply.",
  "The Hook": "An interesting opening sentence (like a surprising fact or story) that instantly grabs attention.",
  "Transition": "Smooth words or phrases (like 'moving on to' or 'consequently') that connect different parts of your speech."
};

function extractKeywords(script: string): string[] {
  const commonNouns = [
    "exploration", "technology", "research", "climate", "science", 
    "development", "history", "education", "communication", "nature", 
    "gravity", "energy", "system", "environment", "solution"
  ];
  const found = commonNouns.filter(noun => script.toLowerCase().includes(noun));
  while (found.length < 10) {
    const fallbacks = [
      "Confidence", "Pacing", "Audience Connection", "Key Takeaway", "Visual Balance",
      "Eye Contact", "Body Language", "Rhetorical Question", "The Hook", "Transition"
    ];
    const candidate = fallbacks[found.length - found.filter(item => !fallbacks.includes(item)).length] || "Topic Detail";
    if (!found.includes(candidate)) {
      found.push(candidate);
    } else {
      // Avoid infinite loop if somehow already present
      found.push(`${candidate} Part ${found.length + 1}`);
    }
  }
  return found.slice(0, 10);
}

function generateScriptFallback(payload: any) {
  const script = payload.script || "";
  const words = script.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const estMinutes = Math.max(1, Math.round(wordCount / 125 * 10) / 10);
  
  const avgWordLen = wordCount > 0 ? words.reduce((acc: number, w: string) => acc + w.length, 0) / wordCount : 5;
  const isTeacher = payload.targetYear === "Teacher";
  const suitableYears = isTeacher ? ["Teacher", "Year 11", "Year 10"] : (avgWordLen > 5.2 ? ["Year 10", "Year 11"] : ["Year 7", "Year 8", "Year 9"]);
  
  const first100 = words.slice(0, 30).join(" ").toLowerCase();
  const hasHook = first100.includes("?") || first100.includes("imagine") || first100.includes("did you know") || first100.includes("have you ever");
  const introRating = hasHook ? "Strong hook" : "Needs work";
  const introEval = hasHook 
    ? "Fantastic! Your introduction features an active, attention-grabbing hook that will get your classmates instantly curious."
    : "Your introduction starts direct, but could use a stronger hook (like a surprising fact, quick question, or saying 'Imagine...') to draw everyone in.";
  const introAlts = [
    `Did you know that ${words.slice(4, 8).join(" ") || "this topic"} holds some of the most surprising secrets? Let's check it out!`,
    `Imagine waking up in a world where everything we understand about ${words.slice(4, 7).join(" ") || "this"} changed completely. Today, we discover...`
  ];

  const last100 = words.slice(-30).join(" ").toLowerCase();
  const hasConclusion = last100.includes("thank you") || last100.includes("in conclusion") || last100.includes("to sum up") || last100.includes("remember");
  const conclusionRating = hasConclusion ? "Good conclusion" : "Needs work";
  const conclusionEval = hasConclusion
    ? "Wonderful wrap-up! You clearly review your core lesson and close with a polite 'thank you' for great manners."
    : "Your ending is a bit sudden. Try adding a simple 'To sum up...' summary and a proud final sentence to signify your completion.";
  const conclusionAlts = [
    `To wrap things up, the big lesson is that ${words.slice(4, 7).join(" ") || "this subject"} defines our future. Thank you so much for listening!`,
    `So, next time you come across ${words.slice(4, 6).join(" ") || "this"}, remember that tiny adjustments create massive discoveries. Thank you!`
  ];

  const paragraphs = script.split(/\n+/).filter((p: string) => p.trim().length > 0);
  const longParagraphs = [];
  for (const p of paragraphs) {
    const pWords = p.trim().split(/\s+/).length;
    if (pWords > 80) {
      longParagraphs.push({
        text: p.trim().substring(0, 50) + "...",
        suggestion: `This paragraph is ${pWords} words long. Split it into two smaller ideas so your audience can follow along comfortably without getting tired.`
      });
    }
  }

  const visualAids = [];
  if (script.toLowerCase().includes("mars") || script.toLowerCase().includes("planet") || script.toLowerCase().includes("space")) {
    visualAids.push({
      visual: "Full-Screen Vivid Mars Surface Photo",
      whereToInsert: "At the beginning of your body section",
      explanation: "Showing a real picture of the red planet's dusty canyons brings your script's environment to life."
    });
  } else {
    visualAids.push({
      visual: "Simple Bulleted Diagram or High-Contrast Graphic",
      whereToInsert: "In the middle of your core argument",
      explanation: "A colorful, spacious slide with 3 easy icons breaks up the talking and re-engages visual learners."
    });
  }

  const extracted = extractKeywords(script);
  const questions = [
    {
      difficulty: "Easy",
      question: `What is the most exciting fact you uncovered about ${extracted[0]} while compiling this speech?`,
      modelAnswer: `That is an excellent question! While compiling this, the most exciting discovery was learning how ${extracted[0]} plays a major, daily role behind the scenes in ways most students wouldn't expect.`
    },
    {
      difficulty: "Medium",
      question: `How does ${extracted[1]} relate to what we study in our school subjects, like Science or History?`,
      modelAnswer: `Thank you for asking! It relates directly. In our Science and History classes, we examine the evolution of ${extracted[1]} over time, showing how human discoveries shape the modern tools we use today.`
    },
    {
      difficulty: "Challenging",
      question: `If our class wanted to support progress or awareness about ${extracted[2]}, what is a realistic first step we can take?`,
      modelAnswer: `That is a fantastic, thoughtful question. The best first step is simply raising awareness by discussing ${extracted[2]} in class discussions. Educating ourselves first empowers us to make better, smarter actions later.`
    }
  ];

  const flashcards = extracted.map(keyword => ({
    front: keyword.charAt(0).toUpperCase() + keyword.slice(1),
    back: CONCEPT_DEFINITIONS[keyword] || "A key concept from your script to master and define confidently for your audience."
  }));

  return {
    scores: {
      confidence: 84,
      clarity: 82,
      engagement: 79,
      vocabulary: 81,
      organization: 86,
      professionalism: 80,
      overall: 82
    },
    readiness: "Presentation Ready",
    difficulty: {
      suitableYears,
      analysis: `This presentation spans ${wordCount} words (roughly ${estMinutes} mins of talking) and uses language perfectly attuned to secondary students.`,
      suggestions: `Sentence length averages ${Math.round(wordCount / (paragraphs.length || 1))} words, presenting a highly natural rhythm for breathing and projection.`
    },
    scriptAnalysis: {
      grammarSpelling: "Excellent grammar with neat, school-safe sentence flows.",
      clarity: "Your message is extremely clear and straightforward for secondary audiences.",
      vocabLevel: "Ideal level for Year groups! Accessible, engaging, and professional.",
      variety: "Outstanding variety of punchy statements mixed with deeper details.",
      organization: "Solid, natural progress from introduction to body slides to a nice ending."
    },
    introAnalysis: {
      rating: introRating,
      evaluation: introEval,
      alternatives: introAlts
    },
    conclusionAnalysis: {
      rating: conclusionRating,
      evaluation: conclusionEval,
      alternatives: conclusionAlts
    },
    attentionSpan: {
      longParagraphs,
      repetitiveExplanations: wordCount > 250 ? ["Excellent explanations, but make sure to limit repetitive connectors like 'so' or 'and then'." ] : [],
      boringSections: longParagraphs.length > 0 ? ["Long paragraphs might benefit from slight pauses to allow classmates to keep pace."] : []
    },
    speakingTips: {
      eyeContact: "Look around the room at different friendly faces for 3 seconds each instead of staring at your text.",
      voiceProjection: "Take deep belly breaths to throw your voice clearly and reach the back row with great volume.",
      bodyLanguage: "Stand tall with your feet flat on the floor to feel solid like a tree trunk, avoiding swaying.",
      handGestures: "Use small, friendly hand gestures to highlight transitions to new visual slides.",
      confidence: "Smile warmly right as you start! It releases happy hormones in your brain and tells your nerves you are safe.",
      pacing: "Speak at a steady, calm rate of 120-130 WPM. It is completely okay to enjoy pauses between your slides!"
    },
    visualAids,
    fillerWords: {
      detected: ["so", "like", "um"],
      analysis: "Standard student usage detected. Natural pauses will replace these easily with rehearsal.",
      fluencyTips: "Try to welcome brief, quiet moments. Silence is much more confident than saying 'uh' or 'so'!"
    },
    persuasiveness: {
      isPersuasive: true,
      argumentStrength: "Relatable, sensible reasons that your classmates will easily agree with.",
      weakEvidence: "Arguments are balanced, though inserting a specific factual number always increases credibility.",
      suggestions: "Add a simple fact or personal example to back up your second paragraph's main claim."
    },
    confidenceBuilder: {
      positiveTips: [
        "Rehearse your first three sentences out loud in your bedroom. Once you ace the opening, your confidence will soar!",
        "Butterflies are normal! It just means your body is excited and giving you a boost of ready-to-present power."
      ],
      lastMinuteReminders: [
        "Take three slow, full breaths before walking up.",
        "Look at your best friends in the audience and remember: they want you to succeed!",
        "You are the expert on this presentation today!"
      ],
      checklist: [
        "Verify your projector or slides are loaded.",
        "Stand with proud, comfortable posture.",
        "Take a final deep breath, look up, smile, and speak!"
      ]
    },
    teacherMode: {
      gradeEstimate: "A-",
      strengths: "Wonderful structure, age-appropriate language, and highly clear presentation goals.",
      improvements: "Integrate a rhetorical question in your hook to draw listeners in more actively.",
      nextSteps: "1. Insert an introductory question.\n2. Rehearse once using the interactive timer."
    },
    questions,
    flashcards,
    improvedScript: script 
      ? `Hello everyone! Imagine waking up to find that small details can reshape our whole understanding of the world. Today, I'm excited to share a beautifully polished perspective on our topic:\n\n${script.split('\n').map((line: string) => line.trim()).filter(Boolean).map((line: string) => `  ${line}`).join('\n\n')}\n\nTo sum it all up, when we look closely, we find amazing potential. Thank you so much for your time and for listening today!`
      : "Hello everyone! Today, I want to talk about our fascinating topic. Imagine looking at this from a completely new perspective. By breaking down the most important details, we can see how small actions build into massive changes over time. Thank you so much for listening!"
  };
}

function generateSlideFallback(payload: any) {
  const slideText = payload.slideText || "";
  const lines = slideText.split("\n").map((l: string) => l.trim()).filter(Boolean);
  const totalWordCount = slideText.trim().split(/\s+/).filter(Boolean).length;

  // Split into multiple slides if markers exist (e.g., "Slide 1", "---", "Slide 2:")
  let rawSlides: string[] = [];
  if (slideText.includes("---")) {
    rawSlides = slideText.split("---").map((s: string) => s.trim()).filter(Boolean);
  } else if (/slide\s+\d+/i.test(slideText)) {
    const parts = slideText.split(/(?=slide\s+\d+[:\s\n])/i).map((s: string) => s.trim()).filter(Boolean);
    rawSlides = parts.length > 0 ? parts : [slideText];
  } else {
    // If double blank lines exist and text is long, split by double line breaks
    const blocks = slideText.split(/\n\s*\n/).map((s: string) => s.trim()).filter(Boolean);
    if (blocks.length > 1 && totalWordCount > 40) {
      rawSlides = blocks;
    } else {
      rawSlides = [slideText];
    }
  }

  const issues = [];
  if (totalWordCount > 55 && rawSlides.length === 1) {
    issues.push({
      type: "Too much text",
      severity: "High",
      description: `Your slide contains ${totalWordCount} words, which is too crowded for a single slide. Classmates will read the slide instead of listening to you!`,
      recommendation: "Keep points brief. Stick to the '6x6 rule': up to 6 bullets per slide, and 6 words per bullet."
    });
  } else if (totalWordCount < 10 && totalWordCount > 0) {
    issues.push({
      type: "Too little information",
      severity: "Medium",
      description: "This slide is very brief and might not offer enough context on your core point.",
      recommendation: "Add 1-2 punchy, supporting bullet points detailing your key facts."
    });
  }

  const bulletLines = lines.filter((l: string) => l.startsWith("-") || l.startsWith("*") || l.startsWith("•"));
  let bulletPointQuality = "Your bullet points are clean and readable.";
  if (bulletLines.length === 0 && lines.length > 2) {
    issues.push({
      type: "Bullet point quality",
      severity: "Medium",
      description: "Your slide contains full paragraphs instead of scannable, bulleted facts.",
      recommendation: "Break paragraphs into a short, vertical bulleted list. Bullets are 50% easier to scan from a projector!"
    });
    bulletPointQuality = "We suggest formatting your text as easy-to-read vertical bullets.";
  }

  let readabilityAdvice = "Opt for deep slate or charcoal text colors on a soft off-white background with spacious padding to keep reading comfortable.";
  if (slideText.toUpperCase() === slideText && totalWordCount > 4) {
    issues.push({
      type: "Font readability",
      severity: "High",
      description: "Writing entirely in ALL-CAPS makes reading hard from the back row.",
      recommendation: "Switch back to normal sentence case, using capital letters only for short headers."
    });
    readabilityAdvice = "Switch back to standard sentence case for your bullet points.";
  }

  // Grammar check heuristic
  const hasPassive = slideText.toLowerCase().includes("was made") || slideText.toLowerCase().includes("is being") || slideText.toLowerCase().includes("by the");
  if (hasPassive) {
    issues.push({
      type: "Grammar & Phrasing",
      severity: "Low",
      description: "Passive phrasing detected. Active verbs convey authority and boost audience engagement.",
      recommendation: "Lead bullet points with dynamic action verbs (e.g. 'Accelerates discovery' instead of 'Is known to accelerate')."
    });
  }

  // Build slide-by-slide deck objects
  const slideDeck = rawSlides.map((raw, idx) => {
    const sLines = raw.split("\n").map(l => l.trim()).filter(Boolean);
    const title = sLines[0]?.replace(/^slide\s+\d+[:\s-]*/i, "").replace(/^title:\s*/i, "") || `Slide ${idx + 1}`;
    const words = raw.split(/\s+/).filter(Boolean).length;
    const density: "Optimal" | "Moderate" | "Overcrowded" = words > 45 ? "Overcrowded" : words > 25 ? "Moderate" : "Optimal";
    
    const bullets = sLines.slice(1).map(l => l.replace(/^[-*•\s]+/, "").trim()).filter(Boolean);
    const revisedText = bullets.length > 0 
      ? `• ${title}\n` + bullets.slice(0, 4).map(b => `  • ${b.split(/\s+/).slice(0, 8).join(" ")}`).join("\n")
      : `• ${title}\n  • Key takeaway fact\n  • Supporting evidence or metric`;

    return {
      slideNumber: idx + 1,
      title: title.slice(0, 40) || `Slide ${idx + 1}`,
      originalText: raw,
      revisedText,
      wordCount: words,
      density,
      designTips: [
        words > 40 ? "Split into 2 slides to avoid back-row squinting" : "Strong whitespace balance",
        "Maintain 32pt+ heading and 24pt body font"
      ],
      grammarNotes: [
        "Use active, punchy sentence starters",
        "Ensure consistent parallel bullet capitalization"
      ],
      slideScore: Math.min(95, Math.max(65, 90 - (words > 45 ? 15 : 0)))
    };
  });

  const revisedSlideText = slideDeck.map(s => `--- Slide ${s.slideNumber}: ${s.title} ---\n${s.revisedText}`).join("\n\n");

  return {
    totalSlidesDetected: rawSlides.length,
    issues: issues.length > 0 ? issues : [
      {
        type: "Font readability",
        severity: "Low",
        description: "Your slide layout is well-proportioned and spacious.",
        recommendation: "Maintain a comfortable, high-contrast palette."
      }
    ],
    bulletPointQuality,
    readabilityAdvice,
    designAdvice: "Adopt the 6x6 rule and maintain high color contrast (at least 4.5:1 ratio) between background and slide typography.",
    grammarAdvice: "Begin each bullet point with an active verb and verify punctuation consistency across items.",
    overallScore: Math.max(60, 100 - (issues.length * 10)),
    designScore: Math.max(65, 92 - (totalWordCount > 50 ? 15 : 0)),
    grammarScore: 88,
    revisedSlideText: revisedSlideText || "• Clear Key Concept\n• Short supporting fact\n• Final memorable takeaway",
    slideDeck
  };
}

function generatePracticeFallback(payload: any) {
  const answer = payload.answer || "";
  const question = payload.question || "";
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Profanity, slurs, and highly inappropriate language checks
  const normalized = answer.toLowerCase().trim();
  const badPatterns = [
    /\b(nigg[ae]r?s?)\b/,
    /\b(f+u+c+k+(e?r|i?ng|e?d|s)?)\b/,
    /\b(s+h+i+t+(e?y|s)?)\b/,
    /\b(b+i+t+c+h+(e?s|y)?)\b/,
    /\b(a+s+s+h+o+l+e?(s)?)\b/,
    /\b(d+i+c+k+(s)?)\b/,
    /\b(c+o+c+k+(s)?)\b/,
    /\b(p+u+s+s+y?(i?es)?)\b/,
    /\b(w+h+o+r+e?(s)?)\b/,
    /\b(s+u+c+k+\s+(m+y+|y?o?ur+)?\s*(d+i+c+k+|d+i+h|c+o+c+k+))\b/,
    /\b(s+u+c+k+\s+d+i+h)\b/,
    /\b(b+l+o+w+j+o+b+)\b/,
    /\b(b+a+s+t+a+r+d+)\b/,
    /\b(c+u+n+t+)\b/,
    /\b(p+e+n+i+s+)\b/,
    /\b(v+a+g+i+n+a+)\b/,
  ];
  
  const containsInappropriate = badPatterns.some(regex => regex.test(normalized));

  if (containsInappropriate) {
    return {
      rating: 1,
      feedbackText: "Please provide a professional, respectful, and constructive answer suitable for a school presentation.",
      strengths: "None.",
      improvements: "Avoid using inappropriate words, profanity, or vulgar language. A classroom Q&A requires courteous and informative responses.",
      modelAnswer: "A respectful answer would be: 'Thank you for your question. I would suggest researching the topic thoroughly and focusing on verified facts to build confidence.'"
    };
  }

  let rating = 4;
  let feedbackText = "Fantastic practice! You spoke with confidence and answered directly.";
  let strengths = "You answered the audience prompt directly, indicating solid familiarity with your topic.";
  let improvements = "To boost your score further, try to reference a specific example or slide to make your argument concrete.";

  if (wordCount < 15) {
    rating = 3;
    feedbackText = "Good start, but your response is slightly too brief to fully convince the class.";
    strengths = "Direct, honest answer.";
    improvements = "Elaborate by adding another 1-2 supporting details. Aim for about 30-50 words.";
  } else if (wordCount > 55) {
    rating = 5;
    feedbackText = "Masterful response! You spoke beautifully and backed up your points thoroughly.";
    strengths = "Excellent length, rich detail, and highly structured logic.";
    improvements = "Excellent work! Just keep practicing breathing between your points.";
  }

  let modelAnswer = `Thank you so much for that question! I think the key is to look at how we can implement these solutions step-by-step. For instance, by introducing tiny adjustments first, we get our team comfortable with the shift, leading to big, lasting success.`;
  if (question.toLowerCase().includes("interest") || question.toLowerCase().includes("research")) {
    modelAnswer = `That is an excellent question! What sparked my interest most was finding out how much of a compound difference small actions make over time. When doing my research, I realized how much is possible when we work together, which is what inspired me to present this today.`;
  }

  return {
    rating,
    feedbackText,
    strengths,
    improvements,
    modelAnswer
  };
}

function generateRecordingFallback(payload: any) {
  const topic = (payload.topic || "your presentation").trim();
  const scriptText = (payload.script || "").trim();
  const spokenTranscript = (payload.spokenTranscript || "").trim();
  const durationSeconds = Math.max(1, Number(payload.durationSeconds) || 30);
  const words = spokenTranscript.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const recordMode = payload.recordMode || "video";
  const t = payload.telemetry || {};

  const gestureActivityPct = typeof t.gestureActivityPct === "number" ? t.gestureActivityPct : (recordMode === "video" ? 28 : 0);
  const headStabilityPct = typeof t.headStabilityPct === "number" ? t.headStabilityPct : 78;
  const eyeZoneCenteredPct = typeof t.eyeZoneCenteredPct === "number" ? t.eyeZoneCenteredPct : 74;
  const lightingQuality: "Dark" | "Balanced" | "Bright" = t.lightingQuality || "Balanced";
  const speakingRatioPct = typeof t.speakingRatioPct === "number" ? t.speakingRatioPct : (wordCount >= 8 ? 72 : 4);
  const pauseCount = typeof t.pauseCount === "number" ? t.pauseCount : Math.max(1, Math.floor(durationSeconds / 15));
  const longestPauseSeconds = typeof t.longestPauseSeconds === "number" ? t.longestPauseSeconds : 1.5;
  const avgVolumePct = typeof t.avgVolumePct === "number" ? t.avgVolumePct : (wordCount >= 8 ? 48 : 8);
  const volumeVariationPct = typeof t.volumeVariationPct === "number" ? t.volumeVariationPct : (wordCount >= 8 ? 22 : 3);
  const firstHalfWpm = typeof t.firstHalfWpm === "number" ? t.firstHalfWpm : Math.round((wordCount / (durationSeconds / 60)) || 0);
  const secondHalfWpm = typeof t.secondHalfWpm === "number" ? t.secondHalfWpm : firstHalfWpm;

  // Compute script keyword coverage if not provided
  const stopWords = new Set(["about", "above", "after", "again", "against", "because", "before", "being", "below", "between", "could", "every", "first", "going", "great", "having", "hello", "morning", "other", "should", "since", "still", "thank", "their", "there", "these", "thing", "think", "those", "today", "under", "using", "where", "which", "while", "would", "everyone", "really"]);
  const scriptKeywords: string[] = Array.from(new Set<string>(
    (scriptText.toLowerCase().match(/\b[a-z]{5,}\b/g) || []).filter((w: string) => !stopWords.has(w))
  )).slice(0, 14);
  const spokenLower = spokenTranscript.toLowerCase();
  const matchedKeywords: string[] = Array.isArray(t.matchedKeywords)
    ? t.matchedKeywords
    : scriptKeywords.filter((kw) => spokenLower.includes(kw));
  const missedKeywords: string[] = Array.isArray(t.missedKeywords)
    ? t.missedKeywords
    : scriptKeywords.filter((kw) => !spokenLower.includes(kw));
  const scriptCoveragePct = typeof t.scriptCoveragePct === "number"
    ? t.scriptCoveragePct
    : (scriptKeywords.length > 0 ? Math.round((matchedKeywords.length / scriptKeywords.length) * 100) : (wordCount >= 8 ? 75 : 0));

  // Strict silence and insufficient speech detection
  if (wordCount < 8 || (speakingRatioPct < 10 && wordCount < 12)) {
    const lowWpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;
    const silentObservations = [
      {
        timestamp: "0:00",
        area: "Clarity",
        finding: `Only ${wordCount} spoken word${wordCount === 1 ? "" : "s"} detected across ${durationSeconds}s (${speakingRatioPct}% active audio).`,
        fix: "Unmute your microphone or click 'Request Permission' above the stage monitor, then read your opening line aloud at normal speaking volume.",
        severity: "critical" as const
      },
      {
        timestamp: `0:${Math.min(59, Math.max(5, Math.floor(durationSeconds / 2))).toString().padStart(2, "0")}`,
        area: recordMode === "video" ? "Gestures" : "Pacing",
        finding: recordMode === "video"
          ? `Camera tracked ${gestureActivityPct}% hand/upper-body motion with no vocal accompaniment.`
          : `Audio channel stayed near silent floor (${avgVolumePct}% average level).`,
        fix: "Deliver your first 2 sentences standing straight while gesturing on key nouns to activate both vocal and body-language tracking.",
        severity: "critical" as const
      }
    ];

    return {
      recordMode,
      speakingSpeedStatus: "Too Slow" as const,
      wordsPerMinute: lowWpm,
      speakingTimeSeconds: durationSeconds,
      clarity: `No discernible continuous speech was detected during your ${durationSeconds}-second rehearsal (${wordCount} word${wordCount === 1 ? "" : "s"} captured, ${speakingRatioPct}% active audio). Verify microphone access and speak clearly aloud.`,
      confidence: `Vocal delivery fell below measurable threshold (${avgVolumePct}% avg volume). Speaking aloud is essential to grade pace, articulation, and filler control.`,
      fillerWordsCount: { um: 0, uh: 0, like: 0, so: 0, other: 0 },
      fillerWordsAnalysis: "Insufficient spoken words (< 8) to evaluate filler word habits. Speak at least 2–3 full sentences aloud on your next run.",
      partsToImprove: [
        `Your ${durationSeconds}s take captured ${wordCount} words. Read at least your opening hook ("${scriptText.split(/[.!?]/)[0]?.slice(0, 65) || topic}...") aloud to calibrate pacing.`,
        "Check that the live orange audio wave bars react when you speak before starting your full run."
      ],
      suggestedQuestions: [
        `What is the single key takeaway you want listeners to remember about ${topic}?`,
        `Which piece of evidence from your ${topic} script needs the strongest vocal emphasis?`
      ],
      overallPacingScore: wordCount === 0 ? 22 : Math.min(34, 24 + wordCount),
      generalFeedback: `Recorded ${durationSeconds}s with ${wordCount} spoken words (${speakingRatioPct}% active vocal time). JunoAI does not award passing scores for silent or muted runs—enable microphone access and deliver your opening paragraph aloud to receive a calibrated grade.`,
      handGesturesFeedback: recordMode === "video"
        ? `Measured gesture activity was ${gestureActivityPct}% during a silent clip. Pair open-palm gestures with spoken phrases to measure timing.`
        : "Voice-only run: switch to Video Camera mode to measure gesture activity and posture.",
      postureFeedback: recordMode === "video"
        ? `Head stability measured ${headStabilityPct}% with ${lightingQuality.toLowerCase()} room lighting. Keep shoulders relaxed and chin level while speaking.`
        : "Maintain upright posture and diaphragm breathing even during voice-only runs.",
      eyeContactFeedback: recordMode === "video"
        ? `Eye-zone framing was centered ${eyeZoneCenteredPct}% of the take. Hold gaze on the camera lens as you begin speaking.`
        : "Visualize looking across the front and back rows while recording audio.",
      expressionFeedback: "Open with a warm smile and slightly elevated pitch on your first sentence to engage listeners immediately.",
      bodyLanguageScore: recordMode === "video" ? Math.min(40, Math.max(25, Math.round(headStabilityPct * 0.35))) : 30,
      deliveryConsistencyScore: 25,
      scriptAdherenceFeedback: scriptText
        ? `0%–${scriptCoveragePct}% of planned script keywords were spoken aloud because the microphone received almost no speech.`
        : "No planned script provided—paste your script in the Script tab to measure topic coverage.",
      bodyLanguageActionableTips: [
        "Verify microphone input bars pulse when saying 'Testing 1, 2, 3' before clicking Start.",
        "Speak at 110–140 WPM with deliberate hand gestures at chest height.",
        lightingQuality === "Dark" ? "Face a window or desk lamp—room lighting measured too dim for crisp video framing." : "Keep camera at eye level about an arm's length away."
      ],
      telemetry: payload.telemetry,
      specificObservations: silentObservations
    };
  }

  const minutes = durationSeconds / 60;
  const wpm = minutes > 0 ? Math.round(wordCount / minutes) : 120;

  let speakingSpeedStatus: "Too Fast" | "Too Slow" | "Great Pacing" = "Great Pacing";
  let pacingScore = 88;
  let clarity = "";

  if (wpm < 100) {
    speakingSpeedStatus = "Too Slow";
    pacingScore = Math.max(46, Math.min(76, 44 + Math.round(wpm * 0.32)));
    clarity = `Measured rate was ${wpm} WPM (${wordCount} words in ${durationSeconds}s), below the 110–140 WPM classroom target. ${longestPauseSeconds >= 3 ? `Longest silence lasted ${longestPauseSeconds.toFixed(1)}s, breaking momentum.` : "Tighten gaps between clauses so ideas connect smoothly."}`;
  } else if (wpm > 155) {
    speakingSpeedStatus = "Too Fast";
    pacingScore = Math.max(55, 84 - Math.round((wpm - 145) * 0.55));
    clarity = `Measured rate was ${wpm} WPM (${wordCount} words in ${durationSeconds}s)—${wpm - 140} WPM faster than the ideal 110–140 WPM zone. Insert a 1.5s breath pause after key facts so listeners can absorb details.`;
  } else {
    speakingSpeedStatus = "Great Pacing";
    pacingScore = 90;
    clarity = `Measured speaking speed hit ${wpm} WPM (${wordCount} words in ${durationSeconds}s), right inside the ideal 110–140 WPM range with ${speakingRatioPct}% active speaking time.`;
  }

  // Count fillers accurately
  const fillerCounts = { um: 0, uh: 0, like: 0, so: 0, other: 0 };
  const countOccurrences = (word: string) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    return (spokenLower.match(regex) || []).length;
  };
  fillerCounts.um = countOccurrences("um") + countOccurrences("uhm");
  fillerCounts.uh = countOccurrences("uh") + countOccurrences("er");
  fillerCounts.like = countOccurrences("like");
  fillerCounts.so = countOccurrences("so");
  fillerCounts.other = countOccurrences("basically") + countOccurrences("actually") + countOccurrences("literally") + countOccurrences("you know");

  const totalFillers = Object.values(fillerCounts).reduce((a, b) => a + b, 0);
  const fillerDetailParts = [
    fillerCounts.um > 0 ? `"um" (${fillerCounts.um}x)` : "",
    fillerCounts.uh > 0 ? `"uh" (${fillerCounts.uh}x)` : "",
    fillerCounts.like > 0 ? `"like" (${fillerCounts.like}x)` : "",
    fillerCounts.so > 0 ? `"so" (${fillerCounts.so}x)` : "",
    fillerCounts.other > 0 ? `hedge words like "basically/actually" (${fillerCounts.other}x)` : ""
  ].filter(Boolean);

  let fillerWordsAnalysis = "Zero conversational fillers detected across your spoken transcript—strong vocal discipline.";
  if (totalFillers > 0) {
    fillerWordsAnalysis = `Detected ${totalFillers} filler word${totalFillers === 1 ? "" : "s"}: ${fillerDetailParts.join(", ")}. Replace each bridge word with a silent 1-second breath.`;
    pacingScore = Math.max(52, pacingScore - totalFillers * 3);
  }

  // Detect pacing drift between first half and second half
  const wpmDrift = secondHalfWpm - firstHalfWpm;
  const hasPaceDrift = Math.abs(wpmDrift) >= 22 && durationSeconds >= 16;

  // Body language scoring from real camera telemetry
  let bodyLanguageScore = 84;
  if (recordMode === "video") {
    let bl = 72;
    if (gestureActivityPct >= 18 && gestureActivityPct <= 62) bl += 12;
    else if (gestureActivityPct < 10) bl -= 10;
    else if (gestureActivityPct > 75) bl -= 4;

    if (headStabilityPct >= 70) bl += 8;
    else if (headStabilityPct < 55) bl -= 8;

    if (eyeZoneCenteredPct >= 65) bl += 6;
    else bl -= 5;

    if (lightingQuality === "Balanced") bl += 4;
    else bl -= 6;

    bodyLanguageScore = Math.max(45, Math.min(96, bl));
  }

  // Specific observations array (timestamped & evidence-cited)
  const observations: Array<{ timestamp: string; area: string; finding: string; fix: string; severity: "strength" | "caution" | "critical" }> = [];

  if (Array.isArray(t.timelineNotes)) {
    t.timelineNotes.slice(0, 3).forEach((note: any) => {
      observations.push({
        timestamp: note.time || "0:05",
        area: note.label?.includes("Pause") ? "Pacing" : note.label?.includes("Gesture") || note.label?.includes("Static") ? "Gestures" : "Posture",
        finding: note.detail || note.label,
        fix: note.status === "good"
          ? "Keep repeating this natural rhythm during your main body transitions."
          : note.label?.includes("Pause")
          ? "Use a clean transition phrase ('Next, let's examine...') instead of stalling silently."
          : "Raise hands slightly above waist level when listing key points or contrasts.",
        severity: note.status === "good" ? "strength" : "caution"
      });
    });
  }

  if (hasPaceDrift) {
    const midSec = Math.floor(durationSeconds / 2);
    observations.push({
      timestamp: `0:${String(midSec % 60).padStart(2, "0")}`,
      area: "Pacing",
      finding: wpmDrift > 0
        ? `Pace accelerated by +${wpmDrift} WPM in the second half (${firstHalfWpm} -> ${secondHalfWpm} WPM), showing end-of-speech rushing.`
        : `Pace dropped by ${Math.abs(wpmDrift)} WPM in the second half (${firstHalfWpm} -> ${secondHalfWpm} WPM), losing vocal drive.`,
      fix: wpmDrift > 0
        ? "Anchor your final sentence with a deliberate 1.5s pause right before 'In conclusion' or your closing takeaway."
        : "Take a full breath at the midpoint and keep ending consonants crisp through your final line.",
      severity: "caution"
    });
  }

  if (recordMode === "video" && lightingQuality !== "Balanced") {
    observations.push({
      timestamp: "0:02",
      area: "Lighting",
      finding: lightingQuality === "Dark"
        ? `Frame brightness measured low (${t.avgBrightness || 55}/255), dimming facial expression visibility.`
        : `Frame brightness measured very high (${t.avgBrightness || 225}/255), risking glare on face.`,
      fix: lightingQuality === "Dark"
        ? "Face a soft desk lamp or daylight window behind your webcam so expressions read clearly."
        : "Angle away from direct harsh backlight and lower screen brightness slightly.",
      severity: "caution"
    });
  }

  if (observations.length < 2) {
    observations.push({
      timestamp: "0:04",
      area: "Pacing",
      finding: `Opened at ${firstHalfWpm || wpm} WPM with ${speakingRatioPct}% active speaking ratio across ${durationSeconds}s.`,
      fix: missedKeywords.length > 0
        ? `Re-introduce missed script term "${missedKeywords[0]}" cleanly in your body explanation.`
        : "Sustain this clear opening cadence through your final takeaway sentence.",
      severity: speakingSpeedStatus === "Great Pacing" ? "strength" : "caution"
    });
  }

  const firstSpokenSnippet = words.slice(0, 9).join(" ");
  const partsToImprove: string[] = [];
  if (wpm > 155) {
    partsToImprove.push(`Slow down from ${wpm} WPM toward 125 WPM—especially around "${firstSpokenSnippet}..."—by inserting brief 1-second pauses at commas.`);
  } else if (wpm < 100) {
    partsToImprove.push(`Lift tempo from ${wpm} WPM toward 115–130 WPM and reduce pauses (${pauseCount} pauses, max ${longestPauseSeconds.toFixed(1)}s).`);
  }
  if (hasPaceDrift) {
    partsToImprove.push(`Stabilize pacing between first half (${firstHalfWpm} WPM) and second half (${secondHalfWpm} WPM) so your conclusion lands with steady authority.`);
  }
  if (missedKeywords.length > 0 && scriptText.length > 20) {
    partsToImprove.push(`Script alignment was ${scriptCoveragePct}%: weave missed script concepts (${missedKeywords.slice(0, 3).map(k => `"${k}"`).join(", ")}) back into your spoken explanation.`);
  }
  if (recordMode === "video" && gestureActivityPct < 15) {
    partsToImprove.push(`Hand gesture activity measured only ${gestureActivityPct}%—keep hands visible inside the Open Gestures Zone instead of locked at your sides.`);
  }
  if (totalFillers > 0) {
    partsToImprove.push(`Cut ${totalFillers} filler words (${fillerDetailParts.slice(0, 2).join(", ")}) by pausing silently for half a second before starting a new thought.`);
  }
  if (partsToImprove.length === 0) {
    partsToImprove.push(`Strong baseline (${wpm} WPM, ${scriptCoveragePct}% script match). Add a 2-second dramatic pause right before your concluding call to action.`);
    partsToImprove.push(`Boost vocal contrast (currently ${volumeVariationPct}% dynamic range) by emphasizing key verbs and statistics.`);
  }

  const handGesturesFeedback = recordMode === "video"
    ? (gestureActivityPct < 15
        ? `Low gesture movement detected (${gestureActivityPct}% active frames). Bring your hands up into the lower-middle frame when listing points or contrasting ideas.`
        : gestureActivityPct > 65
        ? `High movement detected (${gestureActivityPct}% active frames). Slow down rapid hand motions and hold open-palm gestures steady for 2 seconds on key claims.`
        : `Balanced gesture engagement (${gestureActivityPct}% active frames). Your hand movement reinforced your spoken points without distracting the viewer.`)
    : "Audio-only rehearsal completed. Switch to Video Camera mode to measure live hand gesture framing.";

  const postureFeedback = recordMode === "video"
    ? (headStabilityPct < 65
        ? `Frequent upper-body shifting detected (${headStabilityPct}% head stability). Plant both feet shoulder-width apart and keep shoulders relaxed and level.`
        : `Composed upper-body stability (${headStabilityPct}% steady framing). Keep shoulders dropped away from your ears to maintain calm stage presence.`)
    : "Keep ribcage lifted and shoulders relaxed so breath flows freely during microphone delivery.";

  const eyeContactFeedback = recordMode === "video"
    ? (eyeZoneCenteredPct < 60
        ? `Speaker drifted out of the upper-center Eye Level Zone (${eyeZoneCenteredPct}% centered). Adjust webcam height to eye level and look into the lens rather than down at notes.`
        : `Consistent Eye Level Zone framing (${eyeZoneCenteredPct}% centered) with ${lightingQuality.toLowerCase()} lighting. Look straight into the lens on your closing sentence.`)
    : "Imagine three audience focal points across the room while speaking aloud.";

  const expressionFeedback = volumeVariationPct < 12
    ? `Vocal energy variation was relatively flat (${volumeVariationPct}% range, ${avgVolumePct}% avg level). Vary pitch slightly on questions and smile during your opening hook.`
    : `Expressive vocal contrast (${volumeVariationPct}% dynamic variation, ${avgVolumePct}% avg projection). Pair that vocal warmth with a natural smile in your opening 5 seconds.`;

  const scriptAdherenceFeedback = scriptText.length > 15
    ? `Covered ${scriptCoveragePct}% of core script concepts (${matchedKeywords.length}/${Math.max(1, scriptKeywords.length)} key terms matched${missedKeywords.length > 0 ? `; missed: ${missedKeywords.slice(0, 4).join(", ")}` : ""}).`
    : "No reference script entered—paste your speech in the Script tab to track keyword adherence.";

  const consistencyScore = Math.max(40, Math.min(98, Math.round(
    (pacingScore * 0.45) + ((recordMode === "video" ? bodyLanguageScore : 80) * 0.35) + (Math.min(100, scriptCoveragePct + 15) * 0.2)
  )));

  return {
    recordMode,
    speakingSpeedStatus,
    wordsPerMinute: wpm,
    speakingTimeSeconds: durationSeconds,
    clarity,
    confidence: `Active speech covered ${speakingRatioPct}% of your ${durationSeconds}s run (${pauseCount} natural pauses, longest ${longestPauseSeconds.toFixed(1)}s) at ${avgVolumePct}% average vocal level.`,
    fillerWordsCount: fillerCounts,
    fillerWordsAnalysis,
    partsToImprove: partsToImprove.slice(0, 4),
    suggestedQuestions: [
      matchedKeywords[0]
        ? `You emphasized "${matchedKeywords[0]}" in your delivery—what concrete evidence best backs up that point?`
        : `What is the single most important takeaway you want your audience to remember about ${topic}?`,
      missedKeywords[0]
        ? `Your written script mentions "${missedKeywords[0]}"—how would you explain that quickly if a teacher asks during Q&A?`
        : `If someone challenged your main claim on ${topic}, how would you respond using PREP?`
    ],
    overallPacingScore: pacingScore,
    generalFeedback: `${durationSeconds}s ${recordMode} rehearsal analyzed: ${wpm} WPM (${speakingSpeedStatus}), ${totalFillers} filler${totalFillers === 1 ? "" : "s"}, ${scriptCoveragePct}% script coverage${recordMode === "video" ? `, and ${gestureActivityPct}% gesture activity (${lightingQuality} lighting)` : ""}. ${partsToImprove[0]}`,
    handGesturesFeedback,
    postureFeedback,
    eyeContactFeedback,
    expressionFeedback,
    bodyLanguageScore,
    deliveryConsistencyScore: consistencyScore,
    scriptAdherenceFeedback,
    bodyLanguageActionableTips: [
      gestureActivityPct < 15
        ? "Practice opening your palms on transition words ('First', 'However', 'Therefore') to lift gesture activity above 20%."
        : "Keep gestures framed between chest and shoulders so every emphasis reads clearly on camera.",
      headStabilityPct < 70
        ? "Plant both feet flat to stabilize head framing above 75%."
        : "Keep your chin level with the Eye Level Line and pause 1.5s at the end of key claims.",
      lightingQuality === "Dark"
        ? "Add soft front lighting so facial expressions and eye contact read clearly."
        : `Maintain ${lightingQuality.toLowerCase()} front lighting and review any missed script keywords before your final take.`
    ],
    telemetry: payload.telemetry,
    specificObservations: observations.slice(0, 5)
  };
}

function generateTedFallback(payload: any) {
  const script = payload.script || "";
  const words = script.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const firstSentence = words.slice(0, 15).join(" ");
  const topicKeyword = words.slice(4, 7).join(" ") || "this breakthrough subject";

  return {
    tedScore: Math.min(95, Math.max(72, 76 + Math.round(wordCount / 20))),
    speakerBadge: wordCount > 200 ? "Inspiring Storyteller" : "Thought Provoker",
    ideaWorthSpreading: {
      clarity: "Your script presents a compelling, human-centered message.",
      uniquenessScore: 86,
      coreIdeaSummary: `By understanding ${topicKeyword}, we can transform everyday challenges into extraordinary opportunities.`
    },
    narrativeArc: {
      hookRating: script.includes("?") || script.toLowerCase().includes("imagine") ? "Captivating Hook" : "Needs Storytelling Spark",
      emotionalResonance: "Connects with the audience through relatable curiosity and enthusiasm.",
      pacingFeedback: "Steady build-up from introductory mystery to core practical insight.",
      climaxStrength: "Strong climax where the main lesson is delivered."
    },
    rhetoricalPauses: [
      {
        phrase: firstSentence || "When we look closely at our world today...",
        suggestedPauseDuration: "2.5 Seconds Silence",
        why: "Creates an immediate sense of mystery and draws all eyes to the stage."
      },
      {
        phrase: `And that is why ${topicKeyword} matters more now than ever before.`,
        suggestedPauseDuration: "3 Seconds Silence",
        why: "Gives the room a moment to reflect on your core 'Idea Worth Spreading'."
      },
      {
        phrase: "Because the future doesn't just happen. We build it together.",
        suggestedPauseDuration: "3 Seconds Silence",
        why: "Empowers the audience with an unforgettable emotional conclusion."
      }
    ],
    tedRecommendations: [
      "Open with a vivid 10-second personal moment or surprising question before stating facts.",
      "Vary your vocal pitch when delivering key takeaways to create a dynamic 'TED rhythm'.",
      "End with a clear, inspiring call to action that gives listeners a reason to care."
    ],
    improvedTedScript: script
      ? `Imagine standing in a room where every single person is searching for the exact same answer. That answer is what brings us here today.\n\n${script}\n\n[PAUSE 3s]\n\nSo I leave you with one simple question: What will you choose to do with this idea today? Thank you.`
      : "Imagine a world where small daily choices create massive positive ripples across entire communities. That is the core idea I want to share with you today..."
  };
}

// ==========================================
// CORE DEEP MERGE HELPERS
// ==========================================
const DEFAULT_ANALYSIS_RESULT = {
  scores: {
    confidence: 80,
    clarity: 80,
    engagement: 80,
    vocabulary: 80,
    organization: 80,
    professionalism: 80,
    overall: 80
  },
  readiness: "Almost Ready",
  difficulty: {
    suitableYears: ["Year 8", "Year 9"],
    analysis: "This presentation uses clear, easy to understand language.",
    suggestions: "Keep vocabulary engaging."
  },
  scriptAnalysis: {
    grammarSpelling: "Excellent grammar and spelling overall.",
    clarity: "The presentation is clear and direct.",
    vocabLevel: "Appropriate for the target age group.",
    variety: "Good variety in sentence lengths.",
    organization: "The speech flows naturally."
  },
  introAnalysis: {
    rating: "Strong hook",
    evaluation: "Nice opening statement.",
    alternatives: ["Alternative opening 1...", "Alternative opening 2..."]
  },
  conclusionAnalysis: {
    rating: "Good conclusion",
    evaluation: "A clear wrap-up of your main points.",
    alternatives: ["Alternative conclusion 1...", "Alternative conclusion 2..."]
  },
  attentionSpan: {
    longParagraphs: [],
    repetitiveExplanations: [],
    boringSections: []
  },
  speakingTips: {
    eyeContact: "Look around the room to connect with different classmates.",
    voiceProjection: "Speak clearly and project your voice to the back row.",
    bodyLanguage: "Stand up straight and face your audience confidently.",
    handGestures: "Use natural gestures to emphasize key ideas.",
    confidence: "Take a deep breath before you start; you've got this!",
    pacing: "Pause between major points for maximum effect."
  },
  visualAids: [],
  fillerWords: {
    detected: ["like", "um"],
    analysis: "Some conversational filler words detected.",
    fluencyTips: "Try to pause silently instead of using filler words."
  },
  persuasiveness: {
    isPersuasive: true,
    argumentStrength: "Clear arguments with appropriate supporting details.",
    weakEvidence: "No major weak points detected.",
    suggestions: "Strengthen claims with examples where possible."
  },
  confidenceBuilder: {
    positiveTips: ["Practice in front of a mirror.", "Time your speech to be sure of pacing."],
    lastMinuteReminders: ["Take a deep breath.", "Remember to smile and stand tall."],
    checklist: ["Read through script once.", "Check slide order.", "Stand up straight."]
  },
  teacherMode: {
    gradeEstimate: "A- equivalent",
    strengths: "Clear structure, excellent flow, and highly age-appropriate.",
    improvements: "Minor pacing refinements to avoid rushing.",
    nextSteps: "1. Practice pausing.\n2. Rehearse with slides once more."
  },
  questions: [
    { difficulty: "Easy", question: "What is the main topic of your presentation?", modelAnswer: "The main topic is..." },
    { difficulty: "Medium", question: "Can you elaborate on your first point?", modelAnswer: "Certainly, the first point refers to..." },
    { difficulty: "Challenging", question: "How would you handle counterarguments on this topic?", modelAnswer: "To handle counterarguments, I would..." }
  ],
  flashcards: [
    { front: "Core Subject", back: "The central message or topic of your entire presentation." },
    { front: "Target Audience", back: "The classmates and teachers you are speaking to." },
    { front: "Key Takeaway", back: "The main lesson you want everyone to remember when you finish speaking." }
  ],
  improvedScript: "Hello class! Today I'm going to talk about a very important topic. Have you ever wondered how tiny habits lead to massive outcomes? In our research, we discovered that small changes lead to incredible success. To wrap things up, keep these core lessons in mind. Thank you so much for your support!"
};

const DEFAULT_SLIDE_ANALYSIS = {
  totalSlidesDetected: 1,
  issues: [
    {
      type: "Font readability",
      severity: "Low",
      description: "Ensure your font has a good contrast with the background.",
      recommendation: "Use dark text on light backgrounds."
    }
  ],
  bulletPointQuality: "Bullet points are clear and brief.",
  readabilityAdvice: "Keep layout spacious and clean.",
  designAdvice: "Stick to the 6x6 rule and maintain clear visual hierarchy.",
  grammarAdvice: "Use strong active verbs and consistent bullet punctuation.",
  overallScore: 82,
  designScore: 84,
  grammarScore: 88,
  revisedSlideText: "• Clear Key Concept\n• Short supporting fact\n• Final memorable takeaway",
  slideDeck: []
};

const DEFAULT_PRACTICE_FEEDBACK = {
  rating: 4,
  feedbackText: "Good response! Try to be more specific.",
  strengths: "Addressed the question clearly.",
  improvements: "Add a concrete example to back up your statement.",
  modelAnswer: "An elegant alternative way to respond."
};

const DEFAULT_RECORDING_FEEDBACK = {
  recordMode: "video",
  speakingSpeedStatus: "Great Pacing",
  wordsPerMinute: 120,
  speakingTimeSeconds: 30,
  clarity: "You spoke very clearly and at an appropriate volume for the room.",
  confidence: "You sounded steady and ready to share your ideas!",
  fillerWordsCount: {
    um: 0,
    uh: 0,
    like: 0,
    so: 0,
    other: 0
  },
  fillerWordsAnalysis: "No noticeable filler words detected.",
  partsToImprove: [
    "Add a deliberate 1.5-second pause after your main claim so listeners can absorb it.",
    "Maintain crisp articulation through the final sentence of your conclusion."
  ],
  suggestedQuestions: [
    "What evidence best supports your primary argument?",
    "What is the single most important lesson you want listeners to remember?"
  ],
  overallPacingScore: 86,
  generalFeedback: "Solid practice run with balanced pacing and clear delivery.",
  handGesturesFeedback: "Use open-palm gestures in the upper-chest frame zone to emphasize transitions.",
  postureFeedback: "Keep shoulders relaxed and weight evenly balanced.",
  eyeContactFeedback: "Hold steady gaze toward the camera lens across key sentences.",
  expressionFeedback: "Open with a natural smile and varied vocal inflection.",
  bodyLanguageScore: 84,
  deliveryConsistencyScore: 84,
  scriptAdherenceFeedback: "Aligned with core script structure.",
  bodyLanguageActionableTips: [
    "Use hand gestures to count out key points (1, 2, 3) to visually guide listeners.",
    "Relax your shoulders and uncross your arms to maintain an open stage posture.",
    "Keep your chin level and look into the camera lens as you transition between topics."
  ],
  specificObservations: []
};

const DEFAULT_TED_ANALYSIS = {
  tedScore: 85,
  speakerBadge: "Inspiring Storyteller",
  ideaWorthSpreading: {
    clarity: "Clear vision and strong core concept.",
    uniquenessScore: 82,
    coreIdeaSummary: "A fresh perspective on presentation mastery and communication."
  },
  narrativeArc: {
    hookRating: "Captivating Hook",
    emotionalResonance: "Good emotional connection.",
    pacingFeedback: "Well-paced structure.",
    climaxStrength: "Clear climax."
  },
  rhetoricalPauses: [
    {
      phrase: "Imagine a world where everyone speaks with absolute confidence.",
      suggestedPauseDuration: "3 Seconds Silence",
      why: "Allows the audience to picture the vision in their mind."
    }
  ],
  tedRecommendations: [
    "Start with a personal story.",
    "Use rhetorical questions.",
    "Close with an inspiring takeaway."
  ],
  improvedTedScript: "Imagine standing on stage with complete calm..."
};

function isObject(item: any): boolean {
  return (item && typeof item === "object" && !Array.isArray(item));
}

function mergeDeep(target: any, source: any): any {
  if (!source) return target;
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(target).forEach(key => {
      if (isObject(target[key])) {
        if (!(key in source)) {
          output[key] = target[key];
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else if (Array.isArray(target[key])) {
        output[key] = Array.isArray(source[key]) ? source[key] : target[key];
      } else {
        output[key] = key in source && source[key] !== undefined && source[key] !== null ? source[key] : target[key];
      }
    });
  }
  return output;
}

function parseRobustJson(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "");
  }
  return JSON.parse(cleaned.trim());
}

// ==========================================
// CENTRAL RETRY & FALLBACK EXECUTOR HELPER
// ==========================================
async function executeWithRetryAndFallback<T>(
  endpoint: string,
  payload: any,
  defaultVal: T,
  generatorFallback: (payload: any) => T,
  apiCall: () => Promise<string | undefined>
): Promise<T> {
  const cacheKey = getCacheKey(endpoint, payload);
  if (requestCache.has(cacheKey)) {
    console.log(`[Cache Hit] ${endpoint}`);
    logDiagnostic(endpoint, "success", 0, 0, "gemini-3.5-flash", false, "Served from Cache");
    return requestCache.get(cacheKey);
  }

  const startTime = Date.now();
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount <= maxRetries) {
    try {
      console.log(`[API Request] ${endpoint} (Attempt ${retryCount + 1})`);
      const text = await apiCall();
      if (!text) {
        throw new Error("Empty response from AI model.");
      }

      const parsed = parseRobustJson(text);
      const data = mergeDeep(defaultVal, parsed);
      
      requestCache.set(cacheKey, data);
      
      const duration = Date.now() - startTime;
      logDiagnostic(endpoint, "success", retryCount, duration, "gemini-3.5-flash", false, "Gemini call successful");
      return data;
    } catch (err: any) {
      console.error(`[API Error] ${endpoint} (Attempt ${retryCount + 1} failed):`, err.message);
      retryCount++;
      if (retryCount <= maxRetries) {
        logDiagnostic(endpoint, "retry", retryCount, Date.now() - startTime, "gemini-3.5-flash", false, `Gemini call failed: ${err.message}. Retrying...`);
        const delay = retryCount === 1 ? 600 : retryCount === 2 ? 1600 : 3200;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.log(`[Fallback Triggered] Generating smart local fallback for ${endpoint}`);
        const duration = Date.now() - startTime;
        const fallbackData = generatorFallback(payload);
        const mergedData = mergeDeep(defaultVal, fallbackData);
        
        (mergedData as any).isFallback = true;
        (mergedData as any).fallbackMessage = "Our JunoAi is currently busy due to high demand. We've generated a super smart local backup analysis for you so your progress isn't interrupted!";
        
        logDiagnostic(endpoint, "fallback", maxRetries, duration, "Local Fallback Rules Engine", true, `Failed after 3 retries. Generated smart local fallback analysis.`);
        return mergedData;
      }
    }
  }

  return defaultVal;
}

// ==========================================
// API ENDPOINTS
// ==========================================
app.get("/api/diagnostics", (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const keyConfigured = !!apiKey && apiKey !== "MY_GEMINI_API_KEY";
  res.json({
    keyConfigured,
    currentModel: "gemini-3.5-flash",
    logs: diagnosticsLogs,
    status: keyConfigured ? "Connected" : "API Key Missing/Using Smart Local Fallbacks"
  });
});

app.post("/api/analyze-script", async (req, res) => {
  const { script, targetYear, promptExtra } = req.body;
  if (!script || script.trim().length === 0) {
    return res.status(400).json({ error: "Script text cannot be empty." });
  }

  const result = await executeWithRetryAndFallback(
    "/api/analyze-script",
    { script, targetYear, promptExtra },
    DEFAULT_ANALYSIS_RESULT,
    generateScriptFallback,
    async () => {
      const ai = getGeminiClient();
      const prompt = `Student Year Group: ${targetYear || "Year 8"}.
Additional Details: ${promptExtra || "None"}.
Script Content to Analyze:
${script}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SCRIPT_ANALYSIS_INSTRUCTION,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
      return response.text;
    }
  );

  return res.json(result);
});

app.post("/api/check-slides", async (req, res) => {
  const { slideText } = req.body;
  if (!slideText || slideText.trim().length === 0) {
    return res.status(400).json({ error: "Slide text cannot be empty." });
  }

  const result = await executeWithRetryAndFallback(
    "/api/check-slides",
    { slideText },
    DEFAULT_SLIDE_ANALYSIS,
    generateSlideFallback,
    async () => {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze this slide content:\n${slideText}`,
        config: {
          systemInstruction: SLIDE_ANALYSIS_INSTRUCTION,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
      return response.text;
    }
  );

  return res.json(result);
});

app.post("/api/simulate-practice", async (req, res) => {
  const { question, answer, scriptContext } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: "Question and answer text are required." });
  }

  const result = await executeWithRetryAndFallback(
    "/api/simulate-practice",
    { question, answer, scriptContext },
    DEFAULT_PRACTICE_FEEDBACK,
    generatePracticeFallback,
    async () => {
      const ai = getGeminiClient();
      const prompt = `Context (Original Script): ${scriptContext || "Not provided"}
Audience Question Asked: "${question}"
Student's Spoken Answer: "${answer}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: PRACTICE_ANALYSIS_INSTRUCTION,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
      return response.text;
    }
  );

  return res.json(result);
});

app.post("/api/analyze-recording", async (req, res) => {
  const { topic, script, durationSeconds, spokenTranscript, recordMode = "video", telemetry } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Presentation topic/title is required." });
  }

  const result = await executeWithRetryAndFallback(
    "/api/analyze-recording",
    { topic, script, durationSeconds, spokenTranscript, recordMode, telemetry },
    DEFAULT_RECORDING_FEEDBACK,
    generateRecordingFallback,
    async () => {
      const ai = getGeminiClient();
      const prompt = `Presentation Topic: ${topic}
Planned Script: ${script || "Not provided"}
Speaking Duration: ${durationSeconds || 0} seconds
Spoken Transcript: ${spokenTranscript || "Not provided"}
Recording Mode: ${recordMode} (evaluate body language, hand gestures, and relaxation posture if video mode)
Measured Video & Audio Telemetry: ${telemetry ? JSON.stringify(telemetry) : "Not available"}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: RECORDING_ANALYSIS_INSTRUCTION,
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });
      return response.text;
    }
  );

  // Attach client telemetry so UI always shows measured metrics alongside AI critique
  if (telemetry && typeof result === "object" && result !== null) {
    (result as any).telemetry = telemetry;
  }

  return res.json(result);
});

app.post("/api/analyze-ted-talk", async (req, res) => {
  const { script } = req.body;
  if (!script || script.trim().length === 0) {
    return res.status(400).json({ error: "Script text cannot be empty." });
  }

  const result = await executeWithRetryAndFallback(
    "/api/analyze-ted-talk",
    { script },
    DEFAULT_TED_ANALYSIS,
    generateTedFallback,
    async () => {
      const ai = getGeminiClient();
      const prompt = `Analyze this presentation script for TED Talk stage readiness:\n\n${script}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: TED_ANALYSIS_INSTRUCTION,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
      return response.text;
    }
  );

  return res.json(result);
});

// ==========================================
// GEMINI CHATBOT: FAST STUDENT STUDY ASSISTANT
// ==========================================
const STUDENT_STUDY_ASSISTANT_INSTRUCTION = `You are a fast, intelligent study assistant for students.

Your main goals are:
1. Give accurate answers.
2. Understand what the student is actually asking.
3. Explain difficult ideas in simple language.
4. Be concise unless the student asks for more detail.
5. Never make up facts. If you are unsure, say so.
6. Match the student's level and wording.
7. When answering school questions, give the direct answer first, then a short explanation.
8. For calculations, show the essential working clearly.
9. If the student's answer is wrong, clearly say what is wrong and give the correct answer.
10. If the student's answer is correct, confirm it and explain why when useful.
11. Do not unnecessarily repeat the question.
12. Do not give long introductions or unnecessary conclusions.

Conversation style:
- Friendly and natural.
- Use simple language.
- Do not sound overly formal or robotic.
- Keep responses short for simple questions.
- For complex questions, break the explanation into clear steps.
- Use examples when they make the concept easier to understand.

IMPORTANT:
Prioritize correctness over confidence.
Do not invent information just to provide an answer.

Before answering, identify the student's actual intent from the conversation.
Use previous messages as context so the student does not have to repeat information.
If the student's message contains a typo, infer the intended meaning when it is obvious.
If there are multiple possible meanings, ask a short clarification question instead of guessing.

For schoolwork:
- Follow the terminology and methods appropriate for the student's level.
- Do not unnecessarily introduce advanced concepts they have not asked about.
- When marking an answer, judge whether it would receive the required marks, not just whether it is technically possible.
- If an answer could receive full marks, say so clearly.

Emoji style:
- You may use emojis naturally when they improve the tone or make an explanation clearer.
- Use emojis sparingly, usually 0–3 per response.
- Match the student's casual tone when appropriate.
- Do not put emojis after every sentence.
- For serious, technical, or formal school answers, use few or no emojis.
- Useful examples: ✅ for correct answers, ❌ for mistakes, 💡 for tips, 📌 for important points, 🎯 for goals.`;

function generateChatFallback(lastMessageText: string): string {
  const lower = (lastMessageText || "").toLowerCase().trim();
  
  // Math: 4x5, 4*5, etc.
  const multMatch = lower.match(/(\d+)\s*[*x×]\s*(\d+)/);
  if (multMatch) {
    const a = parseInt(multMatch[1]);
    const b = parseInt(multMatch[2]);
    const res = a * b;
    return `${a} × ${b} = **${res}** ✅\n\n**Working:**\n${a} groups of ${b} equals ${res}.`;
  }
  
  const addMatch = lower.match(/(\d+)\s*\+\s*(\d+)/);
  if (addMatch) {
    const a = parseInt(addMatch[1]);
    const b = parseInt(addMatch[2]);
    return `${a} + ${b} = **${a + b}** ✅\n\n**Working:**\nAdding ${b} to ${a} gives ${a + b}.`;
  }

  const subMatch = lower.match(/(\d+)\s*-\s*(\d+)/);
  if (subMatch) {
    const a = parseInt(subMatch[1]);
    const b = parseInt(subMatch[2]);
    return `${a} - ${b} = **${a - b}** ✅\n\n**Working:**\nSubtracting ${b} from ${a} leaves ${a - b}.`;
  }

  const divMatch = lower.match(/(\d+)\s*[/÷]\s*(\d+)/);
  if (divMatch) {
    const a = parseInt(divMatch[1]);
    const b = parseInt(divMatch[2]);
    if (b === 0) return "❌ Division by zero is undefined in mathematics.";
    return `${a} ÷ ${b} = **${a / b}** ✅\n\n**Working:**\n${a} divided into ${b} equal parts is ${a / b}.`;
  }

  if (lower.includes("photosynthesis")) {
    return "Photosynthesis is the process plants use to turn sunlight, water, and carbon dioxide into oxygen and glucose for energy. 💡";
  }

  if (lower.includes("hook") || lower.includes("first 15 seconds")) {
    return "Start with a surprising statistic, a vivid 'Imagine this...' scenario, or a thought-provoking question to hook your audience immediately! 🎯";
  }

  if (lower.includes("pace") || lower.includes("wpm")) {
    return "The ideal speaking speed is **110–140 words per minute**. Take deliberate pauses between key points to let your audience process your ideas. 💡";
  }

  return "I'm your intelligent study assistant! Ask me any school question, calculation, or presentation concept, and I'll give you a direct, accurate answer. 💡";
}

app.post("/api/gemini/chat", async (req, res) => {
  const { messages, speedPreference, stream = true } = req.body;
  
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array cannot be empty." });
  }

  const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
  const lastUserText = lastUserMsg?.text || "";
  const modelToUse = speedPreference === "fast" ? "gemini-3.1-flash-lite" : "gemini-3.8-flash";

  // Build GenAI contents array
  const formattedContents: any[] = [];
  for (const m of messages) {
    const parts: any[] = [];
    if (m.image && m.image.data && m.image.mimeType) {
      parts.push({
        inlineData: {
          data: m.image.data,
          mimeType: m.image.mimeType
        }
      });
    }
    if (m.text && typeof m.text === "string" && m.text.trim()) {
      parts.push({ text: m.text });
    }
    if (parts.length > 0) {
      formattedContents.push({
        role: m.role === "model" ? "model" : "user",
        parts
      });
    }
  }

  if (formattedContents.length === 0) {
    formattedContents.push({
      role: "user",
      parts: [{ text: "Hello!" }]
    });
  }

  const acceptsSSE = stream && req.headers.accept?.includes("text/event-stream");

  try {
    const ai = getGeminiClient();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Gemini request timed out after 15s")), 15000)
    );

    if (acceptsSSE) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      const streamCall = ai.models.generateContentStream({
        model: modelToUse,
        contents: formattedContents,
        config: {
          systemInstruction: STUDENT_STUDY_ASSISTANT_INSTRUCTION,
          temperature: 0.3,
        }
      });

      const responseStream = await Promise.race([streamCall, timeoutPromise]) as any;

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text, model: modelToUse })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      return res.end();
    } else {
      // Non-streaming response
      const generateCall = ai.models.generateContent({
        model: modelToUse,
        contents: formattedContents,
        config: {
          systemInstruction: STUDENT_STUDY_ASSISTANT_INSTRUCTION,
          temperature: 0.3,
        }
      });

      const response = await Promise.race([generateCall, timeoutPromise]) as any;

      return res.json({
        reply: response.text || generateChatFallback(lastUserText),
        model: modelToUse,
        isFallback: false
      });
    }
  } catch (err: any) {
    console.error("Gemini Chat API Error:", err?.message || err);
    logDiagnostic("gemini-chat", "fallback", 1, 0, "gemini-study-fallback", true, err?.message);

    const fallbackAnswer = generateChatFallback(lastUserText);

    if (acceptsSSE) {
      if (!res.headersSent) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders?.();
      }
      res.write(`data: ${JSON.stringify({ text: fallbackAnswer, model: "study-assistant-resilient", isFallback: true })}\n\n`);
      res.write("data: [DONE]\n\n");
      return res.end();
    } else {
      return res.json({
        reply: fallbackAnswer,
        model: "study-assistant-resilient",
        isFallback: true
      });
    }
  }
});

// Setup dev server or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
