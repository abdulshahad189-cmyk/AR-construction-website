import { describe, expect, it } from 'vitest'
import { isHttpUrl, slugifyProjectTitle, validateEnquiry, validateProjectDraft } from '../../shared/validation'
import { isAllowedProjectImage, isValidPublicPhone, isValidTurnstileAssertion } from '../../shared/security-validation'

const enquiry = { full_name: 'Asha Rao', phone: '+91 98765 43210', email: 'asha@example.com', project_type: 'Residential', message: 'We are planning a new home.', consent: true, preferred_contact_method: 'Phone' }

describe('enquiry validation', () => {
  it('accepts a complete valid enquiry', () => expect(validateEnquiry(enquiry)).toBeNull())
  it('rejects invalid phone, email, consent, and short message', () => {
    expect(validateEnquiry({ ...enquiry, phone: '12' })).toContain('phone')
    expect(validateEnquiry({ ...enquiry, email: 'nope' })).toContain('email')
    expect(validateEnquiry({ ...enquiry, consent: false })).toContain('consent')
    expect(validateEnquiry({ ...enquiry, message: 'Hi' })).toContain('description')
  })
})

describe('project validation', () => {
  it('creates stable URL slugs', () => expect(slugifyProjectTitle('Courtyard House — Hyderabad')).toBe('courtyard-house-hyderabad'))
  it('rejects a malformed slug and incomplete summary', () => {
    expect(validateProjectDraft({ title: 'A project', slug: 'Bad Slug', category: 'Homes', summary: 'A good home', description: '' })).toContain('slug')
    expect(validateProjectDraft({ title: 'A project', slug: 'a-project', category: 'Homes', summary: 'No', description: '' })).toContain('summary')
  })
})

describe('public URL validation', () => {
  it('allows only absolute HTTP(S) URLs', () => {
    expect(isHttpUrl('https://example.com/profile')).toBe(true)
    expect(isHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpUrl('/profile')).toBe(false)
  })
})

describe('trusted submission checks', () => {
  it('accepts only a successful Turnstile response for this hostname and action', () => {
    expect(isValidTurnstileAssertion({ success: true, hostname: 'ar.example', action: 'enquiry' }, 'ar.example')).toBe(true)
    expect(isValidTurnstileAssertion({ success: true, hostname: 'other.example', action: 'enquiry' }, 'ar.example')).toBe(false)
    expect(isValidTurnstileAssertion({ success: true, hostname: 'ar.example', action: 'login' }, 'ar.example')).toBe(false)
  })
  it('allows only image types and sizes accepted by Storage', () => {
    expect(isAllowedProjectImage('image/webp', 1024)).toBe(true)
    expect(isAllowedProjectImage('image/svg+xml', 1024)).toBe(false)
    expect(isAllowedProjectImage('image/png', 9 * 1024 * 1024)).toBe(false)
  })
  it('validates public phone links before rendering them', () => {
    expect(isValidPublicPhone('+91 98765 43210')).toBe(true)
    expect(isValidPublicPhone('abc<script>')).toBe(false)
  })
})
