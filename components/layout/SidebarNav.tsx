'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Archive, Settings, BookMarked } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export default function SidebarNav() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { label: 'Bookmarks', href: '/', icon: Bookmark },
    { label: 'Archive', href: '/library', icon: Archive },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-full w-56 flex-col z-40 border-r border-border bg-background">
      <div className="px-4 py-5 border-b border-border flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 bg-primary">
          <BookMarked className="size-3 text-primary-foreground" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-foreground select-none">
            Reading Queue
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest select-none">Personal</span>
        </div>
      </div>

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
                'flex items-center justify-between w-[calc(100%-16px)] px-3 py-2 mx-2 rounded-lg text-sm transition-colors duration-150',
                isActive
                  ? 'bg-sidebar-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/90'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    'size-4 flex-shrink-0',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground/70 select-none">Data stored locally</p>
      </div>
    </aside>
  )
}
