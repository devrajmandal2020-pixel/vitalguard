import Link from 'next/link';
import {
  HeartPulse,
  Activity,
  ShieldCheck,
  Brain,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Database,
  ScanLine,
  Gauge,
  Eye,
  Bell,
  Stethoscope,
  LineChart,
  Lock,
  Sparkles,
} from 'lucide-react';
import { RiskGauge } from '@/components/risk/risk-gauge';
import { Disclaimer } from '@/components/shared/disclaimer';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: TrendingUp,
    title: 'Early Risk Detection',
    description: 'Identify abnormal changes in vital signs before they become critical events.',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: Activity,
    title: 'Personalized Baselines',
    description: 'Compare patients against their own historical patterns, not generic thresholds.',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: Brain,
    title: 'Explainable AI',
    description: 'Understand exactly why a patient\'s risk score changed with transparent factor breakdowns.',
    color: 'text-indigo-600 bg-indigo-50',
  },
];

const pipeline = [
  { icon: Database, label: 'Patient Data' },
  { icon: ScanLine, label: 'Signal Analysis' },
  { icon: Activity, label: 'Personalized Baseline' },
  { icon: Eye, label: 'Anomaly Detection' },
  { icon: Gauge, label: 'Risk Assessment' },
  { icon: Bell, label: 'Explainable Alert' },
  { icon: Stethoscope, label: 'Clinical Review' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
              <HeartPulse className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight">VitalGuard AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden border-amber-200 bg-amber-50 text-amber-700 sm:inline-flex">
              <Sparkles className="mr-1 h-3 w-3" /> Synthetic Data
            </Badge>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Launch Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute right-1/4 top-40 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="animate-fade-in">
            <Badge variant="outline" className="mb-5 border-blue-200 bg-blue-50 text-blue-700">
              <Sparkles className="mr-1.5 h-3 w-3" />
              Hackathon Prototype • Track 03
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Detect Risk Earlier.
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Personalize Care Smarter.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              VitalGuard AI analyzes changing health signals to identify potential deterioration
              patterns before they become emergencies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
              >
                Launch Demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/patients/PT-10482"
                className="inline-flex h-12 items-center rounded-lg border border-slate-200 bg-white px-6 text-base font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
              >
                Explore Patient
              </Link>
            </div>
            <div className="mt-6">
              <Disclaimer />
            </div>
          </div>

          {/* Dashboard preview mockup */}
          <div className="animate-fade-in lg:pl-8">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">How It Works</h2>
          <p className="mt-3 text-slate-600">Three core capabilities for proactive clinical decision support</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pipeline / Architecture */}
      <section className="border-y bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Detection Pipeline</h2>
            <p className="mt-3 text-slate-600">From raw patient data to explainable clinical review</p>
          </div>
          <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:justify-between">
            {pipeline.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex items-center gap-3 lg:flex-1 lg:flex-col">
                  <div className="flex flex-1 flex-col items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-5 text-center transition-all hover:border-primary/30 hover:bg-blue-50/50">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5.5 w-5.5" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{step.label}</span>
                  </div>
                  {i < pipeline.length - 1 && (
                    <ArrowRight className="hidden h-5 w-5 shrink-0 text-slate-300 lg:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: '128', label: 'Patients Monitored', icon: HeartPulse },
            { value: '94%', label: 'Sensitivity (demo)', icon: TrendingUp },
            { value: '31%', label: 'False Alert Reduction', icon: ShieldCheck },
            { value: '92%', label: 'Avg. Confidence', icon: Brain },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-3xl font-bold tracking-tight text-slate-900">{stat.value}</div>
                <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">
          Demo / simulated metrics — not clinically validated
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-14 text-center shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          </div>
          <div className="relative">
            <Lock className="mx-auto mb-4 h-10 w-10 text-white/80" />
            <h2 className="text-3xl font-bold text-white">Zero API Keys. Fully Offline.</h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              The entire risk engine runs locally in your browser. No external services, no cloud
              dependencies, no data leaves the device.
            </p>
            <Link
              href="/dashboard"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-base font-semibold text-blue-700 shadow-md transition-all hover:shadow-lg"
            >
              Launch Demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <HeartPulse className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-slate-700">VitalGuard AI</span>
            </div>
            <Badge variant="outline" className="border-slate-200 text-slate-500">
              Synthetic Data • Hackathon Prototype
            </Badge>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400 sm:text-left">
            VitalGuard AI is a prototype for clinical decision support. Risk scores are not medical
            diagnoses and should be reviewed by qualified healthcare professionals.
          </p>
        </div>
      </footer>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">Patient Risk Overview</div>
          <div className="text-xs text-slate-500">Aarav Sharma • PT-10482</div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          High Risk
        </span>
      </div>
      <div className="flex items-center gap-6">
        <RiskGauge score={82} level="high" confidence={91} size={160} animate={false} />
        <div className="flex-1 space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Heart Rate</span>
              <span className="font-semibold text-orange-600">+30.5%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-orange-500" style={{ width: '82%' }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">SpO₂</span>
              <span className="font-semibold text-orange-600">-4.1%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-orange-500" style={{ width: '68%' }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Temperature</span>
              <span className="font-semibold text-amber-600">+0.6°C</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-amber-500" style={{ width: '45%' }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Activity</span>
              <span className="font-semibold text-amber-600">-42.6%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-amber-500" style={{ width: '38%' }} />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-2.5">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
        <span className="text-xs font-medium text-amber-800">Early warning pattern detected</span>
      </div>
    </div>
  );
}
