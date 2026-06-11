import { useEffect, useState } from 'react'
import { saveCustomStroke, deleteCustomStroke, getAllCustomStrokes } from '../db'
import { refreshCustomStrokes, getDatabaseStats, type DatabaseStats } from '../lib/dataStore'
import { loadAiSettings, saveAiSettings, useAiProxy, type AiSettings } from '../lib/aiSettings'
import type { CustomStroke } from '../db/schema'

interface Props {
  onClose: () => void
}

const DB_LABELS: { key: keyof DatabaseStats; label: string }[] = [
  { key: 'strokes', label: '漢字筆劃' },
  { key: 'charWuxing', label: '汉字五行' },
  { key: 'nameMeanings', label: '字義解釋' },
  { key: 'wuge', label: '五格数理' },
  { key: 'sancai', label: '三才配置' },
  { key: 'nayin', label: '納音五行' },
  { key: 'jiazi', label: '甲子資料' },
  { key: 'solarYears', label: '節氣年份' },
  { key: 'compoundSurnames', label: '複姓' },
  { key: 'shensha', label: '神煞' },
  { key: 'zodiac', label: '生肖' },
  { key: 'daymaster', label: '日主特性' },
  { key: 'relations', label: '刑沖合害' },
  { key: 'tengods', label: '十神' },
  { key: 'patterns', label: '格局' },
  { key: 'stemsBranches', label: '干支特性' },
  { key: 'customStrokes', label: '自訂筆劃' },
]

export default function DataManager({ onClose }: Props) {
  const [strokes, setStrokes] = useState<CustomStroke[]>([])
  const [char, setChar] = useState('')
  const [count, setCount] = useState(10)
  const [ai, setAi] = useState<AiSettings>(() => loadAiSettings())
  const [aiSaved, setAiSaved] = useState(false)
  const stats = getDatabaseStats()

  useEffect(() => {
    getAllCustomStrokes().then(setStrokes)
  }, [])

  const handleAdd = async () => {
    if (!char.trim()) return
    const c = [...char.trim()][0]
    await saveCustomStroke({ char: c, strokes: count, updatedAt: Date.now() })
    await refreshCustomStrokes()
    setStrokes(await getAllCustomStrokes())
    setChar('')
  }

  const handleDelete = async (c: string) => {
    await deleteCustomStroke(c)
    await refreshCustomStrokes()
    setStrokes(await getAllCustomStrokes())
  }

  const handleSaveAi = () => {
    saveAiSettings(ai)
    setAiSaved(true)
    setTimeout(() => setAiSaved(false), 2000)
  }

  const total = DB_LABELS.reduce((s, { key }) => s + stats[key], 0)

  return (
    <div className="overlay fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="card-solid animate-fade-in max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="section-title">資料庫管理</h3>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition hover:bg-white/5 hover:text-white">✕</button>
        </div>

        <div className="mb-4 rounded-xl border border-[#f0c040]/20 bg-[#f0c040]/5 px-4 py-3 text-center">
          <div className="text-2xl font-bold text-[#f0c040]">{total.toLocaleString()}+</div>
          <div className="text-xs text-muted">本地資料庫條目總計</div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DB_LABELS.map(({ key, label }) => (
            <div key={key} className="rounded-lg border border-white/5 bg-black/20 px-3 py-2">
              <div className="text-lg font-bold text-secondary">{stats[key].toLocaleString()}</div>
              <div className="text-[10px] text-muted">{label}</div>
            </div>
          ))}
        </div>

        <p className="mb-4 text-xs text-muted">資料儲存於瀏覽器 IndexedDB + 本地 JSON，無需後端。</p>

        <div className="mb-4 flex gap-2">
          <input className="form-input w-16 text-center" value={char} onChange={(e) => setChar(e.target.value)} placeholder="字" maxLength={1} />
          <input type="number" className="form-input w-20" value={count} onChange={(e) => setCount(+e.target.value)} min={1} max={50} />
          <button type="button" onClick={handleAdd} className="btn-gold flex-1 text-xs">新增筆劃</button>
        </div>

        {strokes.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted">自訂筆劃</p>
            {strokes.map((s) => (
              <div key={s.char} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-sm">
                <span><span className="text-[#f0c040]">{s.char}</span> → {s.strokes} 劃</span>
                <button type="button" onClick={() => handleDelete(s.char)} className="text-xs text-red-400">刪除</button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-white/10 pt-5">
          <h4 className="section-title mb-3">DeepSeek AI 解讀</h4>
          {useAiProxy() ? (
            <p className="mb-4 text-xs leading-relaxed text-muted">
              此站已啟用<strong className="text-secondary"> 伺服器代理模式 </strong>，API Key 由部署平台管理，訪客無需自行填寫 Key，只需勾選啟用即可。
            </p>
          ) : (
            <p className="mb-4 text-xs leading-relaxed text-muted">
              啟用後，「命盤總結」與「主題分析」將由 DeepSeek 依本地排盤結果生成。API Key 僅存於本機瀏覽器。
            </p>
          )}

          <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-secondary">
            <input
              type="checkbox"
              checked={ai.enabled}
              onChange={(e) => setAi({ ...ai, enabled: e.target.checked })}
              className="rounded"
            />
            啟用 AI 解讀
          </label>

          {!useAiProxy() && (
            <div className="space-y-3">
              <div>
                <label className="form-label">API Key</label>
                <input
                  type="password"
                  className="form-input"
                  value={ai.apiKey}
                  onChange={(e) => setAi({ ...ai, apiKey: e.target.value })}
                  placeholder="sk-..."
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="form-label">模型</label>
                <select className="form-input" value={ai.model} onChange={(e) => setAi({ ...ai, model: e.target.value })}>
                  <option value="deepseek-chat">deepseek-chat（推薦）</option>
                  <option value="deepseek-reasoner">deepseek-reasoner</option>
                </select>
              </div>
            </div>
          )}

          <button type="button" onClick={handleSaveAi} className="btn-gold mt-3 w-full text-xs">
            {aiSaved ? '已儲存' : '儲存 AI 設定'}
          </button>
        </div>
      </div>
    </div>
  )
}
