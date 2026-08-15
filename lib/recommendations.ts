import type { Patient, Recommendation, RiskLevel } from '@/types';
import type { RiskFactor } from '@/types';

export function generateRecommendations(
  patient: Patient,
  level: RiskLevel,
  factors: RiskFactor[],
  missingSignals: string[]
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Monitoring recommendations
  recs.push({
    category: 'Monitoring',
    text: 'Continue monitoring available vital signals at the current cadence.',
  });

  if (factors.some((f) => f.signal === 'heartRate')) {
    recs.push({
      category: 'Monitoring',
      text: 'Review recent heart-rate trend for persistent elevation or variability.',
    });
  }
  if (factors.some((f) => f.signal === 'spo2')) {
    recs.push({
      category: 'Monitoring',
      text: 'Closely monitor oxygen saturation readings for continued decline.',
    });
  }

  // Clinical Review
  if (level === 'urgent') {
    recs.push({
      category: 'Clinical Review',
      text: 'Urgent clinical review recommended. Confirm readings and follow your organization\'s emergency protocol.',
    });
  } else if (level === 'high') {
    recs.push({
      category: 'Clinical Review',
      text: 'Clinical review may be appropriate given the persistent trend. Review recent measurements and patient history.',
    });
  } else if (level === 'moderate') {
    recs.push({
      category: 'Clinical Review',
      text: 'Consider clinical review if the trend persists or additional symptoms emerge.',
    });
  } else {
    recs.push({
      category: 'Clinical Review',
      text: 'Routine follow-up. No urgent action indicated by current signals.',
    });
  }

  // Data Collection
  if (missingSignals.length > 0) {
    recs.push({
      category: 'Data Collection',
      text: `Consider obtaining currently unavailable measurements (${missingSignals.slice(0, 3).join(', ')}${missingSignals.length > 3 ? ', …' : ''}).`,
    });
  }
  if (patient.daysOfHistory < 5) {
    recs.push({
      category: 'Data Collection',
      text: 'Additional historical data may improve confidence and baseline accuracy.',
    });
  }

  return recs;
}
