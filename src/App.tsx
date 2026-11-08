import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowRight, Bell, Blocks, BriefcaseBusiness,
  ChevronDown, CircleHelp, Clock3, Command, Copy, FilePlus2, FolderKanban,
  Globe2, LayoutDashboard, Menu, Plus, Search, Settings2, Sparkles,
  WandSparkles, X, Archive, Pencil, Trash2, Users, ExternalLink
} from 'lucide-react'

type NavItem = { label: string; icon: typeof LayoutDashboard }
type Client = { id: string; name: string; email: string; createdAt: string }
type Project = { id: string; name: string; category: string; clientId: string; status: 'Draft' | 'Archived'; createdAt: string; updatedAt: string }

const mainNav: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My projects', icon: FolderKanban },
  { label: 'Templates', icon: Blocks },
  { label: 'AI website builder', icon: WandSparkles },
]
const quickStarts = [
  { title: 'Start with a template', description: 'Choose a professionally designed starting point.', icon: Blocks, tag: 'TEMPLATE LIBRARY' },
  { title: 'Build visually', description: 'Create your layout with sections and drag-and-drop blocks.', icon: LayoutDashboard, tag: 'VISUAL EDITOR' },
  { title: 'Generate with AI', description: 'Describe your idea and shape it into a website.', icon: Sparkles, tag: 'AI WEBSITE BUILDER' },
]
const categories = ['Business', 'Portfolio', 'E-commerce', 'Blog / Magazine', 'Landing page', 'Agency', 'Restaurant', 'Education', 'Community', 'Other']
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
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => { localStorage.setItem('dsquare-projects', JSON.stringify(projects)) }, [projects])
  useEffect(() => { localStorage.setItem('dsquare-clients', JSON.stringify(clients)) }, [clients])
  const selectNav = (label: string) => { setActive(label); setMenuOpen(false) }
  const activeProjects = projects.filter(p => showArchived ? p.status === 'Archived' : p.status !== 'Archived')
  const filteredProjects = useMemo(() => activeProjects.filter(p => {
    const client = clients.find(c => c.id === p.clientId)
    return `${p.name} ${p.category} ${client?.name ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  }), [activeProjects, clients, searchTerm])
  const createProject = (event: React.FormEvent) => {
    event.preventDefault()
    if (!projectName.trim()) return
    const now = new Date().toISOString()
    setProjects(current => [{ id: makeId(), name: projectName.trim(), category: projectCategory, clientId: projectClient, status: 'Draft', createdAt: now, updatedAt: now }, ...current])
    setProjectName(''); setProjectCategory('Business'); setProjectClient(''); setShowCreate(false); setActive('My projects')
  }
  const createClient = (event: React.FormEvent) => {
    event.preventDefault()
    if (!clientName.trim()) return
    setClients(current => [{ id: makeId(), name: clientName.trim(), email: clientEmail.trim(), createdAt: new Date().toISOString() }, ...current])
    setClientName(''); setClientEmail(''); setShowClient(false); setActive('Clients')
  }
  const renameProject = (project: Project) => {
    const name = window.prompt('Enter a new project name', project.name)
    if (name?.trim()) setProjects(current => current.map(p => p.id === project.id ? { ...p, name: name.trim(), updatedAt: new Date().toISOString() } : p))
  }
  const duplicateProject = (project: Project) => setProjects(current => [{ ...project, id: makeId(), name: `${project.name} copy`, status: 'Draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current])
  const archiveProject = (project: Project) => setProjects(current => current.map(p => p.id === project.id ? { ...p, status: p.status === 'Archived' ? 'Draft' : 'Archived' } : p))
  const deleteProject = (project: Project) => {
    if (window.confirm(`Permanently delete “${project.name}” from this browser?`)) setProjects(current => current.filter(p => p.id !== project.id))
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
        <header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div className="breadcrumb">Workspace <span>/</span> <strong>{active}</strong></div></div><div className="topbar-actions"><label className="search-box"><Search size={16} /><input aria-label="Search projects and clients" placeholder="Search projects..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></label><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="top-avatar">D</div></div></header>
        <div className="page-content">
          {active === 'Overview' ? <>
            <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> YOUR PRIVATE CREATIVE SPACE</div><h1>Make something <em>remarkable.</em></h1><p className="welcome-subtitle">Your ideas, your clients, your websites. Everything starts here.</p></div><button className="primary-button create-button" onClick={() => setShowCreate(true)}><Plus size={17} /> Create a website</button></section>
            <section className="hero-panel"><div className="hero-copy"><div className="hero-kicker"><Sparkles size={14} /> THE STUDIO IS YOURS</div><h2>From first idea<br />to <span>live website.</span></h2><p>Build without limits. Start with a template, design every detail yourself, or let AI bring your vision to life.</p><button className="hero-button" onClick={() => setShowCreate(true)}>Start creating <ArrowRight size={16} /></button></div><div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-glow" /><div className="art-window"><div className="window-top"><span /><span /><span /><div>dsquare.studio</div></div><div className="window-content"><div className="window-side" /><div className="window-main"><div className="window-line short" /><div className="window-title" /><div className="window-line" /><div className="window-line tiny" /><div className="window-cta" /><div className="window-image" /></div></div></div><div className="floating-chip chip-top"><Sparkles size={13} /> AI assisted</div><div className="floating-chip chip-bottom"><Activity size={13} /> Your next big idea</div></div><div className="hero-grain" /></section>
            <section className="section-heading"><div><h3>Choose your starting point</h3><p>Three ways to bring your next website to life.</p></div><button className="text-button" onClick={() => selectNav('Templates')}>Explore all <ArrowRight size={14} /></button></section>
            <section className="quick-grid">{quickStarts.map(({ title, description, icon: Icon, tag }, index) => <button className="quick-card" key={title} onClick={() => setShowCreate(true)}><div className="quick-card-top"><div className="quick-icon"><Icon size={19} /></div><span className="card-arrow"><ArrowDownRight size={17} /></span></div><div className="quick-tag">{tag}</div><h4>{title}</h4><p>{description}</p><div className="quick-card-footer"><span>{index === 0 ? 'Browse designs' : index === 1 ? 'Open editor' : 'Start with a prompt'}</span><ArrowRight size={14} /></div></button>)}</section>
            <section className="bottom-grid"><div className="projects-panel"><div className="panel-heading"><div><h3>Recent projects</h3><p>Your latest creative work in one place.</p></div><button className="text-button" onClick={() => selectNav('My projects')}>View all <ArrowRight size={14} /></button></div>{projects.length ? <ProjectList projects={projects.filter(p => p.status !== 'Archived').slice(0,3)} clients={clients} rename={renameProject} duplicate={duplicateProject} archive={archiveProject} remove={deleteProject} /> : <EmptyProjects onCreate={() => setShowCreate(true)} />}</div><div className="activity-panel"><div className="panel-heading"><div><h3>Studio snapshot</h3><p>Your workspace at a glance.</p></div><Clock3 size={17} className="panel-muted-icon" /></div><div className="snapshot-stats"><div><strong>{projects.filter(p => p.status !== 'Archived').length}</strong><span>Active projects</span></div><div><strong>{clients.length}</strong><span>Clients</span></div><div><strong>{projects.filter(p => p.status === 'Archived').length}</strong><span>Archived</span></div></div></div></section>
          </> : active === 'My projects' ? <><PageTitle eyebrow="YOUR WORK, ORGANIZED" title="My projects" subtitle="Create, organize and manage every client website from one place." action={<button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={16} /> New project</button>} /><div className="list-toolbar"><div><strong>{filteredProjects.length} projects</strong><span> · {showArchived ? 'Archived' : 'Active and drafts'}</span></div><button className="text-button" onClick={() => setShowArchived(v => !v)}>{showArchived ? 'View active projects' : 'View archive'} <Archive size={14} /></button></div>{filteredProjects.length ? <ProjectList projects={filteredProjects} clients={clients} rename={renameProject} duplicate={duplicateProject} archive={archiveProject} remove={deleteProject} /> : <EmptyProjects onCreate={() => setShowCreate(true)} archived={showArchived} />}</> : active === 'Clients' ? <><PageTitle eyebrow="RELATIONSHIPS THAT BUILD" title="Your clients" subtitle="Keep client details together with the websites you create for them." action={<button className="primary-button" onClick={() => setShowClient(true)}><Plus size={16} /> Add client</button>} />{clients.length ? <div className="client-grid">{clients.map(client => <article className="client-card" key={client.id}><div className="client-avatar"><Users size={19} /></div><div className="client-info"><strong>{client.name}</strong><span>{client.email || 'No email added'}</span><small>{projects.filter(p => p.clientId === client.id).length} linked projects</small></div><button className="icon-button" aria-label={`Delete ${client.name}`} onClick={() => { if (window.confirm(`Delete client ${client.name}? Projects will remain unassigned.`)) { setClients(cs => cs.filter(c => c.id !== client.id)); setProjects(ps => ps.map(p => p.clientId === client.id ? { ...p, clientId: '' } : p)) } }}><Trash2 size={15} /></button></article>)}</div> : <div className="empty-state"><div className="empty-icon"><Users size={22} /></div><strong>Your client list starts here</strong><span>Add a client to keep their projects organized.</span><button className="secondary-button" onClick={() => setShowClient(true)}><Plus size={14} /> Add your first client</button></div>}</> : <><PageTitle eyebrow="COMING TO YOUR STUDIO" title={active} subtitle="This part of DSQUARE STUDIO is planned for a future build phase." /><div className="coming-card"><div className="empty-icon"><Sparkles size={22} /></div><strong>We're building this next.</strong><span>Your project and client management foundation is now taking shape.</span><button className="secondary-button" onClick={() => selectNav('My projects')}>Go to my projects <ArrowRight size={14} /></button></div></>}
          <footer className="page-footer"><span>DSQUARE STUDIO <b>•</b> YOUR CREATIVE WORKSPACE</span><span>BUILT FOR WHAT'S NEXT <Sparkles size={12} /></span></footer>
        </div>
      </main>
      {showCreate && <div className="modal-backdrop" role="presentation" onClick={() => setShowCreate(false)}><form className="create-modal form-modal" role="dialog" aria-modal="true" aria-labelledby="create-title" onSubmit={createProject} onClick={e => e.stopPropagation()}><button type="button" className="icon-button modal-close" aria-label="Close" onClick={() => setShowCreate(false)}><X size={18} /></button><div className="modal-mark"><Plus size={21} /></div><div className="eyebrow"><span className="eyebrow-line" /> A NEW CREATION</div><h2 id="create-title">Create a website project</h2><p className="modal-description">Give this project a name. You can choose a design approach in the next phase.</p><label className="form-label">Project name<input autoFocus required maxLength={80} value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g. Acme company website" /></label><label className="form-label">Website type<select value={projectCategory} onChange={e => setProjectCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label className="form-label">Client (optional)<select value={projectClient} onChange={e => setProjectClient(e.target.value)}><option value="">No client assigned</option>{clients.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label><button className="primary-button form-submit" type="submit">Create project <ArrowRight size={15} /></button><div className="modal-note"><Sparkles size={14} /> Saved in this browser for now.</div></form></div>}
      {showClient && <div className="modal-backdrop" role="presentation" onClick={() => setShowClient(false)}><form className="create-modal form-modal" role="dialog" aria-modal="true" aria-labelledby="client-title" onSubmit={createClient} onClick={e => e.stopPropagation()}><button type="button" className="icon-button modal-close" aria-label="Close" onClick={() => setShowClient(false)}><X size={18} /></button><div className="modal-mark"><Users size={20} /></div><div className="eyebrow"><span className="eyebrow-line" /> CLIENT DIRECTORY</div><h2 id="client-title">Add a client</h2><p className="modal-description">Keep the people and businesses you build for organized.</p><label className="form-label">Client or business name<input autoFocus required maxLength={80} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Acme Limited" /></label><label className="form-label">Email address (optional)<input type="email" maxLength={120} value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="hello@example.com" /></label><button className="primary-button form-submit" type="submit">Save client <ArrowRight size={15} /></button></form></div>}
    </div>
  )
}

function PageTitle({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <section className="welcome-row page-title-row"><div><div className="eyebrow"><span className="eyebrow-line" /> {eyebrow}</div><h1>{title}</h1><p className="welcome-subtitle">{subtitle}</p></div>{action}</section>
}
function EmptyProjects({ onCreate, archived = false }: { onCreate: () => void; archived?: boolean }) {
  return <div className="empty-state"><div className="empty-icon"><FolderKanban size={22} /></div><strong>{archived ? 'Nothing in the archive' : 'Your next project starts here'}</strong><span>{archived ? 'Archived projects will appear here.' : 'Create a project to start organizing your website work.'}</span>{!archived && <button className="secondary-button" onClick={onCreate}><FilePlus2 size={15} /> Create your first project</button>}</div>
}
function ProjectList({ projects, clients, rename, duplicate, archive, remove }: { projects: Project[]; clients: Client[]; rename: (p: Project) => void; duplicate: (p: Project) => void; archive: (p: Project) => void; remove: (p: Project) => void }) {
  return <div className="project-list">{projects.map(project => <article className="project-row" key={project.id}><div className="project-thumb"><Globe2 size={21} /></div><div className="project-details"><strong>{project.name}</strong><span>{project.category} <i>·</i> {clients.find(c => c.id === project.clientId)?.name ?? 'No client assigned'}</span><small>Updated {new Date(project.updatedAt).toLocaleDateString()}</small></div><span className={`status-pill ${project.status.toLowerCase()}`}>{project.status}</span><div className="project-actions"><button className="icon-button" aria-label="Rename project" title="Rename" onClick={() => rename(project)}><Pencil size={15} /></button><button className="icon-button" aria-label="Duplicate project" title="Duplicate" onClick={() => duplicate(project)}><Copy size={15} /></button><button className="icon-button" aria-label={project.status === 'Archived' ? 'Restore project' : 'Archive project'} title={project.status === 'Archived' ? 'Restore' : 'Archive'} onClick={() => archive(project)}><Archive size={15} /></button><button className="icon-button danger-button" aria-label="Delete project" title="Delete" onClick={() => remove(project)}><Trash2 size={15} /></button></div></article>)}</div>
}
export default App
