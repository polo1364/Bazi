import type { BaziChart, Pillar } from '../types'
import {
  STEMS, BRANCHES, STEM_ELEMENTS, BRANCH_ELEMENTS,
  getMonthStemIndex,
} from './constants'
import { getBaziYear, getBaziMonthBranch } from './solarTerms'
import { computeNayin } from './builtinData'
import { getBranchTenGods, getTenGod } from './tenGods'
import { getBaziFromSolarDate } from './lunarAdapter.js'

function nayinText(gz: string): string {
  return computeNayin(gz)?.nayin ?? '大海水'
}

function parseGanZhi(gz: string): [number, number] | null {
  const s = gz.trim()
  if (s.length !== 2) return null
  const si = STEMS.indexOf(s[0] as typeof STEMS[number])
  const bi = BRANCHES.indexOf(s[1] as typeof BRANCHES[number])
  if (si < 0 || bi < 0) return null
  return [si, bi]
}

function buildChartFromParts(
  pillars: { year: { stem: string; branch: string }; month: { stem: string; branch: string }; day: { stem: string; branch: string }; hour: { stem: string; branch: string } },
  extra?: Pick<BaziChart, 'source' | 'sourceNotes' | 'solarText' | 'lunarText'>,
): BaziChart | null {
  const y = parseGanZhi(pillars.year.stem + pillars.year.branch)
  const m = parseGanZhi(pillars.month.stem + pillars.month.branch)
  const d = parseGanZhi(pillars.day.stem + pillars.day.branch)
  const h = parseGanZhi(pillars.hour.stem + pillars.hour.branch)
  if (!y || !m || !d || !h) return null

  const dayMaster = STEMS[d[0]]
  const dmElement = STEM_ELEMENTS[dayMaster]
  return {
    year: buildPillar('年柱', y[0], y[1], dayMaster),
    month: buildPillar('月柱', m[0], m[1], dayMaster),
    day: buildPillar('日柱', d[0], d[1], dayMaster),
    hour: buildPillar('時柱', h[0], h[1], dayMaster),
    dayMaster,
    dayMasterElement: dmElement,
    ...extra,
  }
}

function buildPillar(label: string, stemIdx: number, branchIdx: number, dayMaster: string): Pillar {
  const stem = STEMS[stemIdx]
  const branch = BRANCHES[branchIdx]
  const gz = stem + branch
  const nayin = nayinText(gz)
  const stemTenGod = getTenGod(dayMaster, stem, { isDayMaster: label === '日柱' })
  const branchTenGods = getBranchTenGods(dayMaster, branch)
  return {
    label,
    stem,
    branch,
    stemElement: STEM_ELEMENTS[stem],
    branchElement: BRANCH_ELEMENTS[branch],
    hiddenStems: branchTenGods.hiddenStems.map((item) => item.stem),
    hiddenStemTenGods: branchTenGods.hiddenStems,
    branchMainQi: branchTenGods.mainQi,
    stemTenGod,
    tenGod: stemTenGod,
    nayin,
  }
}

export interface SolarTimeOptions {
  minute?: number
  second?: number
  timezone?: string
  useTrueSolarTime?: boolean
  useMeanSolarTime?: boolean
  birthLongitude?: number
}

export function calculateBazi(
  year: number,
  month: number,
  day: number,
  hour: number,
  options?: SolarTimeOptions,
): BaziChart {
  const lunarResult = getBaziFromSolarDate({ year, month, day, hour, ...(options ?? {}) })
  const chart = buildChartFromParts(lunarResult.pillars, {
    source: 'lunar-javascript',
    sourceNotes: lunarResult.notes,
    solarText: lunarResult.solarText,
    lunarText: lunarResult.lunarText,
  })
  if (!chart) throw new Error('Invalid pillar format')
  chart.solarTimeCorrection = lunarResult.solarTimeCorrection
  return chart
}

export function buildChartFromManual(pillars: { year: string; month: string; day: string; hour: string }): BaziChart | null {
  const y = parseGanZhi(pillars.year)
  const m = parseGanZhi(pillars.month)
  const d = parseGanZhi(pillars.day)
  const h = parseGanZhi(pillars.hour)
  if (!y || !m || !d || !h) return null

  const dayMaster = STEMS[d[0]]
  const dmElement = STEM_ELEMENTS[dayMaster]

  return {
    year: buildPillar('年柱', y[0], y[1], dayMaster),
    month: buildPillar('月柱', m[0], m[1], dayMaster),
    day: buildPillar('日柱', d[0], d[1], dayMaster),
    hour: buildPillar('時柱', h[0], h[1], dayMaster),
    dayMaster,
    dayMasterElement: dmElement,
    source: 'manual',
    sourceNotes: ['四柱由使用者輸入', '十神、藏干、刑沖合害、強弱與文案由本系統規則引擎計算'],
  }
}

export function pillarsToArray(chart: BaziChart): Pillar[] {
  return [chart.year, chart.month, chart.day, chart.hour]
}

export function ganZhiFromYear(year: number): string {
  const si = ((year - 4) % 10 + 10) % 10
  const bi = ((year - 4) % 12 + 12) % 12
  return STEMS[si] + BRANCHES[bi]
}

export function ganZhiFromMonth(year: number, month: number): string {
  const date = new Date(year, month - 1, 15, 12)
  const baziYear = getBaziYear(date)
  const yearStemIdx = ((baziYear - 4) % 10 + 10) % 10
  const monthBranchIdx = getBaziMonthBranch(date)
  const monthStemIdx = getMonthStemIndex(yearStemIdx, monthBranchIdx)
  return STEMS[monthStemIdx] + BRANCHES[monthBranchIdx]
}

export { parseGanZhi }
