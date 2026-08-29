import { FlaskConical } from "lucide-react"

export default function PreviewNotice() {
  return (
    <div className="preview-notice sticky top-0 z-[100]" role="alert" dir="rtl">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:px-6">
        <FlaskConical className="h-4 w-4 shrink-0" aria-hidden="true" />
        <p className="flex-1 text-xs leading-5">
          <strong>نموذج أولي غير تشغيلي:</strong> ليس خدمة طبية ولا يرسل أو يحفظ
          أي بيانات. لا تُدخل بيانات شخصية أو طبية حقيقية. كل الأسماء والمحتوى
          والأرقام المعروضة بيانات عرض خيالية.
        </p>
      </div>
    </div>
  )
}
