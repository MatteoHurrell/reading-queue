export type ReadingStatus =
  | 'inbox'
  | 'queued'
  | 'reading'
  | 'finished'
  | 'archived'
  | 'dropped'

export type Priority = 'high' | 'medium' | 'low'

export type SourceType =
  | 'newspaper'
  | 'newsletter'
  | 'thread'
  | 'blog'
  | 'magazine'
  | 'pdf'
  | 'other'

export type Topic =
  | 'markets'
  | 'finance-business'
  | 'tech-product'
  | 'politics-policy'
  | 'economics'
  | 'essays-opinion'
  | 'career-learning'
  | 'other'

export interface ReadingItem {
  id: string
  title: string
  url: string
  publisher: string
  author?: string
  sourceType: SourceType
  topic: Topic
  tags: string[]
  priority: Priority
  estimatedMinutes?: number
  status: ReadingStatus
  whySaved?: string
  notes?: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  queuedAt?: string
  startedAt?: string
  finishedAt?: string
  archivedAt?: string
  droppedAt?: string
  /** Open Graph / social preview image (e.g. X post card image) */
  previewImageUrl?: string
  /** Short excerpt from og:description or meta description */
  previewDescription?: string
}

export interface PersistedData {
  version: 1
  items: ReadingItem[]
}
