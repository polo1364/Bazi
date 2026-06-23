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
  startAge?: string
  endAge?: string
  verificationNote?: string
}

export interface LuckStartInfo {
  direction: 'forward' | 'backward' | null
  directionLabel: string
  directionReason: string
  verified: boolean
  startAge?: string
  startAgeYears?: number
  startAgeMonths?: number
  totalDiffDays?: number
  usedTermName?: string
  usedTermDateText?: string
  method: string
  note?: string
  reason?: string
}

export interface LiuyueDetail extends LiuyueItem {
  score: number
  advice: string
  range?: string
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

export type SolarTimeMode = 'none' | 'meanSolarTime' | 'trueSolarTime'

export interface PillarChangeInfo {
  changed: boolean
  changedFields: string[]
  messages: string[]
}

export interface SolarTimeCorrection {
  enabled: boolean
  mode: SolarTimeMode
  originalDateTime: string
  correctedDateTime: string
  standardMeridian: number
  birthLongitude: number
  longitudeCorrectionMinutes: number
  equationOfTimeMinutes: number
  totalCorrectionMinutes: number
  note: string
  pillarChange?: PillarChangeInfo
}

export interface BaziChart {
  year: Pillar
  month: Pillar
  day: Pillar
  hour: Pillar
  dayMaster: string
  dayMasterElement: Element
  source?: 'lunar-javascript' | 'manual'
  sourceNotes?: string[]
  solarText?: string
  lunarText?: string
  solarTimeCorrection?: SolarTimeCorrection
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
  sancai: SancaiResult | null | {
    verified: boolean
    combination: string
    level: string
    summary: string
    source: string
    tableCoverage: 'partial' | 'full'
    heaven?: { number: number; element: string }
    personality?: { number: number; element: string }
    earth?: { number: number; element: string }
  }
  charAnalysis: CharAnalysis[]
  verified?: boolean
  status?: '待校驗'
  reason?: string
  source?: string | null
  chars?: Array<{
    char: string
    strokes: number | null
    source: string | null
    verified: boolean
    status?: '待校驗'
    reason?: string
  }>
  nameType?: '單姓雙名'
  wugeFortune?: {
    verified: boolean
    source: string
    note: string
    items: Record<string, {
      number: number
      level?: string
      title?: string
      summary?: string
      verified: boolean
      source?: string
      status?: '待校驗'
      reason?: string
    }>
  }
  wugeFortuneVerified?: boolean
  note?: string
  finalNote?: string
}

export interface ShenshaItem {
  name: string
  status?: '成立' | '不成立' | '不適用' | '尚未驗證' | '未驗證' | '別名'
  type: string
  desc: string
  found: boolean
  basis?: string
  trigger?: string[]
  lookupKey?: string | Record<string, string>
  targetStems?: string[]
  targetBranches?: string[] | Record<string, string[]>
  targetPillars?: string[]
  matchedBranches?: Array<{ pillar: string; branch: string }>
  matchedPillars?: Array<{ pillar: string; stem?: string; branch?: string; basis?: string }>
  description?: string
  source?: string
  verified?: boolean
  reason?: string
  xun?: string
  note?: string
}

export interface RelationItem {
  type: string
  label: string
  desc: string
  name?: string
  branches?: string[]
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
  range?: string
}

export interface StrengthV2DeAspect {
  status: string
  reason: string
  roots?: string[]
  supporters?: string[]
}

export interface StrengthV2ForceItem {
  source: string
  stem: string
  element: Element
  weight: number
  note: string
}

export interface StrengthV2Result {
  label: string
  confidence: string
  score: number
  scoreNote: string
  dayStem: string
  dayElement: Element
  deLing: StrengthV2DeAspect
  deDi: StrengthV2DeAspect
  deShi: StrengthV2DeAspect
  roots: {
    roots: Array<{ pillar: string; branch?: string; hiddenStem: string; qi: string; strength: string; reason: string }>
    summary: string
  }
  stemSupport: {
    supportStems: Array<{ pillar: string; stem: string; type: string; tenGod: string }>
    drainStems: Array<{ pillar: string; stem: string; type: string; tenGod: string }>
    controlStems: Array<{ pillar: string; stem: string; type: string; tenGod: string }>
    summary: string
  }
  forces: {
    support: StrengthV2ForceItem[]
    resource: StrengthV2ForceItem[]
    control: StrengthV2ForceItem[]
    output: StrengthV2ForceItem[]
    wealth: StrengthV2ForceItem[]
    summary: {
      supportScore: number
      resourceScore: number
      controlScore: number
      outputScore: number
      wealthScore: number
    }
    weightNote: string
    monthBranch: string
  }
  pattern: {
    patternLabel: string
    confidence: string
    reasons: string[]
    warning: string
  }
  usefulGods: {
    useful: Element[]
    priority: Array<{ element: Element; reason: string }>
    avoid: Array<{ element: Element; reason: string }>
    note: string
  }
  reasons: string[]
  note: string
}

export interface FortuneV2Factor {
  text: string
}

export interface FortuneV2Interaction {
  type: string
  name: string
  branches: string[]
  desc: string
  with: string
}

export interface FortuneV2LuckCycleImpact {
  pillar: string
  stem: string
  branch: string
  stemTenGod: string
  branchElement: Element
  ageRange?: string
  overall: string
  helpfulFactors: string[]
  pressureFactors: string[]
  interactions: FortuneV2Interaction[]
  confidence: string
  note: string
}

export interface FortuneV2Score {
  score: number
  level: '偏有利' | '平穩' | '機會與壓力並存' | '壓力偏高'
  scoreNote: string
  breakdown: {
    usefulSupportScore: number
    avoidPressureScore: number
    tenGodThemeScore: number
    interactionRiskScore: number
    luckCycleBufferScore: number
  }
}

export interface FortuneV2YearImpact {
  year: number
  pillar: string
  stem: string
  branch: string
  stemTenGod: string
  branchElement: Element
  theme: string
  positiveFactors: string[]
  riskFactors: string[]
  luckCycleModifier: string[]
  interactions: FortuneV2Interaction[]
  conclusion: string
  score: FortuneV2Score
  confidence: string
}

export interface FortuneV2MonthImpact {
  month: number
  monthLabel: string
  pillar: string
  stem: string
  branch: string
  stemTenGod: string
  branchElement: Element
  theme: string
  positiveFactors: string[]
  riskFactors: string[]
  interactions: FortuneV2Interaction[]
  suggestion: string
  score: FortuneV2Score
  confidence: string
}

export interface FortuneV2YearSummary {
  summary: string
  keyMonths: {
    supportive: string[]
    pressure: string[]
    neutral: string[]
  }
  advice: string[]
  warnings: string[]
}

export interface FortuneV2LuckTransition {
  year: number
  hasTransition: boolean
  verified: boolean
  segments: Array<{ from: string; to: string; luckCycle: string; label: string }>
  note: string
}

export interface FortuneV2Result {
  luckCycleImpact: FortuneV2LuckCycleImpact | null
  yearImpact: FortuneV2YearImpact
  monthImpacts: FortuneV2MonthImpact[]
  yearSummary: FortuneV2YearSummary
  luckTransition?: FortuneV2LuckTransition
  note: string
}

export interface AnalysisResult {
  chart: BaziChart
  elementStats: ElementStats
  strength: number
  strengthLabel: string
  strengthV2?: StrengthV2Result
  fortuneV2?: FortuneV2Result
  favorableElements: Element[]
  strongestElement: Element
  weakestElement: Element
  pattern: string
  patternNote?: string
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
  elementModelNote?: string
  elementReason?: string
  strengthScoreNote?: string
  strengthBasis?: string[]
  strengthConfidence?: string
  favorableNote?: string
  unfavorableElements?: Element[]
  dayunNote?: string
  luckStart?: LuckStartInfo
  solarTimeCorrection?: SolarTimeCorrection
  liunianNote?: string
  liuyueNote?: string
  nameValidationNote?: string
  nameSummary?: string
  shenshaNote?: string
  ruleVersions?: Record<string, string>
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
  birthCity?: string
  birthLongitude?: number | ''
  solarTimeMode?: SolarTimeMode
  timezone?: string
}

export interface SavedRecord {
  id: string
  name: string
  input: BirthInput
  result: AnalysisResult
  createdAt: number
  updatedAt: number
}
