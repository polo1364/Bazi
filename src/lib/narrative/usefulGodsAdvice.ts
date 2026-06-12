import type { AnalysisResult, ElementAdvice } from '../../types'

const FALLBACK_BY_ELEMENT: Record<string, string> = {
  金: '金：可作印星補助，重點在制度、學習、專業工具、整理流程、紀律訓練與邊界感。可對應白色、金色、銀灰色，方位參考西方與西北方。',
  水: '水：可作比劫輔助，重點在休息、彈性、資訊流通、學習、資源整合與恢復力。可對應黑色、深藍色、湖水色，方位參考北方。',
}

function fromElementAdvice(advice: ElementAdvice): string {
  if (FALLBACK_BY_ELEMENT[advice.element]) return FALLBACK_BY_ELEMENT[advice.element]
  return `${advice.element}：可作喜用神初判參考，可對應顏色 ${advice.colors.join('、')}，方位參考${advice.directions.join('、')}。`
}

export function buildUsefulGodsAdvice(result: Pick<AnalysisResult, 'strengthV2' | 'elementAdvice'>): string {
  const useful = result.strengthV2?.usefulGods?.useful?.length
    ? result.strengthV2.usefulGods.useful
    : result.elementAdvice.map((a) => a.element)
  const adviceByElement = new Map(result.elementAdvice.map((a) => [a.element, a]))
  const lines = useful.map((element) => {
    const advice = adviceByElement.get(element)
    return advice ? fromElementAdvice(advice) : FALLBACK_BY_ELEMENT[element] || `${element}：可作喜用神初判參考，需依實際情境保守運用。`
  })
  lines.push('以上為喜用神初判的生活化參考，不作絕對開運保證。')
  return lines.join('\n')
}

export const DEFAULT_USEFUL_GODS_ADVICE_TEXT = [
  FALLBACK_BY_ELEMENT.金,
  FALLBACK_BY_ELEMENT.水,
  '以上為喜用神初判的生活化參考，不作絕對開運保證。',
].join('\n')
