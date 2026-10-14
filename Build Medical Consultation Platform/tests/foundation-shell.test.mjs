import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("global stylesheet imports the semantic foundation", () => {
  const css = read("src/index.css")
  assert.match(css, /@import ["']\.\/styles\/tokens\.css["'];/)
  assert.match(css, /@import ["']\.\/styles\/foundation\.css["'];/)
})

test("foundation provides focus, touch, and reduced-motion behavior", () => {
  const css = read("src/styles/foundation.css")
  assert.match(css, /:focus-visible/)
  assert.match(css, /prefers-reduced-motion/)
  assert.match(css, /min-height:\s*44px/)
})

test("semantic tokens cover product states", () => {
  const css = read("src/styles/tokens.css")
  for (const token of [
    "--mc-canvas",
    "--mc-surface",
    "--mc-ink",
    "--mc-muted",
    "--mc-edge",
    "--mc-accent",
    "--mc-learning",
    "--mc-critical",
    "--mc-focus",
  ]) {
    assert.match(css, new RegExp(token))
  }
})

test("root is protected by configuration and error boundaries", () => {
  const main = read("src/main.tsx")
  const boundary = read("src/components/system/AppErrorBoundary.tsx")
  const gate = read("src/components/system/ConfigurationGate.tsx")

  assert.match(main, /<AppErrorBoundary>/)
  assert.match(main, /<ConfigurationGate>/)
  assert.match(boundary, /تعذر عرض المنصة/)
  assert.match(boundary, /window\.location\.reload\(\)/)
  assert.match(gate, /VITE_ENABLE_PROTOTYPE/)
  assert.match(gate, /إعداد المنصة غير مكتمل/)
})

test("lazy routes use one shared loading surface", () => {
  const app = read("src/App.tsx")
  const states = read("src/components/system/AsyncState.tsx")

  assert.match(app, /import.*LoadingState.*AsyncState/)
  assert.match(app, /<LoadingState/)
  assert.match(states, /export function LoadingState/)
  assert.match(states, /export function EmptyState/)
  assert.match(states, /export function ErrorState/)
  assert.match(states, /export function DeniedState/)
  assert.match(states, /export function OfflineState/)
})

test("layout supports skip navigation and route announcements", () => {
  const layout = read("src/components/layout/Layout.tsx")
  const surface = read("src/components/system/RouteSurface.tsx")
  const announcer = read("src/components/system/RouteAnnouncer.tsx")

  assert.match(layout, /href="#main-content"/)
  assert.match(layout, /id="main-content"/)
  assert.match(layout, /tabIndex=\{-1\}/)
  assert.match(surface, /<RouteAnnouncer\s*\/>/)
  assert.match(announcer, /aria-live="polite"/)
  assert.match(surface, /preventScroll:\s*true/)
})
