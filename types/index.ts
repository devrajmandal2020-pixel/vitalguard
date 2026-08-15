export type RiskLevel = 'low' | 'moderate' | 'high' | 'urgent';

export type SignalType =
  | 'heartRate'
  | 'spo2'
  | 'temperature'
  | 'bloodPressure'
  | 'respiratoryRate'
  | 'activity'
  | 'sleep'
  | 'glucose';

export interface SignalRange {
  min: number;
  max: number;
}

export interface VitalReading {
  timestamp: string; // ISO
  heartRate?: number;
  spo2?: number;
  temperature?: number;
  systolic?: number;
  diastolic?: number;
  respiratoryRate?: number;
  activity?: number; // percent
  sleep?: number; // hours
  glucose?: number; // mg/dL
}

export interface PatientBaseline {
  heartRate: SignalRange | null;
  spo2: SignalRange | null;
  temperature: SignalRange | null;
  systolic: SignalRange | null;
  diastolic: SignalRange | null;
  respiratoryRate: SignalRange | null;
  activity: SignalRange | null;
  sleep: SignalRange | null;
  glucose: SignalRange | null;
}

export interface CurrentVitals {
  heartRate?: number;
  spo2?: number;
  temperature?: number;
  systolic?: number;
  diastolic?: number;
  respiratoryRate?: number;
  activity?: number;
  sleep?: number;
  glucose?: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: 'M' | 'F' | 'O';
  scenario: string;
  history: VitalReading[];
  current: CurrentVitals;
  daysOfHistory: number;
  acknowledgedAlerts: string[];
}

export interface RiskFactor {
  signal: SignalType;
  label: string;
  points: number; // contribution to score
  deviationPct: number;
  direction: 'up' | 'down';
  description: string;
}

export interface Anomaly {
  id: string;
  signal: SignalType;
  label: string;
  current: number;
  baseline: SignalRange | null;
  deviationPct: number;
  severity: 'low' | 'medium' | 'high';
  direction: 'up' | 'down';
  timestamp: string;
}

export interface Recommendation {
  category: 'Monitoring' | 'Clinical Review' | 'Data Collection';
  text: string;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  confidence: number;
  factors: RiskFactor[];
  anomalies: Anomaly[];
  recommendations: Recommendation[];
  summary: string;
  confidenceExplanation: string;
  trendDelta: number;
  dataPoints: number;
  missingSignals: SignalType[];
}

export interface AlertItem {
  id: string;
  patientId: string;
  patientName: string;
  severity: 'urgent' | 'high' | 'medium';
  title: string;
  signal: string;
  timestamp: string;
  acknowledged: boolean;
}
