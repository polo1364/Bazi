import { STEM_ELEMENTS } from '../constants'
import { getTenGod } from '../tenGodEngine.js'
import type { Element } from '../../types'

/**
 * 完整旺衰模型 v2。
 *
 * 重要聲明：
 * 本模型為系統自訂權重估算，並非命理絕對值。月令旺衰、得令得地得勢、通根、透干、
 * 生扶剋洩耗、身強弱等級、喜用神與格局傾向皆為「初判」，不同命理流派可能有差異，
 * 需搭配大運流年與完整制化再驗證。本檔不修改既有核心演算法（tenGodEngine 等）。
 */

export const STRENGTH_V2_NOTE = '旺衰與喜用神為系統模型初判，不同命理流派可能有差異，需搭配大運流年與實際情境參考。'

type ForceCategory = 'support' | 'resource' | 'control' | 'output' | 'wealth'

const ELEMENTS: Element[] = ['木', '火', '土', '金', '水']
const GENERATES: Record<Element, Element> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
const CONTROLS: Record<Element, Element> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }
const STORAGE_BRANCHES = ['辰', '戌', '丑', '未']

const PILLAR_LABEL: Record<string, string> = {
  year: '年',
  month: '月',
  day: '日',
  hour: '時',
}

/**
 * 五行在十二月令的旺衰表（系統模型）。
 *
 * 推導原則（與木列示範一致，僅供相對比較，非唯一標準）：
 * - 當令同類           => 旺
 * - 生我（印）當令     => 相
 * - 我生（食傷）當令   => 休
 * - 剋我（官殺）當令   => 死
 * - 我剋（財，土月）   => 囚；但該五行季後土月為餘氣、其墓庫月為墓
 * 土：四季月（辰戌丑未）旺；火月相、金月休、水月囚、木月死。
 *
 * 若需嚴格傳統旺相休囚死，仍以實際流派為準；此表僅供系統初判。
 */
export const SEASONAL_STRENGTH: Record<Element, Record<string, string>> = {
  木: {
    寅: '旺', 卯: '旺', 辰: '餘氣', 巳: '休', 午: '休', 未: '墓',
    申: '死', 酉: '死', 戌: '囚', 亥: '相', 子: '相', 丑: '囚',
  },
  火: {
    寅: '相', 卯: '相', 辰: '囚', 巳: '旺', 午: '旺', 未: '餘氣',
    申: '囚', 酉: '囚', 戌: '墓', 亥: '死', 子: '死', 丑: '囚',
  },
  土: {
    寅: '死', 卯: '死', 辰: '旺', 巳: '相', 午: '相', 未: '旺',
    申: '休', 酉: '休', 戌: '旺', 亥: '囚', 子: '囚', 丑: '旺',
  },
  金: {
    寅: '囚', 卯: '囚', 辰: '囚', 巳: '死', 午: '死', 未: '囚',
    申: '旺', 酉: '旺', 戌: '餘氣', 亥: '休', 子: '休', 丑: '墓',
  },
  水: {
    寅: '休', 卯: '休', 辰: '墓', 巳: '囚', 午: '囚', 未: '囚',
    申: '相', 酉: '相', 戌: '囚', 亥: '旺', 子: '旺', 丑: '餘氣',
  },
}

export interface HiddenStemInput {
  stem: string
  qi: string
  tenGod?: string
}

export interface StrengthV2Input {
  pillars: Record<string, { stem: string; branch: string }>
  dayStem: string
  monthBranch: string
  hiddenStems: Record<string, HiddenStemInput[]>
}

export function getSeasonalStrength(element: Element, monthBranch: string): string {
  return SEASONAL_STRENGTH[element]?.[monthBranch] ?? '未知'
}

function elementOf(stem: string): Element | undefined {
  return STEM_ELEMENTS[stem]
}

function categoryOf(dayElement: Element, element: Element): ForceCategory {
  if (element === dayElement) return 'support'
  if (GENERATES[element] === dayElement) return 'resource'
  if (CONTROLS[element] === dayElement) return 'control'
  if (GENERATES[dayElement] === element) return 'output'
  return 'wealth'
}

const CATEGORY_LABEL: Record<ForceCategory, string> = {
  support: '幫身',
  resource: '生身',
  control: '剋身',
  output: '洩身',
  wealth: '耗身',
}

/**
 * 得令、得地、得勢分析。
 */
export function analyzeLingDiShi({
  dayStem,
  dayElement,
  monthBranch,
  pillars = {},
  hiddenStems,
}: {
  dayStem: string
  dayElement: Element
  monthBranch: string
  pillars?: Record<string, { stem: string; branch: string }>
  hiddenStems: Record<string, HiddenStemInput[]>
}) {
  const seasonal = getSeasonalStrength(dayElement, monthBranch)
  const monthHidden = hiddenStems.month ?? []
  const monthMainQi = monthHidden.find((h) => h.qi === '主氣')
  const monthRoot = monthHidden.find((h) => elementOf(h.stem) === dayElement)

  let deLingStatus: '得令' | '不得令' | '半得令' | '有餘氣'
  let deLingReason: string
  if (seasonal === '旺' || seasonal === '相') {
    deLingStatus = '得令'
    deLingReason = `${dayStem}${dayElement}生於${monthBranch}月，月令旺衰為「${seasonal}」，屬得令。`
  } else if (seasonal === '餘氣') {
    deLingStatus = '有餘氣'
    deLingReason = `${dayStem}${dayElement}生於${monthBranch}月，月令旺衰為「餘氣」，不得令但有餘氣。`
  } else if (monthRoot) {
    deLingStatus = '有餘氣'
    const storageText = STORAGE_BRANCHES.includes(monthBranch) ? `，且${monthBranch}為${dayElement}庫` : ''
    deLingReason = `${dayStem}${dayElement}生於${monthBranch}月，月令主氣為${monthMainQi?.stem ?? ''}${monthMainQi ? elementOf(monthMainQi.stem) : ''}，不得令；但${monthBranch}中藏${monthRoot.stem}${storageText}，屬有餘氣與庫根。`
  } else {
    deLingStatus = '不得令'
    deLingReason = `${dayStem}${dayElement}生於${monthBranch}月，月令旺衰為「${seasonal}」，不得令。`
  }

  const rootResult = analyzeRoots(dayStem, hiddenStems, pillars)
  const strongRoots = rootResult.roots.filter((r) => r.strength.includes('強根'))
  let deDiStatus: '得地' | '部分得地' | '不得地'
  let deDiReason: string
  if (strongRoots.length) {
    deDiStatus = '得地'
    deDiReason = `${strongRoots.map((r) => `${PILLAR_LABEL[r.pillar]}支${r.branch ? `${r.branch}${dayElement}` : ''}`).join('、')}為${dayStem}${dayElement}強根，日主得地。`
  } else if (rootResult.roots.length) {
    deDiStatus = '部分得地'
    deDiReason = `僅見${rootResult.roots.map((r) => `${PILLAR_LABEL[r.pillar]}支${r.branch}`).join('、')}等弱根或庫根，屬部分得地。`
  } else {
    deDiStatus = '不得地'
    deDiReason = '四支未見同類藏干，日主不得地。'
  }

  const supporters: Array<{ pillar: string; stem: string; type: string }> = []
  for (const [pillar, p] of Object.entries(pillars) as [string, { stem: string; branch: string }][]) {
    if (pillar === 'day') continue
    const el = elementOf(p.stem)
    if (!el) continue
    const cat = categoryOf(dayElement, el)
    if (cat === 'support' || cat === 'resource') {
      supporters.push({ pillar, stem: p.stem, type: CATEGORY_LABEL[cat] })
    }
  }
  const hiddenResourceOrSupport = Object.entries(hiddenStems).flatMap(([pillar, list]) =>
    (list ?? [])
      .filter((h) => {
        const el = elementOf(h.stem)
        return el && (categoryOf(dayElement, el) === 'support' || categoryOf(dayElement, el) === 'resource')
      })
      .map((h) => ({ pillar, stem: h.stem })),
  )
  let deShiStatus: '得勢' | '部分得勢' | '不得勢'
  let deShiReason: string
  if (supporters.length >= 2) {
    deShiStatus = '得勢'
    deShiReason = `天干見${supporters.map((s) => `${PILLAR_LABEL[s.pillar]}干${s.stem}（${s.type}）`).join('、')}，幫扶有力，屬得勢。`
  } else if (supporters.length === 1 || hiddenResourceOrSupport.length) {
    deShiStatus = '部分得勢'
    const transparentText = supporters.length ? `天干${supporters.map((s) => `${PILLAR_LABEL[s.pillar]}干${s.stem}（${s.type}）`).join('、')}幫身` : ''
    const hiddenText = hiddenResourceOrSupport.length ? `${hiddenResourceOrSupport.map((h) => `${PILLAR_LABEL[h.pillar]}支藏${h.stem}`).join('、')}雖生扶但未透干、力量偏弱` : ''
    deShiReason = `${[transparentText, hiddenText].filter(Boolean).join('；')}，屬部分得勢。`
  } else {
    deShiStatus = '不得勢'
    deShiReason = '天干與藏干缺乏明顯幫扶，日主不得勢。'
  }

  return {
    deLing: { status: deLingStatus, reason: deLingReason },
    deDi: { status: deDiStatus, roots: rootResult.roots.map((r) => `${PILLAR_LABEL[r.pillar]}支${r.branch ? `${r.branch}${dayElement}` : ''}藏${r.hiddenStem}（${r.strength}）`), reason: deDiReason },
    deShi: { status: deShiStatus, supporters: supporters.map((s) => `${PILLAR_LABEL[s.pillar]}干${s.stem}（${s.type}）`), reason: deShiReason },
  }
}

/**
 * 通根分析：依藏干與氣別判斷根的強弱。
 */
export function analyzeRoots(dayStem: string, hiddenStems: Record<string, HiddenStemInput[]>, pillars: Record<string, { stem: string; branch: string }> = {}) {
  const dayElement = elementOf(dayStem)
  const roots: Array<{
    pillar: string
    branch?: string
    hiddenStem: string
    qi: string
    strength: string
    reason: string
  }> = []

  for (const [pillar, list] of Object.entries(hiddenStems)) {
    const branch = pillars[pillar]?.branch
    for (const h of list ?? []) {
      if (elementOf(h.stem) !== dayElement) continue
      let strength: string
      let reason: string
      if (h.qi === '主氣') {
        strength = '強根'
        reason = `${PILLAR_LABEL[pillar]}支${branch ? `${branch}${dayElement}` : ''}藏${h.stem}，為${dayStem}${dayElement}強根`
      } else if (h.qi === '中氣') {
        strength = '中根'
        reason = `${PILLAR_LABEL[pillar]}支${branch ?? ''}中氣藏${h.stem}，為${dayStem}${dayElement}中根`
      } else {
        strength = '弱根 / 庫根'
        reason = `${PILLAR_LABEL[pillar]}支${branch ?? ''}餘氣藏${h.stem}，為${dayStem}${dayElement}餘氣與庫根`
      }
      roots.push({ pillar, branch, hiddenStem: h.stem, qi: h.qi, strength, reason })
    }
  }

  const summary = roots.length
    ? `日主${dayStem}通根：${roots.map((r) => `${PILLAR_LABEL[r.pillar]}支${r.branch ? `${r.branch}${dayElement}` : ''}藏${r.hiddenStem}（${r.strength}）`).join('、')}，並非全無根氣。`
    : `日主${dayStem}四支未見同類藏干，缺乏通根。`

  return { roots, summary }
}

/**
 * 透干分析：以天干判斷幫身、洩身、耗身、剋身。
 */
export function analyzeStemSupport(dayStem: string, pillars: Record<string, { stem: string; branch: string }>) {
  const dayElement = elementOf(dayStem) as Element
  const supportStems: Array<{ pillar: string; stem: string; type: string; tenGod: string }> = []
  const drainStems: Array<{ pillar: string; stem: string; type: string; tenGod: string }> = []
  const controlStems: Array<{ pillar: string; stem: string; type: string; tenGod: string }> = []

  for (const [pillar, p] of Object.entries(pillars)) {
    if (pillar === 'day') continue
    const el = elementOf(p.stem)
    if (!el) continue
    const cat = categoryOf(dayElement, el)
    const tenGod = getTenGod(dayStem, p.stem)
    const entry = { pillar, stem: p.stem, type: CATEGORY_LABEL[cat], tenGod }
    if (cat === 'support' || cat === 'resource') supportStems.push(entry)
    else if (cat === 'control') controlStems.push(entry)
    else drainStems.push(entry)
  }

  const summaryParts: string[] = []
  if (supportStems.length) summaryParts.push(`幫扶：${supportStems.map((s) => `${PILLAR_LABEL[s.pillar]}干${s.stem}${s.tenGod}`).join('、')}`)
  if (drainStems.length) summaryParts.push(`洩耗：${drainStems.map((s) => `${PILLAR_LABEL[s.pillar]}干${s.stem}${s.tenGod}`).join('、')}`)
  if (controlStems.length) summaryParts.push(`剋身：${controlStems.map((s) => `${PILLAR_LABEL[s.pillar]}干${s.stem}${s.tenGod}`).join('、')}`)

  return {
    supportStems,
    drainStems,
    controlStems,
    summary: summaryParts.join('；') || '天干無明顯幫扶與剋洩。',
  }
}

const QI_WEIGHT: Record<string, number> = {
  主氣: 1.0,
  中氣: 0.5,
  餘氣: 0.3,
}

/**
 * 生扶、剋洩耗分類與加權分數（權重公開）。
 */
export function classifyForces({
  dayStem,
  pillars,
  monthBranch,
  hiddenStems,
}: {
  dayStem: string
  pillars: Record<string, { stem: string; branch: string }>
  monthBranch: string
  hiddenStems: Record<string, HiddenStemInput[]>
}) {
  const dayElement = elementOf(dayStem) as Element
  const buckets: Record<ForceCategory, Array<{ source: string; stem: string; element: Element; weight: number; note: string }>> = {
    support: [], resource: [], control: [], output: [], wealth: [],
  }

  for (const [pillar, p] of Object.entries(pillars)) {
    if (pillar === 'day') continue
    const el = elementOf(p.stem)
    if (!el) continue
    const cat = categoryOf(dayElement, el)
    buckets[cat].push({ source: `${PILLAR_LABEL[pillar]}干`, stem: p.stem, element: el, weight: 1.0, note: '天干 1.0' })
  }

  for (const [pillar, list] of Object.entries(hiddenStems)) {
    for (const h of list ?? []) {
      const el = elementOf(h.stem)
      if (!el) continue
      const cat = categoryOf(dayElement, el)
      let weight = QI_WEIGHT[h.qi] ?? 0.3
      const notes = [`地支${h.qi} ${weight.toFixed(1)}`]
      if (pillar === 'month' && h.qi === '主氣') {
        weight += 1.0
        notes.push('月令主氣額外 +1.0')
      }
      if (pillar === 'hour' && h.qi === '主氣' && el === dayElement) {
        weight += 0.5
        notes.push('時支日主根額外 +0.5')
      }
      buckets[cat].push({ source: `${PILLAR_LABEL[pillar]}支藏`, stem: h.stem, element: el, weight, note: notes.join('，') })
    }
  }

  const sum = (cat: ForceCategory) => Number(buckets[cat].reduce((a, b) => a + b.weight, 0).toFixed(2))
  const summary = {
    supportScore: sum('support'),
    resourceScore: sum('resource'),
    controlScore: sum('control'),
    outputScore: sum('output'),
    wealthScore: sum('wealth'),
  }

  return {
    support: buckets.support,
    resource: buckets.resource,
    control: buckets.control,
    output: buckets.output,
    wealth: buckets.wealth,
    summary,
    weightNote: '權重：天干 1.0、地支主氣 1.0、中氣 0.5、餘氣 0.3、月令主氣額外 +1.0、時支日主根額外 +0.5。分數為系統模型估算，不是命理絕對值。',
    monthBranch,
  }
}

function labelFromScore(score: number, hasRoots: boolean): { label: string; confidence: '高' | '中' | '低' } {
  if (score >= 68) return { label: '身強', confidence: '高' }
  if (score >= 60) return { label: '身偏強', confidence: '中' }
  if (score >= 53) return { label: '中和偏強', confidence: '中' }
  if (score >= 47) return { label: '中和', confidence: '中' }
  if (score >= 42) return { label: '中和偏弱', confidence: '中' }
  if (score >= 34) return { label: hasRoots ? '中和偏弱／身偏弱' : '身偏弱', confidence: '中' }
  if (score >= 25) return { label: '身偏弱', confidence: hasRoots ? '中' : '高' }
  return { label: '身弱', confidence: '高' }
}

/**
 * 身強弱等級 v2：整合得令得地得勢、通根、生扶剋洩耗。
 */
export function calculateDayMasterStrengthV2(input: StrengthV2Input) {
  const { dayStem, monthBranch, pillars, hiddenStems } = input
  const dayElement = elementOf(dayStem) as Element

  const lingDiShi = analyzeLingDiShi({ dayStem, dayElement, monthBranch, pillars, hiddenStems })
  const roots = analyzeRoots(dayStem, hiddenStems, pillars)
  const stemSupport = analyzeStemSupport(dayStem, pillars)
  const forces = classifyForces({ dayStem, pillars, monthBranch, hiddenStems })

  const supportTotal = forces.summary.supportScore + forces.summary.resourceScore
  const opposeTotal = forces.summary.controlScore + forces.summary.outputScore + forces.summary.wealthScore
  const total = supportTotal + opposeTotal
  const ratio = total === 0 ? 0 : (supportTotal - opposeTotal) / total
  const score = Math.max(0, Math.min(100, Math.round(50 + ratio * 40)))
  const { label, confidence } = labelFromScore(score, roots.roots.length > 0)

  const reasons: string[] = []
  reasons.push(lingDiShi.deLing.reason)
  const strongRoot = roots.roots.find((r) => r.strength.includes('強根'))
  if (strongRoot && stemSupport.supportStems.length) {
    reasons.push(`${PILLAR_LABEL[strongRoot.pillar]}支${strongRoot.branch ? `${strongRoot.branch}${dayElement}` : ''}${strongRoot.hiddenStem ? `藏${strongRoot.hiddenStem}` : ''}，為${dayStem}${dayElement}強根，${stemSupport.supportStems.map((s) => `${PILLAR_LABEL[s.pillar]}干${s.stem}${s.tenGod}`).join('、')}透出幫身。`)
  } else if (strongRoot) {
    reasons.push(`${PILLAR_LABEL[strongRoot.pillar]}支${strongRoot.branch ? `${strongRoot.branch}${dayElement}` : ''}，為${dayStem}${dayElement}強根，日主並非全弱。`)
  } else if (stemSupport.supportStems.length) {
    reasons.push(`${stemSupport.supportStems.map((s) => `${PILLAR_LABEL[s.pillar]}干${s.stem}${s.tenGod}`).join('、')}透出幫身。`)
  }
  const libraryRoots = roots.roots.filter((r) => r.strength.includes('庫') || r.qi !== '主氣')
  if (libraryRoots.length) {
    reasons.push(`${libraryRoots.map((r) => `${PILLAR_LABEL[r.pillar]}支`).join('、')}皆藏${dayStem}，日主並非全弱，但多屬餘氣或庫根。`)
  }
  if (stemSupport.drainStems.length) {
    reasons.push(`${stemSupport.drainStems.map((s) => `${PILLAR_LABEL[s.pillar]}干${s.stem}${s.tenGod}（${s.type}）`).join('、')}，對日主形成洩、耗之力。`)
  }
  if (forces.control.length) {
    reasons.push(`${forces.control.filter((c) => c.source.includes('藏')).map((c) => `${c.source}${c.stem}`).join('、') || forces.control.map((c) => `${c.source}${c.stem}`).join('、')}等${dayElement === '水' ? '土' : ''}氣為官殺，對日主形成壓力。`)
  }
  if (forces.wealth.length) {
    reasons.push(`${forces.wealth.map((w) => `${w.source}${w.stem}`).join('、')}為財星，對日主有耗身作用。`)
  }
  reasons.push(`綜合得令、得地、得勢與生扶剋洩耗（扶身 ${supportTotal.toFixed(1)}、剋洩耗 ${opposeTotal.toFixed(1)}），系統初判為「${label}」，可信度${confidence}（參考分數 ${score}）。`)

  const pattern = analyzePatternTendency({
    dayStem,
    monthBranch,
    monthStem: pillars.month?.stem ?? '',
    hiddenStems,
  })

  const strengthResult = {
    label,
    confidence,
    score,
    scoreNote: '此分數為系統模型估算，不是命理絕對值',
    dayStem,
    dayElement,
    deLing: lingDiShi.deLing,
    deDi: lingDiShi.deDi,
    deShi: lingDiShi.deShi,
    roots,
    stemSupport,
    forces,
    pattern,
    reasons,
    note: STRENGTH_V2_NOTE,
  }

  return {
    ...strengthResult,
    usefulGods: deriveUsefulGodsV2(strengthResult),
  }
}

const ELEMENT_TEN_GOD_GROUP = (dayElement: Element) => ({
  resource: ELEMENTS.find((e) => GENERATES[e] === dayElement) as Element,
  self: dayElement,
  output: GENERATES[dayElement],
  wealth: CONTROLS[dayElement],
  control: ELEMENTS.find((e) => CONTROLS[e] === dayElement) as Element,
})

/**
 * 喜用神初判 v2。
 */
export function deriveUsefulGodsV2(strengthResult: {
  label: string
  score: number
  dayElement: Element
  forces: { summary: { supportScore: number; resourceScore: number; controlScore: number; outputScore: number; wealthScore: number } }
}) {
  const { dayElement, label, score } = strengthResult
  const g = ELEMENT_TEN_GOD_GROUP(dayElement)
  const isWeak = label.includes('弱') || score < 47
  const isStrong = label.includes('強') || score >= 60

  if (isWeak && !isStrong) {
    const resourceWeak = strengthResult.forces.summary.resourceScore < 1
    const priority = [
      {
        element: g.resource,
        reason: `${g.resource}為${dayElement}印星，命局${g.resource}${resourceWeak ? '弱' : '可用'}，能生${dayElement}並提供資源支持`,
      },
      {
        element: g.self,
        reason: `${g.self}為比劫，可幫扶日主；但命局已有同類根氣，宜作輔助而非盲目增強`,
      },
    ]
    return {
      useful: [g.resource, g.self],
      priority,
      avoid: [
        { element: g.control, reason: `${g.control}為官殺，命局官殺已見，過旺會加重壓力` },
        { element: g.wealth, reason: `${g.wealth}為財星，身偏弱時財旺易成耗身` },
        { element: g.output, reason: `${g.output}為食傷，命局已洩，過旺會加重洩身` },
      ],
      note: '喜用神為系統初判，需搭配大運流年與完整格局制化',
    }
  }

  if (isStrong) {
    return {
      useful: [g.output, g.wealth, g.control],
      priority: [
        { element: g.output, reason: `${g.output}為食傷，可洩${dayElement}之旺氣，宜順勢宣洩` },
        { element: g.wealth, reason: `${g.wealth}為財星，日主旺可任財` },
        { element: g.control, reason: `${g.control}為官殺，可制衡旺身，但需有印通關或食傷得宜` },
      ],
      avoid: [
        { element: g.self, reason: `${g.self}為比劫，身旺再添同類易過旺` },
        { element: g.resource, reason: `${g.resource}為印星，身旺不宜再生扶` },
      ],
      note: '喜用神為系統初判，需搭配大運流年與完整格局制化',
    }
  }

  return {
    useful: [g.output, g.wealth],
    priority: [
      { element: g.output, reason: `日主中和，${g.output}食傷可順勢調節，宜中庸取用` },
      { element: g.wealth, reason: `日主中和，${g.wealth}財星可作發揮，仍需視大運流年` },
    ],
    avoid: [
      { element: g.control, reason: `${g.control}官殺過旺時會形成壓力，需留意` },
    ],
    note: '喜用神為系統初判，命局接近中和，喜忌彈性較大，需搭配大運流年判斷',
  }
}

const PATTERN_BY_TEN_GOD: Record<string, string> = {
  正官: '正官格傾向',
  七殺: '七殺格傾向',
  正財: '財格傾向',
  偏財: '財格傾向',
  正印: '印格傾向',
  偏印: '印格傾向',
  食神: '食神格傾向',
  傷官: '傷官格傾向',
  比肩: '建祿／月劫傾向',
  劫財: '建祿／月劫傾向',
}

/**
 * 格局傾向修正：以月令主氣為主，兼看透干與藏干，避免直接定純格。
 */
export function analyzePatternTendency({
  dayStem,
  monthBranch,
  monthStem,
  hiddenStems,
}: {
  dayStem: string
  monthBranch: string
  monthStem: string
  hiddenStems: Record<string, HiddenStemInput[]>
}) {
  const monthHidden = hiddenStems.month ?? []
  const monthMainQi = monthHidden.find((h) => h.qi === '主氣') ?? monthHidden[0]
  const mainTenGod = monthMainQi ? getTenGod(dayStem, monthMainQi.stem) : ''
  const baseLabel = PATTERN_BY_TEN_GOD[mainTenGod] ?? '格局待定'

  const reasons: string[] = []
  if (monthMainQi) {
    reasons.push(`月支${monthBranch}主氣${monthMainQi.stem}${STEM_ELEMENTS[monthMainQi.stem] ?? ''}，對${dayStem}為${mainTenGod}，故有${baseLabel}`)
  }

  const monthStemTenGod = monthStem ? getTenGod(dayStem, monthStem) : ''
  let patternLabel = baseLabel
  if ((mainTenGod === '正官' || mainTenGod === '七殺') && (monthStemTenGod === '傷官' || monthStemTenGod === '食神')) {
    patternLabel = `${baseLabel}／${monthStemTenGod === '傷官' ? '傷官見官' : '食神制殺'}`
    reasons.push(`月干${monthStem}${STEM_ELEMENTS[monthStem] ?? ''}為${monthStemTenGod}透出，形成${monthStemTenGod === '傷官' ? '傷官見官' : '食神制殺'}之象`)
  } else if (monthStemTenGod && monthStem) {
    reasons.push(`月干${monthStem}${STEM_ELEMENTS[monthStem] ?? ''}為${monthStemTenGod}透出，需一併參看`)
  }

  const mixedOfficer = Object.entries(hiddenStems).some(([pillar, list]) =>
    pillar !== 'month' && (list ?? []).some((h) => {
      const tg = getTenGod(dayStem, h.stem)
      return (mainTenGod === '正官' && tg === '七殺') || (mainTenGod === '七殺' && tg === '正官')
    }),
  )
  if (mixedOfficer) {
    reasons.push('命局又見其他柱官殺，需兼看官殺混雜與制化')
    reasons.push('因此不宜單純定為正官純格')
  }

  const confidence = mixedOfficer || patternLabel.includes('／') ? '中' : '中'

  return {
    patternLabel,
    confidence,
    reasons,
    warning: '格局僅作傾向判斷，需配合透干、通根、制化與大運流年',
  }
}

/**
 * 由 BaziChart（bazi.ts 產生）轉為 strengthV2 輸入格式。
 */
export function buildStrengthV2InputFromChart(chart: {
  year: { stem: string; branch: string; hiddenStemTenGods?: HiddenStemInput[] }
  month: { stem: string; branch: string; hiddenStemTenGods?: HiddenStemInput[] }
  day: { stem: string; branch: string; hiddenStemTenGods?: HiddenStemInput[] }
  hour: { stem: string; branch: string; hiddenStemTenGods?: HiddenStemInput[] }
}): StrengthV2Input {
  const pillars = {
    year: { stem: chart.year.stem, branch: chart.year.branch },
    month: { stem: chart.month.stem, branch: chart.month.branch },
    day: { stem: chart.day.stem, branch: chart.day.branch },
    hour: { stem: chart.hour.stem, branch: chart.hour.branch },
  }
  const hiddenStems = {
    year: chart.year.hiddenStemTenGods ?? [],
    month: chart.month.hiddenStemTenGods ?? [],
    day: chart.day.hiddenStemTenGods ?? [],
    hour: chart.hour.hiddenStemTenGods ?? [],
  }
  return {
    pillars,
    dayStem: chart.day.stem,
    monthBranch: chart.month.branch,
    hiddenStems,
  }
}

export type StrengthV2Result = ReturnType<typeof calculateDayMasterStrengthV2>
