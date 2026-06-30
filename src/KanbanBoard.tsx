import React from "react";
import { motion } from "motion/react";
import CandidateCard from "./CandidateCard";

interface KanbanBoardProps {
  results: any[];
  checkedCandidates: any[];
  selectedCandidate: any;
  setSelectedCandidate: (c: any) => void;
  setCheckedCandidates: (fn: (prev: any[]) => any[]) => void;
  onStatusChange: (candidateName: string, newStatus: string) => void;
  isBlindMode?: boolean;
  onSkillClick?: (skill: string) => void;
}

const STAGES = ["New", "Screening", "Interviewing", "Offer", "Rejected"];

export default function KanbanBoard({
  results,
  checkedCandidates,
  selectedCandidate,
  setSelectedCandidate,
  setCheckedCandidates,
  onStatusChange,
  isBlindMode = false,
  onSkillClick,
}: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
      {STAGES.map((stage) => {
        const stageCandidates = results.filter(
          (r) => (r.candidate?.status || "New") === stage,
        );

        return (
          <div
            key={stage}
            className="flex-none w-80 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col max-h-[800px]"
          >
            <div className="p-3 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 rounded-t-2xl">
              <h3 className="font-bold text-gray-700">{stage}</h3>
              <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500">
                {stageCandidates.length}
              </span>
            </div>

            <div className="p-3 space-y-3 overflow-y-auto flex-grow">
              {stageCandidates.map((res, i) => {
                const isChecked = checkedCandidates.some((c) => c === res);
                return (
                  <CandidateCard
                    key={i}
                    index={i}
                    res={res}
                    isSelected={selectedCandidate === res}
                    onToggle={() =>
                      setSelectedCandidate(
                        selectedCandidate === res ? null : res,
                      )
                    }
                    isChecked={isChecked}
                    onCheckToggle={(e) => {
                      e.stopPropagation();
                      if (isChecked) {
                        setCheckedCandidates((prev) =>
                          prev.filter((c) => c !== res),
                        );
                      } else {
                        setCheckedCandidates((prev) => [...prev, res]);
                      }
                    }}
                    isBlindMode={isBlindMode}
                    onSkillClick={onSkillClick}
                  />
                );
              })}
              {stageCandidates.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400 font-medium">
                  No candidates
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
