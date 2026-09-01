import { Phone, AlertTriangle, X } from "lucide-react"
import { useState } from "react"
import { EMERGENCY_CONTENT } from "@/lib/emergency"

export default function EmergencyBanner({
  onDismiss,
}: {
  onDismiss?: () => void
}) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  function handleDismiss() {
    setVisible(false)
    onDismiss?.()
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-2xl border-2 border-red-400 bg-red-50 p-5 animate-[fadeSlideUp_0.2s_ease-out_both]"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-red-800 text-base">
            {EMERGENCY_CONTENT.title}
          </p>
          <p className="mt-1.5 text-sm text-red-700 leading-relaxed">
            {EMERGENCY_CONTENT.body}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {EMERGENCY_CONTENT.contacts.map((contact) => (
              <a
                key={contact.href}
                href={contact.href}
                className="inline-flex items-center gap-1.5 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {contact.label}
              </a>
            ))}
          </div>
          <button
            onClick={handleDismiss}
            className="mt-3 text-xs text-red-600 underline hover:text-red-800 transition-colors"
          >
            أعلم أن حالتي ليست طارئة — تابع تقديم الاستشارة
          </button>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="إغلاق"
          className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
