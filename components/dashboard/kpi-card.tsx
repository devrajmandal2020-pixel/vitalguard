import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' };
  iconColor?: string;
  iconBg?: string;
}

export function KpiCard({ label, value, icon: Icon, trend, iconColor = 'text-primary', iconBg = 'bg-primary/10' }: KpiCardProps) {
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;
  const trendColor = trend?.direction === 'up' ? 'text-emerald-600' : trend?.direction === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card className="p-5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', iconBg)}>
          <Icon className={cn('h-5.5 w-5.5', iconColor)} strokeWidth={2} />
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trend.value}
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold tabular-nums tracking-tight">{value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
}
