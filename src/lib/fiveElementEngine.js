export const FIVE_ELEMENT_MODEL_NOTE = '五行分數為系統自訂權重模型，僅供相對比較。'

export function getFiveElementModel(result) {
  if (!result?.elementStats) throw new Error('Missing required input')
  return {
    stats: result.elementStats,
    strongestElement: result.strongestElement,
    weakestElement: result.weakestElement,
    note: result.elementModelNote || FIVE_ELEMENT_MODEL_NOTE,
    reason: result.elementReason || '',
  }
}
