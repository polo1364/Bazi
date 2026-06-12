import assert from 'node:assert/strict'
import { createSsrTestServer } from '../utils/viteTestServer.js'
import { assertNoForbiddenPhrases } from '../utils/forbiddenPhrases.js'
import { SYSTEM_FORBIDDEN_PHRASES, xieJinwenBaseCase } from '../goldenCases/baziGoldenCases.js'

const server = await createSsrTestServer('golden-xie-jinwen')

try {
  const { analyzeBirth, getLiuyue } = await server.ssrLoadModule('/src/lib/analysis.ts')
  const { getTenGod } = await server.ssrLoadModule('/src/lib/tenGodEngine.js')
  const { getBranchTenGods } = await server.ssrLoadModule('/src/lib/branchHiddenStemEngine.js')
  const { getBranchInteractions } = await server.ssrLoadModule('/src/lib/branchInteractionEngine.js')
  const { getLuckDirection } = await server.ssrLoadModule('/src/lib/luckCycleEngine.js')
  const { collectVisibleReportText } = await server.ssrLoadModule('/src/lib/reportVisibleText.ts')
  const { buildReportValidationData } = await server.ssrLoadModule('/src/lib/aiNarrativeSafety.ts')
  const { validateReport } = await server.ssrLoadModule('/src/lib/reportValidator.js')
  const {
    formatShenshaLookupKey,
    formatShenshaMatchedPillars,
    formatShenshaTargetBranches,
  } = await server.ssrLoadModule('/src/lib/shensha/shenshaDisplay.ts')

  const golden = xieJinwenBaseCase
  const result = analyzeBirth(golden.input)
  assert.ok(result, 'analyzeBirth 應產生結果')

  const { chart } = result
  assert.deepEqual({
    year: chart.year.stem + chart.year.branch,
    month: chart.month.stem + chart.month.branch,
    day: chart.day.stem + chart.day.branch,
    hour: chart.hour.stem + chart.hour.branch,
  }, golden.expectedCore.pillars)
  assert.equal(chart.dayMaster, golden.expectedCore.dayStem)
  assert.equal(chart.dayMasterElement, golden.expectedCore.dayElement)

  // 十神必須由 tenGodEngine 算出，不可寫死在 UI。
  assert.equal(getTenGod('癸', '丁'), golden.expectedTenGods.stems.year)
  assert.equal(getTenGod('癸', '甲'), golden.expectedTenGods.stems.month)
  assert.equal(getTenGod('癸', '癸'), '比肩')
  assert.equal(getTenGod('癸', '壬'), golden.expectedTenGods.stems.hour)
  assert.equal(chart.year.stemTenGod, golden.expectedTenGods.stems.year)
  assert.equal(chart.month.stemTenGod, golden.expectedTenGods.stems.month)
  assert.equal(chart.day.stemTenGod, golden.expectedTenGods.stems.day)
  assert.equal(chart.hour.stemTenGod, golden.expectedTenGods.stems.hour)

  // 藏干十神必須由 hiddenStemEngine 算出。
  const expectedHidden = golden.expectedTenGods.hiddenStems
  const hiddenOf = (branch) => getBranchTenGods('癸', branch).hiddenStems.map(({ stem, tenGod }) => ({ stem, tenGod }))
  assert.deepEqual(hiddenOf('卯'), expectedHidden.year)
  assert.deepEqual(hiddenOf('辰'), expectedHidden.month)
  assert.deepEqual(hiddenOf('丑'), expectedHidden.day)
  assert.deepEqual(hiddenOf('子'), expectedHidden.hour)
  assert.deepEqual(chart.month.hiddenStemTenGods.map(({ stem, tenGod }) => ({ stem, tenGod })), expectedHidden.month)

  // 刑沖合害：成立項與禁止項。
  const relationLabels = getBranchInteractions(['卯', '辰', '丑', '子']).map((r) => r.label)
  for (const label of golden.expectedRelations.allowed) {
    assert.ok(relationLabels.includes(label), `應包含刑沖合害：${label}`)
  }
  for (const label of golden.expectedRelations.forbidden) {
    assert.equal(relationLabels.includes(label), false, `不得包含刑沖合害：${label}`)
  }
  assert.deepEqual(result.relations.map((r) => r.label).sort(), relationLabels.sort())

  // 2026 流年與節氣流月。
  const y2026 = result.liunian.find((item) => item.year === 2026)
  assert.equal(y2026?.pillar, golden.expectedFlow.year.pillar)
  assert.equal(y2026?.tenGod, golden.expectedFlow.year.stemTenGod)
  const flowMonths = getLiuyue(chart, 2026)
  assert.deepEqual(flowMonths.map((m) => [m.label, m.pillar]), golden.expectedFlow.months)
  assert.equal(flowMonths[0].pillar, '庚寅')
  assert.notEqual(flowMonths[0].pillar, '己丑')
  assert.ok(result.fortuneV2?.yearImpact.theme.includes('財星'))
  assert.ok(result.fortuneV2?.yearImpact.riskFactors.some((f) => f.includes('耗身') || f.includes('壓力')))
  assert.equal(result.fortuneV2?.yearImpact.conclusion.includes('必定發財'), false)

  // 大運：丁為陰干，男命逆行；手動四柱不可固定寫 8 歲起運。
  const direction = getLuckDirection({ yearStem: '丁', gender: '男' })
  assert.equal(direction.label, golden.expectedDayun.directionLabel)
  assert.ok(direction.reason.includes('陰男') || direction.reason.includes('逆行'))
  assert.deepEqual(result.dayunDetails.slice(0, 8).map((d) => d.pillar), golden.expectedDayun.pillars)
  assert.equal(result.luckStart?.directionLabel, golden.expectedDayun.directionLabel)
  assert.ok(result.luckStart?.directionReason)
  assert.equal(result.luckStart?.verified, false)
  assert.ok(result.luckStart?.note?.includes('手動輸入四柱') || result.luckStart?.note?.includes('尚未驗證'))
  assert.notEqual(result.luckStart?.startAge, '8歲')

  // 旺衰 v2：必須有依據，不只百分比。
  assert.ok(result.strengthV2, '應輸出 strengthV2')
  assert.ok(golden.expectedStrengthV2.labels.some((label) => result.strengthV2.label.includes(label)), `旺衰 v2 標籤不符：${result.strengthV2.label}`)
  assert.equal(result.strengthV2.confidence, golden.expectedStrengthV2.confidence)
  const strengthReasons = result.strengthV2.reasons.join('\n')
  for (const snippet of ['生於辰月', '藏癸', '強根', '壬', '土', '甲', '丁']) {
    assert.ok(strengthReasons.includes(snippet) || collectVisibleReportText(result).includes(snippet), `旺衰 v2 理由應包含：${snippet}`)
  }
  assert.deepEqual(result.strengthV2.usefulGods.useful, golden.expectedStrengthV2.useful)
  for (const snippet of golden.expectedStrengthV2.patternIncludes) {
    assert.ok(result.strengthV2.pattern.patternLabel.includes(snippet), `格局傾向應包含：${snippet}`)
  }

  // 姓名學。
  assert.ok(result.wuge?.verified, '姓名康熙筆畫應已校驗')
  for (const [char, strokes] of Object.entries(golden.expectedName.strokes)) {
    const item = result.wuge.chars.find((c) => c.char === char)
    assert.equal(item?.strokes, strokes, `${char} 筆畫不符`)
  }
  assert.equal(result.wuge.chars.find((c) => c.char === '進')?.strokes, 15)
  for (const [key, value] of Object.entries(golden.expectedName.wuge)) {
    assert.equal(result.wuge[key], value, `${key} 不符`)
  }

  // 神煞：只驗收目前公式引擎輸出，不自行新增神煞。
  const byName = new Map(result.shensha.map((s) => [s.name, s]))
  for (const name of golden.expectedShensha.verified) {
    assert.equal(byName.get(name)?.verified, true, `${name} 應成立`)
  }
  for (const name of golden.expectedShensha.notVerifiedOrNotApplicable) {
    const item = byName.get(name)
    assert.ok(item, `${name} 應在神煞清單中`)
    assert.notEqual(item.status, '成立', `${name} 不應成立`)
  }
  assert.equal(byName.get('大耗')?.status, '別名')
  const shenshaDisplayText = result.shensha.map((s) => [
    formatShenshaLookupKey(s.lookupKey),
    formatShenshaTargetBranches(s.targetBranches),
    formatShenshaMatchedPillars(s.matchedPillars),
  ].join('\n')).join('\n')
  for (const internalKey of ['yearBranch', 'dayBranch', 'monthBranch', 'yearStem', 'dayStem', 'year:', 'day:', 'hour:']) {
    assert.equal(shenshaDisplayText.includes(internalKey), false, `神煞顯示文字不得外露內部鍵名：${internalKey}`)
  }
  assert.ok(shenshaDisplayText.includes('年支') || shenshaDisplayText.includes('日支'))
  assert.ok(shenshaDisplayText.includes('年柱') || shenshaDisplayText.includes('日柱'))

  // 可見文字與 report validator。
  const visible = collectVisibleReportText(result)
  assertNoForbiddenPhrases(assert, visible, SYSTEM_FORBIDDEN_PHRASES, 'xie-jinwen-base visible text')
  const validation = validateReport(buildReportValidationData(result), visible)
  assert.equal(validation.valid, true, `Golden report visible text 應通過 validator：${validation.errors.join('；')}`)

  console.log('xie-jinwen golden test passed')
} finally {
  await server.close()
}
