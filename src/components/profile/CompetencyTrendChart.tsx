import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Mock data generation function to simulate growth
const generateTrendData = () => {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      'Prompt Foundations': 1 + Math.random() * 2,
      'Context Engineering': 0.5 + Math.random() * 2.5,
      'Role Design': 1 + Math.random() * 3,
    });
  }
  return data;
};

export const CompetencyTrendChart: React.FC = () => {
  const data = generateTrendData();

  return (
    <div className="h-[300px] w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
      <h2 className="text-base font-bold text-white mb-4">Competency Growth (30 Days)</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
          <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 4]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
          />
          <Line type="monotone" dataKey="Prompt Foundations" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Context Engineering" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Role Design" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
