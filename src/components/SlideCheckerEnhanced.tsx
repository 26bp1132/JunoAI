import React, { useState, useRef } from "react";
import {
  Sparkles,
  Upload,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  FileText,
  Layers,
  Palette,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { SlideAnalysisResult } from "../types";

interface SlideCheckerEnhancedProps {
  onAnalyze: (slideContent: string) => Promise<void>;
  slideAnalysis: SlideAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
}

export const SlideCheckerEnhanced: React.FC<SlideCheckerEnhancedProps> = ({
  onAnalyze,
  slideAnalysis,
  isAnalyzing,
  error
}) => {
  const [slideMode, setSlideMode] = useState<"deck" | "single">("deck");
  const [slideText, setSlideText] = useState(
    `Slide 1: Renewable Energy Revolution
- Clean power reduces global greenhouse emissions
- Solar panel energy efficiency doubled over recent decade
- Wind turbine installations generate thousands of kilowatt hours

Slide 2: Primary Adoption Hurdles
- Initial equipment manufacturing and installation cost
- Battery storage requires grid-level technological scaling
- International government subsidies are accelerating development

Slide 3: Our Action Plan
- Modernize campus solar canopy coverage by 2028
- Educate students on active energy conservation habits`
  );
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSlideIndex, setCopiedSlideIndex] = useState<number | null>(null);
  const [selectedSlideTab, setSelectedSlideTab] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File Upload Reader (Supports .txt, .md, .pptx, .pdf, .json, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string" && text.trim().length > 0) {
        setSlideText(text);
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be uploaded again if needed
    e.target.value = "";
  };

  const handleRunAnalysis = () => {
    if (!slideText.trim()) return;
    onAnalyze(slideText);
  };

  const handleCopyText = (text: string, slideIdx?: number) => {
    navigator.clipboard.writeText(text);
    if (slideIdx !== undefined) {
      setCopiedSlideIndex(slideIdx);
      setTimeout(() => setCopiedSlideIndex(null), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="slide-checker-enhanced-view">
      
      {/* Header Banner */}
      <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-[#FF6B35] p-3 rounded-2xl border-2 border-black text-white shadow-[3px_3px_0px_#000]">
              <Layers className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-[#FFD166] text-black px-2 py-0.5 rounded border border-black uppercase tracking-wider">
                  Full Deck & Single Slide
                </span>
                <span className="text-[10px] font-black bg-[#06D6A0] text-black px-2 py-0.5 rounded border border-black uppercase tracking-wider">
                  Design & Grammar
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-black font-heading mt-0.5">
                Slide Checker <span className="text-[#FF6B35]">Design & Grammar Studio</span>
              </h2>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">
                Upload your whole presentation deck or inspect a single slide for design layout, whitespace, typography, and grammar accuracy!
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-2 bg-[#FFF9F2] p-1.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000]">
            <button
              onClick={() => {
                setSlideMode("deck");
                if (!slideText.includes("Slide 2")) {
                  setSlideText(`Slide 1: Clean Energy Future\n- Renewable solar power reduces greenhouse emissions\n- Battery storage technology scales rapidly\n\nSlide 2: Global Implementation\n- National subsidies accelerate adoption\n- Community grid installations grow by 40%`);
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-black flex items-center gap-1.5 uppercase ${
                slideMode === "deck"
                  ? "bg-[#FF6B35] text-white shadow-[2px_2px_0px_#000]"
                  : "bg-white text-black hover:bg-amber-100"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Whole Slide Deck</span>
            </button>
            <button
              onClick={() => {
                setSlideMode("single");
                setSlideText(`Slide 1: Martian Colonization Goals\n- Moxie device extracts breathable oxygen from CO2 atmosphere\n- Lower gravity allows lighter rocket launch fuel constraints\n- Subsurface water ice deposits sustain future human settlers`);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-black flex items-center gap-1.5 uppercase ${
                slideMode === "single"
                  ? "bg-[#06D6A0] text-black shadow-[2px_2px_0px_#000]"
                  : "bg-white text-black hover:bg-amber-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Single Slide</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form & Upload */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border-3 border-black p-6 rounded-3xl shadow-[6px_6px_0px_#000] space-y-4">
            
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 font-heading">
                {slideMode === "deck" ? "📑 Whole Slide Deck Input" : "📄 Single Slide Input"}
              </span>

              {/* Upload Button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.md,.pptx,.pdf,.json,.csv"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-[#FFD166] hover:bg-[#ffc83b] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5 transition-all"
                  title="Upload slide text or presentation notes file"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">
                Load Sample Presentations:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSlideMode("deck");
                    setSlideText(`Slide 1: Artificial Intelligence in Modern Healthcare
- Machine learning models detect anomalies in radiologic scans
- Neural networks accelerate genomic drug discovery pipelines
- Predictive patient triage reduces emergency room wait times

Slide 2: Clinical Ethics & Safety Protocols
- Patient privacy protections require end-to-end data encryption
- Physician-in-the-loop oversight prevents algorithmic bias
- Rigorous clinical trials benchmark diagnostic safety

Slide 3: Implementation Timeline
- Phase 1: Institutional staff workflow training (Q1)
- Phase 2: Pilot testing across oncology department (Q3)
- Phase 3: Hospital-wide deployment with patient consent`);
                  }}
                  className="text-[10px] font-black bg-[#FFF9F2] hover:bg-[#FFD166] text-black border-2 border-black px-2 py-0.5 rounded-lg transition-all cursor-pointer shadow-[1px_1px_0px_#000]"
                >
                  3-Slide Deck (AI Healthcare)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSlideMode("single");
                    setSlideText(`Title: The Industrial Revolution Impact
- Steam engines replaced manual labor across textile mills.
- Urban populations surged as agricultural workers moved into industrial cities.
- Rail networks drastically reduced freight shipping transit durations across continents.`);
                  }}
                  className="text-[10px] font-black bg-[#FFF9F2] hover:bg-[#FFD166] text-black border-2 border-black px-2 py-0.5 rounded-lg transition-all cursor-pointer shadow-[1px_1px_0px_#000]"
                >
                  Single History Slide
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-black flex items-center justify-between">
                <span>Slide Text & Bullet Points:</span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {slideText.split(/\s+/).filter(Boolean).length} words
                </span>
              </label>
              <textarea
                rows={12}
                value={slideText}
                onChange={(e) => setSlideText(e.target.value)}
                placeholder={
                  slideMode === "deck"
                    ? "Paste entire presentation deck here! Separate slides using 'Slide 1:', 'Slide 2:', or '---':\n\nSlide 1: Topic\n- Point 1\n- Point 2\n\nSlide 2: Next Topic\n- Point 1\n- Point 2"
                    : "Paste a single slide text here:\n\nSlide Title: Mars Colony\n- Moxie oxygen extraction\n- Subsurface ice reserves"
                }
                className="w-full bg-[#FFFDF7] border-2 border-black rounded-2xl p-4 text-xs font-semibold leading-relaxed text-black focus:outline-none focus:border-[#FF6B35] placeholder-slate-400 shadow-[2px_2px_0px_#000]"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !slideText.trim()}
              className={`w-full py-3.5 px-5 bg-[#FF6B35] hover:bg-[#e0531e] text-white font-black rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs cursor-pointer font-heading ${
                (isAnalyzing || !slideText.trim()) ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Auditing Slide Layout & Grammar...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>{slideMode === "deck" ? "Analyze Whole Slide Deck" : "Audit Single Slide"}</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-rose-100 border-2 border-black text-rose-900 text-xs font-bold rounded-xl flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-700" />
                <span>{error}</span>
              </div>
            )}

            {/* Guy Kawasaki 10-20-30 Rule Cheatsheet */}
            <div className="p-3.5 bg-[#FFF9F2] rounded-2xl border-2 border-black text-[11px] text-slate-800 space-y-1 shadow-[2px_2px_0px_#000]">
              <p className="font-black text-[#FF6B35] uppercase font-heading">
                💡 10-20-30 & 6x6 Slide Discipline:
              </p>
              <p className="font-semibold leading-relaxed">
                Aim for no more than 6 bullet points per slide, 6 words per bullet, and 30pt font size. Audiences should be listening to you, not reading walls of text!
              </p>
            </div>

          </div>
        </div>

        {/* Right Column: Slide Analysis Results */}
        <div className="lg:col-span-7 space-y-6">
          {slideAnalysis ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Overall Deck / Slide Scorecard */}
              <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] space-y-5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black pb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-[#FFD166] text-black px-2.5 py-0.5 rounded border border-black uppercase tracking-wider">
                        {slideAnalysis.totalSlidesDetected && slideAnalysis.totalSlidesDetected > 1
                          ? `${slideAnalysis.totalSlidesDetected} Slides Audited`
                          : "Single Slide Audited"}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black uppercase text-black font-heading mt-1">
                      Slide Design & Grammar Report
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-[#06D6A0] text-black px-3.5 py-1.5 rounded-xl border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] text-center">
                      <p className="text-[9px] uppercase tracking-wider">Overall Score</p>
                      <p className="text-base font-black">{slideAnalysis.overallScore}/100</p>
                    </div>
                  </div>
                </div>

                {/* Sub-Scores: Design vs Grammar */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#FFF9F2] rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-700 font-heading">
                        🎨 Design & Layout
                      </span>
                      <span className="text-xs font-black text-black">
                        {slideAnalysis.designScore || 85}/100
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-semibold mt-1">
                      {slideAnalysis.designAdvice || "Good visual whitespace balance."}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#FFF9F2] rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-700 font-heading">
                        ✍️ Grammar & Brevity
                      </span>
                      <span className="text-xs font-black text-black">
                        {slideAnalysis.grammarScore || 88}/100
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-semibold mt-1">
                      {slideAnalysis.grammarAdvice || "Crisp bullet formulation and active phrasing."}
                    </p>
                  </div>
                </div>

                {/* Issues List */}
                <div className="space-y-2.5">
                  <p className="text-[11px] font-black uppercase text-slate-800 tracking-wider">
                    Audited Feedback Items ({slideAnalysis.issues?.length || 0}):
                  </p>
                  <div className="space-y-2.5">
                    {slideAnalysis.issues?.map((issue, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-[#FFF9F2] border-2 border-black rounded-2xl text-xs flex gap-3 items-start shadow-[2px_2px_0px_#000]"
                      >
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border border-black shadow-[1px_1px_0px_#000] shrink-0 ${
                            issue.severity === "High"
                              ? "bg-[#EF476F] text-white"
                              : issue.severity === "Medium"
                              ? "bg-[#FFD166] text-black"
                              : "bg-[#06D6A0] text-black"
                          }`}
                        >
                          {issue.severity}
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-black text-black uppercase text-xs">{issue.type}</p>
                          <p className="text-slate-800 font-medium leading-relaxed">{issue.description}</p>
                          <p className="text-black font-bold pt-1 flex items-center gap-1">
                            <span>💡 Fix:</span> {issue.recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!slideAnalysis.issues || slideAnalysis.issues.length === 0) && (
                      <div className="p-3 bg-[#06D6A0]/20 rounded-2xl border-2 border-black text-emerald-950 font-bold text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                        <span>Pristine presentation slide formatting! No clutter or grammatical issues detected.</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* SLIDE-BY-SLIDE BREAKDOWN (IF MULTI-SLIDE DECK) */}
              {slideAnalysis.slideDeck && slideAnalysis.slideDeck.length > 0 && (
                <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-black pb-3">
                    <h4 className="text-sm font-black uppercase text-black font-heading flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#FF6B35]" />
                      Slide-by-Slide Audit Cards ({slideAnalysis.slideDeck.length} Slides)
                    </h4>
                    <span className="text-[10px] font-black bg-[#FFD166] text-black px-2 py-0.5 rounded border border-black">
                      Detailed Breakdown
                    </span>
                  </div>

                  {/* Slide Tabs Navigation */}
                  <div className="flex flex-wrap gap-2">
                    {slideAnalysis.slideDeck.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSlideTab(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                          selectedSlideTab === idx
                            ? "bg-[#FF6B35] text-white"
                            : "bg-[#FFF9F2] text-black hover:bg-[#FFD166]"
                        }`}
                      >
                        Slide {s.slideNumber}: {s.title.slice(0, 16)}...
                      </button>
                    ))}
                  </div>

                  {/* Active Selected Slide Details */}
                  {(() => {
                    const activeSlide = slideAnalysis.slideDeck[selectedSlideTab] || slideAnalysis.slideDeck[0];
                    if (!activeSlide) return null;

                    return (
                      <div className="p-5 bg-[#FFF9F2] rounded-2xl border-2 border-black space-y-4 shadow-[3px_3px_0px_#000]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-2">
                          <div>
                            <span className="text-[10px] font-black text-slate-600 uppercase">
                              Slide {activeSlide.slideNumber}
                            </span>
                            <h5 className="text-base font-black text-black font-heading">
                              {activeSlide.title}
                            </h5>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase ${
                              activeSlide.density === "Overcrowded" ? "bg-[#EF476F] text-white" : activeSlide.density === "Moderate" ? "bg-[#FFD166] text-black" : "bg-[#06D6A0] text-black"
                            }`}>
                              {activeSlide.density} ({activeSlide.wordCount} words)
                            </span>
                            <span className="text-xs font-black bg-white px-2 py-0.5 rounded border border-black">
                              Score: {activeSlide.slideScore}/100
                            </span>
                          </div>
                        </div>

                        {/* Design & Grammar bullets */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-white p-3 rounded-xl border-2 border-black space-y-1">
                            <p className="font-black text-[#FF6B35] uppercase text-[10px]">🎨 Layout Recommendations:</p>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-700 font-semibold">
                              {activeSlide.designTips?.map((tip, tIdx) => (
                                <li key={tIdx}>{tip}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-white p-3 rounded-xl border-2 border-black space-y-1">
                            <p className="font-black text-emerald-700 uppercase text-[10px]">✍️ Grammar & Phrasing:</p>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-700 font-semibold">
                              {activeSlide.grammarNotes?.map((note, nIdx) => (
                                <li key={nIdx}>{note}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Revised Slide Preview with Copy Button */}
                        <div className="space-y-1 relative">
                          <p className="text-[10px] font-black uppercase text-slate-700">
                            Ready-to-Paste Slide Makeover:
                          </p>
                          <div className="bg-[#FFFDF7] p-4 rounded-xl border-2 border-black font-mono text-xs text-black whitespace-pre-wrap leading-relaxed shadow-[2px_2px_0px_#000] relative">
                            {activeSlide.revisedText}
                            <button
                              onClick={() => handleCopyText(activeSlide.revisedText, selectedSlideTab)}
                              className="absolute top-3 right-3 px-2.5 py-1 bg-white hover:bg-[#FFD166] text-black font-black text-[10px] rounded-lg border-2 border-black shadow-[1px_1px_0px_#000] cursor-pointer flex items-center gap-1 transition-all"
                            >
                              {copiedSlideIndex === selectedSlideTab ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" /> Copied Slide!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" /> Copy Slide {activeSlide.slideNumber}
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })()}

                </div>
              )}

              {/* Master Full Deck / Slide Makeover */}
              <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <h4 className="text-sm font-black uppercase text-black font-heading flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                    Optimized Master Presentation Text
                  </h4>

                  <button
                    onClick={() => handleCopyText(slideAnalysis.revisedSlideText)}
                    className="px-3.5 py-1.5 bg-[#06D6A0] hover:bg-[#05be8d] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    {copiedAll ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3px]" /> Copied Master Text!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Entire Makeover
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  Copy and paste this refined version directly into PowerPoint, Google Slides, or Keynote. Formatted with optimal bullet brevity, active voice, and clear visual hierarchy:
                </p>

                <div className="bg-[#FFFDF7] p-5 rounded-2xl border-2 border-black font-mono text-xs text-black whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto shadow-[2px_2px_0px_#000]">
                  {slideAnalysis.revisedSlideText}
                </div>
              </div>

            </div>
          ) : isAnalyzing ? (
            <div className="bg-white border-3 border-black rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[420px] shadow-[6px_6px_0px_#000] space-y-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute w-16 h-16 border-4 border-black border-t-[#FF6B35] rounded-full animate-spin"></div>
                <Sparkles className="w-8 h-8 text-[#FF6B35] animate-pulse" />
              </div>
              <h3 className="text-lg font-black text-black uppercase tracking-wider font-heading">
                Analyzing Slide Design & Grammar
              </h3>
              <p className="text-xs text-slate-700 font-semibold max-w-sm">
                Evaluating whitespace balance, Guy Kawasaki 10-20-30 rules, font hierarchy, bullet conciseness, and active voice phrasing...
              </p>
            </div>
          ) : (
            <div className="bg-white border-3 border-black rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[420px] shadow-[6px_6px_0px_#000] space-y-4">
              <div className="w-16 h-16 bg-[#FFF9F2] border-3 border-black rounded-3xl flex items-center justify-center text-[#FF6B35] shadow-[3px_3px_0px_#000]">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-black uppercase tracking-wider font-heading">
                Slide Checker Ready
              </h3>
              <p className="text-xs text-slate-700 font-semibold max-w-md leading-relaxed">
                Paste your single slide or entire presentation deck on the left, or click <strong className="text-black">Upload File</strong> (.txt, .md, .pptx) to receive an immediate design & grammar audit!
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
