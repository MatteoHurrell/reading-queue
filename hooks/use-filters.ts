'use client'

import { useState } from 'react'
import { NEGLECT_THRESHOLD_DAYS } from '@/lib/constants'
import type { ReadingItem, Topic, SourceType, Priority } from '@/lib/types'

export type SortOption = 'newest' | 'oldest' | 'priority' | 'shortest' | 'neglected'

export interface FilterState {
  topic: Topic | 'all'
  publisher: string | 'all'
  sourceType: SourceType | 'all'
  priority: Priority | 'all'
  favoritesOnly: boolean
  maxMinutes: number | null
  sort: SortOption
}

const DEFAULT_FILTERS: FilterState = {
  topic: 'all',
  publisher: 'all',
  sourceType: 'all',
  priority: 'all',
  favoritesOnly: false,
  maxMinutes: null,
  sort: 'newest',
}

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export function useFilters() {
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS)

  function setFilter<K extends keyof FilterState>(key: K, value: FilterState[K]): void {
    setFiltersState((prev) => ({ ...prev, [key]: value }))
  }

  function resetFilters(): void {
    setFiltersState(DEFAULT_FILTERS)
  }

  function applyFilters(items: ReadingItem[]): ReadingItem[] {
    let result = items.filter((item) => item.status === 'queued')

    if (filters.topic !== 'all') {
      result = result.filter((item) => item.topic === filters.topic)
    }

    if (filters.publisher !== 'all') {
      result = result.filter((item) => item.publisher === filters.publisher)
    }

    if (filters.sourceType !== 'all') {
      result = result.filter((item) => item.sourceType === filters.sourceType)
    }

    if (filters.priority !== 'all') {
      result = result.filter((item) => item.priority === filters.priority)
    }

    if (filters.favoritesOnly) {
      result = result.filter((item) => item.isFavorite)
    }

    if (filters.maxMinutes !== null) {
      result = result.filter(
        (item) =>
          item.estimatedMinutes !== undefined &&
          item.estimatedMinutes <= (filters.maxMinutes as number)
      )
    }

    switch (filters.sort) {
      case 'newest':
        result = [...result].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case 'oldest':
        result = [...result].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        break
      case 'priority':
        result = [...result].sort(
          (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        )
        break
      case 'shortest':
        result = [...result].sort((a, b) => {
          const aMin = a.estimatedMinutes ?? Infinity
          const bMin = b.estimatedMinutes ?? Infinity
          return aMin - bMin
        })
        break
      case 'neglected': {
        const now = Date.now()
        const thresholdMs = NEGLECT_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
        result = [...result].sort((a, b) => {
          const aDate = new Date(a.queuedAt ?? a.createdAt).getTime()
          const bDate = new Date(b.queuedAt ?? b.createdAt).getTime()
          const aAge = now - aDate
          const bAge = now - bDate
          // Items past threshold bubble to top, sorted by oldest first
          const aNeglected = aAge > thresholdMs
          const bNeglected = bAge > thresholdMs
          if (aNeglected && !bNeglected) return -1
          if (!aNeglected && bNeglected) return 1
          return bAge - aAge
        })
        break
      }
    }

    return result
  }

  return { filters, setFilter, resetFilters, applyFilters }
}
