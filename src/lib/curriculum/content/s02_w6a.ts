// AUTO-GENERATED from scratchpad lesson fragments. Do not edit by hand.
// Each entry: lesson id -> { title, subtitle, content (HTML) }.
import type { LessonContent } from './types'

export const M_s02_w6a: Record<string, LessonContent> = {
  "l-02-07": {
    title: "Building a Payment Gateway",
    subtitle: "Design a shielded payment gateway: one address per order, a ZIP 321 request, detection without spending keys, and a clear \"paid\" rule.",
    content: `<p>A payment gateway does four things: it issues a payment request for an order, watches the chain for a matching payment, decides when that payment counts as final, and tells the merchant. Last week you did each of these by hand on your regtest stack: you derived an address, wrote a ZIP 321 URI, sent a shielded transaction and read its confirmations. This lesson arranges those pieces into an application design.</p>
<p>There is no official Zcash payments framework to install, so this lesson teaches the architecture. In this week's lab (Payment Gateway MVP) you build it in a language you already know, talking to Zallet and Zebra over JSON-RPC.</p>

<h2>The moving parts</h2>
<p>Keep the Zcash-specific code small and behind one interface. Everything else is an ordinary web application.</p>
<table>
<thead><tr><th>Component</th><th>Job</th><th>Zcash mechanism</th></tr></thead>
<tbody>
<tr><td>Invoice store</td><td>One row per order: amount, address, status, expiry</td><td>None (your database)</td></tr>
<tr><td>Address issuer</td><td>A fresh receiving address for each invoice</td><td>Diversified Unified Addresses under one account (ZIP 32, ZIP 316)</td></tr>
<tr><td>Request builder</td><td>Something the customer's wallet can scan</td><td>ZIP 321 <code>zcash:</code> URI, shown as a QR code</td></tr>
<tr><td>Watcher</td><td>Notices incoming notes and counts confirmations</td><td>A wallet that scans with a viewing key</td></tr>
<tr><td>Policy</td><td>Turns "seen" into "paid", "underpaid", "expired"</td><td>ZIP 315 confirmation guidance</td></tr>
</tbody>
</table>
<p>Store amounts as integers in <strong>zatoshis</strong> (1 ZEC = 100,000,000 zatoshis). Floating-point ZEC values eventually misround, and an exact payment then looks like an underpayment.</p>

<h2>One address per order</h2>
<p>A shielded transaction does not reveal its sender, so you cannot ask "who paid me?". You match a payment to an order by <em>where</em> it arrived. That means each invoice needs its own address.</p>
<p>You do not need a new account, or a new key, for that. The Zallet book is explicit that accounts are "not intended as address labels" and that every account adds scanning cost. Instead, derive many addresses from one account at different <strong>diversifier indices</strong>. They all receive into the same account, and, in the book's words, "payments to their shielded receivers are not linkable on-chain". Zallet's method is <code>z_getaddressforaccount</code>, which takes an account, an optional list of receiver types, and an optional diversifier index:</p>
<pre><code>zallet rpc z_getaddressforaccount '"&lt;account-uuid&gt;"' '["orchard"]'</code></pre>
<p>The result contains <code>address</code> and <code>diversifier_index</code>. Save both on the invoice. When you ask for shielded receivers only and give no index, Zallet picks a time-based index; calling again with the same account and index returns the same address, so the index is enough to re-derive it later.</p>
<p>Ask for shielded receivers only. If you leave the receiver list empty, Zallet includes a transparent (<code>p2pkh</code>) receiver, and a payment to that receiver is public, linkable, and cannot carry a memo. The <code>orchard</code> receiver type is the one that receives into the Ironwood pool: Ironwood reuses the Orchard protocol's addresses and did not add a new receiver type.</p>

<h2>The payment request</h2>
<p>Build a ZIP 321 URI from the invoice and render it as a QR code with any QR library. The rules you met in Week 5 matter in code:</p>
<ul>
<li><code>amount</code> is decimal ZEC with a full stop as separator and at most 8 decimal places. Format it from your integer zatoshi value; never from a float.</li>
<li><code>memo</code> is the memo bytes encoded as base64url with the <code>=</code> padding removed. The decoded memo must not exceed 512 bytes.</li>
<li><code>message</code> and <code>label</code> are text for the customer's wallet to display. They are percent-encoded and never go on chain.</li>
</ul>
<pre><code>zcash:&lt;unified-address&gt;?amount=0.015&amp;memo=b3JkZXI6N0YzSzlR&amp;message=Order%207F3K9Q</code></pre>
<p>Here <code>b3JkZXI6N0YzSzlR</code> is base64url for <code>order:7F3K9Q</code>. The memo gives you a second way to match a payment, but the customer's wallet is free to change or drop it, so treat the address as the primary key and the memo as a cross-check.</p>

<h2>Detecting the payment without spending keys</h2>
<p>ZIP 316 defines a <strong>viewing key</strong> as "the necessary information to view information about payments to an Address, or (in the case of a Full Viewing Key) from an Address". An incoming viewing key is enough to detect payments, and addresses can be derived from it. So the internet-facing server that watches for payments has no need to hold a key that can spend. If that server is compromised, the attacker learns your sales history, which is bad, but cannot take the funds.</p>
<p>How far you can take this depends on your tools, as of October 2026:</p>
<ul>
<li><strong>Zallet</strong> can export an account's unified full viewing key, or its unified incoming viewing key, with <code>z_exportviewingkey</code> (added in 0.1.0-beta.2; check which Zallet version your Z3 checkout pins). Its <code>z_importviewingkey</code> accepts only Sapling extended full viewing keys, so you cannot yet run a second, watch-only Zallet for a unified account. In the lab, one regtest Zallet holds the seed and does the watching. That is fine for play money.</li>
<li><strong>zcash-devtool</strong> has a <code>wallet init-fvk</code> command that creates a view-only wallet from a UFVK, and its walkthrough uses it to split an online viewing wallet from an offline signer. Its README says it is not production-ready, but it is a clear demonstration of the pattern.</li>
<li>The community <strong>BTCPay Server Zcash plugin</strong> is built this way: ZecHub describes its wallet backend as view-only, holding no seed.</li>
</ul>
<p>With Zallet, the watcher polls <code>z_listunspent</code> with <code>minconf</code> set to 0 so that it also returns notes with zero confirmations. Each result includes <code>txid</code>, <code>pool</code>, <code>address</code>, <code>valueZat</code>, <code>confirmations</code> and, for shielded outputs, <code>memo</code> and <code>memoStr</code>. Match on the <code>address</code> field of each result yourself: the method's own <code>addresses</code> filter returns every unspent note in the account that owns the address, whichever diversified address received it.</p>
<blockquote>Record the <code>txid</code> the moment you first see a payment. <code>z_listunspent</code> lists only unspent notes, so a payment disappears from it once the merchant spends those funds. After that, use <code>z_viewtransaction</code> with the stored txid; it reports <code>status</code> (<code>mined</code>, <code>waiting</code>, <code>expiringsoon</code> or <code>expired</code>) and <code>confirmations</code>.</blockquote>

<h2>Deciding that an order is paid</h2>
<p>Write the rule down as a state machine before you write any code:</p>
<ol>
<li><strong>pending</strong>: the invoice exists; nothing seen.</li>
<li><strong>detected</strong>: notes to the invoice address total at least the amount, but have fewer confirmations than your threshold. Show the customer "payment seen".</li>
<li><strong>paid</strong>: every counted note has at least <em>N</em> confirmations. Only now release the goods.</li>
<li><strong>underpaid</strong>, <strong>overpaid</strong>, <strong>expired</strong>: the exceptions, each with a written rule.</li>
</ol>
<p>For <em>N</em>, ZIP 315 (a Draft) recommends 10 confirmations before treating funds from another party as spendable, and Zallet uses the same default for untrusted outputs. Ten blocks is about 12.5 minutes at Mainnet's 75-second target spacing. NU7 is planned to cut the spacing to 25 seconds and is already active on Testnet, so store the threshold in blocks and compute any time you display from the network you are on.</p>
<p>Three details that catch people out:</p>
<ul>
<li><strong>Sum, do not compare one note.</strong> A customer may pay in two transactions. Add up <code>valueZat</code> for the address.</li>
<li><strong>Invoice expiry is yours, not the chain's.</strong> It is separate from transaction expiry (ZIP 203). The address still belongs to you after the invoice expires, so a late payment still arrives. Keep watching expired invoices and decide in advance whether to honour or refund.</li>
<li><strong>Refunds need an address from the customer.</strong> You cannot send funds "back to the sender" of a shielded payment. If the address they give starts with <code>tex1</code>, it is a TEX address (ZIP 320), typically from an exchange, and the transaction paying it must spend only transparent funds, so a refund from your shielded balance takes two steps.</li>
</ul>

<h2>Try it</h2>
<p>Design the invoice record for your gateway: list every field, its type, and which component writes it. Then draw the state machine above and label each arrow with the exact condition that triggers it, including what happens when 60% of the amount arrives, when 130% arrives, and when the full amount arrives an hour after expiry. Finally, on your regtest stack, call <code>z_getaddressforaccount</code> twice with shielded-only receivers and confirm you get two different addresses for the same account.</p>

<h2>Key takeaways</h2>
<ul>
<li>A gateway is an invoice store plus four small Zcash-specific pieces: address issuer, request builder, watcher and policy.</li>
<li>Give every order its own diversified, shielded-only address under one account, and match payments by address first and memo second.</li>
<li>Detecting payments needs a viewing key, not a spending key. Zallet's support for a fully watch-only deployment is incomplete in the beta, so know what your server actually holds.</li>
<li>Define "paid" in blocks and in zatoshis, and write rules for underpayment, overpayment and late payment before launch.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zips.z.cash/zip-0321">ZIP 321: Payment Request URIs</a></li>
<li><a href="https://zips.z.cash/zip-0316">ZIP 316: Unified Addresses and Unified Viewing Keys</a></li>
<li><a href="https://zips.z.cash/zip-0315">ZIP 315: Best Practices for Wallet Implementations (Draft)</a></li>
<li><a href="https://zips.z.cash/zip-0320">ZIP 320: TEX addresses</a></li>
<li><a href="https://github.com/zcash/zallet">Zallet repository (the book's JSON-RPC reference and "Accounts and keys" page)</a></li>
<li><a href="https://github.com/btcpay-zcash/btcpayserver-zcash-plugin">BTCPay Server Zcash plugin</a></li>
</ul>`,
  },
  "l-02-08": {
    title: "Wallet Sync & Block Scanning",
    subtitle: "Explain how a shielded wallet finds its own notes by scanning, why a birthday height matters, and what Ironwood changed for scanners.",
    content: `<p>On a transparent chain, finding your money is a database lookup: ask an indexer for everything at an address. A shielded pool has no such lookup. Outputs are encrypted, and nothing on chain says who an output is for. The only way to find your notes is to try to decrypt every shielded output with your own key and see which ones open. That process is called <strong>scanning</strong>, and "wallet sync" is mostly scanning.</p>
<p>Your payment gateway's watcher is a scanner. This lesson explains what it is doing between "block mined" and "payment seen", so you can reason about its delay, its cost, and what it can and cannot see.</p>

<h2>What a scanner does with each block</h2>
<p>For every shielded output in a block, a wallet performs three jobs. ZIP 307, the light client protocol, lists them as the reasons a client needs block data at all:</p>
<ol>
<li><strong>Detect payments to you.</strong> The wallet attempts <strong>trial decryption</strong> of each output with its <strong>incoming viewing key</strong>. If decryption succeeds, the output is yours and you learn its value and note details. If it fails, you learn nothing, and move on.</li>
<li><strong>Detect spends of your notes.</strong> Every shielded spend publishes a <strong>nullifier</strong>, a value that marks one note as used without saying which. The wallet can compute the nullifier of each note it owns, so it watches the stream of nullifiers for a match.</li>
<li><strong>Keep witnesses current.</strong> To spend a note you must prove it is in the pool's <strong>note commitment tree</strong> (the Merkle tree you met in Stage 01). That proof needs a <strong>witness</strong>, the path from your note to a recent tree root, and the path changes as new commitments are appended.</li>
</ol>
<p>A consequence for your design: detection is a property of the wallet's keys, not of any address index. A node or indexer without your viewing key cannot tell you that you were paid.</p>

<h2>Compact blocks</h2>
<p>A full shielded output is large, mostly because of its 512-byte encrypted memo. ZIP 307 observes that a wallet does not need the memo to detect a payment: the first 52 bytes of the ciphertext are enough to recover the note, so a server can strip everything else. A <strong>compact block</strong> carries only what the three jobs need. In the current protocol definition, a compact Orchard-protocol action is four fields:</p>
<table>
<thead><tr><th>Field</th><th>Size</th><th>Used for</th></tr></thead>
<tbody>
<tr><td><code>nullifier</code></td><td>32 bytes</td><td>Spend detection</td></tr>
<tr><td><code>cmx</code></td><td>32 bytes</td><td>The note commitment, for the tree and witnesses</td></tr>
<tr><td><code>ephemeralKey</code></td><td>32 bytes</td><td>Trial decryption</td></tr>
<tr><td><code>ciphertext</code></td><td>52 bytes</td><td>The first 52 bytes of the encrypted note</td></tr>
</tbody>
</table>
<p>Light wallets download compact blocks from an indexer (Zaino, or lightwalletd) over the <code>CompactTxStreamer</code> gRPC service using calls such as <code>GetBlockRange</code>, and scan them on the device. The server learns which block ranges a client asked for, but it never receives a viewing key.</p>
<p>Two things follow from the trimming. First, the memo is not in a compact block. After a wallet detects a note it fetches the full transaction (<code>GetTransaction</code>) and decrypts the memo then. Zallet's <code>z_listunspent</code> documents this: the <code>memo</code> field is omitted while "the wallet has not yet fetched the memo". Your gateway must tolerate a note appearing before its memo does. Second, Zallet in the Z3 stack does not use the standalone Zaino service: it embeds Zaino's libraries and reads from Zebra's JSON-RPC directly. The scanning logic is the same.</p>

<h2>Birthdays, and scanning out of order</h2>
<p>A wallet cannot have received funds before its keys existed. The <strong>birthday height</strong> is the block height from which a wallet needs to scan. A new wallet sets it near the current chain tip and skips years of history. A wallet restored from a seed phrase without a known birthday has to scan from far earlier: zcash-devtool, for example, defaults a restored wallet's birthday to the network's Sapling activation height, and its documentation tells you to pass <code>--birthday</code> if you know a later one. Zallet's <code>z_recoveraccounts</code> method makes <code>birthday_height</code> a required field for the same reason.</p>
<blockquote>Record the birthday height of every wallet you create, next to (not inside) the seed backup. It is not secret, and it is the difference between a restore that takes minutes and one that takes hours.</blockquote>
<p>Modern wallets also do not scan strictly from oldest to newest. The <code>zcash_client_backend</code> crate in librustzcash, which Zallet and zcash-devtool build on, has the wallet database suggest block ranges with priorities. From highest to lowest, the ranges it asks for first are:</p>
<ul>
<li><code>Verify</code>: re-check a recently scanned range to confirm it is still on the main chain (this is how reorgs are noticed);</li>
<li><code>ChainTip</code>: the newest blocks, so new payments show up and the latest part of the commitment tree is complete;</li>
<li><code>FoundNote</code>: blocks needed to finish the tree section around a note the wallet has found, so that note becomes spendable;</li>
<li><code>Historic</code>: everything else back to the birthday.</li>
</ul>
<p>To make this possible the wallet first downloads the roots of completed sections of the note commitment tree ("subtree roots"; Zebra serves them through <code>z_getsubtreesbyindex</code> and indexers through <code>GetSubtreeRoots</code>). With those in hand it can build a witness for a recent note without having scanned every earlier block. The ZecHub wiki calls the user-facing result "spend-before-sync".</p>

<h2>What Ironwood changed for scanners</h2>
<p>Since NU6.3 there are two pools that use the Orchard protocol: the sealed Orchard pool and the active Ironwood pool. ZIP 326 (Draft) sets out the consequences for wallets. At a builder's level:</p>
<ul>
<li><strong>Same keys, both pools.</strong> "A receiver, and the corresponding incoming viewing key, is scoped to the Orchard protocol, not to a pool": the same key trial-decrypts Orchard-pool and Ironwood-pool outputs. Compact blocks carry the two sets of actions in separate lists (<code>ironwoodActions</code> alongside the Orchard ones), each with its own commitment tree size.</li>
<li><strong>New wallets can skip the Orchard pool.</strong> For an account whose birthday is after NU6.3 activation (Mainnet height 3,428,143), the ZIP says Orchard-pool outputs "SHOULD NOT be scanned at all". No new value can enter that pool, so there is nothing to find. Ironwood is scanned from the later of the birthday and the activation height.</li>
<li><strong>Older wallets scan Orchard only until it is empty.</strong> Once an account's Orchard-pool balance is known to be zero after activation, the wallet can stop scanning that pool.</li>
<li><strong>Restoring from seed costs a little more.</strong> Ironwood's quantum-recoverable note format (ZIP 2005) introduced a per-account key-derivation choice that is not stored with the seed. A restoring wallet therefore tries more than one candidate viewing key on Ironwood outputs until it first finds funds, then locks on to the one that worked. The ZIP's rules exist to keep that extra cost small.</li>
</ul>
<p>You do not implement any of this yourself. It matters because it tells you what a library must support: a wallet stack that predates NU6.3 will not see Ironwood payments. Check that the versions you depend on list Ironwood support in their changelogs.</p>

<h2>What this means for your gateway</h2>
<ul>
<li>A payment cannot be "seen" until the wallet has scanned the block (or mempool transaction) containing it. Poll Zallet's <code>getwalletstatus</code> and compare <code>wallet_tip</code> with <code>node_tip</code> before trusting an empty result.</li>
<li>While Zallet is catching up, or recovering from a reorg, <code>getwalletstatus</code> reports <code>locked: true</code> and the balance and spend methods return errors instead of answering from a partial view. Treat that as "not ready", not as "no payment".</li>
</ul>

<h2>Try it</h2>
<p>On your regtest stack, call <code>getwalletstatus</code> on Zallet and note <code>node_tip</code>, <code>wallet_tip</code> and <code>fully_synced_height</code>. Mine a few blocks, call it again, and watch the wallet catch up. Then send yourself a shielded payment with a memo and poll <code>z_listunspent</code> with <code>minconf</code> 0 every second or two: write down how long the note takes to appear after you send, and whether <code>memoStr</code> is present the first time you see it. Those two observations are your watcher's real-world latency.</p>

<h2>Key takeaways</h2>
<ul>
<li>Shielded wallets find funds by trial-decrypting every output with an incoming viewing key; nullifiers reveal spends; witnesses make notes spendable.</li>
<li>Compact blocks strip outputs to what scanning needs, so memos arrive later, after the wallet fetches the full transaction.</li>
<li>A recorded birthday height bounds how much history a restored wallet must scan.</li>
<li>After NU6.3, one Orchard-protocol viewing key covers both the Orchard and Ironwood pools; new accounts need only scan Ironwood.</li>
<li>An empty answer from a wallet that is still syncing means "unknown", not "unpaid".</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zips.z.cash/zip-0307">ZIP 307: Light Client Protocol for Payment Detection (Draft)</a></li>
<li><a href="https://zips.z.cash/zip-0326">ZIP 326: NU6.3 Consequences for Wallets (Draft)</a></li>
<li><a href="https://github.com/zcash/lightwallet-protocol">zcash/lightwallet-protocol: the CompactTxStreamer and compact block definitions</a></li>
<li><a href="https://github.com/zcash/librustzcash">librustzcash: <code>zcash_client_backend</code> scanning API (<code>data_api::chain</code>, <code>data_api::scanning</code>)</a></li>
<li><a href="https://zechub.wiki/zcash-tech/zcash-wallet-syncing">ZecHub: Zcash Wallet Syncing</a></li>
</ul>`,
  },
  "l-02-09": {
    title: "Memo Fields & Encrypted Messages",
    subtitle: "Encode, decode and safely use the 512-byte shielded memo, and say exactly who can read it.",
    content: `<p>Every shielded output in Zcash carries a 512-byte <strong>memo</strong> next to its value. It is encrypted with the note, so on chain it is indistinguishable from the rest of the ciphertext. Builders use it for order references, invoice numbers, thank-you notes, refund addresses and small private messages.</p>
<p>Your gateway already puts a memo in its ZIP 321 request. This lesson covers the rules for writing and reading memos correctly, and what a memo can be trusted for.</p>

<h2>What the memo is</h2>
<p>The memo is a fixed-size field: exactly 512 bytes on every shielded output. A sender who writes nothing still sends 512 bytes holding a "no memo" marker, so an observer cannot tell which payments carry a message or how long it is.</p>
<p>Two facts shape how you use it:</p>
<ul>
<li><strong>Shielded outputs only.</strong> A transparent output has no memo field. ZIP 321 makes a payment URI invalid if it attaches a memo to a transparent address, and Zallet's <code>z_sendmany</code> treats a memo on a transparent recipient as an error.</li>
<li><strong>512 bytes, not 512 characters.</strong> Text is UTF-8, where one character can take several bytes: the naira sign <code>₦</code> is three bytes, and most emoji are four. Measure the encoded length.</li>
</ul>

<h3>Who can read it</h3>
<p>The memo sits inside the encrypted note. As ZIP 231 puts it, "recipients can only decrypt the outputs sent to them, and thus can also only observe the memo fields included with the outputs they can decrypt".</p>
<table>
<thead><tr><th>Party</th><th>Can read the memo?</th></tr></thead>
<tbody>
<tr><td>The recipient (holder of the incoming viewing key for the address)</td><td>Yes</td></tr>
<tr><td>Anyone the recipient gave a full or incoming viewing key to (an accountant, your gateway server)</td><td>Yes</td></tr>
<tr><td>The sender's own wallet, which can recover its sent outputs with its outgoing viewing key</td><td>Yes</td></tr>
<tr><td>Full nodes, miners, indexers, block explorers</td><td>No</td></tr>
</tbody>
</table>
<p>"Encrypted on chain" is not "private everywhere". Once your gateway decrypts a memo it is plaintext in your process, your database and, if you are careless, your logs. And the memo in a ZIP 321 URI is only base64url-encoded: anyone who photographs the QR code can read it.</p>

<h2>The format: ZIP 302</h2>
<p>ZIP 302 (status: Draft; its three basic cases are also in the protocol specification) tells a reader how to interpret the 512 bytes from the <strong>first byte</strong>. These are conventions for wallets, not consensus rules: the network accepts any 512 bytes.</p>
<table>
<thead><tr><th>First byte</th><th>Meaning</th><th>What a reader does</th></tr></thead>
<tbody>
<tr><td><code>0x00</code>–<code>0xF4</code></td><td>UTF-8 text</td><td>Strip trailing zero bytes, decode as UTF-8, report an error if decoding fails</td></tr>
<tr><td><code>0xF6</code>, then 511 zero bytes</td><td>No memo</td><td>Treat as empty</td></tr>
<tr><td><code>0xFF</code></td><td>Arbitrary data</td><td>Make no assumptions; the other 511 bytes are application-defined</td></tr>
<tr><td><code>0xF5</code></td><td>Legacy "private agreement" data</td><td>Make no assumptions; new applications should use <code>0xFF</code> instead</td></tr>
<tr><td><code>0xF6</code> with other content, <code>0xF7</code>–<code>0xFE</code></td><td>Reserved for future versions</td><td>Do not interpret</td></tr>
</tbody>
</table>
<p>The scheme works because no valid UTF-8 string starts with a byte of <code>0xF5</code> or above. For structured binary data, set the first byte to <code>0xFF</code> and define your own layout for the other 511 bytes. For a short reference, plain UTF-8 is simpler and wallets will display it.</p>

<h2>Encoding and decoding in code</h2>
<p>The same memo appears in three encodings depending on where you meet it:</p>
<table>
<thead><tr><th>Where</th><th>Encoding</th><th><code>order:7F3K9Q</code> becomes</th></tr></thead>
<tbody>
<tr><td>ZIP 321 URI <code>memo</code> parameter</td><td>base64url, no <code>=</code> padding</td><td><code>b3JkZXI6N0YzSzlR</code></td></tr>
<tr><td>Zallet <code>z_sendmany</code> <code>memo</code> field</td><td>Hexadecimal</td><td><code>6f726465723a3746334b3951</code></td></tr>
<tr><td>Zallet <code>z_listunspent</code> / <code>z_viewtransaction</code> output</td><td><code>memo</code> (hexadecimal) and <code>memoStr</code> (text, when it is valid UTF-8)</td><td>The text, in <code>memoStr</code></td></tr>
</tbody>
</table>
<p>In a ZIP 321 URI you encode only the bytes you wrote; a shorter memo "will be filled with trailing zeros to 512 bytes". A reader applying ZIP 302 looks like this, in plain TypeScript with no Zcash library:</p>
<pre><code>type Memo =
  | { kind: "empty" }
  | { kind: "text"; text: string }
  | { kind: "data"; bytes: Uint8Array }   // 0xFF or legacy 0xF5
  | { kind: "reserved" };

function readMemo(memo: Uint8Array): Memo {
  if (memo.length !== 512) throw new Error("memo must be 512 bytes");
  const first = memo[0];
  if (first &lt;= 0xf4) {
    let end = memo.length;
    while (end &gt; 0 &amp;&amp; memo[end - 1] === 0) end--;      // strip zero padding
    if (end === 0) return { kind: "empty" };
    const text = new TextDecoder("utf-8", { fatal: true }).decode(memo.subarray(0, end));
    return { kind: "text", text };
  }
  if (first === 0xf6 &amp;&amp; memo.subarray(1).every((b) =&gt; b === 0)) return { kind: "empty" };
  if (first === 0xff || first === 0xf5) return { kind: "data", bytes: memo.subarray(1) };
  return { kind: "reserved" };
}

function textMemoForUri(text: string): string {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length &gt; 512) throw new Error("memo exceeds 512 bytes");
  return Buffer.from(bytes).toString("base64url");     // Node.js: no padding
}</code></pre>

<h2>Using memos safely in an application</h2>
<blockquote>A memo is unauthenticated input from a stranger. Anyone who knows one of your addresses can send it a tiny payment with any memo they like, including another customer's order reference.</blockquote>
<ul>
<li><strong>Never mark an order paid from the memo alone.</strong> Match on the invoice's unique address and the amount first. Use the memo as a cross-check or a tie-breaker.</li>
<li><strong>Treat it like any user-supplied string.</strong> Escape it before rendering it in HTML, and never interpolate it into SQL or shell commands.</li>
<li><strong>Expect it to be missing or changed.</strong> A wallet may drop the memo from your payment request, or the customer may edit it. A newly detected note can also appear before the wallet has fetched its memo.</li>
<li><strong>Keep personal data out.</strong> Use an opaque reference; names and emails belong in your own database.</li>
<li><strong>Messaging costs a transaction.</strong> A memo only travels attached to a payment, so each "message" pays a network fee. The recipient learns nothing about the sender unless the sender writes a reply address into the memo, and ZIP 302 does not define a standard field for that.</li>
</ul>

<h2>Where memos are heading</h2>
<p>ZIP 231, "Memo Bundles" (status: Draft), proposes moving memo data out of outputs into a per-transaction bundle of encrypted chunks, which would allow larger memos "with a proportionate increase in fees" and memos shared between recipients. It is a proposal, not a deployed feature, and it is not among the ZIPs planned for NU7. Build against the 512-byte memo that exists today.</p>

<h2>Try it</h2>
<p>Write the two functions above (or Python equivalents) and test them with: an ASCII order reference; a string containing <code>₦</code>, checking its byte length; a 600-character string, which must be rejected; <code>0xF6</code> followed by 511 zeros; and a buffer starting with <code>0xFF</code>. Then, on regtest, send yourself a payment with a hex-encoded text memo using <code>z_sendmany</code>, read it back with <code>z_listunspent</code>, and check your decoder agrees with <code>memoStr</code>.</p>

<h2>Key takeaways</h2>
<ul>
<li>Every shielded output has a 512-byte encrypted memo; transparent outputs have none.</li>
<li>The first byte decides the interpretation: up to <code>0xF4</code> is UTF-8 text, <code>0xF6</code> plus zeros is "no memo", <code>0xFF</code> is arbitrary data.</li>
<li>Only holders of a suitable viewing key (and the sender's own wallet) can read a memo, but it is plaintext once your application has decrypted it.</li>
<li>A memo is untrusted input: match payments by address and amount, and validate and escape memo content.</li>
<li>Memo bundles (ZIP 231) are a draft proposal, not part of NU7.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zips.z.cash/zip-0302">ZIP 302: Standardized Memo Field Format (Draft)</a></li>
<li><a href="https://zips.z.cash/zip-0321">ZIP 321: Payment Request URIs (the <code>memo</code> parameter)</a></li>
<li><a href="https://zips.z.cash/zip-0231">ZIP 231: Memo Bundles (Draft)</a></li>
<li><a href="https://zips.z.cash/zip-0316">ZIP 316: Unified Addresses and Unified Viewing Keys</a></li>
<li><a href="https://github.com/zcash/zallet">Zallet repository (JSON-RPC reference for <code>z_sendmany</code>, <code>z_listunspent</code>, <code>z_viewtransaction</code>)</a></li>
</ul>`,
  },
  "l-02-10": {
    title: "Error Handling in Zcash Apps",
    subtitle: "Recognise the failure modes specific to Zcash apps and decide, for each, whether to wait, retry, rebuild or alert.",
    content: `<p>Most of what goes wrong in a Zcash application is ordinary: a timeout, a bad parameter, a full disk. This lesson is about the failures that are specific to the stack you are using, where the right response is not obvious and the wrong one can lose money or pay someone twice.</p>
<p>Your app talks to a wallet (Zallet), which talks to a node (Zebra), which talks to the network. An error can start at any layer.</p>

<h2>Is the stack ready at all?</h2>
<p>Check readiness before you interpret any answer. An empty list from a wallet that is still syncing is not the same as "no payment".</p>
<table>
<thead><tr><th>Check</th><th>What it tells you</th></tr></thead>
<tbody>
<tr><td>Zebra <code>GET /ready</code> on its health port</td><td><code>200</code> when the node is near the network tip; <code>503</code> while syncing, lagging, or short of peers. The Z3 FAQ notes the body names the reason (for example <code>syncing</code> or <code>insufficient peers</code>).</td></tr>
<tr><td>Zallet <code>getwalletstatus</code></td><td><code>node_tip</code> versus <code>wallet_tip</code>, and a <code>locked</code> flag: while the wallet is catching up or recovering from a reorg, balance and spend methods return an error rather than answer from a partial view.</td></tr>
<tr><td>Zebra <code>getdeprecationinfo</code></td><td>On Mainnet, the <code>end_of_service</code> block height for this release. Zebra's source says: "The node halts when the chain tip goes past this height."</td></tr>
</tbody>
</table>
<p>The last row deserves its own alert: the only fix for a halted node is an upgrade.</p>

<h2>Failure modes when sending</h2>
<table>
<thead><tr><th>What happened</th><th>How it shows up</th><th>Response</th></tr></thead>
<tbody>
<tr><td>Not enough spendable funds</td><td>The send fails, usually as a <code>failed</code> operation rather than an immediate error, because sending is asynchronous. Often the money exists but is not yet spendable: received notes need 10 confirmations by default, the wallet's own change needs 3. The exact wording is not stable in the beta, so capture what your version returns.</td><td>Wait for confirmations; do not lower the thresholds to make the error go away.</td></tr>
<tr><td>Key store locked</td><td>Message "Wallet is locked", with error code <code>-13</code></td><td>Unlock with <code>walletpassphrase</code>; alert an operator.</td></tr>
<tr><td>Privacy policy refused</td><td>"This transaction would … which is not enabled by default …"</td><td>Do not auto-weaken the policy. Decide deliberately whether the leak is acceptable.</td></tr>
<tr><td>Node still syncing</td><td>Zebra: "mempool is disabled since synchronization is behind the chain tip"</td><td>Wait for <code>/ready</code>, then retry.</td></tr>
<tr><td>Fee too low</td><td>Zebra: "Transaction fee is below the minimum fee rate" or "Unpaid actions is higher than the limit"</td><td>Zallet always computes ZIP 317 fees, so this points at a transaction built elsewhere. Ask the node with <code>getstandardfee</code>; do not hardcode.</td></tr>
<tr><td>Transaction expired</td><td><code>z_viewtransaction</code> reports <code>status: "expired"</code>; a <code>confirmations</code> value of <code>-1</code> means the transaction cannot be mined</td><td>Safe to build a new transaction. See below.</td></tr>
</tbody>
</table>
<p>Both Zallet and Zebra return JSON-RPC error objects with a numeric <code>code</code> and a <code>message</code>, using Bitcoin-style codes inherited from zcashd (<code>-5</code> is an invalid address or key, <code>-8</code> an invalid parameter). Branch on the code, log the message, and avoid parsing message text, which can change between beta releases.</p>

<h2>Expiry, stale anchors and reorgs</h2>
<p><strong>Expiry.</strong> Every transaction carries an expiry height (ZIP 203). If it has not been mined by that height it is dropped from mempools and can never be mined. The default is 40 blocks after the current height, about 50 minutes at 75-second blocks. Expiry is useful: it is the definite point at which a stuck payment is dead and can be rebuilt.</p>
<p><strong>Stale anchors.</strong> A shielded spend proves its note exists relative to an <strong>anchor</strong>, a past root of the note commitment tree. ZIP 315 warns that "if the chain rolls back past the block at which the anchor is chosen, then the anchor and the transaction will be invalidated". The wallet picks anchors for you, but a transaction caught by a reorg must be rebuilt, not resubmitted.</p>
<p><strong>Reorgs.</strong> A block your payment was in can be replaced. A payment you saw with 1 confirmation can return to 0, or vanish if it conflicted with another spend. So wait for a confirmation threshold, and re-read <code>confirmations</code> on each poll instead of counting upwards from the first sighting.</p>

<h2>Sends are asynchronous</h2>
<p><code>z_sendmany</code> returns an operation id immediately and proves in the background. Poll <code>z_getoperationstatus</code>, then collect the outcome with <code>z_getoperationresult</code>, which also removes it. Operations live in memory and do not survive a Zallet restart.</p>
<blockquote>Never retry a send just because you lost track of it. First check <code>z_listtransactions</code> or <code>z_viewtransaction</code> to see whether the transaction was created and broadcast. A blind retry is how a refund gets paid twice.</blockquote>
<p>Make money-moving actions idempotent: record the intent in your database before calling the wallet, store the operation id and then the txid against it, and on restart resolve unfinished intents by looking up what happened.</p>

<h2>Try it</h2>
<p>On regtest, provoke three errors and record the exact JSON returned: call <code>z_sendmany</code> for more than your balance; send to a transparent address with the default privacy policy; and stop the Zebra container, then call <code>getwalletstatus</code>. Classify each as "wait", "retry", "rebuild" or "alert a human".</p>

<h2>Key takeaways</h2>
<ul>
<li>Check readiness (<code>/ready</code>, <code>getwalletstatus</code>) before treating an empty answer as a real one.</li>
<li>"Insufficient funds" often means "not confirmed yet"; the fix is to wait.</li>
<li>Expired transactions are definitively dead and safe to rebuild; unexpired ones are not.</li>
<li>Sends are asynchronous and operation ids are lost on restart, so record intent first and never retry blindly.</li>
<li>Re-read confirmations every poll, because reorgs can reduce them.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zips.z.cash/zip-0203">ZIP 203: Transaction Expiry</a></li>
<li><a href="https://zips.z.cash/zip-0317">ZIP 317: Proportional Transfer Fee Mechanism</a></li>
<li><a href="https://zips.z.cash/zip-0315">ZIP 315: Best Practices for Wallet Implementations (Draft)</a></li>
<li><a href="https://github.com/ZcashFoundation/zebra">Zebra repository (book: "Zebra Health Endpoints"; RPC source in <code>zebra-rpc</code>)</a></li>
<li><a href="https://github.com/zcash/zallet">Zallet repository (book: "Troubleshooting", "Asynchronous operations", "Notes, confirmations, and fees")</a></li>
</ul>`,
  },
  "l-02-11": {
    title: "Testing with Testnet & Regtest",
    subtitle: "Choose the right network for each test, mine blocks on demand in regtest, get test ZEC, and account for Testnet's NU7 differences.",
    content: `<p>Zcash gives you three networks to run your code against. <strong>Regtest</strong> is a private chain on your own machine where you mine blocks on demand. <strong>Testnet</strong> is a public network with real peers, real block timing and coins that have no value. <strong>Mainnet</strong> is the real chain. A payment gateway should pass through all three, in that order, and most of its tests belong on the first.</p>
<p>You have used regtest since Week 5. This lesson is about using each network deliberately: what each can prove, what it cannot, and one trap that exists right now, in October 2026, because Testnet is running a network upgrade that Mainnet is not.</p>

<h2>Three networks, three jobs</h2>
<table>
<thead><tr><th></th><th>Regtest</th><th>Testnet</th><th>Mainnet</th></tr></thead>
<tbody>
<tr><td>Use it for</td><td>Development and automated tests</td><td>Staging against a public network</td><td>Production</td></tr>
<tr><td>Blocks</td><td>Mined on demand</td><td>From the network</td><td>From the network</td></tr>
<tr><td>Peers</td><td>None</td><td>Test peers</td><td>Real peers</td></tr>
<tr><td>First sync (Z3 README)</td><td>Seconds</td><td>2–12 hours</td><td>24–72 hours</td></tr>
<tr><td>Chain state on disk</td><td>Negligible</td><td>About 30 GB</td><td>About 300 GB</td></tr>
<tr><td>Coins</td><td>Yours to mine</td><td>Test ZEC (TAZ), no value</td><td>ZEC</td></tr>
<tr><td>Z3 RPC authentication</td><td>Username and password</td><td>Cookie file</td><td>Cookie file</td></tr>
</tbody>
</table>
<p>Z3 runs each network as an independent Compose project with its own ports and volumes, so all three can live on one host.</p>

<h2>Regtest: you control time</h2>
<p>On regtest nothing happens until you mine. That makes it ideal for testing a confirmation policy, because you decide exactly when each confirmation arrives. Z3's regtest configuration activates every upgrade up to NU6.3 by block 2, so the Ironwood pool is available almost immediately.</p>
<p>Zebra exposes a <code>generate</code> RPC method on regtest. This is the call Z3's own <code>regtest-init.sh</code> script uses, pointed at Zebra's regtest host port:</p>
<pre><code>curl -s -u zebra:zebra -X POST -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"generate","params":[1],"id":1}' \\
  http://127.0.0.1:29232</code></pre>
<p>Change the number in <code>params</code> to mine several blocks at once. The <code>zebra</code>/<code>zebra</code> credentials are hardcoded for regtest only. To start from a clean chain, stop the stack with <code>down -v</code> and run <code>./scripts/regtest-init.sh</code> again.</p>
<p>With that one command you can script the cases that are slow or impossible to arrange on a public network:</p>
<ul>
<li><strong>Each state transition.</strong> Send a payment, mine 0, 1, 9, then 10 blocks, and assert your invoice status after each step.</li>
<li><strong>Expiry.</strong> Create an invoice, mine past its deadline without paying, then pay it late.</li>
<li><strong>Restart safety.</strong> Stop your gateway between "detected" and "paid", mine the remaining blocks, start it again, and check that it finishes the job exactly once.</li>
<li><strong>Reorgs.</strong> Zebra has <code>invalidateblock</code> and <code>reconsiderblock</code> methods that remove and restore a block that is not yet finalised. Use them to check that your gateway re-reads confirmations and does not simply count upwards.</li>
</ul>
<p>What regtest cannot show you: network latency, irregular block intervals, other people's transactions in the mempool, a node that falls behind its peers, or how long a real sync takes. For those you need a public network.</p>

<h2>Testnet: real conditions, worthless coins</h2>
<p>Z3's Testnet start-up is the same two-phase flow as Mainnet: start Zebra, wait until it is synced, then start the wallet.</p>
<pre><code>./scripts/setup-network.sh testnet
docker compose --env-file .env.testnet up -d zebra
./scripts/check-zebra-readiness.sh 18080
docker compose --env-file .env.testnet up -d</code></pre>
<p>The regtest init script creates the Zallet wallet for you. On Testnet and Mainnet you initialise it yourself, once per network; the Z3 FAQ gives the commands.</p>
<p>You get TAZ from a <strong>faucet</strong>, a community-run service that sends small amounts on request. Faucets come and go, so check before relying on one. As of 7 October 2026, <a href="https://fauzec.com">fauzec.com</a> was live and stated that it sends 1 TAZ per address every 24 hours to Unified or Sapling addresses. ZecHub's faucet page also lists a second Testnet faucet. If one is down, ask in the programme's community channel: another learner can send you TAZ in seconds.</p>
<blockquote>Never reuse a Mainnet seed phrase on Testnet or regtest, and never paste a Mainnet seed into a test tool. ZIP 326 assumes that a secure wallet "strictly segregates key material between Testnet and Mainnet". Generate throwaway keys for every test environment.</blockquote>

<h2>Testnet is ahead of Mainnet right now</h2>
<p>Network upgrades activate on Testnet first. NU7 activated on Testnet at height 4,465,026 in early October 2026. It has no Mainnet activation height yet. Until it does, the two networks behave differently in ways that matter to a payment application:</p>
<table>
<thead><tr><th></th><th>Mainnet (October 2026)</th><th>Testnet (after NU7)</th></tr></thead>
<tbody>
<tr><td>Block target spacing</td><td>75 seconds</td><td>25 seconds (ZIP 218)</td></tr>
<tr><td>10 confirmations takes about</td><td>12.5 minutes</td><td>A little over 4 minutes</td></tr>
<tr><td>Recommended default transaction expiry</td><td>40 blocks</td><td>120 blocks (both about 50 minutes)</td></tr>
<tr><td><code>getstandardfee</code> result</td><td>5,000 zatoshis per logical action until height 3,590,000, then 1,000</td><td>1,000 zatoshis per logical action</td></tr>
<tr><td>Per-block shielded action limits</td><td>None yet</td><td>ZIP 218 limits enforced</td></tr>
<tr><td>Zebra version needed</td><td>Current stable 6.x release</td><td>7.0.0-rc.0 or later; from NU7 activation, Testnet nodes disconnect Zebra 6.x peers</td></tr>
</tbody>
</table>
<p>Three practical consequences. First, if your Z3 checkout pins an older Zebra image, a Testnet node will not follow the chain past NU7: override the pin with <code>Z3_ZEBRA_IMAGE</code>, and check that the Zallet and Zaino versions you run are compatible with that Zebra release before you rely on them. Second, never hardcode "one block is 75 seconds" or a fee constant. Keep thresholds in blocks, ask the node for the fee, and make the network an explicit setting in your own configuration. Third, Testnet block times are irregular: it has a rule that allows a minimum-difficulty block when more than 450 seconds pass without one, so expect bursts and gaps that Mainnet does not have.</p>
<p>The reverse also holds. A timing test that passes on Testnet today tells you how your app will behave on Mainnet after NU7, not how it behaves on Mainnet now.</p>

<h2>Try it</h2>
<p>Write a short script (shell, Python or TypeScript) against your regtest stack that: creates an invoice address with <code>z_getaddressforaccount</code>; pays it with <code>z_sendmany</code>; then mines one block at a time with <code>generate</code>, printing the <code>confirmations</code> value from <code>z_listunspent</code> (with <code>minconf</code> 0) after each block until it reaches 10. Keep the script. It is the skeleton of the automated test for your lab submission.</p>

<h2>Key takeaways</h2>
<ul>
<li>Regtest gives you control of block production, so it is where confirmation, expiry, restart and reorg logic gets tested.</li>
<li>Testnet adds real peers, timing and sync, with valueless TAZ from community faucets.</li>
<li>As of October 2026, Testnet runs NU7 and Mainnet does not: 25-second versus 75-second blocks, different standard fees, and a different required Zebra version.</li>
<li>Write time and fee logic in terms of blocks and node-reported values so it survives the difference.</li>
<li>Keep test keys and Mainnet keys completely separate.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://github.com/ZcashFoundation/z3">Z3 repository (README, <code>docs/regtest.md</code>, <code>docs/faq.md</code>)</a></li>
<li><a href="https://github.com/ZcashFoundation/zebra">Zebra repository (book: "Regtest with Zebra"; CHANGELOG entry for 7.0.0-rc.0)</a></li>
<li><a href="https://zips.z.cash/zip-0218">ZIP 218: 25-second Block Target Spacing (Draft)</a></li>
<li><a href="https://zips.z.cash/zip-0259">ZIP 259: Deployment of the NU7 Network Upgrade (Draft)</a></li>
<li><a href="https://zechub.wiki/using-zcash/faucets">ZecHub: Faucets</a></li>
</ul>`,
  },
  "l-02-12": {
    title: "Security Best Practices",
    subtitle: "Apply least privilege to Zcash keys, lock down RPC and backups, and avoid leaking customer data your chain choice was meant to protect.",
    content: `<p>A Zcash application protects two things an ordinary web app does not. One is <strong>spending authority</strong>: whoever holds the keys holds the money, and no bank will reverse a theft. The other is <strong>privacy</strong>: shielded transactions hide a great deal on chain, and a careless application can give it away again through its logs, database or network traffic.</p>
<p>This lesson is a working checklist for your gateway. Nothing here makes a system secure in an absolute sense; each item removes one specific way of losing funds or leaking data.</p>

<h2>Give each component the weakest key that works</h2>
<p>Zcash keys form a ladder. Each rung can do less than the one above, and can be derived from it but not the other way round.</p>
<table>
<thead><tr><th>Holding this</th><th>Lets you</th><th>If it leaks</th></tr></thead>
<tbody>
<tr><td>Seed phrase / spending key</td><td>Spend, and everything below</td><td>Funds can be stolen</td></tr>
<tr><td>Unified Full Viewing Key (UFVK)</td><td>See incoming and outgoing payments for the account; derive addresses</td><td>Complete financial history exposed; funds safe</td></tr>
<tr><td>Unified Incoming Viewing Key (UIVK)</td><td>See incoming payments; derive addresses</td><td>Incoming history exposed; funds safe</td></tr>
<tr><td>An address</td><td>Send to it</td><td>Nothing on chain for shielded receivers</td></tr>
</tbody>
</table>
<p>A payment watcher only needs incoming payments, so in principle a UIVK is enough for it. Zallet's <code>z_exportviewingkey</code> returns a UFVK by default and a UIVK when <code>ivk</code> is true; its documentation warns that the UIVK covers "every pool in the account", not just the address you asked about.</p>
<p>In practice, as of October 2026, your Zallet instance holds the seed, because Zallet cannot yet import a unified viewing key into a second, watch-only instance. So reduce what a compromise can cost:</p>
<ul>
<li><strong>Keep the balance on the server small.</strong> Sweep takings regularly to a wallet whose keys are not on any internet-facing machine.</li>
<li><strong>Use a passphrase-protected encryption identity.</strong> Zallet then starts with its key store locked, and anything that needs spending keys fails with "Wallet is locked" until someone supplies the passphrase. Detecting payments does not use spending keys, so test which of your gateway's calls still work while the wallet is locked and keep it locked whenever you can.</li>
</ul>

<h2>Know exactly what Zallet protects</h2>
<p>The Zallet book's threat model is precise, and worth reading in full. The points that most affect you:</p>
<ul>
<li>Seed phrases and spending keys are stored in <code>wallet.db</code> encrypted with <a href="https://age-encryption.org/">age</a>. Decrypting them needs the separate <strong>encryption identity</strong> file.</li>
<li><code>wallet.db</code> as a whole is <strong>not</strong> encrypted. Transaction history, addresses and viewing keys are in the clear. Anyone who copies the file learns everything a UFVK would tell them.</li>
<li>The database and the identity file together grant full spending access. In the Z3 stack both live in the one <code>z3-&lt;network&gt;-zallet</code> volume, which is convenient to back up and therefore a single thing to steal. Encrypt backups before they leave the host, and do not store the identity in the same archive as the database.</li>
<li>Losing the identity file, or its passphrase, makes the key material in every copy of the database permanently undecryptable.</li>
<li>Pass secrets to <code>zallet rpc</code> with the <code>@PATH</code> form (<code>@-</code> reads standard input), not as arguments that appear in process listings and shell history.</li>
</ul>
<blockquote>Zallet is beta software. Its README says breaking changes "may occur at any time, requiring you to delete and recreate your Zallet wallet". Back up your seed phrase, seed fingerprint, account index and birthday height independently of any Zallet database, and keep the balance on it small.</blockquote>

<h2>Keep RPC off the internet</h2>
<p>Zallet's operations guide is blunt: "Never bind to a public IP address. Anyone who can reach the RPC port can view your transactions and spend your funds." Its RPC server is off unless you configure <code>rpc.bind</code>, requires authentication on every request, and writes a cookie credential to <code>{datadir}/.cookie</code> that "grants full wallet access".</p>
<ul>
<li>Bind RPC to loopback or a private network. For remote administration use an SSH tunnel or a VPN, as the Zallet book recommends.</li>
<li>Zebra's <code>/healthy</code> and <code>/ready</code> endpoints are unauthenticated. Its book says to bind them to an internal address and restrict exposure.</li>
<li>Check what your containers publish. Z3's Compose file maps the Zebra RPC, Zebra health and Zallet RPC ports without naming a host address, and Docker publishes such ports on every interface. On a public server, put a firewall or security group in front, then test from another machine that they are closed.</li>
</ul>

<h2>Do not undo the privacy the chain gives you</h2>
<ul>
<li><strong>Logs and analytics.</strong> An invoice row links a customer to an address, amount, memo and transaction id: exactly the link a shielded payment hides from everyone else. Restrict access to that table, and keep addresses, memos and viewing keys out of logs, error trackers and analytics. Zallet itself logs only RPC method names, never parameters.</li>
<li><strong>Transparent receivers.</strong> A payment to a transparent address is public, and transparent addresses can be linked through the transaction graph. Issue shielded-only addresses.</li>
<li><strong>Pool crossings.</strong> When value moves between pools, the amount that crosses is public. Zallet's <code>z_sendmany</code> defaults to the <code>FullPrivacy</code> policy, which refuses any transaction that is not fully shielded within one pool. Leave the default in place; weaken it for a single call only when you have decided the specific leak is acceptable.</li>
<li><strong>The network layer.</strong> Encryption on chain does not hide who is asking: a server that answers wallet queries sees the client's IP address and its requests. The Zaino README cites this as a reason for anonymous transports "such as Nym or Tor". Running your own Zebra keeps your gateway's queries off third-party servers.</li>
<li><strong>Payment pages.</strong> The QR code and URI show the address, amount and memo in readable form. Serve them over HTTPS and keep third-party scripts off the page.</li>
</ul>

<h2>Pin, verify and update</h2>
<p>Z3 pins image versions so that a pull cannot silently change your node, and pins Zallet by image digest; Zallet's releases ship with signed provenance and are reproducible. Do the same in your own code: commit lockfiles, install Rust tools with <code>--locked</code>, and review dependency updates.</p>
<p>Pinning is not a reason to stay behind. Zebra 6.4.2 (September 2026) fixed a remotely triggerable denial of service in version 6 transaction parsing. Watch the releases of every component you run, and treat a security release as urgent.</p>

<h2>Try it</h2>
<p>Write a one-page threat model for your gateway in three columns: what an attacker could obtain (the web server, the database, a backup file, the Zallet volume, a log archive), what they could then do (read history, link customers to payments, spend), and what limits them. Then search your gateway's logging calls and confirm that no address, memo or key can reach a log line.</p>

<h2>Key takeaways</h2>
<ul>
<li>Viewing keys can watch but not spend; give each component the weakest key that lets it do its job, and keep the hot balance small.</li>
<li>Zallet encrypts spending keys but not history or viewing keys; the database plus the identity file equals spending access.</li>
<li>RPC and health ports belong on loopback or a private network, and you should verify that from outside.</li>
<li>Your own logs, transparent receivers, pool crossings and network metadata are where a shielded application leaks.</li>
<li>Pin versions for control, and update promptly for security fixes.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zcash.github.io/zallet/">Zallet user guide (Threat model, Wallet encryption, Backup and restore, Operating Zallet)</a></li>
<li><a href="https://zips.z.cash/zip-0316">ZIP 316: Unified Addresses and Unified Viewing Keys</a></li>
<li><a href="https://github.com/ZcashFoundation/z3">Z3 repository (README "Running in production"; <code>docker-compose.yml</code>)</a></li>
<li><a href="https://github.com/zingolabs/zaino">Zaino repository (README, on network-level privacy)</a></li>
<li><a href="https://github.com/ZcashFoundation/zebra/security/advisories/GHSA-h5rr-8pqv-grp9">Zebra security advisory GHSA-h5rr-8pqv-grp9 (fixed in 6.4.2)</a></li>
</ul>`,
  },
  "l-02-13": {
    title: "Performance & Bandwidth Optimization",
    subtitle: "Cut the scanning, polling and download costs of a Zcash app, with real numbers for what shielded sync costs on metered data.",
    content: `<p>Performance in a Zcash application is rarely about CPU in your own code. The costs that matter are the ones the protocol imposes: every shielded output on the chain is a candidate your wallet must download and try to decrypt, and every customer watching a payment page is a client asking "has it arrived yet?". Many of your customers will be on mobile data metered by the megabyte, so bandwidth costs them money.</p>

<h2>What shielded sync costs</h2>
<p>You saw in the sync lesson that a light wallet downloads compact blocks. ZIP 218 puts a size on them: a compact Orchard-protocol action (Orchard or Ironwood) is <strong>148 bytes</strong>; a compact Sapling output is 116 bytes and a Sapling spend 32 bytes; a compact block header is about 90 bytes. A wallet downloads these for every shielded transaction on the network, not only its own.</p>
<p>ZIP 218 also works out the <em>worst case</em>, in which an attacker fills every block with shielded outputs:</p>
<table>
<thead><tr><th></th><th>Today (75 s blocks, no per-pool limits)</th><th>ZIP 218 (25 s blocks, action limits)</th></tr></thead>
<tbody>
<tr><td>Blocks per day</td><td>1,152</td><td>3,456</td></tr>
<tr><td>Maximum Orchard-protocol actions per block</td><td>About 617 (limited by block size)</td><td>330</td></tr>
<tr><td>Worst-case compact sync download per day</td><td>About 270.5 MB</td><td>169.10 MB</td></tr>
<tr><td>Worst-case trial decryptions per day</td><td>About 4.8 million</td><td>About 2.3 million</td></tr>
<tr><td>Compact block headers per day</td><td>About 0.10 MB</td><td>0.31 MB</td></tr>
</tbody>
</table>
<p>The right-hand column rests on consensus rules planned for NU7: at most 330 Orchard actions, 330 Ironwood actions and 300 Sapling inputs plus outputs per block, within a shared budget of 330. They are active on Testnet, not yet on Mainnet. These are ceilings, not typical usage: the ZIP notes that "regular user flows impose far lower costs". The cost that rises for everyone is headers, by roughly 0.2 MB per day.</p>

<h2>Scan less</h2>
<ul>
<li><strong>Set a birthday height.</strong> A wallet created today has no reason to download years of history. Record the birthday when you create an account and supply it on restore. Zallet's <code>z_recoveraccounts</code> requires a <code>birthday_height</code>; its backup guide notes that an earlier guess works "but slows recovery down".</li>
<li><strong>Do not rescan.</strong> Wallet state is expensive to rebuild. Back up the wallet database so that a crash means catching up a few blocks, not starting again.</li>
<li><strong>One account, many addresses.</strong> Zallet's documentation says each account "adds an additional performance cost to wallet scanning". Diversified addresses under one account cost nothing extra to scan. Use them for invoices.</li>
</ul>

<h2>Poll less</h2>
<p>New information arrives only when a block is mined or a transaction enters the mempool.</p>
<ul>
<li><strong>Check the tip first.</strong> One cheap call (Zebra's <code>getbestblockhash</code>, or Zallet's <code>getwalletstatus</code>) tells you whether anything has changed. Only when the tip moves do you re-read confirmations for open invoices.</li>
<li><strong>Query open invoices only.</strong> Paid and long-expired invoices do not need polling. Finalised history never changes, so cache it in your own database and serve it from there.</li>
<li><strong>Page through history.</strong> Zallet's <code>z_listtransactions</code> accepts <code>start_height</code>, <code>end_height</code>, <code>offset</code> and <code>limit</code>. Use them.</li>
<li><strong>Be gentle with your node.</strong> The Z3 FAQ explains that Zebra serves RPC from the same worker pool that verifies blocks, with no per-client rate limit, so a highly concurrent consumer can slow the node's own sync.</li>
<li><strong>Batch payouts.</strong> <code>z_sendmany</code> takes a list of recipients, so ten refunds can be one transaction to build and track. ZIP 317 fees scale with the number of logical actions, so batching reduces overhead without making payments free.</li>
</ul>

<h2>Respect the customer's data plan</h2>
<p>The payment page is where your customer's megabytes go. Its job is to show a QR code and one line of status.</p>
<ul>
<li><strong>Generate the QR code as SVG or on the client</strong> from the URI string. A ZIP 321 URI is a few hundred bytes; a PNG of it is many times larger.</li>
<li><strong>Make the status endpoint tiny.</strong> Return a few fields of JSON (<code>status</code>, <code>confirmations</code>, <code>required</code>), not the whole invoice.</li>
<li><strong>Slow the polling down.</strong> Blocks arrive on the order of a minute apart on Mainnet today. Poll every few seconds only until the payment is first detected, then back off to roughly the block interval while confirmations accumulate. Stop when the page is hidden.</li>
<li><strong>Let the customer leave.</strong> The payment completes on chain whether or not the page is open. Say so, so nobody keeps a tab polling for ten confirmations.</li>
</ul>

<h2>Try it</h2>
<p>Work out two numbers. From the table: under the worst case, how many megabytes would a wallet download in a 30-day month today and under ZIP 218, and what would that cost at your local mobile data price? For your gateway: how many RPC calls per hour does the watcher make with 50 open invoices if it polls each every 5 seconds, and how many if it re-reads only when a new block arrives?</p>

<h2>Key takeaways</h2>
<ul>
<li>Shielded sync costs bandwidth for every shielded action on the network: 148 bytes per Orchard-protocol action in compact form.</li>
<li>ZIP 218's per-block action limits, planned for NU7, cap the worst case at about 169 MB per day, down from about 270 MB.</li>
<li>Birthday heights, one account with many addresses, and never rescanning are the main ways to scan less.</li>
<li>Poll on new blocks, not on a timer, and only for invoices that are still open.</li>
<li>Keep the payment page small and its status polling slow; the customer may be paying per megabyte.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zips.z.cash/zip-0218">ZIP 218: 25-second Block Target Spacing (Draft), including the shielded sync bandwidth analysis</a></li>
<li><a href="https://zips.z.cash/zip-0317">ZIP 317: Proportional Transfer Fee Mechanism</a></li>
<li><a href="https://github.com/zcash/lightwallet-protocol">zcash/lightwallet-protocol (the compact block format the byte counts refer to)</a></li>
<li><a href="https://zcash.github.io/zallet/">Zallet user guide (JSON-RPC reference; Backup and restore)</a></li>
<li><a href="https://github.com/ZcashFoundation/z3">Z3 repository (<code>docs/faq.md</code>, on heavy RPC consumers)</a></li>
</ul>`,
  },
  "l-02-14": {
    title: "Deploying to Production",
    subtitle: "Plan a Mainnet deployment of the Z3 stack: sizing, sync, backups, monitoring, upgrades, and what beta software means for real funds.",
    content: `<p>Moving from regtest to Mainnet changes very little in your code and almost everything around it. Blocks now come from a network you do not control, the chain takes days to sync, the node software stops working if you neglect it, and the coins are real. This lesson is the operations plan that sits beside your gateway.</p>
<p>It follows the Z3 stack you already run. The Z3 README has a "Running in production" section written for this step; read it in full before you deploy. This lesson explains the decisions it asks you to make.</p>

<h2>Be honest about maturity first</h2>
<table>
<thead><tr><th>Component</th><th>Status (October 2026)</th><th>What that means for you</th></tr></thead>
<tbody>
<tr><td>Zebra</td><td>Stable releases; the consensus node for Mainnet</td><td>Run a current release and keep it upgraded</td></tr>
<tr><td>Zallet</td><td>Beta</td><td>Its README warns that breaking changes "may occur at any time, requiring you to delete and recreate your Zallet wallet", and that many RPC methods are not yet implemented</td></tr>
<tr><td>Zaino</td><td>Optional in Z3 (the <code>indexer</code> profile)</td><td>Only needed if you serve light wallets; your gateway does not need it</td></tr>
</tbody>
</table>
<blockquote>Do not treat a beta wallet as a vault. If you run Zallet on Mainnet, keep only a small working balance on it, sweep takings to a wallet you control elsewhere, and keep the seed phrase and recovery details backed up independently so that recreating the wallet is an inconvenience and not a loss.</blockquote>
<p>For a business that is not ready to operate this stack, an existing processor may be the right production answer; ZecHub's Payment Processors page compares the current options.</p>

<h2>Size the host and plan the first sync</h2>
<p>Zebra's book recommends 4 CPU cores, 16 GB of RAM, a 100 Mbps connection and 300 GB of free disk, and expects disk use to grow; Z3 suggests 500 GB or more and strongly recommends SSD. Budget bandwidth too: the first sync downloads roughly 300 GB, and the recommended allowance is 300 GB of traffic per month.</p>
<p>The first Mainnet sync takes 24 to 72 hours. The wallet cannot serve you until the node is synced, so Z3 starts in two phases:</p>
<pre><code>git clone https://github.com/ZcashFoundation/z3 &amp;&amp; cd z3

# 1. One-time setup: creates the local config files.
./scripts/setup-network.sh mainnet

# 2. Start Zebra and wait for it to sync. The poller exits when Zebra is ready.
docker compose --env-file .env.mainnet up -d zebra
./scripts/check-zebra-readiness.sh

# 3. Start Zallet once Zebra is synced.
docker compose --env-file .env.mainnet up -d</code></pre>
<p>Running step 3 early makes Zallet restart in a loop until the sync catches up. Unlike regtest, the Mainnet wallet is not initialised for you: the Z3 FAQ gives the one-time commands (<code>generate-encryption-identity</code>, <code>init-wallet-encryption</code>, then creating or importing a mnemonic). Do the Zallet book's backup confirmation step before you publish a single address.</p>

<h2>The decisions Z3 leaves to you</h2>
<ul>
<li><strong>Where the chain lives.</strong> By default it is a Docker volume under <code>/var/lib/docker</code>. To use a dedicated disk, set <code>Z3_CHAIN_DATA_PATH</code> and run <code>./scripts/fix-permissions.sh zebra &lt;path&gt;</code> before the first start.</li>
<li><strong>Wallet backup.</strong> The only volume worth backing up is <code>z3-mainnet-zallet</code>. It holds the wallet database and the age identity that decrypts it. Chain state can be re-synced. Encrypt the backup before it leaves the host, because the volume alone is enough to spend. Separately, write down each account's seed fingerprint, ZIP 32 account index, name and birthday height: the Zallet book lists these as required to restore from a mnemonic.</li>
<li><strong>Log rotation.</strong> Z3 does not set a logging driver. Without size limits in <code>/etc/docker/daemon.json</code>, logs grow without bound on a node that runs all day, every day.</li>
<li><strong>Network exposure.</strong> Zebra's peer-to-peer port (8233 on Mainnet) is meant to be reachable. Nothing else is. Confirm from outside the host that the RPC, health and wallet ports are closed, as the security lesson described.</li>
</ul>
<p>Never run <code>docker compose down -v</code> on Mainnet without thinking: <code>-v</code> deletes the volumes, which means a full re-sync and, without a backup, the wallet.</p>

<h2>Monitor the things that fail silently</h2>
<p>Z3 ships Prometheus, Grafana, Jaeger and AlertManager behind a profile:</p>
<pre><code>docker compose --env-file .env.mainnet --profile monitoring up -d</code></pre>
<p>Whatever tooling you use, alert on these:</p>
<ul>
<li><strong>Zebra readiness.</strong> <code>curl http://localhost:8080/ready</code> returns <code>ok</code> when the node is synced near the tip.</li>
<li><strong>Wallet lag.</strong> Zallet has no health endpoint yet; poll <code>getwalletstatus</code> and alert when <code>wallet_tip</code> stays behind <code>node_tip</code>.</li>
<li><strong>End of support.</strong> Poll <code>getdeprecationinfo</code> and alert weeks before the reported height.</li>
<li><strong>Disk space</strong> on the chain volume, and the age of your last successful wallet backup.</li>
<li><strong>Your own business signals</strong>: invoices stuck in "detected", and any payment to an expired invoice.</li>
</ul>

<h2>Upgrades are part of the job</h2>
<p>A Zcash node is not software you install once. According to Zebra's release process, each release is supported for about 12 weeks, and "when the Zcash chain reaches this end of support height, <code>zebrad</code> will shut down and the binary will refuse to start". Network upgrades add a second deadline: a node not upgraded before an activation height cannot follow the chain afterwards. NU7 is live on Testnet and had no Mainnet activation height as of early October 2026, so expect a required upgrade once one is announced.</p>
<p>Z3 pins image versions so that nothing changes by surprise, which also means a pin can be stale. Before your first Mainnet start, compare the Zebra and Zallet versions pinned in your Z3 checkout with each project's releases page; a Zebra release more than about 12 weeks old is at or near its end of support. The routine after that is deliberate:</p>
<ol>
<li>Read the release notes for Zebra, Zallet and Z3. Look for database format changes (Zebra 7.0.0-rc.0, for example, changes the state format so that downgrading needs a full re-sync) and, for Zallet, anything that requires recreating the wallet.</li>
<li>Take a fresh wallet backup.</li>
<li>Apply the upgrade on Testnet first and run your regtest suite against the new versions.</li>
<li>Bump the pin on Mainnet in a reviewed change (or set <code>Z3_ZEBRA_IMAGE</code> / <code>Z3_ZALLET_IMAGE</code>), pull, and recreate the service.</li>
<li>Watch <code>/ready</code> and <code>getwalletstatus</code> until both are healthy, then send a small test payment through the gateway.</li>
</ol>

<h2>Try it</h2>
<p>Write a one-page runbook for your gateway with five headings: first deployment, backup and restore, upgrade, "node not ready", and "payment not detected". Under each, list in order the commands from this lesson and the Z3 docs that you would run. Then rehearse one of them on regtest: work out how you would back up and restore the <code>z3-regtest-zallet</code> volume, and note every step you were unsure of.</p>

<h2>Key takeaways</h2>
<ul>
<li>Zebra is production software; Zallet is beta. Keep working balances small, sweep often, and keep independent recovery material.</li>
<li>Plan for about 300 GB of disk and a first sync of one to three days, started in two phases.</li>
<li>Back up the Zallet volume (encrypted) and record seed fingerprint, account index and birthday height.</li>
<li>Alert on node readiness, wallet lag, end-of-support height, disk space and stuck invoices.</li>
<li>Upgrading is mandatory and scheduled: Zebra releases expire after about 12 weeks, and network upgrades set hard deadlines.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://github.com/ZcashFoundation/z3">Z3 repository (README "Running in production", <code>docs/faq.md</code>)</a></li>
<li><a href="https://zebra.zfnd.org/user/requirements.html">Zebra book: System Requirements</a></li>
<li><a href="https://zcash.github.io/zallet/">Zallet user guide (Operating Zallet, Backup and restore)</a></li>
<li><a href="https://github.com/ZcashFoundation/zebra/releases">Zebra releases</a></li>
<li><a href="https://github.com/zcash/zallet/releases">Zallet releases</a></li>
<li><a href="https://zechub.wiki/using-zcash/payment-processors">ZecHub: Zcash Payment Processors</a></li>
</ul>`,
  },
}
