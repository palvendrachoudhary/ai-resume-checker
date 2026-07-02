import React from "react";
import {
  PhoneCall,
  Gift,
  XCircle,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BulkPipelineUpdateProps {
  selectedCount: number;
  onUpdateStatus: (status: string) => void;
}

export default function BulkPipelineUpdate({
  selectedCount,
  onUpdateStatus,
}: BulkPipelineUpdateProps) {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex items-center gap-2 bg-gray-900 text-white p-1.5 rounded-xl shadow-lg border border-gray-800 relative z-50"
      >
        <div className="px-3 border-r border-gray-700">
          <span className="text-xs font-bold text-gray-300">
            <span className="text-white bg-blue-600 px-1.5 py-0.5 rounded-md mr-1">
              {selectedCount}
            </span>{" "}
            Selected
          </span>
        </div>

        <div className="flex items-center gap-1 px-1">
          <button
            onClick={() => onUpdateStatus("Screening")}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors"
            title="Move to Screening"
          >
            <PhoneCall className="w-3.5 h-3.5 text-blue-400" />{" "}
            <span className="hidden sm:inline">Screen</span>
          </button>
          <button
            onClick={() => onUpdateStatus("Interviewing")}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors"
            title="Move to Interviewing"
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-400" />{" "}
            <span className="hidden sm:inline">Interview</span>
          </button>
          <button
            onClick={() => onUpdateStatus("Offer")}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors"
            title="Make Offer"
          >
            <Gift className="w-3.5 h-3.5 text-emerald-400" />{" "}
            <span className="hidden sm:inline">Offer</span>
          </button>
          <div className="w-px h-4 bg-gray-700 mx-1"></div>
          <button
            onClick={() => onUpdateStatus("Rejected")}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-500/20 text-red-300 rounded-lg text-xs font-medium transition-colors"
            title="Reject Candidates"
          >
            <XCircle className="w-3.5 h-3.5" />{" "}
            <span className="hidden sm:inline">Reject</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
