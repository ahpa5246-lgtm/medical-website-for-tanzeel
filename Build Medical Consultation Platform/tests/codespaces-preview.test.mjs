import test from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

test("manual dev command listens on the forwarded Codespaces port", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  )

  assert.match(packageJson.scripts.dev, /--port 8443/)
  assert.match(packageJson.scripts.dev, /--strictPort/)
})

test("Codespaces uses a writable user instead of the unavailable node home", async () => {
  const devcontainer = JSON.parse(
    await readFile(
      new URL("../../.devcontainer/devcontainer.json", import.meta.url),
      "utf8",
    ),
  )

  assert.equal(devcontainer.containerUser, "root")
  assert.equal(devcontainer.remoteUser, "root")
})
