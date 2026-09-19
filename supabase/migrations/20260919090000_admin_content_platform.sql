create extension if not exists pgcrypto;
create extension if not exists unaccent;

create type public.app_role as enum ('owner', 'admin', 'editor', 'member');
create type public.account_status as enum ('active', 'disabled');
create type public.profile_kind as enum ('fictional_demo', 'real_provider');
create type public.verification_status as enum ('not_applicable', 'pending', 'verified', 'rejected', 'suspended');
create type public.publication_status as enum ('draft', 'review', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 100),
  role public.app_role not null default 'member',
  status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.specialties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name_ar text not null unique,
  description text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  display_name text not null check (char_length(trim(display_name)) between 3 and 120),
  profile_kind public.profile_kind not null default 'fictional_demo',
  specialty_id uuid not null references public.specialties(id),
  bio text not null check (char_length(trim(bio)) between 30 and 2000),
  languages text[] not null default array['العربية']::text[],
  interests text[] not null default '{}'::text[],
  image_path text,
  image_alt text not null default '',
  verification_status public.verification_status not null default 'not_applicable',
  publication_status public.publication_status not null default 'draft',
  revision integer not null default 1 check (revision > 0),
  published_at timestamptz,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fictional_profiles_are_never_verified check (
    profile_kind <> 'fictional_demo' or verification_status = 'not_applicable'
  ),
  constraint published_profiles_have_date check (
    publication_status <> 'published' or published_at is not null
  )
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role public.app_role not null check (role in ('admin', 'editor')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  invited_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint invitation_expiry_after_creation check (expires_at > created_at)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create index doctors_public_listing_idx
  on public.doctors (publication_status, specialty_id, published_at desc);
create index doctors_kind_idx on public.doctors (profile_kind);
create index invitations_email_idx on public.invitations (lower(email));
create index audit_events_entity_idx
  on public.audit_events (entity_type, entity_id, created_at desc);
create index audit_events_actor_idx on public.audit_events (actor_id, created_at desc);

create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid() and status = 'active'),
    'member'::public.app_role
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('owner', 'admin', 'editor');
$$;

create or replace function public.unique_doctor_slug(candidate text, excluded_id uuid default null)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  base text;
  proposed text;
  suffix integer := 1;
begin
  base := trim(both '-' from regexp_replace(lower(unaccent(candidate)), '[^a-z0-9]+', '-', 'g'));
  if base = '' then
    base := 'doctor-' || substring(md5(candidate) from 1 for 10);
  end if;
  proposed := base;
  while exists (select 1 from public.doctors where slug = proposed and id is distinct from excluded_id) loop
    suffix := suffix + 1;
    proposed := base || '-' || suffix::text;
  end loop;
  return proposed;
end;
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.bump_doctor_revision()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.revision := old.revision + 1;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create or replace function public.record_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_events(actor_id, action, entity_type, entity_id, before, after)
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    coalesce(new.id, old.id)::text,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();
create trigger specialties_touch before update on public.specialties
for each row execute function public.touch_updated_at();
create trigger doctors_revision before update on public.doctors
for each row execute function public.bump_doctor_revision();

create trigger doctors_audit after insert or update or delete on public.doctors
for each row execute function public.record_audit_event();
create trigger specialties_audit after insert or update or delete on public.specialties
for each row execute function public.record_audit_event();
create trigger profiles_audit after update on public.profiles
for each row execute function public.record_audit_event();

alter table public.profiles enable row level security;
alter table public.specialties enable row level security;
alter table public.doctors enable row level security;
alter table public.invitations enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles read self or staff" on public.profiles
for select using (id = auth.uid() or public.is_staff());
create policy "owner manages all profiles" on public.profiles
for update using (public.current_role() = 'owner')
with check (public.current_role() = 'owner');
create policy "admin manages editors" on public.profiles
for update using (public.current_role() = 'admin' and role = 'editor')
with check (public.current_role() = 'admin' and role = 'editor');

create policy "public reads active specialties" on public.specialties
for select using (is_active or public.is_staff());
create policy "admins manage specialties" on public.specialties
for all using (public.current_role() in ('owner', 'admin'))
with check (public.current_role() in ('owner', 'admin'));

create policy "public reads published doctors" on public.doctors
for select using (publication_status = 'published' or public.is_staff());
create policy "staff creates doctor drafts" on public.doctors
for insert with check (
  public.is_staff()
  and publication_status in ('draft', 'review')
  and created_by = auth.uid()
);
create policy "staff updates doctors by workflow" on public.doctors
for update using (public.is_staff())
with check (
  public.current_role() in ('owner', 'admin')
  or publication_status in ('draft', 'review')
);
create policy "admins delete unpublished doctors" on public.doctors
for delete using (
  public.current_role() in ('owner', 'admin')
  and publication_status <> 'published'
);

create policy "staff reads invitations" on public.invitations
for select using (public.is_staff());
create policy "owner creates admin invitations" on public.invitations
for insert with check (
  public.current_role() = 'owner'
  and role in ('admin', 'editor')
  and invited_by = auth.uid()
);
create policy "admin creates editor invitations" on public.invitations
for insert with check (
  public.current_role() = 'admin'
  and role = 'editor'
  and invited_by = auth.uid()
);

create policy "staff reads audit history" on public.audit_events
for select using (public.is_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'doctor-images',
  'doctor-images',
  true,
  5242880,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads doctor images" on storage.objects
for select using (bucket_id = 'doctor-images');
create policy "staff uploads doctor images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'doctor-images' and public.is_staff()
);
create policy "staff updates doctor images" on storage.objects
for update to authenticated using (
  bucket_id = 'doctor-images' and public.is_staff()
) with check (
  bucket_id = 'doctor-images' and public.is_staff()
);
create policy "admins delete doctor images" on storage.objects
for delete to authenticated using (
  bucket_id = 'doctor-images' and public.current_role() in ('owner', 'admin')
);

grant execute on function public.current_role() to authenticated, anon;
grant execute on function public.is_staff() to authenticated, anon;
grant execute on function public.unique_doctor_slug(text, uuid) to authenticated;
