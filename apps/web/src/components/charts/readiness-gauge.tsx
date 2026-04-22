'use client'

import { cn, readinessBg } from '@/lib/utils'

interface ReadinessGaugeProps {
  score: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ReadinessGauge({ score, label, size = 'md' }: ReadinessGaugeProps) {
  const sizeClasses = {
    sm: 'text-xl w-14 h-14',
    md: 'text-3xl w-20 h-20',
    lg: 'text-4xl w-28 h-28',
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-bold',
          sizeClasses[size],
          readinessBg(score),
        )}
      >
        {Math.round(score)}
      </div>
      {label && <span className="text-xs text-gray-500">{label}</span>}
    </div>
  )
}
