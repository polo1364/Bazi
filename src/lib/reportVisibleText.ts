import type { AnalysisResult } from '../types'
import { pillarsToArray } from './bazi'
import { safeRelationDesc } from './relationDisplay'
import { buildFortuneV2YearlySection, formatMonthImpactSummary } from './fortune/monthImpactDisplay'
import { buildPillarNarrative, buildPillarNaturalSummary } from './narrative/pillarNarrative'
import { buildUsefulGodsAdvice } from './narrative/usefulGodsAdvice'
import { buildHealthAdvice } from './narrative/healthAdvice'
import { buildPersonalizedReportExplanation } from './report/personalizedExplanation'

function pushText(lines: string[], value: unknown) {
  if (typeof value === 'string') {
    if (value.trim()) lines.push(value)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item) => pushText(lines, item))
  }
}

/**
 * 收集實際會顯示於 UI / PDF / 使用者報告中的文字。
 *
 * 不收集 validatorErrors、debug logs、prompt、sanitizer 禁止詞表、測試描述、
 * console.warn 原文等內部文字，避免 validator 掃到自己的錯誤說明造成假陽性。
 */
export function collectVisibleReportText(result: AnalysisResult, options: { includePersonalizedExplanation?: boolean } = {}): string {
  const lines: string[] = []
  const pillars = pillarsToArray(result.chart)

  pushText(lines, result.summary)
  pushText(lines, result.detailText)
  pushText(lines, result.topicAnalysis)
  pushText(lines, result.aiSections ? Object.values(result.aiSections) : [])
  pushText(lines, result.aiQuestions?.map((q) => q.answer) ?? [])

  lines.push(`四柱：${pillars.map((p) => `${p.label}${p.stem}${p.branch}`).join('　')}`)
  lines.push(`日主：${result.chart.dayMaster}${result.chart.dayMasterElement}`)
  lines.push(`身強弱：${result.strengthV2?.label || result.strengthLabel}（${result.strengthV2 ? '旺衰 v2 系統初判' : '系統初判'}）`)
  lines.push('五行簡化模型參考')
  lines.push(`簡化模型參考：${result.strengthLabel}`)
  lines.push(`簡化模型分數：${result.strength}%`)
  lines.push('正式身強弱以第 5 頁旺衰 v2 結果為準。')
  for (const p of pillars) {
    lines.push(`${p.label}${p.stem}${p.branch} 天干十神：${p.stemTenGod}`)
    lines.push(`${p.label}${p.stem}${p.branch} 藏干十神：${p.hiddenStemTenGods.map((h) => `${h.stem}(${h.qi}) ${h.tenGod}`).join('、')}`)
    lines.push(buildPillarNaturalSummary({
      pillarName: p.label,
      stem: p.stem,
      branch: p.branch,
      stemTenGod: p.stemTenGod,
      branchMainQi: p.branchMainQi,
      hiddenStems: p.hiddenStemTenGods,
    }))
    lines.push(buildPillarNarrative({
      pillarName: p.label,
      stem: p.stem,
      branch: p.branch,
      stemTenGod: p.stemTenGod,
      branchMainQi: p.branchMainQi,
      hiddenStems: p.hiddenStemTenGods,
    }))
  }
  pushText(lines, buildUsefulGodsAdvice(result))
  pushText(lines, buildHealthAdvice(result))

  pushText(lines, result.relations.map((r) => `${r.type} ${r.label} ${safeRelationDesc(r.desc)}`))
  pushText(lines, result.dayunDetails.map((d) => `${d.pillar} ${d.tenGod} ${d.focus}`))
  pushText(lines, result.liunian.map((l) => `${l.year} ${l.pillar} ${l.tenGod} ${l.summary}`))
  const monthImpactByPillar = Object.fromEntries((result.fortuneV2?.monthImpacts ?? []).map((m) => [m.pillar, m]))
  pushText(lines, result.liuyueDetails.map((m) => {
    const impact = monthImpactByPillar[m.pillar]
    return `${m.label} ${m.pillar} ${impact ? formatMonthImpactSummary(impact) : m.advice}`
  }))

  if (result.luckStart) {
    lines.push(`大運順逆：${result.luckStart.directionLabel}`)
    pushText(lines, result.luckStart.directionReason)
    pushText(lines, result.luckStart.note)
    pushText(lines, result.luckStart.method)
    pushText(lines, result.luckStart.usedTermName)
  }

  if (result.solarTimeCorrection) {
    const c = result.solarTimeCorrection
    lines.push(`時間校正模式：${c.mode}`)
    lines.push(`出生地經度：${c.birthLongitude}`)
    lines.push(`原始出生時間：${c.originalDateTime}`)
    lines.push(`修正後時間：${c.correctedDateTime}`)
    pushText(lines, c.note)
    pushText(lines, c.pillarChange?.messages ?? [])
  }

  if (result.strengthV2) {
    const v2 = result.strengthV2
    lines.push('日主旺衰 v2')
    lines.push(`旺衰v2：${v2.label} 可信度${v2.confidence}`)
    pushText(lines, [v2.deLing.reason, v2.deDi.reason, v2.deShi.reason])
    pushText(lines, v2.roots.roots.map((r) => r.reason))
    pushText(lines, v2.stemSupport.summary)
    pushText(lines, v2.reasons)
    pushText(lines, v2.usefulGods.priority.map((p) => p.reason))
    pushText(lines, v2.usefulGods.avoid.map((a) => a.reason))
    pushText(lines, [v2.pattern.patternLabel, ...v2.pattern.reasons, v2.pattern.warning, v2.note])
  } else {
    pushText(lines, result.strengthBasis ?? [])
  }

  if (result.fortuneV2) {
    const fv = result.fortuneV2
    if (fv.luckCycleImpact) {
      lines.push(`${fv.luckCycleImpact.pillar} ${fv.luckCycleImpact.overall}`)
      pushText(lines, fv.luckCycleImpact.helpfulFactors)
      pushText(lines, fv.luckCycleImpact.pressureFactors)
    }
    if (fv.luckTransition?.hasTransition) {
      lines.push(`${fv.yearImpact.year} 年跨越大運切換，切換前以${fv.luckTransition.segments[0]?.luckCycle}大運為背景，切換後以${fv.luckTransition.segments[1]?.luckCycle}大運為背景。`)
      pushText(lines, fv.luckTransition.segments.map((s) => `${s.label} ${s.from} ${s.to} ${s.luckCycle}`))
      pushText(lines, fv.luckTransition.note)
    } else if (fv.luckTransition?.verified === false) {
      pushText(lines, fv.luckTransition.note)
    }
    lines.push(`${fv.yearImpact.year} ${fv.yearImpact.pillar} ${fv.yearImpact.theme}`)
    pushText(lines, fv.yearImpact.positiveFactors)
    pushText(lines, fv.yearImpact.riskFactors)
    pushText(lines, fv.yearImpact.luckCycleModifier)
    pushText(lines, fv.yearImpact.conclusion)
    for (const m of fv.monthImpacts) {
      lines.push(`${m.monthLabel} ${m.pillar} ${m.theme}`)
      lines.push(`${m.monthLabel} ${m.pillar} ${formatMonthImpactSummary(m)}`)
      pushText(lines, m.positiveFactors)
      pushText(lines, m.riskFactors)
      pushText(lines, m.suggestion)
    }
    pushText(lines, buildFortuneV2YearlySection(fv.monthImpacts))
    lines.push(`較有支持：${fv.yearSummary.keyMonths.supportive.join('、') || '無'}`)
    lines.push(`壓力較高：${fv.yearSummary.keyMonths.pressure.join('、') || '暫無明顯月份'}`)
    lines.push(`機會與壓力並存：${fv.yearSummary.keyMonths.neutral.join('、') || '無'}`)
    pushText(lines, [fv.yearSummary.summary, ...fv.yearSummary.advice, ...fv.yearSummary.warnings, fv.note])
  }

  if (result.wuge) {
    const w = result.wuge
    lines.push(`姓名：${w.chars?.map((c) => c.char).join('') ?? ''}`)
    pushText(lines, w.chars?.map((c) => `${c.char} ${c.strokes}畫 ${c.source ?? ''}`) ?? [])
    lines.push(`五格：天格${w.天格} 人格${w.人格} 地格${w.地格} 外格${w.外格} 總格${w.總格}`)
    if (w.wugeFortune?.verified) pushText(lines, Object.values(w.wugeFortune.items).flatMap((item) => [item.level, item.title, item.summary]))
    if (w.sancai && 'combination' in w.sancai) pushText(lines, [w.sancai.combination, w.sancai.level, w.sancai.summary, w.sancai.source])
  }
  pushText(lines, result.nameSummary)

  pushText(lines, result.shensha?.map((s) => [
    s.name,
    s.status,
    s.basis,
    s.description || s.desc,
    s.reason,
  ]) ?? [])
  if (result.ruleVersions) {
    lines.push(`規則版本：旺衰 ${result.ruleVersions.strengthV2Engine}｜歲運 ${result.ruleVersions.fortuneV2Engine}｜神煞 ${result.ruleVersions.shenshaEngine}`)
  }
  if (options.includePersonalizedExplanation !== false) {
    const article = buildPersonalizedReportExplanation(result)
    lines.push(article.title)
    pushText(lines, article.subtitle)
    article.sections.forEach((section) => {
      lines.push(section.heading)
      pushText(lines, section.body)
    })
  }

  return lines.filter((text) => String(text).trim()).join('\n')
}

export const collectReportVisibleText = collectVisibleReportText
