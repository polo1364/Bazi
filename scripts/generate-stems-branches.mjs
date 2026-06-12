/**
 * 天干地支特性資料庫
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const stems = {
  甲: { element: '木', yin: false, image: '參天巨木', traits: '陽木，剛健向上，有領導力與開創精神', body: '頭、膽' },
  乙: { element: '木', yin: true, image: '花草藤蔓', traits: '陰木，柔韌靈活，善適應與協調', body: '頸、肝' },
  丙: { element: '火', yin: false, image: '太陽之火', traits: '陽火，光明熱情，外向積極', body: '肩、小腸' },
  丁: { element: '火', yin: true, image: '燈燭之火', traits: '陰火，細膩溫暖，重細節與情感', body: '心、血' },
  戊: { element: '土', yin: false, image: '城牆厚土', traits: '陽土，穩重厚實，守信可靠', body: '胃、腹' },
  己: { element: '土', yin: true, image: '田園濕土', traits: '陰土，包容滋養，務實細緻', body: '脾、腹' },
  庚: { element: '金', yin: false, image: '刀斧之金', traits: '陽金，剛毅果決，重義氣與原則', body: '大腸、筋' },
  辛: { element: '金', yin: true, image: '珠玉之金', traits: '陰金，精緻敏感，好面子重細節', body: '肺、齒' },
  壬: { element: '水', yin: false, image: '江河之水', traits: '陽水，智慧流動，胸懷寬廣', body: '膀胱、脛' },
  癸: { element: '水', yin: true, image: '雨露之水', traits: '陰水，內斂靈活，直覺敏銳', body: '腎、足' },
}

const branches = {
  子: { element: '水', zodiac: '鼠', hour: '23-01', traits: '子水，機敏靈活，善謀略', hidden: ['癸'] },
  丑: { element: '土', zodiac: '牛', hour: '01-03', traits: '丑土，穩重耐勞，固執務實', hidden: ['己','癸','辛'] },
  寅: { element: '木', zodiac: '虎', hour: '03-05', traits: '寅木，勇猛進取，有領導欲', hidden: ['甲','丙','戊'] },
  卯: { element: '木', zodiac: '兔', hour: '05-07', traits: '卯木，溫和細膩，重感情', hidden: ['乙'] },
  辰: { element: '土', zodiac: '龍', hour: '07-09', traits: '辰土，進取多變，有抱負', hidden: ['戊','乙','癸'] },
  巳: { element: '火', zodiac: '蛇', hour: '09-11', traits: '巳火，智慧深沉，善謀略', hidden: ['丙','庚','戊'] },
  午: { element: '火', zodiac: '馬', hour: '11-13', traits: '午火，熱情奔放，行動力強', hidden: ['丁','己'] },
  未: { element: '土', zodiac: '羊', hour: '13-15', traits: '未土，溫和包容，重和諧', hidden: ['己','丁','乙'] },
  申: { element: '金', zodiac: '猴', hour: '15-17', traits: '申金，聰明機警，善變通', hidden: ['庚','壬','戊'] },
  酉: { element: '金', zodiac: '雞', hour: '17-19', traits: '酉金，精準細緻，重外表', hidden: ['辛'] },
  戌: { element: '土', zodiac: '狗', hour: '19-21', traits: '戌土，忠誠守信，重義氣', hidden: ['戊','辛','丁'] },
  亥: { element: '水', zodiac: '豬', hour: '21-23', traits: '亥水，善良隨和，福氣深厚', hidden: ['壬','甲'] },
}

const outDir = join(__dirname, '..', 'public', 'data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'stems-branches.json'), JSON.stringify({ stems, branches }, null, 2))
console.log(`stems-branches.json: ${Object.keys(stems).length} stems, ${Object.keys(branches).length} branches`)
