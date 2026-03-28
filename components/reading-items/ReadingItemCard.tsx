'use client'

import { Star, MoreHorizontal, ExternalLink, Clock } from 'lucide-react'
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
    <div className="flex items-center gap-4 px-4 py-3 bg-[#1a1a1a] border border-white/[0.08] rounded-xl hover:border-white/15 hover:bg-[#1f1f1f] transition-colors duration-150">
      {/* Left: title + publisher/author */}
      <div className="flex-1 min-w-0">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-white/90 hover:text-white transition-colors line-clamp-1 leading-snug"
        >
          {item.title}
        </a>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-sm text-white/50">{item.publisher}</span>
          {item.author && item.author !== item.publisher && (
            <>
              <span className="text-white/20 text-xs">·</span>
              <span className="text-xs text-white/30">{item.author}</span>
            </>
          )}
        </div>
      </div>

      {/* Middle: badge row */}
      <div className="hidden sm:flex flex-wrap items-center gap-1.5 mt-1.5 flex-shrink-0">
        <SourceTypeBadge sourceType={item.sourceType} />
        <TopicBadge topic={item.topic} />
        <PriorityBadge priority={item.priority} />
        <StatusBadge status={item.status} />
      </div>

      {/* Right: meta + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {item.estimatedMinutes !== undefined && (
          <span className="flex items-center gap-1 text-xs text-white/40 tabular-nums">
            <Clock className="size-3 flex-shrink-0" />
            {formatReadTime(item.estimatedMinutes)}
          </span>
        )}
        <span className="text-xs text-white/30 hidden md:block">
          {formatRelativeDate(item.createdAt)}
        </span>

        {/* Favorite star */}
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

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-white/30 hover:text-white/70 hover:bg-white/[0.06]"
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
  )
}
