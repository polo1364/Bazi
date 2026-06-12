/**
 * 節氣資料 1900-2100（用於精確排盤）
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TERM_NAMES = [
  '小寒','大寒','立春','雨水','驚蟄','春分','清明','穀雨','立夏','小滿','芒種','夏至',
  '小暑','大暑','立秋','處暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至',
]

function termDays(y, n) {
  const c = 0.2422
  const offsets = [6.11,20.84,4.15,18.73,5.63,20.646,4.81,20.1,5.52,21.04,5.678,21.37,
    7.108,22.83,7.5,23.13,7.646,23.042,8.318,23.438,7.438,22.36,7.18,21.94]
  const yd = y - 1900
  const leap = Math.floor(yd / 4) - Math.floor(yd / 100) + Math.floor(yd / 400)
  let d = Math.floor(yd * c + offsets[n]) - leap
  if (n === 2 && y % 4 === 0 && y % 100 !== 0) d += 1
  return d
}

const data = {}
for (let y = 1800; y <= 2200; y++) {
  data[y] = TERM_NAMES.map((name, i) => {
    const month = Math.floor(i / 2) + 1
    const day = termDays(y, i)
    return { name, month, day, termIndex: i }
  })
}

const outDir = join(__dirname, '..', 'public', 'data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'solar-terms.json'), JSON.stringify(data))
console.log(`solar-terms.json: ${Object.keys(data).length} years × 24 terms`)
