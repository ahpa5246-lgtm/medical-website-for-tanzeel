import assert from "node:assert/strict"
import test from "node:test"
import {
  listDemoContent,
  saveDemoContent,
  publishDemoContent,
  getDemoContent,
} from "../src/features/content/demoContent.mjs"

const makeStorage = () => {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

test("demo course can be edited, published, and read after a fresh load", () => {
  const storage = makeStorage()
  const saved = saveDemoContent(storage, {
    kind: "course",
    title: "دورة تجريبية جديدة",
    summary: "مسار قصير لفهم مصادر المعلومات الصحية.",
    body: "هذا نص مقدمة تجريبية قابل للتعديل قبل النشر.",
    category: "مهارات صحية",
    author_name: "مدرسة تجريبية",
    lessons: [
      {
        title: "الدرس الأول",
        body: "اقرأ المصدر وتاريخ النشر قبل مشاركة المعلومة.",
        question: "ما أول شيء تفحصه؟",
        options: ["لون الصفحة", "مصدر المعلومة"],
        correct_index: 1,
      },
    ],
  })
  assert.equal(saved.status, "draft")
  assert.equal(
    listDemoContent(storage, "course").some((item) => item.id === saved.id),
    false,
  )

  publishDemoContent(storage, saved.id)
  assert.equal(getDemoContent(storage, saved.id)?.status, "published")
  assert.equal(
    listDemoContent(storage, "course").some((item) => item.id === saved.id),
    true,
  )
})

test("invalid content cannot be published", () => {
  const storage = makeStorage()
  assert.throws(
    () =>
      saveDemoContent(storage, {
        kind: "library",
        title: "",
        summary: "",
        body: "",
        category: "",
        author_name: "",
        lessons: [],
      }),
    /العنوان/,
  )
})
