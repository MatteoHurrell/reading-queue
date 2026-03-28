'use client'

import { TOPIC_LABELS } from '@/lib/constants'
import type { Topic } from '@/lib/types'

interface Props {
  topic: Topic
}

const TOPIC_CLASSES: Record<Topic, string> = {
  markets: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
  'finance-business': 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  'tech-product': 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
  'politics-policy': 'bg-orange-500/10 text-orange-300 border border-orange-500/20',
  economics: 'bg-violet-500/10 text-violet-300 border border-violet-500/20',
  'essays-opinion': 'bg-pink-500/10 text-pink-300 border border-pink-500/20',
  'career-learning': 'bg-green-500/10 text-green-300 border border-green-500/20',
  other: 'bg-white/[0.05] text-white/35 border border-white/10',
}

export default function TopicBadge({ topic }: Props) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${TOPIC_CLASSES[topic]}`}>
      {TOPIC_LABELS[topic]}
    </span>
  )
}
