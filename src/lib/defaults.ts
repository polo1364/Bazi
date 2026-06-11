export function createEmptyInput(): import('../types').BirthInput {
  return {
    inputMode: 'solar',
    year: '',
    month: '',
    day: '',
    hour: '',
    uncertainHour: false,
    manualPillars: { year: '', month: '', day: '', hour: '' },
    name: '',
    gender: '',
    analysisYear: '',
    topic: '',
    query: '',
    compoundSurname: '',
  }
}
