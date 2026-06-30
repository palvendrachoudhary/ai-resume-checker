import React from "react";
import { Briefcase, ArrowUpRight, Clock, Award } from "lucide-react";
import { motion } from "motion/react";

interface Role {
  title: string;
  company: string;
  duration: string;
  isPromotion?: boolean;
  highlights?: string[];
}

interface CareerPathVisualizerProps {
  roles?: Role[];
  yearsOfExperience?: number;
}

export default function CareerPathVisualizer({
  roles,
  yearsOfExperience = 5,
}: CareerPathVisualizerProps) {
  // Generate mock roles if not provided, for demo purposes
  const defaultRoles: Role[] = [
    {
      title: "Senior Software Engineer",
      company: "TechNova Inc.",
      duration: "2021 - Present (3 yrs)",
      isPromotion: true,
      highlights: ["Led migration to microservices", "Mentored 3 junior devs"],
    },
    {
      title: "Software Engineer",
      company: "TechNova Inc.",
      duration: "2019 - 2021 (2 yrs)",
      highlights: ["Built core React components", "Optimized DB queries"],
    },
    {
      title: "Junior Developer",
      company: "StartupXYZ",
      duration: "2018 - 2019 (1 yr)",
      highlights: ["Bug fixing and feature development"],
    },
  ];

  const displayRoles = roles && roles.length > 0 ? roles : defaultRoles;

  return (
    <div className="mt-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1">
          <Briefcase className="w-4 h-4 text-gray-500" />
          Career Path Visualizer
        </h4>
        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
          {yearsOfExperience} YOE
        </span>
      </div>

      <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
        {displayRoles.map((role, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="relative"
          >
            {/* Timeline node */}
            <div
              className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${role.isPromotion ? "bg-amber-400" : "bg-gray-300"}`}
            >
              {role.isPromotion && (
                <ArrowUpRight className="w-2 h-2 text-white" />
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-2">
                <h5 className="font-bold text-gray-900 text-sm">
                  {role.title}
                </h5>
                {role.isPromotion && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    <Award className="w-3 h-3" /> Promotion
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                <Clock className="w-3 h-3" />
                {role.duration}
              </div>
            </div>

            <p className="text-xs text-blue-600 font-medium mb-2">
              {role.company}
            </p>

            {role.highlights && role.highlights.length > 0 && (
              <ul className="space-y-1">
                {role.highlights.map((highlight, hIdx) => (
                  <li
                    key={hIdx}
                    className="text-xs text-gray-600 flex items-start gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
