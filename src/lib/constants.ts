import type { Element } from '../types'

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

export const STEM_ELEMENTS: Record<string, Element> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土',
  庚: '金', 辛: '金', 壬: '水', 癸: '水',
}

export const BRANCH_ELEMENTS: Record<string, Element> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
}

export const HIDDEN_STEMS: Record<string, string[]> = {
  子: ['癸'], 丑: ['己', '癸', '辛'], 寅: ['甲', '丙', '戊'], 卯: ['乙'],
  辰: ['戊', '乙', '癸'], 巳: ['丙', '戊', '庚'], 午: ['丁', '己'],
  未: ['己', '丁', '乙'], 申: ['庚', '壬', '戊'], 酉: ['辛'],
  戌: ['戊', '辛', '丁'], 亥: ['壬', '甲'],
}

export const HOUR_LABELS = [
  { value: 0, label: '0時 (子時)' },
  { value: 1, label: '1時 (丑時)' },
  { value: 2, label: '3時 (寅時)' },
  { value: 3, label: '5時 (卯時)' },
  { value: 4, label: '7時 (辰時)' },
  { value: 5, label: '9時 (巳時)' },
  { value: 6, label: '11時 (午時)' },
  { value: 7, label: '13時 (未時)' },
  { value: 8, label: '15時 (申時)' },
  { value: 9, label: '17時 (酉時)' },
  { value: 10, label: '19時 (戌時)' },
  { value: 11, label: '21時 (亥時)' },
  { value: 12, label: '23時 (子時)' },
]

export const TEN_GOD_NAMES: Record<string, string> = {
  比肩: '比劫', 劫財: '比劫', 食神: '食傷', 傷官: '食傷',
  偏財: '財星', 正財: '財星', 七殺: '官殺', 正官: '官殺',
  偏印: '印星', 正印: '印星',
}

export const TEN_GOD_DESC: Record<string, string> = {
  財星: '代表財富、物質、父親、妻子（男命）',
  官殺: '代表事業、權力、名譽、丈夫（女命）',
  印星: '代表學業、貴人、母親、名譽',
  比劫: '代表兄弟、朋友、競爭、自我',
  食傷: '代表才華、表達、子女、創造力',
}

export const ELEMENT_CLASS: Record<Element, string> = {
  木: 'element-wood',
  火: 'element-fire',
  土: 'element-earth',
  金: 'element-metal',
  水: 'element-water',
}

export const ELEMENT_BG: Record<Element, string> = {
  木: 'bg-element-wood',
  火: 'bg-element-fire',
  土: 'bg-element-earth',
  金: 'bg-element-metal',
  水: 'bg-element-water',
}

export const ANALYSIS_TOPICS = [
  '事業', '健康', '婚姻', '感情', '升遷', '學業',
  '薪資', '財運', '股票', '人際', '整體運勢',
] as const

export const CHART_TABS = [
  '命盤', '五行', '十神', '強弱', '刑沖', '大運', '流年流月',
] as const

// 五虎遁：年干定月干
const MONTH_STEM_START: Record<number, number> = {
  0: 2, 5: 2, // 甲己 -> 丙
  1: 4, 6: 4, // 乙庚 -> 戊
  2: 6, 7: 6, // 丙辛 -> 庚
  3: 8, 8: 8, // 丁壬 -> 壬
  4: 0, 9: 0, // 戊癸 -> 甲
}

// 五鼠遁：日干定時干
const HOUR_STEM_START: Record<number, number> = {
  0: 0, 5: 0,
  1: 2, 6: 2,
  2: 4, 7: 4,
  3: 6, 8: 6,
  4: 8, 9: 8,
}

export function getMonthStemIndex(yearStemIndex: number, monthBranchIndex: number): number {
  const start = MONTH_STEM_START[yearStemIndex]
  const offset = (monthBranchIndex - 2 + 12) % 12
  return (start + offset) % 10
}

export function getHourStemIndex(dayStemIndex: number, hourBranchIndex: number): number {
  const start = HOUR_STEM_START[dayStemIndex]
  return (start + hourBranchIndex) % 10
}

