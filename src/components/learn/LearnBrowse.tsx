'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Signed-in curriculum browser. Renders inside the student-portal chrome (the
// Sidebar), NOT the public marketing /learn page — so a signed-in builder never
// gets bounced to a page that shows "Sign in / Apply Now".
//
// Two distinct views share this component:
//   • view="curriculum" — stage tabs → module cards → lesson rows (the overview)
//   • view="tree"        — a compact file-tree of every lesson, grouped by week
//
// Both link published lessons to /learn/[id] and show the builder's completion.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/nav/Sidebar'
import type { Profile } from '@/types'
import { STAGE_META } from '@/lib/design-tokens'
import { STAGE_MODULES, TOTAL_LESSONS, TOTAL_LABS, TOTAL_XP } from '@/lib/curriculum/outline'
import { LESSON_MAP, isPublished } from '@/lib/curriculum/lessons'

type View = 'curriculum' | 'tree'

const STAGE_TABS = STAGE_META.map(m => ({
  id: m.id,
  label: `${m.id} · ${m.name}`,
  color: `var(--stage-${m.id})`,
}))

// A completion dot / check used by both views.
function StatusDot({ completed, accent }: { completed: boolean; accent: string }) {
  return (
    <span style={{
      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
      border: `1.5px solid ${completed ? 'var(--success)' : 'var(--line-2)'}`,
      background: completed ? 'var(--success)' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {completed && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>}
      {!completed && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: accent, opacity: 0.5 }} />}
    </span>
  )
}

export default function LearnBrowse({ view }: { view: View }) {
  const router = useRouter()
  const client = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [activeStage, setActiveStage] = useState('00')

  useEffect(() => {
    if (!client) { router.push('/login'); return }
    let cancelled = false

    async function load() {
      if (!client) return
      const { data: { session } } = await client.auth.getSession()
      if (!session) { router.push(`/login?next=/learn/${view === 'tree' ? 'tree' : 'curriculum'}`); return }
      const userId = session.user.id

      const [profileRes, progressRes] = await Promise.all([
        client.from('profiles').select('*').eq('id', userId).single(),
        client.from('lesson_progress').select('lesson_id').eq('user_id', userId).eq('completed', true),
      ])
      if (cancelled) return

      const p = profileRes.data as Profile | null
      if (!p || !p.cohort_id) { router.push('/portal'); return }
      setProfile(p)

      const done = new Set<string>(
        ((progressRes.data ?? []) as { lesson_id: string }[])
          .map(r => r.lesson_id)
          .filter(id => LESSON_MAP.has(id)),
      )
      setCompletedIds(done)

      // Open the stage the builder is currently working through.
      const stages = STAGE_META.map(m => m.id)
      const resumeStage = stages.find(s => (STAGE_MODULES[s] ?? []).some(m => m.lessons.some(l => isPublished(l.id) && !done.has(l.id))))
      if (resumeStage) setActiveStage(resumeStage)

      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '10px', color: 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: '12px' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 0.7s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      Loading curriculum…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const completedCount = completedIds.size

  return (
    <>
      <style>{`
        .lb-row{transition:background .12s;text-decoration:none}
        .lb-row:hover,.lb-row:focus-visible{background:var(--bg-3)}
        .lb-tree-item{transition:color .12s,background .12s;text-decoration:none}
        .lb-tree-item:hover{background:var(--bg-3)}
        .lb-tree-item:hover .lb-item-name{text-decoration:underline;text-decoration-color:var(--ink-4)}
        .lb-arrow{opacity:0;transition:opacity .15s,transform .15s}
        .lb-tree-item:hover .lb-arrow{opacity:1;transform:translateX(2px)}
      `}</style>

      <Sidebar
        role={profile?.role || 'student'}
        userName={profile?.name || 'Builder'}
        userInitial={(profile?.name || 'ZB').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
        cohort={profile?.cohort_id || 'Cohort 01'}
      />

      <div className="page-with-nav">
        <main style={{ maxWidth: view === 'tree' ? '1040px' : '880px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) var(--page-px) 100px' }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: '28px' }}>
            <div className="text-label" style={{ marginBottom: '12px' }}>
              {view === 'tree' ? 'Lesson Tree' : 'Full Curriculum'}
            </div>
            <h1 className="text-h1" style={{ marginBottom: '12px' }}>
              {view === 'tree' ? 'Every lesson, at a glance' : 'The Zcash Builder Curriculum'}
            </h1>
            <p className="text-body" style={{ maxWidth: '560px', color: 'var(--ink-3)' }}>
              {view === 'tree'
                ? 'The entire programme as a navigable tree — jump straight to any lesson. Completed lessons are marked.'
                : 'Browse all four stages. Pick a stage, open a week, and dive into any published lesson.'}
            </p>

            {/* progress + view switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
              <div className="pill" style={{ color: 'var(--ink-3)', borderColor: 'var(--line-2)' }}>
                <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{completedCount}</span>&nbsp;/ {TOTAL_LESSONS} done
              </div>
              <div className="pill" style={{ color: 'var(--ink-3)', borderColor: 'var(--line-2)' }}>
                <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{TOTAL_LABS}</span>&nbsp;labs
              </div>
              <div className="pill" style={{ color: 'var(--ink-3)', borderColor: 'var(--line-2)' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{TOTAL_XP.toLocaleString()}</span>&nbsp;XP
              </div>

              <div style={{ flex: 1 }} />

              <div style={{ display: 'inline-flex', gap: '2px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: '8px', padding: '3px' }}>
                <Link href="/learn/curriculum" className="btn" style={viewTabStyle(view === 'curriculum')}>Curriculum</Link>
                <Link href="/learn/tree" className="btn" style={viewTabStyle(view === 'tree')}>Lesson Tree</Link>
              </div>
            </div>
          </div>

          {view === 'curriculum'
            ? <CurriculumView activeStage={activeStage} setActiveStage={setActiveStage} completedIds={completedIds} />
            : <TreeView completedIds={completedIds} />}
        </main>
      </div>
    </>
  )
}

function viewTabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '7px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
    fontFamily: 'var(--mono)', letterSpacing: '0.04em', textDecoration: 'none',
    color: active ? '#000' : 'var(--ink-3)',
    background: active ? 'var(--gold)' : 'transparent',
    border: 'none', minHeight: '32px', display: 'inline-flex', alignItems: 'center',
  }
}

// ── Curriculum view: stage tabs → module cards → lesson rows ──────────────────
function CurriculumView({ activeStage, setActiveStage, completedIds }: {
  activeStage: string; setActiveStage: (s: string) => void; completedIds: Set<string>
}) {
  const accent = `var(--stage-${activeStage})`
  const modules = STAGE_MODULES[activeStage] ?? []

  return (
    <>
      {/* stage tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '24px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: '10px', padding: '4px' }}>
        {STAGE_TABS.map(tab => {
          const active = activeStage === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveStage(tab.id)} style={{
              flex: 1, padding: '9px 8px', borderRadius: '7px', fontFamily: 'var(--mono)', fontSize: '10px',
              letterSpacing: '0.1em', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              color: active ? tab.color : 'var(--ink-4)', background: active ? 'var(--bg-4)' : 'transparent',
              borderBottom: active ? `2px solid ${tab.color}` : '2px solid transparent', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {tab.id} · {(STAGE_META.find(m => m.id === tab.id)?.name) ?? ''}
            </button>
          )
        })}
      </div>

      {modules.map(m => (
        <div key={m.key} className="card" style={{ marginBottom: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: accent, flexShrink: 0 }}>WEEK {m.week}</span>
            <span style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>{m.title}</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-5)' }}>{m.lessons.length} lessons</span>
          </div>
          <div style={{ padding: '6px' }}>
            {m.lessons.map((l) => {
              const published = isPublished(l.id)
              const completed = completedIds.has(l.id)
              const body = (
                <div className="lb-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', opacity: published ? 1 : 0.5 }}>
                  <StatusDot completed={completed} accent={accent} />
                  <span style={{ flex: 1, fontSize: '13px', color: completed ? 'var(--ink-4)' : published ? 'var(--ink-2)' : 'var(--ink-4)' }}>{l.title}</span>
                  {!published && <span className="pill" style={{ color: 'var(--ink-5)', borderColor: 'var(--line-2)' }}>SOON</span>}
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-5)' }}>{l.duration}m</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: completed ? 'var(--success)' : 'var(--gold)', minWidth: '52px', textAlign: 'right' }}>{completed ? '✓' : '+'}{l.xp} XP</span>
                </div>
              )
              return published
                ? <Link key={l.id} href={`/learn/${l.id}`} style={{ textDecoration: 'none', display: 'block' }}>{body}</Link>
                : <div key={l.id}>{body}</div>
            })}
            {m.lab && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', margin: '4px', borderRadius: '8px', background: 'var(--bg-2)', border: '1px dashed var(--line-2)' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.1em', color: accent, textTransform: 'uppercase' }}>Lab</span>
                <span style={{ flex: 1, fontSize: '13px', color: 'var(--ink-2)' }}>{m.lab.title}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--gold)' }}>+{m.lab.xp} XP</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  )
}

// ── Tree view: file-tree of every lesson, grouped by stage → week ─────────────
function TreeView({ completedIds }: { completedIds: Set<string> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {STAGE_META.map(stage => {
        const accent = `var(--stage-${stage.id})`
        const modules = STAGE_MODULES[stage.id] ?? []
        return (
          <section key={stage.id}>
            {/* stage banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.08em', color: accent, border: `1px solid ${stage.border}`, background: 'var(--bg-2)', padding: '5px 10px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                STAGE {stage.id} · {stage.name}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-5)', whiteSpace: 'nowrap' }}>Weeks {stage.weeks}</span>
              <span style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
            </div>

            {modules.map(m => (
              <div key={m.key} style={{ marginBottom: '16px', paddingLeft: '4px' }}>
                <div style={{ fontSize: '12px', color: 'var(--ink-3)', fontWeight: 600, marginBottom: '2px', display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-5)' }}>W{m.week}</span>
                  {m.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '2px' }}>
                  {m.lessons.map((l, i) => {
                    const last = i === m.lessons.length - 1 && !m.lab
                    const published = isPublished(l.id)
                    const completed = completedIds.has(l.id)
                    const body = (
                      <div className="lb-tree-item" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '7px 8px', borderRadius: '6px', fontSize: '12.5px', color: published ? 'var(--ink-2)' : 'var(--ink-5)', opacity: published ? 1 : 0.6 }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-5)', flexShrink: 0 }}>{last ? '└──' : '├──'}</span>
                        <StatusDot completed={completed} accent={accent} />
                        <span className="lb-item-name" style={{ flex: 1, color: completed ? 'var(--ink-4)' : undefined }}>{l.title}</span>
                        {!published && <span className="pill" style={{ color: 'var(--ink-5)', borderColor: 'var(--line-2)', fontSize: '9px' }}>SOON</span>}
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-5)', flexShrink: 0 }}>{l.duration}m</span>
                        <span className="lb-arrow" style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-3)', flexShrink: 0 }}>→</span>
                      </div>
                    )
                    return published
                      ? <Link key={l.id} href={`/learn/${l.id}`} style={{ textDecoration: 'none' }}>{body}</Link>
                      : <div key={l.id}>{body}</div>
                  })}
                  {m.lab && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '7px 8px', fontSize: '12.5px', color: 'var(--ink-3)' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-5)', flexShrink: 0 }}>└──</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.08em', color: accent, textTransform: 'uppercase', border: `1px solid ${stage.border}`, borderRadius: '4px', padding: '1px 5px', flexShrink: 0 }}>LAB</span>
                      <span style={{ flex: 1 }}>{m.lab.title}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--gold)', flexShrink: 0 }}>+{m.lab.xp} XP</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}
