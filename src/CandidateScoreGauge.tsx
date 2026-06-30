import { motion } from "motion/react";

interface CandidateScoreGaugeProps {
  score: number;
  id: string | number;
  compact?: boolean;
}

export default function CandidateScoreGauge({ score, id, compact = false }: CandidateScoreGaugeProps) {
  if (compact) {
    return (
      <div className="relative w-16 h-8 mx-auto overflow-hidden flex-shrink-0">
        <svg className="w-full h-full" viewBox="0 0 100 55">
          <defs>
            <linearGradient id={`score-gradient-compact-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke="#f3f4f6" 
            strokeWidth="15" 
            strokeLinecap="round" 
          />
          <motion.path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke={`url(#score-gradient-compact-${id})`} 
            strokeWidth="15" 
            strokeLinecap="round"
            strokeDasharray="125.66"
            initial={{ strokeDashoffset: 125.66 }}
            animate={{ strokeDashoffset: 125.66 - (125.66 * score) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {/* Pointer / Needle */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: (score / 100) * 180 - 90 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ originX: "50px", originY: "50px" }}
          >
            <polygon points="48,50 52,50 50,15" fill="#1f2937" />
            <circle cx="50" cy="50" r="4" fill="#1f2937" />
          </motion.g>
        </svg>
        <div className="absolute bottom-0 left-0 w-full text-center">
          <span className="text-sm font-black">{score}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Overall Match Score</h4>
      <div className="relative w-64 h-32 mx-auto overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 55">
          <defs>
            <linearGradient id={`score-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" /> {/* Red */}
              <stop offset="50%" stopColor="#eab308" /> {/* Yellow */}
              <stop offset="100%" stopColor="#22c55e" /> {/* Green */}
            </linearGradient>
          </defs>
          {/* Background Arc */}
          <path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke="#f3f4f6" 
            strokeWidth="10" 
            strokeLinecap="round" 
          />
          {/* Foreground Arc (Colored) */}
          <motion.path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke={`url(#score-gradient-${id})`} 
            strokeWidth="10" 
            strokeLinecap="round"
            strokeDasharray="125.66"
            initial={{ strokeDashoffset: 125.66 }}
            animate={{ strokeDashoffset: 125.66 - (125.66 * score) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {/* Pointer / Needle */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: (score / 100) * 180 - 90 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ originX: "50px", originY: "50px" }}
          >
            <polygon points="48,50 52,50 50,15" fill="#1f2937" />
            <circle cx="50" cy="50" r="4" fill="#1f2937" />
          </motion.g>
        </svg>
        <div className="absolute bottom-0 left-0 w-full text-center">
          <span className="text-3xl font-black">{score}</span>
          <span className="text-sm font-bold text-gray-400">/ 100</span>
        </div>
      </div>
    </div>
  );
}
