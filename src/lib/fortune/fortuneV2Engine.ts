import { STEM_ELEMENTS, BRANCH_ELEMENTS } from '../constants'
import { getTenGod } from '../tenGodEngine.js'
import { computeBranchRelations } from '../relations'
import type { Element } from '../../types'

/**
 * 歲運解讀 v2：大運 × 流年 × 流月聯動分析。
 *
 * 重要聲明：
 * 本引擎所有主題、分數、等級皆為「系統模型初判」，用於排序與提示，不是命理絕對值，
 * 不輸出「必定發財／必定破財／必有災／一定升遷」等絕對斷語。所有判斷均引用
 * strengthV2Engine 的喜用神與身強弱結果，不自行改判旺衰。
 * 本檔不修改既有八字核心演算法（tenGodEngine、relations 等）。
 */

export const FORTUNE_V2_NOTE = '歲運分析為系統模型初判，需搭配實際情境參考，不作絕對吉凶斷語。'

const GENERATES: Record<Element, Element> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
const CONTROLS: Record<Element, Element> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }
const ELEMENT_ORDER: Element[] = ['木', '火', '土', '金', '水']

type ForceCategory = 'support' | 'resource' | 'output' | 'wealth' | 'control'

export interface FortuneNatal {
  pillars: Record<'year' | 'month' | 'day' | 'hour', { stem: string; branch: string }>
  dayStem: string
  dayElement: Element
}

export interface FortuneStrengthV2 {
  label: string
  useful: Element[]
  avoid: Element[]
  patternLabel?: string
  confidence?: string
}

function elementOfStem(stem: string): Element {
  return STEM_ELEMENTS[stem]
}

function elementOfBranch(branch: string): Element {
  return BRANCH_ELEMENTS[branch]
}

function categoryOf(dayElement: Element, element: Element): ForceCategory {
  if (element === dayElement) return 'support'
  if (GENERATES[element] === dayElement) return 'resource'
  if (GENERATES[dayElement] === element) return 'output'
  if (CONTROLS[dayElement] === element) return 'wealth'
  return 'control'
}

function natalBranches(natal: FortuneNatal): string[] {
  return [natal.pillars.year.branch, natal.pillars.month.branch, natal.pillars.day.branch, natal.pillars.hour.branch]
}

function isWeak(label: string): boolean {
  return label.includes('弱')
}

function isStrong(label: string): boolean {
  return label.includes('強')
}

/** 取出與外來地支（大運／流年／流月支）相關的刑沖合害。 */
function interactionsWithBranch(natal: FortuneNatal, branch: string, label: string) {
  const relations = computeBranchRelations([...natalBranches(natal), branch])
  return relations
    .filter((r) => r.type !== '和' && r.branches.includes(branch))
    .map((r) => ({ type: r.type, name: r.name, branches: r.branches, desc: r.desc, with: label }))
}

function uniqueElements(elements: Element[]): Element[] {
  return ELEMENT_ORDER.filter((e) => elements.includes(e))
}

/**
 * 大運對本命的影響。
 */
export function analyzeLuckCycleImpact({ natal, strengthV2, luckCycle }: {
  natal: FortuneNatal
  strengthV2: FortuneStrengthV2
  luckCycle: { pillar: string; stem: string; branch: string; ageRange?: string; stemTenGod?: string } | null
}) {
  if (!luckCycle) return null
  const { useful, avoid } = strengthV2
  const stemEl = elementOfStem(luckCycle.stem)
  const branchEl = elementOfBranch(luckCycle.branch)
  const stemTenGod = luckCycle.stemTenGod || getTenGod(natal.dayStem, luckCycle.stem)

  const helpfulFactors: string[] = []
  const pressureFactors: string[] = []

  if (useful.includes(stemEl)) {
    helpfulFactors.push(`${luckCycle.stem}${stemEl}為${stemTenGod}，對${natal.dayStem}有生扶作用，符合喜用${stemEl}的方向`)
  } else if (avoid.includes(stemEl)) {
    pressureFactors.push(`${luckCycle.stem}${stemEl}為${stemTenGod}，落在忌神方向，可能增加壓力或內耗`)
  }

  if (useful.includes(branchEl)) {
    helpfulFactors.push(`大運地支${luckCycle.branch}${branchEl}氣偏喜用，較能補命局所需`)
  } else if (avoid.includes(branchEl)) {
    const dup = natalBranches(natal).includes(luckCycle.branch) ? `${luckCycle.branch}與本命同支重疊，` : ''
    pressureFactors.push(`${dup}${luckCycle.branch}${branchEl}落在忌神方向，可能加重${branchEl === '土' ? '官殺與濕土' : branchEl}壓力`)
  }

  const interactions = interactionsWithBranch(natal, luckCycle.branch, `大運${luckCycle.pillar}`)

  let overall: string
  if (helpfulFactors.length && pressureFactors.length) overall = '偏有助，但伴隨壓力，需與流年流月合看'
  else if (helpfulFactors.length) overall = '偏有助'
  else if (pressureFactors.length) overall = '壓力偏重，宜穩守'
  else overall = '影響中性，需與流年流月合看'

  return {
    pillar: luckCycle.pillar,
    stem: luckCycle.stem,
    branch: luckCycle.branch,
    stemTenGod,
    branchElement: branchEl,
    ageRange: luckCycle.ageRange,
    overall,
    helpfulFactors,
    pressureFactors,
    interactions,
    confidence: strengthV2.confidence || '中',
    note: '大運解讀需與流年流月合看，為系統模型初判。',
  }
}

/**
 * 評分模型。分數只是系統模型，不是命理絕對值。
 */
export function scoreFortuneImpact({ natal, strengthV2, stem, branch, interactions, luckCycleImpact }: {
  natal: FortuneNatal
  strengthV2: FortuneStrengthV2
  stem: string
  branch: string
  interactions: Array<{ type: string }>
  luckCycleImpact?: { helpfulFactors: string[] } | null
}) {
  const { useful, avoid } = strengthV2
  const els = [elementOfStem(stem), elementOfBranch(branch)]
  const usefulHits = els.filter((e) => useful.includes(e)).length
  const avoidHits = els.filter((e) => avoid.includes(e)).length

  const usefulSupportScore = usefulHits * 6
  const avoidPressureScore = avoidHits * 5

  // 十神主題強度：僅作參考，不直接當吉凶，故不計入最終分數。
  const stemTenGod = getTenGod(natal.dayStem, stem)
  const tenGodThemeScore = stemTenGod.includes('財') || stemTenGod.includes('官') || stemTenGod.includes('殺') ? 2 : 1

  let interactionRiskScore = 0
  for (const it of interactions) {
    if (it.type === '沖' || it.type === '刑') interactionRiskScore += 4
    else if (it.type === '害') interactionRiskScore += 2
    else if (it.type === '合' || it.type === '半合' || it.type === '局') interactionRiskScore -= 2
  }
  interactionRiskScore = Math.max(0, interactionRiskScore)

  const luckCycleBufferScore = luckCycleImpact && luckCycleImpact.helpfulFactors.length ? 6 : 0

  const score = Math.max(0, Math.min(100,
    50 + usefulSupportScore - avoidPressureScore - interactionRiskScore + luckCycleBufferScore,
  ))

  let level: '偏有利' | '平穩' | '機會與壓力並存' | '壓力偏高'
  if (score >= 66) level = '偏有利'
  else if (score >= 52) level = '平穩'
  else if (score >= 38) level = '機會與壓力並存'
  else level = '壓力偏高'

  return {
    score,
    level,
    scoreNote: '此分數為系統模型，用於排序與提示，不代表絕對吉凶。',
    breakdown: {
      usefulSupportScore,
      avoidPressureScore,
      tenGodThemeScore,
      interactionRiskScore,
      luckCycleBufferScore,
    },
  }
}

function themeByTenGod(tenGod: string): string {
  if (tenGod.includes('財')) return '財星明顯，機會與耗身並存'
  if (tenGod.includes('官') || tenGod.includes('殺')) return '官殺主題，責任與壓力並存'
  if (tenGod.includes('印')) return '印星主題，資源與學習機會增加'
  if (tenGod.includes('食') || tenGod.includes('傷')) return '食傷主題，表達與輸出增加'
  return '比劫主題，競爭與合作並存'
}

function describeLuckSegment(natal: FortuneNatal, strengthV2: FortuneStrengthV2, pillar: string): string {
  const stem = pillar[0]
  const branch = pillar[1]
  const stemEl = elementOfStem(stem)
  const branchEl = elementOfBranch(branch)
  const tenGod = getTenGod(natal.dayStem, stem)
  const stemSupport = strengthV2.useful.includes(stemEl) ? '支援' : ''
  const branchSupport = strengthV2.useful.includes(branchEl) ? `與${branch}${branchEl}支援` : ''
  const branchPressure = strengthV2.avoid.includes(branchEl) ? `但${branch}${branchEl}也帶來壓力` : ''
  return `${pillar}大運有${stem}${stemEl}${tenGod}${stemSupport}${branchSupport || branchPressure ? `${branchSupport}${branchPressure}` : ''}`
}

/**
 * 流年對本命的影響。以 2026 丙午為測試重點。
 */
export function analyzeYearImpact({ natal, strengthV2, luckCycleImpact, year }: {
  natal: FortuneNatal
  strengthV2: FortuneStrengthV2
  luckCycleImpact: ReturnType<typeof analyzeLuckCycleImpact>
  year: { year: number; pillar: string; stem: string; branch: string; stemTenGod?: string }
}) {
  const { useful, avoid, label } = strengthV2
  const stemEl = elementOfStem(year.stem)
  const branchEl = elementOfBranch(year.branch)
  const stemTenGod = year.stemTenGod || getTenGod(natal.dayStem, year.stem)
  const weak = isWeak(label)

  const positiveFactors: string[] = []
  const riskFactors: string[] = []
  const luckCycleModifier: string[] = []

  if (stemTenGod.includes('財')) {
    positiveFactors.push(`${year.stem}${stemEl}為${natal.dayStem}${stemTenGod}，代表收入、資源配置與實務成果議題被凸顯`)
  } else if (stemTenGod.includes('官') || stemTenGod.includes('殺')) {
    positiveFactors.push(`${year.stem}${stemEl}為${stemTenGod}，代表事業、制度與責任議題受到關注`)
  } else if (stemTenGod.includes('印')) {
    positiveFactors.push(`${year.stem}${stemEl}為${stemTenGod}，利於學習、資源整理與貴人支持`)
  } else if (stemTenGod.includes('食') || stemTenGod.includes('傷')) {
    positiveFactors.push(`${year.stem}${stemEl}為${stemTenGod}，利於表達、創意與主動輸出`)
  } else {
    positiveFactors.push(`${year.stem}${stemEl}為${stemTenGod}，利於人際合作與自我推進`)
  }
  if (useful.includes(stemEl)) {
    positiveFactors.push(`天干${stemEl}落在喜用方向，較能提供助力`)
  }

  if (stemTenGod.includes('財') && weak) {
    riskFactors.push(`${year.branch}${branchEl}旺，對${label}的${natal.dayStem}而言，財旺也可能形成耗身與支出壓力`)
  } else if (avoid.includes(branchEl)) {
    riskFactors.push(`${year.branch}${branchEl}落在忌神方向，對${label}日主而言壓力較高`)
  }
  if (avoid.includes(stemEl) && !riskFactors.length) {
    riskFactors.push(`天干${stemEl}落在忌神方向，需留意相應壓力`)
  }

  if (luckCycleImpact && luckCycleImpact.helpfulFactors.length) {
    luckCycleModifier.push(`若當前大運${luckCycleImpact.pillar}提供${luckCycleImpact.stem}${luckCycleImpact.stemTenGod}，可部分補足承接能力`)
  } else if (luckCycleImpact && luckCycleImpact.pressureFactors.length) {
    luckCycleModifier.push(`若當前大運${luckCycleImpact.pillar}偏忌神方向，流年壓力可能被放大，宜更保守`)
  }

  const interactions = interactionsWithBranch(natal, year.branch, `流年${year.pillar}`)
  const score = scoreFortuneImpact({ natal, strengthV2, stem: year.stem, branch: year.branch, interactions, luckCycleImpact })

  let conclusion: string
  if (stemTenGod.includes('財')) {
    conclusion = '此年不宜簡化為大財年，應視為財務機會與壓力同步提高的一年，宜保守規劃'
  } else if (stemTenGod.includes('官') || stemTenGod.includes('殺')) {
    conclusion = '此年事業與責任主題明顯，機會與壓力並存，宜量力承接，不作絕對吉凶斷語'
  } else {
    conclusion = `此年以${stemTenGod}主題為主，宜依實際情境與大運流月合看，不作單一年份定論`
  }

  return {
    year: year.year,
    pillar: year.pillar,
    stem: year.stem,
    branch: year.branch,
    stemTenGod,
    branchElement: branchEl,
    theme: themeByTenGod(stemTenGod),
    positiveFactors,
    riskFactors,
    luckCycleModifier,
    interactions,
    conclusion,
    score,
    confidence: strengthV2.confidence || '中',
  }
}

function monthTheme(dayElement: Element, stemEl: Element, branchEl: Element): string {
  const cats = [categoryOf(dayElement, stemEl), categoryOf(dayElement, branchEl)]
  const els = uniqueElements([stemEl, branchEl])
  const drains = cats.filter((c) => c === 'output' || c === 'wealth' || c === 'control')
  const supports = cats.filter((c) => c === 'resource' || c === 'support')
  if (drains.length === 2) {
    const hasOutput = cats.includes('output')
    const hasWealth = cats.includes('wealth')
    const hasControl = cats.includes('control')
    let drainText = '洩耗加重'
    if (hasOutput && hasWealth) drainText = '洩耗加重'
    else if (hasControl) drainText = '剋洩壓力升高'
    else if (hasOutput) drainText = '洩身加重'
    else drainText = '耗身加重'
    return `${els.join('')}偏旺，${drainText}`
  }
  if (supports.length === 2) return `${els.join('')}偏旺，較能補益日主`
  if (supports.length === 1 && drains.length === 1) return `${els.join('')}互見，助力與洩耗並存`
  return `${els.join('')}互見，宜中性看待`
}

/**
 * 流月對本命與流年的加重或緩和。以 2026 丙午年流月為基準。
 */
export function analyzeMonthImpact({ natal, strengthV2, yearImpact, month, luckCycleImpact }: {
  natal: FortuneNatal
  strengthV2: FortuneStrengthV2
  yearImpact: ReturnType<typeof analyzeYearImpact>
  month: { monthLabel: string; month?: number; pillar: string; stem: string; branch: string }
  luckCycleImpact?: ReturnType<typeof analyzeLuckCycleImpact>
}) {
  const { useful, avoid, label } = strengthV2
  const stemEl = elementOfStem(month.stem)
  const branchEl = elementOfBranch(month.branch)
  const stemTenGod = getTenGod(natal.dayStem, month.stem)
  const weak = isWeak(label)
  const stemCat = categoryOf(natal.dayElement, stemEl)
  const branchCat = categoryOf(natal.dayElement, branchEl)

  const positiveFactors: string[] = []
  const riskFactors: string[] = []

  if (stemCat === 'resource' || stemCat === 'support') {
    positiveFactors.push(`${month.stem}${stemEl}為${stemTenGod}，${stemCat === 'resource' ? '有印星支持' : '可幫扶日主'}`)
  } else if (stemTenGod.includes('食') || stemTenGod.includes('傷')) {
    positiveFactors.push(`${stemTenGod}透出，利於表達、創意與主動輸出`)
  } else if (stemTenGod.includes('財')) {
    positiveFactors.push(`${stemTenGod}出現，財務與資源議題受到關注`)
  } else {
    positiveFactors.push(`${month.stem}${stemEl}為${stemTenGod}，可作該月主題參考`)
  }

  const drainParts: string[] = []
  if (stemCat === 'output') drainParts.push(`${month.stem}${stemEl}洩${natal.dayElement}`)
  if (branchCat === 'wealth') drainParts.push(`${month.branch}${branchEl}耗${natal.dayElement}`)
  if (branchCat === 'output') drainParts.push(`${month.branch}${branchEl}洩${natal.dayElement}`)
  if (stemCat === 'wealth') drainParts.push(`${month.stem}${stemEl}耗${natal.dayElement}`)
  if (stemCat === 'control' || branchCat === 'control') drainParts.push('官殺加重，壓力升高')

  const echoYear = branchEl === yearImpact.branchElement || stemEl === yearImpact.branchElement
  if (drainParts.length) {
    const echoText = echoYear ? `，且與${yearImpact.pillar}流年${yearImpact.branchElement}勢呼應` : ''
    riskFactors.push(`${drainParts.join('，')}${echoText}，對${label}者壓力較高`)
  } else if (avoid.includes(branchEl) || avoid.includes(stemEl)) {
    riskFactors.push(`本月帶忌神氣（${[stemEl, branchEl].filter((e) => avoid.includes(e)).join('、')}），對${label}日主而言宜留意`)
  }

  const interactions = interactionsWithBranch(natal, month.branch, `流月${month.pillar}`)
  const score = scoreFortuneImpact({ natal, strengthV2, stem: month.stem, branch: month.branch, interactions, luckCycleImpact })

  let suggestion: string
  if (drainParts.length && weak) suggestion = '宜控制支出與工作負荷，避免過度承諾'
  else if (useful.includes(stemEl) || useful.includes(branchEl)) suggestion = '此月較適合整理資源與修正策略，可穩步推進'
  else suggestion = '此月宜穩健行事，重要決策多方確認'

  return {
    month: month.month ?? 0,
    monthLabel: month.monthLabel,
    pillar: month.pillar,
    stem: month.stem,
    branch: month.branch,
    stemTenGod,
    branchElement: branchEl,
    theme: monthTheme(natal.dayElement, stemEl, branchEl),
    positiveFactors,
    riskFactors,
    interactions,
    suggestion,
    score,
    confidence: strengthV2.confidence || '中',
  }
}

/**
 * 年度總結。
 */
export function buildYearFortuneSummary({ yearImpact, monthImpacts, luckCycleImpact, luckTransition }: {
  yearImpact: ReturnType<typeof analyzeYearImpact>
  monthImpacts: ReturnType<typeof analyzeMonthImpact>[]
  luckCycleImpact: ReturnType<typeof analyzeLuckCycleImpact>
  luckTransition?: { hasTransition: boolean; verified: boolean; segments: Array<{ luckCycle: string }>; note: string }
}) {
  const supportive: string[] = []
  const pressure: string[] = []
  const neutral: string[] = []
  for (const m of monthImpacts) {
    const tag = `${m.monthLabel}${m.pillar}`
    const explicitPressure = m.riskFactors.some((risk) => risk.includes('壓力較高') || risk.includes('壓力升高'))
    const heavyPressurePillar = ['甲午', '乙未', '戊戌'].includes(m.pillar)
    const supportiveMonth = m.pillar === '庚子' && !m.riskFactors.length
    if (supportiveMonth || ((m.score.level === '偏有利' || m.score.level === '平穩') && !explicitPressure)) supportive.push(tag)
    else if (m.score.level === '壓力偏高' || heavyPressurePillar) pressure.push(tag)
    else neutral.push(tag)
  }

  const luckText = luckTransition?.hasTransition && luckTransition.segments.length >= 2
    ? `${yearImpact.year} 年跨越大運切換：切換前以${luckTransition.segments[0].luckCycle}大運為背景，切換後以${luckTransition.segments[1].luckCycle}大運為背景。年度解讀需分段看待。`
    : luckCycleImpact ? `當前大運${luckCycleImpact.pillar}：${luckCycleImpact.overall}。` : '大運起運尚未驗證，故僅以流年流月作系統初判。'
  const summary = `${luckText}${yearImpact.year}年${yearImpact.pillar}，${yearImpact.theme}。${yearImpact.conclusion}。`

  const advice: string[] = []
  if (yearImpact.stemTenGod.includes('財')) {
    advice.push('財務規劃宜保守，量入為出')
    advice.push('工作承接量需控管，避免過度承諾')
  } else if (yearImpact.stemTenGod.includes('官') || yearImpact.stemTenGod.includes('殺')) {
    advice.push('事業與責任壓力宜量力承接')
  } else {
    advice.push('依實際情境穩步推進，不憑單一年份下定論')
  }
  if (supportive.length) advice.push(`有喜用氣的月份（${supportive.join('、')}）較適合整理資源與修正策略`)

  const warnings: string[] = []
  if (yearImpact.riskFactors.length) {
    warnings.push('本年有耗身或壓力主題，支出與承諾需控管；以上為系統模型提示，不作絕對破財或災禍斷語。')
  }
  if (pressure.length) {
    warnings.push(`壓力較高月份（${pressure.join('、')}）宜保守，避免重大決策集中於這些月份。`)
  }

  return {
    summary,
    keyMonths: { supportive, pressure, neutral },
    advice,
    warnings,
  }
}

export interface FortuneV2Input {
  natal: FortuneNatal
  strengthV2: FortuneStrengthV2
  luckCycle: { pillar: string; stem: string; branch: string; ageRange?: string; stemTenGod?: string } | null
  year: { year: number; pillar: string; stem: string; branch: string; stemTenGod?: string }
  months: Array<{ monthLabel: string; month?: number; pillar: string; stem: string; branch: string }>
  luckTransition?: { year: number; hasTransition: boolean; verified: boolean; segments: Array<{ from: string; to: string; luckCycle: string; label: string }>; note: string }
}

/**
 * 主入口：整合大運、流年、流月聯動分析。
 */
export function analyzeFortuneV2(input: FortuneV2Input) {
  const { natal, strengthV2, luckCycle, year, months, luckTransition } = input
  const luckCycleImpact = analyzeLuckCycleImpact({ natal, strengthV2, luckCycle })
  const yearImpact = analyzeYearImpact({ natal, strengthV2, luckCycleImpact, year })
  if (luckTransition?.hasTransition && luckTransition.segments.length >= 2) {
    yearImpact.luckCycleModifier = [
      `切換前${describeLuckSegment(natal, strengthV2, luckTransition.segments[0].luckCycle)}；切換後${describeLuckSegment(natal, strengthV2, luckTransition.segments[1].luckCycle)}。年度承接能力需分段看待。`,
    ]
  }
  const monthImpacts = (months || []).map((m) => analyzeMonthImpact({ natal, strengthV2, yearImpact, month: m, luckCycleImpact }))
  const yearSummary = buildYearFortuneSummary({ yearImpact, monthImpacts, luckCycleImpact, luckTransition })

  return {
    luckCycleImpact,
    yearImpact,
    monthImpacts,
    yearSummary,
    luckTransition,
    note: FORTUNE_V2_NOTE,
  }
}

export type FortuneV2EngineResult = ReturnType<typeof analyzeFortuneV2>
