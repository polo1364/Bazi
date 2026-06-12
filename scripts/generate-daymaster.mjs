/**
 * 十天干日主特性
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DAYMASTER = {
  甲: { element: '木', yin: false, name: '甲木', traits: '如大樹，正直向上，有領導力與仁心', strong: '宜從事教育、管理、公益', weak: '易固執，需柔軟變通', body: '肝膽、頭頸' },
  乙: { element: '木', yin: true, name: '乙木', traits: '如花草，柔韌適應，善於協調', strong: '宜藝術、設計、服務業', weak: '易優柔，需果斷', body: '肝膽、四肢' },
  丙: { element: '火', yin: false, name: '丙火', traits: '如太陽，熱情光明，慷慨大方', strong: '宜媒體、演藝、公關', weak: '易急躁，需沉穩', body: '心臟、眼睛' },
  丁: { element: '火', yin: true, name: '丁火', traits: '如燈燭，細膩溫暖，洞察入微', strong: '宜文化、研究、諮詢', weak: '易多慮，需開朗', body: '心臟、血液' },
  戊: { element: '土', yin: false, name: '戊土', traits: '如高山，穩重厚實，誠信可靠', strong: '宜地產、建築、金融', weak: '易遲鈍，需靈活', body: '脾胃、皮膚' },
  己: { element: '土', yin: true, name: '己土', traits: '如田園，包容滋養，務實細心', strong: '宜農業、餐飲、照護', weak: '易保守，需進取', body: '脾胃、腹部' },
  庚: { element: '金', yin: false, name: '庚金', traits: '如刀劍，剛毅果決，重義氣', strong: '宜軍警、法律、工程', weak: '易剛硬，需圓融', body: '肺、大腸、骨骼' },
  辛: { element: '金', yin: true, name: '辛金', traits: '如珠玉，精緻敏銳，好面子', strong: '宜金融、珠寶、精密業', weak: '易敏感，需豁達', body: '肺、牙齒、皮膚' },
  壬: { element: '水', yin: false, name: '壬水', traits: '如江河，智慧流動，適應力強', strong: '宜貿易、物流、外交', weak: '易飄忽，需定力', body: '腎、膀胱、耳朵' },
  癸: { element: '水', yin: true, name: '癸水', traits: '如雨露，細膩內斂，直覺敏銳', strong: '宜心理、醫療、宗教', weak: '易消極，需積極', body: '腎、生殖、內分泌' },
}

const outDir = join(__dirname, '..', 'public', 'data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'daymaster.json'), JSON.stringify(DAYMASTER, null, 2))
console.log('daymaster.json: 10 entries')
