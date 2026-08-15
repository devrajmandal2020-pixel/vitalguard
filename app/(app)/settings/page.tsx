'use client';

import {
  Shield,
  Lock,
  KeyRound,
  FileText,
  Eye,
  Database,
  AlertTriangle,
  Bell,
  Sliders,
  Brain,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Disclaimer } from '@/components/shared/disclaimer';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Configure platform preferences and review security architecture.</p>
      </div>

      {/* Security & Privacy */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Data Protection</CardTitle>
              <CardDescription className="text-xs">Security architecture and privacy principles</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SecurityItem
            icon={Lock}
            title="Encrypted Communication Architecture"
            description="All data transmission uses encrypted channels. Production deployment would enforce TLS 1.3+ for all connections."
          />
          <SecurityItem
            icon={KeyRound}
            title="Role-Based Access Architecture"
            description="Access to patient data is governed by role-based permissions, ensuring users only see data relevant to their clinical role."
          />
          <SecurityItem
            icon={FileText}
            title="Audit Logging"
            description="All access to patient data and risk assessments is logged for accountability and compliance review."
          />
          <SecurityItem
            icon={Eye}
            title="Minimum Necessary Data Principle"
            description="The system collects and processes only the data necessary for risk assessment — no excessive data retention."
          />
          <SecurityItem
            icon={Database}
            title="Synthetic Demo Dataset"
            description="This prototype uses entirely synthetic patient data. No real patient information is stored or processed."
          />

          <Separator className="my-4" />

          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Production deployment would require appropriate regulatory, security, privacy, and clinical validation.
              </p>
              <p className="mt-1 text-xs text-amber-700">
                This prototype does not hold HIPAA, GDPR, or other regulatory certifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
              <Database className="mr-1 h-3 w-3" /> Demo Data Only
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notification preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription className="text-xs">Configure when and how you receive alerts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingToggle
            label="Urgent review alerts"
            description="Receive immediate notifications for urgent-risk patients"
            defaultChecked
          />
          <Separator />
          <SettingToggle
            label="High-risk alerts"
            description="Get notified when a patient enters high-risk status"
            defaultChecked
          />
          <Separator />
          <SettingToggle
            label="Daily summary"
            description="Receive a daily summary of all monitored patients"
            defaultChecked={false}
          />
          <Separator />
          <SettingToggle
            label="Anomaly detection alerts"
            description="Notifications when new anomalies are detected"
            defaultChecked
          />
        </CardContent>
      </Card>

      {/* Risk engine configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <Sliders className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-base">Risk Engine Configuration</CardTitle>
              <CardDescription className="text-xs">Signal weights used in risk score calculation (demo values)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <WeightItem label="Heart Rate" weight="25%" />
            <WeightItem label="Oxygen Saturation (SpO₂)" weight="30%" />
            <WeightItem label="Temperature" weight="15%" />
            <WeightItem label="Blood Pressure" weight="15%" />
            <WeightItem label="Respiratory Rate" weight="10%" />
            <WeightItem label="Activity Level" weight="5%" />
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50/50 p-3">
            <Brain className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <p className="text-xs leading-relaxed text-blue-800">
              These weights are demo values for the hackathon prototype, not medically validated parameters.
              A production system would require clinical calibration and validation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Architecture */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
              <Brain className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <CardTitle className="text-base">AI Architecture</CardTitle>
              <CardDescription className="text-xs">Local deterministic risk engine — zero API keys required</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-sm text-muted-foreground">
              Risk scoring runs entirely in the browser using deterministic TypeScript logic.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-sm text-muted-foreground">
              The AI explanation interface is modular — a real LLM service can replace the local logic without UI changes.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-sm text-muted-foreground">
              No external API calls, no cloud dependencies, no data leaves the device.
            </p>
          </div>
        </CardContent>
      </Card>

      <Disclaimer variant="banner" />
    </div>
  );
}

function SecurityItem({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, defaultChecked }: { label: string; description: string; defaultChecked: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="pr-4">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function WeightItem({ label, weight }: { label: string; weight: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="text-sm font-medium">{label}</span>
      <Badge variant="secondary" className="tabular-nums">{weight}</Badge>
    </div>
  );
}
