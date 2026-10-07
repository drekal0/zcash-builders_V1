// AUTO-GENERATED from scratchpad lesson fragments. Do not edit by hand.
// Each entry: lesson id -> { title, subtitle, content (HTML) }.
import type { LessonContent } from './types'

export const M_s03_w7a: Record<string, LessonContent> = {
  "l-03-01": {
    title: "How Zcash Is Developed (Open Source)",
    subtitle: "Map the repositories to the organisations that maintain them, and trace how a consensus change travels from an idea to activation.",
    content: `<p>Until now you have treated Zcash as a platform to build on. This week you turn around and look at Zcash itself: the code, the people who write it, and the process a change goes through before it reaches the network. The first thing to understand is that there is no single company called "Zcash". The work is spread across several independent organisations that each own a different part, and nobody controls the whole.</p>
<p>This lesson is the map. Learn which repository belongs to which team, where decisions are discussed, and how a protocol change becomes real. You will reuse this map every time you look for an issue to work on or a maintainer to talk to.</p>

<h2>Who builds what</h2>
<p>For most of Zcash's history two organisations led development: the Electric Coin Company (ECC), which created Zcash in 2016, and the Zcash Foundation. In January 2026 the entire ECC team resigned after a governance dispute with Bootstrap, the nonprofit that owned ECC, and the ecosystem reorganised into several independent teams while the network kept running. You will see ECC named only as history now; the former team went on to form <strong>ZODL</strong> (the Zcash Open Development Lab).</p>
<p>Here is who maintains the code you have been using, as of October 2026:</p>
<table>
  <thead><tr><th>Repository</th><th>What it is</th><th>Maintained by</th></tr></thead>
  <tbody>
    <tr><td><code>ZcashFoundation/zebra</code></td><td>The Rust consensus full node (<code>zebrad</code>)</td><td>Zcash Foundation</td></tr>
    <tr><td><code>ZcashFoundation/frost</code></td><td>Threshold Schnorr signature crates</td><td>Zcash Foundation</td></tr>
    <tr><td><code>ZcashFoundation/z3</code></td><td>Docker Compose stack (Zebra + Zallet + optional Zaino)</td><td>Zcash Foundation</td></tr>
    <tr><td><code>zcash/librustzcash</code></td><td>Core Rust libraries (wallet backend, keys, addresses)</td><td>ZODL, under the <code>zcash</code> GitHub org</td></tr>
    <tr><td><code>zcash/wallet</code> (Zallet)</td><td>The full-node wallet replacing the old zcashd wallet</td><td>ZODL, under the <code>zcash</code> org</td></tr>
    <tr><td><code>zcash/orchard</code>, <code>zcash/zcash-devtool</code></td><td>Orchard/Ironwood protocol crate; a developer CLI</td><td><code>zcash</code> org</td></tr>
    <tr><td><code>zingolabs/zaino</code>, <code>zingolabs/zingolib</code></td><td>The Rust indexer; a light-wallet library</td><td>Zingo Labs</td></tr>
    <tr><td><code>zcash/zips</code></td><td>Every Zcash Improvement Proposal and the protocol spec</td><td>The ZIP Editors (see below)</td></tr>
  </tbody>
</table>
<p>Research and scaling sit with other groups: <strong>Shielded Labs</strong> (a Swiss nonprofit working on Crosslink and funding the audit that found the 2026 Orchard bug), and <strong>Project Tachyon</strong> with the <strong>Valar Group</strong> (scaling and post-quantum cryptography; Valar also builds the <code>Zakura</code> node, a Zebra fork). <strong>ZecHub</strong> runs community education, and <strong>Zcash Community Grants (ZCG)</strong> funds independent teams. All keep open repositories you can read.</p>

<h2>Where the conversation happens</h2>
<p>Code lives on GitHub, but the thinking happens elsewhere. Three places matter:</p>
<ul>
  <li>The <a href="https://forum.zcashcommunity.com/">Zcash Community Forum</a> — the main place to float an idea, debate a proposal and announce releases. ZIP 0 tells you to start a new idea here.</li>
  <li>The Zcash R&amp;D Discord — faster, developer-focused discussion, including a <code>#zips</code> channel.</li>
  <li>The <strong>Arborist calls</strong> — recurring open protocol-development calls where upcoming network upgrades are worked through in public.</li>
</ul>
<p>None of this is behind a login wall. Reading a forum thread or an Arborist recap is the cheapest way to learn why something was built the way it was.</p>

<h2>The ZIPs repository and its Editors</h2>
<p>A <strong>Zcash Improvement Proposal (ZIP)</strong> is a design document: it specifies a feature or a process and records the reasoning behind it. The <code>zcash/zips</code> repository holds all of them plus the protocol specification. Changes to the repository are gatekept by the <strong>ZIP Editors</strong>, who are responsible for process rather than deciding the outcome. As of October 2026 ZIP 0 lists them as Jack Grigg, Daira-Emma Hopwood and Kris Nuttycombe (individual capacity); Arya and Marek (Zcash Foundation); Mark Henderson and Sam H. Smith (Shielded Labs); Sean Bowe and Tal Derei (Project Tachyon); and Dev Ojha (Valar Group). They can all be reached at <code>zips@z.cash</code>. You will write a ZIP of your own in lesson 5.</p>

<h2>From idea to activation</h2>
<p>A consensus change — one that every node must agree on — travels a long road. The 2026 upgrades are a good worked example. Each one is deployed by its own ZIP:</p>
<ol>
  <li><strong>Idea and discussion.</strong> Someone raises a problem on the forum or an Arborist call. For NU7, a coinholder vote and a forum thread shaped what went in.</li>
  <li><strong>A ZIP is drafted</strong> in the zips repo as a pull request, named <code>draft-&lt;author&gt;-&lt;topic&gt;</code> until an Editor assigns it a number. NU7's deployment is <a href="https://zips.z.cash/zip-0259">ZIP 259</a>.</li>
  <li><strong>Implementation.</strong> The change is written in at least one consensus node — today that means Zebra. NU7 shipped first as <code>zebrad</code> 7.0.0-rc.0.</li>
  <li><strong>Testnet activation.</strong> The upgrade activates on Testnet first so wallets and services can test. NU7 activated on Testnet at height 4,465,026 in October 2026.</li>
  <li><strong>Mainnet activation</strong> at a fixed block height, once there is consensus. NU6.3 "Ironwood" activated on Mainnet at height 3,428,143 on 28 July 2026. NU7's Mainnet height was still to be decided as of October 2026.</li>
</ol>
<blockquote>Not every change needs a ZIP. A small patch to one program goes straight to that project's issue tracker. ZIPs are for things that must be standardised across implementations, or that change a shared process.</blockquote>

<h2>Try it</h2>
<p>Open the <code>zcash/zips</code> repository on GitHub and read the README. Find the line naming the most recent settled Mainnet network upgrade and confirm it matches what you learned this week. Then open the Zcash Community Forum, find the category where ZIPs and upgrades are discussed, and read one thread about NU7. Write two sentences: which organisation raised it, and what stage the change is at now.</p>

<h2>Key takeaways</h2>
<ul>
  <li>Zcash is built by several independent organisations; no single one controls it. ECC is history — its former team is now ZODL.</li>
  <li>Zebra, FROST and Z3 are Zcash Foundation; librustzcash, Zallet, orchard and zcash-devtool are under the <code>zcash</code> org; Zaino and zingolib are Zingo Labs.</li>
  <li>Ideas are discussed on the forum, the Zcash R&amp;D Discord and Arborist calls before any code is written.</li>
  <li>A consensus change becomes a ZIP, is implemented in a node, activates on Testnet, then on Mainnet at a fixed height.</li>
  <li>The ZIP Editors steward the process; they do not decide whether a proposal wins.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/zip-0000">ZIP 0: ZIP Process</a> (Editors, workflow, numbering)</li>
  <li><a href="https://github.com/zcash/zips">zcash/zips repository README</a></li>
  <li><a href="https://zechub.wiki/start-here/how-zcash-is-organized">ZecHub: How Zcash Is Organized</a></li>
  <li><a href="https://github.com/ZcashFoundation/zebra">ZcashFoundation/zebra</a> and <a href="https://github.com/zcash/wallet">zcash/wallet (Zallet)</a></li>
  <li><a href="https://forum.zcashcommunity.com/">Zcash Community Forum</a></li>
</ul>`,
  },
  "l-03-02": {
    title: "Reading the Zebra Codebase",
    subtitle: "Find your way around Zebra's workspace crates and trace a block from the network, through verification, into the chain state.",
    content: `<p>Zebra is the Rust consensus full node maintained by the Zcash Foundation. It is a large codebase, but a well-organised one, and you do not need to understand all of it to contribute. You need to know which part owns which job, so that when you have a question or a bug you can open the right file first. This lesson is a guided tour with real paths you can open in your own clone.</p>
<p>Clone it with <code>git clone https://github.com/ZcashFoundation/zebra</code>. Everything below is relative to that checkout. Keep <code>book/src/dev/overview.md</code> open alongside the code — it is the design document the maintainers wrote for exactly this purpose.</p>

<h2>A workspace of small crates</h2>
<p>The design overview states Zebra's guiding choice plainly: unlike the old <code>zcashd</code>, which began as a Bitcoin Core fork with a monolithic architecture, Zebra has a "modular, library-first design, with the intent that each component can be independently reused outside of the <code>zebrad</code> full node." That means it is a Cargo <em>workspace</em>: one repository holding many crates. The list is in the top-level <code>Cargo.toml</code> under <code>[workspace] members</code>. The ones you will care about first:</p>
<table>
  <thead><tr><th>Crate</th><th>Owns</th></tr></thead>
  <tbody>
    <tr><td><code>zebra-chain</code></td><td>Core data structures — <code>Block</code>, <code>Transaction</code>, <code>Address</code> — and the consensus-critical serialization that turns bytes into them. No internal dependencies.</td></tr>
    <tr><td><code>zebra-network</code></td><td>The peer-to-peer network stack: one state machine per peer, translating the Bitcoin/Zcash wire protocol into an internal request/response protocol.</td></tr>
    <tr><td><code>zebra-consensus</code></td><td><em>Semantic</em> validation — the rules checkable without the chain state: signatures, proofs, scripts.</td></tr>
    <tr><td><code>zebra-state</code></td><td>Storing, updating and querying the chain state, and <em>contextual</em> validation: is this block a valid extension of the chain the node already has?</td></tr>
    <tr><td><code>zebra-rpc</code></td><td>The JSON-RPC interface other software calls.</td></tr>
    <tr><td><code>zebrad</code></td><td>The node binary that wires all the components together and runs the sync process.</td></tr>
  </tbody>
</table>
<p>There are more crates — <code>zebra-script</code> (script validation), <code>zebra-node-services</code>, the <code>tower-batch-control</code> and <code>tower-fallback</code> helpers — but the six above carry the story.</p>

<h2>Everything is a service</h2>
<p>Before you read any file, understand the one pattern that runs through all of Zebra. The overview describes the components as "microservices in one process": they do not call each other as plain functions. Each stateful component is a <code>tower::Service</code> — an asynchronous object that takes a <code>Request</code> enum and returns a <code>Response</code> enum, with built-in support for backpressure (a service can say "I am busy, wait"). You will meet Tokio and the <code>tower::Service</code> pattern again in the Rust lesson this week; for now, just expect to see <code>Request</code> and <code>Response</code> enums at every boundary instead of a tangle of direct calls.</p>
<p>The overview even includes the dependency graph between these services. The syncer drives a block-verifier router; verifiers depend on the state; the mempool and RPC server depend on the state and the verifiers. Read it once and the file layout stops being arbitrary.</p>

<h2>How a block flows through Zebra</h2>
<p>Here is the journey of one block, and the crate that owns each step. This is the mental model to hold while reading:</p>
<ol>
  <li><strong>Arrival.</strong> A peer announces a block. <code>zebra-network</code> manages that connection and hands the raw message inward, having turned the external protocol into the internal request/response one.</li>
  <li><strong>Parsing.</strong> The bytes are deserialized into a <code>Block</code> using the <code>ZcashDeserialize</code> trait defined in <code>zebra-chain</code>. These types are built so that "invalid states are unrepresentable" — you cannot, for example, construct a Sprout transaction carrying Sapling proofs.</li>
  <li><strong>Semantic validation.</strong> <code>zebra-consensus</code> checks every rule that needs only the block itself: proofs, signatures, scripts. It batches contemporaneous verifications for speed via <code>tower-batch-control</code>.</li>
  <li><strong>Contextual validation and commitment.</strong> <code>zebra-state</code> checks the rules that depend on history — that inputs are unspent, that nullifiers have not been seen — then stores the block and updates the chain state.</li>
  <li><strong>Serving it back out.</strong> Once in the state, the block is visible to <code>zebra-rpc</code> so wallets, explorers and indexers can read it.</li>
</ol>
<p>The split between <em>semantic</em> (context-free) and <em>contextual</em> validation is the single most important idea in the codebase. It is what lets Zebra verify many blocks in parallel. The verification-stages section of the parallel-verification RFC (<code>book/src/dev/rfcs/0002-parallel-verification.md</code>) is worth reading in full once you are comfortable.</p>

<h2>Where to find the things you will look for</h2>
<p>Two questions come up constantly. First, <strong>where are the RPC methods?</strong> They are declared as a trait in <code>zebra-rpc/src/methods.rs</code>. Open it and you will find <code>pub trait Rpc</code>, with each method tagged by the name clients use:</p>
<pre><code>#[method(name = "getblockchaininfo")]
async fn get_blockchain_info(&amp;self) -&gt; Result&lt;GetBlockchainInfoResponse&gt;;
</code></pre>
<p>Search that file for a method name — <code>getblock</code>, <code>sendrawtransaction</code>, <code>getinfo</code> — to find its signature, and follow the implementation from there. This is the first file to open when a wallet or explorer behaves oddly against your node.</p>
<p>Second, <strong>where are the network upgrades and their activation heights?</strong> The <code>NetworkUpgrade</code> enum lives in <code>zebra-chain/src/parameters/network_upgrade.rs</code>, and the Mainnet activation heights are hard constants in <code>zebra-chain/src/parameters/constants.rs</code>. You can point at the exact line that sets Ironwood's height:</p>
<pre><code>/// The block height at which \`NU6.3\` activates on Mainnet.
pub const NU6_3: Height = Height(3_428_143);
</code></pre>
<p>The same block lists every upgrade you studied this course, from <code>OVERWINTER = 347_500</code> to <code>NU6_3 = 3_428_143</code>. Seeing the real constant removes any doubt about where a magic number in the protocol actually lives.</p>

<h2>Reading strategy</h2>
<p>You will not read Zebra top to bottom. Use this order instead:</p>
<ul>
  <li>Start from <code>book/src/dev/overview.md</code> for the map, then the crate's own top-level doc comment (the <code>//!</code> block at the top of each <code>lib.rs</code>).</li>
  <li>Follow a single request type end to end rather than browsing a whole crate. Pick one RPC method and trace it from <code>zebra-rpc</code> into the state service.</li>
  <li>Use the generated API docs: run <code>cargo doc --open</code>, or read them at <code>docs.rs</code> for each crate (for example <code>docs.rs/zebra-chain</code>).</li>
  <li>Let the compiler guide you. Change something small, run <code>cargo check</code>, and read what breaks — Rust's type errors are a map of how the pieces connect.</li>
</ul>

<h2>Try it</h2>
<p>In your Zebra clone, do three things. (1) Open <code>Cargo.toml</code> and list the workspace members. (2) Open <code>zebra-rpc/src/methods.rs</code>, find the <code>getblockchaininfo</code> method, and read its return type. (3) Open <code>zebra-chain/src/parameters/constants.rs</code> and confirm the NU6.3 activation height matches 3,428,143 — the height you saw in the upgrade timeline this course. Write down, in your own words, which crate you would edit to add a new RPC method and which to change a consensus rule.</p>

<h2>Key takeaways</h2>
<ul>
  <li>Zebra is a Cargo workspace of small crates; the members are listed in the top-level <code>Cargo.toml</code>.</li>
  <li><code>zebra-chain</code> defines data structures, <code>zebra-network</code> the P2P stack, <code>zebra-consensus</code> context-free validation, <code>zebra-state</code> contextual validation and storage, <code>zebra-rpc</code> the RPC API, and <code>zebrad</code> wires it together.</li>
  <li>Components talk as <code>tower::Service</code>s via <code>Request</code>/<code>Response</code> enums, not direct calls — expect that pattern everywhere.</li>
  <li>A block flows network → parse → semantic validation → contextual validation → state → RPC.</li>
  <li>RPC methods live in <code>zebra-rpc/src/methods.rs</code>; activation heights in <code>zebra-chain/src/parameters/constants.rs</code>.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zebra.zfnd.org/dev/overview.html">Zebra Design Overview</a> (<code>book/src/dev/overview.md</code>)</li>
  <li><a href="https://zebra.zfnd.org/dev/rfcs/0002-parallel-verification.html">Zebra RFC 0002: Parallel Verification</a> (semantic vs contextual)</li>
  <li><a href="https://docs.rs/zebra-chain">docs.rs/zebra-chain</a> and <a href="https://docs.rs/zebra-rpc">docs.rs/zebra-rpc</a></li>
  <li><a href="https://github.com/ZcashFoundation/zebra">ZcashFoundation/zebra on GitHub</a></li>
</ul>`,
  },
  "l-03-03": {
    title: "Running a Zebra Node",
    subtitle: "Install Zebra, generate and edit its config, understand the ports and data directory, and choose a network you can actually afford to run.",
    content: `<p>A full node is the thing that decides, for itself, whether every block and transaction on the chain follows the rules. The old <code>zcashd</code> node reached its end of support and halted at Mainnet height 3,417,100 on 18 July 2026; it does not support NU6.3 and you should never run it. The node you run today is <strong>Zebra</strong>, the Zcash Foundation's Rust implementation. This lesson gets you from nothing to a running node, and is the groundwork for this module's lab, where you deploy a full Z3 stack.</p>
<p>Be honest about cost before you start. A Mainnet node needs roughly 300 GB of disk and days to sync — a real expense on a rented server. Most of what you need to learn can be done on Testnet or a local regtest network for almost nothing. We will cover all three and say what each one proves.</p>

<h2>Installing Zebra</h2>
<p>The Zebra README gives three routes. Pick by what you have:</p>
<ul>
  <li><strong>Docker</strong> — nothing to build. The README's one-liner pulls the latest release and syncs to the tip:
<pre><code>docker run -d \\
  --name zebra \\
  -p 8233:8233 \\
  -v zebrad-cache:/home/zebra/.cache/zebra \\
  zfnd/zebra:latest</code></pre>
  The <code>-v</code> flag persists the chain state across restarts so you do not re-sync; <code>-p 8233:8233</code> exposes the peer-to-peer port.</li>
  <li><strong>Pre-built binary</strong> — on x86-64 or aarch64 Linux (glibc 2.34+) you can skip the build toolchain: <code>cargo binstall zebrad</code>. The same signed binaries are attached to each GitHub release.</li>
  <li><strong>From source</strong> — <code>cargo install --locked zebrad</code>. This needs Rust, <code>libclang</code> and a C++ compiler. (On very new GCC, the README notes a <code>rocksdb</code> build workaround: <code>export CXXFLAGS="$CXXFLAGS -include cstdint"</code>.)</li>
</ul>
<p>Zebra is a node only — it has <strong>no wallet</strong>. To hold or send funds you pair it with Zallet (in beta) or a light wallet through an indexer such as Zaino. You met that stack earlier in the course; this lesson is just the node.</p>

<h2>Config, data and ports</h2>
<p>Start it with <code>zebrad start</code>. To change anything, generate a config file first:</p>
<pre><code>zebrad generate -o ~/.config/zebrad.toml</code></pre>
<p>That writes a TOML file of Zebra's defaults, which you then edit. The file is where you choose the network, enable the RPC server, set listen addresses and so on. Zebra stores its chain state in a cache directory (on GNU/Linux, under <code>~/.cache/zebra</code>); in Docker that is <code>/home/zebra/.cache/zebra</code>, which is why the example mounts a volume there.</p>
<p>Two sets of ports matter, and people confuse them. Learn the difference:</p>
<table>
  <thead><tr><th>Purpose</th><th>Mainnet</th><th>Testnet</th><th>Default</th></tr></thead>
  <tbody>
    <tr><td>P2P (talking to other nodes)</td><td>8233</td><td>18233</td><td>Enabled; needed to sync</td></tr>
    <tr><td>RPC (wallets/explorers calling your node)</td><td>8232</td><td>18232</td><td>Disabled</td></tr>
  </tbody>
</table>
<p>The RPC server is off until you add an <code>[rpc]</code> section and set <code>listen_addr</code>, for example <code>"0.0.0.0:8232"</code> on Mainnet. When it is on, Zebra uses <strong>cookie authentication</strong> by default (<code>enable_cookie_auth = true</code>): it writes a random secret to <code>&lt;cache_dir&gt;/.cookie</code>, and a client must read that file to make calls. That is a safety feature — it stops any local process from driving your node. Some tools (older <code>lightwalletd</code>) cannot do cookie auth, so the docs show how to set <code>enable_cookie_auth = false</code>; only do that on a loopback-only, trusted setup.</p>

<h2>Health and readiness</h2>
<p>How do you know the node is working? Beyond the logs, Zebra can serve two lightweight HTTP endpoints, meant for load balancers and Kubernetes probes. They are off by default; enable them with a <code>[health]</code> section:</p>
<pre><code>[health]
listen_addr = "0.0.0.0:8080"
min_connected_peers = 1
ready_max_blocks_behind = 2</code></pre>
<p>Then <code>GET /healthy</code> returns <code>200</code> when the process is up with enough live peers, and <code>GET /ready</code> returns <code>200</code> only when the node is near the chain tip (within a couple of blocks and recent enough). <code>/ready</code> is the honest signal that your node has finished syncing. These endpoints are unauthenticated, so bind them to an internal address.</p>

<h2>What to expect while syncing, and keep it upgraded</h2>
<p>A first Mainnet sync from genesis takes days — the Z3 stack documents 24 to 72 hours — and downloads around 300 GB. The Zebra book lists recommended hardware of 4 CPU cores, 16 GB RAM and 300 GB disk, with a documented minimum of 2 cores and 4 GB RAM; it has even been run on an Orange Pi. If days of syncing is not practical, the book describes syncing from a state snapshot, which is faster but temporarily needs about twice the disk while the archive extracts.</p>
<blockquote>Zebra releases stop running at a built-in <em>end-of-support</em> height, the same mechanism that halted zcashd. You must keep a running node upgraded. Ask the node its own limit with the <code>getdeprecationinfo</code> RPC, which reports the estimated last height this release supports.</blockquote>

<h2>Choosing a network you can afford</h2>
<p>This is the practical decision for a learner. The Z3 README lays out the three networks cleanly:</p>
<table>
  <thead><tr><th>Network</th><th>First sync</th><th>Real funds</th><th>Proves</th></tr></thead>
  <tbody>
    <tr><td>Mainnet</td><td>24–72 h, ~300 GB</td><td>Yes</td><td>You can operate real infrastructure</td></tr>
    <tr><td>Testnet</td><td>2–12 h, ~10 GB</td><td>No (test ZEC)</td><td>You can run against a live public network, get testnet coins from a faucet, and test real transactions. NU7 is live here, so Testnet has 25-second blocks while Mainnet has 75.</td></tr>
    <tr><td>Regtest</td><td>Seconds, no peers</td><td>No</td><td>The whole stack starts locally in seconds; you mine blocks on demand. Best for development and for this week's lab.</td></tr>
  </tbody>
</table>
<p>For almost everything you need to learn, start on <strong>regtest</strong>: it has no peers and no sync, so you see the full node, wallet and indexer come up in seconds. Move to <strong>Testnet</strong> when you want to prove something works against a real, shared chain without spending money. Reserve <strong>Mainnet</strong> for when running production infrastructure is the actual goal and you have budgeted the disk. If you do want a hardened, always-on node on cheap hardware, ZecHub has guides for a systemd-sandboxed Zebra and for Raspberry Pi full nodes.</p>

<h2>Try it</h2>
<p>If you can install Zebra, run it on Testnet: <code>zebrad generate -o zebrad.toml</code>, edit the config to use Testnet, add an <code>[rpc]</code> section on <code>127.0.0.1:18232</code>, start it, and watch the sync logs. If a full install is too much right now, read the Zebra book's "Running Zebra" and "Zebra Health Endpoints" pages and write out: which port your wallet would connect to, where the cookie file lives, and how you would check the node is fully synced. Keep these notes — you will build the Z3 stack on them in the lab.</p>

<h2>Key takeaways</h2>
<ul>
  <li>Run Zebra, never zcashd — zcashd halted at Mainnet height 3,417,100 on 18 July 2026.</li>
  <li>Install via Docker (<code>zfnd/zebra</code>), <code>cargo binstall zebrad</code>, or <code>cargo install --locked zebrad</code>; configure with <code>zebrad generate</code> then <code>zebrad start</code>.</li>
  <li>P2P ports are 8233/18233; RPC ports are 8232/18232 and off by default, with cookie auth on by default.</li>
  <li>A Mainnet node needs ~300 GB and days to sync; use <code>/ready</code> to confirm sync, and keep the node upgraded or it halts at its end-of-support height.</li>
  <li>Learn on regtest (instant) and Testnet (cheap, real network); save Mainnet for real production.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://github.com/ZcashFoundation/zebra">Zebra README</a> (install routes, Docker command)</li>
  <li><a href="https://zebra.zfnd.org/user/run.html">Zebra Book: Running Zebra</a> and <a href="https://zebra.zfnd.org/user/requirements.html">System Requirements</a></li>
  <li><a href="https://zebra.zfnd.org/user/health.html">Zebra Book: Health Endpoints</a> and <a href="https://zebra.zfnd.org/user/docker.html">Zebra with Docker</a> (cookie auth, RPC ports)</li>
  <li><a href="https://github.com/ZcashFoundation/z3">Z3: Zebra + Zallet + Zaino stack</a> (networks, sync times, ~300 GB)</li>
  <li><a href="https://zechub.wiki/">ZecHub guides</a> (Hardened Zebra, Raspberry Pi full node)</li>
</ul>`,
  },
  "l-03-04": {
    title: "Finding Good First Issues",
    subtitle: "Locate beginner-friendly work across the active Zcash repositories, including the many routes that are not writing node code.",
    content: `<p>The hardest part of a first open-source contribution is not the code. It is finding a task that is small enough to finish, wanted by the maintainers, and not already being worked on. Pick well and your first pull request is a pleasant afternoon. Pick badly and you spend a week on something that gets closed. This short lesson shows you where to look and how to read what you find.</p>

<h2>The GitHub-native labels</h2>
<p>Two labels are built into GitHub and used across the Zcash repositories. Zebra's own labels documentation lists both and insists they be spelled exactly as GitHub expects:</p>
<ul>
  <li><code>good first issue</code> — "Suitable for a first contribution."</li>
  <li><code>help wanted</code> — "Maintainers would welcome outside help."</li>
</ul>
<p>Zebra's <code>CONTRIBUTING.md</code> points newcomers straight at them, at <code>github.com/ZcashFoundation/zebra/labels/good%20first%20issue</code> and <code>.../labels/help%20wanted</code>. Any repository exposes its issues under <code>/labels/&lt;label&gt;</code>, and GitHub's search lets you scan several at once — for example a search for <code>is:issue is:open label:"good first issue"</code> scoped to an organisation. Because every project keeps its own label set, always open the target repo's <em>Labels</em> page and confirm which beginner labels it actually uses before trusting a saved search.</p>
<p>Zebra also tags issues with an <strong>issue type</strong> rather than a type label: Bug, Task, Feature or Epic. A <em>Task</em> is often the friendliest start — "work that is neither a bug nor a user-visible feature: CI and infrastructure changes, refactors, docs, research."</p>

<h2>Where the beginner work actually is</h2>
<p>Zcash's most beginner-friendly code is usually <em>not</em> in Zebra. Zebra's contributing guide is explicit that it "excludes features not strictly needed for block validation and chain sync. Features like wallets, block explorers, and mining pools belong in Zaino, Zallet, or librustzcash." It also only accepts changes behind an acknowledged issue. So widen your search. As of October 2026 the active, newcomer-open repositories include:</p>
<table>
  <thead><tr><th>Repository</th><th>Good for a first contribution because</th></tr></thead>
  <tbody>
    <tr><td><code>zingolabs/zaino</code></td><td>The indexer is young and has plenty of surface; PRs go against the <code>dev</code> branch.</td></tr>
    <tr><td><code>zcash/wallet</code> (Zallet)</td><td>In beta, with many zcashd JSON-RPC methods not yet ported — well-scoped, self-contained tasks.</td></tr>
    <tr><td><code>zcash/zcash-devtool</code></td><td>A developer CLI; small, readable, explicitly a prototyping tool.</td></tr>
    <tr><td><code>zcash/librustzcash</code></td><td>Core libraries with a detailed contributing guide covering bug reports and enhancements.</td></tr>
    <tr><td><code>zechub/zechub</code></td><td>Documentation and the wiki — the lowest-friction way to make a real, merged contribution.</td></tr>
  </tbody>
</table>

<h2>You do not have to write node code</h2>
<p>A merged pull request is a merged pull request. Non-code routes build the same track record and are often more wanted:</p>
<ul>
  <li><strong>Documentation.</strong> Fixing or extending a README, a book page or a code comment is genuinely valuable and easy to review.</li>
  <li><strong>Tests.</strong> Adding a missing test for existing behaviour is welcome and teaches you the codebase fast.</li>
  <li><strong>The ZecHub wiki.</strong> ZecHub is community-run education; its repository accepts new and corrected pages through ordinary pull requests.</li>
  <li><strong>Translations.</strong> ZecHub's content is translated into several languages — the repository already carries an Igbo (<code>ig</code>) translation tree alongside German, Spanish, Korean and others. If you read a language the wiki is missing or incomplete in, that is a real contribution.</li>
  <li><strong>Bounties.</strong> ZecHub posts small paid tasks — wiki pages, tutorials, development work — tipped in shielded ZEC. You met these in the funding lesson.</li>
</ul>

<h2>Reading an issue before you start</h2>
<p>Before you write a line, check three things. <strong>Is anyone already on it?</strong> Read the comments and look for an assignee or a linked branch. <strong>Is it still wanted?</strong> An issue open for two years with no maintainer reply may be stale. <strong>Has a maintainer acknowledged it?</strong> This is the rule that trips people up most. Zebra's guide says plainly: "Wait for a team member to respond before writing code — an issue with no team acknowledgment does not count as prior discussion." Comment on the issue, say you would like to take it and sketch your approach, and wait for a nod. That one message saves far more time than it costs.</p>
<blockquote>Maintainers close low-effort or unrequested PRs to protect their review time. The fix is not to work harder in silence — it is to agree the task with them first, so your effort counts.</blockquote>

<h2>Try it</h2>
<p>Pick two of the repositories above. On each, open the Labels page and note which beginner labels it uses. Then find one open <code>good first issue</code> (or the closest equivalent) that you could plausibly do, and read it top to bottom. Write three sentences: what the task is, whether anyone is already working on it, and what you would say in a comment to claim it. Keep the strongest candidate — it could become your lab in the final week.</p>

<h2>Key takeaways</h2>
<ul>
  <li><code>good first issue</code> and <code>help wanted</code> are GitHub-native labels used across Zcash repos; confirm each repo's own label set before trusting a search.</li>
  <li>Zebra deliberately excludes wallet, explorer and mining work — look to Zaino, Zallet, librustzcash and zcash-devtool for approachable code.</li>
  <li>Documentation, tests, the ZecHub wiki, translations (including Igbo) and bounties are real, merge-worthy contributions.</li>
  <li>Always check an issue is unclaimed, still wanted, and acknowledged by a maintainer before you code.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://github.com/ZcashFoundation/zebra/blob/main/CONTRIBUTING.md">Zebra CONTRIBUTING.md</a> (labels, "wait for acknowledgment", scope)</li>
  <li><a href="https://zebra.zfnd.org/dev/labels.html">Zebra Book: Labels and Issue Types</a></li>
  <li><a href="https://github.com/zingolabs/zaino/blob/dev/CONTRIBUTING.md">Zaino CONTRIBUTING.md</a> and <a href="https://github.com/zcash/librustzcash/blob/main/CONTRIBUTING.md">librustzcash CONTRIBUTING.md</a></li>
  <li><a href="https://github.com/zechub/zechub">zechub/zechub repository</a> and <a href="https://bounties.zechub.wiki/">ZEC Bounties</a></li>
  <li><a href="https://docs.github.com/en/issues">GitHub Issues documentation</a> (searching and filtering by label)</li>
</ul>`,
  },
  "l-03-05": {
    title: "Writing a ZIP Proposal",
    subtitle: "Understand the ZIP process, the required sections and naming convention, and what a well-written proposal looks like.",
    content: `<p>A Zcash Improvement Proposal (ZIP) is how a change to Zcash is specified and agreed. You met the ZIP system in the first lesson of this module; now you learn to write one. Even if you never author a consensus change, knowing the format lets you read any ZIP with confidence and gives you a credible way to propose a standard the whole ecosystem could adopt. The authority for all of this is <a href="https://zips.z.cash/zip-0000">ZIP 0</a>, which documents the process itself.</p>
<p>One expectation to set first. A newcomer's first ZIP is very unlikely to be a consensus change — those take months and deep review. It is far more likely to be a <strong>Standards</strong> or <strong>Wallet</strong> ZIP: a convention for how wallets or applications should construct or interpret something, so they interoperate. That is a realistic target.</p>

<h2>Before you write anything</h2>
<p>ZIP 0 is firm that writing the document is not the first step. "The ZIP process begins with a new idea," and "the best way to proceed is usually by posting about the new idea to the Zcash Community Forum." Vetting publicly first saves everyone time: it checks the idea is original, that it applies beyond your own use, and that it has not already been rejected. Many small enhancements do not need a ZIP at all — ZIP 0 says patches to one project "should be injected into the relevant project-specific development workflow," not standardised. Reach for a ZIP only when something must be agreed <em>across</em> implementations.</p>

<h2>The categories decide almost everything</h2>
<p>Every ZIP declares a <code>Category</code>, and it sets the expectations and even the number. The ones you will meet:</p>
<table>
  <thead><tr><th>Category</th><th>Covers</th><th>Number range</th></tr></thead>
  <tbody>
    <tr><td><strong>Consensus</strong></td><td>Rules all implementations must follow to agree on the chain</td><td>200–299</td></tr>
    <tr><td><strong>Standards</strong></td><td>Non-consensus changes affecting most implementations, or interoperability of apps</td><td>300–399 (higher layers)</td></tr>
    <tr><td><strong>Wallet</strong></td><td>How wallets construct or interpret transactions, addresses, etc.</td><td>300–399</td></tr>
    <tr><td><strong>Process</strong> / <strong>Informational</strong></td><td>A process around Zcash, or guidance the community may follow</td><td>0–9 or 1000–1199</td></tr>
  </tbody>
</table>
<p>A Consensus or Standards ZIP "SHOULD have a Reference Implementation section," and a Consensus ZIP "SHOULD have a Deployment section" naming the network upgrade it activates in. You do not pick your own number — the ZIP Editors assign it.</p>

<h2>The required sections</h2>
<p>ZIP 0 lists the parts a ZIP should have, in order. Learn them as a checklist:</p>
<ol>
  <li><strong>Preamble</strong> — an RFC-822-style header. The required fields are <code>ZIP</code>, <code>Title</code>, <code>Owners</code>, <code>Status</code>, <code>Category</code>, <code>Created</code> and <code>License</code>. (Optional ones include <code>Discussions-To</code> and <code>Pull-Request</code>.)</li>
  <li><strong>Terminology</strong> — definitions of technical or non-obvious terms.</li>
  <li><strong>Abstract</strong> — about 200 words summarising the problem, the solution and the outcome, and noting any privacy implications. The ZIP must still make sense without it.</li>
  <li><strong>Motivation</strong> — why the existing protocol is inadequate. "Critical for ZIPs that want to change the Zcash protocol."</li>
  <li><strong>Privacy Implications</strong> — present if the proposal affects user privacy; a high-level overview of trade-offs and data-leakage risks, kept separate from conformance rules.</li>
  <li><strong>Requirements</strong> — the high-level goals the specification must meet, with no conformance language of their own (so you can check the spec against them).</li>
  <li><strong>Specification</strong> — the technical detail: "detailed enough to allow competing, interoperable implementations."</li>
  <li><strong>Rationale</strong> — why you made each design decision, and what alternatives you rejected.</li>
</ol>
<p>Consensus and Standards ZIPs then add <strong>Reference Implementation</strong>, and Consensus ZIPs add <strong>Deployment</strong>.</p>

<h2>Drafting and submitting</h2>
<p>Write in the zips repository's own format and conventions:</p>
<ol>
  <li>Clone <code>github.com/zcash/zips</code>. Add your draft to the <code>zips/</code> directory, written in reStructuredText or Markdown.</li>
  <li>Name it with the <code>draft-</code> convention — ZIP 0 gives the example <code>draft-zatoshizakamoto-42millionzec</code> — because "Owners MUST NOT self-assign ZIP numbers." The real drafts in the repo follow <code>draft-&lt;author&gt;-&lt;topic&gt;</code>, such as <code>draft-str4d-orchard-balance-proof.md</code>.</li>
  <li>Run <code>make</code> to check your reStructuredText or Markdown renders, and inspect the generated <code>rendered/draft-*.html</code>.</li>
  <li>Open a pull request. All initial submissions have <code>Status: Draft</code>. The Editors do a content review and a format review; two Editors handle the detailed format pass.</li>
</ol>
<p>The status then progresses: <strong>Draft → Proposed</strong> (after feedback and rough consensus) <strong>→ Implemented</strong> (a working reference implementation exists) <strong>→ Final</strong> (implemented and activated on the network). Process and Informational ZIPs reach <strong>Active</strong> instead. A ZIP with security or privacy implications "MUST NOT" move to a released status without independent expert review.</p>

<h2>A clean model to copy</h2>
<p>Read a recent, well-structured ZIP end to end before writing your own. <a href="https://zips.z.cash/zip-0259">ZIP 259</a> (Deployment of NU7) is a tidy example. Its preamble is complete and minimal — <code>ZIP: 259</code>, a clear title, named Owner with email, <code>Status: Draft</code>, <code>Category: Consensus / Network</code>, a creation date, a licence and a <code>Discussions-To</code> forum link. It opens with Terminology that defines every term it later leans on, then an Abstract that states in plain language what changes (block spacing 75s to 25s, which other ZIPs it deploys) and, crucially, what does <em>not</em> (no new transaction format) and the consequence (version 4 transactions become invalid, so Sprout funds become unspendable). Notice how much work the Abstract does, and how precisely it scopes the change. That precision is what reviewers reward.</p>

<h2>Try it</h2>
<p>Open ZIP 259 and one Wallet or Standards ZIP (for example ZIP 316 on Unified Addresses, which you met earlier). For each, list its preamble fields and its top-level section headings, and mark which of ZIP 0's required sections are present. Then take an idea of your own — a small convention two wallets should share — and draft just the Preamble and a 200-word Abstract for it, using the <code>draft-&lt;yourname&gt;-&lt;topic&gt;</code> naming. Do not submit it; this is practice in the format.</p>

<h2>Key takeaways</h2>
<ul>
  <li>Start on the forum, not in the repo. Use a ZIP only for things that must be agreed across implementations.</li>
  <li>A first ZIP is realistically a Standards or Wallet ZIP (number range 300–399), not a consensus change.</li>
  <li>The required sections are Preamble, Terminology, Abstract, Motivation, Privacy Implications, Requirements, Specification and Rationale.</li>
  <li>Draft files use the <code>draft-&lt;author&gt;-&lt;topic&gt;</code> name; you never assign your own number — the Editors do.</li>
  <li>Status runs Draft → Proposed → Implemented → Final (or Active for Process/Informational); security-relevant ZIPs need independent review first.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/zip-0000">ZIP 0: ZIP Process</a> (workflow, categories, status, required sections)</li>
  <li><a href="https://github.com/zcash/zips">zcash/zips repository README</a> (how to add a draft, <code>make</code>)</li>
  <li><a href="https://zips.z.cash/zip-0259">ZIP 259: Deployment of the NU7 Network Upgrade</a> (model structure)</li>
  <li><a href="https://zips.z.cash/zip-0316">ZIP 316: Unified Addresses and Unified Viewing Keys</a> (a Standards/Wallet ZIP)</li>
</ul>`,
  },
  "l-03-06": {
    title: "Rust for Zcash Contributors",
    subtitle: "Learn the slice of Rust you need to read and contribute to Zcash's core codebases, from ownership to Tokio and tower services.",
    content: `<p>Most of Zcash's core software — Zebra, Zallet, Zaino, librustzcash, orchard — is written in Rust. You do not need to be a Rust expert to contribute, but you do need to read it without fear and make a small, correct change. This lesson is the fast path: the handful of Rust ideas that actually show up when you open these repositories, with short examples you can run. It is not a substitute for a proper course — the end of the lesson points you to one.</p>
<p>If you know JavaScript, TypeScript or Python, the syntax will feel familiar; the new ideas are ownership and the type system's strictness. That strictness is the point: it is why a consensus node can be trusted.</p>

<h2>Ownership and borrowing, in a page</h2>
<p>Every value in Rust has one <em>owner</em>. When the owner goes out of scope, the value is freed — there is no garbage collector. You can lend a value out with a <em>reference</em> (<code>&amp;</code>) instead of giving it away. That is <em>borrowing</em>, and it is how you pass data to a function without losing it:</p>
<pre><code>fn total(amounts: &amp;[u64]) -&gt; u64 {
    amounts.iter().sum()
}

let amounts = vec![100u64, 250, 75];
println!("total = {}", total(&amp;amounts)); // lend it
println!("still own: {}", amounts.len()); // caller keeps it
</code></pre>
<p>The rule the compiler enforces: you may have many shared references (<code>&amp;T</code>) or exactly one mutable reference (<code>&amp;mut T</code>), never both at once. This is what prevents whole classes of bugs — data races, use-after-free — at compile time. When you see <code>&amp;</code>, <code>&amp;mut</code> and <code>.clone()</code> scattered through Zcash code, this is why.</p>

<h2>Errors: <code>Result</code> and <code>?</code></h2>
<p>Rust has no exceptions. A function that can fail returns <code>Result&lt;T, E&gt;</code> — either <code>Ok(value)</code> or <code>Err(error)</code> — and the caller must handle both. The <code>?</code> operator is shorthand: it returns the value on success, or returns early with the error on failure.</p>
<pre><code>fn parse_height(s: &amp;str) -&gt; Result&lt;u32, std::num::ParseIntError&gt; {
    let height: u32 = s.trim().parse()?; // on error, return it
    Ok(height)
}
</code></pre>
<p>You will see <code>?</code> on almost every line that does I/O or parsing in Zebra. Reading it as "do this, and bail out if it fails" is enough to follow the flow.</p>

<h2>Traits</h2>
<p>A <em>trait</em> is a shared interface, like an interface in TypeScript or an abstract base class in Python. A type <em>implements</em> a trait to promise it has that behaviour. Zebra's consensus-critical serialization is built on two traits, <code>ZcashSerialize</code> and <code>ZcashDeserialize</code>; every on-the-wire type implements them. A tiny example:</p>
<pre><code>trait Summable {
    fn zatoshis(&amp;self) -&gt; u64;
}

struct Note { value: u64 }

impl Summable for Note {
    fn zatoshis(&amp;self) -&gt; u64 { self.value }
}
</code></pre>
<p>When you want to know "what can this type do?", look for its <code>impl</code> blocks. (All three snippets above compile together under Rust edition 2021.)</p>

<h2>Async, Tokio and the <code>tower::Service</code> pattern</h2>
<p>A node spends its life waiting — on peers, on disk, on verification. Rust handles this with <code>async</code>/<code>await</code>: an <code>async fn</code> returns a <em>future</em>, a value that does nothing until it is <code>.await</code>ed and driven by a runtime. Zcash projects use <strong>Tokio</strong> as that runtime.</p>
<p>Zebra goes one step further. As you saw in the codebase tour, its components are "microservices in one process": each one implements <a href="https://docs.rs/tower/latest/tower/trait.Service.html"><code>tower::Service</code></a>, taking a <code>Request</code> and returning a future of a <code>Response</code>. A real Zebra <code>Service</code> implementation (in <code>zebra-consensus/src/transaction.rs</code>) declares exactly this shape:</p>
<pre><code>type Response = BlockResponse;
type Error = TransactionError;
type Future = /* a boxed future */;

fn poll_ready(&amp;mut self, cx: &amp;mut Context&lt;'_&gt;) -&gt; Poll&lt;Result&lt;(), Self::Error&gt;&gt; { /* ready? */ }
fn call(&amp;mut self, req: BlockRequest) -&gt; Self::Future { /* do the work */ }
</code></pre>
<p>You rarely write a <code>Service</code> from scratch for a first contribution, but you must recognise the pattern: <code>poll_ready</code> lets a service signal "I am ready / I am busy" (that is <em>backpressure</em>), and <code>call</code> starts the work and returns a future. When you trace a request through Zebra, you are hopping from one <code>call</code> to the next.</p>

<h2>The tools you will run</h2>
<p>Three commands do most of the day-to-day work. Learn them before your first PR, because CI runs them and will reject anything that fails:</p>
<table>
  <thead><tr><th>Command</th><th>Does</th></tr></thead>
  <tbody>
    <tr><td><code>cargo test</code></td><td>Builds and runs the test suite.</td></tr>
    <tr><td><code>cargo clippy</code></td><td>The linter — catches common mistakes and non-idiomatic code. Treat its warnings as required fixes.</td></tr>
    <tr><td><code>cargo fmt</code></td><td>Auto-formats to the project style. Run it before every commit.</td></tr>
  </tbody>
</table>
<p>Zaino's contributing guide, for example, asks you to run its full lint before pushing and says code "must be formatted using <code>rustfmt</code> and applying the <code>clippy</code> suggestions." This is standard across the ecosystem.</p>

<h2>Feature flags</h2>
<p>Rust code can be switched on or off at compile time. There are two mechanisms you will meet. <strong>Cargo features</strong> are optional capabilities declared in <code>Cargo.toml</code> — Zebra's <code>zebrad</code> crate has real ones such as <code>indexer</code>, <code>internal-miner</code>, <code>elasticsearch</code>, <code>progress-bar</code> and <code>prometheus</code> — enabled with <code>cargo build --features indexer</code>. Separately, Zcash uses a <code>--cfg</code> flag, <code>zcash_unstable</code>, to gate not-yet-activated protocol code; you will see attributes like <code>#[cfg(zcash_unstable = "nu7")]</code> and <code>#[cfg(zcash_unstable = "zfuture")]</code> around experimental consensus logic. When a block of code seems to "not exist" until you pass a flag, this is why. If you change feature-gated code, build with that feature on so the compiler actually checks it.</p>

<h2>Reading an unfamiliar crate</h2>
<p>You will constantly open code you have never seen. A reliable approach: run <code>cargo doc --open</code> to read the crate's generated documentation, or browse it on <code>docs.rs</code>; start from the top-of-file <code>//!</code> doc comment; find the main types and their <code>impl</code> blocks; and lean on the compiler — make a small change, run <code>cargo check</code>, and let the type errors show you how the pieces connect.</p>

<h2>Try it</h2>
<p>Install Rust via <code>rustup</code> if you have not. Create a scratch project with <code>cargo new zcash_rust_warmup</code>, paste the three snippets above into <code>src/main.rs</code> (inside <code>main</code> where needed), and run <code>cargo run</code>, then <code>cargo fmt</code> and <code>cargo clippy</code>. Then open a <code>.rs</code> file in your Zebra clone and find one <code>Result</code> return type, one <code>?</code>, one trait <code>impl</code>, and one <code>#[cfg(...)]</code> attribute. If Rust is new to you, do the first three exercises of Rustlings this week.</p>

<h2>Key takeaways</h2>
<ul>
  <li>Ownership and borrowing (<code>&amp;</code>, <code>&amp;mut</code>) replace a garbage collector and are enforced by the compiler.</li>
  <li>Fallible functions return <code>Result&lt;T, E&gt;</code>; <code>?</code> propagates errors. Traits are shared interfaces you find via <code>impl</code> blocks.</li>
  <li>Async runs on Tokio; Zebra's components are <code>tower::Service</code>s with <code>poll_ready</code> (backpressure) and <code>call</code>.</li>
  <li><code>cargo test</code>, <code>cargo clippy</code> and <code>cargo fmt</code> are required before a PR — CI runs them.</li>
  <li>Feature flags gate code: Cargo features like <code>indexer</code>, and the <code>zcash_unstable</code> cfg for unreleased protocol work.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://doc.rust-lang.org/book/">The Rust Programming Language ("The Book")</a></li>
  <li><a href="https://rustlings.cool/">Rustlings</a> (hands-on exercises)</li>
  <li><a href="https://docs.rs/tower/latest/tower/trait.Service.html">tower::Service documentation</a></li>
  <li><a href="https://github.com/ZcashFoundation/zebra/blob/main/zebra-consensus/src/transaction.rs">Zebra transaction verifier Service (real code)</a></li>
  <li><a href="https://github.com/zingolabs/zaino/blob/dev/CONTRIBUTING.md">Zaino CONTRIBUTING.md</a> (rustfmt/clippy expectations)</li>
</ul>`,
  },
  "l-03-07": {
    title: "Code Review Culture in Zcash",
    subtitle: "Know what maintainers expect of a pull request, how to respond to review, and how to report a security issue privately.",
    content: `<p>Writing the change is half the work; getting it merged is the other half. Zcash's core projects are small teams guarding consensus-critical code, so review is careful and review time is scarce. This lesson is about the human side of contributing: what a good pull request looks like before anyone reads your code, how to take a review well, and the one thing you must never do in public — report a security bug.</p>

<h2>What maintainers expect before they read your code</h2>
<p>Zebra's <code>CONTRIBUTING.md</code> is blunt about the economics: "every PR requires human review time." The expectations that follow are typical across the ecosystem:</p>
<ul>
  <li><strong>Start with an issue, and wait for a reply.</strong> "An issue with no team acknowledgment does not count as prior discussion." Discuss anything beyond a small fix before you open a PR.</li>
  <li><strong>Keep PRs focused.</strong> "One logical change per PR." A reviewer can approve a small, clear change quickly; a sprawling one stalls.</li>
  <li><strong>Follow conventional commits.</strong> The PR title must follow the <a href="https://www.conventionalcommits.org/en/v1.0.0/">conventional commits</a> standard (<code>fix:</code>, <code>feat:</code>, <code>docs:</code>, <code>ci:</code>). In Zebra the title becomes the merge commit message.</li>
  <li><strong>Declare breaking changes.</strong> If you break a published crate's public API, mark it with <code>!</code> in the title, e.g. <code>feat(zebra-chain)!: ...</code>.</li>
  <li><strong>Make CI pass.</strong> Zebra's code standards require that "<code>cargo fmt</code>, <code>cargo clippy</code>, and <code>cargo test</code> must all pass," and that user-visible changes update the changelog. Run all three locally before you push.</li>
</ul>
<p>Maintainers will close a PR that ignores these — not out of unkindness, but to manage review capacity. Zebra lists the common reasons: no linked issue, an unrequested feature, low-effort changes, or "missing test evidence or inability to explain the changes." Avoid every one of those and your PR starts in a good place.</p>

<h2>Responding to review</h2>
<p>A review is a conversation, not a verdict. Assume the reviewer is helping the code, not judging you, and address every comment — even if only to explain why you disagree. Make requested changes as new commits so the reviewer can see what moved. If you are asked to explain a change, explain it: you are "the sole responsible author" and must be able to "explain the logic and design trade-offs of every change." When you are blocked or unsure, say so early rather than going quiet — a stalled PR with no response gets closed.</p>

<h2>A note on AI-assisted contributions</h2>
<p>Where a project states a policy on AI tools, follow it exactly, and do not assume. Zebra's is explicit, so quote it rather than guess: "We welcome contributions that use AI tools. What matters is the quality of the result and the contributor's understanding of it, not whether AI was involved." It then requires you to <strong>disclose</strong> AI usage in the PR description, to <strong>understand</strong> your own code well enough to defend it in review, and <strong>not to submit without reviewing</strong> every line and running the tests. Not every repository publishes such a policy; where none exists, the safe default is to disclose anyway and be ready to explain your work.</p>

<h2>Reporting a security issue — privately</h2>
<p>This is the rule with no exceptions. If you find a vulnerability, <strong>do not open a public issue or PR, and do not put exploit details anywhere public.</strong> Zcash projects follow a coordinated disclosure process. For Zebra, non-critical vulnerabilities go through GitHub's "Report a Vulnerability" feature at <code>github.com/ZcashFoundation/zebra/security/advisories</code>; critical issues (consensus divergence, loss or counterfeiting of funds, a persistent node halt, remote compromise) use the faster private channels the <code>SECURITY.md</code> lists, with PGP-encrypted email to <code>security@zfnd.org</code> as a fallback. Zaino asks you to email <code>zingodisclosure@proton.me</code>. Always confirm the issue against the latest release or <code>main</code> before reporting.</p>
<blockquote>The Foundation then publishes a GitHub Security Advisory (GHSA) and requests a CVE. This is not theoretical: Zebra 6.4.2 (September 2026) fixed a remotely triggerable denial of service in version 6 transaction parsing, disclosed as GHSA-h5rr-8pqv-grp9. Private reporting is what let that fix ship before the bug was weaponised.</blockquote>
<p>Reporting responsibly is itself a respected contribution. The Foundation runs a "no fault" process and credits reporters who want it.</p>

<h2>Try it</h2>
<p>Open the Zebra repository and read one recently merged pull request end to end: its linked issue, its title (note the conventional-commit prefix), the review comments and how the author responded. Then open Zebra's <code>SECURITY.md</code> and write down exactly where you would report (a) a typo in the docs and (b) a suspected fund-counterfeiting bug. Noticing that these go to completely different places is the point.</p>

<h2>Key takeaways</h2>
<ul>
  <li>A good PR starts with an acknowledged issue, is one focused change, uses conventional-commit titles, and passes <code>cargo fmt</code>/<code>clippy</code>/<code>test</code>.</li>
  <li>Treat review as a conversation: address every comment, explain your code, and surface blockers early.</li>
  <li>Disclose AI assistance where a project asks (Zebra does), and always understand and test code you submit.</li>
  <li>Never report a security bug in public. Use GitHub Security Advisories or the project's private channel; Zebra then publishes a GHSA and requests a CVE.</li>
  <li>Maintainers close PRs to protect review time — agreeing the work first is how you avoid that.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://github.com/ZcashFoundation/zebra/blob/main/CONTRIBUTING.md">Zebra CONTRIBUTING.md</a> (PR expectations, AI policy, code standards)</li>
  <li><a href="https://github.com/ZcashFoundation/zebra/blob/main/SECURITY.md">Zebra SECURITY.md</a> (disclosure channels, GHSA/CVE process)</li>
  <li><a href="https://github.com/ZcashFoundation/zebra/security/advisories">Zebra Security Advisories</a> (where to report; published GHSAs)</li>
  <li><a href="https://www.conventionalcommits.org/en/v1.0.0/">Conventional Commits specification</a></li>
  <li><a href="https://github.com/zingolabs/zaino/blob/dev/CONTRIBUTING.md">Zaino CONTRIBUTING.md</a> (its disclosure address and PR flow)</li>
</ul>`,
  },
}
