import { PGlite } from "@electric-sql/pglite"
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto"
import { unaccent } from "@electric-sql/pglite/contrib/unaccent"
import fs from "node:fs/promises"
import assert from "node:assert/strict"
const db = new PGlite({ extensions: { pgcrypto, unaccent } })
await db.exec(`create schema auth; create schema storage; create role anon nologin; create role authenticated nologin;
create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create function auth.jwt() returns jsonb language sql stable as $$select jsonb_build_object('email','test@example.invalid')$$;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,owner uuid);
alter table storage.objects enable row level security;
create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;
grant usage on schema public,auth,storage to anon,authenticated;
grant execute on all functions in schema auth,storage to anon,authenticated;
grant all on storage.objects to authenticated;
alter default privileges in schema public grant all on tables to anon,authenticated;`)
const root = new URL("../../supabase/migrations/", import.meta.url).pathname
for (const file of (await fs.readdir(root))
  .filter((f) => f.endsWith(".sql"))
  .sort()) {
  await db.exec(await fs.readFile(root + "/" + file, "utf8"))
  console.log("MIGRATION", file)
}
const a = "11111111-1111-4111-8111-111111111111",
  b = "22222222-2222-4222-8222-222222222222",
  admin = "33333333-3333-4333-8333-333333333333",
  editor = "44444444-4444-4444-8444-444444444444"
await db.exec(
  `insert into auth.users(id,email,raw_user_meta_data) values ('${a}','a@example.invalid','{"full_name":"Patient A"}'),('${b}','b@example.invalid','{"full_name":"Patient B"}'),('${admin}','admin@example.invalid','{"full_name":"Admin"}'),('${editor}','editor@example.invalid','{"full_name":"Editor"}');update public.profiles set role='owner' where id='${admin}';update public.profiles set role='editor' where id='${editor}';insert into public.specialties(id,slug,name_ar) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','general','Synthetic');`,
)
async function as(id, fn) {
  await db.exec(
    `set role authenticated;select set_config('request.jwt.claim.sub','${id}',false);`,
  )
  try {
    return await fn()
  } finally {
    await db.exec("reset role;")
  }
}
async function denied(id, sql) {
  let failed = false
  await as(id, async () => {
    try {
      await db.exec(sql)
    } catch {
      failed = true
    }
  })
  assert.equal(failed, true, sql)
  console.log("DENIED", sql.slice(0, 65))
}
await denied(
  a,
  `insert into content_items(kind,title,body,category,author_id)values('article','Test article','${"x".repeat(80)}','test','${a}')`,
)
const content = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
await as(editor, () =>
  db.exec(
    `insert into content_items(id,kind,title,body,category,author_id,status)values('${content}','article','Test article','${"x".repeat(80)}','test','${editor}','review')`,
  ),
)
await denied(
  editor,
  `update content_items set status='published' where id='${content}'`,
)
assert.equal(
  (await as(a, () => db.query(`select * from content_items`))).rows.length,
  0,
)
await as(admin, () =>
  db.exec(`update content_items set status='published' where id='${content}'`),
)
assert.equal(
  (await as(a, () => db.query("select * from content_items"))).rows.length,
  1,
)
await denied(
  a,
  `insert into training_progress values('${a}','vital-signs',100,now())`,
)
await denied(a, `select * from training_answer_keys`)
const wrong = await as(a, () =>
  db.query(
    `select complete_training_stage('vital-signs',array[0,0,0]) as passed`,
  ),
)
assert.equal(wrong.rows[0].passed, false)
await as(a, () =>
  db.exec(
    `select complete_training_stage('vital-signs',array[1,0,1]);select complete_training_stage('vital-signs',array[1,0,1]);`,
  ),
)
assert.equal(
  (await as(a, () => db.query("select * from training_progress"))).rows.length,
  1,
)
assert.equal(
  (await as(b, () => db.query("select * from training_progress"))).rows.length,
  0,
)
await denied(b, `select complete_training_stage('triage',array[1,0,1])`)
await denied(a, `select complete_training_stage('patient-safety',array[1,0,1])`)
const operation = "dddddddd-dddd-4ddd-8ddd-dddddddddddd"
const created = await as(a, () =>
  db.query(
    `select (create_consultation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Synthetic request','Synthetic request description for testing',false,'${operation}')).id as id`,
  ),
)
const consultationId = created.rows[0].id
await as(a, () =>
  db.exec(
    `select create_consultation('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Synthetic request','Synthetic request description for testing',false,'${operation}')`,
  ),
)
assert.equal(
  (await as(a, () => db.query("select * from consultations"))).rows.length,
  1,
)
assert.equal(
  (await as(b, () => db.query("select * from consultations"))).rows.length,
  0,
)
await denied(
  b,
  `select send_consultation_message('${consultationId}','Unauthorized synthetic message','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')`,
)
await as(a, () =>
  db.exec(
    `select send_consultation_message('${consultationId}','Synthetic followup','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');select send_consultation_message('${consultationId}','Synthetic followup','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')`,
  ),
)
assert.equal(
  (await as(a, () => db.query("select * from consultation_messages"))).rows
    .length,
  1,
)
await as(admin, () =>
  db.exec(
    `update consultations set status='closed' where id='${consultationId}'`,
  ),
)
await denied(
  a,
  `select send_consultation_message('${consultationId}','Late synthetic message','ffffffff-ffff-4fff-8fff-ffffffffffff')`,
)
const op = "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
await as(a, () =>
  db.exec(
    `select submit_content_report('${content}','Synthetic report reason','${op}');select submit_content_report('${content}','Synthetic report reason','${op}');`,
  ),
)
assert.equal(
  (await as(a, () => db.query("select * from content_reports"))).rows.length,
  1,
)
assert.equal(
  (await as(b, () => db.query("select * from content_reports"))).rows.length,
  0,
)
await denied(
  a,
  `select submit_content_report('${content}','Different synthetic reason','${op}')`,
)
await denied(
  a,
  `insert into verification_applications(applicant_id,full_name,specialty_id,license_number,experience,consent,status) values('${a}','Synthetic name','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','TEST123',2,true,'approved')`,
)
await as(a, () =>
  db.exec(
    `insert into verification_applications(applicant_id,full_name,specialty_id,license_number,experience,consent) values('${a}','Synthetic name','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','TEST123',2,true)`,
  ),
)
assert.equal(
  (await as(b, () => db.query("select * from verification_applications"))).rows
    .length,
  0,
)
await denied(
  a,
  `update verification_applications set document_path='${b}/private' where applicant_id='${a}'`,
)
await db.exec(`update profiles set status='disabled' where id='${a}'`)
await denied(a, `select reset_training_progress()`)
console.log(
  "PASS: content review/visibility, private keys, wrong/prerequisite/replay grading, cross-account progress/reports/verification, payload mismatch, document ownership, inactive reset",
)
await db.exec(`update profiles set status='active' where id='${a}'`)
await denied(
  a,
  `insert into consultations(patient_id,specialty_id,subject,body) values('${a}','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Synthetic bypass','Synthetic bypass description for testing')`,
)
await denied(
  a,
  `insert into consultation_messages(consultation_id,sender_id,sender_kind,body) values('${consultationId}','${a}','patient','Synthetic bypass')`,
)
console.log("PASS: direct consultation/message INSERT bypass is denied")
await db.close()
