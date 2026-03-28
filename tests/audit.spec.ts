import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots')

async function shot(page: any, name: string) {
  const p = path.join(SCREENSHOT_DIR, `${name}.png`)
  await page.screenshot({ path: p, fullPage: true })
  return p
}

// Seed localStorage with demo data before each test
async function seedDemoData(page: any) {
  await page.goto('/')
  await page.evaluate(() => {
    const demoItems = [
      {
        id: 'demo-1',
        title: 'The Everything Bubble and What Comes Next',
        url: 'https://bloomberg.com/everything-bubble',
        publisher: 'Bloomberg',
        author: 'John Authers',
        sourceType: 'newspaper',
        topic: 'markets',
        tags: [],
        priority: 'high',
        estimatedMinutes: 12,
        status: 'queued',
        isFavorite: false,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        queuedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 'demo-2',
        title: 'Money Stuff: The Banker Who Knew Too Much',
        url: 'https://bloomberg.com/matt-levine-banker',
        publisher: 'Matt Levine',
        author: 'Matt Levine',
        sourceType: 'newsletter',
        topic: 'finance-business',
        tags: [],
        priority: 'high',
        estimatedMinutes: 6,
        status: 'inbox',
        isFavorite: false,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'demo-3',
        title: 'How AI is Rewiring the Hedge Fund Industry',
        url: 'https://ft.com/ai-hedge-funds',
        publisher: 'Financial Times',
        sourceType: 'newspaper',
        topic: 'tech-product',
        tags: [],
        priority: 'medium',
        estimatedMinutes: 8,
        status: 'reading',
        isFavorite: true,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        startedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: 'demo-4',
        title: 'The Slow Death of the Office',
        url: 'https://economist.com/office-death',
        publisher: 'The Economist',
        sourceType: 'magazine',
        topic: 'economics',
        tags: [],
        priority: 'low',
        estimatedMinutes: 5,
        status: 'queued',
        isFavorite: false,
        createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
        queuedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
      },
      {
        id: 'demo-5',
        title: 'Thread: Why every rate cut is now a political event',
        url: 'https://twitter.com/thread/rate-cuts-politics',
        publisher: 'X / Twitter',
        sourceType: 'thread',
        topic: 'politics-policy',
        tags: [],
        priority: 'medium',
        estimatedMinutes: 4,
        status: 'finished',
        isFavorite: true,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        finishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'demo-6',
        title: 'Why Startups Fail: A Founder\'s Honest Retrospective',
        url: 'https://substack.com/startups-fail',
        publisher: 'Substack',
        sourceType: 'newsletter',
        topic: 'career-learning',
        tags: [],
        priority: 'medium',
        estimatedMinutes: 15,
        status: 'queued',
        isFavorite: false,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        queuedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
    ]
    localStorage.setItem('reading-queue-data', JSON.stringify({ version: 1, items: demoItems }))
  })
  await page.reload()
  await page.waitForTimeout(500)
}

test.describe('Page-by-page UI audit', () => {

  test('Dashboard', async ({ page }) => {
    await seedDemoData(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    await shot(page, '01-dashboard')

    // Scroll to see full page
    await page.evaluate(() => window.scrollTo(0, 300))
    await page.waitForTimeout(300)
    await shot(page, '01-dashboard-scrolled')
  })

  test('Legacy inbox and queue URLs redirect to bookmarks', async ({ page }) => {
    await page.goto('/inbox')
    await page.waitForURL('**/')
    expect(page.url()).toMatch(/\/$/)

    await page.goto('/queue')
    await page.waitForURL('**/')
    expect(page.url()).toMatch(/\/$/)
  })

  test('Library', async ({ page }) => {
    await seedDemoData(page)
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    await shot(page, '04-library')
  })

  test('Insights', async ({ page }) => {
    await seedDemoData(page)
    await page.goto('/insights')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1200)
    await shot(page, '05-insights')

    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitForTimeout(300)
    await shot(page, '05-insights-scrolled')
  })

  test('Settings', async ({ page }) => {
    await seedDemoData(page)
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    await shot(page, '06-settings')
  })

  test('Quick Add Modal', async ({ page }) => {
    await seedDemoData(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Open quick add (icon-only control; name includes "Add")
    const addBtn = page.getByRole('button', { name: /add article manually/i })
    await addBtn.click()
    await page.getByRole('dialog').waitFor({ state: 'visible' })
    await page.waitForTimeout(300)
    await shot(page, '07-quick-add-modal-empty')

    const urlInput = page.getByPlaceholder('URL')

    // Fill in URL to trigger duplicate check
    await urlInput.fill('https://bloomberg.com/everything-bubble')
    await page.waitForTimeout(400)
    await shot(page, '07-quick-add-modal-duplicate-warning')

    // Clear and fill URL only — title is resolved via /api/link-preview
    await urlInput.fill('https://example.com')
    await page.waitForResponse(
      (r) => r.url().includes('/api/link-preview') && r.ok(),
      { timeout: 15_000 }
    )
    await page.waitForTimeout(300)
    await shot(page, '07-quick-add-modal-filled')
  })

  test('Mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await seedDemoData(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    await shot(page, '08-mobile-dashboard')

    await page.goto('/library')
    await page.waitForTimeout(600)
    await shot(page, '08-mobile-archive')
  })

})
