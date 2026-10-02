import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, statSync, mkdtempSync, existsSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { tmpdir } from "node:os"
import { join } from "node:path"

test("initial JavaScript stays within entry and total budgets", () => {
  const output = mkdtempSync(join(tmpdir(), "medical-bundle-budget-"))
  const preparedHtml = existsSync("dist/index.html")
    ? readFileSync("dist/index.html", "utf8")
    : null
  execFileSync(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "build", "--outDir", output],
    {
      stdio: "pipe",
    },
  )

  if (preparedHtml !== null)
    assert.equal(
      readFileSync("dist/index.html", "utf8"),
      preparedHtml,
      "budget verification must preserve the prepared deployment",
    )
  const html = readFileSync(join(output, "index.html"), "utf8")
  const entry = html.match(/<script[^>]+src="\/(assets\/[^\"]+\.js)"/)
  assert.ok(entry, "production HTML must have a JavaScript entry")

  const bytes = statSync(join(output, entry[1])).size
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
    (total, asset) => total + statSync(join(output, asset)).size,
    0,
  )
  assert.ok(
    initialBytes < 550_000,
    `initial JavaScript is ${initialBytes} bytes; budget is 550000`,
  )
})
