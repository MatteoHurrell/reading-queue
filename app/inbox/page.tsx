'use client'

import { useState } from 'react'
import { Inbox, Plus } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useReadingItems } from '@/hooks/use-reading-items'
import ReadingItemCard from '@/components/reading-items/ReadingItemCard'
import EditItemModal from '@/components/reading-items/EditItemModal'
import ConfirmDeleteDialog from '@/components/reading-items/ConfirmDeleteDialog'
import QuickAddModal from '@/components/reading-items/QuickAddModal'
import EmptyState from '@/components/shared/EmptyState'
import { getInboxItems } from '@/lib/selectors'
import { TOPICS, TOPIC_LABELS } from '@/lib/constants'
import type { ReadingItem, Priority, Topic } from '@/lib/types'

export default function InboxPage() {
  const { items, addItem, updateItem, deleteItem, transitionStatus, toggleFavorite } =
    useReadingItems()

  const [editItem, setEditItem] = useState<ReadingItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const inboxItems = getInboxItems(items)
  const deleteTarget = deleteId ? items.find((i) => i.id === deleteId) : null

  function handleEdit(item: ReadingItem) {
    setEditItem(item)
  }

  function handleDelete(id: string) {
    setDeleteId(id)
  }

  function handleConfirmDelete() {
    if (deleteId) {
      deleteItem(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <AppShell pageTitle="Inbox">
      <div className="flex flex-col gap-6 max-w-4xl">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-white/90">Inbox</h1>
            <span className="text-sm text-amber-400 font-medium tabular-nums bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-full">
              {inboxItems.length}
            </span>
          </div>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-3.5" />
            Add item
          </Button>
        </div>

        {/* Empty state */}
        {inboxItems.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-5" />}
            heading="Inbox is clear"
            subtext="Articles you save will appear here first."
            action={{ label: '+ Add article', onClick: () => setAddOpen(true) }}
          />
        ) : (
          /* Item list */
          <div className="flex flex-col gap-3">
            {inboxItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col rounded-lg overflow-hidden border border-white/[0.08] hover:border-white/[0.14] transition-colors"
              >
                <ReadingItemCard
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTransition={transitionStatus}
                  onToggleFavorite={toggleFavorite}
                />
                {/* Inline triage bar */}
                <TriageBar
                  item={item}
                  onTransition={transitionStatus}
                  onUpdate={updateItem}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <EditItemModal
        item={editItem}
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        onSave={updateItem}
      />

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        itemTitle={deleteTarget?.title ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <QuickAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addItem}
        existingItems={items}
      />
    </AppShell>
  )
}

interface TriageBarProps {
  item: ReadingItem
  onTransition: (id: string, status: 'queued' | 'dropped') => void
  onUpdate: (id: string, changes: Partial<ReadingItem>) => void
}

function TriageBar({ item, onTransition, onUpdate }: TriageBarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-[#111111] border-t border-white/[0.06]">
      <Button
        size="sm"
        className="h-7 px-3 text-xs bg-blue-600/80 hover:bg-blue-600 text-white border-0"
        onClick={() => onTransition(item.id, 'queued')}
      >
        Move to Queue
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-3 text-xs border-red-500/25 text-red-400/70 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10"
        onClick={() => onTransition(item.id, 'dropped')}
      >
        Drop
      </Button>
      <div className="flex items-center gap-2 ml-auto">
        <Select
          value={item.priority}
          onValueChange={(val) => onUpdate(item.id, { priority: val as Priority })}
        >
          <SelectTrigger className="h-7 text-xs w-28 bg-transparent border-white/[0.12] text-white/50 hover:border-white/25 focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High priority</SelectItem>
            <SelectItem value="medium">Medium priority</SelectItem>
            <SelectItem value="low">Low priority</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={item.topic}
          onValueChange={(val) => onUpdate(item.id, { topic: val as Topic })}
        >
          <SelectTrigger className="h-7 text-xs w-36 bg-transparent border-white/[0.12] text-white/50 hover:border-white/25 focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOPICS.map((t) => (
              <SelectItem key={t} value={t}>
                {TOPIC_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
