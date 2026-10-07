// Public landing page — /
//
// Ported from the prototype's index.html (same design, sections and feel), with
// links wired to real routes and the Zcash facts brought up to date.
//
// Server component. The interactive pieces live in src/components/landing/.
// Curriculum numbers are read from the outline so this page cannot drift from it.

import type { CSSProperties, ReactNode } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { STAGE_META } from '@/lib/design-tokens'
import {
  MODULES,
  STAGE_MODULES,
  TOTAL_LABS,
  TOTAL_LESSONS,
  TOTAL_WEEKS,
  TOTAL_XP,
} from '@/lib/curriculum/outline'

import { CopyButton } from '@/components/landing/CopyButton'
import { FaqAccordion, type FaqItem } from '@/components/landing/FaqAccordion'
import { LandingNav, type NavSection } from '@/components/landing/LandingNav'
import { QuickstartTabs } from '@/components/landing/QuickstartTabs'
import { RevealOnScroll } from '@/components/landing/RevealOnScroll'
import { ScrollProgress } from '@/components/landing/ScrollProgress'
import { highlight, type SnippetLang } from '@/components/landing/highlight'
import styles from '@/components/landing/landing.module.css'

// ─── Programme facts that are not in the curriculum outline ──────────────────
// Change these here when the cohort details change.
const COHORT_NAME = 'Cohort 01'
const COHORT_START = 'November 2026'

// ─── Curriculum, derived from the outline ────────────────────────────────────
const STAGES = STAGE_META.flatMap(meta => {
  const modules = STAGE_MODULES[meta.id] ?? []
  if (modules.length === 0) return []
  const weeks = modules.map(m => m.week)
  const first = Math.min(...weeks)
  const last = Math.max(...weeks)
  return [{
    id: meta.id,
    name: meta.name,
    color: meta.color,
    weeksLabel: first === last ? `Week ${first}` : `Weeks ${first}–${last}`,
    modules,
    lessonCount: modules.reduce((n, m) => n + m.lessons.length, 0),
    labs: modules.flatMap(m => (m.lab ? [{ ...m.lab, week: m.week }] : [])),
  }]
})

const STAGE_COUNT = STAGES.length
const STAGE_COLOR = new Map(STAGES.map(s => [s.id, s.color]))

const LABS = MODULES.flatMap(m => (m.lab ? [{ ...m.lab, week: m.week, stage: m.stage, module: m.title }] : []))

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export const metadata: Metadata = {
  title: { absolute: 'Zcash Builders — Learn to build on Zcash' },
  description:
    `A free, ${TOTAL_WEEKS}-week cohort programme for developers building on Zcash: ` +
    `${TOTAL_LESSONS} lessons and ${TOTAL_LABS} hands-on labs across ${STAGE_COUNT} stages, from blockchain ` +
    `fundamentals to running a Zebra node and contributing to open source. ${COHORT_NAME} starts ${COHORT_START}.`,
  openGraph: {
    title: 'Zcash Builders — Learn to build on Zcash',
    description:
      `${TOTAL_WEEKS} weeks, ${TOTAL_LESSONS} lessons, ${TOTAL_LABS} hands-on labs. ` +
      `Learn privacy engineering by building real Zcash applications. ${COHORT_NAME} starts ${COHORT_START}.`,
    type: 'website',
  },
}

// ─── Copy ────────────────────────────────────────────────────────────────────
const NAV_SECTIONS: NavSection[] = [
  { id: 'infra', label: 'Infrastructure' },
  { id: 'programme', label: 'Programme' },
  { id: 'quickstart', label: 'Quickstart' },
  { id: 'outcomes', label: 'Labs' },
  { id: 'faq', label: 'FAQ' },
]

const MARQUEE = [
  'zk-SNARKs',
  'Halo 2',
  'Ironwood',
  'Selective disclosure',
  'Shielded transactions',
  'Unified Addresses',
  'No trusted setup',
  'Privacy is a human right',
]

// What each stage covers. The structure (weeks, modules, lesson and lab counts)
// comes from the outline; only this descriptive copy is written by hand.
const STAGE_COPY: Record<string, { summary: string; tags: string[] }> = {
  '00': {
    summary:
      'Start from first principles: hash functions, digital signatures and Merkle trees, then how blocks are mined, how nodes agree on one chain, and how wallets derive their keys.',
    tags: ['Hash functions', 'Signatures', 'Merkle trees', 'Proof of work', 'UTXO model', 'Key derivation'],
  },
  '01': {
    summary:
      'Why privacy matters, what a zk-SNARK proves, and how the protocol grew from Sapling to today’s Ironwood pool. Then the machinery around it: ZIPs, governance and funding, the Zebra node, the Zaino indexer and the light-client protocol.',
    tags: ['zk-SNARKs', 'Sapling', 'Ironwood', 'Halo 2', 'Unified Addresses', 'Viewing keys', 'ZIPs'],
  },
  '02': {
    summary:
      'Set up a development environment, send a shielded transaction and read chain state over RPC. Then build real payment flows — payment requests, wallet sync, encrypted memos — and work through FROST threshold signatures.',
    tags: ['Rust', 'TypeScript', 'JSON-RPC', 'ZIP 321', 'Memos', 'Testnet & regtest', 'FROST'],
  },
  '03': {
    summary:
      'Run your own Zebra node, index the chain with Zaino, and learn how Zcash is developed in the open: reading the codebase, finding a first issue, code review, ZIPs and grant proposals. Finish by making a contribution of your own.',
    tags: ['Zebra', 'Zaino', 'Z3 stack', 'gRPC', 'Open source', 'Grants', 'Demo day'],
  },
}

// One line per lab, keyed by the lab id in the outline. A lab added to the
// outline later still appears below; it just falls back to its module name.
const LAB_COPY: Record<string, string> = {
  'lab-00': 'A visualiser for blocks, hashes and the links between them — change one block and watch every block after it break.',
  'lab-01': 'A tool that takes a Unified Address apart and shows the receivers packed inside it.',
  'lab-06': 'A watch-only service that uses a viewing key to detect incoming shielded payments and read their encrypted memos.',
  'lab-02': 'A command-line tool that builds a shielded transaction and broadcasts it on testnet.',
  'lab-03': 'A merchant payment flow that issues ZIP 321 payment requests and tracks them to confirmation.',
  'lab-07': 'An experimental shared treasury on testnet that needs two of three signers to spend, built with the Zcash Foundation’s FROST tools.',
  'lab-04': 'Your own Zebra node, deployed with the Z3 Docker Compose stack and synced to testnet.',
  'lab-08': 'A block-explorer backend that reads chain data from the Zaino indexer over gRPC.',
  'lab-05': 'A pull request to an active open-source Zcash project, taken through review with its maintainers.',
}

interface InfraCard {
  ident: string
  status: { label: string; tone: 'open' | 'beta' | 'neutral' }
  title: string
  body: ReactNode
  endpoint:
    | { kind: 'copy'; text: string; value: string; href?: string; label: string }
    | { kind: 'link'; text: string; href: string }
}

const code = (text: string) => <code className={styles.inlineCode}>{text}</code>

const external = (href: string, text: string) => (
  <a href={href} className={styles.textLink} target="_blank" rel="noopener noreferrer">{text}</a>
)

const INFRA: InfraCard[] = [
  {
    ident: 'Full node',
    status: { label: 'Open source', tone: 'open' },
    title: 'Zebra',
    body: (
      <>
        The Zcash Foundation’s consensus full node, written in Rust, and the node this programme
        teaches now that zcashd has been shut down. Run it from the {code('zfnd/zebra')} Docker
        image or install {code('zebrad')} with Cargo. Zebra has no wallet of its own.
      </>
    ),
    endpoint: {
      kind: 'copy',
      text: 'github.com/ZcashFoundation/zebra',
      value: 'https://github.com/ZcashFoundation/zebra',
      href: 'https://github.com/ZcashFoundation/zebra',
      label: 'Zebra repository URL',
    },
  },
  {
    ident: 'Indexer',
    status: { label: 'Open source', tone: 'open' },
    title: 'Zaino',
    body: (
      <>
        Zingo Labs’ indexer. It reads from Zebra and serves the lightwalletd-compatible{' '}
        {code('CompactTxStreamer')} gRPC API to light wallets, plus a JSON-RPC subset for block
        explorers.
      </>
    ),
    endpoint: {
      kind: 'copy',
      text: 'github.com/zingolabs/zaino',
      value: 'https://github.com/zingolabs/zaino',
      href: 'https://github.com/zingolabs/zaino',
      label: 'Zaino repository URL',
    },
  },
  {
    ident: 'Wallet',
    status: { label: 'Beta', tone: 'beta' },
    title: 'Zallet',
    body: (
      <>
        The full-node wallet that takes over from the zcashd wallet, with a JSON-RPC interface for
        applications. It is still in beta: expect breaking changes, and not every zcashd RPC method
        has been ported yet.
      </>
    ),
    endpoint: {
      kind: 'copy',
      text: 'github.com/zcash/zallet',
      value: 'https://github.com/zcash/zallet',
      href: 'https://github.com/zcash/zallet',
      label: 'Zallet repository URL',
    },
  },
  {
    ident: 'Local stack',
    status: { label: 'Open source', tone: 'open' },
    title: 'Z3',
    body: (
      <>
        Zebra and Zallet packaged with Docker Compose, with Zaino behind an optional{' '}
        {code('indexer')} profile. It runs on mainnet, on testnet, or as a local regtest network
        that needs no sync — the one the <a href="#quickstart" className={styles.textLink}>quickstart</a> uses.
      </>
    ),
    endpoint: {
      kind: 'copy',
      text: 'github.com/ZcashFoundation/z3',
      value: 'https://github.com/ZcashFoundation/z3',
      href: 'https://github.com/ZcashFoundation/z3',
      label: 'Z3 repository URL',
    },
  },
  {
    ident: 'Testnet',
    status: { label: 'Community-run', tone: 'neutral' },
    title: 'Testnet server & faucets',
    body: (
      <>
        A public testnet light-client server run by zec.rocks, and the default testnet server in{' '}
        {code('zcash-devtool')}. Public servers come and go, so check{' '}
        {external('https://hosh.zec.rocks/zec', 'hosh.zec.rocks')} for what is up. Test coins (TAZ)
        come from community faucets:{' '}
        {external('https://zechub.wiki/using-zcash/testnet', 'ZecHub keeps a list')}.
      </>
    ),
    endpoint: {
      kind: 'copy',
      text: 'testnet.zec.rocks:443',
      value: 'testnet.zec.rocks:443',
      label: 'testnet server address',
    },
  },
  {
    ident: 'Dashboard',
    status: { label: 'Sign-in required', tone: 'neutral' },
    title: 'Builders Dashboard',
    body: (
      <>
        Where enrolled builders follow the curriculum: pick up the next lesson, earn XP as you
        complete each one, and submit your labs for review.
      </>
    ),
    endpoint: { kind: 'link', text: 'Open dashboard', href: '/dashboard' },
  },
]

const STATUS_CLASS = {
  open: styles.statusOpen,
  beta: styles.statusBeta,
  neutral: styles.statusNeutral,
} as const

// ─── Quickstart snippets ─────────────────────────────────────────────────────
// Every command here comes from the projects' own documentation:
//   · Z3 README and docs/regtest.md      (github.com/ZcashFoundation/z3)
//   · zcash-devtool doc/walkthrough.md   (github.com/zcash/zcash-devtool)
//   · walletrpc/service.proto            (github.com/zcash/lightwallet-protocol)
// Re-check them against those sources before editing.

const SNIPPET_Z3 = `# Zebra + Zallet on a local regtest network, using the Zcash Foundation's Z3 stack.
# Needs Docker Engine with Docker Compose v2.24.4+, git and openssl.
git clone https://github.com/ZcashFoundation/z3 && cd z3

# First run only: writes local config, starts Zebra, mines the activation blocks
# (every upgrade through NU6.3 "Ironwood") and creates the Zallet wallet.
./scripts/regtest-init.sh

# Start the stack. Regtest has no peers and nothing to sync.
docker compose --env-file .env.regtest up -d

# Ask Zebra about the chain. On regtest one JSON-RPC router fronts both services.
curl -s -X POST -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"getblockchaininfo","params":[],"id":1}' \\
  http://127.0.0.1:8181

# Ask Zallet, the wallet, through the same port.
curl -s -X POST -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"getwalletinfo","params":[],"id":2}' \\
  http://127.0.0.1:8181

# Add Zaino: a lightwalletd-compatible gRPC endpoint on localhost:28137 (plaintext).
docker compose --env-file .env.regtest --profile indexer up -d zaino

# Stop everything and keep your data.
docker compose --env-file .env.regtest --profile "*" down`

const SNIPPET_TS = `// Query your local Zaino over gRPC (start it from the Z3 regtest tab first).
//
//   npm install @grpc/grpc-js @grpc/proto-loader
//   git clone https://github.com/zcash/lightwallet-protocol
//   npx tsx get-tip.ts

// get-tip.ts
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'

const definition = protoLoader.loadSync('service.proto', {
  includeDirs: ['lightwallet-protocol/walletrpc'],
  longs: String, // block heights are uint64
})
const proto = grpc.loadPackageDefinition(definition) as any

const client = new proto.cash.z.wallet.sdk.rpc.CompactTxStreamer(
  'localhost:28137',
  grpc.credentials.createInsecure(), // plaintext: local regtest only
)

// Which server and chain are we talking to?
client.GetLightdInfo({}, (err: Error | null, info: any) => {
  if (err) throw err
  console.log(info.vendor, 'on chain', info.chainName, 'at height', info.blockHeight)
})

// Find the chain tip, then stream every compact block up to it.
client.GetLatestBlock({}, (err: Error | null, tip: any) => {
  if (err) throw err
  console.log('Chain tip:', tip.height)

  const blocks = client.GetBlockRange({ start: { height: 1 }, end: { height: tip.height } })
  blocks.on('data', (block: any) => console.log('block', block.height, 'txs:', block.vtx.length))
  blocks.on('error', (e: Error) => { throw e })
  blocks.on('end', () => client.close())
})`

const SNIPPET_PYTHON = `# Query your local Zaino over gRPC (start it from the Z3 regtest tab first).
#
#   pip install grpcio grpcio-tools
#   git clone https://github.com/zcash/lightwallet-protocol
#   python -m grpc_tools.protoc -I lightwallet-protocol/walletrpc \\
#     --python_out=. --grpc_python_out=. service.proto compact_formats.proto
#   python get_tip.py

# get_tip.py
import grpc
import service_pb2
import service_pb2_grpc

# Plaintext channel: local regtest only.
channel = grpc.insecure_channel("localhost:28137")
stub = service_pb2_grpc.CompactTxStreamerStub(channel)

# Which server and chain are we talking to?
info = stub.GetLightdInfo(service_pb2.Empty())
print(info.vendor, "on chain", info.chainName, "at height", info.blockHeight)

# Find the chain tip, then stream every compact block up to it.
tip = stub.GetLatestBlock(service_pb2.ChainSpec())
print("Chain tip:", tip.height)

block_range = service_pb2.BlockRange(
    start=service_pb2.BlockID(height=1),
    end=service_pb2.BlockID(height=tip.height),
)
for block in stub.GetBlockRange(block_range):
    print("block", block.height, "txs:", len(block.vtx))`

const SNIPPET_DEVTOOL = `# zcash-devtool: a developer wallet CLI built on the librustzcash crates.
# Built from source with a Rust toolchain (https://rustup.rs) - there are no binary releases.
# It is for testing and development: do not keep significant funds in it.
git clone https://github.com/zcash/zcash-devtool
cd zcash-devtool

# Create a testnet wallet outside the repository. "-s zecrocks" selects the
# testnet.zec.rocks server; the age key file encrypts the wallet's seed phrase.
cargo run --release --all-features -- wallet -w ../dev-wallet init --name "ZDevTest" \\
  -i ../dev-wallet/dev-key.txt -n test -s zecrocks

# Show an address, then send it some TAZ from a testnet faucet.
cargo run --release --all-features -- wallet -w ../dev-wallet list-addresses

# Scan the chain for your funds and check the balance.
cargo run --release --all-features -- wallet -w ../dev-wallet sync -s zecrocks
cargo run --release --all-features -- wallet -w ../dev-wallet balance`

const SNIPPETS: { id: string; label: string; lang: SnippetLang; code: string }[] = [
  { id: 'z3', label: 'Docker · Z3 regtest', lang: 'shell', code: SNIPPET_Z3 },
  { id: 'ts', label: 'TypeScript', lang: 'ts', code: SNIPPET_TS },
  { id: 'python', label: 'Python', lang: 'python', code: SNIPPET_PYTHON },
  { id: 'devtool', label: 'Rust · zcash-devtool', lang: 'shell', code: SNIPPET_DEVTOOL },
]

const QUICKSTART_TABS = SNIPPETS.map(snippet => ({
  id: snippet.id,
  label: snippet.label,
  code: snippet.code,
  highlighted: highlight(snippet.code, snippet.lang),
}))

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQ: FaqItem[] = [
  {
    question: 'Do I need prior Zcash or crypto experience?',
    answer: (
      <>
        No. You need some programming experience, in any language, but no blockchain or Zcash
        knowledge — Stage 00 starts from hash functions and digital signatures and builds up from
        there. It does move quickly: this is a hands-on engineering programme, not an introductory
        survey.
      </>
    ),
  },
  {
    question: 'What languages and tools does the programme use?',
    answer: (
      <>
        The Zcash stack you will work with is written in Rust: the Zebra full node ({code('zebrad')}),
        the Zaino indexer, the Zallet wallet and the librustzcash libraries. You run it with Docker
        Compose through the Z3 stack and talk to it over JSON-RPC and gRPC, so your own application
        code can be TypeScript, Python or Rust. Rust is introduced as you need it; you are not
        expected to know it on day one.
      </>
    ),
  },
  {
    question: 'How much time do I need each week?',
    answer: (
      <>
        Plan for about five hours a week over the {TOTAL_WEEKS} weeks: self-paced lessons, plus a
        hands-on lab at the end of most modules. The later weeks, when you deploy a node and work on
        an open-source contribution, tend to take longer.
      </>
    ),
  },
  {
    question: 'Is it free?',
    answer: (
      <>
        Yes. The programme is free to join, and the tools it teaches are open source. The one cost
        to plan for is a small amount of ZEC — roughly $5–10 — for the final mainnet deployment in
        week {TOTAL_WEEKS}. Wherever possible, lab work is done on testnet or a local regtest
        network, where coins have no value.
      </>
    ),
  },
  {
    question: 'What will I have when I finish?',
    answer: (
      <>
        Working software rather than a certificate of attendance: {TOTAL_LABS} labs that run from a
        blockchain visualiser to a payment gateway, a Zebra node you deployed yourself, and a pull
        request to an open-source Zcash project. Your lessons, labs and XP are tracked in your
        dashboard as you go.
      </>
    ),
  },
  {
    question: `When does ${COHORT_NAME} start?`,
    answer: (
      <>
        {COHORT_NAME} starts in {COHORT_START} and runs for {TOTAL_WEEKS} weeks. It is fully remote.{' '}
        <Link href="/apply" className={styles.textLink}>Apply here</Link>: applications are reviewed
        on a rolling basis, and you will hear back by email.
      </>
    ),
  },
  {
    question: 'Can I use the tools without joining the cohort?',
    answer: (
      <>
        Yes. Everything under Developer Infrastructure is open source or community-run and free for
        any developer to use, the quickstart on this page works on any machine with Docker, and the
        curriculum outline is public on the <Link href="/learn" className={styles.textLink}>curriculum page</Link>.
        The cohort adds structure, mentor review of your labs, and a group of peers building
        alongside you.
      </>
    ),
  },
]

// ─── Small pieces ────────────────────────────────────────────────────────────
function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function SectionHead({ num, meta, title, children }: {
  num: string
  meta: ReactNode
  title: ReactNode
  children: ReactNode
}) {
  return (
    <div className={styles.sectionHead}>
      <div className={styles.sectionMeta}>
        <span className={styles.sectionMetaNum} aria-hidden="true">{num}</span>
        {meta}
      </div>
      <div>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <p className={styles.sectionDesc}>{children}</p>
      </div>
    </div>
  )
}

const stageVar = (color: string | undefined) => ({ '--stage': color ?? 'var(--gold)' }) as CSSProperties

// ─── Page ────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div id="top" className={`page-public ${styles.page}`}>
      <a href="#main" className={styles.skip}>Skip to content</a>
      <ScrollProgress />
      <RevealOnScroll />
      <LandingNav sections={NAV_SECTIONS} />

      <main id="main">
        {/* ── Hero ── */}
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroBg} aria-hidden="true" />

          <p className={styles.heroTag}>
            <span className={styles.heroTagDot} aria-hidden="true" />
            <span>Zcash Developer Programme</span>
            <span className={styles.heroTagDiv} aria-hidden="true" />
            <span className={styles.heroTagMeta}>{COHORT_NAME} · {COHORT_START}</span>
          </p>

          <h1 id="hero-title" className={styles.heroTitle}>
            Learn to build on<br />
            <em>Zcash.</em> Ship real apps.
          </h1>

          <p className={styles.heroDesc}>
            <strong>{TOTAL_WEEKS} weeks</strong> across <strong>{STAGE_COUNT} progressive stages</strong> —
            from blockchain fundamentals to running your own Zebra node and shipping applications on
            Zcash. {TOTAL_LESSONS} lessons, {TOTAL_LABS} hands-on labs, and an open-source contribution.
          </p>

          <div className={styles.heroActions}>
            <Link href="/apply" className={`btn btn-primary ${styles.btnLg} ${styles.btnShine}`}>
              Apply to {COHORT_NAME}
              <Arrow />
            </Link>
            <Link href="/learn" className={`btn ${styles.btnLg} ${styles.btnSecondary}`}>
              View curriculum
            </Link>
          </div>

          <div className={styles.marquee}>
            <div className={styles.marqueeTrack}>
              <ul className={styles.marqueeGroup}>
                {MARQUEE.map(item => <li key={item} className={styles.marqueeItem}>{item}</li>)}
              </ul>
              {/* Duplicate so the loop is seamless; hidden from assistive technology. */}
              <ul className={styles.marqueeGroup} aria-hidden="true">
                {MARQUEE.map(item => <li key={item} className={styles.marqueeItem}>{item}</li>)}
              </ul>
            </div>
          </div>
        </section>

        {/* ── 01 · Developer infrastructure ── */}
        <section className={styles.section} id="infra" aria-labelledby="infra-title">
          <SectionHead
            num="01"
            meta={<>Developer<br /> Infrastructure</>}
            title={<span id="infra-title">Start building <em>today.</em></span>}
          >
            The open-source stack this programme teaches, and the public test network around it. You
            don’t need to join the cohort to use any of it — this is the Zcash developer commons.
          </SectionHead>

          <ul className={styles.infraGrid}>
            {INFRA.map((card, i) => (
              <li key={card.title} className={`${styles.infraCard} ${styles.reveal}`} data-reveal="">
                <div className={styles.infraTop}>
                  <span className={styles.infraIdent}>
                    {String(i + 1).padStart(2, '0')} · {card.ident}
                  </span>
                  <span className={`${styles.statusPill} ${STATUS_CLASS[card.status.tone]}`}>
                    {card.status.label}
                  </span>
                </div>
                <h3 className={styles.infraTitle}>{card.title}</h3>
                <p className={styles.infraBody}>{card.body}</p>
                <div className={styles.infraEndpoint}>
                  {card.endpoint.kind === 'link' ? (
                    <Link href={card.endpoint.href} className={styles.infraEndpointText}>
                      {card.endpoint.text} →
                    </Link>
                  ) : (
                    <>
                      {card.endpoint.href ? (
                        <a
                          href={card.endpoint.href}
                          className={styles.infraEndpointText}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {card.endpoint.text}
                        </a>
                      ) : (
                        <span className={styles.infraEndpointText}>{card.endpoint.text}</span>
                      )}
                      <CopyButton text={card.endpoint.value} label={card.endpoint.label} />
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 02 · Programme ── */}
        <section className={styles.section} id="programme" aria-labelledby="programme-title">
          <SectionHead
            num="02"
            meta={<>The<br /> Programme</>}
            title={<span id="programme-title">From first principles to <em>first pull request.</em></span>}
          >
            {STAGE_COUNT} stages over {TOTAL_WEEKS} weeks. Each stage pairs short lessons with
            hands-on labs, and each one builds on the stage before it.
          </SectionHead>

          <dl className={styles.stats}>
            {[
              { value: String(TOTAL_WEEKS), label: 'Weeks' },
              { value: String(TOTAL_LESSONS), label: 'Lessons' },
              { value: String(TOTAL_LABS), label: 'Hands-on labs' },
              { value: TOTAL_XP.toLocaleString('en-GB'), label: 'XP to earn' },
            ].map(stat => (
              <div key={stat.label} className={styles.stat}>
                <dt className={styles.statLabel}>{stat.label}</dt>
                <dd className={styles.statValue}>{stat.value}</dd>
              </div>
            ))}
          </dl>

          <ol className={styles.stages}>
            {STAGES.map(stage => {
              const copy = STAGE_COPY[stage.id]
              return (
                <li
                  key={stage.id}
                  className={`${styles.stage} ${styles.reveal}`}
                  style={stageVar(stage.color)}
                  data-reveal=""
                >
                  <div className={styles.stageNum}>
                    <span aria-hidden="true">{stage.id}</span>
                    <span className={styles.stageNumLabel}>
                      <span className="sr-only">Stage {stage.id}, </span>
                      {stage.weeksLabel}
                    </span>
                  </div>

                  <div>
                    <h3 className={styles.stageTitle}>{stage.name}</h3>
                    {copy && <p className={styles.stageTopics}>{copy.summary}</p>}
                    <ul className={styles.modules}>
                      {stage.modules.map(module => (
                        <li key={module.key} className={styles.module}>
                          <span className={styles.moduleWeek}>Week {module.week}</span>
                          <span>{module.title}</span>
                          <span className={styles.moduleCount}>{plural(module.lessons.length, 'lesson')}</span>
                        </li>
                      ))}
                    </ul>
                    {copy && (
                      <ul className={styles.tags} aria-label="Topics">
                        {copy.tags.map(tag => <li key={tag} className={styles.tag}>{tag}</li>)}
                      </ul>
                    )}
                  </div>

                  {stage.labs.length > 0 && (
                    <div className={styles.stageLab}>
                      <div className={styles.labLabel}>
                        {plural(stage.labs.length, 'lab')} · {plural(stage.lessonCount, 'lesson')}
                      </div>
                      <ul className={styles.labList}>
                        {stage.labs.map(lab => (
                          <li key={lab.id}>
                            <span className={styles.labName}>{lab.title}</span>
                            <span className={styles.labMeta}>Week {lab.week} · +{lab.xp} XP</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              )
            })}
          </ol>

          <p className={styles.sectionFoot}>
            Every lesson is listed in the{' '}
            <Link href="/learn" className={styles.textLink}>full curriculum</Link>.
          </p>
        </section>

        {/* ── 03 · Quickstart ── */}
        <section className={styles.section} id="quickstart" aria-labelledby="quickstart-title">
          <SectionHead
            num="03"
            meta={<>Quickstart<br /> Run locally</>}
            title={<span id="quickstart-title">A full Zcash stack on your machine, <em>in minutes.</em></span>}
          >
            Z3 runs Zebra and Zallet together on a local regtest network: blocks on demand, no
            peers, nothing to sync. Add Zaino for a light-client gRPC endpoint, then query it from
            TypeScript or Python.
          </SectionHead>

          <QuickstartTabs title="z3 regtest — quickstart" tabs={QUICKSTART_TABS} />

          <p className={styles.quickstartNote}>
            These commands follow the{' '}
            {external('https://github.com/ZcashFoundation/z3', 'Z3 README and regtest guide')}, the{' '}
            {external('https://github.com/zcash/zcash-devtool', 'zcash-devtool walkthrough')} and the{' '}
            {external('https://github.com/zcash/lightwallet-protocol', 'light-client protocol definition')},
            as of October 2026. All of this software is moving quickly, so if a command fails, check
            the project’s own documentation first. A mainnet node is a different commitment: about
            300 GB of disk and one to three days for the first sync.
          </p>
        </section>

        {/* ── 04 · Outcomes ── */}
        <section className={styles.section} id="outcomes" aria-labelledby="outcomes-title">
          <SectionHead
            num="04"
            meta={<>Programme<br /> Outcomes</>}
            title={<span id="outcomes-title">What you will <em>have built.</em></span>}
          >
            {COHORT_NAME} is the first intake, so there are no graduate stories to quote yet. What
            we can show you is the work itself: the {TOTAL_LABS} labs you build and submit for
            review on the way to week {TOTAL_WEEKS}.
          </SectionHead>

          <ol className={styles.outcomes}>
            {LABS.map((lab, i) => (
              <li
                key={lab.id}
                className={`${styles.outcomeCard} ${styles.reveal}`}
                style={stageVar(STAGE_COLOR.get(lab.stage))}
                data-reveal=""
              >
                <div className={styles.outcomeTop}>
                  <span className={styles.outcomeNum}>Lab · {String(i + 1).padStart(2, '0')}</span>
                  <span>Week {lab.week}</span>
                </div>
                <h3 className={styles.outcomeTitle}>{lab.title}</h3>
                <p className={styles.outcomeBody}>
                  {LAB_COPY[lab.id] ?? `The lab that closes the “${lab.module}” module.`}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── 05 · FAQ ── */}
        <section className={styles.section} id="faq" aria-labelledby="faq-title">
          <SectionHead
            num="05"
            meta={<>Questions &amp;<br /> Answers</>}
            title={<span id="faq-title">Common <em>questions.</em></span>}
          >
            What to know before you apply to the Zcash Builders programme.
          </SectionHead>

          <FaqAccordion items={FAQ} />
        </section>

        {/* ── Apply ── */}
        <section className={`${styles.section} ${styles.ctaSection}`} id="apply" aria-labelledby="apply-title">
          <div className={styles.cta}>
            <div className={styles.ctaInner}>
              <p className={styles.ctaLabel}>
                <span>Applications open</span> · <span>{COHORT_NAME}</span> · <span>{COHORT_START}</span>
              </p>
              <h2 id="apply-title" className={styles.ctaTitle}>
                Ready to ship on <em>Zcash?</em>
              </h2>
              <p className={styles.ctaDesc}>
                {TOTAL_WEEKS} weeks. {TOTAL_LESSONS} lessons. {TOTAL_LABS} labs. A node you run
                yourself and an open-source contribution. Apply to the first cohort.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/apply" className={`btn btn-primary ${styles.btnLg} ${styles.btnShine}`}>
                  Apply now
                  <Arrow />
                </Link>
                <a href="#faq" className={`btn ${styles.btnLg} ${styles.btnSecondary}`}>
                  Read the FAQ
                </a>
              </div>
              <p className={styles.ctaMeta}>
                <span>Starts {COHORT_START}</span> · <span>{TOTAL_WEEKS} weeks</span> ·{' '}
                <span>Free</span> · <span>Fully remote</span>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBottom}>
          <span>© 2026 · Zcash Builders · Community-run</span>
          <ul className={styles.footerLinks}>
            <li><Link href="/learn">Curriculum</Link></li>
            <li><Link href="/apply">Apply</Link></li>
            <li><Link href="/login">Sign in</Link></li>
          </ul>
        </div>
      </footer>
    </div>
  )
}
