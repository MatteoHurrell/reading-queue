'use client'

import { useRef, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import { useReadingItems } from '@/hooks/use-reading-items'
import { exportData, importData } from '@/lib/storage'
import { BookMarked } from 'lucide-react'
import type { ReadingItem } from '@/lib/types'

const BOOKMARKLET_PROD = `javascript:(function(){var u=encodeURIComponent(window.location.href);window.open('https://reading-queue.vercel.app/add?url='+u,'rq_add','width=420,height=380,left='+(screen.width/2-210)+',top='+(screen.height/2-190));})();`

const BOOKMARKLET_DEV = `javascript:(function(){var u=encodeURIComponent(window.location.href);window.open('http://localhost:3000/add?url='+u,'rq_add','width=420,height=380,left='+(screen.width/2-210)+',top='+(screen.height/2-190));})();`

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
      <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { items, resetToDemo, replaceItems } = useReadingItems()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<
    { type: 'success'; count: number } | { type: 'error'; message: string } | null
  >(null)
  const [confirmReset, setConfirmReset] = useState(false)

  function handleExport() {
    exportData(items)
  }

  function handleImportClick() {
    setImportStatus(null)
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const imported: ReadingItem[] = await importData(file)
      replaceItems(imported)
      setImportStatus({ type: 'success', count: imported.length })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error during import.'
      setImportStatus({ type: 'error', message })
    }
  }

  function handleResetToDemo() {
    resetToDemo()
    setConfirmReset(false)
  }

  const storageSizeKb = (JSON.stringify(items).length / 1024).toFixed(1)

  return (
    <AppShell pageTitle="Settings">
      <div className="max-w-xl space-y-4">
        <Section title="Quick Capture">
          <p className="text-sm text-muted-foreground">
            Drag the button below to your bookmark bar. One click saves the current page — we fetch the
            title and preview from the site automatically.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={BOOKMARKLET_PROD}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/uri-list', BOOKMARKLET_PROD)
                e.dataTransfer.setData('text/plain', BOOKMARKLET_PROD)
              }}
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium cursor-grab shadow-sm hover:bg-primary/90 transition-colors select-none"
            >
              <BookMarked size={14} />
              + Reading Queue
            </a>

            <a
              href={BOOKMARKLET_DEV}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/uri-list', BOOKMARKLET_DEV)
                e.dataTransfer.setData('text/plain', BOOKMARKLET_DEV)
              }}
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground text-xs cursor-grab hover:bg-accent transition-colors select-none"
            >
              <BookMarked size={11} />
              Localhost (dev)
            </a>
          </div>

          <div className="rounded-xl bg-muted/50 border border-border p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground/80 mb-1.5">Keyboard shortcut tips:</p>
            <p>
              <span className="font-medium text-foreground/80">Arc:</span> Press Cmd+T to open the command bar (Arc uses this for new tabs and quick
              open), then type &ldquo;Reading Queue&rdquo;. Alternatively, Cmd+L focuses the address bar in the current tab if you prefer not to open a new
              tab.
            </p>
            <p><span className="font-medium text-foreground/80">Raycast:</span> Add an &ldquo;Open Bookmark&rdquo; command</p>
            <p><span className="font-medium text-foreground/80">Alfred:</span> Create a Web Bookmark workflow</p>
          </div>
        </Section>

        <Section title="Data">
          <p className="text-sm text-muted-foreground">
            Export your data as JSON or import a previous backup.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-muted/50 hover:bg-muted text-foreground border border-border transition-colors"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={handleImportClick}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-muted/50 hover:bg-muted text-foreground border border-border transition-colors"
            >
              Import JSON
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />

          {importStatus !== null && (
            <div
              className={`rounded-xl px-3 py-2 text-sm ${
                importStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {importStatus.type === 'success'
                ? `Imported ${importStatus.count} item${importStatus.count === 1 ? '' : 's'}.`
                : importStatus.message}
            </div>
          )}
        </Section>

        <Section title="Demo Data">
          <p className="text-sm text-muted-foreground">
            Replace all data with sample items. This cannot be undone.
          </p>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
            >
              Reset to demo data
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-sm text-amber-800 flex-1">Are you sure?</p>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-card text-muted-foreground border border-border transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDemo}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
              >
                Yes, reset
              </button>
            </div>
          )}
        </Section>

        <div className="text-xs text-muted-foreground px-1">
          {items.length} {items.length === 1 ? 'item' : 'items'} · {storageSizeKb} KB stored locally
        </div>
      </div>
    </AppShell>
  )
}
