'use client'

import { Badge } from '@/components/ui/badge'
import { PRIORITY_LABELS } from '@/lib/constants'
import type { Priority } from '@/lib/types'

interface Props {
  priority: Priority
}

const PRIORITY_CLASSES: Record<Priority, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-white/10 text-white/40 border-white/20',
}

export default function PriorityBadge({ priority }: Props) {
  return (
    <Badge variant="outline" className={PRIORITY_CLASSES[priority]}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}
