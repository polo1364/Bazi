import type { WugeDetail } from '../types'

const LUCK_STYLE: Record<string, string> = {
  大吉: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  吉: 'text-green-400 bg-green-400/10 border-green-400/20',
  半吉: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  凶: 'text-red-400 bg-red-400/10 border-red-400/20',
}

interface Props {
  wuge: {
    天格: number; 人格: number; 地格: number; 外格: number; 總格: number
    luck: Record<string, string>
    details: Record<string, WugeDetail>
    unknownChars: string[]
  }
}

export default function WugePanel({ wuge }: Props) {
  const keys = ['天格', '人格', '地格', '外格', '總格'] as const

  return (
    <section className="card animate-fade-in p-4 sm:p-5">
      <div className="panel-header">
        <h3 className="section-title !mb-0">姓名五格</h3>
      </div>
      <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-100">
        姓名五格會受筆畫標準與字五行流派影響；此處列出目前資料庫計算值，結論需依使用者選定的筆畫標準確認後判讀。
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {keys.map((key) => {
          const luck = wuge.luck[key]
          const style = LUCK_STYLE[luck] ?? LUCK_STYLE['半吉']
          return (
            <div key={key} className="card-solid group p-4 text-center transition hover:border-[#f0c040]/20">
              <div className="text-xs text-muted">{key}</div>
              <div className="mt-1 text-2xl font-bold text-[#f0c040]">{wuge[key]}</div>
              <div className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${style}`}>
                {luck}
              </div>
              <div className="mt-2 text-[10px] leading-snug text-muted">{wuge.details[key].title}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
