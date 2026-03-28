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
    <section className="bg-white/[0.03] backdrop-blur-md border border-white/[0.07] rounded-2xl p-5">
      <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">
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
              className="border-l-2 border-indigo-500/60 pl-4 py-3 flex items-center justify-between bg-white/[0.02] rounded-r-xl"
            >
              <div className="flex-1 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <span className="line-clamp-1">{item.title}</span>
                  <ExternalLink className="size-3 text-white/30 group-hover:text-white/60 flex-shrink-0 transition-colors" />
                </a>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-white/35">{item.publisher}</span>
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
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 px-3 rounded-lg bg-transparent border-white/[0.10] text-white/50 hover:text-white/80 hover:border-white/20 transition-all duration-200"
                  onClick={() => onTransition(item.id, 'queued')}
                >
                  Back to queue
                </Button>
                <Button
                  size="sm"
                  className="text-xs h-7 px-3 rounded-lg border-0 text-white transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
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
