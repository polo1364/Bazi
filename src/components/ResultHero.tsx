import type { AnalysisResult, BirthInput } from '../types'
import { pillarsToArray } from '../lib/bazi'

interface Props {
  input: BirthInput
  result: AnalysisResult
}

function formatBirth(input: BirthInput): string {
  if (input.inputMode === 'manual' || input.inputMode === 'upload') {
    const p = input.manualPillars
    if (p.year && p.month && p.day && p.hour) {
      return `${p.year} · ${p.month} · ${p.day} · ${p.hour}`
    }
    return '手動四柱'
  }
  const parts: string[] = []
  if (input.year) parts.push(`${input.year} 年`)
  if (input.month) parts.push(`${input.month} 月`)
  if (input.day) parts.push(`${input.day} 日`)
  if (input.uncertainHour) parts.push('子時（不確定）')
  else if (input.hour !== '') {
    const labels = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    parts.push(`${labels[input.hour] ?? ''}時`)
  }
  return parts.join(' ') || '—'
}

export default function ResultHero({ input, result }: Props) {
  const pillars = pillarsToArray(result.chart)
  const pillarStr = pillars.map((p) => `${p.stem}${p.branch}`).join(' ')

  return (
    <section className="result-hero animate-fade-in">
      <div className="result-hero-main">
        <div className="result-hero-badge">推演完成</div>
        <h2 className="result-hero-title">{input.name || '未命名命盤'}</h2>
        <p className="result-hero-meta">
          {formatBirth(input)}
          {input.gender && ` · ${input.gender}`}
          {input.analysisYear && ` · ${input.analysisYear} 年運勢`}
        </p>
        {input.topic && (
          <span className="result-hero-topic">{input.topic}</span>
        )}
      </div>
      <div className="result-hero-chart">
        <div className="result-hero-label">四柱</div>
        <div className="result-hero-pillars">{pillarStr}</div>
        <div className="result-hero-dm">
          日主 <strong>{result.chart.dayMaster}</strong>
          <span className="text-muted"> · 身{result.strengthLabel}</span>
        </div>
      </div>
    </section>
  )
}
