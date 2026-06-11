import { getLiunian, getLiuyue } from './analysis.ts'

export const FLOW_YEAR_NOTE = '八字流年以立春為界，非國曆 1 月 1 日。'
export const FLOW_MONTH_NOTE = '流月以節氣切換，不等於農曆初一，也不等於國曆每月 1 日。'

export function getFlowYears(chart, startYear, count = 10) {
  return getLiunian(chart, startYear, count)
}

export function getSolarTermFlowMonths(chart, year) {
  return getLiuyue(chart, year)
}
