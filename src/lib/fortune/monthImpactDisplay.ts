import type { FortuneV2MonthImpact } from '../../types'

const CONSERVATIVE_MONTH_SUMMARY: Record<string, string> = {
  庚寅: '木金互見，助力與洩耗並存；寅木洩水，宜控管承諾。',
  辛卯: '木金互見，助力與洩耗並存；卯木洩水，宜注意溝通與支出。',
  壬辰: '土水互見，助力與壓力並存；官殺壓力需留意。',
  癸巳: '火水互見，助力與耗身並存；巳火耗水，宜保守規劃。',
  甲午: '木火偏旺，洩耗加重；對中和偏弱／身偏弱者壓力較高。',
  乙未: '木土偏旺，剋洩壓力升高；宜避免過度承諾。',
  丙申: '火金互見，收入議題與資源支持並存；仍需控管支出。',
  丁酉: '火金互見，財星與印星並見；宜穩健處理財務。',
  戊戌: '土氣偏旺，工作責任與壓力較重；宜保守應對。',
  己亥: '土水互見，壓力與支援並存；合約與決策需多確認。',
  庚子: '金水偏旺，較能補益日主；適合整理資源與修正策略。',
  辛丑: '土金互見，助力與壓力並存；宜收斂整理，不宜冒進。',
}

export function formatMonthImpactSummary(month: FortuneV2MonthImpact): string {
  if (CONSERVATIVE_MONTH_SUMMARY[month.pillar]) return CONSERVATIVE_MONTH_SUMMARY[month.pillar]
  const riskText = month.riskFactors[0] ? `；${month.riskFactors[0]}` : ''
  return `${month.theme}${riskText || `；${month.suggestion}`}`
}

export function buildFortuneV2YearlySection(months: FortuneV2MonthImpact[]): string {
  if (!months.length) return ''
  const byPillar = Object.fromEntries(months.map((m) => [m.pillar, m]))
  const opening = byPillar.庚寅 && byPillar.辛卯
    ? '正月庚寅、二月辛卯，天干金印透出，但地支寅卯木亦帶來輸出與洩身，屬助力與壓力並存，適合規劃學習、整理資源，但不宜過度承諾。'
    : ''
  const spring = byPillar.壬辰 && byPillar.癸巳
    ? '三月壬辰、四月癸巳，天干水氣有幫身作用，但辰土與巳火仍帶來壓力與耗身，宜分清合作邊界。'
    : ''
  const autumn = byPillar.丙申 && byPillar.丁酉
    ? '七月丙申、八月丁酉，財星與印星並見，收入與資源議題同步出現，但仍需控管支出與工作負荷。'
    : ''
  const winter = byPillar.庚子 && byPillar.辛丑
    ? '冬月庚子金水較能補益日主，適合整理資源；臘月辛丑雖有辛金支援，但丑土亦帶壓力，宜收斂整理。'
    : ''
  return [opening, spring, autumn, winter].filter(Boolean).join(' ')
}
