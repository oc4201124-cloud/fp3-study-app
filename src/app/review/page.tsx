'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProgress } from '@/lib/storage'
import { loadQuestions, getQuestionsByIds } from '@/lib/questions'
import type { Question } from '@/lib/types'

export default function ReviewPage() {
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const p = getProgress()
    if (p.allWrongIds.length === 0) { setLoading(false); return }
    loadQuestions().then(all => {
      setWrongQuestions(getQuestionsByIds(all, p.allWrongIds))
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen"><p className="text-gray-500">読み込み中...</p></div>

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-2">⚠️ 苦手問題</h1>
      <p className="text-sm text-gray-500 mb-4">{wrongQuestions.length}問 が苦手として記録されています</p>

      {wrongQuestions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">🎉</p>
          <p className="font-bold text-gray-700">苦手問題なし！</p>
          <p className="text-sm text-gray-500 mt-2">クイズで間違えた問題がここに表示されます</p>
        </div>
      ) : (
        <>
          <Link
            href={`/quiz?ids=${wrongQuestions.map(q => q.id).join(',')}&category=苦手問題`}
            className="block w-full bg-orange-500 text-white text-center py-4 rounded-xl font-bold mb-4"
          >
            苦手問題を全部解く（{wrongQuestions.length}問）
          </Link>

          <div className="space-y-3">
            {wrongQuestions.map(q => (
              <div key={q.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{q.category}</span>
                  <span className="text-xs text-gray-400">{q.source?.includes('kakomon') ? '過去問' : 'AI問題'}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{q.question}</p>
                <Link
                  href={`/quiz?ids=${q.id}&category=${encodeURIComponent(q.category)}`}
                  className="mt-2 text-xs text-blue-600 font-medium"
                >
                  この問題を解く →
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
