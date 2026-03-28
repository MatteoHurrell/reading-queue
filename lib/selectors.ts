import type { ReadingItem, Topic } from './types'

export function getInboxItems(items: ReadingItem[]): ReadingItem[] {
  return items.filter((item) => item.status === 'inbox')
}

export function getQueuedItems(items: ReadingItem[]): ReadingItem[] {
  return items.filter((item) => item.status === 'queued')
}

export function getCurrentlyReading(items: ReadingItem[]): ReadingItem[] {
  return items.filter((item) => item.status === 'reading')
}

export function getFinishedItems(items: ReadingItem[]): ReadingItem[] {
  return items.filter((item) => item.status === 'finished')
}

export function getArchivedItems(items: ReadingItem[]): ReadingItem[] {
  return items.filter((item) => item.status === 'archived')
}

export function getDroppedItems(items: ReadingItem[]): ReadingItem[] {
  return items.filter((item) => item.status === 'dropped')
}

export function getFavoriteItems(items: ReadingItem[]): ReadingItem[] {
  return items.filter((item) => item.isFavorite)
}

export function getNeglectedItems(
  items: ReadingItem[],
  daysThreshold: number
): ReadingItem[] {
  const now = Date.now()
  const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000
  return items.filter((item) => {
    if (item.status !== 'queued') return false
    const queuedDate = item.queuedAt ?? item.createdAt
    return now - new Date(queuedDate).getTime() > thresholdMs
  })
}

export function getQuickReads(
  items: ReadingItem[],
  maxMinutes: number
): ReadingItem[] {
  return items.filter(
    (item) =>
      item.status === 'queued' &&
      item.estimatedMinutes !== undefined &&
      item.estimatedMinutes <= maxMinutes
  )
}

export function groupItemsByTopic(items: ReadingItem[]): Record<Topic, ReadingItem[]> {
  const groups: Record<Topic, ReadingItem[]> = {
    'markets': [],
    'finance-business': [],
    'tech-product': [],
    'politics-policy': [],
    'economics': [],
    'essays-opinion': [],
    'career-learning': [],
    'other': [],
  }
  for (const item of items) {
    groups[item.topic].push(item)
  }
  return groups
}

export function groupItemsByPublisher(
  items: ReadingItem[]
): Record<string, ReadingItem[]> {
  const groups: Record<string, ReadingItem[]> = {}
  for (const item of items) {
    if (!groups[item.publisher]) {
      groups[item.publisher] = []
    }
    groups[item.publisher].push(item)
  }
  return groups
}

export function computeCompletionRateByPublisher(
  items: ReadingItem[]
): Record<string, number> {
  const groups = groupItemsByPublisher(items)
  const rates: Record<string, number> = {}
  for (const [publisher, publisherItems] of Object.entries(groups)) {
    const total = publisherItems.length
    if (total === 0) {
      rates[publisher] = 0
      continue
    }
    const finished = publisherItems.filter((i) => i.status === 'finished').length
    rates[publisher] = Math.round((finished / total) * 100)
  }
  return rates
}

export function getWeeklySaveCounts(
  items: ReadingItem[],
  weeksBack: number
): Array<{ week: string; saved: number; finished: number }> {
  const now = new Date()
  const results: Array<{ week: string; saved: number; finished: number }> = []

  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - i * 7 - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const weekStartMs = weekStart.getTime()
    const weekEndMs = weekEnd.getTime()

    const saved = items.filter((item) => {
      const t = new Date(item.createdAt).getTime()
      return t >= weekStartMs && t < weekEndMs
    }).length

    const finished = items.filter((item) => {
      if (!item.finishedAt) return false
      const t = new Date(item.finishedAt).getTime()
      return t >= weekStartMs && t < weekEndMs
    }).length

    const label = weekStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    results.push({ week: label, saved, finished })
  }

  return results
}
