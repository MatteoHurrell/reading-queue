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
    <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all duration-200 min-w-0">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <span className="flex-shrink-0">{icon}</span>
      </div>
      <div className={`text-4xl font-bold tracking-tight mt-2 mb-0.5 font-serif ${valueClass}`}>
        {value}
      </div>
      <div className="text-xs text-gray-400">{subtext}</div>
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
        valueClass="text-amber-600"
        icon={<Inbox className="size-4 text-amber-400" />}
      />
      <StatCard
        value={queuedCount}
        label="Queue"
        subtext="ready to read"
        valueClass="text-blue-600"
        icon={<BookOpen className="size-4 text-blue-400" />}
      />
      <StatCard
        value={readingCount}
        label="Reading"
        subtext="in progress"
        valueClass="text-sky-600"
        icon={<BookOpenCheck className="size-4 text-sky-400" />}
      />
      <StatCard
        value={finishedCount}
        label="Finished"
        subtext="all time"
        valueClass="text-emerald-600"
        icon={<CheckCircle className="size-4 text-emerald-400" />}
      />
    </div>
  )
}
