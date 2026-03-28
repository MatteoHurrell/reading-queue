'use client'

import { Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <section className="bg-[#141414] border border-white/[0.08] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="size-3.5 text-amber-400" />
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
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
              className="flex items-center justify-between gap-3 py-2.5 border-b border-white/[0.06] last:border-0"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/80 hover:text-white truncate transition-colors"
                >
                  {item.title}
                </a>
                <div className="flex items-center gap-2 text-xs text-white/40">
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
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 h-7 px-3 text-xs border-blue-500/25 text-blue-400/70 hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10"
                onClick={() => onTransition(item.id, 'reading')}
              >
                Start reading
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
