/**
 * 十二長生：十天干在十二地支的旺衰狀態
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
const STAGES = ['長生','沐浴','冠帶','臨官','帝旺','衰','病','死','墓','絕','胎','養']

const STAGE_DESC = {
  長生: '如人初生，生機萌發，宜開創',
  沐浴: '如人沐浴，桃花波動，宜修德',
  冠帶: '如人成年，漸具能力，宜進修',
  臨官: '如人入仕，事業漸成，宜擔當',
  帝旺: '如人鼎盛，氣勢最強，宜守成',
  衰: '如人漸衰，宜保守穩健',
  病: '如人有疾，宜調養進退',
  死: '如人歸寂，宜沉潛轉化',
  墓: '如人入墓，宜積累藏蓄',
  絕: '如氣將絕，宜借勢重生',
  胎: '如人受胎，新機在望',
  養: '如人育養，宜學習充實',
}

/** 陽干順行、陰干逆行 */
const START = {
  甲: '亥', 乙: '午', 丙: '寅', 丁: '酉', 戊: '寅',
  己: '酉', 庚: '巳', 辛: '子', 壬: '申', 癸: '卯',
}

const YANG = new Set(['甲','丙','戊','庚','壬'])

const byStem = {}
const lookup = {}

for (const stem of STEMS) {
  const startIdx = BRANCHES.indexOf(START[stem])
  const forward = YANG.has(stem)
  byStem[stem] = {}
  for (let i = 0; i < 12; i++) {
    const branchIdx = forward
      ? (startIdx + i) % 12
      : (startIdx - i + 12) % 12
    const branch = BRANCHES[branchIdx]
    const stage = STAGES[i]
    byStem[stem][branch] = { stage, desc: STAGE_DESC[stage] }
    lookup[`${stem}${branch}`] = { stage, desc: STAGE_DESC[stage] }
  }
}

const outDir = join(__dirname, '..', 'public', 'data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'changsheng.json'), JSON.stringify({ byStem, lookup, stages: STAGES, total: Object.keys(lookup).length }))
console.log(`changsheng.json: ${Object.keys(lookup).length} stem-branch pairs`)
