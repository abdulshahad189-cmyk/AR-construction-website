import { describe, expect, it } from 'vitest'
import { BUSINESS_WHATSAPP_NUMBER, createWhatsAppUrl, whatsappHref } from './whatsapp-config'

describe('WhatsApp click-to-chat URLs', () => {
  it('uses the configured business number and URL-encodes the suggested message', () => {
    const message = 'Hello AR CONSTRUCTION, I am interested in house construction in Hyderabad.'
    const href = whatsappHref(message)
    expect(href).not.toBeNull()
    expect(href).toBe(`https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`)
    const url = new URL(href!)
    expect(url.origin + url.pathname).toBe('https://wa.me/919849939180')
    expect(url.searchParams.get('text')).toBe(message)
  })

  it('has an active digits-only Indian business number', () => {
    expect(BUSINESS_WHATSAPP_NUMBER).toBe('919849939180')
    expect(createWhatsAppUrl(BUSINESS_WHATSAPP_NUMBER, 'Hello')).not.toBeNull()
  })

  it('rejects numbers without country code digits only', () => {
    for (const number of ['', '+919876543210', '91 98765 43210', '1234567', '1234567890123456']) {
      expect(createWhatsAppUrl(number, 'Hello')).toBeNull()
    }
  })
})
