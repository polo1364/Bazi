import assert from 'node:assert/strict'
import { createSsrTestServer } from '../utils/viteTestServer.js'
import { xieJinwenBaseCase } from '../goldenCases/baziGoldenCases.js'

const server = await createSsrTestServer('personalized-explanation')

try {
  const { analyzeBirth } = await server.ssrLoadModule('/src/lib/analysis.ts')
  const { buildPersonalizedPlainLanguageSummary } = await server.ssrLoadModule('/src/lib/report/personalizedExplanation.ts')

  const result = analyzeBirth(xieJinwenBaseCase.input)
  const article = buildPersonalizedPlainLanguageSummary(result)
  const text = [
    article.title,
    article.subtitle,
    ...article.sections.flatMap((section) => [section.heading, section.body]),
  ].join('\n')

  assert.equal(article.title, '白話總結：這份報告代表什麼？')
  for (const heading of [
    '先看整體',
    '為什麼建議補金、水',
    '工作和個性',
    '2026 年',
    '大運切換',
    '哪些月份要注意',
    '姓名學',
    '神煞',
    '這份報告可以怎麼用',
    '最後提醒',
  ]) {
    assert.ok(article.sections.some((section) => section.heading.includes(heading)), `應包含章節：${heading}`)
  }

  for (const expected of [
    '中和偏弱／身偏弱',
    '辰月',
    '時支子水',
    '金和水是比較適合拿來補強的方向',
    '2026 是丙午年',
    '辛丑到庚子的大運切換',
    '冬月庚子',
    '五月甲午',
    '姓名謝進文',
  ]) {
    assert.ok(text.includes(expected), `個人化文章應包含：${expected}`)
  }

  assert.ok(text.includes('你的核心特質像細水、雨露'))
  assert.ok(text.includes('你不是沒有能力，而是比較不適合長期靠硬撐過日子'))
  assert.ok(text.includes('金和水是比較適合拿來補強的方向'))
  assert.ok(text.includes('姓名結構裡有支援，也有拉扯'))
  assert.ok(text.includes('這不是全好或全壞，而是有些地方順、有些地方需要靠後天調整'))
  assert.ok(text.includes('先把能力、流程和資源準備好，再去接機會'))
  assert.ok(text.includes('財務機會和壓力一起增加'))
  assert.ok(text.includes('神煞不能單獨決定吉凶'))
  assert.ok(text.includes('不代表絕對命運'))
  assert.ok(text.includes('命理可以當參考，但真正會改變結果的，還是你的選擇、行動和調整能力'))
  assert.equal(text.includes('日主：八字分析核心'), false)
  assert.equal(text.includes('十神：角色分類'), false)
  assert.equal(text.includes('癸水日主，也就是癸水日主'), false)
  assert.equal(text.includes('日主為癸水，也就是癸水日主'), false)
  assert.equal(text.includes('你屬於癸水日主，核心像細水'), false)
  assert.equal(text.includes('這次報告列出的方向是金、水'), false)
  assert.equal(text.includes('報告建議喜用金、水，白話就是喜用金、水'), false)
  assert.equal(text.includes('喜用金、水，白話就是喜用金、水'), false)
  assert.equal(text.includes('白話說，不是全好或全壞，而是有些地方順、有些地方需要靠後天調整。白話說'), false)
  assert.equal(text.includes('姓名學不是單純大吉，也不是單純不好，而是有幫助的地方，也有需要靠後天調整的地方'), false)
  assert.equal(text.includes('喜用金、水，也就是喜用金、水'), false)
  assert.equal(text.includes('傷官見官，因此不能直接說成單一正官格'), false)
  assert.equal(text.includes('後天調整。。'), false)
  assert.equal(text.includes('。。'), false)
  for (const literary of ['亦', '故', '宜', '此命', '原局']) {
    assert.equal(text.includes(literary), false, `白話總結應避免文言詞：${literary}`)
  }

  for (const forbidden of ['必定發財', '必定破財', '一定升遷', '保證開運', '絕對準確', '命中注定不可改', '吉神匯聚', '凶煞聚集']) {
    assert.equal(text.includes(forbidden), false, `個人化文章不得包含：${forbidden}`)
  }
  if (text.includes('三才為金木水') || text.includes('天人格相剋')) {
    assert.ok(text.includes('不是全好或全壞'))
    assert.ok(text.includes('有些地方順、有些地方需要靠後天調整'))
  }

  console.log('personalized explanation test passed')
} finally {
  await server.close()
}
