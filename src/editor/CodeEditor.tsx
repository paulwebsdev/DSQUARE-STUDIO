import { useMemo, useState } from 'react'
import { Code2, Eye, FileCode2, FileText, Play, Save, ShieldCheck, Smartphone, Monitor, RotateCcw, X, WandSparkles, Palette, MousePointerClick } from 'lucide-react'
import { buildExportFiles } from './exportSite'
import type { SiteDocument, SiteCustomCode } from './types'

type Props = { site: SiteDocument; onApply: (code: SiteCustomCode) => void; onClose: () => void }
type CodeTab = 'html' | 'css' | 'javascript'

const examples: Record<CodeTab, string> = {
  html: '<section class="custom-section">\n  <p class="custom-eyebrow">A CUSTOM SECTION</p>\n  <h2>Build something different.</h2>\n  <p>Add your own content to this website.</p>\n  <a class="custom-action" href="#section-contact">Explore more</a>\n</section>',
  css: '/* Change the existing website — these selectors already exist */\n.ds-section-hero {\n  padding-top: 110px !important;\n  padding-bottom: 110px !important;\n}\n.ds-section-header {\n  position: sticky;\n  top: 0;\n  z-index: 1000;\n  backdrop-filter: blur(16px);\n}\n.ds-element-button {\n  border-radius: 999px !important;\n  letter-spacing: .03em;\n}',
  javascript: '// Change existing content on the page\ndocument.querySelectorAll(".ds-section-hero h2").forEach((heading) => {\n  heading.textContent = "A fresh headline, written with code.";\n});\n\ndocument.querySelectorAll(".ds-element-button").forEach((button) => {\n  button.addEventListener("click", () => {\n    console.log("Your custom interaction is working!");\n  });\n});',
}

const tabLabels: Record<CodeTab, string> = { html: 'HTML', css: 'CSS', javascript: 'JavaScript' }

export default function CodeEditor({ site, onApply, onClose }: Props) {
  const [code, setCode] = useState<SiteCustomCode>(() => ({ html: site.customCode?.html ?? '', css: site.customCode?.css ?? '', javascript: site.customCode?.javascript ?? '' }))
  const [tab, setTab] = useState<CodeTab>('css')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [ran, setRan] = useState(0)
  const [message, setMessage] = useState('Your full website is loaded. Add code to change it.')
  const [savedCode, setSavedCode] = useState<SiteCustomCode>(() => ({ html: site.customCode?.html ?? '', css: site.customCode?.css ?? '', javascript: site.customCode?.javascript ?? '' }))
  const current = code[tab]
  const isDirty = code.html !== savedCode.html || code.css !== savedCode.css || code.javascript !== savedCode.javascript
  const update = (value: string) => { setCode(previous => ({ ...previous, [tab]: value })); setMessage('Unsaved changes · preview updates as you type') }
  const insertExample = (target: CodeTab) => {
    setTab(target)
    setCode(previous => ({ ...previous, [target]: examples[target] }))
    setMessage(target === 'css' ? 'Example loaded: restyles your existing website' : target === 'javascript' ? 'Example loaded: changes existing page content' : 'Example loaded: adds a new section to the page')
    setRan(value => value + 1)
  }
  const preview = useMemo(() => {
    const files = buildExportFiles({ ...site, customCode: code })
    let html = files.htmlFiles['index.html'] ?? Object.values(files.htmlFiles)[0] ?? '<!doctype html><html><body><p>No page available to preview.</p></body></html>'
    const safeCss = btoa(unescape(encodeURIComponent(files.css)))
    const safeJs = btoa(unescape(encodeURIComponent(files.js)))
    html = html.replace('<link rel="stylesheet" href="styles.css">', '')
      .replace('<script src="script.js" defer></script>', '')
      .replace('</head>', '<style>html,body{margin:0;min-height:100%}</style></head>')
      .replace('</body>', '<script>(function(){var style=document.createElement("style");style.textContent=decodeURIComponent(escape(atob("' + safeCss + '")));document.head.append(style);try{(new Function(decodeURIComponent(escape(atob("' + safeJs + '")))))()}catch(error){var box=document.createElement("pre");box.setAttribute("role","alert");box.style.cssText="position:fixed;bottom:0;left:0;right:0;max-height:30vh;overflow:auto;background:#2a1010;color:#ffd7d7;padding:12px;z-index:999999;font:12px monospace;white-space:pre-wrap";box.textContent="JavaScript error: "+error.message;document.body.appendChild(box)}})();</script></body>')
    return html
  }, [site, code, ran])
  const save = () => {
    try {
      onApply(code)
      setSavedCode({ ...code })
      setMessage('Saved to this website ✓')
    } catch {
      setMessage('Could not save. Please try again.')
    }
  }
  const reset = () => { if (window.confirm('Clear all custom HTML, CSS and JavaScript for this website?')) { setCode({ html: '', css: '', javascript: '' }); setMessage('Code cleared · save to apply it') } }
  const close = () => {
    if (isDirty && !window.confirm('You have unsaved code changes. Close without saving?')) return
    onClose()
  }
  const lineCount = Math.max(1, current.split('\n').length)
  return <section className="code-workspace" aria-label="Website code editor">
    <header className="code-toolbar">
      <div className="code-heading"><span className="code-mark"><Code2 size={18}/></span><div><strong>Custom code</strong><small>Change the design you already have — or add something new</small></div></div>
      <div className="code-toolbar-actions"><span className="code-save-status" aria-live="polite">{message}</span><button className="code-action secondary" onClick={reset}><RotateCcw size={14}/> Reset</button><button className="code-action primary" onClick={save} disabled={!isDirty}><Save size={14}/> {isDirty ? 'Save code' : 'Saved'}</button><button className="code-action close" onClick={close} aria-label="Close code editor"><X size={16}/></button></div>
    </header>
    <div className="code-body">
      <div className="code-editor-pane">
        <div className="code-tabs">{(['html','css','javascript'] as CodeTab[]).map(item => <button key={item} className={tab===item?'active':''} onClick={()=>setTab(item)}><FileCode2 size={14}/>{tabLabels[item]}<span>{(code[item]??'').trim()?'●':''}</span></button>)}</div>
        <div className="code-editor-meta"><span><FileText size={13}/>{tab==='javascript'?'script.js':tab==='html'?'custom.html':'styles.css'}</span><span>{lineCount} lines</span></div>
        <div className="code-input-wrap"><div className="code-line-numbers" aria-hidden="true">{Array.from({length:lineCount},(_,index)=><span key={index}>{index+1}</span>)}</div><textarea className="code-input" spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" aria-label={tab+' source code'} value={current} onChange={event=>update(event.target.value)} placeholder={'Write '+tabLabels[tab]+' here…'} /></div>
        <div className="code-editor-foot"><ShieldCheck size={14}/> HTML adds content. CSS can restyle existing sections. JavaScript can change existing text, buttons and behaviour.</div>
        <div className="code-snippet-tools"><strong><WandSparkles size={14}/> Quick examples</strong><div><button onClick={()=>insertExample('css')}><Palette size={13}/> Restyle this website</button><button onClick={()=>insertExample('javascript')}><MousePointerClick size={13}/> Change existing content</button><button onClick={()=>insertExample('html')}><FileCode2 size={13}/> Add a new section</button></div><small>These examples replace the code in the selected tab. Save code to keep your changes.</small></div>
      </div>
      <div className="code-preview-pane">
        <div className="code-preview-head"><div><Eye size={15}/><strong>Full website preview</strong><span>Live · isolated</span></div><div className="code-preview-actions"><button className={device==='desktop'?'selected':''} onClick={()=>setDevice('desktop')} aria-label="Desktop preview"><Monitor size={15}/></button><button className={device==='mobile'?'selected':''} onClick={()=>setDevice('mobile')} aria-label="Mobile preview"><Smartphone size={15}/></button><button onClick={()=>{setRan(value=>value+1);setMessage('Preview refreshed')}}><Play size={13}/> Run</button></div></div>
        <div className="code-preview-frame-wrap"><iframe key={ran} title="Full website with custom code preview" sandbox="allow-scripts allow-forms" srcDoc={preview} className={'code-preview-frame '+(device==='mobile'?'mobile':'')} /></div>
      </div>
    </div>
  </section>
}
