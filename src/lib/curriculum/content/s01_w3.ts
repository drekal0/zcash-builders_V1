// AUTO-GENERATED from scratchpad lesson fragments. Do not edit by hand.
// Each entry: lesson id -> { title, subtitle, content (HTML) }.
import type { LessonContent } from './types'

export const M_s01_w3: Record<string, LessonContent> = {
  "l-01-01": {
    title: "Why Privacy Matters in Crypto",
    subtitle: "Explain what a public ledger reveals about its users, and what Zcash's shielded transactions hide instead.",
    content: `<p>In Weeks 1 and 2 you learned why a blockchain is trustworthy: anyone can download the ledger and check every transaction for themselves. This lesson looks at the cost of that design. If anyone can verify every transaction, anyone can also read every transaction.</p>
<p>Zcash exists to keep the verification and remove the exposure. Before you study how, you need a clear picture of the problem and an honest picture of what Zcash does and does not solve, because you will be explaining both to your users.</p>

<h2>A public ledger is a public bank statement</h2>
<p>On a Bitcoin-style chain, every transaction records the addresses that paid, the addresses that were paid, and the amounts. The record is permanent and free for anyone to query. In ordinary life that means:</p>
<ul>
  <li>You are paid in crypto. Your employer knows your address, so they can watch where your salary goes.</li>
  <li>You pay a merchant. The merchant can look up the address you paid from and see what else it holds.</li>
  <li>You run a business. Competitors can study your suppliers, customers and cash flow.</li>
</ul>
<p>None of this requires hacking. It is the system working as designed.</p>

<h2>Why a pseudonym does not protect you</h2>
<p>An address is a pseudonym, not a name. That is not enough, for four reasons:</p>
<ul>
  <li><strong>On-ramps know who you are.</strong> If you buy coins from a service that checks identity, that service can connect your name to your first address.</li>
  <li><strong>Addresses can be clustered.</strong> Analysts use heuristics such as common-input ownership (inputs spent together in one transaction probably belong to one person) and change detection (guessing which output returns to the sender) to group addresses into wallets.</li>
  <li><strong>One link exposes everything.</strong> Once a single address in a cluster is tied to you, your whole history is tied to you, in both directions in time.</li>
  <li><strong>The record never expires.</strong> Better analysis can be applied to payments made years ago.</li>
</ul>

<h2>Privacy is not secrecy</h2>
<p>Privacy means you decide who sees your financial information. It does not mean nobody ever can. A company keeps its payroll confidential and still shows its books to an auditor. A useful private payment system has to support both halves: hidden from the public by default, and disclosable on purpose to the people you choose.</p>

<h2>What Zcash offers, and what it does not</h2>
<p>Zcash has two kinds of value. <strong>Transparent</strong> value behaves like Bitcoin; the Zcash Protocol Specification says transparent transfers "work essentially as in Bitcoin and have the same privacy properties". <strong>Shielded</strong> value is different: in a transfer between shielded addresses, the sender, the recipient and the amount are encrypted, and the network checks a zero-knowledge proof that the transaction is valid instead of reading its contents. A shielded payment can also carry an encrypted memo of up to 512 bytes, which the public cannot read. Lessons 3 and 4 explain the mechanics.</p>
<p>For deliberate disclosure, Zcash has <strong>viewing keys</strong>. A full viewing key lets its holder see an account's incoming and outgoing shielded activity without being able to spend. An incoming viewing key shows only what arrives. You will work with these in Week 4.</p>
<p>Now the limits, which you should be able to state from memory:</p>
<ul>
  <li>Transparent addresses still exist on Zcash, and anything that touches one is public.</li>
  <li>When value moves between pools, the amount that crosses is public.</li>
  <li>The transaction fee is public, even on a fully shielded payment.</li>
  <li>A viewing key cannot be taken back once shared. To cut off access you move the funds to a new account.</li>
  <li>The protocol does not hide network-level metadata, such as the IP address a transaction was broadcast from. That is the wallet's and the user's job.</li>
</ul>
<blockquote><p>Zcash does not make every user private automatically. It gives you a shielded pool with strong cryptographic privacy, and the result depends on whether your users' funds are actually in it.</p></blockquote>

<h2>Try it</h2>
<p>Open a public block explorer. ZecHub's page on what explorers can see (linked below) names Blockchair's Zcash explorer at <code>blockchair.com/zcash</code>; a Bitcoin explorer works just as well. Then:</p>
<ol>
  <li>Pick any recent transaction between transparent addresses. Write down everything you can learn from that one page: addresses, amounts, time, fee.</li>
  <li>Click one of the receiving addresses and follow its funds one hop further. How much did you learn about someone who was not even a party to the first transaction?</li>
  <li>Write three sentences describing a real situation, at work or at home, in which you would not want a stranger to do this to you.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
  <li>Public verifiability and public readability come together on a transparent chain; pseudonymous addresses do not undo that.</li>
  <li>Privacy means control over disclosure. Zcash pairs shielded transactions with viewing keys so users can hide by default and reveal on purpose.</li>
  <li>Shielded transfers hide sender, recipient and amount. Transparent transfers, pool-crossing amounts and fees remain public.</li>
  <li>Never describe Zcash as untraceable or anonymous by default. Say exactly what is hidden and what is not.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf">Zcash Protocol Specification</a> — read the "High-level Overview" section for transparent and shielded transfers and viewing keys.</li>
  <li><a href="https://zechub.wiki/start-here/who-can-see-your-zcash-payment">ZecHub: Who Can See Your Zcash Payment?</a> — address types, viewing keys and what cannot be revoked.</li>
  <li><a href="https://zechub.wiki/zcash-tech/what-a-block-explorer-can-see">ZecHub: What a block explorer can see on Zcash</a></li>
</ul>`,
  },
  "l-01-02": {
    title: "Zcash History & the Ceremony",
    subtitle: "Trace Zcash from the Zerocash paper to Ironwood, and explain what a trusted setup is and why newer pools need none.",
    content: `<p>Zcash has been running since 2016, and most of what you will read about it online was written before 2026, when the node software, the main shielded pool and the organisations building the protocol all changed within seven months. This lesson gives you the timeline so that you can date any tutorial, forum post or code sample you meet and decide whether to trust it.</p>
<p>It also explains "the ceremony", the trusted setup that early Zcash depended on, because the story of how Zcash removed that dependency explains why the current shielded pool is built the way it is.</p>

<h2>From a paper to a network (2014–2016)</h2>
<p>Zcash implements, with changes and security fixes, the protocol described in the 2014 academic paper <em>Zerocash: Decentralized Anonymous Payments from Bitcoin</em> by Ben-Sasson, Chiesa, Garman, Green, Miers, Tromer and Virza. The Electric Coin Company (ECC), led by Zooko Wilcox, turned that design into a working network. The genesis block was mined on 28 October 2016. This first version of the protocol, and its shielded pool, are called <strong>Sprout</strong>.</p>

<h2>The ceremony: what a trusted setup is</h2>
<p>Sprout's proving system needed a set of public parameters before anyone could create or check a proof. Generating them produces a secret by-product, nicknamed <strong>toxic waste</strong>. ZIP 224 describes the danger precisely: the parameters have a hidden structure "that if known could be used to create fake proofs and thus counterfeit funds". Because shielded amounts are encrypted, nobody would see the forged coins. The threat is to the money supply, not to the secrecy of other people's transactions.</p>
<p>The answer was a <strong>multi-party computation</strong> (MPC): several people each contribute randomness, and the hidden structure can only be recovered if every one of them colludes or is compromised. One honest participant who destroys their secret is enough.</p>
<ul>
  <li><strong>Sprout, 2016.</strong> Six participants took part.</li>
  <li><strong>Sapling, 2017–2018.</strong> A two-phase setup. Phase 1, <em>Powers of Tau</em>, was not tied to any particular circuit; the Zcash Foundation announced its conclusion in April 2018 and reported 87 contributions. Phase 2, the Sapling MPC, was specific to Sapling's circuits. ZIP 224 gives "around 90" participants per round.</li>
</ul>
<p>More participants make collusion less plausible, but ZIP 224 is blunt that generating such parameters "remains ... a point of risk within the protocol", and that a setup has to be run again whenever the proving system changes. That happened. The original Sprout proving system (BCTV14) had a flaw, separate from the ceremony, that could have allowed counterfeiting. The specification records that there is no evidence it was used and that it was mitigated when Sapling activated with a different proving system. The details were published in February 2019.</p>
<p>In 2022 the NU5 upgrade introduced the Orchard protocol on the <strong>Halo 2</strong> proving system, which needs no such parameters. No ceremony, no toxic waste. Lessons 4 and 6 return to Halo 2.</p>

<h2>Network upgrades at a glance</h2>
<p>Zcash changes its consensus rules through scheduled <strong>network upgrades</strong>, each activating at a fixed block height. Week 4 covers the process; here is the map.</p>
<table>
  <thead>
    <tr><th>When</th><th>Upgrade</th><th>What it changed</th></tr>
  </thead>
  <tbody>
    <tr><td>Oct 2016</td><td>Launch (Sprout)</td><td>First shielded pool</td></tr>
    <tr><td>Jun 2018</td><td>Overwinter</td><td>Transaction versioning, expiry, replay protection</td></tr>
    <tr><td>Oct 2018</td><td>Sapling</td><td>Efficient shielded pool, viewing keys, diversified addresses</td></tr>
    <tr><td>Dec 2019</td><td>Blossom</td><td>Block target spacing 150 s to 75 s</td></tr>
    <tr><td>Jul 2020</td><td>Heartwood</td><td>Shielded coinbase</td></tr>
    <tr><td>Nov 2020</td><td>Canopy</td><td>First halving; Sprout closed to new deposits</td></tr>
    <tr><td>May 2022</td><td>NU5</td><td>Orchard on Halo 2, Unified Addresses, version 5 transactions</td></tr>
    <tr><td>Nov 2024</td><td>NU6</td><td>Second halving; development funding changes</td></tr>
    <tr><td>Nov 2025</td><td>NU6.1</td><td>Further funding changes (Week 4)</td></tr>
    <tr><td>3 Jun 2026</td><td>NU6.2</td><td>Orchard re-enabled on a corrected circuit</td></tr>
    <tr><td>28 Jul 2026</td><td>NU6.3 "Ironwood"</td><td>New Ironwood pool; Orchard pool sealed; version 6 transactions</td></tr>
  </tbody>
</table>

<h2>2026: the year the picture changed</h2>
<p><strong>January: the ECC team leaves.</strong> On 7 January 2026 the entire Electric Coin Company team resigned after a governance dispute with Bootstrap, the nonprofit that owned ECC. The departing team said the board had changed their working conditions so far that resignation was forced; Bootstrap framed the matter as one of governance and nonprofit legal compliance. Nobody alleged criminal conduct, and the network was unaffected. The former team founded <strong>ZODL</strong> (Zcash Open Development Lab), led by Josh Swihart, which now maintains core protocol libraries and the Zodl wallet (formerly Zashi). Three former Bootstrap board members formed a separate nonprofit, Sovright.</p>
<p><strong>May–June: the Orchard vulnerability.</strong> On 29 May 2026 researcher Taylor Hornby reported a soundness bug in the Orchard circuit implementation. An emergency soft fork disabled Orchard at height 3,363,426 on 2 June, and NU6.2 re-enabled it with a corrected circuit at height 3,364,600 on 3 June. There is no evidence the bug was exploited.</p>
<p><strong>July: zcashd ends, Ironwood begins.</strong> The original node, <code>zcashd</code>, reached end-of-support and halted at height 3,417,100 on 18 July. Zebra, from the Zcash Foundation, is now the full node. Ten days later NU6.3 activated at height 3,428,143, creating the Ironwood pool and sealing Orchard.</p>
<p><strong>Next: NU7.</strong> As of October 2026, NU7 is active on Testnet only. Its Mainnet activation height has not been set.</p>
<blockquote><p>Dating rule: if a guide tells you to run <code>zcashd</code>, calls Orchard the newest pool, or names ECC as the current core team, it predates 2026. Check every command in it against current documentation.</p></blockquote>

<h2>Try it</h2>
<p>Activation heights let you check dates yourself. Zcash's block target spacing has been 75 seconds since Blossom.</p>
<ol>
  <li>NU6.2 activated at height 3,364,600 and NU6.3 at height 3,428,143. How many blocks apart are they?</li>
  <li>Multiply by 75 seconds and convert to days. Compare your answer with the calendar gap between 3 June and 28 July 2026.</li>
  <li>Do the same for the emergency soft fork (3,363,426) and NU6.2 (3,364,600). Roughly how long was Orchard disabled?</li>
  <li>Open ZIP 257 and find the sentence explaining why the soft-fork height is 60 blocks later than first planned. What does that tell you about deploying an emergency rule change on a decentralised network?</li>
</ol>

<h2>Key takeaways</h2>
<ul>
  <li>A trusted setup produces parameters whose hidden structure would allow undetectable counterfeiting; an MPC makes that require every participant to be compromised.</li>
  <li>Sprout (six participants) and Sapling (Powers of Tau plus the Sapling MPC) used trusted setups. Orchard and Ironwood use Halo 2, which needs none.</li>
  <li>In 2026 the ECC team became ZODL, zcashd was retired in favour of Zebra, and Ironwood replaced Orchard as the active shielded pool.</li>
  <li>NU6.3 is live on Mainnet. NU7 is not.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/zip-0224">ZIP 224: Orchard Shielded Protocol</a> — the Motivation section summarises the trusted setups and why Orchard avoided one.</li>
  <li><a href="https://zfnd.org/conclusion-of-the-powers-of-tau-ceremony/">Zcash Foundation: Conclusion of the Powers of Tau Ceremony</a></li>
  <li><a href="https://zips.z.cash/zip-0257">ZIP 257: Deployment of the Orchard Temporary Vulnerability Mitigation and NU6.2 Network Upgrade</a></li>
  <li><a href="https://zips.z.cash/zip-0258">ZIP 258: Deployment of the NU6.3 Network Upgrade</a></li>
  <li><a href="https://zechub.wiki/start-here/how-zcash-is-organized">ZecHub: How Zcash is organized</a> — the 2026 reorganisation, with both sides' accounts.</li>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf">Zcash Protocol Specification</a> — see the vulnerability note in the BCTV14 section.</li>
</ul>`,
  },
  "l-01-03": {
    title: "Transparent vs Shielded Pools",
    subtitle: "Name Zcash's value pools as they stand in October 2026 and say exactly what an observer learns from each kind of transfer.",
    content: `<p>Lesson 1 said that Zcash has transparent value and shielded value. This lesson makes that precise. All ZEC sits in one of a small number of <strong>value pools</strong>, and what the public can see about a payment depends on which pools it touches. Later product decisions (which address to show a customer, when to shield a deposit, what to tell users about their privacy) rest on this map.</p>
<p>The map changed in July 2026, so much of what you find online is out of date. Learn the version below.</p>

<h2>The value pools today</h2>
<p>The Zcash Protocol Specification states that "all value in Zcash belongs to some chain value pool". As of October 2026 there is one transparent pool and four shielded ones.</p>
<table>
  <thead>
    <tr><th>Pool</th><th>Status</th><th>How you address it</th></tr>
  </thead>
  <tbody>
    <tr><td>Transparent</td><td>Active. Fully public.</td><td>Mainnet addresses beginning <code>t1</code> (pay to public key hash) or <code>t3</code> (pay to script hash)</td></tr>
    <tr><td>Sprout</td><td>Legacy. No new value can enter since Canopy (2020).</td><td>Old addresses beginning <code>zc</code>; you will not build for it</td></tr>
    <tr><td>Sapling</td><td>Active.</td><td>Mainnet addresses beginning <code>zs</code>, or the Sapling receiver of a Unified Address</td></tr>
    <tr><td>Orchard</td><td>Sealed since 28 July 2026. Value can leave but not enter.</td><td>No address of its own (see below)</td></tr>
    <tr><td>Ironwood</td><td>Active. Where new shielded value goes.</td><td>The Orchard receiver of a Unified Address (<code>u1…</code>)</td></tr>
  </tbody>
</table>
<p>Orchard and Ironwood are separate pools that run the same cryptographic protocol, so they share one receiver type, which has no standalone string encoding and only appears inside a Unified Address. Lesson 6 explains why there are two pools; Lesson 7 takes Unified Addresses apart. (The specification also defines a "deferred" pool for development-fund accounting. Users do not send payments to it.)</p>

<h2>Notes, commitments and nullifiers</h2>
<p>The transparent pool works as in Bitcoin: unspent outputs, each naming an address and an amount in the clear. Shielded pools hold value in <strong>notes</strong>. A note specifies an amount and, indirectly, the shielded address that can spend it. The chain never shows a note. It shows two things derived from it:</p>
<ul>
  <li>a <strong>note commitment</strong>, published when the note is created and added to that pool's commitment tree (a Merkle tree, as in Week 1);</li>
  <li>a <strong>nullifier</strong>, published when the note is spent, so that it cannot be spent twice.</li>
</ul>
<p>Without the right key it is infeasible to tell which commitment a nullifier belongs to. That is the core of shielded privacy: a spend proves that <em>some</em> earlier commitment is being spent without saying which one. Lesson 4 covers the proof.</p>

<h2>What each kind of transfer reveals</h2>
<p>One rule from the specification does most of the work: value can move between pools, transparent or shielded, and "this always reveals the amount transferred". Each shielded pool has a public <code>valueBalance</code> field in the transaction (for example <code>valueBalanceSapling</code> or <code>valueBalanceIronwood</code>) giving the net amount leaving that pool.</p>
<table>
  <thead>
    <tr><th>Transfer</th><th>Public</th><th>Hidden</th></tr>
  </thead>
  <tbody>
    <tr><td>Transparent to transparent</td><td>Sender addresses, recipient addresses, amounts, fee</td><td>Nothing</td></tr>
    <tr><td>Shielding (transparent to shielded)</td><td>The transparent source addresses, and the amount entering the pool</td><td>The shielded recipient; how the value is split into notes; any memo</td></tr>
    <tr><td>Shielded to shielded, same pool</td><td>The fee; the number of inputs and outputs; opaque nullifiers and commitments</td><td>Sender, recipient, amount, memo</td></tr>
    <tr><td>Deshielding (shielded to transparent)</td><td>The transparent recipient address, and the amount leaving the pool</td><td>The shielded sender; which notes were spent</td></tr>
    <tr><td>Shielded to shielded, different pools (Sapling to Ironwood, or Orchard to Ironwood)</td><td>The amount that crossed, and which two pools</td><td>Sender and recipient addresses</td></tr>
  </tbody>
</table>
<p>The last row is the one people forget: a payment can be shielded at both ends and still publish its amount. This is why the Orchard to Ironwood migration needed careful wallet design (Lesson 6).</p>
<blockquote><p>The specification makes its strongest privacy claim only for fully shielded transactions, and warns that cleartext data such as the number of inputs and outputs, and timing, can still support probabilistic guesses about linkage. "Shielded" is not a synonym for "nothing leaks".</p></blockquote>

<h2>The turnstile</h2>
<p>If amounts inside a pool are hidden, how does anyone know the supply is intact? Because every crossing is public, each node keeps a running total for each pool, the <strong>chain value pool balance</strong>. ZIP 209 requires nodes to reject any block that would make one of these balances negative. More value can never leave a pool than entered it. The community calls this the <strong>turnstile</strong>.</p>
<p>The turnstile does not prevent a bug inside a pool, but it caps the damage at that pool's balance. It was the backstop the network relied on in June 2026.</p>

<h2>Privacy depends on the crowd</h2>
<p>When a shielded note is spent, the candidates for "which note was this?" are all earlier notes in that pool that the observer cannot rule out. A larger, busier pool gives better cover for everyone in it. Hopping in and out does the opposite: shielding 3.14159 ZEC and deshielding 3.14159 ZEC ten minutes later invites an observer to link the two ends by amount and timing, whatever happened in between.</p>
<p>For builders this gives three working rules: shield transparent funds soon after they arrive, keep value in one shielded pool instead of crossing repeatedly, and treat every pool crossing as a public event when you design a flow.</p>

<h2>Try it</h2>
<p>Below are five simplified transaction summaries. The field names for value balances are real; the layout is illustrative and amounts are in zatoshis (1 ZEC = 100,000,000 zatoshis). A value balance is the pool's spends minus its outputs, so a negative number means value entered the pool.</p>
<pre><code>A  transparent in: 300000000   transparent out: 299990000
B  transparent in: 100010000   transparent out: 0
   valueBalanceIronwood: -100000000
C  transparent in: 0           transparent out: 0
   valueBalanceIronwood: 10000
D  transparent in: 0           transparent out: 0
   valueBalanceOrchard: 500000000   valueBalanceIronwood: -499980000
E  transparent in: 0           transparent out: 50000000
   valueBalanceSapling: 50010000</code></pre>
<ol>
  <li>Classify each one using the five rows of the table above.</li>
  <li>For each, write down what an observer learns: which addresses, which amounts.</li>
  <li>Work out the fee for each. The fee is whatever is left over: transparent inputs, minus transparent outputs, plus every value balance.</li>
  <li>Which transaction tells an observer the most about a shielded user, and why?</li>
</ol>

<h2>Key takeaways</h2>
<ul>
  <li>Zcash has a transparent pool and four shielded pools. Sapling and Ironwood are active, Orchard is sealed, Sprout is legacy.</li>
  <li>Shielded value is held in notes; the chain shows only commitments and nullifiers.</li>
  <li>Any movement between pools publishes the amount, including shielded-to-shielded moves across two pools.</li>
  <li>A fully shielded transfer within one pool hides sender, recipient, amount and memo. The fee and the number of inputs and outputs remain visible.</li>
  <li>The turnstile (ZIP 209) guarantees that no pool can pay out more than was paid in.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf">Zcash Protocol Specification</a> — the "High-level Overview" section defines value pools, notes, nullifiers and what transfers reveal.</li>
  <li><a href="https://zips.z.cash/zip-0209">ZIP 209: Prohibit Out-of-Range Chain Value Pool Balances</a></li>
  <li><a href="https://zips.z.cash/zip-0229">ZIP 229: Version 6 Transaction Format</a> — definitions of the Orchard pool and the Ironwood pool.</li>
  <li><a href="https://zechub.wiki/start-here/who-can-see-your-zcash-payment">ZecHub: Who Can See Your Zcash Payment?</a></li>
  <li><a href="https://zechub.wiki/zcash-tech/the-turnstile">ZecHub: The turnstile</a></li>
</ul>`,
  },
  "l-01-04": {
    title: "zk-SNARKs in Plain English",
    subtitle: "Explain what a zero-knowledge proof is and list what the proof in a shielded Zcash transaction actually attests.",
    content: `<p>Lesson 3 left a gap. If a shielded transaction hides its sender, recipient and amount, how can thousands of nodes agree that it is valid? The answer is a <strong>zero-knowledge proof</strong>: a short piece of data that convinces a verifier a statement is true without revealing why it is true.</p>
<p>You will not write proving systems in this programme, and you do not need the mathematics. You do need an accurate mental model: what is proved, what stays secret, what is still checked in the open, and what it means when a proof system has a bug.</p>

<h2>An analogy: the two balls</h2>
<p>Your friend is colour-blind. You hold a red ball and a green ball that feel identical, and you want to convince them the balls differ, without telling them which is which.</p>
<ol>
  <li>Your friend takes both balls, hides them behind their back, and either swaps them between hands or does not.</li>
  <li>They show you the balls and ask: "Did I swap?"</li>
  <li>You can see the colours, so you answer correctly every time.</li>
</ol>
<p>If the balls were really the same, you could only guess, and you would be wrong half the time. After 20 correct answers the chance that you are bluffing is 1 in 2 to the power 20, about one in a million. Your friend ends up convinced the balls differ and has learned nothing else. They still do not know which one is red.</p>
<p>Three properties are on show, and they have names:</p>
<ul>
  <li><strong>Completeness.</strong> If the statement is true, an honest prover convinces the verifier.</li>
  <li><strong>Soundness.</strong> If the statement is false, a cheating prover fails except with negligible probability.</li>
  <li><strong>Zero knowledge.</strong> The verifier learns nothing beyond the truth of the statement.</li>
</ul>

<h2>From a conversation to a SNARK</h2>
<p>The ball game needs many rounds between two parties who are both present. A blockchain cannot work that way: a transaction is created once, and every node, now and later, must be able to check it alone. Zcash uses <strong>zk-SNARKs</strong>, zero-knowledge succinct non-interactive arguments of knowledge.</p>
<table>
  <thead>
    <tr><th>Term</th><th>Meaning</th></tr>
  </thead>
  <tbody>
    <tr><td>Zero-knowledge</td><td>The proof reveals nothing about the secret inputs beyond what the statement implies.</td></tr>
    <tr><td>Succinct</td><td>The proof is small and quick to verify compared with redoing the computation.</td></tr>
    <tr><td>Non-interactive</td><td>One message from prover to verifier. No rounds.</td></tr>
    <tr><td>Argument of knowledge</td><td>Producing a valid proof is infeasible unless the prover actually knows secret inputs that satisfy the statement. "Argument" signals that this holds against provers with realistic computing power.</td></tr>
  </tbody>
</table>
<p>The <strong>statement</strong> is the claim being proved. Its <strong>primary inputs</strong> are public and appear in the transaction. Its <strong>auxiliary inputs</strong>, often called the witness, are known only to the prover. The statement is compiled into a <strong>circuit</strong>, a fixed system of arithmetic constraints. A <strong>proving key</strong> is used to make proofs for that circuit and a <strong>verifying key</strong> to check them.</p>

<h2>What a Zcash proof attests</h2>
<p>Here is the statement proved for one Orchard-protocol <strong>action</strong> (the unit that spends up to one note and creates up to one note), written as a function. The conditions are those in the "Action Statement (Orchard)" section of the protocol specification; the code is illustrative, not a real API.</p>
<pre><code>// Illustrative only. Public inputs are in the transaction; the witness never leaves the wallet.
function actionStatement(pub, witness): boolean {
  const { anchor, cvNet, nullifier, rk, cmNew } = pub
  const { oldNote, merklePath, keys, newNote, randomness } = witness

  return (
    // 1. The note being spent exists: its commitment is in the tree whose root is \`anchor\`
    //    (or the note is a zero-value dummy).
    merklePath.leadsFrom(commit(oldNote)).to(anchor) &amp;&amp;
    // 2. The spender is authorised: \`rk\` is a re-randomised form of the note's
    //    spend authorisation key, and the note's address derives from the same keys.
    rk === randomise(keys.ak, randomness.alpha) &amp;&amp;
    addressOf(keys) === oldNote.address &amp;&amp;
    // 3. The nullifier is the one and only nullifier for this note.
    nullifier === deriveNullifier(keys.nk, oldNote) &amp;&amp;
    // 4. The new note's commitment is well formed.
    cmNew === commit(newNote) &amp;&amp;
    // 5. \`cvNet\` is a commitment to (value spent - value created).
    cvNet === valueCommit(oldNote.value - newNote.value, randomness.rcv)
  )
}</code></pre>
<p>Look at the public inputs: a tree root, a value commitment, a nullifier, a randomised key and a note commitment. None identifies the note spent, the addresses or the amounts. Sapling proves the same kinds of fact, with a separate proof for each spend and each output.</p>

<h3>What is checked outside the proof</h3>
<p>The proof is necessary but not sufficient. Nodes also check, in the open:</p>
<ul>
  <li><strong>No double spend.</strong> The nullifier has not appeared on chain before. This is a plain set lookup.</li>
  <li><strong>Values balance.</strong> For Sapling and the Orchard protocol, the specification says the value commitments "are checked to balance (together with any net transparent input or output) outside the zk-SNARK". Value commitments can be added together without opening them, and a <strong>binding signature</strong> over the transaction shows that the sum matches the public value balance.</li>
  <li><strong>Authorisation.</strong> A <strong>spend authorisation signature</strong> made with the key behind <code>rk</code> shows that the key holder approved this particular transaction.</li>
  <li><strong>Pool balances.</strong> The turnstile check from Lesson 3.</li>
</ul>

<h2>Groth16 and Halo 2</h2>
<p>Zcash has used three proving systems. Two matter to you.</p>
<table>
  <thead>
    <tr><th></th><th>Groth16</th><th>Halo 2</th></tr>
  </thead>
  <tbody>
    <tr><td>Used by</td><td>Sapling (and Sprout since the Sapling upgrade)</td><td>Orchard and Ironwood</td></tr>
    <tr><td>Curves</td><td>BLS12-381 pairing</td><td>Pallas and Vesta, a cycle of curves</td></tr>
    <tr><td>Setup</td><td>Trusted setup per circuit (Lesson 2)</td><td>None</td></tr>
    <tr><td>Proofs per transaction</td><td>One 192-byte proof for each spend and each output</td><td>One proof covering all the actions in a bundle: 2,720 bytes plus 2,272 bytes per action</td></tr>
  </tbody>
</table>
<p>The trade is visible in the last row: Halo 2 proofs are larger, and in exchange nobody has to trust a setup ceremony. Halo 2 builds on Halo, a technique discovered by Sean Bowe at the Electric Coin Company. It also supports recursive proofs, in which one proof verifies others, but ZIP 224 states that the Orchard protocol "does not make use of Halo 2's support for recursive proofs". Do not credit Orchard or Ironwood with recursion.</p>

<h2>When a proof system has a bug</h2>
<p>Soundness and zero knowledge fail in different ways. A zero-knowledge failure would leak private data. A soundness failure lets someone prove a false statement, which in Zcash means spending value that does not exist. Because amounts are hidden, nobody sees the forgery directly.</p>
<p>Zcash has had two soundness bugs: one in Sprout's original BCTV14 system, disclosed in 2019, and one in the Orchard action circuit, found in May 2026. In the second case the specification notes that the bug was "in the circuit implementation only" and that the statement itself was as intended. The code that enforced the statement was missing constraints. Neither is known to have been exploited.</p>
<blockquote><p>A proof only guarantees what its circuit actually enforces. The statement can be right and the circuit wrong. This is why Zcash keeps an independent, public check on each pool's total (the turnstile) and does not rely on proofs alone for the supply.</p></blockquote>

<h2>Try it</h2>
<p>Play attacker. For each attempt below, name the check that stops it and say whether that check happens inside the proof or outside it.</p>
<ol>
  <li>You spend the same note in two different transactions.</li>
  <li>You try to spend a note that was sent to somebody else, whose commitment you can see in the tree.</li>
  <li>You invent a note worth 1,000 ZEC that was never created and try to spend it.</li>
  <li>You spend a 1 ZEC note and create a 5 ZEC note for yourself in the same action.</li>
  <li>You copy a valid action from someone else's transaction into your own.</li>
</ol>
<p>Then open the protocol specification and find the "Action Descriptions" section. Besides the public inputs shown in the code above, it lists three single-bit flags: <code>enableSpends</code>, <code>enableOutputs</code> and <code>enableCrossAddress</code>. Write one sentence on what each controls. Lesson 6 depends on the third.</p>

<h2>Key takeaways</h2>
<ul>
  <li>A zk-SNARK is a short, non-interactive proof that the prover knows secret inputs satisfying a public statement.</li>
  <li>A shielded spend proves that the note exists in the commitment tree, the spender holds its keys, the nullifier is correct, and the value commitment is honest.</li>
  <li>Double-spend checks, value balance and signatures are verified outside the proof.</li>
  <li>Sapling uses Groth16 on BLS12-381 with a trusted setup. Orchard and Ironwood use Halo 2 with none.</li>
  <li>A soundness bug threatens the money supply, not the secrecy of past transactions, and the turnstile limits the damage.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf">Zcash Protocol Specification</a> — "High-level Overview", "Zero-Knowledge Proving System" and "Action Statement (Orchard)".</li>
  <li><a href="https://zips.z.cash/zip-0224">ZIP 224: Orchard Shielded Protocol</a> — the "Proving system" and "Circuit" sections.</li>
  <li><a href="https://zcash.github.io/halo2/">The halo2 Book</a></li>
  <li><a href="https://eprint.iacr.org/2019/1021.pdf">The Halo paper</a> (IACR ePrint 2019/1021) — optional, and mathematical.</li>
  <li><a href="https://zechub.wiki/zcash-tech/zk-snarks">ZecHub: zk-SNARKs</a></li>
</ul>`,
  },
  "l-01-05": {
    title: "The Sapling Protocol",
    subtitle: "Describe Sapling's key hierarchy and diversified addresses, and decode a real Sapling address into its two components.",
    content: `<p>Sapling is the oldest shielded protocol you will still meet in production. It activated on 28 October 2018 at block 419,200, its pool is still active, and every design that came after it (Orchard, Ironwood, Unified Addresses) borrows its vocabulary. If you understand Sapling's keys and addresses, the newer protocols are variations on a theme.</p>
<p>This lesson covers what Sapling introduced, how its keys relate to one another, and what is inside a <code>zs</code> address. You will decode one by hand at the end, which is the first half of this week's lab.</p>

<h2>What Sapling changed</h2>
<p>Sprout, the original shielded protocol, proved everything about a transfer in one large circuit, the JoinSplit. Sapling split the work in two. A shielded input is a <strong>Spend description</strong> and a shielded output is an <strong>Output description</strong>, each with its own, much smaller proof. ZecHub's Sapling page, citing the Electric Coin Company's figures, puts the result at a few seconds and about 40 megabytes of memory to build a shielded transaction, against minutes and gigabytes under Sprout. That made shielded payments practical on phones.</p>
<p>Three other changes matter to builders:</p>
<ul>
  <li><strong>Viewing keys</strong>, which let someone read an account's activity without being able to spend from it.</li>
  <li><strong>Diversified addresses</strong>: many unlinkable addresses from one key.</li>
  <li><strong>Signing separated from proving.</strong> Authority to spend is shown by a signature, not inside the proof. The specification gives the reason: it lets devices with little memory, "such as hardware wallets", authorise a spend without having to build the proof themselves.</li>
</ul>

<h2>The cryptography in brief</h2>
<p>Sapling proofs use the <strong>Groth16</strong> proving system over the <strong>BLS12-381</strong> pairing-friendly curve. Each proof is 192 bytes. Groth16 needs a trusted setup, which for Sapling was the Powers of Tau and Sapling MPC ceremonies from Lesson 2.</p>
<p>Keys, addresses and commitments live on a second curve, <strong>Jubjub</strong>, which the specification describes as "designed to be efficiently implementable in zk-SNARK circuits". Jubjub is defined over the scalar field of BLS12-381, so operations on Jubjub points can be expressed directly as constraints in a Sapling circuit. You do not need the mathematics; you do need to recognise the names when they appear in library documentation.</p>

<h2>The key hierarchy</h2>
<p>Everything derives from a <strong>spending key</strong>, and derivation only runs one way. Holding a key lower in the table never lets you compute one above it.</p>
<table>
  <thead>
    <tr><th>Key</th><th>Made of</th><th>What its holder can do</th></tr>
  </thead>
  <tbody>
    <tr><td>Spending key</td><td>Expands to <code>ask</code>, <code>nsk</code>, <code>ovk</code></td><td>Everything, including spending. Never shared.</td></tr>
    <tr><td>Full viewing key</td><td><code>ak</code>, <code>nk</code>, <code>ovk</code></td><td>Recognise both incoming and outgoing notes, without spending authority.</td></tr>
    <tr><td>Incoming viewing key</td><td><code>ivk</code>, computed from <code>ak</code> and <code>nk</code></td><td>Detect and decrypt notes received. Generate the account's addresses.</td></tr>
    <tr><td>Outgoing viewing key</td><td><code>ovk</code></td><td>Decrypt the record of payments the account sent.</td></tr>
    <tr><td>Payment address</td><td>Diversifier <code>d</code> and transmission key <code>pk_d</code></td><td>Receive.</td></tr>
  </tbody>
</table>
<p>Here <code>ak</code> is the public form of the signing key <code>ask</code>, and <code>nk</code> is the public form of <code>nsk</code>, the key used to compute nullifiers. That is why a full viewing key can tell when a note has been spent and an incoming viewing key cannot.</p>
<p>In practice wallets do not pick spending keys at random. They derive them from a seed phrase using <strong>ZIP 32</strong>, Zcash's hierarchical deterministic scheme, along the path <code>m_Sapling / purpose' / coin_type' / account'</code>, where <code>purpose</code> is the constant 32 and each <strong>account</strong> is one spending authority, a "bucket of funds". Week 4 returns to viewing keys in depth.</p>

<h2>Diversified addresses</h2>
<p>A Sapling address is a pair: an 11-byte <strong>diversifier</strong> and a 32-byte <strong>transmission key</strong> derived from the incoming viewing key and that diversifier. Change the diversifier and you get a different, valid address for the same account. ZIP 32 puts the limit at about 2 to the power 87 addresses per account.</p>
<p>All of an account's addresses share one full viewing key and one incoming viewing key, so, as the specification puts it, "creating as many unlinkable addresses as needed does not increase the cost of scanning the block chain". An observer cannot tell that two diversified addresses belong to the same account.</p>
<blockquote><p>The same address given to two people is trivially linkable if they compare notes. If your application takes payments from many customers, give each one its own diversified address.</p></blockquote>

<h2>Sapling today</h2>
<p>The Sapling pool remains active, and you will keep meeting it: as standalone <code>zs</code> addresses (<code>ztestsapling</code> on Testnet), and as the Sapling receiver inside Unified Addresses. Know its limits. It depends on a trusted setup, and ZIP 2005 deliberately made no quantum-recoverability change for Sapling, noting that Sapling funds can be moved to the Ironwood pool to gain that property (Lesson 6).</p>

<h2>Try it</h2>
<p>A standalone Sapling address is encoded with Bech32, the checksummed base-32 format from Bitcoin's BIP 173. This script needs only Python 3. The address is the example used in the documentation of the <code>zcash_address</code> Rust crate.</p>
<pre><code>CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"

def polymod(values):
    gen = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
    chk = 1
    for v in values:
        top = chk &gt;&gt; 25
        chk = (chk &amp; 0x1ffffff) &lt;&lt; 5 ^ v
        for i in range(5):
            if (top &gt;&gt; i) &amp; 1:
                chk ^= gen[i]
    return chk

def bech32_decode(s, checksum_const):
    pos = s.rfind("1")
    hrp, data = s[:pos], [CHARSET.index(c) for c in s[pos + 1:]]
    expanded = [ord(c) &gt;&gt; 5 for c in hrp] + [0] + [ord(c) &amp; 31 for c in hrp]
    if polymod(expanded + data) != checksum_const:
        raise ValueError("bad checksum")
    acc = bits = 0
    out = bytearray()
    for v in data[:-6]:                 # drop the 6-character checksum
        acc, bits = (acc &lt;&lt; 5) | v, bits + 5
        while bits &gt;= 8:
            bits -= 8
            out.append((acc &gt;&gt; bits) &amp; 0xff)
    return hrp, bytes(out)

addr = "zs1z7rejlpsa98s2rrrfkwmaxu53e4ue0ulcrw0h4x5g8jl04tak0d3mm47vdtahatqrlkngh9slya"
hrp, raw = bech32_decode(addr, 1)       # 1 = Bech32; Bech32m uses 0x2bc830a3
print("prefix      :", hrp)
print("total bytes :", len(raw))
print("diversifier :", raw[:11].hex())
print("pk_d        :", raw[11:].hex())</code></pre>
<ol>
  <li>Run it. Confirm the payload is 43 bytes: 11 for the diversifier and 32 for <code>pk_d</code>.</li>
  <li>Change one character of the address and run it again. What happens, and why does that matter for someone copying an address by hand?</li>
  <li>Look at the two hex values. What can you learn about the owner's balance or other addresses from them? (Nothing. Say why.)</li>
  <li>Keep the file. In Lesson 7 you will reuse <code>bech32_decode</code> with a different constant and add the extra steps needed to decode a Unified Address.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
  <li>Sapling uses Groth16 proofs over BLS12-381, with keys and commitments on the Jubjub curve. It required a trusted setup.</li>
  <li>Keys form a one-way hierarchy: spending key, full viewing key, incoming and outgoing viewing keys, addresses.</li>
  <li>A Sapling address is 43 bytes: an 11-byte diversifier and a 32-byte transmission key. One account can produce a practically unlimited number of unlinkable addresses.</li>
  <li>The Sapling pool is still active, but its notes are not quantum-recoverable.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf">Zcash Protocol Specification</a> — "Payment Addresses and Keys", "Sapling Key Components" and "Sapling Payment Addresses".</li>
  <li><a href="https://zips.z.cash/zip-0032">ZIP 32: Shielded Hierarchical Deterministic Wallets</a></li>
  <li><a href="https://zips.z.cash/zip-0310">ZIP 310: Security Properties of Sapling Viewing Keys</a> (Draft)</li>
  <li><a href="https://zips.z.cash/zip-0205">ZIP 205: Deployment of the Sapling Network Upgrade</a></li>
  <li><a href="https://zechub.wiki/zcash-tech/sapling">ZecHub: Sapling</a></li>
</ul>`,
  },
  "l-01-06": {
    title: "Ironwood & Halo2 (Post-NU6.3)",
    subtitle: "Explain why Ironwood exists, what it shares with Orchard, and what NU6.3 did and did not change for addresses and wallets.",
    content: `<p>Until mid-2026, "the current shielded pool" meant Orchard. Since 28 July 2026 it means <strong>Ironwood</strong>. Almost everything written before that date gets this wrong, so this is the lesson where you replace the old picture.</p>
<p>The idea to hold on to is the difference between a <em>protocol</em> and a <em>pool</em>. Ironwood is a new pool. It is not a new protocol, a new proof system or a new kind of address.</p>

<h2>What went wrong in Orchard</h2>
<p>On 29 May 2026, security researcher Taylor Hornby, carrying out an AI-assisted audit of the Orchard protocol, reported a soundness vulnerability in the implementation of the Orchard Action circuit. ZIP 257 records that it "could have allowed balance violation and theft of funds". The fault was a missing constraint in one circuit gadget (variable-base scalar multiplication). As you saw in Lesson 4, the statement being proved was sound; the circuit enforcing it was not. Halo 2 itself was not replaced.</p>
<p>The response came in three steps:</p>
<ol>
  <li><strong>2 June, height 3,363,426.</strong> An emergency soft fork banned Orchard actions from transactions altogether.</li>
  <li><strong>3 June, height 3,364,600 (NU6.2).</strong> Orchard was re-enabled on a corrected circuit, which has a different verifying key.</li>
  <li><strong>28 July, height 3,428,143 (NU6.3).</strong> The Ironwood pool was created and the Orchard pool was sealed.</li>
</ol>
<p>Why was step 3 needed if step 2 fixed the bug? There is no evidence that the flaw was ever exploited. But shielded amounts are encrypted, so chain data cannot <em>prove</em> that no counterfeit notes were created inside Orchard before the fix. The turnstile already guaranteed that no more ZEC could leave Orchard than had entered it. ZIP 229 explains that further steps were needed "to ensure confidence in the supply by migrating funds to a new pool".</p>

<h2>Protocol versus pool</h2>
<p>ZIP 229 defines the terms. Use them the same way.</p>
<table>
  <thead>
    <tr><th>Term</th><th>What it is</th></tr>
  </thead>
  <tbody>
    <tr><td>Orchard protocol</td><td>The shared cryptographic design: Pallas and Vesta curves, Sinsemilla hash, Action circuit, notes, commitments, nullifiers, keys and note encryption</td></tr>
    <tr><td>Orchard pool</td><td>The value pool introduced in 2022, with its own note commitment tree, anchor and chain value pool balance</td></tr>
    <tr><td>Ironwood pool</td><td>A new value pool of the Orchard protocol, with its own note commitment tree, anchor and chain value pool balance</td></tr>
  </tbody>
</table>
<p>So Ironwood is a second, separate ledger of notes running the same machinery. In ZIP 229's words, "the Orchard Action encoding and the Halo 2 proof system are reused unchanged", and the circuit is shared between the two pools, "changed only slightly". Like Orchard, Ironwood needs no trusted setup. Its supply integrity is, according to the ZIP, "supported from the start by formal verification efforts", documented in The Ironwood Book (linked from ZIP 229).</p>
<p>To carry the new pool, NU6.3 introduced <strong>version 6 transactions</strong>, which can hold an Ironwood component, with its own <code>valueBalanceIronwood</code> and <code>anchorIronwood</code> fields, alongside Sapling and Orchard ones.</p>

<h3>How NU6.3 sealed the Orchard pool</h3>
<p>ZIP 258 adds three consensus rules that apply from activation onward:</p>
<ul>
  <li><strong>No new value may enter.</strong> For every transaction, <code>valueBalanceOrchard</code> must be zero or positive. Value may still leave, including across the turnstile into Ironwood.</li>
  <li><strong>No payments between users inside it.</strong> Every Orchard-pool action must be created with the <code>enableCrossAddress</code> flag set to 0, so the note it creates goes to the same receiver as the note it spends. Change still works; paying someone else does not.</li>
  <li><strong>No mining rewards into it.</strong> A coinbase transaction must not contain Orchard-pool actions.</li>
</ul>
<p>The Orchard pool is therefore spend-only. Funds in it are not frozen; a wallet that supports NU6.3 can move them to Ironwood.</p>

<h2>What did not change: addresses and keys</h2>
<p>ZIP 229 says it directly: "The addition of the Ironwood pool does not change address structures or encodings." ZIP 326 gives the reason: a receiver, and the incoming viewing key that goes with it, "is scoped to the Orchard <em>protocol</em>, not to a pool".</p>
<ul>
  <li>There is no "Ironwood address". Nobody needs to issue new addresses because of NU6.3.</li>
  <li>The Orchard receiver inside an existing Unified Address now receives into the Ironwood pool when the sender's wallet supports NU6.3.</li>
  <li>Orchard spending keys and viewing keys grant authority over notes in both pools. A wallet scans both with the same incoming viewing key.</li>
</ul>
<blockquote><p>Naming trap: in code and documentation, "Orchard" can mean the protocol (a receiver type, a key type, a circuit) or the pool (a balance, a tree). When you read an API, work out which one is meant. A field named for an Orchard receiver is still current; a balance labelled Orchard is the sealed pool.</p></blockquote>

<h2>Quantum recoverability, stated carefully</h2>
<p>Every note in the Ironwood pool uses a new note format defined in ZIP 2005. Zcash's shielded protocols rely on the hardness of discrete logarithms, and an adversary able to compute them, with a quantum computer or otherwise, could steal or forge funds. If that threat became real, the affected protocols would have to be disabled. Funds in Ironwood could then be reclaimed through a future <strong>Recovery Protocol</strong> that is expected to stay secure against such an adversary.</p>
<p>ZIP 2005 limits its own claim: the change "does not by itself make the protocol secure against quantum adversaries". It is preparation for a later transition. Recovery would not be possible for funds still in the Sprout, Sapling or Orchard pools. Say "quantum-recoverable", never "quantum-proof" or "post-quantum".</p>

<h2>Migration is a privacy problem</h2>
<p>Moving from Orchard to Ironwood crosses pools, so the amount is public (Lesson 3). A wallet that moved a user's whole balance in one transaction would publish that balance. ZIP 318 sets out how wallets should migrate instead: split the balance into notes of canonical denominations, of the form n × 10^k ZEC with n equal to 1, 2 or 5, and send them across in separate transactions spread over time, with the user's consent. Many wallets moving the same round amounts hide one another.</p>
<p>For you as a builder: do not hand-roll migration logic. Use a wallet library that implements it, and show Orchard-pool and Ironwood-pool balances as separate lines. As of October 2026, ZIPs 229, 318 and 326 are still marked Draft even though NU6.3 is live, so check them for revisions.</p>

<h2>Try it</h2>
<p>Answer in writing, checking against ZIP 229 (Abstract) and ZIP 258 ("Consensus rules from NU6.3 activation").</p>
<ol>
  <li>A customer gave you a Unified Address in 2023. It contains an Orchard receiver. You pay it today from a wallet that supports NU6.3. Which pool does the new note belong to? Did the customer need to give you a new address?</li>
  <li>A user holds 12.5 ZEC in the Orchard pool and wants to pay a friend 3 ZEC. Why can that payment not happen inside the Orchard pool? What does an observer see when the funds move to Ironwood, and how would you split 12.5 ZEC into canonical denominations?</li>
  <li>A user asks, "Is Zcash quantum-proof now?" Write a two-sentence answer that is accurate.</li>
  <li>For this week's lab you will decode Unified Addresses and label each receiver. Draft the label your tool will show for the Orchard receiver so that a user is not misled about where their funds will go.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
  <li>Ironwood is a new value pool that reuses the Orchard protocol and the Halo 2 proof system. It has its own commitment tree and pool balance.</li>
  <li>Since NU6.3 the Orchard pool is spend-only: no deposits, no payments between users, no coinbase outputs.</li>
  <li>Address encodings did not change. The Orchard receiver in a Unified Address now receives into Ironwood, and the same keys cover both pools.</li>
  <li>Ironwood notes are quantum-recoverable. That is a recovery path for the future, not post-quantum security today.</li>
  <li>Migration publishes amounts, so wallets migrate in standard denominations over time.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/zip-0257">ZIP 257: Deployment of the Orchard Temporary Vulnerability Mitigation and NU6.2 Network Upgrade</a></li>
  <li><a href="https://zips.z.cash/zip-0258">ZIP 258: Deployment of the NU6.3 Network Upgrade</a> — the three rules that seal the Orchard pool.</li>
  <li><a href="https://zips.z.cash/zip-0229">ZIP 229: Version 6 Transaction Format</a> — definitions of protocol and pool; the statement on addresses.</li>
  <li><a href="https://zips.z.cash/zip-2005">ZIP 2005: Ironwood Quantum Recoverability</a> — read the Abstract and Motivation.</li>
  <li><a href="https://zips.z.cash/zip-0318">ZIP 318: Orchard to Ironwood Migration</a> and <a href="https://zips.z.cash/zip-0326">ZIP 326: NU6.3 Consequences for Wallets</a></li>
</ul>`,
  },
  "l-01-07": {
    title: "Unified Addresses Explained",
    subtitle: "Take a Unified Address apart into its receivers and predict which one a sender's wallet will use.",
    content: `<p>You now know three ways to receive ZEC: a transparent address, a Sapling address and an Orchard-protocol address that today receives into Ironwood. Asking users to choose between them is a recipe for failed and needlessly public payments. A <strong>Unified Address</strong> (UA), defined in ZIP 316, bundles several addresses into one string and lets the sender's wallet choose.</p>
<p>This is the format your applications will display and accept, and decoding one is this week's lab.</p>

<h2>What is inside</h2>
<p>A UA contains one or more <strong>receivers</strong>. Each receiver is a typecode, a length and the raw bytes of an address of that type.</p>
<table>
  <thead>
    <tr><th>Typecode</th><th>Receiver</th><th>Bytes</th><th>Where a payment lands</th></tr>
  </thead>
  <tbody>
    <tr><td><code>0x00</code></td><td>Transparent P2PKH</td><td>20</td><td>Transparent pool</td></tr>
    <tr><td><code>0x01</code></td><td>Transparent P2SH</td><td>20</td><td>Transparent pool</td></tr>
    <tr><td><code>0x02</code></td><td>Sapling</td><td>43</td><td>Sapling pool</td></tr>
    <tr><td><code>0x03</code></td><td>Orchard</td><td>43</td><td>Ironwood pool, since NU6.3 (Lesson 6)</td></tr>
  </tbody>
</table>
<p>ZIP 316 sets rules that a decoder must enforce. For the current revision:</p>
<ul>
  <li>there must be at least one shielded receiver (<code>0x02</code> or <code>0x03</code>), so a transparent-only UA is invalid;</li>
  <li>a typecode may appear only once, and P2PKH and P2SH cannot both be present;</li>
  <li>receivers must be stored in ascending typecode order;</li>
  <li>a receiver with a typecode the decoder does not recognise is ignored, not treated as an error. This is what lets old wallets read addresses made by new ones.</li>
</ul>
<p>There is no typecode for Sprout, and the Ironwood upgrade added none: the specification never defined a standalone string encoding for an Orchard address, so <code>0x03</code> inside a UA is the only way to hand one out.</p>

<h2>How it is encoded</h2>
<ol>
  <li>Concatenate the receivers as (typecode, length, bytes).</li>
  <li>Append 16 bytes of <strong>padding</strong>: the address prefix in ASCII, filled out with zero bytes.</li>
  <li>Apply <strong>F4Jumble</strong>, an unkeyed four-round Feistel construction built from the BLAKE2b hash. It mixes every byte with every other, so changing any part of the content changes the whole string.</li>
  <li>Encode the result with <strong>Bech32m</strong> (BIP 350), the same scheme as the Bech32 you used in Lesson 5 with a different checksum constant, here with no length limit.</li>
</ol>
<p>The prefix is <code>u</code> on Mainnet and <code>utest</code> on Testnet, so addresses begin <code>u1…</code> or <code>utest1…</code> (the <code>1</code> is the Bech32 separator). Decoding runs the steps backwards and rejects the address if the checksum, the padding or the receiver rules fail.</p>
<p>Jumbling exists because people compare only part of a long address. It makes it hard to craft an address that matches a victim's in the visible characters, or to strip the shielded receivers and leave a transparent one. ZIP 316 also requires that an abbreviated UA shows at least its first 20 characters.</p>

<h2>Which receiver a sender uses</h2>
<p>ZIP 316 fixes a <strong>priority list</strong>: Orchard first, then Sapling, then transparent. The sender "MUST use the Receiver of the most preferred Receiver Type that it supports", and a wallet must not let users reorder the list. Note that storage order (ascending typecode) is the reverse of priority order.</p>
<p>Two consequences for builders. The same UA can be paid into different pools depending on the sender's software, so a service that accepts UAs must watch every pool its receivers cover. And the string is opaque: nobody can tell by looking whether a UA includes a transparent receiver. That is the gap your lab tool fills.</p>
<blockquote><p>Label typecode <code>0x03</code> with care. It is an Orchard-protocol receiver, and payments to it now land in the Ironwood pool. A label that just says "Orchard pool" would be wrong.</p></blockquote>

<h2>Unified viewing keys and revisions</h2>
<p>The same container format carries viewing keys. A <strong>Unified Full Viewing Key</strong> (UFVK, prefix <code>uview</code>) and a <strong>Unified Incoming Viewing Key</strong> (UIVK, prefix <code>uivk</code>) hold one viewing key per protocol under the same typecodes, with <code>test</code> appended to the prefix on Testnet. A wallet can derive a UIVK from a UFVK, and Unified Addresses from a UIVK. You will use these in Week 4.</p>
<p>ZIP 316's status line reads "[Revision 0] Active, [Revision 1] Withdrawn, [Revision 2] Draft". Everything above is Revision 0. Revision 2 proposes new prefixes, <code>zu</code> for addresses with no transparent receivers and <code>tu</code> for those that may have them, plus expiry metadata. As of October 2026 it is a draft: build for Revision 0, and keep your parser easy to extend.</p>
<p>One related format will come up in the lab. A <strong>TEX address</strong> (ZIP 320, prefix <code>tex</code>) is not a Unified Address: it is a transparent P2PKH address re-encoded with Bech32m, and it instructs the sender's wallet not to spend shielded notes in the transaction that pays it.</p>

<h2>Try it</h2>
<p>Add this to the file you wrote in Lesson 5, after <code>bech32_decode</code>. The address is an official test vector from the <code>zcash-test-vectors</code> repository (<code>test-vectors/json/unified_address.json</code>).</p>
<pre><code>from hashlib import blake2b

def f4jumble_inv(m):
    l_left = min(64, len(m) // 2)
    l_right = len(m) - l_left
    def H(i, u):
        return blake2b(u, digest_size=l_left, person=b"UA_F4Jumble_H" + bytes([i, 0, 0])).digest()
    def G(i, u):
        out = b""
        for j in range((l_right + 63) // 64):
            out += blake2b(u, digest_size=64, person=b"UA_F4Jumble_G" + bytes([i]) + j.to_bytes(2, "little")).digest()
        return out[:l_right]
    xor = lambda p, q: bytes(a ^ b for a, b in zip(p, q))
    c, d = m[:l_left], m[l_left:]
    y = xor(c, H(1, d))
    x = xor(d, G(1, y))
    a = xor(y, H(0, x))
    b = xor(x, G(0, a))
    return a + b

def decode_ua(ua):
    hrp, jumbled = bech32_decode(ua, 0x2bc830a3)          # Bech32m this time
    raw = f4jumble_inv(jumbled)
    padding = hrp.encode() + bytes(16 - len(hrp))
    if raw[-16:] != padding:
        raise ValueError("bad padding")
    body, receivers = raw[:-16], []
    while body:
        typecode, length = body[0], body[1]               # simplification: see step 4
        receivers.append((typecode, body[2:2 + length]))
        body = body[2 + length:]
    return hrp, receivers

ua = "u1pg2aaph7jp8rpf6yhsza25722sg5fcn3vaca6ze27hqjw7jvvhhuxkpcg0ge9xh6drsgdkda8qjq5chpehkcpxf87rnjryjqwymdheptpvnljqqrjqzjwkc2ma6hcq666kgwfytxwac8eyex6ndgr6ezte66706e3vaqrd25dzvzkc69kw0jgywtd0cmq52q5lkw6uh7hyvzjse8ksx"
hrp, receivers = decode_ua(ua)
for typecode, data in receivers:
    print(hex(typecode), len(data), data.hex())</code></pre>
<ol>
  <li>Run it. You should see three receivers: <code>0x0</code> with 20 bytes beginning <code>cad26875</code>, <code>0x2</code> with 43 bytes beginning <code>9f6e0bf9</code>, and <code>0x3</code> with 43 bytes beginning <code>cecbe5e6</code>.</li>
  <li>Which receiver would a wallet that supports NU6.3 pay, and into which pool? What about a wallet that only supports Sapling? An exchange that only supports transparent addresses?</li>
  <li>Change one character of the address. Which check catches it?</li>
  <li>The typecode and length are really <code>compactSize</code> integers, not single bytes, and the test-vector file includes addresses with large experimental typecodes. Reading one byte happens to work for the four standard receivers. Note what you would need to change; you will fix it in the lab, along with enforcing the ZIP 316 rules listed above.</li>
</ol>
<p>If you have a Rust toolchain, check your answers against <code>zcash-devtool</code>, a developer tool that its README says is not production-ready. From a clone of its repository, <code>cargo run --release -- inspect</code> followed by an address prints the network, the kind of address and each receiver.</p>

<h2>Key takeaways</h2>
<ul>
  <li>A Unified Address is a container of receivers: transparent (<code>0x00</code>, <code>0x01</code>), Sapling (<code>0x02</code>) and Orchard-protocol (<code>0x03</code>).</li>
  <li>Encoding is receivers, then padding, then F4Jumble, then Bech32m, with prefix <code>u</code> on Mainnet and <code>utest</code> on Testnet.</li>
  <li>The sender must pay the most preferred receiver it supports: Orchard, then Sapling, then transparent.</li>
  <li>Ironwood changed no encodings. The <code>0x03</code> receiver now receives into the Ironwood pool.</li>
  <li>ZIP 316 Revision 0 is the active standard; Revision 2 is a draft.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/zip-0316">ZIP 316: Unified Addresses and Unified Viewing Keys</a> — the authority for everything in this lesson.</li>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf">Zcash Protocol Specification</a> — "Unified Payment Addresses and Viewing Keys" and "Orchard Raw Payment Addresses".</li>
  <li><a href="https://github.com/zcash/zcash-test-vectors">zcash-test-vectors</a> — Unified Address test vectors for your lab's test suite.</li>
  <li><a href="https://github.com/zcash/zcash-devtool">zcash-devtool</a> — its <code>inspect</code> command decodes addresses.</li>
  <li><a href="https://zips.z.cash/zip-0229">ZIP 229: Version 6 Transaction Format</a> — "does not change address structures or encodings".</li>
</ul>`,
  },
}
