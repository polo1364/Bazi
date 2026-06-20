import { useState } from 'react'
import type { AiQuestion } from '../types'

interface Props {
  questions?: AiQuestion[]
  loading?: boolean
  disabled?: boolean
  error?: string
  onAsk: (question: string) => void
}

const SUGGESTIONS = ['我適合創業嗎？', '今年財運要注意什麼？', '感情上該怎麼調整？', '適合換工作或升遷嗎？']

export default function AiAskPanel({ questions = [], loading, disabled, error, onAsk }: Props) {
  const [question, setQuestion] = useState('')

  const submit = (text = question) => {
    const q = text.trim()
    if (!q || loading || disabled) return
    onAsk(q)
    setQuestion('')
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="panel-header">
        <div>
          <h3 className="section-title !mb-0">命盤追問</h3>
          <p className="mt-1 text-xs text-muted">依目前命盤直接追問，回答會保存在本次結果中</p>
        </div>
        {loading && <span className="text-xs text-[#f0c040]">回答中…</span>}
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="topic-tag" disabled={loading || disabled} onClick={() => submit(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="form-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          placeholder="輸入想追問的問題..."
          disabled={loading || disabled}
        />
        <button type="button" className="btn-gold shrink-0" disabled={loading || disabled || !question.trim()} onClick={() => submit()}>
          送出
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p>
      )}

      {questions.length > 0 && (
        <div className="mt-4 space-y-3">
          {questions.map((item) => (
            <article key={item.id} className="ai-answer-card">
              <h4 className="text-sm font-semibold text-[#fde68a]">問：{item.question}</h4>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-secondary">{item.answer}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
