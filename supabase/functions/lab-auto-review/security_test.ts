import {
  checkUrl,
  isPublicIp,
  MAX_RESPONSE_BYTES,
  parseAllowedUrl,
  validateDestination,
  type DnsResolver,
} from './security.ts'

const signal = () => new AbortController().signal
const publicResolver: DnsResolver = async (_hostname, type) =>
  type === 'A' ? ['140.82.121.4'] : Promise.reject(Object.assign(new Error('no AAAA record'), { name: 'NotFound' }))

Deno.test('only allows HTTPS links to supported repository hosts', () => {
  if (!parseAllowedUrl('https://github.com/zcash/zcash').ok) throw new Error('expected GitHub repository URL to pass')
  if (!parseAllowedUrl('https://gitlab.com/zcash/zcash').ok) throw new Error('expected GitLab repository URL to pass')
  for (const url of [
    'http://github.com/zcash/zcash',
    'https://github.com.evil.example/zcash/zcash',
    'https://github.com@127.0.0.1/zcash/zcash',
    'https://github.com:8443/zcash/zcash',
    'https://github.com/zcash',
    'https://127.0.0.1/zcash/zcash',
  ]) {
    if (parseAllowedUrl(url).ok) throw new Error(`unexpectedly allowed ${url}`)
  }
})

Deno.test('rejects non-public IPv4 and IPv6 ranges', () => {
  for (const address of [
    '0.0.0.0', '10.1.2.3', '100.64.0.1', '127.0.0.1', '169.254.169.254',
    '172.16.0.1', '192.168.1.1', '198.18.0.1', '224.0.0.1',
    '::', '::1', 'fc00::1', 'fe80::1', 'ff02::1', '2001:db8::1',
    '::ffff:127.0.0.1',
  ]) {
    if (isPublicIp(address)) throw new Error(`unexpectedly allowed ${address}`)
  }
  if (!isPublicIp('140.82.121.4')) throw new Error('expected public IPv4 to pass')
  if (!isPublicIp('2606:4700:90:0:f22e:fbec:5bed:a9b9')) throw new Error('expected public IPv6 to pass')
})

Deno.test('requires all returned DNS answers to be public', async () => {
  const unsafeResolver: DnsResolver = async (_hostname, type) =>
    type === 'A' ? ['140.82.121.4', '10.0.0.8'] : Promise.reject(Object.assign(new Error('no AAAA record'), { name: 'NotFound' }))
  const result = await validateDestination('https://github.com/zcash/zcash', signal(), unsafeResolver)
  if (result.ok) throw new Error('expected mixed public/private DNS answers to fail closed')

  const safe = await validateDestination('https://github.com/zcash/zcash', signal(), publicResolver)
  if (!safe.ok) throw new Error(`expected public DNS answers to pass: ${safe.detail}`)
})

Deno.test('fails closed when DNS cannot be checked', async () => {
  const failingResolver: DnsResolver = async () => { throw new Error('resolver timeout') }
  const result = await validateDestination('https://github.com/zcash/zcash', signal(), failingResolver)
  if (result.ok) throw new Error('expected resolver failure to fail closed')
})

Deno.test('revalidates redirect targets before fetching them', async () => {
  let requests = 0
  const fetcher: typeof fetch = async () => {
    requests++
    return new Response(null, { status: 302, headers: { Location: 'https://attacker.example/private' } })
  }
  const result = await checkUrl('https://github.com/zcash/zcash', publicResolver, fetcher)
  if (result.decision !== 'manual') throw new Error('expected unapproved redirect to require mentor review')
  if (requests !== 1) throw new Error('unexpectedly fetched the unapproved redirect target')
})

Deno.test('follows only validated redirects and caps the redirect count', async () => {
  let requests = 0
  const fetcher: typeof fetch = async () => {
    requests++
    if (requests === 1) return new Response(null, { status: 302, headers: { Location: 'https://www.github.com/zcash/zcash' } })
    return new Response('ok', { status: 200 })
  }
  const result = await checkUrl('https://github.com/zcash/zcash', publicResolver, fetcher)
  if (result.decision !== 'approve' || requests !== 2) throw new Error('expected one checked redirect and a reachable repository')

  let redirectRequests = 0
  const redirectLoop: typeof fetch = async input => {
    redirectRequests++
    const current = new URL(String(input))
    return new Response(null, { status: 302, headers: { Location: `/zcash/zcash?hop=${redirectRequests}` } })
  }
  const loopResult = await checkUrl('https://github.com/zcash/zcash', publicResolver, redirectLoop)
  if (loopResult.decision !== 'manual' || redirectRequests !== 4) {
    throw new Error('expected the redirect limit to stop after three redirects')
  }
})

Deno.test('sends a response range and refuses oversized responses', async () => {
  let sawRange = false
  const fetcher: typeof fetch = async (_input, init) => {
    sawRange = new Headers(init?.headers).get('Range') === `bytes=0-${MAX_RESPONSE_BYTES - 1}`
    return new Response(null, {
      status: 200,
      headers: { 'Content-Length': String(MAX_RESPONSE_BYTES + 1) },
    })
  }
  const result = await checkUrl('https://github.com/zcash/zcash', publicResolver, fetcher)
  if (result.decision !== 'manual' || !sawRange) throw new Error('expected oversized body to fall back to mentor review')

  const streamedBody = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(MAX_RESPONSE_BYTES + 1))
      controller.close()
    },
  })
  const streamResult = await checkUrl(
    'https://github.com/zcash/zcash',
    publicResolver,
    async () => new Response(streamedBody, { status: 200 }),
  )
  if (streamResult.decision !== 'manual') throw new Error('expected the streamed response byte cap to be enforced')
})
