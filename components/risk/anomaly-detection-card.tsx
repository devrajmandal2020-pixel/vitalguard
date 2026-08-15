import { ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Anomaly } from '@/types';
import { timeAgo } from '@/lib/format';

const severityConfig = {
  high: { label: 'HIGH', classes: 'bg-red-50 text-red-700 border-red-200' },
  medium: { label: 'MEDIUM', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  low: { label: 'LOW', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export function AnomalyDetection({ anomalies }: { anomalies: Anomaly[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Anomaly Detection</CardTitle>
          {anomalies.length > 0 && (
            <span className="text-sm font-medium text-muted-foreground">
              {anomalies.length} {anomalies.length === 1 ? 'anomaly' : 'anomalies'} in the last 24 hours
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <AlertCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-sm font-medium">No anomalies detected</p>
            <p className="mt-1 text-xs text-muted-foreground">All signals are within baseline range</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {anomalies.map((anomaly) => {
              const sev = severityConfig[anomaly.severity];
              return (
                <div
                  key={anomaly.id}
                  className="rounded-lg border p-4 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{anomaly.label}</span>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${sev.classes}`}>
                      {sev.label}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current</span>
                      <span className="font-semibold tabular-nums">
                        {anomaly.current} {anomaly.baseline && ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Baseline</span>
                      {anomaly.baseline ? (
                        <span className="tabular-nums text-muted-foreground">
                          {anomaly.baseline.min}–{anomaly.baseline.max}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deviation</span>
                      <span className={`flex items-center gap-0.5 font-semibold tabular-nums ${
                        anomaly.severity === 'high' ? 'text-red-600' :
                        anomaly.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        {anomaly.direction === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {Math.abs(anomaly.deviationPct).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t">
                      <span className="text-muted-foreground">Detected</span>
                      <span className="text-muted-foreground">{timeAgo(anomaly.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
