import { useState, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  BookOpenText,
  Brain,
  CheckCircle2,
  ChevronLeft,
  CirclePause,
  CirclePlay,
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
import { consultationsEnabled } from "@/lib/releaseFlags"

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
    label: "الاستشارات قريبًا",
    hint: "غير متاحة في نسخة العرض",
  },
  {
    icon: ShieldCheck,
    label: "التحقق الطبي قيد التطوير",
    hint: "لا توجد خدمة تحقق فعّالة بعد",
  },
  {
    icon: BookOpenText,
    label: "محتوى صحي",
    hint: "مكتبة قابلة للتحرير والنشر",
  },
  { icon: GraduationCap, label: "تدريب تفاعلي", hint: "مراحل ومستويات عملية" },
]

const CAPABILITIES = [
  {
    icon: MessageCircle,
    number: "01",
    title: "الاستشارات قيد التطوير",
    text: "الخدمة مؤجلة إلى حين اعتماد مراجعة الأمان والخصوصية.",
    to: "/consultations",
  },
  {
    icon: Stethoscope,
    number: "02",
    title: "دليل الأطباء",
    text: "دليل الأطباء غير متاح في نسخة العرض العامة دون قاعدة بيانات مراجَعة.",
    to: "/doctors",
  },
  {
    icon: GraduationCap,
    number: "03",
    title: "أكاديمية تدريب",
    text: "مسارات تعليمية متدرّجة بتجربة بصرية تفاعلية ونتائج قابلة للمتابعة.",
    to: "/training",
  },
]

export default function Home() {
  const [query, setQuery] = useState("")
  const [isMotionPaused, setIsMotionPaused] = useState(false)
  const navigate = useNavigate()

  function startConsultation(event: React.FormEvent) {
    event.preventDefault()
    navigate("/consultations/new", { state: { initialQuestion: query.trim() } })
  }

  return (
    <div dir="rtl" className="home-premium overflow-x-hidden">
      <section className="home-hero">
        <div className="home-orbit home-orbit-one" aria-hidden="true" />
        <div className="home-orbit home-orbit-two" aria-hidden="true" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="relative z-10 text-center lg:text-right">
            <p className="home-eyebrow">
              <span aria-hidden="true">
                <HeartPulse />
              </span>
              منصة معرفية تجريبية
            </p>
            <h1
              aria-label="الرعاية تبدأ بخطوة أوضح"
              className="home-display mx-auto mt-6 max-w-3xl lg:mx-0"
            >
              الرعاية تبدأ
              <span>بخطوة أوضح.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0">
              تعرّف على نماذج المعرفة الصحية والتدريب. الاستشارات قيد التطوير،
              والمقالات الحالية خيالية وغير مراجعة طبيًا.
            </p>

            {consultationsEnabled ? (
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
            ) : (
              <div className="mx-auto mt-9 flex flex-wrap justify-center gap-3 lg:mx-0 lg:justify-start">
                <Link
                  to="/articles"
                  className="inline-flex min-h-11 items-center rounded-xl bg-primary-700 px-6 py-3 text-sm font-bold text-white"
                >
                  تصفح المقالات التجريبية
                </Link>
                <Link
                  to="/consultations"
                  className="inline-flex min-h-11 items-center rounded-xl border border-primary-700 px-5 py-3 text-sm font-bold text-primary-800"
                >
                  الاستشارات قيد التطوير
                </Link>
              </div>
            )}

            <div className="home-assurances" aria-label="مزايا المنصة">
              <span>
                <LockKeyhole aria-hidden="true" /> لا تُرسل معلومات طبية هنا
              </span>
              <span>
                <ShieldCheck aria-hidden="true" /> المقالات موسومة كتجريبية
              </span>
              <span>
                <CheckCircle2 aria-hidden="true" /> واجهة عربية للتجربة
              </span>
            </div>
          </div>

          <div className="home-visual" aria-label="نظرة على مسارات المنصة">
            <div className="home-visual-copy">
              <span>المعرفة والتدريب</span>
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
                <small>نسخة عرض</small>
                <strong>المزايا قيد التقييم</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="care-flight-shell">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="care-flight-toggle"
              onClick={() => setIsMotionPaused((value) => !value)}
              aria-pressed={isMotionPaused}
              aria-label={isMotionPaused ? "تشغيل الحركة" : "إيقاف الحركة"}
            >
              {isMotionPaused ? (
                <CirclePlay aria-hidden="true" />
              ) : (
                <CirclePause aria-hidden="true" />
              )}
            </button>
            <div className="care-flight-window">
              <div
                className={`care-flight-track${
                  isMotionPaused ? " is-paused" : ""
                }`}
              >
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
                to="/consultations"
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
            <span>الاستشارات والوظائف الطبية ستُفتح بعد اجتياز المراجعة.</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/consultations" className="home-cta-primary">
              الاستشارات قريبًا <ArrowLeft aria-hidden="true" />
            </Link>
            <Link to="/training" className="home-cta-secondary">
              استكشف التدريب
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
