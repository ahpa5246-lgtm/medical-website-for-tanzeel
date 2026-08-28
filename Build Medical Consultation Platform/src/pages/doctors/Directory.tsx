import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  Star,
  MessageCircle,
  Shield,
  Clock,
  Filter,
  ChevronDown,
} from "lucide-react"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import { MOCK_DOCTORS } from "@/data/mockData"
import { SPECIALTIES } from "@/data/specialties"
import WaveDivider from "@/components/decorative/WaveDivider"
import FingerprintRidges from "@/components/decorative/FingerprintRidges"

export default function DoctorDirectory() {
  const [search, setSearch] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [onlineOnly, setOnlineOnly] = useState(false)

  const filtered = MOCK_DOCTORS.filter((d) => {
    const matchSearch =
      !search ||
      d.name.includes(search) ||
      d.specialty.includes(search) ||
      d.bio.includes(search)
    const matchSpecialty = !specialty || d.specialtyId === specialty
    const matchOnline = !onlineOnly || d.isOnline
    return matchSearch && matchSpecialty && matchOnline
  })

  return (
    <div dir="rtl" className="bg-white min-h-screen">
      {/* Page hero strip */}
      <div className="relative isolate overflow-hidden border-b border-slate-100 bg-gradient-to-l from-primary-50/60 to-white py-10 pb-16">
        <FingerprintRidges className="-right-12 -top-14 z-0 h-[26rem] w-[26rem] opacity-75" />
        <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6">
          <p className="section-kicker mb-2">الأطباء المعتمدون</p>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            دليل الأطباء المعتمدين
          </h1>
          <p className="text-slate-500 text-sm max-w-xl">
            نماذج توضيحية لشكل الملفات التي ستظهر بعد التحقق الفعلي من الشهادات
            والتراخيص المهنية.
          </p>
        </div>
        <WaveDivider color="#ffffff" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute inset-y-0 start-0 ms-3 my-auto w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث باسم الطبيب أو التخصص..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>

            {/* Specialty filter */}
            <div className="relative">
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="appearance-none ps-4 pe-9 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              >
                <option value="">كل التخصصات</option>
                {SPECIALTIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameAr}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Online toggle */}
            <button
              onClick={() => setOnlineOnly(!onlineOnly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                onlineOnly
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  onlineOnly ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              متاح الآن فقط
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {filtered.length} ملفات توضيحية
          </p>
          <Badge variant="warning">بيانات تجريبية</Badge>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">
              لا توجد نتائج تطابق معايير البحث
            </p>
            <button
              onClick={() => {
                setSearch("")
                setSpecialty("")
                setOnlineOnly(false)
              }}
              className="text-sm text-primary-600 underline mt-2"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doctor) => (
              <Card
                key={doctor.id}
                hover
                className="flex flex-col"
                padding="none"
              >
                {/* Top: photo + info */}
                <div className="p-5 flex gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={doctor.avatarUrl}
                      alt={`صورة ${doctor.name}`}
                      className="w-16 h-16 rounded-2xl object-cover bg-primary-50"
                    />
                    {doctor.isOnline && (
                      <span className="absolute bottom-0.5 end-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <p className="font-bold text-slate-900">
                          {doctor.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {doctor.specialty}
                        </p>
                      </div>
                      <Badge variant="primary" size="sm">
                        <Shield className="w-3 h-3" />
                      </Badge>
                    </div>
                    {doctor.hospital && (
                      <p className="text-xs text-slate-400 mt-1.5 truncate">
                        {doctor.hospital}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="px-5 pb-4">
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {doctor.bio}
                  </p>
                </div>

                {/* Stats */}
                <div className="px-5 pb-4 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {doctor.rating} ({doctor.reviewCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {doctor.consultationsAnswered.toLocaleString("ar")} استشارة
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {doctor.yearsExperience} سنوات
                  </span>
                </div>

                {/* CTA */}
                <div className="px-5 pb-5 mt-auto grid grid-cols-2 gap-2 border-t border-slate-50 pt-4">
                  <Link to={`/doctors/${doctor.id}`}>
                    <Button
                      variant="outline"
                      className="w-full justify-center"
                      size="sm"
                    >
                      عرض الملف
                    </Button>
                  </Link>
                  <Link
                    to={`/consultations/new?specialty=${doctor.specialtyId}`}
                  >
                    <Button className="w-full justify-center" size="sm">
                      ابدأ استشارة
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Become a doctor CTA */}
        <div className="mt-12 rounded-3xl bg-primary-700 px-6 py-8 sm:p-10 text-center text-white shadow-[0_16px_50px_rgba(11,74,95,.22)]">
          <h3 className="text-xl font-black text-white mb-2">أنت طبيب مرخص؟</h3>
          <p className="text-sm text-primary-100 mb-6 max-w-md mx-auto leading-7">
            انضم إلى شبكة أطبائنا وساهم في تعزيز الوعي الصحي في المنطقة. التحقق
            مجاني وبسيط.
          </p>
          <Link to="/auth/signup?role=doctor">
            <Button className="bg-white text-primary-700 hover:bg-primary-50 shadow-lg gap-2">
              <Shield className="w-4 h-4" />
              انضم كطبيب معتمد
            </Button>
          </Link>
        </div>
      </div>
      {/* close inner max-w div */}
    </div>
  )
}
