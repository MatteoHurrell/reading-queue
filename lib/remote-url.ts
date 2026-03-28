/** Block SSRF / internal network fetches for URL-based API routes. */
export function isSafeRemoteUrl(url: string | URL): boolean {
  let u: URL
  try {
    u = typeof url === 'string' ? new URL(url) : url
  } catch {
    return false
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
  const host = u.hostname.toLowerCase()
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local')
  ) {
    return false
  }
  if (host === '169.254.169.254') return false
  if (host.startsWith('10.')) return false
  if (host.startsWith('192.168.')) return false
  const m = /^172\.(\d+)\./.exec(host)
  if (m) {
    const second = Number(m[1])
    if (second >= 16 && second <= 31) return false
  }
  return true
}
