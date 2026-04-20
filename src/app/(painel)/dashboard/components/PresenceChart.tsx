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
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={((value: unknown) => [`${Number(value ?? 0).toFixed(0)}%`, 'Presença']) as any}
          contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
        />
        <ReferenceLine y={75} stroke="hsl(var(--primary))" strokeDasharray="4 2" opacity={0.4} label={{ value: '75%', position: 'right', fontSize: 10 }} />
        <Line
          type="monotone"
          dataKey="taxa"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          dot={{ r: 4, fill: 'hsl(var(--primary))' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
