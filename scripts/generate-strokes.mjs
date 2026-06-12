/**
 * 筆劃資料庫：cnchar + 台灣標準字 + CCD 生僻字 + 簡繁對照 + 手動補充
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import {
  loadCncharStrokes,
  loadZhStrokeData,
  loadCcdStrokes,
  loadSimplifiedToTraditional,
  mergeStrokes,
  applyVariantStrokes,
} from './lib/cjk-sources.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'data')

/** 康熙/姓名學特殊字（覆蓋優先） */
const MANUAL = {
  綉: 13, 绣: 13, 瑤: 14, 瑶: 14, 國: 11, 国: 11, 學: 16, 学: 16,
  體: 23, 体: 23, 電: 13, 电: 13, 畫: 12, 画: 12, 樂: 15, 乐: 15,
  龍: 16, 龙: 16, 鳳: 14, 凤: 14, 聖: 13, 圣: 13, 縣: 16, 县: 16,
  總: 17, 总: 17, 廣: 15, 广: 15, 開: 12, 开: 12, 關: 19, 关: 19,
  門: 8, 门: 8, 東: 8, 东: 8, 車: 7, 车: 7, 馬: 10, 马: 10,
  鳥: 11, 鸟: 11, 魚: 11, 鱼: 11, 貝: 7, 贝: 7, 見: 7, 见: 7,
  頁: 9, 页: 9, 風: 9, 风: 9, 雲: 12, 云: 12, 陽: 12, 阳: 12,
  陰: 10, 阴: 10, 萬: 12, 万: 12, 歐: 15, 欧: 15, 帥: 9, 帅: 9,
  臺: 14, 台: 14, 後: 9, 后: 9, 裡: 11, 里: 11, 鐘: 17, 钟: 17,
  鍾: 17, 於: 8, 于: 8, 乾: 11, 干: 11, 穀: 15, 谷: 15,
  醜: 17, 丑: 17, 齊: 14, 齐: 14, 趙: 14, 赵: 14, 錢: 16, 钱: 16,
  孫: 10, 孙: 10, 劉: 15, 刘: 15, 陳: 11, 陈: 11, 楊: 13, 杨: 13,
  黃: 12, 黄: 12, 吳: 7, 吴: 7, 鄭: 14, 郑: 14, 謝: 17, 谢: 17,
  韓: 17, 韩: 17, 馮: 12, 冯: 12, 鄧: 14, 邓: 14, 許: 11, 许: 11,
  蘇: 19, 苏: 19, 葉: 12, 叶: 12, 呂: 7, 吕: 7, 盧: 16, 卢: 16,
  蔣: 14, 蒋: 14, 龔: 23, 龚: 23, 賴: 16, 赖: 16, 顧: 21, 顾: 21,
  愛: 13, 爱: 13, 歡: 21, 欢: 21, 樣: 15, 样: 15, 機: 16, 机: 16,
  發: 12, 发: 12, 對: 14, 对: 14, 時: 10, 时: 10, 間: 12, 间: 12,
  無: 12, 无: 12, 為: 12, 为: 12, 這: 11, 这: 11, 個: 10, 个: 10,
  們: 10, 们: 10, 來: 8, 来: 8, 說: 14, 说: 14, 會: 13, 会: 13,
  長: 8, 长: 8, 從: 11, 从: 11, 兩: 8, 两: 8, 與: 13, 与: 13,
  給: 12, 给: 12, 還: 16, 还: 16, 進: 12, 进: 12, 過: 11, 过: 11,
  動: 11, 动: 11, 問: 11, 问: 11, 聽: 22, 听: 22, 讓: 24, 让: 24,
  認: 14, 认: 14, 識: 19, 识: 19, 課: 15, 课: 15, 語: 14, 语: 14,
  讀: 22, 读: 22, 寫: 15, 写: 15, 數: 15, 数: 15, 點: 17, 点: 17,
  難: 19, 难: 19, 願: 19, 愿: 19, 親: 16, 亲: 16, 顯: 23, 显: 23,
  類: 18, 类: 18, 頭: 16, 头: 16, 題: 18, 题: 18, 聲: 17, 声: 17,
  響: 20, 响: 20, 顏: 18, 颜: 18, 飛: 9, 飞: 9, 飯: 12, 饭: 12,
  飲: 13, 饮: 13, 館: 16, 馆: 16, 鹽: 24, 盐: 24, 麗: 19, 丽: 19,
  黨: 20, 党: 20, 龜: 16, 龟: 16,
  // 常見生僻/異體取名用字
  𠮷: 6, 喆: 12, 堃: 11, 煊: 13, 暔: 14, 旻: 8, 彧: 10, 翀: 10,
  玥: 8, 璟: 16, 琛: 12, 琋: 11, 頔: 14, 頔: 14, 燊: 16, 燚: 16,
  淼: 12, 犇: 12, 骉: 30, 羴: 30, 猋: 12, 麤: 33, 鱻: 33, 叕: 8,
  㙓: 14, 㙔: 14, 㐀: 2,
}

mkdirSync(outDir, { recursive: true })

const cnchar = loadCncharStrokes()
const zhStd = loadZhStrokeData()
const ccd = loadCcdStrokes()
const s2t = loadSimplifiedToTraditional()

// 合併優先：手動 > cnchar > 台灣標準 > CCD（CCD 範圍最大，放最底作兜底）
const strokes = mergeStrokes([ccd, zhStd, cnchar, MANUAL])
const variantAdded = applyVariantStrokes(strokes, s2t)

writeFileSync(join(outDir, 'strokes.json'), JSON.stringify(strokes))
writeFileSync(join(outDir, 's2t-variants.json'), JSON.stringify(s2t))

const total = Object.keys(strokes).length
const rareSample = ['𠮷', '㐀', '䶮', '𤋮', '𨭎'].filter((c) => strokes[c])
console.log(
  `strokes.json: ${total} chars (ccd ${Object.keys(ccd).length} + zh ${Object.keys(zhStd).length} + cnchar ${Object.keys(cnchar).length} + manual + variants ${variantAdded})`,
)
if (rareSample.length) console.log(`  rare hits: ${rareSample.map((c) => `${c}=${strokes[c]}`).join(', ')}`)
