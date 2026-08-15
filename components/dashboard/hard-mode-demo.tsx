'use client';

import { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  TrendingDown,
  Database,
  Gauge,
  CheckCircle2,
  FileText,
  User,
  Heart,
  Droplet,
  Thermometer,
  Activity as VitalsIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface HardModeDemoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEMO_SCENARIOS = [
  {
    id: 'PT-10488',
    name: 'Rahul Verma',
    label: 'Isolated Signal (False Alarm)',
    risk: 39,
    confidence: 94,
    completeness: 90,
    coverage: 'Moderate (12 days)',
    status: 'Monitor',
    statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
    signals: ['heartRate'],
    vitals: { hr: 95, spo2: 97, temp: 36.8, bp: '121/77' },
    clinicianReason: 'An isolated heart rate spike (95 BPM) was detected without persistence or additional abnormal signals. Emergency alert suppressed.',
    patientReason: 'A single slightly unusual health reading was noted, which is normal. The system is monitoring for any continuing pattern.',
    metrics: {
      persistent: 1,
      independent: 1,
      threshold: 80,
      baselineUsed: 'Yes (Personal)'
    }
  },
  {
    id: 'PT-10486',
    name: 'Vikram Mehta',
    label: 'Missing Parameters (Limited Data)',
    risk: 68,
    confidence: 54,
    completeness: 61,
    coverage: 'Limited (2 days)',
    status: 'Limited Data / Monitor',
    statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
    signals: ['heartRate', 'spo2'],
    vitals: { hr: 90, spo2: 92, temp: 37.6, bp: 'Not available' },
    clinicianReason: 'Potential deterioration pattern present (HR 90, SpO₂ 92%), but short historical coverage (2 days) and missing blood pressure logs reduce confidence.',
    patientReason: 'Vitals show some variations, but because we only have 2 days of logs and are missing blood pressure data, the system recommends regular monitoring before concluding.',
    metrics: {
      persistent: 2,
      independent: 2,
      threshold: 80,
      baselineUsed: 'No (Population Fallback)'
    }
  },
  {
    id: 'PT-10482',
    name: 'Aarav Sharma',
    label: 'True Early Warning (High Confidence)',
    risk: 82,
    confidence: 91,
    completeness: 92,
    coverage: 'High (30 days)',
    status: 'Clinical Review',
    statusColor: 'bg-orange-50 text-orange-700 border-orange-200',
    signals: ['heartRate', 'spo2', 'temperature', 'bloodPressure', 'activity'],
    vitals: { hr: 94, spo2: 94, temp: 37.7, bp: '142/90' },
    clinicianReason: 'Alert triggered because risk score exceeded the clinical-review threshold (80) and the pattern was persistent across multiple independent signals.',
    patientReason: 'Several recent health measurements are different from your usual pattern. The system recommends discussing these changes with a qualified healthcare professional.',
    metrics: {
      persistent: 4,
      independent: 4,
      threshold: 80,
      baselineUsed: 'Yes (Personal)'
    }
  },
  {
    id: 'PT-10485',
    name: 'Ananya Singh',
    label: 'Urgent Deterioration (Severe Pattern)',
    risk: 91,
    confidence: 95,
    completeness: 96,
    coverage: 'High (30+ days)',
    status: 'Urgent Review',
    statusColor: 'bg-red-50 text-red-700 border-red-200',
    signals: ['heartRate', 'spo2', 'temperature', 'bloodPressure', 'activity', 'respiratoryRate'],
    vitals: { hr: 110, spo2: 86, temp: 39.0, bp: '165/105' },
    clinicianReason: 'Urgent alert triggered. Multiple high-severity signals (tachycardia 110 BPM, desaturation 86%, fever 39°C) show high persistence with complete history.',
    patientReason: 'Several recent health measurements are significantly different from your usual pattern. The system recommends discussing these changes with a qualified healthcare professional urgently.',
    metrics: {
      persistent: 6,
      independent: 5,
      threshold: 85,
      baselineUsed: 'Yes (Personal)'
    }
  }
];

export function HardModeDemo({ open, onOpenChange }: HardModeDemoProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'clinician' | 'patient'>('clinician');
  
  const current = DEMO_SCENARIOS[selectedIdx];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            Upchar AI — Hard Mode Performance Audit
          </DialogTitle>
          <DialogDescription className="text-xs">
            Performance Audit Console: Verify isolated signal suppression, missing data handling, and personalized baseline vs. fallback logic.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4">
          {/* Left Navigation List */}
          <div className="md:col-span-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Select Patient Profile
            </span>
            {DEMO_SCENARIOS.map((scen, idx) => (
              <button
                key={scen.id}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-semibold flex flex-col gap-1 ${
                  selectedIdx === idx
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-muted hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{scen.name}</span>
                  <Badge variant="outline" className={`text-[9px] font-bold uppercase py-0 px-1 border ${
                    selectedIdx === idx ? 'border-primary/45 bg-primary/10' : ''
                  }`}>
                    {scen.id}
                  </Badge>
                </div>
                <span className="text-[10px] font-normal leading-tight opacity-90 truncate">
                  {scen.label}
                </span>
              </button>
            ))}
            
            <div className="rounded-lg bg-accent/40 border p-3 mt-4 space-y-1.5">
              <span className="text-[10px] font-bold text-foreground block">Audit Verification:</span>
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Compare <strong>Rahul</strong> (suppressed isolated HR spike) vs. <strong>Vikram</strong> (missing BP penalty) vs. <strong>Aarav</strong> and <strong>Ananya</strong> (true multi-signal notifications).
              </p>
            </div>
          </div>

          {/* Right Detailed Dashboard */}
          <div className="md:col-span-8 space-y-4">
            {/* Vitals Overview */}
            <div className="grid grid-cols-4 gap-2">
              <Card className="p-2 text-center bg-muted/20 border-muted">
                <span className="text-[9px] text-muted-foreground font-semibold uppercase block">Heart Rate</span>
                <span className="text-sm font-bold text-rose-600 block mt-1">{current.vitals.hr} <span className="text-[9px] font-normal text-muted-foreground">BPM</span></span>
              </Card>
              <Card className="p-2 text-center bg-muted/20 border-muted">
                <span className="text-[9px] text-muted-foreground font-semibold uppercase block">SpO₂</span>
                <span className="text-sm font-bold text-blue-600 block mt-1">{current.vitals.spo2}%</span>
              </Card>
              <Card className="p-2 text-center bg-muted/20 border-muted">
                <span className="text-[9px] text-muted-foreground font-semibold uppercase block">Temp</span>
                <span className="text-sm font-bold text-orange-600 block mt-1">{current.vitals.temp}°C</span>
              </Card>
              <Card className="p-2 text-center bg-muted/20 border-muted">
                <span className="text-[9px] text-muted-foreground font-semibold uppercase block">BP</span>
                <span className="text-sm font-bold text-red-600 block mt-1 truncate">{current.vitals.bp}</span>
              </Card>
            </div>

            {/* Meters Panel */}
            <Card className="border-primary/10">
              <CardContent className="p-4 space-y-3.5">
                {/* Risk Gauge */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold flex items-center gap-1">
                      <ShieldAlert className="h-4 w-4 text-primary" /> Risk Score
                    </span>
                    <span className="font-bold text-foreground">{current.risk}/100</span>
                  </div>
                  <Progress value={current.risk} className="h-2.5" />
                </div>

                {/* Grid for Confidence and Completeness */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-muted-foreground flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5" /> Confidence
                      </span>
                      <span className="font-bold text-foreground">{current.confidence}%</span>
                    </div>
                    <Progress value={current.confidence} className="h-1.5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-muted-foreground flex items-center gap-1">
                        <Database className="h-3.5 w-3.5" /> Completeness
                      </span>
                      <span className="font-bold text-foreground">{current.completeness}%</span>
                    </div>
                    <Progress value={current.completeness} className="h-1.5" />
                  </div>
                </div>

                {/* Historical Coverage */}
                <div className="flex items-center justify-between border-t pt-2.5 text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> Historical Coverage:
                  </span>
                  <span className="font-bold flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${
                      current.coverage.startsWith('High') ? 'bg-emerald-500' : current.coverage.startsWith('Moderate') ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    {current.coverage}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Alert Status Card */}
            <Card className="border bg-slate-50/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Triggered Notification Status
                  </span>
                  <Badge className={`text-[10px] font-bold uppercase py-0.5 border ${current.statusColor}`}>
                    {current.status}
                  </Badge>
                </div>

                {/* View Selector Toggle */}
                <div className="flex bg-muted/60 rounded-lg p-0.5 w-max">
                  <button
                    onClick={() => setViewMode('clinician')}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
                      viewMode === 'clinician' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    Clinician View (Logic)
                  </button>
                  <button
                    onClick={() => setViewMode('patient')}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
                      viewMode === 'patient' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    Patient View (Jargon-free)
                  </button>
                </div>

                {/* Explanation text */}
                <div className="min-h-[50px]">
                  {viewMode === 'clinician' ? (
                    <p className="text-xs leading-normal text-slate-700">
                      <strong>Reason: </strong> {current.clinicianReason}
                    </p>
                  ) : (
                    <div className="text-xs leading-normal text-slate-700 bg-white border border-primary/10 rounded-lg p-2.5 space-y-1.5">
                      <p>"{current.patientReason}"</p>
                      <p className="text-[10px] text-primary font-bold">
                        * Important Safety Notice: This is a diagnostic signal indicator. It does not provide any disease diagnosis or medical prescription.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Explainable alert logic table */}
            <div className="border rounded-lg overflow-hidden text-xs">
              <div className="bg-muted/40 border-b p-2 font-bold flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-primary" />
                "Why was I alerted?" Verification Summary
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 p-3 bg-card">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Persistent Deviations:</span>
                  <span className="font-bold tabular-nums">{current.metrics.persistent} obs</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Independent Signals:</span>
                  <span className="font-bold tabular-nums">{current.metrics.independent}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Personalized Baseline:</span>
                  <span className="font-bold">{current.metrics.baselineUsed}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Alert Threshold:</span>
                  <span className="font-bold tabular-nums">{current.metrics.threshold}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
