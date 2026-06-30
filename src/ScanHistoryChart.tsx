import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { HistoryItem } from "./RecentScans";

export default function ScanHistoryChart({
  history,
}: {
  history: HistoryItem[];
}) {
  if (!history || history.length < 2) return null;

  // Sort chronologically (oldest to newest)
  const data = [...history]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item, index) => {
      const avgScore = item.results.length
        ? item.results.reduce((acc, curr) => acc + (curr.match_score || 0), 0) /
          item.results.length
        : 0;

      const maxScore = item.results.length
        ? Math.max(...item.results.map((r) => r.match_score || 0))
        : 0;

      return {
        name: `Scan ${index + 1}`,
        date: new Date(item.timestamp).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        avgScore: Math.round(avgScore),
        maxScore: Math.round(maxScore),
        title: item.jobTitle,
      };
    });

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Scan History Trend</h3>
          <p className="text-sm text-gray-500">
            Average & top match scores progression
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              dx={-10}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-gray-800">
                      <p className="font-semibold text-sm mb-1">{data.date}</p>
                      <p className="text-xs text-gray-400 mb-2">{data.title}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        <p className="text-sm font-medium">
                          Avg Score: {data.avgScore}%
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <p className="text-sm font-medium">
                          Top Score: {data.maxScore}%
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="avgScore"
              stroke="#a855f7"
              strokeWidth={3}
              dot={{ r: 4, fill: "#a855f7", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#a855f7", strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="maxScore"
              stroke="#60a5fa"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
        <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100">
          <p className="text-xs text-purple-600 font-medium mb-1">Best Score</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              {Math.max(...data.map((d) => d.maxScore))}
            </span>
            <span className="text-sm text-gray-500">/ 100</span>
          </div>
        </div>
        <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs text-blue-600 font-medium mb-1">
            Avg Score Improvement
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              {(() => {
                const improvement =
                  data[data.length - 1].avgScore - data[0].avgScore;
                return improvement > 0 ? `+${improvement}` : improvement;
              })()}
            </span>
            <span className="text-sm text-gray-500">pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
