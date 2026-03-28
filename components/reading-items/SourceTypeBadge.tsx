'use client'

import { SOURCE_TYPE_LABELS } from '@/lib/constants'
import type { SourceType } from '@/lib/types'

interface Props {
  sourceType: SourceType
}

export default function SourceTypeBadge({ sourceType }: Props) {
  return (
    <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.05] text-white/40 border border-white/[0.08]">
      {SOURCE_TYPE_LABELS[sourceType]}
    </span>
  )
}
