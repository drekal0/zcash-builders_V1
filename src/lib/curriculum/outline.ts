// Curriculum outline — the single source of truth for the programme's structure:
// stages → modules (one or two per week) → lessons, plus the lab that closes a module.
//
// This file is deliberately light (no lesson bodies) so pages like /learn and
// /dashboard can import it freely. Lesson bodies live in ./content/<module>.ts
// and are loaded on demand by the lesson reader (see ./content/index.ts).

export interface LabMeta {
  id: string
  title: string
  xp: number
}

export interface LessonMeta {
  id: string
  stage: string
  week: number
  module: string // key of the module this lesson belongs to
  title: string
  type: 'lesson' | 'lab'
  xp: number
  duration: number // minutes
  next?: string
  prev?: string
}

export interface ModuleOutline {
  key: string
  stage: string
  week: number
  title: string
  lessons: LessonMeta[]
  lab: LabMeta | null
}

type LessonSeed = [id: string, title: string, duration: number, xp: number]

function mod(
  key: string, stage: string, week: number, title: string,
  lessons: LessonSeed[], lab: LabMeta | null,
): ModuleOutline {
  return {
    key, stage, week, title, lab,
    lessons: lessons.map(([id, lessonTitle, duration, xp]) => ({
      id, stage, week, module: key, title: lessonTitle, type: 'lesson' as const, xp, duration,
    })),
  }
}

// Modules are listed in reading order. Lesson ids are stable keys used by
// lesson_progress rows, so never renumber them — add new ids instead.
export const MODULES: ModuleOutline[] = [
  // ── Stage 00 · Blockchain Fundamentals ────────────────────────────────────
  mod('s00-w1', '00', 1, 'Getting Started', [
    ['l-00-01', 'What is a Blockchain?', 12, 50],
    ['l-00-02', 'Distributed Ledgers vs Traditional Databases', 10, 50],
    ['l-00-03', 'Cryptographic Hash Functions', 15, 75],
    ['l-00-04', 'Digital Signatures & Public Key Cryptography', 18, 75],
    ['l-00-05', 'Merkle Trees', 12, 50],
  ], { id: 'lab-00', title: 'Blockchain Visualiser', xp: 200 }),

  mod('s00-w2', '00', 2, 'Blockchain Fundamentals', [
    ['l-00-06', 'How Blocks Are Mined', 14, 50],
    ['l-00-07', 'Proof of Work vs Proof of Stake', 16, 75],
    ['l-00-08', 'Consensus Mechanisms', 13, 50],
    ['l-00-09', 'UTXO vs Account Model', 15, 75],
    ['l-00-10', 'Transactions & Mempool', 12, 50],
    ['l-00-11', 'Wallets & Key Derivation (BIP-32/39/44)', 20, 100],
  ], null),

  // ── Stage 01 · Understand Zcash ───────────────────────────────────────────
  mod('s01-w3', '01', 3, 'Understanding Zcash', [
    ['l-01-01', 'Why Privacy Matters in Crypto', 12, 50],
    ['l-01-02', 'Zcash History & the Ceremony', 15, 50],
    ['l-01-03', 'Transparent vs Shielded Pools', 18, 75],
    ['l-01-04', 'zk-SNARKs in Plain English', 20, 100],
    ['l-01-05', 'The Sapling Protocol', 16, 75],
    ['l-01-06', 'Ironwood & Halo2 (Post-NU6.3)', 18, 75],
    ['l-01-07', 'Unified Addresses Explained', 14, 75],
  ], { id: 'lab-01', title: 'Unified Address Explorer', xp: 200 }),

  mod('s01-w4', '01', 4, 'Zcash Deep Dive', [
    ['l-01-08', 'ZIPs — How Zcash Improves Itself', 12, 50],
    ['l-01-09', 'The Zcash Development Fund', 10, 50],
    ['l-01-10', 'Governance & Zcash Community', 12, 50],
    ['l-01-11', 'Zcash Full Nodes: Zebra & the Z3 Stack', 16, 75],
    ['l-01-12', 'Indexing with Zaino', 14, 75],
    ['l-01-13', 'Light Client Protocol', 15, 75],
    ['l-01-14', 'Zcash Ecosystem Map', 10, 50],
  ], { id: 'lab-06', title: 'Viewing Keys & Encrypted Memo App', xp: 250 }),

  // ── Stage 02 · Build with Zcash ───────────────────────────────────────────
  mod('s02-w5', '02', 5, 'Build with Zcash', [
    ['l-02-01', 'Zcash SDK Overview: Rust Crates and RPC from TypeScript', 14, 75],
    ['l-02-02', 'Setting Up Your Dev Environment', 20, 100],
    ['l-02-03', 'Sending Your First Ironwood Transaction', 25, 150],
    ['l-02-04', 'Reading Blockchain State via RPC', 18, 100],
    ['l-02-05', 'ZIP-321: Payment URIs', 12, 75],
    ['l-02-06', 'ZIP 315: Confirmations, Balances and Transaction Status', 10, 75],
  ], { id: 'lab-02', title: 'Shielded Transaction Sender', xp: 300 }),

  mod('s02-w6a', '02', 6, 'Real-World Apps', [
    ['l-02-07', 'Building a Payment Gateway', 25, 150],
    ['l-02-08', 'Wallet Sync & Block Scanning', 20, 100],
    ['l-02-09', 'Memo Fields & Encrypted Messages', 15, 75],
    ['l-02-10', 'Error Handling in Zcash Apps', 12, 75],
    ['l-02-11', 'Testing with Testnet & Regtest', 16, 100],
    ['l-02-12', 'Security Best Practices', 14, 75],
    ['l-02-13', 'Performance & Bandwidth Optimization', 12, 75],
    ['l-02-14', 'Deploying to Production', 18, 100],
  ], { id: 'lab-03', title: 'Payment Gateway MVP', xp: 300 }),

  mod('s02-w6b', '02', 6, 'Advanced Patterns', [
    ['l-02-15', 'FROST Threshold Signatures — Protocol Overview', 18, 100],
    ['l-02-16', 'Key Generation & DKG with ZF FROST', 22, 125],
    ['l-02-17', 'Round 1 & 2: Signing Rounds', 20, 125],
    ['l-02-18', 'Aggregate & Verify: the FROST Combiner', 16, 100],
    ['l-02-19', 'Multisig Treasury Patterns', 14, 75],
  ], { id: 'lab-07', title: 'FROST Multisig Treasury', xp: 350 }),

  // ── Stage 03 · Contribute to Zcash ────────────────────────────────────────
  mod('s03-w7a', '03', 7, 'Contribute to Zcash', [
    ['l-03-01', 'How Zcash Is Developed (Open Source)', 12, 75],
    ['l-03-02', 'Reading the Zebra Codebase', 20, 100],
    ['l-03-03', 'Running a Zebra Node', 25, 150],
    ['l-03-04', 'Finding Good First Issues', 10, 50],
    ['l-03-05', 'Writing a ZIP Proposal', 18, 100],
    ['l-03-06', 'Rust for Zcash Contributors', 20, 100],
    ['l-03-07', 'Code Review Culture in Zcash', 12, 75],
  ], { id: 'lab-04', title: 'Zebra Node Deployment', xp: 400 }),

  mod('s03-w7b', '03', 7, 'Indexing & Infrastructure', [
    ['l-03-15', 'Post-zcashd Infrastructure: Zaino Architecture', 16, 100],
    ['l-03-16', 'Running Zaino with Docker Compose (Z3 Stack)', 24, 150],
    ['l-03-17', 'gRPC & lightwalletd-Compatible APIs', 18, 100],
    ['l-03-18', 'Indexing Shielded Transactions with Zaino', 20, 125],
    ['l-03-19', 'Building a Block Explorer Backend', 16, 100],
  ], { id: 'lab-08', title: 'Zaino-Powered Block Explorer', xp: 400 }),

  mod('s03-w8', '03', 8, 'Ship & Graduate', [
    ['l-03-08', 'Zcash Community Grants (ZCG) — Funding Your Project', 14, 75],
    ['l-03-09', 'Writing a Grant Proposal', 18, 100],
    ['l-03-10', 'Demo Day: Presenting Your Project', 15, 100],
    ['l-03-11', 'Building in Public on X & GitHub', 10, 50],
    ['l-03-12', 'Mentoring the Next Cohort', 12, 75],
    ['l-03-13', 'The Road Ahead: Your Zcash Journey', 10, 50],
    ['l-03-14', 'Graduation & Alumni Network', 8, 50],
  ], { id: 'lab-05', title: 'Open Source Contribution', xp: 400 }),
]

// ── Derived lookups ─────────────────────────────────────────────────────────

// Every lesson in reading order, with prev/next wired across module boundaries
export const ALL_LESSON_META: LessonMeta[] = MODULES.flatMap(m => m.lessons)

ALL_LESSON_META.forEach((lesson, i) => {
  if (i > 0) lesson.prev = ALL_LESSON_META[i - 1].id
  if (i < ALL_LESSON_META.length - 1) lesson.next = ALL_LESSON_META[i + 1].id
})

export const LESSON_META_MAP = new Map<string, LessonMeta>(
  ALL_LESSON_META.map(l => [l.id, l]),
)

export const MODULE_MAP = new Map<string, ModuleOutline>(MODULES.map(m => [m.key, m]))

export const STAGE_IDS = ['00', '01', '02', '03'] as const

export const STAGE_MODULES: Record<string, ModuleOutline[]> = Object.fromEntries(
  STAGE_IDS.map(id => [id, MODULES.filter(m => m.stage === id)]),
)

// Ordered lesson ids per stage
export const STAGE_LESSON_IDS: Record<string, string[]> = Object.fromEntries(
  STAGE_IDS.map(id => [id, ALL_LESSON_META.filter(l => l.stage === id).map(l => l.id)]),
)

export const ALL_LABS: (LabMeta & { stage: string; week: number; module: string })[] = MODULES
  .filter(m => m.lab)
  .map(m => ({ ...m.lab!, stage: m.stage, week: m.week, module: m.key }))

export const TOTAL_WEEKS = 8
export const TOTAL_LESSONS = ALL_LESSON_META.length
export const TOTAL_LABS = ALL_LABS.length
export const TOTAL_XP =
  ALL_LESSON_META.reduce((n, l) => n + l.xp, 0) + ALL_LABS.reduce((n, l) => n + l.xp, 0)
