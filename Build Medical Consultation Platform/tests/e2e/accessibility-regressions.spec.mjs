import { expect, test } from "@playwright/test"

test("tablet navigation exposes every primary destination", async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 1000 })
  await page.goto("/")
  const toggle = page.getByRole("button", { name: "فتح القائمة" })
  await expect(toggle).toBeVisible()
  await toggle.click()
  const menu = page.locator("#mobile-menu")
  await expect(
    menu.getByRole("link", { name: "الأطباء", exact: true }),
  ).toBeVisible()
  await menu.getByRole("link", { name: "الأطباء", exact: true }).click()
  await expect(page).toHaveURL(/\/doctors$/)
  await expect(menu).toHaveCount(0)
})

test("Escape closes the mobile menu and returns keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto("/")
  await page.getByRole("button", { name: "فتح القائمة" }).click()
  await page.locator("#mobile-menu a").first().focus()
  await page.keyboard.press("Escape")
  await expect(page.locator("#mobile-menu")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "فتح القائمة" })).toBeFocused()
})

test("article search reports no results and can reset its filters", async ({
  page,
}) => {
  await page.goto("/articles")
  await page
    .getByRole("searchbox", { name: "ابحث في المقالات" })
    .fill("no-matching-article-12345")
  await expect(
    page.getByRole("status").filter({ hasText: "مقالات تطابق البحث" }),
  ).toHaveText("0 مقالات تطابق البحث")
  await page.getByRole("button", { name: "مسح الفلاتر" }).click()
  await expect(
    page.getByRole("searchbox", { name: "ابحث في المقالات" }),
  ).toHaveValue("")
  await expect(
    page.getByRole("button", { name: "الكل", exact: true }),
  ).toHaveAttribute("aria-pressed", "true")
})
