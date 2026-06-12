import { Solar } from 'lunar-javascript'

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

export function getBaziFromSolarDate(input) {
  const {
    year,
    month,
    day,
    hour = 0,
    minute = 0,
    second = 0,
    gender,
  } = input ?? {}

  if (!year || !month || !day) {
    throw new Error('Missing required input')
  }

  const solarFactory = Solar.fromYmdHms ?? Solar.fromYmd
  if (!solarFactory) {
    console.error('[lunarAdapter] Solar methods:', Object.keys(Solar))
    throw new Error('Missing lunar-javascript Solar.fromYmdHms')
  }

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
    input: { year, month, day, hour, minute, second, gender },
    solarText: typeof solar.toFullString === 'function' ? solar.toFullString() : '',
    lunarText: typeof lunar.toFullString === 'function' ? lunar.toFullString() : '',
    pillars: {
      year: parsePillar(yearPillar),
      month: parsePillar(monthPillar),
      day: parsePillar(dayPillar),
      hour: parsePillar(hourPillar),
    },
    raw: {
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
    },
    notes: [
      '四柱由 lunar-javascript 產生',
      '十神、藏干、刑沖合害、強弱與文案由本系統規則引擎計算',
    ],
  }
}
