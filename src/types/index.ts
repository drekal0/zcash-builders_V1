export type Role = 'student' | 'admin' | 'admin+student' | 'mentor' | 'region_lead'

export type Region = 'west-africa' | 'east-africa' | 'latam' | 'apac' | 'europe' | 'global'

export const REGION_LABELS: Record<Region, string> = {
  'west-africa':  'West Africa',
  'east-africa':  'East Africa',
  'latam':        'Latin America',
  'apac':         'Asia-Pacific',
  'europe':       'Europe',
  'global':       'Global',
}

export interface Profile {
  id: string
  name: string
  username?: string
  bio?: string
  country?: string
  github?: string
  x_handle?: string
  telegram?: string
  discord?: string
  zcash_ua?: string
  avatar_url?: string
  role: Role
  cohort_id?: string
  enrolled_at?: string
  xp: number
  is_public?: boolean
  created_at?: string
}

export interface Application {
  id: string
  name: string
  email: string
  country: string
  github?: string
  background?: string   // 'rust' | 'typescript' | 'python' | 'mobile' | 'other'
  motivation?: string
  status: 'pending' | 'accepted' | 'waitlisted' | 'rejected'
  cohort_id?: string
  reviewed_by?: string
  reviewed_at?: string
  admin_notes?: string
  created_at: string
}

export interface Cohort {
  id: string
  name: string
  region?: Region
  region_lead_id?: string
  language?: string
  timezone?: string
  description?: string
  website?: string
  start_date?: string
  end_date?: string
  starts_at?: string   // legacy alias
  ends_at?: string     // legacy alias
  max_students: number
  status: 'upcoming' | 'active' | 'open' | 'completed'
  is_public?: boolean
}

// Mirrors public.lesson_progress — unique(user_id, lesson_id)
export interface LessonProgress {
  id: string
  user_id: string
  stage: string
  lesson_id: string
  completed: boolean
  completed_at?: string
  time_spent_mins?: number
  bookmarked?: boolean
}

export type LabStatus = 'submitted' | 'under_review' | 'approved' | 'revision_requested'

// Mirrors public.lab_submissions — unique(user_id, lab_id)
export interface LabSubmission {
  id: string
  user_id: string
  stage: string
  lab_id: string
  submission_url?: string
  submission_notes?: string
  status: LabStatus
  feedback?: string
  mentor_id?: string
  submitted_at?: string
  reviewed_at?: string
  xp_awarded?: number
}

export interface Achievement {
  id: string
  user_id: string
  achievement_id: string
  awarded_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  cohort_id: string
  channel: string
  content: string
  created_at: string
  profiles?: { name: string; avatar_url?: string }
}

export interface Lesson {
  id: string
  stage: string
  week: number
  title: string
  subtitle?: string
  duration_min: number
  xp: number
  type: 'lesson' | 'lab' | 'workshop'
  content?: string
}
