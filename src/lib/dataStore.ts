import { getAllCustomStrokes } from '../db'
import type { BaziChart, RelationItem } from '../types'
import { computeChartRelations as computeRelationsByRules } from './relations'
import {
  computeNayin, computeWugeLuck, evaluateSancaiBuiltin, getCharMeaningFallback,
  getPatternBuiltin, numToElementBuiltin, normalizeWugeNumber,
  isCjkChar, DAYMASTER_BUILTIN, ZODIAC_BY_BRANCH, SIMPLIFIED_TO_TRADITIONAL,
} from './builtinData'

export interface WugeLuckEntry {
  number: number
  luck: string
  title: string
  meaning: string
}

export interface NayinEntry {
  ganZhi: string
  nayin: string
  element: string
}

export interface JiaziEntry {
  ganZhi: string
  stem: string
  branch: string
  stemElement: string
  branchElement: string
  nayin: string
  nayinElement: string
  zodiac: string
  xunkong: string[]
  index: number
}

export interface CompoundSurname {
  name: string
  length: number
  origin: string
}

export interface ShenshaDef {
  type: string
  desc: string
  lookup: Record<string, string[]>
  lookupBy?: 'branch' | 'month' | 'stem'
}

export interface SancaiEntry {
  luck: string
  title: string
  meaning: string
}

export interface ZodiacEntry {
  branch: string
  name: string
  element: string
  traits: string
  lucky: string[]
  clash: string[]
}

export interface DaymasterProfile {
  element: string
  yin: boolean
  name: string
  traits: string
  strong: string
  weak: string
  body: string
}

export interface RelationDef {
  pair?: string[]
  chars?: string[]
  name: string
  desc: string
  element?: string
}

export interface RelationsDb {
  六沖: RelationDef[]
  六合: RelationDef[]
  六害: RelationDef[]
  三刑: RelationDef[]
  三合: RelationDef[]
}

export interface TengodEntry {
  category: string
  nature: string
  desc: string
  basic?: string
  persons?: string
  traits?: string
}

export interface PatternEntry {
  type: string
  desc: string
  favorable: string
  unfavorable: string
}

export interface StemBranchEntry {
  element: string
  traits: string
  [key: string]: unknown
}

export interface DatabaseStats {
  strokes: number
  customStrokes: number
  wuge: number
  nayin: number
  jiazi: number
  solarYears: number
  compoundSurnames: number
  charWuxing: number
  shensha: number
  sancai: number
  zodiac: number
  daymaster: number
  nameMeanings: number
  relations: number
  tengods: number
  patterns: number
  stemsBranches: number
}

type Cache = {
  strokes: Record<string, number>
  s2tVariants: Record<string, string>
  wuge: Record<string, WugeLuckEntry>
  nayin: Record<string, NayinEntry>
  jiazi: Record<string, JiaziEntry>
  solarTerms: Record<string, { name: string; month: number; day: number; termIndex: number }[]>
  compoundSurnames: { list: CompoundSurname[]; byName: Record<string, CompoundSurname> }
  charWuxing: Record<string, string>
  shensha: Record<string, ShenshaDef>
  sancai: { combinations: Record<string, SancaiEntry> }
  zodiac: { byBranch: Record<string, ZodiacEntry> }
  daymaster: Record<string, DaymasterProfile>
  nameMeanings: Record<string, string>
  relations: RelationsDb
  tengods: { categories: Record<string, string>; gods: Record<string, TengodEntry> }
  patterns: Record<string, PatternEntry>
  stemsBranches: { stems: Record<string, StemBranchEntry>; branches: Record<string, StemBranchEntry> }
  custom: Record<string, number>
}

let cache: Partial<Cache> = {}
let loadPromise: Promise<void> | null = null

async function loadJsonSafe<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(path)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as T
  } catch (e) {
    console.warn(`[dataStore] ${path} 載入失敗，使用內建資料`, e)
    return fallback
  }
}

export async function initDataStore(): Promise<void> {
  if (loadPromise) return loadPromise
  loadPromise = (async () => {
    let custom: Awaited<ReturnType<typeof getAllCustomStrokes>> = []
    try {
      custom = await getAllCustomStrokes()
    } catch (e) {
      console.warn('[dataStore] IndexedDB 自訂筆劃讀取失敗', e)
    }

    const [
      strokes, wuge, nayin, jiazi, solarTerms, compoundSurnames,
      charWuxingRaw, shensha, sancai, zodiac, daymaster, nameMeanings,
      relations, tengods, patterns, stemsBranches, s2tVariants,
    ] = await Promise.all([
      loadJsonSafe<Record<string, number>>('/data/strokes.json', {}),
      loadJsonSafe<Record<string, WugeLuckEntry>>('/data/wuge-luck.json', {}),
      loadJsonSafe<Record<string, NayinEntry>>('/data/nayin.json', {}),
      loadJsonSafe<Record<string, JiaziEntry>>('/data/jiazi.json', {}),
      loadJsonSafe<Record<string, { name: string; month: number; day: number; termIndex: number }[]>>('/data/solar-terms.json', {}),
      loadJsonSafe<{ list: CompoundSurname[]; byName: Record<string, CompoundSurname> }>('/data/compound-surnames.json', { list: [], byName: {} }),
      loadJsonSafe<{ chars: Record<string, string> }>('/data/char-wuxing.json', { chars: {} }),
      loadJsonSafe<Record<string, ShenshaDef>>('/data/shensha.json', {}),
      loadJsonSafe<{ combinations: Record<string, SancaiEntry> }>('/data/sancai.json', { combinations: {} }),
      loadJsonSafe<{ byBranch: Record<string, ZodiacEntry> }>('/data/zodiac.json', { byBranch: {} }),
      loadJsonSafe<Record<string, DaymasterProfile>>('/data/daymaster.json', {}),
      loadJsonSafe<Record<string, string>>('/data/name-meanings.json', {}),
      loadJsonSafe<RelationsDb>('/data/relations.json', { 六沖: [], 六合: [], 六害: [], 三刑: [], 三合: [] }),
      loadJsonSafe<{ categories: Record<string, string>; gods: Record<string, TengodEntry> }>('/data/tengods.json', { categories: {}, gods: {} }),
      loadJsonSafe<Record<string, PatternEntry>>('/data/patterns.json', {}),
      loadJsonSafe<{ stems: Record<string, StemBranchEntry>; branches: Record<string, StemBranchEntry> }>('/data/stems-branches.json', { stems: {}, branches: {} }),
      loadJsonSafe<Record<string, string>>('/data/s2t-variants.json', {}),
    ])
    cache = {
      strokes, wuge, nayin, jiazi, solarTerms, compoundSurnames,
      charWuxing: charWuxingRaw.chars ?? {},
      shensha, sancai, zodiac, daymaster, nameMeanings,
      relations, tengods, patterns, stemsBranches,
      s2tVariants,
      custom: Object.fromEntries(custom.map((c) => [c.char, c.strokes])),
    }
  })()
  return loadPromise
}

export function numToElement(n: number): string {
  return numToElementBuiltin(n)
}

export function getStrokeCountSync(char: string): number | null {
  if (cache.custom?.[char]) return cache.custom[char]
  if (cache.strokes?.[char]) return cache.strokes[char]
  const variants = resolveStrokeVariants(char)
  for (const v of variants) {
    if (cache.strokes?.[v]) return cache.strokes[v]
  }
  return null
}

function resolveStrokeVariants(char: string): string[] {
  const out: string[] = []
  const trad = cache.s2tVariants?.[char] ?? SIMPLIFIED_TO_TRADITIONAL[char]
  if (trad && trad !== char) out.push(trad)
  // 繁→簡反向
  for (const [simp, t] of Object.entries(cache.s2tVariants ?? {})) {
    if (t === char && simp !== char) out.push(simp)
  }
  for (const [simp, t] of Object.entries(SIMPLIFIED_TO_TRADITIONAL)) {
    if (t === char && simp !== char) out.push(simp)
  }
  return out
}

export function resolveStrokeVariant(char: string): string {
  return cache.s2tVariants?.[char] ?? SIMPLIFIED_TO_TRADITIONAL[char] ?? char
}

export function getStrokeCount(char: string): number {
  const known = getStrokeCountSync(char)
  if (known !== null) return known
  if (!isCjkChar(char)) return 8
  // 罕用字：繁簡轉換後再查一次（generate-strokes 已同步簡繁）
  return 8
}

export function getNameStrokes(name: string): number[] {
  return [...name].map(getStrokeCount)
}

export function getUnknownChars(name: string): string[] {
  return [...name].filter((c) => isCjkChar(c) && getStrokeCountSync(c) === null)
}

export function getWugeLuck(num: number): WugeLuckEntry {
  const key = String(normalizeWugeNumber(num))
  return cache.wuge?.[key] ?? computeWugeLuck(num)
}

export function getNayin(ganZhi: string): NayinEntry {
  if (cache.nayin?.[ganZhi]) return cache.nayin[ganZhi]
  const j = cache.jiazi?.[ganZhi]
  if (j) return { ganZhi, nayin: j.nayin, element: j.nayinElement }
  const computed = computeNayin(ganZhi)
  return {
    ganZhi,
    nayin: computed?.nayin ?? '大海水',
    element: computed?.element ?? '水',
  }
}

export function getJiazi(ganZhi: string): JiaziEntry | null {
  return cache.jiazi?.[ganZhi] ?? null
}

export function getCharWuxing(char: string): string {
  return cache.charWuxing?.[char]
    ?? cache.charWuxing?.[resolveStrokeVariant(char)]
    ?? numToElement(getStrokeCount(char))
}

export function getNameCharAnalysis(name: string): { char: string; strokes: number; wuxing: string; meaning: string }[] {
  return [...name.trim()].map((char) => {
    const strokes = getStrokeCount(char)
    const wuxing = getCharWuxing(char)
    const meaning = cache.nameMeanings?.[char]
      ?? cache.nameMeanings?.[resolveStrokeVariant(char)]
      ?? getCharMeaningFallback(char, strokes, wuxing)
    return { char, strokes, wuxing, meaning }
  })
}

export function detectCompoundSurname(name: string): CompoundSurname | null {
  const list = cache.compoundSurnames?.list ?? []
  for (const s of list.sort((a, b) => b.name.length - a.name.length)) {
    if (name.startsWith(s.name)) return s
  }
  return null
}

export function getSancai(tian: number, ren: number, di: number): SancaiEntry {
  const key = numToElement(tian) + numToElement(ren) + numToElement(di)
  return cache.sancai?.combinations[key]
    ?? evaluateSancaiBuiltin(numToElement(tian), numToElement(ren), numToElement(di))
}

export function getDaymasterProfile(stem: string): DaymasterProfile | null {
  return cache.daymaster?.[stem] ?? (DAYMASTER_BUILTIN[stem] ? {
    element: DAYMASTER_BUILTIN[stem].element,
    yin: ['乙', '丁', '己', '辛', '癸'].includes(stem),
    name: DAYMASTER_BUILTIN[stem].name,
    traits: DAYMASTER_BUILTIN[stem].traits,
    strong: '身強宜泄秀求財官',
    weak: '身弱宜印比助身',
    body: '',
  } : null)
}

export function getZodiacByBranch(branch: string): ZodiacEntry | null {
  const z = cache.zodiac?.byBranch[branch] ?? ZODIAC_BY_BRANCH[branch]
  if (!z) return null
  if ('lucky' in z) return z as ZodiacEntry
  return {
    branch,
    name: z.name,
    element: z.element,
    traits: z.traits,
    lucky: [],
    clash: [],
  }
}

export function getNameMeaning(char: string): string {
  return cache.nameMeanings?.[char]
    ?? cache.nameMeanings?.[resolveStrokeVariant(char)]
    ?? getCharMeaningFallback(char, getStrokeCount(char), getCharWuxing(char))
}

export function getSolarTermEntry(year: number, termIndex: number): { month: number; day: number } | null {
  const yearData = cache.solarTerms?.[String(year)]
  if (!yearData) return null
  const t = yearData.find((x) => x.termIndex === termIndex)
  return t ? { month: t.month, day: t.day } : null
}

export function getTengodDesc(name: string): TengodEntry | null {
  return cache.tengods?.gods[name] ?? null
}

export function getTengodCategories(): Record<string, string> {
  return cache.tengods?.categories ?? {}
}

export function getTengodGods(): Record<string, TengodEntry> {
  return cache.tengods?.gods ?? {}
}

export function getPattern(name: string): PatternEntry {
  return cache.patterns?.[name] ?? getPatternBuiltin(name)
}

export function getStemProfile(stem: string): StemBranchEntry | null {
  return cache.stemsBranches?.stems[stem] ?? null
}

export function getBranchProfile(branch: string): StemBranchEntry | null {
  return cache.stemsBranches?.branches[branch] ?? null
}

export function computeChartRelations(chart: BaziChart): RelationItem[] {
  return computeRelationsByRules(chart)
}

export function computeShensha(chart: BaziChart): { name: string; type: string; desc: string; found: boolean }[] {
  void chart
  return []
}

export function getDatabaseStats(): DatabaseStats {
  return {
    strokes: Object.keys(cache.strokes ?? {}).length,
    customStrokes: Object.keys(cache.custom ?? {}).length,
    wuge: Object.keys(cache.wuge ?? {}).length,
    nayin: Object.keys(cache.nayin ?? {}).length,
    jiazi: Object.keys(cache.jiazi ?? {}).length,
    solarYears: Object.keys(cache.solarTerms ?? {}).length,
    compoundSurnames: cache.compoundSurnames?.list.length ?? 0,
    charWuxing: Object.keys(cache.charWuxing ?? {}).length,
    shensha: Object.keys(cache.shensha ?? {}).length,
    sancai: Object.keys(cache.sancai?.combinations ?? {}).length,
    zodiac: 12,
    daymaster: Object.keys(cache.daymaster ?? {}).length,
    nameMeanings: Object.keys(cache.nameMeanings ?? {}).length,
    relations: (cache.relations?.六沖.length ?? 0) + (cache.relations?.六合.length ?? 0)
      + (cache.relations?.六害.length ?? 0) + (cache.relations?.三刑.length ?? 0) + (cache.relations?.三合.length ?? 0),
    tengods: Object.keys(cache.tengods?.gods ?? {}).length,
    patterns: Object.keys(cache.patterns ?? {}).length,
    stemsBranches: Object.keys(cache.stemsBranches?.stems ?? {}).length + Object.keys(cache.stemsBranches?.branches ?? {}).length,
  }
}

export async function refreshCustomStrokes(): Promise<void> {
  const custom = await getAllCustomStrokes()
  cache.custom = Object.fromEntries(custom.map((c) => [c.char, c.strokes]))
}

export function isDataLoaded(): boolean {
  return loadPromise !== null
}

/** @deprecated use getDatabaseStats */
export function getStrokeStats() {
  const s = getDatabaseStats()
  return { total: s.strokes, custom: s.customStrokes }
}
