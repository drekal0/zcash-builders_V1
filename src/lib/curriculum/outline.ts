// Curriculum outline: the week structure and labs for the 8-week programme.
// Lesson content lives in ./lessons.ts — a week with no lessons there is
// simply "not published yet", so the outline can run ahead of the content.

export interface LabMeta {
  id: string
  title: string
  xp: number
}

export interface WeekOutline {
  week: number
  stage: string
  title: string
  labs: LabMeta[]
}

export const WEEK_OUTLINE: WeekOutline[] = [
  { week: 1, stage: '00', title: 'Getting Started', labs: [
    { id: 'lab-00', title: 'Blockchain Visualiser', xp: 200 },
  ] },
  { week: 2, stage: '00', title: 'Blockchain Fundamentals', labs: [] },
  { week: 3, stage: '01', title: 'Understanding Zcash', labs: [
    { id: 'lab-01', title: 'Unified Address Explorer', xp: 200 },
  ] },
  { week: 4, stage: '01', title: 'Zcash Deep Dive', labs: [
    { id: 'lab-06', title: 'Viewing Keys & Encrypted Memo App', xp: 250 },
  ] },
  { week: 5, stage: '02', title: 'Build with Zcash', labs: [
    { id: 'lab-02', title: 'Shielded Transaction Sender', xp: 300 },
  ] },
  { week: 6, stage: '02', title: 'Real-World Apps', labs: [
    { id: 'lab-03', title: 'Payment Gateway MVP', xp: 300 },
    { id: 'lab-07', title: 'FROST Multisig Treasury', xp: 350 },
  ] },
  { week: 7, stage: '03', title: 'Contribute to Zcash', labs: [
    { id: 'lab-04', title: 'Zebra Node Deployment', xp: 400 },
    { id: 'lab-08', title: 'Zaino-Powered Block Explorer', xp: 400 },
  ] },
  { week: 8, stage: '03', title: 'Ship & Graduate', labs: [
    { id: 'lab-05', title: 'Open Source Contribution', xp: 400 },
  ] },
]

export const TOTAL_LABS = WEEK_OUTLINE.reduce((n, w) => n + w.labs.length, 0)
