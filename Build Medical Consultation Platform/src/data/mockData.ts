// Mock data for Phase 1 demo. In production, replace with real Supabase queries.
// TODO: Replace all mock data with live database calls before production launch.

export interface Doctor {
  id: string
  name: string
  specialty: string
  specialtyId: string
  bio: string
  yearsExperience: number
  consultationsAnswered: number
  rating: number
  reviewCount: number
  avatarUrl: string
  hospital?: string
  isOnline: boolean
}

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "د. نور الهاشمي",
    specialty: "القلب والأوعية الدموية",
    specialtyId: "cardiology",
    bio: "استشارية في طب القلب والأوعية الدموية، خريجة مجلس أوروبي في الأمراض القلبية. أؤمن أن الوقاية خير من العلاج وأسعى دائمًا لتثقيف مرضاي.",
    yearsExperience: 12,
    consultationsAnswered: 847,
    rating: 4.9,
    reviewCount: 312,
    avatarUrl:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&auto=format",
    hospital: "مستشفى ابن البيطار - بغداد",
    isOnline: true,
  },
  {
    id: "d2",
    name: "د. أحمد المنصور",
    specialty: "الطب العام والعائلي",
    specialtyId: "general",
    bio: "طبيب عائلة متخصص في الرعاية الصحية الشاملة، مع خبرة واسعة في إدارة الأمراض المزمنة والمتابعة الدورية.",
    yearsExperience: 9,
    consultationsAnswered: 1203,
    rating: 4.8,
    reviewCount: 489,
    avatarUrl:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&auto=format",
    hospital: "مستشفى المدينة الطبي - البصرة",
    isOnline: true,
  },
  {
    id: "d3",
    name: "د. سارة العلوي",
    specialty: "التغذية والحمية",
    specialtyId: "nutrition",
    bio: "اختصاصية تغذية سريرية، ماجستير في علم التغذية من جامعة بغداد. أساعد مرضاي على تحقيق أهدافهم الصحية عبر خطط غذائية مخصصة مبنية على الأدلة.",
    yearsExperience: 7,
    consultationsAnswered: 634,
    rating: 4.9,
    reviewCount: 201,
    avatarUrl:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&auto=format",
    hospital: "",
    isOnline: false,
  },
  {
    id: "d4",
    name: "د. عمر الجبوري",
    specialty: "الأعصاب",
    specialtyId: "neurology",
    bio: "استشاري أمراض أعصاب، حاصل على الزمالة الأوروبية في طب الأعصاب. متخصص في الصداع النصفي وأمراض النوم والصرع.",
    yearsExperience: 15,
    consultationsAnswered: 523,
    rating: 4.7,
    reviewCount: 178,
    avatarUrl:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&auto=format",
    hospital: "المجمع الطبي - كركوك",
    isOnline: true,
  },
  {
    id: "d5",
    name: "د. ريم الكعبي",
    specialty: "الطب النفسي والصحة النفسية",
    specialtyId: "psychiatry",
    bio: "طبيبة نفسية معتمدة، متخصصة في العلاج المعرفي السلوكي وعلاج القلق والاكتئاب. أؤمن بمحورية الصحة النفسية للصحة الكاملة.",
    yearsExperience: 8,
    consultationsAnswered: 412,
    rating: 4.9,
    reviewCount: 167,
    avatarUrl:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&auto=format",
    hospital: "مركز الصحة النفسية - أربيل",
    isOnline: false,
  },
  {
    id: "d6",
    name: "د. كريم الراشد",
    specialty: "طب الأطفال",
    specialtyId: "pediatrics",
    bio: "اختصاصي طب أطفال مع خبرة 11 عامًا في رعاية الأطفال الرضع والنمو والتطور. جميع الاستشارات تتم بأسلوب لطيف وداعم للأسرة.",
    yearsExperience: 11,
    consultationsAnswered: 978,
    rating: 4.8,
    reviewCount: 345,
    avatarUrl:
      "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=200&h=200&fit=crop&auto=format",
    hospital: "مستشفى الأطفال المركزي - بغداد",
    isOnline: true,
  },
]

export interface Article {
  id: string
  title: string
  excerpt: string
  category: string
  categoryId: string
  authorName: string
  authorSpecialty: string
  publishedAt: string
  readTimeMinutes: number
  coverUrl: string
  isFeatured?: boolean
}

export const ARTICLE_CATEGORIES = [
  { id: "ramadan", nameAr: "رمضان والتغذية الموسمية", icon: "🌙" },
  { id: "weight", nameAr: "إدارة الوزن (مبني على الدليل)", icon: "⚖️" },
  { id: "mental", nameAr: "الصحة النفسية", icon: "💙" },
  { id: "chronic", nameAr: "العيش مع الأمراض المزمنة", icon: "💊" },
  { id: "myths", nameAr: "تصحيح المفاهيم الطبية", icon: "🔍" },
  { id: "firstaid", nameAr: "الإسعافات الأولية والطوارئ", icon: "🚑" },
  { id: "maternal", nameAr: "صحة الأم والطفل", icon: "🤱" },
]

export const MOCK_ARTICLES: Article[] = [
  {
    id: "a1",
    title: "كيف تتناول الدواء بأمان خلال رمضان؟ دليل المريض المزمن",
    excerpt:
      "يواجه مرضى السكري وضغط الدم والأمراض المزمنة تحديات خاصة في رمضان. نوضح كيف تعدّل جرعاتك ومواعيد دوائك بإشراف طبيب لصيام آمن وصحي.",
    category: "رمضان والتغذية الموسمية",
    categoryId: "ramadan",
    authorName: "د. نور الهاشمي",
    authorSpecialty: "الطب العام",
    publishedAt: "2025-03-01",
    readTimeMinutes: 6,
    coverUrl:
      "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=400&fit=crop&auto=format",
    isFeatured: true,
  },
  {
    id: "a2",
    title: "لماذا «الرجيم السريع» خطر؟ الحقيقة العلمية عن خسارة الوزن",
    excerpt:
      "تنتشر وعود إنقاص الوزن بالكيلوغرامات خلال أيام. نفنّد هذه الادعاءات ونشرح ما يقوله الدليل العلمي الفعلي عن معدلات خسارة الوزن الصحية والمستدامة.",
    category: "إدارة الوزن",
    categoryId: "weight",
    authorName: "د. سارة العلوي",
    authorSpecialty: "التغذية والحمية",
    publishedAt: "2025-04-12",
    readTimeMinutes: 8,
    coverUrl:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop&auto=format",
    isFeatured: true,
  },
  {
    id: "a3",
    title: "القلق لدى الشباب: متى يكون طبيعيًا ومتى يحتاج إلى مساعدة؟",
    excerpt:
      "القلق شعور إنساني طبيعي، لكن متى يصبح اضطرابًا يستحق الاهتمام؟ د. ريم الكعبي تجيب بوضوح وتشارك العلامات الدالة على ضرورة طلب المساعدة المختصة.",
    category: "الصحة النفسية",
    categoryId: "mental",
    authorName: "د. ريم الكعبي",
    authorSpecialty: "الطب النفسي",
    publishedAt: "2025-05-03",
    readTimeMinutes: 7,
    coverUrl:
      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: "a4",
    title: "مريض السكري وممارسة الرياضة: دليل آمن وعملي",
    excerpt:
      "الرياضة ضرورة لمرضى السكري وليست خيارًا، لكنها تتطلب احتياطات. نستعرض الأنواع المناسبة والتوقيت الأمثل وكيفية مراقبة السكر قبل وبعد كل جلسة.",
    category: "العيش مع الأمراض المزمنة",
    categoryId: "chronic",
    authorName: "د. أحمد المنصور",
    authorSpecialty: "الطب العام",
    publishedAt: "2025-05-18",
    readTimeMinutes: 5,
    coverUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: "a5",
    title: "أساطير شائعة عن المضادات الحيوية يجب أن تعرفها",
    excerpt:
      "«المضادات الحيوية تعالج كل شيء»، «يجب إيقافها حين أتحسن» — هذه المعتقدات الخاطئة خطرة. نكشف الحقيقة ونوضح لماذا المقاومة للمضادات الحيوية تهديد عالمي حقيقي.",
    category: "تصحيح المفاهيم الطبية",
    categoryId: "myths",
    authorName: "د. عمر الجبوري",
    authorSpecialty: "الطب العام",
    publishedAt: "2025-06-02",
    readTimeMinutes: 6,
    coverUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: "a6",
    title: "الرضاعة الطبيعية: الفوائد، التحديات، ونصائح للبداية الصحيحة",
    excerpt:
      "الرضاعة الطبيعية هي الأفضل للأم والرضيع، لكنها ليست دائمًا سهلة. دليل شامل من التحضير قبل الولادة إلى الفطام، مع إجابات على الأسئلة الأكثر شيوعًا.",
    category: "صحة الأم والطفل",
    categoryId: "maternal",
    authorName: "د. كريم الراشد",
    authorSpecialty: "طب الأطفال",
    publishedAt: "2025-06-15",
    readTimeMinutes: 9,
    coverUrl:
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=400&fit=crop&auto=format",
  },
]

export interface Consultation {
  id: string
  title: string
  specialty: string
  specialtyId: string
  status: "open" | "answered" | "closed"
  submittedAt: string
  patientName: string
  isAnonymous: boolean
  doctorName?: string
  lastReply?: string
  messageCount: number
}

export const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: "c1",
    title: "ألم متكرر في الصدر عند ممارسة الرياضة",
    specialty: "القلب والأوعية الدموية",
    specialtyId: "cardiology",
    status: "answered",
    submittedAt: "2025-06-10",
    patientName: "مريض #4821",
    isAnonymous: true,
    doctorName: "د. نور الهاشمي",
    lastReply: "منذ يومين",
    messageCount: 4,
  },
  {
    id: "c2",
    title: "طفلي يعاني من حمى متقطعة منذ أسبوع",
    specialty: "طب الأطفال",
    specialtyId: "pediatrics",
    status: "open",
    submittedAt: "2025-06-18",
    patientName: "مريضة #3107",
    isAnonymous: true,
    messageCount: 1,
  },
]

export const STATS = {
  verifiedDoctors: 238,
  consultationsAnswered: 14706,
  specialties: 18,
  averageResponseHours: 4,
}
