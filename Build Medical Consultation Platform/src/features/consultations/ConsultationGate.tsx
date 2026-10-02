import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Clock3 } from "lucide-react"
import { consultationsEnabled } from "@/lib/featureFlags.mjs"

export default function ConsultationGate({
  children,
}: {
  children: ReactNode
}) {
  if (consultationsEnabled(import.meta.env)) return children
  return (
    <section
      className="consultation-deferred"
      dir="rtl"
      aria-labelledby="deferred-title"
    >
      <div className="consultation-deferred-content">
        <Clock3 aria-hidden="true" className="h-8 w-8" />
        <h1 id="deferred-title">الاستشارات الطبية قيد التطوير</h1>
        <p>
          نجهّز هذا القسم بالتعاون مع أطباء موثوقين قبل إتاحة الاستشارات. يمكنك
          الآن استكشاف الكورسات والملخصات الطبية ومساحة د. تنزيل.
        </p>
        <div className="deferred-actions">
          <Link to="/courses" className="deferred-primary">
            استكشف الأكاديمية
          </Link>
          <Link to="/library" className="deferred-secondary">
            تصفح المكتبة
          </Link>
        </div>
      </div>
      <div className="deferred-word" aria-hidden="true">
        قريبًا
      </div>
    </section>
  )
}
