import { expect, test } from "@playwright/test"

test("home has readable moving labels and no lab navigation", async ({
  page,
}) => {
  await page.goto("/")
  await expect(page.locator(".care-flight-item strong").first()).toBeVisible()
  const size = await page
    .locator(".care-flight-item strong")
    .first()
    .evaluate((element) => parseFloat(getComputedStyle(element).fontSize))
  expect(size).toBeGreaterThanOrEqual(16)
  await expect(page.getByRole("button", { name: "إيقاف الحركة" })).toHaveCount(
    0,
  )
  await expect(page.getByRole("link", { name: "المختبرات" })).toHaveCount(0)
})

test("prototype doctor directory shows clearly fictional records", async ({
  page,
}) => {
  await page.goto("/doctors")
  await expect(
    page.getByRole("heading", { name: "طبيبة تجريبية للأسرة" }),
  ).toBeVisible()
  await expect(page.getByText("تعذر إكمال الطلب")).toHaveCount(0)
})

test("a published course opens a lesson and saves a correct answer", async ({
  page,
}) => {
  await page.goto("/courses")
  await page.getByRole("link", { name: "ابدئي التعلم" }).first().click()
  await expect(
    page.getByRole("heading", { name: "تحديد مصدر المعلومة" }),
  ).toBeVisible()
  await page.getByLabel("اسم الجهة والمصادر").check()
  await page.getByRole("button", { name: "احفظي إكمال الدرس" }).click()
  await expect(page.getByText("أكملتِ 1 من 2 دروس")).toBeVisible()
  await page.reload()
  await expect(page.getByText("أكملتِ 1 من 2 دروس")).toBeVisible()
})

test("author creates and publishes a course visible to readers", async ({
  page,
}) => {
  await page.goto("/courses/new")
  await page.getByLabel("العنوان", { exact: true }).fill("دورة تجريبية جديدة")
  await page.getByLabel("التصنيف", { exact: true }).fill("مهارات صحية")
  await page.getByLabel("اسم الكاتب التجريبي").fill("مدرسة تجريبية")
  await page
    .getByLabel("ملخص البطاقة")
    .fill("تعلم خطوات فحص مصادر المعلومات الصحية قبل نشرها.")
  await page
    .getByLabel("مقدمة الدورة")
    .fill("هذه مقدمة تعليمية تجريبية عن التحقق من مصادر المعلومات الصحية.")
  await page.getByLabel("عنوان الدرس").fill("التحقق من المصدر")
  await page
    .getByLabel("المحتوى")
    .fill("ابدأ بفحص اسم الجهة الناشرة وتاريخ تحديث المادة.")
  await page.getByLabel("سؤال المراجعة").fill("ما أول خطوة؟")
  await page.getByLabel("الخيار 1", { exact: true }).fill("فحص المصدر")
  await page.getByLabel("الخيار 2", { exact: true }).fill("عد الإعجابات")
  await page.getByRole("button", { name: "حفظ المسودة" }).click()
  await expect(page.getByText("حُفظت المسودة.")).toBeVisible()
  await page.getByRole("button", { name: "نشر تجريبي" }).click()
  await expect(
    page.getByText("نُشر المحتوى ويمكن رؤيته في القائمة الآن."),
  ).toBeVisible()
  await page.goto("/courses")
  await expect(
    page.getByRole("heading", { name: "دورة تجريبية جديدة" }),
  ).toBeVisible()
})

test("author creates and publishes a library reference", async ({ page }) => {
  await page.goto("/library/new")
  await page.getByLabel("العنوان", { exact: true }).fill("مرجع تجريبي جديد")
  await page.getByLabel("التصنيف", { exact: true }).fill("أدلة ومراجع")
  await page.getByLabel("اسم الكاتب التجريبي").fill("محرر تجريبي")
  await page
    .getByLabel("ملخص البطاقة")
    .fill("مرجع تجريبي يوضح كيفية عرض مادة جديدة في المكتبة.")
  await page
    .getByLabel("نص المرجع")
    .fill("هذه مادة تجريبية أصلية لغرض اختبار التحرير والنشر وعرضها للقارئ.")
  await page.getByRole("button", { name: "حفظ المسودة" }).click()
  await page.getByRole("button", { name: "نشر تجريبي" }).click()
  await page.goto("/library")
  await expect(
    page.getByRole("heading", { name: "مرجع تجريبي جديد" }),
  ).toBeVisible()
})

test("academy and library stay usable on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  for (const route of [
    "/courses",
    "/library",
    "/courses/new",
    "/library/new",
  ]) {
    await page.goto(route)
    await expect(page.locator("#main-content")).toBeVisible()
    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    )
    expect(horizontalOverflow, `${route} overflows the viewport`).toBe(false)
  }
})
