import { WUGE_81_NOTE, WUGE_81_SOURCE, WUGE_81_TABLE, type Wuge81Entry } from './wuge81Table'

export type WugeKey = 'heaven' | 'personality' | 'earth' | 'outer' | 'total'

export interface Wuge81Fortune extends Partial<Wuge81Entry> {
  number: number
  source?: string
  verified: boolean
  status?: '待校驗'
  reason?: string
}

export interface WugeFortuneAnalysis {
  verified: boolean
  source: string
  items: Record<WugeKey, Wuge81Fortune>
  note: string
}

export function getWuge81Fortune(number: number): Wuge81Fortune {
  const n = Number(number)
  const item = WUGE_81_TABLE[n]
  if (!Number.isInteger(n) || !item) {
    return {
      number: n,
      verified: false,
      status: '待校驗',
      reason: '81 數理表僅支援 1 到 81',
    }
  }

  return {
    ...item,
    source: WUGE_81_SOURCE,
  }
}

export function analyzeWugeFortune(wuge: Record<WugeKey, number>): WugeFortuneAnalysis {
  const keys: WugeKey[] = ['heaven', 'personality', 'earth', 'outer', 'total']
  const items = Object.fromEntries(
    keys.map((key) => [key, getWuge81Fortune(wuge[key])]),
  ) as Record<WugeKey, Wuge81Fortune>

  return {
    verified: keys.every((key) => items[key].verified),
    source: WUGE_81_SOURCE,
    items,
    note: WUGE_81_NOTE,
  }
}
