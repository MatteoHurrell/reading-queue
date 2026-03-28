'use client'

import { useState } from 'react'
import SidebarNav from './SidebarNav'
import TopBar from './TopBar'
import QuickAddModal from '@/components/reading-items/QuickAddModal'
import { useReadingItems } from '@/hooks/use-reading-items'
import { getInboxItems, getQueuedItems } from '@/lib/selectors'

interface AppShellProps {
  pageTitle: string
  children: React.ReactNode
  showSearch?: boolean
  onSearch?: (q: string) => void
}

export default function AppShell({ pageTitle, children, showSearch = false, onSearch }: AppShellProps) {
  const { items, addItem } = useReadingItems()
  const [addOpen, setAddOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const inboxCount = getInboxItems(items).length
  const queuedCount = getQueuedItems(items).length

  function handleSearchChange(q: string) {
    setSearchQuery(q)
    onSearch?.(q)
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNav inboxCount={inboxCount} queuedCount={queuedCount} />
      <div className="flex flex-col flex-1 md:ml-56 min-h-screen">
        <TopBar
          pageTitle={pageTitle}
          onAddClick={() => setAddOpen(true)}
          showSearch={showSearch}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
        <main className="flex-1 px-6 py-6 overflow-auto">
          {children}
        </main>
      </div>
      <QuickAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addItem}
        existingItems={items}
      />
    </div>
  )
}
