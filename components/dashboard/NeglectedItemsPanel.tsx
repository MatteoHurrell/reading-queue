'use client'

import { ExternalLink } from 'lucide-react'
import { formatRelativeDate } from '@/lib/formatters'
import type { ReadingItem, ReadingStatus } from '@/lib/types'

interface Props {
  items: ReadingItem[]
  onTransition: (id: string, status: ReadingStatus) => void
}

export default function NeglectedItemsPanel({ items, onTransition }: Props) {
  return (
    <section className="bg-white/[0.03] backdrop-blur-md border border-white/[0.07] rounded-2xl p-5">
      <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">
        Sitting Too Long
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-white/40">Nothing neglected. Nice.</p>
      ) : (
        <div className="flex flex-col">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 py-3 border-b border-white/[0.05] last:border-0"
            >
              <div className="flex-1 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 group truncate"
                >
                  <span className="line-clamp-1">{item.title}</span>
                  <ExternalLink className="size-3 text-white/30 group-hover:text-white/60 flex-shrink-0 transition-colors" />
                </a>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-white/35">{item.publisher}</span>
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-xs text-amber-400/70">
                    queued {formatRelativeDate(item.queuedAt ?? item.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs h-7 px-2.5 rounded-lg transition-all duration-200"
                  onClick={() => onTransition(item.id, 'dropped')}
                >
                  Drop it
                </button>
                <button
                  className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs h-7 px-2.5 rounded-lg transition-all duration-200"
                  onClick={() => onTransition(item.id, 'reading')}
                >
                  Start reading
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
