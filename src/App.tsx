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
type SiteTemplate = { id: string; baseId: string; name: string; category: string; description: string; style: string; pages: string[]; gradient: string; featured?: boolean }

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
const categories = ['Business', 'Portfolio', 'E-commerce', 'Blog / Magazine', 'Landing page', 'Agency', 'Restaurant', 'Education', 'School', 'Community', 'Real Estate', 'Healthcare', 'Beauty & Wellness', 'Hotel & Travel', 'Finance', 'Technology / SaaS', 'Non-profit', 'Events', 'Construction', 'Legal', 'Other']
const baseTemplates: SiteTemplate[] = [
  { id:'agency', name:'Atelier Creative', category:'Agency', description:'A refined agency experience with a confident hero, services, selected work, proof and a strong enquiry journey.', style:'Editorial · Premium', pages:['Home','About','Services','Work','Contact'], gradient:'linear-gradient(135deg,#25231f,#b18a51 52%,#171614)', featured:true },
  { id:'business', name:'Northstar Corporate', category:'Business', description:'A complete, polished company website with clear positioning, service detail, trust signals and contact paths.', style:'Corporate · Refined', pages:['Home','About','Services','Contact'], gradient:'linear-gradient(135deg,#172b35,#648b91 55%,#111a20)', featured:true },
  { id:'portfolio', name:'Forma Portfolio', category:'Portfolio', description:'A minimalist personal brand with a strong introduction, project gallery, biography and collaboration CTA.', style:'Minimal · Creative', pages:['Home','Work','About','Contact'], gradient:'linear-gradient(135deg,#3b2730,#b16d68 55%,#20191c)' },
  { id:'shop', name:'Maison Boutique', category:'E-commerce', description:'A premium storefront concept with collection highlights, product storytelling and customer reassurance.', style:'Luxury · Product-led', pages:['Home','Shop','About','Contact'], gradient:'linear-gradient(135deg,#3a3324,#c0a56c 55%,#1c1a16)', featured:true },
  { id:'restaurant', name:'Savour Restaurant', category:'Restaurant', description:'A hospitality-led restaurant website with menu highlights, atmosphere, visit information and reservation prompts.', style:'Warm · Hospitality', pages:['Home','Menu','Our Story','Visit'], gradient:'linear-gradient(135deg,#3a241c,#b97851 55%,#1d1714)' },
  { id:'launch', name:'Elevate Launch', category:'Landing page', description:'A conversion-focused landing page with a clear value proposition, benefits, social proof and decisive CTA.', style:'Modern · Conversion', pages:['Landing','FAQ','Contact'], gradient:'linear-gradient(135deg,#22234a,#7778bd 55%,#17172a)' },
  { id:'education', name:'Brightpath Academy', category:'Education', description:'An organized education website for programs, admissions, learning outcomes and enquiries.', style:'Friendly · Structured', pages:['Home','Programs','Admissions','About','Contact'], gradient:'linear-gradient(135deg,#1e3a32,#6a967b 55%,#14231e)' },
  { id:'journal', name:'The Edit Journal', category:'Blog / Magazine', description:'A typography-first editorial layout for featured stories, categories, author identity and newsletter growth.', style:'Editorial · Typography', pages:['Home','Stories','Topics','About'], gradient:'linear-gradient(135deg,#33302b,#aa9675 55%,#1c1a17)' },
  { id:'community', name:'Common Ground', category:'Community', description:'A welcoming platform for a membership group, association, initiative or local community.', style:'Welcoming · Modern', pages:['Home','About','Events','Join','Contact'], gradient:'linear-gradient(135deg,#26303e,#6e91a5 55%,#171e27)' },
  { id:'realestate', name:'Haven Properties', category:'Real Estate', description:'A polished property brand with featured listings, agent introduction, buyer guidance and enquiry sections.', style:'Architectural · Luxury', pages:['Home','Properties','About','Contact'], gradient:'linear-gradient(135deg,#34352e,#a99b7c 55%,#1b1d1a)', featured:true },
  { id:'healthcare', name:'Wellcare Clinic', category:'Healthcare', description:'A calm, accessible clinic website with care areas, practitioner introduction and appointment enquiry prompts.', style:'Calm · Trust-led', pages:['Home','Services','Our Team','Patient Info','Contact'], gradient:'linear-gradient(135deg,#1e3d3c,#78a59b 55%,#142321)' },
  { id:'beauty', name:'Élan Beauty Studio', category:'Beauty & Wellness', description:'An elegant beauty and wellness brand with treatment highlights, studio story, testimonials and booking CTA.', style:'Soft · Elegant', pages:['Home','Treatments','About','Gallery','Contact'], gradient:'linear-gradient(135deg,#49323b,#bd8f9a 55%,#241a20)' },
  { id:'travel', name:'Wanderstay Travel', category:'Hotel & Travel', description:'A destination-led hospitality website with experiences, accommodation highlights and travel enquiries.', style:'Destination · Immersive', pages:['Home','Stay','Experiences','Gallery','Contact'], gradient:'linear-gradient(135deg,#263c43,#7c9d91 55%,#172326)' },
  { id:'finance', name:'Meridian Advisory', category:'Finance', description:'A credible advisory website with service pillars, expertise, insights and a professional consultation path.', style:'Confident · Professional', pages:['Home','Solutions','About','Insights','Contact'], gradient:'linear-gradient(135deg,#182a42,#71849a 55%,#101a2a)' },
  { id:'saas', name:'Orbit SaaS', category:'Technology / SaaS', description:'A modern software product site with feature storytelling, workflow benefits, plans and conversion sections.', style:'Product · Modern', pages:['Home','Features','Pricing','Resources','Contact'], gradient:'linear-gradient(135deg,#202344,#7779c5 55%,#15162a)' },
  { id:'nonprofit', name:'Impact Foundation', category:'Non-profit', description:'A mission-first nonprofit site with impact stories, programs, ways to help and donation prompts.', style:'Purposeful · Human', pages:['Home','Our Mission','Programs','Impact','Get Involved'], gradient:'linear-gradient(135deg,#263b30,#89a47c 55%,#17251d)' },
  { id:'events', name:'Gather Events', category:'Events', description:'A stylish event and conference website with schedule, speakers, venue details and registration CTA.', style:'Bold · Event-led', pages:['Home','Schedule','Speakers','Venue','Register'], gradient:'linear-gradient(135deg,#422b26,#bd815e 55%,#241916)' },
  { id:'construction', name:'Foundry Construction', category:'Construction', description:'A robust contractor website with capabilities, project showcase, process and quote enquiry.', style:'Industrial · Dependable', pages:['Home','Services','Projects','About','Request a Quote'], gradient:'linear-gradient(135deg,#35332d,#a58b5f 55%,#1b1a17)' },
  { id:'legal', name:'Axiom Legal', category:'Legal', description:'A discreet professional law-firm website with practice areas, team credentials and consultation contact.', style:'Discreet · Executive', pages:['Home','Practice Areas','Our Firm','People','Contact'], gradient:'linear-gradient(135deg,#222b37,#8c806d 55%,#15191f)' },
]
const templateProfiles: Record<string, { base: string; names: string[]; styles: string[]; descriptions: string[] }> = {
  Business:{base:'business',names:['Northstar Corporate','Summit Consulting','Crestline Group','Oak & Stone Partners','Pioneer Enterprise','The Executive Office','Bluehaven Business','Sterling Advisory','Westbridge Company','Modern Commerce'],styles:['Executive','Minimal','Editorial','Architectural','Bold','Classic','Contemporary','Luxury','Corporate','Modern'],descriptions:['A complete corporate presence with a confident homepage, company story, service detail and lead-generation path.','A clean consulting layout focused on expertise, outcomes and booking enquiries.','An editorial company profile with strong typography and considered storytelling.','A structured business site with premium project and capability sections.','A bold, conversion-led company website for ambitious growing brands.','A timeless professional layout with clear service and trust sections.','A fresh, approachable business site with strong customer journeys.','A premium advisory website with refined details and credibility cues.','A polished multi-page company website for established organisations.','A modern business template with clear messaging and responsive layouts.']},
  Portfolio:{base:'portfolio',names:['Forma Portfolio','The Creative Folio','Studio Profile','Mono Works','Visual Stories','The Designer Edit','Independent Artist','Architect Portfolio','Photographer Folio','Personal Brand'],styles:['Minimal','Editorial','Monochrome','Gallery-led','Artistic','Luxury','Expressive','Architectural','Photography','Personal'],descriptions:['A refined personal portfolio with selected projects, biography and collaboration CTA.','A creative showcase built around case studies and a strong personal introduction.','A studio-style portfolio with a polished services and project presentation.','A restrained monochrome portfolio with typography-led project storytelling.','A visual-first portfolio for image-rich creative work.','A premium portfolio with editorial layouts and considered whitespace.','A distinctive artist website with biography, gallery and enquiries.','A clean architecture portfolio with project-led navigation.','A photography portfolio with immersive image galleries.','A personal brand site with services, testimonials and contact.']},
  'E-commerce':{base:'shop',names:['Maison Boutique','Luxe Goods Store','Everyday Market','Atelier Objects','Glow Beauty Shop','Tech Haven Store','Home & Living','Urban Apparel','Fresh Basket','The Gift Edit'],styles:['Luxury','Editorial','Friendly','Artisan','Beauty','Technology','Lifestyle','Fashion','Grocery','Gift shop'],descriptions:['A premium storefront with collection highlights, product storytelling and customer reassurance.','A luxury retail layout for curated products and premium collections.','A welcoming online shop with clear categories and product discovery.','An artisan storefront with editorial product storytelling.','A beauty shop with product ranges, benefits and customer confidence sections.','A technology store with clear product features and support information.','A homeware shop with lifestyle-led collections and inspiration.','A fashion storefront with seasonal edits and strong product imagery.','A fresh grocery shop with category-led product discovery.','A gift boutique with curated collections and seasonal promotions.']},
  'Blog / Magazine':{base:'journal',names:['The Edit Journal','Modern Muse Magazine','Daily Brief','Culture & Co.','The Food Journal','Travel Notes','Business Review','Wellness Weekly','The Reading Room','City Stories'],styles:['Editorial','Magazine','News','Culture','Food','Travel','Business','Wellness','Literary','Local'],descriptions:['A typography-first editorial website for features, topics and newsletter growth.','A magazine-style layout with featured stories and category browsing.','A clean publication homepage for timely updates and latest articles.','A culture journal with expressive editorial storytelling.','A food publication with recipes, reviews and visual features.','A travel journal with destination guides and photography.','A business publication with analysis, insights and author profiles.','A wellness magazine with helpful guides and expert features.','A literary blog with reading lists and long-form articles.','A local stories platform for neighbourhood news and features.']},
  'Landing page':{base:'launch',names:['Elevate Launch','Product Reveal','App Download','Waitlist Studio','Event Conversion','Lead Magnet','Course Launch','Startup Pitch','Campaign Impact','Coming Soon'],styles:['Conversion','Product','Mobile app','Waitlist','Event','Lead generation','Education','Startup','Campaign','Minimal'],descriptions:['A focused landing page with a clear value proposition, benefits and decisive CTA.','A product launch page with feature highlights and launch messaging.','An app landing page with benefits, screenshots and download prompts.','A waitlist page designed to explain the offer and collect interest.','An event page focused on the value of attending and registration.','A lead-generation page for a downloadable resource or consultation.','A course launch page with outcomes, curriculum and enrolment CTA.','A startup pitch page with problem, solution and traction sections.','A campaign page with a strong message and action-focused layout.','A polished coming-soon page with brand identity and email capture.']},
  Agency:{base:'agency',names:['Atelier Creative','Pixel & Form','Brandcraft Studio','Digital North','Motion House','Social Current','The Design Bureau','Growth Partners','Creative Foundry','Signal Studio'],styles:['Editorial','Digital','Branding','Technology','Motion','Social','Design','Growth','Creative','Minimal'],descriptions:['A refined agency experience with positioning, services, selected work and enquiry journey.','A digital studio site with product and web design case studies.','A brand agency template for identity, strategy and creative work.','A technology agency website with capabilities and project proof.','A motion studio portfolio with reel-led storytelling.','A social media agency site with services, results and packages.','A design bureau with a curated project gallery and studio profile.','A growth agency site with strategy, services and measurable outcomes.','A creative production studio with bold work showcases.','A minimalist consultancy site with sharp messaging and clear CTAs.']},
  Restaurant:{base:'restaurant',names:['Savour Restaurant','The Olive Table','Ember & Oak','Coastal Kitchen','Urban Bistro','Sunday Brunch Club','Sushi House','The Coffee Room','Garden Dining','Street Food Social'],styles:['Fine dining','Mediterranean','Steakhouse','Seafood','Bistro','Brunch','Japanese','Cafe','Garden','Street food'],descriptions:['A hospitality-led website with menu highlights, atmosphere and reservation prompts.','A Mediterranean restaurant site with warm food photography and menu detail.','A premium grill and steakhouse website with bold menus and reservations.','A seafood restaurant layout with fresh seasonal storytelling.','A modern bistro website with menu, location and opening hours.','A brunch cafe site with bright photography and booking prompts.','A Japanese dining website with menu categories and location details.','A coffee shop site with drinks, atmosphere and visit information.','A garden restaurant site with outdoor dining and event enquiries.','A lively street-food brand website with menu and location highlights.']},
  Education:{base:'education',names:['Brightpath Academy','Future Skills Institute','Little Explorers Learning','Summit College','Open Learning Hub','Language House','STEM Discovery Centre','Professional Training Co.','Arts & Design School','Early Years Academy'],styles:['Academic','Professional','Playful','Collegiate','Online learning','Language','STEM','Corporate training','Creative arts','Early years'],descriptions:['A structured education website with programs, admissions, outcomes and enquiries.','A professional institute website for skills training and continuing education.','A friendly learning centre website for children and families.','A college-style site with departments, campus life and admissions.','An online learning platform with course discovery and learner support.','A language school website with courses, levels and enrolment information.','A STEM education website with programs, labs and student projects.','A corporate training website with courses and professional development.','An arts school website with creative programs and student showcases.','An early learning website with curriculum, facilities and parent enquiries.']},
  School:{base:'education',names:['Crestview International School','Greenfield High School','Little Oaks Nursery','Kingsbridge College','Bright Future Primary','Heritage Grammar School','Horizon STEM School','Meadowbrook Academy','Faithway Schools','Riverside Montessori'],styles:['International','Secondary','Nursery','College','Primary','Traditional','STEM','Modern academy','Values-led','Montessori'],descriptions:['A premium school website with admissions, academics, campus life and parent information.','A clear secondary-school website with curriculum, student life and admissions.','A warm nursery website for parents with programs, care and visit enquiries.','A college website with departments, facilities and application information.','A bright primary-school website with learning, activities and parent resources.','A traditional school website with heritage, academic standards and admissions.','A modern STEM school site with labs, innovation and learning pathways.','A complete academy site with academic programs and student achievements.','A values-led school website with community, academics and admissions.','A Montessori school website with learning philosophy and family information.']},
  Community:{base:'community',names:['Common Ground','Neighbourhood Circle','Alumni Connect','Makers Collective','Parents Network','Volunteer Together','Sports Clubhouse','Faith Community','Professional Network','Youth Connect'],styles:['Welcoming','Local','Alumni','Creative','Family','Volunteer','Sports','Faith','Professional','Youth'],descriptions:['A welcoming community platform with mission, events and ways to join.','A local community site for updates, events and neighbourhood participation.','An alumni network website with stories, events and membership enquiries.','A creative collective site for members, projects and gatherings.','A parent network website with resources, activities and connection.','A volunteer organisation site with causes, impact and sign-up paths.','A sports club site with teams, fixtures and membership information.','A faith community site with gatherings, ministries and contact details.','A professional association site with events, resources and membership.','A youth organisation site with programs, opportunities and activities.']},
  'Real Estate':{base:'realestate',names:['Haven Properties','The Address Realty','Urban Nest','Signature Estates','Coastal Homes','Prime Land Group','Luxury Living Realty','First Key Homes','Commercial Spaces','Property Partners'],styles:['Luxury','Residential','Urban','Executive','Coastal','Land','Premium','First-time buyers','Commercial','Agency'],descriptions:['A premium property brand with featured listings, agent profile and buyer enquiries.','A realty website with property search presentation and agent expertise.','A modern urban property website with apartment and neighbourhood features.','An executive property brand with luxury listings and private consultation.','A coastal property website with destination-led imagery and listings.','A land sales website with development opportunities and enquiries.','A luxury homes website with editorial property showcases.','A welcoming estate agency site for buyers and sellers.','A commercial property website with office, retail and investment listings.','A complete property agency website with services, listings and contact.']},
  Healthcare:{base:'healthcare',names:['Wellcare Clinic','Family Health Centre','Dental Care Studio','VisionPoint Eye Clinic','Women’s Wellness Centre','Pediatric Care House','Physio & Motion','Specialist Medical Group','Community Pharmacy','Mental Wellness Clinic'],styles:['Clinic','Family','Dental','Optometry','Women’s health','Pediatrics','Physiotherapy','Specialist','Pharmacy','Wellness'],descriptions:['A calm clinic website with care areas, practitioner profiles and appointment enquiries.','A family health website with services, doctors and patient information.','A dental practice website with treatments, team profiles and booking prompts.','An eye clinic website with services, specialists and patient guidance.','A women’s wellness website with care services and supportive information.','A pediatric clinic website designed for parents and families.','A physiotherapy website with treatment pathways and appointment enquiries.','A specialist medical group site with expertise and patient resources.','A pharmacy website with services, opening hours and health information.','A mental wellness website with services, practitioner profiles and support pathways.']},
  'Beauty & Wellness':{base:'beauty',names:['Élan Beauty Studio','The Skin Atelier','Blush Beauty Lounge','Serenity Spa','Crown & Curl','Nail Society','Glow Aesthetics','Holistic Balance','The Barber Room','Wellness Retreat'],styles:['Elegant','Skincare','Beauty lounge','Spa','Hair','Nails','Aesthetics','Holistic','Barber','Retreat'],descriptions:['An elegant beauty brand with treatments, story, testimonials and booking CTA.','A skincare studio website with treatment details and consultation prompts.','A beauty lounge site with service menus, gallery and bookings.','A calming spa site with treatment experiences and gift options.','A hair studio site with stylist profiles, services and appointments.','A nail studio site with service menu, gallery and booking information.','An aesthetics clinic site with treatment explanations and enquiries.','A holistic wellness website with therapies, philosophy and sessions.','A modern barber website with services, team and appointment details.','A retreat website with experiences, packages and enquiries.']},
  'Hotel & Travel':{base:'travel',names:['Wanderstay Travel','The Grand Palm Hotel','Coastline Resort','Citylight Suites','Safari Trails','Hidden Haven Retreat','Explore Africa Tours','Island Escape','Mountain Lodge','Boutique Stay'],styles:['Travel agency','Hotel','Resort','City hotel','Safari','Retreat','Tour operator','Island','Lodge','Boutique'],descriptions:['A destination-led travel website with experiences and enquiry paths.','A premium hotel website with rooms, amenities and reservation prompts.','A resort website with facilities, experiences and destination storytelling.','A city accommodation site with rooms, location and guest information.','A safari tour website with packages, wildlife experiences and enquiries.','A retreat website with peaceful accommodation and wellness experiences.','A tour operator site with itineraries, destinations and booking enquiries.','An island escape website with stays, activities and travel details.','A mountain lodge website with rooms, activities and location guidance.','A boutique accommodation website with curated rooms and guest services.']},
  Finance:{base:'finance',names:['Meridian Advisory','ClearPath Accounting','Summit Wealth Partners','Cedar Finance Group','Ledger & Co.','Capital Bridge','Taxwise Professionals','Business Funding Hub','Trustline Insurance','Private Client Advisory'],styles:['Advisory','Accounting','Wealth','Corporate','Bookkeeping','Investment','Tax','Funding','Insurance','Private wealth'],descriptions:['A credible advisory site with expertise, insights and consultation paths.','An accounting firm site with services, team and client onboarding information.','A wealth management website with planning services and trust-building content.','A corporate finance website with capabilities and consultation paths.','A bookkeeping service site with packages and small-business support.','An investment advisory website with insights and service detail.','A tax consultancy site with services, deadlines and enquiry forms.','A business finance website with funding options and application guidance.','An insurance agency website with coverage categories and quote enquiries.','A private client website with discreet, premium advisory positioning.']},
  'Technology / SaaS':{base:'saas',names:['Orbit SaaS','Flowdesk Software','Nexora Platform','CloudPilot','MetricBoard','SecureStack','TeamSync','Launchpad CRM','DataCanvas','Automation Works'],styles:['SaaS','Workflow','Platform','Cloud','Analytics','Security','Collaboration','CRM','Data','Automation'],descriptions:['A modern software site with feature storytelling, plans and conversion sections.','A workflow product website with benefits, use cases and demo CTA.','A platform site with capabilities, integrations and customer proof.','A cloud software site with product benefits and trust sections.','An analytics product site with dashboard features and pricing.','A cybersecurity site with protection features and consultation CTA.','A collaboration software site with team workflows and product details.','A CRM website with pipeline features, plans and demo booking.','A data platform site with use cases and technical benefits.','An automation platform site with workflows and clear product messaging.']},
  'Non-profit':{base:'nonprofit',names:['Impact Foundation','HopeWorks Initiative','Clean Future Project','Community Hands','Girls Rise Network','Food for All','Green Earth Alliance','Learning for Everyone','Health Access Fund','Animal Care Trust'],styles:['Foundation','Community','Environment','Volunteer','Empowerment','Food relief','Climate','Education','Healthcare','Animal welfare'],descriptions:['A mission-first nonprofit site with impact stories, programs and ways to help.','A community initiative site with mission, activities and volunteer sign-up.','An environmental project site with campaigns and impact reporting.','A volunteer organisation site with programs and ways to contribute.','An empowerment initiative website with stories, programs and support.','A food support organisation site with impact, donations and volunteer paths.','An environmental nonprofit website with campaigns and community action.','An education charity website with programs and measurable impact.','A health access foundation site with mission and support information.','An animal welfare site with rescue stories, adoption and donations.']},
  Events:{base:'events',names:['Gather Events','The Conference Edit','EverAfter Weddings','City Music Festival','Business Summit','Creative Market','Community Celebration','Product Launch Night','Awards & Gala','Workshop Series'],styles:['Event','Conference','Wedding','Festival','Summit','Market','Community','Launch','Gala','Workshop'],descriptions:['A stylish event website with schedule, speakers, venue and registration CTA.','A conference website with sessions, speakers and attendee information.','A wedding website with story, schedule, venue and RSVP details.','A festival site with lineup, tickets and visitor information.','A business summit site with speakers, agenda and registration.','A creative market site with vendors, dates and visitor guidance.','A community event site with program, venue and sign-up.','A product launch site with event details and RSVP.','An awards gala site with nominees, schedule and guest information.','A workshop site with topics, instructors and registration.']},
  Construction:{base:'construction',names:['Foundry Construction','BuildRight Contractors','UrbanCraft Developments','SolidGround Engineering','Prime Renovations','Cedar Homes','Infrastructure Works','Interior Build Studio','Roofline Specialists','ProjectWorks Group'],styles:['Contractor','Building','Development','Engineering','Renovation','Home builder','Infrastructure','Interior','Roofing','Project management'],descriptions:['A robust contractor website with capabilities, project showcase and quote enquiry.','A construction company site with services, projects and estimate requests.','A development brand website with projects, approach and enquiries.','An engineering site with expertise, sectors and project credentials.','A renovation website with before-and-after project storytelling.','A home builder site with plans, finishes and consultation CTA.','An infrastructure company site with capabilities and project highlights.','An interior build site with design-build services and portfolio.','A roofing company site with services, workmanship and quote requests.','A project delivery website with process, sectors and contact.']},
  Legal:{base:'legal',names:['Axiom Legal','Bridgeway Law','Crown Chambers','The Legal Partners','Northstar Attorneys','Business Counsel','Family Law Office','Property Law Group','Dispute Resolution Firm','Corporate Legal Advisory'],styles:['Executive','Traditional','Chambers','Partnership','Modern','Business law','Family law','Property law','Disputes','Corporate'],descriptions:['A discreet professional law-firm website with practice areas and consultation contact.','A law practice site with attorney profiles and clear legal service pathways.','A chambers website with barrister profiles and practice expertise.','A partnership website with team credentials and client services.','A modern attorney website with accessible legal information.','A business law website for companies and entrepreneurs.','A family law practice website with supportive guidance and enquiries.','A property law site with conveyancing and real estate legal services.','A dispute resolution site with expertise and consultation prompts.','A corporate legal advisory website with capabilities and professional credentials.']},
  Other:{base:'business',names:['Studio One','The Modern Collective','Local Business Pro','Personal Services','Creative Enterprise','Professional Practice','Community Enterprise','Digital Presence','Premium Brand','Simple & Clear'],styles:['Modern','Collective','Local','Services','Creative','Professional','Community','Digital','Premium','Minimal'],descriptions:['A flexible premium website for a growing organisation.','A polished multi-purpose website with clear brand storytelling.','A local business website with services, trust and contact information.','A service provider website with clear offerings and enquiries.','A creative business site with portfolio and brand introduction.','A professional practice site with expertise and client pathways.','A community enterprise site with mission and engagement.','A digital-first business site with modern conversion sections.','A premium brand website with elegant styling and strong positioning.','A simple, elegant website for a focused business.']},
};
const previewGradients = ['linear-gradient(135deg,#182d38,#6e9b9c 55%,#101b22)','linear-gradient(135deg,#3d2b31,#b47778 55%,#1f171c)','linear-gradient(135deg,#292b4b,#7c83bd 55%,#17182b)','linear-gradient(135deg,#403323,#bd9d66 55%,#201b15)','linear-gradient(135deg,#253c30,#85a47e 55%,#14251c)','linear-gradient(135deg,#3a2d48,#a58bc4 55%,#21182a)','linear-gradient(135deg,#273b48,#7194aa 55%,#16232c)','linear-gradient(135deg,#49352b,#bd8c67 55%,#211815)','linear-gradient(135deg,#263d3d,#77a69b 55%,#142222)','linear-gradient(135deg,#383838,#a9a9a9 55%,#1a1a1a)'];
const templates: SiteTemplate[] = categories.flatMap(category => {
  const profile = templateProfiles[category];
  const base = baseTemplates.find(item => item.id === profile.base)!;
  return profile.names.map((name, index) => ({
    id: `${profile.base}-v${String(index + 1).padStart(2, '0')}`,
    baseId: profile.base,
    name,
    category,
    description: profile.descriptions[index],
    style: profile.styles[index] + ' · Premium',
    pages: category === 'School' ? ['Home','About','Academics','Admissions','Student Life','News','Contact'] : base.pages,
    gradient: previewGradients[(index + categories.indexOf(category)) % previewGradients.length],
    featured: index < 2,
  }));
});
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
      {selectedTemplate && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedTemplate(null)}><div className="create-modal template-preview-modal" role="dialog" aria-modal="true" aria-labelledby="template-preview-title" onClick={e => e.stopPropagation()}><button className="icon-button modal-close" aria-label="Close preview" onClick={() => setSelectedTemplate(null)}><X size={18} /></button><div className="large-template-preview" style={{ background: selectedTemplate.gradient }}><TemplateMock /></div><div className="eyebrow"><span className="eyebrow-line" /> TEMPLATE DETAILS</div><h2 id="template-preview-title">{selectedTemplate.name}</h2><p className="modal-description">{selectedTemplate.description}</p><div className="template-detail-row"><span>Category</span><strong>{selectedTemplate.category}</strong></div><div className="template-detail-row"><span>Design style</span><strong>{selectedTemplate.style}</strong></div><div className="template-detail-row"><span>Suggested pages</span><strong>{selectedTemplate.pages.join(' · ')}</strong></div><button className="primary-button form-submit" onClick={() => startFromTemplate(selectedTemplate)}>Use this template <ArrowRight size={15} /></button><div className="modal-note"><Sparkles size={14} /> A complete editable multi-page website draft will be created. Replace the sample brand details, add your logo and images, then review before publishing.</div></div></div>}
      {showClient && <div className="modal-backdrop" role="presentation" onClick={() => setShowClient(false)}><form className="create-modal form-modal" role="dialog" aria-modal="true" aria-labelledby="client-title" onSubmit={createClient} onClick={e => e.stopPropagation()}><button type="button" className="icon-button modal-close" aria-label="Close" onClick={() => setShowClient(false)}><X size={18} /></button><div className="modal-mark"><Users size={20} /></div><div className="eyebrow"><span className="eyebrow-line" /> CLIENT DIRECTORY</div><h2 id="client-title">Add a client</h2><p className="modal-description">Keep the people and businesses you build for organized.</p><label className="form-label">Client or business name<input autoFocus required maxLength={80} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Acme Limited" /></label><label className="form-label">Email address (optional)<input type="email" maxLength={120} value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="hello@example.com" /></label><button className="primary-button form-submit" type="submit">Save client <ArrowRight size={15} /></button></form></div>}
    </div>
  )
}

function TemplateMock() { return <div className="mock-browser"><div className="mock-browser-bar"><i /><i /><i /><span>YOUR BRAND</span></div><div className="mock-site-content"><div className="mock-site-nav"><b /><i /><i /><i /></div><div className="mock-site-layout"><div className="mock-site-copy-block"><div className="mock-site-kicker" /><div className="mock-site-heading" /><div className="mock-site-copy" /><div className="mock-site-copy short" /><div className="mock-site-button" /></div><div className="mock-site-image" /></div><div className="mock-site-proof"><i /><i /><i /></div></div></div> }
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
