// AUTO-GENERATED from scratchpad lesson fragments. Do not edit by hand.
// Each entry: lesson id -> { title, subtitle, content (HTML) }.
import type { LessonContent } from './types'

export const M_s03_w8: Record<string, LessonContent> = {
  "l-03-08": {
    title: "Zcash Community Grants (ZCG) \u2014 Funding Your Project",
    subtitle: "Explain where ZCG money comes from, who decides, what happens after you apply, and which other funding routes exist.",
    content: `<p>Zcash pays for part of its own development out of the block subsidy, and a share of that money is reserved for independent teams. Zcash Community Grants (ZCG) is the programme that hands it out. If the payment gateway or tooling you built in this programme deserves more than your spare evenings, this is the first place to look.</p>
<p>This lesson covers how ZCG works as of October 2026: the source of the funds, the committee, the review process, what the committee looks for, and the other routes that exist beside it. The next lesson covers writing the application itself.</p>

<h2>Where the money comes from</h2>
<p>You met the funding split in Week 4: miners receive 80% of the block subsidy and 20% goes to ecosystem funding. <a href="https://zips.z.cash/zip-1016">ZIP 1016</a>, in force since NU6.1 in November 2025, divides that 20% in two. A funding stream of <strong>8% of the block subsidy</strong> goes to ZCG, and 12% goes to the Coinholder-Controlled Fund described below. With the subsidy at 1.5625 ZEC per block, the ZCG stream is 0.125 ZEC per block. Both streams run until Zcash's third halving (expected around 2028).</p>
<p>ZCG is a committee, not a company, so it cannot hold funds itself. <a href="https://zips.z.cash/zip-1015">ZIP 1015</a> says the funds "SHALL be received and administered by the Financial Privacy Foundation (FPF)", a non-profit incorporated in the Cayman Islands. FPF may spend the money only on grants and on expenses reasonably related to running the programme. The committee's funding decisions are final, and FPF can veto one only if it would break Cayman law or FPF's reporting obligations.</p>

<h2>Who decides</h2>
<p>Grants are approved by a <strong>five-seat committee</strong>. ZIP 1015 sets the rules: members serve one-year terms and may stand again, elections are staggered so the whole committee never changes at once, and members must recuse themselves from votes where they have a financial interest. Members are elected by the Zcash Community Advisory Panel (ZCAP) using approval voting.</p>
<p>As of the committee's August 2026 minutes the members were Artkor, Zerodartz, Paul Brigner, Hanh and GGuy. Membership changes with each election, so check the <a href="https://zcashcommunitygrants.org/committee/">committee page</a> for the current list. An approval needs a simple majority, three votes of five.</p>

<h2>What gets funded</h2>
<p>ZIP 1015 describes the purpose as funding "independent teams entering the Zcash ecosystem, to perform major ongoing development (or other work) for the public good of the Zcash ecosystem". It also gives the committee discretion over smaller projects that advance "the usability, security, privacy, and adoption of Zcash". The application form asks you to choose one of twelve categories: Security, Infrastructure, Community, Education, Non-Wallet Applications, Integration, Wallets, Research &amp; Development, Media, Zcash Protocol Extension, Dedicated Resource and Event Sponsorships.</p>
<p>Sizes vary widely, and the application form notes that the larger the request, the more diligence and the more milestones the committee will expect. Work funded by a grant is expected to be open source: the form's licence field states that the Grant Agreement requires the MIT licence unless you justify another in your technical approach. ZCG also publishes requests for proposals (RFPs) when it wants a specific piece of work done.</p>

<h2>What happens after you apply</h2>
<ol>
  <li><strong>Open a GitHub issue.</strong> Applications are submitted with the issue form in the <code>ZcashCommunityGrants/zcashcommunitygrants</code> repository. You can apply at any time.</li>
  <li><strong>Post it on the forum.</strong> You must link your issue in the Applications section of the Zcash Community Forum. The form states that the committee will not discuss or vote on an application without this.</li>
  <li><strong>Eligibility and community review.</strong> FPF checks the application for eligibility. The community has at least one week to comment.</li>
  <li><strong>Committee review.</strong> The committee meets every other week. It may consult outside experts and it looks at the outcomes of any grants you held before. FPF may ask you to adjust milestones or success measures.</li>
  <li><strong>Decision.</strong> The result is posted to your forum thread, and the reasoning appears in the meeting minutes, which are published on the forum.</li>
  <li><strong>Agreement and payment.</strong> You sign the Grant Agreement. For grants above $50,000, the people responsible must complete identity checks (KYC, "know your customer"), though they can remain pseudonymous to the public. Money is released as startup funding and then milestone by milestone, with a forum update required before each payout and monthly updates requested.</li>
</ol>

<h2>What the committee is looking for</h2>
<p>You can read the committee's priorities straight off the application form, because every field is a question it wants answered. The published minutes show how real decisions were reasoned, but the form already tells you where applications tend to be weak:</p>
<ul>
  <li><strong>Evidence of demand.</strong> The form asks for the problem, the solution and the users who will validate each milestone. A project with no identified users is hard to approve.</li>
  <li><strong>Alignment with maintainers.</strong> The required "Upstream Merge Opportunities" field asks, if you plan to fork or change core Zcash software, whether you have coordinated with the people who would have to merge it.</li>
  <li><strong>Not rebuilding what exists.</strong> The "Dependencies" and "Technical Approach" fields are where you show you reused existing components rather than starting from scratch.</li>
  <li><strong>Track record in proportion to scope.</strong> The team fields and "Previous Funding" let the committee weigh a request against what you have shipped before; security-critical work especially.</li>
</ul>
<blockquote>A decline is not permanent. The minutes record proposals that were declined, revised and resubmitted. Read the stated reason, answer it, and apply again.</blockquote>

<h2>Other funding routes in 2026</h2>
<table>
  <thead><tr><th>Route</th><th>What it is for</th><th>Who decides</th></tr></thead>
  <tbody>
    <tr><td>ZCG</td><td>Planned work, paid by milestone</td><td>The five-seat committee</td></tr>
    <tr><td>Coinholder-Controlled Fund (ZIP 1016)</td><td>The 12% stream plus the former lockbox, held in a multisig by Key-Holder Organizations</td><td>ZEC holders vote every three months. At least 420,000 ZEC must vote, with a simple majority in favour</td></tr>
    <tr><td>Coinholder-Directed Retroactive Grants</td><td>The programme that puts applications to those votes. It is retroactive only: the work "must already be fully completed and publicly verifiable" when you apply</td><td>Coinholders. FPF runs submissions and reporting</td></tr>
    <tr><td>ZecHub bounties</td><td>Smaller community contributions such as educational content and tooling</td><td>ZecHub</td></tr>
  </tbody>
</table>
<p>The retroactive programme runs quarterly until the third halving (around 2028). It rewards <strong>completed, publicly verifiable</strong> work only; anything still to be built belongs with ZCG instead. Proposals are submitted through a GitHub form in FPF's <code>ZcashCoinholderGrantsProgram</code> repository and mirrored in the forum's Retroactive Grants category. After review they go to a coinholder poll, with the same 420,000 ZEC quorum and simple majority as any ZIP 1016 vote, and the Key-Holder Organizations that hold the funds in multisig can veto on legal grounds or to prevent harm to users. Rounds are announced on the forum.</p>
<p>For a graduate the practical reading is this. A small bounty or a merged pull request builds the record. A ZCG grant funds the next thing you plan to build. A retroactive grant rewards something you have already shipped.</p>

<h2>Try it</h2>
<p>Open the ZCG grant-application issue form in the <code>ZcashCommunityGrants/zcashcommunitygrants</code> repository and read it top to bottom without filling anything in. List the required fields that you could not yet answer well for your own project — most likely the success metrics, the upstream merge plan, or the milestone acceptance criteria. Then decide which of the twelve categories your project belongs to, and whether it is planned work (apply to ZCG) or something you have already shipped (apply retroactively). Keep these notes for the next lesson, where you will draft the proposal itself.</p>

<h2>Key takeaways</h2>
<ul>
  <li>ZCG is funded by 8% of the block subsidy under ZIP 1016. FPF holds and administers the funds, and a five-seat committee selected by ZCAP decides.</li>
  <li>You apply with a GitHub issue and a forum post. The committee reviews every other week and approves by simple majority.</li>
  <li>Grants above $50,000 require KYC, and each milestone payout requires a forum update.</li>
  <li>Declines usually come down to demand, alignment with maintainers, duplication, track record or cost. The minutes say which.</li>
  <li>Coinholder votes fund completed work retroactively, and ZecHub bounties pay for small tasks.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/zip-1015">ZIP 1015: Block Subsidy Allocation for Non-Direct Development Funding</a> (ZCG rules and FPF's role)</li>
  <li><a href="https://zips.z.cash/zip-1016">ZIP 1016: Community and Coinholder Funding Model</a></li>
  <li><a href="https://zcashcommunitygrants.org/selection/">ZCG: Grant Process</a> and <a href="https://zcashcommunitygrants.org/committee/">Grant Committee</a></li>
  <li><a href="https://forum.zcashcommunity.com/c/grants/33">Zcash Community Forum: Community Grants category</a> (applications and meeting minutes)</li>
  <li><a href="https://github.com/Financial-Privacy-Foundation/ZcashCoinholderGrantsProgram">FPF: Coinholder-Directed Retroactive Grants Program</a> (application repository)</li>
  <li><a href="https://zechub.wiki/contribute/community-infrastructure">ZecHub: ways to contribute</a></li>
</ul>`,
  },
  "l-03-09": {
    title: "Writing a Grant Proposal",
    subtitle: "Turn a project idea into a ZCG application the committee can fund, section by section, from problem statement to milestones and budget.",
    content: `<p>In the last lesson you saw how Zcash Community Grants decides. This lesson is about the document itself: the grant application you submit as a GitHub issue in the <code>ZcashCommunityGrants/zcashcommunitygrants</code> repository. The form is long and every field is required for a reason. A proposal is not an essay about how much you care about privacy; it is a set of answers the committee and the community can check, and then hold you to.</p>
<p>The good news is that you have already done the hard part. The labs in this programme — the payment gateway, the node you deployed, the open-source pull request you are landing this week — are exactly the prior work a first-time applicant usually lacks. This lesson walks the form in order so that when you open it, you are filling in a plan you have already thought through.</p>

<h2>The shape of the form</h2>
<p>The application issue template is organised into these blocks, in this order:</p>
<ol>
  <li><strong>Terms and conditions.</strong> Check-boxes you must accept: the Grant Agreement, KYC if funded above $50,000, disclosure of conflicts of interest, the Code of Conduct, and a commitment that for new open-source software you will add a <code>CONTRIBUTING.md</code> following the <code>librustzcash</code> style guides.</li>
  <li><strong>Organisation details.</strong> Who is applying, and how you found ZCG.</li>
  <li><strong>Project overview.</strong> The amount requested in US dollars, and one of the twelve categories.</li>
  <li><strong>Team information.</strong> A project lead (name, role, background, responsibilities) and any other members.</li>
  <li><strong>Project details.</strong> Summary, description, proposed problem, proposed solution, solution format, dependencies, technical approach, upstream merge opportunities, and the open-source licence.</li>
  <li><strong>Budget.</strong> Hardware/software, service and compensation costs, each with a justification, plus previous and other funding.</li>
  <li><strong>Risk assessment.</strong> Implementation risks, potential side effects, and success metrics.</li>
  <li><strong>Project schedule.</strong> Startup funding and a list of milestones.</li>
  <li><strong>Supporting documents.</strong> Optional attachments or links.</li>
</ol>
<p>You do not have to write it inside GitHub. Draft it in a plain document first, get feedback, and paste it in when it is ready. Everything you write becomes public the moment the issue opens.</p>

<h2>Problem, solution, and showing demand</h2>
<p>The "Proposed Problem" and "Proposed Solution" fields are separate on purpose. State the problem first, as something that exists whether or not you build anything — a gap a real person hits. Then describe your solution as the answer to <em>that</em> problem, not as a feature list. The single most common weakness in applications is a solution looking for a problem.</p>
<p>Demand is what turns a plausible idea into a fundable one. The form's success metrics and the requirement that each milestone's deliverables be "validated and accepted by their intended users" both push you to name those users. If a specific team, wallet or merchant wants what you are proposing, say so, and if you can, link to where they asked. This is where your labs help: you can point to the thing you already built and the friction you hit building it.</p>

<h2>Technical approach and upstream merges</h2>
<p>The "Technical Approach" field is where you show you know the ecosystem as it is in 2026, not as your tutorials described it two years ago. Name the real components you will build on — Zebra for a node, Zaino for indexing, <code>librustzcash</code> crates or WebZjs for a wallet, Zallet for a full-node wallet — and be honest that several are pre-1.0. If your project depends on Ironwood support, say which libraries already have it.</p>
<p>The "Upstream Merge Opportunities" field is required even if you think it does not apply. If you plan to fork or modify existing Zcash software, the committee wants to know which repositories, what you will change, whether the change could benefit everyone if merged, and whether you have talked to the maintainers. A proposal to change core libraries that the maintainers have never heard of is a hard sell. Open an issue upstream and link the discussion.</p>

<h2>Milestones, budget and risk</h2>
<p>Milestones are the heart of the application because payment is released against them. For each one the form asks for an amount, an expected completion date, <strong>user stories</strong> ("As a [user], I want [goal], so that [reason]"), deliverables, and acceptance criteria — how the intended users will confirm the milestone is done. Scope each milestone so that it produces something a user can actually use or verify, not an internal checkpoint only you can see. Smaller, clearly verifiable milestones get paid; vague ones stall.</p>
<p>The budget splits into hardware/software, services, and compensation, each needing its own justification, with a total that must equal the amount you requested at the top. "Startup Funding" is money released before the first milestone to get going. Keep the request proportionate to your track record: the form itself warns that the larger the sum, the more diligence and milestones the committee expects.</p>
<p>Do not skip "Risk Assessment". Naming the ways your project could fail, and the success metrics you will be judged by, reads as competence, not weakness. A proposal that claims no risks tells the committee you have not thought it through.</p>

<blockquote>Write for two readers at once: the committee, who will vote, and the community, who will comment on the forum within the first week. Answer the obvious objection before someone raises it.</blockquote>

<h2>Learn from funded proposals</h2>
<p>The best templates are the real ones. Before you write, read several applications that were approved in your category. Open the Community Grants section of the Zcash forum and the closed, approved issues in the grants repository, and read how those teams scoped milestones, wrote user stories and justified a budget. Notice how specific the strong ones are. Do not copy their claims or describe their teams — read them for structure and level of detail, then write your own.</p>

<h2>Try it</h2>
<p>Using the notes from the last lesson, draft the three hardest fields for your own project: the <strong>Proposed Problem</strong> in two or three sentences, <strong>one milestone</strong> complete with a user story, deliverables and acceptance criteria, and a <strong>success metric</strong> that someone other than you could measure. If your project is the lab you shipped this week, your first milestone may well be "already done" — which is a sign you should also consider the retroactive route from the last lesson. Post the draft milestone to a peer or mentor for a read before it ever becomes a public issue.</p>

<h2>Key takeaways</h2>
<ul>
  <li>The application is a GitHub issue with a fixed template: terms, organisation, overview, team, project details, budget, risk, and milestones.</li>
  <li>State the problem independently of your solution, and name the users who want it — your labs are the demand evidence first-timers usually lack.</li>
  <li>Fill in "Upstream Merge Opportunities" by actually talking to maintainers; a surprise fork is a weak proposal.</li>
  <li>Scope each milestone so an intended user can validate it, and make the budget total match the requested amount.</li>
  <li>Read approved proposals in your category for structure before you write your own.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://github.com/ZcashCommunityGrants/zcashcommunitygrants/issues">ZCG grant applications</a> (open and closed issues) and the grant-application issue form in that repository</li>
  <li><a href="https://zcashcommunitygrants.org/selection/">ZCG: Grant Process</a></li>
  <li><a href="https://github.com/zcash/librustzcash/blob/main/CONTRIBUTING.md">librustzcash CONTRIBUTING.md</a> (the style guides the form points to)</li>
  <li><a href="https://forum.zcashcommunity.com/c/grants/33">Zcash Community Forum: Community Grants category</a> (applications, feedback, minutes)</li>
  <li><a href="https://zips.z.cash/zip-1015">ZIP 1015</a> (the purpose and rules the committee applies)</li>
</ul>`,
  },
  "l-03-10": {
    title: "Demo Day: Presenting Your Project",
    subtitle: "Plan and deliver a tight five-minute technical demo that shows your Zcash project working, without leaking anything private.",
    content: `<p>Demo Day falls in Week 8, at the end of the programme. It is where you show the cohort what you built — the payment gateway, the node and indexer, the tool behind your open-source contribution — running for real. A demo is not a lecture about your code; it is a short, rehearsed proof that the thing works and matters. This lesson is about making five minutes count.</p>
<p>Treat the demo as a skill in its own right. The same structure works whenever you show work later: a conference lightning talk, a grant committee call, a job interview, a pitch to a wallet team you want to integrate with. Learning it once pays off for years.</p>

<h2>Have one story, not a feature tour</h2>
<p>The commonest mistake is trying to show everything. You cannot, and the audience will not remember it anyway. Pick the single most compelling thing your project does and build the whole demo around watching it happen. For a payment gateway, that is a payment arriving and being confirmed. For an indexer tool, it is a query returning the right data from a live chain. One clear outcome beats five half-shown features.</p>
<p>A reliable five-minute shape:</p>
<ol>
  <li><strong>The problem, in one breath (about 30 seconds).</strong> Who hurts, and why, before your project exists.</li>
  <li><strong>What you built (about 30 seconds).</strong> One sentence naming what it is and the Zcash pieces it stands on — Zebra, Zaino, a <code>librustzcash</code> crate, WebZjs, Zallet — so the room knows where it fits.</li>
  <li><strong>The live demo (about 3 minutes).</strong> The one outcome, shown end to end.</li>
  <li><strong>What is real and what is next (about 1 minute).</strong> What works today, what you would build with more time, and the ask.</li>
</ol>

<h2>Make the live part survivable</h2>
<p>Live demos fail: the network stalls, testnet is slow, a sync is behind. Plan as if it will, so that it does not matter.</p>
<ul>
  <li><strong>Pre-stage the slow steps.</strong> If your demo needs a synced node or a confirmed transaction, have it ready before you start. On Testnet, blocks are faster since NU7 activated there, but do not gamble on a confirmation landing in the thirty seconds you are watching it.</li>
  <li><strong>Record a backup.</strong> Keep a short screen recording of the working flow. If the live run stalls, narrate the recording and move on. No one holds this against you; freezing and clicking in silence is what loses a room.</li>
  <li><strong>Use Testnet.</strong> Demo on Testnet with test funds, not real ZEC on Mainnet. It is cheaper, it is safer, and it keeps your real balances out of the room.</li>
  <li><strong>Script the exact clicks.</strong> Know every step you will take on screen. Close other tabs, silence notifications, and increase the font size so people at the back can read terminal output.</li>
</ul>

<h2>Demo without leaking</h2>
<p>You are building on a privacy chain, and a careless demo undoes the point of it. Before you share your screen, scrub it.</p>
<blockquote>Never show a seed phrase, a spending key, or a viewing key on screen — not even on Testnet, because the habit is what matters. Never show an address or transaction that links to your real identity or funds.</blockquote>
<p>Use throwaway Testnet wallets created for the demo. If you must show a real Mainnet transaction to prove your project has shipped, show only what is already public on a block explorer, and remember what shielded Zcash does and does not reveal: a shielded transaction hides sender, receiver and amount, but amounts crossing between pools, and anything in a transparent address, are public. Do not read a memo aloud without checking what is in it. Blur or crop anything on screen you have not deliberately decided to show.</p>

<h2>Finish with a specific ask</h2>
<p>Every demo should end by telling the audience what you want from them. Vague thanks waste the one moment people are paying attention. Make the ask concrete: testers for your Testnet build, a review of your open-source pull request, an introduction to a wallet team, feedback on whether a grant proposal is worth writing. The programme's aim is builders who keep building and products that reach real users, so the strongest ask points at your next step, not at applause.</p>

<h2>Try it</h2>
<p>Write your demo as a script of no more than 150 words, timed to five minutes, with the four beats above marked. Then do a dry run against a clock with your screen shared to a friend or a mentor, with notifications off and a backup recording ready. Note where you ran over or lost the thread, cut until it fits, and check one last time that nothing private — a key, a real address, an identifying memo — appears anywhere on your screen.</p>

<h2>Key takeaways</h2>
<ul>
  <li>Build the demo around one outcome shown live, not a tour of every feature.</li>
  <li>Use the four-beat shape: problem, what you built, the live demo, what is real and what is next.</li>
  <li>Demo on Testnet, pre-stage slow steps, and always have a backup recording.</li>
  <li>Scrub your screen: no seed phrases, spending or viewing keys, or identity-linked addresses, ever.</li>
  <li>End with one concrete ask that points at your next step.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zechub.wiki/">ZecHub wiki</a> — reference for what each Zcash shielded pool does and does not reveal</li>
  <li><a href="https://zips.z.cash/zip-0316">ZIP 316: Unified Addresses</a> — what an address can disclose about you</li>
  <li><a href="https://z.cash/">z.cash</a> — the ecosystem and components to credit in your framing</li>
</ul>`,
  },
  "l-03-11": {
    title: "Building in Public on X & GitHub",
    subtitle: "Share your work so other developers can follow and reuse it \u2014 a README and a project thread that help, without leaking anything private.",
    content: `<p>Most of the people who could fund your next project, review your pull request, or hire you will never watch your Demo Day. What they will see is your GitHub repository and whatever you posted while building. "Building in public" means leaving a trail they can follow: a repository someone can run, and a running account of what you did and learned. In a small ecosystem like Zcash's, that trail is how people come to know you.</p>
<p>This lesson is about doing it well and doing it safely. The safety part is not optional on a privacy chain: the same openness that builds your reputation can leak things you cannot take back.</p>

<h2>Write a README someone can actually run</h2>
<p>The README is the front door. A developer who lands on your repository decides in under a minute whether to keep reading. Lead with what the project is and who it is for, then get them running it. A workable order:</p>
<ol>
  <li><strong>One or two sentences:</strong> what it does and why it exists.</li>
  <li><strong>Status:</strong> is this a prototype, a Testnet demo, or something live? Say so plainly, and if it is pre-1.0, say that too.</li>
  <li><strong>Which network and components it needs:</strong> Testnet or Mainnet, and what it talks to (a Zebra node, a Zaino indexer, a light-wallet library). Name versions, or point at the releases page rather than hardcoding a number that will go stale.</li>
  <li><strong>Setup and run:</strong> the exact commands, copy-pasteable, from a clean checkout.</li>
  <li><strong>Licence and how to contribute:</strong> if you want contributions, add a <code>CONTRIBUTING.md</code>. The Zcash projects point to the <code>librustzcash</code> style guides as a model.</li>
</ol>
<p>Test the setup steps on a machine that is not yours, or ask a peer to. The gap between "works on my machine" and your written instructions is where most readers give up.</p>

<h2>A project thread people can follow</h2>
<p>A good build thread on X, a dev-log, or a series of issues is a story with a spine: what you set out to do, what broke, what you learned, what shipped. You do not need an audience to start — you need a habit. A few rules make it worth reading:</p>
<ul>
  <li><strong>Show, do not announce.</strong> A short screen capture of the thing working beats "excited to share that…". Concrete beats hype.</li>
  <li><strong>Post the problem, not just the win.</strong> "Spent a day on why my transaction would not confirm — here is what it was" helps the next person and is more memorable than a victory lap.</li>
  <li><strong>Credit the components.</strong> Name Zebra, Zaino, the crates you used. Maintainers notice, and it helps readers place your work.</li>
  <li><strong>Link back to the code.</strong> Every post should be one click from the repository or the pull request it describes.</li>
</ul>

<h2>Privacy hygiene: what never goes public</h2>
<p>Building in public on a privacy chain has a hard edge. Some things, once posted, cannot be unposted, and a few of them put real funds or your identity at risk.</p>
<blockquote>Never commit or post a seed phrase, a spending key, or a viewing key. Never share an address, transaction ID or screenshot that links your real identity to your Mainnet funds.</blockquote>
<p>Concretely: before you push, check for secrets in config files, <code>.env</code> files and commit history — a key pasted into an old commit is still there after you delete the line. Use a dedicated Testnet wallet for anything you will show. Remember that a viewing key hands over the ability to see your shielded activity, so it is as sensitive as the funds themselves. Screenshots leak more than you think — terminal scrollback, a balance in a tab, a filename. Crop deliberately, and demo with throwaway test data rather than your own.</p>

<h2>Try it</h2>
<p>Take the repository behind the pull request or project you built this week and bring its README up to the standard above: one-line description, status, network and components, and copy-pasteable setup. Then audit the repository for anything private — grep the history for keys, check <code>.env</code> and config files, and confirm no identity-linked Mainnet address or screenshot is committed. Finally, write one short build-in-public post about a problem you hit this week and how you solved it, linking to the exact commit or line.</p>

<h2>Key takeaways</h2>
<ul>
  <li>Your repository and your posts are what most people will judge you by — make the README runnable from a clean checkout.</li>
  <li>State status and network honestly, and point at releases pages instead of hardcoding versions.</li>
  <li>Write threads that show the work and the problems, not announcements, and link back to the code.</li>
  <li>Never post seed phrases, spending or viewing keys, or identity-linked Mainnet addresses or screenshots.</li>
  <li>Check commit history and config files for secrets before pushing; deleting a line does not remove it from history.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://github.com/zcash/librustzcash/blob/main/CONTRIBUTING.md">librustzcash CONTRIBUTING.md</a> — the contribution and style model Zcash projects point to</li>
  <li><a href="https://zechub.wiki/">ZecHub wiki</a> — what shielded transactions reveal, and privacy basics to respect when posting</li>
  <li><a href="https://zips.z.cash/zip-0316">ZIP 316: Unified Addresses</a> — what an address discloses</li>
</ul>`,
  },
  "l-03-12": {
    title: "Mentoring the Next Cohort",
    subtitle: "Review a peer's lab and guide a newer builder well \u2014 giving feedback that teaches, without doing the work for them.",
    content: `<p>Throughout this programme, mentors reviewed your labs. You felt the difference between a review that moved you forward and one that left you stuck or deflated. Now you are on the other side of that. Mentoring the next cohort — reviewing their labs, answering their questions, helping them land a first contribution — is one of the most useful things a graduate can do, and it is a skill you can get better at deliberately.</p>
<p>It also serves the programme's larger aim. The goal is not just products shipped but builders who stay, still contributing months after they graduate. A good mentor is how a nervous beginner becomes a builder who sticks around. Peer review of labs and mentor roles for graduates are part of the planned direction here; the cohort lead will share the specifics of how they work.</p>

<h2>Review the work, not the person</h2>
<p>A lab review is feedback on a specific piece of work against a specific goal. Keep it anchored there. A few habits make reviews land:</p>
<ul>
  <li><strong>Start with what works.</strong> Name something real the person did well before anything else. It is honest, and it makes the rest easier to hear.</li>
  <li><strong>Be specific and located.</strong> "This is confusing" helps no one. "This function does two things — splitting them would make the transaction-building step testable" points at the change.</li>
  <li><strong>Separate must-fix from nice-to-have.</strong> A beginner cannot tell a security bug from a style preference unless you label which is which. Say what blocks the lab and what is optional.</li>
  <li><strong>Explain the why.</strong> "Don't log the viewing key" teaches a rule. "Don't log the viewing key — anyone who reads that log can see all your shielded activity" teaches the reason, so they apply it next time without you.</li>
</ul>
<p>Pay special attention to privacy mistakes, because they carry real stakes on this chain. A learner who commits a seed phrase or shows an identity-linked address needs that caught kindly and immediately, with the reason attached.</p>

<h2>Guide without taking over</h2>
<p>The hardest part of mentoring is not fixing the problem yourself. When you hand someone the answer, you solve today's bug and remove the chance for them to learn to solve the next one. The aim is to leave them more capable, not more dependent.</p>
<blockquote>Your job is to make the person a better builder, not to make their lab perfect. A lab you quietly fixed teaches nothing; a bug they fixed with your questions teaches for good.</blockquote>
<p>Lead with questions instead of answers. "What does the error actually say?" and "What did you expect to happen, and what happened?" teach a method of debugging, not just a fix. Point at the resource rather than reciting it: send them to the Zebra book, the relevant ZIP, or the crate's documentation and let them read it. Give them the next step, not the whole staircase — enough to get unstuck, then let them walk. And learn to sit with a pause; the silence after a good question is where the learning happens.</p>

<h2>Know your limits and hand off</h2>
<p>You graduated from this programme; you are not expected to know everything. The useful move when you are out of your depth is an honest hand-off, not a confident guess — a wrong answer delivered with authority costs the beginner more than "I don't know" ever would.</p>
<p>Say what you are unsure of, and point them somewhere real: a maintainer who knows that code, the Zcash R&amp;D or community channels, the forum, or the person on the core team whose name is on the commits. Showing a newcomer <em>how</em> to find an answer — which repository, which issue, whom to ask — is often worth more than the answer itself, because it is the thing they will need again and again.</p>

<h2>Try it</h2>
<p>Find a pull request or a shared lab from a peer in this cohort and write a review of it as if you were the mentor. Open with one genuine strength. List at most three improvements, each located at a specific line or step, each marked must-fix or nice-to-have, each with a one-line reason. For at least one, write it as a question that leads the author to the fix rather than handing it over. Re-read it once and cut anything that comments on the person rather than the code.</p>

<h2>Key takeaways</h2>
<ul>
  <li>Review the work against its goal: start with a real strength, be specific and located, and separate must-fix from nice-to-have.</li>
  <li>Always attach the reason — especially for privacy mistakes, which carry real stakes.</li>
  <li>Guide with questions and next steps; do not fix the lab yourself, or you remove the learning.</li>
  <li>When you are out of your depth, say so and hand off to the right person or resource.</li>
  <li>Teaching someone how to find an answer is usually worth more than the answer.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://github.com/zcash/librustzcash/blob/main/CONTRIBUTING.md">librustzcash CONTRIBUTING.md</a> — the review and contribution culture to model</li>
  <li><a href="https://zebra.zfnd.org/">The Zebra book</a> — the kind of reference to point learners at instead of answering for them</li>
  <li><a href="https://zechub.wiki/">ZecHub wiki</a> — a shared resource for explaining privacy rules and their reasons</li>
</ul>`,
  },
  "l-03-13": {
    title: "The Road Ahead: Your Zcash Journey",
    subtitle: "Know what is actually coming to Zcash in 2026 and beyond, and the concrete next steps to keep building after the programme.",
    content: `<p>Zcash moved fast in 2026. The old full-node wallet <code>zcashd</code> was retired, the Orchard pool was sealed after a circuit vulnerability was found and fixed, and the new Ironwood pool became the active shielded pool. If you can read a changelog and a ZIP, you can keep up — and you will need to, because more is coming. This lesson is a map of what is genuinely on the way and where you go next.</p>
<p>One habit matters more than any single fact here: check the source, not your memory. Everything below is dated and provisional. The releases pages, the ZIPs and the forum are the truth; this lesson will be out of date before you reach the next cohort.</p>

<h2>What is actually coming</h2>
<p><strong>NU7</strong> is the next network upgrade. As of October 2026 it is live on <strong>Testnet</strong> but not on Mainnet: the final decision on Mainnet activation is expected on 20 October 2026, with a Mainnet activation target of 5 November 2026. Its deployment is specified in <a href="https://zips.z.cash/zip-0259">ZIP 259</a> (draft). The headline change is block target spacing dropping from 75 seconds to 25 (ZIP 218), alongside changes to fee handling and reissuance (ZIP 235, ZIP 237) and the disallowing of version 4 transactions (ZIP 2003), which makes any funds still left in the old Sprout pool unspendable. NU7 adds <strong>no new transaction format</strong>, and it does not include Zcash Shielded Assets, Crosslink or memo bundles.</p>
<p>Further out, several things are in research or limited release — real, but not something to build a product on yet:</p>
<ul>
  <li><strong>Zcash Shielded Assets (ZSAs)</strong>, drafted in <a href="https://zips.z.cash/zip-0226">ZIP 226</a> and ZIP 227, would let other assets live in the shielded pool. On the forum this is still under debate and is not scheduled for a network upgrade.</li>
  <li><strong>Crosslink</strong>, Shielded Labs' hybrid proof-of-work/proof-of-stake finality design, runs only on a FeatureNet as of October 2026. There is no Mainnet timeline.</li>
  <li><strong>Project Tachyon</strong>, led by Sean Bowe, is a scaling design using proof-carrying data and oblivious synchronisation. It is in development, not deployed, with no upgrade timeline.</li>
  <li><strong>PCZT</strong> (<a href="https://zips.z.cash/zip-0374">ZIP 374</a>, draft), the Partially Created Zcash Transaction format, and <strong>FROST</strong> threshold signing are the pieces behind shielded multisig. The tooling is progressing, but there are open questions — including how key derivation interacts with Ironwood's quantum-recoverable notes — so do not treat FROST-controlled shielded treasuries as production-ready yet.</li>
  <li><strong>Zallet</strong>, the full-node wallet that replaced the <code>zcashd</code> wallet, is in beta. Watch for it reaching a stable 1.0.</li>
</ul>

<h2>Where to keep contributing</h2>
<p>The fastest way to stay a builder is to keep shipping small things into real repositories. Good entry points, all actively maintained, are the ones you met in this programme: <strong>Zaino</strong> (the indexer, Zingo Labs), <strong>Zallet</strong> (which has many <code>zcashd</code> JSON-RPC methods still to port), <strong>zcash-devtool</strong>, <strong>frost-tools</strong>, and <strong>ZecHub</strong>'s documentation. A bug you hit during a lab is the best possible first issue: you already understand it. The NU7 Mainnet window is itself an opening — tooling and wallets need testing and fixes as it lands.</p>

<h2>Calls, forums and funding</h2>
<p>Staying visible is how you hear about the next thing and how people come to trust your work. Follow the Zcash community forum, where upgrade timelines, grant minutes and release announcements are posted. Join the community and R&amp;D chat channels. Read the ZIPs repository as proposals move from draft to settled — being able to follow a ZIP discussion is a real skill. And when you have something worth funding or something you have already shipped, you now know the routes: a ZCG grant for planned work, a retroactive grant for completed work, ZecHub bounties for smaller pieces.</p>

<h2>Try it</h2>
<p>Open the releases or changelog page of one project you want to keep following — Zebra, Zallet or Zaino — and read the most recent entry closely enough to say what changed and whether it affects Mainnet. Then open <a href="https://zips.z.cash/zip-0259">ZIP 259</a> and check its current status and whether a Mainnet activation height has been set. Write yourself three sentences: what is live now, what is coming next, and the one repository you will open a first post-programme issue or pull request against.</p>

<h2>Key takeaways</h2>
<ul>
  <li>NU7 is on Testnet as of October 2026; Mainnet is targeted for 5 November 2026 pending a 20 October decision, and it adds no new transaction format.</li>
  <li>ZSAs, Crosslink, Project Tachyon and production FROST treasuries are research or limited-release — real, but not to build products on yet.</li>
  <li>Zallet is in beta; watch for a stable release.</li>
  <li>Keep contributing to actively maintained repos — Zaino, Zallet, zcash-devtool, frost-tools, ZecHub — starting from a bug you already understand.</li>
  <li>Check the releases pages, ZIPs and forum rather than your memory; the ecosystem changes monthly.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://zips.z.cash/zip-0259">ZIP 259: Deployment of the NU7 Network Upgrade</a> (draft)</li>
  <li><a href="https://zips.z.cash/zip-0226">ZIP 226: Transfer and Burn of Zcash Shielded Assets</a> (draft)</li>
  <li><a href="https://zips.z.cash/zip-0374">ZIP 374: Partially Created Zcash Transaction Format</a> (draft)</li>
  <li><a href="https://github.com/ZcashFoundation/zebra/blob/main/CHANGELOG.md">Zebra CHANGELOG</a> — how to track what is live</li>
  <li><a href="https://forum.zcashcommunity.com/">Zcash Community Forum</a> — upgrade timelines and announcements</li>
  <li><a href="https://github.com/zcash/zips">Zcash Improvement Proposals (ZIPs)</a></li>
</ul>`,
  },
  "l-03-14": {
    title: "Graduation & Alumni Network",
    subtitle: "Finish the programme well and stay connected as alumni, so graduation is a starting point rather than an ending.",
    content: `<p>You have reached the end of an eight-week programme: four stages, a stack of labs your mentors reviewed, a project shown at Demo Day in Week 8, and an open-source contribution landed. Graduation marks that. But the programme measures itself by what happens after this week, not during it, and this lesson is about making graduation a beginning.</p>
<p>The programme has two north-star goals, and they are worth stating plainly because they tell you what "success" means here. The first is <strong>builders who stay</strong>: someone still committing code, deploying, or contributing sixty days after graduating. The second is <strong>products shipped to mainnet</strong>: an application live on Zcash Mainnet that has actually moved value — roughly five dollars of ZEC through a real transaction is the bar for "shipped". Both are about continuing, not finishing.</p>

<h2>Finish the programme properly</h2>
<p>Before you move on, close things out so your work survives you. A short checklist:</p>
<ul>
  <li><strong>Make your project findable and runnable.</strong> The README, the honest status, the setup steps from the last lesson — do them now, while the project is fresh in your head.</li>
  <li><strong>Land the loose ends.</strong> If your open-source pull request is still in review, keep responding to comments until it merges. A review that goes quiet is often closed unmerged.</li>
  <li><strong>Write down what you learned.</strong> A short post-mortem — what worked, what you would do differently, what you would build next — is useful to you later and to the next cohort now.</li>
  <li><strong>Collect your evidence.</strong> Your merged pull request, your repository, your Demo Day recording. These are the public record of what you can do.</li>
</ul>

<h2>What an alumni network is for</h2>
<p>Good developer programmes do not end at a certificate; they turn each graduating group into a network that keeps giving back. Across the industry, alumni networks tend to do a few things well, and they are worth knowing so you can make use of them as they form:</p>
<ul>
  <li><strong>They keep people connected.</strong> A shared channel where graduates post what they are building, ask questions, and answer each other outlasts any single cohort.</li>
  <li><strong>They route opportunities.</strong> Jobs, contracts, collaborators and grant tips travel through alumni before they reach the open market.</li>
  <li><strong>They feed the next cohort.</strong> Graduates become the mentors and reviewers, which is how a programme compounds rather than restarts each time.</li>
  <li><strong>They show the work.</strong> Public portfolio pages and project showcases let a graduate's output be seen by people who can fund or hire them.</li>
</ul>
<p>For this programme, an alumni network, public portfolio pages, and mentor roles for graduates are part of the planned direction rather than things already built. Treat them as coming, and let the cohort lead share the specifics of how and when they open. What you can do today does not depend on any of that.</p>

<h2>Stay a builder on your own terms</h2>
<p>Whatever the programme builds around you, the sixty-day test is in your hands. The graduates who stay tend to do the same simple things: they keep one small project alive, they open an issue or a pull request every week or two, they stay present in the community channels, and they help the person one step behind them. You already have the habits — the labs built them. Graduation is just the point where no one is assigning the next one, so you assign it to yourself.</p>

<h2>Try it</h2>
<p>Write your own sixty-day plan in five lines: the one project you will keep alive, the repository you will contribute to next, the community channel you will stay active in, one newer builder you could help, and the single thing that would count as your project being "shipped" on Mainnet. Put a date on each. Share it with a peer from the cohort so someone else knows what you are aiming at.</p>

<h2>Key takeaways</h2>
<ul>
  <li>The programme's success is measured after graduation: builders who stay active at sixty days, and products that ship to Mainnet.</li>
  <li>Close out your work now — runnable README, merged pull request, a short post-mortem, and your evidence collected.</li>
  <li>Alumni networks keep people connected, route opportunities, feed the next cohort, and showcase work.</li>
  <li>An alumni network, portfolio pages and graduate mentor roles are planned here; the cohort lead will share specifics.</li>
  <li>Staying a builder is a few small habits repeated — keep one project alive and contribute regularly.</li>
</ul>

<h2>Sources &amp; further reading</h2>
<ul>
  <li><a href="https://forum.zcashcommunity.com/">Zcash Community Forum</a> — where to stay visible and hear about what is next</li>
  <li><a href="https://zechub.wiki/">ZecHub wiki</a> — a community hub to keep learning from and contributing to</li>
  <li><a href="https://github.com/zcash/librustzcash/blob/main/CONTRIBUTING.md">librustzcash CONTRIBUTING.md</a> — how to keep contributing after the programme</li>
</ul>`,
  },
}
