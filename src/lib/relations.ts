import type { BaziChart, RelationItem } from '../types'
import { pillarsToArray } from './bazi'

type PairRule = {
  type: RelationItem['type']
  name: string
  branches: string[]
  description: string
}

type TripleRule = PairRule & {
  element?: string
}

export const SIX_CLASHES: PairRule[] = [
  { type: '沖', name: '子午沖', branches: ['子', '午'], description: '六沖，氣場對立與變動' },
  { type: '沖', name: '丑未沖', branches: ['丑', '未'], description: '六沖，土氣相沖與環境變動' },
  { type: '沖', name: '寅申沖', branches: ['寅', '申'], description: '六沖，行動與制度衝突' },
  { type: '沖', name: '卯酉沖', branches: ['卯', '酉'], description: '六沖，人際、審美與立場衝突' },
  { type: '沖', name: '辰戌沖', branches: ['辰', '戌'], description: '六沖，土庫開動與規劃變化' },
  { type: '沖', name: '巳亥沖', branches: ['巳', '亥'], description: '六沖，思路、移動與節奏變化' },
]

export const SIX_COMBINATIONS: PairRule[] = [
  { type: '合', name: '子丑合', branches: ['子', '丑'], description: '六合，合作、穩定、資源整合；是否合化需另判' },
  { type: '合', name: '寅亥合', branches: ['寅', '亥'], description: '六合，互補與連結；是否合化需另判' },
  { type: '合', name: '卯戌合', branches: ['卯', '戌'], description: '六合，合作與承諾；是否合化需另判' },
  { type: '合', name: '辰酉合', branches: ['辰', '酉'], description: '六合，資源整合；是否合化需另判' },
  { type: '合', name: '巳申合', branches: ['巳', '申'], description: '六合，制度與技術互動；是否合化需另判' },
  { type: '合', name: '午未合', branches: ['午', '未'], description: '六合，目標與承接；是否合化需另判' },
]

export const SIX_HARMS: PairRule[] = [
  { type: '害', name: '子未害', branches: ['子', '未'], description: '相害，人際、承諾或資源摩擦' },
  { type: '害', name: '丑午害', branches: ['丑', '午'], description: '相害，節奏與責任摩擦' },
  { type: '害', name: '寅巳害', branches: ['寅', '巳'], description: '相害，行動與表達摩擦' },
  { type: '害', name: '卯辰害', branches: ['卯', '辰'], description: '相害，人際、溝通、感情摩擦' },
  { type: '害', name: '申亥害', branches: ['申', '亥'], description: '相害，制度、移動與想法摩擦' },
  { type: '害', name: '酉戌害', branches: ['酉', '戌'], description: '相害，標準與承諾摩擦' },
]

export const THREE_COMBINATIONS: TripleRule[] = [
  { type: '局', name: '申子辰三合水局', branches: ['申', '子', '辰'], element: '水', description: '三支俱全方成立三合水局' },
  { type: '局', name: '亥卯未三合木局', branches: ['亥', '卯', '未'], element: '木', description: '三支俱全方成立三合木局' },
  { type: '局', name: '寅午戌三合火局', branches: ['寅', '午', '戌'], element: '火', description: '三支俱全方成立三合火局' },
  { type: '局', name: '巳酉丑三合金局', branches: ['巳', '酉', '丑'], element: '金', description: '三支俱全方成立三合金局' },
]

export const HALF_COMBINATIONS: PairRule[] = [
  { type: '半合', name: '申子半合水', branches: ['申', '子'], description: '半合水，不等於申子辰三合水局' },
  { type: '半合', name: '子辰半合水', branches: ['子', '辰'], description: '半合水，不等於申子辰三合水局' },
  { type: '半合', name: '亥卯半合木', branches: ['亥', '卯'], description: '半合木，不等於亥卯未三合木局' },
  { type: '半合', name: '卯未半合木', branches: ['卯', '未'], description: '半合木，不等於亥卯未三合木局' },
  { type: '半合', name: '寅午半合火', branches: ['寅', '午'], description: '半合火，不等於寅午戌三合火局' },
  { type: '半合', name: '午戌半合火', branches: ['午', '戌'], description: '半合火，不等於寅午戌三合火局' },
  { type: '半合', name: '巳酉半合金', branches: ['巳', '酉'], description: '半合金，不等於巳酉丑三合金局' },
  { type: '半合', name: '酉丑半合金', branches: ['酉', '丑'], description: '半合金，不等於巳酉丑三合金局' },
]

export const THREE_PENALTIES: TripleRule[] = [
  { type: '刑', name: '寅巳申無恩之刑', branches: ['寅', '巳', '申'], description: '三刑，無恩之刑；三支俱全方以完整三刑論' },
  { type: '刑', name: '丑未戌恃勢之刑', branches: ['丑', '未', '戌'], description: '三刑，恃勢之刑；三支俱全方以完整三刑論' },
  { type: '刑', name: '子卯無禮之刑', branches: ['子', '卯'], description: '無禮之刑，情緒、溝通、界線問題' },
]

export const SELF_PENALTIES: PairRule[] = [
  { type: '刑', name: '辰辰自刑', branches: ['辰'], description: '自刑；同一地支至少出現兩次才成立' },
  { type: '刑', name: '午午自刑', branches: ['午'], description: '自刑；同一地支至少出現兩次才成立' },
  { type: '刑', name: '酉酉自刑', branches: ['酉'], description: '自刑；同一地支至少出現兩次才成立' },
  { type: '刑', name: '亥亥自刑', branches: ['亥'], description: '自刑；同一地支至少出現兩次才成立' },
]

function hasAll(branches: string[], required: string[]): boolean {
  return required.every((branch) => branches.includes(branch))
}

function countOf(branches: string[], target: string): number {
  return branches.filter((branch) => branch === target).length
}

function toItem(rule: PairRule | TripleRule): RelationItem {
  return {
    type: rule.type,
    label: rule.name,
    name: rule.name,
    branches: rule.branches,
    desc: rule.description,
  }
}

export function computeBranchRelations(branches: string[]): RelationItem[] {
  const items: RelationItem[] = []

  for (const rule of SIX_CLASHES) if (hasAll(branches, rule.branches)) items.push(toItem(rule))
  for (const rule of SIX_HARMS) if (hasAll(branches, rule.branches)) items.push(toItem(rule))
  for (const rule of SIX_COMBINATIONS) if (hasAll(branches, rule.branches)) items.push(toItem(rule))
  for (const rule of THREE_PENALTIES) if (hasAll(branches, rule.branches)) items.push(toItem(rule))
  for (const rule of SELF_PENALTIES) if (countOf(branches, rule.branches[0]) >= 2) items.push(toItem(rule))
  for (const rule of THREE_COMBINATIONS) if (hasAll(branches, rule.branches)) items.push(toItem(rule))
  for (const rule of HALF_COMBINATIONS) if (hasAll(branches, rule.branches)) items.push(toItem(rule))

  if (!items.length) items.push({ type: '和', label: '四柱平和', name: '四柱平和', branches: [], desc: '未見明顯刑沖合害' })
  return items
}

export function computeChartRelations(chart: BaziChart): RelationItem[] {
  return computeBranchRelations(pillarsToArray(chart).map((pillar) => pillar.branch))
}
