import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AIBiasDetector() {
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setShowResults(false);
    setTimeout(() => {
      setIsScanning(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <div className="mt-4 bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-100">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-bold text-teal-900 text-sm flex items-center gap-1">
            AI Bias Detector{" "}
            <ShieldAlert className="w-4 h-4 text-teal-600 ml-1" />
          </h4>
          <p className="text-xs text-teal-700">Real-time fairness analysis</p>
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-teal-700 transition-colors disabled:opacity-70 flex items-center gap-1"
        >
          {isScanning ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Fingerprint className="w-3 h-3" />
          )}
          {isScanning ? "Scanning..." : "Scan"}
        </button>
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="overflow-hidden mt-3 pt-3 border-t border-teal-200/50 space-y-2"
          >
            <div className="bg-white/60 p-2 rounded-lg border border-teal-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-teal-900">
                  Gender Parity
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-600">
                Balanced
              </span>
            </div>
            <div className="bg-white/60 p-2 rounded-lg border border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-amber-900">
                  Educational Bias
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                Detected
              </span>
            </div>
            <p className="text-[10px] text-teal-800 leading-tight bg-teal-100/50 p-2 rounded">
              <span className="font-bold">Recommendation:</span> The model is
              favoring "Ivy League" keywords. Consider adjusting keyword weights
              in the Ranking Audit to prioritize skills over institutions.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
