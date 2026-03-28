import type { PersistedData, ReadingItem } from './types'

const STORAGE_KEY = 'reading-queue-data'

export function loadData(): ReadingItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PersistedData
    if (!parsed || !Array.isArray(parsed.items)) return []
    return parsed.items
  } catch {
    return []
  }
}

export function saveData(items: ReadingItem[]): void {
  if (typeof window === 'undefined') return
  const data: PersistedData = { version: 1, items }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportData(items: ReadingItem[]): void {
  const data: PersistedData = { version: 1, items }
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `reading-queue-export-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importData(file: File): Promise<ReadingItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result
        if (typeof text !== 'string') {
          reject(new Error('Failed to read file contents.'))
          return
        }
        const parsed = JSON.parse(text) as unknown

        if (
          typeof parsed !== 'object' ||
          parsed === null ||
          !('version' in parsed) ||
          !('items' in parsed)
        ) {
          reject(new Error('Invalid file format: missing version or items fields.'))
          return
        }

        const data = parsed as PersistedData

        if (data.version !== 1) {
          reject(new Error(`Unsupported version: ${data.version}. Expected version 1.`))
          return
        }

        if (!Array.isArray(data.items)) {
          reject(new Error('Invalid file format: items must be an array.'))
          return
        }

        resolve(data.items)
      } catch {
        reject(new Error('Failed to parse file: invalid JSON.'))
      }
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file.'))
    }
    reader.readAsText(file)
  })
}
