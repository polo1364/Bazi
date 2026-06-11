import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import type { AnalysisResult, BirthInput } from '../types'
import { pillarsToArray } from './bazi'

const DESKTOP_SCALE = 1.5
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

function createPrintClone(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement
  clone.classList.add('pdf-export-mode', 'pdf-print-root')
  clone.style.position = 'fixed'
  clone.style.left = '-99999px'
  clone.style.top = '0'
  clone.style.width = `${PDF_LAYOUT_WIDTH}px`
  clone.style.maxWidth = 'none'
  clone.style.margin = '0'
  clone.style.background = PAGE_BG
  clone.style.padding = '0'
  document.body.appendChild(clone)
  return clone
}

function addCanvasPage(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  margin: number,
  contentW: number,
  srcY: number,
  sliceHeight: number,
  addNewPage: boolean,
) {
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const slice = document.createElement('canvas')
  slice.width = canvas.width
  slice.height = sliceHeight
  const ctx = slice.getContext('2d')
  if (!ctx) throw new Error('無法建立畫布')
  ctx.fillStyle = PAGE_BG
  ctx.fillRect(0, 0, slice.width, slice.height)
  ctx.drawImage(canvas, 0, srcY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)

  if (addNewPage) pdf.addPage()
  pdf.setFillColor(7, 13, 26)
  pdf.rect(0, 0, pageW, pageH, 'F')
  pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, contentW, (sliceHeight * contentW) / canvas.width)
}

async function exportPdfInner(element: HTMLElement, input: BirthInput, result: AnalysisResult): Promise<void> {
  if (!element.offsetWidth || !element.offsetHeight) {
    throw new Error('報告內容尚未渲染完成')
  }

  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 10
  const contentW = pageW - margin * 2
  const contentH = pageH - margin * 2

  await drawCover(pdf, input, result)

  const clone = createPrintClone(element)
  try {
    await waitForLayout()
    const canvas = await snapshot(clone)
    if (!canvas.width || !canvas.height) throw new Error('報告截圖失敗')
    const pageCanvasHeight = Math.max(1, Math.floor((contentH * canvas.width) / contentW))
    let srcY = 0
    let pageIndex = 0
    while (srcY < canvas.height) {
      const sliceHeight = Math.min(pageCanvasHeight, canvas.height - srcY)
      addCanvasPage(pdf, canvas, margin, contentW, srcY, sliceHeight, true)
      srcY += sliceHeight
      pageIndex += 1
      await waitForLayout()
    }
    if (pageIndex === 0) throw new Error('找不到可匯出的報告內容')
  } finally {
    clone.remove()
  }

  pdf.save(`${sanitizeFilename(input.name || '命盤')}_八字分析.pdf`)
}

export async function exportPdf(element: HTMLElement, input: BirthInput, result: AnalysisResult): Promise<void> {
  await exportPdfInner(element, input, result)
}
