import { EMERGENCY_CONTENT } from "@/lib/emergency"

import { Link } from "react-router-dom"

import { AlertTriangle, ShieldCheck, Stethoscope } from "lucide-react"

const groups = [
  {
    title: "الرعاية",

    links: [
      ["/consultations/new", "استشارة جديدة"],

      ["/consultations", "استشاراتي"],

      ["/doctors", "دليل الأطباء"],
    ],
  },

  {
    title: "المعرفة",

    links: [
      ["/articles", "المقالات الصحية"],
      ["/tanzeel", "مساحة تنزيل"],

      ["/courses", "الأكاديمية"],
      ["/library", "المكتبة"],
    ],
  },

  {
    title: "الثقة والقانون",

    links: [
      ["/legal/disclaimer", "التنويه الطبي"],

      ["/legal/privacy", "سياسة الخصوصية"],

      ["/legal/terms", "شروط الاستخدام"],
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-auto bg-ink text-slate-300" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-white"
            >
              <span className="brand-mark">
                <Stethoscope className="h-4 w-4" />
              </span>
              <span className="font-display text-lg font-black">ميدكونكت</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              مشروع عربي قيد التطوير لبناء استشارات طبية أكثر وضوحًا ومسؤولية،
              بهوية مؤقتة حتى اعتماد الاسم النهائي.
            </p>
            <Link
              to="/verification/apply"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary-300 hover:text-primary-200"
            >
              <ShieldCheck className="h-4 w-4" /> التقديم للتحقق كطبيب
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="font-display text-sm font-bold text-white">
                  {group.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {group.links.map(([to, label]) => (
                    <li key={to + label}>
                      <Link
                        to={to}
                        className="text-sm text-slate-400 transition hover:text-white"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex items-start gap-2 rounded-2xl border border-coral-500/20 bg-coral-500/5 p-4 text-xs leading-6 text-slate-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-coral-500" />
          <p>
            {EMERGENCY_CONTENT.body}{" "}
            {EMERGENCY_CONTENT.contacts.map((item) => item.label).join("، ")}
          </p>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} ميدكونكت — اسم وهوية تجريبية.</p>
          <p>مصمم بالعربية أولًا · اتجاه RTL · متوافق مع الهاتف</p>
        </div>
      </div>
    </footer>
  )
}
