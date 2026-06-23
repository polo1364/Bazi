import { SANCAI_SOURCE, SANCAI_TABLE, SANCAI_TABLE_COVERAGE, type SancaiLevel } from './sancaiTable'

export type SancaiElement = '木' | '火' | '土' | '金' | '水'

export interface SancaiElements {
  heaven: { number: number; element: SancaiElement }
  personality: { number: number; element: SancaiElement }
  earth: { number: number; element: SancaiElement }
  combination: string
}

export interface SancaiAnalysis extends SancaiElements {
  verified: boolean
  level: SancaiLevel
  summary: string
  source: string
  tableCoverage: 'partial' | 'full'
}

export function getNumberElement(number: number): SancaiElement {
  const tail = Math.abs(Number(number)) % 10
  if (tail === 1 || tail === 2) return '木'
  if (tail === 3 || tail === 4) return '火'
  if (tail === 5 || tail === 6) return '土'
  if (tail === 7 || tail === 8) return '金'
  return '水'
}

export function getSancaiElements({ heaven, personality, earth }: {
  heaven: number
  personality: number
  earth: number
}): SancaiElements {
  const result = {
    heaven: { number: heaven, element: getNumberElement(heaven) },
    personality: { number: personality, element: getNumberElement(personality) },
    earth: { number: earth, element: getNumberElement(earth) },
  }
  return {
    ...result,
    combination: `${result.heaven.element}${result.personality.element}${result.earth.element}`,
  }
}

export function analyzeSancai(input: { heaven: number; personality: number; earth: number }): SancaiAnalysis {
  const elements = getSancaiElements(input)
  const item = SANCAI_TABLE[elements.combination]
  if (!item) {
    return {
      ...elements,
      verified: false,
      level: '待校驗',
      summary: '此三才配置尚未收錄，暫不輸出保證性吉凶定論。',
      source: SANCAI_SOURCE,
      tableCoverage: SANCAI_TABLE_COVERAGE,
    }
  }

  return {
    ...elements,
    verified: true,
    level: item.level,
    summary: item.summary,
    source: SANCAI_SOURCE,
    tableCoverage: SANCAI_TABLE_COVERAGE,
  }
}
