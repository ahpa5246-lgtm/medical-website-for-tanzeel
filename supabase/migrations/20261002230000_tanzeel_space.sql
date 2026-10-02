-- Curated personal publications for the physician's space.
create table public.tanzeel_space_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('book_review', 'article', 'achievement', 'course')),
  title text not null check (char_length(trim(title)) between 8 and 180),
  summary text not null check (char_length(trim(summary)) between 20 and 500),
  body text not null check (char_length(trim(body)) between 30 and 30000),
  rating integer,
  link_url text not null default '',
  author_id uuid not null references public.profiles(id),
  status public.publication_status not null default 'draft',
  revision integer not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rating_only_for_books check (
    (kind = 'book_review' and rating is not null and rating between 1 and 5)
    or (kind <> 'book_review' and rating is null)
  ),
  constraint safe_space_link check (
    link_url = '' or link_url ~ '^https://[^[:space:]]+$'
    or link_url ~ '^/(courses|articles)/[a-zA-Z0-9-]+$'
  ),
  constraint published_space_has_date check (status <> 'published' or published_at is not null)
);

create index tanzeel_space_listing_idx
  on public.tanzeel_space_entries (kind, status, published_at desc);

create or replace function public.prepare_tanzeel_space_entry()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.author_id <> old.author_id then
      raise exception 'space author cannot be changed';
    end if;
    new.revision := old.revision + 1;
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  elsif new.status <> 'published' then
    new.published_at := null;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger prepare_tanzeel_space_entry
before insert or update on public.tanzeel_space_entries
for each row execute function public.prepare_tanzeel_space_entry();

alter table public.tanzeel_space_entries enable row level security;
create policy "public reads published tanzeel space" on public.tanzeel_space_entries
for select using (status = 'published');
create policy "staff reads working tanzeel space" on public.tanzeel_space_entries
for select to authenticated using (public.is_staff());
create policy "staff creates tanzeel space" on public.tanzeel_space_entries
for insert to authenticated with check (public.is_staff() and author_id = auth.uid());
create policy "staff updates tanzeel space" on public.tanzeel_space_entries
for update to authenticated using (public.is_staff()) with check (public.is_staff());
