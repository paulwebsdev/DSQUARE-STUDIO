/**
 * Provider-neutral contracts for DSQUARE STUDIO platform services.
 *
 * These are interfaces only: they do not connect a cloud provider or create
 * production security. Implementations must be supplied by trusted adapters.
 */
import type { SiteDocument } from '../editor/types'

export type PlatformErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'UNAVAILABLE'
  | 'UNSUPPORTED'
  | 'UNKNOWN'

export type PlatformResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: PlatformErrorCode; message: string } }

export type AuthenticatedUser = {
  id: string
  email: string
  displayName?: string
}

export type AuthSession = {
  user: AuthenticatedUser
  expiresAt: string
}

export interface AuthAdapter {
  getSession(): Promise<PlatformResult<AuthSession | null>>
  signIn(input: { email: string; password: string }): Promise<PlatformResult<AuthSession>>
  signOut(): Promise<PlatformResult<null>>
}

export type StoredSiteDocument = {
  document: SiteDocument
  /** Null for adapters that do not yet provide server revisions. */
  revision: number | null
}

export interface SiteDocumentRepository {
  load(siteId: string): Promise<PlatformResult<StoredSiteDocument | null>>
  save(input: {
    siteId: string
    document: SiteDocument
    /** When supported, reject writes based on a stale revision. */
    expectedRevision?: number | null
  }): Promise<PlatformResult<StoredSiteDocument>>
}

export type UploadIntent = {
  uploadUrl: string
  storageKey: string
  expiresAt: string
}

export type StoredObject = {
  storageKey: string
  mimeType: string
  sizeBytes: number
}

export interface ObjectStorageAdapter {
  createUploadIntent(input: {
    workspaceId: string
    siteId: string
    fileName: string
    mimeType: string
    sizeBytes: number
  }): Promise<PlatformResult<UploadIntent>>
  confirmUpload(input: {
    workspaceId: string
    siteId: string
    storageKey: string
  }): Promise<PlatformResult<StoredObject>>
  createDownloadUrl(input: {
    workspaceId: string
    storageKey: string
  }): Promise<PlatformResult<{ url: string; expiresAt: string }>>
}

export interface IntegrationSecretVault {
  store(input: {
    workspaceId: string
    integrationId: string
    secret: string
  }): Promise<PlatformResult<{ secretReference: string }>>
  delete(input: {
    workspaceId: string
    secretReference: string
  }): Promise<PlatformResult<null>>
}

/**
 * Feature services (CMS, forms, commerce, SEO, analytics, versions) should
 * depend on narrow repositories built from these contracts, not on a vendor
 * SDK imported by React components.
 */
export type PlatformAdapters = {
  auth?: AuthAdapter
  siteDocuments?: SiteDocumentRepository
  objectStorage?: ObjectStorageAdapter
  integrationSecrets?: IntegrationSecretVault
}
