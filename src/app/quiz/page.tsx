'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { loadQuestions, getQuestionsByCategory, pickQuestions, getQuestionsByIds } from '@/lib/questions'
import { saveDayResult } from '@/lib/storage'
import type { Question } from '@/lib/types'

function QuizInner() {
  const params = useSearchParams()
  const router = useRouter()
  const category = params.get('category') || '総復習'
  const day = parseInt(params.get('day') || '0')
  const reviewIds = params.get('ids')?.split(',') || []

  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<boolean | number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [results, setResults] = useState<{ correct: boolean; id: string }[]>([])
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuestions().then(all => {
      let qs: Question[]
      if (reviewIds.length > 0) {
        qs = getQuestionsByIds(all, reviewIds)
      } else {
        const pool = getQuestionsByCategory(all, category)
        qs = pickQuestions(pool, 10)
      }
      setQuestions(qs)
      setLoading(false)
    })
  }, [])

  const current = questions[index]

  const handleAnswer = useCallback((ans: boolean | number) => {
    if (answered) return
    setSelected(ans)
    setAnswered(true)
  }, [answered])

  const handleNext = useCallback(() => {
    const isCorrect = selected === current.answer
    const newResults = [...results, { correct: isCorrect, id: current.id }]
    setResults(newResults)

    if (index + 1 >= questions.length) {
      // 終了
      if (day > 0) {
        const wrongIds = newResults.filter(r => !r.correct).map(r => r.id)
        saveDayResult(day, {
          completed: true,
          date: new Date().toISOString().split('T')[0],
          correct: newResults.filter(r => r.correct).length,
          total: newResults.length,
          wrongIds,
        })
      }
      setDone(true)
    } else {
      setIndex(index + 1)
      setSelected(null)
      setAnswered(false)
    }
  }, [selected, current, results, index, questions.length, day])

  if (loading) return <div className="flex items-center justify-center h-screen"><p className="text-gray-500">読み込み中...</p></div>
  if (questions.length === 0) return <div className="p-6 text-center text-gray-500">問題がありません。データを確認してください。</div>

  if (done) {
    const correct = results.filter(r => r.correct).length
    const total = results.length
    const pct = Math.round((correct / total) * 100)
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <div className="text-6xl mb-4">{pct >= 70 ? '🎉' : '📚'}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">結果</h2>
        <p className="text-5xl font-bold text-blue-600 mb-1">{pct}%</p>
        <p className="text-gray-500 mb-6">{correct}/{total} 問正解</p>
        {pct < 70 && <p className="text-sm text-red-600 mb-4">苦手問題として記録しました。復習しましょう！</p>}
        <div className="space-y-3 w-full">
          <button onClick={() => router.push('/')} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">ホームに戻る</button>
          {results.some(r => !r.correct) && (
            <button
              onClick={() => {
                const ids = results.filter(r => !r.correct).map(r => r.id).join(',')
                router.push(`/quiz?ids=${ids}&category=${encodeURIComponent(category)}`)
              }}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold"
            >
              間違えた問題を復習
            </button>
          )}
        </div>
      </div>
    )
  }

  const isOX = current.type === 'ox'
  const isChoice = current.type === 'choice3'
  const correctAns = current.answer

  return (
    <div className="p-4 min-h-screen flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.back()} className="text-gray-400 text-2xl">←</button>
        <div className="flex-1 mx-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 rounded-full h-2 transition-all" style={{ width: `${((index) / questions.length) * 100}%` }} />
          </div>
          <p className="text-xs text-gray-400 text-center mt-1">{index + 1} / {questions.length}</p>
        </div>
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">{category}</span>
      </div>

      {/* 問題 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm flex-1 mb-4">
        <p className="text-xs text-gray-400 mb-3 uppercase">{current.source?.includes('kakomon') ? '過去問' : 'AI問題'}</p>
        <p className="text-gray-800 text-base leading-relaxed font-medium">{current.question}</p>
      </div>

      {/* 選択肢 */}
      <div className="space-y-3 mb-4">
        {isOX && (
          <>
            {[{ label: '○ 正しい', val: true, color: 'bg-green-50 border-green-300' }, { label: '× 誤り', val: false, color: 'bg-red-50 border-red-300' }].map(({ label, val, color }) => {
              let cls = `w-full py-4 rounded-xl border-2 font-bold text-lg transition-all ${color}`
              if (answered) {
                if (val === correctAns) cls += ' border-green-500 bg-green-100'
                else if (val === selected) cls += ' border-red-500 bg-red-100'
                else cls += ' opacity-40'
              }
              return (
                <button key={String(val)} onClick={() => handleAnswer(val)} className={cls} disabled={answered}>
                  {label}
                </button>
              )
            })}
          </>
        )}
        {isChoice && current.choices?.map((choice, i) => {
          let cls = 'w-full py-3 px-4 rounded-xl border-2 border-gray-200 text-left text-sm font-medium transition-all'
          if (answered) {
            if (i === correctAns) cls += ' border-green-500 bg-green-100'
            else if (i === selected) cls += ' border-red-500 bg-red-100'
            else cls += ' opacity-40'
          } else {
            cls += ' hover:border-blue-300'
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)} className={cls} disabled={answered}>
              <span className="font-bold mr-2">{'①②③'[i]}</span>{choice}
            </button>
          )
        })}
      </div>

      {/* 解説 */}
      {answered && (
        <div className={`rounded-xl p-4 mb-4 ${selected === correctAns ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`font-bold mb-1 ${selected === correctAns ? 'text-green-700' : 'text-red-700'}`}>
            {selected === correctAns ? '✅ 正解！' : '❌ 不正解'}
          </p>
          {current.explanation && <p className="text-sm text-gray-600">{current.explanation}</p>}
        </div>
      )}

      {answered && (
        <button onClick={handleNext} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg">
          {index + 1 < questions.length ? '次の問題 →' : '結果を見る'}
        </button>
      )}
    </div>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><p>読み込み中...</p></div>}>
      <QuizInner />
    </Suspense>
  )
}
