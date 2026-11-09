import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import { ArrowLeft, Eye, Monitor, Tablet, Smartphone, Undo2, Redo2, Plus, Type, Image, MousePointer2, Layers3, Settings2, Trash2, Save, Sparkles, Download, X } from 'lucide-react'
import JSZip from 'jszip'
import { buildExportFiles } from './exportSite'
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

const uniquePageSlug = (name: string, pages: SiteDocument['pages'], excludePageId?: string) => {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page'
  const used = new Set(pages.filter(item => item.id !== excludePageId).map(item => item.slug))
  let candidate = base
  let suffix = 2
  while (used.has(candidate)) candidate = base + '-' + suffix++
  return candidate
}

const freshEditorId = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now() + '-' + Math.random().toString(36).slice(2, 8)}`

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
  const [panel, setPanel] = useState<'add' | 'layers' | 'media' | 'seo' | 'ai'>('add')
  const [aiEditCommand, setAiEditCommand] = useState('')
  const [aiEditMessage, setAiEditMessage] = useState('')
  const [history, setHistory] = useState<SiteDocument[]>([])
  const [future, setFuture] = useState<SiteDocument[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false)
  const [mobilePropertiesOpen, setMobilePropertiesOpen] = useState(false)
  const [savedAt, setSavedAt] = useState('Just saved')
  const [previewMode, setPreviewMode] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportBusy, setExportBusy] = useState(false)
  const [exportMessage, setExportMessage] = useState('')
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null)
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const page = site.pages.find(item => item.id === activePageId) ?? site.pages[0]
  const selected = page?.sections.find(section => section.id === selectedId) ?? page?.sections[0]
  const selectedComponent = selected?.components.find(item => item.id === selectedComponentId)
  const selectedText = selectedComponent?.content ?? selected?.components.find(item => item.kind === 'heading')?.content ?? selected?.name ?? ''

  useEffect(() => {
    setSavedAt('Saving…')
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(site))
        setSavedAt('Saved just now')
      } catch {
        setSavedAt('Could not save — storage is full')
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [site, storageKey])

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
      slug: uniquePageSlug(pageName, site.pages),
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
    const slug = uniquePageSlug(name, site.pages, page.id)
    commit({ ...site, pages: site.pages.map(item => item.id === page.id ? { ...item, name, slug: item.isHomePage ? '' : slug } : item) })
  }

  const duplicatePage = () => {
    if (!page) return
    const copy = { ...page, id: freshEditorId('page'), name: `${page.name} copy`, slug: uniquePageSlug(`${page.name} copy`, site.pages), isHomePage: false, sections: page.sections.map(section => ({ ...section, id: freshEditorId('section'), components: section.components.map(item => ({ ...item, id: freshEditorId('element') })) })) }
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
    setMobilePanelOpen(false)
  }

  const runAiEditCommand = (event: FormEvent) => {
    event.preventDefault()
    const command = aiEditCommand.trim()
    if (!command || !page || !selected) return
    const colors: Record<string, string> = { black: '#171717', white: '#ffffff', red: '#e53935', blue: '#2563eb', navy: '#172554', green: '#16834a', yellow: '#eab308', purple: '#7e22ce', pink: '#db2777', orange: '#ea580c', gold: '#c6a56b', cream: '#fbf8f1' }
    const colorMatch = command.match(/(?:to|as)\s+(#[0-9a-f]{3,8}|[a-z]+)/i)
    const color = colorMatch ? (colorMatch[1].startsWith('#') ? colorMatch[1] : colors[colorMatch[1].toLowerCase()]) : undefined
    const lower = command.toLowerCase()
    if (/\b(add|insert|create)\b/.test(lower)) {
      const kind = (['testimonials','features','gallery','pricing','contact','hero'] as const).find(value => lower.includes(value))
      if (kind) { addSection(kind); setAiEditMessage('Added a ' + kind + ' section to ' + page.name + '.'); setAiEditCommand(''); return }
    }
    if (color && /\b(primary|brand)\b/.test(lower)) {
      commit({ ...site, theme: { ...site.theme, primaryColor: color } })
      setAiEditMessage('Updated the site primary colour.'); setAiEditCommand(''); return
    }
    if (color && /\baccent\b/.test(lower)) {
      commit({ ...site, theme: { ...site.theme, accentColor: color } })
      setAiEditMessage('Updated the site accent colour.'); setAiEditCommand(''); return
    }
    if (color && /\b(background|background colour|background color)\b/.test(lower)) {
      updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, backgroundColor: color } }))
      setAiEditMessage('Updated the selected section background.'); setAiEditCommand(''); return
    }
    const headingMatch = command.match(/(?:change|set|replace)\s+(?:the\s+)?(?:heading|headline|title)(?:\s+text)?\s+(?:to|as)\s+["“]?(.+?)["”]?$/i)
    if (headingMatch?.[1]) {
      const replacement = headingMatch[1].trim().replace(/["”]$/, '')
      const target = selected.components.find(item => item.id === selectedComponentId && item.kind === 'heading') ?? selected.components.find(item => item.kind === 'heading')
      if (target) {
        updateSection(selected.id, section => ({ ...section, components: section.components.map(item => item.id === target.id ? { ...item, content: replacement } : item) }))
        setAiEditMessage('Updated the heading in ' + selected.name + '.'); setAiEditCommand(''); return
      }
    }
    setAiEditMessage('I could not safely match that instruction yet. Try one of the examples below.')
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


  const saveReusableComponent = () => {
    if (!selectedComponent) return
    const saved = { ...selectedComponent, id: globalThis.crypto?.randomUUID?.() ?? `saved-${Date.now()}`, styles: { ...selectedComponent.styles }, responsiveStyles: selectedComponent.responsiveStyles ? Object.fromEntries(Object.entries(selectedComponent.responsiveStyles).map(([mode, styles]) => [mode, { ...styles }])) : undefined }
    commit({ ...site, savedComponents: [...(site.savedComponents ?? []), saved] })
  }

  const insertReusableComponent = (saved: NonNullable<SiteDocument['savedComponents']>[number]) => {
    if (!selected) return
    const component = { ...saved, id: globalThis.crypto?.randomUUID?.() ?? `reuse-${Date.now()}`, styles: { ...saved.styles }, responsiveStyles: saved.responsiveStyles ? Object.fromEntries(Object.entries(saved.responsiveStyles).map(([mode, styles]) => [mode, { ...styles }])) : undefined }
    updateSection(selected.id, section => ({ ...section, components: [...section.components, component] }))
    setSelectedComponentId(component.id)
    setMobilePanelOpen(false)
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

  const addUploadedImage = async (file?: File) => {
    if (!file || !selected || !file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) { window.alert('Please choose an image smaller than 5 MB.'); return }
    let uploadFile = file
    // Resize large JPEG, PNG and WebP images while preserving their original format.
    // Keep SVG, GIF and unsupported formats untouched to avoid changing vector or animation content.
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && typeof createImageBitmap === 'function') {
      try {
        const bitmap = await createImageBitmap(file)
        const maxDimension = 2000
        const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
        if (scale < 1 || file.size > 700 * 1024) {
          const canvas = document.createElement('canvas')
          canvas.width = Math.max(1, Math.round(bitmap.width * scale))
          canvas.height = Math.max(1, Math.round(bitmap.height * scale))
          const context = canvas.getContext('2d')
          if (context) {
            context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
            const optimizedBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, file.type, file.type === 'image/png' ? undefined : 0.84))
            if (optimizedBlob && optimizedBlob.size < file.size) {
              uploadFile = new File([optimizedBlob], file.name, { type: file.type, lastModified: file.lastModified })
            }
          }
          bitmap.close()
        } else {
          bitmap.close()
        }
      } catch {
        // If decoding or canvas optimization is unavailable, retain the original upload.
      }
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      if (!dataUrl) return
      const asset = { id: globalThis.crypto?.randomUUID?.() ?? ('asset-' + Date.now()), name: file.name, mimeType: uploadFile.type, dataUrl, altText: file.name.replace(/\.[^.]+$/, ''), createdAt: new Date().toISOString() }
      const imageComponent = { id: 'image-' + Date.now(), kind: 'image' as const, content: dataUrl, visible: true, styles: { width: '100%', maxWidth: '520px', borderRadius: '8px' } }
      commit({ ...site, assets: [...(site.assets ?? []).filter(item => item.dataUrl !== dataUrl), asset], pages: site.pages.map(p => p.id === page.id ? { ...p, sections: p.sections.map(section => section.id === selected.id ? { ...section, components: [...section.components, imageComponent] } : section) } : p) })
      setSelectedComponentId(imageComponent.id)
      setMobilePanelOpen(false)
    }
    reader.readAsDataURL(uploadFile)
  }

  const finishInlineEdit = (componentId: string, value: string) => {
    setEditingComponentId(null)
    const targetSection = page?.sections.find(section => section.components.some(item => item.id === componentId))
    if (!targetSection) return
    updateSection(targetSection.id, section => ({ ...section, components: section.components.map(item => item.id === componentId ? { ...item, content: value } : item) }))
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

  useEffect(() => {
    const handleEditorShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return
      const target = event.target as HTMLElement | null
      if (target?.isContentEditable || target?.closest('input, textarea, select, [contenteditable="true"]')) return
      const key = event.key.toLowerCase()
      if (key === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      } else if (key === 'y') {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleEditorShortcut)
    return () => window.removeEventListener('keydown', handleEditorShortcut)
  }, [history, future, site])


  const downloadTextFile = (fileName: string, content: string, mimeType: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const downloadSourceFile = (kind: 'html' | 'css' | 'js') => {
    const files = buildExportFiles(site)
    if (kind === 'html') downloadTextFile('index.html', files.htmlFiles['index.html'] ?? Object.values(files.htmlFiles)[0] ?? '', 'text/html')
    if (kind === 'css') downloadTextFile('styles.css', files.css, 'text/css')
    if (kind === 'js') downloadTextFile('script.js', files.js, 'text/javascript')
    setExportMessage(kind.toUpperCase() + ' source file downloaded.')
  }

  const downloadWebsiteZip = async () => {
    setExportBusy(true)
    setExportMessage('')
    try {
      const files = buildExportFiles(site)
      const zip = new JSZip()
      Object.entries(files.htmlFiles).forEach(([name, content]) => zip.file(name, content))
      Object.entries(files.assets).forEach(([name, content]) => zip.file(name, content))
      zip.file('styles.css', files.css)
      zip.file('script.js', files.js)
      zip.file('README.txt', 'Website source files for ' + site.name + '\n\nOpen index.html to view the website.\nAll pages, styles and scripts are included.\nContact forms are front-end previews and need a form service to receive submissions.\nUploaded images are included in the assets folder.\n\nCreated with DSQUARE STUDIO.\n')
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
      const safeName = site.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'website'
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = safeName + '-website-source.zip'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setExportMessage('Your complete website source ZIP is ready.')
    } catch {
      setExportMessage('The export could not be created. Please try again.')
    } finally {
      setExportBusy(false)
    }
  }

  const canvasClass = useMemo(() => `editor-canvas device-${device}`, [device])

  return <div className={`visual-editor ${previewMode ? "preview-mode" : ""} ${mobilePanelOpen ? "mobile-panel-open" : ""} ${mobilePropertiesOpen ? "mobile-properties-open" : ""}`}>
    <header className="editor-topbar">
      <button className="editor-back" onClick={onExit}><ArrowLeft size={17} /><span>Back to studio</span></button>
      <div className="editor-project-name"><strong>{site.name}</strong><span><i /> {savedAt}</span></div>
      <div className="editor-top-actions">
        <button className="editor-tool" onClick={undo} disabled={!history.length} aria-label="Undo"><Undo2 size={17} /></button>
        <button className="editor-tool" onClick={redo} disabled={!future.length} aria-label="Redo"><Redo2 size={17} /></button>
        <button className="editor-preview" onClick={() => setPreviewMode(value => !value)}><Eye size={15} /> {previewMode ? "Exit preview" : "Preview"}</button>
        <button className="editor-preview editor-export" onClick={() => { setExportMessage(""); setExportOpen(true) }}><Download size={15} /> Export</button>
        <button className="primary-button editor-save" onClick={() => { try { localStorage.setItem(storageKey, JSON.stringify(site)); setSavedAt('Saved just now') } catch { setSavedAt('Could not save — storage is full') } }}><Save size={14} /> Save</button>
      </div>
    </header>
    <div className="editor-workspace">
      <aside className="editor-left-panel">
        <div className="editor-panel-tabs">
          <button className={panel === 'add' ? 'active' : ''} onClick={() => setPanel('add')}><Plus size={14} /> Add</button>
          <button className={panel === 'layers' ? 'active' : ''} onClick={() => setPanel('layers')}><Layers3 size={14} /> Layers</button>
          <button className={panel === 'media' ? 'active' : ''} onClick={() => setPanel('media')}><Image size={14} /> Media</button>
          <button className={panel === 'seo' ? 'active' : ''} onClick={() => setPanel('seo')}><Settings2 size={14} /> SEO</button>
          <button className={panel === 'ai' ? 'active' : ''} onClick={() => setPanel('ai')}><Sparkles size={14} /> AI Edit</button><button className="mobile-panel-close" onClick={() => setMobilePanelOpen(false)} aria-label="Close panel"><X size={15} /></button>
        </div>
        {panel === 'add' ? <div className="editor-panel-content"><div className="editor-panel-heading"><strong>Sections</strong><span>BUILD YOUR PAGE</span></div>{sectionOptions.map(item => <button className="add-section-item" key={item.kind} onClick={() => addSection(item.kind)}><span className="add-section-icon">{item.kind === 'gallery' ? <Image size={17} /> : item.kind === 'hero' ? <MousePointer2 size={17} /> : <Type size={17} />}</span><span><strong>{item.label}</strong><small>{item.description}</small></span><Plus size={14} /></button>)}{(site.savedComponents ?? []).length > 0 && <><div className="editor-panel-heading reusable-heading"><strong>Reusable elements</strong><span>{site.savedComponents?.length} SAVED</span></div>{(site.savedComponents ?? []).map(saved => <button className="add-section-item" key={saved.id} onClick={() => insertReusableComponent(saved)}><span className="add-section-icon"><Plus size={16} /></span><span><strong>{saved.kind}</strong><small>{saved.content.slice(0,42) || 'Saved design element'}</small></span><Plus size={14} /></button>)}</>}</div> : panel === 'layers' ? <div className="editor-panel-content"><div className="editor-panel-heading"><strong>Page layers</strong><span>{page.sections.length} SECTIONS</span></div>{page.sections.map((section, index) => <button key={section.id} className={selected?.id === section.id ? 'layer-item selected' : 'layer-item'} onClick={() => setSelectedId(section.id)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{section.name}</strong><small>{section.kind}</small></button>)}</div> : panel === 'media' ? <div className="editor-panel-content"><div className="editor-panel-heading"><strong>Media library</strong><span>{(site.assets ?? []).length} FILES</span></div><button className="add-image-control" onClick={() => imageInputRef.current?.click()}><Plus size={14} /> Upload image</button>{(site.assets ?? []).map(asset => <div className="media-library-item" key={asset.id}><img src={asset.dataUrl} alt={asset.altText} /><div><strong>{asset.name}</strong><small>{Math.round(asset.dataUrl.length * .75 / 1024)} KB approx.</small><label className="media-alt-label">Image description (alt text)<input value={asset.altText} placeholder="Describe this image" onChange={event => setSite(current => ({ ...current, assets: (current.assets ?? []).map(item => item.id === asset.id ? { ...item, altText: event.target.value } : item) }))} /></label><button onClick={() => { if (!selected) return; const component = { id: 'image-' + Date.now(), kind: 'image' as const, content: asset.dataUrl, visible: true, styles: { width: '100%', maxWidth: '520px', borderRadius: '8px' } }; updateSection(selected.id, section => ({ ...section, components: [...section.components, component] })); setSelectedComponentId(component.id) }}>Add to selected section</button><button onClick={() => commit({ ...site, assets: (site.assets ?? []).filter(item => item.id !== asset.id) })}>Remove from library</button></div></div>)}</div> : panel === 'seo' ? <div className="editor-panel-content"><div className="editor-panel-heading"><strong>SEO & site settings</strong><span>SEARCH PREVIEW</span></div><label className="property-label">Website title<input maxLength={70} value={site.metadata.title} onChange={event => commit({ ...site, metadata: { ...site.metadata, title: event.target.value } })} /></label><small className="seo-counter">{site.metadata.title.length}/70 characters</small><label className="property-label">Meta description<textarea rows={4} maxLength={320} value={site.metadata.description} onChange={event => commit({ ...site, metadata: { ...site.metadata, description: event.target.value } })} /></label><small className="seo-counter">{site.metadata.description.length}/320 characters</small><label className="property-label">Site language<select value={site.metadata.language} onChange={event => commit({ ...site, metadata: { ...site.metadata, language: event.target.value } })}><option value="en">English</option><option value="en-GB">English (UK)</option><option value="en-NG">English (Nigeria)</option><option value="fr">French</option><option value="es">Spanish</option><option value="pt">Portuguese</option><option value="ar">Arabic</option><option value="ha">Hausa</option><option value="yo">Yoruba</option><option value="ig">Igbo</option></select></label><p className="seo-help">These settings are added to the HTML pages when you export your website.</p></div> : panel === 'ai' ? <div className="editor-panel-content"><div className="editor-panel-heading"><strong>AI quick edits</strong><span>LOCAL COMMANDS</span></div><p className="ai-edit-note">Describe a simple change in everyday language. This first version runs safely in your browser; it is not connected to a real AI model yet.</p><form className="ai-edit-form" onSubmit={runAiEditCommand}><label className="property-label">What should I change?<textarea rows={4} value={aiEditCommand} onChange={event => setAiEditCommand(event.target.value)} placeholder="e.g. Change the background to navy" /></label><button className="ai-edit-submit" type="submit" disabled={!aiEditCommand.trim()}><Sparkles size={14} /> Apply instruction</button></form>{aiEditMessage && <p className="ai-edit-message" role="status">{aiEditMessage}</p>}<div className="ai-edit-examples"><strong>Try these</strong><button type="button" onClick={() => setAiEditCommand('Change the background to cream')}>Change the background to cream</button><button type="button" onClick={() => setAiEditCommand('Change the primary colour to blue')}>Change the primary colour to blue</button><button type="button" onClick={() => setAiEditCommand('Change the heading to Welcome to our studio')}>Change the heading text</button><button type="button" onClick={() => setAiEditCommand('Add a testimonials section')}>Add a testimonials section</button><button type="button" onClick={() => setAiEditCommand('Add a gallery section')}>Add a gallery section</button></div></div> : null}
        <div className="editor-panel-foot"><Sparkles size={14} /> Select a section to edit its content.</div>
      </aside>
      <main className="editor-stage">
        <div className="editor-stage-toolbar"><div><select className="editor-page-select" aria-label="Choose page" value={page.id} onChange={event => { const nextPage = site.pages.find(item => item.id === event.target.value); if (nextPage) { setActivePageId(nextPage.id); setSelectedId(nextPage.sections[1]?.id ?? nextPage.sections[0]?.id ?? ''); setSelectedComponentId(null) } }}>{site.pages.map(item => <option key={item.id} value={item.id}>{item.name}{item.isHomePage ? ' (Home)' : ''}</option>)}</select><button className="editor-page-action" onClick={addPage}>+ Page</button><button className="editor-page-action" onClick={renamePage}>Rename</button><button className="editor-page-action" onClick={duplicatePage}>Duplicate</button><button className="editor-page-action" onClick={deletePage} disabled={page.isHomePage || site.pages.length <= 1}>Delete</button><span className="editor-stage-muted">/</span><span className="editor-stage-muted">Editing</span></div><div className="device-switch"><button className={device === 'desktop' ? 'selected' : ''} onClick={() => setDevice('desktop')} aria-label="Desktop preview"><Monitor size={16} /></button><button className={device === 'tablet' ? 'selected' : ''} onClick={() => setDevice('tablet')} aria-label="Tablet preview"><Tablet size={16} /></button><button className={device === 'mobile' ? 'selected' : ''} onClick={() => setDevice('mobile')} aria-label="Mobile preview"><Smartphone size={16} /></button></div></div>
        <div className="editor-canvas-wrap"><div className={canvasClass}>
          {page.sections.filter(section => section.enabled).map(section => <section key={section.id} draggable={!previewMode && !['header','footer'].includes(section.kind)} onDragStart={event => { if (['header','footer'].includes(section.kind)) { event.preventDefault(); return } setDraggedSectionId(section.id); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', section.id) }} onDragOver={event => { if (draggedSectionId) event.preventDefault() }} onDrop={event => { event.preventDefault(); const sourceId = event.dataTransfer.getData('text/plain') || draggedSectionId; if (sourceId) moveSectionTo(sourceId, section.id); setDraggedSectionId(null) }} onDragEnd={() => setDraggedSectionId(null)} data-section-id={section.id} onTouchMove={event => { if (draggedSectionId) event.preventDefault() }} onTouchEnd={event => { if (!draggedSectionId) return; const touch = event.changedTouches[0]; const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('[data-section-id]') as HTMLElement | null; const targetId = target?.dataset.sectionId; if (targetId && targetId !== draggedSectionId) moveSectionTo(draggedSectionId, targetId); setDraggedSectionId(null) }} onClick={() => { setSelectedId(section.id); setSelectedComponentId(null) }} className={'site-preview-section ' + (selected?.id === section.id ? 'is-selected ' : '') + (draggedSectionId === section.id ? 'is-dragging ' : '') + 'section-' + section.kind} style={section.styles}>
            {section.components.filter(item => item.visible).map(item => { const selectItem = (event: MouseEvent) => { event.stopPropagation(); setSelectedId(section.id); setSelectedComponentId(item.id) }; const selectedClass = selectedComponentId === item.id ? 'component-selected' : ''; const elementStyle = { ...item.styles, ...(item.responsiveStyles?.[device] ?? {}) }; const handleElementClick = (event: MouseEvent) => { selectItem(event) }; return item.kind === 'heading' ? <h2 key={item.id} className={selectedClass} onClick={handleElementClick} onDoubleClick={() => setEditingComponentId(item.id)} contentEditable={editingComponentId === item.id} suppressContentEditableWarning onBlur={event => editingComponentId === item.id && finishInlineEdit(item.id, event.currentTarget.textContent ?? '')} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() } }} style={elementStyle}>{item.content}</h2> : item.kind === 'text' ? <p key={item.id} className={selectedClass} onClick={handleElementClick} onDoubleClick={() => setEditingComponentId(item.id)} contentEditable={editingComponentId === item.id} suppressContentEditableWarning onBlur={event => editingComponentId === item.id && finishInlineEdit(item.id, event.currentTarget.textContent ?? '')} style={elementStyle}>{item.content}</p> : item.kind === 'button' ? <button key={item.id} className={selectedClass} onClick={handleElementClick} onDoubleClick={() => setEditingComponentId(item.id)} contentEditable={editingComponentId === item.id} suppressContentEditableWarning onBlur={event => editingComponentId === item.id && finishInlineEdit(item.id, event.currentTarget.textContent ?? '')} style={elementStyle}>{item.content}</button> : item.kind === 'image' ? <img key={item.id} className={selectedClass} onClick={handleElementClick} style={elementStyle} src={item.content} alt="Website content" /> : item.kind === 'form' ? <form key={item.id} className="site-preview-form" onSubmit={event => { event.preventDefault(); if (previewMode) window.alert('Form preview only. Connect a form service before publishing to receive submissions.') }} onClick={selectItem}><input aria-label="Your name" placeholder="Your name" required /><input aria-label="Email address" type="email" placeholder="Email address" required /><textarea aria-label="Your message" placeholder="Your message" required /><button type="submit">Send message</button></form> : item.kind === 'container' ? <div key={item.id} className={selectedClass} onClick={handleElementClick} onDoubleClick={() => setEditingComponentId(item.id)} contentEditable={editingComponentId === item.id} suppressContentEditableWarning onBlur={event => editingComponentId === item.id && finishInlineEdit(item.id, event.currentTarget.textContent ?? '')} style={elementStyle}>{item.content}</div> : null })}
            {section.kind === 'header' && site.pages.length > 1 && <nav className="site-page-navigation" aria-label="Website pages">{site.pages.map(navPage => <button key={navPage.id} type="button" className={navPage.id === page.id ? 'active' : ''} onClick={event => { event.stopPropagation(); setActivePageId(navPage.id); setSelectedId(navPage.sections[1]?.id ?? navPage.sections[0]?.id ?? ''); setSelectedComponentId(null) }}>{navPage.name}</button>)}</nav>}
            {section.components.length === 0 && <span className="site-preview-placeholder">{section.name}</span>}
            <span className="section-selection-label">{section.name}</span>{!previewMode && !['header','footer'].includes(section.kind) && <button type="button" className="section-touch-drag-handle" aria-label={'Move ' + section.name} title="Hold and drag to move section" onClick={event => event.stopPropagation()} onTouchStart={event => { event.stopPropagation(); setDraggedSectionId(section.id) }}>⠿</button>}
          </section>)}
        </div></div>
      </main>
      <aside className="editor-right-panel"><div className="editor-properties-heading"><div><Settings2 size={16} /><strong>Properties</strong></div><span>SECTION</span><button className="mobile-properties-close" onClick={() => setMobilePropertiesOpen(false)} aria-label="Close properties"><X size={16} /></button></div>{selected ? <div className="editor-properties">
        <label className="property-label">Section name<input value={selected.name} onChange={e => updateSection(selected.id, section => ({ ...section, name: e.target.value }))} /></label>
        <label className="property-label">{selectedComponent ? `${selectedComponent.kind} content` : 'Heading text'}<textarea rows={3} value={selectedText} onChange={e => updateHeading(e.target.value)} /></label>
        <label className="property-label">Background colour<div className="colour-input"><input type="color" value={selected.styles.backgroundColor ?? '#ffffff'} onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, backgroundColor: e.target.value } }))} /><span>{selected.styles.backgroundColor ?? '#ffffff'}</span></div></label>
        <label className="property-label">Section spacing<select value={selected.styles.padding ?? '72px 8%'} onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, padding: e.target.value } }))}><option value="40px 6%">Compact</option><option value="72px 8%">Comfortable</option><option value="112px 8%">Spacious</option></select></label>
        <div className="component-style-controls"><strong>Layout & background</strong>
          <label className="property-label">Layout mode<select value={selected.styles.display ?? 'block'} onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, display: e.target.value } }))}><option value="block">Stacked</option><option value="flex">Flexible row</option><option value="grid">Grid</option></select></label>
          <div className="layout-control-grid"><label className="property-label">Grid columns<input value={selected.styles.gridTemplateColumns ?? '1fr 1fr'} placeholder="1fr 1fr" onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, display: 'grid', gridTemplateColumns: e.target.value } }))} /></label><label className="property-label">Column gap<input value={selected.styles.gap ?? '24px'} placeholder="24px" onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, gap: e.target.value } }))} /></label></div>
          <label className="property-label">Background image<select value={selected.styles.backgroundImageAsset ?? ''} onChange={e => { const asset = site.assets?.find(item => item.id === e.target.value); updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, backgroundImageAsset: e.target.value, backgroundImage: asset ? 'url(' + asset.dataUrl + ')' : 'none', backgroundSize: 'cover', backgroundPosition: 'center' } })) }}><option value="">No image</option>{(site.assets ?? []).map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>
          <label className="property-label">Entrance animation<select value={selected.styles.animationName ?? 'none'} onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, animationName: e.target.value, animationDuration: '700ms', animationFillMode: 'both' } }))}><option value="none">None</option><option value="dsqFadeIn">Fade in</option><option value="dsqSlideUp">Slide up</option><option value="dsqSlideIn">Slide in</option><option value="dsqZoomIn">Zoom in</option></select></label>
          <label className="property-label">Animation speed<select value={selected.styles.animationDuration ?? '700ms'} onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, animationDuration: e.target.value } }))}><option value="350ms">Fast</option><option value="700ms">Normal</option><option value="1200ms">Slow</option></select></label>
        </div>
        <div className="component-style-controls"><strong>Global site styles</strong>
          <label className="property-label">Primary colour<div className="colour-input"><input type="color" value={site.theme.primaryColor} onChange={e => commit({ ...site, theme: { ...site.theme, primaryColor: e.target.value } })} /><span>{site.theme.primaryColor}</span></div></label>
          <label className="property-label">Accent colour<div className="colour-input"><input type="color" value={site.theme.accentColor} onChange={e => commit({ ...site, theme: { ...site.theme, accentColor: e.target.value } })} /><span>{site.theme.accentColor}</span></div></label>
          <label className="property-label">Heading font<select value={site.theme.headingFont} onChange={e => commit({ ...site, theme: { ...site.theme, headingFont: e.target.value } })}><option value="Arial, sans-serif">Arial</option><option value="Georgia, serif">Georgia</option><option value="system-ui, sans-serif">System</option><option value="'Trebuchet MS', sans-serif">Trebuchet</option></select></label>
          <label className="property-label">Body font<select value={site.theme.bodyFont} onChange={e => commit({ ...site, theme: { ...site.theme, bodyFont: e.target.value } })}><option value="Arial, sans-serif">Arial</option><option value="Georgia, serif">Georgia</option><option value="system-ui, sans-serif">System</option><option value="'Trebuchet MS', sans-serif">Trebuchet</option></select></label>
        </div>
        <div className="component-insert-tools"><strong>Add elements</strong><div><button onClick={() => addComponent('heading')}>+ Heading</button><button onClick={() => addComponent('text')}>+ Text</button><button onClick={() => addComponent('button')}>+ Button</button><button onClick={() => addComponent('form')}>+ Form</button><button onClick={() => addComponent('shape')}>+ Shape</button></div></div>
        {selectedComponent && <div className="component-style-controls"><strong>Element styling · {device}</strong>
          {selectedComponent.kind === 'image' && <div className="image-layout-controls"><strong>Image display</strong>
            <label className="property-label">Fit<select value={selectedComponent.responsiveStyles?.[device]?.objectFit ?? selectedComponent.styles.objectFit ?? 'cover'} onChange={e => updateSelectedComponentStyle('objectFit', e.target.value)}><option value="cover">Fill / crop</option><option value="contain">Fit inside</option><option value="fill">Stretch</option><option value="none">Original size</option></select></label>
            <label className="property-label">Position<select value={selectedComponent.responsiveStyles?.[device]?.objectPosition ?? selectedComponent.styles.objectPosition ?? 'center center'} onChange={e => updateSelectedComponentStyle('objectPosition', e.target.value)}><option value="center center">Centre</option><option value="top center">Top</option><option value="bottom center">Bottom</option><option value="center left">Left</option><option value="center right">Right</option><option value="top left">Top left</option><option value="top right">Top right</option><option value="bottom left">Bottom left</option><option value="bottom right">Bottom right</option></select></label>
          </div>}

          <div className="element-position-controls"><strong>Element position</strong>
            <label className="property-label">Position mode<select value={selectedComponent.responsiveStyles?.[device]?.position ?? selectedComponent.styles.position ?? 'static'} onChange={e => updateSelectedComponentStyle('position', e.target.value)}><option value="static">Normal flow</option><option value="relative">Relative</option><option value="absolute">Absolute</option><option value="sticky">Sticky</option></select></label>
            <div className="layout-control-grid">
              {(['top','right','bottom','left'] as const).map(side => <label className="property-label" key={side}>{side.charAt(0).toUpperCase()+side.slice(1)}<input value={selectedComponent.responsiveStyles?.[device]?.[side] ?? selectedComponent.styles[side] ?? ''} placeholder="auto" onChange={e => updateSelectedComponentStyle(side, e.target.value)} /></label>)}
              <label className="property-label">Layer order<input type="number" value={selectedComponent.responsiveStyles?.[device]?.zIndex ?? selectedComponent.styles.zIndex ?? 1} onChange={e => updateSelectedComponentStyle('zIndex', e.target.value)} /></label>
            </div>
            <small>Use offsets with Relative or Absolute. Absolute positioning is relative to the nearest positioned parent.</small>
          </div>
          <label className="property-label">Text colour<div className="colour-input"><input type="color" value={selectedComponent.responsiveStyles?.[device]?.color ?? selectedComponent.styles.color ?? '#171717'} onChange={e => updateSelectedComponentStyle('color', e.target.value)} /><span>{selectedComponent.responsiveStyles?.[device]?.color ?? selectedComponent.styles.color ?? '#171717'}</span></div></label>
          <label className="property-label">Element background colour<div className="colour-input"><input type="color" value={selectedComponent.responsiveStyles?.[device]?.backgroundColor ?? selectedComponent.styles.backgroundColor ?? '#ffffff'} onChange={e => updateSelectedComponentStyle('backgroundColor', e.target.value)} /><span>{selectedComponent.responsiveStyles?.[device]?.backgroundColor ?? selectedComponent.styles.backgroundColor ?? 'Transparent / unset'}</span></div></label>
          <label className="property-label">Border colour<div className="colour-input"><input type="color" value={selectedComponent.responsiveStyles?.[device]?.borderColor ?? selectedComponent.styles.borderColor ?? '#d6d3d1'} onChange={e => updateSelectedComponentStyle('borderColor', e.target.value)} /><span>{selectedComponent.responsiveStyles?.[device]?.borderColor ?? selectedComponent.styles.borderColor ?? 'Not set'}</span></div></label>
          <div className="layout-control-grid">
            <label className="property-label">Border width<input value={selectedComponent.responsiveStyles?.[device]?.borderWidth ?? selectedComponent.styles.borderWidth ?? '0px'} placeholder="1px" onChange={e => updateSelectedComponentStyle('borderWidth', e.target.value)} /></label>
            <label className="property-label">Border style<select value={selectedComponent.responsiveStyles?.[device]?.borderStyle ?? selectedComponent.styles.borderStyle ?? 'solid'} onChange={e => updateSelectedComponentStyle('borderStyle', e.target.value)}><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option><option value="none">None</option></select></label>
          </div>
          <label className="property-label">Shadow<select value={selectedComponent.responsiveStyles?.[device]?.boxShadow ?? selectedComponent.styles.boxShadow ?? 'none'} onChange={e => updateSelectedComponentStyle('boxShadow', e.target.value)}><option value="none">None</option><option value="0 2px 8px rgba(0,0,0,.12)">Soft</option><option value="0 8px 24px rgba(0,0,0,.18)">Medium</option><option value="0 14px 36px rgba(0,0,0,.24)">Strong</option></select></label>
          <label className="property-label">Font size<select value={selectedComponent.responsiveStyles?.[device]?.fontSize ?? selectedComponent.styles.fontSize ?? '1rem'} onChange={e => updateSelectedComponentStyle('fontSize', e.target.value)}><option value="0.85rem">Small</option><option value="1rem">Normal</option><option value="1.25rem">Large</option><option value="2rem">Extra large</option><option value="2.8rem">Display</option></select></label>
          <label className="property-label">Alignment<select value={selectedComponent.responsiveStyles?.[device]?.textAlign ?? selectedComponent.styles.textAlign ?? 'left'} onChange={e => updateSelectedComponentStyle('textAlign', e.target.value)}><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select></label>
          <label className="property-label">Font weight<select value={selectedComponent.responsiveStyles?.[device]?.fontWeight ?? selectedComponent.styles.fontWeight ?? '400'} onChange={e => updateSelectedComponentStyle('fontWeight', e.target.value)}><option value="400">Regular</option><option value="500">Medium</option><option value="600">Semi-bold</option><option value="700">Bold</option></select></label><label className="property-label">Font family<select value={selectedComponent.responsiveStyles?.[device]?.fontFamily ?? selectedComponent.styles.fontFamily ?? 'inherit'} onChange={e => updateSelectedComponentStyle('fontFamily', e.target.value)}><option value="inherit">Theme default</option><option value="Arial, sans-serif">Arial</option><option value="Georgia, serif">Georgia</option><option value="system-ui, sans-serif">System</option><option value="'Trebuchet MS', sans-serif">Trebuchet</option></select></label><div className="layout-control-grid"><label className="property-label">Line height<input value={selectedComponent.responsiveStyles?.[device]?.lineHeight ?? selectedComponent.styles.lineHeight ?? ''} placeholder="1.5" onChange={e => updateSelectedComponentStyle('lineHeight', e.target.value)} /></label><label className="property-label">Letter spacing<input value={selectedComponent.responsiveStyles?.[device]?.letterSpacing ?? selectedComponent.styles.letterSpacing ?? ''} placeholder="0.02em" onChange={e => updateSelectedComponentStyle('letterSpacing', e.target.value)} /></label></div><label className="property-label">Text transform<select value={selectedComponent.responsiveStyles?.[device]?.textTransform ?? selectedComponent.styles.textTransform ?? 'none'} onChange={e => updateSelectedComponentStyle('textTransform', e.target.value)}><option value="none">Normal</option><option value="uppercase">Uppercase</option><option value="capitalize">Capitalize</option><option value="lowercase">Lowercase</option></select></label>
          <div className="layout-control-grid">
            <label className="property-label">Width<input value={selectedComponent.responsiveStyles?.[device]?.width ?? selectedComponent.styles.width ?? 'auto'} placeholder="auto, 100%, 320px" onChange={e => updateSelectedComponentStyle('width', e.target.value)} /></label>
            <label className="property-label">Max width<input value={selectedComponent.responsiveStyles?.[device]?.maxWidth ?? selectedComponent.styles.maxWidth ?? 'none'} placeholder="none, 600px" onChange={e => updateSelectedComponentStyle('maxWidth', e.target.value)} /></label>
            <label className="property-label">Height<input value={selectedComponent.responsiveStyles?.[device]?.height ?? selectedComponent.styles.height ?? 'auto'} placeholder="auto, 240px" onChange={e => updateSelectedComponentStyle('height', e.target.value)} /></label>
            <label className="property-label">Padding<input value={selectedComponent.responsiveStyles?.[device]?.padding ?? selectedComponent.styles.padding ?? ''} placeholder="12px 20px" onChange={e => updateSelectedComponentStyle('padding', e.target.value)} /></label>
            <label className="property-label">Margin<input value={selectedComponent.responsiveStyles?.[device]?.margin ?? selectedComponent.styles.margin ?? ''} placeholder="0 auto 16px" onChange={e => updateSelectedComponentStyle('margin', e.target.value)} /></label>
            <label className="property-label">Corner radius<input value={selectedComponent.responsiveStyles?.[device]?.borderRadius ?? selectedComponent.styles.borderRadius ?? '0px'} placeholder="12px" onChange={e => updateSelectedComponentStyle('borderRadius', e.target.value)} /></label>
          </div>
        </div>}
        {selectedComponent && <div className="component-style-controls"><strong>Reusable element</strong><button className="add-image-control" type="button" onClick={saveReusableComponent}>Save element to library</button></div>}
        {selectedComponent && <div className="component-style-controls"><strong>Actions & links</strong><label className="property-label">Element destination<input value={selectedComponent.linkTo ?? ''} placeholder="https://example.com or /page" onChange={e => { const value=e.target.value; updateSection(selected.id, section => ({ ...section, components: section.components.map(item => item.id === selectedComponent.id ? { ...item, linkTo:value } : item) })) }} /></label><div className="property-actions"><button onClick={duplicateComponent}>Duplicate element</button><button onClick={deleteComponent}>Delete element</button></div></div>}
        {selectedComponent?.kind === 'image' && <div className="image-control-actions"><button type="button" onClick={() => imageInputRef.current?.click()}>Replace image</button><button type="button" onClick={() => { updateSection(selected.id, section => ({ ...section, components: section.components.filter(item => item.id !== selectedComponent.id) })); setSelectedComponentId(null) }}>Remove image</button></div>}
        <input ref={imageInputRef} className="visually-hidden-image-input" type="file" accept="image/*" onChange={event => { addUploadedImage(event.target.files?.[0]); event.currentTarget.value = '' }} />
        <button className="add-image-control" type="button" onClick={() => imageInputRef.current?.click()}><Image size={14} /> Add image to section</button>
        <div className="property-actions"><button onClick={() => moveSection(-1)} title="Move up">↑ Move up</button><button onClick={() => moveSection(1)} title="Move down">↓ Move down</button></div>
        <button className="remove-section" onClick={removeSection} disabled={['header','footer'].includes(selected.kind)}><Trash2 size={14} /> Remove section</button>
      </div> : <p className="editor-no-selection">Choose a section on the canvas.</p>}</aside>
    </div>
    <div className="editor-mobile-add"><button onClick={() => { setMobilePropertiesOpen(false); setPanel('add'); setMobilePanelOpen(true) }}><Plus size={16} /> Add</button><button onClick={() => { setPanel('layers'); setMobilePanelOpen(true) }}><Layers3 size={16} /> Layers</button><button onClick={() => { setPanel('media'); setMobilePanelOpen(true) }}><Image size={16} /> Media</button><button onClick={() => { setPanel('seo'); setMobilePanelOpen(true); setMobilePropertiesOpen(false) }}><Settings2 size={16} /> SEO</button><button onClick={() => { setMobilePanelOpen(false); setMobilePropertiesOpen(true) }}><Settings2 size={16} /> Style</button><button onClick={() => { setPanel('ai'); setMobilePanelOpen(true); setMobilePropertiesOpen(false) }}><Sparkles size={16} /> AI Edit</button></div>
    {exportOpen && <div className="export-backdrop" role="presentation" onClick={() => !exportBusy && setExportOpen(false)}><section className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title" onClick={event => event.stopPropagation()}><button className="export-close" aria-label="Close export" onClick={() => setExportOpen(false)} disabled={exportBusy}><X size={18} /></button><div className="export-kicker">YOUR WEBSITE · SOURCE CODE</div><h2 id="export-title">Download your website</h2><p>Get the actual HTML, CSS and JavaScript files. The complete ZIP includes every page, styling and scripts needed to run the website.</p><button className="export-zip-button" onClick={downloadWebsiteZip} disabled={exportBusy}><Download size={17} /> {exportBusy ? "Preparing ZIP..." : "Download complete website ZIP"}</button><div className="export-file-heading">Or download individual source files</div><div className="export-file-grid"><button onClick={() => downloadSourceFile("html")}>index.html <span>Website structure</span></button><button onClick={() => downloadSourceFile("css")}>styles.css <span>Design and layout</span></button><button onClick={() => downloadSourceFile("js")}>script.js <span>Interactions</span></button></div>{exportMessage && <div className="export-status" role="status">{exportMessage}</div>}<small>Contact forms are exported as front-end previews. Connect a form service before using them to receive messages.</small></section></div>}
    {showAdd && <div className="editor-add-sheet"><div><strong>Add a section</strong><button onClick={() => setShowAdd(false)}>Close</button></div>{sectionOptions.map(item => <button key={item.kind} onClick={() => addSection(item.kind)}>{item.label}<Plus size={15} /></button>)}</div>}
  </div>
}
