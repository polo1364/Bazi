import type { AnalysisResult } from '../types'
import type { AiNarrativeResult } from './aiNarrative'
import { sanitizeAiNarrativeObject, sanitizeAiNarrativeText } from './aiNarrativeSanitizer'
import { collectVisibleReportText } from './reportVisibleText'
import { validateReport as defaultValidateReport } from './reportValidator.js'

type ReportValidator = (reportData: object, reportText: string) => { valid: boolean; errors: string[] }

export interface SafeAiNarrativeResult {
  result: AnalysisResult
  usedAi: boolean
  wasSanitized: boolean
  validatorErrors: string[]
  originalValidatorErrors: string[]
  sanitizedNarrative: AiNarrativeResult
}

export interface SafePdfResult {
  result: AnalysisResult
  usedFallback: boolean
  wasSanitized: boolean
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
    shenshaImplemented: result.shensha?.some((s) => s.verified === true) ?? false,
    shensha: { items: result.shensha ?? [] },
    nameStrokesVerified: result.wuge?.verified === true,
    nameWuge: result.wuge ? { verified: result.wuge.verified === true } : undefined,
    wugeFortune: result.wuge?.wugeFortune,
    wugeFortuneVerified: result.wuge?.wugeFortuneVerified === true,
    sancai: result.wuge?.sancai,
    sancaiVerified: Boolean(result.wuge?.sancai && 'verified' in result.wuge.sancai && result.wuge.sancai.verified === true),
    ruleVersions: result.ruleVersions,
  }
}

export const collectReportVisibleText = collectVisibleReportText

export const buildReportValidationText = collectReportVisibleText

export function validateAnalysisResult(
  result: AnalysisResult,
  validateReport: ReportValidator = defaultValidateReport,
): { valid: boolean; errors: string[] } {
  return validateReport(buildReportValidationData(result), collectReportVisibleText(result))
}

function sanitizeAiNarrative(aiNarrative: AiNarrativeResult): AiNarrativeResult {
  return sanitizeAiNarrativeObject(aiNarrative)
}

function applyNarrative(baseResult: AnalysisResult, aiNarrative: AiNarrativeResult): AnalysisResult {
  return {
    ...baseResult,
    summary: aiNarrative.summary,
    detailText: aiNarrative.detailText,
    topicAnalysis: aiNarrative.topicAnalysis,
    aiSections: aiNarrative.sections,
  }
}

function sanitizeAnalysisResultText(result: AnalysisResult): AnalysisResult {
  return {
    ...result,
    summary: sanitizeAiNarrativeText(result.summary),
    detailText: sanitizeAiNarrativeText(result.detailText),
    topicAnalysis: sanitizeAiNarrativeText(result.topicAnalysis),
    aiSections: result.aiSections ? sanitizeAiNarrativeObject(result.aiSections) : undefined,
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
  const rawCandidateResult = applyNarrative(baseResult, aiNarrative)
  const originalValidation = validateAnalysisResult(rawCandidateResult, validateReport)
  const sanitizedNarrative = sanitizeAiNarrative(aiNarrative)
  const wasSanitized = JSON.stringify(sanitizedNarrative) !== JSON.stringify(aiNarrative)
  const candidateResult = applyNarrative(baseResult, sanitizedNarrative)

  const validation = validateAnalysisResult(candidateResult, validateReport)
  if (validation.valid) {
    return {
      result: candidateResult,
      usedAi: true,
      wasSanitized,
      validatorErrors: [],
      originalValidatorErrors: originalValidation.valid ? [] : originalValidation.errors,
      sanitizedNarrative,
    }
  }

  return {
    result: baseResult,
    usedAi: false,
    wasSanitized,
    validatorErrors: validation.errors,
    originalValidatorErrors: originalValidation.valid ? [] : originalValidation.errors,
    sanitizedNarrative,
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
  const sanitizedResult = sanitizeAnalysisResultText(result)
  const wasSanitized = JSON.stringify(sanitizedResult) !== JSON.stringify(result)
  const validation = validateAnalysisResult(sanitizedResult, validateReport)
  if (validation.valid) {
    return { result: sanitizedResult, usedFallback: false, wasSanitized, validatorErrors: [] }
  }

  return {
    result: fallbackResult,
    usedFallback: true,
    wasSanitized,
    validatorErrors: validation.errors,
  }
}
