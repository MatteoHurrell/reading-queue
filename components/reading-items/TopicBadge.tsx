'use client'

import { TOPIC_LABELS } from '@/lib/constants'
import type { Topic } from '@/lib/types'

interface Props {
  topic: Topic
}

const TOPIC_CLASSES: Record<Topic, string> = {
  markets: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'finance-business': 'bg-blue-50 text-blue-700 border border-blue-200',
  'tech-product': 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  'politics-policy': 'bg-orange-50 text-orange-700 border border-orange-200',
  economics: 'bg-violet-50 text-violet-700 border border-violet-200',
  'essays-opinion': 'bg-pink-50 text-pink-700 border border-pink-200',
  'career-learning': 'bg-green-50 text-green-700 border border-green-200',
  other: 'bg-gray-50 text-gray-500 border border-gray-200',
}

export default function TopicBadge({ topic }: Props) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${TOPIC_CLASSES[topic]}`}>
      {TOPIC_LABELS[topic]}
    </span>
  )
}
