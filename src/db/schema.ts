import type { BirthInput } from '../types'

export type InputMode = 'solar' | 'manual' | 'upload'

export interface ManualPillars {
  year: string
  month: string
  day: string
  hour: string
}

export interface CustomStroke {
  char: string
  strokes: number
  note?: string
  updatedAt: number
}

export interface ChartImage {
  id: string
  blob: Blob
  fileName: string
  createdAt: number
}

export interface AppSettings {
  id: 'settings'
  compoundSurname: string
  lastInput?: BirthInput
  lastInputMode?: InputMode
}

export interface BaziDBSchema {
  records: {
    key: string
    value: import('../types').SavedRecord
    indexes: { 'by-date': number; 'by-name': string }
  }
  customStrokes: {
    key: string
    value: CustomStroke
  }
  chartImages: {
    key: string
    value: ChartImage
  }
  settings: {
    key: string
    value: AppSettings
  }
}

export const DB_NAME = 'bazi-name-db'
export const DB_VERSION = 1
