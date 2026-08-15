'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Heart,
  Activity,
  Droplet,
  Thermometer,
  Wind,
  Footprints,
  Moon,
  Database,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RiskGauge } from '@/components/risk/risk-gauge';
import { RiskBadge } from '@/components/shared/risk-badge';
import { Disclaimer } from '@/components/shared/disclaimer';
import { ExplainabilityPanel } from '@/components/risk/explainability-panel';
import { BaselineDeviation } from '@/components/risk/baseline-deviation';
import { AnomalyDetection } from '@/components/risk/anomaly-detection-card';
import { RecommendationsCard } from '@/components/risk/recommendations-card';
import { UrgentAlertBanner } from '@/components/risk/urgent-alert-banner';
import { DemoScenarioSelector } from '@/components/patients/demo-scenario-selector';
import { TimeSeriesChart } from '@/components/charts/time-series-chart';
import { usePatients } from '@/components/providers/patient-provider';
import { assessPatient, calculateBaseline } from '@/lib/assessment';
import { SIGNAL_LABELS } from '@/lib/baseline';
import { timeAgo } from '@/lib/format';

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getPatient } = usePatients();
  const patient = getPatient(id);

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Info className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">Patient not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">This patient ID does not exist in the demo dataset.</p>
        <Link href="/patients" className="mt-4">
          <Button variant="outline">Back to Patients</Button>
        </Link>
      </div>
    );
  }

  const assessment = assessPatient(patient);
  const baseline = calculateBaseline(patient);

  const vitalDisplays = [
    { key: 'heartRate' as const, icon: Heart, label: 'Heart Rate', value: patient.current.heartRate, unit: 'BPM', color: 'text-rose-600' },
    { key: 'spo2' as const, icon: Droplet, label: 'SpO₂', value: patient.current.spo2, unit: '%', color: 'text-blue-600' },
    { key: 'temperature' as const, icon: Thermometer, label: 'Temperature', value: patient.current.temperature, unit: '°C', color: 'text-orange-600' },
    { key: 'systolic' as const, icon: Activity, label: 'Blood Pressure', value: patient.current.systolic ? `${patient.current.systolic}/${patient.current.diastolic}` : undefined, unit: 'mmHg', color: 'text-red-600' },
    { key: 'respiratoryRate' as const, icon: Wind, label: 'Resp. Rate', value: patient.current.respiratoryRate, unit: 'rpm', color: 'text-teal-600' },
    { key: 'activity' as const, icon: Footprints, label: 'Activity', value: patient.current.activity, unit: '%', color: 'text-indigo-600' },
    { key: 'sleep' as const, icon: Moon, label: 'Sleep', value: patient.current.sleep, unit: 'h', color: 'text-purple-600' },
    { key: 'glucose' as const, icon: Database, label: 'Glucose', value: patient.current.glucose, unit: 'mg/dL', color: 'text-amber-600' },
  ];

  const chartMetrics = [
    { key: 'heartRate' as const, label: 'Heart Rate', color: 'hsl(347 77% 50%)', unit: 'BPM' },
    { key: 'spo2' as const, label: 'SpO₂', color: 'hsl(217 91% 60%)', unit: '%' },
    { key: 'temperature' as const, label: 'Temperature', color: 'hsl(25 95% 53%)', unit: '°C' },
    { key: 'bloodPressure' as const, label: 'Blood Pressure', color: 'hsl(0 84% 60%)', unit: 'mmHg' },
    { key: 'activity' as const, label: 'Activity', color: 'hsl(243 75% 59%)', unit: '%' },
  ];

  return (
    <div className="space-y-5">
      {/* Breadcrumb / back */}
      <div className="flex items-center gap-3">
        <Link href="/patients">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Patients
          </Button>
        </Link>
      </div>

      {/* Patient header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
            {patient.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>{patient.age} years</span>
              <span className="text-muted-foreground/40">•</span>
              <span>Patient ID: {patient.id}</span>
              <span className="text-muted-foreground/40">•</span>
              <span>{patient.scenario}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <RiskBadge level={assessment.level} />
              {patient.daysOfHistory < 3 && (
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Limited Data
                </Badge>
              )}
            </div>
          </div>
        </div>
        <DemoScenarioSelector currentScenario={patient.scenario} />
      </div>

      {/* Summary banner */}
      <Card className={assessment.level === 'urgent' ? 'border-red-200' : assessment.level === 'high' ? 'border-orange-200' : ''}>
        <CardContent className="flex items-start gap-3 p-4">
          {assessment.level === 'urgent' || assessment.level === 'high' ? (
            <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${assessment.level === 'urgent' ? 'text-red-600' : 'text-orange-600'}`} />
          ) : (
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          )}
          <div>
            <p className={`text-sm font-semibold ${assessment.level === 'urgent' ? 'text-red-700' : assessment.level === 'high' ? 'text-orange-700' : 'text-foreground'}`}>
              {assessment.summary}
            </p>
            {assessment.trendDelta !== 0 && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                {assessment.trendDelta > 0 ? (
                  <><TrendingUp className="h-3 w-3 text-orange-500" /> Risk score increased by {Math.abs(assessment.trendDelta)} points over the last 24 hours</>
                ) : (
                  <><TrendingDown className="h-3 w-3 text-emerald-500" /> Risk score decreased by {Math.abs(assessment.trendDelta)} points over the last 24 hours</>
                )}
              </p>
            )}
            {assessment.level === 'moderate' && assessment.anomalies.length <= 1 && (
              <p className="mt-2 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700">
                Persistent multi-signal patterns receive higher priority than isolated deviations.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Urgent alert banner */}
      <UrgentAlertBanner patient={patient} assessment={assessment} />

      {/* Risk gauge + vitals overview */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-2">
            <RiskGauge score={assessment.score} level={assessment.level} confidence={assessment.confidence} size={200} />
            {/* Confidence bar */}
            <div className="mt-5 w-full">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Prediction Confidence</span>
                <span className="font-semibold tabular-nums">{assessment.confidence}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${assessment.confidence >= 80 ? 'bg-emerald-500' : assessment.confidence >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}
                  style={{ width: `${assessment.confidence}%` }}
                />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {assessment.confidenceExplanation}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Current Vitals</CardTitle>
            <CardDescription className="text-xs">Latest readings • {timeAgo(patient.history[patient.history.length - 1]?.timestamp ?? new Date().toISOString())}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {vitalDisplays.map((vital) => {
                const Icon = vital.icon;
                const isMissing = vital.value == null;
                return (
                  <div key={vital.key} className="rounded-lg border p-3">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-4 w-4 ${vital.color}`} />
                      <span className="text-[11px] font-medium text-muted-foreground">{vital.label}</span>
                    </div>
                    {isMissing ? (
                      <div className="mt-2">
                        <span className="text-xs italic text-muted-foreground/60">Not available</span>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <span className="text-xl font-bold tabular-nums">{vital.value}</span>
                        <span className="ml-1 text-xs text-muted-foreground">{vital.unit}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time-series charts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Time-Series Analysis</CardTitle>
          <CardDescription className="text-xs">Interactive vital-sign trends with baseline reference and anomaly highlighting</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="heartRate">
            <TabsList className="mb-4 flex h-9 flex-wrap gap-1">
              {chartMetrics.map((m) => (
                <TabsTrigger key={m.key} value={m.key} className="text-xs">
                  {m.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {chartMetrics.map((m) => (
              <TabsContent key={m.key} value={m.key}>
                <TimeSeriesChart
                  patient={patient}
                  metric={m.key}
                  baselineRange={m.key === 'bloodPressure' ? baseline.systolic : baseline[m.key]}
                  color={m.color}
                  unit={m.unit}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Baseline deviation + Explainability */}
      <div className="grid gap-5 lg:grid-cols-2">
        <BaselineDeviation patient={patient} baseline={baseline} />
        <ExplainabilityPanel factors={assessment.factors} score={assessment.score} />
      </div>

      {/* Anomaly detection */}
      <AnomalyDetection anomalies={assessment.anomalies} />

      {/* Recommendations */}
      <RecommendationsCard recommendations={assessment.recommendations} />

      <Disclaimer variant="banner" />
    </div>
  );
}
