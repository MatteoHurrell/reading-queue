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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PUBLISHERS,
  TOPICS,
  TOPIC_LABELS,
  SOURCE_TYPES,
  SOURCE_TYPE_LABELS,
  PRIORITY_LABELS,
} from '@/lib/constants'
import type { ReadingItem, Topic, SourceType, Priority } from '@/lib/types'
import { isLikelySocialThreadUrl } from '@/lib/link-preview'
import type { LinkPreviewResult } from '@/lib/link-preview'

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (data: Omit<ReadingItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  existingItems?: ReadingItem[]
}

interface FormState {
  url: string
  title: string
  publisher: string
  topic: Topic
  sourceType: SourceType
  priority: Priority
  estimatedMinutes: string
  whySaved: string
}

const EMPTY_FORM: FormState = {
  url: '',
  title: '',
  publisher: '',
  topic: 'other',
  sourceType: 'other',
  priority: 'medium',
  estimatedMinutes: '',
  whySaved: '',
}

const inputClass =
  'bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:border-gray-400 focus:ring-0 h-9 px-3'

const labelClass = 'text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5'

export default function QuickAddModal({ open, onClose, onAdd, existingItems = [] }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<{ url?: string; title?: string }>({})
  const [previewMeta, setPreviewMeta] = useState<{
    imageUrl?: string
    description?: string
  }>({})
  const [previewLoading, setPreviewLoading] = useState(false)
  const previewAbortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const duplicateItem = form.url.trim()
    ? existingItems.find(
        (item) => item.url.trim().toLowerCase() === form.url.trim().toLowerCase()
      )
    : undefined

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM)
      setErrors({})
      setPreviewMeta({})
      setPreviewLoading(false)
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
            imageUrl: data.imageUrl,
            description: data.description,
          })
          setForm((prev) => {
            const next = { ...prev }
            if (!prev.title.trim() && data.title?.trim()) next.title = data.title.trim()
            if (!prev.publisher.trim()) {
              if (data.siteName?.trim()) next.publisher = data.siteName.trim()
              else if (isLikelySocialThreadUrl(url)) next.publisher = 'X'
            }
            if (isLikelySocialThreadUrl(url) && prev.sourceType === 'other') {
              next.sourceType = 'thread'
            }
            return next
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
    if (key === 'url' || key === 'title') {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  const handleSubmit = useCallback(() => {
    const newErrors: { url?: string; title?: string } = {}
    if (!form.url.trim()) newErrors.url = 'URL is required'
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onAdd({
      url: form.url.trim(),
      title: form.title.trim(),
      publisher: form.publisher.trim() || 'Other',
      topic: form.topic,
      sourceType: form.sourceType,
      priority: form.priority,
      estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
      whySaved: form.whySaved.trim() || undefined,
      status: 'inbox',
      isFavorite: false,
      tags: [],
      previewImageUrl: previewMeta.imageUrl,
      previewDescription: previewMeta.description,
    })
    onClose()
  }, [form, onAdd, onClose, previewMeta])

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent
        className="sm:max-w-lg bg-white border border-gray-200 rounded-2xl shadow-lg"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 font-serif">Add to Reading Queue</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {/* URL */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>
              URL <span className="text-blue-600">*</span>
            </label>
            <Input
              type="url"
              placeholder="https://..."
              value={form.url}
              onChange={(e) => setField('url', e.target.value)}
              className={`${inputClass} ${errors.url ? 'border-red-400' : ''}`}
            />
            {errors.url && <p className="text-xs text-red-500">{errors.url}</p>}
            {previewLoading && form.url.trim() && (
              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1.5">
                <Loader2 className="size-3.5 animate-spin shrink-0" aria-hidden />
                Pulling title, image, and excerpt…
              </p>
            )}
            {!previewLoading && previewMeta.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mt-1.5 leading-relaxed">
                {previewMeta.description}
              </p>
            )}
            {!previewLoading && previewMeta.imageUrl && (
              <img
                src={previewMeta.imageUrl}
                alt=""
                className="mt-2 w-full max-h-28 rounded-xl object-cover border border-gray-200"
              />
            )}
            {!errors.url && duplicateItem && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5">
                This URL is already in your queue &mdash;{' '}
                <span className="font-medium">{duplicateItem.title}</span>
              </p>
            )}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>
              Title <span className="text-blue-600">*</span>
            </label>
            <Input
              type="text"
              placeholder="Article title"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              className={`${inputClass} ${errors.title ? 'border-red-400' : ''}`}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Publisher */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Publisher</label>
            <Input
              type="text"
              placeholder="Publisher name"
              list="publishers-list"
              value={form.publisher}
              onChange={(e) => setField('publisher', e.target.value)}
              className={inputClass}
            />
            <datalist id="publishers-list">
              {PUBLISHERS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          {/* Topic + Source Type row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Topic</label>
              <Select
                value={form.topic}
                onValueChange={(val) => setField('topic', val as Topic)}
              >
                <SelectTrigger className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 h-9">
                  <SelectValue />
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

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Source type</label>
              <Select
                value={form.sourceType}
                onValueChange={(val) => setField('sourceType', val as SourceType)}
              >
                <SelectTrigger className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SOURCE_TYPE_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority + Est. time row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Priority</label>
              <Select
                value={form.priority}
                onValueChange={(val) => setField('priority', val as Priority)}
              >
                <SelectTrigger className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>
                Est. read time (min)
              </label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 10"
                value={form.estimatedMinutes}
                onChange={(e) => setField('estimatedMinutes', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Why saved */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Why saved</label>
            <Textarea
              placeholder="Why is this worth reading?"
              value={form.whySaved}
              onChange={(e) => setField('whySaved', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:border-gray-400 focus:ring-0 min-h-[70px] resize-none px-3 py-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl border-0"
          >
            Add to queue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
