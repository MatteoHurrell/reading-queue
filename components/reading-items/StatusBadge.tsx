'use client'

import { STATUS_LABELS } from '@/lib/constants'
import type { ReadingStatus } from '@/lib/types'

interface Props {
  status: ReadingStatus
}

const STATUS_CLASSES: Record<ReadingStatus, string> = {
  inbox: 'bg-amber-50 text-amber-700 border border-amber-200',
  queued: 'bg-blue-50 text-blue-700 border border-blue-200',
  reading: 'bg-sky-50 text-sky-700 border border-sky-200',
  finished: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  archived: 'bg-gray-50 text-gray-500 border border-gray-200',
  dropped: 'bg-red-50 text-red-600 border border-red-200',
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
