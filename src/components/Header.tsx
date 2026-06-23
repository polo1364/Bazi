import type { ReactNode } from 'react'

interface Props {
  onOpenSettings: () => void
  onToggleSidebar: () => void
  sidebarOpen: boolean
  historyControls?: ReactNode
}

export default function Header({ onOpenSettings, onToggleSidebar, sidebarOpen, historyControls }: Props) {
  return (
    <header className="app-header sticky top-0 z-40 border-b border-white/[0.06] bg-[#070d1a]/90 backdrop-blur-xl" style={{ height: 'var(--header-h)' }}>
      <div className="app-header-inner mx-auto flex h-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="app-header-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-secondary transition hover:border-[#f0c040]/30 hover:text-[#f0c040] lg:hidden"
          aria-label={sidebarOpen ? '關閉選單' : '開啟選單'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {sidebarOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <>
                <path d="M4 7h16M4 12h16M4 17h16" />
              </>
            )}
          </svg>
        </button>

        <div className="app-brand flex flex-1 items-center gap-3 lg:text-left">
          <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#f0c040]/25 bg-[#f0c040]/10 text-sm font-bold text-[#f0c040] sm:flex">
            命
          </div>
          <div className="app-brand-title flex-1 text-center lg:text-left">
            <h1 className="text-base font-bold tracking-wide text-white sm:text-lg">
              八字 <span className="bg-gradient-to-r from-[#fde68a] to-[#f0c040] bg-clip-text text-transparent">×</span> 姓名合參
            </h1>
            <p className="mt-0.5 hidden text-[11px] text-muted sm:block">
              八字命盤 · 姓名五格 · 流年運程 · 本地推演
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {historyControls}
          <button
            type="button"
            onClick={onOpenSettings}
            className="app-header-action flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-secondary transition hover:border-[#f0c040]/30 hover:text-[#f0c040] sm:px-4"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              <path d="M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6" />
            </svg>
            <span className="hidden sm:inline">資料庫</span>
          </button>
        </div>
      </div>
    </header>
  )
}
