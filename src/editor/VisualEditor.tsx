import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { ArrowLeft, Eye, Monitor, Tablet, Smartphone, Undo2, Redo2, Plus, Type, Image, MousePointer2, Layers3, Settings2, Trash2, ChevronDown, Save, Sparkles } from 'lucide-react'
import { createStarterSite } from './defaultSite'
import type { DeviceMode, SiteDocument, SiteSection } from './types'

type Props = { onExit: () => void }

const sectionOptions: { kind: SiteSection['kind']; label: string; description: string }[] = [
  { kind: 'hero', label: 'Hero', description: 'A bold introduction and call to action' },
  { kind: 'features', label: 'Features', description: 'Highlight services or benefits' },
  { kind: 'gallery', label: 'Gallery', description: 'Showcase images and projects' },
  { kind: 'testimonials', label: 'Testimonials', description: 'Build trust with client feedback' },
  { kind: 'pricing', label: 'Pricing', description: 'Present plans and packages' },
  { kind: 'contact', label: 'Contact', description: 'Help visitors get in touch' },
]

export default function VisualEditor({ onExit }: Props) {
  const [site, setSite] = useState<SiteDocument>(() => {
    try {
      const saved = localStorage.getItem('dsquare-editor-document')
      return saved ? JSON.parse(saved) as SiteDocument : createStarterSite()
    } catch { return createStarterSite() }
  })
  const [selectedId, setSelectedId] = useState(site.pages[0]?.sections[1]?.id ?? '')
  const [device, setDevice] = useState<DeviceMode>('desktop')
  const [panel, setPanel] = useState<'add' | 'layers' | 'settings'>('add')
  const [history, setHistory] = useState<SiteDocument[]>([])
  const [future, setFuture] = useState<SiteDocument[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [savedAt, setSavedAt] = useState('Just saved')
  const [previewMode, setPreviewMode] = useState(false)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)

  const page = site.pages[0]
  const selected = page?.sections.find(section => section.id === selectedId) ?? page?.sections[0]
  const selectedComponent = selected?.components.find(item => item.id === selectedComponentId)
  const selectedText = selectedComponent?.content ?? selected?.components.find(item => item.kind === 'heading')?.content ?? selected?.name ?? ''

  useEffect(() => {
    localStorage.setItem('dsquare-editor-document', JSON.stringify(site))
    setSavedAt('Saved just now')
  }, [site])

  const commit = (next: SiteDocument) => {
    setHistory(items => [...items.slice(-29), site])
    setFuture([])
    setSite({ ...next, updatedAt: new Date().toISOString() })
  }

  const updateSection = (sectionId: string, updater: (section: SiteSection) => SiteSection) => {
    commit({ ...site, pages: site.pages.map(p => ({ ...p, sections: p.sections.map(s => s.id === sectionId ? updater(s) : s) })) })
  }

  const addSection = (kind: SiteSection['kind']) => {
    const labels: Record<string, string> = { hero: 'Hero section', features: 'Features', gallery: 'Gallery', testimonials: 'Testimonials', pricing: 'Pricing', contact: 'Contact section' }
    const heading = kind === 'hero' ? 'Your next big idea starts here.' : labels[kind]
    const section: SiteSection = {
      id: globalThis.crypto?.randomUUID?.() ?? `section-${Date.now()}`,
      kind, name: labels[kind] ?? 'New section', enabled: true,
      styles: { padding: '72px 8%', backgroundColor: page.sections.length % 2 ? '#f6f3ed' : '#ffffff' },
      components: [
        { id: `heading-${Date.now()}`, kind: 'heading', content: heading, visible: true, styles: { fontSize: '2.4rem', fontWeight: '700', color: '#171717' } },
        { id: `text-${Date.now()}`, kind: 'text', content: 'Add your own content here to tell your story.', visible: true, styles: { fontSize: '1rem', color: '#666666' } },
      ],
    }
    commit({ ...site, pages: site.pages.map(p => ({ ...p, sections: [...p.sections.slice(0, -1), section, p.sections[p.sections.length - 1]] })) })
    setSelectedId(section.id)
    setPanel('layers')
    setShowAdd(false)
  }

  const updateHeading = (value: string) => {
    if (!selected) return
    updateSection(selected.id, section => ({
      ...section,
      components: section.components.map((item, index) => index === 0 && item.kind === 'heading' ? { ...item, content: value } : item),
    }))
  }

  const removeSection = () => {
    if (!selected || ['header', 'footer'].includes(selected.kind)) return
    const remaining = page.sections.filter(section => section.id !== selected.id)
    commit({ ...site, pages: site.pages.map(p => ({ ...p, sections: remaining })) })
    setSelectedId(remaining[1]?.id ?? remaining[0]?.id ?? '')
  }

  const moveSection = (direction: -1 | 1) => {
    if (!selected) return
    const index = page.sections.findIndex(s => s.id === selected.id)
    const target = index + direction
    if (target < 1 || target >= page.sections.length - 1) return
    const reordered = [...page.sections]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    commit({ ...site, pages: site.pages.map(p => ({ ...p, sections: reordered })) })
  }

  const undo = () => {
    const previous = history[history.length - 1]
    if (!previous) return
    setFuture(items => [site, ...items])
    setHistory(items => items.slice(0, -1))
    setSite(previous)
  }
  const redo = () => {
    const next = future[0]
    if (!next) return
    setHistory(items => [...items, site])
    setFuture(items => items.slice(1))
    setSite(next)
  }

  const canvasClass = useMemo(() => `editor-canvas device-${device}`, [device])

  return <div className={`visual-editor ${previewMode ? "preview-mode" : ""}`}>
    <header className="editor-topbar">
      <button className="editor-back" onClick={onExit}><ArrowLeft size={17} /><span>Back to studio</span></button>
      <div className="editor-project-name"><strong>{site.name}</strong><span><i /> {savedAt}</span></div>
      <div className="editor-top-actions">
        <button className="editor-tool" onClick={undo} disabled={!history.length} aria-label="Undo"><Undo2 size={17} /></button>
        <button className="editor-tool" onClick={redo} disabled={!future.length} aria-label="Redo"><Redo2 size={17} /></button>
        <button className="editor-preview" onClick={() => setPreviewMode(value => !value)}><Eye size={15} /> {previewMode ? "Exit preview" : "Preview"}</button>
        <button className="primary-button editor-save" onClick={() => { localStorage.setItem('dsquare-editor-document', JSON.stringify(site)); setSavedAt('Saved just now') }}><Save size={14} /> Save</button>
      </div>
    </header>
    <div className="editor-workspace">
      <aside className="editor-left-panel">
        <div className="editor-panel-tabs">
          <button className={panel === 'add' ? 'active' : ''} onClick={() => setPanel('add')}><Plus size={15} /> Add</button>
          <button className={panel === 'layers' ? 'active' : ''} onClick={() => setPanel('layers')}><Layers3 size={15} /> Layers</button>
        </div>
        {panel === 'add' ? <div className="editor-panel-content"><div className="editor-panel-heading"><strong>Sections</strong><span>BUILD YOUR PAGE</span></div>{sectionOptions.map(item => <button className="add-section-item" key={item.kind} onClick={() => addSection(item.kind)}><span className="add-section-icon">{item.kind === 'gallery' ? <Image size={17} /> : item.kind === 'hero' ? <MousePointer2 size={17} /> : <Type size={17} />}</span><span><strong>{item.label}</strong><small>{item.description}</small></span><Plus size={14} /></button>)}</div> : <div className="editor-panel-content"><div className="editor-panel-heading"><strong>Page layers</strong><span>{page.sections.length} SECTIONS</span></div>{page.sections.map((section, index) => <button key={section.id} className={selected?.id === section.id ? 'layer-item selected' : 'layer-item'} onClick={() => setSelectedId(section.id)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{section.name}</strong><small>{section.kind}</small></button>)}</div>}
        <div className="editor-panel-foot"><Sparkles size={14} /> Select a section to edit its content.</div>
      </aside>
      <main className="editor-stage">
        <div className="editor-stage-toolbar"><div><span className="editor-page-pill">Home page <ChevronDown size={13} /></span><span className="editor-stage-muted">/</span><span className="editor-stage-muted">Editing</span></div><div className="device-switch"><button className={device === 'desktop' ? 'selected' : ''} onClick={() => setDevice('desktop')} aria-label="Desktop preview"><Monitor size={16} /></button><button className={device === 'tablet' ? 'selected' : ''} onClick={() => setDevice('tablet')} aria-label="Tablet preview"><Tablet size={16} /></button><button className={device === 'mobile' ? 'selected' : ''} onClick={() => setDevice('mobile')} aria-label="Mobile preview"><Smartphone size={16} /></button></div></div>
        <div className="editor-canvas-wrap"><div className={canvasClass}>
          {page.sections.filter(section => section.enabled).map(section => <section key={section.id} onClick={() => { setSelectedId(section.id); setSelectedComponentId(null) }} className={`site-preview-section ${selected?.id === section.id ? 'is-selected' : ''} section-${section.kind}`} style={section.styles}>
            {section.components.filter(item => item.visible).map(item => { const selectItem = (event: MouseEvent) => { event.stopPropagation(); setSelectedId(section.id); setSelectedComponentId(item.id) }; const selectedClass = selectedComponentId === item.id ? 'component-selected' : ''; return item.kind === 'heading' ? <h2 key={item.id} className={selectedClass} onClick={selectItem} style={item.styles}>{item.content}</h2> : item.kind === 'text' ? <p key={item.id} className={selectedClass} onClick={selectItem} style={item.styles}>{item.content}</p> : item.kind === 'button' ? <button key={item.id} className={selectedClass} onClick={selectItem} style={item.styles}>{item.content}</button> : item.kind === 'image' ? <img key={item.id} className={selectedClass} onClick={selectItem} style={item.styles} src={item.content} alt="Website content" /> : null })}
            {section.components.length === 0 && <span className="site-preview-placeholder">{section.name}</span>}
            <span className="section-selection-label">{section.name}</span>
          </section>)}
        </div></div>
      </main>
      <aside className="editor-right-panel"><div className="editor-properties-heading"><div><Settings2 size={16} /><strong>Properties</strong></div><span>SECTION</span></div>{selected ? <div className="editor-properties">
        <label className="property-label">Section name<input value={selected.name} onChange={e => updateSection(selected.id, section => ({ ...section, name: e.target.value }))} /></label>
        <label className="property-label">{selectedComponent ? `${selectedComponent.kind} content` : 'Heading text'}<textarea rows={3} value={selectedText} onChange={e => updateHeading(e.target.value)} /></label>
        <label className="property-label">Background colour<div className="colour-input"><input type="color" value={selected.styles.backgroundColor ?? '#ffffff'} onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, backgroundColor: e.target.value } }))} /><span>{selected.styles.backgroundColor ?? '#ffffff'}</span></div></label>
        <label className="property-label">Section spacing<select value={selected.styles.padding ?? '72px 8%'} onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, padding: e.target.value } }))}><option value="40px 6%">Compact</option><option value="72px 8%">Comfortable</option><option value="112px 8%">Spacious</option></select></label>
        <div className="property-actions"><button onClick={() => moveSection(-1)} title="Move up">↑ Move up</button><button onClick={() => moveSection(1)} title="Move down">↓ Move down</button></div>
        <button className="remove-section" onClick={removeSection} disabled={['header','footer'].includes(selected.kind)}><Trash2 size={14} /> Remove section</button>
      </div> : <p className="editor-no-selection">Choose a section on the canvas.</p>}</aside>
    </div>
    <div className="editor-mobile-add"><button onClick={() => setShowAdd(true)}><Plus size={16} /> Add section</button><button onClick={() => setPanel('layers')}><Layers3 size={16} /> Layers</button><button onClick={() => setPanel('settings')}><Settings2 size={16} /> Settings</button></div>
    {showAdd && <div className="editor-add-sheet"><div><strong>Add a section</strong><button onClick={() => setShowAdd(false)}>Close</button></div>{sectionOptions.map(item => <button key={item.kind} onClick={() => addSection(item.kind)}>{item.label}<Plus size={15} /></button>)}</div>}
  </div>
}
