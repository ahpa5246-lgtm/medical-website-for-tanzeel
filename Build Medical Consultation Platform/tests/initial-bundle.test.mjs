import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, statSync } from "node:fs"
import { execFileSync } from "node:child_process"

test("initial JavaScript stays within entry and total budgets", () => {
  execFileSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
    stdio: "pipe",
  })

  const html = readFileSync("dist/index.html", "utf8")
  const entry = html.match(/<script[^>]+src="\/(assets\/[^\"]+\.js)"/)
  assert.ok(entry, "production HTML must have a JavaScript entry")

  const bytes = statSync(`dist/${entry[1]}`).size
  assert.ok(
    bytes < 400_000,
    `initial JavaScript entry is ${bytes} bytes; budget is 400000`,
  )

  const initialAssets = new Set(
    [...html.matchAll(/(?:src|href)="\/(assets\/[^\"]+\.js)"/g)].map(
      (match) => match[1],
    ),
  )
  const initialBytes = [...initialAssets].reduce(
    (total, asset) => total + statSync(`dist/${asset}`).size,
    0,
  )
  assert.ok(
    initialBytes < 550_000,
    `initial JavaScript is ${initialBytes} bytes; budget is 550000`,
  )
})
