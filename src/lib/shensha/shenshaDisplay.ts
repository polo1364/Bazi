const KEY_LABELS: Record<string, string> = {
  yearStem: '年干',
  monthStem: '月干',
  dayStem: '日干',
  hourStem: '時干',
  yearBranch: '年支',
  monthBranch: '月支',
  dayBranch: '日支',
  hourBranch: '時支',
  gender: '性別',
  yearStemYinYang: '年干陰陽',
  season: '季節',
}

const PILLAR_LABELS: Record<string, string> = {
  year: '年柱',
  month: '月柱',
  day: '日柱',
  hour: '時柱',
}

export function formatShenshaKey(key: string): string {
  return KEY_LABELS[key] ?? key
}

export function formatPillarKey(key: string): string {
  return PILLAR_LABELS[key] ?? key
}

export function formatShenshaLookupKey(value: string | Record<string, string> | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return Object.entries(value).map(([key, val]) => `${formatShenshaKey(key)}：${val}`).join('、')
}

export function formatShenshaTargetBranches(value: string[] | Record<string, string[]> | undefined): string {
  if (!value) return '無'
  if (Array.isArray(value)) return value.join('、') || '無'
  return Object.entries(value)
    .map(([key, branches]) => `${formatShenshaKey(key)}：${branches.join('、') || '無'}`)
    .join('；')
}

export function formatShenshaMatchedPillars(items: Array<{ pillar: string; stem?: string; branch?: string; basis?: string }> | undefined): string {
  if (!items?.length) return '未命中'
  return items.map((item) => {
    const value = item.stem ?? item.branch ?? ''
    const basis = item.basis ? `（依${formatShenshaKey(item.basis)}）` : ''
    return `${formatPillarKey(item.pillar)}：${value}${basis}`
  }).join('、')
}

export function formatShenshaMatchedBranches(items: Array<{ pillar: string; branch: string }> | undefined): string {
  if (!items?.length) return '未命中'
  return items.map((item) => `${formatPillarKey(item.pillar)}：${item.branch}`).join('、')
}
