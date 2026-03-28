'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface TopBarProps {
  pageTitle: string
  onAddClick: () => void
  showSearch?: boolean
  searchQuery?: string
  onSearchChange?: (q: string) => void
}

export default function TopBar({
  pageTitle,
  onAddClick,
  showSearch = false,
  searchQuery = '',
  onSearchChange,
}: TopBarProps) {
  return (
    <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-white/[0.08] bg-background gap-4">
      <h1 className="text-base font-semibold text-white/90 tracking-tight shrink-0">
        {pageTitle}
      </h1>

      {showSearch && (
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full h-8 bg-white/[0.05] border border-white/[0.1] rounded-md pl-3 pr-8 text-sm text-white/80 placeholder:text-white/30 outline-none focus:border-white/[0.2] focus:bg-white/[0.07] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}

      <Button
        onClick={onAddClick}
        size="sm"
        className="gap-1.5 bg-white/[0.08] hover:bg-white/[0.14] text-white/80 hover:text-white border border-white/[0.1] hover:border-white/[0.18] transition-colors shrink-0"
      >
        <Plus className="size-3.5" />
        Add
      </Button>
    </header>
  )
}
