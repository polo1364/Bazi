export interface PillarNarrativeInput {
  pillarName: string
  pillar?: string
  stem: string
  branch: string
  stemTenGod: string
  branchMainQi: {
    stem: string
    tenGod: string
  }
  hiddenStems: Array<{ stem: string; qi: string; tenGod: string }>
}

export function buildPillarNarrative(pillar: PillarNarrativeInput): string {
  const pillarText = pillar.pillar || `${pillar.stem}${pillar.branch}`
  if (pillar.pillarName === '日柱' && pillar.stemTenGod === '日主') {
    return `${pillar.pillarName}${pillarText}為日主坐${pillar.branchMainQi.tenGod}之地`
  }
  return `${pillar.pillarName}${pillarText}為${pillar.stemTenGod}坐${pillar.branchMainQi.tenGod}`
}

export function buildPillarNaturalSummary(pillar: PillarNarrativeInput): string {
  return buildPillarNarrative(pillar)
}
