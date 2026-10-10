-- AR CONSTRUCTION initial schema. Apply through Supabase CLI or SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'viewer' check (role in ('admin','viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category text not null check (char_length(category) between 2 and 80),
  summary text not null check (char_length(summary) between 5 and 400),
  description text not null default '',
  location text,
  scope_of_work text,
  status text,
  completion_date date,
  cover_image_path text,
  published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_public_order_idx on public.projects(published, sort_order, created_at desc);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(project_id, storage_path)
);
create index if not exists project_images_order_idx on public.project_images(project_id,sort_order);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 140),
  phone text not null check (char_length(phone) between 7 and 30),
  email text check (email is null or char_length(email) <= 254),
  project_type text not null check (char_length(project_type) between 2 and 100),
  project_location text,
  budget_range text,
  expected_start_date date,
  message text not null check (char_length(message) between 10 and 6000),
  preferred_contact_method text not null default 'Phone' check (preferred_contact_method in ('Phone','Email','WhatsApp')),
  consent boolean not null check (consent),
  status text not null default 'new' check (status in ('new','contacted','qualified','closed')),
  internal_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists enquiries_created_idx on public.enquiries(created_at desc);
create index if not exists enquiries_status_idx on public.enquiries(status,created_at desc);

create table if not exists public.site_settings (
  id integer primary key default 1 check(id=1),
  business_name text not null default 'AR CONSTRUCTION',
  tagline text not null default 'Building Dreams. Crafting Spaces. Creating Legacies.',
  phone text,
  email text,
  whatsapp_phone text,
  business_address text,
  service_areas text[] not null default array['Hyderabad, Telangana'],
  social_links jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.site_settings(id) values(1) on conflict do nothing;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end $$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin')
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create trigger projects_updated_at before update on public.projects for each row execute function public.touch_updated_at();
create trigger enquiries_updated_at before update on public.enquiries for each row execute function public.touch_updated_at();
create trigger settings_updated_at before update on public.site_settings for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.enquiries enable row level security;
alter table public.site_settings enable row level security;

create policy "Admins read profiles" on public.profiles for select to authenticated using (public.is_admin());
create policy "Admin manage projects" on public.projects for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Public reads published projects" on public.projects for select to anon,authenticated using(published or public.is_admin());
create policy "Admin manage project images" on public.project_images for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Public reads galleries for published projects" on public.project_images for select to anon,authenticated using(exists(select 1 from public.projects p where p.id=project_id and p.published) or public.is_admin());
create policy "Admin reads and manages enquiries" on public.enquiries for all to authenticated using(public.is_admin()) with check(public.is_admin());
-- Direct anonymous inserts are kept narrow; the form enforces validation and consent.
create policy "Visitors submit enquiries" on public.enquiries for insert to anon,authenticated with check(consent and status='new' and internal_notes='');
create policy "Public reads site settings" on public.site_settings for select to anon,authenticated using(true);
create policy "Admin updates site settings" on public.site_settings for update to authenticated using(public.is_admin()) with check(public.is_admin());

-- Storage bucket is public-read for published portfolio URLs; writes are admin-only.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('project-media','project-media',true,8388608,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict(id) do update set public=true,file_size_limit=8388608,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/avif'];
create policy "Public reads project media" on storage.objects for select to anon,authenticated using(bucket_id='project-media');
create policy "Admins upload project media" on storage.objects for insert to authenticated with check(bucket_id='project-media' and public.is_admin());
create policy "Admins update project media" on storage.objects for update to authenticated using(bucket_id='project-media' and public.is_admin()) with check(bucket_id='project-media' and public.is_admin());
create policy "Admins delete project media" on storage.objects for delete to authenticated using(bucket_id='project-media' and public.is_admin());

-- Create a user with Supabase Auth first, then promote their UUID using SQL editor:
-- update public.profiles set role='admin' where id='AUTH_USER_UUID';
-- A profile row must be explicitly inserted by the project owner; public signup is not enabled.
