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
    if (name === "home") {
      await expect(page.getByRole("heading", { name: /الرعاية تبدأ/ })).toBeVisible()
    } else if (name === "articles") {
      await expect(page.getByRole("heading", { name: "نماذج شكلية للمحتوى فقط" })).toBeVisible()
    } else if (name === "training") {
      await expect(page.locator(".training-map")).toBeVisible()
    } else {
      await expect(page.getByRole("heading", { name: "الاستشارات قيد التطوير" })).toBeVisible()
    }
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({
      path: `visual-evidence/${testInfo.project.name}-${name}.png`,
      fullPage: true,
      animations: "disabled",
    })
  }
})
