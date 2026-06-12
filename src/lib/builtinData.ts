/**
 * 內建命理資料（不依賴 JSON 載入，確保查詢永有結果）
 */

interface SancaiEntry {
  luck: string
  title: string
  meaning: string
}

interface WugeLuckEntry {
  number: number
  luck: string
  title: string
  meaning: string
}

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

const NAYIN_NAMES = [
  '海中金', '爐中火', '大林木', '路邊土', '劍鋒金', '山頭火', '澗下水', '城頭土', '白蠟金', '楊柳木',
  '泉中水', '屋上土', '霹靂火', '松柏木', '長流水', '沙中金', '山下火', '平地木', '壁上土', '金箔金',
  '覆燈火', '天河水', '大驛土', '釵鋌金', '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水',
] as const

const NAYIN_ELEMENTS = ['金', '火', '木', '土', '金', '火', '水', '土', '金', '木', '水', '土', '火', '木', '水', '金', '火', '木', '土', '金', '火', '水', '土', '金', '木', '水', '土', '火', '木', '水'] as const

const WUGE_LUCK: Record<number, string> = {
  1: '大吉', 2: '凶', 3: '大吉', 4: '凶', 5: '大吉', 6: '吉', 7: '吉', 8: '吉', 9: '凶',
  10: '凶', 11: '大吉', 12: '凶', 13: '大吉', 14: '凶', 15: '大吉', 16: '吉', 17: '吉',
  18: '吉', 19: '凶', 20: '凶', 21: '大吉', 22: '凶', 23: '大吉', 24: '大吉', 25: '吉',
  26: '凶', 27: '凶', 28: '凶', 29: '吉', 30: '凶', 31: '大吉', 32: '大吉', 33: '大吉',
  34: '凶', 35: '吉', 36: '凶', 37: '大吉', 38: '半吉', 39: '大吉', 40: '凶', 41: '大吉',
  42: '凶', 43: '凶', 44: '凶', 45: '大吉', 46: '凶', 47: '大吉', 48: '吉', 49: '凶',
  50: '凶', 51: '半吉', 52: '吉', 53: '凶', 54: '凶', 55: '半吉', 56: '凶', 57: '吉',
  58: '半吉', 59: '凶', 60: '凶', 61: '大吉', 62: '凶', 63: '大吉', 64: '凶', 65: '大吉',
  66: '凶', 67: '半吉', 68: '吉', 69: '凶', 70: '凶', 71: '半吉', 72: '凶', 73: '大吉',
  74: '凶', 75: '半吉', 76: '凶', 77: '半吉', 78: '半吉', 79: '凶', 80: '凶', 81: '大吉',
}

const WUGE_MEANINGS: Record<number, string> = {
  1: '萬物開泰，太極之數', 2: '混沌未定，分離散失', 3: '立身興業，名利雙收', 4: '破敗凶變，萬事休止',
  5: '陰陽和合，福祿長壽', 6: '天德地祥，安享榮華', 7: '剛情過剛，獨立權威', 8: '意志剛健，勤勉發展',
  9: '興盡凶始，病弱短壽', 10: '萬物終局，空虛無常', 11: '旱苗逢雨，復活更新', 12: '薄弱無力，孤立無援',
  13: '天賦吉運，才略智謀', 14: '浮沉不定，破家亡身', 15: '福壽雙全，富貴榮華', 16: '重厚載德，興家得助',
  17: '剛強突破，權威剛毅', 18: '有志竟成，名實兩得', 19: '風雲蔽日，辛苦多難', 20: '非業破運，災厄連綿',
  21: '明月光照，獨立權威', 22: '秋草逢霜，懷才不遇', 23: '旭日東升，名顯四方', 24: '家門餘慶，金錢豐盈',
  25: '資性英敏，剛柔得宜', 26: '變怪奇異，豪傑風雲', 27: '自我過強，非善評價', 28: '家親緣薄，離祖外出',
  29: '智謀兼備，財力歸集', 30: '非業破運，浮沉不定', 31: '智勇得志，統領幸福', 32: '僥倖多望，貴人得助',
  33: '升天之總，鸾鳳相会', 34: '破家亡身，禍害至極', 35: '溫和平靜，優雅發展', 36: '波瀾重疊，常陷困難',
  37: '權威顯達，忠信繁榮', 38: '藝術成功，半吉半凶', 39: '富貴荣华，變怪奇異', 40: '智謀膽力，衰敗凶變',
  41: '德高望重，事事如意', 42: '博識多能，隱憂未止', 43: '散財破運，外祥內苦', 44: '愁眉難展，精神壓力',
  45: '順風揚帆，新生泰和', 46: '載寶沉舟，力難伸展', 47: '開花結果，權威剛健', 48: '德智雙全，出身清貴',
  49: '吉臨則吉，凶來則凶', 50: '一成一敗，浮沉不定', 51: '盛衰交加，半吉半凶', 52: '先見之明，理想實現',
  53: '憂患內外，難以成功', 54: '憂患常見，多難多災', 55: '吉中藏凶，外祥內苦', 56: '歷經坎坷，晚景榮華',
  57: '寒雪青松，得時化吉', 58: '先苦後甜，半吉半凶', 59: '意志薄弱，難以成功', 60: '黑暗無光，不安定象',
  61: '名利雙收，富貴榮華', 62: '基礎虛弱，內外不和', 63: '富貴荣华，身心安泰', 64: '骨肉分離，憂患常見',
  65: '富貴長壽，家運隆昌', 66: '內外不和，多勞多難', 67: '順利進取，名利雙收', 68: '發展順利，智慮周密',
  69: '動盪不安，常陷逆境', 70: '家運衰退，晚景淒涼', 71: '吉凶參半，先吉後凶', 72: '先甜後苦，難以成功',
  73: '志高力微，外祥內憂', 74: '智謀薄弱，常陷逆境', 75: '吉中藏凶，進退維谷', 76: '離散分離，骨肉無情',
  77: '吉凶參半，先凶後吉', 78: '晚景榮華，半吉半凶', 79: '勞而無功，精神不振', 80: '隱憂未止，難以成功',
  81: '還元復始，萬物更新',
}

const GENERATES: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
const CONTROLS: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

export const ZODIAC_BY_BRANCH: Record<string, { name: string; element: string; traits: string }> = {
  子: { name: '鼠', element: '水', traits: '機敏、靈活、善於理財' },
  丑: { name: '牛', element: '土', traits: '勤奮、穩重、踏實' },
  寅: { name: '虎', element: '木', traits: '勇敢、威嚴、領導力' },
  卯: { name: '兔', element: '木', traits: '溫和、謹慎、善良' },
  辰: { name: '龍', element: '土', traits: '豪邁、進取、理想' },
  巳: { name: '蛇', element: '火', traits: '智慧、神秘、直覺' },
  午: { name: '馬', element: '火', traits: '熱情、自由、行動力' },
  未: { name: '羊', element: '土', traits: '溫順、創意、藝術' },
  申: { name: '猴', element: '金', traits: '聰慧、機智、多才' },
  酉: { name: '雞', element: '金', traits: '精準、自信、重信' },
  戌: { name: '狗', element: '土', traits: '忠誠、正義、可靠' },
  亥: { name: '豬', element: '水', traits: '厚道、福氣、隨和' },
}

export const DAYMASTER_BUILTIN: Record<string, { name: string; traits: string; element: string }> = {
  甲: { element: '木', name: '甲木', traits: '如大樹，正直向上，有領導力與仁心' },
  乙: { element: '木', name: '乙木', traits: '如花草，柔韌適應，善於協調' },
  丙: { element: '火', name: '丙火', traits: '如太陽，熱情光明，慷慨大方' },
  丁: { element: '火', name: '丁火', traits: '如燈燭，細膩溫暖，洞察入微' },
  戊: { element: '土', name: '戊土', traits: '如高山，穩重厚實，誠信可靠' },
  己: { element: '土', name: '己土', traits: '如田園，包容滋養，務實細心' },
  庚: { element: '金', name: '庚金', traits: '如刀劍，剛毅果決，重義氣' },
  辛: { element: '金', name: '辛金', traits: '如珠玉，精緻敏銳，好面子' },
  壬: { element: '水', name: '壬水', traits: '如江河，智慧流動，適應力強' },
  癸: { element: '水', name: '癸水', traits: '如雨露，細膩內斂，直覺敏銳' },
}

const PATTERN_BUILTIN: Record<string, { desc: string }> = {
  正官格: { desc: '月令正官透干，主貴气、名望、事業穩定' },
  七殺格: { desc: '月令七殺，主魄力、權威，需制化方為貴' },
  正財格: { desc: '月令正財，主勤儉務實、穩定財路' },
  偏財格: { desc: '月令偏財，主投資、人緣、偏門財' },
  正印格: { desc: '月令正印，主學業、貴人、名譽' },
  偏印格: { desc: '月令偏印，主技藝、直覺、偏門學問' },
  食神格: { desc: '月令食神，主才華、口福，為福星' },
  傷官格: { desc: '月令傷官，主聰明、口才、技藝' },
  比肩格: { desc: '月令比肩，主獨立、競爭、自我' },
  劫財格: { desc: '月令劫財，主行動力、破財、競爭' },
  中和格: { desc: '五行較平衡，宜綜合喜用神論命' },
}

/** 常用簡繁對照（執行期查筆劃備用） */
export const SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  国: '國', 学: '學', 体: '體', 电: '電', 画: '畫', 乐: '樂', 龙: '龍', 凤: '鳳',
  圣: '聖', 县: '縣', 总: '總', 广: '廣', 开: '開', 关: '關', 门: '門', 东: '東',
  车: '車', 马: '馬', 鸟: '鳥', 鱼: '魚', 贝: '貝', 见: '見', 页: '頁', 风: '風',
  云: '雲', 阳: '陽', 阴: '陰', 万: '萬', 绣: '綉', 瑶: '瑤', 丽: '麗', 华: '華',
  宝: '寶', 实: '實', 汉: '漢', 语: '語', 说: '說', 读: '讀', 书: '書', 写: '寫',
  认: '認', 让: '讓', 许: '許', 论: '論', 调: '調', 谈: '談', 请: '請', 谢: '謝',
  护: '護', 报: '報', 扬: '揚', 换: '換', 备: '備', 梦: '夢', 头: '頭', 顾: '顧',
  飞: '飛', 饭: '飯', 饮: '飲', 馆: '館', 养: '養', 发: '發', 对: '對', 将: '將',
  专: '專', 传: '傳', 边: '邊', 连: '連', 进: '進', 远: '遠', 选: '選', 运: '運',
  还: '還', 这: '這', 过: '過', 达: '達', 严: '嚴', 欢: '歡', 观: '觀', 计: '計',
  议: '議', 证: '證', 识: '識', 词: '詞', 诗: '詩', 诚: '誠', 丰: '豐', 为: '為',
  举: '舉', 义: '義', 习: '習', 乡: '鄉', 买: '買', 乱: '亂', 产: '產', 亲: '親',
  从: '從', 们: '們', 会: '會', 伟: '偉', 伤: '傷', 余: '餘', 儿: '兒', 党: '黨',
  兰: '蘭', 兴: '興', 内: '內', 军: '軍', 农: '農', 冯: '馮', 冲: '沖', 决: '決',
  冻: '凍', 净: '淨', 减: '減', 几: '幾', 凯: '凱', 击: '擊', 剑: '劍', 动: '動',
  劳: '勞', 势: '勢', 汇: '匯', 汤: '湯', 没: '沒', 泽: '澤', 洁: '潔', 测: '測',
  济: '濟', 浓: '濃', 涛: '濤', 润: '潤', 温: '溫', 湾: '灣', 湿: '濕', 满: '滿',
  灭: '滅', 灵: '靈', 灿: '燦', 炉: '爐', 烟: '煙', 烧: '燒', 热: '熱', 焕: '煥',
  墙: '牆', 壮: '壯', 声: '聲', 处: '處', 奋: '奮', 妆: '妝', 妇: '婦', 妈: '媽',
  孙: '孫', 审: '審', 宪: '憲', 宫: '宮', 宽: '寬', 宾: '賓', 寿: '壽', 尘: '塵',
  尽: '盡', 层: '層', 属: '屬', 岁: '歲', 岭: '嶺', 币: '幣', 帅: '帥', 师: '師',
  带: '帶', 帮: '幫', 库: '庫', 应: '應', 庙: '廟', 庞: '龐', 废: '廢', 异: '異',
  张: '張', 强: '強', 归: '歸', 当: '當', 录: '錄', 彦: '彥', 径: '徑', 后: '後',
  恒: '恆', 恶: '惡', 悦: '悅', 惊: '驚', 愿: '願', 态: '態', 战: '戰', 戏: '戲',
  扩: '擴', 扫: '掃', 担: '擔', 拥: '擁', 择: '擇', 挂: '掛', 挥: '揮', 损: '損',
  据: '據', 摄: '攝', 摆: '擺', 摇: '搖', 摊: '攤', 欧: '歐', 赵: '趙', 钱: '錢',
  刘: '劉', 陈: '陳', 杨: '楊', 黄: '黃', 吴: '吳', 郑: '鄭', 韩: '韓', 苏: '蘇',
  叶: '葉', 吕: '呂', 卢: '盧', 蒋: '蔣', 龚: '龔', 赖: '賴', 爱: '愛', 样: '樣',
  机: '機', 时: '時', 间: '間', 无: '無', 个: '個', 来: '來', 长: '長', 与: '與',
  给: '給', 问: '問', 听: '聽', 数: '數', 点: '點', 难: '難', 显: '顯', 类: '類',
  题: '題', 响: '響', 盐: '鹽', 龟: '龜', 台: '臺', 钟: '鐘', 里: '裡', 谷: '穀',
  齐: '齊', 丑: '醜',
}

export function normalizeWugeNumber(n: number): number {
  if (n <= 0) return 1
  if (n <= 81) return n
  return ((n - 1) % 81) + 1
}

export function numToElementBuiltin(n: number): string {
  const d = Math.abs(n) % 10
  if (d === 1 || d === 2) return '木'
  if (d === 3 || d === 4) return '火'
  if (d === 5 || d === 6) return '土'
  if (d === 7 || d === 8) return '金'
  return '水'
}

export function computeNayin(ganZhi: string): { nayin: string; element: string } | null {
  if (ganZhi.length !== 2) return null
  const si = STEMS.indexOf(ganZhi[0] as typeof STEMS[number])
  const bi = BRANCHES.indexOf(ganZhi[1] as typeof BRANCHES[number])
  if (si < 0 || bi < 0) return null
  for (let i = 0; i < 60; i++) {
    if (i % 10 === si && i % 12 === bi) {
      const idx = Math.floor(i / 2) % 30
      return { nayin: NAYIN_NAMES[idx], element: NAYIN_ELEMENTS[idx] }
    }
  }
  return null
}

export function computeWugeLuck(num: number): WugeLuckEntry {
  const n = normalizeWugeNumber(num)
  const title = WUGE_MEANINGS[n]
  return {
    number: num,
    luck: WUGE_LUCK[n] ?? '半吉',
    title,
    meaning: title,
  }
}

export function evaluateSancaiBuiltin(tianEl: string, renEl: string, diEl: string): SancaiEntry {
  let score = 0
  if (GENERATES[tianEl] === renEl) score += 2
  if (GENERATES[renEl] === diEl) score += 2
  if (CONTROLS[tianEl] === renEl) score -= 2
  if (CONTROLS[renEl] === diEl) score -= 2
  if (tianEl === renEl && renEl === diEl) score += 1

  if (score >= 3) return { luck: '大吉', title: '三才相生', meaning: '天、人、地格五行連續相生，運勢通暢' }
  if (score >= 1) return { luck: '吉', title: '三才平和', meaning: '三才配置尚可，順勢而為可成' }
  if (score >= -1) return { luck: '半吉', title: '三才中和', meaning: '三才略有起伏，宜謹慎行事' }
  return { luck: '凶', title: '三才相剋', meaning: '天、人、地格有所相剋，宜後天修養補足' }
}

export function getCharMeaningFallback(_char: string, strokes: number, wuxing: string): string {
  return `五行${wuxing}，康熙${strokes}劃，適合取名`
}

export function resolveStrokeVariant(char: string): string {
  return SIMPLIFIED_TO_TRADITIONAL[char] ?? char
}

export function isCjkChar(char: string): boolean {
  const cp = char.codePointAt(0) ?? 0
  return (
    (cp >= 0x3400 && cp <= 0x4dbf) || // Ext A
    (cp >= 0x4e00 && cp <= 0x9fff) || // 基本
    (cp >= 0xf900 && cp <= 0xfaff) || // 相容
    (cp >= 0x20000 && cp <= 0x2a6df) // Ext B（資料庫已含部分）
  )
}

export function getPatternBuiltin(name: string): PatternEntry {
  const base = {
    type: '正格',
    favorable: '視身強弱而定',
    unfavorable: '視身強弱而定',
  }
  const hit = {
    正官格: { type: '正格', desc: '月令正官透干，主貴气、名望、事業穩定', favorable: '印、財', unfavorable: '傷官、比劫過旺' },
    七殺格: { type: '正格', desc: '月令七殺，主魄力、權威，需制化方為貴', favorable: '食神、正印', unfavorable: '財星生殺無制' },
    偏印格: { type: '正格', desc: '月令偏印，主技藝、直覺、偏門學問', favorable: '官、殺', unfavorable: '財、食' },
    中和格: { type: '普通', desc: '五行較平衡，宜綜合喜用神論命', favorable: '視身強弱', unfavorable: '視身強弱' },
  }[name]
  return hit ?? { ...base, desc: PATTERN_BUILTIN[name]?.desc ?? PATTERN_BUILTIN['中和格']!.desc }
}

interface PatternEntry {
  type: string
  desc: string
  favorable: string
  unfavorable: string
}
