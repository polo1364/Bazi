import type { Gender, WugeResult } from '../types'
import {
  getNameStrokes, getUnknownChars, getWugeLuck, getSancai,
  detectCompoundSurname, getNameCharAnalysis,
} from './dataStore'
import { normalizeWugeNumber } from './builtinData'

function luck(n: number): string {
  if (n <= 0) return getWugeLuck(1).luck
  return getWugeLuck(normalizeWugeNumber(n)).luck
}

function detail(n: number) {
  const d = getWugeLuck(normalizeWugeNumber(n))
  return { number: n, luck: d.luck, title: d.title, meaning: d.meaning }
}

export function calculateWuge(name: string, _gender: Gender, compoundHint = ''): WugeResult {
  const trimmed = name.trim()
  const chars = [...trimmed]
  const strokes = getNameStrokes(trimmed)
  const unknownChars = getUnknownChars(trimmed)
  const charAnalysis = getNameCharAnalysis(trimmed)

  if (chars.length === 0) {
    return {
      天格: 0, 人格: 0, 地格: 0, 外格: 0, 總格: 0,
      strokes: [], luck: {}, details: {}, unknownChars: [], surnameLength: 0,
      sancai: null, charAnalysis: [],
    }
  }

  const compound = detectCompoundSurname(trimmed)
  const surnameLen = compound?.name.length ?? (compoundHint && trimmed.startsWith(compoundHint) ? compoundHint.length : (trimmed.length >= 2 ? 1 : 1))
  const sStrokes = strokes.slice(0, surnameLen)
  const gStrokes = strokes.slice(surnameLen)
  const sSum = sStrokes.reduce((a, b) => a + b, 0)
  const gSum = gStrokes.reduce((a, b) => a + b, 0)

  let 天格: number, 人格: number, 地格: number, 外格: number, 總格: number

  if (chars.length === 1) {
    天格 = strokes[0] + 1; 人格 = strokes[0] + 1; 地格 = strokes[0] + 1; 外格 = 2; 總格 = strokes[0]
  } else if (chars.length === 2) {
    天格 = strokes[0] + 1; 人格 = strokes[0] + strokes[1]; 地格 = strokes[1] + 1; 外格 = 2; 總格 = sSum + gSum
  } else {
    天格 = sSum + (surnameLen === 1 ? 1 : 0)
    人格 = sStrokes[sStrokes.length - 1] + gStrokes[0]
    地格 = gSum + (gStrokes.length === 1 ? 1 : 0)
    總格 = sSum + gSum
    外格 = surnameLen === 1 && gStrokes.length >= 2 ? strokes[0] + gStrokes[gStrokes.length - 1] : 總格 - 人格 + 1
    if (surnameLen === 2) 外格 = sStrokes[0] + (gStrokes.length >= 1 ? gStrokes[gStrokes.length - 1] : 0)
  }

  const keys = ['天格', '人格', '地格', '外格', '總格'] as const
  const nums = { 天格, 人格, 地格, 外格, 總格 }
  const sancai = getSancai(天格, 人格, 地格)

  return {
    ...nums,
    strokes,
    luck: Object.fromEntries(keys.map((k) => [k, luck(nums[k])])),
    details: Object.fromEntries(keys.map((k) => [k, detail(nums[k])])),
    unknownChars,
    surnameLength: surnameLen,
    sancai,
    charAnalysis,
  }
}
