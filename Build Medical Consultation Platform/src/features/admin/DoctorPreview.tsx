import type { DoctorDraft } from "./doctorDraft"

export default function DoctorPreview({ draft }: { draft: DoctorDraft }) {
  return (
    <aside
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-label="معاينة الملف"
    >
      <p className="text-xs font-bold text-primary-700">معاينة مباشرة</p>
      <div className="mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
        {draft.image_path ? (
          <img
            src={draft.image_path}
            alt={draft.image_alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            لا توجد صورة بعد
          </div>
        )}
      </div>
      {draft.profile_kind === "fictional_demo" && (
        <span className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
          ملف تعريفي تجريبي
        </span>
      )}
      <h2 className="mt-3 text-2xl font-black text-slate-900">
        {draft.display_name || "اسم الطبيب"}
      </h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
        {draft.bio || "ستظهر النبذة هنا أثناء الكتابة."}
      </p>
    </aside>
  )
}
