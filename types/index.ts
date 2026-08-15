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

export type ReportType =
  | 'Blood Test'
  | 'Urine Test'
  | 'ECG'
  | 'Imaging'
  | 'Blood Pressure Report'
  | 'Glucose Report'
  | 'Lipid Profile'
  | 'Other';

export interface ReportMeasurement {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  changeText?: string;
  status?: 'improved' | 'stable' | 'changed' | 'abnormal' | 'normal';
}

export interface ReportAnalysis {
  observations: string[];
  missingInfo: string[];
  trends: string[];
  signals: string[];
}

export interface MedicalReport {
  id: string;
  name: string;
  type: ReportType;
  date: string;
  hospital: string;
  summary: string;
  keyMeasurements: ReportMeasurement[];
  uploadedFileName?: string;
  notes?: string;
  analysis?: ReportAnalysis;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  experience: number;
  availableDays: string[];
  availableSlots: string[];
  consultationType: 'In-person' | 'Teleconsultation' | 'Both';
  distance: string;
  languages: string[];
  rating: number;
  availabilityStatus: 'Available' | 'Unavailable';
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  clinic: string;
}

export interface FollowUpReminder {
  id: string;
  patientId: string;
  text: string;
  completed: boolean;
  dueDate?: string;
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
  medicalReports?: MedicalReport[];
  appointments?: Appointment[];
  followUpReminders?: FollowUpReminder[];
  improvingMode?: boolean;
}

export interface RiskFactor {
  signal: string;
  label: string;
  points: number; // contribution to score
  deviationPct: number;
  direction: 'up' | 'down';
  description: string;
}

export interface Anomaly {
  id: string;
  signal: string;
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
  dataCompleteness: number;
  historicalCoverageText: string;
  historicalCoverageDays: number;
  priorityScore: number;
  alertTier: 'info' | 'monitor' | 'clinical' | 'urgent';
  alertReason: string;
  patientTranslation: string;
  primarySignalsCount: number;
  primarySignalsTotal: number;
  isPersonalBaselineUsed: boolean;
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
