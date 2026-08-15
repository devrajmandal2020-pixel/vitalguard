import type { Patient, SignalType } from '@/types';
import { calculateBaseline } from './baseline';

// Weights for confidence components
const W_DATA_POINTS = 0.35;   // more history → higher confidence
const W_COMPLETENESS = 0.3;    // more available signals → higher
const W_CONSISTENCY = 0.2;     // agreement between signals
const W_HISTORY_DAYS = 0.15;   // breadth of temporal coverage

const IDEAL_DATA_POINTS = 50; // ~7 days of readings
const IDEAL_DAYS = 14;
const CRITICAL_SIGNALS: SignalType[] = ['heartRate', 'spo2', 'temperature'];

export interface ConfidenceResult {
  value: number;
  explanation: string;
  dataPoints: number;
  missingSignals: SignalType[];
}

export function calculateConfidence(patient: Patient): ConfidenceResult {
  const baseline = calculateBaseline(patient);
  const dataPoints = patient.history.length;

  // Data points factor
  const dataFactor = Math.min(1, dataPoints / IDEAL_DATA_POINTS);

  // Completeness: count available signals
  const allSignals: { signal: SignalType; present: boolean }[] = [
    { signal: 'heartRate', present: patient.current.heartRate != null },
    { signal: 'spo2', present: patient.current.spo2 != null },
    { signal: 'temperature', present: patient.current.temperature != null },
    { signal: 'bloodPressure', present: patient.current.systolic != null },
    { signal: 'respiratoryRate', present: patient.current.respiratoryRate != null },
    { signal: 'activity', present: patient.current.activity != null },
    { signal: 'sleep', present: patient.current.sleep != null },
    { signal: 'glucose', present: patient.current.glucose != null },
  ];

  const presentCount = allSignals.filter((s) => s.present).length;
  const missingSignals = allSignals.filter((s) => !s.present).map((s) => s.signal);
  const missingCritical = missingSignals.filter((s) => CRITICAL_SIGNALS.includes(s));

  let completeness = presentCount / allSignals.length;
  // Penalize missing critical signals more heavily
  completeness -= missingCritical.length * 0.08;
  completeness = Math.max(0.3, Math.min(1, completeness));

  // Consistency: how many baseline ranges exist (proxy for data stability)
  const baselineRanges = Object.values(baseline).filter((v) => v != null).length;
  const consistency = Math.min(1, baselineRanges / 6);

  // History days factor
  const historyFactor = Math.min(1, patient.daysOfHistory / IDEAL_DAYS);

  const confidence = Math.round(
    (dataFactor * W_DATA_POINTS +
      completeness * W_COMPLETENESS +
      consistency * W_CONSISTENCY +
      historyFactor * W_HISTORY_DAYS) * 100
  );

  // Build explanation
  const reasons: string[] = [];
  if (dataPoints < 15) {
    reasons.push(`only ${dataPoints} historical readings available`);
  }
  if (patient.daysOfHistory < 3) {
    reasons.push(`limited to ${patient.daysOfHistory} day${patient.daysOfHistory === 1 ? '' : 's'} of history`);
  }
  if (missingCritical.length > 0) {
    reasons.push(`missing critical signal${missingCritical.length > 1 ? 's' : ''} (${missingCritical.map((s) => s).join(', ')})`);
  }
  if (missingSignals.length > 2) {
    reasons.push(`${missingSignals.length} of ${allSignals.length} signals unavailable`);
  }

  let explanation: string;
  if (reasons.length === 0) {
    explanation =
      'Confidence reflects data completeness, historical coverage, signal consistency, and agreement between available health signals.';
  } else {
    explanation = `Confidence reduced due to ${reasons.join(', ')}.`;
  }

  return {
    value: Math.max(35, Math.min(99, confidence)),
    explanation,
    dataPoints,
    missingSignals,
  };
}
