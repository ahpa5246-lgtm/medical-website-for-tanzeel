import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Star,
  Stethoscope,
} from "lucide-react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { MOCK_DOCTORS } from "@/data/mockData"

export default function DoctorProfile() {
  const { id } = useParams()
  const doctor = MOCK_DOCTORS.find((item) => item.id === id)

  if (!doctor) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-ink">الطبيب غير موجود</h1>
        <Link to="/doctors">
          <Button className="mt-6">دليل الأطباء</Button>
        </Link>
      </div>
    )
  }

  return (
    <div dir="rtl" className="pb-20">
      <section className="bg-primary-50/70">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <Link
            to="/doctors"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-700"
          >
            <ArrowLeft className="h-3.5 w-3.5 rotate-180" /> دليل الأطباء
          </Link>
          <div className="mt-7 grid gap-7 rounded-[2rem] border border-primary-100 bg-white p-5 shadow-[0_18px_50px_rgba(16,42,67,.07)] sm:p-8 md:grid-cols-[auto_1fr_auto] md:items-center">
            <img
              src={doctor.avatarUrl}
              alt={`صورة توضيحية لـ ${doctor.name}`}
              className="h-28 w-28 rounded-3xl object-cover"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-ink">{doctor.name}</h1>
                <Badge variant="primary">
                  <ShieldCheck className="h-3 w-3" /> موثّق
                </Badge>
              </div>
              <p className="mt-2 font-bold text-primary-700">
                {doctor.specialty}
              </p>
              {doctor.hospital && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <Building2 className="h-4 w-4" /> {doctor.hospital}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />{" "}
                  {doctor.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock3 className="h-4 w-4" /> {doctor.yearsExperience} سنوات
                  خبرة
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> ملف توضيحي
                </span>
              </div>
            </div>
            <Link to={`/consultations/new?specialty=${doctor.specialtyId}`}>
              <Button size="lg" className="w-full md:w-auto">
                ابدأ استشارة
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 pt-8 sm:px-6 md:grid-cols-[1fr_18rem]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-black text-ink">عن الطبيب</h2>
          <p className="mt-4 text-sm leading-8 text-slate-600">{doctor.bio}</p>
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-black text-ink">
              ما الذي يعنيه التحقق؟
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {[
                "مراجعة وثيقة الهوية المهنية",
                "مطابقة التخصص قبل إتاحة الرد",
                "تسجيل كل إجراء متعلق بحالة التحقق",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary-600" />{" "}
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <aside className="h-fit rounded-3xl bg-ink p-5 text-white">
          <Stethoscope className="h-6 w-6 text-primary-300" />
          <h2 className="mt-4 text-base font-black">ملف توضيحي</h2>
          <p className="mt-2 text-xs leading-6 text-slate-300">
            الأسماء والصور والبيانات في نسخة المعاينة أمثلة مركبة وليست دليلًا
            على أطباء منضمين حاليًا.
          </p>
        </aside>
      </div>
    </div>
  )
}
