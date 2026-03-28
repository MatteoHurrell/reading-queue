'use client'

import { Zap } from 'lucide-react'
import ReadingItemCard from '@/components/reading-items/ReadingItemCard'
import type { ReadingItem, ReadingStatus } from '@/lib/types'

interface Props {
  items: ReadingItem[]
  onEdit: (item: ReadingItem) => void
  onDelete: (id: string) => void
  onTransition: (id: string, status: ReadingStatus) => void
  onToggleFavorite: (id: string) => void
}

export default function QuickWinsPanel({
  items,
  onEdit,
  onDelete,
  onTransition,
  onToggleFavorite,
}: Props) {
  return (
    <section className="bg-[#141414] border border-white/[0.08] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="size-3.5 text-amber-400" />
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
          Quick Reads — under 8 min
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-white/40">No short reads in your queue right now.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <ReadingItemCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onTransition={onTransition}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </section>
  )
}
