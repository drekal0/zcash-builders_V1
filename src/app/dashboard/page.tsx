'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/nav/Sidebar'
import type { Profile, LessonProgress, LabSubmission } from '@/types'
import { STAGE_META } from '@/lib/design-tokens'

// ── curriculum data ───────────────────────────────────────────
// Mirrors the 54-lesson / 8-lab structure from the dev spec
const CURRICULUM = [
  {
    stage: '00', color: 'var(--ink-3)', border: 'var(--line-2)',
    weeks: [
      { week: 1, title: 'Getting Started', lessons: [
        { id: 's00w01l01', title: 'Why Web3 matters', xp: 25, type: 'lesson' },
        { id: 's00w01l02', title: 'How the internet became centralised', xp: 25, type: 'lesson' },
        { id: 's00w01l03', title: 'What blockchains actually solve', xp: 25, type: 'lesson' },
        { id: 's00w01l04', title: 'Public vs private blockchains', xp: 25, type: 'lesson' },
        { id: 's00w01l05', title: 'Setting up your dev environment', xp: 50, type: 'lesson' },
      ], lab: { id: 'lab-00', title: 'Blockchain Visualiser', xp: 200 } },
      { week: 2, title: 'Blockchain Fundamentals', lessons: [
        { id: 's00w02l01', title: 'Hash functions (SHA-256, BLAKE2b)', xp: 25, type: 'lesson' },
        { id: 's00w02l02', title: 'Merkle trees and block structure', xp: 25, type: 'lesson' },
        { id: 's00w02l03', title: 'Proof-of-Work vs Proof-of-Stake', xp: 25, type: 'lesson' },
        { id: 's00w02l04', title: 'Transactions, UTXOs, and accounts', xp: 25, type: 'lesson' },
        { id: 's00w02l05', title: 'Digital signatures and key pairs', xp: 25, type: 'lesson' },
        { id: 's00w02l06', title: 'What makes a network decentralised?', xp: 25, type: 'lesson' },
      ], lab: null },
    ],
  },
  {
    stage: '01', color: 'var(--gold)', border: 'var(--gold-dim)',
    weeks: [
      { week: 3, title: 'Understand Zcash', lessons: [
        { id: 's01w03l01', title: 'The privacy problem with Bitcoin', xp: 25, type: 'lesson' },
        { id: 's01w03l02', title: 'Zcash history and the trusted setup', xp: 25, type: 'lesson' },
        { id: 's01w03l03', title: 'zk-SNARKs explained simply', xp: 50, type: 'lesson' },
        { id: 's01w03l04', title: 'Sapling → Orchard: the shielded pools', xp: 50, type: 'lesson' },
        { id: 's01w03l05', title: 'Unified Addresses deep dive', xp: 50, type: 'lesson' },
        { id: 's01w03l06', title: 'The Zcash protocol and NU upgrades', xp: 25, type: 'lesson' },
        { id: 's01w03l07', title: 'Governance: ZIP process and ZCG', xp: 25, type: 'lesson' },
      ], lab: { id: 'lab-01', title: 'Unified Address Explorer', xp: 200 } },
      { week: 4, title: 'The Zcash Stack', lessons: [
        { id: 's01w04l01', title: 'Zebra node: architecture and setup', xp: 50, type: 'lesson' },
        { id: 's01w04l02', title: 'Zaino gRPC: reading chain data', xp: 50, type: 'lesson' },
        { id: 's01w04l03', title: 'Zingolib and wallet SDKs', xp: 25, type: 'lesson' },
        { id: 's01w04l04', title: 'Zcash Wallets: Zodl, Zingo, Zallet', xp: 25, type: 'lesson' },
        { id: 's01w04l05', title: 'ZIP-321: payment URIs', xp: 25, type: 'lesson' },
        { id: 's01w04l06', title: 'Reading the Zcash developer docs', xp: 25, type: 'lesson' },
        { id: 's01w04l07', title: 'Lab: Transaction Decoder', xp: 25, type: 'lesson' },
      ], lab: null },
    ],
  },
  {
    stage: '02', color: 'var(--blue)', border: 'rgba(99,180,255,0.3)',
    weeks: [
      { week: 5, title: 'Building with TypeScript', lessons: [
        { id: 's02w05l01', title: 'create-zcash-app scaffold walkthrough', xp: 50, type: 'lesson' },
        { id: 's02w05l02', title: 'Connecting to a Zcash node (gRPC)', xp: 50, type: 'lesson' },
        { id: 's02w05l03', title: 'Generating and displaying addresses', xp: 50, type: 'lesson' },
        { id: 's02w05l04', title: 'Sending a shielded transaction', xp: 100, type: 'lesson' },
        { id: 's02w05l05', title: 'Wallet sync and balance display', xp: 50, type: 'lesson' },
        { id: 's02w05l06', title: 'Building a wallet dashboard UI', xp: 50, type: 'lesson' },
      ], lab: { id: 'lab-02', title: 'Shielded Transaction Sender', xp: 300 } },
      { week: 6, title: 'Advanced Use-cases', lessons: [
        { id: 's02w06l01', title: 'Merchant payments with ZIP-321', xp: 50, type: 'lesson' },
        { id: 's02w06l02', title: 'QR codes and deep links', xp: 25, type: 'lesson' },
        { id: 's02w06l03', title: 'Multi-party payments and splitting', xp: 50, type: 'lesson' },
        { id: 's02w06l04', title: 'Building a payment gateway MVP', xp: 100, type: 'lesson' },
        { id: 's02w06l05', title: 'FROST signatures and multisig', xp: 50, type: 'lesson' },
        { id: 's02w06l06', title: 'Error handling and edge cases', xp: 25, type: 'lesson' },
        { id: 's02w06l07', title: 'Testing your Zcash application', xp: 50, type: 'lesson' },
        { id: 's02w06l08', title: 'Deploying to testnet', xp: 50, type: 'lesson' },
      ], lab: { id: 'lab-03', title: 'Payment Gateway MVP', xp: 300 } },
    ],
  },
  {
    stage: '03', color: 'var(--purple)', border: 'rgba(192,132,252,0.3)',
    weeks: [
      { week: 7, title: 'Rust + Zebra Internals', lessons: [
        { id: 's03w07l01', title: 'Why Zcash uses Rust', xp: 25, type: 'lesson' },
        { id: 's03w07l02', title: 'Reading Zebra source code', xp: 50, type: 'lesson' },
        { id: 's03w07l03', title: 'Writing your first Rust module', xp: 100, type: 'lesson' },
        { id: 's03w07l04', title: 'Zaino contribution guide', xp: 50, type: 'lesson' },
        { id: 's03w07l05', title: 'Running a full node on mainnet', xp: 100, type: 'lesson' },
        { id: 's03w07l06', title: 'Submitting your first PR', xp: 100, type: 'lesson' },
        { id: 's03w07l07', title: 'Code review culture in OSS', xp: 25, type: 'lesson' },
      ], lab: { id: 'lab-04', title: 'Zebra Node Deployment', xp: 400 } },
      { week: 8, title: 'Demo Day & Beyond', lessons: [
        { id: 's03w08l01', title: 'Documenting your project', xp: 25, type: 'lesson' },
        { id: 's03w08l02', title: 'Writing a ZCG grant proposal', xp: 50, type: 'lesson' },
        { id: 's03w08l03', title: 'Pitching to the Zcash community', xp: 50, type: 'lesson' },
        { id: 's03w08l04', title: 'How to find open issues', xp: 25, type: 'lesson' },
        { id: 's03w08l05', title: 'Becoming a Zcash mentor', xp: 50, type: 'lesson' },
        { id: 's03w08l06', title: 'The Zcash ecosystem map', xp: 25, type: 'lesson' },
        { id: 's03w08l07', title: 'Demo Day presentation', xp: 200, type: 'lesson' },
      ], lab: { id: 'lab-05', title: 'Open Source Contribution', xp: 400 } },
    ],
  },
]

// ── sub-components ────────────────────────────────────────────
function LessonRow({ lesson, completed, onClick }: { lesson: any; completed: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' }}
      onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-3)')}
      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `1.5px solid ${completed ? 'var(--success)' : 'var(--line-2)'}`, background: completed ? 'var(--success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
      </div>
      <span style={{ flex: 1, fontSize: '13px', color: completed ? 'var(--ink-4)' : 'var(--ink-2)', textDecoration: completed ? 'line-through' : 'none', lineHeight: 1.4 }}>
        {lesson.title}
      </span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-5)', flexShrink: 0 }}>+{lesson.xp} XP</span>
    </button>
  )
}

// ── lab submission panel ──────────────────────────────────────
function LabPanel({ lab, stageColor, submission, onSubmit }: {
  lab: any; stageColor: string; submission: LabSubmission | null; onSubmit: (labId: string, url: string, notes: string) => void
}) {
  const [url,   setUrl]   = useState(submission?.github_url || '')
  const [notes, setNotes] = useState(submission?.notes || '')
  const [submitting, setSubmitting] = useState(false)

  const statusColors: Record<string, string> = {
    pending: 'var(--ink-4)', under_review: 'var(--gold)',
    approved: 'var(--success)', rejected: 'var(--danger)',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setSubmitting(true)
    await onSubmit(lab.id, url.trim(), notes.trim())
    setSubmitting(false)
  }

  return (
    <div style={{ background: 'var(--bg-3)', border: `1px solid ${stageColor}30`, borderRadius: '10px', padding: '16px', marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: stageColor, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>Lab</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-2)' }}>{lab.title}</div>
        </div>
        {submission && (
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: statusColors[submission.status] || 'var(--ink-4)', padding: '2px 8px', borderRadius: '100px', background: 'var(--bg-4)', border: `1px solid ${statusColors[submission.status] || 'var(--line)'}40` }}>
            {submission.status.replace('_', ' ')}
          </span>
        )}
      </div>

      {!submission ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://github.com/you/lab-repo" required
            style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '9px 12px', borderRadius: '7px', fontSize: '12px', fontFamily: 'var(--mono)', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = stageColor}
            onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
          />
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes for your reviewer (optional)…" rows={2}
            style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '9px 12px', borderRadius: '7px', fontSize: '12px', fontFamily: 'var(--sans)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = stageColor}
            onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
          />
          <button type="submit" disabled={submitting || !url.trim()}
            style={{ padding: '9px 16px', background: stageColor, color: '#000', fontWeight: 700, fontSize: '12px', border: 'none', borderRadius: '7px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting || !url.trim() ? 0.6 : 1, fontFamily: 'var(--sans)', alignSelf: 'flex-start' }}>
            {submitting ? 'Submitting…' : `Submit lab · +${lab.xp} XP`}
          </button>
        </form>
      ) : (
        <div>
          <a href={submission.github_url} target="_blank" rel="noopener" style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--blue)', textDecoration: 'none' }}>
            {submission.github_url}
          </a>
          {submission.notes && <p style={{ fontSize: '12px', color: 'var(--ink-4)', marginTop: '8px', marginBottom: 0 }}>{submission.notes}</p>}
          {submission.status === 'approved' && submission.xp_awarded && (
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--success)', marginTop: '8px', marginBottom: 0 }}>✓ {submission.xp_awarded} XP awarded</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── lesson slide-over ─────────────────────────────────────────
function LessonSlideOver({ lesson, stageColor, completed, onComplete, onClose }: {
  lesson: any; stageColor: string; completed: boolean; onComplete: () => void; onClose: () => void
}) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ width: 'min(500px,100vw)', background: 'var(--bg-1)', borderLeft: '1px solid var(--line-2)', height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: stageColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Lesson</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '22px', margin: 0, letterSpacing: '-0.02em' }}>{lesson.title}</h2>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)', marginTop: '6px' }}>+{lesson.xp} XP on completion</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--line-2)', color: 'var(--ink-3)', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>✕</button>
        </div>

        {/* Content placeholder */}
        <div style={{ flex: 1, padding: '24px' }}>
          <div style={{ background: 'var(--bg-3)', border: '1px dashed var(--line-2)', borderRadius: '10px', padding: '40px 24px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📖</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink-2)', marginBottom: '8px' }}>Lesson content coming soon</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-4)', lineHeight: 1.6 }}>
              MDX lesson files are being written.<br />
              You can mark this complete to track progress.
            </div>
          </div>

          {/* External resources */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '10px' }}>Resources</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Zcash Protocol Spec', href: 'https://zips.z.cash/protocol/protocol.pdf' },
                { label: 'Zebra Developer Docs', href: 'https://zebra.zfnd.org' },
                { label: 'ZIPs Repository', href: 'https://github.com/zcash/zips' },
              ].map(r => (
                <a key={r.href} href={r.href} target="_blank" rel="noopener"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--bg-3)', border: '1px solid var(--line)', borderRadius: '7px', textDecoration: 'none', fontSize: '13px', color: 'var(--ink-3)' }}>
                  <span>↗</span>{r.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Mark complete */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--line)' }}>
          {completed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '8px', fontSize: '13px', color: 'var(--success)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
              Lesson completed · XP earned
            </div>
          ) : (
            <button onClick={onComplete}
              style={{ width: '100%', padding: '13px', background: stageColor, color: '#000', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
              Mark as complete · +{lesson.xp} XP
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const client = createClient()

  const [profile,       setProfile]       = useState<Profile | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [completedIds,  setCompletedIds]  = useState<Set<string>>(new Set())
  const [labSubs,       setLabSubs]       = useState<Record<string, LabSubmission>>({})
  const [openStages,    setOpenStages]    = useState<Set<string>>(new Set(['00']))
  const [activeLesson,  setActiveLesson]  = useState<any>(null)
  const [activeColor,   setActiveColor]   = useState('var(--ink-3)')

  useEffect(() => {
    if (!client) { router.push('/login'); return }
    client.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login?next=/dashboard'); return }
      fetchAll(session.user.id)
    })
  }, [])  // eslint-disable-line

  async function fetchAll(userId: string) {
    if (!client) return
    const [profileRes, progressRes, labRes] = await Promise.all([
      client.from('profiles').select('*').eq('id', userId).single(),
      client.from('lesson_progress').select('lesson_id').eq('user_id', userId).eq('completed', true),
      client.from('lab_submissions').select('*').eq('user_id', userId),
    ])
    if (profileRes.data) setProfile(profileRes.data)
    if (progressRes.data) setCompletedIds(new Set(progressRes.data.map((r: any) => r.lesson_id)))
    if (labRes.data) {
      const map: Record<string, LabSubmission> = {}
      labRes.data.forEach((s: any) => { map[s.lab_id] = s })
      setLabSubs(map)
    }
    setLoading(false)
  }

  async function markComplete(lesson: any, stageId: string) {
    if (!client || !profile || completedIds.has(lesson.id)) return
    await client.from('lesson_progress').upsert({
      user_id: profile.id, cohort_id: profile.cohort_id || 'cohort-01',
      stage: stageId, lesson_id: lesson.id, completed: true, completed_at: new Date().toISOString(),
    })
    // Award XP
    await client.from('profiles').update({ xp: (profile.xp || 0) + lesson.xp }).eq('id', profile.id)
    setCompletedIds(prev => new Set([...prev, lesson.id]))
    setProfile(prev => prev ? { ...prev, xp: (prev.xp || 0) + lesson.xp } : prev)
  }

  async function submitLab(labId: string, url: string, notes: string) {
    if (!client || !profile) return
    const { data } = await client.from('lab_submissions').insert({
      user_id: profile.id, cohort_id: profile.cohort_id || 'cohort-01',
      stage: labId.split('-')[1], lab_id: labId,
      github_url: url, notes, status: 'pending',
    }).select().single()
    if (data) setLabSubs(prev => ({ ...prev, [labId]: data }))
  }

  function toggleStage(stageId: string) {
    setOpenStages(prev => {
      const next = new Set(prev)
      next.has(stageId) ? next.delete(stageId) : next.add(stageId)
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

  const totalLessons     = CURRICULUM.flatMap(s => s.weeks.flatMap(w => w.lessons)).length
  const completedLessons = CURRICULUM.flatMap(s => s.weeks.flatMap(w => w.lessons)).filter(l => completedIds.has(l.id)).length

  return (
    <>
      <Sidebar
        role={(profile?.role as any) || 'student'}
        userName={profile?.name || 'Builder'}
        userInitial={(profile?.name || 'ZB').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
        cohort={profile?.cohort_id || 'Cohort 01'}
      />

      <div className="page-with-nav" style={{ padding: 'clamp(24px,3vw,40px)', maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>
            Learning Dashboard
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px,3vw,36px)', letterSpacing: '-0.025em', margin: '0 0 8px' }}>
            Your 8-week journey
          </h1>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)' }}>
            {completedLessons} / {totalLessons} lessons · {Object.keys(labSubs).length} / 8 labs submitted · {profile?.xp || 0} XP
          </div>
        </div>

        {/* Stage accordion */}
        {CURRICULUM.map(stage => {
          const stageMeta    = STAGE_META.find(s => s.id === stage.stage)!
          const isOpen       = openStages.has(stage.stage)
          const stageLessons = stage.weeks.flatMap(w => w.lessons)
          const stageDone    = stageLessons.filter(l => completedIds.has(l.id)).length
          const stagePct     = Math.round((stageDone / stageLessons.length) * 100)

          return (
            <div key={stage.stage} style={{ marginBottom: '12px', border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden' }}>
              {/* Stage header */}
              <button onClick={() => toggleStage(stage.stage)}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '16px 20px', background: 'var(--bg-1)', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: `${stage.color}18`, border: `1px solid ${stage.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '10px', color: stage.color, flexShrink: 0 }}>
                  {stage.stage}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '2px' }}>{stageMeta?.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '3px', background: 'var(--bg-4)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${stagePct}%`, background: stage.color, borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-5)', flexShrink: 0 }}>{stageDone}/{stageLessons.length}</span>
                  </div>
                </div>
                <span style={{ color: 'var(--ink-4)', fontSize: '16px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>▾</span>
              </button>

              {/* Stage content */}
              {isOpen && (
                <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--line)' }}>
                  {stage.weeks.map(week => (
                    <div key={week.week} style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Week {week.week} — {week.title}
                      </div>

                      {week.lessons.map(lesson => (
                        <LessonRow
                          key={lesson.id}
                          lesson={lesson}
                          completed={completedIds.has(lesson.id)}
                          onClick={() => { setActiveLesson({ ...lesson, stageId: stage.stage }); setActiveColor(stage.color) }}
                        />
                      ))}

                      {week.lab && (
                        <LabPanel
                          lab={week.lab}
                          stageColor={stage.color}
                          submission={labSubs[week.lab.id] || null}
                          onSubmit={submitLab}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lesson slide-over */}
      {activeLesson && (
        <LessonSlideOver
          lesson={activeLesson}
          stageColor={activeColor}
          completed={completedIds.has(activeLesson.id)}
          onComplete={() => { markComplete(activeLesson, activeLesson.stageId); }}
          onClose={() => setActiveLesson(null)}
        />
      )}
    </>
  )
}
