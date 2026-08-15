import type { Patient, RiskFactor } from '@/types';
import type { RiskAssessment } from '@/types';

export interface AIExplanation {
  summary: string;
  riskFactors: { label: string; points: number; description: string }[];
  confidenceExplanation: string;
  recommendations: string[];
}

/**
 * Service abstraction for AI-generated explanations.
 *
 * This function is designed so a real LLM (OpenAI, Gemini, etc.) can replace
 * the local deterministic logic later by swapping the implementation.
 *
 * For this hackathon prototype, it uses deterministic local TypeScript logic
 * and requires ZERO API keys.
 */
export async function generateAIExplanation(
  patientData: Patient,
  riskFactors: RiskFactor[],
  assessment: RiskAssessment
): Promise<AIExplanation> {
  // Simulate async for interface compatibility with future LLM calls
  // No actual network call — works fully offline

  const factors = riskFactors.map((f) => ({
    label: f.label,
    points: f.points,
    description: buildFactorDescription(f, patientData),
  }));

  return {
    summary: assessment.summary,
    riskFactors: factors,
    confidenceExplanation: assessment.confidenceExplanation,
    recommendations: assessment.recommendations.map((r) => r.text),
  };
}

function buildFactorDescription(factor: RiskFactor, patient: Patient): string {
  const dir = factor.direction === 'up' ? 'increased' : 'decreased';
  const pct = Math.abs(factor.deviationPct).toFixed(1);

  switch (factor.signal) {
    case 'heartRate':
      return `Resting heart rate has ${dir} consistently over the recent monitoring window, ${pct}% from the patient's personal baseline.`;
    case 'spo2':
      return `Oxygen saturation has ${dir} ${pct}% compared with the patient's personal baseline.`;
    case 'temperature':
      return `Temperature is ${factor.direction === 'up' ? 'above' : 'below'} the recent personal baseline by ${pct}%.`;
    case 'bloodPressure':
      return `Recent blood pressure measurements show ${pct}% deviation from the patient's baseline.`;
    case 'respiratoryRate':
      return `Respiratory rate has ${dir} ${pct}% from baseline.`;
    case 'activity':
      return `Activity level is ${pct}% ${factor.direction === 'up' ? 'higher' : 'lower'} than the patient's recent pattern.`;
    default:
      return `${factor.label} shows ${pct}% deviation from the patient's baseline.`;
  }
}
