import { expect, test } from "@playwright/test"

test("prototype build displays the actual home rather than configuration error", async ({
  page,
}) => {
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/")
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
  await expect(
    page.getByRole("heading", { name: /الرعاية تبدأ/ }),
  ).toBeVisible()
  expect(errors).toEqual([])
})

test("key public routes render without a blank application or horizontal overflow", async ({
  page,
}) => {
  const routes = [
    "/",
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/update-password",
    "/auth/accept-invite",
    "/consultations/new",
    "/doctors",
    "/articles",
    "/legal/disclaimer",
    "/legal/privacy",
    "/labs",
    "/training",
  ]
  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator("#root")).not.toBeEmpty()
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    )
    expect(overflow, `horizontal overflow on ${route}`).toBeLessThanOrEqual(1)
  }
})

test("closed consultation routes never accept medical data", async ({ page }) => {
  for (const route of ["/consultations", "/consultations/new", "/consultations/example"]) {
    await page.goto(route)
    await expect(
      page.getByRole("heading", { name: "الاستشارات قيد التطوير" }),
    ).toBeVisible()
    await expect(page.locator("textarea")).toHaveCount(0)
    await expect(page.locator('input[type="file"]')).toHaveCount(0)
    await expect(
      page.getByRole("button", { name: "حفظ وإرسال الاستشارة" }),
    ).toHaveCount(0)
  }
})

test("home does not prompt for private medical questions", async ({ page }) => {
  await page.goto("/")
  await expect(
    page.getByPlaceholder("اكتب سؤالك أو ابحث عن تخصص"),
  ).toHaveCount(0)
  await expect(
    page.getByRole("link", { name: "الاستشارات قيد التطوير" }).first(),
  ).toBeVisible()
})

test("recovery and invitation pages show a safe unauthenticated state", async ({
  page,
}) => {
  await page.goto("/auth/update-password")
  await expect(
    page.getByRole("link", { name: "طلب رابط استعادة جديد" }),
  ).toBeVisible()
  await page.goto("/auth/accept-invite")
  await expect(page.getByRole("link", { name: "تسجيل الدخول" })).toBeVisible()
})

test("mobile navigation opens and closes accessibly", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name !== "weak-mobile-chromium") return
  await page.goto("/")
  const open = page.getByRole("button", { name: "فتح القائمة" })
  await open.click()
  await expect(page.locator("#mobile-menu")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "إغلاق القائمة" }),
  ).toHaveAttribute("aria-expanded", "true")
  await page.getByRole("button", { name: "إغلاق القائمة" }).click()
  await expect(page.locator("#mobile-menu")).toHaveCount(0)
})
