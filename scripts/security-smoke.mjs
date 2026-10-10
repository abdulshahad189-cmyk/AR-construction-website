import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

if (process.env.TEST_ENVIRONMENT !== 'staging') {
  throw new Error('Safety stop: set TEST_ENVIRONMENT=staging only for a disposable staging Supabase project.')
}
const url = process.env.TEST_SUPABASE_URL
const anonKey = process.env.TEST_SUPABASE_ANON_KEY
const adminEmail = process.env.TEST_ADMIN_EMAIL
const adminPassword = process.env.TEST_ADMIN_PASSWORD
const viewerEmail = process.env.TEST_VIEWER_EMAIL
const viewerPassword = process.env.TEST_VIEWER_PASSWORD
if (![url, anonKey, adminEmail, adminPassword, viewerEmail, viewerPassword].every(Boolean)) {
  throw new Error('Set staging URL/key plus provisioned admin and non-admin test account variables; values are never printed.')
}

const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
const admin = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
const viewer = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
const assert = (condition, message) => { if (!condition) throw new Error(message); console.log(`PASS ${message}`) }
const slug = `security-smoke-${randomUUID()}`
let projectId
let coverPath

try {
  const { data: anonDrafts, error: draftReadError } = await anon.from('projects').select('id').eq('published', false).limit(1)
  assert(!draftReadError && anonDrafts.length === 0, 'anonymous user cannot read draft projects')
  const { data: privateRows, error: privateReadError } = await anon.from('enquiries').select('id,internal_notes').limit(1)
  assert(!privateReadError && privateRows.length === 0, 'anonymous user cannot read enquiries or internal notes')
  const projectInsert = await anon.from('projects').insert({ title: 'Unauthorized', slug, category: 'Residential', summary: 'Unauthorized test row' })
  assert(Boolean(projectInsert.error), 'anonymous project writes are rejected')
  const enquiryInsert = await anon.from('enquiries').insert({ full_name: 'Test Visitor', phone: '9876543210', project_type: 'Residential', message: 'This direct write must be blocked.', consent: true, preferred_contact_method: 'Phone', status: 'new', internal_notes: '' })
  assert(Boolean(enquiryInsert.error), 'direct anonymous enquiry table writes are rejected')

  const adminAuth = await admin.auth.signInWithPassword({ email: adminEmail, password: adminPassword })
  assert(!adminAuth.error, 'provisioned admin can sign in')
  const { data: adminProfile, error: profileError } = await admin.from('profiles').select('role').eq('id', adminAuth.data.user.id).maybeSingle()
  assert(!profileError && adminProfile?.role === 'admin', 'admin role is verified in the database profile')
  const { data: project, error: createError } = await admin.from('projects').insert({ title: 'Security Smoke Test', slug, category: 'Residential', summary: 'Temporary staging security check', description: 'Disposable row from the staging smoke test.' }).select('id').single()
  assert(!createError && Boolean(project?.id), 'authorized admin can create a draft project')
  projectId = project.id
  coverPath = `${projectId}/${randomUUID()}.png`
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j3ioAAAAASUVORK5CYII=', 'base64')
  const { error: uploadError } = await admin.storage.from('project-media').upload(coverPath, png, { contentType: 'image/png' })
  assert(!uploadError, 'authorized admin can upload project media')
  const { error: setCoverError } = await admin.from('projects').update({ cover_image_path: coverPath }).eq('id', projectId)
  assert(!setCoverError, 'admin can reference uploaded project cover')
  const { data: beforePublish } = await anon.from('projects').select('id').eq('id', projectId)
  assert(beforePublish?.length === 0, 'draft is not visible to anonymous visitors')
  const { error: privateImageError } = await anon.storage.from('project-media').createSignedUrl(coverPath, 60)
  assert(Boolean(privateImageError), 'anonymous visitors cannot sign draft project media')
  const { error: anonUploadError } = await anon.storage.from('project-media').upload(`${projectId}/anon.png`, png, { contentType: 'image/png' })
  assert(Boolean(anonUploadError), 'anonymous media uploads are rejected')
  const { error: publishError } = await admin.from('projects').update({ published: true }).eq('id', projectId)
  assert(!publishError, 'authorized admin can publish a project')
  const { data: published } = await anon.from('projects').select('id').eq('id', projectId)
  assert(published?.length === 1, 'anonymous visitors can read a published project')
  const { data: signedImage, error: signedImageError } = await anon.storage.from('project-media').createSignedUrl(coverPath, 60)
  assert(!signedImageError && Boolean(signedImage?.signedUrl), 'published project cover can be signed publicly')
  await admin.from('projects').update({ published: false }).eq('id', projectId)
  const { error: hiddenImageError } = await anon.storage.from('project-media').createSignedUrl(coverPath, 60)
  assert(Boolean(hiddenImageError), 'unpublished project cover stops being signable')

  const viewerAuth = await viewer.auth.signInWithPassword({ email: viewerEmail, password: viewerPassword })
  assert(!viewerAuth.error, 'non-admin staging user can sign in')
  const { data: viewerAdmin, error: viewerRoleError } = await viewer.rpc('is_admin')
  assert(!viewerRoleError && viewerAdmin === false, 'database authorization identifies the user as non-admin')
  const { error: viewerWriteError } = await viewer.from('projects').insert({ title: 'Viewer Write', slug: `${slug}-viewer`, category: 'Residential', summary: 'Must be rejected' })
  assert(Boolean(viewerWriteError), 'authenticated non-admin project writes are rejected')
  const { data: viewerEnquiries, error: viewerEnquiryError } = await viewer.from('enquiries').select('id,internal_notes').limit(1)
  assert(!viewerEnquiryError && viewerEnquiries.length === 0, 'authenticated non-admin cannot read customer enquiries')

  const { error: cleanupError } = await admin.from('projects').delete().eq('id', projectId)
  assert(!cleanupError, 'temporary staging project is cleaned up')
  projectId = undefined
  const { error: fileCleanupError } = await admin.storage.from('project-media').remove([coverPath])
  assert(!fileCleanupError, 'temporary staging image is cleaned up')
  coverPath = undefined
  await admin.auth.signOut()
  const { data: signedOut } = await admin.auth.getSession()
  assert(!signedOut.session, 'sign-out clears the local session')
} finally {
  if (projectId) { await admin.auth.signInWithPassword({ email: adminEmail, password: adminPassword }); await admin.from('projects').delete().eq('id', projectId) }
  if (coverPath) await admin.storage.from('project-media').remove([coverPath])
  await admin.auth.signOut()
  await viewer.auth.signOut()
}
