const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const bounded = (value, min, max) =>
  typeof value === "string" &&
  value.trim().length >= min &&
  value.trim().length <= max
const result = (ok, message) => ({ ok, message: ok ? "" : message })
export function validateContent(input) {
  return result(
    ["article", "course", "resource"].includes(input.kind) &&
      bounded(input.title, 8, 200) &&
      bounded(input.body, 80, 50000) &&
      bounded(input.category, 1, 80),
    "أضف عنوانًا من 8–200 حرف ومحتوى من 80–50000 حرف وتصنيفًا.",
  )
}
export function validateVerification(input) {
  return result(
    bounded(input.name, 3, 120) &&
      uuid.test(input.specialty || "") &&
      bounded(input.license, 3, 100) &&
      Number.isInteger(Number(input.experience)) &&
      Number(input.experience) >= 0 &&
      Number(input.experience) <= 80 &&
      input.consent === true,
    "أكمل المعلومات المهنية والتخصص والخبرة وإقرار صحة المعلومات.",
  )
}
export function validateReport(input) {
  return result(
    uuid.test(input.contentId || "") && bounded(input.reason, 10, 1000),
    "اكتب سببًا واضحًا من 10 إلى 1000 حرف.",
  )
}
