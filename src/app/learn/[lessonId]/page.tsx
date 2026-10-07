'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/nav/Sidebar'
import { LESSON_MAP, STAGE_LESSON_IDS } from '@/lib/curriculum/lessons'
import type { Profile } from '@/types'

/* ─── Palette tokens ─────────────────────────────────────────── */
const C = {
  bg: '#0a0a0f',
  bg2: '#111118',
  bg3: '#16161f',
  line: 'rgba(255,255,255,0.06)',
  line2: 'rgba(255,255,255,0.1)',
  ink: '#f0f0f8',
  ink2: '#c8c8d8',
  ink3: '#9090a8',
  ink4: '#606078',
  ink5: '#404058',
  gold: '#f4b728',
  goldFaint: 'rgba(244,183,40,0.08)',
  goldDim: 'rgba(244,183,40,0.2)',
  green: '#4ade80',
  greenFaint: 'rgba(74,222,128,0.08)',
  blue: '#60a5fa',
  blueFaint: 'rgba(96,165,250,0.08)',
  purple: '#a78bfa',
  purpleFaint: 'rgba(167,139,250,0.08)',
  red: '#f87171',
  redFaint: 'rgba(248,113,113,0.08)',
}

const STAGE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  '00': { label: 'Stage 00 · Foundations', color: C.blue, bg: C.blueFaint },
  '01': { label: 'Stage 01 · Zcash Core', color: C.purple, bg: C.purpleFaint },
  '02': { label: 'Stage 02 · Building', color: C.gold, bg: C.goldFaint },
  '03': { label: 'Stage 03 · Advanced', color: C.green, bg: C.greenFaint },
}

interface PageParams {
  lessonId: string
}

export default function LessonPage({ params }: { params: Promise<PageParams> }) {
  const { lessonId } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const lesson = LESSON_MAP.get(lessonId)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [marking, setMarking] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [stageLessons, setStageLessons] = useState<{ id: string; title: string; completed: boolean }[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  /* ── Auth + profile ── */
  useEffect(() => {
    ;(async () => {
      if (!supabase) { router.push('/'); return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!p || !p.cohort_id) { router.push('/portal'); return }
      setProfile(p)

      if (!lesson) { setLoading(false); return }

      /* ── Fetch lesson progress for this stage ── */
      const stage = lesson.stage
      const ids = STAGE_LESSON_IDS[stage] ?? []

      const { data: progressRows } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', user.id)
        .eq('stage', stage)
        .in('lesson_id', ids)

      const completedSet = new Set((progressRows ?? []).filter((r: {lesson_id: string; completed: boolean}) => r.completed).map((r: {lesson_id: string; completed: boolean}) => r.lesson_id))
      setCompleted(completedSet.has(lesson.id))

      setStageLessons(ids.map(id => ({
        id,
        title: LESSON_MAP.get(id)?.title ?? id,
        completed: completedSet.has(id),
      })))

      setLoading(false)
    })()
  }, [lessonId])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  /* ── Mark complete ── */
  const markComplete = async () => {
    if (!supabase || !profile || !lesson || marking || completed) return
    setMarking(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMarking(false); return }

    /* upsert lesson_progress */
    const { error: progressErr } = await supabase
      .from('lesson_progress')
      .upsert({
        user_id: user.id,
        stage: lesson.stage,
        lesson_id: lesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,lesson_id' })

    if (progressErr) {
      showToast('Could not save progress — try again', 'error')
      setMarking(false)
      return
    }

    /* award XP */
    const { error: xpErr } = await supabase
      .from('profiles')
      .update({ xp: (profile.xp ?? 0) + lesson.xp })
      .eq('id', user.id)

    if (xpErr) {
      showToast('Progress saved — XP update failed', 'error')
    } else {
      setProfile((p: Profile | null) => p ? { ...p, xp: (p.xp ?? 0) + lesson.xp } : p)
      showToast(`+${lesson.xp} XP earned! Lesson complete 🎉`, 'success')
    }

    setCompleted(true)
    setStageLessons((prev: typeof stageLessons) => prev.map(l => l.id === lesson.id ? { ...l, completed: true } : l))
    setMarking(false)
  }

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
        <Sidebar role={profile?.role ?? 'student'} userName={profile?.name} userInitial={profile?.name?.[0]} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ink3, fontSize: '14px' }}>
          Loading lesson…
        </div>
      </div>
    )
  }

  /* ─── 404 ─── */
  if (!lesson) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
        <Sidebar role={profile?.role ?? 'student'} userName={profile?.name} userInitial={profile?.name?.[0]} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '40px' }}>
          <div style={{ fontSize: '48px' }}>📭</div>
          <div style={{ fontSize: '20px', color: C.ink, fontWeight: 600 }}>Lesson not found</div>
          <div style={{ fontSize: '14px', color: C.ink3 }}>The lesson ID <code style={{ background: C.bg3, padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--mono)' }}>{lessonId}</code> doesn&apos;t exist.</div>
          <Link href="/learn" style={{ marginTop: '8px', padding: '10px 20px', background: C.goldFaint, border: `1px solid ${C.goldDim}`, borderRadius: '8px', color: C.gold, fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
            ← Back to Learning Path
          </Link>
        </div>
      </div>
    )
  }

  const stage = lesson.stage
  const stageMeta = STAGE_LABELS[stage] ?? { label: `Stage ${stage}`, color: C.ink3, bg: C.bg3 }
  const doneCount = stageLessons.filter(l => l.completed).length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <Sidebar
        role={profile?.role ?? 'student'}
        userName={profile?.name}
        userInitial={profile?.name?.[0]}
        cohort={profile?.cohort_id ?? undefined}
      />

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 999,
          background: toast.type === 'success' ? '#166534' : '#7f1d1d',
          border: `1px solid ${toast.type === 'success' ? '#16a34a' : '#dc2626'}`,
          borderRadius: '8px', padding: '12px 16px', color: '#fff',
          fontSize: '13px', maxWidth: '320px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Main layout ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Lesson content area ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '0' }}>

          {/* Header bar */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            background: C.bg, borderBottom: `1px solid ${C.line}`,
            padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <Link href="/learn" style={{ color: C.ink4, fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Learning Path
            </Link>
            <span style={{ color: C.ink5 }}>›</span>
            <span style={{
              padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
              background: stageMeta.bg, color: stageMeta.color, letterSpacing: '0.02em',
            }}>
              {stageMeta.label}
            </span>
            <div style={{ flex: 1 }} />
            {/* XP badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: C.goldFaint, border: `1px solid ${C.goldDim}`, borderRadius: '20px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={C.gold}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span style={{ fontSize: '12px', fontWeight: 600, color: C.gold, fontFamily: 'var(--mono)' }}>{lesson.xp} XP</span>
            </div>
            {/* Duration */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: C.ink4, fontSize: '12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {lesson.duration} min
            </div>
          </div>

          {/* Lesson body */}
          <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 32px 120px' }}>

            {/* Lesson title block */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: C.ink5, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Week {lesson.week} · {lesson.type === 'lab' ? 'Lab' : 'Lesson'} {lesson.id}
              </div>
              <h1 style={{ fontSize: '32px', fontFamily: 'var(--serif)', fontWeight: 700, color: C.ink, lineHeight: 1.25, marginBottom: '12px' }}>
                {lesson.title}
              </h1>
              {lesson.subtitle && (
                <p style={{ fontSize: '16px', color: C.ink3, lineHeight: 1.6, margin: 0 }}>
                  {lesson.subtitle}
                </p>
              )}

              {/* Completion badge */}
              {completed && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '16px', padding: '6px 14px', background: C.greenFaint, border: '1px solid rgba(74,222,128,0.25)', borderRadius: '20px', color: C.green, fontSize: '13px', fontWeight: 600 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Completed
                </div>
              )}
            </div>

            {/* Lesson HTML content */}
            <div
              className="lesson-content"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
              style={{
                color: C.ink2,
                lineHeight: 1.8,
                fontSize: '15px',
              }}
            />

            {/* ── Mark Complete / Next ── */}
            <div style={{ marginTop: '56px', paddingTop: '32px', borderTop: `1px solid ${C.line}`, display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {!completed ? (
                <button
                  onClick={markComplete}
                  disabled={marking}
                  style={{
                    padding: '12px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                    background: marking ? C.goldFaint : C.gold,
                    color: marking ? C.gold : '#000',
                    border: `1px solid ${C.goldDim}`,
                    cursor: marking ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'all 0.15s',
                    opacity: marking ? 0.7 : 1,
                  }}
                >
                  {marking ? (
                    <>
                      <span style={{ width: '14px', height: '14px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Mark as Complete (+{lesson.xp} XP)
                    </>
                  )}
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: C.greenFaint, border: '1px solid rgba(74,222,128,0.25)', borderRadius: '8px', color: C.green, fontSize: '14px', fontWeight: 600 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Lesson Complete
                </div>
              )}

              {/* Next lesson */}
              {lesson.next && (
                <Link
                  href={`/learn/${lesson.next}`}
                  style={{
                    padding: '12px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                    background: C.bg3, border: `1px solid ${C.line2}`, color: C.ink2,
                    textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'all 0.15s',
                  }}
                >
                  Next Lesson
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              )}

              {/* Prev lesson */}
              {lesson.prev && (
                <Link
                  href={`/learn/${lesson.prev}`}
                  style={{
                    padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                    background: 'transparent', border: `1px solid ${C.line}`, color: C.ink4,
                    textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.15s',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Previous
                </Link>
              )}
            </div>
          </div>
        </main>

        {/* ── Stage sidebar ── */}
        <aside style={{
          width: '260px', flexShrink: 0,
          background: C.bg2, borderLeft: `1px solid ${C.line}`,
          overflowY: 'auto', padding: '24px 0',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}
        className="lesson-aside"
        >
          {/* Progress summary */}
          <div style={{ padding: '0 20px 16px', borderBottom: `1px solid ${C.line}`, marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: C.ink5, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>
              {stageMeta.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ flex: 1, height: '4px', background: C.bg3, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${stageLessons.length ? (doneCount / stageLessons.length) * 100 : 0}%`, background: stageMeta.color, borderRadius: '2px', transition: 'width 0.4s' }} />
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: C.ink4 }}>{doneCount}/{stageLessons.length}</span>
            </div>
          </div>

          {/* Lesson list */}
          {stageLessons.map((l) => {
            const isActive = l.id === lessonId
            return (
              <Link
                key={l.id}
                href={`/learn/${l.id}`}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '10px 20px',
                  background: isActive ? C.goldFaint : 'transparent',
                  borderLeft: `2px solid ${isActive ? C.gold : 'transparent'}`,
                  textDecoration: 'none',
                  transition: 'all 0.12s',
                }}
              >
                {/* Check / circle indicator */}
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  {l.completed ? (
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  ) : (
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `1.5px solid ${isActive ? C.gold : C.ink5}` }} />
                  )}
                </div>
                <span style={{ fontSize: '12px', color: isActive ? C.gold : l.completed ? C.ink3 : C.ink3, lineHeight: 1.45, fontWeight: isActive ? 600 : 400 }}>
                  {l.title}
                </span>
              </Link>
            )
          })}
        </aside>
      </div>

      {/* Global lesson content styles */}
      <style>{`
        .lesson-content h2 {
          font-size: 22px;
          font-family: var(--serif);
          font-weight: 700;
          color: ${C.ink};
          margin: 40px 0 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid ${C.line};
        }
        .lesson-content h3 {
          font-size: 17px;
          font-weight: 600;
          color: ${C.ink};
          margin: 28px 0 12px;
        }
        .lesson-content p {
          margin: 0 0 16px;
          color: ${C.ink2};
        }
        .lesson-content ul, .lesson-content ol {
          margin: 0 0 16px;
          padding-left: 24px;
          color: ${C.ink2};
        }
        .lesson-content li {
          margin-bottom: 6px;
          line-height: 1.7;
        }
        .lesson-content code {
          font-family: var(--mono);
          font-size: 13px;
          background: ${C.bg3};
          padding: 2px 7px;
          border-radius: 4px;
          color: ${C.gold};
          border: 1px solid ${C.line2};
        }
        .lesson-content pre {
          background: ${C.bg3};
          border: 1px solid ${C.line2};
          border-radius: 8px;
          padding: 20px;
          overflow-x: auto;
          margin: 20px 0;
          font-family: var(--mono);
          font-size: 13px;
          line-height: 1.6;
          color: ${C.ink2};
        }
        .lesson-content pre code {
          background: none;
          padding: 0;
          border: none;
          color: inherit;
          font-size: inherit;
        }
        .lesson-content blockquote {
          border-left: 3px solid ${C.gold};
          margin: 24px 0;
          padding: 12px 20px;
          background: ${C.goldFaint};
          border-radius: 0 8px 8px 0;
          color: ${C.ink2};
          font-style: italic;
        }
        .lesson-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
          font-size: 14px;
        }
        .lesson-content th {
          background: ${C.bg3};
          color: ${C.ink};
          font-weight: 600;
          padding: 10px 14px;
          border: 1px solid ${C.line2};
          text-align: left;
        }
        .lesson-content td {
          padding: 9px 14px;
          border: 1px solid ${C.line};
          color: ${C.ink2};
        }
        .lesson-content tr:nth-child(even) td {
          background: rgba(255,255,255,0.02);
        }
        .lesson-content .callout {
          border: 1px solid ${C.line2};
          background: ${C.bg3};
          border-radius: 8px;
          padding: 16px 20px;
          margin: 24px 0;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .lesson-content strong {
          color: ${C.ink};
          font-weight: 600;
        }
        .lesson-content a {
          color: ${C.blue};
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .lesson-aside { display: none !important; }
        }
      `}</style>
    </div>
  )
}
