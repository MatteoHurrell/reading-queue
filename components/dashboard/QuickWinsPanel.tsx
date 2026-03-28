'use client'

import { Clock, Zap } from 'lucide-react'
import { formatReadTime } from '@/lib/formatters'
import type { ReadingItem, ReadingStatus } from '@/lib/types'

interface Props {
  items: ReadingItem[]
  onEdit: (item: ReadingItem) => void
  onDelete: (id: string) => void
  onTransition: (id: string, status: ReadingStatus) => void
  onToggleFavorite: (id: string) => void
}

export default function QuickWinsPanel({ items, onTransition }: Props) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="size-3.5 text-amber-500" />
        <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
          Quick Reads — under 8 min
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No short reads in your queue right now.</p>
      ) : (
        <div className="flex flex-col">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-800 hover:text-gray-900 truncate transition-colors"
                >
                  {item.title}
                </a>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{item.publisher}</span>
                  {item.estimatedMinutes !== undefined && (
                    <>
                      <span className="text-gray-300">&middot;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatReadTime(item.estimatedMinutes)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                className="shrink-0 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs h-7 px-2.5 rounded-lg transition-all duration-200"
                onClick={() => onTransition(item.id, 'reading')}
              >
                Start reading
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
