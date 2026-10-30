import { expect, test } from "@playwright/test"
import { mkdirSync } from "node:fs"

test("editorial home has semantic CTAs and creative layer without blocking content", async ({
  page,
}, testInfo) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: /الرعاية تبدأ/ })).toBeVisible()
  await expect(page.getByRole("link", { name: /تصفح المقالات التجريبية/ })).toBeVisible()
  await expect(page.locator(".hero-illustration")).toBeVisible()
  await expect(page.locator(".home-capability")).toHaveCount(3)
  await expect(page.locator(".home-editorial-cards")).toBeVisible()
  await expect(page.locator(".editorial-home .pattern-doodle").first()).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
  if (testInfo.project.name === "desktop-chromium") {
    mkdirSync("visual-evidence", { recursive: true })
    await page.screenshot({
      path: "visual-evidence/editorial-desktop-home.png",
      fullPage: true,
      animations: "disabled",
    })
  }
})

test("login, signup and password recovery share the same illustrated layout", async ({
  page,
}, testInfo) => {
  for (const [path, title] of [
    ["/auth/login", "تسجيل الدخول"],
    ["/auth/signup", "إنشاء حساب"],
    ["/auth/forgot-password", "استعادة الوصول"],
  ]) {
    await page.goto(path)
    await expect(page.locator(".auth-editorial-layout")).toBeVisible()
    await expect(page.locator(".auth-story")).toBeVisible()
    await expect(page.locator(".auth-form-panel")).toBeVisible()
    await expect(page.getByRole("heading", { name: title })).toBeVisible()
  }
  if (testInfo.project.name === "desktop-chromium") {
    await page.goto("/auth/login")
    mkdirSync("visual-evidence", { recursive: true })
    await page.screenshot({
      path: "visual-evidence/editorial-desktop-login.png",
      fullPage: true,
      animations: "disabled",
    })
  }
})
