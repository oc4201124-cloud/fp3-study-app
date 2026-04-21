'use client'
import { useEffect, useState } from 'react'
import { getProgress, resetProgress, getCurrentDay } from '@/lib/storage'
import type { AppProgress } from '@/lib/types'

const CATEGORIES = ['ライフプランニング','リスク管理','金融資産運用','タックスプランニング','不動産','相続・事業承継']

export default function ProgressPage() {
  const [progress, setProgress] = useState<AppProgress | null>(null)
  const [currentDay, setCurrentDay] = useState(1)

  useEffect(() => {
    const p = getProgress()
    setProgress(p)
    setCurrentDay(getCurrentDay(p.startDate))
  }, [])

  const days = progress?.days ?? {}
  const total = Object.values(days).reduce((s, d) => s + d.total, 0)
  const correct = Object.values(days).reduce((s, d) => s + d.correct, 0)
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const completedDays = Object.values(days).filter(d => d.completed).length

  const handleReset = () => {
    if (confirm('進捗をリセットしますか？（学習記録がすべて削除されます）')) {
      resetProgress()
      setProgress(null)
      window.location.reload()
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">📊 学習進捗</h1>

      {/* 総合 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <h2 className="text-sm text-gray-500 font-medium mb-3">総合成績</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '正答率', value: `${accuracy}%`, color: 'text-green-600' },
            { label: '解いた問題数', value: `${total}問`, color: 'text-blue-600' },
            { label: '完了日数', value: `${completedDays}/30日`, color: 'text-purple-600' },
            { label: '苦手問題数', value: `${progress?.allWrongIds.length ?? 0}問`, color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 正答率グラフ */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h2 className="text-sm text-gray-500 font-medium mb-3">正答率グラフ</h2>
        <div className="flex items-end gap-1 h-24">
          {Array.from({ length: 30 }, (_, i) => {
            const day = i + 1
            const d = days[day]
            const pct = d && d.total > 0 ? (d.correct / d.total) : 0
            const isCurrent = day === currentDay
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className={`w-full rounded-sm transition-all ${
                    d?.completed ? (pct >= 0.7 ? 'bg-green-400' : 'bg-orange-400') : isCurrent ? 'bg-blue-300' : 'bg-gray-100'
                  }`}
                  style={{ height: `${d?.completed ? Math.max(pct * 100, 8) : 8}%` }}
                />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Day1</span><span>Day15</span><span>Day30</span>
        </div>
        <div className="flex gap-3 mt-2 text-xs">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded" /><span>70%以上</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-400 rounded" /><span>70%未満</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 rounded" /><span>未実施</span></div>
        </div>
      </div>

      {/* 開始日 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <p className="text-sm text-gray-500">学習開始日</p>
        <p className="font-bold text-gray-800">{progress?.startDate ?? '-'}</p>
        <p className="text-xs text-gray-400 mt-1">現在 Day {currentDay}</p>
      </div>

      {/* リセット */}
      <button
        onClick={handleReset}
        className="w-full border-2 border-red-300 text-red-500 py-3 rounded-xl font-medium"
      >
        進捗をリセットする
      </button>
    </div>
  )
}
