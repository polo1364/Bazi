/**
 * 複姓資料庫
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SURNAMES = [
  { name: '歐陽', length: 2, origin: '姒姓，越國分支' },
  { name: '司馬', length: 2, origin: '職官姓，晉國公族' },
  { name: '上官', length: 2, origin: '楚國地名' },
  { name: '夏侯', length: 2, origin: '姒姓，夏朝後裔' },
  { name: '諸葛', length: 2, origin: '葛姓分支' },
  { name: '聞人', length: 2, origin: '春秋鄭國大夫' },
  { name: '東方', length: 2, origin: '漢代複姓' },
  { name: '皇甫', length: 2, origin: '子姓，宋國公族' },
  { name: '尉遲', length: 2, origin: '鮮卑姓' },
  { name: '公孫', length: 2, origin: '黃帝後裔' },
  { name: '軒轅', length: 2, origin: '黃帝本姓' },
  { name: '令狐', length: 2, origin: '姬姓，周文王後' },
  { name: '宇文', length: 2, origin: '鮮卑姓' },
  { name: '長孫', length: 2, origin: '鮮卑姓' },
  { name: '慕容', length: 2, origin: '鮮卑姓' },
  { name: '司徒', length: 2, origin: '職官姓' },
  { name: '司空', length: 2, origin: '職官姓' },
  { name: '南宮', length: 2, origin: '周文王後' },
  { name: '西門', length: 2, origin: '鄭國大夫' },
  { name: '獨孤', length: 2, origin: '鮮卑姓' },
  { name: '公冶', length: 2, origin: '姬姓' },
  { name: '宗政', length: 2, origin: '子姓' },
  { name: '濮陽', length: 2, origin: '地名姓' },
  { name: '公羊', length: 2, origin: '姬姓' },
  { name: '太叔', length: 2, origin: '姬姓' },
  { name: '申屠', length: 2, origin: '姜姓' },
  { name: '仲孫', length: 2, origin: '姬姓' },
  { name: '鍾離', length: 2, origin: '楚國封地' },
  { name: '鮮于', length: 2, origin: '鮮卑姓' },
  { name: '閭丘', length: 2, origin: '齊國地名' },
  { name: '亓官', length: 2, origin: '複姓' },
  { name: '司寇', length: 2, origin: '職官姓' },
  { name: '巫馬', length: 2, origin: '複姓' },
  { name: '公西', length: 2, origin: '姬姓' },
  { name: '顓孫', length: 2, origin: '子姓' },
  { name: '端木', length: 2, origin: '子貢後裔' },
  { name: '巫馬', length: 2, origin: '複姓' },
  { name: '公良', length: 2, origin: '複姓' },
  { name: '漆雕', length: 2, origin: '複姓' },
  { name: '樂正', length: 2, origin: '職官姓' },
  { name: '宰父', length: 2, origin: '複姓' },
  { name: '谷梁', length: 2, origin: '複姓' },
  { name: '拓跋', length: 2, origin: '鮮卑姓' },
  { name: '完顏', length: 2, origin: '女真姓' },
  { name: '愛新覺羅', length: 4, origin: '滿族姓' },
  { name: '葉赫那拉', length: 4, origin: '滿族姓' },
  { name: '烏雅', length: 2, origin: '滿族姓' },
  { name: '鈕祜祿', length: 3, origin: '滿族姓' },
  { name: '赫舍里', length: 3, origin: '滿族姓' },
  { name: '那拉', length: 2, origin: '滿族姓' },
  { name: '范姜', length: 2, origin: '複姓' },
  { name: '張簡', length: 2, origin: '複姓' },
  { name: '歐陽', length: 2, origin: '姒姓' },
]

const byName = Object.fromEntries(SURNAMES.map((s) => [s.name, s]))
const outDir = join(__dirname, '..', 'public', 'data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'compound-surnames.json'), JSON.stringify({ list: SURNAMES, byName }))
console.log(`compound-surnames.json: ${SURNAMES.length} entries`)
