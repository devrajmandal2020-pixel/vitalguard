'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Bell,
  BarChart3,
  Settings,
  Activity,
  HeartPulse,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
          <HeartPulse className="h-5.5 w-5.5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-base font-bold tracking-tight text-foreground">
            VitalGuard AI
          </div>
          <div className="text-[11px] font-medium text-muted-foreground">
            Risk Detection Platform
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
              {item.label}
              {item.label === 'Alerts' && (
                <Badge className="ml-auto bg-destructive px-1.5 py-0 text-[10px] text-destructive-foreground">
                  4
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-accent/50 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">Demo Mode</span>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Synthetic data only. Not for clinical use.
          </p>
        </div>
      </div>
    </div>
  );
}
