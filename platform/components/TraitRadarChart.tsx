import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Define the structure for a single trait data point
interface TraitData {
  subject: string; // Name of the trait dimension
  score: number;   // User's score for this trait (0-100)
  fullMark: number; // Maximum possible score (e.g., 100)
}

// Props for the TraitRadarChart component
interface TraitRadarChartProps {
  data: TraitData[];
  userName?: string;
}

// Mock data for 15 trait dimensions
const mockTraitData: TraitData[] = [
  { subject: 'Openness', score: 80, fullMark: 100 },
  { subject: 'Conscientiousness', score: 75, fullMark: 100 },
  { subject: 'Extraversion', score: 60, fullMark: 100 },
  { subject: 'Agreeableness', score: 85, fullMark: 100 },
  { subject: 'Neuroticism', score: 40, fullMark: 100 }, // Lower is often better for Neuroticism
  { subject: 'Assertiveness', score: 70, fullMark: 100 },
  { subject: 'Empathy', score: 90, fullMark: 100 },
  { subject: 'Creativity', score: 88, fullMark: 100 },
  { subject: 'Resilience', score: 78, fullMark: 100 },
  { subject: 'Adaptability', score: 82, fullMark: 100 },
  { subject: 'Detail-orientation', score: 65, fullMark: 100 },
  { subject: 'Strategic Thinking', score: 77, fullMark: 100 },
  { subject: 'Risk Tolerance', score: 55, fullMark: 100 },
  { subject: 'Independence', score: 72, fullMark: 100 },
  { subject: 'Teamwork', score: 85, fullMark: 100 },
];

const TraitRadarChart: React.FC<TraitRadarChartProps> = ({ data = mockTraitData, userName }) => {
  // Determine the data key for the radar based on whether a userName is provided
  // This allows for future expansion to compare multiple users or datasets if needed
  const radarDataKey = userName ? userName : "score";

  // If userName is provided, we might need to transform data or have a different data structure
  // For now, we assume 'score' is the primary key for the user's own data.

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#B0B0B0" /> {/* Light grey for grid lines */}
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#333', fontSize: 12 }} /> {/* Darker text for labels */}
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#666', fontSize: 10 }} />
        <Radar 
          name={userName || "User Score"} 
          dataKey="score" // Assuming 'score' is always the key for the primary user's data
          stroke="#4CC9F0" // Accent color for the radar line
          fill="#4CC9F0" // Accent color for the radar area fill
          fillOpacity={0.6} 
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', backdropFilter: 'blur(5px)'}}
          labelStyle={{ color: '#3A0CA3', fontWeight: 'bold' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default TraitRadarChart;

