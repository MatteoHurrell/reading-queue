'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Inbox,
  BookOpen,
  Archive,
  BarChart2,
  Settings,
  BookMarked,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

interface SidebarNavProps {
  inboxCount: number
  queuedCount: number
}

export default function SidebarNav({ inboxCount, queuedCount }: SidebarNavProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Inbox', href: '/inbox', icon: Inbox, badge: inboxCount },
    { label: 'Queue', href: '/queue', icon: BookOpen, badge: queuedCount },
    { label: 'Library', href: '/library', icon: Archive },
    { label: 'Insights', href: '/insights', icon: BarChart2 },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-full w-56 flex-col bg-[#111111] border-r border-white/[0.08] z-40">
      {/* App header */}
      <div className="px-4 py-4 border-b border-white/[0.08] flex items-center gap-2.5">
        <BookMarked className="size-4 text-white/60 flex-shrink-0" />
        <span className="text-xs font-semibold tracking-widest uppercase text-white/80 select-none">
          Reading Queue
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-white/[0.06] text-white font-medium'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="size-4 flex-shrink-0" />
                {item.label}
              </span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-auto h-4 min-w-4 px-1 text-[10px] bg-white/[0.12] text-white/70 border-0"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
