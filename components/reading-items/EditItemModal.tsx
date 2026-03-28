'use client'

import { useState, useEffect, useCallback } from 'react'
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

interface Props {
  item: ReadingItem | null
  open: boolean
  onClose: () => void
  onSave: (id: string, changes: Partial<ReadingItem>) => void
}

interface FormState {
  url: string
  title: string
  publisher: string
  author: string
  topic: Topic
  sourceType: SourceType
  priority: Priority
  estimatedMinutes: string
  whySaved: string
  notes: string
  tags: string
  isFavorite: boolean
}

function itemToForm(item: ReadingItem): FormState {
  return {
    url: item.url,
    title: item.title,
    publisher: item.publisher,
    author: item.author ?? '',
    topic: item.topic,
    sourceType: item.sourceType,
    priority: item.priority,
    estimatedMinutes: item.estimatedMinutes !== undefined ? String(item.estimatedMinutes) : '',
    whySaved: item.whySaved ?? '',
    notes: item.notes ?? '',
    tags: item.tags.join(', '),
    isFavorite: item.isFavorite,
  }
}

const inputClass =
  'bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:border-gray-400 focus:ring-0 h-9 px-3'

const labelClass = 'text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5'

export default function EditItemModal({ item, open, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState | null>(null)
  const [errors, setErrors] = useState<{ url?: string; title?: string }>({})

  useEffect(() => {
    if (open && item) {
      setForm(itemToForm(item))
      setErrors({})
    }
  }, [open, item])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
    if (key === 'url' || key === 'title') {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  const handleSave = useCallback(() => {
    if (!item || !form) return

    const newErrors: { url?: string; title?: string } = {}
    if (!form.url.trim()) newErrors.url = 'URL is required'
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const changes: Partial<ReadingItem> = {
      url: form.url.trim(),
      title: form.title.trim(),
      publisher: form.publisher.trim() || 'Other',
      author: form.author.trim() || undefined,
      topic: form.topic,
      sourceType: form.sourceType,
      priority: form.priority,
      estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
      whySaved: form.whySaved.trim() || undefined,
      notes: form.notes.trim() || undefined,
      tags,
      isFavorite: form.isFavorite,
    }

    onSave(item.id, changes)
    onClose()
  }, [item, form, onSave, onClose])

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  if (!form) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent
        className="sm:max-w-lg bg-white border border-gray-200 rounded-2xl shadow-lg"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 font-serif">Edit item</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1 max-h-[70vh] overflow-y-auto pr-1">
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
              list="edit-publishers-list"
              value={form.publisher}
              onChange={(e) => setField('publisher', e.target.value)}
              className={inputClass}
            />
            <datalist id="edit-publishers-list">
              {PUBLISHERS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          {/* Author */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Author</label>
            <Input
              type="text"
              placeholder="Author name"
              value={form.author}
              onChange={(e) => setField('author', e.target.value)}
              className={inputClass}
            />
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

          {/* Tags */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>
              Tags{' '}
              <span className="text-gray-400 font-normal normal-case tracking-normal">(comma-separated)</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. macro, equities, must-read"
              value={form.tags}
              onChange={(e) => setField('tags', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Why saved */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Why saved</label>
            <Textarea
              placeholder="Why is this worth reading?"
              value={form.whySaved}
              onChange={(e) => setField('whySaved', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:border-gray-400 focus:ring-0 min-h-[60px] resize-none px-3 py-2"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Notes</label>
            <Textarea
              placeholder="Your notes after reading..."
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:border-gray-400 focus:ring-0 min-h-[70px] resize-none px-3 py-2"
            />
          </div>

          {/* Favorite */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isFavorite}
              onChange={(e) => setField('isFavorite', e.target.checked)}
              className="size-4 rounded accent-amber-500"
            />
            <span className="text-sm text-gray-600">Mark as favorite</span>
          </label>
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
            onClick={handleSave}
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl border-0"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
