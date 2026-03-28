'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, List, RotateCcw, Star, Search, X, BookOpen } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ReadingItemCard from '@/components/reading-items/ReadingItemCard'
import ReadingItemTable from '@/components/reading-items/ReadingItemTable'
import EditItemModal from '@/components/reading-items/EditItemModal'
import ConfirmDeleteDialog from '@/components/reading-items/ConfirmDeleteDialog'
import EmptyState from '@/components/shared/EmptyState'
import { useReadingItems } from '@/hooks/use-reading-items'
import { useFilters } from '@/hooks/use-filters'
import {
  TOPICS,
  TOPIC_LABELS,
  SOURCE_TYPES,
  SOURCE_TYPE_LABELS,
  PRIORITY_LABELS,
  NEGLECT_THRESHOLD_DAYS,
} from '@/lib/constants'
import type { ReadingItem, Topic, SourceType, Priority } from '@/lib/types'

type ViewMode = 'card' | 'table'

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const MAX_MINUTES_OPTIONS = [
  { label: 'Any length', value: 'any' },
  { label: 'Under 5 min', value: '5' },
  { label: 'Under 10 min', value: '10' },
  { label: 'Under 20 min', value: '20' },
] as const

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Highest Priority', value: 'priority' },
  { label: 'Shortest Read', value: 'shortest' },
  { label: 'Longest Neglected', value: 'neglected' },
] as const

export default function QueuePage() {
  const { items, updateItem, deleteItem, transitionStatus, toggleFavorite } =
    useReadingItems()
  const { filters, setFilter, resetFilters } = useFilters()

  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [editItem, setEditItem] = useState<ReadingItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Derive unique publishers from queue items
  const queueBaseItems = useMemo(
    () => items.filter((i) => i.status === 'queued' || i.status === 'reading'),
    [items]
  )

  const uniquePublishers = useMemo(() => {
    const seen = new Set<string>()
    for (const item of queueBaseItems) {
      seen.add(item.publisher)
    }
    return Array.from(seen).sort()
  }, [queueBaseItems])

  // Apply filters to queued + reading items (mirrors useFilters logic but allows 'reading')
  const filteredItems = useMemo(() => {
    let result = queueBaseItems

    if (filters.topic !== 'all') {
      result = result.filter((item) => item.topic === filters.topic)
    }

    if (filters.publisher !== 'all') {
      result = result.filter((item) => item.publisher === filters.publisher)
    }

    if (filters.sourceType !== 'all') {
      result = result.filter((item) => item.sourceType === filters.sourceType)
    }

    if (filters.priority !== 'all') {
      result = result.filter((item) => item.priority === filters.priority)
    }

    if (filters.favoritesOnly) {
      result = result.filter((item) => item.isFavorite)
    }

    if (filters.maxMinutes !== null) {
      const max = filters.maxMinutes
      result = result.filter(
        (item) =>
          item.estimatedMinutes !== undefined && item.estimatedMinutes <= max
      )
    }

    // Apply text search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.publisher.toLowerCase().includes(q) ||
          (item.author?.toLowerCase().includes(q) ?? false) ||
          item.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          (item.notes?.toLowerCase().includes(q) ?? false)
      )
    }

    switch (filters.sort) {
      case 'newest':
        result = [...result].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case 'oldest':
        result = [...result].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        break
      case 'priority':
        result = [...result].sort(
          (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        )
        break
      case 'shortest':
        result = [...result].sort((a, b) => {
          const aMin = a.estimatedMinutes ?? Infinity
          const bMin = b.estimatedMinutes ?? Infinity
          return aMin - bMin
        })
        break
      case 'neglected': {
        const now = Date.now()
        const thresholdMs = NEGLECT_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
        result = [...result].sort((a, b) => {
          const aDate = new Date(a.queuedAt ?? a.createdAt).getTime()
          const bDate = new Date(b.queuedAt ?? b.createdAt).getTime()
          const aAge = now - aDate
          const bAge = now - bDate
          const aNeglected = aAge > thresholdMs
          const bNeglected = bAge > thresholdMs
          if (aNeglected && !bNeglected) return -1
          if (!aNeglected && bNeglected) return 1
          return bAge - aAge
        })
        break
      }
    }

    return result
  }, [queueBaseItems, filters, searchQuery])

  const isFiltersActive =
    filters.topic !== 'all' ||
    filters.publisher !== 'all' ||
    filters.sourceType !== 'all' ||
    filters.priority !== 'all' ||
    filters.favoritesOnly ||
    filters.maxMinutes !== null ||
    filters.sort !== 'newest'

  const hasActiveSearch = searchQuery.trim().length > 0

  function handleEdit(item: ReadingItem) {
    setEditItem(item)
    setEditOpen(true)
  }

  function handleDeleteRequest(id: string) {
    setDeleteId(id)
  }

  function handleDeleteConfirm() {
    if (deleteId) {
      deleteItem(deleteId)
      setDeleteId(null)
    }
  }

  function handleResetAll() {
    resetFilters()
    setSearchQuery('')
  }

  const deleteTarget = deleteId
    ? items.find((i) => i.id === deleteId)
    : undefined

  return (
    <AppShell pageTitle="Queue">
      <div className="flex flex-col gap-5">
        {/* Search + Filter bar */}
        <div className="bg-[#141414] border border-white/[0.08] rounded-lg px-4 py-3 flex flex-col gap-3">
          {/* Search row */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/30 pointer-events-none" />
            <input
              type="text"
              placeholder="Search queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-8 text-sm text-white/80 placeholder:text-white/30 outline-none focus:border-white/[0.16] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Topic */}
            <Select
              value={filters.topic}
              onValueChange={(val) => setFilter('topic', val as Topic | 'all')}
            >
              <SelectTrigger size="sm" className="min-w-[130px]">
                <SelectValue placeholder="All Topics">
                  {filters.topic === 'all' ? 'All Topics' : TOPIC_LABELS[filters.topic as Topic]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {TOPICS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TOPIC_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Publisher */}
            <Select
              value={filters.publisher}
              onValueChange={(val) => setFilter('publisher', val as string | 'all')}
            >
              <SelectTrigger size="sm" className="min-w-[130px]">
                <SelectValue placeholder="All Publishers">
                  {filters.publisher === 'all' ? 'All Publishers' : filters.publisher}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Publishers</SelectItem>
                {uniquePublishers.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Source type */}
            <Select
              value={filters.sourceType}
              onValueChange={(val) =>
                setFilter('sourceType', val as SourceType | 'all')
              }
            >
              <SelectTrigger size="sm" className="min-w-[120px]">
                <SelectValue placeholder="All Types">
                  {filters.sourceType === 'all' ? 'All Types' : SOURCE_TYPE_LABELS[filters.sourceType as SourceType]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {SOURCE_TYPES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SOURCE_TYPE_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority */}
            <Select
              value={filters.priority}
              onValueChange={(val) =>
                setFilter('priority', val as Priority | 'all')
              }
            >
              <SelectTrigger size="sm" className="min-w-[110px]">
                <SelectValue placeholder="All Priorities">
                  {filters.priority === 'all' ? 'All Priorities' : PRIORITY_LABELS[filters.priority as Priority]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Max read time */}
            <Select
              value={filters.maxMinutes === null ? 'any' : String(filters.maxMinutes)}
              onValueChange={(val) =>
                setFilter('maxMinutes', val === 'any' ? null : Number(val))
              }
            >
              <SelectTrigger size="sm" className="min-w-[130px]">
                <SelectValue placeholder="Any length">
                  {filters.maxMinutes === null
                    ? 'Any length'
                    : MAX_MINUTES_OPTIONS.find((o) => o.value === String(filters.maxMinutes))?.label ?? 'Any length'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MAX_MINUTES_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Favorites toggle */}
            <button
              onClick={() => setFilter('favoritesOnly', !filters.favoritesOnly)}
              className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[min(var(--radius-md),10px)] text-[0.8rem] font-medium transition-colors border ${
                filters.favoritesOnly
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-transparent text-white/50 border-white/[0.12] hover:text-white/70 hover:border-white/20'
              }`}
              aria-pressed={filters.favoritesOnly}
            >
              <Star
                className="size-3.5"
                fill={filters.favoritesOnly ? 'currentColor' : 'none'}
              />
              Favorites
            </button>

            {/* Sort */}
            <Select
              value={filters.sort}
              onValueChange={(val) =>
                setFilter(
                  'sort',
                  val as 'newest' | 'oldest' | 'priority' | 'shortest' | 'neglected'
                )
              }
            >
              <SelectTrigger size="sm" className="min-w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset */}
            {(isFiltersActive || hasActiveSearch) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetAll}
                className="text-white/40 hover:text-white/70 gap-1"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Toolbar: count + view toggle */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-white/50">
            {filteredItems.length}{' '}
            {filteredItems.length === 1 ? 'item' : 'items'}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'card'
                  ? 'text-white/90 bg-white/[0.08]'
                  : 'text-white/30 hover:text-white/60'
              }`}
              aria-label="Card view"
              aria-pressed={viewMode === 'card'}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table'
                  ? 'text-white/90 bg-white/[0.08]'
                  : 'text-white/30 hover:text-white/60'
              }`}
              aria-label="Table view"
              aria-pressed={viewMode === 'table'}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {queueBaseItems.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="size-5" />}
            heading="Your queue is empty"
            subtext="Triage items from your inbox to add them here."
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            heading="No items match your filters"
            subtext="Try adjusting or resetting your filters."
            action={{ label: 'Reset filters', onClick: handleResetAll }}
          />
        ) : viewMode === 'card' ? (
          <div className="flex flex-col gap-1.5">
            {filteredItems.map((item) => (
              <ReadingItemCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                onTransition={transitionStatus}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#141414] border border-white/[0.08] rounded-lg overflow-hidden">
            <ReadingItemTable
              items={filteredItems}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onTransition={transitionStatus}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <EditItemModal
        item={editItem}
        open={editOpen}
        onClose={() => {
          setEditOpen(false)
          setEditItem(null)
        }}
        onSave={updateItem}
      />
      <ConfirmDeleteDialog
        open={deleteId !== null}
        itemTitle={deleteTarget?.title ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </AppShell>
  )
}
