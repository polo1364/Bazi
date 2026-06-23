import { getDayunDetails } from './analysis.ts'
import { getTenGod } from './tenGodEngine.js'

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const YANG_STEMS = ['甲', '丙', '戊', '庚', '壬']

export const LUCK_START_METHOD = '三日折一年，一日折四個月'
export const LUCK_START_NOTE = '起運歲數依系統所選算法估算：三日折一年，一日折四個月。不同流派可能略有差異。'

/** 既有相容介面：保留原本以 analysis 計分的大運明細。 */
export function getLuckCycles(chart, gender, favorableElements) {
  if (!chart || !gender || !favorableElements) throw new Error('Missing required input')
  return getDayunDetails(chart, gender, favorableElements)
}

function normalizeGender(gender) {
  if (gender === 'male' || gender === '男') return 'male'
  if (gender === 'female' || gender === '女') return 'female'
  return null
}

/**
 * 依年干陰陽與性別判斷大運順逆。
 * 陽男陰女順行；陰男陽女逆行。
 */
export function getLuckDirection({ yearStem, gender } = {}) {
  const g = normalizeGender(gender)
  if (!g) {
    return { direction: null, label: '未驗證', reason: '缺少性別，無法判斷大運順逆' }
  }
  if (!yearStem || !STEMS.includes(yearStem)) {
    return { direction: null, label: '未驗證', reason: '缺少年干，無法判斷大運順逆' }
  }

  const isYang = YANG_STEMS.includes(yearStem)
  const yinYang = isYang ? '陽' : '陰'
  const forward = (g === 'male' && isYang) || (g === 'female' && !isYang)
  const genderLabel = g === 'male' ? '男' : '女'
  const label = forward ? '順行' : '逆行'

  return {
    direction: forward ? 'forward' : 'backward',
    label,
    reason: `${yearStem}為${yinYang}干，${genderLabel}命${yinYang}年${label}`,
  }
}

function parsePillarParts(pillar) {
  if (!pillar || typeof pillar !== 'string' || pillar.length < 2) {
    throw new Error('Invalid month pillar')
  }
  const stem = pillar[0]
  const branch = pillar[1]
  const stemIdx = STEMS.indexOf(stem)
  const branchIdx = BRANCHES.indexOf(branch)
  if (stemIdx < 0 || branchIdx < 0) throw new Error('Invalid month pillar')
  return { stem, branch, stemIdx, branchIdx }
}

function formatAge(totalMonths) {
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  return months > 0 ? `${years}歲${months}個月` : `${years}歲`
}

/**
 * 由出生時間與前後節氣，計算起運歲數。
 * 順行取下一個節氣，逆行取上一個節氣。
 */
export function calculateLuckStart({ birthDateTime, gender, yearStem, previousTerm, nextTerm } = {}) {
  const direction = getLuckDirection({ yearStem, gender })

  const base = {
    direction: direction.direction,
    directionLabel: direction.label,
    directionReason: direction.reason,
    method: LUCK_START_METHOD,
  }

  if (!direction.direction) {
    return { ...base, verified: false, note: '缺少性別，起運歲數尚未驗證' }
  }

  const birth = birthDateTime instanceof Date ? birthDateTime : (birthDateTime ? new Date(birthDateTime) : null)
  if (!birth || Number.isNaN(birth.getTime())) {
    return { ...base, verified: false, note: '缺少出生時間，起運歲數尚未驗證' }
  }

  const term = direction.direction === 'forward' ? nextTerm : previousTerm
  const termDate = term && term.dateTime
    ? (term.dateTime instanceof Date ? term.dateTime : new Date(term.dateTime))
    : null
  if (!termDate || Number.isNaN(termDate.getTime())) {
    return { ...base, verified: false, note: '節氣時間資料不足，起運歲數尚未驗證' }
  }

  const totalDiffDays = Math.abs(termDate.getTime() - birth.getTime()) / 86400000
  let startAgeYears = Math.floor(totalDiffDays / 3)
  const remainingDays = totalDiffDays % 3
  let startAgeMonths = Math.round(remainingDays * 4)
  if (startAgeMonths >= 12) {
    startAgeYears += 1
    startAgeMonths -= 12
  }

  return {
    ...base,
    startAgeYears,
    startAgeMonths,
    totalDiffDays,
    usedTerm: { name: term.name, dateTime: termDate },
    verified: true,
  }
}

/**
 * 依月柱與順逆排出大運干支與起止年齡。
 * 順行從月柱往後排，逆行往前排，每柱十年。
 */
export function buildLuckCycles({
  monthPillar,
  direction,
  startAgeYears = 0,
  startAgeMonths = 0,
  count = 8,
  dayMaster,
} = {}) {
  const { stemIdx, branchIdx } = parsePillarParts(monthPillar)
  const forward = direction === 'forward'
  const startTotalMonths = (startAgeYears || 0) * 12 + (startAgeMonths || 0)
  const cycles = []

  for (let i = 0; i < count; i++) {
    const step = forward ? i + 1 : -(i + 1)
    const si = ((stemIdx + step) % 10 + 10) % 10
    const bi = ((branchIdx + step) % 12 + 12) % 12
    const stem = STEMS[si]
    const branch = BRANCHES[bi]
    const startMonths = startTotalMonths + i * 120
    const endMonths = startMonths + 120
    cycles.push({
      index: i + 1,
      pillar: `${stem}${branch}`,
      stem,
      branch,
      startAge: formatAge(startMonths),
      endAge: formatAge(endMonths),
      stemTenGod: dayMaster ? getTenGod(dayMaster, stem) : '',
      note: '',
    })
  }

  return cycles
}
