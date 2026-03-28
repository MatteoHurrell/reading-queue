import type { Priority, ReadingStatus, SourceType, Topic } from './types'

export const PUBLISHERS: string[] = [
  'Bloomberg',
  'Matt Levine',
  'Financial Times',
  'Wall Street Journal',
  'The Economist',
  'New York Times',
  'The Atlantic',
  'Substack',
  'X / Twitter',
  'Other',
]

export const SOURCE_TYPES: SourceType[] = [
  'newspaper',
  'newsletter',
  'thread',
  'blog',
  'magazine',
  'pdf',
  'other',
]

export const TOPICS: Topic[] = [
  'markets',
  'finance-business',
  'tech-product',
  'politics-policy',
  'economics',
  'essays-opinion',
  'career-learning',
  'other',
]

export const TOPIC_LABELS: Record<Topic, string> = {
  'markets': 'Markets',
  'finance-business': 'Finance & Business',
  'tech-product': 'Tech & Product',
  'politics-policy': 'Politics & Policy',
  'economics': 'Economics',
  'essays-opinion': 'Essays & Opinion',
  'career-learning': 'Career & Learning',
  'other': 'Other',
}

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  'newspaper': 'Newspaper',
  'newsletter': 'Newsletter',
  'thread': 'Thread',
  'blog': 'Blog',
  'magazine': 'Magazine',
  'pdf': 'PDF',
  'other': 'Other',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  'high': 'High',
  'medium': 'Medium',
  'low': 'Low',
}

export const STATUS_LABELS: Record<ReadingStatus, string> = {
  'inbox': 'Inbox',
  'queued': 'Queued',
  'reading': 'Reading',
  'finished': 'Finished',
  'archived': 'Archived',
  'dropped': 'Dropped',
}

export const NEGLECT_THRESHOLD_DAYS = 14

export const QUICK_READ_MAX_MINUTES = 8
