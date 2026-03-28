'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, MoreHorizontal, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRelativeDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { ReadingItem, ReadingStatus } from '@/lib/types'

interface Props {
  item: ReadingItem
  onEdit: (item: ReadingItem) => void
  onDelete: (id: string) => void
  onTransition: (id: string, status: ReadingStatus) => void
  onToggleFavorite: (id: string) => void
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function proxiedPreviewSrc(previewImageUrl: string): string {
  return `/api/preview-image?url=${encodeURIComponent(previewImageUrl)}`
}

export default function ReadingItemCard({
  item,
  onEdit,
  onDelete,
  onTransition,
  onToggleFavorite,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(item.previewImageUrl) && !imageFailed
  const domain = getDomain(item.url)

  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-stone-300/80 transition-all duration-200">
      {showImage ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-[2/1] bg-muted/50 overflow-hidden"
        >
          <Image
            src={proxiedPreviewSrc(item.previewImageUrl!)}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        </a>
      ) : (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-[2/1] bg-muted flex items-center justify-center"
        >
          <span className="text-3xl font-semibold text-stone-300 select-none">
            {item.title.slice(0, 1).toUpperCase()}
          </span>
        </a>
      )}

      <div className="p-3.5 space-y-2">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-foreground leading-snug line-clamp-2 hover:text-stone-700 transition-colors block"
        >
          {item.title}
        </a>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground truncate">
            {item.publisher || domain}
            {' · '}
            {formatRelativeDate(item.createdAt)}
          </span>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              className={cn(
                'p-1 rounded-md transition-colors',
                item.isFavorite
                  ? 'text-amber-400'
                  : 'text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:text-muted-foreground'
              )}
              aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className="size-3.5" fill={item.isFavorite ? 'currentColor' : 'none'} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-6 text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:text-muted-foreground hover:bg-muted"
                    aria-label="More actions"
                  />
                }
              >
                <MoreHorizontal className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-36">
                <DropdownMenuItem
                  onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="size-3.5" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {item.status === 'inbox' && (
                  <DropdownMenuItem onClick={() => onTransition(item.id, 'queued')}>
                    Move to queue
                  </DropdownMenuItem>
                )}
                {item.status === 'queued' && (
                  <DropdownMenuItem onClick={() => onTransition(item.id, 'reading')}>
                    Start reading
                  </DropdownMenuItem>
                )}
                {(item.status === 'reading' || item.status === 'queued') && (
                  <DropdownMenuItem onClick={() => onTransition(item.id, 'finished')}>
                    Mark finished
                  </DropdownMenuItem>
                )}
                {item.status !== 'archived' && item.status !== 'dropped' && (
                  <DropdownMenuItem onClick={() => onTransition(item.id, 'archived')}>
                    Archive
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
    </div>
  )
}
