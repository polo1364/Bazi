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
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">
          待校驗
        </span>
      </div>
      {/* 必須顯示：筆畫未校驗說明，不輸出吉凶定論 */}
      <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-100">
        <p className="font-medium">姓名五格：待校驗</p>
        <p className="mt-1">
          姓名筆畫與字五行依流派不同而有差異，未校驗前僅供參考，不輸出「五格皆吉」等吉凶定論。
          此處列出目前資料庫計算值，結論需依使用者選定的筆畫標準確認後判讀。
        </p>
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
              <div className="mt-2 text-[10px] leading-snug text-muted">{wuge.details[key]?.title ?? ''}</div>
            </div>
          )
        })}
      </div>
      {wuge.unknownChars.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          以下字元筆畫資料庫尚未收錄，需手動校驗：{wuge.unknownChars.join('、')}
        </p>
      )}
    </section>
  )
}
