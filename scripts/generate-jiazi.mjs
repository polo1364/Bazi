/**
 * 60甲子完整資料：納音、旬空、生肖、五行
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
const NAYIN = [
  '海中金','爐中火','大林木','路邊土','劍鋒金','山頭火','澗下水','城頭土','白蠟金','楊柳木',
  '泉中水','屋上土','霹靂火','松柏木','長流水','沙中金','山下火','平地木','壁上土','金箔金',
  '覆燈火','天河水','大驛土','釵鋌金','桑柘木','大溪水','沙中土','天上火','石榴木','大海水',
]
const NAYIN_ELEMENT = ['金','火','木','土','金','火','水','土','金','木','水','土','火','木','水','金','火','木','土','金','火','水','土','金','木','水','土','火','木','水']
const ZODIAC = ['鼠','牛','虎','兔','龍','蛇','馬','羊','猴','雞','狗','豬']
const XUN_KONG = {
  甲子: ['戌','亥'], 甲戌: ['申','酉'], 甲申: ['午','未'], 甲午: ['辰','巳'], 甲辰: ['寅','卯'], 甲寅: ['子','丑'],
}

function getXunkong(gz) {
  const stemIdx = STEMS.indexOf(gz[0])
  const xunStart = ['甲子','甲戌','甲申','甲午','甲辰','甲寅'][Math.floor(stemIdx / 2) % 6] || '甲子'
  return XUN_KONG[xunStart] ?? ['戌','亥']
}

const data = {}
for (let i = 0; i < 60; i++) {
  const stem = STEMS[i % 10]
  const branch = BRANCHES[i % 12]
  const gz = stem + branch
  const stemEl = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'}[stem]
  const branchEl = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'}[branch]
  data[gz] = {
    ganZhi: gz,
    stem, branch,
    stemElement: stemEl,
    branchElement: branchEl,
    nayin: NAYIN[Math.floor(i / 2) % 30],
    nayinElement: NAYIN_ELEMENT[Math.floor(i / 2) % 30],
    zodiac: ZODIAC[i % 12],
    xunkong: getXunkong(gz),
    index: i,
  }
}

const outDir = join(__dirname, '..', 'public', 'data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'jiazi.json'), JSON.stringify(data))
console.log('jiazi.json: 60 entries')
