import { STEM_ELEMENTS } from './constants.ts'
import { CONTROLS, GENERATES } from './tenGodEngine.js'

const ELEMENTS = ['木', '火', '土', '金', '水']

function resourceOf(dm) {
  return ELEMENTS.find((e) => GENERATES[e] === dm)
}

function officerOf(dm) {
  return ELEMENTS.find((e) => CONTROLS[e] === dm)
}

function pillarsArray(chart) {
  return [chart.year, chart.month, chart.day, chart.hour].filter(Boolean)
}

function elementOfStem(stem) {
  return STEM_ELEMENTS[stem]
}

function collectSources(chart, element) {
  const transparents = []
  const roots = []
  for (const p of pillarsArray(chart)) {
    if (elementOfStem(p.stem) === element) {
      transparents.push(`${p.label}${p.stem}`)
    }
    const hidden = p.hiddenStemTenGods || p.hiddenStems || []
    for (const h of hidden) {
      const hStem = typeof h === 'string' ? h : h.stem
      if (elementOfStem(hStem) === element) {
        roots.push(`${p.branch}藏${hStem}`)
      }
    }
  }
  return { transparents, roots }
}

function weight(chart, elementStats, element) {
  if (elementStats && typeof elementStats[element] === 'number') {
    return elementStats[element]
  }
  const { transparents, roots } = collectSources(chart, element)
  return transparents.length * 2 + roots.length
}

function describeSources(element, sources) {
  const parts = []
  if (sources.transparents.length) parts.push(`${sources.transparents.join('、')}透干`)
  if (sources.roots.length) parts.push(`${sources.roots.join('、')}為根`)
  if (!parts.length) return ''
  return `${element}（${parts.join('，')}）`
}

/**
 * 依命盤實際干支計算身強弱，不接受硬寫結果。
 * @param {object} chart - bazi.ts 產生的命盤（含日主、四柱、藏干）
 * @param {object} [elementStats] - 五行權重模型（可選，用於加權分數）
 */
export function analyzeStrength(chart, elementStats) {
  if (!chart || !chart.dayMasterElement || !chart.dayMaster) {
    throw new Error('Missing required input')
  }

  const dm = chart.dayMasterElement
  const output = GENERATES[dm]
  const wealth = CONTROLS[dm]
  const officer = officerOf(dm)
  const resource = resourceOf(dm)

  const selfSources = collectSources(chart, dm)
  const resourceSources = collectSources(chart, resource)
  const outputSources = collectSources(chart, output)
  const wealthSources = collectSources(chart, wealth)
  const officerSources = collectSources(chart, officer)

  const support = weight(chart, elementStats, dm) + weight(chart, elementStats, resource)
  const oppose =
    weight(chart, elementStats, output) +
    weight(chart, elementStats, wealth) +
    weight(chart, elementStats, officer)

  const total = support + oppose
  const ratio = total === 0 ? 0 : (support - oppose) / total
  const score = Math.max(0, Math.min(100, Math.round(50 + ratio * 40)))

  let label
  if (score >= 60) label = '偏強'
  else if (score >= 50) label = '中和'
  else if (score >= 42) label = '中和偏弱'
  else label = '偏弱'

  const supportText = [describeSources(dm, selfSources), describeSources(resource, resourceSources)]
    .filter(Boolean)
    .join('、')
  const opposeText = [
    describeSources(output, outputSources),
    describeSources(wealth, wealthSources),
    describeSources(officer, officerSources),
  ]
    .filter(Boolean)
    .join('；')

  const reasons = []
  reasons.push(
    supportText
      ? `${chart.dayMaster}${dm}日主有${supportText}相助，並非全無根氣`
      : `${chart.dayMaster}${dm}日主缺乏明顯幫身與生扶`,
  )
  reasons.push(
    opposeText
      ? `同時受到${opposeText}等洩、剋、耗之力`
      : '命局中洩、剋、耗之力不明顯',
  )
  reasons.push(`綜合幫身與耗洩力量比較，系統將其作「${label}」初判（參考分數 ${score}）`)

  return {
    label,
    confidence: '中',
    score,
    scoreNote: '此分數為系統模型估算，不是命理絕對值',
    reasons,
  }
}

/**
 * 由完整分析結果（analysis.ts）取出身強弱模型，供報告層使用。
 */
export function getStrengthModel(result) {
  if (!result) throw new Error('Missing required input')
  if (result.chart) {
    const model = analyzeStrength(result.chart, result.elementStats)
    return {
      ...model,
      label: result.strengthLabel || model.label,
      score: typeof result.strength === 'number' ? result.strength : model.score,
      reasons: result.strengthBasis && result.strengthBasis.length ? result.strengthBasis : model.reasons,
    }
  }
  return {
    label: result.strengthLabel,
    confidence: result.strengthConfidence || '中',
    score: result.strength,
    scoreNote: result.strengthScoreNote || '此分數為系統模型估算，不是命理絕對值',
    reasons: result.strengthBasis || [],
  }
}
