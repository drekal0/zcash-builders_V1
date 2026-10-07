'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const ZcashLogo = () => (
  <svg width="32" height="32" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
    <path d="m270,540c0-148.9,121.1-270,270-270s270,121.1,270,270-121.1,270-270,270-270-121.1-270-270Zm366.31-125.3v41.09l-114.28,155h114.28v54.5h-73.67v45.16h-45.28v-45.16h-73.67v-41.09l114.16-155h-114.16v-54.5h73.67v-45.28h45.28v45.28h73.67Z" fill="#f4b728" fillRule="evenodd"/>
  </svg>
)

const backgrounds = [
  { value: 'rust',       label: 'Rust' },
  { value: 'typescript', label: 'TypeScript / JavaScript' },
  { value: 'python',     label: 'Python' },
  { value: 'mobile',     label: 'Mobile (iOS / Android)' },
  { value: 'go',         label: 'Go' },
  { value: 'other',      label: 'Other' },
]

interface FormData {
  name: string
  email: string
  github: string
  country: string
  background: string
  motivation: string
}

export default function ApplyPage() {
  

  const [form, setForm] = useState<FormData>({
    name: '', email: '', github: '', country: '', background: '', motivation: '',
  })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [submitted, setSubmitted] = useState(false)

  function update(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name.trim())       return setError('Please enter your full name.')
    if (!form.email.trim())      return setError('Please enter your email.')
    if (!form.background)        return setError('Please select your primary language.')
    if (form.motivation.trim().length < 50) return setError('Please tell us a bit more about your motivation (at least 50 characters).')

    setLoading(true)

    const client = createClient()
    if (!client) { setError('Service not available. Please try again later.'); setLoading(false); return; }

    const { error } = await client
      .from('applications')
      .insert({
        name:       form.name.trim(),
        email:      form.email.trim().toLowerCase(),
        github:     form.github.trim() || null,
        country:    form.country.trim() || null,
        background: form.background,
        motivation: form.motivation.trim(),
        cohort_id:  'cohort-01',
        status:     'pending',
      })

    if (error) {
      // Duplicate email
      if (error.code === '23505') {
        setError('This email has already been used to apply. Check your inbox for a confirmation.')
      } else {
        setError('Something went wrong. Please try again.')
        console.error(error)
      }
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-3)',
    border: '1px solid var(--line-2)',
    color: 'var(--ink)',
    padding: '12px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'var(--sans)',
    outline: 'none',
    minHeight: '44px',
    transition: 'border-color 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--mono)',
    fontSize: '10px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: 'var(--ink-4)',
    display: 'block',
    marginBottom: '6px',
  }

  // Success state
  if (submitted) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px,4vw,40px)' }}>
        <div style={{ width: 'min(480px,100%)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
            ✓
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px,3vw,32px)' }}>
            Application received
          </div>
          <div style={{ fontSize: '14px', color: 'var(--ink-3)', lineHeight: 1.7, maxWidth: '380px' }}>
            Thanks <strong style={{ color: 'var(--ink-2)' }}>{form.name.split(' ')[0]}</strong> — we have your application for Cohort 01. We review applications on a rolling basis and will email you at <strong style={{ color: 'var(--ink-2)' }}>{form.email}</strong> with a decision.
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
            <Link href="/learn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 20px', background: 'var(--gold)', color: '#000', fontWeight: 600, fontSize: '13px', borderRadius: '8px', minHeight: '44px' }}>
              Browse curriculum
            </Link>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 20px', border: '1px solid var(--line-2)', color: 'var(--ink-3)', fontSize: '13px', borderRadius: '8px', minHeight: '44px' }}>
              Back to home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: 'clamp(32px,5vw,60px) clamp(16px,4vw,40px)' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Header */}
        <div>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <ZcashLogo />
            <span style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink)' }}>
              Zcash <em style={{ fontStyle: 'italic' }}>Builders</em>
            </span>
          </Link>

          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '10px' }}>
            Cohort 01 · November 2026 · Open applications
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,42px)', letterSpacing: '-0.025em', marginBottom: '10px' }}>
            Apply to Zcash <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Builders</em>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ink-3)', lineHeight: 1.7 }}>
            8 weeks · Free · Fully remote. We welcome developers at all levels — you don't need blockchain experience, just programming experience and genuine curiosity about privacy technology.
          </p>
        </div>

        {/* What you'll need callout */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>Before you apply</div>
          <div style={{ fontSize: '13px', color: 'var(--ink-2)', lineHeight: 1.7 }}>
            ✓ &nbsp;Some programming experience (any language)<br/>
            ✓ &nbsp;About 5 hours per week for 8 weeks<br/>
            ✓ &nbsp;A GitHub account<br/>
            ✓ &nbsp;~$5–10 in ZEC for the final mainnet deployment (Week 8 only)
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Name + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Amara Okonkwo"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
              />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="amara@example.com"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
              />
            </div>
          </div>

          {/* GitHub + Country */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div>
              <label style={labelStyle}>GitHub Username</label>
              <input
                type="text"
                value={form.github}
                onChange={e => update('github', e.target.value)}
                placeholder="akonkwo"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
              />
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <input
                type="text"
                value={form.country}
                onChange={e => update('country', e.target.value)}
                placeholder="Nigeria"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
              />
            </div>
          </div>

          {/* Primary language */}
          <div>
            <label style={labelStyle}>Primary Programming Language *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
              {backgrounds.map(bg => (
                <button
                  key={bg.value}
                  type="button"
                  onClick={() => update('background', bg.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${form.background === bg.value ? 'var(--gold-dim)' : 'var(--line-2)'}`,
                    background: form.background === bg.value ? 'var(--gold-faint)' : 'var(--bg-3)',
                    color: form.background === bg.value ? 'var(--gold)' : 'var(--ink-3)',
                    fontSize: '13px',
                    fontFamily: 'var(--sans)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                    minHeight: '44px',
                  }}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Motivation */}
          <div>
            <label style={labelStyle}>Why do you want to build on Zcash? *</label>
            <textarea
              value={form.motivation}
              onChange={e => update('motivation', e.target.value)}
              placeholder="Tell us what you want to build, why privacy matters to you, and what you hope to get out of the program. No minimum length — just be genuine."
              rows={5}
              style={{ ...inputStyle, minHeight: '140px', resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = 'var(--gold)'}
              onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
            />
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-5)', marginTop: '5px' }}>
              {form.motivation.length} characters
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--red)', background: 'var(--red-faint)', border: '1px solid var(--red-dim)', padding: '12px 14px', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'var(--gold-dim)' : 'var(--gold)',
              color: '#000',
              fontWeight: 700,
              fontSize: '15px',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: 'var(--sans)',
            }}
          >
            {loading ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 0.7s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Submitting…
              </>
            ) : (
              'Submit application →'
            )}
          </button>

          <div style={{ fontSize: '12px', color: 'var(--ink-4)', textAlign: 'center', lineHeight: 1.6 }}>
            Already enrolled?{' '}
            <Link href="/login" style={{ color: 'var(--gold)' }}>Sign in →</Link>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea:focus { border-color: var(--gold) !important; outline: none; }
      `}</style>
    </main>
  )
}
