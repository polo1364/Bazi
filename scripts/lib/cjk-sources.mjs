/**
 * 共享字庫來源：cnchar、台灣標準字、CCD 拆字、chinese-conv 簡繁
 */
import { readFileSync, readdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import ccd from 'chinese-characters-decomposition/ccd.json' with { type: 'json' }

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')

/** @returns {Record<string, string>} 簡→繁 */
export function loadSimplifiedToTraditional() {
  const mod = readFileSync(join(ROOT, 'node_modules', 'chinese-conv', 'dist', 'index.js'), 'utf8')
  const start = mod.indexOf('const s = {')
  const end = mod.indexOf('};', start) + 2
  const fn = new Function(`${mod.slice(start, end).replace('const s', 'const map')}; return map`)
  return fn()
}

/** cnchar 筆劃 */
export function loadCncharStrokes() {
  const drawDir = join(ROOT, 'node_modules', 'cnchar-data', 'draw')
  const strokes = {}
  if (!existsSync(drawDir)) return strokes
  for (const file of readdirSync(drawDir)) {
    if (!file.endsWith('.json') || file === 'package.json') continue
    const char = file.replace('.json', '')
    if (char.length !== 1) continue
    try {
      const data = JSON.parse(readFileSync(join(drawDir, file), 'utf8'))
      if (Array.isArray(data.strokes) && data.strokes.length > 0) {
        strokes[char] = data.strokes.length
      }
    } catch { /* skip */ }
  }
  return strokes
}

/** 台灣常用國字標準字體（zh-stroke-data） */
export function loadZhStrokeData() {
  const dataDir = join(ROOT, 'node_modules', 'zh-stroke-data', 'data')
  const strokes = {}
  if (!existsSync(dataDir)) return strokes
  for (const file of readdirSync(dataDir)) {
    if (!file.endsWith('.xml')) continue
    const code = parseInt(file.replace('.xml', ''), 16)
    if (Number.isNaN(code)) continue
    const char = String.fromCodePoint(code)
    try {
      const xml = readFileSync(join(dataDir, file), 'utf8')
      const count = (xml.match(/<Stroke>/g) ?? []).length
      if (count > 0) strokes[char] = count
    } catch { /* skip */ }
  }
  return strokes
}

/** CCD 拆字資料（含大量生僻字、擴展漢字） */
export function loadCcdStrokes() {
  const idx = {
    component: ccd.headers.indexOf('component'),
    strokes: ccd.headers.indexOf('strokes'),
  }
  const strokes = {}
  for (const row of ccd.rows) {
    const char = row[idx.component]
    const n = row[idx.strokes]
    if (typeof char === 'string' && char.length === 1 && typeof n === 'number' && n > 0 && n <= 64) {
      strokes[char] = n
    }
  }
  return strokes
}

/** CJK 統一表意文字 + 擴展 A 區（無資料時以繁體對照補位） */
export function iterCjkBlocks() {
  const chars = []
  const ranges = [
    [0x3400, 0x4dbf], // Ext A
    [0x4e00, 0x9fff], // 基本
    [0xf900, 0xfaff], // 相容
  ]
  for (const [start, end] of ranges) {
    for (let cp = start; cp <= end; cp++) {
      chars.push(String.fromCodePoint(cp))
    }
  }
  return chars
}

export function mergeStrokes(layers) {
  const out = {}
  for (const layer of layers) {
    for (const [char, count] of Object.entries(layer)) {
      if (typeof count === 'number' && count > 0) out[char] = count
    }
  }
  return out
}

/** 簡繁互補：有繁體筆劃時複製給簡體 */
export function applyVariantStrokes(strokes, s2t) {
  let added = 0
  for (const [simp, trad] of Object.entries(s2t)) {
    if (simp.length !== 1 || trad.length !== 1) continue
    if (strokes[trad] && !strokes[simp]) {
      strokes[simp] = strokes[trad]
      added++
    }
    if (strokes[simp] && !strokes[trad]) {
      strokes[trad] = strokes[simp]
      added++
    }
  }
  return added
}
