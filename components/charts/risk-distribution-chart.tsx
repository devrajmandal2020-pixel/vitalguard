'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  low: 'hsl(var(--risk-low))',
  moderate: 'hsl(var(--risk-moderate))',
  high: 'hsl(var(--risk-high))',
  urgent: 'hsl(var(--risk-urgent))',
};

const LABELS = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  urgent: 'Urgent Review',
};

interface RiskDistributionData {
  low: number;
  moderate: number;
  high: number;
  urgent: number;
}

export function RiskDistributionChart({ data }: { data: RiskDistributionData }) {
  const chartData = (['low', 'moderate', 'high', 'urgent'] as const).map((key) => ({
    name: LABELS[key],
    value: data[key],
    key,
  }));

  const total = data.low + data.moderate + data.high + data.urgent;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={2}
          dataKey="value"
          stroke="hsl(var(--card))"
          strokeWidth={2}
        >
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={COLORS[entry.key]} />
          ))}
        </Pie>
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string, _entry, index) => {
            const item = chartData[index];
            return (
              <span className="text-xs text-muted-foreground">
                {value} <span className="font-semibold text-foreground">({item.value})</span>
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
