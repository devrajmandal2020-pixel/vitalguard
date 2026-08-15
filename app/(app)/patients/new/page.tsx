'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePatients } from '@/components/providers/patient-provider';
import { toast } from 'sonner';
import type { Patient, VitalReading } from '@/types';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().int().min(1, 'Age must be at least 1').max(120, 'Age must be under 120'),
  sex: z.enum(['M', 'F', 'O']),
  heartRate: z.coerce.number().min(30, 'Heart rate too low').max(220, 'Heart rate too high').optional(),
  spo2: z.coerce.number().min(50, 'SpO₂ too low').max(100, 'SpO₂ cannot exceed 100%').optional(),
  temperature: z.coerce.number().min(30, 'Temperature too low').max(45, 'Temperature too high').optional(),
  systolic: z.coerce.number().min(60, 'Systolic too low').max(250, 'Systolic too high').optional(),
  diastolic: z.coerce.number().min(40, 'Diastolic too low').max(150, 'Diastolic too high').optional(),
  respiratoryRate: z.coerce.number().min(5, 'Respiratory rate too low').max(60, 'Respiratory rate too high').optional(),
  activity: z.coerce.number().min(0, 'Activity cannot be negative').max(100, 'Activity cannot exceed 100%').optional(),
  sleep: z.coerce.number().min(0, 'Sleep cannot be negative').max(24, 'Sleep cannot exceed 24h').optional(),
  glucose: z.coerce.number().min(20, 'Glucose too low').max(600, 'Glucose too high').optional(),
});

type FormData = z.infer<typeof patientSchema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

export default function AddPatientPage() {
  const router = useRouter();
  const { addPatient } = usePatients();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    Array.from(formData.entries()).forEach(([key, value]) => {
      if (value !== '') data[key] = value;
    });

    const result = patientSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof FormData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      setSubmitting(false);
      toast.error('Validation failed', {
        description: 'Please correct the highlighted fields.',
      });
      return;
    }

    const v = result.data;
    const patientId = `PT-${Math.floor(10000 + Math.random() * 89999)}`;

    // Build a simple history from the current reading (single data point)
    const now = new Date();
    const history: VitalReading[] = [];
    // Create a minimal baseline by generating a few readings around the current value
    for (let i = 5; i >= 0; i--) {
      const ts = new Date(now);
      ts.setHours(ts.getHours() - i * 4);
      history.push({
        timestamp: ts.toISOString(),
        heartRate: v.heartRate ? Math.round(v.heartRate * (0.92 + (i / 5) * 0.08)) : undefined,
        spo2: v.spo2 ? Math.min(100, Math.round(v.spo2 * (1 + (i / 5) * 0.02))) : undefined,
        temperature: v.temperature ? +(v.temperature * (0.99 + (i / 5) * 0.01)).toFixed(1) : undefined,
        systolic: v.systolic ? Math.round(v.systolic * (0.95 + (i / 5) * 0.05)) : undefined,
        diastolic: v.diastolic ? Math.round(v.diastolic * (0.95 + (i / 5) * 0.05)) : undefined,
        respiratoryRate: v.respiratoryRate ? Math.round(v.respiratoryRate * (0.95 + (i / 5) * 0.05)) : undefined,
        activity: v.activity ? Math.round(v.activity * (0.9 + (i / 5) * 0.1)) : undefined,
        sleep: v.sleep,
        glucose: v.glucose,
      });
    }

    const newPatient: Patient = {
      id: patientId,
      name: v.name,
      age: v.age,
      sex: v.sex,
      scenario: 'Custom Entry',
      history,
      current: {
        heartRate: v.heartRate,
        spo2: v.spo2,
        temperature: v.temperature,
        systolic: v.systolic,
        diastolic: v.diastolic,
        respiratoryRate: v.respiratoryRate,
        activity: v.activity,
        sleep: v.sleep,
        glucose: v.glucose,
      },
      daysOfHistory: 1,
      acknowledgedAlerts: [],
    };

    addPatient(newPatient);
    toast.success('Patient added successfully', {
      description: `${v.name} has been added and risk assessment is now available.`,
    });
    router.push(`/patients/${patientId}`);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/patients">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Patient</h1>
        <p className="mt-1 text-muted-foreground">
          Enter patient vitals to generate an immediate risk assessment. Optional fields can be left blank.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Patient info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Patient Information</CardTitle>
            <CardDescription className="text-xs">Basic patient details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
              <Input id="name" name="name" placeholder="e.g. John Smith" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="age">Age <span className="text-destructive">*</span></Label>
              <Input id="age" name="age" type="number" placeholder="e.g. 55" />
              {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sex">Sex <span className="text-destructive">*</span></Label>
              <select
                id="sex"
                name="sex"
                defaultValue="M"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Required vitals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vital Signs</CardTitle>
            <CardDescription className="text-xs">At least one vital sign is required for assessment</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <VitalInput name="heartRate" label="Heart Rate" unit="BPM" placeholder="e.g. 72" error={errors.heartRate} />
            <VitalInput name="spo2" label="Oxygen Saturation" unit="%" placeholder="e.g. 98" error={errors.spo2} />
            <VitalInput name="temperature" label="Temperature" unit="°C" placeholder="e.g. 36.8" error={errors.temperature} />
            <VitalInput name="systolic" label="Systolic BP" unit="mmHg" placeholder="e.g. 120" error={errors.systolic} />
            <VitalInput name="diastolic" label="Diastolic BP" unit="mmHg" placeholder="e.g. 78" error={errors.diastolic} />
            <VitalInput name="respiratoryRate" label="Respiratory Rate" unit="rpm" placeholder="e.g. 16" error={errors.respiratoryRate} />
          </CardContent>
        </Card>

        {/* Optional vitals */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Optional Measurements</CardTitle>
              <Badge variant="outline" className="text-[10px]">Optional</Badge>
            </div>
            <CardDescription className="text-xs">Leave blank if unavailable — the system handles missing data gracefully</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <VitalInput name="activity" label="Activity Level" unit="%" placeholder="e.g. 60" error={errors.activity} optional />
            <VitalInput name="sleep" label="Sleep Duration" unit="hours" placeholder="e.g. 7.5" error={errors.sleep} optional />
            <VitalInput name="glucose" label="Glucose" unit="mg/dL" placeholder="e.g. 95" error={errors.glucose} optional />
          </CardContent>
        </Card>

        {/* Info notice */}
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">How it works</p>
            <p className="mt-1 text-xs leading-relaxed text-blue-700">
              On submission, the system validates input, calculates a personalized baseline from available
              data, detects anomalies, calculates risk and confidence scores, generates explanations and
              recommendations, and navigates you to the patient's detail page.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/patients">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={submitting} className="gap-2">
            <Save className="h-4 w-4" />
            {submitting ? 'Saving...' : 'Save & Assess'}
          </Button>
        </div>
      </form>

      <p className="text-xs text-muted-foreground">
        VitalGuard AI is a prototype for clinical decision support. Risk scores are not medical diagnoses and should be reviewed by qualified healthcare professionals.
      </p>
    </div>
  );
}

function VitalInput({
  name,
  label,
  unit,
  placeholder,
  error,
  optional,
}: {
  name: string;
  label: string;
  unit: string;
  placeholder: string;
  error?: string;
  optional?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="flex items-center gap-1.5">
        {label}
        {optional ? (
          <span className="text-[10px] font-normal text-muted-foreground">(optional)</span>
        ) : null}
      </Label>
      <div className="relative">
        <Input id={name} name={name} type="number" step="any" placeholder={placeholder} className="pr-14" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
