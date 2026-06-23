import { PDFDocument, type PDFFont, type PDFPage, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { AnalysisResult, BirthInput, Element } from '../types'
import { pillarsToArray } from './bazi'
import { getTengodGods } from './dataStore'
import { safeRelationDesc } from './relationDisplay'
import {
  formatShenshaLookupKey,
  formatShenshaMatchedBranches,
  formatShenshaMatchedPillars,
  formatShenshaTargetBranches,
} from './shensha/shenshaDisplay'
import { formatRuleVersionsForReport } from './report/ruleVersions'
import { buildFortuneV2YearlySection, formatMonthImpactSummary } from './fortune/monthImpactDisplay'
import { buildUsefulGodsAdvice } from './narrative/usefulGodsAdvice'
import { buildHealthAdvice } from './narrative/healthAdvice'
import { buildPersonalizedReportExplanation } from './report/personalizedExplanation'

const FONT_URL = '/fonts/NotoSansTC-VF.ttf'
const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 42
const GAP = 10
const FOOTER_RESERVE = 88
const CONTENT_WIDTH = PAGE_W - MARGIN * 2
export const PDF_ARTICLE_KEEP_WITH_NEXT_LINES = 3

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

  articleSection(heading: string, body: string) {
    const bodySize = 10.2
    const bodyLineH = bodySize * 1.55
    const bodyLines = wrapText(body, this.font, bodySize, CONTENT_WIDTH)
    const keepLines = Math.min(Math.max(bodyLines.length, 1), PDF_ARTICLE_KEEP_WITH_NEXT_LINES)
    this.ensure(44 + keepLines * bodyLineH + 8)
    this.title(heading)
    this.paragraph(body, { size: bodySize })
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
  const strengthLabel = result.strengthV2?.label || result.strengthLabel
  const strengthSource = result.strengthV2 ? '旺衰 v2 系統初判' : '系統初判'
  layout.page.drawRectangle({ x: 55, y: 75, width: PAGE_W - 110, height: PAGE_H - 150, color: COLORS.card, borderColor: COLORS.gold, borderWidth: 0.8 })
  layout.text('BAZI & NAME REPORT', 183, 680, 15, COLORS.gold)
  layout.text('八字 × 姓名合參報告', 139, 630, 27, COLORS.gold2)
  layout.text(input.name || '未命名命盤', 230, 565, 21, COLORS.text)
  layout.page.drawLine({ start: { x: 215, y: 520 }, end: { x: 380, y: 520 }, thickness: 1, color: COLORS.gold })
  layout.text(`四柱：${pillars}`, 150, 470, 13, COLORS.muted)
  layout.text(`日主：${result.chart.dayMaster}（身強弱：${strengthLabel}（${strengthSource}））`, 155, 440, 13, COLORS.muted)
  layout.text(`喜用初判：${result.favorableElements.join('、')}｜主題：${input.topic || '整體運勢'}`, 145, 410, 13, COLORS.muted)
  layout.text(`四柱排盤來源：${result.chart.source === 'lunar-javascript' ? 'lunar-javascript' : '使用者輸入'}`, 180, 388, 10, COLORS.muted)
  layout.text('本報告為命理模型分析，提供結構化參考，不作絕對定論。', 130, 365, 10, COLORS.muted)
  layout.text(`產生日期：${new Date().toLocaleDateString('zh-TW')}`, 222, 135, 10, COLORS.muted)
}

function sectionText(result: AnalysisResult, key: keyof NonNullable<AnalysisResult['aiSections']>, fallback: string) {
  if (key === 'yearly' && result.fortuneV2?.monthImpacts?.length) {
    return buildFortuneV2YearlySection(result.fortuneV2.monthImpacts) || fallback
  }
  if (key === 'remedies') {
    return result.aiSections?.remedies?.trim() || buildUsefulGodsAdvice(result)
  }
  if (key === 'health') {
    return result.aiSections?.health?.trim() || buildHealthAdvice(result)
  }
  return result.aiSections?.[key] || fallback
}

// 每頁固定顯示的說明行（底部）
const PDF_SOURCE_NOTES = [
  '四柱排盤來源：lunar-javascript',
  '十神、藏干、刑沖合害、五行強弱與文案由本系統規則引擎計算',
  '八字流年以立春為界，非國曆 1 月 1 日',
  '流月以節氣切換，不等於農曆初一或國曆每月 1 日',
  '五行分數為系統自訂權重模型，僅供相對比較',
  '身強弱採旺衰 v2 系統模型初判，需搭配大運流年與實際情境參考',
  `規則版本：${formatRuleVersionsForReport()}`,
]

export interface PdfExportOptions {
  includePersonalizedExplanation?: boolean
}

function renderPersonalizedExplanation(layout: PdfLayout, result: AnalysisResult) {
  const article = buildPersonalizedReportExplanation(result)
  layout.ensure(PAGE_H)
  layout.title(article.title)
  layout.paragraph(article.subtitle, { color: COLORS.muted })
  article.sections.forEach((section) => {
    layout.articleSection(section.heading, section.body)
  })
}

export async function exportPdf(_element: HTMLElement, input: BirthInput, result: AnalysisResult, options: PdfExportOptions = {}): Promise<void> {
  const pdfDoc = await PDFDocument.create()
  const font = await loadChineseFont(pdfDoc)
  const layout = new PdfLayout(pdfDoc, font)

  // ── 第 1 頁：封面 ────────────────────────────────────────────────
  drawCover(layout, input, result)

  const pillars = pillarsToArray(result.chart)
  const formalStrengthLabel = result.strengthV2?.label || result.strengthLabel
  const formalStrengthSource = result.strengthV2 ? '旺衰 v2 系統初判' : '系統初判'

  // ── 第 2 頁：命盤總覽與十神 ──────────────────────────────────────
  layout.ensure(PAGE_H)
  layout.title('命盤總覽與十神')
  layout.card(input.name || '未命名命盤', [
    `四柱排盤來源：${result.chart.source === 'lunar-javascript' ? 'lunar-javascript' : '使用者輸入'}`,
    '十神、藏干、刑沖合害、五行強弱與文案由本系統規則引擎計算',
    `四柱：${pillars.map((p) => `${p.label}${p.stem}${p.branch}`).join('　')}`,
    `日主：${result.chart.dayMaster}${result.chart.dayMasterElement}｜身強弱：${formalStrengthLabel}（${formalStrengthSource}）`,
    `喜用初判：${result.favorableElements.join('、')}${result.unfavorableElements?.length ? `｜需留意：${result.unfavorableElements.join('、')}` : ''}`,
  ], { accent: COLORS.gold })

  const stc = result.solarTimeCorrection
  if (stc) {
    const modeLabel = stc.mode === 'trueSolarTime' ? '真太陽時' : stc.mode === 'meanSolarTime' ? '地方平太陽時' : '標準時間'
    const fmt = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)} 分鐘`
    const lines = [
      `模式：${modeLabel}`,
      `出生地經度：${stc.birthLongitude}°E｜標準經線：${stc.standardMeridian}°E`,
      `原始出生時間：${stc.originalDateTime}`,
      `修正後時間：${stc.correctedDateTime}`,
    ]
    if (stc.enabled) {
      lines.push(`經度修正：${fmt(stc.longitudeCorrectionMinutes)}`)
      if (stc.mode === 'trueSolarTime') lines.push(`均時差：${fmt(stc.equationOfTimeMinutes)}`)
      lines.push(`總修正：${fmt(stc.totalCorrectionMinutes)}`)
    }
    if (stc.pillarChange?.messages?.length) lines.push(...stc.pillarChange.messages)
    lines.push(stc.enabled
      ? (stc.mode === 'trueSolarTime'
          ? '本報告使用真太陽時排盤。均時差為近似公式估算，結果僅供參考。'
          : '本報告使用地方平太陽時排盤。')
      : '本報告使用標準時間排盤，未啟用真太陽時修正。')
    layout.card('時間校正', lines, { accent: COLORS.gold })
  }

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
  layout.title('五行簡化模型參考')
  layout.paragraph('五行分數為系統自訂權重模型，僅供相對比較，不代表傳統命理唯一標準。正式身強弱以第 5 頁旺衰 v2 結果為準。', { color: COLORS.muted })
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
  layout.card('五行簡化模型參考', [
    `簡化模型參考：${result.strengthLabel}`,
    `簡化模型分數：${result.strength}%`,
    '正式身強弱以第 5 頁旺衰 v2 結果為準。',
    result.strengthScoreNote || '此分數為系統模型估算，不是命理絕對值',
    `可信度：${result.strengthConfidence || '中'}`,
    ...(result.strengthBasis ?? []),
    `喜用初判：${result.favorableElements.join('、')}${result.unfavorableElements?.length ? `；需留意：${result.unfavorableElements.join('、')}` : ''}`,
    result.favorableNote || '',
  ], { accent: COLORS.gold })
  if (result.strengthV2) {
    const v2 = result.strengthV2
    const f = v2.forces.summary
    layout.card('日主旺衰 v2（系統模型）', [
      `身強弱：${v2.label}｜可信度：${v2.confidence}｜系統分數：${v2.score}`,
      v2.scoreNote,
      `得令：${v2.deLing.status}　${v2.deLing.reason}`,
      `得地：${v2.deDi.status}　${v2.deDi.reason}`,
      `得勢：${v2.deShi.status}　${v2.deShi.reason}`,
    ], { accent: COLORS.gold })
    layout.card('通根與生扶剋洩耗', [
      ...v2.roots.roots.map((r) => `${r.strength}：${r.reason}`),
      v2.stemSupport.summary || '天干幫扶與洩耗不明顯',
      `力量分數 → 幫身 ${f.supportScore}｜生身 ${f.resourceScore}｜剋身 ${f.controlScore}｜洩身 ${f.outputScore}｜耗身 ${f.wealthScore}`,
      v2.forces.weightNote,
    ])
    layout.card('喜用神初判 v2', [
      `喜用：${v2.usefulGods.useful.join('、')}`,
      ...v2.usefulGods.priority.map((p) => `用神 ${p.element}：${p.reason}`),
      `忌神：${v2.usefulGods.avoid.map((a) => a.element).join('、')}`,
      ...v2.usefulGods.avoid.map((a) => `忌 ${a.element}：${a.reason}`),
      v2.usefulGods.note,
    ])
    layout.card('格局傾向（v2）', [
      `${v2.pattern.patternLabel}（可信度 ${v2.pattern.confidence}）`,
      ...v2.pattern.reasons,
      v2.pattern.warning,
    ], { accent: COLORS.gold })
    layout.card('旺衰判斷依據', v2.reasons)
    layout.paragraph(v2.note, { color: COLORS.muted })
  }
  layout.card('喜用神補強', result.elementAdvice.map((a) => `${a.element}：顏色 ${a.colors.join('、')}；方位 ${a.directions.join('、')}；職業 ${a.careers.join('、')}；習慣 ${a.habits.join('、')}`))

  // ── 第 4 頁：格局與刑沖合害 ──────────────────────────────────────
  layout.ensure(PAGE_H)
  layout.title('格局與刑沖合害')
  layout.card('格局傾向', [`格局傾向：${result.pattern}`, result.patternNote || ''], { accent: COLORS.gold })
  if (result.relations.length) {
    layout.table('刑沖合害成立項（規則引擎結果）', result.relations.map((r) => [r.type, r.label, r.branches?.join('、') || '', safeRelationDesc(r.desc)]), [45, 120, 80, 280])
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
  const luck = result.luckStart
  if (luck) {
    const luckLines = [
      `大運順逆：${luck.directionLabel}`,
      `判斷依據：${luck.directionReason}`,
    ]
    if (luck.verified) {
      luckLines.push(`起運歲數：${luck.startAge}（系統精算）`)
      luckLines.push(`使用節氣：${luck.usedTermName}（${luck.usedTermDateText}）`)
      luckLines.push(`出生與節氣相差約 ${luck.totalDiffDays} 天`)
      luckLines.push(`起運算法：${luck.method}，不同流派可能略有差異`)
    } else {
      luckLines.push(luck.note || '起運歲數尚未驗證')
    }
    layout.card('大運起運', luckLines, { accent: COLORS.gold })
  }
  const dayunRows = result.dayunDetails.map((d) => [
    d.startAge && d.endAge ? `${d.startAge}~${d.endAge}` : d.age,
    d.pillar,
    d.tenGod,
    `參考 ${d.score}`,
    d.focus,
  ])
  layout.table('大運詳細分析', dayunRows, [110, 50, 50, 50, 240])

  // ── 第 6 頁：流年與流月 ───────────────────────────────────────────
  layout.ensure(PAGE_H)
  layout.title('流年與流月')
  layout.paragraph('八字流年以立春為界，非國曆 1 月 1 日。', { color: COLORS.muted })

  if (result.fortuneV2) {
    const fv = result.fortuneV2
    const y = fv.yearImpact
    const lc = fv.luckCycleImpact
    const hasLuckTransition = fv.luckTransition?.hasTransition && fv.luckTransition.segments.length >= 2
    layout.card('歲運聯動分析 v2（系統模型）', [
      hasLuckTransition
        ? `大運背景：${fv.luckTransition!.segments[0].luckCycle} → ${fv.luckTransition!.segments[1].luckCycle}（${y.year} 年跨大運切換）`
        : lc
        ? `大運背景：${lc.pillar}${lc.ageRange ? `（${lc.ageRange}）` : ''}　${lc.overall}`
        : '大運背景：起運歲數尚未驗證，僅以流年流月作系統初判',
      ...(hasLuckTransition ? [] : lc ? lc.helpfulFactors.map((f) => `　＋ ${f}`) : []),
      ...(hasLuckTransition ? [] : lc ? lc.pressureFactors.map((f) => `　－ ${f}`) : []),
      `年度主題：${y.year} ${y.pillar}（${y.stemTenGod}）　${y.theme}`,
      `系統等級：${y.score.level}（分數 ${y.score.score}）　${y.score.scoreNote}`,
    ], { accent: COLORS.gold })
    if (fv.luckTransition?.hasTransition) {
      layout.card('大運切換分段', [
        `${y.year} 年跨越大運切換：切換前以${fv.luckTransition.segments[0]?.luckCycle}大運為背景，切換後以${fv.luckTransition.segments[1]?.luckCycle}大運為背景。年度解讀需分段看待。`,
        ...fv.luckTransition.segments.map((segment) => `${segment.label}：${segment.from} 至 ${segment.to}，${segment.luckCycle}大運`),
        fv.luckTransition.note,
      ], { accent: COLORS.gold })
    } else if (fv.luckTransition && fv.luckTransition.verified === false) {
      layout.card('大運切換分段', [fv.luckTransition.note])
    }
    layout.card('流年正面因素', y.positiveFactors.length ? y.positiveFactors : ['—'])
    layout.card('流年壓力因素', y.riskFactors.length ? y.riskFactors : ['—'])
    if (y.luckCycleModifier.length) layout.card('大運調節', y.luckCycleModifier)
    layout.card('流年結論', [y.conclusion])
    const km = fv.yearSummary.keyMonths
    layout.card('重要月份', [
      `較有支持：${km.supportive.join('、') || '無'}`,
      `壓力較高：${km.pressure.join('、') || '暫無明顯月份'}`,
      `機會與壓力並存：${km.neutral.join('、') || '無'}`,
    ])
    layout.table('每月摘要', fv.monthImpacts.map((m) => [
      m.monthLabel,
      m.pillar,
      m.theme,
      m.riskFactors.join('；') || '—',
      m.suggestion,
    ]), [45, 50, 110, 180, 120])
    layout.card('年度總結與保守建議', [
      fv.yearSummary.summary,
      ...fv.yearSummary.advice.map((a) => `建議：${a}`),
      ...fv.yearSummary.warnings.map((w) => `注意：${w}`),
    ])
    layout.paragraph(fv.note, { color: COLORS.muted })
  }

  if (result.liunianNote) layout.paragraph(result.liunianNote, { color: COLORS.muted })
  layout.table('流年干支參考', result.liunian.map((l) => [`${l.year}`, l.pillar, l.tenGod, l.nayin, l.summary]), [55, 55, 60, 75, 260])
  layout.paragraph('流月以節氣切換，不等於農曆初一或國曆每月 1 日。', { color: COLORS.muted })
  if (result.liuyueNote) layout.paragraph(result.liuyueNote, { color: COLORS.muted })
  const monthImpactByPillar = Object.fromEntries((result.fortuneV2?.monthImpacts ?? []).map((m) => [m.pillar, m]))
  layout.table('節氣流月干支參考', result.liuyueDetails.map((m) => {
    const impact = monthImpactByPillar[m.pillar]
    return [m.label, m.range || '', m.pillar, m.tenGod, impact ? formatMonthImpactSummary(impact) : m.advice]
  }), [45, 90, 55, 60, 275])

  // ── 第 7 頁：薪資主題分析 ─────────────────────────────────────────
  layout.ensure(PAGE_H)
  layout.title('主題分析')
  layout.paragraph(result.summary)
  layout.paragraph(result.detailText)
  layout.card(`主題分析：${input.topic || '整體運勢'}`, [result.topicAnalysis], { accent: COLORS.gold })
  layout.title('分段解讀')
  layout.card('事業', [sectionText(result, 'career', '尚未產生進階事業解讀')])
  layout.card('財運', [sectionText(result, 'wealth', '尚未產生進階財運解讀')])
  layout.card('感情人際', [sectionText(result, 'relationship', '尚未產生進階感情人際解讀')])
  layout.card('健康', [sectionText(result, 'health', '尚未產生進階健康解讀')])
  layout.card('流年', [sectionText(result, 'yearly', '尚未產生進階流年解讀')])
  layout.card('姓名建議', [sectionText(result, 'nameAdvice', '尚未產生進階姓名建議')])
  layout.card('喜用補強', [sectionText(result, 'remedies', '尚未產生進階喜用補強建議')])

  // ── 第 8 頁：姓名與神煞驗證狀態 ──────────────────────────────────
  layout.ensure(PAGE_H)
  layout.title('姓名與神煞驗證狀態')

  if (result.wuge) {
    const w = result.wuge
    layout.paragraph('姓名學資料依本系統內建 81 數理與三才配置表判讀，不同流派可能有差異。', { color: COLORS.muted })
    if (result.nameValidationNote) layout.paragraph(result.nameValidationNote, { color: COLORS.muted })
    if (result.nameSummary) layout.paragraph(result.nameSummary, { color: COLORS.muted })
    layout.card('姓名校驗狀態', [
      `姓名：${input.name || w.chars?.map((c) => c.char).join('') || '未命名'}`,
      `資料來源：${w.source || '康熙筆畫資料庫尚未完整收錄'}`,
      `校驗狀態：${w.verified ? '筆畫已校驗；81 數理已啟用；三才依資料表判讀' : '待校驗'}`,
      result.nameSummary || '',
      w.unknownChars.length ? `缺少字：${w.unknownChars.join('、')}` : '',
      '不同流派數理名稱與吉凶可能略有差異；本頁不輸出保證性結論。',
    ].filter(Boolean), { accent: COLORS.gold })
    if (w.chars?.length) {
      layout.table('康熙筆畫', w.chars.map((c) => [
        c.char,
        c.verified ? `${c.strokes} 畫` : '待校驗',
        c.source || '待校驗',
      ]), [55, 80, 390])
    }
    if (w.verified && w.wugeFortune?.verified) {
      layout.table('五格 81 數理', [
        ['天格', `${w.天格}`, w.wugeFortune.items.heaven.level || '', w.wugeFortune.items.heaven.title || '', w.wugeFortune.items.heaven.summary || ''],
        ['人格', `${w.人格}`, w.wugeFortune.items.personality.level || '', w.wugeFortune.items.personality.title || '', w.wugeFortune.items.personality.summary || ''],
        ['地格', `${w.地格}`, w.wugeFortune.items.earth.level || '', w.wugeFortune.items.earth.title || '', w.wugeFortune.items.earth.summary || ''],
        ['外格', `${w.外格}`, w.wugeFortune.items.outer.level || '', w.wugeFortune.items.outer.title || '', w.wugeFortune.items.outer.summary || ''],
        ['總格', `${w.總格}`, w.wugeFortune.items.total.level || '', w.wugeFortune.items.total.title || '', w.wugeFortune.items.total.summary || ''],
      ], [45, 35, 45, 75, 325])
    }
    if (w.sancai && 'combination' in w.sancai) {
      layout.card('三才配置', [
        `三才：${w.sancai.combination}`,
        `天格：${w.sancai.heaven?.element || ''}｜人格：${w.sancai.personality?.element || ''}｜地格：${w.sancai.earth?.element || ''}`,
        `判斷：${w.sancai.level}。${w.sancai.summary}`,
        `資料來源：${w.sancai.source}`,
        `資料表完整性：${w.sancai.tableCoverage === 'full' ? '完整 125 種' : '部分收錄；未收錄組合不輸出保證性吉凶定論'}`,
      ], { accent: COLORS.gold })
    }
  } else {
    layout.paragraph('未輸入姓名，略過五格分析。', { color: COLORS.muted })
  }

  // 神煞：只列公式化項目；未建立查法者標示尚未驗證
  if (result.shensha && result.shensha.length > 0) {
    const verifiedShensha = result.shensha.filter((s) => s.verified === true)
    const unverifiedShensha = result.shensha.filter((s) => s.status === '尚未驗證' || s.verified === false)
    const formatTargets = (stems?: string[], branches?: string[] | Record<string, string[]>, pillars?: string[]) => {
      const stemText = stems?.length ? stems.join('、') : ''
      const branchText = branches ? formatShenshaTargetBranches(branches) : ''
      const pillarText = pillars?.length ? pillars.join('、') : ''
      return [stemText, branchText, pillarText].filter(Boolean).join(' / ')
    }
    layout.paragraph('本頁僅顯示已建立公式與測試的神煞。神煞結果應搭配原局、十神、格局與歲運判斷，不作單項絕對定論；未建立查法表者標示為尚未驗證。', { color: COLORS.muted })
    if (result.shenshaNote) layout.paragraph(result.shenshaNote, { color: COLORS.muted })
    if (verifiedShensha.length) {
      layout.table('已公式化神煞', verifiedShensha.map((s) => [
        s.name,
        s.status || '',
        s.basis || '',
        formatShenshaLookupKey(s.lookupKey),
        formatTargets(s.targetStems, s.targetBranches, s.targetPillars),
        s.matchedPillars?.length
          ? formatShenshaMatchedPillars(s.matchedPillars)
          : formatShenshaMatchedBranches(s.matchedBranches),
      ]), [65, 45, 105, 80, 80, 150])
    }
    if (unverifiedShensha.length) {
      layout.table('尚未驗證神煞', unverifiedShensha.map((s) => [
        s.name,
        '尚未驗證',
        s.reason || '尚未建立查法表與測試',
      ]), [75, 80, 370])
    }
    layout.card('版本與未開放說明', [
      '咸池：已由桃花模組覆蓋，本階段以桃花公式呈現。',
      '孤辰寡宿：本系統採已測試版本，其他流派不另列卡，避免混淆。',
      '其他擇日神煞：尚未開放；未建立公式、資料表與測試前，不列入正式結論。',
    ], { accent: COLORS.gold })
  } else {
    layout.card('神煞：尚未驗證', [
      '神煞需依日干、年干、地支或月令查法判定，目前公式未完成驗證，不列入正式結論。',
    ], { accent: COLORS.gold })
  }

  if (result.aiQuestions?.length) {
    layout.title('命盤追問紀錄')
    result.aiQuestions.forEach((q) => layout.card(`問：${q.question}`, [q.answer], { accent: COLORS.gold }))
  }

  if (options.includePersonalizedExplanation !== false) {
    renderPersonalizedExplanation(layout, result)
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
