import type {
  AnalysisResult, AnalysisTopic, BaziChart, BirthInput, Element, ElementStats, Gender,
  DayunDetail, ElementAdvice, LiunianItem, LiuyueDetail, LiuyueItem, RelationItem, TrendItem,
} from '../types'
import { HIDDEN_STEMS, STEM_ELEMENTS, getTenGod } from './constants'
import { buildChartFromManual, calculateBazi, ganZhiFromMonth, ganZhiFromYear, pillarsToArray } from './bazi'
import { calculateWuge } from './wuge'
import { getNayin, computeShensha, getDaymasterProfile, getZodiacByBranch, computeChartRelations, getPattern } from './dataStore'

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

function countElements(chart: BaziChart): ElementStats {
  const stats: ElementStats = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
  for (const p of pillarsToArray(chart)) {
    stats[p.stemElement] += 1.2
    stats[p.branchElement] += 1
    for (const h of p.hiddenStems) stats[STEM_ELEMENTS[h]] += 0.3
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

function detectPattern(chart: BaziChart): string {
  const monthGod = chart.month.tenGod
  if (monthGod.includes('印')) return '偏印格'
  if (monthGod.includes('殺')) return '七殺格'
  if (monthGod.includes('官')) return '正官格'
  if (monthGod.includes('財')) return monthGod.includes('偏') ? '偏財格' : '正財格'
  if (monthGod.includes('食')) return '食神格'
  if (monthGod.includes('傷')) return '傷官格'
  if (monthGod.includes('劫')) return '劫財格'
  if (monthGod.includes('比')) return '比肩格'
  return '中和格'
}

const TOPIC_TEXT: Record<AnalysisTopic, (input: BirthInput, chart: BaziChart, strength: number) => string> = {
  事業: (i, c, s) => `以${c.dayMaster}${c.dayMasterElement}日主論，${i.analysisYear}年事業上${s >= 50 ? '宜主動進取' : '宜穩守積累'}，留意農曆三四月貴人運較旺。`,
  健康: (i, c) => `五行${c.dayMasterElement}日主，${i.analysisYear}年注意${c.dayMasterElement === '火' ? '心血管' : c.dayMasterElement === '水' ? '腎泌尿' : c.dayMasterElement === '木' ? '肝膽' : c.dayMasterElement === '金' ? '呼吸系統' : '脾胃'}保養，規律作息為要。`,
  婚姻: (i, c, s) => `${i.gender === '男' ? '男命' : '女命'}以${c.dayMaster}為日主，${i.analysisYear}年感情${s < 45 ? '宜多溝通包容' : '運勢平穩'}，秋冬較利姻緣。`,
  感情: (i) => `${i.analysisYear}年桃花位於流年地支所合之方，春夏之交人際活躍，宜誠懇待人。`,
  升遷: (i, _c, s) => `${i.analysisYear}年官殺氣勢${s >= 55 ? '偏旺，有升遷機會' : '平和，宜充實專業再圖晉升'}，下半年留意上司提携。`,
  學業: (i, c) => `${c.dayMaster}日主${i.analysisYear}年印星${c.month.tenGod.includes('印') ? '有力，利考試進修' : '一般，需加倍用功'}。`,
  薪資: (i, c) => `${i.analysisYear}年財星狀態${c.month.tenGod.includes('財') ? '尚可，正財主穩定收入' : '平平，宜開源節流'}，勿過度投機。`,
  財運: (i, _c, s) => `${i.analysisYear}年整體財運${s >= 50 ? '中等偏上' : '宜守不宜攻'}，農曆八九月有小財，忌衝動消費。`,
  股票: (i, c, s) => {
    const q = i.query || `${i.analysisYear}年股票運勢`
    return `依命盤推演「${q}」：${c.dayMaster}${c.dayMasterElement}日主，${i.analysisYear}年6月（農曆五月）財星${s >= 48 ? '不弱' : '偏弱'}，${s >= 48 ? '可小額佈局但忌追高，宜選穩健標的' : '不宜重倉操作，以觀望為主'}。未月與日支有合，短線波動大，建議設定停損。`
  },
  人際: (_i, c) => `${c.dayMaster}日主比劫氣${pillarsToArray(c).filter((p) => p.tenGod.includes('比') || p.tenGod.includes('劫')).length >= 2 ? '偏旺，易有競爭' : '平和'}，宜廣結善緣。`,
  整體運勢: (i, _c, s) => `${i.analysisYear}年整體運勢${s >= 55 ? '平穩向上' : s >= 40 ? '起伏中見機會' : '宜韜光養晦'}，上半年謀劃、下半年執行為佳。`,
}

function stemTenGod(chart: BaziChart, stem: string): string {
  if (stem === chart.dayMaster) return '比肩'
  const dmEl = chart.dayMasterElement
  const yin = ['乙', '丁', '己', '辛', '癸'].includes(chart.dayMaster)
  return getTenGod(dmEl, yin, stem)
}

function buildDetailText(input: BirthInput, chart: BaziChart, strength: number, favorable: Element[]): string {
  const pillars = pillarsToArray(chart).map((p) => `${p.stem}${p.branch}`).join(' ')
  const gender = (input.gender || '男') as Gender
  const topic = (input.topic || '整體運勢') as AnalysisTopic
  const wuge = input.name ? calculateWuge(input.name, gender, input.compoundSurname) : null

  let text = `命盤四柱：${pillars}。日主${chart.dayMaster}屬${chart.dayMasterElement}，身強弱約${strength}%。`
  text += `喜用神偏向${favorable.join('、')}。`

  if (wuge && wuge.總格 > 0) {
    text += ` 姓名「${input.name}」五格：天${wuge.天格}(${wuge.luck.天格})、人${wuge.人格}(${wuge.luck.人格})、地${wuge.地格}(${wuge.luck.地格})、外${wuge.外格}(${wuge.luck.外格})、總${wuge.總格}(${wuge.luck.總格})。`
    if (wuge.sancai) text += ` 三才配置：${wuge.sancai.title}（${wuge.sancai.luck}）。`
    text += `人格主運，${wuge.details.人格.meaning}`
    const charDesc = wuge.charAnalysis.filter((c) => c.meaning).map((c) => `${c.char}(${c.wuxing})`).join('')
    if (charDesc) text += ` 姓名字五行：${charDesc}。`
  }

  const dmProfile = getDaymasterProfile(chart.dayMaster)
  if (dmProfile) text += ` ${dmProfile.name}日主：${dmProfile.traits}`

  const zodiac = getZodiacByBranch(chart.year.branch)
  if (zodiac) text += ` 生肖${zodiac.name}，${zodiac.traits}。`

  text += ` ${input.analysisYear}年流年分析：${TOPIC_TEXT[topic](input, chart, strength)}`
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
      age: `${8 + i * 10}-${17 + i * 10}歲`,
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
      ? `${d.pillar}大運帶${element}氣，較能補命局所需，適合主動布局與累積成果。`
      : `${d.pillar}大運以${d.tenGod}為主，宜控制節奏，先穩住基本盤再求突破。`
    return { ...d, element, score, focus }
  })
}

export function getLiunian(chart: BaziChart, startYear: number, count = 5): LiunianItem[] {
  const items: LiunianItem[] = []
  for (let y = startYear; y < startYear + count; y++) {
    const pillar = ganZhiFromYear(y)
    const stem = pillar[0]
    const god = stemTenGod(chart, stem)
    const nayin = getNayin(pillar).nayin
    const summary = `${y}年${pillar}，天干${god}${god.includes('財') ? '，利財運' : god.includes('官') || god.includes('殺') ? '，事業有壓力亦有机' : god.includes('印') ? '，利學業貴人' : '，宜穩健行事'}`
    items.push({ year: y, pillar, tenGod: god, nayin, summary })
  }
  return items
}

export function getLiuyue(chart: BaziChart, year: number): LiuyueItem[] {
  const labels = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','臘月']
  return labels.map((label, i) => {
    const pillar = ganZhiFromMonth(year, i + 1)
    const stem = pillar[0]
    return {
      month: i + 1,
      label,
      pillar,
      tenGod: stemTenGod(chart, stem),
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
  const topic = inputWithDefaults.topic as AnalysisTopic
  const analysisYear = inputWithDefaults.analysisYear as number
  const gender = inputWithDefaults.gender as Gender

  const elementStats = countElements(chart)
  const strength = calcStrength(chart, elementStats)
  const strengthLabel = strength >= 55 ? '偏強' : strength >= 45 ? '中和' : '偏弱'
  const favorableElements = getFavorable(chart.dayMasterElement, strength)
  const sorted = ELEMENT_ORDER.map((e) => ({ e, v: elementStats[e] })).sort((a, b) => b.v - a.v)
  const pattern = detectPattern(chart)
  const patternInfo = getPattern(pattern)
  const wuge = input.name.trim() ? calculateWuge(input.name, gender, input.compoundSurname) : undefined
  const relations = computeChartRelations(chart)
  const liunian = getLiunian(chart, analysisYear, 5)
  const liuyue = getLiuyue(chart, analysisYear)
  const dayunDetails = getDayunDetails(chart, gender, favorableElements)
  const liuyueDetails = getLiuyueDetails(chart, analysisYear, favorableElements)
  const tenYearTrend = getTenYearTrend(chart, analysisYear, favorableElements)
  const elementAdvice = getElementAdvice(favorableElements)
  const shensha = computeShensha(chart)
  const dmProfile = getDaymasterProfile(chart.dayMaster)

  const summary = [
    `日主：${chart.dayMaster}（${chart.dayMasterElement}）`,
    `強弱：${strengthLabel}（約 ${strength}%），喜用：${favorableElements.join('、')}`,
    `五行最旺：${sorted[0].e}；最弱：${sorted[sorted.length - 1].e}`,
    `格局：${pattern}（${patternInfo.desc}），月令${chart.month.branch}藏${HIDDEN_STEMS[chart.month.branch]?.join('')}干`,
    ...pillarsToArray(chart).map((p) => `${p.label}納音：${p.nayin}`),
  ].join('\n')

  return {
    chart,
    elementStats,
    strength,
    strengthLabel,
    favorableElements,
    strongestElement: sorted[0].e,
    weakestElement: sorted[sorted.length - 1].e,
    pattern,
    summary,
    detailText: buildDetailText(inputWithDefaults, chart, strength, favorableElements),
    topicAnalysis: TOPIC_TEXT[topic](inputWithDefaults, chart, strength),
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
  }
}
