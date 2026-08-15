import type { Patient, RiskFactor, RiskAssessment, RiskLevel } from '@/types';
import { calculateRiskScore, riskLevelLabel } from './risk-engine';
import { detectAnomalies } from './anomaly-detection';
import { calculateConfidence } from './confidence';
import { generateRecommendations } from './recommendations';
import { calculateBaseline, getTrendDelta } from './baseline';

function generateSummary(
  patient: Patient,
  level: RiskLevel,
  score: number,
  factors: RiskFactor[],
  anomalyCount: number
): string {
  if (level === 'urgent') {
    return 'Urgent review recommended. Multiple abnormal signals detected simultaneously.';
  }
  if (level === 'high') {
    if (anomalyCount >= 3) {
      return 'Early warning pattern detected. Multiple health signals have deviated from the patient\'s recent baseline.';
    }
    return 'Elevated deterioration risk detected. Persistent deviation from baseline observed.';
  }
  if (level === 'moderate') {
    if (anomalyCount <= 1) {
      return 'Single isolated deviation detected. Current pattern does not show persistent deterioration.';
    }
    return 'Moderate risk. Some signals show deviation from baseline — continue monitoring.';
  }
  return 'Patient is stable. Vital signals remain within the personal baseline range.';
}

export function assessPatient(patient: Patient): RiskAssessment {
  const risk = calculateRiskScore(patient);
  const anomalies = detectAnomalies(patient);
  const conf = calculateConfidence(patient);
  const recommendations = generateRecommendations(
    patient,
    risk.level,
    risk.factors,
    conf.missingSignals.map((s) => s)
  );

  // Trend delta: compare current risk proxy to 24h-ago
  const hrDelta = getTrendDelta(patient.history, 'heartRate');
  const spo2Delta = getTrendDelta(patient.history, 'spo2');
  const tempDelta = getTrendDelta(patient.history, 'temperature');

  // Approximate trend delta in risk points
  let trendDelta = 0;
  if (hrDelta > 0) trendDelta += Math.min(10, hrDelta * 0.5);
  if (spo2Delta < 0) trendDelta += Math.min(8, Math.abs(spo2Delta) * 0.8);
  if (tempDelta > 0) trendDelta += Math.min(5, tempDelta * 2.5);
  if (hrDelta < 0 && spo2Delta >= 0 && tempDelta <= 0) trendDelta = -Math.abs(trendDelta) - 5;

  const summary = generateSummary(patient, risk.level, risk.score, risk.factors, anomalies.length);

  return {
    score: risk.score,
    level: risk.level,
    confidence: conf.value,
    factors: risk.factors,
    anomalies,
    recommendations,
    summary,
    confidenceExplanation: conf.explanation,
    trendDelta: Math.round(trendDelta),
    dataPoints: conf.dataPoints,
    missingSignals: conf.missingSignals,
  };
}

export function generateAlerts(patient: Patient): import('@/types').AlertItem[] {
  const assessment = assessPatient(patient);
  const alerts: import('@/types').AlertItem[] = [];
  const now = new Date();
  const ts = now.toISOString();

  if (assessment.level === 'urgent' || assessment.score >= 85) {
    alerts.push({
      id: `${patient.id}-urgent`,
      patientId: patient.id,
      patientName: patient.name,
      severity: 'urgent',
      title: 'Multiple vital-sign anomalies detected simultaneously',
      signal: assessment.anomalies.map((a) => a.label).join(', '),
      timestamp: ts,
      acknowledged: patient.acknowledgedAlerts.includes(`${patient.id}-urgent`),
    });
  } else if (assessment.level === 'high') {
    const top = assessment.anomalies[0];
    alerts.push({
      id: `${patient.id}-high`,
      patientId: patient.id,
      patientName: patient.name,
      severity: 'high',
      title: top
        ? `Persistent ${top.label.toLowerCase()} deviation`
        : 'Persistent signal deviation from baseline',
      signal: top?.label ?? 'Multiple signals',
      timestamp: ts,
      acknowledged: patient.acknowledgedAlerts.includes(`${patient.id}-high`),
    });
  } else if (assessment.level === 'moderate' && assessment.anomalies.length > 0) {
    const top = assessment.anomalies[0];
    alerts.push({
      id: `${patient.id}-medium`,
      patientId: patient.id,
      patientName: patient.name,
      severity: 'medium',
      title: `${top.label} deviation detected`,
      signal: top.label,
      timestamp: ts,
      acknowledged: patient.acknowledgedAlerts.includes(`${patient.id}-medium`),
    });
  }

  return alerts;
}

export { calculateBaseline, riskLevelLabel };
