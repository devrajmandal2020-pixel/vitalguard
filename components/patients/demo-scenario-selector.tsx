'use client';

import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePatients } from '@/components/providers/patient-provider';

const SCENARIO_LABELS: Record<string, string> = {
  'Early Warning': 'Early Warning',
  'Stable Patient': 'Stable Patient',
  'Reduced Activity': 'Reduced Activity',
  'Multiple Anomalies': 'Multiple Anomalies',
  'Limited Historical Data': 'Limited Historical Data',
  'Temperature Trend': 'Temperature Trend',
  'Isolated Abnormal Reading': 'Isolated Abnormal Reading',
  'Improving Patient': 'Improving Patient',
};

export function DemoScenarioSelector({ currentScenario }: { currentScenario: string }) {
  const router = useRouter();
  const { patients } = usePatients();

  const handleChange = (scenario: string) => {
    const patient = patients.find((p) => p.scenario === scenario);
    if (patient) {
      router.push(`/patients/${patient.id}`);
      toast.success('Demo scenario changed', {
        description: `Now viewing: ${scenario}`,
      });
    }
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-primary">Demo Scenario</span>
      </div>
      <Select value={currentScenario} onValueChange={handleChange}>
        <SelectTrigger className="w-[220px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SCENARIO_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
