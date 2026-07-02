import { X } from "lucide-react";
import CandidateScoreGauge from "./CandidateScoreGauge";
import CandidateRadarChart from "./CandidateRadarChart";

interface CandidateComparisonProps {
  candidates: any[];
  onClose: () => void;
}

export default function CandidateComparison({ candidates, onClose }: CandidateComparisonProps) {
  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Candidate Comparison</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center overflow-hidden">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
           <div className={`grid grid-cols-1 ${candidates.length === 1 ? 'md:grid-cols-1' : candidates.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
             {candidates.map((res, i) => (
               <div key={i} className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white flex flex-col">
                 <h3 className="font-bold text-lg text-gray-900 mb-1 truncate" title={res.candidate.name}>{res.candidate.name || "Unknown"}</h3>
                 <p className="text-sm text-gray-500 mb-4 line-clamp-1">{res.candidate.experience_summary}</p>
                 
                 <div className="flex flex-col gap-4 mb-6">
                   <div className="w-full shrink-0 flex flex-col items-center justify-center">
                     <div className="w-24">
                       <CandidateScoreGauge score={res.match_score} id={`compare-${i}`} compact />
                     </div>
                     <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">Match</span>
                   </div>
                   <div className="w-full">
                     <CandidateRadarChart 
                       technicalFit={res.technical_fit_score}
                       experienceFit={res.experience_fit_score}
                       velocity={res.velocity_score}
                       contextualFit={res.contextual_fit_score}
                       portfolio={res.portfolio_intensity}
                     />
                   </div>
                 </div>
                 
                 <div className="space-y-4 text-sm text-gray-700 flex-grow">
                    <div>
                      <span className="font-bold block mb-1 uppercase text-xs tracking-wider text-gray-500">Top Skills</span>
                      <span className="text-gray-900">{(res.candidate.skills || []).slice(0, 5).join(", ")}</span>
                    </div>
                    {res.core_strengths && res.core_strengths.length > 0 && (
                      <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                        <span className="font-bold block mb-2 uppercase text-[10px] tracking-wider text-indigo-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          Core Strengths
                        </span>
                        <ul className="space-y-1">
                          {res.core_strengths.map((strength: string, idx: number) => (
                            <li key={idx} className="flex gap-1.5 text-xs text-indigo-900">
                              <span className="font-bold shrink-0">•</span>
                              <span className="line-clamp-2" title={strength}>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <span className="font-bold block mb-1 uppercase text-xs tracking-wider text-green-700">Why they fit</span>
                      <p className="line-clamp-4 leading-relaxed" title={res.why_this_candidate}>{res.why_this_candidate}</p>
                    </div>
                    <div>
                      <span className="font-bold block mb-1 uppercase text-xs tracking-wider text-red-700">Potential Gaps</span>
                      <p className="line-clamp-4 leading-relaxed" title={res.potential_gaps}>{res.potential_gaps}</p>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
