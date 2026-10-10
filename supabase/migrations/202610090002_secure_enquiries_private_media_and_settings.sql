-- Additive hardening for an existing AR CONSTRUCTION installation.
-- Does not drop customer/project data. Back up production before applying as usual.

alter table public.enquiries
  add column if not exists submission_token uuid;
create unique index if not exists enquiries_submission_token_uidx
  on public.enquiries(submission_token) where submission_token is not null;

alter table public.site_settings
  add column if not exists company_intro text not null default '',
  add column if not exists service_descriptions jsonb not null default '{}'::jsonb;
alter table public.site_settings
  add constraint site_settings_service_descriptions_object
  check (jsonb_typeof(service_descriptions) = 'object');

-- Enquiries can only be created through the trusted Edge Function. A public
-- browser client no longer receives a direct table write policy/grant.
drop policy if exists "Visitors submit enquiries" on public.enquiries;
revoke insert on public.enquiries from anon, authenticated;
grant insert on public.enquiries to service_role;

-- Atomic fixed-window limiter. Only service_role can invoke it; the Edge
-- Function passes an HMAC of the platform-provided client IP, never raw IP.
create table if not exists public.enquiry_rate_limits (
  ip_hash text not null check (ip_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count between 1 and 1000),
  primary key (ip_hash, window_started_at)
);
alter table public.enquiry_rate_limits enable row level security;
revoke all on public.enquiry_rate_limits from anon, authenticated;
grant all on public.enquiry_rate_limits to service_role;

create or replace function public.consume_enquiry_rate_limit(
  p_ip_hash text, p_window_started_at timestamptz, p_limit integer default 5
) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if p_ip_hash !~ '^[a-f0-9]{64}$' or p_limit < 1 or p_limit > 20 then
    raise exception 'invalid_rate_limit_request' using errcode = '22023';
  end if;
  delete from public.enquiry_rate_limits where window_started_at < now() - interval '2 days';
  insert into public.enquiry_rate_limits(ip_hash,window_started_at,request_count)
  values(p_ip_hash,p_window_started_at,1)
  on conflict(ip_hash,window_started_at) do update
    set request_count = public.enquiry_rate_limits.request_count + 1
  returning request_count into v_count;
  return v_count <= p_limit;
end;
$$;
revoke all on function public.consume_enquiry_rate_limit(text,timestamptz,integer) from public, anon, authenticated;
grant execute on function public.consume_enquiry_rate_limit(text,timestamptz,integer) to service_role;

-- Make media private at the bucket level: public objects are signed only when
-- referenced by a published cover/gallery row. Admin uploads remain protected.
update storage.buckets set public = false where id = 'project-media';
drop policy if exists "Public reads project media" on storage.objects;
create policy "Published project media can be signed" on storage.objects for select to anon, authenticated
using (
  bucket_id = 'project-media' and (
    public.is_admin()
    or exists(select 1 from public.projects p where p.published and p.cover_image_path = storage.objects.name)
    or exists(select 1 from public.project_images i join public.projects p on p.id=i.project_id
              where p.published and i.storage_path = storage.objects.name)
  )
);

-- Explicitly block self-service profile creation or role changes.
drop policy if exists "Admins read profiles" on public.profiles;
create policy "Admins read profiles" on public.profiles for select to authenticated using(public.is_admin());
revoke insert, update, delete on public.profiles from anon, authenticated;

