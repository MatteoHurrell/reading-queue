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
    <section className="bg-[#141414] border border-white/[0.08] rounded-xl p-5">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
        Recent Completions
      </h2>

      {sorted.length === 0 ? (
        <p className="text-sm text-white/40">Nothing finished yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((item) => (
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
                  {item.finishedAt && (
                    <>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-xs text-green-400/60">
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
                    ? 'text-amber-400 hover:text-amber-300'
                    : 'text-white/20 hover:text-white/50'
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
