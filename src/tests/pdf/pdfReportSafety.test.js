import assert from 'node:assert/strict'
import { createSsrTestServer } from '../utils/viteTestServer.js'
import { assertNoForbiddenPhrases } from '../utils/forbiddenPhrases.js'
import { SYSTEM_FORBIDDEN_PHRASES, xieJinwenBaseCase } from '../goldenCases/baziGoldenCases.js'

const server = await createSsrTestServer('pdf-report-safety')

try {
  const { analyzeBirth } = await server.ssrLoadModule('/src/lib/analysis.ts')
  const { buildReportValidationData, getSafePdfResult } = await server.ssrLoadModule('/src/lib/aiNarrativeSafety.ts')
  const { collectVisibleReportText } = await server.ssrLoadModule('/src/lib/reportVisibleText.ts')
  const { validateReport } = await server.ssrLoadModule('/src/lib/reportValidator.js')
  const { PDF_ARTICLE_KEEP_WITH_NEXT_LINES } = await server.ssrLoadModule('/src/lib/pdf.ts')

  const baseResult = analyzeBirth(xieJinwenBaseCase.input)
  const pdfModelText = collectVisibleReportText(baseResult)
  const pdfModelTextWithoutExplanation = collectVisibleReportText(baseResult, { includePersonalizedExplanation: false })

  // PDF 生成前資料模型需包含主要頁面內容，且先通過 validator。
  for (const expected of ['丁卯', '甲辰', '癸丑', '壬子', '天干十神', '藏干十神', '卯辰害', '旺衰v2', '2026 丙午', '歲運', '謝 17畫', '天乙貴人']) {
    assert.ok(pdfModelText.includes(expected), `PDF 生成前文字模型應包含：${expected}`)
  }
  assertNoForbiddenPhrases(assert, pdfModelText, SYSTEM_FORBIDDEN_PHRASES, 'PDF preflight model text')
  assert.ok(pdfModelText.includes('旺衰 v2.0'))
  assert.ok(pdfModelText.includes('歲運 v2.0'))
  assert.ok(pdfModelText.includes('神煞 v4.1'))
  assert.ok(pdfModelText.includes('五格 81 數理與三才配置已由系統資料表判讀'))
  assert.ok(pdfModelText.includes('五行簡化模型參考'))
  assert.ok(pdfModelText.includes('正式身強弱以第 5 頁旺衰 v2 結果為準'))
  assert.ok(pdfModelText.includes('日主旺衰 v2'))
  assert.ok(pdfModelText.includes('時支子水為癸水強根') || pdfModelText.includes('時支子水藏癸，為癸水強根'))
  assert.ok(pdfModelText.includes('五月 甲午 木火偏旺，洩耗加重'))
  assert.ok(pdfModelText.includes('六月 乙未 木土偏旺，剋洩壓力升高'))
  assert.ok(pdfModelText.includes('九月 戊戌 土氣偏旺，工作責任與壓力較重'))
  assert.ok(pdfModelText.includes('冬月 庚子 金水偏旺，較能補益日主'))
  assert.ok(pdfModelText.includes('天干金印透出，但地支寅卯木亦帶來輸出與洩身'))
  assert.ok(pdfModelText.includes('三月壬辰、四月癸巳，天干水氣有幫身作用，但辰土與巳火仍帶來壓力與耗身'))
  assert.ok(pdfModelText.includes('冬月庚子金水較能補益日主'))
  assert.equal(pdfModelText.includes('日柱癸丑正官'), false)
  assert.ok(pdfModelText.includes('日柱癸丑為日主坐七殺之地') || pdfModelText.includes('日支丑主氣己土，對癸水為七殺'))
  assert.equal(pdfModelText.includes('年柱丁卯偏財，月柱甲辰傷官，日柱癸丑為日主坐七殺之地，時柱壬子劫財'), false)
  assert.equal(pdfModelText.includes('年柱丁卯偏財'), false)
  assert.equal(pdfModelText.includes('月柱甲辰傷官'), false)
  assert.equal(pdfModelText.includes('時柱壬子劫財'), false)
  assert.ok(pdfModelText.includes('年柱丁卯為偏財坐食神'))
  assert.ok(pdfModelText.includes('月柱甲辰為傷官坐正官'))
  assert.ok(pdfModelText.includes('時柱壬子為劫財坐比肩'))
  assert.equal(pdfModelText.includes('尚未產生 AI 喜用補強建議'), false)
  assert.ok(pdfModelText.includes('金：可作印星補助'))
  assert.ok(pdfModelText.includes('水：可作比劫輔助'))
  assert.ok(pdfModelText.includes('不作絕對開運保證'))
  assert.equal(pdfModelText.includes('身強弱：偏弱，系統初判'), false)
  assert.ok(pdfModelText.includes('身強弱：中和偏弱／身偏弱') || pdfModelText.includes('旺衰 v2 系統初判'))
  assert.equal(pdfModelText.includes('命局水偏旺，土亦重'), false)
  assert.ok(pdfModelText.includes('五行簡化模型中水分數較高'))
  assert.ok(pdfModelText.includes('旺衰 v2'))
  assert.ok(pdfModelText.includes('中和偏弱／身偏弱'))
  assert.equal(pdfModelText.includes('有助於平衡命局能量'), false)
  assert.equal(pdfModelText.includes('保證開運'), false)
  assert.equal(pdfModelText.includes('必定有效'), false)
  assert.ok(pdfModelText.includes('以上為喜用神初判的生活化參考'))
  assert.ok(pdfModelText.includes('白話總結：這份報告代表什麼？'))
  assert.ok(pdfModelText.includes('這份報告最重要的一句話'))
  assert.ok(pdfModelText.includes('你的核心特質像細水、雨露'))
  assert.ok(pdfModelText.includes('你不是沒有能力，而是比較不適合長期靠硬撐過日子'))
  assert.ok(pdfModelText.includes('金和水是比較適合拿來補強的方向'))
  assert.ok(pdfModelText.includes('姓名結構裡有支援，也有拉扯'))
  assert.ok(pdfModelText.includes('這不是全好或全壞，而是有些地方順、有些地方需要靠後天調整'))
  assert.ok(pdfModelText.includes('先把能力、流程和資源準備好，再去接機會'))
  assert.ok(pdfModelText.includes('2026 是丙午年'))
  assert.ok(pdfModelText.includes('財務機會和壓力一起增加'))
  assert.ok(pdfModelText.includes('神煞不能單獨決定吉凶'))
  assert.ok(pdfModelText.includes('命理可以當參考，但真正會改變結果的，還是你的選擇、行動和調整能力'))
  assert.equal(pdfModelText.includes('後天調整。。'), false)
  assert.equal(pdfModelText.includes('日主為癸水，也就是癸水日主'), false)
  assert.equal(pdfModelText.includes('癸水日主，也就是癸水日主'), false)
  assert.equal(pdfModelText.includes('你屬於癸水日主，核心像細水'), false)
  assert.equal(pdfModelText.includes('這次報告列出的方向是金、水'), false)
  assert.equal(pdfModelText.includes('報告建議喜用金、水，白話就是喜用金、水'), false)
  assert.equal(pdfModelText.includes('喜用金、水，白話就是喜用金、水'), false)
  assert.equal(pdfModelText.includes('白話說，不是全好或全壞，而是有些地方順、有些地方需要靠後天調整。白話說'), false)
  assert.equal(pdfModelText.includes('姓名學不是單純大吉，也不是單純不好，而是有幫助的地方，也有需要靠後天調整的地方'), false)
  assert.equal(pdfModelText.includes('喜用金、水，也就是喜用金、水'), false)
  assert.equal(pdfModelTextWithoutExplanation.includes('白話總結：這份報告代表什麼？'), false)
  assert.equal(PDF_ARTICLE_KEEP_WITH_NEXT_LINES >= 3, true, '白話總結章節標題需至少與 3 行正文同頁')
  for (const forbidden of ['必定發財', '必定破財', '一定升遷', '保證開運', '絕對準確', '命中注定不可改', '吉神匯聚', '凶煞聚集']) {
    assert.equal(pdfModelText.includes(forbidden), false, `PDF preflight 不得包含：${forbidden}`)
  }
  const pdfValidation = validateReport(buildReportValidationData(baseResult), pdfModelText)
  assert.equal(pdfValidation.valid, true, `PDF preflight 應通過 validator：${pdfValidation.errors.join('；')}`)

  const aiSectionResult = {
    ...baseResult,
    aiSections: {
      career: '事業分段內容：適合穩步推進。',
      wealth: '財運分段內容：財務機會與耗身壓力並存。',
      relationship: '感情人際分段內容：互動宜保守看待。',
      health: '健康分段內容：作息需穩定。',
      yearly: '流年分段內容：2026 丙午為火旺財星之年。',
      nameAdvice: '姓名建議分段內容：僅依康熙筆畫與五格數值參考。',
      remedies: '喜用補強分段內容：金、水作系統初判。',
    },
  }
  const aiSectionPdf = getSafePdfResult({ result: aiSectionResult, fallbackResult: baseResult })
  assert.equal(aiSectionPdf.usedFallback, false)
  assert.equal(aiSectionPdf.result.aiSections?.career, aiSectionResult.aiSections.career)
  assert.equal(aiSectionPdf.result.aiSections?.wealth, aiSectionResult.aiSections.wealth)

  // PDF 匯出前若帶入不安全 AI/報告文字，必須清洗或 fallback，不得產生錯誤 PDF。
  const unsafePdfResult = {
    ...baseResult,
    summary: '2026金水喜用之年。姓名五格皆吉。吉神匯聚。純正官格。必定發財。正月己丑。',
    detailText: '申子辰水局。辰自刑。大耗必定破財。',
    topicAnalysis: '一定升遷，必有災。需搭配完整旺衰模型驗證。吉凶仍待81數理與三才表校驗。',
  }
  const safePdf = getSafePdfResult({ result: unsafePdfResult, fallbackResult: baseResult })
  const safeText = collectVisibleReportText(safePdf.result)
  assertNoForbiddenPhrases(assert, safeText, SYSTEM_FORBIDDEN_PHRASES, 'safe PDF output text')
  const safeValidation = validateReport(buildReportValidationData(safePdf.result), safeText)
  assert.equal(safeValidation.valid, true, `safe PDF result 應通過 validator：${safeValidation.errors.join('；')}`)
  assert.equal(safeText.includes('2026金水喜用之年'), false)
  assert.equal(safeText.includes('正月己丑'), false)

  console.log('pdf report safety test passed')
} finally {
  await server.close()
}
