import { PDFDocument, type PDFFont, type PDFPage, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { AnalysisResult, BirthInput, Element } from '../types'
import { pillarsToArray } from './bazi'
import { getTengodGods } from './dataStore'

const FONT_URL = '/fonts/NotoSansTC-VF.ttf'
const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 42
const GAP = 10
const FOOTER_RESERVE = 88
const CONTENT_WIDTH = PAGE_W - MARGIN * 2

function scaleTableWidths(widths: number[]): number[] {
  const sum = widths.reduce((a, b) => a + b, 0)
  if (sum <= CONTENT_WIDTH) return widths
  const ratio = CONTENT_WIDTH / sum
  return widths.map((w) => Math.floor(w * ratio))
}

const COLORS = {
  bg: rgb(0.027, 0.051, 0.102),
  card: rgb(0.102, 0.153, 0.267),
  card2: rgb(0.071, 0.114, 0.204),
  border: rgb(0.32, 0.39, 0.52),
  gold: rgb(0.941, 0.753, 0.251),
  gold2: rgb(0.992, 0.902, 0.541),
  text: rgb(0.97, 0.98, 1),
  muted: rgb(0.78, 0.84, 0.91),
  danger: rgb(0.98, 0.45, 0.45),
  green: rgb(0.29, 0.82, 0.5),
  red: rgb(0.94, 0.36, 0.36),
  blue: rgb(0.38, 0.63, 1),
  gray: rgb(0.88, 0.91, 0.95),
}

const ELEMENT_COLOR: Record<Element, ReturnType<typeof rgb>> = {
  木: COLORS.green,
  火: COLORS.red,
  土: COLORS.gold,
  金: COLORS.gray,
  水: COLORS.blue,
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || '命盤'
}

function clean(text: unknown): string {
  return String(text ?? '')
    .replace(/./gs, (char) => {
      const code = char.charCodeAt(0)
      return (code <= 31 || (code >= 127 && code <= 159)) ? '' : char
    })
    .replace(/相会/g, '相會')
    .trim()
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  for (const paragraph of clean(text).split(/\n+/)) {
    let line = ''
    for (const char of [...paragraph]) {
      const next = line + char
      if (line && font.widthOfTextAtSize(next, size) > maxWidth) {
        lines.push(line)
        line = char
      } else {
        line = next
      }
    }
    if (line) lines.push(line)
    if (!paragraph) lines.push('')
  }
  return lines
}

export function waitForLayout(): Promise<void> {
  return Promise.resolve()
}

async function loadChineseFont(pdfDoc: PDFDocument): Promise<PDFFont> {
  pdfDoc.registerFontkit(fontkit)
  const res = await fetch(FONT_URL)
  if (!res.ok) throw new Error('中文字型載入失敗，請確認 public/fonts/NotoSansTC-VF.ttf 已上傳')
  return pdfDoc.embedFont(await res.arrayBuffer(), { subset: true })
}

function saveBytes(bytes: Uint8Array, filename: string) {
  const data = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(data).set(bytes)
  const blob = new Blob([data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

class PdfLayout {
  page: PDFPage
  y = PAGE_H - MARGIN
  private contentAddedOnPage = false
  private readonly doc: PDFDocument
  private readonly font: PDFFont

  constructor(
    doc: PDFDocument,
    font: PDFFont,
  ) {
    this.doc = doc
    this.font = font
    this.page = this.doc.addPage([PAGE_W, PAGE_H])
    this.paintBackground()
  }

  private paintBackground() {
    this.page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COLORS.bg })
  }

  private newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H])
    this.y = PAGE_H - MARGIN
    this.contentAddedOnPage = false
    this.paintBackground()
  }

  ensure(height: number) {
    if (this.y - height < MARGIN + FOOTER_RESERVE) this.newPage()
  }

  text(text: string, x: number, y: number, size: number, color = COLORS.text) {
    this.contentAddedOnPage = true
    this.page.drawText(clean(text), { x, y, size, font: this.font, color })
  }

  title(text: string) {
    this.ensure(44)
    this.page.drawRectangle({ x: MARGIN, y: this.y - 24, width: 4, height: 20, color: COLORS.gold })
    this.text(text, MARGIN + 12, this.y - 20, 16, COLORS.gold2)
    this.y -= 44
  }

  paragraph(text: string, options?: { size?: number; color?: ReturnType<typeof rgb>; indent?: number }) {
    const size = options?.size ?? 10.5
    const indent = options?.indent ?? 0
    const maxWidth = PAGE_W - MARGIN * 2 - indent
    const lines = wrapText(text, this.font, size, maxWidth)
    const lineH = size * 1.55
    for (const line of lines) {
      this.ensure(lineH + 2)
      this.text(line, MARGIN + indent, this.y - size, size, options?.color ?? COLORS.text)
      this.y -= lineH
    }
    this.y -= 4
  }

  pill(text: string, x: number, y: number, color = COLORS.card2) {
    const width = this.font.widthOfTextAtSize(text, 9) + 14
    this.page.drawRectangle({ x, y: y - 5, width, height: 15, color, borderColor: COLORS.border, borderWidth: 0.5 })
    this.text(text, x + 7, y, 9, COLORS.text)
    return width
  }

  card(title: string, lines: string[], options?: { accent?: ReturnType<typeof rgb> }) {
    const size = 10
    const titleH = 18
    const lineH = 15
    const innerW = CONTENT_WIDTH - 28
    const wrapped = lines.flatMap((line) => wrapText(line, this.font, size, innerW))
    const height = Math.max(54, titleH + wrapped.length * lineH + 22)
    this.ensure(height + GAP)
    const y = this.y - height
    this.page.drawRectangle({
      x: MARGIN,
      y,
      width: CONTENT_WIDTH,
      height,
      color: COLORS.card,
      borderColor: options?.accent ?? COLORS.border,
      borderWidth: 0.7,
    })
    this.text(title, MARGIN + 14, y + height - 20, 12, options?.accent ?? COLORS.gold)
    let cy = y + height - 38
    for (const line of wrapped) {
      this.text(line, MARGIN + 14, cy, size, COLORS.muted)
      cy -= lineH
    }
    this.y = y - GAP
  }

  table(title: string, rows: string[][], widths: number[]) {
    const colWidths = scaleTableWidths(widths)
    this.title(title)
    for (const row of rows) {
      const size = 8.5
      const wrappedCells = row.map((cell, i) => wrapText(cell, this.font, size, Math.max(24, colWidths[i] - 10)))
      const rowLines = Math.max(...wrappedCells.map((cell) => cell.length), 1)
      const rowH = Math.max(26, rowLines * 12 + 12)
      this.ensure(rowH + 2)
      const safeY = this.y - rowH
      this.page.drawRectangle({ x: MARGIN, y: safeY, width: CONTENT_WIDTH, height: rowH, color: COLORS.card2, borderColor: COLORS.border, borderWidth: 0.4 })
      let x = MARGIN + 8
      wrappedCells.forEach((cellLines, i) => {
        let lineY = safeY + rowH - 14
        cellLines.forEach((line) => {
          this.text(line, x, lineY, size, i === 0 ? COLORS.gold : COLORS.text)
          lineY -= 12
        })
        x += colWidths[i]
      })
      this.y -= rowH + 4
    }
    this.y -= 4
  }

  addPageNumbers() {
    const pages = this.doc.getPages()
    const total = pages.length
    pages.forEach((page, index) => {
      const label = `${index + 1} / ${total}`
      const size = 8
      const textW = this.font.widthOfTextAtSize(label, size)
      page.drawText(label, {
        x: PAGE_W - MARGIN - textW,
        y: 16,
        size,
        font: this.font,
        color: COLORS.muted,
      })
    })
  }

  removeTrailingBlankPage() {
    const pages = this.doc.getPages()
    if (!this.contentAddedOnPage && pages.length > 1) {
      this.doc.removePage(pages.length - 1)
    }
  }
}

function drawCover(layout: PdfLayout, input: BirthInput, result: AnalysisResult) {
  const pillars = pillarsToArray(result.chart).map((p) => `${p.stem}${p.branch}`).join('  ')
  layout.page.drawRectangle({ x: 55, y: 75, width: PAGE_W - 110, height: PAGE_H - 150, color: COLORS.card, borderColor: COLORS.gold, borderWidth: 0.8 })
  layout.text('BAZI & NAME REPORT', 183, 680, 15, COLORS.gold)
  layout.text('八字 × 姓名合參報告', 139, 630, 27, COLORS.gold2)
  layout.text(input.name || '未命名命盤', 230, 565, 21, COLORS.text)
  layout.page.drawLine({ start: { x: 215, y: 520 }, end: { x: 380, y: 520 }, thickness: 1, color: COLORS.gold })
  layout.text(`四柱：${pillars}`, 150, 470, 13, COLORS.muted)
  layout.text(`日主：${result.chart.dayMaster}（身強弱：${result.strengthLabel}，系統初判）`, 155, 440, 13, COLORS.muted)
  layout.text(`喜用初判：${result.favorableElements.join('、')}｜主題：${input.topic || '整體運勢'}`, 145, 410, 13, COLORS.muted)
  layout.text(`四柱排盤來源：${result.chart.source === 'lunar-javascript' ? 'lunar-javascript' : '使用者輸入'}`, 180, 388, 10, COLORS.muted)
  layout.text('本報告為命理模型分析，提供結構化參考，不作絕對定論。', 130, 365, 10, COLORS.muted)
  layout.text(`產生日期：${new Date().toLocaleDateString('zh-TW')}`, 222, 135, 10, COLORS.muted)
}

function sectionText(result: AnalysisResult, key: keyof NonNullable<AnalysisResult['aiSections']>, fallback: string) {
  return result.aiSections?.[key] || fallback
}

// 每頁固定顯示的說明行（底部）
const PDF_SOURCE_NOTES = [
  '四柱排盤來源：lunar-javascript',
  '十神、藏干、刑沖合害、五行強弱與文案由本系統規則引擎計算',
  '八字流年以立春為界，非國曆 1 月 1 日',
  '流月以節氣切換，不等於農曆初一或國曆每月 1 日',
  '五行分數為系統自訂權重模型，僅供相對比較',
  '身強弱為系統初判，需搭配完整旺衰模型驗證',
]

export async function exportPdf(_element: HTMLElement, input: BirthInput, result: AnalysisResult): Promise<void> {
  const pdfDoc = await PDFDocument.create()
  const font = await loadChineseFont(pdfDoc)
  const layout = new PdfLayout(pdfDoc, font)

  // ── 第 1 頁：封面 ────────────────────────────────────────────────
  drawCover(layout, input, result)

  const pillars = pillarsToArray(result.chart)

  // ── 第 2 頁：命盤總覽與十神 ──────────────────────────────────────
  layout.ensure(PAGE_H)
  layout.title('命盤總覽與十神')
  layout.card(input.name || '未命名命盤', [
    `四柱排盤來源：${result.chart.source === 'lunar-javascript' ? 'lunar-javascript' : '使用者輸入'}`,
    '十神、藏干、刑沖合害、五行強弱與文案由本系統規則引擎計算',
    `四柱：${pillars.map((p) => `${p.label}${p.stem}${p.branch}`).join('　')}`,
    `日主：${result.chart.dayMaster}${result.chart.dayMasterElement}｜身強弱：${result.strengthLabel}（系統初判）`,
    `喜用初判：${result.favorableElements.join('、')}${result.unfavorableElements?.length ? `｜需留意：${result.unfavorableElements.join('、')}` : ''}`,
  ], { accent: COLORS.gold })

  pillars.forEach((p) => {
    layout.card(`${p.label}：${p.stem}${p.branch}`, [
      `天干十神：${p.stemTenGod}`,
      `地支主氣：${p.branchMainQi.stem} / ${p.branchMainQi.tenGod}`,
      `藏干十神：${p.hiddenStemTenGods.map((h) => `${h.stem}(${h.qi}) ${h.tenGod}`).join('、')}`,
      `納音：${p.nayin || '—'}`,
    ], { accent: ELEMENT_COLOR[p.stemElement] })
  })
  layout.table(
    '十神詳表',
    pillars.map((p) => [
      p.label,
      `${p.stem}${p.branch}`,
      p.stemTenGod,
      `${p.branchMainQi.stem} / ${p.branchMainQi.tenGod}`,
      p.hiddenStemTenGods.map((h) => `${h.stem}：${h.tenGod}`).join('、'),
    ]),
    [45, 50, 65, 85, 280],
  )
  const tengods = getTengodGods()
  const tengodOrder = ['比肩', '劫財', '食神', '傷官', '偏財', '正財', '七殺', '正官', '偏印', '正印']
  layout.table(
    '十神總表',
    tengodOrder.map((name) => {
      const item = tengods[name]
      return [name, item?.basic || item?.nature || '', item?.persons || '', item?.traits || '']
    }),
    [45, 110, 180, 190],
  )

  // ── 第 3 頁：五行與身強弱 ─────────────────────────────────────────
  layout.ensure(PAGE_H)
  layout.title('五行與身強弱')
  layout.paragraph('五行分數為系統自訂權重模型，僅供相對比較，不代表傳統命理唯一標準。', { color: COLORS.muted })
  if (result.elementModelNote) layout.paragraph(result.elementModelNote, { color: COLORS.muted })
  ;(['木', '火', '土', '金', '水'] as Element[]).forEach((el) => {
    const value = result.elementStats[el]
    const maxVal = Math.max(...(['木', '火', '土', '金', '水'] as Element[]).map((e) => result.elementStats[e]), 1)
    const barMaxW = 330
    const barW = Math.min(barMaxW, Math.max(8, (value / maxVal) * barMaxW))
    layout.ensure(26)
    layout.text(el, MARGIN, layout.y - 10, 11, ELEMENT_COLOR[el])
    layout.page.drawRectangle({ x: MARGIN + 28, y: layout.y - 14, width: barMaxW, height: 10, color: COLORS.card2 })
    layout.page.drawRectangle({ x: MARGIN + 28, y: layout.y - 14, width: barW, height: 10, color: ELEMENT_COLOR[el] })
    layout.text(value.toFixed(1), MARGIN + 28 + barMaxW + 8, layout.y - 13, 9, COLORS.muted)
    layout.y -= 24
  })
  layout.card('五行相對結果', [
    `五行最旺：${result.strongestElement}`,
    `五行最弱：${result.weakestElement}`,
    result.elementReason || '',
  ])
  layout.card('日主旺弱判斷依據', [
    `身強弱：${result.strengthLabel}`,
    `系統參考分數：${result.strength}%`,
    result.strengthScoreNote || '此分數為系統模型估算，不是命理絕對值',
    `可信度：${result.strengthConfidence || '中'}`,
    ...(result.strengthBasis ?? []),
    `喜用初判：${result.favorableElements.join('、')}${result.unfavorableElements?.length ? `；需留意：${result.unfavorableElements.join('、')}` : ''}`,
    result.favorableNote || '',
  ], { accent: COLORS.gold })
  layout.card('喜用神補強', result.elementAdvice.map((a) => `${a.element}：顏色 ${a.colors.join('、')}；方位 ${a.directions.join('、')}；職業 ${a.careers.join('、')}；習慣 ${a.habits.join('、')}`))

  // ── 第 4 頁：格局與刑沖合害 ──────────────────────────────────────
  layout.ensure(PAGE_H)
  layout.title('格局與刑沖合害')
  layout.card('格局傾向', [`格局傾向：${result.pattern}`, result.patternNote || ''], { accent: COLORS.gold })
  if (result.relations.length) {
    layout.table('刑沖合害成立項（規則引擎結果）', result.relations.map((r) => [r.type, r.label, r.branches?.join('、') || '', r.desc]), [45, 120, 80, 280])
  } else {
    layout.paragraph('本命盤未見明顯刑沖合害。', { color: COLORS.muted })
  }
  layout.card('規則說明', [
    '自刑：同一地支至少出現兩次才成立。',
    '三合局：三個地支全部出現才成立。',
    '半合：只寫半合，不寫成完整三合局。',
    '六合：只列合，未實作合化條件前不宣稱合化。',
  ])

  // ── 第 5 頁：大運 ─────────────────────────────────────────────────
  layout.ensure(PAGE_H)
  layout.title('大運')
  layout.paragraph(result.dayunNote || '', { color: COLORS.muted })
  layout.table('大運詳細分析', result.dayunDetails.map((d) => [d.age, d.pillar, d.tenGod, `參考 ${d.score}`, d.focus]), [95, 55, 55, 55, 265])

  // ── 第 6 頁：流年與流月 ───────────────────────────────────────────
  layout.ensure(PAGE_H)
  layout.title('流年與流月')
  layout.paragraph('八字流年以立春為界，非國曆 1 月 1 日。', { color: COLORS.muted })
  if (result.liunianNote) layout.paragraph(result.liunianNote, { color: COLORS.muted })
  layout.table('流年', result.liunian.map((l) => [`${l.year}`, l.pillar, l.tenGod, l.nayin, l.summary]), [55, 55, 60, 75, 260])
  layout.paragraph('流月以節氣切換，不等於農曆初一或國曆每月 1 日。', { color: COLORS.muted })
  if (result.liuyueNote) layout.paragraph(result.liuyueNote, { color: COLORS.muted })
  layout.table('節氣流月', result.liuyueDetails.map((m) => [m.label, m.range || '', m.pillar, m.tenGod, m.advice]), [45, 90, 55, 60, 275])

  // ── 第 7 頁：薪資主題分析 ─────────────────────────────────────────
  layout.ensure(PAGE_H)
  layout.title('主題分析')
  layout.paragraph(result.summary)
  layout.paragraph(result.detailText)
  layout.card(`主題分析：${input.topic || '整體運勢'}`, [result.topicAnalysis], { accent: COLORS.gold })
  layout.title('AI 分段解讀')
  layout.card('事業', [sectionText(result, 'career', '尚未產生 AI 事業解讀')])
  layout.card('財運', [sectionText(result, 'wealth', '尚未產生 AI 財運解讀')])
  layout.card('感情人際', [sectionText(result, 'relationship', '尚未產生 AI 感情人際解讀')])
  layout.card('健康', [sectionText(result, 'health', '尚未產生 AI 健康解讀')])
  layout.card('流年', [sectionText(result, 'yearly', '尚未產生 AI 流年解讀')])
  layout.card('姓名建議', [sectionText(result, 'nameAdvice', '尚未產生 AI 姓名建議')])
  layout.card('喜用補強', [sectionText(result, 'remedies', '尚未產生 AI 喜用補強建議')])

  // ── 第 8 頁：姓名與神煞驗證狀態 ──────────────────────────────────
  layout.ensure(PAGE_H)
  layout.title('姓名與神煞驗證狀態')

  if (result.wuge && result.wuge.總格 > 0) {
    const w = result.wuge
    layout.paragraph('姓名五格：待校驗。姓名筆畫與字五行依流派不同，未校驗前不輸出吉凶定論，以下為資料庫計算值。', { color: COLORS.muted })
    if (result.nameValidationNote) layout.paragraph(result.nameValidationNote, { color: COLORS.muted })
    layout.table('五格數理（待校驗）', [
      ['天格', `${w.天格}`, w.luck.天格, w.details.天格?.meaning || ''],
      ['人格', `${w.人格}`, w.luck.人格, w.details.人格?.meaning || ''],
      ['地格', `${w.地格}`, w.luck.地格, w.details.地格?.meaning || ''],
      ['外格', `${w.外格}`, w.luck.外格, w.details.外格?.meaning || ''],
      ['總格', `${w.總格}`, w.luck.總格, w.details.總格?.meaning || ''],
    ], [55, 45, 55, 380])
    if (w.charAnalysis.length) {
      layout.table('姓名字義與五行', w.charAnalysis.map((c) => [c.char, `${c.strokes}劃`, c.wuxing || '需確認', c.meaning || '需確認']), [45, 65, 65, 350])
    }
    if (w.unknownChars.length) {
      layout.paragraph(`以下字元筆畫資料庫尚未收錄，需手動校驗：${w.unknownChars.join('、')}`, { color: COLORS.muted })
    }
  } else {
    layout.paragraph('未輸入姓名，略過五格分析。', { color: COLORS.muted })
  }

  // 神煞：公式未完成時顯示尚未驗證，不輸出任何吉凶結論
  if (result.shensha && result.shensha.length > 0) {
    layout.paragraph(result.shenshaNote || '', { color: COLORS.muted })
    layout.table('神煞', result.shensha.map((s) => [s.name, s.status || s.type, s.basis || '依據資料表', s.desc]), [75, 55, 120, 275])
  } else {
    layout.card('神煞：尚未驗證', [
      '神煞需依日干、年干、地支或月令查法判定，目前公式未完成驗證，不列入正式結論。',
    ], { accent: COLORS.gold })
  }

  if (result.aiQuestions?.length) {
    layout.title('AI 追問紀錄')
    result.aiQuestions.forEach((q) => layout.card(`問：${q.question}`, [q.answer], { accent: COLORS.gold }))
  }

  // ── 每頁底部加固定來源說明（換行、不與頁碼重疊）────────────────
  const allPages = pdfDoc.getPages()
  allPages.forEach((page, idx) => {
    if (idx === 0) return
    let noteY = 28
    PDF_SOURCE_NOTES.forEach((note) => {
      const lines = wrapText(note, font, 6.5, CONTENT_WIDTH)
      lines.forEach((line) => {
        page.drawText(line, { x: MARGIN, y: noteY, size: 6.5, font, color: COLORS.muted })
        noteY += 8
      })
    })
  })

  layout.removeTrailingBlankPage()
  layout.addPageNumbers()
  const bytes = await pdfDoc.save()
  saveBytes(bytes, `${sanitizeFilename(input.name || '命盤')}_八字分析.pdf`)
}
