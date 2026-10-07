'use client'

// Team tab — manage who is an admin and what they can do.
// Visible only when the current user is primary admin OR holds 'manage_admins'.

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  type AdminProfile, type Notify, CAPABILITIES, ADMIN_ROLES,
  Avatar, Chip, Loading, Spinner, monoLabel, panelStyle, fieldStyle, goldFocus, clearFocus,
} from './shared'

type Props = {
  currentUserId: string | null
  notify: Notify
}

const ADMIN_LIKE_ROLES = ['admin', 'admin+student', 'mentor']

export default function TeamTab({ currentUserId, notify }: Props) {
  const [loading, setLoading]   = useState(true)
  const [profiles, setProfiles] = useState<AdminProfile[]>([])
  const [caps, setCaps]         = useState<Record<string, Set<string>>>({})
  const [busy, setBusy]         = useState<string | null>(null)
  const [promoteSearch, setPromoteSearch] = useState('')

  const fetchTeam = useCallback(async () => {
    const client = createClient()
    if (!client) return // null only during SSR/build; tabs mount with a valid client

    const [profRes, capRes] = await Promise.all([
      client.from('profiles').select('*').order('name', { ascending: true }),
      client.from('admin_capabilities').select('admin_id, capability'),
    ])

    if (profRes.error) notify(profRes.error.message, true)
    if (capRes.error)  notify(capRes.error.message, true)

    const byAdmin: Record<string, Set<string>> = {}
    for (const row of (capRes.data as { admin_id: string; capability: string }[] | null) ?? []) {
      ;(byAdmin[row.admin_id] ??= new Set()).add(row.capability)
    }
    setCaps(byAdmin)
    setProfiles((profRes.data as AdminProfile[] | null) ?? [])
    setLoading(false)
  }, [notify])

  useEffect(() => { void Promise.resolve().then(fetchTeam) }, [fetchTeam])

  // Admins = anyone with an admin-like role OR anyone holding a capability.
  const admins = profiles.filter(p => ADMIN_LIKE_ROLES.includes(p.role) || (caps[p.id]?.size ?? 0) > 0)

  async function handleRole(p: AdminProfile, role: string) {
    if (p.is_primary_admin) return // never change the primary admin's role
    if (p.id === currentUserId && !['admin', 'admin+student'].includes(role)) {
      if (!window.confirm('This changes your OWN admin role and may remove your admin access. Continue?')) return
    }
    const client = createClient()
    if (!client) return
    setBusy(`role:${p.id}`)
    const { data, error } = await client.rpc('set_admin_role', { p_user_id: p.id, p_role: role })
    if (error || !(data as { ok?: boolean })?.ok) {
      notify(error?.message || (data as { message?: string })?.message || 'Could not change role', true)
    } else {
      notify((data as { message?: string }).message || `Role set to ${role}`)
      setProfiles(prev => prev.map(x => x.id === p.id ? { ...x, role: role as AdminProfile['role'] } : x))
    }
    setBusy(null)
  }

  async function toggleCap(p: AdminProfile, capId: string, has: boolean) {
    if (p.is_primary_admin) return // primary admin always has every capability
    const client = createClient()
    if (!client) return
    setBusy(`cap:${p.id}:${capId}`)
    const rpc = has ? 'revoke_admin_capability' : 'grant_admin_capability'
    const { data, error } = await client.rpc(rpc, { p_user_id: p.id, p_capability: capId })
    if (error || !(data as { ok?: boolean })?.ok) {
      notify(error?.message || (data as { message?: string })?.message || 'Could not update capability', true)
    } else {
      notify((data as { message?: string }).message || `${has ? 'Revoked' : 'Granted'} ${capId}`)
      setCaps(prev => {
        const next = { ...prev }
        const set = new Set(next[p.id] ?? [])
        if (has) set.delete(capId); else set.add(capId)
        next[p.id] = set
        return next
      })
    }
    setBusy(null)
  }

  async function promote(p: AdminProfile) {
    const client = createClient()
    if (!client) return
    setBusy(`promote:${p.id}`)
    const { data, error } = await client.rpc('set_admin_role', { p_user_id: p.id, p_role: 'admin' })
    if (error || !(data as { ok?: boolean })?.ok) {
      notify(error?.message || (data as { message?: string })?.message || 'Could not promote', true)
    } else {
      notify((data as { message?: string }).message || `${p.name} is now an admin`)
      setProfiles(prev => prev.map(x => x.id === p.id ? { ...x, role: 'admin' } : x))
      setPromoteSearch('')
    }
    setBusy(null)
  }

  if (loading) return <Loading />

  const q = promoteSearch.trim().toLowerCase()
  const promoteMatches = q
    ? profiles.filter(p =>
        !ADMIN_LIKE_ROLES.includes(p.role) &&
        (caps[p.id]?.size ?? 0) === 0 &&
        (p.name || '').toLowerCase().includes(q),
      ).slice(0, 6)
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Admins list */}
      <div>
        <div style={{ ...monoLabel, marginBottom: '12px' }}>Team ({admins.length})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {admins.length === 0 && (
            <div style={{ ...panelStyle, padding: '32px', textAlign: 'center', color: 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: '12px' }}>
              No admins or mentors yet.
            </div>
          )}
          {admins.map((p, i) => {
            const held = caps[p.id] ?? new Set<string>()
            const isSelf = p.id === currentUserId
            return (
              <div key={p.id} style={{ ...panelStyle, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Identity row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <Avatar name={p.name} i={i} size={34} />
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-2)' }}>{p.name || 'Unnamed'}</span>
                      {p.is_primary_admin && <Chip label="Primary" tone="gold" />}
                      {isSelf && <Chip label="You" tone="neutral" />}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)', marginTop: '3px' }}>
                      {p.country || '—'}
                    </div>
                  </div>
                  {/* Role control */}
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ ...monoLabel, fontSize: '9px' }}>Role</span>
                    <select
                      aria-label={`Role for ${p.name || 'user'}`}
                      value={ADMIN_ROLES.includes(p.role as typeof ADMIN_ROLES[number]) ? p.role : 'admin'}
                      disabled={p.is_primary_admin || busy === `role:${p.id}`}
                      onChange={e => handleRole(p, e.target.value)}
                      onFocus={goldFocus} onBlur={clearFocus}
                      style={{
                        background: 'var(--bg-3)', border: '1px solid var(--line-2)', color: 'var(--ink-2)',
                        padding: '8px 10px', borderRadius: '7px', fontFamily: 'var(--mono)', fontSize: '11px',
                        outline: 'none', cursor: p.is_primary_admin ? 'not-allowed' : 'pointer',
                        opacity: p.is_primary_admin ? 0.55 : 1, minHeight: '38px',
                      }}
                    >
                      {ADMIN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                </div>

                {/* Capability toggles */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CAPABILITIES.map(cap => {
                    const on = p.is_primary_admin || held.has(cap.id)
                    const locked = p.is_primary_admin
                    const thisBusy = busy === `cap:${p.id}:${cap.id}`
                    return (
                      <button
                        key={cap.id}
                        type="button"
                        aria-pressed={on}
                        disabled={locked || thisBusy}
                        onClick={() => toggleCap(p, cap.id, held.has(cap.id))}
                        title={locked ? 'Primary admin has every capability' : (on ? 'Click to revoke' : 'Click to grant')}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.04em',
                          textTransform: 'uppercase', padding: '6px 10px', borderRadius: '100px',
                          cursor: locked ? 'not-allowed' : (thisBusy ? 'wait' : 'pointer'),
                          color: on ? 'var(--success)' : 'var(--ink-4)',
                          background: on ? 'rgba(74,222,128,0.08)' : 'var(--bg-3)',
                          border: `1px solid ${on ? 'rgba(74,222,128,0.25)' : 'var(--line-2)'}`,
                          opacity: locked ? 0.7 : 1, minHeight: '32px',
                        }}
                      >
                        {thisBusy ? <Spinner size={11} />
                          : <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: on ? 'var(--success)' : 'var(--ink-5)', flexShrink: 0 }} />}
                        {cap.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Promote a non-admin */}
      <div>
        <div style={{ ...monoLabel, marginBottom: '8px' }}>Make someone an admin</div>
        <div style={{ ...panelStyle, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ position: 'relative', maxWidth: '360px' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', stroke: 'var(--ink-4)', fill: 'none', pointerEvents: 'none' }} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
              type="text"
              aria-label="Search people by name to promote"
              value={promoteSearch}
              onChange={e => setPromoteSearch(e.target.value)}
              placeholder="Search people by name…"
              style={{ ...fieldStyle, paddingLeft: '36px' }}
              onFocus={goldFocus} onBlur={clearFocus}
            />
          </div>
          {q && promoteMatches.length === 0 && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)' }}>No non-admin profiles match “{promoteSearch}”.</div>
          )}
          {promoteMatches.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar name={p.name} i={i} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: 'var(--ink-2)' }}>{p.name || 'Unnamed'}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)' }}>{p.role}</div>
              </div>
              <button
                type="button"
                disabled={busy === `promote:${p.id}`}
                onClick={() => promote(p)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', background: 'var(--gold)', color: '#000', fontWeight: 700,
                  fontSize: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontFamily: 'var(--sans)', minHeight: '38px',
                }}
              >
                {busy === `promote:${p.id}` ? <Spinner size={12} /> : '+'} Make admin
              </button>
            </div>
          ))}
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-5)' }}>
            Profiles have no email — search by name. Promoting sets the role to “admin”; grant capabilities above.
          </div>
        </div>
      </div>
    </div>
  )
}
