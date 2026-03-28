/**
 * Shared types for URL preview metadata (Open Graph / Twitter cards).
 * Fetched server-side via /api/link-preview.
 */

export interface LinkPreviewResult {
  title?: string
  description?: string
  imageUrl?: string
  siteName?: string
  /** When the page did not expose usable metadata */
  partial: boolean
}

export function isLikelySocialThreadUrl(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url)
    const h = hostname.replace(/^www\./, '').toLowerCase()
    if (h !== 'x.com' && h !== 'twitter.com') return false
    return /\/\w+\/status\/\d+/.test(pathname)
  } catch {
    return false
  }
}

/** Readable label when Open Graph or the HTML title tag could not be fetched */
export function deriveTitleFromUrl(url: string): string {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./i, '') || 'Bookmark'
    const segments = u.pathname.split('/').filter(Boolean)
    const slug = segments.length ? segments[segments.length - 1] : ''
    const base = slug
      ? decodeURIComponent(slug.replace(/\.(html?|php|aspx?)$/i, ''))
          .replace(/[-_+]/g, ' ')
          .trim()
      : ''
    if (base.length >= 2) {
      const title = base.length <= 120 ? base : `${base.slice(0, 117)}…`
      return title.replace(/\s+/g, ' ')
    }
    return host
  } catch {
    return 'Bookmark'
  }
}

export function derivePublisherFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '') || 'Other'
  } catch {
    return 'Other'
  }
}

/** First absolute image URL from JSON-LD blocks (NewsArticle, etc.). */
export function extractJsonLdImage(html: string): string | undefined {
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim()
    if (!raw) continue
    try {
      const data = JSON.parse(raw) as unknown
      const found = pickImageFromLdValue(data)
      if (found) return found
    } catch {
      continue
    }
  }
  return undefined
}

function pickImageFromLdValue(val: unknown): string | undefined {
  if (!val || typeof val !== 'object') return undefined
  if (Array.isArray(val)) {
    for (const item of val) {
      const x = pickImageFromLdValue(item)
      if (x) return x
    }
    return undefined
  }
  const o = val as Record<string, unknown>
  if (Array.isArray(o['@graph'])) {
    for (const item of o['@graph']) {
      const x = pickImageFromLdValue(item)
      if (x) return x
    }
  }
  return normalizeLdImageField(o.image)
}

function normalizeLdImageField(image: unknown): string | undefined {
  if (typeof image === 'string' && /^https?:\/\//i.test(image)) return image
  if (Array.isArray(image)) {
    for (const item of image) {
      const x = normalizeLdImageField(item)
      if (x) return x
    }
    return undefined
  }
  if (image && typeof image === 'object' && 'url' in image) {
    const u = (image as { url: unknown }).url
    if (typeof u === 'string' && /^https?:\/\//i.test(u)) return u
  }
  return undefined
}
