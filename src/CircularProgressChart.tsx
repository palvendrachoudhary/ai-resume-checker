import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface CircularProgressChartProps {
  score: number;
  title?: string;
  size?: number;
  strokeWidth?: number;
}

export default function CircularProgressChart({
  score,
  title = "Score",
  size = 140,
  strokeWidth = 12,
}: CircularProgressChartProps) {
  const data = [
    { name: "Score", value: score },
    { name: "Remaining", value: 100 - score },
  ];

  const getColor = (value: number) => {
    if (value >= 80) return "#10B981"; // emerald-500
    if (value >= 60) return "#F59E0B"; // amber-500
    return "#EF4444"; // red-500
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center relative w-full h-full min-h-[160px]">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={70}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
            cornerRadius={strokeWidth / 2}
          >
            <Cell key="cell-0" fill={color} />
            <Cell key="cell-1" fill="#f3f4f6" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-3xl font-black" style={{ color }}>
          {Math.round(score)}
        </span>
        {title && (
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">
            {title}
          </span>
        )}
      </div>
    </div>
  );
}
