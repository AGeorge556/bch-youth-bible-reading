export type UserRole = 'youth' | 'admin'

export interface Profile {
  id: string
  full_name: string
  grade: string
  profile_picture_url: string | null
  role: UserRole
  created_at: string
}

export interface Book {
  id: string
  name: string
  status: 'active' | 'archived'
  display_order: number
  created_at: string
  updated_at: string
}

export interface Chapter {
  id: string
  book_id: string
  chapter_number: number
  title: string | null
  poster_url: string | null
  unlock_date: string
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  chapter_id: string
  question_text: string
  order_index: number
  created_at: string
}

export interface ReadingProgress {
  id: string
  user_id: string
  chapter_id: string
  read_at: string
}

export interface Answer {
  id: string
  user_id: string
  question_id: string
  chapter_id: string
  answer_text: string
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  name: string
  description: string | null
  icon: string
  badge_type: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  book_id: string | null
  awarded_at: string
  badge?: Badge
  book?: Book
}
