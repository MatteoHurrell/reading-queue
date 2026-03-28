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
  'bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white placeholder:text-white/25 focus:border-indigo-500/50 focus:ring-0 h-9 px-3'

const labelClass = 'text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5'

export default function QuickAddModal({ open, onClose, onAdd, existingItems = [] }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<{ url?: string; title?: string }>({})

  const duplicateItem = form.url.trim()
    ? existingItems.find(
        (item) => item.url.trim().toLowerCase() === form.url.trim().toLowerCase()
      )
    : undefined

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM)
      setErrors({})
    }
  }, [open])

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
    })
    onClose()
  }, [form, onAdd, onClose])

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent
        className="sm:max-w-lg bg-[#0d1120] border border-white/[0.1] rounded-2xl shadow-2xl"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">Add to Reading Queue</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {/* URL */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>
              URL <span className="text-indigo-400">*</span>
            </label>
            <Input
              type="url"
              placeholder="https://..."
              value={form.url}
              onChange={(e) => setField('url', e.target.value)}
              className={`${inputClass} ${errors.url ? 'border-red-500/60' : ''}`}
            />
            {errors.url && <p className="text-xs text-red-400">{errors.url}</p>}
            {!errors.url && duplicateItem && (
              <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-2.5 py-1.5">
                This URL is already in your queue &mdash;{' '}
                <span className="font-medium">{duplicateItem.title}</span>
              </p>
            )}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>
              Title <span className="text-indigo-400">*</span>
            </label>
            <Input
              type="text"
              placeholder="Article title"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              className={`${inputClass} ${errors.title ? 'border-red-500/60' : ''}`}
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
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
                <SelectTrigger className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white h-9">
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
                <SelectTrigger className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white h-9">
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
                <SelectTrigger className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white h-9">
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
              className="bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white placeholder:text-white/25 focus:border-indigo-500/50 focus:ring-0 min-h-[70px] resize-none px-3 py-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white/[0.05] border border-white/[0.1] text-white/60 hover:text-white rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl border-0"
            style={{ boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
          >
            Add to queue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
