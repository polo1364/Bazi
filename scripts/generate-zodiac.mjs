/**
 * 生肖資料庫
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ZODIAC = [
  { branch: '子', name: '鼠', element: '水', traits: '機敏、靈活、善於理財', lucky: ['龍','猴','牛'], clash: ['馬'] },
  { branch: '丑', name: '牛', element: '土', traits: '勤奮、穩重、踏實', lucky: ['蛇','雞','鼠'], clash: ['羊'] },
  { branch: '寅', name: '虎', element: '木', traits: '勇敢、威嚴、領導力', lucky: ['馬','狗','豬'], clash: ['猴'] },
  { branch: '卯', name: '兔', element: '木', traits: '溫和、謹慎、善良', lucky: ['羊','狗','豬'], clash: ['雞'] },
  { branch: '辰', name: '龍', element: '土', traits: '豪邁、進取、理想', lucky: ['鼠','猴','雞'], clash: ['狗'] },
  { branch: '巳', name: '蛇', element: '火', traits: '智慧、神秘、直覺', lucky: ['牛','雞','猴'], clash: ['豬'] },
  { branch: '午', name: '馬', element: '火', traits: '熱情、自由、行動力', lucky: ['虎','羊','狗'], clash: ['鼠'] },
  { branch: '未', name: '羊', element: '土', traits: '溫順、創意、藝術', lucky: ['兔','馬','豬'], clash: ['牛'] },
  { branch: '申', name: '猴', element: '金', traits: '聰慧、機智、多才', lucky: ['鼠','龍','蛇'], clash: ['虎'] },
  { branch: '酉', name: '雞', element: '金', traits: '精準、自信、重信', lucky: ['牛','龍','蛇'], clash: ['兔'] },
  { branch: '戌', name: '狗', element: '土', traits: '忠誠、正義、可靠', lucky: ['虎','兔','馬'], clash: ['龍'] },
  { branch: '亥', name: '豬', element: '水', traits: '厚道、福氣、隨和', lucky: ['兔','羊','虎'], clash: ['蛇'] },
]

const byBranch = Object.fromEntries(ZODIAC.map((z) => [z.branch, z]))
const byName = Object.fromEntries(ZODIAC.map((z) => [z.name, z]))

const outDir = join(__dirname, '..', 'public', 'data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'zodiac.json'), JSON.stringify({ list: ZODIAC, byBranch, byName }))
console.log('zodiac.json: 12 entries')
