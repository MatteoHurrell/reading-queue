'use client'

import { PRIORITY_LABELS } from '@/lib/constants'
import type { Priority } from '@/lib/types'

interface Props {
  priority: Priority
}

const PRIORITY_CLASSES: Record<Priority, string> = {
  high: 'bg-red-500/10 text-red-400 border border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  low: 'bg-white/[0.05] text-white/35 border border-white/10',
}

export default function PriorityBadge({ priority }: Props) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${PRIORITY_CLASSES[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
