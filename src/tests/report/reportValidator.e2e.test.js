import assert from 'node:assert/strict'
import { createSsrTestServer } from '../utils/viteTestServer.js'
import { assertNoForbiddenPhrases } from '../utils/forbiddenPhrases.js'
import { SYSTEM_FORBIDDEN_PHRASES, xieJinwenBaseCase } from '../goldenCases/baziGoldenCases.js'

const server = await createSsrTestServer('report-validator-e2e')

try {
  const { analyzeBirth } = await server.ssrLoadModule('/src/lib/analysis.ts')
  const { buildReportValidationData, validateAnalysisResult } = await server.ssrLoadModule('/src/lib/aiNarrativeSafety.ts')
  const { collectVisibleReportText } = await server.ssrLoadModule('/src/lib/reportVisibleText.ts')
  const { validateReport } = await server.ssrLoadModule('/src/lib/reportValidator.js')
  const { getTenGodYearNarrative } = await server.ssrLoadModule('/src/lib/narrative/tenGodNarrativeTemplate.ts')
  const { splitYearByLuckTransition } = await server.ssrLoadModule('/src/lib/fortune/luckTransition.ts')
  const { analyzeFortuneV2 } = await server.ssrLoadModule('/src/lib/fortune/fortuneV2Engine.ts')
  const { buildPillarNarrative } = await server.ssrLoadModule('/src/lib/narrative/pillarNarrative.ts')

  const result = analyzeBirth(xieJinwenBaseCase.input)
  const data = buildReportValidationData(result)
  const visible = collectVisibleReportText(result)

  assertNoForbiddenPhrases(assert, visible, SYSTEM_FORBIDDEN_PHRASES, 'report e2e visible text')
  assert.equal(visible.includes('身強弱採旺衰 v2'), true)
  assert.equal(visible.includes('五格 81 數理與三才配置已由系統資料表判讀'), true)
  assert.equal(visible.includes('不作保證性結論'), true)
  assert.equal(visible.includes('五行簡化模型參考'), true)
  assert.equal(visible.includes('正式身強弱以第 5 頁旺衰 v2 結果為準'), true)
  assert.equal(visible.includes('日主旺衰 v2'), true)
  assert.equal(visible.includes('時支子為水強根'), false)
  assert.equal(visible.includes('時支藏癸為水強根'), false)
  assert.ok(visible.includes('時支子水為癸水強根') || visible.includes('時支子水藏癸，為癸水強根'))
  assert.equal(visible.includes('五月 約芒種至小暑 甲午 傷官 此月平穩'), false)
  assert.equal(visible.includes('六月 約小暑至立秋 乙未 食神 此月平穩'), false)
  assert.equal(visible.includes('九月 約寒露至立冬 戊戌 正官 此月平穩'), false)
  assert.ok(visible.includes('五月 甲午 木火偏旺，洩耗加重'))
  assert.ok(visible.includes('六月 乙未 木土偏旺，剋洩壓力升高'))
  assert.ok(visible.includes('九月 戊戌 土氣偏旺，工作責任與壓力較重'))
  assert.ok(visible.includes('冬月 庚子 金水偏旺，較能補益日主'))
  assert.equal(visible.includes('正月庚寅、二月辛卯，金水印星透出'), false)
  assert.equal(visible.includes('三月壬辰、四月癸巳，水比劫幫身，團隊合作順利'), false)
  assert.equal(visible.includes('冬月庚子、臘月辛丑，金水印比幫身，年終收尾順利'), false)
  assert.ok(visible.includes('天干金印透出，但地支寅卯木亦帶來輸出與洩身'))
  assert.ok(visible.includes('三月壬辰、四月癸巳，天干水氣有幫身作用，但辰土與巳火仍帶來壓力與耗身'))
  assert.ok(visible.includes('冬月庚子金水較能補益日主'))
  assert.equal(visible.includes('日柱癸丑正官'), false)
  assert.equal(visible.includes('日柱癸丑為正官'), false)
  assert.equal(visible.includes('日干癸為正官'), false)
  assert.equal(visible.includes('日支丑為正官'), false)
  assert.equal(visible.includes('年柱丁卯偏財，月柱甲辰傷官，日柱癸丑為日主坐七殺之地，時柱壬子劫財'), false)
  assert.equal(visible.includes('年柱丁卯偏財'), false)
  assert.equal(visible.includes('月柱甲辰傷官'), false)
  assert.equal(visible.includes('時柱壬子劫財'), false)
  assert.ok(visible.includes('年柱丁卯為偏財坐食神'))
  assert.ok(visible.includes('月柱甲辰為傷官坐正官'))
  assert.ok(visible.includes('日柱癸丑為日主坐七殺之地'))
  assert.ok(visible.includes('時柱壬子為劫財坐比肩'))
  assert.ok(
    visible.includes('日柱癸丑為日主坐七殺之地') ||
    visible.includes('日干癸為日主') ||
    visible.includes('日支丑主氣己土，對癸水為七殺'),
  )
  assert.equal(visible.includes('尚未產生 AI 喜用補強建議'), false)
  assert.ok(visible.includes('金：可作印星補助'))
  assert.ok(visible.includes('水：可作比劫輔助'))
  assert.ok(visible.includes('不作絕對開運保證'))
  assert.equal(visible.includes('身強弱：偏弱，系統初判'), false)
  assert.ok(visible.includes('身強弱：中和偏弱／身偏弱') || visible.includes('旺衰 v2 系統初判'))
  assert.equal(visible.includes('命局水偏旺，土亦重'), false)
  assert.ok(visible.includes('五行簡化模型中水分數較高'))
  assert.ok(visible.includes('旺衰 v2'))
  assert.ok(visible.includes('中和偏弱／身偏弱'))
  assert.equal(visible.includes('有助於平衡命局能量'), false)
  assert.equal(visible.includes('保證開運'), false)
  assert.equal(visible.includes('必定有效'), false)
  assert.equal(visible.includes('一定改善'), false)
  assert.ok(visible.includes('以上為喜用神初判的生活化參考'))
  assert.ok(visible.includes('白話總結：這份報告代表什麼'))
  assert.ok(visible.includes('你的核心特質像細水、雨露'))
  assert.ok(visible.includes('金和水是比較適合拿來補強的方向'))
  assert.ok(visible.includes('2026 是丙午年'))
  assert.ok(visible.includes('這份報告最重要的一句話'))
  assert.ok(visible.includes('你不是沒有能力，而是比較不適合長期靠硬撐過日子'))
  assert.ok(visible.includes('金和水是比較適合拿來補強的方向'))
  assert.ok(visible.includes('姓名結構裡有支援，也有拉扯'))
  assert.ok(visible.includes('這不是全好或全壞，而是有些地方順、有些地方需要靠後天調整'))
  assert.ok(visible.includes('對你來說，先把能力、流程和資源準備好，再去接機會，會比硬衝更穩'))
  assert.ok(visible.includes('2026 不能解讀成一定發財'))
  assert.ok(visible.includes('財務機會和壓力一起增加'))
  assert.ok(visible.includes('辛丑到庚子的大運切換'))
  assert.ok(visible.includes('姓名謝進文'))
  assert.ok(visible.includes('神煞不能單獨決定吉凶'))
  assert.ok(visible.includes('不代表絕對命運'))
  assert.ok(visible.includes('命理可以當參考，但真正會改變結果的，還是你的選擇、行動和調整能力'))
  assert.equal(visible.includes('旺衰 v2.0'), true)
  assert.equal(visible.includes('歲運 v2.0'), true)
  assert.equal(visible.includes('神煞 v4.1'), true)
  assert.ok(result.ruleVersions, 'reportData.ruleVersions 必須存在')
  const visibleValidation = validateReport(data, visible)
  assert.equal(visibleValidation.valid, true, `visible report 應通過 validator：${visibleValidation.errors.join('；')}`)
  const resultValidation = validateAnalysisResult(result)
  assert.equal(resultValidation.valid, true, `analysis result 應通過 validator：${resultValidation.errors.join('；')}`)

  const forbiddenTexts = [
    '2026金水喜用之年',
    '2026 金水喜用之年',
    '2026 大利金水',
    '2026 必定發財',
    '大財年。',
    '流月正月己丑',
    '辰自刑',
    '申子辰水局',
    '子丑合化土',
    '純正官格',
    '喜用神絕對為金水',
    '身弱必發不了財',
    '姓名五格皆吉',
    '五格大吉',
    '姓名大吉',
    '姓名保證大吉',
    '吉神匯聚',
    '凶煞聚集',
    '紅鸞必定婚喜',
    '天德月德保證逢凶化吉',
    '空亡必定失敗',
    '災煞必有血光',
    '寡宿必婚姻不順',
    '大耗必定破財',
    '元辰必有災',
    '一定升遷',
    '必有災',
    'undefined',
    '[object Object]',
    '需搭配完整旺衰模型驗證',
    '吉凶仍待81數理與三才表校驗',
    '81數理吉凶、三才配置與字五行尚未校驗',
    '2032年壬子，天干壬為癸日主之劫財。財星明顯',
    '2034年甲寅，天干甲為癸日主之傷官。官殺代表制度',
    '壓力較高：無',
    '吉凶結論仍待校驗',
    '吉凶仍待校驗',
    '目前不輸出吉凶定論',
    '時支子為水強根',
    '時支藏癸為水強根',
    '五月 約芒種至小暑 甲午 傷官 此月平穩',
    '六月 約小暑至立秋 乙未 食神 此月平穩',
    '九月 約寒露至立冬 戊戌 正官 此月平穩',
    '正月庚寅、二月辛卯，金水印星透出',
    '三月壬辰、四月癸巳，水比劫幫身，團隊合作順利',
    '冬月庚子、臘月辛丑，金水印比幫身，年終收尾順利',
    '年柱丁卯偏財，月柱甲辰傷官，日柱癸丑為日主坐七殺之地，時柱壬子劫財',
    '年柱丁卯偏財',
    '月柱甲辰傷官',
    '時柱壬子劫財',
    '日柱癸丑正官',
    '日柱癸丑為正官',
    '日干癸為正官',
    '日支丑為正官',
    '尚未產生 AI 喜用補強建議',
    '尚未產生喜用補強建議',
    '身強弱：偏弱，系統初判',
    '命局水偏旺，土亦重',
    '有助於平衡命局能量',
    '保證開運',
    '必定有效',
    '一定改善',
    '絕對準確',
    '命中注定不可改',
    '日主為癸水，也就是癸水日主',
    '癸水日主，也就是癸水日主',
    '你屬於癸水日主，核心像細水',
    '這次報告列出的方向是金、水',
    '報告建議喜用金、水，白話就是喜用金、水',
    '喜用金、水，白話就是喜用金、水',
    '白話說，不是全好或全壞，而是有些地方順、有些地方需要靠後天調整。白話說',
    '姓名學不是單純大吉，也不是單純不好，而是有幫助的地方，也有需要靠後天調整的地方',
  ]
  for (const text of forbiddenTexts) {
    const check = validateReport(data, text)
    assert.equal(check.valid, false, `${text} 應被 reportValidator 攔截`)
  }

  const allowedTexts = [
    '2026 丙午為火旺財星之年，財務機會與耗身壓力並存。',
    '若大運有金水扶身，較有助於承接財星壓力。',
    '五月甲午木火偏旺，對中和偏弱癸水而言洩耗較重。',
    '正月庚寅，庚金有印星支持，但寅木也帶來輸出與洩身。',
    '子辰半合水，不等於三支俱全的三合局。',
    '六合只列合，未判定合化前不宣稱合化。',
    '身強弱採旺衰 v2 系統模型初判，需搭配大運流年與實際情境參考。',
    '姓名筆畫已依康熙筆畫資料庫計算，五格 81 數理與三才配置已由系統資料表判讀；結果僅供參考，不作保證性結論。',
    '壬子劫財代表同輩、合作、競爭與資源分流。',
    '甲寅傷官代表表達、技術、創意與規範摩擦。',
    '日柱癸丑為日主坐七殺之地。',
    '日干癸為日主。',
    '日支丑主氣己土，對癸水為七殺。',
    '金：可作印星補助。水：可作比劫輔助。以上為喜用神初判的生活化參考，不作絕對開運保證。',
    '年柱丁卯為偏財坐食神，月柱甲辰為傷官坐正官，日柱癸丑為日主坐七殺之地，時柱壬子為劫財坐比肩。',
    '身強弱：中和偏弱／身偏弱（旺衰 v2 系統初判）。',
    '五行簡化模型中水分數較高，但旺衰 v2 仍判為中和偏弱／身偏弱。',
    '以上為喜用神初判的生活化參考，不作絕對開運保證。',
  ]
  for (const text of allowedTexts) {
    const check = validateReport(data, text)
    assert.equal(check.valid, true, `${text} 不應被 reportValidator 攔截：${check.errors.join('；')}`)
  }

  const robber = getTenGodYearNarrative('劫財', { dayStem: '癸', stem: '壬', branch: '子' }).summary
  assert.equal(robber.includes('財星明顯'), false)
  assert.ok(robber.includes('劫財') && robber.includes('資源分流'))
  const hurting = getTenGodYearNarrative('傷官', { dayStem: '癸', stem: '甲', branch: '寅' }).summary
  assert.equal(hurting.includes('官殺代表制度'), false)
  assert.ok(hurting.includes('傷官') && hurting.includes('規範摩擦'))
  const directWealth = getTenGodYearNarrative('正財', { dayStem: '癸', stem: '丙', branch: '午' }).summary
  assert.ok(directWealth.includes('收入') && directWealth.includes('資源配置') && directWealth.includes('耗身壓力'))
  assert.equal(buildPillarNarrative({
    pillarName: '年柱',
    stem: '丁',
    branch: '卯',
    stemTenGod: '偏財',
    branchMainQi: { stem: '乙', tenGod: '食神' },
    hiddenStems: [{ stem: '乙', qi: '主氣', tenGod: '食神' }],
  }), '年柱丁卯為偏財坐食神')
  assert.equal(buildPillarNarrative({
    pillarName: '月柱',
    stem: '甲',
    branch: '辰',
    stemTenGod: '傷官',
    branchMainQi: { stem: '戊', tenGod: '正官' },
    hiddenStems: [{ stem: '戊', qi: '主氣', tenGod: '正官' }],
  }), '月柱甲辰為傷官坐正官')
  const dayPillarNarrative = buildPillarNarrative({
    pillarName: '日柱',
    stem: '癸',
    branch: '丑',
    stemTenGod: '日主',
    branchMainQi: { stem: '己', tenGod: '七殺' },
    hiddenStems: [
      { stem: '己', qi: '主氣', tenGod: '七殺' },
      { stem: '癸', qi: '中氣', tenGod: '比肩' },
      { stem: '辛', qi: '餘氣', tenGod: '偏印' },
    ],
  })
  assert.equal(dayPillarNarrative, '日柱癸丑為日主坐七殺之地')
  assert.equal(dayPillarNarrative.includes('日柱癸丑正官'), false)
  assert.equal(dayPillarNarrative.includes('日柱癸丑為正官'), false)
  assert.equal(buildPillarNarrative({
    pillarName: '時柱',
    stem: '壬',
    branch: '子',
    stemTenGod: '劫財',
    branchMainQi: { stem: '癸', tenGod: '比肩' },
    hiddenStems: [{ stem: '癸', qi: '主氣', tenGod: '比肩' }],
  }), '時柱壬子為劫財坐比肩')

  const year2032 = result.liunian.find((item) => item.year === 2032)
  assert.equal(year2032?.pillar, '壬子')
  assert.equal(year2032?.tenGod, '劫財')
  assert.equal(year2032?.summary.includes('財星明顯'), false)
  const year2034 = result.liunian.find((item) => item.year === 2034)
  assert.equal(year2034?.pillar, '甲寅')
  assert.equal(year2034?.tenGod, '傷官')
  assert.equal(year2034?.summary.includes('官殺代表制度'), false)

  const transition = splitYearByLuckTransition({
    year: 2026,
    birthDate: new Date(1987, 3, 20),
    luckCycles: [
      { pillar: '癸卯', startAge: '9歲5個月', endAge: '19歲5個月' },
      { pillar: '壬寅', startAge: '19歲5個月', endAge: '29歲5個月' },
      { pillar: '辛丑', startAge: '29歲5個月', endAge: '39歲5個月' },
      { pillar: '庚子', startAge: '39歲5個月', endAge: '49歲5個月' },
    ],
  })
  assert.equal(transition.hasTransition, true)
  const transitionFortune = analyzeFortuneV2({
    natal: {
      pillars: {
        year: { stem: '丁', branch: '卯' },
        month: { stem: '甲', branch: '辰' },
        day: { stem: '癸', branch: '丑' },
        hour: { stem: '壬', branch: '子' },
      },
      dayStem: '癸',
      dayElement: '水',
    },
    strengthV2: {
      label: '中和偏弱',
      useful: ['金', '水'],
      avoid: ['土', '火', '木'],
      confidence: '中',
      patternLabel: '正官格傾向 / 傷官見官',
    },
    luckCycle: { pillar: '庚子', stem: '庚', branch: '子', ageRange: '39歲5個月-49歲5個月', stemTenGod: '正印' },
    year: { year: 2026, pillar: '丙午', stem: '丙', branch: '午', stemTenGod: '正財' },
    months: [
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
    ],
    luckTransition: transition,
  })
  const transitionText = JSON.stringify(transitionFortune)
  assert.ok(transitionText.includes('辛丑'))
  assert.ok(transitionText.includes('庚子'))
  assert.ok(transitionText.includes('大運切換'))
  assert.ok(transitionFortune.yearSummary.keyMonths.pressure.includes('五月甲午'))
  assert.ok(transitionFortune.yearSummary.keyMonths.pressure.includes('六月乙未'))
  assert.ok(transitionFortune.yearSummary.keyMonths.pressure.includes('九月戊戌'))
  assert.ok(transitionFortune.yearSummary.keyMonths.supportive.includes('冬月庚子'))
  assert.equal(transitionText.includes('大運背景：庚子（39歲5個月-49歲5個月）'), false)

  console.log('report validator e2e test passed')
} finally {
  await server.close()
}
