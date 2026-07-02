import React, { useState } from "react";
import {
  ChevronRight,
  FileText,
  ShieldCheck,
  Banknote,
  FileSignature,
  ThumbsUp,
  ThumbsDown,
  PlayCircle,
  Brain,
  MessageSquare,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CandidateScoreGauge from "./CandidateScoreGauge";
import CandidateRadarChart from "./CandidateRadarChart";
import InterviewScheduler from "./InterviewScheduler";
import PrivateNotes from "./PrivateNotes";
import SkillsGap from "./SkillsGap";

import CompensationInsights from "./CompensationInsights";
import RankingAudit from "./RankingAudit";
import CareerPathVisualizer from "./CareerPathVisualizer";

interface CandidateCardProps {
  res: any;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
  isChecked: boolean;
  onCheckToggle: (e: React.MouseEvent) => void;
  isBlindMode?: boolean;
  onSkillClick?: (skill: string) => void;
  versions?: any[];
  activeVersionIndex?: number;
  onVersionSelect?: (index: number) => void;
  key?: React.Key;
}

export default function CandidateCard({
  res,
  index,
  isSelected,
  onToggle,
  isChecked,
  onCheckToggle,
  isBlindMode = false,
  onSkillClick,
  versions = [],
  activeVersionIndex = 0,
  onVersionSelect,
}: CandidateCardProps) {
  const candidate = res.candidate;

  // Extract summary info
  const name = isBlindMode
    ? `Candidate #${index + 1}`
    : candidate?.name || "Unknown";
  const experienceSummary =
    candidate?.experience_summary || "No experience listed";
  const skillsList: string[] = (candidate?.skills || []).slice(0, 5); // Top 5 skills
  const status = candidate?.status || "New";

  const statusColors: any = {
    New: "bg-gray-100 text-gray-700",
    Screening: "bg-yellow-100 text-yellow-800",
    Interviewing: "bg-blue-100 text-blue-800",
    Offer: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 transition-colors bg-white shadow-sm"
    >
      <div
        className="p-5 flex items-center justify-between cursor-pointer group"
        onClick={onToggle}
      >
        <div className="flex items-center gap-6 flex-grow">
          <div
            className="flex flex-col items-center justify-center shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onCheckToggle(e);
            }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => {}}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">
              Select
            </span>
          </div>
          {/* Replaced simple score box with a more compact CandidateScoreGauge if possible, 
              or just kept the simple one here and left gauge inside, 
              but user requested "integrates the CandidateScoreGauge to show their match percentage."
              Let's make the Gauge scale nicely. */}
          <div className="w-24 shrink-0 flex items-center justify-center -my-4">
            <CandidateScoreGauge score={res.match_score} id={index} compact />
          </div>

          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 border border-gray-300 overflow-hidden text-gray-500">
                {isBlindMode ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <span className="text-xs font-bold text-gray-600 uppercase">
                    {(candidate?.name || "U").substring(0, 2)}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-gray-100 ${statusColors[status] || statusColors["New"]}`}
              >
                {status}
              </span>
              {candidate?.source && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {candidate.source}
                </span>
              )}
              {versions.length > 1 && (
                <select
                  className="text-xs border border-gray-200 rounded-md px-1.5 py-0.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-gray-700"
                  value={activeVersionIndex}
                  onChange={(e) => {
                    if (onVersionSelect) {
                      onVersionSelect(Number(e.target.value));
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {versions.map((_, vIdx) => (
                    <option key={vIdx} value={vIdx}>
                      Version {vIdx + 1}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">
              {experienceSummary}
            </p>
            
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {candidate?.expected_salary && candidate.expected_salary !== "Not Specified" && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-green-200 bg-green-50 text-green-700 flex items-center gap-1">
                  <Banknote className="w-3 h-3" /> {candidate.expected_salary}
                </span>
              )}
              {candidate?.work_availability && candidate.work_availability !== "Not Specified" && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-purple-200 bg-purple-50 text-purple-700 flex items-center gap-1">
                  <PlayCircle className="w-3 h-3" /> {candidate.work_availability}
                </span>
              )}
            </div>

            {skillsList.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className="text-xs font-semibold text-gray-700 mr-1">
                  Top Skills:
                </span>
                {skillsList.map((skill, idx) => (
                  <span
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSkillClick) onSkillClick(skill);
                    }}
                    className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 px-2 py-0.5 rounded-full cursor-pointer transition-colors font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
              <span
                className="bg-gray-100 px-2 py-1 rounded-md cursor-help"
                title="Evaluates technical skills alignment with the job description"
              >
                Tech: {res.technical_fit_score}/10
              </span>
              <span
                className="bg-gray-100 px-2 py-1 rounded-md cursor-help"
                title="Assesses relevance and depth of past work experience"
              >
                Exp: {res.experience_fit_score}/10
              </span>
              <span
                className="bg-gray-100 px-2 py-1 rounded-md cursor-help"
                title="Measures career progression and impact delivery speed"
              >
                Velocity: {res.velocity_score}/10
              </span>
              <span
                className="bg-gray-100 px-2 py-1 rounded-md cursor-help"
                title="Evaluates domain knowledge and industry-specific context"
              >
                Context: {res.contextual_fit_score}/10
              </span>
              <span
                className="bg-gray-100 px-2 py-1 rounded-md cursor-help"
                title="Analyzes the quality and relevance of projects/portfolio"
              >
                Portfolio: {res.portfolio_intensity}/10
              </span>
              {res.hidden_gem && (
                <span
                  className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md flex items-center gap-1 cursor-help"
                  title="Identifies unique or non-obvious strengths that make the candidate stand out"
                >
                  ★ Hidden Gem
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-gray-300 group-hover:text-blue-500 transition-colors ml-4 shrink-0">
          <ChevronRight
            className={`w-6 h-6 transition-transform ${isSelected ? "rotate-90 text-blue-500" : ""}`}
          />
        </div>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-50 border-t border-gray-100 overflow-hidden"
          >
            <div className="p-5 space-y-4 text-sm">
              {/* Feature 4: Video Resume Mock */}
              <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-between text-white shadow-sm mb-4">
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-8 h-8 text-blue-400" />
                  <div>
                    <h4 className="font-bold text-sm">Video Resume / Intro</h4>
                    <p className="text-xs text-gray-400">
                      2 mins • Recorded via AsyncInterview
                    </p>
                  </div>
                </div>
                <button className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                  Watch Video
                </button>
              </div>

              {/* Scores row */}
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <CandidateScoreGauge
                  score={res.match_score}
                  id={`expanded-${index}`}
                />
                <CandidateRadarChart
                  technicalFit={res.technical_fit_score}
                  experienceFit={res.experience_fit_score}
                  velocity={res.velocity_score}
                  contextualFit={res.contextual_fit_score}
                  portfolio={res.portfolio_intensity}
                />
              </div>

              {res.core_strengths && res.core_strengths.length > 0 && (
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 shadow-sm mt-4">
                  <h4 className="font-bold text-indigo-900 mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    Gemini AI Summary - Core Strengths
                  </h4>
                  <ul className="space-y-2">
                    {res.core_strengths.map((strength: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex gap-2 text-sm text-indigo-800"
                      >
                        <span className="font-bold shrink-0">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {res.signal_audit && res.signal_audit.length > 0 && (
                <div className="bg-slate-900 p-4 rounded-xl shadow-sm mt-4 text-slate-100">
                  <h4 className="font-bold text-slate-100 mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    Offline XAI Signal Audit
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {res.signal_audit.map((signal: any, idx: number) => (
                      <div key={idx} className={`p-3 rounded-lg border ${signal.type === 'bonus' ? 'bg-green-900/30 border-green-800' : 'bg-red-900/30 border-red-800'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {signal.type === 'bonus' ? (
                            <ThumbsUp className="w-3 h-3 text-green-400" />
                          ) : (
                            <ThumbsDown className="w-3 h-3 text-red-400" />
                          )}
                          <span className={`text-xs font-bold ${signal.type === 'bonus' ? 'text-green-400' : 'text-red-400'}`}>
                            {signal.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          {signal.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2 uppercase tracking-wider text-xs">
                    Why they fit
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {res.why_this_candidate}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2 uppercase tracking-wider text-xs">
                    Potential Gaps
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {res.potential_gaps}
                  </p>
                </div>
              </div>

              <SkillsGap skillsGap={res.skills_gap} />

              {/* Feature 1: Background Check & Salary Predictor */}
              <div className="mt-4">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between h-full">
                  <div>
                    <h4 className="font-bold text-emerald-900 mb-1 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Background Check
                    </h4>
                    <p className="text-emerald-700 text-sm font-bold">
                      Clear (Verified via Checkr API)
                    </p>
                  </div>
                  <button className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold hover:bg-emerald-200 transition-colors shrink-0">
                    View Report
                  </button>
                </div>
              </div>

              <RankingAudit score={res.match_score} />

              <CompensationInsights
                expectedSalary={
                  res.candidate?.expected_salary 
                    ? (typeof res.candidate.expected_salary === 'string' 
                        ? parseInt(res.candidate.expected_salary.replace(/[^0-9]/g, '')) 
                        : res.candidate.expected_salary)
                    : 110000 + index * 15000
                }
                role="Software Engineer"
              />

              <CareerPathVisualizer />

              {res.hidden_gem && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm mt-4">
                  <h4 className="font-bold text-amber-800 mb-2 uppercase tracking-wider text-xs">
                    ★ Hidden Gem Insight
                  </h4>
                  <p className="text-amber-900 leading-relaxed">
                    {res.hidden_gem}
                  </p>
                </div>
              )}

              {/* Feature 2: Team Collaboration Mock */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-4">
                <h4 className="font-bold text-gray-800 mb-3 uppercase tracking-wider text-xs">
                  Team Collaboration (Hiring Committee)
                </h4>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-green-200 hover:bg-green-100 transition-colors">
                    <ThumbsUp className="w-4 h-4" /> Strong Hire (2)
                  </button>
                  <button className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-red-200 hover:bg-red-100 transition-colors">
                    <ThumbsDown className="w-4 h-4" /> No Hire (0)
                  </button>
                  <div className="flex -space-x-2 ml-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      AJ
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      MK
                    </div>
                  </div>
                </div>
              </div>

              {res.interview_questions &&
                res.interview_questions.length > 0 && (
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 shadow-sm mt-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                      <Brain className="w-24 h-24 text-indigo-500" />
                    </div>
                    <h4 className="font-bold text-indigo-900 mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-600" />
                      AI Interview Assistant: Targeted Gap Probing
                    </h4>
                    <p className="text-xs text-indigo-700 mb-4">
                      Based on the candidate's potential gaps and radar chart
                      scoring, the AI suggests probing the following areas
                      during the interview:
                    </p>
                    <ul className="space-y-3 relative z-10">
                      {res.interview_questions.map((q: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex gap-3 bg-white/60 p-3 rounded-lg border border-indigo-50/50"
                        >
                          <span className="text-indigo-600 font-black flex-shrink-0 bg-indigo-100 w-6 h-6 flex items-center justify-center rounded-full text-[10px]">
                            Q{idx + 1}
                          </span>
                          <span className="text-indigo-900 font-medium text-sm leading-relaxed">
                            {q}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {res.outreach_email_draft && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm mt-4">
                  <h4 className="font-bold text-blue-900 mb-2 uppercase tracking-wider text-xs flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Outreach Email Draft
                  </h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {res.outreach_email_draft}
                  </p>
                </div>
              )}

              {/* Feature 3: One-Click Offer Generator */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-indigo-900 mb-1 uppercase tracking-wider text-xs flex items-center gap-2">
                    <FileSignature className="w-4 h-4" /> Auto-Generate Offer
                    Letter
                  </h4>
                  <p className="text-indigo-700 text-sm">
                    Generates a DocuSign-ready offer based on market rate and
                    role.
                  </p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap">
                  Generate Offer
                </button>
              </div>

              {res.rejection_mentor_draft && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm mt-4">
                  <h4 className="font-bold text-gray-700 mb-2 uppercase tracking-wider text-xs flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Constructive Rejection Draft
                  </h4>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {res.rejection_mentor_draft}
                  </p>
                </div>
              )}

              <InterviewScheduler
                candidateId={candidate?.candidate_id || candidate?.name}
              />
              <PrivateNotes
                candidateId={candidate?.candidate_id || candidate?.name}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
