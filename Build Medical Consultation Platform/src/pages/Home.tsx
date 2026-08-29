import { useState, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Activity,
  ArrowLeft,
  Baby,
  Brain,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  HeartPulse,
  LockKeyhole,
  MessageCircle,
  Microscope,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRoundCheck,
} from "lucide-react"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import { SPECIALTIES } from "@/data/specialties"
import { MOCK_ARTICLES } from "@/data/mockData"
import DemoLabel from "@/components/DemoLabel"

const FEATURED_SPECIALTIES = SPECIALTIES.slice(0, 6)
const specialtyIcons: ReactNode[] = [
  <Stethoscope />,
  <Microscope />,
  <Brain />,
  <Activity />,
  <MessageCircle />,
  <Baby />,
]

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "الطبيب أولًا",
    text: "تصور العرض خيالي؛ لا توجد إجابات أو مراجعة وثائق أو أطباء متصلون.",
  },
  {
    icon: LockKeyhole,
    title: "بياناتك حساسة",
    text: "لا توجد خصوصية أو هوية مجهولة مطبقة؛ لا تُدخل أي بيانات حقيقية.",
  },
  {
    icon: HeartPulse,
    title: "الطوارئ لا تنتظر",
    text: "نرصد عبارات الخطر أثناء الكتابة ونوجّهك فورًا لخدمات الطوارئ المحلية.",
  },
]

export default function Home() {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  function startConsultation(event: React.FormEvent) {
    event.preventDefault()
    setQuery("")
    navigate("/consultations/new")
  }

  return (
    <div dir="rtl" className="overflow-x-hidden">
      <section className="care-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.02fr_.98fr] lg:gap-14 lg:pb-24 lg:pt-20">
          <div className="relative z-10 text-center lg:text-right">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-primary-800 shadow-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white">
                <ShieldCheck className="h-3 w-3" />
              </span>
              تصور خيالي لمسار محتمل — لا توجد خدمة أو أطباء
            </div>

            <h1 className="hero-title mx-auto max-w-2xl text-[2.7rem] leading-[1.2] sm:text-5xl lg:mx-0 lg:text-[3.65rem]">
              بين سؤالك وقرارك الصحي،
              <span className="mt-1 block text-primary-600">
                مسار واضح وآمن.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-slate-600 lg:mx-0 lg:text-lg">
              جرّب التنقل بنص خيالي فقط؛ لن يُنقل النص إلى الرابط أو يُرسل أو يُحفظ،
              ولا توجد مراجعة طبية.
            </p>

            <form
              onSubmit={startConsultation}
              className="mx-auto mt-8 max-w-xl lg:mx-0"
            >
              <label htmlFor="home-question" className="sr-only">
                اكتب سؤالك الطبي
              </label>
              <div className="flex flex-col gap-2 rounded-[1.35rem] border border-primary-100 bg-white p-2.5 shadow-[0_18px_50px_rgba(16,42,67,.1)] sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute inset-y-0 start-0 my-auto ms-4 h-4.5 w-4.5 text-primary-600" />
                  <input
                    id="home-question"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="مثال: أريد اختيار التخصص المناسب لحالتي"
                    className="min-h-12 w-full rounded-xl border-0 bg-slate-50 py-3 pe-4 ps-11 text-sm text-ink outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="min-h-12 rounded-xl px-6"
                >
                  ابدأ بأمان <ArrowLeft className="h-4 w-4 rtl-flip" />
                </Button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span className="safe-chip">
                <LockKeyhole className="h-3.5 w-3.5 text-primary-600" /> خصوصية
                غير متاحة
              </span>
              <span className="safe-chip">
                <UserRoundCheck className="h-3.5 w-3.5 text-primary-600" /> تحقق
                غير منفّذ
              </span>
              <span className="safe-chip">
                <HeartPulse className="h-3.5 w-3.5 text-coral-500" /> ليست
                للطوارئ
              </span>
            </div>
          </div>

          <div className="care-stage" aria-label="مسار توضيحي للاستشارة الطبية">
            <div className="care-card care-card-question">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="warning">قيد المراجعة</Badge>
                <span className="text-[11px] font-medium text-slate-400">
                  استشارة خاصة · الآن
                </span>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coral-50 text-coral-600">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-ink">
                    سؤال جديد في طب الأسرة
                  </p>
                  <p className="mt-1.5 text-xs leading-6 text-slate-500">
                    صِف وقت بداية الأعراض والأدوية الحالية ليحصل الطبيب على
                    السياق الصحيح.
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <span className="block h-full w-2/3 rounded-full bg-primary-500" />
              </div>
              <p className="mt-2 text-[10px] font-medium text-slate-400">
                اكتمال التفاصيل ٦٥٪
              </p>
            </div>

            <svg
              className="care-pulse"
              viewBox="0 0 420 96"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 52h86l16-24 22 48 28-68 25 44h76l16-18 19 35 18-17h102"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="414" cy="52" r="6" fill="#F47761" />
            </svg>

            <div className="care-card care-card-doctor">
              <div className="flex items-center gap-3">
                <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-700 text-white">
                  <Stethoscope className="h-5 w-5" />
                  <span className="absolute -bottom-1 -left-1 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-emerald-500">
                    <CheckCircle2 className="h-3 w-3" />
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-ink">
                      الطبيب المستجيب
                    </p>
                    <Badge variant="primary">خيالي</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    مطابقة التخصص قبل إتاحة الرد
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                <span className="rounded-xl bg-primary-50 px-3 py-2 font-bold text-primary-800">
                  ترخيص مراجع
                </span>
                <span className="rounded-xl bg-slate-50 px-3 py-2 font-bold text-slate-600">
                  سجل خيالي غير محفوظ
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-primary-100 bg-primary-900 text-white">
        <div className="mx-auto grid max-w-6xl divide-y divide-white/10 px-4 sm:grid-cols-3 sm:divide-x sm:divide-x-reverse sm:divide-y-0 sm:px-6">
          {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3 px-2 py-6 sm:px-6">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-300" />
              <div>
                <p className="text-sm font-extrabold">{title}</p>
                <p className="mt-1 text-xs leading-6 text-primary-100/75">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-label justify-center">مسار الرعاية</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-ink sm:text-4xl">
              ثلاث لحظات، ومسؤولية واحدة
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              كل خطوة في الاستشارة مصممة لتقليل الالتباس وحماية المريض.
            </p>
          </div>
          <div className="care-path-grid mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: MessageCircle,
                label: "شارك السياق",
                text: "نطلب التفاصيل التي يحتاجها الطبيب، مع كشف عبارات الخطر أثناء الكتابة.",
              },
              {
                icon: ShieldCheck,
                label: "نطابق التخصص",
                text: "هذا تصور مرئي فقط؛ لا يوجد توجيه أو طبيب أو تحقق منفّذ.",
              },
              {
                icon: Clock3,
                label: "تابع في خيط واحد",
                text: "السؤال والإجابة والمتابعة والتقييم تبقى في سجل واضح يمكن الرجوع إليه.",
              },
            ].map(({ icon: Icon, label, text }, index) => (
              <article
                key={label}
                className="relative rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_12px_38px_rgba(16,42,67,.055)]"
              >
                <span className="relative z-10 mx-auto grid h-16 w-16 place-items-center rounded-2xl border-4 border-white bg-primary-600 text-white shadow-lg shadow-primary-600/20">
                  <Icon className="h-6 w-6" />
                </span>
                <p className="mt-5 text-[10px] font-black tracking-[.16em] text-coral-500">
                  الخطوة ٠{index + 1}
                </p>
                <h3 className="mt-2 text-lg font-black text-ink">{label}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-9 flex items-end justify-between gap-5">
            <div>
              <p className="section-label">اختر التخصص</p>
              <h2 className="mt-3 text-3xl font-black text-ink">
                ابدأ من الباب الصحيح
              </h2>
            </div>
            <Link
              to="/doctors"
              className="hidden items-center gap-1 text-sm font-bold text-primary-700 sm:flex"
            >
              كل التخصصات <ChevronLeft className="h-4 w-4 rtl-flip" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {FEATURED_SPECIALTIES.map((specialty, index) => (
              <Link
                key={specialty.id}
                to={`/consultations/new?specialty=${specialty.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-primary-300 hover:shadow-[0_14px_34px_rgba(16,42,67,.08)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-700 [&_svg]:h-5 [&_svg]:w-5">
                  {specialtyIcons[index]}
                </span>
                <h3 className="mt-5 text-sm font-extrabold leading-6 text-ink group-hover:text-primary-700">
                  {specialty.nameAr}
                </h3>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                  ابدأ السؤال <ArrowLeft className="h-3 w-3 rtl-flip" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-9 flex items-end justify-between gap-5">
            <div>
              <p className="section-label">معرفة مُراجعة</p>
              <h2 className="mt-3 text-3xl font-black text-ink">
                اقرأ بهدوء، لا بخوف
              </h2>
            </div>
            <Link
              to="/articles"
              className="hidden items-center gap-1 text-sm font-bold text-primary-700 sm:flex"
            >
              كل المقالات <ChevronLeft className="h-4 w-4 rtl-flip" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {MOCK_ARTICLES.slice(0, 3).map((article) => (
              <Link
                key={article.id}
                to={`/articles/${article.id}`}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_36px_rgba(16,42,67,.05)]"
              >
                <div className="relative h-44 overflow-hidden bg-primary-50">
                  <img
                    src={article.coverUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/35 to-transparent" />
                </div>
                <div className="p-5">
                  <DemoLabel>مقال ومؤلف خياليان</DemoLabel>
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="primary">{article.category}</Badge>
                    <span className="text-[11px] text-slate-400">
                      {article.readTimeMinutes} دقائق
                    </span>
                  </div>
                  <h3 className="mt-4 line-clamp-2 text-base font-black leading-7 text-ink transition group-hover:text-primary-700">
                    {article.title}
                  </h3>
                  <p className="mt-4 text-xs font-medium text-slate-400">
                    راجعه {article.authorName}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-ink px-6 py-10 text-white sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
          <div
            className="absolute -left-16 -top-20 h-64 w-64 rounded-full border-[2rem] border-primary-500/10"
            aria-hidden="true"
          />
          <div className="relative">
            <p className="text-xs font-bold text-primary-300">
              عندما تحتاج إلى توجيه
            </p>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              ابدأ بسؤال واضح، واترك الباقي لمسار الرعاية.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              الخدمة لا تستبدل الفحص المباشر، ولا تُستخدم في حالات الطوارئ.
            </p>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-3 lg:mt-0">
            <Link to="/consultations/new">
              <Button
                size="lg"
                className="bg-white text-ink hover:bg-primary-50"
              >
                ابدأ استشارة
              </Button>
            </Link>
            <Link to="/legal/disclaimer">
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                اقرأ التنويه
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
