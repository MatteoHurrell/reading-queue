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
import type { ReadingItem } from '@/lib/types'

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
  notes: string
}

function itemToForm(item: ReadingItem): FormState {
  return {
    url: item.url,
    title: item.title,
    publisher: item.publisher,
    author: item.author ?? '',
    notes: item.notes ?? '',
  }
}

const inputClass =
  'bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:border-stone-500 focus:ring-2 focus:ring-stone-500/10 h-9 px-3'

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

    const changes: Partial<ReadingItem> = {
      url: form.url.trim(),
      title: form.title.trim(),
      publisher: form.publisher.trim() || 'Other',
      author: form.author.trim() || undefined,
      notes: form.notes.trim() || undefined,
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
        className="sm:max-w-md bg-card border border-border rounded-2xl shadow-xl"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">Edit bookmark</DialogTitle>
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
          </div>

          <div className="flex flex-col gap-1">
            <Input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              className={`${inputClass} ${errors.title ? 'border-red-400' : ''}`}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          <Input
            type="text"
            placeholder="Publisher"
            value={form.publisher}
            onChange={(e) => setField('publisher', e.target.value)}
            className={inputClass}
          />

          <Input
            type="text"
            placeholder="Author (optional)"
            value={form.author}
            onChange={(e) => setField('author', e.target.value)}
            className={inputClass}
          />

          <Textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            className="bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:border-stone-500 focus:ring-2 focus:ring-stone-500/10 min-h-[60px] resize-none px-3 py-2"
          />
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
            onClick={handleSave}
            className="bg-primary text-primary-foreground font-medium rounded-xl border-0 shadow-sm hover:bg-primary/90 transition-colors"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
