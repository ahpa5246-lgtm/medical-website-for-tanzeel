begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

select ok((select relrowsecurity from pg_class where oid = 'public.tanzeel_space_entries'::regclass), 'personal space has RLS');

insert into auth.users (id, email, raw_user_meta_data) values
  ('88888888-8888-4888-8888-888888888888', 'space-owner@example.test', '{"full_name":"Space Owner"}'::jsonb),
  ('99999999-9999-4999-8999-999999999999', 'space-reader@example.test', '{"full_name":"Space Reader"}'::jsonb);
update public.profiles set role = 'owner' where id = '88888888-8888-4888-8888-888888888888';

insert into public.tanzeel_space_entries (id, kind, title, summary, body, author_id, status) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab', 'article', 'Private sample article', 'A draft article summary long enough for this test.', 'This is the private article body for the database test.', '88888888-8888-4888-8888-888888888888', 'draft'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaac', 'article', 'Public sample article', 'A published article summary long enough for this test.', 'This is the published article body for the database test.', '88888888-8888-4888-8888-888888888888', 'published');

set local role authenticated;
select set_config('request.jwt.claim.sub', '99999999-9999-4999-8999-999999999999', true);
select is((select count(*) from public.tanzeel_space_entries), 1::bigint, 'reader sees published entry only');
select throws_ok(
  $$insert into public.tanzeel_space_entries (kind, title, summary, body, author_id) values ('article', 'Unapproved article', 'This summary is long enough for the test case.', 'This body is long enough to test rejected writes.', '99999999-9999-4999-8999-999999999999')$$,
  '42501', null, 'ordinary reader cannot publish personal content'
);

select set_config('request.jwt.claim.sub', '88888888-8888-4888-8888-888888888888', true);
select is((select count(*) from public.tanzeel_space_entries), 2::bigint, 'owner sees public and draft entries');
select lives_ok(
  $$insert into public.tanzeel_space_entries (kind, title, summary, body, author_id) values ('article', 'Another draft article', 'Another sufficiently long article summary for this test.', 'Another full article body for this database test case.', '88888888-8888-4888-8888-888888888888')$$,
  'owner can create an entry'
);

select * from finish();
rollback;
