import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, Stethoscope } from "lucide-react"
import { useAuth } from "@/features/auth/AuthProvider"

const NAV_LINKS = [
  { to: "/consultations", label: "استشاراتي" },
  { to: "/doctors", label: "الأطباء" },
  { to: "/articles", label: "المعرفة الصحية" },
  { to: "/training", label: "تدريب" },
  { to: "/labs", label: "المختبرات" },
  { to: "/courses", label: "الأكاديمية" },
  { to: "/library", label: "المكتبة" },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const toggle = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()
  const { session, profile, signOut } = useAuth()
  useEffect(() => setMobileOpen(false), [pathname])
  useEffect(() => {
    if (!mobileOpen) return
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false)
        toggle.current?.focus()
      }
    }
    document.addEventListener("keydown", escape)
    return () => document.removeEventListener("keydown", escape)
  }, [mobileOpen])
  async function logout() {
    setBusy(true)
    setError("")
    try {
      await signOut()
      setMobileOpen(false)
    } catch {
      setError("تعذر تسجيل الخروج. أعيدي المحاولة.")
    } finally {
      setBusy(false)
    }
  }
  const privileged =
    profile && ["owner", "admin", "editor"].includes(profile.role)
  const nav = (mobile = false) => (
    <nav
      className={mobile ? "grid gap-1" : "hidden items-center gap-1 lg:flex"}
      aria-label={mobile ? "التنقل من القائمة" : "التنقل الرئيسي"}
    >
      {NAV_LINKS.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          aria-current={pathname.startsWith(to) ? "page" : undefined}
          className={`nav-link ${
            pathname.startsWith(to) ? "nav-link-active" : ""
          }`}
        >
          {label}
        </Link>
      ))}
      {privileged && (
        <Link className="nav-link" to="/admin">
          الإدارة
        </Link>
      )}
    </nav>
  )
  const account = (
    <>
      {session ? (
        <>
          <Link className="nav-link" to="/consultations">
            {profile?.display_name || "حسابي"}
          </Link>
          <button
            type="button"
            className="nav-link"
            disabled={busy}
            onClick={() => void logout()}
          >
            {busy ? "جارٍ الخروج…" : "تسجيل الخروج"}
          </button>
        </>
      ) : (
        <Link className="nav-link" to="/auth/login">
          دخول
        </Link>
      )}
      <Link
        className="rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white"
        to="/consultations/new"
      >
        اسأل طبيبًا
      </Link>
    </>
  )
  return (
    <header className="site-header" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-3">
          <Link
            to="/"
            className="brand-lockup"
            aria-label="ميدكونكت — الصفحة الرئيسية"
          >
            <span className="brand-mark" aria-hidden="true">
              <Stethoscope className="h-5 w-5" />
            </span>
            <span className="text-lg font-black text-ink">ميدكونكت</span>
          </Link>
          {nav()}
          <div className="hidden items-center gap-2 xl:flex">{account}</div>
          <button
            ref={toggle}
            type="button"
            className="rounded-xl border border-slate-200 p-2.5 lg:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <div className="hidden lg:flex xl:hidden">
            {session ? (
              <button
                type="button"
                disabled={busy}
                className="nav-link"
                onClick={() => void logout()}
              >
                خروج
              </button>
            ) : (
              <Link className="nav-link" to="/auth/login">
                دخول
              </Link>
            )}
          </div>
        </div>
        {error && (
          <p role="alert" className="pb-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
      {mobileOpen && (
        <div id="mobile-menu" className="mobile-menu lg:hidden">
          <div className="mx-auto max-w-6xl px-4 py-4">
            {nav(true)}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
              {account}
            </div>
            <Link className="nav-link mt-2" to="/verification/apply">
              طلب تحقق مهني
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
