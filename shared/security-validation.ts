export function isAllowedProjectImage(mime: string, size: number): boolean {
  return ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(mime) && size > 0 && size <= 8 * 1024 * 1024
}

export function isValidTurnstileAssertion(value: { success?: boolean; hostname?: string; action?: string }, expectedHostname: string): boolean {
  return value.success === true && value.hostname === expectedHostname && value.action === 'enquiry'
}

export function isValidPublicPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '').length
  return digits >= 7 && digits <= 20 && value.length <= 30 && /^[+\d\s().-]+$/.test(value)
}
