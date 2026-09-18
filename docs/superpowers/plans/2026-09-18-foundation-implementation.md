# MedConnect Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the production-ready visual and runtime foundation for MedConnect without changing medical workflows or introducing fake backend success.

**Architecture:** Keep the current React/Vite application and add focused foundation modules: a deterministic environment contract, a root error boundary, shared async-state surfaces, and a coherent semantic token layer. Existing routes continue to render through the same `Layout`; phase one changes infrastructure and visual consistency only.

**Tech Stack:** React 19, TypeScript 5.7, Vite 8, Tailwind CSS v4, Node test runner, CSS custom properties

**Spec:** `docs/superpowers/specs/2026-09-18-production-readiness-design.md`

## Global Constraints

- Arabic-first RTL remains the default.
- No production action may silently report success without persistence.
- Existing emergency screening remains active. Prototype warnings remain only while the explicit `VITE_ENABLE_PROTOTYPE=true` development mode is used and are removed from the final connected release.
- No Three.js or database dependency is introduced in phase one.
- All interactions retain keyboard focus, reduced-motion behavior, and 44px touch targets.
- The build must pass `pnpm test`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`.

---

## File map

- `src/lib/runtimeConfig.ts`: parse and classify browser-safe environment values.
- `src/components/system/ConfigurationGate.tsx`: display an actionable configuration state without crashing the app.
- `src/components/system/AppErrorBoundary.tsx`: contain unexpected render failures and provide recovery.
- `src/components/system/AsyncState.tsx`: shared loading, empty, error, denied, and offline presentation.
- `src/components/system/RouteAnnouncer.tsx`: announce route changes and restore focus predictably.
- `src/styles/tokens.css`: semantic color, spacing, surface, shadow, focus, and motion tokens.
- `src/styles/foundation.css`: global canvas, typography, focus, reduced-motion, and utility surfaces.
- `src/main.tsx`: import foundation styles and wrap the application.
- `src/App.tsx`: mount configuration, route announcement, and route-level recovery.
- `tests/runtime-config.test.mjs`: configuration contract.
- `tests/foundation-shell.test.mjs`: integration assertions for the root shell.

### Task 1: Runtime configuration contract

**Files:**
- Create: `Build Medical Consultation Platform/src/lib/runtimeConfig.mjs`
- Create: `Build Medical Consultation Platform/src/lib/runtimeConfig.d.mts`
- Test: `Build Medical Consultation Platform/tests/runtime-config.test.mjs`

**Interfaces:**
- Produces: `readRuntimeConfig(env): RuntimeConfigResult`
- Produces: `RuntimeConfigResult = { mode: "blocked" | "prototype" | "connected"; supabaseUrl?: string; supabaseAnonKey?: string; issues: string[] }`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test"
import assert from "node:assert/strict"
import { readRuntimeConfig } from "../src/lib/runtimeConfig.mjs"

test("empty environment blocks startup instead of faking a backend", () => {
  assert.deepEqual(readRuntimeConfig({}), {
    mode: "blocked",
    issues: ["أضيفي إعدادات Supabase لتشغيل المنصة المتصلة."],
  })
})

test("prototype mode requires an explicit development flag", () => {
  assert.deepEqual(readRuntimeConfig({ VITE_ENABLE_PROTOTYPE: "true" }), {
    mode: "prototype",
    issues: [],
  })
})

test("partial Supabase configuration is rejected", () => {
  assert.deepEqual(readRuntimeConfig({ VITE_SUPABASE_URL: "https://example.supabase.co" }), {
    mode: "blocked",
    issues: ["أضيفي VITE_SUPABASE_ANON_KEY لإكمال اتصال Supabase."],
  })
})

test("complete valid configuration enters connected mode", () => {
  const result = readRuntimeConfig({
    VITE_SUPABASE_URL: "https://example.supabase.co",
    VITE_SUPABASE_ANON_KEY: "public-anon-key",
  })
  assert.equal(result.mode, "connected")
  assert.equal(result.issues.length, 0)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "Build Medical Consultation Platform" && node --test tests/runtime-config.test.mjs`  
Expected: FAIL because `runtimeConfig.mjs` does not exist.

- [ ] **Step 3: Implement the parser**

```js
const missingKeyMessage = "أضيفي VITE_SUPABASE_ANON_KEY لإكمال اتصال Supabase."
const missingUrlMessage = "أضيفي VITE_SUPABASE_URL لإكمال اتصال Supabase."

export function readRuntimeConfig(env) {
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim()
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim()
  const issues = []

  if (supabaseUrl && !supabaseAnonKey) issues.push(missingKeyMessage)
  if (!supabaseUrl && supabaseAnonKey) issues.push(missingUrlMessage)

  if (!supabaseUrl && !supabaseAnonKey) {
    if (env.VITE_ENABLE_PROTOTYPE === "true")
      return { mode: "prototype", issues: [] }
    return {
      mode: "blocked",
      issues: ["أضيفي إعدادات Supabase لتشغيل المنصة المتصلة."],
    }
  }

  if (issues.length) return { mode: "blocked", issues }

  try {
    const url = new URL(supabaseUrl)
    if (url.protocol !== "https:") throw new Error("invalid")
  } catch {
    return { mode: "blocked", issues: ["رابط Supabase غير صالح أو لا يستخدم HTTPS."] }
  }

  return { mode: "connected", supabaseUrl, supabaseAnonKey, issues: [] }
}
```

- [ ] **Step 4: Add the matching declaration**

```ts
export interface RuntimeConfigResult {
  mode: "blocked" | "prototype" | "connected"
  supabaseUrl?: string
  supabaseAnonKey?: string
  issues: string[]
}

export function readRuntimeConfig(
  env: Record<string, string | undefined>,
): RuntimeConfigResult
```

- [ ] **Step 5: Run the focused test**

Run: `cd "Build Medical Consultation Platform" && node --test tests/runtime-config.test.mjs`  
Expected: 4 passing tests.

- [ ] **Step 6: Commit**

```bash
git add "Build Medical Consultation Platform/src/lib/runtimeConfig.mjs" "Build Medical Consultation Platform/src/lib/runtimeConfig.d.mts" "Build Medical Consultation Platform/tests/runtime-config.test.mjs"
git commit -m "feat: add runtime configuration contract"
```

### Task 2: Semantic visual foundation

**Files:**
- Create: `Build Medical Consultation Platform/src/styles/tokens.css`
- Create: `Build Medical Consultation Platform/src/styles/foundation.css`
- Modify: `Build Medical Consultation Platform/src/index.css`
- Test: `Build Medical Consultation Platform/tests/foundation-shell.test.mjs`

**Interfaces:**
- Produces semantic variables: `--mc-canvas`, `--mc-surface`, `--mc-ink`, `--mc-muted`, `--mc-edge`, `--mc-accent`, `--mc-learning`, `--mc-critical`, `--mc-focus`.

- [ ] **Step 1: Write a failing source-contract test**

```js
import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("global stylesheet imports the semantic foundation first", () => {
  const css = read("src/index.css")
  assert.match(css, /@import ["']\.\/styles\/tokens\.css["'];/)
  assert.match(css, /@import ["']\.\/styles\/foundation\.css["'];/)
})

test("foundation provides focus and reduced-motion behavior", () => {
  const css = read("src/styles/foundation.css")
  assert.match(css, /:focus-visible/)
  assert.match(css, /prefers-reduced-motion/)
  assert.match(css, /min-height:\s*44px/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "Build Medical Consultation Platform" && node --test tests/foundation-shell.test.mjs`  
Expected: FAIL because the style files do not exist.

- [ ] **Step 3: Create semantic tokens**

Define warm ivory canvas, ink navy structure, clinical teal accent, amber learning accent, critical red, perceptible borders, three elevation levels, functional radii, and 140/220/420ms motion durations. Preserve existing Tailwind color names as compatibility aliases.

- [ ] **Step 4: Create global foundation rules**

Include body canvas and text, skip-link behavior, focus ring, text selection, minimum touch targets for buttons/links/inputs, `.mc-surface`, `.mc-inset`, `.mc-status`, and a reduced-motion block that disables smooth scrolling and non-essential animation.

- [ ] **Step 5: Import the new files after Google Fonts and Tailwind**

```css
@import "./styles/tokens.css";
@import "./styles/foundation.css";
```

- [ ] **Step 6: Run the focused test**

Run: `cd "Build Medical Consultation Platform" && node --test tests/foundation-shell.test.mjs`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add "Build Medical Consultation Platform/src/styles" "Build Medical Consultation Platform/src/index.css" "Build Medical Consultation Platform/tests/foundation-shell.test.mjs"
git commit -m "feat: establish semantic visual foundation"
```

### Task 3: Error boundary and configuration gate

**Files:**
- Create: `Build Medical Consultation Platform/src/components/system/AppErrorBoundary.tsx`
- Create: `Build Medical Consultation Platform/src/components/system/ConfigurationGate.tsx`
- Modify: `Build Medical Consultation Platform/src/main.tsx`
- Test: `Build Medical Consultation Platform/tests/foundation-shell.test.mjs`

**Interfaces:**
- Produces: `AppErrorBoundary({ children })`
- Produces: `ConfigurationGate({ children })`
- Consumes: `readRuntimeConfig(import.meta.env)`

- [ ] **Step 1: Extend the failing source-contract test**

Assert that `main.tsx` wraps `<App />` with `<AppErrorBoundary>` and `<ConfigurationGate>`, and that the boundary contains an Arabic recovery heading plus `window.location.reload()`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "Build Medical Consultation Platform" && node --test tests/foundation-shell.test.mjs`  
Expected: FAIL because both wrappers are absent.

- [ ] **Step 3: Implement `AppErrorBoundary`**

Use a React class boundary. Render a calm full-page Arabic recovery surface, a retry button that clears local boundary state, and a reload button. Log only the component stack in development; do not render technical stack traces or user data.

- [ ] **Step 4: Implement `ConfigurationGate`**

Read the runtime contract once. When configuration is complete, render children. When `VITE_ENABLE_PROTOTYPE=true` is explicitly present, render the current prototype with its persistent notice for development only. With complete Supabase values, render the connected application. With empty, partial, or invalid production configuration, show an actionable setup card and do not mount application routes.

- [ ] **Step 5: Wrap the root**

```tsx
<AppErrorBoundary>
  <ConfigurationGate>
    <App />
  </ConfigurationGate>
</AppErrorBoundary>
```

- [ ] **Step 6: Run focused and full tests**

Run: `cd "Build Medical Consultation Platform" && pnpm test`  
Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add "Build Medical Consultation Platform/src/components/system" "Build Medical Consultation Platform/src/main.tsx" "Build Medical Consultation Platform/tests/foundation-shell.test.mjs"
git commit -m "feat: add application recovery boundaries"
```

### Task 4: Shared asynchronous states

**Files:**
- Create: `Build Medical Consultation Platform/src/components/system/AsyncState.tsx`
- Modify: `Build Medical Consultation Platform/src/App.tsx`
- Test: `Build Medical Consultation Platform/tests/foundation-shell.test.mjs`

**Interfaces:**
- Produces: `LoadingState({ label? })`
- Produces: `EmptyState({ title, description, action? })`
- Produces: `ErrorState({ title?, description, onRetry? })`
- Produces: `DeniedState({ description? })`
- Produces: `OfflineState()`

- [ ] **Step 1: Extend the failing test**

Assert that `App.tsx` imports and renders `LoadingState` in both lazy-route fallbacks rather than duplicating inline status markup.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "Build Medical Consultation Platform" && node --test tests/foundation-shell.test.mjs`  
Expected: FAIL because the shared state component does not exist.

- [ ] **Step 3: Implement semantic states**

Each state uses a semantic heading, explanatory text, optional action, `role="status"` for loading and offline updates, `role="alert"` for blocking errors, and no decorative animation when reduced motion is enabled.

- [ ] **Step 4: Replace lazy fallbacks**

Create one reusable `LazyRoute({ children, label })` wrapper in `App.tsx` and use `LoadingState` for labs and training.

- [ ] **Step 5: Run tests, typecheck, and build**

```bash
cd "Build Medical Consultation Platform"
pnpm test
pnpm typecheck
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit**

```bash
git add "Build Medical Consultation Platform/src/components/system/AsyncState.tsx" "Build Medical Consultation Platform/src/App.tsx" "Build Medical Consultation Platform/tests/foundation-shell.test.mjs"
git commit -m "feat: unify application state surfaces"
```

### Task 5: Route accessibility and final verification

**Files:**
- Create: `Build Medical Consultation Platform/src/components/system/RouteAnnouncer.tsx`
- Modify: `Build Medical Consultation Platform/src/App.tsx`
- Modify: `Build Medical Consultation Platform/src/components/layout/Layout.tsx`
- Test: `Build Medical Consultation Platform/tests/foundation-shell.test.mjs`

**Interfaces:**
- Produces: `RouteAnnouncer()` which announces `document.title` after pathname changes.
- Produces: `#main-content` focus target and a skip link.

- [ ] **Step 1: Extend the failing test**

Assert that `Layout.tsx` includes an Arabic skip link targeting `#main-content`, that the main wrapper has `id="main-content"` and `tabIndex={-1}`, and that `App.tsx` mounts `RouteAnnouncer`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "Build Medical Consultation Platform" && node --test tests/foundation-shell.test.mjs`  
Expected: FAIL on missing route accessibility hooks.

- [ ] **Step 3: Implement route announcement**

Use `useLocation()` and an off-screen `aria-live="polite"` region. On pathname changes, focus `#main-content` without forcing scroll and announce the current document title.

- [ ] **Step 4: Add the skip link and main target**

The skip link is visually hidden until focused and uses the semantic token layer. Preserve the existing header/footer and children structure.

- [ ] **Step 5: Run the complete verification gate**

```bash
cd "Build Medical Consultation Platform"
pnpm test
pnpm typecheck
pnpm format:check
pnpm build
```

Expected: zero failures and exit code 0 for every command.

- [ ] **Step 6: Inspect the diff**

Confirm phase one contains no backend client, no clinical-content changes, no fake production fallback, and no inert button added.

- [ ] **Step 7: Commit**

```bash
git add "Build Medical Consultation Platform/src/components/system/RouteAnnouncer.tsx" "Build Medical Consultation Platform/src/App.tsx" "Build Medical Consultation Platform/src/components/layout/Layout.tsx" "Build Medical Consultation Platform/tests/foundation-shell.test.mjs"
git commit -m "feat: complete accessible application foundation"
```
