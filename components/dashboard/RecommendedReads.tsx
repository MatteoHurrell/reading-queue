'use client'

import { ExternalLink, Star } from 'lucide-react'
import { motion } from 'framer-motion'
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
    <section className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
        Recommended Next Reads
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Your queue is empty.</p>
      ) : (
        <div className="flex flex-col">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center justify-between gap-4 py-3 border-b border-border/60 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-stone-700 transition-colors flex items-center gap-1.5 group"
                >
                  <span className="line-clamp-1">{item.title}</span>
                  <ExternalLink className="size-3 text-muted-foreground group-hover:text-stone-600 flex-shrink-0 transition-colors" />
                </a>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{item.publisher}</span>
                  {item.estimatedMinutes !== undefined && (
                    <>
                      <span className="text-muted-foreground/70 text-xs">&middot;</span>
                      <span className="text-xs text-muted-foreground">{formatReadTime(item.estimatedMinutes)}</span>
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
                      ? 'text-amber-400 hover:text-amber-500'
                      : 'text-muted-foreground/70 hover:text-muted-foreground'
                  }`}
                  aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className="size-3.5" fill={item.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
