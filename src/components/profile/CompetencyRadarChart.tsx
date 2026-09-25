import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { motion } from 'motion/react';
import { CompetencyState, CompetencyLevel, levelMap } from '../../types';

interface CompetencyRadarChartProps {
  competencyStates: CompetencyState[];
  showGlobalBenchmark?: boolean;
  globalAverages?: Record<string, number>;
  highlightedCompetencyId?: string | null;
}

export const CompetencyRadarChart: React.FC<CompetencyRadarChartProps> = ({ 
  competencyStates, 
  showGlobalBenchmark = false, 
  globalAverages,
  highlightedCompetencyId 
}) => {
  const data = competencyStates.map((state) => {
    const sortedEvidence = [...state.evidence].sort((a,b) => b.timestamp - a.timestamp);
    const topLesson = sortedEvidence.find(e => e.type === 'lesson_completed')?.title || 'None';
    
    return {
      subject: state.competency.title,
      level: levelMap[state.level] || 0,
      levelLabel: state.level,
      globalLevel: showGlobalBenchmark && globalAverages ? (globalAverages[state.competency.id] || 0) : 0,
      fullMark: 4,
      id: state.competency.id,
      topLesson,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="font-bold text-white mb-1">{data.subject}</p>
          <p className="text-xs text-slate-300">Score: <span className="font-mono text-blue-400">{data.level} / 4</span> ({data.levelLabel})</p>
          <p className="text-xs text-slate-300">Top Lesson: <span className="font-mono text-emerald-400">{data.topLesson}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      className="h-[300px] w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={(props: any) => {
              const isActive = !highlightedCompetencyId || data[props.index]?.id === highlightedCompetencyId;
              return (
                <text
                  {...props}
                  fill={isActive ? '#cbd5e1' : '#475569'}
                  fontSize={10}
                >
                  {props.payload.value}
                </text>
              );
            }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 4]} tick={false} axisLine={false} />
          <Radar
            name="Competency"
            dataKey="level"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="#3b82f6"
            fillOpacity={highlightedCompetencyId ? 0.1 : 0.3}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
          {showGlobalBenchmark && (
            <Radar
              name="Global Avg"
              dataKey="globalLevel"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="transparent"
              fillOpacity={highlightedCompetencyId ? 0.1 : 0.3}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          )}
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
