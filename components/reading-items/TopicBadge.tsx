'use client'

import { TOPIC_LABELS } from '@/lib/constants'
import type { Topic } from '@/lib/types'

interface Props {
  topic: Topic
}

const TOPIC_CLASSES: Record<Topic, string> = {
  markets: 'bg-amber-100/90 text-amber-950 border border-amber-200/80',
  'finance-business': 'bg-stone-200/80 text-stone-800 border border-stone-300/70',
  'tech-product': 'bg-yellow-100/90 text-yellow-950 border border-yellow-200/80',
  'politics-policy': 'bg-orange-100/90 text-orange-950 border border-orange-200/80',
  economics: 'bg-stone-100 text-stone-800 border border-stone-200',
  'essays-opinion': 'bg-rose-100/80 text-rose-900 border border-rose-200/70',
  'career-learning': 'bg-lime-100/70 text-lime-950 border border-lime-200/80',
  other: 'bg-muted text-muted-foreground border border-border',
}

export default function TopicBadge({ topic }: Props) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${TOPIC_CLASSES[topic]}`}>
      {TOPIC_LABELS[topic]}
    </span>
  )
}
