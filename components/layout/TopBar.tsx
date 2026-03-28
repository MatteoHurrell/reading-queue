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
    <header className="flex items-center justify-between h-14 px-6 border-b border-gray-200 gap-4 bg-white">
      <h1 className="text-sm font-semibold text-gray-900 tracking-tight shrink-0 font-serif">
        {pageTitle}
      </h1>

      {showSearch && (
        <div className="relative flex items-center w-64">
          <Search className="absolute left-2.5 size-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full h-8 rounded-lg pl-8 pr-8 text-sm text-gray-700 placeholder:text-gray-300 outline-none transition-colors bg-gray-50 border border-gray-200 focus:border-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}

      <button
        onClick={onAddClick}
        className="flex items-center gap-1.5 px-4 h-8 rounded-lg text-sm font-medium text-white shrink-0 transition-all duration-200 hover:opacity-90 bg-gray-900"
      >
        <Plus className="size-3.5" />
        Add
      </button>
    </header>
  )
}
