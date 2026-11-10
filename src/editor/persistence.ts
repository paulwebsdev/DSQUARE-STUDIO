import type { SiteDocument } from './types'

const DATABASE_NAME = 'dsquare-studio-projects'
const DATABASE_VERSION = 1
const STORE_NAME = 'sites'

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  return new Promise(resolve => {
    try {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
      request.onupgradeneeded = () => {
        const database = request.result
        if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME)
      }
      request.onsuccess = () => {
        request.result.onversionchange = () => request.result.close()
        resolve(request.result)
      }
      request.onerror = () => resolve(null)
      request.onblocked = () => resolve(null)
    } catch { resolve(null) }
  })
}

export async function loadStoredSite(projectId: string): Promise<SiteDocument | null> {
  const database = await openDatabase()
  if (!database) return null
  return new Promise(resolve => {
    try {
      const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(projectId)
      request.onsuccess = () => { const result = (request.result as SiteDocument | undefined) ?? null; database.close(); resolve(result) }
      request.onerror = () => { database.close(); resolve(null) }
    } catch { database.close(); resolve(null) }
  })
}

export async function saveStoredSite(projectId: string, site: SiteDocument): Promise<boolean> {
  const fallback = () => {
    try { localStorage.setItem('dsquare-editor-document:' + projectId, JSON.stringify(site)); return true }
    catch { return false }
  }
  const database = await openDatabase()
  if (!database) return fallback()
  return new Promise(resolve => {
    try {
      const transaction = database.transaction(STORE_NAME, 'readwrite')
      transaction.objectStore(STORE_NAME).put(site, projectId)
      transaction.oncomplete = () => { database.close(); resolve(true) }
      transaction.onerror = () => { database.close(); resolve(fallback()) }
      transaction.onabort = () => { database.close(); resolve(fallback()) }
    } catch { database.close(); resolve(fallback()) }
  })
}
