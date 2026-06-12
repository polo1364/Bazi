import { useRef } from 'react'
import type { AnalysisTopic, BirthInput, Gender, InputMode, ManualPillars, SolarTimeMode } from '../types'
import { ANALYSIS_TOPICS, HOUR_LABELS, STEMS, BRANCHES } from '../lib/constants'
import { TAIWAN_CITY_OPTIONS, getLongitudeByCity } from '../lib/locationLongitude'

const SOLAR_TIME_MODES: { id: SolarTimeMode; label: string }[] = [
  { id: 'none', label: '不修正' },
  { id: 'meanSolarTime', label: '地方平太陽時' },
  { id: 'trueSolarTime', label: '真太陽時' },
]

interface Props {
  input: BirthInput
  onChange: (patch: Partial<BirthInput>) => void
  onCalculate: () => boolean | void
  onAnalyze: () => boolean | void
  onImageUpload: (file: File) => void
  chartImageUrl?: string
  error?: string
  fieldErrors?: string[]
  onClose?: () => void
}

const MODES: { id: InputMode; label: string; short: string }[] = [
  { id: 'solar', label: '西曆自動排盤', short: '西曆' },
  { id: 'manual', label: '手動輸入四柱', short: '手動' },
  { id: 'upload', label: '上傳命盤圖', short: '上傳' },
]

function PillarSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const stem = value[0] ?? ''
  const branch = value[1] ?? ''
  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <select className="form-input" value={stem} onChange={(e) => onChange(e.target.value + branch)}>
          <option value="">天干</option>
          {STEMS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-input" value={branch} onChange={(e) => onChange(stem + e.target.value)}>
          <option value="">地支</option>
          {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
    </div>
  )
}

function fieldClass(invalid: boolean) {
  return `form-input${invalid ? ' border-red-500/60 ring-1 ring-red-500/30' : ''}`
}

export default function Sidebar({ input, onChange, onCalculate, onAnalyze, onImageUpload, chartImageUrl, error, fieldErrors = [], onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  const setMode = (mode: InputMode) => onChange({ inputMode: mode })
  const setManual = (patch: Partial<ManualPillars>) =>
    onChange({ manualPillars: { ...input.manualPillars, ...patch } })

  const handleChart = () => {
    if (onCalculate() !== false) onClose?.()
  }

  const handleAnalyze = () => {
    if (onAnalyze() !== false) onClose?.()
  }

  return (
    <aside className="sidebar-shell lg:h-[calc(100vh-var(--header-h))]">
      {/* 手機標題列 */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 lg:hidden">
        <span className="text-sm font-semibold text-secondary">輸入面板</span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted transition hover:text-white"
          aria-label="關閉"
        >
          ✕
        </button>
      </div>

      <div className="sidebar-scroll flex flex-col gap-4">
        {/* 命盤輸入 */}
        <section className="card p-4 sm:p-5">
          <h2 className="section-title mb-1">命盤輸入</h2>
          <p className="mb-4 text-xs text-subtle">選擇排盤方式並填寫出生資料</p>
          <div className="mb-4 flex gap-1 rounded-xl bg-black/20 p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`mode-tab ${input.inputMode === m.id ? 'active' : ''}`}
              >
                <span className="sm:hidden">{m.short}</span>
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>

          {input.inputMode === 'solar' && (
            <div className="space-y-3">
              <div>
                <label className="form-label">出生年 <span className="text-red-400">*</span></label>
                <input type="number" placeholder="例：1990" className={fieldClass(fieldErrors.includes('year'))} value={input.year}
                  onChange={(e) => onChange({ year: e.target.value ? +e.target.value : '' })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">月 <span className="text-red-400">*</span></label>
                  <select className={fieldClass(fieldErrors.includes('month'))} value={input.month}
                    onChange={(e) => onChange({ month: e.target.value ? +e.target.value : '' })}>
                    <option value="">請選擇</option>
                    {months.map((m) => <option key={m} value={m}>{m} 月</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">日 <span className="text-red-400">*</span></label>
                  <select className={fieldClass(fieldErrors.includes('day'))} value={input.day}
                    onChange={(e) => onChange({ day: e.target.value ? +e.target.value : '' })}>
                    <option value="">請選擇</option>
                    {days.map((d) => <option key={d} value={d}>{d} 日</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">時辰 {!input.uncertainHour && <span className="text-red-400">*</span>}</label>
                <select className={fieldClass(fieldErrors.includes('hour'))} value={input.hour === '' ? '' : input.hour}
                  onChange={(e) => onChange({ hour: e.target.value === '' ? '' : +e.target.value, uncertainHour: false })}>
                  <option value="">請選擇</option>
                  {HOUR_LABELS.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-white/5 bg-black/20 px-3 py-2.5 text-xs text-secondary">
                <input type="checkbox" className="accent-[#f0c040]" checked={input.uncertainHour}
                  onChange={(e) => onChange({
                    uncertainHour: e.target.checked,
                    hour: e.target.checked ? 0 : input.hour,
                  })} />
                不確定時辰 → 以子時計算
              </label>

              <div className="space-y-3 rounded-xl border border-white/5 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-secondary">真太陽時校正</span>
                  <span className="text-[10px] text-subtle">時區 +8 · 標準經線 120°E</span>
                </div>
                <div>
                  <label className="form-label">出生地城市</label>
                  <select className="form-input" value={input.birthCity ?? ''}
                    onChange={(e) => {
                      const city = e.target.value
                      const lon = getLongitudeByCity(city)
                      onChange({ birthCity: city, birthLongitude: lon ?? input.birthLongitude ?? '' })
                    }}>
                    <option value="">未選擇（自訂或預設）</option>
                    {TAIWAN_CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">出生地經度（東經）</label>
                  <input type="number" step="0.001" placeholder="例：121.565" className="form-input"
                    value={input.birthLongitude === '' || input.birthLongitude == null ? '' : input.birthLongitude}
                    onChange={(e) => onChange({ birthLongitude: e.target.value === '' ? '' : +e.target.value, birthCity: '' })} />
                  {(input.birthLongitude === '' || input.birthLongitude == null) && (
                    <p className="mt-1 text-[10px] leading-relaxed text-subtle">未輸入出生地經度，預設以東經 120 度計算。</p>
                  )}
                </div>
                <div>
                  <label className="form-label">時間模式</label>
                  <div className="flex gap-1 rounded-lg bg-black/30 p-1">
                    {SOLAR_TIME_MODES.map((m) => (
                      <button key={m.id} type="button"
                        onClick={() => onChange({ solarTimeMode: m.id })}
                        className={`mode-tab flex-1 ${(input.solarTimeMode ?? 'none') === m.id ? 'active' : ''}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {(input.solarTimeMode ?? 'none') === 'trueSolarTime' && (
                    <p className="mt-1 text-[10px] leading-relaxed text-subtle">真太陽時使用近似均時差公式，可能與天文年鑑資料有數十秒至數分鐘差異。</p>
                  )}
                </div>
              </div>

              <button type="button" onClick={handleChart} className="btn-gold w-full">自動排盤</button>
            </div>
          )}

          {input.inputMode === 'manual' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <PillarSelect label="年柱" value={input.manualPillars.year} onChange={(v) => setManual({ year: v })} />
                <PillarSelect label="月柱" value={input.manualPillars.month} onChange={(v) => setManual({ month: v })} />
                <PillarSelect label="日柱" value={input.manualPillars.day} onChange={(v) => setManual({ day: v })} />
                <PillarSelect label="時柱" value={input.manualPillars.hour} onChange={(v) => setManual({ hour: v })} />
              </div>
              <p className="text-xs leading-relaxed text-muted">直接選擇天干地支，適用已知四柱的命盤。</p>
              <button type="button" onClick={handleChart} className="btn-gold w-full">確認四柱</button>
            </div>
          )}

          {input.inputMode === 'upload' && (
            <div className="space-y-3">
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onImageUpload(f) }} />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="upload-zone">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-60">
                  <path d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                </svg>
                <span>點擊上傳命盤圖片</span>
                <span className="text-[10px] text-subtle">支援 JPG、PNG</span>
              </button>
              {chartImageUrl && (
                <img src={chartImageUrl} alt="命盤" className="max-h-44 w-full rounded-xl border border-white/10 object-contain" />
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <PillarSelect label="年柱" value={input.manualPillars.year} onChange={(v) => setManual({ year: v })} />
                <PillarSelect label="月柱" value={input.manualPillars.month} onChange={(v) => setManual({ month: v })} />
                <PillarSelect label="日柱" value={input.manualPillars.day} onChange={(v) => setManual({ day: v })} />
                <PillarSelect label="時柱" value={input.manualPillars.hour} onChange={(v) => setManual({ hour: v })} />
              </div>
              <button type="button" onClick={handleChart} className="btn-gold w-full">依圖確認排盤</button>
            </div>
          )}
        </section>

        {/* 基本資料 */}
        <section className="card p-4 sm:p-5">
          <h2 className="section-title mb-1">基本資料</h2>
          <p className="mb-4 text-xs text-subtle">姓名與性別用於五格及運勢分析</p>
          <div className="space-y-3">
            <div>
              <label className="form-label">姓名</label>
              <input className="form-input" value={input.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="請輸入姓名" />
            </div>
            <div>
              <label className="form-label">複姓（選填）</label>
              <input className="form-input" value={input.compoundSurname} onChange={(e) => onChange({ compoundSurname: e.target.value })} placeholder="如：歐陽，單姓留空" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">性別</label>
                <select className="form-input" value={input.gender} onChange={(e) => onChange({ gender: e.target.value as Gender | '' })}>
                  <option value="">請選擇</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <div>
                <label className="form-label">分析年份</label>
                <input type="number" placeholder="2026" className="form-input" value={input.analysisYear}
                  onChange={(e) => onChange({ analysisYear: e.target.value ? +e.target.value : '' })} />
              </div>
            </div>
          </div>
        </section>

        {/* 分析主題 */}
        <section className="card p-4 sm:p-5">
          <h2 className="section-title mb-1">分析主題</h2>
          <p className="mb-4 text-xs text-subtle">選擇關注重點，可選填自訂問題</p>
          <div className="flex flex-wrap gap-2">
            {ANALYSIS_TOPICS.map((t) => (
              <button key={t} type="button" onClick={() => onChange({ topic: t as AnalysisTopic })}
                className={`topic-tag ${input.topic === t ? 'active' : ''}`}>{t}</button>
            ))}
          </div>
          <textarea className="form-input mt-3 resize-none text-xs leading-relaxed" rows={3}
            value={input.query} onChange={(e) => onChange({ query: e.target.value })} placeholder="輸入想了解的問題..." />
        </section>
      </div>

      <div className="sidebar-footer">
        {error && (
          <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs leading-relaxed text-red-200">
            {error}
          </div>
        )}
        <button type="button" onClick={handleAnalyze} className="btn-gold w-full">
          開始推演命盤
        </button>
        <p className="mt-2.5 text-center text-[10px] leading-relaxed text-subtle">
          「排盤」僅需出生資料 · 「推演」另需性別與分析年份
        </p>
      </div>
    </aside>
  )
}
