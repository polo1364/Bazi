import type { ShenshaItem } from '../types'

const TYPE_STYLE: Record<string, string> = {
  吉: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200',
  凶: 'border-red-500/30 bg-red-500/5 text-red-200',
  中性: 'border-amber-500/30 bg-amber-500/5 text-amber-200',
}

interface Props {
  items: ShenshaItem[]
}

export default function ShenshaPanel({ items }: Props) {
  /* 公式尚未完成時顯示說明，不輸出任何吉凶結論 */
  if (items.length === 0) {
    return (
      <section className="card animate-fade-in p-4 sm:p-5">
        <h3 className="section-title mb-3">神煞</h3>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-100">
          <p className="font-medium">神煞：尚未驗證</p>
          <p className="mt-1 text-muted">
            神煞需依日干、年干、地支或月令查法判定，目前公式未完成驗證，因此不列入正式結論。
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="card animate-fade-in p-4 sm:p-5">
      <h3 className="section-title mb-4">神煞</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((s) => (
          <div key={s.name} className={`rounded-xl border px-4 py-3 ${TYPE_STYLE[s.type] ?? TYPE_STYLE.中性}`}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{s.name}</span>
              <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px]">{s.status || s.type}</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{s.desc}</p>
            {s.basis && <p className="mt-1 text-[10px] leading-relaxed text-muted">依據：{s.basis}</p>}
            {s.trigger && s.trigger.length > 0 && <p className="mt-1 text-[10px] leading-relaxed text-muted">觸發：{s.trigger.join('、')}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
