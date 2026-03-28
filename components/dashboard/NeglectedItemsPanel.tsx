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
    <section className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
        Sitting Too Long
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing neglected. Nice.</p>
      ) : (
        <div className="flex flex-col">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 py-3 border-b border-border/60 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-stone-700 transition-colors flex items-center gap-1.5 group truncate"
                >
                  <span className="line-clamp-1">{item.title}</span>
                  <ExternalLink className="size-3 text-muted-foreground group-hover:text-stone-600 flex-shrink-0 transition-colors" />
                </a>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{item.publisher}</span>
                  <span className="text-muted-foreground/70 text-xs">&middot;</span>
                  <span className="text-xs text-amber-600 font-medium">
                    queued {formatRelativeDate(item.queuedAt ?? item.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-xs h-7 px-2.5 rounded-lg transition-all duration-200"
                  onClick={() => onTransition(item.id, 'dropped')}
                >
                  Drop it
                </button>
                <button
                  className="bg-muted border border-border text-stone-700 hover:bg-accent text-xs h-7 px-2.5 rounded-lg transition-colors duration-200"
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
