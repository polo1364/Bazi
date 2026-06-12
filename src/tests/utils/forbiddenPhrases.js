export function assertNoForbiddenPhrases(assert, text, forbiddenPhrases, scope = 'visible text') {
  const source = String(text ?? '')
  const hits = forbiddenPhrases.filter((phrase) => source.includes(phrase))
  assert.deepEqual(hits, [], `${scope} 不得包含禁止詞：${hits.join('、')}`)
}

export function findForbiddenPhrases(text, forbiddenPhrases) {
  const source = String(text ?? '')
  return forbiddenPhrases.filter((phrase) => source.includes(phrase))
}
