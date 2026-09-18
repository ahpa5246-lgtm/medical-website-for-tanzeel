import type { ReactNode } from "react"
import { Settings2 } from "lucide-react"
import { readRuntimeConfig } from "@/lib/runtimeConfig.mjs"

interface ConfigurationGateProps {
  children: ReactNode
}

export default function ConfigurationGate({
  children,
}: ConfigurationGateProps) {
  const config = readRuntimeConfig({
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_ENABLE_PROTOTYPE: import.meta.env.VITE_ENABLE_PROTOTYPE,
  })

  if (config.mode !== "blocked") return children

  return (
    <main dir="rtl" className="mc-system-state">
      <section className="mc-system-state__panel mc-surface-raised" role="alert">
        <span className="mc-system-state__icon" aria-hidden="true">
          <Settings2 />
        </span>
        <h1 className="mc-system-state__title">إعداد المنصة غير مكتمل</h1>
        <p className="mc-system-state__description">
          تحتاج النسخة المتصلة إلى رابط Supabase والمفتاح العام. لم ننتقل إلى
          بيانات وهمية لأن النسخة النهائية يجب أن تحفظ العمليات فعليًا.
        </p>
        <ul className="mt-5 space-y-2 text-sm font-bold text-red-700">
          {config.issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
        <p className="mt-5 text-xs leading-6 text-slate-500">
          للتطوير المحلي المؤقت فقط يمكن ضبط VITE_ENABLE_PROTOTYPE=true.
        </p>
      </section>
    </main>
  )
}
