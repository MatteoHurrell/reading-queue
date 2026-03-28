'use client'

import { STATUS_LABELS } from '@/lib/constants'
import type { ReadingStatus } from '@/lib/types'

interface Props {
  status: ReadingStatus
}

const STATUS_CLASSES: Record<ReadingStatus, string> = {
  inbox: 'bg-amber-100 text-amber-700 border border-amber-200',
  queued: 'bg-stone-200/80 text-stone-800 border border-stone-300/70',
  reading: 'bg-orange-50 text-orange-950 border border-orange-200/80',
  finished: 'bg-lime-100/90 text-lime-950 border border-lime-200/80',
  archived: 'bg-muted text-muted-foreground border border-border',
  dropped: 'bg-red-100 text-red-600 border border-red-200',
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
