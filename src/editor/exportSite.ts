import type { SiteDocument, SiteComponent, SitePage, SiteSection, StyleMap } from './types'

export type ExportFiles = { htmlFiles: Record<string, string>; css: string; js: string; assets: Record<string, Uint8Array> }

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
const safeFileName = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page'
const safeHref = (value: string, pageFiles: Map<string, string>) => {
  const trimmed = value.trim()
  if (!trimmed || /^(?:\/\/|javascript:|data:|vbscript:|file:|blob:)/i.test(trimmed)) return '#'
  const internal = trimmed.replace(/^\//, '').replace(/\.html$/, '')
  const match = [...pageFiles.entries()].find(([slug]) => slug === internal)
  if (match) return match[1]
  if (/^(?:https?:|mailto:|tel:|#|\.\.?\/)/i.test(trimmed)) return trimmed
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return '#'
  return trimmed
}
const styleText = (styles: StyleMap = {}) => Object.entries(styles)
  .filter(([key, value]) => value !== undefined && /^[a-zA-Z-]+$/.test(key))
  .map(([key, value]) => key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase()) + ':' + String(value).replace(/[;{}<>\u0000-\u001f]/g, ''))
  .join(';')

function renderComponent(component: SiteComponent, pageFiles: Map<string, string>, assetPaths: Map<string, string>, assetAltTexts: Map<string, string>): string {
  const className = 'ds-element ds-element-' + component.id.replace(/[^a-zA-Z0-9_-]/g, '')
  const style = styleText(component.styles)
  const attrs = 'class="' + className + '"' + (style ? ' style="' + escapeHtml(style) + '"' : '')
  const content = escapeHtml(component.content)
  const href = component.linkTo ? safeHref(component.linkTo, pageFiles) : ''
  if (component.kind === 'heading') return '<h2 ' + attrs + '>' + content + '</h2>'
  if (component.kind === 'text') return '<p ' + attrs + '>' + content + '</p>'
  if (component.kind === 'button') return href ? '<a ' + attrs + ' href="' + escapeHtml(href) + '">' + content + '</a>' : '<span ' + attrs + '>' + content + '</span>'
  if (component.kind === 'image') return '<img ' + attrs + ' src="' + escapeHtml(assetPaths.get(component.content) ?? component.content) + '" alt="' + escapeHtml(assetAltTexts.has(component.content) ? (assetAltTexts.get(component.content) ?? '') : 'Website image') + '" loading="lazy" decoding="async">'
  if (component.kind === 'form') return '<form class="ds-contact-form"><label>Your name<input name="name" autocomplete="name" required></label><label>Email address<input name="email" type="email" autocomplete="email" required></label><label>Your message<textarea name="message" rows="5" required></textarea></label><button type="submit">Send message</button><p class="ds-form-note" aria-live="polite"></p></form>'
  if (component.kind === 'container') return '<div ' + attrs + '>' + content + '</div>'
  return ''
}

function renderSection(section: SiteSection, pageFiles: Map<string, string>, pages: SitePage[], currentPage: SitePage, assetPaths: Map<string, string>, assetAltTexts: Map<string, string>): string {
  if (!section.enabled) return ''
  const id = section.id.replace(/[^a-zA-Z0-9_-]/g, '')
  const content = section.components.filter(item => item.visible).map(item => renderComponent(item, pageFiles, assetPaths, assetAltTexts)).join('\n')
  const navigation = section.kind === 'header' && pages.length > 1
    ? '<nav class="ds-navigation" aria-label="Main navigation">' + pages.map(page => {
      const file = pageFiles.get(page.slug) ?? 'index.html'
      return '<a href="' + escapeHtml(file) + '"' + (page.id === currentPage.id ? ' aria-current="page"' : '') + '>' + escapeHtml(page.name) + '</a>'
    }).join('') + '</nav>'
    : ''
  const sectionStyles = { ...section.styles }
  const backgroundImage = sectionStyles.backgroundImage
  if (backgroundImage) {
    const match = String(backgroundImage).match(/^url\((['"]?)(data:image\/[a-zA-Z0-9.+-]+;base64,[\s\S]+?)\1\)$/)
    if (match) sectionStyles.backgroundImage = 'url("' + (assetPaths.get(match[2]) ?? match[2]) + '")'
  }
  const style = styleText(sectionStyles)
  return '<section id="section-' + id + '" aria-label="' + escapeHtml(section.name) + '" class="ds-section ds-section-' + escapeHtml(section.kind) + '"' + (style ? ' style="' + escapeHtml(style) + '"' : '') + '>\n' + content + '\n' + navigation + '\n</section>'
}

export function buildExportFiles(site: SiteDocument): ExportFiles {
  const pageFiles = new Map<string, string>()
  const used = new Set<string>()
  for (const page of site.pages) {
    if (page.isHomePage) { pageFiles.set(page.slug, 'index.html'); continue }
    const base = safeFileName(page.slug || page.name)
    let candidate = base + '.html'
    let suffix = 2
    while (used.has(candidate) || candidate === 'index.html') candidate = base + '-' + suffix++ + '.html'
    used.add(candidate)
    pageFiles.set(page.slug, candidate)
  }
  const assets: Record<string, Uint8Array> = {}
  const assetPaths = new Map<string, string>()
  const assetAltTexts = new Map((site.assets ?? []).map(asset => [asset.dataUrl, asset.altText]))
  let assetIndex = 0
  const registerImage = (dataUrl: string) => {
    if (assetPaths.has(dataUrl)) return
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/)
    if (!match) return
    const extension = match[1].includes('svg') ? '.svg' : match[1].includes('png') ? '.png' : match[1].includes('webp') ? '.webp' : match[1].includes('gif') ? '.gif' : '.jpg'
    const path = 'assets/image-' + (++assetIndex) + extension
    const binary = atob(match[2])
    assets[path] = Uint8Array.from(binary, character => character.charCodeAt(0))
    assetPaths.set(dataUrl, path)
  }
  for (const page of site.pages) for (const section of page.sections) {
    for (const component of section.components) if (component.kind === 'image') registerImage(component.content)
    const backgroundMatch = String(section.styles.backgroundImage ?? '').match(/^url\((['"]?)(data:image\/[a-zA-Z0-9.+-]+;base64,[\s\S]+?)\1\)$/)
    if (backgroundMatch) registerImage(backgroundMatch[2])
  }
  const htmlFiles: Record<string, string> = {}
  for (const page of site.pages) {
    const fileName = pageFiles.get(page.slug) ?? (page.isHomePage ? 'index.html' : safeFileName(page.name) + '.html')
    const body = page.sections.map(section => renderSection(section, pageFiles, site.pages, page, assetPaths, assetAltTexts)).join('\n')
    const title = escapeHtml(page.isHomePage ? (site.metadata.title || site.name) : page.name + ' | ' + site.name)
    htmlFiles[fileName] = '<!doctype html>\n<html lang="' + escapeHtml(site.metadata.language || 'en') + '">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <meta name="description" content="' + escapeHtml(site.metadata.description || '') + '">\n  <meta name="theme-color" content="' + escapeHtml(site.theme.primaryColor || '#171717') + '">\n  <meta property="og:type" content="website">\n  <meta property="og:title" content="' + title + '">\n  <meta property="og:description" content="' + escapeHtml(site.metadata.description || '') + '">\n  <meta name="twitter:card" content="summary">\n  <meta name="twitter:title" content="' + title + '">\n  <meta name="twitter:description" content="' + escapeHtml(site.metadata.description || '') + '">\n  <title>' + title + '</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <a class="ds-skip-link" href="#main-content">Skip to content</a>\n  <main class="ds-site" id="main-content">\n' + body + '\n  </main>\n  <script src="script.js" defer></script>\n</body>\n</html>'
  }
  const responsiveRules = site.pages.flatMap(page => page.sections.flatMap(section => section.components.flatMap(component => {
    if (!component.responsiveStyles) return []
    const selector = '.ds-element-' + component.id.replace(/[^a-zA-Z0-9_-]/g, '')
    return (['tablet', 'mobile'] as const).flatMap(device => {
      const declarations = styleText(component.responsiveStyles?.[device] ?? {})
      const rules = declarations.split(';').filter(Boolean).map(rule => rule + ' !important').join(';')
      return rules ? ['@media(max-width:' + (device === 'tablet' ? '900px' : '600px') + '){' + selector + '{' + rules + '}}'] : []
    })
  }))).join('\n')
  const headingFont = (site.theme.headingFont || 'Arial,Helvetica,sans-serif').replace(/[;{}]/g, '')
  const bodyFont = (site.theme.bodyFont || 'Arial,Helvetica,sans-serif').replace(/[;{}]/g, '')
  const css = ':root{font-family:' + bodyFont + ';color:' + (site.theme.textColor || '#262626') + ';background:' + (site.theme.backgroundColor || '#fff') + ';font-synthesis:none;text-rendering:optimizeLegibility}h1,h2,h3,h4,h5,h6{font-family:' + headingFont + '}*{box-sizing:border-box}body{margin:0}.ds-skip-link{position:absolute;left:12px;top:-60px;z-index:9999;padding:10px 14px;background:#fff;color:#111;border:2px solid #111;border-radius:6px}.ds-skip-link:focus{top:12px}.ds-site{width:100%;min-height:100vh}.ds-section{position:relative;background-repeat:no-repeat;background-position:center;background-size:cover}.ds-section-header{display:flex;align-items:center;justify-content:space-between;gap:24px}.ds-section-footer{color:#fff}.ds-navigation{display:flex;flex-wrap:wrap;gap:18px;align-items:center}.ds-navigation a{color:inherit;text-decoration:none}.ds-navigation a:hover{text-decoration:underline;text-underline-offset:4px}.ds-navigation a[aria-current=page]{font-weight:700;text-decoration:underline;text-underline-offset:4px}.ds-element{max-width:100%}.ds-element:focus-visible,.ds-navigation a:focus-visible,.ds-contact-form button:focus-visible{outline:3px solid #b58b4c;outline-offset:3px}.ds-contact-form{display:grid;gap:14px;max-width:520px}.ds-contact-form label{display:grid;gap:6px;font-size:14px}.ds-contact-form input,.ds-contact-form textarea{width:100%;padding:12px;border:1px solid #ccc;border-radius:6px;font:inherit}.ds-contact-form button{padding:12px 20px;border:0;cursor:pointer;background:' + (site.theme.accentColor || '#c99b45') + ';color:#171717;border-radius:' + (site.theme.buttonRadius || '8px') + '}.ds-form-note{font-size:13px;color:#555}.ds-section img{display:block;max-width:100%;height:auto;object-fit:cover}@keyframes dsqFadeIn{from{opacity:0}to{opacity:1}}@keyframes dsqSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}@keyframes dsqSlideIn{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}@keyframes dsqZoomIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}@media(max-width:900px){.ds-section[style*=grid-template-columns]{grid-template-columns:1fr!important}}@media(max-width:700px){.ds-section-header{align-items:flex-start;flex-direction:column}.ds-navigation{gap:12px}.ds-section[style*=grid-template-columns]{grid-template-columns:1fr!important}}@media(prefers-reduced-motion:reduce){.ds-section{animation:none!important;scroll-behavior:auto!important}}' + responsiveRules
  const js = "document.querySelectorAll('.ds-contact-form').forEach(function(form){form.addEventListener('submit',function(event){event.preventDefault();var note=form.querySelector('.ds-form-note');if(note)note.textContent='This form is a front-end preview. Connect a form service to receive messages.';});});"
  return { htmlFiles, css, js, assets }
}
