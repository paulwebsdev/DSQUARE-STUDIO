/**
 * Versioned, provider-neutral document model for websites created in DSQUARE STUDIO.
 * Keep this format serializable so it can be stored, migrated, previewed and exported.
 */

export const SITE_SCHEMA_VERSION = 1 as const

export type DeviceMode = 'desktop' | 'tablet' | 'mobile'
export type SiteStatus = 'draft' | 'published' | 'archived'
export type SectionKind = 'header' | 'hero' | 'features' | 'gallery' | 'testimonials' | 'pricing' | 'contact' | 'footer' | 'custom'
export type ComponentKind = 'heading' | 'text' | 'button' | 'image' | 'spacer' | 'container'

export type StyleMap = {
  color?: string
  backgroundColor?: string
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  textAlign?: 'left' | 'center' | 'right'
  padding?: string
  margin?: string
  borderRadius?: string
  width?: string
  maxWidth?: string
  [key: string]: string | undefined
}

export type SiteComponent = {
  id: string
  kind: ComponentKind
  content: string
  styles: StyleMap
  visible: boolean
}

export type SiteSection = {
  id: string
  kind: SectionKind
  name: string
  enabled: boolean
  styles: StyleMap
  components: SiteComponent[]
}

export type SitePage = {
  id: string
  name: string
  slug: string
  isHomePage: boolean
  sections: SiteSection[]
}

export type SiteTheme = {
  primaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  headingFont: string
  bodyFont: string
  buttonRadius: string
}

export type SiteDocument = {
  schemaVersion: typeof SITE_SCHEMA_VERSION
  id: string
  name: string
  category: string
  status: SiteStatus
  createdAt: string
  updatedAt: string
  theme: SiteTheme
  pages: SitePage[]
  metadata: {
    title: string
    description: string
    language: string
  }
}

export function createId(prefix: string): string {
  return `${prefix}_${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 11)}`
}
