export function getStrengthModel(result) {
  if (!result) throw new Error('Missing required input')
  return {
    label: result.strengthLabel,
    confidence: result.strengthConfidence || '中',
    score: result.strength,
    scoreNote: result.strengthScoreNote || '此分數為系統模型估算，不是命理絕對值',
    reasons: result.strengthBasis || [],
  }
}
