import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, Stethoscope, ShieldCheck } from "lucide-react"
import Button from "@/components/ui/Button"

const NAV_LINKS = [
  { to: "/consultations", label: "استشاراتي" },
  { to: "/doctors", label: "الأطباء" },
  { to: "/articles", label: "المعرفة الصحية" },
]

const LATER_LINKS = [
  { to: "/courses", label: "الأكاديمية" },
  { to: "/library", label: "المكتبة" },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setMobileOpen(false), [location.pathname])

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
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">
                دخول
              </Button>
            </Link>
            <Link to="/consultations/new">
              <Button
                size="sm"
                className="rounded-full px-4 shadow-[0_8px_22px_rgba(8,126,139,.18)]"
              >
                اسأل طبيبًا
              </Button>
            </Link>
          </div>

          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 md:hidden"
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
        <div id="mobile-menu" className="mobile-menu md:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4">
            {[...NAV_LINKS, ...LATER_LINKS].map((link) => (
              <Link
                key={link.to}
                to={link.to}
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
              <Link to="/auth/login">
                <Button variant="outline" className="w-full">
                  دخول
                </Button>
              </Link>
              <Link to="/consultations/new">
                <Button className="w-full">اسأل طبيبًا</Button>
              </Link>
            </div>
            <Link
              to="/verification/apply"
              className="mt-2 flex items-center justify-center gap-2 py-2 text-xs font-bold text-primary-700"
            >
              <ShieldCheck className="h-4 w-4" /> انضم كطبيب موثّق
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
