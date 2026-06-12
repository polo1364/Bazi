export interface KangxiStrokeEntry {
  strokes: number
  source: string
  verified: true
}

export interface KangxiStrokeResult {
  char: string
  strokes: number | null
  source: string | null
  verified: boolean
  status?: '待校驗'
  reason?: string
}

export const KANGXI_STROKES: Record<string, KangxiStrokeEntry> = {
  '謝': {
    strokes: 17,
    source: '康熙筆畫字典',
    verified: true,
  },
  '進': {
    strokes: 15,
    source: '康熙筆畫字典',
    verified: true,
  },
  '文': {
    strokes: 4,
    source: '康熙筆畫字典',
    verified: true,
  },
}

export function getKangxiStroke(char: string): KangxiStrokeResult {
  const key = [...String(char ?? '')][0] ?? ''
  const entry = KANGXI_STROKES[key]
  if (!entry) {
    return {
      char: key,
      strokes: null,
      source: null,
      verified: false,
      status: '待校驗',
      reason: '康熙筆畫資料庫尚無此字',
    }
  }

  return {
    char: key,
    strokes: entry.strokes,
    source: entry.source,
    verified: entry.verified,
  }
}
