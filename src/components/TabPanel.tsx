import type { AnalysisResult, ChartTab, Gender, SolarTimeCorrection, StrengthV2Result, FortuneV2Result } from '../types'
import { ELEMENT_CLASS } from '../lib/constants'
import { pillarsToArray } from '../lib/bazi'
import { safeRelationDesc } from '../lib/relationDisplay'
import ChartCircle from './ChartCircle'

function StrengthV2Block({ v2 }: { v2: StrengthV2Result }) {
  const { usefulGods, pattern } = v2
  const strength = v2
  const f = strength.forces.summary
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4 text-xs leading-relaxed text-secondary">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-[#f0c040]">完整旺衰模型 v2</h4>
        <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-muted">系統模型</span>
      </div>

      <div className="flex flex-wrap gap-4">
        <div><span className="text-muted">身強弱</span><div className="mt-0.5 font-bold text-[#f0c040]">{strength.label}</div></div>
        <div><span className="text-muted">可信度</span><div className="mt-0.5 font-medium">{strength.confidence}</div></div>
        <div><span className="text-muted">系統分數</span><div className="mt-0.5 font-medium">{strength.score}</div></div>
      </div>
      <p className="text-[10px] text-muted">{strength.scoreNote}</p>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-white/5 bg-white/5 p-2">
          <div className="text-[10px] text-muted">得令</div>
          <div className="font-medium text-secondary">{strength.deLing.status}</div>
          <p className="mt-1 text-[10px] text-muted">{strength.deLing.reason}</p>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/5 p-2">
          <div className="text-[10px] text-muted">得地</div>
          <div className="font-medium text-secondary">{strength.deDi.status}</div>
          <p className="mt-1 text-[10px] text-muted">{strength.deDi.reason}</p>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/5 p-2">
          <div className="text-[10px] text-muted">得勢</div>
          <div className="font-medium text-secondary">{strength.deShi.status}</div>
          <p className="mt-1 text-[10px] text-muted">{strength.deShi.reason}</p>
        </div>
      </div>

      {strength.roots.roots.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-[#f0c040]">通根</div>
          <ul className="mt-1 space-y-0.5">
            {strength.roots.roots.map((r) => (
              <li key={`${r.pillar}-${r.hiddenStem}`} className="text-[10px] text-muted">{r.strength}：{r.reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="text-[10px] font-semibold text-[#f0c040]">透干與生扶剋洩耗</div>
        <p className="mt-1 text-[10px] text-muted">{strength.stemSupport.summary || '天干幫扶與洩耗不明顯'}</p>
        <p className="mt-1 text-[10px] text-muted">
          幫身 {f.supportScore}｜生身 {f.resourceScore}｜剋身 {f.controlScore}｜洩身 {f.outputScore}｜耗身 {f.wealthScore}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-muted">喜用初判</span>
        {usefulGods.useful.map((e) => (
          <span key={e} className={`rounded-full border border-white/10 bg-black/20 px-2.5 py-0.5 text-[10px] font-medium ${ELEMENT_CLASS[e]}`}>{e}</span>
        ))}
        <span className="ml-2 text-[10px] text-muted">忌神初判</span>
        {usefulGods.avoid.map((a) => (
          <span key={a.element} className={`rounded-full border border-white/10 bg-black/20 px-2.5 py-0.5 text-[10px] font-medium ${ELEMENT_CLASS[a.element]}`}>{a.element}</span>
        ))}
      </div>
      <ul className="space-y-0.5">
        {usefulGods.priority.map((p) => (
          <li key={p.element} className="text-[10px] text-muted">用神 {p.element}：{p.reason}</li>
        ))}
        {usefulGods.avoid.map((a) => (
          <li key={`avoid-${a.element}`} className="text-[10px] text-muted">忌 {a.element}：{a.reason}</li>
        ))}
      </ul>

      <div className="rounded-lg border border-[#f0c040]/20 bg-[#f0c040]/5 p-2">
        <div className="text-[10px] font-semibold text-[#f0c040]">格局傾向</div>
        <div className="mt-0.5 font-medium text-secondary">{pattern.patternLabel}（可信度 {pattern.confidence}）</div>
        <ul className="mt-1 space-y-0.5">
          {pattern.reasons.map((r) => (
            <li key={r} className="text-[10px] text-muted">{r}</li>
          ))}
        </ul>
        <p className="mt-1 text-[10px] text-muted">{pattern.warning}</p>
      </div>

      <div>
        <div className="text-[10px] font-semibold text-[#f0c040]">判斷依據</div>
        <ul className="mt-1 space-y-0.5">
          {strength.reasons.map((r) => (
            <li key={r} className="text-[10px] text-secondary">{r}</li>
          ))}
        </ul>
      </div>

      <p className="text-[10px] text-muted">{v2.note}</p>
    </div>
  )
}

function FortuneV2Block({ fv }: { fv: FortuneV2Result }) {
  const y = fv.yearImpact
  const lc = fv.luckCycleImpact
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4 text-xs leading-relaxed text-secondary">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-[#f0c040]">歲運聯動分析 v2（大運 × 流年 × 流月）</h4>
        <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-muted">系統模型</span>
      </div>

      <div className="rounded-lg border border-white/5 bg-white/5 p-2">
        <div className="text-[10px] font-semibold text-[#f0c040]">當前大運</div>
        {fv.luckTransition?.hasTransition && fv.luckTransition.segments.length >= 2 ? (
          <p className="mt-0.5 text-[10px] text-secondary">
            大運背景：{fv.luckTransition.segments[0].luckCycle} → {fv.luckTransition.segments[1].luckCycle}（{fv.yearImpact.year} 年跨大運切換）
          </p>
        ) : lc ? (
          <>
            <div className="mt-0.5 font-medium text-secondary">{lc.pillar}{lc.ageRange ? `（${lc.ageRange}）` : ''} · {lc.overall}</div>
            {lc.helpfulFactors.map((f) => <p key={f} className="mt-1 text-[10px] text-emerald-300/80">＋ {f}</p>)}
            {lc.pressureFactors.map((f) => <p key={f} className="mt-1 text-[10px] text-rose-300/80">－ {f}</p>)}
          </>
        ) : <p className="mt-0.5 text-[10px] text-muted">起運歲數尚未驗證，僅以流年流月作系統初判。</p>}
      </div>
      {fv.luckTransition?.hasTransition && (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-2">
          <div className="text-[10px] font-semibold text-amber-200">大運切換分段</div>
          <p className="mt-0.5 text-[10px] text-secondary">
            {fv.yearImpact.year} 年跨越大運切換：切換前以{fv.luckTransition.segments[0]?.luckCycle}大運為背景，切換後以{fv.luckTransition.segments[1]?.luckCycle}大運為背景。年度解讀需分段看待。
          </p>
          {fv.luckTransition.segments.map((segment) => (
            <p key={`${segment.label}-${segment.luckCycle}`} className="mt-0.5 text-[10px] text-muted">
              {segment.label}：{segment.from} 至 {segment.to}，{segment.luckCycle}大運
            </p>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-[#f0c040]/20 bg-[#f0c040]/5 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-secondary">{y.year}</span>
          <span className="text-[#f0c040]">{y.pillar}</span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px]">{y.stemTenGod}</span>
          <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-[#fde68a]">{y.score.level}（{y.score.score}）</span>
        </div>
        <div className="mt-1 font-medium text-[#f0c040]">{y.theme}</div>
        {y.positiveFactors.map((f) => <p key={f} className="mt-1 text-[10px] text-emerald-300/80">機會：{f}</p>)}
        {y.riskFactors.map((f) => <p key={f} className="mt-1 text-[10px] text-rose-300/80">壓力：{f}</p>)}
        {y.luckCycleModifier.map((f) => <p key={f} className="mt-1 text-[10px] text-muted">大運調節：{f}</p>)}
        <p className="mt-1 text-[10px] text-secondary">結論：{y.conclusion}</p>
        <p className="mt-0.5 text-[10px] text-muted">{y.score.scoreNote}</p>
      </div>

      <div>
        <div className="text-[10px] font-semibold text-[#f0c040]">流月聯動</div>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {fv.monthImpacts.map((m) => (
            <div key={m.monthLabel} className="rounded-lg border border-white/5 bg-white/5 p-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted">{m.monthLabel}</span>
                <span className="text-sm font-bold text-[#f0c040]">{m.pillar}</span>
                <span className="rounded-full bg-black/30 px-1.5 py-0.5 text-[9px] text-muted">{m.score.level}</span>
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-secondary">{m.theme}</div>
              {m.positiveFactors.map((f) => <p key={f} className="mt-0.5 text-[10px] text-emerald-300/80">＋ {f}</p>)}
              {m.riskFactors.map((f) => <p key={f} className="mt-0.5 text-[10px] text-rose-300/80">－ {f}</p>)}
              <p className="mt-0.5 text-[10px] text-muted">建議：{m.suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/5 bg-white/5 p-2">
        <div className="text-[10px] font-semibold text-[#f0c040]">年度總結</div>
        <p className="mt-0.5 text-[10px] text-secondary">{fv.yearSummary.summary}</p>
        {fv.yearSummary.advice.map((a) => <p key={a} className="mt-0.5 text-[10px] text-muted">建議：{a}</p>)}
        {fv.yearSummary.warnings.map((w) => <p key={w} className="mt-0.5 text-[10px] text-rose-300/80">注意：{w}</p>)}
      </div>

      <p className="text-[10px] text-muted">{fv.note}</p>
    </div>
  )
}

const SOLAR_MODE_LABEL: Record<SolarTimeCorrection['mode'], string> = {
  none: '標準時間',
  meanSolarTime: '地方平太陽時',
  trueSolarTime: '真太陽時',
}

function fmtMin(n: number): string {
  const v = `${n > 0 ? '+' : ''}${n.toFixed(2)}`
  return `${v} 分鐘`
}

function SolarTimeCard({ correction }: { correction: SolarTimeCorrection }) {
  const c = correction
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs leading-relaxed text-secondary">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-[#f0c040]">時間校正</h4>
        <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-muted">{SOLAR_MODE_LABEL[c.mode]}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
        <span className="text-muted">原始出生時間</span><span>{c.originalDateTime}</span>
        <span className="text-muted">修正後時間</span><span>{c.correctedDateTime}</span>
        <span className="text-muted">出生地經度</span><span>{c.birthLongitude}°E</span>
        <span className="text-muted">標準經線</span><span>{c.standardMeridian}°E</span>
        {c.enabled && <><span className="text-muted">經度修正</span><span>{fmtMin(c.longitudeCorrectionMinutes)}</span></>}
        {c.mode === 'trueSolarTime' && <><span className="text-muted">均時差</span><span>{fmtMin(c.equationOfTimeMinutes)}</span></>}
        {c.enabled && <><span className="text-muted">總修正</span><span>{fmtMin(c.totalCorrectionMinutes)}</span></>}
        <span className="text-muted">四柱來源</span><span>lunar-javascript</span>
      </div>
      {c.pillarChange?.messages?.length ? (
        <div className="mt-2 space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-200">
          {c.pillarChange.messages.map((m, i) => <p key={i}>{m}</p>)}
        </div>
      ) : null}
      <p className="mt-2 text-[10px] text-subtle">{c.note}</p>
    </div>
  )
}

interface Props {
  tab: ChartTab
  result: AnalysisResult
  gender: Gender
  analysisYear: number
}

const RELATION_STYLE: Record<string, string> = {
  沖: 'border-red-500/30 bg-red-500/5 text-red-200',
  害: 'border-orange-500/30 bg-orange-500/5 text-orange-200',
  刑: 'border-purple-500/30 bg-purple-500/5 text-purple-200',
  合: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200',
  半合: 'border-blue-500/30 bg-blue-500/5 text-blue-200',
  局: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-200',
  和: 'border-white/10 bg-white/5 text-secondary',
}

const ELEMENT_BAR: Record<string, string> = {
  木: 'bg-gradient-to-r from-green-600 to-green-400',
  火: 'bg-gradient-to-r from-red-600 to-red-400',
  土: 'bg-gradient-to-r from-yellow-600 to-yellow-400',
  金: 'bg-gradient-to-r from-slate-400 to-slate-200',
  水: 'bg-gradient-to-r from-blue-600 to-blue-400',
}

// 流年流月加節氣說明用的常數
const FLOW_YEAR_NOTE = '八字流年以立春為界，非國曆 1 月 1 日。'
const FLOW_MONTH_NOTE = '流月以節氣切換，不等於農曆初一或國曆每月 1 日。'

// 五行分數模型說明
const ELEMENT_MODEL_NOTE_EXTRA = '五行分數為系統自訂權重模型，僅供相對比較，不代表傳統命理唯一標準。'

function TenGodDetailTable({ pillars }: { pillars: ReturnType<typeof pillarsToArray> }) {
  return (
    <div className="chart-detail-table overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      <div className="border-b border-white/10 px-4 py-3">
        <h4 className="text-sm font-bold text-[#f0c040]">十神詳表</h4>
        <p className="mt-1 text-xs text-muted">地支十神由地支藏干逐一計算，第一個藏干為主氣。</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-white/5 text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">柱位</th>
              <th className="px-3 py-2 font-medium">干支</th>
              <th className="px-3 py-2 font-medium">天干十神</th>
              <th className="px-3 py-2 font-medium">地支主氣</th>
              <th className="px-3 py-2 font-medium">藏干十神</th>
            </tr>
          </thead>
          <tbody>
            {pillars.map((p) => (
              <tr key={p.label} className="border-t border-white/5 text-secondary">
                <td className="whitespace-nowrap px-3 py-2 text-muted">{p.label}</td>
                <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#f0c040]">{p.stem}{p.branch}</td>
                <td className="whitespace-nowrap px-3 py-2">{p.stemTenGod}</td>
                <td className="whitespace-nowrap px-3 py-2">{p.branchMainQi.stem} / {p.branchMainQi.tenGod}</td>
                <td className="min-w-56 px-3 py-2">
                  {p.hiddenStemTenGods.map((h) => `${h.stem}：${h.tenGod}`).join('、')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function TabPanel({ tab, result, gender, analysisYear }: Props) {
  const {
    chart, elementStats, strength, strengthLabel, favorableElements, relations, liunian,
    liuyueDetails, dayunDetails, tenYearTrend, elementAdvice, luckStart, solarTimeCorrection,
  } = result
  const pillars = pillarsToArray(chart)
  const elements = ['木', '火', '土', '金', '水'] as const
  const maxStat = Math.max(...elements.map((e) => elementStats[e]))
  void gender

  if (tab === '命盤') {
    return (
      <div className="tab-panel-root space-y-4 p-2 sm:p-4">
        {chart.sourceNotes && (
          <div className="rounded-xl border border-[#f0c040]/20 bg-[#f0c040]/5 px-4 py-3 text-xs leading-relaxed text-secondary">
            {chart.sourceNotes.join('；')}。
          </div>
        )}
        {solarTimeCorrection && <SolarTimeCard correction={solarTimeCorrection} />}
        <ChartCircle chart={chart} />
        <TenGodDetailTable pillars={pillars} />
      </div>
    )
  }

  if (tab === '五行') {
    return (
      <div className="tab-panel-root space-y-4 p-4 sm:p-5">
        {/* 五行模型說明（固定顯示完整版） */}
        <div className="rounded-xl border border-white/5 bg-black/20 p-3 text-xs leading-relaxed text-muted">
          <p>{ELEMENT_MODEL_NOTE_EXTRA}</p>
          {result.elementModelNote && result.elementModelNote !== ELEMENT_MODEL_NOTE_EXTRA && (
            <p className="mt-1">{result.elementModelNote}</p>
          )}
          {result.elementReason && <p className="mt-2 text-secondary">{result.elementReason}</p>}
        </div>
        {elements.map((el) => (
          <div key={el} className="element-bar-row">
            <span className={`element-bar-label ${ELEMENT_CLASS[el]}`}>{el}</span>
            <div className="element-bar-track">
              <div
                className={`element-bar-fill ${ELEMENT_BAR[el]}`}
                style={{ width: `${(elementStats[el] / maxStat) * 100}%` }}
              />
            </div>
            <span className="element-bar-value">{elementStats[el].toFixed(1)}</span>
          </div>
        ))}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {elementAdvice.map((advice) => (
            <div key={advice.element} className="card-solid p-4">
              <h4 className={`text-sm font-bold ${ELEMENT_CLASS[advice.element]}`}>喜用 {advice.element} 補強</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                顏色：{advice.colors.join('、')}｜方位：{advice.directions.join('、')}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-secondary">
                職業：{advice.careers.join('、')}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-secondary">
                習慣：{advice.habits.join('、')}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (tab === '十神') {
    return (
      <div className="tab-panel-root space-y-4 p-4 sm:p-5">
        <TenGodDetailTable pillars={pillars} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.label} className="card-solid p-4 transition hover:border-[#f0c040]/20">
              <div className="text-xs text-muted">{p.label} · {p.stem}{p.branch}</div>
              <div className="mt-2 text-xl font-bold text-[#f0c040]">{p.stemTenGod}</div>
              <div className="mt-1 text-[10px] text-muted">
                主氣 {p.branchMainQi.stem} · {p.branchMainQi.tenGod}｜納音 · {p.nayin}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-secondary">
                藏干：{p.hiddenStemTenGods.map((h) => `${h.stem}(${h.qi}) ${h.tenGod}`).join('、')}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (tab === '強弱') {
    const basis = result.strengthBasis ?? []
    return (
      <div className="tab-panel-root p-5 sm:p-6 space-y-5">
        {/* 環形分數圖 */}
        <div className="flex flex-col items-center">
          <div className="relative inline-flex items-center justify-center">
            <svg className="h-32 w-32 -rotate-90 sm:h-40 sm:w-40" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f0c040" strokeWidth="8"
                strokeDasharray={`${strength * 2.64} 264`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[#f0c040] sm:text-4xl">{strength}%</span>
              <span className="text-xs text-muted mt-1">系統參考分數</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted text-center">{result.strengthScoreNote}</p>
        </div>

        {/* 結構化身強弱說明 */}
        <div className="rounded-xl border border-[#f0c040]/20 bg-[#f0c040]/5 p-4 space-y-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted text-xs">身強弱</span>
              <div className="font-bold text-[#f0c040] mt-0.5">{strengthLabel}</div>
            </div>
            <div>
              <span className="text-muted text-xs">可信度</span>
              <div className="font-medium text-secondary mt-0.5">{result.strengthConfidence || '中'}</div>
            </div>
            <div>
              <span className="text-muted text-xs">系統參考分數</span>
              <div className="font-medium text-secondary mt-0.5">{strength}%</div>
            </div>
          </div>
          {basis.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-[#f0c040] mb-1.5">判斷依據</div>
              <ul className="space-y-1">
                {basis.map((item) => (
                  <li key={item} className="text-xs leading-relaxed text-secondary flex gap-1.5">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#f0c040]/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 喜用初判 */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted text-xs">喜用初判</span>
          {favorableElements.map((e) => (
            <span key={e} className={`rounded-full border border-white/10 bg-black/20 px-3 py-0.5 text-xs font-medium ${ELEMENT_CLASS[e]}`}>{e}</span>
          ))}
        </div>
        {result.favorableNote && <p className="text-xs text-muted">{result.favorableNote}</p>}

        {result.strengthV2 && <StrengthV2Block v2={result.strengthV2} />}
      </div>
    )
  }

  if (tab === '刑沖') {
    return (
      <div className="tab-panel-root relation-list p-4 sm:p-5">
        {result.patternNote && (
          <div className="mb-3 rounded-xl border border-[#f0c040]/20 bg-[#f0c040]/5 px-4 py-3 text-xs leading-relaxed text-secondary">
            格局傾向：{result.pattern}。{result.patternNote}
          </div>
        )}
        {/* 只顯示規則引擎成立的項目，不作額外推斷 */}
        {relations.map((r) => (
          <div key={r.label} className={`relation-card border ${RELATION_STYLE[r.type] ?? RELATION_STYLE.和}`}>
            <span className="mr-2 rounded-md bg-black/30 px-2 py-0.5 text-[10px] font-medium">{r.type}</span>
            <span className="font-medium">{r.label}</span>
            <span className="text-muted"> — {safeRelationDesc(r.desc)}</span>
          </div>
        ))}
        <p className="pt-2 text-[10px] text-muted">
          自刑需同支出現兩次方成立；三合需三支俱全；六合只列合，未判定合化前不宣稱合化。
        </p>
      </div>
    )
  }

  if (tab === '大運') {
    return (
      <div className="tab-panel-root space-y-4 p-4 sm:p-5">
        <div className="rounded-xl border border-[#f0c040]/20 bg-[#f0c040]/5 p-4 text-xs leading-relaxed text-secondary">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              <span className="text-muted">大運順逆：</span>
              <span className="font-semibold text-[#f0c040]">{luckStart?.directionLabel ?? '未驗證'}</span>
            </span>
            {luckStart?.verified ? (
              <span>
                <span className="text-muted">起運：</span>
                <span className="font-semibold text-[#f0c040]">{luckStart.startAge}</span>
              </span>
            ) : (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">
                起運歲數尚未驗證
              </span>
            )}
          </div>
          {luckStart?.directionReason && (
            <p className="mt-1 text-muted">判斷依據：{luckStart.directionReason}</p>
          )}
          {luckStart?.verified ? (
            <p className="mt-1 text-muted">
              使用節氣：{luckStart.usedTermName}（{luckStart.usedTermDateText}）；出生與節氣相差約 {luckStart.totalDiffDays} 天。
            </p>
          ) : (
            <p className="mt-1 text-amber-200/90">{luckStart?.note}</p>
          )}
          {luckStart?.verified && <p className="mt-1 text-muted">{luckStart.method}（不同流派可能略有差異）</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {dayunDetails.map((d) => (
            <div key={d.age} className="card-solid p-4 transition hover:border-[#f0c040]/20">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] text-muted">{d.startAge ? `${d.startAge} 起` : d.age}</div>
                <span className="rounded-full bg-black/25 px-2 py-0.5 text-[10px] text-secondary">{d.score}</span>
              </div>
              <div className="mt-1 text-xl font-bold text-[#f0c040]">{d.pillar}</div>
              <div className="mt-1 text-xs text-muted">{d.tenGod} · {d.element} · 系統參考分數</div>
              {d.startAge && d.endAge && (
                <div className="mt-1 text-[10px] text-muted">{d.startAge} ~ {d.endAge}</div>
              )}
              <p className="mt-3 text-xs leading-relaxed text-secondary">{d.focus}</p>
              {d.verificationNote && <p className="mt-2 text-[10px] leading-relaxed text-muted">{d.verificationNote}</p>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* 流年流月頁（預設 tab） */
  return (
    <div className="tab-panel-root space-y-5 p-4 sm:p-5">
      {result.fortuneV2 && <FortuneV2Block fv={result.fortuneV2} />}
      <div>
        <h4 className="mb-2 text-xs font-semibold tracking-wide text-[#f0c040]">十年趨勢</h4>
        {result.liunianNote && <p className="mb-2 text-xs leading-relaxed text-muted">{result.liunianNote}</p>}
        <div className="trend-grid mb-5">
          {tenYearTrend.map((t) => (
            <div key={t.year} className="trend-item">
              <div className="text-[10px] text-muted">{t.year}</div>
              <div className="mt-1 text-sm font-bold text-[#f0c040]">{t.label}</div>
              <div className="mt-2 h-16 rounded-full bg-black/25 p-1">
                <div className="mx-auto rounded-full bg-gradient-to-t from-[#d4a017] to-[#fde68a]" style={{ height: `${t.score}%`, width: '0.55rem' }} />
              </div>
              <div className="mt-1 text-[10px] text-muted">參考 {t.score}</div>
            </div>
          ))}
        </div>

        {/* 流年區塊：加立春節氣說明 */}
        <div className="flow-note-row">
          <h4 className="text-xs font-semibold tracking-wide text-[#f0c040]">{analysisYear} 年 · 流年</h4>
          <span className="flow-note-badge rounded-full bg-[#f0c040]/10 px-2 py-0.5 text-[10px] text-[#fde68a]">{FLOW_YEAR_NOTE}</span>
        </div>
        <div className="space-y-2">
          {liunian.map((l) => (
            <div key={l.year}
              className={`rounded-xl border p-3 sm:p-4 ${l.year === analysisYear ? 'border-[#f0c040]/40 bg-[#f0c040]/5' : 'border-white/5 bg-black/20'}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-secondary">{l.year}</span>
                <span className="text-[#f0c040]">{l.pillar}</span>
                <span className="text-xs text-muted">{l.nayin}</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-secondary">{l.tenGod}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-secondary">{l.summary}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        {/* 流月區塊：加節氣說明 */}
        <div className="flow-note-row">
          <h4 className="text-xs font-semibold tracking-wide text-[#f0c040]">{analysisYear} 年 · 節氣流月</h4>
          <span className="flow-note-badge rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-300">{FLOW_MONTH_NOTE}</span>
        </div>
        {result.liuyueNote && <p className="mb-3 text-xs leading-relaxed text-muted">{result.liuyueNote}</p>}
        <div className="flow-month-grid">
          {liuyueDetails.map((m) => (
            <div key={m.month} className="card-solid p-2.5 text-center sm:p-3">
              <div className="text-[10px] text-muted">{m.label}</div>
              <div className="mt-1 text-sm font-bold text-[#f0c040]">{m.pillar}</div>
              <div className="mt-0.5 text-[10px] text-muted">{m.range}</div>
              <div className="mt-0.5 text-[10px] text-muted">{m.tenGod} · 參考 {m.score}</div>
              <p className="mt-2 text-[10px] leading-relaxed text-secondary">{m.advice}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
