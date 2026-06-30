import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import {
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  TrendingUp,
  Users,
  CheckCircle2,
} from "lucide-react";
import CircularProgressChart from "./CircularProgressChart";

interface RecruitmentMetricsProps {
  candidates: any[];
}

export default function RecruitmentMetrics({
  candidates,
}: RecruitmentMetricsProps) {
  const statusCounts = {
    New: 0,
    Screening: 0,
    Interviewing: 0,
    Offer: 0,
    Rejected: 0,
  };

  const sourceCounts: any = {};
  let totalScore = 0;

  candidates.forEach((c) => {
    const status = c.candidate?.status || "New";
    if (statusCounts[status as keyof typeof statusCounts] !== undefined) {
      statusCounts[status as keyof typeof statusCounts]++;
    } else {
      statusCounts["New"]++;
    }

    const source = c.candidate?.source || "Direct Application";
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;

    totalScore += c.match_score || 0;
  });

  const avgScore = candidates.length > 0 ? totalScore / candidates.length : 0;

  const funnelData = [
    { name: "New", count: statusCounts["New"], color: "#9ca3af" },
    { name: "Screening", count: statusCounts["Screening"], color: "#facc15" },
    {
      name: "Interviewing",
      count: statusCounts["Interviewing"],
      color: "#60a5fa",
    },
    { name: "Offer", count: statusCounts["Offer"], color: "#4ade80" },
    { name: "Rejected", count: statusCounts["Rejected"], color: "#f87171" },
  ];

  const pieColors = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"];
  const sourceData = Object.keys(sourceCounts).map((key, index) => ({
    name: key,
    value: sourceCounts[key],
    color: pieColors[index % pieColors.length],
  }));

  // Mock historical data for Area chart
  const historicalData = [
    { name: "Week 1", applicants: 12, hires: 0 },
    { name: "Week 2", applicants: 19, hires: 1 },
    { name: "Week 3", applicants: 15, hires: 0 },
    { name: "Week 4", applicants: 25, hires: 2 },
    {
      name: "Week 5",
      applicants: Math.max(candidates.length, 5),
      hires: statusCounts["Offer"],
    },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mt-6">
      <h2 className="font-bold text-lg mb-6 text-gray-900 flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-600" />
        Advanced Recruitment Analytics
      </h2>

      {candidates.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-sm text-gray-400">
          Run evaluation to see analytics.
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Resume Quality Score */}
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Avg Quality Score
            </h3>
            <div className="flex-1 flex items-center justify-center">
              <CircularProgressChart score={avgScore} title="Avg Score" />
            </div>
          </div>

          {/* Funnel Chart */}
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Pipeline Funnel
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnelData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    width={70}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #f3f4f6",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Source of Hire */}
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" /> Candidate Sources
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Velocity Trend */}
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Velocity & Pipeline
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={historicalData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #f3f4f6",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applicants"
                    stroke="#818cf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorApps)"
                  />
                  <Line
                    type="monotone"
                    dataKey="hires"
                    stroke="#34d399"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
