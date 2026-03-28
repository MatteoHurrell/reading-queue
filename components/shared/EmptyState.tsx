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
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5 mx-auto">
        <span className="text-white/20 [&>svg]:size-6">
          {icon ?? <BookOpen className="size-6" />}
        </span>
      </div>
      <h3 className="text-base font-semibold text-white/40 mb-1.5">{heading}</h3>
      {subtext && <p className="text-sm text-white/25 mb-5">{subtext}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-white/[0.05] border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.08] rounded-xl px-4 py-2 text-sm transition-all duration-200"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
