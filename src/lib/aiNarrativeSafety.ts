import type { AiSections, AnalysisResult } from '../types'
import type { AiNarrativeResult } from './aiNarrative'
import { validateReport as defaultValidateReport } from './reportValidator.js'

type ReportValidator = (reportData: object, reportText: string) => { valid: boolean; errors: string[] }

export interface SafeAiNarrativeResult {
  result: AnalysisResult
  usedAi: boolean
  validatorErrors: string[]
}

export interface SafePdfResult {
  result: AnalysisResult
  usedFallback: boolean
  validatorErrors: string[]
}

function getBranches(result: AnalysisResult): string[] {
  return [
    result.chart.year.branch,
    result.chart.month.branch,
    result.chart.day.branch,
    result.chart.hour.branch,
  ]
}

export function buildReportValidationData(result: AnalysisResult): object {
  const firstYear = result.liunian[0]?.year
  return {
    branches: getBranches(result),
    relations: result.relations,
    flowMonths: firstYear
      ? {
          year: firstYear,
          months: result.liuyueDetails.length ? result.liuyueDetails : result.liuyue,
        }
      : undefined,
    strength: { reasons: result.strengthBasis ?? [] },
    combineTransformImplemented: false,
    shenshaImplemented: false,
    nameStrokesVerified: false,
  }
}

export function buildReportValidationText(result: AnalysisResult): string {
  const aiSections = result.aiSections ? Object.values(result.aiSections) : []
  return [
    result.summary,
    result.detailText,
    result.topicAnalysis,
    ...aiSections,
  ]
    .filter((text): text is string => Boolean(text?.trim()))
    .join('\n')
}

export function validateAnalysisResult(
  result: AnalysisResult,
  validateReport: ReportValidator = defaultValidateReport,
): { valid: boolean; errors: string[] } {
  return validateReport(buildReportValidationData(result), buildReportValidationText(result))
}

function normalizeAiSections(sections: Partial<AiSections> | undefined): AiSections | undefined {
  if (!sections) return undefined
  return {
    career: sections.career?.trim() || '',
    wealth: sections.wealth?.trim() || '',
    relationship: sections.relationship?.trim() || '',
    health: sections.health?.trim() || '',
    yearly: sections.yearly?.trim() || '',
    nameAdvice: sections.nameAdvice?.trim() || '',
    remedies: sections.remedies?.trim() || '',
  }
}

export function safeApplyAiNarrative({
  baseResult,
  aiNarrative,
  validateReport = defaultValidateReport,
}: {
  baseResult: AnalysisResult
  aiNarrative: AiNarrativeResult
  validateReport?: ReportValidator
}): SafeAiNarrativeResult {
  const candidateResult: AnalysisResult = {
    ...baseResult,
    summary: aiNarrative.summary,
    detailText: aiNarrative.detailText,
    topicAnalysis: aiNarrative.topicAnalysis,
    aiSections: normalizeAiSections(aiNarrative.sections),
  }

  const validation = validateAnalysisResult(candidateResult, validateReport)
  if (validation.valid) {
    return { result: candidateResult, usedAi: true, validatorErrors: [] }
  }

  return {
    result: baseResult,
    usedAi: false,
    validatorErrors: validation.errors,
  }
}

export function getSafePdfResult({
  result,
  fallbackResult,
  validateReport = defaultValidateReport,
}: {
  result: AnalysisResult
  fallbackResult: AnalysisResult
  validateReport?: ReportValidator
}): SafePdfResult {
  const validation = validateAnalysisResult(result, validateReport)
  if (validation.valid) {
    return { result, usedFallback: false, validatorErrors: [] }
  }

  return {
    result: fallbackResult,
    usedFallback: true,
    validatorErrors: validation.errors,
  }
}
