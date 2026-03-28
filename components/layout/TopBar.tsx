'use client'

import { Plus } from 'lucide-react'

interface TopBarProps {
  pageTitle: string
  /** Opens manual add; omitted on pages where capture/shortcuts are the primary flow */
  onAddClick?: () => void
}

export default function TopBar({ pageTitle, onAddClick }: TopBarProps) {
  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-border gap-4 bg-background">
      <h1 className="text-sm font-semibold text-foreground/80 tracking-tight shrink-0">
        {pageTitle}
      </h1>

      {onAddClick ? (
        <button
          type="button"
          onClick={onAddClick}
          className="flex items-center justify-center size-8 rounded-lg text-muted-foreground shrink-0 transition-colors hover:text-foreground hover:bg-muted"
          aria-label="Add article manually"
          title="Add article manually"
        >
          <Plus className="size-4" strokeWidth={1.75} />
        </button>
      ) : (
        <span className="size-8 shrink-0" aria-hidden />
      )}
    </header>
  )
}
