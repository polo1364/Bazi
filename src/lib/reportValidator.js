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

const SENTENCE_SPLIT_RE = /[。！？!?\n；;]+/
const YEAR_FIRE_WEALTH_CONTEXT_RE = /(2026|丙午|丙午流年|2026年丙午)/
const YEAR_FIRE_WEALTH_FORBIDDEN_RE = /(金水喜用之年|喜用金水之年|喜用神金水之年|金水旺年|大利金水|金水到位|金水相助之年|喜用神到位)/
const NAME_FORTUNE_FORBIDDEN_RE = /(姓名五格皆吉|五格大吉|總格大吉|姓名大吉|有助財運穩定)/
const NAME_ABSOLUTE_ALWAYS_FORBIDDEN_RE = /(姓名五格皆吉|五格大吉|姓名大吉|姓名保證大吉)/
const SANCAI_FORTUNE_FORBIDDEN_RE = /(三才平和|三才相生|三才大吉|三才配置(?:佳|吉|良好|平和))/
const ABSOLUTE_FORTUNE_FORBIDDEN_RE = /(必定成功|必定發財|必定婚姻不順|保證大吉|姓名保證大吉|絕對成功|因姓名必定加薪)/
const UNVERIFIED_SHENSHA_NAMES = []
const KNOWN_SHENSHA_NAMES = [
  '天乙貴人', '文昌貴人', '桃花', '華蓋', '將星', '驛馬',
  '紅鸞', '天喜', '天德貴人', '月德貴人',
  '福星貴人', '祿神', '羊刃', '學堂', '空亡',
  '孤辰', '寡宿', '亡神', '劫煞', '災煞', '天赦',
  '元辰', '大耗',
  ...UNVERIFIED_SHENSHA_NAMES,
]
const STRENGTH_ABSOLUTE_FORBIDDEN_RE = /(純正官格|純殺格|喜用神絕對為金水|必定喜金水|身弱必發不了財|身強必富)/
const FORTUNE_ABSOLUTE_FORBIDDEN_RE = /(一定升遷|必定升遷|必定升職|身弱不能賺錢|身弱不能賺|流年必定發財|必定發財|必定破財|必有災)/
const BIG_WEALTH_YEAR_RE = /大財年/
const BIG_WEALTH_QUALIFIER_RE = /(機會與壓力|並存|不宜|不等於|需看|需配合|承接|耗身|保守|壓力|條件)/
const VISIBLE_TEMPLATE_FORBIDDEN_RE = /(undefined|null|\[object Object\]|需搭配完整旺衰模型驗證|吉凶仍待81數理與三才表校驗|吉凶結論仍待校驗|吉凶仍待校驗|目前不輸出吉凶定論|81數理吉凶、三才配置與字五行尚未校驗|時支子為水強根|時支藏癸為水強根|壓力較高：無|五月 約芒種至小暑 甲午 傷官 此月平穩|六月 約小暑至立秋 乙未 食神 此月平穩|九月 約寒露至立冬 戊戌 正官 此月平穩|正月庚寅、二月辛卯，金水印星透出|三月壬辰、四月癸巳，水比劫幫身，團隊合作順利|冬月庚子、臘月辛丑，金水印比幫身，年終收尾順利|年柱丁卯偏財，月柱甲辰傷官，日柱癸丑為日主坐七殺之地，時柱壬子劫財|年柱丁卯偏財|月柱甲辰傷官|時柱壬子劫財|日柱癸丑正官|日柱癸丑為正官|日干癸為正官|日支丑為正官|尚未產生 AI 喜用補強建議|尚未產生喜用補強建議|身強弱：偏弱，系統初判|命局水偏旺，土亦重|有助於平衡命局能量|保證開運|必定有效|一定改善|絕對準確|命中注定不可改|日主為癸水，也就是癸水日主|癸水日主，也就是癸水日主|你屬於癸水日主，核心像細水|這次報告列出的方向是金、水|報告建議喜用金、水，白話就是喜用金、水|喜用金、水，白話就是喜用金、水|白話說，不是全好或全壞，而是有些地方順、有些地方需要靠後天調整。白話說|姓名學不是單純大吉，也不是單純不好，而是有幫助的地方，也有需要靠後天調整的地方|後天調整。。|。。)/
const TEN_GOD_MISMATCH_FORBIDDEN_RE = /(2032年壬子，天干壬為癸日主之劫財。財星明顯|2034年甲寅，天干甲為癸日主之傷官。官殺代表制度)/
const FORTUNE_TRANSITION_FORBIDDEN_RE = /大運背景：庚子（39歲5個月-49歲5個月）/
const SHENSHA_ABSOLUTE_FORBIDDEN_RE = /(紅鸞星入命，?必定婚喜|天喜必有喜事|天德月德保證逢凶化吉|保證逢凶化吉|必有婚喜|必定婚喜|福星貴人必定富貴|祿神必定有財|羊刃必有血光|學堂必定高學歷|空亡必定失敗|必定富貴|必定高學歷|必有血光|必定失敗|凶煞聚集|命帶寡宿必孤|孤辰必孤|寡宿必婚姻不順|亡神必定不好|劫煞必定破財|災煞必有災|災煞必有血光|天赦一定逢凶化吉|必定孤獨|必定破財|元辰必定不好|命帶元辰必有災|大耗必定破財|大耗必破財|咸池必桃花劫|桃花必定感情亂|必有災|必破財)/

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

function splitTextIntoSentences(text) {
  return textOf(text).split(SENTENCE_SPLIT_RE).map((s) => s.trim()).filter(Boolean)
}

function isDefensiveExplanation(sentence) {
  return /(不等於|不得|不可|不能|未|尚未|不是|不宣稱|需另判|另判)/.test(sentence)
}

function hasUnsupportedClaim(text, term) {
  return splitTextIntoSentences(text).some((sentence) => sentence.includes(term) && !isDefensiveExplanation(sentence))
}

function hasForbiddenFireWealthYearClaim(text) {
  return splitTextIntoSentences(text).some((sentence) => (
    YEAR_FIRE_WEALTH_CONTEXT_RE.test(sentence) && YEAR_FIRE_WEALTH_FORBIDDEN_RE.test(sentence)
  ))
}

function verifiedShenshaNamesOf(data) {
  const raw = data.shensha?.items || data.shensha || []
  if (!Array.isArray(raw)) return new Set()
  return new Set(raw.filter((s) => s?.verified === true).map((s) => s.name).filter(Boolean))
}

/**
 * @param {object} reportData
 *   branches: string[]                 四柱地支（必填以啟用地支類檢查）
 *   relations: (string|{label})[]      已輸出的刑沖合害
 *   flowMonths: { year, months:[{label,pillar}] }  指定年份的節氣流月
 *   strength: { reasons: string[] }    身強弱模型（需附理由）
 *   combineTransformImplemented: boolean  是否已實作合化判斷
 *   shenshaImplemented: boolean        是否已實作神煞公式
 *   shensha: { items:[{name,verified}] } | Array  神煞公式化結果
 *   nameStrokesVerified: boolean       姓名筆畫是否已校驗
 *   nameWuge: { verified:boolean }      姓名五格筆畫校驗結果
 *   wugeFortune: { verified:boolean }  81 數理吉凶分析結果
 *   wugeFortuneVerified: boolean       81 數理吉凶表是否已啟用驗證
 *   sancai: { verified:boolean }       三才配置分析結果
 *   sancaiVerified: boolean            三才配置表是否已啟用驗證
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
    if (countOf(branches, b) < 2 && (inRelationsOrText(term) || text.includes(`${b}自刑`) || text.includes(`${b}支自刑`))) {
      errors.push(`本命${b}未重複出現，不得輸出「${b}自刑」`)
    }
  }

  // 2 & 3. 三合局必須三支俱全；半合不得寫成三合局。
  for (const bureau of THREE_COMBINATION_BUREAUS) {
    const full = `${bureau.branches.join('')}三合${bureau.element}局`
    const fullShort = `${bureau.branches.join('')}${bureau.element}局`
    const fakeHalf = `${bureau.branches.join('')}半合${bureau.element}局`
    if (!hasAll(branches, bureau.branches)) {
      if (relations.includes(full) || relations.includes(fullShort) || hasUnsupportedClaim(text, full) || hasUnsupportedClaim(text, fullShort)) {
        errors.push(`地支未三支俱全，不得輸出「${fullShort}」`)
      }
      if (bureau.element === '水' && /水勢極旺/.test(text)) {
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
    if (relations.some((r) => r.includes('合化')) || splitTextIntoSentences(text).some((sentence) => sentence.includes('合化') && !isDefensiveExplanation(sentence))) {
      errors.push('合化條件未實作，不得輸出「合化」字樣')
    }
    const fakeTransform = /([子丑寅卯辰巳午未申酉戌亥])\1?合(土|水|火|金|木)|[子丑寅卯辰巳午未申酉戌亥]{2}合化(土|水|火|金|木)/
    const transformHit = [...relations, text].find((s) => fakeTransform.test(s))
    if (transformHit) {
      errors.push('六合未判定合化前，不得直接輸出「合化某五行」（例：子丑合土）')
    }
  }

  // 5. 2026 丙午不得被明確稱為金水喜用之年；命局喜用金水本身不攔截。
  if (hasForbiddenFireWealthYearClaim(text)) {
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

  // 7. 神煞不得總括成「吉神匯聚」，且未驗證神煞不得寫成立。
  const verifiedShenshaNames = verifiedShenshaNamesOf(data)
  if (text.includes('吉神匯聚')) {
    errors.push('神煞需逐項依公式列示，不得輸出「吉神匯聚」')
  }
  if (SHENSHA_ABSOLUTE_FORBIDDEN_RE.test(text)) {
    errors.push('神煞文案不得使用必定、必有、保證等絕對化結論')
  }
  if (!data.shenshaImplemented && /神煞[\s\S]{0,12}成立/.test(text)) {
    errors.push('神煞公式未實作，不得輸出「成立」')
  }
  for (const name of KNOWN_SHENSHA_NAMES) {
    if (!verifiedShenshaNames.has(name)) {
      const re = new RegExp(`${name}(?:星入命|貴人成立|貴人入命|入命|成立)`)
      if (re.test(text)) {
        errors.push(`${name}尚未建立公式驗證，不得輸出成立`)
      }
    }
  }

  // 8. 姓名筆畫未校驗，不得輸出「姓名五格皆吉」。
  if (NAME_ABSOLUTE_ALWAYS_FORBIDDEN_RE.test(text)) {
    errors.push('姓名學不得輸出姓名五格皆吉、五格大吉、姓名大吉、姓名保證大吉等保證式總結')
  }
  if (!data.nameStrokesVerified) {
    if (text.includes('五格皆吉') || text.includes('姓名五格皆吉')) {
      errors.push('姓名筆畫未校驗，不得輸出「姓名五格皆吉」')
    }
  }

  // 8-1. 筆畫校驗不等於吉凶校驗；81 數理表未啟用前，不得輸出姓名吉凶結論。
  const wugeFortuneVerified = data.wugeFortune?.verified === true || data.wugeFortuneVerified === true
  if (!wugeFortuneVerified) {
    if (NAME_FORTUNE_FORBIDDEN_RE.test(text)) {
      errors.push('81 數理吉凶表未啟用，不得輸出姓名吉凶結論')
    }
  }

  // 8-2. 三才配置表未啟用前，不得輸出三才吉凶結論。
  const sancaiVerified = data.sancai?.verified === true || data.sancaiVerified === true
  if (!sancaiVerified) {
    if (SANCAI_FORTUNE_FORBIDDEN_RE.test(text)) {
      errors.push('三才配置表未啟用，不得輸出三才吉凶結論')
    }
  }

  // 8-3. 即使姓名學資料已驗證，也不得輸出保證性或絕對化吉凶。
  if (ABSOLUTE_FORTUNE_FORBIDDEN_RE.test(text)) {
    errors.push('姓名學文案不得使用必定、保證等絕對化吉凶結論')
  }

  // 9. 身強弱分數不得單獨作為結論。
  const bareStrength = /身(偏強|偏弱|較強|較弱|強|弱)\s*\d+\s*%/.test(text)
  const hasReasons = Array.isArray(data.strength?.reasons) && data.strength.reasons.length > 0
  if (bareStrength && !hasReasons) {
    errors.push('身強弱分數不得單獨作為結論，必須附上判斷理由')
  }

  // 9-1. 旺衰、喜用、格局不得使用絕對化或純格定論。
  if (STRENGTH_ABSOLUTE_FORBIDDEN_RE.test(text)) {
    errors.push('旺衰與喜用神文案不得使用純正官格、喜用神絕對為金水、身弱必發不了財、身強必富等絕對化定論')
  }

  // 9-2. 歲運解讀不得使用絕對化斷語。
  if (FORTUNE_ABSOLUTE_FORBIDDEN_RE.test(text)) {
    errors.push('歲運文案不得使用必定發財、必定破財、必有災、一定升遷、身弱不能賺錢等絕對化斷語')
  }

  // 9-3. 「大財年」需附條件與壓力說明，不得無條件斷言。
  for (const sentence of splitTextIntoSentences(text)) {
    if (BIG_WEALTH_YEAR_RE.test(sentence) && !BIG_WEALTH_QUALIFIER_RE.test(sentence)) {
      errors.push('「大財年」需附條件與壓力說明，不得無條件斷言')
    }
  }

  // 9-4. 報告模板不得露出程式值或舊版矛盾文案。
  if (VISIBLE_TEMPLATE_FORBIDDEN_RE.test(text)) {
    errors.push('報告可見文字不得包含 undefined、[object Object] 或舊版模板矛盾文案')
  }
  if (TEN_GOD_MISMATCH_FORBIDDEN_RE.test(text)) {
    errors.push('流年十神文案不得錯配：劫財不得套用財星文案，傷官不得套用官殺文案')
  }
  if (FORTUNE_TRANSITION_FORBIDDEN_RE.test(text)) {
    errors.push('2026 跨大運切換時，不得整年只顯示庚子大運背景')
  }

  return { valid: errors.length === 0, errors }
}
