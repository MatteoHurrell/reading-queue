'use client'

import { STATUS_LABELS } from '@/lib/constants'
import type { ReadingStatus } from '@/lib/types'

interface Props {
  status: ReadingStatus
}

const STATUS_CLASSES: Record<ReadingStatus, string> = {
  inbox: 'bg-amber-500/10 text-amber-300 border border-amber-500/20 ring-0',
  queued: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
  reading: 'bg-blue-500/15 text-blue-300 border border-blue-400/25',
  finished: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  archived: 'bg-white/[0.05] text-white/35 border border-white/10',
  dropped: 'bg-red-500/10 text-red-400/70 border border-red-500/15',
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
