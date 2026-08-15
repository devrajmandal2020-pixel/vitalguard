'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { RiskFactor } from '@/types';

export function ExplainabilityPanel({ factors, score }: { factors: RiskFactor[]; score: number }) {
  const [expanded, setExpanded] = useState(false);

  const maxPoints = Math.max(...factors.map((f) => f.points), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Why this score?</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="gap-1.5"
          >
            {expanded ? (
              <>Hide <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>Expand <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4 animate-fade-in">
          {factors.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No significant risk factors detected. All vital signals are within the patient's baseline range.
            </p>
          )}
          {factors.map((factor) => (
            <div key={factor.signal}>
              <div className="mb-1.5 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold">{factor.label}</span>
                  <span className={`ml-2 text-sm font-bold tabular-nums ${
                    factor.points >= 15 ? 'text-orange-600' : factor.points >= 8 ? 'text-amber-600' : 'text-muted-foreground'
                  }`}>
                    {factor.direction === 'up' ? '+' : ''}{factor.points} pts
                  </span>
                </div>
                <span className={`text-xs font-medium ${
                  factor.direction === 'up' ? 'text-orange-600' : 'text-blue-600'
                }`}>
                  {factor.direction === 'up' ? '↑' : '↓'} {Math.abs(factor.deviationPct).toFixed(1)}%
                </span>
              </div>
              {/* Contribution bar */}
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    factor.points >= 15 ? 'bg-orange-500' : factor.points >= 8 ? 'bg-amber-500' : 'bg-blue-400'
                  }`}
                  style={{ width: `${(factor.points / maxPoints) * 100}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {factor.description}
              </p>
            </div>
          ))}

          <div className="flex items-start gap-2 rounded-lg bg-blue-50/50 p-3">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
            <p className="text-xs leading-relaxed text-blue-800">
              Risk factors are contributing signals, not diagnoses. The score is derived from weighted
              deviations of each signal from the patient's personalized baseline.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
