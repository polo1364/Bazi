import { Solar } from 'lunar-javascript'
import {
  calculateMeanSolarTime,
  calculateTrueSolarTime,
  comparePillarsBeforeAfterCorrection,
  formatSolarDateTime,
  SOLAR_TIME_APPROX_NOTE,
} from './solarTimeEngine.js'
import { getTimezoneOffsetHours, DEFAULT_BIRTH_LONGITUDE, DEFAULT_TIMEZONE } from './locationLongitude.ts'

export function parsePillar(pillarText) {
  if (!pillarText || typeof pillarText !== 'string' || pillarText.length < 2) {
    throw new Error('Invalid pillar format')
  }

  return {
    stem: pillarText[0],
    branch: pillarText[1],
  }
}

function getEightCharPillar(eightChar, methodName) {
  const value = eightChar?.[methodName]?.()
  if (!value) {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(eightChar ?? {}))
    console.error('[lunarAdapter] EightChar available methods:', methods)
    throw new Error(`Missing lunar-javascript EightChar method: ${methodName}`)
  }
  return value
}

function buildPillarsFromSolar(year, month, day, hour, minute, second) {
  const solar = Solar.fromYmdHms
    ? Solar.fromYmdHms(year, month, day, hour, minute, second)
    : Solar.fromYmd(year, month, day)
  const lunar = solar.getLunar()
  const eightChar = lunar.getEightChar()

  const yearPillar = getEightCharPillar(eightChar, 'getYear')
  const monthPillar = getEightCharPillar(eightChar, 'getMonth')
  const dayPillar = getEightCharPillar(eightChar, 'getDay')
  const hourPillar = getEightCharPillar(eightChar, 'getTime')

  return {
    solar,
    lunar,
    pillars: {
      year: parsePillar(yearPillar),
      month: parsePillar(monthPillar),
      day: parsePillar(dayPillar),
      hour: parsePillar(hourPillar),
    },
    raw: { yearPillar, monthPillar, dayPillar, hourPillar },
  }
}

function round2(value) {
  return Math.round(value * 100) / 100
}

export function getBaziFromSolarDate(input) {
  const {
    year,
    month,
    day,
    hour = 0,
    minute = 0,
    second = 0,
    gender,
    timezone = DEFAULT_TIMEZONE,
    useTrueSolarTime = false,
    useMeanSolarTime = false,
    birthLongitude = DEFAULT_BIRTH_LONGITUDE,
  } = input ?? {}

  if (!year || !month || !day) {
    throw new Error('Missing required input')
  }

  const solarFactory = Solar.fromYmdHms ?? Solar.fromYmd
  if (!solarFactory) {
    console.error('[lunarAdapter] Solar methods:', Object.keys(Solar))
    throw new Error('Missing lunar-javascript Solar.fromYmdHms')
  }

  const timezoneOffsetHours = getTimezoneOffsetHours(timezone)
  const standardMeridian = timezoneOffsetHours * 15
  const originalDate = new Date(year, month - 1, day, hour, minute, second)

  let mode = 'none'
  if (useTrueSolarTime) mode = 'trueSolarTime'
  else if (useMeanSolarTime) mode = 'meanSolarTime'

  let usedDate = originalDate
  let longitudeCorrectionMinutes = 0
  let equationOfTimeMinutes = 0

  if (mode === 'meanSolarTime') {
    const m = calculateMeanSolarTime({ dateTime: originalDate, birthLongitude, timezoneOffsetHours })
    usedDate = m.correctedDateTime
    longitudeCorrectionMinutes = m.longitudeCorrectionMinutes
  } else if (mode === 'trueSolarTime') {
    const t = calculateTrueSolarTime({ dateTime: originalDate, birthLongitude, timezoneOffsetHours })
    usedDate = t.trueSolarDateTime
    longitudeCorrectionMinutes = t.longitudeCorrectionMinutes
    equationOfTimeMinutes = t.equationOfTimeMinutes
  }

  const original = buildPillarsFromSolar(year, month, day, hour, minute, second)
  const used = mode === 'none'
    ? original
    : buildPillarsFromSolar(
        usedDate.getFullYear(),
        usedDate.getMonth() + 1,
        usedDate.getDate(),
        usedDate.getHours(),
        usedDate.getMinutes(),
        usedDate.getSeconds(),
      )

  const pillarChange = comparePillarsBeforeAfterCorrection(original.pillars, used.pillars)
  const totalCorrectionMinutes = longitudeCorrectionMinutes + equationOfTimeMinutes

  const modeNote = mode === 'none'
    ? '未啟用真太陽時，使用標準時間排盤。'
    : mode === 'meanSolarTime'
      ? '地方平太陽時 = 標準時間 + 經度差修正。'
      : `真太陽時 = 標準時間 + 經度差修正 + 均時差。${SOLAR_TIME_APPROX_NOTE}`

  const solarTimeCorrection = {
    enabled: mode !== 'none',
    mode,
    originalDateTime: formatSolarDateTime(originalDate),
    correctedDateTime: formatSolarDateTime(usedDate),
    standardMeridian,
    birthLongitude,
    longitudeCorrectionMinutes: round2(longitudeCorrectionMinutes),
    equationOfTimeMinutes: round2(equationOfTimeMinutes),
    totalCorrectionMinutes: round2(totalCorrectionMinutes),
    note: modeNote,
    pillarChange,
  }

  const notes = [
    '四柱由 lunar-javascript 產生',
    '十神、藏干、刑沖合害、強弱與文案由本系統規則引擎計算',
  ]
  if (mode !== 'none') {
    notes.push(modeNote)
    if (pillarChange.changed) notes.push(...pillarChange.messages)
  }

  return {
    input: { year, month, day, hour, minute, second, gender, timezone, birthLongitude, mode },
    solarText: typeof used.solar.toFullString === 'function' ? used.solar.toFullString() : '',
    lunarText: typeof used.lunar.toFullString === 'function' ? used.lunar.toFullString() : '',
    pillars: used.pillars,
    raw: used.raw,
    solarTimeCorrection,
    notes,
  }
}
