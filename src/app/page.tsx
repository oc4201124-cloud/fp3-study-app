'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProgress, getCurrentDay } from '@/lib/storage'
import type { AppProgress, DayPlan } from '@/lib/types'

const CAT_COLOR: Record<string, string> = {
  'ライフプランニング': 'bg-blue-100 text-blue-700',
  'リスク管理': 'bg-red-100 text-red-700',
  '金融資産運用': 'bg-green-100 text-green-700',
  'タックスプランニング': 'bg-yellow-100 text-yellow-700',
  '不動産': 'bg-purple-100 text-purple-700',
  '相続・事業承継': 'bg-orange-100 text-orange-700',
  '総復習': 'bg-gray-100 text-gray-700',
}
const CATEGORIES = Object.keys(CAT_COLOR).filter(c => c !== '総復習')

export default function Home() {
  const [progress, setProgress] = useState<AppProgress | null>(null)
  const [today, setToday] = useState<DayPlan | null>(null)
  const [currentDay, setCurrentDay] = useState(1)

  useEffect(() => {
    const p = getProgress()
    setProgress(p)
    const day = getCurrentDay(p.startDate)
    setCurrentDay(day)
    fetch('/data/curriculum.json')
      .then(r => r.json())
      .then((cur: DayPlan[]) => setToday(cur.find(d => d.day === day) || null))
  }, [])

  const completedDays = Object.values(progress?.days ?? {}).filter(d => d.completed).length
  const total = Object.values(progress?.days ?? {}).reduce((s, d) => s + d.total, 0)
  const correct = Object.values(progress?.days ?? {}).reduce((s, d) => s + d.correct, 0)
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  return (
    <div className="p-4">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-5 text-white mb-5">
        <p className="text-sm opacity-80">FP3級合格まで</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-5xl font-bold">{Math.max(30 - completedDays, 0)}</span>
          <span className="text-lg">日</span>
        </div>
        <div className="mt-3 bg-white/20 rounded-full h-2">
          <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${(completedDays / 30) * 100}%` }} />
        </div>
        <p className="text-xs mt-1 opacity-70">{completedDays}/30日完了</p>
      </div>

      {today && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📚</span>
            <h2 className="font-bold text-gray-800">今日の学習（Day {currentDay}）</h2>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${CAT_COLOR[today.category] ?? 'bg-gray-100 text-gray-700'}`}>
            {today.category}
          </span>
          <p className="font-bold text-gray-800 mt-2">{today.theme}</p>
          <p className="text-sm text-gray-500 mt-1">{today.description}</p>
          {today.videos.length > 0 && (
            <p className="text-xs text-blue-600 mt-2">🎬 動画 #{today.videos.join(', #')}</p>
          )}
          <Link
            href={`/quiz?day=${currentDay}&category=${encodeURIComponent(today.category)}`}
            className="mt-3 block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-bold"
          >
            今日のクイズを始める →
          </Link>
          {progress?.days[currentDay]?.completed && (
            <p className="text-center text-green-600 text-sm mt-2 font-medium">✅ 今日は完了済み！</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: '正答率', value: `${accuracy}%`, color: 'text-green-600' },
          { label: '解いた問題', value: `${total}問`, color: 'text-blue-600' },
          { label: '苦手問題', value: `${progress?.allWrongIds.length ?? 0}問`, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-3">📊 分野別クイズ</h3>
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={`/quiz?category=${encodeURIComponent(cat)}`}
              className={`flex items-center justify-between p-3 rounded-xl ${CAT_COLOR[cat]}`}
            >
              <span className="font-medium text-sm">{cat}</span>
              <span className="text-xs">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
