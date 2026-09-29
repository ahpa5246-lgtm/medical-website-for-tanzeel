create type public.consultation_status as enum ('open','assigned','answered','closed');
create type public.message_sender_kind as enum ('patient','doctor','staff');
create type public.payment_status as enum ('unpaid','pending','paid','refunded','failed');

alter table public.profiles
  add column if not exists phone text,
  add column if not exists requested_role text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, display_name, role, status, phone, requested_role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(coalesce(new.email, 'مستخدم'), '@', 1)),
    'member',
    'active',
    nullif(trim(new.raw_user_meta_data->>'phone'), ''),
    coalesce(nullif(trim(new.raw_user_meta_data->>'requested_role'), ''), 'patient')
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    phone = excluded.phone,
    requested_role = excluded.requested_role;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.doctors
  add column if not exists provider_user_id uuid references public.profiles(id);

create unique index if not exists doctors_provider_user_unique
  on public.doctors(provider_user_id) where provider_user_id is not null;

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete set null,
  specialty_id uuid not null references public.specialties(id),
  subject text not null check (char_length(trim(subject)) between 5 and 160),
  body text not null check (char_length(trim(body)) between 20 and 5000),
  status public.consultation_status not null default 'open',
  emergency_flag boolean not null default false,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consultation_messages (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_kind public.message_sender_kind not null,
  body text not null check (char_length(trim(body)) between 1 and 5000),
  created_at timestamptz not null default now()
);

create table public.consultation_ratings (
  consultation_id uuid primary key references public.consultations(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consultation_payments (
  consultation_id uuid primary key references public.consultations(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(10,2) not null default 0 check (amount >= 0),
  currency text not null default 'IQD',
  status public.payment_status not null default 'unpaid',
  provider text,
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index consultations_patient_idx on public.consultations(patient_id, created_at desc);
create index consultations_doctor_idx on public.consultations(doctor_id, created_at desc);
create index consultation_messages_thread_idx on public.consultation_messages(consultation_id, created_at);

create trigger consultations_touch before update on public.consultations
for each row execute function public.touch_updated_at();
create trigger consultation_ratings_touch before update on public.consultation_ratings
for each row execute function public.touch_updated_at();
create trigger consultation_payments_touch before update on public.consultation_payments
for each row execute function public.touch_updated_at();

create or replace function public.is_medical_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('owner','admin');
$$;

create or replace function public.can_access_consultation(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.consultations c
    left join public.doctors d on d.id = c.doctor_id
    where c.id = target
      and (
        c.patient_id = auth.uid()
        or d.provider_user_id = auth.uid()
        or public.is_medical_admin()
      )
  );
$$;

alter table public.consultations enable row level security;
alter table public.consultation_messages enable row level security;
alter table public.consultation_ratings enable row level security;
alter table public.consultation_payments enable row level security;

create policy "patients create consultations" on public.consultations
for insert to authenticated
with check (patient_id = auth.uid());

create policy "participants read consultations" on public.consultations
for select to authenticated
using (
  patient_id = auth.uid()
  or public.is_medical_admin()
  or exists (
    select 1 from public.doctors d
    where d.id = doctor_id and d.provider_user_id = auth.uid()
  )
);

create policy "medical admins or assigned doctor update consultations" on public.consultations
for update to authenticated
using (
  public.is_medical_admin()
  or exists (
    select 1 from public.doctors d
    where d.id = doctor_id and d.provider_user_id = auth.uid()
  )
)
with check (
  public.is_medical_admin()
  or exists (
    select 1 from public.doctors d
    where d.id = doctor_id and d.provider_user_id = auth.uid()
  )
);

create policy "participants read messages" on public.consultation_messages
for select to authenticated
using (public.can_access_consultation(consultation_id));

create policy "participants send messages" on public.consultation_messages
for insert to authenticated
with check (
  sender_id = auth.uid()
  and public.can_access_consultation(consultation_id)
  and (
    (sender_kind = 'patient' and exists (
      select 1 from public.consultations c
      where c.id = consultation_id and c.patient_id = auth.uid()
    ))
    or (sender_kind = 'doctor' and exists (
      select 1
      from public.consultations c
      join public.doctors d on d.id = c.doctor_id
      where c.id = consultation_id and d.provider_user_id = auth.uid()
    ))
    or (sender_kind = 'staff' and public.is_medical_admin())
  )
);

create policy "patient reads own rating" on public.consultation_ratings
for select to authenticated
using (patient_id = auth.uid() or public.is_medical_admin());

create policy "patient creates own rating" on public.consultation_ratings
for insert to authenticated
with check (
  patient_id = auth.uid()
  and exists (
    select 1 from public.consultations c
    where c.id = consultation_id
      and c.patient_id = auth.uid()
      and c.status in ('answered','closed')
  )
);

create policy "patient updates own rating" on public.consultation_ratings
for update to authenticated
using (patient_id = auth.uid())
with check (patient_id = auth.uid());

create policy "patient reads own payment" on public.consultation_payments
for select to authenticated
using (patient_id = auth.uid() or public.is_medical_admin());

create policy "medical admins manage payments" on public.consultation_payments
for all to authenticated
using (public.is_medical_admin())
with check (public.is_medical_admin());

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'consultation-attachments',
  'consultation-attachments',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "participants read consultation attachments" on storage.objects
for select to authenticated
using (
  bucket_id = 'consultation-attachments'
  and case
    when split_part(name,'/',1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then public.can_access_consultation((split_part(name,'/',1))::uuid)
    else false
  end
);

create policy "patient uploads own consultation attachments" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'consultation-attachments'
  and case
    when split_part(name,'/',1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then exists (
        select 1 from public.consultations c
        where c.id = (split_part(name,'/',1))::uuid
          and c.patient_id = auth.uid()
      )
    else false
  end
);

create policy "medical admins delete consultation attachments" on storage.objects
for delete to authenticated
using (
  bucket_id = 'consultation-attachments'
  and public.is_medical_admin()
);

grant execute on function public.is_medical_admin() to authenticated;
grant execute on function public.can_access_consultation(uuid) to authenticated;
