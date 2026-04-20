'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export function ReportChart({ data }: { data: { area: string, total: number }[] }) {
   if (data.length === 0) return <div className="text-sm opacity-50 p-4 text-center mt-8">Nenhum dado estatístico disponível.</div>;
   
   return (
      <ResponsiveContainer width="100%" height={300}>
         <BarChart data={data} margin={{ top: 20, right: 10, bottom: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis dataKey="area" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.7 }} />
            <Tooltip 
               cursor={{ fill: 'var(--muted)' }} 
               contentStyle={{ borderRadius: '8px', background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} 
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} maxBarSize={60} />
         </BarChart>
      </ResponsiveContainer>
   );
}
