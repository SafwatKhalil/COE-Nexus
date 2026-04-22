'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSites } from '@/hooks/use-sites'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, formatMw, stageLabel, controlStatusLabel } from '@/lib/utils'
import { Plus, Search, ChevronRight, MapPin } from 'lucide-react'

const STAGES = [
  'prospect', 'feasibility', 'entitlement', 'development',
  'construction', 'commissioning', 'operational',
]

const stageBadgeClass: Record<string, string> = {
  prospect: 'stage-badge-prospect',
  feasibility: 'stage-badge-feasibility',
  entitlement: 'stage-badge-entitlement',
  development: 'stage-badge-development',
  construction: 'stage-badge-construction',
  commissioning: 'stage-badge-commissioning',
  operational: 'stage-badge-operational',
}

function ReadinessBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-xs text-muted-foreground">—</span>
  const s = Number(score)
  return (
    <span className={cn(
      'inline-flex items-center justify-center w-10 h-6 text-xs font-bold rounded-md border tabular-nums',
      s >= 70 ? 'score-high' : s >= 40 ? 'score-medium' : 'score-low',
    )}>
      {Math.round(s)}
    </span>
  )
}

export default function SitesPage() {
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useSites({
    search: search || undefined,
    lifecycleStage: stageFilter === 'all' ? undefined : stageFilter,
    page,
    pageSize: 25,
  })

  const sites = (data?.data ?? []) as any[]
  const meta = data?.meta

  return (
    <>
      <Topbar
        title="Sites"
        description={meta ? `${meta.total} sites in portfolio` : 'All datacenter sites'}
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New Site
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-4 overflow-auto">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search sites, codes, metros…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Select
            value={stageFilter}
            onValueChange={(v) => { if (v) { setStageFilter(v); setPage(1) } }}
          >
            <SelectTrigger className="w-44 h-8 text-sm">
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {STAGES.map((s) => (
                <SelectItem key={s} value={s}>{stageLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[260px]">Site</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Control</TableHead>
                <TableHead className="text-right">Target MW</TableHead>
                <TableHead className="text-right">Deliverable</TableHead>
                <TableHead className="text-center w-16">Score</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : sites.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <MapPin className="w-8 h-8 opacity-30" />
                          <span className="text-sm">No sites found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                : sites.map((site) => (
                    <TableRow
                      key={site.id}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <Link href={`/sites/${site.id}`} className="block">
                          <div className="font-medium text-sm">{site.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {site.siteCode && (
                              <span className="text-[0.7rem] font-mono text-muted-foreground bg-muted px-1 rounded">
                                {site.siteCode}
                              </span>
                            )}
                            {site.metro && (
                              <span className="text-[0.7rem] text-muted-foreground">{site.metro}</span>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/sites/${site.id}`} className="text-sm text-muted-foreground block">
                          {site.region ?? '—'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/sites/${site.id}`} className="block">
                          <span className={cn('text-[0.7rem] font-medium px-1.5 py-0.5 rounded border', stageBadgeClass[site.lifecycleStage])}>
                            {stageLabel(site.lifecycleStage)}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/sites/${site.id}`} className="text-sm text-muted-foreground block">
                          {controlStatusLabel(site.controlStatus)}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/sites/${site.id}`} className="text-sm font-mono font-medium block">
                          {formatMw(site.targetMw)}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/sites/${site.id}`} className="text-sm font-mono text-muted-foreground block">
                          {formatMw(site.deliverableMw)}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link href={`/sites/${site.id}`} className="flex justify-center">
                          <ReadinessBadge score={site.readinessSnapshots?.[0]?.score} />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/sites/${site.id}`} className="flex items-center justify-center text-muted-foreground hover:text-foreground">
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-sm text-muted-foreground">
              <span>{meta.total} sites · page {page} of {meta.totalPages}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >Previous</Button>
                <Button
                  variant="outline" size="sm"
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                >Next</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
