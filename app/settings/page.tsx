'use client'

import { useRef, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import { useReadingItems } from '@/hooks/use-reading-items'
import { exportData, importData } from '@/lib/storage'
import type { ReadingItem } from '@/lib/types'

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">
      {children}
    </h2>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.07] rounded-2xl p-6">
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { items, resetToDemo, replaceItems } = useReadingItems()

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<
    { type: 'success'; count: number } | { type: 'error'; message: string } | null
  >(null)

  // Demo reset confirmation
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

    // Reset input so same file can be re-imported if needed
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

  // Approximate localStorage usage
  const storageSizeKb = (JSON.stringify(items).length / 1024).toFixed(1)

  return (
    <AppShell pageTitle="Settings">
      <div className="max-w-2xl space-y-4">
        {/* Section 1 — Data */}
        <Card>
          <SectionHeading>Data</SectionHeading>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-white/45 mb-3">
                Export your data as JSON to back it up, or import a previously exported file to restore.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-white/70 border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200"
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={handleImportClick}
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-white/70 border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200"
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
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {importStatus.type === 'success'
                  ? `Imported ${importStatus.count} item${importStatus.count === 1 ? '' : 's'}.`
                  : importStatus.message}
              </div>
            )}
          </div>
        </Card>

        {/* Section 2 — Demo data */}
        <Card>
          <SectionHeading>Demo Data</SectionHeading>
          <div className="space-y-3">
            <p className="text-sm text-white/45">
              Replaces all your data with sample reading items. This cannot be undone.
            </p>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-red-500/[0.08] hover:bg-red-500/15 text-red-400 border border-red-500/15 transition-all duration-200"
              >
                Reset to demo data
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 px-4 py-3">
                <p className="text-sm text-amber-300 flex-1">
                  Are you sure? All current items will be replaced.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-white/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetToDemo}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors"
                >
                  Yes, reset
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Section 3 — About */}
        <Card>
          <SectionHeading>About</SectionHeading>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <p className="text-base font-semibold text-white">Reading Queue</p>
              <span className="text-xs text-white/25">v1.0.0</span>
            </div>
            <p className="text-sm text-white/45">
              A local-first reading workflow app. Your data lives entirely in your browser.
            </p>
            <div className="border-t border-white/[0.05] pt-3">
              <p className="text-xs text-white/20">
                Storage used: <span className="tabular-nums">{storageSizeKb} KB</span>
                <span className="text-white/[0.15]"> · {items.length} {items.length === 1 ? 'item' : 'items'}</span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
