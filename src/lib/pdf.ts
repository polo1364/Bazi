import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import type { AnalysisResult, BirthInput } from '../types'
import { pillarsToArray } from './bazi'

const DESKTOP_SCALE = 2
const MOBILE_SCALE = 1.25
const PDF_LAYOUT_WIDTH = 794
const PAGE_BG = '#070d1a'

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || '命盤'
}

function createCoverElement(input: BirthInput, result: AnalysisResult): HTMLElement {
  const pillars = pillarsToArray(result.chart).map((p) => `${p.stem}${p.branch}`).join('  ')
  const cover = document.createElement('section')
  cover.className = 'pdf-cover'
  cover.innerHTML = `
    <div class="pdf-cover-card">
      <div class="pdf-cover-kicker">BAZI & NAME REPORT</div>
      <h1>八字 × 姓名合參報告</h1>
      <h2>${input.name || '未命名命盤'}</h2>
      <div class="pdf-cover-line"></div>
      <p>四柱：${pillars}</p>
      <p>日主：${result.chart.dayMaster}（身${result.strengthLabel}）</p>
      <p>喜用：${result.favorableElements.join('、')}｜主題：${input.topic || '整體運勢'}</p>
      <div class="pdf-cover-date">產生日期：${new Date().toLocaleDateString('zh-TW')}</div>
    </div>
  `
  return cover
}

async function drawCover(pdf: jsPDF, input: BirthInput, result: AnalysisResult) {
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const cover = createCoverElement(input, result)
  document.body.appendChild(cover)
  try {
    await waitForLayout()
    const canvas = await snapshot(cover)
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pageW, pageH)
  } finally {
    cover.remove()
  }
}

export function waitForLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

function isMobileViewport(): boolean {
  return window.matchMedia?.('(max-width: 767px)').matches ?? window.innerWidth < 768
}

async function withPdfWidth<T>(element: HTMLElement, run: () => Promise<T>): Promise<T> {
  const previousWidth = element.style.width
  const previousMaxWidth = element.style.maxWidth
  const previousMargin = element.style.margin
  const previousAlignSelf = element.style.alignSelf

  element.style.width = `${PDF_LAYOUT_WIDTH}px`
  element.style.maxWidth = 'none'
  element.style.margin = '0 auto'
  element.style.alignSelf = 'center'

  await waitForLayout()

  return run().finally(() => {
    element.style.width = previousWidth
    element.style.maxWidth = previousMaxWidth
    element.style.margin = previousMargin
    element.style.alignSelf = previousAlignSelf
  })
}

async function snapshot(node: HTMLElement): Promise<HTMLCanvasElement> {
  const width = Math.max(node.scrollWidth, node.offsetWidth, PDF_LAYOUT_WIDTH)
  const height = Math.max(node.scrollHeight, node.offsetHeight)

  return html2canvas(node, {
    backgroundColor: PAGE_BG,
    scale: isMobileViewport() ? MOBILE_SCALE : DESKTOP_SCALE,
    useCORS: true,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
  })
}

function maxBlockHeightPx(contentW: number, contentH: number): number {
  return Math.floor((contentH * PDF_LAYOUT_WIDTH) / contentW)
}

function collectPrintableBlocks(root: HTMLElement, maxHeightPx: number): HTMLElement[] {
  const result: HTMLElement[] = []

  const visit = (node: HTMLElement, depth = 0) => {
    const children = Array.from(node.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && child.offsetHeight > 0,
    )
    const height = Math.max(node.scrollHeight, node.offsetHeight)
    const canSplit = children.length > 1 && depth < 3
    const shouldSplit = height > maxHeightPx * 0.92 && canSplit

    if (!shouldSplit) {
      result.push(node)
      return
    }

    for (const child of children) {
      visit(child, depth + 1)
    }
  }

  Array.from(root.children)
    .filter((child): child is HTMLElement => child instanceof HTMLElement && child.offsetHeight > 0)
    .forEach((child) => visit(child))

  return result
}

/** 將單一過高的截圖切成多頁（僅在區塊本身高於一頁時才使用） */
function placeTall(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  margin: number,
  contentW: number,
  contentH: number,
) {
  const pageCanvasHeight = Math.floor((contentH * canvas.width) / contentW)
  let srcY = 0
  let first = true

  while (srcY < canvas.height) {
    const sliceHeight = Math.min(pageCanvasHeight, canvas.height - srcY)
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = sliceHeight
    const ctx = slice.getContext('2d')
    if (!ctx) throw new Error('無法建立畫布')
    ctx.fillStyle = PAGE_BG
    ctx.fillRect(0, 0, slice.width, slice.height)
    ctx.drawImage(canvas, 0, srcY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)

    if (!first) pdf.addPage()
    pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, contentW, (sliceHeight * contentW) / canvas.width)
    srcY += sliceHeight
    first = false
  }
}

async function exportPdfInner(element: HTMLElement, input: BirthInput, result: AnalysisResult): Promise<void> {
  if (!element.offsetWidth || !element.offsetHeight) {
    throw new Error('報告內容尚未渲染完成')
  }

  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 10
  const gap = 4
  const contentW = pageW - margin * 2
  const contentH = pageH - margin * 2

  const blocks = collectPrintableBlocks(element, maxBlockHeightPx(contentW, contentH))
  if (blocks.length === 0) {
    throw new Error('找不到可匯出的報告內容')
  }

  await drawCover(pdf, input, result)
  pdf.addPage()
  pdf.setFillColor(7, 13, 26)
  pdf.rect(0, 0, pageW, pageH, 'F')

  let cursorY = margin
  let isFirst = true

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const canvas = await snapshot(block)
    if (!canvas.width || !canvas.height) continue

    const imgW = contentW
    const imgH = (canvas.height * contentW) / canvas.width

    if (imgH > contentH) {
      // 區塊比一頁還高：另起一頁並逐頁切割
      if (!isFirst) {
        pdf.addPage()
        pdf.setFillColor(7, 13, 26)
        pdf.rect(0, 0, pageW, pageH, 'F')
      }
      placeTall(pdf, canvas, margin, contentW, contentH)
      // placeTall 後游標已不可靠；只有後面還有區塊才換新頁
      if (i < blocks.length - 1) {
        pdf.addPage()
        pdf.setFillColor(7, 13, 26)
        pdf.rect(0, 0, pageW, pageH, 'F')
        cursorY = margin
      }
      isFirst = false
      continue
    }

    // 此頁放不下 → 換頁（不切斷區塊）
    if (!isFirst && cursorY + imgH > pageH - margin) {
      pdf.addPage()
      pdf.setFillColor(7, 13, 26)
      pdf.rect(0, 0, pageW, pageH, 'F')
      cursorY = margin
    }

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, cursorY, imgW, imgH)
    cursorY += imgH + gap
    isFirst = false
  }

  pdf.save(`${sanitizeFilename(input.name || '命盤')}_八字分析.pdf`)
}

export async function exportPdf(element: HTMLElement, input: BirthInput, result: AnalysisResult): Promise<void> {
  await withPdfWidth(element, () => exportPdfInner(element, input, result))
}
