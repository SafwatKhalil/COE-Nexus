'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useSites } from '@/hooks/use-sites'
import { Topbar } from '@/components/layout/topbar'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, formatMw } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import { TrendingUp, AlertTriangle, RefreshCw, Building2 } from 'lucide-react'
import { toast } from 'sonner'

interface PortfolioForecast {
  totalExpectedMw: number
  forecastCount: number
  byQuarter: { quarter: string; expectedMw: number; siteCount: number }[]
  byRegion: { region: string; expectedMw: number; siteCount: number }[]
}

function usePortfolioForecast() {
  return useQuery({
    queryKey: ['portfolio-forecast'],
    queryFn: async () => {
      const { data } = await api.get<PortfolioForecast>('/portfolio/forecast')
      return data
    },
  })
}

function useForecastSite(siteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/sites/${siteId}/forecast`)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio-forecast'] })
      toast.success('Forecast updated')
    },
    onError: () => toast.error('Forecast failed'),
  })
}

function QuarterChart({ data }: { data: PortfolioForecast['byQuarter'] }) {
  if (data.length === 0) {
    return (
      <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
        No forecasts computed yet. Run a forecast on individual sites to populate this chart.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="mwGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v) => `${v}MW`}
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false} tickLine={false} width={52}
        />
        <Tooltip
          formatter={(v: number) => [`${v.toFixed(0)} MW`, 'Expected']}
          contentStyle={{
            border: '1px solid var(--border)', borderRadius: '8px',
            fontSize: '12px', background: 'var(--card)', color: 'var(--card-foreground)',
          }}
          cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
        />
        <Area type="monotone" dataKey="expectedMw" stroke="var(--chart-1)" strokeWidth={2} fill="url(#mwGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function RegionChart({ data }: { data: PortfolioForecast['byRegion'] }) {
  if (data.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => `${v}MW`} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="region" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={80} />
        <Tooltip
          formatter={(v: number) => [`${v.toFixed(0)} MW`, 'Expected']}
          contentStyle={{
            border: '1px solid var(--border)', borderRadius: '8px',
            fontSize: '12px', background: 'var(--card)', color: 'var(--card-foreground)',
          }}
        />
        <Bar dataKey="expectedMw" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function AtRiskSiteRow({ site }: { site: any }) {
  const forecast = useForecastSite(site.id)
  const score = site.readinessSnapshots?.[0]?.score
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{site.name}</div>
        <div className="text-xs text-muted-foreground">{site.region} · {site.lifecycleStage}</div>
      </div>
      <span className={cn(
        'inline-flex items-center justify-center w-10 h-6 text-xs font-bold rounded-md border tabular-nums flex-shrink-0',
        score == null ? 'text-muted-foreground' :
        score >= 70 ? 'score-high' : score >= 40 ? 'score-medium' : 'score-low',
      )}>
        {score != null ? Math.round(score) : '—'}
      </span>
      <span className="text-sm font-mono text-muted-foreground flex-shrink-0 w-20 text-right">
        {formatMw(site.targetMw)}
      </span>
      <Button
        variant="outline" size="sm"
        className="h-7 px-2.5 text-xs flex-shrink-0"
        onClick={() => forecast.mutate()}
        disabled={forecast.isPending}
      >
        <RefreshCw className={cn('w-3 h-3 mr-1', forecast.isPending && 'animate-spin')} />
        Forecast
      </Button>
    </div>
  )
}

export default function ForecastingPage() {
  const portfolioForecast = usePortfolioForecast()
  const sitesQuery = useSites({ pageSize: 100 })

  const sites = (sitesQuery.data?.data ?? []) as any[]
  const atRiskSites = sites
    .filter((s) => {
      const score = s.readinessSnapshots?.[0]?.score
      return score == null || Number(score) < 60
    })
    .sort((a, b) => {
      const sa = a.readinessSnapshots?.[0]?.score ?? 0
      const sb = b.readinessSnapshots?.[0]?.score ?? 0
      return Number(sa) - Number(sb)
    })
    .slice(0, 12)

  const pf = portfolioForecast.data

  return (
    <AppShell>
      <Topbar
        title="Forecasting"
        description="Capacity delivery timeline and at-risk site projections"
      />
      <div className="flex-1 p-6 space-y-4 overflow-auto">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">Total Forecasted</span>
                <TrendingUp className="w-4 h-4 text-muted-foreground mt-0.5" />
              </div>
              {portfolioForecast.isLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-2xl font-bold tabular-nums">
                  {pf ? formatMw(pf.totalExpectedMw) : '—'}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {pf?.forecastCount ?? 0} site forecasts computed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">Forecast Horizon</span>
                <TrendingUp className="w-4 h-4 text-muted-foreground mt-0.5" />
              </div>
              {portfolioForecast.isLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-2xl font-bold tabular-nums">
                  {pf?.byQuarter.length ?? 0} quarters
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {pf?.byQuarter[0]?.quarter ?? '—'} to {pf?.byQuarter[pf.byQuarter.length - 1]?.quarter ?? '—'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">At-Risk Sites</span>
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
              </div>
              {sitesQuery.isLoading ? <Skeleton className="h-8 w-12" /> : (
                <div className={cn('text-2xl font-bold tabular-nums', atRiskSites.length > 0 ? 'text-amber-600' : '')}>
                  {atRiskSites.length}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">readiness score below 60</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">MW Online by Quarter</CardTitle>
              <CardDescription>Expected capacity delivery timeline</CardDescription>
            </CardHeader>
            <CardContent>
              {portfolioForecast.isLoading
                ? <Skeleton className="h-52 w-full rounded-lg" />
                : <QuarterChart data={pf?.byQuarter ?? []} />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">By Region</CardTitle>
              <CardDescription>Forecasted MW per geography</CardDescription>
            </CardHeader>
            <CardContent>
              {portfolioForecast.isLoading
                ? <Skeleton className="h-44 w-full" />
                : <RegionChart data={pf?.byRegion ?? []} />}
            </CardContent>
          </Card>
        </div>

        {/* At-risk sites */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              At-Risk Sites
            </CardTitle>
            <CardDescription>Sites with readiness below 60 — run forecasts to update projections</CardDescription>
          </CardHeader>
          <CardContent>
            {sitesQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : atRiskSites.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2 text-muted-foreground">
                <Building2 className="w-7 h-7 opacity-30" />
                <span className="text-sm">All sites have readiness score ≥ 60</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center text-xs text-muted-foreground font-medium pb-2 mb-1 border-b border-border">
                  <span className="flex-1">Site</span>
                  <span className="w-10 text-center">Score</span>
                  <span className="w-20 text-right mr-20">Target MW</span>
                </div>
                {atRiskSites.map((site) => (
                  <AtRiskSiteRow key={site.id} site={site} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
