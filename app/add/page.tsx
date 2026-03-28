'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useReadingItems } from '@/hooks/use-reading-items'
import { BookMarked, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react'

type PageState = 'saving' | 'saved' | 'manual' | 'error'

function LogoMark() {
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 mx-auto"
      style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        boxShadow: '0 0 0 1px rgba(99,102,241,0.3)',
      }}
    >
      <BookMarked size={18} className="text-white" />
    </div>
  )
}

function AddPageInner() {
  const searchParams = useSearchParams()
  const { addItem } = useReadingItems()

  const urlParam = searchParams.get('url') ?? ''
  const titleParam = searchParams.get('title') ?? ''
  const hasParams = urlParam.length > 0 && titleParam.length > 0

  const [state, setState] = useState<PageState>(hasParams ? 'saving' : 'manual')
  const [errorMessage, setErrorMessage] = useState('')
  const [canClose, setCanClose] = useState(true)
  const [manualUrl, setManualUrl] = useState('')
  const [manualTitle, setManualTitle] = useState('')
  const [manualSaving, setManualSaving] = useState(false)
  const hasSaved = useRef(false)

  // Auto-save on mount when params are present
  useEffect(() => {
    if (!hasParams || hasSaved.current) return
    hasSaved.current = true

    try {
      addItem({
        title: titleParam,
        url: urlParam,
        publisher: '',
        sourceType: 'other',
        topic: 'other',
        tags: [],
        priority: 'medium',
        status: 'inbox',
        isFavorite: false,
      })
      setState('saved')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setErrorMessage(msg)
      setState('error')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-close after save
  useEffect(() => {
    if (state !== 'saved') return
    const timer = setTimeout(() => {
      try {
        window.close()
        // If still open after a tick, the browser blocked it
        setTimeout(() => setCanClose(false), 300)
      } catch {
        setCanClose(false)
      }
    }, 1800)
    return () => clearTimeout(timer)
  }, [state])

  function handleManualSave() {
    if (!manualUrl.trim() || !manualTitle.trim()) return
    setManualSaving(true)
    try {
      addItem({
        title: manualTitle.trim(),
        url: manualUrl.trim(),
        publisher: '',
        sourceType: 'other',
        topic: 'other',
        tags: [],
        priority: 'medium',
        status: 'inbox',
        isFavorite: false,
      })
      setState('saved')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setErrorMessage(msg)
      setState('error')
      setManualSaving(false)
    }
  }

  function handleRetry() {
    hasSaved.current = false
    setState(hasParams ? 'saving' : 'manual')
    setErrorMessage('')
    if (hasParams) {
      hasSaved.current = true
      try {
        addItem({
          title: titleParam,
          url: urlParam,
          publisher: '',
          sourceType: 'other',
          topic: 'other',
          tags: [],
          priority: 'medium',
          status: 'inbox',
          isFavorite: false,
        })
        setState('saved')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong.'
        setErrorMessage(msg)
        setState('error')
      }
    }
  }

  const displayTitle = titleParam || manualTitle

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060912] px-4 py-6">
      <div className="w-full max-w-sm mx-auto bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
        <LogoMark />

        {/* State A — Saving */}
        {state === 'saving' && (
          <div className="text-center space-y-3">
            <Loader2 size={32} className="text-indigo-400 mx-auto animate-spin" />
            <p className="text-sm text-white/60">Saving...</p>
          </div>
        )}

        {/* State B — Saved */}
        {state === 'saved' && (
          <div className="text-center space-y-3">
            <CheckCircle size={40} className="text-emerald-400 mx-auto" />
            {displayTitle && (
              <p
                className="text-sm font-medium text-white/80 truncate px-2"
                title={displayTitle}
              >
                {displayTitle}
              </p>
            )}
            <p className="text-xs text-white/40">Saved to inbox</p>

            {!canClose && (
              <p className="text-xs text-white/30 pt-1">You can close this tab</p>
            )}

            <a
              href="/inbox"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { try { window.close() } catch { /* ignore */ } }}
              className="inline-flex items-center gap-1.5 mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View Inbox
              <ExternalLink size={11} />
            </a>
          </div>
        )}

        {/* State C — Manual entry */}
        {state === 'manual' && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-sm font-medium text-white/70">Save to inbox</p>
              <p className="text-xs text-white/30 mt-0.5">Add any article manually</p>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-xs text-white/40 mb-1.5" htmlFor="add-url">
                  URL
                </label>
                <input
                  id="add-url"
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl bg-white/[0.06] border border-white/[0.10] px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5" htmlFor="add-title">
                  Title
                </label>
                <input
                  id="add-title"
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Article title..."
                  className="w-full rounded-xl bg-white/[0.06] border border-white/[0.10] px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleManualSave() }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualSave}
              disabled={!manualUrl.trim() || !manualTitle.trim() || manualSaving}
              className="w-full py-2.5 rounded-xl text-sm font-medium bg-indigo-500 hover:bg-indigo-400 disabled:bg-white/[0.06] disabled:text-white/20 text-white transition-all duration-200"
            >
              Save to inbox
            </button>
          </div>
        )}

        {/* State D — Error */}
        {state === 'error' && (
          <div className="text-center space-y-3">
            <AlertCircle size={36} className="text-red-400 mx-auto" />
            <p className="text-sm font-medium text-white/70">Something went wrong</p>
            {errorMessage && (
              <p className="text-xs text-white/30 break-words">{errorMessage}</p>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white/[0.06] hover:bg-white/[0.10] text-white/60 hover:text-white/80 border border-white/[0.08] transition-all"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AddPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#060912]">
          <Loader2 size={24} className="text-indigo-400 animate-spin" />
        </div>
      }
    >
      <AddPageInner />
    </Suspense>
  )
}
