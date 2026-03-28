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
    <section className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
        Currently Reading
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing in progress. Pick something from your queue.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="border-l-4 border-stone-400 pl-4 py-2 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-foreground hover:text-stone-700 transition-colors flex items-center gap-1.5 group"
                >
                  <span className="line-clamp-1">{item.title}</span>
                  <ExternalLink className="size-3 text-muted-foreground group-hover:text-stone-600 flex-shrink-0 transition-colors" />
                </a>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{item.publisher}</span>
                  {item.estimatedMinutes !== undefined && (
                    <>
                      <span className="text-muted-foreground/70 text-xs">&middot;</span>
                      <span className="text-xs text-muted-foreground">
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
                  className="bg-muted text-muted-foreground hover:bg-accent hover:text-foreground text-xs h-7 px-3 rounded-lg border-0 transition-colors duration-200"
                  onClick={() => onTransition(item.id, 'queued')}
                >
                  Back to queue
                </Button>
                <Button
                  size="sm"
                  className="text-xs h-7 px-3 rounded-lg border border-transparent text-primary-foreground bg-primary shadow-sm hover:bg-primary/90 transition-colors duration-200"
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
