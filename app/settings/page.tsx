'use client'

import { useRef, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import { useReadingItems } from '@/hooks/use-reading-items'
import { exportData, importData } from '@/lib/storage'
import { BookMarked } from 'lucide-react'
import type { ReadingItem } from '@/lib/types'

const BOOKMARKLET_PROD = `javascript:(function(){var u=encodeURIComponent(window.location.href);var t=encodeURIComponent(document.title);window.open('https://reading-queue.vercel.app/add?url='+u+'&title='+t,'rq_add','width=420,height=380,left='+(screen.width/2-210)+',top='+(screen.height/2-190));})();`

const BOOKMARKLET_DEV = `javascript:(function(){var u=encodeURIComponent(window.location.href);var t=encodeURIComponent(document.title);window.open('http://localhost:3000/add?url='+u+'&title='+t,'rq_add','width=420,height=380,left='+(screen.width/2-210)+',top='+(screen.height/2-190));})();`

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
      {children}
    </h2>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
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
      <div className="max-w-2xl space-y-4">
        {/* Quick Capture */}
        <Card>
          <SectionHeading>Quick Capture</SectionHeading>
          <div className="space-y-5">

            {/* Bookmarklet */}
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Drag the button below to your browser&apos;s bookmark bar. Click it on any webpage to instantly save the article to your inbox.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {/* Production bookmarklet */}
                <a
                  href={BOOKMARKLET_PROD}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/uri-list', BOOKMARKLET_PROD)
                    e.dataTransfer.setData('text/plain', BOOKMARKLET_PROD)
                  }}
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-600 text-sm font-medium cursor-grab hover:bg-indigo-500/20 transition-all select-none"
                >
                  <BookMarked size={14} />
                  + Reading Queue
                </a>

                {/* Dev bookmarklet */}
                <a
                  href={BOOKMARKLET_DEV}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/uri-list', BOOKMARKLET_DEV)
                    e.dataTransfer.setData('text/plain', BOOKMARKLET_DEV)
                  }}
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-400 text-xs cursor-grab hover:bg-gray-100 transition-all select-none"
                >
                  <BookMarked size={11} />
                  Localhost (dev)
                </a>
              </div>
            </div>

            {/* Keyboard shortcut instructions */}
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-xs text-gray-400 space-y-1.5">
              <p className="font-medium text-gray-500 mb-2">Setting up a keyboard shortcut:</p>
              <p><span className="text-gray-500 font-medium">Arc Browser:</span> The bookmark appears in your command bar. Press Cmd+T and type &ldquo;Reading Queue&rdquo;</p>
              <p><span className="text-gray-500 font-medium">Raycast:</span> Add a &ldquo;Open Bookmark&rdquo; command and assign your shortcut of choice</p>
              <p><span className="text-gray-500 font-medium">Alfred:</span> Create a Web Bookmark workflow and assign a hotkey</p>
              <p><span className="text-gray-500 font-medium">Chrome:</span> Go to chrome://extensions/shortcuts to assign shortcuts to extensions</p>
            </div>

          </div>
        </Card>

        {/* Data */}
        <Card>
          <SectionHeading>Data</SectionHeading>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-3">
                Export your data as JSON to back it up, or import a previously exported file to restore.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={handleImportClick}
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  Import JSON
                </button>
              </div>
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
                className={`rounded-xl px-3 py-2.5 text-sm ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                {importStatus.type === 'success'
                  ? `Imported ${importStatus.count} item${importStatus.count === 1 ? '' : 's'}.`
                  : importStatus.message}
              </div>
            )}
          </div>
        </Card>

        {/* Demo Data */}
        <Card>
          <SectionHeading>Demo Data</SectionHeading>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Replaces all your data with sample reading items. This cannot be undone.
            </p>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all duration-200"
              >
                Reset to demo data
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <p className="text-sm text-amber-800 flex-1">
                  Are you sure? All current items will be replaced.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetToDemo}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 transition-colors"
                >
                  Yes, reset
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* About */}
        <Card>
          <SectionHeading>About</SectionHeading>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <p className="text-base font-semibold text-gray-900 font-serif">Reading Queue</p>
              <span className="text-xs text-gray-400">v1.0.0</span>
            </div>
            <p className="text-sm text-gray-500">
              A local-first reading workflow app. Your data lives entirely in your browser.
            </p>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400">
                Storage used: <span className="tabular-nums">{storageSizeKb} KB</span>
                <span className="text-gray-300"> &middot; {items.length} {items.length === 1 ? 'item' : 'items'}</span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
