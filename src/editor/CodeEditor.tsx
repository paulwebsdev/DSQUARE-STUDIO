import { useMemo, useState, useEffect, useRef } from 'react'
import { Code2, Eye, FileCode2, FileText, Play, Save, ShieldCheck, Smartphone, Monitor, RotateCcw, X, WandSparkles, AlertCircle, CheckCircle2, Files, Palette, MousePointerClick, EyeOff } from 'lucide-react'
import { buildExportFiles } from './exportSite'
import { createId, type SiteDocument, type SiteCustomCode, type SitePage, type SiteCodeFile } from './types'

type Scope = 'site' | 'new' | `page:${string}`
type Props = { site: SiteDocument; activePageId: string; onApply: (scope: Scope, code: SiteCustomCode, pageName: string) => string | void; onProjectFilesChange: (files: SiteCodeFile[], folders: string[]) => void; onClose: () => void }
type CodeTab = 'html' | 'css' | 'javascript'
const emptyCode = (): SiteCustomCode => ({ html: '', css: '', javascript: '' })
const examples: Record<CodeTab, string> = {
  html: '<section class="custom-section">\n  <p class="custom-eyebrow">A CUSTOM SECTION</p>\n  <h2>Build something different.</h2>\n  <p>Add your own content to this website.</p>\n  <a class="custom-action" href="#section-contact">Explore more</a>\n</section>',
  css: '/* Change the existing website — these selectors already exist */\n.ds-section-hero { padding: 110px 6% !important; }\n.ds-section-header { position: sticky; top: 0; z-index: 1000; backdrop-filter: blur(16px); }\n.ds-element-button { border-radius: 999px !important; letter-spacing: .03em; }',
  javascript: '// Change existing content on the selected page\ndocument.querySelectorAll(".ds-section-hero h2").forEach((heading) => {\n  heading.textContent = "A fresh headline, written with code.";\n});\ndocument.querySelectorAll(".ds-element-button").forEach((button) => {\n  button.addEventListener("click", () => console.log("Custom interaction working!"));\n});',
}
const tabLabels: Record<CodeTab, string> = { html: 'HTML', css: 'CSS', javascript: 'JavaScript' }
type Diagnostic = { line: number; message: string; severity: 'error' | 'warning' }
type CodeSnapshot = { id: string; createdAt: string; scope: Scope; label: string; code: SiteCustomCode }
type SavedSnippet = { id: string; name: string; tab: CodeTab; source: string; createdAt: string }
type ProjectCodeFile = SiteCodeFile
function inspectCode(tab: CodeTab, source: string): Diagnostic[] {
  const issues: Diagnostic[] = []
  const lines = source.split('\n')
  if (tab === 'css') {
    let depth = 0
    lines.forEach((line, index) => {
      depth += (line.match(/{/g) ?? []).length - (line.match(/}/g) ?? []).length
      if (depth < 0) { issues.push({ line: index + 1, message: 'Unexpected closing brace.', severity: 'error' }); depth = 0 }
    })
    if (depth > 0) issues.push({ line: lines.length, message: 'A CSS block is missing a closing brace.', severity: 'error' })
    lines.forEach((line, index) => { if (/[^:]\b(?:colou?r|background|padding|margin)\s+[^:]+;/.test(line)) issues.push({ line: index + 1, message: 'Check this CSS declaration; it may be missing a colon.', severity: 'warning' }) })
  } else if (tab === 'html') {
    const stack: string[] = []
    const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'])
    const token = /<\/?([a-zA-Z][\w:-]*)\b[^>]*>/g
    let match: RegExpExecArray | null
    while ((match = token.exec(source))) {
      const raw = match[0]
      const tag = match[1].toLowerCase()
      if (raw.startsWith('</')) {
        const expected = stack.pop()
        if (expected && expected !== tag) issues.push({ line: source.slice(0, match.index).split('\n').length, message: 'Closing </' + tag + '> does not match <' + expected + '>.', severity: 'warning' })
      } else if (!voidTags.has(tag) && !raw.endsWith('/>')) stack.push(tag)
    }
    if (stack.length) issues.push({ line: lines.length, message: 'Possibly unclosed HTML tag: <' + stack[stack.length - 1] + '>.', severity: 'warning' })
  } else if (source.trim()) {
    try { new Function(source) } catch (error) {
      const message = error instanceof Error ? error.message : 'JavaScript syntax error.'
      const lineMatch = message.match(/line\s+(\\d+)/i)
      issues.push({ line: lineMatch ? Number(lineMatch[1]) : 1, message, severity: 'error' })
    }
  }
  return issues
}
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

export default function CodeEditor({ site, activePageId, onApply, onProjectFilesChange, onClose }: Props) {
  const [scope, setScope] = useState<Scope>(`page:${activePageId}`)
  const [code, setCode] = useState<SiteCustomCode>(() => getCode(site, `page:${activePageId}`))
  const [savedCode, setSavedCode] = useState<SiteCustomCode>(() => getCode(site, `page:${activePageId}`))
  const [pageName, setPageName] = useState('New page')
  const [previewPageId, setPreviewPageId] = useState(activePageId)
  const [tab, setTab] = useState<CodeTab>('css')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [ran, setRan] = useState(0)
  const [showCode, setShowCode] = useState(true)
  const [showExplorer, setShowExplorer] = useState(false)
  const [findOpen, setFindOpen] = useState(false)
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [focusMode, setFocusMode] = useState(false)
  const [showProblems, setShowProblems] = useState(true)
  const [wrapLines, setWrapLines] = useState(false)
  const [fontSize, setFontSize] = useState(12)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [message, setMessage] = useState('Editing code for the selected page.')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<CodeSnapshot[]>([])
  const [snippets, setSnippets] = useState<SavedSnippet[]>([])
  const [showSnippets, setShowSnippets] = useState(false)
  const snippetKey = `dsquare-code-snippets:${site.id}`
  const [projectFiles, setProjectFiles] = useState<ProjectCodeFile[]>(site.codeFiles ?? [])
  const [projectFolders, setProjectFolders] = useState<string[]>(site.codeFolders ?? [])
  const [activeProjectFile, setActiveProjectFile] = useState<string>('')
  const [fileDraft, setFileDraft] = useState('')
  const [fileSearch, setFileSearch] = useState('')
  const projectFileInput = useRef<HTMLInputElement>(null)
  useEffect(() => { setProjectFiles(site.codeFiles ?? []); setProjectFolders(site.codeFolders ?? []); setActiveProjectFile(current => (site.codeFiles ?? []).some(file => file.id === current) ? current : (site.codeFiles ?? [])[0]?.id ?? '') }, [site.codeFiles, site.codeFolders])
  const persistProjectFiles = (items: ProjectCodeFile[], folders = projectFolders) => { setProjectFiles(items); setProjectFolders(folders); onProjectFilesChange(items, folders) }
  const createProjectFile = () => { const name = window.prompt('New project file name (for example: components.js):')?.trim(); if (!name) return; if (!/^[a-zA-Z0-9._-]+$/.test(name) || name.startsWith('.')) { setMessage('Use a simple file name with letters, numbers, dots, dashes or underscores.'); return } if (projectFiles.some(file => file.name.toLowerCase() === name.toLowerCase())) { setMessage('A file with that name already exists.'); return } const extension = name.split('.').pop()?.toLowerCase(); const language: ProjectCodeFile['language'] = extension === 'html' ? 'html' : extension === 'css' ? 'css' : extension === 'js' ? 'javascript' : extension === 'json' ? 'json' : extension === 'svg' ? 'svg' : 'text'; const item = { id: createId('file'), name, path: name, content: '', language, updatedAt: new Date().toISOString() }; persistProjectFiles([...projectFiles, item]); setActiveProjectFile(item.id); setFileDraft(''); setMessage('Project file created and saved with this website.') }
  const saveProjectFile = () => { const items = projectFiles.map(file => file.id === activeProjectFile ? { ...file, content: fileDraft, updatedAt: new Date().toISOString() } : file); persistProjectFiles(items); setMessage('Project file saved with this website ✓') }
  const downloadProjectFile = (file: ProjectCodeFile) => { const blob = new Blob([file.content], { type: file.language === 'html' ? 'text/html' : file.language === 'css' ? 'text/css' : file.language === 'javascript' ? 'text/javascript' : file.language === 'json' ? 'application/json' : 'text/plain' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = file.name; anchor.click(); URL.revokeObjectURL(url) }
  const renameProjectFile = (file: ProjectCodeFile) => { const name = window.prompt('Rename project file:', file.name)?.trim(); if (!name || name === file.name) return; if (!/^[a-zA-Z0-9._-]+$/.test(name) || name.startsWith('.') || projectFiles.some(item => item.id !== file.id && item.name.toLowerCase() === name.toLowerCase())) { setMessage('That file name is invalid or already in use.'); return } persistProjectFiles(projectFiles.map(item => item.id === file.id ? { ...item, name, updatedAt: new Date().toISOString() } : item)); }
  const deleteProjectFile = (file: ProjectCodeFile) => { if (!window.confirm('Delete project file "' + file.name + '"?')) return; const next = projectFiles.filter(item => item.id !== file.id); persistProjectFiles(next); if (activeProjectFile === file.id) { setActiveProjectFile(next[0]?.id ?? ''); setFileDraft(next[0]?.content ?? '') } }
  useEffect(() => {
    try { const stored = localStorage.getItem(snippetKey); setSnippets(stored ? JSON.parse(stored) as SavedSnippet[] : []) }
    catch { setSnippets([]) }
  }, [snippetKey])
  const persistSnippets = (items: SavedSnippet[]) => {
    setSnippets(items)
    try { localStorage.setItem(snippetKey, JSON.stringify(items)) } catch { setMessage('Could not save snippet. Browser storage may be full.') }
  }
  const saveSnippet = () => {
    if (!current.trim()) { setMessage('Add some code before saving it as a snippet.'); return }
    const name = window.prompt('Name this reusable ' + tabLabels[tab] + ' snippet:')
    if (!name?.trim()) return
    const item: SavedSnippet = { id: createId('snippet'), name: name.trim(), tab, source: current, createdAt: new Date().toISOString() }
    persistSnippets([item, ...snippets])
    setShowSnippets(true)
    setMessage('Snippet saved on this device ✓')
  }
  const insertSnippet = (snippet: SavedSnippet) => {
    setTab(snippet.tab)
    const area = editorRef.current
    const useCursor = snippet.tab === tab
    const start = useCursor ? area?.selectionStart ?? code[snippet.tab].length : code[snippet.tab].length
    const end = useCursor ? area?.selectionEnd ?? start : start
    const source = code[snippet.tab]
    const before = source.slice(0, start)
    const after = source.slice(end)
    const separator = before && !before.endsWith('\\n') ? '\\n' : ''
    const insertion = separator + snippet.source + (after && !snippet.source.endsWith('\\n') ? '\\n' : '')
    const next = before + insertion + after
    setCode(previous => ({ ...previous, [snippet.tab]: next }))
    setMessage('Inserted snippet: ' + snippet.name + ' · save to apply')
    requestAnimationFrame(() => { if (area) { area.focus(); const position = before.length + insertion.length; area.setSelectionRange(position, position) } })
  }
  const historyKey = `dsquare-code-history:${site.id}`
  useEffect(() => {
    try { const stored = localStorage.getItem(historyKey); setHistory(stored ? JSON.parse(stored) as CodeSnapshot[] : []) }
    catch { setHistory([]) }
  }, [historyKey])
  const persistHistory = (items: CodeSnapshot[]) => {
    setHistory(items)
    try { localStorage.setItem(historyKey, JSON.stringify(items.slice(0, 30))) } catch { setMessage('History could not be saved. Browser storage may be full.') }
  }
  const restoreSnapshot = (snapshot: CodeSnapshot) => {
    if (!window.confirm(`Restore the saved code from ${new Date(snapshot.createdAt).toLocaleString()}? Your current unsaved changes will be replaced.`)) return
    if (snapshot.scope === 'new') { setMessage('This older snapshot cannot be restored because it was saved before the page was created.'); return }
    try {
      onApply(snapshot.scope, snapshot.code, snapshot.label)
      setScope(snapshot.scope)
      setCode({ ...snapshot.code })
      setSavedCode({ ...snapshot.code })
      setShowHistory(false)
      setMessage('Code restored from history ✓')
      setRan(value => value + 1)
    } catch { setMessage('Could not restore this snapshot. Please try again.') }
  }
  const current = code[tab]
  useEffect(() => { const file = projectFiles.find(item => item.id === activeProjectFile); setFileDraft(file?.content ?? '') }, [activeProjectFile, projectFiles])
  const diagnostics = useMemo(() => inspectCode(tab, current), [tab, current])
  const isDirty = scope === 'new' || code.html !== savedCode.html || code.css !== savedCode.css || code.javascript !== savedCode.javascript
  useEffect(() => {
    const next = getCode(site, scope)
    setCode(next)
    setSavedCode(next)
    if (scope.startsWith('page:')) setPreviewPageId(scope.slice(5))
    else if (scope === 'site') setPreviewPageId(activePageId)
    setMessage(scope === 'site' ? 'Changes apply across the entire website.' : scope === 'new' ? 'Create a new page and add your code.' : 'Editing code for ' + (site.pages.find(page => page.id === scope.slice(5))?.name ?? 'selected page') + '.')
  }, [scope, site, activePageId])
  const update = (value: string) => { setCode(previous => ({ ...previous, [tab]: value })); setMessage('Unsaved changes · preview updates as you type') }
  const formatCode = () => {
    const formatted = current.split('\n').map(line => line.trim()).join('\n').replace(/>\s*</g, '>\n<')
    setCode(previous => ({ ...previous, [tab]: formatted }))
    setMessage('Basic formatting applied · review before saving')
  }
  const replaceAll = () => {
    if (!findText) return
    update(current.split(findText).join(replaceText))
    setFindOpen(false)
    setMessage('Matching text replaced · save to apply')
  }
  const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      const target = event.currentTarget
      const start = target.selectionStart
      const end = target.selectionEnd
      update(current.slice(0, start) + '  ' + current.slice(end))
      requestAnimationFrame(() => { target.selectionStart = target.selectionEnd = start + 2 })
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); save() }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') { event.preventDefault(); setFindOpen(true) }
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); setRan(value => value + 1); setMessage('Preview refreshed from the current website build') }
  }
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
      const savedScope: Scope = scope === 'new' && newPageId ? `page:${newPageId}` : scope
      const label = scope === 'new' ? pageName.trim() || 'New page' : scope === 'site' ? 'Entire website' : site.pages.find(page => page.id === scope.slice(5))?.name ?? 'Page'
      const snapshot: CodeSnapshot = { id: createId('snapshot'), createdAt: new Date().toISOString(), scope: savedScope, label, code: { ...code } }
      persistHistory([snapshot, ...history].slice(0, 30))
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
  return <section className="code-workspace code-studio-overlay" aria-label="Website code editor">
    <header className="code-toolbar">
      <div className="code-heading"><span className="code-mark"><Code2 size={18}/></span><div><strong>Website Code Studio</strong><small>Apply code to one page, create a page, or redesign the whole website</small></div></div>
      <div className="code-toolbar-actions"><span className="code-save-status" aria-live="polite">{message}</span><button className="code-action secondary" onClick={()=>setShowExplorer(value=>!value)}><Files size={14}/> Files</button><button className="code-action secondary" onClick={()=>setShowHistory(value=>!value)}><RotateCcw size={14}/> History ({history.length})</button><button className="code-action secondary" onClick={()=>setShowCode(value=>!value)}><EyeOff size={14}/>{showCode?'Hide code':'Show code'}</button><button className="code-action secondary" onClick={reset}><RotateCcw size={14}/> Reset</button><button className="code-action primary" onClick={save} disabled={!isDirty}><Save size={14}/> {isDirty ? 'Save to website' : 'Saved'}</button><button className="code-action close" onClick={close} aria-label="Close code editor"><X size={16}/></button></div>
    </header>
    <div className="code-scope-bar"><label>Apply code to <select value={scope} onChange={event=>setScope(event.target.value as Scope)}><optgroup label="Existing pages">{site.pages.map(page=><option key={page.id} value={`page:${page.id}`}>{page.name}{page.isHomePage?' · Home':''}</option>)}</optgroup><optgroup label="Website-wide"><option value="site">Entire website · redesign all pages</option><option value="new">Create a new page</option></optgroup></select></label>{scope==='new'&&<label className="code-new-page-name">Page name <input value={pageName} onChange={event=>setPageName(event.target.value)} placeholder="e.g. Services"/></label>}<span>{scope==='site'?'HTML, CSS and JavaScript apply across every page.':scope==='new'?'Your new page will be added to the website and page navigation.':'Only this page will be changed; other pages stay untouched.'}</span></div>
    <div className={'code-body '+(!showCode?'hide-editor ':'')+(focusMode?'code-focus-mode':'')}>
      {showCode&&<div className="code-editor-pane">
        {showExplorer && <div className="code-project-explorer"><div className="code-explorer-title"><strong><Files size={14}/> Code locations</strong><span>Editable custom code</span></div><p>These are code scopes saved with your website, not physical files on your device.</p><button type="button" className={scope==='site'?'active':''} onClick={()=>setScope('site')}><FileCode2 size={13}/> Website-wide <small>site.html · site.css · site.js</small></button><div className="code-explorer-group">PAGES</div>{site.pages.map(page=><button type="button" key={page.id} className={scope===`page:${page.id}`?'active':''} onClick={()=>setScope(`page:${page.id}`)}><FileText size={13}/>{page.name}<small>{page.isHomePage?'index':'page'} · html / css / js</small></button>)}<button type="button" className={scope==='new'?'active':''} onClick={()=>setScope('new')}><span>＋</span> Create new page</button><div className="code-explorer-group">PROJECT FILES</div><div className="code-project-file-actions"><button type="button" onClick={createProjectFile}>＋ New file</button><button type="button" onClick={()=>projectFileInput.current?.click()}>↑ Import</button><input ref={projectFileInput} hidden type="file" multiple onChange={async event=>{const picked=Array.from(event.target.files??[]);const imported=await Promise.all(picked.map(async file=>({id:createId('file'),name:file.name.replace(/[^a-zA-Z0-9._-]/g,'_'),path:file.name.replace(/[^a-zA-Z0-9._-]/g,'_'),content:await file.text(),language:(file.name.endsWith('.html')?'html':file.name.endsWith('.css')?'css':file.name.endsWith('.js')?'javascript':file.name.endsWith('.json')?'json':file.name.endsWith('.svg')?'svg':'text') as ProjectCodeFile['language'],updatedAt:new Date().toISOString()})));const used=new Set(projectFiles.map(old=>old.name.toLowerCase()));const unique=imported.filter(file=>{const key=file.name.toLowerCase();if(used.has(key))return false;used.add(key);return true});persistProjectFiles([...projectFiles,...unique]);if(unique[0])setActiveProjectFile(unique[0].id);event.target.value='';setMessage('Imported '+unique.length+' project file(s).') }}/></div><input className="code-file-search" aria-label="Search project files" placeholder="Find project file…" value={fileSearch} onChange={event=>setFileSearch(event.target.value)}/>{projectFiles.filter(file=>file.name.toLowerCase().includes(fileSearch.toLowerCase())).map(file=><div className={'code-project-file '+(activeProjectFile===file.id?'active':'')} key={file.id}><button type="button" onClick={()=>setActiveProjectFile(file.id)}><FileText size={13}/>{file.name}</button><button type="button" title="Download" onClick={()=>downloadProjectFile(file)}>↓</button><button type="button" title="Rename" onClick={()=>renameProjectFile(file)}>✎</button><button type="button" title="Delete" onClick={()=>deleteProjectFile(file)}>×</button></div>)}{!projectFiles.length&&<small className="code-project-empty">No project files yet. Create or import files to manage them here.</small>}{projectFiles.some(file=>file.id===activeProjectFile)&&<div className="code-project-file-editor"><strong>{projectFiles.find(file=>file.id===activeProjectFile)?.name}</strong><textarea aria-label="Project file contents" value={fileDraft} onChange={event=>setFileDraft(event.target.value)} spellCheck={false}/><button type="button" onClick={saveProjectFile}>Save file</button></div>}<small className="code-project-note">Project files are stored with this website. Supported text files are included in website publishing exports under the project/ folder.</small></div>}
        <div className="code-tabs">{(['html','css','javascript'] as CodeTab[]).map(item=><button key={item} className={tab===item?'active':''} onClick={()=>setTab(item)}><FileCode2 size={14}/>{tabLabels[item]}<span>{(code[item]??'').trim()?'●':''}</span></button>)}</div>
        <div className="code-editor-meta"><span><FileText size={13}/>{tab==='javascript'?'script.js':tab==='html'?'custom.html':'styles.css'}</span><span>{lineCount} lines</span><div className="code-mini-actions"><button type="button" onClick={() => setFindOpen(value => !value)}>Find / replace</button><button type="button" onClick={formatCode}>Format</button><button type="button" onClick={() => setWrapLines(value => !value)}>{wrapLines ? "No wrap" : "Wrap"}</button><button type="button" onClick={() => setFontSize(value => Math.max(10, Math.min(20, value + 1)))}>A+</button><button type="button" onClick={() => setFontSize(value => Math.max(10, value - 1))}>A−</button><button type="button" onClick={() => setFocusMode(value => !value)}>{focusMode ? "Exit focus" : "Focus"}</button></div></div>{findOpen && <div className="code-search-row"><input aria-label="Find text" placeholder="Find…" value={findText} onChange={event => setFindText(event.target.value)}/><input aria-label="Replace text" placeholder="Replace with…" value={replaceText} onChange={event => setReplaceText(event.target.value)}/><button type="button" onClick={replaceAll}>Replace all</button></div>}
        <div className="code-input-wrap"><div className="code-line-numbers" aria-hidden="true">{Array.from({length:lineCount},(_,index)=><span key={index}>{index+1}</span>)}</div><textarea style={{fontSize,whiteSpace:wrapLines?"pre-wrap":"pre"}} ref={editorRef} onKeyDown={handleEditorKeyDown} className="code-input" spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" aria-label={tab+' source code'} value={current} onChange={event=>update(event.target.value)} placeholder={'Write '+tabLabels[tab]+' here…'}/></div>
        <div className="code-editor-foot"><ShieldCheck size={14}/> HTML adds content. CSS restyles existing sections. JavaScript changes content and interactions.<button type="button" onClick={()=>setShowProblems(value=>!value)}>{showProblems?"Hide":"Show"} diagnostics · {diagnostics.length}</button></div>{showProblems && <div className="code-problems" aria-live="polite"><div className="code-problems-heading"><strong><Files size={13}/> Problems</strong><span>{diagnostics.length ? diagnostics.length+" issue(s)" : "No issues detected"}</span></div>{diagnostics.length ? diagnostics.map((issue,index)=><div className={"code-problem "+issue.severity} key={index}><AlertCircle size={13}/><button type="button" onClick={()=>{const area=editorRef.current;if(area){const position=current.split("\n").slice(0,issue.line-1).reduce((sum,line)=>sum+line.length+1,0);area.focus();area.setSelectionRange(position,position)}}}>Line {issue.line}: {issue.message}</button></div>) : <div className="code-problem-clean"><CheckCircle2 size={13}/> No basic syntax issues found in this file.</div>}<small>These lightweight checks catch common mistakes; they do not replace a full browser console or language server.</small></div>}
        {showHistory && <div className="code-history-panel"><div className="code-history-heading"><strong><RotateCcw size={14}/> Saved code history</strong><button type="button" onClick={()=>setShowHistory(false)}>Close</button></div><p>Up to 30 successful saves are kept on this device for this website. Restoring a snapshot applies it to the website.</p>{history.length ? history.map(snapshot=><div className="code-history-item" key={snapshot.id}><div><strong>{snapshot.label}</strong><small>{new Date(snapshot.createdAt).toLocaleString()} · {snapshot.scope==='site'?'Website-wide':'Page code'}</small></div><button type="button" onClick={()=>restoreSnapshot(snapshot)}>Restore</button></div>) : <div className="code-history-empty">No saved snapshots yet. Save your code to create the first one.</div>}</div>}
        <div className="code-snippet-tools"><strong><WandSparkles size={14}/> Quick examples</strong><div><button onClick={()=>insertExample('css')}><Palette size={13}/> Restyle this website</button><button onClick={()=>insertExample('javascript')}><MousePointerClick size={13}/> Change existing content</button><button onClick={()=>insertExample('html')}><FileCode2 size={13}/> Add a new section</button></div><small>Examples replace code in the selected tab. Save to apply changes to the website.</small><div className="code-snippet-actions"><button type="button" onClick={saveSnippet}>＋ Save current {tabLabels[tab]} as snippet</button><button type="button" onClick={()=>setShowSnippets(value=>!value)}>My snippets ({snippets.length})</button></div>{showSnippets && <div className="code-snippet-list">{snippets.length ? snippets.map(snippet=><div className="code-snippet-item" key={snippet.id}><div><strong>{snippet.name}</strong><small>{tabLabels[snippet.tab]} · {new Date(snippet.createdAt).toLocaleDateString()}</small></div><button type="button" onClick={()=>insertSnippet(snippet)}>Insert</button><button type="button" aria-label={'Delete '+snippet.name} onClick={()=>{if(window.confirm('Delete snippet “'+snippet.name+'”?')) persistSnippets(snippets.filter(item=>item.id!==snippet.id))}}>Delete</button></div>) : <p>No saved snippets yet. Save useful code here to reuse it in any page of this website.</p>}</div>}</div>
      </div>}
      <div className="code-preview-pane">
        <div className="code-preview-head"><div><Eye size={15}/><strong>{scope==='site'?'Website-wide preview':scope==='new'?'New page preview':(site.pages.find(page=>page.id===scope.slice(5))?.name??'Page')+' preview'}</strong><span>Live · isolated</span></div>{scope==='site'&&<select className="code-preview-page-select" aria-label="Preview a website page" value={previewPageId} onChange={event=>setPreviewPageId(event.target.value)}>{site.pages.map(page=><option key={page.id} value={page.id}>{page.name}</option>)}</select>}<div className="code-preview-actions"><button className={device==='desktop'?'selected':''} onClick={()=>setDevice('desktop')} aria-label="Desktop preview"><Monitor size={15}/></button><button className={device==='mobile'?'selected':''} onClick={()=>setDevice('mobile')} aria-label="Mobile preview"><Smartphone size={15}/></button><button onClick={()=>{setRan(value=>value+1);setMessage('Preview refreshed')}}><Play size={13}/> Run</button></div></div>
        <div className="code-preview-frame-wrap"><iframe key={ran} title="Website code preview" sandbox="allow-scripts allow-forms" srcDoc={preview} className={'code-preview-frame '+(device==='mobile'?'mobile':'')}/></div>
      </div>
    </div>
  </section>
}
