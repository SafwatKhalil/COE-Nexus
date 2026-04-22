'use client'

import { useState, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Topbar } from '@/components/layout/topbar'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Activity, User, Globe, Filter } from 'lucide-react'

const ENTITY_TYPES = [
  { value: 'site', label: 'Site' },
  { value: 'permit', label: 'Permit' },
  { value: 'utility', label: 'Utility' },
  { value: 'task', label: 'Task' },
  { value: 'document', label: 'Document' },
  { value: 'user', label: 'User' },
]

const ACTIONS = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'login', label: 'Login' },
  { value: 'export', label: 'Export' },
]

function actionColor(action: string) {
  switch (action) {
    case 'create': return 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-950'
    case 'delete': return 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950'
    case 'update': return 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-950'
    default: return 'border-slate-200 text-slate-600 bg-slate-50 dark:border-slate-700 dark:text-slate-400'
  }
}

function fmtTime(date: string) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

interface AuditEvent {
  id: string
  action: string
  entityType: string
  entityId: string | null
  entityName: string | null
  userId: string | null
  userEmail: string | null
  ipAddress: string | null
  userAgent: string | null
  beforeState: unknown
  afterState: unknown
  metadata: unknown
  createdAt: string
}

interface AuditPage {
  data: AuditEvent[]
  meta: { total: number; page: number; pageSize: number; totalPages: number }
}

function DiffView({ before, after }: { before: unknown; after: unknown }) {
  if (!before && !after) return <p className="text-sm text-muted-foreground">No state captured.</p>

  const b = before as Record<string, unknown> | null
  const a = after as Record<string, unknown> | null
  const keys = Array.from(new Set([...Object.keys(b ?? {}), ...Object.keys(a ?? {})]))

  const changed = keys.filter((k) => {
    const bv = JSON.stringify(b?.[k])
    const av = JSON.stringify(a?.[k])
    return bv !== av
  })

  if (changed.length === 0) return <p className="text-sm text-muted-foreground">No field-level changes captured.</p>

  return (
    <div className="space-y-2">
      {changed.map((key) => (
        <div key={key} className="text-sm">
          <span className="font-mono text-xs text-muted-foreground">{key}</span>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {b?.[key] !== undefined && (
              <div className="rounded bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-2 py-1 font-mono text-xs text-red-700 dark:text-red-400 break-all">
                − {JSON.stringify(b[key])}
              </div>
            )}
            {a?.[key] !== undefined && (
              <div className="rounded bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2 py-1 font-mono text-xs text-emerald-700 dark:text-emerald-400 break-all">
                + {JSON.stringify(a[key])}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AuditPage() {
  const [entityTypeFilter, setEntityTypeFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['audit', entityTypeFilter, actionFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get<AuditPage>('/audit', {
        params: {
          page: pageParam,
          pageSize: 40,
          entityType: entityTypeFilter === 'all' ? undefined : entityTypeFilter,
          action: actionFilter === 'all' ? undefined : actionFilter,
        },
      })
      return data
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  })

  const events = data?.pages.flatMap((p) => p.data) ?? []
  const total = data?.pages[0]?.meta.total ?? 0

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 200 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return (
    <AppShell>
      <Topbar
        title="Audit Log"
        description={total ? `${total.toLocaleString()} events recorded` : 'Platform-wide event history'}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filters */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-card flex-shrink-0">
          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <Select value={entityTypeFilter} onValueChange={(v) => { if (v) setEntityTypeFilter(v) }}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="All entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entities</SelectItem>
              {ENTITY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={(v) => { if (v) setActionFilter(v) }}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {ACTIONS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Event feed */}
        <div className="flex-1 overflow-y-auto px-6 py-4" onScroll={handleScroll}>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
              <Activity className="w-8 h-8 opacity-30" />
              <span className="text-sm">No events found</span>
            </div>
          ) : (
            <div className="space-y-1">
              {events.map((event, i) => {
                const showDate =
                  i === 0 ||
                  new Date(event.createdAt).toDateString() !== new Date(events[i - 1].createdAt).toDateString()

                return (
                  <div key={event.id}>
                    {showDate && (
                      <div className="flex items-center gap-3 py-2 mb-1">
                        <Separator className="flex-1" />
                        <span className="text-[0.7rem] text-muted-foreground font-medium flex-shrink-0">
                          {new Date(event.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <Separator className="flex-1" />
                      </div>
                    )}
                    <Card
                      className="p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={cn('text-[0.65rem] px-1.5 py-0', actionColor(event.action))}>
                              {event.action}
                            </Badge>
                            <span className="text-sm font-medium capitalize">{event.entityType}</span>
                            {event.entityName && (
                              <span className="text-sm text-muted-foreground truncate max-w-[240px]">{event.entityName}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[0.7rem] text-muted-foreground">
                            {event.userEmail && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {event.userEmail}
                              </span>
                            )}
                            {event.ipAddress && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {event.ipAddress}
                              </span>
                            )}
                            <span className="ml-auto tabular-nums">{fmtTime(event.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )
              })}
              {isFetchingNextPage && (
                <div className="space-y-1 pt-1">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                </div>
              )}
              {!hasNextPage && events.length > 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  End of audit log
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail sheet */}
      <Sheet open={!!selectedEvent} onOpenChange={(open) => { if (!open) setSelectedEvent(null) }}>
        <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="capitalize">
              {selectedEvent?.action} {selectedEvent?.entityType}
            </SheetTitle>
            {selectedEvent?.entityName && (
              <p className="text-sm text-muted-foreground">{selectedEvent.entityName}</p>
            )}
          </SheetHeader>
          <Separator className="mb-5" />
          {selectedEvent && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Action</div>
                  <Badge variant="outline" className={cn('text-[0.7rem]', actionColor(selectedEvent.action))}>
                    {selectedEvent.action}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Entity Type</div>
                  <div className="capitalize font-medium">{selectedEvent.entityType}</div>
                </div>
                {selectedEvent.userEmail && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">User</div>
                    <div>{selectedEvent.userEmail}</div>
                  </div>
                )}
                {selectedEvent.ipAddress && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">IP Address</div>
                    <div className="font-mono text-xs">{selectedEvent.ipAddress}</div>
                  </div>
                )}
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground mb-0.5">Timestamp</div>
                  <div className="font-mono text-xs">{new Date(selectedEvent.createdAt).toISOString()}</div>
                </div>
              </div>

              {Boolean(selectedEvent.beforeState || selectedEvent.afterState) && (
                <>
                  <Separator />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Changes</div>
                    <DiffView before={selectedEvent.beforeState} after={selectedEvent.afterState} />
                  </div>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  )
}
