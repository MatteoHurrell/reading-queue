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
    <section className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Currently Reading
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">
          Nothing in progress. Pick something from your queue.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="border-l-2 border-gray-900 pl-4 py-3 flex items-center justify-between bg-gray-50 rounded-r-xl"
            >
              <div className="flex-1 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-800 hover:text-gray-900 transition-colors flex items-center gap-1.5 group"
                >
                  <span className="line-clamp-1">{item.title}</span>
                  <ExternalLink className="size-3 text-gray-400 group-hover:text-gray-600 flex-shrink-0 transition-colors" />
                </a>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{item.publisher}</span>
                  {item.estimatedMinutes !== undefined && (
                    <>
                      <span className="text-gray-300 text-xs">&middot;</span>
                      <span className="text-xs text-gray-400">
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
                  className="text-xs h-7 px-3 rounded-lg bg-transparent border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all duration-200"
                  onClick={() => onTransition(item.id, 'queued')}
                >
                  Back to queue
                </Button>
                <Button
                  size="sm"
                  className="text-xs h-7 px-3 rounded-lg border-0 text-white bg-gray-900 hover:bg-gray-800 transition-all duration-200"
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
