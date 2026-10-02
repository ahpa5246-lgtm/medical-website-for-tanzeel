import assert from "node:assert/strict"
import test from "node:test"
import {
  listDemoSpaceEntries,
  saveDemoSpaceEntry,
  publishDemoSpaceEntry,
} from "../src/features/tanzeel/demoSpace.mjs"

function memoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

test("space starts with clearly labeled editable examples in every section", () => {
  const entries = listDemoSpaceEntries(memoryStorage())
  assert.deepEqual(
    new Set(entries.map((entry) => entry.kind)),
    new Set(["book_review", "article", "achievement", "course"]),
  )
  assert.ok(entries.every((entry) => entry.is_demo))
})

test("a saved draft becomes visible after publication and survives reload", () => {
  const storage = memoryStorage()
  const draft = saveDemoSpaceEntry(storage, {
    kind: "book_review",
    title: "كتاب اختباري عن الثقافة الصحية",
    summary: "مراجعة شخصية تجريبية قابلة للاستبدال بمراجعة الدكتورة الحقيقية.",
    body: "هذا ملخص تجريبي يوضح كيف تظهر أفكار القراءة والتقييم في مساحة تنزيل.",
    rating: 4,
    link_url: "",
  })
  assert.equal(
    listDemoSpaceEntries(storage).some((entry) => entry.id === draft.id),
    false,
  )
  publishDemoSpaceEntry(storage, draft.id)
  assert.equal(
    listDemoSpaceEntries(storage).some((entry) => entry.id === draft.id),
    true,
  )
})

test("invalid ratings and unsafe links cannot be saved", () => {
  const storage = memoryStorage()
  const input = {
    kind: "book_review",
    title: "كتاب اختباري عن الثقافة الصحية",
    summary: "مراجعة شخصية تجريبية قابلة للاستبدال بمراجعة الدكتورة الحقيقية.",
    body: "هذا ملخص تجريبي يوضح كيف تظهر أفكار القراءة والتقييم في مساحة تنزيل.",
    rating: 6,
    link_url: "",
  }
  assert.throws(() => saveDemoSpaceEntry(storage, input), /التقييم/)
  assert.throws(
    () =>
      saveDemoSpaceEntry(storage, {
        ...input,
        rating: 4,
        link_url: "javascript:alert(1)",
      }),
    /الرابط/,
  )
})
