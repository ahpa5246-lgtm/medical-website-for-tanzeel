const KEY = "medconnect-tanzeel-space-v1"

const SEED = [
  {
    id: "demo-book-review",
    kind: "book_review",
    title: "عنوان كتاب ستضيفه د. تنزيل",
    summary:
      "نموذج لمراجعة كتاب قرأته الدكتورة؛ يُستبدل بالعنوان ورأيها وتقييمها الحقيقي.",
    body: "هذه مساحة لعرض سبب اختيار الكتاب، أبرز الأفكار التي وجدتها الدكتورة مفيدة، وما الذي توصي به للقارئ. النص المعروض الآن تجريبي فقط.",
    rating: 4,
    link_url: "",
    is_demo: true,
    status: "published",
    revision: 1,
    published_at: "2026-10-01T00:00:00.000Z",
    updated_at: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "demo-article",
    kind: "article",
    title: "كيف نختار مصدرًا صحيًا موثوقًا؟",
    summary:
      "نموذج لشكل المقال الذي يمكن للدكتورة كتابته ونشره من مساحة التحرير.",
    body: "يبدأ تقييم أي معلومة صحية بمعرفة الجهة التي نشرتها وتاريخ تحديثها. يُستبدل هذا النص بمقال الدكتورة الأصلي بعد كتابته ومراجعته.",
    rating: null,
    link_url: "",
    is_demo: true,
    status: "published",
    revision: 1,
    published_at: "2026-10-01T00:00:00.000Z",
    updated_at: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "demo-achievement",
    kind: "achievement",
    title: "إنجاز مهني سيُضاف هنا",
    summary:
      "بطاقة نموذجية لإظهار أحدث إنجاز موثّق وتاريخه بعد إضافة المعلومات الحقيقية.",
    body: "يمكن كتابة وصف الإنجاز والجهة ذات الصلة هنا. لا تمثل هذه البطاقة شهادة أو إنجازًا فعليًا للدكتورة.",
    rating: null,
    link_url: "",
    is_demo: true,
    status: "published",
    revision: 1,
    published_at: "2026-10-01T00:00:00.000Z",
    updated_at: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "demo-course",
    kind: "course",
    title: "دورة ستنشرها د. تنزيل",
    summary:
      "معاينة لشكل الدورة الخاصة بها؛ يمكن ربطها بدورة منشورة في الأكاديمية.",
    body: "تُضاف هنا مقدمة قصيرة عن أهداف الدورة والفئة التي ستستفيد منها.",
    rating: null,
    link_url: "/courses/demo-course-health-sources",
    is_demo: true,
    status: "published",
    revision: 1,
    published_at: "2026-10-01T00:00:00.000Z",
    updated_at: "2026-10-01T00:00:00.000Z",
  },
]

function all(storage) {
  try {
    const saved = JSON.parse(storage.getItem(KEY) || "null")
    return Array.isArray(saved) ? saved : structuredClone(SEED)
  } catch {
    return structuredClone(SEED)
  }
}

export function validateSpaceEntry(input) {
  if (!["book_review", "article", "achievement", "course"].includes(input.kind))
    throw new Error("نوع المنشور غير صالح.")
  if ((input.title || "").trim().length < 8)
    throw new Error("العنوان يحتاج 8 أحرف على الأقل.")
  if ((input.summary || "").trim().length < 20)
    throw new Error("الملخص يحتاج 20 حرفًا على الأقل.")
  if ((input.body || "").trim().length < 30)
    throw new Error("النص يحتاج 30 حرفًا على الأقل.")
  if (
    input.kind === "book_review" &&
    (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5)
  )
    throw new Error("التقييم يجب أن يكون من 1 إلى 5.")
  if (
    input.link_url &&
    !/^https:\/\/[^\s]+$/.test(input.link_url) &&
    !/^\/(courses|articles)\/[a-zA-Z0-9-]+$/.test(input.link_url)
  )
    throw new Error("الرابط يجب أن يكون HTTPS أو رابط دورة/مقال داخل الموقع.")
}

export function listDemoSpaceEntries(storage, includeDrafts = false) {
  return all(storage).filter(
    (entry) => includeDrafts || entry.status === "published",
  )
}

export function getDemoSpaceEntry(storage, id) {
  return all(storage).find((entry) => entry.id === id) ?? null
}

export function saveDemoSpaceEntry(storage, input) {
  validateSpaceEntry(input)
  const entries = all(storage)
  const index = entries.findIndex((entry) => entry.id === input.id)
  const previous = index >= 0 ? entries[index] : null
  const entry = {
    ...input,
    id: input.id || crypto.randomUUID(),
    title: input.title.trim(),
    summary: input.summary.trim(),
    body: input.body.trim(),
    rating: input.kind === "book_review" ? input.rating : null,
    link_url: (input.link_url || "").trim(),
    is_demo: false,
    status: "draft",
    revision: (previous?.revision ?? 0) + 1,
    published_at: null,
    updated_at: new Date().toISOString(),
  }
  if (index >= 0) entries[index] = entry
  else entries.unshift(entry)
  storage.setItem(KEY, JSON.stringify(entries))
  return entry
}

export function publishDemoSpaceEntry(storage, id) {
  const entries = all(storage)
  const index = entries.findIndex((entry) => entry.id === id)
  if (index < 0) throw new Error("المنشور غير موجود.")
  validateSpaceEntry(entries[index])
  entries[index] = {
    ...entries[index],
    status: "published",
    revision: entries[index].revision + 1,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  storage.setItem(KEY, JSON.stringify(entries))
  return entries[index]
}

export function archiveDemoSpaceEntry(storage, id) {
  const entries = all(storage)
  const index = entries.findIndex((entry) => entry.id === id)
  if (index < 0) throw new Error("المنشور غير موجود.")
  entries[index] = {
    ...entries[index],
    status: "archived",
    published_at: null,
    revision: entries[index].revision + 1,
    updated_at: new Date().toISOString(),
  }
  storage.setItem(KEY, JSON.stringify(entries))
  return entries[index]
}
