'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function Topbar({ title, description, actions }: TopbarProps) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}
