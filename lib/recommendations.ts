import type { ReadingItem } from './types'
import { getQueuedItems, getFinishedItems, getFavoriteItems } from './selectors'

interface ScoredItem {
  item: ReadingItem
  score: number
}

export function getRecommendedReads(items: ReadingItem[]): ReadingItem[] {
  const queued = getQueuedItems(items)
  const finished = getFinishedItems(items)
  const favFinished = getFavoriteItems(finished)
  const favPublishers = new Set(favFinished.map((i) => i.publisher))

  const now = Date.now()

  const scored: ScoredItem[] = queued.map((item) => {
    let score = 0

    // Priority score
    if (item.priority === 'high') score += 3
    else if (item.priority === 'medium') score += 2
    else score += 1

    // Read time bonus
    if (item.estimatedMinutes !== undefined) {
      if (item.estimatedMinutes < 10) score += 2
      else if (item.estimatedMinutes < 20) score += 1
    }

    // Age bonus: +1 per 3 days since createdAt, max +5
    const ageMs = now - new Date(item.createdAt).getTime()
    const ageDays = ageMs / (1000 * 60 * 60 * 24)
    const ageBonus = Math.min(5, Math.floor(ageDays / 3))
    score += ageBonus

    // Same publisher as a finished favorite
    if (favPublishers.has(item.publisher)) score += 2

    return { item, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.item)
}
