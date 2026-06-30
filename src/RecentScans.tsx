import React from "react";
import { Clock, ChevronRight, Trash2, Scale } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface HistoryItem {
  id: string;
  timestamp: number;
  jobTitle: string;
  jobDescription: string;
  results: any[];
}

interface RecentScansProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onOpenCompare?: () => void;
}

export default function RecentScans({
  history,
  onSelect,
  onClear,
  onOpenCompare,
}: RecentScansProps) {
  if (history.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
        <p className="text-sm font-medium">No recent scans yet</p>
        <p className="text-xs mt-1">
          Evaluations will be saved here automatically.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-800">Recent Scans</h3>
          <button
            onClick={onClear}
            className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full cursor-pointer hover:bg-red-100 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
        {onOpenCompare && (
          <button
            onClick={onOpenCompare}
            className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors rounded-xl text-xs font-bold"
          >
            <Scale className="w-4 h-4" /> Compare Historical Candidates
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        <AnimatePresence>
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onClick={() => onSelect(item)}
              className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.jobTitle || "Untitled Job"}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {new Date(item.timestamp).toLocaleString()} •{" "}
                    {item.results.length} Candidates
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
