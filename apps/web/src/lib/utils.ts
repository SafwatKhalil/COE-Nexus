import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMw(mw: number | null | undefined): string {
  if (mw == null) return '—'
  return `${mw.toLocaleString()} MW`
}

export function readinessColor(score: number): string {
  if (score >= 70) return 'text-green-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

export function readinessBg(score: number): string {
  if (score >= 70) return 'bg-green-100 text-green-800'
  if (score >= 40) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
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
