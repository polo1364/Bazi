import type { BaziChart, Element, Pillar } from '../types'
import {
  STEMS, BRANCHES, STEM_ELEMENTS, BRANCH_ELEMENTS, HIDDEN_STEMS,
  getMonthStemIndex, getHourStemIndex, getTenGod,
} from './constants'
import { getBaziYear, getBaziMonthBranch, getHourBranch } from './solarTerms'
import { computeNayin } from './builtinData'

function nayinText(gz: string): string {
  return computeNayin(gz)?.nayin ?? '大海水'
}

function getDayGanZhi(y: number, m: number, d: number): [number, number] {
  const base = Date.UTC(1900, 0, 31)
  const cur = Date.UTC(y, m - 1, d)
  const offset = Math.floor((cur - base) / 86400000)
  return [((offset % 10) + 10) % 10, ((offset + 4) % 12 + 12) % 12]
}

function parseGanZhi(gz: string): [number, number] | null {
  const s = gz.trim()
  if (s.length !== 2) return null
  const si = STEMS.indexOf(s[0] as typeof STEMS[number])
  const bi = BRANCHES.indexOf(s[1] as typeof BRANCHES[number])
  if (si < 0 || bi < 0) return null
  return [si, bi]
}

function buildPillar(label: string, stemIdx: number, branchIdx: number, dayMaster: string, dmElement: Element): Pillar {
  const stem = STEMS[stemIdx]
  const branch = BRANCHES[branchIdx]
  const gz = stem + branch
  const nayin = nayinText(gz)
  return {
    label,
    stem,
    branch,
    stemElement: STEM_ELEMENTS[stem],
    branchElement: BRANCH_ELEMENTS[branch],
    hiddenStems: HIDDEN_STEMS[branch] ?? [],
    tenGod: stem === dayMaster ? '日主' : getTenGod(dmElement, STEMS.indexOf(dayMaster as typeof STEMS[number]) % 2 === 1, stem),
    nayin,
  }
}

export function calculateBazi(year: number, month: number, day: number, hour: number): BaziChart {
  const date = new Date(year, month - 1, day, hour)
  const baziYear = getBaziYear(date)

  const yearStemIdx = ((baziYear - 4) % 10 + 10) % 10
  const yearBranchIdx = ((baziYear - 4) % 12 + 12) % 12
  const monthBranchIdx = getBaziMonthBranch(date)
  const monthStemIdx = getMonthStemIndex(yearStemIdx, monthBranchIdx)
  const [dayStemIdx, dayBranchIdx] = getDayGanZhi(year, month, day)
  const hourBranchIdx = getHourBranch(hour)
  const hourStemIdx = getHourStemIndex(dayStemIdx, hourBranchIdx)

  const dayMaster = STEMS[dayStemIdx]
  const dmElement = STEM_ELEMENTS[dayMaster]

  return {
    year: buildPillar('年柱', yearStemIdx, yearBranchIdx, dayMaster, dmElement),
    month: buildPillar('月柱', monthStemIdx, monthBranchIdx, dayMaster, dmElement),
    day: buildPillar('日柱', dayStemIdx, dayBranchIdx, dayMaster, dmElement),
    hour: buildPillar('時柱', hourStemIdx, hourBranchIdx, dayMaster, dmElement),
    dayMaster,
    dayMasterElement: dmElement,
  }
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
    year: buildPillar('年柱', y[0], y[1], dayMaster, dmElement),
    month: buildPillar('月柱', m[0], m[1], dayMaster, dmElement),
    day: buildPillar('日柱', d[0], d[1], dayMaster, dmElement),
    hour: buildPillar('時柱', h[0], h[1], dayMaster, dmElement),
    dayMaster,
    dayMasterElement: dmElement,
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
