'use client'

import { BookOpen } from 'lucide-react'

interface Props {
  icon?: React.ReactNode
  heading: string
  subtext?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon, heading, subtext, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mb-5 mx-auto">
        <span className="text-muted-foreground [&>svg]:size-6">
          {icon ?? <BookOpen className="size-6" />}
        </span>
      </div>
      <h3 className="text-base font-semibold text-muted-foreground mb-1.5">{heading}</h3>
      {subtext && <p className="text-sm text-muted-foreground mb-5">{subtext}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl px-4 py-2 text-sm shadow-sm transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
