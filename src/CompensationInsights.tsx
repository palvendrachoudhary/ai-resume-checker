import React, { useState } from "react";
import { Banknote, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CompensationInsightsProps {
  expectedSalary?: number;
  role?: string;
}

export default function CompensationInsights({
  expectedSalary = 135000,
  role = "Software Engineer",
}: CompensationInsightsProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Simulated market data based on role
  const marketData = {
    p25: 110000,
    median: 125000,
    p75: 145000,
    p90: 160000,
    region: "San Francisco, CA (Adjusted)",
    confidence: "High (Based on 1,240 recent offers)",
  };

  const getComparison = () => {
    if (expectedSalary > marketData.p75)
      return {
        status: "high",
        label: "Above Market",
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: TrendingUp,
      };
    if (expectedSalary < marketData.p25)
      return {
        status: "low",
        label: "Below Market",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: TrendingDown,
      };
    return {
      status: "average",
      label: "Within Market Rate",
      color: "text-violet-700",
      bg: "bg-violet-50",
      border: "border-violet-200",
      icon: Minus,
    };
  };

  const comp = getComparison();
  const Icon = comp.icon;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div
      className={`mt-4 rounded-xl border transition-colors ${comp.bg} ${comp.border} shadow-sm overflow-hidden`}
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div>
          <h4
            className={`font-bold ${comp.color} mb-1 uppercase tracking-wider text-[10px] flex items-center gap-1`}
          >
            <Banknote className="w-3 h-3" /> Compensation Insights
          </h4>
          <div className="flex items-center gap-2">
            <p className={`text-sm font-bold text-gray-900`}>
              Expectation: {formatCurrency(expectedSalary)}
            </p>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold bg-white border ${comp.border} ${comp.color} flex items-center gap-1`}
            >
              <Icon className="w-3 h-3" /> {comp.label}
            </span>
          </div>
        </div>
        <button
          className={`text-xs ${comp.color} opacity-70 hover:opacity-100 font-bold transition-opacity`}
        >
          {showDetails ? "Hide Data" : "View Market Data"}
        </button>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-black/5"
          >
            <div className="p-4 bg-white/50 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-gray-700">
                  Regional Benchmark ({marketData.region})
                </span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3" /> {marketData.confidence}
                </span>
              </div>

              <div className="relative pt-6 pb-4">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-300"
                    style={{ width: "25%" }}
                  ></div>
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: "25%" }}
                  ></div>
                  <div
                    className="h-full bg-violet-400"
                    style={{ width: "25%" }}
                  ></div>
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: "25%" }}
                  ></div>
                </div>

                {/* Markers */}
                <div
                  className="absolute top-2 text-[10px] font-medium text-gray-500"
                  style={{ left: "0%" }}
                >
                  {formatCurrency(marketData.p25 - 20000)}
                </div>
                <div
                  className="absolute top-2 text-[10px] font-medium text-gray-500"
                  style={{ left: "25%", transform: "translateX(-50%)" }}
                >
                  {formatCurrency(marketData.p25)} (25th)
                </div>
                <div
                  className="absolute top-2 text-[10px] font-medium text-gray-500"
                  style={{ left: "50%", transform: "translateX(-50%)" }}
                >
                  {formatCurrency(marketData.median)} (Median)
                </div>
                <div
                  className="absolute top-2 text-[10px] font-medium text-gray-500"
                  style={{ left: "75%", transform: "translateX(-50%)" }}
                >
                  {formatCurrency(marketData.p75)} (75th)
                </div>

                {/* Candidate expectation marker */}
                {(() => {
                  const min = marketData.p25 - 20000;
                  const max = marketData.p90 + 20000;
                  let pct = ((expectedSalary - min) / (max - min)) * 100;
                  pct = Math.max(0, Math.min(100, pct));
                  return (
                    <div
                      className="absolute top-7 h-4 w-0.5 bg-gray-900"
                      style={{ left: `${pct}%` }}
                    >
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                        {formatCurrency(expectedSalary)}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
