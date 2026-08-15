'use client';

import { useState, useEffect } from 'react';
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
  Gauge,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { MedicalReportsCard } from '@/components/patients/medical-reports-card';
import { CarePlanCard } from '@/components/patients/care-plan-card';

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'clinician' | 'patient'>('clinician');
  useEffect(() => {
    setMounted(true);
  }, []);

  const { getPatient } = usePatients();
  const patient = getPatient(id);

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Info className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">Patient not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">This patient ID does not exist in the patient database.</p>
        <Link href="/patients" className="mt-4">
          <Button variant="outline">Back to Patients</Button>
        </Link>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-6 w-20 bg-slate-200 rounded" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="h-8 w-64 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-96 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="h-16 bg-slate-100/50 rounded-xl" />
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="h-64 bg-slate-100/50 rounded-xl" />
          <div className="lg:col-span-2 h-64 bg-slate-100/50 rounded-xl" />
        </div>
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
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Risk Assessment</CardTitle>
            <Badge variant="outline" className={`text-[10px] font-bold uppercase ${
              assessment.alertTier === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
              assessment.alertTier === 'clinical' ? 'bg-orange-50 text-orange-700 border-orange-200' :
              'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {assessment.alertTier}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-2">
            <RiskGauge score={assessment.score} level={assessment.level} confidence={assessment.confidence} size={180} />
            
            {/* Extended Hard Mode Meters */}
            <div className="mt-4 w-full space-y-3.5 border-b pb-4">
              {/* Confidence Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5" /> Prediction Confidence
                  </span>
                  <span className="font-bold tabular-nums">{assessment.confidence}%</span>
                </div>
                <Progress value={assessment.confidence} className="h-1.5" />
              </div>

              {/* Data Completeness Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1">
                    <Database className="h-3.5 w-3.5" /> Data Completeness
                  </span>
                  <span className="font-bold tabular-nums">{assessment.dataCompleteness}%</span>
                </div>
                <Progress value={assessment.dataCompleteness} className="h-1.5" />
              </div>

              {/* Historical Coverage */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Historical Coverage
                </span>
                <span className="font-bold text-foreground flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    assessment.historicalCoverageText.startsWith('High') ? 'bg-emerald-500' : 
                    assessment.historicalCoverageText.startsWith('Moderate') ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  {assessment.historicalCoverageText} ({assessment.historicalCoverageDays}d)
                </span>
              </div>

              {/* Baseline indicator */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">Personalized Baseline</span>
                <span className={`font-bold ${assessment.isPersonalBaselineUsed ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {assessment.isPersonalBaselineUsed ? 'Active (Personal)' : 'Unavailable (Generic)'}
                </span>
              </div>
            </div>

            {/* View Toggle */}
            <div className="mt-4 w-full space-y-3">
              <div className="flex bg-muted/60 rounded-lg p-0.5 w-full">
                <button
                  onClick={() => setViewMode('clinician')}
                  className={`text-[10px] font-semibold flex-1 py-1 rounded-md transition-colors ${
                    viewMode === 'clinician' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Clinician View
                </button>
                <button
                  onClick={() => setViewMode('patient')}
                  className={`text-[10px] font-semibold flex-1 py-1 rounded-md transition-colors ${
                    viewMode === 'patient' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Patient View
                </button>
              </div>

              {viewMode === 'clinician' ? (
                <div className="space-y-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {assessment.confidenceExplanation}
                  </p>
                  
                  {/* Why was I alerted box */}
                  <div className="border rounded-lg overflow-hidden text-[11px] bg-slate-50/50">
                    <div className="bg-slate-100 border-b p-2 font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-700">
                      <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                      "Why was I alerted?" Logic
                    </div>
                    <div className="p-2 space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>Alert Threshold:</span>
                        <span className="font-semibold">{assessment.alertTier === 'urgent' ? 85 : 80}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk / Confidence:</span>
                        <span className="font-semibold">{assessment.score} / {assessment.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Anomalies:</span>
                        <span className="font-semibold">{assessment.anomalies.length} signals</span>
                      </div>
                      <p className="mt-1.5 pt-1.5 border-t text-[10px] italic leading-snug">
                        {assessment.alertReason}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs leading-normal text-slate-700 bg-white border border-primary/10 rounded-lg p-3 space-y-2">
                  <p className="italic font-medium">"{assessment.patientTranslation}"</p>
                  <p className="text-[9px] text-muted-foreground leading-snug border-t pt-2">
                    * Patient Translation Mode: The system is checking your metrics against your usual parameters. It does not diagnose diseases or prescribe treatment.
                  </p>
                </div>
              )}
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

      {/* Medical Reports & Care Plan / Simulation Grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MedicalReportsCard patient={patient} />
        </div>
        <div className="lg:col-span-1">
          <CarePlanCard patient={patient} />
        </div>
      </div>

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
