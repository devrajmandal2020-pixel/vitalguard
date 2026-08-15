import type {
  Patient,
  RiskLevel,
  RiskFactor,
  SignalType,
} from '@/types';
import {
  calculateBaseline,
  calculateDeviation,
  RISK_WEIGHTS,
  SIGNAL_LABELS,
} from './baseline';

export interface RiskResult {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
}

// Deviation severity → normalized 0-1 factor
function deviationSeverity(pct: number): number {
  // 0% → 0, 5% → ~0.35, 10% → ~0.6, 20% → ~0.88, 30%+ → 1.0
  const absPct = Math.abs(pct);
  if (absPct < 2) return 0;
  if (absPct >= 30) return 1;
  return Math.min(1, Math.pow((absPct - 2) / 28, 0.65));
}

function levelFromScore(score: number): RiskLevel {
  if (score < 30) return 'low';
  if (score < 60) return 'moderate';
  if (score < 85) return 'high';
  return 'urgent';
}

interface SignalInput {
  signal: SignalType;
  current: number | undefined;
  description: string;
  invert?: boolean; // for SpO2 where decrease is bad
}

export function calculateRiskScore(patient: Patient): RiskResult {
  const baseline = calculateBaseline(patient);
  const c = patient.current;

  const signals: SignalInput[] = [
    { signal: 'heartRate', current: c.heartRate, description: 'Resting heart rate deviates from the patient\'s personal baseline.' },
    { signal: 'spo2', current: c.spo2, description: 'Oxygen saturation has shifted compared with the personal baseline.', invert: true },
    { signal: 'temperature', current: c.temperature, description: 'Temperature is outside the recent personal baseline range.' },
    { signal: 'bloodPressure', current: c.systolic, description: 'Blood pressure shows moderate deviation from baseline.' },
    { signal: 'respiratoryRate', current: c.respiratoryRate, description: 'Respiratory rate deviates from the personal baseline.' },
    { signal: 'activity', current: c.activity, description: 'Activity level differs from the patient\'s recent pattern.', invert: true },
  ];

  const factors: RiskFactor[] = [];
  let weightedSum = 0;
  let totalWeightUsed = 0;

  for (const sig of signals) {
    if (sig.current == null) continue;
    const range = baseline[sig.signal === 'bloodPressure' ? 'systolic' : sig.signal];
    if (!range) continue;

    const dev = calculateDeviation(sig.current, range);
    if (!dev) continue;

    const severity = deviationSeverity(dev.pct);
    const weight = RISK_WEIGHTS[sig.signal];
    const points = Math.round(severity * 100 * weight);

    weightedSum += severity * weight;
    totalWeightUsed += weight;

    if (Math.abs(dev.pct) >= 3) {
      factors.push({
        signal: sig.signal,
        label: SIGNAL_LABELS[sig.signal],
        points,
        deviationPct: dev.pct,
        direction: dev.direction,
        description: sig.description,
      });
    }
  }

  // Sum weighted severities and scale to 0-100.
  // Instead of averaging, we accumulate the contribution of each signal
  // and scale by the total possible weight (sum of all signal weights = 1.0).
  // This means a single fully-deviated signal can contribute up to its weight
  // percentage of the total score.
  let rawScore: number;
  if (totalWeightUsed > 0) {
    // Scale so that if ALL signals are at max severity, score = 100
    rawScore = Math.round((weightedSum / 1.0) * 100);
  } else {
    rawScore = 0;
  }

  // Persistence multiplier: if only a single reading deviates but trend is stable, reduce
  const deviationCount = factors.length;
  if (deviationCount <= 1) {
    rawScore = Math.round(rawScore * 0.5);
  } else if (deviationCount === 2) {
    rawScore = Math.round(rawScore * 0.78);
  } else if (deviationCount === 3) {
    rawScore = Math.round(rawScore * 0.92);
  }
  // Multi-signal persistent deviation gets a boost
  if (deviationCount >= 4) {
    rawScore = Math.min(100, Math.round(rawScore * 1.12));
  }

  // Clamp
  rawScore = Math.max(0, Math.min(100, rawScore));

  // Sort factors by points descending
  factors.sort((a, b) => b.points - a.points);

  return { score: rawScore, level: levelFromScore(rawScore), factors };
}

export function riskLevelColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'hsl(var(--risk-low))';
    case 'moderate': return 'hsl(var(--risk-moderate))';
    case 'high': return 'hsl(var(--risk-high))';
    case 'urgent': return 'hsl(var(--risk-urgent))';
  }
}

export function riskLevelLabel(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'Low Risk';
    case 'moderate': return 'Moderate Risk';
    case 'high': return 'High Risk';
    case 'urgent': return 'Urgent Review';
  }
}
