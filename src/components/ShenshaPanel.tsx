import type { ShenshaItem } from '../types'
import {
  formatShenshaLookupKey,
  formatShenshaMatchedBranches,
  formatShenshaMatchedPillars,
  formatShenshaTargetBranches,
} from '../lib/shensha/shenshaDisplay'

const TYPE_STYLE: Record<string, string> = {
  成立: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200',
  不成立: 'border-white/10 bg-white/5 text-secondary',
  不適用: 'border-slate-500/30 bg-slate-500/5 text-slate-200',
  別名: 'border-sky-500/30 bg-sky-500/5 text-sky-200',
  尚未驗證: 'border-amber-500/30 bg-amber-500/5 text-amber-200',
  吉: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200',
  凶: 'border-red-500/30 bg-red-500/5 text-red-200',
  中性: 'border-amber-500/30 bg-amber-500/5 text-amber-200',
}

interface Props {
  items: ShenshaItem[]
}

export default function ShenshaPanel({ items }: Props) {
  const verifiedItems = items.filter((s) => s.verified === true)
  const unverifiedItems = items.filter((s) => s.status === '尚未驗證' || s.verified === false)

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

      <div className="mb-4 rounded-xl border border-[#f0c040]/20 bg-[#f0c040]/5 px-4 py-3 text-xs leading-relaxed text-secondary">
        本頁僅顯示已建立公式與測試的神煞。未建立查法表者標示為尚未驗證，不作吉凶定論。
      </div>

      <h4 className="mb-2 text-sm font-bold text-[#f0c040]">已驗證神煞</h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {verifiedItems.map((s) => {
          const status = s.status || (s.found ? '成立' : '不成立')
          const style = TYPE_STYLE[status] ?? TYPE_STYLE.中性
          return (
            <div key={s.name} className={`rounded-xl border px-4 py-3 ${style}`}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{s.name}</span>
                <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px]">{status}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{s.description || s.desc}</p>
              {s.basis && <p className="mt-1 text-[10px] leading-relaxed text-muted">查法依據：{s.basis}</p>}
              {s.lookupKey && <p className="mt-1 text-[10px] leading-relaxed text-muted">查詢鍵：{formatShenshaLookupKey(s.lookupKey)}</p>}
              {s.targetStems && s.targetStems.length > 0 && <p className="mt-1 text-[10px] leading-relaxed text-muted">目標天干：{s.targetStems.join('、')}</p>}
              {s.targetBranches && <p className="mt-1 text-[10px] leading-relaxed text-muted">目標地支：{formatShenshaTargetBranches(s.targetBranches)}</p>}
              {s.targetPillars && s.targetPillars.length > 0 && <p className="mt-1 text-[10px] leading-relaxed text-muted">目標日柱：{s.targetPillars.join('、')}</p>}
              {s.matchedPillars && s.matchedPillars.length > 0 ? (
                <p className="mt-1 text-[10px] leading-relaxed text-muted">
                  命中位置：{formatShenshaMatchedPillars(s.matchedPillars)}
                </p>
              ) : s.matchedBranches && (
                <p className="mt-1 text-[10px] leading-relaxed text-muted">
                  命中位置：{formatShenshaMatchedBranches(s.matchedBranches)}
                </p>
              )}
              {s.note && <p className="mt-1 text-[10px] leading-relaxed text-muted">版本備註：{s.note}</p>}
            </div>
          )
        })}
      </div>

      {unverifiedItems.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-2 text-sm font-bold text-[#f0c040]">尚未驗證神煞</h4>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {unverifiedItems.map((s) => (
              <div key={s.name} className={`rounded-xl border px-4 py-3 ${TYPE_STYLE.尚未驗證}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{s.name}</span>
                  <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px]">尚未驗證</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{s.reason || s.desc || '尚未建立公式與測試'}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-muted">尚未建立公式與測試前，不列入正式結論。</p>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-muted">
        <p className="font-medium text-secondary">版本與未開放說明</p>
        <p className="mt-1">咸池：已由桃花模組覆蓋，本階段以桃花公式呈現。</p>
        <p className="mt-1">孤辰寡宿：本系統採已測試版本，其他流派不另列卡，避免混淆。</p>
        <p className="mt-1">其他擇日神煞：尚未開放；未建立公式、資料表與測試前，不列入正式結論。</p>
      </div>
    </section>
  )
}
