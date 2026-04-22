'use client'

import { use } from 'react'
import { useSite, useRecomputeReadiness, useReadinessHistory } from '@/hooks/use-sites'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn, stageLabel, controlStatusLabel, formatMw } from '@/lib/utils'
import { format } from 'date-fns'
import {
  RefreshCw,
  MapPin,
  Zap,
  FileText,
  CalendarDays,
  Activity,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const stageBadgeClass: Record<string, string> = {
  prospect: 'stage-badge-prospect',
  feasibility: 'stage-badge-feasibility',
  entitlement: 'stage-badge-entitlement',
  development: 'stage-badge-development',
  construction: 'stage-badge-construction',
  commissioning: 'stage-badge-commissioning',
  operational: 'stage-badge-operational',
}

function UtilityStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    committed: 'bg-blue-50 text-blue-700 border-blue-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    under_study: 'bg-slate-50 text-slate-700 border-slate-200',
    unavailable: 'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <span className={cn('text-[0.7rem] font-medium px-1.5 py-0.5 rounded border capitalize', styles[status] ?? styles.under_study)}>
      {status.replace('_', ' ')}
    </span>
  )
}

function PermitStatusIcon({ status }: { status: string }) {
  if (status === 'approved') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
  if (status === 'denied') return <XCircle className="w-4 h-4 text-red-500" />
  if (status === 'in_progress' || status === 'submitted') return <Clock className="w-4 h-4 text-amber-500" />
  return <AlertCircle className="w-4 h-4 text-slate-400" />
}

function TaskStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    not_started: 'bg-slate-50 text-slate-600 border-slate-200',
    blocked: 'bg-red-50 text-red-700 border-red-200',
    cancelled: 'bg-slate-50 text-slate-400 border-slate-200',
  }
  return (
    <span className={cn('text-[0.7rem] font-medium px-1.5 py-0.5 rounded border capitalize', styles[status] ?? styles.not_started)}>
      {status.replace('_', ' ')}
    </span>
  )
}

export default function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: site, isLoading } = useSite(id)
  const { data: history } = useReadinessHistory(id)
  const recompute = useRecomputeReadiness(id)

  const handleRecompute = async () => {
    try {
      await recompute.mutateAsync()
      toast.success('Readiness score recomputed')
    } catch {
      toast.error('Failed to recompute score')
    }
  }

  if (isLoading) {
    return (
      <>
        <Topbar title="Site Details" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    )
  }

  if (!site) {
    return (
      <>
        <Topbar title="Site Not Found" />
        <div className="p-6 text-center text-muted-foreground">
          This site doesn&apos;t exist or you don&apos;t have access to it.
        </div>
      </>
    )
  }

  const latestScore = site.readinessSnapshots?.[0]
  const scoreNum = latestScore ? Number(latestScore.score) : null

  const utilities = site.utilities ?? []
  const permits = site.permits ?? []
  const tasks = site.tasks ?? []
  const parcels = site.parcels ?? []
  const envConstraints = site.environmentalConstraints ?? []

  const completedTasks = tasks.filter((t: any) => t.status === 'completed').length
  const taskProgress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <>
      <Topbar
        title={site.name}
        description={[site.metro, site.region, site.country].filter(Boolean).join(' · ')}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecompute}
              disabled={recompute.isPending}
              className="gap-1.5"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', recompute.isPending && 'animate-spin')} />
              Recompute Score
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-4 overflow-auto">
        {/* Back link */}
        <Link href="/sites" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
          All Sites
        </Link>

        {/* Header card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-semibold">{site.name}</h2>
                    {site.siteCode && (
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {site.siteCode}
                      </span>
                    )}
                    <span className={cn('text-[0.7rem] font-medium px-1.5 py-0.5 rounded border', stageBadgeClass[site.lifecycleStage])}>
                      {stageLabel(site.lifecycleStage)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    {site.address && <span>{site.address}</span>}
                    <span>Control: <strong className="text-foreground">{controlStatusLabel(site.controlStatus)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Score + MW */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Readiness</div>
                  {scoreNum != null ? (
                    <div className={cn(
                      'text-2xl font-bold tabular-nums w-14 h-14 rounded-full flex items-center justify-center border-2',
                      scoreNum >= 70 ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                      scoreNum >= 40 ? 'text-amber-600 border-amber-200 bg-amber-50' :
                      'text-red-600 border-red-200 bg-red-50',
                    )}>
                      {Math.round(scoreNum)}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground w-14 h-14 rounded-full flex items-center justify-center border-2 border-dashed border-muted">
                      —
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Target</div>
                  <div className="text-lg font-bold tabular-nums">{formatMw(site.targetMw)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Deliverable</div>
                  <div className="text-lg font-bold tabular-nums text-muted-foreground">{formatMw(site.deliverableMw)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="h-8">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="utilities" className="text-xs">
              Utilities {utilities.length > 0 && <span className="ml-1 text-[0.6rem] bg-muted rounded px-1">{utilities.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="permits" className="text-xs">
              Permits {permits.length > 0 && <span className="ml-1 text-[0.6rem] bg-muted rounded px-1">{permits.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs">
              Schedule {tasks.length > 0 && <span className="ml-1 text-[0.6rem] bg-muted rounded px-1">{tasks.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="score" className="text-xs">Score History</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Site Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Site Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    ['Country', site.country],
                    ['Region', site.region],
                    ['Metro', site.metro],
                    ['Zoning Status', site.zoningStatus],
                    ['Strategic Priority', site.strategicPriority],
                    ['Coordinates', site.latitude && site.longitude ? `${site.latitude}, ${site.longitude}` : null],
                  ].map(([label, value]) =>
                    value != null ? (
                      <div key={label as string} className="flex justify-between py-1 border-b border-border last:border-0">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-right">{String(value)}</span>
                      </div>
                    ) : null,
                  )}
                </CardContent>
              </Card>

              {/* Parcels */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Parcels ({parcels.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {parcels.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">No parcels recorded</div>
                  ) : (
                    <div className="space-y-2">
                      {parcels.map((p: any) => (
                        <div key={p.id} className="rounded-lg border border-border p-3 text-sm space-y-1">
                          {p.apn && <div className="font-mono text-xs">{p.apn}</div>}
                          <div className="flex gap-4 text-muted-foreground">
                            {p.acreage && <span>{p.acreage} ac</span>}
                            {p.ownershipType && <span className="capitalize">{p.ownershipType}</span>}
                            {p.zoningClassification && <span>{p.zoningClassification}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Environmental */}
              {envConstraints.length > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Environmental Constraints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {envConstraints.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between p-2 rounded border border-border text-sm">
                          <span className="font-medium capitalize">{c.constraintType.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-2">
                            {c.severity && (
                              <span className={cn('text-xs px-1.5 py-0.5 rounded',
                                c.severity === 'critical' ? 'bg-red-50 text-red-700' :
                                c.severity === 'high' ? 'bg-orange-50 text-orange-700' :
                                'bg-slate-50 text-slate-600'
                              )}>
                                {c.severity}
                              </span>
                            )}
                            {c.blocking && <Badge variant="destructive" className="text-[0.65rem]">Blocking</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {site.notes && (
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{site.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* UTILITIES */}
          <TabsContent value="utilities" className="space-y-3">
            {utilities.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  <Zap className="w-8 h-8 opacity-20 mx-auto mb-2" />
                  No utility records yet
                </CardContent>
              </Card>
            ) : (
              utilities.map((u: any) => (
                <Card key={u.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold capitalize text-sm">{u.utilityType}</span>
                          <UtilityStatusBadge status={u.status} />
                        </div>
                        {u.providerName && <div className="text-xs text-muted-foreground mt-0.5">{u.providerName}</div>}
                      </div>
                      {u.availableCapacity && (
                        <div className="text-right">
                          <div className="text-sm font-bold tabular-nums">{u.availableCapacity} {u.unit}</div>
                          {u.committedCapacity && (
                            <div className="text-xs text-muted-foreground">{u.committedCapacity} committed</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                      {u.estimatedDeliveryDate && (
                        <div>Est. delivery: <span className="text-foreground">{format(new Date(u.estimatedDeliveryDate), 'MMM d, yyyy')}</span></div>
                      )}
                      {u.confidenceScore && (
                        <div>Confidence: <span className="text-foreground">{Math.round(Number(u.confidenceScore) * 100)}%</span></div>
                      )}
                      {u.riskLevel && (
                        <div>Risk: <span className={cn('font-medium', u.riskLevel === 'high' ? 'text-red-600' : u.riskLevel === 'medium' ? 'text-amber-600' : 'text-emerald-600')}>{u.riskLevel}</span></div>
                      )}
                    </div>
                    {u.powerDetails && (
                      <>
                        <Separator className="my-3" />
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                          {u.powerDetails.substationName && (
                            <div>Substation: <span className="text-foreground">{u.powerDetails.substationName}</span></div>
                          )}
                          {u.powerDetails.voltageLevel && (
                            <div>Voltage: <span className="text-foreground">{u.powerDetails.voltageLevel}</span></div>
                          )}
                          {u.powerDetails.feederStatus && (
                            <div>Feeder: <span className="text-foreground">{u.powerDetails.feederStatus}</span></div>
                          )}
                          {u.powerDetails.queuePosition && (
                            <div>Queue: <span className="text-foreground">{u.powerDetails.queuePosition}</span></div>
                          )}
                        </div>
                      </>
                    )}
                    {u.notes && <div className="mt-2 text-xs text-muted-foreground">{u.notes}</div>}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* PERMITS */}
          <TabsContent value="permits" className="space-y-3">
            {permits.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  <FileText className="w-8 h-8 opacity-20 mx-auto mb-2" />
                  No permit records yet
                </CardContent>
              </Card>
            ) : (
              permits.map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2.5">
                        <PermitStatusIcon status={p.status} />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{p.permitType}</span>
                            {p.blocking && <Badge variant="destructive" className="text-[0.65rem] px-1.5">Blocking</Badge>}
                            {!p.required && <Badge variant="outline" className="text-[0.65rem] px-1.5">Optional</Badge>}
                          </div>
                          {p.agencyName && <div className="text-xs text-muted-foreground mt-0.5">{p.agencyName}</div>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cn('text-xs font-medium capitalize',
                          p.status === 'approved' ? 'text-emerald-600' :
                          p.status === 'denied' ? 'text-red-600' :
                          'text-amber-600'
                        )}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground mt-3">
                      {p.dueDate && <div>Due: <span className="text-foreground">{format(new Date(p.dueDate), 'MMM d, yyyy')}</span></div>}
                      {p.expectedApprovalDate && <div>Expected: <span className="text-foreground">{format(new Date(p.expectedApprovalDate), 'MMM d, yyyy')}</span></div>}
                      {p.actualApprovalDate && <div>Approved: <span className="text-emerald-600 font-medium">{format(new Date(p.actualApprovalDate), 'MMM d, yyyy')}</span></div>}
                      {p.riskLevel && <div>Risk: <span className={cn('font-medium', p.riskLevel === 'high' ? 'text-red-600' : p.riskLevel === 'medium' ? 'text-amber-600' : 'text-emerald-600')}>{p.riskLevel}</span></div>}
                    </div>
                    {p.notes && <div className="mt-2 text-xs text-muted-foreground">{p.notes}</div>}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* SCHEDULE */}
          <TabsContent value="schedule" className="space-y-4">
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  <CalendarDays className="w-8 h-8 opacity-20 mx-auto mb-2" />
                  No tasks yet
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm font-bold tabular-nums">{completedTasks}/{tasks.length} tasks</span>
                    </div>
                    <Progress value={taskProgress} className="h-2" />
                  </CardContent>
                </Card>
                <div className="space-y-2">
                  {tasks.map((t: any) => (
                    <Card key={t.id} className={cn(t.critical && 'border-orange-200 bg-orange-50/30')}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {t.critical && (
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" title="Critical path" />
                            )}
                            <span className="text-sm font-medium truncate">{t.name}</span>
                            {t.taskType && (
                              <span className="text-[0.65rem] text-muted-foreground bg-muted px-1 rounded shrink-0">{t.taskType}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <TaskStatusBadge status={t.status} />
                            {t.percentComplete != null && Number(t.percentComplete) > 0 && (
                              <span className="text-xs text-muted-foreground tabular-nums">{Math.round(Number(t.percentComplete))}%</span>
                            )}
                          </div>
                        </div>
                        {(t.plannedStartDate || t.plannedEndDate) && (
                          <div className="mt-1.5 text-xs text-muted-foreground flex gap-3">
                            {t.plannedStartDate && <span>Start: {format(new Date(t.plannedStartDate), 'MMM d, yyyy')}</span>}
                            {t.plannedEndDate && <span>End: {format(new Date(t.plannedEndDate), 'MMM d, yyyy')}</span>}
                            {t.durationDays && <span>{t.durationDays}d</span>}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* SCORE HISTORY */}
          <TabsContent value="score" className="space-y-3">
            {!history || (history as any[]).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  <Activity className="w-8 h-8 opacity-20 mx-auto mb-2" />
                  No score history yet — click &quot;Recompute Score&quot; to generate one
                </CardContent>
              </Card>
            ) : (
              (history as any[]).map((snap: any) => {
                const exp = snap.explanation as any
                return (
                  <Card key={snap.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(snap.computedAt), 'MMM d, yyyy h:mm a')}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">v{snap.scoringVersion}</div>
                        </div>
                        <div className={cn(
                          'text-xl font-bold tabular-nums w-12 h-12 rounded-full flex items-center justify-center border-2',
                          Number(snap.score) >= 70 ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                          Number(snap.score) >= 40 ? 'text-amber-600 border-amber-200 bg-amber-50' :
                          'text-red-600 border-red-200 bg-red-50',
                        )}>
                          {Math.round(Number(snap.score))}
                        </div>
                      </div>

                      {exp?.components && (
                        <div className="space-y-2">
                          {Object.entries(exp.components).map(([key, val]: [string, any]) => (
                            <div key={key} className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground w-24 capitalize">{key}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={cn('h-full rounded-full',
                                        val.score >= 70 ? 'bg-emerald-500' :
                                        val.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                      )}
                                      style={{ width: `${val.score}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold tabular-nums w-6 text-right">{Math.round(val.score)}</span>
                                </div>
                                <div className="text-[0.65rem] text-muted-foreground mt-0.5">{val.reason}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
