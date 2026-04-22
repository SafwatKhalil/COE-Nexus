'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MapPin,
  Zap,
  FileText,
  CalendarDays,
  BarChart3,
  FolderOpen,
  Activity,
  Settings,
  Building2,
} from 'lucide-react'

const navItems = [
  { label: 'Portfolio Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Sites', href: '/sites', icon: MapPin },
  { label: 'Utilities', href: '/utilities', icon: Zap },
  { label: 'Permits', href: '/permits', icon: FileText },
  { label: 'Schedules', href: '/schedules', icon: CalendarDays },
  { label: 'Forecasting', href: '/forecasting', icon: BarChart3 },
  { label: 'Documents', href: '/documents', icon: FolderOpen },
  { label: 'Audit Log', href: '/audit', icon: Activity },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-brand-500" />
          <span className="font-bold text-lg tracking-tight">COE-Nexus</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Datacenter Activation Platform</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
