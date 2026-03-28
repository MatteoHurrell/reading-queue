'use client'

import { Star, MoreHorizontal, ExternalLink } from 'lucide-react'
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
  items: ReadingItem[]
  onEdit: (item: ReadingItem) => void
  onDelete: (id: string) => void
  onTransition: (id: string, status: ReadingStatus) => void
  onToggleFavorite: (id: string) => void
}

export default function ReadingItemTable({
  items,
  onEdit,
  onDelete,
  onTransition,
  onToggleFavorite,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400 text-sm">
        No items to display.
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-200">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Title
            </th>
            <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
              Type / Topic
            </th>
            <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
              Priority
            </th>
            <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
              Status
            </th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
              Time
            </th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
              Saved
            </th>
            <th className="px-4 py-3 w-8" />
            <th className="px-4 py-3 w-8" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-100 last:border-0 bg-transparent hover:bg-gray-50 transition-colors duration-150"
            >
              {/* Title */}
              <td className="px-4 py-3 max-w-xs truncate">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-800 hover:text-gray-900 transition-colors line-clamp-1 leading-snug"
                >
                  {item.title}
                </a>
                <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  {item.publisher}
                  {item.author && item.author !== item.publisher && (
                    <span className="text-gray-300"> &middot; {item.author}</span>
                  )}
                </div>
              </td>

              {/* Type / Topic */}
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="flex flex-col gap-1">
                  <SourceTypeBadge sourceType={item.sourceType} />
                  <TopicBadge topic={item.topic} />
                </div>
              </td>

              {/* Priority */}
              <td className="px-4 py-3 hidden sm:table-cell">
                <PriorityBadge priority={item.priority} />
              </td>

              {/* Status */}
              <td className="px-4 py-3 hidden sm:table-cell">
                <StatusBadge status={item.status} />
              </td>

              {/* Est. time */}
              <td className="px-4 py-3 text-right text-xs text-gray-400 tabular-nums hidden lg:table-cell">
                {item.estimatedMinutes !== undefined
                  ? formatReadTime(item.estimatedMinutes)
                  : '—'}
              </td>

              {/* Saved date */}
              <td className="px-4 py-3 text-right text-xs text-gray-300 hidden lg:table-cell whitespace-nowrap">
                {formatRelativeDate(item.createdAt)}
              </td>

              {/* Favorite */}
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className={`p-0.5 rounded transition-colors duration-200 ${
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
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        aria-label="More actions"
                      />
                    }
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-44">
                    <DropdownMenuItem
                      onClick={() =>
                        window.open(item.url, '_blank', 'noopener,noreferrer')
                      }
                    >
                      <ExternalLink className="size-4" />
                      Open article
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {item.status === 'queued' && (
                      <DropdownMenuItem
                        onClick={() => onTransition(item.id, 'reading')}
                      >
                        Mark as reading
                      </DropdownMenuItem>
                    )}
                    {(item.status === 'reading' || item.status === 'queued') && (
                      <DropdownMenuItem
                        onClick={() => onTransition(item.id, 'finished')}
                      >
                        Mark as finished
                      </DropdownMenuItem>
                    )}
                    {(item.status === 'inbox' || item.status === 'archived') && (
                      <DropdownMenuItem
                        onClick={() => onTransition(item.id, 'queued')}
                      >
                        Move to queue
                      </DropdownMenuItem>
                    )}
                    {(item.status === 'finished' || item.status === 'queued') && (
                      <DropdownMenuItem
                        onClick={() => onTransition(item.id, 'archived')}
                      >
                        Archive
                      </DropdownMenuItem>
                    )}
                    {(item.status === 'inbox' || item.status === 'queued') && (
                      <DropdownMenuItem
                        onClick={() => onTransition(item.id, 'dropped')}
                      >
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
