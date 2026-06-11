import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import type { BirthInput } from '../types'

const PDF_SCALE = 2
const PAGE_BG = '#070d1a'

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || '命盤'
}

export function waitForLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

async function snapshot(node: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(node, {
    backgroundColor: PAGE_BG,
    scale: PDF_SCALE,
    useCORS: true,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
  })
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

export async function exportPdf(element: HTMLElement, input: BirthInput): Promise<void> {
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

  const blocks = Array.from(element.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement && c.offsetHeight > 0,
  )
  if (blocks.length === 0) {
    throw new Error('找不到可匯出的報告內容')
  }

  // 填滿背景
  pdf.setFillColor(7, 13, 26)
  pdf.rect(0, 0, pageW, pageH, 'F')

  let cursorY = margin
  let isFirst = true

  for (const block of blocks) {
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
      // placeTall 後游標已不可靠，直接換頁
      pdf.addPage()
      pdf.setFillColor(7, 13, 26)
      pdf.rect(0, 0, pageW, pageH, 'F')
      cursorY = margin
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
