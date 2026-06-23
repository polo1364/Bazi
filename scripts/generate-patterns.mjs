/**
 * 八字格局資料庫
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const data = {
  正官格: { type: '正格', desc: '月令正官透干或本气，主貴气、名望、事業穩定，宜公職管理', favorable: '印、財', unfavorable: '傷官、比劫過旺' },
  七殺格: { type: '正格', desc: '月令七殺，主魄力、權威、競爭，需食神制或印星化', favorable: '食神、正印', unfavorable: '財星生殺無制' },
  正財格: { type: '正格', desc: '月令正財，主勤儉務實、穩定財路，宜經商理財', favorable: '官、食', unfavorable: '比劫奪財' },
  偏財格: { type: '正格', desc: '月令偏財，主投資、人緣、偏門財，善於把握機會', favorable: '官、食', unfavorable: '比劫過旺' },
  正印格: { type: '正格', desc: '月令正印，主學業、貴人、名譽，利考試、文化、教育', favorable: '官、殺', unfavorable: '財破印' },
  偏印格: { type: '正格', desc: '月令偏印，主技藝、直覺、偏門學問，宜研究、宗教、藝術', favorable: '官、殺', unfavorable: '財、食' },
  食神格: { type: '正格', desc: '月令食神，主才華、口福、溫和，為福星，宜技藝、餐飲、文藝', favorable: '財', unfavorable: '偏印奪食' },
  傷官格: { type: '正格', desc: '月令傷官，主聰明、口才、技藝，才華出眾但需制化', favorable: '財、印', unfavorable: '官見傷' },
  比肩格: { type: '正格', desc: '月令比肩，主獨立、競爭、自我，身強宜泄秀，身弱宜助身', favorable: '食、官', unfavorable: '比劫過旺' },
  劫財格: { type: '正格', desc: '月令劫財，主行動力、破財、競爭，宜從商或技術', favorable: '官、食', unfavorable: '劫財過旺' },
  從強格: { type: '特殊', desc: '日主極旺，宜順其勢，喜比劫印星，忌官殺財星', favorable: '比、劫、印', unfavorable: '官、殺、財' },
  從弱格: { type: '特殊', desc: '日主極弱，宜從財官食傷，忌印比助身', favorable: '財、官、食', unfavorable: '印、比' },
  從財格: { type: '特殊', desc: '日主弱而財旺，從財而化，主富貴，宜經商', favorable: '食、官', unfavorable: '比、劫' },
  從官格: { type: '特殊', desc: '日主弱而官旺，從官而化，主貴，宜公職', favorable: '財、印', unfavorable: '食、傷' },
  從兒格: { type: '特殊', desc: '日主弱而食傷旺，從食傷而化，主才華名望', favorable: '財', unfavorable: '印、官' },
  化氣格: { type: '特殊', desc: '天干合化成功，以化神論命，需月令支持', favorable: '化神', unfavorable: '克化神' },
  中和格: { type: '普通', desc: '五行較平衡，無明顯主格，宜綜合喜用神論命', favorable: '視身強弱', unfavorable: '視身強弱' },
}

const outDir = join(__dirname, '..', 'public', 'data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'patterns.json'), JSON.stringify(data, null, 2))
console.log(`patterns.json: ${Object.keys(data).length} patterns`)
