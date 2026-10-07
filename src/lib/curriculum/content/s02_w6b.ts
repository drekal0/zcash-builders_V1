// AUTO-GENERATED from scratchpad lesson fragments. Do not edit by hand.
// Each entry: lesson id -> { title, subtitle, content (HTML) }.
import type { LessonContent } from './types'

export const M_s02_w6b: Record<string, LessonContent> = {
  "l-02-15": {
    title: "FROST Threshold Signatures \u2014 Protocol Overview",
    subtitle: "Explain how t-of-n signers produce one ordinary-looking Schnorr signature, and why Zcash needs a re-randomised variant.",
    content: `<p>You already know that a shielded Zcash spend is authorised by a single secret key. Whoever holds that key can move the funds; lose it and the funds are gone. For a shared treasury — a team, a DAO, a grants committee — putting all that power in one key, on one device, held by one person, is a risk you usually cannot accept. <strong>FROST</strong> (Flexible Round-Optimised Schnorr Threshold signatures) lets a group split that authority so that a chosen number of members must cooperate before anything can be spent.</p>
<p>This lesson is the conceptual map for the rest of the week. By the end you should be able to say what a threshold signature is, how FROST produces one in two rounds, what it does and does not protect, and why Zcash can only use a modified version of it. The following lessons then put each piece into practice with the Zcash Foundation's tools, ending in a lab where you run a real 2-of-3 signing ceremony.</p>

<h2>What a threshold signature is</h2>
<p>A <strong>threshold signature scheme</strong> splits one signing key into <code>n</code> shares and sets a threshold <code>t</code>, so that any <code>t</code> of the <code>n</code> share-holders — but no fewer — can together produce a valid signature. FROST is such a scheme. After key generation each participant holds a <strong>secret share</strong> and a <strong>verifying share</strong>, and everyone agrees on one <strong>group verifying key</strong> (the public key that matches the split private key).</p>
<p>The property that makes FROST valuable for Zcash is this: the signature the group produces is <em>indistinguishable from a signature made by a single ordinary key</em>. A verifier — and anyone watching the chain — sees one normal Schnorr signature. There is no on-chain hint that several people cooperated, how many there are, or which ones signed. This is very different from a Bitcoin-style script multisig, where the policy and the participating public keys are published on-chain.</p>
<blockquote>FROST only produces <strong>Schnorr</strong> signatures, never ECDSA. Zcash transparent (t-address) spends use ECDSA, so FROST cannot sign them. FROST applies to the <em>shielded</em> spend authorisation signature — the subject of this whole module.</blockquote>

<h2>The two rounds, at a glance</h2>
<p>FROST is standardised in <strong>RFC 9591</strong>, "The Flexible Round-Optimized Schnorr Threshold (FROST) Protocol for Two-Round Schnorr Signatures" (June 2024). As the title says, signing takes two rounds of messages, coordinated by a <strong>Coordinator</strong> who may or may not be one of the signers:</p>
<ol>
  <li><strong>Round 1 — commitments.</strong> Each selected participant generates fresh single-use <strong>nonces</strong> and sends the matching <strong>commitments</strong> to the Coordinator, keeping the nonces private.</li>
  <li><strong>Round 2 — signature shares.</strong> The Coordinator bundles the commitments with the message into a signing package and returns it. Each participant produces a <strong>signature share</strong> and sends it back.</li>
  <li><strong>Aggregate.</strong> The Coordinator combines the shares into the single final signature. No private share ever leaves its holder's device, and the full key is never reconstructed anywhere.</li>
</ol>
<p>Two details matter in practice. First, <em>every participant selected for a signing run must produce a share</em>, even if more than <code>t</code> were selected — the Coordinator cannot finish with fewer shares than it asked for. Second, FROST supports <strong>identifiable abort</strong>: if a participant sends a bad share, aggregation fails and names the culprit, so they can be excluded from future runs.</p>

<h2>What FROST is — and is not</h2>
<table>
<thead><tr><th>FROST gives you</th><th>FROST does not give you</th></tr></thead>
<tbody>
<tr><td>t-of-n control of one shielded spending authority</td><td>Bitcoin-style on-chain script multisig</td></tr>
<tr><td>A signature indistinguishable from a single-signer one</td><td>Protection for amounts crossing pools (those are still public)</td></tr>
<tr><td>Protection of the <em>spend authorising</em> key</td><td>A policy for who may <em>view</em> the wallet — that is separate</td></tr>
<tr><td>Detection and naming of a cheating signer</td><td>A key-generation (DKG) procedure of its own</td></tr>
</tbody>
</table>
<p>That last point surprises people: RFC 9591 deliberately <strong>does not specify key generation</strong>. It gives a trusted-dealer sketch for reference and points to the FROST paper for distributed generation, but the scheme starts from "the shares already exist". The Zcash Foundation's library fills this gap with both a trusted-dealer path and a distributed one, which is the subject of the next lesson.</p>

<h2>Why Zcash needs re-randomised FROST</h2>
<p>Plain FROST is not enough for shielded Zcash. To keep transactions <strong>unlinkable</strong>, Zcash re-randomises the spend authorisation key for every spend, so that two transactions from the same wallet cannot be tied together by their keys. A threshold scheme has to preserve that property. <strong>ZIP 312, "FROST for Spend Authorization Multisignatures"</strong> (Draft), adapts FROST into <em>Re-Randomized FROST</em>: the Coordinator supplies a per-signature <strong>randomizer</strong> alongside the message, and the signers produce a signature valid under the re-randomised key.</p>
<p>ZIP 312 is explicit about its threat model. The Coordinator is trusted with the <em>privacy</em> of the transaction — a rogue Coordinator can break unlinkability — but still cannot create a signed transaction without a threshold of participants. In the Zcash Foundation's tooling, selecting the re-randomised Zcash ciphersuite is as simple as passing <code>-C redpallas</code>, which automatically switches the tools to Re-Randomized FROST. You will do exactly that in the next lesson.</p>

<h2>Try it</h2>
<p>No code yet — just map the scheme onto a real decision. Imagine your cohort wants a shared testnet treasury for prize money, held by five organisers. On paper, answer:</p>
<ol>
  <li>What <code>t</code> and <code>n</code> would you choose, and what does each choice cost you if one organiser loses their laptop, or if one goes rogue?</li>
  <li>Which single party, if any, learns something extra by being the Coordinator — and does that matter for your group?</li>
  <li>Open RFC 9591's abstract and find the sentence describing the resulting signature. Why is "indistinguishable from a single-party signature" the key selling point for a <em>shielded</em> treasury specifically?</li>
</ol>
<p>Keep your answers; you will revisit them in the treasury-patterns lesson and the lab.</p>

<h2>Key takeaways</h2>
<ul>
  <li>FROST splits one Schnorr signing key into <code>n</code> shares so any <code>t</code> of them can jointly sign; fewer cannot.</li>
  <li>The output is one ordinary signature — no on-chain trace of the group, unlike transparent script multisig.</li>
  <li>Signing is two rounds (commitments, then signature shares) run through a Coordinator who aggregates; the full key is never reassembled.</li>
  <li>RFC 9591 specifies signing but not key generation, and FROST signs only Schnorr — so it works on shielded spends, not transparent ones.</li>
  <li>Shielded Zcash needs the re-randomised variant from ZIP 312 to keep transactions unlinkable.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://www.rfc-editor.org/rfc/rfc9591.html">RFC 9591 — The FROST Protocol for Two-Round Schnorr Signatures</a></li>
  <li><a href="https://zips.z.cash/zip-0312">ZIP 312 — FROST for Spend Authorization Multisignatures (Draft)</a></li>
  <li><a href="https://frost.zfnd.org/frost.html">ZF FROST Book — Understanding FROST</a></li>
  <li><a href="https://frost.zfnd.org/zcash.html">ZF FROST Book — FROST with Zcash</a></li>
  <li><a href="https://zechub.wiki/">ZecHub — FROST &amp; Threshold Custody</a></li>
</ul>`,
  },
  "l-02-16": {
    title: "Key Generation & DKG with ZF FROST",
    subtitle: "Generate 2-of-3 FROST key shares with the ZF tools \u2014 trusted dealer and distributed key generation \u2014 and derive a Zcash viewing key from them.",
    content: `<p>FROST signing assumes the shares already exist. Someone has to create them first, and how you do that decides how much trust the group has to place in a single setup step. This lesson covers the two options the Zcash Foundation's FROST library gives you — a <strong>trusted dealer</strong> and <strong>distributed key generation (DKG)</strong> — and then shows how a Zcash spending authority is split and turned into a viewing key you can import into a wallet. You will run the real commands; the next two lessons use the shares you produce here.</p>
<p>Everything below uses the <code>frost-client</code> command-line tool from the ZF FROST tools, with the Zcash ciphersuite selected by <code>-C redpallas</code>. Install Rust and Cargo first, then the tools:</p>
<pre><code>cargo install --git https://github.com/ZcashFoundation/frost-zcash-demo.git --locked frost-client
cargo install --git https://github.com/ZcashFoundation/frost-zcash-demo.git --locked zcash-sign</code></pre>
<blockquote>These are demo-grade tools. <code>frost-client</code> has been audited (Least Authority, 2025), but it stores secret shares <strong>unencrypted</strong> in its config file. Use it to learn and on testnet; protect the config file carefully, and do not treat it as production custody software.</blockquote>

<h2>What key generation produces</h2>
<p>Whichever method you use, every participant ends up with the same three things:</p>
<ul>
  <li>a <strong>secret share</strong> — their private piece of the key, which never leaves their device;</li>
  <li>a <strong>verifying share</strong> — used by others to check the signature shares this participant produces;</li>
  <li>the <strong>group verifying key</strong> — the single public key that matches the split private key, used to verify the final signature.</li>
</ul>
<p>The difference between the two methods is entirely about <em>whether the whole private key is ever assembled in one place</em>.</p>

<h2>Option 1 — Trusted dealer</h2>
<p>A dealer generates one key and splits it into shares (in the library, via <code>generate_with_dealer()</code>), then hands each share to its owner. It is by far the simplest to set up, which makes it the right choice for a first run and for learning. Its cost is in the name: the dealer sees the entire key in memory and could forge signatures or hand out tampered shares. You are trusting that one machine and that one moment.</p>
<p>With the ZF tools, first give each (simulated) participant a config file, then deal the shares:</p>
<pre><code>frost-client init -c alice.toml
frost-client init -c bob.toml
frost-client init -c eve.toml

frost-client trusted-dealer -d "Alice, Bob and Eve's group" --names Alice,Bob,Eve -c alice.toml -c bob.toml -c eve.toml -C redpallas</code></pre>
<p>This writes a 2-of-3 set of shares — the default — one into each participant's config. (Append <code>-h</code> to change the threshold, the number of shares, or the file names.) On separate machines in real use, each share must reach its owner over a channel that is both <strong>authenticated</strong> (so it goes to the right person) and <strong>confidential</strong> (so no one else reads it); a leaked threshold of shares means forged signatures.</p>

<h2>Option 2 — Distributed key generation (DKG)</h2>
<p>DKG removes the trusted moment: the key is <em>generated already split</em>, and the full private key never exists anywhere. The ZF library implements the three-part DKG from the original FROST paper. Conceptually each participant runs:</p>
<ol>
  <li><strong>Part 1.</strong> Produce a secret package (kept in memory) and a public round-1 package, and <strong>broadcast</strong> the latter to everyone. "Broadcast" here is a real requirement: every participant must be guaranteed to see the <em>same</em> value, or the setup is insecure.</li>
  <li><strong>Part 2.</strong> Using everyone's round-1 packages, produce a round-2 package addressed to each other participant, sent over an authenticated, confidential channel. These must be encrypted — an eavesdropper who reads them could reconstruct the secret.</li>
  <li><strong>Part 3.</strong> Combine the received round-2 packages to finish, yielding this participant's key package and the shared public key package. Everyone derives the identical group verifying key.</li>
</ol>
<p>The tools handle the messaging for you through a relay server (covered in the signing lesson). Each participant exports a contact string once and imports the others':</p>
<pre><code>frost-client init
frost-client export --name 'Alice'
frost-client import &lt;contact-string&gt;</code></pre>
<p>Then one participant starts the ceremony with the others' public keys, a threshold, and the server address; the rest join with the matching command:</p>
<pre><code>frost-client dkg -d "Alice, Bob and Eve's group" -s localhost:2744 -S &lt;pubkey1&gt;,&lt;pubkey2&gt; -t 2 -C redpallas -c alice.toml
frost-client dkg -d "Alice, Bob and Eve's group" -s localhost:2744 -t 2 -C redpallas</code></pre>
<p>Use <code>frost-client contacts</code> to list the public keys you need for <code>-S</code>. For a shared treasury that will hold real value, DKG is the method to prefer; use trusted dealer only when you fully trust the dealer's machine.</p>

<h2>FROST keys and the Zcash spend authorising key</h2>
<p>In a normal shielded wallet the <strong>spend authorising key</strong> (<code>ask</code>) is derived from a seed-phrase spending key. FROST instead splits the <code>ask</code> directly. The scheme does not <em>require</em> <code>ask</code> to come from a seed, and in fact DKG produces it unpredictably — which is exactly what lets DKG work here. The group's shared public value is the Spend validating key <code>ak</code>, and the rest of the wallet's keys are derived from that.</p>
<p>Once you have a group, derive a Zcash viewing key from the group's public key with <code>zcash-sign</code>:</p>
<pre><code>frost-client groups
zcash-sign generate --net test --ak &lt;ak&gt;</code></pre>
<p>This prints an Orchard-protocol address and a Unified Full Viewing Key (UFVK). Since the Ironwood upgrade (NU6.3, July 2026), the Orchard <em>receiver</em> inside a Unified Address receives into the current Ironwood pool, and the same keys cover both pools — there is no separate "Ironwood address". The UFVK is what you will import into a wallet to watch and build transactions; a FROST wallet needs more than a seed phrase to restore, so back up the whole group material (your key share, everyone's verifying shares, their identifiers and public keys), not just a mnemonic.</p>
<blockquote>Honesty check: ZIP 2005 (Ironwood) specifies that FROST keys for the Orchard protocol should be generated with a "quantum spending key" (<code>use_qsk</code>) so funds stay recoverable under a future post-quantum recovery protocol. As of October 2026 there is an open issue (ZcashFoundation/frost#1094) that <code>zcash-sign</code> derives keys in a way incompatible with that recoverability. Treat FROST-controlled shielded holdings as experimental, keep them on testnet, and follow that issue before trusting mainnet value to these tools.</blockquote>

<h2>Try it</h2>
<p>Install <code>frost-client</code> and generate a 2-of-3 group with the trusted-dealer command above, simulating Alice, Bob and Eve in one folder. Then:</p>
<ol>
  <li>Run <code>frost-client groups</code> and copy the group's public key (the <code>ak</code>).</li>
  <li>Run <code>zcash-sign generate --net test --ak &lt;ak&gt;</code> and save both the address and the UFVK — you will need them in the signing lesson.</li>
  <li>Open each <code>.toml</code> file and confirm you can see that the secret shares are stored in the clear. Write one sentence on what that means for where you would ever run this.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
  <li>Key generation yields three things per participant: a secret share, a verifying share, and the shared group verifying key.</li>
  <li>Trusted dealer is simplest but the dealer briefly holds the whole key; DKG never assembles the key but needs broadcast and encrypted channels.</li>
  <li>FROST splits the Zcash spend authorising key <code>ask</code>; the group's <code>ak</code> drives a Unified Full Viewing Key you import into a wallet.</li>
  <li>Select the Zcash ciphersuite with <code>-C redpallas</code>; it switches the tools to re-randomised FROST.</li>
  <li><code>frost-client</code> stores secrets unencrypted and <code>zcash-sign</code> key derivation has an open quantum-recoverability issue — keep this to testnet and learning.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://frost.zfnd.org/tutorial/trusted-dealer.html">ZF FROST Book — Trusted Dealer Key Generation</a></li>
  <li><a href="https://frost.zfnd.org/tutorial/dkg.html">ZF FROST Book — Distributed Key Generation</a></li>
  <li><a href="https://frost.zfnd.org/zcash/ywallet-demo.html">ZF FROST Book — Zcash demo (frost-client, zcash-sign)</a></li>
  <li><a href="https://zips.z.cash/zip-0312">ZIP 312 — FROST for Spend Authorization Multisignatures</a></li>
  <li><a href="https://github.com/ZcashFoundation/frost">ZcashFoundation/frost — library source</a></li>
</ul>`,
  },
  "l-02-17": {
    title: "Round 1 & 2: Signing Rounds",
    subtitle: "Run a live FROST signing session with the ZF tools \u2014 commitments, signature shares, the Zcash randomizer, and the frostd relay.",
    content: `<p>You have a 2-of-3 group and a viewing key. Now comes the part that actually authorises a spend: the two-round signing protocol. This lesson walks through what happens in each round, how the Zcash <strong>randomizer</strong> fits in, and how the <code>frostd</code> relay carries the messages so signers never have to connect to each other directly. You will run a complete signing session end to end, producing a FROST signature — the final step of turning that signature into a broadcastable transaction is the next lesson.</p>

<h2>Round 1 — commitments</h2>
<p>Signing starts with the <strong>Coordinator</strong> choosing which participants will sign and signalling them to begin. Each selected participant then generates fresh, single-use <strong>nonces</strong> and the matching <strong>commitments</strong> (in the library, via <code>round1::commit()</code>). The nonces are secret and stay on the participant's device for round 2; only the commitments go to the Coordinator.</p>
<p>Two properties are worth internalising. First, the nonces must be <em>fresh for every signing run</em> — reusing them would leak the secret share, which is why the library keeps them opaque and single-use. Second, the signing protocol itself does not require an authenticated or encrypted channel for correctness — a wrong or tampered message simply makes the run fail — though in a real deployment you still authenticate signers so you can tell who sent what.</p>

<h2>Round 2 — signature shares</h2>
<p>The Coordinator collects every participant's commitments, pairs them with the message to be signed, and builds a <strong>signing package</strong> (<code>SigningPackage::new()</code>). It sends that package to each participant. Each one checks the message, and if they consent, produces a <strong>signature share</strong> with their key package and their round-1 nonces (<code>round2::sign()</code>), then returns the share to the Coordinator.</p>
<blockquote>Participants must see and agree to the message before signing. The whole point of a threshold is that each signer makes an independent decision; an interface that hides the message and signs automatically throws that away.</blockquote>
<p>Remember from the overview lesson: <em>every</em> participant the Coordinator selected has to return a share. In a 2-of-3 group the Coordinator can start with just two signers, but if it selected three, all three must respond before the signature can be assembled.</p>

<h2>The Zcash randomizer</h2>
<p>For shielded Zcash there is one extra ingredient. To keep transactions unlinkable, the spend authorisation key is re-randomised per spend, so the Coordinator supplies a <strong>randomizer</strong> along with the message (ZIP 312's Re-Randomized FROST). With the ZF tools the message being signed is the transaction's <strong>SIGHASH</strong>, and the randomizer is generated for you by <code>zcash-sign</code> when you prepare the transaction. Both values are then fed into the FROST run. Selecting <code>-C redpallas</code> is what puts the tools into this re-randomised mode — you do not implement the randomisation yourself.</p>

<h2>Carrying messages with frostd</h2>
<p>Signers are usually behind NATs and firewalls, so they cannot easily open direct connections. The <strong>ZF FROST server, <code>frostd</code></strong>, is a small JSON-over-HTTPS relay that lets a Coordinator open a session and route end-to-end-encrypted messages between participants. It never sees secrets: clients authenticate with a key pair, and the server only enforces who may message whom — it cannot read the encrypted payloads.</p>
<p>For a local run, install and start it with a test certificate (the server requires TLS):</p>
<pre><code>cargo install --git https://github.com/ZcashFoundation/frost-zcash-demo.git --locked frostd

mkcert -install
mkcert localhost 127.0.0.1 ::1
frostd --tls-cert localhost+2.pem --tls-key localhost+2-key.pem</code></pre>
<p>By default <code>frostd</code> listens on port <strong>2744</strong>, which is why the <code>frost-client</code> commands point at <code>localhost:2744</code>. Access tokens last one hour, so log in at the start of each session.</p>

<h2>Running a signing session</h2>
<p>With the relay running and a group already generated, you drive three roles. First, in the signer terminal, prepare the transaction and start the signer, which prints a SIGHASH and a randomizer and then waits for a signature:</p>
<pre><code>zcash-sign sign -n test --tx-plan frost_pczt.created -o frost_pczt.signed</code></pre>
<p>Next, the Coordinator opens the session, naming the group and the two signers' public keys, and pastes in the SIGHASH and randomizer when prompted:</p>
<pre><code>frost-client groups -c alice.toml
frost-client coordinator -c alice.toml --server-url localhost:2744 --group &lt;group&gt; -S &lt;pubkey1&gt;,&lt;pubkey2&gt; -m - -r -</code></pre>
<p>Then each participant joins the same group's session, reviews the message, and signs:</p>
<pre><code>frost-client participant -c alice.toml --server-url localhost:2744 --group &lt;group&gt;
frost-client participant -c bob.toml --server-url localhost:2744 --group &lt;group&gt;</code></pre>
<p>The two rounds run over the relay, and the Coordinator prints the final FROST signature. You hand that signature back to the waiting <code>zcash-sign</code> prompt, which writes the signed transaction. The <code>&lt;group&gt;</code>, <code>&lt;pubkey1&gt;</code> and <code>&lt;pubkey2&gt;</code> values come from <code>frost-client groups</code>; a participant's own name shows as empty next to their public key.</p>
<blockquote>If a share is wrong, aggregation fails and the protocol names the misbehaving participant — "identifiable abort". You will see how to handle that, and how the shares combine into one signature, in the next lesson.</blockquote>

<h2>Try it</h2>
<p>Using the 2-of-3 group from the previous lesson, run one full signing round on a throwaway message:</p>
<ol>
  <li>Start <code>frostd</code> locally with an <code>mkcert</code> certificate as shown.</li>
  <li>Open four terminals — signer, Coordinator (Alice), participant Alice, participant Bob — and run the commands above, simulating all parties on your machine.</li>
  <li>Watch the Coordinator print the final signature. Note how many message round-trips happened, and which values you had to copy by hand (SIGHASH, randomizer, group key). Those hand-offs are exactly where a real wallet integration would need a better interface.</li>
</ol>
<p>Keep the signed output; you will finish the transaction in the aggregate-and-verify lesson.</p>

<h2>Key takeaways</h2>
<ul>
  <li>Round 1: each signer makes fresh single-use nonces and sends only the commitments to the Coordinator.</li>
  <li>Round 2: the Coordinator sends a signing package with the message; each signer returns a signature share after reviewing it.</li>
  <li>For Zcash the message is the transaction SIGHASH and the Coordinator also supplies a per-spend randomizer; <code>-C redpallas</code> enables this.</li>
  <li><code>frostd</code> relays end-to-end-encrypted messages on port 2744 and cannot read signers' secrets.</li>
  <li>Every selected participant must return a share, and a bad share aborts the run and names the culprit.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://frost.zfnd.org/tutorial/signing.html">ZF FROST Book — Signing (round 1, round 2, aggregate)</a></li>
  <li><a href="https://frost.zfnd.org/zcash/server.html">ZF FROST Book — The frostd server and its API</a></li>
  <li><a href="https://frost.zfnd.org/zcash/ywallet-demo.html">ZF FROST Book — Zcash signing demo (coordinator / participant)</a></li>
  <li><a href="https://zips.z.cash/zip-0312">ZIP 312 — Re-Randomized FROST and the randomizer</a></li>
  <li><a href="https://www.rfc-editor.org/rfc/rfc9591.html">RFC 9591 — FROST two-round signing</a></li>
</ul>`,
  },
  "l-02-18": {
    title: "Aggregate & Verify: the FROST Combiner",
    subtitle: "Combine signature shares into one signature, verify it against the group key, handle a cheating signer, and finish the Zcash transaction.",
    content: `<p>The signing rounds end with the Coordinator holding a set of signature shares. The last cryptographic step is to <strong>aggregate</strong> them into a single signature and confirm it is valid. This lesson covers what aggregation does, why verification is boringly ordinary (which is the whole point), how a cheating signer is caught, and the remaining mechanical steps that turn a FROST signature into a Zcash transaction you can broadcast — the finish line your lab is built around.</p>

<h2>Aggregation: many shares, one signature</h2>
<p>The Coordinator calls the library's <code>aggregate()</code> with the same signing package it sent in round 2, the collected signature shares, and the group's public key package. The result is one <strong>Schnorr signature</strong> for the message under the group verifying key. Nothing about it reveals that it came from several parties: it has the same size and shape as a signature from a single key. No secret share is ever combined or exposed — only the public signature shares are.</p>
<p>In the ZF Zcash flow you do not call <code>aggregate()</code> yourself; the <code>frost-client coordinator</code> command runs it and prints the final signature as a hex string. That hex value is the thing you feed back to <code>zcash-sign</code> to complete the transaction.</p>

<h2>Verifying is just ordinary verification</h2>
<p>A FROST signature is verified exactly like any single-party Schnorr signature: take the message, the signature, and the group verifying key, and check it. There is no special "threshold verification" step and no extra data for a verifier to handle. This is precisely why FROST is attractive for shielded Zcash — the network applies its normal spend-authorisation check and sees nothing unusual.</p>
<p>In the tools, verification happens for free: <code>aggregate()</code> validates the result internally, so if it returns a signature at all, that signature is valid for the message. A separate verify call exists in the library mainly to demonstrate the check; the Coordinator does not need to run it.</p>

<h2>When a signer cheats</h2>
<p>If a participant returns a malformed or dishonest signature share, aggregation does not silently produce a broken signature — it fails and tells you <em>who</em>. This is FROST's <strong>identifiable abort</strong>. The default <code>aggregate()</code> reports the first misbehaving participant it detects; the library also offers <code>aggregate_custom()</code> for when you need to catch every cheater in one pass. What you do next is a policy question — typically, exclude that participant from future signing sessions.</p>
<blockquote>Cheater detection is only trustworthy if identifiers come from authenticated channels. If a participant could simply attach any identifier to their share, a cheater could blame someone else. In practice you map each authenticated connection to a known identifier, so the accusation sticks to the right party.</blockquote>

<h2>From signature to broadcast transaction</h2>
<p>A shielded Zcash transaction needs more than a spend-authorisation signature — it also needs its zero-knowledge proof. The ZF demo keeps these steps separate, using <strong>PCZT</strong> (partially created Zcash transaction) files and <code>zcash-devtool</code>:</p>
<ol>
  <li><strong>Create</strong> the transaction as a PCZT from your FROST view-only wallet, which also yields the SIGHASH and randomizer you signed in the last lesson.</li>
  <li><strong>Sign</strong> — paste the aggregated FROST signature into the waiting <code>zcash-sign</code> prompt; it writes the signed PCZT.</li>
  <li><strong>Prove</strong> the transaction separately (the proof does not need the secret shares, so whoever coordinates can do it).</li>
  <li><strong>Combine</strong> the signed and proven parts, then <strong>send</strong>:</li>
</ol>
<pre><code>zcash-devtool pczt combine -i frost_pczt.signed -i frost_pczt.proven &gt; frost_pczt.combined
zcash-devtool pczt -w ./.frost.view/ send -s zecrocks &lt; frost_pczt.combined</code></pre>
<p>Treat the exact file names, the wallet path (<code>./.frost.view/</code>), the network flag and the server alias as values to match to your own setup and to the ZF FROST book, which is the authority for the current invocation — these demo tools change, so check the book's zcash-devtool tutorial rather than memorising flags.</p>

<h2>Try it</h2>
<p>Finish the transaction you started in the signing lesson, on testnet:</p>
<ol>
  <li>Import the UFVK from lesson l-02-16 into a wallet as a view-only account (the ZF book's zcash-devtool or Ywallet tutorial shows the import), and fund the group's Orchard-protocol address from a testnet faucet. Testnet faucets are community-run — re-check one is live before relying on it, for example <a href="https://zcashfaucet.jinolabs.xyz">zcashfaucet.jinolabs.xyz</a> or <a href="https://fauzec.com">fauzec.com</a>.</li>
  <li>Create a small PCZT, run the signing session, and paste the aggregated signature to produce the signed PCZT.</li>
  <li>Prove, combine, and send, then confirm the transaction appears for your wallet. If aggregation ever fails, note which participant the tool named and write down what your group's policy would be.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
  <li>Aggregation combines the public signature shares into one ordinary Schnorr signature; no secret is ever reassembled.</li>
  <li>Verification is identical to single-key verification against the group verifying key — nothing special on-chain.</li>
  <li>A bad share makes aggregation fail and names the culprit (identifiable abort), but only if identifiers come from authenticated channels.</li>
  <li>A shielded transaction still needs its proof: create, sign with the FROST signature, prove, combine, then send.</li>
  <li>The ZF demo tools move fast — follow the current ZF FROST book for exact <code>zcash-devtool</code> commands.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://frost.zfnd.org/tutorial/signing.html">ZF FROST Book — Aggregate, verify, and identifiable abort</a></li>
  <li><a href="https://frost.zfnd.org/zcash/devtool-demo.html">ZF FROST Book — zcash-devtool tutorial (PCZT create/combine/send)</a></li>
  <li><a href="https://github.com/zcash/zcash-devtool">zcash/zcash-devtool — the PCZT CLI</a></li>
  <li><a href="https://www.rfc-editor.org/rfc/rfc9591.html">RFC 9591 — FROST signature aggregation</a></li>
  <li><a href="https://zips.z.cash/zip-0312">ZIP 312 — FROST for Spend Authorization Multisignatures</a></li>
</ul>`,
  },
  "l-02-19": {
    title: "Multisig Treasury Patterns",
    subtitle: "Choose threshold parameters, plan share backup, repair and refresh, and decide what a small organisation should and should not run on FROST today.",
    content: `<p>You can now generate shares, run a signing session, and broadcast a FROST-signed shielded transaction. This final lesson steps back to the decisions that keep a shared treasury safe over months and years, not just for one demo: what threshold to pick, how to back up and recover shares, how signers communicate and set policy, and — most importantly — an honest read on what a small community organisation should and should not trust to these tools today. It sets you up for the lab, where you build a 2-of-3 shielded team treasury end to end.</p>

<h2>Choosing t and n</h2>
<p>The threshold is a trade-off between <strong>resilience</strong> (surviving a lost or unavailable share) and <strong>security</strong> (how many shares an attacker must capture). There is no universally right answer, only the right answer for your group's size, geography and risk.</p>
<table>
<thead><tr><th>Setup</th><th>Resilience</th><th>Main risk</th></tr></thead>
<tbody>
<tr><td>2-of-2</td><td>None — both must be present</td><td>One signer unavailable freezes the funds</td></tr>
<tr><td>2-of-3</td><td>One share can be lost or offline</td><td>Lower security margin; two compromised shares spend</td></tr>
<tr><td>3-of-5</td><td>Two shares can be lost</td><td>More coordination per spend</td></tr>
<tr><td>3-of-7</td><td>Institutional; tolerates two failures</td><td>High coordination cost</td></tr>
</tbody>
</table>
<p>For most small teams, <strong>2-of-3</strong> (resilient with minimal overhead) or <strong>3-of-5</strong> (higher security) are the sensible starting points. Remember that <em>all</em> selected signers must respond in a given run, so a higher <code>n</code> only helps if your members are actually reachable when a spend is needed.</p>

<h2>Backup, repair and refresh</h2>
<p>A FROST wallet cannot be restored from a seed phrase alone. Each member must back up more: their secret share, the verifying shares of all participants, and everyone's identifiers and public keys. A JSON file holding this group material is the practical approach. The upside over a solo wallet is real — losing one share is not catastrophic, because the group can help.</p>
<p>The ZF library implements two operations that matter here, so you are not inventing them:</p>
<ul>
  <li><strong>Repair.</strong> A threshold of participants can help another recover a lost share, or issue a share to a new member while keeping the same threshold (for example, moving a 2-of-3 group back to 2-of-3 after one device is lost). The helpers never learn the recovered share.</li>
  <li><strong>Refresh.</strong> Participants update their shares while keeping the same group public key — useful to blunt a slow attacker, or to remove a member by refreshing without them.</li>
</ul>
<blockquote>Refresh does <strong>not</strong> restore full security after a compromise. If a former member kept their old pre-refresh share, they could still collude with another old-share holder to reconstruct the original key. If that risk is unacceptable, migrate to a brand-new group rather than relying on refresh.</blockquote>

<h2>Communication, viewing, and policy</h2>
<p>Signers need a way to reach each other for every spend. The <code>frostd</code> relay handles this without learning secrets, but it is a live service your group depends on — decide who runs it, how it is reached, and what happens if it is down. Signing itself is an off-chain coordination step, so build in the expectation that a spend takes a round of messages, not an instant click.</p>
<p>Keep two authorities separate in your head. FROST protects the <strong>spend</strong> authority — who can move funds. It says nothing about <strong>viewing</strong> authority — who can see the balance and history through the viewing key. Anyone you give the UFVK to can watch the treasury. Decide a viewing policy on purpose; it does not come for free with the threshold.</p>
<p>Write down the operational rules before you hold value: who the signers are, the threshold, where each share lives, your backup and repair plan, how a spend is proposed and approved, and how you would remove a member. A treasury is a process, not just a key.</p>

<h2>What to use this for today</h2>
<p>Be clear-eyed about maturity. FROST the protocol is standardised (RFC 9591) and the re-randomised Zcash variant is specified (ZIP 312), and the ZF <code>frostd</code>, <code>frost-client</code> and the crates have been audited. But the end-to-end <em>shielded</em> flow is still demo-grade in October 2026:</p>
<ul>
  <li><code>frost-client</code> stores secret shares unencrypted in its config file.</li>
  <li><code>zcash-sign</code> key derivation has an open issue (ZcashFoundation/frost#1094) that is incompatible with Ironwood's quantum-recoverability design (ZIP 2005) — a real concern for long-lived mainnet funds.</li>
  <li>Wallet support is thin and moving: FROST tooling added Ironwood/v6 signing in August 2026, but Ywallet — the subject of the oldest demo — is unmaintained and will not support Ironwood. Verify a tool actually targets Ironwood before trusting it, and pin tool versions.</li>
</ul>
<p>So: use FROST now to <em>learn</em>, to prototype, and to run real ceremonies on <strong>testnet</strong>. A small organisation should not yet move its only copy of real mainnet funds into a FROST-controlled shielded wallet built on these demo tools. The Zcash Foundation's own stated next step is wallet integration — follow that, and the #1094 issue, before changing this advice.</p>

<h2>Try it</h2>
<p>Draft a one-page treasury policy for the 2-of-3 testnet group you built this week, to use as your lab plan. Include: the three members and the threshold; where each share and backup lives; who runs or which <code>frostd</code> you use; your repair plan if one device is lost; your viewing-key policy; and one sentence stating why this treasury stays on testnet for now. Revisit your <code>t</code>/<code>n</code> answers from the overview lesson — would you still choose the same parameters?</p>

<h2>Key takeaways</h2>
<ul>
  <li>Pick <code>t</code> and <code>n</code> for your group's reachability and risk; 2-of-3 and 3-of-5 are common starting points.</li>
  <li>Back up the full group material, not a seed phrase; the library supports repairing a lost share and refreshing shares.</li>
  <li>Refresh does not undo a past compromise — migrate to a new group if an old share may survive.</li>
  <li>FROST protects spend authority only; set a separate, deliberate policy for who holds the viewing key.</li>
  <li>The shielded end-to-end flow is demo-grade today — learn and prototype on testnet, and do not custody real mainnet funds on these tools yet.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://frost.zfnd.org/frost.html">ZF FROST Book — repairing and refreshing shares</a></li>
  <li><a href="https://frost.zfnd.org/zcash/technical-details.html">ZF FROST Book — backing up FROST key shares for Zcash</a></li>
  <li><a href="https://zips.z.cash/zip-2005">ZIP 2005 — Ironwood quantum-recoverable notes and FROST key generation</a></li>
  <li><a href="https://github.com/ZcashFoundation/frost-zcash-demo">ZcashFoundation/frost-zcash-demo — frostd, frost-client, zcash-sign</a></li>
  <li><a href="https://zechub.wiki/">ZecHub — FROST &amp; Threshold Custody for Shielded ZEC</a></li>
</ul>`,
  },
}
