import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types';

const levelConfig: Record<RiskLevel, { label: string; classes: string; dot: string }> = {
  low: {
    label: 'Low Risk',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  moderate: {
    label: 'Moderate',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  high: {
    label: 'High Risk',
    classes: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
  },
  urgent: {
    label: 'Urgent Review',
    classes: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
};

export function RiskBadge({ level, className, showDot = true }: { level: RiskLevel; className?: string; showDot?: boolean }) {
  const config = levelConfig[level];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold', config.classes, className)}>
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />}
      {config.label}
    </span>
  );
}

export function riskBadgeClasses(level: RiskLevel): string {
  return levelConfig[level].classes;
}

export function riskDotColor(level: RiskLevel): string {
  return levelConfig[level].dot;
}
