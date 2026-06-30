import React from "react";
import { AlertCircle, CheckCircle2, MinusCircle } from "lucide-react";

interface SkillsGapProps {
  skillsGap?: {
    missing_must_haves: string[];
    missing_nice_to_haves: string[];
  };
}

export default function SkillsGap({ skillsGap }: SkillsGapProps) {
  if (!skillsGap) return null;

  const { missing_must_haves = [], missing_nice_to_haves = [] } = skillsGap;

  if (missing_must_haves.length === 0 && missing_nice_to_haves.length === 0) {
    return (
      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm mt-4">
        <h4 className="font-bold text-emerald-900 mb-1 uppercase tracking-wider text-[10px] flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Skills Gap Analysis
        </h4>
        <p className="text-emerald-700 text-sm font-bold">Candidate meets all listed skills requirements.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-4">
      <h4 className="font-bold text-gray-800 mb-3 uppercase tracking-wider text-xs">Skills Gap Analysis</h4>
      <div className="space-y-4">
        {missing_must_haves.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-red-700 flex items-center gap-1 mb-2">
              <AlertCircle className="w-3 h-3" /> Missing Must-Have Skills
            </h5>
            <div className="flex flex-wrap gap-2">
              {missing_must_haves.map((skill, i) => (
                <span key={i} className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-700 rounded-md border border-red-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {missing_nice_to_haves.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-amber-700 flex items-center gap-1 mb-2">
              <MinusCircle className="w-3 h-3" /> Missing Nice-to-Have Skills
            </h5>
            <div className="flex flex-wrap gap-2">
              {missing_nice_to_haves.map((skill, i) => (
                <span key={i} className="text-[10px] font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
