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
import { TOPICS, TOPIC_LABELS, PRIORITY_LABELS } from '@/lib/constants'
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
            <h1 className="text-2xl font-bold text-white tracking-tight">Inbox</h1>
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium px-2 py-0.5 rounded-full tabular-nums">
              {inboxItems.length}
            </span>
          </div>
          <Button
            size="sm"
            className="gap-1.5 border-0 text-white transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
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
                className="group flex flex-col rounded-2xl overflow-hidden border border-white/[0.07] hover:border-white/[0.14] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-200 bg-white/[0.03]"
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
    <div className="bg-white/[0.02] border-t border-white/[0.05] rounded-b-2xl px-4 py-3 flex items-center gap-3">
      <Button
        size="sm"
        className="h-7 px-3 text-xs border-0 text-white transition-all duration-200"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        onClick={() => onTransition(item.id, 'queued')}
      >
        Move to Queue
      </Button>
      <button
        className="h-7 px-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
        onClick={() => onTransition(item.id, 'dropped')}
      >
        Drop
      </button>
      <div className="flex items-center gap-2 ml-auto">
        <Select
          value={item.priority}
          onValueChange={(val) => onUpdate(item.id, { priority: val as Priority })}
        >
          <SelectTrigger className="h-7 text-xs min-w-[120px] bg-transparent border-white/[0.12] text-white/50 hover:border-white/25 focus:ring-0">
            <SelectValue>{PRIORITY_LABELS[item.priority]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(['high', 'medium', 'low'] as Priority[]).map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={item.topic}
          onValueChange={(val) => onUpdate(item.id, { topic: val as Topic })}
        >
          <SelectTrigger className="h-7 text-xs min-w-[160px] bg-transparent border-white/[0.12] text-white/50 hover:border-white/25 focus:ring-0">
            <SelectValue>{TOPIC_LABELS[item.topic]}</SelectValue>
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
