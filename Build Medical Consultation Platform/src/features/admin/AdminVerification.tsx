import { useEffect, useState } from "react"
import {
  loadVerification,
  reviewVerification,
  verificationDocumentUrl,
} from "@/features/content/contentRepository"
import type { VerificationRecord } from "@/features/content/types"
export default function AdminVerification() {
  const [items, setItems] = useState<VerificationRecord[]>([])
  const [error, setError] = useState("")
  const [note, setNote] = useState<Record<string, string>>({})
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [refresh, setRefresh] = useState(0)
  useEffect(() => {
    let active = true
    loadVerification()
      .then((v) => {
        if (active) setItems(v)
      })
      .catch(() => {
        if (active) setError("تعذر تحميل الطلبات.")
      })
    return () => {
      active = false
    }
  }, [refresh])
  async function act(
    item: VerificationRecord,
    status: VerificationRecord["status"],
  ) {
    setBusy(item.id)
    setError("")
    try {
      await reviewVerification(item.id, status, note[item.id] || "")
      setRefresh((v) => v + 1)
    } catch {
      setError("تعذر حفظ قرار المراجعة.")
    } finally {
      setBusy(null)
    }
  }
  async function document(item: VerificationRecord) {
    if (!item.document_path) return
    setBusy(item.id)
    try {
      setUrls((v) => ({ ...v, [item.id]: "" }))
      const url = await verificationDocumentUrl(item.document_path)
      setUrls((v) => ({ ...v, [item.id]: url }))
    } catch {
      setError("تعذر فتح الوثيقة أو انتهت صلاحيتها.")
    } finally {
      setBusy(null)
    }
  }
  return (
    <section>
      <h1 className="text-2xl font-black">مراجعة التحقق المهني</h1>
      <p className="mt-3 text-sm text-slate-600">
        قبول الطلب يسجل القرار. ربط مقدم الرعاية والصلاحيات يتم من إدارة الأطباء
        بعد التحقق الفعلي.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-red-700">
          {error}
        </p>
      )}
      {!items.length && <p className="mt-6">لا توجد طلبات متاحة.</p>}
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border bg-white p-5">
            <h2 className="font-bold">{item.full_name}</h2>
            <p className="mt-2">
              {item.license_number} · {item.status}
            </p>
            <p className="mt-2 text-sm">{item.bio}</p>
            {item.document_path && (
              <div className="mt-3">
                <button
                  disabled={busy === item.id}
                  className="underline"
                  onClick={() => void document(item)}
                >
                  إنشاء رابط الوثيقة
                </button>
                {urls[item.id] && (
                  <a
                    className="ms-3 text-primary-700 underline"
                    href={urls[item.id]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    فتح الوثيقة — الرابط مؤقت
                  </a>
                )}
              </div>
            )}
            <label className="mt-3 block">
              ملاحظة المراجعة
              <textarea
                className="mt-2 w-full rounded-xl border p-3"
                maxLength={2000}
                value={note[item.id] ?? item.review_note}
                onChange={(e) =>
                  setNote((v) => ({ ...v, [item.id]: e.target.value }))
                }
              />
            </label>
            <div className="mt-3 flex gap-3">
              {([
                ["approved", "قبول"],
                ["needs_information", "طلب معلومات"],
                ["rejected", "رفض"],
              ] as const).map(([status, label]) => (
                <button
                  key={status}
                  disabled={busy === item.id}
                  className="rounded-xl border p-3"
                  onClick={() => void act(item, status)}
                >
                  {label}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
