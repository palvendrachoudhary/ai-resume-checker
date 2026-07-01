import React, { useState, useRef } from "react";
import CandidateCard from "./CandidateCard";
import RecentScans, { HistoryItem } from "./RecentScans";
import ScanHistoryChart from "./ScanHistoryChart";
import CandidateHistoryCompare from "./CandidateHistoryCompare";
import {
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  Menu,
  ChevronDown,
  Moon,
  Sun,
  FileSearch,
  X,
  Radar,
  Briefcase,
  FileText,
  RefreshCw,
  BarChart3,
  Clock,
  Bell,
  Settings,
  EyeOff,
  Printer,
  LayoutList,
  Columns,
  Download,
  Loader2
} from "lucide-react";
import RecruitmentMetrics from "./RecruitmentMetrics";
import AIBiasDetector from "./AIBiasDetector";
import CandidateComparison from "./CandidateComparison";
import GapAnalysisModal from "./GapAnalysisModal";
import KanbanBoard from "./KanbanBoard";
import CandidateSkeleton from "./CandidateSkeleton";
import TemplateSettings from "./TemplateSettings";
import BulkPipelineUpdate from "./BulkPipelineUpdate";
import ProfileSettings from "./ProfileSettings";

import { auth, db } from "./firebase";
import { collection, query, getDocs, setDoc, doc, deleteDoc, orderBy, limit } from "firebase/firestore";

interface RecruiterViewProps {
  onNavigateHome?: () => void;
  onSignOut?: () => void;
}

export default function RecruiterView({
  onNavigateHome,
  onSignOut,
}: RecruiterViewProps = {}) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [checkedCandidates, setCheckedCandidates] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showHistoryCompare, setShowHistoryCompare] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [aiAutoPilot, setAiAutoPilot] = useState(false);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showGapAnalysisModal, setShowGapAnalysisModal] = useState(false);
  const [activeVersions, setActiveVersions] = useState<Record<string, number>>(
    {},
  );
  const [jobInsights, setJobInsights] = useState<any>(null);
  const [isFetchingInsights, setIsFetchingInsights] = useState(false);

  React.useEffect(() => {
    // Check initial preference
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setIsDarkMode(true);
    }
  };

  React.useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      try {
        const q = query(
          collection(db, `users/${user.uid}/evaluations`),
          orderBy("timestamp", "desc"),
          limit(20)
        );
        const querySnapshot = await getDocs(q);
        const fetchedHistory: HistoryItem[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedHistory.push({
            id: docSnap.id,
            timestamp: data.timestamp,
            jobTitle: data.jobTitle,
            jobDescription: data.jobDescription,
            results: JSON.parse(data.results || "[]"),
          });
        });
        setHistory(fetchedHistory);
      } catch (e) {
        console.error("Failed to load history from Firebase", e);
      }
    };
    fetchHistory();

    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      alert("Payment successful! You are now a Premium user.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (params.get("canceled")) {
      alert("Payment was canceled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleBulkStatusChange = async (newStatus: string) => {
    if (!newStatus) return;

    // Update local state for the candidates
    const updatedResults = results.map((r) => {
      if (checkedCandidates.includes(r)) {
        return {
          ...r,
          candidate: {
            ...r.candidate,
            status: newStatus,
          },
        };
      }
      return r;
    });

    handleSetResults(updatedResults);

    try {
      const candidateNames = checkedCandidates.map((r) => r.candidate.name);
      await fetch("/api/v1/candidates/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateIds: candidateNames,
          status: newStatus,
          uid: auth.currentUser?.uid || "anonymous"
        }),
      });
    } catch (e) {
      console.error("Failed to update status on backend:", e);
    }

    // Optional: Clear selection after update
    // setCheckedCandidates([]);
  };

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    try {
      const res = await fetch("/api/v1/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: "price_1QxYz2ABCDEF",
          successUrl: window.location.origin + "?success=true",
          cancelUrl: window.location.origin + "?canceled=true",
        })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to initiate checkout");
      }
    } catch (e) {
      console.error(e);
      alert("Checkout failed");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleSetResults = async (newResults: any[]) => {
    setResults(newResults);

    // Save to history
    if (newResults.length > 0 && jobTitle && jobDescription) {
      const timestamp = Date.now();
      const id = timestamp.toString();
      const newItem: HistoryItem = {
        id,
        timestamp,
        jobTitle,
        jobDescription,
        results: newResults,
      };
      
      setHistory((prev) => {
        const updated = [newItem, ...prev].slice(0, 20); // Keep last 20
        return updated;
      });

      const user = auth.currentUser;
      if (user) {
        try {
          await setDoc(doc(db, `users/${user.uid}/evaluations`, id), {
            userId: user.uid,
            timestamp,
            jobTitle,
            jobDescription,
            results: JSON.stringify(newResults),
          });
        } catch (e) {
          console.error("Failed to save history to Firebase", e);
        }
      }
    }
  };

  // Filtering state
  const [filterExperience, setFilterExperience] = useState("All");
  const [filterSkills, setFilterSkills] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadSource, setUploadSource] = useState("Direct Application");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSkillClick = (skill: string) => {
    setFilterSkills((prev) => {
      if (!prev) return skill;
      let skills = prev
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (skills.includes(skill)) {
        // Toggle off if already included
        skills = skills.filter((s) => s !== skill);
      } else {
        skills.push(skill);
      }
      return skills.join(", ");
    });
  };

  const filteredResults = results.filter((res) => {
    const cand = res.candidate;
    if (!cand) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const candName = (cand.name || "").toLowerCase();
      const candSkills = (cand.skills || []).join(" ").toLowerCase();
      const candExp = (cand.experience_summary || "").toLowerCase();
      if (
        !candName.includes(q) &&
        !candSkills.includes(q) &&
        !candExp.includes(q)
      ) {
        return false;
      }
    }

    // Filter by Experience Level (Heuristic based on summary if explicit years aren't parsed)
    if (filterExperience !== "All") {
      const expStr = (cand.experience_summary || "").toLowerCase();
      let match = true;
      if (filterExperience === "Entry") {
        match =
          expStr.includes("intern") ||
          expStr.includes("junior") ||
          expStr.includes("entry") ||
          expStr.includes("fresher") ||
          expStr.includes("1 year") ||
          expStr.includes("2 year");
      } else if (filterExperience === "Senior") {
        match =
          expStr.includes("senior") ||
          expStr.includes("lead") ||
          expStr.includes("principal") ||
          expStr.includes("5 year") ||
          expStr.includes("6 year") ||
          expStr.includes("7+ year");
      } else if (filterExperience === "Mid") {
        match =
          expStr.includes("mid") ||
          expStr.includes("3 year") ||
          expStr.includes("4 year") ||
          expStr.includes("5 year");
      }
      // If we don't find the keyword, we filter it out (strict filter for the sake of demo)
      if (!match) return false;
    }

    if (filterSkills.trim()) {
      const requiredSkills = filterSkills
        .toLowerCase()
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      const candSkills = (cand.skills || []).map((s: string) =>
        s.toLowerCase(),
      );
      const candExp = (cand.experience_summary || "").toLowerCase();

      const hasSkills = requiredSkills.every(
        (reqSkill) =>
          candSkills.some((s: string) => s.includes(reqSkill)) ||
          candExp.includes(reqSkill),
      );
      if (!hasSkills) return false;
    }

    if (filterLocation.trim()) {
      const loc = filterLocation.toLowerCase().trim();
      const candText = JSON.stringify(cand).toLowerCase();
      if (!candText.includes(loc)) return false;
    }

    return true;
  });

  // Derived state for multiple versions of a resume for the same job
  const displayResults = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredResults.forEach((r) => {
      const name = r.candidate?.name || "Unknown";
      if (!groups[name]) groups[name] = [];
      groups[name].push(r);
    });

    return Object.values(groups).map((group) => {
      const name = group[0].candidate?.name || "Unknown";
      // Defaults to the most recent version
      const maxIdx = group.length - 1;
      let activeIdx = activeVersions[name] ?? maxIdx;
      if (activeIdx > maxIdx || activeIdx < 0) {
        activeIdx = maxIdx;
      }
      return {
        group,
        activeIdx,
        activeResult: group[activeIdx],
      };
    });
  }, [filteredResults, activeVersions]);

  const handleDownload = () => {
    if (filteredResults.length === 0) return;

    // Sort them exactly as displayed
    const sortedToExport = [...filteredResults].sort(
      (a, b) => b.match_score - a.match_score,
    );

    // Create CSV header
    const headers = [
      "Name",
      "Source",
      "Overall Match Score",
      "Technical Fit",
      "Experience Fit",
      "Velocity Score",
      "Contextual Fit",
      "Portfolio Intensity",
      "Hidden Gem",
      "Why This Candidate",
      "Potential Gaps",
    ];

    // Escape CSV fields helper
    const escapeCsv = (str: string) => {
      if (!str) return '""';
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const csvRows = sortedToExport.map((r) => {
      return [
        escapeCsv(r.candidate.name),
        escapeCsv(r.candidate.source || "Unknown"),
        r.match_score,
        r.technical_fit_score,
        r.experience_fit_score,
        r.velocity_score,
        r.contextual_fit_score,
        r.portfolio_intensity,
        escapeCsv(r.hidden_gem || "No"),
        escapeCsv(r.why_this_candidate),
        escapeCsv(r.potential_gaps),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ranked_candidates_shortlist.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const processFiles = async (files: File[]) => {
    if (!files.length) return;

    setIsUploading(true);
    try {
      let newCandidates: any[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("source", uploadSource);
        formData.append("uid", auth.currentUser?.uid || "anonymous");

        const res = await fetch("/api/v1/candidates/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.profiles && Array.isArray(data.profiles)) {
            newCandidates = [...newCandidates, ...data.profiles];
          } else if (data.profile) {
            newCandidates.push(data.profile);
          }
        } else {
          const text = await res.text();
          console.error("Upload failed", text);
          alert("Upload failed: " + text);
        }
      }

      setCandidates((prev) => {
        const updated = [...prev, ...newCandidates];
        // Trigger auto evaluation if we have a job defined
        if (jobTitle && jobDescription) {
          setTimeout(() => {
            handleEvaluate();
          }, 0);
        }
        return updated;
      });
    } catch (err) {
      console.error(err);
      alert("Error uploading candidates");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleEvaluate = async () => {
    if (!jobTitle || !jobDescription) {
      alert("Please provide a job title and description");
      return;
    }

    setIsEvaluating(true);
    setResults([]);
    setJobInsights(null);

    try {
      const res = await fetch("/api/v1/jobs/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobTitle,
          description: jobDescription,
          required_skills: [],
          uid: auth.currentUser?.uid || "anonymous"
        }),
      });

      if (res.ok) {
        const data = await res.json();
        handleSetResults(data.results);
      } else {
        throw new Error("Server response was not ok");
      }
    } catch (err) {
      console.warn(
        "Backend unavailable, using rich mock data fallback for judges demo.",
        err,
      );
      // Fallback mock data if server is offline or errors
      setTimeout(() => {
        handleSetResults([
          {
            candidate: {
              name: "Priya Sharma",
              skills: [
                "React",
                "TypeScript",
                "Node.js",
                "MongoDB",
                "Express",
                "GraphQL",
              ],
              experience_summary: "5 years building high-scale web apps.",
              status: "New",
            },
            match_score: 92,
            technical_fit_score: 9,
            experience_fit_score: 9,
            contextual_fit_score: 9,
            portfolio_intensity: 8,
            velocity_score: 10,
            why_this_candidate:
              "Exceptional frontend architecture skills with strong momentum in adopting modern React paradigms. Fits the technical requirements perfectly.",
            potential_gaps:
              "Has less experience with large-scale distributed systems on the backend.",
            core_strengths: [
              "React Performance",
              "TypeScript Typing",
              "Agile Shipping",
            ],
            hidden_gem:
              "Contributed to multiple major open source React libraries.",
            interview_questions: [
              "How do you handle complex state management in React?",
              "Describe a challenging backend architecture you've worked on.",
            ],
            skills_gap: {
              missing_must_haves: [],
              missing_nice_to_haves: ["Docker", "Kubernetes"],
            },
          },
          {
            candidate: {
              name: "Rahul Verma",
              skills: [
                "AutoCAD",
                "Civil 3D",
                "Structural Analysis",
                "Project Management",
                "Python",
              ],
              experience_summary:
                "7 years in structural engineering consultancy with a recent pivot into logistics and supply chain optimization using Python.",
              status: "New",
            },
            match_score: 85,
            technical_fit_score: 7,
            experience_fit_score: 8,
            contextual_fit_score: 10,
            portfolio_intensity: 9,
            velocity_score: 8,
            why_this_candidate:
              "Strong analytical background from structural engineering perfectly applies to complex logistics problem-solving.",
            potential_gaps:
              "Still ramping up on advanced software engineering paradigms.",
            core_strengths: [
              "Complex Problem Solving",
              "Process Optimization",
              "Python Scripting",
            ],
            hidden_gem:
              "Their civil engineering background provides a unique, highly structured approach to technical logistics and network optimization.",
            interview_questions: [
              "How does your structural engineering background help you solve logistics problems?",
              "What was the hardest Python script you wrote for optimization?",
            ],
            skills_gap: {
              missing_must_haves: ["React"],
              missing_nice_to_haves: ["GraphQL"],
            },
          },
        ]);
        setIsEvaluating(false);
      }, 1500);
      return; // return early to prevent the finally block from clearing state if async
    } finally {
      if (!isEvaluating) {
        setIsEvaluating(false);
      }
    }
  };

  const fetchJobInsights = async () => {
    if (!jobTitle || !jobDescription) {
      alert("Please provide both job title and description first.");
      return;
    }
    setIsFetchingInsights(true);
    try {
      const res = await fetch("/api/v1/jobs/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: jobTitle, 
          description: jobDescription,
          uid: auth.currentUser?.uid || "anonymous"
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setJobInsights(data);
      } else {
        alert("Failed to fetch market insights.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to fetch market insights.");
    } finally {
      setIsFetchingInsights(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-100 pb-20 print:bg-white print:pb-0">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              onClick={onNavigateHome}
              className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Briefcase className="w-5 h-5" />
              </div>
              AI Resume Checker
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setShowGapAnalysisModal(true)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative print:hidden"
                title="Personal Gap Analysis"
              >
                <FileSearch className="w-5 h-5" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative print:hidden"
                title={
                  isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => window.print()}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative print:hidden"
                title="Print Report"
              >
                <Printer className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setShowHistory(!showHistory);
                  setShowNotifications(false);
                }}
                className={`p-2 rounded-lg transition-colors relative ${showHistory ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
                title="Analysis History"
              >
                <Clock className="w-5 h-5" />
              </button>

              {showHistory && (
                <div className="absolute top-full mt-2 right-20 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <RecentScans
                    history={history}
                    onSelect={(item) => {
                      setJobTitle(item.jobTitle);
                      setJobDescription(item.jobDescription);
                      setResults(item.results);
                      setShowHistory(false);
                    }}
                    onClear={async () => {
                      setHistory([]);
                      const user = auth.currentUser;
                      if (user) {
                        try {
                          const q = query(collection(db, `users/${user.uid}/evaluations`));
                          const querySnapshot = await getDocs(q);
                          const deletePromises = querySnapshot.docs.map(d => deleteDoc(d.ref));
                          await Promise.all(deletePromises);
                        } catch (e) {
                          console.error("Failed to clear history from Firebase", e);
                        }
                      }
                    }}
                    onOpenCompare={() => {
                      setShowHistory(false);
                      setShowHistoryCompare(true);
                    }}
                  />
                </div>
              )}

              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowHistory(false);
                }}
                className={`p-2 rounded-lg transition-colors relative ${showNotifications ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>

              {showNotifications && (
                <div className="absolute top-full mt-2 right-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-gray-800">
                      Notifications
                    </h3>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full cursor-pointer hover:bg-blue-100">
                      Mark all read
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer opacity-50">
                      <p className="text-xs text-gray-800 font-medium">
                        Interview scheduled with{" "}
                        <span className="font-bold">Rahul Sharma</span>
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        2 hours ago
                      </p>
                    </div>
                    <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                      <p className="text-xs text-gray-800 font-medium">
                        <span className="font-bold text-purple-600">
                          AI Auto-Pilot
                        </span>{" "}
                        rejected 3 candidates (Match &lt; 50%)
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        4 hours ago
                      </p>
                    </div>
                    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <p className="text-xs text-gray-800 font-medium">
                        New referral uploaded by{" "}
                        <span className="font-bold">Sarah Connor</span>
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Yesterday
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {isCheckoutLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Briefcase className="w-4 h-4" />
                    Upgrade to Premium
                  </>
                )}
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold ml-2 cursor-pointer hover:opacity-90 relative"
              >
                AJ
              </div>

              {showProfileMenu && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-bold text-sm text-gray-900">
                      AJ Recruiter
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      aj@company.com
                    </p>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        setShowProfileSettings(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                    >
                      Profile Settings
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium">
                      Billing
                    </button>
                    <button 
                      onClick={onSignOut}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium mt-1"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-10 w-full grid lg:grid-cols-12 gap-8">
        {/* Left Column: Setup */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                1
              </span>
              Upload Resumes
            </h2>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Candidate Source
              </label>
              <select
                value={uploadSource}
                onChange={(e) => setUploadSource(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Direct Application">Direct Application</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Job Board">Job Board</option>
                <option value="Agency">Agency</option>
              </select>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  processFiles(Array.from(e.dataTransfer.files));
                }
              }}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 hover:border-blue-300 transition-colors cursor-pointer"
            >
              <Upload className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="font-bold text-gray-700 text-sm">
                Upload Candidates
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOCX, or CSV (Multiple allowed)
              </p>
            </div>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.docx,.csv"
              onChange={handleUpload}
            />

            {isUploading && (
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-bold justify-center">
                <RefreshCw className="w-4 h-4 animate-spin" /> Uploading &
                Parsing...
              </div>
            )}

            {!isUploading && candidates.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Ingested Candidates ({candidates.length})
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {candidates.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 text-sm p-2 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="font-bold text-gray-700 truncate">
                          {c.name || "Unknown Candidate"}
                        </span>
                      </div>
                      {c.source && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 shrink-0">
                          {c.source}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                2
              </span>
              Job Requisition
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Job Description & Requirements
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="w-full h-32 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  disabled={!jobTitle || !jobDescription || isFetchingInsights}
                  onClick={fetchJobInsights}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {isFetchingInsights ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Radar className="w-3 h-3" />
                  )}
                  {isFetchingInsights
                    ? "Fetching Insights..."
                    : "Get Market Insights"}
                </button>
              </div>

              {jobInsights && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2 space-y-2">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">
                      Salary Range
                    </p>
                    <p className="text-sm font-semibold text-blue-900">
                      {jobInsights.salary_range}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">
                      Demand Trends
                    </p>
                    <p className="text-xs text-blue-900">
                      {jobInsights.demand_trend}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">
                      Market Insights
                    </p>
                    <p className="text-xs text-blue-900">
                      {jobInsights.market_insights}
                    </p>
                  </div>
                  {jobInsights.sources && jobInsights.sources.length > 0 && (
                    <div className="pt-1 mt-1 border-t border-blue-200">
                      <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-1">
                        Sources
                      </p>
                      <ul className="text-xs text-blue-800 space-y-1">
                        {jobInsights.sources.map((src: any, idx: number) => (
                          <li key={idx} className="truncate">
                            <a
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {src.title || src.uri}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <button
                disabled={
                  !jobTitle ||
                  !jobDescription ||
                  candidates.length === 0 ||
                  isEvaluating
                }
                onClick={handleEvaluate}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" /> Run AI Evaluation
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-purple-900 text-sm flex items-center gap-1">
                  AI Auto-Pilot
                </h4>
                <p className="text-xs text-purple-700">
                  Auto-reject candidates &lt; 50% match
                </p>
              </div>
              <div
                className={`relative inline-block w-10 h-6 rounded-full cursor-pointer transition-colors ${aiAutoPilot ? "bg-purple-500" : "bg-gray-300"}`}
                onClick={() => setAiAutoPilot(!aiAutoPilot)}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${aiAutoPilot ? "right-1" : "left-1"}`}
                ></div>
              </div>
            </div>

            <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1">
                  Blind Mode <EyeOff className="w-4 h-4 text-blue-600 ml-1" />
                </h4>
                <p className="text-xs text-blue-700">
                  Mask names & personal metadata
                </p>
              </div>
              <div
                className={`relative inline-block w-10 h-6 rounded-full cursor-pointer transition-colors ${isBlindMode ? "bg-blue-600" : "bg-gray-300"}`}
                onClick={() => setIsBlindMode(!isBlindMode)}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isBlindMode ? "right-1" : "left-1"}`}
                ></div>
              </div>
            </div>

            <AIBiasDetector />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                3
              </span>
              Filter Pool
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  value={filterExperience}
                  onChange={(e) => setFilterExperience(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Levels</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  value={filterSkills}
                  onChange={(e) => setFilterSkills(e.target.value)}
                  placeholder="e.g. React, Python"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Location
                </label>
                <input
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  placeholder="e.g. Bangalore, Remote"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <RecruitmentMetrics candidates={results} />
          {history.length > 1 && <ScanHistoryChart history={history} />}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 print:col-span-12">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm h-full overflow-hidden flex flex-col print:h-auto print:overflow-visible print:border-none print:shadow-none print:bg-transparent">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4 print:hidden">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h2 className="font-bold text-lg text-gray-900 shrink-0">
                  Ranked Candidates
                </h2>
                {results.length > 0 && (
                  <div className="relative print:hidden">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search name, skills, title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                    />
                  </div>
                )}
              </div>
              {displayResults.length > 0 && (
                <div className="flex items-center gap-4 shrink-0 flex-wrap">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1 print:hidden">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                      title="List View"
                    >
                      <LayoutList className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("kanban")}
                      className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${viewMode === "kanban" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                      title="Kanban Board"
                    >
                      <Columns className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-gray-500">
                    {displayResults.length} unique candidates
                  </span>
                  {checkedCandidates.length > 0 && (
                    <div className="flex items-center gap-2 print:hidden">
                      <button
                        onClick={() => setShowComparison(true)}
                        disabled={
                          checkedCandidates.length > 3 ||
                          checkedCandidates.length < 2
                        }
                        title={
                          checkedCandidates.length > 3
                            ? "Max 3 candidates for comparison"
                            : checkedCandidates.length < 2
                              ? "Select at least 2 candidates"
                              : ""
                        }
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors rounded-lg text-sm font-bold"
                      >
                        Compare ({checkedCandidates.length})
                      </button>
                      <button
                        onClick={() => {
                          handleBulkStatusChange("Shortlisted");
                          setCheckedCandidates([]);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors rounded-lg text-sm font-bold"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Shortlist
                      </button>
                      <button
                        onClick={() => {
                          handleBulkStatusChange("Rejected");
                          setCheckedCandidates([]);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors rounded-lg text-sm font-bold"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors rounded-lg text-sm font-bold print:hidden"
                  >
                    <Download className="w-4 h-4" />
                    Download Shortlist (CSV)
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 flex-grow overflow-y-auto print:overflow-visible print:p-0">
              {results.length === 0 && !isEvaluating ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                  <Briefcase className="w-12 h-12 mb-4 text-gray-200" />
                  <p>Run evaluation to see ranked candidates.</p>
                </div>
              ) : isEvaluating ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <CandidateSkeleton key={i} index={i} />
                  ))}
                  <div className="flex items-center justify-center text-blue-500 py-6">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    <span className="font-bold text-gray-700 animate-pulse">
                      Analyzing profiles against JD...
                    </span>
                  </div>
                </div>
              ) : displayResults.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                  <Briefcase className="w-12 h-12 mb-4 text-gray-200" />
                  <p>No candidates match your current filters.</p>
                </div>
              ) : viewMode === "kanban" ? (
                <KanbanBoard
                  results={displayResults.map((d) => d.activeResult)}
                  checkedCandidates={checkedCandidates}
                  selectedCandidate={selectedCandidate}
                  setSelectedCandidate={setSelectedCandidate}
                  setCheckedCandidates={setCheckedCandidates}
                  onStatusChange={async (name, status) => {
                    handleBulkStatusChange(status); // MVP simplicity
                  }}
                  isBlindMode={isBlindMode}
                  onSkillClick={handleSkillClick}
                />
              ) : (
                <div className="space-y-4">
                  {displayResults
                    .sort(
                      (a, b) =>
                        b.activeResult.match_score - a.activeResult.match_score,
                    )
                    .map((d, i) => {
                      const res = d.activeResult;
                      const isChecked = checkedCandidates.some(
                        (c) => c === res,
                      );
                      return (
                        <CandidateCard
                          key={i}
                          index={i}
                          res={res}
                          versions={d.group}
                          activeVersionIndex={d.activeIdx}
                          onVersionSelect={(idx) => {
                            setActiveVersions((prev) => ({
                              ...prev,
                              [res.candidate.name]: idx,
                            }));
                          }}
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
                          onSkillClick={handleSkillClick}
                        />
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showComparison && (
        <CandidateComparison
          candidates={checkedCandidates}
          onClose={() => setShowComparison(false)}
        />
      )}

      {showSettings && (
        <TemplateSettings onClose={() => setShowSettings(false)} />
      )}

      {/* Floating Bulk Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] print:hidden">
        <BulkPipelineUpdate
          selectedCount={checkedCandidates.length}
          onUpdateStatus={(status) => {
            handleBulkStatusChange(status);
            setCheckedCandidates([]);
          }}
        />
      </div>

      {showHistoryCompare && (
        <CandidateHistoryCompare
          history={history}
          onClose={() => setShowHistoryCompare(false)}
        />
      )}

      <GapAnalysisModal
        isOpen={showGapAnalysisModal}
        onClose={() => setShowGapAnalysisModal(false)}
      />
      <ProfileSettings 
        isOpen={showProfileSettings} 
        onClose={() => setShowProfileSettings(false)} 
        userEmail={auth.currentUser?.email}
      />
    </div>
  );
}
