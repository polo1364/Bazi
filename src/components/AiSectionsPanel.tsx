import type { AiSections } from '../types'

interface Props {
  sections?: AiSections
  loading?: boolean
}

const ITEMS: { key: keyof AiSections; title: string; hint: string }[] = [
  { key: 'career', title: '事業', hint: '方向、職場節奏與升遷機會' },
  { key: 'wealth', title: '財運', hint: '收入、投資與風險提醒' },
  { key: 'relationship', title: '感情人際', hint: '互動模式、婚姻與合作' },
  { key: 'health', title: '健康', hint: '身心作息與五行保養' },
  { key: 'yearly', title: '流年', hint: '年度重點與月份節奏' },
  { key: 'nameAdvice', title: '姓名建議', hint: '五格、字義與喜用神' },
  { key: 'remedies', title: '補強建議', hint: '顏色、方位、職業、習慣' },
]

export default function AiSectionsPanel({ sections, loading }: Props) {
  if (!sections && !loading) return null

  return (
    <section className="card p-5 sm:p-6">
      <div className="panel-header">
        <div>
          <h3 className="section-title !mb-0">AI 分段解讀</h3>
          <p className="mt-1 text-xs text-muted">依命盤、流年與姓名資料拆解重點</p>
        </div>
        {loading && <span className="text-xs text-[#f0c040]">生成中…</span>}
      </div>

      <div className="ai-section-grid">
        {ITEMS.map((item) => (
          <article key={item.key} className={`ai-section-card${loading ? ' animate-pulse opacity-60' : ''}`}>
            <div className="text-xs text-muted">{item.hint}</div>
            <h4 className="mt-1 text-base font-bold text-[#fde68a]">{item.title}</h4>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-secondary">
              {sections?.[item.key] || '等待 AI 生成此段內容。'}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
