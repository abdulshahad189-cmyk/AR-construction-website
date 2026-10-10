import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isAllowedProjectImage } from '../../shared/security-validation'
import type { HouseConstructionPackage } from './house-construction-data'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null

export type Project = {
  id: string; title: string; slug: string; category: string; summary: string; description: string
  location: string | null; scope_of_work: string | null; status: string | null; completion_date: string | null
  cover_image_path: string | null; cover_image_url?: string | null; published: boolean; featured: boolean
}

export type ProjectImage = { id: string; project_id: string; storage_path: string; alt_text: string; sort_order: number; signed_url?: string | null }
export type SiteSettings = { id:number; business_name:string; tagline:string; phone:string|null; email:string|null; whatsapp_phone:string|null; business_address:string|null; service_areas:string[]; social_links:Record<string,string>; company_intro:string; service_descriptions:Record<string,string>; house_construction_package:HouseConstructionPackage; updated_at:string }
let settingsCache:SiteSettings|null|undefined
let settingsRequest:Promise<SiteSettings|null>|undefined

export async function publicSiteSettings(): Promise<SiteSettings | null> {
  if(!supabase)return null
  if(settingsCache!==undefined)return settingsCache
  if(!settingsRequest)settingsRequest=Promise.resolve(supabase.from('site_settings').select('id,business_name,tagline,phone,email,whatsapp_phone,business_address,service_areas,social_links,company_intro,service_descriptions,house_construction_package,updated_at').eq('id',1).maybeSingle()).then(({data,error})=>{if(error)throw error;settingsCache=data as SiteSettings|null;return settingsCache}).finally(()=>{settingsRequest=undefined})
  return await settingsRequest
}

export async function saveSiteSettings(settings: Partial<Omit<SiteSettings,'id'|'updated_at'>>) {
  if(!supabase)throw new Error('Supabase is not configured.')
  const {error}=await supabase.from('site_settings').update(settings).eq('id',1)
  if(error)throw error
  settingsCache=undefined
}

export async function uploadProjectImage(file:File,projectId:string,onProgress:(value:number)=>void):Promise<string>{
  if(!isAllowedProjectImage(file.type,file.size))throw new Error('Use a JPG, PNG, WebP or AVIF image under 8 MB.')
  if(!supabase)throw new Error('Supabase is not configured.')
  const {data:{session}}=await supabase.auth.getSession()
  if(!session)throw new Error('Your admin session expired. Sign in again before uploading.')
  const safeName=file.name.toLowerCase().replace(/[^a-z0-9.-]/g,'-').slice(-100)
  const path=`${projectId}/${crypto.randomUUID()}-${safeName}`
  const url=`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/project-media/${path.split('/').map(encodeURIComponent).join('/')}`
  await new Promise<void>((resolve,reject)=>{const xhr=new XMLHttpRequest();xhr.open('POST',url);xhr.setRequestHeader('Authorization',`Bearer ${session.access_token}`);xhr.setRequestHeader('apikey',import.meta.env.VITE_SUPABASE_ANON_KEY as string);xhr.setRequestHeader('Content-Type',file.type);xhr.setRequestHeader('x-upsert','false');xhr.upload.onprogress=e=>{if(e.lengthComputable)onProgress(Math.round(e.loaded/e.total*100))};xhr.onerror=()=>reject(new Error('Image upload failed. Check your connection and try again.'));xhr.onload=()=>{if(xhr.status>=200&&xhr.status<300){onProgress(100);resolve()}else reject(new Error(xhr.status===401||xhr.status===403?'Upload permission denied. Confirm your admin role.':`Image upload failed (${xhr.status}).`))};xhr.send(file)})
  return path
}

export async function publicProjects(): Promise<Project[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('projects').select('*').eq('published', true).order('sort_order').order('created_at', { ascending: false }).limit(60)
  if (error) throw error
  return Promise.all(((data ?? []) as Project[]).map(async project => ({ ...project, cover_image_url: await signedImageUrl(project.cover_image_path) })))
}

export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https:\/\//.test(path)) return path
  return supabase?.storage.from('project-media').getPublicUrl(path).data.publicUrl ?? null
}

export async function signedImageUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null
  if (/^https:\/\//.test(path)) return path
  if (!supabase) return null
  const { data, error } = await supabase.storage.from('project-media').createSignedUrl(path, 3600)
  if (error) return null
  return data.signedUrl
}

export async function projectGallery(projectId: string): Promise<ProjectImage[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('project_images').select('id,project_id,storage_path,alt_text,sort_order').eq('project_id', projectId).order('sort_order')
  if (error) throw error
  return Promise.all(((data ?? []) as ProjectImage[]).map(async image => ({ ...image, signed_url: await signedImageUrl(image.storage_path) })))
}

export function imageUrlForStored(path: string | null | undefined): string | null { return imageUrl(path) }

export async function submitEnquiry(values: Record<string, unknown> & { turnstile_token: string; submission_token: string }) {
  if (!supabase) throw new Error('The enquiry service is not configured. Please contact the company through its verified contact details.')
  const { data, error } = await supabase.functions.invoke('submit-enquiry', { body: values })
  if (error) throw new Error('We could not send your enquiry. Please retry after the security check.')
  if (!data?.received) throw new Error('The enquiry was not confirmed as stored. Please try again.')
}

export function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'Something went wrong. Please try again.' }
