'use client';

import { AppShell } from '@/components/layout/app-shell';
import { PatientProvider } from '@/components/providers/patient-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PatientProvider>
      <TooltipProvider delayDuration={200}>
        <AppShell>{children}</AppShell>
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </PatientProvider>
  );
}
