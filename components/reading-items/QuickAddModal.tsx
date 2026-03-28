'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ReadingItem } from '@/lib/types'
import {
  isLikelySocialThreadUrl,
  deriveTitleFromUrl,
  derivePublisherFromUrl,
} from '@/lib/link-preview'
import type { LinkPreviewResult } from '@/lib/link-preview'

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (data: Omit<ReadingItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  existingItems?: ReadingItem[]
}

interface FormState {
  url: string
}

const inputClass =
  'bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:border-stone-500 focus:ring-2 focus:ring-stone-500/10 h-9 px-3'

export default function QuickAddModal({ open, onClose, onAdd, existingItems = [] }: Props) {
  const [form, setForm] = useState<FormState>({ url: '' })
  const [errors, setErrors] = useState<{ url?: string }>({})
  const [previewMeta, setPreviewMeta] = useState<{
    title?: string
    imageUrl?: string
    description?: string
    siteName?: string
  }>({})
  const [previewLoading, setPreviewLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const previewAbortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const duplicateItem = form.url.trim()
    ? existingItems.find(
        (item) => item.url.trim().toLowerCase() === form.url.trim().toLowerCase()
      )
    : undefined

  useEffect(() => {
    if (open) {
      setForm({ url: '' })
      setErrors({})
      setPreviewMeta({})
      setPreviewLoading(false)
      setSaveLoading(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      previewAbortRef.current?.abort()
      if (debounceRef.current) clearTimeout(debounceRef.current)
      return
    }
    const url = form.url.trim()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!url || !/^https?:\/\//i.test(url)) {
      setPreviewMeta({})
      setPreviewLoading(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      previewAbortRef.current?.abort()
      const ac = new AbortController()
      previewAbortRef.current = ac
      setPreviewLoading(true)

      fetch(`/api/link-preview?url=${encodeURIComponent(url)}`, { signal: ac.signal })
        .then((res) => res.json() as Promise<LinkPreviewResult>)
        .then((data) => {
          if (ac.signal.aborted) return
          setPreviewMeta({
            title: data.title?.trim() || undefined,
            imageUrl: data.imageUrl,
            description: data.description,
            siteName: data.siteName?.trim(),
          })
        })
        .catch(() => {
          if (ac.signal.aborted) return
          setPreviewMeta({})
        })
        .finally(() => {
          if (!ac.signal.aborted) setPreviewLoading(false)
        })
    }, 550)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      previewAbortRef.current?.abort()
    }
  }, [form.url, open])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'url') setErrors((prev) => ({ ...prev, url: undefined }))
  }

  const displayTitleHint =
    previewMeta.title ||
    (form.url.trim() && /^https?:\/\//i.test(form.url.trim())
      ? deriveTitleFromUrl(form.url.trim())
      : undefined)

  const handleSubmit = useCallback(async () => {
    const href = form.url.trim()
    const newErrors: { url?: string } = {}
    if (!href) newErrors.url = 'URL is required'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaveLoading(true)
    try {
      let title = previewMeta.title?.trim()
      let publisher =
        previewMeta.siteName?.trim() ||
        (isLikelySocialThreadUrl(href) ? 'X' : derivePublisherFromUrl(href))
      let imageUrl = previewMeta.imageUrl
      let description = previewMeta.description

      if (!title) {
        try {
          const res = await fetch(`/api/link-preview?url=${encodeURIComponent(href)}`)
          const data = (await res.json()) as LinkPreviewResult
          title = data.title?.trim()
          if (data.siteName?.trim()) publisher = data.siteName.trim()
          else if (isLikelySocialThreadUrl(href)) publisher = 'X'
          imageUrl = data.imageUrl ?? imageUrl
          description = data.description ?? description
        } catch {
          /* use fallbacks below */
        }
      }

      const resolvedTitle = title?.trim() || deriveTitleFromUrl(href)

      onAdd({
        url: href,
        title: resolvedTitle,
        publisher: publisher.trim() || 'Other',
        topic: 'other',
        sourceType: 'other',
        priority: 'medium',
        status: 'inbox',
        isFavorite: false,
        tags: [],
        previewImageUrl: imageUrl,
        previewDescription: description,
      })
      onClose()
    } finally {
      setSaveLoading(false)
    }
  }, [form.url, onAdd, onClose, previewMeta])

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      void handleSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent
        className="sm:max-w-md bg-card border border-border rounded-2xl shadow-xl"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Save bookmark
          </DialogTitle>
          <p className="text-xs text-muted-foreground font-normal leading-snug pr-6">
            Paste the link — we pull the title from the page automatically.
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-1">
            <Input
              type="url"
              placeholder="URL"
              value={form.url}
              onChange={(e) => setField('url', e.target.value)}
              className={`${inputClass} ${errors.url ? 'border-red-400' : ''}`}
            />
            {errors.url && <p className="text-xs text-red-500">{errors.url}</p>}
            {previewLoading && form.url.trim() && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <Loader2 className="size-3 animate-spin shrink-0" aria-hidden />
                Fetching preview...
              </p>
            )}
            {!previewLoading && displayTitleHint && (
              <p className="text-xs text-foreground/80 mt-1 line-clamp-2" title={displayTitleHint}>
                <span className="text-muted-foreground">Title · </span>
                {displayTitleHint}
                {!previewMeta.title && (
                  <span className="text-muted-foreground"> — from link</span>
                )}
              </p>
            )}
            {!previewLoading && previewMeta.imageUrl && (
              <img
                src={previewMeta.imageUrl}
                alt=""
                className="mt-1.5 w-full max-h-24 rounded-xl object-cover border border-border"
              />
            )}
            {!errors.url && duplicateItem && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5">
                Already saved: {duplicateItem.title}
              </p>
            )}
          </div>

        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-muted/50 border border-border text-muted-foreground hover:bg-muted rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={() => { void handleSubmit() }}
            disabled={saveLoading}
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-medium rounded-xl border-0 shadow-sm hover:bg-primary/90 transition-colors"
          >
            {saveLoading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" aria-hidden />
                Saving…
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
