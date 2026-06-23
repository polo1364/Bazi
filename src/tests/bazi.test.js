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
  const { safeApplyAiNarrative, getSafePdfResult, validateAnalysisResult } = await server.ssrLoadModule('/src/lib/aiNarrativeSafety.ts')
  const { sanitizeAiNarrativeObject, sanitizeAiNarrativeText } = await server.ssrLoadModule('/src/lib/aiNarrativeSanitizer.ts')
  const { buildAiSafetyPrompt, buildChartContext } = await server.ssrLoadModule('/src/lib/aiNarrative.ts')
  const { buildChartFromManual, calculateBazi } = await server.ssrLoadModule('/src/lib/bazi.ts')
  const { analyzeBirth } = await server.ssrLoadModule('/src/lib/analysis.ts')
  const { getLuckDirection, buildLuckCycles, calculateLuckStart } = await server.ssrLoadModule('/src/lib/luckCycleEngine.js')
  const { getSolarTermsAroundBirth } = await server.ssrLoadModule('/src/lib/solarTermAdapter.js')
  const {
    calculateMeanSolarTime, calculateEquationOfTime, calculateTrueSolarTime, comparePillarsBeforeAfterCorrection,
  } = await server.ssrLoadModule('/src/lib/solarTimeEngine.js')
  const { getKangxiStroke } = await server.ssrLoadModule('/src/lib/name/kangxiStrokes.ts')
  const {
    calculateNameStrokes,
    calculateWuge: calculateVerifiedNameWuge,
    analyzeNameFortune,
  } = await server.ssrLoadModule('/src/lib/name/nameWugeEngine.ts')
  const { getWuge81Fortune, analyzeWugeFortune } = await server.ssrLoadModule('/src/lib/name/wugeFortuneEngine.ts')
  const { getNumberElement, getSancaiElements, analyzeSancai } = await server.ssrLoadModule('/src/lib/name/sancaiEngine.ts')
  const { WUGE_81_TABLE } = await server.ssrLoadModule('/src/lib/name/wuge81Table.ts')
  const {
    getBranchGroup, findBranchMatches, findStemMatches, getJiaXun, getSeasonByMonthBranch, analyzeTianShe, analyzeYuanChen, analyzeDaHaoAlias, analyzeShensha,
  } = await server.ssrLoadModule('/src/lib/shensha/shenshaEngine.ts')
  const {
    calculateDayMasterStrengthV2, analyzeLingDiShi, analyzeRoots, analyzeStemSupport,
    classifyForces, deriveUsefulGodsV2, analyzePatternTendency, getSeasonalStrength,
  } = await server.ssrLoadModule('/src/lib/strength/strengthV2Engine.ts')
  const {
    analyzeFortuneV2, analyzeLuckCycleImpact, analyzeYearImpact, analyzeMonthImpact,
    scoreFortuneImpact, buildYearFortuneSummary,
  } = await server.ssrLoadModule('/src/lib/fortune/fortuneV2Engine.ts')

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

  // 神煞公式化第一階段：共用工具與範例命盤
  assert.equal(getBranchGroup('卯'), '亥卯未')
  assert.equal(getBranchGroup('丑'), '巳酉丑')
  assert.equal(getBranchGroup('子'), '申子辰')
  assert.deepEqual(
    findBranchMatches(['卯', '巳'], { year: '卯', month: '辰', day: '丑', hour: '子' }),
    [{ pillar: 'year', branch: '卯' }],
  )
  assert.deepEqual(
    findStemMatches(['壬'], { year: '丁', month: '甲', day: '癸', hour: '壬' }),
    [{ pillar: 'hour', stem: '壬' }],
  )
  const sampleShensha = analyzeShensha({
    dayStem: '癸',
    dayPillar: '癸丑',
    yearStem: '丁',
    monthBranch: '辰',
    branches: { year: '卯', month: '辰', day: '丑', hour: '子' },
    stems: { year: '丁', month: '甲', day: '癸', hour: '壬' },
    pillars: { year: '丁卯', month: '甲辰', day: '癸丑', hour: '壬子' },
  })
  const shenshaByName = Object.fromEntries(sampleShensha.items.map((item) => [item.name, item]))
  assert.equal(shenshaByName['天乙貴人'].status, '成立')
  assert.deepEqual(shenshaByName['天乙貴人'].targetBranches, ['卯', '巳'])
  assert.ok(shenshaByName['天乙貴人'].matchedBranches.some((m) => m.pillar === 'year' && m.branch === '卯'))
  assert.equal(shenshaByName['文昌貴人'].status, '成立')
  assert.deepEqual(shenshaByName['文昌貴人'].targetBranches, ['卯'])
  assert.ok(shenshaByName['文昌貴人'].matchedBranches.some((m) => m.pillar === 'year' && m.branch === '卯'))
  assert.equal(shenshaByName['桃花'].status, '成立')
  assert.ok(shenshaByName['桃花'].description.includes('年支卯屬亥卯未組，桃花在子'))
  assert.ok(shenshaByName['桃花'].matchedBranches.some((m) => m.pillar === 'hour' && m.branch === '子'))
  assert.equal(shenshaByName['華蓋'].status, '成立')
  assert.ok(shenshaByName['華蓋'].description.includes('日支丑屬巳酉丑組，華蓋在丑'))
  assert.ok(shenshaByName['華蓋'].matchedBranches.some((m) => m.pillar === 'day' && m.branch === '丑'))
  assert.equal(shenshaByName['將星'].status, '成立')
  assert.ok(shenshaByName['將星'].description.includes('年支卯屬亥卯未組，將星在卯'))
  assert.ok(shenshaByName['將星'].matchedBranches.some((m) => m.pillar === 'year' && m.branch === '卯'))
  assert.equal(shenshaByName['驛馬'].status, '不成立')
  assert.equal(shenshaByName['驛馬'].matchedBranches.length, 0)
  assert.equal(shenshaByName['紅鸞'].status, '成立')
  assert.deepEqual(shenshaByName['紅鸞'].targetBranches, ['子'])
  assert.ok(shenshaByName['紅鸞'].matchedBranches.some((m) => m.pillar === 'hour' && m.branch === '子'))
  assert.equal(shenshaByName['天喜'].status, '不成立')
  assert.deepEqual(shenshaByName['天喜'].targetBranches, ['午'])
  assert.equal(shenshaByName['天喜'].matchedBranches.length, 0)
  assert.equal(shenshaByName['天德貴人'].status, '成立')
  assert.deepEqual(shenshaByName['天德貴人'].targetStems, ['壬'])
  assert.ok(shenshaByName['天德貴人'].matchedPillars.some((m) => m.pillar === 'hour' && m.stem === '壬'))
  assert.equal(shenshaByName['月德貴人'].status, '成立')
  assert.deepEqual(shenshaByName['月德貴人'].targetStems, ['壬'])
  assert.ok(shenshaByName['月德貴人'].matchedPillars.some((m) => m.pillar === 'hour' && m.stem === '壬'))
  assert.equal(shenshaByName['福星貴人'].status, '成立')
  assert.deepEqual(shenshaByName['福星貴人'].targetBranches.dayStem, ['卯', '丑'])
  assert.ok(shenshaByName['福星貴人'].matchedPillars.some((m) => m.basis === 'dayStem' && m.pillar === 'year' && m.branch === '卯'))
  assert.ok(shenshaByName['福星貴人'].matchedPillars.some((m) => m.basis === 'dayStem' && m.pillar === 'day' && m.branch === '丑'))
  assert.equal(shenshaByName['祿神'].status, '成立')
  assert.deepEqual(shenshaByName['祿神'].targetBranches, ['子'])
  assert.ok(shenshaByName['祿神'].matchedPillars.some((m) => m.pillar === 'hour' && m.branch === '子'))
  assert.ok(['不適用', '不成立'].includes(shenshaByName['羊刃'].status))
  assert.equal(shenshaByName['羊刃'].found, false)
  assert.ok(shenshaByName['羊刃'].description.includes('陽干羊刃版'))
  assert.equal(shenshaByName['學堂'].status, '成立')
  assert.deepEqual(shenshaByName['學堂'].targetBranches, ['卯'])
  assert.ok(shenshaByName['學堂'].matchedPillars.some((m) => m.pillar === 'year' && m.branch === '卯'))
  assert.equal(getJiaXun('癸丑').xun, '甲辰')
  assert.deepEqual(getJiaXun('癸丑').kongWang, ['寅', '卯'])
  assert.deepEqual(getJiaXun('甲子'), { xun: '甲子', kongWang: ['戌', '亥'] })
  assert.deepEqual(getJiaXun('癸酉'), { xun: '甲子', kongWang: ['戌', '亥'] })
  assert.equal(shenshaByName['空亡'].status, '成立')
  assert.equal(shenshaByName['空亡'].xun, '甲辰')
  assert.deepEqual(shenshaByName['空亡'].targetBranches, ['寅', '卯'])
  assert.ok(shenshaByName['空亡'].matchedPillars.some((m) => m.pillar === 'year' && m.branch === '卯'))
  assert.equal(shenshaByName['孤辰'].status, '不成立')
  assert.equal(shenshaByName['孤辰'].matchedPillars.length, 0)
  assert.equal(shenshaByName['寡宿'].status, '成立')
  assert.deepEqual(shenshaByName['寡宿'].targetBranches.yearBranch, ['丑'])
  assert.ok(shenshaByName['寡宿'].matchedPillars.some((m) => m.basis === 'yearBranch' && m.pillar === 'day' && m.branch === '丑'))
  assert.equal(shenshaByName['亡神'].status, '不成立')
  assert.equal(shenshaByName['亡神'].matchedPillars.length, 0)
  assert.equal(shenshaByName['劫煞'].status, '不成立')
  assert.equal(shenshaByName['劫煞'].matchedPillars.length, 0)
  assert.equal(shenshaByName['災煞'].status, '成立')
  assert.deepEqual(shenshaByName['災煞'].targetBranches.dayBranch, ['卯'])
  assert.ok(shenshaByName['災煞'].matchedPillars.some((m) => m.basis === 'dayBranch' && m.pillar === 'year' && m.branch === '卯'))
  assert.equal(getSeasonByMonthBranch('辰'), '春')
  assert.equal(getSeasonByMonthBranch('巳'), '夏')
  assert.equal(getSeasonByMonthBranch('申'), '秋')
  assert.equal(getSeasonByMonthBranch('子'), '冬')
  assert.equal(shenshaByName['天赦'].status, '不成立')
  assert.deepEqual(shenshaByName['天赦'].targetPillars, ['戊寅'])
  const tianSheHit = analyzeTianShe({ monthBranch: '辰', dayPillar: '戊寅' })
  assert.equal(tianSheHit.status, '成立')
  assert.ok(tianSheHit.matchedPillars.some((m) => m.pillar === 'day'))
  const yuanChenSample = analyzeYuanChen({
    yearStem: '丁',
    yearBranch: '卯',
    gender: 'male',
    branches: { year: '卯', month: '辰', day: '丑', hour: '子' },
  })
  assert.equal(yuanChenSample.status, '不成立')
  assert.deepEqual(yuanChenSample.targetBranches, ['申'])
  assert.equal(yuanChenSample.matchedPillars.length, 0)
  const yuanChenHit = analyzeYuanChen({
    yearStem: '丁',
    yearBranch: '卯',
    gender: 'male',
    branches: { year: '卯', month: '申', day: '丑', hour: '子' },
  })
  assert.equal(yuanChenHit.status, '成立')
  assert.ok(yuanChenHit.matchedPillars.some((m) => m.pillar === 'month' && m.branch === '申'))
  const yuanChenFemale = analyzeYuanChen({
    yearStem: '丁',
    yearBranch: '卯',
    gender: 'female',
    branches: { year: '卯', month: '辰', day: '丑', hour: '子' },
  })
  assert.deepEqual(yuanChenFemale.targetBranches, ['戌'])
  const yuanChenMissingGender = analyzeYuanChen({
    yearStem: '丁',
    yearBranch: '卯',
    gender: null,
    branches: { year: '卯', month: '辰', day: '丑', hour: '子' },
  })
  assert.equal(yuanChenMissingGender.status, '尚未驗證')
  assert.equal(yuanChenMissingGender.verified, false)
  assert.equal(yuanChenMissingGender.reason, '缺少 gender')
  const daHao = analyzeDaHaoAlias()
  assert.equal(daHao.status, '別名')
  assert.ok(daHao.description.includes('元辰別名'))
  assert.deepEqual(daHao.targetBranches, [])
  assert.equal(sampleShensha.unverified.some((item) => ['天赦以外其他擇日神煞', '咸池延伸版本', '孤辰寡宿其他流派版本'].includes(item.name)), false)

  // 完整旺衰模型 v2：範例命盤 丁卯 甲辰 癸丑 壬子
  const strengthV2Input = {
    pillars: {
      year: { stem: '丁', branch: '卯' },
      month: { stem: '甲', branch: '辰' },
      day: { stem: '癸', branch: '丑' },
      hour: { stem: '壬', branch: '子' },
    },
    dayStem: '癸',
    monthBranch: '辰',
    hiddenStems: {
      year: [{ stem: '乙', qi: '主氣', tenGod: '食神' }],
      month: [
        { stem: '戊', qi: '主氣', tenGod: '正官' },
        { stem: '乙', qi: '中氣', tenGod: '食神' },
        { stem: '癸', qi: '餘氣', tenGod: '比肩' },
      ],
      day: [
        { stem: '己', qi: '主氣', tenGod: '七殺' },
        { stem: '癸', qi: '中氣', tenGod: '比肩' },
        { stem: '辛', qi: '餘氣', tenGod: '偏印' },
      ],
      hour: [{ stem: '癸', qi: '主氣', tenGod: '比肩' }],
    },
  }
  // 月令旺衰表：癸水生辰月為墓（水庫）
  assert.equal(getSeasonalStrength('水', '辰'), '墓')
  // 測試一：身強弱等級
  const sv2 = calculateDayMasterStrengthV2(strengthV2Input)
  assert.ok(sv2.label.includes('中和偏弱') || sv2.label.includes('身偏弱'), `label 應含中和偏弱或身偏弱，實際：${sv2.label}`)
  assert.equal(sv2.confidence, '中')
  // 測試二：得令（不得令但有餘氣 / 庫根）
  assert.ok(sv2.deLing.reason.includes('不得令'))
  assert.ok(sv2.deLing.reason.includes('餘氣') || sv2.deLing.reason.includes('庫根'))
  // 測試三：通根（時支子強根、辰藏癸、丑藏癸）
  assert.ok(sv2.roots.roots.some((r) => r.pillar === 'hour' && r.strength.includes('強根')))
  assert.ok(sv2.roots.roots.some((r) => r.pillar === 'month' && r.hiddenStem === '癸'))
  assert.ok(sv2.roots.roots.some((r) => r.pillar === 'day' && r.hiddenStem === '癸'))
  // 測試四：生扶剋洩耗分類
  assert.ok(sv2.stemSupport.supportStems.some((s) => s.stem === '壬'))
  assert.ok(sv2.stemSupport.drainStems.some((s) => s.stem === '甲'))
  assert.ok(sv2.forces.output.some((o) => o.stem === '乙'))
  assert.ok(sv2.forces.control.some((c) => c.stem === '戊'))
  assert.ok(sv2.forces.control.some((c) => c.stem === '己'))
  assert.ok(sv2.forces.wealth.some((w) => w.stem === '丁'))
  assert.ok(sv2.forces.resource.some((r) => r.stem === '辛'))
  // 測試五：喜用神 v2（金、水），金的依據需提到金弱、可生水
  assert.ok(sv2.usefulGods.useful.includes('金'))
  assert.ok(sv2.usefulGods.useful.includes('水'))
  const goldPriority = sv2.usefulGods.priority.find((p) => p.element === '金')
  assert.ok(goldPriority && goldPriority.reason.includes('金弱'))
  assert.ok(goldPriority && goldPriority.reason.includes('生水'))
  // 測試六：忌神 v2（土、火、木）
  const avoidEls = sv2.usefulGods.avoid.map((a) => a.element)
  assert.ok(avoidEls.includes('土'))
  assert.ok(avoidEls.includes('火'))
  assert.ok(avoidEls.includes('木'))
  // 測試七：格局傾向（正官格傾向／傷官見官，非純正官格）
  const pt = analyzePatternTendency({ dayStem: '癸', monthBranch: '辰', monthStem: '甲', hiddenStems: strengthV2Input.hiddenStems })
  assert.ok(pt.patternLabel.includes('正官格傾向'))
  assert.ok(pt.patternLabel.includes('傷官見官'))
  assert.equal(pt.patternLabel.includes('純正官格'), false)
  assert.ok(pt.reasons.some((r) => r.includes('傷官') && r.includes('透出')))
  // analyzeLingDiShi / analyzeRoots / analyzeStemSupport / classifyForces 可單獨呼叫
  const lds = analyzeLingDiShi({ dayStem: '癸', dayElement: '水', monthBranch: '辰', pillars: strengthV2Input.pillars, hiddenStems: strengthV2Input.hiddenStems })
  assert.equal(lds.deDi.status, '得地')
  const rootsOnly = analyzeRoots('癸', strengthV2Input.hiddenStems)
  assert.equal(rootsOnly.roots.length, 3)
  const stemOnly = analyzeStemSupport('癸', strengthV2Input.pillars)
  assert.ok(stemOnly.supportStems.some((s) => s.stem === '壬'))
  const forcesOnly = classifyForces({ dayStem: '癸', pillars: strengthV2Input.pillars, monthBranch: '辰', hiddenStems: strengthV2Input.hiddenStems })
  assert.ok(forcesOnly.summary.controlScore > 0)
  const usefulOnly = deriveUsefulGodsV2(sv2)
  assert.ok(usefulOnly.useful.includes('金'))

  // 測試八：reportValidator 攔截旺衰絕對化
  for (const text of ['此命為純正官格。', '喜用神絕對為金水。', '身弱必發不了財。', '身強必富。']) {
    const result = validateReport({}, text)
    assert.equal(result.valid, false, `${text} 應被旺衰絕對化規則攔截`)
  }
  // 測試九：reportValidator 允許保守旺衰文案
  const sv2Allow1 = validateReport({}, '格局為正官格傾向，但月干傷官透出，需兼看傷官見官。')
  assert.equal(sv2Allow1.valid, true, `正官格傾向說明不應被攔截：${sv2Allow1.errors.join('；')}`)
  const sv2Allow2 = validateReport({}, '系統初判喜用金、水，仍需搭配大運流年。')
  assert.equal(sv2Allow2.valid, true, `喜用金水保守說明不應被攔截：${sv2Allow2.errors.join('；')}`)
  const sv2Allow3 = validateReport({ strength: { reasons: ['辰月不得令但有庫根'] } }, '身強弱為中和偏弱或身偏弱，可信度中，並列出得令、得地、得勢依據。')
  assert.equal(sv2Allow3.valid, true, `身強弱保守說明不應被攔截：${sv2Allow3.errors.join('；')}`)
  // 測試十：sanitizer 將純正官格改為正官格傾向
  const sanitizedPattern = sanitizeAiNarrativeText('此命為純正官格，喜用神絕對為金水。')
  assert.ok(sanitizedPattern.includes('正官格傾向'))
  assert.equal(sanitizedPattern.includes('純正官格'), false)
  assert.ok(sanitizedPattern.includes('系統初判喜用金、水'))

  // 歲運解讀 v2：大運 × 流年 × 流月聯動分析
  const fortuneNatal = {
    pillars: {
      year: { stem: '丁', branch: '卯' },
      month: { stem: '甲', branch: '辰' },
      day: { stem: '癸', branch: '丑' },
      hour: { stem: '壬', branch: '子' },
    },
    dayStem: '癸',
    dayElement: '水',
  }
  const fortuneStrengthV2 = {
    label: '中和偏弱',
    useful: ['金', '水'],
    avoid: ['土', '火', '木'],
    patternLabel: '正官格傾向 / 傷官見官',
    confidence: '中',
  }
  const fortuneLuck = { pillar: '辛丑', stem: '辛', branch: '丑', ageRange: '28-37', stemTenGod: '偏印' }
  const fortuneYear = { year: 2026, pillar: '丙午', stem: '丙', branch: '午', stemTenGod: '正財' }
  const fortuneMonths = [
    { monthLabel: '正月', month: 1, pillar: '庚寅', stem: '庚', branch: '寅' },
    { monthLabel: '二月', month: 2, pillar: '辛卯', stem: '辛', branch: '卯' },
    { monthLabel: '三月', month: 3, pillar: '壬辰', stem: '壬', branch: '辰' },
    { monthLabel: '四月', month: 4, pillar: '癸巳', stem: '癸', branch: '巳' },
    { monthLabel: '五月', month: 5, pillar: '甲午', stem: '甲', branch: '午' },
    { monthLabel: '六月', month: 6, pillar: '乙未', stem: '乙', branch: '未' },
    { monthLabel: '七月', month: 7, pillar: '丙申', stem: '丙', branch: '申' },
    { monthLabel: '八月', month: 8, pillar: '丁酉', stem: '丁', branch: '酉' },
    { monthLabel: '九月', month: 9, pillar: '戊戌', stem: '戊', branch: '戌' },
    { monthLabel: '十月', month: 10, pillar: '己亥', stem: '己', branch: '亥' },
    { monthLabel: '冬月', month: 11, pillar: '庚子', stem: '庚', branch: '子' },
    { monthLabel: '臘月', month: 12, pillar: '辛丑', stem: '辛', branch: '丑' },
  ]

  // 大運辛丑：偏印金扶身 + 丑土壓力
  const lcImpact = analyzeLuckCycleImpact({ natal: fortuneNatal, strengthV2: fortuneStrengthV2, luckCycle: fortuneLuck })
  assert.ok(lcImpact.helpfulFactors.some((f) => f.includes('辛') && (f.includes('扶') || f.includes('喜用'))))
  assert.ok(lcImpact.pressureFactors.some((f) => f.includes('丑') || f.includes('土')))

  // 測試一：流年 2026 丙午
  const yImpact = analyzeYearImpact({ natal: fortuneNatal, strengthV2: fortuneStrengthV2, luckCycleImpact: lcImpact, year: fortuneYear })
  assert.ok(yImpact.theme.includes('財星'), `流年主題應含財星，實際：${yImpact.theme}`)
  assert.ok(yImpact.riskFactors.some((f) => f.includes('耗身') || f.includes('壓力')))
  assert.equal(yImpact.conclusion.includes('必定發財'), false)
  // 測試二：2026 丙午不得被判為金水喜用之年
  assert.equal(yImpact.theme.includes('金水喜用'), false)
  assert.equal(yImpact.conclusion.includes('金水喜用之年'), false)
  assert.ok(yImpact.theme.includes('財星'))

  // 測試三：五月甲午木火偏旺 / 洩耗加重
  const mayImpact = analyzeMonthImpact({ natal: fortuneNatal, strengthV2: fortuneStrengthV2, yearImpact: yImpact, month: fortuneMonths[4], luckCycleImpact: lcImpact })
  assert.ok(mayImpact.theme.includes('木火') && mayImpact.theme.includes('洩耗'), `五月主題應為木火偏旺洩耗加重，實際：${mayImpact.theme}`)

  // 測試四：正月應是庚寅，不得是己丑
  assert.equal(fortuneMonths[0].pillar, '庚寅')
  const realLiuyue = getSolarTermFlowMonths(chartFromLunar, 2026)
  const realZheng = realLiuyue.find((m) => m.label === '正月')
  assert.equal(realZheng.pillar, '庚寅')
  assert.notEqual(realZheng.pillar, '己丑')

  // 測試五：scoreFortuneImpact 對 2026 丙午不得給「大吉」或「必然有利」
  assert.equal(['偏有利', '平穩', '機會與壓力並存', '壓力偏高'].includes(yImpact.score.level), true)
  assert.equal(yImpact.score.level === '偏有利', false, `2026 丙午身偏弱遇財不應為偏有利，實際：${yImpact.score.level}（${yImpact.score.score}）`)

  // analyzeFortuneV2 主入口整合
  const fortuneV2 = analyzeFortuneV2({ natal: fortuneNatal, strengthV2: fortuneStrengthV2, luckCycle: fortuneLuck, year: fortuneYear, months: fortuneMonths })
  assert.equal(fortuneV2.monthImpacts.length, 12)
  assert.ok(fortuneV2.yearImpact.luckCycleModifier.some((f) => f.includes('辛丑')))
  assert.ok(fortuneV2.yearSummary.summary.includes('辛丑'))
  assert.ok(!/必定發財|必定破財|必有災|一定升遷/.test(JSON.stringify(fortuneV2)))

  // 測試六：reportValidator 必須攔截歲運絕對化文案
  for (const text of ['2026金水喜用之年', '必定發財', '一定升遷', '必有災', '身弱不能賺錢', '流月正月己丑']) {
    const r = validateReport({}, text)
    assert.equal(r.valid, false, `${text} 應被歲運規則攔截`)
  }
  // 測試七：reportValidator 必須允許保守歲運文案
  const fAllow1 = validateReport({}, '2026 丙午為火旺財星之年，財務機會與耗身壓力並存。')
  assert.equal(fAllow1.valid, true, `允許句一不應被攔截：${fAllow1.errors.join('；')}`)
  const fAllow2 = validateReport({}, '五月甲午木火偏旺，對中和偏弱癸水而言洩耗較重。')
  assert.equal(fAllow2.valid, true, `允許句二不應被攔截：${fAllow2.errors.join('；')}`)
  const fAllow3 = validateReport({}, '正月庚寅，庚金有印星支持，但寅木也帶來輸出與洩身。')
  assert.equal(fAllow3.valid, true, `允許句三不應被攔截：${fAllow3.errors.join('；')}`)

  // 測試八：sanitizer 將必定發財、一定升遷改為保守說法
  const fSan = sanitizeAiNarrativeText('今年必定發財，明年一定升遷。')
  assert.equal(fSan.includes('必定發財'), false)
  assert.equal(fSan.includes('一定升遷'), false)
  assert.ok(fSan.includes('財務仍需依實際條件判斷'))
  assert.ok(fSan.includes('事業機會增加'))

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
  const r5Ai = validateReport({}, '2026 丙午為金水喜用之年，喜用神到位。')
  assert.equal(r5Ai.valid, false)
  assert.ok(r5Ai.errors.some((e) => e.includes('金水')))
  const r5Wealth = validateReport({}, '丙午流年大利金水。')
  assert.equal(r5Wealth.valid, false)
  assert.ok(r5Wealth.errors.some((e) => e.includes('金水')))
  const r5Arrive = validateReport({}, '2026 丙午喜用神到位。')
  assert.equal(r5Arrive.valid, false)
  assert.ok(r5Arrive.errors.some((e) => e.includes('金水')))

  // 5b. 命局喜用金水是合法描述，不得因全文同時出現 2026 丙午而誤判
  const r5Allowed1 = validateReport({}, '命局喜用：金、水。2026 丙午為火旺財星之年。')
  assert.equal(r5Allowed1.valid, true, `命局喜用金水不應被誤判：${r5Allowed1.errors.join('；')}`)
  const r5Allowed2 = validateReport({}, '癸水日主身偏弱，喜用金、水來生扶。2026年丙午，正財透出，財星明顯。')
  assert.equal(r5Allowed2.valid, true, `喜用金、水與丙午正財分句不應被誤判：${r5Allowed2.errors.join('；')}`)
  const r5Allowed3 = validateReport({}, '2026 丙午為火旺財星之年，若命局喜用金水，仍需注意火旺耗身。')
  assert.equal(r5Allowed3.valid, true, `合法保守說法不應被誤判：${r5Allowed3.errors.join('；')}`)

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
  const r7AbsoluteHongLuan = validateReport({ shenshaImplemented: true, shensha: { items: [{ name: '紅鸞', verified: true }] } }, '紅鸞星入命，必定婚喜。')
  assert.equal(r7AbsoluteHongLuan.valid, false)
  const r7AbsoluteTianXi = validateReport({ shenshaImplemented: true, shensha: { items: [{ name: '天喜', verified: true }] } }, '天喜必有喜事。')
  assert.equal(r7AbsoluteTianXi.valid, false)
  const r7AbsoluteDe = validateReport({ shenshaImplemented: true, shensha: { items: [{ name: '天德貴人', verified: true }, { name: '月德貴人', verified: true }] } }, '天德月德保證逢凶化吉。')
  assert.equal(r7AbsoluteDe.valid, false)
  const r7AbsoluteGeneric = validateReport({ shenshaImplemented: true, shensha: { items: [] } }, '保證逢凶化吉。')
  assert.equal(r7AbsoluteGeneric.valid, false)
  const r7FuXing = validateReport({ shenshaImplemented: true, shensha: { items: [] } }, '福星貴人成立。')
  assert.equal(r7FuXing.valid, false)
  const r7ThirdBatchAbs = [
    '福星貴人必定富貴。',
    '祿神必定有財。',
    '羊刃必有血光。',
    '學堂必定高學歷。',
    '空亡必定失敗。',
    '必定富貴。',
    '必有血光。',
    '凶煞聚集。',
    '命帶寡宿必孤。',
    '寡宿必婚姻不順。',
    '亡神必定不好。',
    '劫煞必定破財。',
    '災煞必有血光。',
    '天赦一定逢凶化吉。',
    '必定孤獨。',
    '必定破財。',
    '元辰必定不好。',
    '命帶元辰必有災。',
    '大耗必定破財。',
    '大耗必破財。',
    '咸池必桃花劫。',
    '桃花必定感情亂。',
    '必有災。',
    '必破財。',
  ]
  for (const text of r7ThirdBatchAbs) {
    const result = validateReport({ shenshaImplemented: true, shensha: { items: [
      { name: '福星貴人', verified: true },
      { name: '祿神', verified: true },
      { name: '羊刃', verified: true },
      { name: '學堂', verified: true },
      { name: '空亡', verified: true },
      { name: '孤辰', verified: true },
      { name: '寡宿', verified: true },
      { name: '亡神', verified: true },
      { name: '劫煞', verified: true },
      { name: '災煞', verified: true },
      { name: '天赦', verified: true },
      { name: '元辰', verified: true },
      { name: '大耗', verified: true },
    ] } }, text)
    assert.equal(result.valid, false, `${text} 應被神煞絕對化規則攔截`)
  }
  const r7AllowedHongLuan = validateReport({ shenshaImplemented: true, shensha: { items: [{ name: '紅鸞', verified: true }] } }, '紅鸞成立，年支卯查紅鸞在子，時支子命中。')
  assert.equal(r7AllowedHongLuan.valid, true, `紅鸞保守查法說明不應被攔截：${r7AllowedHongLuan.errors.join('；')}`)
  const r7AllowedTianXi = validateReport({ shenshaImplemented: true, shensha: { items: [{ name: '天喜', verified: true }] } }, '天喜不成立，年支卯查天喜在午，四支未見午。')
  assert.equal(r7AllowedTianXi.valid, true, `天喜不成立查法說明不應被攔截：${r7AllowedTianXi.errors.join('；')}`)
  const r7AllowedTianDe = validateReport({ shenshaImplemented: true, shensha: { items: [{ name: '天德貴人', verified: true }] } }, '天德貴人成立，月支辰查天德在壬，時干壬命中。')
  assert.equal(r7AllowedTianDe.valid, true, `天德查法說明不應被攔截：${r7AllowedTianDe.errors.join('；')}`)
  const r7AllowedYueDe = validateReport({ shenshaImplemented: true, shensha: { items: [{ name: '月德貴人', verified: true }] } }, '月德貴人成立，月支辰查月德在壬，時干壬命中。')
  assert.equal(r7AllowedYueDe.valid, true, `月德查法說明不應被攔截：${r7AllowedYueDe.errors.join('；')}`)
  const thirdBatchItems = [
    { name: '福星貴人', verified: true },
    { name: '祿神', verified: true },
    { name: '羊刃', verified: true },
    { name: '學堂', verified: true },
    { name: '空亡', verified: true },
    { name: '孤辰', verified: true },
    { name: '寡宿', verified: true },
    { name: '亡神', verified: true },
    { name: '劫煞', verified: true },
    { name: '災煞', verified: true },
    { name: '天赦', verified: true },
    { name: '元辰', verified: true },
    { name: '大耗', verified: true },
  ]
  const r7AllowedFu = validateReport({ shenshaImplemented: true, shensha: { items: thirdBatchItems } }, '福星貴人成立，日干癸查卯、丑，年支卯與日支丑命中。')
  assert.equal(r7AllowedFu.valid, true, `福星查法說明不應被攔截：${r7AllowedFu.errors.join('；')}`)
  const r7AllowedLu = validateReport({ shenshaImplemented: true, shensha: { items: thirdBatchItems } }, '祿神成立，日干癸查祿在子，時支子命中。')
  assert.equal(r7AllowedLu.valid, true, `祿神查法說明不應被攔截：${r7AllowedLu.errors.join('；')}`)
  const r7AllowedRen = validateReport({ shenshaImplemented: true, shensha: { items: thirdBatchItems } }, '羊刃不適用，本系統採陽干羊刃版，日干癸為陰干。')
  assert.equal(r7AllowedRen.valid, true, `羊刃不適用說明不應被攔截：${r7AllowedRen.errors.join('；')}`)
  const r7AllowedXueTang = validateReport({ shenshaImplemented: true, shensha: { items: thirdBatchItems } }, '學堂成立，本系統採子平日干長生版，日干癸查學堂在卯，年支卯命中。')
  assert.equal(r7AllowedXueTang.valid, true, `學堂查法說明不應被攔截：${r7AllowedXueTang.errors.join('；')}`)
  const r7AllowedKongWang = validateReport({ shenshaImplemented: true, shensha: { items: thirdBatchItems } }, '空亡成立，日柱癸丑屬甲辰旬，旬空寅、卯，年支卯命中。')
  assert.equal(r7AllowedKongWang.valid, true, `空亡查法說明不應被攔截：${r7AllowedKongWang.errors.join('；')}`)
  const r7AllowedGuaSu = validateReport({ shenshaImplemented: true, shensha: { items: thirdBatchItems } }, '寡宿成立，年支卯查寡宿在丑，日支丑命中。')
  assert.equal(r7AllowedGuaSu.valid, true, `寡宿查法說明不應被攔截：${r7AllowedGuaSu.errors.join('；')}`)
  const r7AllowedGuChen = validateReport({ shenshaImplemented: true, shensha: { items: thirdBatchItems } }, '孤辰不成立，年支卯查巳、日支丑查寅，四支未命中。')
  assert.equal(r7AllowedGuChen.valid, true, `孤辰不成立說明不應被攔截：${r7AllowedGuChen.errors.join('；')}`)
  const r7AllowedZaiSha = validateReport({ shenshaImplemented: true, shensha: { items: thirdBatchItems } }, '災煞成立，日支丑查災煞在卯，年支卯命中。')
  assert.equal(r7AllowedZaiSha.valid, true, `災煞查法說明不應被攔截：${r7AllowedZaiSha.errors.join('；')}`)
  const r7AllowedTianShe = validateReport({ shenshaImplemented: true, shensha: { items: thirdBatchItems } }, '天赦不成立，月支辰屬春，春季天赦為戊寅，日柱癸丑未命中。')
  assert.equal(r7AllowedTianShe.valid, true, `天赦查法說明不應被攔截：${r7AllowedTianShe.errors.join('；')}`)
  const r7AllowedYuanChen = validateReport({ shenshaImplemented: true, shensha: { items: thirdBatchItems } }, '元辰不成立，年支卯依陰男陽女表查元辰在申，四支未見申。')
  assert.equal(r7AllowedYuanChen.valid, true, `元辰查法說明不應被攔截：${r7AllowedYuanChen.errors.join('；')}`)
  const r7AllowedDaHao = validateReport({ shenshaImplemented: true, shensha: { items: thirdBatchItems } }, '大耗於本系統視為元辰別名，不另立獨立判斷。')
  assert.equal(r7AllowedDaHao.valid, true, `大耗別名說明不應被攔截：${r7AllowedDaHao.errors.join('；')}`)
  const r7AllowedXianChi = validateReport({ shenshaImplemented: true, shensha: { items: thirdBatchItems } }, '咸池於本系統視為桃花系統的別稱或延伸，本階段以桃花公式呈現。')
  assert.equal(r7AllowedXianChi.valid, true, `咸池版本說明不應被攔截：${r7AllowedXianChi.errors.join('；')}`)
  const r7AllowedGuChenVersion = validateReport({ shenshaImplemented: true, shensha: { items: thirdBatchItems } }, '孤辰寡宿存在不同流派查法；本系統目前採用已測試版本。')
  assert.equal(r7AllowedGuChenVersion.valid, true, `孤辰寡宿版本說明不應被攔截：${r7AllowedGuChenVersion.errors.join('；')}`)

  // 8. 姓名未校驗不得五格皆吉
  const r8 = validateReport({ nameStrokesVerified: false }, '姓名五格皆吉，無須更名。')
  assert.equal(r8.valid, false)
  const r8Ai = validateReport({ nameStrokesVerified: false }, '姓名五格皆吉，總格大吉。')
  assert.equal(r8Ai.valid, false)
  assert.ok(r8Ai.errors.some((e) => e.includes('姓名')))
  const r8Wuge = validateReport({ nameStrokesVerified: true, nameWuge: { verified: true }, wugeFortuneVerified: false }, '姓名五格皆吉，五格大吉，姓名大吉。')
  assert.equal(r8Wuge.valid, false)
  assert.ok(r8Wuge.errors.some((e) => e.includes('81 數理')))
  const r8Sancai = validateReport({ nameStrokesVerified: true, nameWuge: { verified: true }, wugeFortuneVerified: false, sancaiVerified: false }, '三才平和，配置良好。')
  assert.equal(r8Sancai.valid, false)
  assert.ok(r8Sancai.errors.some((e) => e.includes('三才')))
  const r8Absolute1 = validateReport({ wugeFortune: { verified: true }, sancai: { verified: true } }, '姓名保證大吉，未來必定成功。')
  assert.equal(r8Absolute1.valid, false)
  assert.ok(r8Absolute1.errors.some((e) => e.includes('絕對化')))
  const r8Absolute2 = validateReport({ wugeFortune: { verified: true }, sancai: { verified: true } }, '此姓名必定發財，也必定婚姻不順。')
  assert.equal(r8Absolute2.valid, false)
  assert.ok(r8Absolute2.errors.some((e) => e.includes('絕對化')))

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

  const sanitizedYearText = sanitizeAiNarrativeText('2026 丙午為金水喜用之年')
  assert.ok(sanitizedYearText.includes('火旺財星之年'))
  assert.equal(sanitizedYearText.includes('金水喜用之年'), false)

  const sanitizedYearVariantText = sanitizeAiNarrativeText('2026 丙午為金水為喜用之年')
  assert.equal(sanitizedYearVariantText.includes('金水為喜用之年'), false)
  assert.ok(sanitizedYearVariantText.includes('火旺財星之年'))

  const sanitizedNameText = sanitizeAiNarrativeText('姓名五格皆吉')
  assert.equal(sanitizedNameText, '姓名五格數值已計算，吉凶待校驗')
  assert.equal(sanitizedNameText.includes('姓名五格皆吉'), false)
  const sanitizedAbsoluteNameText = sanitizeAiNarrativeText('姓名保證大吉，必定發財，必定婚姻不順。')
  assert.ok(sanitizedAbsoluteNameText.includes('姓名學結果可作參考，仍需保守看待'))
  assert.ok(sanitizedAbsoluteNameText.includes('財務仍需依實際條件判斷'))
  assert.ok(sanitizedAbsoluteNameText.includes('感情議題宜保守看待'))
  assert.equal(sanitizedAbsoluteNameText.includes('姓名保證大吉'), false)
  const sanitizedShenshaText = sanitizeAiNarrativeText('吉神匯聚，凶煞聚集，紅鸞星入命，必定婚喜，天喜必有喜事，天德月德保證逢凶化吉，福星貴人必定富貴，祿神必定有財，羊刃必有血光，學堂必定高學歷，空亡必定失敗，命帶寡宿必孤，孤辰必孤，寡宿必婚姻不順，亡神必定不好，劫煞必定破財，災煞必有血光，天赦一定逢凶化吉，元辰必定不好，命帶元辰必有災，大耗必定破財，咸池必桃花劫，桃花必定感情亂，必破財。')
  assert.ok(sanitizedShenshaText.includes('已驗證神煞需逐項查看，不作總括吉凶定論'))
  assert.ok(sanitizedShenshaText.includes('紅鸞成立，但不作婚喜絕對定論'))
  assert.ok(sanitizedShenshaText.includes('天喜若成立，也僅作喜慶象徵參考'))
  assert.ok(sanitizedShenshaText.includes('天德、月德若成立，也僅作輔助參考'))
  assert.ok(sanitizedShenshaText.includes('福星貴人成立，但不作富貴絕對定論'))
  assert.ok(sanitizedShenshaText.includes('祿神成立，但財務仍需看原局與歲運'))
  assert.ok(sanitizedShenshaText.includes('羊刃即使成立，也不作血光絕對定論'))
  assert.ok(sanitizedShenshaText.includes('學堂成立可作學習象徵參考，不作學歷保證'))
  assert.ok(sanitizedShenshaText.includes('空亡需搭配原局與歲運判斷，不作失敗定論'))
  assert.ok(sanitizedShenshaText.includes('已驗證神煞需逐項查看，不作總括凶斷'))
  assert.ok(sanitizedShenshaText.includes('寡宿若成立，也僅作人際與情感議題的保守參考'))
  assert.ok(sanitizedShenshaText.includes('孤辰若成立，也不作孤獨絕對定論'))
  assert.ok(sanitizedShenshaText.includes('寡宿若成立，也不作婚姻絕對定論'))
  assert.ok(sanitizedShenshaText.includes('亡神若成立，也需搭配原局與歲運判斷'))
  assert.ok(sanitizedShenshaText.includes('劫煞若成立，也不作破財絕對定論'))
  assert.ok(sanitizedShenshaText.includes('災煞若成立，也僅作風險提示，不作血光定論'))
  assert.ok(sanitizedShenshaText.includes('天赦若成立，也僅作輔助參考，不作保證'))
  assert.ok(sanitizedShenshaText.includes('元辰若成立，也需搭配整體命局判斷'))
  assert.ok(sanitizedShenshaText.includes('元辰只作神煞命中提示，不作災禍定論'))
  assert.ok(sanitizedShenshaText.includes('大耗於本系統視為元辰別名，不作破財定論'))
  assert.ok(sanitizedShenshaText.includes('咸池已由桃花模組覆蓋，不作桃花劫絕對定論'))
  assert.ok(sanitizedShenshaText.includes('桃花只作人際魅力與感情議題提示，不作絕對定論'))
  assert.equal(sanitizedShenshaText.includes('吉神匯聚'), false)
  assert.equal(sanitizedShenshaText.includes('凶煞聚集'), false)
  assert.equal(sanitizedShenshaText.includes('必定婚喜'), false)
  assert.equal(sanitizedShenshaText.includes('保證逢凶化吉'), false)
  assert.equal(sanitizedShenshaText.includes('空亡必定失敗'), false)
  assert.equal(sanitizedShenshaText.includes('災煞必有血光'), false)
  assert.equal(sanitizedShenshaText.includes('大耗必定破財'), false)

  const sanitizedObject = sanitizeAiNarrativeObject({
    summary: '2026 丙午為金水喜用之年',
    topicAnalysis: {
      wealth: '姓名五格皆吉',
      year: '喜用金水之年',
    },
  })
  const sanitizedObjectText = JSON.stringify(sanitizedObject)
  assert.equal(sanitizedObjectText.includes('金水喜用之年'), false)
  assert.equal(sanitizedObjectText.includes('喜用金水之年'), false)
  assert.equal(sanitizedObjectText.includes('姓名五格皆吉'), false)
  assert.ok(sanitizedObject.summary.includes('火旺財星之年'))
  assert.ok(sanitizedObject.topicAnalysis.wealth.includes('姓名五格數值已計算，吉凶待校驗'))
  assert.ok(sanitizedObject.topicAnalysis.year.includes('火旺財星之年'))

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

  // safeApplyAiNarrative：AI 亂寫 2026 丙午為金水喜用之年時，清洗後可通過
  const safe3 = safeApplyAiNarrative({
    baseResult,
    aiNarrative: narrative('2026 丙午為金水喜用之年，整體大旺。'),
  })
  assert.equal(safe3.usedAi, true)
  assert.equal(safe3.wasSanitized, true)
  assert.equal(safe3.validatorErrors.length, 0)
  assert.ok(safe3.result.summary.includes('火旺財星之年'))
  assert.equal(safe3.result.summary.includes('金水喜用之年'), false)

  // safeApplyAiNarrative：AI 亂寫姓名五格皆吉時，清洗後可通過
  const safeName = safeApplyAiNarrative({
    baseResult,
    aiNarrative: narrative('姓名五格皆吉，總格大吉，有助財運穩定。'),
  })
  assert.equal(safeName.usedAi, true)
  assert.equal(safeName.wasSanitized, true)
  assert.equal(safeName.validatorErrors.length, 0)
  assert.equal(safeName.result.summary, safeName.sanitizedNarrative.summary)
  assert.notEqual(safeName.result.summary, baseResult.summary)
  assert.ok(safeName.result.summary.includes('姓名五格數值已計算，吉凶待校驗'))
  assert.equal(safeName.result.summary.includes('姓名五格皆吉'), false)

  // safeApplyAiNarrative：只改寫語氣且不違反規則時可以通過
  const safe4 = safeApplyAiNarrative({
    baseResult,
    aiNarrative: narrative('這份命盤以癸水日主為核心，解讀仍以規則引擎的十神、藏干、刑沖合害與流年流月結果為準。'),
  })
  assert.equal(safe4.usedAi, true)
  assert.equal(safe4.validatorErrors.length, 0)
  assert.notEqual(safe4.result.summary, baseResult.summary)

  // AI prompt：必須明列禁止詞、自我檢查與允許的保守改寫
  const safetyPrompt = buildAiSafetyPrompt()
  assert.ok(safetyPrompt.includes('金水喜用之年'))
  assert.ok(safetyPrompt.includes('姓名五格皆吉'))
  assert.ok(safetyPrompt.includes('火旺財星之年'))
  assert.ok(safetyPrompt.includes('姓名五格目前標示為待校驗'))
  assert.ok(safetyPrompt.includes('姓名筆畫與字五行尚待校驗，未輸出吉凶定論'))
  assert.ok(safetyPrompt.includes('你只能改寫語氣，不得新增命理結論'))
  assert.ok(safetyPrompt.includes('輸出前請逐字檢查'))

  const nameInput = { ...baseInput, name: '王小明' }
  const nameResult = analyzeBirth(nameInput)
  assert.ok(nameResult)
  const aiContext = buildChartContext(nameInput, nameResult)
  assert.ok(aiContext.includes('姓名五格】待校驗'))
  assert.equal(aiContext.includes('姓名五格皆吉'), false)
  assert.equal(aiContext.includes('五格大吉'), false)

  // PDF 匯出前：可清洗的 AI 錯詞必須使用清洗後版本，不輸出原始錯詞
  const sanitizablePdfResult = {
    ...baseResult,
    summary: '2026 丙午為金水喜用之年。姓名五格皆吉。',
  }
  const sanitizedPdf = getSafePdfResult({ result: sanitizablePdfResult, fallbackResult: baseResult })
  assert.equal(sanitizedPdf.usedFallback, false)
  assert.equal(sanitizedPdf.wasSanitized, true)
  assert.ok(sanitizedPdf.result.summary.includes('火旺財星之年'))
  assert.ok(sanitizedPdf.result.summary.includes('姓名五格數值已計算，吉凶待校驗'))
  assert.equal(sanitizedPdf.result.summary.includes('金水喜用之年'), false)
  assert.equal(sanitizedPdf.result.summary.includes('姓名五格皆吉'), false)

  // PDF 匯出前：清洗後仍不通過時必須使用規則引擎原文案
  const unsafePdfResult = {
    ...baseResult,
    summary: '命局見辰自刑，且2026 丙午為金水喜用之年。姓名五格皆吉。',
  }
  const safePdf = getSafePdfResult({ result: unsafePdfResult, fallbackResult: baseResult })
  assert.equal(safePdf.usedFallback, true)
  assert.equal(safePdf.result.summary, baseResult.summary)
  assert.ok(safePdf.validatorErrors.length >= 1)
  assert.equal(safePdf.result.summary.includes('金水喜用之年'), false)
  assert.equal(safePdf.result.summary.includes('姓名五格皆吉'), false)

  // validateAnalysisResult：不得把 validatorErrors / UI 狀態文字拿去驗證
  const fakeUiStateResult = {
    ...baseResult,
    summary: '2026年丙午，丙為癸水日主之正財，午為火旺之地。',
    detailText: '姓名五格待校驗，未校驗前不輸出吉凶定論。',
    topicAnalysis: '火旺財星之年，財星明顯，但需注意耗身與壓力。',
    validatorErrors: [
      '2026 丙午為火旺財星之年，不得稱為「金水喜用之年」',
    ],
  }
  const fakeUiStateValidation = validateAnalysisResult(fakeUiStateResult)
  assert.equal(fakeUiStateValidation.valid, true)

  // 大運起運：順逆判斷
  assert.equal(getLuckDirection({ yearStem: '丁', gender: 'male' }).label, '逆行')
  assert.equal(getLuckDirection({ yearStem: '丁', gender: 'male' }).direction, 'backward')
  assert.equal(getLuckDirection({ yearStem: '丁', gender: 'female' }).label, '順行')
  assert.equal(getLuckDirection({ yearStem: '丁', gender: 'female' }).direction, 'forward')
  // 陽男順行、陽女逆行
  assert.equal(getLuckDirection({ yearStem: '甲', gender: 'male' }).label, '順行')
  assert.equal(getLuckDirection({ yearStem: '甲', gender: 'female' }).label, '逆行')
  // 缺少性別不得亂算
  const noGender = getLuckDirection({ yearStem: '丁' })
  assert.equal(noGender.direction, null)
  assert.equal(noGender.label, '未驗證')

  // 大運排列：月柱甲辰逆行
  const backwardCycles = buildLuckCycles({ monthPillar: '甲辰', direction: 'backward', count: 8 }).map((c) => c.pillar)
  assert.deepEqual(backwardCycles, ['癸卯', '壬寅', '辛丑', '庚子', '己亥', '戊戌', '丁酉', '丙申'])

  // 大運排列：月柱甲辰順行
  const forwardCycles = buildLuckCycles({ monthPillar: '甲辰', direction: 'forward', count: 8 }).map((c) => c.pillar)
  assert.deepEqual(forwardCycles, ['乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子'])

  // 節氣資料不足或缺性別時，起運歲數不得亂算
  const unverifiedStart = calculateLuckStart({
    birthDateTime: new Date(2000, 0, 1),
    gender: '',
    yearStem: '丁',
    previousTerm: null,
    nextTerm: null,
  })
  assert.equal(unverifiedStart.verified, false)
  assert.equal(unverifiedStart.direction, null)

  // 節氣 verified === false 時，不得輸出固定歲數
  const noTermStart = calculateLuckStart({
    birthDateTime: new Date(2000, 0, 1),
    gender: 'male',
    yearStem: '丁',
    previousTerm: null,
    nextTerm: null,
  })
  assert.equal(noTermStart.verified, false)
  assert.ok(typeof noTermStart.startAgeYears === 'undefined')

  // 節氣查找：實際可取得前後節氣
  const terms = getSolarTermsAroundBirth({ year: 1987, month: 4, day: 20, hour: 13 })
  assert.equal(terms.source, 'lunar-javascript')
  assert.equal(terms.verified, true)
  assert.ok(terms.previousTerm && terms.previousTerm.dateTime instanceof Date)
  assert.ok(terms.nextTerm && terms.nextTerm.dateTime instanceof Date)

  // 起運精算：實際算出歲數
  const verifiedStart = calculateLuckStart({
    birthDateTime: terms.birthDateTime,
    gender: 'male',
    yearStem: '丁',
    previousTerm: terms.previousTerm,
    nextTerm: terms.nextTerm,
  })
  assert.equal(verifiedStart.verified, true)
  assert.ok(verifiedStart.startAgeYears >= 0 && verifiedStart.startAgeYears <= 10)
  assert.ok(verifiedStart.startAgeMonths >= 0 && verifiedStart.startAgeMonths < 12)

  // analyzeBirth：solar 輸入有起運精算；缺性別則未驗證
  const solarInput = {
    inputMode: 'solar', year: 1987, month: 4, day: 20, hour: 7, uncertainHour: false,
    manualPillars: { year: '', month: '', day: '', hour: '' },
    name: '', gender: '男', analysisYear: 2026, topic: '整體運勢', query: '', compoundSurname: '',
  }
  const solarResult = analyzeBirth(solarInput)
  assert.ok(solarResult.luckStart)
  assert.ok(['順行', '逆行'].includes(solarResult.luckStart.directionLabel))
  assert.equal(solarResult.luckStart.verified, true)
  assert.ok(solarResult.luckStart.startAge.includes('歲'))

  const noGenderInput = { ...solarInput, gender: '' }
  const noGenderResult = analyzeBirth(noGenderInput)
  assert.equal(noGenderResult.luckStart.verified, false)
  assert.equal(noGenderResult.luckStart.directionLabel, '未驗證')

  // 康熙筆畫資料庫
  assert.equal(getKangxiStroke('謝').strokes, 17)
  assert.equal(getKangxiStroke('進').strokes, 15)
  assert.equal(getKangxiStroke('文').strokes, 4)
  const missingStroke = getKangxiStroke('某')
  assert.equal(missingStroke.verified, false)
  assert.equal(missingStroke.status, '待校驗')

  // 姓名筆畫校驗：謝進文
  const nameStrokes = calculateNameStrokes('謝進文')
  assert.equal(nameStrokes.verified, true)
  assert.equal(nameStrokes.source, '康熙筆畫字典')
  assert.deepEqual(nameStrokes.chars.map((c) => c.strokes), [17, 15, 4])

  // 姓名五格：單姓雙名
  const verifiedWuge = calculateVerifiedNameWuge('謝進文')
  assert.equal(verifiedWuge.verified, true)
  assert.equal(verifiedWuge.nameType, '單姓雙名')
  assert.equal(verifiedWuge.wuge.heaven, 18)
  assert.equal(verifiedWuge.wuge.personality, 32)
  assert.equal(verifiedWuge.wuge.earth, 19)
  assert.equal(verifiedWuge.wuge.outer, 5)
  assert.equal(verifiedWuge.wuge.total, 36)
  assert.equal(verifiedWuge.wugeFortuneVerified, true)
  assert.equal(Object.keys(WUGE_81_TABLE).length, 81)

  // 81 數理與三才配置
  assert.equal(getWuge81Fortune(18).verified, true)
  assert.equal(getWuge81Fortune(82).verified, false)
  assert.equal(getNumberElement(18), '金')
  assert.equal(getNumberElement(32), '木')
  assert.equal(getNumberElement(19), '水')
  const sancaiElements = getSancaiElements({ heaven: 18, personality: 32, earth: 19 })
  assert.equal(sancaiElements.combination, '金木水')
  const fortuneAnalysis = analyzeWugeFortune({ heaven: 18, personality: 32, earth: 19, outer: 5, total: 36 })
  assert.equal(fortuneAnalysis.verified, true)
  assert.ok(Object.values(fortuneAnalysis.items).every((item) => item.verified))
  const sancaiAnalysis = analyzeSancai({ heaven: 18, personality: 32, earth: 19 })
  assert.equal(sancaiAnalysis.combination, '金木水')
  assert.equal(sancaiAnalysis.verified, true)
  const nameFortune = analyzeNameFortune('謝進文')
  assert.equal(nameFortune.strokesVerified, true)
  assert.equal(nameFortune.wugeVerified, true)
  assert.equal(nameFortune.sancai.combination, '金木水')

  // 缺字不得推估筆畫
  const missingNameStrokes = calculateNameStrokes('謝某文')
  assert.equal(missingNameStrokes.verified, false)
  assert.ok(missingNameStrokes.missingChars.includes('某'))
  const missingWuge = calculateVerifiedNameWuge('謝某文')
  assert.equal(missingWuge.verified, false)
  assert.equal(missingWuge.status, '待校驗')

  // analyzeBirth：姓名改走康熙筆畫五格，並整合 81 數理與三才
  const kangxiNameResult = analyzeBirth({ ...solarInput, name: '謝進文' })
  assert.equal(kangxiNameResult.wuge.verified, true)
  assert.deepEqual(kangxiNameResult.wuge.strokes, [17, 15, 4])
  assert.equal(kangxiNameResult.wuge.天格, 18)
  assert.equal(kangxiNameResult.wuge.人格, 32)
  assert.equal(kangxiNameResult.wuge.地格, 19)
  assert.equal(kangxiNameResult.wuge.外格, 5)
  assert.equal(kangxiNameResult.wuge.總格, 36)
  assert.equal(Object.keys(kangxiNameResult.wuge.luck).length, 0)
  assert.equal(kangxiNameResult.wuge.wugeFortuneVerified, true)
  assert.equal(kangxiNameResult.wuge.wugeFortune.verified, true)
  assert.equal(kangxiNameResult.wuge.sancai.combination, '金木水')

  // 真太陽時：地方平太陽時經度修正
  const mean1 = calculateMeanSolarTime({ dateTime: new Date(2026, 5, 12, 12, 0), birthLongitude: 120.312, timezoneOffsetHours: 8 })
  assert.equal(mean1.standardMeridian, 120)
  assert.ok(Math.abs(mean1.longitudeCorrectionMinutes - 1.248) < 0.001)
  assert.ok(mean1.correctedDateTime instanceof Date)

  const mean2 = calculateMeanSolarTime({ dateTime: new Date(2026, 5, 12, 12, 0), birthLongitude: 121.565, timezoneOffsetHours: 8 })
  assert.ok(Math.abs(mean2.longitudeCorrectionMinutes - 6.26) < 0.01)

  const mean3 = calculateMeanSolarTime({ dateTime: new Date(2026, 5, 12, 12, 0), birthLongitude: 119.5, timezoneOffsetHours: 8 })
  assert.ok(Math.abs(mean3.longitudeCorrectionMinutes - -2) < 0.001)

  // 均時差：回傳合理範圍 number
  const eot = calculateEquationOfTime(new Date(2026, 5, 12))
  assert.equal(typeof eot, 'number')
  assert.ok(eot > -20 && eot < 20)
  for (let m = 0; m < 12; m++) {
    const e = calculateEquationOfTime(new Date(2026, m, 15))
    assert.ok(e > -20 && e < 20)
  }

  // 真太陽時 = 平太陽時 + 均時差
  const trueSolar = calculateTrueSolarTime({ dateTime: new Date(2026, 5, 12, 12, 0), birthLongitude: 121.565, timezoneOffsetHours: 8 })
  assert.ok(Math.abs(trueSolar.totalCorrectionMinutes - (trueSolar.longitudeCorrectionMinutes + trueSolar.equationOfTimeMinutes)) < 1e-9)
  assert.ok(trueSolar.trueSolarDateTime instanceof Date)

  // lunarAdapter：useTrueSolarTime / useMeanSolarTime = false 使用原始時間
  const noneAdapter = getBaziFromSolarDate({ year: 1987, month: 4, day: 20, hour: 23 })
  assert.equal(noneAdapter.solarTimeCorrection.mode, 'none')
  assert.equal(noneAdapter.solarTimeCorrection.enabled, false)
  const baseHour = noneAdapter.raw.hourPillar

  // useMeanSolarTime = true 使用經度修正後時間
  const meanAdapter = getBaziFromSolarDate({ year: 1987, month: 4, day: 20, hour: 23, useMeanSolarTime: true, birthLongitude: 121.565 })
  assert.equal(meanAdapter.solarTimeCorrection.mode, 'meanSolarTime')
  assert.equal(meanAdapter.solarTimeCorrection.enabled, true)
  assert.ok(Math.abs(meanAdapter.solarTimeCorrection.longitudeCorrectionMinutes - 6.26) < 0.01)
  assert.equal(meanAdapter.solarTimeCorrection.equationOfTimeMinutes, 0)

  // useTrueSolarTime = true 使用經度修正 + 均時差後時間
  const trueAdapter = getBaziFromSolarDate({ year: 1987, month: 4, day: 20, hour: 23, useTrueSolarTime: true, birthLongitude: 121.565 })
  assert.equal(trueAdapter.solarTimeCorrection.mode, 'trueSolarTime')
  assert.equal(trueAdapter.solarTimeCorrection.enabled, true)
  assert.ok(trueAdapter.solarTimeCorrection.totalCorrectionMinutes !== trueAdapter.solarTimeCorrection.longitudeCorrectionMinutes)
  assert.ok('pillarChange' in trueAdapter.solarTimeCorrection)

  assert.ok(Array.isArray(trueAdapter.solarTimeCorrection.pillarChange.changedFields))

  // comparePillarsBeforeAfterCorrection：偵測時柱變化
  const changedHour = comparePillarsBeforeAfterCorrection(
    { year: '丁卯', month: '甲辰', day: '癸丑', hour: '壬子' },
    { year: '丁卯', month: '甲辰', day: '癸丑', hour: '癸丑' },
  )
  assert.equal(changedHour.changed, true)
  assert.deepEqual(changedHour.changedFields, ['hour'])
  assert.equal(changedHour.messages.length, 1)
  assert.ok(changedHour.messages[0].includes('時柱'))

  const changedDay = comparePillarsBeforeAfterCorrection(
    { year: '丁卯', month: '甲辰', day: '癸丑', hour: '壬子' },
    { year: '丁卯', month: '甲辰', day: '甲寅', hour: '甲子' },
  )
  assert.equal(changedDay.changed, true)
  assert.ok(changedDay.changedFields.includes('day'))
  assert.ok(changedDay.messages.some((m) => m.includes('日柱')))

  const noChange = comparePillarsBeforeAfterCorrection(
    { year: '丁卯', month: '甲辰', day: '癸丑', hour: '壬子' },
    { year: '丁卯', month: '甲辰', day: '癸丑', hour: '壬子' },
  )
  assert.equal(noChange.changed, false)
  assert.equal(noChange.changedFields.length, 0)

  // analyzeBirth：標準時間模式不影響既有四柱
  const stdResult = analyzeBirth({ ...solarInput, solarTimeMode: 'none' })
  assert.equal(stdResult.solarTimeCorrection.mode, 'none')
  const trueModeResult = analyzeBirth({ ...solarInput, solarTimeMode: 'trueSolarTime', birthLongitude: 121.565 })
  assert.equal(trueModeResult.solarTimeCorrection.mode, 'trueSolarTime')
  assert.equal(trueModeResult.solarTimeCorrection.enabled, true)

  console.log('bazi tests passed')
} finally {
  await server.close()
}
