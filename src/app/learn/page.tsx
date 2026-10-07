'use client'

import { useState } from 'react'
import Link from 'next/link'
import { STAGE_META } from '@/lib/design-tokens'
import { STAGE_MODULES, TOTAL_LESSONS, TOTAL_LABS, TOTAL_XP } from '@/lib/curriculum/outline'
import { isPublished } from '@/lib/curriculum/lessons'

// ─── Curriculum data ──────────────────────────────────────────────────────────
// Built from the single source of truth in outline.ts. A lesson is shown as a
// link once its content is published; unpublished lessons render inert.
const CURRICULUM = (['00', '01', '02', '03'] as const).map(stage => ({
  stage,
  weeks: (STAGE_MODULES[stage] ?? []).map(m => ({
    week: m.week,
    title: m.title,
    lessons: m.lessons.map(l => ({
      id: l.id,
      title: l.title,
      duration: l.duration,
      xp: l.xp,
      published: isPublished(l.id),
    })),
    lab: m.lab,
  })),
}))

const STAGE_TABS = [
  { id: '00', label: '00 · FUNDAMENTALS', color: 'var(--stage-00)', border: 'var(--stage-00-b)' },
  { id: '01', label: '01 · UNDERSTAND',   color: 'var(--stage-01)', border: 'var(--stage-01-b)' },
  { id: '02', label: '02 · BUILD',        color: 'var(--stage-02)', border: 'var(--stage-02-b)' },
  { id: '03', label: '03 · CONTRIBUTE',  color: 'var(--stage-03)', border: 'var(--stage-03-b)' },
]


// ─── Lesson row ───────────────────────────────────────────────────────────────
function LessonRow({ lesson, index, stageId }: {
  lesson: { id: string; title: string; duration: number; xp: number; published: boolean }
  index: number
  stageId: string
}) {
  const accent = `var(--stage-${stageId})`
  const published = lesson.published

  const inner = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 16px',
      borderRadius: '8px',
      opacity: published ? 1 : 0.5,
      cursor: published ? 'pointer' : 'default',
      transition: 'background 0.15s',
      textDecoration: 'none',
    }}
    onMouseEnter={e => { if (published) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-3)' }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
    >
      {/* number circle */}
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        border: `1px solid ${accent}`,
        color: accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        flexShrink: 0,
      }}>
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* title */}
      <span style={{
        flex: 1,
        fontSize: '13px',
        color: published ? 'var(--ink-2)' : 'var(--ink-4)',
        fontWeight: 400,
      }}>
        {lesson.title}
      </span>

      {/* status pill — only when not yet published */}
      {!published && (
        <span className="pill" style={{ color: 'var(--ink-5)', borderColor: 'var(--line-2)', background: 'transparent' }}>
          SOON
        </span>
      )}

      {/* duration */}
      <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)', minWidth: '28px', textAlign: 'right' }}>
        {lesson.duration}m
      </span>

      {/* xp */}
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        color: 'var(--gold)',
        minWidth: '48px',
        textAlign: 'right',
      }}>
        +{lesson.xp} XP
      </span>
    </div>
  )

  if (!published) return inner
  return (
    <Link href={`/learn/${lesson.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      {inner}
    </Link>
  )
}

// ─── Lab row ─────────────────────────────────────────────────────────────────
function LabRow({ lab, stageId, locked }: {
  lab: { id: string; title: string; xp: number }
  stageId: string
  locked: boolean
}) {
  const accent = `var(--stage-${stageId})`
  const border = `var(--stage-${stageId}-b)`

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: '8px 16px',
      padding: '12px 16px',
      borderRadius: '8px',
      border: `1px solid ${locked ? 'var(--line-2)' : border}`,
      background: locked ? 'transparent' : `rgba(244,183,40,0.04)`,
      opacity: locked ? 0.5 : 1,
    }}>
      <span style={{ fontSize: '16px' }}>{locked ? '🔒' : '🧪'}</span>
      <div style={{ flex: 1 }}>
        <div className="text-label" style={{ marginBottom: '2px', color: locked ? 'var(--ink-5)' : accent }}>
          LAB
        </div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: locked ? 'var(--ink-4)' : 'var(--ink-2)' }}>
          {lab.title}
        </div>
      </div>
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        color: locked ? 'var(--ink-5)' : 'var(--gold)',
      }}>
        {locked ? '—' : `+${lab.xp} XP`}
      </span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LearnPage() {
  const [activeStage, setActiveStage] = useState('00')

  const stageData = CURRICULUM.find(s => s.stage === activeStage)!
  const meta = STAGE_META.find(m => m.id === activeStage)!
  const accent = `var(--stage-${activeStage})`

  const totalLessons = TOTAL_LESSONS
  const totalXP = TOTAL_XP

  return (
    <div className="page-public" style={{ background: 'var(--bg)' }}>

      {/* ── Top nav ── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--page-px)',
        height: '56px',
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
            <path d="m270,540c0-148.9,121.1-270,270-270s270,121.1,270,270-121.1,270-270,270-270-121.1-270-270Zm366.31-125.3v41.09l-114.28,155h114.28v54.5h-73.67v45.16h-45.28v-45.16h-73.67v-41.09l114.16-155h-114.16v-54.5h73.67v-45.28h45.28v45.28h73.67Z" fill="#f4b728" fillRule="evenodd" />
          </svg>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink)' }}>
            Zcash <em style={{ fontStyle: 'italic' }}>Builders</em>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/login" className="btn btn-ghost" style={{ minHeight: '36px', padding: '0 14px', fontSize: '13px' }}>
            Sign in
          </Link>
          <Link href="/apply" className="btn btn-primary" style={{ minHeight: '36px', padding: '0 14px', fontSize: '13px' }}>
            Apply Now
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px var(--page-px) 80px' }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: '48px' }}>
          <div className="text-label" style={{ marginBottom: '16px' }}>
            Full Curriculum
          </div>
          <h1 className="text-h1" style={{ marginBottom: '16px' }}>
            The Zcash Builder<br />Curriculum
          </h1>
          <p className="text-body" style={{ maxWidth: '560px', marginBottom: '24px' }}>
            From blockchain fundamentals to shipping real Zcash applications —
            a hands-on, cohort-based programme for serious developers.
          </p>

          {/* Stats pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { v: '8', l: 'Weeks' },
              { v: String(totalLessons), l: 'Lessons' },
              { v: String(TOTAL_LABS), l: 'Labs' },
              { v: totalXP.toLocaleString(), l: 'Total XP' },
            ].map(s => (
              <div key={s.l} className="pill" style={{ color: 'var(--ink-3)', borderColor: 'var(--line-2)' }}>
                <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{s.v}</span>
                &nbsp;{s.l}
              </div>
            ))}
          </div>
        </div>

        {/* ── Stage tab bar ── */}
        <div style={{
          display: 'flex',
          gap: '2px',
          marginBottom: '24px',
          background: 'var(--bg-2)',
          border: '1px solid var(--line)',
          borderRadius: '10px',
          padding: '4px',
        }}>
          {STAGE_TABS.map(tab => {
            const active = activeStage === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStage(tab.id)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '7px',
                  fontFamily: 'var(--mono)',
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  color: active ? tab.color : 'var(--ink-4)',
                  background: active ? 'var(--bg-4)' : 'transparent',
                  borderBottom: active ? `2px solid ${tab.color}` : '2px solid transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── Stage detail card ── */}
        <div className="card" style={{ marginBottom: '16px', overflow: 'hidden' }}>
          {/* Stage card header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--bg-2)',
          }}>
            <div>
              <div className="text-label" style={{ color: accent, marginBottom: '6px' }}>
                Stage {activeStage} · Weeks {meta.weeks}
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '22px', color: 'var(--ink)' }}>
                {meta.name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--gold)' }}>
                {stageData.weeks.reduce((a, w) => a + w.lessons.length, 0)}
              </div>
              <div className="text-label">Lessons</div>
            </div>
          </div>

          {/* Module groups */}
          {stageData.weeks.map((week, wi) => (
            <div key={`${week.week}-${week.title}`} style={{ borderTop: wi > 0 ? '1px solid var(--line)' : 'none' }}>
              {/* Week header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 24px 10px',
                background: 'var(--bg-2)',
              }}>
                <span className="pill" style={{ color: 'var(--ink-4)', borderColor: 'var(--line-2)' }}>
                  Week {week.week}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-3)' }}>
                  {week.title}
                </span>
              </div>

              {/* Lessons */}
              <div style={{ padding: '4px 8px' }}>
                {week.lessons.map((lesson, li) => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    index={li}
                    stageId={activeStage}
                  />
                ))}
              </div>

              {/* Lab */}
              {week.lab && (
                <LabRow lab={week.lab} stageId={activeStage} locked={false} />
              )}
            </div>
          ))}

          {/* Enrolment CTA */}
          <div style={{
            margin: '16px 24px 24px',
            padding: '20px 24px',
            borderRadius: '10px',
            background: 'rgba(244,183,40,0.04)',
            border: '1px solid var(--gold-dim)',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink)', marginBottom: '6px' }}>
              Join a cohort to track your progress
            </div>
            <p className="text-body" style={{ marginBottom: '16px', fontSize: '13px' }}>
              The curriculum is open to read. Enrol to open the lessons, earn XP, and submit the labs with mentor review.
            </p>
            <Link href="/apply" className="btn btn-primary">
              Apply for Cohort 01
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: '4px' }}>
                <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ── What you'll build ── */}
        <div style={{ marginTop: '48px', marginBottom: '48px' }}>
          <div className="text-label" style={{ marginBottom: '16px' }}>Build something every week</div>
          <h2 className="text-h3" style={{ marginBottom: '20px' }}>Hands-on from day one</h2>
          <div className="grid-2" style={{ gap: '12px' }}>
            {[
              { week: 'Week 1', title: 'Blockchain Visualiser', icon: '🧱', desc: 'Visualize blocks, hashes, and chain links in real time.' },
              { week: 'Week 3', title: 'UA Explorer', icon: '🔍', desc: 'Decode Unified Addresses and inspect their receiver components.' },
              { week: 'Week 5', title: 'Shielded TX Sender', icon: '🔐', desc: 'Send your first shielded transaction on testnet.' },
              { week: 'Week 6', title: 'Payment Gateway', icon: '⚡', desc: 'Build a merchant gateway with ZIP-321 payment URIs.' },
              { week: 'Week 7', title: 'Zebra Node', icon: '🦓', desc: 'Deploy and operate a full Zebra node on a VPS.' },
              { week: 'Week 8', title: 'OSS Contribution', icon: '🌟', desc: 'Merge your first pull request to a Zcash repository.' },
            ].map(p => (
              <div key={p.week} className="card" style={{ display: 'flex', gap: '14px', padding: '16px' }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{p.icon}</span>
                <div>
                  <div className="text-label" style={{ marginBottom: '4px' }}>{p.week}</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '4px' }}>{p.title}</div>
                  <div className="text-body" style={{ fontSize: '12px' }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="card" style={{
          padding: '40px',
          textAlign: 'center',
          background: 'rgba(244,183,40,0.04)',
          borderColor: 'var(--gold-dim)',
        }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--ink)', marginBottom: '10px' }}>
            Ready to build on Zcash?
          </div>
          <p className="text-body" style={{ maxWidth: '380px', margin: '0 auto 24px' }}>
            Cohort 01 opens soon. Apply today — spots are limited to 30 developers.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/apply" className="btn btn-primary">
              Apply for Cohort 01
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: '4px' }}>
                <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/" className="btn btn-ghost">
              Back to home
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
