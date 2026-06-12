import { Solar } from 'lunar-javascript'

function solarToDate(solar) {
  if (!solar || typeof solar.toYmdHms !== 'function') return null
  const text = solar.toYmdHms() // 'YYYY-MM-DD HH:mm:ss'
  const m = /^(\d{1,4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/.exec(text)
  if (!m) return null
  const [, y, mo, d, h, mi, s] = m.map(Number)
  const date = new Date(y, mo - 1, d, h, mi, s)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * 取得出生時間前後的「節」（大運起運以節為界，非中氣）。
 * 完全依賴 lunar-javascript 的 getPrevJie / getNextJie，不自行猜算節氣時間。
 */
export function getSolarTermsAroundBirth({
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0,
  timezone = 'Asia/Taipei',
} = {}) {
  const notes = [
    '節氣時間來源：lunar-javascript',
    '大運起運以「節」為界，非中氣，也非農曆初一',
    `時區：${timezone}（系統以輸入當地時間計算）`,
  ]

  if (!year || !month || !day) {
    return {
      birthDateTime: null,
      previousTerm: null,
      nextTerm: null,
      source: 'lunar-javascript',
      verified: false,
      notes: [...notes, '缺少出生年月日，節氣資料不足'],
    }
  }

  if (typeof Solar.fromYmdHms !== 'function') {
    return {
      birthDateTime: null,
      previousTerm: null,
      nextTerm: null,
      source: 'lunar-javascript',
      verified: false,
      notes: [...notes, '無法取得 lunar-javascript Solar.fromYmdHms'],
    }
  }

  const solar = Solar.fromYmdHms(year, month, day, hour, minute, second)
  const lunar = solar.getLunar()

  if (typeof lunar.getPrevJie !== 'function' || typeof lunar.getNextJie !== 'function') {
    return {
      birthDateTime: solarToDate(solar),
      previousTerm: null,
      nextTerm: null,
      source: 'lunar-javascript',
      verified: false,
      notes: [...notes, '無法取得 lunar-javascript 節氣方法（getPrevJie / getNextJie）'],
    }
  }

  const prevJie = lunar.getPrevJie(false)
  const nextJie = lunar.getNextJie(false)
  const prevDate = prevJie ? solarToDate(prevJie.getSolar()) : null
  const nextDate = nextJie ? solarToDate(nextJie.getSolar()) : null

  const previousTerm = prevJie && prevDate ? { name: prevJie.getName(), dateTime: prevDate } : null
  const nextTerm = nextJie && nextDate ? { name: nextJie.getName(), dateTime: nextDate } : null
  const verified = Boolean(previousTerm && nextTerm)

  return {
    birthDateTime: solarToDate(solar),
    previousTerm,
    nextTerm,
    source: 'lunar-javascript',
    verified,
    notes: verified ? notes : [...notes, '前後節氣時間不足，起運歲數尚未驗證'],
  }
}
