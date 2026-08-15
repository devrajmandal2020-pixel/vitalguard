'use client';

import { SidebarContent } from '@/components/layout/sidebar-content';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { AlertTriangle, ChevronRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function AppShell({ children, breadcrumb }: { children: React.ReactNode; breadcrumb?: { label: string; href?: string }[] }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-card lg:block">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur-md lg:px-8">
          <MobileSidebar />
          
          {breadcrumb && (
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link href="/dashboard" className="transition-colors hover:text-foreground">
                Upchar
              </Link>
              {breadcrumb.map((crumb) => (
                <span key={crumb.label} className="flex items-center gap-1.5">
                  <ChevronRight className="h-4.5 w-4.5" />
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition-colors hover:text-foreground">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Clinical Environment</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
