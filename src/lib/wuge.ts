import type { Gender, WugeResult } from '../types'
import { calculateWuge as calculateVerifiedWuge, NAME_WUGE_NOTE } from './name/nameWugeEngine'

export function calculateWuge(name: string, _gender: Gender, compoundHint = ''): WugeResult {
  const trimmed = name.trim()
  const verified = calculateVerifiedWuge(trimmed)
  void compoundHint

  if (!trimmed) {
    return {
      天格: 0, 人格: 0, 地格: 0, 外格: 0, 總格: 0,
      strokes: [], luck: {}, details: {}, unknownChars: [], surnameLength: 0,
      sancai: null, charAnalysis: [], verified: false, status: '待校驗',
      source: null, chars: [], wugeFortuneVerified: false,
      note: NAME_WUGE_NOTE, finalNote: '姓名學結果僅供參考，不同流派可能有差異。',
    }
  }

  const chars = verified.chars ?? []
  const strokes = chars.map((c) => c.strokes ?? 0)
  const nums = verified.wuge
    ? {
        天格: verified.wuge.heaven,
        人格: verified.wuge.personality,
        地格: verified.wuge.earth,
        外格: verified.wuge.outer,
        總格: verified.wuge.total,
      }
    : { 天格: 0, 人格: 0, 地格: 0, 外格: 0, 總格: 0 }

  return {
    ...nums,
    strokes,
    luck: {},
    details: {},
    unknownChars: verified.missingChars ?? [],
    surnameLength: verified.nameType === '單姓雙名' ? 1 : 0,
    sancai: verified.sancai ?? null,
    charAnalysis: [],
    verified: verified.verified,
    status: verified.status,
    reason: verified.reason,
    source: verified.source ?? null,
    chars,
    nameType: verified.nameType,
    wugeFortune: verified.wugeFortune,
    wugeFortuneVerified: verified.wugeFortuneVerified,
    note: verified.note ?? NAME_WUGE_NOTE,
    finalNote: verified.finalNote,
  }
}
