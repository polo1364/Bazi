import type { AnalysisResult } from '../../types'

export function buildHealthAdvice(result: Pick<AnalysisResult, 'strengthV2'>): string {
  const label = result.strengthV2?.label || '系統初判'
  return `五行簡化模型中水分數較高，但旺衰 v2 仍判為${label}；2026 為火旺財星之年，宜留意疲勞、睡眠、壓力管理與泌尿系統保養。`
}
