'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Patient } from '@/types';
import { DEMO_PATIENTS } from '@/lib/demo-data';
import { assessPatient } from '@/lib/assessment';
import { generateAlerts } from '@/lib/assessment';

interface PatientContextValue {
  patients: Patient[];
  acknowledgeAlert: (patientId: string, alertId: string) => void;
  addPatient: (patient: Patient) => void;
  getPatient: (id: string) => Patient | undefined;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  allAlerts: ReturnType<typeof generateAlerts>;
}

const PatientContext = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(DEMO_PATIENTS);

  const acknowledgeAlert = useCallback((patientId: string, alertId: string) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId && !p.acknowledgedAlerts.includes(alertId)
          ? { ...p, acknowledgedAlerts: [...p.acknowledgedAlerts, alertId] }
          : p
      )
    );
  }, []);

  const addPatient = useCallback((patient: Patient) => {
    setPatients((prev) => [patient, ...prev]);
  }, []);

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const getPatient = useCallback(
    (id: string) => patients.find((p) => p.id === id),
    [patients]
  );

  const allAlerts = React.useMemo(() => {
    return patients.flatMap((p) => generateAlerts(p));
  }, [patients]);

  const value: PatientContextValue = {
    patients,
    acknowledgeAlert,
    addPatient,
    getPatient,
    updatePatient,
    allAlerts,
  };

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
}

export function usePatients() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatients must be used within PatientProvider');
  return ctx;
}

export function usePatientAssessments() {
  const { patients } = usePatients();
  return React.useMemo(() => {
    return patients.map((p) => ({ patient: p, assessment: assessPatient(p) }));
  }, [patients]);
}
