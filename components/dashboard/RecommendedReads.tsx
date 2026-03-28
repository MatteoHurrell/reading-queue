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
    <section className="bg-white/[0.03] backdrop-blur-md border border-white/[0.07] rounded-2xl p-5">
      <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">
        Recommended Next Reads
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-white/40">Your queue is empty.</p>
      ) : (
        <div className="flex flex-col">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center justify-between gap-4 py-3 border-b border-white/[0.05] last:border-0"
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
                      <span className="text-xs text-white/35">{formatReadTime(item.estimatedMinutes)}</span>
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
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
