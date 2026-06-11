export type Element = '木' | '火' | '土' | '金' | '水'
export type Gender = '男' | '女'
export type InputMode = 'solar' | 'manual' | 'upload'
export type Qi = '主氣' | '中氣' | '餘氣'
export type TenGodName =
  | '日主'
  | '比肩'
  | '劫財'
  | '食神'
  | '傷官'
  | '偏財'
  | '正財'
  | '七殺'
  | '正官'
  | '偏印'
  | '正印'

export interface HiddenStemTenGod {
  stem: string
  qi: Qi
  tenGod: TenGodName
}

export type AnalysisTopic =
  | '事業'
  | '健康'
  | '婚姻'
  | '感情'
  | '升遷'
  | '學業'
  | '薪資'
  | '財運'
  | '股票'
  | '人際'
  | '整體運勢'

export type ChartTab =
  | '命盤'
  | '五行'
  | '十神'
  | '強弱'
  | '刑沖'
  | '大運'
  | '流年流月'

export type AiTone = 'professional' | 'plain' | 'elder' | 'master'

export interface AiSections {
  career: string
  wealth: string
  relationship: string
  health: string
  yearly: string
  nameAdvice: string
  remedies: string
}

export interface AiQuestion {
  id: string
  question: string
  answer: string
  createdAt: number
}

export interface ElementAdvice {
  element: Element
  colors: string[]
  directions: string[]
  careers: string[]
  habits: string[]
}

export interface DayunDetail {
  age: string
  pillar: string
  tenGod: string
  element: Element
  focus: string
  score: number
}

export interface LiuyueDetail extends LiuyueItem {
  score: number
  advice: string
}

export interface TrendItem {
  year: number
  pillar: string
  score: number
  label: string
  summary: string
}

export interface ManualPillars {
  year: string
  month: string
  day: string
  hour: string
}

export interface Pillar {
  label: string
  stem: string
  branch: string
  stemElement: Element
  branchElement: Element
  hiddenStems: string[]
  hiddenStemTenGods: HiddenStemTenGod[]
  branchMainQi: HiddenStemTenGod
  stemTenGod: TenGodName
  tenGod: string
  nayin?: string
}

export interface BaziChart {
  year: Pillar
  month: Pillar
  day: Pillar
  hour: Pillar
  dayMaster: string
  dayMasterElement: Element
}

export interface ElementStats {
  木: number
  火: number
  土: number
  金: number
  水: number
}

export interface WugeDetail {
  number: number
  luck: string
  title: string
  meaning: string
}

export interface CharAnalysis {
  char: string
  strokes: number
  wuxing: string
  meaning: string
}

export interface SancaiResult {
  luck: string
  title: string
  meaning: string
}

export interface WugeResult {
  天格: number
  人格: number
  地格: number
  外格: number
  總格: number
  strokes: number[]
  luck: Record<string, string>
  details: Record<string, WugeDetail>
  unknownChars: string[]
  surnameLength: number
  sancai: SancaiResult | null
  charAnalysis: CharAnalysis[]
}

export interface ShenshaItem {
  name: string
  type: string
  desc: string
  found: boolean
}

export interface RelationItem {
  type: string
  label: string
  desc: string
}

export interface LiunianItem {
  year: number
  pillar: string
  tenGod: string
  nayin: string
  summary: string
}

export interface LiuyueItem {
  month: number
  label: string
  pillar: string
  tenGod: string
}

export interface AnalysisResult {
  chart: BaziChart
  elementStats: ElementStats
  strength: number
  strengthLabel: string
  favorableElements: Element[]
  strongestElement: Element
  weakestElement: Element
  pattern: string
  summary: string
  detailText: string
  topicAnalysis: string
  aiSections?: AiSections
  aiQuestions?: AiQuestion[]
  wuge?: WugeResult
  relations: RelationItem[]
  liunian: LiunianItem[]
  liuyue: LiuyueItem[]
  dayunDetails: DayunDetail[]
  liuyueDetails: LiuyueDetail[]
  tenYearTrend: TrendItem[]
  elementAdvice: ElementAdvice[]
  shensha: ShenshaItem[]
  daymasterProfile?: string
}

export interface BirthInput {
  inputMode: InputMode
  year: number | ''
  month: number | ''
  day: number | ''
  hour: number | ''
  uncertainHour: boolean
  manualPillars: ManualPillars
  name: string
  gender: Gender | ''
  analysisYear: number | ''
  topic: AnalysisTopic | ''
  query: string
  compoundSurname: string
  chartImageId?: string
}

export interface SavedRecord {
  id: string
  name: string
  input: BirthInput
  result: AnalysisResult
  createdAt: number
  updatedAt: number
}
