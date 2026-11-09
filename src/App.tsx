import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import VisualEditor from './editor/VisualEditor'
import { createSiteFromTemplate } from './editor/defaultSite'
import {
  Activity, ArrowDownRight, ArrowRight, Bell, Blocks, BriefcaseBusiness, Edit3,
  ChevronDown, CircleHelp, Clock3, Copy, FilePlus2, FolderKanban,
  Globe2, LayoutDashboard, Menu, Plus, Search, Settings2, Sparkles, Download, Upload, ShieldCheck,
  WandSparkles, X, Archive, Pencil, Trash2, Users
} from 'lucide-react'

type NavItem = { label: string; icon: typeof LayoutDashboard }
type Client = { id: string; name: string; email: string; createdAt: string }
type Project = { id: string; name: string; category: string; clientId: string; status: 'Draft' | 'Archived'; createdAt: string; updatedAt: string }
type SiteTemplate = { id: string; name: string; category: string; description: string; style: string; pages: string[]; gradient: string; featured?: boolean }

const mainNav: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My projects', icon: FolderKanban },
  { label: 'Templates', icon: Blocks },
  { label: 'Visual editor', icon: LayoutDashboard },
  { label: 'AI website builder', icon: WandSparkles },
]
const quickStarts = [
  { title: 'Start with a template', description: 'Choose a professionally designed starting point.', icon: Blocks, tag: 'TEMPLATE LIBRARY' },
  { title: 'Build visually', description: 'Create your layout with sections and drag-and-drop blocks.', icon: LayoutDashboard, tag: 'VISUAL EDITOR' },
  { title: 'Generate with AI', description: 'Describe your idea and shape it into a website.', icon: Sparkles, tag: 'AI WEBSITE BUILDER' },
]
const categories = ['Business', 'Portfolio', 'E-commerce', 'Blog / Magazine', 'Landing page', 'Agency', 'Restaurant', 'Education', 'Community', 'Other']
const templates: SiteTemplate[] = [
  { id:'agency', name:'Creative Agency', category:'Agency', description:'A polished agency homepage for services, projects and your team.', style:'Bold · Editorial', pages:['Home','About','Services','Projects','Contact'], gradient:'linear-gradient(135deg,#25231f,#9c7845 52%,#171614)', featured:true },
  { id:'business', name:'Modern Business', category:'Business', description:'A confident company website with clear services and contact paths.', style:'Professional · Clean', pages:['Home','About','Services','Contact'], gradient:'linear-gradient(135deg,#172b35,#527a83 55%,#111a20)', featured:true },
  { id:'portfolio', name:'Personal Portfolio', category:'Portfolio', description:'Put your best work first with a striking personal introduction.', style:'Minimal · Creative', pages:['Home','Selected Work','About','Contact'], gradient:'linear-gradient(135deg,#3b2730,#b16d68 55%,#20191c)' },
  { id:'shop', name:'Boutique Store', category:'E-commerce', description:'A product-led storefront concept for a modern independent brand.', style:'Premium · Product-led', pages:['Home','Shop','Product','About','Contact'], gradient:'linear-gradient(135deg,#3a3324,#b5a06e 55%,#1c1a16)', featured:true },
  { id:'restaurant', name:'Restaurant & Cafe', category:'Restaurant', description:'Showcase your menu, atmosphere, opening hours and reservations.', style:'Warm · Hospitality', pages:['Home','Menu','Our Story','Visit Us'], gradient:'linear-gradient(135deg,#3a241c,#a75e3f 55%,#1d1714)' },
  { id:'launch', name:'Product Launch', category:'Landing page', description:'A focused landing page built around one clear offer and call to action.', style:'Modern · Conversion', pages:['Landing page','FAQ','Contact'], gradient:'linear-gradient(135deg,#22234a,#6668b0 55%,#17172a)' },
  { id:'education', name:'Learning Hub', category:'Education', description:'An organized website concept for schools, tutors and learning programs.', style:'Friendly · Structured', pages:['Home','Programs','Admissions','About','Contact'], gradient:'linear-gradient(135deg,#1e3a32,#6a967b 55%,#14231e)' },
  { id:'journal', name:'Editorial Journal', category:'Blog / Magazine', description:'A clean reading experience for articles, stories and editorial features.', style:'Editorial · Typography', pages:['Home','Articles','Categories','About'], gradient:'linear-gradient(135deg,#33302b,#9a8a70 55%,#1c1a17)' },
  { id:'community', name:'Community Space', category:'Community', description:'Introduce a community, share updates and help members get involved.', style:'Welcoming · Modern', pages:['Home','About','Events','Join','Contact'], gradient:'linear-gradient(135deg,#26303e,#6e91a5 55%,#171e27)' },
]
const templateCategories = ['All templates', ...categories]
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `ds-${Date.now()}-${Math.random().toString(36).slice(2)}`
const readSaved = <T,>(key: string, fallback: T): T => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback }
}

function App() {
  const [active, setActive] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showClient, setShowClient] = useState(false)
  const [projects, setProjects] = useState<Project[]>(() => readSaved('dsquare-projects', []))
  const [clients, setClients] = useState<Client[]>(() => readSaved('dsquare-clients', []))
  const [projectName, setProjectName] = useState('')
  const [projectCategory, setProjectCategory] = useState('Business')
  const [projectClient, setProjectClient] = useState('')
  const [projectTemplateId, setProjectTemplateId] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [templateCategory, setTemplateCategory] = useState('All templates')
  const [selectedTemplate, setSelectedTemplate] = useState<SiteTemplate | null>(null)
  const [editorProject, setEditorProject] = useState<Project | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiBrandName, setAiBrandName] = useState('')
  const [aiCategory, setAiCategory] = useState('Business')
  const [aiTone, setAiTone] = useState('Modern and professional')
  const [aiPages, setAiPages] = useState('Home, About, Services, Contact')
  const [storageWarning, setStorageWarning] = useState('')
  const [backupMessage, setBackupMessage] = useState('')

  const exportWorkspaceBackup = () => {
    try {
      const documents: Record<string, string> = {}
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index)
        if (key?.startsWith('dsquare-editor-document:')) {
          const value = localStorage.getItem(key)
          if (value) documents[key] = value
        }
      }
      const backup = {
        format: 'dsquare-studio-workspace',
        version: 1,
        exportedAt: new Date().toISOString(),
        projects,
        clients,
        documents,
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dsquare-studio-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setBackupMessage('Workspace backup downloaded successfully.')
    } catch {
      setBackupMessage('Could not create the backup. Check your browser storage and try again.')
    }
  }

  const restoreWorkspaceBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      if (file.size > 50 * 1024 * 1024) throw new Error('Backup file is larger than 50 MB.')
      const backup = JSON.parse(await file.text()) as {
        format?: string; version?: number; projects?: Project[]; clients?: Client[]; documents?: Record<string, string>
      }
      if (backup.format !== 'dsquare-studio-workspace' || backup.version !== 1 || !Array.isArray(backup.projects) || !Array.isArray(backup.clients) || !backup.documents || typeof backup.documents !== 'object') {
        throw new Error('This is not a supported DSQUARE STUDIO backup file.')
      }
      const clientIds = new Set(backup.clients.map(client => client?.id))
      const projectIds = new Set(backup.projects.map(project => project?.id))
      const validProjects = backup.projects.every(project => project && typeof project.id === 'string' && project.id.length > 0 && typeof project.name === 'string' && typeof project.category === 'string' && typeof project.clientId === 'string' && (!project.clientId || clientIds.has(project.clientId)) && (project.status === 'Draft' || project.status === 'Archived') && typeof project.createdAt === 'string' && typeof project.updatedAt === 'string') && projectIds.size === backup.projects.length
      const validClients = backup.clients.every(client => client && typeof client.id === 'string' && client.id.length > 0 && typeof client.name === 'string' && typeof client.email === 'string' && typeof client.createdAt === 'string') && clientIds.size === backup.clients.length
      const validDocuments = Object.entries(backup.documents).every(([key, value]) => {
        if (!key.startsWith('dsquare-editor-document:') || typeof value !== 'string') return false
        const projectId = key.slice('dsquare-editor-document:'.length)
        if (!projectIds.has(projectId)) return false
        try {
          const parsed = JSON.parse(value)
          return parsed && typeof parsed === 'object' && parsed.schemaVersion === 1 && typeof parsed.id === 'string' && typeof parsed.name === 'string' && Array.isArray(parsed.pages) && parsed.pages.length > 0 && parsed.pages.every((page: { id?: unknown; slug?: unknown; sections?: unknown }) => typeof page.id === 'string' && typeof page.slug === 'string' && Array.isArray(page.sections) && page.sections.every((section: { id?: unknown; components?: unknown }) => typeof section.id === 'string' && Array.isArray(section.components)))
        } catch { return false }
      })
      if (!validProjects || !validClients || !validDocuments) throw new Error('The backup contains invalid, duplicate or incomplete workspace data.')
      if (!window.confirm('Restore this backup? Your current projects, clients and saved website drafts in this browser will be replaced. Download a backup of your current workspace first if you want to keep it.')) return
      const oldDocumentKeys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter((key): key is string => Boolean(key?.startsWith('dsquare-editor-document:')))
      const previousValues = new Map<string, string | null>([
        ['dsquare-projects', localStorage.getItem('dsquare-projects')],
        ['dsquare-clients', localStorage.getItem('dsquare-clients')],
        ...oldDocumentKeys.map(key => [key, localStorage.getItem(key)] as [string, string | null]),
      ])
      try {
        oldDocumentKeys.forEach(key => localStorage.removeItem(key))
        Object.entries(backup.documents).forEach(([key, value]) => localStorage.setItem(key, value))
        localStorage.setItem('dsquare-projects', JSON.stringify(backup.projects))
        localStorage.setItem('dsquare-clients', JSON.stringify(backup.clients))
      } catch (writeError) {
        try {
          const currentKeys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter((key): key is string => Boolean(key?.startsWith('dsquare-editor-document:')))
          currentKeys.forEach(key => localStorage.removeItem(key))
          previousValues.forEach((value, key) => {
            if (value === null) localStorage.removeItem(key)
            else localStorage.setItem(key, value)
          })
        } catch {
          throw new Error('Restore failed and the previous workspace could not be fully recovered. Avoid closing this tab and check browser storage.')
        }
        throw writeError
      }
      setProjects(backup.projects)
      setClients(backup.clients)
      setEditorProject(null)
      setActive('My projects')
      setBackupMessage(`Restored ${backup.projects.length} projects and ${backup.clients.length} clients successfully.`)
      setStorageWarning('')
    } catch (error) {
      setBackupMessage(error instanceof Error ? error.message : 'Could not restore this backup.')
    }
  }

  const persistValue = (key: string, value: string) => {
    try { localStorage.setItem(key, value); setStorageWarning(''); return true }
    catch { setStorageWarning('Browser storage is full or unavailable. Export your work or remove large uploads before continuing.'); return false }
  }
  useEffect(() => { persistValue('dsquare-projects', JSON.stringify(projects)) }, [projects])
  useEffect(() => { persistValue('dsquare-clients', JSON.stringify(clients)) }, [clients])
  const selectNav = (label: string) => { setActive(label); setMenuOpen(false) }
  const openProjectEditor = (project: Project) => { setEditorProject(project); setActive('Visual editor'); setMenuOpen(false) }
  const visibleTemplates = templates.filter(template => (templateCategory === 'All templates' || template.category === templateCategory) && `${template.name} ${template.category} ${template.description}`.toLowerCase().includes(searchTerm.toLowerCase()))
  const startFromTemplate = (template: SiteTemplate) => { setProjectName(`${template.name} website`); setProjectCategory(template.category); setProjectTemplateId(template.id); setSelectedTemplate(null); setShowCreate(true) }
  const activeProjects = projects.filter(p => showArchived ? p.status === 'Archived' : p.status !== 'Archived')
  const filteredProjects = useMemo(() => activeProjects.filter(p => {
    const client = clients.find(c => c.id === p.clientId)
    return `${p.name} ${p.category} ${client?.name ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  }), [activeProjects, clients, searchTerm])
  const createProject = (event: FormEvent) => {
    event.preventDefault()
    if (!projectName.trim()) return
    const now = new Date().toISOString()
    const project: Project = { id: makeId(), name: projectName.trim(), category: projectCategory, clientId: projectClient, status: 'Draft', createdAt: now, updatedAt: now }
    setProjects(current => [project, ...current])
    if (projectTemplateId) {
      const document = createSiteFromTemplate(projectTemplateId, project.name, project.category)
      persistValue(`dsquare-editor-document:${project.id}`, JSON.stringify(document))
      setEditorProject(project)
      setActive('Visual editor')
    } else {
      setActive('My projects')
    }
    setProjectName(''); setProjectCategory('Business'); setProjectClient(''); setProjectTemplateId(null); setShowCreate(false)
  }
  const generateAiDraft = (event: FormEvent) => {
    event.preventDefault()
    if (!aiPrompt.trim()) return
    const templateId = aiCategory === 'Portfolio' ? 'portfolio' : aiCategory === 'E-commerce' ? 'shop' : aiCategory === 'Restaurant' ? 'restaurant' : aiCategory === 'Education' ? 'education' : aiCategory === 'Agency' ? 'agency' : aiCategory === 'Blog / Magazine' ? 'journal' : aiCategory === 'Community' ? 'community' : aiCategory === 'Landing page' ? 'launch' : 'business'
    const name = aiBrandName.trim() || 'New website'
    const now = new Date().toISOString()
    const project: Project = { id: makeId(), name: name + ' website', category: aiCategory, clientId: '', status: 'Draft', createdAt: now, updatedAt: now }
    const document = createSiteFromTemplate(templateId, project.name, project.category)
    document.metadata.title = name
    document.metadata.description = aiPrompt.trim().slice(0, 160)
    if (aiTone.includes('Luxury')) { document.theme.primaryColor = '#171512'; document.theme.accentColor = '#c6a56b'; document.theme.backgroundColor = '#fbf8f1'; document.theme.headingFont = 'Georgia' }
    else if (aiTone.includes('Bold')) { document.theme.primaryColor = '#22204a'; document.theme.accentColor = '#ef795e' }
    else if (aiTone.includes('Minimal')) { document.theme.primaryColor = '#252525'; document.theme.accentColor = '#9a9a8d'; document.theme.backgroundColor = '#ffffff' }
    else if (aiTone.includes('Warm')) { document.theme.primaryColor = '#49352b'; document.theme.accentColor = '#c77c50'; document.theme.backgroundColor = '#fbf4eb'; document.theme.headingFont = 'Georgia' }
    const pageNames = [...new Set(aiPages.split(',').map(value => value.trim()).filter(Boolean))].slice(0, 8)
    const usedSlugs = new Set(document.pages.map(page => page.slug))
    pageNames.forEach(pageName => {
      if (pageName.toLowerCase() === 'home') return
      const pageId = makeId()
      const baseSlug = pageName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page'
      let slug = baseSlug
      let suffix = 2
      while (usedSlugs.has(slug)) { slug = baseSlug + '-' + suffix; suffix += 1 }
      usedSlugs.add(slug)
      const pageKey = pageName.toLowerCase()
      const pageCopy = pageKey.includes('about') ? 'Get to know ' + name + ', what we believe in and the people behind our work.' :
        pageKey.includes('service') ? 'Explore how ' + name + ' can help, from the first conversation to the finished result.' :
        pageKey.includes('contact') ? 'Tell us what you have in mind. We would love to hear from you and discuss the next step.' :
        pageKey.includes('portfolio') || pageKey.includes('work') || pageKey.includes('project') ? 'A selection of work, ideas and results that show what is possible.' :
        pageKey.includes('shop') || pageKey.includes('product') ? 'Discover the collection, find your favourites and choose what works for you.' :
        pageKey.includes('menu') ? 'Explore our menu, made with care and designed to make every visit memorable.' :
        pageKey.includes('program') || pageKey.includes('course') ? 'Explore learning opportunities designed to build knowledge, confidence and practical skills.' :
        pageKey.includes('event') ? 'Find upcoming experiences, connect with others and see what is happening next.' :
        pageKey.includes('faq') ? 'Find clear answers to common questions and helpful information before you get started.' :
        aiPrompt.trim()
      const detailKind = pageKey.includes('service') || pageKey.includes('program') || pageKey.includes('course') ? 'features' :
        pageKey.includes('portfolio') || pageKey.includes('work') || pageKey.includes('project') || pageKey.includes('shop') || pageKey.includes('product') || pageKey.includes('menu') ? 'gallery' :
        pageKey.includes('event') || pageKey.includes('testimonial') ? 'testimonials' : ''
      const detailTitle = detailKind === 'features' ? 'What we offer' : detailKind === 'gallery' ? 'Explore our work' : 'What people are saying'
      const detailCopy = detailKind === 'features' ? 'Discover the key services and opportunities available from ' + name + '.' :
        detailKind === 'gallery' ? 'Browse highlights, featured items and examples selected by ' + name + '.' :
        'Real experiences help you understand what makes ' + name + ' special.'
      document.pages.push({ id: pageId, name: pageName, isHomePage: false, slug, sections: [
        { id: makeId(), kind: 'header', name: 'Header', enabled: true, styles: {}, components: [{ id: makeId(), kind: 'heading', content: name.toUpperCase(), visible: true, styles: {} }] },
        { id: makeId(), kind: 'hero', name: pageName, enabled: true, styles: {}, components: [{ id: makeId(), kind: 'heading', content: pageName, visible: true, styles: {} }, { id: makeId(), kind: 'text', content: pageCopy, visible: true, styles: {} }] },
        ...(detailKind ? [{ id: makeId(), kind: detailKind as 'features' | 'gallery' | 'testimonials', name: detailTitle, enabled: true, styles: {}, components: [{ id: makeId(), kind: 'heading' as const, content: detailTitle, visible: true, styles: {} }, { id: makeId(), kind: 'text' as const, content: detailCopy, visible: true, styles: {} }] }] : []),
        { id: makeId(), kind: 'contact', name: 'Contact', enabled: true, styles: {}, components: [{ id: makeId(), kind: 'heading', content: 'Let’s connect', visible: true, styles: {} }] },
        { id: makeId(), kind: 'footer', name: 'Footer', enabled: true, styles: {}, components: [{ id: makeId(), kind: 'text', content: '© ' + name + '. All rights reserved.', visible: true, styles: {} }] },
      ] })
    })
    document.pages[0].sections.forEach(section => section.components.forEach(component => {
      if (component.kind === 'heading' && /hello|better way|find something|good food|learning opens|stories worth|better, together|meet your next/i.test(component.content)) component.content = name + ' — ' + (aiTone.toLowerCase().includes('bold') ? 'Bold ideas. Real results.' : 'A better way forward.')
      if (component.kind === 'text' && component.content.length > 35) component.content = aiPrompt.trim()
    }))
    setProjects(current => [project, ...current])
    persistValue(`dsquare-editor-document:${project.id}`, JSON.stringify(document))
    setEditorProject(project)
    setActive('Visual editor')
  }

  const createClient = (event: FormEvent) => {
    event.preventDefault()
    if (!clientName.trim()) return
    setClients(current => [{ id: makeId(), name: clientName.trim().replace(/\s+/g, ' '), email: clientEmail.trim().toLowerCase(), createdAt: new Date().toISOString() }, ...current])
    setClientName(''); setClientEmail(''); setShowClient(false); setActive('Clients')
  }
  const renameProject = (project: Project) => {
    const name = window.prompt('Enter a new project name', project.name)
    if (name?.trim()) setProjects(current => current.map(p => p.id === project.id ? { ...p, name: name.trim(), updatedAt: new Date().toISOString() } : p))
  }
  const duplicateProject = (project: Project) => {
    const now = new Date().toISOString()
    const copy: Project = { ...project, id: makeId(), name: `${project.name} copy`, status: 'Draft', createdAt: now, updatedAt: now }
    try {
      const savedDocument = localStorage.getItem(`dsquare-editor-document:${project.id}`)
      if (savedDocument) {
        const document = JSON.parse(savedDocument) as { name?: string; metadata?: { title?: string } }
        document.name = copy.name
        if (document.metadata) document.metadata.title = copy.name
        persistValue(`dsquare-editor-document:${copy.id}`, JSON.stringify(document))
      }
    } catch { setStorageWarning('The project copy was created, but its website content could not be copied. Open the original project and try again.') }
    setProjects(current => [copy, ...current])
  }
  const archiveProject = (project: Project) => setProjects(current => current.map(p => p.id === project.id ? { ...p, status: p.status === 'Archived' ? 'Draft' : 'Archived', updatedAt: new Date().toISOString() } : p))
  const deleteProject = (project: Project) => {
    if (window.confirm(`Permanently delete “${project.name}” and its saved website from this browser?`)) {
      try { localStorage.removeItem(`dsquare-editor-document:${project.id}`) } catch { setStorageWarning('Could not remove the saved website document from browser storage.') }
      setProjects(current => current.filter(p => p.id !== project.id))
      if (editorProject?.id === project.id) { setEditorProject(null); setActive('My projects') }
    }
  }

  return (
    <div className="studio-shell">
      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup"><div className="brand-mark">D<span>.</span></div><div><div className="brand-name">DSQUARE <span>STUDIO</span></div><div className="brand-caption">YOUR CREATIVE WORKSPACE</div></div><button className="icon-button mobile-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
        <div className="workspace-switcher"><div className="workspace-avatar">D</div><div className="workspace-copy"><strong>DSQUARE Workspace</strong><span>Private studio</span></div><ChevronDown size={15} className="muted-icon" /></div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">{mainNav.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => selectNav(label)}><Icon size={18} /><span>{label}</span>{label === 'AI website builder' && <span className="new-badge">NEW</span>}</button>)}</nav>
        <div className="nav-label tools-label">MANAGE</div>
        <nav className="side-nav" aria-label="Management navigation">
          <button className={`nav-item ${active === 'Clients' ? 'active' : ''}`} onClick={() => selectNav('Clients')}><BriefcaseBusiness size={18} /><span>Clients</span></button>
          <button className={`nav-item ${active === 'Publishing' ? 'active' : ''}`} onClick={() => selectNav('Publishing')}><Globe2 size={18} /><span>Publishing</span></button>
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><strong>Need a hand?</strong><p>Your creative workspace, one step at a time.</p><button onClick={() => selectNav('Help')}>Explore help <ArrowRight size={13} /></button></div><button className={`nav-item bottom-link ${active === 'Settings' ? 'active' : ''}`} onClick={() => selectNav('Settings')}><Settings2 size={18} /><span>Settings</span></button><div className="profile-row"><div className="profile-avatar">D</div><div className="profile-copy"><strong>DSQUARE</strong><span>Studio owner</span></div><button className="icon-button" aria-label="Profile options"><ChevronDown size={16} /></button></div></div>
      </aside>
      <main className="main-area">
        {storageWarning && <div className="storage-warning" role="status"><span>{storageWarning}</span><button className="icon-button" aria-label="Dismiss storage warning" onClick={() => setStorageWarning('')}><X size={15} /></button></div>}
        <header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div className="breadcrumb">Workspace <span>/</span> <strong>{active}</strong></div></div><div className="topbar-actions"><label className="search-box"><Search size={16} /><input aria-label="Search projects and clients" placeholder="Search projects..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></label><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="top-avatar">D</div></div></header>
        <div className="page-content">
          {active === 'AI website builder' ? <section className="ai-builder-page">
            <div className="ai-builder-intro"><div className="eyebrow"><span className="eyebrow-line" /> YOUR WEBSITE STARTS WITH AN IDEA</div><h1>Turn your brief into a <em>website draft.</em></h1><p>Describe the website you want. DSQUARE will prepare an editable starting project for you to refine in the visual editor.</p><div className="ai-builder-badge"><Sparkles size={14} /> Guided website generator · Provider connection pending</div></div>
            <form className="ai-builder-card" onSubmit={generateAiDraft}>
              <label className="form-label">What website should we create?<textarea required minLength={15} maxLength={3000} value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Example: Create a premium website for a Lagos-based interior design company. Show our services, recent projects, customer reviews and a clear way to request a consultation." /></label>
              <div className="ai-builder-fields"><label className="form-label">Brand or business name<input value={aiBrandName} maxLength={80} onChange={e => setAiBrandName(e.target.value)} placeholder="e.g. DSquare Interiors" /></label><label className="form-label">Website category<select value={aiCategory} onChange={e => setAiCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label className="form-label">Design direction<select value={aiTone} onChange={e => setAiTone(e.target.value)}><option>Modern and professional</option><option>Luxury and elegant</option><option>Bold and creative</option><option>Minimal and clean</option><option>Warm and welcoming</option></select></label><label className="form-label">Pages (comma-separated)<input value={aiPages} maxLength={300} onChange={e => setAiPages(e.target.value)} placeholder="Home, About, Services, Contact" /></label></div>
              <div className="ai-builder-note"><strong>What happens next?</strong><span>We create a multi-page editable draft using your brief and selected design direction. You can change every section in the visual editor.</span><small>This first version uses DSQUARE’s built-in draft generator. A real AI provider will be connected securely in a later step; no external AI service is being called yet.</small></div>
              <button className="primary-button ai-generate-button" type="submit"><WandSparkles size={17} /> Generate website draft <ArrowRight size={15} /></button>
            </form>
            <div className="ai-builder-tips"><span>TRY A CLEAR BRIEF</span><p>Include your business type, audience, services, preferred style, pages and the main action visitors should take.</p></div>
          </section> : active === 'Visual editor' ? <VisualEditor key={editorProject?.id ?? 'scratch'} projectId={editorProject?.id ?? 'scratch'} projectName={editorProject?.name ?? 'Untitled website'} category={editorProject?.category ?? 'Business'} onExit={() => { setEditorProject(null); selectNav('My projects') }} /> : active === 'Overview' ? <>
            <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> YOUR PRIVATE CREATIVE SPACE</div><h1>Make something <em>remarkable.</em></h1><p className="welcome-subtitle">Your ideas, your clients, your websites. Everything starts here.</p></div><button className="primary-button create-button" onClick={() => setShowCreate(true)}><Plus size={17} /> Create a website</button></section>
            <section className="hero-panel"><div className="hero-copy"><div className="hero-kicker"><Sparkles size={14} /> THE STUDIO IS YOURS</div><h2>From first idea<br />to <span>live website.</span></h2><p>Build without limits. Start with a template, design every detail yourself, or let AI bring your vision to life.</p><button className="hero-button" onClick={() => setShowCreate(true)}>Start creating <ArrowRight size={16} /></button></div><div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-glow" /><div className="art-window"><div className="window-top"><span /><span /><span /><div>dsquare.studio</div></div><div className="window-content"><div className="window-side" /><div className="window-main"><div className="window-line short" /><div className="window-title" /><div className="window-line" /><div className="window-line tiny" /><div className="window-cta" /><div className="window-image" /></div></div></div><div className="floating-chip chip-top"><Sparkles size={13} /> AI assisted</div><div className="floating-chip chip-bottom"><Activity size={13} /> Your next big idea</div></div><div className="hero-grain" /></section>
            <section className="section-heading"><div><h3>Choose your starting point</h3><p>Three ways to bring your next website to life.</p></div><button className="text-button" onClick={() => selectNav('Templates')}>Explore all <ArrowRight size={14} /></button></section>
            <section className="quick-grid">{quickStarts.map(({ title, description, icon: Icon, tag }, index) => <button className="quick-card" key={title} onClick={() => setShowCreate(true)}><div className="quick-card-top"><div className="quick-icon"><Icon size={19} /></div><span className="card-arrow"><ArrowDownRight size={17} /></span></div><div className="quick-tag">{tag}</div><h4>{title}</h4><p>{description}</p><div className="quick-card-footer"><span>{index === 0 ? 'Browse designs' : index === 1 ? 'Open editor' : 'Start with a prompt'}</span><ArrowRight size={14} /></div></button>)}</section>
            <section className="bottom-grid"><div className="projects-panel"><div className="panel-heading"><div><h3>Recent projects</h3><p>Your latest creative work in one place.</p></div><button className="text-button" onClick={() => selectNav('My projects')}>View all <ArrowRight size={14} /></button></div>{projects.length ? <ProjectList projects={projects.filter(p => p.status !== 'Archived').slice(0,3)} clients={clients} rename={renameProject} duplicate={duplicateProject} archive={archiveProject} remove={deleteProject} open={openProjectEditor} /> : <EmptyProjects onCreate={() => setShowCreate(true)} />}</div><div className="activity-panel"><div className="panel-heading"><div><h3>Studio snapshot</h3><p>Your workspace at a glance.</p></div><Clock3 size={17} className="panel-muted-icon" /></div><div className="snapshot-stats"><div><strong>{projects.filter(p => p.status !== 'Archived').length}</strong><span>Active projects</span></div><div><strong>{clients.length}</strong><span>Clients</span></div><div><strong>{projects.filter(p => p.status === 'Archived').length}</strong><span>Archived</span></div></div></div></section>
          </> : active === 'My projects' ? <><PageTitle eyebrow="YOUR WORK, ORGANIZED" title="My projects" subtitle="Create, organize and manage every client website from one place." action={<button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={16} /> New project</button>} /><div className="list-toolbar"><div><strong>{filteredProjects.length} projects</strong><span> · {showArchived ? 'Archived' : 'Active and drafts'}</span></div><button className="text-button" onClick={() => setShowArchived(v => !v)}>{showArchived ? 'View active projects' : 'View archive'} <Archive size={14} /></button></div>{filteredProjects.length ? <ProjectList projects={filteredProjects} clients={clients} rename={renameProject} duplicate={duplicateProject} archive={archiveProject} remove={deleteProject} open={openProjectEditor} /> : <EmptyProjects onCreate={() => setShowCreate(true)} archived={showArchived} />}</> : active === 'Templates' ? <><PageTitle eyebrow="A HEAD START FOR EVERY IDEA" title="Template library" subtitle="Explore starting points for different kinds of websites." /><div className="template-toolbar"><div className="template-count">{visibleTemplates.length} designs <span>· Choose a category or search the library</span></div><div className="template-filters">{templateCategories.map(category => <button key={category} className={`filter-chip ${templateCategory === category ? 'selected' : ''}`} onClick={() => setTemplateCategory(category)}>{category}</button>)}</div></div>{visibleTemplates.length ? <div className="template-grid">{visibleTemplates.map(template => <article className="template-card" key={template.id}><button className="template-preview" style={{ background: template.gradient }} onClick={() => setSelectedTemplate(template)} aria-label={`Preview ${template.name}`}><TemplateMock /><span className="preview-label">PREVIEW DESIGN <ArrowDownRight size={13} /></span>{template.featured && <span className="featured-label">FEATURED</span>}</button><div className="template-card-body"><div className="template-meta"><span>{template.category}</span><small>{template.style}</small></div><h3>{template.name}</h3><p>{template.description}</p><div className="template-card-footer"><span>{template.pages.length} planned pages</span><button className="text-button" onClick={() => startFromTemplate(template)}>Use template <ArrowRight size={14} /></button></div></div></article>)}</div> : <div className="empty-state"><div className="empty-icon"><Blocks size={22} /></div><strong>No matching templates</strong><span>Try another category or search term.</span><button className="secondary-button" onClick={() => { setTemplateCategory('All templates'); setSearchTerm('') }}>Clear filters</button></div>}</> : active === 'Clients' ? <><PageTitle eyebrow="RELATIONSHIPS THAT BUILD" title="Your clients" subtitle="Keep client details together with the websites you create for them." action={<button className="primary-button" onClick={() => setShowClient(true)}><Plus size={16} /> Add client</button>} />{clients.length ? <div className="client-grid">{clients.map(client => <article className="client-card" key={client.id}><div className="client-avatar"><Users size={19} /></div><div className="client-info"><strong>{client.name}</strong><span>{client.email || 'No email added'}</span><small>{projects.filter(p => p.clientId === client.id).length} linked projects</small></div><button className="icon-button" aria-label={`Delete ${client.name}`} onClick={() => { if (window.confirm(`Delete client ${client.name}? Projects will remain unassigned.`)) { setClients(cs => cs.filter(c => c.id !== client.id)); setProjects(ps => ps.map(p => p.clientId === client.id ? { ...p, clientId: '', updatedAt: new Date().toISOString() } : p)) } }}><Trash2 size={15} /></button></article>)}</div> : <div className="empty-state"><div className="empty-icon"><Users size={22} /></div><strong>Your client list starts here</strong><span>Add a client to keep their projects organized.</span><button className="secondary-button" onClick={() => setShowClient(true)}><Plus size={14} /> Add your first client</button></div>}</> : active === 'Settings' ? <><PageTitle eyebrow="WORKSPACE CONTROL CENTRE" title="Studio settings" subtitle="Manage your local workspace data and protect your website drafts." /><section className="bottom-grid"><div className="projects-panel"><div className="panel-heading"><div><h3>Workspace backup</h3><p>Keep a copy of your projects, clients and editable website documents.</p></div><ShieldCheck size={18} className="panel-muted-icon" /></div><div className="settings-backup-actions"><button className="primary-button" onClick={exportWorkspaceBackup}><Download size={16} /> Download backup</button><label className="secondary-button backup-upload-button"><Upload size={15} /> Restore from backup<input type="file" accept="application/json,.json" onChange={restoreWorkspaceBackup} /></label></div>{backupMessage && <p className="backup-feedback" role="status">{backupMessage}</p>}<div className="backup-summary"><span>{projects.length} projects</span><span>{clients.length} clients</span><span>Browser storage</span></div></div><div className="activity-panel"><div className="panel-heading"><div><h3>Storage information</h3><p>How your workspace is saved today.</p></div></div><p className="settings-info-copy">Your work is currently saved in this browser on this device. A backup file lets you move or recover it, but it is not cloud sync.</p><p className="settings-info-copy">Keep backup files private because they can contain client details and website content. Cloud accounts and team access will be added after the secure backend is selected.</p></div></section></> : <><PageTitle eyebrow="COMING TO YOUR STUDIO" title={active} subtitle="This part of DSQUARE STUDIO is planned for a future build phase." /><div className="coming-card"><div className="empty-icon"><Sparkles size={22} /></div><strong>We're building this next.</strong><span>Your project and client management foundation is now taking shape.</span><button className="secondary-button" onClick={() => selectNav('My projects')}>Go to my projects <ArrowRight size={14} /></button></div></>}
          <footer className="page-footer"><span>DSQUARE STUDIO <b>•</b> YOUR CREATIVE WORKSPACE</span><span>BUILT FOR WHAT'S NEXT <Sparkles size={12} /></span></footer>
        </div>
      </main>
      {showCreate && <div className="modal-backdrop" role="presentation" onClick={() => { setShowCreate(false); setProjectTemplateId(null) }}><form className="create-modal form-modal" role="dialog" aria-modal="true" aria-labelledby="create-title" onSubmit={createProject} onClick={e => e.stopPropagation()}><button type="button" className="icon-button modal-close" aria-label="Close" onClick={() => { setShowCreate(false); setProjectTemplateId(null) }}><X size={18} /></button><div className="modal-mark"><Plus size={21} /></div><div className="eyebrow"><span className="eyebrow-line" /> A NEW CREATION</div><h2 id="create-title">Create a website project</h2><p className="modal-description">Give this project a name. Your project will open in the visual editor with an editable starting layout.</p><label className="form-label">Project name<input autoFocus required maxLength={80} value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g. Acme company website" /></label><label className="form-label">Website type<select value={projectCategory} onChange={e => setProjectCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label className="form-label">Client (optional)<select value={projectClient} onChange={e => setProjectClient(e.target.value)}><option value="">No client assigned</option>{clients.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label><button className="primary-button form-submit" type="submit">Create project <ArrowRight size={15} /></button><div className="modal-note"><Sparkles size={14} /> Saved in this browser for now.</div></form></div>}
      {selectedTemplate && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedTemplate(null)}><div className="create-modal template-preview-modal" role="dialog" aria-modal="true" aria-labelledby="template-preview-title" onClick={e => e.stopPropagation()}><button className="icon-button modal-close" aria-label="Close preview" onClick={() => setSelectedTemplate(null)}><X size={18} /></button><div className="large-template-preview" style={{ background: selectedTemplate.gradient }}><TemplateMock /></div><div className="eyebrow"><span className="eyebrow-line" /> TEMPLATE DETAILS</div><h2 id="template-preview-title">{selectedTemplate.name}</h2><p className="modal-description">{selectedTemplate.description}</p><div className="template-detail-row"><span>Category</span><strong>{selectedTemplate.category}</strong></div><div className="template-detail-row"><span>Design style</span><strong>{selectedTemplate.style}</strong></div><div className="template-detail-row"><span>Suggested pages</span><strong>{selectedTemplate.pages.join(' · ')}</strong></div><button className="primary-button form-submit" onClick={() => startFromTemplate(selectedTemplate)}>Use this template <ArrowRight size={15} /></button><div className="modal-note"><Sparkles size={14} /> This creates a project starting point. Full editable page designs arrive with the visual editor.</div></div></div>}
      {showClient && <div className="modal-backdrop" role="presentation" onClick={() => setShowClient(false)}><form className="create-modal form-modal" role="dialog" aria-modal="true" aria-labelledby="client-title" onSubmit={createClient} onClick={e => e.stopPropagation()}><button type="button" className="icon-button modal-close" aria-label="Close" onClick={() => setShowClient(false)}><X size={18} /></button><div className="modal-mark"><Users size={20} /></div><div className="eyebrow"><span className="eyebrow-line" /> CLIENT DIRECTORY</div><h2 id="client-title">Add a client</h2><p className="modal-description">Keep the people and businesses you build for organized.</p><label className="form-label">Client or business name<input autoFocus required maxLength={80} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Acme Limited" /></label><label className="form-label">Email address (optional)<input type="email" maxLength={120} value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="hello@example.com" /></label><button className="primary-button form-submit" type="submit">Save client <ArrowRight size={15} /></button></form></div>}
    </div>
  )
}

function TemplateMock() { return <div className="mock-browser"><div className="mock-browser-bar"><i /><i /><i /><span>YOUR BRAND</span></div><div className="mock-site-content"><div className="mock-site-nav" /><div className="mock-site-heading" /><div className="mock-site-copy" /><div className="mock-site-button" /><div className="mock-site-image" /></div></div> }
function PageTitle({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: ReactNode }) {
  return <section className="welcome-row page-title-row"><div><div className="eyebrow"><span className="eyebrow-line" /> {eyebrow}</div><h1>{title}</h1><p className="welcome-subtitle">{subtitle}</p></div>{action}</section>
}
function EmptyProjects({ onCreate, archived = false }: { onCreate: () => void; archived?: boolean }) {
  return <div className="empty-state"><div className="empty-icon"><FolderKanban size={22} /></div><strong>{archived ? 'Nothing in the archive' : 'Your next project starts here'}</strong><span>{archived ? 'Archived projects will appear here.' : 'Create a project to start organizing your website work.'}</span>{!archived && <button className="secondary-button" onClick={onCreate}><FilePlus2 size={15} /> Create your first project</button>}</div>
}
function ProjectList({ projects, clients, rename, duplicate, archive, remove, open }: { projects: Project[]; clients: Client[]; rename: (p: Project) => void; duplicate: (p: Project) => void; archive: (p: Project) => void; remove: (p: Project) => void; open: (p: Project) => void }) {
  return <div className="project-list">{projects.map(project => <article className="project-row" key={project.id}><div className="project-thumb"><Globe2 size={21} /></div><div className="project-details"><strong>{project.name}</strong><span>{project.category} <i>·</i> {clients.find(c => c.id === project.clientId)?.name ?? 'No client assigned'}</span><small>Updated {new Date(project.updatedAt).toLocaleDateString()}</small></div><span className={`status-pill ${project.status.toLowerCase()}`}>{project.status}</span><div className="project-actions"><button className="icon-button" aria-label="Open website editor" title="Edit website" onClick={() => open(project)}><Edit3 size={15} /></button><button className="icon-button" aria-label="Rename project" title="Rename" onClick={() => rename(project)}><Pencil size={15} /></button><button className="icon-button" aria-label="Duplicate project" title="Duplicate" onClick={() => duplicate(project)}><Copy size={15} /></button><button className="icon-button" aria-label={project.status === 'Archived' ? 'Restore project' : 'Archive project'} title={project.status === 'Archived' ? 'Restore' : 'Archive'} onClick={() => archive(project)}><Archive size={15} /></button><button className="icon-button danger-button" aria-label="Delete project" title="Delete" onClick={() => remove(project)}><Trash2 size={15} /></button></div></article>)}</div>
}
export default App
