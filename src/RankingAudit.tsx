import React, { useState } from "react";
import {
  Search,
  Scale,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RankingAuditProps {
  score: number;
}

export default function RankingAudit({ score }: RankingAuditProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Mock data for the audit
  const auditData = {
    semanticMatch: {
      score: score,
      reasoning:
        "The candidate's experience closely aligns with the job description's focus on scalable architecture and cross-functional collaboration. The AI model identified a strong semantic correlation between their background in logistics optimization and the required system design skills.",
    },
    keywordWeights: [
      { keyword: "React", weight: 0.85, match: true },
      { keyword: "Python", weight: 0.7, match: true },
      { keyword: "System Design", weight: 0.9, match: true },
      { keyword: "Kubernetes", weight: 0.6, match: false },
      { keyword: "GraphQL", weight: 0.5, match: false },
    ],
  };

  return (
    <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">
              AI Ranking Audit
            </h4>
            <p className="text-xs text-gray-500">
              View transparency report & semantic match criteria
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
            <Scale className="w-3 h-3" /> Weighted
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-gray-200 space-y-4">
              <div>
                <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Semantic Reasoning
                </h5>
                <p className="text-sm text-gray-600 leading-relaxed bg-white p-3 rounded-lg border border-gray-100">
                  {auditData.semanticMatch.reasoning}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Search className="w-3 h-3" /> Keyword Weighting Map
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {auditData.keywordWeights.map((kw, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        {kw.match ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                        )}
                        <span
                          className={`text-sm font-medium ${kw.match ? "text-gray-900" : "text-gray-500 line-through"}`}
                        >
                          {kw.keyword}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${kw.match ? "bg-blue-500" : "bg-gray-300"}`}
                            style={{ width: `${kw.weight * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-mono w-8 text-right">
                          {kw.weight.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
