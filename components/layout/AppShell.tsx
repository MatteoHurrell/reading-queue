'use client'

import { useState } from 'react'
import SidebarNav from './SidebarNav'
import TopBar from './TopBar'
import QuickAddModal from '@/components/reading-items/QuickAddModal'
import { useReadingItems } from '@/hooks/use-reading-items'

interface AppShellProps {
  pageTitle: string
  children: React.ReactNode
  /** Bookmarks only: subtle header control + quick-add for occasional manual entry */
  showHeaderAdd?: boolean
}

function HeaderWithQuickAdd({ pageTitle }: { pageTitle: string }) {
  const { items, addItem } = useReadingItems()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <>
      <TopBar pageTitle={pageTitle} onAddClick={() => setAddOpen(true)} />
      <QuickAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addItem}
        existingItems={items}
      />
    </>
  )
}

export default function AppShell({
  pageTitle,
  children,
  showHeaderAdd = false,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <div className="flex flex-col flex-1 md:ml-56 min-h-screen bg-background">
        {showHeaderAdd ? (
          <HeaderWithQuickAdd pageTitle={pageTitle} />
        ) : (
          <TopBar pageTitle={pageTitle} />
        )}
        <main className="flex-1 px-6 py-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
