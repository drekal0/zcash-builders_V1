// Design tokens — single source of truth for colours, spacing, fonts
// Keep in sync with globals.css custom properties

export const tokens = {
  gold: '#f4b728',
  goldDim: 'rgba(244,183,40,0.3)',
  goldFaint: 'rgba(244,183,40,0.06)',
  blue: '#63b4ff',
  purple: '#c084fc',
  success: '#4ade80',
  danger: '#f87171',
  bg: '#0a0a0a',
  ink: '#f0ede8',
}

// Achievements definition — used on portal and admin pages
export const achievements = [
  { id: 'first_login',      emoji: '👋', label: 'Welcome, Builder',    desc: 'Logged in for the first time' },
  { id: 'profile_complete', emoji: '🪪', label: 'Identity Confirmed',   desc: 'Completed your profile' },
  { id: 'first_lesson',     emoji: '📖', label: 'First Lesson',         desc: 'Completed your first lesson' },
  { id: 'stage_00',         emoji: '🧱', label: 'Blockchain Basics',    desc: 'Completed Stage 00' },
  { id: 'stage_01',         emoji: '🛡️', label: 'Zcash Understood',     desc: 'Completed Stage 01' },
  { id: 'stage_02',         emoji: '⚡', label: 'Builder',              desc: 'Completed Stage 02' },
  { id: 'stage_03',         emoji: '🌍', label: 'Contributor',          desc: 'Completed Stage 03' },
  { id: 'first_lab',        emoji: '🧪', label: 'First Lab',            desc: 'Submitted your first lab' },
  { id: 'all_labs',         emoji: '🏗️', label: 'Lab Legend',           desc: 'Submitted all 8 labs' },
  { id: 'peer_review',      emoji: '🤝', label: 'Peer Reviewer',        desc: 'Reviewed a peer\'s lab submission' },
  { id: 'first_tx',         emoji: '🔐', label: 'First Shielded TX',    desc: 'Sent your first shielded transaction' },
  { id: 'zebra_runner',     emoji: '🦓', label: 'Zebra Runner',         desc: 'Successfully deployed a Zebra node' },
  { id: 'oss_contrib',      emoji: '🌟', label: 'Open Source',          desc: 'Merged a PR to a Zcash repository' },
  { id: 'week_streak',      emoji: '🔥', label: '7-Day Streak',         desc: 'Studied 7 days in a row' },
  { id: 'cohort_top10',     emoji: '🏆', label: 'Top 10',              desc: 'Ranked in the cohort top 10 by XP' },
  { id: 'graduate',         emoji: '🎓', label: 'Zcash Graduate',       desc: 'Completed the full 8-week programme' },
]

export const STAGE_META = [
  { id: '00', color: 'var(--ink-3)', border: 'var(--line-2)', label: 'Stage 00', name: 'Blockchain Fundamentals', lessons: 20, weeks: '1–2' },
  { id: '01', color: 'var(--gold)',  border: 'var(--gold-dim)', label: 'Stage 01', name: 'Understand Zcash',       lessons: 14, weeks: '3–4' },
  { id: '02', color: 'var(--blue)',  border: 'rgba(99,180,255,0.3)', label: 'Stage 02', name: 'Build with Zcash',  lessons: 18, weeks: '5–6' },
  { id: '03', color: 'var(--purple)',border: 'rgba(192,132,252,0.3)', label: 'Stage 03', name: 'Contribute to Zcash', lessons: 14, weeks: '7–8' },
]
