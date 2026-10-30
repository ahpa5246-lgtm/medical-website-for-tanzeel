import { expect, test } from "@playwright/test"

test("public navigation changes page with a stable header and one active indicator", async ({
  page,
}) => {
  await page.goto("/")
  const header = page.getByRole("banner")
  await expect(header).toBeVisible()
  const desktop = await page
    .getByRole("navigation", { name: "التنقل الرئيسي" })
    .isVisible()
  if (desktop) {
    await page
      .getByRole("navigation", { name: "التنقل الرئيسي" })
      .getByRole("link", { name: "المعرفة الصحية" })
      .click()
  } else {
    await page.getByRole("button", { name: "فتح القائمة" }).click()
    await page
      .locator("#mobile-menu")
      .getByRole("link", { name: "المعرفة الصحية" })
      .click()
  }
  await expect(page).toHaveURL(/\/articles$/)
  await expect(
    page.getByRole("heading", { name: /نماذج شكلية للمحتوى فقط/ }),
  ).toBeVisible()
  await expect(page.getByRole("banner")).toBeVisible()
  await expect(page.locator("[data-page-transition]")).toHaveCount(1)
  if (desktop) {
    await expect(
      page
        .getByRole("navigation", { name: "التنقل الرئيسي" })
        .getByRole("link", { name: "المعرفة الصحية" }),
    ).toHaveAttribute("aria-current", "page")
    await expect(page.locator("[data-nav-indicator]")).toHaveCount(1)
  }
})

test("article category switching preserves filtering and moves a single active marker", async ({
  page,
}) => {
  await page.goto("/articles")
  const filters = page.locator("[data-article-filters]")
  await expect(filters).toBeVisible()
  await expect(filters.locator("[data-filter-indicator]")).toHaveCount(1)
  const category = filters.getByRole("button").nth(1)
  await category.click()
  await expect(category).toHaveAttribute("aria-pressed", "true")
  await expect(filters.locator("[data-filter-indicator]")).toHaveCount(1)
  await expect(
    page.locator('.editorial-articles p[role="status"]'),
  ).toContainText("مقالات تطابق البحث")
  await filters.getByRole("button", { name: "الكل" }).click()
  await expect(filters.getByRole("button", { name: "الكل" })).toHaveAttribute(
    "aria-pressed",
    "true",
  )
})

test("reduced motion skips transitions and preserves direct navigation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  await expect(page.locator("[data-page-transition]")).toHaveAttribute(
    "data-motion",
    "off",
  )
  await page
    .getByRole("link", { name: /تصفح المقالات التجريبية/ })
    .first()
    .click()
  await expect(page).toHaveURL(/\/articles$/)
  await expect(page.locator("[data-page-transition]")).toHaveAttribute(
    "data-motion",
    "off",
  )
  await expect(
    page.getByRole("heading", { name: /نماذج شكلية للمحتوى فقط/ }),
  ).toBeVisible()
})
