# Connected deployment: React, Supabase and PHP

The React interface uses Supabase Auth, PostgreSQL RLS and private Storage for accounts, consultations, content, verification and training progress. PHP handles authenticated content reports using the caller's JWT; it never uses a service-role key. This avoids duplicating authentication and databases.

## Configure and deploy

1. Create a staging Supabase project and apply every file in `supabase/migrations` in timestamp order using the Supabase CLI. Back up an existing database before migrations; restore into staging and test first.
2. Configure Auth site URL and redirect allowlist for the final HTTPS origin. Enable email confirmation and configure a working SMTP provider. Create staff access through the existing administrator invitation workflow; never accept a role supplied by the browser.
3. Build from the repository root:

```sh
docker build --build-arg VITE_SUPABASE_URL=https://PROJECT.supabase.co --build-arg VITE_SUPABASE_ANON_KEY=PUBLIC_ANON_KEY -t medical-site .
docker run --rm -p 8080:80 -e SUPABASE_URL=https://PROJECT.supabase.co -e SUPABASE_ANON_KEY=PUBLIC_ANON_KEY medical-site
```

The two build arguments are public browser configuration. Do not pass a service-role key. Runtime PHP configuration must use the same project. Use a host supporting Docker/PHP, HTTPS and outbound HTTPS. A static-only host cannot execute this PHP API. `APP_PUBLIC_DIR` is set by the image. The frontend source directory is not the document root.

4. Verify `/api/health` and `/api/readiness`, then test actual account creation, confirmation, recovery, sign-in, staff permissions, consultation creation/retry, messages, uploads/downloads, content review, report persistence and training completion with two independent accounts. Readiness checks configuration only; it is not an upstream connectivity check.
5. Publish reviewed articles/resources/courses through the content dashboard. Configure structured training questions through the training dashboard. Only the first seeded task is a nonclinical platform/privacy exercise. Clinical tasks and 3D anatomy remain unavailable until authored and approved.
6. Before public indexing, choose the canonical domain, add its sitemap/canonical URLs, and intentionally remove staging `noindex`. Establish backups, restore drills, monitoring, response ownership and a release rollback plan. Keep the previous image available; database rollback requires a separately tested recovery procedure.

## Verification performed in this workspace

- TypeScript compilation and existing/new Node behavior tests.
- Embedded PostgreSQL executes all real migrations with Supabase-style default grants; tests authorization, publication review, server grading, idempotent consultations/messages/reports, cross-account privacy and blocked direct INSERT bypass.
- Chromium browser tests at desktop and narrow mobile sizes cover navigation, dialogs, form feedback, reduced motion and query changes preserving the input.
- PHP HTTP contract executes using PHP WASM: 11 cases for routes, validation, private paths and safe failure.

These checks do not substitute for a live Supabase/PostgREST/Storage/Auth deployment test. Docker and native PHP HTTP serving were unavailable in this workspace. SMTP delivery, live uploads and the PHP upstream success path have not been verified here. No site has been deployed to a public medical service.

## Reproduce checks

```sh
cd 'Build Medical Consultation Platform'
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm test:database
pnpm format:check
VITE_ENABLE_PROTOTYPE=true pnpm build
pnpm exec playwright install chromium
pnpm test:e2e --project=desktop-chromium --project=weak-mobile-chromium
php ../server/tests/http_contract.php
```

The prototype build is only an isolated browser test artifact. Production builds must use actual Supabase public configuration and `VITE_ENABLE_PROTOTYPE=false`.
