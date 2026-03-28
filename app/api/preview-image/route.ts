import { NextResponse } from 'next/server'
import { isSafeRemoteUrl } from '@/lib/remote-url'

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const MAX_BYTES = 4 * 1024 * 1024

function isAllowedImageType(ct: string): boolean {
  const base = ct.split(';')[0]?.trim().toLowerCase() ?? ''
  if (!base.startsWith('image/')) return false
  if (base === 'image/svg+xml') return false
  return true
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('url')
  if (!raw?.trim()) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  let imageUrl: URL
  try {
    imageUrl = new URL(raw.trim())
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (!isSafeRemoteUrl(imageUrl)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 400 })
  }

  try {
    const origin = `${imageUrl.protocol}//${imageUrl.host}`
    const res = await fetch(imageUrl.href, {
      headers: {
        'User-Agent': UA,
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        Referer: `${origin}/`,
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(25_000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Image fetch failed' }, { status: 502 })
    }

    const cl = res.headers.get('content-length')
    if (cl && Number(cl) > MAX_BYTES) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 })
    }

    const contentType = res.headers.get('content-type') ?? ''
    const baseType = contentType.split(';')[0]?.trim().toLowerCase() ?? ''
    if (!isAllowedImageType(baseType)) {
      return NextResponse.json({ error: 'Not an image' }, { status: 415 })
    }

    const buf = await res.arrayBuffer()
    if (buf.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 })
    }

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': baseType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Image fetch failed' }, { status: 502 })
  }
}
