/**
 * 漢字五行：字義/部首優先 + 筆畫尾數兜底
 */
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import ccd from 'chinese-characters-decomposition/ccd.json' with { type: 'json' }

const __dirname = dirname(fileURLToPath(import.meta.url))

const EXPLICIT = {
  金: '銘鑫鋼銀銅鐵鋒銳錦錢鍾鎮鏡鑑鑰鈴鉉鈺鉅鎧鏞錚錸錕錄錡錘鍵鎂鎊鎬鎘鎔鐘鋼劍剛創',
  木: '林森樹松柏柳楊梅棟樑材村東春青芳芬花華荷莉蓮蓉藍蘭菊薇萍梓桐楓檀',
  水: '江河海湖波濤洋洪浩涵泳潤清深測滄溟漢漣潔冰雨雪雲霏露霜沐潤',
  火: '炎焱燁煒煥煙燦燿明光亮輝耀日晴旭昊晨曦智志忠煊燚燊',
  土: '坤培城域堅基堂壁壘堡堃垚佳嘉均圻圯',
}

const RADICAL_CHARS = {
  金: '釒钅金鐵銀銅鋼錢鍾',
  木: '木艸艹竹禾',
  水: '水氵冫雨',
  火: '火灬日',
  土: '土山石田',
}

const explicitMap = {}
for (const [el, chars] of Object.entries(EXPLICIT)) {
  for (const c of chars) explicitMap[c] = el
}

function strokeTailWuxing(n) {
  const d = n % 10
  if (d === 1 || d === 2) return '木'
  if (d === 3 || d === 4) return '火'
  if (d === 5 || d === 6) return '土'
  if (d === 7 || d === 8) return '金'
  return '水'
}

function wuxingFromRadical(radical) {
  if (!radical) return null
  for (const [el, chars] of Object.entries(RADICAL_CHARS)) {
    if (chars.includes(radical)) return el
  }
  return null
}

// CCD 左偏旁 / 独体 → 五行
const compIdx = {
  component: ccd.headers.indexOf('component'),
  type: ccd.headers.indexOf('compositionType'),
  left: ccd.headers.indexOf('leftComponent'),
}
const fromCcd = {}
for (const row of ccd.rows) {
  const char = row[compIdx.component]
  if (typeof char !== 'string' || char.length !== 1) continue
  const left = row[compIdx.left]
  const type = row[compIdx.type]
  const radical = (left && left !== 'null' && left.length === 1) ? left : (type?.length === 1 ? type : null)
  const wx = wuxingFromRadical(radical) ?? wuxingFromRadical(char)
  if (wx) fromCcd[char] = wx
}

let strokes = {}
try {
  strokes = JSON.parse(readFileSync(join(__dirname, '..', 'public', 'data', 'strokes.json'), 'utf8'))
} catch { /* */ }

const data = { ...fromCcd, ...explicitMap }
for (const [char, count] of Object.entries(strokes)) {
  if (!data[char]) data[char] = strokeTailWuxing(count)
}

const meta = {
  method: 'CCD radical + explicit + strokeTail fallback',
  strokeTailRule: { '1,2': '木', '3,4': '火', '5,6': '土', '7,8': '金', '9,0': '水' },
  radicalMap: RADICAL_CHARS,
  ccdRadical: Object.keys(fromCcd).length,
}

const outDir = join(__dirname, '..', 'public', 'data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'char-wuxing.json'), JSON.stringify({ meta, chars: data }))
console.log(`char-wuxing.json: ${Object.keys(data).length} chars (ccd-radical ${Object.keys(fromCcd).length})`)
