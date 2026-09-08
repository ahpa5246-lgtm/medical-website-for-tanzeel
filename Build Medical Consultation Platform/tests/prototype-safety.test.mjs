import { readFileSync } from "node:fs"
import test from "node:test"
import assert from "node:assert/strict"

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("persistent warning wraps every route and cannot be dismissed", () => {
  const app = read("src/App.tsx")
  const notice = read("src/components/PreviewNotice.tsx")
  assert.match(app, /<BrowserRouter>\s*<PreviewNotice \/>\s*<Routes>/)
  assert.doesNotMatch(notice, /useState|onClick|button|\bX\b/)
  assert.match(notice, /نموذج أولي غير تشغيلي/)
})

test("medical question content is not read from or written to URL parameters", () => {
  const home = read("src/pages/Home.tsx")
  const submit = read("src/pages/consultations/Submit.tsx")
  assert.doesNotMatch(home, /encodeURIComponent|\?q=/)
  assert.doesNotMatch(submit, /params\.get\(["']q["']\)/)
})

test("prototype has no file input or file-selection API", () => {
  const submit = read("src/pages/consultations/Submit.tsx")
  assert.doesNotMatch(
    submit,
    /type=["']file["']|\.files|FileReader|showOpenFilePicker/,
  )
  assert.match(submit, /اختيار الملفات معطّل/)
})

test("emergency numbers and copy have one source", () => {
  const emergency = read("src/lib/emergency.ts")
  for (const path of [
    "src/components/EmergencyBanner.tsx",
    "src/pages/legal/Disclaimer.tsx",
    "src/components/layout/Footer.tsx",
  ]) {
    const source = read(path)
    assert.doesNotMatch(source, /tel:911|tel:122/)
  }
  assert.match(emergency, /tel:911/)
  assert.match(emergency, /tel:122/)
})

test("mock content is labelled at each repeated point of use", () => {
  for (const path of [
    "src/pages/consultations/List.tsx",
    "src/pages/consultations/Thread.tsx",
    "src/pages/doctors/Directory.tsx",
    "src/pages/doctors/Profile.tsx",
    "src/pages/articles/List.tsx",
    "src/pages/articles/Detail.tsx",
    "src/pages/Home.tsx",
  ]) {
    assert.match(read(path), /<DemoLabel/)
  }
})

test("privacy notice explicitly negates unsupported prototype capabilities", () => {
  const privacy = read("src/pages/legal/Privacy.tsx")
  for (const phrase of [
    "لا ندّعي توفير تشفير",
    "إخفاء هوية",
    "سجل تدقيق",
    "حذفها أو تصديرها",
  ])
    assert.match(privacy, new RegExp(phrase))
})

test("robots remain noindex and nofollow", () => {
  assert.match(read("index.html"), /name="robots" content="noindex, nofollow"/)
})

test("terms page states every operational capability is unavailable", () => {
  const terms = read("src/pages/legal/Terms.tsx")
  for (const limitation of [
    "لا توجد حسابات مستخدمين",
    "لا يوجد أطباء أو ممارسون صحيون",
    "لا توجد عملية تحقق",
    "لا توجد خدمة لنشر",
    "لا توجد قواعد استخدام تشغيلية أو آلية إنفاذ أو تعليق",
    "لا تُرسل إشعارات",
    "لا توجد قناة دعم قانوني",
    "لا توجد حقوق تشغيلية",
  ]) {
    assert.match(terms, new RegExp(limitation))
  }
  assert.match(terms, /وليس شروط خدمة/)
})

test("terms page contains none of the removed promises or obligations", () => {
  const terms = read("src/pages/legal/Terms.tsx")
  for (const removedPhrase of [
    "قبول الشروط",
    "فأنت توافق",
    "بيانات صحيحة عند التسجيل",
    "تقديم وثائق حقيقية",
    "تمنح ميدكونكت رخصة",
    "تعليق أو إنهاء أي حساب",
    "عبر البريد الإلكتروني أو الإشعارات",
    "legal@medconnect.app",
  ]) {
    assert.doesNotMatch(terms, new RegExp(removedPhrase))
  }
})

test("home point-of-use workflow labels are explicitly fictional", () => {
  const home = read("src/pages/Home.tsx")
  for (const removedPhrase of [
    "قيد المراجعة",
    "استشارة خاصة",
    "ترخيص مراجع",
    "الطبيب المستجيب",
    "حماية المريض",
    "مسار الرعاية",
  ]) {
    assert.doesNotMatch(home, new RegExp(removedPhrase))
  }
  assert.match(home, /بطاقة واجهة خيالية/)
  assert.match(home, /لا تقدم رعاية ولا تحمي مريضًا/)
})
