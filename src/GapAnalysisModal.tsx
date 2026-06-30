import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Wand2,
  Printer,
} from "lucide-react";

interface GapAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GapAnalysisModal({
  isOpen,
  onClose,
}: GapAnalysisModalProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState(""); // if user pastes text instead
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [editingCheck, setEditingCheck] = useState<string | null>(null);
  const [editResults, setEditResults] = useState<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!jobDescription || (!resumeFile && !resumeText)) {
      alert(
        "Please provide both a job description and a resume (file or text).",
      );
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);

      if (resumeFile) {
        formData.append("file", resumeFile);
      } else {
        // If it's pasted text, we create a blob and append it as a file
        const blob = new Blob([resumeText], { type: "text/plain" });
        formData.append("file", blob, "pasted_resume.txt");
      }

      const res = await fetch("/api/v1/resume/check", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        throw new Error("Failed to analyze");
      }
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSmartEdit = async (check: any, checkId: string) => {
    setEditingCheck(checkId);
    try {
      const res = await fetch("/api/v1/resume/smart-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finding: check,
          jobDescription,
          suggestion: check.suggestion,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEditResults((prev) => ({ ...prev, [checkId]: data }));
      } else {
        throw new Error("Failed to generate smart edit");
      }
    } catch (error) {
      console.error(error);
      alert("Smart Edit failed. Please try again.");
    } finally {
      setEditingCheck(null);
    }
  };

  if (!isOpen) return null;

  const renderStatusIcon = (status: string) => {
    if (status === "pass")
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === "warning")
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Personal Gap Analysis
            </h2>
            <p className="text-sm text-gray-500">
              Compare your resume against specific job requirements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {result && (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors print:hidden"
              >
                <Printer className="w-4 h-4" />
                Export PDF
              </button>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors print:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          {/* Left Column: Input */}
          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Target Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job requirements and description here..."
                className="w-full h-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Your Resume
              </label>

              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center mb-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.txt,.csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setResumeFile(e.target.files[0]);
                      setResumeText(""); // Clear text if file is uploaded
                    }
                  }}
                />

                {resumeFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <p className="text-sm font-bold text-gray-800">
                      {resumeFile.name}
                    </p>
                    <button
                      onClick={() => setResumeFile(null)}
                      className="text-xs text-red-500 font-medium hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">
                      Upload your resume (PDF/TXT)
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 mt-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm"
                    >
                      Browse Files
                    </button>
                  </div>
                )}
              </div>

              {!resumeFile && (
                <div>
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">
                      Or paste text
                    </span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume text here..."
                    className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={
                isAnalyzing || !jobDescription || (!resumeFile && !resumeText)
              }
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing Match...
                </>
              ) : (
                "Run Gap Analysis"
              )}
            </button>
          </div>

          {/* Right Column: Output */}
          <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-100 overflow-y-auto">
            {result ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                    <p className="text-sm text-gray-500 font-medium mb-1">
                      Overall Match
                    </p>
                    <p className="text-3xl font-black text-gray-900">
                      {result.overall_score || 0}%
                    </p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
                      <div
                        className="bg-[#00f2fe] h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${result.overall_score || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                    <p className="text-sm text-gray-500 font-medium mb-1">
                      ATS Readability
                    </p>
                    <p className="text-3xl font-black text-gray-900">
                      {result.ats_parse_rate || 0}%
                    </p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${result.ats_parse_rate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {result.categories &&
                  result.categories.map((category: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                    >
                      <div className="bg-gray-100/50 px-4 py-3 border-b border-gray-200">
                        <h4 className="font-bold text-gray-800 text-sm">
                          {category.name}
                        </h4>
                      </div>
                      <div className="p-4 space-y-4">
                        {category.checks?.map((check: any, cIdx: number) => (
                          <div key={cIdx} className="flex gap-3">
                            <div className="mt-0.5">
                              {renderStatusIcon(check.status)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {check.name}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {check.feedback}
                              </p>
                              {check.suggestion && (
                                <p className="text-xs text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded-md inline-block">
                                  Tip: {check.suggestion}
                                </p>
                              )}

                              <div className="mt-2">
                                {editResults[`${idx}-${cIdx}`] ? (
                                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                                    <p className="text-sm font-semibold text-purple-900 mb-1">
                                      AI Suggestion
                                    </p>
                                    <p className="text-sm text-gray-800 mb-2">
                                      {
                                        editResults[`${idx}-${cIdx}`]
                                          .rewritten_text
                                      }
                                    </p>
                                    <p className="text-xs text-purple-600">
                                      <span className="font-bold">Why:</span>{" "}
                                      {
                                        editResults[`${idx}-${cIdx}`]
                                          .explanation
                                      }
                                    </p>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleSmartEdit(check, `${idx}-${cIdx}`)
                                    }
                                    disabled={editingCheck === `${idx}-${cIdx}`}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-md transition-colors disabled:opacity-50"
                                  >
                                    {editingCheck === `${idx}-${cIdx}` ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Wand2 className="w-3.5 h-3.5" />
                                    )}
                                    Smart Edit
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium text-gray-500">
                  No analysis results yet.
                </p>
                <p className="text-sm mt-2 max-w-[200px] mx-auto">
                  Fill in the details and run the analysis to see your gap
                  report.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
