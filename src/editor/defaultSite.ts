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
    Automotive: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85',
    'Fitness & Sports': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=85',
    Wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
    'Pet Care': 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1600&q=85',
    'Music & Entertainment': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=85',
    'Personal Services': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85',
  }
  const heroImage = categoryHeroImages[category] ?? templateHeroImages[baseTemplateId] ?? templateHeroImages.business
  const galleryImageSets: Record<string, string[]> = {
    shop: ['photo-1490481651871-ab68de25d43d','photo-1542291026-7eec264c27ff','photo-1523275335684-37898b6baf30'],
    restaurant: ['photo-1517248135467-4c7edcad34c4','photo-1414235077428-338989a2e8c0','photo-1555396273-367ea4eb4db5'],
    education: ['photo-1509062522246-3755977927d7','photo-1503676260728-1c00da094a0b','photo-1427504494785-3a9ca7044f45'],
    realestate: ['photo-1600607687939-ce8a6c25118c','photo-1600566753086-00f18fb6b3ea','photo-1600047509807-ba8f99d2cdde'],
    fitness: ['photo-1534438327276-14e5300c3a48','photo-1517836357463-d25dfeac3438','photo-1518611012118-696072aa579a'],
    wedding: ['photo-1519741497674-611481863552','photo-1511285560929-80b456fea0bc','photo-1464366400600-7168b8af9bc3'],
    automotive: ['photo-1503376780353-7e6692767b70','photo-1492144534655-ae79c964c9d7','photo-1503736334956-4c8f8e92946d'],
    pets: ['photo-1552053831-71594a27632d','photo-1517849845537-4d257902454a','photo-1548199973-03cce0bbc9b3'],
    music: ['photo-1506157786151-b8491531f063','photo-1501386761578-eac5c94b800a','photo-1470229722913-7c0e2dbbafd3'],
  }
  const galleryKey = category === 'E-commerce' ? 'shop' : category === 'Restaurant' ? 'restaurant' : category === 'School' || category === 'Education' ? 'education' : category === 'Real Estate' ? 'realestate' : category === 'Fitness & Sports' ? 'fitness' : category === 'Wedding' ? 'wedding' : category === 'Automotive' ? 'automotive' : category === 'Pet Care' ? 'pets' : category === 'Music & Entertainment' ? 'music' : baseTemplateId
  const galleryImages = galleryImageSets[galleryKey] ?? [heroImage, 'photo-1497366754035-f200968a6e72', 'photo-1497366811353-6870744d04b2']
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
  const sections = categoryContent[category] ?? content[baseTemplateId] ?? content.business
  const header = site.pages[0].sections[0]
  const footer = site.pages[0].sections[site.pages[0].sections.length - 1]
  const layoutVariant = (variantNumber - 1) % 10
  const sectionOrders = [
    [0,1,2,3,4], [0,2,1,3,4], [0,3,1,2,4], [0,1,3,2,4], [0,2,3,1,4],
    [0,3,2,1,4], [0,1,2,4,3], [0,2,4,1,3], [0,3,1,4,2], [0,4,1,2,3],
  ]
  const orderedSections = sectionOrders[layoutVariant].map(index => sections[index]).filter(Boolean)
  const variantSections = orderedSections.length >= 3 ? orderedSections : sections
  const heroTone = layoutVariant % 3 === 0 ? selectedTheme.primary : palette[baseTemplateId] ?? '#f3eee5'
  const heroAlign = layoutVariant === 1 || layoutVariant === 4 || layoutVariant === 7 ? 'center' : 'left'
  site.pages[0].sections = [
    { ...header, components: [{ ...component('heading', name.toUpperCase()), id: createId('brand'), styles: { ...component('heading', name.toUpperCase()).styles, fontSize: '1rem', letterSpacing: '0.16em', fontWeight: '800', color: selectedTheme.primary } }], styles: { ...header.styles, padding: layoutVariant === 8 ? '34px 9%' : '22px 7%', backgroundColor: selectedTheme.background, borderBottom: '1px solid #e8e5df' } },
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
          padding: isHero ? (layoutVariant === 8 ? '164px 10%' : '144px 8%') : layoutVariant === 9 ? '92px 9%' : '84px 8%',
          textAlign: (isHero ? heroAlign : 'left') as 'left' | 'center',
          layout: kind === 'gallery' || (kind === 'features' && layoutVariant % 2 === 0) ? 'grid' : 'stacked',
          gridColumns: kind === 'gallery' ? '3' : kind === 'features' && layoutVariant % 2 === 0 ? (layoutVariant === 6 ? '4' : '3') : '2',
          borderTop: !isHero && index % 2 === 0 ? '1px solid #e9e4dc' : 'none',
        },
        components: block.components.map(item => ({
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
          },
        })),
      }
    }),
    { ...footer, components: [{ ...component('text', '© ' + name + '. All rights reserved.'), id: createId('copyright'), styles: { ...component('text', '© ' + name + '. All rights reserved.').styles, color: '#ffffff', maxWidth: '100%' } }], styles: { ...footer.styles, padding: '36px 7%', backgroundColor: selectedTheme.primary } },
  ]
  site.metadata.description = sections[0][2]
  const categoryPageLabels: Record<string, string[]> = {
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
  const labels = category === 'School' ? ['Home','About','Academics','Admissions','Student Life','News','Contact'] : (categoryPageLabels[category] ?? pageLabels[baseTemplateId] ?? ['Home','About','Services','Contact'])
  const innerPageHighlights: Record<string, [string, string, string, string]> = {
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
    Automotive:{Vehicles:'Explore available vehicles, key details and options to arrange a viewing or test drive.',Services:'Discover maintenance, repairs and aftercare designed to keep you moving.',Finance:'Understand available finance guidance and the information to prepare before applying.'},
    'Fitness & Sports':{Membership:'Compare membership options and find the level of access that suits your goals.',Classes:'Explore group sessions, training styles and class information.',Coaches:'Meet the coaches and learn about their experience and approach.',Timetable:'Plan your week with our class and training schedule.'},
    Wedding:{'Our Story':'Meet the people, inspiration and approach behind the celebrations we create.',Gallery:'Explore real celebrations, thoughtful details and ideas for your own day.',Packages:'Discover planning options and services that can be shaped around your celebration.',FAQs:'Find answers to common questions about planning, dates and our services.',RSVP:'Share your response and important details for the celebration.'},
    'Pet Care':{Services:'Explore the care options available and find the right support for your companion.','Our Team':'Meet the people who care for pets with patience, experience and attention.', 'Pet Gallery':'A look at the happy companions who make our community special.',FAQs:'Find practical answers about visits, preparation and ongoing care.'},
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
          ...(showcase ? showcase.items : [pageHighlights[0],pageHighlights[2]]).map((item,index)=>({...component('text',item),id:createId('showcase-'+index),styles:{fontWeight:'600',fontSize:'1rem',lineHeight:'1.7',color:selectedTheme.primary,backgroundColor:palette[baseTemplateId] ?? '#f3eee5',padding:'26px',borderRadius:selectedTheme.radius,border:'1px solid #e9e4dc',minHeight:'112px'}})),
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
