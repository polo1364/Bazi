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
  const { buildChartFromManual, calculateBazi } = await server.ssrLoadModule('/src/lib/bazi.ts')

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

  console.log('bazi tests passed')
} finally {
  await server.close()
}
