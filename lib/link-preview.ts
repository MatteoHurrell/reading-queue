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
