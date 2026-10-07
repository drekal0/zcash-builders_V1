'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Application, Profile } from '@/types'
import TeamTab from '@/components/admin/TeamTab'
import CohortsTab from '@/components/admin/CohortsTab'
import ContentTab from '@/components/admin/ContentTab'
import type { AdminProfile } from '@/components/admin/shared'

type View = 'overview' | 'applicants' | 'students' | 'team' | 'cohorts' | 'content'
type StatusFilter = '' | 'pending' | 'accepted' | 'rejected' | 'waitlisted'

const ZcashLogo = () => (
  <svg width="28" height="28" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
    <path d="m270,540c0-148.9,121.1-270,270-270s270,121.1,270,270-121.1,270-270,270-270-121.1-270-270Zm366.31-125.3v41.09l-114.28,155h114.28v54.5h-73.67v45.16h-45.28v-45.16h-73.67v-41.09l114.16-155h-114.16v-54.5h73.67v-45.28h45.28v45.28h73.67Z" fill="#f4b728" fillRule="evenodd"/>
  </svg>
)

const STATUS_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  pending:    { color: 'var(--gold)',    bg: 'var(--gold-faint)',               border: 'var(--gold-dim)' },
  accepted:   { color: 'var(--success)', bg: 'rgba(74,222,128,0.06)',           border: 'rgba(74,222,128,0.2)' },
  rejected:   { color: 'var(--red)',     bg: 'rgba(248,113,113,0.06)',          border: 'rgba(248,113,113,0.2)' },
  waitlisted: { color: 'var(--ink-3)',   bg: 'var(--bg-3)',                     border: 'var(--line-2)' },
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.08em',
      textTransform: 'uppercase', padding: '3px 9px', borderRadius: '100px',
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  )
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = ['#f4b728','#63b4ff','#c084fc','#4ade80','#f87171','#fb923c','#38bdf8','#a3e635']

export default function AdminPage() {
  const [view, setView]                 = useState<View>('overview')
  const [applications, setApplications] = useState<Application[]>([])
  const [students, setStudents]         = useState<Profile[]>([])
  const [me, setMe]                     = useState<AdminProfile | null>(null)
  const [myCaps, setMyCaps]             = useState<Set<string>>(new Set())
  const [loading, setLoading]           = useState(true)
  const [navOpen, setNavOpen]           = useState(false)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [selected, setSelected]         = useState<Application | null>(null)
  const [cohorts, setCohorts]           = useState<{ id: string; name: string; region?: string }[]>([])
  const [selectedCohort, setSelectedCohort] = useState('cohort-01')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMsg, setActionMsg]       = useState('')
  const [actionIsError, setActionIsError] = useState(false)
  const [adminNotes, setAdminNotes]     = useState('')

  async function fetchData() {
    const client = createClient()
    if (!client) { return } // null only during SSR/build; the effect re-runs client-side

    // Current user → their profile (for is_primary_admin) and capabilities,
    // which gate the Team / Cohorts / Content tabs. Server RLS enforces the
    // real rules; this gating is UX only.
    const { data: { user } } = await client.auth.getUser()
    if (user) {
      const [meRes, capsRes] = await Promise.all([
        client.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        client.from('admin_capabilities').select('capability').eq('admin_id', user.id),
      ])
      if (meRes.data) setMe(meRes.data as AdminProfile)
      if (capsRes.data) setMyCaps(new Set((capsRes.data as { capability: string }[]).map(r => r.capability)))
    }

    const [appsRes, studentsRes, cohortsRes] = await Promise.all([
      client.from('applications').select('*').order('created_at', { ascending: false }),
      client.from('profiles').select('*').eq('role', 'student').order('enrolled_at', { ascending: false }),
      client.from('cohorts').select('id, name, region').order('created_at', { ascending: true }),
    ])

    if (appsRes.data)     setApplications(appsRes.data)
    if (studentsRes.data) setStudents(studentsRes.data)
    if (cohortsRes.data && cohortsRes.data.length > 0) {
      setCohorts(cohortsRes.data)
      setSelectedCohort(cohortsRes.data[0].id)
    }
    setLoading(false)
  }

  useEffect(() => { void Promise.resolve().then(fetchData) }, [])

  // Capability gating — primary admin implicitly holds every capability.
  const isPrimary = !!me?.is_primary_admin
  const can = (cap: string) => isPrimary || myCaps.has(cap)

  function notify(msg: string, isError = false) {
    setActionIsError(isError)
    setActionMsg(msg)
    setTimeout(() => { setActionMsg(''); setActionIsError(false) }, 3500)
  }

  async function updateStatus(id: string, status: string) {
    setActionLoading(true)
    setActionIsError(false)
    const client = createClient()
    if (!client) return

    if (status === 'accepted') {
      // Use the accept_and_enroll RPC for atomic accept + profile enrollment
      const { data, error } = await client.rpc('accept_and_enroll', {
        p_application_id: id,
        p_cohort_id: selectedCohort,
        p_admin_notes: adminNotes || null,
      })

      if (!error && data?.ok) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'accepted' } : a))
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'accepted' } : null)
        setActionMsg(data.message || 'Accepted')
        setAdminNotes('')
      } else {
        setActionIsError(true)
        setActionMsg(error?.message || data?.message || 'Accept failed')
      }
    } else {
      const { error } = await client
        .from('applications')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', id)

      if (!error) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: status as Application['status'] } : a))
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as Application['status'] } : null)
        setActionMsg(`Marked as ${status}`)
      } else {
        setActionIsError(true)
        setActionMsg(error.message)
      }
    }

    setTimeout(() => { setActionMsg(''); setActionIsError(false) }, 3500)
    setActionLoading(false)
  }

  async function handleSignOut() {
    const client = createClient()
    if (!client) return
    await client.auth.signOut()
    window.location.href = '/login'
  }

  // Stats
  const total     = applications.length
  const pending   = applications.filter(a => a.status === 'pending').length
  const accepted  = applications.filter(a => a.status === 'accepted').length
  const enrolled  = students.length

  // Filtered applicants
  const filtered = applications.filter(a => {
    const q = search.toLowerCase()
    const matchQ = !q || `${a.name} ${a.email} ${a.country || ''}`.toLowerCase().includes(q)
    const matchS = !statusFilter || a.status === statusFilter
    return matchQ && matchS
  })

  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    },
    {
      id: 'applicants',
      label: `Applicants (${total})`,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
    {
      id: 'students',
      label: `Students (${enrolled})`,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    },
    ...(can('manage_admins') ? [{
      id: 'team' as View,
      label: 'Team',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    }] : []),
    ...(can('review_labs') ? [{
      id: 'cohorts' as View,
      label: 'Cohorts',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z"/></svg>,
    }] : []),
    ...(can('edit_lessons') ? [{
      id: 'content' as View,
      label: 'Content',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    }] : []),
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>

      {/* Mobile hamburger + overlay (shown below 1024px) */}
      <button
        className="admin-menu-btn"
        aria-label={navOpen ? 'Close admin menu' : 'Open admin menu'}
        aria-expanded={navOpen}
        onClick={() => setNavOpen(o => !o)}
      >
        {navOpen
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>}
      </button>
      <div
        className={`admin-sidebar-overlay${navOpen ? ' open' : ''}`}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <nav className={`admin-sidebar${navOpen ? ' open' : ''}`} aria-label="Admin navigation">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <ZcashLogo />
          <span style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink)' }}>
            Zcash <em style={{ fontStyle: 'italic' }}>Builders</em>
          </span>
        </Link>

        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(248,113,113,0.7)', padding: '0 10px' }}>
          Admin Panel
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map(item => {
            const active = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => { setView(item.id); setNavOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px', border: 'none',
                  background: active ? 'rgba(248,113,113,0.08)' : 'transparent',
                  color: active ? '#f87171' : 'var(--ink-3)',
                  borderLeft: active ? '2px solid #f87171' : '2px solid transparent',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.15s', textAlign: 'left', width: '100%',
                  minHeight: 'var(--touch-min)',
                  fontFamily: 'var(--sans)',
                }}
              >
                <span style={{ width: '15px', height: '15px', flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}

          <div style={{ height: '1px', background: 'var(--line)', margin: '8px 0' }} />

          <Link href="/portal" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: 'var(--ink-3)', fontSize: '13px', fontWeight: 500, textDecoration: 'none', minHeight: 'var(--touch-min)' }}>
            <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Student Portal
          </Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: 'var(--ink-3)', fontSize: '13px', fontWeight: 500, textDecoration: 'none', minHeight: 'var(--touch-min)' }}>
            <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            Back to Site
          </Link>
        </div>

        <div style={{ flex: 1 }} />

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 12px', borderRadius: '8px', color: '#f87171', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', fontSize: '12px', cursor: 'pointer', width: '100%', fontFamily: 'var(--sans)', minHeight: '40px' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign out
        </button>

        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 12px', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '8px', background: 'rgba(248,113,113,0.06)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f87171', flexShrink: 0 }} />
          Admin Access
        </div>
      </nav>

      {/* Main content */}
      <main className="admin-main">
        <div className="admin-main-inner">

          {/* Page header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', paddingBottom: '28px', borderBottom: '1px solid var(--line)' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#f87171', marginBottom: '8px' }}>
                Zcash Builders · Admin
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,3vw,38px)', letterSpacing: '-0.025em', marginBottom: '4px' }}>
                {view === 'overview' ? <>Program <em style={{ fontStyle: 'italic' }}>Overview</em></> :
                 view === 'applicants' ? <em style={{ fontStyle: 'italic' }}>Applicants</em> :
                 view === 'students' ? <>Active <em style={{ fontStyle: 'italic' }}>Students</em></> :
                 view === 'team' ? <>Admin <em style={{ fontStyle: 'italic' }}>Team</em></> :
                 view === 'cohorts' ? <em style={{ fontStyle: 'italic' }}>Cohorts</em> :
                 <>Lesson <em style={{ fontStyle: 'italic' }}>Content</em></>}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink-3)' }}>
                {view === 'team' ? 'Admins, mentors & capabilities' :
                 view === 'cohorts' ? 'Lab review settings' :
                 view === 'content' ? 'Supporting videos & custom lessons' :
                 'Cohort 01 · 2026'}
              </div>
            </div>
            {actionMsg && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: actionIsError ? 'var(--red)' : 'var(--success)', background: actionIsError ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)', border: `1px solid ${actionIsError ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}`, padding: '8px 14px', borderRadius: '8px' }}>
                {actionIsError ? '✕' : '✓'} {actionMsg}
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: '12px', paddingTop: '40px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 0.7s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Loading…
            </div>
          ) : (
            <>
              {/* ── OVERVIEW ── */}
              {view === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Stat cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1px', background: 'var(--line)', border: '1px solid var(--line)', borderRadius: '10px', overflow: 'hidden' }}>
                    {[
                      { label: 'Total Applicants', val: total,    color: 'var(--gold)',    onClick: () => setView('applicants') },
                      { label: 'Pending Review',   val: pending,  color: 'var(--blue)',    onClick: () => { setView('applicants'); setStatusFilter('pending') } },
                      { label: 'Accepted',         val: accepted, color: 'var(--success)', onClick: () => { setView('applicants'); setStatusFilter('accepted') } },
                      { label: 'Active Students',  val: enrolled, color: 'var(--purple)',  onClick: () => setView('students') },
                    ].map(s => (
                      <div key={s.label} onClick={s.onClick} style={{ background: 'var(--bg-1)', padding: '20px 18px', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'var(--bg-1)')}
                      >
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '10px' }}>{s.label}</div>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: '40px', color: s.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Recent applications */}
                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '12px' }}>
                      Recent Applications
                    </div>
                    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '10px', overflow: 'hidden' }}>
                      {applications.slice(0, 6).map((a, i) => (
                        <div key={a.id} onClick={() => { setSelected(a); setView('applicants') }}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 18px', borderBottom: i < 5 ? '1px solid var(--line)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                          onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}22`, border: `1px solid ${AVATAR_COLORS[i % AVATAR_COLORS.length]}44`, color: AVATAR_COLORS[i % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '12px', flexShrink: 0 }}>
                            {initials(a.name)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-2)' }}>{a.name}</div>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)' }}>{a.email}</div>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-4)' }}>{a.country}</div>
                          <StatusPill status={a.status} />
                        </div>
                      ))}
                      {applications.length === 0 && (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: '12px' }}>
                          No applications yet — share your apply link!
                        </div>
                      )}
                    </div>
                    {applications.length > 6 && (
                      <button onClick={() => setView('applicants')} style={{ marginTop: '10px', color: 'var(--gold)', background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--sans)', padding: '4px 0' }}>
                        View all {applications.length} applicants →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── APPLICANTS ── */}
              {view === 'applicants' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Toolbar */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '360px' }}>
                      <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', stroke: 'var(--ink-4)', fill: 'none', pointerEvents: 'none' }} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, email, country…"
                        style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '9px 12px 9px 36px', borderRadius: '7px', fontSize: '13px', fontFamily: 'var(--sans)', outline: 'none', minHeight: '40px' }}
                        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                        onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                      style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', color: 'var(--ink-2)', padding: '9px 12px', borderRadius: '7px', fontFamily: 'var(--mono)', fontSize: '11px', outline: 'none', cursor: 'pointer', minHeight: '40px' }}
                    >
                      <option value="">All statuses</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="waitlisted">Waitlisted</option>
                    </select>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)', marginLeft: 'auto' }}>
                      {filtered.length} of {total}
                    </span>
                  </div>

                  {/* Table */}
                  <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '10px', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 120px', gap: '0', padding: '10px 18px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line)' }}>
                      {['Applicant', 'Background', 'Country', 'Applied', 'Status'].map(h => (
                        <div key={h} style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>{h}</div>
                      ))}
                    </div>
                    {/* Rows */}
                    {filtered.length === 0 ? (
                      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: '12px' }}>No applications match your search.</div>
                    ) : filtered.map((a, i) => (
                      <div
                        key={a.id}
                        onClick={() => setSelected(a)}
                        style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 120px', alignItems: 'center', padding: '13px 18px', borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}22`, border: `1px solid ${AVATAR_COLORS[i % AVATAR_COLORS.length]}44`, color: AVATAR_COLORS[i % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '12px', flexShrink: 0 }}>
                            {initials(a.name)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{a.background || '—'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{a.country || '—'}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)' }}>
                          {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                        <StatusPill status={a.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STUDENTS ── */}
              {view === 'students' && (
                <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '10px', overflow: 'hidden' }}>
                  {students.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: '12px', lineHeight: 1.7 }}>
                      No enrolled students yet.<br/>Accept applicants to enroll them.
                    </div>
                  ) : students.map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderBottom: i < students.length - 1 ? '1px solid var(--line)' : 'none' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}22`, border: `1px solid ${AVATAR_COLORS[i % AVATAR_COLORS.length]}44`, color: AVATAR_COLORS[i % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '13px', flexShrink: 0 }}>
                        {initials(s.name || 'S')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-2)' }}>{s.name || 'Unnamed'}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)' }}>{s.country || '—'}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)' }}>
                        Enrolled {s.enrolled_at ? new Date(s.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                      </div>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', padding: '3px 9px', borderRadius: '100px', background: 'rgba(74,222,128,0.08)', color: 'var(--success)', border: '1px solid rgba(74,222,128,0.2)' }}>
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── TEAM ── */}
              {view === 'team' && can('manage_admins') && (
                <TeamTab currentUserId={me?.id ?? null} notify={notify} />
              )}

              {/* ── COHORTS ── */}
              {view === 'cohorts' && can('review_labs') && (
                <CohortsTab notify={notify} />
              )}

              {/* ── CONTENT ── */}
              {view === 'content' && can('edit_lessons') && (
                <ContentTab notify={notify} />
              )}
            </>
          )}
        </div>
      </main>

      {/* ── DETAIL MODAL ── */}
      {selected && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: '12px', width: 'min(560px,100%)', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal header */}
            <div style={{ padding: '22px 26px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: '6px' }}>
                  {selected.country || 'Applicant'} · {selected.background || '—'}
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '22px', marginBottom: '3px' }}>{selected.name}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)' }}>{selected.email}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: '1px solid var(--line-2)', color: 'var(--ink-3)', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Status', val: <StatusPill status={selected.status} /> },
                  { label: 'Applied', val: new Date(selected.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'GitHub', val: selected.github ? `@${selected.github}` : '—' },
                  { label: 'Cohort', val: selected.cohort_id || 'cohort-01' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '12px 14px', background: 'var(--bg-3)', border: '1px solid var(--line-2)', borderRadius: '8px' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-4)', marginBottom: '5px' }}>{item.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--ink-2)' }}>{item.val}</div>
                  </div>
                ))}
              </div>

              {/* Motivation */}
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-4)', marginBottom: '8px' }}>Motivation</div>
                <div style={{ fontSize: '13px', color: 'var(--ink-2)', lineHeight: 1.75, background: 'var(--bg-3)', padding: '14px', borderRadius: '8px', border: '1px solid var(--line-2)' }}>
                  {selected.motivation || 'No motivation provided.'}
                </div>
              </div>

              {/* Enrolled badge */}
              {selected.status === 'accepted' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2.5} strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--success)' }}>
                    Accepted · enrolled in cohort-01
                  </span>
                </div>
              )}

              {/* Cohort selector */}
              {selected.status === 'pending' && cohorts.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-4)', marginBottom: '8px' }}>Enroll Into Cohort</div>
                  <select
                    value={selectedCohort}
                    onChange={e => setSelectedCohort(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-3)', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '10px 12px', borderRadius: '8px', fontFamily: 'var(--mono)', fontSize: '12px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
                  >
                    {cohorts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}{c.region ? ` · ${c.region}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Admin notes */}
              {selected.status === 'pending' && (
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-4)', marginBottom: '8px' }}>Admin Notes (optional)</div>
                  <textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Internal notes saved with the decision…"
                    rows={2}
                    style={{ width: '100%', background: 'var(--bg-3)', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--sans)', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
                  />
                </div>
              )}

              {/* Action buttons — only for pending */}
              {selected.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => updateStatus(selected.id, 'accepted')}
                    disabled={actionLoading}
                    style={{ flex: 1, padding: '11px', background: 'var(--gold)', color: '#000', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '8px', cursor: actionLoading ? 'not-allowed' : 'pointer', minHeight: '44px', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {actionLoading ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 0.7s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    ) : '✓'} Accept & Enroll
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, 'waitlisted')}
                    disabled={actionLoading}
                    style={{ flex: 1, padding: '11px', background: 'var(--bg-3)', color: 'var(--ink-2)', fontSize: '13px', border: '1px solid var(--line-2)', borderRadius: '8px', cursor: actionLoading ? 'not-allowed' : 'pointer', minHeight: '44px', fontFamily: 'var(--sans)' }}
                  >
                    — Waitlist
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, 'rejected')}
                    disabled={actionLoading}
                    style={{ padding: '11px 16px', background: 'rgba(248,113,113,0.08)', color: 'var(--red)', fontSize: '13px', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', cursor: actionLoading ? 'not-allowed' : 'pointer', minHeight: '44px', fontFamily: 'var(--sans)' }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Already reviewed */}
              {(selected.status as string) !== 'pending' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selected.status !== 'accepted' && (
                    <button onClick={() => updateStatus(selected.id, 'accepted')} disabled={actionLoading}
                      style={{ padding: '10px 16px', background: 'rgba(74,222,128,0.08)', color: 'var(--success)', fontSize: '13px', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--sans)', minHeight: '44px' }}>
                      Move to Accepted
                    </button>
                  )}
                  {(selected.status as string) !== 'pending' && (
                    <button onClick={() => updateStatus(selected.id, 'pending')} disabled={actionLoading}
                      style={{ padding: '10px 16px', background: 'var(--bg-3)', color: 'var(--ink-3)', fontSize: '13px', border: '1px solid var(--line-2)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--sans)', minHeight: '44px' }}>
                      Reset to Pending
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          main { padding-left: 0 !important; }
          nav { display: none; }
        }
      `}</style>
    </div>
  )
}
