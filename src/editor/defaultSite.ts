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
  const variantNumber = Number(templateId.match(/-v(\d+)$/)?.[1] ?? '1')
  const baseTemplateId = (templateId.includes('--') ? templateId.split('--').pop()! : templateId).replace(/-v\d+$/, '')
  const site = createStarterSite(name, category)
  const templateHeroImages: Record<string, string> = {
    agency: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85',
    business: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=85',
    portfolio: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=85',
    shop: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
    restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
    launch: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=85',
    education: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=85',
    journal: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=85',
    community: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1600&q=85',
    realestate: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
    healthcare: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=85',
    beauty: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1600&q=85',
    travel: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
    finance: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=85',
    saas: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&q=85',
    nonprofit: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1600&q=85',
    events: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=85',
    construction: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=85',
    legal: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=85',
  }
  const categoryHeroImages: Record<string, string> = {
    Business: 'photo-1497366811353-6870744d04b2',
    Portfolio: 'photo-1498050108023-c5249f4df085',
    'E-commerce': 'photo-1441986300917-64674bd600d8',
    'Blog / Magazine': 'photo-1504711434969-e33886168f5c',
    'Landing page': 'photo-1460925895917-afdab8272e',
    Agency: 'photo-1497366754035-f200968a6e72',
    Restaurant: 'photo-1517248135467-4c7edcad34c4',
    Education: 'photo-1509062522246-3755977927d7',
    School: 'photo-1503676260728-1c00da094a0b',
    Community: 'photo-1511632765486-a01980e01a18',
    'Real Estate': 'photo-1600607687939-ce8a6c25118c',
    Healthcare: 'photo-1576091160399-112ba8d25d1d',
    'Beauty & Wellness': 'photo-1560750588-73207b1ef5b8',
    'Hotel & Travel': 'photo-1464822759023-fed622ff2c3b',
    Finance: 'photo-1454165804606-c3d57bc86b40',
    'Technology / SaaS': 'photo-1551434678-e076c223a692',
    'Non-profit': 'photo-1531206715517-5c0ba140b2b8',
    Events: 'photo-1492684223066-81342ee5ff30',
    Construction: 'photo-1503387762-592deb58ef4e',
    Legal: 'photo-1589829545856-d10d557cf95f',
    Automotive: 'photo-1503376780353-7e6692767b70',
    'Fitness & Sports': 'photo-1534438327276-14e5300c3a48',
    Wedding: 'photo-1519741497674-611481863552',
    'Pet Care': 'photo-1552053831-71594a27632d',
    'Music & Entertainment': 'photo-1506157786151-b8491531f063',
    'Personal Services': 'photo-1497366754035-f200968a6e72',
    Photography: 'photo-1452587925148-ce544e77e70d',
    'Fashion & Apparel': 'photo-1483985988355-763728e1935b',
    'Church & Ministry': 'photo-1438032005730-c779502df39b',
    Agriculture: 'photo-1500382017468-9049fed747ef',
    'Logistics & Delivery': 'photo-1586528116311-ad8dd3c8310d',
    'Interior Design': 'photo-1600210492486-724fe5c67fb0',
    Other: 'photo-1497366811353-6870744d04b2',
  }
  const heroImageSource = categoryHeroImages[category] ?? templateHeroImages[baseTemplateId] ?? templateHeroImages.business
  const heroImage = heroImageSource.startsWith('http')
    ? heroImageSource
    : `https://images.unsplash.com/${heroImageSource}?auto=format&fit=crop&w=1600&q=85`
  const categoryGalleryImages: Record<string, string[]> = {
    Business: ['photo-1497366754035-f200968a6e72','photo-1497366811353-6870744d04b2','photo-1497366216548-37526070297c'],
    Portfolio: ['photo-1498050108023-c5249f4df085','photo-1460925895917-afdab8272e','photo-1507238691740-187a5b1d37b8'],
    'E-commerce': ['photo-1490481651871-ab68de25d43d','photo-1542291026-7eec264c27ff','photo-1523275335684-37898b6baf30'],
    'Blog / Magazine': ['photo-1504711434969-e33886168f5c','photo-1495020689067-958852a7765e','photo-1505394033641-40c6ad1178d7'],
    'Landing page': ['photo-1460925895917-afdab8272e','photo-1551434678-e076c223a692','photo-1497366811353-6870744d04b2'],
    Agency: ['photo-1497366754035-f200968a6e72','photo-1497366216548-37526070297c','photo-1497366811353-6870744d04b2'],
    Restaurant: ['photo-1414235077428-338989a2e8c0','photo-1517248135467-4c7edcad34c4','photo-1555396273-367ea4eb4db5'],
    Education: ['photo-1509062522246-3755977927d7','photo-1503676260728-1c00da094a0b','photo-1427504494785-3a9ca7044f45'],
    School: ['photo-1503676260728-1c00da094a0b','photo-1509062522246-3755977927d7','photo-1427504494785-3a9ca7044f45'],
    Community: ['photo-1511632765486-a01980e01a18','photo-1529156069898-49953e39b3ac','photo-1517486808906-6ca8b3f04846'],
    'Real Estate': ['photo-1600607687939-ce8a6c25118c','photo-1600566753086-00f18fb6b3ea','photo-1600047509807-ba8f99d2cdde'],
    Healthcare: ['photo-1576091160399-112ba8d25d1d','photo-1559757175-0eb30cd8c063','photo-1584982751601-97dcc096659c'],
    'Beauty & Wellness': ['photo-1560750588-73207b1ef5b8','photo-1616394584738-fc6e612e71b9','photo-1522335789203-aabd1fc54bc9'],
    'Hotel & Travel': ['photo-1464822759023-fed622ff2c3b','photo-1566073771259-6a8506099945','photo-1510798831971-661eb04b3739'],
    Finance: ['photo-1454165804606-c3d57bc86b40','photo-1460925895917-afdab8272e','photo-1554224155-6726b3ff858f'],
    'Technology / SaaS': ['photo-1551434678-e076c223a692','photo-1519389950473-47ba0277781c','photo-1498050108023-c5249f4df085'],
    'Non-profit': ['photo-1531206715517-5c0ba140b2b8','photo-1469571486292-0ba58a3f068b','photo-1559027615-cd4628902d4a'],
    Events: ['photo-1492684223066-81342ee5ff30','photo-1506157786151-b8491531f063','photo-1511795409834-ef04bbd61622'],
    Construction: ['photo-1503387762-592deb58ef4e','photo-1504307651254-35680f356dfd','photo-1504917595217-d4dc5ebe6122'],
    Legal: ['photo-1589829545856-d10d557cf95f','photo-1450101499163-c8848c66ca85','photo-1505664194779-8beaceb93744'],
    Automotive: ['photo-1503376780353-7e6692767b70','photo-1492144534655-ae79c964c9d7','photo-1503736334956-4c8f8e92946d'],
    'Fitness & Sports': ['photo-1534438327276-14e5300c3a48','photo-1517836357463-d25dfeac3438','photo-1518611012118-696072aa579a'],
    Wedding: ['photo-1519741497674-611481863552','photo-1511285560929-80b456fea0bc','photo-1464366400600-7168b8af9bc3'],
    'Pet Care': ['photo-1552053831-71594a27632d','photo-1517849845537-4d257902454a','photo-1548199973-03cce0bbc9b3'],
    'Music & Entertainment': ['photo-1506157786151-b8491531f063','photo-1501386761578-eac5c94b800a','photo-1470229722913-7c0e2dbbafd3'],
    'Personal Services': ['photo-1497366754035-f200968a6e72','photo-1521737711867-e3b97375f902','photo-1521737604893-d14cc237f11d'],
    Photography: ['photo-1452587925148-ce544e77e70d','photo-1516035069371-29a1b244cc32','photo-1542038784456-1ea8e935640e'],
    'Fashion & Apparel': ['photo-1483985988355-763728e1935b','photo-1490481651871-ab68de25d43d','photo-1483985988355-763728e1935b'],
    'Church & Ministry': ['photo-1438032005730-c779502df39b','photo-1517486808906-6ca8b3f04846','photo-1511632765486-a01980e01a18'],
    Agriculture: ['photo-1500382017468-9049fed747ef','photo-1500595830057-1c4b3f8b4e0f','photo-1464226184884-fa280b87c399'],
    'Logistics & Delivery': ['photo-1586528116311-ad8dd3c8310d','photo-1566576912321-d58ddd7a6088','photo-1580674285054-bed31e145f59'],
    'Interior Design': ['photo-1600210492486-724fe5c67fb0','photo-1600607687939-ce8a6c25118c','photo-1600566753086-00f18fb6b3ea'],
    Other: ['photo-1497366811353-6870744d04b2','photo-1497366754035-f200968a6e72','photo-1497366216548-37526070297c'],
  }
  const galleryImages = categoryGalleryImages[category] ?? [heroImage, 'photo-1497366754035-f200968a6e72', 'photo-1497366811353-6870744d04b2']
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
      ...(kind === 'hero' ? [{
        id: createId('image'),
        kind: 'image' as const,
        content: heroImage,
        visible: true,
        styles: { width: '100%', height: 'min(48vw, 440px)', maxWidth: '1120px', objectFit: 'cover', borderRadius: '18px', margin: '36px auto 0' },
      }] : kind === 'gallery' ? galleryImages.map((imageId) => ({
        id: createId('image'),
        kind: 'image' as const,
        content: `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=900&q=82`,
        visible: true,
        styles: { width: '100%', height: 'clamp(180px, 22vw, 280px)', objectFit: 'cover', borderRadius: '16px', margin: '12px 0', gridColumn: 'span 1' },
      })) : []),
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
    realestate: [
      ['hero','Find a place that feels like yours.','Exceptional homes, considered guidance and a smoother way to make your next move.','Explore properties'],
      ['gallery','Featured properties','Discover distinctive homes and spaces selected for their character, quality and location.'],
      ['features','A better way to find home','Local knowledge, thoughtful advice and support at every step of your property journey.'],
      ['testimonials','Moves made with confidence','Hear from buyers, sellers and property owners we have helped.'],
      ['contact','Your next chapter starts here','Tell us what you are looking for and our property team will help you take the next step.','Speak to an advisor'],
    ],
    healthcare: [
      ['hero','Care that puts you first.','Thoughtful, professional healthcare delivered with compassion, clarity and respect.','Book an appointment'],
      ['features','How we can support you','Explore our care services, specialist support and patient-first approach.'],
      ['gallery','Meet your care team','Get to know the people, spaces and expertise behind your care.'],
      ['testimonials','Trusted care, real experiences','Discover what patients value about the care they receive.'],
      ['contact','We are here to help','Find our clinic, ask a question or request an appointment.','Contact the clinic'],
    ],
    beauty: [
      ['hero','A little time, entirely for you.','Considered treatments, expert hands and a beautiful space to reset and feel your best.','Explore treatments'],
      ['features','The studio experience','Discover signature treatments, thoughtful details and care tailored to you.'],
      ['gallery','The details make the difference','Explore the studio, treatment moments and our latest work.'],
      ['testimonials','Kind words from our guests','A few notes from clients who make time for themselves with us.'],
      ['contact','Your moment starts here','Choose your treatment and get in touch to arrange your visit.','Book your experience'],
    ],
    travel: [
      ['hero','Go somewhere unforgettable.','Beautiful places, thoughtful stays and local experiences worth travelling for.','Discover your stay'],
      ['gallery','Places to fall in love with','Explore our handpicked destinations, rooms and memorable escapes.'],
      ['features','Travel, thoughtfully arranged','From the first idea to the final detail, enjoy a smoother way to explore.'],
      ['testimonials','Stories from the journey','Read about the moments guests remember long after they return.'],
      ['contact','Let’s plan your escape','Tell us what inspires you and we will help shape your next journey.','Plan a trip'],
    ],
    finance: [
      ['hero','Make your next move with clarity.','Independent thinking, practical financial guidance and a plan shaped around what matters to you.','Arrange a consultation'],
      ['features','Advice built around your goals','Explore our approach to planning, protection and long-term financial confidence.'],
      ['gallery','Expertise you can understand','Clear insights and practical guidance for the decisions ahead.'],
      ['testimonials','Relationships built on trust','Learn how thoughtful advice helps clients move forward with confidence.'],
      ['contact','Let’s talk about your plans','Start a confidential conversation with our advisory team.','Speak with an advisor'],
    ],
    saas: [
      ['hero','Less busywork. More brilliant work.','One connected platform to help your team move faster, stay aligned and do its best work.','Start your free trial'],
      ['features','Everything your team needs','Bring your workflows, collaboration and insights together in one clear workspace.'],
      ['gallery','A clearer way to work','See how simple workflows turn complex work into meaningful progress.'],
      ['pricing','Plans that grow with you','Choose a plan for the way your team works today, with room to scale tomorrow.'],
      ['contact','Ready to see it in action?','Talk with our team and discover what a more focused workflow could look like.','Book a demo'],
    ],
    nonprofit: [
      ['hero','Together, we can make change happen.','We bring people, resources and ideas together to create a more hopeful future.','Be part of the change'],
      ['features','Where your support goes','Discover the programmes, people and practical work making a difference.'],
      ['gallery','Stories of impact','Meet the communities and individuals at the heart of our mission.'],
      ['testimonials','Every contribution matters','Hear from volunteers, partners and the people behind the progress.'],
      ['contact','There is a place for you here','Give your time, share your skills or support the work in a way that matters to you.','Get involved'],
    ],
    events: [
      ['hero','An experience worth showing up for.','Bring your people together for ideas, inspiration and moments that stay with you.','Reserve your place'],
      ['features','What to expect','Explore the programme, highlights and experiences waiting for you.'],
      ['gallery','Meet the voices and moments','Discover the speakers, performers and stories shaping this event.'],
      ['testimonials','Made memorable together','A look back at the energy, ideas and connections from our community.'],
      ['contact','Make plans to be there','Find the details you need and secure your place.','Register now'],
    ],
    construction: [
      ['hero','Built with care. Made to last.','Reliable construction, considered craftsmanship and a team that takes pride in every detail.','Discuss your project'],
      ['gallery','Work that speaks for itself','Explore completed projects, specialist capabilities and the quality behind every finish.'],
      ['features','From first plan to final handover','A clear process, experienced people and dependable delivery at every stage.'],
      ['testimonials','Confidence from the ground up','Hear from clients who trusted our team with their projects.'],
      ['contact','Tell us what you are building','Share your plans and arrange a conversation with our project team.','Request a quote'],
    ],
    legal: [
      ['hero','Clear advice. Strong representation.','Experienced legal guidance delivered with discretion, diligence and a focus on your interests.','Arrange a consultation'],
      ['features','How we can assist','Explore our practice areas and the considered support we provide to clients.'],
      ['gallery','Experience you can rely on','Meet the people, principles and professional standards behind our work.'],
      ['testimonials','Trusted through important decisions','Discover why clients value clarity, care and dependable representation.'],
      ['contact','Speak with our legal team','Share a brief outline of your matter and arrange a confidential discussion.','Contact the firm'],
    ],
  }
  const categoryContent: Record<string, Array<[SiteSection['kind'], string, string, string?]>> = {
    Automotive:[['hero','Find your next drive.','Explore carefully selected vehicles, expert guidance and a smoother way to get on the road.','Browse vehicles'],['gallery','Featured vehicles','Discover standout models, new arrivals and vehicles selected for quality.'],['features','A better way to buy and care for your car','Get clear information, helpful advice and support from first enquiry to aftercare.'],['testimonials','Drivers who trust us','Hear from customers who found the right vehicle and support with our team.'],['contact','Ready for your next drive?','Tell us what you are looking for and arrange a viewing or test drive.','Book a test drive']],
    'Fitness & Sports':[['hero','Make your next move count.','Build strength, confidence and consistency with coaching and programmes that meet you where you are.','Explore membership'],['features','Training for every goal','Discover coaching, classes and facilities designed to help you keep progressing.'],['gallery','Inside the community','Meet the coaches, explore the space and see the energy behind every session.'],['testimonials','Real people. Real progress.','Read stories from members who are building healthier habits and stronger performance.'],['contact','Start moving forward','Find the right membership or programme and take your first step.','Join us']],
    Wedding:[['hero','Your story. Beautifully celebrated.','Thoughtful details, meaningful moments and a celebration that feels unmistakably yours.','Explore our work'],['gallery','Celebrations to remember','Explore beautiful settings, thoughtful details and moments from recent celebrations.'],['features','A thoughtful planning experience','From the first conversation to the final detail, we make the process feel clear and personal.'],['testimonials','Kind words from couples','Hear from couples who trusted us with a day that mattered.'],['contact','Let’s make your day unforgettable','Share your date, ideas and plans to start a conversation.','Enquire about your date']],
    'Pet Care':[['hero','Care for every kind of companion.','Helpful, dependable care for the pets who make your house a home.','Explore our services'],['features','Care shaped around your pet','Discover our services, experienced team and the thoughtful details that keep pets happy.'],['gallery','Happy pets, happy people','Meet some of the pets in our care and see what makes our community special.'],['testimonials','Loved by pets and their people','Read kind words from the owners who trust us with their companions.'],['contact','We would love to meet your pet','Tell us what you need and we will help you find the right care.','Get in touch']],
    'Music & Entertainment':[['hero','Make some noise. Make a moment.','Discover the talent, experiences and creative energy bringing people together.','Explore what’s on'],['gallery','On stage and behind the scenes','Explore performances, productions and creative work from our world.'],['features','Creative experiences, professionally delivered','From artist bookings to production support, discover what we can create together.'],['testimonials','The audience says it best','Hear from collaborators, audiences and partners.'],['contact','Let’s create something unforgettable','Tell us about your event, project or collaboration.','Make an enquiry']],
    'Personal Services':[['hero','Good service makes life easier.','Practical help, dependable expertise and a personal approach you can count on.','Explore our services'],['features','How we can help','Find the right service, understand what is included and see how we make the process simple.'],['gallery','A closer look at our work','Explore examples, service details and the people behind the work.'],['testimonials','Trusted by our customers','Read how our team helps people get important things done.'],['contact','Tell us what you need','Share a few details and we will help you take the next step.','Request a quote']],
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
  const categoryThemes: Record<string, { primary: string; accent: string; background: string; text: string; heading: string; body: string; radius: string }> = {
    Photography: { primary:'#272b32', accent:'#b58c65', background:'#faf9f6', text:'#383a40', heading:'Georgia', body:'Inter', radius:'2px' },
    'Fashion & Apparel': { primary:'#30272a', accent:'#bd8f8a', background:'#fcf9f8', text:'#403638', heading:'Georgia', body:'Inter', radius:'3px' },
    'Church & Ministry': { primary:'#293b48', accent:'#b49a68', background:'#f8fafb', text:'#35424a', heading:'Manrope', body:'Inter', radius:'8px' },
    Agriculture: { primary:'#344333', accent:'#a6a36b', background:'#f8faf4', text:'#3d4939', heading:'Georgia', body:'Inter', radius:'6px' },
    'Logistics & Delivery': { primary:'#253849', accent:'#d09a4a', background:'#f7f9fb', text:'#34424e', heading:'Manrope', body:'Inter', radius:'5px' },
    'Interior Design': { primary:'#37332e', accent:'#a78f75', background:'#faf9f6', text:'#403b35', heading:'Georgia', body:'Inter', radius:'2px' },
    Automotive: { primary:'#202b35', accent:'#c18a45', background:'#f7f8f9', text:'#303943', heading:'Manrope', body:'Inter', radius:'5px' },
    'Fitness & Sports': { primary:'#172f2a', accent:'#a4bd62', background:'#f7faf6', text:'#2d3c36', heading:'Manrope', body:'Inter', radius:'12px' },
    Wedding: { primary:'#493b3a', accent:'#b88e83', background:'#fcf8f5', text:'#514541', heading:'Georgia', body:'Inter', radius:'3px' },
    'Pet Care': { primary:'#35443a', accent:'#d19b64', background:'#fbfaf5', text:'#3e4940', heading:'Manrope', body:'Inter', radius:'12px' },
    'Music & Entertainment': { primary:'#28243b', accent:'#c17a52', background:'#faf8f7', text:'#383443', heading:'Manrope', body:'Inter', radius:'5px' },
    'Personal Services': { primary:'#293b49', accent:'#b18a51', background:'#f8fafb', text:'#34414a', heading:'Manrope', body:'Inter', radius:'6px' },
  }
  const selectedTheme = { ...(categoryThemes[category] ?? themes[baseTemplateId] ?? themes.business) }
  const accentVariants = ['#b18a51','#6d8f9a','#b16d68','#8a9a6a','#9a82b5','#b17e58','#648c83','#8c789e','#b59a63','#7186a1']
  const primaryVariants = ['#24211d','#243b45','#35252d','#263b30','#302b43','#3d2b24','#243d3b','#342d3b','#29251e','#25344a']
  selectedTheme.accent = accentVariants[(variantNumber - 1) % accentVariants.length]
  selectedTheme.primary = primaryVariants[(variantNumber - 1) % primaryVariants.length]
  const headingFonts = ['Georgia', 'Manrope', 'Inter', 'Playfair Display', 'Arial', 'Georgia', 'Manrope', 'Inter', 'DM Sans', 'Georgia']
  const bodyFonts = ['Inter', 'Arial', 'Manrope', 'Inter', 'DM Sans', 'Lato', 'Inter', 'Arial', 'Manrope', 'Inter']
  const radiusVariants = ['4px', '12px', '0px', '18px', '8px', '2px', '24px', '6px', '14px', '999px']
  selectedTheme.heading = headingFonts[(variantNumber - 1) % headingFonts.length]
  selectedTheme.body = bodyFonts[(variantNumber - 1) % bodyFonts.length]
  selectedTheme.radius = radiusVariants[(variantNumber - 1) % radiusVariants.length]
  site.theme = { primaryColor:selectedTheme.primary, accentColor:selectedTheme.accent, backgroundColor:selectedTheme.background, textColor:selectedTheme.text, headingFont:selectedTheme.heading, bodyFont:selectedTheme.body, buttonRadius:selectedTheme.radius }
  const sections: Array<[SiteSection['kind'], string, string, string?]> = [...(categoryContent[category] ?? content[baseTemplateId] ?? content.business)]

  const businessBlueprints: Array<Array<[SiteSection['kind'], string, string, string?]>> = [
    [
      ['hero','Business, built around what matters.','We help ambitious organisations make confident decisions, deliver better work and create lasting value.','Explore our capabilities'],
      ['features','A clear path from ambition to results','Practical expertise across strategy, operations and customer experience.'],
      ['gallery','Where we make a difference','A closer look at the people, spaces and work behind meaningful business progress.'],
      ['testimonials','Partnership you can measure','Trusted relationships are built through thoughtful advice, consistent delivery and results.'],
      ['contact','Let’s move your business forward','Tell us where you want to go. We will help you map the next step.','Book a consultation'],
    ],
    [
      ['hero','Clarity for your next big move.','Independent thinking and practical consulting for leaders navigating change, growth and opportunity.','Talk to a consultant'],
      ['gallery','Our consulting approach','Discover how we listen, analyse, plan and work alongside your team.'],
      ['features','Strategy that becomes action','From business reviews to implementation, we turn complex challenges into clear priorities.'],
      ['testimonials','Good advice. Better outcomes.','Our clients value clear communication, honest insight and work that moves things forward.'],
      ['contact','Bring us your biggest challenge','Start with a conversation about what success should look like.','Arrange a discovery call'],
    ],
    [
      ['hero','Make your next chapter your strongest.','A modern business partner for founders and teams ready to scale with focus and confidence.','See how we help'],
      ['features','Built for momentum','Flexible support across growth planning, systems, partnerships and customer experience.'],
      ['custom','A simple plan. Meaningful progress.','01 — Understand the opportunity. 02 — Set the priorities. 03 — Put the plan into motion.'],
      ['contact','Ready to build what comes next?','Share your goals and let’s shape a practical plan for growth.','Start a conversation'],
    ],
    [
      ['hero','Expertise that earns your confidence.','Professional services delivered with care, precision and a clear understanding of your priorities.','Meet our team'],
      ['features','Specialist support. Personal attention.','Get the right expertise, clear advice and a responsive team from first conversation to completion.'],
      ['testimonials','A relationship built on trust','We believe the best work starts with listening and continues with dependable service.'],
      ['pricing','Choose the support that fits','Flexible engagement options shaped around your priorities, team and timeline.','Discuss an engagement'],
      ['contact','Let’s understand your needs','Speak with our team about the support that will make a difference.','Request an introduction'],
    ],
    [
      ['hero','Stronger operations. Smarter outcomes.','Reliable business solutions for organisations that need quality, consistency and room to grow.','Explore our solutions'],
      ['gallery','Quality in every detail','See the standards, projects and practical expertise behind the way we work.'],
      ['custom','How delivery works','Discover a clear, accountable process from the first conversation through delivery and ongoing support.'],
      ['contact','Let’s discuss your requirements','Tell us what you need and we will prepare a considered next step.','Request a business quote'],
    ],
    [
      ['hero','A better experience for every customer.','Thoughtful products, helpful people and straightforward service from a business that cares about the details.','Discover our services'],
      ['features','Simple to work with. Easy to trust.','Clear options, responsive support and dependable service at every stage.'],
      ['testimonials','Our customers say it best','Real feedback from people and teams who choose to work with us.'],
      ['gallery','Made for the way you work','Explore our services, customer experience and the details that set us apart.'],
      ['contact','How can we help today?','Tell us what you are looking for and our team will point you in the right direction.','Get in touch'],
    ],
    [
      ['hero','Technology that makes work flow.','Connected business tools and expert support that help teams work smarter and serve customers better.','Explore the platform'],
      ['features','One connected way to work','Bring your processes, people and information together with solutions designed around your business.'],
      ['pricing','A solution that fits your business','Start with what you need today and build on a foundation that can grow with you.','Compare options'],
      ['contact','Let’s find the right fit','Talk with our team about your goals, workflows and next steps.','Book a product walkthrough'],
    ],
    [
      ['hero','A more considered way to lead.','Strategic insight, trusted guidance and a discreet partnership for leaders making important decisions.','Meet our advisors'],
      ['custom','Perspective for complex decisions','We bring commercial understanding, thoughtful analysis and practical recommendations to the table.'],
      ['testimonials','Trusted at the moments that matter','Long-term relationships built on discretion, integrity and clear advice.'],
      ['contact','Start a confidential conversation','Tell us what is on your mind and arrange a private discussion.','Speak with an advisor'],
    ],
    [
      ['hero','Move business forward. Without the friction.','Practical services and connected support that help your organisation stay responsive, efficient and ready for what is next.','Explore our services'],
      ['features','The details that keep business moving','Dependable processes, clear communication and a team focused on getting things done well.'],
      ['gallery','A closer look at our capabilities','Discover the services, people and operating standards that support our clients.'],
      ['testimonials','Built on consistency','Our clients value the confidence that comes from knowing the work is in good hands.'],
      ['contact','Let’s make work easier','Share your requirements and we will help you find the right solution.','Request a proposal'],
    ],
    [
      ['hero','Good business starts with a better connection.','A fresh, people-first company experience built around useful solutions, lasting relationships and meaningful service.','Let’s work together'],
      ['gallery','Discover the difference','Explore our story, services and the people who bring our promise to life.'],
      ['features','What makes us different','A clear offer, a helpful team and a commitment to doing the right thing for every customer.'],
      ['contact','We would love to hear from you','Tell us a little about what you need and we will be in touch.','Contact our team'],
    ],
  ]
  // Each Business option gets its own page rhythm and footer composition.
  // The profiles deliberately mix section order, hero treatment and footer density.
  const businessLayoutProfiles = [
    { order:[0,1,2,3,4], hero:'split', footer:'four-column' },
    { order:[0,1,3,2,4], hero:'centered', footer:'editorial' },
    { order:[0,2,1,4,3], hero:'bold', footer:'compact' },
    { order:[0,2,1,3,4], hero:'editorial', footer:'split' },
    { order:[0,1,2,4,3], hero:'minimal', footer:'four-column' },
    { order:[0,3,1,2,4], hero:'centered', footer:'statement' },
    { order:[0,1,2,3,4], hero:'bold', footer:'compact' },
    { order:[0,2,3,1,4], hero:'editorial', footer:'editorial' },
    { order:[0,1,3,2,4], hero:'split', footer:'statement' },
    { order:[0,2,1,3,4], hero:'minimal', footer:'split' },
  ]
  const businessProfile = category === 'Business' ? businessLayoutProfiles[(variantNumber - 1) % businessLayoutProfiles.length] : undefined
  if (category === 'Business') sections.splice(0, sections.length, ...businessBlueprints[(variantNumber - 1) % businessBlueprints.length])

  if (!sections.some(([kind]) => kind === 'gallery')) {
    sections.splice(1, 0, ['gallery', category === 'E-commerce' ? 'Featured products' : category === 'School' || category === 'Education' ? 'Life on campus' : 'Explore what we do', 'A visual look at our work, people, products and the details that make this brand special.'])
  }
  const header = site.pages[0].sections[0]
  const footer = site.pages[0].sections[site.pages[0].sections.length - 1]
  const layoutVariant = (variantNumber - 1) % 10
  const sectionOrders = [
    [0,1,2,3,4], [0,2,1,3,4], [0,3,1,2,4], [0,1,3,2,4], [0,2,3,1,4],
    [0,3,2,1,4], [0,1,2,4,3], [0,2,4,1,3], [0,3,1,4,2], [0,4,1,2,3],
  ]
  const orderedSections = (businessProfile?.order ?? sectionOrders[layoutVariant]).map(index => sections[index]).filter(Boolean)
  const variantSections = orderedSections.length >= 3 ? orderedSections : sections
  const heroTone = businessProfile?.hero === 'bold' || layoutVariant % 3 === 0 ? selectedTheme.primary : palette[baseTemplateId] ?? '#f3eee5'
  const heroAlign = businessProfile?.hero === 'centered' || businessProfile?.hero === 'bold' || businessProfile?.hero === 'editorial' || businessProfile?.hero === 'minimal' || layoutVariant === 1 || layoutVariant === 4 || layoutVariant === 7 ? 'center' : 'left'
  const businessHeaderProfiles = [
    { layout:'flex', padding:'24px 7%', background:'#ffffff', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #e8e5df', brandSize:'1rem', brandAlign:'left', tagline:'', action:'Contact' },
    { layout:'grid', padding:'28px 8% 18px', background:'#f4f0e8', alignItems:'center', justifyContent:'center', borderBottom:'0', brandSize:'1.45rem', brandAlign:'center', tagline:'INDEPENDENT THINKING · PRACTICAL RESULTS', action:'' },
    { layout:'flex', padding:'18px 7%', background:'#17252b', alignItems:'center', justifyContent:'space-between', borderBottom:'0', brandSize:'1.05rem', brandAlign:'left', tagline:'', action:'Book a call' },
    { layout:'grid', padding:'30px 9%', background:'#ffffff', alignItems:'start', justifyContent:'space-between', borderBottom:'3px solid #c8a66a', brandSize:'1.65rem', brandAlign:'left', tagline:'BUSINESS ADVISORY & PROFESSIONAL SERVICES', action:'Get in touch' },
    { layout:'flex', padding:'34px 10%', background:'#f7f7f4', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #deded8', brandSize:'1.8rem', brandAlign:'left', tagline:'', action:'' },
    { layout:'flex', padding:'20px 6%', background:'#242b36', alignItems:'center', justifyContent:'space-between', borderBottom:'0', brandSize:'1rem', brandAlign:'left', tagline:'', action:'Client support' },
    { layout:'grid', padding:'24px 7%', background:'#111827', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #344054', brandSize:'1.15rem', brandAlign:'left', tagline:'BUSINESS TECHNOLOGY', action:'Book a demo' },
    { layout:'flex', padding:'38px 10%', background:'#f2eee7', alignItems:'center', justifyContent:'space-between', borderBottom:'0', brandSize:'1.7rem', brandAlign:'left', tagline:'A PRIVATE ADVISORY PARTNERSHIP', action:'Private enquiries' },
    { layout:'grid', padding:'18px 7%', background:'#263b30', alignItems:'center', justifyContent:'space-between', borderBottom:'0', brandSize:'1.1rem', brandAlign:'left', tagline:'', action:'Request a proposal' },
    { layout:'flex', padding:'30px 8%', background:'#ffffff', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #e8e5df', brandSize:'1.5rem', brandAlign:'left', tagline:'GOOD PEOPLE. GOOD BUSINESS.', action:'Say hello' },
  ]
  const headerProfile = category === 'Business' ? businessHeaderProfiles[(variantNumber - 1) % businessHeaderProfiles.length] : undefined
  const brandComponent = { ...component('heading', name.toUpperCase()), id:createId('brand'), styles:{ ...component('heading', name.toUpperCase()).styles, fontSize:headerProfile?.brandSize ?? '1rem', letterSpacing:'0.12em', fontWeight:'800', color:category === 'Business' && [2,5,6,8].includes(layoutVariant) ? '#ffffff' : selectedTheme.primary, margin:'0', textAlign:headerProfile?.brandAlign ?? 'left' } }
  const headerComponents = [brandComponent]
  if (headerProfile?.tagline) headerComponents.push({ ...component('text', headerProfile.tagline), id:createId('header-tagline'), styles:{ fontSize:'0.62rem', fontWeight:'800', letterSpacing:'0.16em', color:[2,5,6,8].includes(layoutVariant) ? '#d7dce2' : selectedTheme.accent, maxWidth:'none', margin:'8px 0 0', textAlign:headerProfile.brandAlign } } as typeof brandComponent)
  if (headerProfile?.action) headerComponents.push({ ...component('button', headerProfile.action), id:createId('header-action'), styles:{ backgroundColor:selectedTheme.accent, color:'#171717', padding:'11px 18px', borderRadius:selectedTheme.radius, fontSize:'0.82rem', fontWeight:'700', margin:'0 0 0 auto' } } as typeof brandComponent)
  site.pages[0].sections = [
    { ...header, components: category === 'Business' ? headerComponents : [brandComponent], styles: { ...header.styles, display:headerProfile?.layout ?? 'flex', gridTemplateColumns:headerProfile?.layout === 'grid' ? '1fr auto' : undefined, alignItems:headerProfile?.alignItems ?? 'center', justifyContent:headerProfile?.justifyContent ?? 'space-between', flexWrap:'wrap', gap:'14px 28px', padding:headerProfile?.padding ?? (layoutVariant === 8 ? '34px 9%' : '22px 7%'), backgroundColor:headerProfile?.background ?? selectedTheme.background, borderBottom:headerProfile?.borderBottom ?? '1px solid #e8e5df', color:[2,5,6,8].includes(layoutVariant) && category === 'Business' ? '#ffffff' : selectedTheme.primary } },
    ...variantSections.map(([kind, title, body, button], index) => {
      const isHero = kind === 'hero'
      const tone = isHero ? heroTone : index % 2 === 0 ? palette[baseTemplateId] ?? '#f3eee5' : '#ffffff'
      const block = makeSection(kind, title, body, button, tone)
      const isDark = isHero && layoutVariant % 3 === 0
      const textColor = isDark ? '#ffffff' : selectedTheme.text
      return {
        ...block,
        styles: {
          ...block.styles,
          padding: isHero ? (businessProfile?.hero === 'bold' ? '184px 10%' : businessProfile?.hero === 'editorial' ? '116px 15%' : businessProfile?.hero === 'minimal' ? '190px 14% 150px' : layoutVariant === 8 ? '164px 10%' : '144px 8%') : layoutVariant === 9 ? '92px 9%' : '84px 8%',
          textAlign: (isHero ? heroAlign : 'left') as 'left' | 'center',
          ...(isHero && category === 'Business' ? {
            backgroundColor: businessProfile?.hero === 'bold' ? selectedTheme.primary : businessProfile?.hero === 'editorial' ? '#f4f0e8' : businessProfile?.hero === 'minimal' ? '#ffffff' : tone,
            borderRadius: businessProfile?.hero === 'bold' || businessProfile?.hero === 'minimal' ? '0' : businessProfile?.hero === 'editorial' ? '0 0 84px 0' : layoutVariant % 2 === 0 ? '0' : '22px',
            minHeight: businessProfile?.hero === 'bold' ? '540px' : businessProfile?.hero === 'editorial' ? '390px' : businessProfile?.hero === 'minimal' ? '500px' : '440px',
            boxShadow: businessProfile?.hero === 'bold' ? 'inset 0 -1px 0 rgba(255,255,255,.16)' : 'none',
          } : {}),
          layout: kind === 'gallery' || (kind === 'features' && (category === 'Business' || layoutVariant % 2 === 0)) ? 'grid' : 'stacked',
          gridColumns: kind === 'gallery' ? '3' : kind === 'features' && (category === 'Business' || layoutVariant % 2 === 0) ? (layoutVariant === 6 ? '4' : '3') : '2',
          borderTop: !isHero && index % 2 === 0 ? '1px solid #e9e4dc' : 'none',
          ...(category === 'Business' ? {
            ...(isHero && (businessProfile?.hero === 'split' || [0,3,5,7].includes(layoutVariant)) ? { display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', alignItems:'center', columnGap:'clamp(28px,5vw,76px)' } : {}),
            ...(kind === 'gallery' ? { gridColumns: layoutVariant % 2 === 0 ? '3' : '2', gap:'22px' } : {}),
            ...(kind === 'features' ? { gridColumns: layoutVariant % 3 === 0 ? '2' : '3', gap:'20px' } : {}),
            ...(kind === 'testimonials' || kind === 'pricing' ? { layout:'grid', gridColumns: layoutVariant % 2 === 0 ? '2' : '3', gap:'18px' } : {}),
            ...(kind === 'custom' ? { backgroundColor: layoutVariant % 2 === 0 ? '#f1f4f5' : '#f7f2e9', borderRadius: layoutVariant % 3 === 0 ? '24px' : '0px', margin:'24px 5%' } : {}),
          } : {}),
        },
        components: [
          ...block.components.map(item => ({
            ...item,
            styles: {
              ...item.styles,
              color: item.kind === 'button' ? '#ffffff' : item.kind === 'heading' || item.kind === 'text' ? textColor : item.styles.color,
              fontFamily: item.kind === 'heading' ? selectedTheme.heading : selectedTheme.body,
              fontSize: item.kind === 'heading' ? (isHero ? (layoutVariant === 5 ? 'clamp(2.8rem, 7vw, 6rem)' : 'clamp(2.6rem, 6vw, 5.2rem)') : 'clamp(1.7rem, 3vw, 2.6rem)') : item.kind === 'text' ? '1.05rem' : item.styles.fontSize,
              fontWeight: item.kind === 'heading' ? '750' : item.styles.fontWeight,
              lineHeight: item.kind === 'heading' ? '1.08' : item.kind === 'text' ? '1.75' : item.styles.lineHeight,
              maxWidth: item.kind === 'heading' ? '900px' : '680px',
              backgroundColor: item.kind === 'button' ? selectedTheme.accent : item.styles.backgroundColor,
              borderRadius: item.kind === 'button' ? selectedTheme.radius : item.styles.borderRadius,
              padding: item.kind === 'button' ? '15px 28px' : item.styles.padding,
              letterSpacing: item.kind === 'heading' && layoutVariant === 6 ? '-0.04em' : item.styles.letterSpacing,
              ...(category === 'Business' && item.kind === 'image' && isHero ? {
                width: [0,3,5,7].includes(layoutVariant) ? '100%' : '100%',
                height: [0,3,5,7].includes(layoutVariant) ? 'clamp(300px, 38vw, 500px)' : 'clamp(240px, 34vw, 430px)',
                maxWidth: [0,3,5,7].includes(layoutVariant) ? '620px' : '1120px',
                borderRadius: layoutVariant % 2 === 0 ? '18px' : '8px',
                boxShadow: '0 24px 65px rgba(20,32,38,.18)',
                ...((businessProfile?.hero === 'split' || [0,3,5,7].includes(layoutVariant)) ? { gridColumn:'2', gridRow:'1 / span 3', alignSelf:'center' } : {}),
              } : {}),
              ...(category === 'Business' && isHero && item.kind !== 'image' ? { gridColumn:'1' } : {}),
            },
          })),
          ...(category === 'Business' && kind === 'features' ? [
            ...([
              [
                ['Strategy & planning','Make informed decisions with a practical plan shaped around your goals.'],
                ['Expert delivery','Work with experienced people who take ownership from start to finish.'],
                ['Clear communication','Know what is happening, what comes next and how progress is measured.'],
              ],
              [
                ['Business review','Understand the challenge with structured analysis and honest insight.'],
                ['Growth strategy','Prioritise the opportunities with the strongest commercial potential.'],
                ['Implementation','Turn recommendations into action with hands-on support.'],
              ],
              [
                ['Growth planning','Set priorities and milestones that support sustainable expansion.'],
                ['Better systems','Create repeatable processes that give your team room to focus.'],
                ['Customer experience','Build stronger relationships at every stage of the journey.'],
              ],
              [
                ['Specialist expertise','Access experienced professionals who understand your sector.'],
                ['Personal attention','Get considered advice shaped around your specific requirements.'],
                ['Reliable outcomes','Move forward with clear ownership and careful follow-through.'],
              ],
              [
                ['Operational capability','Bring the right people, equipment and processes together.'],
                ['Quality assurance','Keep standards visible through careful checks and accountability.'],
                ['Ongoing support','Maintain momentum with responsive service after delivery.'],
              ],
              [
                ['Helpful advice','Get clear answers and practical guidance from the first conversation.'],
                ['Straightforward service','Understand your options, costs and next steps without confusion.'],
                ['Customer care','Work with a responsive team that values your time.'],
              ],
              [
                ['Connected workflows','Reduce repetitive work and keep important information in reach.'],
                ['Useful insights','Turn business information into clearer everyday decisions.'],
                ['Flexible foundations','Choose an approach that can adapt as your team grows.'],
              ],
              [
                ['Commercial perspective','See the wider picture before making important decisions.'],
                ['Independent insight','Challenge assumptions and uncover new possibilities.'],
                ['Trusted partnership','Work with an advisor who values discretion and integrity.'],
              ],
              [
                ['Responsive operations','Keep work moving with clear processes and practical support.'],
                ['Accountable delivery','Know who owns each task and what happens next.'],
                ['Consistent standards','Deliver dependable quality across every customer touchpoint.'],
              ],
              [
                ['People first','Build a business experience that respects customers and teams.'],
                ['Useful solutions','Focus on what makes a real difference to everyday work.'],
                ['Lasting relationships','Earn trust through care, quality and follow-through.'],
              ],
            ][(variantNumber - 1) % 10]).map(([title, description]) => ({
              ...component('text', title + ' — ' + description),
              id: createId('business-feature'),
              styles: { color: selectedTheme.primary, backgroundColor: '#ffffff', border: '1px solid #e5e9e7', borderRadius: '14px', padding: '24px', minHeight: '142px', fontSize: '0.98rem', lineHeight: '1.7', boxShadow: '0 12px 32px rgba(20,32,38,.06)' },
            })),
          ] : []),
          ...(category === 'Business' && kind === 'testimonials' ? [
            ...[
              '“The team brought clarity to a complex project and made every next step feel manageable.”',
              '“Responsive, thoughtful and consistently professional. We always knew where things stood.”',
            ].map(quote => ({
              ...component('text', quote),
              id: createId('business-quote'),
              styles: { color: selectedTheme.primary, backgroundColor: '#ffffff', borderLeft: '3px solid ' + selectedTheme.accent, borderRadius: '10px', padding: '22px', minHeight: '105px', fontSize: '1rem', lineHeight: '1.75', boxShadow: '0 12px 32px rgba(20,32,38,.06)', gridColumn: 'span 1' },
            })),
          ] : []),
        ],
      }
    }),
    {
      ...footer,
      components: category === 'Business' ? (() => {
        const makeFooterHeading = (copy:string, size='1.5rem') => ({ ...component('heading',copy), id:createId('footer-heading'), styles:{color:'#ffffff',fontSize:size,fontWeight:'750',lineHeight:'1.12',maxWidth:'720px',margin:'0 0 16px'} })
        const makeFooterText = (copy:string, width='300px') => ({ ...component('text',copy), id:createId('footer-copy'), styles:{color:'#e1e5e8',fontSize:'0.88rem',lineHeight:'1.9',maxWidth:width,margin:'0'} })
        const makeFooterButton = (copy:string) => ({ ...component('button',copy), id:createId('footer-action'), styles:{backgroundColor:selectedTheme.accent,color:'#171717',padding:'14px 22px',borderRadius:selectedTheme.radius,fontWeight:'750',margin:'12px 0'} })
        const footerVariants = [
          { layout:'grid', columns:'4', align:'left', padding:'68px 7% 28px', bg:'#18252d', items:[makeFooterHeading('A better way to do business.'),makeFooterText('COMPANY  ·  About · Our approach · Careers'),makeFooterText('SERVICES  ·  Strategy · Operations · Advisory'),makeFooterText('CONNECT  ·  Contact · LinkedIn · Instagram'),makeFooterText('© '+name+' · All rights reserved.','100%')] },
          { layout:'stacked', columns:'1', align:'center', padding:'110px 12% 42px', bg:'#24211d', items:[makeFooterText('THE NEXT CHAPTER STARTS HERE','100%'),makeFooterHeading('Have a good challenge? Let’s talk.', 'clamp(2rem,5vw,4.4rem)'),makeFooterButton('Arrange a conversation'),makeFooterText('© '+name+' · Thoughtful work. Lasting value.','100%')] },
          { layout:'grid', columns:'3', align:'left', padding:'54px 8% 30px', bg:'#263b45', items:[makeFooterHeading('Built for what comes next.'),makeFooterText('EXPLORE  ·  Our services · How it works · Case studies'),makeFooterText('RESOURCES  ·  Guides · Insights · FAQs'),makeFooterText('hello@yourcompany.com  ·  +234 800 000 0000','100%'),makeFooterText('© '+name+' · All rights reserved.','100%')] },
          { layout:'flex', columns:'2', align:'center', padding:'88px 10% 34px', bg:'#35252d', items:[makeFooterHeading('Trusted expertise. Thoughtful delivery.','clamp(2rem,4vw,3.6rem)'),makeFooterButton('Start a private conversation'),makeFooterText('PRACTICE  ·  Advisory · Consulting · Support  /  LEGAL  ·  Privacy · Terms','100%')] },
          { layout:'grid', columns:'2', align:'left', padding:'58px 9% 28px', bg:'#263b30', items:[makeFooterHeading('Business, made simpler.'),makeFooterText('WHAT WE DO  ·  Solutions · Capabilities · Projects'),makeFooterText('WHERE WE WORK  ·  Locations · Coverage · Partners'),makeFooterText('REQUEST A QUOTE  ·  Tell us what you need','100%'),makeFooterText('© '+name+' · All rights reserved.','100%')] },
          { layout:'flex', columns:'2', align:'left', padding:'42px 7% 24px', bg:'#242b36', items:[makeFooterHeading('Here when you need us.'),makeFooterText('CUSTOMER CARE  ·  Help centre · FAQs · Support'),makeFooterText('COMPANY  ·  About · News · Careers'),makeFooterText('FOLLOW ALONG  ·  LinkedIn · Instagram · Facebook','100%'),makeFooterText('© '+name,'100%')] },
          { layout:'grid', columns:'3', align:'left', padding:'72px 7% 30px', bg:'#111827', items:[makeFooterHeading('Work smarter. Move faster.'),makeFooterText('PLATFORM  ·  Features · Integrations · Security'),makeFooterText('LEARN  ·  Resources · Documentation · Updates'),makeFooterButton('Book a product demo'),makeFooterText('© '+name+' · All rights reserved.','100%')] },
          { layout:'stacked', columns:'1', align:'left', padding:'100px 10% 36px', bg:'#302b43', items:[makeFooterText('A TRUSTED PARTNER FOR IMPORTANT DECISIONS','100%'),makeFooterHeading('Good decisions deserve a considered conversation.','clamp(2.2rem,5vw,4.8rem)'),makeFooterText('Advisory  ·  Our expertise · Our approach · Leadership · Insights','100%'),makeFooterButton('Make a private enquiry'),makeFooterText('© '+name+' · Privacy · Terms','100%')] },
          { layout:'grid', columns:'2', align:'left', padding:'50px 7% 26px', bg:'#243d3b', items:[makeFooterHeading('Dependable service. Consistent results.'),makeFooterText('SERVICES  ·  Capabilities · Industries · Projects'),makeFooterText('COMPANY  ·  About us · Our process · Careers'),makeFooterText('CONTACT  ·  Request a proposal · +234 800 000 0000','100%'),makeFooterText('© '+name+' · All rights reserved.','100%')] },
          { layout:'flex', columns:'2', align:'center', padding:'78px 8% 30px', bg:'#29251e', items:[makeFooterHeading('Good people. Good business.','clamp(2rem,4.5vw,4rem)'),makeFooterButton('Say hello'),makeFooterText('Discover · Our story · What we do · Our values · Stay connected','100%'),makeFooterText('© '+name+' · All rights reserved.','100%')] },
        ]
        const selectedFooter = footerVariants[(variantNumber - 1) % footerVariants.length]
        return selectedFooter.items
      })() : [{ ...component('text', '© ' + name + '. All rights reserved.'), id: createId('copyright'), styles: { ...component('text', '© ' + name + '. All rights reserved.').styles, color: '#ffffff', maxWidth: '100%' } }],
      styles: { ...footer.styles, padding: category === 'Business' ? ['68px 7% 28px','110px 12% 42px','54px 8% 30px','88px 10% 34px','58px 9% 28px','42px 7% 24px','72px 7% 30px','100px 10% 36px','50px 7% 26px','78px 8% 30px'][layoutVariant] : '36px 7%', backgroundColor: category === 'Business' ? ['#18252d','#24211d','#263b45','#35252d','#263b30','#242b36','#111827','#302b43','#243d3b','#29251e'][layoutVariant] : selectedTheme.primary, layout: category === 'Business' ? ['grid','stacked','grid','flex','grid','flex','grid','stacked','grid','flex'][layoutVariant] : 'stacked', gridColumns: category === 'Business' ? ['4','1','3','2','2','2','3','1','2','2'][layoutVariant] : '1', gap: ['24px','18px','22px','28px','22px','24px','22px','18px','22px','28px'][layoutVariant], textAlign: category === 'Business' && [1,7].includes(layoutVariant) ? 'center' : 'left', alignItems:'start', justifyContent:'space-between' },
    },
  ]
  site.metadata.description = sections[0][2]
  const categoryPageLabels: Record<string, string[]> = {
    Photography:['Home','Portfolio','Services','About','Packages','Contact'],
    'Fashion & Apparel':['Home','Shop','Collections','Our Story','Size Guide','Contact'],
    'Church & Ministry':['Home','About','Ministries','Services','Events','Give','Contact'],
    Agriculture:['Home','Our Farm','Products','Our Process','Sustainability','Contact'],
    'Logistics & Delivery':['Home','Services','Coverage','Track & Trace','About','Get a Quote'],
    'Interior Design':['Home','Portfolio','Services','Our Studio','Process','Contact'],
    Automotive:['Home','Vehicles','Services','Finance','About','Contact'],
    'Fitness & Sports':['Home','Membership','Classes','Coaches','Timetable','Contact'],
    Wedding:['Home','Our Story','Gallery','Packages','FAQs','RSVP','Contact'],
    'Pet Care':['Home','Services','Our Team','Pet Gallery','FAQs','Contact'],
    'Music & Entertainment':['Home','Artists','Events','Media','About','Bookings'],
    'Personal Services':['Home','Services','How It Works','Reviews','About','Contact'],
  }
  const pageLabels: Record<string, string[]> = {
    agency:['Home','About','Services','Work','Contact'], business:['Home','About','Services','Contact'], portfolio:['Home','Work','About','Contact'], shop:['Home','Shop','About','Contact'],
    restaurant:['Home','Menu','Our Story','Visit'], launch:['Home','FAQ','Contact'], education:['Home','Programs','Admissions','About','Contact'], journal:['Home','Stories','Topics','About'], community:['Home','About','Events','Join','Contact'],
    realestate:['Home','Properties','About','Contact'], healthcare:['Home','Services','Our Team','Patient Info','Contact'], beauty:['Home','Treatments','About','Gallery','Contact'], travel:['Home','Stay','Experiences','Gallery','Contact'],
    finance:['Home','Solutions','About','Insights','Contact'], saas:['Home','Features','Pricing','Resources','Contact'], nonprofit:['Home','Our Mission','Programs','Impact','Get Involved'],
    events:['Home','Schedule','Speakers','Venue','Register'], construction:['Home','Services','Projects','About','Request a Quote'], legal:['Home','Practice Areas','Our Firm','People','Contact'],
  }
  const businessPageLabels = [
    ['Home','About','Services','Industries','Contact'],
    ['Home','Expertise','Approach','Insights','Contact'],
    ['Home','Growth','Capabilities','Case Studies','Contact'],
    ['Home','Practice Areas','Our Approach','People','Contact'],
    ['Home','Solutions','Projects','Industries','Request a Quote'],
    ['Home','Advisory','Leadership','Perspectives','Contact'],
    ['Home','Platform','Features','Pricing','Book a Demo'],
    ['Home','Our Expertise','Our Approach','Insights','Contact'],
    ['Home','Services','Our Work','Industries','Contact'],
    ['Home','What We Do','Our Story','Customer Care','Contact'],
  ]
  const labels = category === 'Business'
    ? businessPageLabels[(variantNumber - 1) % businessPageLabels.length]
    : category === 'School'
      ? ['Home','About','Academics','Admissions','Student Life','News','Contact']
      : (categoryPageLabels[category] ?? pageLabels[baseTemplateId] ?? ['Home','About','Services','Contact'])
  const innerPageHighlights: Record<string, [string, string, string, string]> = {
    Photography:['Selected work','Explore portraits, events, commercial projects and carefully curated image stories.','Book a session','Find package information, availability and details for planning your shoot.'],
    'Fashion & Apparel':['The latest collection','Discover considered pieces, seasonal edits and styles for every occasion.','Made to be worn','Find sizing, delivery and care information before choosing your favourites.'],
    'Church & Ministry':['Life together','Discover our ministries, community groups and opportunities to grow and serve.','Plan your visit','Find service times, location details and ways to connect with the church family.'],
    Agriculture:['From our land','Explore our produce, farming capabilities and the people behind each harvest.','Growing responsibly','Learn about our methods, seasonal availability and partnerships.'],
    'Logistics & Delivery':['Solutions that move','Explore delivery, freight, warehousing and tailored transport services.','Keep things moving','Find coverage information, tracking guidance and a clear route to request a quote.'],
    'Interior Design':['Spaces with purpose','Explore residential, commercial and hospitality projects shaped around people.','Start a project','Learn about our design process, services and initial consultation.'],
    Automotive: ['Vehicle collection', 'Browse new arrivals, featured models and carefully selected vehicles for different needs and budgets.', 'Support beyond the showroom', 'Find clear information about viewings, test drives, servicing and ownership support.'],
    'Fitness & Sports': ['Programmes and classes', 'Explore strength, conditioning, group sessions and coaching for different experience levels.', 'Progress with the right support', 'Meet the coaches, understand membership options and find a routine that works for you.'],
    Wedding: ['Planning and packages', 'Explore celebration styles, planning support and thoughtful details for your day.', 'Your day, your way', 'Find answers about dates, venues, suppliers and what happens next.'],
    'Pet Care': ['Care and services', 'Explore grooming, boarding, health support and other services for your companion.', 'A team you can trust', 'Meet the people, understand our care approach and prepare for your pet’s visit.'],
    'Music & Entertainment': ['Artists and experiences', 'Discover performers, productions, live events and creative services.', 'Plan your next event', 'Find booking information, technical details and ways to work together.'],
    'Personal Services': ['Services and packages', 'Explore practical services, clear packages and support tailored to your needs.', 'Simple from start to finish', 'Understand our process, service areas and how to request help.'],

    shop: ['Featured collection', 'Browse carefully selected products, discover new arrivals and find customer favourites.', 'Shopping made simple', 'Enjoy clear product details, helpful support and a smooth path from discovery to checkout.'],
    restaurant: ['From our kitchen', 'Explore starters, signature dishes, seasonal plates and freshly prepared favourites.', 'A table worth sharing', 'Find dining options, opening hours and the details you need before your visit.'],
    education: ['Learning pathways', 'Explore subjects, programmes, enrichment and opportunities for every stage of learning.', 'A supportive school community', 'Meet our educators, discover student life and see how every learner is encouraged to thrive.'],
    realestate: ['Featured properties', 'Explore selected homes, commercial spaces and new opportunities in sought-after locations.', 'Your property journey', 'Get clear guidance on viewings, buying, selling and finding a place that feels right.'],
    healthcare: ['Care and services', 'Explore available services, specialist support and practical information for patients.', 'Your care, clearly explained', 'Find appointment guidance, patient resources and answers to common questions.'],
    beauty: ['Signature treatments', 'Discover our most-loved treatments, tailored services and thoughtful finishing touches.', 'Your time to unwind', 'Explore the experience, prepare for your visit and find the right treatment for you.'],
    travel: ['Discover your destination', 'Explore stays, local highlights and experiences selected to make every journey memorable.', 'Plan with confidence', 'Find useful travel information, thoughtful recommendations and support before you go.'],
    saas: ['Tools for better work', 'Explore the workflows, integrations and features that help your team stay focused.', 'Built to scale with you', 'See how flexible plans, helpful resources and responsive support fit your team.'],
    events: ['The event experience', 'Explore sessions, special moments and practical details for your time with us.', 'Plan your visit', 'Find venue information, timings and everything you need for a smooth event day.'],
    construction: ['Our capabilities', 'Explore our services, specialist trades and the projects we deliver from start to finish.', 'A clear project process', 'Understand how planning, communication and careful delivery keep work moving.'],
    legal: ['How we can help', 'Explore our legal services and the areas where our team provides focused support.', 'A considered approach', 'Understand what to expect from an initial discussion and how we work with clients.'],
    nonprofit: ['Programmes in action', 'Discover the initiatives, services and community projects behind our mission.', 'Ways to make a difference', 'Find out how to volunteer, partner with us or support the work.'],
  }
  const categoryPageDescriptions: Record<string, Record<string, string>> = {
    Business:{About:'Learn about our story, values and the people committed to helping customers and partners succeed.',Services:'Explore our core services, capabilities and the practical ways we support businesses.',Contact:'Tell us what you need and our team will help you find the right next step.'},
    Automotive:{Vehicles:'Explore available vehicles, key details and options to arrange a viewing or test drive.',Services:'Discover maintenance, repairs and aftercare designed to keep you moving.',Finance:'Understand available finance guidance and the information to prepare before applying.'},
    'Fitness & Sports':{Membership:'Compare membership options and find the level of access that suits your goals.',Classes:'Explore group sessions, training styles and class information.',Coaches:'Meet the coaches and learn about their experience and approach.',Timetable:'Plan your week with our class and training schedule.'},
    Wedding:{'Our Story':'Meet the people, inspiration and approach behind the celebrations we create.',Gallery:'Explore real celebrations, thoughtful details and ideas for your own day.',Packages:'Discover planning options and services that can be shaped around your celebration.',FAQs:'Find answers to common questions about planning, dates and our services.',RSVP:'Share your response and important details for the celebration.'},
    'Pet Care':{Services:'Explore the care options available and find the right support for your companion.','Our Team':'Meet the people who care for pets with patience, experience and attention.', 'Pet Gallery':'A look at the happy companions who make our community special.',FAQs:'Find practical answers about visits, preparation and ongoing care.'},
    Photography:{Portfolio:'Browse portraits, events, commercial work and personal projects.',Services:'Explore photography sessions, creative direction and image delivery options.',Packages:'Compare session options and find the right coverage for your needs.'},
    'Fashion & Apparel':{Shop:'Browse current pieces, bestsellers and new arrivals.',Collections:'Explore curated edits, seasonal looks and signature collections.','Size Guide':'Find measurements and fit guidance before placing an order.'},
    'Church & Ministry':{Ministries:'Discover groups and ministries for worship, learning, care and service.',Services:'Find gathering times, worship details and information for visitors.',Events:'See upcoming gatherings, special services and community activities.',Give:'Learn about supporting the work and mission of the church.'},
    Agriculture:{'Our Farm':'Meet the people, land and practices behind our farming work.',Products:'Explore available produce, livestock and agricultural products.','Our Process':'Learn about cultivation, harvesting, handling and quality practices.',Sustainability:'Discover how we care for soil, resources and the wider environment.'},
    'Logistics & Delivery':{Services:'Explore courier, freight, haulage and fulfilment services.',Coverage:'Check the regions and routes supported by our delivery network.','Track & Trace':'Find guidance for tracking a shipment and getting delivery updates.','Get a Quote':'Share shipment details to request a tailored transport estimate.'},
    'Interior Design':{Portfolio:'Explore residential, hospitality and commercial design projects.',Services:'Discover interior design, space planning and styling services.','Our Studio':'Meet the team and learn about our design philosophy.',Process:'Understand the steps from consultation and concept to installation.'},
    'Music & Entertainment':{Artists:'Meet the artists, performers and creative talent we work with.',Events:'Discover upcoming performances, appearances and live experiences.',Media:'Explore music, videos, photography and highlights from recent work.',Bookings:'Tell us about your event and the talent or production support you need.'},
    'Personal Services':{Services:'Explore our services, what is included and how to request support.','How It Works':'A simple overview of the steps from first enquiry to completed service.',Reviews:'Read feedback from customers who have worked with our team.'},
  }
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
    const pageBody = categoryPageDescriptions[category]?.[label] ?? pageDescriptions[label] ?? 'Discover more about ' + name + ', our approach and how we can help you take the next step.'
    const pageHighlights = innerPageHighlights[category] ?? innerPageHighlights[baseTemplateId] ?? ['Thoughtful expertise','A considered experience shaped around your needs.','Clear information','Helpful guidance for your next step.']
    const showcaseByCategory: Record<string, { title: string; items: string[] }> = {
      Business:{title:'Our business capabilities',items:['Strategy & consulting · Clear thinking and practical plans for your next stage.','Business operations · Dependable support that helps your organisation work better.','Client partnerships · Responsive people focused on long-term relationships.']},
      shop: { title: 'Explore the collection', items: ['New arrivals · Discover the latest additions to the collection.', 'Customer favourites · Browse pieces customers return to again and again.', 'Made for everyday · Clear details, thoughtful quality and easy support.'] },
      restaurant: { title: 'A taste of the menu', items: ['Small plates · Fresh starters and seasonal dishes to share.', 'From the kitchen · Signature mains prepared with care.', 'Something sweet · Desserts and drinks to finish your visit.'] },
      education: { title: 'Learning at every stage', items: ['Early years · A warm start built around curiosity and confidence.', 'Primary learning · Strong foundations, creativity and discovery.', 'Secondary pathways · Skills, subject choices and preparation for what comes next.'] },
      realestate: { title: 'Featured property opportunities', items: ['Family homes · Comfortable spaces in welcoming neighbourhoods.', 'Modern apartments · Well-planned living with useful amenities.', 'Commercial spaces · Flexible locations for growing businesses.'] },
      'Fitness & Sports': { title: 'Find your training rhythm', items: ['Strength sessions · Build confidence with guided resistance training.', 'Group classes · Train together with motivating coached sessions.', 'Personal coaching · Get a plan shaped around your goals.'] },
      Wedding: { title: 'Celebration experiences', items: ['Full planning · Support from the first idea to the final detail.', 'Venue styling · Thoughtful spaces, flowers and finishing touches.', 'Photography · Preserve the moments you will want to revisit.'] },
      Automotive: { title: 'Explore our vehicle range', items: ['New arrivals · Discover recently added vehicles and key specifications.', 'Certified pre-owned · Carefully selected vehicles with clear histories.', 'Aftercare · Servicing and support to keep you moving.'] },
      'Pet Care': { title: 'Care for every companion', items: ['Grooming · Gentle care to help pets look and feel their best.', 'Day care & boarding · Safe, welcoming care while you are away.', 'Wellbeing · Helpful guidance for happier, healthier pets.'] },
      'Music & Entertainment': { title: 'Discover the experience', items: ['Live performances · Artists and shows that bring the room to life.', 'Event production · Sound, lighting and creative technical support.', 'Artist bookings · Find the right talent for your occasion.'] },
      'Personal Services': { title: 'Services made simple', items: ['Choose a service · Find the right support for your needs.', 'Clear process · Understand the steps, timing and what is included.', 'Personal support · Get help from a real team when you need it.'] },
      Photography: { title: 'A portfolio in focus', items: ['Portrait sessions · Thoughtful portraits for individuals, families and teams.', 'Events & celebrations · Story-led coverage of meaningful moments.', 'Commercial photography · Product, brand and campaign imagery for businesses.'] },
      'Fashion & Apparel': { title: 'Shop the edit', items: ['New season · Discover fresh arrivals and the latest collection.', 'Everyday essentials · Versatile pieces selected for comfort and style.', 'Delivery & returns · Clear guidance on sizing, delivery and exchanges.'] },
      'Church & Ministry': { title: 'Find your place', items: ['Sunday gathering · Join us for worship, teaching and community.', 'Groups & ministries · Connect through practical service and shared interests.', 'Care & support · Find pastoral care, prayer and ways to get involved.'] },
      Agriculture: { title: 'Farm products & capabilities', items: ['Fresh produce · Seasonal crops grown with care and attention.', 'Farm operations · Learn about our growing, handling and supply process.', 'Wholesale partnerships · Enquire about reliable supply and distribution.'] },
      'Logistics & Delivery': { title: 'A connected delivery network', items: ['Courier & last mile · Reliable collection and delivery for local needs.', 'Freight & haulage · Flexible transport solutions for larger consignments.', 'Warehousing & fulfilment · Practical storage, handling and dispatch support.'] },
      'Interior Design': { title: 'Explore our design services', items: ['Residential spaces · Considered interiors shaped around daily living.', 'Commercial environments · Functional, distinctive spaces for teams and customers.', 'Design consultation · A clear process from first ideas to finished details.'] },
    }
    const showcase = showcaseByCategory[category] ?? showcaseByCategory[baseTemplateId]
    const pageSections: SiteSection[] = [
      {
        id:createId('section'), kind:'header', name:'Navigation', enabled:true,
        styles:{padding:'22px 7%',backgroundColor:selectedTheme.background,borderBottom:'1px solid #e8e5df'},
        components:[{...component('heading',name.toUpperCase()),id:createId('brand'),styles:{fontSize:'1rem',fontWeight:'800',letterSpacing:'0.15em',color:selectedTheme.primary}}],
      },
      {
        id:createId('section'), kind:'hero', name:label + ' introduction', enabled:true,
        styles:{padding:'clamp(64px, 9vw, 112px) 8%',backgroundColor:palette[baseTemplateId] ?? '#edf3f4'},
        components:[
          {...component('text','DISCOVER  /  '+label.toUpperCase()),id:createId('eyebrow'),styles:{fontSize:'0.75rem',fontWeight:'800',letterSpacing:'0.18em',color:selectedTheme.accent,maxWidth:'100%'}},
          {...component('heading',pageHeading),id:createId('heading'),styles:{fontFamily:selectedTheme.heading,fontSize:'clamp(2.5rem, 5.5vw, 4.8rem)',fontWeight:'750',lineHeight:'1.08',color:selectedTheme.primary,maxWidth:'900px'}},
          {...component('text',pageBody),id:createId('text'),styles:{fontFamily:selectedTheme.body,fontSize:'1.1rem',lineHeight:'1.8',color:selectedTheme.text,maxWidth:'720px'}},
          {id:createId('image'),kind:'image',content:heroImage,visible:true,styles:{width:'100%',height:'min(42vw, 360px)',maxWidth:'1120px',objectFit:'cover',borderRadius:selectedTheme.radius,margin:'30px auto 0'}},
        ],
      },
      {
        id:createId('section'), kind:showcase ? 'gallery' : 'features', name:showcase?.title ?? 'Explore '+label, enabled:true,
        styles:{padding:'clamp(56px, 7vw, 88px) 8%',backgroundColor:selectedTheme.background,layout:'grid',gridColumns:'2',gap:'22px'},
        components:[
          {...component('heading',showcase?.title ?? (label==='About'?'The thinking behind '+name:'A closer look')),id:createId('heading'),styles:{fontFamily:selectedTheme.heading,fontSize:'clamp(1.8rem, 3vw, 2.8rem)',fontWeight:'750',color:selectedTheme.primary,maxWidth:'760px',gridColumn:'1 / -1'}},
          {...component('text',pageHighlights[1]),id:createId('text'),styles:{fontFamily:selectedTheme.body,fontSize:'1.05rem',lineHeight:'1.8',color:selectedTheme.text,maxWidth:'680px',gridColumn:'1 / -1'}},
          ...(showcase ? showcase.items : [pageHighlights[0],pageHighlights[2]]).flatMap((item,index)=>[
            ...(showcase ? [{id:createId('showcase-image-'+index),kind:'image' as const,content:`https://images.unsplash.com/${galleryImages[index % galleryImages.length]}?auto=format&fit=crop&w=900&q=82`,visible:true,styles:{width:'100%',height:'clamp(150px, 20vw, 230px)',objectFit:'cover',borderRadius:selectedTheme.radius,gridColumn:'span 1'}}] : []),
            {...component('text',item),id:createId('showcase-'+index),styles:{fontWeight:'650',fontSize:'1rem',lineHeight:'1.8',color:selectedTheme.primary,backgroundColor:palette[baseTemplateId] ?? '#f3eee5',padding:'26px',borderRadius:selectedTheme.radius,border:'1px solid #e9e4dc',minHeight:'112px',alignSelf:'stretch'}},
          ]),
        ],
      },
      {
        id:createId('section'), kind:'contact', name:'Next step', enabled:true,
        styles:{padding:'clamp(56px, 7vw, 84px) 8%',backgroundColor:selectedTheme.primary},
        components:[
          {...component('heading',label==='Contact'?'We would love to hear from you.':'Ready for the next step?'),id:createId('heading'),styles:{fontFamily:selectedTheme.heading,fontSize:'clamp(2rem, 4vw, 3.4rem)',fontWeight:'750',lineHeight:'1.1',color:'#ffffff',maxWidth:'850px'}},
          {...component('text',baseTemplateId==='shop'?'Have a question about a product or an order? Our team is ready to help.':baseTemplateId==='restaurant'?'Planning a meal or a special occasion? We would be delighted to welcome you.':baseTemplateId==='education'?'Take the next step and speak with our admissions team about joining our school.':baseTemplateId==='realestate'?'Tell us what you are looking for and let our property team guide your next move.':'Get in touch with '+name+' and let’s make a plan together.'),id:createId('text'),styles:{fontFamily:selectedTheme.body,fontSize:'1.05rem',lineHeight:'1.8',color:'#f2f0eb',maxWidth:'680px'}},
          {...component('button',label==='Admissions'?'Ask about admissions':label==='Pricing'?'Talk about plans':'Contact us'),id:createId('button'),styles:{backgroundColor:selectedTheme.accent,color:'#ffffff',padding:'15px 28px',borderRadius:selectedTheme.radius,fontWeight:'700'}},
        ],
      },
      {
        id:createId('section'), kind:'footer', name:'Footer', enabled:true,
        styles:{padding:'30px 7%',backgroundColor:'#171717'},
        components:[{...component('text','© '+name+'. All rights reserved.'),id:createId('copyright'),styles:{color:'#ffffff',maxWidth:'100%',fontSize:'0.9rem'}}],
      },
    ]
    return { id:createId('page'), name:label, slug, isHomePage:false, sections:pageSections }
  })
  return site
}
