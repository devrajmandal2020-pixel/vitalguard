'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, ArrowRight, UserPlus, Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/shared/risk-badge';
import { usePatientAssessments } from '@/components/providers/patient-provider';
import { timeAgo } from '@/lib/format';
import type { RiskLevel } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const riskFilters: { value: RiskLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'All Risk Levels' },
  { value: 'low', label: 'Low Risk' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High Risk' },
  { value: 'urgent', label: 'Urgent Review' },
];

export default function PatientsPage() {
  const assessments = usePatientAssessments();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');

  const filtered = useMemo(() => {
    return assessments
      .filter(({ patient, assessment }) => {
        const matchesSearch =
          patient.name.toLowerCase().includes(search.toLowerCase()) ||
          patient.id.toLowerCase().includes(search.toLowerCase()) ||
          patient.scenario.toLowerCase().includes(search.toLowerCase());
        const matchesRisk = riskFilter === 'all' || assessment.level === riskFilter;
        return matchesSearch && matchesRisk;
      })
      .sort((a, b) => b.assessment.score - a.assessment.score);
  }, [assessments, search, riskFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="mt-1 text-muted-foreground">
            {assessments.length} patients under active monitoring
          </p>
        </div>
        <Link href="/patients/new">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Patient
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or scenario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v as RiskLevel | 'all')}>
          <SelectTrigger className="sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {riskFilters.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop table */}
      <Card className="hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Age</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Latest Signal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Updated</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(({ patient, assessment }) => {
                const topFactor = assessment.factors[0];
                const latestSignal = topFactor
                  ? `${topFactor.direction === 'up' ? 'Elevated' : 'Decreased'} ${topFactor.label.toLowerCase()}`
                  : 'Stable readings';
                return (
                  <tr key={patient.id} className="group transition-colors hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <Link href={`/patients/${patient.id}`} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {patient.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-medium group-hover:text-primary transition-colors">{patient.name}</div>
                          <div className="text-xs text-muted-foreground">{patient.id}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">{patient.age}</td>
                    <td className="px-4 py-3">
                      <span className={`text-lg font-bold tabular-nums ${
                        assessment.level === 'urgent' ? 'text-red-600' :
                        assessment.level === 'high' ? 'text-orange-600' :
                        assessment.level === 'moderate' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {assessment.score}
                      </span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={assessment.level} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm capitalize text-muted-foreground">{latestSignal}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${assessment.confidence >= 80 ? 'bg-emerald-500' : assessment.confidence >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}
                            style={{ width: `${assessment.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium tabular-nums">{assessment.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {timeAgo(patient.history[patient.history.length - 1]?.timestamp ?? new Date().toISOString())}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No patients match your filters.
          </div>
        )}
      </Card>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {filtered.map(({ patient, assessment }) => (
          <Link key={patient.id} href={`/patients/${patient.id}`}>
            <Card className="p-4 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {patient.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{patient.name}</div>
                    <div className="text-xs text-muted-foreground">{patient.age} yrs • {patient.id}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold tabular-nums ${
                    assessment.level === 'urgent' ? 'text-red-600' :
                    assessment.level === 'high' ? 'text-orange-600' :
                    assessment.level === 'moderate' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {assessment.score}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <RiskBadge level={assessment.level} />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {assessment.confidence}% conf.
                  </span>
                  <span>{timeAgo(patient.history[patient.history.length - 1]?.timestamp ?? new Date().toISOString())}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <Card className="py-12 text-center text-sm text-muted-foreground">
            No patients match your filters.
          </Card>
        )}
      </div>
    </div>
  );
}
