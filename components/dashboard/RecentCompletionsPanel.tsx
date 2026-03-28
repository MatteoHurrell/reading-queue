'use client'

import { Star, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/formatters'
import type { ReadingItem } from '@/lib/types'

interface Props {
  items: ReadingItem[]
  onToggleFavorite: (id: string) => void
}

export default function RecentCompletionsPanel({ items, onToggleFavorite }: Props) {
  const sorted = [...items]
    .filter((item) => item.status === 'finished' && item.finishedAt)
    .sort((a, b) => new Date(b.finishedAt!).getTime() - new Date(a.finishedAt!).getTime())
    .slice(0, 5)

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Recent Completions
      </h2>

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400">Nothing finished yet.</p>
      ) : (
        <div className="flex flex-col">
          {sorted.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0"
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
                  {item.finishedAt && (
                    <>
                      <span className="text-gray-300 text-xs">&middot;</span>
                      <span className="text-xs text-emerald-600">
                        finished {formatDate(item.finishedAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => onToggleFavorite(item.id)}
                className={`p-1 rounded transition-colors flex-shrink-0 ${
                  item.isFavorite
                    ? 'text-amber-500 hover:text-amber-600'
                    : 'text-gray-300 hover:text-gray-500'
                }`}
                aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className="size-3.5"
                  fill={item.isFavorite ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
