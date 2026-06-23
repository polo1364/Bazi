import type { CharAnalysis, SancaiResult } from '../types'

const WUXING_CLASS: Record<string, string> = {
  木: 'text-green-400', 火: 'text-red-400', 土: 'text-yellow-400', 金: 'text-slate-200', 水: 'text-blue-400',
}

interface Props {
  charAnalysis: CharAnalysis[]
  sancai: SancaiResult | null
}

export default function NameCharsPanel({ charAnalysis, sancai }: Props) {
  if (charAnalysis.length === 0) return null

  return (
    <section className="card animate-fade-in p-4 sm:p-5">
      <h3 className="section-title mb-4">姓名字義與五行</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {charAnalysis.map((c) => (
          <div key={c.char} className="card-solid p-3 text-center">
            <div className="text-2xl font-bold text-[#f0c040]">{c.char}</div>
            <div className="mt-1 text-xs text-muted">{c.strokes} 劃</div>
            <div className={`mt-0.5 text-xs font-medium ${WUXING_CLASS[c.wuxing] ?? ''}`}>{c.wuxing}</div>
            <div className="mt-1.5 text-[10px] leading-snug text-muted">{c.meaning}</div>
          </div>
        ))}
      </div>
      {sancai && (
        <div className="mt-4 rounded-xl border border-[#f0c040]/20 bg-[#f0c040]/5 p-4">
          <div className="text-xs text-muted">三才配置（天格·人格·地格）</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-medium text-[#f0c040]">{sancai.title}</span>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px]">{sancai.luck}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-secondary">{sancai.meaning}</p>
        </div>
      )}
    </section>
  )
}
