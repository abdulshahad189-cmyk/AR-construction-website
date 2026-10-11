import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Menu, X } from 'lucide-react'
import { companyWorkImages, photo, publicAssetUrl, responsiveImageSrcSet, services } from './data'
import { WhatsAppAction } from './whatsapp'
import HouseConstruction from './HouseConstruction'
import './home.css'

const sectionMotion = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .12 }, transition: { duration: .65 } }

function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  const links = [['About', '/about'], ['House Construction', '/house-construction'], ['Services', '/services'], ['Projects', '/projects'], ['Our Process', '/process']]
  return <header className="header">
    <Link to="/" className="brand" aria-label="AR Construction home"><span className="brand-mark">AR</span><span className="brand-copy"><strong>AR CONSTRUCTION</strong><small>BUILDERS & DEVELOPERS</small></span></Link>
    <nav className={`nav ${open ? 'nav-open' : ''}`} aria-label="Main navigation">
      {links.map(([name, href]) => <NavLink key={href} to={href} onClick={() => setOpen(false)}>{name}</NavLink>)}
      <WhatsAppAction className="mobile-cta" label="Chat on WhatsApp" message="Hello AR CONSTRUCTION, I am interested in your civil construction and interior design services in Hyderabad. Please contact me to discuss the details."/>
    </nav>
    <WhatsAppAction className="header-cta" label="WhatsApp" message="Hello AR CONSTRUCTION, I am interested in your services in Hyderabad. Please contact me to discuss the details."/>
    <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
  </header>
}

function Footer() {
  return <footer className="footer">
    <div className="footer-top">
      <div><Link to="/" className="brand footer-brand"><span className="brand-mark">AR</span><span className="brand-copy"><strong>AR CONSTRUCTION</strong><small>BUILDERS & DEVELOPERS</small></span></Link><p>Building Dreams. Crafting Spaces. Creating Legacies.</p></div>
      <div className="footer-links"><span className="eyebrow">EXPLORE</span><Link to="/about">About us</Link><Link to="/services">Our services</Link><Link to="/projects">Work image gallery</Link><Link to="/process">Our process</Link><Link to="/house-construction">House construction</Link></div>
      <div className="footer-links"><span className="eyebrow">GET IN TOUCH</span><span>Hyderabad, Telangana, India</span><a href="mailto:Rafi25524@gmail.com">Rafi25524@gmail.com</a><WhatsAppAction className="footer-chat-link" label="Chat with us on WhatsApp" message="Hello AR CONSTRUCTION, I would like to discuss a construction or interior design project in Hyderabad."/></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} AR CONSTRUCTION</span><span>Thoughtfully built in Hyderabad</span></div>
  </footer>
}

function PageIntro({ kicker, title, text }: { kicker: string; title: React.ReactNode; text: string }) {
  return <section className="page-intro"><span className="eyebrow">{kicker}</span><h1>{title}</h1><p>{text}</p></section>
}

function Home() {
  const reduce = useReducedMotion()
  const homeServices = services.filter(service => ['civil-construction', 'homes-villas', 'interior-design', 'aluminium-works'].includes(service.slug))
  return <>
    <section className="hero">
      <img className="hero-image" src={photo('photo-1600607687939-ce8a6c25118c', 2200)} alt="Architectural reference image of a sunlit contemporary home" fetchPriority="high"/>
      <div className="hero-shade"/>
      <div className="hero-content">
        <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="hero-kicker">CIVIL CONSTRUCTION · INTERIORS · HYDERABAD</motion.span>
        <motion.h1 initial={reduce ? false : { opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .85, delay: .12 }}>Building dreams.<br/><em>Crafting spaces.</em><br/>Creating legacies.</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .45, duration: .8 }}>Thoughtful construction and interiors,<br className="desktop-only"/> shaped around the way you want to live.</motion.p>
        <div className="hero-actions">
          <WhatsAppAction className="button button-light" label="Discuss your project" message="Hello AR CONSTRUCTION, I am interested in civil construction or interior design services in Hyderabad. Please contact me to discuss the details."/>
          <Link className="text-button light-text" to="/projects">Explore our work <ArrowRight size={16}/></Link>
        </div>
      </div>
      <a href="#intro" className="scroll-cue"><span>SCROLL TO DISCOVER</span><ArrowDown size={15}/></a><span className="hero-index">01 / 05</span>
    </section>
    <section className="intro section-pad" id="intro">
      <motion.div {...sectionMotion}><span className="eyebrow">BUILT AROUND YOU</span><h2>A place to begin.<br/><em>A legacy to leave.</em></h2></motion.div>
      <motion.div {...sectionMotion} className="intro-copy"><p>Every meaningful space begins with a conversation. AR CONSTRUCTION brings together civil construction, interiors and project coordination to help turn your ideas into places that feel like yours.</p><p className="muted">Based in Hyderabad, Telangana. A local team, a considered approach, and work shaped around your brief.</p><Link className="text-button" to="/about">Get to know us <ArrowRight size={16}/></Link></motion.div>
    </section>
    <section className="services-band section-pad">
      <div className="section-heading"><div><span className="eyebrow">WHAT WE DO</span><h2>Spaces made <em>with purpose.</em></h2></div><Link className="text-button" to="/services">Explore all services <ArrowRight size={16}/></Link></div>
      <div className="service-grid">{homeServices.map((service, index) => <motion.div key={service.slug} {...sectionMotion} transition={{ duration: .6, delay: index * .08 }}><Link to={`/services/${service.slug}`} className="service-card"><img src={service.localImage ? publicAssetUrl(service.localImage) : photo(service.image, 900)} srcSet={service.localImage && service.localImageWidth ? responsiveImageSrcSet(service.localImage, service.localImageWidth) : undefined} sizes="(max-width: 680px) 80vw, (max-width: 1000px) 40vw, 22vw" alt={service.imageAlt ?? `${service.title} architectural reference`} loading="lazy"/>{service.localImage && <span className="service-image-note">ARCHIVE PHOTO · PROJECT DETAILS UNCONFIRMED</span>}<span className="service-count">0{index + 1}</span><span className="service-title">{service.title}<ArrowUpRight size={17}/></span></Link></motion.div>)}</div>
    </section>
    <section className="house-spotlight section-pad" aria-labelledby="house-spotlight-title">
      <div className="house-spotlight-copy"><span className="eyebrow">A HOME OF YOUR OWN</span><h2 id="house-spotlight-title">Planning to build?<br/><em>Start with clarity.</em></h2><p>Explore our house-construction service, understand the planning stages and prepare to discuss a project-specific quotation.</p><Link className="button button-dark" to="/house-construction">Explore house construction <ArrowRight size={16}/></Link></div>
      <figure className="house-spotlight-image"><img src={publicAssetUrl('/images/projects/civil/construction-site-scaffolding.jpg')} srcSet={responsiveImageSrcSet('/images/projects/civil/construction-site-scaffolding.jpg', 590)} sizes="(max-width: 760px) 86vw, 42vw" alt="Building exterior behind scaffolding; location, scope and project status are unconfirmed." loading="lazy"/><figcaption>ARCHIVE PHOTO · PROJECT DETAILS UNCONFIRMED</figcaption></figure>
    </section>
    <section className="portfolio section-pad">
      <div className="section-heading"><div><span className="eyebrow">COMPANY-SHARED WORK IMAGERY</span><h2>Construction and interiors.<br/><em>Photo archive.</em></h2></div><Link className="text-button" to="/projects">View image gallery <ArrowRight size={16}/></Link></div>
      <div className="archive-project-grid">{companyWorkImages.slice(0, 3).map(image => <CompanyWorkCard key={image.image} image={image}/>)}</div>
      <p className="editorial-note">These are company-archive images, not verified project case studies. Details and status will be added only after confirmation.</p>
    </section>
    <section className="manifesto"><img src={photo('photo-1600607687920-4e2a09cf159d', 1800)} alt="Architectural reference image of a quiet interior with natural stone and warm wood" loading="lazy"/><div className="manifesto-shade"/><motion.div {...sectionMotion}><span className="eyebrow">THE AR APPROACH</span><h2>Good work feels<br/><em>thoughtful at every scale.</em></h2><Link className="button button-outline-light" to="/process">How we work <ArrowRight size={16}/></Link></motion.div><span className="manifesto-caption">DETAIL IS WHERE THE DIFFERENCE LIVES</span></section>
    <WhyUs/><Consultation/>
  </>
}

function WhyUs() {
  return <section className="why section-pad"><div><span className="eyebrow">WHY AR CONSTRUCTION</span><h2>Clear thinking.<br/><em>Careful making.</em></h2><p className="muted">A building journey should feel considered from the first conversation to the final walkthrough.</p></div><div className="why-list">{[['01', 'A clear conversation', 'Understand the brief, priorities and the way you want your space to work.'], ['02', 'Thoughtful coordination', 'Keep scope, decisions and next steps easy to follow.'], ['03', 'Care in the details', 'Approach materials, finishes and handover with attention.']].map(item => <article key={item[0]}><span>{item[0]}</span><div><h3>{item[1]}</h3><p>{item[2]}</p></div></article>)}</div></section>
}

function Consultation() {
  return <section className="consultation section-pad"><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>Have a space in mind?<br/><em>Let’s talk it through.</em></h2><WhatsAppAction className="button button-dark" label="Start a WhatsApp conversation" message="Hello AR CONSTRUCTION, I have a space in mind and would like to discuss a project in Hyderabad."/></section>
}

function About() {
  return <>
    <PageIntro kicker="ABOUT AR CONSTRUCTION" title={<>Building with <em>intention.</em></>} text="AR CONSTRUCTION works across civil construction and interiors in Hyderabad, Telangana."/>
    <section className="about-feature section-pad"><img src={photo('photo-1487958449943-2429e8be8625', 1400)} alt="Architectural reference image of modern architecture framed against a clear sky"/><div><span className="eyebrow">OUR PHILOSOPHY</span><h2>Every project starts with <em>listening.</em></h2><p>We believe good spaces begin with a clear understanding of the people who will use them. From there, careful planning and open communication help bring the idea to life.</p><p className="muted">Our approach is shaped by the brief, the place and the people involved. We make room for the small decisions that help a space feel considered, useful and enduring.</p></div></section>
    <section className="values section-pad"><span className="eyebrow">WHAT GUIDES US</span><h2>Principles we bring<br/><em>to every conversation.</em></h2><div className="value-grid">{[['01', 'Clarity', 'Straightforward communication from scope to handover.'], ['02', 'Craft', 'Care for materials, proportion, finish and function.'], ['03', 'Responsibility', 'Respect for your brief, time and investment.']].map(item => <article key={item[0]}><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p></article>)}</div></section>
    <section className="team-note"><span className="eyebrow">THE PEOPLE BEHIND THE WORK</span><p>Team profiles and verified company credentials will be added when supplied by AR CONSTRUCTION.</p></section><Consultation/>
  </>
}

function Services() {
  const { slug } = useParams()
  useEffect(() => { if (slug) document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, [slug])
  return <>
    <PageIntro kicker="OUR SERVICES" title={<>Built around your <em>brief.</em></>} text="From a new build to a considered interior, every engagement begins with your needs and the right scope of work."/>
    <div className="service-list">{services.map((service, index) => <article className={`service-detail ${index % 2 ? 'reverse' : ''}`} key={service.slug} id={service.slug}>
      <div className="service-detail-image"><img src={service.localImage ? publicAssetUrl(service.localImage) : photo(service.image, 1400)} srcSet={service.localImage && service.localImageWidth ? responsiveImageSrcSet(service.localImage, service.localImageWidth) : undefined} sizes="(max-width: 760px) 90vw, 45vw" alt={service.imageAlt ?? `${service.title} architectural reference image`} loading="lazy"/><span>{service.localImage ? 'ARCHIVE PHOTO · PROJECT DETAILS UNCONFIRMED' : 'ARCHITECTURAL REFERENCE IMAGE'}</span></div>
      <div className="service-detail-copy"><span className="eyebrow">0{index + 1} / OUR SERVICES</span><h2>{service.title}</h2><p>{service.description}</p><h3>Scope may include</h3><ul>{service.scope.map(item => <li key={item}>{item}</li>)}</ul><WhatsAppAction className="text-button" label="Discuss this service" message={`Hello AR CONSTRUCTION, I am interested in ${service.title} in Hyderabad. Please contact me to discuss the details.`}/></div>
    </article>)}</div>
    <Consultation/>
  </>
}

function archiveSlug(image: typeof companyWorkImages[number]) {
  return image.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function CompanyWorkCard({ image }: { image: typeof companyWorkImages[number] }) {
  return <article className="sample-card">
    <Link to={`/projects/${archiveSlug(image)}`} aria-label={`View ${image.category} archive photo`}><img src={publicAssetUrl(image.image)} srcSet={responsiveImageSrcSet(image.image, image.imageWidth)} sizes="(max-width: 680px) 90vw, (max-width: 1000px) 45vw, 30vw" alt={image.alt} loading="lazy"/><span className="sample-label">ARCHIVE PHOTO · PROJECT DETAILS UNCONFIRMED</span></Link>
    <div><span className="eyebrow">{image.category}</span><h3>{image.category}</h3><p>Photo shared in the AR CONSTRUCTION image archive. Location, work scope and project status have not been provided.</p></div>
  </article>
}

function Projects() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const categories = ['All', ...Array.from(new Set(companyWorkImages.map(image => image.category)))]
  const filtered = companyWorkImages.filter(image => (filter === 'All' || image.category === filter) && `${image.category} ${image.alt}`.toLowerCase().includes(search.toLowerCase()))
  return <>
    <PageIntro kicker="PROJECTS & WORK IMAGERY" title={<>A portfolio of <em>possibility.</em></>} text="Browse company-shared construction and interior work imagery. These archive photographs are not verified project case studies; locations, scope and status are unconfirmed."/>
    <section className="projects-page section-pad">
      <div className="filter-tools"><label className="project-search">Search the image archive<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search the collection"/></label><div className="filter-row" aria-label="Filter work imagery">{categories.map(category => <button key={category} className={filter === category ? 'filter active' : 'filter'} onClick={() => setFilter(category)}>{category}</button>)}</div></div>
      {filtered.length > 0 ? <div className="archive-project-grid">{filtered.map(image => <CompanyWorkCard key={image.image} image={image}/>)}</div> : <div className="empty-projects"><span className="eyebrow">NO MATCHES</span><h2>Try another search.</h2><p>No archive image matches that search.</p></div>}
      <p className="editorial-note">No completed project, client, testimonial, location or outcome is claimed by these archive photos.</p>
    </section>
    <Consultation/>
  </>
}

function ProjectDetail() {
  const { slug } = useParams()
  const image = companyWorkImages.find(item => archiveSlug(item) === slug)
  if (!image) return <><PageIntro kicker="WORK IMAGE ARCHIVE" title={<>Image not <em>found.</em></>} text="This archive item is unavailable. Browse the local work image gallery instead."/><section className="section-pad"><Link className="button button-dark" to="/projects">Browse image gallery <ArrowRight size={16}/></Link></section></>
  return <>
    <section className="detail-hero"><img src={publicAssetUrl(image.image)} alt={image.alt}/><div><span className="eyebrow">COMPANY-SHARED WORK IMAGE</span><h1>{image.category}</h1><p>Archive photo · project details unconfirmed</p></div></section>
    <section className="detail-copy section-pad"><div><span className="eyebrow">IMAGE CONTEXT</span><h2>Details to be <em>confirmed.</em></h2></div><div><p>{image.alt}</p><p>This photograph is part of the company-shared image archive. It is not presented as a verified completed project or case study.</p><Link className="text-button" to="/projects">Back to image gallery <ArrowRight size={16}/></Link></div></section>
    <section className="consultation section-pad"><span className="eyebrow">HAVE A SIMILAR PROJECT IN MIND?</span><h2>Let’s discuss<br/><em>your requirements.</em></h2><WhatsAppAction className="button button-dark" label="Discuss a similar project on WhatsApp" message={`Hello AR CONSTRUCTION, I saw the ${image.category} image in your work archive and would like to discuss a similar project in Hyderabad.`}/></section>
  </>
}

function Process() {
  const steps = [['01', 'Initial conversation', 'Tell us a little about your project, priorities and timing.'], ['02', 'Consultation', 'We discuss requirements, possibilities and the right next steps.'], ['03', 'Site assessment', 'Where appropriate, we visit to understand the context and conditions.'], ['04', 'Planning & scope', 'We define the scope, key decisions and coordination required.'], ['05', 'Proposal', 'We discuss a clear proposal and quotation for you to review.'], ['06', 'Agreement & schedule', 'Once agreed, we align on timing and the way ahead.'], ['07', 'Execution', 'Construction or interior works progress with considered coordination.'], ['08', 'Inspection & handover', 'We walk the agreed work together and close out the project.']]
  return <><PageIntro kicker="OUR PROCESS" title={<>A clearer way to <em>build.</em></>} text="Good collaboration comes from knowing what happens next. Here’s how we shape the journey together."/><section className="process-timeline section-pad">{steps.map((step, index) => <motion.article key={step[0]} {...sectionMotion} transition={{ duration: .5, delay: index * .03 }}><span className="step-number">{step[0]}</span><div><h2>{step[1]}</h2><p>{step[2]}</p></div><span className="step-mark">{index === steps.length - 1 ? <Check size={17}/> : <ArrowDown size={15}/>}</span></motion.article>)}</section><Consultation/></>
}

function Contact() {
  const { search } = useLocation()
  const service = new URLSearchParams(search).get('service')?.trim()
  const message = service === 'House Construction'
    ? 'Hello AR CONSTRUCTION, I am interested in house construction in Hyderabad. Please contact me to discuss the details.'
    : `Hello AR CONSTRUCTION, I am interested in ${service || 'civil construction or interior design'} in Hyderabad. Please contact me to discuss the details.`
  return <>
    <PageIntro kicker="CONTACT" title={<>Tell us what you’re <em>imagining.</em></>} text="Start a conversation directly on WhatsApp about civil construction or interior design in Hyderabad, Telangana."/>
    <section className="contact-layout section-pad">
      <div className="contact-aside"><span className="eyebrow">DIRECT CONTACT</span><h2>Good things begin with a <em>hello.</em></h2><p>Share your project details in a WhatsApp conversation when you choose to open it. This website does not collect or store enquiry details.</p><div className="contact-info"><span>BASED IN</span><strong>Hyderabad, Telangana, India</strong></div><div className="contact-info"><span>EMAIL</span><a href="mailto:Rafi25524@gmail.com">Rafi25524@gmail.com</a></div></div>
      <div className="contact-form whatsapp-contact"><span className="eyebrow">NO WEBSITE FORM</span><h2>Your details stay with you until you choose to send them.</h2><p>Opening WhatsApp will prepare a message for AR CONSTRUCTION. You can review, edit or cancel it before sending.</p><WhatsAppAction className="button button-dark" label="Continue to WhatsApp" message={message}/></div>
    </section>
  </>
}

export default function App() {
  const location = useLocation()
  return <><Header/><AnimatePresence mode="wait"><motion.main key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}><Routes>
    <Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/><Route path="/house-construction" element={<HouseConstruction/>}/><Route path="/services" element={<Services/>}/><Route path="/services/:slug" element={<Services/>}/><Route path="/projects" element={<Projects/>}/><Route path="/projects/:slug" element={<ProjectDetail/>}/><Route path="/process" element={<Process/>}/><Route path="/contact" element={<Contact/>}/><Route path="*" element={<PageIntro kicker="404" title={<>This page is <em>still taking shape.</em></>} text="The page you’re looking for isn’t here. Head home and explore the site."/>}/>
  </Routes></motion.main></AnimatePresence><Footer/></>
}
