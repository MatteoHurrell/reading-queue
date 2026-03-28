'use client'

import { useState, useMemo } from 'react'
import { BookOpen, Search, X } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { useReadingItems } from '@/hooks/use-reading-items'
import ReadingItemCard from '@/components/reading-items/ReadingItemCard'
import EditItemModal from '@/components/reading-items/EditItemModal'
import ConfirmDeleteDialog from '@/components/reading-items/ConfirmDeleteDialog'
import EmptyState from '@/components/shared/EmptyState'
import type { ReadingItem } from '@/lib/types'

export default function DashboardPage() {
  const { items, updateItem, deleteItem, transitionStatus, toggleFavorite } = useReadingItems()

  const [editItem, setEditItem] = useState<ReadingItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const activeItems = useMemo(() => {
    let result = items.filter(
      (i) => i.status === 'inbox' || i.status === 'queued' || i.status === 'reading'
    )
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.publisher.toLowerCase().includes(q) ||
          (i.author?.toLowerCase().includes(q) ?? false)
      )
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [items, searchQuery])

  const deleteTarget = deleteId ? items.find((i) => i.id === deleteId) : null

  return (
    <AppShell pageTitle="Bookmarks" showHeaderAdd>
      {items.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <EmptyState
            icon={<BookOpen className="size-5" />}
            heading="No bookmarks yet"
            subtext="Save your first article to get started."
          />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-card border border-border rounded-lg pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500/15 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {activeItems.length} {activeItems.length === 1 ? 'bookmark' : 'bookmarks'}
          </p>

          {activeItems.length === 0 && searchQuery ? (
            <EmptyState
              heading="No results"
              subtext="Try a different search term."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeItems.map((item) => (
                <ReadingItemCard
                  key={item.id}
                  item={item}
                  onEdit={setEditItem}
                  onDelete={setDeleteId}
                  onTransition={transitionStatus}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <EditItemModal
        item={editItem}
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        onSave={updateItem}
      />

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        itemTitle={deleteTarget?.title ?? ''}
        onConfirm={() => {
          if (deleteId) {
            deleteItem(deleteId)
            setDeleteId(null)
          }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </AppShell>
  )
}
