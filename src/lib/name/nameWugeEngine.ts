import { getKangxiStroke, type KangxiStrokeResult } from './kangxiStrokes'
import { analyzeSancai, type SancaiAnalysis } from './sancaiEngine'
import { analyzeWugeFortune, type WugeFortuneAnalysis } from './wugeFortuneEngine'

export interface NameStrokeResult {
  fullName: string
  chars: KangxiStrokeResult[]
  verified: boolean
  source: string | null
  status?: '待校驗'
  missingChars?: string[]
}

export interface NameWugeResult {
  fullName: string
  nameType?: '單姓雙名'
  verified: boolean
  status?: '待校驗'
  reason?: string
  missingChars?: string[]
  chars?: KangxiStrokeResult[]
  strokes?: {
    surname: number
    given1: number
    given2: number
  }
  wuge?: {
    heaven: number
    personality: number
    earth: number
    outer: number
    total: number
  }
  source?: string | null
  note?: string
  wugeFortune?: WugeFortuneAnalysis
  sancai?: SancaiAnalysis
  wugeFortuneVerified: boolean
  finalNote?: string
}

export const NAME_WUGE_NOTE =
  '姓名學資料依本系統內建 81 數理與三才配置表判讀，不同流派可能有差異。'

export function calculateNameStrokes(fullName: string): NameStrokeResult {
  const name = String(fullName ?? '').trim()
  const chars = [...name].map((char) => getKangxiStroke(char))
  const missingChars = chars.filter((c) => !c.verified).map((c) => c.char)
  const verified = chars.length > 0 && missingChars.length === 0

  return {
    fullName: name,
    chars,
    verified,
    source: verified ? '康熙筆畫字典' : null,
    ...(verified ? {} : { status: '待校驗' as const, missingChars }),
  }
}

export function calculateWuge(fullName: string): NameWugeResult {
  const name = String(fullName ?? '').trim()
  const chars = [...name]
  const strokeResult = calculateNameStrokes(name)

  if (chars.length !== 3) {
    return {
      fullName: name,
      verified: false,
      status: '待校驗',
      reason: '目前僅支援單姓雙名，複姓或單名需另行實作',
      missingChars: strokeResult.missingChars ?? [],
      chars: strokeResult.chars,
      source: strokeResult.source,
      wugeFortuneVerified: false,
    }
  }

  if (!strokeResult.verified) {
    return {
      fullName: name,
      verified: false,
      status: '待校驗',
      reason: '康熙筆畫資料庫尚有缺字',
      missingChars: strokeResult.missingChars ?? [],
      chars: strokeResult.chars,
      source: strokeResult.source,
      wugeFortuneVerified: false,
    }
  }

  const [surnameChar, given1Char, given2Char] = strokeResult.chars
  const surname = surnameChar.strokes as number
  const given1 = given1Char.strokes as number
  const given2 = given2Char.strokes as number
  const total = surname + given1 + given2
  const personality = surname + given1
  const wuge = {
    heaven: surname + 1,
    personality,
    earth: given1 + given2,
    outer: total - personality + 1,
    total,
  }
  const wugeFortune = analyzeWugeFortune(wuge)
  const sancai = analyzeSancai({
    heaven: wuge.heaven,
    personality: wuge.personality,
    earth: wuge.earth,
  })

  return {
    fullName: name,
    nameType: '單姓雙名',
    verified: true,
    chars: strokeResult.chars,
    strokes: { surname, given1, given2 },
    wuge,
    wugeFortune,
    sancai,
    source: '康熙筆畫字典',
    note: NAME_WUGE_NOTE,
    wugeFortuneVerified: wugeFortune.verified,
    finalNote: '姓名學結果僅供參考，不同流派可能有差異。',
  }
}

export function analyzeNameFortune(fullName: string) {
  const result = calculateWuge(fullName)
  return {
    fullName: result.fullName,
    strokesVerified: result.verified,
    wugeVerified: Boolean(result.wuge),
    wuge: result.wuge,
    wugeFortune: result.wugeFortune ?? {
      verified: false,
      source: '系統內建 81 數理表',
      items: {},
      note: '五格數值尚未校驗，暫不輸出 81 數理吉凶。',
    },
    sancai: result.sancai ?? {
      verified: false,
      combination: '',
      level: '待校驗',
      summary: '姓名五格尚未校驗，暫不輸出三才配置定論。',
      source: '系統內建三才配置表',
      tableCoverage: 'partial',
    },
    finalNote: result.finalNote ?? '姓名學結果僅供參考，不同流派可能有差異。',
  }
}
