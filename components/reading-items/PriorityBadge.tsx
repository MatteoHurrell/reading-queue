'use client'

import { PRIORITY_LABELS } from '@/lib/constants'
import type { Priority } from '@/lib/types'

interface Props {
  priority: Priority
}

const PRIORITY_CLASSES: Record<Priority, string> = {
  high: 'bg-red-100 text-red-600 border border-red-200',
  medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  low: 'bg-muted text-muted-foreground border border-border',
}

export default function PriorityBadge({ priority }: Props) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${PRIORITY_CLASSES[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
