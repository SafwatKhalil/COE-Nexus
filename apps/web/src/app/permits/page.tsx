'use client'

import { useState } from 'react'
import { usePermits, useUpdatePermit, type Permit } from '@/hooks/use-permits'
import { useSites } from '@/hooks/use-sites'
import { useCreatePermit } from '@/hooks/use-permits'
import { Topbar } from '@/components/layout/topbar'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Plus, FileText, AlertTriangle, Filter } from 'lucide-react'
import { toast } from 'sonner'

const STATUSES = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'on_hold', label: 'On Hold' },
]

const RISK_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

function statusBadgeClass(status: string) {
  switch (status) {
    case 'approved': return 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-950'
    case 'denied': return 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950'
    case 'submitted': return 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-950'
    case 'in_progress': return 'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-950'
    case 'on_hold': return 'border-slate-200 text-slate-600 bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:bg-slate-900'
    default: return 'border-slate-200 text-slate-500'
  }
}

function riskDotClass(risk: string | null) {
  switch (risk) {
    case 'high': return 'status-dot-red'
    case 'medium': return 'status-dot-amber'
    case 'low': return 'status-dot-green'
    default: return 'status-dot-gray'
  }
}

function fmt(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface PermitFormState {
  siteId: string
  permitType: string
  agencyName: string
  status: string
  riskLevel: string
  blocking: boolean
  dueDate: string
  notes: string
}

const defaultForm: PermitFormState = {
  siteId: '',
  permitType: '',
  agencyName: '',
  status: 'not_started',
  riskLevel: 'low',
  blocking: false,
  dueDate: '',
  notes: '',
}

function PermitForm({
  form,
  sites,
  showSite,
  onChange,
}: {
  form: PermitFormState
  sites: { id: string; name: string }[]
  showSite: boolean
  onChange: (field: keyof PermitFormState, value: string | boolean) => void
}) {
  return (
    <div className="space-y-4">
      {showSite && (
        <div className="space-y-1.5">
          <Label>Site</Label>
          <Select value={form.siteId} onValueChange={(v) => { if (v) onChange('siteId', v) }}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select site…" />
            </SelectTrigger>
            <SelectContent>
              {sites.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Permit Type</Label>
          <Input
            className="h-9 text-sm"
            placeholder="e.g. Building Permit"
            value={form.permitType}
            onChange={(e) => onChange('permitType', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Agency</Label>
          <Input
            className="h-9 text-sm"
            placeholder="Issuing agency"
            value={form.agencyName}
            onChange={(e) => onChange('agencyName', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => { if (v) onChange('status', v) }}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Risk Level</Label>
          <Select value={form.riskLevel} onValueChange={(v) => { if (v) onChange('riskLevel', v) }}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RISK_LEVELS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Due Date</Label>
          <Input
            type="date"
            className="h-9 text-sm"
            value={form.dueDate}
            onChange={(e) => onChange('dueDate', e.target.value)}
          />
        </div>
        <div className="flex items-end pb-1.5 gap-2">
          <input
            id="blocking"
            type="checkbox"
            className="w-4 h-4 rounded border-border"
            checked={form.blocking}
            onChange={(e) => onChange('blocking', e.target.checked)}
          />
          <Label htmlFor="blocking" className="cursor-pointer flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Blocking permit
          </Label>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <textarea
          className="w-full min-h-[72px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Optional notes…"
          value={form.notes}
          onChange={(e) => onChange('notes', e.target.value)}
        />
      </div>
    </div>
  )
}

export default function PermitsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [blockingFilter, setBlockingFilter] = useState('all')
  const [page, setPage] = useState(1)

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<PermitFormState>(defaultForm)

  const [editPermit, setEditPermit] = useState<Permit | null>(null)
  const [editForm, setEditForm] = useState<PermitFormState>(defaultForm)

  const { data, isLoading } = usePermits({
    status: statusFilter === 'all' ? undefined : statusFilter,
    riskLevel: riskFilter === 'all' ? undefined : riskFilter,
    blocking: blockingFilter === 'all' ? undefined : blockingFilter === 'true',
    page,
    limit: 50,
  })

  const sitesQuery = useSites({ pageSize: 200 })
  const sites = ((sitesQuery.data?.data ?? []) as any[]).map((s: any) => ({ id: s.id, name: s.name }))

  const createPermit = useCreatePermit(createForm.siteId)
  const updatePermit = useUpdatePermit()

  const permits = data?.items ?? []
  const total = data?.total ?? 0
  const pages = data?.pages ?? 1

  function handleCreateChange(field: keyof PermitFormState, value: string | boolean) {
    setCreateForm((f) => ({ ...f, [field]: value }))
  }

  function handleEditChange(field: keyof PermitFormState, value: string | boolean) {
    setEditForm((f) => ({ ...f, [field]: value }))
  }

  function openEdit(permit: Permit) {
    setEditPermit(permit)
    setEditForm({
      siteId: permit.siteId,
      permitType: permit.permitType,
      agencyName: permit.agencyName ?? '',
      status: permit.status,
      riskLevel: permit.riskLevel ?? 'low',
      blocking: permit.blocking,
      dueDate: permit.dueDate ? permit.dueDate.split('T')[0] : '',
      notes: permit.notes ?? '',
    })
  }

  async function handleCreate() {
    if (!createForm.siteId || !createForm.permitType) {
      toast.error('Site and permit type are required')
      return
    }
    try {
      await createPermit.mutateAsync({
        permitType: createForm.permitType,
        agencyName: createForm.agencyName || undefined,
        status: createForm.status,
        riskLevel: createForm.riskLevel || undefined,
        blocking: createForm.blocking,
        dueDate: createForm.dueDate || undefined,
        notes: createForm.notes || undefined,
      } as any)
      toast.success('Permit created')
      setCreateOpen(false)
      setCreateForm(defaultForm)
    } catch {
      toast.error('Failed to create permit')
    }
  }

  async function handleUpdate() {
    if (!editPermit) return
    try {
      await updatePermit.mutateAsync({
        id: editPermit.id,
        permitType: editForm.permitType,
        agencyName: editForm.agencyName || undefined,
        status: editForm.status,
        riskLevel: editForm.riskLevel || undefined,
        blocking: editForm.blocking,
        dueDate: editForm.dueDate || undefined,
        notes: editForm.notes || undefined,
      } as any)
      toast.success('Permit updated')
      setEditPermit(null)
    } catch {
      toast.error('Failed to update permit')
    }
  }

  return (
    <AppShell>
      <Topbar
        title="Permits"
        description={total ? `${total} permits across portfolio` : 'Entitlement and regulatory tracking'}
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            New Permit
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-4 overflow-auto">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <Select value={statusFilter} onValueChange={(v) => { if (v) { setStatusFilter(v); setPage(1) } }}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={(v) => { if (v) { setRiskFilter(v); setPage(1) } }}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue placeholder="All risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risk</SelectItem>
              {RISK_LEVELS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={blockingFilter} onValueChange={(v) => { if (v) { setBlockingFilter(v); setPage(1) } }}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue placeholder="All permits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All permits</SelectItem>
              <SelectItem value="true">Blocking only</SelectItem>
              <SelectItem value="false">Non-blocking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[220px]">Permit Type</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Blocking</TableHead>
                <TableHead />
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
                : permits.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <FileText className="w-8 h-8 opacity-30" />
                          <span className="text-sm">No permits found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                : permits.map((permit) => (
                    <TableRow
                      key={permit.id}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => openEdit(permit)}
                    >
                      <TableCell>
                        <div className="text-sm font-medium">{permit.permitType}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{permit.site?.name ?? '—'}</div>
                        {permit.site?.region && (
                          <div className="text-[0.7rem] text-muted-foreground opacity-60">{permit.site.region}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{permit.agencyName ?? '—'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('text-[0.7rem] px-1.5 py-0.5', statusBadgeClass(permit.status))}
                        >
                          {STATUSES.find((s) => s.value === permit.status)?.label ?? permit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className={cn('w-2 h-2 rounded-full flex-shrink-0', riskDotClass(permit.riskLevel))} />
                          <span className="text-sm text-muted-foreground capitalize">{permit.riskLevel ?? '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          'text-sm tabular-nums',
                          permit.dueDate && new Date(permit.dueDate) < new Date() && permit.status !== 'approved'
                            ? 'text-red-600 font-medium'
                            : 'text-muted-foreground',
                        )}>
                          {fmt(permit.dueDate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {permit.blocking ? (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Blocking</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  ))}
            </TableBody>
          </Table>

          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-sm text-muted-foreground">
              <span>{total} permits · page {page} of {pages}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Permit</DialogTitle>
          </DialogHeader>
          <Separator />
          <PermitForm form={createForm} sites={sites} showSite onChange={handleCreateChange} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createPermit.isPending}>
              {createPermit.isPending ? 'Creating…' : 'Create Permit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit sheet */}
      <Sheet open={!!editPermit} onOpenChange={(open) => { if (!open) setEditPermit(null) }}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Edit Permit</SheetTitle>
            {editPermit?.site && (
              <p className="text-sm text-muted-foreground">{editPermit.site.name}</p>
            )}
          </SheetHeader>
          <Separator className="mb-5" />
          <PermitForm form={editForm} sites={sites} showSite={false} onChange={handleEditChange} />
          <div className="flex items-center justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setEditPermit(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updatePermit.isPending}>
              {updatePermit.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  )
}
