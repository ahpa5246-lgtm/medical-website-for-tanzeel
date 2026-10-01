const KEY = "medconnect-content-preview-v1"

const SEED = [
  {
    id: "demo-course-health-sources",
    kind: "course",
    title: "كيف نتحقق من المعلومات الصحية؟",
    summary:
      "دورة عرض قصيرة تعلّم طريقة قراءة المصادر قبل مشاركة أي معلومة صحية.",
    category: "مهارات صحية",
    body: "هذا محتوى تعليمي تجريبي قابل للتعديل. لا يقدم تشخيصًا أو إرشادًا علاجيًا.",
    author_name: "مدرّسة تجريبية",
    author_id: null,
    status: "published",
    lessons: [
      {
        title: "تحديد مصدر المعلومة",
        body: "ابحث عن الجهة التي كتبت النص، وتاريخ نشره، والمصادر التي استند إليها. لا يكفي أن يكون التصميم مقنعًا أو أن يشارك المنشور عدد كبير من الأشخاص.",
        question: "ما المؤشر الأفضل لبدء تقييم منشور صحي؟",
        options: ["عدد الإعجابات", "اسم الجهة والمصادر", "ألوان التصميم"],
        correct_index: 1,
      },
      {
        title: "تمييز الوعود المبالغ فيها",
        body: "الوعود بالعلاج المضمون للجميع أو النتائج الفورية تستحق التوقف والتحقق. تختلف ظروف الناس، ولا يغني منشور عام عن تقييم مختص.",
        question: "أي عبارة تستدعي مزيدًا من التحقق؟",
        options: ["اسأل مختصًا", "نتيجة مضمونة للجميع", "اقرأ المصادر"],
        correct_index: 1,
      },
    ],
    source_url: "",
    updated_at: "2026-10-01T00:00:00.000Z",
    published_at: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "demo-library-health-info",
    kind: "library",
    title: "دليل قراءة المحتوى الصحي على الإنترنت",
    summary:
      "مرجع عرض أصلي يشرح خطوات سريعة للتحقق من الكاتب والتاريخ والمصدر.",
    category: "أدلة ومراجع",
    body: "ابدأ باسم الجهة الناشرة. هل توضح من كتب المحتوى ومن راجعه؟\n\nانظر إلى تاريخ التحديث. قد تصبح المعلومات القديمة غير مناسبة مع تغير الأدلة.\n\nابحث عن مصادر واضحة، وقارن الادعاء بمصدر موثوق آخر.\n\nإذا كان القرار يتعلق بصحتك أو دوائك، فاستشر مختصًا مرخصًا بدل الاعتماد على مادة عامة.",
    author_name: "فريق المحتوى التجريبي",
    author_id: null,
    status: "published",
    lessons: [],
    source_url: "",
    updated_at: "2026-10-01T00:00:00.000Z",
    published_at: "2026-10-01T00:00:00.000Z",
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

function validate(input) {
  if (input.title?.trim().length < 8)
    throw new Error("العنوان يجب أن يكون 8 أحرف على الأقل.")
  if (input.summary?.trim().length < 20)
    throw new Error("الملخص يجب أن يكون 20 حرفًا على الأقل.")
  if (input.body?.trim().length < 30)
    throw new Error("المحتوى يجب أن يكون 30 حرفًا على الأقل.")
  if (!input.category?.trim()) throw new Error("اختاري تصنيفًا.")
  if (!input.author_name?.trim()) throw new Error("اسم الكاتب مطلوب.")
  if (input.kind !== "course" && input.kind !== "library")
    throw new Error("نوع المحتوى غير صالح.")
  if (input.kind === "course") {
    if (!Array.isArray(input.lessons) || input.lessons.length < 1)
      throw new Error("أضيفي درسًا واحدًا على الأقل.")
    for (const lesson of input.lessons) {
      if (!lesson.title?.trim() || !lesson.body?.trim())
        throw new Error("عنوان الدرس ومحتواه مطلوبان.")
      if (
        !lesson.question?.trim() ||
        lesson.options?.length < 2 ||
        !lesson.options.every((option) => option.trim())
      )
        throw new Error("أضيفي سؤالًا وخيارين لكل درس.")
      if (
        !Number.isInteger(lesson.correct_index) ||
        lesson.correct_index < 0 ||
        lesson.correct_index >= lesson.options.length
      )
        throw new Error("حددي الإجابة الصحيحة لكل درس.")
    }
  }
}

export function listDemoContent(storage, kind, includeDrafts = false) {
  return all(storage).filter(
    (entry) =>
      entry.kind === kind && (includeDrafts || entry.status === "published"),
  )
}

export function getDemoContent(storage, id) {
  return all(storage).find((entry) => entry.id === id) ?? null
}

export function saveDemoContent(storage, input) {
  validate(input)
  const entries = all(storage)
  const index = entries.findIndex((entry) => entry.id === input.id)
  const entry = {
    ...input,
    id: input.id || crypto.randomUUID(),
    title: input.title.trim(),
    summary: input.summary.trim(),
    body: input.body.trim(),
    category: input.category.trim(),
    author_name: input.author_name.trim(),
    author_id: null,
    status: "draft",
    published_at: null,
    updated_at: new Date().toISOString(),
    source_url: input.source_url || "",
  }
  if (index < 0) entries.unshift(entry)
  else entries[index] = entry
  storage.setItem(KEY, JSON.stringify(entries))
  return entry
}

export function publishDemoContent(storage, id) {
  const entries = all(storage)
  const index = entries.findIndex((entry) => entry.id === id)
  if (index < 0) throw new Error("المحتوى غير موجود.")
  validate(entries[index])
  entries[index] = {
    ...entries[index],
    status: "published",
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  storage.setItem(KEY, JSON.stringify(entries))
  return entries[index]
}
