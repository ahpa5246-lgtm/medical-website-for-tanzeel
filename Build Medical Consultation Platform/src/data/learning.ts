export type Course = {
  id: string
  title: string
  description: string
  specialty: string
  level: "مبتدئ" | "متوسط" | "متقدم"
  instructor: string
  lessons: number
  duration: string
  price: string
  isFree: boolean
  image: string
  color: string
}

export type LibraryItem = {
  id: string
  title: string
  author: string
  category: string
  format: string
  pages: string
  description: string
  image: string
  color: string
}

export const COURSES: Course[] = [
  {
    id: "clinical-basics",
    title: "أساسيات التفكير السريري",
    description:
      "من الشكوى الأولى إلى بناء فرضية عملية وآمنة: منهج واضح للطلبة والممارسين الجدد.",
    specialty: "الطب السريري",
    level: "مبتدئ",
    instructor: "د. ريم الكعبي",
    lessons: 18,
    duration: "4 ساعات و20 دقيقة",
    price: "مجانًا",
    isFree: true,
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=360&fit=crop&auto=format",
    color: "from-emerald-700 to-teal-600",
  },
  {
    id: "patient-safety",
    title: "سلامة المريض في الممارسة اليومية",
    description:
      "دليل تفاعلي لاتخاذ قرارات أكثر أمانًا، وتفادي الأخطاء الشائعة في الرعاية الصحية.",
    specialty: "سلامة المريض",
    level: "متوسط",
    instructor: "د. نور الهاشمي",
    lessons: 12,
    duration: "3 ساعات",
    price: "مجانًا",
    isFree: true,
    image:
      "https://images.unsplash.com/photo-1652787542567-f86c0b4c0269?w=600&h=360&fit=crop&auto=format",
    color: "from-green-700 to-emerald-600",
  },
  {
    id: "mental-health",
    title: "مبادئ التواصل في الصحة النفسية",
    description:
      "لغة عملية ومحترمة لبناء حوار داعم وتوجيه المريض إلى الرعاية المناسبة.",
    specialty: "الصحة النفسية",
    level: "مبتدئ",
    instructor: "د. سارة العلوي",
    lessons: 14,
    duration: "3 ساعات و35 دقيقة",
    price: "49 ر.س",
    isFree: false,
    image:
      "https://images.unsplash.com/photo-1666886573301-b5d526cfd518?w=600&h=360&fit=crop&auto=format",
    color: "from-teal-700 to-cyan-600",
  },
  {
    id: "research",
    title: "قراءة الأبحاث الطبية بثقة",
    description:
      "تعلّم تقييم الدليل العلمي وفهم النتائج قبل تحويلها إلى قرار أو توصية صحية.",
    specialty: "البحث الطبي",
    level: "متقدم",
    instructor: "د. عمر الجبوري",
    lessons: 16,
    duration: "5 ساعات",
    price: "79 ر.س",
    isFree: false,
    image:
      "https://images.unsplash.com/photo-1666886573264-38075cc56104?w=600&h=360&fit=crop&auto=format",
    color: "from-green-800 to-teal-700",
  },
  {
    id: "anatomy",
    title: "مدخل إلى التشريح السريري",
    description:
      "مراجعة منهجية لأهم المناطق التشريحية ذات الصلة بالممارسة السريرية اليومية.",
    specialty: "التشريح",
    level: "مبتدئ",
    instructor: "د. كريم الراشد",
    lessons: 20,
    duration: "5 ساعات و40 دقيقة",
    price: "مجانًا",
    isFree: true,
    image:
      "https://images.unsplash.com/photo-1584516150909-c43483ee7932?w=600&h=360&fit=crop&auto=format",
    color: "from-emerald-600 to-green-700",
  },
  {
    id: "pharmacology",
    title: "أساسيات الصيدلة السريرية",
    description:
      "فهم آليات الأدوية الشائعة وتفاعلاتها لمساعدة الطبيب على اتخاذ قرارات دوائية آمنة.",
    specialty: "الصيدلة",
    level: "متوسط",
    instructor: "د. نور الهاشمي",
    lessons: 15,
    duration: "4 ساعات",
    price: "59 ر.س",
    isFree: false,
    image:
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=360&fit=crop&auto=format",
    color: "from-teal-800 to-emerald-700",
  },
]

export const LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: "clinical-notes",
    title: "دليل الملاحظات السريرية المنظّمة",
    author: "وحدة التعليم الطبي",
    category: "دليل عملي",
    format: "PDF",
    pages: "42 صفحة",
    description:
      "قالب تطبيقي لتوثيق المعلومات السريرية بوضوح، مع أمثلة قابلة للاستخدام في التدريب.",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=280&fit=crop&auto=format",
    color: "bg-emerald-50",
  },
  {
    id: "patient-safety-guide",
    title: "مرجع سلامة المريض الأساسي",
    author: "فريق الجودة السريرية",
    category: "سلامة المريض",
    format: "PDF",
    pages: "28 صفحة",
    description:
      "إرشادات مركزة لبناء ممارسات آمنة، والإبلاغ عن المخاطر والاستجابة لها.",
    image:
      "https://images.unsplash.com/photo-1652787542567-f86c0b4c0269?w=400&h=280&fit=crop&auto=format",
    color: "bg-teal-50",
  },
  {
    id: "mental-health-toolkit",
    title: "عدة التوجيه الأولي للصحة النفسية",
    author: "د. سارة العلوي",
    category: "الصحة النفسية",
    format: "دليل",
    pages: "19 صفحة",
    description:
      "مؤشرات أولية، ومسارات إحالة، ولغة تواصل تحمي كرامة المريض وخصوصيته.",
    image:
      "https://images.unsplash.com/photo-1666886573301-b5d526cfd518?w=400&h=280&fit=crop&auto=format",
    color: "bg-green-50",
  },
  {
    id: "evidence-checklist",
    title: "قائمة فحص الدليل الطبي",
    author: "مركز المعرفة الطبية",
    category: "البحث الطبي",
    format: "قائمة عمل",
    pages: "8 صفحات",
    description:
      "أسئلة منهجية قصيرة تساعدك على تقييم جودة البحث قبل الاستشهاد به أو تطبيقه.",
    image:
      "https://images.unsplash.com/photo-1666886573264-38075cc56104?w=400&h=280&fit=crop&auto=format",
    color: "bg-emerald-50",
  },
  {
    id: "anatomy-atlas",
    title: "أطلس التشريح السريري المختصر",
    author: "د. كريم الراشد",
    category: "دليل عملي",
    format: "PDF",
    pages: "64 صفحة",
    description:
      "رسوم تشريحية مرجعية مرفقة بملاحظات سريرية لتسريع فهم العلاقات التشريحية الهامة.",
    image:
      "https://images.unsplash.com/photo-1584516150909-c43483ee7932?w=400&h=280&fit=crop&auto=format",
    color: "bg-teal-50",
  },
  {
    id: "pharmacology-quick-ref",
    title: "مرجع الأدوية السريعة للممارس",
    author: "وحدة الصيدلة السريرية",
    category: "دليل عملي",
    format: "PDF",
    pages: "35 صفحة",
    description:
      "جداول وملخصات للأدوية الأكثر استخدامًا: الجرع، التفاعلات، والتحذيرات.",
    image:
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=280&fit=crop&auto=format",
    color: "bg-green-50",
  },
]
