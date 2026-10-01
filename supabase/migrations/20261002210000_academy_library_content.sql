-- Academy and library publishing. Prototype records remain browser-local and never enter this table.
alter table public.profiles
  add column if not exists content_author_approved boolean not null default false;

create or replace function public.valid_course_lessons(value jsonb)
returns boolean language plpgsql immutable set search_path = public
as $$
declare
  lesson jsonb;
  option_text text;
begin
  if jsonb_typeof(value) is distinct from 'array' then return false; end if;
  if jsonb_array_length(value) = 0 then return false; end if;
  for lesson in select jsonb_array_elements(value) loop
    if jsonb_typeof(lesson) is distinct from 'object'
      or length(trim(coalesce(lesson->>'title', ''))) < 3
      or length(trim(coalesce(lesson->>'body', ''))) < 20
      or length(trim(coalesce(lesson->>'question', ''))) < 5
    then return false; end if;
    if jsonb_typeof(lesson->'options') is distinct from 'array' then return false; end if;
    if jsonb_array_length(lesson->'options') not between 2 and 4 then return false; end if;
    if coalesce(lesson->>'correct_index', '') !~ '^[0-3]$' then return false; end if;
    if (lesson->>'correct_index')::integer >= jsonb_array_length(lesson->'options') then return false; end if;
    for option_text in select jsonb_array_elements_text(lesson->'options') loop
      if length(trim(coalesce(option_text, ''))) = 0 then return false; end if;
    end loop;
  end loop;
  return true;
end;
$$;

create table public.content_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('course', 'library')),
  title text not null check (char_length(trim(title)) between 8 and 180),
  summary text not null check (char_length(trim(summary)) between 20 and 500),
  body text not null check (char_length(trim(body)) between 30 and 30000),
  category text not null check (char_length(trim(category)) between 2 and 80),
  lessons jsonb not null default '[]'::jsonb check (jsonb_typeof(lessons) = 'array'),
  source_url text not null default '' check (source_url = '' or source_url ~ '^https://[^[:space:]]+$'),
  author_id uuid not null references public.profiles(id),
  author_name text not null default '',
  status public.publication_status not null default 'draft',
  revision integer not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_has_valid_lessons check (kind <> 'course' or public.valid_course_lessons(lessons)),
  constraint published_has_date check (status <> 'published' or published_at is not null)
);

create index content_public_listing_idx
  on public.content_entries (kind, status, published_at desc);
create index content_author_idx
  on public.content_entries (author_id, updated_at desc);

create or replace function public.can_author_content()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.status = 'active'
      and (
        p.role in ('owner', 'admin', 'editor')
        or p.content_author_approved
        or exists (
          select 1 from public.doctors d
          where d.provider_user_id = p.id
            and d.profile_kind = 'real_provider'
            and d.verification_status = 'verified'
        )
      )
  );
$$;

create or replace function public.prepare_content_entry()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.author_id <> old.author_id then
      raise exception 'content author cannot be changed';
    end if;
    if old.status = 'published' and not public.is_staff() then
      raise exception 'published content requires staff review';
    end if;
    new.revision := old.revision + 1;
  end if;
  if not public.is_staff() and new.status not in ('draft', 'review') then
    raise exception 'only staff may publish content';
  end if;
  select display_name into new.author_name
  from public.profiles where id = new.author_id;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  elsif new.status <> 'published' then
    new.published_at := null;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger content_prepare
before insert or update on public.content_entries
for each row execute function public.prepare_content_entry();

alter table public.content_entries enable row level security;
create policy "public reads published content" on public.content_entries
for select using (status = 'published');
create policy "authors and staff read working content" on public.content_entries
for select to authenticated
using (author_id = auth.uid() or public.is_staff());
create policy "approved authors create drafts" on public.content_entries
for insert to authenticated
with check (author_id = auth.uid() and public.can_author_content() and status = 'draft');
create policy "authors edit own unpublished content" on public.content_entries
for update to authenticated
using (author_id = auth.uid() and status in ('draft', 'review') and public.can_author_content())
with check (author_id = auth.uid() and status in ('draft', 'review'));
create policy "staff manage all content" on public.content_entries
for all to authenticated
using (public.is_staff()) with check (public.is_staff());

create table public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  content_id uuid not null references public.content_entries(id) on delete cascade,
  lesson_index integer not null check (lesson_index >= 0),
  completed_at timestamptz not null default now(),
  primary key (user_id, content_id, lesson_index)
);
alter table public.lesson_progress enable row level security;
create policy "learners read own progress" on public.lesson_progress
for select to authenticated using (user_id = auth.uid());
create policy "learners record own progress" on public.lesson_progress
for insert to authenticated with check (
  user_id = auth.uid() and exists (
    select 1 from public.content_entries c
    where c.id = content_id and c.kind = 'course' and c.status = 'published'
      and lesson_index < jsonb_array_length(c.lessons)
  )
);
