export const RULE_VERSIONS = {
  baziAdapter: 'lunar-javascript',
  tenGodEngine: 'v1.0',
  hiddenStemEngine: 'v1.0',
  branchInteractionEngine: 'v1.0',
  luckCycleEngine: 'v1.0',
  solarTimeEngine: 'v1.0',
  strengthV2Engine: 'v2.0',
  fortuneV2Engine: 'v2.0',
  nameWugeEngine: 'v1.0',
  wuge81Engine: 'v1.0',
  sancaiEngine: 'v1.0',
  shenshaEngine: 'v4.1',
  reportValidator: 'v1.0',
  pdfRenderer: 'v1.0',
} as const

export function formatRuleVersionsForReport(): string {
  return [
    `排盤 ${RULE_VERSIONS.baziAdapter}`,
    `十神 ${RULE_VERSIONS.tenGodEngine}`,
    `刑沖合害 ${RULE_VERSIONS.branchInteractionEngine}`,
    `旺衰 ${RULE_VERSIONS.strengthV2Engine}`,
    `歲運 ${RULE_VERSIONS.fortuneV2Engine}`,
    `神煞 ${RULE_VERSIONS.shenshaEngine}`,
    `姓名學 ${RULE_VERSIONS.nameWugeEngine}`,
    `Validator ${RULE_VERSIONS.reportValidator}`,
  ].join('｜')
}
