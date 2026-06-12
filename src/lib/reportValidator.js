/**
 * 報告防呆驗證器。
 *
 * validateReport(reportData, reportText) 會比對「命盤實際資料」與「輸出文字」，
 * 攔截常見的亂編 / 規則違反，回傳 { valid, errors }。
 *
 * 不負責產生內容，只負責攔截錯誤。
 */

const SELF_PENALTY_BRANCHES = ['辰', '午', '酉', '亥']

const THREE_COMBINATION_BUREAUS = [
  { branches: ['申', '子', '辰'], element: '水' },
  { branches: ['亥', '卯', '未'], element: '木' },
  { branches: ['寅', '午', '戌'], element: '火' },
  { branches: ['巳', '酉', '丑'], element: '金' },
]

function countOf(list, target) {
  return (list || []).filter((x) => x === target).length
}

function hasAll(list, required) {
  return required.every((b) => (list || []).includes(b))
}

function textOf(reportText) {
  return typeof reportText === 'string' ? reportText : ''
}

function relationsOf(reportData) {
  const rels = reportData?.relations || []
  return rels.map((r) => (typeof r === 'string' ? r : r?.label || r?.name || '')).filter(Boolean)
}

/**
 * @param {object} reportData
 *   branches: string[]                 四柱地支（必填以啟用地支類檢查）
 *   relations: (string|{label})[]      已輸出的刑沖合害
 *   flowMonths: { year, months:[{label,pillar}] }  指定年份的節氣流月
 *   strength: { reasons: string[] }    身強弱模型（需附理由）
 *   combineTransformImplemented: boolean  是否已實作合化判斷
 *   shenshaImplemented: boolean        是否已實作神煞公式
 *   nameStrokesVerified: boolean       姓名筆畫是否已校驗
 * @param {string} reportText           完整報告文字
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateReport(reportData, reportText) {
  const data = reportData || {}
  const text = textOf(reportText)
  const branches = data.branches || []
  const relations = relationsOf(data)
  const errors = []

  const inRelationsOrText = (term) => relations.includes(term) || text.includes(term)

  // 1. 自刑必須同一地支至少出現兩次。
  for (const b of SELF_PENALTY_BRANCHES) {
    const term = `${b}${b}自刑`
    if (countOf(branches, b) < 2 && (inRelationsOrText(term) || text.includes(`${b}自刑`))) {
      errors.push(`本命${b}未重複出現，不得輸出「${b}自刑」`)
    }
  }

  // 2 & 3. 三合局必須三支俱全；半合不得寫成三合局。
  for (const bureau of THREE_COMBINATION_BUREAUS) {
    const full = `${bureau.branches.join('')}三合${bureau.element}局`
    const fullShort = `${bureau.branches.join('')}${bureau.element}局`
    const fakeHalf = `${bureau.branches.join('')}半合${bureau.element}局`
    if (!hasAll(branches, bureau.branches)) {
      if (inRelationsOrText(full) || inRelationsOrText(fullShort)) {
        errors.push(`地支未三支俱全，不得輸出「${fullShort}」`)
      }
    }
    // 半合不可寫成三合局的形式（無此術語）
    if (inRelationsOrText(fakeHalf)) {
      errors.push(`半合只能寫半合，不得輸出「${fakeHalf}」`)
    }
  }

  // 4. 六合未實作合化，不得輸出合化字樣。
  if (!data.combineTransformImplemented) {
    if (text.includes('合化') || relations.some((r) => r.includes('合化'))) {
      errors.push('合化條件未實作，不得輸出「合化」字樣')
    }
    const fakeTransform = /([子丑寅卯辰巳午未申酉戌亥])\1?合(土|水|火|金|木)/
    const transformHit = [...relations, text].find((s) => fakeTransform.test(s))
    if (transformHit) {
      errors.push('六合未判定合化前，不得直接輸出「合化某五行」（例：子丑合土）')
    }
  }

  // 5. 2026 丙午不得稱為金水喜用之年。
  if (text.includes('丙午') && text.includes('金水') && text.includes('喜用')) {
    errors.push('2026 丙午為火旺財星之年，不得稱為「金水喜用之年」')
  }

  // 6. 2026 丙午正月不得是己丑（己丑為國曆 1 月小寒至立春前的節氣段）。
  if (data.flowMonths && Number(data.flowMonths.year) === 2026) {
    const first = (data.flowMonths.months || [])[0]
    if (first && first.pillar === '己丑') {
      errors.push('2026 丙午正月應為庚寅，不得輸出己丑')
    }
    const zheng = (data.flowMonths.months || []).find((m) => m.label === '正月')
    if (zheng && zheng.pillar !== '庚寅') {
      errors.push(`2026 丙午正月應為庚寅，不得輸出${zheng.pillar}`)
    }
  }
  if (/2026[\s\S]{0,12}正月[\s\S]{0,6}己丑/.test(text) || /正月[\s\S]{0,4}己丑/.test(text)) {
    errors.push('2026 丙午正月應為庚寅，不得輸出己丑')
  }

  // 7. 神煞沒有公式不得輸出「成立」或「吉神匯聚」。
  if (!data.shenshaImplemented) {
    if (text.includes('吉神匯聚') || /神煞[\s\S]{0,12}成立/.test(text)) {
      errors.push('神煞公式未實作，不得輸出「成立」或「吉神匯聚」')
    }
  }

  // 8. 姓名筆畫未校驗，不得輸出「姓名五格皆吉」。
  if (!data.nameStrokesVerified) {
    if (text.includes('五格皆吉') || text.includes('姓名五格皆吉')) {
      errors.push('姓名筆畫未校驗，不得輸出「姓名五格皆吉」')
    }
  }

  // 9. 身強弱分數不得單獨作為結論。
  const bareStrength = /身(偏強|偏弱|較強|較弱|強|弱)\s*\d+\s*%/.test(text)
  const hasReasons = Array.isArray(data.strength?.reasons) && data.strength.reasons.length > 0
  if (bareStrength && !hasReasons) {
    errors.push('身強弱分數不得單獨作為結論，必須附上判斷理由')
  }

  return { valid: errors.length === 0, errors }
}
