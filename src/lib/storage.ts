'use client'
import type { AppProgress, DayProgress } from './types'

const KEY = 'fp3_progress'

export function getProgress(): AppProgress {
  if (typeof window === 'undefined') return defaultProgress()
  const raw = localStorage.getItem(KEY)
  if (!raw) return defaultProgress()
  try { return JSON.parse(raw) } catch { return defaultProgress() }
}

function defaultProgress(): AppProgress {
  return {
    startDate: new Date().toISOString().split('T')[0],
    days: {},
    allWrongIds: [],
  }
}

export function saveProgress(p: AppProgress) {
  localStorage.setItem(KEY, JSON.stringify(p))
}

export function saveDayResult(day: number, result: DayProgress) {
  const p = getProgress()
  p.days[day] = result
  // 全体の苦手問題リストを更新
  const existing = new Set(p.allWrongIds)
  result.wrongIds.forEach(id => existing.add(id))
  p.allWrongIds = Array.from(existing)
  saveProgress(p)
}

export function getCurrentDay(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.min(Math.max(diff + 1, 1), 30)
}

export function resetProgress() {
  localStorage.removeItem(KEY)
}
