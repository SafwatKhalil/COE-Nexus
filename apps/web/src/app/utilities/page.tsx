'use client'

import { useState } from 'react'
import { useUtilities, useUpdateUtility, type Utility } from '@/hooks/use-utilities'
import { Topbar } from '@/components/layout/topbar'
import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Zap, Wifi, Droplets, Flame, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

const UTILITY_TYPES = [
  { value: 'power', label: 'Power', icon: Zap },
  { value: 'fiber', label: 'Fiber', icon: Wifi },
  { value: 'water', label: 'Water', icon: Droplets },
  { value: 'wastewater', label: 'Wastewater', icon: Droplets },
  { value: 'gas', label: 'Gas', icon: Flame },
]

const STATUSES = [
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'under_study', label: 'Under Study' },
  { value: 'pending', label: 'Pending' },
  { value: 'committed', label: 'Committed' },
  { value: 'active', label: 'Active' },
  { value: 'decommissioned', label: 'Decommissioned' },
]

function statusClass(status: string) {
  switch (status) {
    case 'active': return 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-950'
    case 'committed': return 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-950'
    case 'pending': return 'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-950'
    case 'under_study': return 'border-slate-200 text-slate-600 bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:bg-slate-900'
    case 'unavailable': return 'border-red-200 text-red-600 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950'
    default: return 'border-slate-200 text-slate-500'
  }
}

function riskDotClass(risk: string | null) {
  switch (risk) {
    case 'critical': return 'status-dot-red'
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

function capacityLabel(utility: Utility) {
  if (utility.committedCapacity != null && utility.availableCapacity != null) {
    return `${utility.committedCapacity} / ${utility.availableCapacity} ${utility.unit ?? ''}`
  }
  if (utility.committedCapacity != null) return `${utility.committedCapacity} ${utility.unit ?? ''} committed`
  if (utility.availableCapacity != null) return `${utility.availableCapacity} ${utility.unit ?? ''} avail.`
  return '—'
}

interface EditFormState {
  status: string
  riskLevel: string
  providerName: string
  estimatedDeliveryDate: string
  notes: string
}

function UtilityTable({ utilities }: { utilities: Utility[] }) {
  const [editItem, setEditItem] = useState<Utility | null>(null)
  const [form, setForm] = useState<EditFormState>({ status: '', riskLevel: '', providerName: '', estimatedDeliveryDate: '', notes: '' })
  const update = useUpdateUtility()

  function openEdit(u: Utility) {
    setEditItem(u)
    setForm({
      status: u.status,
      riskLevel: u.riskLevel ?? 'low',
      providerName: u.providerName ?? '',
      estimatedDeliveryDate: u.estimatedDeliveryDate ? u.estimatedDeliveryDate.split('T')[0] : '',
      notes: u.notes ?? '',
    })
  }

  async function handleSave() {
    if (!editItem) return
    try {
      await update.mutateAsync({
        id: editItem.id,
        status: form.status,
        riskLevel: form.riskLevel || undefined,
        providerName: form.providerName || undefined,
        estimatedDeliveryDate: form.estimatedDeliveryDate || undefined,
        notes: form.notes || undefined,
      } as any)
      toast.success('Utility updated')
      setEditItem(null)
    } catch {
      toast.error('Failed to update utility')
    }
  }

  if (utilities.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        No utilities of this type in the portfolio.
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[220px]">Site</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Est. Delivery</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {utilities.map((u) => (
            <TableRow
              key={u.id}
              className="cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => openEdit(u)}
            >
              <TableCell>
                <div className="text-sm font-medium">{u.site?.name ?? '—'}</div>
                {u.site?.region && <div className="text-[0.7rem] text-muted-foreground opacity-60">{u.site.region}</div>}
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">{u.providerName ?? '—'}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('text-[0.7rem] px-1.5 py-0.5', statusClass(u.status))}>
                  {STATUSES.find((s) => s.value === u.status)?.label ?? u.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm font-mono text-muted-foreground">{capacityLabel(u)}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', riskDotClass(u.riskLevel))} />
                  <span className="text-sm text-muted-foreground capitalize">{u.riskLevel ?? '—'}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground tabular-nums">{fmt(u.estimatedDeliveryDate)}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={!!editItem} onOpenChange={(open) => { if (!open) setEditItem(null) }}>
        <SheetContent className="w-[420px] sm:max-w-[420px] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Edit Utility</SheetTitle>
            {editItem?.site && <p className="text-sm text-muted-foreground">{editItem.site.name}</p>}
          </SheetHeader>
          <Separator className="mb-5" />
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Provider</Label>
              <Input className="h-9 text-sm" value={form.providerName} onChange={(e) => setForm((f) => ({ ...f, providerName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => { if (v) setForm((f) => ({ ...f, status: v })) }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Risk Level</Label>
                <Select value={form.riskLevel} onValueChange={(v) => { if (v) setForm((f) => ({ ...f, riskLevel: v })) }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Est. Delivery Date</Label>
              <Input type="date" className="h-9 text-sm" value={form.estimatedDeliveryDate} onChange={(e) => setForm((f) => ({ ...f, estimatedDeliveryDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <textarea
                className="w-full min-h-[72px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default function UtilitiesPage() {
  const [activeTab, setActiveTab] = useState('power')
  const { data, isLoading } = useUtilities({ type: activeTab })

  const utilities = data ?? []
  const TypeIcon = UTILITY_TYPES.find((t) => t.value === activeTab)?.icon ?? Zap

  const summary = {
    active: utilities.filter((u) => u.status === 'active' || u.status === 'committed').length,
    atRisk: utilities.filter((u) => u.riskLevel === 'high' || u.riskLevel === 'critical').length,
    pending: utilities.filter((u) => u.status === 'pending' || u.status === 'under_study').length,
  }

  return (
    <AppShell>
      <Topbar
        title="Utilities"
        description="Power, fiber, and infrastructure across all sites"
      />
      <div className="flex-1 p-6 space-y-4 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-9">
            {UTILITY_TYPES.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="text-sm gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {UTILITY_TYPES.map(({ value }) => (
            <TabsContent key={value} value={value} className="mt-4 space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-1 pt-4 px-4">
                    <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Active / Committed</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {isLoading ? <Skeleton className="h-7 w-12" /> : (
                      <div className="text-2xl font-bold tabular-nums">{summary.active}</div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-1 pt-4 px-4">
                    <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Pending / Under Study</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {isLoading ? <Skeleton className="h-7 w-12" /> : (
                      <div className="text-2xl font-bold tabular-nums">{summary.pending}</div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-1 pt-4 px-4">
                    <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      High / Critical Risk
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {isLoading ? <Skeleton className="h-7 w-12" /> : (
                      <div className={cn('text-2xl font-bold tabular-nums', summary.atRisk > 0 ? 'text-red-600' : '')}>
                        {summary.atRisk}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Table */}
              <Card className="overflow-hidden p-0">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : (
                  <UtilityTable utilities={utilities} />
                )}
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppShell>
  )
}
