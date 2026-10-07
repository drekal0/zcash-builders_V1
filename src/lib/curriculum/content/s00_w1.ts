// AUTO-GENERATED from scratchpad lesson fragments. Do not edit by hand.
// Each entry: lesson id -> { title, subtitle, content (HTML) }.
import type { LessonContent } from './types'

export const M_s00_w1: Record<string, LessonContent> = {
  "l-00-01": {
    title: "What is a Blockchain?",
    subtitle: "Explain what a blockchain is, what a block contains, and why rewriting its history is so hard.",
    content: `<p>A blockchain is a ledger, a record of who paid whom, that thousands of independent computers each keep a full copy of and that none of them can quietly rewrite. This lesson gives you the working model for the rest of the programme: transactions go into blocks, each block points at the one before it, and every participant checks the rules for themselves.</p>
<p>Zcash is a blockchain of exactly this kind. The wallets, payment flows and node deployments you build later all sit on the structure described here, so get this picture right before any privacy technology enters it.</p>

<h2>The problem: digital money without a referee</h2>
<p>A digital coin is only data, and data can be copied. If Ada sends the same coin to Bola and to Chidi, something has to decide which payment counts. This is the <strong>double-spend problem</strong>. A bank solves it by keeping the one authoritative ledger. That works, but everyone has to trust the operator to keep honest records, and the operator can freeze, reverse or refuse payments.</p>
<p>Bitcoin, which launched in 2009, showed another way: broadcast every transaction to an open network and let the network agree on a single ordering, with no operator. Zcash launched on 28 October 2016 on the same ledger design. Its specification describes it as bridging the transparent payment scheme used by Bitcoin with a <em>shielded</em> payment scheme, which you will study from Week 3.</p>

<h2>Blocks and the links between them</h2>
<p>Transactions are grouped into <strong>blocks</strong>. A block is a small <strong>header</strong> followed by a list of transactions. A <strong>hash</strong> is a short, fixed-size fingerprint of some data (Lesson 3 covers how it works). These are the fields of a Zcash block header:</p>
<table>
  <thead><tr><th>Header field</th><th>What it is for</th></tr></thead>
  <tbody>
    <tr><td>Version</td><td>Which block rules apply. The only version defined for Zcash is 4.</td></tr>
    <tr><td>Previous block hash</td><td>The hash of the previous block's header. This is the link in the chain.</td></tr>
    <tr><td>Merkle root</td><td>One hash that commits to every transaction in the block (Lesson 5).</td></tr>
    <tr><td>Block commitments</td><td>A further hash committing to extra data, such as the chain's history.</td></tr>
    <tr><td>Time</td><td>When the miner started work on the block, according to the miner.</td></tr>
    <tr><td>Target (<code>nBits</code>)</td><td>How difficult the proof-of-work puzzle is for this block.</td></tr>
    <tr><td>Nonce and solution</td><td>The miner's answer to the puzzle (Week 2).</td></tr>
  </tbody>
</table>
<p>The first block is the <strong>genesis block</strong>, at <strong>height</strong> 0, and each later block is one higher. Because every header contains the hash of the header before it, changing anything in an old block changes that block's hash, so the next block's link no longer matches, and so on up to the newest block. You cannot edit history in one place; you would have to rebuild everything after it.</p>
<p>Blocks also obey size and content rules. A Zcash block must be no larger than 2,000,000 bytes and must contain at least one transaction. The first transaction is always the <strong>coinbase transaction</strong>, which pays out the newly created coins and the fees.</p>

<h2>Who keeps the chain</h2>
<p>A <strong>full node</strong> downloads every block, checks every rule itself, and passes valid blocks and transactions on to its peers. It does not take another node's word for anything. The full node this programme teaches is <strong>Zebra</strong> (<code>zebrad</code>), maintained by the Zcash Foundation.</p>
<p><strong>Miners</strong> assemble new blocks and compete to solve a computational puzzle called <strong>proof of work</strong>. As of October 2026, Zcash Mainnet is a proof-of-work chain that targets one block every 75 seconds. When nodes see competing chains, they follow the valid chain with the greatest total work. Rewriting an old block therefore means redoing its work and the work of every block after it, faster than the rest of the network extends the honest chain. Week 2 covers mining and consensus properly.</p>

<h2>What you get, and what you do not</h2>
<ul>
  <li><strong>No single operator.</strong> Anyone can run a node, verify the whole history and submit transactions without asking permission.</li>
  <li><strong>History that is costly to change.</strong> This is an economic guarantee, not an absolute one: the deeper a block is buried, the more work an attacker must redo.</li>
  <li><strong>Public by default.</strong> Every node holds every transaction. On Bitcoin, and in Zcash's transparent pool, addresses and amounts are visible to anyone. Zcash's shielded pools encrypt those details while nodes can still verify that the rules were followed.</li>
  <li><strong>Lower speed and higher cost than a database.</strong> The next lesson looks at that trade.</li>
</ul>
<blockquote>Verifying is the point. A blockchain replaces "trust the operator's records" with "check the records yourself", and everything else in the design follows from that.</blockquote>

<h2>Try it</h2>
<p>Look at a real Zcash block in a public block explorer, a website that displays chain data.</p>
<ol>
  <li>Open <a href="https://mainnet.zcashexplorer.app/blocks/2646207">mainnet.zcashexplorer.app/blocks/2646207</a>. This block was mined on 14 September 2024 and contains two transactions.</li>
  <li>Find the height, hash, time, transaction count, Merkle root, nonce and version, and match each one to a row of the table above.</li>
  <li>Change the number in the URL to <code>2646206</code>. Which header field of block 2,646,207 must contain this earlier block's hash?</li>
  <li>Write down the five or six fields you would show for each block if you had to draw this chain on a web page. That list is the starting point for this week's lab, the Blockchain Visualiser.</li>
</ol>
<p>Explorers are third-party sites and their layouts differ. If this one is unavailable, the ZecHub guide in the sources lists others.</p>

<h2>Key takeaways</h2>
<ul>
  <li>A blockchain is a shared, append-only ledger that every full node verifies independently.</li>
  <li>Each block header contains the hash of the previous header, so changing old data breaks every later link.</li>
  <li>Miners add blocks by proof of work, and nodes follow the valid chain with the most total work.</li>
  <li>Zcash Mainnet targets a block every 75 seconds (October 2026) and limits blocks to 2,000,000 bytes.</li>
  <li>Blockchain data is public by default; Zcash adds shielded pools that encrypt transaction details.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf#blockchain">Zcash Protocol Specification: The Block Chain</a></li>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf#blockheader">Zcash Protocol Specification: Block Header Encoding and Consensus</a></li>
  <li><a href="https://developer.bitcoin.org/reference/block_chain.html#block-headers">Bitcoin Developer Reference: Block Headers</a> (the format Zcash's header extends)</li>
  <li><a href="https://zebra.zfnd.org/">The Zebra Book</a> (the Zcash Foundation's full node)</li>
  <li><a href="https://zechub.wiki/guides/blockchain-explorers">ZecHub: Blockchain Explorers</a></li>
</ul>`,
  },
  "l-00-02": {
    title: "Distributed Ledgers vs Traditional Databases",
    subtitle: "Compare a public ledger with an ordinary database and judge which one a given problem actually needs.",
    content: `<p>You already know databases: a server you control, tables you can read and write, and a backup if something goes wrong. A blockchain stores data too, but it makes almost the opposite set of choices. This lesson compares the two so that you can explain what a blockchain costs, what that cost buys, and when it is the wrong tool.</p>

<h2>What a database assumes</h2>
<p>A traditional database such as PostgreSQL or MongoDB has an <strong>operator</strong>: one organisation that runs the servers and holds administrator access. The operator can create, read, update and delete any record. That is why databases are fast and flexible, and it is also the <strong>trust assumption</strong> built into them. A bank's customers trust the bank not to change their balance. If the operator is honest, competent and available, this works very well.</p>

<h2>What a distributed ledger changes</h2>
<p>A <strong>distributed ledger</strong> is a record kept by many independent parties, with rules for agreeing on its contents, so that no single party controls it. A <strong>blockchain</strong> is the most common kind: records are batched into hash-linked blocks, as you saw in the previous lesson. Some ledgers are <em>permissioned</em> (a fixed group of known organisations runs them). Bitcoin and Zcash are <em>permissionless</em>: anyone may run a node or submit a transaction.</p>
<p>Three design choices follow from having no operator:</p>
<ul>
  <li><strong>Append-only.</strong> There is no <code>UPDATE</code> or <code>DELETE</code>. You correct a mistake by adding a new transaction, never by editing an old one.</li>
  <li><strong>Replicated and re-verified.</strong> Every full node stores the history and checks every rule itself. The current state, such as who can spend what, is whatever you get by replaying that history.</li>
  <li><strong>Agreed by consensus.</strong> New blocks are accepted only if they follow rules every node enforces. Changing those rules means persuading the network to upgrade its software.</li>
</ul>

<h2>The trade-offs</h2>
<table>
  <thead><tr><th>Question</th><th>Traditional database</th><th>Public blockchain</th></tr></thead>
  <tbody>
    <tr><td>Who can write?</td><td>Whoever the operator authorises</td><td>Anyone whose transaction follows the rules and pays the fee</td></tr>
    <tr><td>Who can rewrite history?</td><td>The operator</td><td>Nobody, short of out-working the whole network</td></tr>
    <tr><td>Operations</td><td>Create, read, update, delete</td><td>Append and read</td></tr>
    <tr><td>Capacity</td><td>Limited by the hardware you buy</td><td>Limited by protocol rules: on Zcash, at most 2,000,000 bytes per block, with a block targeted every 75 seconds</td></tr>
    <tr><td>Time to a settled write</td><td>Milliseconds</td><td>Minutes: you wait for your transaction's block, then for more blocks on top of it</td></tr>
    <tr><td>Storage</td><td>One copy plus backups</td><td>Every full node keeps the history: roughly 300 GB for Zcash Mainnet as of October 2026</td></tr>
    <tr><td>Who can read?</td><td>Whoever the operator allows</td><td>Everyone, unless the protocol encrypts the data</td></tr>
    <tr><td>What you trust</td><td>The operator</td><td>The protocol rules, the cryptography, and that no attacker controls most of the mining power</td></tr>
  </tbody>
</table>
<p>The "who can read" row matters for this programme. A public ledger is public: on most chains, and in Zcash's transparent pool, every address and amount is visible forever. Zcash's shielded pools exist to fix this by encrypting the addresses, amounts and memo of a transaction. Stage 01 covers exactly what they hide and what still leaks.</p>

<h2>When each one is the right tool</h2>
<p>Ask one question first: <em>which trust assumption am I trying to remove?</em> A blockchain earns its cost when several parties who do not trust each other must share one record, when no operator should be able to block or reverse valid entries, and when anyone should be able to audit the rules. Money that no institution controls is the clearest case, and it is the one Zcash is built for.</p>
<p>Use a database when one organisation legitimately owns the data, when records must be edited or deleted (personal data, for example), or when you need high throughput and instant writes. Many real products use both. A payment gateway like the one you will build in Week 6 typically keeps its orders in an ordinary database and uses the chain only for the payments.</p>
<blockquote>If you cannot name the party you are trying not to trust, you probably need a database.</blockquote>

<h2>Try it</h2>
<p>Model an append-only ledger in plain JavaScript. Save this as <code>ledger.mjs</code> and run <code>node ledger.mjs</code> (tested with Node.js 22):</p>
<pre><code>// ledger.mjs: an append-only ledger. A toy model, not a real blockchain.
const ledger = [];

function append(entry) {
  ledger.push(Object.freeze({ seq: ledger.length, ...entry }));
}

function balances() {
  const totals = {};
  for (const { from, to, amount } of ledger) {
    if (from) totals[from] = (totals[from] ?? 0) - amount;
    totals[to] = (totals[to] ?? 0) + amount;
  }
  return totals;
}

append({ to: 'ada', amount: 50 });               // new coins, no sender
append({ from: 'ada', to: 'bola', amount: 20 });
append({ from: 'bola', to: 'chidi', amount: 5 });
console.log(balances()); // { ada: 30, bola: 15, chidi: 5 }</code></pre>
<ol>
  <li>Bola was meant to receive 2, not 20. Fix the balances without editing or removing any existing entry.</li>
  <li>Add a check to <code>append</code> that rejects a payment when the sender's balance is too low. You have just written a validation rule.</li>
  <li>Nothing stops other code from running <code>ledger.length = 0</code>. Write down what would have to be true for a stranger to trust this ledger. The next three lessons supply the missing pieces: hashes, signatures and Merkle trees.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
  <li>A database trusts its operator; a public blockchain replaces that trust with rules every node checks.</li>
  <li>Blockchains are append-only and fully replicated, which makes them slower, smaller and more expensive than databases.</li>
  <li>Ledger state is derived by replaying history, so anyone can audit it.</li>
  <li>Public ledgers expose their data by default; Zcash's shielded pools encrypt transaction details.</li>
  <li>Choose a blockchain only when there is a specific trust assumption you need to remove.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf#blockchain">Zcash Protocol Specification: The Block Chain</a></li>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf#blockheader">Zcash Protocol Specification: Block Header Encoding and Consensus</a> (block size limit)</li>
  <li><a href="https://github.com/ZcashFoundation/z3">Z3 stack README</a> (Mainnet disk and sync requirements)</li>
  <li><a href="https://zechub.wiki/guides/blockchain-explorers">ZecHub: Blockchain Explorers</a> (what an explorer can and cannot see on Zcash)</li>
</ul>`,
  },
  "l-00-03": {
    title: "Cryptographic Hash Functions",
    subtitle: "Compute hashes in Node.js and the browser, explain their security properties, and say where Zcash uses each one.",
    content: `<p>A hash function turns any amount of data into a short, fixed-size fingerprint. Blockchains use hashes everywhere: to name blocks and transactions, to link each block to the one before it, and to summarise thousands of transactions in 32 bytes. In this lesson you compute hashes yourself, learn which properties make a hash function <em>cryptographic</em>, and see which functions Zcash uses for which job.</p>

<h2>A fingerprint for data</h2>
<p>A hash function takes an input of any length and returns a fixed-length output called a <strong>hash</strong> or <strong>digest</strong>. SHA-256 always returns 256 bits (32 bytes), usually written as 64 hexadecimal characters. Node.js has it built in. Save this as <code>hash.mjs</code> and run <code>node hash.mjs</code> (tested with Node.js 22):</p>
<pre><code>// hash.mjs
import { createHash } from 'node:crypto';

const sha256 = (data) =&gt; createHash('sha256').update(data).digest('hex');

console.log(sha256('Hello, Zcash!'));
// 4dc5d4a117676bc8ded94ca420c0536b308d1c6f38012d6caabd1d01265e3bde
console.log(sha256('Hello, Zcash.'));
// 60a9e558b13c651efa101504df28273a2a61efd92fd5fe0eec7c6adad2436643</code></pre>
<p>The function is <strong>deterministic</strong>: you will get exactly these digests on any machine. Changing one character produced a completely unrelated output. That behaviour is called the <strong>avalanche effect</strong>.</p>

<h2>The properties that matter</h2>
<p>Three properties separate a cryptographic hash function from a simple checksum:</p>
<ul>
  <li><strong>Preimage resistance.</strong> Given a digest, you cannot find an input that produces it other than by guessing.</li>
  <li><strong>Second-preimage resistance.</strong> Given one input, you cannot find a different input with the same digest.</li>
  <li><strong>Collision resistance.</strong> You cannot find <em>any</em> two different inputs with the same digest.</li>
</ul>
<p>Collisions must exist, because there are more possible inputs than outputs. The point is that finding one is infeasible: for a 256-bit hash, the best generic attack needs about 2 to the power of 128 attempts. This is why a digest can stand in for the data: if two parties hold the same digest, they can treat the data as identical.</p>

<h2>Hashing in the browser</h2>
<p>This week's lab is a web page, so you will also need the browser's Web Crypto API. It is asynchronous and works on bytes, not strings:</p>
<pre><code>async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) =&gt; b.toString(16).padStart(2, '0')).join('');
}

sha256Hex('Hello, Zcash!').then(console.log); // same digest as Node.js printed</code></pre>
<p><code>crypto.subtle</code> is only available in a secure context, so load your page over HTTPS or from <code>localhost</code>.</p>

<h2>How hashes link blocks</h2>
<p>A Zcash block is identified by the hash of its header. The function is <strong>SHA-256d</strong>: SHA-256 applied twice. The header's previous-block field holds the SHA-256d hash of the previous header, and its Merkle root field commits to the block's transactions, so the block hash depends on every transaction in the block and on every earlier block. Change one byte anywhere in the history and every later block hash changes.</p>
<p>Zcash inherited this from Bitcoin, including the convention that block and transaction hashes are <em>displayed</em> with their bytes reversed. Remember that when a hash you compute appears not to match an explorer.</p>

<h2>Hash functions in Zcash</h2>
<p>Zcash does not use one hash function. It picks one per job:</p>
<table>
  <thead><tr><th>Job</th><th>Hash function</th></tr></thead>
  <tbody>
    <tr><td>Block header hash, previous-block link, difficulty check</td><td>SHA-256d</td></tr>
    <tr><td>Merkle tree of transaction IDs in the block header</td><td>SHA-256d</td></tr>
    <tr><td>Transparent address from a public key</td><td>RIPEMD-160 of SHA-256</td></tr>
    <tr><td>Equihash proof-of-work puzzle</td><td>BLAKE2b</td></tr>
    <tr><td>Transaction IDs and signature digests for version 5 and 6 transactions (ZIP 244, ZIP 229)</td><td>BLAKE2b-256</td></tr>
    <tr><td>Sapling note commitment tree</td><td>Pedersen hash</td></tr>
    <tr><td>Orchard and Ironwood note commitment trees</td><td>Sinsemilla</td></tr>
  </tbody>
</table>
<p>Two ideas explain the variety. First, Zcash's BLAKE2b hashes are <strong>personalised</strong>: each use mixes in a fixed tag, such as <code>ZcashPoW</code> for Equihash, so a digest computed for one purpose can never be mistaken for another. This is called domain separation. Second, shielded transactions prove statements about hashes inside zero-knowledge proofs, where SHA-256 is expensive. Pedersen and Sinsemilla are <em>algebraic</em> hashes, built from elliptic-curve arithmetic, designed to be cheap to prove. You will meet note commitment trees in Lesson 5 and the proofs in Week 3. Ironwood is the current shielded pool as of October 2026.</p>
<blockquote>Node.js ships BLAKE2b as <code>blake2b512</code>, but its built-in <code>createHash</code> cannot set a personalisation string or a 256-bit output length (checked on Node.js 22), so you cannot reproduce Zcash's BLAKE2b digests with it. Later modules use Zcash libraries for that.</blockquote>

<h2>Try it</h2>
<p>Build a three-block toy chain. Save this as <code>chain.mjs</code>:</p>
<pre><code>// chain.mjs: a toy hash-linked chain. Not the real Zcash block format.
import { createHash } from 'node:crypto';

const sha256 = (data) =&gt; createHash('sha256').update(data).digest();
const sha256d = (data) =&gt; sha256(sha256(data)).toString('hex');

function hashBlock({ height, prevHash, time, data }) {
  return sha256d(JSON.stringify([height, prevHash, time, data]));
}

function addBlock(chain, data) {
  const prev = chain.at(-1);
  const block = {
    height: chain.length,
    prevHash: prev ? prev.hash : '00'.repeat(32),
    time: Date.now(),
    data,
  };
  block.hash = hashBlock(block);
  chain.push(block);
}

const chain = [];
addBlock(chain, 'genesis');
addBlock(chain, 'ada pays bola 20');
addBlock(chain, 'bola pays chidi 5');
console.log(chain);</code></pre>
<ol>
  <li>Write <code>firstInvalid(chain)</code>. It returns the height of the first block whose stored <code>hash</code> differs from <code>hashBlock(block)</code>, or whose <code>prevHash</code> differs from the previous block's <code>hash</code>, and <code>-1</code> if every block passes.</li>
  <li>Change block 1's data to <code>'ada pays bola 2000'</code> and run your check. It should report 1.</li>
  <li>Now play the attacker: recompute block 1's <code>hash</code> as well. Which block fails now, and what would you have to redo to hide the change completely?</li>
</ol>
<p>Keep this file. The next two lessons add signatures and a Merkle root to it, and the lab turns it into a visualiser.</p>

<h2>Key takeaways</h2>
<ul>
  <li>A cryptographic hash is a deterministic, fixed-size fingerprint that is infeasible to reverse or to collide.</li>
  <li>Each Zcash block header contains the SHA-256d hash of the previous header, so tampering breaks every later link.</li>
  <li>Zcash uses SHA-256d for block hashing, BLAKE2b for Equihash and for modern transaction digests, and Pedersen and Sinsemilla hashes in its shielded note commitment trees.</li>
  <li>Personalisation tags keep hashes made for different purposes apart.</li>
  <li>Block and transaction hashes are displayed byte-reversed.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf#concretehashes">Zcash Protocol Specification: Hash Functions</a> (SHA-256d, BLAKE2, Merkle tree hashes, Pedersen, Sinsemilla)</li>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf#blockheader">Zcash Protocol Specification: Block Header Encoding and Consensus</a></li>
  <li><a href="https://zips.z.cash/zip-0244">ZIP 244: Transaction Identifier Non-Malleability</a></li>
  <li><a href="https://zips.z.cash/zip-0229">ZIP 229: Version 6 Transaction Format</a></li>
  <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest">MDN: SubtleCrypto digest()</a></li>
  <li><a href="https://nodejs.org/dist/latest-v20.x/docs/api/crypto.html">Node.js crypto module documentation</a></li>
</ul>`,
  },
  "l-00-04": {
    title: "Digital Signatures & Public Key Cryptography",
    subtitle: "Sign and verify a message in Node.js, and explain how signatures authorise spending in each part of Zcash.",
    content: `<p>Hashes tell you that data has not changed. They do not tell you who wrote it. A blockchain needs both: every node must be able to check that a payment was authorised by the owner of the funds, without any registry of users and without the owner revealing a secret. Digital signatures do this, and they are built on public key cryptography.</p>
<p>In this lesson you generate a key pair, sign a message and verify it, then see which signature schemes Zcash uses and why its shielded pools need something more than Bitcoin's.</p>

<h2>Key pairs</h2>
<p>Public key cryptography uses two related keys:</p>
<ul>
  <li>A <strong>private key</strong>: a large random number that you keep secret. Because its job is to sign, the Zcash specification calls it a <em>signing key</em>.</li>
  <li>A <strong>public key</strong>, computed from the private key and safe to publish. Zcash calls it a <em>validating key</em>.</li>
</ul>
<p>The relationship is one-way. Computing the public key from the private key is fast. Recovering the private key from the public key is infeasible with today's computers. In the schemes used here, both keys live on an <strong>elliptic curve</strong>, a mathematical structure in which that one-way step is cheap to compute and hard to undo.</p>
<p>There is no account to recover. Whoever holds the private key can spend, and if you lose it nobody can reset it. That is the cost of having no operator.</p>

<h2>Signing and verifying</h2>
<p>A <strong>signature scheme</strong> is three algorithms: generate a key pair, <strong>sign</strong> a message with the private key, and <strong>verify</strong> a signature using only the public key. A valid signature shows that someone holding the private key approved <em>exactly this message</em>.</p>
<p>Save this as <code>sign.mjs</code> and run <code>node sign.mjs</code> (tested with Node.js 22):</p>
<pre><code>// sign.mjs
import { generateKeyPairSync, sign, verify } from 'node:crypto';

// ECDSA on the secp256k1 curve: the scheme behind Zcash transparent addresses.
const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'secp256k1' });

const message = Buffer.from('ada pays bola 20');
const signature = sign('sha256', message, privateKey);
console.log(signature.toString('hex'));

console.log(verify('sha256', message, publicKey, signature));                           // true
console.log(verify('sha256', Buffer.from('ada pays bola 2000'), publicKey, signature)); // false</code></pre>
<p>Three things to notice. The verifier never sees the private key. Changing a single character of the message makes verification fail, because the scheme signs a hash of the message (here SHA-256). And the signature is different on every run, because ECDSA uses fresh randomness each time, yet every one of those signatures verifies.</p>
<blockquote>A signature proves that a key approved a message. It does not prove who is holding the key, and it hides nothing: anyone can read a signed message.</blockquote>

<h2>Signatures on a blockchain</h2>
<p>On Bitcoin, and in Zcash's transparent pool, coins are usually locked to the hash of a public key. The common kind of transparent address (pay-to-public-key-hash) encodes the RIPEMD-160 hash of the SHA-256 hash of a public key. To spend, you publish a transaction with a signature made by the matching private key. Every full node verifies that signature before accepting the transaction. No node needs to know who you are.</p>
<p>What gets signed is a hash that commits to the transaction's contents, called the <strong>signature hash</strong>. For version 5 transactions it is computed with BLAKE2b-256 as specified in ZIP 244, and version 6 transactions extend the same scheme in ZIP 229. Because the signature commits to the transaction's contents, nobody can lift it and attach it to a different payment.</p>
<p>Key pairs have a second use, <strong>key agreement</strong>, in which two parties derive a shared secret from their own private key and the other's public key. Zcash uses it to encrypt shielded payment details to their recipient. You will meet that in Stage 01.</p>

<h2>Signature schemes in Zcash</h2>
<table>
  <thead><tr><th>Where</th><th>Scheme</th><th>Curve</th></tr></thead>
  <tbody>
    <tr><td>Transparent inputs</td><td>ECDSA, as in Bitcoin</td><td>secp256k1</td></tr>
    <tr><td>Sprout (legacy pool)</td><td>Ed25519</td><td>edwards25519</td></tr>
    <tr><td>Sapling</td><td>RedJubjub, an instance of RedDSA</td><td>Jubjub</td></tr>
    <tr><td>Orchard and Ironwood</td><td>RedPallas, an instance of RedDSA</td><td>Pallas</td></tr>
  </tbody>
</table>
<p>RedDSA is a Schnorr-based signature scheme defined in the Zcash specification. Its important extra feature is <strong>key re-randomisation</strong>. In a transparent spend, the public key appears on chain, so every spend from the same key is visibly linked. A shielded spend instead reveals a freshly randomised version of the key, which validators can check a signature against but cannot link to the address or to your other spends. A zero-knowledge proof shows that the randomised key was derived correctly.</p>
<p>Shielded transactions carry two kinds of signature. A <strong>spend authorisation signature</strong> proves that the holder of the spending key approved each spend. A <strong>binding signature</strong> ties the hidden amounts together so that the transaction balances. Ironwood, the current shielded pool as of October 2026, reuses the Orchard protocol, so it uses RedPallas as well. Because these are Schnorr signatures, several parties can also produce one jointly; that is FROST, which you will use in Week 6.</p>

<h2>Try it</h2>
<p>Make the entries in your toy chain signed transactions.</p>
<ol>
  <li>In a new file, generate a key pair for Ada as above. Represent her public key as text with <code>publicKey.export({ type: 'spki', format: 'der' }).toString('hex')</code>.</li>
  <li>Write <code>signTx(tx, privateKey)</code>. It signs <code>Buffer.from(JSON.stringify([tx.from, tx.to, tx.amount]))</code> and returns the transaction with a hex <code>signature</code> field added. Use Ada's public key hex as <code>from</code>.</li>
  <li>Write <code>verifyTx(tx)</code>. Rebuild the key with <code>createPublicKey({ key: Buffer.from(tx.from, 'hex'), format: 'der', type: 'spki' })</code> and return the result of <code>verify</code>.</li>
  <li>Check three cases: an untouched transaction (true), one whose <code>amount</code> was changed after signing (false), and one whose <code>from</code> was swapped for another person's key (false).</li>
  <li>In <code>chain.mjs</code> from the previous lesson, make <code>addBlock</code> refuse any transaction that fails <code>verifyTx</code>.</li>
</ol>
<p>Your toy chain now has integrity from hashes and authorisation from signatures. Notice what it still shows: who paid whom, and how much.</p>

<h2>Key takeaways</h2>
<ul>
  <li>A private (signing) key creates signatures; the matching public (validating) key lets anyone check them.</li>
  <li>A signature binds a key to one exact message, so any change to the message invalidates it.</li>
  <li>Transparent Zcash uses ECDSA on secp256k1, like Bitcoin. Sapling uses RedJubjub, and Orchard and Ironwood use RedPallas.</li>
  <li>RedDSA's re-randomised keys let a shielded spend be authorised without linking it to an address.</li>
  <li>Keys cannot be reset: losing the private key means losing the funds.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf#abstractsig">Zcash Protocol Specification: Signature</a> (the four signature schemes Zcash uses)</li>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf#concretereddsa">Zcash Protocol Specification: RedDSA, RedJubjub, and RedPallas</a></li>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf#spendauthsig">Zcash Protocol Specification: Spend Authorization Signature</a></li>
  <li><a href="https://zips.z.cash/zip-0244">ZIP 244: Transaction Identifier Non-Malleability</a> (signature digests)</li>
  <li><a href="https://zips.z.cash/zip-0312">ZIP 312: FROST for Spend Authorization Multisignatures</a> (draft; why Schnorr signatures allow threshold signing)</li>
  <li><a href="https://nodejs.org/dist/latest-v20.x/docs/api/crypto.html">Node.js crypto module documentation</a></li>
</ul>`,
  },
  "l-00-05": {
    title: "Merkle Trees",
    subtitle: "Compute a real Zcash block's Merkle root and explain how one hash can prove an item belongs to a huge set.",
    content: `<p>A block header is small, yet it has to commit to every transaction in the block. A <strong>Merkle tree</strong> makes that possible: it reduces any number of items to a single hash, the <strong>Merkle root</strong>, in such a way that you can later prove one item is included without showing the rest. Zcash uses Merkle trees twice over: for the transactions in a block, and for every shielded note ever created.</p>

<h2>Building the tree</h2>
<p>Start with a list of hashes, the <strong>leaves</strong>. Hash them in pairs to get a shorter list, then repeat until one hash remains:</p>
<pre><code>            root = H(H12 + H34)
           /                   \\
   H12 = H(h1 + h2)     H34 = H(h3 + h4)
     /        \\            /        \\
   h1          h2        h3          h4</code></pre>
<p>Changing any leaf changes its parent, and so on up to the root. The root is therefore a fingerprint of the whole list, in order.</p>

<h2>Proving membership</h2>
<p>To prove that <code>h3</code> is in the tree, you supply only <code>h4</code> and <code>H12</code>. The verifier computes <code>H34</code>, then the root, and compares it with the root they already trust. This list of sibling hashes is a <strong>Merkle path</strong> (or Merkle proof). Its length is the depth of the tree, so it grows with the logarithm of the number of leaves: about 10 hashes for 1,000 leaves, and 32 for four billion.</p>

<h2>The transaction tree in a Zcash block</h2>
<p>The Merkle root field of a Zcash block header is built this way from the block's transaction IDs, using SHA-256d for <code>H</code>. Zcash inherited the tree from Bitcoin, including one quirk: when a level has an odd number of hashes, the last one is paired with itself.</p>
<blockquote>Do not copy that quirk into a new design. Duplicating the last hash lets two different transaction lists produce the same root (CVE-2012-2459), and node software has to guard against it.</blockquote>
<p>For version 5 and later transactions, the transaction ID does not cover signatures and proofs. A second tree, <code>hashAuthDataRoot</code>, commits to that authorising data using BLAKE2b-256, and the header's block commitments field includes its root (ZIP 244).</p>

<h2>Note commitment trees</h2>
<p>Each shielded pool keeps a <strong>note commitment tree</strong>. A <em>note</em> is a shielded coin, and its <em>commitment</em> is a hash-like value that hides its contents. Every new note commitment is appended as the next leaf of a tree of fixed depth:</p>
<table>
  <thead><tr><th>Tree</th><th>Depth</th><th>Hash for internal nodes</th></tr></thead>
  <tbody>
    <tr><td>Sprout (legacy)</td><td>29</td><td>SHA-256 compression function</td></tr>
    <tr><td>Sapling</td><td>32</td><td>Pedersen hash</td></tr>
    <tr><td>Orchard</td><td>32</td><td>Sinsemilla</td></tr>
    <tr><td>Ironwood</td><td>32</td><td>Sinsemilla</td></tr>
  </tbody>
</table>
<p>A depth of 32 gives room for 2 to the power of 32 notes, about 4.29 billion. To spend a note, a wallet proves in zero knowledge that it knows a Merkle path from one of its note commitments to a recent root of the tree, called an <strong>anchor</strong>, without revealing which leaf. That is how a shielded spend can be valid without pointing at the coin being spent. The tree only shows that a note exists. Preventing double spends is a separate mechanism, covered in Week 3.</p>

<h2>Try it</h2>
<p>Compute the Merkle root of a real block. Block 2,646,207, which you looked up in Lesson 1, has two transactions. Save this as <code>merkle.mjs</code> and run it (tested with Node.js 22):</p>
<pre><code>// merkle.mjs: the transaction Merkle tree Zcash inherited from Bitcoin
import { createHash } from 'node:crypto';

const sha256 = (b) =&gt; createHash('sha256').update(b).digest();
const sha256d = (b) =&gt; sha256(sha256(b));

function merkleRoot(leaves) {
  let level = leaves;
  while (level.length &gt; 1) {
    const next = [];
    for (let i = 0; i &lt; level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? left; // odd count: pair the last hash with itself
      next.push(sha256d(Buffer.concat([left, right])));
    }
    level = next;
  }
  return level[0];
}

// Explorers display hashes byte-reversed, so reverse on the way in and out.
const fromDisplay = (hex) =&gt; Buffer.from(hex, 'hex').reverse();
const toDisplay = (buf) =&gt; Buffer.from(buf).reverse().toString('hex');

const txids = [
  '0285cd5e324ae66a2fee5a5fbfdaf3f3c95453b651f1ebc567f291df1087dc85',
  '758237239d60e89c5dc3f73aa96d8f4651aa57aae49b55ff865ab29cad9002ea',
];
console.log(toDisplay(merkleRoot(txids.map(fromDisplay))));
// a55261ce241148094284dbd28689c35ec8be3b76a3b49ead6d4102646b2e859a</code></pre>
<ol>
  <li>Compare the output with the Merkle root the explorer shows for that block.</li>
  <li>Write <code>merkleProof(leaves, index)</code>, returning the sibling hash at each level and whether it sits on the left, and <code>verifyProof(leaf, proof, root)</code>. Test them with five leaves.</li>
  <li>In <code>chain.mjs</code>, give each block a list of transactions and put their <code>merkleRoot</code> in the data that <code>hashBlock</code> hashes. Your blocks now have the same shape as the ones you will draw in the lab.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
  <li>A Merkle root commits to an ordered list of items with a single hash.</li>
  <li>A Merkle path proves membership with one hash per level of the tree.</li>
  <li>Zcash block headers commit to transaction IDs with a SHA-256d Merkle tree inherited from Bitcoin.</li>
  <li>Each shielded pool has an append-only note commitment tree; Sapling, Orchard and Ironwood trees have depth 32.</li>
  <li>A shielded spend proves a Merkle path to an anchor without revealing which note is being spent.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf#notecommitmenttrees">Zcash Protocol Specification: Note Commitment Trees</a></li>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf#merklepath">Zcash Protocol Specification: Merkle Path Validity</a></li>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf#constants">Zcash Protocol Specification: Constants</a> (tree depths)</li>
  <li><a href="https://zips.z.cash/zip-0244">ZIP 244: Transaction Identifier Non-Malleability</a> (<code>hashAuthDataRoot</code> and block commitments)</li>
  <li><a href="https://github.com/ZcashFoundation/zebra">Zebra source code</a>: <code>zebra-chain/src/block/merkle.rs</code> implements the transaction tree and documents CVE-2012-2459</li>
  <li><a href="https://mainnet.zcashexplorer.app/blocks/2646207">Zcash block 2,646,207 in a block explorer</a></li>
</ul>`,
  },
}
