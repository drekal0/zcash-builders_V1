'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/nav/Sidebar'
import type { Profile } from '@/types'
import { achievements as ACHIEVEMENTS, STAGE_META } from '@/lib/design-tokens'

// ── helpers ──────────────────────────────────────────────────
function initials(name: string) {
  return (name || 'ZB').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
}

function xpToLevel(xp: number) {
  const level    = Math.floor(xp / 500) + 1
  const progress = ((xp % 500) / 500) * 100
  const next     = (Math.floor(xp / 500) + 1) * 500
  return { level, progress, next }
}

const CHANNELS = ['general', 'stage-00', 'stage-01', 'stage-02', 'stage-03', 'labs', 'help', 'showcase']

// ── badge component ───────────────────────────────────────────
function AchievementBadge({ id, earned }: { id: string; earned: boolean }) {
  const a = ACHIEVEMENTS.find(a => a.id === id)
  if (!a) return null
  return (
    <div
      title={`${a.label}${earned ? '' : ' — locked'}\n${a.desc}`}
      style={{
        width: '44px', height: '44px', borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px',
        border: earned ? '1px solid var(--gold-dim)' : '1px solid var(--line)',
        background: earned ? 'rgba(244,183,40,0.08)' : 'var(--bg-3)',
        opacity: earned ? 1 : 0.3,
        filter: earned ? 'none' : 'grayscale(1)',
        cursor: 'default', flexShrink: 0, transition: 'all 0.15s',
      }}
    >
      {a.emoji}
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────
export default function PortalPage() {
  const router = useRouter()
  const client = createClient()

  const [profile,       setProfile]       = useState<Profile | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [earnedIds,     setEarnedIds]     = useState<string[]>([])
  const [stageProgress, setStageProgress] = useState<Record<string, number>>({})
  const [leaderboard,   setLeaderboard]   = useState<any[]>([])
  const [activeChannel, setActiveChannel] = useState('general')
  const [messages,      setMessages]      = useState<any[]>([])
  const [msgInput,      setMsgInput]      = useState('')
  const [sending,       setSending]       = useState(false)
  const [editOpen,      setEditOpen]      = useState(false)
  const [editForm,      setEditForm]      = useState<Partial<Profile>>({})
  const [saving,        setSaving]        = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // auth guard
  useEffect(() => {
    if (!client) { router.push('/login'); return }
    client.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login?next=/portal'); return }
      fetchAll(session.user.id)
    })
  }, [])  // eslint-disable-line

  async function fetchAll(userId: string) {
    if (!client) return
    const [profileRes, achieveRes, progressRes, leaderRes, msgsRes] = await Promise.all([
      client.from('profiles').select('*').eq('id', userId).single(),
      client.from('achievements').select('achievement_id').eq('user_id', userId),
      client.from('lesson_progress').select('stage, completed').eq('user_id', userId),
      client.from('profiles').select('id, name, xp').order('xp', { ascending: false }).limit(10),
      client.from('chat_messages')
        .select('*, profiles(name)')
        .eq('channel', 'general')
        .order('created_at', { ascending: true })
        .limit(50),
    ])
    if (profileRes.data)  { setProfile(profileRes.data); setEditForm(profileRes.data) }
    if (achieveRes.data)  setEarnedIds(achieveRes.data.map((a: any) => a.achievement_id))
    if (progressRes.data) {
      const counts: Record<string, number> = {}
      progressRes.data.filter((r: any) => r.completed).forEach((r: any) => {
        counts[r.stage] = (counts[r.stage] || 0) + 1
      })
      setStageProgress(counts)
    }
    if (leaderRes.data)  setLeaderboard(leaderRes.data)
    if (msgsRes.data)    setMessages(msgsRes.data)
    setLoading(false)
  }

  // realtime chat
  useEffect(() => {
    if (!client || !profile) return
    const sub = client
      .channel(`chat:${activeChannel}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `channel=eq.${activeChannel}`,
      }, payload => setMessages(prev => [...prev, payload.new]))
      .subscribe()
    return () => { client.removeChannel(sub) }
  }, [activeChannel, profile])  // eslint-disable-line

  // scroll on new message
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function switchChannel(ch: string) {
    setActiveChannel(ch)
    if (!client) return
    const { data } = await client
      .from('chat_messages')
      .select('*, profiles(name)')
      .eq('channel', ch)
      .order('created_at', { ascending: true })
      .limit(50)
    if (data) setMessages(data)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!msgInput.trim() || !client || !profile) return
    setSending(true)
    await client.from('chat_messages').insert({
      user_id: profile.id, cohort_id: profile.cohort_id || 'cohort-01',
      channel: activeChannel, content: msgInput.trim(),
    })
    setMsgInput('')
    setSending(false)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!client || !profile) return
    setSaving(true)
    const { data } = await client.from('profiles')
      .update({
        name: editForm.name, username: editForm.username, bio: editForm.bio,
        country: editForm.country, github: editForm.github, x_handle: editForm.x_handle,
        telegram: editForm.telegram, discord: editForm.discord, zcash_ua: editForm.zcash_ua,
      })
      .eq('id', profile.id).select().single()
    if (data) setProfile(data)
    setSaving(false)
    setEditOpen(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '10px', color: 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: '12px' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 0.7s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Loading portal…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const lvl = xpToLevel(profile?.xp || 0)
  const totalLessons     = STAGE_META.reduce((s, m) => s + m.lessons, 0)
  const completedLessons = Object.values(stageProgress).reduce((a, b) => a + b, 0)

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg-3)', border: '1px solid var(--line-2)',
    color: 'var(--ink)', padding: '10px 13px', borderRadius: '8px',
    fontSize: '13px', fontFamily: 'var(--sans)', outline: 'none',
  }

  return (
    <>
      <Sidebar
        role={(profile?.role as any) || 'student'}
        userName={profile?.name || 'Builder'}
        userInitial={initials(profile?.name || 'ZB')}
        cohort={profile?.cohort_id || 'Cohort 01'}
      />

      <div className="page-with-nav">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', minHeight: '100vh' }} className="portal-grid">

          {/* MAIN */}
          <main style={{ padding: 'clamp(24px,3vw,40px)', overflowY: 'auto', borderRight: '1px solid var(--line)' }}>

            {/* Page heading */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>
                Student Portal
              </div>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px,3vw,36px)', letterSpacing: '-0.025em', margin: 0 }}>
                Welcome back, <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{(profile?.name || 'Builder').split(' ')[0]}</em>
              </h1>
            </div>

            {/* Profile card */}
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(244,183,40,0.1)', border: '2px solid var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--gold)', flexShrink: 0 }}>
                  {initials(profile?.name || 'ZB')}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: '20px' }}>{profile?.name || 'Unnamed Builder'}</span>
                    {profile?.username && <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)' }}>@{profile.username}</span>}
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', padding: '2px 8px', borderRadius: '100px', background: 'var(--gold-faint)', color: 'var(--gold)', border: '1px solid var(--gold-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {profile?.cohort_id || 'Cohort 01'}
                    </span>
                  </div>
                  {profile?.bio && <p style={{ fontSize: '13px', color: 'var(--ink-3)', margin: '0 0 10px', lineHeight: 1.6 }}>{profile.bio}</p>}

                  {/* Socials */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {profile?.github && (
                      <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener" style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)', textDecoration: 'none' }}>
                        ⌥ {profile.github}
                      </a>
                    )}
                    {profile?.x_handle && (
                      <a href={`https://x.com/${profile.x_handle}`} target="_blank" rel="noopener" style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)', textDecoration: 'none' }}>
                        𝕏 @{profile.x_handle}
                      </a>
                    )}
                    {profile?.discord && (
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--blue)' }}>
                        ◈ {profile.discord}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit */}
                <button onClick={() => setEditOpen(true)}
                  style={{ padding: '8px 14px', background: 'var(--bg-3)', border: '1px solid var(--line-2)', borderRadius: '7px', color: 'var(--ink-3)', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--sans)', minHeight: '36px', flexShrink: 0 }}>
                  Edit profile
                </button>
              </div>

              {/* XP bar */}
              <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-3)' }}>
                    <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Level {lvl.level}</span>
                    &nbsp;·&nbsp;{profile?.xp || 0} XP
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-5)' }}>{lvl.next} XP next level</span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg-4)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${lvl.progress}%`, background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))', borderRadius: '2px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'var(--line)', border: '1px solid var(--line)', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
              {[
                { label: 'Lessons done',   val: `${completedLessons} / ${totalLessons}` },
                { label: 'Current streak', val: '—' },
                { label: 'Labs submitted', val: '0 / 8' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg-1)', padding: '16px 18px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: '24px', letterSpacing: '-0.02em' }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '14px' }}>
                Achievements · {earnedIds.length} / {ACHIEVEMENTS.length}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {ACHIEVEMENTS.map(a => (
                  <AchievementBadge key={a.id} id={a.id} earned={earnedIds.includes(a.id)} />
                ))}
              </div>
            </div>

            {/* Stage progress */}
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '16px' }}>
                Stage Progress
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {STAGE_META.map(s => {
                  const done = stageProgress[s.id] || 0
                  const pct  = Math.round((done / s.lessons) * 100)
                  return (
                    <div key={s.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', padding: '2px 7px', borderRadius: '100px', color: s.color, border: `1px solid ${s.border}`, background: `${s.color}18`, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {s.label}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{s.name}</span>
                        </div>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)' }}>{done}/{s.lessons}</span>
                      </div>
                      <div style={{ height: '4px', background: 'var(--bg-4)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Leaderboard */}
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '14px' }}>
                Cohort XP Leaderboard
              </div>
              {leaderboard.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--ink-4)', textAlign: 'center', padding: '20px 0', margin: 0 }}>No activity yet — you could be #1</p>
              ) : leaderboard.map((s, i) => {
                const isMe     = s.id === profile?.id
                const medals   = ['🥇', '🥈', '🥉']
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', background: isMe ? 'var(--gold-faint)' : 'transparent', border: `1px solid ${isMe ? 'var(--gold-dim)' : 'transparent'}`, marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: i < 3 ? 'var(--gold)' : 'var(--ink-5)', width: '20px', textAlign: 'center' }}>
                      {i < 3 ? medals[i] : `${i + 1}`}
                    </span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '11px', color: 'var(--ink-3)', flexShrink: 0 }}>
                      {initials(s.name || '?')}
                    </div>
                    <span style={{ flex: 1, fontSize: '13px', color: isMe ? 'var(--gold)' : 'var(--ink-2)', fontWeight: isMe ? 600 : 400 }}>
                      {s.name || 'Anonymous'} {isMe && '(you)'}
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)' }}>{s.xp || 0} XP</span>
                  </div>
                )
              })}
            </div>

            {/* Quick links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '10px' }}>
              {[
                { href: '/dashboard', icon: '📊', label: 'Learning Dashboard', sub: 'Lessons + labs' },
                { href: '/learn',     icon: '📖', label: 'Curriculum',          sub: '54 lessons, 4 stages' },
                { href: '/dashboard#labs', icon: '🧪', label: 'Labs',           sub: '8 project labs' },
              ].map(c => (
                <Link key={c.href} href={c.href} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '10px', textDecoration: 'none' }}>
                  <span style={{ fontSize: '22px' }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '3px' }}>{c.label}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)' }}>{c.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </main>

          {/* CHAT SIDEBAR */}
          <aside style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
            {/* Channels */}
            <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '10px' }}>
                Community
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {CHANNELS.map(ch => (
                  <button key={ch} onClick={() => switchChannel(ch)}
                    style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 9px', borderRadius: '6px', background: activeChannel === ch ? 'var(--bg-3)' : 'transparent', border: 'none', cursor: 'pointer', color: activeChannel === ch ? 'var(--ink-2)' : 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: '11px', textAlign: 'left', width: '100%', minHeight: '32px' }}>
                    <span style={{ color: activeChannel === ch ? 'var(--gold)' : 'var(--ink-5)' }}>#</span>{ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--ink-5)', fontFamily: 'var(--mono)', lineHeight: 1.7 }}>
                    No messages yet.<br />Be the first to say hi.
                  </span>
                </div>
              ) : messages.map((msg: any, i: number) => {
                const isMe = msg.user_id === profile?.id
                return (
                  <div key={msg.id || i} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isMe ? 'var(--gold-faint)' : 'var(--bg-3)', border: `1px solid ${isMe ? 'var(--gold-dim)' : 'var(--line-2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '9px', color: isMe ? 'var(--gold)' : 'var(--ink-3)', flexShrink: 0 }}>
                      {initials(msg.profiles?.name || 'ZB')}
                    </div>
                    <div style={{ maxWidth: '80%' }}>
                      {!isMe && <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--ink-4)', marginBottom: '3px' }}>{msg.profiles?.name || 'Builder'}</div>}
                      <div style={{ padding: '7px 10px', borderRadius: isMe ? '10px 2px 10px 10px' : '2px 10px 10px 10px', background: isMe ? 'rgba(244,183,40,0.1)' : 'var(--bg-3)', border: `1px solid ${isMe ? 'var(--gold-dim)' : 'var(--line-2)'}`, fontSize: '12px', color: 'var(--ink-3)', lineHeight: 1.55 }}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={sendMessage} style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', gap: '8px' }}>
              <input type="text" value={msgInput} onChange={e => setMsgInput(e.target.value)}
                placeholder={`#${activeChannel}`}
                style={{ flex: 1, background: 'var(--bg-3)', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '8px 11px', borderRadius: '7px', fontSize: '12px', fontFamily: 'var(--sans)', outline: 'none', minHeight: '36px' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
              />
              <button type="submit" disabled={sending || !msgInput.trim()}
                style={{ width: '34px', height: '36px', background: 'var(--gold)', border: 'none', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: sending || !msgInput.trim() ? 0.4 : 1 }}>
                ↑
              </button>
            </form>
          </aside>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setEditOpen(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: '12px', width: 'min(520px,100%)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: '20px' }}>Edit Profile</span>
              <button onClick={() => setEditOpen(false)} style={{ background: 'none', border: '1px solid var(--line-2)', color: 'var(--ink-3)', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>✕</button>
            </div>
            <form onSubmit={saveProfile} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { field: 'name',     label: 'Full Name',   ph: 'Amara Okonkwo' },
                { field: 'username', label: 'Username',    ph: 'amara' },
                { field: 'country',  label: 'Country',     ph: 'Nigeria' },
                { field: 'github',   label: 'GitHub',      ph: 'amara-builds' },
                { field: 'x_handle', label: 'X / Twitter', ph: 'amara_builds' },
                { field: 'telegram', label: 'Telegram',    ph: '@amara' },
                { field: 'discord',  label: 'Discord',     ph: 'amara#0001' },
              ].map(({ field, label, ph }) => (
                <div key={field}>
                  <label style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', display: 'block', marginBottom: '5px' }}>{label}</label>
                  <input type="text" value={(editForm as any)[field] || ''} onChange={e => setEditForm(p => ({ ...p, [field]: e.target.value }))} placeholder={ph} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', display: 'block', marginBottom: '5px' }}>Bio</label>
                <textarea value={editForm.bio || ''} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} placeholder="Building on Zcash from Lagos…" rows={3}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', display: 'block', marginBottom: '5px' }}>Zcash Unified Address</label>
                <input type="text" value={editForm.zcash_ua || ''} onChange={e => setEditForm(p => ({ ...p, zcash_ua: e.target.value }))} placeholder="u1..."
                  style={{ ...inputStyle, fontFamily: 'var(--mono)', fontSize: '11px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
                />
              </div>
              <button type="submit" disabled={saving}
                style={{ width: '100%', padding: '12px', background: saving ? 'var(--gold-dim)' : 'var(--gold)', color: '#000', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', minHeight: '44px', fontFamily: 'var(--sans)' }}>
                {saving ? 'Saving…' : 'Save profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media(max-width:1024px) {
          .portal-grid { grid-template-columns: 1fr !important; }
          .portal-grid aside { display: none !important; }
        }
      `}</style>
    </>
  )
}
