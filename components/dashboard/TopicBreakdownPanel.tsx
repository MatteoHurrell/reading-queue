'use client'

import { TOPICS, TOPIC_LABELS } from '@/lib/constants'
import { groupItemsByTopic } from '@/lib/selectors'
import type { ReadingItem } from '@/lib/types'

interface Props {
  items: ReadingItem[]
}

const TOPIC_PILL_COLORS: Record<string, string> = {
  'markets': 'bg-green-500/10 text-green-400 border-green-500/20 hover:border-green-500/35',
  'finance-business': 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-500/35',
  'tech-product': 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500/35',
  'politics-policy': 'bg-red-500/10 text-red-400 border-red-500/20 hover:border-red-500/35',
  'economics': 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:border-amber-500/35',
  'essays-opinion': 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:border-orange-500/35',
  'career-learning': 'bg-teal-500/10 text-teal-400 border-teal-500/20 hover:border-teal-500/35',
  'other': 'bg-white/[0.05] text-white/40 border-white/[0.10] hover:border-white/20',
}

export default function TopicBreakdownPanel({ items }: Props) {
  const grouped = groupItemsByTopic(items)

  const topicsWithItems = TOPICS.filter((t) => grouped[t].length > 0)

  return (
    <section className="bg-white/[0.03] backdrop-blur-md border border-white/[0.07] rounded-2xl p-5">
      <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 ${colorClass}`}
              >
                {TOPIC_LABELS[topic]}
                <span className="font-normal opacity-60 tabular-nums">{count}</span>
              </span>
            )
          })}
        </div>
      )}
    </section>
  )
}
