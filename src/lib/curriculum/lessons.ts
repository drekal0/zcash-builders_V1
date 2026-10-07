// ── Lesson content library ────────────────────────────────────────────────────
// Each lesson has id, stage, week, title, type, xp, duration, and content (HTML string).
// Content is rendered with dangerouslySetInnerHTML inside the lesson page.

export interface LessonMeta {
  id: string
  stage: string
  week: number
  title: string
  subtitle?: string
  type: 'lesson' | 'lab'
  xp: number
  duration: number // minutes
  next?: string
  prev?: string
}

export interface Lesson extends LessonMeta {
  content: string // rich HTML
}

// ── Stage 00: Blockchain Foundations ─────────────────────────────────────────
const S00_LESSONS: Lesson[] = [
  {
    id: 'l-00-01', stage: '00', week: 1,
    title: 'What is a Blockchain?',
    subtitle: 'The core idea behind distributed, tamper-proof ledgers',
    type: 'lesson', xp: 50, duration: 12,
    content: `
<h2>The problem blockchains solve</h2>
<p>Before blockchains, digital money had a fundamental problem: nothing stopped you from spending the same coin twice. A file can be copied infinitely, so a digital "dollar" stored as bits is trivial to duplicate. Traditional finance solves this with a central ledger — a bank's database that tracks who owns what and prevents double-spending.</p>
<p>But a central ledger requires you to trust the bank. You're trusting them not to lose your funds, freeze your account, inflate the supply, or get hacked. That trust has a price — fees, censorship risk, exclusion of the unbanked, and systemic fragility.</p>
<p>A <strong>blockchain</strong> is a way to maintain a shared ledger without any single trusted party. Instead of one bank's database, thousands of computers each hold an identical copy. Transactions are validated by network consensus and chained together cryptographically, making history tamper-proof.</p>

<h2>Anatomy of a block</h2>
<p>A blockchain is literally a chain of blocks. Each block contains:</p>
<ul>
  <li><strong>A list of transactions</strong> — who sent what to whom</li>
  <li><strong>A timestamp</strong> — when the block was produced</li>
  <li><strong>The previous block's hash</strong> — the cryptographic fingerprint linking it to the chain</li>
  <li><strong>A nonce</strong> — a number miners iterate to satisfy the proof-of-work puzzle</li>
  <li><strong>The block's own hash</strong> — computed from all the above</li>
</ul>
<p>Because each block includes the hash of the one before it, changing any historical transaction would change that block's hash — which would break every subsequent block's hash. An attacker would have to redo the proof of work for every later block, faster than the honest network adds new ones. On Bitcoin or Zcash, that's computationally infeasible.</p>

<h2>Decentralisation in practice</h2>
<p>Anyone can run a full node — software that downloads the entire blockchain, validates every transaction against the protocol rules, and relays new transactions and blocks to peers. Full nodes enforce the rules independently; they don't trust each other, they verify. This is sometimes called "don't trust, verify."</p>
<p>Miners (or validators in proof-of-stake chains) compete to add the next block. On proof-of-work chains like Zcash, they do this by repeatedly hashing block headers until they find a hash below a target value. The difficulty adjusts automatically so blocks arrive roughly on schedule (every 75 seconds on Zcash).</p>

<h2>Key properties</h2>
<ul>
  <li><strong>Immutability</strong> — past transactions cannot be altered without redoing all subsequent proof-of-work</li>
  <li><strong>Transparency</strong> — on transparent chains, all transactions are public; Zcash adds an optional privacy layer</li>
  <li><strong>Censorship resistance</strong> — no single party can block your transaction if you pay the fee</li>
  <li><strong>Permissionless</strong> — anyone can transact or run a node without asking for approval</li>
</ul>

<blockquote>On Zcash, the transparent layer works exactly like Bitcoin. The shielded layer — the part we'll spend most of this course on — adds cryptographic privacy while preserving all these properties.</blockquote>
    `,
  },
  {
    id: 'l-00-02', stage: '00', week: 1,
    title: 'Distributed Ledgers vs Traditional Databases',
    subtitle: 'Why the trade-offs exist and when each model wins',
    type: 'lesson', xp: 50, duration: 10,
    content: `
<h2>Traditional databases</h2>
<p>A traditional database — Postgres, MySQL, MongoDB — is controlled by an administrator. That admin can read, modify, or delete any record. This is great for performance and flexibility, but it creates a single point of trust (and failure).</p>
<p>In banking, you trust the bank not to zero out your balance. In a supply chain system, you trust the operator not to alter shipment records. In social media, you trust the platform not to shadow-ban you arbitrarily. Each of these is a <em>trust assumption</em>.</p>

<h2>Distributed ledgers</h2>
<p>A distributed ledger spreads record-keeping across many independent participants. No single party controls it. Updates require consensus — agreement from enough of the network — and are cryptographically linked to history so they can't be silently altered later.</p>
<p>The trade-offs are real:</p>
<table>
  <thead><tr><th>Property</th><th>Traditional DB</th><th>Blockchain</th></tr></thead>
  <tbody>
    <tr><td>Throughput</td><td>Thousands of TPS</td><td>Tens–hundreds of TPS</td></tr>
    <tr><td>Latency</td><td>Milliseconds</td><td>Seconds to minutes (finality)</td></tr>
    <tr><td>Trust required</td><td>Operator trust</td><td>Protocol + math</td></tr>
    <tr><td>Censorship</td><td>Possible</td><td>Resistant</td></tr>
    <tr><td>Privacy</td><td>Controlled by operator</td><td>Varies (Zcash: strong)</td></tr>
    <tr><td>Auditability</td><td>Possible if you have access</td><td>Public by default (transparent)</td></tr>
  </tbody>
</table>

<h2>When blockchains make sense</h2>
<p>Use a blockchain when:</p>
<ul>
  <li>Multiple parties who don't fully trust each other need to share a record</li>
  <li>You need censorship resistance — no party should be able to block valid transactions</li>
  <li>You need a credibly neutral settlement layer (currency, financial contracts)</li>
  <li>History must be immutable and publicly auditable</li>
</ul>
<p>Use a traditional database when:</p>
<ul>
  <li>One entity controls the data and performance matters more than neutrality</li>
  <li>You need to update or delete records regularly</li>
  <li>You're storing private data that shouldn't be on a public ledger</li>
</ul>

<blockquote>Most blockchain projects would be better served by a well-designed database. But for digital money and financial privacy — which is what Zcash is — the distributed, trustless model is exactly the right tool.</blockquote>
    `,
  },
  {
    id: 'l-00-03', stage: '00', week: 1,
    title: 'Cryptographic Hash Functions',
    subtitle: 'The mathematical foundation that makes blockchains tamper-proof',
    type: 'lesson', xp: 75, duration: 15,
    content: `
<h2>What is a hash function?</h2>
<p>A hash function takes any input — a word, a file, an entire block — and produces a fixed-length output called a <strong>digest</strong> or <strong>hash</strong>. For blockchain use, we need <em>cryptographic</em> hash functions with three critical properties:</p>
<ol>
  <li><strong>Deterministic</strong> — the same input always produces the same output</li>
  <li><strong>One-way (preimage resistant)</strong> — you can't reverse-engineer the input from the output</li>
  <li><strong>Collision resistant</strong> — it's computationally infeasible to find two different inputs with the same output</li>
  <li><strong>Avalanche effect</strong> — changing one bit of input completely changes the output</li>
</ol>

<h2>SHA-256 and BLAKE2b</h2>
<p>Bitcoin and Zcash's transparent layer use <strong>SHA-256</strong> (Secure Hash Algorithm 256-bit), producing a 32-byte output. SHA-256 is well-studied and considered secure against known attacks.</p>
<p>Zcash's shielded protocol uses <strong>BLAKE2b</strong>, a faster and more modern hash function. It's used in the Zcash Sapling and Orchard circuits for its efficiency inside zk-SNARK proofs.</p>
<p>Example (SHA-256):</p>
<pre><code>Input:  "Hello, Zcash!"
Output: 3b4c2f1a9d8e7f6b5a4c3d2e1f0g9h8i7j6k5l4m3n2o1p0...

Input:  "Hello, Zcash." (period instead of !)
Output: f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0...</code></pre>
<p>Notice how a single character change produces a completely different hash — the avalanche effect in action.</p>

<h2>How hashes secure the chain</h2>
<p>Each block contains the hash of the previous block's header. This creates the "chain" in blockchain:</p>
<pre><code>Block 100 header includes: hash(Block 99 header)
Block 101 header includes: hash(Block 100 header)
Block 102 header includes: hash(Block 101 header)</code></pre>
<p>If an attacker changes a transaction in Block 99, the block's hash changes. That breaks Block 100's header (which contains the old hash of Block 99). To fix it, they'd have to recompute Block 100's proof-of-work, then Block 101's, and so on — while the rest of the network is adding new blocks. The chain grows faster than one attacker can rewrite it.</p>

<h2>Merkle trees</h2>
<p>Instead of hashing all transactions individually, blockchains use a <strong>Merkle tree</strong> to organise them. Transactions are hashed in pairs, those hashes are hashed in pairs, and so on until you reach a single root hash — the <strong>Merkle root</strong> — that represents all transactions in the block.</p>
<p>This lets light clients verify that a specific transaction is in a block by downloading only a small proof (O(log n) hashes), not the entire block.</p>
    `,
  },
  {
    id: 'l-00-04', stage: '00', week: 1,
    title: 'Digital Signatures & Public Key Cryptography',
    subtitle: 'How you prove ownership without revealing your secret',
    type: 'lesson', xp: 75, duration: 18,
    content: `
<h2>The key pair</h2>
<p>Public key cryptography is based on a mathematical relationship between two keys:</p>
<ul>
  <li><strong>Private key</strong> — a random secret number, never shared</li>
  <li><strong>Public key</strong> — derived from the private key, safe to share</li>
</ul>
<p>The math is asymmetric: deriving the public key from the private key is easy (fast), but going the other direction is computationally infeasible (would take longer than the age of the universe with current hardware).</p>
<p>In Zcash, keys are derived using elliptic curve cryptography — specifically the <code>jubjub</code> curve for shielded addresses and the <code>secp256k1</code> curve (same as Bitcoin) for transparent addresses.</p>

<h2>Digital signatures</h2>
<p>When you send a transaction, you need to prove you own the funds without revealing your private key. You do this with a <strong>digital signature</strong>:</p>
<ol>
  <li>You hash the transaction data</li>
  <li>You sign that hash with your private key using an algorithm (like ECDSA or EdDSA)</li>
  <li>The signature is attached to the transaction and broadcast to the network</li>
  <li>Any node can verify: "did the owner of <em>this public key</em> sign <em>this transaction</em>?" — using only the public key, the signature, and the transaction data</li>
</ol>
<p>Crucially, <strong>the private key never leaves your wallet</strong>. Nodes verify signatures without ever seeing your secret.</p>

<h2>Addresses</h2>
<p>A blockchain address is derived from your public key through a series of hash operations plus encoding. On Zcash:</p>
<ul>
  <li><strong>Transparent address (t-addr)</strong> — derived from secp256k1 public key, starts with "t1" or "t3". Works like Bitcoin.</li>
  <li><strong>Sapling address (z-addr)</strong> — derived from a spending key on the jubjub curve, starts with "zs1"</li>
  <li><strong>Unified Address (UA)</strong> — a single address that encodes multiple receiver types; starts with "u1". More on this in Stage 01.</li>
</ul>

<h2>Spending keys in Zcash</h2>
<p>Zcash's shielded protocol uses a more complex key hierarchy than Bitcoin. Your spending key generates:</p>
<ul>
  <li><strong>Full Viewing Key (FVK)</strong> — can see all your incoming and outgoing shielded transactions without spending funds</li>
  <li><strong>Incoming Viewing Key (IVK)</strong> — can only see incoming transactions</li>
  <li><strong>Diversified addresses</strong> — unlimited unique addresses all resolving to the same wallet, preserving privacy</li>
</ul>
<p>This key hierarchy is one of Zcash's most powerful features for business and privacy use cases.</p>
    `,
  },
  {
    id: 'l-00-05', stage: '00', week: 1,
    title: 'Setting Up Your Dev Environment',
    subtitle: 'Get your machine ready to build on Zcash',
    type: 'lesson', xp: 50, duration: 12,
    content: `
<h2>What you'll need</h2>
<p>Zcash development spans Rust (for protocol-level work), TypeScript/JavaScript (for wallets and dApps), and Python (for scripting and data analysis). This lesson gets everything installed.</p>

<h2>1. Install Rust</h2>
<p>Most Zcash core tooling is written in Rust. Install via rustup:</p>
<pre><code>curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
rustup update stable</code></pre>
<p>Verify: <code>rustc --version</code> should print 1.74 or later.</p>

<h2>2. Install Node.js</h2>
<p>Use nvm (Node Version Manager) to install the latest LTS:</p>
<pre><code>curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts</code></pre>
<p>Verify: <code>node --version</code> and <code>npm --version</code>.</p>

<h2>3. Install the Zcash CLI tools</h2>
<p>For testnet interaction, install the Zcash daemon (zcashd) or Zebra, the Rust-based full node:</p>
<pre><code># Zebra (recommended — modern Rust implementation)
cargo install --git https://github.com/ZcashFoundation/zebra zebrad

# Or install zcashd from the official repo
# https://github.com/zcash/zcash/releases</code></pre>
<p>For testnet work in this course, you don't need to sync a full node. We'll use the Zcash testnet RPC via Zaino.</p>

<h2>4. Install TypeScript SDK</h2>
<pre><code>npm install @zcash/zcash-sdk
# or with pnpm
pnpm add @zcash/zcash-sdk</code></pre>

<h2>5. Code editor</h2>
<p>VS Code with these extensions:</p>
<ul>
  <li><strong>rust-analyzer</strong> — Rust language support</li>
  <li><strong>Even Better TOML</strong> — for Cargo.toml files</li>
  <li><strong>ESLint + Prettier</strong> — TypeScript formatting</li>
</ul>

<h2>6. Testnet ZEC</h2>
<p>You'll need testnet ZEC (TZEC) for labs. The Zcash testnet faucet is at:</p>
<p><a href="https://faucet.zec.rocks" target="_blank" rel="noopener">https://faucet.zec.rocks</a></p>
<p>Generate a testnet address in Stage 01 and come back to claim testnet funds.</p>

<blockquote>✅ Once you have Rust, Node.js, and a code editor set up, you're ready to build. The rest of the tools are installed per-lab.</blockquote>
    `,
  },
  // Week 2
  {
    id: 'l-00-06', stage: '00', week: 2,
    title: 'How Blocks Are Mined',
    subtitle: 'Proof of Work and the economics of block production',
    type: 'lesson', xp: 50, duration: 14,
    content: `
<h2>The mining loop</h2>
<p>Mining is the process of finding a block header whose hash meets a difficulty target. The miner:</p>
<ol>
  <li>Assembles a block of pending transactions from the mempool</li>
  <li>Builds a block header containing the previous hash, Merkle root, timestamp, and a <strong>nonce</strong></li>
  <li>Hashes the header. If the result is below the difficulty target, broadcast the block.</li>
  <li>If not, increment the nonce and hash again. Repeat billions of times per second.</li>
</ol>
<p>This is computationally expensive by design — it's what makes rewriting history hard. On Zcash, the proof-of-work algorithm is <strong>Equihash</strong>, a memory-hard algorithm that ASICs can solve but can't optimise as dramatically as SHA-256 ASIC miners did to Bitcoin.</p>

<h2>Difficulty adjustment</h2>
<p>Zcash targets one block every 75 seconds. Every 17.5 days (8,064 blocks), the protocol adjusts the difficulty based on how fast blocks actually arrived. If miners added hashrate, difficulty goes up so blocks don't arrive too fast. If miners left, difficulty drops.</p>

<h2>Block rewards and the Zcash halving</h2>
<p>When a miner wins the block, they earn a <strong>block reward</strong> — newly minted ZEC plus transaction fees. Zcash started at 12.5 ZEC per block (half of Bitcoin's original 50 BTC, since Zcash launched later). Like Bitcoin, the reward halves approximately every 4 years.</p>
<p>Unique to Zcash: a percentage of the block reward (the "dev fund") goes to the Zcash development organizations — ECC, ZF, and ZCG — to fund ongoing protocol development. The current allocation and its future are governed by the ZIP process.</p>

<h2>Why Equihash?</h2>
<p>Bitcoin's SHA-256 can be efficiently parallelised on custom ASICs, concentrating mining power. Equihash requires large amounts of memory per solve attempt, making ASICs less dominant and GPU mining more competitive. Zcash's founders believed this led to a more decentralised mining ecosystem — though ASIC manufacturers eventually built Equihash ASICs too.</p>
    `,
  },
  {
    id: 'l-00-07', stage: '00', week: 2,
    title: 'Proof of Work vs Proof of Stake',
    subtitle: 'The two dominant consensus mechanisms compared',
    type: 'lesson', xp: 75, duration: 16,
    content: `
<h2>Proof of Work (PoW)</h2>
<p>In PoW, the right to produce a block is earned by solving a computational puzzle. The "work" is real energy expenditure — you can't fake it. This gives PoW an important property: the ledger's security is backed by physical-world costs (electricity, hardware). To rewrite history, an attacker must spend at least as much real-world energy as all honest miners combined.</p>
<p><strong>Used by:</strong> Bitcoin, Zcash, Litecoin, Monero</p>

<h2>Proof of Stake (PoS)</h2>
<p>In PoS, validators lock up (stake) cryptocurrency as collateral to earn the right to produce blocks. The probability of being chosen to produce the next block is proportional to your stake. Misbehaviour (like signing conflicting blocks) results in having your stake "slashed" — destroyed.</p>
<p>PoS uses far less energy than PoW — there's no computational puzzle. But it introduces different trade-offs: economic attacks, long-range attacks (rewriting old history by acquiring old keys), and "nothing at stake" problems.</p>
<p><strong>Used by:</strong> Ethereum (post-Merge), Solana, Cosmos, Cardano</p>

<h2>Trade-off table</h2>
<table>
  <thead><tr><th>Property</th><th>Proof of Work</th><th>Proof of Stake</th></tr></thead>
  <tbody>
    <tr><td>Energy use</td><td>High</td><td>Very low</td></tr>
    <tr><td>Security model</td><td>Physical energy cost</td><td>Economic stake at risk</td></tr>
    <tr><td>51% attack cost</td><td>Rent/buy mining hardware</td><td>Buy 33–51% of staked supply</td></tr>
    <tr><td>Decentralisation</td><td>ASIC mining can centralise</td><td>Wealth concentration risk</td></tr>
    <tr><td>Finality</td><td>Probabilistic (deeper = safer)</td><td>Often deterministic</td></tr>
  </tbody>
</table>

<h2>Zcash's position</h2>
<p>Zcash remains PoW. The Zcash Foundation and ECC have discussed PoS transitions, but as of the current protocol, Equihash PoW secures the chain. Zcash's unique contribution to consensus security is the shielded transaction system — the consensus layer and the privacy layer are architecturally separate.</p>
    `,
  },
]

// ── Stage 01: Zcash Foundations ───────────────────────────────────────────────
const S01_LESSONS: Lesson[] = [
  {
    id: 'l-01-01', stage: '01', week: 3,
    title: 'Why Privacy Matters in Crypto',
    subtitle: 'The surveillance problem with transparent blockchains',
    type: 'lesson', xp: 50, duration: 12,
    content: `
<h2>Transparent blockchains are public ledgers</h2>
<p>Every Bitcoin or Ethereum transaction is permanently recorded on a public ledger anyone can read. Your address, the amount you sent, and the recipient's address are all visible — forever, to anyone with an internet connection. This is great for auditability but catastrophic for privacy.</p>
<p>Consider what you'd think about a payment system where your employer can see every purchase you make, where merchants can track your entire transaction history, or where criminals can watch the balances of high-value addresses and plan targeted theft. All of this is possible with transparent blockchains today.</p>

<h2>The pseudonymity myth</h2>
<p>Bitcoin is often described as "anonymous" or "pseudonymous." In practice, pseudonymity is weak:</p>
<ul>
  <li><strong>Exchange KYC</strong> — most on-ramps require identity verification, linking your real identity to your address</li>
  <li><strong>Blockchain analytics</strong> — companies like Chainalysis can trace funds across addresses using heuristics (common-input ownership, change detection, etc.)</li>
  <li><strong>Address reuse</strong> — many wallets reuse addresses, making it trivial to track a user's full history</li>
  <li><strong>Metadata</strong> — transaction timing, amounts, and network IP addresses leak information</li>
</ul>
<p>Surveillance companies sell these analytics to governments and financial institutions. In practice, Bitcoin is far more traceable than cash.</p>

<h2>Privacy as a fundamental right</h2>
<p>Privacy isn't about hiding illegal activity — it's about basic human dignity and autonomy. Financial privacy means:</p>
<ul>
  <li>Your employer can't see how you spend your salary</li>
  <li>Merchants can't profile your purchasing habits</li>
  <li>Governments can't weaponise financial records against political opponents</li>
  <li>Criminals can't target you by watching your blockchain balance</li>
</ul>
<p>Cash provides these properties naturally. Digital money should too — which is why Zcash exists.</p>

<h2>Zcash's approach</h2>
<p>Zcash uses <strong>zero-knowledge proofs</strong> to enable transactions where the sender, recipient, and amount are all hidden — while still being mathematically verifiable by the network. You can prove a valid transaction occurred without revealing any of its details. This is the core cryptographic innovation we'll explore in the next lessons.</p>
    `,
  },
  {
    id: 'l-01-02', stage: '01', week: 3,
    title: 'Zcash History & the Ceremony',
    subtitle: 'From Zerocash to the trusted setup that launched a privacy coin',
    type: 'lesson', xp: 50, duration: 15,
    content: `
<h2>Origins: Zerocoin and Zerocash</h2>
<p>The cryptographic foundations of Zcash began with an academic paper — "Zerocoin: Anonymous Distributed E-Cash from Bitcoin" (2013) by Miers, Garman, Green, and Rubin. Zerocoin could make Bitcoin transactions anonymous by adding a cryptographic mixer directly into the protocol.</p>
<p>The team then developed a more efficient scheme called "Zerocash" (2014), which hid not just the sender's identity but also transaction amounts. The math was dramatically more powerful but required a new type of cryptographic setup.</p>

<h2>The Electric Coin Company</h2>
<p>In 2016, Zooko Wilcox-O'Hearn founded the Electric Coin Company (ECC) to build a production cryptocurrency based on the Zerocash protocol. They hired a team of world-class cryptographers including Sean Bowe, Ariel Gabizon, and Matthew Green — some of the researchers who wrote the Zerocash paper.</p>
<p>Zcash launched on October 28, 2016 — the same day as the Bitcoin SegWit activation was being debated — with block 0 (the genesis block).</p>

<h2>The Powers of Tau ceremony</h2>
<p>zk-SNARKs (the cryptographic primitive Zcash uses) require a one-time setup called a <strong>trusted setup</strong> or <strong>ceremony</strong>. During this setup, random numbers are generated and then combined in a way that produces the proving and verifying keys. The original randomness — called "toxic waste" — must be destroyed.</p>
<p>If anyone kept their toxic waste, they could forge proofs and create ZEC out of thin air, invisibly, without detection. The whole point of the ceremony was to make it impossible for any single person to have the full toxic waste.</p>
<p>The Sprout ceremony involved 6 participants in a multi-party computation. Each generated their random piece, contributed it, then destroyed it. All 6 would have to collude (and all have kept their toxic waste) to break the system.</p>
<p>For Sapling (launched 2018), a much larger ceremony called <strong>Powers of Tau</strong> involved nearly 90 participants from around the world — cryptographers, Zcash community members, journalists, and others — making collusion essentially impossible.</p>

<h2>Zcash Foundation</h2>
<p>In 2017, the Zcash Foundation was established as an independent organisation to steward the Zcash protocol separately from ECC. This created a healthier separation between the company building commercial Zcash products and the non-profit maintaining the protocol itself.</p>

<h2>Network upgrades</h2>
<p>Zcash upgrades are called <strong>Network Upgrades (NUs)</strong> and are implemented via the ZIP (Zcash Improvement Proposal) process:</p>
<ul>
  <li><strong>Sprout</strong> (2016) — original launch</li>
  <li><strong>Sapling</strong> (2018) — dramatically faster shielded transactions, new key structure</li>
  <li><strong>Heartwood, Canopy</strong> (2020) — dev fund changes, light client improvements</li>
  <li><strong>NU5 / Orchard</strong> (2021) — new shielded pool using Halo2 (no trusted setup!)</li>
  <li><strong>NU6</strong> (2024) — dev fund changes</li>
  <li><strong>Ironwood</strong> (NU7, 2025) — major scalability and privacy improvements</li>
</ul>
    `,
  },
  {
    id: 'l-01-03', stage: '01', week: 3,
    title: 'Transparent vs Shielded Pools',
    subtitle: 'How Zcash\'s two transaction types coexist on one chain',
    type: 'lesson', xp: 75, duration: 18,
    content: `
<h2>Two pools, one chain</h2>
<p>Zcash's design is unique: the same blockchain supports two fundamentally different transaction types. Understanding the pools is essential before building anything on Zcash.</p>

<h2>The transparent pool (t-pool)</h2>
<p>Transparent transactions in Zcash work identically to Bitcoin. Sender address, recipient address, and amount are all visible on-chain. Transparent addresses start with "t1" (for standard) or "t3" (for multisig).</p>
<p>Why does Zcash even have a transparent pool? Primarily for exchange compatibility — most crypto exchanges, when Zcash launched, only supported Bitcoin-style transparent transactions. Having a compatible transparent layer let Zcash get listed quickly while the ecosystem built out shielded support.</p>
<p>Transparent transactions are less private than cash. They should be avoided for personal transactions.</p>

<h2>The shielded pools (z-pool)</h2>
<p>Shielded transactions hide the sender, recipient, and amount using zero-knowledge proofs. There are currently two active shielded pools:</p>

<h3>Sapling pool</h3>
<p>Introduced in 2018, Sapling dramatically improved shielded transaction performance from ~40 seconds to under a second for proof generation. Sapling uses the <strong>Groth16</strong> proving system on the <strong>BLS12-381</strong> elliptic curve. Sapling addresses start with "zs1".</p>
<p>Sapling required a trusted setup (the Powers of Tau ceremony).</p>

<h3>Orchard pool</h3>
<p>Launched with NU5 in 2021, the Orchard pool uses the <strong>Halo2</strong> proving system — the first production zk-SNARK system that requires <em>no trusted setup</em>. Orchard uses the <strong>Pallas</strong> elliptic curve. Orchard is accessed via Unified Addresses.</p>
<p>The Orchard pool is the future of Zcash — new features and optimisations focus here.</p>

<h2>Shielding and deshielding</h2>
<p>ZEC can move between pools:</p>
<ul>
  <li><strong>Shielding</strong> — sending from transparent to shielded (t→z). The ZEC "disappears" into the shielded pool.</li>
  <li><strong>Deshielding</strong> — sending from shielded to transparent (z→t). The ZEC "appears" from the shielded pool.</li>
  <li><strong>Shielded-to-shielded</strong> — fully private (z→z). Neither sender nor recipient is known.</li>
</ul>
<p>Note: cross-pool moves (t→z or z→t) reveal the amount being moved (but not the shielded address). Fully shielded z→z transactions reveal nothing.</p>

<h2>The shielded pool is a privacy set</h2>
<p>Privacy is a set property — the larger the shielded pool, the more private each shielded transaction. If only 100 people use the shielded pool, it's easier to guess who sent what. If millions of transactions are shielded, each one is indistinguishable from the others.</p>
<p>One of the ongoing goals of the Zcash community is increasing shielded adoption — more shielded transactions = more privacy for everyone.</p>
    `,
  },
  {
    id: 'l-01-04', stage: '01', week: 3,
    title: 'zk-SNARKs in Plain English',
    subtitle: 'Zero-knowledge proofs without the math degree',
    type: 'lesson', xp: 100, duration: 20,
    content: `
<h2>The core idea</h2>
<p>A zero-knowledge proof lets you prove you know something without revealing what you know. The name comes from the proof leaking <em>zero knowledge</em> about the secret beyond the bare fact of its existence.</p>

<p>The classic example: you want to prove to a colour-blind friend that two balls are different colours, without them learning which is which. You give them the balls. They shuffle them (or not) behind their back. You tell them if they swapped. You can repeat this many times — each round, a 50% chance of catching you lying. After 30 rounds with no errors, the probability you're cheating is 1 in a billion. You proved the balls are different without revealing anything about the colours.</p>

<h2>SNARKs: Succinct, Non-interactive</h2>
<p>Interactive proofs require back-and-forth between prover and verifier. For a blockchain, every node needs to verify millions of transactions — interaction is impossible. <strong>zk-SNARKs</strong> (Zero-Knowledge Succinct Non-interactive Arguments of Knowledge) solve this:</p>
<ul>
  <li><strong>Zero-knowledge</strong> — the proof reveals nothing about the secret inputs</li>
  <li><strong>Succinct</strong> — the proof is small (a few hundred bytes) and fast to verify</li>
  <li><strong>Non-interactive</strong> — one message from prover to verifier, no back-and-forth</li>
  <li><strong>Argument of Knowledge</strong> — the prover actually knows the secret (not just guessing)</li>
</ul>

<h2>How Zcash uses zk-SNARKs</h2>
<p>When you make a shielded transaction, your wallet:</p>
<ol>
  <li>Constructs the transaction: consume these notes (inputs), create those notes (outputs), balance must be zero</li>
  <li>Generates a zk-SNARK proof that: "I know a spending key that authorises these inputs, the amounts balance, and no ZEC was created from thin air"</li>
  <li>Broadcasts the transaction with the proof — but with encrypted inputs and outputs</li>
  <li>Every full node verifies the proof in milliseconds — confirming validity without seeing any private data</li>
</ol>
<p>The magic: the network validates the transaction without knowing who sent it, who received it, or how much was transferred.</p>

<h2>Groth16 vs Halo2</h2>
<p><strong>Groth16</strong> (used in Sapling) is extremely efficient — tiny proofs, fast verification — but requires a trusted setup. That's where the Powers of Tau ceremony came in.</p>
<p><strong>Halo2</strong> (used in Orchard/Ironwood) is a newer proving system that achieves similar efficiency without a trusted setup. It uses a technique called "recursive proof composition" that ECC's team developed. This is a major cryptographic breakthrough — it makes Zcash's security assumptions simpler and more robust.</p>

<h2>Notes (not coins)</h2>
<p>In the shielded pool, ZEC is held as encrypted <strong>notes</strong>, not UTXOs. Each note encodes a value and a commitment. When you spend a note, you reveal a <strong>nullifier</strong> — a value derived from the note that lets the network know it's been spent, without revealing which note it was. The network maintains a list of used nullifiers to prevent double-spending.</p>
    `,
  },
  {
    id: 'l-01-05', stage: '01', week: 3,
    title: 'Unified Addresses Explained',
    subtitle: 'One address to receive from transparent and shielded senders',
    type: 'lesson', xp: 75, duration: 14,
    content: `
<h2>The problem Unified Addresses solve</h2>
<p>Before Unified Addresses (UAs), Zcash wallets published separate addresses for each pool: a t-address for transparent, a Sapling address for shielded. Users had to know which type to use, leading to widespread confusion and many shielded-capable wallets receiving funds transparently.</p>
<p>Unified Addresses, introduced with ZIP-316 in NU5, solve this with a single address that encodes multiple <strong>receivers</strong>.</p>

<h2>Structure of a Unified Address</h2>
<p>A UA is a Bech32m-encoded structure that can contain multiple receiver encodings in one string. A typical UA includes:</p>
<ul>
  <li>An <strong>Orchard receiver</strong> — for fully shielded transactions via the Orchard pool</li>
  <li>A <strong>Sapling receiver</strong> — for compatibility with wallets that don't yet support Orchard</li>
  <li>A <strong>transparent receiver</strong> — for exchanges and wallets that only support t-addresses</li>
</ul>
<p>When a sender's wallet generates a transaction to a UA, it picks the best receiver it supports — preferring Orchard over Sapling over transparent. This means users automatically get the highest privacy their wallet supports.</p>

<h2>Diversified addresses</h2>
<p>Unified Addresses support <strong>diversification</strong>: a wallet can generate an unlimited number of unique UA addresses from the same spending key, all receiving funds to the same account. This is powerful for privacy:</p>
<ul>
  <li>Give each counterparty a unique address — they can't correlate your transactions</li>
  <li>E-commerce platforms can generate a new address per order without managing separate keys</li>
  <li>All diversified addresses are controlled by one spending key</li>
</ul>

<h2>Reading a UA</h2>
<p>Unified Addresses start with <code>u1</code> on mainnet and are longer than previous Zcash addresses — they encode multiple receivers. Example (truncated):</p>
<pre><code>u1nkv7hz6zqqmcz8qf9...5w3f9hjz0f8kx2z (Orchard + Sapling + transparent)</code></pre>

<h2>Unified Full Viewing Keys (UFVKs)</h2>
<p>The same unification concept extends to viewing keys. A <strong>Unified Full Viewing Key</strong> lets a third party (like an auditor or business) view all incoming and outgoing transactions across all pools for a given account, without spending access. This enables compliant, transparent auditing without compromising the privacy model.</p>
    `,
  },
]

// ── Flat lookup map ───────────────────────────────────────────────────────────
export const ALL_LESSONS: Lesson[] = [...S00_LESSONS, ...S01_LESSONS]

// Link next/prev
ALL_LESSONS.forEach((lesson, i) => {
  if (i > 0) lesson.prev = ALL_LESSONS[i - 1].id
  if (i < ALL_LESSONS.length - 1) lesson.next = ALL_LESSONS[i + 1].id
})

export const LESSON_MAP = new Map<string, Lesson>(
  ALL_LESSONS.map(l => [l.id, l])
)

// Ordered list of IDs per stage
export const STAGE_LESSON_IDS: Record<string, string[]> = {
  '00': S00_LESSONS.map(l => l.id),
  '01': S01_LESSONS.map(l => l.id),
}
