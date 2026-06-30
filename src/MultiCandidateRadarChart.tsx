import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface MultiCandidateRadarChartProps {
  candidatesData: Array<{
    name: string;
    technicalFit: number;
    experienceFit: number;
    velocity: number;
    contextualFit: number;
    portfolio: number;
  }>;
}

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function MultiCandidateRadarChart({ candidatesData }: MultiCandidateRadarChartProps) {
  const data = [
    { subject: "Technical", fullMark: 10 },
    { subject: "Experience", fullMark: 10 },
    { subject: "Velocity", fullMark: 10 },
    { subject: "Contextual", fullMark: 10 },
    { subject: "Portfolio", fullMark: 10 },
  ];

  candidatesData.forEach((cand, idx) => {
    (data[0] as any)[`cand${idx}`] = cand.technicalFit || 0;
    (data[1] as any)[`cand${idx}`] = cand.experienceFit || 0;
    (data[2] as any)[`cand${idx}`] = cand.velocity || 0;
    (data[3] as any)[`cand${idx}`] = cand.contextualFit || 0;
    (data[4] as any)[`cand${idx}`] = cand.portfolio || 0;
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Tooltip 
            formatter={(value: number, name: string) => {
              // name will be "cand0", "cand1" etc because we used it as dataKey
              const idx = parseInt(name.replace("cand", ""), 10);
              const candName = candidatesData[idx]?.name || name;
              return [value, candName];
            }}
          />
          <Legend 
            formatter={(value) => {
              const idx = parseInt(value.replace("cand", ""), 10);
              return candidatesData[idx]?.name || value;
            }}
          />
          {candidatesData.map((cand, idx) => (
            <Radar
              key={idx}
              name={`cand${idx}`}
              dataKey={`cand${idx}`}
              stroke={colors[idx % colors.length]}
              fill={colors[idx % colors.length]}
              fillOpacity={0.3}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
