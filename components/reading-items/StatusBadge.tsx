'use client'

import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS } from '@/lib/constants'
import type { ReadingStatus } from '@/lib/types'

interface Props {
  status: ReadingStatus
}

const STATUS_CLASSES: Record<ReadingStatus, string> = {
  inbox: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  queued: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  reading: 'bg-blue-600/30 text-blue-300 border-blue-500/40',
  finished: 'bg-green-500/20 text-green-400 border-green-500/30',
  archived: 'bg-white/10 text-white/50 border-white/20',
  dropped: 'bg-red-500/15 text-red-400/70 border-red-500/20',
}

export default function StatusBadge({ status }: Props) {
  return (
    <Badge variant="outline" className={STATUS_CLASSES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
