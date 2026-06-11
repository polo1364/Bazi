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
    if (this.y - height < MARGIN) this.newPage()
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
    const wrapped = lines.flatMap((line) => wrapText(line, this.font, size, PAGE_W - MARGIN * 2 - 28))
    const height = Math.max(54, titleH + wrapped.length * 15 + 22)
    this.ensure(height + GAP)
    const y = this.y - height
    this.page.drawRectangle({
      x: MARGIN,
      y,
      width: PAGE_W - MARGIN * 2,
      height,
      color: COLORS.card,
      borderColor: options?.accent ?? COLORS.border,
      borderWidth: 0.7,
    })
    this.text(title, MARGIN + 14, y + height - 20, 12, options?.accent ?? COLORS.gold)
    let cy = y + height - 38
    for (const line of wrapped) {
      this.text(line, MARGIN + 14, cy, size, COLORS.muted)
      cy -= 15
    }
    this.y = y - GAP
  }

  table(title: string, rows: string[][], widths: number[]) {
    this.title(title)
    for (const row of rows) {
      const size = 8.5
      const wrappedCells = row.map((cell, i) => wrapText(cell, this.font, size, Math.max(24, widths[i] - 8)))
      const rowLines = Math.max(...wrappedCells.map((cell) => cell.length), 1)
      const rowH = Math.max(26, rowLines * 12 + 12)
      this.ensure(rowH + 2)
      const safeY = this.y - rowH
      this.page.drawRectangle({ x: MARGIN, y: safeY, width: PAGE_W - MARGIN * 2, height: rowH, color: COLORS.card2, borderColor: COLORS.border, borderWidth: 0.4 })
      let x = MARGIN + 8
      wrappedCells.forEach((cellLines, i) => {
        let lineY = safeY + rowH - 14
        cellLines.forEach((line) => {
          this.text(line, x, lineY, size, i === 0 ? COLORS.gold : COLORS.text)
          lineY -= 12
        })
        x += widths[i]
      })
      this.y -= rowH + 4
    }
    this.y -= 4
  }

  addPageNumbers() {
    const pages = this.doc.getPages()
    pages.forEach((page, index) => {
      page.drawText(`${index + 1} / ${pages.length}`, {
        x: PAGE_W - MARGIN - 34,
        y: 22,
        size: 8,
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
  layout.text(`日主：${result.chart.dayMaster}（身${result.strengthLabel}）`, 200, 440, 13, COLORS.muted)
  layout.text(`喜用：${result.favorableElements.join('、')}｜主題：${input.topic || '整體運勢'}`, 145, 410, 13, COLORS.muted)
  layout.text(`產生日期：${new Date().toLocaleDateString('zh-TW')}`, 222, 135, 10, COLORS.muted)
}

function sectionText(result: AnalysisResult, key: keyof NonNullable<AnalysisResult['aiSections']>, fallback: string) {
  return result.aiSections?.[key] || fallback
}

export async function exportPdf(_element: HTMLElement, input: BirthInput, result: AnalysisResult): Promise<void> {
  const pdfDoc = await PDFDocument.create()
  const font = await loadChineseFont(pdfDoc)
  const layout = new PdfLayout(pdfDoc, font)

  drawCover(layout, input, result)
  layout.ensure(PAGE_H)

  const pillars = pillarsToArray(result.chart)
  layout.title('命盤總覽')
  layout.card(input.name || '未命名命盤', [
    `四柱：${pillars.map((p) => `${p.label}${p.stem}${p.branch}`).join('　')}`,
    `日主：${result.chart.dayMaster}${result.chart.dayMasterElement}｜身${result.strengthLabel} ${result.strength}%｜喜用：${result.favorableElements.join('、')}`,
    `格局：${result.pattern}｜五行最旺：${result.strongestElement}｜最弱：${result.weakestElement}`,
  ], { accent: COLORS.gold })

  layout.title('四柱與十神')
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

  layout.title('五行強弱')
  ;(['木', '火', '土', '金', '水'] as Element[]).forEach((el) => {
    const value = result.elementStats[el]
    layout.ensure(26)
    layout.text(el, MARGIN, layout.y - 10, 11, ELEMENT_COLOR[el])
    layout.page.drawRectangle({ x: MARGIN + 28, y: layout.y - 14, width: 330, height: 10, color: COLORS.card2 })
    layout.page.drawRectangle({ x: MARGIN + 28, y: layout.y - 14, width: Math.max(8, value * 34), height: 10, color: ELEMENT_COLOR[el] })
    layout.text(value.toFixed(1), MARGIN + 372, layout.y - 13, 9, COLORS.muted)
    layout.y -= 24
  })
  layout.card('喜用神補強', result.elementAdvice.map((a) => `${a.element}：顏色 ${a.colors.join('、')}；方位 ${a.directions.join('、')}；職業 ${a.careers.join('、')}；習慣 ${a.habits.join('、')}`))

  layout.title('命盤總結')
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

  layout.table('大運詳細分析', result.dayunDetails.map((d) => [d.age, d.pillar, d.tenGod, `${d.score}`, d.focus]), [60, 55, 55, 35, 300])
  layout.table('十年趨勢', result.tenYearTrend.map((t) => [`${t.year}`, t.pillar, t.label, `${t.score}`, t.summary]), [55, 55, 40, 40, 315])
  layout.table('流年', result.liunian.map((l) => [`${l.year}`, l.pillar, l.tenGod, l.nayin, l.summary]), [55, 55, 60, 75, 260])
  layout.table('流月', result.liuyueDetails.map((m) => [m.label, m.pillar, m.tenGod, `${m.score}`, m.advice]), [50, 55, 60, 40, 300])

  if (result.relations.length) {
    layout.table('刑沖合害', result.relations.map((r) => [r.type, r.label, r.desc]), [45, 120, 360])
  }

  if (result.wuge && result.wuge.總格 > 0) {
    const w = result.wuge
    layout.title('姓名五格')
    layout.table('五格數理', [
      ['天格', `${w.天格}`, w.luck.天格, w.details.天格?.meaning || ''],
      ['人格', `${w.人格}`, w.luck.人格, w.details.人格?.meaning || ''],
      ['地格', `${w.地格}`, w.luck.地格, w.details.地格?.meaning || ''],
      ['外格', `${w.外格}`, w.luck.外格, w.details.外格?.meaning || ''],
      ['總格', `${w.總格}`, w.luck.總格, w.details.總格?.meaning || ''],
    ], [55, 45, 55, 380])
    if (w.charAnalysis.length) {
      layout.table('姓名字義與五行', w.charAnalysis.map((c) => [c.char, `${c.strokes}劃`, c.wuxing, c.meaning]), [45, 55, 45, 390])
    }
  }

  if (result.shensha.length) {
    layout.table('神煞', result.shensha.map((s) => [s.name, s.type, s.desc]), [75, 55, 390])
  }

  if (result.aiQuestions?.length) {
    layout.title('AI 追問紀錄')
    result.aiQuestions.forEach((q) => layout.card(`問：${q.question}`, [q.answer], { accent: COLORS.gold }))
  }

  layout.removeTrailingBlankPage()
  layout.addPageNumbers()
  const bytes = await pdfDoc.save()
  saveBytes(bytes, `${sanitizeFilename(input.name || '命盤')}_八字分析.pdf`)
}
