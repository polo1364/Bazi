import { STEM_ELEMENTS } from './constants.ts'
import { getTenGod } from './tenGods.ts'

export function buildFlowYearText({ year, pillar, dayStem, strengthLabel = '中和偏弱' }) {
  if (!year || !pillar || !dayStem) throw new Error('Missing required input')
  const stem = pillar[0]
  const branch = pillar[1]
  const tenGod = getTenGod(dayStem, stem)
  const dayElement = STEM_ELEMENTS[dayStem]
  const stemElement = STEM_ELEMENTS[stem]
  const fireWealth = dayElement === '水' && stemElement === '火'

  return `${year}年為${pillar}年，${stem}為${dayStem}${dayElement}日主之${tenGod}。${fireWealth ? `${branch}為火旺之地，屬財星明顯之年。` : ''}若命局以${strengthLabel}論，財旺代表薪資、收入、績效與資源機會增加，但同時也代表責任、支出與壓力加重。因此適合以本業加薪、績效獎金、穩定收入為主，不宜過度投機或高槓桿操作。`
}

export function buildSalaryText({ year = 2026, pillar = '丙午', dayStem = '癸', strengthLabel = '中和偏弱' } = {}) {
  const flowText = buildFlowYearText({ year, pillar, dayStem, strengthLabel })
  return `${flowText}薪資方面，${year} ${pillar}財星透出，適合把成果量化，用績效、職責、專案成果談薪。若要談加薪，宜選擇申、酉、亥、子等對日主較有支援的月份或階段，但仍需搭配實際工作績效，不可只依流月判斷。`
}
