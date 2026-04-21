'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProgress, getCurrentDay } from '@/lib/storage'
import type { DayPlan, AppProgress } from '@/lib/types'

const CAT_COLOR: Record<string, string> = {
  'ライフプランニング': 'bg-blue-400',
  'リスク管理': 'bg-red-400',
  '金融資産運用': 'bg-green-400',
  'タックスプランニング': 'bg-yellow-400',
  '不動産': 'bg-purple-400',
  '相続・事業承継': 'bg-orange-400',
  '総復習': 'bg-gray-400',
}

export default function CalendarPage() {
  const [curriculum, setCurriculum] = useState<DayPlan[]>([])
  const [progress, setProgress] = useState<AppProgress | null>(null)
  const [currentDay, setCurrentDay] = useState(1)

  useEffect(() => {
    const p = getProgress()
    setProgress(p)
    setCurrentDay(getCurrentDay(p.startDate))
    fetch('/data/curriculum.json').then(r => r.json()).then(setCurriculum)
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">📅 30日間カリキュラム</h1>

      {/* 凡例 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(CAT_COLOR).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-xs text-gray-600">{cat}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {curriculum.map(day => {
          const dp = progress?.days[day.day]
          const isToday = day.day === currentDay
          const isDone = dp?.completed
          const isPast = day.day < currentDay && !isDone

          return (
            <div
              key={day.day}
              className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all ${
                isToday ? 'border-blue-500' : isDone ? 'border-green-300' : isPast ? 'border-red-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                  isDone ? 'bg-green-500' : isToday ? 'bg-blue-600' : isPast ? 'bg-red-300' : 'bg-gray-300'
                }`}>
                  {isDone ? '✓' : day.day}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`w-2 h-2 rounded-full ${CAT_COLOR[day.category] ?? 'bg-gray-400'}`} />
                    <span className="text-xs text-gray-400">{day.category}</span>
                    {isToday && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">TODAY</span>}
                  </div>
                  <p className="font-bold text-gray-800 text-sm mt-1">{day.theme}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{day.description}</p>
                  {isDone && (
                    <p className="text-xs text-green-600 mt-1">正答率 {dp!.total > 0 ? Math.round((dp!.correct / dp!.total) * 100) : 0}%（{dp!.correct}/{dp!.total}問）</p>
                  )}
                </div>
                {(isToday || !isDone) && day.day <= currentDay && (
                  <Link
                    href={`/quiz?day=${day.day}&category=${encodeURIComponent(day.category)}`}
                    className="shrink-0 bg-blue-600 text-white text-xs px-3 py-2 rounded-lg font-bold"
                  >
                    開始
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
