import { expect, test } from "@playwright/test"

test("all consultation URLs show development status without loading consultation data", async ({
  page,
}) => {
  const consultationRequests = []
  page.on("request", (request) => {
    if (/\/rest\/v1\/(consultations|consultation_messages)/.test(request.url()))
      consultationRequests.push(request.url())
  })
  for (const route of [
    "/consultations",
    "/consultations/new",
    "/consultations/test-id",
  ]) {
    await page.goto(route)
    await expect(
      page.getByRole("heading", { name: "الاستشارات الطبية قيد التطوير" }),
    ).toBeVisible()
    await expect(page.locator('input[type="file"], textarea')).toHaveCount(0)
    await expect(
      page.getByRole("link", { name: "استكشف الأكاديمية" }),
    ).toBeVisible()
  }
  expect(consultationRequests).toEqual([])
})
