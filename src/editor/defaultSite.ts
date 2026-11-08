import { createId, type SiteDocument, type SitePage, type SiteSection } from './types'

function component(kind: 'heading' | 'text' | 'button', content: string) {
  return {
    id: createId(kind),
    kind,
    content,
    visible: true,
    styles: kind === 'heading'
      ? { fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: '700', color: '#171717', maxWidth: '760px' }
      : kind === 'button'
        ? { backgroundColor: '#c99b45', color: '#111111', padding: '14px 24px', borderRadius: '999px' }
        : { fontSize: '1.125rem', color: '#666666', maxWidth: '620px' },
  } as const
}

function section(kind: SiteSection['kind'], name: string, components: SiteSection['components'], styles: SiteSection['styles'] = {}): SiteSection {
  return { id: createId('section'), kind, name, enabled: true, styles, components: [...components] }
}

export function createStarterPage(): SitePage {
  return {
    id: createId('page'),
    name: 'Home',
    slug: '/',
    isHomePage: true,
    sections: [
      section('header', 'Navigation', [component('heading', 'YOUR BRAND')], { padding: '24px 6%' }),
      section('hero', 'Hero section', [
        component('heading', 'Build something remarkable.'),
        component('text', 'Tell your visitors what makes your business different. Replace this text with your own message.'),
        component('button', 'Get started'),
      ], { padding: '112px 6%', backgroundColor: '#f6f3ed' }),
      section('features', 'What we do', [
        component('heading', 'Made for your next big idea'),
        component('text', 'Add your services, products or key benefits here.'),
      ], { padding: '88px 6%' }),
      section('contact', 'Contact', [
        component('heading', 'Let’s work together'),
        component('text', 'Add your contact details and invite visitors to get in touch.'),
        component('button', 'Contact us'),
      ], { padding: '88px 6%', backgroundColor: '#f6f3ed' }),
      section('footer', 'Footer', [component('text', '© Your brand. All rights reserved.')], { padding: '32px 6%' }),
    ],
  }
}

export function createStarterSite(name = 'Untitled website', category = 'Business'): SiteDocument {
  const now = new Date().toISOString()
  return {
    schemaVersion: 1,
    id: createId('site'),
    name,
    category,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    theme: {
      primaryColor: '#171717',
      accentColor: '#c99b45',
      backgroundColor: '#ffffff',
      textColor: '#262626',
      headingFont: 'Inter',
      bodyFont: 'Inter',
      buttonRadius: '999px',
    },
    pages: [createStarterPage()],
    metadata: {
      title: name,
      description: 'A website created with DSQUARE STUDIO.',
      language: 'en',
    },
  }
}
