'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Patient, VitalReading, SignalType, SignalRange } from '@/types';
import { formatDate } from '@/lib/format';

interface TimeSeriesChartProps {
  patient: Patient;
  metric: SignalType;
  baselineRange: SignalRange | null;
  color?: string;
  unit?: string;
}

type TimeFilter = '24H' | '7D' | '30D';

export function TimeSeriesChart({ patient, metric, baselineRange, color = 'hsl(var(--chart-1))', unit }: TimeSeriesChartProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7D');

  const data = useMemo(() => {
    const hours = timeFilter === '24H' ? 24 : timeFilter === '7D' ? 168 : 720;
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);

    return patient.history
      .filter((r) => new Date(r.timestamp) >= cutoff)
      .map((r) => ({
        timestamp: r.timestamp,
        value: getReadingValue(r, metric),
      }))
      .filter((d) => d.value != null);
  }, [patient.history, metric, timeFilter]);

  const baselineMid = baselineRange ? (baselineRange.min + baselineRange.max) / 2 : null;

  // Determine anomaly region (where values exceed baseline)
  const anomalyRanges = useMemo(() => {
    if (!baselineRange) return [];
    const ranges: { start: string; end: string }[] = [];
    let inAnomaly = false;
    let anomalyStart: string | null = null;

    for (const point of data) {
      if (point.value == null) continue;
      const isAnomaly = point.value < baselineRange.min || point.value > baselineRange.max;
      if (isAnomaly && !inAnomaly) {
        anomalyStart = point.timestamp;
        inAnomaly = true;
      } else if (!isAnomaly && inAnomaly && anomalyStart) {
        ranges.push({ start: anomalyStart, end: point.timestamp });
        inAnomaly = false;
        anomalyStart = null;
      }
    }
    if (inAnomaly && anomalyStart && data.length > 0) {
      ranges.push({ start: anomalyStart, end: data[data.length - 1].timestamp });
    }
    return ranges;
  }, [data, baselineRange]);

  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 100];
    const values = data.map((d) => d.value).filter((v): v is number => v != null);
    if (values.length === 0) return [0, 100];
    const min = Math.min(...values, baselineRange?.min ?? Infinity);
    const max = Math.max(...values, baselineRange?.max ?? -Infinity);
    const padding = (max - min) * 0.15 || 2;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [data, baselineRange]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {data.length} readings
        </div>
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
          <TabsList className="h-8">
            <TabsTrigger value="24H" className="text-xs px-2.5 py-0.5">24H</TabsTrigger>
            <TabsTrigger value="7D" className="text-xs px-2.5 py-0.5">7D</TabsTrigger>
            <TabsTrigger value="30D" className="text-xs px-2.5 py-0.5">30D</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(v) => formatDate(v)}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            stroke="hsl(var(--border))"
            minTickGap={30}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            stroke="hsl(var(--border))"
            width={45}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid hsl(var(--border))',
              fontSize: '12px',
              background: 'hsl(var(--popover))',
            }}
            labelFormatter={(v) => formatDate(v as string)}
            formatter={(value: number) => [`${value}${unit ? ` ${unit}` : ''}`, 'Value']}
          />
          {baselineRange && baselineMid != null && (
            <>
              <ReferenceArea
                y1={baselineRange.min}
                y2={baselineRange.max}
                fill="hsl(var(--risk-low))"
                fillOpacity={0.08}
                ifOverflow="extendDomain"
              />
              <ReferenceLine
                y={baselineMid}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
                label={{ value: 'Baseline', fontSize: 10, fill: 'hsl(var(--muted-foreground))', position: 'insideTopLeft' }}
              />
            </>
          )}
          {anomalyRanges.map((range, i) => (
            <ReferenceArea
              key={i}
              x1={range.start}
              x2={range.end}
              fill="hsl(var(--risk-high))"
              fillOpacity={0.06}
              ifOverflow="extendDomain"
            />
          ))}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: color, stroke: 'hsl(var(--card))', strokeWidth: 2 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function getReadingValue(reading: VitalReading, metric: SignalType): number | undefined {
  switch (metric) {
    case 'heartRate': return reading.heartRate;
    case 'spo2': return reading.spo2;
    case 'temperature': return reading.temperature;
    case 'bloodPressure': return reading.systolic;
    case 'respiratoryRate': return reading.respiratoryRate;
    case 'activity': return reading.activity;
    case 'sleep': return reading.sleep;
    case 'glucose': return reading.glucose;
    default: return undefined;
  }
}
