import { createId, type SiteDocument, type SitePage, type SiteSection } from './types'

function component(kind: 'heading' | 'text' | 'button', content: string) {
  return {
    id: createId(kind),
    kind,
    content,
    visible: true,
    styles: kind === 'heading'
      ? { fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: '700', color: '#171717', maxWidth: '760px' }
      : kind === 'button'
        ? { backgroundColor: '#c99b45', color: '#111111', padding: '14px 24px', borderRadius: '999px' }
        : { fontSize: '1.125rem', color: '#666666', maxWidth: '620px' },
  } as const
}

function section(kind: SiteSection['kind'], name: string, components: SiteSection['components'], styles: SiteSection['styles'] = {}): SiteSection {
  return { id: createId('section'), kind, name, enabled: true, styles, components: [...components] }
}

export function createStarterPage(): SitePage {
  return {
    id: createId('page'),
    name: 'Home',
    slug: '/',
    isHomePage: true,
    sections: [
      section('header', 'Navigation', [component('heading', 'YOUR BRAND')], { padding: '24px 6%' }),
      section('hero', 'Hero section', [
        component('heading', 'Build something remarkable.'),
        component('text', 'Tell your visitors what makes your business different. Replace this text with your own message.'),
        component('button', 'Get started'),
      ], { padding: '112px 6%', backgroundColor: '#f6f3ed' }),
      section('features', 'What we do', [
        component('heading', 'Made for your next big idea'),
        component('text', 'Add your services, products or key benefits here.'),
      ], { padding: '88px 6%' }),
      section('contact', 'Contact', [
        component('heading', 'Let’s work together'),
        component('text', 'Add your contact details and invite visitors to get in touch.'),
        component('button', 'Contact us'),
      ], { padding: '88px 6%', backgroundColor: '#f6f3ed' }),
      section('footer', 'Footer', [component('text', '© Your brand. All rights reserved.')], { padding: '32px 6%' }),
    ],
  }
}

export function createStarterSite(name = 'Untitled website', category = 'Business'): SiteDocument {
  const now = new Date().toISOString()
  return {
    schemaVersion: 1,
    id: createId('site'),
    name,
    category,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    theme: {
      primaryColor: '#171717',
      accentColor: '#c99b45',
      backgroundColor: '#ffffff',
      textColor: '#262626',
      headingFont: 'Inter',
      bodyFont: 'Inter',
      buttonRadius: '999px',
    },
    pages: [createStarterPage()],
    metadata: {
      title: name,
      description: 'A website created with DSQUARE STUDIO.',
      language: 'en',
    },
  }
}


/** Build a complete editable homepage from one of the studio's starter templates. */
export function createSiteFromTemplate(templateId: string, name: string, category: string): SiteDocument {
  const variantNumber = Number(templateId.match(/-v(\\d+)$/)?.[1] ?? '1')\n  const baseTemplateId = templateId.replace(/-v\\d+$/, '')\n  const site = createStarterSite(name, category)
  const makeSection = (kind: SiteSection['kind'], title: string, body: string, button?: string, tone = '#ffffff'): SiteSection => ({
    id: createId('section'),
    kind,
    name: title,
    enabled: true,
    styles: { padding: kind === 'hero' ? '112px 8%' : '76px 8%', backgroundColor: tone },
    components: [
      { ...component('heading', title), id: createId('heading') },
      { ...component('text', body), id: createId('text') },
      ...(button ? [{ ...component('button', button), id: createId('button') }] : []),
    ],
  })
  const content: Record<string, Array<[SiteSection['kind'], string, string, string?]>> = {
    agency: [
      ['hero','Ideas into impact.','We build thoughtful digital experiences that help ambitious brands move forward.','Explore our work'],
      ['features','What we do','Strategy, brand identity, web design and digital experiences.'],
      ['gallery','Selected projects','A showcase of recent work, collaborations and creative outcomes.'],
      ['testimonials','Good work. Good people.','Hear from the teams who trusted us with their next big idea.'],
      ['contact','Have a project in mind?','Tell us what you are building and let’s make it happen.','Start a conversation'],
    ],
    business: [
      ['hero','A better way to do business.','Practical expertise, dependable service and solutions built around your goals.','Discover our services'],
      ['features','How we help','Explore the services and capabilities that make your business stronger.'],
      ['testimonials','Trusted by our clients','Real partnerships are built on consistent results and clear communication.'],
      ['contact','Let’s talk business','Get in touch with our team to discuss your needs.','Contact our team'],
    ],
    portfolio: [
      ['hero','Hello, I’m a creative professional.','I turn ideas into meaningful work through design, craft and curiosity.','View selected work'],
      ['gallery','Selected work','A collection of projects, experiments and collaborations.'],
      ['features','A little about me','My approach combines thoughtful problem-solving with attention to detail.'],
      ['contact','Let’s create something','Available for selected projects and collaborations.','Get in touch'],
    ],
    shop: [
      ['hero','Find something you’ll love.','Discover considered pieces, made to bring a little more delight to everyday life.','Shop collection'],
      ['gallery','Shop the collection','Explore featured products and customer favourites.'],
      ['features','Made with care','Thoughtful quality, easy ordering and support whenever you need it.'],
      ['testimonials','Loved by customers','A few words from people who made us part of their everyday.'],
      ['contact','Need a hand?','Our team is here to help with orders and product questions.','Contact support'],
    ],
    restaurant: [
      ['hero','Good food. Good company.','Seasonal flavours, welcoming spaces and memorable moments around the table.','Explore our menu'],
      ['features','A taste of what we do','Fresh ingredients, carefully prepared favourites and something for everyone.'],
      ['gallery','Inside our kitchen','A glimpse of the dishes, people and atmosphere that make us who we are.'],
      ['contact','Come visit us','Find our location, opening hours and reservation information.','Plan your visit'],
    ],
    launch: [
      ['hero','Meet your next favourite thing.','A simple, powerful solution designed to make your day work better.','Get started'],
      ['features','Everything you need','A clear look at the benefits that make this product different.'],
      ['testimonials','Why people choose us','See how customers are getting more from their day.'],
      ['contact','Questions before you begin?','We would love to help you make the right decision.','Talk to us'],
    ],
    education: [
      ['hero','Learning opens new possibilities.','A supportive place to build skills, discover interests and reach your goals.','Explore programs'],
      ['features','Our programs','Discover learning paths, courses and opportunities for every stage.'],
      ['testimonials','Learner stories','Progress is personal. Hear from people growing with our community.'],
      ['contact','Your next chapter starts here','Ask about programs, admissions and how to get involved.','Enquire now'],
    ],
    journal: [
      ['hero','Stories worth your time.','Ideas, perspectives and thoughtful writing from voices worth hearing.','Read the latest'],
      ['gallery','Latest stories','Explore recent features, interviews and editor picks.'],
      ['features','Explore topics','Find the subjects, conversations and categories that interest you.'],
      ['contact','Stay in the loop','Get new stories and updates delivered to your inbox.','Subscribe'],
    ],
    community: [
      ['hero','Better, together.','A welcoming space to connect, share ideas and make meaningful things happen.','Join the community'],
      ['features','What brings us together','Discover our mission, activities and ways to take part.'],
      ['gallery','Community moments','See the events, projects and people bringing our community to life.'],
      ['testimonials','Member voices','Hear why people choose to be part of this community.'],
      ['contact','There’s a place for you','Find out how to join, volunteer or get involved.','Get involved'],
    ],
  }
  const palette: Record<string, string> = {
    agency: '#f3eee5', business: '#edf3f4', portfolio: '#f5eeee', shop: '#f4f0e6',
    restaurant: '#f7eee8', launch: '#f0effb', education: '#edf4ef', journal: '#f3f0e9', community: '#edf2f6',
    realestate: '#f2f0e9', healthcare: '#edf5f2', beauty: '#f8eff2', travel: '#edf4f1', finance: '#edf1f6',
    saas: '#f0f0fb', nonprofit: '#eff4eb', events: '#f8eee8', construction: '#f2f0e9', legal: '#f0f0ed',
  }
  const themes: Record<string, { primary: string; accent: string; background: string; text: string; heading: string; body: string; radius: string }> = {
    agency: { primary:'#24211d', accent:'#b18a51', background:'#f8f5ef', text:'#34312c', heading:'Georgia', body:'Inter', radius:'4px' },
    business: { primary:'#17323a', accent:'#a77d45', background:'#f7f9f8', text:'#273438', heading:'Manrope', body:'Inter', radius:'6px' },
    portfolio: { primary:'#35252d', accent:'#b16d68', background:'#fffafa', text:'#30282b', heading:'Georgia', body:'Inter', radius:'2px' },
    shop: { primary:'#29251e', accent:'#b59a63', background:'#fbf9f3', text:'#373127', heading:'Georgia', body:'Inter', radius:'3px' },
    restaurant: { primary:'#3b251d', accent:'#b97851', background:'#fff9f4', text:'#3c2c24', heading:'Georgia', body:'Inter', radius:'4px' },
    launch: { primary:'#24264d', accent:'#7778bd', background:'#fafaff', text:'#292b42', heading:'Manrope', body:'Inter', radius:'12px' },
    education: { primary:'#234237', accent:'#6c967b', background:'#f8fbf8', text:'#2d3d35', heading:'Manrope', body:'Inter', radius:'8px' },
    journal: { primary:'#332f29', accent:'#a18e6d', background:'#fbfaf6', text:'#38342e', heading:'Georgia', body:'Georgia', radius:'2px' },
    community: { primary:'#293744', accent:'#7193a5', background:'#f8fafc', text:'#303b46', heading:'Manrope', body:'Inter', radius:'8px' },
    realestate: { primary:'#34362f', accent:'#a99b7c', background:'#faf9f5', text:'#383a33', heading:'Georgia', body:'Inter', radius:'3px' },
    healthcare: { primary:'#21413e', accent:'#78a59b', background:'#f7fbf9', text:'#30413e', heading:'Manrope', body:'Inter', radius:'8px' },
    beauty: { primary:'#503640', accent:'#bd8f9a', background:'#fff9fb', text:'#49353d', heading:'Georgia', body:'Inter', radius:'8px' },
    travel: { primary:'#29434a', accent:'#7c9d91', background:'#f7faf8', text:'#304348', heading:'Georgia', body:'Inter', radius:'5px' },
    finance: { primary:'#1d3048', accent:'#8e806d', background:'#f8fafc', text:'#2c3948', heading:'Manrope', body:'Inter', radius:'4px' },
    saas: { primary:'#28294e', accent:'#7779c5', background:'#fafaff', text:'#30314b', heading:'Manrope', body:'Inter', radius:'10px' },
    nonprofit: { primary:'#2b4234', accent:'#89a47c', background:'#f9fbf6', text:'#354237', heading:'Manrope', body:'Inter', radius:'8px' },
    events: { primary:'#482f29', accent:'#bd815e', background:'#fff9f5', text:'#3e302b', heading:'Manrope', body:'Inter', radius:'5px' },
    construction: { primary:'#39362f', accent:'#a58b5f', background:'#faf9f5', text:'#38352f', heading:'Manrope', body:'Inter', radius:'4px' },
    legal: { primary:'#252f3c', accent:'#988a76', background:'#fafaf8', text:'#303844', heading:'Georgia', body:'Inter', radius:'3px' },
  }
  const selectedTheme = themes[baseTemplateId] ?? themes.business
  const accentVariants = ['#b18a51','#6d8f9a','#b16d68','#8a9a6a','#9a82b5','#b17e58','#648c83','#8c789e','#b59a63','#7186a1']
  const primaryVariants = ['#24211d','#243b45','#35252d','#263b30','#302b43','#3d2b24','#243d3b','#342d3b','#29251e','#25344a']
  selectedTheme.accent = accentVariants[(variantNumber - 1) % accentVariants.length]
  selectedTheme.primary = primaryVariants[(variantNumber - 1) % primaryVariants.length]
  site.theme = { primaryColor:selectedTheme.primary, accentColor:selectedTheme.accent, backgroundColor:selectedTheme.background, textColor:selectedTheme.text, headingFont:selectedTheme.heading, bodyFont:selectedTheme.body, buttonRadius:selectedTheme.radius }
  const sections = content[baseTemplateId] ?? content.business
  const header = site.pages[0].sections[0]
  const footer = site.pages[0].sections[site.pages[0].sections.length - 1]
  site.pages[0].sections = [
    { ...header, components: [{ ...component('heading', name.toUpperCase()), id: createId('brand') }] },
    ...sections.map(([kind, title, body, button], index) => makeSection(kind, title, body, button, index % 2 === 0 ? palette[baseTemplateId] ?? '#f3eee5' : '#ffffff')),
    { ...footer, components: [{ ...component('text', '© ' + name + '. All rights reserved.'), id: createId('copyright') }] },
  ]
  site.metadata.description = sections[0][2]
  const pageLabels: Record<string, string[]> = {
    agency:['Home','About','Services','Work','Contact'], business:['Home','About','Services','Contact'], portfolio:['Home','Work','About','Contact'], shop:['Home','Shop','About','Contact'],
    restaurant:['Home','Menu','Our Story','Visit'], launch:['Home','FAQ','Contact'], education:['Home','Programs','Admissions','About','Contact'], journal:['Home','Stories','Topics','About'], community:['Home','About','Events','Join','Contact'],
    realestate:['Home','Properties','About','Contact'], healthcare:['Home','Services','Our Team','Patient Info','Contact'], beauty:['Home','Treatments','About','Gallery','Contact'], travel:['Home','Stay','Experiences','Gallery','Contact'],
    finance:['Home','Solutions','About','Insights','Contact'], saas:['Home','Features','Pricing','Resources','Contact'], nonprofit:['Home','Our Mission','Programs','Impact','Get Involved'],
    events:['Home','Schedule','Speakers','Venue','Register'], construction:['Home','Services','Projects','About','Request a Quote'], legal:['Home','Practice Areas','Our Firm','People','Contact'],
  }
  const labels = category === 'School' ? ['Home','About','Academics','Admissions','Student Life','News','Contact'] : (pageLabels[baseTemplateId] ?? ['Home','About','Services','Contact'])
  const pageDescriptions: Record<string,string> = {
    About: 'Meet the people, purpose and principles behind ' + name + '. Discover our story and what makes our approach different.',
    Services: 'Explore our services, expertise and the practical ways we can help you move forward with confidence.',
    Work: 'A considered selection of projects, ideas and outcomes that demonstrate our craft and attention to detail.',
    Contact: 'Have a question or a project in mind? Share a few details and our team will help you take the next step.',
    Shop: 'Explore the collection, discover featured pieces and find the right fit for your needs.',
    Menu: 'Discover signature favourites, seasonal selections and carefully prepared options from our kitchen.',
    'Our Story': 'A little about our beginnings, our values and the care that goes into everything we do.',
    Visit: 'Find our location, opening hours and the best way to plan your visit.',
    Programs: 'Explore learning paths designed to build confidence, practical skills and lasting progress.',
    Admissions: 'Everything you need to understand the application process and take your next step.',
    Stories: 'Fresh perspectives, thoughtful features and stories selected for curious readers.',
    Topics: 'Browse the subjects and conversations that matter to our readers and community.',
    Events: 'Discover upcoming gatherings, shared experiences and ways to take part.',
    Properties: 'Explore featured properties and discover spaces selected for quality, comfort and potential.',
    'Our Team': 'Get to know the professionals committed to thoughtful, dependable care.',
    Treatments: 'Explore our treatments and services, thoughtfully designed around your needs.',
    Stay: 'Find a place to pause, recharge and enjoy a memorable stay.',
    Experiences: 'Discover local highlights, curated activities and moments worth travelling for.',
    Solutions: 'Practical expertise and clear guidance, shaped around your goals and priorities.',
    Insights: 'Ideas, guidance and useful perspectives to help you make informed decisions.',
    Features: 'A closer look at the tools, workflows and thoughtful details that make the product useful.',
    Pricing: 'Choose the plan that fits your needs, with clear options and room to grow.',
    Resources: 'Helpful guides, answers and resources to help you get more from the platform.',
    'Our Mission': 'The purpose that guides our work and the future we are working together to create.',
    Impact: 'See the progress, stories and meaningful outcomes made possible by people like you.',
    Schedule: 'Plan your experience with a clear overview of sessions, timings and key moments.',
    Speakers: 'Meet the voices, experts and special guests bringing this event to life.',
    Venue: 'Everything you need to find the venue and plan a smooth event-day experience.',
    'Practice Areas': 'Focused legal support across the matters that affect people and businesses.',
    'Our Firm': 'Learn about our principles, experience and commitment to clear professional advice.',
    People: 'Meet the team and learn about the experience behind our practice.',
    'Request a Quote': 'Tell us about your project and receive a clear, considered next step.',
  }
  site.pages = labels.map((label, index) => {
    if (index === 0) return site.pages[0]
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page'
    const pageHeading = label === 'Contact' ? 'Let’s start a conversation.' : label === 'Home' ? 'Welcome to ' + name + '.' : label
    const pageBody = pageDescriptions[label] ?? 'Discover more about ' + name + ', our approach and how we can help you take the next step.'
    const pageSections: SiteSection[] = [
      { id:createId('section'), kind:'header', name:'Navigation', enabled:true, styles:{padding:'22px 7%',backgroundColor:'#ffffff'}, components:[{...component('heading',name.toUpperCase()),id:createId('brand')}] },
      { id:createId('section'), kind:'hero', name:label + ' introduction', enabled:true, styles:{padding:'88px 8%',backgroundColor:palette[baseTemplateId] ?? '#edf3f4'}, components:[{...component('heading',pageHeading),id:createId('heading')},{...component('text',pageBody),id:createId('text')}] },
      { id:createId('section'), kind:'features', name:'More to discover', enabled:true, styles:{padding:'66px 8%',backgroundColor:'#ffffff'}, components:[{...component('heading','Thoughtfully designed around you'),id:createId('heading')},{...component('text','Clear information, considered details and a helpful experience from the first visit to the next step.'),id:createId('text')}] },
      { id:createId('section'), kind:'contact', name:'Next step', enabled:true, styles:{padding:'66px 8%',backgroundColor:selectedTheme.primary}, components:[{...component('heading','Ready to find out more?'),id:createId('heading')},{...component('text','Get in touch with ' + name + ' and let’s make a plan.'),id:createId('text')},{...component('button','Contact us'),id:createId('button')}] },
      { id:createId('section'), kind:'footer', name:'Footer', enabled:true, styles:{padding:'28px 7%',backgroundColor:'#171717'}, components:[{...component('text','© ' + name + '. All rights reserved.'),id:createId('copyright')}] },
    ]
    return { id:createId('page'), name:label, slug, isHomePage:false, sections:pageSections }
  })
  return site
}
