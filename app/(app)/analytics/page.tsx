'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, AlertTriangle, Eye, Gauge, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatientAssessments, usePatients } from '@/components/providers/patient-provider';
import { SIGNAL_LABELS } from '@/lib/baseline';
import { formatDate } from '@/lib/format';

type TimeFilter = '24H' | '7D' | '30D';

const PIE_COLORS = {
  low: 'hsl(var(--risk-low))',
  moderate: 'hsl(var(--risk-moderate))',
  high: 'hsl(var(--risk-high))',
  urgent: 'hsl(var(--risk-urgent))',
};

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const assessments = usePatientAssessments();
  const { allAlerts } = usePatients();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7D');

  // Risk distribution data
  const distribution = { low: 0, moderate: 0, high: 0, urgent: 0 };
  assessments.forEach(({ assessment }) => distribution[assessment.level]++);

  const distributionData = (['low', 'moderate', 'high', 'urgent'] as const).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: distribution[key],
    key,
  }));

  // Alerts by severity
  const alertsBySeverity = [
    { name: 'Urgent', value: allAlerts.filter((a) => a.severity === 'urgent').length, fill: PIE_COLORS.urgent },
    { name: 'High', value: allAlerts.filter((a) => a.severity === 'high').length, fill: PIE_COLORS.high },
    { name: 'Medium', value: allAlerts.filter((a) => a.severity === 'medium').length, fill: PIE_COLORS.moderate },
  ];

  // Anomalies by vital type
  const anomalyByVital = useMemo(() => {
    const counts: Record<string, number> = {};
    assessments.forEach(({ assessment }) => {
      assessment.anomalies.forEach((a) => {
        const label = SIGNAL_LABELS[a.signal as import('@/types').SignalType] || a.signal;
        counts[label] = (counts[label] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [assessments]);

  // Risk trend over time (simulated - using patient history timestamps)
  const riskTrendData = useMemo(() => {
    const days = timeFilter === '24H' ? 1 : timeFilter === '7D' ? 7 : 30;
    const points = days <= 1 ? 8 : days <= 7 ? 7 : 10;
    const data: { date: string; avgRisk: number; highRisk: number }[] = [];
    for (let i = points - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - Math.floor((i / points) * days));
      // Deterministic simulated trend
      const baseRisk = 42;
      const wave = Math.sin((points - i) * 0.6) * 12;
      const noise = ((i * 7) % 5) - 2;
      const avg = Math.max(15, Math.min(75, Math.round(baseRisk + wave + noise)));
      const high = Math.max(2, Math.round(avg * 0.12 + ((i * 3) % 4)));
      data.push({ date: formatDate(d.toISOString()), avgRisk: avg, highRisk: high });
    }
    return data;
  }, [timeFilter]);

  // Average confidence
  const avgConfidence = Math.round(
    assessments.reduce((sum, { assessment }) => sum + assessment.confidence, 0) / assessments.length
  );

  // Alert resolution rate
  const acknowledgedCount = allAlerts.filter((a) => a.acknowledged).length;
  const resolutionRate = allAlerts.length > 0 ? Math.round((acknowledgedCount / allAlerts.length) * 100) : 0;

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-64 bg-slate-100 rounded" />
          </div>
          <div className="h-10 w-28 bg-slate-200 rounded" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-16 bg-slate-100/60 rounded-lg" />
          <div className="h-16 bg-slate-100/60 rounded-lg" />
          <div className="h-16 bg-slate-100/60 rounded-lg" />
          <div className="h-16 bg-slate-100/60 rounded-lg" />
        </div>
        <div className="h-80 w-full bg-slate-100/40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-muted-foreground">Population-level risk trends and detection performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
            <Sparkles className="mr-1 h-3 w-3" /> Simulated
          </Badge>
          <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
            <TabsList className="h-9">
              <TabsTrigger value="24H" className="text-xs px-3">24H</TabsTrigger>
              <TabsTrigger value="7D" className="text-xs px-3">7D</TabsTrigger>
              <TabsTrigger value="30D" className="text-xs px-3">30D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Avg. Risk Score', value: Math.round(assessments.reduce((s, { assessment }) => s + assessment.score, 0) / assessments.length), icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Anomalies', value: assessments.reduce((s, { assessment }) => s + assessment.anomalies.length, 0), icon: Eye, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Avg. Confidence', value: `${avgConfidence}%`, icon: Gauge, color: 'text-teal-600 bg-teal-50' },
          { label: 'Alert Resolution', value: `${resolutionRate}%`, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">{kpi.value}</div>
                  <div className="text-xs text-muted-foreground">{kpi.label}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Risk trend over time */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Risk Trend Over Time</CardTitle>
          <CardDescription className="text-xs">Average risk score and high-risk patient count over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={riskTrendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" width={40} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
              <Area type="monotone" dataKey="avgRisk" name="Avg Risk" stroke="hsl(var(--chart-1))" strokeWidth={2.5} fill="url(#riskGrad)" />
              <Line type="monotone" dataKey="highRisk" name="High-Risk Patients" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Two-column charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Alerts by severity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Alerts by Severity</CardTitle>
            <CardDescription className="text-xs">Distribution of active alerts across severity levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={alertsBySeverity} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="hsl(var(--card))" strokeWidth={2}>
                  {alertsBySeverity.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs text-muted-foreground">{v}</span>} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Anomalies by vital */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Anomalies by Vital Signal</CardTitle>
            <CardDescription className="text-xs">Which vital signs trigger the most anomaly detections</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={anomalyByVital} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" width={90} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Bar dataKey="value" name="Anomalies" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Patients by risk category + confidence */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Patients by Risk Category</CardTitle>
            <CardDescription className="text-xs">Current distribution across risk levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distributionData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" width={35} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Bar dataKey="value" name="Patients" radius={[4, 4, 0, 0]} barSize={40}>
                  {distributionData.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[entry.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average prediction confidence */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Average Prediction Confidence</CardTitle>
            <CardDescription className="text-xs">Confidence levels across all monitored patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative flex h-36 w-36 items-center justify-center">
                <svg className="-rotate-90" width="144" height="144" viewBox="0 0 144 144">
                  <circle cx="72" cy="72" r="60" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                  <circle
                    cx="72" cy="72" r="60" fill="none"
                    stroke="hsl(var(--chart-2))" strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - avgConfidence / 100)}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold tabular-nums text-emerald-600">{avgConfidence}%</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</span>
                </div>
              </div>
              <p className="mt-4 max-w-xs text-center text-xs text-muted-foreground">
                Confidence reflects data completeness, historical coverage, and signal consistency.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert resolution rate */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Alert Resolution Rate</CardTitle>
          <CardDescription className="text-xs">Percentage of alerts that have been acknowledged by the care team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertsBySeverity.map((sev) => {
              const total = allAlerts.filter((a) => a.severity === sev.name.toLowerCase()).length;
              const acked = allAlerts.filter((a) => a.severity === sev.name.toLowerCase() && a.acknowledged).length;
              const rate = total > 0 ? Math.round((acked / total) * 100) : 0;
              return (
                <div key={sev.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{sev.name} Alerts</span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold tabular-nums text-foreground">{acked}</span> / {total} acknowledged ({rate}%)
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Clinical validation statistics — standard baseline benchmarks
      </p>
    </div>
  );
}
