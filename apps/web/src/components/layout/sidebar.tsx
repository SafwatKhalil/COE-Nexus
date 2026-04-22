'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'
import {
  LayoutDashboard, MapPin, Zap, FileText, CalendarDays,
  BarChart3, FolderOpen, Activity, LogOut, Building2,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
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
    <aside className="w-56 flex flex-col min-h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]">
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2.5 border-b border-[var(--sidebar-border)]">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
          <Building2 className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-[var(--sidebar-foreground)] font-semibold text-sm">COE-Nexus</div>
          <div className="text-[0.62rem] text-[var(--sidebar-foreground)] opacity-40 leading-none mt-0.5">Infra Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="px-2 mb-1 text-[0.62rem] font-semibold uppercase tracking-widest text-[var(--sidebar-foreground)] opacity-30">
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
                    'flex items-center gap-2 px-2 py-1.5 rounded-md text-[0.8rem] transition-colors mb-0.5',
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-[var(--sidebar-foreground)] opacity-70 hover:opacity-100 hover:bg-[var(--sidebar-accent)]',
                  )}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-2 border-t border-[var(--sidebar-border)]">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--sidebar-accent)] transition-colors text-left outline-none">
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-[0.6rem]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-[0.75rem] text-[var(--sidebar-foreground)] font-medium truncate opacity-90">
                {user?.email ?? 'User'}
              </div>
              <div className="text-[0.62rem] text-[var(--sidebar-foreground)] opacity-40 capitalize">
                {user?.role?.replace(/_/g, ' ')}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
