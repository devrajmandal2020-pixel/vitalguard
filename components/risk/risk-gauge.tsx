'use client';

import { useEffect, useState } from 'react';
import type { RiskLevel } from '@/types';
import { riskLevelLabel } from '@/lib/risk-engine';

const levelColors: Record<RiskLevel, string> = {
  low: 'hsl(var(--risk-low))',
  moderate: 'hsl(var(--risk-moderate))',
  high: 'hsl(var(--risk-high))',
  urgent: 'hsl(var(--risk-urgent))',
};

export function RiskGauge({
  score,
  level,
  confidence,
  size = 200,
  animate = true,
}: {
  score: number;
  level: RiskLevel;
  confidence: number;
  size?: number;
  animate?: boolean;
}) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = levelColors[level];

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }
    const duration = 900;
    const steps = 40;
    const stepDuration = duration / steps;
    const increment = score / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, stepDuration);
    return () => clearInterval(interval);
  }, [score, animate]);

  const progress = displayScore / 100;
  const dashOffset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: animate ? 'stroke-dashoffset 0.1s linear' : 'none' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tabular-nums tracking-tight" style={{ color }}>
          {displayScore}
        </span>
        <span className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          / 100
        </span>
        <span className="mt-2 text-sm font-bold" style={{ color }}>
          {riskLevelLabel(level)}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          {confidence}% confidence
        </span>
      </div>
    </div>
  );
}
