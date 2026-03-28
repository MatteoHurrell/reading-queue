'use client'

import { TOPICS, TOPIC_LABELS } from '@/lib/constants'
import { groupItemsByTopic } from '@/lib/selectors'
import type { ReadingItem } from '@/lib/types'

interface Props {
  items: ReadingItem[]
}

const TOPIC_PILL_COLORS: Record<string, string> = {
  'markets': 'bg-green-50 text-green-700 border-green-200 hover:border-green-300',
  'finance-business': 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300',
  'tech-product': 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300',
  'politics-policy': 'bg-red-50 text-red-700 border-red-200 hover:border-red-300',
  'economics': 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300',
  'essays-opinion': 'bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-300',
  'career-learning': 'bg-teal-50 text-teal-700 border-teal-200 hover:border-teal-300',
  'other': 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300',
}

export default function TopicBreakdownPanel({ items }: Props) {
  const grouped = groupItemsByTopic(items)

  const topicsWithItems = TOPICS.filter((t) => grouped[t].length > 0)

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Topic Snapshot
      </h2>

      {topicsWithItems.length === 0 ? (
        <p className="text-sm text-gray-400">No queued items yet.</p>
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
