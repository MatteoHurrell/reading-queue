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
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
  badgeType?: 'inbox' | 'queue'
}

interface SidebarNavProps {
  inboxCount: number
  queuedCount: number
}

export default function SidebarNav({ inboxCount, queuedCount }: SidebarNavProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Inbox', href: '/inbox', icon: Inbox, badge: inboxCount, badgeType: 'inbox' },
    { label: 'Queue', href: '/queue', icon: BookOpen, badge: queuedCount, badgeType: 'queue' },
    { label: 'Library', href: '/library', icon: Archive },
    { label: 'Insights', href: '/insights', icon: BarChart2 },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-full w-56 flex-col z-40 border-r border-white/[0.06]"
      style={{ background: 'rgba(6,9,18,0.80)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      {/* App header */}
      <div className="px-4 py-5 border-b border-white/[0.05] flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          <BookMarked className="size-3 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold leading-tight gradient-text select-none">
            Reading Queue
          </span>
          <span className="text-[10px] text-white/20 uppercase tracking-widest leading-tight mt-0.5 select-none">
            Personal
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-3 space-y-0.5">
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
                'flex items-center justify-between w-full px-3 py-2 mx-2 rounded-lg text-sm transition-all duration-150',
                'w-[calc(100%-16px)]',
                isActive
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    'size-4 flex-shrink-0 transition-colors duration-150',
                    isActive ? 'text-indigo-400' : 'text-white/30 group-hover:text-white/50'
                  )}
                />
                {item.label}
              </span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    'text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none',
                    item.badgeType === 'inbox'
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-indigo-500/15 text-indigo-400'
                  )}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/[0.04]">
        <p className="text-[10px] text-white/15 select-none">Data stored locally</p>
      </div>
    </aside>
  )
}
