'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, AlertOctagon, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatients } from '@/components/providers/patient-provider';
import { timeAgo } from '@/lib/format';
import { toast } from 'sonner';

type FilterTab = 'all' | 'urgent' | 'high' | 'medium' | 'acknowledged';

const severityConfig = {
  urgent: {
    label: 'Urgent',
    icon: AlertOctagon,
    iconColor: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
  },
  high: {
    label: 'High',
    icon: AlertTriangle,
    iconColor: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  medium: {
    label: 'Medium',
    icon: Info,
    iconColor: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export default function AlertsPage() {
  const { allAlerts, acknowledgeAlert } = usePatients();
  const [filter, setFilter] = useState<FilterTab>('all');

  const filtered = useMemo(() => {
    let alerts = [...allAlerts].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    if (filter === 'acknowledged') {
      alerts = alerts.filter((a) => a.acknowledged);
    } else if (filter !== 'all') {
      alerts = alerts.filter((a) => a.severity === filter);
    }
    return alerts;
  }, [allAlerts, filter]);

  const counts = useMemo(() => {
    const c = { all: allAlerts.length, urgent: 0, high: 0, medium: 0, acknowledged: 0 };
    allAlerts.forEach((a) => {
      if (a.severity === 'urgent') c.urgent++;
      if (a.severity === 'high') c.high++;
      if (a.severity === 'medium') c.medium++;
      if (a.acknowledged) c.acknowledged++;
    });
    return c;
  }, [allAlerts]);

  const handleAcknowledge = (alertId: string, patientId: string, patientName: string) => {
    acknowledgeAlert(patientId, alertId);
    toast.success('Alert acknowledged', {
      description: `${patientName}'s alert has been acknowledged.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alert Center</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor and manage patient risk alerts across all monitored patients.
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Alerts', value: counts.all, icon: Bell, color: 'text-blue-600 bg-blue-50' },
          { label: 'Urgent', value: counts.urgent, icon: AlertOctagon, color: 'text-red-600 bg-red-50' },
          { label: 'High', value: counts.high, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
          { label: 'Acknowledged', value: counts.acknowledged, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">{kpi.value}</div>
                  <div className="text-xs text-muted-foreground">{kpi.label}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
        <TabsList className="flex h-10 flex-wrap gap-1">
          <TabsTrigger value="all" className="text-xs">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="urgent" className="text-xs">Urgent ({counts.urgent})</TabsTrigger>
          <TabsTrigger value="high" className="text-xs">High ({counts.high})</TabsTrigger>
          <TabsTrigger value="medium" className="text-xs">Medium ({counts.medium})</TabsTrigger>
          <TabsTrigger value="acknowledged" className="text-xs">Acknowledged ({counts.acknowledged})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-medium">No alerts in this category</p>
              <p className="mt-1 text-xs text-muted-foreground">All clear for now.</p>
            </div>
          </Card>
        )}
        {filtered.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <Card key={alert.id} className={`overflow-hidden ${alert.acknowledged ? 'opacity-60' : ''}`}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg} ${config.border} border`}>
                    <Icon className={`h-5 w-5 ${config.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${config.badge}`}>
                        {config.label}
                      </span>
                      {alert.acknowledged && (
                        <Badge variant="outline" className="text-[10px] h-4 py-0 border-emerald-200 bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="mr-1 h-2.5 w-2.5" /> Acknowledged
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold">{alert.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <Link href={`/patients/${alert.patientId}`} className="font-medium text-primary hover:underline">
                        {alert.patientName}
                      </Link>
                      <span className="text-muted-foreground/40">•</span>
                      <span>{alert.signal}</span>
                      <span className="text-muted-foreground/40">•</span>
                      <span>{timeAgo(alert.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/patients/${alert.patientId}`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant={alert.severity === 'urgent' ? 'destructive' : 'default'}
                      className="gap-1.5"
                      onClick={() => handleAcknowledge(alert.id, alert.patientId, alert.patientName)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Acknowledge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
