import assert from 'node:assert/strict'
import { createSsrTestServer } from '../utils/viteTestServer.js'
import { assertNoForbiddenPhrases } from '../utils/forbiddenPhrases.js'
import { SYSTEM_FORBIDDEN_PHRASES, xieJinwenBaseCase } from '../goldenCases/baziGoldenCases.js'

const server = await createSsrTestServer('visible-text-collector')

try {
  const { analyzeBirth } = await server.ssrLoadModule('/src/lib/analysis.ts')
  const { collectVisibleReportText } = await server.ssrLoadModule('/src/lib/reportVisibleText.ts')

  const result = analyzeBirth(xieJinwenBaseCase.input)
  const withInternalNoise = {
    ...result,
    validatorErrors: ['必定發財', '正月己丑'],
    debugLogs: ['辰自刑', '申子辰水局'],
    prompt: '純正官格',
    sanitizerForbiddenTerms: ['姓名五格皆吉'],
  }

  const text = collectVisibleReportText(withInternalNoise)
  assert.ok(text.includes('丁卯'))
  assert.ok(text.includes('甲辰'))
  assert.ok(text.includes('癸丑'))
  assert.ok(text.includes('壬子'))
  assert.ok(text.includes('正月'))
  assert.ok(text.includes('庚寅'))
  assert.ok(text.includes('旺衰v2'))
  assert.ok(text.includes('歲運'))
  assert.ok(text.includes('謝'))
  assert.equal(text.includes('validatorErrors'), false)
  assert.equal(text.includes('debugLogs'), false)
  assert.equal(text.includes('prompt'), false)
  assert.equal(text.includes('sanitizerForbiddenTerms'), false)
  assertNoForbiddenPhrases(assert, text, SYSTEM_FORBIDDEN_PHRASES, 'visible collector output')

  console.log('visible text collector test passed')
} finally {
  await server.close()
}
