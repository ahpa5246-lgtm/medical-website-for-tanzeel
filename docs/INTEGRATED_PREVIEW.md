# Integration and free preview

The branch integration/full-feature-demo-20261017 is based on PR #25. It selectively carries forward the distinct Tanzeel personal space from PR #22 and the fictional case-room experience from PR #7.

PR #25 already supersedes PR #22's academy/library schema, consultation APIs and authentication. These older implementations MUST NOT overwrite newer ones. PR #22's destructive migration removing the learning lab is intentionally excluded; the lab remains supported.

## Safety and functionality

The Tanzeel demo content uses local storage only when Supabase is unconfigured or VITE_ENABLE_PROTOTYPE=true. The CaseRoom decisions are local-memory fictional examples and are not medical instruction. Server training and quotas remain separately enforced.

Other user roles and all genuine persistence require a staging Supabase instance with migrations, storage, Auth, and email configured. VITE_ENABLE_PROTOTYPE alone does not make every real backend feature work. 3D anatomy has not been implemented.

For a free visual review on Render Static Site: branch integration/full-feature-demo-20261017, root directory `Build Medical Consultation Platform`, build command `corepack enable && pnpm install --frozen-lockfile && pnpm build`, publish directory `dist`, and build env `VITE_ENABLE_PROTOTYPE=true`; configure rewrite `/*` to `/index.html`. No real medical data should be entered.

For full backend staging, follow docs/CONNECTED_DEPLOYMENT.md. The PHP report endpoint requires Docker/PHP hosting, not a static site.
