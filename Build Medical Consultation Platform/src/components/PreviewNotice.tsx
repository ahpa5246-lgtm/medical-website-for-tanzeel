import { FlaskConical, X } from "lucide-react"
import { useState } from "react"

export default function PreviewNotice() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="preview-notice" role="status" dir="rtl">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:px-6">
        <FlaskConical className="h-4 w-4 shrink-0" aria-hidden="true" />
        <p className="flex-1 text-xs leading-5">
          <strong>نسخة معاينة قبل الإطلاق:</strong> لا تُدخل بيانات شخصية أو طبية
          حقيقية. الحسابات والرسائل لم تُربط بالخادم بعد.
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="rounded-lg p-1 transition hover:bg-white/15"
          aria-label="إخفاء تنبيه المعاينة"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
