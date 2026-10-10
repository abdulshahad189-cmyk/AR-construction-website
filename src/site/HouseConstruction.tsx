import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown } from 'lucide-react'
import { estimateConstructionStartingPrice, HOUSE_CONSTRUCTION_BUDGET_RANGES, HOUSE_CONSTRUCTION_STAGES, validateHouseConstructionEnquiry } from '../../shared/validation'
import { errorMessage, publicSiteSettings, saveSiteSettings, submitEnquiry, supabase, type SiteSettings } from './backend'
import { responsiveImageSrcSet } from './data'
import { TurnstileControl } from './TurnstileControl'
import { defaultHouseConstructionPackage, isHouseConstructionPackage, parseHouseConstructionPackage, type HouseConstructionPackage, type PackageStatus } from './house-construction-data'
import './house-construction.css'

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const sectionMotion = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .12 }, transition: { duration: .55 } }
const projectStages = [...HOUSE_CONSTRUCTION_STAGES]
const budgetRanges = HOUSE_CONSTRUCTION_BUDGET_RANGES
const floorOptions = Array.from({ length: 10 }, (_, index) => index + 1)
const requirementsLabel = 'Describe your requirements (minimum 10 characters)'

function useConstructionPackage() {
  const [config, setConfig] = useState<HouseConstructionPackage>(defaultHouseConstructionPackage)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let live = true
    const load = () => publicSiteSettings().then(value => {
      if (!live) return
      setSettings(value)
      setConfig(isHouseConstructionPackage(value?.house_construction_package) ? value.house_construction_package : defaultHouseConstructionPackage)
      setError('')
    }).catch(e => { if (live) setError(errorMessage(e)) })
    void load()
    const refresh = () => { void load() }
    window.addEventListener('ar-settings-updated', refresh)
    return () => {
      live = false
      window.removeEventListener('ar-settings-updated', refresh)
    }
  }, [])
  return { config, settings, error }
}

function SeoMetadata() {
  useEffect(() => {
    const title = 'House Construction in Hyderabad from ₹1,750/sq. ft. | AR CONSTRUCTION'
    const description = 'Explore house construction in Hyderabad with AR CONSTRUCTION. Review the process, scope checklist and indicative starting-price estimator, then request a written quotation.'
    const priorTitle = document.title
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const created = !meta
    const descriptionMeta = meta ?? document.createElement('meta')
    if (created) {
      descriptionMeta.name = 'description'
      document.head.append(descriptionMeta)
    }
    const priorDescription = descriptionMeta.content
    document.title = title
    descriptionMeta.content = description
    return () => {
      document.title = priorTitle
      if (created) descriptionMeta.remove()
      else descriptionMeta.content = priorDescription
    }
  }, [])
  return null
}

export default function HouseConstruction() {
  const { config, error: settingsError } = useConstructionPackage()
  const reduce = useReducedMotion()
  const sectionAnimation = reduce ? { initial: false, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .12 }, transition: { duration: 0 } } : sectionMotion
  const relatedServices: [string, string, number, string, string][] = [
    ['Modular kitchens', '/images/projects/interiors/modular-kitchen-installation.jpg', 1600, 'Installed L-shaped kitchen cabinetry; project details are unconfirmed.', '/contact?service=Interior%20Design'],
    ['Bedroom wardrobes', '/images/projects/aluminium/aluminium-framed-storage.jpg', 1200, 'Framed wardrobe and storage installation; project details are unconfirmed.', '/contact?service=Interior%20Design'],
    ['TV units', '/images/projects/woodwork/tv-unit-and-wood-panel.jpg', 1600, 'TV unit with wood panel and storage; project details are unconfirmed.', '/contact?service=Interior%20Design'],
    ['Aluminium works', '/images/projects/aluminium/aluminium-framed-wardrobe.jpg', 1080, 'Aluminium-framed wardrobe installation; project details are unconfirmed.', '/services/aluminium-works'],
    ['Interior design', '/images/projects/interiors/kitchen-cabinetry-installation.jpg', 736, 'Kitchen cabinetry during installation; project details are unconfirmed.', '/contact?service=Interior%20Design'],
    ['Woodwork', '/images/projects/woodwork/wood-tv-wall-installation.jpg', 1600, 'Wood-panel TV wall and storage installation; project details are unconfirmed.', '/contact?service=Interior%20Design'],
  ]
  return <>
    <SeoMetadata/>
    <section className="house-hero">
      <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=84" alt="Architectural reference image of a contemporary home; not a completed AR CONSTRUCTION project" fetchPriority="high"/>
      <div className="house-hero-shade"/>
      <div className="house-hero-content">
        <motion.span className="eyebrow" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>HOUSE CONSTRUCTION · HYDERABAD, TELANGANA</motion.span>
        <motion.h1 initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>Build Your Dream Home.<br/><em>With Clarity.</em></motion.h1>
        <p>{config.description}</p>
        <div className="house-rate" aria-label={`House construction starting at ${money.format(config.startingRate)} per square foot`}>
          <span>HOUSE CONSTRUCTION WITH MATERIALS · STARTING AT</span>
          <strong>{money.format(config.startingRate)}<small>/ sq. ft.</small></strong>
          <small className="house-rate-note">Material scope and specifications to be confirmed in your written quotation.</small>
        </div>
        <div className="house-hero-actions">
          <a className="button button-light" href="#quote-form">Request a Quote <ArrowUpRight size={16}/></a>
          <a className="text-button light-text" href="#package-scope">View What’s Included <ArrowDown size={15}/></a>
        </div>
        <span className="house-image-credit">ARCHITECTURAL REFERENCE IMAGE · NOT AN AR CONSTRUCTION PROJECT</span>
      </div>
    </section>

    {settingsError && <p className="house-settings-warning" role="status">We could not load the latest published package details. The page is showing its unconfirmed draft defaults. {settingsError}</p>}

    <section className="house-intro section-pad">
      <motion.div {...sectionAnimation}><span className="eyebrow">A CLEARER WAY TO BUILD</span><h2>Understand the scope<br/><em>before work begins.</em></h2></motion.div>
      <motion.div {...sectionAnimation}><p>Start with your plot, your plans and the way you want to live. We’ll use the conversation and site context to prepare a written quotation for your review.</p><p className="house-muted">The starting rate is indicative only. No construction item, finish, approval or additional service is represented as included until confirmed in your written quotation.</p></motion.div>
    </section>

    <section className="house-site-photo section-pad">
      <img src="/images/projects/civil/construction-site-scaffolding.jpg" srcSet={responsiveImageSrcSet('/images/projects/civil/construction-site-scaffolding.jpg', 590)} sizes="(max-width: 680px) 85vw, 38vw" alt="Multi-storey building exterior behind construction scaffolding; the shared photo has no confirmed location, scope or project status." loading="lazy"/>
      <div><span className="eyebrow">CIVIL CONSTRUCTION WORK</span><h2>A construction-site photo.<br/><em>Project details unconfirmed.</em></h2><p>This image was selected from the civil-work archive. Its location, scope and project status have not been supplied, so it is not presented as a completed house-construction project.</p><span className="house-archive-label">COMPANY-SHARED PHOTO · STATUS & LOCATION NOT PROVIDED</span></div>
    </section>

    <section className="house-process section-pad">
      <div className="house-section-heading"><span className="eyebrow">THE JOURNEY</span><h2>From first conversation<br/><em>to handover.</em></h2><p>Each step is discussed and recorded with you. Timing, scope and milestones are confirmed in the written quotation and agreement.</p></div>
      <div className="house-process-grid">
        {[
          ['01', 'Consultation', 'Share your requirements, priorities and questions.'],
          ['02', 'Planning', 'Discuss your proposed home and the information needed to scope it.'],
          ['03', 'Site assessment', 'Review the site context and conditions relevant to a quotation.'],
          ['04', 'Quotation', 'Review the proposed scope, specifications, price and applicable terms.'],
          ['05', 'Agreement', 'Proceed only after both parties agree to the documented scope and terms.'],
          ['06', 'Construction', 'Coordinate work against the agreed specification and project documents.'],
          ['07', 'Handover', 'Review the completed agreed work and the handover details.'],
        ].map(step => <motion.article key={step[0]} {...sectionAnimation}><span>{step[0]}</span><div><h3>{step[1]}</h3><p>{step[2]}</p></div></motion.article>)}
      </div>
    </section>

    <section className="house-scope section-pad" id="package-scope">
      <div className="house-section-heading"><span className="eyebrow">SCOPE REVIEW</span><h2>What’s included?<br/><em>Confirm it in writing.</em></h2><p>These are draft checklist items, not package promises. Every item needs an agreed status and specification in your written quotation.</p></div>
      <div className="house-scope-panels">
        <ScopeList title="Construction work to review" items={config.scopeItems}/>
        <ScopeList title="Potential separately quoted items to review" items={config.separatelyQuotedCandidates}/>
      </div>
      <p className="house-scope-note"><Check size={16}/> “Included” or “excluded” appears only when confirmed by AR CONSTRUCTION in the published package. Draft items remain “To be confirmed in the written quotation.”</p>
    </section>

    <section className="house-estimator section-pad" aria-labelledby="house-estimator-title">
      <div><span className="eyebrow">INDICATIVE PRICE CHECK</span><h2 id="house-estimator-title">A useful first number.<br/><em>Not a final quote.</em></h2><p>Enter the proposed built-up area in square feet. The estimate uses only the published starting rate; it does not determine chargeable area or confirm package inclusions.</p><p className="house-muted">Actual pricing depends on agreed scope, material specifications, site conditions, chargeable area and applicable taxes. GST, approvals, design fees and other extras are not assumed included.</p></div>
      <PriceEstimator rate={config.startingRate}/>
    </section>

    <section className="house-quality section-pad">
      <div><span className="eyebrow">QUALITY & SPECIFICATIONS</span><h2>Clear specifications.<br/><em>Considered together.</em></h2></div>
      <div>{config.qualityNotes.map((note, index) => <p key={`${index}-${note}`}>{note}</p>)}<p>Confirm product names, grades, makes, finish selections, workmanship standards and any applicable warranty explicitly before accepting a quotation.</p></div>
    </section>

    <section className="house-terms section-pad">
      <div className="house-section-heading"><span className="eyebrow">COMMERCIAL TERMS</span><h2>Agree the details<br/><em>before you begin.</em></h2><p>Payment milestones, schedule and contractual conditions have not been approved as standard terms. Ask for the project-specific terms in writing.</p></div>
      <div className="house-terms-columns"><article><h3>Payment milestones</h3>{config.paymentMilestones.map((term, index) => <p key={`${index}-${term}`}>{term}</p>)}</article><article><h3>Pricing notes & terms</h3>{config.terms.map((term, index) => <p key={`${index}-${term}`}>{term}</p>)}</article></div>
    </section>

    <section className="house-faq section-pad">
      <div><span className="eyebrow">COMMON QUESTIONS</span><h2>Good questions<br/><em>deserve clear answers.</em></h2></div>
      <div>{config.faqs.map((faq, index) => <details key={`${index}-${faq.question}`}><summary>{faq.question}<ChevronDown size={16}/></summary><p>{faq.answer}</p></details>)}</div>
    </section>

    <section className="house-quote section-pad" id="quote-form">
      <div className="house-quote-copy"><span className="eyebrow">REQUEST A QUOTATION</span><h2>Tell us about<br/><em>your home.</em></h2><p>Share your details and we’ll review your construction enquiry. A final quotation depends on discussing the project and confirming its scope.</p><p className="house-muted">Your details are used to respond to this enquiry and are visible only to authorized AR CONSTRUCTION administrators.</p></div>
      <HouseQuoteForm/>
    </section>

    <section className="house-related section-pad">
      <div className="house-section-heading"><span className="eyebrow">RELATED SERVICES</span><h2>Make room for<br/><em>the details.</em></h2><p>These services are not assumed to be part of the house construction starting rate. Request a separate scope and quotation.</p></div>
      <div className="house-related-grid">
        {relatedServices.map(([service, image, width, alt, destination]) => <Link to={destination} key={service} className="house-related-card">
          <img src={image} srcSet={responsiveImageSrcSet(image, width)} sizes="(max-width: 680px) 44vw, (max-width: 1000px) 30vw, 24vw" alt={alt} loading="lazy"/>
          <span className="house-related-card-title">{service}<ArrowUpRight size={16}/></span>
          <small>Archive photo · details unconfirmed</small>
        </Link>)}
      </div>
      <Link className="text-button" to="/services">Explore all services <ArrowRight size={16}/></Link>
    </section>
  </>
}

function ScopeList({ title, items }: { title: string; items: HouseConstructionPackage['scopeItems'] }) {
  return <article className="house-scope-panel"><h3>{title}</h3><ul>{items.map(({ item, status }) => <li key={item}><span>{item}</span><StatusLabel status={status}/></li>)}</ul></article>
}

function StatusLabel({ status }: { status: PackageStatus }) {
  const label = status === 'included' ? 'Included' : status === 'excluded' ? 'Excluded' : 'To be confirmed in the written quotation'
  return <span className={`package-status ${status === 'to_confirm' ? 'unconfirmed' : ''}`}>{label}</span>
}

function PriceEstimator({ rate }: { rate: number }) {
  const [area, setArea] = useState('')
  const value = area.trim() === '' ? null : Number(area)
  const estimate = value === null ? null : estimateConstructionStartingPrice(value, rate)
  const invalid = area.trim() !== '' && estimate === null
  return <div className="house-estimator-card">
    <label htmlFor="built-up-area">Proposed built-up area (sq. ft.)</label>
    <input id="built-up-area" type="number" min="1" max="100000" step="0.01" inputMode="decimal" value={area} onChange={event => setArea(event.target.value)} placeholder="e.g. 1500" aria-invalid={invalid} aria-describedby={invalid ? 'house-area-error' : 'house-estimate-help'}/>
    {invalid && <p id="house-area-error" className="form-error" role="alert">Enter an area greater than 0 and no more than 100,000 sq. ft.</p>}
    {estimate !== null ? <div className="house-estimate-result" aria-live="polite"><span>Indicative starting amount</span><strong>{money.format(estimate)}</strong><small>{value?.toLocaleString('en-IN')} sq. ft. × {money.format(rate)}/sq. ft.</small></div> : !invalid && <p id="house-estimate-help" className="house-muted">Enter an area to view an indicative starting amount.</p>}
    <p className="house-estimate-disclaimer">Estimate only; not a binding quotation. Scope, specifications, site conditions, chargeable area and applicable taxes may change the final price.</p>
    <a href="#quote-form" className="text-button">Discuss your estimate <ArrowRight size={15}/></a>
  </div>
}

function HouseQuoteForm() {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
  const canSubmit = Boolean(siteKey && supabase && import.meta.env.VITE_ENQUIRY_ENABLED === 'true')
  const [captcha, setCaptcha] = useState('')
  const [captchaEpoch, setCaptchaEpoch] = useState(0)
  const [submissionToken] = useState(() => crypto.randomUUID())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (busy || done) return
    if (!canSubmit) {
      setError('Online quotations are temporarily unavailable while the secure enquiry service is being configured.')
      return
    }
    if (!captcha) {
      setError('Complete the security check before sending your request.')
      return
    }
    const form = event.currentTarget
    const fields = new FormData(form)
    const consent = fields.get('consent') === 'on'
    const values = {
      full_name: String(fields.get('full_name') ?? '').trim(),
      phone: String(fields.get('phone') ?? '').trim(),
      construction_locality: String(fields.get('construction_locality') ?? '').trim(),
      plot_area: Number(fields.get('plot_area')),
      built_up_area: Number(fields.get('built_up_area')),
      floors: Number(fields.get('floors')),
      project_stage: String(fields.get('project_stage') ?? ''),
      budget_range: String(fields.get('budget_range') ?? ''),
      message: String(fields.get('message') ?? '').trim(),
      consent,
    }
    const validationError = validateHouseConstructionEnquiry(values)
    if (validationError) {
      setError(validationError)
      return
    }
    setBusy(true)
    try {
      await submitEnquiry({
        ...values,
        project_type: 'House Construction',
        project_location: values.construction_locality,
        construction_plot_area: values.plot_area,
        construction_built_up_area: values.built_up_area,
        construction_floors: values.floors,
        construction_stage: values.project_stage,
        preferred_contact_method: 'Phone',
        submission_token: submissionToken,
        turnstile_token: captcha,
      })
      setDone(true)
      setMessage('Your construction enquiry has been received. Our team will review it and follow up.')
      form.reset()
    } catch (submitError) {
      setError(errorMessage(submitError))
      setCaptcha('')
      setCaptchaEpoch(value => value + 1)
    } finally {
      setBusy(false)
    }
  }

  return <form className="house-quote-form" onSubmit={handleSubmit} noValidate>
    <div className="house-form-row"><label>Full name<input name="full_name" autoComplete="name" minLength={2} maxLength={140} required/></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={30} required/></label></div>
    <label>Construction locality<input name="construction_locality" autoComplete="address-level2" maxLength={240} required placeholder="Area or locality in/around Hyderabad"/></label>
    <div className="house-form-row"><label>Plot area (sq. ft.)<input name="plot_area" type="number" min="1" max="100000" step="0.01" inputMode="decimal" required/></label><label>Proposed built-up area (sq. ft.)<input name="built_up_area" type="number" min="1" max="100000" step="0.01" inputMode="decimal" required/></label></div>
    <div className="house-form-row"><label>Number of floors<select name="floors" defaultValue="" required><option value="" disabled>Select floors</option>{floorOptions.map(floor => <option value={floor} key={floor}>{floor}</option>)}</select></label><label>Project stage<select name="project_stage" defaultValue="" required><option value="" disabled>Select stage</option>{projectStages.map(stage => <option value={stage} key={stage}>{stage}</option>)}</select></label></div>
    <label>Estimated budget<select name="budget_range" defaultValue="" required><option value="" disabled>Select budget</option>{budgetRanges.map(range => <option key={range}>{range}</option>)}</select></label>
    <label>{requirementsLabel}<textarea name="message" rows={4} minLength={10} maxLength={6000} required placeholder="Tell us what you’re planning and what matters most."/></label>
    <label className="house-consent"><input name="consent" type="checkbox" required/><span>I agree that AR CONSTRUCTION may contact me about this house construction enquiry. See the <Link to="/contact">contact and privacy information</Link>.</span></label>
    <TurnstileControl key={captchaEpoch} siteKey={canSubmit ? siteKey ?? '' : ''} onToken={setCaptcha}/>
    {!canSubmit && <p className="form-error">Secure online enquiries are disabled until Supabase, CAPTCHA and the server-side function are configured and verified.</p>}
    <button className="button button-dark" disabled={busy || done || !canSubmit}>{busy ? 'Sending…' : done ? 'Request sent' : 'Request a written quote'} <ArrowRight size={16}/></button>
    {error && <p className="form-error" role="alert">{error}</p>}
    {message && <p className="form-success" role="status">{message}</p>}
    <p className="form-small">We store your enquiry securely and make it available only to authorized administrators.</p>
  </form>
}

export function HousePackageSettings() {
  const [initial, setInitial] = useState<HouseConstructionPackage>(defaultHouseConstructionPackage)
  const [text, setText] = useState(() => JSON.stringify(defaultHouseConstructionPackage, null, 2))
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const dirty = text !== JSON.stringify(initial, null, 2)
  useEffect(() => {
    let live = true
    publicSiteSettings().then(value => {
      if (!live || !isHouseConstructionPackage(value?.house_construction_package)) return
      setInitial(value.house_construction_package)
      setText(JSON.stringify(value.house_construction_package, null, 2))
    }).catch(e => { if (live) setNotice(errorMessage(e)) }).finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  }, [])
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('')
    let packageValue: HouseConstructionPackage
    try {
      packageValue = parseHouseConstructionPackage(text)
    } catch (e) {
      setNotice(errorMessage(e))
      return
    }
    setBusy(true)
    try {
      await saveSiteSettings({ house_construction_package: packageValue })
      setInitial(packageValue)
      setText(JSON.stringify(packageValue, null, 2))
      window.dispatchEvent(new Event('ar-settings-updated'))
      setNotice('House construction package settings saved.')
    } catch (e) {
      setNotice(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  return <form className="dash-panel house-package-editor" onSubmit={save}>
    <div className="panel-heading"><div><span className="eyebrow">HOUSE CONSTRUCTION</span><h2>Rate, scope, FAQs & terms</h2></div><span className={dirty ? 'dirty-state' : 'saved-state'}>{dirty ? 'Unsaved changes' : 'All changes saved'}</span></div>
    <p>Edit the structured package JSON below. All changes are public and should be saved only after commercial approval. Status values may be <code>to_confirm</code>, <code>included</code> or <code>excluded</code>.</p>
    <label>Package settings JSON<textarea aria-label="House construction package settings JSON" rows={24} spellCheck={false} value={text} onChange={event => setText(event.target.value)}/></label>
    {notice && <p className={notice.includes('saved') ? 'form-success' : 'form-error'} role="status">{notice}</p>}
    <button className="button button-dark" disabled={busy || loading || !dirty}>{loading ? 'Loading package…' : busy ? 'Saving…' : 'Save house construction package'}</button>
  </form>
}
