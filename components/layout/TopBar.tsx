'use client'

import { X, Plus, Search } from 'lucide-react'

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
    <header
      className="flex items-center justify-between h-14 px-6 border-b border-white/[0.05] gap-4"
      style={{ background: 'rgba(6,9,18,0.60)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      <h1 className="text-sm font-semibold text-white/80 tracking-tight shrink-0">
        {pageTitle}
      </h1>

      {showSearch && (
        <div className="relative flex items-center w-64">
          <Search className="absolute left-2.5 size-3.5 text-white/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full h-8 rounded-lg pl-8 pr-8 text-sm text-white/70 placeholder:text-white/25 outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            }}
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

      <button
        onClick={onAddClick}
        className="flex items-center gap-1.5 px-4 h-8 rounded-lg text-sm font-medium text-white shrink-0 transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: '0 0 20px rgba(99,102,241,0.35)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)'
          e.currentTarget.style.boxShadow = '0 0 28px rgba(99,102,241,0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.35)'
        }}
      >
        <Plus className="size-3.5" />
        Add
      </button>
    </header>
  )
}
