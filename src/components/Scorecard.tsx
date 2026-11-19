import { Award, CheckCircle, AlertTriangle, Sparkles, Smile, Star } from "lucide-react";

interface ScorecardProps {
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
  teacherGrade?: string;
}

export default function Scorecard({ scores, readiness, teacherGrade }: ScorecardProps) {
  const getReadinessConfig = (level: string) => {
    switch (level) {
      case "Outstanding":
        return {
          bg: "bg-[#06D6A0] text-black border-2 border-black shadow-[3px_3px_0px_#000]",
          iconBg: "bg-white text-black border border-black",
          desc: "Superb preparation! Your script is refined, organized, and ready to amaze your class.",
        };
      case "Presentation Ready":
        return {
          bg: "bg-[#FFD166] text-black border-2 border-black shadow-[3px_3px_0px_#000]",
          iconBg: "bg-white text-black border border-black",
          desc: "You are ready to stand in front of the class. Just review the final speaking tips!",
        };
      case "Almost Ready":
        return {
          bg: "bg-amber-100 text-black border-2 border-black shadow-[3px_3px_0px_#000]",
          iconBg: "bg-white text-black border border-black",
          desc: "You have a solid foundation! Making a few minor adjustments will strengthen your presentation delivery.",
        };
      case "Needs More Practice":
      default:
        return {
          bg: "bg-[#EF476F]/20 text-black border-2 border-black shadow-[3px_3px_0px_#000]",
          iconBg: "bg-white text-[#EF476F] border border-black",
          desc: "Keep going! Work on structuring your introduction, reducing complex words, and practicing.",
        };
    }
  };

  const readinessConfig = getReadinessConfig(readiness);

  const metricCards = [
    { label: "Confidence", score: scores.confidence, desc: "Belief, posture & nerve tips", barBg: "bg-[#FF6B35]" },
    { label: "Clarity", score: scores.clarity, desc: "Easy to follow & clear ideas", barBg: "bg-[#06D6A0]" },
    { label: "Engagement", score: scores.engagement, desc: "How well you hook the class", barBg: "bg-[#FFD166]" },
    { label: "Vocabulary", score: scores.vocabulary, desc: "Word choice appropriateness", barBg: "bg-[#00F5FF]" },
    { label: "Organization", score: scores.organization, desc: "Logical structure & flow", barBg: "bg-[#06D6A0]" },
    { label: "Professionalism", score: scores.professionalism, desc: "Presentation conventions", barBg: "bg-[#EF476F]" },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[5px_5px_0px_#000]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-[#FFD166] border-3 border-black shadow-[3px_3px_0px_#000] animate-pop-in hover:scale-105 transition-transform duration-300 cursor-default">
              <span className="text-3xl font-black text-black">{scores.overall}</span>
              <span className="absolute -bottom-2 text-[10px] font-black text-black bg-white px-2 py-0.5 rounded-md border-2 border-black shadow-[1px_1px_0px_#000]">
                OUT OF 100
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-black flex items-center gap-2">
                Overall Present<span className="text-[#FF6B35]">AI</span> Score <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
              </h3>
              <p className="text-sm font-medium text-slate-700 mt-1">
                Your general presentation readiness based on 15 custom presentation metrics.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Readiness Badge */}
            <div className={`flex-1 sm:flex-initial flex items-center gap-3 px-4 py-3 rounded-xl ${readinessConfig.bg}`}>
              <div className={`p-2 rounded-lg ${readinessConfig.iconBg}`}>
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider opacity-80">Readiness status</p>
                <p className="text-sm font-black">{readiness}</p>
              </div>
            </div>

            {/* Estimated Teacher Grade */}
            {teacherGrade && (
              <div className="flex-1 sm:flex-initial flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-black bg-[#FFF9F2] text-black shadow-[3px_3px_0px_#000]">
                <div className="p-2 rounded-lg bg-[#FFD166] text-black border border-black">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider opacity-80">Estimated Grade</p>
                  <p className="text-sm font-black">{teacherGrade}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t-2 border-black/10 text-xs sm:text-sm text-slate-800">
          <strong className="font-black text-black">Present<span className="text-[#FF6B35]">AI</span> Summary:</strong> {readinessConfig.desc}
        </div>
      </div>

      {/* Grid of 6 metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((m) => (
          <div key={m.label} className="border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000] bg-white transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black text-black">{m.label}</span>
              <span className="text-xs font-black text-black bg-[#FFF9F2] px-2.5 py-1 rounded-md border-2 border-black shadow-[1px_1px_0px_#000]">{m.score}/100</span>
            </div>
            
            {/* Simple linear gauge progress bar */}
            <div className="w-full bg-[#FFF9F2] border-2 border-black rounded-full h-3 mb-2 overflow-hidden">
              <div
                className={`${m.barBg} h-full transition-all duration-500`}
                style={{ width: `${m.score}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 font-semibold">{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
