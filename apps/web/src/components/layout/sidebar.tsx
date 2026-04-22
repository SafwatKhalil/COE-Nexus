'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'
import {
  LayoutDashboard,
  MapPin,
  Zap,
  FileText,
  CalendarDays,
  BarChart3,
  FolderOpen,
  Activity,
  LogOut,
  Building2,
  ChevronRight,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navGroups = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Sites', href: '/sites', icon: MapPin },
      { label: 'Utilities', href: '/utilities', icon: Zap },
      { label: 'Permits', href: '/permits', icon: FileText },
      { label: 'Schedules', href: '/schedules', icon: CalendarDays },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Forecasting', href: '/forecasting', icon: BarChart3 },
      { label: 'Documents', href: '/documents', icon: FolderOpen },
      { label: 'Audit Log', href: '/audit', icon: Activity },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    document.cookie = 'coe_nexus_token=; path=/; max-age=0'
    toast.success('Signed out')
    router.push('/auth/login')
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <aside className="w-60 flex flex-col min-h-screen bg-[oklch(0.14_0.025_250)] border-r border-[oklch(0.22_0.02_250)]">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5 border-b border-[oklch(0.22_0.02_250)]">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-white font-semibold text-sm">COE-Nexus</div>
          <div className="text-[0.65rem] text-slate-500 leading-none mt-0.5">Infra Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="px-2 mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-slate-600">
              {group.label}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon
              const active =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[0.82rem] transition-all duration-150 mb-0.5',
                    active
                      ? 'bg-blue-600/20 text-blue-400 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300')} />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight className="w-3 h-3 text-blue-500/60" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[oklch(0.22_0.02_250)]">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-left outline-none">
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarFallback className="bg-blue-600 text-white text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-300 font-medium truncate">{user?.email ?? 'User'}</div>
                <div className="text-[0.65rem] text-slate-600 capitalize">{user?.role?.replace('_', ' ')}</div>
              </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
