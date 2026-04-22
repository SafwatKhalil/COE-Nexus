'use client'

import { usePortfolioSummary, useCapacityByRegion, useBottlenecks } from '@/hooks/use-dashboard'
import { Topbar } from '@/components/layout/topbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { MwByRegionChart } from '@/components/charts/mw-by-region'
import { formatMw, stageLabel } from '@/lib/utils'
import {
  Building2,
  Zap,
  TrendingUp,
  AlertTriangle,
  Activity,
  FileText,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function StatSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  trend?: { value: string; positive: boolean }
  variant?: 'default' | 'warning' | 'danger' | 'success'
}

function StatCard({ label, value, sub, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const iconColors: Record<string, string> = {
    default: 'bg-blue-50 text-blue-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-red-50 text-red-600',
    success: 'bg-emerald-50 text-emerald-600',
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm text-muted-foreground font-medium">{label}</span>
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconColors[variant])}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
          {trend && (
            <span className={cn('text-xs font-medium flex items-center gap-0.5', trend.positive ? 'text-emerald-600' : 'text-red-600')}>
              <ArrowUpRight className={cn('w-3 h-3', !trend.positive && 'rotate-180')} />
              {trend.value}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function BottleneckRow({ label, count, color }: { label: string; count: number; color: string }) {
  const w = Math.min(100, (count / 10) * 100)
  const colors: Record<string, string> = {
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    yellow: 'bg-amber-500',
    purple: 'bg-violet-500',
  }
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm text-muted-foreground w-40 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', colors[color])} style={{ width: `${w}%` }} />
      </div>
      <span className="text-sm font-semibold tabular-nums w-6 text-right">{count}</span>
    </div>
  )
}

export default function DashboardPage() {
  const summary = usePortfolioSummary()
  const regionData = useCapacityByRegion()
  const bottlenecks = useBottlenecks()

  const s = summary.data
  const regions = (regionData.data ?? []) as any[]
  const bn = bottlenecks.data

  const totalBlockers = bn
    ? bn.power.count + bn.permits.count + bn.environmental.count + bn.tasksBlocked.count
    : null

  return (
    <>
      <Topbar
        title="Portfolio Dashboard"
        description="Real-time view of your datacenter activation pipeline"
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* KPI row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {summary.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Total Sites"
                value={s?.totalSites ?? '—'}
                sub={`across ${Object.keys(s?.mwByRegion ?? {}).length} regions`}
                icon={Building2}
              />
              <StatCard
                label="Target Capacity"
                value={formatMw(s?.totalTargetMw)}
                sub={`${formatMw(s?.totalDeliverableMw)} deliverable`}
                icon={TrendingUp}
                variant="success"
              />
              <StatCard
                label="Avg Readiness Score"
                value={s?.avgReadinessScore != null ? `${s.avgReadinessScore}` : '—'}
                sub="out of 100"
                icon={Activity}
                variant={
                  s?.avgReadinessScore == null ? 'default'
                    : s.avgReadinessScore >= 70 ? 'success'
                    : s.avgReadinessScore >= 40 ? 'warning'
                    : 'danger'
                }
              />
              <StatCard
                label="Active Blockers"
                value={totalBlockers ?? '—'}
                sub="power · permits · env · tasks"
                icon={AlertTriangle}
                variant={totalBlockers ? 'danger' : 'default'}
              />
            </>
          )}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* MW by Region */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">MW by Region</CardTitle>
              <CardDescription>Target capacity by geography</CardDescription>
            </CardHeader>
            <CardContent>
              {regionData.isLoading ? (
                <Skeleton className="h-60 w-full rounded-lg" />
              ) : regions.length === 0 ? (
                <div className="h-60 flex items-center justify-center text-sm text-muted-foreground">No data</div>
              ) : (
                <MwByRegionChart data={regions} />
              )}
            </CardContent>
          </Card>

          {/* Sites by Stage */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">By Lifecycle Stage</CardTitle>
              <CardDescription>Site count per stage</CardDescription>
            </CardHeader>
            <CardContent>
              {summary.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : (
                <div className="space-y-1">
                  {s?.sitesByStage &&
                    Object.entries(s.sitesByStage)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([stage, count]) => {
                        const pct = Math.round(((count as number) / s.totalSites) * 100)
                        const stageBadgeClass: Record<string, string> = {
                          prospect: 'stage-badge-prospect',
                          feasibility: 'stage-badge-feasibility',
                          entitlement: 'stage-badge-entitlement',
                          development: 'stage-badge-development',
                          construction: 'stage-badge-construction',
                          commissioning: 'stage-badge-commissioning',
                          operational: 'stage-badge-operational',
                        }
                        return (
                          <div key={stage} className="flex items-center gap-3 py-1.5">
                            <span className={cn('text-[0.7rem] font-medium px-1.5 py-0.5 rounded border w-28 text-center flex-shrink-0', stageBadgeClass[stage])}>
                              {stageLabel(stage)}
                            </span>
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-sm font-semibold tabular-nums w-4 text-right">{count as number}</span>
                          </div>
                        )
                      })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottlenecks + Region table */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Bottlenecks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Active Blockers</CardTitle>
              <CardDescription>Issues preventing site activation</CardDescription>
            </CardHeader>
            <CardContent>
              {bottlenecks.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
                </div>
              ) : (
                <div className="space-y-1">
                  <BottleneckRow label="Power not committed" count={bn?.power.count ?? 0} color="orange" />
                  <BottleneckRow label="Blocking permits open" count={bn?.permits.count ?? 0} color="red" />
                  <BottleneckRow label="Environmental issues" count={bn?.environmental.count ?? 0} color="yellow" />
                  <BottleneckRow label="Tasks blocked" count={bn?.tasksBlocked.count ?? 0} color="purple" />

                  {bn?.permits.items?.length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <div className="text-xs font-medium text-muted-foreground mb-2">Top blocking permits</div>
                      <div className="space-y-1.5">
                        {bn.permits.items.slice(0, 4).map((p: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-foreground font-medium truncate max-w-[160px]">{p.siteName}</span>
                            <span className="text-muted-foreground mx-2 truncate">{p.permitType}</span>
                            <Badge
                              variant="outline"
                              className={cn('text-[0.6rem] px-1.5 shrink-0',
                                p.riskLevel === 'high' ? 'border-red-200 text-red-600 bg-red-50' :
                                p.riskLevel === 'medium' ? 'border-amber-200 text-amber-600 bg-amber-50' :
                                'border-slate-200 text-slate-600'
                              )}
                            >
                              {p.riskLevel}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Regional summary table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Regional Capacity</CardTitle>
              <CardDescription>MW and site count by region</CardDescription>
            </CardHeader>
            <CardContent>
              {regionData.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <div className="space-y-1">
                  {regions.map((r: any) => (
                    <div key={r.region} className="flex items-center py-2.5 border-b border-border last:border-0">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{r.region}</div>
                        <div className="text-xs text-muted-foreground">{r.siteCount} site{r.siteCount !== 1 ? 's' : ''}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold tabular-nums">{formatMw(r.totalTargetMw)}</div>
                        {r.avgReadinessScore != null && (
                          <div className={cn('text-xs font-medium',
                            r.avgReadinessScore >= 70 ? 'text-emerald-600' :
                            r.avgReadinessScore >= 40 ? 'text-amber-600' : 'text-red-600'
                          )}>
                            {r.avgReadinessScore} readiness
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {regions.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-6">No region data</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
