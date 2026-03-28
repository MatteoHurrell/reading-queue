'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatRelativeDate } from '@/lib/formatters'
import type { ReadingItem, ReadingStatus } from '@/lib/types'

interface Props {
  items: ReadingItem[]
  onTransition: (id: string, status: ReadingStatus) => void
}

export default function NeglectedItemsPanel({ items, onTransition }: Props) {
  return (
    <section className="bg-[#141414] border border-white/[0.08] rounded-xl p-5">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
        Sitting Too Long
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-white/40">Nothing neglected. Nice.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 px-3 py-2.5 bg-[#1a1a1a] border border-white/[0.08] rounded-md hover:border-white/[0.14] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-white/90 hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <span className="line-clamp-1">{item.title}</span>
                  <ExternalLink className="size-3 text-white/30 group-hover:text-white/60 flex-shrink-0 transition-colors" />
                </a>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-white/40">{item.publisher}</span>
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-xs text-amber-400/70">
                    queued {formatRelativeDate(item.queuedAt ?? item.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 px-2.5 border-red-500/30 text-red-400/70 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10"
                  onClick={() => onTransition(item.id, 'dropped')}
                >
                  Drop it
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 px-2.5 border-blue-500/30 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10"
                  onClick={() => onTransition(item.id, 'reading')}
                >
                  Start reading
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
