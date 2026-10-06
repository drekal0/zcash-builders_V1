'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Application, Cohort, Region } from '@/types'
import { REGION_LABELS } from '@/types'

// ─── tabs ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'applications' | 'students' | 'settings'

// ─── helpers ─────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  pending:      'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  accepted:     'bg-green-900/40  text-green-300  border-green-700',
  waitlisted:   'bg-blue-900/40   text-blue-300   border-blue-700',
  rejected:     'bg-red-900/40    text-red-300    border-red-700',
  upcoming:     'bg-gray-700      text-gray-300',
  active:       'bg-green-800     text-green-200',
  open:         'bg-blue-800      text-blue-200',
  completed:    'bg-gray-600      text-gray-300',
}

function Badge({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {label}
    </span>
  )
}

// ─── component ───────────────────────────────────────────────────────────────
export default function LeadAdminPage() {
  const client = createClient()

  const [me, setMe]                   = useState<Profile | null>(null)
  const [cohort, setCohort]           = useState<Cohort | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [students, setStudents]       = useState<Profile[]>([])
  const [tab, setTab]                 = useState<Tab>('overview')
  const [loading, setLoading]         = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast]             = useState<{ ok: boolean; msg: string } | null>(null)

  // settings form
  const [settings, setSettings] = useState({
    name: '', description: '', website: '',
    language: 'en', timezone: 'UTC',
    start_date: '', end_date: '',
    max_students: 30, status: 'upcoming', is_public: true,
  })
  const [settingsSaving, setSettingsSaving] = useState(false)

  // application detail
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [adminNotes, setAdminNotes]   = useState('')

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await client.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'region_lead') {
      setLoading(false)
      return
    }
    setMe(profile)

    // fetch the cohort this lead owns
    const { data: cohortData } = await client
      .from('cohorts')
      .select('*')
      .eq('region_lead_id', user.id)
      .single()

    if (cohortData) {
      setCohort(cohortData)
      setSettings({
        name:         cohortData.name         ?? '',
        description:  cohortData.description  ?? '',
        website:      cohortData.website       ?? '',
        language:     cohortData.language      ?? 'en',
        timezone:     cohortData.timezone      ?? 'UTC',
        start_date:   cohortData.start_date    ?? '',
        end_date:     cohortData.end_date      ?? '',
        max_students: cohortData.max_students  ?? 30,
        status:       cohortData.status        ?? 'upcoming',
        is_public:    cohortData.is_public     ?? true,
      })

      // applications for this cohort (pending + recent)
      const { data: apps } = await client
        .from('applications')
        .select('*')
        .or(`cohort_id.eq.${cohortData.id},and(cohort_id.is.null,status.eq.pending)`)
        .order('created_at', { ascending: false })
      setApplications(apps ?? [])

      // enrolled students
      const { data: stds } = await client
        .from('profiles')
        .select('*')
        .eq('cohort_id', cohortData.id)
        .order('enrolled_at', { ascending: false })
      setStudents(stds ?? [])
    }

    setLoading(false)
  }, [client])

  useEffect(() => { fetchData() }, [fetchData])

  // ── accept & enroll ────────────────────────────────────────────────────────
  async function acceptApp(app: Application) {
    if (!cohort) return
    setActionLoading(app.id)
    const { data, error } = await client.rpc('accept_and_enroll', {
      p_application_id: app.id,
      p_cohort_id: cohort.id,
      p_admin_notes: adminNotes || null,
    })
    setActionLoading(null)
    if (error || !data?.ok) {
      showToast(false, error?.message ?? data?.message ?? 'Failed')
    } else {
      showToast(true, data.message)
      setSelectedApp(null)
      setAdminNotes('')
      await fetchData()
    }
  }

  // ── reject ─────────────────────────────────────────────────────────────────
  async function rejectApp(app: Application) {
    setActionLoading(app.id)
    await client
      .from('applications')
      .update({ status: 'rejected', reviewed_by: me!.id, reviewed_at: new Date().toISOString() })
      .eq('id', app.id)
    setActionLoading(null)
    showToast(true, 'Application rejected')
    setSelectedApp(null)
    await fetchData()
  }

  // ── save cohort settings ───────────────────────────────────────────────────
  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    if (!cohort) return
    setSettingsSaving(true)
    const { data, error } = await client.rpc('update_regional_cohort', {
      p_cohort_id:    cohort.id,
      p_name:         settings.name         || null,
      p_language:     settings.language      || null,
      p_timezone:     settings.timezone      || null,
      p_description:  settings.description  || null,
      p_website:      settings.website       || null,
      p_start_date:   settings.start_date    || null,
      p_end_date:     settings.end_date      || null,
      p_max_students: settings.max_students  || null,
      p_status:       settings.status        || null,
      p_is_public:    settings.is_public,
    })
    setSettingsSaving(false)
    if (error || !data?.ok) {
      showToast(false, error?.message ?? 'Failed to save')
    } else {
      showToast(true, 'Cohort settings saved')
      await fetchData()
    }
  }

  function showToast(ok: boolean, msg: string) {
    setToast({ ok, msg })
    setTimeout(() => setToast(null), 4000)
  }

  // ─── guards ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f4b728] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!me || me.role !== 'region_lead') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <p className="text-gray-400">Region lead access only.</p>
        </div>
      </div>
    )
  }

  const pendingApps = applications.filter(a => a.status === 'pending')

  // ─── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.ok ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'
        }`}>
          {toast.ok ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-[#f4b728] flex items-center justify-center text-black font-bold text-sm">
          Z
        </div>
        <div>
          <h1 className="font-semibold text-white">Region Lead Dashboard</h1>
          {cohort && (
            <p className="text-xs text-gray-400">
              {cohort.name} · {REGION_LABELS[cohort.region as Region] ?? cohort.region}
            </p>
          )}
        </div>
        <div className="ml-auto text-sm text-gray-500">{me.name}</div>
      </header>

      {/* no cohort yet */}
      {!cohort ? (
        <NoCohortSetup me={me} client={client} onCreated={fetchData} />
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Enrolled', value: students.length, color: 'text-[#f4b728]' },
              { label: 'Pending', value: pendingApps.length, color: 'text-yellow-400' },
              { label: 'Capacity', value: cohort.max_students, color: 'text-blue-400' },
              { label: 'Spots Left', value: Math.max(0, cohort.max_students - students.length), color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* tabs */}
          <div className="flex gap-1 mb-6 border-b border-white/10">
            {(['overview', 'applications', 'students', 'settings'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  tab === t
                    ? 'text-[#f4b728] border-b-2 border-[#f4b728]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t}
                {t === 'applications' && pendingApps.length > 0 && (
                  <span className="ml-1.5 bg-[#f4b728] text-black text-xs rounded-full px-1.5 py-0.5 font-bold">
                    {pendingApps.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── overview ── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h2 className="font-semibold text-lg mb-3">{cohort.name}</h2>
                {cohort.description && <p className="text-gray-400 text-sm mb-4">{cohort.description}</p>}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <Info label="Region" value={REGION_LABELS[cohort.region as Region] ?? cohort.region ?? '—'} />
                  <Info label="Language" value={cohort.language ?? 'en'} />
                  <Info label="Timezone" value={cohort.timezone ?? 'UTC'} />
                  <Info label="Start" value={cohort.start_date ?? '—'} />
                  <Info label="End" value={cohort.end_date ?? '—'} />
                  <Info label="Status" value={
                    <Badge label={cohort.status} cls={STATUS_COLORS[cohort.status] ?? ''} />
                  } />
                </div>
                {cohort.website && (
                  <a href={cohort.website} target="_blank" rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm text-[#f4b728] hover:underline">
                    {cohort.website} ↗
                  </a>
                )}
              </div>

              {/* recent activity */}
              {pendingApps.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-5">
                  <h3 className="font-medium text-yellow-300 mb-3">
                    {pendingApps.length} application{pendingApps.length > 1 ? 's' : ''} waiting for review
                  </h3>
                  <button
                    onClick={() => setTab('applications')}
                    className="text-sm text-[#f4b728] hover:underline"
                  >
                    Review applications →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── applications ── */}
          {tab === 'applications' && (
            <div className="space-y-4">
              {applications.length === 0 ? (
                <p className="text-gray-500 text-sm">No applications yet.</p>
              ) : (
                applications.map(app => (
                  <div
                    key={app.id}
                    className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                    onClick={() => { setSelectedApp(app); setAdminNotes(app.admin_notes ?? '') }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{app.name}</div>
                        <div className="text-sm text-gray-400">{app.email} · {app.country}</div>
                        {app.github && (
                          <a
                            href={`https://github.com/${app.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#f4b728] hover:underline mt-0.5 block"
                            onClick={e => e.stopPropagation()}
                          >
                            github.com/{app.github}
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge label={app.status} cls={STATUS_COLORS[app.status] ?? ''} />
                        <span className="text-xs text-gray-500">
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {app.background && (
                      <div className="mt-2 text-xs text-gray-500">Background: {app.background}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── students ── */}
          {tab === 'students' && (
            <div className="space-y-3">
              {students.length === 0 ? (
                <p className="text-gray-500 text-sm">No students enrolled yet.</p>
              ) : (
                students.map(s => (
                  <div key={s.id} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-[#f4b728]/20 flex items-center justify-center text-[#f4b728] font-bold text-sm shrink-0">
                      {(s.name ?? '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.country ?? '—'}</div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div className="text-[#f4b728] font-medium">{s.xp ?? 0} XP</div>
                      {s.enrolled_at && (
                        <div>Enrolled {new Date(s.enrolled_at).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── settings ── */}
          {tab === 'settings' && (
            <form onSubmit={saveSettings} className="max-w-2xl space-y-5">
              <h2 className="font-semibold text-lg">Cohort Settings</h2>
              <p className="text-sm text-gray-400">
                Customize how your regional cohort appears and operates.
              </p>

              <Field label="Cohort Name">
                <input
                  value={settings.name}
                  onChange={e => setSettings(s => ({ ...s, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f4b728]"
                  placeholder="e.g. East Africa Cohort 01"
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={settings.description}
                  onChange={e => setSettings(s => ({ ...s, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f4b728] resize-none"
                  placeholder="What is this cohort about?"
                />
              </Field>

              <Field label="Website / Community Link">
                <input
                  type="url"
                  value={settings.website}
                  onChange={e => setSettings(s => ({ ...s, website: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f4b728]"
                  placeholder="https://..."
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Language">
                  <select
                    value={settings.language}
                    onChange={e => setSettings(s => ({ ...s, language: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f4b728]"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="pt">Portuguese</option>
                    <option value="ar">Arabic</option>
                    <option value="sw">Swahili</option>
                    <option value="yo">Yoruba</option>
                    <option value="ha">Hausa</option>
                    <option value="ig">Igbo</option>
                  </select>
                </Field>

                <Field label="Timezone">
                  <select
                    value={settings.timezone}
                    onChange={e => setSettings(s => ({ ...s, timezone: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f4b728]"
                  >
                    <option value="UTC">UTC</option>
                    <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                    <option value="Africa/Accra">Africa/Accra (GMT)</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                    <option value="America/Sao_Paulo">America/São_Paulo (BRT)</option>
                    <option value="America/Mexico_City">America/Mexico_City (CST)</option>
                    <option value="America/Bogota">America/Bogotá (COT)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Start Date">
                  <input
                    type="date"
                    value={settings.start_date}
                    onChange={e => setSettings(s => ({ ...s, start_date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f4b728]"
                  />
                </Field>
                <Field label="End Date">
                  <input
                    type="date"
                    value={settings.end_date}
                    onChange={e => setSettings(s => ({ ...s, end_date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f4b728]"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Max Students">
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={settings.max_students}
                    onChange={e => setSettings(s => ({ ...s, max_students: parseInt(e.target.value) || 30 }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f4b728]"
                  />
                </Field>

                <Field label="Status">
                  <select
                    value={settings.status}
                    onChange={e => setSettings(s => ({ ...s, status: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f4b728]"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="open">Open (accepting apps)</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </Field>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={settings.is_public}
                  onChange={e => setSettings(s => ({ ...s, is_public: e.target.checked }))}
                  className="w-4 h-4 accent-[#f4b728]"
                />
                <label htmlFor="is_public" className="text-sm text-gray-300">
                  List this cohort publicly on the main site
                </label>
              </div>

              <button
                type="submit"
                disabled={settingsSaving}
                className="px-6 py-2 bg-[#f4b728] text-black text-sm font-semibold rounded-lg hover:bg-[#f4b728]/90 disabled:opacity-50 transition-colors"
              >
                {settingsSaving ? 'Saving…' : 'Save Settings'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── application detail modal ── */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setSelectedApp(null) }}
        >
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-lg">{selectedApp.name}</h3>
                  <div className="text-sm text-gray-400">{selectedApp.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label={selectedApp.status} cls={STATUS_COLORS[selectedApp.status] ?? ''} />
                  <button onClick={() => setSelectedApp(null)} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
                </div>
              </div>

              <div className="space-y-3 text-sm mb-5">
                <Row label="Country" value={selectedApp.country} />
                {selectedApp.github && (
                  <Row label="GitHub" value={
                    <a href={`https://github.com/${selectedApp.github}`} target="_blank" rel="noopener noreferrer"
                      className="text-[#f4b728] hover:underline">
                      {selectedApp.github}
                    </a>
                  } />
                )}
                {selectedApp.background && <Row label="Background" value={selectedApp.background} />}
                {selectedApp.motivation && (
                  <div className="bg-white/5 rounded-lg p-3 text-gray-300">
                    <div className="text-xs text-gray-500 mb-1">Motivation</div>
                    {selectedApp.motivation}
                  </div>
                )}
              </div>

              {/* admin notes */}
              <div className="mb-5">
                <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
                <textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f4b728] resize-none"
                  placeholder="Internal notes…"
                />
              </div>

              {selectedApp.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => acceptApp(selectedApp)}
                    disabled={actionLoading === selectedApp.id}
                    className="flex-1 py-2 bg-[#f4b728] text-black text-sm font-semibold rounded-lg hover:bg-[#f4b728]/90 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === selectedApp.id ? 'Processing…' : `✓ Accept & Enroll into ${cohort?.name}`}
                  </button>
                  <button
                    onClick={() => rejectApp(selectedApp)}
                    disabled={actionLoading === selectedApp.id}
                    className="px-4 py-2 bg-red-900/40 text-red-300 text-sm font-medium rounded-lg hover:bg-red-900/60 disabled:opacity-50 transition-colors border border-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}

              {selectedApp.status !== 'pending' && (
                <div className="text-sm text-gray-500 text-center">
                  This application has already been {selectedApp.status}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── NoCohortSetup — shown when region lead has no cohort yet ─────────────────
function NoCohortSetup({
  me, client, onCreated
}: {
  me: Profile
  client: ReturnType<typeof createClient>
  onCreated: () => void
}) {
  const [form, setForm] = useState({
    id: '', name: '', region: 'west-africa' as Region,
    language: 'en', timezone: 'Africa/Lagos',
    description: '', website: '',
    start_date: '', end_date: '', max_students: 30,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!form.id || !form.name) { setError('Cohort ID and name are required'); return }
    setSaving(true)
    const { data, error: err } = await client.rpc('create_regional_cohort', {
      p_cohort_id:    form.id,
      p_name:         form.name,
      p_region:       form.region,
      p_language:     form.language,
      p_timezone:     form.timezone,
      p_description:  form.description || null,
      p_website:      form.website      || null,
      p_start_date:   form.start_date   || null,
      p_end_date:     form.end_date     || null,
      p_max_students: form.max_students,
    })
    setSaving(false)
    if (err || !data?.ok) { setError(err?.message ?? data?.message ?? 'Failed'); return }
    onCreated()
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h2 className="text-2xl font-bold mb-2">Set up your cohort</h2>
      <p className="text-gray-400 text-sm mb-8">
        You haven&apos;t created a cohort yet. Fill in the details below to launch your regional cohort.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={create} className="space-y-4">
        <Field label="Cohort ID (unique slug)">
          <input
            value={form.id}
            onChange={e => setForm(f => ({ ...f, id: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f4b728]"
            placeholder="e.g. cohort-ea-01"
            required
          />
          <p className="text-xs text-gray-600 mt-1">Lowercase, hyphens only. Cannot be changed later.</p>
        </Field>

        <Field label="Cohort Name">
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f4b728]"
            placeholder="e.g. East Africa Cohort 01"
            required
          />
        </Field>

        <Field label="Region">
          <select
            value={form.region}
            onChange={e => setForm(f => ({ ...f, region: e.target.value as Region }))}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f4b728]"
          >
            {(Object.entries(REGION_LABELS) as [Region, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f4b728] resize-none"
            placeholder="Short description of the cohort"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date">
            <input type="date" value={form.start_date}
              onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f4b728]"
            />
          </Field>
          <Field label="End Date">
            <input type="date" value={form.end_date}
              onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f4b728]"
            />
          </Field>
        </div>

        <Field label="Max Students">
          <input type="number" min={1} max={200} value={form.max_students}
            onChange={e => setForm(f => ({ ...f, max_students: parseInt(e.target.value) || 30 }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f4b728]"
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-[#f4b728] text-black font-semibold rounded-lg hover:bg-[#f4b728]/90 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Creating…' : 'Create Cohort'}
        </button>
      </form>
    </div>
  )
}

// ─── tiny layout helpers ──────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  )
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm text-white">{value}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-24 shrink-0">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}
