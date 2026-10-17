export type LabModuleType = "branching-case" | "anatomy-3d" | "rapid-quiz"

export interface LabModule {
  id: string
  title: string
  specialty: string
  description: string
  type: LabModuleType
  difficulty: "مبتدئ" | "متوسط"
  xpReward: number
  estimatedMinutes: number
  status: "pilot-shell" | "playable-demo" | "planned"
  reviewStatus: "unreviewed-placeholder"
  stages: string[]
}

export const LAB_MODULES: LabModule[] = [
  {
    id: "chest-pain-case",
    title: "حالة ألم الصدر",
    specialty: "الطب العام والقلب",
    description:
      "مسار لعب خيالي قصير يدرّب فصل الملاحظة عن الافتراض وتوثيق عدم اليقين، من دون تشخيص أو علاج.",
    type: "branching-case",
    difficulty: "مبتدئ",
    xpReward: 100,
    estimatedMinutes: 10,
    status: "playable-demo",
    reviewStatus: "unreviewed-placeholder",
    stages: ["العرض", "التاريخ", "اختيار الفحوص", "التفسير", "النتيجة"],
  },
  {
    id: "handoff-case",
    title: "غرفة تسليم الحالة",
    specialty: "التواصل وتوثيق الأدلة",
    description:
      "تحدٍ خيالي قصير لتلخيص ملف، حفظ مصدر المعلومة، وتحويل المجهول إلى سؤال مراجعة واضح.",
    type: "branching-case",
    difficulty: "مبتدئ",
    xpReward: 100,
    estimatedMinutes: 8,
    status: "playable-demo",
    reviewStatus: "unreviewed-placeholder",
    stages: ["الخلاصة", "فرز المصادر", "تسمية التعارض", "بوابة المراجعة"],
  },
  {
    id: "heart-anatomy",
    title: "مستكشف تشريح القلب",
    specialty: "التشريح",
    description:
      "وحدة مخطط لها لعرض نموذج منخفض التفاصيل مع بديل ثنائي الأبعاد ووضع حركة مخفّضة.",
    type: "anatomy-3d",
    difficulty: "مبتدئ",
    xpReward: 150,
    estimatedMinutes: 12,
    status: "planned",
    reviewStatus: "unreviewed-placeholder",
    stages: ["الاستكشاف", "النقاط التفاعلية", "مراجعة سريعة"],
  },
  {
    id: "rapid-diagnosis",
    title: "تحدي التشخيص السريع",
    specialty: "تدريب يومي",
    description:
      "قالب اختبار سريع مخطط له، ولن يحتوي أسئلة طبية فعلية قبل مراجعتها واعتمادها.",
    type: "rapid-quiz",
    difficulty: "متوسط",
    xpReward: 60,
    estimatedMinutes: 5,
    status: "planned",
    reviewStatus: "unreviewed-placeholder",
    stages: ["السؤال", "الاختيار", "التغذية الراجعة"],
  },
]

export function labModuleById(id: string | undefined) {
  return LAB_MODULES.find((module) => module.id === id)
}
