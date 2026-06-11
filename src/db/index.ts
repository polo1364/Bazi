import { openDB, type IDBPDatabase } from 'idb'
import type { SavedRecord } from '../types'
import type { BaziDBSchema, ChartImage, CustomStroke, AppSettings } from './schema'
import { DB_NAME, DB_VERSION } from './schema'

let dbPromise: Promise<IDBPDatabase<BaziDBSchema>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<BaziDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('records')) {
          const store = db.createObjectStore('records', { keyPath: 'id' })
          store.createIndex('by-date', 'createdAt')
          store.createIndex('by-name', 'name')
        }
        if (!db.objectStoreNames.contains('customStrokes')) {
          db.createObjectStore('customStrokes', { keyPath: 'char' })
        }
        if (!db.objectStoreNames.contains('chartImages')) {
          db.createObjectStore('chartImages', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export async function saveRecord(record: SavedRecord): Promise<void> {
  const db = await getDB()
  await db.put('records', record)
}

export async function getAllRecords(): Promise<SavedRecord[]> {
  const db = await getDB()
  const list = await db.getAllFromIndex('records', 'by-date')
  return list.reverse()
}

export async function getRecord(id: string): Promise<SavedRecord | undefined> {
  const db = await getDB()
  return db.get('records', id)
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('records', id)
}

export async function saveCustomStroke(stroke: CustomStroke): Promise<void> {
  const db = await getDB()
  await db.put('customStrokes', stroke)
}

export async function getAllCustomStrokes(): Promise<CustomStroke[]> {
  const db = await getDB()
  return db.getAll('customStrokes')
}

export async function deleteCustomStroke(char: string): Promise<void> {
  const db = await getDB()
  await db.delete('customStrokes', char)
}

export async function saveChartImage(image: ChartImage): Promise<void> {
  const db = await getDB()
  await db.put('chartImages', image)
}

export async function getChartImage(id: string): Promise<ChartImage | undefined> {
  const db = await getDB()
  return db.get('chartImages', id)
}

export async function deleteChartImage(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('chartImages', id)
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB()
  const s = await db.get('settings', 'settings')
  return s ?? { id: 'settings', compoundSurname: '' }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB()
  await db.put('settings', settings)
}

export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await db.clear('records')
  await db.clear('customStrokes')
  await db.clear('chartImages')
}
