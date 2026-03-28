'use client'

import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  icon?: React.ReactNode
  heading: string
  subtext?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon, heading, subtext, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="size-12 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/30">
        {icon ?? <BookOpen className="size-5" />}
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-medium text-white/40">{heading}</p>
        {subtext && <p className="text-sm text-white/25">{subtext}</p>}
      </div>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="border-white/[0.12] text-white/60 hover:text-white/90"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
