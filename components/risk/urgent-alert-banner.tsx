'use client';

import { AlertOctagon, ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { RiskAssessment, Patient } from '@/types';
import { usePatients } from '@/components/providers/patient-provider';

export function UrgentAlertBanner({ patient, assessment }: { patient: Patient; assessment: RiskAssessment }) {
  const { acknowledgeAlert } = usePatients();
  const alertId = `${patient.id}-urgent`;
  const isAcknowledged = patient.acknowledgedAlerts.includes(alertId);

  if (assessment.level !== 'urgent' && assessment.score < 85) return null;

  const topAnomalies = assessment.anomalies.slice(0, 4);

  const handleAcknowledge = () => {
    acknowledgeAlert(patient.id, alertId);
    toast.success('Alert acknowledged', {
      description: 'Urgent review alert has been acknowledged.',
    });
  };

  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100">
              <AlertOctagon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-900">Urgent Review Recommended</h3>
              <p className="mt-1 text-sm text-red-800">
                Multiple abnormal signals detected simultaneously.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {topAnomalies.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700"
                  >
                    {a.label}
                    {a.direction === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs font-medium text-red-700">
                Urgent clinical review recommended. Confirm readings and follow your organization's emergency protocol.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            {isAcknowledged ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-100 px-4 py-2.5 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Acknowledged
              </div>
            ) : (
              <Button onClick={handleAcknowledge} variant="destructive" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Acknowledge Alert
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
