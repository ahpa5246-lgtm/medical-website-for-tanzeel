import { useState, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"

import {
  ArrowLeft,
  BookOpenText,
  Brain,
  CheckCircle2,
  ChevronLeft,
  GraduationCap,
  HeartPulse,
  LockKeyhole,
  MessageCircle,
  Microscope,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react"

import Button from "@/components/ui/Button"

import { SPECIALTIES } from "@/data/specialties"

const FEATURED_SPECIALTIES = SPECIALTIES.slice(0, 6)

const specialtyIcons: ReactNode[] = [
  <Stethoscope aria-hidden="true" />,

  <Microscope aria-hidden="true" />,

  <Brain aria-hidden="true" />,

  <HeartPulse aria-hidden="true" />,

  <MessageCircle aria-hidden="true" />,

  <Sparkles aria-hidden="true" />,
]

const CARE_STEPS = [
  { icon: Search, label: "اختيار التخصص", hint: "وصول أسرع للمسار المناسب" },

  {
    icon: MessageCircle,

    label: "إرسال الاستشارة",

    hint: "تفاصيل منظّمة وواضحة",
  },

  {
    icon: ShieldCheck,

    label: "مراجعة المختص",

    hint: "إدارة الاعتماد من المنصة",
  },

  {
    icon: BookOpenText,

    label: "محتوى صحي",

    hint: "مكتبة قابلة للتحرير والنشر",
  },

  {
    icon: GraduationCap,
    label: "الأكاديمية",
    hint: "دروس قابلة للتحرير والنشر",
  },
]

const CAPABILITIES = [
  {
    icon: MessageCircle,

    number: "01",

    title: "استشارة مرتّبة",

    text: "نموذج واضح يجمع المعلومات الضرورية ويقود المستخدم خطوة بخطوة.",

    to: "/consultations/new",
  },

  {
    icon: Stethoscope,

    number: "02",

    title: "دليل الأطباء",

    text: "ملفات يمكن إدارتها ونشرها بعد استكمال بيانات واعتماد كل طبيب.",

    to: "/doctors",
  },

  {
    icon: GraduationCap,

    number: "03",

    title: "أكاديمية تدريب",

    text: "مسارات تعليمية متدرّجة بتجربة بصرية تفاعلية ونتائج قابلة للمتابعة.",

    to: "/courses",
  },
]

export default function Home() {
  const [query, setQuery] = useState("")

  const navigate = useNavigate()

  function startConsultation(event: React.FormEvent) {
    event.preventDefault()

    navigate("/consultations/new", { state: { initialQuestion: query.trim() } })
  }

  return (
    <main dir="rtl" className="home-premium overflow-x-hidden">
      <section className="home-hero">
        <div className="home-orbit home-orbit-one" aria-hidden="true" />
        <div className="home-orbit home-orbit-two" aria-hidden="true" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="relative z-10 text-center lg:text-right">
            <p className="home-eyebrow">
              <span aria-hidden="true">
                <HeartPulse />
              </span>
              منصة رعاية رقمية متكاملة
            </p>
            <h1
              aria-label="الرعاية تبدأ بخطوة أوضح"
              className="home-display mx-auto mt-6 max-w-3xl lg:mx-0"
            >
              الرعاية تبدأ
              <span>بخطوة أوضح.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0">
              مكان واحد للاستشارات، إدارة الأطباء، المعرفة الطبية والتدريب
              التفاعلي؛ صُمّم ليجعل الوصول إلى الخدمة أبسط وأكثر تنظيمًا.
            </p>

            <form
              onSubmit={startConsultation}
              className="home-search mx-auto mt-9 lg:mx-0"
            >
              <label htmlFor="home-question" className="sr-only">
                ما الخدمة التي تبحث عنها؟
              </label>
              <Search aria-hidden="true" className="home-search-icon" />
              <input
                id="home-question"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="اكتب سؤالك أو ابحث عن تخصص"
              />
              <Button type="submit" size="lg" className="home-search-button">
                ابدأ الآن{" "}
                <ArrowLeft aria-hidden="true" className="h-4 w-4 rtl-flip" />
              </Button>
            </form>

            <div className="home-assurances" aria-label="مزايا المنصة">
              <span>
                <LockKeyhole aria-hidden="true" /> خصوصية البيانات
              </span>
              <span>
                <ShieldCheck aria-hidden="true" /> إدارة التحقق
              </span>
              <span>
                <CheckCircle2 aria-hidden="true" /> تجربة عربية متكاملة
              </span>
            </div>
          </div>

          <div className="home-visual" aria-label="نظرة على مسارات المنصة">
            <div className="home-visual-copy">
              <span>من السؤال إلى المتابعة</span>
              <strong>مسار واحد، بلا تعقيد.</strong>
              <p>كل أداة في مكانها، وكل خطوة تقود بوضوح إلى التالية.</p>
            </div>
            <div className="home-vital" aria-hidden="true">
              <svg viewBox="0 0 500 118" fill="none">
                <path d="M4 66h94l22-38 29 76 33-93 38 55h72l20-24 27 45 30-21h127" />
              </svg>
            </div>
            <div className="home-visual-seal">
              <span>
                <Stethoscope aria-hidden="true" />
              </span>
              <div>
                <small>جاهزة للتخصيص</small>
                <strong>لوحة إدارة كاملة</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="care-flight-shell">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
            <div className="care-flight-window">
              <div className="care-flight-track">
                {[...CARE_STEPS, ...CARE_STEPS].map(
                  ({ icon: Icon, label, hint }, index) => (
                    <div
                      className="care-flight-item"
                      key={`${label}-${index}`}
                      aria-hidden={index >= CARE_STEPS.length}
                    >
                      <span>
                        <Icon aria-hidden="true" />
                      </span>
                      <div>
                        <strong>{label}</strong>
                        <small>{hint}</small>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="home-section-heading">
            <p>بنية خدمة واضحة</p>
            <h2>
              أكثر من واجهة جميلة؛
              <br />
              منظومة قابلة للإدارة.
            </h2>
            <Link to="/articles">
              استكشف المعرفة <ChevronLeft aria-hidden="true" />
            </Link>
          </div>
          <div className="home-capabilities">
            {CAPABILITIES.map(({ icon: Icon, number, title, text, to }) => (
              <Link to={to} className="home-capability" key={title}>
                <span className="home-capability-number">{number}</span>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="home-capability-link">
                  الدخول إلى القسم <ArrowLeft aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-specialties">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="home-kicker">الوصول السريع</p>
              <h2>اختر نقطة البداية</h2>
            </div>
            <Link to="/doctors" className="home-inline-link">
              عرض دليل الأطباء <ChevronLeft aria-hidden="true" />
            </Link>
          </div>
          <div className="home-specialty-grid">
            {FEATURED_SPECIALTIES.map((specialty, index) => (
              <Link
                key={specialty.id}
                to={`/consultations/new?specialty=${specialty.id}`}
                className="home-specialty"
              >
                <span>{specialtyIcons[index]}</span>
                <h3>{specialty.nameAr}</h3>
                <ArrowLeft aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta-wrap">
        <div className="home-cta mx-auto max-w-7xl">
          <div>
            <p>ابدأ من مكان واحد</p>
            <h2>ابنِ تجربة رعاية تليق بالثقة.</h2>
            <span>يمكن إدارة المحتوى والأطباء والمستخدمين من لوحة التحكم.</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/consultations/new" className="home-cta-primary">
              ابدأ استشارة <ArrowLeft aria-hidden="true" />
            </Link>
            <Link to="/courses" className="home-cta-secondary">
              استكشف التدريب
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
