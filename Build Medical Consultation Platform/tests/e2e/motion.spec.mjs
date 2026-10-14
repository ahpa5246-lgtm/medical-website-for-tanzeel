import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__routeAnimations = []
    const animate = Element.prototype.animate
    Element.prototype.animate = function (frames, options) {
      window.__routeAnimations.push({ duration: options.duration, frames })
      return animate.call(this, frames, options)
    }
  })
})

test("tablet retains navigation and page changes receive restrained motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 1000 })
  await page.goto("/")
  await page.getByRole("button", { name: "فتح القائمة" }).click()
  await page
    .locator("#mobile-menu")
    .getByRole("link", { name: "المعرفة الصحية", exact: true })
    .click()
  await expect(page).toHaveURL(/\/articles$/)
  await expect(
    page.getByRole("heading", { name: "المعرفة الصحية", exact: true }),
  ).toBeVisible()
  await expect(page.locator("#mobile-menu")).toHaveCount(0)
  const animations = await page.evaluate(() => window.__routeAnimations)
  expect(
    animations.some(
      (a) => a.duration === 180 && a.frames[0].transform === "translateY(6px)",
    ),
  ).toBe(true)
  await expect(page.locator('[data-route-surface="/articles"]')).toBeVisible()
  expect(await page.locator("main").count()).toBe(1)
})

test("query changes preserve input without restarting route motion", async ({
  page,
}) => {
  await page.goto("/doctors")
  await expect(page.getByRole("searchbox")).toBeVisible()
  const before = await page.evaluate(() => window.__routeAnimations.length)
  await page.getByRole("searchbox").fill("Synthetic")
  await expect(page).toHaveURL(/q=Synthetic/)
  await expect(page.getByRole("searchbox")).toHaveValue("Synthetic")
  expect(await page.evaluate(() => window.__routeAnimations.length)).toBe(
    before,
  )
})

test("reduced motion disables route animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/training")
  await expect(
    page.getByRole("button", { name: /تفاصيل المهمة/ }),
  ).toBeVisible()
  expect(await page.evaluate(() => window.__routeAnimations.length)).toBe(0)
  await page.getByRole("button", { name: /تفاصيل المهمة/ }).click()
  await expect(page.locator("#task-details")).toBeVisible()
  await page.getByRole("button", { name: /تفاصيل المهمة/ }).click()
  await expect(page.locator("#task-details")).toHaveCount(0)
})

test("Escape closes tablet disclosure and returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto("/")
  const toggle = page.getByRole("button", { name: "فتح القائمة" })
  await toggle.click()
  await page.keyboard.press("Escape")
  await expect(page.locator("#mobile-menu")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "فتح القائمة" })).toBeFocused()
})
