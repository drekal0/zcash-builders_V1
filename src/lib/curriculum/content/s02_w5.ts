// AUTO-GENERATED from scratchpad lesson fragments. Do not edit by hand.
// Each entry: lesson id -> { title, subtitle, content (HTML) }.
import type { LessonContent } from './types'

export const M_s02_w5: Record<string, LessonContent> = {
  "l-02-01": {
    title: "Zcash SDK Overview: Rust Crates and RPC from TypeScript",
    subtitle: "Name the libraries and tools you can build on today, say which of them support the Ironwood pool, and pick the right one for a task.",
    content: `<p>There is no single package called "the Zcash SDK". What exists is a family of Rust libraries, a handful of tools built on them, and network services (Zebra, Zallet, Zaino) that any language can call. This lesson maps that territory as it stands in October 2026, ten weeks after the Ironwood upgrade (NU6.3) changed the transaction format.</p>
<p>The question to ask of every library is: <em>does it build version 6 transactions?</em> Only version 6 can carry an Ironwood component, and no new value can enter the Orchard pool. A library that stopped at version 5 cannot make the payment you will make this week.</p>

<h2>The Rust crates: librustzcash</h2>
<p>The <code>zcash/librustzcash</code> repository is a workspace of Rust <strong>crates</strong> (Rust's word for packages). Zallet, the mobile wallet SDKs and <code>zcash-devtool</code> are all assembled from them:</p>
<table>
<thead><tr><th>Crate</th><th>What it gives you</th></tr></thead>
<tbody>
<tr><td><code>zcash_protocol</code></td><td>Consensus parameters, value types (<code>Zatoshis</code>), memo types</td></tr>
<tr><td><code>zcash_address</code></td><td>Parsing and serialising addresses, including Unified Addresses</td></tr>
<tr><td><code>zcash_keys</code></td><td>Spending and viewing keys, ZIP 32 derivation</td></tr>
<tr><td><code>zip321</code></td><td>ZIP 321 payment requests (lesson 5)</td></tr>
<tr><td><code>zcash_primitives</code></td><td>The transaction type, builders, proving, signing, serialisation</td></tr>
<tr><td><code>pczt</code></td><td>Partially Created Zcash Transactions: building a transaction in stages across parties or devices</td></tr>
<tr><td><code>zcash_client_backend</code></td><td>The wallet framework: storage APIs, chain scanning, light client protocol, fees, transaction proposals</td></tr>
<tr><td><code>zcash_client_sqlite</code></td><td>SQLite storage for <code>zcash_client_backend</code></td></tr>
<tr><td><code>zcash_pool_migration</code></td><td>Moving wallet funds between pools, first used for Orchard to Ironwood</td></tr>
</tbody>
</table>
<p>Ironwood support arrived in stages. <code>zcash_protocol</code> gained <code>NetworkUpgrade::Nu6_3</code> and <code>zcash_primitives</code> gained <code>TxVersion::V6</code> in pre-releases dated 30 June 2026. The wallet layer followed on 18 August 2026 with <code>zcash_client_backend</code> 0.24.0 and <code>zcash_client_sqlite</code> 0.22.0, which add Ironwood balances and note tracking. The <code>main</code> branch has since moved on to <code>-pre</code> versions of the next release, so read each crate's <code>CHANGELOG.md</code> and pin the versions you build against.</p>
<blockquote>The librustzcash README is blunt about two things: these libraries "are under development and have not been fully reviewed", and none of them can check consensus validity. Only a consensus node (Zebra) can tell you whether a transaction is valid.</blockquote>

<h2>Tools built on the crates</h2>
<table>
<thead><tr><th>Tool</th><th>What it is</th><th>Ironwood status (October 2026)</th></tr></thead>
<tbody>
<tr><td><code>zcash-devtool</code></td><td>A command-line light wallet and inspection tool "built by developers, for developers". No binaries; you run it with <code>cargo run</code>. Not for production.</td><td>Depends on <code>zcash_client_backend</code> 0.24. Its <code>balance</code> command prints an Ironwood line and <code>send</code> accepts <code>--tx-version 6</code>.</td></tr>
<tr><td>Zallet</td><td>The full-node wallet: a long-running service with a JSON-RPC interface. In <strong>beta</strong>.</td><td>Its RPC methods report Ironwood notes and decode version 6 transactions. You use it in lesson 3.</td></tr>
<tr><td>zingolib and <code>zingo-cli</code></td><td>Zingo Labs' light-wallet library and command-line client, which talk to an indexer such as Zaino.</td><td>Its test scenarios run on Ironwood-era chains by default.</td></tr>
</tbody>
</table>

<h2>TypeScript: what is and is not available</h2>
<p><strong>WebZjs</strong> (ChainSafe) is the TypeScript/WebAssembly library for building Zcash wallets in the browser: the Rust crates compiled to WebAssembly behind a <code>WebWallet</code> class. Check its repository before you plan around it. As of October 2026 the last commit is dated 16 April 2026, its Rust dependencies are pinned to a fork branch named for NU6.1, and the source contains no reference to Ironwood, NU6.3 or version 6 transactions. Treat it as not supporting the current shielded pool until its repository says otherwise.</p>
<p>That does not lock JavaScript developers out. There are three things you can do today without a Zcash library:</p>
<ul>
<li><strong>Call JSON-RPC.</strong> Zebra (chain data) and Zallet (wallet operations) both speak JSON-RPC over HTTP. The wallet does the cryptography; your code sends requests and reads results.</li>
<li><strong>Call gRPC.</strong> Zaino serves the <code>CompactTxStreamer</code> service you met in Week 4. The <code>.proto</code> files live in <code>zcash/lightwallet-protocol</code>, and any gRPC client can use them to read blocks and submit finished transactions. Decrypting notes and building shielded transactions still needs the Rust crates.</li>
<li><strong>Handle payment requests.</strong> ZIP 321 URIs are plain strings; you will build and parse them in JavaScript in lesson 5.</li>
</ul>
<p>A JSON-RPC call needs nothing more than <code>fetch</code>. This helper works with Node.js 18 or later, and you will point it at your own node in the next lesson:</p>
<pre><code>// rpc.ts - call a Zcash JSON-RPC endpoint.
async function rpc&lt;T&gt;(url: string, method: string, params: unknown[] = []): Promise&lt;T&gt; {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const body = await res.json();
  if (body.error) throw new Error(\`\${method}: \${body.error.message}\`);
  return body.result as T;
}

// Zebra's JSON-RPC port in the local regtest stack you set up in the next lesson.
const info = await rpc&lt;{ chain: string; blocks: number }&gt;(
  'http://127.0.0.1:29232', 'getblockchaininfo');
console.log(info.chain, info.blocks);</code></pre>

<h2>Choosing a tool</h2>
<table>
<thead><tr><th>You want to…</th><th>Use</th></tr></thead>
<tbody>
<tr><td>Send and receive from a script or a server, in any language</td><td>Zallet's JSON-RPC</td></tr>
<tr><td>Read blocks, transactions and pool totals</td><td>Zebra's JSON-RPC</td></tr>
<tr><td>Experiment with a light wallet from the terminal, or read a worked example of the Rust wallet APIs</td><td><code>zcash-devtool</code></td></tr>
<tr><td>Write your own wallet logic in Rust</td><td><code>zcash_client_backend</code> with <code>zcash_client_sqlite</code></td></tr>
<tr><td>Generate or parse a payment link</td><td>The <code>zip321</code> crate, or plain string handling in your own language</td></tr>
</tbody>
</table>
<p>For this week's lab, a command-line tool that sends a shielded payment into Ironwood, either route works: a TypeScript or Python program driving Zallet over JSON-RPC, or a Rust program built on the crates, for which <code>zcash-devtool</code>'s <code>src/commands/wallet/send.rs</code> is a compact model.</p>

<h2>Try it</h2>
<p>Open the <code>zcash-devtool</code> repository on GitHub and read its <code>Cargo.toml</code>. Write down the versions it requires of <code>zcash_client_backend</code>, <code>zcash_client_sqlite</code>, <code>zcash_primitives</code>, <code>orchard</code> and <code>zip321</code>. Then open <code>zcash_client_backend/CHANGELOG.md</code> in librustzcash, find the entry for that version, and list three additions whose names contain "ironwood". You now know how to check whether any Rust project in the ecosystem is current: read its dependency versions, then read the changelog.</p>

<h2>Key takeaways</h2>
<ul>
<li>The "SDK" is the librustzcash crates plus tools built on them; services such as Zallet and Zebra make the same capabilities available to any language over JSON-RPC.</li>
<li>Ironwood needs version 6 transactions. In Rust, that means <code>zcash_client_backend</code> 0.24 and <code>zcash_client_sqlite</code> 0.22 or later.</li>
<li>WebZjs, the browser library, shows no Ironwood support in its repository as of October 2026. From TypeScript, call Zallet's and Zebra's JSON-RPC instead.</li>
<li>Everything here is young: Zallet is in beta, <code>zcash-devtool</code> is not for production, and the crates carry an "under development" warning. Pin versions and read changelogs.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://github.com/zcash/librustzcash">zcash/librustzcash</a> — workspace README (crate list, warnings) and each crate's CHANGELOG.md</li>
<li><a href="https://github.com/zcash/zcash-devtool">zcash/zcash-devtool</a> — README, <code>doc/walkthrough.md</code>, <code>Cargo.toml</code></li>
<li><a href="https://zcash.github.io/zallet/">The Zallet Book</a> — user guide and JSON-RPC reference</li>
<li><a href="https://github.com/ChainSafe/WebZjs">ChainSafe/WebZjs</a> — check the commit history and <code>Cargo.toml</code> for current status</li>
<li><a href="https://github.com/zingolabs/zingolib">zingolabs/zingolib</a> — zingolib and <code>zingo-cli</code></li>
<li><a href="https://github.com/zcash/lightwallet-protocol">zcash/lightwallet-protocol</a> — the <code>CompactTxStreamer</code> .proto files</li>
</ul>`,
  },
  "l-02-02": {
    title: "Setting Up Your Dev Environment",
    subtitle: "Run a private Zcash network (Zebra, Zallet and an RPC router) on your own machine with the Z3 regtest stack, and confirm it answers.",
    content: `<p>To build on Zcash you need a node to talk to and a wallet that can sign. In Week 4 you met the pieces: Zebra validates the chain, Zallet holds keys and builds transactions, Zaino serves light clients, and Z3 packages them with Docker Compose. In this lesson you start that stack on your own machine in <strong>regtest</strong> mode: a private chain with no peers, where you mine blocks on demand and every network upgrade up to Ironwood is already active.</p>
<p>Regtest is the right place to learn. Nothing you do there costs money, there is nothing to sync, and you control the clock: a block exists when you ask for one.</p>

<h2>What you need, and what you do not</h2>
<p>The Z3 README describes three networks. The differences matter if your laptop is modest or your data is metered:</p>
<table>
<thead><tr><th>Network</th><th>First sync</th><th>Chain data on disk</th><th>Real funds</th></tr></thead>
<tbody>
<tr><td>Mainnet</td><td>24–72 hours</td><td>about 300 GB</td><td>Yes</td></tr>
<tr><td>Testnet</td><td>2–12 hours</td><td>about 30 GB</td><td>No (test ZEC)</td></tr>
<tr><td>Regtest</td><td>Seconds</td><td>Only the blocks you mine</td><td>No</td></tr>
</tbody>
</table>
<blockquote>You do not need to sync Mainnet for this course. A Mainnet node means downloading roughly 300 GB over one to three days. Everything in Weeks 5 and 6 runs on regtest.</blockquote>
<p>Install these before you start:</p>
<ul>
<li><strong>Docker Engine with Docker Compose v2.24.4 or later.</strong> The stack relies on Compose features introduced in that version. Check with <code>docker compose version</code>.</li>
<li><strong>Git</strong>, <strong>curl</strong> and <strong>openssl</strong>. The setup script uses openssl to hash the regtest wallet's RPC password. It is pre-installed on macOS and most Linux distributions.</li>
<li>Optionally <strong>jq</strong>, to make JSON output readable.</li>
</ul>
<p>The setup scripts are Bash scripts. On Windows, run everything inside WSL 2 with Docker Desktop's WSL integration turned on.</p>
<p>The one-off cost is network data: Docker pulls the Zebra and Zallet images, and builds a small Rust program (the RPC router) from source on first start, which the Z3 docs say "takes a few minutes". Do this once on a good connection. Regtest itself talks to no peers. The README's hardware minimum (2 CPU cores, 4 GB of RAM for Zebra alone, 8 GB or more for the full stack) is written for nodes that sync a public network. The Z3 docs give no separate figure for regtest, which has no chain to download and no peers to serve.</p>

<h2>Start the stack</h2>
<ol>
<li>Clone the repository:
<pre><code>git clone https://github.com/ZcashFoundation/z3 &amp;&amp; cd z3</code></pre></li>
<li>Run the one-time initialisation script:
<pre><code>./scripts/regtest-init.sh</code></pre>
It copies the config templates in <code>config/regtest/</code> into live files, generates the wallet's encryption identity and RPC password hash, starts Zebra, mines two blocks so that every upgrade through NU6.3 is active (the regtest config activates NU5 to NU6.3 at height 2), and creates the Zallet wallet with a fresh mnemonic.</li>
<li>Start everything:
<pre><code>docker compose --env-file .env.regtest up -d</code></pre>
After the first run, this line alone is enough.</li>
</ol>
<p>The file <code>.env.regtest</code> sets the project name <code>z3-regtest</code>, so its containers and volumes are separate from any Mainnet or Testnet stack on the same machine. These are the endpoints it publishes on your host:</p>
<table>
<thead><tr><th>Service</th><th>Endpoint</th><th>Use</th></tr></thead>
<tbody>
<tr><td>rpc-router</td><td><code>http://localhost:8181</code></td><td>One JSON-RPC endpoint that forwards each method to Zebra or Zallet</td></tr>
<tr><td>Zebra RPC</td><td><code>http://localhost:29232</code></td><td>Direct node JSON-RPC</td></tr>
<tr><td>Zallet RPC</td><td><code>http://localhost:50232</code></td><td>Direct wallet JSON-RPC</td></tr>
<tr><td>Zaino gRPC (optional)</td><td><code>localhost:28137</code></td><td>Light-client gRPC, plaintext; only with <code>--profile indexer</code></td></tr>
</tbody>
</table>
<p>On Mainnet and Testnet, Zebra and Zallet authenticate RPC clients with a cookie file. Regtest instead uses a fixed username and password, <code>zebra</code> / <code>zebra</code>, "hardcoded for regtest only". The router logs in to both backends for you, so calls to port 8181 need no credentials; calls made straight to Zallet on port 50232 need <code>-u zebra:zebra</code>.</p>

<h2>Check that it answers</h2>
<p>Send one request that the router forwards to Zebra and one that it forwards to Zallet:</p>
<pre><code># Routed to Zebra (the node)
curl -s -X POST -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"getblockchaininfo","params":[],"id":1}' \\
  http://127.0.0.1:8181

# Routed to Zallet (the wallet)
curl -s -X POST -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"getwalletinfo","params":[],"id":2}' \\
  http://127.0.0.1:8181</code></pre>
<p>The first returns a JSON object with the chain name, the block count and an <code>upgrades</code> map. The second returns wallet state. Zallet's own documentation warns that most balance fields in <code>getwalletinfo</code> are placeholders, so do not read anything into its zeros.</p>
<p>Now mine a block. The <code>generate</code> method exists only on regtest and takes the number of blocks to create:</p>
<pre><code>curl -s -u zebra:zebra -X POST -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"generate","params":[1],"id":1}' \\
  http://127.0.0.1:29232</code></pre>
<p>It returns the hash of each new block. Typing the curl boilerplate gets tedious, so put this helper in your shell for the rest of the week:</p>
<pre><code>rpc() {
  curl -s -X POST -H "Content-Type: application/json" \\
    -d "{\\"jsonrpc\\":\\"2.0\\",\\"id\\":1,\\"method\\":\\"$1\\",\\"params\\":\${2:-[]}}" \\
    http://127.0.0.1:8181
  echo
}

rpc getblockchaininfo
rpc generate '[1]'</code></pre>
<p>The router decides where to send a method by asking both backends for their method lists at start-up. A method that Zebra offers goes to Zebra; otherwise a method that Zallet offers goes to Zallet. You can read the merged list yourself by calling <code>rpc.discover</code>.</p>

<h2>Stop, restart and reset</h2>
<pre><code># Stop containers, keep the chain and the wallet
docker compose --env-file .env.regtest --profile "*" down

# Full reset: delete all regtest data, then run regtest-init.sh again
docker compose --env-file .env.regtest --profile "*" down -v</code></pre>
<p>A full reset destroys the wallet, including its mnemonic. On regtest that is a feature: when you get into a confusing state, wipe it and start again.</p>
<blockquote>Z3 pins exact image versions in <code>docker-compose.yml</code> so that everyone runs the same software. At the time of writing those pins were Zebra 6.2.3 and Zallet v0.1.0-beta.1, older than the newest releases of both. Zallet is in beta and gains RPC methods between releases, so a method described in the latest Zallet Book may be missing from your image. <code>rpc.discover</code> tells you what your running stack supports.</blockquote>

<h2>The rest of your toolbox</h2>
<p><strong>Node.js 18 or later</strong> is enough for the JavaScript in this module: it has <code>fetch</code> built in.</p>
<p><strong>Rust</strong> is needed only if you take the Rust route in the lab or want to run <code>zcash-devtool</code>. Install it with <code>rustup</code> from <a href="https://rustup.rs/">rustup.rs</a>. Both librustzcash and <code>zcash-devtool</code> declare a minimum Rust version of 1.88. There are no pre-built binaries of <code>zcash-devtool</code>, so you clone it and let Cargo build it:</p>
<pre><code>git clone https://github.com/zcash/zcash-devtool
cd zcash-devtool
cargo run --release -- --help</code></pre>
<p>Its lock file lists about 900 packages. The first build downloads and compiles what it needs from them, which takes a long time on a small laptop and a noticeable amount of data; later builds only recompile what changed. Start it when you can leave the machine alone.</p>

<h2>Try it</h2>
<p>Bring the stack up, then:</p>
<ol>
<li>Call <code>getblockchaininfo</code> and note the value of <code>blocks</code>.</li>
<li>Mine five blocks with <code>generate</code> and call <code>getblockchaininfo</code> again. Confirm <code>blocks</code> rose by five.</li>
<li>In the <code>upgrades</code> map, find the entry named <code>NU6.3</code>. What are its <code>activationheight</code> and <code>status</code>?</li>
<li>Call <code>rpc.discover</code> through the router and pipe it through <code>grep -o '"name":"[^"]*"'</code>. Find three wallet methods whose names begin with <code>z_</code>. You will use them in the next lesson.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
<li>Use Z3 on regtest for development: instant blocks, no peers, no sync, no real funds. A Mainnet sync (about 300 GB, one to three days) is not needed for this course.</li>
<li>Two commands start it: <code>./scripts/regtest-init.sh</code> once, then <code>docker compose --env-file .env.regtest up -d</code>.</li>
<li>Regtest ports: router 8181, Zebra 29232, Zallet 50232, optional Zaino gRPC 28137. Credentials are <code>zebra</code> / <code>zebra</code>, for regtest only.</li>
<li><code>generate</code> mines blocks on demand; <code>rpc.discover</code> lists the methods your stack supports.</li>
<li>Image versions are pinned and Zallet is in beta, so check what your running version offers before relying on a method.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://github.com/ZcashFoundation/z3">ZcashFoundation/z3</a> — README (networks, requirements, endpoints), <code>docs/regtest.md</code>, <code>docs/faq.md</code>, <code>.env.regtest</code>, <code>scripts/regtest-init.sh</code></li>
<li><a href="https://zebra.zfnd.org/">The Zebra Book</a> — Docker, regtest and RPC configuration</li>
<li><a href="https://zcash.github.io/zallet/">The Zallet Book</a> — wallet setup and the JSON-RPC method status page</li>
<li><a href="https://docs.docker.com/compose/install/">Docker Compose installation</a></li>
<li><a href="https://github.com/zcash/zcash-devtool">zcash/zcash-devtool</a> — README and <code>doc/walkthrough.md</code></li>
</ul>`,
  },
  "l-02-03": {
    title: "Sending Your First Ironwood Transaction",
    subtitle: "Fund a Zallet account on regtest, shield the funds, pay a Unified Address, and prove the payment landed in the Ironwood pool.",
    content: `<p>In this lesson you make a shielded payment end to end on your regtest stack: create an account, mine some coins to it, shield them, send them to a second Unified Address, and then check, from both the wallet and the node, that the value is in the Ironwood pool. Every step is a JSON-RPC call, so the same sequence works from curl, TypeScript or Python.</p>
<p>Zallet handles the wallet steps and Zebra the mining and verification, all through the <code>rpc</code> shell helper from the previous lesson.</p>
<blockquote>This path joins two documented halves. The Zallet Book's tutorial "Sending your first transaction" assumes a faucet on Testnet; the Z3 regtest guide stops once the wallet answers. The funding step below uses Zebra's regtest-only mining methods to bridge them. Zallet is in beta: if a response differs from what is described here, trust your running version and read its <code>rpc.discover</code> output.</blockquote>

<h2>Create an account and an address</h2>
<p>First confirm the wallet has caught up with the node. In the reply, <code>wallet_tip</code> and <code>node_tip</code> should report the same height:</p>
<pre><code>rpc getwalletstatus</code></pre>
<p>Zallet has no <code>getnewaddress</code>. You create an <strong>account</strong> (a separate group of funds under the wallet's seed), then derive addresses from it:</p>
<pre><code>rpc z_getnewaccount '["sender"]'
rpc z_getaddressforaccount '["&lt;account_uuid&gt;"]'</code></pre>
<p>The first call returns an <code>account_uuid</code>; copy it into the second. The second returns an <code>address</code>: a Unified Address which, by default, contains the best two shielded receiver types plus a transparent (<code>p2pkh</code>) receiver. On regtest it starts with <code>uregtest</code>.</p>
<p>There is no "Ironwood address". The Orchard receiver inside a Unified Address now receives into the Ironwood pool, and Zallet reports such funds under <code>ironwood</code>.</p>

<h2>Fund it by mining, then shield</h2>
<p>On regtest there is no faucet; you mine. Coinbase outputs (the block reward) must be 100 blocks deep before they can be spent, so you mine one block that pays you and then 100 more on top.</p>
<ol>
<li>Extract the transparent receiver from your Unified Address. The <code>p2pkh</code> field of the reply is a transparent address:
<pre><code>rpc z_listunifiedreceivers '["&lt;your-unified-address&gt;"]'</code></pre></li>
<li>Mine one block whose reward goes to it, then 100 more:
<pre><code>rpc generatetoaddress '[1, "&lt;your-p2pkh-address&gt;"]'
rpc generate '[100]'</code></pre>
<code>generatetoaddress</code> is a regtest-only Zebra method that pays the coinbase to the address you name instead of the node's configured miner address.</li>
<li>List what the wallet can see. You should find one entry whose <code>pool</code> is <code>"transparent"</code>; note its <code>value</code>:
<pre><code>rpc z_listunspent</code></pre></li>
</ol>
<p>If the list is empty, wait for the wallet to reach the node's tip (<code>getwalletstatus</code>).</p>

<p>Consensus requires coinbase funds to be spent to a shielded output, and Zallet has a dedicated method for that. Give it the transparent source and your own Unified Address as the destination:</p>
<pre><code>rpc z_shieldcoinbase '["&lt;your-p2pkh-address&gt;", "&lt;your-unified-address&gt;"]'</code></pre>
<p>Building a shielded transaction means creating a zero-knowledge proof, which takes real time, so the call does not wait. It returns an <strong>operation id</strong> (<code>opid-…</code>) straight away. Poll until the status is <code>success</code> or <code>failed</code>:</p>
<pre><code>rpc z_getoperationstatus '[["opid-…"]]'</code></pre>
<p>On regtest nothing is mined until you ask, so the transaction waits in the mempool. Mine ten blocks, then read the balance:</p>
<pre><code>rpc generate '[10]'
rpc z_getbalanceforaccount '["&lt;account_uuid&gt;"]'</code></pre>
<p>The reply has a <code>pools</code> object with one entry per non-empty pool, each holding a <code>valueZat</code> amount in zatoshis. Your funds should now appear under <code>ironwood</code>. Why ten blocks? Following the ZIP 315 draft, Zallet spends its own change after 3 confirmations but waits 10 before spending anything received from elsewhere.</p>
<p>Be clear about what this step revealed. A shielding transaction has a transparent input, so the source address and the amount are public on the chain. Only what happens <em>after</em> this point is private.</p>

<h2>Send to a Unified Address</h2>
<p>Create a second account to act as the recipient, and give it a shielded-only address by naming the receiver types you want:</p>
<pre><code>rpc z_getnewaccount '["recipient"]'
rpc z_getaddressforaccount '["&lt;recipient_uuid&gt;", ["orchard"]]'</code></pre>
<p>Now send. The first parameter is one of <em>your</em> addresses and selects whose funds to spend; the second is the list of payments. Choose an amount smaller than the balance you just saw:</p>
<pre><code>rpc z_sendmany '["&lt;your-unified-address&gt;", [{"address": "&lt;recipient-address&gt;", "amount": 0.01, "memo": "66697273742069726f6e776f6f64207061796d656e74"}]]'</code></pre>
<ul>
<li><strong>Amounts</strong> are decimal ZEC with at most 8 decimal places.</li>
<li><strong>Memos</strong> are hex-encoded bytes, and only shielded recipients can receive one. The example is the text "first ironwood payment"; produce your own with <code>node -e "console.log(Buffer.from('hello').toString('hex'))"</code>.</li>
<li><strong>Fees</strong> cannot be set. Zallet always computes the ZIP 317 fee.</li>
<li><strong>Privacy policy</strong> defaults to <code>FullPrivacy</code>, which only allows a transaction that stays inside a single shielded pool. This payment qualifies. Had the recipient been transparent, the call would fail with an error naming the weaker policy you must pass explicitly to accept the leak.</li>
</ul>
<p>Poll the operation as before. When it succeeds, collect the result, which contains the transaction id, then mine a block so it confirms:</p>
<pre><code>rpc z_getoperationresult '[["opid-…"]]'
rpc generate '[1]'</code></pre>
<p><code>z_getoperationresult</code> removes the finished operation from memory, so save the <code>txid</code> it gives you.</p>

<h2>Prove where it landed</h2>
<p>Ask the wallet first. In the reply, look at <code>version</code> (it should be 6), <code>fee</code>, and the <code>pool</code> field of each entry in <code>outputs</code>:</p>
<pre><code>rpc z_viewtransaction '["&lt;txid&gt;"]'</code></pre>
<p>Then ask the node, which holds no keys and sees only what the whole world sees:</p>
<pre><code>rpc getrawtransaction '["&lt;txid&gt;", 1]'
rpc getblockchaininfo</code></pre>
<p>In the decoded transaction, Zebra reports the Ironwood part of a version 6 transaction under an <code>ironwood</code> key, containing <code>actions</code> and a <code>valueBalanceZat</code>. There are no addresses and no amounts. The value balance is the net amount leaving the pool, which for a fully shielded payment is exactly the fee. In <code>getblockchaininfo</code>, the <code>valuePools</code> array has an entry with <code>"id": "ironwood"</code>; its <code>chainValueZat</code> is the total held in the pool, and it rose when you shielded.</p>

<h2>Beyond regtest</h2>
<p><strong>Testnet.</strong> The same wallet calls work on Testnet, with two differences. Funds come from a community faucet rather than mining; for example <a href="https://fauzec.com/">fauzec.com</a> advertises 1 TAZ per address every 24 hours to Unified or Sapling addresses (faucets come and go, so check it is live). And you wait for real blocks: funds from a faucet are spendable after 10 confirmations. Testnet activated NU7 in early October 2026, ahead of Mainnet, so a wallet must already know the NU7 rules to build a transaction Testnet will accept. Check your tool's changelog before you try.</p>
<p><strong>The Rust route.</strong> <code>zcash-devtool</code> covers the same ground as a light wallet: <code>wallet init</code>, <code>wallet sync</code>, <code>wallet balance</code> (which prints an "Ironwood Spendable" line), <code>wallet shield</code> and <code>wallet send</code>. The <code>send</code> command takes <code>--address</code>, <code>--value</code> in zatoshis, an optional <code>--memo</code>, and an optional <code>--tx-version</code>; left alone, it picks the version from the consensus rules at the current height. Run <code>cargo run --release -- wallet send --help</code> for the current flags, since its README warns that the command line "can and will change at any time".</p>

<h2>Try it</h2>
<p>Turn the walkthrough into a script, in Bash, TypeScript or Python. It should take a recipient address and an amount, call <code>z_sendmany</code>, poll <code>z_getoperationstatus</code> once a second until the operation finishes, print the transaction id, mine one block, and finally print the <code>pool</code> of each output from <code>z_viewtransaction</code>. Run it twice: once to a shielded-only address, and once to a transparent address. Read the error from the second run and work out which <code>privacy_policy</code> value it is asking for. This script is the core of this week's lab.</p>

<h2>Key takeaways</h2>
<ul>
<li>The Zallet flow is: <code>z_getnewaccount</code>, <code>z_getaddressforaccount</code>, receive, <code>z_sendmany</code>, poll the operation id, <code>z_viewtransaction</code>.</li>
<li>On regtest you fund a wallet with <code>generatetoaddress</code>, wait 100 blocks for the coinbase to mature, and shield it with <code>z_shieldcoinbase</code>.</li>
<li>There is no Ironwood address type: paying the Orchard receiver of a Unified Address creates an Ironwood output in a version 6 transaction.</li>
<li>Verify from both sides: the wallet's <code>pool</code> fields, and the node's <code>ironwood</code> transaction data and <code>valuePools</code> total.</li>
<li>Shielding reveals the transparent source and amount. A payment inside Ironwood reveals neither addresses nor amounts; the fee is public.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zcash.github.io/zallet/">The Zallet Book</a> — "Sending your first transaction", "Notes, confirmations, and fees", "Asynchronous operations", and the JSON-RPC method reference</li>
<li><a href="https://github.com/zcash/zallet">zcash/zallet</a> — CHANGELOG.md for which release added which method</li>
<li><a href="https://github.com/ZcashFoundation/zebra">ZcashFoundation/zebra</a> — <code>zebra-rpc/src/methods.rs</code> documents <code>generate</code>, <code>generatetoaddress</code> and <code>getrawtransaction</code></li>
<li><a href="https://github.com/ZcashFoundation/z3">ZcashFoundation/z3</a> — <code>docs/regtest.md</code></li>
<li><a href="https://zips.z.cash/zip-0317">ZIP 317: Proportional Transfer Fee Mechanism</a></li>
<li><a href="https://github.com/zcash/zcash-devtool">zcash/zcash-devtool</a> — <code>doc/walkthrough.md</code> and <code>src/commands/wallet/send.rs</code></li>
</ul>`,
  },
  "l-02-04": {
    title: "Reading Blockchain State via RPC",
    subtitle: "Query a Zebra node over JSON-RPC for blocks, transactions, per-pool totals including Ironwood, and the current standard fee.",
    content: `<p>A wallet tells you about <em>your</em> funds. A node tells you about the chain: how tall it is, what is in a block, whether a transaction has been mined, how much value sits in each pool. Zebra answers these questions over <strong>JSON-RPC</strong>: named methods called by posting JSON over HTTP. Explorers, indexers and payment back-ends are built on these calls, and so is the confirmation tracking you will write next week.</p>
<p>Zebra implements a subset of the old <code>zcashd</code> node's RPC interface, with the same method names. It has no wallet, so wallet methods belong to Zallet.</p>

<h2>Connecting: port, enabling, authentication</h2>
<p>In a stand-alone <code>zebrad</code>, the RPC server is <strong>disabled by default</strong>. You turn it on by giving it a listen address in the config file:</p>
<pre><code>[rpc]
listen_addr = '127.0.0.1:8232'</code></pre>
<p>The recommended ports are 8232 on Mainnet and 18232 on Testnet. Z3 enables the server for you on those ports, and on 29232 for regtest.</p>
<p>By default Zebra protects the endpoint with <strong>cookie authentication</strong>. When the RPC server starts it writes a file named <code>.cookie</code> into its cache directory and deletes it at shutdown. The file holds one line, a username and a random password separated by a colon:</p>
<pre><code>__cookie__:YwDDuaGzvtEmWG6KWnhgd9gilo5mKdi6m38v__we3Ko=</code></pre>
<p>You send that pair as HTTP Basic credentials. With Z3 on Mainnet or Testnet the cookie lives in a Docker volume:</p>
<pre><code>COOKIE="$(docker run --rm -v z3-testnet-cookie:/auth:ro alpine cat /auth/.cookie)"

curl -s -u "$COOKIE" -X POST -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"getblockcount","params":[]}' \\
  http://127.0.0.1:18232</code></pre>
<p>Your regtest stack has cookie authentication switched off: drop <code>-u</code> and use port 29232.</p>
<blockquote>Keep the RPC port on localhost. Zebra's configuration docs warn that if you bind it to a public IP address, anyone on the internet can send transactions through your node and query its state.</blockquote>

<h2>The shape of a call</h2>
<p>Every request is an HTTP POST with four JSON fields: the protocol version, an <code>id</code> you choose (echoed back in the reply), the <code>method</code> name, and a <code>params</code> array of positional arguments. Every reply carries either a <code>result</code> or an <code>error</code> with a numeric <code>code</code> and a <code>message</code>:</p>
<pre><code>curl -s -X POST -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"getblock","params":["1", 1]}' \\
  http://127.0.0.1:29232

# Asking for a block that does not exist:
# {"jsonrpc":"2.0","id":1,"error":{"code":-8,"message":"the requested block is not in the main chain"}}</code></pre>
<p>Note that <code>getblock</code> takes its first argument as a <em>string</em>, whether you pass a height or a hash.</p>

<h2>The methods you will use most</h2>
<table>
<thead><tr><th>Method</th><th>Parameters</th><th>Returns</th></tr></thead>
<tbody>
<tr><td><code>getblockchaininfo</code></td><td>none</td><td>Chain name, height, best block hash, per-pool totals, network upgrade status</td></tr>
<tr><td><code>getblockcount</code></td><td>none</td><td>Height of the best chain tip</td></tr>
<tr><td><code>getblockhash</code></td><td><code>index</code> (number; -1 means the latest block)</td><td>Hash of the block at that height</td></tr>
<tr><td><code>getblock</code></td><td><code>hash_or_height</code> (string), <code>verbosity</code> (0 hex, 1 JSON, 2 JSON with transactions, 3 adds input details and fees; default 1)</td><td>The block</td></tr>
<tr><td><code>getrawtransaction</code></td><td><code>txid</code>, <code>verbose</code> (0 hex, otherwise JSON)</td><td>A transaction, as hex or decoded JSON</td></tr>
<tr><td><code>getrawmempool</code></td><td>optional <code>verbose</code></td><td>Ids of unmined transactions the node holds</td></tr>
<tr><td><code>getaddressbalance</code>, <code>getaddressutxos</code>, <code>getaddresstxids</code></td><td>an object with an <code>addresses</code> array</td><td>Data for <strong>transparent</strong> addresses only</td></tr>
<tr><td><code>sendrawtransaction</code></td><td>hex-encoded transaction</td><td>Its id, once accepted into the mempool</td></tr>
<tr><td><code>getstandardfee</code></td><td>none</td><td>Recommended fee per logical action</td></tr>
<tr><td><code>getdeprecationinfo</code></td><td>none</td><td>The height at which this Zebra release stops running (Mainnet)</td></tr>
</tbody>
</table>
<p>No node method returns the balance of a shielded address: the node cannot see it. For that you need a viewing key and a wallet that scans with it. The full method list for your version is the <code>Rpc</code> trait in <code>zebra-rpc/src/methods.rs</code>, or <code>rpc.discover</code> on a running node.</p>

<h2>Pool totals, including Ironwood</h2>
<p><code>getblockchaininfo</code> includes a <code>valuePools</code> array with one entry per value pool. This is the shape, taken from Zebra's own test snapshots (the numbers there are from a ten-block test chain):</p>
<pre><code>"valuePools": [
  { "id": "transparent", "chainValue": 0.034375, "chainValueZat": 3437500, "monitored": true },
  { "id": "sprout",      "chainValue": 0.0, "chainValueZat": 0, "monitored": false },
  { "id": "sapling",     "chainValue": 0.0, "chainValueZat": 0, "monitored": false },
  { "id": "orchard",     "chainValue": 0.0, "chainValueZat": 0, "monitored": false },
  { "id": "lockbox",     "chainValue": 0.0, "chainValueZat": 0, "monitored": false },
  { "id": "ironwood",    "chainValue": 0.0, "chainValueZat": 0, "monitored": false }
]</code></pre>
<p><code>chainValueZat</code> is the total held in that pool in zatoshis (1 ZEC = 100,000,000 zatoshis); <code>chainValue</code> is the same figure in ZEC. These are the turnstile totals: consensus rejects any block that would push a pool's total below zero, so anyone can check that a shielded pool has not paid out more than it took in. The node can publish them because amounts <em>crossing</em> a pool boundary are public.</p>
<p>With verbosity 1 or higher, <code>getblock</code> returns the same array with two extra fields, <code>valueDelta</code> and <code>valueDeltaZat</code>: how much each pool changed in that block. That lets you point at the exact block where your shielding transaction moved value into Ironwood.</p>

<h2>Asking for the fee</h2>
<p>Zcash fees follow ZIP 317: a transaction pays a fixed amount per <strong>logical action</strong> (roughly, per input or output), with a minimum of two actions. Do not hardcode that amount. It is changing, and the node will tell you:</p>
<pre><code>curl -s -X POST -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"getstandardfee","params":[]}' \\
  http://127.0.0.1:29232</code></pre>
<p>The result has two fields: <code>standard_fee</code>, in zatoshis per logical action, and <code>version</code>, currently 0. As of October 2026 the convention is moving from 5,000 to 1,000 zatoshis per action, a wallet and relay-policy change rather than a consensus rule. Zebra 7.0.0-rc.0 reports 5,000 on Mainnet until the next block is height 3,590,000 and 1,000 from then on, so that wallets switch together; on test networks it reports 1,000. Older releases answer differently (the method first appeared in Zebra 6.1.0, reporting 5,000), so what you see on regtest depends on the Zebra version your stack pins.</p>

<h2>Try it</h2>
<p>Save this as <code>pools.mjs</code> and run it with <code>node pools.mjs</code> against your regtest node:</p>
<pre><code>// pools.mjs - print Zcash value pool totals from a Zebra node (Node.js 18+).
const URL = process.env.ZEBRA_RPC ?? 'http://127.0.0.1:29232';

async function rpc(method, params = []) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const body = await res.json();
  if (body.error) throw new Error(\`\${method}: \${body.error.code} \${body.error.message}\`);
  return body.result;
}

const info = await rpc('getblockchaininfo');
console.log(\`chain \${info.chain}, height \${info.blocks}\`);
for (const pool of info.valuePools) {
  console.log(pool.id.padEnd(12), String(pool.chainValueZat).padStart(18), 'zatoshis');
}

const fee = await rpc('getstandardfee');
console.log(\`standard fee: \${fee.standard_fee} zatoshis per logical action\`);</code></pre>
<p>Then extend it: take a transaction id as an argument, fetch it with <code>getrawtransaction</code> (verbose), and print its <code>confirmations</code> and whether it has an <code>ironwood</code> section. Try it on the transaction you sent in the previous lesson.</p>

<h2>Key takeaways</h2>
<ul>
<li>Zebra's JSON-RPC is off by default in a bare <code>zebrad</code>, listens on 8232 (Mainnet) or 18232 (Testnet) by convention, and uses cookie authentication unless you disable it.</li>
<li>A call is a POST of <code>{"jsonrpc","id","method","params"}</code>; a reply has <code>result</code> or <code>error</code>.</li>
<li><code>getblockchaininfo</code> reports every pool's total in <code>valuePools</code>, including <code>ironwood</code>; <code>getblock</code> adds the per-block change.</li>
<li>A node can report transparent address balances and pool totals, but never a shielded address's balance.</li>
<li>Ask <code>getstandardfee</code> instead of hardcoding a fee: the per-action fee is in transition from 5,000 to 1,000 zatoshis.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://github.com/ZcashFoundation/zebra">ZcashFoundation/zebra</a> — <code>zebra-rpc/src/methods.rs</code> (the RPC trait and its doc comments), <code>zebra-rpc/src/config/rpc.rs</code>, CHANGELOG.md</li>
<li><a href="https://zebra.zfnd.org/">The Zebra Book</a> — the mining and Docker pages describe cookie authentication</li>
<li><a href="https://github.com/ZcashFoundation/z3">ZcashFoundation/z3</a> — <code>docs/integrations/host-side-pointer.md</code> (ports and reading the cookie)</li>
<li><a href="https://zips.z.cash/zip-0317">ZIP 317: Proportional Transfer Fee Mechanism</a></li>
<li><a href="https://github.com/zcash/zips/pull/1352">zcash/zips pull request 1352</a> — the fee reduction and its deployment schedule</li>
</ul>`,
  },
  "l-02-05": {
    title: "ZIP-321: Payment URIs",
    subtitle: "Build and parse a zcash: payment request that carries an address, an amount and a memo, and know the rules a correct parser must enforce.",
    content: `<p>Asking someone to pay you by copying an address, an amount and a memo invites mistakes. <strong>ZIP 321</strong> ("Payment Request URIs", status Active) defines one string that carries all three, so a wallet can build the transaction from a link or QR code and the person only approves it. Your payment gateway will issue these next week, and <code>zcash-devtool</code> accepts one through <code>wallet pay --payment-uri</code>.</p>

<h2>The format</h2>
<p>A payment request is the scheme <code>zcash:</code>, then an address, then optional query parameters. This is the first valid example in the ZIP itself, a request for 1 ZEC to a Testnet Sapling address:</p>
<pre><code>zcash:ztestsapling10yy2ex5dcqkclhc7z7yrnjq2z6feyjad56ptwlfgmy77dmaqqrl9gyhprdx59qgmsnyfska2kez?amount=1&amp;memo=VGhpcyBpcyBhIHNpbXBsZSBtZW1vLg&amp;message=Thank%20you%20for%20your%20purchase</code></pre>
<table>
<thead><tr><th>Parameter</th><th>Meaning</th><th>Encoding</th></tr></thead>
<tbody>
<tr><td><code>address</code></td><td>A transparent, Sapling or Unified Address. Sprout addresses must not be supported.</td><td>Letters and digits only</td></tr>
<tr><td><code>amount</code></td><td>The amount in decimal ZEC</td><td>Digits, optionally a <code>.</code> and 1 to 8 more digits</td></tr>
<tr><td><code>memo</code></td><td>Contents of the shielded memo field, at most 512 bytes once decoded</td><td>base64url, no <code>=</code> padding</td></tr>
<tr><td><code>message</code></td><td>Text the wallet may show the payer to describe the payment</td><td>Percent-encoded</td></tr>
<tr><td><code>label</code></td><td>A name for the address, shown separately from the address itself</td><td>Percent-encoded</td></tr>
</tbody>
</table>
<p>The <code>memo</code> goes on the chain, encrypted to the recipient. The <code>message</code> and <code>label</code> never leave the payer's wallet.</p>

<h2>Several payments in one request</h2>
<p>A request can ask for one transaction that pays several recipients. Each payment gets a <strong>parameter index</strong>: a suffix such as <code>.1</code> (up to four digits) on every parameter that belongs to it. The first payment uses no suffix. With more than one payment, the addresses are given as <code>address</code> parameters in the query string, as in the ZIP's second example:</p>
<pre><code>zcash:?address=tmEZhbWHTpdKMw5it8YDspUXSMGQyFwovpU&amp;amount=123.456&amp;address.1=ztestsapling10yy2ex5dcqkclhc7z7yrnjq2z6feyjad56ptwlfgmy77dmaqqrl9gyhprdx59qgmsnyfska2kez&amp;amount.1=0.789&amp;memo.1=VGhpcyBpcyBhIHVuaWNvZGUgbWVtbyDinKjwn6aE8J-PhvCfjok</code></pre>
<p>Parameter order has no meaning, and indices need not be consecutive, but <code>.0</code> and leading zeros are forbidden.</p>

<h2>Rules a parser must enforce</h2>
<ul>
<li><strong>Amounts are strict.</strong> <code>50</code>, <code>50.00</code> and <code>0.5</code> are valid. <code>50,000.00</code>, <code>50.</code>, <code>.5</code> and <code>0.123456789</code> (nine decimals) are not. Nothing above 21000000 is allowed.</li>
<li><strong>Memos use base64url</strong>, where the last two characters of the alphabet are <code>-</code> and <code>_</code>. The characters <code>+</code>, <code>/</code> and <code>=</code> from ordinary base64 must be rejected.</li>
<li><strong>A memo for a transparent address invalidates the whole URI</strong>, because transparent outputs cannot carry one.</li>
<li><strong>Every indexed parameter needs an address at the same index</strong>, and no parameter may appear twice at one index.</li>
<li><strong>Percent-encoding is allowed only in <code>message</code>, <code>label</code> and unknown parameter values.</strong> <code>amount=1%30</code> is invalid, and so is <code>zcash://…</code>.</li>
<li><strong>Unrecognised parameters starting with <code>req-</code> make the URI invalid; other unknown parameters are ignored.</strong> The ZIP already defines one, <code>req-asset</code>, for Custom Assets. If your code does not implement it, rejecting the request is correct.</li>
</ul>
<blockquote>Never do money arithmetic in floating point. Convert the decimal string straight to an integer number of zatoshis (1 ZEC = 100,000,000 zatoshis), as the code below does with <code>BigInt</code>.</blockquote>

<h2>Building and parsing in JavaScript</h2>
<p>This module needs only Node.js 18 or later. It checks the URI grammar but does not decode addresses, so it cannot apply the transparent-memo rule or tell Mainnet from Testnet. In Rust, use the <code>zip321</code> crate.</p>
<pre><code>// zip321.mjs - build and parse ZIP 321 payment URIs (Node.js 18+).
// It checks the URI grammar. It does not decode or validate the addresses.
const ZAT = 100_000_000n; // zatoshis per ZEC
const QCHAR = /^(?:[A-Za-z0-9\\-._~!$'()*+,;:@]|%[0-9A-Fa-f]{2})*$/;

export function zecToZat(text) {
  if (!/^\\d+(\\.\\d{1,8})?$/.test(text)) throw new Error(\`invalid amount: \${text}\`);
  const [whole, frac = ''] = text.split('.');
  const zat = BigInt(whole) * ZAT + BigInt(frac.padEnd(8, '0'));
  if (zat &gt; 21_000_000n * ZAT) throw new Error('amount exceeds 21000000 ZEC');
  return zat;
}

export function zatToZec(zat) {
  const frac = String(zat % ZAT).padStart(8, '0').replace(/0+$/, '');
  return frac ? \`\${zat / ZAT}.\${frac}\` : \`\${zat / ZAT}\`;
}

export function buildPaymentUri(payments) {
  const single = payments.length === 1;
  const params = [];
  payments.forEach((p, i) =&gt; {
    const idx = i === 0 ? '' : \`.\${i}\`;
    if (!single) params.push(\`address\${idx}=\${p.address}\`);
    if (p.amountZat !== undefined) params.push(\`amount\${idx}=\${zatToZec(p.amountZat)}\`);
    if (p.memo !== undefined) {
      const bytes = Buffer.from(p.memo, 'utf8');
      if (bytes.length &gt; 512) throw new Error('memo exceeds 512 bytes');
      params.push(\`memo\${idx}=\${bytes.toString('base64url')}\`);
    }
    if (p.message !== undefined) params.push(\`message\${idx}=\${encodeURIComponent(p.message)}\`);
  });
  return \`zcash:\${single ? payments[0].address : ''}\${params.length ? '?' + params.join('&amp;') : ''}\`;
}

export function parsePaymentUri(uri) {
  const m = /^zcash:([A-Za-z0-9]*)(?:\\?(.*))?$/s.exec(uri);
  if (!m) throw new Error('not a ZIP 321 URI');
  const found = new Map(); // paramindex -&gt; payment
  const put = (i, key, value) =&gt; {
    if (!found.has(i)) found.set(i, {});
    if (key in found.get(i)) throw new Error(\`duplicate \${key} at index \${i}\`);
    found.get(i)[key] = value;
  };
  if (m[1]) put(0, 'address', m[1]);
  for (const pair of (m[2] ?? '').split('&amp;').filter(Boolean)) {
    const q = /^([A-Za-z][A-Za-z0-9+-]*)(?:\\.([1-9][0-9]{0,3}))?(?:=(.*))?$/s.exec(pair);
    if (!q) throw new Error(\`invalid parameter: \${pair}\`);
    const [, name, idx, value = ''] = q;
    const i = Number(idx ?? 0);
    if (name === 'address' &amp;&amp; /^[A-Za-z0-9]+$/.test(value)) put(i, 'address', value);
    else if (name === 'amount') put(i, 'amountZat', zecToZat(value));
    else if (name === 'memo' &amp;&amp; /^[A-Za-z0-9_-]{0,683}$/.test(value)) put(i, 'memo', Buffer.from(value, 'base64url'));
    else if ((name === 'label' || name === 'message') &amp;&amp; QCHAR.test(value)) put(i, name, decodeURIComponent(value));
    else if (['address', 'memo', 'label', 'message'].includes(name) || name.startsWith('req-')) {
      throw new Error(\`invalid or unsupported parameter: \${pair}\`);
    } // any other unknown parameter is ignored
  }
  if (found.size === 0) throw new Error('no payments in request');
  for (const [i, p] of found) if (!p.address) throw new Error(\`payment \${i} has no address\`);
  return [...found].sort(([a], [b]) =&gt; a - b).map(([index, p]) =&gt; ({ index, ...p }));
}</code></pre>
<p>Using it reproduces the ZIP's example exactly:</p>
<pre><code>import { buildPaymentUri, parsePaymentUri, zecToZat } from './zip321.mjs';

const uri = buildPaymentUri([{
  address: 'ztestsapling10yy2ex5dcqkclhc7z7yrnjq2z6feyjad56ptwlfgmy77dmaqqrl9gyhprdx59qgmsnyfska2kez',
  amountZat: zecToZat('1'),
  memo: 'This is a simple memo.',
  message: 'Thank you for your purchase',
}]);
console.log(uri);

const [payment] = parsePaymentUri(uri);
console.log(payment.amountZat, payment.memo.toString('utf8'), '|', payment.message);</code></pre>
<pre><code>zcash:ztestsapling10yy2ex5dcqkclhc7z7yrnjq2z6feyjad56ptwlfgmy77dmaqqrl9gyhprdx59qgmsnyfska2kez?amount=1&amp;memo=VGhpcyBpcyBhIHNpbXBsZSBtZW1vLg&amp;message=Thank%20you%20for%20your%20purchase
100000000n This is a simple memo. | Thank you for your purchase</code></pre>

<h2>Try it</h2>
<p>Feed <code>parsePaymentUri</code> every example in the "Invalid Examples" section of ZIP 321. Each should throw; note which rule each breaks. Then build a request for the shielded-only address you created in lesson 3, for 0.01 ZEC with the memo "order 1001". In the lab you will accept a URI like this on the command line and turn it into a <code>z_sendmany</code> call.</p>

<h2>Key takeaways</h2>
<ul>
<li>A ZIP 321 request is <code>zcash:&lt;address&gt;?amount=…&amp;memo=…&amp;message=…</code>; <code>amount</code> is decimal ZEC with at most 8 decimal places.</li>
<li><code>memo</code> is base64url without padding and at most 512 bytes; <code>message</code> and <code>label</code> are percent-encoded and stay in the wallet.</li>
<li>Multiple payments use indexed parameters (<code>address.1</code>, <code>amount.1</code>) and are meant to be paid in a single transaction.</li>
<li>Reject what you cannot parse, including any unknown <code>req-</code> parameter; ignore other unknown parameters.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zips.z.cash/zip-0321">ZIP 321: Payment Request URIs</a> — the grammar, the rules and all the examples used here</li>
<li><a href="https://docs.rs/zip321/">The zip321 crate on docs.rs</a> — the Rust implementation in librustzcash</li>
<li><a href="https://zips.z.cash/zip-0316">ZIP 316: Unified Addresses and Unified Viewing Keys</a></li>
<li><a href="https://github.com/zcash/zcash-devtool">zcash/zcash-devtool</a> — <code>src/commands/wallet/pay.rs</code> pays a ZIP 321 request</li>
</ul>`,
  },
  "l-02-06": {
    title: "ZIP 315: Confirmations, Balances and Transaction Status",
    subtitle: "Apply the draft wallet rules for trusted and untrusted outputs, spendable and pending balances, and reporting a payment's progress.",
    content: `<p>"Has the payment gone through?" has more than one honest answer. A transaction can be waiting to be mined, mined but shallow, deep enough to rely on, or expired without ever being mined. A wallet or a merchant back-end has to turn those states into something a person can act on.</p>
<p>The reference is <strong>ZIP 315, "Best Practices for Wallet Implementations"</strong>. It is a <strong>Draft</strong>, with open questions and TODO notes in its text, and it is much broader than transaction status: it also covers wallet seeds, address management, auto-shielding and information leakage. This lesson takes the parts about confirmations, balances and reporting, which Zallet's defaults already follow.</p>

<h2>Trusted and untrusted outputs</h2>
<p>ZIP 315 uses <strong>TXO</strong> (transaction output) for a transparent coin or shielded note your wallet can see. A TXO with <em>n</em> confirmations sits in a block with <em>n</em> − 1 blocks on top of it. Until a block is buried, a chain reorganisation can replace it and a payment inside it can disappear. The ZIP separates two cases:</p>
<ul>
<li>A <strong>trusted TXO</strong> comes from a party the wallet trusts to leave it mined, in practice outputs of transactions the wallet created itself, such as change.</li>
<li>An <strong>untrusted TXO</strong> is anything else the wallet receives.</li>
</ul>
<p>Its recommended policy is <strong>3 confirmations for trusted TXOs and 10 for untrusted TXOs</strong>, and wallets should not let users spend anything with fewer than 3 (with narrow exceptions, such as transparent funds being shielded). Three, because "anecdotally, reorgs are usually less than three blocks". More for untrusted funds, because the value of a trusted TXO "should always be recoverable" after a rollback, whereas recovering a payment from someone else "may require the user to request that funds are re-sent".</p>
<p>These numbers count blocks, not minutes. On Mainnet in October 2026, with a 75-second block target, 10 confirmations is about 12.5 minutes. NU7 is planned to cut the target to 25 seconds, which would make the same 10 blocks about 4 minutes.</p>

<h2>Spendable is narrower than received</h2>
<table>
<thead><tr><th>Term in ZIP 315</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td>Known-spendable</td><td>Unspent at the wallet's (up-to-date) view of the chain tip, not already committed to another unexpired transaction from this wallet, and the wallet can authorise the spend</td></tr>
<tr><td>Confirmed-spendable</td><td>Known-spendable, the wallet has the data needed to spend it, and it has the required confirmations for its trust level</td></tr>
<tr><td>Unconfirmed-spendable</td><td>Known-spendable but not yet confirmed-spendable</td></tr>
</tbody>
</table>
<p>The rule that follows is a MUST: a wallet must not try to spend a TXO that is not confirmed-spendable in a transaction the user starts. That is why, in lesson 3, you mined more blocks before spending.</p>

<h2>What to show: balances</h2>
<p>A single "balance" number hides the distinction above, so the ZIP asks wallets to report:</p>
<ul>
<li>the <strong>confirmed-spendable balance</strong>: the sum of confirmed-spendable TXOs; and</li>
<li>either the <strong>pending balance</strong> (the sum of unconfirmed-spendable TXOs) or the <strong>total</strong> (the two added together).</li>
</ul>
<p>A wallet may also report an <strong>un-economic balance</strong>: outputs each worth less than the ZIP 317 marginal fee (the per-action fee from lesson 4).</p>

<h2>What to show: transactions</h2>
<p>ZIP 315 does not define a list of status names. It says what to report:</p>
<ul>
<li><strong>Incoming</strong> transactions, with their number of confirmations.</li>
<li><strong>Sent</strong> transactions, with their number of confirmations and, if they are unmined and have an expiry height, an estimate of how long until they expire.</li>
</ul>
<p><strong>Expiry</strong> comes from ZIP 203: a transaction carries an expiry height, and if it has not been mined by then it is dropped from the mempool. The default is 40 blocks from the current height, about 50 minutes at 75-second blocks; for NU7 the recommendation becomes 120 blocks, still about 50 minutes. The notes an expired transaction would have spent become spendable again.</p>
<p>Zallet's <code>z_viewtransaction</code> reports a <code>status</code> of <code>waiting</code>, <code>expiringsoon</code>, <code>mined</code> or <code>expired</code>, alongside <code>confirmations</code> and <code>expiryheight</code>. You can build a customer-facing label from those:</p>
<pre><code>// Classify a payment from z_viewtransaction's "status" and "confirmations".
// The labels and the threshold are this course's choice, not part of ZIP 315.
function paymentState(tx, required = 10) {
  if (tx.status === 'expired') return 'expired: not mined before its expiry height';
  if (tx.status !== 'mined') return 'pending: not in a block yet';
  if (tx.confirmations &lt; required) return \`confirming: \${tx.confirmations} of \${required}\`;
  return 'confirmed';
}</code></pre>
<blockquote>Test the <code>status</code> field rather than checking for zero confirmations. In the Zallet source at the time of writing, an unmined transaction reports <code>confirmations: -1</code> whether or not it is in the mempool.</blockquote>

<h2>Try it</h2>
<p>On regtest, send a payment with your script from lesson 3 but do <em>not</em> mine a block. Call <code>z_viewtransaction</code> and record <code>status</code>, <code>confirmations</code> and <code>expiryheight</code>. Mine one block and look again; mine nine more and look again. Write one sentence a checkout page could show a customer at each of the three stages.</p>

<h2>Key takeaways</h2>
<ul>
<li>ZIP 315 is titled "Best Practices for Wallet Implementations" and is a Draft; transaction and balance reporting is one part of it.</li>
<li>Recommended policy: 3 confirmations for trusted outputs (your own change), 10 for untrusted ones (everything received from others).</li>
<li>Report a confirmed-spendable balance separately from pending funds, and never spend what is not confirmed-spendable.</li>
<li>Show sent transactions with confirmations and time to expiry; the default expiry is 40 blocks after creation (ZIP 203).</li>
<li>Confirmation counts are in blocks. Their meaning in minutes changes when the block target changes.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zips.z.cash/zip-0315">ZIP 315: Best Practices for Wallet Implementations</a> (Draft)</li>
<li><a href="https://zips.z.cash/zip-0203">ZIP 203: Transaction Expiry</a></li>
<li><a href="https://zips.z.cash/zip-0317">ZIP 317: Proportional Transfer Fee Mechanism</a></li>
<li><a href="https://zcash.github.io/zallet/">The Zallet Book</a> — "Notes, confirmations, and fees" and the <code>z_viewtransaction</code> reference</li>
<li><a href="https://github.com/zcash/zips/issues/447">zcash/zips issue 447</a> — the discussion thread for ZIP 315</li>
</ul>`,
  },
}
