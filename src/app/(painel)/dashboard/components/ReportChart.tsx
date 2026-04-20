'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export function ReportChart({ data }: { data: { area: string, total: number }[] }) {
   if (data.length === 0) return <div className="text-sm opacity-50 p-4 text-center mt-8">Nenhum dado estatístico disponível.</div>;
   
  return (
    <div className="font-mono">
      <ResponsiveContainer width="100%" height={300}>
         <BarChart data={data} margin={{ top: 20, right: 10, bottom: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="var(--primary)" opacity={0.1} />
            <XAxis 
              dataKey="area" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 9, fill: 'currentColor', opacity: 0.5 }} 
              textAnchor="middle"
            />
            <Tooltip 
               cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
               contentStyle={{ border: '1px solid var(--primary)', borderRadius: '0px', background: 'var(--card)', color: 'var(--foreground)', fontSize: '10px' }}
               itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
            />
            <Bar dataKey="total" fill="var(--primary)" radius={[0, 0, 0, 0]} maxBarSize={40} />
         </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
