export type QuestionType = 'ox' | 'choice3' | 'jitsugi'

export interface Question {
  id: string
  type: QuestionType
  question: string
  answer: boolean | number | string
  explanation?: string
  choices?: string[]
  category: string
  source: string
  exam_date?: string
  video_num?: number
}

export interface DayPlan {
  day: number
  category: string
  videos: number[]
  theme: string
  description: string
}

export interface DayProgress {
  completed: boolean
  date?: string
  correct: number
  total: number
  wrongIds: string[]
}

export interface AppProgress {
  startDate: string
  days: Record<number, DayProgress>
  allWrongIds: string[]
}
