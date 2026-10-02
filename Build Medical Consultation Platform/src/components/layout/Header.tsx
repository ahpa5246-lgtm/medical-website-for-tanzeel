import { useEffect, useState } from "react"

import { Link, useLocation } from "react-router-dom"

import { Menu, X, Stethoscope, ShieldCheck, Sparkles } from "lucide-react"

import Button from "@/components/ui/Button"
import { consultationsEnabled } from "@/lib/featureFlags.mjs"

const medicalServiceEnabled = consultationsEnabled(import.meta.env)

const NAV_LINKS = [
  { to: "/", label: "الرئيسية" },
  { to: "/tanzeel", label: "مساحة تنزيل" },
  { to: "/consultations", label: "الاستشارات" },

  { to: "/doctors", label: "الأطباء" },

  { to: "/articles", label: "المعرفة الصحية" },

  { to: "/courses", label: "الأكاديمية" },
  { to: "/library", label: "المكتبة" },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const location = useLocation()

  useEffect(() => setMobileOpen(false), [location.pathname])

  function isActive(path: string) {
    return path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path)
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
              <span className="block text-xs font-semibold text-slate-500">
                اسم تجريبي · صحة بثقة
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 xl:flex"
            aria-label="التنقل الرئيسي"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={
                  link.to === "/tanzeel"
                    ? `tanzeel-nav-link ${
                        isActive(link.to) ? "tanzeel-nav-link-active" : ""
                      }`
                    : `nav-link ${isActive(link.to) ? "nav-link-active" : ""}`
                }
              >
                {link.to === "/tanzeel" && (
                  <Sparkles aria-hidden="true" className="h-4 w-4" />
                )}
                {link.label}
                {link.to === "/consultations" && !medicalServiceEnabled && (
                  <small className="development-badge">قيد التطوير</small>
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 xl:flex">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">
                دخول
              </Button>
            </Link>
            <Link
              to={medicalServiceEnabled ? "/consultations/new" : "/courses"}
            >
              <Button
                size="sm"
                className="rounded-full px-4 shadow-[0_8px_22px_rgba(8,126,139,.18)]"
              >
                {medicalServiceEnabled ? "اسأل طبيبًا" : "ابدأ التعلم"}
              </Button>
            </Link>
          </div>

          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 xl:hidden"
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
        <div id="mobile-menu" className="mobile-menu xl:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex min-h-11 items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold ${
                  link.to === "/tanzeel"
                    ? "bg-pink-50 text-[#963b71]"
                    : isActive(link.to)
                      ? "bg-primary-50 text-primary-800"
                      : "text-slate-700"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {link.to === "/tanzeel" && (
                    <Sparkles aria-hidden="true" className="h-4 w-4" />
                  )}
                  {link.label}
                  {link.to === "/consultations" && !medicalServiceEnabled && (
                    <small className="development-badge">قيد التطوير</small>
                  )}
                </span>
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
              <Link to="/auth/login">
                <Button variant="outline" className="w-full">
                  دخول
                </Button>
              </Link>
              <Link
                to={medicalServiceEnabled ? "/consultations/new" : "/courses"}
              >
                <Button className="w-full">
                  {medicalServiceEnabled ? "اسأل طبيبًا" : "ابدأ التعلم"}
                </Button>
              </Link>
            </div>
            <Link
              to="/verification/apply"
              className="mt-2 flex items-center justify-center gap-2 py-2 text-xs font-bold text-primary-700"
            >
              <ShieldCheck className="h-4 w-4" /> نموذج انضمام خيالي
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
