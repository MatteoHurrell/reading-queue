'use client'

import { useState } from 'react'
import { Star, MoreHorizontal, ExternalLink, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import TopicBadge from './TopicBadge'
import SourceTypeBadge from './SourceTypeBadge'
import { formatRelativeDate, formatReadTime } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { ReadingItem, ReadingStatus } from '@/lib/types'

interface Props {
  item: ReadingItem
  onEdit: (item: ReadingItem) => void
  onDelete: (id: string) => void
  onTransition: (id: string, status: ReadingStatus) => void
  onToggleFavorite: (id: string) => void
  /** Nested inside inbox panel (no outer radius on bottom) */
  variant?: 'standalone' | 'embedded'
}

function excerptText(item: ReadingItem): string | undefined {
  if (item.previewDescription?.trim()) return item.previewDescription.trim()
  if (item.whySaved?.trim()) return item.whySaved.trim()
  return undefined
}

export default function ReadingItemCard({
  item,
  onEdit,
  onDelete,
  onTransition,
  onToggleFavorite,
  variant = 'standalone',
}: Props) {
  const [imageFailed, setImageFailed] = useState(false)
  const excerpt = excerptText(item)
  const showImage = Boolean(item.previewImageUrl) && !imageFailed

  const shellClass =
    variant === 'embedded'
      ? 'rounded-t-2xl bg-white overflow-hidden'
      : 'rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300/90 overflow-hidden'

  return (
    <motion.div
      whileHover={variant === 'standalone' ? { y: -2 } : { y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(shellClass, 'transition-[box-shadow,border-color] duration-300')}
    >
      <div className="flex flex-col sm:flex-row sm:min-h-[200px]">
        {/* Preview image — Ramp-style visual anchor */}
        <div
          className={cn(
            'relative shrink-0 bg-gradient-to-br from-slate-100 via-slate-50 to-zinc-100',
            'aspect-[16/10] sm:aspect-auto sm:w-[min(44%,280px)] sm:min-h-[200px]'
          )}
        >
          {showImage ? (
            <img
              src={item.previewImageUrl}
              alt=""
              className="absolute inset-0 size-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <span className="text-4xl font-semibold tabular-nums text-slate-300/90 select-none">
                {item.title.slice(0, 1).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-black/10" />

          <button
            type="button"
            onClick={() => onToggleFavorite(item.id)}
            className={cn(
              'absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-colors',
              item.isFavorite
                ? 'bg-amber-400/90 text-amber-950 shadow-sm'
                : 'bg-white/80 text-slate-500 hover:text-amber-600 shadow-sm'
            )}
            aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className="size-4" fill={item.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 min-w-0 p-4 sm:p-5 gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.95rem] sm:text-base font-semibold text-slate-900 leading-snug line-clamp-2 hover:text-indigo-600 transition-colors"
            >
              {item.title}
            </a>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500">
              <span>{item.publisher}</span>
              {item.author && item.author !== item.publisher && (
                <>
                  <span className="text-slate-300">·</span>
                  <span>{item.author}</span>
                </>
              )}
            </div>
            {excerpt && (
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{excerpt}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <SourceTypeBadge sourceType={item.sourceType} />
            <TopicBadge topic={item.topic} />
            <PriorityBadge priority={item.priority} />
            <StatusBadge status={item.status} />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-3 min-w-0 text-xs text-slate-400">
              {item.estimatedMinutes !== undefined && (
                <span className="flex items-center gap-1 tabular-nums shrink-0">
                  <Clock className="size-3.5 flex-shrink-0" />
                  {formatReadTime(item.estimatedMinutes)}
                </span>
              )}
              <span className="truncate hidden sm:inline">
                Added {formatRelativeDate(item.createdAt)}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 shrink-0"
                    aria-label="More actions"
                  />
                }
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuItem
                  onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="size-4" />
                  Open article
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {item.status === 'queued' && (
                  <DropdownMenuItem onClick={() => onTransition(item.id, 'reading')}>
                    Mark as reading
                  </DropdownMenuItem>
                )}
                {(item.status === 'reading' || item.status === 'queued') && (
                  <DropdownMenuItem onClick={() => onTransition(item.id, 'finished')}>
                    Mark as finished
                  </DropdownMenuItem>
                )}
                {(item.status === 'inbox' || item.status === 'archived') && (
                  <DropdownMenuItem onClick={() => onTransition(item.id, 'queued')}>
                    Move to queue
                  </DropdownMenuItem>
                )}
                {(item.status === 'finished' || item.status === 'queued') && (
                  <DropdownMenuItem onClick={() => onTransition(item.id, 'archived')}>
                    Archive
                  </DropdownMenuItem>
                )}
                {(item.status === 'inbox' || item.status === 'queued') && (
                  <DropdownMenuItem onClick={() => onTransition(item.id, 'dropped')}>
                    Drop
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(item)}>Edit</DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(item.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
