/**
 * 三才配置吉凶（天格/人格/地格五行組合）
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ELEMENTS = ['木', '火', '土', '金', '水']

// 三才吉凶簡表（人格為中心，天/地生剋）
const SANCAI_LUCK = {
  '木木木': { luck: '吉', title: '基礎安穩', meaning: '三才皆木，仁德之格，初期略辛，後運亨通' },
  '木火土': { luck: '大吉', title: '成功運佳', meaning: '木生火、火生土，順生流通，事業可成' },
  '木土火': { luck: '半吉', title: '基礎動盪', meaning: '木剋土，土晦火，需穩守' },
  '火火火': { luck: '半吉', title: '過剛易折', meaning: '三才皆火，熱情過盛，宜修養' },
  '火土金': { luck: '吉', title: '順生流通', meaning: '火生土、土生金，財官相生' },
  '土土土': { luck: '吉', title: '穩重厚實', meaning: '三才皆土，誠信穩健，晚運佳' },
  '土金水': { luck: '大吉', title: '才德兼備', meaning: '土生金、金生水，流通順暢' },
  '金金水': { luck: '吉', title: '聰慧敏銳', meaning: '金金生水，才華出眾' },
  '水水木': { luck: '大吉', title: '生長之格', meaning: '水生木，智慧仁德' },
  '水木火': { luck: '吉', title: '通關順達', meaning: '水生木、木生火，連續相生' },
}

function numToElement(n) {
  const d = n % 10
  if (d === 1 || d === 2) return '木'
  if (d === 3 || d === 4) return '火'
  if (d === 5 || d === 6) return '土'
  if (d === 7 || d === 8) return '金'
  return '水'
}

function evaluateSancai(tian, ren, di) {
  const key = tian + ren + di
  if (SANCAI_LUCK[key]) return SANCAI_LUCK[key]

  const generates = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
  const controls = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

  let score = 0
  if (generates[tian] === ren) score += 2
  if (generates[ren] === di) score += 2
  if (controls[tian] === ren) score -= 2
  if (controls[ren] === di) score -= 2
  if (tian === ren && ren === di) score += 1

  if (score >= 3) return { luck: '大吉', title: '三才相生', meaning: '天人格連續相生，運勢通暢' }
  if (score >= 1) return { luck: '吉', title: '三才平和', meaning: '配置尚可，順勢而為' }
  if (score >= -1) return { luck: '半吉', title: '三才中和', meaning: '有起伏，宜謹慎' }
  return { luck: '凶', title: '三才相剋', meaning: '天人格相剋，需後天修養補足' }
}

const all = {}
for (const t of ELEMENTS) {
  for (const r of ELEMENTS) {
    for (const d of ELEMENTS) {
      all[t + r + d] = evaluateSancai(t, r, d)
    }
  }
}

const byNumbers = {}
for (let t = 1; t <= 81; t++) {
  for (let r = 1; r <= 81; r++) {
    for (let d = 1; d <= 81; d++) {
      const te = numToElement(t), re = numToElement(r), de = numToElement(d)
      byNumbers[`${t}-${r}-${d}`] = all[te + re + de]
    }
  }
}

// 只存 125 種組合 + lookup helper
const outDir = join(__dirname, '..', 'public', 'data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'sancai.json'), JSON.stringify({
  meta: { rule: '天格人格地格尾數定五行', elements: ELEMENTS },
  combinations: all,
  numToElement: { '1,2': '木', '3,4': '火', '5,6': '土', '7,8': '金', '9,0': '水' },
}))
console.log(`sancai.json: ${Object.keys(all).length} combinations`)
