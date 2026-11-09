import type { SiteDocument, SiteComponent, SitePage, SiteSection, StyleMap } from './types'

export type ExportFiles = { htmlFiles: Record<string, string>; css: string; js: string; assets: Record<string, Uint8Array> }

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
const safeFileName = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page'
const safeHref = (value: string, pageFiles: Map<string, string>) => {
  const trimmed = value.trim().replace(/[\u0000-\u001f\u007f]/g, '')
  if (!trimmed || /^(?:\/\/|javascript:|data:|vbscript:|file:|blob:)/i.test(trimmed)) return '#'
  const path = trimmed.split(/[?#]/, 1)[0]
  const suffix = trimmed.slice(path.length)
  const internal = path.replace(/^\//, '').replace(/\.html$/i, '')
  const match = [...pageFiles.entries()].find(([slug]) => slug === internal)
  if (match) return match[1] + suffix
  if (/^(?:https?:|mailto:|tel:|#|\.\.?\/)/i.test(trimmed)) return trimmed
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return '#'
  return trimmed
}
const safeImageSource = (source: string, assetPaths: Map<string, string>) => {
  const packaged = assetPaths.get(source)
  if (packaged) return packaged
  if (/^https:\/\//i.test(source) || /^\.\.?\//.test(source) || source.startsWith('/')) return source
  return ''
}

const styleText = (styles: StyleMap = {}) => Object.entries(styles)
  .filter(([key, value]) => value !== undefined && /^[a-zA-Z-]+$/.test(key))
  .map(([key, value]) => key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase()) + ':' + String(value).replace(/[;{}<>\u0000-\u001f]/g, '').replace(/(?:expression|javascript)\s*:/gi, '').replace(/url\((?!["']?assets\/[a-z0-9._/-]+["']?\))[^)]*\)/gi, 'none'))
  .join(';')

function renderComponent(component: SiteComponent, pageFiles: Map<string, string>, assetPaths: Map<string, string>, assetAltTexts: Map<string, string>): string {
  const className = 'ds-element ds-element-' + component.id.replace(/[^a-zA-Z0-9_-]/g, '')
  const style = styleText(component.styles)
  const attrs = 'class="' + className + '"' + (style ? ' style="' + escapeHtml(style) + '"' : '')
  const content = escapeHtml(component.content)
  const href = component.linkTo ? safeHref(component.linkTo, pageFiles) : ''
  if (component.kind === 'heading') return '<h2 ' + attrs + '>' + content + '</h2>'
  if (component.kind === 'text') return '<p ' + attrs + '>' + content + '</p>'
  if (component.kind === 'button') { const hover = styleText(component.hoverStyles); const hoverRule = hover ? '<style>.' + className + ':hover{' + escapeHtml(hover) + '} .' + className + ':focus-visible{outline:2px solid currentColor;outline-offset:3px}</style>' : ''; const element = href ? '<a ' + attrs + ' href="' + escapeHtml(href) + '"' + (component.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + content + '</a>' : '<span ' + attrs + '>' + content + '</span>'; return hoverRule + element }
  if (component.kind === 'image') return '<img ' + attrs + ' src="' + escapeHtml(safeImageSource(component.content, assetPaths)) + '" alt="' + escapeHtml(assetAltTexts.has(component.content) ? (assetAltTexts.get(component.content) ?? '') : 'Website image') + '" loading="lazy" decoding="async">'
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
  const layout = String(sectionStyles.layout ?? '')
  const gridColumns = Number(sectionStyles.gridColumns ?? 2)
  if (layout === 'grid') {
    sectionStyles.display = 'grid'
    sectionStyles.gridTemplateColumns = 'repeat(' + Math.max(1, Math.min(4, gridColumns || 2)) + ', minmax(0, 1fr))'
  } else if (layout === 'flex') {
    sectionStyles.display = 'flex'
    sectionStyles.flexWrap = 'wrap'
    sectionStyles.gap = sectionStyles.gap ?? '20px'
  }
  delete sectionStyles.layout
  delete sectionStyles.gridColumns
  const backgroundImage = sectionStyles.backgroundImage
  if (backgroundImage) {
    const match = String(backgroundImage).match(/^url\((['"]?)(data:image\/[a-zA-Z0-9.+-]+;base64,[\s\S]+?)\1\)$/)
    if (match) {
      const packagedImage = assetPaths.get(match[2])
      sectionStyles.backgroundImage = packagedImage ? 'url("' + packagedImage + '")' : 'none'
    }
  }
  const style = styleText(sectionStyles)
  return '<section id="section-' + id + '" aria-label="' + escapeHtml(section.name) + '" data-ds-reveal="true" class="ds-section ds-section-' + escapeHtml(section.kind) + ' ds-reveal"' + (style ? ' style="' + escapeHtml(style) + '"' : '') + '>\n' + content + '\n' + navigation + '\n</section>'
}

export function buildExportFiles(site: SiteDocument): ExportFiles {
  const pageFiles = new Map<string, string>()
  const used = new Set<string>(['index.html'])
  for (const page of site.pages) {
    if (page.isHomePage) { pageFiles.set(page.slug, 'index.html'); continue }
    const base = safeFileName(page.slug || page.name)
    let candidate = base + '.html'
    let suffix = 2
    while (used.has(candidate.toLowerCase())) candidate = base + '-' + suffix++ + '.html'
    used.add(candidate.toLowerCase())
    pageFiles.set(page.slug, candidate)
  }
  const assets: Record<string, Uint8Array> = {}
  const assetPaths = new Map<string, string>()
  const assetAltTexts = new Map((site.assets ?? []).map(asset => [asset.dataUrl, asset.altText]))
  let assetIndex = 0
  const registerImage = (dataUrl: string) => {
    if (assetPaths.has(dataUrl)) return
    const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([a-zA-Z0-9+/]*={0,2})$/i)
    if (!match || !match[2]) return
    try {
      const extension = match[1].includes('svg') ? '.svg' : match[1].includes('png') ? '.png' : match[1].includes('webp') ? '.webp' : match[1].includes('gif') ? '.gif' : '.jpg'
      const binary = atob(match[2])
      const path = 'assets/image-' + (++assetIndex) + extension
      assets[path] = Uint8Array.from(binary, character => character.charCodeAt(0))
      assetPaths.set(dataUrl, path)
    } catch {
      // Skip malformed embedded images instead of failing the entire website export.
    }
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
    const contactSection = page.sections.find(section => section.kind === 'contact' && section.enabled)
    const floatingContact = contactSection ? '<a class="ds-float-contact" href="#section-' + escapeHtml(contactSection.id.replace(/[^a-zA-Z0-9_-]/g, '')) + '"><span>Let’s talk</span></a>' : ''
    htmlFiles[fileName] = '<!doctype html>\n<html lang="' + escapeHtml(site.metadata.language || 'en') + '">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <meta name="description" content="' + escapeHtml(site.metadata.description || '') + '">\n  <meta name="theme-color" content="' + escapeHtml(site.theme.primaryColor || '#171717') + '">\n  <meta property="og:type" content="website">\n  <meta property="og:title" content="' + title + '">\n  <meta property="og:description" content="' + escapeHtml(site.metadata.description || '') + '">\n  <meta name="twitter:card" content="summary">\n  <meta name="twitter:title" content="' + title + '">\n  <meta name="twitter:description" content="' + escapeHtml(site.metadata.description || '') + '">\n  <title>' + title + '</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <a class="ds-skip-link" href="#main-content">Skip to content</a>\n  <main class="ds-site" id="main-content">\n' + body + '\n' + floatingContact + '\n  <button class="ds-back-top" type="button" aria-label="Back to top">↑</button>\n  </main>\n  <script src="script.js" defer></script>\n</body>\n</html>'
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
  const headingFont = (site.theme.headingFont || 'Arial,Helvetica,sans-serif').replace(/[;{}<>\u0000-\u001f]/g, '')
  const bodyFont = (site.theme.bodyFont || 'Arial,Helvetica,sans-serif').replace(/[;{}<>\u0000-\u001f]/g, '')
  const safeThemeValue = (value: string | undefined, fallback: string) => (value || fallback).replace(/[;{}<>\u0000-\u001f]/g, '')
  const premiumMotionCss = '.ds-section-hero{position:relative;isolation:isolate}.ds-section-hero:before{content:"";position:absolute;z-index:0;pointer-events:none;width:min(58vw,680px);height:min(58vw,680px);right:-12%;top:-28%;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(94,234,212,.34),rgba(99,102,241,.22) 38%,rgba(236,72,153,.16) 62%,transparent 72%);filter:blur(28px);animation:dsqOrbDrift 12s ease-in-out infinite alternate}.ds-section-hero:after{content:"";position:absolute;z-index:0;pointer-events:none;left:-10%;bottom:-35%;width:55%;height:65%;border-radius:50%;background:radial-gradient(circle,rgba(201,155,69,.17),transparent 68%);filter:blur(22px);animation:dsqOrbDrift 15s ease-in-out infinite alternate-reverse}.ds-section-hero>*{position:relative;z-index:1}.ds-section-hero h2{background-image:linear-gradient(110deg,currentColor 5%,currentColor 42%,var(--ds-accent,#c99b45) 72%,currentColor 100%);background-size:220% auto;background-clip:text;-webkit-background-clip:text;animation:dsqGradientShift 9s ease-in-out infinite}.ds-element-button{position:relative;overflow:hidden;isolation:isolate;box-shadow:0 8px 24px rgba(0,0,0,.12)}.ds-element-button:before{content:"";position:absolute;inset:-2px;z-index:-1;border-radius:inherit;background:linear-gradient(115deg,transparent 15%,rgba(255,255,255,.42) 48%,transparent 78%);transform:translateX(-120%);transition:transform .65s ease}.ds-element-button:hover:before{transform:translateX(120%)}.ds-section-features>*{transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s ease,filter .35s ease}.ds-section-features>*:hover{filter:saturate(1.12)}.ds-float-contact{position:fixed;right:22px;bottom:24px;z-index:9997;display:inline-flex;align-items:center;gap:10px;padding:14px 20px;border:1px solid rgba(255,255,255,.35);border-radius:999px;background:linear-gradient(115deg,#111827,#263b50 45%,#6b4d83 78%,#c08b45);background-size:220% 220%;color:#fff;text-decoration:none;font-family:inherit;font-size:14px;font-weight:700;line-height:1.2;letter-spacing:.01em;box-shadow:0 12px 34px rgba(24,31,50,.28),0 0 26px rgba(99,102,241,.25);animation:dsqGradientShift 8s ease infinite,dsqFloat 4s ease-in-out infinite;transition:transform .25s ease,box-shadow .25s ease}.ds-float-contact:before{content:"✦";font-size:17px;color:#f8d58b}.ds-float-contact:hover{transform:translateY(-5px) scale(1.025);box-shadow:0 18px 42px rgba(24,31,50,.34),0 0 34px rgba(99,102,241,.38)}.ds-back-top{position:fixed;right:28px;bottom:88px;z-index:9996;width:44px;height:44px;border:1px solid rgba(255,255,255,.55);border-radius:50%;background:rgba(17,24,39,.86);backdrop-filter:blur(14px);color:#fff;font-size:21px;cursor:pointer;opacity:0;visibility:hidden;transform:translateY(10px);transition:opacity .25s ease,transform .25s ease,visibility .25s ease}.ds-back-top.is-visible{opacity:1;visibility:visible;transform:translateY(0)}.ds-back-top:hover{box-shadow:0 0 22px rgba(201,155,69,.45);transform:translateY(-3px)}@keyframes dsqGradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}@keyframes dsqOrbDrift{0%{transform:translate3d(0,0,0) scale(.94)}100%{transform:translate3d(-34px,26px,0) scale(1.08)}}@keyframes dsqFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}@media(max-width:600px){.ds-float-contact{right:14px;bottom:16px;padding:12px 16px;font-size:13px}.ds-back-top{right:20px;bottom:76px;width:40px;height:40px}.ds-section-hero:before{width:90vw;height:90vw;right:-30%;top:-12%}}@media(prefers-reduced-motion:reduce){.ds-section-hero:before,.ds-section-hero:after,.ds-section-hero h2,.ds-float-contact{animation:none!important}.ds-element-button:before{display:none}}'
  const css = ':root{font-family:' + bodyFont + ';color:' + safeThemeValue(site.theme.textColor, '#262626') + ';background:' + safeThemeValue(site.theme.backgroundColor, '#fff') + ';font-synthesis:none;text-rendering:optimizeLegibility}h1,h2,h3,h4,h5,h6{font-family:' + headingFont + '}*{box-sizing:border-box}body{margin:0}.ds-skip-link{position:absolute;left:12px;top:-60px;z-index:9999;padding:10px 14px;background:#fff;color:#111;border:2px solid #111;border-radius:6px}.ds-skip-link:focus{top:12px}.ds-site{width:100%;min-height:100vh}.ds-section{position:relative;background-repeat:no-repeat;background-position:center;background-size:cover}.ds-section-header{display:flex;align-items:center;justify-content:space-between;gap:24px}.ds-section-footer{color:#fff}.ds-navigation{display:flex;flex-wrap:wrap;gap:18px;align-items:center}.ds-navigation a{color:inherit;text-decoration:none}.ds-navigation a:hover{text-decoration:underline;text-underline-offset:4px}.ds-navigation a[aria-current=page]{font-weight:700;text-decoration:underline;text-underline-offset:4px}.ds-element{max-width:100%}.ds-element:focus-visible,.ds-navigation a:focus-visible,.ds-contact-form button:focus-visible{outline:3px solid #b58b4c;outline-offset:3px}.ds-contact-form{display:grid;gap:14px;max-width:520px}.ds-contact-form label{display:grid;gap:6px;font-size:14px}.ds-contact-form input,.ds-contact-form textarea{width:100%;padding:12px;border:1px solid #ccc;border-radius:6px;font:inherit}.ds-contact-form button{padding:12px 20px;border:0;cursor:pointer;background:' + safeThemeValue(site.theme.accentColor, '#c99b45') + ';color:#171717;border-radius:' + safeThemeValue(site.theme.buttonRadius, '8px') + '}.ds-form-note{font-size:13px;color:#555}.ds-section img{display:block;max-width:100%;height:auto;object-fit:cover}@keyframes dsqFadeIn{from{opacity:0}to{opacity:1}}@keyframes dsqSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}@keyframes dsqSlideIn{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}@keyframes dsqZoomIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}.ds-section-hero>*{animation:dsqSlideUp .75s ease both}.ds-section-hero>*:nth-child(2){animation-delay:.1s}.ds-section-hero>*:nth-child(3){animation-delay:.18s}.ds-section-hero>*:nth-child(4){animation-delay:.26s}.ds-section-features>*{animation:dsqSlideUp .7s ease both;transition:transform .28s ease,box-shadow .28s ease}.ds-section-features>*:hover{transform:translateY(-4px)}.ds-section-features>*:nth-child(2){animation-delay:.08s}.ds-section-features>*:nth-child(3){animation-delay:.16s}.ds-section-features>*:nth-child(4){animation-delay:.24s}.ds-section-gallery img{transition:transform .55s ease,filter .35s ease}.ds-section-gallery img:hover{transform:scale(1.035);filter:saturate(1.08)}.ds-section-testimonials>*{animation:dsqFadeIn .8s ease both}.ds-section-contact{background-image:radial-gradient(circle at 85% 20%,rgba(255,255,255,.13),transparent 32%)}@media(max-width:900px){.ds-section[style*=grid-template-columns]{grid-template-columns:1fr!important}}@media(max-width:700px){.ds-section-header{align-items:flex-start;flex-direction:column}.ds-navigation{gap:12px}.ds-section[style*=grid-template-columns]{grid-template-columns:1fr!important}}html{scroll-behavior:smooth}.ds-section{isolation:isolate}.ds-section-hero{overflow:hidden}.ds-section-gallery img{border-radius:inherit}.ds-section-features>*{border-radius:14px;transition:transform .3s ease,box-shadow .3s ease}.ds-section-features>*:hover{transform:translateY(-7px);box-shadow:0 18px 42px rgba(15,23,42,.12)}.ds-section-testimonials>*{position:relative}.ds-section-testimonials>*:before{content:"“";display:block;font-family:Georgia,serif;font-size:2.8rem;line-height:.8;color:var(--ds-accent,#b58b4c);opacity:.8}.ds-section-contact a,.ds-section-contact span{transition:transform .25s ease,filter .25s ease}.ds-section-contact a:hover,.ds-section-contact span:hover{transform:translateY(-2px);filter:brightness(1.08)}.ds-reveal>*{transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1)}.ds-motion-ready .ds-reveal:not(.is-visible)>*{opacity:0;transform:translateY(24px)}.ds-motion-ready .ds-reveal.is-visible>*:nth-child(2){transition-delay:.08s}.ds-motion-ready .ds-reveal.is-visible>*:nth-child(3){transition-delay:.16s}.ds-motion-ready .ds-reveal.is-visible>*:nth-child(4){transition-delay:.24s}.ds-section-header{z-index:5}.ds-navigation a{transition:opacity .2s ease,color .2s ease}.ds-navigation a:hover{opacity:.72}.ds-element-button{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;cursor:pointer;transition:transform .22s ease,box-shadow .22s ease,background-color .22s ease}.ds-element-button:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(0,0,0,.14)}@media(max-width:760px){.ds-section{overflow-wrap:anywhere}.ds-section-hero{min-height:0!important}.ds-section-header{gap:16px}.ds-navigation{width:100%;flex-wrap:wrap}.ds-section-features>*{min-width:0!important}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.ds-section,.ds-section>*{animation:none!important;transition:none!important}.ds-motion-ready .ds-reveal:not(.is-visible)>*{opacity:1;transform:none}}' + premiumMotionCss + responsiveRules
  const js = "document.documentElement.classList.add('ds-motion-ready');var revealItems=document.querySelectorAll('[data-ds-reveal]');if('IntersectionObserver'in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){var revealObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:0.08});revealItems.forEach(function(item){revealObserver.observe(item);});}else{revealItems.forEach(function(item){item.classList.add('is-visible');});}document.querySelectorAll('a[href^=\\\"#\\\"]').forEach(function(link){link.addEventListener('click',function(event){var target=document.querySelector(link.getAttribute('href'));if(target){event.preventDefault();target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}});});document.querySelectorAll('.ds-contact-form').forEach(function(form){form.addEventListener('submit',function(event){event.preventDefault();var note=form.querySelector('.ds-form-note');if(note)note.textContent='This form is a front-end preview. Connect a form service to receive messages.';});});document.querySelectorAll('.ds-back-top').forEach(function(button){var update=function(){button.classList.toggle('is-visible',window.scrollY>420);};window.addEventListener('scroll',update,{passive:true});update();button.addEventListener('click',function(){window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});});"
  return { htmlFiles, css, js, assets }
}
