'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSites } from '@/hooks/use-sites'
import { readinessBg, stageLabel, controlStatusLabel, formatMw, cn } from '@/lib/utils'
import { Plus, ChevronRight } from 'lucide-react'

const STAGES = [
  'prospect', 'feasibility', 'entitlement', 'development',
  'construction', 'commissioning', 'operational',
]

export default function SitesPage() {
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useSites({
    search: search || undefined,
    lifecycleStage: stageFilter || undefined,
    page,
    pageSize: 20,
  })

  const sites = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search sites..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 min-w-48 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <select
          value={stageFilter}
          onChange={(e) => { setStageFilter(e.target.value); setPage(1) }}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{stageLabel(s)}</option>
          ))}
        </select>
        <div className="ml-auto">
          <button className="flex items-center gap-2 px-4 py-1.5 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Site
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading sites...</div>
        ) : sites.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No sites found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Site</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Region</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Stage</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Control</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Target MW</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Readiness</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sites.map((site: any) => {
                const score = site.readinessSnapshots?.[0]?.score
                return (
                  <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-gray-900">{site.name}</span>
                        {site.siteCode && (
                          <span className="ml-2 text-xs text-gray-400">{site.siteCode}</span>
                        )}
                      </div>
                      {site.metro && <div className="text-xs text-gray-400">{site.metro}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{site.region ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {stageLabel(site.lifecycleStage)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {controlStatusLabel(site.controlStatus)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 font-mono">
                      {formatMw(site.targetMw)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {score != null ? (
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-bold',
                            readinessBg(Number(score)),
                          )}
                        >
                          {Math.round(Number(score))}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Not scored</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/sites/${site.id}`}
                        className="flex items-center justify-end text-gray-400 hover:text-brand-600 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>{meta.total} sites total</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span>
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
