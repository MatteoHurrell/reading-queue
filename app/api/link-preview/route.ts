import { NextResponse } from 'next/server'
import { extractJsonLdImage, type LinkPreviewResult } from '@/lib/link-preview'
import { isSafeRemoteUrl } from '@/lib/remote-url'

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

function decodeHtmlEntities(raw: string): string {
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function extractMeta(
  html: string,
  kind: 'property' | 'name',
  key: string
): string | undefined {
  const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [
    new RegExp(
      `<meta[^>]*\\s${kind}=["']${esc}["'][^>]*content=["']([^"']*)["']`,
      'i'
    ),
    new RegExp(
      `<meta[^>]*content=["']([^"']*)["'][^>]*\\s${kind}=["']${esc}["']`,
      'i'
    ),
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m?.[1]?.trim()) return decodeHtmlEntities(m[1].trim())
  }
  return undefined
}

function extractTitleTag(html: string): string | undefined {
  const m = html.match(/<title[^>]*>([^<]{1,500})<\/title>/i)
  if (m?.[1]?.trim()) return decodeHtmlEntities(m[1].trim())
  return undefined
}

function normalizeImageUrl(baseUrl: string, image: string | undefined): string | undefined {
  if (!image?.trim()) return undefined
  const trimmed = image.trim()
  try {
    return new URL(trimmed, baseUrl).href
  } catch {
    return undefined
  }
}

function extractLinkRelImageSrc(html: string): string | undefined {
  const m =
    html.match(/<link[^>]+\srel=["']image_src["'][^>]*\shref=["']([^"']+)["']/i) ||
    html.match(/<link[^>]*\shref=["']([^"']+)["'][^>]*\srel=["']image_src["']/i)
  const href = m?.[1]?.trim()
  return href || undefined
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get('url')
  if (!raw?.trim()) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  let pageUrl: URL
  try {
    pageUrl = new URL(raw.trim())
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (!isSafeRemoteUrl(pageUrl)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 400 })
  }

  try {
    const res = await fetch(pageUrl.href, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(14_000),
    })

    if (!res.ok) {
      const body: LinkPreviewResult = { partial: true }
      return NextResponse.json(body)
    }

    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('text/html') && !ct.includes('application/xhtml')) {
      const body: LinkPreviewResult = { partial: true }
      return NextResponse.json(body)
    }

    const text = await res.text()
    const html = text.slice(0, 600_000)

    const ogImage =
      extractMeta(html, 'property', 'og:image:secure_url') ||
      extractMeta(html, 'property', 'og:image') ||
      extractMeta(html, 'name', 'twitter:image') ||
      extractMeta(html, 'name', 'twitter:image:src') ||
      extractMeta(html, 'name', 'twitter:image0')

    const ldImage = extractJsonLdImage(html)
    const linkImage = extractLinkRelImageSrc(html)

    const title =
      extractMeta(html, 'property', 'og:title') ||
      extractMeta(html, 'name', 'twitter:title') ||
      extractTitleTag(html)

    const description =
      extractMeta(html, 'property', 'og:description') ||
      extractMeta(html, 'name', 'twitter:description') ||
      extractMeta(html, 'name', 'description')

    const siteName =
      extractMeta(html, 'property', 'og:site_name') ||
      extractMeta(html, 'name', 'application-name')

    const imageUrl =
      normalizeImageUrl(pageUrl.href, ogImage) ||
      normalizeImageUrl(pageUrl.href, ldImage) ||
      normalizeImageUrl(pageUrl.href, linkImage)

    const partial = !title && !description && !imageUrl

    const body: LinkPreviewResult = {
      title: title || undefined,
      description: description || undefined,
      imageUrl,
      siteName: siteName || undefined,
      partial,
    }

    return NextResponse.json(body)
  } catch {
    const body: LinkPreviewResult = { partial: true }
    return NextResponse.json(body)
  }
}
