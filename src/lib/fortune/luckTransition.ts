type LuckCycleLike = {
  pillar: string
  startAge?: string
  endAge?: string
}

function pad(n: number): string {
  return `${n}`.padStart(2, '0')
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function addYearsMonths(date: Date, years: number, months: number): Date {
  const next = new Date(date)
  next.setFullYear(next.getFullYear() + years)
  next.setMonth(next.getMonth() + months)
  return next
}

function parseAge(value?: string): { years: number; months: number } | null {
  if (!value) return null
  const years = Number(value.match(/(\d+)歲/)?.[1] ?? NaN)
  const months = Number(value.match(/(\d+)個月/)?.[1] ?? 0)
  if (!Number.isFinite(years)) return null
  return { years, months: Number.isFinite(months) ? months : 0 }
}

export function splitYearByLuckTransition({
  year,
  birthDate,
  luckCycles,
}: {
  year: number
  birthDate?: Date | null
  luckCycles: LuckCycleLike[]
}) {
  if (!birthDate || Number.isNaN(birthDate.getTime())) {
    return {
      year,
      hasTransition: false,
      verified: false,
      segments: [],
      note: '大運切換日期尚未驗證：缺少出生日期或起運資料。',
    }
  }

  const segments: Array<{ from: string; to: string; luckCycle: string; label: string }> = []
  const yearStart = new Date(year, 1, 4)
  const yearEnd = new Date(year + 1, 1, 3)

  for (let i = 1; i < luckCycles.length; i += 1) {
    const next = luckCycles[i]
    const prev = luckCycles[i - 1]
    const age = parseAge(next.startAge)
    if (!age) continue
    const transition = addYearsMonths(birthDate, age.years, age.months)
    if (transition >= yearStart && transition <= yearEnd) {
      const transitionText = formatDate(transition)
      const beforeEnd = new Date(transition)
      beforeEnd.setDate(beforeEnd.getDate() - 1)
      segments.push({
        from: formatDate(yearStart),
        to: formatDate(beforeEnd),
        luckCycle: prev.pillar,
        label: '大運切換前',
      })
      segments.push({
        from: transitionText,
        to: formatDate(yearEnd),
        luckCycle: next.pillar,
        label: '大運切換後',
      })
      return {
        year,
        hasTransition: true,
        verified: true,
        segments,
        note: `此年跨越大運切換，年度分析需分段看待。`,
      }
    }
  }

  return {
    year,
    hasTransition: false,
    verified: true,
    segments: [],
    note: '此年未跨越大運切換。',
  }
}
