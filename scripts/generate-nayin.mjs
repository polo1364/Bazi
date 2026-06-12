/**
 * 產生納音五行資料庫 (public/data/nayin.json)
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
const NAYIN = [
  '海中金','爐中火','大林木','路邊土','劍鋒金','山頭火',
  '澗下水','城頭土','白蠟金','楊柳木','泉中水','屋上土',
  '霹靂火','松柏木','長流水','沙中金','山下火','平地木',
  '壁上土','金箔金','覆燈火','天河水','大驛土','釵鋌金',
  '桑柘木','大溪水','沙中土','天上火','石榴木','大海水',
]

const data = {}
for (let i = 0; i < 60; i++) {
  const stem = STEMS[i % 10]
  const branch = BRANCHES[i % 12]
  const key = stem + branch
  data[key] = {
    ganZhi: key,
    nayin: NAYIN[Math.floor(i / 2) % 30],
    element: NAYIN[Math.floor(i / 2) % 30].slice(-1),
  }
}

const outDir = join(__dirname, '..', 'public', 'data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'nayin.json'), JSON.stringify(data, null, 2), 'utf8')
console.log('Generated nayin.json (60 entries)')
