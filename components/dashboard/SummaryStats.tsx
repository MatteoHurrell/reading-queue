'use client'

import { Inbox, BookOpen, BookOpenCheck, CheckCircle } from 'lucide-react'
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
  subtext: string
  valueClass: string
  icon: React.ReactNode
}

function StatCard({ value, label, subtext, valueClass, icon }: StatCardProps) {
  return (
    <div className="flex-1 bg-white/[0.03] backdrop-blur-md border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-200 min-w-0">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
          {label}
        </span>
        <span className="flex-shrink-0">{icon}</span>
      </div>
      <div className={`text-4xl font-bold tracking-tight mt-2 mb-0.5 ${valueClass}`}>
        {value}
      </div>
      <div className="text-xs text-white/25">{subtext}</div>
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
        subtext="awaiting triage"
        valueClass="text-amber-400"
        icon={<Inbox className="size-4 text-amber-500/40" />}
      />
      <StatCard
        value={queuedCount}
        label="Queue"
        subtext="ready to read"
        valueClass="text-indigo-400"
        icon={<BookOpen className="size-4 text-indigo-500/40" />}
      />
      <StatCard
        value={readingCount}
        label="Reading"
        subtext="in progress"
        valueClass="text-blue-400"
        icon={<BookOpenCheck className="size-4 text-blue-500/40" />}
      />
      <StatCard
        value={finishedCount}
        label="Finished"
        subtext="all time"
        valueClass="text-emerald-400"
        icon={<CheckCircle className="size-4 text-emerald-500/40" />}
      />
    </div>
  )
}
