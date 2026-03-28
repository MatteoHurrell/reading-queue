'use client'

import { useState, useEffect } from 'react'
import { loadData, saveData } from '@/lib/storage'
import { DEMO_ITEMS } from '@/data/demo-data'
import type { ReadingItem, ReadingStatus } from '@/lib/types'

export function useReadingItems() {
  const [items, setItems] = useState<ReadingItem[]>([])

  useEffect(() => {
    setItems(loadData())
  }, [])

  function addItem(data: Omit<ReadingItem, 'id' | 'createdAt' | 'updatedAt'>): void {
    const now = new Date().toISOString()
    const newItem: ReadingItem = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    setItems((prev) => {
      const next = [newItem, ...prev]
      saveData(next)
      return next
    })
  }

  function updateItem(id: string, changes: Partial<ReadingItem>): void {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id
          ? { ...item, ...changes, updatedAt: new Date().toISOString() }
          : item
      )
      saveData(next)
      return next
    })
  }

  function deleteItem(id: string): void {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id)
      saveData(next)
      return next
    })
  }

  function transitionStatus(id: string, newStatus: ReadingStatus): void {
    const now = new Date().toISOString()
    const timestampField: Partial<Record<ReadingStatus, keyof ReadingItem>> = {
      queued: 'queuedAt',
      reading: 'startedAt',
      finished: 'finishedAt',
      archived: 'archivedAt',
      dropped: 'droppedAt',
    }
    const field = timestampField[newStatus]
    const extra: Partial<ReadingItem> = field ? { [field]: now } : {}
    updateItem(id, { status: newStatus, ...extra })
  }

  function toggleFavorite(id: string): void {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id
          ? { ...item, isFavorite: !item.isFavorite, updatedAt: new Date().toISOString() }
          : item
      )
      saveData(next)
      return next
    })
  }

  function resetToDemo(): void {
    setItems(DEMO_ITEMS)
    saveData(DEMO_ITEMS)
  }

  function replaceItems(newItems: ReadingItem[]): void {
    setItems(newItems)
    saveData(newItems)
  }

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    transitionStatus,
    toggleFavorite,
    resetToDemo,
    replaceItems,
  }
}
