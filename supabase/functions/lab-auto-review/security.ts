const ALLOWED_HOSTS = new Set(['github.com', 'www.github.com', 'gitlab.com'])

export const MAX_REDIRECTS = 3
export const MAX_RESPONSE_BYTES = 64 * 1024
export const CHECK_TIMEOUT_MS = 8_000
export const MAX_URL_LENGTH = 2_048

type DnsRecordType = 'A' | 'AAAA'
export type DnsResolver = (
  hostname: string,
  recordType: DnsRecordType,
  signal: AbortSignal,
) => Promise<string[]>

export type DestinationCheck =
  | { ok: true; url: URL }
  | { ok: false; detail: string }

export type UrlCheck =
  | { decision: 'approve' | 'reject'; detail: string }
  | { decision: 'manual'; detail: string }

const systemDnsResolver: DnsResolver = (hostname, recordType, signal) =>
  Deno.resolveDns(hostname, recordType, { signal })

export function parseAllowedUrl(raw: string): DestinationCheck {
  if (raw.length > MAX_URL_LENGTH) {
    return { ok: false, detail: 'The repository URL is too long to check automatically.' }
  }

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return { ok: false, detail: 'The submission is not a valid URL.' }
  }

  if (url.protocol !== 'https:') {
    return { ok: false, detail: 'Automatic review only checks HTTPS repository links.' }
  }
  if (url.username || url.password) {
    return { ok: false, detail: 'Repository links cannot contain credentials.' }
  }
  if (url.port && url.port !== '443') {
    return { ok: false, detail: 'Repository links must use the standard HTTPS port.' }
  }
  if (!ALLOWED_HOSTS.has(url.hostname)) {
    return { ok: false, detail: 'This host is not supported for automatic review.' }
  }

  const pathParts = url.pathname.split('/').filter(Boolean)
  if (pathParts.length < 2) {
    return { ok: false, detail: 'That link points to a profile, not a repository.' }
  }

  return { ok: true, url }
}

export async function validateDestination(
  candidate: string | URL,
  signal: AbortSignal,
  resolver: DnsResolver = systemDnsResolver,
): Promise<DestinationCheck> {
  const parsed = parseAllowedUrl(String(candidate))
  if (!parsed.ok) return parsed

  const answers = await Promise.allSettled([
    resolver(parsed.url.hostname, 'A', signal),
    resolver(parsed.url.hostname, 'AAAA', signal),
  ])

  const addresses: string[] = []
  for (const answer of answers) {
    if (answer.status === 'fulfilled') {
      addresses.push(...answer.value)
      continue
    }

    // A hostname can be IPv4-only or IPv6-only. A missing record family is
    // harmless; timeouts and other resolver errors make the destination unsafe.
    if (!isMissingDnsRecord(answer.reason)) {
      return { ok: false, detail: 'The destination could not be checked safely.' }
    }
  }

  if (addresses.length === 0 || addresses.some(address => !isPublicIp(address))) {
    return { ok: false, detail: 'The destination did not resolve exclusively to public addresses.' }
  }

  return parsed
}

export async function checkUrl(
  raw: string,
  resolver: DnsResolver = systemDnsResolver,
  fetcher: typeof fetch = fetch,
): Promise<UrlCheck> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS)
  let current = raw

  try {
    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
      const destination = await validateDestination(current, controller.signal, resolver)
      if (!destination.ok) return { decision: 'manual', detail: `${destination.detail} A mentor will review it.` }

      const response = await fetcher(destination.url, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'zcash-builders-auto-review',
          Range: `bytes=0-${MAX_RESPONSE_BYTES - 1}`,
        },
      })

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('Location')
        await response.body?.cancel()
        if (!location || redirectCount === MAX_REDIRECTS) {
          return { decision: 'manual', detail: 'The redirect could not be checked safely. A mentor will review it.' }
        }
        current = new URL(location, destination.url).toString()
        continue
      }

      if (response.ok) {
        const contentLength = Number(response.headers.get('Content-Length') ?? 0)
        if (contentLength > MAX_RESPONSE_BYTES) {
          await response.body?.cancel()
          return { decision: 'manual', detail: 'The response is too large to check automatically. A mentor will review it.' }
        }

        const withinLimit = await consumeBoundedResponse(response, MAX_RESPONSE_BYTES)
        if (!withinLimit) {
          return { decision: 'manual', detail: 'The response is too large to check automatically. A mentor will review it.' }
        }
        return { decision: 'approve', detail: `Auto-approved: the repository is reachable (HTTP ${response.status}).` }
      }

      await response.body?.cancel()
      const detail = response.status === 404
        ? 'The repository was not found — is it private? A mentor will review it.'
        : `The link responded with HTTP ${response.status}. A mentor will review it.`
      return { decision: 'reject', detail }
    }
  } catch {
    return { decision: 'manual', detail: 'The destination could not be checked safely. A mentor will review it.' }
  } finally {
    clearTimeout(timeout)
  }

  return { decision: 'manual', detail: 'The redirect limit was reached. A mentor will review it.' }
}

async function consumeBoundedResponse(response: Response, maxBytes: number): Promise<boolean> {
  if (!response.body) return true
  const reader = response.body.getReader()
  let bytesRead = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) return true
      bytesRead += value.byteLength
      if (bytesRead > maxBytes) {
        await reader.cancel()
        return false
      }
    }
  } finally {
    reader.releaseLock()
  }
}

function isMissingDnsRecord(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { name?: string; code?: string }
  return candidate.name === 'NotFound' || candidate.code === 'ENODATA' || candidate.code === 'ENOTFOUND'
}

export function isPublicIp(address: string): boolean {
  if (address.includes('.') && !address.includes(':')) return isPublicIpv4(address)
  const groups = parseIpv6(address)
  if (!groups) return false

  // IPv4-mapped IPv6 addresses must pass the IPv4 checks too.
  if (groups.slice(0, 5).every(group => group === 0) && groups[5] === 0xffff) {
    return isPublicIpv4(`${groups[6] >> 8}.${groups[6] & 0xff}.${groups[7] >> 8}.${groups[7] & 0xff}`)
  }

  // Permit only global unicast (2000::/3); this excludes loopback, unspecified,
  // unique-local, link-local, multicast, and IPv4-compatible addresses.
  if (groups[0] < 0x2000 || groups[0] > 0x3fff) return false

  // Exclude special-purpose and documentation ranges inside global unicast.
  if (groups[0] === 0x2001 && (groups[1] <= 0x01ff || groups[1] === 0x0db8)) return false
  if (groups[0] === 0x2002) return false // 6to4 embeds an IPv4 destination.
  return true
}

function isPublicIpv4(address: string): boolean {
  const parts = address.split('.').map(Number)
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return false
  const [a, b, c] = parts

  if (a === 0 || a === 10 || a === 127 || a >= 224) return false
  if (a === 100 && b >= 64 && b <= 127) return false // shared address space
  if (a === 169 && b === 254) return false // link-local, including metadata endpoints
  if (a === 172 && b >= 16 && b <= 31) return false
  if (a === 192 && b === 168) return false
  if (a === 192 && b === 0 && c === 0) return false
  if (a === 192 && b === 0 && c === 2) return false
  if (a === 192 && b === 88 && c === 99) return false
  if (a === 198 && (b === 18 || b === 19)) return false
  if (a === 198 && b === 51 && c === 100) return false
  if (a === 203 && b === 0 && c === 113) return false
  return true
}

function parseIpv6(address: string): number[] | null {
  const normalized = address.toLowerCase()
  if (!normalized.includes(':') || normalized.includes('%')) return null

  const halves = normalized.split('::')
  if (halves.length > 2) return null
  if (halves.length === 2 && halves[0].includes('.')) return null

  const parseSide = (side: string): number[] | null => {
    if (!side) return []
    const parts = side.split(':')
    const groups: number[] = []
    for (let index = 0; index < parts.length; index++) {
      const part = parts[index]
      if (part.includes('.')) {
        if (index !== parts.length - 1) return null
        const ipv4 = part.split('.').map(Number)
        if (ipv4.length !== 4 || ipv4.some(value => !Number.isInteger(value) || value < 0 || value > 255)) return null
        groups.push((ipv4[0] << 8) | ipv4[1], (ipv4[2] << 8) | ipv4[3])
        continue
      }
      if (!/^[0-9a-f]{1,4}$/.test(part)) return null
      groups.push(parseInt(part, 16))
    }
    return groups
  }

  const left = parseSide(halves[0])
  const right = parseSide(halves[1] ?? '')
  if (!left || !right) return null

  if (halves.length === 1) return left.length === 8 ? left : null
  const missing = 8 - left.length - right.length
  if (missing < 1) return null
  return [...left, ...Array(missing).fill(0), ...right]
}
