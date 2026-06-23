import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  cacheDir: 'node_modules/.vite-tengods-test',
  logLevel: 'error',
  optimizeDeps: { entries: [], noDiscovery: true },
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
})

function assertThrowsMessage(fn, message) {
  assert.throws(fn, (error) => {
    assert.ok(error instanceof Error)
    assert.ok(error.message.includes(message), `Expected "${error.message}" to include "${message}"`)
    return true
  })
}

function assertPillar(actual, expected) {
  assert.equal(actual.stemTenGod, expected.stemTenGod)
  assert.equal(actual.branchMainQi.tenGod, expected.branchMainQi)
  assert.deepEqual(
    actual.hiddenStems.map((item) => `${item.stem}:${item.tenGod}`),
    expected.hiddenStems,
  )
}

try {
  const {
    buildPillarTenGods,
    getBranchHiddenStems,
    getBranchTenGods,
    getStemInfo,
    getTenGod,
    isControlling,
    isGenerating,
  } = await server.ssrLoadModule('/src/lib/tenGods.ts')
  const { computeBranchRelations } = await server.ssrLoadModule('/src/lib/relations.ts')
  const { getLiunian, getLiuyue } = await server.ssrLoadModule('/src/lib/analysis.ts')
  const { buildChartFromManual } = await server.ssrLoadModule('/src/lib/bazi.ts')

  assert.deepEqual(getStemInfo('癸'), { element: '水', polarity: '陰' })
  assert.equal(isGenerating('水', '木'), true)
  assert.equal(isControlling('水', '火'), true)
  assert.deepEqual(getBranchHiddenStems('辰'), [
    { stem: '戊', qi: '主氣' },
    { stem: '乙', qi: '中氣' },
    { stem: '癸', qi: '餘氣' },
  ])

  assert.equal(getTenGod('癸', '丁'), '偏財')
  assert.equal(getTenGod('癸', '甲'), '傷官')
  assert.equal(getTenGod('癸', '戊'), '正官')
  assert.equal(getTenGod('癸', '己'), '七殺')
  assert.equal(getTenGod('癸', '辛'), '偏印')
  assert.equal(getTenGod('癸', '壬'), '劫財')
  assert.equal(getTenGod('癸', '癸'), '比肩')
  assert.equal(getTenGod('癸', '丙'), '正財')
  assert.equal(getTenGod('癸', '乙'), '食神')
  assert.equal(getTenGod('癸', '庚'), '正印')

  assert.equal(getTenGod('甲', '庚'), '七殺')
  assert.equal(getTenGod('甲', '辛'), '正官')
  assert.equal(getTenGod('甲', '戊'), '偏財')
  assert.equal(getTenGod('甲', '己'), '正財')
  assert.equal(getTenGod('甲', '丙'), '食神')
  assert.equal(getTenGod('甲', '丁'), '傷官')
  assert.equal(getTenGod('甲', '壬'), '偏印')
  assert.equal(getTenGod('甲', '癸'), '正印')

  assert.equal(getBranchTenGods('癸', '卯').mainQi.tenGod, '食神')
  assert.equal(getBranchTenGods('癸', '辰').mainQi.tenGod, '正官')
  assert.equal(getBranchTenGods('癸', '丑').mainQi.tenGod, '七殺')
  assert.equal(getBranchTenGods('癸', '子').mainQi.tenGod, '比肩')

  const caseOne = buildPillarTenGods('癸', {
    year: { stem: '丁', branch: '卯' },
    month: { stem: '甲', branch: '辰' },
    day: { stem: '癸', branch: '丑' },
    hour: { stem: '壬', branch: '子' },
  })
  assertPillar(caseOne.year, { stemTenGod: '偏財', branchMainQi: '食神', hiddenStems: ['乙:食神'] })
  assertPillar(caseOne.month, { stemTenGod: '傷官', branchMainQi: '正官', hiddenStems: ['戊:正官', '乙:食神', '癸:比肩'] })
  assertPillar(caseOne.day, { stemTenGod: '日主', branchMainQi: '七殺', hiddenStems: ['己:七殺', '癸:比肩', '辛:偏印'] })
  assertPillar(caseOne.hour, { stemTenGod: '劫財', branchMainQi: '比肩', hiddenStems: ['癸:比肩'] })

  const caseTwo = buildPillarTenGods('甲', {
    year: { stem: '庚', branch: '申' },
    month: { stem: '丙', branch: '寅' },
    day: { stem: '甲', branch: '午' },
    hour: { stem: '己', branch: '巳' },
  })
  assertPillar(caseTwo.year, { stemTenGod: '七殺', branchMainQi: '七殺', hiddenStems: ['庚:七殺', '壬:偏印', '戊:偏財'] })
  assertPillar(caseTwo.month, { stemTenGod: '食神', branchMainQi: '比肩', hiddenStems: ['甲:比肩', '丙:食神', '戊:偏財'] })
  assertPillar(caseTwo.day, { stemTenGod: '日主', branchMainQi: '傷官', hiddenStems: ['丁:傷官', '己:正財'] })
  assertPillar(caseTwo.hour, { stemTenGod: '正財', branchMainQi: '食神', hiddenStems: ['丙:食神', '戊:偏財', '庚:七殺'] })

  const caseThree = buildPillarTenGods('辛', {
    year: { stem: '乙', branch: '亥' },
    month: { stem: '己', branch: '酉' },
    day: { stem: '辛', branch: '未' },
    hour: { stem: '壬', branch: '辰' },
  })
  assertPillar(caseThree.year, { stemTenGod: '偏財', branchMainQi: '傷官', hiddenStems: ['壬:傷官', '甲:正財'] })
  assertPillar(caseThree.month, { stemTenGod: '偏印', branchMainQi: '比肩', hiddenStems: ['辛:比肩'] })
  assertPillar(caseThree.day, { stemTenGod: '日主', branchMainQi: '偏印', hiddenStems: ['己:偏印', '丁:七殺', '乙:偏財'] })
  assertPillar(caseThree.hour, { stemTenGod: '傷官', branchMainQi: '正印', hiddenStems: ['戊:正印', '乙:偏財', '癸:食神'] })

  assert.equal(caseOne.day.stemTenGod, '日主')

  const relations = computeBranchRelations(['卯', '辰', '丑', '子']).map((item) => item.label)
  assert.deepEqual(relations, ['卯辰害', '子丑合', '子卯無禮之刑', '子辰半合水'])
  assert.equal(relations.includes('辰辰自刑'), false)
  assert.equal(relations.includes('申子辰三合水局'), false)

  const chart = buildChartFromManual({ year: '丁卯', month: '甲辰', day: '癸丑', hour: '壬子' })
  assert.ok(chart)
  const liunian2026 = getLiunian(chart, 2026, 1)[0]
  assert.equal(liunian2026.pillar, '丙午')
  assert.equal(liunian2026.tenGod, '正財')
  assert.equal(liunian2026.summary.includes('金水喜用'), false)

  const liuyue2026 = getLiuyue(chart, 2026)
  assert.equal(liuyue2026[0].label, '正月')
  assert.equal(liuyue2026[0].pillar, '庚寅')
  assert.notEqual(liuyue2026[0].pillar, '己丑')

  assertThrowsMessage(() => getTenGod('A', '丁'), 'Invalid stem')
  assertThrowsMessage(() => getBranchHiddenStems('貓'), 'Invalid branch')
  assertThrowsMessage(() => getTenGod('', '丁'), 'Missing required input')

  console.log('tenGods verification passed')
} finally {
  await server.close()
}
