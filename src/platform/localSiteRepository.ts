/**
 * Browser-local prototype adapter for the provider-neutral site repository.
 *
 * This adapter intentionally does not claim cloud sync, authentication,
 * workspace isolation or multi-device concurrency. Replace it with a secured
 * server-backed implementation when the external platform is ready.
 */
import { loadStoredSite, saveStoredSite } from '../editor/persistence'
import type { SiteDocumentRepository } from './contracts'

export const localSiteDocumentRepository: SiteDocumentRepository = {
  async load(siteId) {
    const document = await loadStoredSite(siteId)
    return {
      ok: true,
      data: document ? { document, revision: null } : null,
    }
  },

  async save({ siteId, document, expectedRevision }) {
    // IndexedDB/localStorage currently has no authoritative revision counter.
    // Refuse a revision-guarded write rather than pretending to prevent races.
    if (expectedRevision !== undefined && expectedRevision !== null) {
      return {
        ok: false,
        error: {
          code: 'UNSUPPORTED',
          message: 'The browser-local prototype does not support revision-guarded saves.',
        },
      }
    }

    const saved = await saveStoredSite(siteId, document)
    if (!saved) {
      return {
        ok: false,
        error: {
          code: 'UNAVAILABLE',
          message: 'The website could not be saved in this browser.',
        },
      }
    }

    return {
      ok: true,
      data: { document, revision: null },
    }
  },
}
