import type { AnalysisResult, BirthInput } from '../types'

function normalizeInput(input: BirthInput) {
  return {
    inputMode: input.inputMode,
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    uncertainHour: input.uncertainHour,
    manualPillars: input.manualPillars,
    name: input.name.trim(),
    gender: input.gender,
    analysisYear: input.analysisYear,
    topic: input.topic,
    query: input.query.trim(),
    compoundSurname: input.compoundSurname.trim(),
  }
}

function normalizeResult(result: AnalysisResult) {
  return {
    pillars: [result.chart.year, result.chart.month, result.chart.day, result.chart.hour].map((p) => `${p.stem}${p.branch}`),
    strength: result.strength,
    favorableElements: result.favorableElements,
    pattern: result.pattern,
    wuge: result.wuge
      ? {
          天格: result.wuge.天格,
          人格: result.wuge.人格,
          地格: result.wuge.地格,
          外格: result.wuge.外格,
          總格: result.wuge.總格,
        }
      : null,
  }
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function aiCacheKey(
  kind: 'narrative' | 'question',
  input: BirthInput,
  result: AnalysisResult,
  extra = '',
): Promise<string> {
  const payload = JSON.stringify({
    v: 2,
    kind,
    input: normalizeInput(input),
    result: normalizeResult(result),
    extra: extra.trim(),
  })
  return `${kind}:${await sha256(payload)}`
}
