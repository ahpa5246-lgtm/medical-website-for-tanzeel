import { mkdirSync } from "node:fs"
import { expect, test } from "@playwright/test"

test("capture actual nonclinical preview pages for visual review", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000)
  mkdirSync("visual-evidence", { recursive: true })

  for (const [route, name] of [
    ["/", "home"],
    ["/articles", "articles"],
    ["/training", "training"],
    ["/consultations", "consultations-on-hold"],
  ]) {
    await page.goto(route)
    await expect(page.locator("#root")).not.toBeEmpty()
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({
      path: `visual-evidence/${testInfo.project.name}-${name}.png`,
      fullPage: true,
      animations: "disabled",
    })
  }
})
