'use client'

import { useState, useMemo } from 'react'
import { Search, X as XIcon } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import ReadingItemCard from '@/components/reading-items/ReadingItemCard'
import EditItemModal from '@/components/reading-items/EditItemModal'
import ConfirmDeleteDialog from '@/components/reading-items/ConfirmDeleteDialog'
import EmptyState from '@/components/shared/EmptyState'
import { useReadingItems } from '@/hooks/use-reading-items'
import type { ReadingItem } from '@/lib/types'

type LibraryTab = 'finished' | 'archived' | 'dropped'

function searchItems(items: ReadingItem[], query: string): ReadingItem[] {
  if (!query.trim()) return items
  const q = query.toLowerCase()
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.publisher.toLowerCase().includes(q) ||
      (item.author?.toLowerCase().includes(q) ?? false)
  )
}

export default function LibraryPage() {
  const { items, updateItem, deleteItem, transitionStatus, toggleFavorite } =
    useReadingItems()

  const [activeTab, setActiveTab] = useState<LibraryTab>('finished')
  const [searchQuery, setSearchQuery] = useState('')
  const [editItem, setEditItem] = useState<ReadingItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const finishedItems = useMemo(
    () =>
      items
        .filter((i) => i.status === 'finished')
        .sort((a, b) => {
          const aTime = a.finishedAt ? new Date(a.finishedAt).getTime() : 0
          const bTime = b.finishedAt ? new Date(b.finishedAt).getTime() : 0
          return bTime - aTime
        }),
    [items]
  )

  const archivedItems = useMemo(
    () =>
      items
        .filter((i) => i.status === 'archived')
        .sort((a, b) => {
          const aTime = a.archivedAt ? new Date(a.archivedAt).getTime() : 0
          const bTime = b.archivedAt ? new Date(b.archivedAt).getTime() : 0
          return bTime - aTime
        }),
    [items]
  )

  const droppedItems = useMemo(
    () =>
      items
        .filter((i) => i.status === 'dropped')
        .sort((a, b) => {
          const aTime = a.droppedAt ? new Date(a.droppedAt).getTime() : 0
          const bTime = b.droppedAt ? new Date(b.droppedAt).getTime() : 0
          return bTime - aTime
        }),
    [items]
  )

  const tabItems: Record<LibraryTab, ReadingItem[]> = {
    finished: finishedItems,
    archived: archivedItems,
    dropped: droppedItems,
  }

  const visibleItems = useMemo(
    () => searchItems(tabItems[activeTab], searchQuery),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab, searchQuery, finishedItems, archivedItems, droppedItems]
  )

  const deleteTarget = deleteId ? items.find((i) => i.id === deleteId) : undefined

  const EMPTY_MESSAGES: Record<LibraryTab, string> = {
    finished: 'Nothing finished yet.',
    archived: 'No archived items.',
    dropped: 'No dropped items.',
  }

  return (
    <AppShell pageTitle="Archive">
      <div className="flex flex-col gap-4 max-w-3xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
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
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as LibraryTab)
            setSearchQuery('')
          }}
        >
          <TabsList className="bg-muted/50 border border-border rounded-lg p-1 h-auto gap-0.5">
            <TabsTrigger
              value="finished"
              className="rounded-md text-xs data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground"
            >
              Finished
              <span className="text-[10px] ml-1.5 text-muted-foreground tabular-nums">{finishedItems.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="rounded-md text-xs data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground"
            >
              Archived
              <span className="text-[10px] ml-1.5 text-muted-foreground tabular-nums">{archivedItems.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="dropped"
              className="rounded-md text-xs data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground"
            >
              Dropped
              <span className="text-[10px] ml-1.5 text-muted-foreground tabular-nums">{droppedItems.length}</span>
            </TabsTrigger>
          </TabsList>

          {(['finished', 'archived', 'dropped'] as LibraryTab[]).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              {visibleItems.length === 0 ? (
                <EmptyState
                  heading={searchQuery ? 'No results' : EMPTY_MESSAGES[tab]}
                  subtext={searchQuery ? 'Try a different search term.' : undefined}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {visibleItems.map((item) => (
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
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <EditItemModal
        item={editItem}
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        onSave={updateItem}
      />
      <ConfirmDeleteDialog
        open={deleteId !== null}
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
