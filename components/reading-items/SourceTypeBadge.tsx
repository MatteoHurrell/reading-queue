'use client'

import { Badge } from '@/components/ui/badge'
import { SOURCE_TYPE_LABELS } from '@/lib/constants'
import type { SourceType } from '@/lib/types'

interface Props {
  sourceType: SourceType
}

export default function SourceTypeBadge({ sourceType }: Props) {
  return (
    <Badge variant="outline" className="bg-white/[0.04] text-white/40 border-white/[0.08]">
      {SOURCE_TYPE_LABELS[sourceType]}
    </Badge>
  )
}
