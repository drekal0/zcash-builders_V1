'use client'

// Cohorts tab — set each cohort's lab review mode.
// Visible when the current user is primary admin OR holds 'review_labs'.

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type Notify, Loading, Spinner, monoLabel, panelStyle } from './shared'

type CohortRow = { id: string; name: string; region?: string | null; lab_review_mode: 'manual' | 'auto' }

type Props = { notify: Notify }

const MODES: { id: 'manual' | 'auto'; label: string }[] = [
  { id: 'manual', label: 'Manual' },
  { id: 'auto',   label: 'Auto (coming soon)' },
]

export default function CohortsTab({ notify }: Props) {
  const [loading, setLoading] = useState(true)
  const [cohorts, setCohorts] = useState<CohortRow[]>([])
  const [busy, setBusy]       = useState<string | null>(null)

  const fetchCohorts = useCallback(async () => {
    const client = createClient()
    if (!client) return // null only during SSR/build; tab mounts with a valid client
    const { data, error } = await client
      .from('cohorts')
      .select('id, name, region, lab_review_mode')
      .order('id', { ascending: true })
    if (error) notify(error.message, true)
    setCohorts((data as CohortRow[] | null) ?? [])
    setLoading(false)
  }, [notify])

  useEffect(() => { void Promise.resolve().then(fetchCohorts) }, [fetchCohorts])

  async function setMode(c: CohortRow, mode: 'manual' | 'auto') {
    if (c.lab_review_mode === mode) return
    const client = createClient()
    if (!client) return
    setBusy(c.id)
    const { data, error } = await client.rpc('set_cohort_lab_review_mode', { p_cohort_id: c.id, p_mode: mode })
    if (error || !(data as { ok?: boolean })?.ok) {
      notify(error?.message || (data as { message?: string })?.message || 'Could not set review mode', true)
    } else {
      notify((data as { message?: string }).message || `${c.name}: lab review set to ${mode}`)
      setCohorts(prev => prev.map(x => x.id === c.id ? { ...x, lab_review_mode: mode } : x))
    }
    setBusy(null)
  }

  if (loading) return <Loading />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Explainer note */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px',
        background: 'var(--gold-faint)', border: '1px solid var(--gold-dim)', borderRadius: '8px',
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth={1.8} strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
        <div style={{ fontSize: '12px', color: 'var(--ink-3)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--ink-2)' }}>Manual</strong> means a mentor reviews every lab submission by hand.
          <strong style={{ color: 'var(--ink-2)' }}> Auto</strong> (automatic checks) is a later phase —
          selecting it has <em>no effect yet</em>; submissions still need a manual review.
        </div>
      </div>

      <div style={{ ...monoLabel }}>Cohorts ({cohorts.length})</div>

      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column' }}>
        {cohorts.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: '12px' }}>No cohorts yet.</div>
        ) : cohorts.map((c, i) => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
            padding: '16px 18px', borderBottom: i < cohorts.length - 1 ? '1px solid var(--line)' : 'none',
          }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-2)' }}>{c.name}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)', marginTop: '3px' }}>
                {c.id}{c.region ? ` · ${c.region}` : ''}
              </div>
            </div>

            {/* Segmented mode control */}
            <div
              role="group"
              aria-label={`Lab review mode for ${c.name}`}
              style={{ display: 'inline-flex', background: 'var(--bg-3)', border: '1px solid var(--line-2)', borderRadius: '8px', padding: '3px', gap: '3px' }}
            >
              {MODES.map(m => {
                const active = c.lab_review_mode === m.id
                const thisBusy = busy === c.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={active}
                    disabled={thisBusy}
                    onClick={() => setMode(c, m.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '7px 12px', borderRadius: '6px', border: 'none',
                      fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.04em', textTransform: 'uppercase',
                      cursor: thisBusy ? 'wait' : 'pointer', minHeight: '34px',
                      background: active ? (m.id === 'auto' ? 'var(--bg-4)' : 'var(--gold)') : 'transparent',
                      color: active ? (m.id === 'auto' ? 'var(--ink-3)' : '#000') : 'var(--ink-4)',
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {thisBusy && active ? <Spinner size={11} /> : null}
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
