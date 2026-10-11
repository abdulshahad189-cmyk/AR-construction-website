// Set this to the business number with country code and digits only.
export const BUSINESS_WHATSAPP_NUMBER = '919849939180'

export function createWhatsAppUrl(number: string, message: string): string | null {
  if (!/^\d{8,15}$/.test(number)) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function whatsappHref(message: string): string | null {
  return createWhatsAppUrl(BUSINESS_WHATSAPP_NUMBER, message)
}
