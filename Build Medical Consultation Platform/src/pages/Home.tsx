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
  ArrowUpLeft,
  Star,
  Flower2,
  PencilLine,
  Microscope,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react"
import Button from "@/components/ui/Button"
import { SPECIALTIES } from "@/data/specialties"
import { consultationsEnabled } from "@/lib/releaseFlags"
import PatternField from "@/components/decor/PatternField"
import DotGridField from "@/components/decor/DotGridField"
import GrainOverlay from "@/components/decor/GrainOverlay"
import SketchAccents from "@/components/decor/SketchAccents"
import HandUnderline from "@/components/decor/HandUnderline"
import CapabilityPhoto from "@/components/home/CapabilityPhoto"

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
    photo: "/images/medical-consultation.jpg",
  },
  {
    icon: Stethoscope,
    number: "02",
    title: "دليل الأطباء",
    text: "دليل الأطباء غير متاح في نسخة العرض العامة دون قاعدة بيانات مراجَعة.",
    to: "/doctors",
    photo: "/images/medical-directory.jpg",
  },
  {
    icon: GraduationCap,
    number: "03",
    title: "أكاديمية تدريب",
    text: "مسارات تعليمية متدرّجة بتجربة بصرية تفاعلية ونتائج قابلة للمتابعة.",
    to: "/training",
    photo: "/images/medical-training.jpg",
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
    <div dir="rtl" className="home-premium editorial-home overflow-x-hidden">
      <GrainOverlay />
      <section className="home-hero">
        <DotGridField tone="teal" fade="left" className="hero-dot-grid" />
        <SketchAccents motif="hero" className="hero-doodles" />
        <div className="home-orbit home-orbit-one" aria-hidden="true" />
        <div className="home-orbit home-orbit-two" aria-hidden="true" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="relative z-10 text-center lg:text-right">
            <p className="home-eyebrow">
              <span aria-hidden="true">
                <HeartPulse />
              </span>
              <span className="home-tag-flower" aria-hidden="true">
                <Flower2 />
              </span>
              مساحة معرفية تنبض بالحياة
            </p>
            <h1
              aria-label="الرعاية تبدأ بخطوة أوضح"
              className="home-display mx-auto mt-6 max-w-3xl lg:mx-0"
            >
              الرعاية تبدأ
              <span>
                <HandUnderline color="#66b4b2">بخطوة أوضح.</HandUnderline>
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0">
              رحلة بسيطة بين المقالات الصحية التجريبية والتعلّم التفاعلي، بألوان
              هادئة وأفكار أوضح. الاستشارات قيد التطوير، والمقالات الحالية
              خيالية وغير مراجعة طبيًا.
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
                  <BookOpenText className="h-5 w-5" aria-hidden="true" />
                  تصفح المقالات التجريبية
                  <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/consultations"
                  className="inline-flex min-h-11 items-center rounded-xl border border-primary-700 px-5 py-3 text-sm font-bold text-primary-800"
                >
                  الاستشارات قيد التطوير
                </Link>
              </div>
            )}

            <div className="home-hero-pencil" aria-hidden="true">
              <PencilLine />
              <span>خطوات أجمل نحو المعرفة</span>
            </div>
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

          <div className="home-visual" aria-label="نظرة فنية على مسارات المنصة">
            <PatternField variant="confetti" className="home-visual-pattern" />
            <div className="hero-illustration" aria-hidden="true">
              <span className="hero-blob hero-blob-one" />
              <span className="hero-blob hero-blob-two" />
              <div className="hero-medical-card">
                <span className="hero-medical-card-top">
                  <HeartPulse />
                  <Star />
                </span>
                <span className="hero-medical-card-icon">
                  <BookOpenText />
                </span>
                <span className="hero-medical-card-rule" />
                <span className="hero-medical-card-rule short" />
                <span className="hero-medical-card-bottom">
                  <Stethoscope />
                  <span>المعرفة أولًا</span>
                </span>
              </div>
              <div className="hero-sticky hero-sticky-one">
                كل سؤال يستحق
                <br />
                شرحًا واضحًا <Sparkles />
              </div>
              <div className="hero-sticky hero-sticky-two">
                <Flower2 /> نتعلّم خطوة
                <br /> بخطوة
              </div>
              <div className="hero-sticker-star">
                <Sparkles />
              </div>
            </div>
            <div className="home-visual-copy">
              <span>المعرفة والتدريب</span>
              <strong>
                مساحة أقرب إليك،
                <br />
                كل يوم.
              </strong>
              <p>محتوى تعليمي تجريبي وأدوات للتعلّم ضمن واجهة عربية ذات روح.</p>
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
                        <span className="capability-icon">
                          <Icon aria-hidden="true" />
                        </span>
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

      <section className="home-section home-editorial-cards">
        <DotGridField tone="sky" fade="edges" className="cards-dot-grid" />
        <SketchAccents motif="cards" className="cards-doodles" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="home-section-heading">
            <p>خدمات المنصة</p>
            <h2>
              مسارات واضحة؛
              <br />
              <HandUnderline color="#78b8d7">تجربة أكثر قربًا.</HandUnderline>
            </h2>
            <Link to="/articles">
              استكشف المعرفة <ChevronLeft aria-hidden="true" />
            </Link>
          </div>
          <div className="home-capabilities">
            {CAPABILITIES.map(
              ({ icon: Icon, number, title, text, to, photo }) => (
                <Link to={to} className="home-capability" key={title}>
                  <CapabilityPhoto source={photo} icon={Icon} />
                  <div className="home-capability-body">
                    <span className="home-capability-number">{number}</span>
                    <span className="capability-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <span className="home-capability-link">
                      استكشف القسم <ArrowLeft aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ),
            )}
          </div>
          <p className="capability-photos-disclaimer">
            الصور تمثيلية لأغراض العرض فقط، ولا تمثل أطباء أو أعضاء فريق تابعين
            للمنصة.
          </p>
        </div>
      </section>

      <section className="home-specialties">
        <DotGridField tone="teal" fade="right" className="specialties-dot-grid" />
        <SketchAccents motif="specialties" className="specialties-doodles" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="home-kicker">الوصول السريع</p>
              <h2>
                <HandUnderline color="#71b9b6">اختر نقطة البداية</HandUnderline>
              </h2>
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
          <PatternField variant="confetti" className="cta-doodle-pattern" />
          <SketchAccents motif="cta" className="cta-doodles" />
          <div>
            <p>ابدأ من مكان واحد</p>
            <h2>
              المعرفة تبدأ{" "}
              <HandUnderline color="#efb84e">بخطوة صغيرة.</HandUnderline>
            </h2>
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
