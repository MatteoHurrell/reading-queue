'use client'

import { useEffect, useState, useRef, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useReadingItems } from '@/hooks/use-reading-items'
import {
  deriveTitleFromUrl,
  derivePublisherFromUrl,
  isLikelySocialThreadUrl,
  type LinkPreviewResult,
} from '@/lib/link-preview'
import { BookMarked, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react'

type PageState = 'saving' | 'saved' | 'manual' | 'error'

/** macOS shows this in Notification Center when the browser allows notifications for this origin. */
async function notifyReadingQueueSaved(title: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return

  const clipped = title.length > 90 ? `${title.slice(0, 87)}…` : title
  const body = `Added to your queue: ${clipped}`

  const fire = () => {
    try {
      new Notification('Reading Queue', { body })
    } catch {
      /* ignore — e.g. unsupported */
    }
  }

  if (Notification.permission === 'granted') {
    fire()
    return
  }
  if (Notification.permission === 'default') {
    const p = await Notification.requestPermission()
    if (p === 'granted') fire()
  }
}

function LogoMark() {
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 mx-auto bg-primary shadow-[0_0_0_1px_rgba(217,119,87,0.25)]">
      <BookMarked size={18} className="text-primary-foreground" />
    </div>
  )
}

function AddPageInner() {
  const searchParams = useSearchParams()
  const { addItem } = useReadingItems()

  const urlParam = searchParams.get('url') ?? ''
  const titleParam = searchParams.get('title') ?? ''
  const hasUrl = urlParam.length > 0

  const [state, setState] = useState<PageState>(hasUrl ? 'saving' : 'manual')
  const [errorMessage, setErrorMessage] = useState('')
  const [canClose, setCanClose] = useState(true)
  const [manualUrl, setManualUrl] = useState('')
  const [manualSaving, setManualSaving] = useState(false)
  const [savedTitle, setSavedTitle] = useState('')
  const hasSaved = useRef(false)

  const persistFromUrl = useCallback(
    async (url: string, pageTitleHint?: string) => {
      let title = pageTitleHint?.trim() ?? ''
      let publisher = ''
      let previewImageUrl: string | undefined
      let previewDescription: string | undefined

      if (!title) {
        try {
          const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
          const data = (await res.json()) as LinkPreviewResult
          title = data.title?.trim() || deriveTitleFromUrl(url)
          publisher =
            data.siteName?.trim() ||
            (isLikelySocialThreadUrl(url) ? 'X' : derivePublisherFromUrl(url))
          previewImageUrl = data.imageUrl
          previewDescription = data.description
        } catch {
          title = deriveTitleFromUrl(url)
          publisher = isLikelySocialThreadUrl(url) ? 'X' : derivePublisherFromUrl(url)
        }
      } else {
        publisher = isLikelySocialThreadUrl(url) ? 'X' : derivePublisherFromUrl(url)
      }

      addItem({
        title,
        url,
        publisher: publisher || 'Other',
        sourceType: 'other',
        topic: 'other',
        tags: [],
        priority: 'medium',
        status: 'inbox',
        isFavorite: false,
        previewImageUrl,
        previewDescription,
      })
      setSavedTitle(title)
      await notifyReadingQueueSaved(title)
    },
    [addItem]
  )

  useEffect(() => {
    if (!hasUrl || hasSaved.current) return
    hasSaved.current = true

    void (async () => {
      try {
        await persistFromUrl(urlParam, titleParam || undefined)
        setState('saved')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong.'
        setErrorMessage(msg)
        setState('error')
      }
    })()
  }, [hasUrl, urlParam, titleParam, persistFromUrl])

  useEffect(() => {
    if (state !== 'saved') return
    const timer = setTimeout(() => {
      try {
        window.close()
        setTimeout(() => setCanClose(false), 300)
      } catch {
        setCanClose(false)
      }
    }, 1800)
    return () => clearTimeout(timer)
  }, [state])

  async function handleManualSave() {
    const href = manualUrl.trim()
    if (!href) return
    setManualSaving(true)
    try {
      await persistFromUrl(href)
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
    setState(hasUrl ? 'saving' : 'manual')
    setErrorMessage('')
    setManualSaving(false)
    if (hasUrl) {
      hasSaved.current = true
      void (async () => {
        try {
          await persistFromUrl(urlParam, titleParam || undefined)
          setState('saved')
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Something went wrong.'
          setErrorMessage(msg)
          setState('error')
        }
      })()
    }
  }

  const displayTitle = savedTitle || titleParam || manualUrl

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-6">
      <div className="w-full max-w-sm mx-auto bg-card border border-border rounded-2xl p-6 shadow-sm">
        <LogoMark />

        {state === 'saving' && (
          <div className="text-center space-y-3">
            <Loader2 size={32} className="text-muted-foreground mx-auto animate-spin" />
            <p className="text-sm text-muted-foreground">Fetching title and saving…</p>
          </div>
        )}

        {state === 'saved' && (
          <div className="text-center space-y-3">
            <CheckCircle size={40} className="text-lime-700 mx-auto" />
            {displayTitle && (
              <p
                className="text-sm font-medium text-foreground truncate px-2"
                title={displayTitle}
              >
                {savedTitle || displayTitle}
              </p>
            )}
            <p className="text-xs text-muted-foreground">Saved to your bookmarks</p>

            {!canClose && (
              <p className="text-xs text-muted-foreground/80 pt-1">You can close this tab</p>
            )}

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                try {
                  window.close()
                } catch {
                  /* ignore */
                }
              }}
              className="inline-flex items-center gap-1.5 mt-2 text-xs text-primary hover:text-primary/85 underline-offset-2 hover:underline transition-colors"
            >
              Open bookmarks
              <ExternalLink size={11} />
            </a>
          </div>
        )}

        {state === 'manual' && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-sm font-medium text-foreground">Add bookmark</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Paste a link — the title is read from the page. Use this if the shortcut is
                unavailable.
              </p>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5" htmlFor="add-url">
                URL
              </label>
              <input
                id="add-url"
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500/20 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleManualSave()
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => void handleManualSave()}
              disabled={!manualUrl.trim() || manualSaving}
              className="w-full py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors duration-200"
            >
              {manualSaving ? 'Saving…' : 'Save bookmark'}
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center space-y-3">
            <AlertCircle size={36} className="text-red-400 mx-auto" />
            <p className="text-sm font-medium text-foreground">Something went wrong</p>
            {errorMessage && (
              <p className="text-xs text-muted-foreground break-words">{errorMessage}</p>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors"
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
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 size={24} className="text-muted-foreground animate-spin" />
        </div>
      }
    >
      <AddPageInner />
    </Suspense>
  )
}