import { test, expect } from "@playwright/test"

test("home renders in RTL without runtime crashes", async ({ page }) => {
  const runtimeErrors = []
  page.on("pageerror", (error) => runtimeErrors.push(error.message))

  await page.goto("/", { waitUntil: "networkidle" })

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
  await expect(page.locator("#root")).not.toBeEmpty()
  expect(runtimeErrors).toEqual([])
})

test("viewport has no horizontal overflow", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" })

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )

  expect(overflow).toBeLessThanOrEqual(1)
})

test("direct navigation to signup does not produce a blank application", async ({
  page,
}) => {
  await page.goto("/auth/signup", { waitUntil: "networkidle" })
  await expect(page.locator("#root")).not.toBeEmpty()
})
