import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0'
import { validateEnquiry, validateHouseConstructionEnquiry } from '../../../shared/validation.ts'
import { isValidTurnstileAssertion } from '../../../shared/security-validation.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('SITE_ORIGIN') ?? '',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
}
const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
const trim = (v: unknown, max: number) => typeof v === 'string' ? v.trim().slice(0, max) : ''

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') ?? ''
  const allowedOrigin = Deno.env.get('SITE_ORIGIN') ?? ''
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { ...corsHeaders, 'Access-Control-Allow-Origin': allowedOrigin } })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
  if (!allowedOrigin || origin !== allowedOrigin) return json({ error: 'origin_not_allowed' }, 403)
  const length = Number(req.headers.get('content-length') ?? '0')
  if (!Number.isFinite(length) || length > 12_000) return json({ error: 'request_too_large' }, 413)
  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) return json({ error: 'unsupported_content_type' }, 415)

  const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const rateSalt = Deno.env.get('ENQUIRY_RATE_LIMIT_SALT')
  if (!turnstileSecret || !serviceKey || !supabaseUrl || !rateSalt || !Deno.env.get('TURNSTILE_EXPECTED_HOSTNAME')) {
    return json({ error: 'enquiry_service_unavailable' }, 503)
  }

  let raw: string
  try { raw = await req.text() } catch { return json({ error: 'invalid_request' }, 400) }
  if (new TextEncoder().encode(raw).byteLength > 12_000) return json({ error: 'request_too_large' }, 413)
  let input: Record<string, unknown>
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return json({ error: 'invalid_json' }, 400)
    input = parsed as Record<string, unknown>
  } catch { return json({ error: 'invalid_json' }, 400) }
  const limits: Record<string, number> = { full_name: 140, phone: 30, email: 254, project_type: 100, project_location: 240, construction_locality: 240, project_stage: 40, budget_range: 100, expected_start_date: 10, message: 6000, preferred_contact_method: 20, submission_token: 36, turnstile_token: 2048 }
  for (const [field, limit] of Object.entries(limits)) {
    if (typeof input[field] === 'string' && (input[field] as string).length > limit) return json({ error: 'invalid_fields' }, 400)
  }

  const full_name = trim(input.full_name, 140)
  const phone = trim(input.phone, 30)
  const emailText = trim(input.email, 254)
  const project_type = trim(input.project_type, 100)
  const project_location = trim(input.project_location, 240)
  const budget_range = trim(input.budget_range, 100)
  const expected_start_date = trim(input.expected_start_date, 10)
  const message = trim(input.message, 6000)
  const preferred_contact_method = trim(input.preferred_contact_method, 20)
  const construction_locality = trim(input.construction_locality, 240)
  const construction_plot_area = typeof input.construction_plot_area === 'number' ? input.construction_plot_area : Number.NaN
  const construction_built_up_area = typeof input.construction_built_up_area === 'number' ? input.construction_built_up_area : Number.NaN
  const construction_floors = typeof input.construction_floors === 'number' ? input.construction_floors : Number.NaN
  const construction_stage = trim(input.construction_stage, 40)
  const consent = input.consent === true
  const token = trim(input.submission_token, 36)
  const captcha = trim(input.turnstile_token, 2048)
  const fieldError = validateEnquiry({ full_name, phone, email: emailText || null, project_type, message, consent, preferred_contact_method })
  const constructionError = project_type === 'House Construction'
    ? validateHouseConstructionEnquiry({
      full_name,
      phone,
      construction_locality,
      plot_area: construction_plot_area,
      built_up_area: construction_built_up_area,
      floors: construction_floors,
      project_stage: construction_stage,
      budget_range,
      message,
      consent,
    })
    : null
  const parsedDate = expected_start_date ? new Date(`${expected_start_date}T00:00:00.000Z`) : null
  const allowedTypes = ['Civil Construction', 'Homes & Villas', 'House Construction', 'Commercial Spaces', 'Interior Design', 'Aluminium Works', 'Renovation', 'Consultation', 'Other']
  if (fieldError || constructionError || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token) ||
      !allowedTypes.includes(project_type) || !captcha || (expected_start_date && (!/^\d{4}-\d{2}-\d{2}$/.test(expected_start_date) || !parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0,10) !== expected_start_date))) {
    return json({ error: 'invalid_fields' }, 400)
  }

  const forwarded = req.headers.get('x-forwarded-for')?.split(',').map(part=>part.trim()).filter(Boolean)
  const clientIp = req.headers.get('cf-connecting-ip') ?? forwarded?.at(-1)
  if (!clientIp) return json({ error: 'client_address_unavailable' }, 503)
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${rateSalt}:${clientIp}`))
  const ipHash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  let verification: Response
  try { verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: turnstileSecret, response: captcha, remoteip: clientIp }),
  }) } catch { return json({ error: 'captcha_verification_unavailable' }, 503) }
  if (!verification.ok) return json({ error: 'captcha_verification_unavailable' }, 503)
  let result: { success?: boolean; hostname?: string; action?: string }
  try { result = await verification.json() as typeof result } catch { return json({ error: 'captcha_verification_unavailable' }, 503) }
  if (!result.success || result.hostname !== Deno.env.get('TURNSTILE_EXPECTED_HOSTNAME') || result.action !== 'enquiry') {
    return json({ error: 'captcha_rejected' }, 400)
  }
  const now = new Date()
  const windowStarted = new Date(Math.floor(now.getTime() / 3_600_000) * 3_600_000).toISOString()
  const { data: allowed, error: limitError } = await supabase.rpc('consume_enquiry_rate_limit', {
    p_ip_hash: ipHash, p_window_started_at: windowStarted, p_limit: 5,
  })
  if (limitError) return json({ error: 'enquiry_service_unavailable' }, 503)
  if (!allowed) return json({ error: 'rate_limited' }, 429)

  const { error } = await supabase.from('enquiries').insert({
    full_name, phone, email: emailText || null, project_type,
    project_location: (project_type === 'House Construction' ? construction_locality : project_location) || null,
    budget_range: budget_range || null,
    expected_start_date: expected_start_date || null, message, preferred_contact_method,
    construction_plot_area: project_type === 'House Construction' ? construction_plot_area : null,
    construction_built_up_area: project_type === 'House Construction' ? construction_built_up_area : null,
    construction_floors: project_type === 'House Construction' ? construction_floors : null,
    construction_stage: project_type === 'House Construction' ? construction_stage : null,
    consent: true, status: 'new', internal_notes: '', submission_token: token,
  })
  if (error?.code === '23505') return json({ received: true }, 200)
  if (error) return json({ error: 'enquiry_storage_failed' }, 500)
  return json({ received: true }, 201)
})
