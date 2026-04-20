'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface PresenceDataPoint {
  label: string;
  taxa: number;
}

export function PresenceChart({ data }: { data: PresenceDataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
        Nenhuma reunião registrada ainda.
      </div>
    );
  }

  return (
    <div className="font-mono">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 2" className="stroke-primary/10" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: 'currentColor', opacity: 0.5 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 9, fill: 'currentColor', opacity: 0.5 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value) => [`${Number(value ?? 0).toFixed(0)}%`, 'PRESENCE_TX']}
            contentStyle={{ border: '1px solid var(--primary)', borderRadius: '0px', background: 'var(--card)', color: 'var(--foreground)', fontSize: '10px' }}
            itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
          />
          <ReferenceLine
            y={75}
            stroke="var(--danger)"
            strokeDasharray="3 3"
            label={{ value: 'CRITICAL_75%', position: 'right', fontSize: 8, fill: 'var(--danger)', fontWeight: 'bold' }}
          />
          <Line
            type="stepAfter"
            dataKey="taxa"
            stroke="var(--primary)"
            strokeWidth={1.5}
            dot={{ r: 2, fill: 'var(--primary)', strokeWidth: 0 }}
            activeDot={{ r: 4, fill: 'var(--primary)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
