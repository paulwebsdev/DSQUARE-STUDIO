import type { SiteDocument } from './types'

const DATABASE_NAME = 'dsquare-studio-projects'
const DATABASE_VERSION = 1
const STORE_NAME = 'sites'

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  return new Promise(resolve => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
    request.onblocked = () => resolve(null)
  })
}

export async function loadStoredSite(projectId: string): Promise<SiteDocument | null> {
  const database = await openDatabase()
  if (!database) return null
  return new Promise(resolve => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(projectId)
    request.onsuccess = () => resolve((request.result as SiteDocument | undefined) ?? null)
    request.onerror = () => resolve(null)
    database.onversionchange = () => database.close()
  })
}

export async function saveStoredSite(projectId: string, site: SiteDocument): Promise<boolean> {
  const database = await openDatabase()
  if (!database) {
    try { localStorage.setItem('dsquare-editor-document:' + projectId, JSON.stringify(site)); return true }
    catch { return false }
  }
  return new Promise(resolve => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(site, projectId)
    transaction.oncomplete = () => { database.close(); resolve(true) }
    transaction.onerror = () => { database.close(); resolve(false) }
    transaction.onabort = () => { database.close(); resolve(false) }
  })
}
