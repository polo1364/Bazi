import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  cacheDir: 'node_modules/.vite-bazi-test',
  logLevel: 'error',
  optimizeDeps: { entries: [], noDiscovery: true },
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
})

try {
  const { getBaziFromSolarDate, parsePillar } = await server.ssrLoadModule('/src/lib/lunarAdapter.js')
  const { getTenGod } = await server.ssrLoadModule('/src/lib/tenGodEngine.js')
  const { buildPillarTenGods, getBranchTenGods } = await server.ssrLoadModule('/src/lib/branchHiddenStemEngine.js')
  const { getBranchInteractions } = await server.ssrLoadModule('/src/lib/branchInteractionEngine.js')
  const { getSolarTermFlowMonths } = await server.ssrLoadModule('/src/lib/flowYearMonthEngine.js')
  const { buildSalaryText } = await server.ssrLoadModule('/src/lib/reportTextEngine.js')
  const { analyzeStrength } = await server.ssrLoadModule('/src/lib/strengthEngine.js')
  const { validateReport } = await server.ssrLoadModule('/src/lib/reportValidator.js')
  const { safeApplyAiNarrative, getSafePdfResult } = await server.ssrLoadModule('/src/lib/aiNarrativeSafety.ts')
  const { buildChartFromManual, calculateBazi } = await server.ssrLoadModule('/src/lib/bazi.ts')
  const { analyzeBirth } = await server.ssrLoadModule('/src/lib/analysis.ts')

  assert.deepEqual(parsePillar('丁卯'), { stem: '丁', branch: '卯' })
  assert.throws(() => parsePillar(''), /Invalid pillar format/)

  const lunarResult = getBaziFromSolarDate({ year: 1987, month: 4, day: 20, hour: 23 })
  assert.equal(lunarResult.raw.yearPillar, '丁卯')
  assert.equal(lunarResult.raw.monthPillar, '甲辰')
  assert.equal(lunarResult.pillars.year.stem, '丁')
  assert.equal(lunarResult.notes[0], '四柱由 lunar-javascript 產生')

  const chartFromLunar = calculateBazi(1987, 4, 20, 23)
  assert.equal(chartFromLunar.source, 'lunar-javascript')
  assert.equal(chartFromLunar.year.stem + chartFromLunar.year.branch, lunarResult.raw.yearPillar)
  assert.equal(chartFromLunar.month.stem + chartFromLunar.month.branch, lunarResult.raw.monthPillar)
  assert.equal(chartFromLunar.day.stem + chartFromLunar.day.branch, lunarResult.raw.dayPillar)
  assert.equal(chartFromLunar.hour.stem + chartFromLunar.hour.branch, lunarResult.raw.hourPillar)

  assert.equal(getTenGod('癸', '丁'), '偏財')
  assert.equal(getTenGod('癸', '甲'), '傷官')
  assert.equal(getTenGod('癸', '戊'), '正官')
  assert.equal(getTenGod('癸', '己'), '七殺')
  assert.equal(getTenGod('癸', '辛'), '偏印')
  assert.equal(getTenGod('癸', '壬'), '劫財')
  assert.equal(getTenGod('癸', '癸'), '比肩')

  assert.equal(getBranchTenGods('癸', '卯').mainQi.tenGod, '食神')
  assert.equal(getBranchTenGods('癸', '辰').mainQi.tenGod, '正官')
  assert.equal(getBranchTenGods('癸', '丑').mainQi.tenGod, '七殺')
  assert.equal(getBranchTenGods('癸', '子').mainQi.tenGod, '比肩')

  const pillars = {
    year: { stem: '丁', branch: '卯' },
    month: { stem: '甲', branch: '辰' },
    day: { stem: '癸', branch: '丑' },
    hour: { stem: '壬', branch: '子' },
  }
  const result = buildPillarTenGods('癸', pillars)
  assert.equal(result.year.stemTenGod, '偏財')
  assert.equal(result.month.stemTenGod, '傷官')
  assert.equal(result.day.stemTenGod, '日主')
  assert.equal(result.hour.stemTenGod, '劫財')
  assert.equal(result.year.branchMainQi.tenGod, '食神')
  assert.equal(result.month.branchMainQi.tenGod, '正官')
  assert.equal(result.day.branchMainQi.tenGod, '七殺')
  assert.equal(result.hour.branchMainQi.tenGod, '比肩')

  const interactions = getBranchInteractions(['卯', '辰', '丑', '子']).map((item) => item.label)
  assert.ok(interactions.includes('卯辰害'))
  assert.ok(interactions.includes('子丑合'))
  assert.ok(interactions.includes('子卯無禮之刑'))
  assert.ok(interactions.includes('子辰半合水'))
  assert.equal(interactions.includes('辰辰自刑'), false)
  assert.equal(interactions.includes('申子辰三合水局'), false)
  assert.equal(interactions.includes('申子辰半合水局'), false)

  const manualChart = buildChartFromManual({ year: '丁卯', month: '甲辰', day: '癸丑', hour: '壬子' })
  const months2026 = getSolarTermFlowMonths(manualChart, 2026)
  assert.equal(months2026[0].pillar, '庚寅')
  assert.notEqual(months2026[0].pillar, '己丑')

  const salaryText = buildSalaryText({ year: 2026, pillar: '丙午', dayStem: '癸' })
  assert.ok(salaryText.includes('丙為癸水日主之正財'))
  assert.equal(salaryText.includes('金水喜用之年'), false)

  // 身強弱：由命盤實際干支演算，不接受硬寫
  const strength = analyzeStrength(manualChart)
  assert.ok(Array.isArray(strength.reasons) && strength.reasons.length >= 3, '身強弱必須附理由')
  assert.equal(typeof strength.label, 'string')
  assert.ok(strength.score >= 0 && strength.score <= 100)
  assert.ok(strength.reasons.join('').includes('癸'), '理由需引用實際日主')
  assert.ok(['偏強', '中和', '中和偏弱', '偏弱'].includes(strength.label))
  assert.throws(() => analyzeStrength(null), /Missing required input/)

  // reportValidator：乾淨報告應通過
  const cleanData = {
    branches: ['卯', '辰', '丑', '子'],
    relations: ['卯辰害', '子丑合', '子卯無禮之刑', '子辰半合水'],
    flowMonths: { year: 2026, months: [{ label: '正月', pillar: '庚寅' }] },
    strength: { reasons: strength.reasons },
    combineTransformImplemented: false,
    shenshaImplemented: false,
    nameStrokesVerified: false,
  }
  const cleanText = '2026年為丙午年，丙為癸水日主之正財，午為火旺之地，屬財星明顯之年。子丑合，子辰半合水。'
  const clean = validateReport(cleanData, cleanText)
  assert.equal(clean.valid, true, `乾淨報告不應有錯誤：${clean.errors.join('；')}`)

  // 1. 只有一個辰不得辰自刑
  const r1 = validateReport({ branches: ['辰', '丑', '子', '卯'] }, '命局見辰自刑，需注意。')
  assert.equal(r1.valid, false)
  assert.ok(r1.errors.some((e) => e.includes('辰自刑')))

  // 2. 沒有申不得申子辰水局
  const r2 = validateReport({ branches: ['子', '辰', '丑', '卯'] }, '本命申子辰三合水局成形。')
  assert.equal(r2.valid, false)
  assert.ok(r2.errors.some((e) => e.includes('水局')))

  // 3. 不得申子辰半合水局
  const r3 = validateReport({ branches: ['子', '辰'] }, '出現申子辰半合水局。')
  assert.equal(r3.valid, false)

  // 4. 未實作合化不得合化土
  const r4 = validateReport({ branches: ['子', '丑'] }, '子丑合土，化為土。')
  assert.equal(r4.valid, false)
  assert.ok(r4.errors.some((e) => e.includes('合化')))

  // 5. 2026 丙午不得金水喜用之年
  const r5 = validateReport({}, '2026年丙午，流年與八字火旺，為喜用神金水之年。')
  assert.equal(r5.valid, false)
  assert.ok(r5.errors.some((e) => e.includes('金水')))

  // 6. 2026 正月不得己丑
  const r6 = validateReport(
    { flowMonths: { year: 2026, months: [{ label: '正月', pillar: '己丑' }] } },
    '2026年正月己丑當令。',
  )
  assert.equal(r6.valid, false)
  assert.ok(r6.errors.some((e) => e.includes('庚寅')))

  // 7. 神煞未實作不得成立 / 吉神匯聚
  const r7 = validateReport({ shenshaImplemented: false }, '本命吉神匯聚，貴氣天成。')
  assert.equal(r7.valid, false)

  // 8. 姓名未校驗不得五格皆吉
  const r8 = validateReport({ nameStrokesVerified: false }, '姓名五格皆吉，無須更名。')
  assert.equal(r8.valid, false)

  // 9. 身強弱分數不得單獨作結論
  const r9 = validateReport({ strength: { reasons: [] } }, '結論：身偏弱 41%。')
  assert.equal(r9.valid, false)
  const r9ok = validateReport({ strength: { reasons: ['有壬水透干'] } }, '身偏弱 41%，因壬水透干但土多剋水。')
  assert.equal(r9ok.valid, true)

  const baseInput = {
    inputMode: 'manual',
    year: '',
    month: '',
    day: '',
    hour: '',
    uncertainHour: false,
    manualPillars: { year: '丁卯', month: '甲辰', day: '癸丑', hour: '壬子' },
    name: '',
    gender: '男',
    analysisYear: 2026,
    topic: '整體運勢',
    query: '',
    compoundSurname: '',
  }
  const baseResult = analyzeBirth(baseInput)
  assert.ok(baseResult)

  const narrative = (summary) => ({
    summary,
    detailText: '依規則引擎資料作白話整理，四柱、十神與流月仍以結構化結果為準。',
    topicAnalysis: '2026年丙午，丙為癸水日主之正財，午為火旺之地，僅作節奏提醒。',
    sections: {
      career: '',
      wealth: '',
      relationship: '',
      health: '',
      yearly: '',
      nameAdvice: '',
      remedies: '',
    },
  })

  // safeApplyAiNarrative：AI 亂寫辰自刑時必須回退規則引擎文案
  const safe1 = safeApplyAiNarrative({
    baseResult,
    aiNarrative: narrative('命局見辰自刑，需特別注意。'),
  })
  assert.equal(safe1.usedAi, false)
  assert.equal(safe1.result.summary, baseResult.summary)
  assert.ok(safe1.validatorErrors.some((e) => e.includes('辰自刑')))

  // safeApplyAiNarrative：AI 亂寫申子辰水局時必須回退
  const safe2 = safeApplyAiNarrative({
    baseResult,
    aiNarrative: narrative('本命申子辰水局成形，水勢極旺。'),
  })
  assert.equal(safe2.usedAi, false)
  assert.equal(safe2.result.summary, baseResult.summary)
  assert.ok(safe2.validatorErrors.some((e) => e.includes('水局')))

  // safeApplyAiNarrative：AI 亂寫 2026 丙午為金水喜用之年時必須回退
  const safe3 = safeApplyAiNarrative({
    baseResult,
    aiNarrative: narrative('2026 丙午為金水喜用之年，整體大旺。'),
  })
  assert.equal(safe3.usedAi, false)
  assert.equal(safe3.result.summary, baseResult.summary)
  assert.ok(safe3.validatorErrors.some((e) => e.includes('金水')))

  // safeApplyAiNarrative：只改寫語氣且不違反規則時可以通過
  const safe4 = safeApplyAiNarrative({
    baseResult,
    aiNarrative: narrative('這份命盤以癸水日主為核心，解讀仍以規則引擎的十神、藏干、刑沖合害與流年流月結果為準。'),
  })
  assert.equal(safe4.usedAi, true)
  assert.equal(safe4.validatorErrors.length, 0)
  assert.notEqual(safe4.result.summary, baseResult.summary)

  // PDF 匯出前：validator 不通過時必須使用規則引擎原文案
  const unsafePdfResult = {
    ...baseResult,
    summary: '命局見辰自刑，且2026 丙午為金水喜用之年。',
  }
  const safePdf = getSafePdfResult({ result: unsafePdfResult, fallbackResult: baseResult })
  assert.equal(safePdf.usedFallback, true)
  assert.equal(safePdf.result.summary, baseResult.summary)
  assert.ok(safePdf.validatorErrors.length >= 1)

  console.log('bazi tests passed')
} finally {
  await server.close()
}
