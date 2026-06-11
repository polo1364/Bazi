import { getDayunDetails } from './analysis.ts'

export function getLuckCycles(chart, gender, favorableElements) {
  if (!chart || !gender || !favorableElements) throw new Error('Missing required input')
  return getDayunDetails(chart, gender, favorableElements)
}
