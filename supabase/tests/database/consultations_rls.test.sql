begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.consultations'::regclass),
  'consultations has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.consultation_messages'::regclass),
  'consultation_messages has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.consultation_ratings'::regclass),
  'consultation_ratings has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.consultation_payments'::regclass),
  'consultation_payments has RLS enabled'
);

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'patient-a@example.test',
    '{"full_name":"Patient A","requested_role":"patient"}'::jsonb
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'patient-b@example.test',
    '{"full_name":"Patient B","requested_role":"patient"}'::jsonb
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'doctor@example.test',
    '{"full_name":"Doctor","requested_role":"doctor"}'::jsonb
  );

insert into public.specialties (id, slug, name_ar, description)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'test-specialty',
  'تخصص اختباري',
  'Fixture used only by database tests'
)
on conflict (id) do nothing;

insert into public.doctors (
  id,
  slug,
  display_name,
  profile_kind,
  specialty_id,
  bio,
  verification_status,
  publication_status,
  provider_user_id
)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'test-doctor',
  'طبيب اختباري',
  'real_provider',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Fixture provider used only for row level security database tests.',
  'verified',
  'draft',
  '33333333-3333-4333-8333-333333333333'
);

insert into public.consultations (
  id,
  patient_id,
  doctor_id,
  specialty_id,
  subject,
  body,
  status
)
values (
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  '11111111-1111-4111-8111-111111111111',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Test consultation',
  'This fixture is long enough to satisfy the consultation body constraint.',
  'assigned'
);

set local role authenticated;

select set_config(
  'request.jwt.claim.sub',
  '11111111-1111-4111-8111-111111111111',
  true
);

select is(
  (select count(*) from public.consultations),
  1::bigint,
  'patient can read own consultation'
);

select set_config(
  'request.jwt.claim.sub',
  '22222222-2222-4222-8222-222222222222',
  true
);

select is(
  (select count(*) from public.consultations),
  0::bigint,
  'unrelated patient cannot read another patient consultation'
);

select set_config(
  'request.jwt.claim.sub',
  '33333333-3333-4333-8333-333333333333',
  true
);

select is(
  (select count(*) from public.consultations),
  1::bigint,
  'assigned doctor can read consultation'
);

select set_config(
  'request.jwt.claim.sub',
  '11111111-1111-4111-8111-111111111111',
  true
);

update public.consultations
set status = 'closed'
where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

select is(
  (select status::text
   from public.consultations
   where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  'assigned',
  'patient cannot change consultation status'
);

-- Test the database policy, not just the visibility of UI controls.
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);

select throws_ok(
  $ update public.consultations set patient_id = '22222222-2222-4222-8222-222222222222'
     where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' $,
  '42501',
  'doctor_update_forbidden',
  'doctor cannot reassign a consultation to another patient'
);

select lives_ok(
  $ update public.consultations set status = 'answered'
     where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' $,
  'assigned doctor can mark a consultation as answered'
);

select throws_ok(
  $ update public.consultations set status = 'open'
     where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' $,
  '42501',
  'doctor_status_transition_forbidden',
  'doctor cannot regress the consultation workflow'
);

update public.consultations set status = 'closed'
where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);

select throws_ok(
  $ insert into public.consultation_messages (consultation_id, sender_id, sender_kind, body)
     values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '11111111-1111-4111-8111-111111111111', 'patient', 'should not be sent') $,
  '42501',
  'new row violates row-level security policy for table "consultation_messages"',
  'closed consultations reject new messages on the server'
);

select * from finish();

rollback;
