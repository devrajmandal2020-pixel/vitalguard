import type { Patient, VitalReading } from '@/types';

function isoDaysAgo(days: number, hours = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function isoHoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

// Generate a time series of readings
function series(
  days: number,
  points: { hr: number[]; spo2: number[]; temp: number[]; sys?: number[]; dia?: number[]; rr?: number[]; act?: number[]; sleep?: number[]; glucose?: number[] }
): VitalReading[] {
  const readings: VitalReading[] = [];
  const n = points.hr.length;
  for (let i = 0; i < n; i++) {
    const dayOffset = days - Math.floor((i / n) * days);
    readings.push({
      timestamp: isoDaysAgo(dayOffset, Math.floor(Math.random() * 6)),
      heartRate: points.hr[i],
      spo2: points.spo2[i],
      temperature: points.temp[i],
      systolic: points.sys?.[i],
      diastolic: points.dia?.[i],
      respiratoryRate: points.rr?.[i],
      activity: points.act?.[i],
      sleep: points.sleep?.[i],
      glucose: points.glucose?.[i],
    });
  }
  return readings;
}

// Patient 1 — Aarav Sharma: Early Warning
const aaravHistory = series(7, {
  hr: [72, 73, 72, 74, 76, 79, 83, 88, 94],
  spo2: [98, 98, 98, 97, 97, 96, 95, 94, 94],
  temp: [36.7, 36.8, 36.8, 37.0, 37.2, 37.5, 37.7, 37.7, 37.7],
  sys: [122, 124, 123, 125, 128, 130, 134, 138, 142],
  dia: [78, 79, 78, 80, 82, 84, 86, 88, 90],
  rr: [16, 16, 17, 17, 18, 19, 20, 21, 22],
  act: [62, 60, 58, 55, 50, 45, 40, 37, 35],
  sleep: [7.2, 7.0, 6.8, 6.5, 6.2, 5.8, 5.5, 5.2, 5.0],
});

const aarav: Patient = {
  id: 'PT-10482',
  name: 'Aarav Sharma',
  age: 52,
  sex: 'M',
  scenario: 'Early Warning',
  history: aaravHistory,
  current: {
    heartRate: 94,
    spo2: 94,
    temperature: 37.7,
    systolic: 142,
    diastolic: 90,
    respiratoryRate: 22,
    activity: 35,
    sleep: 5.0,
  },
  daysOfHistory: 30,
  acknowledgedAlerts: [],
  medicalReports: [
    {
      id: 'REP-001',
      name: 'Routine Lipid & Metabolic Panel',
      type: 'Blood Test',
      date: isoDaysAgo(24),
      hospital: 'VitalCare Medical Center',
      summary: 'All vital blood chemical indicators fell within default reference ranges.',
      keyMeasurements: [
        { name: 'Glucose', value: 92, unit: 'mg/dL', referenceRange: '70 - 100 mg/dL', isAbnormal: false, changeText: 'Baseline' },
        { name: 'Hemoglobin', value: 14.2, unit: 'g/dL', referenceRange: '13.8 - 17.2 g/dL', isAbnormal: false, changeText: 'Baseline' },
        { name: 'LDL Cholesterol', value: 98, unit: 'mg/dL', referenceRange: '< 100 mg/dL', isAbnormal: false, changeText: 'Baseline' }
      ],
      uploadedFileName: 'metabolic_panel_july.pdf',
      notes: 'Patient shows good lipid balance. Blood glucose is stable.'
    },
    {
      id: 'REP-002',
      name: 'Home BP Monitoring Log',
      type: 'Blood Pressure Report',
      date: isoDaysAgo(7),
      hospital: 'Self-Reported',
      summary: 'Elevated systolic and diastolic readings compared with baseline.',
      keyMeasurements: [
        { name: 'Systolic BP', value: 138, unit: 'mmHg', referenceRange: '90 - 120 mmHg', isAbnormal: true, changeText: '+15 mmHg', status: 'abnormal' },
        { name: 'Diastolic BP', value: 88, unit: 'mmHg', referenceRange: '60 - 80 mmHg', isAbnormal: true, changeText: '+10 mmHg', status: 'abnormal' }
      ],
      uploadedFileName: 'bp_log_august.png',
      notes: 'Patient logged readings over 3 days. Average readings are consistently in the pre-hypertensive stage.'
    }
  ],
  appointments: [],
  followUpReminders: [
    { id: 'REM-101', patientId: 'PT-10482', text: 'Review new medical report with doctor', completed: false, dueDate: isoDaysAgo(-2) },
    { id: 'REM-102', patientId: 'PT-10482', text: 'Update blood pressure log daily', completed: false, dueDate: isoDaysAgo(-1) },
    { id: 'REM-103', patientId: 'PT-10482', text: 'Attend scheduled Internal Medicine consultation', completed: false, dueDate: isoDaysAgo(-4) }
  ]
};

// Patient 2 — Priya Patel: Stable
const priyaHistory = series(14, {
  hr: [68, 69, 70, 68, 69, 70, 71, 69, 68, 70, 69, 70, 68, 69, 70, 69],
  spo2: [98, 98, 99, 98, 98, 97, 98, 98, 99, 98, 98, 97, 98, 98, 99, 98],
  temp: [36.6, 36.7, 36.8, 36.7, 36.6, 36.7, 36.8, 36.7, 36.6, 36.7, 36.8, 36.7, 36.6, 36.7, 36.8, 36.7],
  sys: [118, 120, 119, 121, 118, 120, 119, 120, 118, 119, 120, 121, 118, 119, 120, 119],
  dia: [75, 76, 75, 77, 75, 76, 75, 76, 75, 76, 77, 75, 76, 75, 76, 75],
  rr: [14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15, 14, 15],
  act: [65, 63, 64, 66, 65, 63, 64, 65, 66, 64, 65, 63, 64, 65, 66, 65],
  sleep: [7.5, 7.2, 7.8, 7.0, 7.5, 7.3, 7.6, 7.1, 7.4, 7.2, 7.5, 7.3, 7.6, 7.1, 7.4, 7.2],
});

const priya: Patient = {
  id: 'PT-10483',
  name: 'Priya Patel',
  age: 47,
  sex: 'F',
  scenario: 'Stable Patient',
  history: priyaHistory,
  current: {
    heartRate: 70,
    spo2: 98,
    temperature: 36.7,
    systolic: 119,
    diastolic: 76,
    respiratoryRate: 15,
    activity: 65,
    sleep: 7.3,
  },
  daysOfHistory: 14,
  acknowledgedAlerts: [],
};

// Patient 3 — Rohan Das: Reduced Activity
const rohanHistory = series(10, {
  hr: [74, 75, 74, 76, 75, 77, 76, 78, 77, 79, 78, 80],
  spo2: [97, 97, 96, 97, 96, 96, 95, 96, 95, 95, 94, 95],
  temp: [36.7, 36.8, 36.9, 36.8, 36.9, 37.0, 36.9, 37.0, 37.1, 37.0, 37.1, 37.2],
  sys: [125, 126, 127, 128, 127, 129, 128, 130, 129, 131, 130, 132],
  dia: [80, 81, 82, 81, 82, 83, 82, 83, 84, 83, 84, 85],
  rr: [16, 17, 16, 17, 17, 18, 17, 18, 17, 18, 18, 19],
  act: [60, 58, 55, 52, 50, 48, 45, 42, 40, 38, 36, 34],
  sleep: [7.0, 6.8, 6.5, 6.3, 6.0, 5.8, 5.5, 5.3, 5.0, 4.8, 4.5, 4.3],
});

const rohan: Patient = {
  id: 'PT-10484',
  name: 'Rohan Das',
  age: 61,
  sex: 'M',
  scenario: 'Reduced Activity',
  history: rohanHistory,
  current: {
    heartRate: 80,
    spo2: 95,
    temperature: 37.2,
    systolic: 132,
    diastolic: 85,
    respiratoryRate: 19,
    activity: 34,
    sleep: 4.3,
  },
  daysOfHistory: 10,
  acknowledgedAlerts: [],
};

// Patient 4 — Ananya Singh: Multiple Anomalies (urgent)
const ananyaHistory = series(6, {
  hr: [76, 78, 80, 85, 92, 98, 105, 110],
  spo2: [97, 96, 95, 93, 91, 89, 87, 86],
  temp: [36.8, 37.0, 37.3, 37.8, 38.2, 38.5, 38.8, 39.0],
  sys: [125, 128, 132, 138, 145, 152, 158, 165],
  dia: [80, 82, 85, 88, 92, 96, 100, 105],
  rr: [16, 17, 19, 21, 24, 27, 30, 33],
  act: [60, 55, 48, 40, 32, 25, 18, 12],
  sleep: [7.0, 6.5, 5.8, 5.0, 4.2, 3.5, 2.8, 2.0],
});

const ananya: Patient = {
  id: 'PT-10485',
  name: 'Ananya Singh',
  age: 58,
  sex: 'F',
  scenario: 'Multiple Anomalies',
  history: ananyaHistory,
  current: {
    heartRate: 110,
    spo2: 86,
    temperature: 39.0,
    systolic: 165,
    diastolic: 105,
    respiratoryRate: 33,
    activity: 12,
    sleep: 2.0,
  },
  daysOfHistory: 30,
  acknowledgedAlerts: [],
};

// Patient 5 — Vikram Mehta: Limited Historical Data
const vikramHistory = series(2, {
  hr: [78, 82, 85, 88, 90],
  spo2: [96, 95, 94, 93, 92],
  temp: [36.9, 37.1, 37.3, 37.5, 37.6],
  act: [55, 50, 45, 42, 38],
});

const vikram: Patient = {
  id: 'PT-10486',
  name: 'Vikram Mehta',
  age: 44,
  sex: 'M',
  scenario: 'Limited Historical Data',
  history: vikramHistory,
  current: {
    heartRate: 90,
    spo2: 92,
    temperature: 37.6,
    activity: 38,
    // Missing: BP, RR, sleep, glucose
  },
  daysOfHistory: 2,
  acknowledgedAlerts: [],
};

// Patient 6 — Sneha Roy: Temperature Trend
const snehaHistory = series(9, {
  hr: [72, 73, 74, 75, 76, 78, 79, 80, 82, 84],
  spo2: [98, 98, 97, 97, 97, 96, 96, 95, 95, 94],
  temp: [36.6, 36.7, 36.9, 37.1, 37.3, 37.5, 37.7, 37.9, 38.1, 38.3],
  sys: [120, 122, 124, 126, 128, 130, 132, 134, 136, 138],
  dia: [76, 77, 78, 79, 80, 81, 82, 83, 84, 86],
  rr: [15, 16, 16, 17, 17, 18, 18, 19, 19, 20],
  act: [62, 60, 58, 55, 52, 50, 48, 45, 42, 40],
  sleep: [7.5, 7.2, 7.0, 6.8, 6.5, 6.2, 6.0, 5.8, 5.5, 5.2],
});

const sneha: Patient = {
  id: 'PT-10487',
  name: 'Sneha Roy',
  age: 55,
  sex: 'F',
  scenario: 'Temperature Trend',
  history: snehaHistory,
  current: {
    heartRate: 84,
    spo2: 94,
    temperature: 38.3,
    systolic: 138,
    diastolic: 86,
    respiratoryRate: 20,
    activity: 40,
    sleep: 5.2,
  },
  daysOfHistory: 9,
  acknowledgedAlerts: [],
};

// Patient 7 — Rahul Verma: Single Abnormal Reading (isolated, stable trend)
const rahulHistory = series(12, {
  hr: [70, 71, 70, 72, 71, 70, 72, 71, 95, 72, 71, 70],
  spo2: [98, 98, 97, 98, 98, 97, 98, 98, 95, 98, 98, 97],
  temp: [36.7, 36.8, 36.7, 36.8, 36.7, 36.8, 36.7, 36.8, 37.2, 36.8, 36.7, 36.8],
  sys: [120, 121, 120, 122, 121, 120, 121, 122, 135, 121, 120, 121],
  dia: [76, 77, 76, 78, 77, 76, 77, 78, 85, 77, 76, 77],
  rr: [15, 16, 15, 16, 15, 16, 15, 16, 19, 16, 15, 16],
  act: [64, 63, 65, 64, 63, 65, 64, 63, 50, 64, 63, 65],
  sleep: [7.2, 7.0, 7.3, 7.1, 7.2, 7.0, 7.3, 7.1, 6.5, 7.2, 7.0, 7.3],
});

const rahul: Patient = {
  id: 'PT-10488',
  name: 'Rahul Verma',
  age: 39,
  sex: 'M',
  scenario: 'Isolated Abnormal Reading',
  history: rahulHistory,
  current: {
    heartRate: 70,
    spo2: 97,
    temperature: 36.8,
    systolic: 121,
    diastolic: 77,
    respiratoryRate: 16,
    activity: 65,
    sleep: 7.3,
  },
  daysOfHistory: 12,
  acknowledgedAlerts: [],
};

// Patient 8 — Meera Kapoor: Improving Patient (was high, now improving)
const meeraHistory = series(10, {
  hr: [92, 90, 88, 86, 84, 82, 80, 78, 76, 74, 73, 72],
  spo2: [92, 93, 94, 94, 95, 95, 96, 96, 97, 97, 98, 98],
  temp: [38.0, 37.8, 37.6, 37.4, 37.2, 37.0, 36.9, 36.8, 36.7, 36.7, 36.6, 36.6],
  sys: [140, 137, 134, 131, 128, 125, 123, 121, 120, 119, 118, 118],
  dia: [90, 88, 86, 84, 82, 80, 79, 78, 77, 76, 75, 75],
  rr: [22, 21, 20, 19, 18, 17, 17, 16, 16, 15, 15, 15],
  act: [30, 35, 38, 42, 45, 48, 52, 55, 58, 60, 62, 63],
  sleep: [4.5, 4.8, 5.2, 5.5, 5.8, 6.0, 6.3, 6.5, 6.8, 7.0, 7.2, 7.3],
});

const meera: Patient = {
  id: 'PT-10489',
  name: 'Meera Kapoor',
  age: 63,
  sex: 'F',
  scenario: 'Improving Patient',
  history: meeraHistory,
  current: {
    heartRate: 72,
    spo2: 98,
    temperature: 36.6,
    systolic: 118,
    diastolic: 75,
    respiratoryRate: 15,
    activity: 63,
    sleep: 7.3,
  },
  daysOfHistory: 10,
  acknowledgedAlerts: [],
};

export const DEMO_PATIENTS: Patient[] = [
  aarav,
  priya,
  rohan,
  ananya,
  vikram,
  sneha,
  rahul,
  meera,
];

export const DEFAULT_PATIENT_ID = 'PT-10482';

export const DEMO_SCENARIOS = [
  'Early Warning',
  'Stable Patient',
  'Reduced Activity',
  'Multiple Anomalies',
  'Limited Historical Data',
  'Temperature Trend',
  'Isolated Abnormal Reading',
  'Improving Patient',
] as const;

export function getPatientById(id: string): Patient | undefined {
  return DEMO_PATIENTS.find((p) => p.id === id);
}

export function getPatientByScenario(scenario: string): Patient | undefined {
  return DEMO_PATIENTS.find((p) => p.scenario === scenario);
}

export { isoHoursAgo, isoDaysAgo };
