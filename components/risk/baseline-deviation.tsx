import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Patient, PatientBaseline, CurrentVitals, SignalType } from '@/types';
import { SIGNAL_LABELS, SIGNAL_UNITS } from '@/lib/baseline';
import { calculateDeviation } from '@/lib/baseline';

interface BaselineDeviationProps {
  patient: Patient;
  baseline: PatientBaseline;
}

interface Row {
  signal: SignalType;
  current: number | undefined;
  range: { min: number; max: number } | null;
  unit: string;
}

export function BaselineDeviation({ patient, baseline }: BaselineDeviationProps) {
  const rows: Row[] = [
    { signal: 'heartRate', current: patient.current.heartRate, range: baseline.heartRate, unit: 'BPM' },
    { signal: 'spo2', current: patient.current.spo2, range: baseline.spo2, unit: '%' },
    { signal: 'temperature', current: patient.current.temperature, range: baseline.temperature, unit: '°C' },
    { signal: 'bloodPressure', current: patient.current.systolic, range: baseline.systolic, unit: 'mmHg' },
    { signal: 'respiratoryRate', current: patient.current.respiratoryRate, range: baseline.respiratoryRate, unit: 'rpm' },
    { signal: 'activity', current: patient.current.activity, range: baseline.activity, unit: '%' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Patient-Specific Baseline Deviation</CardTitle>
        <CardDescription className="text-xs">
          Risk assessment prioritizes deviation from the patient's own historical pattern when sufficient data is available.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3.5">
        {rows.map((row) => {
          const dev = calculateDeviation(row.current, row.range);
          const isMissing = row.current == null;
          const noBaseline = !row.range;

          return (
            <div key={row.signal} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-foreground">{SIGNAL_LABELS[row.signal]}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {/* Baseline range */}
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Baseline</div>
                  {noBaseline ? (
                    <span className="text-xs text-muted-foreground/60">—</span>
                  ) : (
                    <span className="tabular-nums text-muted-foreground">
                      {row.range!.min}–{row.range!.max}
                    </span>
                  )}
                </div>
                {/* Current */}
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Current</div>
                  {isMissing ? (
                    <span className="text-xs italic text-muted-foreground/60">N/A</span>
                  ) : (
                    <span className="tabular-nums font-semibold">{row.current}</span>
                  )}
                </div>
                {/* Deviation */}
                <div className="w-20 text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Deviation</div>
                  {isMissing || !dev ? (
                    <span className="flex items-center justify-end gap-0.5 text-xs text-muted-foreground/60">
                      <Minus className="h-3 w-3" /> —
                    </span>
                  ) : (
                    <span className={`flex items-center justify-end gap-0.5 font-semibold tabular-nums ${
                      Math.abs(dev.pct) >= 20 ? 'text-orange-600' :
                      Math.abs(dev.pct) >= 10 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {dev.direction === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {Math.abs(dev.pct).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
