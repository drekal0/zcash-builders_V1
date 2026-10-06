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

export interface LessonProgress {
  id: string
  user_id: string
  cohort_id: string
  stage: string
  lesson_id: string
  completed: boolean
  completed_at?: string
}

export interface LabSubmission {
  id: string
  user_id: string
  cohort_id: string
  stage: string
  lab_id: string
  github_url: string
  notes?: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  xp_awarded?: number
  reviewed_by?: string
  created_at?: string
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
