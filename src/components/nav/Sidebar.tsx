'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  children?: { href: string; label: string }[]
}

interface SidebarProps {
  role?: 'student' | 'admin' | 'admin+student' | 'mentor' | 'region_lead'
  userName?: string
  userInitial?: string
  cohort?: string
}

const ZcashLogo = () => (
  <svg width="30" height="30" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="m270,540c0-148.9,121.1-270,270-270s270,121.1,270,270-121.1,270-270,270-270-121.1-270-270Zm366.31-125.3v41.09l-114.28,155h114.28v54.5h-73.67v45.16h-45.28v-45.16h-73.67v-41.09l114.16-155h-114.16v-54.5h73.67v-45.28h45.28v45.28h73.67Z"
      fill="#f4b728"
      fillRule="evenodd"
    />
  </svg>
)

const icons = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  learn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  community: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
}

export default function Sidebar({ role = 'student', userName = 'Student', userInitial = 'S', cohort = 'Cohort 01' }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [learnExpanded, setLearnExpanded] = useState(false)

  // Close sidebar on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Auto-expand learn dropdown if on a learn route
  useEffect(() => {
    if (pathname.startsWith('/learn') || pathname.startsWith('/dashboard')) {
      setLearnExpanded(true)
    }
  }, [pathname])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href: string) => {
    if (href === '/portal') return pathname === '/portal'
    return pathname.startsWith(href)
  }

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: active ? 'var(--gold)' : 'var(--ink-3)',
    background: active ? 'var(--gold-faint)' : 'transparent',
    border: `1px solid ${active ? 'var(--gold-dim)' : 'transparent'}`,
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
    textDecoration: 'none',
    minHeight: 'var(--touch-min)',
  })

  const iconStyle: React.CSSProperties = {
    width: '15px',
    height: '15px',
    flexShrink: 0,
    opacity: 0.75,
  }

  return (
    <>
      {/* ── Hamburger button — tablet + mobile only ── */}
      <button
        className="menu-btn"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
      >
        <span style={iconStyle}>{icons.menu}</span>
      </button>

      {/* ── Overlay backdrop ── */}
      <div
        className={`sidebar-overlay ${open ? 'open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <nav
        className={`sidebar ${open ? 'open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Close button (tablet + mobile) */}
        <button
          className="hide-desktop show-tablet"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            background: 'var(--bg-3)',
            border: '1px solid var(--line-2)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--ink-3)',
          }}
        >
          <span style={{ width: '14px', height: '14px' }}>{icons.close}</span>
        </button>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <ZcashLogo />
          <span style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--ink)' }}>
            Zcash <em style={{ fontStyle: 'italic' }}>Builders</em>
          </span>
        </Link>

        {/* Nav label */}
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-5)', padding: '0 10px' }}>
          Student Portal
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>

          {/* Portal */}
          <Link href="/portal" style={navLinkStyle(isActive('/portal'))}>
            <span style={iconStyle}>{icons.home}</span>
            My Portal
          </Link>

          {/* Dashboard */}
          <Link href="/dashboard" style={navLinkStyle(isActive('/dashboard'))}>
            <span style={iconStyle}>{icons.dashboard}</span>
            Dashboard
          </Link>

          {/* Learning Path — expandable */}
          <button
            onClick={() => setLearnExpanded(!learnExpanded)}
            style={{
              ...navLinkStyle(isActive('/learn')),
              width: '100%',
              border: 'none',
              background: isActive('/learn') ? 'var(--gold-faint)' : 'transparent',
            }}
          >
            <span style={iconStyle}>{icons.learn}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>Learning Path</span>
            <span style={{
              width: '12px',
              height: '12px',
              flexShrink: 0,
              transition: 'transform 0.2s',
              transform: learnExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              opacity: 0.5,
            }}>
              {icons.chevron}
            </span>
          </button>

          {/* Learning Path children */}
          {learnExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', paddingLeft: '10px', borderLeft: '1px solid var(--line-2)', marginLeft: '15px' }}>
              <Link
                href="/learn/curriculum"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '6px', color: isActive('/learn/curriculum') ? 'var(--gold)' : 'var(--ink-3)', background: isActive('/learn/curriculum') ? 'var(--gold-faint)' : 'transparent', fontSize: '12px', fontWeight: 500, minHeight: '36px' }}
              >
                Curriculum
              </Link>
              <Link
                href="/learn/tree"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '6px', color: isActive('/learn/tree') ? 'var(--gold)' : 'var(--ink-3)', background: isActive('/learn/tree') ? 'var(--gold-faint)' : 'transparent', fontSize: '12px', fontWeight: 500, minHeight: '36px' }}
              >
                Lesson Tree
              </Link>
            </div>
          )}

          {/* Community */}
          <Link href="/portal#community" style={navLinkStyle(false)}>
            <span style={iconStyle}>{icons.community}</span>
            Community
          </Link>

          {/* Admin link — only for admin */}
          {(role === 'admin' || role === 'admin+student') && (
            <Link href="/admin" style={{ ...navLinkStyle(isActive('/admin')), color: 'var(--red)', borderColor: isActive('/admin') ? 'var(--red-dim)' : 'transparent', background: isActive('/admin') ? 'var(--red-faint)' : 'transparent', marginTop: '8px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
              <span style={iconStyle}>{icons.admin}</span>
              Admin Panel
            </Link>
          )}

          {/* Region Lead Dashboard */}
          {role === 'region_lead' && (
            <Link href="/lead-admin" style={{ ...navLinkStyle(isActive('/lead-admin')), color: '#f4b728', borderColor: isActive('/lead-admin') ? 'rgba(244,183,40,0.3)' : 'transparent', background: isActive('/lead-admin') ? 'rgba(244,183,40,0.08)' : 'transparent', marginTop: '8px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
              <span style={iconStyle}>{icons.admin}</span>
              Region Dashboard
            </Link>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(244,183,40,0.12)', border: '1px solid var(--gold-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--serif)', fontSize: '13px', color: 'var(--gold)',
          }}>
            {userInitial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)' }}>
              {cohort}
            </div>
          </div>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
        </div>

        {/* Sign out */}
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '9px 12px', borderRadius: '8px',
            color: 'var(--ink-4)', background: 'none',
            border: '1px solid var(--line-2)', fontSize: '12px',
            cursor: 'pointer', transition: 'all 0.2s', width: '100%',
            minHeight: 'var(--touch-min)',
          }}
          onClick={() => { /* Supabase signOut comes in next session */ }}
          aria-label="Sign out"
        >
          <span style={{ width: '13px', height: '13px' }}>{icons.logout}</span>
          Sign out
        </button>
      </nav>

      {/* ── Bottom nav — mobile only ── */}
      <nav className="bottom-nav" aria-label="Bottom navigation">
        <Link href="/portal" className={`bottom-nav-item ${pathname === '/portal' ? 'active' : ''}`} aria-label="My Portal">
          <span style={{ width: '20px', height: '20px' }}>{icons.home}</span>
          <span className="bottom-nav-label">Portal</span>
        </Link>
        <Link href="/dashboard" className={`bottom-nav-item ${pathname.startsWith('/dashboard') ? 'active' : ''}`} aria-label="Dashboard">
          <span style={{ width: '20px', height: '20px' }}>{icons.dashboard}</span>
          <span className="bottom-nav-label">Learn</span>
        </Link>
        <Link href="/learn/curriculum" className={`bottom-nav-item ${pathname.startsWith('/learn') ? 'active' : ''}`} aria-label="Learning Path">
          <span style={{ width: '20px', height: '20px' }}>{icons.learn}</span>
          <span className="bottom-nav-label">Path</span>
        </Link>
        <Link href="/portal#community" className="bottom-nav-item" aria-label="Community">
          <span style={{ width: '20px', height: '20px' }}>{icons.community}</span>
          <span className="bottom-nav-label">Chat</span>
        </Link>
      </nav>
    </>
  )
}
