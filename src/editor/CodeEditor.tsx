import { useMemo, useState, useEffect } from 'react'
import { Code2, Eye, FileCode2, FileText, Play, Save, ShieldCheck, Smartphone, Monitor, RotateCcw, X, WandSparkles, Palette, MousePointerClick, EyeOff } from 'lucide-react'
import { buildExportFiles } from './exportSite'
import { createId, type SiteDocument, type SiteCustomCode, type SitePage } from './types'

type Scope = 'site' | 'new' | `page:${string}`
type Props = { site: SiteDocument; activePageId: string; onApply: (scope: Scope, code: SiteCustomCode, pageName: string) => string | void; onClose: () => void }
type CodeTab = 'html' | 'css' | 'javascript'
const emptyCode = (): SiteCustomCode => ({ html: '', css: '', javascript: '' })
const examples: Record<CodeTab, string> = {
  html: '<section class="custom-section">\n  <p class="custom-eyebrow">A CUSTOM SECTION</p>\n  <h2>Build something different.</h2>\n  <p>Add your own content to this website.</p>\n  <a class="custom-action" href="#section-contact">Explore more</a>\n</section>',
  css: '/* Change the existing website — these selectors already exist */\n.ds-section-hero { padding: 110px 6% !important; }\n.ds-section-header { position: sticky; top: 0; z-index: 1000; backdrop-filter: blur(16px); }\n.ds-element-button { border-radius: 999px !important; letter-spacing: .03em; }',
  javascript: '// Change existing content on the selected page\ndocument.querySelectorAll(".ds-section-hero h2").forEach((heading) => {\n  heading.textContent = "A fresh headline, written with code.";\n});\ndocument.querySelectorAll(".ds-element-button").forEach((button) => {\n  button.addEventListener("click", () => console.log("Custom interaction working!"));\n});',
}
const tabLabels: Record<CodeTab, string> = { html: 'HTML', css: 'CSS', javascript: 'JavaScript' }
const blankPage = (name: string, code: SiteCustomCode, home?: SitePage): SitePage => {
  const base = name.trim() || 'New page'
  const slugBase = base.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new-page'
  const shared = (home?.sections ?? []).filter(section => section.kind === 'header' || section.kind === 'footer').map(section => ({ ...section, id: createId('section'), components: section.components.map(component => ({ ...component, id: createId('component') })) }))
  return { id: createId('page'), name: base, slug: '/' + slugBase, isHomePage: false, sections: shared, customCode: code }
}
const getCode = (site: SiteDocument, scope: Scope): SiteCustomCode => {
  if (scope === 'site') return { ...emptyCode(), ...(site.customCode ?? {}) }
  if (scope === 'new') return emptyCode()
  const page = site.pages.find(item => item.id === scope.slice(5))
  return { ...emptyCode(), ...(page?.customCode ?? {}) }
}
const pageFileName = (page: SitePage, files: Record<string, string>) => {
  if (page.isHomePage && files['index.html']) return 'index.html'
  const slug = page.slug.replace(/^\//, '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || page.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return Object.keys(files).find(file => file === slug + '.html' || file.startsWith(slug + '-')) ?? Object.keys(files)[0]
}

export default function CodeEditor({ site, activePageId, onApply, onClose }: Props) {
  const [scope, setScope] = useState<Scope>(`page:${activePageId}`)
  const [code, setCode] = useState<SiteCustomCode>(() => getCode(site, `page:${activePageId}`))
  const [savedCode, setSavedCode] = useState<SiteCustomCode>(() => getCode(site, `page:${activePageId}`))
  const [pageName, setPageName] = useState('New page')
  const [previewPageId, setPreviewPageId] = useState(activePageId)
  const [tab, setTab] = useState<CodeTab>('css')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [ran, setRan] = useState(0)
  const [showCode, setShowCode] = useState(true)
  const [message, setMessage] = useState('Editing code for the selected page.')
  const current = code[tab]
  const isDirty = scope === 'new' || code.html !== savedCode.html || code.css !== savedCode.css || code.javascript !== savedCode.javascript
  useEffect(() => {
    const next = getCode(site, scope)
    setCode(next)
    setSavedCode(next)
    if (scope.startsWith('page:')) setPreviewPageId(scope.slice(5))
    else if (scope === 'site') setPreviewPageId(activePageId)
    setMessage(scope === 'site' ? 'Changes apply across the entire website.' : scope === 'new' ? 'Create a new page and add your code.' : 'Editing code for ' + (site.pages.find(page => page.id === scope.slice(5))?.name ?? 'selected page') + '.')
  }, [scope, site])
  const update = (value: string) => { setCode(previous => ({ ...previous, [tab]: value })); setMessage('Unsaved changes · preview updates as you type') }
  const insertExample = (target: CodeTab) => {
    setTab(target)
    setCode(previous => ({ ...previous, [target]: examples[target] }))
    setMessage(target === 'css' ? 'Example loaded: restyles existing sections' : target === 'javascript' ? 'Example loaded: changes existing page content' : 'Example loaded: adds a new section')
    setRan(value => value + 1)
  }
  const preview = useMemo(() => {
    const previewPage = scope === 'new'
      ? blankPage(pageName, code, site.pages.find(page => page.isHomePage))
      : site.pages.find(page => page.id === (scope === 'site' ? previewPageId : scope.slice(5))) ?? site.pages[0]
    const previewSite: SiteDocument = scope === 'site'
      ? { ...site, customCode: code }
      : scope === 'new'
        ? { ...site, pages: [...site.pages, previewPage], customCode: site.customCode }
        : { ...site, pages: site.pages.map(page => page.id === previewPage.id ? { ...page, customCode: code } : page) }
    const files = buildExportFiles(previewSite)
    let html = files.htmlFiles[pageFileName(previewPage, files.htmlFiles)] ?? '<!doctype html><html><body><p>No page available to preview.</p></body></html>'
    const safeCss = btoa(unescape(encodeURIComponent(files.css)))
    const safeJs = btoa(unescape(encodeURIComponent(files.js)))
    html = html.replace('<link rel="stylesheet" href="styles.css">', '')
      .replace('<script src="script.js" defer></script>', '')
      .replace('</head>', '<style>html,body{margin:0;min-height:100%}</style></head>')
      .replace('</body>', '<script>(function(){var style=document.createElement("style");style.textContent=decodeURIComponent(escape(atob("' + safeCss + '")));document.head.append(style);try{(new Function(decodeURIComponent(escape(atob("' + safeJs + '")))))()}catch(error){var box=document.createElement("pre");box.setAttribute("role","alert");box.style.cssText="position:fixed;bottom:0;left:0;right:0;max-height:30vh;overflow:auto;background:#2a1010;color:#ffd7d7;padding:12px;z-index:999999;font:12px monospace;white-space:pre-wrap";box.textContent="JavaScript error: "+error.message;document.body.appendChild(box)}})();</script></body>')
    return html
  }, [site, scope, code, pageName, activePageId, previewPageId, ran])
  const save = () => {
    try {
      const newPageId = onApply(scope, code, pageName)
      setSavedCode({ ...code })
      setMessage(scope === 'site' ? 'Saved to the entire website ✓' : scope === 'new' ? 'New page added to your website ✓' : 'Saved to ' + (site.pages.find(page => page.id === scope.slice(5))?.name ?? 'page') + ' ✓')
      if (scope === 'new' && newPageId) setScope(`page:${newPageId}`)
    } catch {
      setMessage('Could not save. Please try again.')
    }
  }
  const reset = () => { if (window.confirm('Clear the custom code in this selected location?')) { setCode(emptyCode()); setMessage('Code cleared · save to apply it') } }
  const close = () => { if (isDirty && !window.confirm('You have unsaved code changes. Close without saving?')) return; onClose() }
  const lineCount = Math.max(1, current.split('\n').length)
  return <section className="code-workspace" aria-label="Website code editor">
    <header className="code-toolbar">
      <div className="code-heading"><span className="code-mark"><Code2 size={18}/></span><div><strong>Website Code Studio</strong><small>Apply code to one page, create a page, or redesign the whole website</small></div></div>
      <div className="code-toolbar-actions"><span className="code-save-status" aria-live="polite">{message}</span><button className="code-action secondary" onClick={()=>setShowCode(value=>!value)}><EyeOff size={14}/>{showCode?'Hide code':'Show code'}</button><button className="code-action secondary" onClick={reset}><RotateCcw size={14}/> Reset</button><button className="code-action primary" onClick={save} disabled={!isDirty}><Save size={14}/> {isDirty ? 'Save to website' : 'Saved'}</button><button className="code-action close" onClick={close} aria-label="Close code editor"><X size={16}/></button></div>
    </header>
    <div className="code-scope-bar"><label>Apply code to <select value={scope} onChange={event=>setScope(event.target.value as Scope)}><optgroup label="Existing pages">{site.pages.map(page=><option key={page.id} value={`page:${page.id}`}>{page.name}{page.isHomePage?' · Home':''}</option>)}</optgroup><optgroup label="Website-wide"><option value="site">Entire website · redesign all pages</option><option value="new">Create a new page</option></optgroup></select></label>{scope==='new'&&<label className="code-new-page-name">Page name <input value={pageName} onChange={event=>setPageName(event.target.value)} placeholder="e.g. Services"/></label>}<span>{scope==='site'?'HTML, CSS and JavaScript apply across every page.':scope==='new'?'Your new page will be added to the website and page navigation.':'Only this page will be changed; other pages stay untouched.'}</span></div>
    <div className={'code-body '+(!showCode?'hide-editor':'')}>
      {showCode&&<div className="code-editor-pane">
        <div className="code-tabs">{(['html','css','javascript'] as CodeTab[]).map(item=><button key={item} className={tab===item?'active':''} onClick={()=>setTab(item)}><FileCode2 size={14}/>{tabLabels[item]}<span>{(code[item]??'').trim()?'●':''}</span></button>)}</div>
        <div className="code-editor-meta"><span><FileText size={13}/>{tab==='javascript'?'script.js':tab==='html'?'custom.html':'styles.css'}</span><span>{lineCount} lines</span></div>
        <div className="code-input-wrap"><div className="code-line-numbers" aria-hidden="true">{Array.from({length:lineCount},(_,index)=><span key={index}>{index+1}</span>)}</div><textarea className="code-input" spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" aria-label={tab+' source code'} value={current} onChange={event=>update(event.target.value)} placeholder={'Write '+tabLabels[tab]+' here…'}/></div>
        <div className="code-editor-foot"><ShieldCheck size={14}/> HTML adds content. CSS restyles existing sections. JavaScript changes content and interactions.</div>
        <div className="code-snippet-tools"><strong><WandSparkles size={14}/> Quick examples</strong><div><button onClick={()=>insertExample('css')}><Palette size={13}/> Restyle this website</button><button onClick={()=>insertExample('javascript')}><MousePointerClick size={13}/> Change existing content</button><button onClick={()=>insertExample('html')}><FileCode2 size={13}/> Add a new section</button></div><small>Examples replace code in the selected tab. Save to apply changes to the website.</small></div>
      </div>}
      <div className="code-preview-pane">
        <div className="code-preview-head"><div><Eye size={15}/><strong>{scope==='site'?'Website-wide preview':scope==='new'?'New page preview':(site.pages.find(page=>page.id===scope.slice(5))?.name??'Page')+' preview'}</strong><span>Live · isolated</span></div>{scope==='site'&&<select className="code-preview-page-select" aria-label="Preview a website page" value={previewPageId} onChange={event=>setPreviewPageId(event.target.value)}>{site.pages.map(page=><option key={page.id} value={page.id}>{page.name}</option>)}</select>}<div className="code-preview-actions"><button className={device==='desktop'?'selected':''} onClick={()=>setDevice('desktop')} aria-label="Desktop preview"><Monitor size={15}/></button><button className={device==='mobile'?'selected':''} onClick={()=>setDevice('mobile')} aria-label="Mobile preview"><Smartphone size={15}/></button><button onClick={()=>{setRan(value=>value+1);setMessage('Preview refreshed')}}><Play size={13}/> Run</button></div></div>
        <div className="code-preview-frame-wrap"><iframe key={ran} title="Website code preview" sandbox="allow-scripts allow-forms" srcDoc={preview} className={'code-preview-frame '+(device==='mobile'?'mobile':'')}/></div>
      </div>
    </div>
  </section>
}
