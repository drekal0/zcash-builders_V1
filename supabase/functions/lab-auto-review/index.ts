// Supabase Edge Function: lab-auto-review
// -----------------------------------------------------------------------------
// Phase-1 automatic lab review. A student (or the app on their behalf) calls this
// with { submission_id } right after submitting a lab. The function:
//   1. identifies the caller from their JWT and confirms they own the submission;
//   2. confirms the student's cohort is in 'auto' mode and the lab is still pending;
//   3. performs a basic reachability check on the submission URL (a GET that
//      follows redirects; GitHub/GitLab links must point at an actual repo);
//   4. records the decision through the apply_lab_auto_review() RPC, which runs
//      with the service role and is the only path allowed to approve + award XP.
// Richer auto-grading (tests, rubrics) is a later phase.
//
// Deno runtime. Env SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by
// the platform. Deploy with:  supabase functions deploy lab-auto-review
// (or the Supabase MCP deploy_edge_function tool).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

// Fetch with a hard timeout so a slow URL can't hang the function.
async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal })
  } finally {
    clearTimeout(t)
  }
}

// Basic validity / reachability check. Returns { passed, detail }.
async function checkUrl(raw: string): Promise<{ passed: boolean; detail: string }> {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return { passed: false, detail: 'The submission is not a valid URL.' }
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    return { passed: false, detail: 'The submission must be an http(s) URL.' }
  }

  // GitHub (and GitLab) repo URLs must point at an actual repository, not just a
  // user/org. We verify by fetching the repo's public page — a public repo
  // returns 200, a missing or private one returns 404. Using the page rather
  // than the API avoids the 60-requests/hour unauthenticated API rate limit.
  const isRepoHost = u.hostname === 'github.com' || u.hostname === 'www.github.com' || u.hostname === 'gitlab.com'
  if (isRepoHost) {
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length < 2) {
      return { passed: false, detail: 'That link points to a profile, not a repository.' }
    }
  }

  // Fetch the URL (follows redirects). Pass when it responds OK.
  try {
    const res = await fetchWithTimeout(
      raw,
      { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'zcash-builders-auto-review' } },
      8000,
    )
    if (res.ok) return { passed: true, detail: `Auto-approved: the submission is reachable (HTTP ${res.status}).` }
    if (res.status === 404 && isRepoHost) {
      return { passed: false, detail: 'The repository was not found — is it private? A mentor will review it.' }
    }
    return { passed: false, detail: `The link responded with HTTP ${res.status}. A mentor will review it.` }
  } catch {
    return { passed: false, detail: 'The link did not resolve. A mentor will review it.' }
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ ok: false, message: 'Use POST' }, 405)

  const url = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const authHeader = req.headers.get('Authorization') ?? ''

  // Identify the caller from their JWT (anon client scoped to their token).
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY') ?? serviceKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user } } = await asUser.auth.getUser()
  if (!user) return json({ ok: false, message: 'Not signed in' }, 401)

  let submissionId: string
  try {
    const body = await req.json()
    submissionId = String(body.submission_id ?? '')
  } catch {
    return json({ ok: false, message: 'Expected JSON { submission_id }' }, 400)
  }
  if (!submissionId) return json({ ok: false, message: 'Missing submission_id' }, 400)

  // Service-role client for the privileged reads/writes.
  const admin = createClient(url, serviceKey)

  const { data: sub, error: subErr } = await admin
    .from('lab_submissions')
    .select('id, user_id, submission_url, status')
    .eq('id', submissionId)
    .maybeSingle()
  if (subErr || !sub) return json({ ok: false, message: 'Submission not found' }, 404)

  // The caller must own the submission.
  if (sub.user_id !== user.id) return json({ ok: false, message: 'Not your submission' }, 403)
  if (sub.status === 'approved') return json({ ok: true, already: true, status: sub.status })

  const check = await checkUrl(sub.submission_url ?? '')

  const { data: result, error: rpcErr } = await admin.rpc('apply_lab_auto_review', {
    p_submission_id: submissionId,
    p_passed: check.passed,
    p_detail: check.detail,
  })
  if (rpcErr) return json({ ok: false, message: rpcErr.message }, 500)

  return json({ ok: true, passed: check.passed, detail: check.detail, result })
})
