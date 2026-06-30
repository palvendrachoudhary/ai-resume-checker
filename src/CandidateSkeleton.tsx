import React from "react";
import { motion } from "motion/react";

export default function CandidateSkeleton({ index }: { index: number; key?: string | number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm"
    >
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-6 flex-grow">
          {/* Checkbox Skeleton */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-3 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>

          {/* Score Gauge Skeleton */}
          <div className="w-24 shrink-0 flex items-center justify-center -my-4">
            <div className="w-16 h-16 rounded-full border-4 border-gray-100 bg-gray-50 animate-pulse flex items-center justify-center">
              <div className="w-8 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="flex-grow space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 animate-pulse"></div>
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-100 rounded-full animate-pulse"></div>
            </div>

            <div className="w-3/4 h-4 bg-gray-100 rounded animate-pulse"></div>

            <div className="flex items-center gap-2">
              <div className="w-12 h-4 bg-blue-50 rounded-full animate-pulse"></div>
              <div className="w-16 h-4 bg-blue-50 rounded-full animate-pulse"></div>
              <div className="w-14 h-4 bg-blue-50 rounded-full animate-pulse"></div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-20 h-6 bg-gray-100 rounded-md animate-pulse"></div>
              <div className="w-20 h-6 bg-gray-100 rounded-md animate-pulse"></div>
              <div className="w-24 h-6 bg-gray-100 rounded-md animate-pulse"></div>
              <div className="w-20 h-6 bg-gray-100 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse ml-4 shrink-0"></div>
      </div>
    </motion.div>
  );
}
