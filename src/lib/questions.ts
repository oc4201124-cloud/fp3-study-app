import type { Question } from './types'

let _questions: Question[] | null = null

export async function loadQuestions(): Promise<Question[]> {
  if (_questions) return _questions
  const res = await fetch('/data/questions.json')
  _questions = await res.json()
  return _questions!
}

export function getQuestionsByCategory(questions: Question[], category: string): Question[] {
  if (category === '総復習') return questions
  return questions.filter(q => q.category === category)
}

export function getQuestionsByIds(questions: Question[], ids: string[]): Question[] {
  const set = new Set(ids)
  return questions.filter(q => set.has(q.id))
}

export function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function pickQuestions(questions: Question[], count: number): Question[] {
  return shuffleArray(questions).slice(0, count)
}
