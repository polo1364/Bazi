export function buildNameSummaryText(nameAnalysis: any): string {
  if (!nameAnalysis) return '未輸入姓名，略過姓名學分析。'

  const hasWugeFortune = nameAnalysis.wugeFortune?.verified === true || nameAnalysis.wugeFortuneVerified === true
  const hasSancai = nameAnalysis.sancai?.verified === true

  if (nameAnalysis.verified === true && hasWugeFortune && hasSancai) {
    return '姓名筆畫已依康熙筆畫資料庫計算，五格 81 數理與三才配置已由系統資料表判讀；結果僅供參考，不作保證性結論。'
  }

  const parts = ['姓名筆畫已依康熙筆畫資料庫計算；結果僅供參考，不作保證性結論。']
  if (!hasWugeFortune) parts.push('81 數理吉凶尚未校驗。')
  if (!hasSancai) parts.push('三才配置尚未校驗。')
  return parts.join('')
}
