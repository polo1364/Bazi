// 節氣計算（定氣法近似）— 用於月柱與年柱立春判定

const TERM_INFO = [
  '小寒', '大寒', '立春', '雨水', '驚蟄', '春分',
  '清明', '穀雨', '立夏', '小滿', '芒種', '夏至',
  '小暑', '大暑', '立秋', '處暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
]

import { getSolarTermEntry } from './dataStore'

function termDays(y: number, n: number): number {
  const c = 0.2422
  const offsets = [6.11, 20.84, 4.15, 18.73, 5.63, 20.646, 4.81, 20.1, 5.52, 21.04, 5.678, 21.37,
    7.108, 22.83, 7.5, 23.13, 7.646, 23.042, 8.318, 23.438, 7.438, 22.36, 7.18, 21.94]
  const yd = y - 1900
  const leap = Math.floor(yd / 4) - Math.floor(yd / 100) + Math.floor(yd / 400)
  let d = Math.floor(yd * c + offsets[n]) - leap
  if (n === 2 && y % 4 === 0 && y % 100 !== 0) d += 1
  return d
}

export function getSolarTermDate(year: number, termIndex: number): Date {
  const entry = getSolarTermEntry(year, termIndex)
  if (entry) return new Date(year, entry.month - 1, entry.day, 12, 0, 0)
  const month = Math.floor(termIndex / 2) + 1
  const day = termDays(year, termIndex)
  return new Date(year, month - 1, day, 12, 0, 0)
}

export function getLiChun(year: number): Date {
  return getSolarTermDate(year, 2)
}

export function getBaziYear(date: Date): number {
  const y = date.getFullYear()
  const liChun = getLiChun(y)
  if (date < liChun) return y - 1
  return y
}

export function getBaziMonthBranch(date: Date): number {
  const y = date.getFullYear()
  const termList: { date: Date; branch: number }[] = []

  const add = (termYear: number, term: number, branch: number) => {
    termList.push({ date: getSolarTermDate(termYear, term), branch })
  }

  add(y - 1, 22, 0) // 前年大雪 → 子月
  add(y, 0, 1)      // 小寒 → 丑月
  add(y, 2, 2)      // 立春 → 寅月
  add(y, 4, 3)
  add(y, 6, 4)
  add(y, 8, 5)
  add(y, 10, 6)
  add(y, 12, 7)
  add(y, 14, 8)     // 立秋 → 申月
  add(y, 16, 9)
  add(y, 18, 10)
  add(y, 20, 11)
  add(y, 22, 0)

  termList.sort((a, b) => a.date.getTime() - b.date.getTime())

  let branch = 1
  for (const t of termList) {
    if (date >= t.date) branch = t.branch
  }
  return branch
}

export function getHourBranch(hour: number): number {
  if (hour === 23 || hour === 0) return 0
  return Math.floor((hour + 1) / 2)
}

export { TERM_INFO }
