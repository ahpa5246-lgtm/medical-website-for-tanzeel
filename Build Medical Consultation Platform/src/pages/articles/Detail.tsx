import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Stethoscope,
} from "lucide-react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { MOCK_ARTICLES } from "@/data/mockData"
import DemoLabel from "@/components/DemoLabel"

export default function ArticleDetail() {
  const { id } = useParams()
  const article = MOCK_ARTICLES.find((item) => item.id === id)

  if (!article) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 py-24 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
        <h1 className="mt-5 text-2xl font-black text-ink">المقال غير موجود</h1>
        <Link to="/articles">
          <Button className="mt-6">العودة إلى المقالات</Button>
        </Link>
      </div>
    )
  }

  return (
    <article dir="rtl" className="pb-20">
      <header className="relative overflow-hidden border-b border-primary-100 bg-primary-50/70">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-16">
          <div>
            <DemoLabel>مقال ومؤلف ومراجعة خيالية غير معتمدة</DemoLabel>
            <Link
              to="/articles"
              className="mb-6 inline-flex items-center gap-1 text-xs font-bold text-primary-700"
            >
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" /> كل المقالات
            </Link>
            <Badge variant="primary">{article.category}</Badge>
            <h1 className="mt-5 text-3xl font-black leading-[1.45] text-ink sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600">
              {article.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> قراءة {article.readTimeMinutes}{" "}
                دقائق
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary-600" /> مراجعة
                خيالية غير منفّذة
              </span>
            </div>
          </div>
          <img
            src={article.coverUrl}
            alt=""
            className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-[0_22px_60px_rgba(16,42,67,.14)]"
          />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="prose-ar">
          <div className="mb-8 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
            <Stethoscope className="mt-1 h-5 w-5 shrink-0" />
            <p>
              المعلومات هنا للتثقيف العام ولا تُستخدم للتشخيص أو تغيير دواء دون
              مراجعة طبيب يعرف حالتك.
            </p>
          </div>
          <h2>الفكرة الأساسية</h2>
          <p>
            لا توجد نصيحة صحية واحدة تناسب الجميع. العمر، التاريخ المرضي،
            الأدوية، ونتائج الفحص تغيّر القرار الصحيح؛ لذلك يبدأ المحتوى الآمن
            بشرح المبدأ ثم يوضح متى تحتاج إلى تقييم فردي.
          </p>
          <h2>ما الذي يمكنك فعله الآن؟</h2>
          <ul>
            <li>دوّن الأعراض ووقت ظهورها والعوامل التي تزيدها أو تخففها.</li>
            <li>
              لا توقف دواءً موصوفًا ولا تغيّر الجرعة اعتمادًا على القراءة وحدها.
            </li>
            <li>اطلب رعاية عاجلة عند ظهور علامات خطر أو تدهور سريع.</li>
          </ul>
          <h2>متى تتحدث مع طبيب؟</h2>
          <p>
            إذا كانت الأعراض جديدة، مستمرة، تؤثر في حياتك اليومية، أو ترافقها
            علامات غير معتادة، فالتقييم المباشر هو الخطوة الأكثر أمانًا.
          </p>
          <div className="mt-10 rounded-3xl bg-ink p-6 text-white">
            <h3 className="text-xl font-black">لديك سؤال عن حالتك؟</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              حوّل ما قرأته إلى سؤال واضح يراجعه طبيب في التخصص المناسب.
            </p>
            <Link to="/consultations/new">
              <Button className="mt-5 bg-white text-ink hover:bg-primary-50">
                ابدأ استشارة
              </Button>
            </Link>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
          <p className="text-xs font-bold text-slate-400">المراجعة الطبية</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-700 text-white">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-ink">
                {article.authorName}
              </p>
              <p className="text-xs text-slate-500">
                {article.authorSpecialty}
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary-600" />
            محتوى توضيحي للمعاينة، وليس سجل مراجعة منشورًا بعد.
          </div>
        </aside>
      </div>
    </article>
  )
}
