'use client'

import { useState } from 'react'
import Link from 'next/link'
import { STAGE_META } from '@/lib/design-tokens'

// ─── Curriculum data ──────────────────────────────────────────────────────────
const CURRICULUM = [
  {
    stage: '00',
    weeks: [
      {
        week: 1, title: 'Getting Started',
        lessons: [
          { id: 'l-00-01', title: 'What is a Blockchain?', type: 'VIDEO', duration: 12, xp: 50 },
          { id: 'l-00-02', title: 'Distributed Ledgers vs Traditional Databases', type: 'READING', duration: 10, xp: 50 },
          { id: 'l-00-03', title: 'Cryptographic Hash Functions', type: 'READING', duration: 15, xp: 75 },
          { id: 'l-00-04', title: 'Digital Signatures & Public Key Cryptography', type: 'VIDEO', duration: 18, xp: 75 },
          { id: 'l-00-05', title: 'Merkle Trees', type: 'READING', duration: 12, xp: 50 },
        ],
        lab: { id: 'lab-00', title: 'Blockchain Visualiser', xp: 200 },
      },
      {
        week: 2, title: 'Blockchain Fundamentals',
        lessons: [
          { id: 'l-00-06', title: 'How Blocks Are Mined', type: 'VIDEO', duration: 14, xp: 50 },
          { id: 'l-00-07', title: 'Proof of Work vs Proof of Stake', type: 'READING', duration: 16, xp: 75 },
          { id: 'l-00-08', title: 'Consensus Mechanisms', type: 'READING', duration: 13, xp: 50 },
          { id: 'l-00-09', title: 'UTXO vs Account Model', type: 'VIDEO', duration: 15, xp: 75 },
          { id: 'l-00-10', title: 'Transactions & Mempool', type: 'READING', duration: 12, xp: 50 },
          { id: 'l-00-11', title: 'Wallets & Key Derivation (BIP-32/39/44)', type: 'VIDEO', duration: 20, xp: 100 },
        ],
      },
    ],
  },
  {
    stage: '01',
    weeks: [
      {
        week: 3, title: 'Understanding Zcash',
        lessons: [
          { id: 'l-01-01', title: 'Why Privacy Matters in Crypto', type: 'VIDEO', duration: 12, xp: 50 },
          { id: 'l-01-02', title: 'Zcash History & the Ceremony', type: 'READING', duration: 15, xp: 50 },
          { id: 'l-01-03', title: 'Transparent vs Shielded Pools', type: 'VIDEO', duration: 18, xp: 75 },
          { id: 'l-01-04', title: 'zk-SNARKs in Plain English', type: 'READING', duration: 20, xp: 100 },
          { id: 'l-01-05', title: 'The Sapling Protocol', type: 'VIDEO', duration: 16, xp: 75 },
          { id: 'l-01-06', title: 'Orchard & Halo2', type: 'READING', duration: 18, xp: 75 },
          { id: 'l-01-07', title: 'Unified Addresses Explained', type: 'VIDEO', duration: 14, xp: 75 },
        ],
        lab: { id: 'lab-01', title: 'Unified Address Explorer', xp: 200 },
      },
      {
        week: 4, title: 'Zcash Deep Dive',
        lessons: [
          { id: 'l-01-08', title: 'ZIPs — How Zcash Improves Itself', type: 'READING', duration: 12, xp: 50 },
          { id: 'l-01-09', title: 'The Zcash Development Fund', type: 'READING', duration: 10, xp: 50 },
          { id: 'l-01-10', title: 'Governance & Zcash Community', type: 'VIDEO', duration: 12, xp: 50 },
          { id: 'l-01-11', title: 'Zcash Full Nodes: Zebra vs zcashd', type: 'VIDEO', duration: 16, xp: 75 },
          { id: 'l-01-12', title: 'Indexing with Zaino', type: 'READING', duration: 14, xp: 75 },
          { id: 'l-01-13', title: 'Light Client Protocol', type: 'VIDEO', duration: 15, xp: 75 },
          { id: 'l-01-14', title: 'Zcash Ecosystem Map', type: 'READING', duration: 10, xp: 50 },
        ],
      },
    ],
  },
  {
    stage: '02',
    weeks: [
      {
        week: 5, title: 'Build with Zcash',
        lessons: [
          { id: 'l-02-01', title: 'Zcash SDK Overview (Rust & TypeScript)', type: 'VIDEO', duration: 14, xp: 75 },
          { id: 'l-02-02', title: 'Setting Up Your Dev Environment', type: 'VIDEO', duration: 20, xp: 100 },
          { id: 'l-02-03', title: 'Sending Your First Shielded Transaction', type: 'VIDEO', duration: 25, xp: 150 },
          { id: 'l-02-04', title: 'Reading Blockchain State via RPC', type: 'READING', duration: 18, xp: 100 },
          { id: 'l-02-05', title: 'ZIP-321: Payment URIs', type: 'READING', duration: 12, xp: 75 },
          { id: 'l-02-06', title: 'ZIP-315: Transaction Status', type: 'READING', duration: 10, xp: 75 },
        ],
        lab: { id: 'lab-02', title: 'Shielded Transaction Sender', xp: 300 },
      },
      {
        week: 6, title: 'Real-World Apps',
        lessons: [
          { id: 'l-02-07', title: 'Building a Payment Gateway', type: 'VIDEO', duration: 25, xp: 150 },
          { id: 'l-02-08', title: 'Wallet Sync & Block Scanning', type: 'READING', duration: 20, xp: 100 },
          { id: 'l-02-09', title: 'Memo Fields & Encrypted Messages', type: 'READING', duration: 15, xp: 75 },
          { id: 'l-02-10', title: 'Error Handling in Zcash Apps', type: 'READING', duration: 12, xp: 75 },
          { id: 'l-02-11', title: 'Testing with Testnet & Regtest', type: 'VIDEO', duration: 16, xp: 100 },
          { id: 'l-02-12', title: 'Security Best Practices', type: 'READING', duration: 14, xp: 75 },
          { id: 'l-02-13', title: 'Performance & Bandwidth Optimization', type: 'READING', duration: 12, xp: 75 },
          { id: 'l-02-14', title: 'Deploying to Production', type: 'VIDEO', duration: 18, xp: 100 },
        ],
        lab: { id: 'lab-03', title: 'Payment Gateway MVP', xp: 300 },
      },
    ],
  },
  {
    stage: '03',
    weeks: [
      {
        week: 7, title: 'Contribute to Zcash',
        lessons: [
          { id: 'l-03-01', title: 'How Zcash Is Developed (Open Source)', type: 'VIDEO', duration: 12, xp: 75 },
          { id: 'l-03-02', title: 'Reading the Zebra Codebase', type: 'READING', duration: 20, xp: 100 },
          { id: 'l-03-03', title: 'Running a Zebra Node', type: 'VIDEO', duration: 25, xp: 150 },
          { id: 'l-03-04', title: 'Finding Good First Issues', type: 'READING', duration: 10, xp: 50 },
          { id: 'l-03-05', title: 'Writing a ZIP Proposal', type: 'READING', duration: 18, xp: 100 },
          { id: 'l-03-06', title: 'Rust for Zcash Contributors', type: 'VIDEO', duration: 20, xp: 100 },
          { id: 'l-03-07', title: 'Code Review Culture in Zcash', type: 'READING', duration: 12, xp: 75 },
        ],
        lab: { id: 'lab-04', title: 'Zebra Node Deployment', xp: 400 },
      },
      {
        week: 8, title: 'Ship & Graduate',
        lessons: [
          { id: 'l-03-08', title: 'Zcash Grants (ZCG) — Funding Your Project', type: 'READING', duration: 14, xp: 75 },
          { id: 'l-03-09', title: 'Writing a Grant Proposal', type: 'READING', duration: 18, xp: 100 },
          { id: 'l-03-10', title: 'Demo Day: Presenting Your Project', type: 'VIDEO', duration: 15, xp: 100 },
          { id: 'l-03-11', title: 'Building in Public on X & GitHub', type: 'READING', duration: 10, xp: 50 },
          { id: 'l-03-12', title: 'Mentoring the Next Cohort', type: 'VIDEO', duration: 12, xp: 75 },
          { id: 'l-03-13', title: 'The Road Ahead: Your Zcash Journey', type: 'READING', duration: 10, xp: 50 },
          { id: 'l-03-14', title: 'Graduation & Alumni Network', type: 'VIDEO', duration: 8, xp: 50 },
        ],
        lab: { id: 'lab-05', title: 'Open Source Contribution', xp: 400 },
      },
    ],
  },
]

const STAGE_TABS = [
  { id: '00', label: '00 · FUNDAMENTALS', color: 'var(--stage-00)', border: 'var(--stage-00-b)' },
  { id: '01', label: '01 · UNDERSTAND',   color: 'var(--stage-01)', border: 'var(--stage-01-b)' },
  { id: '02', label: '02 · BUILD',        color: 'var(--stage-02)', border: 'var(--stage-02-b)' },
  { id: '03', label: '03 · CONTRIBUTE',  color: 'var(--stage-03)', border: 'var(--stage-03-b)' },
]

const LOCKED_STAGES = ['01', '02', '03']

// ─── Lesson row ───────────────────────────────────────────────────────────────
function LessonRow({ lesson, index, stageId, locked }: {
  lesson: { id: string; title: string; type: string; duration: number; xp: number }
  index: number
  stageId: string
  locked: boolean
}) {
  const accent = `var(--stage-${stageId})`
  const isVideo = lesson.type === 'VIDEO'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 16px',
      borderRadius: '8px',
      opacity: locked ? 0.5 : 1,
      cursor: locked ? 'default' : 'pointer',
      transition: 'background 0.15s',
    }}
    onMouseEnter={e => { if (!locked) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-3)' }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
    >
      {/* number circle */}
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        border: `1px solid ${locked ? 'var(--line-2)' : accent}`,
        color: locked ? 'var(--ink-4)' : accent,
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
        color: locked ? 'var(--ink-4)' : 'var(--ink-2)',
        fontWeight: 400,
      }}>
        {lesson.title}
      </span>

      {/* type pill */}
      <span className="pill" style={{
        color: locked ? 'var(--ink-5)' : isVideo ? 'var(--purple)' : 'var(--blue)',
        borderColor: locked ? 'var(--line-2)' : isVideo ? 'rgba(192,132,252,0.3)' : 'rgba(99,180,255,0.3)',
        background: locked ? 'transparent' : isVideo ? 'rgba(192,132,252,0.06)' : 'rgba(99,180,255,0.06)',
      }}>
        {lesson.type}
      </span>

      {/* duration */}
      <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)', minWidth: '28px', textAlign: 'right' }}>
        {lesson.duration}m
      </span>

      {/* xp */}
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        color: locked ? 'var(--ink-5)' : 'var(--gold)',
        minWidth: '48px',
        textAlign: 'right',
      }}>
        {locked ? '—' : `+${lesson.xp} XP`}
      </span>
    </div>
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
  const isLocked = LOCKED_STAGES.includes(activeStage)
  const accent = `var(--stage-${activeStage})`

  const totalLessons = CURRICULUM.reduce((acc, s) => acc + s.weeks.reduce((a, w) => a + w.lessons.length, 0), 0)
  const totalXP = CURRICULUM.reduce((acc, s) =>
    acc + s.weeks.reduce((a, w) =>
      a + w.lessons.reduce((b, l) => b + l.xp, 0) + (w.lab?.xp ?? 0), 0), 0)

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
              { v: '6', l: 'Labs' },
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

          {/* Week groups */}
          {stageData.weeks.map((week, wi) => (
            <div key={week.week} style={{ borderTop: wi > 0 ? '1px solid var(--line)' : 'none' }}>
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
                    locked={isLocked}
                  />
                ))}
              </div>

              {/* Lab */}
              {week.lab && (
                <LabRow lab={week.lab} stageId={activeStage} locked={isLocked} />
              )}
            </div>
          ))}

          {/* Locked CTA */}
          {isLocked && (
            <div style={{
              margin: '16px 24px 24px',
              padding: '20px 24px',
              borderRadius: '10px',
              background: 'rgba(244,183,40,0.04)',
              border: '1px solid var(--gold-dim)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔒</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink)', marginBottom: '6px' }}>
                Enroll to access Stage {activeStage}
              </div>
              <p className="text-body" style={{ marginBottom: '16px', fontSize: '13px' }}>
                This stage unlocks when you join a cohort. Apply today — spots are limited.
              </p>
              <Link href="/apply" className="btn btn-primary">
                Apply for Cohort 01
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: '4px' }}>
                  <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          )}
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
