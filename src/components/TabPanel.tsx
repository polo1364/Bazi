import type { AnalysisResult, ChartTab, Gender } from '../types'
import { ELEMENT_CLASS } from '../lib/constants'
import { getDayun } from '../lib/analysis'
import { pillarsToArray } from '../lib/bazi'
import ChartCircle from './ChartCircle'

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
  和: 'border-white/10 bg-white/5 text-secondary',
}

const ELEMENT_BAR: Record<string, string> = {
  木: 'bg-gradient-to-r from-green-600 to-green-400',
  火: 'bg-gradient-to-r from-red-600 to-red-400',
  土: 'bg-gradient-to-r from-yellow-600 to-yellow-400',
  金: 'bg-gradient-to-r from-slate-400 to-slate-200',
  水: 'bg-gradient-to-r from-blue-600 to-blue-400',
}

export default function TabPanel({ tab, result, gender, analysisYear }: Props) {
  const { chart, elementStats, strength, strengthLabel, favorableElements, relations, liunian, liuyue } = result
  const pillars = pillarsToArray(chart)
  const elements = ['木', '火', '土', '金', '水'] as const
  const maxStat = Math.max(...elements.map((e) => elementStats[e]))

  if (tab === '命盤') {
    return <div className="p-2 sm:p-4"><ChartCircle chart={chart} /></div>
  }

  if (tab === '五行') {
    return (
      <div className="space-y-4 p-4 sm:p-5">
        {elements.map((el) => (
          <div key={el} className="flex items-center gap-3">
            <span className={`w-6 text-sm font-semibold sm:w-8 ${ELEMENT_CLASS[el]}`}>{el}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/30 sm:h-4">
              <div className={`h-full rounded-full transition-all duration-700 ${ELEMENT_BAR[el]}`}
                style={{ width: `${(elementStats[el] / maxStat) * 100}%` }} />
            </div>
            <span className="w-10 text-right text-xs tabular-nums text-muted">{elementStats[el].toFixed(1)}</span>
          </div>
        ))}
      </div>
    )
  }

  if (tab === '十神') {
    return (
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5">
        {pillars.map((p) => (
          <div key={p.label} className="card-solid p-4 transition hover:border-[#f0c040]/20">
            <div className="text-xs text-muted">{p.label} · {p.stem}{p.branch}</div>
            <div className="mt-2 text-xl font-bold text-[#f0c040]">{p.tenGod}</div>
            <div className="mt-1 text-[10px] text-muted">納音 · {p.nayin}</div>
          </div>
        ))}
      </div>
    )
  }

  if (tab === '強弱') {
    return (
      <div className="p-6 text-center sm:p-8">
        <div className="relative inline-flex items-center justify-center">
          <svg className="h-32 w-32 -rotate-90 sm:h-40 sm:w-40" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#f0c040" strokeWidth="8"
              strokeDasharray={`${strength * 2.64} 264`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-[#f0c040] sm:text-4xl">{strength}%</span>
            <span className="text-sm text-secondary">身{strengthLabel}</span>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
          <span className="text-muted">喜用神</span>
          {favorableElements.map((e) => (
            <span key={e} className={`rounded-full border border-white/10 bg-black/20 px-3 py-0.5 text-xs font-medium ${ELEMENT_CLASS[e]}`}>{e}</span>
          ))}
        </div>
      </div>
    )
  }

  if (tab === '刑沖') {
    return (
      <div className="space-y-2 p-4 sm:p-5">
        {relations.map((r) => (
          <div key={r.label} className={`rounded-xl border px-4 py-3 text-sm ${RELATION_STYLE[r.type] ?? RELATION_STYLE.和}`}>
            <span className="mr-2 rounded-md bg-black/30 px-2 py-0.5 text-[10px] font-medium">{r.type}</span>
            <span className="font-medium">{r.label}</span>
            <span className="text-muted"> — {r.desc}</span>
          </div>
        ))}
      </div>
    )
  }

  if (tab === '大運') {
    const dayun = getDayun(chart, gender)
    return (
      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4 sm:p-5">
        {dayun.map((d) => (
          <div key={d.age} className="card-solid p-3 text-center transition hover:border-[#f0c040]/20 sm:p-4">
            <div className="text-[10px] text-muted">{d.age}</div>
            <div className="mt-1 text-lg font-bold text-[#f0c040] sm:text-xl">{d.pillar}</div>
            <div className="mt-1 text-[10px] text-muted">{d.tenGod}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5 p-4 sm:p-5">
      <div>
        <h4 className="mb-3 text-xs font-semibold tracking-wide text-[#f0c040]">{analysisYear} 年 · 流年</h4>
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
        <h4 className="mb-3 text-xs font-semibold tracking-wide text-[#f0c040]">{analysisYear} 年 · 流月</h4>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {liuyue.map((m) => (
            <div key={m.month} className="card-solid p-2.5 text-center sm:p-3">
              <div className="text-[10px] text-muted">{m.label}</div>
              <div className="mt-1 text-sm font-bold text-[#f0c040]">{m.pillar}</div>
              <div className="mt-0.5 text-[10px] text-muted">{m.tenGod}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
