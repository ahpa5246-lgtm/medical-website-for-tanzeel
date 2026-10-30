import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, Stethoscope, ShieldCheck } from "lucide-react"
import Button from "@/components/ui/Button"
import { publicPreview } from "@/lib/releaseFlags"

const NAV_LINKS = [
  { to: "/consultations", label: "الاستشارات (قريبًا)" },
  { to: "/doctors", label: publicPreview ? "الأطباء (قريبًا)" : "الأطباء" },
  { to: "/articles", label: "المعرفة الصحية" },
  { to: "/training", label: "تدريب" },
  { to: "/labs", label: "المختبرات" },
]

const LATER_LINKS = [
  { to: "/courses", label: "الأكاديمية" },
  { to: "/library", label: "المكتبة" },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const menuButton = useRef<HTMLButtonElement>(null)

  useEffect(() => setMobileOpen(false), [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false)
        menuButton.current?.focus()
      }
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [mobileOpen])

  function isActive(path: string) {
    return location.pathname.startsWith(path)
  }

  return (
    <header className="site-header" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-[4.5rem] items-center justify-between gap-4">
          <Link
            to="/"
            className="brand-lockup"
            aria-label="ميدكونكت — الصفحة الرئيسية"
          >
            <span className="brand-mark" aria-hidden="true">
              <Stethoscope
                className="h-[1.15rem] w-[1.15rem]"
                strokeWidth={2.25}
              />
            </span>
            <span>
              <span className="block text-lg font-black leading-5 tracking-tight text-ink">
                ميدكونكت
              </span>
              <span className="block text-[9px] font-semibold tracking-[0.08em] text-slate-400">
                اسم تجريبي · صحة بثقة
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="التنقل الرئيسي"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive(link.to) ? "page" : undefined}
                className={`nav-link ${
                  isActive(link.to) ? "nav-link-active" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
            {LATER_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive(link.to) ? "page" : undefined}
                className="nav-link group gap-1.5 text-slate-400"
              >
                {link.label}
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-500 transition group-hover:bg-primary-50 group-hover:text-primary-700">
                  لاحقًا
                </span>
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {!publicPreview && (
              <Link to="/auth/login">
                <Button variant="ghost" size="sm">
                  دخول
                </Button>
              </Link>
            )}
            <Link to="/consultations">
              <Button
                size="sm"
                className="rounded-full px-4 shadow-[0_8px_22px_rgba(8,126,139,.18)]"
              >
                قيد التطوير
              </Button>
            </Link>
          </div>

          <button
            ref={menuButton}
            type="button"
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 lg:hidden"
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
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-menu" className="mobile-menu lg:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4">
            {[...NAV_LINKS, ...LATER_LINKS].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive(link.to) ? "page" : undefined}
                className={`flex min-h-11 items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold ${
                  isActive(link.to)
                    ? "bg-primary-50 text-primary-800"
                    : "text-slate-700"
                }`}
              >
                {link.label}
                {LATER_LINKS.some((later) => later.to === link.to) && (
                  <span className="text-[10px] font-medium text-slate-400">
                    المرحلة الثانية
                  </span>
                )}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
              {!publicPreview && (
                <Link to="/auth/login">
                  <Button variant="outline" className="w-full">
                    دخول
                  </Button>
                </Link>
              )}
              <Link to="/consultations">
                <Button className="w-full">قيد التطوير</Button>
              </Link>
            </div>
            {!publicPreview && <Link
              to="/verification/apply"
              className="mt-2 flex items-center justify-center gap-2 py-2 text-xs font-bold text-primary-700"
            >
              <ShieldCheck className="h-4 w-4" /> نموذج انضمام خيالي
            </Link>}
          </div>
        </div>
      )}
    </header>
  )
}
