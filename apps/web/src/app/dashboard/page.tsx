'use client'

import { usePortfolioSummary, useCapacityByRegion, useBottlenecks } from '@/hooks/use-dashboard'
import { MwByRegionChart } from '@/components/charts/mw-by-region'
import { formatMw, stageLabel } from '@/lib/utils'
import { AlertTriangle, Zap, FileText, TrendingUp, Building2 } from 'lucide-react'

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = 'blue',
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color?: 'blue' | 'green' | 'yellow' | 'red'
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const summary = usePortfolioSummary()
  const regionData = useCapacityByRegion()
  const bottlenecks = useBottlenecks()

  if (summary.isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading portfolio data...
      </div>
    )
  }

  const s = summary.data
  const regions = regionData.data ?? []
  const bn = bottlenecks.data

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Sites"
          value={s?.totalSites ?? '—'}
          icon={Building2}
          color="blue"
        />
        <StatCard
          label="Target MW"
          value={formatMw(s?.totalTargetMw)}
          sub={`${formatMw(s?.totalDeliverableMw)} deliverable`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          label="Avg Readiness"
          value={s?.avgReadinessScore != null ? `${s.avgReadinessScore}/100` : '—'}
          icon={Zap}
          color="yellow"
        />
        <StatCard
          label="Open Blockers"
          value={
            bn
              ? bn.power.count + bn.permits.count + bn.environmental.count + bn.tasksBlocked.count
              : '—'
          }
          sub="power + permits + env + tasks"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MW by Region */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Target MW by Region</h2>
          {regions.length > 0 ? (
            <MwByRegionChart data={regions} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No region data available
            </div>
          )}
        </div>

        {/* Sites by Stage */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Sites by Lifecycle Stage</h2>
          <div className="space-y-2">
            {s?.sitesByStage &&
              Object.entries(s.sitesByStage).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{stageLabel(stage)}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-brand-500 h-2 rounded-full"
                        style={{
                          width: `${Math.round(((count as number) / s.totalSites) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{count as number}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Bottlenecks */}
      {bn && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Active Bottlenecks</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <BottleneckCard label="Power Issues" count={bn.power.count} color="orange" />
            <BottleneckCard label="Blocking Permits" count={bn.permits.count} color="red" />
            <BottleneckCard label="Environmental" count={bn.environmental.count} color="yellow" />
            <BottleneckCard label="Blocked Tasks" count={bn.tasksBlocked.count} color="purple" />
          </div>

          {bn.permits.count > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Top Blocking Permits</p>
              <div className="space-y-1">
                {bn.permits.items.slice(0, 5).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                    <span className="text-gray-700">{item.siteName}</span>
                    <span className="text-gray-500">{item.permitType}</span>
                    <span className={`text-xs font-medium ${item.riskLevel === 'high' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {item.riskLevel} risk
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BottleneckCard({
  label,
  count,
  color,
}: {
  label: string
  count: number
  color: string
}) {
  const colorMap: Record<string, string> = {
    orange: 'text-orange-600 bg-orange-50',
    red: 'text-red-600 bg-red-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    purple: 'text-purple-600 bg-purple-50',
  }
  return (
    <div className={`rounded-lg p-3 ${colorMap[color]}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  )
}
