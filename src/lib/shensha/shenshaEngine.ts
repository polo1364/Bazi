export type PillarKey = 'year' | 'month' | 'day' | 'hour'
export type ShenshaStatus = '成立' | '不成立' | '不適用' | '尚未驗證' | '別名'

export interface Branches {
  year: string
  month: string
  day: string
  hour: string
}

export interface Stems {
  year: string
  month: string
  day: string
  hour: string
}

export interface BranchMatch {
  pillar: PillarKey
  branch: string
  basis?: string
}

export interface StemMatch {
  pillar: PillarKey
  stem: string
  basis?: string
}

export type PillarMatch = BranchMatch | StemMatch

export interface ShenshaAnalysisItem {
  name: string
  status: ShenshaStatus
  basis: string
  lookupKey: string | Record<string, string>
  targetStems?: string[]
  targetBranches: string[] | Record<string, string[]>
  targetPillars?: string[]
  matchedBranches: BranchMatch[]
  matchedPillars?: PillarMatch[]
  xun?: string
  note?: string
  reason?: string
  description: string
  source: string
  verified: boolean
  trigger?: string[]
  type: '已公式化'
  found: boolean
  desc: string
}

export interface UnverifiedShenshaItem {
  name: string
  status: '尚未驗證'
  reason: string
  verified: false
}

export interface ShenshaAnalysisResult {
  verified: true
  items: ShenshaAnalysisItem[]
  unverified: UnverifiedShenshaItem[]
}

const SOURCE = '系統內建神煞查法表'
const PILLAR_LABEL: Record<PillarKey, string> = {
  year: '年支',
  month: '月支',
  day: '日支',
  hour: '時支',
}

export const TIAN_YI_GUI_REN: Record<string, string[]> = {
  甲: ['丑', '未'],
  戊: ['丑', '未'],
  庚: ['丑', '未'],
  乙: ['子', '申'],
  己: ['子', '申'],
  丙: ['亥', '酉'],
  丁: ['亥', '酉'],
  壬: ['卯', '巳'],
  癸: ['卯', '巳'],
  辛: ['寅', '午'],
}

export const WEN_CHANG: Record<string, string[]> = {
  甲: ['巳'],
  乙: ['午'],
  丙: ['申'],
  丁: ['酉'],
  戊: ['申'],
  己: ['酉'],
  庚: ['亥'],
  辛: ['子'],
  壬: ['寅'],
  癸: ['卯'],
}

export const TAO_HUA: Record<string, string> = {
  申子辰: '酉',
  寅午戌: '卯',
  亥卯未: '子',
  巳酉丑: '午',
}

export const HUA_GAI: Record<string, string> = {
  申子辰: '辰',
  寅午戌: '戌',
  亥卯未: '未',
  巳酉丑: '丑',
}

export const JIANG_XING: Record<string, string> = {
  申子辰: '子',
  寅午戌: '午',
  亥卯未: '卯',
  巳酉丑: '酉',
}

export const YI_MA: Record<string, string> = {
  申子辰: '寅',
  寅午戌: '申',
  亥卯未: '巳',
  巳酉丑: '亥',
}

export const HONG_LUAN: Record<string, string> = {
  子: '卯',
  丑: '寅',
  寅: '丑',
  卯: '子',
  辰: '亥',
  巳: '戌',
  午: '酉',
  未: '申',
  申: '未',
  酉: '午',
  戌: '巳',
  亥: '辰',
}

export const TIAN_XI: Record<string, string> = {
  子: '酉',
  丑: '申',
  寅: '未',
  卯: '午',
  辰: '巳',
  巳: '辰',
  午: '卯',
  未: '寅',
  申: '丑',
  酉: '子',
  戌: '亥',
  亥: '戌',
}

export const TIAN_DE: Record<string, { target: string; type: 'stem' | 'branch' }> = {
  寅: { target: '丁', type: 'stem' },
  卯: { target: '申', type: 'branch' },
  辰: { target: '壬', type: 'stem' },
  巳: { target: '辛', type: 'stem' },
  午: { target: '亥', type: 'branch' },
  未: { target: '甲', type: 'stem' },
  申: { target: '癸', type: 'stem' },
  酉: { target: '寅', type: 'branch' },
  戌: { target: '丙', type: 'stem' },
  亥: { target: '乙', type: 'stem' },
  子: { target: '巳', type: 'branch' },
  丑: { target: '庚', type: 'stem' },
}

export const YUE_DE: Record<string, string> = {
  寅: '丙',
  午: '丙',
  戌: '丙',
  申: '壬',
  子: '壬',
  辰: '壬',
  亥: '甲',
  卯: '甲',
  未: '甲',
  巳: '庚',
  酉: '庚',
  丑: '庚',
}

export const FU_XING_GUI_REN: Record<string, string[]> = {
  甲: ['寅', '子'],
  丙: ['寅', '子'],
  乙: ['卯', '丑'],
  癸: ['卯', '丑'],
  戊: ['申'],
  己: ['未'],
  丁: ['亥'],
  庚: ['午'],
  辛: ['巳'],
  壬: ['辰'],
}

export const LU_SHEN: Record<string, string[]> = {
  甲: ['寅'],
  乙: ['卯'],
  丙: ['巳'],
  丁: ['午'],
  戊: ['巳'],
  己: ['午'],
  庚: ['申'],
  辛: ['酉'],
  壬: ['亥'],
  癸: ['子'],
}

export const YANG_REN: Record<string, string[]> = {
  甲: ['卯'],
  丙: ['午'],
  戊: ['午'],
  庚: ['酉'],
  壬: ['子'],
}

export const XUE_TANG_ZIPING_CHANGSHENG: Record<string, string[]> = {
  甲: ['亥'],
  乙: ['午'],
  丙: ['寅'],
  丁: ['酉'],
  戊: ['寅'],
  己: ['酉'],
  庚: ['巳'],
  辛: ['子'],
  壬: ['申'],
  癸: ['卯'],
}

export const XUN_KONG: Record<string, string[]> = {
  甲子: ['戌', '亥'],
  甲戌: ['申', '酉'],
  甲申: ['午', '未'],
  甲午: ['辰', '巳'],
  甲辰: ['寅', '卯'],
  甲寅: ['子', '丑'],
}

export const GU_CHEN_GUA_SU: Record<string, { guChen: string; guaSu: string }> = {
  亥子丑: { guChen: '寅', guaSu: '戌' },
  寅卯辰: { guChen: '巳', guaSu: '丑' },
  巳午未: { guChen: '申', guaSu: '辰' },
  申酉戌: { guChen: '亥', guaSu: '未' },
}

export const WANG_SHEN: Record<string, string> = {
  寅午戌: '巳',
  巳酉丑: '申',
  申子辰: '亥',
  亥卯未: '寅',
}

export const JIE_SHA: Record<string, string> = {
  寅午戌: '亥',
  亥卯未: '申',
  申子辰: '巳',
  巳酉丑: '寅',
}

export const ZAI_SHA: Record<string, string> = {
  申子辰: '午',
  寅午戌: '子',
  巳酉丑: '卯',
  亥卯未: '酉',
}

export const TIAN_SHE: Record<string, string> = {
  春: '戊寅',
  夏: '甲午',
  秋: '戊申',
  冬: '甲子',
}

export const YUAN_CHEN_YANG_MALE_YIN_FEMALE: Record<string, string> = {
  子: '未',
  丑: '申',
  寅: '酉',
  卯: '戌',
  辰: '亥',
  巳: '子',
  午: '丑',
  未: '寅',
  申: '卯',
  酉: '辰',
  戌: '巳',
  亥: '午',
}

export const YUAN_CHEN_YIN_MALE_YANG_FEMALE: Record<string, string> = {
  子: '巳',
  丑: '午',
  寅: '未',
  卯: '申',
  辰: '酉',
  巳: '戌',
  午: '亥',
  未: '子',
  申: '丑',
  酉: '寅',
  戌: '卯',
  亥: '辰',
}

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const BRANCHES_12 = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const YANG_STEMS = ['甲', '丙', '戊', '庚', '壬']
const YIN_STEMS = ['乙', '丁', '己', '辛', '癸']

export const UNVERIFIED_SHENSHA_NAMES: string[] = []

export function getBranchGroup(branch: string): '申子辰' | '寅午戌' | '亥卯未' | '巳酉丑' | null {
  if (['申', '子', '辰'].includes(branch)) return '申子辰'
  if (['寅', '午', '戌'].includes(branch)) return '寅午戌'
  if (['亥', '卯', '未'].includes(branch)) return '亥卯未'
  if (['巳', '酉', '丑'].includes(branch)) return '巳酉丑'
  return null
}

export function getGuChenGuaSuGroup(branch: string): '亥子丑' | '寅卯辰' | '巳午未' | '申酉戌' | null {
  if (['亥', '子', '丑'].includes(branch)) return '亥子丑'
  if (['寅', '卯', '辰'].includes(branch)) return '寅卯辰'
  if (['巳', '午', '未'].includes(branch)) return '巳午未'
  if (['申', '酉', '戌'].includes(branch)) return '申酉戌'
  return null
}

export function getSeasonByMonthBranch(monthBranch: string): '春' | '夏' | '秋' | '冬' | null {
  if (['寅', '卯', '辰'].includes(monthBranch)) return '春'
  if (['巳', '午', '未'].includes(monthBranch)) return '夏'
  if (['申', '酉', '戌'].includes(monthBranch)) return '秋'
  if (['亥', '子', '丑'].includes(monthBranch)) return '冬'
  return null
}

export function getStemYinYang(stem: string): '陽' | '陰' | null {
  if (YANG_STEMS.includes(stem)) return '陽'
  if (YIN_STEMS.includes(stem)) return '陰'
  return null
}

function normalizeGender(gender?: string | null): 'male' | 'female' | null {
  if (gender === 'male' || gender === '男') return 'male'
  if (gender === 'female' || gender === '女') return 'female'
  return null
}

export function findBranchMatches(targetBranches: string[], branches: Branches): BranchMatch[] {
  return (Object.entries(branches) as [PillarKey, string][])
    .filter(([, branch]) => targetBranches.includes(branch))
    .map(([pillar, branch]) => ({ pillar, branch }))
}

export function findStemMatches(targetStems: string[], stems: Stems): StemMatch[] {
  return (Object.entries(stems) as [PillarKey, string][])
    .filter(([, stem]) => targetStems.includes(stem))
    .map(([pillar, stem]) => ({ pillar, stem }))
}

export function getJiaZiCycle(): string[] {
  return Array.from({ length: 60 }, (_, i) => `${STEMS[i % 10]}${BRANCHES_12[i % 12]}`)
}

export function getJiaXun(dayPillar: string): { xun: string; kongWang: string[] } | null {
  const cycle = getJiaZiCycle()
  const index = cycle.indexOf(dayPillar)
  if (index < 0) return null
  const xunIndex = Math.floor(index / 10) * 10
  const xun = cycle[xunIndex]
  return { xun, kongWang: XUN_KONG[xun] ?? [] }
}

function matchText(matches: BranchMatch[]): string {
  return matches.length
    ? matches.map((m) => `${PILLAR_LABEL[m.pillar]}${m.branch}`).join('、')
    : '四柱未見目標地支'
}

export function analyzeStemBasedShensha({
  name,
  basis,
  dayStem,
  table,
  branches,
}: {
  name: string
  basis: string
  dayStem: string
  table: Record<string, string[]>
  branches: Branches
}): ShenshaAnalysisItem {
  const targetBranches = table[dayStem] ?? []
  const matchedBranches = findBranchMatches(targetBranches, branches)
  const status: ShenshaStatus = matchedBranches.length ? '成立' : '不成立'
  const description = targetBranches.length
    ? `日干${dayStem}見${targetBranches.join('、')}為${name}；${matchText(matchedBranches)}${matchedBranches.length ? '觸發。' : '，故不成立。'}`
    : `日干${dayStem}尚無${name}查法資料。`

  return {
    name,
    status,
    basis,
    lookupKey: dayStem,
    targetBranches,
    matchedBranches,
    matchedPillars: matchedBranches,
    description,
    source: SOURCE,
    verified: true,
    trigger: matchedBranches.map((m) => `${PILLAR_LABEL[m.pillar]}${m.branch}`),
    type: '已公式化',
    found: status === '成立',
    desc: description,
  }
}

export function analyzeYearBranchShensha({
  name,
  basis,
  yearBranch,
  table,
  branches,
}: {
  name: string
  basis: string
  yearBranch: string
  table: Record<string, string>
  branches: Branches
}): ShenshaAnalysisItem {
  const target = table[yearBranch]
  const targetBranches = target ? [target] : []
  const matchedBranches = findBranchMatches(targetBranches, branches)
  const status: ShenshaStatus = matchedBranches.length ? '成立' : '不成立'
  const source = `系統內建${name}查法表`
  const description = target
    ? `年支${yearBranch}查${name}在${target}；${matchedBranches.length ? `${matchText(matchedBranches)}命中。` : `本命四支未見${target}，故不成立。`}`
    : `年支${yearBranch}尚無${name}查法資料。`

  return {
    name,
    status,
    basis,
    lookupKey: yearBranch,
    targetBranches,
    matchedBranches,
    matchedPillars: matchedBranches,
    description,
    source,
    verified: true,
    trigger: matchedBranches.map((m) => `${PILLAR_LABEL[m.pillar]}${m.branch}`),
    type: '已公式化',
    found: status === '成立',
    desc: description,
  }
}

export function analyzeMonthBranchStemOrBranchShensha({
  name,
  basis,
  monthBranch,
  table,
  stems,
  branches,
}: {
  name: string
  basis: string
  monthBranch: string
  table: Record<string, { target: string; type: 'stem' | 'branch' }>
  stems: Stems
  branches: Branches
}): ShenshaAnalysisItem {
  const rule = table[monthBranch]
  const targetStems = rule?.type === 'stem' ? [rule.target] : []
  const targetBranches = rule?.type === 'branch' ? [rule.target] : []
  const stemMatches = targetStems.length ? findStemMatches(targetStems, stems) : []
  const branchMatches = targetBranches.length ? findBranchMatches(targetBranches, branches) : []
  const matchedPillars = [...stemMatches, ...branchMatches]
  const status: ShenshaStatus = matchedPillars.length ? '成立' : '不成立'
  const source = `系統內建${name}查法表`
  const targetText = rule ? `${rule.type === 'stem' ? '天干' : '地支'}${rule.target}` : '無'
  const matchDesc = matchedPillars.length
    ? matchedPillars.map((m) => ('stem' in m ? `${PILLAR_LABEL[m.pillar].replace('支', '干')}${m.stem}` : `${PILLAR_LABEL[m.pillar]}${m.branch}`)).join('、')
    : `本命四柱未見${rule?.target ?? ''}`
  const description = rule
    ? `月支${monthBranch}查${name}在${rule.target}；${matchDesc}${matchedPillars.length ? '命中。' : '，故不成立。'}`
    : `月支${monthBranch}尚無${name}查法資料。`

  return {
    name,
    status,
    basis,
    lookupKey: monthBranch,
    targetStems,
    targetBranches,
    matchedBranches: branchMatches,
    matchedPillars,
    description,
    source,
    verified: true,
    trigger: matchedPillars.map((m) => ('stem' in m ? `${PILLAR_LABEL[m.pillar].replace('支', '干')}${m.stem}` : `${PILLAR_LABEL[m.pillar]}${m.branch}`)),
    type: '已公式化',
    found: status === '成立',
    desc: `${description} 目標：${targetText}。`,
  }
}

export function analyzeMonthBranchStemShensha({
  name,
  basis,
  monthBranch,
  table,
  stems,
}: {
  name: string
  basis: string
  monthBranch: string
  table: Record<string, string>
  stems: Stems
}): ShenshaAnalysisItem {
  const target = table[monthBranch]
  const targetStems = target ? [target] : []
  const matchedPillars = findStemMatches(targetStems, stems)
  const status: ShenshaStatus = matchedPillars.length ? '成立' : '不成立'
  const source = `系統內建${name}查法表`
  const matchDesc = matchedPillars.length
    ? matchedPillars.map((m) => `${PILLAR_LABEL[m.pillar].replace('支', '干')}${m.stem}`).join('、')
    : `本命四干未見${target ?? ''}`
  const description = target
    ? `月支${monthBranch}查${name.replace('貴人', '')}在${target}；${matchDesc}${matchedPillars.length ? '命中。' : '，故不成立。'}`
    : `月支${monthBranch}尚無${name}查法資料。`

  return {
    name,
    status,
    basis,
    lookupKey: monthBranch,
    targetStems,
    targetBranches: [],
    matchedBranches: [],
    matchedPillars,
    description,
    source,
    verified: true,
    trigger: matchedPillars.map((m) => `${PILLAR_LABEL[m.pillar].replace('支', '干')}${m.stem}`),
    type: '已公式化',
    found: status === '成立',
    desc: description,
  }
}

export function analyzeStemOrDayStemBranchShensha({
  name,
  basis,
  lookupStem,
  targetBranches,
  branches,
  source,
  note,
}: {
  name: string
  basis: string
  lookupStem: string
  targetBranches: string[]
  branches: Branches
  source: string
  note?: string
}): ShenshaAnalysisItem {
  const matchedBranches = findBranchMatches(targetBranches, branches)
  const status: ShenshaStatus = matchedBranches.length ? '成立' : '不成立'
  const description = `日干${lookupStem}查${name.replace('貴人', '')}在${targetBranches.join('、')}；${matchedBranches.length ? `${matchText(matchedBranches)}命中。` : `本命四支未見${targetBranches.join('、')}，故不成立。`}`
  return {
    name,
    status,
    basis,
    lookupKey: lookupStem,
    targetBranches,
    matchedBranches,
    matchedPillars: matchedBranches,
    description,
    source,
    verified: true,
    note,
    trigger: matchedBranches.map((m) => `${PILLAR_LABEL[m.pillar]}${m.branch}`),
    type: '已公式化',
    found: status === '成立',
    desc: description,
  }
}

export function analyzeYearOrDayStemBranchShensha({
  name,
  basis,
  yearStem,
  dayStem,
  table,
  branches,
}: {
  name: string
  basis: string
  yearStem: string
  dayStem: string
  table: Record<string, string[]>
  branches: Branches
}): ShenshaAnalysisItem {
  const yearTargets = table[yearStem] ?? []
  const dayTargets = table[dayStem] ?? []
  const yearMatches = findBranchMatches(yearTargets, branches).map((m) => ({ ...m, basis: 'yearStem' }))
  const dayMatches = findBranchMatches(dayTargets, branches).map((m) => ({ ...m, basis: 'dayStem' }))
  const matchedPillars = [...yearMatches, ...dayMatches]
  const status: ShenshaStatus = matchedPillars.length ? '成立' : '不成立'
  const dayText = dayTargets.length
    ? `日干${dayStem}查${name.replace('貴人', '')}在${dayTargets.join('、')}${dayMatches.length ? `；${matchText(dayMatches)}命中` : '；未命中'}`
    : `日干${dayStem}無查法資料`
  const yearText = yearTargets.length
    ? `年干${yearStem}查${name.replace('貴人', '')}在${yearTargets.join('、')}${yearMatches.length ? `；${matchText(yearMatches)}命中` : '；未命中'}`
    : `年干${yearStem}無查法資料`
  const description = `${yearText}。${dayText}。${status === '成立' ? `${name}成立。` : `${name}不成立。`}`

  return {
    name,
    status,
    basis,
    lookupKey: { yearStem, dayStem },
    targetBranches: { yearStem: yearTargets, dayStem: dayTargets },
    matchedBranches: matchedPillars,
    matchedPillars,
    description,
    source: '系統內建福星貴人查法表',
    verified: true,
    trigger: matchedPillars.map((m) => `${m.basis === 'dayStem' ? '日干' : '年干'}查得${PILLAR_LABEL[m.pillar]}${m.branch}`),
    type: '已公式化',
    found: status === '成立',
    desc: description,
  }
}

export function analyzeYangRen({
  dayStem,
  branches,
}: {
  dayStem: string
  branches: Branches
}): ShenshaAnalysisItem {
  const targetBranches = YANG_REN[dayStem] ?? []
  if (!targetBranches.length) {
    const description = `日干${dayStem}為陰干；本系統第三批採陽干羊刃版，陰干刃另列待校驗。`
    return {
      name: '羊刃',
      status: '不適用',
      basis: '以日干查羊刃，本系統採陽干羊刃版',
      lookupKey: dayStem,
      targetBranches: [],
      matchedBranches: [],
      matchedPillars: [],
      description,
      source: '系統內建陽干羊刃查法表',
      verified: true,
      note: '陰干羊刃版本差異較多，未納入本階段正式結論',
      trigger: [],
      type: '已公式化',
      found: false,
      desc: description,
    }
  }
  return analyzeStemOrDayStemBranchShensha({
    name: '羊刃',
    basis: '以日干查羊刃，本系統採陽干羊刃版',
    lookupStem: dayStem,
    targetBranches,
    branches,
    source: '系統內建陽干羊刃查法表',
    note: '陰干羊刃版本差異較多，未納入本階段正式結論',
  })
}

export function analyzeKongWang({
  dayPillar,
  branches,
}: {
  dayPillar: string
  branches: Branches
}): ShenshaAnalysisItem {
  const xunInfo = getJiaXun(dayPillar)
  const targetBranches = xunInfo?.kongWang ?? []
  const matchedBranches = findBranchMatches(targetBranches, branches)
  const status: ShenshaStatus = matchedBranches.length ? '成立' : '不成立'
  const description = xunInfo
    ? `日柱${dayPillar}屬${xunInfo.xun}旬，旬空${targetBranches.join('、')}；${matchedBranches.length ? `${matchText(matchedBranches)}命中。` : `本命四支未見${targetBranches.join('、')}，故不成立。`}`
    : `日柱${dayPillar}未能對應六十甲子，空亡待校驗。`

  return {
    name: '空亡',
    status,
    basis: '以日柱查旬空',
    lookupKey: dayPillar,
    xun: xunInfo?.xun,
    targetBranches,
    matchedBranches,
    matchedPillars: matchedBranches,
    description,
    source: '系統內建六甲旬空表',
    verified: true,
    note: '本系統採日柱旬空版',
    trigger: matchedBranches.map((m) => `${PILLAR_LABEL[m.pillar]}${m.branch}`),
    type: '已公式化',
    found: status === '成立',
    desc: description,
  }
}

export function analyzeYearOrDayBranchShensha({
  name,
  basis,
  yearBranch,
  dayBranch,
  table,
  branches,
  source,
  note,
}: {
  name: string
  basis: string
  yearBranch: string
  dayBranch: string
  table: Record<string, string>
  branches: Branches
  source: string
  note: string
}): ShenshaAnalysisItem {
  const yearGroup = getBranchGroup(yearBranch)
  const dayGroup = getBranchGroup(dayBranch)
  const yearTargets = yearGroup ? [table[yearGroup]].filter(Boolean) : []
  const dayTargets = dayGroup ? [table[dayGroup]].filter(Boolean) : []
  const yearMatches = findBranchMatches(yearTargets, branches).map((m) => ({ ...m, basis: 'yearBranch' }))
  const dayMatches = findBranchMatches(dayTargets, branches).map((m) => ({ ...m, basis: 'dayBranch' }))
  const matchedPillars = [...yearMatches, ...dayMatches]
  const status: ShenshaStatus = matchedPillars.length ? '成立' : '不成立'
  const allTargets = [...new Set([...yearTargets, ...dayTargets])]
  const yearText = yearGroup ? `年支${yearBranch}查${name}在${yearTargets.join('、')}` : `年支${yearBranch}無對應組`
  const dayText = dayGroup ? `日支${dayBranch}查${name}在${dayTargets.join('、')}` : `日支${dayBranch}無對應組`
  const description = matchedPillars.length
    ? `${yearText}，${dayText}；${matchText(matchedPillars)}命中。`
    : `${yearText}，${dayText}；本命四支未見${allTargets.join('、')}，故不成立。`

  return {
    name,
    status,
    basis,
    lookupKey: { yearBranch, dayBranch },
    targetBranches: { yearBranch: yearTargets, dayBranch: dayTargets },
    matchedBranches: matchedPillars,
    matchedPillars,
    description,
    source,
    verified: true,
    note,
    trigger: matchedPillars.map((m) => `${m.basis === 'dayBranch' ? '日支' : '年支'}查得${PILLAR_LABEL[m.pillar]}${m.branch}`),
    type: '已公式化',
    found: status === '成立',
    desc: description,
  }
}

export function analyzeGuChenGuaSu({
  name,
  yearBranch,
  dayBranch,
  branches,
}: {
  name: '孤辰' | '寡宿'
  yearBranch: string
  dayBranch: string
  branches: Branches
}): ShenshaAnalysisItem {
  const key = name === '孤辰' ? 'guChen' : 'guaSu'
  const yearGroup = getGuChenGuaSuGroup(yearBranch)
  const dayGroup = getGuChenGuaSuGroup(dayBranch)
  const yearTargets = yearGroup ? [GU_CHEN_GUA_SU[yearGroup][key]] : []
  const dayTargets = dayGroup ? [GU_CHEN_GUA_SU[dayGroup][key]] : []
  const yearMatches = findBranchMatches(yearTargets, branches).map((m) => ({ ...m, basis: 'yearBranch' }))
  const dayMatches = findBranchMatches(dayTargets, branches).map((m) => ({ ...m, basis: 'dayBranch' }))
  const matchedPillars = [...yearMatches, ...dayMatches]
  const status: ShenshaStatus = matchedPillars.length ? '成立' : '不成立'
  const allTargets = [...new Set([...yearTargets, ...dayTargets])]
  const yearText = yearGroup ? `年支${yearBranch}屬${yearGroup}組，${name}在${yearTargets.join('、')}` : `年支${yearBranch}無對應組`
  const dayText = dayGroup ? `日支${dayBranch}屬${dayGroup}組，${name}在${dayTargets.join('、')}` : `日支${dayBranch}無對應組`
  const description = matchedPillars.length
    ? `${yearText}；${dayText}；${matchText(matchedPillars)}命中。`
    : `${yearText}；${dayText}；本命四支未見${allTargets.join('、')}，故不成立。`

  return {
    name,
    status,
    basis: `以年支或日支查${name}`,
    lookupKey: { yearBranch, dayBranch },
    targetBranches: { yearBranch: yearTargets, dayBranch: dayTargets },
    matchedBranches: matchedPillars,
    matchedPillars,
    description,
    source: '系統內建孤辰寡宿查法表',
    verified: true,
    note: '本系統採年支或日支查四柱地支版本；只作命中提示，不作婚姻絕對定論。',
    trigger: matchedPillars.map((m) => `${m.basis === 'dayBranch' ? '日支' : '年支'}查得${PILLAR_LABEL[m.pillar]}${m.branch}`),
    type: '已公式化',
    found: status === '成立',
    desc: description,
  }
}

export function analyzeTianShe({
  monthBranch,
  dayPillar,
}: {
  monthBranch: string
  dayPillar: string
}): ShenshaAnalysisItem {
  const season = getSeasonByMonthBranch(monthBranch)
  const targetPillar = season ? TIAN_SHE[season] : ''
  const matchedPillars = targetPillar && dayPillar === targetPillar ? [{ pillar: 'day' as PillarKey, branch: dayPillar[1] }] : []
  const status: ShenshaStatus = matchedPillars.length ? '成立' : '不成立'
  const description = season
    ? `月支${monthBranch}屬${season}，${season}季天赦為${targetPillar}；本命日柱${dayPillar}${matchedPillars.length ? '命中。' : '未命中，故不成立。'}`
    : `月支${monthBranch}無法判定季節，天赦待校驗。`

  return {
    name: '天赦',
    status,
    basis: '以節氣季節與日柱查天赦',
    lookupKey: { monthBranch, season: season ?? '', dayPillar },
    targetBranches: [],
    targetPillars: targetPillar ? [targetPillar] : [],
    matchedBranches: [],
    matchedPillars,
    description,
    source: '系統內建天赦查法表',
    verified: true,
    note: '本系統以八字月支判節氣季節；只作天赦日柱命中提示。',
    trigger: matchedPillars.length ? [`日柱${dayPillar}`] : [],
    type: '已公式化',
    found: status === '成立',
    desc: description,
  }
}

export function analyzeYuanChen({
  yearStem,
  yearBranch,
  gender,
  branches,
}: {
  yearStem: string
  yearBranch: string
  gender?: string | null
  branches: Branches
}): ShenshaAnalysisItem {
  const normalizedGender = normalizeGender(gender)
  const stemYinYang = getStemYinYang(yearStem)
  if (!normalizedGender) {
    const description = '缺少性別，無法判斷元辰所屬規則組，故不輸出成立或不成立結論。'
    return {
      name: '元辰',
      status: '尚未驗證',
      basis: '以年支、性別、年干陰陽查元辰',
      lookupKey: { yearStem, yearBranch, gender: '' },
      targetBranches: [],
      matchedBranches: [],
      matchedPillars: [],
      description,
      source: '系統內建元辰查法表',
      verified: false,
      reason: '缺少 gender',
      note: '大耗於本系統視為元辰別名，不另立獨立判斷。',
      trigger: [],
      type: '已公式化',
      found: false,
      desc: description,
    }
  }

  const useYangMaleYinFemale = (stemYinYang === '陽' && normalizedGender === 'male') || (stemYinYang === '陰' && normalizedGender === 'female')
  const ruleGroup = useYangMaleYinFemale ? '陽男陰女' : '陰男陽女'
  const table = useYangMaleYinFemale ? YUAN_CHEN_YANG_MALE_YIN_FEMALE : YUAN_CHEN_YIN_MALE_YANG_FEMALE
  const target = table[yearBranch]
  const targetBranches = target ? [target] : []
  const matchedBranches = findBranchMatches(targetBranches, branches)
  const status: ShenshaStatus = matchedBranches.length ? '成立' : '不成立'
  const genderText = normalizedGender === 'male' ? '男命' : '女命'
  const stemText = stemYinYang ? `${yearStem}為${stemYinYang}干` : `${yearStem}未能判定陰陽`
  const description = target
    ? `${stemText}，${genderText}屬${ruleGroup}；年支${yearBranch}依${ruleGroup}表查元辰在${target}，${matchedBranches.length ? `${matchText(matchedBranches)}命中。` : `本命四支未見${target}，故不成立。`}`
    : `${stemText}，${genderText}屬${ruleGroup}；年支${yearBranch}尚無元辰查法資料。`

  return {
    name: '元辰',
    status,
    basis: '以年支、性別、年干陰陽查元辰',
    lookupKey: { yearStem, yearBranch, gender: normalizedGender, ruleGroup },
    targetBranches,
    matchedBranches,
    matchedPillars: matchedBranches,
    description,
    source: '系統內建元辰查法表',
    verified: true,
    note: '大耗於本系統視為元辰別名，不另立獨立判斷。',
    trigger: matchedBranches.map((m) => `${PILLAR_LABEL[m.pillar]}${m.branch}`),
    type: '已公式化',
    found: status === '成立',
    desc: description,
  }
}

export function analyzeDaHaoAlias(): ShenshaAnalysisItem {
  const description = '大耗於本系統採元辰別名處理，請參考元辰結果，不重複列為獨立神煞。'
  return {
    name: '大耗',
    status: '別名',
    basis: '本系統將大耗視為元辰別名',
    lookupKey: '元辰',
    targetBranches: [],
    matchedBranches: [],
    matchedPillars: [],
    description,
    source: '系統內建元辰／大耗別名規則',
    verified: true,
    note: '不同流派可能將大耗另列，本系統本階段不另算。',
    trigger: [],
    type: '已公式化',
    found: false,
    desc: description,
  }
}

export function analyzeBranchBasedShensha({
  name,
  basis,
  yearBranch,
  dayBranch,
  table,
  branches,
}: {
  name: string
  basis: string
  yearBranch: string
  dayBranch: string
  table: Record<string, string>
  branches: Branches
}): ShenshaAnalysisItem {
  const lookups = [
    { source: '年支', branch: yearBranch, group: getBranchGroup(yearBranch) },
    { source: '日支', branch: dayBranch, group: getBranchGroup(dayBranch) },
  ]
  const targetBranches = [...new Set(lookups.map((l) => (l.group ? table[l.group] : '')).filter(Boolean))]
  const matchedBranches = findBranchMatches(targetBranches, branches)
  const status: ShenshaStatus = matchedBranches.length ? '成立' : '不成立'
  const lookupKey = lookups
    .map((l) => `${l.source}${l.branch}${l.group ? `(${l.group})` : ''}`)
    .join('、')
  const lookupTexts = lookups.map((l) => {
    const target = l.group ? table[l.group] : ''
    const matches = target ? findBranchMatches([target], branches) : []
    return `${l.source}${l.branch}${l.group ? `屬${l.group}組，${name}在${target}` : '無對應組'}${matches.length ? `，命中${matchText(matches)}` : '，未命中'}`
  })
  const description = `${lookupTexts.join('；')}。${status === '成立' ? `${name}成立。` : `${name}不成立。`}`

  return {
    name,
    status,
    basis,
    lookupKey,
    targetBranches,
    matchedBranches,
    description,
    source: SOURCE,
    verified: true,
    trigger: lookupTexts,
    type: '已公式化',
    found: status === '成立',
    desc: description,
  }
}

export function analyzeShensha(input: {
  dayStem: string
  dayPillar?: string
  yearStem: string
  monthBranch?: string
  gender?: string | null
  branches: Branches
  stems?: Stems
  pillars?: Record<PillarKey, string>
}): ShenshaAnalysisResult {
  const { dayStem, branches } = input
  const yearBranch = branches.year
  const monthBranch = input.monthBranch ?? branches.month
  const dayBranch = branches.day
  const stems = input.stems ?? { year: input.yearStem, month: '', day: dayStem, hour: '' }
  const dayPillar = input.dayPillar ?? input.pillars?.day ?? `${dayStem}${dayBranch}`

  return {
    verified: true,
    items: [
      analyzeStemBasedShensha({
        name: '天乙貴人',
        basis: '以日干查貴人',
        dayStem,
        table: TIAN_YI_GUI_REN,
        branches,
      }),
      analyzeStemBasedShensha({
        name: '文昌貴人',
        basis: '以日干查文昌',
        dayStem,
        table: WEN_CHANG,
        branches,
      }),
      analyzeBranchBasedShensha({
        name: '桃花',
        basis: '以年支或日支查桃花',
        yearBranch,
        dayBranch,
        table: TAO_HUA,
        branches,
      }),
      analyzeBranchBasedShensha({
        name: '華蓋',
        basis: '以年支或日支查華蓋',
        yearBranch,
        dayBranch,
        table: HUA_GAI,
        branches,
      }),
      analyzeBranchBasedShensha({
        name: '將星',
        basis: '以年支或日支查將星',
        yearBranch,
        dayBranch,
        table: JIANG_XING,
        branches,
      }),
      analyzeBranchBasedShensha({
        name: '驛馬',
        basis: '以年支或日支查驛馬',
        yearBranch,
        dayBranch,
        table: YI_MA,
        branches,
      }),
      analyzeYearBranchShensha({
        name: '紅鸞',
        basis: '以年支查紅鸞',
        yearBranch,
        table: HONG_LUAN,
        branches,
      }),
      analyzeYearBranchShensha({
        name: '天喜',
        basis: '以年支查天喜',
        yearBranch,
        table: TIAN_XI,
        branches,
      }),
      analyzeMonthBranchStemOrBranchShensha({
        name: '天德貴人',
        basis: '以月支查天德貴人',
        monthBranch,
        table: TIAN_DE,
        stems,
        branches,
      }),
      analyzeMonthBranchStemShensha({
        name: '月德貴人',
        basis: '以月支查月德貴人',
        monthBranch,
        table: YUE_DE,
        stems,
      }),
      analyzeYearOrDayStemBranchShensha({
        name: '福星貴人',
        basis: '以年干或日干查福星貴人',
        yearStem: input.yearStem,
        dayStem,
        table: FU_XING_GUI_REN,
        branches,
      }),
      analyzeStemOrDayStemBranchShensha({
        name: '祿神',
        basis: '以日干查祿神',
        lookupStem: dayStem,
        targetBranches: LU_SHEN[dayStem] ?? [],
        branches,
        source: '系統內建祿神查法表',
      }),
      analyzeYangRen({
        dayStem,
        branches,
      }),
      analyzeStemOrDayStemBranchShensha({
        name: '學堂',
        basis: '以日干查學堂，本系統採子平日干長生版',
        lookupStem: dayStem,
        targetBranches: XUE_TANG_ZIPING_CHANGSHENG[dayStem] ?? [],
        branches,
        source: '系統內建學堂查法表：子平日干長生版',
        note: '學堂另有納音等查法版本，本系統本階段固定採子平日干長生版',
      }),
      analyzeKongWang({
        dayPillar,
        branches,
      }),
      analyzeGuChenGuaSu({
        name: '孤辰',
        yearBranch,
        dayBranch,
        branches,
      }),
      analyzeGuChenGuaSu({
        name: '寡宿',
        yearBranch,
        dayBranch,
        branches,
      }),
      analyzeYearOrDayBranchShensha({
        name: '亡神',
        basis: '以年支或日支查亡神',
        yearBranch,
        dayBranch,
        table: WANG_SHEN,
        branches,
        source: '系統內建亡神查法表',
        note: '只作神煞命中提示，不作凶事定論。',
      }),
      analyzeYearOrDayBranchShensha({
        name: '劫煞',
        basis: '以年支或日支查劫煞',
        yearBranch,
        dayBranch,
        table: JIE_SHA,
        branches,
        source: '系統內建劫煞查法表',
        note: '只作神煞命中提示，不作損失或災禍絕對定論。',
      }),
      analyzeYearOrDayBranchShensha({
        name: '災煞',
        basis: '以年支或日支查災煞',
        yearBranch,
        dayBranch,
        table: ZAI_SHA,
        branches,
        source: '系統內建災煞查法表',
        note: '災煞只作風險提示，不得輸出血光、災禍等絕對斷語。',
      }),
      analyzeTianShe({
        monthBranch,
        dayPillar,
      }),
      analyzeYuanChen({
        yearStem: input.yearStem,
        yearBranch,
        gender: input.gender,
        branches,
      }),
      analyzeDaHaoAlias(),
    ],
    unverified: UNVERIFIED_SHENSHA_NAMES.map((name) => ({
      name,
      status: '尚未驗證',
      reason: '尚未建立查法表與測試',
      verified: false,
    })),
  }
}
