export type Role = 'student' | 'admin' | 'mentor'

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
  starts_at: string
  ends_at: string
  max_students: number
  status: 'upcoming' | 'active' | 'completed'
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
