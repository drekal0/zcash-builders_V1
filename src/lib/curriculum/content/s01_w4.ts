// AUTO-GENERATED from scratchpad lesson fragments. Do not edit by hand.
// Each entry: lesson id -> { title, subtitle, content (HTML) }.
import type { LessonContent } from './types'

export const M_s01_w4: Record<string, LessonContent> = {
  "l-01-08": {
    title: "ZIPs \u2014 How Zcash Improves Itself",
    subtitle: "Read any Zcash Improvement Proposal, tell what its category and status mean, and follow a change from idea to activation.",
    content: `<p>Every rule you met last week — what a Unified Address is, how the Ironwood pool works, what a memo may contain — is written down in a <strong>Zcash Improvement Proposal</strong>, or ZIP. ZIP 0 defines a ZIP as "a design document providing information to the Zcash community, or describing a new feature for Zcash or its processes or environment". Together with the Zcash Protocol Specification, ZIPs are what you check when a library, a blog post and a wallet disagree.</p>
<p>You will read ZIPs far more often than you write them. This lesson shows you how to read one: who owns it, what kind of document it is, and whether it describes something live on Mainnet or something still being argued about.</p>

<h2>Owners and editors</h2>
<p>ZIPs are text files in the <code>zcash/zips</code> Git repository, rendered at <code>zips.z.cash</code>. Each has one or more <strong>Owners</strong>, usually the authors, who are "responsible for building consensus within the community and documenting dissenting opinions".</p>
<p>The <strong>ZIP Editors</strong> assign numbers, check that a draft is sound, complete and correctly formatted, and manage the repository. As of October 2026 ZIP 0 lists ten: three acting as individuals, and others associated with the Zcash Foundation, Shielded Labs, Project Tachyon and Valar Group. There must always be at least two, including one from the Zcash Foundation.</p>
<blockquote>Editors publish; they do not rule. ZIP 0 says it is "not the primary responsibility of the ZIP Editors to review proposals for security, correctness, or implementability", and they must not unreasonably refuse a draft.</blockquote>

<h2>Categories and numbers</h2>
<p>The <code>Category</code> header tells you who has to care. A ZIP can have more than one.</p>
<table>
<thead><tr><th>Category</th><th>Covers</th><th>Example</th></tr></thead>
<tbody>
<tr><td>Consensus</td><td>Rules every node must enforce</td><td>ZIP 229, Version 6 Transaction Format</td></tr>
<tr><td>Standards</td><td>Non-consensus rules needed for interoperability</td><td>ZIP 317, the fee mechanism</td></tr>
<tr><td>Wallet</td><td>How wallets build or interpret transactions and addresses</td><td>ZIP 318, Orchard to Ironwood Migration</td></tr>
<tr><td>Network, RPC</td><td>Peer-to-peer behaviour; node RPC interfaces</td><td>ZIP 258 is "Consensus / Network"</td></tr>
<tr><td>Process, Consensus Process</td><td>How the community works and decides</td><td>ZIP 0; ZIP 1014, the original Dev Fund</td></tr>
<tr><td>Informational, Ecosystem</td><td>Guidance and other useful specifications</td><td>ZIP 307 is "Standards / Ecosystem"</td></tr>
</tbody>
</table>
<p>Numbers hint at scope: by the editors' current convention 200–299 touch consensus, 300–399 are higher-layer interoperability, 1000–1199 concern consensus process, and 2000–2999 update existing ZIPs. A ZIP that mirrors a Bitcoin Improvement Proposal keeps its number (ZIP 32, ZIP 321).</p>

<h2>The lifecycle</h2>
<ol>
<li><strong>Idea.</strong> Search past discussions, then post on the Zcash Community Forum.</li>
<li><strong>Draft.</strong> The Owners open a pull request with a file named like <code>draft-zatoshizakamoto-42millionzec</code>. Only the editors assign numbers.</li>
<li><strong>Proposed.</strong> The Owners consider it complete and the editors confirm rough consensus. A Consensus ZIP needs a Deployment section by now, and a ZIP with significant security or privacy implications needs independent expert review first.</li>
<li><strong>Implemented.</strong> A reference implementation exists; for a Consensus ZIP, it is merged into a consensus node.</li>
<li><strong>Final.</strong> Implemented and activated on the network.</li>
</ol>
<p>Process and Informational ZIPs become <strong>Active</strong> instead. A ZIP can also end as <strong>Withdrawn</strong>, <strong>Rejected</strong> or <strong>Obsolete</strong>, and <strong>Reserved</strong> marks a number held for a ZIP not yet published. Long-lived ZIPs carry numbered Revisions, each with its own status: ZIP 317 reads <code>[Revision 0] Active, [Revision 1: NU6.3] Draft, [Revision 2] Draft</code>.</p>

<h2>A worked example: the 2026 upgrades</h2>
<p>Consensus changes ship in a <strong>network upgrade</strong> that activates at a fixed block height (ZIP 200). Each upgrade has a "Deployment of…" ZIP that sets the height and lists what is included.</p>
<ul>
<li><strong>NU6.2.</strong> After the Orchard circuit vulnerability was reported on 29 May 2026, the fix came first and the paperwork second: ZIP 257, created on 9 June, "retrospectively documents" the emergency mitigation and NU6.2. It is now Final.</li>
<li><strong>NU6.3 (Ironwood).</strong> ZIP 258 is the deployment ZIP. It points to ZIP 229, ZIP 2005 and ZIP 2006 for consensus, and to ZIP 318 and ZIP 326 for wallets.</li>
<li><strong>NU7.</strong> ZIP 259 lists what is planned. It is a Draft; NU7 is active on Testnet, but the Mainnet activation height was still "TBD" in early October 2026.</li>
</ul>
<blockquote>A status header can lag behind the chain. On 6 October 2026, over two months after NU6.3 activated, ZIP 258 and ZIP 229 still read "Draft" and ZIP 2006 was a "Reserved" stub. To see what is live, read the "Settled Mainnet Network Upgrade" line at the top of the ZIP index.</blockquote>

<h2>Try it</h2>
<p>Open <a href="https://zips.z.cash/">zips.z.cash</a> and spend fifteen minutes on the following. You will need all four ZIPs in step 1 for this week's lab.</p>
<ol>
<li>For ZIP 302, ZIP 307, ZIP 315 and ZIP 316, record the title, category and status. Which are still Draft even though wallets implement them?</li>
<li>Find the ZIPs planned for NU7. Read the Abstract of one and write a sentence on what would change for an application developer.</li>
<li>Find one Reserved and one Withdrawn ZIP. What should you do with each?</li>
</ol>

<h2>Key takeaways</h2>
<ul>
<li>ZIPs and the Protocol Specification are the primary source for how Zcash works. Owners write ZIPs; ZIP Editors publish them.</li>
<li>Read the header first: Category says who must care, Status says how far along it is.</li>
<li>Consensus changes activate in network upgrades, each with a deployment ZIP listing its contents.</li>
<li>Status can lag reality — check the settled-upgrade line in the index.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zips.z.cash/zip-0000">ZIP 0: ZIP Process</a></li>
<li><a href="https://github.com/zcash/zips">The zcash/zips repository and ZIP index</a></li>
<li><a href="https://zips.z.cash/zip-0200">ZIP 200: Network Upgrade Mechanism</a></li>
<li><a href="https://zips.z.cash/zip-0257">ZIP 257: Orchard Temporary Vulnerability Mitigation and NU6.2</a></li>
<li><a href="https://zips.z.cash/zip-0258">ZIP 258: Deployment of the NU6.3 Network Upgrade</a></li>
<li><a href="https://zips.z.cash/zip-0259">ZIP 259: Deployment of the NU7 Network Upgrade (draft)</a></li>
</ul>`,
  },
  "l-01-09": {
    title: "The Zcash Development Fund",
    subtitle: "Explain where Zcash development money comes from, who controls each share today, and what NU7 proposes to change.",
    content: `<p>Zcash pays for part of its own development out of the block subsidy — the new ZEC created in each block. The arrangement has been renegotiated several times, and it decides which teams exist to review your pull request or fund your grant. This lesson covers the history, the split in force in October 2026, and what is proposed for NU7.</p>

<h2>How the mechanism works</h2>
<p>Since the November 2024 halving each Mainnet block creates <strong>1.5625 ZEC</strong>. A <strong>funding stream</strong> (ZIP 207) is a consensus rule: for a given range of block heights, a fixed fraction of that subsidy must go to a specified recipient, and a block that leaves out a required payment is invalid. Streams take a share of newly issued ZEC, not of anyone's balance, and each has an end height written into the rules. If the community agrees nothing new, it simply stops.</p>

<h2>Four eras of funding</h2>
<table>
<thead><tr><th>Period</th><th>Rule</th><th>Split of the block subsidy</th></tr></thead>
<tbody>
<tr><td>2016 – Nov 2020</td><td>Founders' Reward</td><td>One fifth to the Founders' Reward; the rest to miners</td></tr>
<tr><td>Nov 2020 – Nov 2024</td><td>Dev Fund, ZIP 1014</td><td>80% miners; 7% Bootstrap Project (parent of Electric Coin Company); 5% Zcash Foundation; 8% Major Grants, which became Zcash Community Grants</td></tr>
<tr><td>Nov 2024 – Nov 2025</td><td>ZIP 1015 (NU6)</td><td>80% miners; 8% Zcash Community Grants; 12% to an in-protocol "lockbox" with no way to withdraw</td></tr>
<tr><td>Since 24 Nov 2025</td><td>ZIP 1016, ZIP 271 (NU6.1)</td><td>80% miners; 8% Zcash Community Grants; 12% Coinholder-Controlled Fund</td></tr>
</tbody>
</table>
<p>The direction is deliberate. ZIP 1015 argued that funding named organisations directly brought regulatory risk, inefficiency and centralisation, so from NU6 neither Electric Coin Company nor the Zcash Foundation receives a share.</p>
<blockquote>Do not copy percentages from older pages. Anything showing ECC or the Zcash Foundation receiving part of the block subsidy describes 2020–2024.</blockquote>

<h2>What is in force today</h2>
<table>
<thead><tr><th>Recipient</th><th>Share</th><th>Per block</th><th>Who decides the spending</th></tr></thead>
<tbody>
<tr><td>Miners</td><td>80%</td><td>1.25 ZEC</td><td>The miner</td></tr>
<tr><td>Zcash Community Grants (ZCG)</td><td>8%</td><td>0.125 ZEC</td><td>A five-seat committee</td></tr>
<tr><td>Coinholder-Controlled Fund</td><td>12%</td><td>0.1875 ZEC</td><td>ZEC holders, by vote</td></tr>
</tbody>
</table>
<p><strong>Zcash Community Grants.</strong> Under ZIP 1015, carried forward by ZIP 1016, the 8% is received and administered by the Financial Privacy Foundation (FPF), a Cayman Islands non-profit, for grants to independent teams. Decisions belong to the ZCG Committee — five seats, one-year terms, selected by the Zcash Community Advisory Panel — and FPF may veto only on legal or reporting grounds. Stage 03 covers how to apply.</p>
<p><strong>Coinholder-Controlled Fund.</strong> At NU6.1 activation the lockbox's contents, 78,750 ZEC, were paid once to a 2-of-3 multisig address held by three "Key-Holder Organizations" (ZIP 271 named the Zcash Foundation, Electric Coin Company and Shielded Labs). The continuing 12% still accrues in the protocol lockbox, earmarked for the same fund. ZIP 1016 sets the spending rules:</p>
<ul>
<li>Anyone may apply. Coinholders vote every three months, after 30 days of community review.</li>
<li>A grant passes only if at least <strong>420,000 ZEC</strong> is voted, with a simple majority in favour.</li>
<li>The Key-Holder Organizations sign payments for approved grants. One can veto on legal grounds; two together can veto for harm to users or to Zcash's values.</li>
<li>Coinholders may also "leave the funds at rest".</li>
</ul>
<p>Both streams end at the third halving, roughly three years after NU6.1. A draft from September 2026, not yet numbered, proposes naming Zcash Open Development Lab (ZODL) as a Key-Holder Organization in place of Electric Coin Company.</p>

<h2>What NU7 proposes</h2>
<p>NU7 is not active on Mainnet and every ZIP below is a Draft. None changes the 80 / 8 / 12 split of the subsidy.</p>
<ul>
<li><strong>ZIP 218</strong> cuts block target spacing from 75 to 25 seconds, so the subsidy per block falls to a third (52,083,333 zatoshis) and issuance per day stays essentially the same.</li>
<li><strong>ZIP 214 Revision 3</strong> and <strong>ZIP 207 Revision 2</strong> re-time the existing streams so they still end at the third halving.</li>
<li><strong>ZIP 2008</strong> moves the ZCG stream to a new receiving address, at the recipient's request.</li>
<li><strong>ZIP 235</strong> removes 60% of each block's transaction fees from circulation; miners keep 40%. Today miners receive all fees.</li>
<li><strong>ZIP 237</strong> reissues the removed funds later through block subsidies, keeping the halving schedule and the 21 million cap.</li>
</ul>
<p>The <em>size</em> of the fee is a separate matter. ZIP 317's conventional fee is 5,000 zatoshis per logical action, and a cut to 1,000 is being rolled out as wallet and relay policy, not as a consensus change or part of NU7.</p>

<h2>Try it</h2>
<ol>
<li>At 75 seconds per block, how many blocks are mined in a day? Multiply by the per-block amounts above to get the daily ZEC for miners, ZCG and the Coinholder-Controlled Fund.</li>
<li>Repeat with NU7's proposed numbers: 25-second blocks and a 0.52083333 ZEC subsidy. What changed per block, and what changed per day?</li>
<li>Read "Disbursement process" and "Veto process" in ZIP 1016. Write down two things that must happen before coinholders can vote on an application.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
<li>Development funding is a consensus rule: a fixed share of the block subsidy for a fixed range of heights.</li>
<li>In force since NU6.1: 80% miners, 8% Zcash Community Grants, 12% Coinholder-Controlled Fund, until the third halving.</li>
<li>ZCG grants are decided by an elected committee; coinholder grants need 420,000 ZEC voting and a simple majority.</li>
<li>NU7's drafts keep the split, re-time it for 25-second blocks and change where transaction fees go.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zips.z.cash/zip-1014">ZIP 1014: Establishing a Dev Fund for ECC, ZF, and Major Grants</a></li>
<li><a href="https://zips.z.cash/zip-1015">ZIP 1015: Block Subsidy Allocation for Non-Direct Development Funding</a></li>
<li><a href="https://zips.z.cash/zip-1016">ZIP 1016: Community and Coinholder Funding Model</a></li>
<li><a href="https://zips.z.cash/zip-0271">ZIP 271: Dev Fund Extension and One-Time Disbursement</a></li>
<li><a href="https://zips.z.cash/zip-0214">ZIP 214: Consensus rules for a Zcash Development Fund</a></li>
<li><a href="https://zips.z.cash/zip-0235">ZIP 235: Remove 60% of Transaction Fees From Circulation (draft)</a></li>
</ul>`,
  },
  "l-01-10": {
    title: "Governance & Zcash Community",
    subtitle: "Describe how a Zcash decision actually gets made \u2014 who proposes, who is polled, who ships \u2014 and where you can take part.",
    content: `<p>Nobody owns Zcash. There is no foundation that can order a change and no token vote that executes one automatically. Decisions come out of several overlapping mechanisms: written proposals, community and coinholder polls, open engineering calls, and finally the choices of the people who write and run node software. This lesson maps those mechanisms so you know where a decision is at any moment — and where to speak up.</p>

<h2>Four layers of a decision</h2>
<table>
<thead><tr><th>Layer</th><th>Question it answers</th><th>Mechanism</th></tr></thead>
<tbody>
<tr><td>Specify</td><td>What exactly is being proposed?</td><td>A ZIP, with Owners building consensus and ZIP Editors checking and publishing it</td></tr>
<tr><td>Signal</td><td>Does the community want it?</td><td>Forum discussion, the Zcash Community Advisory Panel (ZCAP), coinholder polls</td></tr>
<tr><td>Ship</td><td>Will it be built?</td><td>The teams that maintain consensus nodes, libraries and wallets</td></tr>
<tr><td>Run</td><td>Will the network follow it?</td><td>Node operators and miners choosing which software to run</td></tr>
</tbody>
</table>
<p>The last two layers are why polls are advisory. ZIP 1016 says so directly: "Nothing forces developers of Zcash consensus node software to implement any particular proposal. The aim of a process specification like this one is only to indicate social consensus." ZIP 200 calls Zcash a "consensual currency": nobody can be forced to run a particular implementation or follow a particular branch.</p>

<h2>The signalling tools</h2>
<ul>
<li><strong>Zcash Community Forum.</strong> ZIP 0 names it as the place to float an idea and to collect comments; editors use the forum and pull-request threads to judge rough consensus. New drafts are also announced in the <code>#zips</code> channel of the Zcash R&amp;D Discord.</li>
<li><strong>ZCAP.</strong> A panel of community members assembled by the Zcash Foundation. It elects the Zcash Community Grants committee and is polled on questions such as upgrade scope. The Foundation periodically invites new volunteers; its June 2026 call listed contributors of software to Zcash projects among those eligible.</li>
<li><strong>Coinholder voting.</strong> Holders vote in proportion to their ZEC. ZIP 1016 makes this binding in one place only — grants from the Coinholder-Controlled Fund, which need 420,000 ZEC voted and a simple majority. Elsewhere it is a sentiment poll.</li>
<li><strong>Arborist calls.</strong> Open protocol-development meetings hosted by the Zcash Foundation every two weeks at 15:00 UTC, covering upgrade logistics, node implementation issues and research. Minutes and recordings are public.</li>
</ul>

<h2>Worked example: deciding NU7's scope</h2>
<p>In August 2026 a forum thread announced a coinholder vote on five questions about NU7, among them whether to move to 25-second blocks, whether to keep halvings, and when to disable version 4 transactions. The mechanics were:</p>
<ul>
<li>A snapshot at block height 3,459,350; voting from 25 August to 14 September.</li>
<li>Eligibility: spendable shielded funds in the Ironwood pool at the snapshot. Voters used wallets that supported the dedicated voting system, with Zodl and Vizor named.</li>
<li>Organisers asked for at least 1,000,000 ZEC to take part for the result to be considered representative.</li>
<li>The Zcash Foundation polled ZCAP on the same questions at the same time.</li>
</ul>
<p>According to the results thread, about 2.4 million of roughly 3.6 million eligible ZEC voted, and 135 of 198 ZCAP members responded. The two polls agreed on faster blocks, on disabling version 4 transactions and on shipping promptly. They did not agree on everything: ZIP 259 records that "the polls did not reach a shared majority position on when NSM reissuance should begin", and its text sets out the choice the implementing teams made.</p>
<blockquote>Follow the whole path: questions on the forum, two polls, then a draft deployment ZIP (ZIP 259) whose Rationale cites the results. On Mainnet, NU7 still needed an activation height in early October 2026.</blockquote>

<h2>The organisations, and the 2026 split</h2>
<p>For most of Zcash's history two bodies led development: Electric Coin Company (ECC), which launched Zcash in 2016 and was later owned by a nonprofit called Bootstrap, and the independent Zcash Foundation.</p>
<p>In January 2026 ECC's engineering and product team resigned after a governance dispute with Bootstrap's board. A later draft ZIP summarises both positions: the team held that changes to their terms of employment amounted to a constructive discharge; Bootstrap held that the dispute concerned its obligations as a tax-exempt charity and its directors' fiduciary duties. The team formed <strong>Zcash Open Development Lab (ZODL)</strong>, which raised $25 million in seed funding in March 2026, and the Zashi wallet became <strong>Zodl</strong>. The two sides later reached an agreement resolving the dispute. The network ran normally throughout.</p>
<p>Today work is spread across the Zcash Foundation, ZODL, Shielded Labs, Zingo Labs, Project Tachyon, Valar Group, the grant bodies and community groups such as ZecHub. Lesson l-01-14 maps who maintains what.</p>

<h2>Try it</h2>
<ol>
<li>Open ZIP 259 and read its Motivation and Rationale. Which poll question was left unresolved, and what did the ZIP do about it?</li>
<li>Open the latest entry in the <a href="https://github.com/ZcashCommunityGrants/arboretum-notes">Arborist call notes repository</a>. Write down one decision or open question, and name the layer from the table above that it belongs to.</li>
<li>Find one current forum thread about a draft ZIP. Who are the Owners, and is anyone objecting?</li>
</ol>

<h2>Key takeaways</h2>
<ul>
<li>Zcash decisions pass through four layers: specify (ZIPs), signal (forum, ZCAP, coinholders), ship (implementers) and run (node operators and miners).</li>
<li>Polls indicate social consensus; they do not compel anyone to write or run code. Coinholder votes bind only Coinholder-Controlled Fund grants.</li>
<li>The January 2026 ECC–Bootstrap dispute reorganised teams, not the protocol; the former ECC team is now ZODL.</li>
<li>The forum, the Zcash R&amp;D Discord and the Arborist calls are open to you from day one.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zips.z.cash/zip-0000">ZIP 0: ZIP Process</a></li>
<li><a href="https://zips.z.cash/zip-1016">ZIP 1016: Community and Coinholder Funding Model</a></li>
<li><a href="https://zips.z.cash/zip-0259">ZIP 259: Deployment of the NU7 Network Upgrade (draft)</a></li>
<li><a href="https://forum.zcashcommunity.com/t/nu7-coinholder-vote/56912">Zcash Community Forum: NU7 Coinholder Vote</a></li>
<li><a href="https://forum.zcashcommunity.com/t/nu7-sentiment-polls-results/57590">Zcash Community Forum: NU7 Sentiment Polls Results</a></li>
<li><a href="https://zfnd.org/arborist-calls/">Zcash Foundation: Arborist Calls</a></li>
</ul>`,
  },
  "l-01-11": {
    title: "Zcash Full Nodes: Zebra & the Z3 Stack",
    subtitle: "Explain what Zebra, Zallet and Zaino are each responsible for, why the old single program was split, and where keys live.",
    content: `<p>A <strong>full node</strong> downloads every block, checks every consensus rule itself and relays what it accepts to its peers. Everything else in Zcash — wallets, explorers, payment services — ultimately gets its view of the chain from one. Until 2026 "the Zcash node" meant a single program that also contained a wallet and its own indexes. Today that job is split across three programs, and knowing which one does what tells you where to look when something breaks and where your users' secrets are.</p>
<p>This lesson is the map. You will install and run the stack in Stage 03; nothing here needs a terminal.</p>

<h2>From one program to three</h2>
<p>Zcash launched with <code>zcashd</code>, a C++ fork of Bitcoin Core. One process validated blocks, spoke to the peer-to-peer network, held wallet keys and answered every RPC query. It reached its end-of-support halt on 18 July 2026 at Mainnet height 3,417,100 and does not support NU6.3, so it is history: do not follow guides that tell you to run it.</p>
<p>The zcashd documentation gives two reasons for retiring that design. The codebase was large, written in a language without memory safety, and had drifted far from the upstream Bitcoin code whose fixes it needed. And binding wallet state to the consensus node added complexity and "poses risks to user funds as any exploit of the consensus node could potentially result in compromise of the wallet as well". The Zaino project makes the matching argument for indexing: taking it out of the validator gives a smaller codebase and "a clear trust boundary".</p>

<h2>Who does what</h2>
<table>
<thead><tr><th>Program</th><th>Maintained by</th><th>Responsible for</th><th>Holds spending keys?</th></tr></thead>
<tbody>
<tr><td><strong>Zebra</strong> (<code>zebrad</code>)</td><td>Zcash Foundation</td><td>Consensus validation, peer-to-peer networking, chain state, mempool, a JSON-RPC interface</td><td>No — it has no wallet</td></tr>
<tr><td><strong>Zallet</strong></td><td>The <code>zcash/zallet</code> repository</td><td>The full-node wallet: seeds, accounts, addresses, building and sending transactions, its own JSON-RPC interface</td><td>Yes</td></tr>
<tr><td><strong>Zaino</strong> (<code>zainod</code>)</td><td>Zingo Labs</td><td>Indexing: serving light wallets over gRPC and explorers over a JSON-RPC subset, reading from Zebra</td><td>No</td></tr>
</tbody>
</table>
<p>All three are written in Rust. Zallet is in beta: its README warns that breaking changes "may occur at any time, requiring you to delete and recreate your Zallet wallet", and that many JSON-RPC methods from zcashd are not yet implemented. Zaino is pre-1.0 as well. Treat version numbers you see in tutorials as snapshots and check each project's releases page.</p>

<h2>Zebra in a little more depth</h2>
<p>Zebra's design overview contrasts it with zcashd's "monolithic architecture": Zebra is "modular, library-first", built from crates that can be reused on their own.</p>
<ul>
<li><code>zebra-chain</code> — core data structures (blocks, transactions, addresses) and their consensus-critical serialisation.</li>
<li><code>zebra-network</code> — the peer-to-peer protocol inherited from Bitcoin.</li>
<li><code>zebra-consensus</code> — checks that need no chain context: signatures, proofs, scripts.</li>
<li><code>zebra-state</code> — stores the chain and checks rules that depend on it, such as whether a nullifier has already been used.</li>
<li><code>zebrad</code> — the node binary that wires these together.</li>
</ul>
<p>Operational facts worth remembering: Zebra's peer-to-peer port is 8233 on Mainnet and 18233 on Testnet; its JSON-RPC port is 8232 and 18232. It can expose <code>/healthy</code> and <code>/ready</code> HTTP endpoints so other services can wait until it has caught up. Each Zebra release stops running at a built-in end-of-support height, so a node has to be kept upgraded. As of October 2026 the stable line is 6.4.x, and 7.0.0-rc.0 is a release candidate for NU7 on Testnet.</p>
<blockquote>Zebra keeps a copy of the whole chain state, so it "isn't intended for lightweight applications like light wallets". That is the job of an indexer and the light client protocol — the next two lessons.</blockquote>

<h2>Z3: the stack in one place</h2>
<p><strong>Z3</strong> is the Zcash Foundation's Docker Compose packaging of the stack. It runs Zebra and Zallet together, with Zaino as an opt-in extra behind a Compose profile called <code>indexer</code>, on any of three networks:</p>
<table>
<thead><tr><th>Network</th><th>Use</th><th>First sync</th></tr></thead>
<tbody>
<tr><td>Mainnet</td><td>The real chain; roughly 300 GB of chain state</td><td>24–72 hours</td></tr>
<tr><td>Testnet</td><td>Public test network with valueless coins</td><td>2–12 hours</td></tr>
<tr><td>Regtest</td><td>A private chain on your machine; blocks mined on demand, no peers</td><td>Seconds</td></tr>
</tbody>
</table>
<p>Two details of the wiring matter. First, Zallet does not go through the standalone Zaino service: it embeds Zaino's indexer libraries and talks straight to Zebra's JSON-RPC. The standalone Zaino exists for <em>other people's</em> clients — mobile wallets, explorers, your own scanner. Second, on Mainnet and Testnet the wallet cannot serve anything until Zebra has synchronised, so the stack starts in two phases.</p>
<p>Zebra is not the only node. <strong>Zakura</strong>, forked from Zebra and developed by Valar Group with Project Tachyon, follows the same consensus rules. This programme teaches Zebra.</p>

<h2>Where the secrets are</h2>
<p>The split gives you a simple rule. Zebra and Zaino handle only public chain data: an attacker who takes one over can lie to its clients or stop serving them, but finds no keys. Zallet holds spending keys, so it is the machine to isolate and back up.</p>
<p>There is a useful middle position, and it is what you build in this week's lab: a service that holds a <strong>viewing key</strong> only. It can detect and read payments but cannot spend, so a break-in leaks history, not funds.</p>

<h2>Try it</h2>
<p>A paper exercise, about fifteen minutes. Draw four boxes: Zebra, Zaino, Zallet, and "my watch-only login service".</p>
<ol>
<li>In each box write what secret material it stores: none, a viewing key, or spending keys.</li>
<li>For each box, answer: if an attacker controls this machine, can they (a) steal funds, (b) read past payments and memos, (c) feed false chain data to something downstream?</li>
<li>Draw the arrows: who connects to whom, and over which interface (peer-to-peer, JSON-RPC or gRPC)?</li>
<li>Decide which boxes your login service could safely rent from someone else, and which you would insist on running yourself. Keep the drawing — the next two lessons refine it.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
<li>zcashd halted in July 2026. The stack is now Zebra (consensus), Zallet (full-node wallet, beta) and Zaino (indexer).</li>
<li>Zebra has no wallet by design; separating keys from the consensus node limits what a node compromise can cost.</li>
<li>Z3 packages the stack with Docker Compose for Mainnet, Testnet and a local regtest network; Zaino is an opt-in profile.</li>
<li>Only Zallet holds spending keys. A watch-only service holds a viewing key and can read but not spend.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zebra.zfnd.org/">The Zebra Book</a></li>
<li><a href="https://github.com/ZcashFoundation/z3">Z3: a Zcash node platform (README and docs)</a></li>
<li><a href="https://zcash.github.io/zallet/">The Zallet Book</a></li>
<li><a href="https://github.com/zingolabs/zaino">Zaino repository and README</a></li>
<li><a href="https://zcash.github.io/zcash/user/end-of-life.html">The zcashd Book: End of Life</a></li>
</ul>`,
  },
  "l-01-12": {
    title: "Indexing with Zaino",
    subtitle: "Explain what an indexer adds to a full node, what Zaino serves and to whom, and what it can and cannot know about shielded payments.",
    content: `<p>A full node is organised around one question: is this block valid? Applications ask different questions. What is the chain tip? Give me everything since block 3,400,000 in a form a phone can download. What is this transparent address's balance? Send this transaction for me. An <strong>indexer</strong> sits between the node and the applications, keeps chain data in shapes that make those questions cheap, and serves the answers over stable APIs.</p>
<p><strong>Zaino</strong>, written in Rust by Zingo Labs, is the indexer this programme uses. This lesson explains its role and its limits. You will run it and call it in Stage 03.</p>

<h2>Why Zebra does not do this itself</h2>
<p>In the zcashd era, clients were served from two places: light wallets from <code>lightwalletd</code>, a separate Go service, and "full" wallets and block explorers directly from the node's RPC. Zebra deliberately does less — it validates, and leaves client-facing indexes to a separate process. Zaino's README gives the reasons: removing indexing from the validator leads to "a smaller and more maintainable codebase", and separating the two creates "a clear trust boundary between the Indexer and Validator".</p>
<p>Zaino's stated goal is "to serve all non-miner clients", wallets and block explorers among them, "in a manner that prioritizes security and privacy". To make migration easy it is designed, where possible, to be backward compatible with lightwalletd and with the old node's RPC.</p>
<blockquote>lightwalletd is still maintained, and the Zebra Book documents running it against Zebra. Zaino implements the same gRPC service, so a client written for one works with the other.</blockquote>

<h2>Two interfaces</h2>
<table>
<thead><tr><th>Interface</th><th>For</th><th>What it offers</th></tr></thead>
<tbody>
<tr><td>gRPC, the <code>CompactTxStreamer</code> service</td><td>Light wallets and scanners</td><td>Compact blocks, full transactions by id, transaction submission, mempool streams, note commitment tree state, transparent address balances and UTXOs</td></tr>
<tr><td>JSON-RPC</td><td>Block explorers and full-node-style clients</td><td>A subset of the Zcash RPC methods that non-mining clients need; the current list is in Zaino's RPC documentation</td></tr>
</tbody>
</table>
<p>The two have different security postures, and Zaino enforces them at start-up. The gRPC server may listen on a public address only when TLS is configured. The JSON-RPC server has no transport encryption at all, so by default it refuses to bind to anything but loopback or private addresses. In the Z3 stack, Zaino's gRPC port is 8137 on Mainnet, 18137 on Testnet and 28137 on regtest, served without TLS; the Z3 documentation tells operators to put a TLS-terminating reverse proxy in front before exposing it beyond the host.</p>

<h2>Where its data comes from</h2>
<p>Zaino holds no independent copy of consensus. It reads from a Zebra node — over Zebra's JSON-RPC, or through Zebra's read-state interface when both run on the same machine — and builds its own database on top. On first launch it synchronises a cache of compact blocks from the validator. Its documentation warns that this "can be a very slow process the first time" and that Zaino is not usable until the sync completes.</p>
<p>Internally it distinguishes the <em>finalised</em> chain, kept in an on-disk database, from the recent, still-reorganisable chain head, kept in memory, and it tracks the mempool separately. Zaino is under heavy development and its internal crates are being restructured, so treat any architecture diagram as a snapshot.</p>

<h2>What "indexing shielded transactions" can mean</h2>
<p>This is the idea to take away. For <strong>transparent</strong> activity an indexer can do what a Bitcoin explorer does: addresses and amounts are public, so it can build an address-to-transactions index and answer "what did this address receive?".</p>
<p>For <strong>shielded</strong> activity it cannot. The recipient and amount of a shielded output are encrypted to the recipient's keys, and Zaino has no viewing keys. It cannot answer "which payments belong to this shielded address?" for anyone. What it can do is repackage the public parts of every shielded transaction — note commitments, nullifiers, ephemeral keys and a short prefix of each ciphertext — into <strong>compact blocks</strong>, and hand the same stream to every client. Each client then finds its own payments locally with its own keys. The next lesson shows how.</p>
<table>
<thead><tr><th>Question</th><th>Can Zaino answer it?</th></tr></thead>
<tbody>
<tr><td>Balance and history of a transparent address</td><td>Yes — the data is public</td></tr>
<tr><td>Value moving between pools in a transaction</td><td>Yes — value balances are public fields</td></tr>
<tr><td>Which shielded outputs belong to a given address</td><td>No — only a holder of the right viewing key can tell</td></tr>
<tr><td>The memo on a shielded payment</td><td>No — it can serve the encrypted transaction, not read it</td></tr>
</tbody>
</table>

<h2>The indexer still sees its clients</h2>
<p>Not being able to read the chain's secrets is different from learning nothing. Whoever operates an indexer sees each client's IP address, when it connects, which block ranges and transactions it asks for, any transparent addresses it queries, and the transactions it submits. Zaino's README is direct about this: because of these potential leaks "there is a need to use anonymous transport protocols (such as Nym or Tor) to obfuscate clients' identities from Zcash's indexing servers". It lists a Nym-based backend among planned work. Until such transports are routine, the strongest option is the one Z3 makes practical: run your own Zebra and Zaino.</p>

<h2>Try it</h2>
<p>Use the wallet you installed last week, and your drawing from the previous lesson.</p>
<ol>
<li>Find the wallet's server setting — usually under advanced or network settings. Which server does it synchronise from, and who operates it?</li>
<li>List three things that operator can observe about you, and three things it cannot.</li>
<li>Your lab service will watch for incoming shielded payments. Write the three or four questions it must ask an indexer (for example, "what is the tip?"). For each, note whether the indexer needs any secret from you to answer. It should not.</li>
<li>Add the indexer to your drawing and mark whether you would run it yourself for a real deployment, and why.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
<li>An indexer turns a validator's chain data into the shapes clients need; Zaino does this for Zebra, over gRPC for light clients and JSON-RPC for explorers.</li>
<li>Zaino is API-compatible with lightwalletd, which is still maintained and widely deployed.</li>
<li>Indexers can index transparent data but cannot attribute shielded payments: they hold no viewing keys and serve the same compact blocks to everyone.</li>
<li>The operator still sees client metadata — IP address, timing, requests — so use an anonymising transport or run your own.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://github.com/zingolabs/zaino">Zaino repository: README, docs/rpc_api.md, docs/use_cases.md</a></li>
<li><a href="https://github.com/ZcashFoundation/z3">Z3: README and docs/integrations/lightwalletd-client.md</a></li>
<li><a href="https://github.com/zcash/lightwalletd">lightwalletd</a></li>
<li><a href="https://zcash.readthedocs.io/en/latest/rtd_pages/wallet_threat_model.html">Zcash wallet app threat model</a></li>
<li><a href="https://zechub.wiki/zcash-tech/lightwallet-nodes">ZecHub: Zcash Lightwallet Nodes</a></li>
</ul>`,
  },
  "l-01-13": {
    title: "Light Client Protocol",
    subtitle: "Explain how a wallet finds its shielded payments in compact blocks, name the real gRPC methods, and say what each reveals to a server.",
    content: `<p>A phone cannot hold roughly 300 GB of chain state, yet a shielded wallet cannot simply ask a server "what is my balance?" — the server cannot see it. The <strong>light client protocol</strong> resolves this: the server sends every client the same stripped-down copy of each block, and each client searches it locally with its own keys. Mobile Zcash wallets work this way, and so will the watch-only service you build in this week's lab.</p>

<h2>Three parts and one security goal</h2>
<p>ZIP 307 describes three components: a <strong>Zcash node</strong> that provides chain state, a <strong>proxy server</strong> that extracts and serves block data in a lower-bandwidth format (today lightwalletd or Zaino), and the <strong>light client</strong>. Its stated goal is <em>payment detection privacy</em>: "the proxy should not learn which transactions … are addressed to a given light wallet". The server is assumed to be "honest but curious" — trusted to give a correct view of the chain, not trusted with secrets.</p>
<p>ZIP 307 is still a Draft and was written for Sapling. The interface wallets really use is the gRPC definition in the <code>zcash/lightwallet-protocol</code> repository, which added Ironwood fields in version 0.5.0 (June 2026).</p>

<h2>Compact blocks</h2>
<p>A full Sapling output carries a 580-byte ciphertext, most of it the 512-byte memo. To <em>detect</em> a payment the wallet needs far less, so a compact block keeps only:</p>
<table>
<thead><tr><th>From each…</th><th>Kept</th><th>Used for</th></tr></thead>
<tbody>
<tr><td>Sapling output</td><td>Note commitment <code>cmu</code>, ephemeral key, first 52 bytes of ciphertext — 116 bytes</td><td>Detecting incoming notes; updating the commitment tree</td></tr>
<tr><td>Sapling spend</td><td>The 32-byte nullifier, out of 384 bytes</td><td>Detecting that one of your notes was spent</td></tr>
<tr><td>Orchard-protocol action (Orchard and Ironwood pools)</td><td>Nullifier, commitment <code>cmx</code>, ephemeral key, first 52 bytes of ciphertext</td><td>Both of the above</td></tr>
</tbody>
</table>
<p>In the protobuf definition a <code>CompactTx</code> has separate lists for Sapling <code>spends</code> and <code>outputs</code>, Orchard <code>actions</code> and <code>ironwoodActions</code>. Memos, proofs and signatures are left out.</p>

<h2>Trial decryption</h2>
<p>With a compact block in hand, the wallet tries its <strong>incoming viewing key</strong> against every output. Almost all attempts fail, because those outputs belong to other people. When one succeeds, the 52 bytes yield the note's value and the data needed to spend it. Because the compact form drops the ciphertext's authentication tag, the wallet recomputes the note commitment from what it decrypted and accepts the note only if it matches the commitment in the block.</p>
<pre><code>// Illustrative pseudocode — not a real API
for block in GetBlockRange(lastSynced, tip):
    for tx in block.vtx:
        for out in tx.outputs + tx.actions + tx.ironwoodActions:
            note = tryDecrypt(incomingViewingKey, out.ephemeralKey, out.ciphertext)
            if note and commitment(note) == out.commitment:
                remember(note, tx.txid)        // a payment to us
        for nf in nullifiersOf(tx):
            if nf in myUnspentNotes: markSpent(nf)
        appendCommitmentsToLocalTree(tx)       // keeps spend witnesses current</code></pre>
<p>Two consequences for builders. Scanning costs CPU on the client, in proportion to chain activity rather than to your own activity. And a wallet restored from a seed or viewing key needs a <strong>birthday height</strong> — the block to start scanning from — or it must scan years of blocks it cannot possibly have payments in.</p>

<h2>The service</h2>
<p>The gRPC service is <code>CompactTxStreamer</code> in package <code>cash.z.wallet.sdk.rpc</code>. These are its methods as of October 2026:</p>
<table>
<thead><tr><th>Purpose</th><th>Methods</th></tr></thead>
<tbody>
<tr><td>Server and chain tip</td><td><code>GetLightdInfo</code>, <code>GetLatestBlock</code></td></tr>
<tr><td>Compact blocks</td><td><code>GetBlock</code>, <code>GetBlockRange</code> (deprecated: <code>GetBlockNullifiers</code>, <code>GetBlockRangeNullifiers</code>)</td></tr>
<tr><td>Full transactions</td><td><code>GetTransaction</code>, <code>SendTransaction</code></td></tr>
<tr><td>Mempool</td><td><code>GetMempoolTx</code>, <code>GetMempoolStream</code></td></tr>
<tr><td>Note commitment trees</td><td><code>GetTreeState</code>, <code>GetLatestTreeState</code>, <code>GetSubtreeRoots</code></td></tr>
<tr><td>Transparent addresses</td><td><code>GetTaddressTransactions</code> (replaces the deprecated <code>GetTaddressTxids</code>), <code>GetTaddressBalance</code>, <code>GetTaddressBalanceStream</code>, <code>GetAddressUtxos</code>, <code>GetAddressUtxosStream</code></td></tr>
<tr><td>Testing only</td><td><code>Ping</code></td></tr>
</tbody>
</table>
<p>A typical session: call <code>GetLatestBlock</code>, stream <code>GetBlockRange</code> from where you stopped to the tip, scan, repeat. <code>GetBlockRange</code> returns shielded data for Sapling, Orchard and Ironwood by default; a <code>poolTypes</code> field lets a client ask for specific pools.</p>

<h2>What the server learns</h2>
<p>Compact-block scanning behaves like a broadcast: everyone downloads the same thing, so ZIP 307 says it "leaks no information about which transactions the light client is interested in". The leaks are at the edges.</p>
<table>
<thead><tr><th>Action</th><th>What the server can learn</th></tr></thead>
<tbody>
<tr><td>Connecting at all</td><td>Your IP address and when you are active</td></tr>
<tr><td><code>GetBlockRange(X, tip)</code></td><td>The height you last synchronised to. ZIP 307 proposes rounding the start height into buckets; it marks that as not implemented</td></tr>
<tr><td><code>GetTransaction(txid)</code></td><td>That you care about this transaction. It is how a client reads a <strong>memo</strong>, which is not in the compact block</td></tr>
<tr><td>Transparent address methods</td><td>The addresses themselves</td></tr>
<tr><td><code>SendTransaction</code></td><td>Which connection a new transaction came from</td></tr>
</tbody>
</table>
<p>ZIP 307 says a client fetching full transactions "SHOULD obscure the exact transactions of interest by downloading numerous uninteresting transactions as well", and must tell the user that doing so reduces privacy. The other mitigations are the ones from the last lesson: an anonymising transport such as Tor, or your own server.</p>
<blockquote>Your lab service reads memos, so it will call <code>GetTransaction</code> for every payment it detects. Against someone else's server, that hands the operator a list of your incoming transactions. Decide now whose server it will use.</blockquote>

<h2>Try it</h2>
<ol>
<li><strong>Trace it on paper.</strong> Your service holds a viewing key and a birthday height B. Write the sequence of method calls for (a) first start-up, (b) each new block, and (c) reading the memo of a detected payment. Beside each call, write what the server learns.</li>
<li><strong>Handle a real viewing key.</strong> In a wallet that supports it — ZecHub's wallet list shows which do — find the option to show or export a viewing key. A Mainnet Unified Full Viewing Key begins with <code>uview</code>. Note where the wallet shows its birthday height, if it does.</li>
<li><strong>Classify it.</strong> A full viewing key reveals the account's incoming and outgoing payments but cannot spend. Write down two places you would never paste it, and one party you might legitimately give it to.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
<li>Light clients download compact blocks — commitments, nullifiers, ephemeral keys and 52-byte ciphertext prefixes — and trial-decrypt them locally.</li>
<li>The server gives every client the same block stream and never holds a viewing key, so it cannot tell which outputs are yours from scanning alone.</li>
<li><code>CompactTxStreamer</code> is the real interface; lightwalletd and Zaino both implement it, and its definition now carries Ironwood data.</li>
<li>Fetching full transactions (for memos), querying transparent addresses and your IP address are where privacy leaks.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://zips.z.cash/zip-0307">ZIP 307: Light Client Protocol for Payment Detection (draft)</a></li>
<li><a href="https://github.com/zcash/lightwallet-protocol">zcash/lightwallet-protocol: service.proto and compact_formats.proto</a></li>
<li><a href="https://github.com/zingolabs/zaino">Zaino: docs/rpc_api.md</a></li>
<li><a href="https://zips.z.cash/zip-0316">ZIP 316: Unified Addresses and Unified Viewing Keys</a></li>
<li><a href="https://zechub.wiki/using-zcash/wallets">ZecHub: Wallets</a></li>
</ul>`,
  },
  "l-01-14": {
    title: "Zcash Ecosystem Map",
    subtitle: "Know who maintains each piece of the Zcash stack, which wallets to test against, and where to ask when you are stuck.",
    content: `<p>You now know the pieces: ZIPs, funding, governance, nodes, indexers and light clients. This lesson puts names on them. When your code fails against a library, or a wallet rejects your payment request, the fastest fix is knowing whose project it is and where its maintainers talk. Everything below is a snapshot from early October 2026 — the 2026 reorganisation showed how quickly this map can change, so follow the links before relying on any row.</p>

<h2>Who maintains what</h2>
<table>
<thead><tr><th>Layer</th><th>Project</th><th>Maintained by</th></tr></thead>
<tbody>
<tr><td>Specification</td><td>Protocol Specification and ZIPs (<code>zcash/zips</code>)</td><td>ZIP Owners and the ZIP Editors</td></tr>
<tr><td>Consensus node</td><td>Zebra; Z3, the Docker Compose stack</td><td>Zcash Foundation</td></tr>
<tr><td>Alternative node</td><td>Zakura</td><td>Valar Group with Project Tachyon</td></tr>
<tr><td>Full-node wallet</td><td>Zallet (beta)</td><td><code>zcash/zallet</code> repository</td></tr>
<tr><td>Indexer / light-client server</td><td>Zaino; lightwalletd</td><td>Zingo Labs; <code>zcash/lightwalletd</code> repository</td></tr>
<tr><td>Rust wallet libraries</td><td><code>librustzcash</code> crates</td><td><code>zcash/librustzcash</code> repository; ZODL maintains core protocol libraries</td></tr>
<tr><td>Browser library</td><td>WebZjs</td><td>ChainSafe</td></tr>
<tr><td>Developer command-line tools</td><td><code>zcash-devtool</code>; <code>zingo-cli</code></td><td><code>zcash/zcash-devtool</code> repository; Zingo Labs</td></tr>
<tr><td>Threshold signatures</td><td>FROST</td><td>Zcash Foundation</td></tr>
<tr><td>Research</td><td>Crosslink, Network Sustainability Mechanism; Tachyon</td><td>Shielded Labs; Project Tachyon with Valar Group</td></tr>
</tbody>
</table>
<p>Two cautions. <code>zcash-devtool</code> describes itself as "built by developers, for developers" and not production-ready. And research is not deployment: neither Crosslink nor Tachyon is live on Mainnet.</p>

<h2>Wallets to test against</h2>
<p>If you build anything that sends, requests or displays ZEC, test it with wallets from more than one team. ZecHub's wallet list tracks platforms, features and Ironwood readiness; these entries were marked "Ironwood: Ready" in early October 2026.</p>
<table>
<thead><tr><th>Wallet</th><th>From</th><th>Why test with it</th></tr></thead>
<tbody>
<tr><td>Zodl (formerly Zashi)</td><td>ZODL</td><td>Android and iOS; supports viewing keys and hardware signing</td></tr>
<tr><td>Zingo!</td><td>Zingo Labs</td><td>Mobile and desktop; lists Testnet support</td></tr>
<tr><td>Zkool</td><td><code>hhanh00/zkool2</code></td><td>Lists Testnet support and FROST multisig; accepts view-only accounts from a viewing key</td></tr>
<tr><td>Vizor</td><td>vizor.cash</td><td>Desktop and mobile; lists Testnet support</td></tr>
<tr><td>Keystone</td><td>Keystone</td><td>Air-gapped hardware wallet</td></tr>
<tr><td>Zallet</td><td><code>zcash/zallet</code></td><td>Full-node wallet driven by JSON-RPC; beta</td></tr>
</tbody>
</table>
<blockquote>Not every wallet followed the network into Ironwood. ZecHub lists YWallet as "Ironwood: Not Ready". Check a wallet's status before telling users to pay you from it.</blockquote>

<h2>Organisations and money</h2>
<ul>
<li><strong>Zcash Foundation</strong> — nonprofit; Zebra, FROST, Z3; hosts the Arborist calls and runs ZCAP.</li>
<li><strong>ZODL</strong> — the company formed by the former Electric Coin Company team; core libraries and the Zodl wallet.</li>
<li><strong>Shielded Labs</strong> — donation-funded Swiss nonprofit; protocol research.</li>
<li><strong>Zingo Labs</strong> — Zaino, zingolib, the Zingo! wallet.</li>
<li><strong>Zcash Community Grants</strong> — committee-decided grants from 8% of the block subsidy, administered by the Financial Privacy Foundation. Applications are GitHub issues in its repository, discussed on the forum.</li>
<li><strong>Coinholder-Controlled Fund</strong> — grants decided by coinholder vote (lesson l-01-09).</li>
<li><strong>ZecHub</strong> — community education: wiki, guides, newsletter. <strong>Obscura Labs</strong> — Nigeria-registered, focused on Africa and emerging markets.</li>
</ul>

<h2>Where to ask</h2>
<table>
<thead><tr><th>You have…</th><th>Go to</th></tr></thead>
<tbody>
<tr><td>A bug or question about one project</td><td>That repository's GitHub issues</td></tr>
<tr><td>A protocol, ZIP or wallet-development question</td><td>The Zcash R&amp;D Discord — <code>#zips</code> for ZIPs, <code>#wallet-dev</code> for Zallet</td></tr>
<tr><td>A Zebra operations question</td><td>The Zcash Foundation Discord, "zebra-support" channel</td></tr>
<tr><td>A proposal, grant idea or governance question</td><td>The Zcash Community Forum</td></tr>
<tr><td>A suspected vulnerability</td><td>The project's security policy — never a public issue</td></tr>
</tbody>
</table>
<p>For a directory of exchanges, payment tools, explorers and public light-client endpoints, start from the ecosystem page on z.cash.</p>

<h2>Try it</h2>
<p>Write a one-page map for the service you will build in this week's lab.</p>
<ol>
<li>Which node and indexer will it use, and who operates them — you, or a public endpoint?</li>
<li>Which library or tool will hold the viewing key and scan? Find its repository and its issue tracker.</li>
<li>Which two wallets, from different teams, will you send test payments from? Confirm each is Ironwood-ready today.</li>
<li>Which ZIPs govern what you are building? Start with ZIP 302, ZIP 307, ZIP 315 and ZIP 316.</li>
<li>Where would you ask if scanning found nothing? Name the channel.</li>
</ol>

<h2>Key takeaways</h2>
<ul>
<li>The stack is maintained by several independent teams; know which repository owns the piece you depend on.</li>
<li>Test against wallets from more than one team, and check Ironwood readiness first.</li>
<li>Issues go to the project's tracker, design questions to the R&amp;D Discord or forum, vulnerabilities to the security contact.</li>
<li>This map is dated October 2026 — re-check it before you ship.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
<li><a href="https://z.cash/ecosystem/">z.cash: Ecosystem directory</a></li>
<li><a href="https://zechub.wiki/using-zcash/wallets">ZecHub: Wallets</a></li>
<li><a href="https://zechub.wiki/zcash-organizations/zodl">ZecHub: ZODL, and the other organisation pages beside it</a></li>
<li><a href="https://zcashcommunitygrants.org/">Zcash Community Grants</a></li>
<li><a href="https://github.com/zcash/librustzcash">zcash/librustzcash</a></li>
<li><a href="https://forum.zcashcommunity.com/">Zcash Community Forum</a></li>
</ul>`,
  },
}
