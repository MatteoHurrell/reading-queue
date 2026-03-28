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
    <section className="bg-white/[0.03] backdrop-blur-md border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="size-3.5 text-amber-400/70" />
        <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">
          Quick Reads — under 8 min
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-white/40">No short reads in your queue right now.</p>
      ) : (
        <div className="flex flex-col">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 py-2.5 border-b border-white/[0.05] last:border-0"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-slate-200 hover:text-white truncate transition-colors"
                >
                  {item.title}
                </a>
                <div className="flex items-center gap-2 text-xs text-white/35">
                  <span>{item.publisher}</span>
                  {item.estimatedMinutes !== undefined && (
                    <>
                      <span className="text-white/20">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatReadTime(item.estimatedMinutes)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                className="shrink-0 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs h-7 px-2.5 rounded-lg transition-all duration-200"
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
