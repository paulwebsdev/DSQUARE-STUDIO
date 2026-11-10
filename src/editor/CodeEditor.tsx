import { useMemo, useState } from 'react'
import { Code2, Eye, FileCode2, FileText, Play, Save, ShieldCheck, Smartphone, Monitor, RotateCcw, X } from 'lucide-react'
import { buildExportFiles } from './exportSite'
import type { SiteDocument, SiteCustomCode } from './types'

type Props = { site: SiteDocument; onApply: (code: SiteCustomCode) => void; onClose: () => void }
type CodeTab = 'html' | 'css' | 'javascript'

const starters: Record<CodeTab, string> = {
  html: '<section class="custom-section">\n  <p class="eyebrow">A CUSTOM SECTION</p>\n  <h2>Build something different.</h2>\n  <p>Add your own HTML to extend this website.</p>\n  <button class="custom-action" type="button">Explore more</button>\n</section>',
  css: '.custom-section {\n  padding: 72px 8%;\n  text-align: center;\n  background: #171717;\n  color: #fff;\n}\n.custom-section h2 {\n  font-size: clamp(2rem, 5vw, 4rem);\n}\n.custom-action {\n  padding: 12px 22px;\n  border: 0;\n  border-radius: 999px;\n  background: #d9b66f;\n  cursor: pointer;\n}',
  javascript: "document.querySelectorAll('.custom-action').forEach((button) => {\n  button.addEventListener('click', () => {\n    button.textContent = 'It works! ✓';\n  });\n});",
}

export default function CodeEditor({ site, onApply, onClose }: Props) {
  const [code, setCode] = useState<SiteCustomCode>(() => ({ html: site.customCode?.html ?? '', css: site.customCode?.css ?? '', javascript: site.customCode?.javascript ?? '' }))
  const [tab, setTab] = useState<CodeTab>('html')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [ran, setRan] = useState(0)
  const [message, setMessage] = useState('')
  const current = code[tab]
  const update = (value: string) => { setCode(previous => ({ ...previous, [tab]: value })); setMessage('Unsaved code changes') }
  const preview = useMemo(() => {
    const files = buildExportFiles({ ...site, customCode: code })
    let html = files.htmlFiles['index.html'] ?? Object.values(files.htmlFiles)[0] ?? '<!doctype html><html><body></body></html>'
    const safeCss = btoa(unescape(encodeURIComponent(files.css)))
    const safeJs = btoa(unescape(encodeURIComponent(files.js)))
    html = html.replace('<link rel="stylesheet" href="styles.css">', '')
      .replace('<script src="script.js" defer></script>', '')
      .replace('</head>', '<style>html,body{margin:0;min-height:100%}</style></head>')
      .replace('</body>', '<script>const style=document.createElement("style");style.textContent=decodeURIComponent(escape(atob("' + safeCss + '")));document.head.append(style);try{(new Function(decodeURIComponent(escape(atob("' + safeJs + '")))))()}catch(error){document.body.insertAdjacentHTML("beforeend","<pre style=\\"position:fixed;bottom:0;left:0;right:0;max-height:30vh;overflow:auto;background:#2a1010;color:#ffd7d7;padding:12px;z-index:999999;font:12px monospace\\">"+String(error).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))+"</pre>")}</script></body>')
    return html
  }, [site, code, ran])
  const reset = () => { if (window.confirm('Clear all custom HTML, CSS and JavaScript for this website?')) { setCode({ html: '', css: '', javascript: '' }); setMessage('Code cleared — save to apply it') } }
  const lineCount = Math.max(1, current.split('\n').length)
  return <section className="code-workspace" aria-label="Website code editor">
    <header className="code-toolbar">
      <div className="code-heading"><span className="code-mark"><Code2 size={18}/></span><div><strong>Custom code</strong><small>Extend this website with HTML, CSS and JavaScript</small></div></div>
      <div className="code-toolbar-actions"><span className="code-save-status">{message || 'Changes are kept in this editor until saved'}</span><button className="code-action secondary" onClick={reset}><RotateCcw size={14}/> Reset</button><button className="code-action primary" onClick={() => { onApply(code); setMessage('Code saved to this website') }}><Save size={14}/> Save code</button><button className="code-action close" onClick={onClose} aria-label="Close code editor"><X size={16}/></button></div>
    </header>
    <div className="code-body">
      <div className="code-editor-pane">
        <div className="code-tabs">{(['html','css','javascript'] as CodeTab[]).map(item => <button key={item} className={tab===item?'active':''} onClick={()=>setTab(item)}><FileCode2 size={14}/>{item==='javascript'?'JavaScript':item.toUpperCase()}<span>{(code[item]??'').trim()?'●':''}</span></button>)}</div>
        <div className="code-editor-meta"><span><FileText size={13}/>{tab==='javascript'?'script.js':tab==='html'?'custom.html':'styles.css'}</span><span>{lineCount} lines</span></div>
        <div className="code-input-wrap"><div className="code-line-numbers" aria-hidden="true">{Array.from({length:lineCount},(_,index)=><span key={index}>{index+1}</span>)}</div><textarea className="code-input" spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" aria-label={tab+' source code'} value={current} onChange={event=>update(event.target.value)} placeholder={starters[tab]} /></div>
        <div className="code-editor-foot"><ShieldCheck size={14}/> Runs in an isolated preview frame. Custom code can still affect visitors when you export the website.</div>
      </div>
      <div className="code-preview-pane">
        <div className="code-preview-head"><div><Eye size={15}/><strong>Live website preview</strong><span>Sandboxed</span></div><div className="code-preview-actions"><button className={device==='desktop'?'selected':''} onClick={()=>setDevice('desktop')} aria-label="Desktop preview"><Monitor size={15}/></button><button className={device==='mobile'?'selected':''} onClick={()=>setDevice('mobile')} aria-label="Mobile preview"><Smartphone size={15}/></button><button onClick={()=>setRan(value=>value+1)}><Play size={13}/> Run</button></div></div>
        <div className="code-preview-frame-wrap"><iframe key={ran} title="Custom code website preview" sandbox="allow-scripts allow-forms" srcDoc={preview} className={'code-preview-frame '+(device==='mobile'?'mobile':'')} /></div>
      </div>
    </div>
  </section>
}
