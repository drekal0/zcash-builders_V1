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
          { id: 'l-00-01', title: 'What is a Blockchain?', duration: 12, xp: 50 },
          { id: 'l-00-02', title: 'Distributed Ledgers vs Traditional Databases', duration: 10, xp: 50 },
          { id: 'l-00-03', title: 'Cryptographic Hash Functions', duration: 15, xp: 75 },
          { id: 'l-00-04', title: 'Digital Signatures & Public Key Cryptography', duration: 18, xp: 75 },
          { id: 'l-00-05', title: 'Merkle Trees', duration: 12, xp: 50 },
        ],
        lab: { id: 'lab-00', title: 'Blockchain Visualiser', xp: 200 },
      },
      {
        week: 2, title: 'Blockchain Fundamentals',
        lessons: [
          { id: 'l-00-06', title: 'How Blocks Are Mined', duration: 14, xp: 50 },
          { id: 'l-00-07', title: 'Proof of Work vs Proof of Stake', duration: 16, xp: 75 },
          { id: 'l-00-08', title: 'Consensus Mechanisms', duration: 13, xp: 50 },
          { id: 'l-00-09', title: 'UTXO vs Account Model', duration: 15, xp: 75 },
          { id: 'l-00-10', title: 'Transactions & Mempool', duration: 12, xp: 50 },
          { id: 'l-00-11', title: 'Wallets & Key Derivation (BIP-32/39/44)', duration: 20, xp: 100 },
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
          { id: 'l-01-01', title: 'Why Privacy Matters in Crypto', duration: 12, xp: 50 },
          { id: 'l-01-02', title: 'Zcash History & the Ceremony', duration: 15, xp: 50 },
          { id: 'l-01-03', title: 'Transparent vs Shielded Pools', duration: 18, xp: 75 },
          { id: 'l-01-04', title: 'zk-SNARKs in Plain English', duration: 20, xp: 100 },
          { id: 'l-01-05', title: 'The Sapling Protocol', duration: 16, xp: 75 },
          { id: 'l-01-06', title: 'Orchard & Halo2', duration: 18, xp: 75 },
          { id: 'l-01-07', title: 'Unified Addresses Explained', duration: 14, xp: 75 },
        ],
        lab: { id: 'lab-01', title: 'Unified Address Explorer', xp: 200 },
      },
      {
        week: 4, title: 'Zcash Deep Dive',
        lessons: [
          { id: 'l-01-08', title: 'ZIPs — How Zcash Improves Itself', duration: 12, xp: 50 },
          { id: 'l-01-09', title: 'The Zcash Development Fund', duration: 10, xp: 50 },
          { id: 'l-01-10', title: 'Governance & Zcash Community', duration: 12, xp: 50 },
          { id: 'l-01-11', title: 'Zcash Full Nodes: Zebra vs zcashd', duration: 16, xp: 75 },
          { id: 'l-01-12', title: 'Indexing with Zaino', duration: 14, xp: 75 },
          { id: 'l-01-13', title: 'Light Client Protocol', duration: 15, xp: 75 },
          { id: 'l-01-14', title: 'Zcash Ecosystem Map', duration: 10, xp: 50 },
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
          { id: 'l-02-01', title: 'Zcash SDK Overview (Rust & TypeScript)', duration: 14, xp: 75 },
          { id: 'l-02-02', title: 'Setting Up Your Dev Environment', duration: 20, xp: 100 },
          { id: 'l-02-03', title: 'Sending Your First Shielded Transaction', duration: 25, xp: 150 },
          { id: 'l-02-04', title: 'Reading Blockchain State via RPC', duration: 18, xp: 100 },
          { id: 'l-02-05', title: 'ZIP-321: Payment URIs', duration: 12, xp: 75 },
          { id: 'l-02-06', title: 'ZIP-315: Transaction Status', duration: 10, xp: 75 },
        ],
        lab: { id: 'lab-02', title: 'Shielded Transaction Sender', xp: 300 },
      },
      {
        week: 6, title: 'Real-World Apps',
        lessons: [
          { id: 'l-02-07', title: 'Building a Payment Gateway', duration: 25, xp: 150 },
          { id: 'l-02-08', title: 'Wallet Sync & Block Scanning', duration: 20, xp: 100 },
          { id: 'l-02-09', title: 'Memo Fields & Encrypted Messages', duration: 15, xp: 75 },
          { id: 'l-02-10', title: 'Error Handling in Zcash Apps', duration: 12, xp: 75 },
          { id: 'l-02-11', title: 'Testing with Testnet & Regtest', duration: 16, xp: 100 },
          { id: 'l-02-12', title: 'Security Best Practices', duration: 14, xp: 75 },
          { id: 'l-02-13', title: 'Performance & Bandwidth Optimization', duration: 12, xp: 75 },
          { id: 'l-02-14', title: 'Deploying to Production', duration: 18, xp: 100 },
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
          { id: 'l-03-01', title: 'How Zcash Is Developed (Open Source)', duration: 12, xp: 75 },
          { id: 'l-03-02', title: 'Reading the Zebra Codebase', duration: 20, xp: 100 },
          { id: 'l-03-03', title: 'Running a Zebra Node', duration: 25, xp: 150 },
          { id: 'l-03-04', title: 'Finding Good First Issues', duration: 10, xp: 50 },
          { id: 'l-03-05', title: 'Writing a ZIP Proposal', duration: 18, xp: 100 },
          { id: 'l-03-06', title: 'Rust for Zcash Contributors', duration: 20, xp: 100 },
          { id: 'l-03-07', title: 'Code Review Culture in Zcash', duration: 12, xp: 75 },
        ],
        lab: { id: 'lab-04', title: 'Zebra Node Deployment', xp: 400 },
      },
      {
        week: 8, title: 'Ship & Graduate',
        lessons: [
          { id: 'l-03-08', title: 'Zcash Grants (ZCG) — Funding Your Project', duration: 14, xp: 75 },
          { id: 'l-03-09', title: 'Writing a Grant Proposal', duration: 18, xp: 100 },
          { id: 'l-03-10', title: 'Demo Day: Presenting Your Project', duration: 15, xp: 100 },
          { id: 'l-03-11', title: 'Building in Public on X & GitHub', duration: 10, xp: 50 },
          { id: 'l-03-12', title: 'Mentoring the Next Cohort', duration: 12, xp: 75 },
          { id: 'l-03-13', title: 'The Road Ahead: Your Zcash Journey', duration: 10, xp: 50 },
          { id: 'l-03-14', title: 'Graduation & Alumni Network', duration: 8, xp: 50 },
        ],
        lab: { id: 'lab-05', title: 'Open Source Contribution', xp: 400 },
      },
    ],
  },
]

const STAGE_COLORS: Record<string, { accent: string; dim: string; badge: string }> = {
  '00': { accent: 'var(--ink-3)', dim: 'rgba(240,237,232,0.08)', badge: '#3a3a3a' },
  '01': { accent: 'var(--gold)', dim: 'rgba(244,183,40,0.08)', badge: 'rgba(244,183,40,0.2)' },
  '02': { accent: 'var(--blue)', dim: 'rgba(99,180,255,0.08)', badge: 'rgba(99,180,255,0.2)' },
  '03': { accent: 'var(--purple)', dim: 'rgba(192,132,252,0.08)', badge: 'rgba(192,132,252,0.2)' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function LessonRow({ lesson, index, accent, locked }: {
  lesson: { id: string; title: string; duration: number; xp: number }
  index: number
  accent: string
  locked: boolean
}) {
  return (
    <div
      className="flex items-center gap-3 py-3 px-4 rounded-lg transition-colors"
      style={{
        background: locked ? 'transparent' : 'transparent',
        opacity: locked ? 0.55 : 1,
        cursor: locked ? 'default' : 'pointer',
      }}
      onMouseEnter={e => {
        if (!locked) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent'
      }}
    >
      {/* Number circle */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0"
        style={{
          border: `1px solid ${locked ? 'var(--line-1)' : accent}`,
          color: locked ? 'var(--ink-3)' : accent,
          fontSize: '11px',
        }}
      >
        {locked ? '🔒' : String(index + 1).padStart(2, '0')}
      </div>
      <span className="flex-1 text-sm" style={{ color: locked ? 'var(--ink-3)' : 'var(--ink-2)' }}>
        {lesson.title}
      </span>
      <span className="text-xs font-mono" style={{ color: 'var(--ink-3)' }}>
        {lesson.duration}m
      </span>
      <span
        className="text-xs font-mono px-2 py-0.5 rounded"
        style={{
          background: locked ? 'transparent' : 'rgba(244,183,40,0.1)',
          color: locked ? 'var(--ink-3)' : 'var(--gold)',
          border: locked ? '1px solid var(--line-1)' : 'none',
        }}
      >
        {locked ? '—' : `+${lesson.xp} XP`}
      </span>
    </div>
  )
}

function LabBadge({ lab, accent, locked }: {
  lab: { id: string; title: string; xp: number }
  accent: string
  locked: boolean
}) {
  return (
    <div
      className="flex items-center gap-3 mx-4 mb-2 p-3 rounded-lg"
      style={{
        border: `1px solid ${locked ? 'var(--line-1)' : accent}`,
        background: locked ? 'transparent' : `${accent}0d`,
        opacity: locked ? 0.5 : 1,
      }}
    >
      <span className="text-lg">{locked ? '🔒' : '🧪'}</span>
      <div className="flex-1">
        <div className="text-xs font-mono uppercase tracking-wider mb-0.5" style={{ color: locked ? 'var(--ink-3)' : accent }}>
          Lab
        </div>
        <div className="text-sm font-medium" style={{ color: locked ? 'var(--ink-3)' : 'var(--ink-1)' }}>
          {lab.title}
        </div>
      </div>
      <span
        className="text-xs font-mono px-2 py-1 rounded"
        style={{
          background: locked ? 'transparent' : 'rgba(244,183,40,0.12)',
          color: locked ? 'var(--ink-3)' : 'var(--gold)',
          border: locked ? '1px solid var(--line-1)' : 'none',
        }}
      >
        {locked ? '—' : `+${lab.xp} XP`}
      </span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LearnPage() {
  const [openStages, setOpenStages] = useState<string[]>(['00'])
  // First stage is unlocked as preview; rest locked behind join
  const LOCKED_STAGES = ['01', '02', '03']

  const toggleStage = (id: string) => {
    setOpenStages(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const totalLessons = CURRICULUM.reduce((acc, s) => acc + s.weeks.reduce((a, w) => a + w.lessons.length, 0), 0)
  const totalXP = CURRICULUM.reduce((acc, s) =>
    acc + s.weeks.reduce((a, w) =>
      a + w.lessons.reduce((b, l) => b + l.xp, 0) + (w.lab?.xp ?? 0), 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line-1)' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-serif" style={{ color: 'var(--gold)' }}>⬡</span>
          <span className="text-sm font-medium" style={{ color: 'var(--ink-1)' }}>Zcash Builders</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{ color: 'var(--ink-2)' }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-1)'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-2)'}
          >
            Sign in
          </Link>
          <Link
            href="/apply"
            className="text-sm px-4 py-2 rounded-lg font-medium transition-all"
            style={{ background: 'var(--gold)', color: '#0a0a0a' }}
          >
            Apply Now
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* ── Hero ── */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-6"
            style={{ border: '1px solid var(--gold-dim)', color: 'var(--gold)', background: 'rgba(244,183,40,0.06)' }}
          >
            <span>8 Weeks</span>
            <span style={{ color: 'var(--line-2)' }}>·</span>
            <span>{totalLessons} Lessons</span>
            <span style={{ color: 'var(--line-2)' }}>·</span>
            <span>6 Labs</span>
            <span style={{ color: 'var(--line-2)' }}>·</span>
            <span>{totalXP.toLocaleString()} XP</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-4" style={{ color: 'var(--ink-1)' }}>
            The Zcash Builder<br />Curriculum
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--ink-3)', lineHeight: '1.7' }}>
            From blockchain fundamentals to shipping real Zcash applications —
            a hands-on, cohort-based programme for serious developers.
          </p>
        </div>

        {/* ── Stats row ── */}
        <div
          className="grid grid-cols-4 gap-px mb-12 rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--line-1)', background: 'var(--line-1)' }}
        >
          {[
            { label: 'Weeks', value: '8' },
            { label: 'Lessons', value: String(totalLessons) },
            { label: 'Labs', value: '6' },
            { label: 'Total XP', value: totalXP.toLocaleString() },
          ].map(s => (
            <div key={s.label} className="py-5 text-center" style={{ background: 'var(--bg)' }}>
              <div className="text-2xl font-serif mb-1" style={{ color: 'var(--ink-1)' }}>{s.value}</div>
              <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--ink-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Stage accordion ── */}
        <div className="space-y-3">
          {CURRICULUM.map((stage, si) => {
            const meta = STAGE_META.find(m => m.id === stage.stage)!
            const colors = STAGE_COLORS[stage.stage]
            const isOpen = openStages.includes(stage.stage)
            const isLocked = LOCKED_STAGES.includes(stage.stage)
            const lessonCount = stage.weeks.reduce((a, w) => a + w.lessons.length, 0)
            const labCount = stage.weeks.filter(w => w.lab).length
            const stageXP = stage.weeks.reduce((a, w) =>
              a + w.lessons.reduce((b, l) => b + l.xp, 0) + (w.lab?.xp ?? 0), 0)

            return (
              <div
                key={stage.stage}
                className="rounded-xl overflow-hidden transition-all"
                style={{ border: `1px solid ${isOpen ? colors.accent : 'var(--line-1)'}` }}
              >
                {/* Stage header */}
                <button
                  onClick={() => toggleStage(stage.stage)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
                  style={{ background: isOpen ? colors.dim : 'rgba(255,255,255,0.02)' }}
                >
                  {/* Stage badge */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold"
                    style={{ background: colors.badge, color: colors.accent, border: `1px solid ${colors.accent}` }}
                  >
                    {stage.stage}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono uppercase tracking-wider" style={{ color: colors.accent }}>
                        Stage {stage.stage}
                      </span>
                      {isLocked && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-mono"
                          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--ink-3)', border: '1px solid var(--line-1)' }}
                        >
                          🔒 Enrolled only
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-sm" style={{ color: 'var(--ink-1)' }}>{meta.name}</div>
                  </div>

                  <div className="hidden sm:flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--ink-3)' }}>
                    <span>Weeks {meta.weeks}</span>
                    <span>{lessonCount} lessons</span>
                    <span>{labCount} lab{labCount !== 1 ? 's' : ''}</span>
                    <span style={{ color: 'var(--gold)' }}>{stageXP} XP</span>
                  </div>

                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    style={{
                      color: colors.accent,
                      flexShrink: 0,
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Stage content */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${colors.accent}22` }}>
                    {stage.weeks.map((week, wi) => (
                      <div key={week.week}>
                        {/* Week header */}
                        <div
                          className="flex items-center gap-3 px-5 py-3"
                          style={{
                            borderTop: wi > 0 ? '1px solid var(--line-1)' : 'none',
                            background: 'rgba(255,255,255,0.01)',
                          }}
                        >
                          <div
                            className="text-xs font-mono px-2 py-0.5 rounded"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--ink-3)' }}
                          >
                            Week {week.week}
                          </div>
                          <span className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
                            {week.title}
                          </span>
                        </div>

                        {/* Lessons */}
                        <div className="px-1 pb-1">
                          {week.lessons.map((lesson, li) => (
                            <LessonRow
                              key={lesson.id}
                              lesson={lesson}
                              index={li}
                              accent={colors.accent}
                              locked={isLocked}
                            />
                          ))}
                        </div>

                        {/* Lab */}
                        {week.lab && (
                          <LabBadge lab={week.lab} accent={colors.accent} locked={isLocked} />
                        )}
                      </div>
                    ))}

                    {/* Locked CTA */}
                    {isLocked && (
                      <div
                        className="mx-4 mb-4 mt-2 p-4 rounded-lg text-center"
                        style={{ background: 'rgba(244,183,40,0.05)', border: '1px solid var(--gold-dim)' }}
                      >
                        <p className="text-sm mb-3" style={{ color: 'var(--ink-3)' }}>
                          This stage unlocks when you join a cohort.
                        </p>
                        <Link
                          href="/apply"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          style={{ background: 'var(--gold)', color: '#0a0a0a' }}
                        >
                          Apply for Cohort 01
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── What you'll build section ── */}
        <div className="mt-16 mb-12">
          <h2 className="text-xl font-serif mb-6 text-center" style={{ color: 'var(--ink-1)' }}>
            Build something every week
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { week: 'Week 1', title: 'Blockchain Visualiser', icon: '🧱', desc: 'Visualize blocks, hashes, and chain links in real time.' },
              { week: 'Week 3', title: 'UA Explorer', icon: '🔍', desc: 'Decode Unified Addresses and inspect their receiver components.' },
              { week: 'Week 5', title: 'Shielded TX Sender', icon: '🔐', desc: 'Send your first shielded transaction on testnet.' },
              { week: 'Week 6', title: 'Payment Gateway', icon: '⚡', desc: 'Build a merchant gateway with ZIP-321 payment URIs.' },
              { week: 'Week 7', title: 'Zebra Node', icon: '🦓', desc: 'Deploy and operate a full Zebra node on a VPS.' },
              { week: 'Week 8', title: 'OSS Contribution', icon: '🌟', desc: 'Merge your first pull request to a Zcash repository.' },
            ].map(p => (
              <div
                key={p.week}
                className="flex gap-3 p-4 rounded-xl"
                style={{ border: '1px solid var(--line-1)', background: 'rgba(255,255,255,0.02)' }}
              >
                <span className="text-2xl flex-shrink-0">{p.icon}</span>
                <div>
                  <div className="text-xs font-mono mb-1" style={{ color: 'var(--ink-3)' }}>{p.week}</div>
                  <div className="text-sm font-medium mb-1" style={{ color: 'var(--ink-1)' }}>{p.title}</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'var(--ink-3)' }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{ border: '1px solid var(--gold-dim)', background: 'rgba(244,183,40,0.04)' }}
        >
          <div className="text-3xl font-serif mb-3" style={{ color: 'var(--ink-1)' }}>
            Ready to build?
          </div>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--ink-3)', lineHeight: '1.7' }}>
            Cohort 01 opens soon. Apply today — spots are limited to 30 developers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
              style={{ background: 'var(--gold)', color: '#0a0a0a' }}
            >
              Apply for Cohort 01
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm transition-all"
              style={{ border: '1px solid var(--line-2)', color: 'var(--ink-2)' }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
