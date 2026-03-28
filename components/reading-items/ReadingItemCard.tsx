'use client'

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
import type { ReadingItem, ReadingStatus } from '@/lib/types'

interface Props {
  item: ReadingItem
  onEdit: (item: ReadingItem) => void
  onDelete: (id: string) => void
  onTransition: (id: string, status: ReadingStatus) => void
  onToggleFavorite: (id: string) => void
}

export default function ReadingItemCard({
  item,
  onEdit,
  onDelete,
  onTransition,
  onToggleFavorite,
}: Props) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-4 px-5 py-4 bg-white/[0.03] backdrop-blur-sm border border-white/[0.07] rounded-2xl hover:border-white/[0.14] hover:bg-white/[0.05] hover:shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition-all duration-200 cursor-default"
    >
      {/* Left: title + publisher/author */}
      <div className="flex-1 min-w-0">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-slate-100 hover:text-white leading-snug line-clamp-1 transition-colors duration-200"
        >
          {item.title}
        </a>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-white/40">{item.publisher}</span>
          {item.author && item.author !== item.publisher && (
            <>
              <span className="text-white/20 text-xs">·</span>
              <span className="text-xs text-white/40">{item.author}</span>
            </>
          )}
        </div>

        {/* Badge row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 sm:hidden">
          <SourceTypeBadge sourceType={item.sourceType} />
          <TopicBadge topic={item.topic} />
          <PriorityBadge priority={item.priority} />
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Middle: badge row (desktop) */}
      <div className="hidden sm:flex flex-wrap items-center gap-1.5 flex-shrink-0">
        <SourceTypeBadge sourceType={item.sourceType} />
        <TopicBadge topic={item.topic} />
        <PriorityBadge priority={item.priority} />
        <StatusBadge status={item.status} />
      </div>

      {/* Right: meta + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {item.estimatedMinutes !== undefined && (
          <span className="flex items-center gap-1 text-xs text-white/30 tabular-nums">
            <Clock className="size-3 flex-shrink-0" />
            {formatReadTime(item.estimatedMinutes)}
          </span>
        )}
        <span className="text-xs text-white/20 hidden md:block">
          {formatRelativeDate(item.createdAt)}
        </span>

        {/* Favorite star */}
        <button
          onClick={() => onToggleFavorite(item.id)}
          className={`p-1 rounded transition-colors duration-200 ${
            item.isFavorite
              ? 'text-yellow-400 hover:text-yellow-300'
              : 'text-white/20 hover:text-white/50'
          }`}
          aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className="size-4" fill={item.isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-white/25 hover:text-white/60 hover:bg-white/[0.06]"
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
    </motion.div>
  )
}
