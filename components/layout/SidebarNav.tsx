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
    <aside className="hidden md:flex fixed top-0 left-0 h-full w-56 flex-col z-40 border-r border-gray-200 bg-white">
      {/* App header */}
      <div className="px-4 py-5 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 bg-gray-900">
          <BookMarked className="size-3 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold leading-tight text-gray-900 font-serif select-none">
            Reading Queue
          </span>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest leading-tight mt-0.5 select-none">
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
                  ? 'bg-gray-100 text-gray-900 font-medium border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    'size-4 flex-shrink-0 transition-colors duration-150',
                    isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'
                  )}
                />
                {item.label}
              </span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    'text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none',
                    item.badgeType === 'inbox'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
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
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-300 select-none">Data stored locally</p>
      </div>
    </aside>
  )
}
