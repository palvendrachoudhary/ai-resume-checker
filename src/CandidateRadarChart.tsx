import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CandidateRadarChartProps {
  technicalFit: number;
  experienceFit: number;
  velocity: number;
  contextualFit: number;
  portfolio: number;
}

export default function CandidateRadarChart({
  technicalFit,
  experienceFit,
  velocity,
  contextualFit,
  portfolio
}: CandidateRadarChartProps) {
  const data = [
    { subject: "Technical", A: technicalFit || 0, B: 10, fullMark: 10 },
    { subject: "Experience", A: experienceFit || 0, B: 10, fullMark: 10 },
    { subject: "Velocity", A: velocity || 0, B: 10, fullMark: 10 },
    { subject: "Contextual", A: contextualFit || 0, B: 10, fullMark: 10 },
    { subject: "Portfolio", A: portfolio || 0, B: 10, fullMark: 10 },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Skill Profile Overlap</h4>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
            <Radar
              name="Job Requirement"
              dataKey="B"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.1}
            />
            <Radar
              name="Candidate"
              dataKey="A"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
