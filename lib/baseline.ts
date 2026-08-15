import type {
  Patient,
  PatientBaseline,
  SignalRange,
  VitalReading,
  CurrentVitals,
  SignalType,
} from '@/types';

export const SIGNAL_LABELS: Record<SignalType, string> = {
  heartRate: 'Heart Rate',
  spo2: 'Oxygen Saturation',
  temperature: 'Temperature',
  bloodPressure: 'Blood Pressure',
  respiratoryRate: 'Respiratory Rate',
  activity: 'Activity Level',
  sleep: 'Sleep Duration',
  glucose: 'Glucose',
};

export const SIGNAL_UNITS: Record<SignalType, string> = {
  heartRate: 'BPM',
  spo2: '%',
  temperature: '°C',
  bloodPressure: 'mmHg',
  respiratoryRate: 'rpm',
  activity: '%',
  sleep: 'h',
  glucose: 'mg/dL',
};

export const RISK_WEIGHTS: Record<SignalType, number> = {
  heartRate: 0.25,
  spo2: 0.3,
  temperature: 0.15,
  bloodPressure: 0.15,
  respiratoryRate: 0.1,
  activity: 0.05,
  sleep: 0,
  glucose: 0,
};

function computeRange(
  values: number[]
): SignalRange | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  // Use 10th and 90th percentile for a robust baseline range
  const p10 = sorted[Math.floor(sorted.length * 0.1)];
  const p90 = sorted[Math.ceil(sorted.length * 0.9) - 1];
  return { min: p10, max: p90 };
}

export function calculateBaseline(patient: Patient): PatientBaseline {
  // Use only the first 60% of history for baseline computation.
  // This represents the patient's "normal" state before any potential
  // deterioration, so deviations from it are meaningful.
  const cutoff = Math.max(3, Math.ceil(patient.history.length * 0.6));
  const baselineHistory = patient.history.slice(0, cutoff);

  const hr = baselineHistory
    .map((r) => r.heartRate)
    .filter((v): v is number => v != null);
  const spo2 = baselineHistory
    .map((r) => r.spo2)
    .filter((v): v is number => v != null);
  const temp = baselineHistory
    .map((r) => r.temperature)
    .filter((v): v is number => v != null);
  const sys = baselineHistory
    .map((r) => r.systolic)
    .filter((v): v is number => v != null);
  const dia = baselineHistory
    .map((r) => r.diastolic)
    .filter((v): v is number => v != null);
  const rr = baselineHistory
    .map((r) => r.respiratoryRate)
    .filter((v): v is number => v != null);
  const act = baselineHistory
    .map((r) => r.activity)
    .filter((v): v is number => v != null);
  const sleep = baselineHistory
    .map((r) => r.sleep)
    .filter((v): v is number => v != null);
  const glucose = baselineHistory
    .map((r) => r.glucose)
    .filter((v): v is number => v != null);

  return {
    heartRate: computeRange(hr),
    spo2: computeRange(spo2),
    temperature: computeRange(temp),
    systolic: computeRange(sys),
    diastolic: computeRange(dia),
    respiratoryRate: computeRange(rr),
    activity: computeRange(act),
    sleep: computeRange(sleep),
    glucose: computeRange(glucose),
  };
}

export function getBaselineMidpoint(range: SignalRange | null): number | null {
  if (!range) return null;
  return (range.min + range.max) / 2;
}

export function calculateDeviation(
  current: number | undefined,
  baseline: SignalRange | null
): { pct: number; direction: 'up' | 'down' } | null {
  if (current == null || !baseline) return null;
  const mid = (baseline.min + baseline.max) / 2;
  if (mid === 0) return null;
  const diff = current - mid;
  const pct = (diff / Math.abs(mid)) * 100;
  return { pct, direction: pct >= 0 ? 'up' : 'down' };
}

export function isOutsideRange(
  current: number | undefined,
  baseline: SignalRange | null
): boolean {
  if (current == null || !baseline) return false;
  return current < baseline.min || current > baseline.max;
}

export function getTrendDelta(history: VitalReading[], signal: SignalType): number {
  const values = history
    .map((r) => {
      switch (signal) {
        case 'heartRate': return r.heartRate;
        case 'spo2': return r.spo2;
        case 'temperature': return r.temperature;
        case 'bloodPressure': return r.systolic;
        case 'respiratoryRate': return r.respiratoryRate;
        case 'activity': return r.activity;
        case 'sleep': return r.sleep;
        case 'glucose': return r.glucose;
        default: return undefined;
      }
    })
    .filter((v): v is number => v != null);
  if (values.length < 2) return 0;
  const first = values[0];
  const last = values[values.length - 1];
  return last - first;
}
