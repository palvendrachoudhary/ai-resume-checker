import React, { useState } from "react";
import { X, Check, Search, Scale } from "lucide-react";
import { HistoryItem } from "./RecentScans";
import CandidateScoreGauge from "./CandidateScoreGauge";
import CandidateRadarChart from "./CandidateRadarChart";
import SkillsGap from "./SkillsGap";

interface CandidateHistoryCompareProps {
  history: HistoryItem[];
  onClose: () => void;
}

export default function CandidateHistoryCompare({
  history,
  onClose,
}: CandidateHistoryCompareProps) {
  const [selected, setSelected] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSelection = (candidateData: any, jobTitle: string) => {
    const isSelected = selected.some(
      (c) =>
        c.candidate.name === candidateData.candidate.name &&
        c.jobTitle === jobTitle,
    );
    if (isSelected) {
      setSelected(
        selected.filter(
          (c) =>
            !(
              c.candidate.name === candidateData.candidate.name &&
              c.jobTitle === jobTitle
            ),
        ),
      );
    } else {
      if (selected.length < 2) {
        setSelected([...selected, { ...candidateData, jobTitle }]);
      }
    }
  };

  const allCandidates = history.flatMap((item) =>
    item.results.map((res) => ({
      ...res,
      jobTitle: item.jobTitle,
      timestamp: item.timestamp,
    })),
  );

  const filteredCandidates = allCandidates.filter(
    (c) =>
      c.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-[110] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              Historical Candidate Comparison
            </h2>
            <p className="text-sm text-gray-500">
              Select exactly 2 candidates from your evaluation history to
              compare.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center overflow-hidden"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Selection List */}
          <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/30">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search candidates or jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredCandidates.map((res, i) => {
                const isSelected = selected.some(
                  (c) =>
                    c.candidate.name === res.candidate.name &&
                    c.jobTitle === res.jobTitle,
                );
                return (
                  <div
                    key={i}
                    onClick={() => toggleSelection(res, res.jobTitle)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    } ${selected.length >= 2 && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">
                          {res.candidate.name}
                        </h4>
                        <p className="text-[10px] font-medium text-blue-600 mt-0.5">
                          {res.jobTitle}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {res.candidate.experience_summary}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredCandidates.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No candidates found in history.
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Comparison View */}
          <div className="w-2/3 flex flex-col bg-white overflow-y-auto">
            {selected.length === 2 ? (
              <div className="p-8">
                <div className="grid grid-cols-2 gap-8">
                  {selected.map((res, i) => (
                    <div key={i} className="flex flex-col">
                      <div className="mb-6 pb-6 border-b border-gray-100">
                        <h3 className="text-2xl font-black text-gray-900">
                          {res.candidate.name}
                        </h3>
                        <p className="text-sm font-bold text-blue-600 mt-1">
                          {res.jobTitle}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {res.candidate.experience_summary}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 shrink-0">
                          <CandidateScoreGauge
                            score={res.match_score}
                            id={`history-compare-${i}`}
                            compact
                          />
                        </div>
                        <div className="flex-1">
                          <CandidateRadarChart
                            technicalFit={res.technical_fit_score}
                            experienceFit={res.experience_fit_score}
                            velocity={res.velocity_score}
                            contextualFit={res.contextual_fit_score}
                            portfolio={res.portfolio_intensity}
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                            Skills Profile
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(res.candidate.skills || []).map(
                              (skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
                                >
                                  {skill}
                                </span>
                              ),
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-green-600 block mb-2">
                            Strengths
                          </span>
                          <ul className="space-y-2">
                            {(res.core_strengths || []).map(
                              (strength: string, idx: number) => (
                                <li
                                  key={idx}
                                  className="flex gap-2 text-sm text-gray-700"
                                >
                                  <span className="text-green-500 font-bold">
                                    •
                                  </span>
                                  <span>{strength}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>

                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-2">
                            Potential Gaps
                          </span>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {res.potential_gaps}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <Scale className="w-16 h-16 mb-4 text-gray-200" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Select Candidates to Compare
                </h3>
                <p className="text-sm max-w-sm">
                  Choose exactly two candidates from the list on the left to see
                  a detailed side-by-side comparison of their skills, scores,
                  and cultural fit.
                </p>
                <div className="flex gap-4 mt-8">
                  <div
                    className={`w-32 h-40 border-2 border-dashed rounded-2xl flex items-center justify-center ${selected.length > 0 ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}
                  >
                    {selected.length > 0 ? (
                      <Check className="w-8 h-8 text-blue-500" />
                    ) : (
                      <span className="text-gray-300 font-bold text-2xl">
                        1
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-32 h-40 border-2 border-dashed rounded-2xl flex items-center justify-center ${selected.length > 1 ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}
                  >
                    {selected.length > 1 ? (
                      <Check className="w-8 h-8 text-blue-500" />
                    ) : (
                      <span className="text-gray-300 font-bold text-2xl">
                        2
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
