'use client'

// Shared helpers + style primitives for the admin tabs.
// Single source for the small bits the admin page and its tab components reuse,
// matching the visual language of src/app/admin/page.tsx and globals.css.

import type { Profile } from '@/types'

/** A profile row as returned by `select('*')` — includes the primary-admin flag
 *  which is not part of the base Profile type. */
export type AdminProfile = Profile & { is_primary_admin?: boolean }

/** Banner callback owned by the admin page; tabs call it to report results. */
export type Notify = (msg: string, isError?: boolean) => void

/** The admin capabilities the backend recognises. */
export const CAPABILITIES = [
  { id: 'review_labs',         label: 'Review labs' },
  { id: 'manage_applications', label: 'Manage applications' },
  { id: 'manage_cohort',       label: 'Manage cohort' },
  { id: 'edit_lessons',        label: 'Edit lessons' },
  { id: 'manage_admins',       label: 'Manage admins' },
] as const

export type CapabilityId = (typeof CAPABILITIES)[number]['id']

export const ADMIN_ROLES = ['student', 'mentor', 'admin', 'admin+student'] as const

export function initials(name: string | null | undefined) {
  return (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export const AVATAR_COLORS = ['#f4b728', '#63b4ff', '#c084fc', '#4ade80', '#f87171', '#fb923c', '#38bdf8', '#a3e635']

export function Avatar({ name, i, size = 32 }: { name: string | null | undefined; i: number; size?: number }) {
  const c = AVATAR_COLORS[((i % AVATAR_COLORS.length) + AVATAR_COLORS.length) % AVATAR_COLORS.length]
  return (
    <div
      aria-hidden="true"
      style={{
        width: size, height: size, borderRadius: '50%',
        background: `${c}22`, border: `1px solid ${c}44`, color: c,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--serif)', fontSize: `${Math.round(size * 0.4)}px`, flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  )
}

// ── Shared style primitives ────────────────────────────────────────────────

export const monoLabel: React.CSSProperties = {
  fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.12em',
  textTransform: 'uppercase', color: 'var(--ink-4)',
}

export const panelStyle: React.CSSProperties = {
  background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '10px', overflow: 'hidden',
}

export const fieldStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg-3)', border: '1px solid var(--line-2)', color: 'var(--ink)',
  padding: '9px 12px', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--sans)',
  outline: 'none', boxSizing: 'border-box', minHeight: '40px',
}

/** Small focus helpers that mirror the page's gold focus ring. */
export function goldFocus(e: React.FocusEvent<HTMLElement>) { e.currentTarget.style.borderColor = 'var(--gold)' }
export function clearFocus(e: React.FocusEvent<HTMLElement>) { e.currentTarget.style.borderColor = 'var(--line-2)' }

/** A soft chip used for capabilities / badges. */
export function Chip({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'gold' | 'success' | 'red' }) {
  const tones: Record<string, { color: string; bg: string; border: string }> = {
    neutral: { color: 'var(--ink-3)', bg: 'var(--bg-3)',            border: 'var(--line-2)' },
    gold:    { color: 'var(--gold)',  bg: 'var(--gold-faint)',       border: 'var(--gold-dim)' },
    success: { color: 'var(--success)', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
    red:     { color: 'var(--red)',   bg: 'rgba(248,113,113,0.08)',  border: 'rgba(248,113,113,0.2)' },
  }
  const s = tones[tone]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.06em',
      textTransform: 'uppercase', padding: '3px 9px', borderRadius: '100px',
      color: s.color, background: s.bg, border: `1px solid ${s.border}`, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      style={{ animation: 'spin 0.7s linear infinite' }} aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: '12px', paddingTop: '24px' }}>
      <Spinner size={16} /> {label}
    </div>
  )
}
