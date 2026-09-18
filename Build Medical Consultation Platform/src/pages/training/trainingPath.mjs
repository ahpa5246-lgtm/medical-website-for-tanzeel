export const TRAINING_WORLDS = [
  {
    id: "foundation",
    number: "01",
    title: "بوابة الأساسيات",
    eyebrow: "ابدأ من هنا",
    description: "مهارات السلامة والقياسات التي تسبق أي قرار سريري.",
    tone: "teal",
    stages: [
      { id: "vital-signs", title: "قراءة العلامات الحيوية", shortTitle: "العلامات الحيوية", type: "محاكاة", minutes: 8, xp: 100, icon: "pulse", brief: "رتّب خطوات قياس النبض والضغط والحرارة داخل سيناريو تفاعلي قصير." },
      { id: "patient-safety", title: "سلامة المريض أولًا", shortTitle: "سلامة المريض", type: "تحدٍ", minutes: 7, xp: 130, icon: "shield", brief: "اكتشف مخاطر الغرفة قبل بدء الإجراء واختر التصرف الأكثر أمانًا." },
      { id: "medical-language", title: "لغة الملف الطبي", shortTitle: "الملف الطبي", type: "مطابقة", minutes: 6, xp: 150, icon: "file", brief: "اربط الاختصارات الطبية بمعانيها داخل نموذج ملف تجريبي." },
    ],
  },
  {
    id: "clinical",
    number: "02",
    title: "ممر الحالات السريرية",
    eyebrow: "حلّل واتخذ قرارًا",
    description: "حالات متفرعة تتغير نتائجها بحسب قرارات المتدرّب.",
    tone: "blue",
    stages: [
      { id: "chest-pain", title: "مريض يشكو من ألم الصدر", shortTitle: "ألم الصدر", type: "حالة متفرعة", minutes: 12, xp: 220, icon: "heart", brief: "اجمع المعلومات وحدد الأولويات في حالة خيالية لا تمثل إرشادًا طبيًا." },
      { id: "triage", title: "غرفة الفرز السريع", shortTitle: "الفرز السريع", type: "سباق وقت", minutes: 10, xp: 260, icon: "timer", brief: "صنّف أربع حالات تدريبية حسب درجة الاستعجال ضمن وقت محدود." },
      { id: "case-handoff", title: "تسليم الحالة", shortTitle: "تسليم الحالة", type: "محادثة", minutes: 9, xp: 280, icon: "message", brief: "ابنِ تسليمًا منظمًا لحالة تدريبية عبر خطوات واضحة ومتسلسلة." },
    ],
  },
  {
    id: "lab",
    number: "03",
    title: "مختبر الاستكشاف",
    eyebrow: "المستوى المتقدم",
    description: "نماذج تشريح ونتائج مختبرية داخل بيئة تدريب افتراضية.",
    tone: "gold",
    stages: [
      { id: "anatomy", title: "استكشف القلب ثلاثي الأبعاد", shortTitle: "تشريح القلب", type: "نموذج 3D", minutes: 15, xp: 350, icon: "anatomy", brief: "تنقّل بين طبقات نموذج بصري تعليمي وحدد الأجزاء الأساسية." },
      { id: "lab-results", title: "اقرأ نتائج المختبر", shortTitle: "نتائج المختبر", type: "تحليل", minutes: 13, xp: 390, icon: "flask", brief: "تعرّف على بنية تقرير مختبري تجريبي وحدد القيم التي تستحق الانتباه." },
      { id: "final-scenario", title: "المحاكاة النهائية", shortTitle: "المهمة النهائية", type: "مهمة شاملة", minutes: 20, xp: 500, icon: "trophy", brief: "اجمع مهارات المسار ضمن قصة تدريبية واحدة متعددة المراحل." },
    ],
  },
]

export const ALL_STAGES = TRAINING_WORLDS.flatMap((world) => world.stages)

export function getStageAvailability(stageId, completedIds) {
  if (completedIds.includes(stageId)) return "complete"
  const index = ALL_STAGES.findIndex((stage) => stage.id === stageId)
  if (index < 0) return "locked"
  if (index === 0 || completedIds.includes(ALL_STAGES[index - 1].id)) return "active"
  return "locked"
}

export function getTrainingProgress(completedIds) {
  const completedStages = ALL_STAGES.filter((stage) => completedIds.includes(stage.id))
  return {
    completed: completedStages.length,
    total: ALL_STAGES.length,
    percent: Math.round((completedStages.length / ALL_STAGES.length) * 100),
    xp: completedStages.reduce((total, stage) => total + stage.xp, 0),
  }
}

export function findTrainingStage(stageId) {
  return ALL_STAGES.find((stage) => stage.id === stageId)
}
