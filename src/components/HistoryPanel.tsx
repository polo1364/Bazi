import { useEffect, useState } from 'react'
import type { SavedRecord } from '../types'

interface Props {
  records: SavedRecord[]
  onLoad: (record: SavedRecord) => void
  onDelete: (id: string) => void
  onSave: () => void
  canSave?: boolean
}

export default function HistoryPanel({ records, onLoad, onDelete, onSave, canSave = false }: Props) {
  const [open, setOpen] = useState(records.length > 0)

  useEffect(() => {
    if (records.length > 0) setOpen(true)
  }, [records.length])

  return (
    <section className="history-card card overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <h3 className="section-title !mb-0">歷史紀錄</h3>
          {records.length > 0 && (
            <span className="rounded-full bg-[#f0c040]/15 px-2 py-0.5 text-[10px] font-semibold text-[#f0c040]">
              {records.length}
            </span>
          )}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`ml-auto shrink-0 text-subtle transition-transform sm:ml-2 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <button type="button" onClick={onSave} disabled={!canSave} className="btn-secondary shrink-0">
          儲存
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 px-4 pb-4 sm:px-5 sm:pb-5">
          {records.length === 0 ? (
            <p className="py-3 text-xs text-muted">尚無紀錄，推演後可儲存至本地資料庫。</p>
          ) : (
            <div className="max-h-52 space-y-2 overflow-y-auto pt-3">
              {records.map((r) => (
                <div key={r.id} className="history-item">
                  <button type="button" onClick={() => onLoad(r)} className="min-w-0 flex-1 text-left">
                    <div className="truncate text-sm font-medium text-secondary">{r.name || '未命名'}</div>
                    <div className="mt-0.5 text-[10px] text-muted">
                      {new Date(r.createdAt).toLocaleString('zh-TW')}
                      {r.input.topic && ` · ${r.input.topic}`}
                    </div>
                  </button>
                  <button type="button" onClick={() => onDelete(r.id)}
                    className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-medium text-red-400 transition hover:bg-red-500/10">
                    刪除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
