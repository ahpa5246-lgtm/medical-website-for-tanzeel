import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Medal,
  PenLine,
  Sparkles,
  Star,
} from "lucide-react"
import { useAuth } from "@/features/auth/AuthProvider"
import { ErrorState, LoadingState } from "@/components/system/AsyncState"
import {
  isSpaceDemo,
  listSpaceEntries,
  type SpaceEntry,
  type SpaceKind,
} from "./spaceRepository"
import "./tanzeel.css"

const sections: {
  kind: SpaceKind
  eyebrow: string
  title: string
  description: string
  icon: typeof BookOpen
}[] = [
  {
    kind: "book_review",
    eyebrow: "01 / ما قرأته",
    title: "من رفّ الكتب",
    description: "كتب تختارها د. تنزيل وتشارك رأيها فيها بعد القراءة.",
    icon: BookOpen,
  },
  {
    kind: "article",
    eyebrow: "02 / ما تكتبه",
    title: "مقالات بصوتها",
    description: "أفكار ونصوص تنشرها الدكتورة باسمها في هذه المساحة.",
    icon: PenLine,
  },
  {
    kind: "achievement",
    eyebrow: "03 / ما أنجزته",
    title: "محطات وإنجازات",
    description: "سجل للإنجازات المهنية بعد توثيق معلوماتها.",
    icon: Medal,
  },
  {
    kind: "course",
    eyebrow: "04 / ما تقدّمه",
    title: "دورات د. تنزيل",
    description: "دوراتها الخاصة مرتبطة بمسارات الأكاديمية عند نشرها.",
    icon: GraduationCap,
  },
]

function EntryCard({ entry }: { entry: SpaceEntry }) {
  const external = entry.link_url.startsWith("https://")
  return (
    <article className="tanzeel-card">
      <div className="tanzeel-card-top">
        <span className="tanzeel-card-mark" aria-hidden="true">
          ✳
        </span>
        {entry.is_demo && (
          <span className="tanzeel-demo-label">مثال تجريبي</span>
        )}
      </div>
      <h3>{entry.title}</h3>
      <p>{entry.summary}</p>
      {entry.kind === "book_review" && entry.rating && (
        <div
          className="tanzeel-rating"
          aria-label={`تقييم نموذجي ${entry.rating} من 5`}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              aria-hidden="true"
              className={index < entry.rating! ? "filled" : ""}
            />
          ))}
        </div>
      )}
      <details className="tanzeel-card-details">
        <summary>
          {entry.kind === "article" ? "اقرئي المقال" : "اعرفي المزيد"}
        </summary>
        <p>{entry.body}</p>
      </details>
      {entry.link_url &&
        (external ? (
          <a
            className="tanzeel-card-link"
            href={entry.link_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            زيارة الرابط <ArrowLeft aria-hidden="true" />
          </a>
        ) : (
          <Link className="tanzeel-card-link" to={entry.link_url}>
            افتحي الدورة <ArrowLeft aria-hidden="true" />
          </Link>
        ))}
    </article>
  )
}

export default function TanzeelSpace() {
  const [entries, setEntries] = useState<SpaceEntry[] | null>(null)
  const [error, setError] = useState("")
  const { profile } = useAuth()
  const canEdit =
    isSpaceDemo() || ["owner", "admin", "editor"].includes(profile?.role ?? "")

  useEffect(() => {
    let active = true
    listSpaceEntries()
      .then((value) => {
        if (active) setEntries(value)
      })
      .catch(() => {
        if (active) setError("تعذر تحميل مساحة تنزيل الآن.")
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <main dir="rtl" className="tanzeel-page">
      <section className="tanzeel-hero">
        <div className="tanzeel-hero-orbit" aria-hidden="true" />
        <div className="tanzeel-shell tanzeel-hero-grid">
          <div className="tanzeel-hero-copy">
            <span className="tanzeel-kicker">
              <Sparkles aria-hidden="true" /> المساحة الشخصية
            </span>
            <p className="tanzeel-overline">على ميدكونكت</p>
            <h1>
              مساحة <em>تنزيل</em>
            </h1>
            <p className="tanzeel-hero-lede">
              رفّ لقراءاتها، نافذة لمقالاتها، وسجلّ لما تنجزه وتعلّمه. هنا تلتقي
              الخبرة الطبية بصوت الدكتورة الشخصي.
            </p>
            <div className="tanzeel-hero-actions">
              <a href="#tanzeel-sections" className="tanzeel-primary-action">
                اكتشفي المساحة <ArrowLeft aria-hidden="true" />
              </a>
              {canEdit && (
                <Link to="/tanzeel/manage" className="tanzeel-secondary-action">
                  تحرير المحتوى
                </Link>
              )}
            </div>
            {isSpaceDemo() && (
              <p className="tanzeel-prototype-note">
                المحتوى المعروض نموذج أولي. تُضاف قراءات الدكتورة وإنجازاتها
                الحقيقية بعد مراجعتها.
              </p>
            )}
          </div>
          <figure className="tanzeel-portrait-frame">
            <img
              src="/tanzeel/podcast-cover.png"
              alt="ملصق بصمة طبية المرفق وفيه صورة د. تنزيل"
              width="1280"
              height="1280"
            />
            <figcaption>من الصورة المرفقة لهوية «بصمة طبية»</figcaption>
          </figure>
        </div>
      </section>

      <div id="tanzeel-sections" className="tanzeel-shell tanzeel-sections">
        <div className="tanzeel-intro">
          <span>مكتبة شخصية · محتوى أصيل · مسار مهني</span>
          <h2>ما وراء المعطف الأبيض</h2>
          <p>
            تصفحي ما تنشره د. تنزيل من مراجعات ومقالات ودورات، وتابعي محطاتها
            المهنية في مكان واحد.
          </p>
        </div>
        {error && (
          <ErrorState
            title="تعذر تحميل المحتوى"
            description={error}
            onRetry={() => window.location.reload()}
          />
        )}
        {!error && !entries && <LoadingState label="جارٍ تحميل مساحة تنزيل…" />}
        {entries &&
          sections.map(({ kind, eyebrow, title, description, icon: Icon }) => {
            const items = entries.filter((entry) => entry.kind === kind)
            return (
              <section
                key={kind}
                className="tanzeel-section"
                aria-labelledby={`tanzeel-${kind}`}
              >
                <div className="tanzeel-section-heading">
                  <span className="tanzeel-section-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <div>
                    <p>{eyebrow}</p>
                    <h2 id={`tanzeel-${kind}`}>{title}</h2>
                    <span>{description}</span>
                  </div>
                </div>
                {items.length ? (
                  <div className="tanzeel-card-grid">
                    {items.map((entry) => (
                      <EntryCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                ) : (
                  <div className="tanzeel-empty">
                    لم يُنشر محتوى في هذا القسم بعد.
                  </div>
                )}
              </section>
            )
          })}
      </div>
    </main>
  )
}
