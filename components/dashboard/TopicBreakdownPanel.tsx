'use client'

import { TOPICS, TOPIC_LABELS } from '@/lib/constants'
import { groupItemsByTopic } from '@/lib/selectors'
import type { ReadingItem } from '@/lib/types'

interface Props {
  items: ReadingItem[]
}

const TOPIC_PILL_COLORS: Record<string, string> = {
  'markets': 'bg-green-500/15 text-green-400 border-green-500/25',
  'finance-business': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'tech-product': 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  'politics-policy': 'bg-red-500/15 text-red-400/80 border-red-500/25',
  'economics': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'essays-opinion': 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  'career-learning': 'bg-teal-500/15 text-teal-400 border-teal-500/25',
  'other': 'bg-white/10 text-white/40 border-white/20',
}

export default function TopicBreakdownPanel({ items }: Props) {
  const grouped = groupItemsByTopic(items)

  const topicsWithItems = TOPICS.filter((t) => grouped[t].length > 0)

  return (
    <section className="bg-[#141414] border border-white/[0.08] rounded-xl p-5">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
        Topic Snapshot
      </h2>

      {topicsWithItems.length === 0 ? (
        <p className="text-sm text-white/40">No queued items yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {topicsWithItems.map((topic) => {
            const count = grouped[topic].length
            const colorClass = TOPIC_PILL_COLORS[topic] ?? TOPIC_PILL_COLORS['other']
            return (
              <span
                key={topic}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${colorClass}`}
              >
                {TOPIC_LABELS[topic]}
                <span className="opacity-70 tabular-nums">{count}</span>
              </span>
            )
          })}
        </div>
      )}
    </section>
  )
}
