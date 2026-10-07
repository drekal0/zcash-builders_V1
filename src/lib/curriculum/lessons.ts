// Public lesson API for the app. Structure lives in ./outline.ts (light, safe to
// import anywhere); full lesson bodies live in ./content/ (generated from the
// researched fragments). This module joins them.
//
// Kept exports stable for existing importers:
//   ALL_LESSONS, LESSON_MAP, STAGE_LESSON_IDS, LessonMeta, Lesson

import {
  ALL_LESSON_META,
  LESSON_META_MAP,
  STAGE_LESSON_IDS as STAGE_IDS_MAP,
  type LessonMeta as OutlineLessonMeta,
} from './outline'
import { LESSON_CONTENT } from './content'

export type LessonMeta = OutlineLessonMeta

export interface Lesson extends LessonMeta {
  subtitle?: string
  content: string // rich HTML
}

function join(meta: LessonMeta): Lesson {
  const c = LESSON_CONTENT[meta.id]
  return {
    ...meta,
    // The content module's title/subtitle are authoritative for the reader
    // (writers corrected a few titles); fall back to the outline title.
    title: c?.title ?? meta.title,
    subtitle: c?.subtitle,
    content: c?.content ?? '<p>This lesson is coming soon.</p>',
  }
}

export const ALL_LESSONS: Lesson[] = ALL_LESSON_META.map(join)

export const LESSON_MAP = new Map<string, Lesson>(ALL_LESSONS.map(l => [l.id, l]))

// Re-export the ordered-ids-per-stage map under its original name
export const STAGE_LESSON_IDS: Record<string, string[]> = STAGE_IDS_MAP

// A lesson is "published" when it has real content behind it
export function isPublished(id: string): boolean {
  return LESSON_CONTENT[id] !== undefined
}

export { LESSON_META_MAP }
