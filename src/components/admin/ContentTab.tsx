'use client'

// Content tab — supporting videos per lesson, and custom lessons.
// Visible when the current user is primary admin OR holds 'edit_lessons'.
// All writes go straight to the lesson_videos / custom_lessons tables; RLS
// enforces the real permission, so forbidden writes are surfaced in the banner.

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ALL_LESSON_META } from '@/lib/curriculum/outline'
import { STAGE_META } from '@/lib/design-tokens'
import { type Notify, Loading, Spinner, monoLabel, panelStyle, fieldStyle, goldFocus, clearFocus } from './shared'

type LessonVideo = { id: string; lesson_id: string; title: string; url: string; position: number }
type CustomLesson = {
  id: string; stage: string; week: number; title: string; subtitle?: string | null
  type: 'lesson' | 'lab'; xp: number; duration: number; published: boolean
}

type Props = { notify: Notify }
type Sub = 'videos' | 'lessons'

const STAGE_IDS = STAGE_META.map(s => s.id)
const stageName = (id: string) => STAGE_META.find(s => s.id === id)?.name ?? `Stage ${id}`

export default function ContentTab({ notify }: Props) {
  const [sub, setSub] = useState<Sub>('videos')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const client = createClient()
    if (!client) return
    client.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Sub-nav */}
      <div role="tablist" aria-label="Content sections" style={{ display: 'inline-flex', alignSelf: 'flex-start', background: 'var(--bg-3)', border: '1px solid var(--line-2)', borderRadius: '8px', padding: '3px', gap: '3px', flexWrap: 'wrap' }}>
        {([['videos', 'Supporting videos'], ['lessons', 'Custom lessons']] as const).map(([id, label]) => {
          const active = sub === id
          return (
            <button key={id} role="tab" aria-selected={active} type="button" onClick={() => setSub(id)}
              style={{
                padding: '8px 14px', borderRadius: '6px', border: 'none',
                fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.04em',
                cursor: 'pointer', minHeight: '36px',
                background: active ? 'var(--gold)' : 'transparent',
                color: active ? '#000' : 'var(--ink-3)', fontWeight: active ? 700 : 500,
              }}>
              {label}
            </button>
          )
        })}
      </div>

      {sub === 'videos' ? <VideosSection notify={notify} userId={userId} /> : <LessonsSection notify={notify} userId={userId} />}
    </div>
  )
}

// ── Supporting videos ───────────────────────────────────────────────────────

function VideosSection({ notify, userId }: { notify: Notify; userId: string | null }) {
  const [lessonId, setLessonId] = useState<string>(ALL_LESSON_META[0]?.id ?? '')
  const [videos, setVideos]     = useState<LessonVideo[]>([])
  const [loading, setLoading]   = useState(true)
  const [busy, setBusy]         = useState<string | null>(null)
  const [title, setTitle]       = useState('')
  const [url, setUrl]           = useState('')
  const [position, setPosition] = useState('')

  const load = useCallback(async (id: string) => {
    const client = createClient()
    if (!client || !id) return
    const { data, error } = await client
      .from('lesson_videos')
      .select('id, lesson_id, title, url, position')
      .eq('lesson_id', id)
      .order('position', { ascending: true })
    if (error) notify(error.message, true)
    setVideos((data as LessonVideo[] | null) ?? [])
    setLoading(false)
  }, [notify])

  useEffect(() => { void Promise.resolve().then(() => load(lessonId)) }, [lessonId, load])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) { notify('Title and URL are required', true); return }
    const client = createClient()
    if (!client) return
    setBusy('add')
    const row: Record<string, unknown> = {
      lesson_id: lessonId, title: title.trim(), url: url.trim(),
      position: position.trim() === '' ? 0 : Number(position),
    }
    if (userId) row.added_by = userId
    const { error } = await client.from('lesson_videos').insert(row)
    if (error) notify(error.message, true)
    else { notify('Video added'); setTitle(''); setUrl(''); setPosition(''); load(lessonId) }
    setBusy(null)
  }

  async function remove(v: LessonVideo) {
    if (!window.confirm(`Delete “${v.title}”?`)) return
    const client = createClient()
    if (!client) return
    setBusy(`del:${v.id}`)
    const { error } = await client.from('lesson_videos').delete().eq('id', v.id)
    if (error) notify(error.message, true)
    else { notify('Video deleted'); setVideos(prev => prev.filter(x => x.id !== v.id)) }
    setBusy(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Lesson picker */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '460px' }}>
        <span style={monoLabel}>Lesson</span>
        <select
          value={lessonId}
          onChange={e => setLessonId(e.target.value)}
          onFocus={goldFocus} onBlur={clearFocus}
          style={{ ...fieldStyle, fontFamily: 'var(--mono)', fontSize: '12px', cursor: 'pointer' }}
        >
          {STAGE_IDS.map(sid => (
            <optgroup key={sid} label={`Stage ${sid} · ${stageName(sid)}`}>
              {ALL_LESSON_META.filter(l => l.stage === sid).map(l => (
                <option key={l.id} value={l.id}>W{l.week} · {l.id} · {l.title}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      {/* Existing videos */}
      <div style={{ ...panelStyle }}>
        {loading ? (
          <div style={{ padding: '20px' }}><Loading label="Loading videos…" /></div>
        ) : videos.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center', color: 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: '12px' }}>No videos for this lesson yet.</div>
        ) : videos.map((v, i) => (
          <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 18px', borderBottom: i < videos.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)', width: '22px', flexShrink: 0 }}>{v.position}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
              <a href={v.url} target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--gold)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{v.url}</a>
            </div>
            <button type="button" aria-label={`Delete ${v.title}`} disabled={busy === `del:${v.id}`} onClick={() => remove(v)}
              style={{ background: 'rgba(248,113,113,0.08)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '7px', width: '34px', height: '34px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {busy === `del:${v.id}` ? <Spinner size={12} /> : '✕'}
            </button>
          </div>
        ))}
      </div>

      {/* Add form */}
      <form onSubmit={add} style={{ ...panelStyle, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={monoLabel}>Add a video</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ ...monoLabel, fontSize: '9px' }}>Title</span>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. zk-SNARKs explained" style={fieldStyle} onFocus={goldFocus} onBlur={clearFocus} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ ...monoLabel, fontSize: '9px' }}>URL</span>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" style={fieldStyle} onFocus={goldFocus} onBlur={clearFocus} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxWidth: '120px' }}>
            <span style={{ ...monoLabel, fontSize: '9px' }}>Position</span>
            <input value={position} onChange={e => setPosition(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="0" style={fieldStyle} onFocus={goldFocus} onBlur={clearFocus} />
          </label>
        </div>
        <button type="submit" disabled={busy === 'add'}
          style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'var(--gold)', color: '#000', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--sans)', minHeight: '42px' }}>
          {busy === 'add' ? <Spinner size={13} /> : '+'} Add video
        </button>
      </form>
    </div>
  )
}

// ── Custom lessons ────────────────────────────────────────────────────────

const EMPTY_FORM = { id: '', stage: STAGE_IDS[0] ?? '00', week: '1', title: '', subtitle: '', content: '', type: 'lesson' as 'lesson' | 'lab', xp: '50', duration: '15', published: false }

function LessonsSection({ notify, userId }: { notify: Notify; userId: string | null }) {
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<CustomLesson[]>([])
  const [busy, setBusy]       = useState<string | null>(null)
  const [form, setForm]       = useState({ ...EMPTY_FORM })

  const load = useCallback(async () => {
    const client = createClient()
    if (!client) return // null only during SSR/build; tab mounts with a valid client
    const { data, error } = await client
      .from('custom_lessons')
      .select('id, stage, week, title, subtitle, type, xp, duration, published')
      .order('stage', { ascending: true }).order('week', { ascending: true })
    if (error) notify(error.message, true)
    setLessons((data as CustomLesson[] | null) ?? [])
    setLoading(false)
  }, [notify])

  useEffect(() => { void Promise.resolve().then(load) }, [load])

  // Suggested id pattern: c-<stage>-<n>
  const suggestId = useCallback((stage: string) => {
    const n = lessons.filter(l => l.stage === stage).length + 1
    return `c-${stage}-${String(n).padStart(2, '0')}`
  }, [lessons])

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    const id = form.id.trim() || suggestId(form.stage)
    if (!form.title.trim()) { notify('Title is required', true); return }
    const client = createClient()
    if (!client) return
    setBusy('create')
    const row: Record<string, unknown> = {
      id, stage: form.stage, week: Number(form.week) || 1, title: form.title.trim(),
      subtitle: form.subtitle.trim() || null, content: form.content, type: form.type,
      xp: Number(form.xp) || 0, duration: Number(form.duration) || 0, published: form.published,
    }
    if (userId) row.created_by = userId
    const { error } = await client.from('custom_lessons').insert(row)
    if (error) notify(error.message, true) // surfaces unique-id collisions and permission errors
    else { notify(`Created ${id}`); setForm({ ...EMPTY_FORM }); load() }
    setBusy(null)
  }

  async function togglePublished(l: CustomLesson) {
    const client = createClient()
    if (!client) return
    setBusy(`pub:${l.id}`)
    const { error } = await client.from('custom_lessons').update({ published: !l.published }).eq('id', l.id)
    if (error) notify(error.message, true)
    else { notify(`${l.id} ${!l.published ? 'published' : 'unpublished'}`); setLessons(prev => prev.map(x => x.id === l.id ? { ...x, published: !x.published } : x)) }
    setBusy(null)
  }

  async function remove(l: CustomLesson) {
    if (!window.confirm(`Delete custom lesson “${l.title}” (${l.id})?`)) return
    const client = createClient()
    if (!client) return
    setBusy(`del:${l.id}`)
    const { error } = await client.from('custom_lessons').delete().eq('id', l.id)
    if (error) notify(error.message, true)
    else { notify(`Deleted ${l.id}`); setLessons(prev => prev.filter(x => x.id !== l.id)) }
    setBusy(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Existing custom lessons */}
      <div style={{ ...panelStyle }}>
        {loading ? (
          <div style={{ padding: '20px' }}><Loading label="Loading lessons…" /></div>
        ) : lessons.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center', color: 'var(--ink-4)', fontFamily: 'var(--mono)', fontSize: '12px' }}>No custom lessons yet.</div>
        ) : lessons.map((l, i) => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '13px 18px', borderBottom: i < lessons.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={{ fontSize: '13px', color: 'var(--ink-2)' }}>{l.title}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)', marginTop: '3px' }}>
                {l.id} · Stage {l.stage} · W{l.week} · {l.type} · {l.xp} XP
              </div>
            </div>
            <button type="button" aria-pressed={l.published} disabled={busy === `pub:${l.id}`} onClick={() => togglePublished(l)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 11px', borderRadius: '100px',
                fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.04em', textTransform: 'uppercase',
                cursor: 'pointer', minHeight: '32px',
                color: l.published ? 'var(--success)' : 'var(--ink-4)',
                background: l.published ? 'rgba(74,222,128,0.08)' : 'var(--bg-3)',
                border: `1px solid ${l.published ? 'rgba(74,222,128,0.25)' : 'var(--line-2)'}`,
              }}>
              {busy === `pub:${l.id}` ? <Spinner size={11} /> : <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: l.published ? 'var(--success)' : 'var(--ink-5)' }} />}
              {l.published ? 'Published' : 'Draft'}
            </button>
            <button type="button" aria-label={`Delete ${l.title}`} disabled={busy === `del:${l.id}`} onClick={() => remove(l)}
              style={{ background: 'rgba(248,113,113,0.08)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '7px', width: '34px', height: '34px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {busy === `del:${l.id}` ? <Spinner size={12} /> : '✕'}
            </button>
          </div>
        ))}
      </div>

      {/* Create form */}
      <form onSubmit={create} style={{ ...panelStyle, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={monoLabel}>Create a custom lesson</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ ...monoLabel, fontSize: '9px' }}>ID</span>
            <input value={form.id} onChange={e => update('id', e.target.value)} placeholder={suggestId(form.stage)} style={{ ...fieldStyle, fontFamily: 'var(--mono)', fontSize: '12px' }} onFocus={goldFocus} onBlur={clearFocus} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ ...monoLabel, fontSize: '9px' }}>Stage</span>
            <select value={form.stage} onChange={e => update('stage', e.target.value)} style={{ ...fieldStyle, fontFamily: 'var(--mono)', fontSize: '12px', cursor: 'pointer' }} onFocus={goldFocus} onBlur={clearFocus}>
              {STAGE_IDS.map(s => <option key={s} value={s}>Stage {s}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ ...monoLabel, fontSize: '9px' }}>Week</span>
            <input value={form.week} onChange={e => update('week', e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" style={fieldStyle} onFocus={goldFocus} onBlur={clearFocus} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ ...monoLabel, fontSize: '9px' }}>Type</span>
            <select value={form.type} onChange={e => update('type', e.target.value as 'lesson' | 'lab')} style={{ ...fieldStyle, fontFamily: 'var(--mono)', fontSize: '12px', cursor: 'pointer' }} onFocus={goldFocus} onBlur={clearFocus}>
              <option value="lesson">lesson</option>
              <option value="lab">lab</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ ...monoLabel, fontSize: '9px' }}>XP</span>
            <input value={form.xp} onChange={e => update('xp', e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" style={fieldStyle} onFocus={goldFocus} onBlur={clearFocus} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ ...monoLabel, fontSize: '9px' }}>Duration (min)</span>
            <input value={form.duration} onChange={e => update('duration', e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" style={fieldStyle} onFocus={goldFocus} onBlur={clearFocus} />
          </label>
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ ...monoLabel, fontSize: '9px' }}>Title</span>
          <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Lesson title" style={fieldStyle} onFocus={goldFocus} onBlur={clearFocus} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ ...monoLabel, fontSize: '9px' }}>Subtitle</span>
          <input value={form.subtitle} onChange={e => update('subtitle', e.target.value)} placeholder="Optional subtitle" style={fieldStyle} onFocus={goldFocus} onBlur={clearFocus} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ ...monoLabel, fontSize: '9px' }}>Content (HTML)</span>
          <textarea value={form.content} onChange={e => update('content', e.target.value)} rows={5} placeholder="<p>Lesson body…</p>" style={{ ...fieldStyle, minHeight: '110px', resize: 'vertical', fontFamily: 'var(--mono)', fontSize: '12px', lineHeight: 1.6 }} onFocus={goldFocus} onBlur={clearFocus} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-5)' }}>Plain HTML for now — rich authoring &amp; preview come later.</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--ink-2)' }}>
            <input type="checkbox" checked={form.published} onChange={e => update('published', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--gold)', cursor: 'pointer' }} />
            Publish immediately
          </label>
          <button type="submit" disabled={busy === 'create'}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'var(--gold)', color: '#000', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--sans)', minHeight: '42px' }}>
            {busy === 'create' ? <Spinner size={13} /> : '+'} Create lesson
          </button>
        </div>
      </form>
    </div>
  )
}
