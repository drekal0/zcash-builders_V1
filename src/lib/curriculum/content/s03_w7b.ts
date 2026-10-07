// AUTO-GENERATED from scratchpad lesson fragments. Do not edit by hand.
// Each entry: lesson id -> { title, subtitle, content (HTML) }.
import type { LessonContent } from './types'

export const M_s03_w7b: Record<string, LessonContent> = {
  "l-03-15": {
    title: "Post-zcashd Infrastructure: Zaino Architecture",
    subtitle: "Explain why indexing was split from validation, how Zaino reads from Zebra, and the finalised vs non-finalised state it serves.",
    content: `<p>For most of Zcash's history one program did everything: <code>zcashd</code> validated the chain, held a wallet, and answered the queries that wallets and block explorers asked. That program reached end of support and halted at Mainnet height 3,417,100 on 18 July 2026; it does not understand the Ironwood upgrade and is now history. The work it did has been split across separate Rust programs. You met Zaino conceptually in Week 4 and have run it on regtest since Week 5. This lesson looks at <em>why</em> the split happened and how Zaino is put together, so that when you run it next lesson and build against it later you know what each piece is responsible for.</p>
<p><strong>Zaino</strong> is the indexer: Zingo Labs' Rust program that serves blockchain data to the clients that are not miners — light wallets, full wallets, and block explorers — by reading from a Zebra full node. It is pre-1.0 and moving quickly, so treat version numbers and exact defaults as things to check against the repository, not memorise.</p>

<h2>Why separate indexing from validation</h2>
<p>A full node like Zebra has one job: download blocks, check every consensus rule, and decide what the valid chain is. An <strong>indexer</strong> has a different job: take that validated data and answer questions efficiently — "give me the compact blocks from height X to the tip", "what is the note commitment tree at this block", "stream me the mempool". Building both into one process was what <code>zcashd</code> did, and Zaino's own README gives the reasons for pulling them apart. Removing indexing from the validator keeps the validator "smaller and more maintainable". It unifies indexing in one place instead of two (the old full node served explorers and full wallets; a separate program, lightwalletd, served light wallets). Most importantly it creates "a clear trust boundary between the Indexer and Validator": the validator decides truth, and the indexer takes on the job of serving it.</p>
<p>That boundary matters for privacy. The indexer is the server a wallet talks to, so it is the party that can see a client's IP address and request pattern — the "honest but curious" server of ZIP 307. Keeping it a distinct component lets the ecosystem reason about it, and in future put anonymising transports such as Tor or Nym in front of it.</p>

<h2>How Zaino reads from Zebra</h2>
<p>Zebra was designed to be read from. Its README describes a <strong>ReadStateService</strong> that gives "direct read access to the finalized state and RPC access to the non-finalized state". Zaino can connect to Zebra in two ways, which its library exposes as two interchangeable backends:</p>
<table>
<thead><tr><th>Backend</th><th>How it reaches Zebra</th><th>Trade-off</th></tr></thead>
<tbody>
<tr><td><code>FetchService</code> (<code>backend = "fetch"</code>)</td><td>Over Zebra's JSON-RPC endpoint</td><td>Works across a network boundary; Zebra and Zaino can be separate processes talking over a port</td></tr>
<tr><td><code>StateService</code></td><td>Directly through Zebra's <code>ReadStateService</code></td><td>"Highly efficient … tailored to run with ZebraD", but both must run on the same hardware</td></tr>
</tbody>
</table>
<p>The Z3 stack you will run next lesson configures the JSON-RPC backend: its Zaino config file sets <code>backend = "fetch"</code> and points Zaino at Zebra's RPC port. That is the arrangement this programme teaches. (Zaino's library is written so new backends can be added without changing what clients see; its docs list planned Tonic, Darkside and Nym services. Which backend a given deployment uses is a configuration choice, so check the config rather than assuming.)</p>

<h2>Finalised and non-finalised state</h2>
<p>Zebra keeps two kinds of state, and Zaino serves both. Blocks near the tip can still be reorganised if a competing chain wins, so they are <strong>non-finalised</strong> and held in memory. Zebra bounds how deep a reorganisation it will follow with a constant, <code>MAX_BLOCK_REORG_HEIGHT</code>, which is <strong>1,000 blocks</strong> as of October 2026 (it was raised from 99). Blocks more than 1,000 deep are treated as <strong>finalised</strong> and committed to durable storage.</p>
<p>Zaino mirrors this division internally. One subsystem owns the finalised state (a durable store, a single chain from genesis down to a "watermark"); another owns the non-finalised chain head and, as its spec puts it, "handles reorgs and updates to the best chain", along with the mempool. As a builder the practical consequence is the one every explorer must respect: data within the last 1,000 blocks can change, data below that cannot. You will design around that in the explorer-backend lesson.</p>

<h2>Where Zaino fits in the stack</h2>
<p>Zaino is not the only program that reads Zebra, and it is worth being precise about who uses what. The Z3 README's architecture diagram shows three pieces:</p>
<ul>
<li><strong>Zebra</strong> — the full node. Validates and syncs; has no wallet.</li>
<li><strong>Zallet</strong> — the full-node wallet (in beta) that replaces the old <code>zcashd</code> wallet. It does not talk to the standalone Zaino service; instead it <em>embeds Zaino's indexer libraries</em> and connects straight to Zebra's JSON-RPC. In Z3 this is the <code>zallet-zaino</code> binary.</li>
<li><strong>Zaino</strong> — the standalone indexer service, optional in Z3, that exposes a gRPC interface to external light-wallet clients.</li>
</ul>
<p>So "Zaino" names both a running service and a set of libraries. A wallet backend might run the service; Zallet reuses the libraries in-process.</p>
<blockquote>lightwalletd, the original Go light-client server, is <strong>not</strong> dead — it was still receiving commits in late September 2026 and Zebra's book still documents running it. Zaino is the Rust indexer that implements the same gRPC API and is what the Z3 stack ships, which is why this programme teaches it.</blockquote>
<p>Other indexers exist. The Zcash Foundation has <strong>Zinder</strong> (<code>github.com/ZcashFoundation/zinder</code>), a chain-data and indexing service with lightwalletd compatibility. Zebra itself also has an <em>experimental</em> built-in CompactTxStreamer server with no TLS and no auth. For this programme, Zaino behind Z3 is the thing you run.</p>

<h2>Try it</h2>
<p>Open the Zaino repository (<code>github.com/zingolabs/zaino</code>) and read the "Project Structure" section of its README. Find the two crates that correspond to the finalised and non-finalised halves described above (hint: one name contains <code>chain-store</code>, the other <code>chain-head</code>). Write one sentence for each saying what it owns. Then find the sentence in the README that states the reason for separating validation from indexing, and note it in your own words — you will use this framing when you justify the stack in your lab write-up.</p>

<h2>Key takeaways</h2>
<ul>
<li>Indexing was split out of the validator so the node stays small, serving is unified in one place, and there is a clear trust boundary between the party that decides truth (Zebra) and the party that serves it (Zaino).</li>
<li>Zaino reads from Zebra either over JSON-RPC (the <code>fetch</code> backend, which Z3 uses) or directly through Zebra's ReadStateService (the same-hardware <code>state</code> backend).</li>
<li>Zebra keeps non-finalised state for the last 1,000 blocks (<code>MAX_BLOCK_REORG_HEIGHT</code>) and finalised state below that; Zaino serves both, plus the mempool.</li>
<li>Zallet embeds Zaino's libraries in-process rather than calling the standalone service; "Zaino" is both a service and a library set.</li>
<li>lightwalletd is still maintained; Zaino is the Rust indexer serving the same API and is what Z3 ships. Zinder is a separate Foundation indexer.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://github.com/zingolabs/zaino">Zaino: README (motivations, project structure) and docs/use_cases.md (backends)</a></li>
<li><a href="https://github.com/ZcashFoundation/z3">Z3: README architecture diagram and the "Which indexer does Z3 use" FAQ</a></li>
<li><a href="https://github.com/ZcashFoundation/zebra">Zebra: zebra-state constants (MAX_BLOCK_REORG_HEIGHT) and the ReadStateService</a></li>
<li><a href="https://github.com/ZcashFoundation/zinder">Zinder: Zcash Foundation indexing service</a></li>
<li><a href="https://github.com/zcash/lightwalletd">lightwalletd: the original Go light-client server</a></li>
</ul>`,
  },
  "l-03-16": {
    title: "Running Zaino with Docker Compose (Z3 Stack)",
    subtitle: "Bring up Zebra and Zaino with the Z3 indexer profile, find the right ports per network, and test the gRPC endpoint.",
    content: `<p>You have run the Z3 stack on regtest since Week 5, but mostly to get a working node. This lesson is about one specific part of it: the Zaino indexer, which is off by default and lives behind a Compose profile. By the end you will know the exact commands to bring Zaino up on each network, which ports it listens on, how it is configured to reach Zebra, and how to confirm it is answering. This is the groundwork for lab-08, where Zaino is the backend your explorer talks to.</p>
<p>Every command here comes from the Z3 repository's own documentation (its README and <code>docs/regtest.md</code>). The container images are pulled from a registry that is blocked in this teaching sandbox, so you will run these on your own machine; they have not been executed here. Treat the version pins and ports as current for October 2026 and check <code>z3-contract.yaml</code> in the repo if anything has moved.</p>

<h2>The indexer profile</h2>
<p>Z3 runs Zebra (the node) and Zallet (the wallet) by default. Zaino is <em>optional</em>, because Zallet talks to Zebra directly and does not need the standalone service. Zaino exists for external clients — light wallets, explorers, faucets — so Z3 gates it behind the Compose <code>indexer</code> profile. A profile is Docker Compose's way of keeping a service defined but dormant until you ask for it by name.</p>
<p>Assuming you already have a network set up and Zebra synced (the two-phase boot you learned in Week 5), you add Zaino with one command. The <code>--profile indexer</code> flag is what turns it on:</p>
<pre><code>docker compose --env-file .env.&lt;network&gt; --profile indexer up -d</code></pre>
<p>On regtest you can start just the Zaino container once the rest is up:</p>
<pre><code>docker compose --env-file .env.regtest --profile indexer up -d zaino</code></pre>
<p>When you stop the stack, pass <code>--profile "*"</code> so Compose also acts on profile-gated services; otherwise Zaino's container and volume are left behind:</p>
<pre><code>docker compose --env-file .env.regtest --profile "*" down       # stop, keep data
docker compose --env-file .env.regtest --profile "*" down -v    # stop and delete all volumes</code></pre>

<h2>Ports, per network</h2>
<p>Zaino exposes two servers: a <strong>gRPC</strong> endpoint (the lightwalletd-compatible <code>CompactTxStreamer</code> API that light wallets use) and a <strong>JSON-RPC</strong> proxy (a subset of node RPCs that explorers and faucets use). Z3 gives every network distinct host ports so all three can run on one host. These are the published host ports from the Z3 contract:</p>
<table>
<thead><tr><th>Network</th><th>Zaino gRPC</th><th>Zaino JSON-RPC</th><th>Zebra RPC (for reference)</th></tr></thead>
<tbody>
<tr><td>Mainnet</td><td><code>8137</code></td><td><code>8237</code></td><td><code>8232</code></td></tr>
<tr><td>Testnet</td><td><code>18137</code></td><td><code>18237</code></td><td><code>18232</code></td></tr>
<tr><td>Regtest</td><td><code>28137</code></td><td><code>28237</code></td><td><code>29232</code></td></tr>
</tbody>
</table>
<p>Inside the Compose network, services resolve each other by DNS name — <code>zebra</code>, <code>zaino</code>, <code>zallet</code> — on Zebra's per-network container ports (8232 on mainnet, 18232 on testnet and regtest). The host ports above are for <em>your</em> code reaching in from outside the stack. The gRPC listener is <strong>plaintext h2c on every network</strong>: there is no TLS. That is fine on <code>127.0.0.1</code> for development; anything exposed beyond the host must sit behind a TLS-terminating reverse proxy.</p>
<blockquote>Do not expose the plaintext gRPC or JSON-RPC ports to a network you do not control. Zaino rejects a public bind without TLS by default; Z3's image compiles that guard out for local use, so the responsibility moves to you.</blockquote>

<h2>How Zaino is configured to reach Zebra</h2>
<p>Zaino's job is to read a validator, so its most important configuration is where that validator is and how to authenticate. In Z3 this lives in <code>config/&lt;network&gt;/zaino.toml</code> (created from a tracked <code>.example</code> by the setup script). The regtest template is short, because regtest uses simple username/password auth rather than a cookie file:</p>
<pre><code>backend = "fetch"

[validator_settings]
validator_user = "zebra"
validator_password = "zebra"</code></pre>
<p>Two things to read off this. First, <code>backend = "fetch"</code> selects the JSON-RPC backend you met last lesson — Zaino reaches Zebra over its RPC port, not through the same-hardware ReadStateService. Second, the credentials are the regtest defaults, hardcoded for local use only.</p>
<p>Zaino also accepts configuration through environment variables prefixed <code>ZAINO_</code>, with <code>__</code> marking nesting. On mainnet, Z3 drives everything that way and leaves the TOML almost empty. The key that points Zaino at Zebra is, for example:</p>
<pre><code>ZAINO_VALIDATOR_SETTINGS__VALIDATOR_JSONRPC_LISTEN_ADDRESS=zebra:18232
ZAINO_GRPC_SETTINGS__LISTEN_ADDRESS=0.0.0.0:8137</code></pre>
<p>Sensitive fields — anything ending <code>_password</code>, <code>_secret</code>, <code>_token</code>, <code>_cookie</code> or <code>_private_key</code> — <em>cannot</em> be set via environment variables; Zaino errors on startup if you try, and expects them in a mounted config file instead. If you run Zaino outside Z3, <code>zainod generate-config</code> writes a default <code>zainod.toml</code> you can edit.</p>

<h2>Confirming it works</h2>
<p>Once <code>docker compose ... --profile indexer up -d</code> reports the Zaino container healthy, test the gRPC endpoint with <code>grpcurl</code> and the proto files. Z3's helper fetches those into <code>vendor/zaino/zaino-proto/proto</code>:</p>
<pre><code>scripts/vendor.sh zaino

grpcurl -plaintext \\
  -import-path vendor/zaino/zaino-proto/proto \\
  -proto service.proto \\
  127.0.0.1:28137 \\
  cash.z.wallet.sdk.rpc.CompactTxStreamer/GetLightdInfo</code></pre>
<p>The <code>-plaintext</code> flag tells grpcurl to skip TLS (correct, because the listener has none), and the long final argument is <code>&lt;package&gt;.&lt;service&gt;/&lt;method&gt;</code> — the package <code>cash.z.wallet.sdk.rpc</code> comes straight from the <code>.proto</code>. To ask for the chain tip, call <code>GetLatestBlock</code> with an empty argument:</p>
<pre><code>grpcurl -plaintext \\
  -import-path vendor/zaino/zaino-proto/proto \\
  -proto service.proto \\
  -d '{}' \\
  127.0.0.1:28137 \\
  cash.z.wallet.sdk.rpc.CompactTxStreamer/GetLatestBlock</code></pre>
<p>On a fresh regtest chain that returns a low height, because regtest mines blocks on demand and activates every upgrade through NU6.3 (Ironwood) by block 2. If you need more blocks, drive Zebra through the rpc-router at <code>http://127.0.0.1:8181</code> with HTTP Basic auth (defaults <code>zebra</code> / <code>zebra</code>).</p>

<h2>Try it</h2>
<p>On your own machine, bring up a regtest Z3 stack (<code>./scripts/regtest-init.sh</code> then the <code>up -d</code> line), then start Zaino with the indexer profile. Run the two <code>grpcurl</code> commands above against <code>127.0.0.1:28137</code>. Record (a) the <code>GetLightdInfo</code> output, noting the <code>chainName</code> and <code>blockHeight</code> fields, and (b) the height from <code>GetLatestBlock</code>. If grpcurl cannot connect, check the container is healthy (<code>docker compose ... ps</code>) and that you used the regtest port 28137, not the mainnet 8137. Keep the working command — lab-08 begins exactly here.</p>

<h2>Key takeaways</h2>
<ul>
<li>Zaino is off by default in Z3; start it with <code>docker compose --env-file .env.&lt;network&gt; --profile indexer up -d</code>, and stop with <code>--profile "*" down</code>.</li>
<li>Host ports are per network: gRPC 8137 / 18137 / 28137 and JSON-RPC 8237 / 18237 / 28237 for mainnet / testnet / regtest.</li>
<li>The gRPC listener is plaintext h2c everywhere — fine on localhost, needs a TLS reverse proxy if exposed.</li>
<li>Z3's Zaino uses <code>backend = "fetch"</code> and points at Zebra's RPC port; config is TOML plus <code>ZAINO_</code> env vars, but secrets must go in the file, not the environment.</li>
<li>Test with <code>grpcurl -plaintext</code> and the proto path <code>cash.z.wallet.sdk.rpc.CompactTxStreamer/GetLightdInfo</code>.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://github.com/ZcashFoundation/z3">Z3: README (indexer profile, endpoints) and docs/regtest.md (grpcurl tests)</a></li>
<li><a href="https://github.com/ZcashFoundation/z3">Z3: z3-contract.yaml (per-network port matrix) and config/regtest/zaino.toml.example</a></li>
<li><a href="https://github.com/zingolabs/zaino">Zaino: docs/docker.md (container config, ZAINO_ env vars, sensitive fields)</a></li>
<li><a href="https://github.com/fullstorydev/grpcurl">grpcurl: the gRPC command-line client</a></li>
</ul>`,
  },
  "l-03-17": {
    title: "gRPC & lightwalletd-Compatible APIs",
    subtitle: "Read the real CompactTxStreamer service definition, see the Ironwood additions, and call it from Rust or TypeScript.",
    content: `<p>Every Zcash light wallet in the world speaks one interface to its server, and it is not a REST API or a GraphQL schema — it is a gRPC service called <code>CompactTxStreamer</code>, defined once in a pair of <code>.proto</code> files. lightwalletd implements it in Go; Zaino implements the same thing in Rust. Because the definition is shared, a wallet cannot tell which server it is talking to, and your own client code works against either. You saw the method list conceptually in Week 4 (lesson l-01-13); this lesson treats the <code>.proto</code> as the authoritative source, shows what changed for Ironwood, and gets you calling it from real code.</p>

<h2>The service definition is the contract</h2>
<p>The files live in the <code>zcash/lightwallet-protocol</code> repository under <code>walletrpc/</code>: <code>service.proto</code> defines the RPCs and their request and reply messages, and <code>compact_formats.proto</code> defines the compact block structures. The service sits in package <code>cash.z.wallet.sdk.rpc</code>, which is why every method path is written <code>cash.z.wallet.sdk.rpc.CompactTxStreamer/&lt;Method&gt;</code>. gRPC uses this definition to generate typed client and server code in any supported language, so the <code>.proto</code> is the single thing you read to know what exists — not documentation that might drift.</p>
<p>The methods fall into a few groups. The ones a syncing wallet leans on hardest are the block stream and the tree state:</p>
<table>
<thead><tr><th>Purpose</th><th>Methods</th></tr></thead>
<tbody>
<tr><td>Chain tip and server info</td><td><code>GetLatestBlock</code>, <code>GetLightdInfo</code></td></tr>
<tr><td>Compact blocks</td><td><code>GetBlock</code>, <code>GetBlockRange</code> (streaming)</td></tr>
<tr><td>Full transactions and sending</td><td><code>GetTransaction</code>, <code>SendTransaction</code></td></tr>
<tr><td>Mempool</td><td><code>GetMempoolTx</code>, <code>GetMempoolStream</code></td></tr>
<tr><td>Commitment trees</td><td><code>GetTreeState</code>, <code>GetLatestTreeState</code>, <code>GetSubtreeRoots</code></td></tr>
<tr><td>Transparent addresses</td><td><code>GetTaddressTransactions</code>, <code>GetTaddressBalance</code>, <code>GetAddressUtxos</code></td></tr>
</tbody>
</table>
<p>Two methods, <code>GetBlockNullifiers</code> and <code>GetBlockRangeNullifiers</code>, are marked <code>deprecated</code> in the <code>.proto</code> itself — the definition tells you to use <code>GetBlockRange</code> with pool filtering instead. <code>Ping</code> exists for load testing only. Note the streaming methods: <code>GetBlockRange</code> returns a <em>stream</em> of <code>CompactBlock</code>, so a client reads blocks as they arrive rather than buffering a whole range.</p>

<h2>What Ironwood added</h2>
<p>The protocol already carries the Ironwood pool — you do not need a newer file. Reading the two <code>.proto</code> files, Ironwood appears in four concrete places:</p>
<ul>
<li>A new pool identifier: the <code>PoolType</code> enum gained <code>IRONWOOD = 4</code> (alongside <code>TRANSPARENT</code>, <code>SAPLING</code>, <code>ORCHARD</code>), and the <code>ShieldedProtocol</code> enum gained <code>ironwood = 2</code>.</li>
<li>Per-transaction data: <code>CompactTx</code> now has <code>repeated CompactOrchardAction ironwoodActions = 9</code>, a separate list beside the existing Orchard <code>actions</code>. Ironwood reuses the Orchard protocol, so it reuses the same compact action shape — nullifier, commitment <code>cmx</code>, ephemeral key, and the 52-byte ciphertext prefix.</li>
<li>Per-block tree size: <code>ChainMetadata</code> gained <code>ironwoodCommitmentTreeSize = 3</code>, next to the Sapling and Orchard sizes.</li>
<li>Tree state: the <code>TreeState</code> message gained <code>ironwoodTree = 7</code>, the serialised Ironwood commitment-tree frontier.</li>
</ul>
<p>Because the Orchard receiver inside a Unified Address now receives into Ironwood (Ironwood introduced no new address type), a wallet detects Ironwood notes exactly as it detects Orchard ones — it just scans the <code>ironwoodActions</code> list as well. The fee comment in <code>CompactTx</code> was updated too: where there are no transparent inputs, fee is computable as <code>valueBalanceSapling + valueBalanceOrchard + valueBalanceIronwood + sum(vPubNew) - sum(vPubOld) - sum(tOut)</code>.</p>

<h2>Calling it from the command line</h2>
<p>Against a running Z3 Zaino (last lesson), <code>grpcurl</code> is the quickest way to poke a method. The <code>-d</code> argument is the request message as JSON; an empty message is <code>'{}'</code>:</p>
<pre><code>grpcurl -plaintext \\
  -import-path vendor/zaino/zaino-proto/proto \\
  -proto service.proto \\
  -d '{}' \\
  127.0.0.1:28137 \\
  cash.z.wallet.sdk.rpc.CompactTxStreamer/GetLatestBlock</code></pre>
<p>To stream a range of compact blocks, send a <code>BlockRange</code> with <code>start</code> and <code>end</code> heights. grpcurl prints each streamed <code>CompactBlock</code> as it arrives:</p>
<pre><code>grpcurl -plaintext \\
  -import-path vendor/zaino/zaino-proto/proto \\
  -proto service.proto \\
  -d '{"start":{"height":1},"end":{"height":10}}' \\
  127.0.0.1:28137 \\
  cash.z.wallet.sdk.rpc.CompactTxStreamer/GetBlockRange</code></pre>

<h2>Calling it from code</h2>
<p>For a real backend you generate a typed client from the <code>.proto</code>. The Z3 integration docs give two working shapes. In Rust, the Tonic stack generates a <code>CompactTxStreamerClient</code>; because the endpoint is plaintext h2c you use an <code>http://</code> URL and no TLS configuration:</p>
<pre><code>use tonic::transport::Endpoint;
use compact_tx_streamer_client::CompactTxStreamerClient;

let channel = Endpoint::from_static("http://127.0.0.1:8137")
    .connect()
    .await?;

let mut client = CompactTxStreamerClient::new(channel);
let info = client.get_lightd_info(()).await?.into_inner();
println!("Lightd info: {info:?}");</code></pre>
<p>In TypeScript, Connect-ES generates the client from the same <code>.proto</code>; set the transport to HTTP/2 with a plaintext base URL:</p>
<pre><code>import { createGrpcTransport } from "@connectrpc/connect-node";
import { createClient } from "@connectrpc/connect";
import { CompactTxStreamer } from "./gen/service_pb";

const transport = createGrpcTransport({
    httpVersion: "2",
    baseUrl: "http://127.0.0.1:8137",   // plaintext h2c; no TLS
});

const client = createClient(CompactTxStreamer, transport);
const info = await client.getLightdInfo({});</code></pre>
<p>Both snippets come from Z3's <code>docs/integrations/lightwalletd-client.md</code>. The method names differ by language convention (<code>get_lightd_info</code> in Rust, <code>getLightdInfo</code> in TypeScript) but map to the same <code>GetLightdInfo</code> RPC. For anything beyond a demo you would not hand-roll sync logic; a wallet library such as librustzcash's <code>zcash_client_backend</code> already consumes this service. Reach for the raw client when you are building infrastructure — a scanner, a parity checker, an explorer feed — rather than a wallet.</p>

<h2>Try it</h2>
<p>Open <code>service.proto</code> and <code>compact_formats.proto</code> in the <code>zcash/lightwallet-protocol</code> repository. Make two lists. First, every RPC marked <code>deprecated</code> and what the comment says to use instead. Second, every field whose name contains "ironwood". For one of those fields, write a sentence explaining what a wallet uses it for. Then run the <code>GetBlockRange</code> grpcurl command above against your regtest Zaino and confirm the streamed blocks include an <code>ironwoodCommitmentTreeSize</code> in their <code>chainMetadata</code> once past the activation height.</p>

<h2>Key takeaways</h2>
<ul>
<li>The <code>.proto</code> files in <code>zcash/lightwallet-protocol</code> are the authoritative definition of <code>CompactTxStreamer</code>; lightwalletd and Zaino both implement them identically.</li>
<li>Method paths are <code>cash.z.wallet.sdk.rpc.CompactTxStreamer/&lt;Method&gt;</code>; <code>GetBlockRange</code> and the mempool and subtree methods stream.</li>
<li>Ironwood is already in the protocol: <code>IRONWOOD</code> pool enum, <code>ironwoodActions</code> in <code>CompactTx</code>, <code>ironwoodCommitmentTreeSize</code> in <code>ChainMetadata</code>, and <code>ironwoodTree</code> in <code>TreeState</code>.</li>
<li>Call it from grpcurl for ad-hoc checks, or from a generated client (Tonic in Rust, Connect-ES in TypeScript) using a plaintext <code>http://</code> h2c endpoint for local Z3.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://github.com/zcash/lightwallet-protocol">zcash/lightwallet-protocol: walletrpc/service.proto and walletrpc/compact_formats.proto</a></li>
<li><a href="https://github.com/ZcashFoundation/z3">Z3: docs/integrations/lightwalletd-client.md (grpcurl, Tonic and Connect-ES examples)</a></li>
<li><a href="https://github.com/zingolabs/zaino">Zaino: docs/rpc_api.md (the gRPC services Zaino serves)</a></li>
<li><a href="https://zips.z.cash/zip-0307">ZIP 307: Light Client Protocol for Payment Detection</a></li>
</ul>`,
  },
  "l-03-18": {
    title: "Indexing Shielded Transactions with Zaino",
    subtitle: "Be exact about what an indexer can and cannot see in a shielded transaction, and how pool-crossing amounts become public.",
    content: `<p>An indexer serves what is on the chain, and a block explorer shows it. The hard and important question for a Zcash indexer is not how to serve data quickly but what data actually exists to serve. A shielded transaction publishes far less than a transparent one, and if you build a backend without knowing exactly where the line falls you will either promise your users privacy the chain does not provide or display "unknown" where a real public figure exists. This lesson draws that line precisely. It is the conceptual core of lab-08: an explorer that presents shielded activity honestly.</p>

<h2>What the chain records for a shielded transaction</h2>
<p>A shielded transaction is built from <strong>actions</strong> (Orchard and Ironwood) or <strong>spends and outputs</strong> (Sapling). What goes on the public chain, and therefore what an indexer can read, is:</p>
<ul>
<li><strong>Nullifiers</strong> — one per note being spent. A nullifier proves a note is being consumed without saying which note; it is what stops double-spends. An indexer sees the nullifier value but cannot link it to the note it retires.</li>
<li><strong>Note commitments</strong> (<code>cmu</code> for Sapling, <code>cmx</code> for Orchard and Ironwood) — one per note being created, added to that pool's commitment tree. A commitment is a hiding, binding fingerprint of a note; it reveals nothing about value or recipient.</li>
<li><strong>Ciphertexts</strong> — the encrypted note, readable only by the holder of the right viewing key. The indexer stores and forwards these bytes; it cannot decrypt them.</li>
<li><strong>Ephemeral keys, proofs, and signatures</strong> — the cryptographic material that lets anyone verify the transaction is valid.</li>
<li><strong>The value balance</strong> — one public net figure per pool (<code>valueBalanceSapling</code>, <code>valueBalanceOrchard</code>, <code>valueBalanceIronwood</code>), plus the fee.</li>
</ul>
<p>What is <strong>not</strong> on the chain, and so cannot be indexed or shown, is the sender, the receiver, and the amount of any shielded note. For a fully shielded (z-to-z) transaction an explorer can confirm only that a valid transaction happened and was mined. Query the raw data and the shielded sender, receiver and amount fields come back empty — not hidden by the explorer's choice, but never present in readable form.</p>
<blockquote>One field stays visible even for a fully shielded transaction: the <strong>fee</strong>. Zcash consensus requires the transparent fee to be stated explicitly, so an explorer can always show it. This is also why using the standard wallet fee matters — an unusual fee makes a transaction stand out.</blockquote>

<h2>What the compact block keeps and drops</h2>
<p>Zaino serves light clients a <em>compact</em> block, which is even more stripped-down than the full block (you met this in Week 4). From each shielded element the compact form keeps only what a wallet needs to detect its own payments: the nullifier, the commitment, the ephemeral key, and the <strong>first 52 bytes</strong> of the ciphertext. It drops the proofs, the signatures, and the rest of the ciphertext — including the 512-byte memo. So an indexer serving compact blocks is forwarding even less than the full chain holds. A wallet that wants a memo must ask for the full transaction with <code>GetTransaction</code>, which is a separate, privacy-leaking request. None of this gives the server the ability to read notes; the 52 bytes are decryptable only with the recipient's key.</p>

<h2>The one thing that is public: value crossing a boundary</h2>
<p>Amounts inside a pool are hidden, but amounts <em>crossing</em> a boundary are public, and this is the single most important fact for an honest explorer. Each shielded transaction publishes one net figure per pool — its <strong>value balance</strong> — proven honest by a binding signature over homomorphic value commitments, without revealing the individual amounts behind it. A positive Orchard value balance means value left the Orchard pool to the transparent side; a negative one means value entered it.</p>
<p>Summed across the whole chain, these net figures give each pool's total balance: the <strong>chain value pool balance</strong>. Consensus rule <a href="https://zips.z.cash/zip-0209">ZIP 209</a> forbids any of these balances from going negative — a block that would let more value leave a pool than ever entered it is rejected. This public accounting is the <strong>turnstile</strong>: the network tracks a balance for every pool (Sprout, Sapling, Orchard, Ironwood, transparent, and the lockbox), and anyone can verify that no pool pays out more than it took in, even though the transactions inside stay private. An explorer can and should display these per-pool totals; they are real, public, and verifiable.</p>

<h2>The Orchard-to-Ironwood turnstile in 2026</h2>
<p>This machinery is doing visible work right now. After the Orchard circuit soundness bug was found and patched in mid-2026, the response (NU6.3 / Ironwood, July 2026) was to <strong>seal</strong> the Orchard pool — no new value may enter it — and have wallets migrate funds out into the fresh Ironwood pool, which uses the corrected protocol. Every migrating coin crosses the turnstile: it leaves Orchard (a public positive outflow from that pool) and enters Ironwood (a public inflow). Because the crossing amount is public, wallets that migrate deliberately split balances into canonical denominations and spread the transactions over time, so the public turnstile figure does not leak an individual user's balance (ZIP 318, draft). An explorer showing the migration is reading exactly these public per-pool flows — not anyone's private holdings.</p>
<p>Be careful how you describe the guarantee. The turnstile shows whether more value ever left a pool than entered it; a clean record is strong evidence that the Orchard bug was never exploited. It is accounting integrity, not a claim that any individual transaction is traceable or that the pool's contents are known. Keep your explorer's language on the right side of that distinction.</p>

<h2>A table you can hand a user</h2>
<table>
<thead><tr><th>Transaction type</th><th>Explorer can see</th><th>Explorer cannot see</th></tr></thead>
<tbody>
<tr><td>Transparent → transparent</td><td>Sender, receiver, amount, fee — end to end</td><td>Nothing is hidden</td></tr>
<tr><td>Shielding (t → z)</td><td>The transparent side and the amount entering the pool; fee</td><td>Which shielded address received it</td></tr>
<tr><td>Deshielding (z → t)</td><td>The transparent side and the amount leaving the pool; fee</td><td>Which shielded address it came from</td></tr>
<tr><td>Fully shielded (z → z)</td><td>That a valid transaction was mined; the fee</td><td>Sender, receiver, amount, memo</td></tr>
<tr><td>Pool crossing (e.g. Orchard → Ironwood)</td><td>The net amount crossing, as a public per-pool value balance; fee</td><td>Whose funds, and how they split across notes inside each pool</td></tr>
</tbody>
</table>

<h2>Try it</h2>
<p>Open a public Zcash explorer (for example <code>explorer.zec.rocks</code>) and find one transparent transaction and one fully shielded transaction. For each, write down every field the explorer displays, and mark which are present for both and which only for the transparent one. Confirm that the fee is shown even for the shielded transaction. Then find the explorer's per-pool or "shielded supply" figures and identify which pools it lists — this is the turnstile data your lab backend will surface. Note one sentence you would show a user to explain why the shielded transaction's amount is blank.</p>

<h2>Key takeaways</h2>
<ul>
<li>A shielded transaction publishes nullifiers, note commitments, encrypted ciphertexts, proofs and a per-pool value balance — never the sender, receiver or amount of a shielded note.</li>
<li>The fee is always public, even for a fully shielded transaction, because consensus requires it to be stated explicitly.</li>
<li>Compact blocks keep only nullifier, commitment, ephemeral key and a 52-byte ciphertext prefix; memos and proofs are dropped and need a separate full-transaction fetch.</li>
<li>Value crossing a boundary is public: per-pool value balances sum to chain value pool balances, which ZIP 209 forbids from going negative — the turnstile.</li>
<li>The Orchard→Ironwood migration moves funds across that turnstile; the crossing amounts are public, which is why wallets split and spread migrations.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zips.z.cash/zip-0209">ZIP 209: Prohibit Out-of-Range Chain Value Pool Balances</a></li>
<li><a href="https://zips.z.cash/zip-0258">ZIP 258: Deployment of the NU6.3 Network Upgrade (Ironwood)</a> and <a href="https://zips.z.cash/zip-0229">ZIP 229: Version 6 Transaction Format</a></li>
<li><a href="https://zechub.wiki/zcash-tech/what-a-block-explorer-can-see">ZecHub: What a block explorer can see on Zcash</a></li>
<li><a href="https://zechub.wiki/zcash-tech/the-turnstile">ZecHub: The turnstile</a></li>
<li><a href="https://zips.z.cash/zip-0307">ZIP 307: Light Client Protocol (compact blocks)</a></li>
</ul>`,
  },
  "l-03-19": {
    title: "Building a Block Explorer Backend",
    subtitle: "Map each explorer page to real Zaino and Zebra calls, and handle caching, reorgs, and shielded data honestly.",
    content: `<p>You now have Zaino running, you can call its gRPC and JSON-RPC surfaces, and you know what a shielded transaction does and does not reveal. This lesson puts those together into the design of a small block-explorer backend — the shape of lab-08. The goal is not a production explorer but a correct one: every page backed by a call that really exists, every shielded field presented truthfully, and the two things that catch people out — caching and reorgs — handled on purpose.</p>

<h2>One page, one (or two) calls</h2>
<p>An explorer backend is mostly a thin translation layer: an HTTP request for a page becomes one or more node calls, and the result is shaped for display. You have two surfaces to draw on. Zaino's gRPC <code>CompactTxStreamer</code> is good for block ranges, tree state and the mempool; Zebra's JSON-RPC (reachable directly, or through Zaino's JSON-RPC proxy) is good for detailed block and transaction views and for pool balances. Name only methods that exist — here is the mapping, with every method verified against the proto or Zebra's RPC source:</p>
<table>
<thead><tr><th>Page</th><th>Call(s)</th><th>Surface</th></tr></thead>
<tbody>
<tr><td>Latest blocks</td><td><code>GetLatestBlock</code> then <code>GetBlockRange</code>, or <code>getblockcount</code> + <code>getblock</code></td><td>gRPC / Zebra RPC</td></tr>
<tr><td>Block detail</td><td><code>getblock</code> (by height or hash), <code>getblockheader</code></td><td>Zebra RPC</td></tr>
<tr><td>Transaction detail</td><td><code>getrawtransaction</code>, or gRPC <code>GetTransaction</code></td><td>Zebra RPC / gRPC</td></tr>
<tr><td>Pool value balances</td><td><code>getblockchaininfo</code> (its <code>valuePools</code> and <code>chainSupply</code> fields)</td><td>Zebra RPC</td></tr>
<tr><td>Mempool</td><td><code>getrawmempool</code> / <code>getmempoolinfo</code>, or gRPC <code>GetMempoolStream</code></td><td>Zebra RPC / gRPC</td></tr>
<tr><td>Transparent address</td><td><code>getaddressbalance</code>, <code>getaddresstxids</code>, <code>getaddressutxos</code></td><td>Zebra RPC</td></tr>
<tr><td>Commitment trees</td><td><code>z_gettreestate</code>, or gRPC <code>GetTreeState</code> / <code>GetSubtreeRoots</code></td><td>Zebra RPC / gRPC</td></tr>
</tbody>
</table>
<p>A good rule: use gRPC when you want a stream (blocks as they arrive, a live mempool), and Zebra's JSON-RPC when you want one rich object (a full block or transaction). There is no shielded-address page, because no such public data exists — see below.</p>

<h2>The per-pool balances page is the interesting one</h2>
<p>Most explorer pages are mechanical. The one that carries real Zcash meaning is the pool-balances view, because it is the turnstile made visible. Zebra's <code>getblockchaininfo</code> returns a <code>valuePools</code> array — one entry per value pool (transparent, Sprout, Sapling, Orchard, Ironwood, and the lockbox) — and a <code>chainSupply</code> total. Zebra's <code>getblock</code> also reports each pool's balance at a given block and its delta from the previous one. During the Orchard-to-Ironwood migration this is what lets a user watch the sealed Orchard balance fall and the Ironwood balance rise, each figure public and verifiable. Present these as what they are: pool totals, never anyone's individual holdings.</p>

<h2>Presenting shielded transactions honestly</h2>
<p>When your transaction page renders a fully shielded transaction, most fields a Bitcoin explorer shows do not exist. Do not invent them and do not leave the user guessing. Show what is real — that the transaction is valid and mined, its fee, and any transparent inputs or outputs it has — and label the rest plainly as not present on the chain, not "hidden by us". If the transaction crosses a pool boundary (shielding, deshielding, or an Orchard→Ironwood move), show the public net amount from the relevant value balance and say which boundary it crossed. A short, accurate note next to a blank amount ("shielded amount — never recorded publicly") does more for a user's understanding than a polished layout that implies the data is being withheld.</p>

<h2>Caching and reorgs</h2>
<p>Two non-obvious things decide whether your backend is correct under load and over time.</p>
<p><strong>Caching.</strong> Explorer traffic is dominated by repeated reads of the same recent blocks and transactions. Cache aggressively, but key your cache on the right thing. A transaction or a block more than 1,000 blocks deep is finalised and can be cached effectively forever. Recent blocks can still change, so cache them briefly or not at all. The tip and mempool should never be cached beyond a few seconds.</p>
<p><strong>Reorgs.</strong> This is the one that silently corrupts an explorer written as if the chain only grows. Zebra keeps the last part of the chain as non-finalised state and will follow a reorganisation up to <code>MAX_BLOCK_REORG_HEIGHT</code>, which is <strong>1,000 blocks</strong> as of October 2026 (per Zebra's own constant). Anything within 1,000 blocks of the tip can be replaced by a competing chain: a block you displayed may cease to exist, and a transaction may move or vanish. Design for it:</p>
<ol>
<li>Treat data in the last 1,000 blocks as provisional. Show a confirmation count and do not present recent blocks as final.</li>
<li>Track block hashes, not just heights. On each poll, if the hash at a height you have cached has changed, that height was reorged — invalidate it and everything above it.</li>
<li>Only treat a block as permanent once it is more than 1,000 blocks deep.</li>
</ol>
<blockquote>An explorer that keys everything on block height and never re-checks hashes will quietly show a transaction that no longer exists after a reorg. Re-validating the top 1,000 blocks against their hashes is the cheap insurance that prevents it.</blockquote>

<h2>Learn from existing explorers</h2>
<p>You do not have to invent the conventions. <strong>CipherScan</strong> (<code>cipherscan.app</code>) is a current Zcash explorer that surfaces the Ironwood turnstile and per-pool balances — a good model for the balances page you are about to build. ZecHub's "Blockchain Explorers" guide is a plain-language tour of what an explorer shows and why, useful for deciding what to put on each page. Study how they distinguish transparent from shielded activity, and copy that honesty rather than a Bitcoin explorer's everything-is-visible layout.</p>

<h2>Try it</h2>
<p>Sketch your lab-08 backend on paper before you write code. List the pages you will serve (latest blocks, block detail, transaction detail, pool balances, mempool). Beside each, write the exact call from the table above and whether it hits Zaino gRPC or Zebra RPC. Then write your reorg rule in two sentences: what you cache permanently, and what you re-check on every poll. Finally, draft the one sentence your transaction page will show next to a shielded amount. Bring these notes to the lab.</p>

<h2>Key takeaways</h2>
<ul>
<li>Each explorer page maps to a specific, real call: gRPC for streams and ranges, Zebra JSON-RPC for rich single objects and pool balances.</li>
<li>Per-pool balances come from <code>getblockchaininfo</code> (<code>valuePools</code>, <code>chainSupply</code>) and per-block deltas from <code>getblock</code> — this is the turnstile, and it is public and verifiable.</li>
<li>Present shielded transactions truthfully: show the fee and any transparent side, label absent fields as never recorded, and show the net amount for pool crossings.</li>
<li>Cache finalised data (below the tip by more than 1,000 blocks) freely; treat the top 1,000 blocks as provisional.</li>
<li>Handle reorgs by tracking block hashes and re-checking the non-finalised window (<code>MAX_BLOCK_REORG_HEIGHT</code> = 1,000); study CipherScan and the ZecHub guide for conventions.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://github.com/ZcashFoundation/zebra">Zebra: zebra-rpc (getblockchaininfo valuePools/chainSupply, getblock, getrawtransaction) and MAX_BLOCK_REORG_HEIGHT</a></li>
<li><a href="https://github.com/zcash/lightwallet-protocol">zcash/lightwallet-protocol: service.proto (GetBlockRange, GetTransaction, GetMempoolStream, GetTreeState)</a></li>
<li><a href="https://zechub.wiki/guides/blockchain-explorers">ZecHub: Blockchain Explorers guide</a></li>
<li><a href="https://cipherscan.app">CipherScan: a Zcash explorer showing the Ironwood turnstile and pool balances</a></li>
<li><a href="https://zips.z.cash/zip-0209">ZIP 209: Prohibit Out-of-Range Chain Value Pool Balances (the turnstile rule)</a></li>
</ul>`,
  },
}
