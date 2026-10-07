'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/nav/Sidebar'
import type { Profile, LabSubmission, LabStatus } from '@/types'
import { STAGE_META } from '@/lib/design-tokens'
import { ALL_LESSONS, LESSON_MAP, type LessonMeta } from '@/lib/curriculum/lessons'
import { STAGE_MODULES, TOTAL_LABS, type LabMeta } from '@/lib/curriculum/outline'
import { isPublished } from '@/lib/curriculum/lessons'

// ── curriculum ────────────────────────────────────────────────
// Stage → module → lessons, built from the programme outline (outline.ts).
// Each module ("week" row) carries its lessons and the lab that closes it. A
// lesson with no published content yet is shown as coming soon.
const STAGES = STAGE_META.map(meta => {
  const weeks = (STAGE_MODULES[meta.id] ?? []).map(m => ({
    week: m.week,
    title: m.title,
    lessons: m.lessons.filter(l => isPublished(l.id)).map(l => LESSON_MAP.get(l.id)!) as LessonMeta[],
    labs: m.lab ? [m.lab] : [],
  }))
  return { ...meta, weekRange: meta.weeks, weeks, lessons: weeks.flatMap(w => w.lessons) }
})

// Stage colours are CSS variables, so alpha has to go through color-mix
const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`

// ── lesson row ────────────────────────────────────────────────
function LessonRow({ lesson, completed, isNext, accent }: {
  lesson: LessonMeta; completed: boolean; isNext: boolean; accent: string
}) {
  return (
    <Link href={`/learn/${lesson.id}`} className="dash-lesson-row"
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none' }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `1.5px solid ${completed ? 'var(--success)' : isNext ? accent : 'var(--line-2)'}`, background: completed ? 'var(--success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
      </div>
      <span style={{ flex: 1, minWidth: 0, fontSize: '13px', color: completed ? 'var(--ink-4)' : 'var(--ink-2)', lineHeight: 1.4 }}>
        {lesson.title}
      </span>
      {isNext && (
        <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, flexShrink: 0 }}>Up next</span>
      )}
      <span className="dash-lesson-min" style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-5)', flexShrink: 0 }}>{lesson.duration} min</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: completed ? 'var(--success)' : 'var(--ink-5)', flexShrink: 0, minWidth: '52px', textAlign: 'right' }}>
        {completed ? '✓' : '+'}{lesson.xp} XP
      </span>
    </Link>
  )
}

// ── lab submission panel ──────────────────────────────────────
const LAB_STATUS: Record<LabStatus, { label: string; color: string }> = {
  submitted:          { label: 'Submitted',         color: 'var(--ink-3)' },
  under_review:       { label: 'Under review',      color: 'var(--gold)' },
  approved:           { label: 'Approved',          color: 'var(--success)' },
  revision_requested: { label: 'Changes requested', color: 'var(--danger)' },
}

const fieldStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line-2)', color: 'var(--ink)',
  padding: '9px 12px', borderRadius: '7px', fontSize: '12px', outline: 'none', boxSizing: 'border-box',
}

function LabPanel({ lab, stageColor, submission, onSubmit }: {
  lab: LabMeta
  stageColor: string
  submission: LabSubmission | null
  onSubmit: (lab: LabMeta, url: string, notes: string) => Promise<string | null>
}) {
  const [url,        setUrl]        = useState(submission?.submission_url || '')
  const [notes,      setNotes]      = useState(submission?.submission_notes || '')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const status = submission ? LAB_STATUS[submission.status] : null
  // A reviewer asking for changes reopens the form for a resubmission
  const canSubmit = !submission || submission.status === 'revision_requested'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setSubmitting(true)
    setError(await onSubmit(lab, url.trim(), notes.trim()))
    setSubmitting(false)
  }

  return (
    <div style={{ background: 'var(--bg-3)', border: `1px solid ${tint(stageColor, 25)}`, borderRadius: '10px', padding: '16px', marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: stageColor, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>
            Lab · +{lab.xp} XP on approval
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-2)' }}>{lab.title}</div>
        </div>
        {status && (
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: status.color, padding: '2px 8px', borderRadius: '100px', background: 'var(--bg-4)', border: `1px solid ${tint(status.color, 30)}`, flexShrink: 0, whiteSpace: 'nowrap' }}>
            {status.label}
          </span>
        )}
      </div>

      {submission?.feedback && (
        <div style={{ fontSize: '12px', color: 'var(--ink-3)', lineHeight: 1.5, padding: '10px 12px', background: 'var(--bg-2)', borderLeft: `2px solid ${status?.color}`, borderRadius: '4px', marginBottom: '10px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '4px' }}>Reviewer feedback</div>
          {submission.feedback}
        </div>
      )}

      {canSubmit ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://github.com/you/lab-repo" required
            aria-label={`Submission URL for ${lab.title}`}
            style={{ ...fieldStyle, fontFamily: 'var(--mono)' }}
            onFocus={e => e.target.style.borderColor = stageColor}
            onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
          />
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes for your reviewer (optional)…" rows={2}
            aria-label={`Notes for ${lab.title}`}
            style={{ ...fieldStyle, fontFamily: 'var(--sans)', resize: 'vertical' }}
            onFocus={e => e.target.style.borderColor = stageColor}
            onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
          />
          {error && <div role="alert" style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</div>}
          <button type="submit" disabled={submitting || !url.trim()}
            style={{ padding: '9px 16px', background: stageColor, color: '#000', fontWeight: 700, fontSize: '12px', border: 'none', borderRadius: '7px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting || !url.trim() ? 0.6 : 1, fontFamily: 'var(--sans)', alignSelf: 'flex-start' }}>
            {submitting ? 'Submitting…' : submission ? 'Resubmit for review' : 'Submit for review'}
          </button>
        </form>
      ) : submission && (
        <div>
          {submission.submission_url && (
            <a href={submission.submission_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--blue)', textDecoration: 'none', overflowWrap: 'anywhere' }}>
              {submission.submission_url}
            </a>
          )}
          {submission.submission_notes && <p style={{ fontSize: '12px', color: 'var(--ink-4)', marginTop: '8px', marginBottom: 0 }}>{submission.submission_notes}</p>}
          {submission.status === 'approved' && !!submission.xp_awarded && (
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--success)', marginTop: '8px', marginBottom: 0 }}>✓ {submission.xp_awarded} XP awarded</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const client = createClient()

  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [labSubs,      setLabSubs]      = useState<Record<string, LabSubmission>>({})
  const [openStages,   setOpenStages]   = useState<Set<string>>(new Set(['00']))

  useEffect(() => {
    if (!client) { router.push('/login'); return }
    let cancelled = false

    async function load() {
      if (!client) return
      const { data: { session } } = await client.auth.getSession()
      if (!session) { router.push('/login?next=/dashboard'); return }
      const userId = session.user.id

      const [profileRes, progressRes, labRes] = await Promise.all([
        client.from('profiles').select('*').eq('id', userId).single(),
        client.from('lesson_progress').select('lesson_id').eq('user_id', userId).eq('completed', true),
        client.from('lab_submissions').select('*').eq('user_id', userId),
      ])
      if (cancelled) return

      // Same gate as the lesson reader: lessons are for enrolled builders
      const p = profileRes.data as Profile | null
      if (!p || !p.cohort_id) { router.push('/portal'); return }
      setProfile(p)

      // Only count progress against lessons that exist in the library
      const done = new Set<string>(
        ((progressRes.data ?? []) as { lesson_id: string }[])
          .map(r => r.lesson_id)
          .filter(id => LESSON_MAP.has(id))
      )
      setCompletedIds(done)

      const subs: Record<string, LabSubmission> = {}
      ;((labRes.data ?? []) as LabSubmission[]).forEach(s => { subs[s.lab_id] = s })
      setLabSubs(subs)

      // Open the accordion where the student left off
      const resume = ALL_LESSONS.find(l => !done.has(l.id))
      if (resume) setOpenStages(new Set([resume.stage]))

      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // Returns an error message, or null on success
  async function submitLab(lab: LabMeta, stage: string, url: string, notes: string): Promise<string | null> {
    if (!client || !profile) return 'You need to be signed in to submit a lab.'
    const { data, error } = await client
      .from('lab_submissions')
      .upsert({
        user_id: profile.id,
        lab_id: lab.id,
        stage,
        submission_url: url,
        submission_notes: notes || null,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      }, { onConflict: 'user_id,lab_id' })
      .select()
      .single()
    if (error || !data) return 'Could not submit your lab — please try again.'
    setLabSubs(prev => ({ ...prev, [lab.id]: data as LabSubmission }))
    return null
  }

  function toggleStage(stageId: string) {
    setOpenStages(prev => {
      const next = new Set(prev)
      if (next.has(stageId)) next.delete(stageId)
      else next.add(stageId)
      return next
    })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '10px', color: 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: '12px' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 0.7s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Loading dashboard…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const totalLessons     = ALL_LESSONS.length
  const completedLessons = completedIds.size
  const overallPct       = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0
  const nextLesson       = ALL_LESSONS.find(l => !completedIds.has(l.id)) ?? null
  const nextAccent       = 'var(--gold)'

  return (
    <>
      <style>{`.dash-lesson-row{transition:background .12s}.dash-lesson-row:hover,.dash-lesson-row:focus-visible{background:var(--bg-3)}@media (max-width:520px){.dash-lesson-min{display:none}}@media (max-width:1024px){.dash-head{padding-top:40px}}`}</style>

      <Sidebar
        role={profile?.role || 'student'}
        userName={profile?.name || 'Builder'}
        userInitial={(profile?.name || 'ZB').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
        cohort={profile?.cohort_id || 'Cohort 01'}
      />

      <div className="page-with-nav">
      <div className="page-content" style={{ maxWidth: '800px' }}>

        {/* Header */}
        <div className="dash-head" style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>
            Learning Dashboard
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px,3vw,36px)', letterSpacing: '-0.025em', margin: '0 0 8px' }}>
            Your 8-week journey
          </h1>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)' }}>
            {completedLessons} / {totalLessons} lessons · {Object.keys(labSubs).length} / {TOTAL_LABS} labs submitted · {profile?.xp || 0} XP
          </div>
          <div style={{ height: '4px', background: 'var(--bg-4)', borderRadius: '2px', overflow: 'hidden', marginTop: '12px' }}>
            <div style={{ height: '100%', width: `${overallPct}%`, background: 'var(--gold)', borderRadius: '2px', transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Continue where you left off */}
        {nextLesson ? (
          <Link href={`/learn/${nextLesson.id}`}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', marginBottom: '24px', background: 'var(--bg-1)', border: `1px solid ${tint(nextAccent, 40)}`, borderRadius: '12px', textDecoration: 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: nextAccent, marginBottom: '4px' }}>
                {completedLessons === 0 ? 'Start here' : 'Continue'} · Stage {nextLesson.stage} · Week {nextLesson.week}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>{nextLesson.title}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)' }}>{nextLesson.duration} min · +{nextLesson.xp} XP</div>
            </div>
            <span style={{ padding: '9px 16px', background: nextAccent, color: '#000', fontWeight: 700, fontSize: '12px', borderRadius: '7px', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {completedLessons === 0 ? 'Start' : 'Resume'} →
            </span>
          </Link>
        ) : (
          <div style={{ padding: '18px 20px', marginBottom: '24px', background: 'var(--bg-1)', border: `1px solid ${tint('var(--success)', 40)}`, borderRadius: '12px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--success)', marginBottom: '2px' }}>You&apos;re all caught up</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-4)' }}>Every published lesson is complete. New weeks appear here as they are released — use the time to ship your labs.</div>
          </div>
        )}

        {/* Stage accordion */}
        <div id="labs">
          {STAGES.map(stage => {
            const published = stage.lessons.length > 0
            const isOpen    = published && openStages.has(stage.id)
            const stageDone = stage.lessons.filter(l => completedIds.has(l.id)).length
            const stagePct  = published ? Math.round((stageDone / stage.lessons.length) * 100) : 0

            return (
              <div key={stage.id} style={{ marginBottom: '12px', border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden', opacity: published ? 1 : 0.6 }}>
                {/* Stage header */}
                <button onClick={() => toggleStage(stage.id)} disabled={!published} aria-expanded={isOpen}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '16px 20px', background: 'var(--bg-1)', border: 'none', cursor: published ? 'pointer' : 'default', textAlign: 'left' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: tint(stage.color, 10), border: `1px solid ${stage.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '10px', color: stage.color, flexShrink: 0 }}>
                    {stage.id}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '2px' }}>{stage.name}</div>
                    {published ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '3px', background: 'var(--bg-4)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${stagePct}%`, background: stage.color, borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-5)', flexShrink: 0 }}>{stageDone}/{stage.lessons.length}</span>
                      </div>
                    ) : (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-5)' }}>Weeks {stage.weekRange} · lessons coming soon</div>
                    )}
                  </div>
                  {published && (
                    <span style={{ color: 'var(--ink-4)', fontSize: '16px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>▾</span>
                  )}
                </button>

                {/* Stage content */}
                {isOpen && (
                  <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--line)' }}>
                    {stage.weeks.map(week => (
                      <div key={`${week.week}-${week.title}`} style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Week {week.week} — {week.title}
                        </div>

                        {week.lessons.length === 0 ? (
                          <div style={{ fontSize: '13px', color: 'var(--ink-5)', padding: '6px 12px' }}>
                            Lessons for this week are coming soon.
                          </div>
                        ) : (
                          <>
                            {week.lessons.map(lesson => (
                              <LessonRow
                                key={lesson.id}
                                lesson={lesson}
                                completed={completedIds.has(lesson.id)}
                                isNext={lesson.id === nextLesson?.id}
                                accent={stage.color}
                              />
                            ))}
                            {week.labs.map(lab => (
                              <LabPanel
                                key={lab.id}
                                lab={lab}
                                stageColor={stage.color}
                                submission={labSubs[lab.id] || null}
                                onSubmit={(l, url, notes) => submitLab(l, stage.id, url, notes)}
                              />
                            ))}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      </div>
    </>
  )
}
