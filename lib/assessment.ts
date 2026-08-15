import type { Patient, RiskFactor, RiskAssessment, RiskLevel } from '@/types';
import { calculateRiskScore, riskLevelLabel } from './risk-engine';
import { detectAnomalies } from './anomaly-detection';
import { calculateConfidence } from './confidence';
import { generateRecommendations } from './recommendations';
import { calculateBaseline, getTrendDelta } from './baseline';

export function assessPatient(patient: Patient): RiskAssessment {
  const risk = calculateRiskScore(patient);
  const conf = calculateConfidence(patient);
  const anomalies = detectAnomalies(patient);
  
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

  const summary = risk.alertReason;

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
    dataPoints: patient.history.length,
    missingSignals: conf.missingSignals,
    dataCompleteness: risk.dataCompleteness,
    historicalCoverageText: risk.historicalCoverageText,
    historicalCoverageDays: risk.historicalCoverageDays,
    priorityScore: risk.priorityScore,
    alertTier: risk.alertTier,
    alertReason: risk.alertReason,
    patientTranslation: risk.patientTranslation,
    primarySignalsCount: risk.primarySignalsCount,
    primarySignalsTotal: risk.primarySignalsTotal,
    isPersonalBaselineUsed: risk.isPersonalBaselineUsed
  };
}

export function generateAlerts(patient: Patient): import('@/types').AlertItem[] {
  const assessment = assessPatient(patient);
  const alerts: import('@/types').AlertItem[] = [];
  const now = new Date();
  const ts = now.toISOString();

  // Clinician Alert Digest: group related alerts into a single cohesive clinical pattern
  if (assessment.alertTier === 'urgent') {
    alerts.push({
      id: `${patient.id}-urgent`,
      patientId: patient.id,
      patientName: patient.name,
      severity: 'urgent',
      title: 'Urgent Review Recommended: Severe, persistent multi-signal pattern',
      signal: assessment.anomalies.map((a) => a.label).join(', ') || 'Vitals',
      timestamp: ts,
      acknowledged: patient.acknowledgedAlerts.includes(`${patient.id}-urgent`),
    });
  } else if (assessment.alertTier === 'clinical') {
    alerts.push({
      id: `${patient.id}-clinical`,
      patientId: patient.id,
      patientName: patient.name,
      severity: 'high',
      title: 'Clinical Review Recommended: Persistent baseline deviation',
      signal: assessment.anomalies.map((a) => a.label).join(', ') || 'Vitals',
      timestamp: ts,
      acknowledged: patient.acknowledgedAlerts.includes(`${patient.id}-clinical`),
    });
  } else if (assessment.alertTier === 'monitor') {
    if (assessment.anomalies.length > 0) {
      alerts.push({
        id: `${patient.id}-monitor`,
        patientId: patient.id,
        patientName: patient.name,
        severity: 'medium',
        title: 'Monitoring Recommended: Ongoing vital sign deviation',
        signal: assessment.anomalies.map((a) => a.label).join(', '),
        timestamp: ts,
        acknowledged: patient.acknowledgedAlerts.includes(`${patient.id}-monitor`),
      });
    }
  }

  return alerts;
}

export { calculateBaseline, riskLevelLabel };
