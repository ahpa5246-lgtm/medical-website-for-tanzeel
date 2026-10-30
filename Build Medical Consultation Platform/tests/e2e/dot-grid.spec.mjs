import { mkdirSync } from "node:fs"
import { expect, test } from "@playwright/test"

test("SVG dot grids are local, fade gently, and never intercept interaction", async ({
  page,
}, testInfo) => {
  await page.goto("/")
  await expect(
    page.getByRole("heading", { name: /الرعاية تبدأ/ }),
  ).toBeVisible()

  const hero = page.locator(".home-hero > [data-dot-grid]")
  const cards = page.locator(".home-editorial-cards > [data-dot-grid]")
  const specialties = page.locator(".home-specialties > [data-dot-grid]")
  for (const field of [hero, cards, specialties]) {
    await expect(field).toHaveAttribute("aria-hidden", "true")
    await expect(field).toHaveCSS("pointer-events", "none")
    const image = await field.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    )
    expect(image).toContain("/patterns/dot-grid-")
    const mask = await field.evaluate(
      (element) => getComputedStyle(element).maskImage,
    )
    expect(mask).not.toBe("none")
  }

  for (const asset of [
    "/patterns/dot-grid-teal.svg",
    "/patterns/dot-grid-sky.svg",
  ]) {
    const response = await page.request.get(asset)
    expect(response.ok()).toBeTruthy()
    expect(await response.text()).toContain("<pattern")
  }
  await expect(page.locator(".home-capability")).toHaveCount(3)
  await expect(
    page.getByRole("link", { name: /SVG Dot Grids by SVGBackgrounds.com/ }),
  ).toBeVisible()
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)

  if (
    ["desktop-chromium", "weak-mobile-chromium"].includes(testInfo.project.name)
  ) {
    mkdirSync("visual-evidence", { recursive: true })
    await page.evaluate(() => document.fonts.ready)
    const file = `visual-evidence/dot-grid-${testInfo.project.name}`
    await page.screenshot({
      path: `${file}-home.png`,
      fullPage: true,
      animations: "disabled",
    })
    await page.locator(".home-editorial-cards").screenshot({
      path: `${file}-cards.png`,
      animations: "disabled",
    })
  }
})

test("faded SVG textures extend to articles and auth without hiding content", async ({
  page,
}) => {
  await page.goto("/articles")
  await expect(
    page.locator(".editorial-articles > [data-dot-grid]"),
  ).toHaveCount(1)
  await expect(
    page.getByRole("heading", { name: /نماذج شكلية للمحتوى فقط/ }),
  ).toBeVisible()
  await page.goto("/auth/login")
  await expect(page.locator(".auth-story > [data-dot-grid]")).toHaveCount(1)
  await expect(
    page.getByRole("heading", { name: "تسجيل الدخول" }),
  ).toBeVisible()
})
