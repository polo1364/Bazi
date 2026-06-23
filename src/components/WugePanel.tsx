import type { WugeResult } from '../types'

interface Props {
  wuge: WugeResult
}

export default function WugePanel({ wuge }: Props) {
  const fortuneKeys = [
    ['天格', 'heaven'],
    ['人格', 'personality'],
    ['地格', 'earth'],
    ['外格', 'outer'],
    ['總格', 'total'],
  ] as const
  const verified = wuge.verified === true
  const chars = wuge.chars ?? []
  const fortune = wuge.wugeFortune
  const sancai = wuge.sancai && 'combination' in wuge.sancai ? wuge.sancai : null

  return (
    <section className="card animate-fade-in p-4 sm:p-5">
      <div className="panel-header">
        <h3 className="section-title !mb-0">姓名五格</h3>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${
          verified
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
        }`}>
          {verified ? '筆畫已校驗' : '待校驗'}
        </span>
      </div>

      <div className={`mb-4 rounded-xl border px-4 py-3 text-xs leading-relaxed ${
        verified
          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-100'
          : 'border-amber-500/20 bg-amber-500/5 text-amber-100'
      }`}>
        {verified ? (
          <>
            <p className="font-medium">校驗狀態：筆畫已校驗；81 數理已啟用；三才依資料表判讀</p>
            <p className="mt-1">姓名學資料依本系統內建 81 數理與三才配置表判讀，不同流派可能有差異。</p>
          </>
        ) : (
          <>
            <p className="font-medium">姓名五格：待校驗</p>
            {wuge.unknownChars.length > 0 && <p className="mt-1">缺少字：{wuge.unknownChars.join('、')}</p>}
            <p className="mt-1">不得輸出吉凶定論。</p>
            {wuge.reason && <p className="mt-1 text-amber-200/80">{wuge.reason}</p>}
          </>
        )}
      </div>

      {chars.length > 0 && (
        <div className="mb-4 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
          <div className="text-xs font-semibold text-secondary">一、康熙筆畫</div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {chars.map((c) => (
              <div key={c.char} className="rounded-lg bg-black/20 px-3 py-2 text-xs">
                <span className="font-bold text-[#f0c040]">{c.char}</span>
                <span className="ml-2 text-secondary">{c.verified ? `${c.strokes} 畫` : '待校驗'}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-muted">姓名：{chars.map((c) => c.char).join('')}｜資料來源：{wuge.source ?? '康熙筆畫資料庫尚未收錄完整姓名'}</p>
        </div>
      )}

      {verified && fortune?.verified && (
        <>
          <div className="mb-3 text-xs font-semibold text-secondary">二、五格數理</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {fortuneKeys.map(([label, key]) => {
              const item = fortune.items[key]
              return (
                <div key={key} className="card-solid group p-4 transition hover:border-[#f0c040]/20">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-muted">{label}</div>
                    <span className="rounded-full bg-black/25 px-2 py-0.5 text-[10px] text-secondary">{item.level}</span>
                  </div>
                  <div className="mt-1 text-2xl font-bold text-[#f0c040]">{item.number}</div>
                  <div className="mt-1 text-xs font-medium text-secondary">{item.title}</div>
                  <p className="mt-2 text-[10px] leading-relaxed text-muted">{item.summary}</p>
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-[10px] text-muted">{fortune.note}</p>
        </>
      )}

      {verified && sancai && (
        <div className="mt-4 rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-xs leading-relaxed text-secondary">
          <div className="text-xs font-semibold text-secondary">三、三才配置</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-4">
            <div><span className="text-muted">三才：</span><span className="font-bold text-[#f0c040]">{sancai.combination}</span></div>
            <div><span className="text-muted">天格：</span>{sancai.heaven?.element}</div>
            <div><span className="text-muted">人格：</span>{sancai.personality?.element}</div>
            <div><span className="text-muted">地格：</span>{sancai.earth?.element}</div>
          </div>
          <div className="mt-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2">
            三才判斷：{sancai.level}。{sancai.summary}
          </div>
          {sancai.tableCoverage === 'partial' && (
            <p className="mt-2 text-[10px] text-muted">三才配置表目前為部分收錄，未收錄組合不輸出保證性吉凶定論。</p>
          )}
        </div>
      )}

      <div className="mt-4 rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-xs leading-relaxed text-muted">
        姓名學資料依本系統內建 81 數理與三才配置表判讀，不同流派數理名稱與吉凶可能略有差異；結果僅供參考，不作保證性結論。
      </div>
    </section>
  )
}
