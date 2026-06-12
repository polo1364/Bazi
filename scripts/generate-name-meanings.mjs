/**
 * 姓名字義：cnchar 釋義 + 手動精選 + 全字庫五行描述
 */
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const explainDir = join(__dirname, '..', 'node_modules', 'cnchar-data', 'explanation')

const CURATED = {
  王: '王者、首領', 李: '李子、吉祥', 張: '張開、展開', 劉: '殺戮、姓氏', 陳: '陳列、舊也',
  楊: '楊樹、姓氏', 黃: '黃色、中央', 林: '樹林、姓氏', 俊: '才智出眾、英俊', 傑: '出類拔萃',
  偉: '偉大、卓越', 明: '光明、聰明', 文: '文化、文才', 德: '品德、道德', 仁: '仁愛、慈悲',
  智: '智慧、聰明', 信: '誠信、信任', 安: '安全、安穩', 寧: '寧靜、安寧', 福: '福氣、幸福',
  祥: '吉祥、祥瑞', 瑞: '瑞氣、好兆', 昌: '昌盛、繁榮', 華: '華麗、光彩', 富: '富有、富足',
  成: '成功、成就', 達: '通達、顯達', 博: '博學、廣博', 思: '思考、思想', 詩: '詩歌、詩意',
  雅: '優雅、高雅', 涵: '涵養、包容', 怡: '愉悅、和樂', 婷: '美好、優雅', 琳: '美玉、珍貴',
  瑤: '美玉、珍貴', 萱: '忘憂草', 梓: '故鄉、桑梓', 秀: '秀麗、優秀', 芳: '芳香、美好',
  麗: '美麗、秀麗', 敏: '敏捷、聰明', 靜: '安靜、寧靜', 清: '清澈、純淨', 雨: '雨水、滋潤',
  雪: '雪花、純潔', 晨: '早晨、希望', 曦: '晨光、希望', 心: '內心、善良', 志: '志向、意志',
  龍: '龍、尊貴', 鳳: '鳳凰、吉祥', 鑫: '財富興盛', 磊: '光明磊落', 洋: '海洋、廣大',
  // 生僻/熱門取名用字
  𠮷: '吉字異體，吉祥之意', 喆: '智慧明達、吉祥', 堃: '大地厚重、穩健', 煊: '溫暖明亮',
  旻: '天空、秋意', 彧: '有文采、有教養', 翀: '直向上飛', 玥: '神話中的神珠',
  璟: '玉的光彩', 琛: '珍寶', 燊: '旺盛、興盛', 燚: '火焰熾盛', 淼: '水勢浩大',
  叡: '聰明通達', 睿: '聰明睿智', 軒: '高揚、氣宇', 宸: '帝王居所、尊貴',
  皓: '潔白明亮', 旭: '朝陽、希望', 瀚: '廣大、博學', 潤: '滋潤、溫澤',
  澤: '恩澤、光潤', 奕: '光明、神采', 逸: '超脫、安閒', 澄: '清澈、明淨',
}

function numToElement(n) {
  const d = n % 10
  if (d === 1 || d === 2) return '木'
  if (d === 3 || d === 4) return '火'
  if (d === 5 || d === 6) return '土'
  if (d === 7 || d === 8) return '金'
  return '水'
}

function extractMeaning(char, explainObj) {
  const entries = Object.entries(explainObj)
  if (!entries.length) return null
  // 優先單字詞條
  for (const [word, def] of entries) {
    if (word === char) {
      const text = String(def).replace(/^\d+\./, '').split('\n')[0].trim()
      return text.slice(0, 24)
    }
  }
  // 取第一條釋義
  const [, def] = entries[0]
  const text = String(def).replace(/^\d+\./, '').split('\n')[0].trim()
  if (text.length > 4) return text.slice(0, 24)
  return null
}

let strokes = {}
let charWuxing = {}
try {
  strokes = JSON.parse(readFileSync(join(__dirname, '..', 'public', 'data', 'strokes.json'), 'utf8'))
} catch { /* */ }
try {
  const raw = JSON.parse(readFileSync(join(__dirname, '..', 'public', 'data', 'char-wuxing.json'), 'utf8'))
  charWuxing = raw.chars ?? raw
} catch { /* */ }

const result = { ...CURATED }
let fromExplain = 0

try {
  const files = readdirSync(explainDir).filter((f) => f.endsWith('.json'))
  for (const file of files) {
    const char = file.replace('.json', '')
    if (char.length !== 1 || result[char]) continue
    try {
      const data = JSON.parse(readFileSync(join(explainDir, file), 'utf8'))
      const m = extractMeaning(char, data)
      if (m) {
        result[char] = m
        fromExplain++
      }
    } catch { /* skip */ }
  }
} catch { /* */ }

// 為 strokes 中所有字補齊字義
let fallbackAdded = 0
for (const char of Object.keys(strokes)) {
  if (result[char]) continue
  const s = strokes[char]
  const wx = charWuxing[char] ?? numToElement(s)
  result[char] = `五行${wx}，康熙${s}劃，適合取名`
  fallbackAdded++
}

const outDir = join(__dirname, '..', 'public', 'data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'name-meanings.json'), JSON.stringify(result))
console.log(`name-meanings.json: ${Object.keys(result).length} (${Object.keys(CURATED).length} curated + ${fromExplain} cnchar + ${fallbackAdded} auto)`)
