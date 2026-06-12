import type {
  AnalysisResult, BaziChart, BirthInput, Element, ElementStats, Gender,
  DayunDetail, ElementAdvice, LiunianItem, LiuyueDetail, LiuyueItem, RelationItem, TrendItem,
} from '../types'
import { BRANCHES, STEMS, STEM_ELEMENTS, getMonthStemIndex } from './constants'
import { buildChartFromManual, calculateBazi, ganZhiFromYear, pillarsToArray } from './bazi'
import { calculateWuge } from './wuge'
import { getNayin, computeShensha, getDaymasterProfile, getZodiacByBranch, computeChartRelations } from './dataStore'
import { getTenGod } from './tenGods'

const ELEMENT_ORDER: Element[] = ['木', '火', '土', '金', '水']
const GENERATES: Record<Element, Element> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
const CONTROLS: Record<Element, Element> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }
const STEM_TO_ELEMENT = STEM_ELEMENTS
const ELEMENT_REMEDIES: Record<Element, Omit<ElementAdvice, 'element'>> = {
  木: {
    colors: ['青綠', '淺綠', '木質色'],
    directions: ['東方', '東南方'],
    careers: ['教育', '設計', '文化出版', '園藝', '顧問規劃'],
    habits: ['早睡早起', '多接觸植物', '規律伸展', '學習進修'],
  },
  火: {
    colors: ['紅色', '紫色', '暖橘色'],
    directions: ['南方'],
    careers: ['品牌行銷', '影像媒體', '餐飲', '科技產品', '公開表達'],
    habits: ['曬太陽', '維持運動', '培養表達', '避免熬夜上火'],
  },
  土: {
    colors: ['黃色', '咖啡色', '米色'],
    directions: ['中央', '東北方', '西南方'],
    careers: ['不動產', '管理', '財務行政', '農食', '專案統籌'],
    habits: ['固定作息', '整理環境', '穩定飲食', '建立長期計畫'],
  },
  金: {
    colors: ['白色', '金色', '銀灰色'],
    directions: ['西方', '西北方'],
    careers: ['金融', '法務', '工程', '醫療器械', '制度稽核'],
    habits: ['斷捨離', '訓練紀律', '呼吸保養', '重視邊界感'],
  },
  水: {
    colors: ['黑色', '深藍色', '湖水色'],
    directions: ['北方'],
    careers: ['物流', '旅遊', '諮詢', '研究', '資訊流通'],
    habits: ['補足睡眠', '親近水域', '保養腎泌尿', '保持彈性學習'],
  },
}

const HOUR_MAP = [0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]
const ELEMENT_MODEL_NOTE = '五行分數為系統自訂權重模型，僅供相對比較，不代表傳統命理唯一標準。權重：天干 1.0、地支主氣 1.0、中氣 0.5、餘氣 0.3、月令主氣額外 +1.0、藏干同五行透干額外 +0.2；目前未納入完整季節旺衰模型。'
const STRENGTH_SCORE_NOTE = '身強弱參考分數為系統模型估算，不是命理絕對值。'
const LIUNIAN_NOTE = '八字流年以立春為界，非國曆 1 月 1 日。'
const LIUYUE_NOTE = '流月以節氣切換，不等於農曆初一，也不等於國曆每月 1 日。'
const DAYUN_NOTE = '大運順逆已依性別與年干陰陽推算；起運歲數需出生時間與節氣差精算，本系統目前先列大運順序，不把起運歲數作為定論。'
const NAME_VALIDATION_NOTE = '姓名五格會受筆畫標準與字五行流派影響。本系統目前列出可查得的筆畫與五格，姓名吉凶需等筆畫標準與字五行來源確認後再下結論。'
const SHENSHA_NOTE = '神煞需依日干、年干、月令或特定查法判定，目前系統尚未完成公式驗證，因此不列為正式結論。'

function countElements(chart: BaziChart): ElementStats {
  const stats: ElementStats = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
  const stemElements = new Set(pillarsToArray(chart).map((p) => p.stemElement))
  for (const p of pillarsToArray(chart)) {
    stats[p.stemElement] += 1
    for (const h of p.hiddenStemTenGods) {
      const element = STEM_ELEMENTS[h.stem]
      const weight = h.qi === '主氣' ? 1 : h.qi === '中氣' ? 0.5 : 0.3
      stats[element] += weight
      if (p.label === '月柱' && h.qi === '主氣') stats[element] += 1
      if (stemElements.has(element)) stats[element] += 0.2
    }
  }
  return stats
}

function calcStrength(chart: BaziChart, stats: ElementStats): number {
  const dm = chart.dayMasterElement
  const resource = ELEMENT_ORDER.find((e) => GENERATES[e] === dm)!
  const total = Object.values(stats).reduce((a, b) => a + b, 0)
  const support = stats[dm] + stats[resource]
  return Math.min(95, Math.max(15, Math.round((support / total) * 100)))
}

function getFavorable(dm: Element, strength: number): Element[] {
  const resource = ELEMENT_ORDER.find((e) => GENERATES[e] === dm)!
  const output = GENERATES[dm]
  const wealth = CONTROLS[dm]
  if (strength < 45) return [resource, dm]
  if (strength > 60) return [output, wealth]
  return [dm, output]
}

function getUnfavorable(dm: Element, favorable: Element[]): Element[] {
  return ELEMENT_ORDER.filter((element) => !favorable.includes(element) && element !== dm).slice(0, 2)
}

function detectPattern(chart: BaziChart): { pattern: string; note: string } {
  const mainQi = chart.month.branchMainQi
  const tendency = `${mainQi.tenGod}格傾向`
  const visibleGods = [chart.year, chart.month, chart.hour].map((p) => p.stemTenGod)
  const notes: string[] = [
    `月令${chart.month.branch}主氣為${mainQi.stem}，對${chart.dayMaster}${chart.dayMasterElement}日主而言為${mainQi.tenGod}，故以「${tendency}」保守標示。`,
  ]
  if (mainQi.tenGod.includes('官') && visibleGods.some((god) => god.includes('傷'))) {
    notes.push('月干或其他天干見傷官透出，具傷官見官之象，不能單純以純正官格論。')
  }
  if (visibleGods.some((god) => god.includes('殺')) && visibleGods.some((god) => god.includes('官'))) {
    notes.push('天干見官殺並存時，需兼看官殺混雜與制化狀況。')
  }
  notes.push('格局需配合月令、透干、藏干、旺衰與制化，不作絕對定論。')
  return { pattern: tendency, note: notes.join('') }
}

function strengthBasis(chart: BaziChart): string[] {
  const dm = chart.dayMasterElement
  const output = GENERATES[dm]
  const wealth = CONTROLS[dm]
  const officer = ELEMENT_ORDER.find((element) => CONTROLS[element] === dm)!
  const resource = ELEMENT_ORDER.find((element) => GENERATES[element] === dm)!
  const items = pillarsToArray(chart)
  const describe = (element: Element) => {
    const texts: string[] = []
    for (const p of items) {
      if (p.stemElement === element) texts.push(`${p.label}${p.stem}透干`)
      for (const h of p.hiddenStemTenGods) {
        if (STEM_ELEMENTS[h.stem] === element) texts.push(`${p.branch}藏${h.stem}(${h.qi})`)
      }
    }
    return texts
  }
  return [
    `日主：${chart.dayMaster}${dm}`,
    `幫身：${[...describe(dm), ...describe(resource)].join('、') || '未見明顯幫身'}`,
    `洩身：${describe(output).join('、') || '未見明顯洩身'}`,
    `剋身：${describe(officer).join('、') || '未見明顯剋身'}`,
    `耗身：${describe(wealth).join('、') || '未見明顯耗身'}`,
  ]
}

function elementReason(chart: BaziChart, strongest: Element, weakest: Element): string {
  const describe = (element: Element) => {
    const items: string[] = []
    for (const p of pillarsToArray(chart)) {
      if (p.stemElement === element) items.push(p.stem)
      for (const h of p.hiddenStemTenGods) {
        if (STEM_ELEMENTS[h.stem] === element) items.push(`${p.branch}藏${h.stem}`)
      }
    }
    return items.join('、') || '來源較少'
  }
  return `${strongest}較旺：${describe(strongest)}；${weakest}較弱：${describe(weakest)}。`
}

function buildTopicAnalysis(input: BirthInput, chart: BaziChart, strengthLabel: string): string {
  const year = input.analysisYear as number
  const pillar = ganZhiFromYear(year)
  const stem = pillar[0]
  const branch = pillar[1]
  const god = stemTenGod(chart, stem)
  const stemElement = STEM_ELEMENTS[stem]
  const fireWealth = chart.dayMasterElement === '水' && stemElement === '火'
  const base = `${year}年為${pillar}年（流年以立春為界），${stem}為${chart.dayMaster}${chart.dayMasterElement}日主之${god}。`
  if (input.topic === '薪資') {
    const monthHint = chart.dayMasterElement === '水'
      ? '若要談加薪，可優先觀察申、酉、亥、子等對日主較有支援的節氣月份，但仍需搭配實際工作績效。'
      : '談薪仍應以工作績效、職責範圍與市場薪資資料為主要依據。'
    return `${base}${fireWealth ? `${branch}為火旺之地，火為癸水之財星，屬財星明顯之年。` : ''}若命局以${strengthLabel}初判，財星或資源機會增加時，也可能同步帶來責任、支出與壓力。薪資方面，適合把成果量化，用績效、職責與制度內貢獻談薪；不宜過度投機或高槓桿操作。${monthHint}`
  }
  return `${base}此處以流年天干十神與命局強弱初判作保守分析，實務仍需配合個人選擇、環境條件與完整流月資料。`
}

function stemTenGod(chart: BaziChart, stem: string): string {
  return getTenGod(chart.dayMaster, stem)
}

function buildDetailText(input: BirthInput, chart: BaziChart, strength: number, favorable: Element[], basis: string[]): string {
  const pillars = pillarsToArray(chart).map((p) => `${p.stem}${p.branch}`).join(' ')
  const gender = (input.gender || '男') as Gender
  const wuge = input.name ? calculateWuge(input.name, gender, input.compoundSurname) : null

  let text = `命盤四柱：${pillars}。日主${chart.dayMaster}屬${chart.dayMasterElement}。身強弱參考分數：${strength}%，${STRENGTH_SCORE_NOTE}`
  text += ` 喜用初判偏向${favorable.join('、')}，需配合完整旺衰模型再驗證。`
  text += ` 判斷依據：${basis.join('；')}。`

  if (wuge && wuge.總格 > 0) {
    text += ` 姓名「${input.name}」目前可列出五格數值供校驗：天${wuge.天格}、人${wuge.人格}、地${wuge.地格}、外${wuge.外格}、總${wuge.總格}。`
    text += ` ${NAME_VALIDATION_NOTE}`
    const charDesc = wuge.charAnalysis.filter((c) => c.meaning).map((c) => `${c.char}(${c.wuxing})`).join('')
    if (charDesc) text += ` 目前字義資料：${charDesc}；字五行來源需以所選流派確認。`
  }

  const dmProfile = getDaymasterProfile(chart.dayMaster)
  if (dmProfile) text += ` ${dmProfile.name}日主：${dmProfile.traits}`

  const zodiac = getZodiacByBranch(chart.year.branch)
  if (zodiac) text += ` 生肖${zodiac.name}，${zodiac.traits}。`

  text += ` ${input.analysisYear}年流年分析：${buildTopicAnalysis(input, chart, strength >= 45 ? '中和偏弱' : '偏弱')}`
  if (input.query.trim()) text += ` 針對提問「${input.query.trim()}」— 綜合五行旺衰與流年氣場，建議審慎決策、順勢而為。`
  return text
}

export function getClashes(chart: BaziChart): string[] {
  const items = computeChartRelations(chart).filter((r) => r.type === '沖')
  return items.length ? items.map((r) => r.label) : ['四柱無明顯六沖']
}

/** @deprecated use computeChartRelations from dataStore */
export function getRelations(chart: BaziChart): RelationItem[] {
  return computeChartRelations(chart)
}

export function getDayun(chart: BaziChart, gender: '男' | '女'): { age: string; pillar: string; tenGod: string }[] {
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const yearStemIdx = stems.indexOf(chart.year.stem)
  const forward = (gender === '男' && yearStemIdx % 2 === 0) || (gender === '女' && yearStemIdx % 2 === 1)
  const monthStem = stems.indexOf(chart.month.stem)
  const monthBranch = branches.indexOf(chart.month.branch)

  const result: { age: string; pillar: string; tenGod: string }[] = []
  for (let i = 0; i < 8; i++) {
    const step = forward ? i + 1 : -(i + 1)
    const si = ((monthStem + step) % 10 + 10) % 10
    const bi = ((monthBranch + step) % 12 + 12) % 12
    const pillar = `${stems[si]}${branches[bi]}`
    result.push({
      age: `第${i + 1}步大運`,
      pillar,
      tenGod: stemTenGod(chart, stems[si]),
    })
  }
  return result
}

function scoreTenGod(god: string, favorable: Element[], element: Element): number {
  let score = 55
  if (favorable.includes(element)) score += 18
  if (god.includes('財') || god.includes('官') || god.includes('印')) score += 8
  if (god.includes('殺') || god.includes('傷') || god.includes('劫')) score -= 6
  return Math.max(30, Math.min(92, score))
}

export function getDayunDetails(chart: BaziChart, gender: '男' | '女', favorable: Element[]): DayunDetail[] {
  return getDayun(chart, gender).map((d) => {
    const stem = d.pillar[0]
    const element = STEM_TO_ELEMENT[stem]
    const score = scoreTenGod(d.tenGod, favorable, element)
    const focus = favorable.includes(element)
      ? `${d.pillar}大運帶${element}氣，系統模型視為較能補命局所需；仍需配合起運歲數與實際年份驗證。`
      : `${d.pillar}大運以${d.tenGod}為主，系統參考分數較保守；宜控制節奏，先穩住基本盤再求突破。`
    return { ...d, element, score, focus, verificationNote: DAYUN_NOTE }
  })
}

export function getLiunian(chart: BaziChart, startYear: number, count = 5): LiunianItem[] {
  const items: LiunianItem[] = []
  for (let y = startYear; y < startYear + count; y++) {
    const pillar = ganZhiFromYear(y)
    const stem = pillar[0]
    const god = stemTenGod(chart, stem)
    const nayin = getNayin(pillar).nayin
    const stemElement = STEM_ELEMENTS[stem]
    const summary = `${y}年${pillar}，天干${stem}為${chart.dayMaster}日主之${god}。${god.includes('財') ? '財星明顯，代表收入、資源與責任同步增加，不等於必然發財。' : god.includes('官') || god.includes('殺') ? '官殺代表制度、職責與壓力，需看制化與承擔能力。' : god.includes('印') ? '印星代表學習、資源與支援，可作為穩定基本盤。' : '宜穩健行事，避免只憑單一年份下定論。'}${stemElement === '火' && chart.dayMasterElement === '水' ? '火為水日主之財星，若身偏弱則亦有耗身與壓力。' : ''}`
    items.push({ year: y, pillar, tenGod: god, nayin, summary })
  }
  return items
}

export function getLiuyue(chart: BaziChart, year: number): LiuyueItem[] {
  const labels = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','臘月']
  const ranges = ['約立春至驚蟄', '約驚蟄至清明', '約清明至立夏', '約立夏至芒種', '約芒種至小暑', '約小暑至立秋', '約立秋至白露', '約白露至寒露', '約寒露至立冬', '約立冬至大雪', '約大雪至小寒', '約小寒至立春前']
  const yearStem = ganZhiFromYear(year)[0]
  const yearStemIdx = STEMS.indexOf(yearStem as typeof STEMS[number])
  return labels.map((label, i) => {
    const branchIdx = (i + 2) % 12
    const stemIdx = getMonthStemIndex(yearStemIdx, branchIdx)
    const pillar = STEMS[stemIdx] + BRANCHES[branchIdx]
    const stem = pillar[0]
    return {
      month: i + 1,
      label,
      pillar,
      tenGod: stemTenGod(chart, stem),
      range: ranges[i],
    }
  })
}

export function getLiuyueDetails(chart: BaziChart, year: number, favorable: Element[]): LiuyueDetail[] {
  return getLiuyue(chart, year).map((m) => {
    const element = STEM_TO_ELEMENT[m.pillar[0]]
    const score = scoreTenGod(m.tenGod, favorable, element)
    const advice = score >= 72
      ? '此月氣勢較順，可推進重要事項。'
      : score >= 55
        ? '此月平穩，適合整理資源與穩步執行。'
        : '此月宜保守，合約、投資與情緒決策需多確認。'
    return { ...m, score, advice }
  })
}

export function getTenYearTrend(chart: BaziChart, startYear: number, favorable: Element[]): TrendItem[] {
  return getLiunian(chart, startYear, 10).map((item) => {
    const element = STEM_TO_ELEMENT[item.pillar[0]]
    const score = scoreTenGod(item.tenGod, favorable, element)
    const label = score >= 75 ? '旺' : score >= 60 ? '順' : score >= 45 ? '平' : '守'
    return { year: item.year, pillar: item.pillar, score, label, summary: item.summary }
  })
}

export function getElementAdvice(favorable: Element[]): ElementAdvice[] {
  return favorable.map((element) => ({ element, ...ELEMENT_REMEDIES[element] }))
}

function resolveChart(input: BirthInput): BaziChart | null {
  if (input.inputMode === 'manual' || input.inputMode === 'upload') {
    return buildChartFromManual(input.manualPillars)
  }
  if (!input.year || !input.month || !input.day) return null
  const hourIdx = input.hour === '' ? 0 : input.hour
  const hour = input.uncertainHour ? 0 : HOUR_MAP[hourIdx as number] ?? 13
  return calculateBazi(input.year as number, input.month as number, input.day as number, hour)
}

export function getChartFieldErrors(input: BirthInput): string[] {
  const missing: string[] = []
  if (input.inputMode === 'solar') {
    if (!input.year) missing.push('year')
    if (!input.month) missing.push('month')
    if (!input.day) missing.push('day')
    if (input.hour === '' && !input.uncertainHour) missing.push('hour')
  } else {
    const labels = ['year', 'month', 'day', 'hour'] as const
    const keys = ['year', 'month', 'day', 'hour'] as const
    keys.forEach((k, i) => {
      if (input.manualPillars[k].length !== 2) missing.push(labels[i])
    })
  }
  return missing
}

const FIELD_LABELS: Record<string, string> = {
  year: '出生年', month: '出生月', day: '出生日', hour: '時辰',
}

export function validateChartInput(input: BirthInput): string | null {
  const missing = getChartFieldErrors(input)
  if (missing.length === 0) return null
  if (input.inputMode !== 'solar') return '請完整選擇四柱天干地支（年、月、日、時各選一組）'
  const labels = missing.map((k) => FIELD_LABELS[k] ?? k)
  return `請填寫：${labels.join('、')}`
}

export function validateAnalysisExtras(input: BirthInput): string | null {
  if (!input.gender) return '請選擇性別'
  if (!input.analysisYear) return '請填寫分析年份'
  return null
}

export function validateInput(input: BirthInput): string | null {
  return validateChartInput(input) ?? validateAnalysisExtras(input)
}

export function withAnalysisDefaults(input: BirthInput): BirthInput {
  return {
    ...input,
    gender: (input.gender || '男') as Gender,
    analysisYear: (input.analysisYear || new Date().getFullYear()) as number,
    topic: input.topic || '整體運勢',
  }
}

export function analyzeBirth(input: BirthInput): AnalysisResult | null {
  const chart = resolveChart(input)
  if (!chart) return null

  const inputWithDefaults = withAnalysisDefaults(input)
  const analysisYear = inputWithDefaults.analysisYear as number
  const gender = inputWithDefaults.gender as Gender

  const elementStats = countElements(chart)
  const strength = calcStrength(chart, elementStats)
  const strengthLabel = strength >= 55 ? '偏強' : strength >= 45 ? '中和偏弱' : '偏弱'
  const favorableElements = getFavorable(chart.dayMasterElement, strength)
  const unfavorableElements = getUnfavorable(chart.dayMasterElement, favorableElements)
  const sorted = ELEMENT_ORDER.map((e) => ({ e, v: elementStats[e] })).sort((a, b) => b.v - a.v)
  const patternAnalysis = detectPattern(chart)
  const pattern = patternAnalysis.pattern
  const wuge = input.name.trim() ? calculateWuge(input.name, gender, input.compoundSurname) : undefined
  const relations = computeChartRelations(chart)
  const liunian = getLiunian(chart, analysisYear, 10)
  const liuyue = getLiuyue(chart, analysisYear)
  const dayunDetails = getDayunDetails(chart, gender, favorableElements)
  const liuyueDetails = getLiuyueDetails(chart, analysisYear, favorableElements)
  const tenYearTrend = getTenYearTrend(chart, analysisYear, favorableElements)
  const elementAdvice = getElementAdvice(favorableElements)
  const shensha = computeShensha(chart)
  const dmProfile = getDaymasterProfile(chart.dayMaster)
  const monthHiddenText = chart.month.hiddenStemTenGods.map((h) => `${h.stem}${h.qi}${h.tenGod}`).join('、')
  const basis = strengthBasis(chart)
  const elementExplanation = elementReason(chart, sorted[0].e, sorted[sorted.length - 1].e)

  const summary = [
    ...(chart.sourceNotes ?? []),
    `日主：${chart.dayMaster}（${chart.dayMasterElement}）`,
    `身強弱：${strengthLabel}（系統初判）；參考分數：${strength}%`,
    `喜用初判：${favorableElements.join('、')}${unfavorableElements.length ? `；需留意：${unfavorableElements.join('、')}` : ''}`,
    `五行最旺：${sorted[0].e}；最弱：${sorted[sorted.length - 1].e}。${ELEMENT_MODEL_NOTE}`,
    `五行說明：${elementExplanation}`,
    `格局傾向：${pattern}。${patternAnalysis.note}`,
    `月令${chart.month.branch}藏干：${monthHiddenText}`,
    `刑沖合害：${relations.map((r) => r.label).join('、')}`,
    LIUNIAN_NOTE,
    LIUYUE_NOTE,
    ...pillarsToArray(chart).map((p) => `${p.label}納音：${p.nayin}`),
  ].join('\n')

  return {
    chart,
    elementStats,
    strength,
    strengthLabel,
    favorableElements,
    unfavorableElements,
    strongestElement: sorted[0].e,
    weakestElement: sorted[sorted.length - 1].e,
    pattern,
    patternNote: patternAnalysis.note,
    summary,
    detailText: buildDetailText(inputWithDefaults, chart, strength, favorableElements, basis),
    topicAnalysis: buildTopicAnalysis(inputWithDefaults, chart, strengthLabel),
    wuge,
    relations,
    liunian,
    liuyue,
    dayunDetails,
    liuyueDetails,
    tenYearTrend,
    elementAdvice,
    shensha,
    daymasterProfile: dmProfile ? `${dmProfile.name}：${dmProfile.traits}` : `${chart.dayMaster}日主`,
    elementModelNote: ELEMENT_MODEL_NOTE,
    elementReason: elementExplanation,
    strengthScoreNote: STRENGTH_SCORE_NOTE,
    strengthBasis: basis,
    strengthConfidence: '中',
    favorableNote: '喜用與忌神為系統初判，需配合完整旺衰、調候與格局制化再驗證。',
    dayunNote: DAYUN_NOTE,
    liunianNote: LIUNIAN_NOTE,
    liuyueNote: LIUYUE_NOTE,
    nameValidationNote: NAME_VALIDATION_NOTE,
    shenshaNote: SHENSHA_NOTE,
  }
}
