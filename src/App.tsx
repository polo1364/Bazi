import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { AnalysisResult, BirthInput, ChartTab, Gender, SavedRecord } from './types'
import { CHART_TABS } from './lib/constants'
import { analyzeBirth, validateChartInput, validateInput, getChartFieldErrors, withAnalysisDefaults } from './lib/analysis'
import { generateAiNarrative } from './lib/aiNarrative'
import { isAiConfigured } from './lib/aiSettings'
import { pillarsToArray } from './lib/bazi'
import { exportPdf, waitForLayout } from './lib/pdf'
import { initDataStore } from './lib/dataStore'
import { createEmptyInput } from './lib/defaults'
import { getAllRecords, saveRecord, deleteRecord, saveChartImage, getChartImage } from './db'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import PillarCard from './components/PillarCard'
import TenGodLegend from './components/TenGodLegend'
import TabPanel from './components/TabPanel'
import HistoryPanel from './components/HistoryPanel'
import WugePanel from './components/WugePanel'
import ShenshaPanel from './components/ShenshaPanel'
import NameCharsPanel from './components/NameCharsPanel'
import ResultHero from './components/ResultHero'
import DataManager from './components/DataManager'

export default function App() {
  const [input, setInput] = useState<BirthInput>(createEmptyInput)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState<ChartTab>('命盤')
  const [records, setRecords] = useState<SavedRecord[]>([])
  const [dbReady, setDbReady] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<string[]>([])
  const [showDataManager, setShowDataManager] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chartImageUrl, setChartImageUrl] = useState<string>()
  const [pdfExporting, setPdfExporting] = useState(false)
  const [pdfMode, setPdfMode] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState('')
  const reportRef = useRef<HTMLDivElement>(null)

  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    initDataStore()
      .then(() => {
        setDbReady(true)
        return getAllRecords()
      })
      .then(setRecords)
      .catch((e) => {
        console.error(e)
        setDbReady(true)
        setError('資料庫載入部分失敗，已改用內建資料繼續運作')
      })
  }, [])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  useEffect(() => {
    return () => {
      if (chartImageUrl) URL.revokeObjectURL(chartImageUrl)
    }
  }, [chartImageUrl])

  const scrollToMessage = () => {
    requestAnimationFrame(() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  const enrichWithAi = useCallback(async (r: AnalysisResult, birthInput: BirthInput) => {
    if (!isAiConfigured()) return
    setAiGenerating(true)
    setAiError('')
    try {
      const narrative = await generateAiNarrative(withAnalysisDefaults(birthInput), r)
      setResult((prev) => prev ? {
        ...prev,
        summary: narrative.summary,
        detailText: narrative.detailText,
        topicAnalysis: narrative.topicAnalysis,
      } : prev)
    } catch (e) {
      console.error(e)
      setAiError(e instanceof Error ? e.message : 'AI 解讀失敗，已保留本地模板')
    } finally {
      setAiGenerating(false)
    }
  }, [])

  const executeAnalysis = useCallback((mode: 'chart' | 'full') => {
    setError('')
    setFieldErrors([])
    setAiError('')
    try {
      const chartErrs = getChartFieldErrors(input)
      const err = mode === 'chart' ? validateChartInput(input) : validateInput(input)
      if (err) {
        setFieldErrors(chartErrs.length ? chartErrs : getChartFieldErrors(input))
        setError(err)
        return false
      }
      const r = analyzeBirth(input)
      if (!r) {
        setError('排盤失敗，請檢查輸入的日期或四柱是否正確')
        scrollToMessage()
        return false
      }
      setResult(r)
      setActiveTab('命盤')
      setFieldErrors([])
      scrollToMessage()
      if (mode === 'full') void enrichWithAi(r, input)
      return true
    } catch (e) {
      console.error(e)
      setError(`推演過程發生錯誤：${e instanceof Error ? e.message : '未知錯誤'}`)
      scrollToMessage()
      return false
    }
  }, [input, enrichWithAi])

  const runChart = useCallback(() => executeAnalysis('chart'), [executeAnalysis])
  const runAnalysis = useCallback(() => executeAnalysis('full'), [executeAnalysis])

  const handleImageUpload = async (file: File) => {
    const id = crypto.randomUUID()
    await saveChartImage({ id, blob: file, fileName: file.name, createdAt: Date.now() })
    if (chartImageUrl) URL.revokeObjectURL(chartImageUrl)
    setChartImageUrl(URL.createObjectURL(file))
    setInput((prev) => ({ ...prev, inputMode: 'upload', chartImageId: id }))
  }

  const handleSave = async () => {
    if (!result) return
    const record: SavedRecord = {
      id: crypto.randomUUID(),
      name: input.name || '未命名',
      input,
      result,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await saveRecord(record)
    setRecords(await getAllRecords())
  }

  const handleLoadRecord = async (record: SavedRecord) => {
    setInput(record.input)
    setResult(record.result)
    setError('')
    setSidebarOpen(false)
    if (record.input.chartImageId) {
      const img = await getChartImage(record.input.chartImageId)
      if (img) {
        if (chartImageUrl) URL.revokeObjectURL(chartImageUrl)
        setChartImageUrl(URL.createObjectURL(img.blob))
      }
    }
  }

  const handleDeleteRecord = async (id: string) => {
    await deleteRecord(id)
    setRecords(await getAllRecords())
  }

  const handleExportPdf = async () => {
    if (!reportRef.current || !result) return
    setPdfExporting(true)
    setError('')
    flushSync(() => setPdfMode(true))
    try {
      mainRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      await waitForLayout()
      await new Promise((r) => setTimeout(r, 350))
      await exportPdf(reportRef.current, input)
    } catch (e) {
      console.error(e)
      setError(`PDF 產生失敗：${e instanceof Error ? e.message : '請稍後再試'}`)
      scrollToMessage()
    } finally {
      setPdfMode(false)
      setPdfExporting(false)
    }
  }

  const pillars = result ? pillarsToArray(result.chart) : null
  const displayGender = (input.gender || '男') as Gender
  const displayYear = (input.analysisYear || new Date().getFullYear()) as number

  if (!dbReady) {
    return (
      <div className="app-bg flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="loader-ring" />
        <p className="text-sm text-muted">載入資料庫中...</p>
      </div>
    )
  }

  return (
    <div className="app-shell app-bg flex h-screen flex-col overflow-hidden">
      <Header
        onOpenSettings={() => setShowDataManager(true)}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
      />

      <div className="app-layout relative mx-auto flex w-full max-w-[1600px] flex-1 min-h-0">
        {/* 手機側欄遮罩 */}
        {sidebarOpen && (
          <div className="overlay fixed inset-0 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* 側欄 */}
        <div className={`sidebar-panel ${sidebarOpen ? 'open' : ''}
          fixed bottom-0 left-0 z-30 w-[min(var(--sidebar-w),92vw)] transform overflow-hidden bg-[#070d1a] transition-transform duration-300 ease-out
          lg:static lg:z-auto lg:w-[var(--sidebar-w)] lg:shrink-0 lg:transform-none lg:bg-transparent lg:border-r lg:border-white/5
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
          style={{ top: 'var(--header-h)' }}
        >
          <Sidebar
            input={input}
            onChange={(patch) => setInput((prev) => ({ ...prev, ...patch }))}
            onCalculate={runChart}
            onAnalyze={runAnalysis}
            error={error}
            fieldErrors={fieldErrors}
            onImageUpload={handleImageUpload}
            chartImageUrl={chartImageUrl}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* 主內容 */}
        <main ref={mainRef} className="main-panel flex min-w-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {error && (
            <div className="animate-fade-in mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <HistoryPanel
            records={records}
            onLoad={handleLoadRecord}
            onDelete={handleDeleteRecord}
            onSave={handleSave}
            canSave={!!result}
          />

          {!result ? (
            <div className="welcome-stage animate-fade-in flex flex-1 items-center justify-center py-12 sm:py-16">
              <div className="empty-state">
                <div className="empty-state-icon">命</div>
                <h2 className="empty-state-title">請輸入資料後開始推演</h2>
                <p className="empty-state-desc">
                  排盤與五格在瀏覽器本地完成；若啟用 DeepSeek AI 解讀，命盤摘要會送至 API 生成文字。
                </p>
                <div className="empty-steps">
                  <div className="empty-step">
                    <span className="empty-step-num">1</span>
                    <div>
                      <div className="empty-step-title">填寫出生資料</div>
                      <div className="empty-step-desc">年、月、日、時辰，或勾選不確定時辰</div>
                    </div>
                  </div>
                  <div className="empty-step">
                    <span className="empty-step-num">2</span>
                    <div>
                      <div className="empty-step-title">自動排盤</div>
                      <div className="empty-step-desc">確認四柱干支是否正確</div>
                    </div>
                  </div>
                  <div className="empty-step">
                    <span className="empty-step-num">3</span>
                    <div>
                      <div className="empty-step-title">開始推演</div>
                      <div className="empty-step-desc">填寫性別、分析年份，取得完整合參報告</div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="btn-gold mt-8 w-full sm:w-auto lg:hidden"
                >
                  開啟輸入面板
                </button>
              </div>
            </div>
          ) : (
            <>
            <div ref={reportRef} className={`report-stack animate-fade-in mt-5${pdfMode ? ' pdf-export-mode' : ''}`}>
              <ResultHero input={input} result={result} />

              {/* 四柱 */}
              <section className="card p-4 sm:p-5">
                <div className="panel-header !mb-5">
                  <h2 className="section-title !mb-0">四柱命盤</h2>
                </div>
                <div className="pillar-grid">
                  {pillars!.map((p) => <PillarCard key={p.label} pillar={p} />)}
                </div>
              </section>

              {/* 分頁 / PDF 完整分析 */}
              {!pdfMode && (
                <div className="tab-bar">
                  {CHART_TABS.map((tab) => (
                    <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                      className={`chart-tab ${activeTab === tab ? 'active' : ''}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              )}

              {pdfMode ? (
                <>
                  {CHART_TABS.map((tab) => (
                    <section key={tab} className="pdf-tab-section">
                      <h3 className="pdf-tab-heading">{tab}</h3>
                      <TabPanel tab={tab} result={result} gender={displayGender} analysisYear={displayYear} />
                    </section>
                  ))}
                  <TenGodLegend />
                </>
              ) : (
                <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
                  <div className="card overflow-hidden">
                    <div className="panel-header mx-4 mt-4 sm:mx-5 sm:mt-5 !mb-0 border-b border-white/5 pb-3">
                      <h3 className="section-title !mb-0">命盤結構</h3>
                      <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-xs text-muted">{activeTab}</span>
                    </div>
                    <TabPanel tab={activeTab} result={result} gender={displayGender} analysisYear={displayYear} />
                  </div>
                  <TenGodLegend />
                </div>
              )}

              {/* 五格 */}
              {result.wuge && result.wuge.總格 > 0 && (
                <>
                  <WugePanel wuge={result.wuge} />
                  {result.wuge.charAnalysis.length > 0 && (
                    <NameCharsPanel charAnalysis={result.wuge.charAnalysis} sancai={result.wuge.sancai} />
                  )}
                </>
              )}

              {result.shensha && <ShenshaPanel items={result.shensha} />}

              {/* 總結 */}
              <section className="card border-[#f0c040]/20 p-5 sm:p-6">
                <div className="panel-header">
                  <h3 className="section-title !mb-0">命盤總結</h3>
                  <div className="flex items-center gap-2">
                    {aiGenerating && (
                      <span className="text-xs text-[#f0c040]">DeepSeek 解讀中…</span>
                    )}
                    {isAiConfigured() && result && !aiGenerating && (
                      <button
                        type="button"
                        onClick={() => void enrichWithAi(result, input)}
                        className="btn-secondary text-xs"
                      >
                        重新 AI 解讀
                      </button>
                    )}
                  </div>
                </div>
                {aiError && (
                  <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    {aiError}
                  </p>
                )}
                {result.daymasterProfile && (
                  <p className="mb-4 text-sm leading-relaxed text-secondary">{result.daymasterProfile}</p>
                )}
                <div className={`mb-4 whitespace-pre-wrap rounded-xl border border-white/5 bg-black/20 p-4 text-sm leading-relaxed text-slate-100${aiGenerating ? ' animate-pulse opacity-60' : ''}`}>
                  {result.summary}
                </div>
                <p className={`text-sm leading-relaxed text-secondary${aiGenerating ? ' animate-pulse opacity-60' : ''}`}>
                  {result.detailText}
                </p>
                {result.topicAnalysis && (
                  <div className={`mt-5 rounded-xl border border-[#f0c040]/25 bg-[#f0c040]/8 p-4${aiGenerating ? ' animate-pulse opacity-60' : ''}`}>
                    <h4 className="mb-2 text-sm font-semibold text-[#fde68a]">
                      主題分析{input.topic ? ` · ${input.topic}` : ''}
                      {isAiConfigured() && !aiGenerating && (
                        <span className="ml-2 rounded-full bg-[#f0c040]/15 px-2 py-0.5 text-[10px] font-normal text-[#f0c040]">AI</span>
                      )}
                    </h4>
                    <p className="text-sm leading-relaxed text-secondary">{result.topicAnalysis}</p>
                    {input.query && (
                      <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-muted">
                        自訂問題：{input.query}
                      </p>
                    )}
                  </div>
                )}
              </section>
            </div>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={pdfExporting}
              className="btn-ghost mt-5 w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pdfExporting ? 'PDF 產生中…' : '產生圖文總結 PDF'}
            </button>
            </>
          )}
        </main>
      </div>

      {showDataManager && <DataManager onClose={() => setShowDataManager(false)} />}
    </div>
  )
}
