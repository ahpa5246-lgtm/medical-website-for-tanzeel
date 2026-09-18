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
