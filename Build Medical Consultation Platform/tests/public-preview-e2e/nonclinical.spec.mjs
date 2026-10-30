import { expect, test } from "@playwright/test"

test("nonclinical public preview displays fictional content without medical intake", async ({
  page,
}) => {
  const errors = []
  const remoteMedicalRequests = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("request", (request) => {
    if (request.url().includes(".supabase.co")) {
      remoteMedicalRequests.push(request.url())
    }
  })
  await page.goto("/")
  await expect(
    page.getByRole("heading", { name: /الرعاية تبدأ/ }),
  ).toBeVisible()
  await expect(page.getByText(/نسخة عرض غير طبية/)).toBeVisible()
  await expect(page.getByPlaceholder("اكتب سؤالك أو ابحث عن تخصص")).toHaveCount(
    0,
  )
  await page.getByRole("link", { name: "تصفح المقالات التجريبية" }).click()
  await expect(
    page.getByRole("heading", { name: /نماذج شكلية للمحتوى/ }),
  ).toBeVisible()
  expect(remoteMedicalRequests).toEqual([])
  expect(errors).toEqual([])
})

test("preview routes forbid accounts, consultations, medical verification and admin", async ({
  page,
}) => {
  const routes = [
    ["/consultations", "الاستشارات قيد التطوير"],
    ["/consultations/new", "الاستشارات قيد التطوير"],
    ["/consultations/record-1", "الاستشارات قيد التطوير"],
    ["/auth/signup", "الحسابات قيد التطوير"],
    ["/auth/login", "الحسابات قيد التطوير"],
    ["/auth/update-password", "الحسابات قيد التطوير"],
    ["/admin", "لوحة الإدارة قيد التطوير"],
    ["/verification/apply", "التحقق من الأطباء قيد التطوير"],
    ["/doctors", "دليل الأطباء قيد التطوير"],
    ["/articles/new", "إرسال المقالات قيد التطوير"],
  ]
  for (const [route, heading] of routes) {
    await page.goto(route)
    await expect(page.getByRole("heading", { name: heading })).toBeVisible()
    await expect(page.locator('input[type="password"]')).toHaveCount(0)
    await expect(page.locator('input[type="file"]')).toHaveCount(0)
    await expect(page.locator("textarea")).toHaveCount(0)
  }
})
