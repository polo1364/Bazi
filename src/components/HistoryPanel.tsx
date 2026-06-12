import { useEffect, useRef, useState } from 'react'
import type { SavedRecord } from '../types'
import { pillarsToArray } from '../lib/bazi'

interface Props {
  records: SavedRecord[]
  onLoad: (record: SavedRecord) => void
  onDelete: (id: string) => void
  onSave: () => Promise<void>
  canSave?: boolean
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  saveError?: string
}

function pillarSummary(record: SavedRecord): string {
  const pillars = pillarsToArray(record.result.chart)
  return pillars.map((p) => `${p.stem}${p.branch}`).join(' ')
}

export default function HistoryPanel({
  records,
  onLoad,
  onDelete,
  onSave,
  canSave = false,
  saveStatus = 'idle',
  saveError = '',
}: Props) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const saveLabel = saveStatus === 'saving'
    ? '儲存中…'
    : saveStatus === 'saved'
      ? '已儲存'
      : '儲存'

  const handleLoad = (record: SavedRecord) => {
    onLoad(record)
    setOpen(false)
  }

  return (
    <div ref={menuRef} className="history-menu relative">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`app-header-action flex h-10 items-center gap-1.5 rounded-xl border px-2.5 text-xs transition sm:px-3 ${
            open
              ? 'border-[#f0c040]/40 bg-[#f0c040]/10 text-[#f0c040]'
              : 'border-white/10 bg-white/5 text-secondary hover:border-[#f0c040]/30 hover:text-[#f0c040]'
          }`}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span className="hidden sm:inline">歷史</span>
          {records.length > 0 && (
            <span className="rounded-full bg-[#f0c040]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#f0c040]">
              {records.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => void onSave()}
          disabled={!canSave || saveStatus === 'saving'}
          className={`app-header-action flex h-10 items-center gap-1.5 rounded-xl border px-2.5 text-xs transition sm:px-3 ${
            canSave
              ? 'border-[#f0c040]/40 bg-[#f0c040]/15 text-[#fde68a] hover:bg-[#f0c040]/25'
              : 'border-white/10 bg-white/5 text-secondary opacity-50'
          } disabled:cursor-not-allowed disabled:opacity-40`}
          title={canSave ? '儲存至本機瀏覽器' : '請先完成推演後再儲存'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <path d="M17 21v-8H7v8M7 3v5h8" />
          </svg>
          <span className="hidden sm:inline">{saveLabel}</span>
        </button>
      </div>

      {open && (
        <>
          <button
            type="button"
            className="history-menu-backdrop fixed inset-0 z-40"
            aria-label="關閉歷史紀錄"
            onClick={() => setOpen(false)}
          />
          <div className="history-dropdown card absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden shadow-2xl">
            <div className="border-b border-white/5 px-4 py-3">
              <h3 className="text-sm font-semibold text-[#f0c040]">歷史紀錄</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                {canSave
                  ? '儲存目前命盤後，可在此快速載入。'
                  : '完成排盤或推演後，即可儲存紀錄。'}
              </p>
              {saveStatus === 'saved' && (
                <p className="mt-2 text-[11px] text-emerald-300">已儲存至本地資料庫。</p>
              )}
              {saveStatus === 'error' && saveError && (
                <p className="mt-2 text-[11px] text-red-300">{saveError}</p>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto p-3">
              {records.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted">尚無紀錄</p>
              ) : (
                <div className="space-y-2">
                  {records.map((r) => (
                    <div key={r.id} className="history-item">
                      <button type="button" onClick={() => handleLoad(r)} className="min-w-0 flex-1 text-left">
                        <div className="truncate text-sm font-medium text-secondary">{r.name || '未命名'}</div>
                        <div className="mt-0.5 truncate text-[10px] text-[#f0c040]/80">{pillarSummary(r)}</div>
                        <div className="mt-0.5 text-[10px] text-muted">
                          {new Date(r.createdAt).toLocaleString('zh-TW')}
                          {r.input.topic && ` · ${r.input.topic}`}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(r.id)}
                        className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-medium text-red-400 transition hover:bg-red-500/10"
                      >
                        刪除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
