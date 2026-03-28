'use client'

import { ExternalLink, Star } from 'lucide-react'
import PriorityBadge from '@/components/reading-items/PriorityBadge'
import { formatReadTime } from '@/lib/formatters'
import type { ReadingItem, ReadingStatus } from '@/lib/types'

interface Props {
  items: ReadingItem[]
  onEdit: (item: ReadingItem) => void
  onDelete: (id: string) => void
  onTransition: (id: string, status: ReadingStatus) => void
  onToggleFavorite: (id: string) => void
}

export default function RecommendedReads({
  items,
  onToggleFavorite,
}: Props) {
  return (
    <section className="bg-[#141414] border border-white/[0.08] rounded-xl p-5">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
        Recommended Next Reads
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-white/40">Your queue is empty.</p>
      ) : (
        <div className="flex flex-col divide-y divide-white/[0.05]">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-white/85 hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <span className="line-clamp-1">{item.title}</span>
                  <ExternalLink className="size-3 text-white/30 group-hover:text-white/60 flex-shrink-0 transition-colors" />
                </a>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-white/40">{item.publisher}</span>
                  {item.estimatedMinutes !== undefined && (
                    <>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-xs text-white/30">{formatReadTime(item.estimatedMinutes)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <PriorityBadge priority={item.priority} />
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className={`p-1 rounded transition-colors ${
                    item.isFavorite
                      ? 'text-amber-400 hover:text-amber-300'
                      : 'text-white/20 hover:text-white/50'
                  }`}
                  aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className="size-3.5" fill={item.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
