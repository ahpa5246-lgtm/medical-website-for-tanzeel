import { Info } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase"
import { publicPreview } from "@/lib/releaseFlags"

export default function PreviewNotice() {
  if (isSupabaseConfigured() && !publicPreview) return null

  return (
    <div className="preview-notice" role="status" dir="rtl">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
        <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
        <p className="flex-1 text-xs leading-5">
          {publicPreview ? (
            <>
              <strong>نسخة عرض غير طبية:</strong> المقالات أمثلة خيالية غير
              مراجعة. الحسابات والاستشارات ورفع الملفات معطلة. لا تدخل معلومات
              شخصية أو صحية.
            </>
          ) : (
            <>
              <strong>وضع المعاينة:</strong> فعّل اتصال قاعدة البيانات لتشغيل
              الحسابات والحفظ والنشر.
            </>
          )}
        </p>
      </div>
    </div>
  )
}
