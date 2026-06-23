function toDate(value) {
  if (value instanceof Date) return value
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

function pillarText(pillar) {
  if (!pillar) return ''
  if (typeof pillar === 'string') return pillar
  return `${pillar.stem ?? ''}${pillar.branch ?? ''}`
}

/**
 * 地方平太陽時 = 標準時間 + 經度差修正。
 * 地球每 1 度經度約差 4 分鐘；出生地在標準經線以東時間加快，以西變慢。
 */
export function calculateMeanSolarTime({ dateTime, birthLongitude, timezoneOffsetHours } = {}) {
  const originalDateTime = toDate(dateTime)
  if (!originalDateTime) throw new Error('Invalid dateTime')

  const standardMeridian = timezoneOffsetHours * 15
  const longitudeCorrectionMinutes = (birthLongitude - standardMeridian) * 4
  const correctedDateTime = new Date(originalDateTime.getTime() + longitudeCorrectionMinutes * 60000)

  return {
    originalDateTime,
    standardMeridian,
    birthLongitude,
    longitudeCorrectionMinutes,
    correctedDateTime,
    method: '地方平太陽時 = 標準時間 + 經度差修正',
  }
}

/**
 * 均時差 Equation of Time（近似公式，單位：分鐘）。
 * 可能與天文年鑑資料有數十秒至數分鐘差異。
 */
export function calculateEquationOfTime(date) {
  const d = toDate(date)
  if (!d) throw new Error('Invalid date')
  const n = dayOfYear(d)
  const B = (2 * Math.PI * (n - 81)) / 364
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B)
}

/**
 * 真太陽時 = 標準時間 + 經度差修正 + 均時差。
 */
export function calculateTrueSolarTime({ dateTime, birthLongitude, timezoneOffsetHours } = {}) {
  const mean = calculateMeanSolarTime({ dateTime, birthLongitude, timezoneOffsetHours })
  const equationOfTimeMinutes = calculateEquationOfTime(mean.originalDateTime)
  const trueSolarDateTime = new Date(mean.correctedDateTime.getTime() + equationOfTimeMinutes * 60000)
  const totalCorrectionMinutes = mean.longitudeCorrectionMinutes + equationOfTimeMinutes

  return {
    originalDateTime: mean.originalDateTime,
    meanSolarDateTime: mean.correctedDateTime,
    trueSolarDateTime,
    standardMeridian: mean.standardMeridian,
    birthLongitude: mean.birthLongitude,
    longitudeCorrectionMinutes: mean.longitudeCorrectionMinutes,
    equationOfTimeMinutes,
    totalCorrectionMinutes,
    method: '真太陽時 = 標準時間 + 經度差修正 + 均時差',
  }
}

/**
 * 比較修正前後四柱，偵測時柱／日柱是否變化並給出提醒。
 */
export function comparePillarsBeforeAfterCorrection(originalPillars, correctedPillars) {
  const fields = ['year', 'month', 'day', 'hour']
  const changedFields = []
  for (const field of fields) {
    if (pillarText(originalPillars?.[field]) !== pillarText(correctedPillars?.[field])) {
      changedFields.push(field)
    }
  }

  const messages = []
  if (changedFields.includes('hour')) {
    messages.push(
      `真太陽時修正後，時柱由 ${pillarText(originalPillars.hour)} 改為 ${pillarText(correctedPillars.hour)}，請確認出生時間是否接近時辰交界。`,
    )
  }
  if (changedFields.includes('day')) {
    messages.push(
      `真太陽時修正後，日柱也發生變化（${pillarText(originalPillars.day)} → ${pillarText(correctedPillars.day)}），出生時間可能跨越換日界線，請謹慎確認。`,
    )
  }

  return {
    changed: changedFields.length > 0,
    changedFields,
    messages,
  }
}

export function formatSolarDateTime(date) {
  const d = toDate(date)
  if (!d) return ''
  const pad = (n) => `${n}`.padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const SOLAR_TIME_APPROX_NOTE =
  '真太陽時使用近似均時差公式，可能與天文年鑑資料有數十秒至數分鐘差異。'
