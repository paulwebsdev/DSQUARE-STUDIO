import { useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Bell,
  Blocks,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  FilePlus2,
  FolderKanban,
  Globe2,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings2,
  Sparkles,
  WandSparkles,
  X,
} from 'lucide-react'

type NavItem = {
  label: string
  icon: typeof LayoutDashboard
}

const mainNav: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My projects', icon: FolderKanban },
  { label: 'Templates', icon: Blocks },
  { label: 'AI website builder', icon: WandSparkles },
]

const quickStarts = [
  {
    title: 'Start with a template',
    description: 'Choose a professionally designed starting point.',
    icon: Blocks,
    tag: 'TEMPLATE LIBRARY',
  },
  {
    title: 'Build visually',
    description: 'Create your layout with sections and drag-and-drop blocks.',
    icon: LayoutDashboard,
    tag: 'VISUAL EDITOR',
  },
  {
    title: 'Generate with AI',
    description: 'Describe your idea and shape it into a website.',
    icon: Sparkles,
    tag: 'AI WEBSITE BUILDER',
  },
]

function App() {
  const [active, setActive] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const selectNav = (label: string) => {
    setActive(label)
    setMenuOpen(false)
  }

  return (
    <div className="studio-shell">
      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark">D<span>.</span></div>
          <div>
            <div className="brand-name">DSQUARE <span>STUDIO</span></div>
            <div className="brand-caption">YOUR CREATIVE WORKSPACE</div>
          </div>
          <button className="icon-button mobile-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={18} /></button>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">D</div>
          <div className="workspace-copy"><strong>DSQUARE Workspace</strong><span>Private studio</span></div>
          <ChevronDown size={15} className="muted-icon" />
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {mainNav.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => selectNav(label)}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {label === 'AI website builder' && <span className="new-badge">NEW</span>}
            </button>
          ))}
        </nav>

        <div className="nav-label tools-label">MANAGE</div>
        <nav className="side-nav" aria-label="Management navigation">
          <button className={`nav-item ${active === 'Clients' ? 'active' : ''}`} onClick={() => selectNav('Clients')}><BriefcaseBusiness size={18} /><span>Clients</span></button>
          <button className={`nav-item ${active === 'Publishing' ? 'active' : ''}`} onClick={() => selectNav('Publishing')}><Globe2 size={18} /><span>Publishing</span></button>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={17} /></div>
            <strong>Need a hand?</strong>
            <p>Your creative workspace, one step at a time.</p>
            <button onClick={() => setActive('Help')}>Explore help <ArrowRight size={13} /></button>
          </div>
          <button className={`nav-item bottom-link ${active === 'Settings' ? 'active' : ''}`} onClick={() => selectNav('Settings')}><Settings2 size={18} /><span>Settings</span></button>
          <div className="profile-row">
            <div className="profile-avatar">D</div>
            <div className="profile-copy"><strong>DSQUARE</strong><span>Studio owner</span></div>
            <button className="icon-button" aria-label="Profile options"><ChevronDown size={16} /></button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
            <div className="breadcrumb">Workspace <span>/</span> <strong>{active}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className="search-box"><Search size={16} /><span>Search anything...</span><kbd>⌘ K</kbd></div>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
            <div className="top-avatar">D</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> YOUR PRIVATE CREATIVE SPACE</div>
              <h1>Make something <em>remarkable.</em></h1>
              <p className="welcome-subtitle">Your ideas, your clients, your websites. Everything starts here.</p>
            </div>
            <button className="primary-button create-button" onClick={() => setShowCreate(true)}><Plus size={17} /> Create a website</button>
          </section>

          <section className="hero-panel">
            <div className="hero-copy">
              <div className="hero-kicker"><Sparkles size={14} /> THE STUDIO IS YOURS</div>
              <h2>From first idea<br />to <span>live website.</span></h2>
              <p>Build without limits. Start with a template, design every detail yourself, or let AI bring your vision to life.</p>
              <button className="hero-button" onClick={() => setShowCreate(true)}>Start creating <ArrowRight size={16} /></button>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="art-orbit orbit-one" />
              <div className="art-orbit orbit-two" />
              <div className="art-glow" />
              <div className="art-window">
                <div className="window-top"><span /><span /><span /><div>dsquare.studio</div></div>
                <div className="window-content">
                  <div className="window-side" />
                  <div className="window-main"><div className="window-line short" /><div className="window-title" /><div className="window-line" /><div className="window-line tiny" /><div className="window-cta" /><div className="window-image" /></div>
                </div>
              </div>
              <div className="floating-chip chip-top"><Sparkles size={13} /> AI assisted</div>
              <div className="floating-chip chip-bottom"><Activity size={13} /> Your next big idea</div>
            </div>
            <div className="hero-grain" />
          </section>

          <section className="section-heading">
            <div><h3>Choose your starting point</h3><p>Three ways to bring your next website to life.</p></div>
            <button className="text-button" onClick={() => setShowCreate(true)}>Explore all <ArrowRight size={14} /></button>
          </section>

          <section className="quick-grid">
            {quickStarts.map(({ title, description, icon: Icon, tag }, index) => (
              <button className="quick-card" key={title} onClick={() => setShowCreate(true)}>
                <div className="quick-card-top"><div className="quick-icon"><Icon size={19} /></div><span className="card-arrow"><ArrowDownRight size={17} /></span></div>
                <div className="quick-tag">{tag}</div>
                <h4>{title}</h4>
                <p>{description}</p>
                <div className="quick-card-footer"><span>{index === 0 ? 'Browse designs' : index === 1 ? 'Open editor' : 'Start with a prompt'}</span><ArrowRight size={14} /></div>
              </button>
            ))}
          </section>

          <section className="bottom-grid">
            <div className="projects-panel">
              <div className="panel-heading"><div><h3>Recent projects</h3><p>Your latest creative work in one place.</p></div><button className="text-button" onClick={() => selectNav('My projects')}>View all <ArrowRight size={14} /></button></div>
              <div className="empty-projects">
                <div className="empty-icon"><FolderKanban size={22} /></div>
                <strong>Your next project starts here</strong>
                <span>When you create a website, it will appear here.</span>
                <button className="secondary-button" onClick={() => setShowCreate(true)}><FilePlus2 size={15} /> Create your first project</button>
              </div>
            </div>
            <div className="activity-panel">
              <div className="panel-heading"><div><h3>Studio activity</h3><p>A little progress goes a long way.</p></div><Clock3 size={17} className="panel-muted-icon" /></div>
              <div className="activity-empty"><div className="activity-symbol"><Command size={18} /></div><p>Your studio activity will show up here.</p><span>Projects, edits and publishing updates will be gathered in one timeline.</span></div>
            </div>
          </section>

          <footer className="page-footer"><span>DSQUARE STUDIO <b>•</b> YOUR CREATIVE WORKSPACE</span><span>BUILT FOR WHAT'S NEXT <Sparkles size={12} /></span></footer>
        </div>
      </main>

      {showCreate && (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowCreate(false)}>
          <div className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-title" onClick={(event) => event.stopPropagation()}>
            <button className="icon-button modal-close" aria-label="Close" onClick={() => setShowCreate(false)}><X size={18} /></button>
            <div className="modal-mark"><Plus size={21} /></div>
            <div className="eyebrow"><span className="eyebrow-line" /> A NEW CREATION</div>
            <h2 id="create-title">How would you like to begin?</h2>
            <p className="modal-description">Choose a starting point. You can change and refine everything as you go.</p>
            <div className="modal-options">
              {quickStarts.map(({ title, description, icon: Icon }) => (
                <button className="modal-option" key={title} onClick={() => { setActive(title); setShowCreate(false) }}>
                  <div className="quick-icon"><Icon size={18} /></div>
                  <div><strong>{title}</strong><span>{description}</span></div>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
            <div className="modal-note"><Sparkles size={14} /> All website types. One creative studio.</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
