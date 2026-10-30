import { mkdirSync } from "node:fs"
import { expect, test } from "@playwright/test"

test("phone service cards swipe horizontally without stacking or page overflow", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto("/")

  const track = page.locator("[data-capability-carousel]")
  const cards = track.locator(".home-capability")
  await expect(cards).toHaveCount(3)
  await expect(page.getByText("اسحب أفقيًا لاستعراض بقية الخدمات")).toBeVisible()
  await expect(page.locator(".capability-carousel-count")).toHaveText("1 من 3")

  const metrics = await track.evaluate((element) => {
    const items = [...element.children]
    const rects = items.map((node) => node.getBoundingClientRect())
    const viewport = element.getBoundingClientRect()
    return {
      viewportWidth: viewport.width,
      scrollWidth: element.scrollWidth,
      firstWidth: rects[0].width,
      firstX: rects[0].x,
      secondX: rects[1].x,
      firstY: rects[0].y,
      secondY: rects[1].y,
      thirdY: rects[2].y,
      fullWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }
  })
  expect(metrics.scrollWidth).toBeGreaterThan(metrics.viewportWidth + 100)
  expect(metrics.firstWidth).toBeLessThan(metrics.viewportWidth - 18)
  expect(metrics.firstX).toBeGreaterThan(metrics.secondX)
  expect(Math.abs(metrics.firstY - metrics.secondY)).toBeLessThan(3)
  expect(Math.abs(metrics.firstY - metrics.thirdY)).toBeLessThan(3)
  expect(metrics.fullWidth - metrics.clientWidth).toBeLessThanOrEqual(1)

  if (testInfo.project.name === "weak-mobile-chromium") {
    mkdirSync("visual-evidence", { recursive: true })
    await page.locator(".home-editorial-cards").screenshot({
      path: "visual-evidence/mobile-horizontal-cards-first.png",
      animations: "disabled",
    })
  }

  await page.getByRole("button", { name: "البطاقة التالية" }).click()
  await expect(page.locator(".capability-carousel-count")).toHaveText("2 من 3")
  await expect(
    page.getByRole("button", { name: "البطاقة السابقة" }),
  ).toBeEnabled()
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).not.toBe(0)

  if (testInfo.project.name === "weak-mobile-chromium") {
    await page.locator(".home-editorial-cards").screenshot({
      path: "visual-evidence/mobile-horizontal-cards-second.png",
      animations: "disabled",
    })
  }

  await page.getByRole("button", { name: "البطاقة التالية" }).click()
  await expect(page.locator(".capability-carousel-count")).toHaveText("3 من 3")
  await expect(
    page.getByRole("button", { name: "البطاقة التالية" }),
  ).toBeDisabled()
  await page.getByRole("button", { name: "البطاقة السابقة" }).click()
  await expect(page.locator(".capability-carousel-count")).toHaveText("2 من 3")
})

test("desktop retains a three-column grid and hides mobile navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 850 })
  await page.goto("/")
  const cards = page.locator("[data-capability-carousel] .home-capability")
  await expect(cards).toHaveCount(3)
  await expect(page.locator(".capability-carousel-controls")).toBeHidden()
  const heights = await cards.evaluateAll((items) =>
    items.map((node) => Math.round(node.getBoundingClientRect().top)),
  )
  expect(new Set(heights).size).toBe(1)
  await expect(page.locator(".home-capabilities")).toHaveCSS(
    "grid-template-columns",
    /[0-9.]+px [0-9.]+px [0-9.]+px/,
  )
})

test("reduced motion also supports instant phone card navigation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/")
  await page.getByRole("button", { name: "البطاقة التالية" }).click()
  await expect(page.locator(".capability-carousel-count")).toHaveText("2 من 3")
  await expect(
    page.getByRole("button", { name: "البطاقة السابقة" }),
  ).toBeEnabled()
})
