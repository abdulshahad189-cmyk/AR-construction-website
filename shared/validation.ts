export type EnquiryValues = {
  full_name: string; phone: string; email: string | null; project_type: string;
  message: string; consent: boolean; preferred_contact_method: string;
}

export const HOUSE_CONSTRUCTION_STAGES = [
  'Exploring options',
  'Plot available',
  'Design and planning',
  'Approvals in progress',
  'Ready to build',
] as const

export const HOUSE_CONSTRUCTION_BUDGET_RANGES = [
  'Under ₹25 lakh',
  '₹25–50 lakh',
  '₹50 lakh–₹1 crore',
  '₹1–2 crore',
  'Above ₹2 crore',
  'To be discussed',
] as const

export type HouseConstructionEnquiryValues = {
  full_name: string
  phone: string
  construction_locality: string
  plot_area: number
  built_up_area: number
  floors: number
  project_stage: string
  budget_range: string
  message: string
  consent: boolean
}

export const MAX_CONSTRUCTION_AREA_SQ_FT = 100_000

export function estimateConstructionStartingPrice(area: number, rate = 1750): number | null {
  if (!Number.isFinite(area) || area <= 0 || area > MAX_CONSTRUCTION_AREA_SQ_FT ||
      Number(area.toFixed(2)) !== area || !Number.isFinite(rate) || rate <= 0) return null
  const amount = area * rate
  return Number.isSafeInteger(amount) ? amount : null
}

export function validateHouseConstructionEnquiry(value: HouseConstructionEnquiryValues): string | null {
  if (value.full_name.trim().length < 2 || value.full_name.length > 140) return 'Enter your name (2–140 characters).'
  const phoneDigits = value.phone.replace(/\D/g, '').length
  if (phoneDigits < 7 || phoneDigits > 20 || value.phone.length > 30) return 'Enter a valid phone number.'
  if (!value.construction_locality.trim() || value.construction_locality.length > 240) return 'Enter the construction locality (up to 240 characters).'
  if (!Number.isFinite(value.plot_area) || value.plot_area <= 0 || value.plot_area > MAX_CONSTRUCTION_AREA_SQ_FT || Number(value.plot_area.toFixed(2)) !== value.plot_area) return 'Enter a plot area between 1 and 100,000 sq. ft. with up to 2 decimal places.'
  if (!Number.isFinite(value.built_up_area) || value.built_up_area <= 0 || value.built_up_area > MAX_CONSTRUCTION_AREA_SQ_FT || Number(value.built_up_area.toFixed(2)) !== value.built_up_area) return 'Enter a built-up area between 1 and 100,000 sq. ft. with up to 2 decimal places.'
  if (!Number.isInteger(value.floors) || value.floors < 1 || value.floors > 20) return 'Enter a whole number of floors between 1 and 20.'
  if (!(HOUSE_CONSTRUCTION_STAGES as readonly string[]).includes(value.project_stage)) return 'Choose the current project stage.'
  if (!(HOUSE_CONSTRUCTION_BUDGET_RANGES as readonly string[]).includes(value.budget_range)) return 'Choose an estimated budget or select “To be discussed”.'
  if (value.message.trim().length < 10 || value.message.length > 6000) return 'Requirements must be between 10 and 6,000 characters.'
  if (!value.consent) return 'Please consent to being contacted about your enquiry.'
  return null
}

export function validateEnquiry(value: EnquiryValues): string | null {
  const digits = value.phone.replace(/\D/g, '').length
  if (value.full_name.trim().length < 2 || value.full_name.length > 140) return 'Enter your name (2–140 characters).'
  if (digits < 7 || digits > 20 || value.phone.length > 30) return 'Enter a valid phone number.'
  if (value.email && (value.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))) return 'Enter a valid email address or leave it blank.'
  if (value.project_type.trim().length < 2 || value.project_type.length > 100) return 'Choose a project category.'
  if (value.message.trim().length < 10 || value.message.length > 6000) return 'Project description must be between 10 and 6,000 characters.'
  if (!value.consent) return 'Please consent to being contacted about your enquiry.'
  if (!['Phone', 'Email', 'WhatsApp'].includes(value.preferred_contact_method)) return 'Choose a valid contact method.'
  return null
}

export function slugifyProjectTitle(title: string): string {
  return title.toLowerCase().trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function validateProjectDraft(value: { title: string; slug: string; category: string; summary: string; description: string }): string | null {
  if (value.title.trim().length < 2 || value.title.length > 160) return 'Project title must be 2–160 characters.'
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)) return 'Use a lowercase URL slug with letters, numbers and single hyphens.'
  if (value.category.trim().length < 2 || value.category.length > 80) return 'Project category must be 2–80 characters.'
  if (value.summary.trim().length < 5 || value.summary.length > 400) return 'Project summary must be 5–400 characters.'
  if (value.description.length > 12000) return 'Project description must be at most 12,000 characters.'
  return null
}

export function isHttpUrl(value: string): boolean {
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' } catch { return false }
}
