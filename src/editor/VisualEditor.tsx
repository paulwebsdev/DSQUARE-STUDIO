import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, MouseEvent, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, CSSProperties } from 'react'
import { ArrowLeft, Eye, Monitor, Tablet, Smartphone, Undo2, Redo2, Plus, Type, Image, MousePointer2, Layers3, Settings2, Trash2, Save, Sparkles, Download, X, Code2 } from 'lucide-react'
import JSZip from 'jszip'
import { buildExportFiles } from './exportSite'
import { createStarterSite } from './defaultSite'
import CodeEditor from './CodeEditor'
import type { DeviceMode, SiteDocument, SiteSection, StyleMap } from './types'

type Props = { onExit: () => void; projectId: string; projectName: string; category: string }

const sectionOptions: { kind: SiteSection['kind']; label: string; description: string }[] = [
  { kind: 'hero', label: 'Hero', description: 'A bold introduction and call to action' },
  { kind: 'features', label: 'Features', description: 'Highlight services or benefits' },
  { kind: 'gallery', label: 'Gallery', description: 'Showcase images and projects' },
  { kind: 'testimonials', label: 'Testimonials', description: 'Build trust with client feedback' },
  { kind: 'pricing', label: 'Pricing', description: 'Present plans and packages' },
  { kind: 'contact', label: 'Contact', description: 'Help visitors get in touch' },
]

const buttonLibrary = [
  { id:'whatsapp', label:'WhatsApp', text:'Chat on WhatsApp', href:'', hint:'Enter your WhatsApp link, e.g. https://wa.me/2348012345678', color:'#ffffff', bg:'#25D366', hoverBg:'#1da851' },
  { id:'facebook', label:'Facebook', text:'Follow on Facebook', href:'', hint:'Paste your Facebook page URL', color:'#ffffff', bg:'#1877F2', hoverBg:'#125dcc' },
  { id:'instagram', label:'Instagram', text:'Follow on Instagram', href:'', hint:'Paste your Instagram profile URL', color:'#ffffff', bg:'#C13584', hoverBg:'#9d2869' },
  { id:'tiktok', label:'TikTok', text:'Follow on TikTok', href:'', hint:'Paste your TikTok profile URL', color:'#ffffff', bg:'#111111', hoverBg:'#333333' },
  { id:'youtube', label:'YouTube', text:'Subscribe on YouTube', href:'', hint:'Paste your YouTube channel URL', color:'#ffffff', bg:'#FF0033', hoverBg:'#cc0029' },
  { id:'linkedin', label:'LinkedIn', text:'Connect on LinkedIn', href:'', hint:'Paste your LinkedIn profile or company URL', color:'#ffffff', bg:'#0A66C2', hoverBg:'#084f97' },
  { id:'x', label:'X', text:'Follow us on X', href:'', hint:'Paste your X profile URL', color:'#ffffff', bg:'#111111', hoverBg:'#333333' },
  { id:'email', label:'Email', text:'Email us', href:'mailto:', hint:'Enter an email address after mailto:', color:'#ffffff', bg:'#6B7280', hoverBg:'#4b5563' },
  { id:'call', label:'Call', text:'Call us', href:'tel:', hint:'Enter a phone number after tel:', color:'#ffffff', bg:'#16834a', hoverBg:'#11683a' },
  { id:'telegram', label:'Telegram', text:'Message us on Telegram', href:'', hint:'Paste your Telegram profile or channel link', color:'#ffffff', bg:'#229ED9', hoverBg:'#1686bd' },
  { id:'pinterest', label:'Pinterest', text:'Follow on Pinterest', href:'', hint:'Paste your Pinterest profile URL', color:'#ffffff', bg:'#BD081C', hoverBg:'#940616' },
  { id:'snapchat', label:'Snapchat', text:'Add us on Snapchat', href:'', hint:'Paste your Snapchat profile URL', color:'#111111', bg:'#FFFC00', hoverBg:'#e6e300' },
  { id:'threads', label:'Threads', text:'Follow us on Threads', href:'', hint:'Paste your Threads profile URL', color:'#ffffff', bg:'#111111', hoverBg:'#333333' },
  { id:'discord', label:'Discord', text:'Join our Discord', href:'', hint:'Paste your Discord invite URL', color:'#ffffff', bg:'#5865F2', hoverBg:'#414bc4' },
  { id:'maps', label:'Get directions', text:'Get directions', href:'', hint:'Paste a Google Maps or map directions URL', color:'#ffffff', bg:'#4285F4', hoverBg:'#2867d5' },
  { id:'booking', label:'Book now', text:'Book an appointment', href:'', hint:'Paste your booking page URL or internal page path', color:'#ffffff', bg:'#8B5CF6', hoverBg:'#7042d1' },
  { id:'quote', label:'Get a quote', text:'Request a quote', href:'', hint:'Paste your quote or contact page URL', color:'#171717', bg:'#E9C46A', hoverBg:'#d6ad42' },
  { id:'download', label:'Download', text:'Download now', href:'', hint:'Paste a file URL or download page URL', color:'#ffffff', bg:'#374151', hoverBg:'#1f2937' },
  { id:'cta', label:'Call to action', text:'Get started', href:'', hint:'Add a page path or website destination', color:'#171717', bg:'#C6A56B', hoverBg:'#e0bd7b' },
  { id:'custom', label:'Custom button', text:'Your button text', href:'', hint:'Set your own label, link, colours and hover effect', color:'#ffffff', bg:'#27231d', hoverBg:'#51432d' },
] as const

const uniquePageName = (baseName: string, pages: SiteDocument['pages'], excludePageId?: string) => {
  const used = new Set(pages.filter(item => item.id !== excludePageId).map(item => item.name.toLowerCase()))
  const clean = baseName.trim().slice(0, 60) || 'Untitled page'
  let candidate = clean
  let suffix = 2
  while (used.has(candidate.toLowerCase())) {
    const ending = ' ' + suffix++
    candidate = clean.slice(0, 60 - ending.length) + ending
  }
  return candidate
}

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
  const [codeMode, setCodeMode] = useState(false)
  const [previewScrolled, setPreviewScrolled] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportBusy, setExportBusy] = useState(false)
  const [exportMessage, setExportMessage] = useState('')
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null)
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null)
  const [replaceImageId, setReplaceImageId] = useState<string | null>(null)
  const [layerSearch, setLayerSearch] = useState('')
  const [mediaSearch, setMediaSearch] = useState('')
  const [buttonSearch, setButtonSearch] = useState('')
  const [mediaSort, setMediaSort] = useState<'newest' | 'name' | 'largest'>('newest')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const exportCloseRef = useRef<HTMLButtonElement>(null)
  const exportTriggerRef = useRef<HTMLButtonElement>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollport = previewScrollRef.current
    if (!previewMode || !scrollport) { setPreviewScrolled(false); return }
    const updateScrollState = () => setPreviewScrolled(scrollport.scrollTop > 360)
    scrollport.addEventListener('scroll', updateScrollState, { passive: true })
    updateScrollState()
    return () => scrollport.removeEventListener('scroll', updateScrollState)
  }, [previewMode])

  useEffect(() => {
    const scrollport = previewScrollRef.current
    if (!previewMode || !scrollport) return
    let startY = 0
    let startScrollTop = 0
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return
      const target = event.target as HTMLElement | null
      if (target?.closest('[contenteditable="true"], input, textarea, select')) return
      startY = event.touches[0].clientY
      startScrollTop = scrollport.scrollTop
    }
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return
      const target = event.target as HTMLElement | null
      if (target?.closest('[contenteditable="true"], input, textarea, select')) return
      const deltaY = startY - event.touches[0].clientY
      if (Math.abs(deltaY) < 3) return
      if (event.cancelable) event.preventDefault()
      scrollport.scrollTop = startScrollTop + deltaY
    }
    scrollport.addEventListener('touchstart', onTouchStart, { passive: true })
    scrollport.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      scrollport.removeEventListener('touchstart', onTouchStart)
      scrollport.removeEventListener('touchmove', onTouchMove)
    }
  }, [previewMode])

  const page = site.pages.find(item => item.id === activePageId) ?? site.pages[0]
  const selected = page?.sections.find(section => section.id === selectedId) ?? page?.sections[0]
  const previewContactSection = page?.sections.find(section => section.kind === 'contact' && section.enabled)
  const selectedComponent = selected?.components.find(item => item.id === selectedComponentId)
  const selectedImageAsset = selectedComponent?.kind === 'image' ? (site.assets ?? []).find(asset => asset.dataUrl === selectedComponent.content) : undefined
  const selectedText = selectedComponent?.content ?? selected?.components.find(item => item.kind === 'heading')?.content ?? selected?.name ?? ''
  const visibleLayers = useMemo(() => page?.sections.map((section, index) => ({ section, index })).filter(({ section }) => `${section.name} ${section.kind}`.toLowerCase().includes(layerSearch.trim().toLowerCase())) ?? [], [page, layerSearch])
  const visibleAssets = useMemo(() => [...(site.assets ?? [])].filter(asset => `${asset.name} ${asset.altText}`.toLowerCase().includes(mediaSearch.trim().toLowerCase())).sort((a, b) => mediaSort === 'name' ? a.name.localeCompare(b.name) : mediaSort === 'largest' ? b.dataUrl.length - a.dataUrl.length : (b.createdAt ?? '').localeCompare(a.createdAt ?? '')), [site.assets, mediaSearch, mediaSort])

  useEffect(() => {
    const saveImmediately = () => {
      try { localStorage.setItem(storageKey, JSON.stringify(site)) } catch { /* The visible autosave status reports storage failures. */ }
    }
    window.addEventListener('pagehide', saveImmediately)
    window.addEventListener('beforeunload', saveImmediately)
    return () => {
      window.removeEventListener('pagehide', saveImmediately)
      window.removeEventListener('beforeunload', saveImmediately)
    }
  }, [site, storageKey])

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
    let pageNumber = site.pages.length + 1
    while (site.pages.some(item => item.name.toLowerCase() === (`New page ${pageNumber}`).toLowerCase())) pageNumber++
    const pageName = `New page ${pageNumber}`
    const newPage = {
      id: freshEditorId('page'),
      name: pageName,
      slug: uniquePageSlug(pageName, site.pages),
      isHomePage: false,
      sections: [
        { id: freshEditorId('section'), kind: 'header' as const, name: 'Header', enabled: true, styles: { padding: '24px 8%', backgroundColor: '#171717' }, components: [{ id: freshEditorId('element'), kind: 'heading' as const, content: site.name, visible: true, styles: { color: '#ffffff', fontSize: '1.4rem' } }] },
        { id: freshEditorId('section'), kind: 'hero' as const, name: 'Page introduction', enabled: true, styles: { padding: '96px 8%', backgroundColor: '#f3eee5' }, components: [{ id: freshEditorId('element'), kind: 'heading' as const, content: pageName, visible: true, styles: { fontSize: '2.8rem', fontWeight: '700', color: '#171717' } }, { id: freshEditorId('element'), kind: 'text' as const, content: 'Add the content for this page in the properties panel.', visible: true, styles: { fontSize: '1rem', color: '#666666' } }] },
        { id: freshEditorId('section'), kind: 'footer' as const, name: 'Footer', enabled: true, styles: { padding: '32px 8%', backgroundColor: '#171717' }, components: [{ id: freshEditorId('element'), kind: 'text' as const, content: '© ' + site.name + '. All rights reserved.', visible: true, styles: { color: '#ffffff' } }] },
      ],
    }
    commit({ ...site, pages: [...site.pages, newPage] })
    setActivePageId(newPage.id)
    setSelectedId(newPage.sections[1].id)
    setSelectedComponentId(null)
    setEditingComponentId(null)
    setMobilePanelOpen(false)
    setMobilePropertiesOpen(false)
  }

  const renamePage = () => {
    if (!page) return
    const enteredName = window.prompt('Enter a name for this page', page.name)?.trim()
    if (!enteredName) return
    const name = uniquePageName(enteredName, site.pages, page.id)
    const slug = uniquePageSlug(name, site.pages, page.id)
    commit({ ...site, pages: site.pages.map(item => item.id === page.id ? { ...item, name, slug: item.isHomePage ? '' : slug } : item) })
  }

  const duplicatePage = () => {
    if (!page) return
    const copyName = uniquePageName(page.name + ' copy', site.pages)
    const copy = { ...page, id: freshEditorId('page'), name: copyName, slug: uniquePageSlug(copyName, site.pages), isHomePage: false, sections: page.sections.map(section => ({ ...section, id: freshEditorId('section'), styles: { ...section.styles }, components: section.components.map(item => ({ ...item, id: freshEditorId('element'), styles: { ...item.styles }, responsiveStyles: item.responsiveStyles ? Object.fromEntries(Object.entries(item.responsiveStyles).map(([mode, styles]) => [mode, { ...styles }])) : undefined })) })) }
    commit({ ...site, pages: [...site.pages, copy] })
    setActivePageId(copy.id)
    setSelectedId(copy.sections[1]?.id ?? copy.sections[0]?.id ?? '')
    setSelectedComponentId(null)
    setEditingComponentId(null)
    setMobilePanelOpen(false)
    setMobilePropertiesOpen(false)
  }

  const deletePage = () => {
    if (!page || page.isHomePage || site.pages.length <= 1) return
    if (!window.confirm(`Delete the "${page.name}" page?`)) return
    const remaining = site.pages.filter(item => item.id !== page.id)
    commit({ ...site, pages: remaining })
    setActivePageId(remaining[0].id)
    setSelectedId(remaining[0].sections[1]?.id ?? remaining[0].sections[0]?.id ?? '')
    setSelectedComponentId(null)
    setEditingComponentId(null)
    setMobilePanelOpen(false)
    setMobilePropertiesOpen(false)
  }

  const updateSection = (sectionId: string, updater: (section: SiteSection) => SiteSection) => {
    if (!page || !page.sections.some(section => section.id === sectionId)) return
    commit({ ...site, pages: site.pages.map(p => p.id === page.id ? { ...p, sections: p.sections.map(section => section.id === sectionId ? updater(section) : section) } : p) })
  }

  const addSection = (kind: SiteSection['kind']) => {
    const labels: Record<string, string> = { hero: 'Hero section', features: 'Features', gallery: 'Gallery', testimonials: 'Testimonials', pricing: 'Pricing', contact: 'Contact section' }
    const heading = kind === 'hero' ? 'Your next big idea starts here.' : labels[kind]
    const section: SiteSection = {
      id: freshEditorId('section'),
      kind, name: labels[kind] ?? 'New section', enabled: true,
      styles: { padding: '72px 8%', backgroundColor: page.sections.length % 2 ? '#f6f3ed' : '#ffffff' },
      components: [
        { id: freshEditorId('heading'), kind: 'heading', content: heading, visible: true, styles: { fontSize: '2.4rem', fontWeight: '700', color: '#171717' } },
        { id: freshEditorId('text'), kind: 'text', content: 'Add your own content here to tell your story.', visible: true, styles: { fontSize: '1rem', color: '#666666' } },
      ],
    }
    commit({ ...site, pages: site.pages.map(p => p.id === page.id ? { ...p, sections: [...p.sections.slice(0, -1), section, p.sections[p.sections.length - 1]] } : p) })
    setSelectedId(section.id)
    setSelectedComponentId(null)
    setEditingComponentId(null)
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
    const saved = { ...selectedComponent, id: freshEditorId('saved'), styles: { ...selectedComponent.styles }, responsiveStyles: selectedComponent.responsiveStyles ? Object.fromEntries(Object.entries(selectedComponent.responsiveStyles).map(([mode, styles]) => [mode, { ...styles }])) : undefined }
    commit({ ...site, savedComponents: [...(site.savedComponents ?? []), saved] })
  }

  const insertReusableComponent = (saved: NonNullable<SiteDocument['savedComponents']>[number]) => {
    if (!selected) return
    const component = { ...saved, id: freshEditorId('reuse'), styles: { ...saved.styles }, responsiveStyles: saved.responsiveStyles ? Object.fromEntries(Object.entries(saved.responsiveStyles).map(([mode, styles]) => [mode, { ...styles }])) : undefined }
    updateSection(selected.id, section => ({ ...section, components: [...section.components, component] }))
    setSelectedComponentId(component.id)
    setMobilePanelOpen(false)
  }

  const updateSelectedImageAlt = (value: string) => {
    if (!selectedComponent || selectedComponent.kind !== 'image') return
    setSite(current => ({ ...current, updatedAt: new Date().toISOString(), assets: (current.assets ?? []).map(asset => asset.dataUrl === selectedComponent.content ? { ...asset, altText: value } : asset) }))
  }

  const updateSelectedComponentStyle = (key: string, value: string) => {
    if (!selected || !selectedComponent) return
    updateSection(selected.id, section => ({ ...section, components: section.components.map(item => item.id === selectedComponent.id ? { ...item, responsiveStyles: { ...item.responsiveStyles, [device]: { ...(item.responsiveStyles?.[device] ?? {}), [key]: value } } } : item) }))
  }

  const addComponent = (kind: 'heading' | 'text' | 'button' | 'form' | 'shape') => {
    if (!selected) return
    const id = freshEditorId('element')
    const component = { id, kind: kind === 'shape' ? 'container' as const : kind, content: kind === 'heading' ? 'New heading' : kind === 'text' ? 'Add your text here.' : kind === 'button' ? 'Click here' : kind === 'form' ? 'Contact form' : '', visible: true, styles: kind === 'button' ? { backgroundColor: '#b9965b', color: '#ffffff', padding: '12px 22px', borderRadius: '6px' } : kind === 'shape' ? { backgroundColor: '#e9e2d5', minHeight: '90px', borderRadius: '12px', width: '100%' } : { color: '#171717', fontSize: kind === 'heading' ? '2rem' : '1rem' } }
    updateSection(selected.id, section => ({ ...section, components: [...section.components, component] }))
    setSelectedComponentId(id)
    setEditingComponentId(null)
  }

  const addLibraryButton = (presetId: typeof buttonLibrary[number]['id']) => {
    if (!selected) return
    const preset = buttonLibrary.find(item => item.id === presetId)
    if (!preset) return
    const id = freshEditorId('button')
    const component = {
      id, kind:'button' as const, content:preset.text, visible:true,
      linkTo:preset.href,
      buttonPreset:preset.id === 'custom' ? 'custom' as const : preset.id,
      buttonLibraryId:preset.id,
      styles:{ display:'inline-block', backgroundColor:preset.bg, color:preset.color, padding:'13px 22px', borderRadius:'999px', fontWeight:'700', textDecoration:'none', border:'1px solid transparent', cursor:'pointer', transition:'all 180ms ease' },
      hoverStyles:{ backgroundColor:preset.hoverBg, color:preset.color, transform:'translateY(-2px)', boxShadow:'0 9px 22px rgba(0,0,0,.18)' },
    }
    updateSection(selected.id, section => ({ ...section, components:[...section.components, component] }))
    setSelectedComponentId(id)
    setEditingComponentId(null)
    setMobilePanelOpen(false)
    setMobilePropertiesOpen(true)
  }

  const duplicateComponent = () => {
    if (!selected || !selectedComponent) return
    const copy = { ...selectedComponent, id: freshEditorId('element'), styles: { ...selectedComponent.styles }, responsiveStyles: selectedComponent.responsiveStyles ? Object.fromEntries(Object.entries(selectedComponent.responsiveStyles).map(([mode, styles]) => [mode, { ...styles }])) : undefined }
    updateSection(selected.id, section => ({ ...section, components: [...section.components, copy] }))
    setSelectedComponentId(copy.id)
    setEditingComponentId(null)
  }

  const deleteComponent = () => {
    if (!selected || !selectedComponent) return
    updateSection(selected.id, section => ({ ...section, components: section.components.filter(item => item.id !== selectedComponent.id) }))
    setSelectedComponentId(null)
    setEditingComponentId(null)
  }

  const addUploadedImage = async (file?: File, replaceComponentId?: string) => {
    if (!file) { setReplaceImageId(null); return }
    if (!selected) { window.alert('Select a section before adding an image.'); setReplaceImageId(null); return }
    if (!file.type.startsWith('image/')) { window.alert('Please choose a supported image file.'); setReplaceImageId(null); return }
    if (file.size > 5 * 1024 * 1024) { window.alert('Please choose an image smaller than 5 MB.'); setReplaceImageId(null); return }
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
      if (!dataUrl) { window.alert('The selected image could not be read. Please try another file.'); setReplaceImageId(null); return }
      const asset = { id: freshEditorId('asset'), name: file.name, mimeType: uploadFile.type, dataUrl, altText: file.name.replace(/\.[^.]+$/, ''), createdAt: new Date().toISOString() }
      const imageComponent = { id: replaceComponentId ?? freshEditorId('image'), kind: 'image' as const, content: dataUrl, visible: true, styles: { width: '100%', maxWidth: '520px', borderRadius: '8px' } }
      commit({ ...site, assets: [...(site.assets ?? []).filter(item => item.dataUrl !== dataUrl), asset], pages: site.pages.map(p => p.id === page.id ? { ...p, sections: p.sections.map(section => section.id === selected.id ? { ...section, components: replaceComponentId ? section.components.map(item => item.id === replaceComponentId ? { ...item, content: dataUrl } : item) : [...section.components, imageComponent] } : section) } : p) })
      setSelectedComponentId(imageComponent.id)
      setReplaceImageId(null)
      setMobilePanelOpen(false)
    }
    reader.onerror = () => { window.alert('The selected image could not be read. Please try another file.'); setReplaceImageId(null) }
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
    commit({ ...site, pages: site.pages.map(p => p.id === page.id ? { ...p, sections: remaining } : p) })
    setSelectedId(remaining[1]?.id ?? remaining[0]?.id ?? '')
    setSelectedComponentId(null)
    setEditingComponentId(null)
  }

  const duplicateSection = () => {
    if (!selected || ['header', 'footer'].includes(selected.kind)) return
    const copy: SiteSection = {
      ...selected,
      id: freshEditorId('section'),
      name: (() => {
        const names = new Set(page.sections.map(section => section.name.toLowerCase()))
        let name = selected.name + ' copy'
        let suffix = 2
        while (names.has(name.toLowerCase())) name = selected.name + ' copy ' + suffix++
        return name
      })(),
      styles: { ...selected.styles },
      components: selected.components.map(item => ({
        ...item,
        id: freshEditorId('element'),
        styles: { ...item.styles },
        responsiveStyles: item.responsiveStyles ? Object.fromEntries(Object.entries(item.responsiveStyles).map(([mode, styles]) => [mode, { ...styles }])) : undefined,
      })),
    }
    const index = page.sections.findIndex(section => section.id === selected.id)
    const sections = [...page.sections]
    sections.splice(index + 1, 0, copy)
    commit({ ...site, pages: site.pages.map(item => item.id === page.id ? { ...item, sections } : item) })
    setSelectedId(copy.id)
    setSelectedComponentId(null)
    setEditingComponentId(null)
  }

  const moveSection = (direction: -1 | 1, sectionId?: string) => {
    const movingId = sectionId ?? selected?.id
    if (!movingId || !page) return
    const index = page.sections.findIndex(section => section.id === movingId)
    const target = index + direction
    if (index <= 0 || target <= 0 || target >= page.sections.length - 1) return
    const reordered = [...page.sections]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    commit({ ...site, pages: site.pages.map(item => item.id === page.id ? { ...item, sections: reordered } : item) })
    setSelectedId(movingId)
    setSelectedComponentId(null)
    setEditingComponentId(null)
  }

  const undo = () => {
    const previous = history[history.length - 1]
    if (!previous) return
    setFuture(items => [site, ...items].slice(0, 30))
    setHistory(items => items.slice(0, -1))
    setSite({ ...previous, updatedAt: new Date().toISOString() })
  }
  const redo = () => {
    const next = future[0]
    if (!next) return
    setHistory(items => [...items.slice(-29), site])
    setFuture(items => items.slice(1))
    setSite({ ...next, updatedAt: new Date().toISOString() })
  }

  useEffect(() => {
    const handleEditorShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.key === 'Escape') {
        if (editingComponentId) setEditingComponentId(null)
        else if (exportOpen) setExportOpen(false)
        else if (mobilePropertiesOpen) setMobilePropertiesOpen(false)
        else if (mobilePanelOpen) setMobilePanelOpen(false)
        else if (previewMode) setPreviewMode(false)
        return
      }
      if (!(event.ctrlKey || event.metaKey)) return
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
  }, [history, future, site, editingComponentId, exportOpen, mobilePropertiesOpen, mobilePanelOpen, previewMode])


  const downloadTextFile = (fileName: string, content: string, mimeType: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  const downloadSourceFile = (kind: 'html' | 'css' | 'js') => {
    try {
      const files = buildExportFiles(site)
      if (kind === 'html') downloadTextFile('index.html', files.htmlFiles['index.html'] ?? Object.values(files.htmlFiles)[0] ?? '', 'text/html')
      if (kind === 'css') downloadTextFile('styles.css', files.css, 'text/css')
      if (kind === 'js') downloadTextFile('script.js', files.js, 'text/javascript')
      setExportMessage(kind.toUpperCase() + ' source file downloaded.')
    } catch {
      setExportMessage('The source file could not be prepared. Please try again.')
    }
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
      const pageNames = Object.keys(files.htmlFiles)
      const assetNames = Object.keys(files.assets)
      const pageList = pageNames.map(fileName => '  - ' + fileName).join('\n')
      const assetCount = assetNames.length
      const manifest = {
        format: 'dsquare-studio-website-export',
        version: 1,
        siteName: site.name,
        generatedAt: new Date().toISOString(),
        language: site.metadata.language || 'en',
        pages: pageNames,
        stylesheets: ['styles.css'],
        scripts: ['script.js'],
        assets: assetNames,
        notes: ['Contact forms are front-end previews only.', 'Hosting, domains, databases and payment services are not included.'],
      }
      zip.file('manifest.json', JSON.stringify(manifest, null, 2))
      zip.file('README.txt', 'WEBSITE SOURCE PACKAGE\n' + site.name + '\n\n' +
        'GETTING STARTED\n' +
        '1. Keep the folder structure unchanged.\n' +
        '2. Open index.html in a browser to preview the website.\n' +
        '3. Upload the complete folder to a static web host to publish it.\n\n' +
        'PAGES INCLUDED\n' + pageList + '\n\n' +
        'PACKAGE CONTENTS\n' +
        '- manifest.json: machine-readable inventory and export details.\n' +
        '- styles.css: shared website styles and responsive rules.\n' +
        '- script.js: small front-end interaction script.\n' +
        '- assets/: ' + assetCount + ' packaged image asset(s).\n\n' +
        'IMPORTANT NOTES\n' +
        '- Contact forms are front-end previews only. Connect a secure form service before collecting messages.\n' +
        '- No hosting account, domain, database or payment service is included.\n' +
        '- Keep all page files, styles.css, script.js and assets/ together.\n\n' +
        'Created with DSQUARE STUDIO.\n')
      const blob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        metadata => {
          const percent = Math.max(0, Math.min(100, Math.round(metadata.percent)))
          setExportMessage('Preparing ZIP… ' + percent + '%')
        },
      )
      const safeName = site.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'website'
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = safeName + '-website-source.zip'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 10000)
      setExportMessage('Your complete website source ZIP is ready.')
    } catch {
      setExportMessage('The export could not be created. Please try again.')
    } finally {
      setExportBusy(false)
    }
  }

  useEffect(() => {
    if (!exportOpen) {
      exportTriggerRef.current?.focus()
      return
    }
    const timer = window.setTimeout(() => exportCloseRef.current?.focus(), 0)
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !exportBusy) setExportOpen(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => { window.clearTimeout(timer); window.removeEventListener('keydown', onKeyDown) }
  }, [exportOpen, exportBusy])

  const canvasClass = useMemo(() => { const variant = Math.max(1, Math.min(10, site.metadata.templateVariant ?? 1)); const specialtyClass = site.category === 'Business' ? `business-template business-variant-${variant}` : site.category === 'Portfolio' ? `portfolio-template portfolio-variant-${variant}` : site.category === 'E-commerce' ? `commerce-template commerce-variant-${variant}` : site.category === 'Blog / Magazine' ? `journal-template journal-variant-${variant}` : site.category === 'Restaurant' ? `restaurant-template restaurant-variant-${variant}` : site.category === 'Education' ? `education-template education-variant-${variant}` : site.category === 'Real Estate' ? `realestate-template realestate-variant-${variant}` : site.category === 'Agency' ? `agency-template agency-variant-${variant}` : site.category === 'Landing page' ? `landing-template landing-variant-${variant}` : site.category === 'School' ? `school-template school-variant-${variant}` : site.category === 'Community' ? `community-template community-variant-${variant}` : site.category === 'Healthcare' ? `healthcare-template healthcare-variant-${variant}` : site.category === 'Beauty & Wellness' ? `beauty-template beauty-variant-${variant}` : site.category === 'Hotel & Travel' ? `hotel-template hotel-variant-${variant}` : site.category === 'Finance' ? `finance-template finance-variant-${variant}` : site.category === 'Technology / SaaS' ? `saas-template saas-variant-${variant}` : site.category === 'Non-profit' ? `nonprofit-template nonprofit-variant-${variant}` : site.category === 'Events' ? `events-template events-variant-${variant}` : site.category === 'Construction' ? `construction-template construction-variant-${variant}` : site.category === 'Legal' ? `legal-template legal-variant-${variant}` : site.category === 'Automotive' ? `automotive-template automotive-variant-${variant}` : site.category === 'Fitness & Sports' ? `fitness-template fitness-variant-${variant}` : site.category === 'Wedding' ? `wedding-template wedding-variant-${variant}` : site.category === 'Pet Care' ? `petcare-template petcare-variant-${variant}` : site.category === 'Music & Entertainment' ? `music-template music-variant-${variant}` : site.category === 'Personal Services' ? `personal-template personal-variant-${variant}` : site.category === 'Photography' ? `photography-template photography-variant-${variant}` : site.category === 'Fashion & Apparel' ? `fashion-template fashion-variant-${variant}` : site.category === 'Church & Ministry' ? `church-template church-variant-${variant}` : site.category === 'Agriculture' ? `agriculture-template agriculture-variant-${variant}` : site.category === 'Logistics & Delivery' ? `logistics-template logistics-variant-${variant}` : site.category === 'Interior Design' ? `interior-template interior-variant-${variant}` : site.category === 'Other' ? `other-template other-variant-${variant}` : ''; return `editor-canvas device-${device} ${specialtyClass}` }, [device, site.category, site.metadata.templateVariant])

  return <div className={`visual-editor ${previewMode ? "preview-mode" : ""} ${mobilePanelOpen ? "mobile-panel-open" : ""} ${mobilePropertiesOpen ? "mobile-properties-open" : ""}`}>
    <header className="editor-topbar">
      <button className="editor-back" onClick={onExit}><ArrowLeft size={17} /><span>Back to studio</span></button>
      <div className="editor-project-name"><strong>{site.name}</strong><span><i /> {savedAt}</span></div>
      {previewMode && <label className="preview-page-switch"><span>PAGE</span><select aria-label="Preview website page" value={page?.id ?? ''} onChange={event => { const nextPage = site.pages.find(item => item.id === event.target.value); if (nextPage) { setActivePageId(nextPage.id); setSelectedId(nextPage.sections[1]?.id ?? nextPage.sections[0]?.id ?? ''); setSelectedComponentId(null); requestAnimationFrame(() => previewScrollRef.current?.scrollTo({ top: 0 })) } }}>{site.pages.map(item => <option key={item.id} value={item.id}>{item.name}{item.isHomePage ? ' (Home)' : ''}</option>)}</select></label>}
      <div className="editor-top-actions">
        <button className={`editor-preview editor-code-toggle ${codeMode ? 'active' : ''}`} onClick={() => { setCodeMode(value => !value); setPreviewMode(false) }} aria-pressed={codeMode}><Code2 size={15} /> {codeMode ? 'Visual editor' : 'Code'}</button>
        <button className="editor-tool" onClick={undo} disabled={!history.length} aria-label="Undo"><Undo2 size={17} /></button>
        <button className="editor-tool" onClick={redo} disabled={!future.length} aria-label="Redo"><Redo2 size={17} /></button>
        <button className="editor-preview" onClick={() => { setEditingComponentId(null); setPreviewMode(value => !value); previewScrollRef.current?.scrollTo({ top: 0 }) }} aria-pressed={previewMode}><Eye size={15} /> {previewMode ? "Exit preview" : "Preview"}</button>
        <button ref={exportTriggerRef} className="editor-preview editor-export" onClick={() => { setExportMessage(""); setExportOpen(true) }}><Download size={15} /> Export</button>
        <button className="primary-button editor-save" onClick={() => { try { localStorage.setItem(storageKey, JSON.stringify(site)); setSavedAt('Saved just now') } catch { setSavedAt('Could not save — storage is full') } }}><Save size={14} /> Save</button>
      </div>
    </header>
    {codeMode ? <CodeEditor site={site} onApply={customCode => commit({ ...site, customCode })} onClose={() => setCodeMode(false)} /> : <div className="editor-workspace">
      <aside className="editor-left-panel">
        <div className="editor-panel-tabs">
          <button className={panel === 'add' ? 'active' : ''} onClick={() => setPanel('add')}><Plus size={14} /> Add</button>
          <button className={panel === 'layers' ? 'active' : ''} onClick={() => setPanel('layers')}><Layers3 size={14} /> Layers</button>
          <button className={panel === 'media' ? 'active' : ''} onClick={() => setPanel('media')}><Image size={14} /> Media</button>
          <button className={panel === 'seo' ? 'active' : ''} onClick={() => setPanel('seo')}><Settings2 size={14} /> SEO</button>
          <button className={panel === 'ai' ? 'active' : ''} onClick={() => setPanel('ai')}><Sparkles size={14} /> AI Edit</button><button className="mobile-panel-close" onClick={() => setMobilePanelOpen(false)} aria-label="Close panel"><X size={15} /></button>
        </div>
        {panel === 'add' ? <div className="editor-panel-content"><div className="editor-panel-heading"><strong>Sections</strong><span>BUILD YOUR PAGE</span></div>{sectionOptions.map(item => <button className="add-section-item" key={item.kind} onClick={() => addSection(item.kind)}><span className="add-section-icon">{item.kind === 'gallery' ? <Image size={17} /> : item.kind === 'hero' ? <MousePointer2 size={17} /> : <Type size={17} />}</span><span><strong>{item.label}</strong><small>{item.description}</small></span><Plus size={14} /></button>)}<div className="editor-panel-heading reusable-heading"><strong>Button library</strong><span>{buttonLibrary.length} READY-MADE</span></div><label className="property-label button-library-search">Find a button<input type="search" value={buttonSearch} onChange={event => setButtonSearch(event.target.value)} placeholder="Search social, contact or action buttons" /></label><div className="button-library-grid">{buttonLibrary.filter(item => `${item.label} ${item.text}`.toLowerCase().includes(buttonSearch.trim().toLowerCase())).map(item => <button type="button" key={item.id} onClick={() => addLibraryButton(item.id)}><span className="button-library-swatch" style={{backgroundColor:item.bg,color:item.color}}>{item.id === 'whatsapp' ? 'W' : item.id === 'facebook' ? 'f' : item.id === 'instagram' ? '◎' : item.id === 'tiktok' ? '♪' : item.id === 'youtube' ? '▶' : item.id === 'linkedin' ? 'in' : item.id === 'x' ? 'X' : item.id === 'email' ? '✉' : item.id === 'call' ? '☎' : item.id === 'telegram' ? '➤' : item.id === 'pinterest' ? 'P' : item.id === 'snapchat' ? '👻' : item.id === 'threads' ? '@' : item.id === 'discord' ? '◉' : item.id === 'maps' ? '⌖' : item.id === 'booking' ? '▣' : item.id === 'quote' ? '❞' : item.id === 'download' ? '↓' : item.id === 'cta' ? '↗' : '+'}</span><span><strong>{item.label}</strong><small>Tap to add</small></span><Plus size={13}/></button>)}</div>{(site.savedComponents ?? []).length > 0 && <><div className="editor-panel-heading reusable-heading"><strong>Reusable elements</strong><span>{site.savedComponents?.length} SAVED</span></div>{(site.savedComponents ?? []).map(saved => <button className="add-section-item" key={saved.id} onClick={() => insertReusableComponent(saved)}><span className="add-section-icon"><Plus size={16} /></span><span><strong>{saved.kind}</strong><small>{saved.content.slice(0,42) || 'Saved design element'}</small></span><Plus size={14} /></button>)}</>}</div> : panel === 'layers' ? <div className="editor-panel-content"><div className="editor-panel-heading"><strong>Page layers</strong><span>{visibleLayers.length}/{page.sections.length} SECTIONS</span></div><label className="property-label layer-search-label">Find a section<input type="search" value={layerSearch} onChange={event => setLayerSearch(event.target.value)} placeholder="Search section name or type" /></label>{visibleLayers.length ? visibleLayers.map(({ section, index }) => <button key={section.id} className={selected?.id === section.id ? 'layer-item selected' : 'layer-item'} onClick={() => { setSelectedId(section.id); setSelectedComponentId(null); setEditingComponentId(null) }} aria-pressed={selected?.id === section.id}><span>{String(index + 1).padStart(2, '0')}</span><strong>{section.name}</strong><small>{section.kind}{section.enabled ? '' : ' · Hidden'}</small></button>) : <p className="seo-help">No sections match that search.</p>}</div> : panel === 'media' ? <div className="editor-panel-content"><div className="editor-panel-heading"><strong>Media library</strong><span>{visibleAssets.length}/{(site.assets ?? []).length} FILES</span></div><button className="add-image-control" onClick={() => { setReplaceImageId(null); imageInputRef.current?.click() }}><Plus size={14} /> Upload image</button><label className="property-label media-search-label">Find an image<input type="search" value={mediaSearch} onChange={event => setMediaSearch(event.target.value)} placeholder="Search filename or description" /></label><label className="property-label media-search-label">Sort images<select value={mediaSort} onChange={event => setMediaSort(event.target.value as 'newest' | 'name' | 'largest')}><option value="newest">Newest first</option><option value="name">Name (A–Z)</option><option value="largest">Largest first</option></select></label>{visibleAssets.length ? visibleAssets.map(asset => <div className="media-library-item" key={asset.id}><img src={asset.dataUrl} alt={asset.altText} /><div><strong>{asset.name}</strong><small>{Math.round(asset.dataUrl.length * .75 / 1024)} KB approx.</small><label className="media-alt-label">Image description (alt text)<input value={asset.altText} placeholder="Describe this image" onChange={event => setSite(current => ({ ...current, assets: (current.assets ?? []).map(item => item.id === asset.id ? { ...item, altText: event.target.value } : item) }))} /></label><button onClick={() => { if (!selected) return; const component = { id: freshEditorId('image'), kind: 'image' as const, content: asset.dataUrl, visible: true, styles: { width: '100%', maxWidth: '520px', borderRadius: '8px' } }; updateSection(selected.id, section => ({ ...section, components: [...section.components, component] })); setSelectedComponentId(component.id); setMobilePanelOpen(false) }}>Add to selected section</button><button onClick={() => { if (window.confirm('Remove this image from the media library? Existing page placements will remain in place.')) commit({ ...site, assets: (site.assets ?? []).filter(item => item.id !== asset.id) }) }}>Remove from library</button></div></div>) : <p className="seo-help">No images match that search.</p>}</div> : panel === 'seo' ? <div className="editor-panel-content"><div className="editor-panel-heading"><strong>SEO & site settings</strong><span>SEARCH PREVIEW</span></div><label className="property-label">Website title<input maxLength={70} value={site.metadata.title} onChange={event => commit({ ...site, metadata: { ...site.metadata, title: event.target.value } })} /></label><small className="seo-counter">{site.metadata.title.length}/70 characters</small><label className="property-label">Meta description<textarea rows={4} maxLength={320} value={site.metadata.description} onChange={event => commit({ ...site, metadata: { ...site.metadata, description: event.target.value } })} /></label><small className="seo-counter">{site.metadata.description.length}/320 characters</small><label className="property-label">Site language<select value={site.metadata.language} onChange={event => commit({ ...site, metadata: { ...site.metadata, language: event.target.value } })}><option value="en">English</option><option value="en-GB">English (UK)</option><option value="en-NG">English (Nigeria)</option><option value="fr">French</option><option value="es">Spanish</option><option value="pt">Portuguese</option><option value="ar">Arabic</option><option value="ha">Hausa</option><option value="yo">Yoruba</option><option value="ig">Igbo</option></select></label><p className="seo-help">These settings are added to the HTML pages when you export your website.</p></div> : panel === 'ai' ? <div className="editor-panel-content"><div className="editor-panel-heading"><strong>AI quick edits</strong><span>LOCAL COMMANDS</span></div><p className="ai-edit-note">Describe a simple change in everyday language. This first version runs safely in your browser; it is not connected to a real AI model yet.</p><form className="ai-edit-form" onSubmit={runAiEditCommand}><label className="property-label">What should I change?<textarea rows={4} value={aiEditCommand} onChange={event => setAiEditCommand(event.target.value)} placeholder="e.g. Change the background to navy" /></label><button className="ai-edit-submit" type="submit" disabled={!aiEditCommand.trim()}><Sparkles size={14} /> Apply instruction</button></form>{aiEditMessage && <p className="ai-edit-message" role="status">{aiEditMessage}</p>}<div className="ai-edit-examples"><strong>Try these</strong><button type="button" onClick={() => setAiEditCommand('Change the background to cream')}>Change the background to cream</button><button type="button" onClick={() => setAiEditCommand('Change the primary colour to blue')}>Change the primary colour to blue</button><button type="button" onClick={() => setAiEditCommand('Change the heading to Welcome to our studio')}>Change the heading text</button><button type="button" onClick={() => setAiEditCommand('Add a testimonials section')}>Add a testimonials section</button><button type="button" onClick={() => setAiEditCommand('Add a gallery section')}>Add a gallery section</button></div></div> : null}
        <div className="editor-panel-foot"><Sparkles size={14} /> Select a section to edit its content.</div>
      </aside>
      <main className="editor-stage">
        <div className="editor-stage-toolbar"><div><select className="editor-page-select" aria-label="Choose page" value={page.id} onChange={event => { const nextPage = site.pages.find(item => item.id === event.target.value); if (nextPage) { setActivePageId(nextPage.id); setSelectedId(nextPage.sections[1]?.id ?? nextPage.sections[0]?.id ?? ''); setSelectedComponentId(null); setEditingComponentId(null); setMobilePanelOpen(false); setMobilePropertiesOpen(false) } }}>{site.pages.map(item => <option key={item.id} value={item.id}>{item.name}{item.isHomePage ? ' (Home)' : ''}</option>)}</select><button className="editor-page-action" onClick={addPage}>+ Page</button><button className="editor-page-action" onClick={renamePage}>Rename</button><button className="editor-page-action" onClick={duplicatePage}>Duplicate</button><button className="editor-page-action" onClick={deletePage} disabled={page.isHomePage || site.pages.length <= 1}>Delete</button><span className="editor-stage-muted">/</span><span className="editor-stage-muted">Editing</span></div><div className="device-switch"><button className={device === 'desktop' ? 'selected' : ''} onClick={() => setDevice('desktop')} aria-label="Desktop preview" aria-pressed={device === 'desktop'}><Monitor size={16} /></button><button className={device === 'tablet' ? 'selected' : ''} onClick={() => setDevice('tablet')} aria-label="Tablet preview" aria-pressed={device === 'tablet'}><Tablet size={16} /></button><button className={device === 'mobile' ? 'selected' : ''} onClick={() => setDevice('mobile')} aria-label="Mobile preview" aria-pressed={device === 'mobile'}><Smartphone size={16} /></button></div></div>
        <div ref={previewScrollRef} className="editor-canvas-wrap"><div className={canvasClass}>
          {page.sections.filter(section => section.enabled).map(section => <section key={section.id} tabIndex={0} aria-label={section.name + ' section'} aria-selected={selected?.id === section.id} onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) { event.preventDefault(); setSelectedId(section.id); moveSection(event.key === 'ArrowUp' ? -1 : 1, section.id) } else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedId(section.id); setSelectedComponentId(null) } }} draggable={!previewMode && !['header','footer'].includes(section.kind)} onDragStart={event => { if (['header','footer'].includes(section.kind)) { event.preventDefault(); return } setDraggedSectionId(section.id); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', section.id) }} onDragOver={event => { if (draggedSectionId) event.preventDefault() }} onDrop={event => { event.preventDefault(); const sourceId = event.dataTransfer.getData('text/plain') || draggedSectionId; if (sourceId) moveSectionTo(sourceId, section.id); setDraggedSectionId(null) }} onDragEnd={() => setDraggedSectionId(null)} data-section-id={section.id} onTouchMove={event => { if (draggedSectionId) event.preventDefault() }} onTouchEnd={event => { if (!draggedSectionId) return; const touch = event.changedTouches[0]; const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('[data-section-id]') as HTMLElement | null; const targetId = target?.dataset.sectionId; if (targetId && targetId !== draggedSectionId) moveSectionTo(draggedSectionId, targetId); setDraggedSectionId(null) }} onClick={() => { setSelectedId(section.id); setSelectedComponentId(null); setEditingComponentId(null) }} onDoubleClick={event => { if (!previewMode) { event.stopPropagation(); setSelectedId(section.id); setSelectedComponentId(null); setMobilePanelOpen(false); setMobilePropertiesOpen(true) } }} className={'site-preview-section ' + (selected?.id === section.id ? 'is-selected ' : '') + (draggedSectionId === section.id ? 'is-dragging ' : '') + 'section-' + section.kind} style={section.styles}>
            {section.components.filter(item => item.visible).map(item => { const selectItem = (event: MouseEvent) => { event.stopPropagation(); setSelectedId(section.id); setSelectedComponentId(item.id) }; const openItemEditor = (event: MouseEvent, inline = false) => { event.stopPropagation(); setSelectedId(section.id); setSelectedComponentId(item.id); setMobilePanelOpen(false); setMobilePropertiesOpen(true); if (inline) setEditingComponentId(item.id) }; const selectedClass = selectedComponentId === item.id ? 'component-selected' : ''; const responsiveElementStyle: StyleMap = { ...item.styles, ...(item.responsiveStyles?.[device] ?? {}) }; const elementStyle: StyleMap = { ...responsiveElementStyle, ...(item.kind === 'image' ? { display:'block', width:responsiveElementStyle.width ?? '100%', maxWidth:'100%', height:responsiveElementStyle.height ?? 'clamp(220px, 34vw, 440px)', objectFit:responsiveElementStyle.objectFit ?? 'cover', objectPosition:responsiveElementStyle.objectPosition ?? 'center', borderRadius:responsiveElementStyle.borderRadius ?? '18px' } : {}) }; const handleElementClick = (event: MouseEvent) => {
              if (previewMode && item.kind === 'button' && item.linkTo?.trim()) {
                const destination = item.linkTo.trim()
                if (destination.startsWith('/') || destination.startsWith('#')) {
                  event.preventDefault()
                  const targetSlug = destination.startsWith('#') ? '' : destination.split('/').filter(Boolean).join('/')
                  const targetPage = site.pages.find(candidate => candidate.slug.split('/').filter(Boolean).join('/') === targetSlug || (targetSlug === '' && candidate.isHomePage))
                  if (targetPage) { setActivePageId(targetPage.id); setSelectedId(targetPage.sections[1]?.id ?? targetPage.sections[0]?.id ?? '') }
                  else if (destination.startsWith('#')) document.getElementById(destination.slice(1))?.scrollIntoView({behavior:'smooth'})
                  return
                }
                if (destination.startsWith('https://') || destination.startsWith('http://') || destination.startsWith('mailto:') || destination.startsWith('tel:')) {
                  event.preventDefault()
                  if (item.openInNewTab) window.open(destination, '_blank', 'noopener,noreferrer')
                  else window.location.href = destination
                  return
                }
              }
              selectItem(event)
            }; const handleElementKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => { if (event.key === 'Escape' && editingComponentId === item.id) { event.preventDefault(); event.currentTarget.blur(); setEditingComponentId(null) } else if (event.key === 'Enter' && editingComponentId === item.id && ['heading','button'].includes(item.kind)) { event.preventDefault(); event.currentTarget.blur() } else if ((event.key === 'Enter' || event.key === ' ') && editingComponentId !== item.id) { event.preventDefault(); event.stopPropagation(); setSelectedId(section.id); setSelectedComponentId(item.id) } else if (event.key === 'F2' && ['heading','text','button','container'].includes(item.kind)) { event.preventDefault(); setSelectedId(section.id); setSelectedComponentId(item.id); setEditingComponentId(item.id) } }; return item.kind === 'heading' ? <h2 key={item.id} tabIndex={0} aria-label={'Select heading: ' + item.content} onKeyDown={handleElementKeyDown} className={selectedClass} onClick={handleElementClick} onDoubleClick={event => openItemEditor(event, true)} contentEditable={editingComponentId === item.id} suppressContentEditableWarning onBlur={event => editingComponentId === item.id && finishInlineEdit(item.id, event.currentTarget.textContent ?? '')} style={elementStyle as CSSProperties}>{item.content}</h2> : item.kind === 'text' ? <p key={item.id} tabIndex={0} aria-label={'Select text: ' + item.content} onKeyDown={handleElementKeyDown} className={selectedClass} onClick={handleElementClick} onDoubleClick={event => openItemEditor(event, true)} contentEditable={editingComponentId === item.id} suppressContentEditableWarning onBlur={event => editingComponentId === item.id && finishInlineEdit(item.id, event.currentTarget.textContent ?? '')} style={elementStyle as CSSProperties}>{item.content}</p> : item.kind === 'button' ? <button key={item.id} type="button" onKeyDown={handleElementKeyDown} aria-label={'Select button: ' + item.content} className={selectedClass} onClick={handleElementClick} onMouseEnter={event => { if (!previewMode) return; Object.entries(item.hoverStyles ?? {}).forEach(([key,value]) => event.currentTarget.style.setProperty(key.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase()),String(value))) }} onMouseLeave={event => { if (!previewMode) return; Object.keys(item.hoverStyles ?? {}).forEach(key => { const cssKey=key.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase()); const base=(elementStyle as Record<string, string | number | undefined>)[key]; if (base === undefined) event.currentTarget.style.removeProperty(cssKey); else event.currentTarget.style.setProperty(cssKey,String(base)) }) }} onDoubleClick={event => openItemEditor(event, false)} contentEditable={editingComponentId === item.id} suppressContentEditableWarning onBlur={event => editingComponentId === item.id && finishInlineEdit(item.id, event.currentTarget.textContent ?? '')} style={elementStyle as CSSProperties}>{item.content}</button> : item.kind === 'image' ? (() => {
              const beginImageGesture = (event: ReactPointerEvent<HTMLElement>, mode: 'move' | 'resize', handle = 'se') => {
                if (previewMode || editingComponentId === item.id) return
                event.preventDefault(); event.stopPropagation(); selectItem(event as unknown as MouseEvent)
                const image = (event.currentTarget.closest('.image-canvas-wrap')?.querySelector('img') ?? event.currentTarget) as HTMLImageElement
                const startX = event.clientX, startY = event.clientY
                const rect = image.getBoundingClientRect()
                const initialWidth = rect.width, initialHeight = rect.height
                const initialX = Number(elementStyle['imageX'] ?? 0), initialY = Number(elementStyle['imageY'] ?? 0)
                let lastDx = 0, lastDy = 0
                const dimensions = (dx: number, dy: number) => {
                  const west = handle.includes('w'), north = handle.includes('n')
                  return {
                    width: Math.max(40, initialWidth + (west ? -dx : handle.includes('e') ? dx : 0)),
                    height: Math.max(40, initialHeight + (north ? -dy : handle.includes('s') ? dy : 0)),
                    x: initialX + (west ? dx : 0),
                    y: initialY + (north ? dy : 0),
                  }
                }
                const pointerMove = (move: PointerEvent) => {
                  lastDx = move.clientX - startX; lastDy = move.clientY - startY
                  if (mode === 'move') image.style.translate = `${lastDx}px ${lastDy}px`
                  else {
                    const next = dimensions(lastDx, lastDy)
                    image.style.width = `${next.width}px`
                    image.style.height = `${next.height}px`
                  }
                }
                const cleanup = () => {
                  window.removeEventListener('pointermove', pointerMove)
                  window.removeEventListener('pointerup', finishGesture)
                  window.removeEventListener('pointercancel', cancelGesture)
                  image.style.translate = ''
                  image.style.width = ''
                  image.style.height = ''
                }
                const finishGesture = () => {
                  cleanup()
                  if (mode === 'move') {
                    updateSection(section.id, current => ({
                      ...current,
                      components: current.components.map(component => component.id !== item.id ? component : ({
                        ...component,
                        responsiveStyles: {
                          ...component.responsiveStyles,
                          [device]: { ...(component.responsiveStyles?.[device] ?? {}), imageX: String(initialX + lastDx), imageY: String(initialY + lastDy) },
                        },
                      })),
                    }))
                  } else {
                    const next = dimensions(lastDx, lastDy)
                    updateSection(section.id, current => ({
                      ...current,
                      components: current.components.map(component => component.id !== item.id ? component : ({
                        ...component,
                        responsiveStyles: {
                          ...component.responsiveStyles,
                          [device]: {
                            ...(component.responsiveStyles?.[device] ?? {}),
                            width: `${next.width}px`,
                            height: `${next.height}px`,
                            imageX: String(next.x),
                            imageY: String(next.y),
                          },
                        },
                      })),
                    }))
                  }
                }
                const cancelGesture = () => cleanup()
                window.addEventListener('pointermove', pointerMove)
                window.addEventListener('pointerup', finishGesture, { once: true })
                window.addEventListener('pointercancel', cancelGesture, { once: true })
              }
              return <div key={item.id} className={'image-canvas-wrap ' + selectedClass} onClick={handleElementClick} onDoubleClick={event => openItemEditor(event, false)}>
                {selectedComponentId === item.id && !previewMode && <button type="button" className="image-inline-replace" onPointerDown={event => event.stopPropagation()} onClick={event => { event.preventDefault(); event.stopPropagation(); setReplaceImageId(item.id); imageInputRef.current?.click() }} title="Replace this image with your own">Replace image</button>}<img tabIndex={0} aria-label="Select image element; drag to move" onKeyDown={handleElementKeyDown} onPointerDown={event => beginImageGesture(event, 'move')} style={{ ...elementStyle, position: 'relative', touchAction: 'none', transform: `translate(${elementStyle['imageX'] ?? '0'}px, ${elementStyle['imageY'] ?? '0'}px) rotate(${elementStyle['rotation'] ?? '0'}deg) scaleX(${elementStyle['flipX'] === 'true' ? -1 : 1}) scaleY(${elementStyle['flipY'] === 'true' ? -1 : 1})`, transformOrigin: 'center center', cursor: previewMode ? 'default' : 'move' } as CSSProperties} src={item.content} alt={(site.assets ?? []).find(asset => asset.dataUrl === item.content)?.altText ?? ''} />
                {selectedComponentId === item.id && !previewMode && ['nw','n','ne','e','se','s','sw','w'].map(handle => <button key={handle} type="button" className={'image-resize-handle handle-' + handle} aria-label={'Resize image from ' + handle + ' edge'} title={'Drag to resize from ' + handle} onPointerDown={event => beginImageGesture(event, 'resize', handle)} />)}
              </div>
            })() : item.kind === 'form' ? <form key={item.id} className="site-preview-form" onSubmit={event => { event.preventDefault(); if (previewMode) window.alert('Form preview only. Connect a form service before publishing to receive submissions.') }} onClick={selectItem}><input aria-label="Your name" placeholder="Your name" required /><input aria-label="Email address" type="email" placeholder="Email address" required /><textarea aria-label="Your message" placeholder="Your message" required /><button type="submit">Send message</button></form> : item.kind === 'container' ? <div key={item.id} tabIndex={0} aria-label={'Select container: ' + item.content} onKeyDown={handleElementKeyDown} className={selectedClass} onClick={handleElementClick} onDoubleClick={event => openItemEditor(event, true)} contentEditable={editingComponentId === item.id} suppressContentEditableWarning onBlur={event => editingComponentId === item.id && finishInlineEdit(item.id, event.currentTarget.textContent ?? '')} style={elementStyle as CSSProperties}>{item.content}</div> : null })}
            {section.kind === 'header' && site.pages.length > 1 && <nav className="site-page-navigation" aria-label="Website pages">{[...site.pages.filter(navPage => navPage.isHomePage), ...site.pages.filter(navPage => !navPage.isHomePage)].map(navPage => <button key={navPage.id} type="button" className={navPage.id === page.id ? 'active' : ''} onClick={event => { event.stopPropagation(); setActivePageId(navPage.id); setSelectedId(navPage.sections[1]?.id ?? navPage.sections[0]?.id ?? ''); setSelectedComponentId(null); setEditingComponentId(null); setMobilePanelOpen(false); setMobilePropertiesOpen(false) }}>{navPage.name}</button>)}</nav>}
            {section.components.length === 0 && <span className="site-preview-placeholder">{section.name}</span>}
            <span className="section-selection-label">{section.name}</span>{!previewMode && !['header','footer'].includes(section.kind) && <button type="button" className="section-touch-drag-handle" aria-label={'Move ' + section.name} title="Hold and drag to move section" onClick={event => event.stopPropagation()} onTouchStart={event => { event.stopPropagation(); setDraggedSectionId(section.id) }} onKeyDown={event => { if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) { event.preventDefault(); setSelectedId(section.id); moveSection(event.key === 'ArrowUp' ? -1 : 1, section.id) } }}>⠿</button>}
          </section>)}
          {previewMode && previewContactSection && <button type="button" className="preview-floating-contact" onClick={() => previewScrollRef.current?.querySelector('[data-section-id="' + previewContactSection.id + '"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><span className="preview-floating-spark">✦</span> Let's talk <span aria-hidden="true">↗</span></button>}
          {previewMode && <button type="button" className={'preview-back-top ' + (previewScrolled ? 'is-visible' : '')} aria-label="Back to top" onClick={() => previewScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>}
        </div></div>
      </main>
      <aside className="editor-right-panel"><div className="editor-properties-heading"><div><Settings2 size={16} /><strong>Edit selection</strong></div><span>{selectedComponent ? selectedComponent.kind.toUpperCase() : "SECTION"}</span><button className="mobile-properties-close" onClick={() => setMobilePropertiesOpen(false)} aria-label="Close properties"><X size={16} /></button></div>{selected ? <div className="editor-properties"><div className="inspector-intro"><strong>{selectedComponent ? `Editing ${selectedComponent.kind}` : `Editing ${selected?.name ?? "section"}`}</strong><small>{selectedComponent ? "Choose a group below to change this item." : "Choose a group below to customise this section."}</small></div>
        <details className="inspector-group" open><summary>Content & visibility</summary><div className="inspector-group-body">
        <label className="property-label section-visibility-toggle"><input type="checkbox" checked={selected.enabled} onChange={event => updateSection(selected.id, section => ({ ...section, enabled: event.target.checked }))} /> Show this section on the website</label><label className="property-label">Section name<input value={selected.name} onChange={e => updateSection(selected.id, section => ({ ...section, name: e.target.value }))} /></label>
        <label className="property-label">{selectedComponent ? `${selectedComponent.kind} content` : 'Heading text'}<textarea rows={3} value={selectedText} onChange={e => updateHeading(e.target.value)} /></label>
        <label className="property-label">Background colour<div className="colour-input"><input type="color" value={selected.styles.backgroundColor ?? '#ffffff'} onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, backgroundColor: e.target.value } }))} /><span>{selected.styles.backgroundColor ?? '#ffffff'}</span></div></label>
        <label className="property-label">Section spacing<select value={selected.styles.padding ?? '72px 8%'} onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, padding: e.target.value } }))}><option value="40px 6%">Compact</option><option value="72px 8%">Comfortable</option><option value="112px 8%">Spacious</option></select></label>
        </div></details><details className="inspector-group"><summary>Section layout & background</summary><div className="inspector-group-body"><div className="component-style-controls"><strong>Layout & background</strong>
          <label className="property-label">Layout mode<select value={selected.styles.display ?? 'block'} onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, display: e.target.value } }))}><option value="block">Stacked</option><option value="flex">Flexible row</option><option value="grid">Grid</option></select></label>
          <div className="layout-control-grid"><label className="property-label">Grid columns<input value={selected.styles.gridTemplateColumns ?? '1fr 1fr'} placeholder="1fr 1fr" onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, display: 'grid', gridTemplateColumns: e.target.value } }))} /></label><label className="property-label">Column gap<input value={selected.styles.gap ?? '24px'} placeholder="24px" onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, gap: e.target.value } }))} /></label></div>
          <label className="property-label">Background image<select value={selected.styles.backgroundImageAsset ?? ''} onChange={e => { const asset = site.assets?.find(item => item.id === e.target.value); updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, backgroundImageAsset: e.target.value, backgroundImage: asset ? 'url(' + asset.dataUrl + ')' : 'none', backgroundSize: 'cover', backgroundPosition: 'center' } })) }}><option value="">No image</option>{(site.assets ?? []).map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>
          <label className="property-label">Entrance animation<select value={selected.styles.animationName ?? 'none'} onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, animationName: e.target.value, animationDuration: '700ms', animationFillMode: 'both' } }))}><option value="none">None</option><option value="dsqFadeIn">Fade in</option><option value="dsqSlideUp">Slide up</option><option value="dsqSlideIn">Slide in</option><option value="dsqZoomIn">Zoom in</option></select></label>
          <label className="property-label">Animation speed<select value={selected.styles.animationDuration ?? '700ms'} onChange={e => updateSection(selected.id, section => ({ ...section, styles: { ...section.styles, animationDuration: e.target.value } }))}><option value="350ms">Fast</option><option value="700ms">Normal</option><option value="1200ms">Slow</option></select></label>
        </div>
        </div></details><details className="inspector-group"><summary>Site-wide colours & fonts</summary><div className="inspector-group-body"><div className="component-style-controls"><strong>Global site styles</strong>
          <label className="property-label">Primary colour<div className="colour-input"><input type="color" value={site.theme.primaryColor} onChange={e => commit({ ...site, theme: { ...site.theme, primaryColor: e.target.value } })} /><span>{site.theme.primaryColor}</span></div></label>
          <label className="property-label">Accent colour<div className="colour-input"><input type="color" value={site.theme.accentColor} onChange={e => commit({ ...site, theme: { ...site.theme, accentColor: e.target.value } })} /><span>{site.theme.accentColor}</span></div></label>
          <label className="property-label">Heading font<select value={site.theme.headingFont} onChange={e => commit({ ...site, theme: { ...site.theme, headingFont: e.target.value } })}><option value="Arial, sans-serif">Arial</option><option value="Georgia, serif">Georgia</option><option value="system-ui, sans-serif">System</option><option value="'Trebuchet MS', sans-serif">Trebuchet</option></select></label>
          <label className="property-label">Body font<select value={site.theme.bodyFont} onChange={e => commit({ ...site, theme: { ...site.theme, bodyFont: e.target.value } })}><option value="Arial, sans-serif">Arial</option><option value="Georgia, serif">Georgia</option><option value="system-ui, sans-serif">System</option><option value="'Trebuchet MS', sans-serif">Trebuchet</option></select></label>
        </div>
        </div></details><details className="inspector-group"><summary>Add elements to this section</summary><div className="inspector-group-body"><div className="component-insert-tools"><strong>Add elements</strong><div><button onClick={() => addComponent('heading')}>+ Heading</button><button onClick={() => addComponent('text')}>+ Text</button><button onClick={() => addComponent('button')}>+ Button</button><button onClick={() => addComponent('form')}>+ Form</button><button onClick={() => addComponent('shape')}>+ Shape</button></div></div>
        </div></details>{selectedComponent && <details className="inspector-group" open><summary>{selectedComponent.kind === "image" ? "Image editing & appearance" : ["heading","paragraph"].includes(selectedComponent.kind) ? "Text styling & appearance" : "Design & appearance"}</summary><div className="inspector-group-body"><div className="component-style-controls"><strong>{selectedComponent.kind === "image" ? `Image editor · ${device}` : ["heading","paragraph"].includes(selectedComponent.kind) ? `Text design · ${device}` : `Element styling · ${device}`}</strong>
          {selectedComponent.kind === 'image' && <div className="image-layout-controls"><strong>Image editor · {device}</strong><small>Move or resize the image on the canvas, or use these controls for precise adjustments. Changes apply to the selected device preview.</small>
            <div className="image-quick-actions"><button type="button" onClick={() => { updateSelectedComponentStyle("width","100%"); updateSelectedComponentStyle("height","240px"); updateSelectedComponentStyle("objectFit","cover"); }}>Fill section</button><button type="button" onClick={() => { updateSelectedComponentStyle("width","75%"); updateSelectedComponentStyle("height","320px"); updateSelectedComponentStyle("objectFit","contain"); }}>Contained image</button><button type="button" onClick={() => { updateSelectedComponentStyle("width","50%"); updateSelectedComponentStyle("height","240px"); updateSelectedComponentStyle("objectFit","cover"); }}>Half width</button></div>
            <label className="property-label">Image description (alt text)<input value={selectedImageAsset?.altText ?? ''} placeholder="Describe the image for screen readers" onChange={event => updateSelectedImageAlt(event.target.value)} /></label>
            <label className="property-label image-decorative-toggle"><input type="checkbox" checked={!selectedImageAsset?.altText} onChange={event => updateSelectedImageAlt(event.target.checked ? '' : 'Describe this image')} /> Decorative image (leave description empty)</label>
            <div className="image-transform-controls">
              <label className="property-label">Width · {selectedComponent.responsiveStyles?.[device]?.width ?? selectedComponent.styles.width ?? '100%'}<input type="range" min="10" max="100" value={Number.parseFloat(selectedComponent.responsiveStyles?.[device]?.width ?? selectedComponent.styles.width ?? '100') || 100} onChange={e => updateSelectedComponentStyle('width', e.target.value + '%')} /></label>
              <label className="property-label">Height · {selectedComponent.responsiveStyles?.[device]?.height ?? selectedComponent.styles.height ?? 'auto'}<input type="range" min="80" max="700" step="10" value={Math.min(700, Math.max(80, Number.parseFloat(selectedComponent.responsiveStyles?.[device]?.height ?? selectedComponent.styles.height ?? '240') || 240))} onChange={e => updateSelectedComponentStyle('height', e.target.value + 'px')} /></label>
              <label className="property-label">Move left / right · {selectedComponent.responsiveStyles?.[device]?.imageX ?? selectedComponent.styles.imageX ?? '0'}px<input type="range" min="-300" max="300" value={Number(selectedComponent.responsiveStyles?.[device]?.imageX ?? selectedComponent.styles.imageX ?? 0)} onChange={e => updateSelectedComponentStyle('imageX', e.target.value)} /></label>
              <label className="property-label">Move up / down · {selectedComponent.responsiveStyles?.[device]?.imageY ?? selectedComponent.styles.imageY ?? '0'}px<input type="range" min="-300" max="300" value={Number(selectedComponent.responsiveStyles?.[device]?.imageY ?? selectedComponent.styles.imageY ?? 0)} onChange={e => updateSelectedComponentStyle('imageY', e.target.value)} /></label>
              <label className="property-label">Rotate · {selectedComponent.responsiveStyles?.[device]?.rotation ?? selectedComponent.styles.rotation ?? '0'}°<input type="range" min="-180" max="180" value={Number(selectedComponent.responsiveStyles?.[device]?.rotation ?? selectedComponent.styles.rotation ?? 0)} onChange={e => updateSelectedComponentStyle('rotation', e.target.value)} /></label>
            </div>
            <div className="image-quick-actions">
              <button type="button" onClick={() => updateSelectedComponentStyle('rotation', String((Number(selectedComponent.responsiveStyles?.[device]?.rotation ?? selectedComponent.styles.rotation ?? 0) + 90) % 360))}>↻ Rotate 90°</button>
              <button type="button" onClick={() => updateSelectedComponentStyle('flipX', selectedComponent.responsiveStyles?.[device]?.flipX === 'true' || selectedComponent.styles.flipX === 'true' ? 'false' : 'true')}>⇋ Flip horizontal</button>
              <button type="button" onClick={() => updateSelectedComponentStyle('flipY', selectedComponent.responsiveStyles?.[device]?.flipY === 'true' || selectedComponent.styles.flipY === 'true' ? 'false' : 'true')}>⇅ Flip vertical</button>
              <button type="button" onClick={() => { if (!selected || !selectedComponent) return; const reset = { width: '100%', height: '240px', imageX: '0', imageY: '0', rotation: '0', flipX: 'false', flipY: 'false', objectFit: 'cover', objectPosition: 'center center' }; updateSection(selected.id, section => ({ ...section, components: section.components.map(item => item.id === selectedComponent.id ? { ...item, styles: { ...item.styles, ...reset }, responsiveStyles: { ...item.responsiveStyles, [device]: { ...(item.responsiveStyles?.[device] ?? {}), ...reset } } } : item) })) }}>Reset transform</button>
            </div>
            <label className="property-label">Fit<select value={selectedComponent.responsiveStyles?.[device]?.objectFit ?? selectedComponent.styles.objectFit ?? 'cover'} onChange={e => updateSelectedComponentStyle('objectFit', e.target.value)}><option value="cover">Fill / crop</option><option value="contain">Fit inside</option><option value="fill">Stretch</option><option value="none">Original size</option></select></label>
            <label className="property-label">Crop focus<select value={selectedComponent.responsiveStyles?.[device]?.objectPosition ?? selectedComponent.styles.objectPosition ?? 'center center'} onChange={e => updateSelectedComponentStyle('objectPosition', e.target.value)}><option value="center center">Centre</option><option value="top center">Top</option><option value="bottom center">Bottom</option><option value="center left">Left</option><option value="center right">Right</option><option value="top left">Top left</option><option value="top right">Top right</option><option value="bottom left">Bottom left</option><option value="bottom right">Bottom right</option></select></label>
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
        </div>
        </div></details>}{selectedComponent && <details className="inspector-group"><summary>Save & reuse</summary><div className="inspector-group-body"><div className="component-style-controls"><strong>Reusable element</strong><button className="add-image-control" type="button" onClick={saveReusableComponent}>Save element to library</button></div></div></details>}{selectedComponent && <details className="inspector-group" open={selectedComponent.kind === "button"}><summary>{selectedComponent.kind === "button" ? "Button & social links" : "Links & actions"}</summary><div className="inspector-group-body"><div className="component-style-controls"><strong>{selectedComponent.kind === 'button' ? 'Button actions & destination' : 'Actions & links'}</strong><label className="property-label">Element destination<input value={selectedComponent.linkTo ?? ''} placeholder={selectedComponent.buttonLibraryId ? (buttonLibrary.find(item => item.id === selectedComponent.buttonLibraryId)?.hint ?? 'https://example.com, /about, mailto:...') : 'https://example.com, /about, mailto:...'} onChange={e => { const value=e.target.value; updateSection(selected.id, section => ({ ...section, components: section.components.map(item => item.id === selectedComponent.id ? { ...item, linkTo:value } : item) })) }} /></label>{selectedComponent.kind === 'button' && <label className="property-label">Link to a page<select value={site.pages.find(navPage => (navPage.slug === '/' ? '/' : '/' + (navPage.slug.startsWith('/') ? navPage.slug.slice(1) : navPage.slug)) === (selectedComponent.linkTo ?? ''))?.id ?? ''} onChange={event => { const target = site.pages.find(navPage => navPage.id === event.target.value); if (!target) return; const destination = target.slug === '/' ? '/' : '/' + (target.slug.startsWith('/') ? target.slug.slice(1) : target.slug); updateSection(selected.id, section => ({ ...section, components: section.components.map(item => item.id === selectedComponent.id ? { ...item, linkTo:destination } : item) })) }}><option value="">Choose a page…</option>{site.pages.map(navPage => <option key={navPage.id} value={navPage.id}>{navPage.name}</option>)}</select><small>Choose a page name — DSQUARE STUDIO will set the link automatically.</small></label>}{selectedComponent.kind === 'button' && <><small>Use a page path such as /about, a full https:// link, mailto: or tel:. Links work when Preview is on and in exported websites.</small><label className="property-label">Button text<input value={selectedComponent.content} maxLength={100} placeholder="e.g. Contact us" onChange={e => { const value=e.target.value; updateSection(selected.id, section => ({ ...section, components: section.components.map(item => item.id === selectedComponent.id ? { ...item, content:value } : item) })) }} /></label><div className="button-hover-controls"><strong>Quick button design</strong><label className="property-label">Button background<div className="colour-input"><input type="color" value={selectedComponent.styles.backgroundColor ?? '#c6a56b'} onChange={e => { const value=e.target.value; updateSection(selected.id, section => ({ ...section, components: section.components.map(item => item.id === selectedComponent.id ? { ...item, styles:{ ...item.styles, backgroundColor:value } } : item) })) }} /><span>{selectedComponent.styles.backgroundColor ?? 'Default'}</span></div></label><label className="property-label">Button text colour<div className="colour-input"><input type="color" value={selectedComponent.styles.color ?? '#171717'} onChange={e => { const value=e.target.value; updateSection(selected.id, section => ({ ...section, components: section.components.map(item => item.id === selectedComponent.id ? { ...item, styles:{ ...item.styles, color:value } } : item) })) }} /><span>{selectedComponent.styles.color ?? 'Default'}</span></div></label><label className="property-label">Button shape<select value={selectedComponent.styles.borderRadius ?? '999px'} onChange={e => { const value=e.target.value; updateSection(selected.id, section => ({ ...section, components: section.components.map(item => item.id === selectedComponent.id ? { ...item, styles:{ ...item.styles, borderRadius:value } } : item) })) }}><option value="0px">Square</option><option value="6px">Slightly rounded</option><option value="14px">Rounded</option><option value="999px">Pill shape</option></select></label><label className="property-label">Button size<select value={selectedComponent.styles.padding ?? '13px 22px'} onChange={e => { const value=e.target.value; updateSection(selected.id, section => ({ ...section, components: section.components.map(item => item.id === selectedComponent.id ? { ...item, styles:{ ...item.styles, padding:value } } : item) })) }}><option value="9px 16px">Compact</option><option value="13px 22px">Normal</option><option value="16px 30px">Large</option><option value="18px 38px">Extra large</option></select></label></div><label className="property-label checkbox-property"><input type="checkbox" checked={Boolean(selectedComponent.openInNewTab)} onChange={e => { const value=e.target.checked; updateSection(selected.id, section => ({ ...section, components: section.components.map(item => item.id === selectedComponent.id ? { ...item, openInNewTab:value } : item) })) }} /> Open external link in a new tab</label><div className="button-preset-row"><span>Button style</span><select value={selectedComponent.buttonPreset ?? 'custom'} onChange={e => { const preset=e.target.value as 'gold'|'dark'|'outline'|'soft'|'custom'; const presets:Record<string,Record<string,string>>={gold:{backgroundColor:'#c99b45',color:'#171717',borderRadius:'999px',padding:'14px 26px',fontWeight:'700'},dark:{backgroundColor:'#171717',color:'#ffffff',borderRadius:'8px',padding:'14px 26px',fontWeight:'700'},outline:{backgroundColor:'transparent',color:'#171717',border:'2px solid #171717',borderRadius:'999px',padding:'12px 24px',fontWeight:'700'},soft:{backgroundColor:'#f3eee5',color:'#171717',borderRadius:'12px',padding:'14px 24px',fontWeight:'600'}}; updateSection(selected.id, section => ({...section,components:section.components.map(item=>item.id===selectedComponent.id?{...item,styles:{...item.styles,...(presets[preset]??{})},buttonPreset:preset}:item)})) }}>{selectedComponent.buttonPreset && !['custom','gold','dark','outline','soft'].includes(selectedComponent.buttonPreset) && <option value={selectedComponent.buttonPreset}>Original {buttonLibrary.find(item => item.id === selectedComponent.buttonLibraryId)?.label ?? 'library'} style</option>}<option value="custom">Custom</option><option value="gold">Premium gold</option><option value="dark">Dark solid</option><option value="outline">Outline</option><option value="soft">Soft neutral</option></select></div><div className="button-hover-controls"><strong>Hover effect</strong><label className="property-label">Hover background<div className="colour-input"><input type="color" value={selectedComponent.hoverStyles?.backgroundColor ?? '#1d4ed8'} onChange={e => updateSection(selected.id, section => ({...section,components:section.components.map(item=>item.id===selectedComponent.id?{...item,hoverStyles:{...(item.hoverStyles ?? {}),backgroundColor:e.target.value}}:item)}))}/><span>{selectedComponent.hoverStyles?.backgroundColor ?? 'Not set'}</span></div></label><label className="property-label">Hover text colour<div className="colour-input"><input type="color" value={selectedComponent.hoverStyles?.color ?? '#ffffff'} onChange={e => updateSection(selected.id, section => ({...section,components:section.components.map(item=>item.id===selectedComponent.id?{...item,hoverStyles:{...(item.hoverStyles ?? {}),color:e.target.value}}:item)}))}/><span>{selectedComponent.hoverStyles?.color ?? 'Not set'}</span></div></label><label className="property-label">Hover animation<select value={selectedComponent.hoverStyles?.transform ?? 'translateY(-2px)'} onChange={e => updateSection(selected.id, section => ({...section,components:section.components.map(item=>item.id===selectedComponent.id?{...item,hoverStyles:{...(item.hoverStyles ?? {}),transform:e.target.value}}:item)}))}><option value="translateY(-2px)">Lift up</option><option value="scale(1.04)">Grow slightly</option><option value="translateY(-3px) scale(1.02)">Lift and grow</option><option value="none">No movement</option></select></label><label className="property-label">Hover shadow<select value={selectedComponent.hoverStyles?.boxShadow ?? '0 9px 22px rgba(0,0,0,.18)'} onChange={e => updateSection(selected.id, section => ({...section,components:section.components.map(item=>item.id===selectedComponent.id?{...item,hoverStyles:{...(item.hoverStyles ?? {}),boxShadow:e.target.value}}:item)}))}><option value="none">None</option><option value="0 4px 12px rgba(0,0,0,.14)">Soft</option><option value="0 9px 22px rgba(0,0,0,.18)">Medium</option><option value="0 14px 32px rgba(0,0,0,.25)">Strong</option></select></label><button type="button" className="add-image-control" onClick={() => { const preset = buttonLibrary.find(item => item.id === selectedComponent.buttonLibraryId); const defaults = preset ? { backgroundColor:preset.hoverBg, color:preset.color, transform:'translateY(-2px)', boxShadow:'0 9px 22px rgba(0,0,0,.18)' } : {}; updateSection(selected.id, section => ({...section,components:section.components.map(item => item.id === selectedComponent.id ? {...item,hoverStyles:defaults} : item)})) }}>Reset hover effect</button><small>Hover effects appear on pointer devices. Touch users still get the normal button style.</small></div></>}<div className="property-actions"><button onClick={duplicateComponent}>Duplicate element</button><button onClick={deleteComponent}>Delete element</button></div></div></div></details>}
        {selectedComponent?.kind === 'image' && <div className="image-control-actions"><button type="button" onClick={() => { setReplaceImageId(selectedComponent.id); imageInputRef.current?.click() }}>Replace image</button><button type="button" onClick={() => { updateSection(selected.id, section => ({ ...section, components: section.components.filter(item => item.id !== selectedComponent.id) })); setSelectedComponentId(null) }}>Remove image</button></div>}
        <input ref={imageInputRef} className="visually-hidden-image-input" type="file" accept="image/*" onChange={event => { addUploadedImage(event.target.files?.[0], replaceImageId ?? undefined); event.currentTarget.value = '' }} />
        <button className="add-image-control" type="button" onClick={() => { setReplaceImageId(null); imageInputRef.current?.click() }}><Image size={14} /> Add image to section</button>
        <div className="property-actions"><button onClick={() => moveSection(-1, selected.id)} title="Move up" disabled={page.sections.findIndex(item => item.id === selected.id) <= 1}>↑ Move up</button><button onClick={() => moveSection(1, selected.id)} title="Move down" disabled={page.sections.findIndex(item => item.id === selected.id) >= page.sections.length - 2}>↓ Move down</button></div>
        <div className="property-actions"><button onClick={duplicateSection} disabled={['header','footer'].includes(selected.kind)}>Duplicate section</button><button className="remove-section" onClick={removeSection} disabled={['header','footer'].includes(selected.kind)}><Trash2 size={14} /> Remove section</button></div>
      </div> : <p className="editor-no-selection">Choose a section on the canvas.</p>}</aside>
    </div>}
    <div className="editor-mobile-add"><button onClick={() => { setMobilePropertiesOpen(false); setPanel("add"); setMobilePanelOpen(true) }}><Plus size={16} /><span>Add</span></button><button onClick={() => { setMobilePropertiesOpen(false); setPanel("layers"); setMobilePanelOpen(true) }}><Layers3 size={16} /><span>Sections</span></button><button onClick={() => { setMobilePropertiesOpen(false); setPanel("media"); setMobilePanelOpen(true) }}><Image size={16} /><span>Images</span></button><button className={mobilePropertiesOpen ? "active" : ""} onClick={() => { setMobilePanelOpen(false); setMobilePropertiesOpen(value => !value) }}><Settings2 size={16} /><span>Edit</span></button><button onClick={() => { setMobilePropertiesOpen(false); setPanel("seo"); setMobilePanelOpen(true) }}><Settings2 size={16} /><span>More</span></button></div>
    {exportOpen && <div className="export-backdrop" role="presentation" onClick={() => !exportBusy && setExportOpen(false)}><section className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title" onClick={event => event.stopPropagation()}><button ref={exportCloseRef} className="export-close" aria-label="Close export" onClick={() => setExportOpen(false)} disabled={exportBusy}><X size={18} /></button><div className="export-kicker">YOUR WEBSITE · SOURCE CODE</div><h2 id="export-title">Download your website</h2><p>Get the actual HTML, CSS and JavaScript files. The complete ZIP includes every page, styling and scripts needed to run the website.</p><div className="export-summary" aria-label="Website export summary"><span><strong>{site.pages.length}</strong> {site.pages.length === 1 ? "page" : "pages"}</span><span><strong>{site.pages.reduce((total, item) => total + item.sections.filter(section => section.enabled).length, 0)}</strong> active sections</span><span><strong>{(site.assets ?? []).length}</strong> media assets</span></div><div className="export-readiness-note">Your export includes the current saved design and packaged images. Forms are visual previews; connect services for submissions, payments or databases.</div><button className="export-zip-button" onClick={downloadWebsiteZip} disabled={exportBusy}><Download size={17} /> {exportBusy ? "Preparing ZIP..." : "Download complete website ZIP"}</button><div className="export-file-heading">Or download individual source files</div><div className="export-file-grid"><button onClick={() => downloadSourceFile("html")}>index.html <span>Website structure</span></button><button onClick={() => downloadSourceFile("css")}>styles.css <span>Design and layout</span></button><button onClick={() => downloadSourceFile("js")}>script.js <span>Interactions</span></button></div>{exportMessage && <div className="export-status" role="status">{exportMessage}</div>}<small>Contact forms are exported as front-end previews. Connect a form service before using them to receive messages.</small></section></div>}
    {showAdd && <div className="editor-add-sheet"><div><strong>Add a section</strong><button onClick={() => setShowAdd(false)}>Close</button></div>{sectionOptions.map(item => <button key={item.kind} onClick={() => addSection(item.kind)}>{item.label}<Plus size={15} /></button>)}</div>}
  </div>
}
