export interface Specialty {
  id: string
  nameAr: string
  nameEn: string
  icon: string
  description: string
}

export const SPECIALTIES: Specialty[] = [
  {
    id: "general",
    nameAr: "الطب العام والعائلي",
    nameEn: "General / Family Medicine",
    icon: "🏥",
    description: "استشارات طبية عامة ومتابعة الأمراض الشائعة",
  },
  {
    id: "dermatology",
    nameAr: "الأمراض الجلدية",
    nameEn: "Dermatology",
    icon: "🔬",
    description: "أمراض الجلد والشعر والأظافر",
  },
  {
    id: "neurology",
    nameAr: "الأعصاب",
    nameEn: "Neurology",
    icon: "🧠",
    description: "أمراض الجهاز العصبي والدماغ",
  },
  {
    id: "nutrition",
    nameAr: "التغذية والحمية",
    nameEn: "Nutrition & Dietetics",
    icon: "🥗",
    description: "التغذية الصحية والحمية العلاجية",
  },
  {
    id: "psychiatry",
    nameAr: "الطب النفسي والصحة النفسية",
    nameEn: "Psychiatry / Mental Health",
    icon: "💬",
    description: "دعم الصحة النفسية وعلاج الاضطرابات النفسية",
  },
  {
    id: "pediatrics",
    nameAr: "طب الأطفال",
    nameEn: "Pediatrics",
    icon: "👶",
    description: "رعاية صحة الأطفال من الولادة حتى المراهقة",
  },
  {
    id: "cardiology",
    nameAr: "القلب والأوعية الدموية",
    nameEn: "Cardiology",
    icon: "❤️",
    description: "أمراض القلب والشرايين والضغط",
  },
  {
    id: "endocrinology",
    nameAr: "الغدد الصماء والسكري",
    nameEn: "Endocrinology (Diabetes)",
    icon: "🩺",
    description: "السكري وأمراض الغدة الدرقية والهرمونات",
  },
  {
    id: "gynecology",
    nameAr: "النساء والتوليد",
    nameEn: "Gynecology & Obstetrics",
    icon: "🌸",
    description: "صحة المرأة والحمل والولادة",
  },
  {
    id: "orthopedics",
    nameAr: "العظام والمفاصل",
    nameEn: "Orthopedics",
    icon: "🦴",
    description: "أمراض العظام والمفاصل والعمود الفقري",
  },
  {
    id: "dentistry",
    nameAr: "طب الأسنان",
    nameEn: "Dentistry",
    icon: "🦷",
    description: "صحة الفم والأسنان واللثة",
  },
  {
    id: "ent",
    nameAr: "الأنف والأذن والحنجرة",
    nameEn: "ENT (Otolaryngology)",
    icon: "👂",
    description: "أمراض الأنف والأذن والحنجرة",
  },
  {
    id: "ophthalmology",
    nameAr: "طب العيون",
    nameEn: "Ophthalmology",
    icon: "👁️",
    description: "صحة العيون والرؤية",
  },
  {
    id: "gastroenterology",
    nameAr: "الجهاز الهضمي",
    nameEn: "Gastroenterology",
    icon: "🫁",
    description: "أمراض المعدة والأمعاء والكبد",
  },
  {
    id: "pulmonology",
    nameAr: "الجهاز التنفسي",
    nameEn: "Pulmonology",
    icon: "🫁",
    description: "أمراض الرئة والجهاز التنفسي",
  },
  {
    id: "urology",
    nameAr: "المسالك البولية",
    nameEn: "Urology",
    icon: "🩺",
    description: "أمراض الكلى والمسالك البولية",
  },
  {
    id: "rheumatology",
    nameAr: "الروماتيزم",
    nameEn: "Rheumatology",
    icon: "🦾",
    description: "أمراض المناعة والمفاصل الالتهابية",
  },
  {
    id: "infectious",
    nameAr: "الأمراض المعدية",
    nameEn: "Infectious Diseases",
    icon: "🦠",
    description: "الأمراض المعدية والتطعيمات",
  },
]

export function getSpecialtyById(id: string): Specialty | undefined {
  return SPECIALTIES.find((s) => s.id === id)
}
