import assert from 'node:assert/strict'
import { createSsrTestServer } from '../utils/viteTestServer.js'
import { assertNoForbiddenPhrases } from '../utils/forbiddenPhrases.js'
import { SYSTEM_FORBIDDEN_PHRASES, xieJinwenBaseCase } from '../goldenCases/baziGoldenCases.js'

function simulateBadAiNarrative() {
  const rawAiText = [
    '2026金水喜用之年。',
    '姓名五格皆吉。',
    '吉神匯聚。',
    '此命為純正官格。',
    '今年必定發財。',
    '流月正月己丑。',
    '申子辰水局。',
    '辰自刑。',
    '大耗必定破財。',
    '需搭配完整旺衰模型驗證。',
    '吉凶仍待81數理與三才表校驗。',
    '吉凶結論仍待校驗。',
    '目前不輸出吉凶定論。',
    '時支子為水強根。',
    '時支藏癸為水強根。',
    '正月庚寅、二月辛卯，金水印星透出。',
    '三月壬辰、四月癸巳，水比劫幫身，團隊合作順利。',
    '冬月庚子、臘月辛丑，金水印比幫身，年終收尾順利。',
    '日柱癸丑正官。',
    '日干癸為正官。',
    '年柱丁卯偏財，月柱甲辰傷官，日柱癸丑為日主坐七殺之地，時柱壬子劫財。',
    '尚未產生 AI 喜用補強建議。',
    '身強弱：偏弱，系統初判。',
    '命局水偏旺，土亦重。',
    '有助於平衡命局能量。',
    '保證開運。',
    '必定有效。',
    '一定改善。',
    '大財年。',
    '絕對準確。',
    '命中注定不可改。',
    '日主為癸水，也就是癸水日主。',
    '你屬於癸水日主，核心像細水、雨露。',
    '系統初步判斷，金和水是比較適合拿來補強的方向。這次報告列出的方向是金、水。',
    '報告建議喜用金、水，白話就是喜用金、水。',
    '白話說，不是全好或全壞，而是有些地方順、有些地方需要靠後天調整。白話說，姓名學不是單純大吉，也不是單純不好，而是有幫助的地方，也有需要靠後天調整的地方。',
    '天人格相剋，基礎與發展受牽制。',
    '大運背景：庚子（39歲5個月-49歲5個月）。',
    '2032年壬子，天干壬為癸日主之劫財。財星明顯，代表收入、資源與責任同步增加，不等於必然發財。',
    '2034年甲寅，天干甲為癸日主之傷官。官殺代表制度、職責與壓力，需看制化與承擔能力。',
  ].join('\n')
  return {
    rawAiText,
    aiNarrative: {
      summary: rawAiText,
      detailText: rawAiText,
      topicAnalysis: rawAiText,
      sections: {
        career: rawAiText,
        wealth: rawAiText,
        relationship: rawAiText,
        health: rawAiText,
        yearly: rawAiText,
        nameAdvice: rawAiText,
        remedies: rawAiText,
      },
    },
  }
}

const server = await createSsrTestServer('ai-narrative-safety-e2e')

try {
  const { analyzeBirth } = await server.ssrLoadModule('/src/lib/analysis.ts')
  const { buildReportValidationData } = await server.ssrLoadModule('/src/lib/aiNarrativeSafety.ts')
  const { safeApplyAiNarrative } = await server.ssrLoadModule('/src/lib/aiNarrativeSafety.ts')
  const { sanitizeAiNarrativeText, sanitizeAiNarrativeObject } = await server.ssrLoadModule('/src/lib/aiNarrativeSanitizer.ts')
  const { collectVisibleReportText } = await server.ssrLoadModule('/src/lib/reportVisibleText.ts')
  const { validateReport } = await server.ssrLoadModule('/src/lib/reportValidator.js')

  const baseResult = analyzeBirth(xieJinwenBaseCase.input)
  const data = buildReportValidationData(baseResult)
  const { rawAiText, aiNarrative } = simulateBadAiNarrative()

  const rawValidation = validateReport(data, rawAiText)
  assert.equal(rawValidation.valid, false, 'raw AI text 應被 validator 攔截')

  const sanitizedText = sanitizeAiNarrativeText(rawAiText)
  assert.ok(sanitizedText.includes('正月庚寅、二月辛卯，天干金印透出，但地支寅卯木亦帶來輸出與洩身'))
  assert.ok(sanitizedText.includes('三月壬辰、四月癸巳，天干水氣有幫身作用，但辰土與巳火仍帶來壓力與耗身'))
  assert.ok(sanitizedText.includes('冬月庚子金水較能補益日主，適合整理資源；臘月辛丑雖有辛金支援，但丑土亦帶壓力'))
  assert.ok(sanitizedText.includes('日柱癸丑為日主坐七殺之地'))
  assert.ok(sanitizedText.includes('日干癸為日主'))
  assert.ok(sanitizedText.includes('年柱丁卯為偏財坐食神，月柱甲辰為傷官坐正官，日柱癸丑為日主坐七殺之地，時柱壬子為劫財坐比肩'))
  assert.ok(sanitizedText.includes('金：可作印星補助'))
  assert.ok(sanitizedText.includes('水：可作比劫輔助'))
  assert.ok(sanitizedText.includes('身強弱：中和偏弱／身偏弱（旺衰 v2 系統初判）'))
  assert.ok(sanitizedText.includes('五行簡化模型中水分數較高，但旺衰 v2 仍判為中和偏弱／身偏弱'))
  assert.ok(sanitizedText.includes('以上為喜用神初判的生活化參考，不作絕對開運保證'))
  assert.ok(sanitizedText.includes('財務機會與壓力並存的一年'))
  assert.ok(sanitizedText.includes('系統模型參考'))
  assert.ok(sanitizedText.includes('可作趨勢參考，仍需搭配實際行動'))
  assert.ok(sanitizedText.includes('日主為癸水'))
  assert.ok(sanitizedText.includes('你的核心特質像細水、雨露'))
  assert.ok(sanitizedText.includes('系統初步判斷，金和水是比較適合拿來補強的方向。'))
  assert.ok(sanitizedText.includes('報告建議用金、水作為主要補強方向'))
  assert.ok(sanitizedText.includes('簡單說，這不是全好或全壞，而是有些地方順、有些地方需要靠後天調整。'))
  assert.ok(sanitizedText.includes('姓名結構裡有支援，也有拉扯，不是全好或全壞，需要靠後天調整'))
  assert.ok(sanitizedText.includes('僅供生活化參考'))
  assert.ok(sanitizedText.includes('可作生活化參考，仍需搭配實際行動'))
  assertNoForbiddenPhrases(assert, sanitizedText, SYSTEM_FORBIDDEN_PHRASES, 'sanitized AI text')
  const sanitizedNarrative = sanitizeAiNarrativeObject(aiNarrative)
  assertNoForbiddenPhrases(assert, JSON.stringify(sanitizedNarrative), SYSTEM_FORBIDDEN_PHRASES, 'sanitized AI narrative object')

  const safe = safeApplyAiNarrative({ baseResult, aiNarrative })
  assert.equal(safe.wasSanitized, true)
  assert.equal(safe.originalValidatorErrors.length > 0, true)
  if (safe.usedAi) {
    assert.ok(safe.result.aiSections?.career, 'safeApplyAiNarrative 應保留 AI 分段 career')
    assert.ok(safe.result.aiSections?.wealth, 'safeApplyAiNarrative 應保留 AI 分段 wealth')
  }
  const visible = collectVisibleReportText(safe.result)
  assertNoForbiddenPhrases(assert, visible, SYSTEM_FORBIDDEN_PHRASES, 'safe AI visible text')
  const finalValidation = validateReport(buildReportValidationData(safe.result), visible)
  assert.equal(finalValidation.valid, true, `safe AI result 應通過 validator：${finalValidation.errors.join('；')}`)
  assert.equal(visible.includes(rawAiText), false, 'UI 不應顯示原始錯誤 AI 文案')

  console.log('AI narrative safety e2e test passed')
} finally {
  await server.close()
}
