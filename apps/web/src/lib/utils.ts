import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMw(mw: number | null | undefined): string {
  if (mw == null) return '—'
  return `${Number(mw).toLocaleString()} MW`
}

export function stageLabel(stage: string): string {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function controlStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    prospect: 'Prospect',
    loi: 'LOI',
    optioned: 'Optioned',
    leased: 'Leased',
    owned: 'Owned',
    active: 'Active',
  }
  return labels[status] ?? status
}
