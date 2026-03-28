'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatReadTime } from '@/lib/formatters'
import type { ReadingItem, ReadingStatus } from '@/lib/types'

interface Props {
  items: ReadingItem[]
  onTransition: (id: string, status: ReadingStatus) => void
}

export default function CurrentlyReadingPanel({ items, onTransition }: Props) {
  return (
    <section className="bg-[#141414] border border-white/[0.08] rounded-xl p-5">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
        Currently Reading
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-white/40">
          Nothing in progress. Pick something from your queue.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 p-3 bg-[#1a1a1a] border border-white/[0.08] border-l-2 border-l-blue-500 rounded-md"
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
                  {item.estimatedMinutes !== undefined && (
                    <>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-xs text-white/35">
                        {formatReadTime(item.estimatedMinutes)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 px-2.5 border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/25"
                  onClick={() => onTransition(item.id, 'queued')}
                >
                  Back to queue
                </Button>
                <Button
                  size="sm"
                  className="text-xs h-7 px-2.5 bg-green-600/80 hover:bg-green-600 text-white border-0"
                  onClick={() => onTransition(item.id, 'finished')}
                >
                  Mark finished
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
