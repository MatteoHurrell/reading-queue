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
