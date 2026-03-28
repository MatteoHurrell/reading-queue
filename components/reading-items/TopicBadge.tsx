'use client'

import { Badge } from '@/components/ui/badge'
import { TOPIC_LABELS } from '@/lib/constants'
import type { Topic } from '@/lib/types'

interface Props {
  topic: Topic
}

export default function TopicBadge({ topic }: Props) {
  return (
    <Badge variant="outline" className="bg-white/[0.06] text-white/50 border-white/[0.12]">
      {TOPIC_LABELS[topic]}
    </Badge>
  )
}
