// Supabase Edge Function: lab-auto-review
// -----------------------------------------------------------------------------
// Phase-1 automatic lab review. A student (or the app on their behalf) calls this
// with { submission_id } right after submitting a lab. The function:
//   1. identifies the caller from their JWT and confirms they own the submission;
//   2. confirms the student's cohort is in 'auto' mode and the lab is still pending;
//   3. checks supported GitHub/GitLab repository links with bounded requests;
//      unsafe or unsupported links stay submitted for mentor review;
//   4. records the decision through the apply_lab_auto_review() RPC, which runs
//      with the service role and is the only path allowed to approve + award XP.
// Richer auto-grading (tests, rubrics) is a later phase.
//
// Deno runtime. Env SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by
// the platform. Deploy with:  supabase functions deploy lab-auto-review
// (or the Supabase MCP deploy_edge_function tool).

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { checkUrl } from './security.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

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

  // Unsafe or unsupported destinations stay in the existing submitted state,
  // which is the manual mentor-review queue. Do not turn an inconclusive safety
  // check into a revision request or an automatic approval.
  if (check.decision === 'manual') {
    return json({ ok: true, passed: false, manualReview: true, detail: check.detail })
  }

  const { data: result, error: rpcErr } = await admin.rpc('apply_lab_auto_review', {
    p_submission_id: submissionId,
    p_passed: check.decision === 'approve',
    p_detail: check.detail,
  })
  if (rpcErr) return json({ ok: false, message: rpcErr.message }, 500)

  return json({ ok: true, passed: check.decision === 'approve', detail: check.detail, result })
})
