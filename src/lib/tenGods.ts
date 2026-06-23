import type { Element } from '../types'

export type Polarity = '陽' | '陰'
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

export interface StemInfo {
  element: Element
  polarity: Polarity
}

export interface HiddenStem {
  stem: string
  qi: Qi
}

export interface HiddenStemTenGod extends HiddenStem {
  tenGod: TenGodName
}

export interface BranchTenGods {
  mainQi: HiddenStemTenGod
  hiddenStems: HiddenStemTenGod[]
}

export interface PillarInput {
  stem: string
  branch: string
}

export interface PillarTenGods extends PillarInput {
  stemTenGod: TenGodName
  branchMainQi: HiddenStemTenGod
  hiddenStems: HiddenStemTenGod[]
}

export type FourPillarsInput = Record<'year' | 'month' | 'day' | 'hour', PillarInput>
export type FourPillarsTenGods = Record<'year' | 'month' | 'day' | 'hour', PillarTenGods>

export const STEMS: Record<string, StemInfo> = {
  甲: { element: '木', polarity: '陽' },
  乙: { element: '木', polarity: '陰' },
  丙: { element: '火', polarity: '陽' },
  丁: { element: '火', polarity: '陰' },
  戊: { element: '土', polarity: '陽' },
  己: { element: '土', polarity: '陰' },
  庚: { element: '金', polarity: '陽' },
  辛: { element: '金', polarity: '陰' },
  壬: { element: '水', polarity: '陽' },
  癸: { element: '水', polarity: '陰' },
}

export const GENERATES: Record<Element, Element> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
}

export const CONTROLS: Record<Element, Element> = {
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木',
}

export const BRANCH_HIDDEN_STEMS: Record<string, HiddenStem[]> = {
  子: [{ stem: '癸', qi: '主氣' }],
  丑: [{ stem: '己', qi: '主氣' }, { stem: '癸', qi: '中氣' }, { stem: '辛', qi: '餘氣' }],
  寅: [{ stem: '甲', qi: '主氣' }, { stem: '丙', qi: '中氣' }, { stem: '戊', qi: '餘氣' }],
  卯: [{ stem: '乙', qi: '主氣' }],
  辰: [{ stem: '戊', qi: '主氣' }, { stem: '乙', qi: '中氣' }, { stem: '癸', qi: '餘氣' }],
  巳: [{ stem: '丙', qi: '主氣' }, { stem: '戊', qi: '中氣' }, { stem: '庚', qi: '餘氣' }],
  午: [{ stem: '丁', qi: '主氣' }, { stem: '己', qi: '中氣' }],
  未: [{ stem: '己', qi: '主氣' }, { stem: '丁', qi: '中氣' }, { stem: '乙', qi: '餘氣' }],
  申: [{ stem: '庚', qi: '主氣' }, { stem: '壬', qi: '中氣' }, { stem: '戊', qi: '餘氣' }],
  酉: [{ stem: '辛', qi: '主氣' }],
  戌: [{ stem: '戊', qi: '主氣' }, { stem: '辛', qi: '中氣' }, { stem: '丁', qi: '餘氣' }],
  亥: [{ stem: '壬', qi: '主氣' }, { stem: '甲', qi: '中氣' }],
}

function requireInput(value: string | undefined | null): string {
  if (!value) throw new Error('Missing required input')
  return value
}

export function getStemInfo(stem: string): StemInfo {
  const key = requireInput(stem)
  const info = STEMS[key]
  if (!info) throw new Error(`Invalid stem: ${key}`)
  return info
}

export function isGenerating(fromElement: Element, toElement: Element): boolean {
  requireInput(fromElement)
  requireInput(toElement)
  return GENERATES[fromElement] === toElement
}

export function isControlling(fromElement: Element, toElement: Element): boolean {
  requireInput(fromElement)
  requireInput(toElement)
  return CONTROLS[fromElement] === toElement
}

export function getTenGod(
  dayStem: string,
  targetStem: string,
  options: { isDayMaster?: boolean } = {},
): TenGodName {
  if (options.isDayMaster) return '日主'

  const day = getStemInfo(dayStem)
  const target = getStemInfo(targetStem)
  const samePolarity = day.polarity === target.polarity

  if (target.element === day.element) return samePolarity ? '比肩' : '劫財'
  if (isGenerating(day.element, target.element)) return samePolarity ? '食神' : '傷官'
  if (isControlling(day.element, target.element)) return samePolarity ? '偏財' : '正財'
  if (isControlling(target.element, day.element)) return samePolarity ? '七殺' : '正官'
  if (isGenerating(target.element, day.element)) return samePolarity ? '偏印' : '正印'

  throw new Error(`Unable to resolve ten god: ${dayStem} -> ${targetStem}`)
}

export function getBranchHiddenStems(branch: string): HiddenStem[] {
  const key = requireInput(branch)
  const stems = BRANCH_HIDDEN_STEMS[key]
  if (!stems) throw new Error(`Invalid branch: ${key}`)
  return stems.map((item) => ({ ...item }))
}

export function getBranchTenGods(dayStem: string, branch: string): BranchTenGods {
  getStemInfo(dayStem)
  const hiddenStems = getBranchHiddenStems(branch).map((item) => ({
    ...item,
    tenGod: getTenGod(dayStem, item.stem),
  }))
  const mainQi = hiddenStems[0]
  if (!mainQi) throw new Error(`Invalid branch: ${branch}`)
  return { mainQi, hiddenStems }
}

export function buildPillarTenGods(dayStem: string, pillars: FourPillarsInput): FourPillarsTenGods {
  getStemInfo(dayStem)
  if (!pillars?.year || !pillars.month || !pillars.day || !pillars.hour) {
    throw new Error('Missing required input')
  }

  const build = (key: keyof FourPillarsInput): PillarTenGods => {
    const pillar = pillars[key]
    const branchGods = getBranchTenGods(dayStem, pillar.branch)
    return {
      stem: pillar.stem,
      branch: pillar.branch,
      stemTenGod: getTenGod(dayStem, pillar.stem, { isDayMaster: key === 'day' }),
      branchMainQi: branchGods.mainQi,
      hiddenStems: branchGods.hiddenStems,
    }
  }

  return {
    year: build('year'),
    month: build('month'),
    day: build('day'),
    hour: build('hour'),
  }
}
