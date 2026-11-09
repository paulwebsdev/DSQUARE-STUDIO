import { useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { ArrowLeft, Eye, Monitor, Tablet, Smartphone, Undo2, Redo2, Plus, Type, Image, MousePointer2, Layers3, Settings2, Trash2, Save, Sparkles } from 'lucide-react'
import { createStarterSite } from './defaultSite'
import type { DeviceMode, SiteDocument, SiteSection } from './types'

type Props = { onExit: () => void; projectId: string; projectName: string; category: string }

const sectionOptions: { kind: SiteSection['kind']; label: string; description: string }[] = [
  { kind: 'hero', label: 'Hero', description: 'A bold introduction and call to action' },
  { kind: 'features', label: 'Features', description: 'Highlight services or benefits' },
  { kind: 'gallery', label: 'Gallery', description: 'Showcase images and projects' },
  { kind: 'testimonials', label: 'Testimonials', description: 'Build trust with client feedback' },
  { kind: 'pricing', label: 'Pricing', description: 'Present plans and packages' },
  { kind: 'contact', label: 'Contact', description: 'Help visitors get in touch' },
]

export default function VisualEditor({ onExit, projectId, projectName, category }: Props) {
  const storageKey = `dsquare-editor-document:${projectId}`
  const [site, setSite] = useState<SiteDocument>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) as SiteDocument : createStarterSite(projectName, category)
    } catch { return createStarterSite(projectName, category) }
  })
  const [selectedId, setSelectedId] = useState(site.pages[0]?.sections[1]?.id ?? '')
  const [activePageId, setActivePageId] = useState(site.pages[0]?.id ?? '')
  const [device, setDevice] = useState<DeviceMode>('desktop')
  const [panel, setPanel] = useState<'add' | 'layers' | 'settings'>('add')
  const [history, setHistory] = useState<SiteDocument[]>([])
  const [future, setFuture] = useState<SiteDocument[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [savedAt, setSavedAt] = useState('Just saved')
  const [previewMode, setPreviewMode] = useState(false)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const page = site.pages.find(item => item.id === activePageId) ?? site.pages[0]
  const selected = page?.sections.find(section => section.id === selectedId) ?? page?.sections[0]
  const selectedComponent = selected?.components.find(item => item.id === selectedComponentId)
  const selectedText = selectedComponent?.content ?? selected?.components.find(item => item.kind === 'heading')?.content ?? selected?.name ?? ''

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(site))
    setSavedAt('Saved just now')
  }, [site])

  const commit = (next: SiteDocument) => {
    setHistory(items => [...items.slice(-29), site])
    setFuture([])
    setSite({ ...next, updatedAt: new Date().toISOString() })
  }

  const addPage = () => {
    const pageNumber = site.pages.length + 1
    const pageName = `New page ${pageNumber}`
    const newPage = {
      id: globalThis.crypto?.randomUUID?.() ?? `page-${Date.now()}`,
      name: pageName,
      slug: `page-${pageNumber}`,
      isHomePage: false,
      sections: [
        { id: `header-${Date.now()}`, kind: 'header' as const, name: 'Header', enabled: true, styles: { padding: '24px 8%', backgroundColor: '#171717' }, components: [{ id: `brand-${Date.now()}`, kind: 'heading' as const, content: site.name, visible: true, styles: { color: '#ffffff', fontSize: '1.4rem' } }] },
        { id: `hero-${Date.now()}`, kind: 'hero' as const, name: 'Page introduction', enabled: true, styles: { padding: '96px 8%', backgroundColor: '#f3eee5' }, components: [{ id: `title-${Date.now()}`, kind: 'heading' as const, content: pageName, visible: true, styles: { fontSize: '2.8rem', fontWeight: '700', color: '#171717' } }, { id: `copy-${Date.now()}`, kind: 'text' as const, content: 'Add the content for this page in the properties panel.', visible: true, styles: { fontSize: '1rem', color: '#666666' } }] },
        { id: `footer-${Date.now()}`, kind: 'footer' as const, name: 'Footer', enabled: true, styles: { padding: '32px 8%', backgroundColor: '#171717' }, components: [{ id: `copyright-${Date.now()}`, kind: 'text' as const, content: '© ' + site.name + '. All rights reserved.', visible: true, styles: { color: '#ffffff' } }] },
      ],
    }
    commit({ ...site, pages: [...site.pages, newPage] })
    setActivePageId(newPage.id)
    setSelectedId(newPage.sections[1].id)
    setSelectedComponentId(null)
  }

  const renamePage = () => {
    if (!page) return
    const name = window.prompt('Enter a name for this page', page.name)?.trim()
    if (!name) return
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page'
    commit({ ...site, pages: site.pages.map(item => item.id === page.id ? { ...item, name, slug: item.isHomePage ? '' : slug } : item) })
  }

  const duplicatePage = () => {
    if (!page) return
    const copy = { ...page, id: `page-${Date.now()}`, name: `${page.name} copy`, slug: `${page.slug || 'home'}-copy`, isHomePage: false, sections: page.sections.map(section => ({ ...section, id: `${section.id}-copy-${Date.now()}`, components: section.components.map(item => ({ ...item, id: `${item.id}-copy-${Date.now()}` })) })) }
    commit({ ...site, pages: [...site.pages, copy] })
    setActivePageId(copy.id)
    setSelectedId(copy.sections[1]?.id ?? copy.sections[0]?.id ?? '')
  }

  const deletePage = () => {
    if (!page || page.isHomePage || site.pages.length <= 1) return
    if (!window.confirm(`Delete the "${page.name}" page?`)) return
    const remaining = site.pages.filter(item => item.id !== page.id)
    commit({ ...site, pages: remaining })
    setActivePageId(remaining[0].id)
    setSelectedId(remaining[0].sections[1]?.id ?? remaining[0].sections[0]?.id ?? '')
    setSelectedComponentId(null)
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

  const moveSectionTo = (sourceId: string, targetId: string) => {
    if (!page || sourceId === targetId) return
    const from = page.sections.findIndex(section => section.id === sourceId)
    const to = page.sections.findIndex(section => section.id === targetId)
    if (from <= 0 || to <= 0 || from >= page.sections.length - 1 || to >= page.sections.length - 1) return
    const reordered = [...page.sections]
    const moving = reordered.splice(from, 1)[0]
    reordered.splice(to, 0, moving)
    commit({ ...site, pages: site.pages.map(item => item.id === page.id ? { ...item, sections: reordered } : item) })
  }

  const updateSelectedComponentStyle = (key: string, value: string) => {
    if (!selected || !selectedComponent) return
    updateSection(selected.id, section => ({ ...section, components: section.components.map(item => item.id === selectedComponent.id ? { ...item, responsiveStyles: { ...item.responsiveStyles, [device]: { ...(item.responsiveStyles?.[device] ?? {}), [key]: value } } } : item) }))
  }

  const addComponent = (kind: 'heading' | 'text' | 'button' | 'form' | 'shape') => {
    if (!selected) return
    const id = globalThis.crypto?.randomUUID?.() ?? `element-${Date.now()}`
    const component = { id, kind: kind === 'shape' ? 'container' as const : kind, content: kind === 'heading' ? 'New heading' : kind === 'text' ? 'Add your text here.' : kind === 'button' ? 'Click here' : kind === 'form' ? 'Contact form' : '', visible: true, styles: kind === 'button' ? { backgroundColor: '#b9965b', color: '#ffffff', padding: '12px 22px', borderRadius: '6px' } : kind === 'shape' ? { backgroundColor: '#e9e2d5', minHeight: '90px', borderRadius: '12px', width: '100%' } : { color: '#171717', fontSize: kind === 'heading' ? '2rem' : '1rem' } }
    updateSection(selected.id, section => ({ ...section, components: [...section.components, component] }))
    setSelectedComponentId(id)
  }

  const duplicateComponent = () => {
    if (!selected || !selectedComponent) return
    const copy = { ...selectedComponent, id: globalThis.crypto?.randomUUID?.() ?? `element-${Date.now()}`, styles: { ...selectedComponent.styles }, responsiveStyles: selectedComponent.responsiveStyles ? { ...selectedComponent.responsiveStyles } : undefined }
    updateSection(selected.id, section => ({ ...section, components: [...section.components, copy] }))
    setSelectedComponentId(copy.id)
  }

  const deleteComponent = () => {
    if (!selected || !selectedComponent) return
    updateSection(selected.id, section => ({ ...section, components: section.components.filter(item => item.id !== selectedComponent.id) }))
    setSelectedComponentId(null)
  }

  const addUploadedImage = (file?: File) => {
    if (!file || !selected || !file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) { window.alert('Please choose an image smaller than 5 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      if (!dataUrl) return
      const imageComponent = { id: 'image-' + Date.now(), kind: 'image' as const, content: dataUrl, visible: true, styles: { width: '100%', maxWidth: '520px', borderRadius: '8px' } }
      updateSection(selected.id, section => ({ ...section, components: [...section.components, imageComponent] }))
      setSelectedComponentId(imageComponent.id)
    }
    reader.readAsDataURL(file)
  }

  const updateHeading = (value: string) => {
    if (!selected) return
    updateSection(selected.id, section => ({
      ...section,
      components: section.components.map((item, index) => selectedComponentId
        ? (item.id === selectedComponentId ? { ...item, content: value } : item)
        : (index === 0 && item.kind === 'heading' ? { ...item, content: value } : item)),
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
        <button className="primary-button editor-save" onClick={() => { localStorage.setItem(storageKey, JSON.stringify(site)); setSavedAt('Saved just now') }}><Save size={14} /> Save</button>
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
        <div className="editor-stage-toolbar"><div><select className="editor-page-select" aria-label="Choose page" value={page.id} onChange={event => { const nextPage = site.pages.find(item => item.id === event.target.value); if (nextPage) { setActivePageId(nextPage.id); setSelectedId(nextPage.sections[1]?.id ?? nextPage.sections[0]?.id ?? ''); setSelectedComponentId(null) } }}>{site.pages.map(item => <option key={item.id} value={item.id}>{item.name}{item.isHomePage ? ' (Home)' : ''}</option>)}</select><button className="editor-page-action" onClick={addPage}>+ Page</button><button className="editor-page-action" onClick={renamePage}>Rename</button><button className="editor-page-action" onClick={duplicatePage}>Duplicate</button><button className="editor-page-action" onClick={deletePage} disabled={page.isHomePage || site.pages.length <= 1}>Delete</button><span className="editor-stage-muted">/</span><span className="editor-stage-muted">Editing</span></div><div className="device-switch"><button className={device === 'desktop' ? 'selected' : ''} onClick={() => setDevice('desktop')} aria-label="Desktop preview"><Monitor size={16} /></button><button className={device === 'tablet' ? 'selected' : ''} onClick={() => setDevice('tablet')} aria-label="Tablet preview"><Tablet size={16} /></button><button className={device === 'mobile' ? 'selected' : ''} onClick={() => setDevice('mobile')} aria-label="Mobile preview"><Smartphone size={16} /></button></div></div>
        <div className="editor-canvas-wrap"><div className={canvasClass}>
          {page.sections.filter(section => section.enabled).map(section => <section key={section.id} draggable={!previewMode && !['header','footer'].includes(section.kind)} onDragStart={event => { if (['header','footer'].includes(section.kind)) { event.preventDefault(); return } setDraggedSectionId(section.id); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', section.id) }} onDragOver={event => { if (draggedSectionId) event.preventDefault() }} onDrop={event => { event.preventDefault(); const sourceId = event.dataTransfer.getData('text/plain') || draggedSectionId; if (sourceId) moveSectionTo(sourceId, section.id); setDraggedSectionId(null) }} onDragEnd={() => setDraggedSectionId(null)} onClick={() => { setSelectedId(section.id); setSelectedComponentId(null) }} className={'site-preview-section ' + (selected?.id === section.id ? 'is-selected ' : '') + (draggedSectionId === section.id ? 'is-dragging ' : '') + 'section-' + section.kind} style={section.styles}>
            {section.components.filter(item => item.visible).map(item => { const selectItem = (event: MouseEvent) => { event.stopPropagation(); setSelectedId(section.id); setSelectedComponentId(item.id) }; const selectedClass = selectedComponentId === item.id ? 'component-selected' : ''; const elementStyle = { ...item.styles, ...(item.responsiveStyles?.[device] ?? {}) }; const handleElementClick = (event: MouseEvent) => { if (previewMode && item.linkTo) { event.stopPropagation(); window.open(item.linkTo, '_blank', 'noopener,noreferrer'); return } selectItem(event) }; return item.kind === 'heading' ? <h2 key={item.id} className={selectedClass} onClick={handleElementClick} style={elementStyle}>{item.content}</h2> : item.kind === 'text' ? <p key={item.id} className={selectedClass} onClick={handleElementClick} style={elementStyle}>{item.content}</p> : item.kind === 'button' ? <button key={item.id} className={selectedClass} onClick={handleElementClick} style={elementStyle}>{item.content}</button> : item.kind === 'image' ? <img key={item.id} className={selectedClass} onClick={handleElementClick} style={elementStyle} src={item.content} alt="Website content" /> : item.kind === 'form' ? <form key={item.id} className="site-preview-form" onSubmit={event => { event.preventDefault(); if (previewMode) window.alert('Form preview only. Connect a form service before publishing to receive submissions.') }} onClick={selectItem}><input aria-label="Your name" placeholder="Your name" required /><input aria-label="Email address" type="email" placeholder="Email address" required /><textarea aria-label="Your message" placeholder="Your message" required /><button type="submit">Send message</button></form> : item.kind === 'container' ? <div key={item.id} className={selectedClass} onClick={handleElementClick} style={elementStyle}>{item.content}</div> : null })}
            {section.kind === 'header' && site.pages.length > 1 && <nav className="site-page-navigation" aria-label="Website pages">{site.pages.map(navPage => <button key={navPage.id} type="button" className={navPage.id === page.id ? 'active' : ''} onClick={event => { event.stopPropagation(); setActivePageId(navPage.id); setSelectedId(navPage.sections[1]?.id ?? navPage.sections[0]?.id ?? ''); setSelectedComponentId(null) }}>{navPage.name}</button>)}</nav>}
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
        <div className="component-insert-tools"><strong>Add elements</strong><div><button onClick={() => addComponent('heading')}>+ Heading</button><button onClick={() => addComponent('text')}>+ Text</button><button onClick={() => addComponent('button')}>+ Button</button><button onClick={() => addComponent('form')}>+ Form</button><button onClick={() => addComponent('shape')}>+ Shape</button></div></div>
        {selectedComponent && <div className="component-style-controls"><strong>Element styling · {device}</strong>
          <label className="property-label">Text colour<div className="colour-input"><input type="color" value={selectedComponent.responsiveStyles?.[device]?.color ?? selectedComponent.styles.color ?? '#171717'} onChange={e => updateSelectedComponentStyle('color', e.target.value)} /><span>{selectedComponent.responsiveStyles?.[device]?.color ?? selectedComponent.styles.color ?? '#171717'}</span></div></label>
          <label className="property-label">Font size<select value={selectedComponent.responsiveStyles?.[device]?.fontSize ?? selectedComponent.styles.fontSize ?? '1rem'} onChange={e => updateSelectedComponentStyle('fontSize', e.target.value)}><option value="0.85rem">Small</option><option value="1rem">Normal</option><option value="1.25rem">Large</option><option value="2rem">Extra large</option><option value="2.8rem">Display</option></select></label>
          <label className="property-label">Alignment<select value={selectedComponent.responsiveStyles?.[device]?.textAlign ?? selectedComponent.styles.textAlign ?? 'left'} onChange={e => updateSelectedComponentStyle('textAlign', e.target.value)}><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select></label>
          <label className="property-label">Font weight<select value={selectedComponent.responsiveStyles?.[device]?.fontWeight ?? selectedComponent.styles.fontWeight ?? '400'} onChange={e => updateSelectedComponentStyle('fontWeight', e.target.value)}><option value="400">Regular</option><option value="500">Medium</option><option value="600">Semi-bold</option><option value="700">Bold</option></select></label>
        </div>}
        {selectedComponent && <div className="component-style-controls"><strong>Actions & links</strong><label className="property-label">Element destination<input value={selectedComponent.linkTo ?? ''} placeholder="https://example.com or /page" onChange={e => { const value=e.target.value; updateSection(selected.id, section => ({ ...section, components: section.components.map(item => item.id === selectedComponent.id ? { ...item, linkTo:value } : item) })) }} /></label><div className="property-actions"><button onClick={duplicateComponent}>Duplicate element</button><button onClick={deleteComponent}>Delete element</button></div></div>}
        {selectedComponent?.kind === 'image' && <div className="image-control-actions"><button type="button" onClick={() => imageInputRef.current?.click()}>Replace image</button><button type="button" onClick={() => { updateSection(selected.id, section => ({ ...section, components: section.components.filter(item => item.id !== selectedComponent.id) })); setSelectedComponentId(null) }}>Remove image</button></div>}
        <input ref={imageInputRef} className="visually-hidden-image-input" type="file" accept="image/*" onChange={event => { addUploadedImage(event.target.files?.[0]); event.currentTarget.value = '' }} />
        <button className="add-image-control" type="button" onClick={() => imageInputRef.current?.click()}><Image size={14} /> Add image to section</button>
        <div className="property-actions"><button onClick={() => moveSection(-1)} title="Move up">↑ Move up</button><button onClick={() => moveSection(1)} title="Move down">↓ Move down</button></div>
        <button className="remove-section" onClick={removeSection} disabled={['header','footer'].includes(selected.kind)}><Trash2 size={14} /> Remove section</button>
      </div> : <p className="editor-no-selection">Choose a section on the canvas.</p>}</aside>
    </div>
    <div className="editor-mobile-add"><button onClick={() => setShowAdd(true)}><Plus size={16} /> Add section</button><button onClick={() => setPanel('layers')}><Layers3 size={16} /> Layers</button><button onClick={() => setPanel('settings')}><Settings2 size={16} /> Settings</button></div>
    {showAdd && <div className="editor-add-sheet"><div><strong>Add a section</strong><button onClick={() => setShowAdd(false)}>Close</button></div>{sectionOptions.map(item => <button key={item.kind} onClick={() => addSection(item.kind)}>{item.label}<Plus size={15} /></button>)}</div>}
  </div>
}
