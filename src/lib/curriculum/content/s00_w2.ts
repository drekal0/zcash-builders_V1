// AUTO-GENERATED from scratchpad lesson fragments. Do not edit by hand.
// Each entry: lesson id -> { title, subtitle, content (HTML) }.
import type { LessonContent } from './types'

export const M_s00_w2: Record<string, LessonContent> = {
  "l-00-06": {
    title: "How Blocks Are Mined",
    subtitle: "Explain how miners find blocks, how Zcash retunes difficulty after every block, and where each block's new ZEC goes.",
    content: `<p>In Week 1 your visualiser added blocks whenever you asked it to. On a real network, somebody has to earn the right to add each block, and everyone else has to be able to check that they did. That process is <strong>mining</strong>. This lesson covers the search miners run, the puzzle Zcash uses, how the network keeps blocks arriving on schedule, and what a miner is paid.</p>
<p>Mining decides two things every application depends on: how long a user waits for a confirmation, and how new ZEC enters circulation.</p>

<h2>The mining loop</h2>
<p>A miner's node gathers valid unconfirmed transactions, puts a special <strong>coinbase transaction</strong> first (it pays out the block's reward), and builds a block header: the previous block's hash, the Merkle root of the transactions, a timestamp and the current difficulty target. Then it searches for a version of that header which passes the proof-of-work check, changing a field called the <strong>nonce</strong> on every attempt. A toy version of the search:</p>
<pre><code>// toy-miner.mjs: a toy puzzle to show the loop. Zcash's real puzzle is Equihash.
import { createHash } from 'node:crypto';

const sha256 = (data) =&gt; createHash('sha256').update(data).digest();
const sha256d = (data) =&gt; sha256(sha256(data));

const header = 'prev=00000000a1b2|merkle=9f3c77e0|time=1760000000|nonce=';
const bits = 16;                           // difficulty: leading zero bits required
const target = 2n ** BigInt(256 - bits);   // a lower target is harder to hit

for (let nonce = 0; ; nonce++) {
  const hash = sha256d(header + nonce).toString('hex');
  if (BigInt('0x' + hash) &lt;= target) {
    console.log(\`found nonce \${nonce} after \${nonce + 1} attempts\`);
    console.log(hash);
    break;
  }
}</code></pre>
<p>A hash output is unpredictable, so every attempt is a lottery ticket, and with 16 bits of difficulty you expect to need about 65,536 of them (2 to the power 16). Checking the winner takes one hash. Work that is expensive to produce and cheap to verify is what makes history costly to rewrite.</p>

<h2>Zcash's puzzle: Equihash</h2>
<p>Zcash does not use a plain hash lottery. The protocol specification says a block satisfies the proof of work only if both of these hold:</p>
<ul>
  <li><strong>It carries a valid Equihash solution.</strong> Equihash, with Zcash's parameters <code>n = 200, k = 9</code>, works like this: from the header and nonce, the BLAKE2b hash function generates 2,097,152 strings of 200 bits each, and the miner must find 512 of them that XOR to zero (a form of the Generalised Birthday Problem). Finding such a set means holding and sorting a large table in memory; checking one means regenerating 512 strings. The solution is 1,344 bytes and sits in the block header, next to a 32-byte nonce.</li>
  <li><strong>It passes the difficulty filter.</strong> The SHA-256d hash of the whole header, solution included, read as a 256-bit number, must be less than or equal to the <strong>target threshold</strong>. This part is unchanged from Bitcoin.</li>
</ul>
<p>The specification's own summary is that Zcash "attempted to address the problem of mining centralization by use of the Equihash memory-hard proof-of-work algorithm". Specialised Equihash hardware (ASICs) was built anyway, and ZecHub's mining guide describes ASICs as dominating the network in 2026.</p>

<h2>Difficulty adjustment</h2>
<p>The <strong>block target spacing</strong> is the average time the network aims for between blocks. On Zcash Mainnet it is <strong>75 seconds as of October 2026</strong>; it was 150 seconds at launch and was halved by the Blossom upgrade in December 2019. If miners add hardware, blocks arrive too fast, so the target has to move. Bitcoin retunes every 2,016 blocks. Zcash retunes <strong>after every block</strong>, with an algorithm based on DigiShield:</p>
<ol>
  <li>Take the mean target of the previous 17 blocks.</li>
  <li>Measure how long those blocks really took, using the median of 11 block timestamps at each end, because a single miner-chosen timestamp cannot be trusted.</li>
  <li>Compare that with the expected 17 × 75 = 1,275 seconds, and apply only a quarter of the difference (damping).</li>
  <li>Clamp the result: the new target can be at most about 16% lower (harder) or 32% higher (easier) than that mean.</li>
</ol>
<blockquote>The NU7 upgrade is planned to cut the Mainnet block target spacing to 25 seconds and widen the averaging window from 17 to 102 blocks (ZIP 218). As of early October 2026 NU7 is live on Testnet only. ZIP 259 says the Mainnet activation height is to be set on 20 October 2026, and the timeline posted on the Zcash Community Forum targets 5 November 2026. Check ZIP 259 before you hardcode a block time.</blockquote>

<h2>The block reward</h2>
<p>Each block creates new ZEC, called the <strong>block subsidy</strong>. Since the November 2024 halving it is 1.5625 ZEC, and consensus rules fix how it is divided:</p>
<table>
  <thead><tr><th>Recipient</th><th>Share</th><th>ZEC per block</th></tr></thead>
  <tbody>
    <tr><td>Miner</td><td>80%</td><td>1.25</td></tr>
    <tr><td>Zcash Community Grants</td><td>8%</td><td>0.125</td></tr>
    <tr><td>Coinholder-Controlled Fund</td><td>12%</td><td>0.1875</td></tr>
  </tbody>
</table>
<p>The two non-miner shares are <strong>funding streams</strong> (ZIP 214, ZIP 1016). A block whose coinbase transaction does not pay them is invalid. The miner also collects the fees of the transactions in the block.</p>
<p>The subsidy started at a maximum of 12.5 ZEC per 150-second block. Blossom halved both the spacing and the per-block amount, and halvings at heights 1,046,400 (November 2020) and 2,726,400 (November 2024) brought it to 1.5625 ZEC. Halvings are 1,680,000 blocks apart, about four years at 75 seconds, so under the rules in force in October 2026 the next is at height 4,406,400. NU7 would divide the per-block subsidy by three and triple the remaining interval, keeping issuance per unit of time the same. Total supply is capped at 21 million ZEC.</p>

<h2>Try it</h2>
<ol>
  <li>Save the toy miner as <code>toy-miner.mjs</code> and run <code>node toy-miner.mjs</code>. You should see nonce 5544 after 5,545 attempts and a hash starting <code>000061fc</code>. That is far fewer than the 65,536 average, which is the lottery at work.</li>
  <li>Set <code>bits</code> to 12, then 20, and record the attempts each time. The 20-bit run needs about three million attempts and can take tens of seconds. What does one extra bit do to the expected work?</li>
  <li>On paper: at 75 seconds per block, how many blocks are mined per day, how much ZEC is issued per day, and how much of it goes to miners? (Check: 1,152 blocks, 1,800 ZEC, 1,440 ZEC.)</li>
</ol>

<h2>Key takeaways</h2>
<ul>
  <li>Mining is a search that is costly to perform and cheap to verify; that cost is what protects history.</li>
  <li>A Zcash block needs a valid Equihash solution (n = 200, k = 9) and a header hash at or below the target.</li>
  <li>Zcash adjusts difficulty after every block, aiming for 75-second spacing on Mainnet as of October 2026; NU7 plans 25 seconds.</li>
  <li>The 1.5625 ZEC block subsidy is split 80% miner, 8% Zcash Community Grants, 12% Coinholder-Controlled Fund, enforced by consensus.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf">Zcash Protocol Specification</a>: sections "Proof of Work", "Difficulty adjustment" and "Calculating Block Subsidy"</li>
  <li><a href="https://zips.z.cash/zip-0208">ZIP 208: Shorter Block Target Spacing</a></li>
  <li><a href="https://zips.z.cash/zip-0214">ZIP 214: Consensus rules for a Zcash Development Fund</a> and <a href="https://zips.z.cash/zip-1016">ZIP 1016: Community and Coinholder Funding Model</a></li>
  <li><a href="https://zips.z.cash/zip-0218">ZIP 218: 25-second Block Target Spacing</a> (draft, NU7)</li>
  <li><a href="https://eprint.iacr.org/2015/946">Biryukov and Khovratovich, "Equihash: Asymmetric Proof-of-Work Based on the Generalized Birthday Problem"</a></li>
</ul>`,
  },
  "l-00-07": {
    title: "Proof of Work vs Proof of Stake",
    subtitle: "Compare how proof of work and proof of stake choose block producers, and state exactly where Zcash stands today.",
    content: `<p>The last lesson showed how a Zcash miner earns the right to add a block. Mining is one answer to a more general question: on an open network where anyone can join, who gets to write the next page of the ledger? <strong>Proof of work</strong> (PoW) and <strong>proof of stake</strong> (PoS) are the two answers in wide use.</p>
<p>You need both in your head as a builder. The choice decides how long a payment takes to become safe, what an attacker would need, and what your application may promise its users. It also lets you read the Zcash roadmap accurately, because Zcash is a proof-of-work chain with a proof-of-stake proposal under test.</p>

<h2>The problem both solve</h2>
<p>A blockchain cannot let each computer cast one vote, because computers are free to fake. One person can start a million nodes. This is called a <strong>Sybil attack</strong>. The fix is to tie influence to something scarce that cannot be conjured up: either computation, or the coin itself.</p>

<h2>Proof of work</h2>
<p>In PoW the scarce resource is computation, which costs hardware and electricity outside the system. Anyone may try to produce a block; the first to solve the puzzle wins. Nodes follow the valid chain with the most accumulated work.</p>
<p>To change an old block, an attacker must redo its work and the work of every block after it, and then overtake the honest network, which keeps extending its own chain. A miner with a majority of the hash power can do that (the "51% attack"), which lets it reorder or censor transactions and reverse its <em>own</em> recent payments. It still cannot forge a signature, spend someone else's coins or mint extra coins, because every full node checks every rule itself.</p>
<p>Finality in PoW is <strong>probabilistic</strong>. A transaction is never declared final; each block added on top makes reversing it more expensive.</p>

<h2>Proof of stake</h2>
<p>In PoS the scarce resource is the currency. Participants called <strong>validators</strong> lock up coins as a <strong>stake</strong>. The protocol picks who proposes each block in proportion to stake, and the other validators vote on it. In many designs a block becomes <strong>finalised</strong> once validators holding at least two-thirds of the stake have signed it, and a validator caught signing two conflicting blocks has its stake destroyed (<strong>slashing</strong>).</p>
<p>PoS uses very little energy, and it can give an explicit finality signal. It also brings its own problems. Signing costs nothing, so without slashing a validator could vote for every competing chain (the "nothing at stake" problem). Keys that once held stake could be used later to forge an alternative history, so a node joining fresh needs a recent trusted checkpoint. And stake tends to pool with large holders and custodians. Ethereum moved from PoW to PoS in 2022.</p>

<h2>Side by side</h2>
<table>
  <thead><tr><th>Property</th><th>Proof of work</th><th>Proof of stake</th></tr></thead>
  <tbody>
    <tr><td>Scarce resource</td><td>Hardware and electricity</td><td>Staked coins</td></tr>
    <tr><td>Who proposes a block</td><td>Whoever solves the puzzle first</td><td>A validator chosen in proportion to stake</td></tr>
    <tr><td>Finality</td><td>Probabilistic: deeper is safer</td><td>Often explicit, after a supermajority vote</td></tr>
    <tr><td>What an attacker needs</td><td>A majority of hash power, paid for continuously</td><td>A large share of the stake, at risk of slashing</td></tr>
    <tr><td>Energy use</td><td>High by design</td><td>Low</td></tr>
    <tr><td>Joining from scratch</td><td>Verify the work from the first block</td><td>Needs a recent trusted checkpoint</td></tr>
    <tr><td>Examples</td><td>Bitcoin, Zcash, Litecoin, Monero</td><td>Ethereum, Cardano, Solana</td></tr>
  </tbody>
</table>
<p>Neither is simply better. PoW pays for security with energy and has decades of history behind its assumptions. PoS pays with locked capital and adds finality, at the price of more protocol machinery and more ways for it to fail.</p>

<h2>Where Zcash stands</h2>
<p><strong>Zcash Mainnet is proof of work.</strong> Blocks are produced with Equihash, and the protocol specification says a node sums the work of all blocks in each valid chain and "considers the valid block chain with greatest total work to be best". As of October 2026 there are no validators, no staking and no slashing on Mainnet.</p>
<p><strong>Crosslink</strong> is, in Shielded Labs' words, "a proposed upgrade for Zcash". Its FAQ says it "builds on Proof-of-Work by adding a finality gadget that provides an additional layer of security and protection against rollbacks". In that design miners keep producing blocks, and a second group of participants, which Shielded Labs calls finalizers and which are backed by ZEC that holders stake, mark blocks as irreversible. The FAQ is explicit that "Zcash remains a Proof-of-Work blockchain, and Crosslink does not change that." The result would be a hybrid: proof-of-work block production with proof-of-stake finality.</p>
<blockquote>Crosslink is not deployed on Zcash Mainnet. As of October 2026 it runs on a separate test network operated by Shielded Labs, it is not part of the planned NU7 upgrade, and its FAQ says it "would need to go through Zcash's standard governance process before it could be activated".</blockquote>
<p>What this means for your code today: treat every Zcash confirmation as probabilistic, wait for more blocks when more value is at stake, and do not tell users they can stake ZEC on Mainnet. The next lesson turns "wait for more blocks" into numbers.</p>

<h2>Try it</h2>
<ol>
  <li>Read the Crosslink FAQ linked below. Write down the sentence that says who produces blocks under Crosslink, and the sentence that says what must happen before it could activate.</li>
  <li>For PoW and then for PoS, answer in two sentences each: what must an attacker obtain to reverse a payment buried ten blocks deep, and what does the attacker lose if the attempt fails?</li>
  <li>You run a shop that accepts ZEC today. Is any Mainnet payment "final" in the proof-of-stake sense? Write the one-line policy you would give your cashier instead.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
  <li>Both mechanisms stop Sybil attacks by tying influence to something scarce: computation in PoW, locked coins in PoS.</li>
  <li>PoW finality is probabilistic; many PoS designs finalise blocks explicitly with a supermajority vote and punish cheating by slashing.</li>
  <li>Zcash Mainnet is proof of work (Equihash), and nodes follow the valid chain with the greatest total work.</li>
  <li>Crosslink is a Shielded Labs proposal to add proof-of-stake finality on top of proof of work. It is under test and not on Mainnet.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf">Zcash Protocol Specification</a>: sections "The Block Chain" and "Proof of Work"</li>
  <li><a href="https://shieldedlabs.net/crosslink/">Shielded Labs: Crosslink</a></li>
  <li><a href="https://shieldedlabs.net/crosslink-faq/">Shielded Labs: Crosslink FAQ</a></li>
  <li><a href="https://zips.z.cash/zip-0218">ZIP 218: 25-second Block Target Spacing</a> (describes itself as complementary to finality mechanisms such as Crosslink)</li>
  <li><a href="https://zips.z.cash/zip-0259">ZIP 259: Deployment of the NU7 Network Upgrade</a> (draft)</li>
</ul>`,
  },
  "l-00-08": {
    title: "Consensus Mechanisms",
    subtitle: "Explain what nodes agree on, how forks and reorganisations resolve, and how many confirmations a Zcash payment needs.",
    content: `<p>Proof of work and proof of stake answer one question: who may propose the next block. A <strong>consensus mechanism</strong> is the whole arrangement that lets thousands of nodes which do not trust each other end up holding the same ledger. This lesson covers the remaining parts: the rules blocks must obey, what happens when two valid chains compete, and how the rules themselves get changed.</p>
<p>This is where the number your payment code cares about comes from: how many confirmations to wait for before you treat money as received.</p>

<h2>The parts of a consensus mechanism</h2>
<ul>
  <li><strong>Validity rules</strong>, also called consensus rules: what makes a transaction or block acceptable. No double-spends, valid signatures and proofs, the correct block reward, a block size limit. Every full node checks every rule and rejects whatever breaks one, whoever sent it. Zcash's rules are written down in the Zcash Protocol Specification and the Zcash Improvement Proposals (ZIPs).</li>
  <li><strong>A block producer rule</strong>: proof of work on Zcash, from the last two lessons.</li>
  <li><strong>A fork-choice rule</strong>: which chain to follow when more than one valid chain exists.</li>
</ul>
<p>Designers judge the result on two properties. <strong>Safety</strong> means honest nodes never disagree about settled history. <strong>Liveness</strong> means the chain keeps accepting valid transactions. Under a bad enough network failure you cannot keep both, and the two main families of design choose differently.</p>

<h2>Two families</h2>
<table>
  <thead><tr><th></th><th>Heaviest-chain ("Nakamoto") consensus</th><th>Byzantine fault tolerant (BFT) voting</th></tr></thead>
  <tbody>
    <tr><td>How blocks are agreed</td><td>Anyone extends the chain; nodes follow the one with most work</td><td>A known set of validators votes in rounds</td></tr>
    <tr><td>Finality</td><td>Probabilistic</td><td>Explicit once more than two-thirds have signed</td></tr>
    <tr><td>If the network splits</td><td>Keeps producing blocks on both sides, then one side is rolled back</td><td>Stops until enough validators can talk again</td></tr>
    <tr><td>Examples</td><td>Bitcoin, Zcash</td><td>Tendermint-based chains such as Cosmos</td></tr>
  </tbody>
</table>
<p>Heaviest-chain consensus favours liveness, and BFT voting favours safety. Hybrid designs run both, which is the idea behind the Crosslink proposal you met in the previous lesson.</p>

<h2>Forks, reorganisations and confirmations</h2>
<p>Suppose two miners find a valid block at almost the same moment. Part of the network hears about one first, and part hears about the other. That is a temporary <strong>fork</strong>. Nodes keep both candidates. As soon as one branch is extended further, every node switches to it, and the block on the losing branch is discarded. Switching branches is called a <strong>reorganisation</strong>, or reorg. Transactions from the discarded block are not destroyed, but they go back to being unconfirmed.</p>
<p>A transaction has one <strong>confirmation</strong> when it is in a block on the best chain, two when another block is built on top, and so on. Each confirmation makes a reorg that removes the transaction less likely and more expensive.</p>
<p>The Zcash specifics, as of October 2026:</p>
<ul>
  <li><strong>Fork choice.</strong> A node sums the work of every block in each valid chain and treats the chain with the greatest total work as best. Work is calculated from each block's target, so the best chain is the heaviest, which is not always the one with the most blocks. On a tie, the node prefers the block it received first.</li>
  <li><strong>Reorg depth.</strong> Zebra, the full node you will run later, keeps recent blocks in a non-finalised state and will not roll back further than 1,000 blocks. This is a local policy of the node software, not a consensus rule. At 75-second spacing it covers about 20.8 hours.</li>
  <li><strong>Wallet policy.</strong> ZIP 315 (a draft of wallet best practices) recommends 10 confirmations before spending funds received from someone else, and 3 for funds your own wallet created, such as change. The <code>librustzcash</code> wallet libraries use the same numbers as their default.</li>
</ul>
<blockquote>ZIP 203 states it directly: user interfaces and services "must never rely on zero-confirmation transactions in Zcash". A transaction your node has merely seen is a promise. It is not yet a payment.</blockquote>

<h2>Changing the rules</h2>
<p>Consensus rules can only change if nodes change together, otherwise the network splits. Zcash handles this with <strong>network upgrades</strong> (ZIP 200): new rules are released in node software ahead of time and switch on at an agreed block height. NU6.3, which introduced the Ironwood pool, activated at Mainnet height 3,428,143 on 28 July 2026. Nodes that do not upgrade cannot follow the chain past that height.</p>
<p>A change that only makes the rules stricter is called a <strong>soft fork</strong>. On 2 June 2026 an emergency soft fork at height 3,363,426 disabled Orchard actions while a flaw in the Orchard circuit was fixed. That episode shows what "consensus" finally rests on: the specification notes that governance of the Mainnet protocol is "by social consensus" on which node implementations faithfully implement the intended rules. You will study ZIPs and upgrades properly in Stage 01.</p>

<h2>Try it</h2>
<ol>
  <li>Your node sees three valid chain tips above the same parent. Tip A has five blocks, each with work 100. Tip B has four blocks with work 100, 100, 160 and 160. Tip C has the same total work as B but arrived a second later. Which does the node follow, and why?</li>
  <li>Calculate the wait for 3 and for 10 confirmations at 75 seconds per block. Repeat for 25 seconds, the spacing planned for NU7. ZIP 218 says it "does not argue for clients reducing confirmation counts": why might that be?</li>
  <li>Write two sentences for a merchant explaining why a payment seen on the network but not yet in a block must not release the goods.</li>
</ol>
<p>Answers to check against: B (total work 520 beats 500, and B was received before C); 3 min 45 s and 12 min 30 s at 75 seconds; 1 min 15 s and 4 min 10 s at 25 seconds.</p>

<h2>Key takeaways</h2>
<ul>
  <li>Consensus is validity rules plus a block producer rule plus a fork-choice rule; every full node enforces the rules for itself.</li>
  <li>Zcash follows the valid chain with the greatest total work, so finality is probabilistic and reorgs are possible.</li>
  <li>Wait for confirmations: ZIP 315 recommends 10 for funds from others and 3 for your own change, and nothing should rely on zero confirmations.</li>
  <li>Rules change through network upgrades that activate at an agreed block height.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf">Zcash Protocol Specification</a>: sections "The Block Chain", "Definition of Work" and "Mainnet and Testnet"</li>
  <li><a href="https://zips.z.cash/zip-0315">ZIP 315: Best Practices for Wallet Implementations</a> (draft)</li>
  <li><a href="https://zips.z.cash/zip-0203">ZIP 203: Transaction Expiry</a></li>
  <li><a href="https://zips.z.cash/zip-0200">ZIP 200: Network Upgrade Mechanism</a></li>
  <li><a href="https://zebra.zfnd.org/">The Zebra Book</a> (Zebra's rollback window is set by <code>MAX_BLOCK_REORG_HEIGHT</code> in the source)</li>
</ul>`,
  },
  "l-00-09": {
    title: "UTXO vs Account Model",
    subtitle: "Trace how account and UTXO ledgers record ownership, and how Zcash's shielded notes and nullifiers extend the UTXO idea.",
    content: `<p>A blockchain has to answer one question before it can accept any payment: does the sender actually have this money? There are two standard ways to keep the records that answer it. The <strong>account model</strong> stores a balance for each account. The <strong>UTXO model</strong> stores individual coins.</p>
<p>Zcash is a UTXO chain, and its shielded pools are built on a private variant of the same idea. If you can read a UTXO transaction, the notes and nullifiers of Stage 01 will make sense quickly. If you come from Ethereum, this lesson is where you unlearn "an address has a balance".</p>

<h2>The account model</h2>
<p>Ethereum keeps a global table. Each account has a balance and a <strong>nonce</strong>, a counter of the transactions it has sent. A payment says "move 5 from A to B". A node checks the signature, checks that A's balance covers the amount, checks that the nonce is the next expected one (so the same signed message cannot be replayed), and then edits two rows.</p>
<p>This is easy to reason about and suits smart contracts, which are accounts with code. The cost is that every payment an account makes is tied to one long-lived public identifier.</p>

<h2>The UTXO model</h2>
<p>Bitcoin stores no balances at all. The ledger is a set of <strong>unspent transaction outputs</strong> (UTXOs). Each output is an amount plus a condition for spending it, normally "a signature from the key behind this address". A transaction consumes whole outputs as its <strong>inputs</strong> and creates new outputs.</p>
<p>It works like paying with banknotes. To pay 0.6 ZEC when you hold a 0.5 and a 0.3, you hand over both and receive change:</p>
<pre><code>inputs    0.50000000 ZEC   (output 0 of an earlier transaction)
          0.30000000 ZEC   (output 1 of another transaction)

outputs   0.60000000 ZEC   to the shop
          0.19990000 ZEC   back to you, as change

fee       0.00010000 ZEC   inputs minus outputs; it is never written down</code></pre>
<p>Your "balance" is the sum of the UTXOs your keys can spend; your wallet works it out, the chain does not store it. Preventing a double-spend is a lookup: is every input still in the UTXO set? Once an output is spent it leaves the set for good.</p>
<table>
  <thead><tr><th></th><th>Account model</th><th>UTXO model</th></tr></thead>
  <tbody>
    <tr><td>The ledger stores</td><td>A balance per account</td><td>A set of unspent outputs</td></tr>
    <tr><td>A payment</td><td>Debits one row, credits another</td><td>Consumes outputs, creates new ones</td></tr>
    <tr><td>Replay protection</td><td>Per-account nonce</td><td>Each output can be spent once</td></tr>
    <tr><td>Checking in parallel</td><td>Harder: transactions share state</td><td>Easier: outputs are independent</td></tr>
    <tr><td>Used by</td><td>Ethereum</td><td>Bitcoin, Zcash</td></tr>
  </tbody>
</table>

<h2>Zcash's transparent pool is a UTXO ledger</h2>
<p>The Zcash Protocol Specification says that transfers of transparent value "work essentially as in Bitcoin and have the same privacy properties". Funds held at a transparent address (the kind beginning with <code>t</code>) are ordinary UTXOs. Amounts, sending addresses and receiving addresses are all public, and anyone can follow the chain of outputs from one transaction to the next. Zebra's <code>getaddressutxos</code> RPC method will list them for any transparent address.</p>
<p>Amounts on chain are integers counted in <strong>zatoshis</strong>: 1 ZEC = 100,000,000 zatoshis. Always do arithmetic in zatoshis, never in floating-point ZEC.</p>

<h2>From UTXOs to shielded notes</h2>
<p>A shielded pool holds value in <strong>notes</strong>. A note is the shielded counterpart of a UTXO: it specifies an amount and, indirectly, the shielded address that can spend it. What changes is how notes are created and spent on chain.</p>
<ul>
  <li><strong>Creating a note</strong> publishes only a <strong>note commitment</strong>, which is appended to the pool's note commitment tree. That tree is a Merkle tree like the ones you built in Week 1. The amount and recipient are not disclosed.</li>
  <li><strong>Spending a note</strong> reveals its <strong>nullifier</strong>, a value unique to that note, together with a zero-knowledge proof that a commitment for the note exists in the tree and that the spender holds the right key. The proof does not say which commitment.</li>
  <li><strong>Double-spends</strong> are stopped by a <strong>nullifier set</strong>. A transaction is invalid if it would add a nullifier that is already in the set.</li>
</ul>
<p>The specification states that it is infeasible to connect a note commitment with its nullifier without the relevant key. So an observer cannot tell which notes have been spent. There is no public "unspent set" here: the commitment tree only grows and the nullifier set only grows.</p>
<table>
  <thead><tr><th></th><th>Transparent UTXO</th><th>Shielded note</th></tr></thead>
  <tbody>
    <tr><td>Created by publishing</td><td>The output: amount and address</td><td>A note commitment</td></tr>
    <tr><td>Spent by</td><td>Referencing the output and signing</td><td>Revealing a nullifier with a zero-knowledge proof</td></tr>
    <tr><td>Double-spend check</td><td>Is the output still in the UTXO set?</td><td>Is the nullifier absent from the nullifier set?</td></tr>
    <tr><td>Observers see</td><td>Amounts and addresses</td><td>Commitments, nullifiers and proofs</td></tr>
  </tbody>
</table>
<blockquote>Shielding hides what stays inside a pool. The specification is explicit that moving value between pools "always reveals the amount transferred", and the transparent inputs and outputs of a transaction are always public.</blockquote>
<p>Stage 01 covers how this is done in the Sapling pool and in Ironwood, the current shielded pool.</p>

<h2>Try it</h2>
<ol>
  <li>A wallet holds three transparent UTXOs worth 50,000,000, 30,000,000 and 8,000,000 zatoshis. It must pay a shop 60,000,000 zatoshis with a fee of 10,000 zatoshis. Choose the inputs, then write out the outputs. (One answer: spend the first two and return 19,990,000 zatoshis as change.)</li>
  <li>List everything a block explorer would show the public about that transaction.</li>
  <li>Now suppose the same value were held as shielded notes and paid to a shielded address. Using the second table, list what would appear on chain instead.</li>
  <li>Explain in two sentences why the nullifier set can never shrink, while a UTXO set shrinks whenever an output is spent.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
  <li>Account chains store balances and use nonces; UTXO chains store individual unspent outputs that are consumed whole.</li>
  <li>Zcash's transparent pool is a Bitcoin-style UTXO ledger and is fully public.</li>
  <li>A shielded note is a private UTXO: creating it publishes a commitment, spending it reveals a nullifier, and the two cannot be linked without the key.</li>
  <li>Value crossing between pools is always visible, so do not describe shielded transactions as hiding everything.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/protocol/protocol.pdf">Zcash Protocol Specification</a>: sections "High-level Overview", "Shielded Pools and Notes", "Note Commitments" and "Nullifiers"</li>
  <li><a href="https://zechub.wiki/using-zcash/shielded-pools">ZecHub wiki: Zcash Value Pools</a></li>
  <li><a href="https://zechub.wiki/using-zcash/transactions">ZecHub wiki: Transactions</a></li>
  <li><a href="https://zebra.zfnd.org/">The Zebra Book</a> (Zebra's JSON-RPC methods include <code>getaddressutxos</code>)</li>
</ul>`,
  },
  "l-00-10": {
    title: "Transactions & Mempool",
    subtitle: "Follow a Zcash transaction from broadcast to block, and work out its ZIP 317 fee and ZIP 203 expiry height.",
    content: `<p>Between a user pressing "send" and the first confirmation, a transaction sits in a waiting area called the <strong>mempool</strong> (memory pool). Most "my payment is stuck" questions are answered by what happens there: how nodes relay transactions, what fee they expect, and when an unmined transaction gives up.</p>

<h2>From wallet to block</h2>
<ol>
  <li>The wallet builds a transaction (inputs, outputs, an expiry height) and authorises it with signatures and, for shielded parts, zero-knowledge proofs.</li>
  <li>It hands the transaction to a node. Zebra accepts one through its <code>sendrawtransaction</code> RPC method.</li>
  <li>The node verifies it against the consensus rules and the current chain state. If it passes, the node stores it in its mempool.</li>
  <li>The node announces it to its peers, which fetch it, verify it themselves and pass it on. This is called gossip.</li>
  <li>A miner's node builds a block template from its mempool (<code>getblocktemplate</code>), and the miner finds a block.</li>
  <li>Nodes that receive the block remove its transactions from their mempools. The transaction now has one confirmation.</li>
</ol>

<h2>The mempool is local and temporary</h2>
<p>The mempool is not part of the chain, and each node has its own. Zebra's mempool specification describes these behaviours:</p>
<ul>
  <li>It is switched on only once the node is near the chain tip.</li>
  <li>It lives in memory and is rebuilt from scratch after a restart.</li>
  <li>When the chain tip changes, it removes mined and expired transactions and re-verifies the rest.</li>
  <li>It is bounded, following ZIP 401. Each transaction has a cost of at least 10,000 (its size in bytes if larger), and the total is capped at 80,000,000. When full, the node evicts transactions at random, favouring those that pay less than the conventional fee, and refuses to take an evicted transaction back for 60 minutes.</li>
</ul>
<p>You can inspect a Zebra node's mempool with <code>getrawmempool</code> and <code>getmempoolinfo</code>.</p>

<h2>Fees: ZIP 317</h2>
<p>A transaction's fee is its inputs minus its outputs, and the miner of the block collects it. Consensus does not set the amount. ZIP 317 defines a <strong>conventional fee</strong> that wallets pay and nodes expect:</p>
<pre><code>conventional_fee = marginal_fee × max(2, logical_actions)</code></pre>
<p><strong>Logical actions</strong> measure how much work the transaction creates. Each Orchard or Ironwood action counts as one. Sapling counts the larger of its spends and its outputs. Transparent parts are counted by size, at 150 bytes per standard input and 34 per output, again taking the larger. The contributions are added together.</p>
<p>The marginal fee is in transition. ZIP 317's text sets it at 5,000 zatoshis, a 10,000-zatoshi minimum. A reduction to 1,000 zatoshis is being rolled out: Zebra 6.4.0 and later already accept 1,000 per logical action into the mempool, and the <code>getstandardfee</code> RPC in Zebra's NU7 release candidate reports 5,000 on Mainnet until height 3,590,000 and 1,000 from then on.</p>
<blockquote>Do not hardcode the fee. Let your wallet library calculate it, or ask the node with <code>getstandardfee</code>. On Mainnet in October 2026 wallets pay 5,000 zatoshis per logical action.</blockquote>
<p>Paying extra buys little. Zebra's block templates follow ZIP 317's recommended algorithm, which picks transactions at random, weighted by fee relative to the conventional fee, with a cap on that weight.</p>

<h2>Expiry: ZIP 203</h2>
<p>Every Zcash transaction carries an <code>nExpiryHeight</code>. It cannot be mined in a block above that height, and nodes drop it from their mempools once the chain gets there. The default is 40 blocks after the current height, about 50 minutes at 75-second spacing. A value of 0 means no expiry.</p>
<p>So a Zcash transaction does not stay pending indefinitely. Once it expires, the funds are spendable again and the wallet must build and send a new transaction.</p>

<h2>Try it</h2>
<ol>
  <li>With a marginal fee of 5,000 zatoshis, calculate the conventional fee for: (a) 2 Ironwood actions; (b) 5 Ironwood actions; (c) a Sapling transaction with 1 spend and 3 outputs. Repeat with 1,000. (Check at 5,000: 10,000, 25,000 and 15,000 zatoshis.)</li>
  <li>The chain tip is at height 3,510,000 and a wallet sets expiry 40 blocks ahead. What is the last height at which the transaction can be mined? (3,510,040.)</li>
  <li>A user says a payment has been "pending" for two hours. Using this lesson, give two explanations and say what the wallet should do in each case.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
  <li>Each node keeps its own in-memory mempool; nothing in it is confirmed.</li>
  <li>The ZIP 317 conventional fee is a marginal fee times the number of logical actions, with a minimum of two. The marginal fee is moving from 5,000 to 1,000 zatoshis, so query it.</li>
  <li>ZIP 203 expiry means an unmined transaction is dropped after about 50 minutes by default and must be rebuilt.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/zip-0317">ZIP 317: Proportional Transfer Fee Mechanism</a></li>
  <li><a href="https://zips.z.cash/zip-0203">ZIP 203: Transaction Expiry</a></li>
  <li><a href="https://zips.z.cash/zip-0401">ZIP 401: Addressing Mempool Denial-of-Service</a></li>
  <li><a href="https://zebra.zfnd.org/dev.html">The Zebra Book, developer documentation</a> (see "Mempool Specification")</li>
  <li><a href="https://github.com/ZcashFoundation/zebra/releases/tag/v6.4.0">Zebra 6.4.0</a> and <a href="https://github.com/ZcashFoundation/zebra/releases/tag/v7.0.0-rc.0">Zebra 7.0.0-rc.0</a> release notes (fee change)</li>
</ul>`,
  },
  "l-00-11": {
    title: "Wallets & Key Derivation (BIP-32/39/44)",
    subtitle: "Derive a tree of keys from one seed with BIP-39, BIP-32 and BIP-44, and see how ZIP 32 extends it to Zcash's shielded keys.",
    content: `<p>A wallet does not hold coins. The coins are entries on the chain; the wallet holds the keys that can spend them. Modern wallets derive every key they will ever use from a single secret, which you back up once as a list of words.</p>
<p>This lesson follows that derivation step by step. It explains what a seed phrase backup actually covers, why Zcash wallets use 24 words, and what "account 0" means in the SDKs you will use from Stage 02 onwards.</p>

<h2>BIP-39: from randomness to a seed phrase</h2>
<p>BIP-39 turns random bits into words a person can write down. The wallet generates between 128 and 256 bits of randomness (the <strong>entropy</strong>), appends a short checksum, and cuts the result into 11-bit groups. Each group selects one word from a fixed list of 2,048. 128 bits gives 12 words, and 256 bits gives 24.</p>
<p>The phrase is then stretched into a 64-byte <strong>seed</strong> with PBKDF2-HMAC-SHA512: 2,048 rounds, salted with the text <code>mnemonic</code> followed by an optional passphrase. Everything else is derived from this seed.</p>
<p>For Zcash, ZIP 32 requires the seed to carry at least 256 bits of entropy, and ZIP 315 spells out the consequence: a BIP-39 phrase needs 24 words. The <code>zcash-devtool</code> wallet, for example, generates a 24-word phrase and derives its seed with an empty passphrase.</p>

<h2>BIP-32: one seed, a tree of keys</h2>
<p>BIP-32 defines a <strong>hierarchical deterministic</strong> (HD) wallet. Take HMAC-SHA512 of the seed with the key <code>Bitcoin seed</code>. The left 32 bytes are the master private key, and the right 32 bytes are a <strong>chain code</strong>, extra secret data that makes further derivation possible. From any key and chain code you can derive numbered children, and from those their own children, giving a tree. A position in the tree is written as a path, such as <code>m/44'/133'/0'/0/5</code>.</p>
<p>There are two kinds of child:</p>
<ul>
  <li><strong>Normal</strong> children are derived from the parent's <em>public</em> key. Someone holding only the parent public key and chain code (an "extended public key") can generate all the child public keys, and so all the addresses, without being able to spend. A shop's server can issue receiving addresses this way.</li>
  <li><strong>Hardened</strong> children, marked with an apostrophe, are derived from the parent's <em>private</em> key. They cannot be derived from public data.</li>
</ul>
<p>Normal derivation has a known weakness: an extended public key plus any one of its normal child private keys reveals the parent private key. That is why the upper levels of a path are hardened.</p>

<h2>BIP-44: an agreed layout</h2>
<p>BIP-44 fixes what each level means, so that different wallets restore the same addresses from the same phrase:</p>
<pre><code>m / purpose' / coin_type' / account' / change / address_index</code></pre>
<p><code>purpose</code> is 44. <code>coin_type</code> comes from the SLIP-44 registry: <strong>Zcash is 133</strong>, and all testnets share 1. <code>account</code> separates funds into independent groups. <code>change</code> is 0 for addresses you give out and 1 for change. Zcash transparent addresses follow this layout exactly, at <code>m/44'/133'/account'/0/address_index</code>.</p>
<p>The script below performs both steps with nothing but Node.js built-ins:</p>
<pre><code>// hd.mjs: BIP-39 and BIP-32 with Node.js built-ins. Public test vectors only.
import { createECDH, createHmac, pbkdf2Sync } from 'node:crypto';

// BIP-39: seed phrase -&gt; 64-byte seed
const phrase = 'abandon '.repeat(23) + 'art';   // a published test vector, not a wallet
const bip39Seed = pbkdf2Sync(phrase, 'mnemonic' + 'TREZOR', 2048, 64, 'sha512');
console.log('BIP-39 seed:', bip39Seed.toString('hex'));

// BIP-32: seed -&gt; master key -&gt; hardened children
const N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n; // secp256k1 order
const toBig = (buf) =&gt; BigInt('0x' + buf.toString('hex'));
const split = (I) =&gt; ({ key: I.subarray(0, 32), chainCode: I.subarray(32) });

const master = (seed) =&gt; split(createHmac('sha512', 'Bitcoin seed').update(seed).digest());

function hardenedChild(parent, index) {
  const data = Buffer.concat([Buffer.from([0]), parent.key, Buffer.alloc(4)]);
  data.writeUInt32BE(0x80000000 + index, 33);
  const I = split(createHmac('sha512', parent.chainCode).update(data).digest());
  const key = (toBig(I.key) + toBig(parent.key)) % N;
  return { key: Buffer.from(key.toString(16).padStart(64, '0'), 'hex'), chainCode: I.chainCode };
}

// Zcash's own test vector: the 32-byte seed 00 01 02 ... 1f, path m/44'/133'/0'
let node = master(Buffer.from([...Array(32).keys()]));
for (const index of [44, 133, 0]) node = hardenedChild(node, index);

const ecdh = createECDH('secp256k1');
ecdh.setPrivateKey(node.key);
console.log('chain code :', node.chainCode.toString('hex'));
console.log('public key :', ecdh.getPublicKey('hex', 'compressed'));</code></pre>
<p>The phrase and the passphrase <code>TREZOR</code> come from the BIP-39 test vectors. The 32-byte seed in the second half is the one Zcash's own test vectors use, so you can check your output against a published answer.</p>
<blockquote>Never type a real seed phrase into a script, a website, a chat or an AI assistant. Whoever sees the phrase controls every key derived from it, on every chain. Practise only with published test vectors or a throwaway Testnet wallet.</blockquote>

<h2>ZIP 32: shielded keys from the same seed</h2>
<p>Shielded keys are not secp256k1 keys, so BIP-32 cannot produce them. ZIP 32 defines a separate tree for each shielded protocol, rooted in the same seed:</p>
<table>
  <thead><tr><th>Key tree</th><th>Master key made with</th><th>Account path</th></tr></thead>
  <tbody>
    <tr><td>Transparent</td><td>HMAC-SHA512, key <code>Bitcoin seed</code></td><td><code>m/44'/133'/account'</code></td></tr>
    <tr><td>Sapling</td><td>BLAKE2b-512, personalised <code>ZcashIP32Sapling</code></td><td><code>m_Sapling/32'/133'/account'</code></td></tr>
    <tr><td>Orchard</td><td>BLAKE2b-512, personalised <code>ZcashIP32Orchard</code></td><td><code>m_Orchard/32'/133'/account'</code></td></tr>
  </tbody>
</table>
<p>What is different from BIP-44:</p>
<ul>
  <li><strong>Purpose is 32.</strong> The coin type and account number are reused, so "account 0" is the same slot in every tree.</li>
  <li><strong>There is no change level.</strong> ZIP 32 explains that shielded addresses are never publicly visible in transactions, so a separate change address would add nothing.</li>
  <li><strong>Addresses are diversified.</strong> Instead of one key per address, a shielded account can produce a very large number of addresses (up to 2 to the power 88 for Orchard) that cannot be linked to each other but share one spending key and one viewing key. Scanning the chain costs the same however many you hand out.</li>
  <li><strong>Orchard derivation is hardened only.</strong></li>
  <li><strong>Ironwood adds no new tree.</strong> The Ironwood pool uses the Orchard protocol, and the same Orchard keys cover both pools.</li>
</ul>
<p>You will not implement this by hand. In the Rust libraries, <code>UnifiedSpendingKey::from_seed</code> in the <code>zcash_keys</code> crate takes a seed and an account number and derives the transparent, Sapling and Orchard keys together. Node's built-in <code>crypto</code> module does not expose BLAKE2b personalisation, which is why the script above stops at the transparent tree. Stage 01 picks up from here with viewing keys and Unified Addresses.</p>

<h2>Try it</h2>
<ol>
  <li>Save the script as <code>hd.mjs</code> and run <code>node hd.mjs</code>. Expect a BIP-39 seed starting <code>bda85446</code>, a chain code starting <code>9ba0439c</code> and a public key starting <code>02ed6385</code>.</li>
  <li>Change the path to account 1 (<code>[44, 133, 1]</code>). You should get a chain code starting <code>fa9291b3</code> and a public key starting <code>03fc399e</code>. Both results are published in the <code>bip_0032</code> file of the Zcash test vectors.</li>
  <li>Change one letter of the passphrase and run it again. What does the result tell you about a forgotten passphrase?</li>
  <li>Write the full path of the third transparent receiving address of account 2 on Mainnet. (Answer: <code>m/44'/133'/2'/0/2</code>.)</li>
</ol>

<h2>Key takeaways</h2>
<ul>
  <li>BIP-39 encodes entropy as words and stretches them into a seed; Zcash wallets need 24 words to reach 256 bits of entropy.</li>
  <li>BIP-32 grows a tree of keys from the seed; hardened levels protect parents from leaks lower down.</li>
  <li>BIP-44 fixes the path layout. Zcash's coin type is 133 on Mainnet and 1 on test networks.</li>
  <li>ZIP 32 derives Sapling and Orchard keys from the same seed under purpose 32, with diversified addresses in place of per-address keys.</li>
  <li>A seed phrase is every key at once. Never enter a real one anywhere but your wallet.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/zip-0032">ZIP 32: Shielded Hierarchical Deterministic Wallets</a></li>
  <li><a href="https://zips.z.cash/zip-0315">ZIP 315: Best Practices for Wallet Implementations</a> (draft; see "Wallet seeds")</li>
  <li><a href="https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki">BIP 32</a>, <a href="https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki">BIP 39</a> and <a href="https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki">BIP 44</a></li>
  <li><a href="https://github.com/zcash/zcash-test-vectors/blob/master/zcash_test_vectors/transparent/bip_0032.py">Zcash test vectors: transparent BIP 32 derivation</a></li>
</ul>`,
  },
}
