export type SancaiLevel = '大吉' | '吉' | '半吉' | '平' | '凶' | '大凶' | '待校驗'

export interface SancaiTableEntry {
  level: Exclude<SancaiLevel, '待校驗'>
  summary: string
  verified: true
}

export const SANCAI_TABLE_COVERAGE = 'partial'
export const SANCAI_SOURCE = '系統內建三才配置表'

export const SANCAI_TABLE: Record<string, SancaiTableEntry> = {
  '金木水': {
    level: '凶',
    summary: '天人格相剋，基礎與發展受牽制，宜保守看待並配合後天調整。',
    verified: true,
  },
}
