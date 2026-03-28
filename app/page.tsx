'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { useReadingItems } from '@/hooks/use-reading-items'
import EditItemModal from '@/components/reading-items/EditItemModal'
import ConfirmDeleteDialog from '@/components/reading-items/ConfirmDeleteDialog'
import SummaryStats from '@/components/dashboard/SummaryStats'
import CurrentlyReadingPanel from '@/components/dashboard/CurrentlyReadingPanel'
import RecommendedReads from '@/components/dashboard/RecommendedReads'
import QuickWinsPanel from '@/components/dashboard/QuickWinsPanel'
import NeglectedItemsPanel from '@/components/dashboard/NeglectedItemsPanel'
import TopicBreakdownPanel from '@/components/dashboard/TopicBreakdownPanel'
import RecentCompletionsPanel from '@/components/dashboard/RecentCompletionsPanel'
import EmptyState from '@/components/shared/EmptyState'
import { getCurrentlyReading, getQueuedItems, getNeglectedItems, getQuickReads, getInboxItems } from '@/lib/selectors'
import { getRecommendedReads } from '@/lib/recommendations'
import { QUICK_READ_MAX_MINUTES, NEGLECT_THRESHOLD_DAYS } from '@/lib/constants'
import type { ReadingItem } from '@/lib/types'

export default function DashboardPage() {
  const { items, updateItem, deleteItem, transitionStatus, toggleFavorite } = useReadingItems()

  const [editItem, setEditItem] = useState<ReadingItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const currentlyReading = getCurrentlyReading(items)
  const recommended = getRecommendedReads(items)
  const quickReads = getQuickReads(items, QUICK_READ_MAX_MINUTES).slice(0, 4)
  const neglected = getNeglectedItems(items, NEGLECT_THRESHOLD_DAYS).slice(0, 5)
  const queuedItems = getQueuedItems(items)
  const inboxItems = getInboxItems(items)

  const deleteTarget = deleteId ? items.find((i) => i.id === deleteId) : null

  const isCompletelyEmpty = items.length === 0

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
    <AppShell pageTitle="Dashboard">
      {isCompletelyEmpty ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <EmptyState
            icon={<BookOpen className="size-5" />}
            heading="Welcome to Reading Queue"
            subtext="Save your first article to get started."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
          {/* Inbox triage banner */}
          {inboxItems.length > 0 && (
            <Link
              href="/inbox"
              className="flex items-center justify-between px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm hover:bg-amber-500/15 hover:border-amber-500/30 transition-colors group"
            >
              <span className="text-amber-400/80 group-hover:text-amber-400 transition-colors">
                You have{' '}
                <span className="font-semibold text-amber-400">
                  {inboxItems.length} {inboxItems.length === 1 ? 'item' : 'items'}
                </span>{' '}
                in your inbox to triage
              </span>
              <span className="text-amber-400/50 group-hover:text-amber-400/80 text-xs transition-colors">
                Go to Inbox &rarr;
              </span>
            </Link>
          )}

          {/* Section 1 — Summary stats */}
          <SummaryStats items={items} />

          {/* Section 2 — Currently Reading */}
          <CurrentlyReadingPanel
            items={currentlyReading}
            onTransition={transitionStatus}
          />

          {/* Section 3 — Recommended Next Reads */}
          <RecommendedReads
            items={recommended}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTransition={transitionStatus}
            onToggleFavorite={toggleFavorite}
          />

          {/* Section 4 + 5 — Quick Wins + Neglected (side by side on larger screens) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickWinsPanel
              items={quickReads}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTransition={transitionStatus}
              onToggleFavorite={toggleFavorite}
            />
            <NeglectedItemsPanel
              items={neglected}
              onTransition={transitionStatus}
            />
          </div>

          {/* Section 6 — Topic Snapshot */}
          <TopicBreakdownPanel items={queuedItems} />

          {/* Section 7 — Recent Completions */}
          <RecentCompletionsPanel
            items={items}
            onToggleFavorite={toggleFavorite}
          />
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
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </AppShell>
  )
}
