'use client'

import type { ReadingItem } from '@/lib/types'
import {
  getInboxItems,
  getQueuedItems,
  getCurrentlyReading,
  getFinishedItems,
} from '@/lib/selectors'

interface Props {
  items: ReadingItem[]
}

interface StatCardProps {
  value: number
  label: string
  accentClass: string
  borderClass: string
}

function StatCard({ value, label, accentClass, borderClass }: StatCardProps) {
  return (
    <div
      className={`flex-1 bg-[#141414] border border-white/[0.08] rounded-xl p-5 flex flex-col gap-1 border-t-2 ${borderClass}`}
    >
      <span className={`text-4xl font-bold tabular-nums ${accentClass}`}>{value}</span>
      <span className="text-xs text-white/40 uppercase tracking-wider mt-1">{label}</span>
    </div>
  )
}

export default function SummaryStats({ items }: Props) {
  const inboxCount = getInboxItems(items).length
  const queuedCount = getQueuedItems(items).length
  const readingCount = getCurrentlyReading(items).length
  const finishedCount = getFinishedItems(items).length

  return (
    <div className="flex gap-4">
      <StatCard
        value={inboxCount}
        label="Inbox"
        accentClass="text-amber-400"
        borderClass="border-t-amber-500/60"
      />
      <StatCard
        value={queuedCount}
        label="Queue"
        accentClass="text-blue-400"
        borderClass="border-t-blue-500/60"
      />
      <StatCard
        value={readingCount}
        label="Reading"
        accentClass="text-blue-300"
        borderClass="border-t-blue-400/60"
      />
      <StatCard
        value={finishedCount}
        label="Finished"
        accentClass="text-green-400"
        borderClass="border-t-green-500/60"
      />
    </div>
  )
}
