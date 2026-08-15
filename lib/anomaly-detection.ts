import type { Patient, Anomaly, SignalType } from '@/types';
import { calculateBaseline, calculateDeviation, SIGNAL_LABELS } from './baseline';

const SEVERITY_THRESHOLDS = {
  low: 10,
  medium: 20,
  high: 30,
};

function severityFor(deviationPct: number): 'low' | 'medium' | 'high' {
  const abs = Math.abs(deviationPct);
  if (abs >= SEVERITY_THRESHOLDS.high) return 'high';
  if (abs >= SEVERITY_THRESHOLDS.medium) return 'medium';
  return 'low';
}

export function detectAnomalies(patient: Patient): Anomaly[] {
  const baseline = calculateBaseline(patient);
  const c = patient.current;
  const anomalies: Anomaly[] = [];
  const lastTimestamp = patient.history[patient.history.length - 1]?.timestamp ?? new Date().toISOString();

  const checks: { signal: SignalType; current: number | undefined; rangeKey: keyof typeof baseline }[] = [
    { signal: 'heartRate', current: c.heartRate, rangeKey: 'heartRate' },
    { signal: 'spo2', current: c.spo2, rangeKey: 'spo2' },
    { signal: 'temperature', current: c.temperature, rangeKey: 'temperature' },
    { signal: 'bloodPressure', current: c.systolic, rangeKey: 'systolic' },
    { signal: 'respiratoryRate', current: c.respiratoryRate, rangeKey: 'respiratoryRate' },
    { signal: 'activity', current: c.activity, rangeKey: 'activity' },
  ];

  for (const check of checks) {
    if (check.current == null) continue;
    const range = baseline[check.rangeKey];
    if (!range) continue;

    const dev = calculateDeviation(check.current, range);
    if (!dev) continue;

    if (Math.abs(dev.pct) >= SEVERITY_THRESHOLDS.low) {
      anomalies.push({
        id: `${patient.id}-${check.signal}`,
        signal: check.signal,
        label: SIGNAL_LABELS[check.signal],
        current: check.current,
        baseline: range,
        deviationPct: dev.pct,
        severity: severityFor(dev.pct),
        direction: dev.direction,
        timestamp: lastTimestamp,
      });
    }
  }

  // Sort by severity (high → medium → low), then by deviation magnitude
  const order = { high: 0, medium: 1, low: 2 };
  anomalies.sort((a, b) => {
    if (order[a.severity] !== order[b.severity]) return order[a.severity] - order[b.severity];
    return Math.abs(b.deviationPct) - Math.abs(a.deviationPct);
  });

  return anomalies;
}

export function anomalyCountLast24h(patient: Patient): number {
  return detectAnomalies(patient).length;
}
