'use client';

import Link from 'next/link';
import {
  Users,
  AlertTriangle,
  Bell,
  Eye,
  ArrowRight,
  Activity,
  TrendingUp,
  ShieldCheck,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { RiskDistributionChart } from '@/components/charts/risk-distribution-chart';
import { RiskBadge } from '@/components/shared/risk-badge';
import { Disclaimer } from '@/components/shared/disclaimer';
import { usePatientAssessments, usePatients } from '@/components/providers/patient-provider';
import { timeAgo } from '@/lib/format';

export default function DashboardPage() {
  const assessments = usePatientAssessments();
  const { allAlerts } = usePatients();

  const distribution = { low: 0, moderate: 0, high: 0, urgent: 0 };
  let totalAnomalies = 0;
  assessments.forEach(({ assessment }) => {
    distribution[assessment.level]++;
    totalAnomalies += assessment.anomalies.length;
  });

  // Demo-level KPI numbers (scaled for presentation)
  const totalPatients = 128;
  const highRisk = distribution.high + distribution.urgent;
  const activeAlerts = allAlerts.filter((a) => !a.acknowledged).length;

  const recentAlerts = [...allAlerts]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  const topRiskPatients = [...assessments]
    .sort((a, b) => b.assessment.score - a.assessment.score)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good afternoon, Care Team</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor patient health trends and identify potential deterioration early.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Patients Monitored"
          value={totalPatients}
          icon={Users}
          trend={{ value: '+3', direction: 'up' }}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <KpiCard
          label="High Risk"
          value={highRisk}
          icon={AlertTriangle}
          trend={{ value: '+2', direction: 'up' }}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
        <KpiCard
          label="Active Alerts"
          value={activeAlerts}
          icon={Bell}
          trend={{ value: '+1', direction: 'up' }}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
        <KpiCard
          label="Anomalies Detected"
          value={totalAnomalies}
          icon={Eye}
          trend={{ value: '-5', direction: 'down' }}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
      </div>

      {/* Risk Distribution + Detection Overview */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Risk Distribution</CardTitle>
            <CardDescription className="text-xs">
              {assessments.length} patients in active monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart data={distribution} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Detection Overview</CardTitle>
                <CardDescription className="text-xs">Simulated performance metrics</CardDescription>
              </div>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                <Sparkles className="mr-1 h-3 w-3" /> Demo
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow icon={TrendingUp} label="Sensitivity" value={94} color="bg-emerald-500" />
            <MetricRow icon={ShieldCheck} label="Specificity" value={89} color="bg-blue-500" />
            <MetricRow icon={Gauge} label="False Alert Reduction" value={31} color="bg-indigo-500" suffix="%" />
            <MetricRow icon={Activity} label="Average Confidence" value={92} color="bg-teal-500" />
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Demo / simulated metrics — not clinically validated
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts + Top Risk Patients */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Recent Alerts</CardTitle>
              <CardDescription className="text-xs">Latest risk signals requiring attention</CardDescription>
            </div>
            <Link href="/alerts">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No active alerts</p>
            )}
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50">
                <div
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    alert.severity === 'urgent' ? 'bg-red-500 pulse-ring' :
                    alert.severity === 'high' ? 'bg-orange-500' : 'bg-amber-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase ${
                      alert.severity === 'urgent' ? 'text-red-600' :
                      alert.severity === 'high' ? 'text-orange-600' : 'text-amber-600'
                    }`}>
                      {alert.severity}
                    </span>
                    {alert.acknowledged && (
                      <Badge variant="outline" className="text-[10px] py-0 h-4">Acknowledged</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.patientName} • {timeAgo(alert.timestamp)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Highest Risk Patients</CardTitle>
              <CardDescription className="text-xs">Patients requiring immediate attention</CardDescription>
            </div>
            <Link href="/patients">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {topRiskPatients.map(({ patient, assessment }) => (
              <Link
                key={patient.id}
                href={`/patients/${patient.id}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-sm hover:border-primary/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {patient.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">{patient.scenario}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold tabular-nums ${
                    assessment.level === 'urgent' ? 'text-red-600' :
                    assessment.level === 'high' ? 'text-orange-600' :
                    assessment.level === 'moderate' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {assessment.score}
                  </div>
                  <RiskBadge level={assessment.level} showDot={false} className="text-[10px] py-0" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Disclaimer variant="banner" />
    </div>
  );
}

function MetricRow({ icon: Icon, label, value, color, suffix = '%' }: { icon: React.ElementType; label: string; value: number; color: string; suffix?: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <span className="font-semibold tabular-nums">{value}{suffix}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
