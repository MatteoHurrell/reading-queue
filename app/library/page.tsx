'use client'

import { useState, useMemo } from 'react'
import { Search, X as XIcon } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import ReadingItemTable from '@/components/reading-items/ReadingItemTable'
import EditItemModal from '@/components/reading-items/EditItemModal'
import ConfirmDeleteDialog from '@/components/reading-items/ConfirmDeleteDialog'
import EmptyState from '@/components/shared/EmptyState'
import { useReadingItems } from '@/hooks/use-reading-items'
import type { ReadingItem } from '@/lib/types'

type LibraryTab = 'finished' | 'archived' | 'dropped' | 'favorites'

function searchItems(items: ReadingItem[], query: string): ReadingItem[] {
  if (!query.trim()) return items
  const q = query.toLowerCase()
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.publisher.toLowerCase().includes(q) ||
      (item.author?.toLowerCase().includes(q) ?? false) ||
      (item.whySaved?.toLowerCase().includes(q) ?? false) ||
      (item.notes?.toLowerCase().includes(q) ?? false) ||
      item.tags.some((tag) => tag.toLowerCase().includes(q))
  )
}

interface TabEmptyProps {
  message: string
  searchQuery?: string
  onClearSearch?: () => void
}

function TabEmpty({ message, searchQuery, onClearSearch }: TabEmptyProps) {
  if (searchQuery) {
    return (
      <EmptyState
        heading="No items match your search"
        subtext="Try different keywords or clear the search."
        action={onClearSearch ? { label: 'Clear search', onClick: onClearSearch } : undefined}
      />
    )
  }
  return (
    <EmptyState heading={message} />
  )
}

export default function LibraryPage() {
  const { items, updateItem, deleteItem, transitionStatus, toggleFavorite } =
    useReadingItems()

  const [activeTab, setActiveTab] = useState<LibraryTab>('finished')
  const [searchQuery, setSearchQuery] = useState('')
  const [editItem, setEditItem] = useState<ReadingItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)
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

  const favoriteItems = useMemo(
    () =>
      items
        .filter((i) => i.isFavorite)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [items]
  )

  const tabItems: Record<LibraryTab, ReadingItem[]> = {
    finished: finishedItems,
    archived: archivedItems,
    dropped: droppedItems,
    favorites: favoriteItems,
  }

  const visibleItems = useMemo(
    () => searchItems(tabItems[activeTab], searchQuery),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab, searchQuery, finishedItems, archivedItems, droppedItems, favoriteItems]
  )

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

  const deleteTarget = deleteId
    ? items.find((i) => i.id === deleteId)
    : undefined

  const EMPTY_MESSAGES: Record<LibraryTab, string> = {
    finished: 'Nothing finished yet. Complete something in your queue.',
    archived: 'No archived items.',
    dropped: 'No dropped items.',
    favorites: 'No favorites yet. Star items you want to keep.',
  }

  return (
    <AppShell pageTitle="Library">
      <div className="flex flex-col gap-5">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, publisher, author, tags, or notes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-9 text-sm text-white/70 placeholder:text-white/25 outline-none focus:border-indigo-500/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              aria-label="Clear search"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as LibraryTab)
            setSearchQuery('')
          }}
        >
          <TabsList className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 h-auto gap-0.5">
            <TabsTrigger
              value="finished"
              className="gap-1.5 rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=inactive]:text-white/40 data-[state=inactive]:hover:text-white/60 transition-all duration-200"
            >
              Finished
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40 ml-1.5 tabular-nums">
                {finishedItems.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="gap-1.5 rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=inactive]:text-white/40 data-[state=inactive]:hover:text-white/60 transition-all duration-200"
            >
              Archived
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40 ml-1.5 tabular-nums">
                {archivedItems.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="dropped"
              className="gap-1.5 rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=inactive]:text-white/40 data-[state=inactive]:hover:text-white/60 transition-all duration-200"
            >
              Dropped
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40 ml-1.5 tabular-nums">
                {droppedItems.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="gap-1.5 rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=inactive]:text-white/40 data-[state=inactive]:hover:text-white/60 transition-all duration-200"
            >
              Favorites
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40 ml-1.5 tabular-nums">
                {favoriteItems.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Finished tab */}
          <TabsContent value="finished" className="mt-4">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.07] rounded-2xl overflow-hidden">
              {visibleItems.length === 0 ? (
                <TabEmpty
                  message={EMPTY_MESSAGES[activeTab]}
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery('')}
                />
              ) : (
                <ReadingItemTable
                  items={visibleItems}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                  onTransition={transitionStatus}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            </div>
          </TabsContent>

          {/* Archived tab */}
          <TabsContent value="archived" className="mt-4">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.07] rounded-2xl overflow-hidden">
              {visibleItems.length === 0 ? (
                <TabEmpty
                  message={
                    searchQuery
                      ? 'No items match your search.'
                      : EMPTY_MESSAGES.archived
                  }
                />
              ) : (
                <ReadingItemTable
                  items={visibleItems}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                  onTransition={transitionStatus}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            </div>
          </TabsContent>

          {/* Dropped tab */}
          <TabsContent value="dropped" className="mt-4">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.07] rounded-2xl overflow-hidden">
              {visibleItems.length === 0 ? (
                <TabEmpty
                  message={
                    searchQuery
                      ? 'No items match your search.'
                      : EMPTY_MESSAGES.dropped
                  }
                />
              ) : (
                <ReadingItemTable
                  items={visibleItems}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                  onTransition={transitionStatus}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            </div>
          </TabsContent>

          {/* Favorites tab */}
          <TabsContent value="favorites" className="mt-4">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.07] rounded-2xl overflow-hidden">
              {visibleItems.length === 0 ? (
                <TabEmpty
                  message={
                    searchQuery
                      ? 'No items match your search.'
                      : EMPTY_MESSAGES.favorites
                  }
                />
              ) : (
                <ReadingItemTable
                  items={visibleItems}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                  onTransition={transitionStatus}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
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
